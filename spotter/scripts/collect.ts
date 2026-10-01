/**
 * Run one collection now, in this process, and print what happened:
 *
 *   npm run collect
 *
 * Handy for testing credentials: each platform's steps and errors are listed.
 */
import './load-env'
import { eq } from 'drizzle-orm'
import { getEnv } from '../src/core/config/env'
import { openDatabase } from '../src/core/db/client'
import { collectionRuns, creatorProfiles } from '../src/core/db/schema'
import { getLogger } from '../src/core/observability/logger'
import { executeRun } from '../src/core/pipeline/runner'
import { requestRun } from '../src/core/pipeline/scheduler'

const log = getLogger('collect')
const env = getEnv()
const handle = await openDatabase({ runMigrations: true })
const db = handle.db
const [profile] = await db.select().from(creatorProfiles).limit(1)
if (!profile) {
  console.error('No creator profile yet: open the app and finish setup first.')
  process.exit(1)
}
const { runId, alreadyPending } = await requestRun(db, profile.id, 'cli')
if (alreadyPending) {
  console.error(`A run is already queued or running (${runId}). Try again when it finishes.`)
  process.exit(1)
}
await db.update(collectionRuns).set({ status: 'running', workerId: 'cli' }).where(eq(collectionRuns.id, runId))
const status = await executeRun(db, env, runId, { logger: log })
const [run] = await db.select().from(collectionRuns).where(eq(collectionRuns.id, runId))
console.log(`\nRun ${status}`)
for (const [platform, result] of Object.entries(run!.platformResults)) {
  console.log(`  ${platform}: ${result!.status} — ${result!.itemsUpserted} posts, ${result!.snapshotsWritten} snapshots`)
  for (const step of result!.steps) console.log(`    ${step.status.padEnd(11)} ${step.name}${step.items !== undefined ? ` (${step.items})` : ''}${step.detail ? ` — ${step.detail}` : ''}`)
  if (result!.error) console.log(`    error: ${result!.error.kind}: ${result!.error.message}`)
}
for (const step of run!.steps) console.log(`  ${step.name}: ${step.status}${step.detail ? ` — ${step.detail}` : ''}`)
await handle.close()
process.exit(status === 'failed' ? 1 : 0)
