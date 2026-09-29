/**
 * Personalisation stage: what works for this creator.
 *
 * Every own post is compared with the creator's own normal on the same
 * platform at the same age (robust baseline), and the lifts are grouped by
 * topic, format, hook, style, controversy, length, posting window, weekday
 * and platform (core/analytics/personalization.ts).
 */
import { and, eq, gte, inArray, sql } from 'drizzle-orm'
import { computeBaseline, expectedViewsAt, type BaselineSample } from '../analytics/baseline'
import { meanVector } from '../analytics/clustering'
import { buildInsights, computeLifts, lengthBucket, postingWindow, SHRINKAGE_K, weekday, type LiftRecord, type OwnPost } from '../analytics/personalization'
import type { CreatorModel, TopicCentroid } from '../analytics/relevance'
import { analyzablePlatforms } from '../compliance/policy'
import { aiAnalysis, contentEmbeddings, contentItems, creatorContentPerformance } from '../db/schema'
import type { Platform } from '../domain/types'
import type { RunContext } from './context'
import { clusteringEmbedder } from './providers'

const HOUR = 3_600_000

export interface PersonalizationResult {
  model: CreatorModel
  lifts: LiftRecord[]
  insights: string[]
  ownPosts: number
  /** Each judged own post's multiple of the creator's normal (views ÷ expected). */
  postLifts: Map<string, number>
}

export async function runPersonalizationStage(rc: RunContext): Promise<PersonalizationResult> {
  const platforms = [...analyzablePlatforms(rc.env, rc.dataMode).own] as Platform[]
  const { embedder } = await clusteringEmbedder(rc)
  const empty: PersonalizationResult = { model: { performanceCentroid: null, centroid: null, topics: [], lifts: [], ownPostCount: 0 }, lifts: [], insights: [], ownPosts: 0, postLifts: new Map() }
  if (platforms.length === 0) return empty
  const rows = await rc.db
    .select({
      id: contentItems.id,
      platform: contentItems.platform,
      publishedAt: contentItems.publishedAt,
      durationSeconds: contentItems.durationSeconds,
      views: contentItems.latestViewCount,
      likes: contentItems.latestLikeCount,
      comments: contentItems.latestCommentCount,
      shares: contentItems.latestShareCount,
      saves: contentItems.latestSaveCount,
      topic: aiAnalysis.topic,
      topicKey: aiAnalysis.topicKey,
      format: aiAnalysis.format,
      hookType: aiAnalysis.hookType,
      style: aiAnalysis.style,
      controversy: aiAnalysis.controversy,
      vector: contentEmbeddings.vector,
      embeddingModel: contentEmbeddings.model,
    })
    .from(contentItems)
    .leftJoin(aiAnalysis, and(eq(aiAnalysis.contentItemId, contentItems.id), eq(aiAnalysis.status, 'succeeded')))
    .leftJoin(contentEmbeddings, and(eq(contentEmbeddings.contentItemId, contentItems.id), eq(contentEmbeddings.model, embedder.model)))
    .where(
      and(
        inArray(contentItems.dataOrigin, rc.origins),
        eq(contentItems.isOwn, true),
        eq(contentItems.availability, 'available'),
        inArray(contentItems.platform, platforms),
        gte(contentItems.publishedAt, new Date(rc.now.getTime() - 400 * 86_400_000)),
      ),
    )
  if (rows.length === 0) return empty

  // The creator's own baseline, per platform (their normal differs by platform).
  const baselines = new Map<Platform, ReturnType<typeof computeBaseline>>()
  for (const platform of platforms) {
    const samples: BaselineSample[] = rows
      .filter((r) => r.platform === platform)
      .map((r) => ({
        views: r.views,
        engagements: [r.likes, r.comments, r.shares, r.saves].some((v) => v !== null) ? (r.likes ?? 0) + (r.comments ?? 0) + (r.shares ?? 0) + (r.saves ?? 0) : null,
        followers: null,
        publishedAt: r.publishedAt,
        durationSeconds: r.durationSeconds,
      }))
    baselines.set(platform, computeBaseline(samples, rc.now))
  }

  const tz = rc.profile.timezone
  const posts: OwnPost[] = []
  const vectors: number[][] = []
  const vectorLifts: number[] = []
  const byTopic = new Map<string, { vectors: number[][]; logLifts: number[] }>()
  for (const r of rows) {
    if (!r.views || !r.publishedAt) continue
    const ageHours = (rc.now.getTime() - r.publishedAt.getTime()) / HOUR
    if (ageHours < 36) continue // too young to judge
    const baseline = baselines.get(r.platform) ?? null
    const expected = expectedViewsAt(ageHours, (r.durationSeconds ?? 0) > 180, baseline, null, null, r.platform)
    if (!expected || expected.method !== 'creator_baseline') continue
    const engagement = [r.likes, r.comments, r.shares, r.saves].filter((v): v is number => v !== null)
    posts.push({
      contentItemId: r.id,
      platform: r.platform,
      views: r.views,
      expectedViews: expected.expected,
      engagementRate: engagement.length ? engagement.reduce((s, v) => s + v, 0) / r.views : null,
      features: {
        topic: r.topic,
        format: r.format,
        hook_type: r.hookType,
        style: r.style,
        controversy: r.controversy === null ? null : r.controversy >= 0.5 ? 'high' : 'low',
        length: lengthBucket(r.durationSeconds),
        posting_window: postingWindow(r.publishedAt, tz),
        weekday: weekday(r.publishedAt, tz),
        platform: r.platform,
      },
    })
    if (r.vector && r.embeddingModel === embedder.model) {
      const logLift = Math.max(-2, Math.min(2, Math.log(r.views / expected.expected)))
      vectors.push(r.vector)
      vectorLifts.push(Math.exp(logLift))
      // The catch-all bucket is not a subject the creator posts about; it would make a meaningless "closest topic".
      if (r.topic && r.topicKey !== 'general_training') {
        const group = byTopic.get(r.topic) ?? { vectors: [], logLifts: [] }
        group.vectors.push(r.vector)
        group.logLifts.push(logLift)
        byTopic.set(r.topic, group)
      }
    }
  }

  // Per-post lift, for the performance page.
  for (let i = 0; i < posts.length; i += 200) {
    const chunk = posts.slice(i, i + 200)
    await rc.db.execute(sql`
      UPDATE content_items AS c SET own_lift = v.lift
        FROM (VALUES ${sql.join(chunk.map((p) => sql`(${p.contentItemId}::uuid, ${p.views / p.expectedViews}::real)`), sql`, `)}) AS v(id, lift)
       WHERE c.id = v.id`)
  }

  const lifts = computeLifts(posts)
  await rc.db.delete(creatorContentPerformance).where(and(eq(creatorContentPerformance.creatorProfileId, rc.profile.id), eq(creatorContentPerformance.dataMode, rc.dataMode)))
  if (lifts.length) {
    await rc.db.insert(creatorContentPerformance).values(
      lifts.map((l) => ({
        creatorProfileId: rc.profile.id,
        dataMode: rc.dataMode,
        computedAt: rc.now,
        dimension: l.dimension,
        value: l.value,
        postCount: l.postCount,
        meanLogLift: l.meanLogLift,
        lift: l.lift,
        medianViews: l.medianViews,
        avgEngagementRate: l.avgEngagementRate,
        confidence: l.confidence,
      })),
    )
  }
  const topics: TopicCentroid[] = []
  for (const [topic, group] of byTopic) {
    const centroid = meanVector(group.vectors)
    if (!centroid) continue
    const total = group.logLifts.reduce((s, v) => s + v, 0)
    topics.push({ topic, centroid, postCount: group.vectors.length, shrunkLogLift: total / (group.logLifts.length + SHRINKAGE_K) })
  }
  return {
    model: {
      performanceCentroid: meanVector(vectors, vectorLifts),
      centroid: meanVector(vectors),
      topics,
      lifts,
      ownPostCount: posts.length,
    },
    lifts,
    insights: buildInsights(lifts),
    ownPosts: posts.length,
    postLifts: new Map(posts.map((p) => [p.contentItemId, p.views / p.expectedViews])),
  }
}
