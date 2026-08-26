import { Button, Heading, Text } from '@react-email/components'
import { EmailLayout, styles } from './_layout'

export function BoasVindasEmail({ name }: { name: string }) {
  return (
    <EmailLayout>
      <Heading style={styles.heading}>Bem-vindo(a) ao Agendadinho! 🎉</Heading>
      <Text style={styles.text}>
        Oi, {name}! Sua conta foi criada com sucesso. Agora é só configurar seus serviços e horários
        para começar a receber agendamentos.
      </Text>
      <Button href={`${process.env.NEXT_PUBLIC_APP_URL}/onboarding`} style={styles.button}>
        Configurar minha agenda →
      </Button>
      <Text style={{ ...styles.small, marginTop: 24 }}>
        Você tem 14 dias de trial gratuito no plano Pro. Aproveite!
      </Text>
    </EmailLayout>
  )
}
