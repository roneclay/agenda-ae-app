import { headers } from 'next/headers'
import { getTranslations } from 'next-intl/server'
import { AjudaContent } from '@/components/ajuda-content'
import { JsonLd } from '@/components/json-ld'
import { MarketingFooter } from '@/components/marketing/footer'
import { MarketingNav } from '@/components/marketing/nav'
import { getNicheFromHost } from '@/lib/config/niches'
import { buildPageMetadata, getBreadcrumbJsonLd, getFaqJsonLd } from '@/lib/seo'

export const generateMetadata = () => buildPageMetadata('/ajuda', { page: 'ajuda' })

export default async function AjudaPublicPage() {
  const headersList = await headers()
  const niche = getNicheFromHost(headersList.get('host') ?? '')
  const t = await getTranslations('meta.pages.ajuda')
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      await getBreadcrumbJsonLd(t('title', { brandName: niche.brandName }), '/ajuda'),
      await getFaqJsonLd(),
    ],
  }

  return (
    <div className="flex flex-1 flex-col">
      <JsonLd data={jsonLd} />
      <MarketingNav niche={niche} />
      <div className="mx-auto w-full max-w-3xl flex-1 px-6 py-12">
        <AjudaContent />
      </div>
      <MarketingFooter niche={niche} />
    </div>
  )
}
