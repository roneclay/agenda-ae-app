import { Button, Heading, Text } from '@react-email/components'
import { getEmailTranslator } from '../get-translator'
import { EmailLayout, styles } from './_layout'

export function BoasVindasEmail({ name }: { name: string }) {
  const t = getEmailTranslator('emails.boasVindas')
  return (
    <EmailLayout>
      <Heading style={styles.heading}>{t('heading')}</Heading>
      <Text style={styles.text}>{t('intro', { name })}</Text>
      <Button href={`${process.env.NEXT_PUBLIC_APP_URL}/onboarding`} style={styles.button}>
        {t('button')}
      </Button>
      <Text style={{ ...styles.small, marginTop: 24 }}>{t('footer')}</Text>
    </EmailLayout>
  )
}
