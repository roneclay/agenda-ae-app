import Image from 'next/image'
import Link from 'next/link'
import { getTranslations } from 'next-intl/server'
import type { NicheConfig } from '@/lib/config/niches'
import { INSTAGRAM_URL, SUPPORT_EMAIL } from '@/lib/config/niches'
import { getNavLinks } from './nav'

/** Lucide não tem ícones de marca (removidos por licenciamento) — SVG no mesmo estilo (Feather). */
function InstagramIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  )
}

export async function MarketingFooter({ niche }: { niche: NicheConfig }) {
  const t = await getTranslations('marketing')
  const tSupport = await getTranslations('supportFooter')
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
            <a
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
            >
              <InstagramIcon className="size-4" />
              {t('footer.instagram')}
            </a>
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
              <li>
                <Link href="/termos" className="hover:text-foreground">
                  {t('footer.terms')}
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-10 flex flex-col gap-2 border-t border-border/60 pt-6 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>
            {t('footer.copyright', { year: new Date().getFullYear(), brandName: niche.brandName })}
          </p>
          <p>
            {tSupport('label')}{' '}
            <a href={`mailto:${SUPPORT_EMAIL}`} className="underline hover:text-foreground">
              {SUPPORT_EMAIL}
            </a>
          </p>
        </div>
      </div>
    </footer>
  )
}
