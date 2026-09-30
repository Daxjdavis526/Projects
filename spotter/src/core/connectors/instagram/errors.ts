/**
 * Meta error bodies → ConnectorError.
 *
 * Graph API: { "error": { "message", "type", "code", "error_subcode", "fbtrace_id", "is_transient" } }
 * Instagram Login token endpoint: { "error_type", "code", "error_message" }
 * Codes from developers.facebook.com/docs/graph-api/guides/error-handling and
 * the rate-limiting guide (checked 2026-09-29).
 */
import type { RateLimitInfo } from '../../domain/types'
import { ConnectorError } from '../errors'
import { classifyByStatus, type ErrorClassifier } from '../http'

interface GraphErrorBody {
  error?: { message?: string; type?: string; code?: number; error_subcode?: number; is_transient?: boolean } | string
  error_type?: string
  code?: number
  error_message?: string
  error_description?: string
}

export function classifyMetaError(operation: string): ErrorClassifier {
  return ({ status, body }) => {
    const b = (body ?? {}) as GraphErrorBody
    const graph = typeof b.error === 'object' ? b.error : null
    const code = graph?.code ?? b.code ?? null
    const sub = graph?.error_subcode ?? null
    const detail = graph?.message ?? b.error_message ?? (typeof b.error === 'string' ? b.error_description ?? b.error : '') ?? ''
    const base = { platform: 'instagram' as const, operation, httpStatus: status, platformCode: code === null ? null : sub ? `${code}/${sub}` : code }
    const message = `${operation}: ${detail || `HTTP ${status}`}`

    if (code === 190) {
      const revoked = sub === 458 || sub === 460
      return new ConnectorError({ ...base, kind: revoked ? 'auth_revoked' : 'auth_expired', message })
    }
    if (code === 10 || (code !== null && code >= 200 && code <= 299)) {
      return new ConnectorError({ ...base, kind: 'scope_missing', message })
    }
    if (code === 4 || code === 17 || code === 32 || code === 613 || code === 341 || code === 80002) {
      return new ConnectorError({ ...base, kind: 'rate_limited', message })
    }
    if (code === 1 || code === 2 || graph?.is_transient) {
      return new ConnectorError({ ...base, kind: 'unavailable', message })
    }
    if (code === 368) return new ConnectorError({ ...base, kind: 'forbidden', message })
    if (code === 100) {
      if (sub === 33 || /does not exist|cannot be loaded/i.test(detail)) return new ConnectorError({ ...base, kind: 'not_found', message })
      return new ConnectorError({ ...base, kind: 'bad_request', message })
    }
    if (b.error_type === 'OAuthException') {
      return new ConnectorError({ ...base, kind: status === 400 ? 'bad_request' : 'auth_expired', message })
    }
    return classifyByStatus('instagram', operation, status, detail, base.platformCode)
  }
}

/** Parse X-App-Usage / X-Business-Use-Case-Usage (percentages of the allowance used). */
export function parseMetaUsage(headers: Headers, now: Date): RateLimitInfo | null {
  let worst: { pct: number; regainMinutes: number | null; source: string } | null = null
  const consider = (pct: number, regainMinutes: number | null, source: string) => {
    if (!worst || pct > worst.pct) worst = { pct, regainMinutes, source }
  }
  const app = headers.get('x-app-usage')
  if (app) {
    try {
      const u = JSON.parse(app) as { call_count?: number; total_time?: number; total_cputime?: number }
      consider(Math.max(u.call_count ?? 0, u.total_time ?? 0, u.total_cputime ?? 0), null, 'app')
    } catch {
      // Unparseable header: ignore rather than fail the call.
    }
  }
  const buc = headers.get('x-business-use-case-usage')
  if (buc) {
    try {
      const u = JSON.parse(buc) as Record<string, Array<{ type?: string; call_count?: number; total_time?: number; total_cputime?: number; estimated_time_to_regain_access?: number }>>
      for (const entries of Object.values(u)) {
        for (const e of entries ?? []) {
          consider(Math.max(e.call_count ?? 0, e.total_time ?? 0, e.total_cputime ?? 0), e.estimated_time_to_regain_access ?? null, e.type ?? 'business use case')
        }
      }
    } catch {
      // ignore
    }
  }
  if (!worst) return null
  const w = worst as { pct: number; regainMinutes: number | null; source: string }
  return {
    kind: 'usage_percent',
    used: w.pct,
    limit: 100,
    remaining: Math.max(0, 100 - w.pct),
    resetAt: w.regainMinutes ? new Date(now.getTime() + w.regainMinutes * 60_000).toISOString() : null,
    windowLabel: 'rolling window (percent of allowance used)',
    observedAt: now.toISOString(),
    note: `Highest reported usage: ${w.source}`,
  }
}
