import Script from 'next/script'

const MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID

// Sem page_view manual: a medição aprimorada do GA4 já registra as mudanças de histórico
// (history.pushState) que o App Router usa nas navegações internas. Enviar manualmente
// aqui contaria cada página duas vezes.
export function GoogleAnalytics() {
  if (!MEASUREMENT_ID) return null

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(MEASUREMENT_ID)}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config',${JSON.stringify(MEASUREMENT_ID)});`}
      </Script>
    </>
  )
}
