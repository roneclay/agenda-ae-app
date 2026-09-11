import { NextResponse } from 'next/server'
import { db, phoneVerification } from '@/lib/db'
import { verifyFirebaseIdToken } from '@/lib/firebase/admin'
import { toE164BR } from '@/lib/phone'

export async function POST(req: Request) {
  const { idToken } = await req.json()
  console.log('[api/phone-verification/verify-token] recebido', {
    idTokenPrefix: idToken?.slice(0, 20),
    idTokenLength: idToken?.length,
  })
  if (!idToken) return NextResponse.json({ verified: false }, { status: 400 })

  const result = await verifyFirebaseIdToken(idToken)
  console.log('[api/phone-verification/verify-token] resultado da validação', { result })
  if (!result) return NextResponse.json({ verified: false })

  const e164 = toE164BR(result.phoneNumber)
  await db.insert(phoneVerification).values({
    phone: e164,
    verifiedAt: new Date(),
  })
  console.log('[api/phone-verification/verify-token] gravado em phone_verification', { e164 })

  return NextResponse.json({ verified: true })
}
