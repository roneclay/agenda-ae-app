'use client'

import Link from 'next/link'
import { useState } from 'react'
import { toast } from 'sonner'
import { Button, buttonVariants } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { authClient } from '@/lib/auth/client'

export default function ResetarSenhaPage() {
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)

    const form = new FormData(e.currentTarget)
    const email = String(form.get('email') ?? '').trim()

    const { error } = await authClient.requestPasswordReset({
      email,
      redirectTo: '/redefinir-senha',
    })
    setLoading(false)

    if (error) {
      toast.error(error.message ?? 'Erro ao solicitar redefinição')
      return
    }
    setSent(true)
    toast.success('Enviamos um link para o seu email.')
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Redefinir senha</CardTitle>
        <CardDescription>
          Informe seu email e enviaremos um link para criar uma nova senha.
        </CardDescription>
      </CardHeader>
      {sent ? (
        <>
          <CardContent className="text-sm text-muted-foreground">
            Pronto! Verifique sua caixa de entrada.
          </CardContent>
          <CardFooter>
            <Link
              href="/login"
              className={buttonVariants({ variant: 'outline', className: 'w-full' })}
            >
              Voltar para o login
            </Link>
          </CardFooter>
        </>
      ) : (
        <form onSubmit={onSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" required autoComplete="email" />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-3">
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Enviando...' : 'Enviar link'}
            </Button>
            <p className="text-center text-sm text-muted-foreground">
              <Link href="/login" className="underline">
                Voltar para o login
              </Link>
            </p>
          </CardFooter>
        </form>
      )}
    </Card>
  )
}
