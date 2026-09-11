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
import { isValidPhoneBR, maskPhoneBR, toE164BR } from '@/lib/phone'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function LoginLink(chunks: React.ReactNode) {
  return (
    <Link href="/login" className="underline hover:text-foreground">
      {chunks}
    </Link>
  )
}

export default function CadastroPage() {
  const t = useTranslations('auth')
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [termsError, setTermsError] = useState('')
  const [emailError, setEmailError] = useState<React.ReactNode>(null)
  const [phoneError, setPhoneError] = useState<React.ReactNode>(null)
  const [phoneDisplay, setPhoneDisplay] = useState('')

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setTermsError('')
    setEmailError(null)
    setPhoneError(null)

    const form = new FormData(e.currentTarget)
    const name = String(form.get('name') ?? '').trim()
    const email = String(form.get('email') ?? '').trim()
    const password = String(form.get('password') ?? '')
    const phone = String(form.get('phone') ?? '').trim()
    const acceptedTerms = form.get('terms') === 'on'

    if (!EMAIL_RE.test(email)) {
      setEmailError(t('signup.emailInvalid'))
      return
    }

    if (!isValidPhoneBR(phone)) {
      setPhoneError(t('signup.phoneInvalid'))
      return
    }

    if (!acceptedTerms) {
      setTermsError(t('signup.termsRequired'))
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
      setEmailError(t.rich('signup.emailAlreadyRegistered', { link: LoginLink }))
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
        setPhoneError(t.rich('signup.phoneTaken', { link: LoginLink }))
      } else {
        toast.error(t('signup.genericError'))
      }
      return
    }

    const { error: signUpError } = await signUp.email({
      name,
      email,
      password,
      phone: e164,
      callbackURL: '/dashboard',
    })
    setLoading(false)

    if (signUpError) {
      const key = authErrorKey(signUpError.message, 'genericSignup')
      if (key === 'genericSignup' && /phone/i.test(signUpError.message ?? '')) {
        setPhoneError(t.rich('signup.phoneTaken', { link: LoginLink }))
      } else {
        toast.error(t(`errors.${key}`))
      }
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
            {emailError && <p className="text-sm text-destructive">{emailError}</p>}
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
            <p className="text-xs text-muted-foreground">{t('signup.whatsappHelp')}</p>
            {phoneError && <p className="text-sm text-destructive">{phoneError}</p>}
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
          {termsError && <p className="text-sm text-destructive">{termsError}</p>}
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
