import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getCurrentProfessional } from '@/lib/auth/session'
import { ActivateProButton, CancelSubButton } from './buttons'

export default async function FinanceiroPage() {
  const pro = await getCurrentProfessional()
  if (!pro) return null

  const isActive = pro.subscriptionStatus === 'active'
  const isMock = process.env.PAYMENT_MOCK === 'true'

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Financeiro</h1>
        <p className="text-muted-foreground">Assinatura e plano.</p>
      </div>

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
          {pro.subscriptionStatus === 'trial' && pro.trialEndsAt && (
            <p className="text-muted-foreground">
              Seu trial termina em {pro.trialEndsAt.toLocaleDateString('pt-BR')}.
            </p>
          )}

          {!isActive ? (
            <div className="space-y-2">
              <p>Plano Pro: agendamentos ilimitados, lembretes automáticos, bot de IA.</p>
              <ActivateProButton />
              {isMock && (
                <p className="text-xs text-muted-foreground">
                  Modo mock: ativa imediatamente sem cobrança real.
                </p>
              )}
            </div>
          ) : (
            <CancelSubButton />
          )}
        </CardContent>
      </Card>
    </div>
  )
}
