/**
 * On-demand video briefs: the creator opens any trend and asks for an angle,
 * hook and outline, even if the trend was not in today's batch. Built from
 * stored, measured data only — the same evidence rules as the daily batch.
 */
import { randomUUID } from 'node:crypto'
import { and, desc, eq, isNotNull, sql } from 'drizzle-orm'
import { LocalAIProvider } from '../ai/local/provider'
import { selectProviders } from '../ai/registry'
import { PROMPT_VERSION, type TrendBrief } from '../ai/types'
import { STAGE_LABEL } from '../analytics/lifecycle'
import { buildInsights, lengthBucket, type LiftRecord } from '../analytics/personalization'
import type { Env } from '../config/env'
import { parseSettings } from '../config/settings'
import type { Database } from '../db/client'
import { contentItems, creatorContentPerformance, creators, recommendations, trendClusterMembers, trendClusters, trendScores } from '../db/schema'
import { PLATFORM_LABEL, type EvidenceExample, type FitComponents, type RecommendationEvidence } from '../domain/types'
import type { Logger } from '../observability/logger'
import type { CreatorProfileRow } from '../pipeline/context'
import { creatorStrengths, draftWithFallback, fitReasons } from '../pipeline/briefs'
import { recordEvent } from '../pipeline/store/events'

export class BriefUnavailableError extends Error {}

export async function draftOnDemandBrief(db: Database, env: Env, profile: CreatorProfileRow, clusterId: string, logger: Logger): Promise<string> {
  const [cluster] = await db
    .select()
    .from(trendClusters)
    .where(and(eq(trendClusters.id, clusterId), eq(trendClusters.creatorProfileId, profile.id), eq(trendClusters.dataMode, profile.dataMode)))
    .limit(1)
  if (!cluster) throw new BriefUnavailableError('Trend not found.')
  if (cluster.latestTrendScore === null || !cluster.stage) throw new BriefUnavailableError('This trend has not been scored yet. Try again after the next collection run.')
  const [latest] = await db.select().from(trendScores).where(eq(trendScores.clusterId, cluster.id)).orderBy(desc(trendScores.computedAt)).limit(1)
  if (!latest) throw new BriefUnavailableError('This trend has no score history yet.')

  const settings = parseSettings(profile.settings)
  const { ai } = selectProviders(settings, env)
  const fallback = new LocalAIProvider(settings.niche.excludeKeywords)

  const members = await db
    .select({
      id: contentItems.id,
      platform: contentItems.platform,
      url: contentItems.url,
      title: contentItems.title,
      caption: contentItems.caption,
      creatorName: sql<string | null>`coalesce(${creators.displayName}, ${creators.handle})`,
      followers: creators.followerCount,
      views: contentItems.latestViewCount,
      publishedAt: contentItems.publishedAt,
      dataOrigin: contentItems.dataOrigin,
      durationSeconds: contentItems.durationSeconds,
      outperformance: trendClusterMembers.outperformance,
      viewsPerHour: trendClusterMembers.viewsPerHour,
    })
    .from(trendClusterMembers)
    .innerJoin(contentItems, eq(contentItems.id, trendClusterMembers.contentItemId))
    .leftJoin(creators, eq(creators.id, contentItems.creatorId))
    .where(and(eq(trendClusterMembers.clusterId, cluster.id), eq(contentItems.availability, 'available')))
    .orderBy(sql`${trendClusterMembers.outperformance} desc nulls last`)
    .limit(40)
  const examples: EvidenceExample[] = members.slice(0, 5).map((m) => ({
    contentItemId: m.id,
    platform: m.platform,
    url: m.url,
    title: m.title ?? m.caption?.split('\n')[0]?.slice(0, 140) ?? null,
    creatorName: m.creatorName,
    creatorFollowerCount: m.followers,
    views: m.views,
    viewsPerHour: m.viewsPerHour,
    outperformance: m.outperformance,
    publishedAt: m.publishedAt?.toISOString() ?? null,
    dataOrigin: m.dataOrigin,
  }))

  const liftRows = await db
    .select()
    .from(creatorContentPerformance)
    .where(and(eq(creatorContentPerformance.creatorProfileId, profile.id), eq(creatorContentPerformance.dataMode, profile.dataMode), isNotNull(creatorContentPerformance.lift)))
  const lifts: LiftRecord[] = liftRows.map((l) => ({
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
  const strengths = creatorStrengths(lifts)
  const fit = cluster.latestFitComponents as FitComponents | null
  const m = latest.metrics
  const patterns = cluster.patterns
  const durations = members.map((x) => x.durationSeconds).filter((d): d is number => d !== null).sort((a, b) => a - b)
  const evidenceLines = (cluster.explanation ?? '').split('\n').filter(Boolean)
  const brief: TrendBrief = {
    trendLabel: cluster.label,
    topicKey: cluster.topicKey,
    trendSummary: cluster.summary,
    stage: STAGE_LABEL[cluster.stage],
    trendScore: cluster.latestTrendScore,
    fitScore: cluster.latestFitScore ?? 0,
    evidenceLines,
    facts: {
      posts: m.itemCount,
      creators: m.creatorCount,
      platforms: cluster.platforms.map((p) => PLATFORM_LABEL[p]),
      postsLast3Days: m.postsLast72h ?? 0,
      postsPrevious3Days: m.postsPrev72h ?? 0,
      momentumPerDay: m.accelerationRatio,
      medianOutperformance: m.medianOutperformance,
      bestOutperformance: m.maxOutperformance,
      viewsPerHour: m.viewsPerHour,
    },
    formats: patterns?.formats.map((f) => f.value) ?? [],
    hookTypes: patterns?.hookTypes.map((h) => h.value) ?? [],
    styles: patterns?.styles.map((s) => s.value) ?? [],
    exampleTitles: examples.map((e) => e.title).filter((t): t is string => !!t),
    niche: settings.niche.label,
    creatorInsights: buildInsights(lifts),
    fitReasons: fit ? fitReasons(fit) : [],
    variant: 0,
    creatorBestFormats: strengths.bestFormats,
    creatorBestHookTypes: strengths.bestHookTypes,
    targetLength: strengths.bestLength ?? lengthBucket(durations.length ? durations[Math.floor(durations.length / 2)]! : null),
    audience: patterns?.audiences[0]?.value ?? null,
    ownPriorPost: null,
  }
  const { draft, generatedBy, note, failed } = await draftWithFallback(ai, fallback, brief)
  if (failed) {
    logger.warn('On-demand brief fell back to templates', { provider: ai.name })
    await recordEvent(db, { profileId: profile.id, level: 'warn', category: 'ai', message: `Brief drafting failed with ${ai.name}; used templates.`, at: new Date() })
  }
  const evidence: RecommendationEvidence = {
    itemCount: m.itemCount,
    creatorCount: m.creatorCount,
    platforms: cluster.platforms,
    outperformingCreators: m.outperformingCreators,
    summaryLines: evidenceLines,
    examples,
    ownPriorPost: null,
  }
  const [row] = await db
    .insert(recommendations)
    .values({
      creatorProfileId: profile.id,
      dataMode: profile.dataMode,
      batchId: randomUUID(),
      source: 'on_demand',
      clusterId: cluster.id,
      rank: 0,
      opportunityScore: cluster.latestOpportunityScore ?? cluster.latestTrendScore,
      trendScore: cluster.latestTrendScore,
      creatorFitScore: cluster.latestFitScore ?? 0,
      confidence: cluster.latestConfidence ?? latest.confidence,
      stage: cluster.stage,
      trendLabel: cluster.label,
      oneLiner: draft.oneLiner,
      whyItMatters: draft.whyItMatters,
      suggestedAngle: draft.suggestedAngle,
      suggestedHook: draft.suggestedHook,
      titleConcept: draft.titleConcept,
      captionConcept: draft.captionConcept,
      structure: draft.structure,
      alternativeAngles: draft.alternativeAngles,
      evidence,
      fitComponents: fit ?? ({} as FitComponents),
      generatedBy,
      promptVersion: PROMPT_VERSION,
      generationNote: note,
    })
    .returning({ id: recommendations.id })
  return row!.id
}
