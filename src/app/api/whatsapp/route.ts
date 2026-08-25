import { eq } from 'drizzle-orm'
import { type NextRequest, NextResponse } from 'next/server'
import { runAgent } from '@/lib/ai/agent'
import { customer, db, professional } from '@/lib/db'
import { sendWhatsApp } from '@/lib/whatsapp/send'

const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN ?? 'agendaae_verify_2026'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const mode = searchParams.get('hub.mode')
  const token = searchParams.get('hub.verify_token')
  const challenge = searchParams.get('hub.challenge')
  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    return new Response(challenge ?? '', { status: 200 })
  }
  return new Response('forbidden', { status: 403 })
}

type WhatsAppPayload = {
  entry?: Array<{
    changes?: Array<{
      value?: {
        metadata?: { phone_number_id?: string }
        messages?: Array<{
          from?: string
          text?: { body?: string }
          type?: string
        }>
      }
    }>
  }>
}

export async function POST(req: NextRequest) {
  const json = (await req.json().catch(() => null)) as WhatsAppPayload | null
  if (!json) return NextResponse.json({ ok: false }, { status: 400 })

  for (const entry of json.entry ?? []) {
    for (const change of entry.changes ?? []) {
      const phoneNumberId = change.value?.metadata?.phone_number_id
      if (!phoneNumberId) continue

      const [pro] = await db
        .select()
        .from(professional)
        .where(eq(professional.whatsappPhoneNumberId, phoneNumberId))
        .limit(1)
      if (!pro) continue

      for (const msg of change.value?.messages ?? []) {
        if (msg.type !== 'text' || !msg.from || !msg.text?.body) continue

        const whatsappId = msg.from.startsWith('+') ? msg.from : `+${msg.from}`

        const [existing] = await db
          .select()
          .from(customer)
          .where(eq(customer.whatsappId, whatsappId))
          .limit(1)

        let cust = existing
        if (!cust || cust.professionalId !== pro.id) {
          const [created] = await db
            .insert(customer)
            .values({ professionalId: pro.id, whatsappId })
            .returning()
          cust = created
        }

        const { reply } = await runAgent({ pro, cust, userMessage: msg.text.body })

        if (reply) {
          await sendWhatsApp({
            phoneNumberId: pro.whatsappPhoneNumberId,
            accessToken: pro.whatsappAccessToken,
            to: whatsappId.replace(/^\+/, ''),
            message: reply,
          })
        }
      }
    }
  }

  return NextResponse.json({ ok: true })
}
