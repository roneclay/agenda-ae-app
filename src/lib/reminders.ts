import { and, between, eq, ne } from 'drizzle-orm'
import { appointment, customer, db, notificationLog, professional } from '@/lib/db'
import { sendLembreteCliente } from '@/lib/email/send'
import { sendWhatsApp } from '@/lib/whatsapp/send'

type WindowKind = 'reminder_24h' | 'reminder_2h'

const WINDOWS: Record<WindowKind, { hours: number; toleranceMin: number }> = {
  reminder_24h: { hours: 24, toleranceMin: 30 },
  reminder_2h: { hours: 2, toleranceMin: 15 },
}

export async function dispatchReminders(kind: WindowKind, now = new Date()) {
  const { hours, toleranceMin } = WINDOWS[kind]
  const target = new Date(now.getTime() + hours * 3600_000)
  const lo = new Date(target.getTime() - toleranceMin * 60_000)
  const hi = new Date(target.getTime() + toleranceMin * 60_000)

  const candidates = await db
    .select({
      apptId: appointment.id,
      proId: professional.id,
      proName: professional.name,
      proPhoneNumberId: professional.whatsappPhoneNumberId,
      proAccessToken: professional.whatsappAccessToken,
      scheduledAt: appointment.scheduledAt,
      durationMinutes: appointment.durationMinutes,
      customerId: customer.id,
      customerName: customer.name,
      customerWhatsapp: customer.whatsappId,
      customerEmail: customer.email,
    })
    .from(appointment)
    .innerJoin(professional, eq(professional.id, appointment.professionalId))
    .innerJoin(customer, eq(customer.id, appointment.customerId))
    .where(and(between(appointment.scheduledAt, lo, hi), ne(appointment.status, 'cancelled')))

  let sent = 0
  for (const c of candidates) {
    const [already] = await db
      .select({ id: notificationLog.id })
      .from(notificationLog)
      .where(and(eq(notificationLog.appointmentId, c.apptId), eq(notificationLog.type, kind)))
      .limit(1)
    if (already) continue

    const friendlyDate = c.scheduledAt.toLocaleString('pt-BR', {
      timeZone: 'America/Sao_Paulo',
      dateStyle: 'short',
      timeStyle: 'short',
    })

    const body =
      kind === 'reminder_24h'
        ? `Oi ${c.customerName ?? ''}! Lembrete: você tem horário com ${c.proName} amanhã às ${friendlyDate}. Confirma? 😊`
        : `Oi ${c.customerName ?? ''}! Em 2h você tem horário com ${c.proName} (${friendlyDate}). Até já! ⏰`

    await sendWhatsApp({
      phoneNumberId: c.proPhoneNumberId,
      accessToken: c.proAccessToken,
      to: c.customerWhatsapp.replace(/^\+/, ''),
      message: body,
    })

    if (c.customerEmail) {
      await sendLembreteCliente({
        to: c.customerEmail,
        customerName: c.customerName ?? 'Cliente',
        professionalName: c.proName,
        service: '',
        scheduledAt: friendlyDate,
      })
    }

    await db.insert(notificationLog).values({
      professionalId: c.proId,
      customerId: c.customerId,
      appointmentId: c.apptId,
      type: kind,
      channel: 'whatsapp',
    })
    sent++
  }

  return { kind, sent, candidates: candidates.length }
}
