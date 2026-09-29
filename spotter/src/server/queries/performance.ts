/**
 * The creator's own content: account series, per-post results against their
 * own normal, and what patterns work for them.
 */
import 'server-only'
import { and, asc, desc, eq, gte, inArray, isNotNull, sql } from 'drizzle-orm'
import { buildInsights, DIMENSION_LABEL, type LiftRecord, type PersonalizationDimension } from '@/core/analytics/personalization'
import { median } from '@/core/analytics/stats'
import { getDb } from '@/core/db/client'
import { accountMetricDays, aiAnalysis, contentItems, creatorContentPerformance, platformAccounts } from '@/core/db/schema'
import type { Platform } from '@/core/domain/types'
import { originsFor } from '@/core/pipeline/context'
import type { Profile } from '../auth/session'

const DAY = 86_400_000

export interface OwnPostRow {
  id: string
  platform: Platform
  title: string | null
  url: string | null
  dataOrigin: string
  publishedAt: Date | null
  views: number | null
  likes: number | null
  comments: number | null
  shares: number | null
  saves: number | null
  lift: number | null
  topic: string | null
  format: string | null
  hookType: string | null
  durationSeconds: number | null
}

export interface SeriesView {
  platform: Platform
  metric: string
  label: string
  points: Array<{ t: number; value: number }>
}

export interface PerformanceData {
  accounts: Array<{ platform: Platform; username: string | null; followers: number | null; lastSyncAt: Date | null; posts: number }>
  kpis: {
    posts30d: number
    medianViews30d: number | null
    medianViewsPrev30d: number | null
    medianLift30d: number | null
    engagementRate30d: number | null
  }
  series: SeriesView[]
  lifts: Array<{ dimension: PersonalizationDimension; label: string; rows: Array<{ value: string; lift: number; postCount: number; confidence: number }> }>
  insights: string[]
  posts: OwnPostRow[]
}

const SERIES_LABEL: Record<string, string> = {
  views: 'Views per day',
  reach: 'Accounts reached per day',
  estimatedMinutesWatched: 'Minutes watched per day',
  subscribersGained: 'Subscribers gained per day',
}

export async function getPerformance(profile: Profile): Promise<PerformanceData> {
  const db = await getDb()
  const mode = profile.dataMode === 'demo' ? 'mock' : 'live'
  const origins = originsFor(profile.dataMode)
  const accounts = await db
    .select()
    .from(platformAccounts)
    .where(and(eq(platformAccounts.creatorProfileId, profile.id), eq(platformAccounts.mode, mode), sql`${platformAccounts.status} <> 'disconnected'`))
  const since = new Date(Date.now() - 120 * DAY)
  const [posts, lifts, days, counts] = await Promise.all([
    db
      .select({
        id: contentItems.id,
        platform: contentItems.platform,
        title: contentItems.title,
        caption: contentItems.caption,
        url: contentItems.url,
        dataOrigin: contentItems.dataOrigin,
        publishedAt: contentItems.publishedAt,
        views: contentItems.latestViewCount,
        likes: contentItems.latestLikeCount,
        comments: contentItems.latestCommentCount,
        shares: contentItems.latestShareCount,
        saves: contentItems.latestSaveCount,
        lift: contentItems.ownLift,
        topic: aiAnalysis.topic,
        format: aiAnalysis.format,
        hookType: aiAnalysis.hookType,
        durationSeconds: contentItems.durationSeconds,
      })
      .from(contentItems)
      .leftJoin(aiAnalysis, and(eq(aiAnalysis.contentItemId, contentItems.id), eq(aiAnalysis.status, 'succeeded')))
      .where(and(inArray(contentItems.dataOrigin, origins), eq(contentItems.isOwn, true), eq(contentItems.availability, 'available'), gte(contentItems.publishedAt, since)))
      .orderBy(desc(contentItems.publishedAt))
      .limit(400),
    db
      .select()
      .from(creatorContentPerformance)
      .where(and(eq(creatorContentPerformance.creatorProfileId, profile.id), eq(creatorContentPerformance.dataMode, profile.dataMode))),
    accounts.length
      ? db
          .select()
          .from(accountMetricDays)
          .where(and(inArray(accountMetricDays.platformAccountId, accounts.map((a) => a.id)), gte(accountMetricDays.day, new Date(Date.now() - 90 * DAY).toISOString().slice(0, 10))))
          .orderBy(asc(accountMetricDays.day))
      : Promise.resolve([]),
    db
      .select({ platform: contentItems.platform, n: sql<number>`count(*)` })
      .from(contentItems)
      .where(and(inArray(contentItems.dataOrigin, origins), eq(contentItems.isOwn, true), isNotNull(contentItems.publishedAt)))
      .groupBy(contentItems.platform),
  ])

  const now = Date.now()
  const inWindow = (p: (typeof posts)[number], from: number, to: number) => p.publishedAt && now - p.publishedAt.getTime() >= from * DAY && now - p.publishedAt.getTime() < to * DAY
  // "Settled" posts only (≥ 2 days old), so young posts don't drag the median down.
  const recent = posts.filter((p) => inWindow(p, 2, 32))
  const prior = posts.filter((p) => inWindow(p, 32, 62))
  const views = (list: typeof posts) => median(list.map((p) => p.views).filter((v): v is number => v !== null))
  const engagement = recent
    .map((p) => (p.views ? ((p.likes ?? 0) + (p.comments ?? 0) + (p.shares ?? 0) + (p.saves ?? 0)) / p.views : null))
    .filter((v): v is number => v !== null && Number.isFinite(v))

  const series: SeriesView[] = []
  for (const account of accounts) {
    const rows = days.filter((d) => d.platformAccountId === account.id)
    const metrics = new Set(rows.flatMap((r) => Object.keys(r.metrics)))
    for (const metric of ['views', 'reach']) {
      if (!metrics.has(metric)) continue
      series.push({
        platform: account.platform,
        metric,
        label: SERIES_LABEL[metric] ?? metric,
        points: rows
          .map((r) => ({ t: Date.parse(`${r.day}T12:00:00Z`), value: r.metrics[metric] ?? null }))
          .filter((p): p is { t: number; value: number } => typeof p.value === 'number'),
      })
    }
  }

  const liftRecords: LiftRecord[] = lifts.map((l) => ({
    dimension: l.dimension as PersonalizationDimension,
    value: l.value,
    postCount: l.postCount,
    meanLogLift: l.meanLogLift,
    shrunkLogLift: Math.log(l.lift),
    lift: l.lift,
    medianViews: l.medianViews,
    avgEngagementRate: l.avgEngagementRate,
    confidence: l.confidence,
  }))
  const dims: PersonalizationDimension[] = ['topic', 'format', 'hook_type', 'style', 'length', 'posting_window', 'weekday', 'platform', 'controversy']
  return {
    accounts: accounts.map((a) => ({
      platform: a.platform,
      username: a.username,
      followers: a.followerCount,
      lastSyncAt: a.lastSyncAt,
      posts: Number(counts.find((c) => c.platform === a.platform)?.n ?? 0),
    })),
    kpis: {
      posts30d: posts.filter((p) => inWindow(p, 0, 30)).length,
      medianViews30d: views(recent),
      medianViewsPrev30d: views(prior),
      medianLift30d: median(recent.map((p) => p.lift).filter((v): v is number => v !== null)),
      engagementRate30d: median(engagement),
    },
    series,
    lifts: dims
      .map((dimension) => ({
        dimension,
        label: DIMENSION_LABEL[dimension],
        rows: liftRecords
          .filter((l) => l.dimension === dimension && l.postCount >= 2)
          .sort((a, b) => b.lift - a.lift)
          .map((l) => ({ value: l.value, lift: l.lift, postCount: l.postCount, confidence: l.confidence })),
      }))
      .filter((d) => d.rows.length > 1),
    // What works first; then the strongest cautions.
    insights: [...buildInsights(liftRecords.filter((l) => l.lift > 1), 4), ...buildInsights(liftRecords.filter((l) => l.lift < 1), 2)],
    posts: posts.slice(0, 30).map((p) => ({
      id: p.id,
      platform: p.platform,
      title: p.title ?? p.caption?.split('\n')[0]?.slice(0, 140) ?? null,
      url: p.url,
      dataOrigin: p.dataOrigin,
      publishedAt: p.publishedAt,
      views: p.views,
      likes: p.likes,
      comments: p.comments,
      shares: p.shares,
      saves: p.saves,
      lift: p.lift,
      topic: p.topic,
      format: p.format,
      hookType: p.hookType,
      durationSeconds: p.durationSeconds,
    })),
  }
}
