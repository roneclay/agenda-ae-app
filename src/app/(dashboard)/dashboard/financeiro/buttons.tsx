'use client'

import { useTransition } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { createCheckout, cancelSubscriptionMock } from './actions'

export function ActivateProButton() {
  const [pending, start] = useTransition()
  return (
    <Button
      disabled={pending}
      onClick={() =>
        start(async () => {
          const result = await createCheckout()
          if (result.error) {
            toast.error(result.error)
            return
          }
          if (result.url) window.location.href = result.url
        })
      }
    >
      {pending ? 'Redirecionando...' : 'Assinar Pro — R$ 49/mês'}
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
