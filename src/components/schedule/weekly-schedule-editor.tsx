'use client'

import { useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { type DayKey, DAY_KEYS_ORDER, dayLabel } from '@/lib/dates'

export type Window = { startTime: string; endTime: string }
export type WeeklyState = Record<DayKey, Window[]>

const DEFAULT_STATE: WeeklyState = {
  MON: [{ startTime: '09:00', endTime: '18:00' }],
  TUE: [{ startTime: '09:00', endTime: '18:00' }],
  WED: [{ startTime: '09:00', endTime: '18:00' }],
  THU: [{ startTime: '09:00', endTime: '18:00' }],
  FRI: [{ startTime: '09:00', endTime: '18:00' }],
  SAT: [],
  SUN: [],
}

export function buildDefaultWeeklyState(initial?: Partial<WeeklyState>): WeeklyState {
  return { ...DEFAULT_STATE, ...initial }
}

export function flattenForSubmit(state: WeeklyState): Array<Window & { dayKey: DayKey }> {
  const out: Array<Window & { dayKey: DayKey }> = []
  for (const day of DAY_KEYS_ORDER) {
    for (const w of state[day]) {
      out.push({ dayKey: day, startTime: w.startTime, endTime: w.endTime })
    }
  }
  return out
}

export function WeeklyScheduleEditor({
  initial,
  onChange,
}: {
  initial?: WeeklyState
  onChange?: (s: WeeklyState) => void
}) {
  const [state, setState] = useState<WeeklyState>(() => initial ?? buildDefaultWeeklyState())

  const update = (next: WeeklyState) => {
    setState(next)
    onChange?.(next)
  }

  const totalWindows = useMemo(
    () => Object.values(state).reduce((acc, arr) => acc + arr.length, 0),
    [state],
  )

  return (
    <div className="space-y-3">
      {DAY_KEYS_ORDER.map((day) => {
        const windows = state[day]
        const enabled = windows.length > 0
        return (
          <div key={day} className="rounded-xl border p-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <label className="flex items-center gap-3 text-sm">
                <input
                  type="checkbox"
                  className="h-4 w-4"
                  checked={enabled}
                  onChange={(e) => {
                    update({
                      ...state,
                      [day]: e.target.checked ? [{ startTime: '09:00', endTime: '18:00' }] : [],
                    })
                  }}
                />
                <span className="font-medium">{dayLabel(day)}</span>
                {!enabled && <span className="text-xs text-muted-foreground">— Fechado</span>}
              </label>
              {enabled && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-8 px-2 text-xs"
                  onClick={() =>
                    update({
                      ...state,
                      [day]: [...windows, { startTime: '13:00', endTime: '18:00' }],
                    })
                  }
                >
                  + Janela
                </Button>
              )}
            </div>

            {enabled && (
              <div className="mt-3 space-y-2">
                {windows.map((w, i) => (
                  // biome-ignore lint/suspicious/noArrayIndexKey: windows reorder client-side, no stable id
                  <div key={`${day}-${i}`} className="flex items-center gap-2">
                    <Input
                      type="time"
                      value={w.startTime}
                      onChange={(e) => {
                        const next = [...windows]
                        next[i] = { ...next[i], startTime: e.target.value }
                        update({ ...state, [day]: next })
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
                        update({ ...state, [day]: next })
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
                        onClick={() => {
                          const next = windows.filter((_, idx) => idx !== i)
                          update({ ...state, [day]: next })
                        }}
                      >
                        ✕
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )
      })}

      {totalWindows === 0 && (
        <p className="text-sm text-destructive">Adicione pelo menos uma janela em algum dia.</p>
      )}
    </div>
  )
}
