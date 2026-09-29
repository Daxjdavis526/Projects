/**
 * YouTube / Google error bodies → ConnectorError.
 *
 * Data API errors look like
 *   { "error": { "code": 403, "message": "...", "errors": [{ "reason": "quotaExceeded", ... }] } }
 * (developers.google.com/youtube/v3/docs/core_errors). OAuth token errors
 * look like { "error": "invalid_grant", "error_description": "..." }.
 */
import { ConnectorError } from '../errors'
import { classifyByStatus, type ErrorClassifier } from '../http'

export function classifyYouTubeError(operation: string): ErrorClassifier {
  return ({ status, body }) => {
    const err = (body as { error?: { message?: string; status?: string; errors?: Array<{ reason?: string; message?: string }> } } | null)?.error
    const reason = err?.errors?.[0]?.reason ?? err?.status ?? null
    const detail = err?.message ?? err?.errors?.[0]?.message ?? ''
    const base = { platform: 'youtube' as const, operation, httpStatus: status, platformCode: reason }
    const message = `${operation}: ${reason ?? `HTTP ${status}`}${detail ? ` — ${detail}` : ''}`
    switch (reason) {
      case 'quotaExceeded':
      case 'dailyLimitExceeded':
        return new ConnectorError({ ...base, kind: 'quota_exceeded', message, retryable: false })
      case 'rateLimitExceeded':
      case 'userRateLimitExceeded':
        return new ConnectorError({ ...base, kind: 'rate_limited', message })
      case 'insufficientPermissions':
      case 'ACCESS_TOKEN_SCOPE_INSUFFICIENT':
        return new ConnectorError({ ...base, kind: 'scope_missing', message })
      case 'authError':
      case 'invalidCredentials':
      case 'UNAUTHENTICATED':
        return new ConnectorError({ ...base, kind: 'auth_expired', message })
      case 'keyInvalid':
      case 'accessNotConfigured':
      case 'SERVICE_DISABLED':
        return new ConnectorError({ ...base, kind: 'not_configured', message })
      case 'videoNotFound':
      case 'channelNotFound':
      case 'playlistNotFound':
      case 'notFound':
        return new ConnectorError({ ...base, kind: 'not_found', message })
      case 'commentsDisabled':
      case 'forbidden':
      case 'playlistItemsNotAccessible':
        return new ConnectorError({ ...base, kind: 'forbidden', message })
      case 'backendError':
      case 'internalError':
        return new ConnectorError({ ...base, kind: 'unavailable', message })
      default:
        return classifyByStatus('youtube', operation, status, detail, reason)
    }
  }
}

export function classifyGoogleOAuthError(operation: string): ErrorClassifier {
  return ({ status, body }) => {
    const b = body as { error?: string | { message?: string }; error_description?: string } | null
    const code = typeof b?.error === 'string' ? b.error : null
    const detail = b?.error_description ?? (typeof b?.error === 'object' ? b.error?.message : '') ?? ''
    const base = { platform: 'youtube' as const, operation, httpStatus: status, platformCode: code }
    const message = `${operation}: ${code ?? `HTTP ${status}`}${detail ? ` — ${detail}` : ''}`
    switch (code) {
      case 'invalid_grant':
        return new ConnectorError({ ...base, kind: 'auth_revoked', message })
      case 'invalid_client':
      case 'unauthorized_client':
        return new ConnectorError({ ...base, kind: 'not_configured', message })
      case 'admin_policy_enforced':
      case 'access_denied':
        return new ConnectorError({ ...base, kind: 'forbidden', message })
      case 'invalid_scope':
        return new ConnectorError({ ...base, kind: 'scope_missing', message })
      case 'invalid_request':
        return new ConnectorError({ ...base, kind: 'bad_request', message })
      default:
        return classifyByStatus('youtube', operation, status, detail, code)
    }
  }
}
