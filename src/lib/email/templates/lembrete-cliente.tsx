import { Button, Heading, Text } from '@react-email/components'
import { getEmailTranslator } from '../get-translator'
import { EmailLayout, styles } from './_layout'

export function LembreteClienteTemplate({
  customerName,
  professionalName,
  service,
  scheduledAt,
  manageUrl,
}: {
  customerName: string
  professionalName: string
  service: string
  scheduledAt: string
  manageUrl: string
}) {
  const t = getEmailTranslator('emails.lembreteCliente')

  return (
    <EmailLayout>
      <Heading style={styles.heading}>{t('heading')}</Heading>
      <Text style={styles.text}>{t('greeting', { customerName })}</Text>
      <Text style={styles.text}>
        {t.rich('intro', {
          professionalName,
          b: (chunks: React.ReactNode) => <strong>{chunks}</strong>,
        })}
      </Text>
      <Text style={styles.text}>
        • {t('serviceLabel')}: <strong>{service}</strong>
        <br />• {t('dateLabel')}: <strong>{scheduledAt}</strong>
      </Text>
      <Button href={manageUrl} style={{ ...styles.button, marginTop: 16 }}>
        {t('manageButton')}
      </Button>
    </EmailLayout>
  )
}
