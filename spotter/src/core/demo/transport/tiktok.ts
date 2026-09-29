/**
 * Simulated TikTok Login Kit token endpoint and Display API v2. Refresh
 * tokens rotate on every refresh, so the rotation path is always exercised.
 */
import { metricsAt, type DemoWorld } from '../world'
import { json } from './util'

const SCOPES = 'user.info.basic,user.info.profile,user.info.stats,video.list'

export function tiktokHandler(world: DemoWorld, now: Date, url: URL, init: RequestInit | undefined): Response {
  const path = url.pathname.replace(/^\/tiktok\/v2/, '')
  const own = world.ownCreator('tiktok')

  if (path === '/oauth/token/') {
    return json({
      access_token: `demo-tt-at-${now.getTime()}`,
      expires_in: 86_400,
      open_id: own.externalId,
      refresh_expires_in: 31_536_000,
      refresh_token: `demo-tt-rt-${now.getTime()}`,
      scope: SCOPES,
      token_type: 'Bearer',
    })
  }
  if (path === '/oauth/revoke/') return json({})

  const ok = { code: 'ok', message: '', log_id: `demo-${now.getTime()}` }
  if (path === '/user/info/') {
    const fields = new Set((url.searchParams.get('fields') ?? '').split(','))
    const user: Record<string, unknown> = {
      open_id: own.externalId,
      union_id: `union-${own.externalId}`,
      display_name: own.displayName,
      avatar_url: null,
      username: own.handle,
      profile_deep_link: null,
      is_verified: false,
      bio_description: 'Strength coach · technique over ego (demo)',
      follower_count: world.followersAt(own, now),
      following_count: 180,
      likes_count: 4_210_000,
      video_count: world.ownPostsVisible('tiktok', new Date(0), now).length,
    }
    const out: Record<string, unknown> = {}
    for (const [k, v] of Object.entries(user)) if (fields.has(k) && v !== null) out[k] = v
    return json({ data: { user: out }, error: ok })
  }
  if (path === '/video/list/') {
    const body = JSON.parse(String(init?.body ?? '{}')) as { cursor?: number; max_count?: number }
    const before = body.cursor ? new Date(body.cursor) : now
    const max = Math.min(20, body.max_count ?? 10)
    const posts = world
      .ownPostsVisible('tiktok', new Date(now.getTime() - 400 * 86_400_000), now)
      .filter((p) => p.publishedAt < before)
      .reverse()
    const page = posts.slice(0, max)
    return json({
      data: {
        videos: page.map((p) => {
          const m = metricsAt(p, now)!
          return {
            id: p.externalId,
            create_time: Math.floor(p.publishedAt.getTime() / 1000),
            video_description: p.caption.slice(0, 150),
            title: (p.title ?? '').slice(0, 150),
            duration: p.durationSec,
            view_count: m.views,
            like_count: m.likes,
            comment_count: m.comments,
            share_count: m.shares,
          }
        }),
        cursor: page.length ? page[page.length - 1]!.publishedAt.getTime() : body.cursor ?? 0,
        has_more: posts.length > page.length,
      },
      error: ok,
    })
  }
  return json({ data: {}, error: { code: 'invalid_params', message: `Demo API has no route for ${path}`, log_id: 'demo' } }, 400)
}
