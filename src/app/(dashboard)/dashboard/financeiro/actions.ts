'use server'

import { eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { getCurrentProfessional, getSession } from '@/lib/auth/session'
import { NICHES } from '@/lib/config/niches'
import { getProPriceCents } from '@/lib/config/settings'
import { db, professional } from '@/lib/db'
import { sendCancelamento } from '@/lib/email/send'
import {
  cancelSubscription as cancelMercadoPagoSubscription,
  createPixPayment,
  createSubscription,
  getPayment,
} from '@/lib/mercadopago'
import { activatePro } from '@/lib/subscription'

const MOCK = process.env.PAYMENT_MOCK === 'true'

export async function createCheckout(): Promise<{ url?: string; error?: string }> {
  const pro = await getCurrentProfessional()
  const session = await getSession()
  if (!pro || !session) return { error: 'Não autenticado' }

  if (MOCK) {
    await activatePro(pro.id)
    revalidatePath('/dashboard/financeiro')
    return { url: '/dashboard/financeiro' }
  }

  try {
    const niche = NICHES[pro.niche]
    const { id, initPoint } = await createSubscription({
      professionalId: pro.id,
      payerEmail: session.user.email,
      priceCents: await getProPriceCents(),
      brandName: niche.brandName,
    })
    await db
      .update(professional)
      .set({ mercadopagoPreapprovalId: id, billingMethod: 'card' })
      .where(eq(professional.id, pro.id))
    return { url: initPoint }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erro ao criar checkout'
    return { error: message }
  }
}

export async function createPixCheckout(): Promise<{
  qrCode?: string
  qrCodeBase64?: string
  error?: string
}> {
  const pro = await getCurrentProfessional()
  const session = await getSession()
  if (!pro || !session) return { error: 'Não autenticado' }

  if (MOCK) {
    await activatePro(pro.id)
    revalidatePath('/dashboard/financeiro')
    return { qrCode: 'PIX-MOCK-COPIA-E-COLA' }
  }

  try {
    const { id, qrCode, qrCodeBase64 } = await createPixPayment({
      professionalId: pro.id,
      payerEmail: session.user.email,
      priceCents: await getProPriceCents(),
      description: 'Agendadinho Pro — Plano Mensal',
    })
    await db
      .update(professional)
      .set({ billingMethod: 'pix', pixChargeId: id })
      .where(eq(professional.id, pro.id))
    revalidatePath('/dashboard/financeiro')
    return { qrCode, qrCodeBase64 }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erro ao gerar cobrança Pix'
    return { error: message }
  }
}

export async function checkPixPayment(): Promise<{ paid: boolean }> {
  const pro = await getCurrentProfessional()
  if (!pro?.pixChargeId) return { paid: false }

  if (MOCK) {
    await activatePro(pro.id)
    revalidatePath('/dashboard/financeiro')
    return { paid: true }
  }

  const payment = await getPayment(pro.pixChargeId)
  if (payment.status !== 'approved') return { paid: false }

  await activatePro(pro.id)
  await db.update(professional).set({ pixChargeId: null }).where(eq(professional.id, pro.id))
  revalidatePath('/dashboard/financeiro')
  return { paid: true }
}

export async function cancelSubscription() {
  const pro = await getCurrentProfessional()
  const session = await getSession()
  if (!pro || !session) return

  if (pro.mercadopagoPreapprovalId && !MOCK) {
    await cancelMercadoPagoSubscription(pro.mercadopagoPreapprovalId)
  }

  await db
    .update(professional)
    .set({ subscriptionStatus: 'cancelled' })
    .where(eq(professional.id, pro.id))

  const endsAt = new Date()
  endsAt.setMonth(endsAt.getMonth() + 1)
  await sendCancelamento({
    to: session.user.email,
    name: session.user.name,
    endsAt: endsAt.toLocaleDateString('pt-BR'),
  })

  revalidatePath('/dashboard/financeiro')
}
