'use client'

import { useTransition } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { cancelSubscription, createCheckout } from './actions'

export function ActivateProButton({ priceLabel }: { priceLabel: string }) {
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
      {pending ? 'Redirecionando...' : `Assinar Pro — ${priceLabel}/mês`}
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
          await cancelSubscription()
          toast.success('Assinatura cancelada')
        })
      }}
    >
      Cancelar assinatura
    </Button>
  )
}
