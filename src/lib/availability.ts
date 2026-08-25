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

function brtWallToUtcMs(year: number, month1to12: number, day: number, totalMinutes: number) {
  const h = Math.floor(totalMinutes / 60)
  const m = totalMinutes % 60
  return Date.UTC(year, month1to12 - 1, day, h + BRT_OFFSET_HOURS, m)
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

export async function computeSlots({
  pro,
  date,
  totalDurationMin,
}: {
  pro: Pro
  date: string
  totalDurationMin: number
}): Promise<Slot[]> {
  const [year, month, day] = date.split('-').map(Number)
  const dayStart = new Date(brtWallToUtcMs(year, month, day, 0))
  const dayEnd = new Date(brtWallToUtcMs(year, month, day, 24 * 60))
  const dayKey = DAY_KEYS[dayStart.getUTCDay()] as DayKey

  const windows = await effectiveWindows({ professionalId: pro.id, date, dayKey })
  if (windows.length === 0) return []

  const [appts, blocks] = await Promise.all([
    db
      .select({
        scheduledAt: appointment.scheduledAt,
        durationMinutes: appointment.durationMinutes,
      })
      .from(appointment)
      .where(
        and(
          eq(appointment.professionalId, pro.id),
          gte(appointment.scheduledAt, dayStart),
          lt(appointment.scheduledAt, dayEnd),
        ),
      ),
    db
      .select()
      .from(availabilityBlock)
      .where(
        and(
          eq(availabilityBlock.professionalId, pro.id),
          gte(availabilityBlock.startsAt, dayStart),
          lt(availabilityBlock.startsAt, dayEnd),
        ),
      ),
  ])

  const busy = [
    ...appts.map((a) => ({
      start: a.scheduledAt.getTime(),
      end: a.scheduledAt.getTime() + a.durationMinutes * 60_000,
    })),
    ...blocks.map((b) => ({ start: b.startsAt.getTime(), end: b.endsAt.getTime() })),
  ]

  const slots: Slot[] = []
  for (const window of windows) {
    for (let m = window.startMin; m + SLOT_STEP_MIN <= window.endMin; m += SLOT_STEP_MIN) {
      const slotStartMs = brtWallToUtcMs(year, month, day, m)
      const desiredEndMs = slotStartMs + totalDurationMin * 60_000

      let nextBoundary = brtWallToUtcMs(year, month, day, window.endMin)
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
