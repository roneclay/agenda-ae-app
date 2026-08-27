import { headers } from 'next/headers'
import Image from 'next/image'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { SignOutButton } from '@/components/dashboard/sign-out-button'
import { getCurrentProfessional, requireSession } from '@/lib/auth/session'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await requireSession()
  const pro = await getCurrentProfessional()
  const t = await getTranslations('dashboard.nav')

  const NAV = [
    { href: '/dashboard', label: t('agenda') },
    { href: '/dashboard/horarios', label: t('horarios') },
    { href: '/dashboard/servicos', label: t('servicos') },
    { href: '/dashboard/clientes', label: t('clientes') },
    { href: '/dashboard/financeiro', label: t('financeiro') },
    { href: '/dashboard/configuracoes', label: t('configuracoes') },
  ]

  if (!pro?.onboardingCompleted) redirect('/onboarding')

  const pathname = (await headers()).get('x-pathname') ?? ''
  const isActive = pro.subscriptionStatus === 'active'
  const trialExpired = pro.trialEndsAt ? new Date() > pro.trialEndsAt : true
  const isBlocked = !isActive && trialExpired
  if (isBlocked && !pathname.startsWith('/dashboard/financeiro')) {
    redirect('/dashboard/financeiro?trial=expirado')
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-8">
            <Link
              href="/dashboard"
              className="flex items-center gap-2 text-lg font-semibold tracking-tight"
            >
              <Image
                src="/logo-agendadinho.png"
                alt=""
                width={26}
                height={26}
                className="rounded-lg"
              />
              Agendadinho
            </Link>
            <nav className="hidden gap-6 text-sm md:flex">
              {NAV.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-muted-foreground hover:text-foreground"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <span className="hidden text-muted-foreground sm:inline">{session.user.name}</span>
            <SignOutButton />
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-8">{children}</main>
    </div>
  )
}
