import { getTranslations } from 'next-intl/server'
import { SUPPORT_EMAIL } from '@/lib/config/niches'

export async function SupportFooter() {
  const t = await getTranslations('supportFooter')

  return (
    <footer className="border-t border-border/60 py-6 text-center text-sm text-muted-foreground">
      {t('label')}{' '}
      <a href={`mailto:${SUPPORT_EMAIL}`} className="underline hover:text-foreground">
        {SUPPORT_EMAIL}
      </a>
    </footer>
  )
}
