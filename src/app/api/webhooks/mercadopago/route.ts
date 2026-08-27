import { createHmac } from 'node:crypto'
import { eq } from 'drizzle-orm'
import { type NextRequest, NextResponse } from 'next/server'
import { db, professional, user } from '@/lib/db'
import { sendPagamentoFalhou } from '@/lib/email/send'
import { getPayment, getSubscription } from '@/lib/mercadopago'
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

async function getAuthorizedPayment(authorizedPaymentId: string) {
  const res = await fetch(
    `https://api.mercadopago.com/authorized_payments/${authorizedPaymentId}`,
    {
      headers: { Authorization: `Bearer ${process.env.MERCADOPAGO_ACCESS_TOKEN}` },
    },
  )
  return res.json()
}

async function findProByPreapprovalId(preapprovalId: string) {
  const [pro] = await db
    .select({ id: professional.id, email: user.email, name: user.name })
    .from(professional)
    .innerJoin(user, eq(user.id, professional.userId))
    .where(eq(professional.mercadopagoPreapprovalId, preapprovalId))
    .limit(1)
  return pro
}

export async function POST(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const body = await req.json().catch(() => ({}) as Record<string, unknown>)

  // Pagamento único legado (Checkout Pro) — vem por query string
  const legacyTopic = searchParams.get('topic')
  const legacyId = searchParams.get('id')
  if (legacyTopic === 'payment' && legacyId) {
    if (!verifySignature(req, legacyId)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const payment = await getPayment(legacyId)
    if (payment.status === 'approved' && payment.external_reference) {
      await activatePro(payment.external_reference)
    }
    return NextResponse.json({ ok: true })
  }

  // Assinatura recorrente (preapproval) — vem no corpo JSON
  const type = (body as { type?: string }).type
  const dataId = (body as { data?: { id?: string } }).data?.id
  if (!type || !dataId) return NextResponse.json({ ok: true })

  if (!verifySignature(req, dataId)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (type === 'payment') {
    const payment = await getPayment(dataId)
    if (payment.status === 'approved' && payment.external_reference) {
      await activatePro(payment.external_reference)
      await db
        .update(professional)
        .set({ pixChargeId: null })
        .where(eq(professional.id, payment.external_reference))
    }
    return NextResponse.json({ ok: true })
  }

  if (type === 'subscription_preapproval') {
    const preapproval = await getSubscription(dataId)
    if (preapproval.status === 'authorized' && preapproval.external_reference) {
      await activatePro(preapproval.external_reference)
    }
    return NextResponse.json({ ok: true })
  }

  if (type === 'subscription_authorized_payment') {
    const authorizedPayment = await getAuthorizedPayment(dataId)
    const preapprovalId = authorizedPayment.preapproval_id
    if (!preapprovalId) return NextResponse.json({ ok: true })

    const pro = await findProByPreapprovalId(preapprovalId)
    if (!pro) return NextResponse.json({ ok: true })

    if (authorizedPayment.status === 'processed') {
      // Cobrança do ciclo aprovada — renova o acesso Pro por mais 30 dias
      await activatePro(pro.id)
    } else if (authorizedPayment.status === 'rejected') {
      await db
        .update(professional)
        .set({ subscriptionStatus: 'past_due' })
        .where(eq(professional.id, pro.id))
      await sendPagamentoFalhou({ to: pro.email, name: pro.name })
    }
    return NextResponse.json({ ok: true })
  }

  return NextResponse.json({ ok: true })
}
