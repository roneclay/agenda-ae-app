'use server'

import { and, eq, ne } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { appointment, customer, db, professional, user } from '@/lib/db'
import { sendVagaLiberada } from '@/lib/email/send'

export async function confirmAppointment(appointmentId: string) {
  await db
    .update(appointment)
    .set({ status: 'confirmed' })
    .where(and(eq(appointment.id, appointmentId), eq(appointment.status, 'scheduled')))

  revalidatePath(`/confirmar/${appointmentId}`)
}

async function cancelAndNotify(appointmentId: string) {
  const [row] = await db
    .select({
      proEmail: user.email,
      proName: professional.name,
      customerName: customer.name,
      scheduledAt: appointment.scheduledAt,
      status: appointment.status,
    })
    .from(appointment)
    .innerJoin(professional, eq(professional.id, appointment.professionalId))
    .innerJoin(user, eq(user.id, professional.userId))
    .innerJoin(customer, eq(customer.id, appointment.customerId))
    .where(eq(appointment.id, appointmentId))
    .limit(1)

  if (!row || row.status === 'cancelled') return

  await db
    .update(appointment)
    .set({ status: 'cancelled' })
    .where(and(eq(appointment.id, appointmentId), ne(appointment.status, 'cancelled')))

  const friendlyDate = row.scheduledAt.toLocaleString('pt-BR', {
    timeZone: 'America/Sao_Paulo',
    dateStyle: 'short',
    timeStyle: 'short',
  })

  await sendVagaLiberada({
    to: row.proEmail,
    professionalName: row.proName,
    customerName: row.customerName ?? 'Cliente',
    scheduledAt: friendlyDate,
  })
}

export async function cancelAppointment(appointmentId: string) {
  await cancelAndNotify(appointmentId)
  revalidatePath(`/confirmar/${appointmentId}`)
}

export async function rescheduleAppointment(appointmentId: string, professionalSlug: string) {
  await cancelAndNotify(appointmentId)
  redirect(`/agendar/${professionalSlug}`)
}
