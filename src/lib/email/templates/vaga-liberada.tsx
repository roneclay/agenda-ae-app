import { Heading, Text } from '@react-email/components'
import { EmailLayout, styles } from './_layout'

export function VagaLiberadaTemplate({
  professionalName,
  customerName,
  scheduledAt,
}: {
  professionalName: string
  customerName: string
  scheduledAt: string
}) {
  return (
    <EmailLayout>
      <Heading style={styles.heading}>Um horário abriu na sua agenda</Heading>
      <Text style={styles.text}>Oi, {professionalName}!</Text>
      <Text style={styles.text}>
        <strong>{customerName}</strong> não confirmou presença no horário das{' '}
        <strong>{scheduledAt}</strong>, então cancelamos automaticamente e liberamos a vaga.
      </Text>
      <Text style={{ ...styles.small, marginTop: 24 }}>
        Você já pode oferecer esse horário para outra pessoa.
      </Text>
    </EmailLayout>
  )
}
