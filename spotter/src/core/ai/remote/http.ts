/**
 * JSON over HTTPS for the providers called without a vendor SDK (OpenAI's
 * REST API or a local OpenAI-compatible server, and Voyage).
 *
 * - A timeout on every request.
 * - Retries only for transient failures (network, timeout, 408/409/429/5xx),
 *   with full-jitter exponential backoff, honouring Retry-After.
 * - Failures become AIProviderError with a kind the pipeline can act on.
 * - Error text is clipped and scrubbed: an API key never reaches a log line
 *   or a stored event, even if a server were to echo it.
 */
import { backoffDelay, parseRetryAfter } from '../../connectors/http'
import { redactString } from '../../observability/redact'
import { AIProviderError, type AIErrorKind } from '../types'

export interface RemoteHttpDeps {
  fetch: typeof fetch
  sleep: (ms: number) => Promise<void>
  random: () => number
}

export const defaultRemoteHttpDeps = (): RemoteHttpDeps => ({
  fetch: (...args) => globalThis.fetch(...args),
  sleep: (ms) => new Promise((resolve) => setTimeout(resolve, ms)),
  random: Math.random,
})

export interface PostJsonOptions {
  /** Provider name for errors, e.g. "openai". */
  provider: string
  url: string
  headers: Record<string, string>
  body: unknown
  timeoutMs?: number
  /** Retries after the first attempt. */
  maxRetries?: number
  /** Longest wait accepted between attempts; a longer Retry-After fails the call instead. */
  maxRetryDelayMs?: number
}

export function kindForStatus(status: number): AIErrorKind {
  if (status === 401 || status === 403) return 'auth'
  if (status === 429) return 'rate_limit'
  if (status === 408 || status === 409 || status >= 500) return 'unavailable'
  return 'invalid_request'
}

/** The server's own explanation, if it gave one, clipped and scrubbed. */
function errorDetail(body: unknown): string | null {
  if (!body) return null
  if (typeof body === 'string') return redactString(body.slice(0, 200))
  const b = body as { error?: { message?: unknown } | string; detail?: unknown; message?: unknown }
  const message = typeof b.error === 'string' ? b.error : (b.error?.message ?? b.detail ?? b.message)
  return typeof message === 'string' ? redactString(message.slice(0, 200)) : null
}

async function readBody(response: Response): Promise<unknown> {
  const text = await response.text()
  if (!text) return null
  try {
    return JSON.parse(text)
  } catch {
    return text
  }
}

function host(url: string): string {
  try {
    return new URL(url).host
  } catch {
    return 'the provider'
  }
}

export async function postJson(options: PostJsonOptions, deps: RemoteHttpDeps = defaultRemoteHttpDeps()): Promise<unknown> {
  const maxRetries = options.maxRetries ?? 2
  const maxRetryDelayMs = options.maxRetryDelayMs ?? 30_000
  const where = host(options.url)
  for (let attempt = 1; ; attempt++) {
    const canRetry = attempt <= maxRetries
    let response: Response
    try {
      response = await deps.fetch(options.url, {
        method: 'POST',
        headers: { 'content-type': 'application/json', accept: 'application/json', ...options.headers },
        body: JSON.stringify(options.body),
        signal: AbortSignal.timeout(options.timeoutMs ?? 120_000),
      })
    } catch (err) {
      if (canRetry) {
        await deps.sleep(backoffDelay(attempt, 1_000, 16_000, deps.random))
        continue
      }
      const timedOut = err instanceof Error && (err.name === 'TimeoutError' || err.name === 'AbortError')
      throw new AIProviderError(
        options.provider,
        timedOut ? `${where} did not answer in time` : `Could not reach ${where}: ${redactString(err instanceof Error ? err.message : String(err))}`,
        'unavailable',
      )
    }
    const body = await readBody(response)
    if (response.ok) {
      if (body === null || typeof body !== 'object') throw new AIProviderError(options.provider, `${where} returned a response that is not JSON`, 'bad_response')
      return body
    }
    const kind = kindForStatus(response.status)
    const transient = kind === 'rate_limit' || kind === 'unavailable'
    if (transient && canRetry) {
      const retryAfter = parseRetryAfter(response.headers.get('retry-after'))
      const delay = retryAfter ?? backoffDelay(attempt, 1_000, 16_000, deps.random)
      if (delay <= maxRetryDelayMs) {
        await deps.sleep(delay)
        continue
      }
    }
    const detail = errorDetail(body)
    throw new AIProviderError(options.provider, `${where} returned HTTP ${response.status}${detail ? `: ${detail}` : ''}`, kind)
  }
}
