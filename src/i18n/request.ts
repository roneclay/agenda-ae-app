import { getRequestConfig } from 'next-intl/server'

// Locale único por enquanto (sem roteamento /en, /pt-BR na URL) — trocar de
// idioma no futuro é trocar esse valor + apontar pro arquivo de mensagens
// correspondente em src/i18n/messages/.
const LOCALE = 'pt-BR'

export default getRequestConfig(async () => {
  return {
    locale: LOCALE,
    messages: (await import(`./messages/${LOCALE}.json`)).default,
  }
})
