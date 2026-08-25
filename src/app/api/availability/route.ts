import { eq, inArray } from 'drizzle-orm'
import { type NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { computeSlots } from '@/lib/availability'
import { addDays, todayInBRT } from '@/lib/dates'
import { db, professional, service } from '@/lib/db'

const QuerySchema = z.object({
  slug: z.string().min(1),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  serviceIds: z.array(z.string().uuid()).min(1),
})

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const parsed = QuerySchema.safeParse({
    slug: searchParams.get('slug'),
    date: searchParams.get('date'),
    serviceIds: searchParams.getAll('serviceId'),
  })

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const { slug, date, serviceIds } = parsed.data

  const today = todayInBRT()
  const horizon = addDays(today, 6)
  if (date < today || date > horizon) {
    return NextResponse.json({ slots: [], totalDurationMin: 0 })
  }

  const [pro] = await db.select().from(professional).where(eq(professional.slug, slug)).limit(1)

  if (!pro) return NextResponse.json({ error: 'Profissional não encontrado' }, { status: 404 })
  if (!pro.isAcceptingBookings)
    return NextResponse.json({ error: 'Não está aceitando agendamentos' }, { status: 403 })

  const services = await db.select().from(service).where(inArray(service.id, serviceIds))

  const filtered = services.filter((s) => s.professionalId === pro.id)
  if (filtered.length !== serviceIds.length) {
    return NextResponse.json({ error: 'Serviço inválido' }, { status: 400 })
  }

  const totalDurationMin = filtered.reduce((acc, s) => acc + s.durationMinutes, 0)
  const slots = await computeSlots({ pro, date, totalDurationMin })

  return NextResponse.json({ slots, totalDurationMin })
}
