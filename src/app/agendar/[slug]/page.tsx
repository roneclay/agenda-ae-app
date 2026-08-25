import { and, eq } from 'drizzle-orm'
import { notFound } from 'next/navigation'
import { BookingWizard } from '@/components/booking/booking-wizard'
import { NICHES } from '@/lib/config/niches'
import { db, professional, service, weeklyScheduleWindow } from '@/lib/db'

export default async function AgendarPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params

  const [pro] = await db.select().from(professional).where(eq(professional.slug, slug)).limit(1)

  if (!pro) notFound()

  const services = await db
    .select()
    .from(service)
    .where(and(eq(service.professionalId, pro.id), eq(service.isActive, true)))

  const niche = NICHES[pro.niche]

  const [anyWindow] = await db
    .select({ id: weeklyScheduleWindow.id })
    .from(weeklyScheduleWindow)
    .where(eq(weeklyScheduleWindow.professionalId, pro.id))
    .limit(1)

  const hasHours = !!anyWindow
  const hasActiveServices = services.length > 0
  const ready = pro.isAcceptingBookings && hasHours && hasActiveServices

  if (!ready) {
    return (
      <div className="mx-auto flex min-h-screen max-w-xl items-center justify-center px-6 text-center">
        <div>
          <h1 className="text-2xl font-semibold">{pro.name}</h1>
          <p className="mt-3 text-muted-foreground">
            Esse{niche.professionalNoun === 'profissional' ? '' : 'a'} {niche.professionalNoun}{' '}
            ainda está configurando a agenda. Volta em breve! 🧡
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto min-h-screen max-w-2xl px-6 py-12">
      <header className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight">{pro.name}</h1>
        {pro.bio && <p className="mt-2 text-muted-foreground">{pro.bio}</p>}
      </header>

      {services.length === 0 ? (
        <p className="text-muted-foreground">
          Este profissional ainda não cadastrou serviços disponíveis.
        </p>
      ) : (
        <BookingWizard
          slug={pro.slug}
          services={services}
          appointmentNoun={niche.appointmentNoun}
        />
      )}
    </div>
  )
}
