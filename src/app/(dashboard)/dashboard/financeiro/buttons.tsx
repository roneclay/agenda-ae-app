'use client'

import { useTransition } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { activateProMock, cancelSubscriptionMock } from './actions'

export function ActivateProButton() {
  const [pending, start] = useTransition()
  return (
    <Button
      disabled={pending}
      onClick={() =>
        start(async () => {
          await activateProMock()
          toast.success('Plano Pro ativado (mock)')
        })
      }
    >
      {pending ? 'Processando...' : 'Assinar Pro — R$ 49/mês'}
    </Button>
  )
}

export function CancelSubButton() {
  const [pending, start] = useTransition()
  return (
    <Button
      variant="destructive"
      disabled={pending}
      onClick={() => {
        if (!confirm('Cancelar assinatura?')) return
        start(async () => {
          await cancelSubscriptionMock()
          toast.success('Assinatura cancelada')
        })
      }}
    >
      Cancelar assinatura
    </Button>
  )
}
