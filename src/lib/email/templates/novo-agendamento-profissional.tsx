import { Heading, Text } from '@react-email/components'
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
  return (
    <EmailLayout>
      <Heading style={styles.heading}>Novo agendamento 📅</Heading>
      <Text style={styles.text}>Oi, {professionalName}!</Text>
      <Text style={styles.text}>
        <strong>{customerName}</strong> agendou <strong>{service}</strong> para{' '}
        <strong>{scheduledAt}</strong>.
      </Text>
      <Text style={{ ...styles.small, marginTop: 24 }}>Veja todos os detalhes no painel.</Text>
    </EmailLayout>
  )
}
