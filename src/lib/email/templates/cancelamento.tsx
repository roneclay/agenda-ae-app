import { Heading, Text } from '@react-email/components'
import { EmailLayout, styles } from './_layout'

export function CancelamentoTemplate({ name, endsAt }: { name: string; endsAt: string }) {
  return (
    <EmailLayout>
      <Heading style={styles.heading}>Assinatura cancelada</Heading>
      <Text style={styles.text}>
        Oi, {name}. Seu cancelamento foi registrado. Você ainda tem acesso completo até{' '}
        <strong>{endsAt}</strong>.
      </Text>
      <Text style={styles.text}>
        Se mudar de ideia, é só reativar pelo painel — seus dados ficam guardados.
      </Text>
      <Text style={{ ...styles.small, marginTop: 24 }}>Sentiremos sua falta. Volte sempre 🧡</Text>
    </EmailLayout>
  )
}
