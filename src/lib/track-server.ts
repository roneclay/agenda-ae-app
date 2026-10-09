import { cookies } from 'next/headers'
import { type TrackEvent, trackCookieName } from '@/lib/track'

/**
 * Marca um evento de conversão pra ser disparado no cliente. Server actions terminam em
 * redirect(), então o cookie (um por evento, de vida curta) é a ponte até o TrackBridge.
 */
export async function queueTrackEvent(event: TrackEvent): Promise<void> {
  const store = await cookies()
  store.set(trackCookieName(event), '1', { path: '/', maxAge: 60, sameSite: 'lax' })
}
