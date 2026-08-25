import { eq } from 'drizzle-orm'
import { type NextRequest, NextResponse } from 'next/server'
import { db, professional } from '@/lib/db'

export async function POST(req: NextRequest) {
  const secret = process.env.ABACATEPAY_WEBHOOK_SECRET
  const provided = req.headers.get('x-abacatepay-signature') ?? req.headers.get('authorization')
  if (secret && provided !== secret) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  const body = (await req.json().catch(() => null)) as {
    event?: string
    data?: { customer_id?: string; status?: string }
  } | null
  if (!body?.event || !body.data?.customer_id) {
    return NextResponse.json({ error: 'payload inválido' }, { status: 400 })
  }

  const customerId = body.data.customer_id

  if (body.event === 'subscription.activated' || body.event === 'payment.confirmed') {
    await db
      .update(professional)
      .set({ plan: 'pro', subscriptionStatus: 'active' })
      .where(eq(professional.abacatepayCustomerId, customerId))
  } else if (body.event === 'subscription.cancelled') {
    await db
      .update(professional)
      .set({ subscriptionStatus: 'cancelled' })
      .where(eq(professional.abacatepayCustomerId, customerId))
  } else if (body.event === 'payment.failed') {
    await db
      .update(professional)
      .set({ subscriptionStatus: 'past_due' })
      .where(eq(professional.abacatepayCustomerId, customerId))
  }

  return NextResponse.json({ ok: true })
}
