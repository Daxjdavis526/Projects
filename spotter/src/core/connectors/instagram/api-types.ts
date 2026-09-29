/**
 * Shapes of the Instagram Platform responses we read (developers.facebook.com
 * /documentation/instagram-platform, Graph API v26.0, checked 2026-09-29).
 * All optional: fields are omitted when hidden, unavailable on a login path,
 * or (media_url) when a Reel uses licensed audio.
 */

export interface IgMedia {
  id?: string
  caption?: string
  media_type?: 'IMAGE' | 'VIDEO' | 'CAROUSEL_ALBUM' | string
  /** Facebook Login only. */
  media_product_type?: 'AD' | 'FEED' | 'STORY' | 'REELS' | string
  media_url?: string
  permalink?: string
  thumbnail_url?: string
  timestamp?: string
  like_count?: number
  comments_count?: number
  /** Business Discovery only: Reels views including paid. */
  view_count?: number
  media_audio_type?: 'MUSIC' | 'ORIGINAL_SOUND' | string
  shortcode?: string
  username?: string
  owner?: { id?: string }
}

export interface IgPaged<T> {
  data?: T[]
  paging?: { cursors?: { before?: string; after?: string }; next?: string; previous?: string }
}

export interface IgUser {
  id?: string
  user_id?: string
  username?: string
  name?: string
  account_type?: string
  profile_picture_url?: string
  followers_count?: number
  follows_count?: number
  media_count?: number
  biography?: string
  website?: string
}

export interface IgBusinessDiscovery {
  business_discovery?: IgUser & { media?: IgPaged<IgMedia> }
  id?: string
}

export interface IgInsightValue {
  name?: string
  period?: string
  values?: Array<{ value?: number | Record<string, number>; end_time?: string }>
  total_value?: { value?: number }
}

export interface IgInsightsResponse {
  data?: IgInsightValue[]
}

export interface IgTokenResponse {
  access_token?: string
  token_type?: string
  expires_in?: number
  user_id?: string | number
  permissions?: string | string[]
  data?: Array<{ access_token?: string; user_id?: string | number; permissions?: string | string[] }>
  // Instagram Login's own error shape (not the Graph shape):
  error_type?: string
  code?: number
  error_message?: string
}

export interface FbAccountsResponse {
  data?: Array<{ id?: string; name?: string; instagram_business_account?: { id?: string; username?: string } }>
}

export interface FbPermissionsResponse {
  data?: Array<{ permission?: string; status?: 'granted' | 'declined' | 'expired' | string }>
}
