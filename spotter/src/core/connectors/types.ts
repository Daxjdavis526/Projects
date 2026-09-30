/**
 * The contract every platform connector implements, real or simulated.
 *
 * Swapping MockYouTubeConnector for YouTubeConnector changes nothing above
 * this interface. Capabilities a platform does not offer are returned as an
 * explicit `unsupported` result rather than thrown or faked, so callers can
 * always tell "no data" apart from "this platform does not provide that".
 */
import type { AppSettings } from '../config/settings'
import type { ConnectorMode, ContentItem, Platform, RateLimitInfo } from '../domain/types'
import type { Logger } from '../observability/logger'

// ---------------------------------------------------------------------------
// Capabilities
// ---------------------------------------------------------------------------

export const CAPABILITY_KEYS = [
  'own_profile',
  'own_content',
  'own_analytics',
  'public_discovery',
  'public_metrics_over_time',
  'creator_sizes',
  'comments',
  'transcripts',
  'audio',
  'shares_saves',
  'token_refresh',
] as const
export type CapabilityKey = (typeof CAPABILITY_KEYS)[number]

export const CAPABILITY_LABEL: Record<CapabilityKey, string> = {
  own_profile: 'Own account profile',
  own_content: 'Own videos & posts',
  own_analytics: 'Own private analytics',
  public_discovery: 'Public trend discovery',
  public_metrics_over_time: 'Public stats over time',
  creator_sizes: 'Other creators’ audience size',
  comments: 'Comment text',
  transcripts: 'Transcripts',
  audio: 'Sounds / audio',
  shares_saves: 'Shares & saves',
  token_refresh: 'Automatic token refresh',
}

/**
 * - available: works now with what is configured and granted.
 * - limited: works, with material restrictions (explained in `summary`).
 * - needs_permission: supported, but a required scope was not granted.
 * - needs_review: supported by the API but requires platform app review/approval first.
 * - not_configured: server credentials for this platform are missing.
 * - not_implemented: the API offers it, but SPOTTER V1 does not use it (said why in `summary`).
 * - unavailable: the official API does not provide this for our use case.
 */
export type CapabilityStatus = 'available' | 'limited' | 'needs_permission' | 'needs_review' | 'not_configured' | 'not_implemented' | 'unavailable'

export interface CapabilityItem {
  key: CapabilityKey
  label: string
  status: CapabilityStatus
  summary: string
  scopes?: string[]
  docs?: string[]
}

export interface CapabilityReport {
  platform: Platform
  connectorId: string
  mode: ConnectorMode
  apiName: string
  /** When the capability statements were last checked against official docs. */
  docsCheckedOn: string
  items: CapabilityItem[]
  notes: string[]
}

export interface CapabilityContext {
  mode: ConnectorMode
  /** Server has the client id/secret (or API key) this connector needs. */
  configured: boolean
  connected: boolean
  grantedScopes: string[]
  /** Connector-specific switches, e.g. { instagramAuthMode, hasApiKey }. */
  options?: Record<string, unknown>
}

// ---------------------------------------------------------------------------
// Results
// ---------------------------------------------------------------------------

export interface Supported<T> {
  status: 'ok'
  data: T
  /** Non-fatal problems: skipped items, missing fields, partial pages. */
  warnings: string[]
  rateLimit?: RateLimitInfo | null
}

export interface Unsupported {
  status: 'unsupported'
  capability: CapabilityKey
  reason: string
}

export type ConnectorResult<T> = Supported<T> | Unsupported

export function ok<T>(data: T, warnings: string[] = [], rateLimit: RateLimitInfo | null = null): Supported<T> {
  return { status: 'ok', data, warnings, rateLimit }
}

export function unsupported(capability: CapabilityKey, reason: string): Unsupported {
  return { status: 'unsupported', capability, reason }
}

// ---------------------------------------------------------------------------
// Auth
// ---------------------------------------------------------------------------

/** Decrypted credentials. Exist only in memory for the duration of a call. */
export interface AccessCredentials {
  accessToken: string
  refreshToken: string | null
  accessTokenExpiresAt: Date | null
  refreshTokenExpiresAt: Date | null
  scopes: string[]
  /** When the current access token was issued or last refreshed. */
  issuedAt: Date | null
}

export interface TokenSet {
  accessToken: string
  /** null = the provider did not issue a new one; keep the existing refresh token. */
  refreshToken: string | null
  accessTokenExpiresAt: Date | null
  refreshTokenExpiresAt: Date | null
  /** null = the provider did not report scopes on this response. */
  scopes: string[] | null
  tokenType: string | null
}

export interface ConnectedAccountInfo {
  externalAccountId: string
  username: string | null
  displayName: string | null
  profileUrl: string | null
  avatarUrl: string | null
  followerCount: number | null
  grantedScopes: string[]
  authVariant: string
  /** Connector-specific identifiers, e.g. { uploadsPlaylistId } or { igUserId, pageId }. */
  metadata: Record<string, unknown>
}

export interface AuthorizationRequest {
  state: string
  redirectUri: string
  /** Present when the flow uses PKCE. */
  codeVerifier: string | null
}

export interface OAuthCompletion {
  tokens: TokenSet
  account: ConnectedAccountInfo
}

export interface OAuthFlow {
  readonly usesPkce: boolean
  readonly requestedScopes: string[]
  readonly authVariant: string
  /** Which server-side settings are missing, if any. */
  missingConfiguration(): string[]
  authorizationUrl(request: AuthorizationRequest): string
  exchangeCode(input: { code: string; redirectUri: string; codeVerifier: string | null; now: Date }): Promise<OAuthCompletion>
  refresh(credentials: AccessCredentials, now: Date): Promise<TokenSet>
  /**
   * Whether the stored token should be refreshed now. Defaults (when absent)
   * to "expires within 10 minutes". Long-lived tokens refresh days ahead.
   */
  refreshDue?(credentials: AccessCredentials, now: Date): boolean
  /** Best-effort revocation at the provider when the user disconnects. */
  revoke?(credentials: AccessCredentials): Promise<void>
}

// ---------------------------------------------------------------------------
// Data
// ---------------------------------------------------------------------------

export interface CreatorProfileData {
  externalAccountId: string
  username: string | null
  displayName: string | null
  profileUrl: string | null
  avatarUrl: string | null
  followerCount: number | null
  followingCount: number | null
  postCount: number | null
  totalViews: number | null
  metadata: Record<string, unknown>
}

/** Owner-only metrics for one of the creator's own items (insights / analytics). */
export interface OwnerItemMetrics {
  externalId: string
  viewCount: number | null
  reach: number | null
  impressions: number | null
  likeCount: number | null
  commentCount: number | null
  shareCount: number | null
  saveCount: number | null
  extra: Record<string, number>
}

export interface AccountSeriesPoint {
  date: string
  metrics: Record<string, number | null>
}

export interface CreatorAnalyticsData {
  items: OwnerItemMetrics[]
  accountSeries: AccountSeriesPoint[]
  notes: string[]
}

export interface DiscoverySource {
  kind: 'search' | 'watchlist' | 'hashtag' | 'business_discovery' | 'simulated'
  value: string
  items: number
  quotaUnits?: number
}

export interface DiscoveryBatch {
  items: ContentItem[]
  sources: DiscoverySource[]
  /** Rotation state to persist for the next run (e.g. which queries ran). */
  cursor: Record<string, unknown> | null
}

export interface HealthCheckResult {
  ok: boolean
  checkedAt: Date
  message: string
  rateLimit?: RateLimitInfo | null
}

// ---------------------------------------------------------------------------
// Context and connector
// ---------------------------------------------------------------------------

/**
 * Daily quota buckets. YouTube meters search.list, videos.batchGetStats and
 * everything else in separate buckets (since June 2026).
 */
export const QUOTA_BUCKETS = ['youtube.units', 'youtube.search', 'youtube.batchGetStats'] as const
export type QuotaBucket = (typeof QUOTA_BUCKETS)[number]

/** Tracks quota for platforms that meter by units per day (YouTube). */
export interface QuotaGate {
  /** Throws a quota_exceeded ConnectorError if `units` would exceed today's budget for the bucket. */
  reserve(bucket: QuotaBucket, units: number, operation: string): Promise<void>
  /** Current usage of every bucket belonging to the platform. */
  snapshot(platform: Platform): Promise<RateLimitInfo | null>
}

export const noQuota: QuotaGate = {
  reserve: async () => {},
  snapshot: async () => null,
}

export interface ConnectorContext {
  now: Date
  logger: Logger
  settings: AppSettings
  credentials: AccessCredentials | null
  account: ConnectedAccountInfo | null
  quota: QuotaGate
  /** Rotation state saved by the previous discovery run. */
  cursor: Record<string, unknown> | null
  signal?: AbortSignal
}

export interface PlatformConnector {
  readonly platform: Platform
  readonly mode: ConnectorMode
  readonly id: string
  readonly auth: OAuthFlow

  capabilities(ctx: CapabilityContext): CapabilityReport
  refreshToken(credentials: AccessCredentials, now: Date): Promise<TokenSet>
  getCreatorProfile(ctx: ConnectorContext): Promise<ConnectorResult<CreatorProfileData>>
  getCreatorContent(ctx: ConnectorContext, options: { since: Date; maxItems: number }): Promise<ConnectorResult<ContentItem[]>>
  getCreatorAnalytics(
    ctx: ConnectorContext,
    options: { items: Array<{ externalId: string; publishedAt: Date | null }>; since: Date },
  ): Promise<ConnectorResult<CreatorAnalyticsData>>
  getPublicDiscoveryCandidates(
    ctx: ConnectorContext,
    options: {
      maxItems: number
      /** Creators (external ids) whose recent posts are wanted as baseline samples. */
      baselineCreators?: string[]
    },
  ): Promise<ConnectorResult<DiscoveryBatch>>
  /** Re-poll public counters of items discovered earlier, to extend their time series. */
  refreshPublicMetrics(ctx: ConnectorContext, externalIds: string[]): Promise<ConnectorResult<ContentItem[]>>
  healthCheck(ctx: ConnectorContext): Promise<HealthCheckResult>
  /** Top public comments on a post, where the platform exposes them. Used as AI input only, never stored. */
  getTopComments?(ctx: ConnectorContext, externalId: string, limit?: number): Promise<ConnectorResult<string[]>>
}

/** Build a ContentItem with every optional field explicitly null. */
export function emptyContentItem(
  base: Pick<ContentItem, 'platform' | 'externalId' | 'collectedAt' | 'metricSource'>,
): ContentItem {
  return {
    ...base,
    creatorId: null,
    creatorName: null,
    creatorHandle: null,
    creatorFollowerCount: null,
    creatorProfileUrl: null,
    creatorAvatarUrl: null,
    url: null,
    createdAt: null,
    title: null,
    caption: null,
    transcript: null,
    durationSeconds: null,
    viewCount: null,
    likeCount: null,
    commentCount: null,
    shareCount: null,
    saveCount: null,
    reach: null,
    impressions: null,
    audioId: null,
    audioName: null,
    audioType: null,
    hashtags: null,
    thumbnailUrl: null,
    mediaType: null,
    language: null,
    discoveredVia: null,
    extraMetrics: null,
  }
}
