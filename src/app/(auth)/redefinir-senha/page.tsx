'use client'

import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { Suspense, useState } from 'react'
import { toast } from 'sonner'
import { Button, buttonVariants } from '@/components/ui/button'
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
import { authClient } from '@/lib/auth/client'
import { authErrorKey } from '@/lib/auth/error-messages'

function ResetForm() {
  const t = useTranslations('auth')
  const router = useRouter()
  const search = useSearchParams()
  const token = search.get('token') ?? ''
  const [loading, setLoading] = useState(false)

  if (!token) {
    return (
      <CardContent className="space-y-3 text-sm">
        <p className="text-destructive">{t('resetPassword.missingToken')}</p>
        <Link href="/resetar-senha" className={buttonVariants({ variant: 'outline' })}>
          {t('resetPassword.requestNewLink')}
        </Link>
      </CardContent>
    )
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    const form = new FormData(e.currentTarget)
    const newPassword = String(form.get('password') ?? '')

    const { error } = await authClient.resetPassword({ newPassword, token })
    setLoading(false)
    if (error) {
      toast.error(t(`errors.${authErrorKey(error.message, 'genericResetPassword')}`))
      return
    }
    toast.success(t('resetPassword.success'))
    router.push('/login')
  }

  return (
    <form onSubmit={onSubmit}>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="password">{t('resetPassword.newPasswordLabel')}</Label>
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
      <CardFooter>
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? t('resetPassword.submitting') : t('resetPassword.submit')}
        </Button>
      </CardFooter>
    </form>
  )
}

export default function RedefinirSenhaPage() {
  const t = useTranslations('auth')
  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('resetPassword.title')}</CardTitle>
        <CardDescription>{t('resetPassword.description')}</CardDescription>
      </CardHeader>
      <Suspense fallback={null}>
        <ResetForm />
      </Suspense>
    </Card>
  )
}
