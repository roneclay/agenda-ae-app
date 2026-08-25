'use client'

import { useTransition } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { deleteService, toggleService } from './actions'

export function ServiceActions({ id, isActive }: { id: string; isActive: boolean }) {
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
            toast.success(isActive ? 'Desativado' : 'Ativado')
          })
        }
      >
        {isActive ? 'Desativar' : 'Ativar'}
      </Button>
      <Button
        size="sm"
        variant="destructive"
        disabled={pending}
        onClick={() => {
          if (!confirm('Excluir este serviço?')) return
          start(async () => {
            await deleteService(id)
            toast.success('Excluído')
          })
        }}
      >
        Excluir
      </Button>
    </div>
  )
}
