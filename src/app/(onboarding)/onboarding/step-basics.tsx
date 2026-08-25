'use client'

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

const NICHE_OPTIONS = [
  { value: 'beauty', label: 'Beleza (nail, lash, cabelo, barba)' },
  { value: 'legal', label: 'Advocacia' },
  { value: 'petcare', label: 'Pet (banho, tosa, veterinário)' },
  { value: 'fitness', label: 'Fitness (personal trainer)' },
] as const

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
    const t = setTimeout(async () => {
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
      clearTimeout(t)
    }
  }, [slug])

  const normalized = slugify(slug)
  const blocked = status === 'taken' || status === 'invalid' || status === 'checking'

  return (
    <Card>
      <form action={action}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome de exibição</Label>
            <Input id="name" name="name" required defaultValue={defaultName} />
            {state.fieldErrors?.name && (
              <p className="text-sm text-destructive">{state.fieldErrors.name}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="slug">Seu link público</Label>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">/agendar/</span>
              <Input
                id="slug"
                name="slug"
                required
                placeholder="seu-nome"
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
            <Label htmlFor="niche">Nicho</Label>
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

          <div className="space-y-2">
            <Label htmlFor="phone">WhatsApp</Label>
            <Input id="phone" name="phone" required placeholder="+5548999999999" inputMode="tel" />
            <p className="text-xs text-muted-foreground">
              Usado para contato e como fallback enquanto a integração WhatsApp Business não está
              conectada.
            </p>
            {state.fieldErrors?.phone && (
              <p className="text-sm text-destructive">{state.fieldErrors.phone}</p>
            )}
          </div>

          {state.error && <p className="text-sm text-destructive">{state.error}</p>}
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full" disabled={pending || blocked}>
            {pending ? 'Salvando...' : 'Continuar'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}

function SlugFeedback({ status, normalized }: { status: SlugStatus; normalized: string }) {
  if (status === 'idle') return null
  const map: Record<SlugStatus, { text: string; tone: 'muted' | 'ok' | 'error' }> = {
    idle: { text: '', tone: 'muted' },
    checking: { text: 'Verificando…', tone: 'muted' },
    invalid: { text: 'Link muito curto (mín. 3 caracteres)', tone: 'error' },
    available: { text: `✓ /agendar/${normalized} está disponível`, tone: 'ok' },
    taken: { text: `✗ /agendar/${normalized} já está em uso`, tone: 'error' },
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
