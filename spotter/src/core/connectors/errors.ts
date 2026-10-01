/**
 * One error taxonomy for every platform. Connectors translate each API's own
 * error format into a ConnectorError so the collector, the health tracker and
 * the UI can react to *kinds* of failure without knowing which API produced
 * them.
 */
import type { Platform } from '../domain/types'
import { redactString } from '../observability/redact'

export const CONNECTOR_ERROR_KINDS = [
  'not_configured',
  'auth_required',
  'auth_expired',
  'auth_revoked',
  'scope_missing',
  'rate_limited',
  'quota_exceeded',
  'not_found',
  'forbidden',
  'bad_request',
  'schema_changed',
  'unavailable',
  'timeout',
  'network',
  'unknown',
] as const
export type ConnectorErrorKind = (typeof CONNECTOR_ERROR_KINDS)[number]

export interface ConnectorErrorInit {
  kind: ConnectorErrorKind
  platform: Platform
  operation: string
  message: string
  retryable?: boolean
  retryAfterMs?: number | null
  httpStatus?: number | null
  platformCode?: string | number | null
  cause?: unknown
}

/** Kinds worth retrying within the same run (with backoff). */
const TRANSIENT: ReadonlySet<ConnectorErrorKind> = new Set(['rate_limited', 'unavailable', 'timeout', 'network'])
/** Kinds that mean the connection itself needs the user's attention. */
const AUTH: ReadonlySet<ConnectorErrorKind> = new Set(['auth_required', 'auth_expired', 'auth_revoked', 'scope_missing'])

export class ConnectorError extends Error {
  readonly kind: ConnectorErrorKind
  readonly platform: Platform
  readonly operation: string
  readonly retryable: boolean
  readonly retryAfterMs: number | null
  readonly httpStatus: number | null
  readonly platformCode: string | number | null

  constructor(init: ConnectorErrorInit) {
    // Messages end up in logs and the UI: scrub anything token-shaped.
    super(redactString(init.message))
    this.name = 'ConnectorError'
    this.kind = init.kind
    this.platform = init.platform
    this.operation = init.operation
    this.retryable = init.retryable ?? TRANSIENT.has(init.kind)
    this.retryAfterMs = init.retryAfterMs ?? null
    this.httpStatus = init.httpStatus ?? null
    this.platformCode = init.platformCode ?? null
    if (init.cause !== undefined) (this as { cause?: unknown }).cause = init.cause
  }

  get isAuthProblem(): boolean {
    return AUTH.has(this.kind)
  }

  toJSON() {
    return {
      kind: this.kind,
      platform: this.platform,
      operation: this.operation,
      message: this.message,
      retryable: this.retryable,
      httpStatus: this.httpStatus,
      platformCode: this.platformCode,
    }
  }
}

export function isConnectorError(error: unknown): error is ConnectorError {
  return error instanceof ConnectorError
}

export function isAuthKind(kind: string): boolean {
  return AUTH.has(kind as ConnectorErrorKind)
}

/** Wrap anything thrown into a ConnectorError without losing an existing classification. */
export function toConnectorError(error: unknown, platform: Platform, operation: string): ConnectorError {
  if (error instanceof ConnectorError) return error
  const message = error instanceof Error ? error.message : String(error)
  return new ConnectorError({ kind: 'unknown', platform, operation, message, cause: error })
}

/** Plain-English explanation of an error kind, for the dashboard. */
export function describeErrorKind(kind: string): string {
  switch (kind) {
    case 'not_configured':
      return 'App credentials for this platform are not configured on the server.'
    case 'auth_required':
      return 'Not connected. Connect the account to start collecting.'
    case 'auth_expired':
      return 'The access token expired and could not be refreshed. Reconnect the account.'
    case 'auth_revoked':
      return 'Access was revoked on the platform side. Reconnect the account.'
    case 'scope_missing':
      return 'A permission this feature needs was not granted. Reconnect and approve it.'
    case 'rate_limited':
      return 'The platform is throttling requests. Collection will back off and retry.'
    case 'quota_exceeded':
      return 'The daily API quota is used up. Collection resumes after the quota resets.'
    case 'not_found':
      return 'The requested content no longer exists or is private.'
    case 'forbidden':
      return 'The platform refused access to this resource.'
    case 'bad_request':
      return 'The platform rejected the request. The API may have changed.'
    case 'schema_changed':
      return 'The platform returned data in an unexpected shape. The API may have changed.'
    case 'unavailable':
      return 'The platform API is having an outage or server error.'
    case 'timeout':
      return 'The platform took too long to respond.'
    case 'network':
      return 'Network error while contacting the platform.'
    default:
      return 'Unexpected error.'
  }
}
