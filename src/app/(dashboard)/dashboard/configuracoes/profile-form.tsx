'use client'

import { useActionState, useEffect, useTransition } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { type ConfigState, toggleAcceptingBookings, updateProfile } from './actions'

type Pro = {
  name: string
  bio: string | null
  phone: string | null
  address: string | null
  isAcceptingBookings: boolean
  slug: string
}

export function ProfileForm({ pro }: { pro: Pro }) {
  const [state, action, pending] = useActionState<ConfigState, FormData>(updateProfile, {})
  const [togglePending, startToggle] = useTransition()

  useEffect(() => {
    if (state.ok) toast.success('Perfil atualizado')
    else if (state.error) toast.error(state.error)
  }, [state])

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Aceitando agendamentos</CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">
              Quando desativado, seu link público mostra "ainda configurando".
            </p>
          </div>
          <Button
            variant={pro.isAcceptingBookings ? 'destructive' : 'default'}
            disabled={togglePending}
            onClick={() =>
              startToggle(async () => {
                await toggleAcceptingBookings()
                toast.success('Atualizado')
              })
            }
          >
            {pro.isAcceptingBookings ? 'Pausar agenda' : 'Reabrir agenda'}
          </Button>
        </CardHeader>
      </Card>

      <Card>
        <form action={action}>
          <CardHeader>
            <CardTitle>Perfil</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome de exibição</Label>
              <Input id="name" name="name" required defaultValue={pro.name} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea id="bio" name="bio" rows={2} defaultValue={pro.bio ?? ''} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="phone">WhatsApp</Label>
                <Input id="phone" name="phone" defaultValue={pro.phone ?? ''} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Endereço</Label>
                <Input id="address" name="address" defaultValue={pro.address ?? ''} />
              </div>
            </div>

            <Button type="submit" disabled={pending}>
              {pending ? 'Salvando...' : 'Salvar alterações'}
            </Button>
          </CardContent>
        </form>
      </Card>
    </div>
  )
}
