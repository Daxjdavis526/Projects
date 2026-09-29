/**
 * Secret redaction for logs, stored events and error messages.
 *
 * Platform APIs put secrets in places that are easy to log by accident: the
 * Instagram Graph API takes `access_token` as a query parameter, OAuth
 * callbacks carry `code`, token endpoints echo refresh tokens. Everything that
 * leaves the process as text goes through here first.
 */

export const REDACTED = '[REDACTED]'

/**
 * Object keys whose values are always secret. Anchored where it matters so
 * that diagnostic fields such as `tokenStatus` or `tokenExpiresAt` survive
 * while `accessToken`, `refresh_token` and `tokenHash` do not.
 */
const SECRET_KEY =
  /(pass(word|wd)?$|secret|authorization|cookie|api[-_]?key$|apikey$|code[-_]?verifier|signed[-_]?request|signature$|credential|private[-_]?key|token$|token[-_]?hash$|state[-_]?hash$|[-_]enc$|[a-z]Enc$)/i

/** Exact key names that are secret but too generic for the pattern above. */
const SECRET_EXACT_KEYS = new Set(['code', 'key', 'state', 'client_secret', 'fb_exchange_token'])

/** URL query parameters that carry secrets. */
const SECRET_QUERY_PARAMS = [
  'access_token',
  'refresh_token',
  'id_token',
  'client_secret',
  'code',
  'code_verifier',
  'key',
  'api_key',
  'apikey',
  'fb_exchange_token',
  'input_token',
  'state',
  'signed_request',
]

const QUERY_PARAM_RE = new RegExp(`([?&#](?:${SECRET_QUERY_PARAMS.join('|')})=)[^&#\\s"']+`, 'gi')
const FORM_FIELD_RE = new RegExp(`(\\b(?:${SECRET_QUERY_PARAMS.join('|')})["']?\\s*[:=]\\s*["']?)[^&\\s"',}]+`, 'gi')
const BEARER_RE = /(\bBearer\s+)[A-Za-z0-9._~+/=-]+/gi
// Encrypted-at-rest token format produced by core/security/crypto.ts.
const ENCRYPTED_RE = /\bv1\.[a-f0-9]{8}\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/g

export function redactString(input: string): string {
  return input
    .replace(QUERY_PARAM_RE, `$1${REDACTED}`)
    .replace(FORM_FIELD_RE, `$1${REDACTED}`)
    .replace(BEARER_RE, `$1${REDACTED}`)
    .replace(ENCRYPTED_RE, REDACTED)
}

export function isSecretKey(key: string): boolean {
  return SECRET_EXACT_KEYS.has(key.toLowerCase()) || SECRET_KEY.test(key)
}

/**
 * Deep-copy a value with secrets removed. Keys that look secret have their
 * values replaced; every string is scrubbed of embedded secrets; errors are
 * reduced to name + redacted message. Depth and size are bounded so a huge
 * API payload cannot flood a log line.
 */
export function redact(value: unknown, depth = 0): unknown {
  if (value === null || value === undefined) return value
  if (typeof value === 'string') return redactString(value.length > 4000 ? `${value.slice(0, 4000)}…` : value)
  if (typeof value === 'number' || typeof value === 'boolean' || typeof value === 'bigint') return value
  if (value instanceof Date) return value.toISOString()
  if (value instanceof Error) {
    const out: Record<string, unknown> = { name: value.name, message: redactString(value.message) }
    const kind = (value as { kind?: unknown }).kind
    if (typeof kind === 'string') out.kind = kind
    return out
  }
  if (depth >= 6) return '[Truncated]'
  if (Array.isArray(value)) {
    const items = value.slice(0, 50).map((v) => redact(v, depth + 1))
    if (value.length > 50) items.push(`[+${value.length - 50} more]`)
    return items
  }
  if (typeof value === 'object') {
    const out: Record<string, unknown> = {}
    for (const [key, v] of Object.entries(value as Record<string, unknown>)) {
      out[key] = isSecretKey(key) && v !== null && v !== undefined && v !== '' ? REDACTED : redact(v, depth + 1)
    }
    return out
  }
  return String(value)
}
