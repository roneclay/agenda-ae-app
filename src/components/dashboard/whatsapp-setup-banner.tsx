import Link from 'next/link'

export function WhatsappSetupBanner() {
  return (
    <div className="mb-6 flex flex-col gap-3 rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900 sm:flex-row sm:items-center sm:justify-between dark:border-amber-500/40 dark:bg-amber-500/10 dark:text-amber-100">
      <div className="flex items-start gap-3">
        <span aria-hidden className="text-lg leading-none">
          ⚠️
        </span>
        <div>
          <p className="font-medium">Sua integração WhatsApp não está configurada</p>
          <p className="text-amber-900/80 dark:text-amber-100/80">
            Sem ela, seus clientes não recebem confirmações nem lembretes automáticos.
          </p>
        </div>
      </div>
      <Link
        href="/dashboard/whatsapp"
        className="inline-flex shrink-0 items-center justify-center rounded-md bg-amber-600 px-3 py-2 text-xs font-medium text-white hover:bg-amber-700"
      >
        Configurar agora
      </Link>
    </div>
  )
}
