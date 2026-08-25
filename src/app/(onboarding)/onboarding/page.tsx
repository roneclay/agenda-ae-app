import { and, eq } from 'drizzle-orm'
import { redirect } from 'next/navigation'
import { getCurrentProfessional, requireSession } from '@/lib/auth/session'
import { db, service } from '@/lib/db'
import { BasicsStep } from './step-basics'
import { HoursStep } from './step-hours'
import { ServiceStep } from './step-service'
import { Stepper } from './stepper'

export default async function OnboardingPage() {
  const session = await requireSession()
  const pro = await getCurrentProfessional()

  if (pro?.onboardingCompleted) redirect('/dashboard')

  let step: 1 | 2 | 3 = 1
  if (pro) {
    const [svc] = await db
      .select({ id: service.id })
      .from(service)
      .where(and(eq(service.professionalId, pro.id), eq(service.isActive, true)))
      .limit(1)
    step = svc ? 3 : 2
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-xl flex-col justify-center px-6 py-12">
      <div className="mb-8 space-y-2 text-center">
        <h1 className="text-3xl font-semibold tracking-tight">Vamos configurar sua agenda</h1>
        <p className="text-muted-foreground">
          Três passos rápidos. Seu link público só fica ativo no final.
        </p>
      </div>
      <Stepper current={step} />
      <div className="mt-6">
        {step === 1 && <BasicsStep defaultName={session.user.name} />}
        {step === 2 && pro && <ServiceStep />}
        {step === 3 && pro && <HoursStep />}
      </div>
    </div>
  )
}
