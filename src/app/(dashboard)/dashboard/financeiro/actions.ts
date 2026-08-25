'use server'

import { eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { getCurrentProfessional, getSession } from '@/lib/auth/session'
import { db, professional } from '@/lib/db'
import { sendAssinaturaAtiva, sendCancelamento, sendPagamentoConfirmado } from '@/lib/email/send'

const MOCK = process.env.PAYMENT_MOCK === 'true'

export async function activateProMock() {
  const pro = await getCurrentProfessional()
  const session = await getSession()
  if (!pro || !session) return
  if (!MOCK) throw new Error('Em produção, use o checkout AbacatePay/Stripe.')

  await db
    .update(professional)
    .set({ plan: 'pro', subscriptionStatus: 'active' })
    .where(eq(professional.id, pro.id))

  const month = new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
  await sendAssinaturaAtiva({ to: session.user.email, name: session.user.name })
  await sendPagamentoConfirmado({
    to: session.user.email,
    name: session.user.name,
    amount: 'R$ 49,00',
    month,
  })

  revalidatePath('/dashboard/financeiro')
  revalidatePath('/dashboard')
}

export async function cancelSubscriptionMock() {
  const pro = await getCurrentProfessional()
  const session = await getSession()
  if (!pro || !session) return

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
