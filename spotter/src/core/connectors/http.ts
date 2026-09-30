/**
 * The one HTTP client every live connector uses.
 *
 * - Timeouts on every request.
 * - Retries only for transient failures (network, timeout, 429, 5xx), with
 *   exponential backoff and full jitter, honouring Retry-After when given.
 * - Never waits longer than `maxRetryDelayMs` inside a run: a long throttle
 *   is surfaced as an error so the scheduler can back off between runs
 *   instead of holding a worker hostage.
 * - Platform-specific error bodies are translated by the connector's
 *   `classify` function into the shared ConnectorError taxonomy.
 * - `fetch`, `sleep` and `random` are injected, so tests run against fixture
 *   responses with no network and no real waiting.
 */
import type { Platform } from '../domain/types'
import type { Logger } from '../observability/logger'
import { redactString } from '../observability/redact'
import { ConnectorError } from './errors'

export interface HttpDeps {
  fetch: typeof fetch
  sleep: (ms: number) => Promise<void>
  random: () => number
  logger?: Logger
}

export const defaultHttpDeps = (): HttpDeps => ({
  fetch: (...args) => globalThis.fetch(...args),
  sleep: (ms) => new Promise((resolve) => setTimeout(resolve, ms)),
  random: Math.random,
})

export type ErrorClassifier = (response: { status: number; body: unknown; headers: Headers }) => ConnectorError

export interface HttpRequest {
  platform: Platform
  /** Short name of the API operation, e.g. "videos.list". Used in errors and logs. */
  operation: string
  url: string
  method?: 'GET' | 'POST' | 'DELETE'
  headers?: Record<string, string>
  /** Objects are sent as JSON; URLSearchParams as a form. */
  body?: string | URLSearchParams | Record<string, unknown>
  timeoutMs?: number
  maxAttempts?: number
  baseDelayMs?: number
  maxDelayMs?: number
  /** Longest single wait we accept inside a run before giving up. */
  maxRetryDelayMs?: number
  classify: ErrorClassifier
  signal?: AbortSignal
}

export interface HttpResponse<T> {
  status: number
  data: T
  headers: Headers
  attempts: number
}

/** Full-jitter exponential backoff: random(0, min(max, base · 2^(attempt−1))). */
export function backoffDelay(attempt: number, baseMs: number, maxMs: number, random: () => number): number {
  const ceiling = Math.min(maxMs, baseMs * 2 ** Math.max(0, attempt - 1))
  return Math.round(random() * ceiling)
}

/** Retry-After is either delta-seconds or an HTTP date. */
export function parseRetryAfter(value: string | null, now: number = Date.now()): number | null {
  if (!value) return null
  const trimmed = value.trim()
  if (/^\d+(\.\d+)?$/.test(trimmed)) return Math.round(Number(trimmed) * 1000)
  const date = Date.parse(trimmed)
  if (Number.isNaN(date)) return null
  return Math.max(0, date - now)
}

async function readBody(response: Response): Promise<unknown> {
  const text = await response.text()
  if (!text) return null
  try {
    return JSON.parse(text)
  } catch {
    return text.slice(0, 2000)
  }
}

function describeUrl(url: string): string {
  try {
    const u = new URL(url)
    return `${u.host}${u.pathname}`
  } catch {
    return redactString(url)
  }
}

export async function requestJson<T>(req: HttpRequest, deps: HttpDeps): Promise<HttpResponse<T>> {
  const maxAttempts = req.maxAttempts ?? 4
  const baseDelayMs = req.baseDelayMs ?? 500
  const maxDelayMs = req.maxDelayMs ?? 15_000
  const maxRetryDelayMs = req.maxRetryDelayMs ?? 60_000
  const timeoutMs = req.timeoutMs ?? 20_000
  const where = describeUrl(req.url)

  let body: BodyInit | undefined
  const headers: Record<string, string> = { accept: 'application/json', ...req.headers }
  if (req.body instanceof URLSearchParams) {
    body = req.body
    headers['content-type'] ??= 'application/x-www-form-urlencoded'
  } else if (typeof req.body === 'string') {
    body = req.body
  } else if (req.body) {
    body = JSON.stringify(req.body)
    headers['content-type'] ??= 'application/json'
  }

  let lastError: ConnectorError | null = null
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const timeout = AbortSignal.timeout(timeoutMs)
    const signal = req.signal ? AbortSignal.any([req.signal, timeout]) : timeout
    let response: Response
    try {
      response = await deps.fetch(req.url, { method: req.method ?? 'GET', headers, body, signal })
    } catch (err) {
      if (req.signal?.aborted) throw err
      const timedOut = timeout.aborted
      lastError = new ConnectorError({
        kind: timedOut ? 'timeout' : 'network',
        platform: req.platform,
        operation: req.operation,
        message: timedOut
          ? `${req.operation}: no response from ${where} within ${timeoutMs} ms`
          : `${req.operation}: network error contacting ${where}: ${err instanceof Error ? err.message : String(err)}`,
        cause: err,
      })
    }

    if (lastError === null) {
      const payload = await readBody(response!)
      if (response!.ok) {
        if (payload !== null && typeof payload !== 'object') {
          throw new ConnectorError({
            kind: 'schema_changed',
            platform: req.platform,
            operation: req.operation,
            message: `${req.operation}: expected JSON from ${where}, got non-JSON content`,
            httpStatus: response!.status,
          })
        }
        return { status: response!.status, data: payload as T, headers: response!.headers, attempts: attempt }
      }
      lastError = req.classify({ status: response!.status, body: payload, headers: response!.headers })
      if (lastError.retryAfterMs === null && lastError.retryable) {
        const retryAfter = parseRetryAfter(response!.headers.get('retry-after'))
        if (retryAfter !== null) {
          lastError = new ConnectorError({ ...lastError.toJSON(), retryAfterMs: retryAfter, platform: req.platform })
        }
      }
    }

    const error = lastError!
    if (!error.retryable || attempt === maxAttempts) throw error
    const delay = error.retryAfterMs ?? backoffDelay(attempt, baseDelayMs, maxDelayMs, deps.random)
    if (delay > maxRetryDelayMs) throw error
    deps.logger?.debug('Retrying platform request', {
      platform: req.platform,
      operation: req.operation,
      attempt,
      delayMs: delay,
      kind: error.kind,
    })
    await deps.sleep(delay)
    lastError = null
  }
  // Unreachable: the loop either returns or throws.
  throw new ConnectorError({ kind: 'unknown', platform: req.platform, operation: req.operation, message: 'retry loop exited' })
}

/** Generic classification by HTTP status, used when a platform's body says nothing more specific. */
export function classifyByStatus(
  platform: Platform,
  operation: string,
  status: number,
  detail: string,
  platformCode: string | number | null = null,
): ConnectorError {
  const base = { platform, operation, httpStatus: status, platformCode }
  const message = `${operation}: HTTP ${status}${detail ? ` — ${detail}` : ''}`
  if (status === 401) return new ConnectorError({ ...base, kind: 'auth_expired', message })
  if (status === 403) return new ConnectorError({ ...base, kind: 'forbidden', message })
  if (status === 404 || status === 410) return new ConnectorError({ ...base, kind: 'not_found', message })
  if (status === 429) return new ConnectorError({ ...base, kind: 'rate_limited', message })
  if (status === 408) return new ConnectorError({ ...base, kind: 'timeout', message })
  if (status >= 500) return new ConnectorError({ ...base, kind: 'unavailable', message })
  if (status >= 400) return new ConnectorError({ ...base, kind: 'bad_request', message })
  return new ConnectorError({ ...base, kind: 'unknown', message })
}
