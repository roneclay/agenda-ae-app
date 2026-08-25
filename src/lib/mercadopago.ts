const BASE = 'https://api.mercadopago.com'

export async function createPaymentPreference({
  professionalId,
}: {
  professionalId: string
}): Promise<{ id: string; initPoint: string }> {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL!

  const res = await fetch(`${BASE}/checkout/preferences`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.MERCADOPAGO_ACCESS_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      items: [
        {
          id: 'agendaae-pro',
          title: 'AgendaAe Pro — Plano Mensal',
          quantity: 1,
          currency_id: 'BRL',
          unit_price: 49.0,
        },
      ],
      back_urls: {
        success: `${appUrl}/dashboard/financeiro?assinatura=ok`,
        failure: `${appUrl}/dashboard/financeiro?assinatura=falhou`,
        pending: `${appUrl}/dashboard/financeiro?assinatura=pendente`,
      },
      auto_return: 'approved',
      notification_url: `${appUrl}/api/webhooks/mercadopago`,
      external_reference: professionalId,
      statement_descriptor: 'AGENDAAE',
    }),
  })

  const json = await res.json()
  if (!res.ok) throw new Error(json.message ?? 'Erro Mercado Pago')
  return { id: json.id, initPoint: json.init_point }
}
