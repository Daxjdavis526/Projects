/**
 * Startup recovery with embedded PGlite: runs cut short by the last shutdown
 * are settled at once, and an interrupted demo build is queued to resume.
 */
import { eq } from 'drizzle-orm'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import type { DbHandle } from '@/core/db/client'
import { collectionRuns } from '@/core/db/schema'
import { recoverOrphanedRuns } from '@/core/pipeline/scheduler'
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

describe('recoverOrphanedRuns', () => {
  it('requeues an interrupted demo build, fails interrupted runs, and leaves the rest alone', async () => {
    const now = new Date('2026-10-26T12:00:00Z')
    const recent = new Date(now.getTime() - 60_000)
    const insert = (values: Partial<typeof collectionRuns.$inferInsert>) =>
      handle.db
        .insert(collectionRuns)
        .values({ creatorProfileId: profileId, dataMode: 'demo', trigger: 'manual', status: 'queued', requestedAt: recent, ...values })
        .returning({ id: collectionRuns.id })
        .then((rows) => rows[0]!.id)
    const demoJob = await insert({ trigger: 'demo_setup', status: 'running', startedAt: recent, heartbeatAt: recent, workerId: 'old' })
    const backfillRunning = await insert({ trigger: 'backfill', status: 'running', startedAt: recent, heartbeatAt: recent })
    const backfillQueued = await insert({ trigger: 'backfill', status: 'queued' })
    const manualRunning = await insert({ trigger: 'manual', status: 'running', startedAt: recent, heartbeatAt: recent })
    const manualQueued = await insert({ trigger: 'manual', status: 'queued' })
    const done = await insert({ trigger: 'schedule', status: 'succeeded', finishedAt: recent })

    expect(await recoverOrphanedRuns(handle.db, now)).toBe(4)
    const status = async (id: string) => (await handle.db.select().from(collectionRuns).where(eq(collectionRuns.id, id)))[0]!
    expect(await status(demoJob)).toMatchObject({ status: 'queued', workerId: null, heartbeatAt: null })
    for (const id of [backfillRunning, backfillQueued, manualRunning]) {
      const run = await status(id)
      expect(run.status).toBe('failed')
      expect(run.error).toMatch(/stopped before finishing/)
    }
    expect((await status(manualQueued)).status).toBe('queued')
    expect((await status(done)).status).toBe('succeeded')
  })
})
