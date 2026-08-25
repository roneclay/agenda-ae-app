import { Body, Container, Head, Hr, Html, Text } from '@react-email/components'
import type { ReactNode } from 'react'

export function EmailLayout({ children }: { children: ReactNode }) {
  return (
    <Html>
      <Head />
      <Body
        style={{
          fontFamily: 'sans-serif',
          background: '#FBF6F0',
          padding: '40px 0',
        }}
      >
        <Container
          style={{
            background: '#fff',
            borderRadius: 12,
            padding: '40px',
            maxWidth: 520,
          }}
        >
          {children}
          <Hr style={{ margin: '32px 0', borderColor: '#E2D0C0' }} />
          <Text style={{ color: '#8A6A58', fontSize: 12 }}>
            AgendaAe · Agendamento WhatsApp-first para profissionais autônomos
          </Text>
        </Container>
      </Body>
    </Html>
  )
}

export const styles = {
  heading: { color: '#C85C30', fontSize: 28, marginBottom: 8 },
  text: { color: '#4A3020', fontSize: 16, lineHeight: 1.6 },
  small: { color: '#8A6A58', fontSize: 13 },
  button: {
    background: '#C85C30',
    color: '#fff',
    padding: '14px 28px',
    borderRadius: 8,
    textDecoration: 'none',
    display: 'inline-block',
    fontWeight: 600,
  },
}
