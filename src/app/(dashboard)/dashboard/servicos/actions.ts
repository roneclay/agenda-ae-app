'use server'

import { and, eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { getCurrentProfessional } from '@/lib/auth/session'
import { db, service } from '@/lib/db'

const ServiceSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().trim().min(2, 'Nome muito curto'),
  description: z.string().trim().max(500).optional(),
  priceReais: z
    .string()
    .trim()
    .regex(/^\d+([.,]\d{1,2})?$/, 'Preço inválido (ex: 80,00)'),
  durationMinutes: z.coerce.number().int().min(5).max(600),
})

export type ActionState = { error?: string; ok?: boolean }

export async function upsertService(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const pro = await getCurrentProfessional()
  if (!pro) return { error: 'Sem permissão' }

  const parsed = ServiceSchema.safeParse({
    id: formData.get('id') || undefined,
    name: formData.get('name'),
    description: formData.get('description') || undefined,
    priceReais: formData.get('priceReais'),
    durationMinutes: formData.get('durationMinutes'),
  })
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Dados inválidos' }
  }

  const priceCents = Math.round(Number(parsed.data.priceReais.replace(',', '.')) * 100)

  if (parsed.data.id) {
    await db
      .update(service)
      .set({
        name: parsed.data.name,
        description: parsed.data.description,
        priceCents,
        durationMinutes: parsed.data.durationMinutes,
      })
      .where(and(eq(service.id, parsed.data.id), eq(service.professionalId, pro.id)))
  } else {
    await db.insert(service).values({
      professionalId: pro.id,
      name: parsed.data.name,
      description: parsed.data.description,
      priceCents,
      durationMinutes: parsed.data.durationMinutes,
    })
  }

  revalidatePath('/dashboard/servicos')
  return { ok: true }
}

export async function toggleService(id: string) {
  const pro = await getCurrentProfessional()
  if (!pro) return

  const [s] = await db
    .select()
    .from(service)
    .where(and(eq(service.id, id), eq(service.professionalId, pro.id)))
    .limit(1)
  if (!s) return

  await db.update(service).set({ isActive: !s.isActive }).where(eq(service.id, id))

  revalidatePath('/dashboard/servicos')
}

export async function deleteService(id: string) {
  const pro = await getCurrentProfessional()
  if (!pro) return

  await db.delete(service).where(and(eq(service.id, id), eq(service.professionalId, pro.id)))

  revalidatePath('/dashboard/servicos')
}
