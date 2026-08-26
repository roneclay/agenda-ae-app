import { type NextRequest, NextResponse } from 'next/server'
import { dispatchReminders } from '@/lib/reminders'
import { dispatchTrialNotifications } from '@/lib/trial-notifications'

export async function GET(req: NextRequest) {
  const secret = req.headers.get('authorization')
  if (process.env.CRON_SECRET && secret !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const [r24, r6, r2, trial] = await Promise.all([
    dispatchReminders('reminder_24h'),
    dispatchReminders('reminder_6h'),
    dispatchReminders('reminder_2h'),
    dispatchTrialNotifications(),
  ])

  return NextResponse.json({ reminder_24h: r24, reminder_6h: r6, reminder_2h: r2, trial })
}

export const POST = GET
