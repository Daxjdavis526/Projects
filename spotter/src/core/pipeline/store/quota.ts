/**
 * Quota usage persisted in PostgreSQL, so the web server, the worker and
 * restarts all see the same count. Consumption is a single atomic statement.
 */
import { and, eq, sql } from 'drizzle-orm'
import type { Database } from '../../db/client'
import { rowsOf } from '../../db/client'
import { apiQuotaUsage } from '../../db/schema'
import type { QuotaStore } from '../../connectors/quota'
import type { QuotaBucket } from '../../connectors/types'

export class DbQuotaStore implements QuotaStore {
  /**
   * `namespace` keeps simulated (demo) calls out of the real platforms'
   * counters: demo usage is recorded as "demo:youtube.units", live as "youtube.units".
   */
  constructor(
    private readonly db: Database,
    private readonly namespace = '',
  ) {}

  async tryConsume(bucket: QuotaBucket, day: string, units: number, limit: number): Promise<number | null> {
    const key = `${this.namespace}${bucket}`
    const result = await this.db.execute(sql`
      INSERT INTO api_quota_usage (bucket, quota_day, units_used, call_count, updated_at)
      VALUES (${key}, ${day}, ${units}, 1, now())
      ON CONFLICT (bucket, quota_day) DO UPDATE
        SET units_used = api_quota_usage.units_used + EXCLUDED.units_used,
            call_count = api_quota_usage.call_count + 1,
            updated_at = now()
        WHERE api_quota_usage.units_used + EXCLUDED.units_used <= ${limit}
      RETURNING units_used`)
    const rows = rowsOf<{ units_used: number }>(result)
    if (rows.length === 0) return null
    const total = Number(rows[0]!.units_used)
    // A first insert above the limit (units > limit) is not allowed either.
    return total > limit ? null : total
  }

  async used(bucket: QuotaBucket, day: string): Promise<number> {
    const [row] = await this.db
      .select({ units: apiQuotaUsage.unitsUsed })
      .from(apiQuotaUsage)
      .where(and(eq(apiQuotaUsage.bucket, `${this.namespace}${bucket}`), eq(apiQuotaUsage.quotaDay, day)))
    return row?.units ?? 0
  }
}
