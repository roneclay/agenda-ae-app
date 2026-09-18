import { redirect } from 'next/navigation'
import { requireSession } from '@/lib/auth/session'
import { WhatsappForm } from './whatsapp-form'

export default async function OnboardingWhatsappPage() {
  const session = await requireSession()
  if (session.user.phone) redirect('/onboarding')

  return (
    <div className="mx-auto flex w-full max-w-xl flex-1 flex-col justify-center px-6 py-12">
      <WhatsappForm />
    </div>
  )
}
