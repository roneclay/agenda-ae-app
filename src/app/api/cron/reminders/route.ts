import { type NextRequest, NextResponse } from 'next/server'
import { dispatchReminders } from '@/lib/reminders'

export async function POST(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const kind = searchParams.get('kind') ?? 'reminder_24h'

  if (kind !== 'reminder_24h' && kind !== 'reminder_2h') {
    return NextResponse.json({ error: 'kind inválido' }, { status: 400 })
  }

  const result = await dispatchReminders(kind)
  return NextResponse.json(result)
}

export const GET = POST
