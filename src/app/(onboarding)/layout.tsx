import type { Metadata } from 'next'
import { SupportFooter } from '@/components/support-footer'
import { noindexMetadata } from '@/lib/seo'

export const metadata: Metadata = noindexMetadata

export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex flex-1 flex-col">{children}</main>
      <SupportFooter />
    </div>
  )
}
