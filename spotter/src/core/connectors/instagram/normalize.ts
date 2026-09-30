/**
 * Instagram media → ContentItem.
 *
 * - Instagram posts have no titles; the caption carries the hook.
 * - Views: the media object has none for your own posts (they come from
 *   insights); Business Discovery returns `view_count` for Reels, which
 *   includes paid views — recorded in extraMetrics so it is never mistaken
 *   for organic reach.
 * - Hashtag results never include the author, so creator fields stay null.
 * - media_url is optional (omitted for video with copyrighted or licensed
 *   audio, copyright-flagged media, and others' Reels with downloads off);
 *   the thumbnail falls back accordingly.
 */
import type { ContentItem, MediaType, MetricSource } from '../../domain/types'
import { extractHashtags, toCount, toDate, toText } from '../normalize-utils'
import { emptyContentItem } from '../types'
import type { IgMedia } from './api-types'

export interface IgOwner {
  id: string | null
  username: string | null
  name: string | null
  followers: number | null
  avatarUrl: string | null
}

export function mediaTypeOf(m: IgMedia): MediaType {
  if (m.media_product_type === 'REELS') return 'reel'
  if (m.media_product_type === 'STORY') return 'story'
  if (m.media_type === 'CAROUSEL_ALBUM') return 'carousel'
  if (m.media_type === 'IMAGE') return 'image'
  if (m.media_type === 'VIDEO') return 'video'
  return 'unknown'
}

export function normalizeMedia(
  m: IgMedia,
  opts: { collectedAt: Date; metricSource: MetricSource; discoveredVia: string | null; owner?: IgOwner | null },
): ContentItem | null {
  if (!m.id) return null
  const item = emptyContentItem({ platform: 'instagram', externalId: m.id, collectedAt: opts.collectedAt, metricSource: opts.metricSource })
  const caption = toText(m.caption)
  const username = toText(m.username) ?? opts.owner?.username ?? null
  item.creatorId = opts.owner?.id ?? null
  item.creatorHandle = username
  item.creatorName = opts.owner?.name ?? username
  item.creatorFollowerCount = opts.owner?.followers ?? null
  item.creatorAvatarUrl = opts.owner?.avatarUrl ?? null
  item.creatorProfileUrl = username ? `https://www.instagram.com/${encodeURIComponent(username)}/` : null
  item.url = toText(m.permalink)
  item.createdAt = toDate(m.timestamp)
  item.caption = caption
  item.likeCount = toCount(m.like_count)
  item.commentCount = toCount(m.comments_count)
  const views = toCount(m.view_count)
  if (views !== null) {
    item.viewCount = views
    item.extraMetrics = { viewCountIncludesPaid: 1 }
  }
  item.hashtags = extractHashtags(caption)
  item.mediaType = mediaTypeOf(m)
  item.thumbnailUrl = toText(m.thumbnail_url) ?? (m.media_type === 'IMAGE' ? toText(m.media_url) : null)
  item.audioType = m.media_audio_type === 'MUSIC' ? 'music' : m.media_audio_type === 'ORIGINAL_SOUND' ? 'original_sound' : null
  item.discoveredVia = opts.discoveredVia
  return item
}

/** Read one numeric metric from an insights response (lifetime value). */
export function insightValue(data: Array<{ name?: string; values?: Array<{ value?: unknown }>; total_value?: { value?: unknown } }> | undefined, name: string): number | null {
  const entry = data?.find((d) => d.name === name)
  if (!entry) return null
  const direct = entry.total_value?.value ?? entry.values?.[entry.values.length - 1]?.value
  return typeof direct === 'number' && Number.isFinite(direct) ? direct : null
}
