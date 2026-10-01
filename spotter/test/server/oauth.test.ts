/**
 * The OAuth flow's state handling, against the demo transport and an
 * in-memory database: single use, bound to the user, 10-minute expiry,
 * PKCE verifier stored encrypted, safe redirects.
 */
import { eq } from 'drizzle-orm'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import type { DbHandle } from '@/core/db/client'
import { creatorProfiles, oauthStates, platformAccounts } from '@/core/db/schema'
import { prepareDemoWorkspace } from '@/core/demo/seed'
import { completeAuthorization, OAuthFlowError, safeReturnTo, startAuthorization } from '@/server/oauth'
import { closeTestDatabase, createTestUser, openTestDatabase } from '../support/db'

let handle: DbHandle
let userId: string
let otherUserId: string
let profile: typeof creatorProfiles.$inferSelect

const stateOf = (url: string) => new URL(url, 'http://localhost:3000').searchParams.get('state')!

async function flowError(p: Promise<unknown>): Promise<OAuthFlowError> {
  const err = await p.then(
    () => null,
    (e: unknown) => e,
  )
  expect(err).toBeInstanceOf(OAuthFlowError)
  return err as OAuthFlowError
}

beforeAll(async () => {
  handle = await openTestDatabase()
  const a = await createTestUser(handle)
  const b = await createTestUser(handle, 'Someone Else')
  userId = a.userId
  otherUserId = b.userId
  await prepareDemoWorkspace(handle.db, a.profileId, { now: new Date() })
  ;[profile] = (await handle.db.select().from(creatorProfiles).where(eq(creatorProfiles.id, a.profileId))) as [typeof profile]
}, 60_000)

afterAll(() => closeTestDatabase(handle))

describe('OAuth state', () => {
  it('stores only a hash of the state and an encrypted PKCE verifier', async () => {
    // Google supports PKCE for web apps; TikTok's and Instagram's web flows use state + a server-side secret.
    const url = await startAuthorization({ userId, profile, platform: 'youtube', returnTo: '/connections' })
    const state = stateOf(url)
    expect(state.length).toBeGreaterThanOrEqual(40)
    const rows = await handle.db.select().from(oauthStates)
    const row = rows.at(-1)!
    expect(row.stateHash).not.toBe(state)
    expect(row.stateHash).toMatch(/^[a-f0-9]{64}$/)
    expect(row.codeVerifierEnc).toMatch(/^v1\./)
    expect(new URL(url, 'http://localhost:3000').searchParams.get('code_challenge_method')).toBe('S256')
    expect(row.expiresAt.getTime() - Date.now()).toBeGreaterThan(9 * 60_000)
    expect(row.expiresAt.getTime() - Date.now()).toBeLessThanOrEqual(10 * 60_000)
  })

  it('rejects a callback from a different user, and the state cannot be reused afterwards', async () => {
    const state = stateOf(await startAuthorization({ userId, profile, platform: 'tiktok', returnTo: '/connections' }))
    const wrongUser = await flowError(completeAuthorization({ userId: otherUserId, profile, platform: 'tiktok', state, code: 'demo-code', error: null }))
    expect(wrongUser.code).toBe('invalid_state')
    const replay = await flowError(completeAuthorization({ userId, profile, platform: 'tiktok', state, code: 'demo-code', error: null }))
    expect(replay.code).toBe('invalid_state')
  })

  it('rejects a state issued for another platform', async () => {
    const state = stateOf(await startAuthorization({ userId, profile, platform: 'youtube', returnTo: '/connections' }))
    const err = await flowError(completeAuthorization({ userId, profile, platform: 'tiktok', state, code: 'demo-code', error: null }))
    expect(err.code).toBe('invalid_state')
  })

  it('connects once with a valid state, and a replay of the same callback fails', async () => {
    const state = stateOf(await startAuthorization({ userId, profile, platform: 'tiktok', returnTo: '/setup?step=4' }))
    const done = await completeAuthorization({ userId, profile, platform: 'tiktok', state, code: 'demo-code', error: null })
    expect(done.returnTo).toBe('/setup?step=4')
    expect(done.username).toBeTruthy()
    const [account] = await handle.db.select().from(platformAccounts).where(eq(platformAccounts.creatorProfileId, profile.id))
    expect(account).toMatchObject({ platform: 'tiktok', mode: 'mock', status: 'connected' })

    const replay = await flowError(completeAuthorization({ userId, profile, platform: 'tiktok', state, code: 'demo-code', error: null }))
    expect(replay.code).toBe('invalid_state')
  })

  it('expires after 10 minutes', async () => {
    const state = stateOf(await startAuthorization({ userId, profile, platform: 'instagram', returnTo: '/connections' }))
    await handle.db.update(oauthStates).set({ expiresAt: new Date(Date.now() - 1_000) })
    const err = await flowError(completeAuthorization({ userId, profile, platform: 'instagram', state, code: 'demo-code', error: null }))
    expect(err.code).toBe('invalid_state')
    expect(err.message).toMatch(/10 minutes/)
  })

  it('reports a declined consent without connecting anything', async () => {
    const state = stateOf(await startAuthorization({ userId, profile, platform: 'youtube', returnTo: '/connections' }))
    const err = await flowError(completeAuthorization({ userId, profile, platform: 'youtube', state, code: null, error: 'access_denied' }))
    expect(err.code).toBe('denied')
  })

  it('only redirects to local paths', () => {
    expect(safeReturnTo('/trends?stage=emerging')).toBe('/trends?stage=emerging')
    for (const evil of ['//evil.example', 'https://evil.example', '/\\evil.example', 'javascript:alert(1)', '/path with space']) {
      expect(safeReturnTo(evil)).toBe('/connections')
    }
  })
})
