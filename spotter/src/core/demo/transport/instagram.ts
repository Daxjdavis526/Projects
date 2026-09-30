/**
 * Simulated Instagram Graph API (Facebook Login path, v26.0) and Meta OAuth.
 * Business Discovery returns like/comment counts and Reels view_count;
 * Hashtag Search returns no author and no views — exactly as documented.
 */
import { hashString } from '../random'
import { metricsAt, type DemoWorld, type WorldPost } from '../world'
import { json } from './util'

const DAY = 86_400_000
const PERMISSIONS = ['instagram_basic', 'instagram_manage_insights', 'pages_show_list', 'pages_read_engagement']

function audioType(post: WorldPost): 'MUSIC' | 'ORIGINAL_SOUND' {
  return hashString(`${post.externalId}:audio`) % 100 < 58 ? 'MUSIC' : 'ORIGINAL_SOUND'
}

function mediaResource(post: WorldPost, now: Date, fields: Set<string>) {
  const m = metricsAt(post, now)!
  const all: Record<string, unknown> = {
    id: post.externalId,
    caption: post.caption,
    media_type: 'VIDEO',
    media_product_type: 'REELS',
    timestamp: post.publishedAt.toISOString().replace('.000Z', '+0000'),
    like_count: m.likes,
    comments_count: m.comments,
    view_count: m.views,
    media_audio_type: audioType(post),
  }
  const out: Record<string, unknown> = {}
  for (const [k, v] of Object.entries(all)) if (fields.has(k)) out[k] = v
  return out
}

/** Parse "a,b,media.limit(20){x,y}" style field lists (top level + nested media fields). */
function parseFields(spec: string): { top: Set<string>; media: Set<string> } {
  const mediaMatch = /media(?:\.limit\(\d+\))?\{([^}]*)\}/.exec(spec)
  const media = new Set((mediaMatch?.[1] ?? '').split(',').map((s) => s.trim()).filter(Boolean))
  const top = new Set(spec.replace(/media(?:\.limit\(\d+\))?\{[^}]*\}/, '').split(',').map((s) => s.trim()).filter(Boolean))
  return { top, media }
}

export function instagramHandler(world: DemoWorld, now: Date, url: URL): Response {
  const q = url.searchParams
  const path = url.pathname.replace(/^\/facebook-graph\/v\d+\.\d+/, '').replace(/^\/instagram-graph\/v\d+\.\d+/, '')
  const own = world.ownCreator('instagram')

  // --- OAuth ---
  if (url.pathname.endsWith('/oauth/access_token') || url.pathname === '/instagram/oauth/access_token' || url.pathname === '/instagram-graph/access_token') {
    return json({ access_token: `demo-ig-at-${now.getTime()}`, token_type: 'bearer', expires_in: 60 * 86_400 })
  }
  if (path === '/me/permissions') {
    return json({ data: PERMISSIONS.map((permission) => ({ permission, status: 'granted' })) })
  }
  if (path === '/me/accounts') {
    return json({ data: [{ id: 'demo-page-1', name: 'Your Page (demo)', instagram_business_account: { id: own.externalId, username: own.handle } }] })
  }

  // --- Hashtag Search ---
  if (path === '/ig_hashtag_search') {
    const tag = (q.get('q') ?? '').toLowerCase()
    return json({ data: tag ? [{ id: `demo-hashtag-${tag}` }] : [] })
  }
  const hashtagMedia = /^\/demo-hashtag-([^/]+)\/(top_media|recent_media)$/.exec(path)
  if (hashtagMedia) {
    const tag = hashtagMedia[1]!
    const since = new Date(now.getTime() - (hashtagMedia[2] === 'recent_media' ? 1 : 4) * DAY)
    const fields = new Set((q.get('fields') ?? '').split(','))
    fields.delete('username') // not requestable on hashtag media
    fields.delete('view_count') // Business Discovery only
    fields.delete('media_product_type')
    fields.delete('media_audio_type')
    const posts = world
      .thirdPartyPosts(since, now, 'instagram')
      .filter((p) => p.hashtags.includes(tag) || p.caption.toLowerCase().includes(`#${tag}`))
      .sort((a, b) =>
        hashtagMedia[2] === 'recent_media'
          ? b.publishedAt.getTime() - a.publishedAt.getTime()
          : metricsAt(b, now)!.likes + 3 * metricsAt(b, now)!.comments - (metricsAt(a, now)!.likes + 3 * metricsAt(a, now)!.comments),
      )
      .slice(0, Number(q.get('limit') ?? 25))
    return json({ data: posts.map((p) => mediaResource(p, now, fields)) })
  }

  // --- Media insights (lifetime totals, delayed) ---
  const insights = /^\/([^/]+)\/insights$/.exec(path)
  if (insights) {
    const id = insights[1]!
    if (id === own.externalId || id === 'me') {
      const values = []
      for (let d = 28; d >= 1; d--) {
        const end = new Date(now.getTime() - d * DAY)
        let reach = 0
        for (const p of world.ownPostsVisible('instagram', new Date(end.getTime() - 60 * DAY), end)) {
          reach += (metricsAt(p, end)?.reach ?? 0) - (metricsAt(p, new Date(end.getTime() - DAY))?.reach ?? 0)
        }
        values.push({ value: Math.max(0, reach), end_time: end.toISOString() })
      }
      return json({ data: [{ name: 'reach', period: 'day', values }] })
    }
    const post = world.findPost(id, now)
    if (!post) return json({ error: { message: 'Unsupported get request. Object does not exist', type: 'GraphMethodException', code: 100, error_subcode: 33 } }, 400)
    const lagged = new Date(now.getTime() - 6 * 3_600_000)
    const m = metricsAt(post, lagged) ?? metricsAt(post, now)!
    const metrics = (q.get('metric') ?? '').split(',')
    const all: Record<string, number> = {
      views: m.views,
      reach: m.reach,
      likes: m.likes,
      comments: m.comments,
      shares: m.shares,
      saved: m.saves,
      total_interactions: m.likes + m.comments + m.shares + m.saves,
      ig_reels_avg_watch_time: Math.round(m.avgWatchSec * 1000),
    }
    return json({ data: metrics.filter((n) => n in all).map((name) => ({ name, period: 'lifetime', values: [{ value: all[name] }] })) })
  }

  // --- Own media ---
  const mediaEdge = /^\/([^/]+)\/media$/.exec(path)
  if (mediaEdge) {
    const since = q.get('since') ? new Date(Number(q.get('since')) * 1000) : new Date(now.getTime() - 365 * DAY)
    const posts = world.ownPostsVisible('instagram', since, now).slice().reverse()
    const offset = Number(q.get('after') ?? 0)
    const limit = Number(q.get('limit') ?? 25)
    const page = posts.slice(offset, offset + limit)
    const fields = new Set((q.get('fields') ?? '').split(','))
    fields.delete('view_count') // not on own media: views come from insights
    const more = offset + limit < posts.length
    return json({
      data: page.map((p) => mediaResource(p, now, fields)),
      paging: { cursors: { after: more ? String(offset + limit) : undefined }, ...(more ? { next: 'https://demo-api.spotter.invalid/next' } : {}) },
    })
  }

  // --- IG user, Business Discovery ---
  const userMatch = /^\/([^/]+)$/.exec(path)
  if (userMatch) {
    const fieldsParam = q.get('fields') ?? ''
    const bd = /business_discovery\.username\(([^)]+)\)\{(.*)\}$/.exec(fieldsParam)
    if (bd) {
      const username = bd[1]!
      const creator = world.creators.find((c) => c.platform === 'instagram' && !c.isOwn && c.handle === username)
      if (!creator) {
        return json({ error: { message: `Invalid user id. Cannot find ${username} as a business or creator account`, type: 'OAuthException', code: 110, error_subcode: 2207013 } }, 400)
      }
      const { media } = parseFields(bd[2]!)
      const posts = world
        .thirdPartyPosts(new Date(now.getTime() - 60 * DAY), now, 'instagram')
        .filter((p) => p.creatorExternalId === creator.externalId)
        .reverse()
        .slice(0, 20)
      return json({
        business_discovery: {
          id: creator.externalId,
          username: creator.handle,
          name: creator.displayName,
          followers_count: world.followersAt(creator, now),
          media_count: 300,
          media: { data: posts.map((p) => mediaResource(p, now, media)) },
        },
        id: own.externalId,
      })
    }
    return json({
      id: own.externalId,
      user_id: own.externalId,
      username: own.handle,
      name: own.displayName,
      account_type: 'MEDIA_CREATOR',
      followers_count: world.followersAt(own, now),
      follows_count: 412,
      media_count: world.ownPostsVisible('instagram', new Date(0), now).length,
    })
  }
  return json({ error: { message: `Demo API has no route for ${path}`, type: 'GraphMethodException', code: 100 } }, 400)
}
