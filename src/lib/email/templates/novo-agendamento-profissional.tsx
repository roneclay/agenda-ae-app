import { Heading, Text } from '@react-email/components'
import { getEmailTranslator } from '../get-translator'
import { EmailLayout, styles } from './_layout'

export function NovoAgendamentoProfissionalTemplate({
  professionalName,
  customerName,
  service,
  scheduledAt,
}: {
  professionalName: string
  customerName: string
  service: string
  scheduledAt: string
}) {
  const t = getEmailTranslator('emails.novoAgendamentoProfissional')
  return (
    <EmailLayout>
      <Heading style={styles.heading}>{t('heading')}</Heading>
      <Text style={styles.text}>{t('greeting', { professionalName })}</Text>
      <Text style={styles.text}>
        {t.rich('body', {
          customerName,
          service,
          scheduledAt,
          b: (chunks: React.ReactNode) => <strong>{chunks}</strong>,
        })}
      </Text>
      <Text style={{ ...styles.small, marginTop: 24 }}>{t('footer')}</Text>
    </EmailLayout>
  )
}
