import type { ReactElement } from 'react'
import { FROM, getResend } from './index'
import { AssinaturaAtivaTemplate } from './templates/assinatura-ativa'
import { BoasVindasEmail } from './templates/boas-vindas'
import { CancelamentoTemplate } from './templates/cancelamento'
import { ConfirmacaoClienteTemplate } from './templates/confirmacao-cliente'
import { LembreteClienteTemplate } from './templates/lembrete-cliente'
import { NovoAgendamentoProfissionalTemplate } from './templates/novo-agendamento-profissional'
import { PagamentoConfirmadoTemplate } from './templates/pagamento-confirmado'
import { PagamentoFalhouTemplate } from './templates/pagamento-falhou'
import { ResetarSenhaTemplate } from './templates/resetar-senha'
import { TrialExpiradoTemplate } from './templates/trial-expirado'
import { TrialExpirandoTemplate } from './templates/trial-expirando'
import { VerificarEmailTemplate } from './templates/verificar-email'

const MOCK = process.env.EMAIL_MOCK === 'true'

async function send({
  to,
  subject,
  react,
}: {
  to: string
  subject: string
  react: () => ReactElement
}) {
  if (MOCK) {
    console.log(`\n📧 [EMAIL MOCK] Para: ${to} | Assunto: ${subject}`)
    return { id: 'mock-id' }
  }
  const result = await getResend().emails.send({ from: FROM, to, subject, react: react() })
  if ('error' in result && result.error) {
    console.error(`[RESEND ERROR] Para: ${to} | ${JSON.stringify(result.error)}`)
  }
  return result
}

export async function sendVerificationEmail({
  to,
  name,
  url,
}: {
  to: string
  name: string
  url: string
}) {
  if (MOCK) {
    console.log(`\n📧 [EMAIL MOCK] Verificação para ${to}\n🔗 ${url}\n`)
  }
  return send({
    to,
    subject: 'Confirme seu email — AgendaAe',
    react: () => VerificarEmailTemplate({ name, url }),
  })
}

export async function sendResetPasswordEmail({
  to,
  name,
  url,
}: {
  to: string
  name: string
  url: string
}) {
  if (MOCK) {
    console.log(`\n📧 [EMAIL MOCK] Reset de senha para ${to}\n🔗 ${url}\n`)
  }
  return send({
    to,
    subject: 'Redefinir sua senha — AgendaAe',
    react: () => ResetarSenhaTemplate({ name, url }),
  })
}

export async function sendBoasVindas({ to, name }: { to: string; name: string }) {
  return send({
    to,
    subject: `Bem-vindo(a) ao AgendaAe, ${name}!`,
    react: () => BoasVindasEmail({ name }),
  })
}

export async function sendTrialExpirando({
  to,
  name,
  daysLeft,
}: {
  to: string
  name: string
  daysLeft: number
}) {
  return send({
    to,
    subject: `Faltam ${daysLeft} dias do seu trial — AgendaAe`,
    react: () => TrialExpirandoTemplate({ name, daysLeft }),
  })
}

export async function sendTrialExpirado({ to, name }: { to: string; name: string }) {
  return send({
    to,
    subject: 'Seu trial acabou — não perca seu link 😢',
    react: () => TrialExpiradoTemplate({ name }),
  })
}

export async function sendAssinaturaAtiva({ to, name }: { to: string; name: string }) {
  return send({
    to,
    subject: 'Assinatura Pro ativada! 🎉 — AgendaAe',
    react: () => AssinaturaAtivaTemplate({ name }),
  })
}

export async function sendPagamentoConfirmado({
  to,
  name,
  amount,
  month,
}: {
  to: string
  name: string
  amount: string
  month: string
}) {
  return send({
    to,
    subject: `Pagamento confirmado — ${month}`,
    react: () => PagamentoConfirmadoTemplate({ name, amount, month }),
  })
}

export async function sendPagamentoFalhou({ to, name }: { to: string; name: string }) {
  return send({
    to,
    subject: 'Não conseguimos cobrar sua assinatura ⚠️',
    react: () => PagamentoFalhouTemplate({ name }),
  })
}

export async function sendCancelamento({
  to,
  name,
  endsAt,
}: {
  to: string
  name: string
  endsAt: string
}) {
  return send({
    to,
    subject: 'Assinatura cancelada — AgendaAe',
    react: () => CancelamentoTemplate({ name, endsAt }),
  })
}

export async function sendNovoAgendamentoProfissional({
  to,
  professionalName,
  customerName,
  service,
  scheduledAt,
}: {
  to: string
  professionalName: string
  customerName: string
  service: string
  scheduledAt: string
}) {
  return send({
    to,
    subject: `Novo agendamento — ${customerName}`,
    react: () =>
      NovoAgendamentoProfissionalTemplate({
        professionalName,
        customerName,
        service,
        scheduledAt,
      }),
  })
}

export async function sendConfirmacaoCliente({
  to,
  customerName,
  professionalName,
  service,
  scheduledAt,
}: {
  to: string
  customerName: string
  professionalName: string
  service: string
  scheduledAt: string
}) {
  return send({
    to,
    subject: `Agendamento confirmado — ${service}`,
    react: () =>
      ConfirmacaoClienteTemplate({
        customerName,
        professionalName,
        service,
        scheduledAt,
      }),
  })
}

export async function sendLembreteCliente({
  to,
  customerName,
  professionalName,
  service,
  scheduledAt,
}: {
  to: string
  customerName: string
  professionalName: string
  service: string
  scheduledAt: string
}) {
  return send({
    to,
    subject: 'Lembrete — seu agendamento é amanhã ⏰',
    react: () =>
      LembreteClienteTemplate({
        customerName,
        professionalName,
        service,
        scheduledAt,
      }),
  })
}
