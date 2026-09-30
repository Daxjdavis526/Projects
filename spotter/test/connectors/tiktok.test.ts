import { describe, expect, it } from 'vitest'
import { parseEnv } from '@/core/config/env'
import { TikTokConnector } from '@/core/connectors/tiktok/connector'
import { credentials, fakeHttp, fixture, jsonResponse, testContext } from '../support/connectors'

const env = parseEnv({ TIKTOK_CLIENT_KEY: 'tt-key', TIKTOK_CLIENT_SECRET: 'tt-secret' })
const connector = (http: ReturnType<typeof fakeHttp>) => new TikTokConnector({ mode: 'live', env, http })
const allScopes = ['user.info.basic', 'user.info.profile', 'user.info.stats', 'video.list']
const account = {
  externalAccountId: '723f24d7-e717-40f8-a2b6-cb8464cd23b4',
  username: 'coach',
  displayName: 'Coach',
  profileUrl: null,
  avatarUrl: null,
  followerCount: 138_000,
  grantedScopes: allScopes,
  authVariant: 'tiktok_login_kit',
  metadata: {},
}

describe('TikTok Display API', () => {
  it('normalises own videos and stops at the lookback boundary', async () => {
    const http = fakeHttp([[/video\/list\/$/, jsonResponse(fixture('tiktok/video.list.json'))]])
    const result = await connector(http).getCreatorContent(testContext({ credentials: credentials(allScopes), account }), {
      since: new Date('2026-09-01T00:00:00Z'),
      maxItems: 100,
    })
    expect(result.status).toBe('ok')
    if (result.status !== 'ok') return
    expect(result.data).toHaveLength(1) // the second video is older than `since`
    const v = result.data[0]!
    expect(v).toMatchObject({ viewCount: 412_000, likeCount: 21_000, commentCount: 830, shareCount: 1200, durationSeconds: 38, saveCount: null, audioId: null })
    expect(v.hashtags).toEqual(['squat', 'hypertrophy'])
    expect(v.createdAt?.toISOString()).toBe('2026-09-21T14:13:20.000Z')
    // POST with the documented body; fields in the query string.
    expect(http.calls[0]!.method).toBe('POST')
    expect(JSON.parse(http.calls[0]!.body!)).toEqual({ max_count: 20 })
    expect(http.calls[0]!.url.searchParams.get('fields')).toContain('view_count')
  })

  it('requests only the user fields its granted scopes allow', async () => {
    const http = fakeHttp([[/user\/info\/$/, jsonResponse(fixture('tiktok/user.info.json'))]])
    await connector(http).getCreatorProfile(testContext({ credentials: credentials(['user.info.basic']), account: { ...account, grantedScopes: ['user.info.basic'] } }))
    expect(http.calls[0]!.url.searchParams.get('fields')).toBe('open_id,union_id,avatar_url,display_name')
  })

  it('is honest that discovery, private analytics and saves are unavailable', async () => {
    const c = connector(fakeHttp([]))
    expect((await c.getPublicDiscoveryCandidates()).status).toBe('unsupported')
    expect((await c.getCreatorAnalytics()).status).toBe('unsupported')
    const report = c.capabilities({ mode: 'live', configured: true, connected: true, grantedScopes: allScopes })
    expect(report.items.find((i) => i.key === 'audio')!.status).toBe('unavailable')
    expect(report.items.find((i) => i.key === 'own_content')!.status).toBe('available')
  })

  it('maps access_token_invalid to an expired token', async () => {
    const http = fakeHttp([[/user\/info\/$/, jsonResponse({ data: {}, error: { code: 'access_token_invalid', message: 'The access token is invalid or not found in the request.', log_id: 'x' } }, 401)]])
    await expect(connector(http).getCreatorProfile(testContext({ credentials: credentials(allScopes), account }))).rejects.toMatchObject({ kind: 'auth_expired' })
  })
})

describe('TikTok Login Kit tokens', () => {
  it('keeps the rotated refresh token TikTok returns', async () => {
    const http = fakeHttp([[/oauth\/token\/$/, jsonResponse(fixture('tiktok/token.refresh.rotated.json'))]])
    const tokens = await connector(http).refreshToken(credentials(allScopes, { refreshToken: 'rft.old' }), new Date('2026-09-29T12:00:00Z'))
    expect(tokens.refreshToken).toBe('rft.rotated')
    expect(tokens.accessTokenExpiresAt?.toISOString()).toBe('2026-09-30T12:00:00.000Z')
    expect(http.calls[0]!.body).toContain('grant_type=refresh_token')
    expect(http.calls[0]!.body).toContain('refresh_token=rft.old')
  })

  it('detects an error delivered with HTTP 200', async () => {
    const http = fakeHttp([[/oauth\/token\/$/, jsonResponse(fixture('tiktok/token.error.200.json'), 200)]])
    await expect(connector(http).refreshToken(credentials(allScopes), new Date())).rejects.toMatchObject({ kind: 'auth_revoked' })
  })

  it('uses state (no PKCE) for the web flow', () => {
    const url = new URL(connector(fakeHttp([])).auth.authorizationUrl({ state: 's', redirectUri: 'https://app.example/cb', codeVerifier: 'v' }))
    expect(url.origin + url.pathname).toBe('https://www.tiktok.com/v2/auth/authorize/')
    expect(url.searchParams.get('client_key')).toBe('tt-key')
    expect(url.searchParams.get('scope')).toBe('user.info.basic,user.info.profile,user.info.stats,video.list')
    expect(url.searchParams.get('code_challenge')).toBeNull()
  })
})
