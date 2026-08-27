import { Heading, Text } from '@react-email/components'
import { getEmailTranslator } from '../get-translator'
import { EmailLayout, styles } from './_layout'

export function CancelamentoTemplate({ name, endsAt }: { name: string; endsAt: string }) {
  const t = getEmailTranslator('emails.cancelamento')
  return (
    <EmailLayout>
      <Heading style={styles.heading}>{t('heading')}</Heading>
      <Text style={styles.text}>
        {t.rich('intro', {
          name,
          endsAt,
          b: (chunks: React.ReactNode) => <strong>{chunks}</strong>,
        })}
      </Text>
      <Text style={styles.text}>{t('body')}</Text>
      <Text style={{ ...styles.small, marginTop: 24 }}>{t('footer')}</Text>
    </EmailLayout>
  )
}
