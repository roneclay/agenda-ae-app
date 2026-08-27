import Image from 'next/image'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth/session'

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession()
  if (session) redirect('/dashboard')

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2 text-xl font-semibold tracking-tight">
            <Image
              src="/logo-agendadinho.png"
              alt=""
              width={28}
              height={28}
              className="rounded-lg"
            />
            Agendadinho
          </Link>
        </div>
      </header>
      <main className="flex flex-1 items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">{children}</div>
      </main>
    </div>
  )
}
