import { eq } from 'drizzle-orm'
import { type NextRequest, NextResponse } from 'next/server'
import { db, professional } from '@/lib/db'
import { activatePro } from '@/lib/subscription'

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

  if (topic !== 'payment' || !id) {
    return NextResponse.json({ ok: true })
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
