/**
 * Recommendation stage: today's opportunities.
 *
 * For every scored trend: Creator Fit → gate and rank (configurable) → for
 * the top N, an original angle, hook, title and beat sheet from the AI
 * provider, grounded in the trend's evidence and the creator's own measured
 * strengths. The provider is told never to reuse another creator's script;
 * the local provider only has original templates to begin with.
 */
import { randomUUID } from 'node:crypto'
import { and, desc, eq, gte, inArray } from 'drizzle-orm'
import { LocalAIProvider } from '../ai/local/provider'
import { PROMPT_VERSION, type TrendBrief } from '../ai/types'
import { cosine } from '../analytics/clustering'
import { STAGE_LABEL } from '../analytics/lifecycle'
import { lengthBucket } from '../analytics/personalization'
import { rankOpportunities, type RankCandidate } from '../analytics/ranking'
import { creatorFit, opportunityScore } from '../analytics/relevance'
import { contentEmbeddings, contentItems, recommendations, trendClusters } from '../db/schema'
import { PLATFORM_LABEL, type EvidenceExample, type RecommendationEvidence } from '../domain/types'
import { creatorStrengths, draftWithFallback, fitReasons } from './briefs'
import type { RunContext } from './context'
import { clusteringEmbedder, runProviders } from './providers'
import type { PersonalizationResult } from './personalize'
import { recordEvent } from './store/events'
import type { ScoredCluster } from './trends'

const DAY = 86_400_000

/** Whether this run should produce a new batch, given the configured frequency. */
export async function recommendationsDue(rc: RunContext): Promise<boolean> {
  if (rc.trigger === 'manual' || rc.trigger === 'setup' || rc.trigger === 'cli') return true
  const frequency = rc.settings.recommendations.frequency
  if (frequency === 'every_run') return true
  const [latest] = await rc.db
    .select({ createdAt: recommendations.createdAt })
    .from(recommendations)
    .where(and(eq(recommendations.creatorProfileId, rc.profile.id), eq(recommendations.dataMode, rc.dataMode)))
    .orderBy(desc(recommendations.createdAt))
    .limit(1)
  if (!latest) return true
  if (frequency === 'weekly') return rc.now.getTime() - latest.createdAt.getTime() >= 7 * DAY - 3_600_000
  const day = (d: Date) => new Intl.DateTimeFormat('en-CA', { timeZone: rc.profile.timezone }).format(d)
  return day(latest.createdAt) !== day(rc.now)
}

async function ownPriorPost(
  rc: RunContext,
  centroid: number[],
  embedding: { model: string; threshold: number },
  postLifts: Map<string, number>,
): Promise<RecommendationEvidence['ownPriorPost']> {
  const threshold = embedding.threshold
  const rows = await rc.db
    .select({ id: contentItems.id, title: contentItems.title, caption: contentItems.caption, publishedAt: contentItems.publishedAt, vector: contentEmbeddings.vector })
    .from(contentItems)
    .innerJoin(contentEmbeddings, and(eq(contentEmbeddings.contentItemId, contentItems.id), eq(contentEmbeddings.model, embedding.model)))
    .where(and(inArray(contentItems.dataOrigin, rc.origins), eq(contentItems.isOwn, true), gte(contentItems.publishedAt, new Date(rc.now.getTime() - 180 * DAY))))
  let best: { row: (typeof rows)[number]; sim: number } | null = null
  for (const row of rows) {
    const sim = cosine(row.vector, centroid)
    if (sim >= threshold && (!best || sim > best.sim)) best = { row, sim }
  }
  if (!best) return null
  return {
    contentItemId: best.row.id,
    title: best.row.title ?? best.row.caption?.split('\n')[0]?.slice(0, 120) ?? null,
    lift: postLifts.get(best.row.id) ?? null,
    publishedAt: best.row.publishedAt?.toISOString() ?? null,
  }
}

export async function runRecommendationStage(
  rc: RunContext,
  scored: ScoredCluster[],
  personal: PersonalizationResult,
): Promise<{ batchId: string | null; count: number; excluded: number }> {
  const { ai } = runProviders(rc)
  const { embedder } = await clusteringEmbedder(rc)
  const fallback = new LocalAIProvider(rc.settings.niche.excludeKeywords)
  const fitContext = {
    weights: rc.settings.fit.weights,
    platformWeights: rc.settings.platformWeights,
    nicheKeywords: rc.settings.niche.keywords,
    subtopics: rc.settings.niche.subtopics,
    excludeKeywords: rc.settings.niche.excludeKeywords,
    similarityRange: { low: embedder.thresholds.fitLow, high: embedder.thresholds.fitHigh },
  }

  const fits = new Map<string, ReturnType<typeof creatorFit>>()
  const candidates: RankCandidate[] = []
  for (const s of scored) {
    const fit = creatorFit(s.profile, personal.model, fitContext)
    fits.set(s.clusterId, fit)
    const opportunity = opportunityScore(s.result.trendScore, fit.score, rc.settings.fit.trendWeight)
    await rc.db
      .update(trendClusters)
      .set({ latestFitScore: fit.score, latestFitComponents: fit.components, latestOpportunityScore: opportunity })
      .where(eq(trendClusters.id, s.clusterId))
    candidates.push({
      clusterId: s.clusterId,
      trendScore: s.result.trendScore,
      fitScore: fit.score,
      confidence: s.result.confidence,
      itemCount: s.result.metrics.itemCount,
      creatorCount: s.result.metrics.creatorCount,
      isBreakout: s.isBreakout,
      topicKey: s.topicKey,
      centroid: s.centroid,
    })
  }
  if (!(await recommendationsDue(rc))) return { batchId: null, count: 0, excluded: 0 }

  const { ranked, excluded } = rankOpportunities(candidates, rc.settings)
  if (ranked.length === 0) {
    await recordEvent(rc.db, {
      profileId: rc.profile.id,
      level: 'info',
      category: 'analysis',
      message: `No trend passed the recommendation gates this run (${excluded.length} considered).`,
      context: { excluded: excluded.slice(0, 10) },
      at: rc.now,
    })
    return { batchId: null, count: 0, excluded: excluded.length }
  }

  const strengths = creatorStrengths(personal.lifts)

  const batchId = randomUUID()
  let count = 0
  for (const r of ranked) {
    const s = scored.find((x) => x.clusterId === r.clusterId)!
    const fit = fits.get(r.clusterId)!
    const prior = await ownPriorPost(rc, s.centroid, { model: embedder.model, threshold: embedder.thresholds.join }, personal.postLifts)
    const examples: EvidenceExample[] = s.members.slice(0, 5).map((m) => ({
      contentItemId: m.contentItemId,
      platform: m.platform,
      url: m.url,
      title: m.title ?? m.caption?.split('\n')[0]?.slice(0, 140) ?? null,
      creatorName: m.creatorName,
      creatorFollowerCount: m.creatorFollowerCount,
      views: m.views,
      viewsPerHour: m.viewsPerHour,
      outperformance: m.outperformance,
      publishedAt: m.publishedAt?.toISOString() ?? null,
      dataOrigin: m.dataOrigin,
    }))
    const brief: TrendBrief = {
      trendLabel: s.label,
      topicKey: s.topicKey,
      trendSummary: s.summary,
      stage: STAGE_LABEL[s.stage.stage],
      trendScore: s.result.trendScore,
      fitScore: fit.score,
      evidenceLines: s.evidenceLines,
      facts: {
        posts: s.result.metrics.itemCount,
        creators: s.result.metrics.creatorCount,
        platforms: s.profile.platforms.map((p) => PLATFORM_LABEL[p]),
        postsLast3Days: s.result.metrics.postsLast72h,
        postsPrevious3Days: s.result.metrics.postsPrev72h,
        momentumPerDay: s.result.metrics.accelerationRatio,
        medianOutperformance: s.result.metrics.medianOutperformance,
        bestOutperformance: s.result.metrics.maxOutperformance,
        viewsPerHour: s.result.metrics.viewsPerHour,
      },
      formats: s.patterns.formats.map((f) => f.value),
      hookTypes: s.patterns.hookTypes.map((h) => h.value),
      styles: s.patterns.styles.map((st) => st.value),
      exampleTitles: examples.map((e) => e.title).filter((t): t is string => !!t),
      niche: rc.settings.niche.label,
      creatorInsights: personal.insights,
      fitReasons: fitReasons(fit.components),
      variant: r.rank - 1,
      creatorBestFormats: strengths.bestFormats,
      creatorBestHookTypes: strengths.bestHookTypes,
      targetLength: strengths.bestLength ?? lengthBucket(s.profile.medianDurationSeconds),
      audience: s.patterns.audiences[0]?.value ?? null,
      ownPriorPost: prior?.title ? `${prior.title}${prior.lift ? ` (${prior.lift.toFixed(1)}× your normal)` : ''}` : null,
    }
    const { draft, generatedBy, note, failed } = await draftWithFallback(ai, fallback, brief)
    if (failed) await recordEvent(rc.db, { profileId: rc.profile.id, level: 'warn', category: 'ai', message: `Recommendation drafting failed with ${ai.name}; used templates.`, at: rc.now })
    const evidence: RecommendationEvidence = {
      itemCount: s.result.metrics.itemCount,
      creatorCount: s.result.metrics.creatorCount,
      platforms: s.profile.platforms,
      outperformingCreators: s.result.metrics.outperformingCreators,
      summaryLines: s.evidenceLines,
      examples,
      ownPriorPost: prior,
    }
    await rc.db.insert(recommendations).values({
      creatorProfileId: rc.profile.id,
      dataMode: rc.dataMode,
      batchId,
      clusterId: r.clusterId,
      rank: r.rank,
      opportunityScore: r.opportunityScore,
      trendScore: s.result.trendScore,
      creatorFitScore: fit.score,
      confidence: s.result.confidence,
      stage: s.stage.stage,
      trendLabel: s.label,
      oneLiner: draft.oneLiner,
      whyItMatters: draft.whyItMatters,
      suggestedAngle: draft.suggestedAngle,
      suggestedHook: draft.suggestedHook,
      titleConcept: draft.titleConcept,
      captionConcept: draft.captionConcept,
      structure: draft.structure,
      alternativeAngles: draft.alternativeAngles,
      evidence,
      fitComponents: fit.components,
      generatedBy,
      promptVersion: PROMPT_VERSION,
      generationNote: note,
      createdAt: rc.now,
    })
    count++
  }
  return { batchId, count, excluded: excluded.length }
}
