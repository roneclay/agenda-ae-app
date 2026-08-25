import { Button, Heading, Text } from '@react-email/components'
import { EmailLayout, styles } from './_layout'

export function ResetarSenhaTemplate({ name, url }: { name: string; url: string }) {
  return (
    <EmailLayout>
      <Heading style={styles.heading}>Redefinir sua senha</Heading>
      <Text style={styles.text}>
        Oi, {name}! Recebemos um pedido para redefinir sua senha. Clique no botão abaixo para criar
        uma nova.
      </Text>
      <Button href={url} style={styles.button}>
        Redefinir senha →
      </Button>
      <Text style={{ ...styles.small, marginTop: 24 }}>
        Este link expira em 1 hora. Se você não pediu isso, ignore o email.
      </Text>
    </EmailLayout>
  )
}
