'use server'

import { and, eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { appointment, db } from '@/lib/db'

export async function confirmAppointment(appointmentId: string) {
  await db
    .update(appointment)
    .set({ status: 'confirmed' })
    .where(and(eq(appointment.id, appointmentId), eq(appointment.status, 'scheduled')))

  revalidatePath(`/confirmar/${appointmentId}`)
}
