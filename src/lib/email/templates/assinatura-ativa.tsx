import { Button, Heading, Text } from '@react-email/components'
import { EmailLayout, styles } from './_layout'

export function AssinaturaAtivaTemplate({ name }: { name: string }) {
  return (
    <EmailLayout>
      <Heading style={styles.heading}>Plano Pro ativado! 🎉</Heading>
      <Text style={styles.text}>
        Tudo certo, {name}! Sua assinatura Pro está ativa e seu link público voltou no ar.
      </Text>
      <Button href={`${process.env.NEXT_PUBLIC_APP_URL}/dashboard`} style={styles.button}>
        Ir para o painel →
      </Button>
    </EmailLayout>
  )
}
