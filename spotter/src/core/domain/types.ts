/**
 * Domain vocabulary shared by connectors, the analytics engine, the database
 * and the UI. Nothing in here depends on a framework.
 */

export const PLATFORMS = ['youtube', 'instagram', 'tiktok'] as const
export type Platform = (typeof PLATFORMS)[number]

export const PLATFORM_LABEL: Record<Platform, string> = {
  youtube: 'YouTube',
  instagram: 'Instagram',
  tiktok: 'TikTok',
}

/** Which implementation backs a connection. */
export type ConnectorMode = 'mock' | 'live'
/** Which world the workspace is looking at. */
export type DataMode = 'demo' | 'live'
/** Where a stored row came from. 'manual' = captured by the user, see assisted discovery. */
export type DataOrigin = 'demo' | 'live' | 'manual'
/**
 * Where a metric value came from. A snapshot of the creator's own post can
 * combine the public counters and the owner insights read in the same run
 * (same moment); it is then marked `owner_insights`, and where both report
 * the same metric the public counter is kept. Demo rows are told apart by
 * their data origin, not by this field.
 */
export type MetricSource = 'public_api' | 'owner_insights' | 'manual'
export type MediaType = 'video' | 'short' | 'reel' | 'image' | 'carousel' | 'story' | 'unknown'
export type ContentAvailability = 'available' | 'deleted' | 'private' | 'unavailable'
export type AudioType = 'music' | 'original_sound'

export const TREND_STAGES = ['emerging', 'accelerating', 'mature', 'declining'] as const
export type TrendStage = (typeof TREND_STAGES)[number]

/**
 * The common internal representation of a post, video, Short or Reel.
 *
 * Every platform-provided field is nullable: `null` means "the platform did
 * not give us this", which is different from zero. Connectors must never
 * substitute a guessed value for a missing one.
 */
export interface ContentItem {
  platform: Platform
  externalId: string
  creatorId: string | null
  creatorName: string | null
  creatorHandle: string | null
  creatorFollowerCount: number | null
  creatorProfileUrl: string | null
  creatorAvatarUrl: string | null
  url: string | null
  createdAt: Date | null
  title: string | null
  caption: string | null
  transcript: string | null
  durationSeconds: number | null
  viewCount: number | null
  likeCount: number | null
  commentCount: number | null
  shareCount: number | null
  saveCount: number | null
  reach: number | null
  impressions: number | null
  audioId: string | null
  audioName: string | null
  /** Instagram exposes only whether a Reel uses licensed music or original sound, not the track. */
  audioType: AudioType | null
  hashtags: string[] | null
  thumbnailUrl: string | null
  mediaType: MediaType | null
  language: string | null
  /** Set by the collector, never by the platform. */
  collectedAt: Date
  metricSource: MetricSource
  discoveredVia: string | null
  /** Additional numeric metrics a platform exposes (e.g. average watch time). */
  extraMetrics: Record<string, number> | null
}

/** A creator/account as observed on a platform. */
export interface CreatorRef {
  platform: Platform
  externalId: string
  handle: string | null
  displayName: string | null
  followerCount: number | null
  profileUrl: string | null
  avatarUrl: string | null
}

// ---------------------------------------------------------------------------
// Scoring
// ---------------------------------------------------------------------------

export const TREND_COMPONENT_KEYS = [
  'velocity',
  'outperformance',
  'repetition',
  'engagement',
  'recency',
  'acceleration',
] as const
export type TrendComponentKey = (typeof TREND_COMPONENT_KEYS)[number]

export const FIT_COMPONENT_KEYS = ['topic', 'format', 'style', 'niche', 'length', 'platform'] as const
export type FitComponentKey = (typeof FIT_COMPONENT_KEYS)[number]

/**
 * One inspectable part of a score. `score` is 0–100, or null when the inputs
 * it needs are not available (its weight is then redistributed and the
 * component is shown as unavailable rather than silently counted as zero).
 */
export interface ScoreComponent {
  score: number | null
  weight: number
  /** The raw inputs, so the UI can show how the number was reached. */
  inputs: Record<string, number | string | null>
  explanation: string
}

export type TrendComponents = Record<TrendComponentKey, ScoreComponent>
export type FitComponents = Record<FitComponentKey, ScoreComponent>

export interface TrendMetrics {
  itemCount: number
  creatorCount: number
  platformCounts: Partial<Record<Platform, number>>
  totalViews: number | null
  /** Current combined views per hour across the cluster's tracked items. */
  viewsPerHour: number | null
  /** Current combined engagements (likes + comments + shares + saves) per hour. */
  engagementPerHour: number | null
  medianEngagementRate: number | null
  /** Median of per-item views ÷ that creator's age-adjusted baseline. */
  medianOutperformance: number | null
  maxOutperformance: number | null
  /** Distinct creators with at least one item ≥ 3× their baseline. */
  outperformingCreators: number
  medianAgeHours: number | null
  /**
   * Momentum growth per day: performance-weighted posts in the last 3 days
   * versus the 3 days before (see core/analytics/scoring.ts). >1 = speeding up.
   */
  accelerationRatio: number | null
  /** Posts published in the last 72 hours, and in the 72 hours before that. */
  postsLast72h: number
  postsPrev72h: number
  /** The same two windows, each post weighted by its outperformance (capped 0.25–4×). */
  momentum: number
  momentumPrior: number
  /** Highest 72-hour momentum over the trend's last ten days. */
  momentumPeak: number
  /** Views gained in the last 12h ÷ the same 12h yesterday, on the same posts (context only). */
  viewsPerHourChange: number | null
  /** Share of items with ≥ 2 snapshots (needed for real velocity). */
  snapshotCoverage: number
  /** Share of expected metric fields actually present. */
  metricCompleteness: number
}

export interface PatternCount {
  value: string
  count: number
  example?: string | null
}

/** Recurring elements across a cluster. `audio` is null when no connector exposes audio. */
export interface ClusterPattern {
  formats: PatternCount[]
  hookTypes: PatternCount[]
  hooks: PatternCount[]
  styles: PatternCount[]
  audiences: PatternCount[]
  hashtags: PatternCount[]
  exercises: PatternCount[]
  audio: PatternCount[] | null
}

export interface RecommendationBeat {
  startSec: number
  endSec: number
  label: string
  direction: string
}

export interface EvidenceExample {
  contentItemId: string
  platform: Platform
  url: string | null
  title: string | null
  creatorName: string | null
  creatorFollowerCount: number | null
  views: number | null
  viewsPerHour: number | null
  outperformance: number | null
  publishedAt: string | null
  dataOrigin: DataOrigin
}

export interface RecommendationEvidence {
  itemCount: number
  creatorCount: number
  platforms: Platform[]
  outperformingCreators: number
  summaryLines: string[]
  examples: EvidenceExample[]
  /** The creator's own earlier post on this theme, if any. */
  ownPriorPost: { contentItemId: string; title: string | null; lift: number | null; publishedAt: string | null } | null
}

// ---------------------------------------------------------------------------
// Operations
// ---------------------------------------------------------------------------

export type StepStatus = 'ok' | 'unsupported' | 'failed' | 'skipped'

export interface PlatformStepResult {
  name: string
  status: StepStatus
  items?: number
  detail?: string
  errorKind?: string
}

export interface PlatformRunResult {
  status: 'succeeded' | 'partial' | 'failed' | 'skipped'
  startedAt: string
  finishedAt: string
  itemsUpserted: number
  snapshotsWritten: number
  steps: PlatformStepResult[]
  error?: { kind: string; message: string }
}

export interface CollectionStep {
  name: string
  status: StepStatus
  startedAt: string
  finishedAt: string
  detail?: string
  counts?: Record<string, number>
}

/** Whatever a platform tells us about our remaining allowance. */
export interface RateLimitInfo {
  kind: 'quota_units' | 'usage_percent' | 'requests_per_window' | 'unknown'
  used?: number | null
  limit?: number | null
  remaining?: number | null
  resetAt?: string | null
  windowLabel?: string | null
  observedAt: string
  note?: string | null
}
