export type TrackEvent = 'trial_iniciado' | 'cadastro_completo'

// Ordem em que os eventos pendentes são entregues: o trial sempre vem antes do cadastro completo.
export const TRACK_EVENT_ORDER: readonly TrackEvent[] = ['trial_iniciado', 'cadastro_completo']

const PIXEL_EVENT: Record<TrackEvent, string> = {
  trial_iniciado: 'StartTrial',
  cadastro_completo: 'CompleteRegistration',
}

type Gtag = (...args: unknown[]) => void

declare global {
  interface Window {
    gtag?: Gtag
  }
}

export const trackCookieName = (event: TrackEvent) => `track_${event}`

/** Dispara o evento no Meta Pixel (fbq) e no GA4 (gtag), quando existirem. Nunca lança. */
export function trackEvent(event: TrackEvent): void {
  if (typeof window === 'undefined') return
  try {
    window.fbq?.('track', PIXEL_EVENT[event])
    window.gtag?.('event', event)
  } catch {
    // Tracking nunca pode quebrar o app.
  }
}

/**
 * Lê e apaga os cookies de eventos pendentes (gravados pelo servidor), na ordem de
 * TRACK_EVENT_ORDER. Cada evento sai uma única vez: o cookie é apagado ao ser lido.
 */
export function takePendingEvents(): TrackEvent[] {
  if (typeof document === 'undefined') return []
  const cookies = document.cookie.split(';').map((c) => c.trim().split('=')[0])
  const pending: TrackEvent[] = []
  for (const event of TRACK_EVENT_ORDER) {
    const name = trackCookieName(event)
    if (!cookies.includes(name)) continue
    // biome-ignore lint/suspicious/noDocumentCookie: Cookie Store API não é suportada em todos os navegadores
    document.cookie = `${name}=; path=/; max-age=0`
    pending.push(event)
  }
  return pending
}
