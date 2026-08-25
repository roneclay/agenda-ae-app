import { Button, Heading, Text } from '@react-email/components'
import { EmailLayout, styles } from './_layout'

export function TrialExpiradoTemplate({ name }: { name: string }) {
  return (
    <EmailLayout>
      <Heading style={styles.heading}>Seu trial acabou 😢</Heading>
      <Text style={styles.text}>
        Oi, {name}! Seu período de trial chegou ao fim. Seu link público foi pausado, mas tudo o que
        você configurou continua salvo.
      </Text>
      <Button
        href={`${process.env.NEXT_PUBLIC_APP_URL}/dashboard/financeiro`}
        style={styles.button}
      >
        Ativar plano Pro agora →
      </Button>
      <Text style={{ ...styles.small, marginTop: 24 }}>
        Reativando, seu link volta no ar em segundos.
      </Text>
    </EmailLayout>
  )
}
