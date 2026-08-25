const BASE = 'https://api.abacatepay.com/v2'

export async function createSubscriptionCheckout({
  productId,
  externalId,
  completionUrl,
  returnUrl,
}: {
  productId: string
  externalId: string
  completionUrl: string
  returnUrl: string
}): Promise<{ url: string; id: string }> {
  const res = await fetch(`${BASE}/subscriptions/create`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.ABACATEPAY_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      items: [{ id: productId, quantity: 1 }],
      externalId,
      completionUrl,
      returnUrl,
    }),
  })

  const json = await res.json()
  if (!json.success) throw new Error(json.error ?? 'Erro AbacatePay')
  return { url: json.data.url, id: json.data.id }
}
