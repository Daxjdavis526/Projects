/**
 * History: earlier recommendation batches and trends that have faded.
 */
import 'server-only'
import { and, desc, eq, gte, inArray, max, sql } from 'drizzle-orm'
import { getDb } from '@/core/db/client'
import { recommendations, trendClusters, trendScores } from '@/core/db/schema'
import type { TrendStage } from '@/core/domain/types'
import type { Profile } from '../auth/session'

const DAY = 86_400_000

export interface HistoryBatch {
  batchId: string
  source: 'batch' | 'on_demand'
  createdAt: Date
  items: Array<{ id: string; rank: number; clusterId: string | null; trendLabel: string; stage: TrendStage; opportunityScore: number; status: string; suggestedHook: string }>
}

export interface PastTrend {
  id: string
  label: string
  status: string
  stage: TrendStage | null
  peakScore: number | null
  latestScore: number | null
  firstDetectedAt: Date
  lastActivityAt: Date
  itemCount: number
}

export async function getHistory(profile: Profile): Promise<{ batches: HistoryBatch[]; pastTrends: PastTrend[] }> {
  const db = await getDb()
  const recs = await db
    .select()
    .from(recommendations)
    .where(and(eq(recommendations.creatorProfileId, profile.id), eq(recommendations.dataMode, profile.dataMode), gte(recommendations.createdAt, new Date(Date.now() - 90 * DAY))))
    .orderBy(desc(recommendations.createdAt), recommendations.rank)
    .limit(400)
  const byBatch = new Map<string, HistoryBatch>()
  for (const r of recs) {
    let b = byBatch.get(r.batchId)
    if (!b) byBatch.set(r.batchId, (b = { batchId: r.batchId, source: r.source, createdAt: r.createdAt, items: [] }))
    b.items.push({ id: r.id, rank: r.rank, clusterId: r.clusterId, trendLabel: r.trendLabel, stage: r.stage, opportunityScore: r.opportunityScore, status: r.status, suggestedHook: r.suggestedHook })
  }
  const faded = await db
    .select()
    .from(trendClusters)
    .where(
      and(
        eq(trendClusters.creatorProfileId, profile.id),
        eq(trendClusters.dataMode, profile.dataMode),
        sql`(${trendClusters.status} = 'dormant' OR (${trendClusters.status} = 'active' AND ${trendClusters.stage} = 'declining'))`,
      ),
    )
    .orderBy(desc(trendClusters.lastActivityAt))
    .limit(60)
  const peaks = faded.length
    ? await db
        .select({ clusterId: trendScores.clusterId, peak: max(trendScores.trendScore) })
        .from(trendScores)
        .where(inArray(trendScores.clusterId, faded.map((f) => f.id)))
        .groupBy(trendScores.clusterId)
    : []
  return {
    batches: [...byBatch.values()],
    pastTrends: faded.map((f) => ({
      id: f.id,
      label: f.label,
      status: f.status,
      stage: f.stage,
      peakScore: peaks.find((p) => p.clusterId === f.id)?.peak ?? null,
      latestScore: f.latestTrendScore,
      firstDetectedAt: f.firstDetectedAt,
      lastActivityAt: f.lastActivityAt,
      itemCount: f.itemCount,
    })),
  }
}
