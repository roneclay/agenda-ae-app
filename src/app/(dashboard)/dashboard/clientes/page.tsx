import { eq } from 'drizzle-orm'
import { Card, CardContent } from '@/components/ui/card'
import { getCurrentProfessional } from '@/lib/auth/session'
import { customer, db } from '@/lib/db'

export default async function ClientesPage() {
  const pro = await getCurrentProfessional()
  if (!pro) return null

  const customers = await db.select().from(customer).where(eq(customer.professionalId, pro.id))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Clientes</h1>
        <p className="text-muted-foreground">Histórico e contatos.</p>
      </div>

      {customers.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            Nenhum cliente cadastrado ainda.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3">
          {customers.map((c) => (
            <Card key={c.id}>
              <CardContent className="flex items-center justify-between py-4">
                <div>
                  <p className="font-medium">{c.name ?? 'Sem nome'}</p>
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
