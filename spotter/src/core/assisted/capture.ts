/**
 * Browser-assisted discovery, the compliant version: the creator saw a post
 * while browsing and tells SPOTTER about it — the link plus whatever numbers
 * the app showed them. SPOTTER does not fetch the page, automate a browser,
 * log in anywhere, or work around a platform's limits. Captured posts are
 * stored as `manual` data, labelled as such everywhere, and only supplement
 * what the official APIs provide.
 *
 * The whole module is inert unless ASSISTED_DISCOVERY_ENABLED=true.
 */
import { and, desc, eq } from 'drizzle-orm'
import type { Database } from '../db/client'
import { contentItems, creators } from '../db/schema'
import type { ContentItem, Platform } from '../domain/types'
import { upsertItems } from '../pipeline/store/content'

export interface CaptureInput {
  url: string
  text: string | null
  creatorHandle: string | null
  creatorFollowers: number | null
  views: number | null
  likes: number | null
  comments: number | null
  postedAt: Date | null
}

export class CaptureError extends Error {}

/** Recognise a post link on a supported platform. Nothing is fetched. */
export function parsePostUrl(raw: string): { platform: Platform; externalId: string; canonicalUrl: string; handle: string | null } | null {
  let url: URL
  try {
    url = new URL(raw.trim())
  } catch {
    return null
  }
  if (url.protocol !== 'https:' && url.protocol !== 'http:') return null
  const host = url.hostname.replace(/^(www\.|m\.)/, '')
  if (host === 'youtube.com') {
    const v = url.searchParams.get('v')
    const shorts = /^\/shorts\/([\w-]{6,20})/.exec(url.pathname)?.[1]
    const id = v && /^[\w-]{6,20}$/.test(v) ? v : shorts
    return id ? { platform: 'youtube', externalId: id, canonicalUrl: `https://www.youtube.com/watch?v=${id}`, handle: null } : null
  }
  if (host === 'youtu.be') {
    const id = /^\/([\w-]{6,20})/.exec(url.pathname)?.[1]
    return id ? { platform: 'youtube', externalId: id, canonicalUrl: `https://www.youtube.com/watch?v=${id}`, handle: null } : null
  }
  if (host === 'instagram.com') {
    const m = /^\/(?:[\w.]+\/)?(p|reel|reels)\/([\w-]{5,40})/.exec(url.pathname)
    return m ? { platform: 'instagram', externalId: `shortcode:${m[2]}`, canonicalUrl: `https://www.instagram.com/${m[1] === 'p' ? 'p' : 'reel'}/${m[2]}/`, handle: null } : null
  }
  if (host === 'tiktok.com') {
    const m = /^\/@([\w.]{2,40})\/video\/(\d{8,25})/.exec(url.pathname)
    return m ? { platform: 'tiktok', externalId: m[2]!, canonicalUrl: `https://www.tiktok.com/@${m[1]}/video/${m[2]}`, handle: m[1]! } : null
  }
  return null
}

const count = (n: number | null) => (n === null || !Number.isFinite(n) || n < 0 ? null : Math.round(n))

export function captureToItem(input: CaptureInput, now: Date): ContentItem {
  const parsed = parsePostUrl(input.url)
  if (!parsed) throw new CaptureError('Paste a link to a YouTube video or Short, an Instagram post or Reel, or a TikTok video.')
  const handle = (input.creatorHandle ?? parsed.handle)?.replace(/^@/, '').trim().slice(0, 60) || null
  const text = input.text?.trim().slice(0, 2_200) || null
  const hashtags = text ? [...new Set([...text.matchAll(/#([\p{L}\p{N}_]+)/gu)].map((m) => m[1]!.toLowerCase()))] : null
  return {
    platform: parsed.platform,
    externalId: parsed.externalId,
    creatorId: handle ? `handle:${handle.toLowerCase()}` : null,
    creatorName: handle,
    creatorHandle: handle,
    creatorFollowerCount: count(input.creatorFollowers),
    creatorProfileUrl: null,
    creatorAvatarUrl: null,
    url: parsed.canonicalUrl,
    createdAt: input.postedAt && input.postedAt <= now ? input.postedAt : null,
    title: parsed.platform === 'youtube' ? (text?.split('\n')[0]?.slice(0, 200) ?? null) : null,
    caption: text,
    transcript: null,
    durationSeconds: null,
    viewCount: count(input.views),
    likeCount: count(input.likes),
    commentCount: count(input.comments),
    shareCount: null,
    saveCount: null,
    reach: null,
    impressions: null,
    audioId: null,
    audioName: null,
    audioType: null,
    hashtags: hashtags?.length ? hashtags : null,
    thumbnailUrl: null,
    mediaType: null,
    language: null,
    collectedAt: now,
    metricSource: 'manual',
    discoveredVia: 'manual_capture',
    extraMetrics: null,
  }
}

export async function saveCapture(db: Database, input: CaptureInput, now: Date): Promise<string> {
  const item = captureToItem(input, now)
  const ids = await upsertItems(db, item.platform, [item], { origin: 'manual', isOwn: false, runId: null, now, metadataFresh: true })
  return ids.get(item.externalId)!
}

export async function listCaptures(db: Database, limit = 100) {
  return db
    .select({
      id: contentItems.id,
      platform: contentItems.platform,
      url: contentItems.url,
      title: contentItems.title,
      caption: contentItems.caption,
      publishedAt: contentItems.publishedAt,
      views: contentItems.latestViewCount,
      likes: contentItems.latestLikeCount,
      comments: contentItems.latestCommentCount,
      handle: creators.handle,
      capturedAt: contentItems.firstCollectedAt,
    })
    .from(contentItems)
    .leftJoin(creators, eq(creators.id, contentItems.creatorId))
    .where(eq(contentItems.dataOrigin, 'manual'))
    .orderBy(desc(contentItems.firstCollectedAt))
    .limit(limit)
}

export async function deleteCapture(db: Database, id: string): Promise<void> {
  await db.delete(contentItems).where(and(eq(contentItems.id, id), eq(contentItems.dataOrigin, 'manual')))
}
