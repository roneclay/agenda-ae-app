import type { Metadata } from 'next'
import { headers } from 'next/headers'
import { getTranslations } from 'next-intl/server'
import { getNicheFromHost } from '@/lib/config/niches'

/**
 * Site-wide metadata. Pass `path` to also declare the page's own canonical and og:url
 * (resolved against `metadataBase`). Without `path`, no canonical/og:url is declared, so
 * pages that don't set their own never claim another page's URL as canonical.
 * Next replaces `openGraph` wholesale when a page defines it, so pages must go through
 * this helper instead of overriding only `openGraph.url`.
 */
export async function buildPageMetadata(path?: string): Promise<Metadata> {
  const headersList = await headers()
  const niche = getNicheFromHost(headersList.get('host') ?? '')
  const t = await getTranslations('meta')
  const title = t('title', { brandName: niche.brandName })
  const description = t('description', { brandName: niche.brandName })

  return {
    title,
    description,
    ...(path ? { alternates: { canonical: path } } : {}),
    robots: { index: true, follow: true },
    openGraph: {
      type: 'website',
      locale: 'pt_BR',
      siteName: niche.brandName,
      ...(path ? { url: path } : {}),
      title,
      description,
      images: niche.logoUrl ? ['/og-agendadinho.jpg'] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: niche.logoUrl ? ['/og-agendadinho.jpg'] : [],
    },
  }
}
