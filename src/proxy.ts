import createMiddleware from 'next-intl/middleware'
import { NextResponse, type NextRequest } from 'next/server'

import { routing } from './i18n/routing'
import { isDemoMode } from './lib/demoMode'
import { siteUrl } from './lib/site'

const intl = createMiddleware(routing)

const primary = new URL(siteUrl)
const alternateHosts = new Set(
  (process.env.ALTERNATE_HOSTS ?? '')
    .split(',')
    .map((h) => h.trim().toLowerCase())
    .filter(Boolean),
)

const demoNotice = `<!doctype html><html lang="vi"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Chế độ demo</title></head>
<body style="margin:0;min-height:100vh;display:grid;place-items:center;background:#072552;color:#fff;font-family:system-ui,sans-serif;text-align:center;padding:24px">
<div><p style="letter-spacing:.2em;font-size:12px;color:#c8963e;text-transform:uppercase">Realtek Telecom</p>
<h1 style="font-size:24px;margin:12px 0">Website đang chạy ở chế độ demo</h1>
<p style="opacity:.75;max-width:460px">Trang quản trị sẽ hoạt động khi website được kết nối cơ sở dữ liệu.</p>
<p><a href="/" style="color:#fff">Về trang chủ</a></p></div></body></html>`

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

  // Demo mode has no database: keep Payload's admin and API from trying to connect to one.
  if (isDemoMode && /^\/(admin|api)(\/|$)/.test(request.nextUrl.pathname)) {
    return new NextResponse(demoNotice, {
      status: 503,
      headers: { 'Content-Type': 'text/html; charset=utf-8', 'X-Robots-Tag': 'noindex' },
    })
  }

  if (bypass.test(request.nextUrl.pathname)) return NextResponse.next()
  return intl(request)
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
