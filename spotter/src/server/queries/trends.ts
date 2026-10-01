/**
 * Trends: the list (with filters) and the detail page.
 */
import 'server-only'
import { and, asc, desc, eq, gte, inArray, sql } from 'drizzle-orm'
import { getDb } from '@/core/db/client'
import {
  aiAnalysis,
  contentItems,
  creators,
  recommendations,
  trendClusterMembers,
  trendClusters,
  trendScores,
} from '@/core/db/schema'
import type { ClusterPattern, FitComponents, Platform, RecommendationBeat, RecommendationEvidence, TrendComponents, TrendMetrics, TrendStage } from '@/core/domain/types'
import { TOPICS } from '@/core/ai/local/lexicon'
import { RANGES, type Filters } from '@/lib/filters'
import type { Profile } from '../auth/session'

const DAY = 86_400_000

export interface TrendRow {
  id: string
  label: string
  summary: string | null
  topicKey: string | null
  stage: TrendStage | null
  stageBasis: string | null
  trendScore: number | null
  fitScore: number | null
  opportunityScore: number | null
  confidence: number | null
  itemCount: number
  creatorCount: number
  platforms: Platform[]
  isBreakout: boolean
  lastActivityAt: Date
  firstDetectedAt: Date
  momentumPerDay: number | null
  postsLast3Days: number | null
  history: Array<{ t: number; score: number }>
}

function whereFor(profile: Profile, filters: Filters, now: Date) {
  const conditions = [
    eq(trendClusters.creatorProfileId, profile.id),
    eq(trendClusters.dataMode, profile.dataMode),
    eq(trendClusters.status, 'active'),
    gte(trendClusters.lastActivityAt, new Date(now.getTime() - RANGES[filters.range] * DAY)),
  ]
  if (filters.stage) conditions.push(eq(trendClusters.stage, filters.stage))
  if (filters.topic) conditions.push(eq(trendClusters.topicKey, filters.topic))
  if (filters.platform) conditions.push(sql`${filters.platform} = ANY(${trendClusters.platforms})`)
  if (filters.minConfidence > 0) conditions.push(gte(trendClusters.latestConfidence, filters.minConfidence))
  return and(...conditions)
}

export async function getTrendRows(profile: Profile, filters: Filters, options: { sort?: 'opportunity' | 'trend' | 'fit' | 'recent'; limit?: number } = {}): Promise<TrendRow[]> {
  const db = await getDb()
  const now = new Date()
  const order =
    options.sort === 'trend'
      ? desc(trendClusters.latestTrendScore)
      : options.sort === 'fit'
        ? desc(trendClusters.latestFitScore)
        : options.sort === 'recent'
          ? desc(trendClusters.lastActivityAt)
          : desc(sql`coalesce(${trendClusters.latestOpportunityScore}, ${trendClusters.latestTrendScore})`)
  const rows = await db
    .select()
    .from(trendClusters)
    .where(whereFor(profile, filters, now))
    .orderBy(order, desc(trendClusters.latestTrendScore))
    .limit(options.limit ?? 200)
  if (rows.length === 0) return []
  const scores = await db
    .select({ clusterId: trendScores.clusterId, t: trendScores.computedAt, score: trendScores.trendScore, metrics: trendScores.metrics })
    .from(trendScores)
    .where(and(inArray(trendScores.clusterId, rows.map((r) => r.id)), gte(trendScores.computedAt, new Date(now.getTime() - 10 * DAY))))
    .orderBy(asc(trendScores.computedAt))
  const byCluster = new Map<string, typeof scores>()
  for (const s of scores) {
    const list = byCluster.get(s.clusterId) ?? []
    list.push(s)
    byCluster.set(s.clusterId, list)
  }
  return rows.map((r) => {
    const history = byCluster.get(r.id) ?? []
    const latest = history.at(-1)?.metrics
    return {
      id: r.id,
      label: r.label,
      summary: r.summary,
      topicKey: r.topicKey,
      stage: r.stage,
      stageBasis: r.stageBasis,
      trendScore: r.latestTrendScore,
      fitScore: r.latestFitScore,
      opportunityScore: r.latestOpportunityScore,
      confidence: r.latestConfidence,
      itemCount: r.itemCount,
      creatorCount: r.creatorCount,
      platforms: r.platforms,
      isBreakout: r.isBreakout,
      lastActivityAt: r.lastActivityAt,
      firstDetectedAt: r.firstDetectedAt,
      momentumPerDay: latest?.accelerationRatio ?? null,
      postsLast3Days: latest?.postsLast72h ?? null,
      history: history.map((h) => ({ t: h.t.getTime(), score: Math.round(h.score * 10) / 10 })),
    }
  })
}

/** How many active trends are in each stage under the given filters (ignoring the stage filter). */
export async function getStageCounts(profile: Profile, filters: Filters): Promise<Record<string, number>> {
  const db = await getDb()
  const rows = await db
    .select({ stage: trendClusters.stage, n: sql<number>`count(*)` })
    .from(trendClusters)
    .where(whereFor(profile, { ...filters, stage: null }, new Date()))
    .groupBy(trendClusters.stage)
  const out: Record<string, number> = { all: 0 }
  for (const r of rows) {
    out[r.stage ?? 'unknown'] = Number(r.n)
    out.all! += Number(r.n)
  }
  return out
}

/** Topic options for the filter: the topics of active trends, labelled. */
export async function getTopicOptions(profile: Profile): Promise<Array<{ key: string; label: string }>> {
  const db = await getDb()
  const rows = await db
    .selectDistinct({ key: trendClusters.topicKey, label: trendClusters.label })
    .from(trendClusters)
    .where(and(eq(trendClusters.creatorProfileId, profile.id), eq(trendClusters.dataMode, profile.dataMode), eq(trendClusters.status, 'active')))
  const seen = new Map<string, string>()
  for (const r of rows) {
    if (!r.key || seen.has(r.key)) continue
    seen.set(r.key, TOPICS.find((t) => t.key === r.key)?.label ?? r.label)
  }
  return [...seen.entries()].map(([key, label]) => ({ key, label })).sort((a, b) => a.label.localeCompare(b.label))
}

// ---------------------------------------------------------------------------
// Detail
// ---------------------------------------------------------------------------

export interface TrendMemberView {
  id: string
  platform: Platform
  url: string | null
  title: string | null
  hook: string | null
  format: string | null
  hookType: string | null
  creatorName: string | null
  creatorHandle: string | null
  creatorUrl: string | null
  followers: number | null
  publishedAt: Date | null
  views: number | null
  likes: number | null
  comments: number | null
  shares: number | null
  durationSeconds: number | null
  audioName: string | null
  audioType: string | null
  dataOrigin: string
  similarity: number
  outperformance: number | null
  outperformanceMethod: string | null
  viewsPerHour: number | null
}

export interface BriefView {
  id: string
  source: 'batch' | 'on_demand'
  createdAt: Date
  rank: number
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
}

export interface TrendDetail {
  id: string
  label: string
  summary: string | null
  explanationLines: string[]
  explanationBy: string | null
  topicKey: string | null
  status: string
  stage: TrendStage | null
  stageBasis: string | null
  isBreakout: boolean
  firstDetectedAt: Date
  lastActivityAt: Date
  platforms: Platform[]
  keywords: string[]
  patterns: ClusterPattern | null
  trendScore: number | null
  fitScore: number | null
  opportunityScore: number | null
  confidence: number | null
  components: TrendComponents | null
  fitComponents: FitComponents | null
  metrics: TrendMetrics | null
  weights: Record<string, number> | null
  history: Array<{ t: number; score: number; confidence: number; stage: TrendStage; momentum: number | null; viewsPerHour: number | null; posts3d: number | null }>
  members: TrendMemberView[]
  brief: BriefView | null
}

export async function getTrendDetail(profile: Profile, clusterId: string): Promise<TrendDetail | null> {
  if (!/^[0-9a-f-]{36}$/.test(clusterId)) return null
  const db = await getDb()
  const [cluster] = await db
    .select()
    .from(trendClusters)
    .where(and(eq(trendClusters.id, clusterId), eq(trendClusters.creatorProfileId, profile.id), eq(trendClusters.dataMode, profile.dataMode)))
    .limit(1)
  if (!cluster) return null
  const [history, members, briefs] = await Promise.all([
    db
      .select()
      .from(trendScores)
      .where(and(eq(trendScores.clusterId, cluster.id), gte(trendScores.computedAt, new Date(Date.now() - 21 * DAY))))
      .orderBy(asc(trendScores.computedAt)),
    db
      .select({
        id: contentItems.id,
        platform: contentItems.platform,
        url: contentItems.url,
        title: contentItems.title,
        caption: contentItems.caption,
        hook: aiAnalysis.hook,
        format: aiAnalysis.format,
        hookType: aiAnalysis.hookType,
        creatorName: sql<string | null>`coalesce(${creators.displayName}, ${creators.handle})`,
        creatorHandle: creators.handle,
        creatorUrl: creators.profileUrl,
        followers: creators.followerCount,
        publishedAt: contentItems.publishedAt,
        views: contentItems.latestViewCount,
        likes: contentItems.latestLikeCount,
        comments: contentItems.latestCommentCount,
        shares: contentItems.latestShareCount,
        durationSeconds: contentItems.durationSeconds,
        audioName: contentItems.audioName,
        audioType: contentItems.audioType,
        dataOrigin: contentItems.dataOrigin,
        availability: contentItems.availability,
        similarity: trendClusterMembers.similarity,
        outperformance: trendClusterMembers.outperformance,
        outperformanceMethod: trendClusterMembers.outperformanceMethod,
        viewsPerHour: trendClusterMembers.viewsPerHour,
      })
      .from(trendClusterMembers)
      .innerJoin(contentItems, eq(contentItems.id, trendClusterMembers.contentItemId))
      .leftJoin(creators, eq(creators.id, contentItems.creatorId))
      .leftJoin(aiAnalysis, and(eq(aiAnalysis.contentItemId, contentItems.id), eq(aiAnalysis.status, 'succeeded')))
      .where(eq(trendClusterMembers.clusterId, cluster.id)),
    db
      .select()
      .from(recommendations)
      .where(and(eq(recommendations.clusterId, cluster.id), eq(recommendations.creatorProfileId, profile.id)))
      .orderBy(desc(recommendations.createdAt))
      .limit(1),
  ])
  const latest = history.at(-1) ?? null
  const b = briefs[0]
  return {
    id: cluster.id,
    label: cluster.label,
    summary: cluster.summary,
    explanationLines: (cluster.explanation ?? '').split('\n').map((l) => l.trim()).filter(Boolean),
    explanationBy: cluster.explanationBy,
    topicKey: cluster.topicKey,
    status: cluster.status,
    stage: cluster.stage,
    stageBasis: cluster.stageBasis,
    isBreakout: cluster.isBreakout,
    firstDetectedAt: cluster.firstDetectedAt,
    lastActivityAt: cluster.lastActivityAt,
    platforms: cluster.platforms,
    keywords: cluster.keywords,
    patterns: cluster.patterns,
    trendScore: cluster.latestTrendScore,
    fitScore: cluster.latestFitScore,
    opportunityScore: cluster.latestOpportunityScore,
    confidence: cluster.latestConfidence,
    components: latest?.components ?? null,
    fitComponents: cluster.latestFitComponents,
    metrics: latest?.metrics ?? null,
    weights: latest?.weights ?? null,
    history: history.map((h) => ({
      t: h.computedAt.getTime(),
      score: Math.round(h.trendScore * 10) / 10,
      confidence: Math.round(h.confidence),
      stage: h.stage,
      momentum: h.metrics.momentum ?? null,
      viewsPerHour: h.metrics.viewsPerHour ?? null,
      posts3d: h.metrics.postsLast72h ?? null,
    })),
    members: members
      .filter((m) => m.availability === 'available')
      .map((m) => ({
        id: m.id,
        platform: m.platform,
        url: m.url,
        title: m.title ?? m.caption?.split('\n')[0]?.slice(0, 160) ?? null,
        hook: m.hook,
        format: m.format,
        hookType: m.hookType,
        creatorName: m.creatorName,
        creatorHandle: m.creatorHandle,
        creatorUrl: m.creatorUrl,
        followers: m.followers,
        publishedAt: m.publishedAt,
        views: m.views,
        likes: m.likes,
        comments: m.comments,
        shares: m.shares,
        durationSeconds: m.durationSeconds,
        audioName: m.audioName,
        audioType: m.audioType,
        dataOrigin: m.dataOrigin,
        similarity: m.similarity,
        outperformance: m.outperformance,
        outperformanceMethod: m.outperformanceMethod,
        viewsPerHour: m.viewsPerHour,
      }))
      .sort((a, b) => (b.publishedAt?.getTime() ?? 0) - (a.publishedAt?.getTime() ?? 0)),
    brief: b
      ? {
          id: b.id,
          source: b.source,
          createdAt: b.createdAt,
          rank: b.rank,
          oneLiner: b.oneLiner,
          whyItMatters: b.whyItMatters,
          suggestedAngle: b.suggestedAngle,
          suggestedHook: b.suggestedHook,
          titleConcept: b.titleConcept,
          captionConcept: b.captionConcept,
          structure: b.structure,
          alternativeAngles: b.alternativeAngles,
          evidence: b.evidence,
          fitComponents: b.fitComponents,
          generatedBy: b.generatedBy,
          generationNote: b.generationNote,
          status: b.status,
        }
      : null,
  }
}
