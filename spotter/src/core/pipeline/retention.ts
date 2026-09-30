/**
 * Retention and data minimisation, run daily by the worker.
 *
 * - Platform limits (core/compliance/policy.ts): other channels' YouTube
 *   statistics older than 30 days are deleted (36 months once III.L is
 *   approved), and YouTube content not re-read within 30 days is deleted.
 * - The creator's authorized data is deleted when access has been lost for
 *   longer than the platform allows (YouTube: 30 days).
 * - Snapshot compaction: full resolution for 45 days, then one per day, then
 *   only the latest per post after 180 days.
 * - Housekeeping: expired sessions and OAuth states, old events.
 */
import { and, eq, inArray, lt, sql } from 'drizzle-orm'
import type { Env } from '../config/env'
import { policyFor } from '../compliance/policy'
import type { Database } from '../db/client'
import { rowsOf } from '../db/client'
import { contentItems, oauthStates, platformAccounts, sessions, systemEvents } from '../db/schema'
import { PLATFORMS } from '../domain/types'
import type { Logger } from '../observability/logger'

const DAY = 86_400_000
/** Detection lag (up to one schedule gap) plus the daily retention cadence. */
const LOST_ACCESS_MARGIN_DAYS = 2

export interface RetentionReport {
  deletedSnapshots: number
  deletedItems: number
  compactedSnapshots: number
  deletedOwnItems: number
  housekeeping: number
}

async function count(result: unknown): Promise<number> {
  const r = result as { rowCount?: number | null; affectedRows?: number }
  return r.rowCount ?? r.affectedRows ?? rowsOf(result).length
}

export async function runRetention(db: Database, env: Env, now: Date, logger: Logger): Promise<RetentionReport> {
  const report: RetentionReport = { deletedSnapshots: 0, deletedItems: 0, compactedSnapshots: 0, deletedOwnItems: 0, housekeeping: 0 }

  for (const platform of PLATFORMS) {
    const policy = policyFor(platform, env, 'live')
    if (policy.publicStatsRetentionDays !== null) {
      const cutoff = new Date(now.getTime() - policy.publicStatsRetentionDays * DAY)
      report.deletedSnapshots += await count(
        await db.execute(sql`
          DELETE FROM content_metric_snapshots s
           USING content_items ci
           WHERE s.content_item_id = ci.id
             AND ci.platform = ${platform}
             AND ci.data_origin = 'live'
             AND ci.is_own = false
             AND s.collected_at < ${cutoff}`),
      )
    }
    if (policy.publicMetadataRefreshDays !== null) {
      const cutoff = new Date(now.getTime() - policy.publicMetadataRefreshDays * DAY)
      const deleted = await db
        .delete(contentItems)
        .where(and(eq(contentItems.platform, platform), eq(contentItems.dataOrigin, 'live'), eq(contentItems.isOwn, false), lt(contentItems.metadataRefreshedAt, cutoff)))
        .returning({ id: contentItems.id })
      report.deletedItems += deleted.length
    }
    if (policy.authorizationRecheckDays !== null) {
      // Authorized data whose access could not be re-confirmed for too long. Access loss is only
      // noticed at the next run and retention runs daily, so delete two days early to stay inside
      // the platform's window counted from the actual loss.
      const cutoff = new Date(now.getTime() - (policy.authorizationRecheckDays - LOST_ACCESS_MARGIN_DAYS) * DAY)
      const lost = await db
        .select({ id: platformAccounts.id })
        .from(platformAccounts)
        .where(and(eq(platformAccounts.platform, platform), eq(platformAccounts.mode, 'live'), inArray(platformAccounts.status, ['needs_reauth', 'error']), lt(platformAccounts.accessLostAt, cutoff)))
      for (const account of lost) report.deletedOwnItems += await deleteAuthorizedData(db, account.id)
    }
  }

  // Compaction (all origins, including demo).
  report.compactedSnapshots += await count(
    await db.execute(sql`
      DELETE FROM content_metric_snapshots s
       USING (
         SELECT id, row_number() OVER (PARTITION BY content_item_id, date_trunc('day', collected_at) ORDER BY collected_at DESC) AS rn
           FROM content_metric_snapshots
          WHERE collected_at < ${new Date(now.getTime() - 45 * DAY)}
       ) d
       WHERE s.id = d.id AND d.rn > 1`),
  )
  report.compactedSnapshots += await count(
    await db.execute(sql`
      DELETE FROM content_metric_snapshots s
       USING (
         SELECT id, row_number() OVER (PARTITION BY content_item_id ORDER BY collected_at DESC) AS rn
           FROM content_metric_snapshots
          WHERE collected_at < ${new Date(now.getTime() - 180 * DAY)}
       ) d
       WHERE s.id = d.id AND d.rn > 1`),
  )

  report.housekeeping += (await db.delete(sessions).where(lt(sessions.expiresAt, now)).returning({ id: sessions.id })).length
  report.housekeeping += (await db.delete(oauthStates).where(lt(oauthStates.expiresAt, new Date(now.getTime() - DAY))).returning({ id: oauthStates.id })).length
  report.housekeeping += (await db.delete(systemEvents).where(lt(systemEvents.createdAt, new Date(now.getTime() - 90 * DAY))).returning({ id: systemEvents.id })).length
  logger.info('Retention completed', { ...report })
  return report
}

/**
 * Delete everything collected through one connected account: its own posts,
 * their snapshots and analysis (cascade), and the account's creator record.
 * Used on disconnect, on a platform's deauthorisation callback, and when
 * access has been lost for longer than policy allows.
 */
export async function deleteAuthorizedData(db: Database, platformAccountId: string): Promise<number> {
  const result = await db.execute(sql`
    DELETE FROM content_items ci
     USING creators c
     WHERE ci.creator_id = c.id
       AND c.platform_account_id = ${platformAccountId}
       AND ci.is_own = true`)
  await db.execute(sql`DELETE FROM creators WHERE platform_account_id = ${platformAccountId} AND is_own = true`)
  await db.execute(sql`DELETE FROM account_metric_days WHERE platform_account_id = ${platformAccountId}`)
  return count(result)
}
