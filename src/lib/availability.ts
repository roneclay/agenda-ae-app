import { and, eq, gte, lt } from 'drizzle-orm'
import {
  appointment,
  availabilityBlock,
  dateOverride,
  dateOverrideWindow,
  db,
  type professional,
  weeklyScheduleWindow,
} from '@/lib/db'

const DAY_KEYS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'] as const
type DayKey = 'MON' | 'TUE' | 'WED' | 'THU' | 'FRI' | 'SAT' | 'SUN'

const SLOT_STEP_MIN = 30
const BRT_OFFSET_HOURS = 3

type Pro = typeof professional.$inferSelect

function timeToMinutes(value: string | null | undefined): number | null {
  if (!value) return null
  const [h, m] = value.split(':').map(Number)
  return h * 60 + (m ?? 0)
}

export function brtWallToUtcMs(
  year: number,
  month1to12: number,
  day: number,
  totalMinutes: number,
) {
  const h = Math.floor(totalMinutes / 60)
  const m = totalMinutes % 60
  return Date.UTC(year, month1to12 - 1, day, h + BRT_OFFSET_HOURS, m)
}

export type BusyRange = { start: number; end: number }
export type DateParts = { year: number; month1to12: number; day: number }

/** Núcleo puro (sem DB) do cálculo de slots — separado pra dar pra testar sem banco. */
export function deriveSlots({
  date,
  windows,
  busy,
  totalDurationMin,
}: {
  date: DateParts
  windows: Window[]
  busy: BusyRange[]
  totalDurationMin: number
}): Slot[] {
  const { year, month1to12, day } = date
  const slots: Slot[] = []

  for (const window of windows) {
    for (let m = window.startMin; m + SLOT_STEP_MIN <= window.endMin; m += SLOT_STEP_MIN) {
      const slotStartMs = brtWallToUtcMs(year, month1to12, day, m)
      const desiredEndMs = slotStartMs + totalDurationMin * 60_000

      let nextBoundary = brtWallToUtcMs(year, month1to12, day, window.endMin)
      for (const b of busy) {
        if (b.start >= slotStartMs && b.start < nextBoundary) nextBoundary = b.start
      }

      const overlap = busy.some(
        (b) => b.start < slotStartMs + SLOT_STEP_MIN * 60_000 && b.end > slotStartMs,
      )
      if (overlap) continue

      const fittingMs = nextBoundary - slotStartMs
      const fittingMin = Math.floor(fittingMs / 60_000)
      if (fittingMin < SLOT_STEP_MIN) continue

      const fits = fittingMs >= totalDurationMin * 60_000
      slots.push({
        startsAt: new Date(slotStartMs).toISOString(),
        endsAt: new Date(fits ? desiredEndMs : nextBoundary).toISOString(),
        status: fits ? 'available' : 'partial',
        fittingDurationMin: fittingMin,
      })
    }
  }

  return slots
}

/** Núcleo puro (sem DB) da checagem de disponibilidade de um intervalo. */
export function isRangeFree({
  date,
  windows,
  busy,
  startsAtIso,
  durationMin,
}: {
  date: DateParts
  windows: Window[]
  busy: BusyRange[]
  startsAtIso: string
  durationMin: number
}): boolean {
  if (windows.length === 0) return false
  const { year, month1to12, day } = date

  const startMs = new Date(startsAtIso).getTime()
  const endMs = startMs + durationMin * 60_000

  const withinWindow = windows.some((w) => {
    const wStart = brtWallToUtcMs(year, month1to12, day, w.startMin)
    const wEnd = brtWallToUtcMs(year, month1to12, day, w.endMin)
    return startMs >= wStart && endMs <= wEnd
  })
  if (!withinWindow) return false

  return !busy.some((b) => b.start < endMs && b.end > startMs)
}

export type Slot = {
  startsAt: string
  endsAt: string
  status: 'available' | 'partial'
  fittingDurationMin: number
}

export type Window = { startMin: number; endMin: number }

export async function effectiveWindows({
  professionalId,
  date,
  dayKey,
}: {
  professionalId: string
  date: string
  dayKey: DayKey
}): Promise<Window[]> {
  const [override] = await db
    .select()
    .from(dateOverride)
    .where(and(eq(dateOverride.professionalId, professionalId), eq(dateOverride.date, date)))
    .limit(1)

  if (override) {
    if (!override.isOpen) return []
    const rows = await db
      .select({ startTime: dateOverrideWindow.startTime, endTime: dateOverrideWindow.endTime })
      .from(dateOverrideWindow)
      .where(eq(dateOverrideWindow.dateOverrideId, override.id))
    return rows
      .map((r) => ({
        startMin: timeToMinutes(r.startTime) ?? 0,
        endMin: timeToMinutes(r.endTime) ?? 0,
      }))
      .filter((w) => w.endMin > w.startMin)
      .sort((a, b) => a.startMin - b.startMin)
  }

  const rows = await db
    .select({ startTime: weeklyScheduleWindow.startTime, endTime: weeklyScheduleWindow.endTime })
    .from(weeklyScheduleWindow)
    .where(
      and(
        eq(weeklyScheduleWindow.professionalId, professionalId),
        eq(weeklyScheduleWindow.dayKey, dayKey),
      ),
    )
  return rows
    .map((r) => ({
      startMin: timeToMinutes(r.startTime) ?? 0,
      endMin: timeToMinutes(r.endTime) ?? 0,
    }))
    .filter((w) => w.endMin > w.startMin)
    .sort((a, b) => a.startMin - b.startMin)
}

async function getBusyRanges({
  professionalId,
  dayStart,
  dayEnd,
}: {
  professionalId: string
  dayStart: Date
  dayEnd: Date
}) {
  const [appts, blocks] = await Promise.all([
    db
      .select({
        scheduledAt: appointment.scheduledAt,
        durationMinutes: appointment.durationMinutes,
      })
      .from(appointment)
      .where(
        and(
          eq(appointment.professionalId, professionalId),
          gte(appointment.scheduledAt, dayStart),
          lt(appointment.scheduledAt, dayEnd),
        ),
      ),
    db
      .select()
      .from(availabilityBlock)
      .where(
        and(
          eq(availabilityBlock.professionalId, professionalId),
          gte(availabilityBlock.startsAt, dayStart),
          lt(availabilityBlock.startsAt, dayEnd),
        ),
      ),
  ])

  return [
    ...appts.map((a) => ({
      start: a.scheduledAt.getTime(),
      end: a.scheduledAt.getTime() + a.durationMinutes * 60_000,
    })),
    ...blocks.map((b) => ({ start: b.startsAt.getTime(), end: b.endsAt.getTime() })),
  ]
}

function dayWindowMs(date: string) {
  const [year, month, day] = date.split('-').map(Number)
  const dayStart = new Date(brtWallToUtcMs(year, month, day, 0))
  const dayEnd = new Date(brtWallToUtcMs(year, month, day, 24 * 60))
  const dayKey = DAY_KEYS[dayStart.getUTCDay()] as DayKey
  return { year, month, day, dayStart, dayEnd, dayKey }
}

/** Confere se [startsAtIso, +durationMin) cabe inteiro numa janela livre, sem colidir com nada. Fonte da verdade no momento de criar o agendamento — o grid de horários é só uma sugestão calculada antes. */
export async function isRangeAvailable({
  pro,
  date,
  startsAtIso,
  durationMin,
}: {
  pro: Pro
  date: string
  startsAtIso: string
  durationMin: number
}): Promise<boolean> {
  const { year, month, day, dayStart, dayEnd, dayKey } = dayWindowMs(date)

  const windows = await effectiveWindows({ professionalId: pro.id, date, dayKey })
  const busy = await getBusyRanges({ professionalId: pro.id, dayStart, dayEnd })

  return isRangeFree({
    date: { year, month1to12: month, day },
    windows,
    busy,
    startsAtIso,
    durationMin,
  })
}

export async function computeSlots({
  pro,
  date,
  totalDurationMin,
}: {
  pro: Pro
  date: string
  totalDurationMin: number
}): Promise<Slot[]> {
  const { year, month, day, dayStart, dayEnd, dayKey } = dayWindowMs(date)

  const windows = await effectiveWindows({ professionalId: pro.id, date, dayKey })
  if (windows.length === 0) return []

  const busy = await getBusyRanges({ professionalId: pro.id, dayStart, dayEnd })

  return deriveSlots({ date: { year, month1to12: month, day }, windows, busy, totalDurationMin })
}
