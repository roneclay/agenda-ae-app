import Image from 'next/image'
import Link from 'next/link'
import { getTranslations } from 'next-intl/server'
import { SignOutButton } from '@/components/dashboard/sign-out-button'
import { getSession } from '@/lib/auth/session'
import type { NicheConfig } from '@/lib/config/niches'

export async function getNavLinks() {
  const t = await getTranslations('marketing.nav')
  return [
    { href: '#como', label: t('howItWorks') },
    { href: '#beneficios', label: t('benefits') },
    { href: '#precos', label: t('pricing') },
    { href: '#faq', label: t('faq') },
  ]
}

export async function MarketingNav({ niche }: { niche: NicheConfig }) {
  const session = await getSession()
  const t = await getTranslations('marketing.nav')
  const navLinks = await getNavLinks()

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3.5">
        <Link
          href="/"
          className="flex items-center gap-2 text-xl font-extrabold tracking-tight text-foreground"
        >
          {niche.logoUrl && (
            <Image src={niche.logoUrl} alt="" width={32} height={32} className="rounded-lg" />
          )}
          {niche.brandName}
        </Link>
        <nav className="hidden items-center gap-7 md:flex">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-muted-foreground transition hover:text-foreground"
            >
              {link.label}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          {session ? (
            <>
              <SignOutButton />
              <Link
                href="/dashboard"
                className="inline-flex items-center rounded-lg bg-primary px-3.5 py-2 text-sm font-semibold text-primary-foreground shadow-sm transition hover:opacity-90"
              >
                {t('goToDashboard')}
              </Link>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="hidden rounded-lg px-3.5 py-2 text-sm font-medium text-foreground transition hover:bg-muted sm:inline-flex"
              >
                {t('login')}
              </Link>
              <Link
                href="/cadastro"
                className="inline-flex items-center rounded-lg bg-primary px-3.5 py-2 text-sm font-semibold text-primary-foreground shadow-sm transition hover:opacity-90"
              >
                {t('createAccount')}
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
