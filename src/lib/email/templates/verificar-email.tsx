import { Button, Heading, Text } from '@react-email/components'
import { getEmailTranslator } from '../get-translator'
import { EmailLayout, styles } from './_layout'

export function VerificarEmailTemplate({ name, url }: { name: string; url: string }) {
  const t = getEmailTranslator('emails.verificarEmail')
  return (
    <EmailLayout>
      <Heading style={styles.heading}>{t('heading')}</Heading>
      <Text style={styles.text}>{t('intro', { name })}</Text>
      <Button href={url} style={styles.button}>
        {t('button')}
      </Button>
      <Text style={{ ...styles.small, marginTop: 24 }}>{t('footer')}</Text>
    </EmailLayout>
  )
}
