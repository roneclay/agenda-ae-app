import { Button, Heading, Text } from '@react-email/components'
import { EmailLayout, styles } from './_layout'

export function PagamentoFalhouTemplate({ name }: { name: string }) {
  return (
    <EmailLayout>
      <Heading style={styles.heading}>Não conseguimos cobrar ⚠️</Heading>
      <Text style={styles.text}>
        Oi, {name}. A cobrança automática da sua assinatura falhou. Vamos tentar de novo nas
        próximas horas.
      </Text>
      <Text style={styles.text}>Se preferir, você pode pagar manualmente agora pelo painel.</Text>
      <Button
        href={`${process.env.NEXT_PUBLIC_APP_URL}/dashboard/financeiro`}
        style={styles.button}
      >
        Pagar agora →
      </Button>
    </EmailLayout>
  )
}
