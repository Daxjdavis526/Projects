/**
 * TikTok connector: Login Kit for Web + Display API (developers.tiktok.com,
 * checked 2026-09-29).
 *
 * - OAuth: `state` protects the web flow; TikTok documents PKCE for desktop
 *   and mobile only ("PKCE applies to desktop, iOS, and Android but not web").
 * - Access tokens last 24 hours; refresh tokens 365 days and MAY ROTATE: the
 *   newly returned refresh token must replace the stored one.
 * - The token endpoint can report errors with HTTP 200; the body is checked.
 * - Display API returns only the authorized user's own public videos with
 *   view/like/comment/share counts. No saves, sounds, hashtags field,
 *   transcripts or other creators' content.
 */
import type { Env } from '../../config/env'
import type { ConnectorMode, ContentItem } from '../../domain/types'
import { ConnectorError } from '../errors'
import { classifyByStatus, requestJson, type ErrorClassifier, type HttpDeps } from '../http'
import { extractHashtags, toCount, toDate, toText } from '../normalize-utils'
import { buildUrl, expiresAt, form, splitScopes, tokenSet } from '../oauth-common'
import {
  emptyContentItem,
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
  type HealthCheckResult,
  type OAuthCompletion,
  type OAuthFlow,
  type PlatformConnector,
  type TokenSet,
} from '../types'
import { tiktokCapabilities } from './capabilities'

export type TikTokEnv = Pick<Env, 'TIKTOK_CLIENT_KEY' | 'TIKTOK_CLIENT_SECRET'>

export const TIKTOK_SCOPES = ['user.info.basic', 'user.info.profile', 'user.info.stats', 'video.list']
export const VIDEO_FIELDS = 'id,create_time,cover_image_url,share_url,video_description,duration,title,like_count,comment_count,share_count,view_count'

export interface TikTokEndpoints {
  authorize: string
  api: string
}

export const TIKTOK_ENDPOINTS: TikTokEndpoints = {
  authorize: 'https://www.tiktok.com/v2/auth/authorize/',
  api: 'https://open.tiktokapis.com/v2',
}

export interface TikTokConnectorOptions {
  mode: ConnectorMode
  env: TikTokEnv
  http: HttpDeps
  endpoints?: Partial<TikTokEndpoints>
}

interface TikTokEnvelope<T> {
  data?: T
  error?: { code?: string; message?: string; log_id?: string }
}

interface TikTokVideo {
  id?: string
  create_time?: number
  cover_image_url?: string
  share_url?: string
  video_description?: string
  duration?: number
  title?: string
  like_count?: number
  comment_count?: number
  share_count?: number
  view_count?: number
}

interface TikTokUser {
  open_id?: string
  union_id?: string
  avatar_url?: string
  display_name?: string
  bio_description?: string
  profile_deep_link?: string
  is_verified?: boolean
  username?: string
  follower_count?: number
  following_count?: number
  likes_count?: number
  video_count?: number
}

interface TikTokTokenResponse {
  access_token?: string
  expires_in?: number
  open_id?: string
  refresh_token?: string
  refresh_expires_in?: number
  scope?: string
  token_type?: string
  error?: string
  error_description?: string
  log_id?: string
}

/** v2 API error codes (tiktok-api-v2-error-handling) and OAuth error categories. */
export function classifyTikTokError(operation: string): ErrorClassifier {
  return ({ status, body }) => {
    // v2 API errors are { error: { code, message } }; OAuth errors are { error: "code", error_description }.
    const b = (body ?? {}) as { error?: { code?: string; message?: string } | string; error_description?: string }
    const code = typeof b.error === 'object' ? (b.error.code ?? null) : typeof b.error === 'string' ? b.error : null
    const detail = (typeof b.error === 'object' ? b.error.message : b.error_description) ?? ''
    const base = { platform: 'tiktok' as const, operation, httpStatus: status, platformCode: code ?? null }
    const message = `${operation}: ${code ?? `HTTP ${status}`}${detail ? ` — ${detail}` : ''}`
    switch (code) {
      case 'access_token_invalid':
        return new ConnectorError({ ...base, kind: 'auth_expired', message })
      case 'scope_not_authorized':
      case 'scope_permission_missed':
        return new ConnectorError({ ...base, kind: 'scope_missing', message })
      case 'rate_limit_exceeded':
        return new ConnectorError({ ...base, kind: 'rate_limited', message })
      case 'internal_error':
      case 'server_error':
      case 'temporarily_unavailable':
        return new ConnectorError({ ...base, kind: 'unavailable', message })
      case 'invalid_params':
      case 'invalid_request':
        return new ConnectorError({ ...base, kind: 'bad_request', message })
      case 'invalid_grant':
        return new ConnectorError({ ...base, kind: 'auth_revoked', message })
      case 'invalid_client':
      case 'unauthorized_client':
        return new ConnectorError({ ...base, kind: 'not_configured', message })
      case 'access_denied':
        return new ConnectorError({ ...base, kind: 'forbidden', message })
      default:
        return classifyByStatus('tiktok', operation, status, detail, code ?? null)
    }
  }
}

function assertOk<T>(envelope: TikTokEnvelope<T>, operation: string): T {
  const code = envelope.error?.code
  if (code && code !== 'ok') throw classifyTikTokError(operation)({ status: 200, body: envelope, headers: new Headers() })
  if (!envelope.data) throw new ConnectorError({ kind: 'schema_changed', platform: 'tiktok', operation, message: `${operation}: response had no data` })
  return envelope.data
}

// ---------------------------------------------------------------------------
// OAuth
// ---------------------------------------------------------------------------

export class TikTokOAuthFlow implements OAuthFlow {
  readonly usesPkce = false
  readonly requestedScopes = TIKTOK_SCOPES
  readonly authVariant = 'tiktok_login_kit'
  constructor(
    private readonly env: TikTokEnv,
    private readonly endpoints: TikTokEndpoints,
    private readonly http: HttpDeps,
    private readonly identify: (accessToken: string, scopes: string[]) => Promise<OAuthCompletion['account']>,
  ) {}

  missingConfiguration(): string[] {
    return [!this.env.TIKTOK_CLIENT_KEY && 'TIKTOK_CLIENT_KEY', !this.env.TIKTOK_CLIENT_SECRET && 'TIKTOK_CLIENT_SECRET'].filter(Boolean) as string[]
  }

  authorizationUrl(req: AuthorizationRequest): string {
    return buildUrl(this.endpoints.authorize, {
      client_key: this.env.TIKTOK_CLIENT_KEY,
      response_type: 'code',
      scope: this.requestedScopes.join(','),
      redirect_uri: req.redirectUri,
      state: req.state,
    })
  }

  private async token(body: URLSearchParams, operation: string): Promise<TikTokTokenResponse> {
    const res = await requestJson<TikTokTokenResponse>(
      { platform: 'tiktok', operation, url: `${this.endpoints.api}/oauth/token/`, method: 'POST', body, classify: classifyTikTokError(operation), maxAttempts: 2 },
      this.http,
    )
    // Errors can arrive with HTTP 200: check the body, not only the status.
    if (res.data.error || !res.data.access_token) {
      throw classifyTikTokError(operation)({ status: res.status, body: res.data, headers: res.headers })
    }
    return res.data
  }

  async exchangeCode(input: { code: string; redirectUri: string; codeVerifier?: string | null; now: Date }): Promise<OAuthCompletion> {
    const data = await this.token(
      form({
        client_key: this.env.TIKTOK_CLIENT_KEY,
        client_secret: this.env.TIKTOK_CLIENT_SECRET,
        // TikTok: "The value should be URL decoded." The callback's URL parser already did
        // that once; decoding again would corrupt (or throw on) a code containing "%".
        code: input.code,
        grant_type: 'authorization_code',
        redirect_uri: input.redirectUri,
      }),
      'oauth.exchange',
    )
    const scopes = splitScopes(data.scope, /,/) ?? []
    const tokens = tokenSet({
      accessToken: data.access_token!,
      refreshToken: data.refresh_token ?? null,
      accessTokenExpiresAt: expiresAt(input.now, data.expires_in),
      refreshTokenExpiresAt: expiresAt(input.now, data.refresh_expires_in),
      scopes,
      tokenType: data.token_type ?? 'Bearer',
    })
    const account = await this.identify(tokens.accessToken, scopes)
    return { tokens, account }
  }

  async refresh(credentials: AccessCredentials, now: Date): Promise<TokenSet> {
    if (!credentials.refreshToken) {
      throw new ConnectorError({ kind: 'auth_expired', platform: 'tiktok', operation: 'oauth.refresh', message: 'No refresh token stored; reconnect TikTok.' })
    }
    const data = await this.token(
      form({
        client_key: this.env.TIKTOK_CLIENT_KEY,
        client_secret: this.env.TIKTOK_CLIENT_SECRET,
        grant_type: 'refresh_token',
        refresh_token: credentials.refreshToken,
      }),
      'oauth.refresh',
    )
    return tokenSet({
      accessToken: data.access_token!,
      // "The returned refresh_token may be different … You must use the newly-returned token."
      refreshToken: data.refresh_token ?? null,
      accessTokenExpiresAt: expiresAt(now, data.expires_in),
      refreshTokenExpiresAt: expiresAt(now, data.refresh_expires_in),
      scopes: splitScopes(data.scope, /,/),
      tokenType: data.token_type ?? 'Bearer',
    })
  }

  async revoke(credentials: AccessCredentials): Promise<void> {
    await requestJson(
      {
        platform: 'tiktok',
        operation: 'oauth.revoke',
        url: `${this.endpoints.api}/oauth/revoke/`,
        method: 'POST',
        body: form({ client_key: this.env.TIKTOK_CLIENT_KEY, client_secret: this.env.TIKTOK_CLIENT_SECRET, token: credentials.accessToken }),
        classify: classifyTikTokError('oauth.revoke'),
        maxAttempts: 1,
      },
      this.http,
    )
  }
}

// ---------------------------------------------------------------------------
// Connector
// ---------------------------------------------------------------------------

export function normalizeTikTokVideo(v: TikTokVideo, opts: { collectedAt: Date; owner: { id: string | null; handle: string | null; name: string | null; followers: number | null; avatarUrl: string | null } }): ContentItem | null {
  if (!v.id) return null
  const item = emptyContentItem({ platform: 'tiktok', externalId: v.id, collectedAt: opts.collectedAt, metricSource: 'public_api' })
  const description = toText(v.video_description)
  item.creatorId = opts.owner.id
  item.creatorHandle = opts.owner.handle
  item.creatorName = opts.owner.name
  item.creatorFollowerCount = opts.owner.followers
  item.creatorAvatarUrl = opts.owner.avatarUrl
  item.creatorProfileUrl = opts.owner.handle ? `https://www.tiktok.com/@${opts.owner.handle}` : null
  item.url = toText(v.share_url)
  item.createdAt = toDate(v.create_time)
  item.title = toText(v.title)
  item.caption = description
  item.durationSeconds = toCount(v.duration)
  item.viewCount = toCount(v.view_count)
  item.likeCount = toCount(v.like_count)
  item.commentCount = toCount(v.comment_count)
  item.shareCount = toCount(v.share_count)
  // No structured hashtag field exists; they appear only inside the description.
  item.hashtags = extractHashtags(description, item.title)
  // cover_image_url expires after ~6 hours; stored for immediate display only.
  item.thumbnailUrl = toText(v.cover_image_url)
  item.mediaType = 'video'
  item.discoveredVia = 'own_content'
  return item
}

export class TikTokConnector implements PlatformConnector {
  readonly platform = 'tiktok' as const
  readonly mode: ConnectorMode
  readonly id: string
  readonly auth: TikTokOAuthFlow
  private readonly endpoints: TikTokEndpoints

  constructor(private readonly opts: TikTokConnectorOptions) {
    this.mode = opts.mode
    this.id = opts.mode === 'mock' ? 'tiktok-demo' : 'tiktok-display-api-v2'
    this.endpoints = { ...TIKTOK_ENDPOINTS, ...opts.endpoints }
    this.auth = new TikTokOAuthFlow(opts.env, this.endpoints, opts.http, (token, scopes) => this.identify(token, scopes))
  }

  capabilities(ctx: CapabilityContext): CapabilityReport {
    return tiktokCapabilities(ctx)
  }

  refreshToken(credentials: AccessCredentials, now: Date): Promise<TokenSet> {
    return this.auth.refresh(credentials, now)
  }

  private userFields(scopes: string[]): string {
    const fields = ['open_id', 'union_id', 'avatar_url', 'display_name']
    if (scopes.includes('user.info.profile')) fields.push('username', 'profile_deep_link', 'is_verified', 'bio_description')
    if (scopes.includes('user.info.stats')) fields.push('follower_count', 'following_count', 'likes_count', 'video_count')
    return fields.join(',')
  }

  private async fetchUser(accessToken: string, scopes: string[], ctx?: Pick<ConnectorContext, 'logger' | 'signal'>): Promise<TikTokUser> {
    const operation = 'user.info'
    const res = await requestJson<TikTokEnvelope<{ user?: TikTokUser }>>(
      {
        platform: 'tiktok',
        operation,
        // Only request fields for scopes actually granted: others fail with scope_not_authorized.
        url: buildUrl(`${this.endpoints.api}/user/info/`, { fields: this.userFields(scopes) }),
        headers: { authorization: `Bearer ${accessToken}` },
        classify: classifyTikTokError(operation),
        signal: ctx?.signal,
      },
      { ...this.opts.http, logger: ctx?.logger },
    )
    return assertOk(res.data, operation).user ?? {}
  }

  private async identify(accessToken: string, scopes: string[]): Promise<OAuthCompletion['account']> {
    const user = await this.fetchUser(accessToken, scopes)
    if (!user.open_id) throw new ConnectorError({ kind: 'schema_changed', platform: 'tiktok', operation: 'user.info', message: 'user.info returned no open_id' })
    return {
      externalAccountId: user.open_id,
      username: toText(user.username),
      displayName: toText(user.display_name),
      profileUrl: toText(user.profile_deep_link) ?? (user.username ? `https://www.tiktok.com/@${user.username}` : null),
      avatarUrl: toText(user.avatar_url),
      followerCount: toCount(user.follower_count),
      grantedScopes: scopes,
      authVariant: 'tiktok_login_kit',
      metadata: {},
    }
  }

  private requireToken(ctx: ConnectorContext, operation: string): string {
    if (!ctx.credentials) throw new ConnectorError({ kind: 'auth_required', platform: 'tiktok', operation, message: `${operation}: connect TikTok first` })
    return ctx.credentials.accessToken
  }

  private granted(ctx: ConnectorContext): string[] {
    return ctx.credentials?.scopes ?? ctx.account?.grantedScopes ?? []
  }

  async getCreatorProfile(ctx: ConnectorContext): Promise<ConnectorResult<CreatorProfileData>> {
    const user = await this.fetchUser(this.requireToken(ctx, 'user.info'), this.granted(ctx), ctx)
    const warnings = this.granted(ctx).includes('user.info.stats') ? [] : ['Follower counts need the user.info.stats scope.']
    return ok(
      {
        externalAccountId: user.open_id ?? ctx.account?.externalAccountId ?? '',
        username: toText(user.username),
        displayName: toText(user.display_name),
        profileUrl: toText(user.profile_deep_link),
        avatarUrl: toText(user.avatar_url),
        followerCount: toCount(user.follower_count),
        followingCount: toCount(user.following_count),
        postCount: toCount(user.video_count),
        totalViews: null,
        metadata: { likesCount: toCount(user.likes_count) },
      },
      warnings,
    )
  }

  async getCreatorContent(ctx: ConnectorContext, options: { since: Date; maxItems: number }): Promise<ConnectorResult<ContentItem[]>> {
    if (!this.granted(ctx).includes('video.list')) {
      return unsupported('own_content', 'The video.list scope was not granted. Reconnect TikTok and approve access to your videos.')
    }
    const token = this.requireToken(ctx, 'video.list')
    const owner = {
      id: ctx.account?.externalAccountId ?? null,
      handle: ctx.account?.username ?? null,
      name: ctx.account?.displayName ?? null,
      followers: ctx.account?.followerCount ?? null,
      avatarUrl: ctx.account?.avatarUrl ?? null,
    }
    const items: ContentItem[] = []
    let cursor: number | undefined
    for (let page = 0; page < 25 && items.length < options.maxItems; page++) {
      const res = await requestJson<TikTokEnvelope<{ videos?: TikTokVideo[]; cursor?: number; has_more?: boolean }>>(
        {
          platform: 'tiktok',
          operation: 'video.list',
          url: buildUrl(`${this.endpoints.api}/video/list/`, { fields: VIDEO_FIELDS }),
          method: 'POST',
          headers: { authorization: `Bearer ${token}` },
          body: { max_count: 20, ...(cursor ? { cursor } : {}) },
          classify: classifyTikTokError('video.list'),
          signal: ctx.signal,
        },
        { ...this.opts.http, logger: ctx.logger },
      )
      const data = assertOk(res.data, 'video.list')
      let reachedOlder = false
      for (const v of data.videos ?? []) {
        const item = normalizeTikTokVideo(v, { collectedAt: ctx.now, owner })
        if (!item) continue
        if (item.createdAt && item.createdAt < options.since) {
          reachedOlder = true
          continue
        }
        items.push(item)
      }
      // Sorted newest first by create_time: once older than `since`, stop.
      if (!data.has_more || reachedOlder || !data.cursor) break
      cursor = data.cursor
    }
    return ok(items.slice(0, options.maxItems))
  }

  async getCreatorAnalytics(): Promise<ConnectorResult<CreatorAnalyticsData>> {
    return unsupported(
      'own_analytics',
      'The Display API returns only public counters (views, likes, comments, shares), collected with your videos. Watch time, reach, saves and audience data exist only in the TikTok API for Business Accounts API, which needs a company developer account.',
    )
  }

  async getPublicDiscoveryCandidates(): Promise<ConnectorResult<DiscoveryBatch>> {
    return unsupported(
      'public_discovery',
      'TikTok offers no official API for a commercial app to list other creators’ videos. The Research API is for non-commercial researchers only; the Commercial Content API covers ads. Use Assisted Capture to log TikToks you see.',
    )
  }

  async refreshPublicMetrics(): Promise<ConnectorResult<ContentItem[]>> {
    return unsupported('public_metrics_over_time', 'Only your own videos are available on TikTok; they are refreshed with your content each run.')
  }

  async healthCheck(ctx: ConnectorContext): Promise<HealthCheckResult> {
    try {
      await this.fetchUser(this.requireToken(ctx, 'user.info(health)'), ['user.info.basic'], ctx)
      return { ok: true, checkedAt: ctx.now, message: 'TikTok API reachable.' }
    } catch (err) {
      return { ok: false, checkedAt: ctx.now, message: err instanceof Error ? err.message : String(err) }
    }
  }
}
