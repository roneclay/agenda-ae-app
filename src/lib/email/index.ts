import { Resend } from 'resend'

let _resend: Resend | null = null

export function getResend(): Resend {
  if (_resend) return _resend
  const key = process.env.RESEND_API_KEY || 're_mock_key'
  _resend = new Resend(key)
  return _resend
}

export const FROM = process.env.EMAIL_FROM ?? 'AgendaAe <noreply@agendaae.com.br>'
