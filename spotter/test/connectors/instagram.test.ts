import { describe, expect, it } from 'vitest'
import { parseEnv } from '@/core/config/env'
import { defaultSettings, mergeSettings } from '@/core/config/settings'
import { parseMetaUsage } from '@/core/connectors/instagram/errors'
import { InstagramConnector } from '@/core/connectors/instagram/connector'
import { credentials, fakeHttp, fixture, jsonResponse, testContext } from '../support/connectors'

const igEnv = parseEnv({ INSTAGRAM_APP_ID: 'ig-app', INSTAGRAM_APP_SECRET: 'ig-secret' })
const fbEnv = parseEnv({ INSTAGRAM_AUTH_MODE: 'facebook_login', FACEBOOK_APP_ID: 'fb-app', FACEBOOK_APP_SECRET: 'fb-secret' })
const ownAccount = (grantedScopes: string[]) => ({
  externalAccountId: '17841405309211844',
  username: 'yourhandle',
  displayName: 'You',
  profileUrl: null,
  avatarUrl: null,
  followerCount: 71_000,
  grantedScopes,
  authVariant: 'instagram_login',
  metadata: { igUserId: '17841405309211844' },
})

describe('Instagram Login path', () => {
  it('lists own media; views are left to insights, hidden likes stay null', async () => {
    const http = fakeHttp([[/\/me\/media$/, jsonResponse(fixture('instagram/media.json'))]])
    const c = new InstagramConnector({ mode: 'live', env: igEnv, http })
    const result = await c.getCreatorContent(testContext({ credentials: credentials(['instagram_business_basic']), account: ownAccount(['instagram_business_basic']) }), {
      since: new Date('2026-09-01'),
      maxItems: 50,
    })
    expect(result.status).toBe('ok')
    if (result.status !== 'ok') return
    const [reel, carousel] = result.data
    expect(reel!.caption).toMatch(/Stop cueing chest up/)
    expect(reel!.likeCount).toBe(5837)
    expect(reel!.viewCount).toBeNull()
    expect(reel!.audioType).toBe('original_sound')
    expect(reel!.hashtags).toEqual(['squat', 'formcheck'])
    expect(reel!.title).toBeNull()
    expect(carousel!.mediaType).toBe('carousel')
    expect(carousel!.likeCount).toBeNull()
    // Instagram Login uses graph.instagram.com and /me.
    expect(http.calls[0]!.url.host).toBe('graph.instagram.com')
    expect(http.calls[0]!.url.pathname).toBe('/v26.0/me/media')
    expect(http.calls[0]!.url.searchParams.get('fields')).not.toContain('media_product_type')
  })

  it('merges per-post insights (views, reach, saves, shares, watch time)', async () => {
    const http = fakeHttp([
      [/insights$/, (call) => (call.url.pathname.includes('/me/') ? jsonResponse({ data: [] }) : jsonResponse(fixture('instagram/insights.json')))],
    ])
    const scopes = ['instagram_business_basic', 'instagram_business_manage_insights']
    const c = new InstagramConnector({ mode: 'live', env: igEnv, http })
    const result = await c.getCreatorAnalytics(testContext({ credentials: credentials(scopes), account: ownAccount(scopes) }), {
      items: [{ externalId: '17895695668004550', publishedAt: new Date('2026-09-27') }],
      since: new Date('2026-09-01'),
    })
    expect(result.status).toBe('ok')
    if (result.status !== 'ok') return
    const m = result.data.items[0]!
    expect(m).toMatchObject({ viewCount: 81_200, reach: 60_311, saveCount: 902, shareCount: 311 })
    expect(m.extra.avgWatchTimeMs).toBe(11_200)
  })

  it('cannot discover other accounts, and says why', async () => {
    const c = new InstagramConnector({ mode: 'live', env: igEnv, http: fakeHttp([]) })
    const result = await c.getPublicDiscoveryCandidates(testContext(), { maxItems: 10 })
    expect(result).toMatchObject({ status: 'unsupported', capability: 'public_discovery' })
    expect(c.capabilities({ mode: 'live', configured: true, connected: true, grantedScopes: [] }).items.find((i) => i.key === 'public_discovery')!.status).toBe('unavailable')
  })

  it('exchanges the code (stripping "#_"), then swaps for a 60-day token', async () => {
    const http = fakeHttp([
      [/api\.instagram\.com\/oauth\/access_token$/, jsonResponse(fixture('instagram/token.instagram_login.json'))],
      [/graph\.instagram\.com\/access_token$/, jsonResponse({ access_token: 'IGAAlong', token_type: 'bearer', expires_in: 5_183_944 })],
      [/\/me$/, jsonResponse({ id: 'app-scoped', user_id: '17841405309211844', username: 'yourhandle', followers_count: 71_000, account_type: 'MEDIA_CREATOR' })],
    ])
    const c = new InstagramConnector({ mode: 'live', env: igEnv, http })
    const now = new Date('2026-09-29T12:00:00Z')
    const done = await c.auth.exchangeCode({ code: 'AQBcode#_', redirectUri: 'https://app.example/cb', codeVerifier: null, now })
    expect(http.calls[0]!.body).toMatch(/(^|&)code=AQBcode($|&)/)
    expect(done.tokens.accessToken).toBe('IGAAlong')
    expect(done.tokens.scopes).toEqual(['instagram_business_basic', 'instagram_business_manage_insights'])
    expect(done.account.externalAccountId).toBe('17841405309211844')
    // Long-lived: refresh a week before expiry, never within 24h of issue.
    const creds = credentials(done.tokens.scopes ?? [], { accessTokenExpiresAt: done.tokens.accessTokenExpiresAt, issuedAt: now })
    expect(c.auth.refreshDue!(creds, new Date(now.getTime() + 3_600_000))).toBe(false)
    expect(c.auth.refreshDue!(creds, new Date(now.getTime() + 55 * 86_400_000))).toBe(true)
  })

  it('treats code 190/463 as an expired session', async () => {
    const http = fakeHttp([[/\/me$/, jsonResponse(fixture('instagram/error.expired.json'), 400)]])
    const c = new InstagramConnector({ mode: 'live', env: igEnv, http })
    await expect(c.getCreatorProfile(testContext({ credentials: credentials(['instagram_business_basic']), account: ownAccount([]) }))).rejects.toMatchObject({ kind: 'auth_expired', platformCode: '190/463' })
  })
})

describe('Facebook Login path', () => {
  const fbAccount = { ...ownAccount(['instagram_basic', 'instagram_manage_insights', 'pages_read_engagement']), authVariant: 'facebook_login' }

  it('reads a watchlist through Business Discovery (followers, likes, Reels views incl. paid)', async () => {
    const http = fakeHttp([[/graph\.facebook\.com\/v26\.0\/17841405309211844$/, jsonResponse(fixture('instagram/business_discovery.json'))]])
    const c = new InstagramConnector({ mode: 'live', env: fbEnv, http })
    const settings = mergeSettings(defaultSettings(), { discovery: { instagram: { businessAccounts: ['peercoach'], hashtags: [] } } })
    const result = await c.getPublicDiscoveryCandidates(testContext({ settings, credentials: credentials(fbAccount.grantedScopes), account: fbAccount }), { maxItems: 50 })
    expect(result.status).toBe('ok')
    if (result.status !== 'ok') return
    const item = result.data.items[0]!
    expect(item).toMatchObject({ creatorHandle: 'peercoach', creatorFollowerCount: 30_100, viewCount: 690_000, likeCount: 48_000, mediaType: 'reel', audioType: 'music' })
    expect(item.extraMetrics).toEqual({ viewCountIncludesPaid: 1 })
    // appsecret_proof accompanies every Graph call on this path.
    expect(http.calls[0]!.url.searchParams.get('appsecret_proof')).toMatch(/^[a-f0-9]{64}$/)
  })

  it('rotates through a long watchlist so every account gets read', async () => {
    const http = fakeHttp([[/graph\.facebook\.com\/v26\.0\/17841405309211844$/, jsonResponse(fixture('instagram/business_discovery.json'))]])
    const c = new InstagramConnector({ mode: 'live', env: fbEnv, http })
    const settings = mergeSettings(defaultSettings(), { discovery: { instagram: { businessAccounts: ['a_coach', 'b_coach', 'c_coach'], hashtags: [] } } })
    const asked = () => http.calls.map((call) => /username\((\w+)\)/.exec(call.url.searchParams.get('fields') ?? '')?.[1])
    // A budget of one account's worth of posts per run.
    const first = await c.getPublicDiscoveryCandidates(testContext({ settings, credentials: credentials(fbAccount.grantedScopes), account: fbAccount }), { maxItems: 1 })
    if (first.status !== 'ok') throw new Error(first.status)
    expect(asked()).toEqual(['a_coach'])
    const second = await c.getPublicDiscoveryCandidates(
      testContext({ settings, credentials: credentials(fbAccount.grantedScopes), account: fbAccount, cursor: first.data.cursor }),
      { maxItems: 1 },
    )
    if (second.status !== 'ok') throw new Error(second.status)
    expect(asked()).toEqual(['a_coach', 'b_coach'])
    expect((second.data.cursor as { watchIndex: number }).watchIndex).toBe(2)
  })

  it('runs hashtag search within the 30-per-week budget; results have no author and no views', async () => {
    const http = fakeHttp([
      [/ig_hashtag_search$/, jsonResponse({ data: [{ id: '17843853986012965' }] })],
      [/top_media$/, jsonResponse(fixture('instagram/hashtag_top_media.json'))],
      [/recent_media$/, jsonResponse(fixture('instagram/hashtag_recent_media.json'))],
    ])
    const c = new InstagramConnector({ mode: 'live', env: fbEnv, http })
    const settings = mergeSettings(defaultSettings(), { discovery: { instagram: { businessAccounts: [], hashtags: ['squat'] } } })
    const result = await c.getPublicDiscoveryCandidates(testContext({ settings, credentials: credentials(fbAccount.grantedScopes), account: fbAccount }), { maxItems: 50 })
    expect(result.status).toBe('ok')
    if (result.status !== 'ok') return
    expect(result.data.items[0]).toMatchObject({ creatorId: null, creatorHandle: null, viewCount: null, likeCount: 1200 })
    // recent_media adds new posts top_media has not ranked yet; a post on both lists is kept once.
    expect(result.data.items.map((i) => i.externalId)).toEqual(['17880997618081620', '17912345678901234'])
    expect(result.data.items[1]!.discoveredVia).toBe('hashtag:squat:recent')
    expect((result.data.cursor as { hashtagFirstQueried: Record<string, string> }).hashtagFirstQueried.squat).toBeTruthy()
  })

  it('backs off hashtag search for a week when the feature is not approved', async () => {
    const http = fakeHttp([[/ig_hashtag_search$/, jsonResponse({ error: { message: '(#10) Application does not have permission for this action', type: 'OAuthException', code: 10 } }, 400)]])
    const c = new InstagramConnector({ mode: 'live', env: fbEnv, http })
    const settings = mergeSettings(defaultSettings(), { discovery: { instagram: { businessAccounts: [], hashtags: ['squat'] } } })
    const result = await c.getPublicDiscoveryCandidates(testContext({ settings, credentials: credentials(fbAccount.grantedScopes), account: fbAccount }), { maxItems: 50 })
    expect(result.status).toBe('ok')
    if (result.status !== 'ok') return
    expect(result.warnings.join(' ')).toMatch(/App Review/)
    expect((result.data.cursor as { hashtagSearchBlockedUntil: string }).hashtagSearchBlockedUntil).toBe('2026-10-06T12:00:00.000Z')
  })

  it('refuses to re-poll other accounts’ media by id (not allowed by the API)', async () => {
    const c = new InstagramConnector({ mode: 'live', env: fbEnv, http: fakeHttp([]) })
    expect((await c.refreshPublicMetrics(testContext(), ['1'])).status).toBe('unsupported')
  })
})

describe('Meta rate-limit headers', () => {
  it('parses X-App-Usage and X-Business-Use-Case-Usage', () => {
    const h = new Headers({
      'x-app-usage': '{"call_count":28,"total_time":25,"total_cputime":25}',
      'x-business-use-case-usage': '{"1784":[{"type":"instagram","call_count":91,"total_cputime":10,"total_time":12,"estimated_time_to_regain_access":19}]}',
    })
    const info = parseMetaUsage(h, new Date('2026-09-29T12:00:00Z'))!
    expect(info.used).toBe(91)
    expect(info.resetAt).toBe('2026-09-29T12:19:00.000Z')
  })
})
