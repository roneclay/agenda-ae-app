import { and, eq, exists } from 'drizzle-orm'
import type { MetadataRoute } from 'next'
import { db, professional, service, weeklyScheduleWindow } from '@/lib/db'
import { isBillingBlocked } from '@/lib/subscription'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Only indexable pages: /login and the private areas are noindex, so they stay out.
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${APP_URL}/`, changeFrequency: 'weekly', priority: 1 },
    { url: `${APP_URL}/cadastro`, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${APP_URL}/ajuda`, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${APP_URL}/termos`, changeFrequency: 'yearly', priority: 0.3 },
  ]

  // Same rule as the booking page's "ready" state, so the sitemap never lists a noindex page.
  const bookable = await db
    .select()
    .from(professional)
    .where(
      and(
        eq(professional.onboardingCompleted, true),
        eq(professional.isAcceptingBookings, true),
        exists(
          db
            .select({ id: service.id })
            .from(service)
            .where(and(eq(service.professionalId, professional.id), eq(service.isActive, true))),
        ),
        exists(
          db
            .select({ id: weeklyScheduleWindow.id })
            .from(weeklyScheduleWindow)
            .where(eq(weeklyScheduleWindow.professionalId, professional.id)),
        ),
      ),
    )

  const bookingRoutes: MetadataRoute.Sitemap = bookable
    .filter((p) => !isBillingBlocked(p))
    .map((p) => ({
      url: `${APP_URL}/agendar/${p.slug}`,
      changeFrequency: 'daily',
      priority: 0.6,
    }))

  return [...staticRoutes, ...bookingRoutes]
}
