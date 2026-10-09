import { and, eq } from 'drizzle-orm'
import { cache } from 'react'
import { db, professional, service, weeklyScheduleWindow } from '@/lib/db'
import { isBillingBlocked } from '@/lib/subscription'

/**
 * Everything the public booking page needs about a professional. Cached per request so the
 * page and its generateMetadata share a single set of queries.
 */
export const getPublicProfessional = cache(async (slug: string) => {
  const [pro] = await db.select().from(professional).where(eq(professional.slug, slug)).limit(1)
  if (!pro) return null

  const billingBlocked = isBillingBlocked(pro)
  if (billingBlocked) return { pro, billingBlocked, services: [], ready: false }

  const services = await db
    .select()
    .from(service)
    .where(and(eq(service.professionalId, pro.id), eq(service.isActive, true)))

  const [anyWindow] = await db
    .select({ id: weeklyScheduleWindow.id })
    .from(weeklyScheduleWindow)
    .where(eq(weeklyScheduleWindow.professionalId, pro.id))
    .limit(1)

  const ready = pro.isAcceptingBookings && !!anyWindow && services.length > 0
  return { pro, billingBlocked, services, ready }
})
