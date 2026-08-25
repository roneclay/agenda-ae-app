import { createHmac } from 'node:crypto'
import { eq } from 'drizzle-orm'
import { type NextRequest, NextResponse } from 'next/server'
import { db, professional } from '@/lib/db'
import { activatePro } from '@/lib/subscription'

function verifySignature(req: NextRequest, dataId: string): boolean {
  const secret = process.env.MERCADOPAGO_WEBHOOK_SECRET
  if (!secret) return true

  const xSignature = req.headers.get('x-signature') ?? ''
  const xRequestId = req.headers.get('x-request-id') ?? ''

  const ts = xSignature.match(/ts=(\d+)/)?.[1] ?? ''
  const v1 = xSignature.match(/v1=([a-f0-9]+)/)?.[1] ?? ''

  const manifest = `id:${dataId};request-id:${xRequestId};ts:${ts};`
  const expected = createHmac('sha256', secret).update(manifest).digest('hex')

  return expected === v1
}

async function getPayment(paymentId: string) {
  const res = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
    headers: { Authorization: `Bearer ${process.env.MERCADOPAGO_ACCESS_TOKEN}` },
  })
  return res.json()
}

export async function POST(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const topic = searchParams.get('topic') ?? searchParams.get('type')
  const id = searchParams.get('id') ?? searchParams.get('data.id')

  if (topic !== 'payment' || !id) return NextResponse.json({ ok: true })

  if (!verifySignature(req, id)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const payment = await getPayment(id)
  if (payment.status !== 'approved') return NextResponse.json({ ok: true })

  const professionalId = payment.external_reference
  if (!professionalId) return NextResponse.json({ ok: true })

  const [pro] = await db
    .select({ id: professional.id })
    .from(professional)
    .where(eq(professional.id, professionalId))
    .limit(1)

  if (!pro) return NextResponse.json({ ok: true })

  await activatePro(professionalId)

  return NextResponse.json({ ok: true })
}
