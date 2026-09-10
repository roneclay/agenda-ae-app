import Image from 'next/image'
import Link from 'next/link'
import { getTranslations } from 'next-intl/server'
import type { NicheConfig } from '@/lib/config/niches'
import { HeroVideo } from './hero-video'

const TRUST_STRIP_PROFESSIONS = [
  {
    key: 'p1',
    image:
      'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=300&h=300&fit=crop&crop=faces&auto=format',
  },
  {
    key: 'p2',
    image:
      'https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=300&h=300&fit=crop&crop=faces&auto=format',
  },
  {
    key: 'p3',
    image:
      'https://images.unsplash.com/photo-1580618672591-eb180b1a973f?w=300&h=300&fit=crop&crop=faces&auto=format',
  },
  {
    key: 'p4',
    image:
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&h=300&fit=crop&crop=faces&auto=format',
  },
  {
    key: 'p5',
    image:
      'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=300&h=300&fit=crop&crop=faces&auto=format',
  },
  {
    key: 'p6',
    image:
      'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=300&h=300&fit=crop&crop=faces&auto=format',
  },
] as const

function formatBRL(cents: number) {
  return (cents / 100).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
  })
}

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

const highlight = (chunks: React.ReactNode) => <span className="text-primary">{chunks}</span>
const bold = (chunks: React.ReactNode) => <strong className="text-foreground">{chunks}</strong>

export async function BeautyHome({
  niche,
  proPriceCents,
}: {
  niche: NicheConfig
  proPriceCents: number
}) {
  const { appointmentNoun, customerNoun, professionalNoun, brandName } = niche
  const mockDomain = `${brandName.toLowerCase()}.com.br`
  const t = await getTranslations('marketing.home')

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
          price: (proPriceCents / 100).toFixed(2),
          priceCurrency: 'BRL',
          priceSpecification: {
            '@type': 'UnitPriceSpecification',
            billingDuration: 1,
            billingIncrement: 1,
            unitCode: 'MON',
          },
        },
      },
    ],
  }

  const painItems = ['item1', 'item2', 'item3', 'item4', 'item5', 'item6'] as const
  const howItWorksSteps = ['step1', 'step2', 'step3'] as const
  const benefitItems = ['item1', 'item2', 'item3', 'item4', 'item5', 'item6'] as const
  const pricingFeatures = ['f1', 'f2', 'f3', 'f4', 'f5', 'f6', 'f7'] as const

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
                {t('badgeNew')}
              </span>
              {t('badgeTagline')}
            </div>

            <h1 className="text-5xl leading-[1.05] font-extrabold text-foreground md:text-6xl">
              {t.rich('hero.headline', {
                appointmentNoun,
                customerNoun,
                highlight: (chunks) => (
                  <span className="rounded bg-primary/15 px-1.5 text-primary">{chunks}</span>
                ),
              })}
            </h1>

            <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">
              {t.rich('hero.description', { customerNoun, professionalNoun, brandName, b: bold })}
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/cadastro"
                className="inline-flex h-12 items-center justify-center rounded-xl bg-primary px-6 text-base font-semibold text-primary-foreground shadow-lg transition hover:opacity-90"
                style={{ boxShadow: `0 10px 28px -8px ${niche.palette.dark}66` }}
              >
                {t('hero.ctaPrimary')}
              </Link>
            </div>

            <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
              <span>
                <span className="font-semibold text-primary">✓</span> {t('hero.trust1')}
              </span>
              <span>
                <span className="font-semibold text-primary">✓</span> {t('hero.trust2')}
              </span>
              <span>
                <span className="font-semibold text-primary">✓</span> {t('hero.trust3')}
              </span>
            </div>
          </div>

          {/* Vídeo de campanha real (gravado pelo Roni) — substitui o mockup */}
          <div className="relative mx-auto w-full max-w-[300px]">
            <HeroVideo />
          </div>
        </div>
      </section>

      {/* TRUST STRIP */}
      <section className="pt-9 pb-20 text-center">
        <div className="mx-auto max-w-6xl px-6">
          <h6 className="mb-6 font-mono text-xs font-medium tracking-wider text-muted-foreground uppercase">
            {t('trustStrip.heading')}
          </h6>
          <div className="flex items-center gap-7 overflow-x-auto pb-2 [scrollbar-width:none] sm:flex-wrap sm:justify-center sm:gap-12 sm:overflow-visible sm:pb-0 [&::-webkit-scrollbar]:hidden">
            {TRUST_STRIP_PROFESSIONS.map(({ key, image }) => (
              <span
                key={key}
                className="inline-flex shrink-0 flex-col items-center gap-2.5 text-[13px] font-semibold text-foreground"
              >
                <span className="relative block h-[60px] w-[60px] overflow-hidden rounded-full border-[3px] border-white shadow-[0_4px_14px_rgba(0,40,120,0.10)] outline outline-1 outline-border sm:h-[72px] sm:w-[72px]">
                  <Image src={image} alt="" fill sizes="72px" className="object-cover" />
                </span>
                {t(`trustStrip.professions.${key}`)}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* LINK PÚBLICO / SCHEDULE PREVIEW */}
      <section className="border-b border-border/60 bg-muted/40 py-20">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <p className="text-xs font-semibold tracking-wide text-primary uppercase">
            {t('schedulePreview.eyebrow')}
          </p>
          <h2 className="mt-4 text-4xl font-extrabold text-foreground">
            {t.rich('schedulePreview.heading', { highlight })}
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base text-muted-foreground">
            {t('schedulePreview.description', { customerNoun })}
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
                {t('schedulePreview.serviceDuration', { appointmentNoun })}
              </h3>
              <div className="mt-4 flex flex-col gap-2.5 text-sm text-foreground/90">
                <span>{t('schedulePreview.duration')}</span>
                <span>{t('schedulePreview.autoConfirm')}</span>
                <span>{t('schedulePreview.reminder')}</span>
              </div>
            </div>
            <div>
              <p className="mb-3 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                {t('schedulePreview.availableTimes')}
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
                {t('pain.eyebrow')}
              </p>
              <h2 className="mt-4 text-4xl font-extrabold text-foreground">
                {t.rich('pain.heading', { highlight })}
              </h2>
            </div>
            <p className="text-base leading-relaxed text-muted-foreground">
              {t('pain.description')}
            </p>
          </div>

          <ul className="mt-10 grid gap-4 md:grid-cols-2">
            {painItems.map((key, i) => (
              <li
                key={key}
                className="flex gap-4 rounded-2xl border border-border bg-card p-5 text-sm leading-relaxed text-foreground/90"
              >
                <span className="font-mono text-xs font-semibold text-primary">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span>{t(`pain.items.${key}`, { customerNoun })}</span>
              </li>
            ))}
          </ul>

          <p className="mx-auto mt-10 max-w-2xl text-center text-base text-muted-foreground">
            {t.rich('pain.conclusion', { b: bold })}
          </p>
        </div>
      </section>

      {/* COMO FUNCIONA */}
      <section id="como" className="border-b border-border/60 py-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid gap-8 md:grid-cols-2 md:items-end">
            <div>
              <p className="text-xs font-semibold tracking-wide text-primary uppercase">
                {t('howItWorks.eyebrow')}
              </p>
              <h2 className="mt-4 text-4xl font-extrabold text-foreground">
                {t.rich('howItWorks.heading', { brandName, highlight })}
              </h2>
            </div>
            <p className="text-base leading-relaxed text-muted-foreground">
              {t.rich('howItWorks.description', { customerNoun, b: bold })}
            </p>
          </div>

          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {howItWorksSteps.map((key, i) => (
              <div
                key={key}
                className="rounded-2xl border border-border bg-card p-7 transition hover:-translate-y-0.5"
                style={{ boxShadow: 'var(--shadow-sm)' }}
              >
                <span
                  className="mb-4 inline-flex size-9 items-center justify-center rounded-lg font-mono text-xs font-bold text-primary"
                  style={{ backgroundColor: niche.palette.tint100 }}
                >
                  {String(i + 1).padStart(2, '0')}
                </span>
                <h3 className="text-lg font-bold text-foreground">
                  {t(`howItWorks.steps.${key}.title`, {
                    customerNoun: customerNoun.charAt(0).toUpperCase() + customerNoun.slice(1),
                  })}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {t(`howItWorks.steps.${key}.body`, {
                    customerNoun: customerNoun.charAt(0).toUpperCase() + customerNoun.slice(1),
                    appointmentNoun,
                  })}
                </p>
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
                {t('benefits.eyebrow')}
              </p>
              <h2 className="mt-4 text-4xl font-extrabold text-foreground">
                {t.rich('benefits.heading', { highlight })}
              </h2>
            </div>
            <p className="text-base leading-relaxed text-muted-foreground">
              {t.rich('benefits.description', { b: bold })}
            </p>
          </div>

          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {benefitItems.map((key) => (
              <div key={key} className="rounded-2xl border border-border bg-card p-6">
                <div
                  className="mb-4 flex size-8 items-center justify-center rounded-lg text-sm font-bold text-primary"
                  style={{ backgroundColor: niche.palette.tint100 }}
                >
                  ✓
                </div>
                <h3 className="font-bold text-foreground">
                  {t(`benefits.items.${key}.title`, {
                    customerNoun: customerNoun.charAt(0).toUpperCase() + customerNoun.slice(1),
                  })}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {t(`benefits.items.${key}.body`, { customerNoun })}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PREÇOS */}
      <section id="precos" className="border-b border-border/60 bg-muted/40 py-20">
        <div className="mx-auto max-w-2xl px-6 text-center">
          <p className="text-xs font-semibold tracking-wide text-primary uppercase">
            {t('pricing.eyebrow')}
          </p>
          <h2 className="mt-4 text-4xl font-extrabold text-foreground">
            {t.rich('pricing.heading', { highlight })}
          </h2>
          <p className="mt-4 text-base text-muted-foreground">{t('pricing.description')}</p>
        </div>

        <div
          className="mx-auto mt-10 max-w-md rounded-3xl border-2 bg-card p-8"
          style={{ borderColor: niche.palette.tint100, boxShadow: 'var(--shadow-lg)' }}
        >
          <p className="text-sm font-semibold text-primary">{t('pricing.planName')}</p>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-5xl font-extrabold text-foreground">
              {formatBRL(proPriceCents)}
            </span>
            <span className="text-sm text-muted-foreground">{t('pricing.perMonth')}</span>
          </div>
          <ul className="mt-6 flex flex-col gap-3 text-sm text-foreground/90">
            {pricingFeatures.map((key) => (
              <li key={key} className="flex items-start gap-2.5">
                <span className="mt-0.5 text-primary">✓</span>
                {t(`pricing.features.${key}`)}
              </li>
            ))}
          </ul>
          <Link
            href="/cadastro"
            className="mt-7 flex h-12 w-full items-center justify-center rounded-xl bg-primary text-base font-semibold text-primary-foreground transition hover:opacity-90"
          >
            {t('pricing.cta')}
          </Link>
          <p className="mt-3 text-center text-xs text-muted-foreground">
            {t('pricing.disclaimer')}
          </p>
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
              {t('cta.eyebrow')}
            </p>
            <h2 className="mx-auto mt-4 max-w-xl text-4xl font-extrabold">{t('cta.heading')}</h2>
            <p className="mx-auto mt-4 max-w-lg text-white/85">
              {t('cta.description', { professionalNoun })}
            </p>
            <Link
              href="/cadastro"
              className="mt-8 inline-flex h-12 items-center justify-center rounded-xl bg-white px-7 text-base font-semibold text-foreground transition hover:opacity-90"
              style={{ color: niche.palette.darker }}
            >
              {t('cta.button')}
            </Link>
            <p className="mt-4 text-xs text-white/70">{t('cta.disclaimer')}</p>
          </div>
        </div>
      </section>
    </>
  )
}
