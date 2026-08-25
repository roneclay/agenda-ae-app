import { Heading, Text } from '@react-email/components'
import { EmailLayout, styles } from './_layout'

export function LembreteClienteTemplate({
  customerName,
  professionalName,
  service,
  scheduledAt,
}: {
  customerName: string
  professionalName: string
  service: string
  scheduledAt: string
}) {
  return (
    <EmailLayout>
      <Heading style={styles.heading}>Seu agendamento é amanhã ⏰</Heading>
      <Text style={styles.text}>Oi, {customerName}!</Text>
      <Text style={styles.text}>
        Lembrete do seu agendamento com <strong>{professionalName}</strong>:
      </Text>
      <Text style={styles.text}>
        • Serviço: <strong>{service}</strong>
        <br />• Data: <strong>{scheduledAt}</strong>
      </Text>
      <Text style={{ ...styles.small, marginTop: 24 }}>
        Precisa remarcar? É só responder este email ou falar pelo WhatsApp.
      </Text>
    </EmailLayout>
  )
}
