import Link from 'next/link'
import { buttonVariants } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

export default async function VerificarEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string }>
}) {
  const { email } = await searchParams

  return (
    <Card>
      <CardHeader>
        <CardTitle>Confirme seu email</CardTitle>
        <CardDescription>
          {email
            ? `Enviamos um link de confirmação para ${email}.`
            : 'Enviamos um link de confirmação para o seu email.'}
        </CardDescription>
      </CardHeader>
      <CardContent className="text-sm text-muted-foreground">
        <p>Clique no link da mensagem para ativar sua conta. Verifique também a pasta de spam.</p>
      </CardContent>
      <CardFooter>
        <Link href="/login" className={buttonVariants({ variant: 'outline', className: 'w-full' })}>
          Voltar para o login
        </Link>
      </CardFooter>
    </Card>
  )
}
