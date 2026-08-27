'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { signUp } from '@/lib/auth/client'
import { authErrorKey } from '@/lib/auth/error-messages'

export default function CadastroPage() {
  const t = useTranslations('auth')
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)

    const form = new FormData(e.currentTarget)
    const name = String(form.get('name') ?? '').trim()
    const email = String(form.get('email') ?? '').trim()
    const password = String(form.get('password') ?? '')

    const check = await fetch('/api/auth/check-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    })
    if (check.ok && (await check.json()).exists) {
      setLoading(false)
      toast.error(t('signup.emailAlreadyRegistered'))
      return
    }

    const { error } = await signUp.email({ name, email, password, callbackURL: '/dashboard' })
    setLoading(false)

    if (error) {
      toast.error(t(`errors.${authErrorKey(error.message, 'genericSignup')}`))
      return
    }
    toast.success(t('signup.accountCreated'))
    router.push(`/verificar-email?email=${encodeURIComponent(email)}`)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('signup.title')}</CardTitle>
      </CardHeader>
      <form onSubmit={onSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">{t('signup.nameLabel')}</Label>
            <Input id="name" name="name" required autoComplete="name" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">{t('signup.emailLabel')}</Label>
            <Input id="email" name="email" type="email" required autoComplete="email" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">{t('signup.passwordLabel')}</Label>
            <Input
              id="password"
              name="password"
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
            />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-3">
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? t('signup.submitting') : t('signup.submit')}
          </Button>
          <p className="text-center text-sm text-muted-foreground">
            {t('signup.alreadyHaveAccount')}{' '}
            <Link href="/login" className="underline">
              {t('signup.login')}
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  )
}
