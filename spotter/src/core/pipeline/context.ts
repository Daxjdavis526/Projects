/**
 * Everything a pipeline stage needs, bundled once per run.
 */
import { eq } from 'drizzle-orm'
import type { Env } from '../config/env'
import { parseSettings, type AppSettings } from '../config/settings'
import type { Database } from '../db/client'
import { creatorProfiles } from '../db/schema'
import { DEFAULT_DEMO_SEED, getWorld, type DemoWorld } from '../demo/world'
import type { DataMode, DataOrigin } from '../domain/types'
import type { Logger } from '../observability/logger'

export type CreatorProfileRow = typeof creatorProfiles.$inferSelect

export interface RunContext {
  db: Database
  env: Env
  logger: Logger
  profile: CreatorProfileRow
  settings: AppSettings
  dataMode: DataMode
  /** Rows of these origins are "the data" for this mode. */
  origins: DataOrigin[]
  runId: string | null
  trigger: 'schedule' | 'manual' | 'setup' | 'cli' | 'backfill'
  /** The run's notion of now: the wall clock, or a simulated time during demo backfill. */
  now: Date
  clock: () => Date
  world: DemoWorld | null
}

export function originsFor(mode: DataMode): DataOrigin[] {
  return mode === 'demo' ? ['demo'] : ['live', 'manual']
}

export function worldFor(profile: CreatorProfileRow): DemoWorld | null {
  if (profile.dataMode !== 'demo' || !profile.demoAnchorAt) return null
  return getWorld({ seed: profile.demoSeed ?? DEFAULT_DEMO_SEED, anchor: profile.demoAnchorAt })
}

export async function loadProfile(db: Database, profileId: string): Promise<CreatorProfileRow> {
  const [profile] = await db.select().from(creatorProfiles).where(eq(creatorProfiles.id, profileId)).limit(1)
  if (!profile) throw new Error(`Creator profile ${profileId} not found`)
  return profile
}

export function buildRunContext(input: {
  db: Database
  env: Env
  logger: Logger
  profile: CreatorProfileRow
  runId: string | null
  trigger: RunContext['trigger']
  clock?: () => Date
}): RunContext {
  const clock = input.clock ?? (() => new Date())
  return {
    db: input.db,
    env: input.env,
    logger: input.logger,
    profile: input.profile,
    settings: parseSettings(input.profile.settings),
    dataMode: input.profile.dataMode,
    origins: originsFor(input.profile.dataMode),
    runId: input.runId,
    trigger: input.trigger,
    now: clock(),
    clock,
    world: worldFor(input.profile),
  }
}
