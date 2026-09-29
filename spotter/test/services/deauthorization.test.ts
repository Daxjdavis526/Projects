import { createHmac } from 'node:crypto'
import { eq } from 'drizzle-orm'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { parseEnv } from '@/core/config/env'
import type { DbHandle } from '@/core/db/client'
import type { ContentItem } from '@/core/domain/types'
import { contentItems, dataDeletionRequests, oauthCredentials, platformAccounts } from '@/core/db/schema'
import { createMemoryLogger } from '@/core/observability/logger'
import { upsertItems } from '@/core/pipeline/store/content'
import { currentKeyId, encryptSecret } from '@/core/security/crypto'
import { handleDataDeletionRequest, parseSignedRequest, verifyTikTokSignature } from '@/core/services/deauthorization'
import { closeTestDatabase, createTestUser, openTestDatabase } from '../support/db'

const b64url = (buf: Buffer) => buf.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')

/** A signed_request exactly as Meta builds it: base64url(HMAC-SHA256(payload)).payload */
function signedRequest(payload: object, secret: string): string {
  const body = b64url(Buffer.from(JSON.stringify(payload)))
  return `${b64url(createHmac('sha256', secret).update(body).digest())}.${body}`
}

describe('Meta signed_request', () => {
  const payload = { algorithm: 'HMAC-SHA256', issued_at: 1_790_000_000, user_id: '17841400000000001' }

  it('accepts a request signed with the app secret (either login path’s secret)', () => {
    expect(parseSignedRequest(signedRequest(payload, 'ig-secret'), ['fb-secret', 'ig-secret'])).toMatchObject({ user_id: '17841400000000001' })
  })

  it('rejects a wrong secret, a tampered payload, another algorithm and garbage', () => {
    expect(parseSignedRequest(signedRequest(payload, 'attacker'), ['ig-secret'])).toBeNull()
    const [sig] = signedRequest(payload, 'ig-secret').split('.')
    const forged = b64url(Buffer.from(JSON.stringify({ ...payload, user_id: 'someone-else' })))
    expect(parseSignedRequest(`${sig}.${forged}`, ['ig-secret'])).toBeNull()
    expect(parseSignedRequest(signedRequest({ ...payload, algorithm: 'HMAC-SHA1' }, 'ig-secret'), ['ig-secret'])).toBeNull()
    expect(parseSignedRequest('not-a-signed-request', ['ig-secret'])).toBeNull()
    expect(parseSignedRequest('', ['ig-secret'])).toBeNull()
  })
})

describe('TikTok webhook signature', () => {
  const body = JSON.stringify({ client_key: 'ck', event: 'authorization.removed', create_time: 1_790_000_000, user_openid: 'act.openid', content: '{"reason":1}' })
  const now = 1_790_000_100_000
  const header = (t: number, b = body, secret = 'tt-secret') => `t=${t},s=${createHmac('sha256', secret).update(`${t}.${b}`).digest('hex')}`

  it('accepts a fresh, correctly signed body', () => {
    expect(verifyTikTokSignature(header(1_790_000_000), body, 'tt-secret', now)).toBe(true)
  })

  it('rejects stale timestamps, tampered bodies, wrong secrets and missing headers', () => {
    expect(verifyTikTokSignature(header(1_789_999_000), body, 'tt-secret', now)).toBe(false)
    expect(verifyTikTokSignature(header(1_790_000_000), body.replace('act.openid', 'act.other'), 'tt-secret', now)).toBe(false)
    expect(verifyTikTokSignature(header(1_790_000_000, body, 'wrong'), body, 'tt-secret', now)).toBe(false)
    expect(verifyTikTokSignature(null, body, 'tt-secret', now)).toBe(false)
    expect(verifyTikTokSignature('t=abc,s=00', body, 'tt-secret', now)).toBe(false)
  })
})

describe('data deletion callback', () => {
  let handle: DbHandle
  beforeAll(async () => {
    handle = await openTestDatabase()
  }, 60_000)
  afterAll(() => closeTestDatabase(handle))

  it('deletes tokens and collected posts for the app-scoped user id, and records a confirmation', async () => {
    const { profileId } = await createTestUser(handle)
    const now = new Date()
    const [account] = await handle.db
      .insert(platformAccounts)
      .values({
        creatorProfileId: profileId,
        platform: 'instagram',
        mode: 'live',
        externalAccountId: '17841400000000001',
        username: 'lifter',
        status: 'connected',
        metadata: { appScopedUserId: '1234567890' },
        connectedAt: now,
      })
      .returning()
    await handle.db
      .insert(oauthCredentials)
      .values({ platformAccountId: account!.id, accessTokenEnc: encryptSecret('IGAA-token'), tokenType: 'bearer', encryptionKeyId: currentKeyId() })
    const own: ContentItem = {
      platform: 'instagram',
      externalId: '18000000000000001',
      creatorId: '17841400000000001',
      creatorName: null,
      creatorHandle: 'lifter',
      creatorFollowerCount: 1_000,
      creatorProfileUrl: null,
      creatorAvatarUrl: null,
      url: 'https://www.instagram.com/reel/abc/',
      createdAt: now,
      title: null,
      caption: 'Leg day',
      transcript: null,
      durationSeconds: 30,
      viewCount: 100,
      likeCount: 10,
      commentCount: 1,
      shareCount: null,
      saveCount: null,
      reach: null,
      impressions: null,
      audioId: null,
      audioName: null,
      audioType: null,
      hashtags: ['legday'],
      thumbnailUrl: null,
      mediaType: 'reel',
      language: null,
      collectedAt: now,
      metricSource: 'owner_insights',
      discoveredVia: 'own_media',
      extraMetrics: null,
    }
    await upsertItems(handle.db, 'instagram', [own], { origin: 'live', isOwn: true, runId: null, now, platformAccountId: account!.id, metadataFresh: true })
    expect(await handle.db.select().from(contentItems).where(eq(contentItems.isOwn, true))).toHaveLength(1)

    const code = await handleDataDeletionRequest(handle.db, parseEnv({}), createMemoryLogger('error'), 'instagram', '1234567890')
    expect(code).toMatch(/^[\w-]{12,}$/)
    expect(await handle.db.select().from(oauthCredentials).where(eq(oauthCredentials.platformAccountId, account!.id))).toEqual([])
    expect(await handle.db.select().from(contentItems).where(eq(contentItems.isOwn, true))).toEqual([])
    const [after] = await handle.db.select().from(platformAccounts).where(eq(platformAccounts.id, account!.id))
    expect(after!.status).toBe('disconnected')
    const [request] = await handle.db.select().from(dataDeletionRequests).where(eq(dataDeletionRequests.confirmationCode, code))
    expect(request).toMatchObject({ platform: 'instagram', status: 'completed', source: 'platform_callback' })
  })

  it('answers with a confirmation even when nothing is held', async () => {
    const code = await handleDataDeletionRequest(handle.db, parseEnv({}), createMemoryLogger('error'), 'instagram', 'unknown-user')
    const [request] = await handle.db.select().from(dataDeletionRequests).where(eq(dataDeletionRequests.confirmationCode, code))
    expect(request!.status).toBe('no_data')
  })
})
