/**
 * YouTube connector: YouTube Data API v3 + YouTube Analytics API v2, with
 * Google OAuth 2.0 (web server flow) for the creator's own channel and an
 * optional API key for public discovery.
 *
 * Quota (checked 2026-09-29): search.list has its own bucket of 100 calls a
 * day; videos.batchGetStats its own 10,000 units; everything else shares
 * 10,000 units. Every call reserves its cost first (see ../quota.ts).
 */
import type { Env } from '../../config/env'
import type { ConnectorMode, ContentItem } from '../../domain/types'
import { ConnectorError, isConnectorError } from '../errors'
import { requestJson, type HttpDeps } from '../http'
import { buildUrl, expiresAt, form, splitScopes, tokenSet } from '../oauth-common'
import { toCount, toNumber } from '../normalize-utils'
import { codeChallengeS256 } from '../../security/random'
import {
  ok,
  unsupported,
  type AccessCredentials,
  type AuthorizationRequest,
  type CapabilityContext,
  type CapabilityReport,
  type ConnectorContext,
  type ConnectorResult,
  type CreatorAnalyticsData,
  type CreatorProfileData,
  type DiscoveryBatch,
  type DiscoverySource,
  type HealthCheckResult,
  type OAuthCompletion,
  type OAuthFlow,
  type OwnerItemMetrics,
  type PlatformConnector,
  type QuotaBucket,
  type TokenSet,
} from '../types'
import type {
  GoogleTokenResponse,
  YtAnalyticsResponse,
  YtBatchStatsResponse,
  YtChannel,
  YtCommentThread,
  YtListResponse,
  YtPlaylistItem,
  YtSearchResult,
  YtVideo,
} from './api-types'
import { youtubeCapabilities } from './capabilities'
import { classifyGoogleOAuthError, classifyYouTubeError } from './errors'
import { analyticsRows, channelUrl, normalizeChannel, normalizeVideo, type ChannelInfo } from './normalize'

export const SCOPE_YOUTUBE_READONLY = 'https://www.googleapis.com/auth/youtube.readonly'
export const SCOPE_ANALYTICS_READONLY = 'https://www.googleapis.com/auth/yt-analytics.readonly'
export const YOUTUBE_SCOPES = [SCOPE_YOUTUBE_READONLY, SCOPE_ANALYTICS_READONLY]

export interface YouTubeEndpoints {
  authorize: string
  token: string
  revoke: string
  data: string
  analytics: string
}

export const YOUTUBE_ENDPOINTS: YouTubeEndpoints = {
  authorize: 'https://accounts.google.com/o/oauth2/v2/auth',
  token: 'https://oauth2.googleapis.com/token',
  revoke: 'https://oauth2.googleapis.com/revoke',
  data: 'https://www.googleapis.com/youtube/v3',
  analytics: 'https://youtubeanalytics.googleapis.com/v2',
}

export type YouTubeEnv = Pick<Env, 'GOOGLE_CLIENT_ID' | 'GOOGLE_CLIENT_SECRET' | 'YOUTUBE_API_KEY' | 'GOOGLE_OAUTH_PKCE' | 'YOUTUBE_DERIVED_METRICS_APPROVED'>

export interface YouTubeConnectorOptions {
  mode: ConnectorMode
  env: YouTubeEnv
  http: HttpDeps
  endpoints?: Partial<YouTubeEndpoints>
}

const DAY = 86_400_000
const BATCH = 50

function chunk<T>(items: T[], size: number): T[][] {
  const out: T[][] = []
  for (let i = 0; i < items.length; i += size) out.push(items.slice(i, i + size))
  return out
}

// ---------------------------------------------------------------------------
// OAuth
// ---------------------------------------------------------------------------

export class GoogleOAuthFlow implements OAuthFlow {
  readonly requestedScopes = YOUTUBE_SCOPES
  readonly authVariant = 'google_oauth'
  constructor(
    private readonly env: YouTubeEnv,
    private readonly endpoints: YouTubeEndpoints,
    private readonly http: HttpDeps,
    private readonly identify: (accessToken: string, grantedScopes: string[]) => Promise<OAuthCompletion['account']>,
  ) {}

  get usesPkce(): boolean {
    return this.env.GOOGLE_OAUTH_PKCE
  }

  missingConfiguration(): string[] {
    const missing: string[] = []
    if (!this.env.GOOGLE_CLIENT_ID) missing.push('GOOGLE_CLIENT_ID')
    if (!this.env.GOOGLE_CLIENT_SECRET) missing.push('GOOGLE_CLIENT_SECRET')
    return missing
  }

  authorizationUrl(req: AuthorizationRequest): string {
    return buildUrl(this.endpoints.authorize, {
      client_id: this.env.GOOGLE_CLIENT_ID,
      redirect_uri: req.redirectUri,
      response_type: 'code',
      scope: this.requestedScopes.join(' '),
      // offline + consent: guarantees a refresh token, also on reconnect.
      access_type: 'offline',
      prompt: 'consent',
      include_granted_scopes: 'true',
      state: req.state,
      ...(req.codeVerifier && this.usesPkce
        ? { code_challenge: codeChallengeS256(req.codeVerifier), code_challenge_method: 'S256' }
        : {}),
    })
  }

  private async token(body: URLSearchParams, operation: string): Promise<GoogleTokenResponse> {
    const res = await requestJson<GoogleTokenResponse>(
      { platform: 'youtube', operation, url: this.endpoints.token, method: 'POST', body, classify: classifyGoogleOAuthError(operation), maxAttempts: 2 },
      this.http,
    )
    if (!res.data?.access_token) {
      throw new ConnectorError({ kind: 'schema_changed', platform: 'youtube', operation, message: `${operation}: token response had no access_token` })
    }
    return res.data
  }

  async exchangeCode(input: { code: string; redirectUri: string; codeVerifier: string | null; now: Date }): Promise<OAuthCompletion> {
    const data = await this.token(
      form({
        code: input.code,
        client_id: this.env.GOOGLE_CLIENT_ID,
        client_secret: this.env.GOOGLE_CLIENT_SECRET,
        redirect_uri: input.redirectUri,
        grant_type: 'authorization_code',
        code_verifier: this.usesPkce ? input.codeVerifier : null,
      }),
      'oauth.exchange',
    )
    // Google reports the scopes actually granted; the user may have declined some.
    const scopes = splitScopes(data.scope, /\s+/) ?? []
    const tokens = tokenSet({
      accessToken: data.access_token!,
      refreshToken: data.refresh_token ?? null,
      accessTokenExpiresAt: expiresAt(input.now, data.expires_in),
      refreshTokenExpiresAt: expiresAt(input.now, data.refresh_token_expires_in),
      scopes,
      tokenType: data.token_type ?? 'Bearer',
    })
    const account = await this.identify(tokens.accessToken, scopes)
    return { tokens, account }
  }

  async refresh(credentials: AccessCredentials, now: Date): Promise<TokenSet> {
    if (!credentials.refreshToken) {
      throw new ConnectorError({ kind: 'auth_expired', platform: 'youtube', operation: 'oauth.refresh', message: 'No refresh token stored; reconnect YouTube.' })
    }
    const data = await this.token(
      form({
        grant_type: 'refresh_token',
        refresh_token: credentials.refreshToken,
        client_id: this.env.GOOGLE_CLIENT_ID,
        client_secret: this.env.GOOGLE_CLIENT_SECRET,
      }),
      'oauth.refresh',
    )
    return tokenSet({
      accessToken: data.access_token!,
      refreshToken: data.refresh_token ?? null,
      accessTokenExpiresAt: expiresAt(now, data.expires_in),
      refreshTokenExpiresAt: expiresAt(now, data.refresh_token_expires_in),
      scopes: splitScopes(data.scope, /\s+/),
      tokenType: data.token_type ?? 'Bearer',
    })
  }

  async revoke(credentials: AccessCredentials): Promise<void> {
    // Revoking the refresh token also revokes its access tokens.
    await requestJson(
      {
        platform: 'youtube',
        operation: 'oauth.revoke',
        url: this.endpoints.revoke,
        method: 'POST',
        body: form({ token: credentials.refreshToken ?? credentials.accessToken }),
        classify: classifyGoogleOAuthError('oauth.revoke'),
        maxAttempts: 2,
      },
      this.http,
    )
  }
}

// ---------------------------------------------------------------------------
// Connector
// ---------------------------------------------------------------------------

export class YouTubeConnector implements PlatformConnector {
  readonly platform = 'youtube' as const
  readonly mode: ConnectorMode
  readonly id: string
  readonly auth: GoogleOAuthFlow
  private readonly endpoints: YouTubeEndpoints

  constructor(private readonly opts: YouTubeConnectorOptions) {
    this.mode = opts.mode
    this.id = opts.mode === 'mock' ? 'youtube-demo' : 'youtube-data-api-v3'
    this.endpoints = { ...YOUTUBE_ENDPOINTS, ...opts.endpoints }
    this.auth = new GoogleOAuthFlow(opts.env, this.endpoints, opts.http, (token, scopes) => this.identify(token, scopes))
  }

  capabilities(ctx: CapabilityContext): CapabilityReport {
    return youtubeCapabilities({
      ...ctx,
      options: { hasApiKey: !!this.opts.env.YOUTUBE_API_KEY, derivedApproved: this.opts.env.YOUTUBE_DERIVED_METRICS_APPROVED, ...ctx.options },
    })
  }

  refreshToken(credentials: AccessCredentials, now: Date): Promise<TokenSet> {
    return this.auth.refresh(credentials, now)
  }

  // -- plumbing ---------------------------------------------------------------

  private authFor(ctx: Pick<ConnectorContext, 'credentials'>, requireUser: boolean, operation: string): { headers: Record<string, string>; params: Record<string, string> } {
    if (ctx.credentials) return { headers: { authorization: `Bearer ${ctx.credentials.accessToken}` }, params: {} }
    if (requireUser) {
      throw new ConnectorError({ kind: 'auth_required', platform: 'youtube', operation, message: `${operation}: connect your YouTube channel first` })
    }
    if (this.opts.env.YOUTUBE_API_KEY) return { headers: {}, params: { key: this.opts.env.YOUTUBE_API_KEY } }
    throw new ConnectorError({
      kind: 'not_configured',
      platform: 'youtube',
      operation,
      message: `${operation}: connect a YouTube channel or set YOUTUBE_API_KEY to search public videos`,
    })
  }

  private async get<T>(
    ctx: Pick<ConnectorContext, 'credentials' | 'quota' | 'logger' | 'signal'>,
    operation: string,
    url: string,
    params: Record<string, string | number | boolean | null | undefined>,
    quota: { bucket: QuotaBucket; units: number } | null,
    requireUser = false,
  ): Promise<T> {
    const auth = this.authFor(ctx, requireUser, operation)
    if (quota) await ctx.quota.reserve(quota.bucket, quota.units, operation)
    const res = await requestJson<T>(
      { platform: 'youtube', operation, url: buildUrl(url, { ...params, ...auth.params }), headers: auth.headers, classify: classifyYouTubeError(operation), signal: ctx.signal },
      { ...this.opts.http, logger: ctx.logger },
    )
    return res.data
  }

  private data(path: string): string {
    return `${this.endpoints.data}/${path}`
  }

  private async identify(accessToken: string, grantedScopes: string[]): Promise<OAuthCompletion['account']> {
    const res = await requestJson<YtListResponse<YtChannel>>(
      {
        platform: 'youtube',
        operation: 'channels.list(mine)',
        url: buildUrl(this.data('channels'), { part: 'snippet,statistics,contentDetails', mine: 'true' }),
        headers: { authorization: `Bearer ${accessToken}` },
        classify: classifyYouTubeError('channels.list(mine)'),
      },
      this.opts.http,
    )
    const channel = normalizeChannel(res.data.items?.[0] ?? {})
    if (!channel) {
      throw new ConnectorError({ kind: 'not_found', platform: 'youtube', operation: 'channels.list(mine)', message: 'This Google account has no YouTube channel.' })
    }
    return {
      externalAccountId: channel.id,
      username: channel.handle,
      displayName: channel.title,
      profileUrl: channelUrl(channel),
      avatarUrl: channel.avatarUrl,
      followerCount: channel.subscriberCount,
      grantedScopes,
      authVariant: 'google_oauth',
      metadata: { uploadsPlaylistId: channel.uploadsPlaylistId },
    }
  }

  async fetchChannels(ctx: ConnectorContext, ids: string[]): Promise<Map<string, ChannelInfo>> {
    const out = new Map<string, ChannelInfo>()
    for (const batch of chunk([...new Set(ids)].filter(Boolean), BATCH)) {
      const res = await this.get<YtListResponse<YtChannel>>(
        ctx,
        'channels.list',
        this.data('channels'),
        { part: 'snippet,statistics,contentDetails', id: batch.join(','), maxResults: BATCH },
        { bucket: 'youtube.units', units: 1 },
      )
      for (const raw of res.items ?? []) {
        const channel = normalizeChannel(raw)
        if (channel) out.set(channel.id, channel)
      }
    }
    return out
  }

  async fetchVideos(ctx: ConnectorContext, ids: string[], via: Map<string, string>, source: ContentItem['metricSource'], requireUser = false): Promise<ContentItem[]> {
    const items: ContentItem[] = []
    for (const batch of chunk([...new Set(ids)], BATCH)) {
      const res = await this.get<YtListResponse<YtVideo>>(
        ctx,
        'videos.list',
        this.data('videos'),
        { part: 'snippet,contentDetails,statistics,status', id: batch.join(','), maxResults: BATCH },
        { bucket: 'youtube.units', units: 1 },
        requireUser,
      )
      for (const video of res.items ?? []) {
        if (video.status?.privacyStatus && video.status.privacyStatus !== 'public') continue
        if (video.snippet?.liveBroadcastContent && video.snippet.liveBroadcastContent !== 'none') continue
        const item = normalizeVideo(video, { collectedAt: ctx.now, metricSource: source, discoveredVia: via.get(video.id ?? '') ?? null })
        if (item) items.push(item)
      }
    }
    return items
  }

  private async listUploads(ctx: ConnectorContext, playlistId: string, since: Date, maxItems: number, requireUser = false): Promise<string[]> {
    const ids: string[] = []
    let pageToken: string | undefined
    for (let page = 0; page < 20 && ids.length < maxItems; page++) {
      const res = await this.get<YtListResponse<YtPlaylistItem>>(
        ctx,
        'playlistItems.list',
        this.data('playlistItems'),
        { part: 'contentDetails', playlistId, maxResults: Math.min(BATCH, maxItems - ids.length), pageToken },
        { bucket: 'youtube.units', units: 1 },
        requireUser,
      )
      let anyRecent = false
      for (const entry of res.items ?? []) {
        const id = entry.contentDetails?.videoId ?? entry.snippet?.resourceId?.videoId
        const published = entry.contentDetails?.videoPublishedAt ? new Date(entry.contentDetails.videoPublishedAt) : null
        if (!id) continue
        if (published && published < since) continue
        anyRecent = true
        ids.push(id)
      }
      // The uploads playlist's order is not documented; stop only when a whole page is older than `since`.
      if (!res.nextPageToken || !anyRecent) break
      pageToken = res.nextPageToken
    }
    return ids.slice(0, maxItems)
  }

  private attachChannels(items: ContentItem[], channels: Map<string, ChannelInfo>): void {
    for (const item of items) {
      const ch = item.creatorId ? channels.get(item.creatorId) : undefined
      if (!ch) continue
      item.creatorHandle = ch.handle
      item.creatorFollowerCount = ch.subscriberCount
      item.creatorAvatarUrl = ch.avatarUrl
      item.creatorProfileUrl = channelUrl(ch)
      item.creatorName ??= ch.title
    }
  }

  // -- PlatformConnector ------------------------------------------------------------

  async getCreatorProfile(ctx: ConnectorContext): Promise<ConnectorResult<CreatorProfileData>> {
    const res = await this.get<YtListResponse<YtChannel>>(
      ctx,
      'channels.list(mine)',
      this.data('channels'),
      { part: 'snippet,statistics,contentDetails', mine: 'true' },
      { bucket: 'youtube.units', units: 1 },
      true,
    )
    const channel = normalizeChannel(res.items?.[0] ?? {})
    if (!channel) {
      throw new ConnectorError({ kind: 'not_found', platform: 'youtube', operation: 'channels.list(mine)', message: 'The connected account no longer has a YouTube channel.' })
    }
    return ok({
      externalAccountId: channel.id,
      username: channel.handle,
      displayName: channel.title,
      profileUrl: channelUrl(channel),
      avatarUrl: channel.avatarUrl,
      followerCount: channel.subscriberCount,
      followingCount: null,
      postCount: channel.videoCount,
      totalViews: channel.viewCount,
      metadata: { uploadsPlaylistId: channel.uploadsPlaylistId },
    })
  }

  async getCreatorContent(ctx: ConnectorContext, options: { since: Date; maxItems: number }): Promise<ConnectorResult<ContentItem[]>> {
    let uploads = (ctx.account?.metadata.uploadsPlaylistId as string | undefined) ?? null
    if (!uploads) {
      const profile = await this.getCreatorProfile(ctx)
      uploads = profile.status === 'ok' ? ((profile.data.metadata.uploadsPlaylistId as string | null) ?? null) : null
    }
    if (!uploads) return ok([], ['The channel has no uploads playlist.'])
    const ids = await this.listUploads(ctx, uploads, options.since, options.maxItems, true)
    const via = new Map(ids.map((id) => [id, 'own_content']))
    const items = await this.fetchVideos(ctx, ids, via, 'public_api', true)
    return ok(items)
  }

  async getCreatorAnalytics(
    ctx: ConnectorContext,
    options: { items: Array<{ externalId: string; publishedAt: Date | null }>; since: Date },
  ): Promise<ConnectorResult<CreatorAnalyticsData>> {
    const granted = ctx.credentials?.scopes ?? ctx.account?.grantedScopes ?? []
    if (!granted.includes(SCOPE_ANALYTICS_READONLY)) {
      return unsupported('own_analytics', 'The YouTube Analytics permission was not granted. Reconnect YouTube and approve it to see watch time, shares and retention.')
    }
    const endDate = ctx.now.toISOString().slice(0, 10)
    const earliest = options.items.reduce<Date | null>((min, i) => (i.publishedAt && (!min || i.publishedAt < min) ? i.publishedAt : min), null)
    const startDate = (earliest ?? new Date(ctx.now.getTime() - 365 * DAY)).toISOString().slice(0, 10)
    const warnings: string[] = ['YouTube Analytics data lags 48–72 hours; recent videos show partial numbers.']
    const items: OwnerItemMetrics[] = []

    const query = async (metrics: string, ids: string[]) =>
      this.get<YtAnalyticsResponse>(
        ctx,
        'reports.query',
        `${this.endpoints.analytics}/reports`,
        { ids: 'channel==MINE', startDate, endDate, metrics, dimensions: 'video', filters: `video==${ids.join(',')}`, sort: '-views', maxResults: 200 },
        null,
        true,
      )
    const FULL = 'views,engagedViews,estimatedMinutesWatched,averageViewDuration,averageViewPercentage,likes,comments,shares,subscribersGained'
    const CORE = 'views,estimatedMinutesWatched,averageViewDuration,likes,comments,shares,subscribersGained'
    for (const batch of chunk(options.items.map((i) => i.externalId), 200)) {
      let response: YtAnalyticsResponse
      try {
        response = await query(FULL, batch)
      } catch (err) {
        // Some metric combinations are rejected ("The query is not supported"); retry with the core set.
        if (isConnectorError(err) && err.kind === 'bad_request') {
          warnings.push('Engaged views and average view percentage were not available for this query.')
          response = await query(CORE, batch)
        } else throw err
      }
      for (const row of analyticsRows(response)) {
        const id = String(row.video ?? '')
        if (!id) continue
        const extra: Record<string, number> = {}
        for (const key of ['engagedViews', 'estimatedMinutesWatched', 'averageViewDuration', 'averageViewPercentage', 'subscribersGained', 'views']) {
          const v = toNumber(row[key])
          if (v !== null) extra[key === 'views' ? 'analyticsViews' : key] = v
        }
        items.push({
          externalId: id,
          // Data API counts are fresher; Analytics views go in `extra`.
          viewCount: null,
          reach: null,
          impressions: null,
          likeCount: toCount(row.likes),
          commentCount: toCount(row.comments),
          shareCount: toCount(row.shares),
          saveCount: null,
          extra,
        })
      }
    }

    const seriesStart = new Date(ctx.now.getTime() - 90 * DAY).toISOString().slice(0, 10)
    const series = await this.get<YtAnalyticsResponse>(
      ctx,
      'reports.query(day)',
      `${this.endpoints.analytics}/reports`,
      { ids: 'channel==MINE', startDate: seriesStart, endDate, metrics: 'views,estimatedMinutesWatched,subscribersGained,subscribersLost', dimensions: 'day', sort: 'day' },
      null,
      true,
    )
    const accountSeries = analyticsRows(series).map((row) => ({
      date: String(row.day),
      metrics: {
        views: toNumber(row.views),
        watchMinutes: toNumber(row.estimatedMinutesWatched),
        followersGained: toNumber(row.subscribersGained),
        followersLost: toNumber(row.subscribersLost),
      },
    }))
    return ok({ items, accountSeries, notes: warnings }, warnings)
  }

  async getPublicDiscoveryCandidates(
    ctx: ConnectorContext,
    options: { maxItems: number; baselineCreators?: string[] },
  ): Promise<ConnectorResult<DiscoveryBatch>> {
    const cfg = ctx.settings.discovery.youtube
    const warnings: string[] = []
    const sources: DiscoverySource[] = []
    const publishedAfter = new Date(ctx.now.getTime() - cfg.publishedWithinDays * DAY)
    const found = new Map<string, string>()

    // Rotate through the query list a few searches per run (search.list: 100 calls/day).
    const queries = cfg.queries
    const perRun = Math.min(cfg.maxSearchesPerRun, queries.length)
    const start = queries.length ? Number((ctx.cursor as { queryIndex?: number } | null)?.queryIndex ?? 0) % queries.length : 0
    const selected = Array.from({ length: perRun }, (_, i) => queries[(start + i) % queries.length]!)
    let searchFailures = 0
    for (const q of selected) {
      try {
        const res = await this.get<YtListResponse<YtSearchResult>>(
          ctx,
          'search.list',
          this.data('search'),
          {
            part: 'snippet',
            type: 'video',
            q,
            order: 'relevance',
            publishedAfter: publishedAfter.toISOString(),
            maxResults: 50,
            regionCode: cfg.regionCode,
            relevanceLanguage: cfg.relevanceLanguage,
          },
          { bucket: 'youtube.search', units: 1 },
        )
        let n = 0
        for (const r of res.items ?? []) {
          const id = r.id?.videoId
          if (id && !found.has(id)) {
            found.set(id, `search:${q}`)
            n++
          }
        }
        sources.push({ kind: 'search', value: q, items: n, quotaUnits: 1 })
      } catch (err) {
        searchFailures++
        // Keep what earlier searches found; stop searching on quota or auth trouble.
        if (isConnectorError(err) && ['quota_exceeded', 'rate_limited', 'auth_expired', 'auth_revoked', 'not_configured'].includes(err.kind)) {
          if (found.size === 0) throw err
          warnings.push(`Search stopped early: ${err.message}`)
          break
        }
        warnings.push(`Search “${q}” failed: ${err instanceof Error ? err.message : String(err)}`)
      }
    }
    if (searchFailures > 0 && searchFailures === selected.length && selected.length > 0 && found.size === 0 && cfg.channelIds.length === 0) {
      throw new ConnectorError({ kind: 'unavailable', platform: 'youtube', operation: 'search.list', message: 'Every discovery search failed this run.' })
    }

    // Watchlist channels: newest uploads via the uploads playlist (search is unreliable for this).
    if (cfg.channelIds.length) {
      const watch = await this.fetchChannels(ctx, cfg.channelIds)
      for (const ch of watch.values()) {
        if (!ch.uploadsPlaylistId) continue
        const ids = await this.listUploads(ctx, ch.uploadsPlaylistId, publishedAfter, 15)
        for (const id of ids) if (!found.has(id)) found.set(id, `watchlist:${ch.id}`)
        sources.push({ kind: 'watchlist', value: ch.handle ?? ch.id, items: ids.length, quotaUnits: 1 })
      }
    }

    const items = await this.fetchVideos(ctx, [...found.keys()].slice(0, options.maxItems), found, 'public_api')

    // Baseline samples: recent uploads of creators we have too little history for.
    const baselineTargets = [...new Set(options.baselineCreators ?? [])].slice(0, 20)
    const channelIds = [...new Set([...items.map((i) => i.creatorId).filter((id): id is string => !!id), ...baselineTargets])]
    const channels = await this.fetchChannels(ctx, channelIds)
    const baselineItems: ContentItem[] = []
    for (const creatorId of baselineTargets) {
      const ch = channels.get(creatorId)
      if (!ch?.uploadsPlaylistId) continue
      try {
        const ids = (await this.listUploads(ctx, ch.uploadsPlaylistId, new Date(ctx.now.getTime() - 120 * DAY), 20)).filter((id) => !found.has(id))
        const via = new Map(ids.map((id) => [id, 'creator_baseline']))
        baselineItems.push(...(await this.fetchVideos(ctx, ids, via, 'public_api')))
      } catch (err) {
        if (isConnectorError(err) && err.kind === 'quota_exceeded') {
          warnings.push('Stopped collecting creator baselines: daily quota budget reached.')
          break
        }
        warnings.push(`Baseline for ${ch.handle ?? creatorId} failed: ${err instanceof Error ? err.message : String(err)}`)
      }
    }
    if (baselineItems.length) sources.push({ kind: 'watchlist', value: 'creator baselines', items: baselineItems.length })
    const all = [...items, ...baselineItems]
    this.attachChannels(all, channels)
    return ok({ items: all, sources, cursor: { queryIndex: queries.length ? (start + perRun) % queries.length : 0 } }, warnings, await ctx.quota.snapshot('youtube'))
  }

  async refreshPublicMetrics(ctx: ConnectorContext, externalIds: string[]): Promise<ConnectorResult<ContentItem[]>> {
    const items: ContentItem[] = []
    const warnings: string[] = []
    for (const batch of chunk([...new Set(externalIds)], BATCH)) {
      let res: YtBatchStatsResponse
      try {
        res = await this.get<YtBatchStatsResponse>(
          ctx,
          'videos.batchGetStats',
          this.data('videos:batchGetStats'),
          { id: batch.join(','), part: 'snippet,statistics,contentDetails' },
          { bucket: 'youtube.batchGetStats', units: 1 },
        )
      } catch (err) {
        // batchGetStats is new (2026-06-03); fall back to videos.list if it is refused.
        if (isConnectorError(err) && (err.kind === 'bad_request' || err.kind === 'not_found')) {
          const via = new Map(batch.map((id) => [id, 'refresh']))
          items.push(...(await this.fetchVideos(ctx, batch, via, 'public_api')))
          warnings.push('videos.batchGetStats unavailable; used videos.list instead.')
          continue
        }
        throw err
      }
      for (const stat of res.items ?? []) {
        if (!stat.id) continue
        const item = normalizeVideo(
          { id: stat.id, statistics: stat.statistics, contentDetails: stat.contentDetails, snippet: { publishedAt: stat.snippet?.publishTime } },
          { collectedAt: ctx.now, metricSource: 'public_api', discoveredVia: null },
        )
        if (item) {
          // batchGetStats carries no title or channel; keep only what it actually returned.
          item.url = null
          item.hashtags = null
          item.mediaType = null
          items.push(item)
        }
      }
      if (res.summary?.failedVideoIds?.length) warnings.push(`${res.summary.failedVideoIds.length} videos unavailable (deleted or private).`)
    }
    return ok(items, warnings, await ctx.quota.snapshot('youtube'))
  }

  async getTopComments(ctx: ConnectorContext, externalId: string, limit = 20): Promise<ConnectorResult<string[]>> {
    try {
      const res = await this.get<YtListResponse<YtCommentThread>>(
        ctx,
        'commentThreads.list',
        this.data('commentThreads'),
        { part: 'snippet', videoId: externalId, order: 'relevance', maxResults: Math.min(100, limit), textFormat: 'plainText' },
        { bucket: 'youtube.units', units: 1 },
      )
      return ok(
        (res.items ?? [])
          .map((t) => t.snippet?.topLevelComment?.snippet?.textOriginal ?? t.snippet?.topLevelComment?.snippet?.textDisplay ?? '')
          .filter(Boolean)
          .slice(0, limit),
      )
    } catch (err) {
      if (isConnectorError(err) && err.kind === 'forbidden') return ok([], ['Comments are disabled on this video.'])
      throw err
    }
  }

  async healthCheck(ctx: ConnectorContext): Promise<HealthCheckResult> {
    try {
      if (ctx.credentials) {
        await this.get(ctx, 'channels.list(health)', this.data('channels'), { part: 'id', mine: 'true' }, { bucket: 'youtube.units', units: 1 }, true)
      } else if (this.opts.env.YOUTUBE_API_KEY) {
        await this.get(ctx, 'i18nLanguages.list(health)', this.data('i18nLanguages'), { part: 'snippet', hl: 'en' }, { bucket: 'youtube.units', units: 1 })
      } else {
        return { ok: false, checkedAt: ctx.now, message: 'Not connected and no API key configured.' }
      }
      return { ok: true, checkedAt: ctx.now, message: 'YouTube API reachable.', rateLimit: await ctx.quota.snapshot('youtube') }
    } catch (err) {
      return { ok: false, checkedAt: ctx.now, message: err instanceof Error ? err.message : String(err) }
    }
  }
}
