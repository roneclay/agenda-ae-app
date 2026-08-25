import { eq } from 'drizzle-orm'
import { type NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getSession } from '@/lib/auth/session'
import { db, professional } from '@/lib/db'

const Schema = z.object({
  slug: z
    .string()
    .trim()
    .min(3)
    .max(40)
    .regex(/^[a-z0-9-]+$/),
})

export async function GET(req: NextRequest) {
  const slug = req.nextUrl.searchParams.get('slug') ?? ''
  const parsed = Schema.safeParse({ slug })
  if (!parsed.success) {
    return NextResponse.json({ available: false, reason: 'invalid' }, { status: 200 })
  }

  const session = await getSession()

  const [existing] = await db
    .select({ userId: professional.userId })
    .from(professional)
    .where(eq(professional.slug, parsed.data.slug))
    .limit(1)

  const available = !existing || existing.userId === session?.user.id
  return NextResponse.json({ available })
}
