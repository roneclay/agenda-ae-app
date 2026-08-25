import { eq } from 'drizzle-orm'
import { type NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { runAgent } from '@/lib/ai/agent'
import { customer, db, professional } from '@/lib/db'

const Schema = z.object({
  slug: z.string().min(1),
  whatsappId: z.string().min(8),
  message: z.string().min(1),
  customerName: z.string().optional(),
})

export async function POST(req: NextRequest) {
  const json = await req.json().catch(() => null)
  const parsed = Schema.safeParse(json)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const { slug, whatsappId, message: text, customerName } = parsed.data

  const [pro] = await db.select().from(professional).where(eq(professional.slug, slug)).limit(1)
  if (!pro) return NextResponse.json({ error: 'Profissional não encontrado' }, { status: 404 })

  const wid = whatsappId.startsWith('+') ? whatsappId : `+${whatsappId}`

  const [existing] = await db.select().from(customer).where(eq(customer.whatsappId, wid)).limit(1)

  let cust = existing
  if (!cust || cust.professionalId !== pro.id) {
    const [created] = await db
      .insert(customer)
      .values({ professionalId: pro.id, whatsappId: wid, name: customerName })
      .returning()
    cust = created
  }

  const { reply, toolCalls } = await runAgent({ pro, cust, userMessage: text })
  return NextResponse.json({ reply, toolCalls })
}
