import { notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { BookingWizard } from '@/components/booking/booking-wizard'
import { JsonLd } from '@/components/json-ld'
import { SupportFooter } from '@/components/support-footer'
import { NICHES } from '@/lib/config/niches'
import { getPublicProfessional } from '@/lib/public-professional'
import { absoluteUrl, buildPageMetadata } from '@/lib/seo'
import { professionalJsonLd } from '@/lib/structured-data'

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const data = await getPublicProfessional(slug)
  if (!data) return buildPageMetadata(`/agendar/${slug}`, { noindex: true })

  const t = await getTranslations('meta.agendar')
  const niche = NICHES[data.pro.niche]
  const names = data.services.slice(0, 3).map((s) => s.name)
  const description = names.length
    ? t('descriptionWithServices', {
        name: data.pro.name,
        services: new Intl.ListFormat('pt-BR', { style: 'long', type: 'conjunction' }).format(
          names,
        ),
      })
    : t('descriptionNoServices', { name: data.pro.name })

  return buildPageMetadata(`/agendar/${slug}`, {
    title: t('title', { name: data.pro.name, brandName: niche.brandName }),
    description,
    noindex: !data.ready,
  })
}

export default async function AgendarPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const t = await getTranslations('agendarPage')

  const data = await getPublicProfessional(slug)
  if (!data) notFound()
  const { pro, billingBlocked, services, ready } = data

  if (billingBlocked) {
    return (
      <div className="flex min-h-screen flex-col">
        <div className="mx-auto flex flex-1 max-w-xl items-center justify-center px-6 text-center">
          <div>
            <h1 className="text-2xl font-semibold">{pro.name}</h1>
            <p className="mt-3 text-muted-foreground">{t('pausedMessage')}</p>
          </div>
        </div>
        <SupportFooter />
      </div>
    )
  }

  const niche = NICHES[pro.niche]

  if (!ready) {
    return (
      <div className="flex min-h-screen flex-col">
        <div className="mx-auto flex flex-1 max-w-xl items-center justify-center px-6 text-center">
          <div>
            <h1 className="text-2xl font-semibold">{pro.name}</h1>
            <p className="mt-3 text-muted-foreground">
              {t('notReadyMessage', {
                article: niche.professionalNoun === 'profissional' ? '' : 'a',
                professionalNoun: niche.professionalNoun,
              })}
            </p>
          </div>
        </div>
        <SupportFooter />
      </div>
    )
  }

  const jsonLd = professionalJsonLd({
    url: absoluteUrl(`/agendar/${pro.slug}`),
    name: pro.name,
    bio: pro.bio,
    services,
  })

  return (
    <div className="flex min-h-screen flex-col">
      <JsonLd data={jsonLd} />
      <div className="mx-auto w-full max-w-2xl flex-1 px-6 py-12">
        <header className="mb-8">
          <h1 className="text-3xl font-semibold tracking-tight">{pro.name}</h1>
          {pro.bio && <p className="mt-2 text-muted-foreground">{pro.bio}</p>}
        </header>

        {services.length === 0 ? (
          <p className="text-muted-foreground">{t('noServicesMessage')}</p>
        ) : (
          <BookingWizard
            slug={pro.slug}
            services={services}
            appointmentNoun={niche.appointmentNoun}
          />
        )}
      </div>
      <SupportFooter />
    </div>
  )
}
