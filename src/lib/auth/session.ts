import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { eq } from 'drizzle-orm'
import { auth } from '@/lib/auth'
import { db, professional } from '@/lib/db'

export async function getSession() {
  return auth.api.getSession({ headers: await headers() })
}

export async function requireSession() {
  const session = await getSession()
  if (!session) redirect('/login')
  return session
}

export async function getCurrentProfessional() {
  const session = await getSession()
  if (!session) return null

  const [pro] = await db
    .select()
    .from(professional)
    .where(eq(professional.userId, session.user.id))
    .limit(1)

  return pro ?? null
}
