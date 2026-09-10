import { headers } from 'next/headers'
import { AjudaContent } from '@/components/ajuda-content'
import { MarketingFooter } from '@/components/marketing/footer'
import { MarketingNav } from '@/components/marketing/nav'
import { getNicheFromHost } from '@/lib/config/niches'

export default async function AjudaPublicPage() {
  const headersList = await headers()
  const niche = getNicheFromHost(headersList.get('host') ?? '')

  return (
    <div className="flex flex-1 flex-col">
      <MarketingNav niche={niche} />
      <div className="mx-auto w-full max-w-3xl flex-1 px-6 py-12">
        <AjudaContent />
      </div>
      <MarketingFooter niche={niche} />
    </div>
  )
}
