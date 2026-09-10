import { Button, Heading, Text } from '@react-email/components'
import { getEmailTranslator } from '../get-translator'
import { EmailLayout, styles } from './_layout'

export function AvisoExclusaoDadosTemplate({ name, daysLeft }: { name: string; daysLeft: number }) {
  const t = getEmailTranslator('emails.avisoExclusaoDados')
  return (
    <EmailLayout>
      <Heading style={styles.heading}>{t('heading', { daysLeft })}</Heading>
      <Text style={styles.text}>{t('intro', { name })}</Text>
      <Button
        href={`${process.env.NEXT_PUBLIC_APP_URL}/dashboard/financeiro`}
        style={styles.button}
      >
        {t('button')}
      </Button>
      <Text style={{ ...styles.small, marginTop: 24 }}>{t('footer')}</Text>
    </EmailLayout>
  )
}
