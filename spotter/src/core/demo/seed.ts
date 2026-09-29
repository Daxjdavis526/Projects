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
import { loadProfile, worldFor } from '../pipeline/context'
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

/**
 * Point a profile at the demo world: data mode "demo", the world anchored at
 * the current hour, and the Instagram watchlist filled with the world's
 * accounts. Existing demo rows are kept unless `reset` is set.
 */
export async function prepareDemoWorkspace(db: Database, profileId: string, options: { now: Date; reset?: boolean }): Promise<void> {
  if (options.reset) await clearDemoData(db, profileId)
  const profile = await loadProfile(db, profileId)
  // Keep an existing anchor: the world (and everything collected from it) stays consistent.
  const anchor = !options.reset && profile.demoAnchorAt ? profile.demoAnchorAt : new Date(Math.floor(options.now.getTime() / 3_600_000) * 3_600_000)
  const world = getWorld({ seed: DEFAULT_DEMO_SEED, anchor })
  const settings = mergeSettings(parseSettings(profile.settings), {
    discovery: { instagram: { businessAccounts: world.creators.filter((c) => c.platform === 'instagram' && !c.isOwn).map((c) => c.handle) } },
  })
  await db
    .update(creatorProfiles)
    .set({ dataMode: 'demo', demoAnchorAt: anchor, demoSeed: DEFAULT_DEMO_SEED, settings, updatedAt: options.now })
    .where(eq(creatorProfiles.id, profileId))
}

/** Connect every demo account through the normal OAuth completion path (the CLI seed; the wizard connects them one by one). */
export async function connectDemoAccounts(db: Database, env: Env, profileId: string, at: Date): Promise<void> {
  const profile = await loadProfile(db, profileId)
  const world = worldFor(profile)
  if (!world) throw new Error('Prepare the demo workspace first')
  for (const platform of PLATFORMS) {
    const connector = createConnector(platform, 'mock', { env, clock: () => at, world })
    const completion = await connector.auth.exchangeCode({ code: 'demo-code', redirectUri: `${env.APP_URL}/api/oauth/${platform}/callback`, codeVerifier: createCodeVerifier(), now: at })
    await connectAccount(db, { profileId, platform, mode: 'mock', completion, now: at })
  }
}

/**
 * Backfill: run the real pipeline at each past schedule slot on a simulated
 * clock, for whichever demo accounts are connected, then today's run with
 * recommendations. The result is what `days` of running SPOTTER would have
 * produced — through the same code.
 */
export async function backfillDemoHistory(
  db: Database,
  env: Env,
  profileId: string,
  options: SeedOptions & { now: Date },
): Promise<{ runs: number }> {
  const logger = options.logger.child({ component: 'demo-seed' })
  const days = options.days ?? 10
  const now = options.now
  const profile = await loadProfile(db, profileId)
  const settings = parseSettings(profile.settings)
  const start = new Date(now.getTime() - days * DAY)
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
  const [run] = await db
    .insert(collectionRuns)
    .values({ creatorProfileId: profileId, dataMode: 'demo', trigger: 'setup', status: 'queued', requestedAt: now, clockAt: now })
    .returning({ id: collectionRuns.id })
  await executeRun(db, env, run!.id, { logger, clock: () => now })
  options.onProgress?.(total, total)
  logger.info('Demo workspace ready', { runs: total })
  return { runs: total }
}

/** The whole demo workspace in one go (CLI): prepare, connect everything, backfill. */
export async function seedDemoWorkspace(db: Database, env: Env, profileId: string, options: SeedOptions): Promise<void> {
  const now = options.now ?? new Date()
  await prepareDemoWorkspace(db, profileId, { now, reset: true })
  await connectDemoAccounts(db, env, profileId, new Date(now.getTime() - (options.days ?? 10) * DAY))
  await backfillDemoHistory(db, env, profileId, { ...options, now })
}

/**
 * Execute a queued "demo_setup" job (queued by the setup wizard): backfill the
 * demo history in the background and record the outcome on the job's row.
 */
export async function runDemoSetupJob(db: Database, env: Env, runId: string, logger: Logger): Promise<void> {
  const [job] = await db.select().from(collectionRuns).where(eq(collectionRuns.id, runId)).limit(1)
  if (!job) throw new Error(`Run ${runId} not found`)
  const now = new Date()
  await db.update(collectionRuns).set({ status: 'running', startedAt: now, clockAt: now, heartbeatAt: now }).where(eq(collectionRuns.id, runId))
  const heartbeat = setInterval(() => {
    void db.update(collectionRuns).set({ heartbeatAt: new Date() }).where(eq(collectionRuns.id, runId)).catch(() => {})
  }, 20_000)
  heartbeat.unref?.()
  try {
    const { runs } = await backfillDemoHistory(db, env, job.creatorProfileId, { logger, now })
    await db
      .update(collectionRuns)
      .set({
        status: 'succeeded',
        finishedAt: new Date(),
        steps: [{ name: 'demo_history', status: 'ok', startedAt: now.toISOString(), finishedAt: new Date().toISOString(), counts: { runs } }],
      })
      .where(eq(collectionRuns.id, runId))
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    logger.error('Demo setup failed', { error: err })
    await db
      .update(collectionRuns)
      .set({ status: 'failed', finishedAt: new Date(), error: message, steps: [{ name: 'demo_history', status: 'failed', startedAt: now.toISOString(), finishedAt: new Date().toISOString(), detail: message }] })
      .where(eq(collectionRuns.id, runId))
  } finally {
    clearInterval(heartbeat)
  }
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
