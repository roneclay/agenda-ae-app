import type { Metadata } from 'next'
import { headers } from 'next/headers'
import { getTranslations } from 'next-intl/server'
import { getNicheFromHost } from '@/lib/config/niches'

export const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

/** Absolute URL of a path on the site, resolved against NEXT_PUBLIC_APP_URL. */
export function absoluteUrl(path: string) {
  return new URL(path, APP_URL).toString()
}

type PageKey = 'cadastro' | 'login' | 'termos' | 'ajuda'

type BuildOptions = {
  /** Key under `meta.pages` with this page's own title/description. Defaults to the site-wide ones. */
  page?: PageKey
  /** Overrides title and description (e.g. pages built from database data). */
  title?: string
  description?: string
  /** Keep the page out of search results. */
  noindex?: boolean
}

/**
 * Site-wide metadata. Pass `path` to also declare the page's own canonical and og:url
 * (resolved against `metadataBase`). Without `path`, no canonical/og:url is declared, so
 * pages that don't set their own never claim another page's URL as canonical.
 * Next replaces `openGraph` wholesale when a page defines it, so pages must go through
 * this helper instead of overriding only `openGraph.url`.
 */
export async function buildPageMetadata(
  path?: string,
  options: BuildOptions = {},
): Promise<Metadata> {
  const headersList = await headers()
  const niche = getNicheFromHost(headersList.get('host') ?? '')
  const t = await getTranslations('meta')
  const values = { brandName: niche.brandName }
  const title =
    options.title ?? (options.page ? t(`pages.${options.page}.title`, values) : t('title', values))
  const description =
    options.description ??
    (options.page ? t(`pages.${options.page}.description`, values) : t('description', values))
  const images = niche.logoUrl ? ['/og-agendadinho.jpg'] : []

  return {
    title,
    description,
    ...(path ? { alternates: { canonical: path } } : {}),
    robots: options.noindex ? { index: false, follow: false } : { index: true, follow: true },
    openGraph: {
      type: 'website',
      locale: 'pt_BR',
      siteName: niche.brandName,
      ...(path ? { url: path } : {}),
      title,
      description,
      images,
    },
    twitter: { card: 'summary_large_image', title, description, images },
  }
}

/** Metadata for pages that must never show up in search results (private or transactional). */
export const noindexMetadata: Metadata = { robots: { index: false, follow: false } }

/** Strips the inline tags used by translated rich text (<b>…</b>) for plain-text consumers. */
export function stripTags(text: string) {
  return text.replace(/<[^>]+>/g, '')
}

const FAQ_SECTIONS = [
  { key: 'primeirosPassos', items: ['q1', 'q2', 'q3'] },
  { key: 'comoClienteAgenda', items: ['q1', 'q2', 'q3'] },
  { key: 'lembretes', items: ['q1', 'q2', 'q3'] },
  { key: 'gerenciarAgenda', items: ['q1', 'q2', 'q3', 'q4'] },
  { key: 'pagamento', items: ['q1', 'q2', 'q3'] },
  { key: 'semPagar', items: ['q1', 'q2', 'q3'] },
] as const

/** schema.org FAQPage built from the same help-center text the page renders. */
export async function getFaqJsonLd() {
  const t = await getTranslations('dashboard.ajuda')
  return {
    '@type': 'FAQPage',
    mainEntity: FAQ_SECTIONS.flatMap(({ key, items }) =>
      items.map((item) => ({
        '@type': 'Question',
        name: t(`sections.${key}.items.${item}.question`),
        acceptedAnswer: {
          '@type': 'Answer',
          text: stripTags(t.raw(`sections.${key}.items.${item}.answer`)),
        },
      })),
    ),
  }
}

/** schema.org BreadcrumbList: Início > current page. */
export async function getBreadcrumbJsonLd(name: string, path: string) {
  const t = await getTranslations('meta.breadcrumb')
  return {
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: t('home'), item: absoluteUrl('/') },
      { '@type': 'ListItem', position: 2, name, item: absoluteUrl(path) },
    ],
  }
}
