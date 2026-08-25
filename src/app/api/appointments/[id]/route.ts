import { and, eq } from 'drizzle-orm'
import { type NextRequest, NextResponse } from 'next/server'
import { getCurrentProfessional } from '@/lib/auth/session'
import { appointment, db } from '@/lib/db'

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const pro = await getCurrentProfessional()
  if (!pro) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

  const { id } = await params

  await db
    .update(appointment)
    .set({ status: 'cancelled' })
    .where(and(eq(appointment.id, id), eq(appointment.professionalId, pro.id)))

  return NextResponse.json({ ok: true })
}
