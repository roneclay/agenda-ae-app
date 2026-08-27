import { and, between, eq, ne } from 'drizzle-orm'
import { appointment, customer, db, notificationLog, professional, user } from '@/lib/db'
import { sendLembreteCliente, sendVagaLiberada } from '@/lib/email/send'
import { sendWhatsApp } from '@/lib/whatsapp/send'

type WindowKind = 'reminder_24h' | 'reminder_6h' | 'reminder_2h'

const WINDOWS: Record<WindowKind, { hours: number; toleranceMin: number }> = {
  reminder_24h: { hours: 24, toleranceMin: 30 },
  reminder_6h: { hours: 6, toleranceMin: 20 },
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
      status: appointment.status,
      proId: professional.id,
      proName: professional.name,
      proEmail: user.email,
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
    .innerJoin(user, eq(user.id, professional.userId))
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

    // Se pedimos confirmação às 6h e, na janela de 2h, ainda não confirmou — cancela e libera a vaga
    if (kind === 'reminder_2h' && c.status === 'scheduled') {
      const [wasAskedToConfirm] = await db
        .select({ id: notificationLog.id })
        .from(notificationLog)
        .where(
          and(eq(notificationLog.appointmentId, c.apptId), eq(notificationLog.type, 'reminder_6h')),
        )
        .limit(1)

      if (wasAskedToConfirm) {
        await db
          .update(appointment)
          .set({ status: 'cancelled' })
          .where(eq(appointment.id, c.apptId))
        await sendVagaLiberada({
          to: c.proEmail,
          professionalName: c.proName,
          customerName: c.customerName ?? 'Cliente',
          scheduledAt: friendlyDate,
        })
        await db.insert(notificationLog).values({
          professionalId: c.proId,
          customerId: c.customerId,
          appointmentId: c.apptId,
          type: kind,
          channel: 'email',
        })
        sent++
        continue
      }
    }

    const confirmUrl = `${process.env.NEXT_PUBLIC_APP_URL}/confirmar/${c.apptId}`
    const body =
      kind === 'reminder_24h'
        ? `Oi ${c.customerName ?? ''}! Lembrete: você tem horário com ${c.proName} amanhã às ${friendlyDate}. Confirma? 😊`
        : kind === 'reminder_6h'
          ? `Oi ${c.customerName ?? ''}! Seu horário com ${c.proName} é em 6h (${friendlyDate}). Confirma sua presença aqui: ${confirmUrl} — se não confirmar até 2h antes, o horário libera automaticamente. 🙏`
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
        manageUrl: confirmUrl,
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
