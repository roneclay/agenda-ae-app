import { eq } from 'drizzle-orm'
import { getTranslations } from 'next-intl/server'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getCurrentProfessional } from '@/lib/auth/session'
import { db, service } from '@/lib/db'
import { ServiceActions } from './service-actions'
import { ServiceFormDialog } from './service-form'

function formatBRL(cents: number) {
  return (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

export default async function ServicosPage() {
  const pro = await getCurrentProfessional()
  if (!pro) return null

  const t = await getTranslations('dashboard.servicos')
  const services = await db.select().from(service).where(eq(service.professionalId, pro.id))

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">{t('title')}</h1>
          <p className="text-muted-foreground">{t('subtitle')}</p>
        </div>
        <ServiceFormDialog trigger={<Button>{t('newService')}</Button>} />
      </div>

      {services.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            {t('emptyState')}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3">
          {services.map((s) => (
            <Card key={s.id}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-base">{s.name}</CardTitle>
                <div className="flex items-center gap-2">
                  {!s.isActive && <Badge variant="outline">{t('inactive')}</Badge>}
                  <ServiceFormDialog
                    service={s}
                    trigger={
                      <Button size="sm" variant="ghost">
                        {t('edit')}
                      </Button>
                    }
                  />
                  <ServiceActions id={s.id} isActive={s.isActive} />
                </div>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                {s.description && <p className="mb-1">{s.description}</p>}
                {s.durationMinutes} min · {formatBRL(s.priceCents)}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
