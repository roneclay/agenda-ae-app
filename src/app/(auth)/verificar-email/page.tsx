import Link from 'next/link'
import { getTranslations } from 'next-intl/server'
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
  const t = await getTranslations('auth.verifyEmail')

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('title')}</CardTitle>
        <CardDescription>
          {email ? t('descriptionWithEmail', { email }) : t('descriptionGeneric')}
        </CardDescription>
      </CardHeader>
      <CardContent className="text-sm text-muted-foreground">
        <p>{t('instructions')}</p>
      </CardContent>
      <CardFooter>
        <Link href="/login" className={buttonVariants({ variant: 'outline', className: 'w-full' })}>
          {t('backToLogin')}
        </Link>
      </CardFooter>
    </Card>
  )
}
