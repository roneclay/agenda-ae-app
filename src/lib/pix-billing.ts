import { and, eq, isNotNull, lte } from 'drizzle-orm'
import { PRO_PRICE_CENTS } from '@/lib/config/niches'
import { db, professional, user } from '@/lib/db'
import { sendPagamentoFalhou } from '@/lib/email/send'
import { createPixPayment, getPayment } from '@/lib/mercadopago'
import { activatePro } from '@/lib/subscription'

const GRACE_DAYS = 3

/**
 * Pix não recobra sozinho como cartão — esse cron gera uma cobrança nova a
 * cada ciclo mensal pra quem escolheu pagar por Pix. Reaproveita trialEndsAt
 * como "pago até" (mesmo campo que activatePro() estende a cada pagamento).
 */
export async function dispatchPixBilling(now = new Date()) {
  const due = await db
    .select({
      id: professional.id,
      name: professional.name,
      userEmail: user.email,
      trialEndsAt: professional.trialEndsAt,
      pixChargeId: professional.pixChargeId,
      subscriptionStatus: professional.subscriptionStatus,
    })
    .from(professional)
    .innerJoin(user, eq(user.id, professional.userId))
    .where(
      and(
        eq(professional.billingMethod, 'pix'),
        eq(professional.plan, 'pro'),
        isNotNull(professional.trialEndsAt),
        lte(professional.trialEndsAt, now),
      ),
    )

  let charged = 0

  for (const pro of due) {
    if (pro.pixChargeId) {
      const payment = await getPayment(pro.pixChargeId)
      if (payment.status === 'approved') {
        await activatePro(pro.id)
        await db.update(professional).set({ pixChargeId: null }).where(eq(professional.id, pro.id))
        continue
      }
      if (payment.status === 'pending' || payment.status === 'in_process') continue
      // rejeitada/cancelada/expirada — segue pro fluxo abaixo e gera uma nova
    }

    const { id } = await createPixPayment({
      professionalId: pro.id,
      payerEmail: pro.userEmail,
      priceCents: PRO_PRICE_CENTS,
      description: 'Agendadinho Pro — Plano Mensal',
    })
    await db.update(professional).set({ pixChargeId: id }).where(eq(professional.id, pro.id))
    charged++

    if (!pro.trialEndsAt) continue
    const overdueDays = Math.floor((now.getTime() - pro.trialEndsAt.getTime()) / 86_400_000)
    if (overdueDays > GRACE_DAYS && pro.subscriptionStatus === 'active') {
      await db
        .update(professional)
        .set({ subscriptionStatus: 'past_due' })
        .where(eq(professional.id, pro.id))
      await sendPagamentoFalhou({ to: pro.userEmail, name: pro.name })
    }
  }

  return charged
}
