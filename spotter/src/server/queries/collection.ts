/**
 * Collection status: runs, per-platform outcomes, quota and the event log.
 */
import 'server-only'
import { and, desc, eq, inArray, or, isNull } from 'drizzle-orm'
import { getEnv } from '@/core/config/env'
import { quotaBuckets, quotaDay, nextReset, type QuotaBucketDef } from '@/core/connectors/quota'
import { getDb } from '@/core/db/client'
import { apiQuotaUsage, collectionRuns, systemEvents } from '@/core/db/schema'
import type { CollectionStep, Platform, PlatformRunResult } from '@/core/domain/types'
import type { Profile } from '../auth/session'

export interface RunRow {
  id: string
  trigger: string
  status: string
  requestedAt: Date
  startedAt: Date | null
  finishedAt: Date | null
  clockAt: Date | null
  error: string | null
  platformResults: Partial<Record<Platform, PlatformRunResult>>
  steps: CollectionStep[]
}

export interface QuotaRow extends QuotaBucketDef {
  used: number
  calls: number
  resetsAt: Date
}

export interface EventRow {
  id: number
  level: string
  category: string
  platform: string | null
  message: string
  createdAt: Date
}

export async function getCollection(profile: Profile, options: { level?: string | null; includeBackfill?: boolean } = {}): Promise<{ runs: RunRow[]; quota: QuotaRow[]; events: EventRow[] }> {
  const db = await getDb()
  const env = getEnv()
  const triggers = options.includeBackfill ? ['schedule', 'manual', 'setup', 'cli', 'backfill', 'demo_setup'] : ['schedule', 'manual', 'setup', 'cli', 'demo_setup']
  const runs = await db
    .select()
    .from(collectionRuns)
    .where(and(eq(collectionRuns.creatorProfileId, profile.id), eq(collectionRuns.dataMode, profile.dataMode), inArray(collectionRuns.trigger, triggers as never[])))
    .orderBy(desc(collectionRuns.requestedAt))
    .limit(30)
  const now = new Date()
  const ns = profile.dataMode === 'demo' ? 'demo:' : ''
  const defs = Object.values(quotaBuckets(env))
  const usage = await db
    .select()
    .from(apiQuotaUsage)
    .where(inArray(apiQuotaUsage.bucket, defs.map((d) => `${ns}${d.bucket}`)))
  const quota = defs.map((d) => {
    const day = quotaDay(now, d.resetTimeZone)
    const row = usage.find((u) => u.bucket === `${ns}${d.bucket}` && u.quotaDay === day)
    return { ...d, used: row?.unitsUsed ?? 0, calls: row?.callCount ?? 0, resetsAt: nextReset(now, d.resetTimeZone) }
  })
  const levels = options.level === 'error' ? ['error'] : options.level === 'warn' ? ['warn', 'error'] : ['info', 'warn', 'error']
  const events = await db
    .select()
    .from(systemEvents)
    .where(and(or(eq(systemEvents.creatorProfileId, profile.id), isNull(systemEvents.creatorProfileId)), inArray(systemEvents.level, levels as never[])))
    .orderBy(desc(systemEvents.createdAt))
    .limit(80)
  return {
    runs: runs.map((r) => ({
      id: r.id,
      trigger: r.trigger,
      status: r.status,
      requestedAt: r.requestedAt,
      startedAt: r.startedAt,
      finishedAt: r.finishedAt,
      clockAt: r.clockAt,
      error: r.error,
      platformResults: r.platformResults,
      steps: r.steps,
    })),
    quota,
    events: events.map((e) => ({ id: e.id, level: e.level, category: e.category, platform: e.platform, message: e.message, createdAt: e.createdAt })),
  }
}
