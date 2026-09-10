import Image from 'next/image'
import Link from 'next/link'
import { getTranslations } from 'next-intl/server'
import type { NicheConfig } from '@/lib/config/niches'
import { getNavLinks } from './nav'

export async function MarketingFooter({ niche }: { niche: NicheConfig }) {
  const t = await getTranslations('marketing')
  const navLinks = await getNavLinks()

  return (
    <footer className="border-t border-border/60 bg-muted/40">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="grid gap-10 sm:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <div className="flex items-center gap-2">
              {niche.logoUrl && (
                <Image src={niche.logoUrl} alt="" width={28} height={28} className="rounded-lg" />
              )}
              <p className="text-xl font-extrabold text-foreground">{niche.brandName}</p>
            </div>
            <p className="mt-3 max-w-xs text-sm text-muted-foreground">{t('footer.tagline')}</p>
          </div>
          <div>
            <p className="text-sm font-bold text-foreground">{t('footer.productHeading')}</p>
            <ul className="mt-3 flex flex-col gap-2 text-sm text-muted-foreground">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <a href={link.href} className="hover:text-foreground">
                    {link.label}
                  </a>
                </li>
              ))}
              <li>
                <Link href="/ajuda" className="hover:text-foreground">
                  {t('footer.helpCenter')}
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <p className="text-sm font-bold text-foreground">{t('footer.accountHeading')}</p>
            <ul className="mt-3 flex flex-col gap-2 text-sm text-muted-foreground">
              <li>
                <Link href="/login" className="hover:text-foreground">
                  {t('nav.login')}
                </Link>
              </li>
              <li>
                <Link href="/cadastro" className="hover:text-foreground">
                  {t('nav.createAccount')}
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-10 border-t border-border/60 pt-6 text-sm text-muted-foreground">
          {t('footer.copyright', { year: new Date().getFullYear(), brandName: niche.brandName })}
        </div>
      </div>
    </footer>
  )
}
