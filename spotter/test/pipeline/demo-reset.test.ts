/**
 * Rebuilding the demo replays the same ten days, so it must start from a
 * fresh simulated quota; the real platforms' counters are never touched.
 */
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import type { DbHandle } from '@/core/db/client'
import { apiQuotaUsage } from '@/core/db/schema'
import { clearDemoData } from '@/core/demo/seed'
import { closeTestDatabase, createTestUser, openTestDatabase } from '../support/db'

let handle: DbHandle
let profileId: string

beforeAll(async () => {
  handle = await openTestDatabase()
  ;({ profileId } = await createTestUser(handle))
})

afterAll(async () => {
  await closeTestDatabase(handle)
})

describe('clearDemoData', () => {
  it('clears the simulated quota and keeps the real one', async () => {
    await handle.db.insert(apiQuotaUsage).values([
      { bucket: 'demo:youtube.search', quotaDay: '2026-10-20', unitsUsed: 90, callCount: 90 },
      { bucket: 'youtube.search', quotaDay: '2026-10-20', unitsUsed: 12, callCount: 12 },
    ])
    await clearDemoData(handle.db, profileId)
    const rows = await handle.db.select({ bucket: apiQuotaUsage.bucket }).from(apiQuotaUsage)
    expect(rows.map((r) => r.bucket)).toEqual(['youtube.search'])
  })
})
