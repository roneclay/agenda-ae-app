import { Heading, Text } from '@react-email/components'
import { EmailLayout, styles } from './_layout'

export function ConfirmacaoClienteTemplate({
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
      <Heading style={styles.heading}>Agendamento confirmado ✅</Heading>
      <Text style={styles.text}>Oi, {customerName}!</Text>
      <Text style={styles.text}>
        Seu agendamento com <strong>{professionalName}</strong> foi confirmado:
      </Text>
      <Text style={styles.text}>
        • Serviço: <strong>{service}</strong>
        <br />• Data: <strong>{scheduledAt}</strong>
      </Text>
      <Text style={{ ...styles.small, marginTop: 24 }}>
        Você receberá um lembrete 24h antes pelo WhatsApp.
      </Text>
    </EmailLayout>
  )
}
