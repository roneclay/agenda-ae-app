'use client'

import { useTranslations } from 'next-intl'
import { useActionState, useEffect, useRef } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { type ActionState, upsertService } from './actions'

type Service = {
  id: string
  name: string
  description: string | null
  priceCents: number
  durationMinutes: number
}

export function ServiceFormDialog({
  service,
  trigger,
}: {
  service?: Service
  trigger: React.ReactNode
}) {
  const t = useTranslations('dashboard.servicos')
  const [state, action, pending] = useActionState<ActionState, FormData>(upsertService, {})
  const closeRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (state.ok) {
      toast.success(service ? t('updated') : t('created'))
      closeRef.current?.click()
    } else if (state.error) {
      toast.error(state.error)
    }
  }, [state, service, t])

  return (
    <Dialog>
      <DialogTrigger render={trigger as React.ReactElement<Record<string, unknown>>} />

      <DialogContent>
        <DialogHeader>
          <DialogTitle>{service ? t('editTitle') : t('newTitle')}</DialogTitle>
        </DialogHeader>
        <form action={action} className="space-y-4">
          {service && <input type="hidden" name="id" value={service.id} />}

          <div className="space-y-2">
            <Label htmlFor="name">{t('nameLabel')}</Label>
            <Input id="name" name="name" required defaultValue={service?.name} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">{t('descriptionLabel')}</Label>
            <Textarea
              id="description"
              name="description"
              rows={2}
              defaultValue={service?.description ?? ''}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="priceReais">{t('priceLabel')}</Label>
              <Input
                id="priceReais"
                name="priceReais"
                required
                defaultValue={
                  service ? (service.priceCents / 100).toFixed(2).replace('.', ',') : ''
                }
                placeholder="80,00"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="durationMinutes">{t('durationLabel')}</Label>
              <Input
                id="durationMinutes"
                name="durationMinutes"
                type="number"
                required
                min={5}
                max={600}
                defaultValue={service?.durationMinutes ?? 60}
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <button ref={closeRef} type="button" hidden />
            <Button type="submit" disabled={pending}>
              {pending ? t('saving') : t('save')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
