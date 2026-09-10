import { type NextRequest, NextResponse } from 'next/server'
import { getNicheFromHost } from '@/lib/config/niches'

const PROTECTED_PREFIXES = ['/dashboard', '/onboarding']

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  const host = req.headers.get('host') ?? ''
  const niche = getNicheFromHost(host)

  const requestHeaders = new Headers(req.headers)
  requestHeaders.set('x-niche', niche.niche)
  requestHeaders.set('x-pathname', pathname)
  const res = NextResponse.next({ request: { headers: requestHeaders } })

  if (PROTECTED_PREFIXES.some((p) => pathname.startsWith(p))) {
    const sessionCookie =
      req.cookies.get('better-auth.session_token') ??
      req.cookies.get('__Secure-better-auth.session_token')

    if (!sessionCookie) {
      const url = req.nextUrl.clone()
      url.pathname = '/login'
      url.searchParams.set('redirect', pathname)
      return NextResponse.redirect(url)
    }
  }

  return res
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
