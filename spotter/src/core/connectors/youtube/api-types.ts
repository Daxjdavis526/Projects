/**
 * Shapes of the YouTube API responses we read, from the official resource
 * representations (developers.google.com/youtube/v3/docs, checked
 * 2026-09-29). Everything is optional: the normaliser must survive fields
 * that are absent, hidden or renamed.
 */

export interface YtThumbnail {
  url?: string
  width?: number
  height?: number
}

export interface YtVideo {
  kind?: string
  id?: string
  snippet?: {
    publishedAt?: string
    channelId?: string
    title?: string
    description?: string
    thumbnails?: Record<string, YtThumbnail>
    channelTitle?: string
    tags?: string[]
    categoryId?: string
    liveBroadcastContent?: string
    defaultLanguage?: string
    defaultAudioLanguage?: string
  }
  contentDetails?: { duration?: string; durationMillis?: number | string }
  status?: { privacyStatus?: string; publicStatsViewable?: boolean; madeForKids?: boolean }
  /** Counts are documented as strings in videos.list and unsigned longs in batchGetStats. */
  statistics?: { viewCount?: string | number; likeCount?: string | number; commentCount?: string | number }
}

export interface YtListResponse<T> {
  kind?: string
  nextPageToken?: string
  pageInfo?: { totalResults?: number; resultsPerPage?: number }
  items?: T[]
}

export interface YtSearchResult {
  id?: { kind?: string; videoId?: string; channelId?: string }
  snippet?: YtVideo['snippet']
}

export interface YtChannel {
  id?: string
  snippet?: { title?: string; description?: string; customUrl?: string; publishedAt?: string; thumbnails?: Record<string, YtThumbnail>; country?: string }
  contentDetails?: { relatedPlaylists?: { uploads?: string } }
  statistics?: { viewCount?: string | number; subscriberCount?: string | number; hiddenSubscriberCount?: boolean; videoCount?: string | number }
}

export interface YtPlaylistItem {
  snippet?: { publishedAt?: string; resourceId?: { videoId?: string } }
  contentDetails?: { videoId?: string; videoPublishedAt?: string }
  status?: { privacyStatus?: string }
}

export interface YtBatchStatsResponse {
  kind?: string
  items?: Array<{
    id?: string
    snippet?: { publishTime?: string }
    statistics?: { viewCount?: string | number; likeCount?: string | number; commentCount?: string | number }
    contentDetails?: { duration?: string; durationMillis?: string | number }
  }>
  summary?: { requestedVideoCount?: number; succeededVideoCount?: number; failedVideoCount?: number; failedVideoIds?: string[] }
}

export interface YtAnalyticsResponse {
  kind?: string
  columnHeaders?: Array<{ name?: string; columnType?: string; dataType?: string }>
  rows?: Array<Array<string | number>>
}

export interface YtCommentThread {
  snippet?: { topLevelComment?: { snippet?: { textOriginal?: string; textDisplay?: string; likeCount?: number } } }
}

export interface GoogleTokenResponse {
  access_token?: string
  expires_in?: number
  refresh_token?: string
  refresh_token_expires_in?: number
  scope?: string
  token_type?: string
  error?: string
  error_description?: string
}
