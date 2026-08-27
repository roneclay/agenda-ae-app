'use client'

import { useTranslations } from 'next-intl'
import { useTransition } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { deleteService, toggleService } from './actions'

export function ServiceActions({ id, isActive }: { id: string; isActive: boolean }) {
  const t = useTranslations('dashboard.servicos')
  const [pending, start] = useTransition()
  return (
    <div className="flex gap-2">
      <Button
        size="sm"
        variant="ghost"
        disabled={pending}
        onClick={() =>
          start(async () => {
            await toggleService(id)
            toast.success(isActive ? t('deactivated') : t('activated'))
          })
        }
      >
        {isActive ? t('deactivate') : t('activate')}
      </Button>
      <Button
        size="sm"
        variant="destructive"
        disabled={pending}
        onClick={() => {
          if (!confirm(t('deleteConfirm'))) return
          start(async () => {
            await deleteService(id)
            toast.success(t('deleted'))
          })
        }}
      >
        {t('delete')}
      </Button>
    </div>
  )
}
