'use server'

import { and, eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { getCurrentProfessional } from '@/lib/auth/session'
import { todayInBRT } from '@/lib/dates'
import { dateOverride, dateOverrideWindow, db, weeklyScheduleWindow } from '@/lib/db'

const TIME = z.string().regex(/^\d{2}:\d{2}$/, 'Formato HH:MM')
const ISO_DATE = z.string().regex(/^\d{4}-\d{2}-\d{2}$/)

const TemplateSchema = z.object({
  windows: z.array(
    z.object({
      dayKey: z.enum(['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN']),
      startTime: TIME,
      endTime: TIME,
    }),
  ),
})

export type TemplateState = { error?: string; ok?: boolean }

export async function saveTemplate(
  _prev: TemplateState,
  formData: FormData,
): Promise<TemplateState> {
  const pro = await getCurrentProfessional()
  if (!pro) return { error: 'Sem permissão' }

  let payload: unknown
  try {
    payload = JSON.parse(String(formData.get('payload') ?? ''))
  } catch {
    return { error: 'Payload inválido' }
  }

  const parsed = TemplateSchema.safeParse(payload)
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Dados inválidos' }

  for (const w of parsed.data.windows) {
    if (w.startTime >= w.endTime) return { error: `Horário inválido em ${w.dayKey}` }
  }

  const byDay = new Map<string, Array<{ start: string; end: string }>>()
  for (const w of parsed.data.windows) {
    const arr = byDay.get(w.dayKey) ?? []
    arr.push({ start: w.startTime, end: w.endTime })
    byDay.set(w.dayKey, arr)
  }
  for (const [day, arr] of byDay) {
    arr.sort((a, b) => a.start.localeCompare(b.start))
    for (let i = 1; i < arr.length; i++) {
      if (arr[i].start < arr[i - 1].end) return { error: `Janelas se sobrepõem em ${day}` }
    }
  }

  await db.transaction(async (tx) => {
    await tx.delete(weeklyScheduleWindow).where(eq(weeklyScheduleWindow.professionalId, pro.id))
    if (parsed.data.windows.length > 0) {
      await tx.insert(weeklyScheduleWindow).values(
        parsed.data.windows.map((w) => ({
          professionalId: pro.id,
          dayKey: w.dayKey,
          startTime: w.startTime,
          endTime: w.endTime,
        })),
      )
    }
  })

  revalidatePath('/dashboard/horarios')
  return { ok: true }
}

const OverrideSchema = z.object({
  date: ISO_DATE,
  isOpen: z.boolean(),
  windows: z.array(z.object({ startTime: TIME, endTime: TIME })),
})

export type OverrideState = { error?: string; ok?: boolean }

export async function saveOverride(
  _prev: OverrideState,
  formData: FormData,
): Promise<OverrideState> {
  const pro = await getCurrentProfessional()
  if (!pro) return { error: 'Sem permissão' }

  let payload: unknown
  try {
    payload = JSON.parse(String(formData.get('payload') ?? ''))
  } catch {
    return { error: 'Payload inválido' }
  }

  const parsed = OverrideSchema.safeParse(payload)
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Dados inválidos' }

  const today = todayInBRT()
  if (parsed.data.date < today) return { error: 'Não é possível alterar datas passadas' }

  for (const w of parsed.data.windows) {
    if (w.startTime >= w.endTime) return { error: 'Janela inválida (fim deve ser após início)' }
  }
  const sorted = [...parsed.data.windows].sort((a, b) => a.startTime.localeCompare(b.startTime))
  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i].startTime < sorted[i - 1].endTime) return { error: 'Janelas se sobrepõem' }
  }

  await db.transaction(async (tx) => {
    const [existing] = await tx
      .select({ id: dateOverride.id })
      .from(dateOverride)
      .where(and(eq(dateOverride.professionalId, pro.id), eq(dateOverride.date, parsed.data.date)))
      .limit(1)

    if (existing) await tx.delete(dateOverride).where(eq(dateOverride.id, existing.id))

    const [created] = await tx
      .insert(dateOverride)
      .values({
        professionalId: pro.id,
        date: parsed.data.date,
        isOpen: parsed.data.isOpen,
      })
      .returning({ id: dateOverride.id })

    if (parsed.data.isOpen && parsed.data.windows.length > 0 && created) {
      await tx.insert(dateOverrideWindow).values(
        parsed.data.windows.map((w) => ({
          dateOverrideId: created.id,
          startTime: w.startTime,
          endTime: w.endTime,
        })),
      )
    }
  })

  revalidatePath('/dashboard/horarios')
  return { ok: true }
}

export async function clearOverride(date: string) {
  const pro = await getCurrentProfessional()
  if (!pro) return
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return
  if (date < todayInBRT()) return

  await db
    .delete(dateOverride)
    .where(and(eq(dateOverride.professionalId, pro.id), eq(dateOverride.date, date)))
  revalidatePath('/dashboard/horarios')
}
