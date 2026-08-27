/** Normaliza um telefone/WhatsApp pra comparação — só dígitos, sem +, espaço ou hífen. */
export function normalizePhone(phone: string): string {
  return phone.replace(/\D/g, '')
}
