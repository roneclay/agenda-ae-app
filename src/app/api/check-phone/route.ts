import { eq } from 'drizzle-orm'
import { NextResponse } from 'next/server'
import { db, professional } from '@/lib/db'
import { toE164BR } from '@/lib/phone'

export async function POST(req: Request) {
  const { phone } = await req.json()
  if (!phone) return NextResponse.json({ error: 'missingPhone' }, { status: 400 })

  const e164 = toE164BR(phone)

  const [taken] = await db
    .select({ id: professional.id })
    .from(professional)
    .where(eq(professional.phone, e164))
    .limit(1)
  if (taken) return NextResponse.json({ error: 'phoneTaken' }, { status: 409 })

  return NextResponse.json({ ok: true })
}
