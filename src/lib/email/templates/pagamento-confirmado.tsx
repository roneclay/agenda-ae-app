import { Heading, Text } from '@react-email/components'
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
  return (
    <EmailLayout>
      <Heading style={styles.heading}>Pagamento confirmado ✅</Heading>
      <Text style={styles.text}>
        Oi, {name}! Recebemos seu pagamento de <strong>{amount}</strong> referente a{' '}
        <strong>{month}</strong>.
      </Text>
      <Text style={styles.text}>
        Sua assinatura segue ativa. Sem boleto, sem fatura, sem dor de cabeça.
      </Text>
      <Text style={{ ...styles.small, marginTop: 24 }}>Obrigado por confiar no AgendaAe!</Text>
    </EmailLayout>
  )
}
