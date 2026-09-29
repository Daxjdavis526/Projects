/**
 * SPOTTER database schema (PostgreSQL, via Drizzle ORM).
 *
 * Conventions:
 * - Every platform metric column is nullable. Platforms expose different
 *   data, and "not exposed" must stay distinguishable from zero.
 * - Metrics are stored as time series in `content_metric_snapshots`; the
 *   `latest_*` columns on `content_items` are a denormalised copy of the
 *   newest snapshot for fast listing, never the only copy.
 * - `data_origin` / `data_mode` separate simulated demo data from live data
 *   so the two are never silently mixed.
 * - Secrets (OAuth tokens, PKCE verifiers) are only ever stored encrypted
 *   (`*_enc` columns, AES-256-GCM; see core/security/crypto.ts).
 *
 * Migrations are generated from this file with `npm run db:generate` and
 * live, reviewed and committed, in ./drizzle.
 */
import { sql } from 'drizzle-orm'
import {
  bigint,
  bigserial,
  boolean,
  check,
  doublePrecision,
  index,
  integer,
  jsonb,
  pgTable,
  primaryKey,
  real,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from 'drizzle-orm/pg-core'
import type {
  AudioType,
  ClusterPattern,
  CollectionStep,
  ConnectorMode,
  ContentAvailability,
  DataMode,
  DataOrigin,
  FitComponents,
  MediaType,
  MetricSource,
  Platform,
  PlatformRunResult,
  RateLimitInfo,
  RecommendationBeat,
  RecommendationEvidence,
  TrendComponents,
  TrendMetrics,
  TrendStage,
} from '../domain/types'
import type { AppSettings } from '../config/settings'

const ts = (name: string) => timestamp(name, { withTimezone: true, mode: 'date' })
const count = (name: string) => bigint(name, { mode: 'number' })
const createdAt = () => ts('created_at').notNull().defaultNow()
const updatedAt = () => ts('updated_at').notNull().defaultNow()

const PLATFORM_CHECK = sql`platform in ('youtube', 'instagram', 'tiktok')`

// ---------------------------------------------------------------------------
// Accounts and sessions
// ---------------------------------------------------------------------------

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  /** Always stored lower-cased; see core/auth. */
  email: text('email').notNull().unique(),
  displayName: text('display_name').notNull(),
  passwordHash: text('password_hash').notNull(),
  lastLoginAt: ts('last_login_at'),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
})

export const sessions = pgTable(
  'sessions',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    /** SHA-256 of the cookie value. The raw token is never stored. */
    tokenHash: text('token_hash').notNull().unique(),
    userAgent: text('user_agent'),
    expiresAt: ts('expires_at').notNull(),
    lastSeenAt: ts('last_seen_at').notNull().defaultNow(),
    createdAt: createdAt(),
  },
  (t) => [index('sessions_user_idx').on(t.userId)],
)

/** The creator this workspace serves: niche, timezone, settings, data mode. */
export const creatorProfiles = pgTable(
  'creator_profiles',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .unique()
      .references(() => users.id, { onDelete: 'cascade' }),
    displayName: text('display_name').notNull(),
    niche: text('niche').notNull().default('Fitness / Bodybuilding / Strength Training'),
    timezone: text('timezone').notNull().default('UTC'),
    /** 'demo' shows the simulated world; 'live' uses real connectors only. */
    dataMode: text('data_mode').$type<DataMode>().notNull().default('demo'),
    settings: jsonb('settings').$type<AppSettings>().notNull(),
    setupStep: integer('setup_step').notNull().default(1),
    setupCompletedAt: ts('setup_completed_at'),
    /** Anchor time and seed of the deterministic demo world (see core/demo). */
    demoAnchorAt: ts('demo_anchor_at'),
    demoSeed: integer('demo_seed'),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [check('creator_profiles_data_mode_check', sql`${t.dataMode} in ('demo', 'live')`)],
)

// ---------------------------------------------------------------------------
// Platform connections and credentials
// ---------------------------------------------------------------------------

export const platformAccounts = pgTable(
  'platform_accounts',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    creatorProfileId: uuid('creator_profile_id')
      .notNull()
      .references(() => creatorProfiles.id, { onDelete: 'cascade' }),
    platform: text('platform').$type<Platform>().notNull(),
    /** 'mock' = simulated demo connector, 'live' = the real platform API. */
    mode: text('mode').$type<ConnectorMode>().notNull(),
    /** Which auth product was used, e.g. google_oauth, instagram_login, facebook_login, tiktok_login_kit. */
    authVariant: text('auth_variant'),
    externalAccountId: text('external_account_id'),
    username: text('username'),
    displayName: text('display_name'),
    profileUrl: text('profile_url'),
    avatarUrl: text('avatar_url'),
    followerCount: count('follower_count'),
    /** Scopes the platform reports as actually granted (not merely requested). */
    grantedScopes: text('granted_scopes').array().notNull().default(sql`'{}'::text[]`),
    status: text('status')
      .$type<'connected' | 'needs_reauth' | 'disconnected' | 'error'>()
      .notNull()
      .default('connected'),
    connectedAt: ts('connected_at').notNull().defaultNow(),
    lastSyncAt: ts('last_sync_at'),
    disconnectedAt: ts('disconnected_at'),
    metadata: jsonb('metadata').$type<Record<string, unknown>>().notNull().default({}),
    /** Discovery rotation state saved between runs (query index, hashtag budget, ...). */
    discoveryCursor: jsonb('discovery_cursor').$type<Record<string, unknown>>(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [
    uniqueIndex('platform_accounts_profile_platform_mode_key').on(t.creatorProfileId, t.platform, t.mode),
    check('platform_accounts_platform_check', PLATFORM_CHECK),
    check('platform_accounts_mode_check', sql`${t.mode} in ('mock', 'live')`),
  ],
)

export const oauthCredentials = pgTable('oauth_credentials', {
  id: uuid('id').primaryKey().defaultRandom(),
  platformAccountId: uuid('platform_account_id')
    .notNull()
    .unique()
    .references(() => platformAccounts.id, { onDelete: 'cascade' }),
  accessTokenEnc: text('access_token_enc').notNull(),
  refreshTokenEnc: text('refresh_token_enc'),
  tokenType: text('token_type'),
  /** Raw scope string as returned by the token endpoint. */
  scope: text('scope'),
  accessTokenExpiresAt: ts('access_token_expires_at'),
  refreshTokenExpiresAt: ts('refresh_token_expires_at'),
  lastRefreshedAt: ts('last_refreshed_at'),
  refreshFailures: integer('refresh_failures').notNull().default(0),
  lastRefreshError: text('last_refresh_error'),
  /** Identifies the encryption key used, so key rotation can be detected. */
  encryptionKeyId: text('encryption_key_id').notNull(),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
})

/** Pending OAuth authorisations: CSRF state and PKCE verifier, single use. */
export const oauthStates = pgTable('oauth_states', {
  id: uuid('id').primaryKey().defaultRandom(),
  stateHash: text('state_hash').notNull().unique(),
  platform: text('platform').$type<Platform>().notNull(),
  mode: text('mode').$type<ConnectorMode>().notNull(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  creatorProfileId: uuid('creator_profile_id')
    .notNull()
    .references(() => creatorProfiles.id, { onDelete: 'cascade' }),
  codeVerifierEnc: text('code_verifier_enc'),
  redirectUri: text('redirect_uri').notNull(),
  returnTo: text('return_to'),
  authVariant: text('auth_variant'),
  expiresAt: ts('expires_at').notNull(),
  consumedAt: ts('consumed_at'),
  createdAt: createdAt(),
})

// ---------------------------------------------------------------------------
// Content and its metrics over time
// ---------------------------------------------------------------------------

/** Any account whose content we have seen: the creator's own accounts and third parties. */
export const creators = pgTable(
  'creators',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    platform: text('platform').$type<Platform>().notNull(),
    dataOrigin: text('data_origin').$type<DataOrigin>().notNull(),
    externalId: text('external_id').notNull(),
    handle: text('handle'),
    displayName: text('display_name'),
    profileUrl: text('profile_url'),
    avatarUrl: text('avatar_url'),
    followerCount: count('follower_count'),
    followerCountObservedAt: ts('follower_count_observed_at'),
    isOwn: boolean('is_own').notNull().default(false),
    platformAccountId: uuid('platform_account_id').references(() => platformAccounts.id, {
      onDelete: 'set null',
    }),
    firstSeenAt: ts('first_seen_at').notNull().defaultNow(),
    lastSeenAt: ts('last_seen_at').notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex('creators_platform_origin_external_key').on(t.platform, t.dataOrigin, t.externalId),
    check('creators_platform_check', PLATFORM_CHECK),
  ],
)

export const contentItems = pgTable(
  'content_items',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    platform: text('platform').$type<Platform>().notNull(),
    dataOrigin: text('data_origin').$type<DataOrigin>().notNull(),
    externalId: text('external_id').notNull(),
    creatorId: uuid('creator_id').references(() => creators.id, { onDelete: 'set null' }),
    isOwn: boolean('is_own').notNull().default(false),
    url: text('url'),
    publishedAt: ts('published_at'),
    title: text('title'),
    caption: text('caption'),
    transcript: text('transcript'),
    durationSeconds: integer('duration_seconds'),
    mediaType: text('media_type').$type<MediaType>(),
    /** null = the platform did not tell us; [] = it told us there are none. */
    hashtags: text('hashtags').array(),
    audioId: text('audio_id'),
    audioName: text('audio_name'),
    audioType: text('audio_type').$type<AudioType>(),
    thumbnailUrl: text('thumbnail_url'),
    language: text('language'),
    /** How we found it: own_content, search:<query>, watchlist:<id>, hashtag:<tag>, manual_capture. */
    discoveredVia: text('discovered_via'),
    availability: text('availability').$type<ContentAvailability>().notNull().default('available'),
    availabilityCheckedAt: ts('availability_checked_at'),
    /** Hash of the text the AI layer analyses; a change triggers re-analysis. */
    contentHash: text('content_hash'),
    firstCollectedAt: ts('first_collected_at').notNull(),
    lastCollectedAt: ts('last_collected_at').notNull(),
    /** Last time title/caption/metadata (not just counts) were re-read from the platform. */
    metadataRefreshedAt: ts('metadata_refreshed_at').notNull(),
    latestSnapshotAt: ts('latest_snapshot_at'),
    latestViewCount: count('latest_view_count'),
    latestLikeCount: count('latest_like_count'),
    latestCommentCount: count('latest_comment_count'),
    latestShareCount: count('latest_share_count'),
    latestSaveCount: count('latest_save_count'),
    latestReach: count('latest_reach'),
    latestImpressions: count('latest_impressions'),
    /**
     * Own posts only: views ÷ what this creator normally gets on the platform by
     * the same age (set by the personalisation stage; null until 36h old).
     */
    ownLift: real('own_lift'),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [
    uniqueIndex('content_items_platform_origin_external_key').on(t.platform, t.dataOrigin, t.externalId),
    index('content_items_origin_own_published_idx').on(t.dataOrigin, t.isOwn, t.publishedAt),
    index('content_items_creator_idx').on(t.creatorId),
    check('content_items_platform_check', PLATFORM_CHECK),
  ],
)

export const contentMetricSnapshots = pgTable(
  'content_metric_snapshots',
  {
    id: bigserial('id', { mode: 'number' }).primaryKey(),
    contentItemId: uuid('content_item_id')
      .notNull()
      .references(() => contentItems.id, { onDelete: 'cascade' }),
    collectedAt: ts('collected_at').notNull(),
    collectionRunId: uuid('collection_run_id').references(() => collectionRuns.id, { onDelete: 'set null' }),
    viewCount: count('view_count'),
    likeCount: count('like_count'),
    commentCount: count('comment_count'),
    shareCount: count('share_count'),
    saveCount: count('save_count'),
    reach: count('reach'),
    impressions: count('impressions'),
    creatorFollowerCount: count('creator_follower_count'),
    source: text('source').$type<MetricSource>().notNull(),
    /** Platform-specific extras (watch time, avg view duration, ...). */
    extra: jsonb('extra').$type<Record<string, number>>(),
  },
  (t) => [index('content_metric_snapshots_item_time_idx').on(t.contentItemId, t.collectedAt)],
)

/** Robust rolling performance baseline for a creator (see analytics/baseline.ts). */
export const creatorBaselines = pgTable('creator_baselines', {
  creatorId: uuid('creator_id')
    .primaryKey()
    .references(() => creators.id, { onDelete: 'cascade' }),
  computedAt: ts('computed_at').notNull(),
  method: text('method').notNull(),
  sampleSize: integer('sample_size').notNull(),
  windowDays: integer('window_days').notNull(),
  sufficient: boolean('sufficient').notNull(),
  medianViews: doublePrecision('median_views'),
  madLogViews: doublePrecision('mad_log_views'),
  p25Views: doublePrecision('p25_views'),
  p75Views: doublePrecision('p75_views'),
  medianEngagementRate: doublePrecision('median_engagement_rate'),
  medianViewsPerFollower: doublePrecision('median_views_per_follower'),
})

// ---------------------------------------------------------------------------
// AI layer
// ---------------------------------------------------------------------------

export const aiAnalysis = pgTable(
  'ai_analysis',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    contentItemId: uuid('content_item_id')
      .notNull()
      .unique()
      .references(() => contentItems.id, { onDelete: 'cascade' }),
    provider: text('provider').notNull(),
    model: text('model').notNull(),
    promptVersion: text('prompt_version').notNull(),
    inputHash: text('input_hash').notNull(),
    status: text('status').$type<'succeeded' | 'failed'>().notNull(),
    topic: text('topic'),
    topicKey: text('topic_key'),
    format: text('format'),
    hook: text('hook'),
    hookType: text('hook_type'),
    style: text('style'),
    targetAudience: text('target_audience'),
    controversy: real('controversy'),
    exercises: text('exercises').array(),
    keywords: text('keywords').array(),
    summary: text('summary'),
    confidence: real('confidence'),
    nicheRelevance: real('niche_relevance'),
    error: text('error'),
    attempts: integer('attempts').notNull().default(1),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [index('ai_analysis_topic_key_idx').on(t.topicKey)],
)

export const contentEmbeddings = pgTable('content_embeddings', {
  contentItemId: uuid('content_item_id')
    .primaryKey()
    .references(() => contentItems.id, { onDelete: 'cascade' }),
  provider: text('provider').notNull(),
  model: text('model').notNull(),
  dims: integer('dims').notNull(),
  vector: real('vector').array().notNull(),
  inputHash: text('input_hash').notNull(),
  createdAt: createdAt(),
})

// ---------------------------------------------------------------------------
// Trends
// ---------------------------------------------------------------------------

export const trendClusters = pgTable(
  'trend_clusters',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    creatorProfileId: uuid('creator_profile_id')
      .notNull()
      .references(() => creatorProfiles.id, { onDelete: 'cascade' }),
    dataMode: text('data_mode').$type<DataMode>().notNull(),
    label: text('label').notNull(),
    /** Item count when the label was last written; the trend is renamed once it doubles. */
    labelItemCount: integer('label_item_count').notNull().default(0),
    topicKey: text('topic_key'),
    summary: text('summary'),
    status: text('status').$type<'active' | 'dormant' | 'merged'>().notNull().default('active'),
    mergedIntoId: uuid('merged_into_id'),
    /** Mean of member embeddings, L2-normalised; only comparable within embeddingModel. */
    centroid: real('centroid').array().notNull(),
    embeddingModel: text('embedding_model').notNull(),
    firstDetectedAt: ts('first_detected_at').notNull(),
    lastActivityAt: ts('last_activity_at').notNull(),
    stage: text('stage').$type<TrendStage>(),
    stageBasis: text('stage_basis'),
    platforms: text('platforms').array().$type<Platform[]>().notNull().default(sql`'{}'::text[]`),
    itemCount: integer('item_count').notNull().default(0),
    creatorCount: integer('creator_count').notNull().default(0),
    isBreakout: boolean('is_breakout').notNull().default(false),
    keywords: text('keywords').array().notNull().default(sql`'{}'::text[]`),
    patterns: jsonb('patterns').$type<ClusterPattern>(),
    explanation: text('explanation'),
    explanationBy: text('explanation_by'),
    latestTrendScore: real('latest_trend_score'),
    latestConfidence: real('latest_confidence'),
    latestFitScore: real('latest_fit_score'),
    /** The Creator Fit breakdown behind latestFitScore, so any trend can show why it does or does not suit. */
    latestFitComponents: jsonb('latest_fit_components').$type<FitComponents>(),
    latestOpportunityScore: real('latest_opportunity_score'),
    latestScoredAt: ts('latest_scored_at'),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [
    index('trend_clusters_profile_mode_status_idx').on(t.creatorProfileId, t.dataMode, t.status),
    check('trend_clusters_data_mode_check', sql`${t.dataMode} in ('demo', 'live')`),
  ],
)

export const trendClusterMembers = pgTable(
  'trend_cluster_members',
  {
    clusterId: uuid('cluster_id')
      .notNull()
      .references(() => trendClusters.id, { onDelete: 'cascade' }),
    contentItemId: uuid('content_item_id')
      .notNull()
      .references(() => contentItems.id, { onDelete: 'cascade' }),
    similarity: real('similarity').notNull(),
    assignedAt: ts('assigned_at').notNull(),
    /** As of the latest scoring run: views ÷ what the creator normally gets by that age, and current views/hour. */
    outperformance: real('outperformance'),
    outperformanceMethod: text('outperformance_method'),
    viewsPerHour: real('views_per_hour'),
  },
  (t) => [
    primaryKey({ columns: [t.clusterId, t.contentItemId] }),
    index('trend_cluster_members_item_idx').on(t.contentItemId),
  ],
)

/** One row per cluster per analysis run: the trend's history. */
export const trendScores = pgTable(
  'trend_scores',
  {
    id: bigserial('id', { mode: 'number' }).primaryKey(),
    clusterId: uuid('cluster_id')
      .notNull()
      .references(() => trendClusters.id, { onDelete: 'cascade' }),
    collectionRunId: uuid('collection_run_id').references(() => collectionRuns.id, { onDelete: 'set null' }),
    computedAt: ts('computed_at').notNull(),
    trendScore: real('trend_score').notNull(),
    components: jsonb('components').$type<TrendComponents>().notNull(),
    weights: jsonb('weights').$type<Record<string, number>>().notNull(),
    confidence: real('confidence').notNull(),
    stage: text('stage').$type<TrendStage>().notNull(),
    metrics: jsonb('metrics').$type<TrendMetrics>().notNull(),
  },
  (t) => [index('trend_scores_cluster_time_idx').on(t.clusterId, t.computedAt)],
)

export const recommendations = pgTable(
  'recommendations',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    creatorProfileId: uuid('creator_profile_id')
      .notNull()
      .references(() => creatorProfiles.id, { onDelete: 'cascade' }),
    dataMode: text('data_mode').$type<DataMode>().notNull(),
    /** All recommendations produced by one refresh share a batch id. */
    batchId: uuid('batch_id').notNull(),
    /** 'batch' = part of a scheduled refresh; 'on_demand' = a brief the creator asked for on a trend page. */
    source: text('source').$type<'batch' | 'on_demand'>().notNull().default('batch'),
    clusterId: uuid('cluster_id').references(() => trendClusters.id, { onDelete: 'set null' }),
    rank: integer('rank').notNull(),
    opportunityScore: real('opportunity_score').notNull(),
    trendScore: real('trend_score').notNull(),
    creatorFitScore: real('creator_fit_score').notNull(),
    confidence: real('confidence').notNull(),
    stage: text('stage').$type<TrendStage>().notNull(),
    trendLabel: text('trend_label').notNull(),
    oneLiner: text('one_liner').notNull(),
    whyItMatters: text('why_it_matters').notNull(),
    suggestedAngle: text('suggested_angle').notNull(),
    suggestedHook: text('suggested_hook').notNull(),
    titleConcept: text('title_concept').notNull(),
    captionConcept: text('caption_concept'),
    structure: jsonb('structure').$type<RecommendationBeat[]>().notNull(),
    alternativeAngles: jsonb('alternative_angles').$type<string[]>().notNull().default([]),
    evidence: jsonb('evidence').$type<RecommendationEvidence>().notNull(),
    fitComponents: jsonb('fit_components').$type<FitComponents>().notNull(),
    generatedBy: text('generated_by').notNull(),
    promptVersion: text('prompt_version').notNull(),
    generationNote: text('generation_note'),
    status: text('status').$type<'new' | 'saved' | 'dismissed' | 'used'>().notNull().default('new'),
    createdAt: createdAt(),
  },
  (t) => [index('recommendations_profile_mode_created_idx').on(t.creatorProfileId, t.dataMode, t.createdAt)],
)

/**
 * Account-level daily metrics from the platforms' own analytics (YouTube
 * Analytics views/watch time/subscribers, Instagram reach). Owner data of
 * the connected account only; one row per account per day, last write wins
 * (the platforms revise recent days).
 */
export const accountMetricDays = pgTable(
  'account_metric_days',
  {
    platformAccountId: uuid('platform_account_id')
      .notNull()
      .references(() => platformAccounts.id, { onDelete: 'cascade' }),
    dataOrigin: text('data_origin').$type<DataOrigin>().notNull(),
    day: text('day').notNull(),
    metrics: jsonb('metrics').$type<Record<string, number | null>>().notNull(),
    collectedAt: ts('collected_at').notNull(),
  },
  (t) => [primaryKey({ columns: [t.platformAccountId, t.day] })],
)

/** What works for this creator: lift per topic / format / hook / length / platform / time. */
export const creatorContentPerformance = pgTable(
  'creator_content_performance',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    creatorProfileId: uuid('creator_profile_id')
      .notNull()
      .references(() => creatorProfiles.id, { onDelete: 'cascade' }),
    dataMode: text('data_mode').$type<DataMode>().notNull(),
    computedAt: ts('computed_at').notNull(),
    dimension: text('dimension').notNull(),
    value: text('value').notNull(),
    postCount: integer('post_count').notNull(),
    meanLogLift: doublePrecision('mean_log_lift').notNull(),
    /** exp(shrunk mean log lift): 2.0 means "twice this creator's normal". */
    lift: doublePrecision('lift').notNull(),
    medianViews: doublePrecision('median_views'),
    avgEngagementRate: doublePrecision('avg_engagement_rate'),
    confidence: real('confidence').notNull(),
  },
  (t) => [
    uniqueIndex('creator_content_performance_key').on(t.creatorProfileId, t.dataMode, t.dimension, t.value),
  ],
)

// ---------------------------------------------------------------------------
// Operations: collection runs, connector health, quota, events
// ---------------------------------------------------------------------------

export const collectionRuns = pgTable(
  'collection_runs',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    creatorProfileId: uuid('creator_profile_id')
      .notNull()
      .references(() => creatorProfiles.id, { onDelete: 'cascade' }),
    dataMode: text('data_mode').$type<DataMode>().notNull(),
    trigger: text('trigger').$type<'schedule' | 'manual' | 'setup' | 'cli' | 'backfill' | 'demo_setup'>().notNull(),
    status: text('status')
      .$type<'queued' | 'running' | 'succeeded' | 'partial' | 'failed' | 'cancelled'>()
      .notNull()
      .default('queued'),
    /** For scheduled runs: the slot this run fills. Unique per profile, so a slot runs once. */
    scheduledFor: ts('scheduled_for'),
    /** The "now" the run used. Equals startedAt except for demo backfill runs. */
    clockAt: ts('clock_at'),
    requestedAt: ts('requested_at').notNull().defaultNow(),
    startedAt: ts('started_at'),
    finishedAt: ts('finished_at'),
    heartbeatAt: ts('heartbeat_at'),
    workerId: text('worker_id'),
    platformResults: jsonb('platform_results').$type<Partial<Record<Platform, PlatformRunResult>>>().notNull().default({}),
    steps: jsonb('steps').$type<CollectionStep[]>().notNull().default([]),
    error: text('error'),
  },
  (t) => [
    index('collection_runs_profile_requested_idx').on(t.creatorProfileId, t.requestedAt),
    index('collection_runs_status_idx').on(t.status),
    uniqueIndex('collection_runs_schedule_slot_key')
      .on(t.creatorProfileId, t.dataMode, t.scheduledFor)
      .where(sql`${t.trigger} = 'schedule'`),
  ],
)

export const platformConnectorHealth = pgTable(
  'platform_connector_health',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    creatorProfileId: uuid('creator_profile_id')
      .notNull()
      .references(() => creatorProfiles.id, { onDelete: 'cascade' }),
    platform: text('platform').$type<Platform>().notNull(),
    mode: text('mode').$type<ConnectorMode>().notNull(),
    status: text('status')
      .$type<'healthy' | 'degraded' | 'failing' | 'auth_required' | 'not_connected' | 'rate_limited'>()
      .notNull(),
    tokenStatus: text('token_status')
      .$type<'healthy' | 'expiring' | 'expired' | 'revoked' | 'missing' | 'not_applicable'>()
      .notNull()
      .default('missing'),
    lastAttemptAt: ts('last_attempt_at'),
    lastSuccessAt: ts('last_success_at'),
    lastFailureAt: ts('last_failure_at'),
    lastFailureKind: text('last_failure_kind'),
    lastFailureReason: text('last_failure_reason'),
    consecutiveFailures: integer('consecutive_failures').notNull().default(0),
    /** Earliest time the next automatic attempt may run (exponential backoff). */
    backoffUntil: ts('backoff_until'),
    nextScheduledAt: ts('next_scheduled_at'),
    rateLimit: jsonb('rate_limit').$type<RateLimitInfo>(),
    updatedAt: updatedAt(),
  },
  (t) => [uniqueIndex('platform_connector_health_key').on(t.creatorProfileId, t.platform, t.mode)],
)

/** Units consumed per quota bucket per quota day (YouTube buckets reset at midnight Pacific). */
export const apiQuotaUsage = pgTable(
  'api_quota_usage',
  {
    bucket: text('bucket').notNull(),
    quotaDay: text('quota_day').notNull(),
    unitsUsed: integer('units_used').notNull().default(0),
    callCount: integer('call_count').notNull().default(0),
    updatedAt: updatedAt(),
  },
  (t) => [primaryKey({ columns: [t.bucket, t.quotaDay] })],
)

/** Deletion requests received from a platform (Meta's data deletion callback) or the user. */
export const dataDeletionRequests = pgTable('data_deletion_requests', {
  id: uuid('id').primaryKey().defaultRandom(),
  confirmationCode: text('confirmation_code').notNull().unique(),
  platform: text('platform').$type<Platform>().notNull(),
  externalUserId: text('external_user_id'),
  source: text('source').$type<'platform_callback' | 'user'>().notNull(),
  status: text('status').$type<'received' | 'completed' | 'no_data'>().notNull(),
  detail: text('detail'),
  requestedAt: ts('requested_at').notNull().defaultNow(),
  completedAt: ts('completed_at'),
})

/** Notable events shown in the UI (connector failures, AI failures, token refreshes). Redacted. */
export const systemEvents = pgTable(
  'system_events',
  {
    id: bigserial('id', { mode: 'number' }).primaryKey(),
    creatorProfileId: uuid('creator_profile_id').references(() => creatorProfiles.id, { onDelete: 'cascade' }),
    level: text('level').$type<'debug' | 'info' | 'warn' | 'error'>().notNull(),
    category: text('category').$type<'collection' | 'auth' | 'ai' | 'connector' | 'analysis' | 'system'>().notNull(),
    platform: text('platform').$type<Platform>(),
    message: text('message').notNull(),
    context: jsonb('context').$type<Record<string, unknown>>(),
    createdAt: createdAt(),
  },
  (t) => [index('system_events_profile_created_idx').on(t.creatorProfileId, t.createdAt)],
)
