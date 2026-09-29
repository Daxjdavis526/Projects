/**
 * Simulated YouTube Data API v3, YouTube Analytics API v2 and Google OAuth,
 * answering with the documented response shapes. Only fields the real API
 * returns are ever produced.
 */
import { hashString } from '../random'
import { metricsAt, type DemoWorld, type WorldPost } from '../world'
import { isoDuration, json, list, queryTokens, relevance } from './util'

const DAY = 86_400_000

function videoResource(world: DemoWorld, post: WorldPost, now: Date) {
  const m = metricsAt(post, now)!
  const creator = world.creator(post.creatorExternalId)
  return {
    kind: 'youtube#video',
    id: post.externalId,
    snippet: {
      publishedAt: post.publishedAt.toISOString(),
      channelId: post.creatorExternalId,
      title: post.title ?? post.caption.split('\n')[0],
      description: post.caption,
      channelTitle: creator?.displayName ?? '',
      tags: post.hashtags,
      categoryId: '17',
      liveBroadcastContent: 'none',
      defaultAudioLanguage: 'en',
      thumbnails: {},
    },
    contentDetails: { duration: isoDuration(post.durationSec) },
    status: { privacyStatus: 'public', publicStatsViewable: true },
    statistics: { viewCount: String(m.views), likeCount: String(m.likes), commentCount: String(m.comments), favoriteCount: '0' },
  }
}

function channelResource(world: DemoWorld, creatorId: string, now: Date) {
  const c = world.creator(creatorId)
  if (!c || c.platform !== 'youtube') return null
  const followers = world.followersAt(c, now)
  // Real subscriber counts are rounded down to three significant figures.
  const digits = Math.max(0, Math.floor(Math.log10(followers)) - 2)
  const rounded = Math.floor(followers / 10 ** digits) * 10 ** digits
  return {
    kind: 'youtube#channel',
    id: c.externalId,
    snippet: { title: c.displayName, customUrl: c.handle, thumbnails: {} },
    contentDetails: { relatedPlaylists: { uploads: `UU${c.externalId}` } },
    statistics: { subscriberCount: String(rounded), hiddenSubscriberCount: false, videoCount: '240', viewCount: String(rounded * 180) },
  }
}

function uploadsOf(world: DemoWorld, creatorId: string, now: Date): WorldPost[] {
  const c = world.creator(creatorId)
  if (!c) return []
  if (c.isOwn) return world.ownPostsVisible('youtube', new Date(now.getTime() - 400 * DAY), now).slice().reverse()
  return world
    .thirdPartyPosts(new Date(now.getTime() - 120 * DAY), now, 'youtube')
    .filter((p) => p.creatorExternalId === creatorId)
    .reverse()
}

const COMMENTS: Record<string, string[]> = {
  squat_depth: ['Deep squats wrecked my knees until I fixed my ankles', 'Parallel is plenty for most people', 'Full depth changed my legs honestly', 'Depends on your femur length'],
  bench_arch: ['Arching is literally the rules in powerlifting', 'This is cheating and everyone knows it', 'Shorter range = more weight, simple'],
  gym_filming: ['Filming yourself is fine, filming others is not', 'The tripod in the walkway is the real crime', 'Gym influencers ruined the vibe'],
  failure_proximity: ['I never know when I actually hit failure', 'RIR is just vibes', 'Failure on isolation, not on squats'],
}

function commentsFor(post: WorldPost): string[] {
  const pool = [...(post.truth.themeKey ? COMMENTS[post.truth.themeKey] ?? [] : []), 'Great breakdown', 'Saving this for leg day', 'What about for beginners?']
  const n = 3 + (hashString(post.externalId) % 3)
  return pool.slice(0, n)
}

export function youtubeHandler(world: DemoWorld, now: Date, url: URL, init: RequestInit | undefined): Response {
  const path = url.pathname
  const q = url.searchParams

  // --- Google OAuth ---
  if (path === '/google/token') {
    const body = new URLSearchParams(String(init?.body ?? ''))
    if (body.get('grant_type') === 'refresh_token') {
      return json({ access_token: `demo-yt-at-${now.getTime()}`, expires_in: 3600, scope: 'https://www.googleapis.com/auth/youtube.readonly https://www.googleapis.com/auth/yt-analytics.readonly', token_type: 'Bearer' })
    }
    return json({
      access_token: `demo-yt-at-${now.getTime()}`,
      expires_in: 3600,
      refresh_token: `demo-yt-rt-${now.getTime()}`,
      scope: 'https://www.googleapis.com/auth/youtube.readonly https://www.googleapis.com/auth/yt-analytics.readonly',
      token_type: 'Bearer',
    })
  }
  if (path === '/google/revoke') return json({})

  // --- Data API ---
  if (path === '/youtube/v3/channels') {
    const ids = q.get('mine') === 'true' ? [world.ownCreator('youtube').externalId] : (q.get('id') ?? '').split(',').filter(Boolean)
    return json({ kind: 'youtube#channelListResponse', items: ids.map((id) => channelResource(world, id, now)).filter(Boolean) })
  }
  if (path === '/youtube/v3/playlistItems') {
    const playlist = q.get('playlistId') ?? ''
    const creatorId = playlist.replace(/^UU/, '')
    const posts = uploadsOf(world, creatorId, now)
    const { page, next } = list(posts, Number(q.get('pageToken') ?? 0), Number(q.get('maxResults') ?? 5))
    return json({
      kind: 'youtube#playlistItemListResponse',
      nextPageToken: next,
      items: page.map((p) => ({ contentDetails: { videoId: p.externalId, videoPublishedAt: p.publishedAt.toISOString() } })),
    })
  }
  if (path === '/youtube/v3/videos') {
    const ids = (q.get('id') ?? '').split(',').filter(Boolean)
    const items = ids.map((id) => world.findPost(id, now)).filter((p): p is WorldPost => !!p && p.platform === 'youtube')
    // Unavailable (deleted/private) videos are simply absent from the response.
    return json({ kind: 'youtube#videoListResponse', items: items.map((p) => videoResource(world, p, now)) })
  }
  if (path === '/youtube/v3/videos:batchGetStats') {
    const ids = (q.get('id') ?? '').split(',').filter(Boolean)
    const found: WorldPost[] = []
    const failed: string[] = []
    for (const id of ids) {
      const post = world.findPost(id, now)
      if (post && post.platform === 'youtube') found.push(post)
      else failed.push(id)
    }
    return json({
      kind: 'youtube#batchGetStatsResponse',
      items: found.map((p) => {
        const m = metricsAt(p, now)!
        return {
          kind: 'youtube#videoStats',
          id: p.externalId,
          snippet: { publishTime: p.publishedAt.toISOString() },
          statistics: { viewCount: m.views, likeCount: m.likes, commentCount: m.comments },
          contentDetails: { duration: isoDuration(p.durationSec), durationMillis: p.durationSec * 1000 },
        }
      }),
      summary: { requestedVideoCount: ids.length, succeededVideoCount: found.length, failedVideoCount: failed.length, failedVideoIds: failed },
    })
  }
  if (path === '/youtube/v3/search') {
    const tokens = queryTokens(q.get('q') ?? '')
    const after = q.get('publishedAfter') ? new Date(q.get('publishedAfter')!) : new Date(now.getTime() - 7 * DAY)
    const ranked = world
      .thirdPartyPosts(after, now, 'youtube')
      .map((p) => ({ p, r: relevance(p, tokens) }))
      .filter((x) => x.r >= 0.34)
      .sort((a, b) => b.r * Math.log10(10 + (metricsAt(b.p, now)?.views ?? 0)) - a.r * Math.log10(10 + (metricsAt(a.p, now)?.views ?? 0)))
      .slice(0, Math.min(50, Number(q.get('maxResults') ?? 5)))
    return json({
      kind: 'youtube#searchListResponse',
      pageInfo: { totalResults: ranked.length, resultsPerPage: ranked.length },
      items: ranked.map(({ p }) => ({ id: { kind: 'youtube#video', videoId: p.externalId }, snippet: { publishedAt: p.publishedAt.toISOString(), channelId: p.creatorExternalId, title: p.title } })),
    })
  }
  if (path === '/youtube/v3/commentThreads') {
    const post = world.findPost(q.get('videoId') ?? '', now)
    if (!post) return json({ error: { code: 404, message: 'Video not found', errors: [{ reason: 'videoNotFound' }] } }, 404)
    return json({ items: commentsFor(post).map((text) => ({ snippet: { topLevelComment: { snippet: { textOriginal: text } } } })) })
  }
  if (path === '/youtube/v3/i18nLanguages') return json({ items: [] })

  // --- Analytics API (with the documented 48–72 h lag) ---
  if (path === '/youtubeanalytics/v2/reports') {
    const lagged = new Date(now.getTime() - 60 * 3_600_000)
    const dimensions = q.get('dimensions')
    const own = world.ownPostsVisible('youtube', new Date(now.getTime() - 500 * DAY), lagged)
    if (dimensions === 'video') {
      const filter = (q.get('filters') ?? '').replace(/^video==/, '').split(',').filter(Boolean)
      const metrics = (q.get('metrics') ?? '').split(',')
      const rows = own
        .filter((p) => filter.includes(p.externalId))
        .map((p) => {
          const m = metricsAt(p, lagged)!
          const values: Record<string, number> = {
            views: m.views,
            engagedViews: Math.round(m.views * 0.82),
            estimatedMinutesWatched: Math.round((m.views * m.avgWatchSec) / 60),
            averageViewDuration: Math.round(m.avgWatchSec),
            averageViewPercentage: Math.round((m.avgWatchSec / p.durationSec) * 1000) / 10,
            likes: m.likes,
            comments: m.comments,
            shares: m.shares,
            subscribersGained: Math.round(m.views * 0.0021),
          }
          return [p.externalId, ...metrics.map((name) => values[name] ?? 0)]
        })
      return json({
        kind: 'youtubeAnalytics#resultTable',
        columnHeaders: [{ name: 'video', columnType: 'DIMENSION' }, ...metrics.map((name) => ({ name, columnType: 'METRIC' }))],
        ...(rows.length ? { rows } : {}),
      })
    }
    if (dimensions === 'day') {
      const rows: Array<Array<string | number>> = []
      for (let d = 89; d >= 3; d--) {
        const end = new Date(now.getTime() - d * DAY)
        const start = new Date(end.getTime() - DAY)
        let views = 0
        for (const p of own) views += (metricsAt(p, end)?.views ?? 0) - (metricsAt(p, start)?.views ?? 0)
        rows.push([start.toISOString().slice(0, 10), views, Math.round(views * 0.4), Math.round(views * 0.002), Math.round(views * 0.0004)])
      }
      return json({
        kind: 'youtubeAnalytics#resultTable',
        columnHeaders: [{ name: 'day' }, { name: 'views' }, { name: 'estimatedMinutesWatched' }, { name: 'subscribersGained' }, { name: 'subscribersLost' }],
        rows,
      })
    }
  }
  return json({ error: { code: 404, message: `Demo API has no route for ${path}`, errors: [{ reason: 'notFound' }] } }, 404)
}
