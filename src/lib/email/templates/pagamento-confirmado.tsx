import { Heading, Text } from '@react-email/components'
import { getEmailTranslator } from '../get-translator'
import { EmailLayout, styles } from './_layout'

export function PagamentoConfirmadoTemplate({
  name,
  amount,
  month,
}: {
  name: string
  amount: string
  month: string
}) {
  const t = getEmailTranslator('emails.pagamentoConfirmado')
  return (
    <EmailLayout>
      <Heading style={styles.heading}>{t('heading')}</Heading>
      <Text style={styles.text}>
        {t.rich('intro', {
          name,
          amount,
          month,
          b: (chunks: React.ReactNode) => <strong>{chunks}</strong>,
        })}
      </Text>
      <Text style={styles.text}>{t('body')}</Text>
      <Text style={{ ...styles.small, marginTop: 24 }}>{t('footer')}</Text>
    </EmailLayout>
  )
}
