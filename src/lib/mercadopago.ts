import { randomUUID } from 'node:crypto'

const BASE = 'https://api.mercadopago.com'

/**
 * Cria uma assinatura recorrente (preapproval) SEM card_token_id — o cliente
 * escolhe cartão ou Pix na própria página do Mercado Pago (init_point), igual
 * ao fluxo antigo de preferência única, mas com cobrança automática nos ciclos
 * seguintes. Preço sempre vem por parâmetro (niches.ts) — nunca hardcodar aqui.
 */
export async function createSubscription({
  professionalId,
  payerEmail,
  priceCents,
  brandName,
}: {
  professionalId: string
  payerEmail: string
  priceCents: number
  brandName: string
}): Promise<{ id: string; initPoint: string }> {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://agenda-ae-app-self.vercel.app'

  const res = await fetch(`${BASE}/preapproval`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.MERCADOPAGO_ACCESS_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      reason: `${brandName} Pro — Plano Mensal`,
      external_reference: professionalId,
      payer_email: payerEmail,
      back_url: `${appUrl}/dashboard/financeiro?assinatura=ok`,
      notification_url: `${appUrl}/api/webhooks/mercadopago`,
      auto_recurring: {
        frequency: 1,
        frequency_type: 'months',
        transaction_amount: priceCents / 100,
        currency_id: 'BRL',
      },
      status: 'pending',
    }),
  })

  const json = await res.json()
  if (!res.ok) {
    console.error('[mercadopago] createSubscription falhou', { status: res.status, body: json })
    const cause = Array.isArray(json.cause)
      ? json.cause.map((c: { description?: string }) => c.description).join('; ')
      : undefined
    throw new Error(cause || json.message || 'Erro Mercado Pago')
  }
  return { id: json.id, initPoint: json.init_point }
}

export async function cancelSubscription(preapprovalId: string): Promise<void> {
  const res = await fetch(`${BASE}/preapproval/${preapprovalId}`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${process.env.MERCADOPAGO_ACCESS_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ status: 'cancelled' }),
  })
  if (!res.ok) {
    const json = await res.json().catch(() => ({}))
    throw new Error(json.message ?? 'Erro ao cancelar assinatura no Mercado Pago')
  }
}

export async function getSubscription(preapprovalId: string) {
  const res = await fetch(`${BASE}/preapproval/${preapprovalId}`, {
    headers: { Authorization: `Bearer ${process.env.MERCADOPAGO_ACCESS_TOKEN}` },
  })
  return res.json()
}

/**
 * Cria uma cobrança Pix avulsa (sem recorrência automática — MP não recobra
 * sozinho via Pix). Usada tanto pro primeiro pagamento quanto, via cron
 * (dispatchPixBilling), pra gerar uma cobrança nova a cada ciclo mensal.
 */
export async function createPixPayment({
  professionalId,
  payerEmail,
  priceCents,
  description,
}: {
  professionalId: string
  payerEmail: string
  priceCents: number
  description: string
}): Promise<{ id: string; qrCode: string; qrCodeBase64: string }> {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://agenda-ae-app-self.vercel.app'

  const res = await fetch(`${BASE}/v1/payments`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.MERCADOPAGO_ACCESS_TOKEN}`,
      'Content-Type': 'application/json',
      'X-Idempotency-Key': randomUUID(),
    },
    body: JSON.stringify({
      transaction_amount: priceCents / 100,
      description,
      payment_method_id: 'pix',
      payer: { email: payerEmail },
      external_reference: professionalId,
      notification_url: `${appUrl}/api/webhooks/mercadopago`,
    }),
  })

  const json = await res.json()
  if (!res.ok) {
    console.error('[mercadopago] createPixPayment falhou', { status: res.status, body: json })
    const cause = Array.isArray(json.cause)
      ? json.cause.map((c: { description?: string }) => c.description).join('; ')
      : undefined
    throw new Error(cause || json.message || 'Erro Mercado Pago')
  }

  return {
    id: String(json.id),
    qrCode: json.point_of_interaction?.transaction_data?.qr_code ?? '',
    qrCodeBase64: json.point_of_interaction?.transaction_data?.qr_code_base64 ?? '',
  }
}

export async function getPayment(paymentId: string) {
  const res = await fetch(`${BASE}/v1/payments/${paymentId}`, {
    headers: { Authorization: `Bearer ${process.env.MERCADOPAGO_ACCESS_TOKEN}` },
  })
  return res.json()
}
