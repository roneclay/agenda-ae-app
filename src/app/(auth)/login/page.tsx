'use client'

import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { Suspense, useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { signIn } from '@/lib/auth/client'
import { authErrorKey } from '@/lib/auth/error-messages'

function LoginForm() {
  const t = useTranslations('auth')
  const router = useRouter()
  const search = useSearchParams()
  const redirect = search.get('redirect') ?? '/dashboard'
  const [loading, setLoading] = useState(false)

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)

    const form = new FormData(e.currentTarget)
    const email = String(form.get('email') ?? '').trim()
    const password = String(form.get('password') ?? '')

    const { error } = await signIn.email({ email, password })
    setLoading(false)

    if (error) {
      toast.error(t(`errors.${authErrorKey(error.message, 'genericLogin')}`))
      return
    }
    router.push(redirect)
    router.refresh()
  }

  return (
    <form onSubmit={onSubmit}>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">{t('login.emailLabel')}</Label>
          <Input id="email" name="email" type="email" required autoComplete="email" />
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">{t('login.passwordLabel')}</Label>
            <Link href="/resetar-senha" className="text-xs text-muted-foreground underline">
              {t('login.forgotPassword')}
            </Link>
          </div>
          <Input
            id="password"
            name="password"
            type="password"
            required
            autoComplete="current-password"
          />
        </div>
      </CardContent>
      <CardFooter className="flex flex-col gap-3">
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? t('login.submitting') : t('login.submit')}
        </Button>
        <p className="text-center text-sm text-muted-foreground">
          {t('login.noAccount')}{' '}
          <Link href="/cadastro" className="underline">
            {t('login.createAccount')}
          </Link>
        </p>
      </CardFooter>
    </form>
  )
}

export default function LoginPage() {
  const t = useTranslations('auth')
  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('login.title')}</CardTitle>
        <CardDescription>{t('login.description')}</CardDescription>
      </CardHeader>
      <Suspense fallback={null}>
        <LoginForm />
      </Suspense>
    </Card>
  )
}
