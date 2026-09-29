/**
 * Daily quota accounting.
 *
 * Every metered call reserves its cost before it is sent; a call that would
 * exceed the day's budget fails fast with `quota_exceeded` instead of being
 * sent and rejected. Scheduled runs leave a reserve (YOUTUBE_QUOTA_RESERVE_FRACTION)
 * so a manual refresh late in the day still works. Days follow the platform's
 * reset clock: YouTube resets at midnight Pacific.
 */
import type { Env } from '../config/env'
import type { Platform, RateLimitInfo } from '../domain/types'
import { ConnectorError } from './errors'
import type { QuotaBucket, QuotaGate } from './types'

export interface QuotaBucketDef {
  bucket: QuotaBucket
  platform: Platform
  label: string
  unit: 'units' | 'calls'
  dailyLimit: number
  resetTimeZone: string
}

export function quotaBuckets(env: Pick<Env, 'YOUTUBE_DAILY_QUOTA' | 'YOUTUBE_SEARCH_DAILY_LIMIT' | 'YOUTUBE_BATCH_STATS_DAILY_LIMIT'>): Record<QuotaBucket, QuotaBucketDef> {
  return {
    'youtube.units': {
      bucket: 'youtube.units',
      platform: 'youtube',
      label: 'YouTube Data API (general)',
      unit: 'units',
      dailyLimit: env.YOUTUBE_DAILY_QUOTA,
      resetTimeZone: 'America/Los_Angeles',
    },
    'youtube.search': {
      bucket: 'youtube.search',
      platform: 'youtube',
      label: 'YouTube search.list',
      unit: 'calls',
      dailyLimit: env.YOUTUBE_SEARCH_DAILY_LIMIT,
      resetTimeZone: 'America/Los_Angeles',
    },
    'youtube.batchGetStats': {
      bucket: 'youtube.batchGetStats',
      platform: 'youtube',
      label: 'YouTube videos.batchGetStats',
      unit: 'units',
      dailyLimit: env.YOUTUBE_BATCH_STATS_DAILY_LIMIT,
      resetTimeZone: 'America/Los_Angeles',
    },
  }
}

/** The calendar day (YYYY-MM-DD) in the bucket's reset timezone. */
export function quotaDay(now: Date, timeZone: string): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone, year: 'numeric', month: '2-digit', day: '2-digit' }).format(now)
}

/** The next midnight in `timeZone`, as an absolute time. */
export function nextReset(now: Date, timeZone: string): Date {
  const today = quotaDay(now, timeZone)
  // Walk forward in 15-minute steps to the first instant whose local date differs.
  let t = now.getTime()
  for (let i = 0; i < 24 * 4 + 8; i++) {
    t += 15 * 60_000
    if (quotaDay(new Date(t), timeZone) !== today) {
      // Refine to the minute.
      let lo = t - 15 * 60_000
      let hi = t
      while (hi - lo > 1_000) {
        const mid = Math.floor((lo + hi) / 2)
        if (quotaDay(new Date(mid), timeZone) === today) lo = mid
        else hi = mid
      }
      // Local midnights fall on whole minutes: snap to the nearest one.
      return new Date(Math.round(hi / 60_000) * 60_000)
    }
  }
  return new Date(now.getTime() + 24 * 3_600_000)
}

export interface QuotaStore {
  /** Atomically add `units` if the result stays within `limit`. Returns the new total, or null if refused. */
  tryConsume(bucket: QuotaBucket, day: string, units: number, limit: number): Promise<number | null>
  used(bucket: QuotaBucket, day: string): Promise<number>
}

export class MemoryQuotaStore implements QuotaStore {
  private readonly usage = new Map<string, number>()
  async tryConsume(bucket: QuotaBucket, day: string, units: number, limit: number): Promise<number | null> {
    const key = `${bucket}:${day}`
    const current = this.usage.get(key) ?? 0
    if (current + units > limit) return null
    this.usage.set(key, current + units)
    return current + units
  }
  async used(bucket: QuotaBucket, day: string): Promise<number> {
    return this.usage.get(`${bucket}:${day}`) ?? 0
  }
}

export interface QuotaGateOptions {
  store: QuotaStore
  buckets: Record<QuotaBucket, QuotaBucketDef>
  /** Fraction of each bucket kept back for manual runs (ignored when `useReserve`). */
  reserveFraction: number
  /** Manual runs may spend the reserve. */
  useReserve: boolean
  now: () => Date
}

export function createQuotaGate(options: QuotaGateOptions): QuotaGate {
  return {
    async reserve(bucket, units, operation) {
      const def = options.buckets[bucket]
      const now = options.now()
      const day = quotaDay(now, def.resetTimeZone)
      const limit = options.useReserve ? def.dailyLimit : Math.floor(def.dailyLimit * (1 - options.reserveFraction))
      const total = await options.store.tryConsume(bucket, day, units, limit)
      if (total === null) {
        const reset = nextReset(now, def.resetTimeZone)
        throw new ConnectorError({
          kind: 'quota_exceeded',
          platform: def.platform,
          operation,
          message: `${def.label}: daily budget of ${limit} ${def.unit} reached${options.useReserve ? '' : ' (reserve kept for manual refreshes)'}; resets ${reset.toISOString()}`,
          retryable: false,
          retryAfterMs: reset.getTime() - now.getTime(),
        })
      }
    },
    async snapshot(platform): Promise<RateLimitInfo | null> {
      const defs = Object.values(options.buckets).filter((b) => b.platform === platform)
      if (defs.length === 0) return null
      const now = options.now()
      const parts: string[] = []
      let worst: { used: number; limit: number; def: QuotaBucketDef } | null = null
      for (const def of defs) {
        const used = await options.store.used(def.bucket, quotaDay(now, def.resetTimeZone))
        parts.push(`${def.label}: ${used}/${def.dailyLimit} ${def.unit}`)
        if (!worst || used / def.dailyLimit > worst.used / worst.limit) worst = { used, limit: def.dailyLimit, def }
      }
      return {
        kind: 'quota_units',
        used: worst!.used,
        limit: worst!.limit,
        remaining: Math.max(0, worst!.limit - worst!.used),
        resetAt: nextReset(now, worst!.def.resetTimeZone).toISOString(),
        windowLabel: 'per day (resets midnight Pacific)',
        observedAt: now.toISOString(),
        note: parts.join(' · '),
      }
    },
  }
}
