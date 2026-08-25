import Link from 'next/link'
import { redirect } from 'next/navigation'
import { SignOutButton } from '@/components/dashboard/sign-out-button'
import { WhatsappSetupBanner } from '@/components/dashboard/whatsapp-setup-banner'
import { getCurrentProfessional, requireSession } from '@/lib/auth/session'

const NAV = [
  { href: '/dashboard', label: 'Agenda' },
  { href: '/dashboard/horarios', label: 'Horários' },
  { href: '/dashboard/servicos', label: 'Serviços' },
  { href: '/dashboard/clientes', label: 'Clientes' },
  { href: '/dashboard/whatsapp', label: 'WhatsApp' },
  { href: '/dashboard/financeiro', label: 'Financeiro' },
  { href: '/dashboard/configuracoes', label: 'Configurações' },
]

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await requireSession()
  const pro = await getCurrentProfessional()

  if (!pro || !pro.onboardingCompleted) redirect('/onboarding')

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-8">
            <Link href="/dashboard" className="text-lg font-semibold tracking-tight">
              AgendaAe
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
      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-8">
        {!pro.whatsappPhoneNumberId && <WhatsappSetupBanner />}
        {children}
      </main>
    </div>
  )
}
