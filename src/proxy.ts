import createMiddleware from 'next-intl/middleware'
import { NextResponse, type NextRequest } from 'next/server'

import { routing } from './i18n/routing'

const intl = createMiddleware(routing)

const primary = new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000')
const alternateHosts = new Set(
  (process.env.ALTERNATE_HOSTS ?? '')
    .split(',')
    .map((h) => h.trim().toLowerCase())
    .filter(Boolean),
)

/** Paths served by Payload, route handlers or static files: no locale handling. */
const bypass = /^\/(api|admin|next|_next|_vercel)(\/|$)|\.[\w]+$/

export default function proxy(request: NextRequest) {
  // Second domain (and www variants) → 301 to the primary domain, keeping path and query (SRS FR-09).
  const host = (request.headers.get('x-forwarded-host') ?? request.headers.get('host') ?? '')
    .split(':')[0]
    .toLowerCase()
  if (alternateHosts.has(host) && host !== primary.hostname) {
    const target = new URL(request.nextUrl.pathname + request.nextUrl.search, primary)
    return NextResponse.redirect(target, 301)
  }

  if (bypass.test(request.nextUrl.pathname)) return NextResponse.next()
  return intl(request)
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
