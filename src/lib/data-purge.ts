import { and, eq, inArray, isNotNull, lte, ne } from 'drizzle-orm'
import { appointment, db, notificationLog, professional, user } from '@/lib/db'
import { sendAvisoExclusaoDados } from '@/lib/email/send'

const PURGE_AFTER_DAYS = 90
const WARNING_BEFORE_DAYS = 7
const DAY_MS = 24 * 3600_000

function daysAgo(from: Date, days: number) {
  return new Date(from.getTime() - days * DAY_MS)
}

async function alreadyLogged(
  professionalId: string,
  type: 'data_purge_warning' | 'data_purge_completed',
) {
  const [row] = await db
    .select({ id: notificationLog.id })
    .from(notificationLog)
    .where(and(eq(notificationLog.professionalId, professionalId), eq(notificationLog.type, type)))
    .limit(1)
  return !!row
}

export async function dispatchDataPurgeWarnings(now = new Date()) {
  const warnFrom = daysAgo(now, PURGE_AFTER_DAYS - WARNING_BEFORE_DAYS)

  const candidates = await db
    .select({
      proId: professional.id,
      trialEndsAt: professional.trialEndsAt,
      userEmail: user.email,
      userName: user.name,
    })
    .from(professional)
    .innerJoin(user, eq(user.id, professional.userId))
    .where(
      and(
        ne(professional.subscriptionStatus, 'active'),
        isNotNull(professional.trialEndsAt),
        lte(professional.trialEndsAt, warnFrom),
      ),
    )

  let sent = 0
  for (const c of candidates) {
    if (!c.trialEndsAt) continue
    if (await alreadyLogged(c.proId, 'data_purge_warning')) continue

    const daysSinceExpiry = Math.floor((now.getTime() - c.trialEndsAt.getTime()) / DAY_MS)
    const daysLeft = Math.max(PURGE_AFTER_DAYS - daysSinceExpiry, 0)

    await sendAvisoExclusaoDados({ to: c.userEmail, name: c.userName, daysLeft })
    await db.insert(notificationLog).values({
      professionalId: c.proId,
      type: 'data_purge_warning',
      channel: 'email',
    })
    sent++
  }

  return { sent, candidates: candidates.length }
}

export async function dispatchDataPurge(now = new Date()) {
  const cutoff = daysAgo(now, PURGE_AFTER_DAYS)

  const candidates = await db
    .select({ proId: professional.id })
    .from(professional)
    .where(
      and(
        ne(professional.subscriptionStatus, 'active'),
        isNotNull(professional.trialEndsAt),
        lte(professional.trialEndsAt, cutoff),
      ),
    )

  let purged = 0
  for (const c of candidates) {
    if (await alreadyLogged(c.proId, 'data_purge_completed')) continue

    const appts = await db
      .select({ id: appointment.id })
      .from(appointment)
      .where(eq(appointment.professionalId, c.proId))
    const apptIds = appts.map((a) => a.id)

    if (apptIds.length > 0) {
      await db.delete(notificationLog).where(inArray(notificationLog.appointmentId, apptIds))
      await db.delete(appointment).where(inArray(appointment.id, apptIds))
    }

    await db.insert(notificationLog).values({
      professionalId: c.proId,
      type: 'data_purge_completed',
      channel: 'email',
    })
    purged++
  }

  return { purged, candidates: candidates.length }
}
