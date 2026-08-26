'use client'

import { useActionState, useEffect, useState, useTransition } from 'react'
import { toast } from 'sonner'
import {
  buildDefaultWeeklyState,
  flattenForSubmit,
  WeeklyScheduleEditor,
  type WeeklyState,
} from '@/components/schedule/weekly-schedule-editor'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { type DayKey, dayKeyFor, dayLabel, formatBrDateShort, todayInBRT } from '@/lib/dates'
import {
  clearOverride,
  type OverrideState,
  saveOverride,
  saveTemplate,
  type TemplateState,
} from './actions'

type Window = { startTime: string; endTime: string }
type FlatTemplate = Window & { dayKey: DayKey }
type Override = { date: string; isOpen: boolean; windows: Window[] }

function templateToState(flat: FlatTemplate[]): WeeklyState {
  const empty = buildDefaultWeeklyState({
    MON: [],
    TUE: [],
    WED: [],
    THU: [],
    FRI: [],
    SAT: [],
    SUN: [],
  })
  for (const w of flat) {
    empty[w.dayKey].push({ startTime: w.startTime, endTime: w.endTime })
  }
  for (const day of Object.keys(empty) as DayKey[]) {
    empty[day].sort((a, b) => a.startTime.localeCompare(b.startTime))
  }
  return empty
}

export function HorariosClient({
  template,
  dates,
  overrides,
}: {
  template: FlatTemplate[]
  dates: string[]
  overrides: Override[]
}) {
  const initialWeekly = templateToState(template)
  const [weekly, setWeekly] = useState<WeeklyState>(initialWeekly)
  const [tplState, tplAction, tplPending] = useActionState<TemplateState, FormData>(
    saveTemplate,
    {},
  )

  useEffect(() => {
    if (tplState.ok) toast.success('Padrão semanal salvo')
    else if (tplState.error) toast.error(tplState.error)
  }, [tplState])

  const flattened = flattenForSubmit(weekly)

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Horários</h1>
        <p className="text-muted-foreground">
          Padrão semanal recorrente + ajustes pontuais nos próximos 7 dias.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Padrão semanal</CardTitle>
          <p className="text-sm text-muted-foreground">
            Esses horários se repetem toda semana, indefinidamente.
          </p>
        </CardHeader>
        <CardContent>
          <form action={tplAction} className="space-y-4">
            <input type="hidden" name="payload" value={JSON.stringify({ windows: flattened })} />
            <WeeklyScheduleEditor initial={initialWeekly} onChange={setWeekly} />
            <Button type="submit" disabled={tplPending}>
              {tplPending ? 'Salvando...' : 'Salvar padrão'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Próximos 7 dias</CardTitle>
          <p className="text-sm text-muted-foreground">
            Sobrescreva dias específicos sem mexer no padrão.
          </p>
        </CardHeader>
        <CardContent className="space-y-2">
          {dates.map((d) => (
            <DayRow
              key={d}
              date={d}
              template={weekly}
              override={overrides.find((o) => o.date === d)}
            />
          ))}
        </CardContent>
      </Card>
    </div>
  )
}

function DayRow({
  date,
  template,
  override,
}: {
  date: string
  template: WeeklyState
  override?: Override
}) {
  const [open, setOpen] = useState(false)
  const dayKey = dayKeyFor(date)
  const isToday = date === todayInBRT()

  const effectiveWindows = override ? (override.isOpen ? override.windows : []) : template[dayKey]

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex w-full items-center justify-between rounded-xl border p-3 text-left transition hover:bg-muted/50"
      >
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="font-medium">{dayLabel(dayKey)}</span>
            <span className="text-sm text-muted-foreground">{formatBrDateShort(date)}</span>
            {isToday && (
              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">
                hoje
              </span>
            )}
            {override && (
              <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-900 dark:bg-amber-500/20 dark:text-amber-100">
                ajustado
              </span>
            )}
          </div>
          <p className="mt-1 truncate text-sm text-muted-foreground">
            {effectiveWindows.length === 0
              ? 'Fechado'
              : effectiveWindows.map((w) => `${w.startTime}–${w.endTime}`).join(' · ')}
          </p>
        </div>
        <span className="ml-3 text-muted-foreground">›</span>
      </button>

      <DaySheet
        open={open}
        onOpenChange={setOpen}
        date={date}
        defaultWindows={effectiveWindows}
        hasOverride={!!override}
      />
    </>
  )
}

function DaySheet({
  open,
  onOpenChange,
  date,
  defaultWindows,
  hasOverride,
}: {
  open: boolean
  onOpenChange: (b: boolean) => void
  date: string
  defaultWindows: Window[]
  hasOverride: boolean
}) {
  const [isOpen, setIsOpen] = useState(defaultWindows.length > 0)
  const [windows, setWindows] = useState<Window[]>(
    defaultWindows.length > 0 ? defaultWindows : [{ startTime: '09:00', endTime: '18:00' }],
  )
  const [state, action, pending] = useActionState<OverrideState, FormData>(saveOverride, {})
  const [clearPending, startClear] = useTransition()

  useEffect(() => {
    if (state.ok) {
      toast.success('Dia atualizado')
      onOpenChange(false)
    } else if (state.error) toast.error(state.error)
  }, [state, onOpenChange])

  useEffect(() => {
    if (open) {
      setIsOpen(defaultWindows.length > 0)
      setWindows(
        defaultWindows.length > 0 ? defaultWindows : [{ startTime: '09:00', endTime: '18:00' }],
      )
    }
  }, [open, defaultWindows])

  const dayKey = dayKeyFor(date)
  const payload = JSON.stringify({
    date,
    isOpen,
    windows: isOpen ? windows : [],
  })

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="max-h-[90vh] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>
            {dayLabel(dayKey)} — {formatBrDateShort(date)}
          </SheetTitle>
          <SheetDescription>Ajuste apenas este dia. Não mexe no padrão semanal.</SheetDescription>
        </SheetHeader>

        <form action={action} className="space-y-4 px-4 pb-2">
          <input type="hidden" name="payload" value={payload} />

          <div className="flex items-center gap-3 rounded-lg border p-3">
            <input
              id="dayOpen"
              type="checkbox"
              className="h-4 w-4"
              checked={isOpen}
              onChange={(e) => setIsOpen(e.target.checked)}
            />
            <label htmlFor="dayOpen" className="text-sm font-medium">
              {isOpen ? 'Aberto neste dia' : 'Fechado neste dia'}
            </label>
          </div>

          {isOpen && (
            <div className="space-y-2">
              {windows.map((w, i) => (
                // biome-ignore lint/suspicious/noArrayIndexKey: client reorder, no stable id
                <div key={i} className="flex items-center gap-2">
                  <Input
                    type="time"
                    value={w.startTime}
                    onChange={(e) => {
                      const next = [...windows]
                      next[i] = { ...next[i], startTime: e.target.value }
                      setWindows(next)
                    }}
                    className="flex-1 min-w-0"
                    aria-label="Início"
                  />
                  <span className="text-xs text-muted-foreground">até</span>
                  <Input
                    type="time"
                    value={w.endTime}
                    onChange={(e) => {
                      const next = [...windows]
                      next[i] = { ...next[i], endTime: e.target.value }
                      setWindows(next)
                    }}
                    className="flex-1 min-w-0"
                    aria-label="Fim"
                  />
                  {windows.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-9 px-2"
                      aria-label="Remover janela"
                      onClick={() => setWindows(windows.filter((_, idx) => idx !== i))}
                    >
                      ✕
                    </Button>
                  )}
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setWindows([...windows, { startTime: '13:00', endTime: '18:00' }])}
              >
                + Adicionar janela
              </Button>
            </div>
          )}

          {state.error && <p className="text-sm text-destructive">{state.error}</p>}

          <SheetFooter className="flex-col gap-2 sm:flex-row">
            <Button type="submit" className="w-full" disabled={pending}>
              {pending ? 'Salvando...' : 'Salvar ajuste'}
            </Button>
            {hasOverride && (
              <Button
                type="button"
                variant="outline"
                className="w-full"
                disabled={clearPending}
                onClick={() => {
                  startClear(async () => {
                    await clearOverride(date)
                    toast.success('Ajuste removido — voltou ao padrão')
                    onOpenChange(false)
                  })
                }}
              >
                Voltar ao padrão
              </Button>
            )}
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  )
}
