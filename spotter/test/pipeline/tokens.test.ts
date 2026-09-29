/**
 * Token refresh against the demo transport and an in-memory database:
 * refresh when due, store the new token encrypted, and turn a refusal into
 * "needs reconnect" rather than a silent failure.
 */
import { and, eq } from 'drizzle-orm'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { parseEnv } from '@/core/config/env'
import { createConnector } from '@/core/connectors/registry'
import type { DbHandle } from '@/core/db/client'
import { oauthCredentials, platformAccounts, systemEvents } from '@/core/db/schema'
import { connectDemoAccounts, prepareDemoWorkspace } from '@/core/demo/seed'
import { createMemoryLogger } from '@/core/observability/logger'
import { buildRunContext, loadProfile, worldFor } from '@/core/pipeline/context'
import { loadCredentials } from '@/core/pipeline/store/accounts'
import { ensureFreshCredentials } from '@/core/pipeline/tokens'
import { closeTestDatabase, createTestUser, openTestDatabase } from '../support/db'

let handle: DbHandle
let profileId: string
const now = new Date()

async function tiktokAccount() {
  const [account] = await handle.db
    .select()
    .from(platformAccounts)
    .where(and(eq(platformAccounts.creatorProfileId, profileId), eq(platformAccounts.platform, 'tiktok')))
  return account!
}

async function context(faults?: string) {
  const env = parseEnv({ MOCK_FAULTS: faults })
  const profile = await loadProfile(handle.db, profileId)
  const rc = buildRunContext({ db: handle.db, env, logger: createMemoryLogger('error'), profile, runId: null, trigger: 'manual', clock: () => now })
  const connector = createConnector('tiktok', 'mock', { env, clock: () => now, world: worldFor(profile) })
  return { rc, connector }
}

beforeAll(async () => {
  handle = await openTestDatabase()
  ;({ profileId } = await createTestUser(handle))
  await prepareDemoWorkspace(handle.db, profileId, { now })
  await connectDemoAccounts(handle.db, parseEnv({}), profileId, new Date(now.getTime() - 86_400_000))
}, 60_000)

afterAll(() => closeTestDatabase(handle))

describe('token refresh', () => {
  it('leaves a token alone until it is due', async () => {
    const account = await tiktokAccount()
    await handle.db.update(oauthCredentials).set({ accessTokenExpiresAt: new Date(now.getTime() + 6 * 3_600_000) }).where(eq(oauthCredentials.platformAccountId, account.id))
    const { rc, connector } = await context()
    const result = await ensureFreshCredentials(rc, connector, account)
    expect(result).toMatchObject({ status: 'ok', refreshed: false })
  })

  it('refreshes a token about to expire and stores the new one encrypted', async () => {
    const account = await tiktokAccount()
    await handle.db.update(oauthCredentials).set({ accessTokenExpiresAt: new Date(now.getTime() + 5 * 60_000) }).where(eq(oauthCredentials.platformAccountId, account.id))
    const before = (await loadCredentials(handle.db, account.id))!
    const { rc, connector } = await context()

    const result = await ensureFreshCredentials(rc, connector, account)
    expect(result).toMatchObject({ status: 'ok', refreshed: true })
    const after = (await loadCredentials(handle.db, account.id))!
    expect(after.accessToken).not.toBe(before.accessToken)
    expect(after.accessTokenExpiresAt!.getTime()).toBeGreaterThan(now.getTime() + 3_600_000)

    const [row] = await handle.db.select().from(oauthCredentials).where(eq(oauthCredentials.platformAccountId, account.id))
    expect(row!.accessTokenEnc).toMatch(/^v1\./)
    expect(row!.accessTokenEnc).not.toContain(after.accessToken)
    expect(row!.lastRefreshedAt!.getTime()).toBe(now.getTime())
  })

  it('marks the account for reconnection when the platform refuses the refresh', async () => {
    const account = await tiktokAccount()
    await handle.db.update(oauthCredentials).set({ accessTokenExpiresAt: new Date(now.getTime() - 60_000) }).where(eq(oauthCredentials.platformAccountId, account.id))
    const { rc, connector } = await context('tiktok:auth_expired')

    const result = await ensureFreshCredentials(rc, connector, account)
    expect(result.status).toBe('failed')
    expect((await tiktokAccount()).status).toBe('needs_reauth')
    const [row] = await handle.db.select().from(oauthCredentials).where(eq(oauthCredentials.platformAccountId, account.id))
    expect(row!.refreshFailures).toBe(1)
    const events = await handle.db.select().from(systemEvents).where(and(eq(systemEvents.creatorProfileId, profileId), eq(systemEvents.category, 'auth')))
    expect(events.some((e) => e.level === 'error' && e.message.startsWith('Token refresh refused — reconnect tiktok'))).toBe(true)
  })
})
