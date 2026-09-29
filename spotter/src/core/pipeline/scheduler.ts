/**
 * Scheduling: which runs are due, and handing them to exactly one worker.
 *
 * Slots are local times in the creator's timezone (default 07:00, 13:00,
 * 19:00). A slot missed while nothing was running is caught up once if it
 * is less than a few hours old. The unique (profile, mode, scheduled_for)
 * index makes enqueueing idempotent even with several workers; claiming uses
 * FOR UPDATE SKIP LOCKED so two workers never take the same run.
 */
import { Cron } from 'croner'
import { and, eq, inArray, isNotNull, lt, sql } from 'drizzle-orm'
import { parseSettings, type AppSettings } from '../config/settings'
import type { Database } from '../db/client'
import { rowsOf } from '../db/client'
import { collectionRuns, creatorProfiles, platformConnectorHealth } from '../db/schema'

const CATCH_UP_MS = 3 * 3_600_000
const STALE_MS = 15 * 60_000

function crons(settings: AppSettings, timeZone: string): Cron[] {
  return settings.schedule.times.map((time) => {
    const [h, m] = time.split(':').map(Number)
    return new Cron(`${m} ${h} * * *`, { timezone: timeZone, paused: true })
  })
}

export function nextSlot(settings: AppSettings, timeZone: string, after: Date): Date | null {
  if (!settings.schedule.enabled) return null
  const next = crons(settings, timeZone)
    .map((c) => c.nextRun(after))
    .filter((d): d is Date => d !== null)
  return next.length ? new Date(Math.min(...next.map((d) => d.getTime()))) : null
}

export function latestSlot(settings: AppSettings, timeZone: string, atOrBefore: Date): Date | null {
  if (!settings.schedule.enabled) return null
  const prev = crons(settings, timeZone)
    .map((c) => c.previousRuns(1, new Date(atOrBefore.getTime() + 1000))[0])
    .filter((d): d is Date => !!d && d.getTime() <= atOrBefore.getTime())
  return prev.length ? new Date(Math.max(...prev.map((d) => d.getTime()))) : null
}

/** All slots in [from, to), for demo backfill. */
export function slotsBetween(settings: AppSettings, timeZone: string, from: Date, to: Date): Date[] {
  const out: Date[] = []
  let cursor = new Date(from.getTime() - 1000)
  for (let i = 0; i < 1000; i++) {
    const next = nextSlot({ ...settings, schedule: { ...settings.schedule, enabled: true } }, timeZone, cursor)
    if (!next || next >= to) break
    out.push(next)
    cursor = next
  }
  return out
}

export async function enqueueDueRuns(db: Database, now: Date): Promise<number> {
  const profiles = await db.select().from(creatorProfiles).where(isNotNull(creatorProfiles.setupCompletedAt))
  let queued = 0
  for (const profile of profiles) {
    const settings = parseSettings(profile.settings)
    const slot = latestSlot(settings, profile.timezone, now)
    if (!slot || now.getTime() - slot.getTime() > CATCH_UP_MS) continue
    const inserted = await db
      .insert(collectionRuns)
      .values({ creatorProfileId: profile.id, dataMode: profile.dataMode, trigger: 'schedule', status: 'queued', scheduledFor: slot, requestedAt: now })
      .onConflictDoNothing()
      .returning({ id: collectionRuns.id })
    queued += inserted.length
    const upcoming = nextSlot(settings, profile.timezone, now)
    await db
      .update(platformConnectorHealth)
      .set({ nextScheduledAt: upcoming })
      .where(eq(platformConnectorHealth.creatorProfileId, profile.id))
  }
  return queued
}

/** Queue an on-demand run, unless one is already queued or running for this profile. */
export async function requestRun(db: Database, profileId: string, trigger: 'manual' | 'setup' | 'cli', now = new Date()): Promise<{ runId: string; alreadyPending: boolean }> {
  const [profile] = await db.select().from(creatorProfiles).where(eq(creatorProfiles.id, profileId))
  if (!profile) throw new Error('Profile not found')
  const [pending] = await db
    .select({ id: collectionRuns.id })
    .from(collectionRuns)
    .where(and(eq(collectionRuns.creatorProfileId, profileId), inArray(collectionRuns.status, ['queued', 'running'])))
    .limit(1)
  if (pending) return { runId: pending.id, alreadyPending: true }
  const [row] = await db
    .insert(collectionRuns)
    .values({ creatorProfileId: profileId, dataMode: profile.dataMode, trigger, status: 'queued', requestedAt: now })
    .returning({ id: collectionRuns.id })
  return { runId: row!.id, alreadyPending: false }
}

export async function claimNextRun(db: Database, workerId: string, now: Date): Promise<string | null> {
  const result = await db.execute(sql`
    UPDATE collection_runs
       SET status = 'running', started_at = ${now}, heartbeat_at = ${now}, worker_id = ${workerId}
     WHERE id = (
       SELECT id FROM collection_runs
        WHERE status = 'queued'
        ORDER BY requested_at
        LIMIT 1
        FOR UPDATE SKIP LOCKED)
    RETURNING id`)
  return rowsOf<{ id: string }>(result)[0]?.id ?? null
}

/** Runs whose worker vanished mid-run are marked failed, so they do not block new runs. */
export async function recoverStaleRuns(db: Database, now: Date): Promise<number> {
  const stale = await db
    .update(collectionRuns)
    .set({ status: 'failed', finishedAt: now, error: 'The worker stopped before finishing this run (restart or crash). It will run again at the next slot.' })
    .where(and(eq(collectionRuns.status, 'running'), lt(collectionRuns.heartbeatAt, new Date(now.getTime() - STALE_MS))))
    .returning({ id: collectionRuns.id })
  return stale.length
}
