import { headers } from 'next/headers'
import { getTranslations } from 'next-intl/server'
import { getNicheFromHost, SUPPORT_EMAIL } from '@/lib/config/niches'
import { getProPriceCents } from '@/lib/config/settings'
import { absoluteUrl } from '@/lib/seo'

// Plain-text guide for AI assistants (llmstxt.org format), built from the same
// translated copy as the pages so there is a single source of truth.
const PAGES = [
  { path: '/', key: null },
  { path: '/cadastro', key: 'cadastro' },
  { path: '/ajuda', key: 'ajuda' },
  { path: '/termos', key: 'termos' },
] as const

export async function GET() {
  const headersList = await headers()
  const niche = getNicheFromHost(headersList.get('host') ?? '')
  const t = await getTranslations('meta')
  const values = { brandName: niche.brandName }
  const price = (await getProPriceCents()) / 100

  const pageLines = PAGES.map(({ path, key }) => {
    const title = key ? t(`pages.${key}.title`, values) : t('title', values)
    const description = key ? t(`pages.${key}.description`, values) : t('description', values)
    return `- [${title}](${absoluteUrl(path)}): ${description}`
  })

  const body = [
    `# ${niche.brandName}`,
    '',
    `> ${t('llms.summary', {
      ...values,
      price: price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
    })}`,
    '',
    `## ${t('llms.pagesHeading')}`,
    '',
    ...pageLines,
    '',
    `## ${t('llms.contactHeading')}`,
    '',
    `- ${t('llms.contact', { email: SUPPORT_EMAIL })}`,
    '',
  ].join('\n')

  return new Response(body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  })
}
