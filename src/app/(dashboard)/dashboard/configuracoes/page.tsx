import { getTranslations } from 'next-intl/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getCurrentProfessional } from '@/lib/auth/session'
import { DeleteAccountDialog } from './delete-account-dialog'
import { ProfileForm } from './profile-form'

export default async function ConfiguracoesPage() {
  const pro = await getCurrentProfessional()
  if (!pro) return null

  const t = await getTranslations('dashboard.configuracoes')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">{t('title')}</h1>
        <p className="text-muted-foreground">{t('subtitle')}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('publicLinkTitle')}</CardTitle>
        </CardHeader>
        <CardContent className="text-sm">
          <code className="rounded bg-muted px-2 py-1">
            {process.env.NEXT_PUBLIC_APP_URL}/agendar/{pro.slug}
          </code>
        </CardContent>
      </Card>

      <ProfileForm pro={pro} />

      <Card className="border-destructive/40">
        <CardHeader>
          <CardTitle className="text-destructive">{t('dangerZoneTitle')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">{t('deleteAccountDescription')}</p>
          <DeleteAccountDialog />
        </CardContent>
      </Card>
    </div>
  )
}
