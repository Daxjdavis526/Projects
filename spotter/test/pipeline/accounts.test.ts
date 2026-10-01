/**
 * Account bookkeeping on an in-memory database: when access is lost, the
 * platform's deletion clock starts once and is not reset by retries; and a
 * key rotation moves every stored secret to the new key.
 */
import { eq } from 'drizzle-orm'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { parseEnv } from '@/core/config/env'
import type { DbHandle } from '@/core/db/client'
import { contentItems, oauthCredentials, platformAccounts } from '@/core/db/schema'
import type { ContentItem } from '@/core/domain/types'
import { createMemoryLogger } from '@/core/observability/logger'
import { runRetention } from '@/core/pipeline/retention'
import { loadCredentials, saveTokens, setAccountStatus } from '@/core/pipeline/store/accounts'
import { upsertItems } from '@/core/pipeline/store/content'
import { generateKeyMaterial, keyIdOf, setKeyringForTests } from '@/core/security/crypto'
import { closeTestDatabase, createTestUser, openTestDatabase } from '../support/db'

const DAY = 86_400_000
let handle: DbHandle

beforeAll(async () => {
  handle = await openTestDatabase()
}, 60_000)
afterAll(async () => {
  setKeyringForTests(null)
  await closeTestDatabase(handle)
})

async function liveYouTubeAccount(at: Date) {
  const { profileId } = await createTestUser(handle)
  const [account] = await handle.db
    .insert(platformAccounts)
    .values({ creatorProfileId: profileId, platform: 'youtube', mode: 'live', externalAccountId: `UC${profileId.slice(0, 8)}`, status: 'connected', connectedAt: at })
    .returning()
  const post: ContentItem = {
    platform: 'youtube',
    externalId: `vid-${profileId.slice(0, 8)}`,
    creatorId: account!.externalAccountId,
    creatorName: 'Me',
    creatorHandle: '@me',
    creatorFollowerCount: 1_000,
    creatorProfileUrl: null,
    creatorAvatarUrl: null,
    url: null,
    createdAt: at,
    title: 'Leg day',
    caption: null,
    transcript: null,
    durationSeconds: 40,
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
    hashtags: null,
    thumbnailUrl: null,
    mediaType: 'video',
    language: null,
    collectedAt: at,
    metricSource: 'public_api',
    discoveredVia: 'own_uploads',
    extraMetrics: null,
  }
  await upsertItems(handle.db, 'youtube', [post], { origin: 'live', isOwn: true, runId: null, now: at, platformAccountId: account!.id, metadataFresh: true })
  return account!
}

const ownPosts = async (externalId: string) => handle.db.select().from(contentItems).where(eq(contentItems.externalId, externalId))

describe('lost access', () => {
  it('starts the deletion clock once; retries do not reset it', async () => {
    const t0 = new Date('2026-06-01T12:00:00Z')
    const account = await liveYouTubeAccount(t0)
    await setAccountStatus(handle.db, account.id, 'needs_reauth', t0)
    // The worker keeps retrying the refresh three times a day…
    await setAccountStatus(handle.db, account.id, 'needs_reauth', new Date(t0.getTime() + 20 * DAY))
    const [row] = await handle.db.select().from(platformAccounts).where(eq(platformAccounts.id, account.id))
    expect(row!.accessLostAt!.getTime()).toBe(t0.getTime())

    // …and YouTube's 30-day re-authorisation rule still deletes the authorised data on time.
    const vid = `vid-${row!.creatorProfileId.slice(0, 8)}`
    await runRetention(handle.db, parseEnv({}), new Date(t0.getTime() + 25 * DAY), createMemoryLogger('error'))
    expect(await ownPosts(vid)).toHaveLength(1)
    await runRetention(handle.db, parseEnv({}), new Date(t0.getTime() + 31 * DAY), createMemoryLogger('error'))
    expect(await ownPosts(vid)).toHaveLength(0)
  })

  it('clears the clock when access comes back', async () => {
    const t0 = new Date('2026-06-01T12:00:00Z')
    const account = await liveYouTubeAccount(t0)
    await setAccountStatus(handle.db, account.id, 'needs_reauth', t0)
    await setAccountStatus(handle.db, account.id, 'connected', new Date(t0.getTime() + DAY))
    const [row] = await handle.db.select().from(platformAccounts).where(eq(platformAccounts.id, account.id))
    expect(row!.accessLostAt).toBeNull()
    await runRetention(handle.db, parseEnv({}), new Date(t0.getTime() + 40 * DAY), createMemoryLogger('error'))
    expect(await ownPosts(`vid-${row!.creatorProfileId.slice(0, 8)}`)).toHaveLength(1)
  })
})

describe('key rotation', () => {
  it('re-encrypts a kept refresh token with the new key', async () => {
    const oldKey = generateKeyMaterial()
    const newKey = generateKeyMaterial()
    const now = new Date()
    const account = await liveYouTubeAccount(now)

    setKeyringForTests(oldKey)
    await saveTokens(handle.db, account.id, { accessToken: 'access-1', refreshToken: 'refresh-1', tokenType: 'Bearer', scopes: null, accessTokenExpiresAt: now, refreshTokenExpiresAt: null }, now)
    const [before] = await handle.db.select().from(oauthCredentials).where(eq(oauthCredentials.platformAccountId, account.id))

    // Rotate: new key current, old key still readable. Google returns no new refresh token.
    setKeyringForTests(newKey, oldKey)
    await saveTokens(handle.db, account.id, { accessToken: 'access-2', refreshToken: null, tokenType: 'Bearer', scopes: null, accessTokenExpiresAt: now, refreshTokenExpiresAt: null }, now)
    const [after] = await handle.db.select().from(oauthCredentials).where(eq(oauthCredentials.platformAccountId, account.id))
    expect(keyIdOf(after!.refreshTokenEnc!)).not.toBe(keyIdOf(before!.refreshTokenEnc!))
    expect(keyIdOf(after!.refreshTokenEnc!)).toBe(after!.encryptionKeyId)

    // Once everything is on the new key, the old one can go.
    setKeyringForTests(newKey)
    const creds = await loadCredentials(handle.db, account.id)
    expect(creds).toMatchObject({ accessToken: 'access-2', refreshToken: 'refresh-1' })
  })
})
