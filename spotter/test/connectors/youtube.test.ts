import { describe, expect, it } from 'vitest'
import { parseEnv } from '@/core/config/env'
import { mergeSettings, defaultSettings } from '@/core/config/settings'
import { ConnectorError } from '@/core/connectors/errors'
import { SCOPE_ANALYTICS_READONLY, SCOPE_YOUTUBE_READONLY, YouTubeConnector } from '@/core/connectors/youtube/connector'
import { credentials, fakeHttp, fixture, jsonResponse, testContext, testQuota } from '../support/connectors'

const env = parseEnv({ GOOGLE_CLIENT_ID: 'client-id', GOOGLE_CLIENT_SECRET: 'client-secret', YOUTUBE_API_KEY: 'api-key' })
const connector = (http: ReturnType<typeof fakeHttp>) => new YouTubeConnector({ mode: 'live', env, http })
const account = {
  externalAccountId: 'UC-own',
  username: '@own',
  displayName: 'Own',
  profileUrl: null,
  avatarUrl: null,
  followerCount: 1000,
  grantedScopes: [SCOPE_YOUTUBE_READONLY, SCOPE_ANALYTICS_READONLY],
  authVariant: 'google_oauth',
  metadata: { uploadsPlaylistId: 'UU-own' },
}

describe('YouTube normalisation (videos.list fixture)', () => {
  it('maps documented fields and keeps missing ones null', async () => {
    const http = fakeHttp([
      [/search$/, jsonResponse(fixture('youtube/search.list.json'))],
      [/videos$/, jsonResponse(fixture('youtube/videos.list.json'))],
      [/channels$/, jsonResponse(fixture('youtube/channels.list.json'))],
    ])
    const settings = mergeSettings(defaultSettings(), { discovery: { youtube: { queries: ['squat depth'], maxSearchesPerRun: 1 } } })
    const result = await connector(http).getPublicDiscoveryCandidates(testContext({ settings }), { maxItems: 50 })
    expect(result.status).toBe('ok')
    if (result.status !== 'ok') return
    const items = result.data.items
    // The private video is dropped.
    expect(items.map((i) => i.externalId).sort()).toEqual(['vid-deep-squat', 'vid-hidden-likes'])
    const squat = items.find((i) => i.externalId === 'vid-deep-squat')!
    expect(squat.viewCount).toBe(700_412)
    expect(squat.likeCount).toBe(41_210)
    expect(squat.durationSeconds).toBe(48)
    expect(squat.createdAt?.toISOString()).toBe('2026-09-28T14:05:00.000Z')
    expect(squat.creatorFollowerCount).toBe(30_100)
    expect(squat.creatorHandle).toBe('@smallcoach')
    expect(squat.hashtags).toEqual(expect.arrayContaining(['squat', 'hypertrophy', 'legday', 'rangeofmotion']))
    expect(squat.thumbnailUrl).toMatch(/hqdefault/)
    expect(squat.discoveredVia).toBe('search:squat depth')
    // Not exposed by YouTube: stay null, never 0.
    expect(squat.shareCount).toBeNull()
    expect(squat.saveCount).toBeNull()
    expect(squat.reach).toBeNull()
    expect(squat.audioId).toBeNull()
    // No Shorts flag exists; the connector must not infer one.
    expect(squat.mediaType).toBe('video')

    const hidden = items.find((i) => i.externalId === 'vid-hidden-likes')!
    expect(hidden.likeCount).toBeNull() // hidden like count
    expect(hidden.creatorFollowerCount).toBeNull() // hiddenSubscriberCount
    expect(hidden.durationSeconds).toBe(3723)
    expect(result.data.cursor).toEqual({ queryIndex: 0 })
  })

  it('uses the API key for public calls and a bearer token when connected', async () => {
    const http = fakeHttp([
      [/search$/, jsonResponse(fixture('youtube/search.list.json'))],
      [/videos$/, jsonResponse(fixture('youtube/videos.list.json'))],
      [/channels$/, jsonResponse(fixture('youtube/channels.list.json'))],
    ])
    await connector(http).getPublicDiscoveryCandidates(testContext(), { maxItems: 5 })
    expect(http.calls[0]!.url.searchParams.get('key')).toBe('api-key')
    const http2 = fakeHttp([[/channels$/, jsonResponse(fixture('youtube/channels.list.json'))]])
    await connector(http2).getCreatorProfile(testContext({ credentials: credentials([SCOPE_YOUTUBE_READONLY]), account }))
    expect(http2.calls[0]!.headers.authorization).toBe('Bearer test-access-token')
    expect(http2.calls[0]!.url.searchParams.get('key')).toBeNull()
  })

  it('charges search.list to its own 100-call bucket and rotates queries', async () => {
    const http = fakeHttp([
      [/search$/, jsonResponse(fixture('youtube/search.list.json'))],
      [/videos$/, jsonResponse(fixture('youtube/videos.list.json'))],
      [/channels$/, jsonResponse(fixture('youtube/channels.list.json'))],
    ])
    const now = new Date('2026-09-29T12:00:00Z')
    const quota = testQuota(now)
    const settings = mergeSettings(defaultSettings(), { discovery: { youtube: { queries: ['q-a', 'q-b', 'q-c', 'q-d'], maxSearchesPerRun: 3 } } })
    const result = await connector(http).getPublicDiscoveryCandidates(testContext({ quota, settings, cursor: { queryIndex: 2 } }), { maxItems: 5 })
    const searched = http.calls.filter((c) => c.url.pathname.endsWith('/search')).map((c) => c.url.searchParams.get('q'))
    expect(searched).toEqual(['q-c', 'q-d', 'q-a'])
    expect(result.status === 'ok' && result.data.cursor).toEqual({ queryIndex: 1 })
    expect(await quota.store.used('youtube.search', '2026-09-29')).toBe(3)
    expect(await quota.store.used('youtube.units', '2026-09-29')).toBeGreaterThanOrEqual(2)
  })

  it('refuses to exceed the daily budget before calling the API', async () => {
    const now = new Date('2026-09-29T12:00:00Z')
    const quota = testQuota(now, false)
    for (let i = 0; i < 90; i++) await quota.reserve('youtube.search', 1, 'prefill')
    const http = fakeHttp([])
    await expect(connector(http).getPublicDiscoveryCandidates(testContext({ quota }), { maxItems: 5 })).rejects.toMatchObject({ kind: 'quota_exceeded' })
    expect(http.calls).toHaveLength(0)
  })

  it('re-polls stats with batchGetStats and reports failed ids', async () => {
    const http = fakeHttp([[/videos:batchGetStats$/, jsonResponse(fixture('youtube/batchGetStats.json'))]])
    const result = await connector(http).refreshPublicMetrics(testContext(), ['vid-deep-squat', 'vid-deleted'])
    expect(result.status).toBe('ok')
    if (result.status !== 'ok') return
    expect(result.data).toHaveLength(1)
    expect(result.data[0]!.viewCount).toBe(812_000)
    expect(result.data[0]!.title).toBeNull() // batchGetStats carries no metadata
    expect(result.warnings.join(' ')).toMatch(/1 videos unavailable/)
    expect(http.calls[0]!.url.searchParams.get('id')).toBe('vid-deep-squat,vid-deleted')
  })

  it('classifies quotaExceeded without retrying', async () => {
    const http = fakeHttp([[/videos:batchGetStats$/, jsonResponse(fixture('youtube/error.quotaExceeded.json'), 403)]])
    const error = await connector(http).refreshPublicMetrics(testContext(), ['x']).catch((e: unknown) => e)
    expect(error).toBeInstanceOf(ConnectorError)
    expect((error as ConnectorError).kind).toBe('quota_exceeded')
    expect(http.calls).toHaveLength(1)
  })

  it('retries rate limits with backoff, then succeeds', async () => {
    let n = 0
    const http = fakeHttp([
      [/videos:batchGetStats$/, () => (++n < 3 ? jsonResponse({ error: { code: 403, message: 'slow down', errors: [{ reason: 'rateLimitExceeded' }] } }, 403) : jsonResponse(fixture('youtube/batchGetStats.json')))],
    ])
    const result = await connector(http).refreshPublicMetrics(testContext(), ['vid-deep-squat'])
    expect(result.status).toBe('ok')
    expect(http.calls).toHaveLength(3)
    expect(http.sleeps).toHaveLength(2)
  })

  it('reads own analytics and reports the Analytics API lag', async () => {
    const http = fakeHttp([[/reports$/, (call) => (call.url.searchParams.get('dimensions') === 'day' ? jsonResponse({ columnHeaders: [{ name: 'day' }, { name: 'views' }], rows: [['2026-09-01', 1000]] }) : jsonResponse(fixture('youtube/analytics.reports.json')))]])
    const result = await connector(http).getCreatorAnalytics(testContext({ credentials: credentials(account.grantedScopes), account }), {
      items: [{ externalId: 'own-1', publishedAt: new Date('2026-09-01') }],
      since: new Date('2026-06-01'),
    })
    expect(result.status).toBe('ok')
    if (result.status !== 'ok') return
    const metrics = result.data.items[0]!
    expect(metrics.shareCount).toBe(420)
    expect(metrics.extra.averageViewDuration).toBe(24)
    expect(metrics.extra.analyticsViews).toBe(52_000)
    expect(result.data.accountSeries).toHaveLength(1)
    expect(result.warnings.join(' ')).toMatch(/48–72 hours/)
  })

  it('returns unsupported (not an error) when the analytics scope was declined', async () => {
    const http = fakeHttp([])
    const result = await connector(http).getCreatorAnalytics(testContext({ credentials: credentials([SCOPE_YOUTUBE_READONLY]), account }), { items: [], since: new Date() })
    expect(result).toMatchObject({ status: 'unsupported', capability: 'own_analytics' })
  })
})

describe('Google OAuth', () => {
  it('builds an authorization URL with state, offline access and PKCE', () => {
    const url = new URL(connector(fakeHttp([])).auth.authorizationUrl({ state: 'st4te', redirectUri: 'http://localhost:3000/api/connections/youtube/callback', codeVerifier: 'v'.repeat(64) }))
    expect(url.origin + url.pathname).toBe('https://accounts.google.com/o/oauth2/v2/auth')
    expect(url.searchParams.get('state')).toBe('st4te')
    expect(url.searchParams.get('access_type')).toBe('offline')
    expect(url.searchParams.get('code_challenge_method')).toBe('S256')
    expect(url.searchParams.get('code_challenge')).toMatch(/^[A-Za-z0-9_-]{43}$/)
    expect(url.searchParams.get('scope')).toContain('youtube.readonly')
  })

  it('records the scopes Google actually granted, not the ones requested', async () => {
    const http = fakeHttp([
      [/token$/, jsonResponse(fixture('youtube/token.json'))],
      [/channels$/, jsonResponse(fixture('youtube/channels.list.json'))],
    ])
    const done = await connector(http).auth.exchangeCode({ code: 'c', redirectUri: 'http://localhost/cb', codeVerifier: 'v'.repeat(64), now: new Date('2026-09-29T12:00:00Z') })
    expect(done.tokens.scopes).toEqual([SCOPE_YOUTUBE_READONLY])
    expect(done.tokens.refreshToken).toBe('1//test-refresh')
    expect(done.tokens.accessTokenExpiresAt?.toISOString()).toBe('2026-09-29T12:59:59.000Z')
    expect(done.account.externalAccountId).toBe('UC-small-coach')
    expect(done.account.metadata.uploadsPlaylistId).toBe('UU-small-coach')
    // The secret travels only in the server-to-server token request body.
    expect(http.calls[0]!.body).toContain('client_secret=client-secret')
    expect(http.calls[0]!.body).toContain('code_verifier=')
  })

  it('maps invalid_grant on refresh to a revoked connection', async () => {
    const http = fakeHttp([[/token$/, jsonResponse({ error: 'invalid_grant', error_description: 'Token has been expired or revoked.' }, 400)]])
    await expect(connector(http).refreshToken(credentials([SCOPE_YOUTUBE_READONLY]), new Date())).rejects.toMatchObject({ kind: 'auth_revoked' })
  })
})
