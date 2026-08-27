'use client'

import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { useState } from 'react'
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

export default function ResetarSenhaPage() {
  const t = useTranslations('auth')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)

    const form = new FormData(e.currentTarget)
    const email = String(form.get('email') ?? '').trim()

    const { error } = await authClient.requestPasswordReset({
      email,
      redirectTo: '/redefinir-senha',
    })
    setLoading(false)

    if (error) {
      toast.error(t(`errors.${authErrorKey(error.message, 'genericResetRequest')}`))
      return
    }
    setSent(true)
    toast.success(t('resetPasswordRequest.success'))
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('resetPasswordRequest.title')}</CardTitle>
        <CardDescription>{t('resetPasswordRequest.description')}</CardDescription>
      </CardHeader>
      {sent ? (
        <>
          <CardContent className="text-sm text-muted-foreground">
            {t('resetPasswordRequest.sentTitle')}
          </CardContent>
          <CardFooter>
            <Link
              href="/login"
              className={buttonVariants({ variant: 'outline', className: 'w-full' })}
            >
              {t('resetPasswordRequest.backToLogin')}
            </Link>
          </CardFooter>
        </>
      ) : (
        <form onSubmit={onSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">{t('resetPasswordRequest.emailLabel')}</Label>
              <Input id="email" name="email" type="email" required autoComplete="email" />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-3">
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? t('resetPasswordRequest.submitting') : t('resetPasswordRequest.submit')}
            </Button>
            <p className="text-center text-sm text-muted-foreground">
              <Link href="/login" className="underline">
                {t('resetPasswordRequest.backToLogin')}
              </Link>
            </p>
          </CardFooter>
        </form>
      )}
    </Card>
  )
}
