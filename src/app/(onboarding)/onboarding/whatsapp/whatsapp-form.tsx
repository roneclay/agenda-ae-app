'use client'

import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { authClient } from '@/lib/auth/client'
import { isValidPhoneBR, maskPhoneBR, toE164BR } from '@/lib/phone'

export function WhatsappForm() {
  const t = useTranslations('onboarding.whatsappStep')
  const router = useRouter()
  const [phoneDisplay, setPhoneDisplay] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')

    if (!isValidPhoneBR(phoneDisplay)) {
      setError(t('invalid'))
      return
    }

    setLoading(true)
    const e164 = toE164BR(phoneDisplay)

    const check = await fetch('/api/check-phone', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: e164 }),
    })
    if (!check.ok) {
      setLoading(false)
      const body = await check.json().catch(() => ({}))
      setError(body.error === 'phoneTaken' ? t('taken') : t('genericError'))
      return
    }

    const { error: updateError } = await authClient.updateUser({ phone: e164 })
    setLoading(false)

    if (updateError) {
      setError(t('genericError'))
      return
    }

    router.push('/onboarding')
    router.refresh()
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('title')}</CardTitle>
        <p className="text-sm text-muted-foreground">{t('description')}</p>
      </CardHeader>
      <form onSubmit={onSubmit}>
        <CardContent className="space-y-2">
          <Label htmlFor="phone">{t('label')}</Label>
          <Input
            id="phone"
            name="phone"
            required
            placeholder="(48) 99999-8888"
            inputMode="tel"
            maxLength={15}
            value={phoneDisplay}
            onChange={(e) => setPhoneDisplay(maskPhoneBR(e.target.value))}
          />
          {error && <p className="text-sm text-destructive">{error}</p>}
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? t('saving') : t('continue')}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
