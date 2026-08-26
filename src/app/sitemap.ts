import { and, eq } from 'drizzle-orm'
import type { MetadataRoute } from 'next'
import { db, professional } from '@/lib/db'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${APP_URL}/`, changeFrequency: 'weekly', priority: 1 },
    { url: `${APP_URL}/cadastro`, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${APP_URL}/login`, changeFrequency: 'yearly', priority: 0.3 },
  ]

  const activeProfessionals = await db
    .select({ slug: professional.slug })
    .from(professional)
    .where(
      and(eq(professional.onboardingCompleted, true), eq(professional.isAcceptingBookings, true)),
    )

  const bookingRoutes: MetadataRoute.Sitemap = activeProfessionals.map((p) => ({
    url: `${APP_URL}/agendar/${p.slug}`,
    changeFrequency: 'daily',
    priority: 0.6,
  }))

  return [...staticRoutes, ...bookingRoutes]
}
