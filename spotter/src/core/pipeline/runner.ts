/**
 * One collection run, end to end:
 *
 *   collect (all platforms, isolated) → AI analysis → trends → personalisation → recommendations
 *
 * Each stage is recorded with its timing and outcome. A failing stage is
 * recorded and the run continues with what exists: the dashboard always has
 * the best analysis the available data allows.
 */
import { eq } from 'drizzle-orm'
import type { Env } from '../config/env'
import type { Database } from '../db/client'
import { collectionRuns } from '../db/schema'
import type { CollectionStep, Platform, PlatformRunResult } from '../domain/types'
import type { Logger } from '../observability/logger'
import { runAiStage } from './analyze'
import { runCollectionStage } from './collect'
import { buildRunContext, loadProfile, type RunContext } from './context'
import { runPersonalizationStage, type PersonalizationResult } from './personalize'
import { runRecommendationStage } from './recommend'
import { recordEvent } from './store/events'
import { runTrendStage, type ScoredCluster } from './trends'

export interface ExecuteOptions {
  logger: Logger
  /** Simulated clock (demo backfill). Defaults to the wall clock. */
  clock?: () => Date
  skipRecommendations?: boolean
  skipPersonalization?: boolean
}

export type RunStatus = 'succeeded' | 'partial' | 'failed'

export async function executeRun(db: Database, env: Env, runId: string, options: ExecuteOptions): Promise<RunStatus> {
  const [run] = await db.select().from(collectionRuns).where(eq(collectionRuns.id, runId)).limit(1)
  if (!run) throw new Error(`Run ${runId} not found`)
  const profile = await loadProfile(db, run.creatorProfileId)
  const clock = options.clock ?? (() => new Date())
  const logger = options.logger.child({ runId, trigger: run.trigger })
  const rc: RunContext = buildRunContext({ db, env, logger, profile, runId, trigger: run.trigger, clock })
  await db
    .update(collectionRuns)
    .set({ status: 'running', startedAt: rc.now, clockAt: rc.now, heartbeatAt: new Date() })
    .where(eq(collectionRuns.id, runId))

  const heartbeat = options.clock
    ? null
    : setInterval(() => {
        void db.update(collectionRuns).set({ heartbeatAt: new Date() }).where(eq(collectionRuns.id, runId)).catch(() => {})
      }, 30_000)
  heartbeat?.unref?.()

  const steps: CollectionStep[] = []
  const stage = async <T>(name: string, fn: () => Promise<T>, describe: (r: T) => { detail?: string; counts?: Record<string, number> }): Promise<T | null> => {
    const started = rc.clock()
    try {
      const result = await fn()
      steps.push({ name, status: 'ok', startedAt: started.toISOString(), finishedAt: rc.clock().toISOString(), ...describe(result) })
      return result
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      steps.push({ name, status: 'failed', startedAt: started.toISOString(), finishedAt: rc.clock().toISOString(), detail: message })
      logger.error(`Stage ${name} failed`, { error: err })
      await recordEvent(db, { profileId: profile.id, level: 'error', category: name === 'ai' ? 'ai' : 'analysis', message: `${name} stage failed: ${message}`, at: rc.now })
      return null
    }
  }

  let platformResults: Partial<Record<Platform, PlatformRunResult>> = {}
  let finalStatus: RunStatus = 'failed'
  try {
    const collected = await stage(
      'collect',
      () => runCollectionStage(rc, { useQuotaReserve: run.trigger !== 'schedule' && run.trigger !== 'backfill', skipBackoff: run.trigger !== 'schedule' }),
      (r) => {
        const results = Object.values(r.platformResults)
        return {
          detail: results.length ? undefined : 'No connected platforms.',
          counts: {
            platforms: results.length,
            items: results.reduce((s, p) => s + p.itemsUpserted, 0),
            snapshots: results.reduce((s, p) => s + p.snapshotsWritten, 0),
          },
        }
      },
    )
    platformResults = collected?.platformResults ?? {}
    await stage('ai', () => runAiStage(rc, collected?.comments ?? new Map()), (r) => ({
      detail: [r.provider, r.embeddingModel, ...r.notes].join(' · '),
      counts: { analysed: r.analysed, fallbacks: r.fallbacks, embedded: r.embedded },
    }))
    const trends = await stage('trends', () => runTrendStage(rc), (r) => ({ counts: { scored: r.scored.length, created: r.created, merged: r.merged, dormant: r.dormant } }))
    let personal: PersonalizationResult | null = null
    if (!options.skipPersonalization) {
      personal = await stage('personalize', () => runPersonalizationStage(rc), (r) => ({ counts: { ownPosts: r.ownPosts, patterns: r.lifts.length } }))
    }
    if (!options.skipRecommendations && trends && personal) {
      await stage('recommend', () => runRecommendationStage(rc, trends.scored as ScoredCluster[], personal!), (r) => ({
        detail: r.batchId ? undefined : 'Not due, or nothing passed the gates.',
        counts: { recommendations: r.count, excluded: r.excluded },
      }))
    }

    const platforms = Object.values(platformResults)
    const platformTrouble = platforms.some((p) => p.status === 'failed' || p.status === 'partial')
    const allPlatformsFailed = platforms.length > 0 && platforms.every((p) => p.status === 'failed')
    const stageFailures = steps.filter((s) => s.status === 'failed').length
    finalStatus = allPlatformsFailed && stageFailures >= 2 ? 'failed' : platformTrouble || stageFailures ? 'partial' : 'succeeded'
  } finally {
    if (heartbeat) clearInterval(heartbeat)
    await db
      .update(collectionRuns)
      .set({
        status: finalStatus,
        finishedAt: options.clock ? rc.clock() : new Date(),
        platformResults,
        steps,
        error: finalStatus === 'failed' ? (steps.find((s) => s.status === 'failed')?.detail ?? 'Run failed') : null,
      })
      .where(eq(collectionRuns.id, runId))
  }
  logger.info('Run finished', { status: finalStatus, steps: steps.map((s) => `${s.name}:${s.status}`).join(' ') })
  return finalStatus
}
