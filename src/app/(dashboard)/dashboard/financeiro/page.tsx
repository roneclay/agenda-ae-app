import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getCurrentProfessional } from '@/lib/auth/session'
import { NICHES } from '@/lib/config/niches'
import { ActivateProButton, CancelSubButton } from './buttons'

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

  const priceLabel = formatBRL(NICHES[pro.niche].proPriceCents)
  const { trial, assinatura } = await searchParams
  const isActive = pro.subscriptionStatus === 'active'
  const trialExpired = pro.trialEndsAt ? new Date() > pro.trialEndsAt : true

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Financeiro</h1>
        <p className="text-muted-foreground">Assinatura e plano.</p>
      </div>

      {trial === 'expirado' && !isActive && (
        <div className="rounded-xl border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
          Seu período de trial encerrou. Assine o plano Pro para continuar usando o Agendadinho.
        </div>
      )}

      {assinatura === 'ok' && (
        <div className="rounded-xl border border-green-500/50 bg-green-500/10 p-4 text-sm text-green-700">
          Pagamento confirmado! Seu plano Pro está ativo.
        </div>
      )}

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Plano atual</CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">
              Status: <Badge variant="outline">{pro.subscriptionStatus}</Badge>
            </p>
          </div>
          <Badge>{pro.plan.toUpperCase()}</Badge>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          {pro.subscriptionStatus === 'trial' && pro.trialEndsAt && !trialExpired && (
            <p className="text-muted-foreground">
              Seu trial termina em {pro.trialEndsAt.toLocaleDateString('pt-BR')}.
            </p>
          )}

          {!isActive ? (
            <div className="space-y-2">
              <p>Plano Pro: agendamentos ilimitados e lembretes automáticos.</p>
              <ActivateProButton priceLabel={priceLabel} />
            </div>
          ) : (
            <div className="space-y-2">
              {pro.trialEndsAt && (
                <p className="text-muted-foreground">
                  Acesso garantido até {pro.trialEndsAt.toLocaleDateString('pt-BR')}.
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
