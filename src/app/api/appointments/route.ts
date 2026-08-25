import { eq, inArray } from 'drizzle-orm'
import { type NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { appointment, appointmentService, customer, db, professional, service, user } from '@/lib/db'
import { sendConfirmacaoCliente, sendNovoAgendamentoProfissional } from '@/lib/email/send'
import { addDays, todayInBRT } from '@/lib/dates'

const BodySchema = z.object({
  slug: z.string().min(1),
  serviceIds: z.array(z.string().uuid()).min(1),
  scheduledAt: z.string().datetime({ offset: true }),
  customer: z.object({
    name: z.string().trim().min(2),
    whatsappId: z.string().trim().min(8),
    email: z.email(),
  }),
  notes: z.string().optional(),
})

export async function POST(req: NextRequest) {
  const json = await req.json().catch(() => null)
  const parsed = BodySchema.safeParse(json)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const { slug, serviceIds, scheduledAt, customer: customerInput, notes } = parsed.data

  const [pro] = await db
    .select({ ...professional, userEmail: user.email })
    .from(professional)
    .innerJoin(user, eq(user.id, professional.userId))
    .where(eq(professional.slug, slug))
    .limit(1)

  if (!pro) return NextResponse.json({ error: 'Profissional não encontrado' }, { status: 404 })
  if (!pro.isAcceptingBookings)
    return NextResponse.json({ error: 'Não está aceitando agendamentos' }, { status: 403 })

  const dateOnly = scheduledAt.slice(0, 10)
  const today = todayInBRT()
  const horizon = addDays(today, 6)
  if (dateOnly < today || dateOnly > horizon) {
    return NextResponse.json(
      { error: 'Só é possível agendar dentro dos próximos 7 dias' },
      { status: 400 },
    )
  }

  const services = await db.select().from(service).where(inArray(service.id, serviceIds))
  if (services.length !== serviceIds.length || services.some((s) => s.professionalId !== pro.id)) {
    return NextResponse.json({ error: 'Serviço inválido' }, { status: 400 })
  }

  const totalDurationMin = services.reduce((acc, s) => acc + s.durationMinutes, 0)
  const totalCents = services.reduce((acc, s) => acc + s.priceCents, 0)

  // Upsert customer
  const [existing] = await db
    .select()
    .from(customer)
    .where(eq(customer.whatsappId, customerInput.whatsappId))
    .limit(1)

  let customerId: string
  if (existing && existing.professionalId === pro.id) {
    customerId = existing.id
  } else {
    const [created] = await db
      .insert(customer)
      .values({
        professionalId: pro.id,
        whatsappId: customerInput.whatsappId,
        name: customerInput.name,
        email: customerInput.email,
      })
      .returning({ id: customer.id })
    customerId = created.id
  }

  try {
    const [appt] = await db
      .insert(appointment)
      .values({
        professionalId: pro.id,
        customerId,
        scheduledAt: new Date(scheduledAt),
        durationMinutes: totalDurationMin,
        totalCents,
        notes,
      })
      .returning({ id: appointment.id })

    await db.insert(appointmentService).values(
      services.map((s) => ({
        appointmentId: appt.id,
        serviceId: s.id,
        priceCents: s.priceCents,
        durationMinutes: s.durationMinutes,
      })),
    )

    const friendlyDate = new Date(scheduledAt).toLocaleString('pt-BR', {
      timeZone: 'America/Sao_Paulo',
      dateStyle: 'short',
      timeStyle: 'short',
    })

    await sendNovoAgendamentoProfissional({
      to: pro.userEmail,
      professionalName: pro.name,
      customerName: customerInput.name,
      service: services.map((s) => s.name).join(', '),
      scheduledAt: friendlyDate,
    })

    await sendConfirmacaoCliente({
      to: customerInput.email,
      customerName: customerInput.name,
      professionalName: pro.name,
      service: services.map((s) => s.name).join(', '),
      scheduledAt: friendlyDate,
    })

    return NextResponse.json({ id: appt.id }, { status: 201 })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erro desconhecido'
    if (message.includes('unique') || message.includes('duplicate')) {
      return NextResponse.json(
        { error: 'Esse horário acabou de ser ocupado. Escolha outro.' },
        { status: 409 },
      )
    }
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
