import { and, desc, eq, gte, inArray } from 'drizzle-orm'
import { computeSlots } from '@/lib/availability'
import { appointment, appointmentService, customer, db, type professional, service } from '@/lib/db'

type Pro = typeof professional.$inferSelect
type Customer = typeof customer.$inferSelect

export type ToolContext = { pro: Pro; customer: Customer }
export type ToolResult = { ok: boolean; data?: unknown; error?: string }

function formatBRL(cents: number) {
  return (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

export async function executeTool(
  ctx: ToolContext,
  name: string,
  input: Record<string, unknown>,
): Promise<ToolResult> {
  try {
    switch (name) {
      case 'list_services': {
        const services = await db
          .select()
          .from(service)
          .where(and(eq(service.professionalId, ctx.pro.id), eq(service.isActive, true)))
        return {
          ok: true,
          data: services.map((s) => ({
            id: s.id,
            name: s.name,
            description: s.description,
            price: formatBRL(s.priceCents),
            duration_minutes: s.durationMinutes,
          })),
        }
      }

      case 'check_availability': {
        const serviceIds = (input.service_ids as string[]) ?? []
        const date = input.date as string

        const services = await db.select().from(service).where(inArray(service.id, serviceIds))
        const filtered = services.filter((s) => s.professionalId === ctx.pro.id)
        if (filtered.length !== serviceIds.length) {
          return { ok: false, error: 'Algum serviço informado não pertence a este profissional.' }
        }

        const totalDurationMin = filtered.reduce((acc, s) => acc + s.durationMinutes, 0)
        const slots = await computeSlots({ pro: ctx.pro, date, totalDurationMin })

        return {
          ok: true,
          data: {
            total_duration_minutes: totalDurationMin,
            available: slots.filter((s) => s.status === 'available').map((s) => s.startsAt),
            partial: slots
              .filter((s) => s.status === 'partial')
              .map((s) => ({ startsAt: s.startsAt, fittingMin: s.fittingDurationMin })),
          },
        }
      }

      case 'book_appointment': {
        const serviceIds = (input.service_ids as string[]) ?? []
        const scheduledAt = input.scheduled_at as string

        const services = await db.select().from(service).where(inArray(service.id, serviceIds))
        const filtered = services.filter((s) => s.professionalId === ctx.pro.id)
        if (filtered.length !== serviceIds.length) {
          return { ok: false, error: 'Serviço inválido.' }
        }

        const totalDurationMin = filtered.reduce((acc, s) => acc + s.durationMinutes, 0)
        const totalCents = filtered.reduce((acc, s) => acc + s.priceCents, 0)

        const [appt] = await db
          .insert(appointment)
          .values({
            professionalId: ctx.pro.id,
            customerId: ctx.customer.id,
            scheduledAt: new Date(scheduledAt),
            durationMinutes: totalDurationMin,
            totalCents,
          })
          .returning({ id: appointment.id })

        await db.insert(appointmentService).values(
          filtered.map((s) => ({
            appointmentId: appt.id,
            serviceId: s.id,
            priceCents: s.priceCents,
            durationMinutes: s.durationMinutes,
          })),
        )

        if (input.customer_name && !ctx.customer.name) {
          await db
            .update(customer)
            .set({ name: String(input.customer_name) })
            .where(eq(customer.id, ctx.customer.id))
        }

        return {
          ok: true,
          data: {
            appointment_id: appt.id,
            scheduled_at: scheduledAt,
            duration_minutes: totalDurationMin,
            total: formatBRL(totalCents),
          },
        }
      }

      case 'list_my_appointments': {
        const now = new Date()
        const rows = await db
          .select()
          .from(appointment)
          .where(
            and(
              eq(appointment.professionalId, ctx.pro.id),
              eq(appointment.customerId, ctx.customer.id),
              gte(appointment.scheduledAt, now),
            ),
          )
          .orderBy(desc(appointment.scheduledAt))
          .limit(10)
        return {
          ok: true,
          data: rows.map((r) => ({
            id: r.id,
            scheduled_at: r.scheduledAt.toISOString(),
            status: r.status,
            total: formatBRL(r.totalCents),
          })),
        }
      }

      case 'cancel_appointment': {
        const id = input.appointment_id as string
        await db
          .update(appointment)
          .set({ status: 'cancelled' })
          .where(
            and(
              eq(appointment.id, id),
              eq(appointment.professionalId, ctx.pro.id),
              eq(appointment.customerId, ctx.customer.id),
            ),
          )
        return { ok: true, data: { cancelled: true } }
      }

      default:
        return { ok: false, error: `Tool desconhecida: ${name}` }
    }
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'Erro' }
  }
}
