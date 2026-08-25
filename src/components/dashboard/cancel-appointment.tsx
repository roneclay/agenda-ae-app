'use client'

import { useRouter } from 'next/navigation'
import { useTransition } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'

export function CancelAppointmentButton({ id }: { id: string }) {
  const router = useRouter()
  const [pending, start] = useTransition()
  return (
    <Button
      variant="ghost"
      size="sm"
      disabled={pending}
      onClick={() => {
        if (!confirm('Cancelar este agendamento?')) return
        start(async () => {
          const res = await fetch(`/api/appointments/${id}`, { method: 'DELETE' })
          if (!res.ok) {
            toast.error('Erro ao cancelar')
            return
          }
          toast.success('Cancelado')
          router.refresh()
        })
      }}
    >
      Cancelar
    </Button>
  )
}
