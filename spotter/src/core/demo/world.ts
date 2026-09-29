/**
 * The simulated fitness world behind the mock connectors.
 *
 * It is deterministic (seed + anchor time) and unbounded in time: the posts
 * published on day d are generated from (seed, d) on demand, so the world
 * keeps producing new content as real time passes, and a post published
 * "in the future" simply isn't visible yet. Each post has a growth curve,
 * so collecting at 09:00, 13:00 and 19:00 yields a genuine time series with
 * velocity, acceleration and saturation for the analytics to find.
 *
 * Everything produced here is labelled demo data by the connectors and the
 * UI. Nothing here claims to describe real creators or real posts.
 */
import type { MediaType, Platform } from '../domain/types'
import { createRng, hashString, rngFor, type Rng } from './random'
import {
  CREATOR_NAME_PARTS,
  DEMO_THEMES,
  NOISE_POSTS,
  OWN_CATEGORIES,
  OWN_HOOKS,
  type DemoTheme,
  type ThemeLifecycle,
} from './themes'

const HOUR = 3_600_000
const DAY = 24 * HOUR
/** Keeps day indices positive inside external ids. */
const DAY_OFFSET = 100_000

export interface WorldConfig {
  seed: number
  anchor: Date
}

export interface WorldCreator {
  externalId: string
  platform: Platform
  handle: string
  displayName: string
  isOwn: boolean
  /** Followers at the anchor time. */
  followersAtAnchor: number
  /** Relative daily follower growth. */
  followerGrowthPerDay: number
  /** Median views of a typical post, per follower. */
  viewsPerFollower: number
  noisePostsPerDay: number
  themeAffinity: Set<string>
}

export interface WorldPost {
  externalId: string
  platform: Platform
  creatorExternalId: string
  isOwn: boolean
  /** Ground truth for tests only. Never exposed through a connector. */
  truth: { themeKey: string | null; ownCategory: string | null; ownHook: string | null; multiplier: number }
  publishedAt: Date
  title: string | null
  caption: string
  hashtags: string[]
  durationSec: number
  mediaType: MediaType
  finalViews: number
  tauHours: number
  /** > 0: slow start then a breakout S-curve centred this many hours after publication. */
  breakoutDelayHours: number
  likeRate: number
  commentRate: number
  shareRate: number
  saveRate: number
  /** Owner-insight ratios (own posts only). */
  reachPerView: number
  deletedAfterHours: number | null
}

export interface PostMetrics {
  views: number
  likes: number
  comments: number
  shares: number
  saves: number
  reach: number
  /** Average watch time in seconds (own posts' insights). */
  avgWatchSec: number
}

// ---------------------------------------------------------------------------
// Theme lifecycle
// ---------------------------------------------------------------------------

/** Intensity 0..1 of a theme on (fractional) day d, repeating every `period` days. */
export function themeIntensity(lc: ThemeLifecycle, day: number): number {
  const phase = (((day - lc.startDay) % lc.period) + lc.period) % lc.period
  if (phase < lc.riseDays) {
    const x = phase / lc.riseDays
    // Convex rise with a small floor: early adopters first, then accelerating uptake.
    return 0.15 + 0.85 * Math.pow(x, 1.8)
  }
  if (phase < lc.riseDays + lc.plateauDays) return 1
  const intoDecay = phase - lc.riseDays - lc.plateauDays
  if (intoDecay < lc.decayDays) return Math.exp((-3 * intoDecay) / lc.decayDays)
  return 0
}

/** Which part of its cycle a theme is in on day d (ground truth for tests). */
export function themePhase(lc: ThemeLifecycle, day: number): 'rise' | 'plateau' | 'decay' | 'dormant' {
  const phase = (((day - lc.startDay) % lc.period) + lc.period) % lc.period
  if (phase < lc.riseDays) return 'rise'
  if (phase < lc.riseDays + lc.plateauDays) return 'plateau'
  if (phase < lc.riseDays + lc.plateauDays + lc.decayDays) return 'decay'
  return 'dormant'
}

function novelty(phase: ReturnType<typeof themePhase>): number {
  return phase === 'rise' ? 1 : phase === 'plateau' ? 0.72 : phase === 'decay' ? 0.42 : 0.2
}

// ---------------------------------------------------------------------------
// World
// ---------------------------------------------------------------------------

export class DemoWorld {
  readonly seed: number
  readonly anchor: Date
  readonly creators: WorldCreator[]
  private readonly creatorById: Map<string, WorldCreator>
  private readonly dayCache = new Map<number, WorldPost[]>()
  private ownPostsCache: WorldPost[] | null = null

  constructor(config: WorldConfig) {
    this.seed = config.seed
    this.anchor = config.anchor
    this.creators = buildCreators(config.seed)
    this.creatorById = new Map(this.creators.map((c) => [c.externalId, c]))
  }

  dayIndex(t: Date): number {
    return Math.floor((t.getTime() - this.anchor.getTime()) / DAY)
  }

  creator(externalId: string): WorldCreator | undefined {
    return this.creatorById.get(externalId)
  }

  ownCreator(platform: Platform): WorldCreator {
    return this.creators.find((c) => c.isOwn && c.platform === platform)!
  }

  followersAt(creator: WorldCreator, t: Date): number {
    const days = (t.getTime() - this.anchor.getTime()) / DAY
    return Math.max(100, Math.round(creator.followersAtAnchor * Math.exp(creator.followerGrowthPerDay * days)))
  }

  /** Third-party posts published on day d (whether or not they are visible yet). */
  postsOnDay(day: number): WorldPost[] {
    let posts = this.dayCache.get(day)
    if (!posts) {
      posts = generateDay(this, day)
      this.dayCache.set(day, posts)
      if (this.dayCache.size > 400) this.dayCache.delete(this.dayCache.keys().next().value!)
    }
    return posts
  }

  /** Third-party posts visible at `now`, published within [from, now]. */
  thirdPartyPosts(from: Date, now: Date, platform?: Platform): WorldPost[] {
    const out: WorldPost[] = []
    for (let d = this.dayIndex(from); d <= this.dayIndex(now); d++) {
      for (const post of this.postsOnDay(d)) {
        if (platform && post.platform !== platform) continue
        if (post.publishedAt < from || post.publishedAt > now) continue
        if (isDeleted(post, now)) continue
        out.push(post)
      }
    }
    return out
  }

  /** All of the demo creator's own posts, from 150 days before the anchor onwards. */
  ownPosts(): WorldPost[] {
    this.ownPostsCache ??= generateOwnPosts(this)
    return this.ownPostsCache
  }

  ownPostsVisible(platform: Platform, from: Date, now: Date): WorldPost[] {
    return this.ownPosts().filter((p) => p.platform === platform && p.publishedAt >= from && p.publishedAt <= now)
  }

  /** Look a post up by id (third-party or own). Returns undefined if unknown or deleted at `now`. */
  findPost(externalId: string, now: Date): WorldPost | undefined {
    const own = this.ownPosts().find((p) => p.externalId === externalId)
    if (own) return own.publishedAt <= now ? own : undefined
    const day = parseDayFromId(externalId)
    if (day === null) return undefined
    const post = this.postsOnDay(day).find((p) => p.externalId === externalId)
    if (!post || post.publishedAt > now || isDeleted(post, now)) return undefined
    return post
  }
}

export function isDeleted(post: WorldPost, now: Date): boolean {
  return post.deletedAfterHours !== null && now.getTime() - post.publishedAt.getTime() > post.deletedAfterHours * HOUR
}

function parseDayFromId(externalId: string): number | null {
  const match = /-d(\d+)-/.exec(externalId)
  return match ? Number(match[1]) - DAY_OFFSET : null
}

/** Cumulative share of final views reached at a given age. */
export function growthFraction(post: WorldPost, ageHours: number): number {
  if (ageHours <= 0) return 0
  if (post.breakoutDelayHours > 0) {
    const width = Math.max(3, post.tauHours / 4)
    const logistic = (x: number) => 1 / (1 + Math.exp(-(x - post.breakoutDelayHours) / width))
    const start = logistic(0)
    const s = (logistic(ageHours) - start) / (1 - start)
    // A modest organic start before the breakout takes off.
    const organic = 0.06 * (1 - Math.exp(-ageHours / 12))
    return Math.min(1, organic + (1 - 0.06) * s)
  }
  return 1 - Math.exp(-ageHours / post.tauHours)
}

export function metricsAt(post: WorldPost, now: Date): PostMetrics | null {
  const ageHours = (now.getTime() - post.publishedAt.getTime()) / HOUR
  if (ageHours < 0) return null
  const g = growthFraction(post, ageHours)
  const views = Math.round(post.finalViews * g)
  // Engagement lags views slightly early on and then settles.
  const settle = 0.85 + 0.15 * Math.min(1, ageHours / 48)
  return {
    views,
    likes: Math.round(views * post.likeRate * settle),
    comments: Math.round(views * post.commentRate * settle),
    shares: Math.round(views * post.shareRate),
    saves: Math.round(views * post.saveRate),
    reach: Math.round(views * post.reachPerView),
    avgWatchSec: Math.round(post.durationSec * (0.42 + 0.3 * Math.min(1, post.truth.multiplier / 4)) * 10) / 10,
  }
}

// ---------------------------------------------------------------------------
// Generation
// ---------------------------------------------------------------------------

function slug(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '')
}

function buildCreators(seed: number): WorldCreator[] {
  const rng = createRng(hashString('creators', seed))
  const creators: WorldCreator[] = []
  const usedNames = new Set<string>()
  const makeName = () => {
    for (;;) {
      const name = `${rng.pick(CREATOR_NAME_PARTS.first)} ${rng.pick(CREATOR_NAME_PARTS.second)}`
      if (!usedNames.has(name)) {
        usedNames.add(name)
        return name
      }
    }
  }
  const themeKeys = DEMO_THEMES.map((t) => t.key)
  const addThirdParty = (platform: Platform, count: number, minFollowers: number, maxFollowers: number, vpf: number) => {
    for (let i = 0; i < count; i++) {
      const name = makeName()
      const logMin = Math.log(minFollowers)
      const logMax = Math.log(maxFollowers)
      const followers = Math.round(Math.exp(logMin + rng.next() * (logMax - logMin)))
      const prefix = platform === 'youtube' ? 'yt' : platform === 'instagram' ? 'ig' : 'tt'
      creators.push({
        externalId: `demo-${prefix}-creator-${String(i + 1).padStart(2, '0')}`,
        platform,
        handle: platform === 'youtube' ? `@${slug(name)}` : slug(name).slice(0, 24),
        displayName: name,
        isOwn: false,
        followersAtAnchor: followers,
        followerGrowthPerDay: rng.float(0.0002, 0.0025),
        // Smaller accounts often punch above their size on short-form.
        viewsPerFollower: vpf * rng.logNormal(1, 0.45) * Math.pow(100_000 / followers, 0.12),
        noisePostsPerDay: rng.float(0.3, 0.8),
        themeAffinity: new Set(rng.sample(themeKeys, rng.int(3, 5))),
      })
    }
  }
  addThirdParty('youtube', 60, 9_000, 3_200_000, 0.22)
  addThirdParty('instagram', 36, 8_000, 1_900_000, 0.2)

  const own = (platform: Platform, followers: number, vpf: number, growth: number): WorldCreator => ({
    externalId: `demo-${platform}-own`,
    platform,
    handle: platform === 'youtube' ? '@yourchannel.demo' : 'yourhandle.demo',
    displayName: 'Your channel (demo)',
    isOwn: true,
    followersAtAnchor: followers,
    followerGrowthPerDay: growth,
    viewsPerFollower: vpf,
    noisePostsPerDay: 0,
    themeAffinity: new Set(),
  })
  creators.push(own('youtube', 46_200, 0.38, 0.0016), own('instagram', 71_400, 0.31, 0.0012), own('tiktok', 138_000, 0.26, 0.0021))
  return creators
}

function pickCreator(world: DemoWorld, rng: Rng, platform: Platform, themeKey: string | null): WorldCreator {
  const pool = world.creators.filter((c) => !c.isOwn && c.platform === platform)
  return rng.weighted(pool, (c) => (themeKey && c.themeAffinity.has(themeKey) ? 4 : 1))
}

function hashtagsFor(rng: Rng, specific: string[], generic: string[]): string[] {
  const tags = new Set(rng.sample(specific, rng.int(2, Math.min(5, specific.length))))
  for (const tag of rng.sample(generic, rng.int(0, 2))) tags.add(tag)
  return [...tags]
}

function composeCaption(rng: Rng, lead: string, tags: string[], platform: Platform): string {
  const tagLine = tags.map((t) => `#${t}`).join(' ')
  if (platform === 'youtube') return `${lead}\n\n${tagLine}`
  return rng.chance(0.5) ? `${lead} ${tagLine}` : `${lead}\n.\n.\n${tagLine}`
}

const GENERIC_TAGS = ['gym', 'fitness', 'gymtok', 'fitnesstips', 'workout', 'lifting']

function makeThemePost(world: DemoWorld, rng: Rng, theme: DemoTheme, day: number, index: number): WorldPost {
  const platform = rng.weighted(theme.platforms, (p) => (p === 'youtube' ? 0.6 : 0.4))
  const creator = pickCreator(world, rng, platform, theme.key)
  const publishedAt = new Date(world.anchor.getTime() + day * DAY + rng.float(0, DAY))
  const dayFrac = day + (publishedAt.getTime() - world.anchor.getTime() - day * DAY) / DAY
  const intensity = themeIntensity(theme.lifecycle, dayFrac)
  const phase = themePhase(theme.lifecycle, dayFrac)
  const mu = theme.heat * (0.5 + 0.5 * intensity) * novelty(phase) * 1.15
  const multiplier = Math.exp(rng.normal(mu, 0.5))
  const followers = world.followersAt(creator, publishedAt)
  const title = rng.pick(theme.titles)
  const tags = hashtagsFor(rng, theme.hashtags, GENERIC_TAGS)
  const captionLead = rng.chance(0.6) ? rng.pick(theme.captions) : title
  const breakout = phase === 'rise' && rng.chance(0.22)
  const prefix = platform === 'youtube' ? 'yt' : 'ig'
  return {
    externalId: `demo-${prefix}-d${day + DAY_OFFSET}-${theme.key}-${index}`,
    platform,
    creatorExternalId: creator.externalId,
    isOwn: false,
    truth: { themeKey: theme.key, ownCategory: null, ownHook: null, multiplier },
    publishedAt,
    title: platform === 'youtube' ? title : null,
    caption: composeCaption(rng, captionLead, tags, platform),
    hashtags: tags,
    durationSec: rng.int(theme.durationRange[0], theme.durationRange[1]),
    mediaType: platform === 'youtube' ? 'short' : 'reel',
    finalViews: Math.max(300, Math.round(followers * creator.viewsPerFollower * multiplier)),
    tauHours: platform === 'youtube' ? rng.float(22, 50) : rng.float(12, 30),
    breakoutDelayHours: breakout ? rng.float(8, 30) : 0,
    likeRate: theme.likeRate * rng.logNormal(1, 0.22),
    commentRate: theme.commentRate * rng.logNormal(1, 0.3),
    shareRate: 0.004 * rng.logNormal(1, 0.4),
    saveRate: 0.006 * rng.logNormal(1, 0.4),
    reachPerView: 0.7,
    deletedAfterHours: rng.chance(0.015) ? rng.float(30, 120) : null,
  }
}

function makeNoisePost(world: DemoWorld, rng: Rng, creator: WorldCreator, day: number, index: number): WorldPost {
  const publishedAt = new Date(world.anchor.getTime() + day * DAY + rng.float(0, DAY))
  const title = rng.pick(NOISE_POSTS.titles)
  const tags = hashtagsFor(rng, NOISE_POSTS.hashtags, GENERIC_TAGS)
  const multiplier = Math.exp(rng.normal(0, 0.4))
  const prefix = creator.platform === 'youtube' ? 'yt' : 'ig'
  return {
    externalId: `demo-${prefix}-d${day + DAY_OFFSET}-noise-${creator.externalId.slice(-2)}-${index}`,
    platform: creator.platform,
    creatorExternalId: creator.externalId,
    isOwn: false,
    truth: { themeKey: null, ownCategory: null, ownHook: null, multiplier },
    publishedAt,
    title: creator.platform === 'youtube' ? title : null,
    caption: composeCaption(rng, rng.chance(0.5) ? rng.pick(NOISE_POSTS.captions) : title, tags, creator.platform),
    hashtags: tags,
    durationSec: rng.int(20, 180),
    mediaType: creator.platform === 'youtube' ? (rng.chance(0.8) ? 'short' : 'video') : 'reel',
    finalViews: Math.max(200, Math.round(world.followersAt(creator, publishedAt) * creator.viewsPerFollower * multiplier)),
    tauHours: creator.platform === 'youtube' ? rng.float(22, 60) : rng.float(12, 30),
    breakoutDelayHours: 0,
    likeRate: 0.045 * rng.logNormal(1, 0.25),
    commentRate: 0.003 * rng.logNormal(1, 0.35),
    shareRate: 0.003 * rng.logNormal(1, 0.4),
    saveRate: 0.004 * rng.logNormal(1, 0.4),
    reachPerView: 0.7,
    deletedAfterHours: null,
  }
}

function generateDay(world: DemoWorld, day: number): WorldPost[] {
  const posts: WorldPost[] = []
  for (const theme of DEMO_THEMES) {
    const rng = rngFor(world.seed, 'theme', theme.key, day)
    const intensity = themeIntensity(theme.lifecycle, day + 0.5)
    const count = rng.poisson(theme.peakPostsPerDay * intensity + 0.12)
    for (let i = 0; i < count; i++) posts.push(makeThemePost(world, rng, theme, day, i))
  }
  for (const creator of world.creators) {
    if (creator.isOwn) continue
    const rng = rngFor(world.seed, 'noise', creator.externalId, day)
    const count = rng.poisson(creator.noisePostsPerDay)
    for (let i = 0; i < count; i++) posts.push(makeNoisePost(world, rng, creator, day, i))
  }
  return posts.sort((a, b) => a.publishedAt.getTime() - b.publishedAt.getTime())
}

// ---------------------------------------------------------------------------
// The demo creator's own content
// ---------------------------------------------------------------------------

const OWN_RATE_PER_DAY: Record<Platform, number> = { youtube: 0.24, instagram: 0.32, tiktok: 0.38 }
const OWN_HISTORY_DAYS = 150
const OWN_FUTURE_DAYS = 400

function lengthEffect(durationSec: number): number {
  if (durationSec < 30) return 0.08
  if (durationSec <= 45) return 0.18
  if (durationSec <= 60) return 0
  if (durationSec <= 90) return -0.2
  return -0.35
}

function hourEffect(hour: number): number {
  if (hour >= 17 && hour <= 20) return 0.16
  if (hour >= 6 && hour <= 9) return -0.12
  return 0
}

function generateOwnPosts(world: DemoWorld): WorldPost[] {
  const posts: WorldPost[] = []
  for (const platform of ['youtube', 'instagram', 'tiktok'] as const) {
    const creator = world.ownCreator(platform)
    for (let day = -OWN_HISTORY_DAYS; day <= OWN_FUTURE_DAYS; day++) {
      const rng = rngFor(world.seed, 'own', platform, day)
      if (!rng.chance(OWN_RATE_PER_DAY[platform])) continue
      const category = rng.weighted(OWN_CATEGORIES, (c) => c.weight)
      const hook = rng.weighted(OWN_HOOKS, (h) => h.weight)
      // Hours are in UTC here; the demo creator profile defaults to a US timezone,
      // so these land at believable local posting times.
      const localHour = rng.weighted([7, 8, 12, 13, 17, 18, 19, 20, 21], (h) => (h >= 17 && h <= 20 ? 2.4 : 1))
      const publishedAt = new Date(world.anchor.getTime() + day * DAY)
      publishedAt.setUTCHours(localHour + 5, rng.int(0, 59), 0, 0)
      const durationSec =
        platform === 'youtube' && rng.chance(0.18) ? rng.int(420, 960) : rng.weighted([22, 34, 41, 52, 68, 95], () => 1) + rng.int(-4, 4)
      const isLongForm = durationSec > 180
      const effect =
        category.effect + hook.effect + (isLongForm ? 0 : lengthEffect(durationSec)) + hourEffect(localHour) + rng.normal(0, 0.33)
      const multiplier = Math.exp(effect)
      const baseline = world.followersAt(creator, publishedAt) * creator.viewsPerFollower * (isLongForm ? 0.45 : 1)
      const title = rng.pick(category.titles)
      const lead = rng.pick(hook.captionLead)
      const tags = hashtagsFor(rng, ['strengthcoach', 'hypertrophy', 'formcheck', 'liftingtips', 'gymtips', 'strengthtraining'], GENERIC_TAGS)
      posts.push({
        externalId: `demo-${platform}-own-${day + DAY_OFFSET}`,
        platform,
        creatorExternalId: creator.externalId,
        isOwn: true,
        truth: { themeKey: null, ownCategory: category.key, ownHook: hook.key, multiplier },
        publishedAt,
        title: platform === 'instagram' ? null : title,
        caption: composeCaption(rng, `${lead} ${title}`, tags, platform),
        hashtags: tags,
        durationSec,
        mediaType: platform === 'youtube' ? (isLongForm ? 'video' : 'short') : platform === 'instagram' ? 'reel' : 'video',
        finalViews: Math.max(500, Math.round(baseline * multiplier)),
        tauHours: platform === 'youtube' ? rng.float(40, 110) : rng.float(20, 48),
        breakoutDelayHours: multiplier > 3 && rng.chance(0.35) ? rng.float(10, 26) : 0,
        likeRate: 0.052 * rng.logNormal(1, 0.2) * (category.key === 'gym_humor' ? 1.25 : 1),
        commentRate: 0.0045 * rng.logNormal(1, 0.3) * (category.key === 'technique_controversy' ? 1.9 : 1),
        shareRate: 0.005 * rng.logNormal(1, 0.35),
        saveRate: (category.key === 'technique_tutorial' || category.key === 'science_breakdown' ? 0.016 : 0.006) * rng.logNormal(1, 0.3),
        reachPerView: rng.float(0.62, 0.8),
        deletedAfterHours: null,
      })
    }
  }
  return posts.sort((a, b) => a.publishedAt.getTime() - b.publishedAt.getTime())
}

export const DEFAULT_DEMO_SEED = 20_260_929

/** The world instance for a profile, cached per (seed, anchor). */
const worldCache = new Map<string, DemoWorld>()
export function getWorld(config: WorldConfig): DemoWorld {
  const key = `${config.seed}:${config.anchor.getTime()}`
  let world = worldCache.get(key)
  if (!world) {
    world = new DemoWorld(config)
    worldCache.set(key, world)
    if (worldCache.size > 8) worldCache.delete(worldCache.keys().next().value!)
  }
  return world
}
