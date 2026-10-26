/**
 * One address per install. On a computer, "localhost" and "127.0.0.1" are the
 * same server but different origins to a browser: a sign-in cookie set on one
 * is not sent to the other, and the OAuth return trip goes to APP_URL. So a
 * page opened on the other loopback name is sent on to APP_URL's. Only
 * loopback hosts are touched; a real deployment behind a proxy is left alone.
 *
 * The hand-off is a small HTML page rather than a 307: Next.js rewrites a
 * Location that points at the server's own address into a relative one, which
 * on the other host name redirects to itself forever.
 */
import { NextResponse, type NextRequest } from 'next/server'

const LOOPBACK = new Set(['localhost', '127.0.0.1', '[::1]'])

const escapeHtml = (s: string) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

export function proxy(request: NextRequest) {
  const appUrl = process.env.APP_URL
  if (!appUrl || (request.method !== 'GET' && request.method !== 'HEAD')) return NextResponse.next()
  let canonical: URL
  try {
    canonical = new URL(appUrl)
  } catch {
    return NextResponse.next()
  }
  const host = request.headers.get('host') ?? ''
  const hostname = host.replace(/:\d+$/, '')
  if (host === canonical.host || !LOOPBACK.has(hostname) || !LOOPBACK.has(canonical.hostname)) return NextResponse.next()
  const target = escapeHtml(new URL(request.nextUrl.pathname + request.nextUrl.search, canonical).href)
  return new NextResponse(
    `<!doctype html><meta charset="utf-8"><meta http-equiv="refresh" content="0;url=${target}"><title>SPOTTER</title><p style="font-family:system-ui,sans-serif;margin:2rem">Opening SPOTTER… <a href="${target}">continue</a></p>`,
    { headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store' } },
  )
}

export const config = { matcher: ['/((?!_next/static|_next/image|favicon.ico|icon.svg).*)'] }
