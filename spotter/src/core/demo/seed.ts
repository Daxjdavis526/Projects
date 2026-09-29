/**
 * Building a demo workspace.
 *
 * The simulated world is anchored at "now", three demo accounts are
 * connected through the real OAuth code path (against the demo transport),
 * and history is backfilled by running the real pipeline at each past
 * schedule slot with a simulated clock. The result is exactly what ten days
 * of running SPOTTER would have produced — through the same code.
 */
import { and, eq, inArray, sql } from 'drizzle-orm'
import type { Env } from '../config/env'
import { mergeSettings, parseSettings } from '../config/settings'
import { createConnector } from '../connectors/registry'
import type { Database } from '../db/client'
import { collectionRuns, contentItems, creatorProfiles, creators, recommendations, trendClusters } from '../db/schema'
import { PLATFORMS } from '../domain/types'
import type { Logger } from '../observability/logger'
import { connectAccount } from '../services/connections'
import { loadProfile } from '../pipeline/context'
import { executeRun } from '../pipeline/runner'
import { slotsBetween } from '../pipeline/scheduler'
import { createCodeVerifier } from '../security/random'
import { DEFAULT_DEMO_SEED, getWorld } from './world'

const DAY = 86_400_000

export interface SeedOptions {
  days?: number
  now?: Date
  logger: Logger
  onProgress?: (done: number, total: number) => void
}

/** Remove all demo-origin rows for a profile (synthetic data only). */
export async function clearDemoData(db: Database, profileId: string): Promise<void> {
  await db.delete(recommendations).where(and(eq(recommendations.creatorProfileId, profileId), eq(recommendations.dataMode, 'demo')))
  await db.delete(trendClusters).where(and(eq(trendClusters.creatorProfileId, profileId), eq(trendClusters.dataMode, 'demo')))
  await db.delete(collectionRuns).where(and(eq(collectionRuns.creatorProfileId, profileId), eq(collectionRuns.dataMode, 'demo')))
  await db.delete(contentItems).where(eq(contentItems.dataOrigin, 'demo'))
  await db.delete(creators).where(eq(creators.dataOrigin, 'demo'))
  await db.execute(sql`DELETE FROM platform_accounts WHERE creator_profile_id = ${profileId} AND mode = 'mock'`)
  await db.execute(sql`DELETE FROM platform_connector_health WHERE creator_profile_id = ${profileId} AND mode = 'mock'`)
  await db.execute(sql`DELETE FROM creator_content_performance WHERE creator_profile_id = ${profileId} AND data_mode = 'demo'`)
}

export async function seedDemoWorkspace(db: Database, env: Env, profileId: string, options: SeedOptions): Promise<void> {
  const now = options.now ?? new Date()
  const days = options.days ?? 10
  const logger = options.logger.child({ component: 'demo-seed' })
  await clearDemoData(db, profileId)

  // Anchor the world at now: theme lifecycles are designed around day 0.
  const anchor = new Date(Math.floor(now.getTime() / 3_600_000) * 3_600_000)
  const world = getWorld({ seed: DEFAULT_DEMO_SEED, anchor })
  let profile = await loadProfile(db, profileId)
  const settings = mergeSettings(parseSettings(profile.settings), {
    discovery: { instagram: { businessAccounts: world.creators.filter((c) => c.platform === 'instagram' && !c.isOwn).map((c) => c.handle) } },
  })
  await db
    .update(creatorProfiles)
    .set({ dataMode: 'demo', demoAnchorAt: anchor, demoSeed: DEFAULT_DEMO_SEED, settings, updatedAt: now })
    .where(eq(creatorProfiles.id, profileId))
  profile = await loadProfile(db, profileId)

  // Connect the three demo accounts through the normal OAuth completion path.
  const start = new Date(now.getTime() - days * DAY)
  for (const platform of PLATFORMS) {
    const connector = createConnector(platform, 'mock', { env, clock: () => start, world })
    const completion = await connector.auth.exchangeCode({ code: 'demo-code', redirectUri: `${env.APP_URL}/api/connections/${platform}/callback`, codeVerifier: createCodeVerifier(), now: start })
    await connectAccount(db, { profileId, platform, mode: 'mock', completion, now: start })
  }

  // Backfill: one run per past schedule slot, on a simulated clock.
  const slots = slotsBetween(settings, profile.timezone, start, now)
  const total = slots.length + 1
  for (let i = 0; i < slots.length; i++) {
    const t = slots[i]!
    const [run] = await db
      .insert(collectionRuns)
      .values({ creatorProfileId: profileId, dataMode: 'demo', trigger: 'backfill', status: 'queued', requestedAt: t, clockAt: t })
      .returning({ id: collectionRuns.id })
    const last = i === slots.length - 1
    await executeRun(db, env, run!.id, { logger, clock: () => t, skipRecommendations: true, skipPersonalization: !last })
    options.onProgress?.(i + 1, total)
  }
  // Today's run, with recommendations.
  const [run] = await db
    .insert(collectionRuns)
    .values({ creatorProfileId: profileId, dataMode: 'demo', trigger: 'setup', status: 'queued', requestedAt: now, clockAt: now })
    .returning({ id: collectionRuns.id })
  await executeRun(db, env, run!.id, { logger, clock: () => now })
  options.onProgress?.(total, total)
  logger.info('Demo workspace ready', { runs: total })
}

/** Rows the demo created, for a quick sanity summary. */
export async function demoSummary(db: Database, profileId: string) {
  const [items] = await db.select({ n: sql<number>`count(*)` }).from(contentItems).where(inArray(contentItems.dataOrigin, ['demo']))
  const [clusters] = await db
    .select({ n: sql<number>`count(*)` })
    .from(trendClusters)
    .where(and(eq(trendClusters.creatorProfileId, profileId), eq(trendClusters.dataMode, 'demo'), eq(trendClusters.status, 'active')))
  const [recs] = await db.select({ n: sql<number>`count(*)` }).from(recommendations).where(and(eq(recommendations.creatorProfileId, profileId), eq(recommendations.dataMode, 'demo')))
  return { items: Number(items?.n ?? 0), activeTrends: Number(clusters?.n ?? 0), recommendations: Number(recs?.n ?? 0) }
}
