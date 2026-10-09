import { headers } from 'next/headers'
import { getTranslations } from 'next-intl/server'
import { JsonLd } from '@/components/json-ld'
import { MarketingFooter } from '@/components/marketing/footer'
import { MarketingNav } from '@/components/marketing/nav'
import { TermosContent } from '@/components/termos-content'
import { getNicheFromHost } from '@/lib/config/niches'
import { buildPageMetadata, getBreadcrumbJsonLd } from '@/lib/seo'

export const generateMetadata = () => buildPageMetadata('/termos', { page: 'termos' })

export default async function TermosPage() {
  const headersList = await headers()
  const niche = getNicheFromHost(headersList.get('host') ?? '')
  const t = await getTranslations('meta.pages.termos')
  const jsonLd = {
    '@context': 'https://schema.org',
    ...(await getBreadcrumbJsonLd(t('title', { brandName: niche.brandName }), '/termos')),
  }

  return (
    <div className="flex flex-1 flex-col">
      <JsonLd data={jsonLd} />
      <MarketingNav niche={niche} />
      <div className="mx-auto w-full max-w-3xl flex-1 px-6 py-12">
        <TermosContent />
      </div>
      <MarketingFooter niche={niche} />
    </div>
  )
}
