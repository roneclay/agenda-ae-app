'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { signUp } from '@/lib/auth/client'

export default function CadastroPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)

    const form = new FormData(e.currentTarget)
    const name = String(form.get('name') ?? '').trim()
    const email = String(form.get('email') ?? '').trim()
    const password = String(form.get('password') ?? '')

    const { error } = await signUp.email({ name, email, password })
    setLoading(false)

    if (error) {
      toast.error(error.message ?? 'Erro ao criar conta')
      return
    }
    toast.success('Conta criada! Verifique seu email para confirmar.')
    router.push(`/verificar-email?email=${encodeURIComponent(email)}`)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Criar conta</CardTitle>
      </CardHeader>
      <form onSubmit={onSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Seu nome</Label>
            <Input id="name" name="name" required autoComplete="name" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" required autoComplete="email" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Senha</Label>
            <Input
              id="password"
              name="password"
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
            />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-3">
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Criando...' : 'Criar conta'}
          </Button>
          <p className="text-center text-sm text-muted-foreground">
            Já tem conta?{' '}
            <Link href="/login" className="underline">
              Entrar
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  )
}
