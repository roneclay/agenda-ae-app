'use client'

import { useTranslations } from 'next-intl'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { formatDuration } from '@/lib/utils'

type Service = {
  id: string
  name: string
  description: string | null
  priceCents: number
  durationMinutes: number
}

type Slot = {
  startsAt: string
  endsAt: string
  status: 'available' | 'partial'
  fittingDurationMin: number
}

const formatBRL = (cents: number) =>
  (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

const BRT_OFFSET_MS = 3 * 60 * 60 * 1000
const isoDateBRT = (offsetDays = 0) => {
  const d = new Date(Date.now() - BRT_OFFSET_MS + offsetDays * 86400000)
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`
}
const todayISO = () => isoDateBRT(0)
const maxBookingDate = () => isoDateBRT(6)

const formatTime = (iso: string) =>
  new Date(iso).toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'America/Sao_Paulo',
  })

export function BookingWizard({
  slug,
  services,
  appointmentNoun,
}: {
  slug: string
  services: Service[]
  appointmentNoun: string
}) {
  const t = useTranslations('booking')
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [date, setDate] = useState(todayISO())
  const [slots, setSlots] = useState<Slot[]>([])
  const [loadingSlots, setLoadingSlots] = useState(false)
  const [chosenSlot, setChosenSlot] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)

  const selectedServices = services.filter((s) => selected.has(s.id))
  const totalDuration = selectedServices.reduce((a, s) => a + s.durationMinutes, 0)
  const totalCents = selectedServices.reduce((a, s) => a + s.priceCents, 0)
  const availableSlots = slots.filter((s) => s.status === 'available')
  const partialSlots = slots.filter((s) => s.status === 'partial')

  useEffect(() => {
    if (step !== 2 || selected.size === 0) return
    setLoadingSlots(true)
    const params = new URLSearchParams({ slug, date })
    for (const id of selected) params.append('serviceId', id)
    fetch(`/api/availability?${params}`)
      .then((r) => r.json())
      .then((data) => setSlots(data.slots ?? []))
      .catch(() => setSlots([]))
      .finally(() => setLoadingSlots(false))
  }, [step, selected, date, slug])

  function toggle(id: string) {
    const next = new Set(selected)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    setSelected(next)
  }

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!chosenSlot) return
    setSubmitting(true)
    const form = new FormData(e.currentTarget)
    const res = await fetch('/api/appointments', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        slug,
        date,
        serviceIds: [...selected],
        scheduledAt: chosenSlot,
        customer: {
          name: String(form.get('name') ?? ''),
          whatsappId: String(form.get('whatsapp') ?? ''),
          email: String(form.get('email') ?? '') || undefined,
        },
      }),
    })
    setSubmitting(false)
    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      toast.error(data.error ?? t('genericError'))
      return
    }
    setDone(true)
    setStep(4)
  }

  if (done) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t('doneTitle', { appointmentNoun })}</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">{t('doneDescription')}</CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <ol className="flex items-center gap-2 text-xs text-muted-foreground">
        {[t('steps.services'), t('steps.schedule'), t('steps.details')].map((label, i) => {
          const n = (i + 1) as 1 | 2 | 3
          const active = step === n
          return (
            <li key={label} className="flex items-center gap-2">
              <span
                className={`flex h-6 w-6 items-center justify-center rounded-full border text-xs ${
                  active ? 'border-foreground bg-foreground text-background' : ''
                }`}
              >
                {n}
              </span>
              <span className={active ? 'text-foreground' : ''}>{label}</span>
              {n < 3 && <span>›</span>}
            </li>
          )
        })}
      </ol>

      {step === 1 && (
        <div className="space-y-3">
          {services.map((s) => {
            const isOn = selected.has(s.id)
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => toggle(s.id)}
                className={`w-full rounded-xl border p-4 text-left transition ${
                  isOn ? 'border-foreground bg-muted' : ''
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium">{s.name}</p>
                    {s.description && (
                      <p className="text-sm text-muted-foreground">{s.description}</p>
                    )}
                  </div>
                  <div className="text-right text-sm">
                    <p>{formatBRL(s.priceCents)}</p>
                    <p className="text-muted-foreground">{formatDuration(s.durationMinutes)}</p>
                  </div>
                </div>
              </button>
            )
          })}
          {selected.size > 0 && (
            <div className="rounded-xl border bg-muted/40 p-4 text-sm">
              <p className="font-medium">
                {t('servicesSummary', {
                  count: selectedServices.length,
                  duration: formatDuration(totalDuration),
                  price: formatBRL(totalCents),
                })}
              </p>
            </div>
          )}
          <Button disabled={selected.size === 0} onClick={() => setStep(2)} className="w-full">
            {t('continue')}
          </Button>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="date">{t('dateLabel')}</Label>
            <Input
              id="date"
              type="date"
              value={date}
              min={todayISO()}
              max={maxBookingDate()}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>

          {loadingSlots ? (
            <p className="text-sm text-muted-foreground">{t('loadingSlots')}</p>
          ) : slots.length === 0 ? (
            <p className="text-sm text-muted-foreground">{t('noSlots')}</p>
          ) : (
            <>
              {availableSlots.length > 0 ? (
                <div className="grid grid-cols-3 gap-2">
                  {availableSlots.map((slot) => (
                    <button
                      key={slot.startsAt}
                      type="button"
                      onClick={() => {
                        setChosenSlot(slot.startsAt)
                        setStep(3)
                      }}
                      className="rounded-lg border px-3 py-2 text-sm transition hover:bg-muted"
                    >
                      {formatTime(slot.startsAt)}
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">{t('noFullSlots')}</p>
              )}

              {partialSlots.length > 0 && (
                <div className="space-y-2 rounded-xl border border-dashed p-3">
                  <p className="text-xs text-muted-foreground">
                    {t('partialSlotsHint', { duration: formatDuration(totalDuration) })}
                  </p>
                  <div className="grid grid-cols-3 gap-2">
                    {partialSlots.map((slot) => (
                      <div
                        key={slot.startsAt}
                        className="cursor-not-allowed rounded-lg border border-dashed px-3 py-2 text-sm text-muted-foreground opacity-70"
                      >
                        <div>{formatTime(slot.startsAt)}</div>
                        <Badge variant="outline" className="mt-1 text-[10px]">
                          {t('partialBadge', { minutes: slot.fittingDurationMin })}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
          <Button variant="ghost" onClick={() => setStep(1)} className="w-full">
            {t('back')}
          </Button>
        </div>
      )}

      {step === 3 && chosenSlot && (
        <form className="space-y-4" onSubmit={submit}>
          <div className="rounded-xl border bg-muted/40 p-4 text-sm">
            <p className="font-medium">
              {new Date(chosenSlot).toLocaleString('pt-BR', {
                timeZone: 'America/Sao_Paulo',
                dateStyle: 'full',
                timeStyle: 'short',
              })}
            </p>
            <p className="text-muted-foreground">
              {formatDuration(totalDuration)} · {formatBRL(totalCents)}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">{t('nameLabel')}</Label>
            <Input id="name" name="name" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="whatsapp">{t('whatsappLabel')}</Label>
            <Input id="whatsapp" name="whatsapp" required placeholder="+5548999999999" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">{t('emailLabel')}</Label>
            <Input id="email" name="email" type="email" required />
            <p className="text-xs text-muted-foreground">{t('emailHint')}</p>
          </div>

          <div className="flex gap-2">
            <Button type="button" variant="ghost" onClick={() => setStep(2)} className="flex-1">
              {t('back')}
            </Button>
            <Button type="submit" disabled={submitting} className="flex-1">
              {submitting ? t('confirming') : t('confirm')}
            </Button>
          </div>
        </form>
      )}
    </div>
  )
}
