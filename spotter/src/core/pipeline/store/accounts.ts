/**
 * Platform accounts, their encrypted credentials, and connector health.
 */
import { and, eq, ne, sql } from 'drizzle-orm'
import type { ConnectedAccountInfo, AccessCredentials, TokenSet } from '../../connectors/types'
import type { Database, Executor } from '../../db/client'
import { oauthCredentials, platformAccounts, platformConnectorHealth } from '../../db/schema'
import type { ConnectorMode, Platform, RateLimitInfo } from '../../domain/types'
import { currentKeyId, decryptSecret, encryptSecret, keyIdOf } from '../../security/crypto'

export type AccountRow = typeof platformAccounts.$inferSelect
export type HealthRow = typeof platformConnectorHealth.$inferSelect

export async function listActiveAccounts(db: Database, profileId: string, mode?: ConnectorMode): Promise<AccountRow[]> {
  const rows = await db
    .select()
    .from(platformAccounts)
    .where(and(eq(platformAccounts.creatorProfileId, profileId), ne(platformAccounts.status, 'disconnected')))
  return mode ? rows.filter((r) => r.mode === mode) : rows
}

export function toAccountInfo(row: AccountRow): ConnectedAccountInfo {
  return {
    externalAccountId: row.externalAccountId ?? '',
    username: row.username,
    displayName: row.displayName,
    profileUrl: row.profileUrl,
    avatarUrl: row.avatarUrl,
    followerCount: row.followerCount,
    grantedScopes: row.grantedScopes,
    authVariant: row.authVariant ?? '',
    metadata: row.metadata ?? {},
  }
}

export async function loadCredentials(db: Database, accountId: string): Promise<AccessCredentials | null> {
  const [row] = await db.select().from(oauthCredentials).where(eq(oauthCredentials.platformAccountId, accountId)).limit(1)
  if (!row) return null
  return {
    accessToken: decryptSecret(row.accessTokenEnc),
    refreshToken: row.refreshTokenEnc ? decryptSecret(row.refreshTokenEnc) : null,
    accessTokenExpiresAt: row.accessTokenExpiresAt,
    refreshTokenExpiresAt: row.refreshTokenExpiresAt,
    scopes: row.scope ? row.scope.split(/[\s,]+/).filter(Boolean) : [],
    issuedAt: row.lastRefreshedAt ?? row.createdAt,
  }
}

/**
 * Store a token set, encrypted. A missing refresh token or scope list means
 * "unchanged": providers that do not rotate refresh tokens omit them. An
 * unchanged refresh token is re-encrypted with the current key, so after a
 * key rotation every stored secret moves to the new key on its next refresh
 * and `encryptionKeyId` tells the truth about the whole row.
 */
export async function saveTokens(db: Executor, accountId: string, tokens: TokenSet, now: Date): Promise<void> {
  const [existing] = await db.select().from(oauthCredentials).where(eq(oauthCredentials.platformAccountId, accountId)).limit(1)
  const keptRefresh = !tokens.refreshToken && existing?.refreshTokenEnc ? reencrypt(existing.refreshTokenEnc) : null
  const values = {
    accessTokenEnc: encryptSecret(tokens.accessToken),
    refreshTokenEnc: tokens.refreshToken ? encryptSecret(tokens.refreshToken) : keptRefresh,
    tokenType: tokens.tokenType ?? existing?.tokenType ?? null,
    scope: tokens.scopes ? tokens.scopes.join(' ') : (existing?.scope ?? null),
    accessTokenExpiresAt: tokens.accessTokenExpiresAt,
    refreshTokenExpiresAt: tokens.refreshTokenExpiresAt ?? existing?.refreshTokenExpiresAt ?? null,
    lastRefreshedAt: now,
    refreshFailures: 0,
    lastRefreshError: null,
    encryptionKeyId: currentKeyId(),
    updatedAt: now,
  }
  if (existing) await db.update(oauthCredentials).set(values).where(eq(oauthCredentials.id, existing.id))
  else await db.insert(oauthCredentials).values({ platformAccountId: accountId, ...values, createdAt: now })
  if (tokens.scopes) {
    await db.update(platformAccounts).set({ grantedScopes: tokens.scopes, updatedAt: now }).where(eq(platformAccounts.id, accountId))
  }
}

export async function recordRefreshFailure(db: Database, accountId: string, message: string, now: Date): Promise<void> {
  const [row] = await db.select({ failures: oauthCredentials.refreshFailures }).from(oauthCredentials).where(eq(oauthCredentials.platformAccountId, accountId))
  await db
    .update(oauthCredentials)
    .set({ refreshFailures: (row?.failures ?? 0) + 1, lastRefreshError: message.slice(0, 500), updatedAt: now })
    .where(eq(oauthCredentials.platformAccountId, accountId))
}

/**
 * Set an account's status. `accessLostAt` records when access first broke and
 * is kept through repeated failures (retention counts from it), then cleared
 * once the account works again.
 */
export async function setAccountStatus(db: Database, accountId: string, status: AccountRow['status'], now: Date): Promise<void> {
  const lost = status === 'needs_reauth' || status === 'error'
  await db
    .update(platformAccounts)
    .set({ status, accessLostAt: lost ? sql`coalesce(${platformAccounts.accessLostAt}, ${now})` : null, updatedAt: now })
    .where(eq(platformAccounts.id, accountId))
}

export async function saveDiscoveryCursor(db: Database, accountId: string, cursor: Record<string, unknown> | null): Promise<void> {
  await db.update(platformAccounts).set({ discoveryCursor: cursor }).where(eq(platformAccounts.id, accountId))
}

export async function updateAccountProfile(
  db: Database,
  accountId: string,
  profile: { username: string | null; displayName: string | null; avatarUrl: string | null; profileUrl: string | null; followerCount: number | null; metadata?: Record<string, unknown> },
  now: Date,
): Promise<void> {
  const [row] = await db.select({ metadata: platformAccounts.metadata }).from(platformAccounts).where(eq(platformAccounts.id, accountId))
  await db
    .update(platformAccounts)
    .set({
      username: profile.username ?? undefined,
      displayName: profile.displayName ?? undefined,
      avatarUrl: profile.avatarUrl ?? undefined,
      profileUrl: profile.profileUrl ?? undefined,
      followerCount: profile.followerCount ?? undefined,
      metadata: { ...(row?.metadata ?? {}), ...(profile.metadata ?? {}) },
      lastSyncAt: now,
      updatedAt: now,
    })
    .where(eq(platformAccounts.id, accountId))
}

export async function getHealth(db: Database, profileId: string, platform: Platform, mode: ConnectorMode): Promise<HealthRow | null> {
  const [row] = await db
    .select()
    .from(platformConnectorHealth)
    .where(and(eq(platformConnectorHealth.creatorProfileId, profileId), eq(platformConnectorHealth.platform, platform), eq(platformConnectorHealth.mode, mode)))
    .limit(1)
  return row ?? null
}

export interface HealthPatch {
  status?: HealthRow['status']
  tokenStatus?: HealthRow['tokenStatus']
  lastAttemptAt?: Date | null
  lastSuccessAt?: Date | null
  lastFailureAt?: Date | null
  lastFailureKind?: string | null
  lastFailureReason?: string | null
  consecutiveFailures?: number
  backoffUntil?: Date | null
  nextScheduledAt?: Date | null
  rateLimit?: RateLimitInfo | null
}

export async function upsertHealth(db: Database, profileId: string, platform: Platform, mode: ConnectorMode, patch: HealthPatch, now: Date): Promise<void> {
  const existing = await getHealth(db, profileId, platform, mode)
  if (existing) {
    await db.update(platformConnectorHealth).set({ ...patch, updatedAt: now }).where(eq(platformConnectorHealth.id, existing.id))
  } else {
    await db.insert(platformConnectorHealth).values({
      creatorProfileId: profileId,
      platform,
      mode,
      status: patch.status ?? 'not_connected',
      tokenStatus: patch.tokenStatus ?? 'missing',
      ...patch,
      updatedAt: now,
    })
  }
}

/** Token health as shown in the UI, from expiry times alone (never the token itself). */
export function tokenStatusOf(creds: { accessTokenExpiresAt: Date | null; refreshToken: string | null; refreshTokenExpiresAt: Date | null } | null, now: Date): HealthRow['tokenStatus'] {
  if (!creds) return 'missing'
  const soon = 3 * 86_400_000
  if (creds.refreshTokenExpiresAt && creds.refreshTokenExpiresAt.getTime() < now.getTime()) return 'expired'
  if (!creds.refreshToken && creds.accessTokenExpiresAt && creds.accessTokenExpiresAt.getTime() < now.getTime()) return 'expired'
  if (creds.refreshTokenExpiresAt && creds.refreshTokenExpiresAt.getTime() - now.getTime() < soon) return 'expiring'
  if (!creds.refreshToken && creds.accessTokenExpiresAt && creds.accessTokenExpiresAt.getTime() - now.getTime() < soon) return 'expiring'
  return 'healthy'
}

/** Re-encrypt a stored secret with the current key (no-op if it already uses it). */
function reencrypt(payload: string): string {
  return keyIdOf(payload) === currentKeyId() ? payload : encryptSecret(decryptSecret(payload))
}
