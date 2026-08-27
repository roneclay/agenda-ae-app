'use server'

import { eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { getTranslations } from 'next-intl/server'
import { z } from 'zod'
import { getCurrentProfessional } from '@/lib/auth/session'
import { db, professional } from '@/lib/db'
import { normalizePhone } from '@/lib/phone'

const Schema = z.object({
  name: z.string().trim().min(2),
  bio: z.string().trim().max(500).optional(),
  phone: z.string().trim().optional(),
  address: z.string().trim().optional(),
})

export type ConfigState = { error?: string; ok?: boolean }

export async function updateProfile(_prev: ConfigState, formData: FormData): Promise<ConfigState> {
  const pro = await getCurrentProfessional()
  if (!pro) return { error: 'Sem permissão' }

  const parsed = Schema.safeParse({
    name: formData.get('name'),
    bio: formData.get('bio') || undefined,
    phone: formData.get('phone') || undefined,
    address: formData.get('address') || undefined,
  })
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Dados inválidos' }

  if (parsed.data.phone) {
    const normalizedPhone = normalizePhone(parsed.data.phone)
    const others = await db
      .select({ id: professional.id, phone: professional.phone })
      .from(professional)

    const phoneConflict = others.some(
      (o) => o.id !== pro.id && o.phone && normalizePhone(o.phone) === normalizedPhone,
    )
    if (phoneConflict) {
      const t = await getTranslations('onboarding')
      return { error: t('phoneTaken') }
    }
  }

  await db
    .update(professional)
    .set({
      name: parsed.data.name,
      bio: parsed.data.bio,
      phone: parsed.data.phone,
      address: parsed.data.address,
      updatedAt: new Date(),
    })
    .where(eq(professional.id, pro.id))

  revalidatePath('/dashboard/configuracoes')
  revalidatePath('/dashboard')
  return { ok: true }
}

export async function toggleAcceptingBookings() {
  const pro = await getCurrentProfessional()
  if (!pro) return
  await db
    .update(professional)
    .set({ isAcceptingBookings: !pro.isAcceptingBookings })
    .where(eq(professional.id, pro.id))
  revalidatePath('/dashboard/configuracoes')
  revalidatePath('/dashboard')
}
