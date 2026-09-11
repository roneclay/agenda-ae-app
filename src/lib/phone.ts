/** Normaliza um telefone/WhatsApp pra comparação — só dígitos, sem +, espaço ou hífen. */
export function normalizePhone(phone: string): string {
  return phone.replace(/\D/g, '')
}

/**
 * Formata um telefone brasileiro em E.164 (+55DDDNNNNNNNNN) pra uso com a
 * Twilio. Aceita com ou sem código do país, com ou sem formatação.
 */
export function toE164BR(phone: string): string {
  const digits = normalizePhone(phone)
  const withCountry = digits.startsWith('55') && digits.length >= 12 ? digits : `55${digits}`
  return `+${withCountry}`
}
