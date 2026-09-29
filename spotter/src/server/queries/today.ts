/**
 * The dashboard: today's opportunities and what surrounds them.
 */
import 'server-only'
import { and, asc, desc, eq, gte, inArray, sql } from 'drizzle-orm'
import { buildInsights, type LiftRecord } from '@/core/analytics/personalization'
import { getDb } from '@/core/db/client'
import { contentItems, creatorContentPerformance, recommendations, trendClusters, trendScores } from '@/core/db/schema'
import type { FitComponents, Platform, RecommendationBeat, RecommendationEvidence, TrendStage } from '@/core/domain/types'
import type { Filters } from '@/lib/filters'
import type { Profile } from '../auth/session'
import { originsFor } from '@/core/pipeline/context'

const DAY = 86_400_000

export interface OpportunityCard {
  id: string
  rank: number
  clusterId: string | null
  trendLabel: string
  topicKey: string | null
  platforms: Platform[]
  stage: TrendStage
  opportunityScore: number
  trendScore: number
  fitScore: number
  confidence: number
  oneLiner: string
  whyItMatters: string
  suggestedAngle: string
  suggestedHook: string
  titleConcept: string
  captionConcept: string | null
  structure: RecommendationBeat[]
  alternativeAngles: string[]
  evidence: RecommendationEvidence
  fitComponents: FitComponents
  generatedBy: string
  generationNote: string | null
  status: string
  history: Array<{ t: number; score: number }>
}

export interface TodayData {
  batch: { id: string; createdAt: Date; generatedBy: string } | null
  cards: OpportunityCard[]
  hiddenByFilters: number
  totals: { activeTrends: number; postsTracked: number; creatorsTracked: number }
  insights: string[]
}

export async function getToday(profile: Profile, filters: Filters): Promise<TodayData> {
  const db = await getDb()
  const [latest] = await db
    .select({ batchId: recommendations.batchId, createdAt: recommendations.createdAt, generatedBy: recommendations.generatedBy })
    .from(recommendations)
    .where(and(eq(recommendations.creatorProfileId, profile.id), eq(recommendations.dataMode, profile.dataMode), eq(recommendations.source, 'batch')))
    .orderBy(desc(recommendations.createdAt))
    .limit(1)

  let cards: OpportunityCard[] = []
  let hidden = 0
  if (latest) {
    const rows = await db
      .select({ rec: recommendations, topicKey: trendClusters.topicKey, platforms: trendClusters.platforms })
      .from(recommendations)
      .leftJoin(trendClusters, eq(trendClusters.id, recommendations.clusterId))
      .where(and(eq(recommendations.batchId, latest.batchId), eq(recommendations.creatorProfileId, profile.id)))
      .orderBy(asc(recommendations.rank))
    const clusterIds = rows.map((r) => r.rec.clusterId).filter((id): id is string => !!id)
    const scores = clusterIds.length
      ? await db
          .select({ clusterId: trendScores.clusterId, t: trendScores.computedAt, score: trendScores.trendScore })
          .from(trendScores)
          .where(and(inArray(trendScores.clusterId, clusterIds), gte(trendScores.computedAt, new Date(latest.createdAt.getTime() - 10 * DAY))))
          .orderBy(asc(trendScores.computedAt))
      : []
    const all = rows.map(({ rec, topicKey, platforms }) => ({
      id: rec.id,
      rank: rec.rank,
      clusterId: rec.clusterId,
      trendLabel: rec.trendLabel,
      topicKey,
      platforms: (platforms ?? rec.evidence.platforms) as Platform[],
      stage: rec.stage,
      opportunityScore: rec.opportunityScore,
      trendScore: rec.trendScore,
      fitScore: rec.creatorFitScore,
      confidence: rec.confidence,
      oneLiner: rec.oneLiner,
      whyItMatters: rec.whyItMatters,
      suggestedAngle: rec.suggestedAngle,
      suggestedHook: rec.suggestedHook,
      titleConcept: rec.titleConcept,
      captionConcept: rec.captionConcept,
      structure: rec.structure,
      alternativeAngles: rec.alternativeAngles,
      evidence: rec.evidence,
      fitComponents: rec.fitComponents,
      generatedBy: rec.generatedBy,
      generationNote: rec.generationNote,
      status: rec.status,
      history: scores.filter((s) => s.clusterId === rec.clusterId).map((s) => ({ t: s.t.getTime(), score: Math.round(s.score * 10) / 10 })),
    }))
    cards = all.filter(
      (c) =>
        c.status !== 'dismissed' &&
        (!filters.platform || c.platforms.includes(filters.platform)) &&
        (!filters.stage || c.stage === filters.stage) &&
        (!filters.topic || c.topicKey === filters.topic) &&
        c.confidence >= filters.minConfidence,
    )
    hidden = all.length - cards.length
  }

  const origins = originsFor(profile.dataMode)
  const [trendCount, tracked, lifts] = await Promise.all([
    db
      .select({ n: sql<number>`count(*)` })
      .from(trendClusters)
      .where(and(eq(trendClusters.creatorProfileId, profile.id), eq(trendClusters.dataMode, profile.dataMode), eq(trendClusters.status, 'active'))),
    db
      .select({ posts: sql<number>`count(*)`, creators: sql<number>`count(distinct ${contentItems.creatorId})` })
      .from(contentItems)
      .where(and(inArray(contentItems.dataOrigin, origins), eq(contentItems.isOwn, false), gte(contentItems.publishedAt, new Date(Date.now() - 14 * DAY)))),
    db
      .select()
      .from(creatorContentPerformance)
      .where(and(eq(creatorContentPerformance.creatorProfileId, profile.id), eq(creatorContentPerformance.dataMode, profile.dataMode))),
  ])
  const liftRecords: LiftRecord[] = lifts.map((l) => ({
    dimension: l.dimension as LiftRecord['dimension'],
    value: l.value,
    postCount: l.postCount,
    meanLogLift: l.meanLogLift,
    shrunkLogLift: Math.log(l.lift),
    lift: l.lift,
    medianViews: l.medianViews,
    avgEngagementRate: l.avgEngagementRate,
    confidence: l.confidence,
  }))
  return {
    batch: latest ? { id: latest.batchId, createdAt: latest.createdAt, generatedBy: latest.generatedBy } : null,
    cards,
    hiddenByFilters: hidden,
    totals: {
      activeTrends: Number(trendCount[0]?.n ?? 0),
      postsTracked: Number(tracked[0]?.posts ?? 0),
      creatorsTracked: Number(tracked[0]?.creators ?? 0),
    },
    // Lead with what works; one caution at most.
    insights: [...buildInsights(liftRecords.filter((l) => l.lift > 1), 3), ...buildInsights(liftRecords.filter((l) => l.lift < 1), 1)],
  }
}
