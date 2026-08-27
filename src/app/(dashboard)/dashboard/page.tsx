import { and, eq, gte, lte, ne } from 'drizzle-orm'
import Link from 'next/link'
import { getTranslations } from 'next-intl/server'
import { CancelAppointmentButton } from '@/components/dashboard/cancel-appointment'
import { Badge } from '@/components/ui/badge'
import { buttonVariants } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getCurrentProfessional } from '@/lib/auth/session'
import { NICHES } from '@/lib/config/niches'
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

export default async function DashboardPage() {
  const pro = await getCurrentProfessional()
  if (!pro) return null

  const t = await getTranslations('dashboard.home')
  const tStatus = await getTranslations('dashboard.appointmentStatus')
  const niche = NICHES[pro.niche]
  const start = new Date()
  start.setHours(0, 0, 0, 0)
  const end = new Date(start)
  end.setDate(end.getDate() + 1)

  const todayAppointments = await db
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
          <h1 className="text-3xl font-semibold tracking-tight">{t('title')}</h1>
          <p className="text-muted-foreground">
            {start.toLocaleDateString('pt-BR', {
              weekday: 'long',
              day: '2-digit',
              month: 'long',
            })}
          </p>
        </div>
        <Link
          href={`/agendar/${pro.slug}`}
          target="_blank"
          className={buttonVariants({ variant: 'outline' })}
        >
          {t('publicLink')}
        </Link>
      </div>

      {todayAppointments.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            {t('emptyState', { appointmentNoun: niche.appointmentNoun })}
            <div className="mt-3 font-mono text-sm text-foreground">/agendar/{pro.slug}</div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3">
          {todayAppointments.map((a) => (
            <Card key={a.id}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-base">
                  {formatTime(a.scheduledAt)} — {a.customerName ?? t('customerFallback')}
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{tStatus(a.status)}</Badge>
                  <CancelAppointmentButton id={a.id} />
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
