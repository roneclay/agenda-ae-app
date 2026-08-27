import { Button, Heading, Text } from '@react-email/components'
import { getEmailTranslator } from '../get-translator'
import { EmailLayout, styles } from './_layout'

export function PagamentoFalhouTemplate({ name }: { name: string }) {
  const t = getEmailTranslator('emails.pagamentoFalhou')
  return (
    <EmailLayout>
      <Heading style={styles.heading}>{t('heading')}</Heading>
      <Text style={styles.text}>{t('intro', { name })}</Text>
      <Text style={styles.text}>{t('body')}</Text>
      <Button
        href={`${process.env.NEXT_PUBLIC_APP_URL}/dashboard/financeiro`}
        style={styles.button}
      >
        {t('button')}
      </Button>
    </EmailLayout>
  )
}
