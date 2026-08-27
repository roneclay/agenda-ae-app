'use client'

import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { useTransition } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'

export function CancelAppointmentButton({ id }: { id: string }) {
  const t = useTranslations('dashboard.cancelAppointment')
  const router = useRouter()
  const [pending, start] = useTransition()
  return (
    <Button
      variant="ghost"
      size="sm"
      disabled={pending}
      onClick={() => {
        if (!confirm(t('confirm'))) return
        start(async () => {
          const res = await fetch(`/api/appointments/${id}`, { method: 'DELETE' })
          if (!res.ok) {
            toast.error(t('error'))
            return
          }
          toast.success(t('success'))
          router.refresh()
        })
      }}
    >
      {t('button')}
    </Button>
  )
}
