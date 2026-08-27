import type { ReactElement } from 'react'
import { getEmailTranslator } from './get-translator'
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
import { VagaLiberadaTemplate } from './templates/vaga-liberada'
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
  const t = getEmailTranslator('emails.verificarEmail')
  return send({
    to,
    subject: t('subject'),
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
  const t = getEmailTranslator('emails.resetarSenha')
  return send({
    to,
    subject: t('subject'),
    react: () => ResetarSenhaTemplate({ name, url }),
  })
}

export async function sendBoasVindas({ to, name }: { to: string; name: string }) {
  const t = getEmailTranslator('emails.boasVindas')
  return send({
    to,
    subject: t('subject', { name }),
    react: () => BoasVindasEmail({ name }),
  })
}

export async function sendTrialExpirando({
  to,
  name,
  daysLeft,
  priceLabel,
}: {
  to: string
  name: string
  daysLeft: number
  priceLabel: string
}) {
  const t = getEmailTranslator('emails.trialExpirando')
  return send({
    to,
    subject: t('subject', { daysLeft }),
    react: () => TrialExpirandoTemplate({ name, daysLeft, priceLabel }),
  })
}

export async function sendTrialExpirado({ to, name }: { to: string; name: string }) {
  const t = getEmailTranslator('emails.trialExpirado')
  return send({
    to,
    subject: t('subject'),
    react: () => TrialExpiradoTemplate({ name }),
  })
}

export async function sendAssinaturaAtiva({ to, name }: { to: string; name: string }) {
  const t = getEmailTranslator('emails.assinaturaAtiva')
  return send({
    to,
    subject: t('subject'),
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
  const t = getEmailTranslator('emails.pagamentoConfirmado')
  return send({
    to,
    subject: t('subject', { month }),
    react: () => PagamentoConfirmadoTemplate({ name, amount, month }),
  })
}

export async function sendPagamentoFalhou({ to, name }: { to: string; name: string }) {
  const t = getEmailTranslator('emails.pagamentoFalhou')
  return send({
    to,
    subject: t('subject'),
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
  const t = getEmailTranslator('emails.cancelamento')
  return send({
    to,
    subject: t('subject'),
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
  const t = getEmailTranslator('emails.novoAgendamentoProfissional')
  return send({
    to,
    subject: t('subject', { customerName }),
    react: () =>
      NovoAgendamentoProfissionalTemplate({
        professionalName,
        customerName,
        service,
        scheduledAt,
      }),
  })
}

export async function sendVagaLiberada({
  to,
  professionalName,
  customerName,
  scheduledAt,
}: {
  to: string
  professionalName: string
  customerName: string
  scheduledAt: string
}) {
  const t = getEmailTranslator('emails.vagaLiberada')
  return send({
    to,
    subject: t('subject'),
    react: () => VagaLiberadaTemplate({ professionalName, customerName, scheduledAt }),
  })
}

export async function sendConfirmacaoCliente({
  to,
  customerName,
  professionalName,
  service,
  scheduledAt,
  manageUrl,
}: {
  to: string
  customerName: string
  professionalName: string
  service: string
  scheduledAt: string
  manageUrl: string
}) {
  const t = getEmailTranslator('emails.confirmacaoCliente')
  return send({
    to,
    subject: t('subject', { service }),
    react: () =>
      ConfirmacaoClienteTemplate({
        customerName,
        professionalName,
        service,
        scheduledAt,
        manageUrl,
      }),
  })
}

export async function sendLembreteCliente({
  to,
  customerName,
  professionalName,
  service,
  scheduledAt,
  manageUrl,
}: {
  to: string
  customerName: string
  professionalName: string
  service: string
  scheduledAt: string
  manageUrl: string
}) {
  const t = getEmailTranslator('emails.lembreteCliente')
  return send({
    to,
    subject: t('subject'),
    react: () =>
      LembreteClienteTemplate({
        customerName,
        professionalName,
        service,
        scheduledAt,
        manageUrl,
      }),
  })
}
