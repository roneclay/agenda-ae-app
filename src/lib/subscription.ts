import { eq } from 'drizzle-orm'
import { getProPriceCents } from '@/lib/config/settings'
import { db, professional, user } from '@/lib/db'
import { sendAssinaturaAtiva, sendPagamentoConfirmado } from '@/lib/email/send'

function formatBRL(cents: number) {
  return (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

export async function activatePro(professionalId: string) {
  const trialEndsAt = new Date()
  trialEndsAt.setDate(trialEndsAt.getDate() + 30)

  await db
    .update(professional)
    .set({ plan: 'pro', subscriptionStatus: 'active', trialEndsAt })
    .where(eq(professional.id, professionalId))

  const [pro] = await db
    .select({
      name: professional.name,
      userEmail: user.email,
      userName: user.name,
    })
    .from(professional)
    .innerJoin(user, eq(user.id, professional.userId))
    .where(eq(professional.id, professionalId))
    .limit(1)

  if (pro) {
    const month = new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
    await sendAssinaturaAtiva({ to: pro.userEmail, name: pro.userName })
    await sendPagamentoConfirmado({
      to: pro.userEmail,
      name: pro.userName,
      amount: formatBRL(await getProPriceCents()),
      month,
    })
  }
}
