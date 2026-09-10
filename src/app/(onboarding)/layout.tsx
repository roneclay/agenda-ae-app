import { SupportFooter } from '@/components/support-footer'

export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex flex-1 flex-col">{children}</main>
      <SupportFooter />
    </div>
  )
}
