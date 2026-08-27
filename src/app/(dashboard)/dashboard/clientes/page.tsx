import { eq } from 'drizzle-orm'
import { getTranslations } from 'next-intl/server'
import { Card, CardContent } from '@/components/ui/card'
import { getCurrentProfessional } from '@/lib/auth/session'
import { customer, db } from '@/lib/db'

export default async function ClientesPage() {
  const pro = await getCurrentProfessional()
  if (!pro) return null

  const t = await getTranslations('dashboard.clientes')
  const customers = await db.select().from(customer).where(eq(customer.professionalId, pro.id))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">{t('title')}</h1>
        <p className="text-muted-foreground">{t('subtitle')}</p>
      </div>

      {customers.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            {t('emptyState')}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3">
          {customers.map((c) => (
            <Card key={c.id}>
              <CardContent className="flex items-center justify-between py-4">
                <div>
                  <p className="font-medium">{c.name ?? t('noName')}</p>
                  <p className="text-sm text-muted-foreground">{c.whatsappId}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
