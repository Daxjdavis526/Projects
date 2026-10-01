/**
 * Writing collected content: creators, items and their metric snapshots.
 *
 * Upserts coalesce: a field the platform did not return this time never
 * overwrites one it returned before (a stats-only refresh must not blank a
 * title). Every collection writes a new snapshot row — history is appended,
 * never rewritten.
 */
import { createHash } from 'node:crypto'
import { and, eq, inArray, sql } from 'drizzle-orm'
import type { OwnerItemMetrics } from '../../connectors/types'
import { rowsOf, type Database } from '../../db/client'
import { accountMetricDays, contentItems, contentMetricSnapshots, creators } from '../../db/schema'
import type { ContentAvailability, ContentItem, DataOrigin, Platform } from '../../domain/types'

const CHUNK = 200

function chunks<T>(items: T[], size = CHUNK): T[][] {
  const out: T[][] = []
  for (let i = 0; i < items.length; i += size) out.push(items.slice(i, i + size))
  return out
}

export function contentHash(item: Pick<ContentItem, 'title' | 'caption' | 'hashtags' | 'transcript'>): string {
  return createHash('sha256')
    .update([item.title ?? '', item.caption ?? '', (item.hashtags ?? []).join(' '), item.transcript ?? ''].join('\u0000'))
    .digest('hex')
    .slice(0, 24)
}

export interface UpsertOptions {
  origin: DataOrigin
  isOwn: boolean
  runId: string | null
  now: Date
  platformAccountId?: string | null
  /** True when title/caption/metadata were read (not just counters). */
  metadataFresh: boolean
}

/** Upsert creators referenced by items. Returns external id → row id. */
export async function upsertCreators(db: Database, platform: Platform, items: ContentItem[], opts: UpsertOptions): Promise<Map<string, string>> {
  const byId = new Map<string, ContentItem>()
  for (const item of items) if (item.creatorId && !byId.has(item.creatorId)) byId.set(item.creatorId, item)
  const out = new Map<string, string>()
  for (const batch of chunks([...byId.values()])) {
    const rows = await db
      .insert(creators)
      .values(
        batch.map((item) => ({
          platform,
          dataOrigin: opts.origin,
          externalId: item.creatorId!,
          handle: item.creatorHandle,
          displayName: item.creatorName,
          profileUrl: item.creatorProfileUrl,
          avatarUrl: item.creatorAvatarUrl,
          followerCount: item.creatorFollowerCount,
          followerCountObservedAt: item.creatorFollowerCount === null ? null : opts.now,
          isOwn: opts.isOwn,
          platformAccountId: opts.isOwn ? (opts.platformAccountId ?? null) : null,
          firstSeenAt: opts.now,
          lastSeenAt: opts.now,
        })),
      )
      .onConflictDoUpdate({
        target: [creators.platform, creators.dataOrigin, creators.externalId],
        set: {
          handle: sql.raw('coalesce(excluded.handle, creators.handle)'),
          displayName: sql.raw('coalesce(excluded.display_name, creators.display_name)'),
          profileUrl: sql.raw('coalesce(excluded.profile_url, creators.profile_url)'),
          avatarUrl: sql.raw('coalesce(excluded.avatar_url, creators.avatar_url)'),
          followerCount: sql.raw('coalesce(excluded.follower_count, creators.follower_count)'),
          followerCountObservedAt: sql.raw('coalesce(excluded.follower_count_observed_at, creators.follower_count_observed_at)'),
          isOwn: sql.raw('creators.is_own or excluded.is_own'),
          platformAccountId: sql.raw('coalesce(excluded.platform_account_id, creators.platform_account_id)'),
          lastSeenAt: sql.raw('excluded.last_seen_at'),
        },
      })
      .returning({ id: creators.id, externalId: creators.externalId })
    for (const r of rows) out.set(r.externalId, r.id)
  }
  return out
}

/**
 * Upsert items and append one snapshot each. Returns external id → row id.
 */
export async function upsertItems(db: Database, platform: Platform, items: ContentItem[], opts: UpsertOptions): Promise<Map<string, string>> {
  const out = new Map<string, string>()
  if (items.length === 0) return out
  const creatorIds = await upsertCreators(db, platform, items, opts)
  const unique = [...new Map(items.map((i) => [i.externalId, i])).values()]
  for (const batch of chunks(unique)) {
    const rows = await db
      .insert(contentItems)
      .values(
        batch.map((item) => ({
          platform,
          dataOrigin: opts.origin,
          externalId: item.externalId,
          creatorId: item.creatorId ? (creatorIds.get(item.creatorId) ?? null) : null,
          isOwn: opts.isOwn,
          url: item.url,
          publishedAt: item.createdAt,
          title: item.title,
          caption: item.caption,
          transcript: item.transcript,
          durationSeconds: item.durationSeconds,
          mediaType: item.mediaType,
          hashtags: item.hashtags,
          audioId: item.audioId,
          audioName: item.audioName,
          audioType: item.audioType,
          thumbnailUrl: item.thumbnailUrl,
          language: item.language,
          discoveredVia: item.discoveredVia,
          availability: 'available' as const,
          availabilityCheckedAt: opts.now,
          contentHash: opts.metadataFresh ? contentHash(item) : null,
          firstCollectedAt: opts.now,
          lastCollectedAt: opts.now,
          metadataRefreshedAt: opts.now,
          latestSnapshotAt: opts.now,
          latestViewCount: item.viewCount,
          latestLikeCount: item.likeCount,
          latestCommentCount: item.commentCount,
          latestShareCount: item.shareCount,
          latestSaveCount: item.saveCount,
          latestReach: item.reach,
          latestImpressions: item.impressions,
          createdAt: opts.now,
          updatedAt: opts.now,
        })),
      )
      .onConflictDoUpdate({
        target: [contentItems.platform, contentItems.dataOrigin, contentItems.externalId],
        set: {
          creatorId: sql.raw('coalesce(excluded.creator_id, content_items.creator_id)'),
          isOwn: sql.raw('content_items.is_own or excluded.is_own'),
          url: sql.raw('coalesce(excluded.url, content_items.url)'),
          publishedAt: sql.raw('coalesce(excluded.published_at, content_items.published_at)'),
          title: sql.raw('coalesce(excluded.title, content_items.title)'),
          caption: sql.raw('coalesce(excluded.caption, content_items.caption)'),
          transcript: sql.raw('coalesce(excluded.transcript, content_items.transcript)'),
          durationSeconds: sql.raw('coalesce(excluded.duration_seconds, content_items.duration_seconds)'),
          mediaType: sql.raw('coalesce(excluded.media_type, content_items.media_type)'),
          hashtags: sql.raw('coalesce(excluded.hashtags, content_items.hashtags)'),
          audioId: sql.raw('coalesce(excluded.audio_id, content_items.audio_id)'),
          audioName: sql.raw('coalesce(excluded.audio_name, content_items.audio_name)'),
          audioType: sql.raw('coalesce(excluded.audio_type, content_items.audio_type)'),
          thumbnailUrl: sql.raw('coalesce(excluded.thumbnail_url, content_items.thumbnail_url)'),
          language: sql.raw('coalesce(excluded.language, content_items.language)'),
          discoveredVia: sql.raw('coalesce(content_items.discovered_via, excluded.discovered_via)'),
          availability: sql.raw("'available'"),
          availabilityCheckedAt: sql.raw('excluded.availability_checked_at'),
          contentHash: sql.raw('coalesce(excluded.content_hash, content_items.content_hash)'),
          lastCollectedAt: sql.raw('excluded.last_collected_at'),
          metadataRefreshedAt: opts.metadataFresh ? sql.raw('excluded.metadata_refreshed_at') : sql.raw('content_items.metadata_refreshed_at'),
          latestSnapshotAt: sql.raw('excluded.latest_snapshot_at'),
          latestViewCount: sql.raw('coalesce(excluded.latest_view_count, content_items.latest_view_count)'),
          latestLikeCount: sql.raw('coalesce(excluded.latest_like_count, content_items.latest_like_count)'),
          latestCommentCount: sql.raw('coalesce(excluded.latest_comment_count, content_items.latest_comment_count)'),
          latestShareCount: sql.raw('coalesce(excluded.latest_share_count, content_items.latest_share_count)'),
          latestSaveCount: sql.raw('coalesce(excluded.latest_save_count, content_items.latest_save_count)'),
          latestReach: sql.raw('coalesce(excluded.latest_reach, content_items.latest_reach)'),
          latestImpressions: sql.raw('coalesce(excluded.latest_impressions, content_items.latest_impressions)'),
          updatedAt: sql.raw('excluded.updated_at'),
        },
      })
      .returning({ id: contentItems.id, externalId: contentItems.externalId })
    for (const r of rows) out.set(r.externalId, r.id)
  }

  const snapshots = unique
    .map((item) => {
      const contentItemId = out.get(item.externalId)
      if (!contentItemId) return null
      const hasAny = [item.viewCount, item.likeCount, item.commentCount, item.shareCount, item.saveCount, item.reach, item.impressions].some((v) => v !== null)
      if (!hasAny) return null
      return {
        contentItemId,
        collectedAt: opts.now,
        collectionRunId: opts.runId,
        viewCount: item.viewCount,
        likeCount: item.likeCount,
        commentCount: item.commentCount,
        shareCount: item.shareCount,
        saveCount: item.saveCount,
        reach: item.reach,
        impressions: item.impressions,
        creatorFollowerCount: item.creatorFollowerCount,
        source: item.metricSource,
        extra: item.extraMetrics,
      }
    })
    .filter((s): s is NonNullable<typeof s> => s !== null)
  for (const batch of chunks(snapshots, 500)) await db.insert(contentMetricSnapshots).values(batch)
  return out
}

/**
 * Merge the creator's private insights into this run's snapshots of their
 * own posts. Owner insights and public counters are the same measurement
 * moment, so they share one snapshot, marked as owner_insights.
 */
export async function mergeOwnerInsights(
  db: Database,
  platform: Platform,
  origin: DataOrigin,
  runId: string | null,
  now: Date,
  metrics: OwnerItemMetrics[],
): Promise<number> {
  if (metrics.length === 0) return 0
  const ids = await db
    .select({ id: contentItems.id, externalId: contentItems.externalId })
    .from(contentItems)
    .where(and(eq(contentItems.platform, platform), eq(contentItems.dataOrigin, origin), inArray(contentItems.externalId, metrics.map((m) => m.externalId))))
  const idMap = new Map(ids.map((r) => [r.externalId, r.id]))
  let merged = 0
  for (const m of metrics) {
    const contentItemId = idMap.get(m.externalId)
    if (!contentItemId) continue
    const [snap] = await db
      .select()
      .from(contentMetricSnapshots)
      .where(and(eq(contentMetricSnapshots.contentItemId, contentItemId), eq(contentMetricSnapshots.collectedAt, now)))
      .limit(1)
    const values = {
      viewCount: snap?.viewCount ?? m.viewCount,
      likeCount: snap?.likeCount ?? m.likeCount,
      commentCount: snap?.commentCount ?? m.commentCount,
      shareCount: m.shareCount ?? snap?.shareCount ?? null,
      saveCount: m.saveCount ?? snap?.saveCount ?? null,
      reach: m.reach ?? snap?.reach ?? null,
      impressions: m.impressions ?? snap?.impressions ?? null,
      extra: { ...(snap?.extra ?? {}), ...m.extra },
      source: 'owner_insights' as const,
    }
    if (snap) await db.update(contentMetricSnapshots).set(values).where(eq(contentMetricSnapshots.id, snap.id))
    else await db.insert(contentMetricSnapshots).values({ contentItemId, collectedAt: now, collectionRunId: runId, creatorFollowerCount: null, ...values })
    await db
      .update(contentItems)
      .set({
        latestViewCount: values.viewCount,
        latestShareCount: values.shareCount,
        latestSaveCount: values.saveCount,
        latestReach: values.reach,
        latestImpressions: values.impressions,
        latestSnapshotAt: now,
      })
      .where(eq(contentItems.id, contentItemId))
    merged++
  }
  return merged
}

export async function markAvailability(db: Database, platform: Platform, origin: DataOrigin, externalIds: string[], availability: ContentAvailability, now: Date): Promise<void> {
  for (const batch of chunks(externalIds)) {
    await db
      .update(contentItems)
      .set({ availability, availabilityCheckedAt: now, updatedAt: now })
      .where(and(eq(contentItems.platform, platform), eq(contentItems.dataOrigin, origin), inArray(contentItems.externalId, batch)))
  }
}

/** Discovered (not own) items still worth re-polling: recent, available, not yet refreshed this run. */
export async function trackedItems(db: Database, platform: Platform, origin: DataOrigin, publishedSince: Date, collectedBefore: Date, limit: number): Promise<string[]> {
  const rows = await db
    .select({ externalId: contentItems.externalId })
    .from(contentItems)
    .where(
      and(
        eq(contentItems.platform, platform),
        eq(contentItems.dataOrigin, origin),
        eq(contentItems.isOwn, false),
        eq(contentItems.availability, 'available'),
        sql`${contentItems.publishedAt} >= ${publishedSince}`,
        sql`${contentItems.lastCollectedAt} < ${collectedBefore}`,
      ),
    )
    .orderBy(sql`${contentItems.latestViewCount} desc nulls last`)
    .limit(limit)
  return rows.map((r) => r.externalId)
}

/**
 * Third-party creators seen recently who still lack a trustworthy baseline
 * (fewer than five settled posts on record). Their recent uploads are
 * fetched as baseline samples, where the platform allows it.
 */
export async function creatorsNeedingBaseline(db: Database, platform: Platform, origin: DataOrigin, now: Date, limit = 10): Promise<string[]> {
  const recent = new Date(now.getTime() - 2 * 86_400_000)
  const settledBefore = new Date(now.getTime() - 36 * 3_600_000)
  const result = await db.execute(sql`
    SELECT c.external_id
    FROM creators c
    LEFT JOIN creator_baselines b ON b.creator_id = c.id
    WHERE c.platform = ${platform}
      AND c.data_origin = ${origin}
      AND c.is_own = false
      AND c.last_seen_at >= ${recent}
      AND (b.creator_id IS NULL OR b.sufficient = false)
      AND (SELECT count(*) FROM content_items ci WHERE ci.creator_id = c.id AND ci.published_at < ${settledBefore}) < 5
    ORDER BY c.last_seen_at DESC
    LIMIT ${limit}`)
  return rowsOf<{ external_id: string }>(result).map((r) => r.external_id)
}

/** Store the account's daily series (owner analytics). Platforms revise recent days, so the latest write wins. */
export async function saveAccountSeries(
  db: Database,
  platformAccountId: string,
  origin: DataOrigin,
  series: Array<{ date: string; metrics: Record<string, number | null> }>,
  now: Date,
): Promise<number> {
  const rows = series
    .filter((p) => /^\d{4}-\d{2}-\d{2}$/.test(p.date))
    .map((p) => ({ platformAccountId, dataOrigin: origin, day: p.date, metrics: p.metrics, collectedAt: now }))
  for (let i = 0; i < rows.length; i += 500) {
    await db
      .insert(accountMetricDays)
      .values(rows.slice(i, i + 500))
      .onConflictDoUpdate({ target: [accountMetricDays.platformAccountId, accountMetricDays.day], set: { metrics: sql`excluded.metrics`, collectedAt: now } })
  }
  return rows.length
}
