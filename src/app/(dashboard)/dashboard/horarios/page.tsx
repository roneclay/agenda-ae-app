import { and, eq, gte, lte } from 'drizzle-orm'
import { getCurrentProfessional } from '@/lib/auth/session'
import { addDays, nextNDates, todayInBRT } from '@/lib/dates'
import { dateOverride, dateOverrideWindow, db, weeklyScheduleWindow } from '@/lib/db'
import { HorariosClient } from './horarios-client'

export default async function HorariosPage() {
  const pro = await getCurrentProfessional()
  if (!pro) return null

  const template = await db
    .select()
    .from(weeklyScheduleWindow)
    .where(eq(weeklyScheduleWindow.professionalId, pro.id))

  const dates = nextNDates(7)
  const horizonEnd = addDays(todayInBRT(), 6)

  const overrides = await db
    .select({
      id: dateOverride.id,
      date: dateOverride.date,
      isOpen: dateOverride.isOpen,
    })
    .from(dateOverride)
    .where(
      and(
        eq(dateOverride.professionalId, pro.id),
        gte(dateOverride.date, todayInBRT()),
        lte(dateOverride.date, horizonEnd),
      ),
    )

  const overrideWindows = overrides.length
    ? await db
        .select({
          dateOverrideId: dateOverrideWindow.dateOverrideId,
          startTime: dateOverrideWindow.startTime,
          endTime: dateOverrideWindow.endTime,
        })
        .from(dateOverrideWindow)
    : []

  return (
    <HorariosClient
      template={template.map((w) => ({
        dayKey: w.dayKey,
        startTime: w.startTime.slice(0, 5),
        endTime: w.endTime.slice(0, 5),
      }))}
      dates={dates}
      overrides={overrides.map((o) => ({
        date: o.date,
        isOpen: o.isOpen,
        windows: overrideWindows
          .filter((w) => w.dateOverrideId === o.id)
          .map((w) => ({ startTime: w.startTime.slice(0, 5), endTime: w.endTime.slice(0, 5) })),
      }))}
    />
  )
}
