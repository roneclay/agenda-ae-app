import { eq } from 'drizzle-orm'
import { getTranslations } from 'next-intl/server'
import { NICHES } from '@/lib/config/niches'
import { appointment, appointmentService, customer, db, professional, service } from '@/lib/db'
import { cancelAppointment, confirmAppointment, rescheduleAppointment } from './actions'

function formatBRL(cents: number) {
  return (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

export default async function ConfirmarPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const t = await getTranslations('confirmPage')

  const [appt] = await db
    .select({
      id: appointment.id,
      status: appointment.status,
      scheduledAt: appointment.scheduledAt,
      totalCents: appointment.totalCents,
      customerName: customer.name,
      professionalName: professional.name,
      professionalSlug: professional.slug,
      niche: professional.niche,
    })
    .from(appointment)
    .innerJoin(customer, eq(customer.id, appointment.customerId))
    .innerJoin(professional, eq(professional.id, appointment.professionalId))
    .where(eq(appointment.id, id))
    .limit(1)

  if (!appt) {
    return (
      <div className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center px-6 text-center">
        <h1 className="text-xl font-bold text-foreground">{t('notFoundTitle')}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{t('notFoundDescription')}</p>
      </div>
    )
  }

  const services = await db
    .select({ name: service.name })
    .from(appointmentService)
    .innerJoin(service, eq(service.id, appointmentService.serviceId))
    .where(eq(appointmentService.appointmentId, appt.id))

  const niche = NICHES[appt.niche]
  const friendlyDate = appt.scheduledAt.toLocaleString('pt-BR', {
    timeZone: 'America/Sao_Paulo',
    dateStyle: 'full',
    timeStyle: 'short',
  })

  const canManage = appt.status === 'scheduled' || appt.status === 'confirmed'

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-16">
      <div
        className="rounded-3xl border-2 bg-card p-8 text-center"
        style={{ borderColor: niche.palette.tint100 }}
      >
        <p className="text-xs font-semibold tracking-wide text-primary uppercase">
          {appt.professionalName}
        </p>
        <h1 className="mt-2 text-2xl font-extrabold text-foreground">
          {services.map((s) => s.name).join(', ') || t('defaultTitle')}
        </h1>
        <p className="mt-3 text-base text-muted-foreground">{friendlyDate}</p>
        <p className="mt-1 text-sm text-muted-foreground">{formatBRL(appt.totalCents)}</p>

        <div className="mt-8 flex flex-col gap-3">
          {appt.status === 'confirmed' && (
            <p className="font-semibold text-primary">
              {t('confirmedMessage', { customerName: appt.customerName ?? '' })}
            </p>
          )}
          {appt.status === 'cancelled' && (
            <p className="font-semibold text-muted-foreground">{t('cancelledMessage')}</p>
          )}
          {(appt.status === 'completed' || appt.status === 'no_show') && (
            <p className="font-semibold text-muted-foreground">{t('closedMessage')}</p>
          )}

          {appt.status === 'scheduled' && (
            <form action={confirmAppointment.bind(null, appt.id)}>
              <button
                type="submit"
                className="flex h-12 w-full items-center justify-center rounded-xl bg-primary text-base font-semibold text-primary-foreground transition hover:opacity-90"
              >
                {t('confirmButton')}
              </button>
              <p className="mt-3 text-xs text-muted-foreground">{t('confirmNote')}</p>
            </form>
          )}

          {canManage && (
            <div className="flex gap-3">
              <form
                action={rescheduleAppointment.bind(null, appt.id, appt.professionalSlug)}
                className="flex-1"
              >
                <button
                  type="submit"
                  className="flex h-11 w-full items-center justify-center rounded-xl border border-border bg-background text-sm font-semibold text-foreground transition hover:bg-muted"
                >
                  {t('rescheduleButton')}
                </button>
              </form>
              <form action={cancelAppointment.bind(null, appt.id)} className="flex-1">
                <button
                  type="submit"
                  className="flex h-11 w-full items-center justify-center rounded-xl border border-destructive/40 bg-background text-sm font-semibold text-destructive transition hover:bg-destructive/10"
                >
                  {t('cancelButton')}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
