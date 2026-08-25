import { sendWhatsAppMock } from './mock'

const MOCK = process.env.WHATSAPP_MOCK === 'true'

export async function sendWhatsApp({
  phoneNumberId,
  accessToken,
  to,
  message,
}: {
  phoneNumberId?: string | null
  accessToken?: string | null
  to: string
  message: string
}): Promise<void> {
  if (MOCK || !phoneNumberId || !accessToken) {
    return sendWhatsAppMock(to, message)
  }

  const res = await fetch(`https://graph.facebook.com/v20.0/${phoneNumberId}/messages`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      to,
      type: 'text',
      text: { body: message },
    }),
  })

  if (!res.ok) {
    const body = await res.text()
    console.error('[WhatsApp] erro:', res.status, body)
  }
}
