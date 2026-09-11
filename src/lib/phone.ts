/** Normaliza um telefone/WhatsApp pra comparação — só dígitos, sem +, espaço ou hífen. */
export function normalizePhone(phone: string): string {
  return phone.replace(/\D/g, '')
}

/** Aplica máscara (DD) 9NNNN-NNNN progressivamente enquanto o usuário digita. */
export function maskPhoneBR(value: string): string {
  const d = normalizePhone(value).slice(0, 11)
  if (d.length === 0) return ''
  if (d.length <= 2) return `(${d}`
  if (d.length <= 7) return `(${d.slice(0, 2)}) ${d.slice(2)}`
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`
}

/** Valida celular brasileiro: DDD (11-99) + 9 + 8 dígitos = 11 dígitos. */
export function isValidPhoneBR(phone: string): boolean {
  let digits = normalizePhone(phone)
  if (digits.length === 13 && digits.startsWith('55')) digits = digits.slice(2)
  return /^[1-9][1-9]9\d{8}$/.test(digits)
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
