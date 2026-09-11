'use client'

import { useTranslations } from 'next-intl'
import { useActionState, useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import { type OnboardingState, saveBasics } from './actions'

const slugify = (input: string) =>
  input
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40)

type SlugStatus = 'idle' | 'checking' | 'available' | 'taken' | 'invalid'

export function BasicsStep({ defaultName }: { defaultName: string }) {
  const t = useTranslations('onboarding.basics')
  const NICHE_OPTIONS = [
    { value: 'beauty', label: t('nicheOptions.beauty') },
    { value: 'legal', label: t('nicheOptions.legal') },
    { value: 'petcare', label: t('nicheOptions.petcare') },
    { value: 'fitness', label: t('nicheOptions.fitness') },
  ] as const

  const [state, action, pending] = useActionState<OnboardingState, FormData>(saveBasics, {})
  const [slug, setSlug] = useState('')
  const [status, setStatus] = useState<SlugStatus>('idle')

  useEffect(() => {
    const normalized = slugify(slug)
    if (!normalized) {
      setStatus('idle')
      return
    }
    if (normalized.length < 3) {
      setStatus('invalid')
      return
    }
    setStatus('checking')
    const ctrl = new AbortController()
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/slug-check?slug=${encodeURIComponent(normalized)}`, {
          signal: ctrl.signal,
        })
        const json = (await res.json()) as { available: boolean }
        setStatus(json.available ? 'available' : 'taken')
      } catch (e) {
        if ((e as Error).name !== 'AbortError') setStatus('idle')
      }
    }, 350)
    return () => {
      ctrl.abort()
      clearTimeout(timer)
    }
  }, [slug])

  const normalized = slugify(slug)
  const blocked = status === 'taken' || status === 'invalid' || status === 'checking'

  return (
    <Card>
      <form action={action}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">{t('nameLabel')}</Label>
            <Input id="name" name="name" required defaultValue={defaultName} />
            {state.fieldErrors?.name && (
              <p className="text-sm text-destructive">{state.fieldErrors.name}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="slug">{t('linkLabel')}</Label>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">/agendar/</span>
              <Input
                id="slug"
                name="slug"
                required
                placeholder={t('linkPlaceholder')}
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
              />
            </div>
            <SlugFeedback status={status} normalized={normalized} />
            {state.fieldErrors?.slug && (
              <p className="text-sm text-destructive">{state.fieldErrors.slug}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="niche">{t('nicheLabel')}</Label>
            <Select name="niche" defaultValue="beauty">
              <SelectTrigger id="niche">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {NICHE_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {state.fieldErrors?.phone && (
            <p className="text-sm text-destructive">{state.fieldErrors.phone}</p>
          )}

          {state.error && <p className="text-sm text-destructive">{state.error}</p>}
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full" disabled={pending || blocked}>
            {pending ? t('saving') : t('continue')}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}

function SlugFeedback({ status, normalized }: { status: SlugStatus; normalized: string }) {
  const t = useTranslations('onboarding.basics')
  if (status === 'idle') return null
  const map: Record<SlugStatus, { text: string; tone: 'muted' | 'ok' | 'error' }> = {
    idle: { text: '', tone: 'muted' },
    checking: { text: t('checking'), tone: 'muted' },
    invalid: { text: t('linkTooShort'), tone: 'error' },
    available: { text: t('linkAvailable', { slug: normalized }), tone: 'ok' },
    taken: { text: t('linkTaken', { slug: normalized }), tone: 'error' },
  }
  const { text, tone } = map[status]
  return (
    <p
      className={cn(
        'text-xs',
        tone === 'ok' && 'text-emerald-600',
        tone === 'error' && 'text-destructive',
        tone === 'muted' && 'text-muted-foreground',
      )}
    >
      {text}
    </p>
  )
}
