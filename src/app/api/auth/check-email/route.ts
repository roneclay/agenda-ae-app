import { eq } from 'drizzle-orm'
import { NextResponse } from 'next/server'
import { db, user } from '@/lib/db'

export async function POST(req: Request) {
  const { email } = await req.json()
  if (!email) return NextResponse.json({ exists: false })

  const [found] = await db.select({ id: user.id }).from(user).where(eq(user.email, email)).limit(1)
  return NextResponse.json({ exists: !!found })
}
