/**
 * Instagram connector for professional (Business or Creator) accounts.
 *
 * Two documented auth paths (Instagram Platform overview, checked 2026-09-29):
 *
 *   instagram_login   Business Login for Instagram, host graph.instagram.com.
 *                     No Facebook Page needed. Own profile, media, insights.
 *                     Cannot see other accounts' content.
 *   facebook_login    Facebook Login for Business, host graph.facebook.com.
 *                     Requires the IG account to be linked to a Facebook Page.
 *                     Adds Business Discovery (other professional accounts by
 *                     exact username) and Hashtag Search (App Review + Business
 *                     Verification; 30 unique hashtags per rolling 7 days).
 *
 * A Meta app uses one path or the other, never both, so the path is a server
 * setting (INSTAGRAM_AUTH_MODE).
 */
import { createHmac } from 'node:crypto'
import type { Env } from '../../config/env'
import type { ConnectorMode, ContentItem, RateLimitInfo } from '../../domain/types'
import { ConnectorError, isConnectorError } from '../errors'
import { requestJson, type HttpDeps, type HttpResponse } from '../http'
import { buildUrl, expiresAt, form, splitScopes, tokenSet } from '../oauth-common'
import { toCount, toText } from '../normalize-utils'
import {
  ok,
  unsupported,
  type AccessCredentials,
  type AuthorizationRequest,
  type CapabilityContext,
  type CapabilityReport,
  type ConnectedAccountInfo,
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
  type TokenSet,
} from '../types'
import type {
  FbAccountsResponse,
  FbPermissionsResponse,
  IgBusinessDiscovery,
  IgInsightsResponse,
  IgMedia,
  IgPaged,
  IgTokenResponse,
  IgUser,
} from './api-types'
import { instagramCapabilities } from './capabilities'
import { classifyMetaError, parseMetaUsage } from './errors'
import { insightValue, normalizeMedia, type IgOwner } from './normalize'

export type InstagramAuthMode = 'instagram_login' | 'facebook_login'
export type InstagramEnv = Pick<
  Env,
  'INSTAGRAM_AUTH_MODE' | 'INSTAGRAM_APP_ID' | 'INSTAGRAM_APP_SECRET' | 'FACEBOOK_APP_ID' | 'FACEBOOK_APP_SECRET' | 'FACEBOOK_LOGIN_CONFIG_ID' | 'META_GRAPH_API_VERSION'
>

export const INSTAGRAM_LOGIN_SCOPES = ['instagram_business_basic', 'instagram_business_manage_insights']
export const FACEBOOK_LOGIN_SCOPES = ['instagram_basic', 'instagram_manage_insights', 'pages_show_list', 'pages_read_engagement']

export interface InstagramEndpoints {
  igAuthorize: string
  igToken: string
  igGraph: string
  fbDialog: string
  fbGraph: string
}

export const INSTAGRAM_ENDPOINTS: InstagramEndpoints = {
  igAuthorize: 'https://www.instagram.com/oauth/authorize',
  igToken: 'https://api.instagram.com/oauth/access_token',
  igGraph: 'https://graph.instagram.com',
  fbDialog: 'https://www.facebook.com',
  fbGraph: 'https://graph.facebook.com',
}

export interface InstagramConnectorOptions {
  mode: ConnectorMode
  env: InstagramEnv
  http: HttpDeps
  endpoints?: Partial<InstagramEndpoints>
}

const HOUR = 3_600_000
const DAY = 24 * HOUR
const OWN_FIELDS_BASE = 'id,caption,media_type,media_url,permalink,thumbnail_url,timestamp,like_count,comments_count,media_audio_type,shortcode'
const OWN_FIELDS_MINIMAL = 'id,caption,media_type,permalink,timestamp,like_count,comments_count'
const DISCOVERY_MEDIA_FIELDS = 'id,caption,comments_count,like_count,view_count,media_type,media_product_type,media_audio_type,permalink,timestamp,thumbnail_url'
const HASHTAG_MEDIA_FIELDS = 'id,caption,comments_count,like_count,media_type,permalink,timestamp'
/** Stay under the documented 30 unique hashtags per rolling 7 days. */
const HASHTAG_WEEKLY_BUDGET = 25

interface InstagramCursor {
  hashtagFirstQueried?: Record<string, string>
  hashtagIds?: Record<string, string>
  hashtagSearchBlockedUntil?: string | null
  watchIndex?: number
}

// ---------------------------------------------------------------------------
// Shared Graph request helper
// ---------------------------------------------------------------------------

class Graph {
  lastUsage: RateLimitInfo | null = null
  constructor(
    private readonly base: string,
    private readonly version: string,
    private readonly http: HttpDeps,
    private readonly appSecret: string | undefined,
  ) {}

  url(path: string, params: Record<string, string | number | null | undefined>, token: string): string {
    // appsecret_proof proves the call comes from the server holding the app secret.
    const proof = this.appSecret ? createHmac('sha256', this.appSecret).update(token).digest('hex') : null
    return buildUrl(`${this.base}/${this.version}/${path.replace(/^\//, '')}`, { ...params, access_token: token, appsecret_proof: proof })
  }

  async get<T>(ctx: Pick<ConnectorContext, 'logger' | 'signal' | 'now'> | null, operation: string, path: string, params: Record<string, string | number | null | undefined>, token: string): Promise<HttpResponse<T>> {
    const res = await requestJson<T>(
      { platform: 'instagram', operation, url: this.url(path, params, token), classify: classifyMetaError(operation), signal: ctx?.signal },
      { ...this.http, logger: ctx?.logger },
    )
    const usage = parseMetaUsage(res.headers, ctx?.now ?? new Date())
    if (usage) this.lastUsage = usage
    return res
  }
}

// ---------------------------------------------------------------------------
// OAuth flows
// ---------------------------------------------------------------------------

/** Long-lived Meta tokens last ~60 days; refresh a week ahead, never within 24h of issue. */
function longLivedRefreshDue(credentials: AccessCredentials, now: Date): boolean {
  if (!credentials.accessTokenExpiresAt) return false
  const issuedLongAgo = !credentials.issuedAt || now.getTime() - credentials.issuedAt.getTime() >= 24 * HOUR
  return issuedLongAgo && credentials.accessTokenExpiresAt.getTime() - now.getTime() < 7 * DAY
}

export class InstagramLoginFlow implements OAuthFlow {
  readonly usesPkce = false // Not documented for Instagram Login; `state` + server-side secret instead.
  readonly requestedScopes = INSTAGRAM_LOGIN_SCOPES
  readonly authVariant = 'instagram_login'
  constructor(
    private readonly env: InstagramEnv,
    private readonly endpoints: InstagramEndpoints,
    private readonly http: HttpDeps,
    private readonly graph: Graph,
  ) {}

  missingConfiguration(): string[] {
    return [!this.env.INSTAGRAM_APP_ID && 'INSTAGRAM_APP_ID', !this.env.INSTAGRAM_APP_SECRET && 'INSTAGRAM_APP_SECRET'].filter(Boolean) as string[]
  }

  authorizationUrl(req: AuthorizationRequest): string {
    return buildUrl(this.endpoints.igAuthorize, {
      client_id: this.env.INSTAGRAM_APP_ID,
      redirect_uri: req.redirectUri,
      response_type: 'code',
      scope: this.requestedScopes.join(','),
      state: req.state,
    })
  }

  async exchangeCode(input: { code: string; redirectUri: string; codeVerifier?: string | null; now: Date }): Promise<OAuthCompletion> {
    // The documented redirect appends "#_", which is not part of the code.
    const code = input.code.replace(/#_$/, '')
    const short = await requestJson<IgTokenResponse>(
      {
        platform: 'instagram',
        operation: 'oauth.exchange',
        url: this.endpoints.igToken,
        method: 'POST',
        body: form({
          client_id: this.env.INSTAGRAM_APP_ID,
          client_secret: this.env.INSTAGRAM_APP_SECRET,
          grant_type: 'authorization_code',
          redirect_uri: input.redirectUri,
          code,
        }),
        classify: classifyMetaError('oauth.exchange'),
        maxAttempts: 1,
      },
      this.http,
    )
    // Documented wrapped in data[]; accept the flat shape too.
    const entry = short.data.data?.[0] ?? short.data
    if (!entry?.access_token) {
      throw new ConnectorError({ kind: 'schema_changed', platform: 'instagram', operation: 'oauth.exchange', message: 'Token response had no access_token' })
    }
    const permissions = Array.isArray(entry.permissions) ? entry.permissions : (splitScopes(entry.permissions, /,/) ?? [])
    const long = await requestJson<IgTokenResponse>(
      {
        platform: 'instagram',
        operation: 'oauth.long_lived',
        url: buildUrl(`${this.endpoints.igGraph}/access_token`, {
          grant_type: 'ig_exchange_token',
          client_secret: this.env.INSTAGRAM_APP_SECRET,
          access_token: entry.access_token,
        }),
        classify: classifyMetaError('oauth.long_lived'),
        maxAttempts: 2,
      },
      this.http,
    )
    if (!long.data.access_token) {
      throw new ConnectorError({ kind: 'schema_changed', platform: 'instagram', operation: 'oauth.long_lived', message: 'Long-lived token response had no access_token' })
    }
    const tokens = tokenSet({
      accessToken: long.data.access_token,
      accessTokenExpiresAt: expiresAt(input.now, long.data.expires_in),
      scopes: permissions,
      tokenType: long.data.token_type ?? 'bearer',
    })
    const me = await this.graph.get<IgUser>(
      null,
      'me',
      'me',
      { fields: 'id,user_id,username,name,account_type,profile_picture_url,followers_count,follows_count,media_count' },
      tokens.accessToken,
    )
    const igId = toText(String(me.data.user_id ?? '')) ?? toText(String(entry.user_id ?? '')) ?? me.data.id
    if (!igId) throw new ConnectorError({ kind: 'schema_changed', platform: 'instagram', operation: 'me', message: 'Profile response had no user id' })
    const account: ConnectedAccountInfo = {
      externalAccountId: igId,
      username: toText(me.data.username),
      displayName: toText(me.data.name) ?? toText(me.data.username),
      profileUrl: me.data.username ? `https://www.instagram.com/${me.data.username}/` : null,
      avatarUrl: toText(me.data.profile_picture_url),
      followerCount: toCount(me.data.followers_count),
      grantedScopes: permissions,
      authVariant: this.authVariant,
      metadata: { igUserId: igId, accountType: me.data.account_type ?? null },
    }
    return { tokens, account }
  }

  refreshDue(credentials: AccessCredentials, now: Date): boolean {
    return longLivedRefreshDue(credentials, now)
  }

  async refresh(credentials: AccessCredentials, now: Date): Promise<TokenSet> {
    const res = await requestJson<IgTokenResponse>(
      {
        platform: 'instagram',
        operation: 'oauth.refresh',
        url: buildUrl(`${this.endpoints.igGraph}/refresh_access_token`, { grant_type: 'ig_refresh_token', access_token: credentials.accessToken }),
        classify: classifyMetaError('oauth.refresh'),
        maxAttempts: 2,
      },
      this.http,
    )
    if (!res.data.access_token) {
      throw new ConnectorError({ kind: 'auth_expired', platform: 'instagram', operation: 'oauth.refresh', message: 'Refresh returned no token; reconnect Instagram.' })
    }
    return tokenSet({ accessToken: res.data.access_token, accessTokenExpiresAt: expiresAt(now, res.data.expires_in), tokenType: res.data.token_type ?? 'bearer' })
  }
}

export class FacebookLoginFlow implements OAuthFlow {
  readonly usesPkce = false
  readonly requestedScopes = FACEBOOK_LOGIN_SCOPES
  readonly authVariant = 'facebook_login'
  constructor(
    private readonly env: InstagramEnv,
    private readonly endpoints: InstagramEndpoints,
    private readonly http: HttpDeps,
    private readonly graph: Graph,
  ) {}

  missingConfiguration(): string[] {
    return [!this.env.FACEBOOK_APP_ID && 'FACEBOOK_APP_ID', !this.env.FACEBOOK_APP_SECRET && 'FACEBOOK_APP_SECRET'].filter(Boolean) as string[]
  }

  authorizationUrl(req: AuthorizationRequest): string {
    return buildUrl(`${this.endpoints.fbDialog}/${this.env.META_GRAPH_API_VERSION}/dialog/oauth`, {
      client_id: this.env.FACEBOOK_APP_ID,
      redirect_uri: req.redirectUri,
      response_type: 'code',
      state: req.state,
      // Facebook Login for Business uses a configuration ID in place of scopes when one is set up.
      ...(this.env.FACEBOOK_LOGIN_CONFIG_ID ? { config_id: this.env.FACEBOOK_LOGIN_CONFIG_ID } : { scope: this.requestedScopes.join(',') }),
    })
  }

  private async exchangeForLongLived(token: string, now: Date): Promise<TokenSet> {
    const res = await requestJson<IgTokenResponse>(
      {
        platform: 'instagram',
        operation: 'oauth.long_lived',
        url: buildUrl(`${this.endpoints.fbGraph}/${this.env.META_GRAPH_API_VERSION}/oauth/access_token`, {
          grant_type: 'fb_exchange_token',
          client_id: this.env.FACEBOOK_APP_ID,
          client_secret: this.env.FACEBOOK_APP_SECRET,
          fb_exchange_token: token,
        }),
        classify: classifyMetaError('oauth.long_lived'),
        maxAttempts: 2,
      },
      this.http,
    )
    if (!res.data.access_token) {
      throw new ConnectorError({ kind: 'schema_changed', platform: 'instagram', operation: 'oauth.long_lived', message: 'Long-lived token response had no access_token' })
    }
    return tokenSet({ accessToken: res.data.access_token, accessTokenExpiresAt: expiresAt(now, res.data.expires_in), tokenType: res.data.token_type ?? 'bearer' })
  }

  async exchangeCode(input: { code: string; redirectUri: string; codeVerifier?: string | null; now: Date }): Promise<OAuthCompletion> {
    const short = await requestJson<IgTokenResponse>(
      {
        platform: 'instagram',
        operation: 'oauth.exchange',
        url: buildUrl(`${this.endpoints.fbGraph}/${this.env.META_GRAPH_API_VERSION}/oauth/access_token`, {
          client_id: this.env.FACEBOOK_APP_ID,
          redirect_uri: input.redirectUri,
          client_secret: this.env.FACEBOOK_APP_SECRET,
          code: input.code,
        }),
        classify: classifyMetaError('oauth.exchange'),
        maxAttempts: 1,
      },
      this.http,
    )
    if (!short.data.access_token) {
      throw new ConnectorError({ kind: 'schema_changed', platform: 'instagram', operation: 'oauth.exchange', message: 'Token response had no access_token' })
    }
    const tokens = await this.exchangeForLongLived(short.data.access_token, input.now)
    const perms = await this.graph.get<FbPermissionsResponse>(null, 'me/permissions', 'me/permissions', {}, tokens.accessToken)
    const granted = (perms.data.data ?? []).filter((p) => p.status === 'granted' && p.permission).map((p) => p.permission!)
    tokens.scopes = granted
    const accounts = await this.graph.get<FbAccountsResponse>(null, 'me/accounts', 'me/accounts', { fields: 'id,name,instagram_business_account{id,username}' }, tokens.accessToken)
    const page = (accounts.data.data ?? []).find((p) => p.instagram_business_account?.id)
    if (!page?.instagram_business_account?.id) {
      throw new ConnectorError({
        kind: 'not_found',
        platform: 'instagram',
        operation: 'me/accounts',
        message: 'No Instagram professional account linked to a Facebook Page you manage was found. Link the account to a Page, or switch INSTAGRAM_AUTH_MODE to instagram_login.',
      })
    }
    const igId = page.instagram_business_account.id
    const me = await this.graph.get<IgUser>(null, 'ig-user', igId, { fields: 'id,username,name,profile_picture_url,followers_count,follows_count,media_count' }, tokens.accessToken)
    return {
      tokens,
      account: {
        externalAccountId: igId,
        username: toText(me.data.username) ?? toText(page.instagram_business_account.username),
        displayName: toText(me.data.name) ?? toText(me.data.username),
        profileUrl: me.data.username ? `https://www.instagram.com/${me.data.username}/` : null,
        avatarUrl: toText(me.data.profile_picture_url),
        followerCount: toCount(me.data.followers_count),
        grantedScopes: granted,
        authVariant: this.authVariant,
        metadata: { igUserId: igId, pageId: page.id ?? null, pageName: page.name ?? null },
      },
    }
  }

  refreshDue(credentials: AccessCredentials, now: Date): boolean {
    return longLivedRefreshDue(credentials, now)
  }

  async refresh(credentials: AccessCredentials, now: Date): Promise<TokenSet> {
    // A still-valid long-lived user token can be exchanged again. Data access
    // also lapses after 90 days of user inactivity, which only re-login fixes.
    return this.exchangeForLongLived(credentials.accessToken, now)
  }

  async revoke(credentials: AccessCredentials): Promise<void> {
    await requestJson(
      {
        platform: 'instagram',
        operation: 'oauth.revoke',
        url: this.graph.url('me/permissions', {}, credentials.accessToken),
        method: 'DELETE',
        classify: classifyMetaError('oauth.revoke'),
        maxAttempts: 1,
      },
      this.http,
    )
  }
}

// ---------------------------------------------------------------------------
// Connector
// ---------------------------------------------------------------------------

export class InstagramConnector implements PlatformConnector {
  readonly platform = 'instagram' as const
  readonly mode: ConnectorMode
  readonly id: string
  readonly auth: InstagramLoginFlow | FacebookLoginFlow
  readonly authMode: InstagramAuthMode
  private readonly graph: Graph

  constructor(private readonly opts: InstagramConnectorOptions) {
    this.mode = opts.mode
    this.authMode = opts.env.INSTAGRAM_AUTH_MODE
    const endpoints = { ...INSTAGRAM_ENDPOINTS, ...opts.endpoints }
    const fb = this.authMode === 'facebook_login'
    this.graph = new Graph(fb ? endpoints.fbGraph : endpoints.igGraph, opts.env.META_GRAPH_API_VERSION, opts.http, fb ? opts.env.FACEBOOK_APP_SECRET : undefined)
    this.auth = fb ? new FacebookLoginFlow(opts.env, endpoints, opts.http, this.graph) : new InstagramLoginFlow(opts.env, endpoints, opts.http, this.graph)
    this.id = opts.mode === 'mock' ? `instagram-demo-${this.authMode}` : `instagram-${this.authMode}`
  }

  capabilities(ctx: CapabilityContext): CapabilityReport {
    return instagramCapabilities({ ...ctx, options: { authMode: this.authMode, ...ctx.options } })
  }

  refreshToken(credentials: AccessCredentials, now: Date): Promise<TokenSet> {
    return this.auth.refresh(credentials, now)
  }

  private token(ctx: ConnectorContext, operation: string): string {
    if (!ctx.credentials) throw new ConnectorError({ kind: 'auth_required', platform: 'instagram', operation, message: `${operation}: connect Instagram first` })
    return ctx.credentials.accessToken
  }

  private igUserId(ctx: ConnectorContext): string {
    const id = (ctx.account?.metadata.igUserId as string | undefined) ?? ctx.account?.externalAccountId
    if (!id) throw new ConnectorError({ kind: 'auth_required', platform: 'instagram', operation: 'ig-user', message: 'No Instagram account id stored; reconnect Instagram.' })
    return id
  }

  /** Instagram Login addresses the user as /me; Facebook Login by IG user id. */
  private userPath(ctx: ConnectorContext): string {
    return this.authMode === 'facebook_login' ? this.igUserId(ctx) : 'me'
  }

  private ownOwner(ctx: ConnectorContext): IgOwner {
    return {
      id: ctx.account?.externalAccountId ?? null,
      username: ctx.account?.username ?? null,
      name: ctx.account?.displayName ?? null,
      followers: ctx.account?.followerCount ?? null,
      avatarUrl: ctx.account?.avatarUrl ?? null,
    }
  }

  async getCreatorProfile(ctx: ConnectorContext): Promise<ConnectorResult<CreatorProfileData>> {
    const fields =
      this.authMode === 'facebook_login'
        ? 'id,username,name,profile_picture_url,followers_count,follows_count,media_count'
        : 'id,user_id,username,name,account_type,profile_picture_url,followers_count,follows_count,media_count'
    const res = await this.graph.get<IgUser>(ctx, 'ig-user', this.userPath(ctx), { fields }, this.token(ctx, 'ig-user'))
    const u = res.data
    const id = toText(u.user_id ? String(u.user_id) : null) ?? toText(u.id) ?? this.igUserId(ctx)
    return ok(
      {
        externalAccountId: id,
        username: toText(u.username),
        displayName: toText(u.name) ?? toText(u.username),
        profileUrl: u.username ? `https://www.instagram.com/${u.username}/` : null,
        avatarUrl: toText(u.profile_picture_url),
        followerCount: toCount(u.followers_count),
        followingCount: toCount(u.follows_count),
        postCount: toCount(u.media_count),
        totalViews: null,
        metadata: { igUserId: id },
      },
      [],
      this.graph.lastUsage,
    )
  }

  async getCreatorContent(ctx: ConnectorContext, options: { since: Date; maxItems: number }): Promise<ConnectorResult<ContentItem[]>> {
    const token = this.token(ctx, 'ig-user/media')
    const fields = this.authMode === 'facebook_login' ? `${OWN_FIELDS_BASE},media_product_type` : OWN_FIELDS_BASE
    const items: ContentItem[] = []
    const warnings: string[] = []
    let after: string | undefined
    let useFields = fields
    for (let page = 0; page < 20 && items.length < options.maxItems; page++) {
      let res: HttpResponse<IgPaged<IgMedia>>
      try {
        res = await this.graph.get<IgPaged<IgMedia>>(
          ctx,
          'ig-user/media',
          `${this.userPath(ctx)}/media`,
          { fields: useFields, limit: 50, since: Math.floor(options.since.getTime() / 1000), after },
          token,
        )
      } catch (err) {
        // If a field is not available on this login path, retry once with the minimal set.
        if (isConnectorError(err) && err.kind === 'bad_request' && useFields !== OWN_FIELDS_MINIMAL) {
          warnings.push(`Some media fields were rejected (${err.message}); using the minimal field set.`)
          useFields = OWN_FIELDS_MINIMAL
          page--
          continue
        }
        throw err
      }
      for (const m of res.data.data ?? []) {
        if (m.media_product_type === 'STORY') continue
        const item = normalizeMedia(m, { collectedAt: ctx.now, metricSource: 'public_api', discoveredVia: 'own_content', owner: this.ownOwner(ctx) })
        if (item && (!item.createdAt || item.createdAt >= options.since)) items.push(item)
      }
      after = res.data.paging?.cursors?.after
      if (!res.data.paging?.next || !after) break
    }
    return ok(items.slice(0, options.maxItems), warnings, this.graph.lastUsage)
  }

  async getCreatorAnalytics(
    ctx: ConnectorContext,
    options: { items: Array<{ externalId: string; publishedAt: Date | null }>; since: Date },
  ): Promise<ConnectorResult<CreatorAnalyticsData>> {
    const granted = new Set(ctx.credentials?.scopes ?? ctx.account?.grantedScopes ?? [])
    const insightsScope = this.authMode === 'facebook_login' ? 'instagram_manage_insights' : 'instagram_business_manage_insights'
    if (!granted.has(insightsScope)) {
      return unsupported('own_analytics', `The ${insightsScope} permission was not granted. Reconnect Instagram and approve insights.`)
    }
    const token = this.token(ctx, 'ig-media/insights')
    const items: OwnerItemMetrics[] = []
    const warnings = ['Instagram insights can be delayed up to 48 hours and are lifetime totals; SPOTTER builds the time series by polling.']
    // Newest first, bounded: one call per post.
    const targets = [...options.items].sort((a, b) => (b.publishedAt?.getTime() ?? 0) - (a.publishedAt?.getTime() ?? 0)).slice(0, 40)
    for (const target of targets) {
      const metricsFor = ['views,reach,likes,comments,shares,saved,total_interactions,ig_reels_avg_watch_time', 'views,reach,likes,comments,shares,saved,total_interactions', 'reach,likes,comments,shares,saved']
      let data: IgInsightsResponse | null = null
      for (const metric of metricsFor) {
        try {
          data = (await this.graph.get<IgInsightsResponse>(ctx, 'ig-media/insights', `${target.externalId}/insights`, { metric }, token)).data
          break
        } catch (err) {
          // A metric unsupported for this media type fails the whole call; try a narrower set.
          if (isConnectorError(err) && (err.kind === 'bad_request' || err.kind === 'scope_missing') && metric !== metricsFor[metricsFor.length - 1]) continue
          if (isConnectorError(err) && (err.kind === 'not_found' || err.kind === 'bad_request' || err.kind === 'scope_missing')) {
            warnings.push(`Insights unavailable for one post: ${err.message}`)
            data = null
            break
          }
          throw err
        }
      }
      if (!data) continue
      const extra: Record<string, number> = {}
      const watch = insightValue(data.data, 'ig_reels_avg_watch_time')
      if (watch !== null) extra.avgWatchTimeMs = watch
      const total = insightValue(data.data, 'total_interactions')
      if (total !== null) extra.totalInteractions = total
      items.push({
        externalId: target.externalId,
        viewCount: insightValue(data.data, 'views'),
        reach: insightValue(data.data, 'reach'),
        impressions: null,
        likeCount: insightValue(data.data, 'likes'),
        commentCount: insightValue(data.data, 'comments'),
        shareCount: insightValue(data.data, 'shares'),
        saveCount: insightValue(data.data, 'saved'),
        extra,
      })
    }

    // Daily reach for the account (time series supported for `reach`).
    const accountSeries: CreatorAnalyticsData['accountSeries'] = []
    try {
      const until = Math.floor(ctx.now.getTime() / 1000)
      const since = until - 28 * 86_400
      const res = await this.graph.get<IgInsightsResponse>(
        ctx,
        'ig-user/insights',
        `${this.userPath(ctx)}/insights`,
        { metric: 'reach', period: 'day', metric_type: 'time_series', since, until },
        token,
      )
      for (const v of res.data.data?.[0]?.values ?? []) {
        if (typeof v.value === 'number' && v.end_time) accountSeries.push({ date: v.end_time.slice(0, 10), metrics: { reach: v.value } })
      }
    } catch (err) {
      warnings.push(`Account reach series unavailable: ${err instanceof Error ? err.message : String(err)}`)
    }
    return ok({ items, accountSeries, notes: warnings }, warnings, this.graph.lastUsage)
  }

  async getPublicDiscoveryCandidates(ctx: ConnectorContext, options: { maxItems: number }): Promise<ConnectorResult<DiscoveryBatch>> {
    if (this.authMode !== 'facebook_login') {
      return unsupported(
        'public_discovery',
        'Instagram Login cannot read other accounts’ content. Business Discovery and Hashtag Search require the Facebook Login path (INSTAGRAM_AUTH_MODE=facebook_login with a Page-linked account).',
      )
    }
    const token = this.token(ctx, 'business_discovery')
    const igId = this.igUserId(ctx)
    const cfg = ctx.settings.discovery.instagram
    const cursor: InstagramCursor = { ...((ctx.cursor as InstagramCursor | null) ?? {}) }
    const items: ContentItem[] = []
    const sources: DiscoverySource[] = []
    const warnings: string[] = []

    // Business Discovery: a watchlist of professional accounts, by exact username.
    // When the item budget runs out mid-list, the next run starts where this one
    // stopped, so every account gets its turn instead of the tail never being read.
    const accounts = cfg.businessAccounts
    const startAt = accounts.length ? Math.max(0, Math.floor(cursor.watchIndex ?? 0)) % accounts.length : 0
    let visited = 0
    for (let k = 0; k < accounts.length; k++) {
      if (items.length >= options.maxItems) break
      const username = accounts[(startAt + k) % accounts.length]!
      visited++
      try {
        const res = await this.graph.get<IgBusinessDiscovery>(
          ctx,
          'business_discovery',
          igId,
          { fields: `business_discovery.username(${username}){id,username,name,followers_count,media_count,media.limit(20){${DISCOVERY_MEDIA_FIELDS}}}` },
          token,
        )
        const bd = res.data.business_discovery
        const owner: IgOwner = {
          id: toText(bd?.id) ?? null,
          username: toText(bd?.username) ?? username,
          name: toText(bd?.name) ?? toText(bd?.username),
          followers: toCount(bd?.followers_count),
          avatarUrl: null,
        }
        let n = 0
        for (const m of bd?.media?.data ?? []) {
          const item = normalizeMedia(m, { collectedAt: ctx.now, metricSource: 'public_api', discoveredVia: `watchlist:${username}`, owner })
          if (item) {
            items.push(item)
            n++
          }
        }
        sources.push({ kind: 'business_discovery', value: username, items: n })
      } catch (err) {
        if (isConnectorError(err) && (err.isAuthProblem || err.kind === 'rate_limited')) {
          if (items.length === 0) throw err
          warnings.push(`Business Discovery stopped: ${err.message}`)
          break
        }
        // Personal accounts, typos and age-gated accounts return errors: skip them.
        warnings.push(`@${username}: ${err instanceof Error ? err.message : String(err)}`)
      }
    }

    cursor.watchIndex = accounts.length ? (startAt + visited) % accounts.length : 0

    // Hashtag Search: needs the Instagram Public Content Access feature (App Review).
    const blockedUntil = cursor.hashtagSearchBlockedUntil ? new Date(cursor.hashtagSearchBlockedUntil) : null
    if (cfg.hashtags.length && (!blockedUntil || blockedUntil <= ctx.now)) {
      const firstQueried = { ...(cursor.hashtagFirstQueried ?? {}) }
      const weekAgo = ctx.now.getTime() - 7 * DAY
      for (const [tag, at] of Object.entries(firstQueried)) if (Date.parse(at) < weekAgo) delete firstQueried[tag]
      const ids = { ...(cursor.hashtagIds ?? {}) }
      const seen = new Set(items.map((i) => i.externalId))
      for (const raw of cfg.hashtags) {
        const tag = raw.replace(/^#/, '').toLowerCase()
        if (!firstQueried[tag] && Object.keys(firstQueried).length >= HASHTAG_WEEKLY_BUDGET) {
          warnings.push(`Skipped #${tag}: the 30-hashtags-per-7-days limit is nearly used up.`)
          continue
        }
        try {
          let id = ids[tag]
          if (!id) {
            const found = await this.graph.get<{ data?: Array<{ id?: string }> }>(ctx, 'ig_hashtag_search', 'ig_hashtag_search', { user_id: igId, q: tag }, token)
            id = found.data.data?.[0]?.id
            if (!id) continue
            ids[tag] = id
          }
          firstQueried[tag] ??= ctx.now.toISOString()
          // top_media favours posts that have already done well; recent_media (the last
          // 24 hours) catches new posts before they have. Both count toward the same
          // hashtag, not toward the 30-per-week budget twice.
          const top = await this.graph.get<IgPaged<IgMedia>>(ctx, 'hashtag/top_media', `${id}/top_media`, { user_id: igId, fields: HASHTAG_MEDIA_FIELDS, limit: 25 }, token)
          let recent: IgMedia[] = []
          try {
            const res = await this.graph.get<IgPaged<IgMedia>>(ctx, 'hashtag/recent_media', `${id}/recent_media`, { user_id: igId, fields: HASHTAG_MEDIA_FIELDS, limit: 25 }, token)
            recent = res.data.data ?? []
          } catch (err) {
            if (isConnectorError(err) && (err.isAuthProblem || err.kind === 'rate_limited')) throw err
            warnings.push(`#${tag} recent posts: ${err instanceof Error ? err.message : String(err)}`)
          }
          let n = 0
          for (const [m, via] of [...(top.data.data ?? []).map((m) => [m, `hashtag:${tag}`] as const), ...recent.map((m) => [m, `hashtag:${tag}:recent`] as const)]) {
            if (m.id && seen.has(m.id)) continue
            // Hashtag results never include the author: creator stays unknown.
            const item = normalizeMedia(m, { collectedAt: ctx.now, metricSource: 'public_api', discoveredVia: via, owner: null })
            if (item) {
              seen.add(item.externalId)
              items.push(item)
              n++
            }
          }
          sources.push({ kind: 'hashtag', value: `#${tag}`, items: n })
        } catch (err) {
          if (isConnectorError(err) && err.kind === 'scope_missing') {
            cursor.hashtagSearchBlockedUntil = new Date(ctx.now.getTime() + 7 * DAY).toISOString()
            warnings.push('Hashtag Search is not approved for this app (Instagram Public Content Access requires App Review). Will retry in 7 days.')
            break
          }
          if (isConnectorError(err) && (err.isAuthProblem || err.kind === 'rate_limited')) {
            warnings.push(`Hashtag Search stopped: ${err.message}`)
            break
          }
          warnings.push(`#${tag}: ${err instanceof Error ? err.message : String(err)}`)
        }
      }
      cursor.hashtagFirstQueried = firstQueried
      cursor.hashtagIds = ids
    }
    return ok({ items: items.slice(0, options.maxItems), sources, cursor: cursor as Record<string, unknown> }, warnings, this.graph.lastUsage)
  }

  async refreshPublicMetrics(_ctx: ConnectorContext, _ids: string[]): Promise<ConnectorResult<ContentItem[]>> {
    return unsupported(
      'public_metrics_over_time',
      'Instagram does not allow reading another account’s media by id. Watchlist accounts are re-read every run through Business Discovery instead, which extends their time series.',
    )
  }

  async healthCheck(ctx: ConnectorContext): Promise<HealthCheckResult> {
    try {
      await this.graph.get(ctx, 'ig-user(health)', this.userPath(ctx), { fields: 'id' }, this.token(ctx, 'ig-user(health)'))
      return { ok: true, checkedAt: ctx.now, message: 'Instagram API reachable.', rateLimit: this.graph.lastUsage }
    } catch (err) {
      return { ok: false, checkedAt: ctx.now, message: err instanceof Error ? err.message : String(err) }
    }
  }
}
