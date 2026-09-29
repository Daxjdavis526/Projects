/**
 * Build (or rebuild) the demo workspace from the command line.
 *
 *   npm run demo:seed                     # uses the first profile, or creates demo@spotter.local
 *                                         # (password: SPOTTER_DEMO_PASSWORD, or a random one printed once)
 *   npm run demo:seed -- --days 14
 */
import './load-env'
import { eq, isNotNull } from 'drizzle-orm'
import { getEnv } from '../src/core/config/env'
import { openDatabase } from '../src/core/db/client'
import { creatorProfiles } from '../src/core/db/schema'
import { demoSummary, seedDemoWorkspace } from '../src/core/demo/seed'
import { getLogger } from '../src/core/observability/logger'
import { randomToken } from '../src/core/security/random'
import { countUsers, createUserWithProfile } from '../src/core/services/users'

const args = process.argv.slice(2)
const days = Number(args[args.indexOf('--days') + 1] ?? 10) || 10
const log = getLogger('seed')
const env = getEnv()
const handle = await openDatabase({ runMigrations: true })
const db = handle.db

let [profile] = await db.select().from(creatorProfiles).limit(1)
if (!profile) {
  if ((await countUsers(db)) > 0) throw new Error('Users exist but no creator profile: open the app to finish setup.')
  // A fresh random password unless one is supplied; shown once on this terminal, never logged.
  const password = process.env.SPOTTER_DEMO_PASSWORD || randomToken(12)
  const { profileId } = await createUserWithProfile(db, {
    email: 'demo@spotter.local',
    displayName: 'Demo Creator',
    password,
    timezone: 'America/New_York',
  })
  log.info('Created demo login', { email: 'demo@spotter.local' })
  process.stdout.write(`\n  Sign in as demo@spotter.local with password: ${password}\n\n`)
  ;[profile] = await db.select().from(creatorProfiles).where(eq(creatorProfiles.id, profileId))
}
const started = Date.now()
await seedDemoWorkspace(db, env, profile!.id, {
  days,
  logger: log,
  onProgress: (done, total) => process.stdout.write(`\r  backfilling runs ${done}/${total}`),
})
process.stdout.write('\n')
await db.update(creatorProfiles).set({ setupCompletedAt: new Date(), setupStep: 7 }).where(isNotNull(creatorProfiles.id))
log.info('Seeded', { ...(await demoSummary(db, profile!.id)), seconds: Math.round((Date.now() - started) / 1000) })
await handle.close()
