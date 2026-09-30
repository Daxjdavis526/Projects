/**
 * YouTube API objects → the common ContentItem.
 *
 * Deliberately conservative:
 * - No Shorts flag exists in the Data API, and YouTube's developer policies
 *   forbid inferring a video's content type, so every video is 'video' and
 *   its duration is reported as-is.
 * - Share and save counts, reach and impressions are not public; they stay null.
 * - A hidden like count stays null, not 0.
 */
import type { ContentItem, MetricSource } from '../../domain/types'
import { mergeTags, parseIsoDuration, toCount, toDate, toText } from '../normalize-utils'
import { emptyContentItem } from '../types'
import type { YtChannel, YtThumbnail, YtVideo } from './api-types'

export interface ChannelInfo {
  id: string
  title: string | null
  handle: string | null
  subscriberCount: number | null
  avatarUrl: string | null
  uploadsPlaylistId: string | null
  videoCount: number | null
  viewCount: number | null
}

export function bestThumbnail(thumbnails: Record<string, YtThumbnail> | undefined): string | null {
  if (!thumbnails) return null
  for (const key of ['maxres', 'standard', 'high', 'medium', 'default']) {
    const url = thumbnails[key]?.url
    if (url) return url
  }
  return Object.values(thumbnails).find((t) => t.url)?.url ?? null
}

export function normalizeChannel(channel: YtChannel): ChannelInfo | null {
  if (!channel.id) return null
  const hidden = channel.statistics?.hiddenSubscriberCount === true
  const handle = toText(channel.snippet?.customUrl)
  return {
    id: channel.id,
    title: toText(channel.snippet?.title),
    handle: handle ? (handle.startsWith('@') ? handle : `@${handle}`) : null,
    // Rounded down to three significant figures by YouTube; hidden when the owner hides it.
    subscriberCount: hidden ? null : toCount(channel.statistics?.subscriberCount),
    avatarUrl: bestThumbnail(channel.snippet?.thumbnails),
    uploadsPlaylistId: toText(channel.contentDetails?.relatedPlaylists?.uploads),
    videoCount: toCount(channel.statistics?.videoCount),
    viewCount: toCount(channel.statistics?.viewCount),
  }
}

export function channelUrl(channel: Pick<ChannelInfo, 'id' | 'handle'>): string {
  return channel.handle ? `https://www.youtube.com/${channel.handle}` : `https://www.youtube.com/channel/${channel.id}`
}

export function normalizeVideo(
  video: YtVideo,
  opts: { collectedAt: Date; metricSource: MetricSource; discoveredVia: string | null; channel?: ChannelInfo | null },
): ContentItem | null {
  if (!video.id) return null
  const item = emptyContentItem({ platform: 'youtube', externalId: video.id, collectedAt: opts.collectedAt, metricSource: opts.metricSource })
  const s = video.snippet
  const title = toText(s?.title)
  const description = toText(s?.description)
  item.creatorId = toText(s?.channelId) ?? opts.channel?.id ?? null
  item.creatorName = toText(s?.channelTitle) ?? opts.channel?.title ?? null
  if (opts.channel && opts.channel.id === item.creatorId) {
    item.creatorHandle = opts.channel.handle
    item.creatorFollowerCount = opts.channel.subscriberCount
    item.creatorAvatarUrl = opts.channel.avatarUrl
    item.creatorProfileUrl = channelUrl(opts.channel)
  } else if (item.creatorId) {
    item.creatorProfileUrl = `https://www.youtube.com/channel/${item.creatorId}`
  }
  item.url = `https://www.youtube.com/watch?v=${encodeURIComponent(video.id)}`
  item.createdAt = toDate(s?.publishedAt)
  item.title = title
  item.caption = description
  item.durationSeconds = parseIsoDuration(video.contentDetails?.duration)
  item.viewCount = toCount(video.statistics?.viewCount)
  item.likeCount = toCount(video.statistics?.likeCount)
  item.commentCount = toCount(video.statistics?.commentCount)
  item.hashtags = mergeTags(s?.tags, title, description)
  item.thumbnailUrl = bestThumbnail(s?.thumbnails)
  item.mediaType = 'video'
  item.language = toText(s?.defaultAudioLanguage) ?? toText(s?.defaultLanguage)
  item.discoveredVia = opts.discoveredVia
  return item
}

/** Parse a YouTube Analytics result table into records keyed by column name. */
export function analyticsRows(response: { columnHeaders?: Array<{ name?: string }>; rows?: Array<Array<string | number>> }): Array<Record<string, string | number>> {
  const headers = (response.columnHeaders ?? []).map((h) => h.name ?? '')
  return (response.rows ?? []).map((row) => {
    const record: Record<string, string | number> = {}
    headers.forEach((name, i) => {
      if (name && row[i] !== undefined) record[name] = row[i]!
    })
    return record
  })
}
