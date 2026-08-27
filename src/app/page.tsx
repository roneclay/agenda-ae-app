import { headers } from 'next/headers'
import { BeautyHome } from '@/components/marketing/beauty-home'
import { MarketingFooter } from '@/components/marketing/footer'
import { MarketingNav } from '@/components/marketing/nav'
import { getNicheFromHost } from '@/lib/config/niches'
import { getProPriceCents } from '@/lib/config/settings'

export default async function Home() {
  const headersList = await headers()
  const niche = getNicheFromHost(headersList.get('host') ?? '')
  const proPriceCents = await getProPriceCents()

  return (
    <div className="flex flex-1 flex-col">
      <MarketingNav niche={niche} />
      {/* Cada nicho tem seu próprio Theme (home dedicada) — sem template compartilhado entre nichos.
          Hoje só existe BeautyHome (Agendadinho). Quando um novo nicho for lançado, cria-se um
          componente próprio (ex: LegalHome) e adiciona-se aqui, sem herdar copy do beauty. */}
      <BeautyHome niche={niche} proPriceCents={proPriceCents} />
      <MarketingFooter niche={niche} />
    </div>
  )
}
