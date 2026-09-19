import { and, eq, gte, lte, ne } from 'drizzle-orm'
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react'
import Link from 'next/link'
import { getTranslations } from 'next-intl/server'
import { CopyLinkButton } from '@/components/copy-link-button'
import { CancelAppointmentButton } from '@/components/dashboard/cancel-appointment'
import { Badge } from '@/components/ui/badge'
import { buttonVariants } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getCurrentProfessional } from '@/lib/auth/session'
import { brtWallToUtcMs } from '@/lib/availability'
import { NICHES } from '@/lib/config/niches'
import { addDays, todayInBRT } from '@/lib/dates'
import { appointment, customer, db } from '@/lib/db'

function formatBRL(cents: number) {
  return (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function formatTime(date: Date) {
  return date.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'America/Sao_Paulo',
  })
}

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>
}) {
  const pro = await getCurrentProfessional()
  if (!pro) return null

  const { date: dateParam } = await searchParams
  const today = todayInBRT()
  const date = dateParam && DATE_RE.test(dateParam) ? dateParam : today
  const isToday = date === today

  const t = await getTranslations('dashboard.home')
  const tStatus = await getTranslations('dashboard.appointmentStatus')
  const niche = NICHES[pro.niche]
  const publicUrl = `${process.env.NEXT_PUBLIC_APP_URL}/agendar/${pro.slug}`

  const [year, month, day] = date.split('-').map(Number)
  const start = new Date(brtWallToUtcMs(year, month, day, 0))
  const end = new Date(brtWallToUtcMs(year, month, day, 24 * 60))

  const dayAppointments = await db
    .select({
      id: appointment.id,
      scheduledAt: appointment.scheduledAt,
      durationMinutes: appointment.durationMinutes,
      totalCents: appointment.totalCents,
      status: appointment.status,
      customerName: customer.name,
    })
    .from(appointment)
    .innerJoin(customer, eq(customer.id, appointment.customerId))
    .where(
      and(
        eq(appointment.professionalId, pro.id),
        gte(appointment.scheduledAt, start),
        lte(appointment.scheduledAt, end),
        ne(appointment.status, 'cancelled'),
      ),
    )
    .orderBy(appointment.scheduledAt)

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">
            {isToday ? t('title') : t('titleOtherDay')}
          </h1>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Link
              href={`/dashboard?date=${addDays(date, -1)}`}
              className={buttonVariants({ variant: 'ghost', size: 'icon', className: 'size-7' })}
            >
              <ChevronLeftIcon className="size-4" />
              <span className="sr-only">{t('prevDay')}</span>
            </Link>
            <span>
              {start.toLocaleDateString('pt-BR', {
                weekday: 'long',
                day: '2-digit',
                month: 'long',
                timeZone: 'America/Sao_Paulo',
              })}
            </span>
            <Link
              href={`/dashboard?date=${addDays(date, 1)}`}
              className={buttonVariants({ variant: 'ghost', size: 'icon', className: 'size-7' })}
            >
              <ChevronRightIcon className="size-4" />
              <span className="sr-only">{t('nextDay')}</span>
            </Link>
            {!isToday && (
              <Link
                href="/dashboard"
                className={buttonVariants({ variant: 'outline', size: 'sm' })}
              >
                {t('goToday')}
              </Link>
            )}
          </div>
        </div>
        <Link
          href={`/agendar/${pro.slug}`}
          target="_blank"
          className={buttonVariants({ variant: 'outline' })}
        >
          {t('publicLink')}
        </Link>
      </div>

      {dayAppointments.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-12 text-center text-muted-foreground">
            {isToday ? (
              <>
                {t('emptyState', { appointmentNoun: niche.appointmentNoun })}
                <div className="select-all break-all font-mono text-sm text-foreground">
                  {publicUrl}
                </div>
                <CopyLinkButton url={publicUrl} />
              </>
            ) : (
              t('emptyStateOtherDay', { appointmentNoun: niche.appointmentNoun })
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3">
          {dayAppointments.map((a) => (
            <Card key={a.id}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-base">
                  {formatTime(a.scheduledAt)} — {a.customerName ?? t('customerFallback')}
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{tStatus(a.status)}</Badge>
                  {date >= today && <CancelAppointmentButton id={a.id} />}
                </div>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                {a.durationMinutes} min · {formatBRL(a.totalCents)}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
