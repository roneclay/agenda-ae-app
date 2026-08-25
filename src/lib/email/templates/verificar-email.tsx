import { Button, Heading, Text } from '@react-email/components'
import { EmailLayout, styles } from './_layout'

export function VerificarEmailTemplate({ name, url }: { name: string; url: string }) {
  return (
    <EmailLayout>
      <Heading style={styles.heading}>Confirme seu email</Heading>
      <Text style={styles.text}>
        Oi, {name}! Para finalizar seu cadastro no AgendaAe, confirme seu email clicando no botão
        abaixo.
      </Text>
      <Button href={url} style={styles.button}>
        Confirmar email →
      </Button>
      <Text style={{ ...styles.small, marginTop: 24 }}>
        Se você não criou essa conta, pode ignorar este email.
      </Text>
    </EmailLayout>
  )
}
