import { createTranslator } from 'use-intl'
import messages from '@/i18n/messages/pt-BR.json'

/**
 * E-mails (React Email) não rodam dentro do request do Next.js, então não têm
 * acesso a getTranslations()/useTranslations(). Usa o core do next-intl
 * (use-intl) direto com as mesmas mensagens de src/i18n/messages/pt-BR.json.
 *
 * O namespace é dinâmico (string simples), então a checagem estrita de chave
 * do next-intl é intencionalmente relaxada aqui — não dá pra validar em
 * tempo de compilação um namespace passado como string comum.
 */
export function getEmailTranslator(namespace: string) {
  // biome-ignore lint/suspicious/noExplicitAny: bypass intencional do tipo estrito de namespace
  return createTranslator({ locale: 'pt-BR', messages, namespace: namespace as any }) as any
}
