import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getCurrentProfessional } from '@/lib/auth/session'
import { WhatsAppSimulator } from './simulator'

export default async function WhatsAppPage() {
  const pro = await getCurrentProfessional()
  if (!pro) return null

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Simulador WhatsApp</h1>
        <p className="text-muted-foreground">
          Teste localmente o bot de IA que atende seus clientes. Em modo MOCK, respostas são geradas
          por regras locais.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Conversa simulada</CardTitle>
        </CardHeader>
        <CardContent>
          <WhatsAppSimulator slug={pro.slug} />
        </CardContent>
      </Card>
    </div>
  )
}
