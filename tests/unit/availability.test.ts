import { describe, expect, test } from 'bun:test'
import { brtWallToUtcMs, deriveSlots, isRangeFree, type Window } from '@/lib/availability'

const DATE = { year: 2026, month1to12: 8, day: 27 }
const FULL_DAY: Window[] = [{ startMin: 9 * 60, endMin: 19 * 60 }]

describe('deriveSlots', () => {
  test('sem horários ocupados, o primeiro slot do dia comporta a duração total', () => {
    const slots = deriveSlots({ date: DATE, windows: FULL_DAY, busy: [], totalDurationMin: 150 })
    expect(slots.length).toBeGreaterThan(0)
    expect(slots[0].status).toBe('available')
  })

  test('perto do fim da janela, sem espaço pra duração total, o slot vira "partial"', () => {
    const slots = deriveSlots({ date: DATE, windows: FULL_DAY, busy: [], totalDurationMin: 150 })
    const lastSlot = slots.at(-1)
    expect(lastSlot?.status).toBe('partial')
  })

  test('reproduz o cenário reportado: 2 serviços somando 150min com um bloqueio às 15:00 gera slots partial antes dele', () => {
    const busyStart = brtWallToUtcMs(2026, 8, 27, 15 * 60) // 15:00 BRT
    const busy = [{ start: busyStart, end: busyStart + 30 * 60_000 }]
    const slots = deriveSlots({ date: DATE, windows: FULL_DAY, busy, totalDurationMin: 150 })

    const at1330 = slots.find(
      (s) => s.startsAt === new Date(brtWallToUtcMs(2026, 8, 27, 13 * 60 + 30)).toISOString(),
    )
    expect(at1330?.status).toBe('partial')
    expect(at1330?.fittingDurationMin).toBe(90)

    const at0900 = slots.find(
      (s) => s.startsAt === new Date(brtWallToUtcMs(2026, 8, 27, 9 * 60)).toISOString(),
    )
    expect(at0900?.status).toBe('available')
  })

  test('slot que colide com o início do horário ocupado não aparece', () => {
    const busyStart = brtWallToUtcMs(2026, 8, 27, 15 * 60)
    const busy = [{ start: busyStart, end: busyStart + 30 * 60_000 }]
    const slots = deriveSlots({ date: DATE, windows: FULL_DAY, busy, totalDurationMin: 60 })
    const overlapping = slots.find(
      (s) => s.startsAt === new Date(brtWallToUtcMs(2026, 8, 27, 15 * 60)).toISOString(),
    )
    expect(overlapping).toBeUndefined()
  })
})

describe('isRangeFree', () => {
  test('slot totalmente disponível cabe', () => {
    const free = isRangeFree({
      date: DATE,
      windows: FULL_DAY,
      busy: [],
      startsAtIso: new Date(brtWallToUtcMs(2026, 8, 27, 9 * 60)).toISOString(),
      durationMin: 150,
    })
    expect(free).toBe(true)
  })

  test('bug corrigido: um horário "partial" (que não cabe a duração total) não deve ser aceito', () => {
    const busyStart = brtWallToUtcMs(2026, 8, 27, 15 * 60)
    const busy = [{ start: busyStart, end: busyStart + 30 * 60_000 }]
    const free = isRangeFree({
      date: DATE,
      windows: FULL_DAY,
      busy,
      startsAtIso: new Date(brtWallToUtcMs(2026, 8, 27, 13 * 60 + 30)).toISOString(),
      durationMin: 150,
    })
    expect(free).toBe(false)
  })

  test('rejeita horário fora da janela de atendimento', () => {
    const free = isRangeFree({
      date: DATE,
      windows: FULL_DAY,
      busy: [],
      startsAtIso: new Date(brtWallToUtcMs(2026, 8, 27, 20 * 60)).toISOString(),
      durationMin: 60,
    })
    expect(free).toBe(false)
  })

  test('sem nenhuma janela configurada, nada está disponível', () => {
    const free = isRangeFree({
      date: DATE,
      windows: [],
      busy: [],
      startsAtIso: new Date(brtWallToUtcMs(2026, 8, 27, 9 * 60)).toISOString(),
      durationMin: 60,
    })
    expect(free).toBe(false)
  })
})
