'use client'

import { usePathname, useSearchParams } from 'next/navigation'
import Script from 'next/script'
import { useEffect, useRef } from 'react'

const PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID

type Fbq = (...args: unknown[]) => void

declare global {
  interface Window {
    fbq?: Fbq
  }
}

export function MetaPixel() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  // Last tracked location. Refs survive the Strict Mode effect re-run in dev,
  // so the same location is never tracked twice.
  const lastTracked = useRef<string | null>(null)

  const search = searchParams.toString()
  const location = search ? `${pathname}?${search}` : pathname

  useEffect(() => {
    if (!PIXEL_ID) return
    if (lastTracked.current === location) return
    const isInitialLoad = lastTracked.current === null
    lastTracked.current = location
    // The initial PageView is fired by the base snippet below; the effect
    // only handles client-side navigations afterwards.
    if (isInitialLoad) return
    window.fbq?.('track', 'PageView')
  }, [location])

  if (!PIXEL_ID) return null

  return (
    <Script id="meta-pixel" strategy="afterInteractive">
      {`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init',${JSON.stringify(PIXEL_ID)});fbq('track','PageView');`}
    </Script>
  )
}
