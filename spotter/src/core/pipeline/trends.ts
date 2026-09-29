/**
 * Trend stage: baselines → clustering → scoring → stage → history.
 */
import { and, eq, gte, inArray, sql } from 'drizzle-orm'
import { selectProviders } from '../ai/registry'
import { LocalAIProvider } from '../ai/local/provider'
import { computeBaseline, expectedViewsAt, outperformanceRatio, type Baseline, type BaselineSample, type NicheNorms } from '../analytics/baseline'
import { assignToExisting, cosine, findMerges, formNewClusters, meanVector, type Candidate } from '../analytics/clustering'
import { classifyStage, type StageResult } from '../analytics/lifecycle'
import { itemVelocity, weightedEngagementRate, type ItemSeries, type SnapshotPoint } from '../analytics/metrics'
import { PACE_AGE_BUCKETS, scoreTrend, type NichePace, type ScoringItem, type ScoringResult } from '../analytics/scoring'
import { median, round, topCounts } from '../analytics/stats'
import type { ClusterProfile } from '../analytics/relevance'
import { analyzablePlatforms } from '../compliance/policy'
import { normaliseWeights, platformWeight } from '../config/settings'
import {
  aiAnalysis,
  contentEmbeddings,
  contentItems,
  contentMetricSnapshots,
  creatorBaselines,
  creators,
  trendClusterMembers,
  trendClusters,
  trendScores,
} from '../db/schema'
import { PLATFORM_LABEL, type ClusterPattern, type DataOrigin, type Platform, type PatternCount } from '../domain/types'
import type { RunContext } from './context'
import { recordEvent } from './store/events'

const HOUR = 3_600_000
const DAY = 24 * HOUR

export interface MemberView {
  contentItemId: string
  platform: Platform
  externalId: string
  url: string | null
  title: string | null
  caption: string | null
  hook: string | null
  creatorName: string | null
  creatorFollowerCount: number | null
  publishedAt: Date | null
  views: number | null
  viewsPerHour: number | null
  outperformance: number | null
  dataOrigin: DataOrigin
  similarity: number
}

export interface ScoredCluster {
  clusterId: string
  label: string
  summary: string | null
  topicKey: string | null
  centroid: number[]
  isBreakout: boolean
  firstDetectedAt: Date
  result: ScoringResult
  stage: StageResult
  patterns: ClusterPattern
  profile: ClusterProfile
  members: MemberView[]
  evidenceLines: string[]
}

interface CandidateRow {
  id: string
  platform: Platform
  externalId: string
  dataOrigin: DataOrigin
  creatorId: string | null
  creatorName: string | null
  followers: number | null
  publishedAt: Date | null
  url: string | null
  title: string | null
  caption: string | null
  hashtags: string[] | null
  durationSeconds: number | null
  audioType: string | null
  audioName: string | null
  topic: string | null
  topicKey: string | null
  format: string | null
  hook: string | null
  hookType: string | null
  style: string | null
  audience: string | null
  exercises: string[] | null
  keywords: string[] | null
  nicheRelevance: number | null
  vector: number[]
}

interface Enriched extends CandidateRow {
  series: ItemSeries
  scoring: Omit<ScoringItem, 'similarity'>
}

// ---------------------------------------------------------------------------
// Loading
// ---------------------------------------------------------------------------

async function loadCandidates(rc: RunContext, embeddingModel: string, since: Date): Promise<CandidateRow[]> {
  const platforms = [...analyzablePlatforms(rc.env, rc.dataMode).public] as Platform[]
  if (platforms.length === 0) return []
  const rows = await rc.db
    .select({
      id: contentItems.id,
      platform: contentItems.platform,
      externalId: contentItems.externalId,
      dataOrigin: contentItems.dataOrigin,
      creatorId: contentItems.creatorId,
      creatorName: sql<string | null>`coalesce(${creators.displayName}, ${creators.handle})`,
      followers: creators.followerCount,
      publishedAt: contentItems.publishedAt,
      url: contentItems.url,
      title: contentItems.title,
      caption: contentItems.caption,
      hashtags: contentItems.hashtags,
      durationSeconds: contentItems.durationSeconds,
      audioType: contentItems.audioType,
      audioName: contentItems.audioName,
      topic: aiAnalysis.topic,
      topicKey: aiAnalysis.topicKey,
      format: aiAnalysis.format,
      hook: aiAnalysis.hook,
      hookType: aiAnalysis.hookType,
      style: aiAnalysis.style,
      audience: aiAnalysis.targetAudience,
      exercises: aiAnalysis.exercises,
      keywords: aiAnalysis.keywords,
      nicheRelevance: aiAnalysis.nicheRelevance,
      vector: contentEmbeddings.vector,
    })
    .from(contentItems)
    .innerJoin(aiAnalysis, and(eq(aiAnalysis.contentItemId, contentItems.id), eq(aiAnalysis.status, 'succeeded')))
    .innerJoin(contentEmbeddings, and(eq(contentEmbeddings.contentItemId, contentItems.id), eq(contentEmbeddings.model, embeddingModel)))
    .leftJoin(creators, eq(creators.id, contentItems.creatorId))
    .where(
      and(
        inArray(contentItems.dataOrigin, rc.origins),
        eq(contentItems.isOwn, false),
        eq(contentItems.availability, 'available'),
        inArray(contentItems.platform, platforms),
        gte(contentItems.publishedAt, since),
      ),
    )
  // Generic training content and off-niche posts are not trend candidates.
  return rows.filter((r) => r.topicKey !== 'general_training' && (r.nicheRelevance ?? 1) >= 0.1) as CandidateRow[]
}

async function loadSeries(rc: RunContext, rows: CandidateRow[], since: Date): Promise<Map<string, SnapshotPoint[]>> {
  const out = new Map<string, SnapshotPoint[]>()
  const ids = rows.map((r) => r.id)
  for (let i = 0; i < ids.length; i += 500) {
    const snaps = await rc.db
      .select({
        id: contentMetricSnapshots.contentItemId,
        t: contentMetricSnapshots.collectedAt,
        views: contentMetricSnapshots.viewCount,
        likes: contentMetricSnapshots.likeCount,
        comments: contentMetricSnapshots.commentCount,
        shares: contentMetricSnapshots.shareCount,
        saves: contentMetricSnapshots.saveCount,
      })
      .from(contentMetricSnapshots)
      .where(and(inArray(contentMetricSnapshots.contentItemId, ids.slice(i, i + 500)), gte(contentMetricSnapshots.collectedAt, since), sql`${contentMetricSnapshots.collectedAt} <= ${rc.now}`))
    for (const s of snaps) {
      const list = out.get(s.id) ?? []
      list.push({ t: s.t.getTime(), views: s.views, likes: s.likes, comments: s.comments, shares: s.shares, saves: s.saves })
      out.set(s.id, list)
    }
  }
  return out
}

async function computeBaselinesAndNorms(rc: RunContext, rows: CandidateRow[]): Promise<{ baselines: Map<string, Baseline>; norms: NicheNorms }> {
  const creatorIds = [...new Set(rows.map((r) => r.creatorId).filter((id): id is string => !!id))]
  const samples = new Map<string, BaselineSample[]>()
  const platformSamples = new Map<Platform, BaselineSample[]>()
  const since = new Date(rc.now.getTime() - 120 * DAY)
  for (let i = 0; i < creatorIds.length; i += 500) {
    const items = await rc.db
      .select({
        creatorId: contentItems.creatorId,
        platform: contentItems.platform,
        views: contentItems.latestViewCount,
        likes: contentItems.latestLikeCount,
        comments: contentItems.latestCommentCount,
        shares: contentItems.latestShareCount,
        saves: contentItems.latestSaveCount,
        publishedAt: contentItems.publishedAt,
        durationSeconds: contentItems.durationSeconds,
        followers: creators.followerCount,
      })
      .from(contentItems)
      .leftJoin(creators, eq(creators.id, contentItems.creatorId))
      .where(and(inArray(contentItems.creatorId, creatorIds.slice(i, i + 500)), inArray(contentItems.dataOrigin, rc.origins), gte(contentItems.publishedAt, since)))
    for (const it of items) {
      const engagementParts = [it.likes, it.comments, it.shares, it.saves].filter((v): v is number => v !== null)
      const sample: BaselineSample = {
        views: it.views,
        engagements: engagementParts.length ? engagementParts.reduce((s, v) => s + v, 0) : null,
        followers: it.followers,
        publishedAt: it.publishedAt,
        durationSeconds: it.durationSeconds,
      }
      const list = samples.get(it.creatorId!) ?? []
      list.push(sample)
      samples.set(it.creatorId!, list)
      const plist = platformSamples.get(it.platform) ?? []
      plist.push({ ...sample, likes: it.likes } as BaselineSample & { likes: number | null })
      platformSamples.set(it.platform, plist)
    }
  }
  const baselines = new Map<string, Baseline>()
  for (const [creatorId, list] of samples) {
    const b = computeBaseline(list, rc.now)
    baselines.set(creatorId, b)
    const values = {
      computedAt: rc.now,
      method: b.method,
      sampleSize: b.sampleSize,
      windowDays: 120,
      sufficient: b.sufficient,
      medianViews: b.medianViews,
      madLogViews: b.madLogViews,
      p25Views: b.p25Views,
      p75Views: b.p75Views,
      medianEngagementRate: b.medianEngagementRate,
      medianViewsPerFollower: b.medianViewsPerFollower,
    }
    await rc.db.insert(creatorBaselines).values({ creatorId, ...values }).onConflictDoUpdate({ target: creatorBaselines.creatorId, set: values })
  }

  const norms: NicheNorms = {}
  for (const [platform, list] of platformSamples) {
    const settled = list.filter((s) => s.publishedAt && rc.now.getTime() - s.publishedAt.getTime() > 36 * HOUR)
    const withLikes = settled as Array<BaselineSample & { likes: number | null }>
    const b = computeBaseline(settled, rc.now)
    norms[platform] = {
      medianViewsPerFollower: b.medianViewsPerFollower,
      medianSettledViews: b.medianViews,
      medianLikesPerFollower: median(withLikes.filter((s) => s.likes !== null && s.followers).map((s) => s.likes! / s.followers!)),
      medianEngagementRate: b.medianEngagementRate,
      medianWeightedEngagementRate: null,
      sampleSize: settled.length,
    }
  }
  return { baselines, norms }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function patternsOf(members: Enriched[]): ClusterPattern {
  const count = (values: Array<string | null | undefined>) => topCounts(values.filter((v): v is string => !!v), 6) as PatternCount[]
  const hookLines = [...members]
    .filter((m) => m.hook)
    .sort((a, b) => (b.scoring.outperformance ?? 0) - (a.scoring.outperformance ?? 0))
    .slice(0, 5)
    .map((m) => ({ value: m.hook!, count: 1, example: m.creatorName }))
  const audioValues = members.flatMap((m) => [m.audioName, m.audioType === 'music' ? 'Licensed music' : m.audioType === 'original_sound' ? 'Original sound' : null])
  const audio = audioValues.some(Boolean) ? count(audioValues) : null
  return {
    formats: count(members.map((m) => m.format)),
    hookTypes: count(members.map((m) => m.hookType)),
    hooks: hookLines,
    styles: count(members.map((m) => m.style)),
    audiences: count(members.map((m) => m.audience)),
    hashtags: count(members.flatMap((m) => m.hashtags ?? [])),
    exercises: count(members.flatMap((m) => m.exercises ?? [])),
    audio,
  }
}

function evidenceFor(result: ScoringResult, lookbackDays: number): string[] {
  const m = result.metrics
  const platforms = (Object.keys(m.platformCounts) as Platform[]).map((p) => PLATFORM_LABEL[p]).join(' + ')
  const lines = [`${m.itemCount} related post${m.itemCount === 1 ? '' : 's'} from ${m.creatorCount || 'unidentified'} creator${m.creatorCount === 1 ? '' : 's'} in the last ${lookbackDays} days (${platforms})`]
  if (m.accelerationRatio !== null) {
    const g = m.accelerationRatio
    lines.push(
      `Momentum ${g >= 1.03 ? 'growing' : g <= 0.97 ? 'shrinking' : 'steady'} at ${round(g, 2)}× per day — ${m.postsLast72h} posts in the last 3 days vs ${m.postsPrev72h} in the 3 before, each weighted by how well it performed`,
    )
  }
  if (m.viewsPerHourChange !== null) {
    lines.push(`Views gained in the last 12h: ${round(m.viewsPerHourChange, 2)}× the same hours yesterday, on the same posts`)
  }
  if (m.outperformingCreators > 0) {
    lines.push(`${m.outperformingCreators} creator${m.outperformingCreators === 1 ? '' : 's'} at 3× or more their usual views (best ${round(m.maxOutperformance ?? 0, 1)}×)`)
  }
  const eng = result.components.engagement.inputs.vsNicheNorm
  if (typeof eng === 'number' && eng >= 1.2) lines.push(`Engagement ${round(eng, 1)}× the niche norm`)
  if (m.viewsPerHour) lines.push(`Gaining about ${Math.round(m.viewsPerHour).toLocaleString('en-US')} views/hour across tracked posts`)
  return lines
}

/**
 * The niche's typical pace per platform: median views/hour (and engagements
 * per hour) of the fresh posts being tracked. Velocity is judged against it,
 * so a platform or a week where everything is slower does not read as a lull.
 */
function nichePace(items: Enriched[], now: Date): Partial<Record<Platform, NichePace>> {
  const out: Partial<Record<Platform, NichePace>> = {}
  const ageOf = (e: Enriched) => (e.publishedAt ? (now.getTime() - e.publishedAt.getTime()) / HOUR : null)
  const medians = (pool: Enriched[]) => ({
    medianViewsPerHour: median(pool.map((e) => e.scoring.viewsPerHour).filter((v): v is number => v !== null && v > 0)),
    medianEngagementsPerHour: median(pool.map((e) => e.scoring.engagementsPerHour).filter((v): v is number => v !== null && v > 0)),
  })
  for (const platform of new Set(items.map((e) => e.platform))) {
    const all = items.filter((e) => e.platform === platform)
    const fresh = all.filter((e) => (ageOf(e) ?? Infinity) <= 96)
    let lower = 0
    const byAge = PACE_AGE_BUCKETS.map((maxAgeHours) => {
      const pool = all.filter((e) => {
        const age = ageOf(e)
        return age !== null && age >= lower && age < maxAgeHours
      })
      lower = maxAgeHours
      // Too few posts of that age to say what is typical: fall back to the fresh-post median.
      return { maxAgeHours, ...(pool.length >= 8 ? medians(pool) : { medianViewsPerHour: null, medianEngagementsPerHour: null }) }
    })
    out[platform] = { ...medians(fresh.length >= 10 ? fresh : all), byAge }
  }
  return out
}

// ---------------------------------------------------------------------------
// Stage
// ---------------------------------------------------------------------------

export async function runTrendStage(rc: RunContext): Promise<{ scored: ScoredCluster[]; created: number; merged: number; dormant: number }> {
  const { ai, embedder } = selectProviders(rc.settings, rc.env)
  const fallbackAi = new LocalAIProvider(rc.settings.niche.excludeKeywords)
  const thresholds = embedder.thresholds
  const lookback = rc.settings.trend.lookbackDays
  const since = new Date(rc.now.getTime() - lookback * DAY)
  const rows = await loadCandidates(rc, embedder.model, since)
  const seriesById = await loadSeries(rc, rows, new Date(since.getTime() - DAY))
  const { baselines, norms } = await computeBaselinesAndNorms(rc, rows)

  // Per-item metrics.
  const enriched: Enriched[] = rows.map((row) => {
    const snaps = seriesById.get(row.id) ?? []
    const series: ItemSeries = { contentItemId: row.id, platform: row.platform, creatorId: row.creatorId, publishedAt: row.publishedAt, snapshots: snaps }
    const v = itemVelocity(series, rc.now)
    const latest = v.latest
    const views = latest?.views ?? null
    const ageHours = v.ageHours ?? 0
    const baseline = row.creatorId ? (baselines.get(row.creatorId) ?? null) : null
    const expected = views !== null ? expectedViewsAt(ageHours, (row.durationSeconds ?? 0) > 180, baseline, row.followers, norms, row.platform) : null
    return {
      ...row,
      series,
      scoring: {
        contentItemId: row.id,
        platform: row.platform,
        creatorKey: row.creatorId,
        publishedAt: row.publishedAt,
        views,
        likes: latest?.likes ?? null,
        comments: latest?.comments ?? null,
        shares: latest?.shares ?? null,
        saves: latest?.saves ?? null,
        followers: row.followers,
        viewsPerHour: v.viewsPerHour,
        velocityMeasured: v.velocityMeasured,
        engagementsPerHour: v.engagementsPerHour,
        weightedEngagementRate: weightedEngagementRate(latest),
        outperformance: views !== null ? outperformanceRatio(views, expected) : null,
        outperformanceMethod: expected?.method ?? null,
        snapshotCount: v.snapshotCount,
        platformWeight: platformWeight(rc.settings, row.platform),
        series,
      },
    }
  })
  // Niche norm for weighted engagement, per platform.
  for (const platform of Object.keys(norms) as Platform[]) {
    const rates = enriched.filter((e) => e.platform === platform).map((e) => e.scoring.weightedEngagementRate).filter((v): v is number => v !== null)
    norms[platform]!.medianWeightedEngagementRate = median(rates)
  }
  const pace = nichePace(enriched, rc.now)
  const byId = new Map(enriched.map((e) => [e.id, e]))

  // --- Clustering -------------------------------------------------------------
  const active = await rc.db
    .select()
    .from(trendClusters)
    .where(and(eq(trendClusters.creatorProfileId, rc.profile.id), eq(trendClusters.dataMode, rc.dataMode), eq(trendClusters.status, 'active')))
  const current = active.filter((c) => c.embeddingModel === embedder.model)
  // A changed embedding model makes old centroids incomparable: retire those trends.
  for (const stale of active.filter((c) => c.embeddingModel !== embedder.model)) {
    await rc.db.update(trendClusters).set({ status: 'dormant', updatedAt: rc.now }).where(eq(trendClusters.id, stale.id))
  }
  const memberRows = current.length
    ? await rc.db.select().from(trendClusterMembers).where(inArray(trendClusterMembers.clusterId, current.map((c) => c.id)))
    : []
  const membership = new Map<string, string>(memberRows.map((m) => [m.contentItemId, m.clusterId]))
  const unassigned: Candidate[] = enriched
    .filter((e) => !membership.has(e.id))
    .map((e) => ({ id: e.id, vector: e.vector, weight: e.scoring.viewsPerHour ?? e.scoring.engagementsPerHour ?? 0 }))

  const { assigned, unassigned: leftover } = assignToExisting(
    unassigned,
    current.map((c) => ({ id: c.id, centroid: c.centroid, firstDetectedAt: c.firstDetectedAt })),
    thresholds.join,
  )
  const newMembers: Array<typeof trendClusterMembers.$inferInsert> = assigned.map((a) => ({ clusterId: a.clusterId, contentItemId: a.itemId, similarity: a.similarity, assignedAt: rc.now }))
  for (const a of assigned) membership.set(a.itemId, a.clusterId)

  let created = 0
  const newClusterIds: string[] = []
  const groups = formNewClusters(leftover, thresholds.create, 2)
  const grouped = new Set(groups.flatMap((g) => g.memberIds))
  // Single-post breakouts: extreme outperformance with no company yet.
  const breakouts = leftover.filter((c) => !grouped.has(c.id) && (byId.get(c.id)?.scoring.outperformance ?? 0) >= rc.settings.trend.breakoutMultiple)
  const toCreate = [
    ...groups.map((g) => ({ memberIds: g.memberIds, similarities: g.similarities, centroid: g.centroid, breakout: false })),
    ...breakouts.map((b) => ({ memberIds: [b.id], similarities: [1], centroid: Array.from(b.vector), breakout: true })),
  ]
  for (const group of toCreate) {
    const members = group.memberIds.map((id) => byId.get(id)!).filter(Boolean)
    const topTopic = topCounts(members.map((m) => m.topic).filter((t): t is string => !!t), 1)[0]?.value ?? null
    const [row] = await rc.db
      .insert(trendClusters)
      .values({
        creatorProfileId: rc.profile.id,
        dataMode: rc.dataMode,
        label: topTopic ?? 'New trend',
        topicKey: topCounts(members.map((m) => m.topicKey).filter((t): t is string => !!t), 1)[0]?.value ?? null,
        centroid: group.centroid,
        embeddingModel: embedder.model,
        // When SPOTTER first saw it; the age of its oldest post is tracked separately.
        firstDetectedAt: rc.now,
        lastActivityAt: rc.now,
        isBreakout: group.breakout,
        createdAt: rc.now,
        updatedAt: rc.now,
      })
      .returning({ id: trendClusters.id })
    created++
    newClusterIds.push(row!.id)
    group.memberIds.forEach((id, i) => {
      newMembers.push({ clusterId: row!.id, contentItemId: id, similarity: group.similarities[i] ?? 0, assignedAt: rc.now })
      membership.set(id, row!.id)
    })
  }
  for (let i = 0; i < newMembers.length; i += 500) {
    await rc.db.insert(trendClusterMembers).values(newMembers.slice(i, i + 500)).onConflictDoNothing()
  }

  // Refresh centroids from members, then merge converging trends.
  const clusterIds = [...new Set([...current.map((c) => c.id), ...newClusterIds])]
  const membersOf = new Map<string, string[]>()
  for (const [itemId, clusterId] of membership) {
    const list = membersOf.get(clusterId) ?? []
    list.push(itemId)
    membersOf.set(clusterId, list)
  }
  const centroids = new Map<string, number[]>()
  for (const id of clusterIds) {
    const vectors = (membersOf.get(id) ?? []).map((m) => byId.get(m)?.vector).filter((v): v is number[] => !!v)
    const existing = current.find((c) => c.id === id)
    centroids.set(id, meanVector(vectors) ?? existing?.centroid ?? [])
  }
  const firstDetected = new Map<string, Date>([...current.map((c) => [c.id, c.firstDetectedAt] as const), ...newClusterIds.map((id) => [id, rc.now] as const)])
  const merges = findMerges(
    clusterIds.filter((id) => (centroids.get(id) ?? []).length > 0).map((id) => ({ id, centroid: centroids.get(id)!, firstDetectedAt: firstDetected.get(id)! })),
    thresholds.merge,
  )
  for (const m of merges) {
    await rc.db.update(trendClusterMembers).set({ clusterId: m.keepId }).where(eq(trendClusterMembers.clusterId, m.mergeId))
    await rc.db.update(trendClusters).set({ status: 'merged', mergedIntoId: m.keepId, updatedAt: rc.now }).where(eq(trendClusters.id, m.mergeId))
    const moved = membersOf.get(m.mergeId) ?? []
    membersOf.set(m.keepId, [...(membersOf.get(m.keepId) ?? []), ...moved])
    membersOf.delete(m.mergeId)
    const vectors = (membersOf.get(m.keepId) ?? []).map((id) => byId.get(id)?.vector).filter((v): v is number[] => !!v)
    centroids.set(m.keepId, meanVector(vectors) ?? centroids.get(m.keepId)!)
  }
  const merged = new Set(merges.map((m) => m.mergeId))

  // --- Scoring ----------------------------------------------------------------
  const weights = normaliseWeights(rc.settings.trend.weights)
  const scored: ScoredCluster[] = []
  let dormant = 0
  const allClusters = await rc.db.select().from(trendClusters).where(inArray(trendClusters.id, clusterIds.filter((id) => !merged.has(id))))
  for (const cluster of allClusters) {
    const members = (membersOf.get(cluster.id) ?? []).map((id) => byId.get(id)).filter((m): m is Enriched => !!m)
    if (members.length === 0) {
      await rc.db.update(trendClusters).set({ status: 'dormant', updatedAt: rc.now }).where(eq(trendClusters.id, cluster.id))
      dormant++
      continue
    }
    const centroid = centroids.get(cluster.id) ?? cluster.centroid
    const scoringItems: ScoringItem[] = members.map((m) => ({ ...m.scoring, similarity: cosine(m.vector, centroid) }))
    const patterns = patternsOf(members)
    const consistency = Math.max(patterns.formats[0]?.count ?? 0, patterns.hookTypes[0]?.count ?? 0) / members.length
    const result = scoreTrend({
      items: scoringItems,
      now: rc.now,
      norms,
      pace,
      weights: { ...rc.settings.trend.weights, ...weights },
      patternConsistency: consistency,
      cohesionRange: { low: thresholds.join - 0.1, high: Math.min(0.98, thresholds.merge) },
    })
    const oldest = members.reduce<Date | null>((min, m) => (m.publishedAt && (!min || m.publishedAt < min) ? m.publishedAt : min), null)
    const stage = classifyStage({
      growthPerDay: result.acceleration.ratio,
      trendAgeHours: oldest ? (rc.now.getTime() - oldest.getTime()) / HOUR : null,
      itemCount: result.metrics.itemCount,
      postsLast72h: result.metrics.postsLast72h,
      postsPrev72h: result.metrics.postsPrev72h,
      momentum: result.metrics.momentum,
      momentumPeak: result.metrics.momentumPeak,
    })
    const evidenceLines = evidenceFor(result, rc.settings.trend.lookbackDays)
    const isBreakout = members.length < rc.settings.trend.minContentCount && (result.metrics.maxOutperformance ?? 0) >= rc.settings.trend.breakoutMultiple

    // Name (or rename) the trend when it is new or has doubled in size.
    let label = cluster.label
    let summary = cluster.summary
    let labelItemCount = cluster.labelItemCount
    if (cluster.labelItemCount === 0 || members.length >= cluster.labelItemCount * 2) {
      const top = [...members].sort((a, b) => (b.scoring.viewsPerHour ?? 0) - (a.scoring.viewsPerHour ?? 0)).slice(0, 12)
      const input = {
        members: top.map((m) => ({ title: m.title, caption: m.caption?.slice(0, 280) ?? null, topic: m.topic, format: m.format, hook: m.hook })),
        topTopics: topCounts(members.map((m) => m.topic).filter((t): t is string => !!t), 3),
        keywords: topCounts(members.flatMap((m) => m.keywords ?? []), 6).map((k) => k.value),
      }
      try {
        const described = await ai.describeCluster(input)
        label = described.label
        summary = described.summary
      } catch (err) {
        const described = await fallbackAi.describeCluster(input)
        label = described.label
        summary = described.summary
        await recordEvent(rc.db, { profileId: rc.profile.id, level: 'warn', category: 'ai', message: `Naming a trend failed with ${ai.name}; used local naming. ${err instanceof Error ? err.message : ''}`, at: rc.now })
      }
      labelItemCount = members.length
    }

    const topicKey = topCounts(members.map((m) => m.topicKey).filter((t): t is string => !!t), 1)[0]?.value ?? null
    const platforms = [...new Set(members.map((m) => m.platform))]
    const keywords = topCounts(members.flatMap((m) => m.keywords ?? []), 10).map((k) => k.value)
    const lastActivity = members.reduce((max, m) => (m.publishedAt && m.publishedAt > max ? m.publishedAt : max), cluster.lastActivityAt)
    await rc.db.insert(trendScores).values({
      clusterId: cluster.id,
      collectionRunId: rc.runId,
      computedAt: rc.now,
      trendScore: result.trendScore,
      components: result.components,
      weights,
      confidence: result.confidence,
      stage: stage.stage,
      metrics: result.metrics,
    })
    await rc.db
      .update(trendClusters)
      .set({
        label,
        labelItemCount,
        summary,
        topicKey,
        centroid,
        stage: stage.stage,
        stageBasis: stage.basis,
        platforms,
        itemCount: result.metrics.itemCount,
        creatorCount: result.metrics.creatorCount,
        isBreakout,
        keywords,
        patterns,
        explanation: evidenceLines.join('. ') + '.',
        explanationBy: 'deterministic',
        latestTrendScore: result.trendScore,
        latestConfidence: result.confidence,
        latestScoredAt: rc.now,
        lastActivityAt: lastActivity,
        status: 'active',
        updatedAt: rc.now,
      })
      .where(eq(trendClusters.id, cluster.id))

    const memberViews: MemberView[] = members
      .map((m) => ({
        contentItemId: m.id,
        platform: m.platform,
        externalId: m.externalId,
        url: m.url,
        title: m.title,
        caption: m.caption,
        hook: m.hook,
        creatorName: m.creatorName,
        creatorFollowerCount: m.followers,
        publishedAt: m.publishedAt,
        views: m.scoring.views,
        viewsPerHour: m.scoring.viewsPerHour,
        outperformance: m.scoring.outperformance,
        dataOrigin: m.dataOrigin,
        similarity: cosine(m.vector, centroid),
      }))
      .sort((a, b) => (b.outperformance ?? 0) - (a.outperformance ?? 0) || (b.viewsPerHour ?? 0) - (a.viewsPerHour ?? 0))
    const nicheValues = members.map((m) => m.nicheRelevance).filter((v): v is number => v !== null)
    scored.push({
      clusterId: cluster.id,
      label,
      summary,
      topicKey,
      centroid,
      isBreakout,
      firstDetectedAt: cluster.firstDetectedAt,
      result,
      stage,
      patterns,
      members: memberViews,
      evidenceLines,
      profile: {
        centroid,
        topicKey,
        topicLabel: topCounts(members.map((m) => m.topic).filter((t): t is string => !!t), 1)[0]?.value ?? null,
        dominantFormat: patterns.formats[0]?.value ?? null,
        dominantStyle: patterns.styles[0]?.value ?? null,
        medianDurationSeconds: median(members.map((m) => m.durationSeconds).filter((d): d is number => d !== null)),
        platforms,
        keywords,
        hashtags: patterns.hashtags.map((h) => h.value),
        nicheRelevance: nicheValues.length ? nicheValues.reduce((s, v) => s + v, 0) / nicheValues.length : null,
      },
    })
  }
  // Trends with no active cluster rows left (all members aged out) go dormant.
  const stillActive = new Set(allClusters.map((c) => c.id))
  for (const c of current) {
    if (!stillActive.has(c.id) && !merged.has(c.id)) {
      await rc.db.update(trendClusters).set({ status: 'dormant', updatedAt: rc.now }).where(eq(trendClusters.id, c.id))
      dormant++
    }
  }
  return { scored, created, merged: merges.length, dormant }
}
