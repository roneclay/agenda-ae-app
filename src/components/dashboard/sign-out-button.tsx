'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { signOut } from '@/lib/auth/client'

export function SignOutButton() {
  const router = useRouter()
  async function onClick() {
    await signOut()
    router.push('/login')
    router.refresh()
  }
  return (
    <Button variant="ghost" size="sm" onClick={onClick}>
      Sair
    </Button>
  )
}
