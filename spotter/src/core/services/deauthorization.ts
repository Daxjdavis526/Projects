/**
 * Platform-initiated removal: the creator removes SPOTTER from their account
 * on the platform's side, or asks the platform to have their data deleted.
 *
 *   Meta (Instagram, both login paths): "Deauthorize" and "Data Deletion
 *   Request" callbacks, each a POST with a `signed_request` — an HMAC-SHA256
 *   signature over the payload with the app secret. Data deletion must answer
 *   with a status URL and a confirmation code.
 *
 *   TikTok: the `authorization.removed` webhook, signed in the
 *   TikTok-Signature header as HMAC-SHA256("<timestamp>.<body>") with the
 *   client secret.
 *
 * Either way SPOTTER deletes the stored tokens and everything collected
 * through that account, immediately.
 */
import { createHmac } from 'node:crypto'
import { and, eq, or, sql } from 'drizzle-orm'
import type { Env } from '../config/env'
import type { Database } from '../db/client'
import { dataDeletionRequests, platformAccounts } from '../db/schema'
import type { Platform } from '../domain/types'
import type { Logger } from '../observability/logger'
import { constantTimeEqual } from '../security/crypto'
import { randomToken } from '../security/random'
import { disconnectAccount } from './connections'

function b64urlDecode(s: string): Buffer {
  return Buffer.from(s.replace(/-/g, '+').replace(/_/g, '/'), 'base64')
}

/** Verify a Meta signed_request against any of the app secrets; returns the payload or null. */
export function parseSignedRequest(signedRequest: string, secrets: string[]): { user_id?: string; algorithm?: string; issued_at?: number } | null {
  const [sig, payload] = signedRequest.split('.', 2)
  if (!sig || !payload) return null
  for (const secret of secrets) {
    const expected = createHmac('sha256', secret).update(payload).digest()
    const given = b64urlDecode(sig)
    if (expected.length === given.length && constantTimeEqual(expected.toString('hex'), given.toString('hex'))) {
      try {
        const data = JSON.parse(b64urlDecode(payload).toString('utf8')) as { user_id?: string; algorithm?: string; issued_at?: number }
        if (data.algorithm && data.algorithm.toUpperCase() !== 'HMAC-SHA256') return null
        return data
      } catch {
        return null
      }
    }
  }
  return null
}

/** Verify TikTok's webhook signature header ("t=<unix>,s=<hex>") within a 5-minute window. */
export function verifyTikTokSignature(header: string | null, rawBody: string, secret: string, now = Date.now()): boolean {
  if (!header) return false
  const parts = Object.fromEntries(header.split(',').map((kv) => kv.split('=', 2).map((x) => x.trim()) as [string, string]))
  const t = Number(parts.t)
  if (!parts.s || !Number.isFinite(t) || Math.abs(now / 1000 - t) > 300) return false
  const expected = createHmac('sha256', secret).update(`${parts.t}.${rawBody}`).digest('hex')
  return constantTimeEqual(expected, parts.s)
}

async function removeByExternalId(db: Database, env: Env, logger: Logger, platform: Platform, externalUserId: string): Promise<number> {
  // Meta sends an app-scoped user ID, which is not the Instagram account ID we key accounts by.
  const accounts = await db
    .select()
    .from(platformAccounts)
    .where(
      and(
        eq(platformAccounts.platform, platform),
        eq(platformAccounts.mode, 'live'),
        or(
          eq(platformAccounts.externalAccountId, externalUserId),
          sql`${platformAccounts.metadata}->>'appScopedUserId' = ${externalUserId}`,
          sql`${platformAccounts.metadata}->>'facebookUserId' = ${externalUserId}`,
        ),
      ),
    )
  let deleted = 0
  for (const a of accounts) {
    const r = await disconnectAccount(db, env, logger, { profileId: a.creatorProfileId, platform, mode: 'live', reason: 'platform_deauthorized' })
    deleted += r.deletedItems
  }
  return deleted
}

export async function handlePlatformDeauthorization(db: Database, env: Env, logger: Logger, platform: Platform, externalUserId: string): Promise<void> {
  const deleted = await removeByExternalId(db, env, logger, platform, externalUserId)
  logger.info('Platform deauthorization handled', { platform, deletedItems: deleted })
}

/** A deletion request from the platform: delete now, record it, return the confirmation code. */
export async function handleDataDeletionRequest(db: Database, env: Env, logger: Logger, platform: Platform, externalUserId: string): Promise<string> {
  const deleted = await removeByExternalId(db, env, logger, platform, externalUserId)
  const code = randomToken(12)
  const now = new Date()
  await db.insert(dataDeletionRequests).values({
    confirmationCode: code,
    platform,
    externalUserId,
    source: 'platform_callback',
    status: deleted > 0 ? 'completed' : 'no_data',
    detail: deleted > 0 ? `Deleted tokens and ${deleted} posts collected through the account.` : 'No data was held for this account.',
    requestedAt: now,
    completedAt: now,
  })
  return code
}
