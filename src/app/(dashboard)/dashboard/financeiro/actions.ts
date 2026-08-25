'use server'

import { eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { getCurrentProfessional, getSession } from '@/lib/auth/session'
import { db, professional } from '@/lib/db'
import { sendCancelamento } from '@/lib/email/send'
import { createPaymentPreference } from '@/lib/mercadopago'
import { activatePro } from '@/lib/subscription'

const MOCK = process.env.PAYMENT_MOCK === 'true'

export async function createCheckout(): Promise<{ url?: string; error?: string }> {
  const pro = await getCurrentProfessional()
  if (!pro) return { error: 'Não autenticado' }

  if (MOCK) {
    await activatePro(pro.id)
    revalidatePath('/dashboard/financeiro')
    return { url: '/dashboard/financeiro' }
  }

  try {
    const { initPoint } = await createPaymentPreference({
      professionalId: pro.id,
    })
    return { url: initPoint }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erro ao criar checkout'
    return { error: message }
  }
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
