/**
 * The demo transport: a `fetch` implementation that serves the three
 * platforms' APIs from the simulated world. Connectors in demo mode are the
 * real connectors with this transport injected, so the demo exercises the
 * same OAuth handling, normalisers, pagination, quota accounting and error
 * classification as production.
 *
 * MOCK_FAULTS injects failures per platform (rate limits, expired tokens,
 * outages, timeouts, schema drift) to demonstrate error handling.
 */
import type { Platform } from '../../domain/types'
import type { DemoWorld } from '../world'
import { instagramHandler } from './instagram'
import { tiktokHandler } from './tiktok'
import { DEMO_API_ORIGIN, hang, json, type FaultKind } from './util'
import { youtubeHandler } from './youtube'

export { DEMO_API_ORIGIN, parseFaults, type FaultKind } from './util'

export interface DemoTransportOptions {
  world: DemoWorld
  clock: () => Date
  faults?: Partial<Record<Platform, FaultKind>>
}

function platformOf(path: string): Platform | null {
  if (path.startsWith('/google') || path.startsWith('/youtube')) return 'youtube'
  if (path.startsWith('/instagram') || path.startsWith('/facebook')) return 'instagram'
  if (path.startsWith('/tiktok')) return 'tiktok'
  return null
}

function isTokenEndpoint(path: string): boolean {
  return /\/(token|oauth\/token\/|oauth\/access_token|access_token|refresh_access_token)$/.test(path) || path.endsWith('/oauth/token/')
}

function faultResponse(platform: Platform, fault: FaultKind, path: string, signal: AbortSignal | null | undefined): Promise<Response> | Response | null {
  const token = isTokenEndpoint(path)
  switch (fault) {
    case 'timeout':
      return hang(signal)
    case 'unavailable':
      return platform === 'tiktok'
        ? json({ data: {}, error: { code: 'internal_error', message: 'Simulated outage', log_id: 'demo' } }, 503)
        : json({ error: { code: 503, message: 'Simulated outage (backendError)', errors: [{ reason: 'backendError' }] } }, 503)
    case 'rate_limited':
      if (token) return null
      if (platform === 'youtube') return json({ error: { code: 403, message: 'Simulated rate limit', errors: [{ reason: 'rateLimitExceeded' }] } }, 403)
      if (platform === 'instagram') return json({ error: { message: '(#4) Application request limit reached', type: 'OAuthException', code: 4, is_transient: true } }, 400, { 'x-app-usage': '{"call_count":100,"total_time":64,"total_cputime":40}' })
      return json({ data: {}, error: { code: 'rate_limit_exceeded', message: 'Simulated rate limit', log_id: 'demo' } }, 429)
    case 'auth_expired':
      if (token) {
        // Refresh fails too: the user must reconnect.
        if (platform === 'instagram') return json({ error: { message: 'Error validating access token: Session has expired', type: 'OAuthException', code: 190, error_subcode: 463 } }, 400)
        if (platform === 'tiktok') return json({ error: 'invalid_grant', error_description: 'Refresh token is expired', log_id: 'demo' })
        return json({ error: 'invalid_grant', error_description: 'Token has been expired or revoked.' }, 400)
      }
      if (platform === 'youtube') return json({ error: { code: 401, message: 'Invalid Credentials', errors: [{ reason: 'authError' }] } }, 401)
      if (platform === 'instagram') return json({ error: { message: 'Error validating access token: Session has expired', type: 'OAuthException', code: 190, error_subcode: 463 } }, 400)
      return json({ data: {}, error: { code: 'access_token_invalid', message: 'The access token is invalid or not found in the request.', log_id: 'demo' } }, 401)
    case 'schema_changed':
      if (token) return null
      return json({ unexpected: 'shape', note: 'Simulated schema change' })
  }
}

export function createDemoFetch(options: DemoTransportOptions): typeof fetch {
  return async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    const url = new URL(typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url)
    if (url.origin !== DEMO_API_ORIGIN) {
      // Demo mode never talks to a real platform.
      throw new TypeError(`Demo transport refused a non-demo URL (${url.host})`)
    }
    const platform = platformOf(url.pathname)
    if (!platform) return json({ error: 'unknown demo route' }, 404)
    const fault = options.faults?.[platform]
    if (fault) {
      const faulted = faultResponse(platform, fault, url.pathname, init?.signal)
      if (faulted) return faulted
    }
    const now = options.clock()
    if (platform === 'youtube') return youtubeHandler(options.world, now, url, init)
    if (platform === 'instagram') return instagramHandler(options.world, now, url)
    return tiktokHandler(options.world, now, url, init)
  }
}

/** Endpoints that point each connector at the demo transport (and the local consent page). */
export function demoEndpoints(appUrl: string) {
  const base = appUrl.replace(/\/$/, '')
  return {
    youtube: {
      authorize: `${base}/demo/consent/youtube`,
      token: `${DEMO_API_ORIGIN}/google/token`,
      revoke: `${DEMO_API_ORIGIN}/google/revoke`,
      data: `${DEMO_API_ORIGIN}/youtube/v3`,
      analytics: `${DEMO_API_ORIGIN}/youtubeanalytics/v2`,
    },
    instagram: {
      igAuthorize: `${base}/demo/consent/instagram`,
      igToken: `${DEMO_API_ORIGIN}/instagram/oauth/access_token`,
      igGraph: `${DEMO_API_ORIGIN}/instagram-graph`,
      fbDialog: `${base}/demo/consent/instagram`,
      fbGraph: `${DEMO_API_ORIGIN}/facebook-graph`,
    },
    tiktok: {
      authorize: `${base}/demo/consent/tiktok`,
      api: `${DEMO_API_ORIGIN}/tiktok/v2`,
    },
  }
}
