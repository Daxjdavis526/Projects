/**
 * Keeping OAuth tokens fresh.
 *
 * Before a platform is collected, its stored token is checked. If it is due
 * (per the connector's own policy — 10 minutes before expiry by default, a
 * week ahead for Meta's 60-day tokens), it is refreshed and the new token
 * stored encrypted. A refresh token the provider rotated replaces the old
 * one. A refresh the provider refuses (invalid_grant, code 190…) marks the
 * account "needs reconnect" instead of failing silently forever.
 */
import { isConnectorError } from '../connectors/errors'
import type { AccessCredentials, PlatformConnector } from '../connectors/types'
import type { RunContext } from './context'
import { loadCredentials, recordRefreshFailure, saveTokens, setAccountStatus, type AccountRow } from './store/accounts'
import { recordEvent } from './store/events'

const DEFAULT_MARGIN_MS = 10 * 60_000

export function refreshDue(connector: PlatformConnector, creds: AccessCredentials, now: Date): boolean {
  if (connector.auth.refreshDue) return connector.auth.refreshDue(creds, now)
  if (!creds.accessTokenExpiresAt) return false
  return creds.accessTokenExpiresAt.getTime() - now.getTime() < DEFAULT_MARGIN_MS
}

export type FreshCredentials =
  | { status: 'ok'; credentials: AccessCredentials; refreshed: boolean }
  | { status: 'missing' }
  | { status: 'failed'; kind: string; message: string }

export async function ensureFreshCredentials(rc: RunContext, connector: PlatformConnector, account: AccountRow): Promise<FreshCredentials> {
  let creds: AccessCredentials | null
  try {
    creds = await loadCredentials(rc.db, account.id)
  } catch (err) {
    // Decryption failure: the key changed or the value was tampered with.
    return { status: 'failed', kind: 'auth_expired', message: err instanceof Error ? err.message : String(err) }
  }
  if (!creds) return { status: 'missing' }
  if (!refreshDue(connector, creds, rc.now)) return { status: 'ok', credentials: creds, refreshed: false }

  try {
    const tokens = await connector.refreshToken(creds, rc.now)
    await saveTokens(rc.db, account.id, tokens, rc.now)
    const rotated = tokens.refreshToken !== null && tokens.refreshToken !== creds.refreshToken
    rc.logger.info('Access token refreshed', { platform: account.platform, refreshTokenRotated: rotated })
    await recordEvent(rc.db, {
      profileId: rc.profile.id,
      level: 'info',
      category: 'auth',
      platform: account.platform,
      message: rotated ? 'Access token refreshed (refresh token rotated).' : 'Access token refreshed.',
      at: rc.now,
    })
    return {
      status: 'ok',
      refreshed: true,
      credentials: {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken ?? creds.refreshToken,
        accessTokenExpiresAt: tokens.accessTokenExpiresAt,
        refreshTokenExpiresAt: tokens.refreshTokenExpiresAt ?? creds.refreshTokenExpiresAt,
        scopes: tokens.scopes ?? creds.scopes,
        issuedAt: rc.now,
      },
    }
  } catch (err) {
    const kind = isConnectorError(err) ? err.kind : 'unknown'
    const message = err instanceof Error ? err.message : String(err)
    await recordRefreshFailure(rc.db, account.id, message, rc.now)
    const authProblem = isConnectorError(err) && (err.isAuthProblem || err.kind === 'bad_request' || err.kind === 'forbidden')
    if (authProblem) await setAccountStatus(rc.db, account.id, 'needs_reauth', rc.now)
    await recordEvent(rc.db, {
      profileId: rc.profile.id,
      level: authProblem ? 'error' : 'warn',
      category: 'auth',
      platform: account.platform,
      message: authProblem ? `Token refresh refused — reconnect ${account.platform}. ${message}` : `Token refresh failed, will retry: ${message}`,
      at: rc.now,
    })
    // A transient failure with a still-valid token is not fatal.
    if (!authProblem && creds.accessTokenExpiresAt && creds.accessTokenExpiresAt > rc.now) {
      return { status: 'ok', credentials: creds, refreshed: false }
    }
    return { status: 'failed', kind: authProblem ? kind : kind, message }
  }
}
