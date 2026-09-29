/**
 * Connecting a platform account with OAuth 2.0 (authorization code flow).
 *
 *   start:    random `state` (only its SHA-256 is stored), a PKCE verifier
 *             where the platform supports it (stored encrypted), both bound
 *             to the signed-in user and valid for 10 minutes
 *   callback: the state must exist, match the platform, belong to the
 *             signed-in user, be unexpired and unused — then it is consumed
 *             atomically and the code is exchanged server-side
 *
 * Client secrets and tokens never leave the server; the browser only ever
 * sees the platform's consent URL and our own redirect.
 */
import 'server-only'
import { and, eq, isNull, lt } from 'drizzle-orm'
import { appUrl, getEnv } from '@/core/config/env'
import { isConnectorError } from '@/core/connectors/errors'
import { createConnector } from '@/core/connectors/registry'
import { getDb } from '@/core/db/client'
import { oauthStates } from '@/core/db/schema'
import type { ConnectorMode, Platform } from '@/core/domain/types'
import { PLATFORMS } from '@/core/domain/types'
import { getLogger } from '@/core/observability/logger'
import { worldFor } from '@/core/pipeline/context'
import { decryptSecret, encryptSecret, sha256Hex } from '@/core/security/crypto'
import { createCodeVerifier, randomToken } from '@/core/security/random'
import { connectAccount } from '@/core/services/connections'
import type { Profile } from './auth/session'

const log = getLogger('oauth')
const STATE_TTL_MS = 10 * 60_000

export class OAuthFlowError extends Error {
  constructor(
    readonly code: 'unknown_platform' | 'wrong_mode' | 'not_configured' | 'invalid_state' | 'denied' | 'exchange_failed',
    message: string,
  ) {
    super(message)
  }
}

export function parsePlatform(value: string): Platform {
  if (!(PLATFORMS as readonly string[]).includes(value)) throw new OAuthFlowError('unknown_platform', 'Unknown platform.')
  return value as Platform
}

/** A demo workspace connects demo accounts; a live one connects real accounts. Never a mix. */
export function modeFor(profile: Profile): ConnectorMode {
  return profile.dataMode === 'demo' ? 'mock' : 'live'
}

export function redirectUriFor(platform: Platform): string {
  return appUrl(`/api/oauth/${platform}/callback`)
}

function connectorFor(platform: Platform, mode: ConnectorMode, profile: Profile) {
  return createConnector(platform, mode, { env: getEnv(), clock: () => new Date(), world: worldFor(profile) })
}

export function safeReturnTo(value: string | null | undefined, fallback = '/connections'): string {
  return value && /^\/(?![/\\])[\w\-/?=&%.]*$/.test(value) ? value : fallback
}

/** Begin an authorisation: returns the consent URL to redirect the browser to. */
export async function startAuthorization(input: { userId: string; profile: Profile; platform: Platform; returnTo: string }): Promise<string> {
  const mode = modeFor(input.profile)
  const connector = connectorFor(input.platform, mode, input.profile)
  const missing = connector.auth.missingConfiguration()
  if (missing.length) {
    throw new OAuthFlowError('not_configured', `Set ${missing.join(', ')} on the server first (see API_SETUP.md).`)
  }
  const db = await getDb()
  const now = new Date()
  // Expired, never-used states are garbage.
  await db.delete(oauthStates).where(lt(oauthStates.expiresAt, new Date(now.getTime() - 86_400_000)))
  const state = randomToken(32)
  const codeVerifier = connector.auth.usesPkce ? createCodeVerifier() : null
  const redirectUri = redirectUriFor(input.platform)
  await db.insert(oauthStates).values({
    stateHash: sha256Hex(state),
    platform: input.platform,
    mode,
    userId: input.userId,
    creatorProfileId: input.profile.id,
    codeVerifierEnc: codeVerifier ? encryptSecret(codeVerifier) : null,
    redirectUri,
    returnTo: input.returnTo,
    authVariant: connector.auth.authVariant,
    expiresAt: new Date(now.getTime() + STATE_TTL_MS),
  })
  log.info('Authorization started', { platform: input.platform, mode, pkce: !!codeVerifier })
  return connector.auth.authorizationUrl({ state, redirectUri, codeVerifier })
}

/** Finish an authorisation. Returns where to send the browser. */
export async function completeAuthorization(input: {
  userId: string
  profile: Profile
  platform: Platform
  state: string | null
  code: string | null
  error: string | null
}): Promise<{ returnTo: string; username: string | null }> {
  if (!input.state || input.state.length > 200) throw new OAuthFlowError('invalid_state', 'The sign-in link was incomplete. Start again from Connections.')
  const db = await getDb()
  const now = new Date()
  // Consume the state atomically: a second use (replay, double submit) finds nothing.
  const [pending] = await db
    .update(oauthStates)
    .set({ consumedAt: now })
    .where(and(eq(oauthStates.stateHash, sha256Hex(input.state)), isNull(oauthStates.consumedAt)))
    .returning()
  if (!pending || pending.platform !== input.platform || pending.userId !== input.userId || pending.creatorProfileId !== input.profile.id) {
    log.warn('Rejected OAuth callback', { platform: input.platform, reason: pending ? 'mismatch' : 'unknown_or_used_state' })
    throw new OAuthFlowError('invalid_state', 'That sign-in attempt is not valid (expired, already used, or started by someone else). Start again.')
  }
  if (pending.expiresAt < now) throw new OAuthFlowError('invalid_state', 'The sign-in attempt took longer than 10 minutes. Start again.')
  const returnTo = safeReturnTo(pending.returnTo)
  if (input.error) {
    log.info('Authorization declined', { platform: input.platform, error: input.error.slice(0, 60) })
    throw new OAuthFlowError('denied', 'Permission was not granted, so nothing was connected.')
  }
  if (!input.code || input.code.length > 2_000) throw new OAuthFlowError('exchange_failed', 'The platform did not return an authorization code.')
  if (pending.mode !== modeFor(input.profile)) throw new OAuthFlowError('wrong_mode', 'The workspace switched between demo and live data during sign-in. Start again.')

  const connector = connectorFor(input.platform, pending.mode, input.profile)
  try {
    const completion = await connector.auth.exchangeCode({
      code: input.code,
      redirectUri: pending.redirectUri,
      codeVerifier: pending.codeVerifierEnc ? decryptSecret(pending.codeVerifierEnc) : null,
      now,
    })
    await connectAccount(db, { profileId: input.profile.id, platform: input.platform, mode: pending.mode, completion, now })
    return { returnTo, username: completion.account.username ?? completion.account.displayName }
  } catch (err) {
    log.error('Code exchange failed', { platform: input.platform, error: err })
    const detail = isConnectorError(err) ? err.message : 'Unexpected error.'
    throw new OAuthFlowError('exchange_failed', `The platform rejected the connection: ${detail}`)
  }
}
