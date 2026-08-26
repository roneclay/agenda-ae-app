import { and, eq, isNotNull, lte } from 'drizzle-orm'
import { db, notificationLog, professional, user } from '@/lib/db'
import { sendTrialExpirado, sendTrialExpirando } from '@/lib/email/send'

export async function dispatchTrialNotifications(now = new Date()) {
  const in3days = new Date(now.getTime() + 3 * 24 * 3600_000)

  const candidates = await db
    .select({
      proId: professional.id,
      proName: professional.name,
      trialEndsAt: professional.trialEndsAt,
      userEmail: user.email,
      userName: user.name,
    })
    .from(professional)
    .innerJoin(user, eq(user.id, professional.userId))
    .where(
      and(
        eq(professional.subscriptionStatus, 'trial'),
        isNotNull(professional.trialEndsAt),
        lte(professional.trialEndsAt, in3days),
      ),
    )

  let sent = 0

  for (const c of candidates) {
    if (!c.trialEndsAt) continue

    const isExpired = c.trialEndsAt <= now
    const kind = isExpired ? 'trial_expired' : 'trial_expiring'

    const [already] = await db
      .select({ id: notificationLog.id })
      .from(notificationLog)
      .where(and(eq(notificationLog.professionalId, c.proId), eq(notificationLog.type, kind)))
      .limit(1)

    if (already) continue

    const daysLeft = Math.ceil((c.trialEndsAt.getTime() - now.getTime()) / 86400_000)

    if (isExpired) {
      await sendTrialExpirado({ to: c.userEmail, name: c.userName })
    } else {
      await sendTrialExpirando({ to: c.userEmail, name: c.userName, daysLeft })
    }

    await db.insert(notificationLog).values({
      professionalId: c.proId,
      type: kind,
      channel: 'email',
    })

    sent++
  }

  return { sent, candidates: candidates.length }
}
