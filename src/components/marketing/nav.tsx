import Image from 'next/image'
import Link from 'next/link'
import { SignOutButton } from '@/components/dashboard/sign-out-button'
import { getSession } from '@/lib/auth/session'
import type { NicheConfig } from '@/lib/config/niches'

const NAV_LINKS = [
  { href: '#como', label: 'Como funciona' },
  { href: '#beneficios', label: 'Benefícios' },
  { href: '#precos', label: 'Preços' },
  { href: '#faq', label: 'Perguntas' },
]

export { NAV_LINKS }

export async function MarketingNav({ niche }: { niche: NicheConfig }) {
  const session = await getSession()

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
          {NAV_LINKS.map((link) => (
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
                Ir para o painel
              </Link>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="hidden rounded-lg px-3.5 py-2 text-sm font-medium text-foreground transition hover:bg-muted sm:inline-flex"
              >
                Entrar
              </Link>
              <Link
                href="/cadastro"
                className="inline-flex items-center rounded-lg bg-primary px-3.5 py-2 text-sm font-semibold text-primary-foreground shadow-sm transition hover:opacity-90"
              >
                Criar conta
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
