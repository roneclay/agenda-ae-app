import Link from 'next/link'
import { buttonVariants } from '@/components/ui/button'

export default function Home() {
  return (
    <div className="flex flex-1 flex-col">
      <header className="border-b">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/" className="text-xl font-semibold tracking-tight">
            AgendaAe
          </Link>
          <nav className="flex items-center gap-2">
            <Link href="/login" className={buttonVariants({ variant: 'ghost' })}>
              Entrar
            </Link>
            <Link href="/cadastro" className={buttonVariants()}>
              Criar conta
            </Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col items-center justify-center gap-10 px-6 py-20 text-center">
        <div className="space-y-6">
          <h1 className="text-balance text-5xl font-semibold tracking-tight md:text-6xl">
            Sua agenda inteligente,
            <br />
            no WhatsApp.
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
            O AgendaAe organiza seus horários, lembra seus clientes e agenda automaticamente pelo
            WhatsApp. Você cuida do atendimento — a gente cuida do resto.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Link href="/cadastro" className={buttonVariants({ size: 'lg' })}>
            Começar grátis por 14 dias
          </Link>
          <Link href="/agendar/demo" className={buttonVariants({ size: 'lg', variant: 'outline' })}>
            Ver demonstração
          </Link>
        </div>

        <div className="grid w-full max-w-4xl grid-cols-1 gap-6 pt-12 md:grid-cols-3">
          {[
            {
              title: 'Bot de IA no WhatsApp',
              body: 'Cliente fala em linguagem natural. O assistente agenda, remarca e cancela.',
            },
            {
              title: 'Lembretes automáticos',
              body: 'Notificações 24h e 2h antes. Menos no-show, mais faturamento.',
            },
            {
              title: 'Link público de agendamento',
              body: 'Compartilhe seu /agendar/seu-nome. Sem app, sem cadastro pro cliente.',
            },
          ].map((f) => (
            <div key={f.title} className="rounded-xl border p-6 text-left">
              <h3 className="font-semibold">{f.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{f.body}</p>
            </div>
          ))}
        </div>
      </main>

      <footer className="border-t">
        <div className="mx-auto max-w-6xl px-6 py-6 text-sm text-muted-foreground">
          © {new Date().getFullYear()} AgendaAe — feito no Brasil 🇧🇷
        </div>
      </footer>
    </div>
  )
}
