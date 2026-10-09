'use client'

import { usePathname } from 'next/navigation'
import { useEffect } from 'react'
import { type TrackEvent, takePendingEvents, trackEvent } from '@/lib/track'

const POLL_MS = 500
// O pixel carrega em afterInteractive e pode chegar depois da hidratação.
const FBQ_WAIT_MS = 5000
const TRACKED_ROUTES = ['/onboarding', '/dashboard']

/**
 * Dispara os eventos de conversão que o servidor deixou em cookie. Roda por polling porque a
 * server action do onboarding redireciona pra mesma URL (/onboarding), então nem a montagem
 * nem o pathname mudam. O polling só existe nas rotas onde os eventos nascem.
 */
export function TrackBridge() {
  const pathname = usePathname()
  const active = TRACKED_ROUTES.some((route) => pathname.startsWith(route))

  useEffect(() => {
    if (!active) return

    const queue: TrackEvent[] = []
    let waitingSince: number | null = null

    function tick() {
      queue.push(...takePendingEvents())
      if (queue.length === 0) return

      if (!window.fbq) {
        waitingSince ??= Date.now()
        if (Date.now() - waitingSince < FBQ_WAIT_MS) return
      }
      waitingSince = null
      for (const event of queue.splice(0)) trackEvent(event)
    }

    tick()
    const id = setInterval(tick, POLL_MS)
    return () => clearInterval(id)
  }, [active])

  return null
}
