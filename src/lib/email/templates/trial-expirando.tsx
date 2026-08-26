import { Button, Heading, Text } from '@react-email/components'
import { EmailLayout, styles } from './_layout'

export function TrialExpirandoTemplate({
  name,
  daysLeft,
  priceLabel,
}: {
  name: string
  daysLeft: number
  priceLabel: string
}) {
  return (
    <EmailLayout>
      <Heading style={styles.heading}>
        Seu trial acaba em {daysLeft} {daysLeft === 1 ? 'dia' : 'dias'}
      </Heading>
      <Text style={styles.text}>
        Oi, {name}! Você está no plano Pro grátis há quase 14 dias. Para não perder seu link público
        e os agendamentos automáticos, ative sua assinatura agora.
      </Text>
      <Button
        href={`${process.env.NEXT_PUBLIC_APP_URL}/dashboard/financeiro`}
        style={styles.button}
      >
        Ativar plano Pro →
      </Button>
      <Text style={{ ...styles.small, marginTop: 24 }}>
        Apenas {priceLabel}/mês via Pix ou cartão. Cancele quando quiser.
      </Text>
    </EmailLayout>
  )
}
