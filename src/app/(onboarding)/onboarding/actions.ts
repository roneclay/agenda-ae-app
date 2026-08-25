'use server'

import { and, eq } from 'drizzle-orm'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import { getCurrentProfessional, requireSession } from '@/lib/auth/session'
import { db, professional, service, weeklyScheduleWindow } from '@/lib/db'
import { sendBoasVindas } from '@/lib/email/send'

const slugify = (input: string) =>
  input
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40)

const Step1Schema = z.object({
  name: z.string().trim().min(2, 'Nome muito curto'),
  slug: z
    .string()
    .trim()
    .min(3, 'Link muito curto')
    .regex(/^[a-z0-9-]+$/, 'Use apenas letras, números e hífens'),
  niche: z.enum(['beauty', 'legal', 'petcare', 'fitness']),
  phone: z
    .string()
    .trim()
    .min(10, 'WhatsApp obrigatório')
    .regex(/^\+?\d[\d\s-]{8,}$/, 'WhatsApp inválido'),
})

export type OnboardingState = {
  error?: string
  fieldErrors?: Partial<Record<'name' | 'slug' | 'niche' | 'phone', string>>
}

export async function saveBasics(
  _prev: OnboardingState,
  formData: FormData,
): Promise<OnboardingState> {
  const session = await requireSession()

  const parsed = Step1Schema.safeParse({
    name: formData.get('name'),
    slug: slugify(String(formData.get('slug') ?? '')),
    niche: formData.get('niche'),
    phone: formData.get('phone'),
  })

  if (!parsed.success) {
    const fieldErrors: OnboardingState['fieldErrors'] = {}
    for (const issue of parsed.error.issues) {
      const key = issue.path[0] as keyof NonNullable<OnboardingState['fieldErrors']>
      if (key) fieldErrors[key] = issue.message
    }
    return { fieldErrors }
  }

  const { name, slug, niche, phone } = parsed.data

  const [conflict] = await db
    .select({ id: professional.id, userId: professional.userId })
    .from(professional)
    .where(eq(professional.slug, slug))
    .limit(1)

  if (conflict && conflict.userId !== session.user.id) {
    return { fieldErrors: { slug: 'Este link já está em uso. Escolha outro.' } }
  }

  const trialEndsAt = new Date()
  trialEndsAt.setDate(trialEndsAt.getDate() + 14)

  const [existing] = await db
    .select({ id: professional.id })
    .from(professional)
    .where(eq(professional.userId, session.user.id))
    .limit(1)

  if (existing) {
    await db
      .update(professional)
      .set({ name, slug, niche, phone, updatedAt: new Date() })
      .where(eq(professional.id, existing.id))
  } else {
    await db.insert(professional).values({
      userId: session.user.id,
      name,
      slug,
      niche,
      phone,
      trialEndsAt,
      onboardingCompleted: false,
      isAcceptingBookings: false,
    })
    await sendBoasVindas({ to: session.user.email, name })
  }

  redirect('/onboarding')
}

const ServiceSchema = z.object({
  name: z.string().trim().min(2, 'Nome muito curto'),
  priceReais: z
    .string()
    .trim()
    .regex(/^\d+([.,]\d{1,2})?$/, 'Preço inválido (ex: 80,00)'),
  durationMinutes: z.coerce.number().int().min(5).max(600),
})

export type ServiceState = { error?: string }

export async function saveFirstService(
  _prev: ServiceState,
  formData: FormData,
): Promise<ServiceState> {
  const pro = await getCurrentProfessional()
  if (!pro) return { error: 'Conclua a etapa anterior antes' }

  const parsed = ServiceSchema.safeParse({
    name: formData.get('name'),
    priceReais: formData.get('priceReais'),
    durationMinutes: formData.get('durationMinutes'),
  })
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Dados inválidos' }

  const priceCents = Math.round(Number(parsed.data.priceReais.replace(',', '.')) * 100)

  await db.insert(service).values({
    professionalId: pro.id,
    name: parsed.data.name,
    priceCents,
    durationMinutes: parsed.data.durationMinutes,
  })

  redirect('/onboarding')
}

const TIME = z.string().regex(/^\d{2}:\d{2}$/, 'Formato HH:MM')

const WindowSchema = z
  .object({ startTime: TIME, endTime: TIME })
  .refine((w) => w.startTime < w.endTime, {
    message: 'Fim deve ser após o início',
  })

const ScheduleSchema = z.object({
  windows: z
    .array(
      z.object({
        dayKey: z.enum(['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN']),
        startTime: TIME,
        endTime: TIME,
      }),
    )
    .min(1, 'Adicione pelo menos uma janela em algum dia'),
})

export type ScheduleState = { error?: string }

export async function saveSchedule(
  _prev: ScheduleState,
  formData: FormData,
): Promise<ScheduleState> {
  const pro = await getCurrentProfessional()
  if (!pro) return { error: 'Conclua as etapas anteriores antes' }

  const [hasService] = await db
    .select({ id: service.id })
    .from(service)
    .where(and(eq(service.professionalId, pro.id), eq(service.isActive, true)))
    .limit(1)

  if (!hasService) return { error: 'Cadastre ao menos um serviço antes' }

  let payload: unknown
  try {
    payload = JSON.parse(String(formData.get('payload') ?? ''))
  } catch {
    return { error: 'Payload inválido' }
  }

  const parsed = ScheduleSchema.safeParse(payload)
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Dados inválidos' }

  for (const w of parsed.data.windows) {
    const inner = WindowSchema.safeParse({ startTime: w.startTime, endTime: w.endTime })
    if (!inner.success) return { error: `Janela inválida em ${w.dayKey}` }
  }

  const byDay = new Map<string, { start: number; end: number }[]>()
  for (const w of parsed.data.windows) {
    const arr = byDay.get(w.dayKey) ?? []
    const [sh, sm] = w.startTime.split(':').map(Number)
    const [eh, em] = w.endTime.split(':').map(Number)
    arr.push({ start: sh * 60 + sm, end: eh * 60 + em })
    byDay.set(w.dayKey, arr)
  }
  for (const [day, arr] of byDay) {
    arr.sort((a, b) => a.start - b.start)
    for (let i = 1; i < arr.length; i++) {
      if (arr[i].start < arr[i - 1].end) {
        return { error: `Janelas se sobrepõem em ${day}` }
      }
    }
  }

  await db.transaction(async (tx) => {
    await tx
      .delete(weeklyScheduleWindow)
      .where(eq(weeklyScheduleWindow.professionalId, pro.id))
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
    await tx
      .update(professional)
      .set({
        onboardingCompleted: true,
        isAcceptingBookings: true,
        updatedAt: new Date(),
      })
      .where(eq(professional.id, pro.id))
  })

  redirect('/dashboard')
}
