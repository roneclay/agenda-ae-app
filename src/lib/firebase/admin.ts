import { cert, getApp, getApps, initializeApp } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'

const MOCK = process.env.PHONE_VERIFICATION_MOCK === 'true'
const MOCK_TOKEN_PREFIX = 'mock-token:'

function getAdminApp() {
  if (getApps().length) return getApp()
  return initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  })
}

/**
 * Valida um ID token do Firebase e extrai o número de WhatsApp verificado.
 * Em modo mock, aceita um token fabricado pelo client (`mock-token:<telefone>`)
 * sem chamar o Firebase de verdade — não exige nenhuma credencial configurada.
 */
export async function verifyFirebaseIdToken(
  idToken: string,
): Promise<{ phoneNumber: string } | null> {
  if (MOCK) {
    if (!idToken.startsWith(MOCK_TOKEN_PREFIX)) return null
    const phoneNumber = idToken.slice(MOCK_TOKEN_PREFIX.length)
    return phoneNumber ? { phoneNumber } : null
  }

  try {
    const decoded = await getAuth(getAdminApp()).verifyIdToken(idToken)
    if (!decoded.phone_number) return null
    return { phoneNumber: decoded.phone_number }
  } catch (err) {
    console.error('[Firebase Admin] token inválido:', err)
    return null
  }
}
