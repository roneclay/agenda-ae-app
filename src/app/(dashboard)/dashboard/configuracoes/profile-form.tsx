'use client'

import { useTranslations } from 'next-intl'
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
  const t = useTranslations('dashboard.configuracoes')
  const [state, action, pending] = useActionState<ConfigState, FormData>(updateProfile, {})
  const [togglePending, startToggle] = useTransition()

  useEffect(() => {
    if (state.ok) toast.success(t('profileUpdated'))
    else if (state.error) toast.error(state.error)
  }, [state, t])

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>{t('acceptingTitle')}</CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">{t('acceptingDescription')}</p>
          </div>
          <Button
            variant={pro.isAcceptingBookings ? 'destructive' : 'default'}
            disabled={togglePending}
            onClick={() =>
              startToggle(async () => {
                await toggleAcceptingBookings()
                toast.success(t('toggled'))
              })
            }
          >
            {pro.isAcceptingBookings ? t('pause') : t('resume')}
          </Button>
        </CardHeader>
      </Card>

      <Card>
        <form action={action}>
          <CardHeader>
            <CardTitle>{t('profileTitle')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">{t('nameLabel')}</Label>
              <Input id="name" name="name" required defaultValue={pro.name} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">{t('bioLabel')}</Label>
              <Textarea id="bio" name="bio" rows={2} defaultValue={pro.bio ?? ''} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="phone">{t('whatsappLabel')}</Label>
                <Input id="phone" name="phone" defaultValue={pro.phone ?? ''} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">{t('addressLabel')}</Label>
                <Input id="address" name="address" defaultValue={pro.address ?? ''} />
              </div>
            </div>

            <Button type="submit" disabled={pending}>
              {pending ? t('saving') : t('save')}
            </Button>
          </CardContent>
        </form>
      </Card>
    </div>
  )
}
