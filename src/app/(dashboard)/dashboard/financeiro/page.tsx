import { getTranslations } from 'next-intl/server'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getCurrentProfessional } from '@/lib/auth/session'
import { getProPriceCents } from '@/lib/config/settings'
import { ActivateProButton, CancelSubButton, PixCheckoutButton } from './buttons'

function formatBRL(cents: number) {
  return (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

export default async function FinanceiroPage({
  searchParams,
}: {
  searchParams: Promise<{ trial?: string; assinatura?: string }>
}) {
  const pro = await getCurrentProfessional()
  if (!pro) return null

  const t = await getTranslations('financeiro')
  const tStatus = await getTranslations('financeiro.subscriptionStatus')
  const priceLabel = formatBRL(await getProPriceCents())
  const { trial, assinatura } = await searchParams
  const isActive = pro.subscriptionStatus === 'active'
  const trialExpired = pro.trialEndsAt ? new Date() > pro.trialEndsAt : true

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">{t('title')}</h1>
        <p className="text-muted-foreground">{t('subtitle')}</p>
      </div>

      {trial === 'expirado' && !isActive && (
        <div className="rounded-xl border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
          {t('trialExpiredBanner')}
        </div>
      )}

      {assinatura === 'ok' && (
        <div className="rounded-xl border border-green-500/50 bg-green-500/10 p-4 text-sm text-green-700">
          {t('paymentConfirmedBanner')}
        </div>
      )}

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>{t('currentPlan')}</CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">
              {t('statusLabel')} <Badge variant="outline">{tStatus(pro.subscriptionStatus)}</Badge>
            </p>
          </div>
          <Badge>{pro.plan === 'pro' ? 'PRO' : t('planFree')}</Badge>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          {pro.subscriptionStatus === 'trial' && pro.trialEndsAt && !trialExpired && (
            <p className="text-muted-foreground">
              {t('trialEndsAt', { date: pro.trialEndsAt.toLocaleDateString('pt-BR') })}
            </p>
          )}

          {!isActive ? (
            <div className="space-y-2">
              <p>{t('proDescription')}</p>
              <div className="flex flex-col gap-2">
                <ActivateProButton priceLabel={priceLabel} />
                <PixCheckoutButton priceLabel={priceLabel} />
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              {pro.trialEndsAt && (
                <p className="text-muted-foreground">
                  {t('accessUntil', { date: pro.trialEndsAt.toLocaleDateString('pt-BR') })}
                </p>
              )}
              <CancelSubButton />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
