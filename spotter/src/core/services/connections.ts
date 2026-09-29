/**
 * Connecting and disconnecting platform accounts.
 *
 * Connect stores the account and its encrypted tokens. Disconnect revokes
 * the grant at the provider where an endpoint exists (best effort), deletes
 * the stored tokens, and deletes the data collected through that account —
 * immediately, which satisfies every platform's deletion window.
 */
import { and, eq } from 'drizzle-orm'
import type { Env } from '../config/env'
import { createConnector } from '../connectors/registry'
import type { OAuthCompletion } from '../connectors/types'
import type { Database } from '../db/client'
import { oauthCredentials, platformAccounts } from '../db/schema'
import type { ConnectorMode, Platform } from '../domain/types'
import type { Logger } from '../observability/logger'
import { worldFor, loadProfile } from '../pipeline/context'
import { loadCredentials, saveTokens, upsertHealth } from '../pipeline/store/accounts'
import { recordEvent } from '../pipeline/store/events'
import { deleteAuthorizedData } from '../pipeline/retention'

export async function connectAccount(
  db: Database,
  input: { profileId: string; platform: Platform; mode: ConnectorMode; completion: OAuthCompletion; now: Date },
): Promise<string> {
  const { account, tokens } = input.completion
  const values = {
    authVariant: account.authVariant,
    externalAccountId: account.externalAccountId,
    username: account.username,
    displayName: account.displayName,
    profileUrl: account.profileUrl,
    avatarUrl: account.avatarUrl,
    followerCount: account.followerCount,
    grantedScopes: tokens.scopes ?? account.grantedScopes,
    status: 'connected' as const,
    connectedAt: input.now,
    disconnectedAt: null,
    metadata: account.metadata,
    updatedAt: input.now,
  }
  const [row] = await db
    .insert(platformAccounts)
    .values({ creatorProfileId: input.profileId, platform: input.platform, mode: input.mode, ...values, createdAt: input.now })
    .onConflictDoUpdate({ target: [platformAccounts.creatorProfileId, platformAccounts.platform, platformAccounts.mode], set: values })
    .returning({ id: platformAccounts.id })
  await saveTokens(db, row!.id, tokens, input.now)
  await upsertHealth(
    db,
    input.profileId,
    input.platform,
    input.mode,
    { status: 'healthy', tokenStatus: 'healthy', consecutiveFailures: 0, backoffUntil: null, lastFailureKind: null, lastFailureReason: null },
    input.now,
  )
  await recordEvent(db, {
    profileId: input.profileId,
    level: 'info',
    category: 'auth',
    platform: input.platform,
    message: `Connected ${input.platform} as ${account.username ?? account.displayName ?? account.externalAccountId}.`,
    at: input.now,
  })
  return row!.id
}

export async function disconnectAccount(
  db: Database,
  env: Env,
  logger: Logger,
  input: { profileId: string; platform: Platform; mode: ConnectorMode; reason: 'user' | 'platform_deauthorized' },
): Promise<{ revoked: boolean; deletedItems: number }> {
  const [account] = await db
    .select()
    .from(platformAccounts)
    .where(and(eq(platformAccounts.creatorProfileId, input.profileId), eq(platformAccounts.platform, input.platform), eq(platformAccounts.mode, input.mode)))
    .limit(1)
  if (!account) return { revoked: false, deletedItems: 0 }
  const now = new Date()
  let revoked = false
  if (input.reason === 'user') {
    try {
      const creds = await loadCredentials(db, account.id)
      const profile = await loadProfile(db, input.profileId)
      const connector = createConnector(input.platform, input.mode, { env, clock: () => now, world: worldFor(profile) })
      if (creds && connector.auth.revoke) {
        await connector.auth.revoke(creds)
        revoked = true
      }
    } catch (err) {
      // Revocation is best effort; local deletion still happens.
      logger.warn('Token revocation at the provider failed', { platform: input.platform, error: err })
    }
  }
  await db.delete(oauthCredentials).where(eq(oauthCredentials.platformAccountId, account.id))
  const deletedItems = await deleteAuthorizedData(db, account.id)
  await db
    .update(platformAccounts)
    .set({ status: 'disconnected', disconnectedAt: now, grantedScopes: [], discoveryCursor: null, updatedAt: now })
    .where(eq(platformAccounts.id, account.id))
  await upsertHealth(db, input.profileId, input.platform, input.mode, { status: 'not_connected', tokenStatus: 'missing', rateLimit: null, backoffUntil: null }, now)
  await recordEvent(db, {
    profileId: input.profileId,
    level: 'info',
    category: 'auth',
    platform: input.platform,
    message:
      input.reason === 'user'
        ? `Disconnected ${input.platform}${revoked ? ' and revoked access at the platform' : ''}; deleted ${deletedItems} posts collected through it.`
        : `${input.platform} reported the app was removed; deleted tokens and ${deletedItems} posts.`,
    at: now,
  })
  return { revoked, deletedItems }
}
