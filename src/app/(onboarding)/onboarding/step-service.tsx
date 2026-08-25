'use client'

import { useActionState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { type ServiceState, saveFirstService } from './actions'

export function ServiceStep() {
  const [state, action, pending] = useActionState<ServiceState, FormData>(saveFirstService, {})

  return (
    <Card>
      <form action={action}>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground">
              Cadastre seu primeiro serviço. Você pode adicionar mais depois em{' '}
              <span className="font-medium text-foreground">Serviços</span>.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Nome do serviço</Label>
            <Input id="name" name="name" required placeholder="Ex: Unhas em gel" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="priceReais">Preço (R$)</Label>
              <Input
                id="priceReais"
                name="priceReais"
                required
                placeholder="80,00"
                inputMode="decimal"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="durationMinutes">Duração (min)</Label>
              <Input
                id="durationMinutes"
                name="durationMinutes"
                type="number"
                required
                min={5}
                max={600}
                defaultValue={60}
              />
            </div>
          </div>

          {state.error && <p className="text-sm text-destructive">{state.error}</p>}
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? 'Salvando...' : 'Continuar'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
