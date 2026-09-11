'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { signUp } from '@/lib/auth/client'
import { authErrorKey } from '@/lib/auth/error-messages'
import { toE164BR } from '@/lib/phone'

export default function CadastroPage() {
  const t = useTranslations('auth')
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')

    const form = new FormData(e.currentTarget)
    const name = String(form.get('name') ?? '').trim()
    const email = String(form.get('email') ?? '').trim()
    const password = String(form.get('password') ?? '')
    const phone = String(form.get('phone') ?? '').trim()
    const acceptedTerms = form.get('terms') === 'on'

    if (!acceptedTerms) {
      setError(t('signup.termsRequired'))
      return
    }

    setLoading(true)
    const e164 = toE164BR(phone)

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

    const phoneCheck = await fetch('/api/check-phone', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: e164 }),
    })
    if (!phoneCheck.ok) {
      setLoading(false)
      const body = await phoneCheck.json().catch(() => ({}))
      if (body.error === 'phoneTaken') {
        setError(t('signup.phoneTaken'))
      } else {
        toast.error(t('signup.genericError'))
      }
      return
    }

    // Guarda o telefone pra o onboarding vincular ao profissional — ainda não
    // existe sessão nesse ponto (falta confirmar e-mail).
    // biome-ignore lint/suspicious/noDocumentCookie: Cookie Store API não tem suporte no Safari
    document.cookie = `pending_phone=${encodeURIComponent(e164)}; path=/; max-age=1800; samesite=lax`

    const { error: signUpError } = await signUp.email({
      name,
      email,
      password,
      callbackURL: '/dashboard',
    })
    setLoading(false)

    if (signUpError) {
      toast.error(t(`errors.${authErrorKey(signUpError.message, 'genericSignup')}`))
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
          <div className="space-y-2">
            <Label htmlFor="phone">{t('signup.whatsappLabel')}</Label>
            <Input id="phone" name="phone" required placeholder="48999999999" inputMode="tel" />
            <p className="text-xs text-muted-foreground">{t('signup.whatsappHelp')}</p>
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>
          <div className="flex items-start gap-2">
            <Checkbox id="terms" name="terms" className="mt-0.5" />
            <Label htmlFor="terms" className="text-sm font-normal text-muted-foreground">
              {t.rich('signup.termsLabel', {
                link: (chunks) => (
                  <Link href="/termos" target="_blank" className="underline hover:text-foreground">
                    {chunks}
                  </Link>
                ),
              })}
            </Label>
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
