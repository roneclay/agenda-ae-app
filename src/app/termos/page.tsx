import { headers } from 'next/headers'
import { MarketingFooter } from '@/components/marketing/footer'
import { MarketingNav } from '@/components/marketing/nav'
import { TermosContent } from '@/components/termos-content'
import { getNicheFromHost } from '@/lib/config/niches'

export default async function TermosPage() {
  const headersList = await headers()
  const niche = getNicheFromHost(headersList.get('host') ?? '')

  return (
    <div className="flex flex-1 flex-col">
      <MarketingNav niche={niche} />
      <div className="mx-auto w-full max-w-3xl flex-1 px-6 py-12">
        <TermosContent />
      </div>
      <MarketingFooter niche={niche} />
    </div>
  )
}
