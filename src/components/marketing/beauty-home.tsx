import Link from 'next/link'
import type { NicheConfig } from '@/lib/config/niches'
import { HeroVideo } from './hero-video'

function formatBRL(cents: number) {
  return (cents / 100).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
  })
}

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

export function BeautyHome({ niche }: { niche: NicheConfig }) {
  const { appointmentNoun, customerNoun, professionalNoun, brandName } = niche
  const mockDomain = `${brandName.toLowerCase()}.com.br`

  // Mesmo conteúdo do FAQ visível mais abaixo, em texto puro — usado só no JSON-LD.
  // Se mudar uma pergunta/resposta lá embaixo, atualizar aqui também.
  const faqJsonLd = [
    {
      q: 'Preciso instalar algum aplicativo?',
      a: `Não. Você acessa o painel do ${brandName} pelo navegador, no celular ou computador. Seu ${customerNoun} agenda pelo link, sem baixar nada.`,
    },
    {
      q: 'Como funciona o lembrete automático?',
      a: `Assim que ${customerNoun} agenda, o sistema já programa os lembretes de 24h, 6h e 2h antes. No lembrete de 6h, pedimos a confirmação de presença por um link. Se ${customerNoun} não confirmar até 2h antes, o horário libera automaticamente pra você oferecer pra outra pessoa.`,
    },
    {
      q: 'Como funciona o teste grátis?',
      a: '14 dias completos com todos os recursos, sem pedir cartão de crédito no cadastro.',
    },
    {
      q: 'Posso pagar com Pix ou cartão?',
      a: 'Sim, aceitamos os dois na hora de assinar o plano.',
    },
    {
      q: 'Serve pra quem está começando agora?',
      a: 'Sim. O cadastro inicial leva poucos minutos: dados básicos, um serviço e seus horários — e seu link já fica ativo.',
    },
  ]

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        '@id': `${APP_URL}/#website`,
        url: APP_URL,
        name: brandName,
        inLanguage: 'pt-BR',
      },
      {
        '@type': 'Organization',
        '@id': `${APP_URL}/#organization`,
        name: brandName,
        url: APP_URL,
        logo: niche.logoUrl ? `${APP_URL}${niche.logoUrl}` : undefined,
      },
      {
        '@type': 'SoftwareApplication',
        name: brandName,
        applicationCategory: 'BusinessApplication',
        operatingSystem: 'Web',
        url: APP_URL,
        description: `${brandName} organiza agenda, confirma presença e envia lembrete automático pra ${professionalNoun}s autônomos.`,
        offers: {
          '@type': 'Offer',
          price: (niche.proPriceCents / 100).toFixed(2),
          priceCurrency: 'BRL',
          priceSpecification: {
            '@type': 'UnitPriceSpecification',
            billingDuration: 1,
            billingIncrement: 1,
            unitCode: 'MON',
          },
        },
      },
      {
        '@type': 'FAQPage',
        mainEntity: faqJsonLd.map(({ q, a }) => ({
          '@type': 'Question',
          name: q,
          acceptedAnswer: { '@type': 'Answer', text: a },
        })),
      },
    ],
  }

  return (
    <>
      <script
        type="application/ld+json"
        // biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD gerado a partir de dados internos (niches.ts), não input de usuário
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* HERO */}
      <section className="relative overflow-hidden border-b border-border/60">
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background: `radial-gradient(circle at 15% 20%, ${niche.palette.tint50}, transparent 45%), radial-gradient(circle at 85% 0%, ${niche.palette.tint100}, transparent 40%)`,
          }}
        />
        <div className="relative mx-auto grid max-w-6xl gap-12 px-6 py-16 md:grid-cols-[1.05fr_1fr] md:items-center md:py-24">
          <div>
            <div
              className="mb-6 inline-flex items-center gap-2.5 rounded-full border px-3.5 py-1.5 text-xs font-semibold"
              style={{
                borderColor: niche.palette.tint100,
                backgroundColor: niche.palette.soft,
                color: niche.palette.darker,
              }}
            >
              <span className="rounded-full bg-primary px-2 py-0.5 text-[10px] tracking-wide text-primary-foreground uppercase">
                Novo
              </span>
              14 dias grátis, sem cartão
            </div>

            <h1 className="text-5xl leading-[1.05] font-extrabold text-foreground md:text-6xl">
              Chega de perder {appointmentNoun} por{' '}
              <span className="rounded bg-primary/15 px-1.5 text-primary">
                {customerNoun} que sumiu
              </span>
              .
            </h1>

            <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">
              Agenda com buraco, mensagem pra lá e pra cá pra combinar horário, {customerNoun} que
              confirma e não aparece — e você vira recepcionista, atendente e {professionalNoun} ao
              mesmo tempo. O {brandName}{' '}
              <strong className="text-foreground">
                organiza os horários, confirma presença e manda lembrete automático
              </strong>
              , tudo sozinho.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/cadastro"
                className="inline-flex h-12 items-center justify-center rounded-xl bg-primary px-6 text-base font-semibold text-primary-foreground shadow-lg transition hover:opacity-90"
                style={{ boxShadow: `0 10px 28px -8px ${niche.palette.dark}66` }}
              >
                Criar conta grátis
              </Link>
              <Link
                href="/agendar/demo"
                className="inline-flex h-12 items-center justify-center rounded-xl border border-border bg-background px-6 text-base font-semibold text-foreground transition hover:bg-muted"
              >
                Ver demonstração →
              </Link>
            </div>

            <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
              <span>
                <span className="font-semibold text-primary">✓</span> Sem cartão
              </span>
              <span>
                <span className="font-semibold text-primary">✓</span> Sem complicação
              </span>
              <span>
                <span className="font-semibold text-primary">✓</span> Em poucos minutos
              </span>
            </div>
          </div>

          {/* Vídeo de campanha real (gravado pelo Roni) — substitui o mockup */}
          <div className="relative mx-auto w-full max-w-[300px]">
            <HeroVideo />
          </div>
        </div>
      </section>

      {/* LINK PÚBLICO / SCHEDULE PREVIEW */}
      <section className="border-b border-border/60 bg-muted/40 py-20">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <p className="text-xs font-semibold tracking-wide text-primary uppercase">
            Link de agendamento
          </p>
          <h2 className="mt-4 text-4xl font-extrabold text-foreground">
            O link público que <span className="text-primary">trabalha enquanto você atende.</span>
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base text-muted-foreground">
            Compartilhe onde {customerNoun} já te encontra — Instagram, WhatsApp ou site. Abre,
            escolhe e pronto.
          </p>
        </div>

        <div
          className="mx-auto mt-10 max-w-3xl overflow-hidden rounded-3xl border border-border bg-card"
          style={{ boxShadow: 'var(--shadow-lg)' }}
        >
          <div className="flex items-center gap-3 border-b border-border bg-muted/60 px-4 py-3">
            <div className="flex gap-1.5">
              <span className="size-2.5 rounded-full bg-[#ff5f57]" />
              <span className="size-2.5 rounded-full bg-[#febc2e]" />
              <span className="size-2.5 rounded-full bg-[#28c840]" />
            </div>
            <div className="rounded-md border border-border bg-background px-3 py-1 font-mono text-xs text-muted-foreground">
              {mockDomain}/agendar/seu-nome
            </div>
          </div>
          <div className="grid gap-6 p-6 sm:grid-cols-[1fr_1.2fr] md:p-8">
            <div>
              <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                {professionalNoun.charAt(0).toUpperCase() + professionalNoun.slice(1)}
              </p>
              <h3 className="mt-1.5 text-xl font-bold text-foreground">
                {appointmentNoun.charAt(0).toUpperCase() + appointmentNoun.slice(1)} · 60min
              </h3>
              <div className="mt-4 flex flex-col gap-2.5 text-sm text-foreground/90">
                <span>⏱ 60 minutos</span>
                <span>✓ Confirmação automática</span>
                <span>🔔 Lembrete 24h, 6h e 2h antes</span>
              </div>
            </div>
            <div>
              <p className="mb-3 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                Horários disponíveis
              </p>
              <div className="grid grid-cols-3 gap-2">
                {['09:00', '10:30', '13:00', '14:30', '17:00', '19:30'].map((time, i) => (
                  <div
                    key={time}
                    className={
                      i === 3
                        ? 'rounded-lg bg-primary py-2.5 text-center text-sm font-semibold text-primary-foreground'
                        : 'rounded-lg border py-2.5 text-center text-sm font-semibold text-primary'
                    }
                    style={i === 3 ? undefined : { borderColor: niche.palette.tint100 }}
                  >
                    {time}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PAIN */}
      <section className="border-b border-border/60 bg-muted/40 py-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid gap-8 md:grid-cols-2 md:items-end">
            <div>
              <p className="text-xs font-semibold tracking-wide text-primary uppercase">
                A rotina invisível
              </p>
              <h2 className="mt-4 text-4xl font-extrabold text-foreground">
                Você não abriu o seu negócio pra{' '}
                <span className="text-primary">
                  passar a noite combinando horário por mensagem.
                </span>
              </h2>
            </div>
            <p className="text-base leading-relaxed text-muted-foreground">
              Mas é o que rola. Entre confirmar horário, mandar lembrete, remarcar quem cancelou em
              cima da hora e cobrar quem sumiu sem avisar — você vira a própria recepção. Todo santo
              dia.
            </p>
          </div>

          <ul className="mt-10 grid gap-4 md:grid-cols-2">
            {[
              `Você separou o horário, esperou — e ${customerNoun} simplesmente não apareceu.`,
              'Você foi dormir com mensagens sem responder, exausto depois de um dia inteiro de atendimento.',
              `Você esqueceu de confirmar um horário — e ${customerNoun} achou que tinha sido cancelado.`,
              'Você já calculou quanto dinheiro foi embora em faltas num mês só. E preferiu parar de calcular.',
              'Você passa mais tempo com o celular na mão do que fazendo o que sabe fazer de melhor.',
              'Você quer crescer e cobrar mais — mas isso pediria mais tempo. E tempo é o que não sobra.',
            ].map((text, i) => (
              <li
                key={text}
                className="flex gap-4 rounded-2xl border border-border bg-card p-5 text-sm leading-relaxed text-foreground/90"
              >
                <span className="font-mono text-xs font-semibold text-primary">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span>{text}</span>
              </li>
            ))}
          </ul>

          <p className="mx-auto mt-10 max-w-2xl text-center text-base text-muted-foreground">
            Se você se reconheceu em pelo menos uma dessas situações, o problema não é a sua agenda.{' '}
            <strong className="text-foreground">É o sistema. E sistema tem solução.</strong>
          </p>
        </div>
      </section>

      {/* COMO FUNCIONA */}
      <section id="como" className="border-b border-border/60 py-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid gap-8 md:grid-cols-2 md:items-end">
            <div>
              <p className="text-xs font-semibold tracking-wide text-primary uppercase">
                Como funciona
              </p>
              <h2 className="mt-4 text-4xl font-extrabold text-foreground">
                O {brandName} resolve{' '}
                <span className="text-primary">o que a troca de mensagem não dá conta.</span>
              </h2>
            </div>
            <p className="text-base leading-relaxed text-muted-foreground">
              Em vez de combinar dia e horário no chat, {customerNoun}{' '}
              <strong className="text-foreground">acessa seu link e agenda sozinho</strong>. Você
              ganha de volta o tempo que ia embora respondendo mensagem.
            </p>
          </div>

          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {[
              {
                num: '01',
                title: `${customerNoun.charAt(0).toUpperCase() + customerNoun.slice(1)} agenda sozinho`,
                body: `Pelo seu link — escolhe ${appointmentNoun}, dia e horário em poucos toques. Sem app, sem cadastro.`,
              },
              {
                num: '02',
                title: 'Confirmação automática',
                body: `${customerNoun.charAt(0).toUpperCase() + customerNoun.slice(1)} recebe a confirmação na hora, e o horário já entra na sua agenda — sem você precisar responder nada.`,
              },
              {
                num: '03',
                title: 'Você começa o dia confirmado',
                body: 'Lembrete automático 24h, 6h e 2h antes. Quem precisa remarcar, remarca sozinho — sem te acordar de noite.',
              },
            ].map((step) => (
              <div
                key={step.num}
                className="rounded-2xl border border-border bg-card p-7 transition hover:-translate-y-0.5"
                style={{ boxShadow: 'var(--shadow-sm)' }}
              >
                <span
                  className="mb-4 inline-flex size-9 items-center justify-center rounded-lg font-mono text-xs font-bold text-primary"
                  style={{ backgroundColor: niche.palette.tint100 }}
                >
                  {step.num}
                </span>
                <h3 className="text-lg font-bold text-foreground">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{step.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* BENEFÍCIOS */}
      <section id="beneficios" className="border-b border-border/60 py-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid gap-8 md:grid-cols-2 md:items-end">
            <div>
              <p className="text-xs font-semibold tracking-wide text-primary uppercase">
                Benefícios
              </p>
              <h2 className="mt-4 text-4xl font-extrabold text-foreground">
                O que muda <span className="text-primary">de verdade</span> no seu dia.
              </h2>
            </div>
            <p className="text-base leading-relaxed text-muted-foreground">
              Não é "mais um sistema pra aprender".{' '}
              <strong className="text-foreground">
                É o fim da rotina de ficar trocando mensagem pra combinar horário
              </strong>{' '}
              que ninguém avisou que vinha junto quando você começou a atender por conta própria.
            </p>
          </div>

          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {[
              [
                'Para de ser recepcionista de si mesmo',
                `${customerNoun.charAt(0).toUpperCase() + customerNoun.slice(1)} agenda, remarca e confirma direto pelo seu link. Você nem precisa responder mensagem pra combinar horário.`,
              ],
              [
                `Chega de ${customerNoun} sumido`,
                `Lembrete automático pede confirmação 6h antes. Se ${customerNoun} não confirmar, o horário libera sozinho — sem você ficando esperando quem não vai vir.`,
              ],
              [
                'Comece o dia organizado',
                'Você abre o painel e a agenda já está confirmada — sem ter mandado uma mensagem sequer.',
              ],
              [
                'Agenda sempre visível',
                `Você e ${customerNoun} sabem exatamente quais horários estão livres, sem precisar perguntar.`,
              ],
              [
                'Tempo de volta no seu dia',
                'Sem ficar respondendo "que horário você tem?" pela décima vez. Esse tempo volta pra você.',
              ],
              [
                'Cresça sem se sobrecarregar',
                'Aceite mais horários, atenda melhor, aumente o faturamento — sem aumentar o caos.',
              ],
            ].map(([title, body]) => (
              <div key={title} className="rounded-2xl border border-border bg-card p-6">
                <div
                  className="mb-4 flex size-8 items-center justify-center rounded-lg text-sm font-bold text-primary"
                  style={{ backgroundColor: niche.palette.tint100 }}
                >
                  ✓
                </div>
                <h3 className="font-bold text-foreground">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PREÇOS */}
      <section id="precos" className="border-b border-border/60 bg-muted/40 py-20">
        <div className="mx-auto max-w-2xl px-6 text-center">
          <p className="text-xs font-semibold tracking-wide text-primary uppercase">Oferta</p>
          <h2 className="mt-4 text-4xl font-extrabold text-foreground">
            Um plano. <span className="text-primary">Tudo incluso.</span>
          </h2>
          <p className="mt-4 text-base text-muted-foreground">
            Sem taxa de adesão, sem letra miúda. Teste grátis por 14 dias, sem cartão.
          </p>
        </div>

        <div
          className="mx-auto mt-10 max-w-md rounded-3xl border-2 bg-card p-8"
          style={{ borderColor: niche.palette.tint100, boxShadow: 'var(--shadow-lg)' }}
        >
          <p className="text-sm font-semibold text-primary">Plano Profissional</p>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-5xl font-extrabold text-foreground">
              {formatBRL(niche.proPriceCents)}
            </span>
            <span className="text-sm text-muted-foreground">/ mês</span>
          </div>
          <ul className="mt-6 flex flex-col gap-3 text-sm text-foreground/90">
            {[
              'Agendamentos ilimitados',
              'Lembretes automáticos 24h, 6h e 2h antes, com confirmação de presença',
              'Liberação automática do horário se o cliente não confirmar',
              'Controle de horários, bloqueios e exceções por data',
              'Link público de agendamento personalizado',
              'Painel completo: horários, serviços e histórico de clientes',
              'Pix ou cartão na hora de assinar',
            ].map((item) => (
              <li key={item} className="flex items-start gap-2.5">
                <span className="mt-0.5 text-primary">✓</span>
                {item}
              </li>
            ))}
          </ul>
          <Link
            href="/cadastro"
            className="mt-7 flex h-12 w-full items-center justify-center rounded-xl bg-primary text-base font-semibold text-primary-foreground transition hover:opacity-90"
          >
            Começar grátis por 14 dias
          </Link>
          <p className="mt-3 text-center text-xs text-muted-foreground">
            Sem cartão. Cancele quando quiser.
          </p>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="border-b border-border/60 py-20">
        <div className="mx-auto max-w-3xl px-6">
          <div className="text-center">
            <p className="text-xs font-semibold tracking-wide text-primary uppercase">Perguntas</p>
            <h2 className="mt-4 text-4xl font-extrabold text-foreground">
              O que <span className="text-primary">quase todo mundo pergunta.</span>
            </h2>
          </div>

          <div className="mt-10 flex flex-col gap-3">
            {[
              {
                q: 'Preciso instalar algum aplicativo?',
                a: (
                  <>
                    Não. Você acessa o painel do {brandName} pelo navegador, no celular ou
                    computador. Seu {customerNoun} agenda pelo link,{' '}
                    <strong className="text-foreground">sem baixar nada</strong>.
                  </>
                ),
              },
              {
                q: 'Como funciona o lembrete automático?',
                a: (
                  <>
                    Assim que {customerNoun} agenda, o sistema já programa os lembretes de 24h, 6h e
                    2h antes — {customerNoun} não precisa fazer nada manualmente. No lembrete de 6h,
                    pedimos a confirmação de presença por um link.{' '}
                    <strong className="text-foreground">
                      Se {customerNoun} não confirmar até 2h antes, o horário libera automaticamente
                    </strong>{' '}
                    pra você oferecer pra outra pessoa.
                  </>
                ),
              },
              {
                q: 'Como funciona o teste grátis?',
                a: (
                  <>
                    <strong className="text-foreground">14 dias completos</strong> com todos os
                    recursos, sem pedir cartão de crédito no cadastro.
                  </>
                ),
              },
              {
                q: 'Posso pagar com Pix ou cartão?',
                a: 'Sim, aceitamos os dois na hora de assinar o plano.',
              },
              {
                q: 'Serve pra quem está começando agora?',
                a: (
                  <>
                    Sim. O{' '}
                    <strong className="text-foreground">
                      cadastro inicial leva poucos minutos
                    </strong>
                    : dados básicos, um serviço e seus horários — e seu link já fica ativo.
                  </>
                ),
              },
            ].map(({ q, a }) => (
              <details
                key={q}
                className="group rounded-xl border border-border bg-card px-5 py-4 open:border-primary/40"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold text-foreground">
                  {q}
                  <span
                    className="flex size-6 shrink-0 items-center justify-center rounded-full text-sm text-primary transition group-open:rotate-45"
                    style={{ backgroundColor: niche.palette.tint100 }}
                  >
                    +
                  </span>
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="py-20">
        <div className="mx-auto max-w-5xl px-6">
          <div
            className="rounded-3xl px-8 py-16 text-center text-white sm:px-16"
            style={{
              background: `linear-gradient(135deg, ${niche.palette.darker}, ${niche.palette.dark} 60%, ${niche.palette.base})`,
            }}
          >
            <p className="text-xs font-semibold tracking-wide text-white/80 uppercase">
              Última coisa
            </p>
            <h2 className="mx-auto mt-4 max-w-xl text-4xl font-extrabold">
              Você já passou tempo demais fazendo o trabalho que o sistema deveria fazer.
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-white/85">
              Outros {professionalNoun}s já estão com a agenda confirmada automaticamente. A
              diferença não é sorte — é sistema.
            </p>
            <Link
              href="/cadastro"
              className="mt-8 inline-flex h-12 items-center justify-center rounded-xl bg-white px-7 text-base font-semibold text-foreground transition hover:opacity-90"
              style={{ color: niche.palette.darker }}
            >
              Criar minha conta grátis →
            </Link>
            <p className="mt-4 text-xs text-white/70">
              Começa grátis · sem cartão · sem complicação
            </p>
          </div>
        </div>
      </section>
    </>
  )
}
