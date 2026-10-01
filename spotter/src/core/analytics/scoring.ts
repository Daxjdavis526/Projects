/**
 * The Trend Score: a deterministic, inspectable 0–100 number.
 *
 * Six components, each a documented function of measured inputs:
 *
 *   velocity        how fast the trend's posts are gaining views right now
 *   outperformance  how far posts run above their own creators' baselines
 *   repetition      how many independent creators are doing it, how alike
 *   engagement      engagement per view against this platform's niche norm
 *   recency         how fresh the posts are
 *   acceleration    momentum: performance-weighted posts in the last 3 days
 *                   versus the 3 days before
 *
 * Trend Score = Σ weightᵢ · scoreᵢ / Σ weightᵢ over the components whose
 * inputs exist. A component with missing inputs is reported as unavailable
 * and its weight is redistributed — it is never silently scored as zero.
 * AI contributes only which posts belong together; it never sets a number.
 */
import type { TrendWeights } from '../config/settings'
import type { Platform, ScoreComponent, TrendComponentKey, TrendComponents, TrendMetrics } from '../domain/types'
import { TREND_COMPONENT_KEYS } from '../domain/types'
import type { NicheNorms } from './baseline'
import { type ItemSeries, observedValueAt } from './metrics'
import { clamp, logLogistic, median, ratioScore, round, sum } from './stats'

const HOUR = 3_600_000

/** Everything the scorer needs to know about one post in a cluster. */
export interface ScoringItem {
  contentItemId: string
  platform: Platform
  /** Stable creator key; null when the platform does not say who posted it. */
  creatorKey: string | null
  publishedAt: Date | null
  views: number | null
  likes: number | null
  comments: number | null
  shares: number | null
  saves: number | null
  followers: number | null
  viewsPerHour: number | null
  velocityMeasured: boolean
  engagementsPerHour: number | null
  weightedEngagementRate: number | null
  outperformance: number | null
  outperformanceMethod: 'creator_baseline' | 'follower_ratio' | 'platform_median' | null
  snapshotCount: number
  /** Similarity to the cluster centroid (cohesion). */
  similarity: number
  platformWeight: number
  series: ItemSeries
}

export interface NichePace {
  /** Median views/hour of fresh (≤ 96h) tracked posts on this platform right now: the unit of "attention". */
  medianViewsPerHour: number | null
  medianEngagementsPerHour: number | null
  /**
   * Medians by post age, so a post is compared with posts as old as it is —
   * every post slows down with age, and a week-old post should not look
   * "slow" next to one published this morning.
   */
  byAge?: Array<{ maxAgeHours: number; medianViewsPerHour: number | null; medianEngagementsPerHour: number | null }>
}

/** Age buckets for NichePace.byAge (upper bounds in hours). */
export const PACE_AGE_BUCKETS = [24, 72, 168, Infinity] as const

/** The typical pace for a post of this age on this platform, falling back to the fresh-post median. */
export function typicalPace(pace: NichePace | undefined, ageHours: number | null, kind: 'views' | 'engagements'): number | null {
  if (!pace) return null
  const pick = (p: { medianViewsPerHour: number | null; medianEngagementsPerHour: number | null }) => (kind === 'views' ? p.medianViewsPerHour : p.medianEngagementsPerHour)
  if (ageHours !== null && pace.byAge) {
    const bucket = pace.byAge.find((b) => ageHours < b.maxAgeHours)
    const value = bucket ? pick(bucket) : null
    if (value) return value
  }
  return pick(pace)
}

export interface ScoringInput {
  items: ScoringItem[]
  now: Date
  norms: NicheNorms
  /** The niche's typical pace per platform, so velocity is judged relative to it. */
  pace?: Partial<Record<Platform, NichePace>>
  weights: TrendWeights
  /** Share of posts sharing the most common format or hook type (0–1). */
  patternConsistency: number
  /** Similarity scale of the embedding model, to turn cohesion into 0–1. */
  cohesionRange: { low: number; high: number }
}

export interface ScoringResult {
  trendScore: number
  components: TrendComponents
  confidence: number
  confidenceLabel: 'high' | 'medium' | 'low'
  metrics: TrendMetrics
  acceleration: { ratio: number | null; basis: 'measured' | 'none' }
  effectiveCreators: number
}

// ---------------------------------------------------------------------------
// Momentum: performance-weighted post arrivals
// ---------------------------------------------------------------------------

const DAY = 24 * HOUR
export const MOMENTUM_WINDOW_HOURS = 72

/**
 * How much one post counts toward momentum: its outperformance, capped to
 * 0.25–4× so one viral post (or one giant account) cannot swing the result,
 * and 1 when there is no baseline to judge it against.
 */
function momentumWeight(item: ScoringItem): number {
  const out = item.outperformance === null ? 1 : clamp(item.outperformance, 0.25, 4)
  return out * item.platformWeight
}

/** Performance-weighted count of the posts published in the 72 hours before `at`. */
export function momentumAt(items: ScoringItem[], at: number): { weighted: number; posts: number } {
  let weighted = 0
  let posts = 0
  for (const item of items) {
    const pub = item.publishedAt?.getTime()
    if (pub === undefined || pub >= at || pub < at - MOMENTUM_WINDOW_HOURS * HOUR) continue
    weighted += momentumWeight(item)
    posts++
  }
  return { weighted, posts }
}

/**
 * Momentum now, three days ago, and at its peak over the last ten days,
 * reconstructed from the posts' publication times — so a post discovered
 * late still counts on the day it was published, and discovery timing does
 * not masquerade as growth. Growth per day compares the two non-overlapping
 * 72-hour windows; one pseudo-post on each side keeps tiny trends from
 * swinging wildly (2 posts vs 1 is not "doubling").
 */
export function momentum(items: ScoringItem[], now: Date) {
  const t = now.getTime()
  const series = Array.from({ length: 11 }, (_, k) => momentumAt(items, t - k * DAY))
  const current = series[0]!
  const prior = series[3]!
  const perDay = Math.pow((current.weighted + 1) / (prior.weighted + 1), 1 / 3)
  return {
    current,
    prior,
    peak: Math.max(...series.map((s) => s.weighted)),
    perDay,
    dated: items.some((i) => i.publishedAt),
  }
}

function fmt(n: number | null | undefined, digits = 0): string {
  if (n === null || n === undefined || !Number.isFinite(n)) return '—'
  const abs = Math.abs(n)
  if (abs >= 1e6) return `${round(n / 1e6, 1)}M`
  if (abs >= 1e4) return `${round(n / 1e3, 0)}k`
  if (abs >= 1e3) return `${round(n / 1e3, 1)}k`
  return String(round(n, digits))
}

function component(score: number | null, weight: number, inputs: ScoreComponent['inputs'], explanation: string): ScoreComponent {
  return { score: score === null ? null : round(clamp(score), 1), weight, inputs, explanation }
}

// ---------------------------------------------------------------------------
// Acceleration: same-basis comparison of two windows
// ---------------------------------------------------------------------------

const WINDOW_HOURS = 12
const LOOKBACK_HOURS = 24

/**
 * Views gained per hour inside [from, to] for one item, using only observed
 * snapshots (and zero at publication). Returns null when the window is not
 * covered by observations; 'new' when the item did not exist yet.
 */
function windowRate(item: ScoringItem, from: number, to: number): number | null | 'absent' {
  const pub = item.publishedAt?.getTime() ?? null
  if (pub !== null && pub >= to) return 'absent'
  // A post published inside the window starts from zero at publication.
  const a = pub !== null && pub > from ? 0 : observedValueAt(item.series, from)
  const b = observedValueAt(item.series, to)
  if (a === null || b === null) return null
  return Math.max(0, b - a) / ((to - from) / HOUR)
}

export function measuredAcceleration(items: ScoringItem[]): { ratio: number | null; comparedItems: number; end: number | null } {
  // Anchor on the most recent observation, not the wall clock: analysis runs
  // right after collection, and nothing is extrapolated past the last snapshot.
  let end = -Infinity
  for (const item of items) for (const s of item.series.snapshots) if (s.views !== null) end = Math.max(end, s.t)
  if (!Number.isFinite(end)) return { ratio: null, comparedItems: 0, end: null }
  const nowFrom = end - WINDOW_HOURS * HOUR
  const prevTo = end - LOOKBACK_HOURS * HOUR
  const prevFrom = prevTo - WINDOW_HOURS * HOUR
  let nowSum = 0
  let prevSum = 0
  let compared = 0
  for (const item of items) {
    if (item.views === null) continue
    const current = windowRate(item, nowFrom, end)
    if (current === null || current === 'absent') continue
    const previous = windowRate(item, prevFrom, prevTo)
    if (previous === null) continue // not observed back then: leave out of both sides
    nowSum += current * item.platformWeight
    prevSum += (previous === 'absent' ? 0 : previous) * item.platformWeight
    compared++
  }
  if (compared < 2 || prevSum <= 0) return { ratio: null, comparedItems: compared, end }
  return { ratio: nowSum / prevSum, comparedItems: compared, end }
}

// ---------------------------------------------------------------------------
// Metrics
// ---------------------------------------------------------------------------

export function computeTrendMetrics(items: ScoringItem[], now: Date): TrendMetrics & { newestAgeHours: number | null; unknownCreatorItems: number } {
  const creators = new Set<string>()
  let unknownCreatorItems = 0
  const platformCounts: Partial<Record<Platform, number>> = {}
  for (const item of items) {
    if (item.creatorKey) creators.add(item.creatorKey)
    else unknownCreatorItems++
    platformCounts[item.platform] = (platformCounts[item.platform] ?? 0) + 1
  }
  const withViews = items.filter((i) => i.views !== null)
  const ages = items
    .filter((i) => i.publishedAt)
    .map((i) => Math.max(0, (now.getTime() - i.publishedAt!.getTime()) / HOUR))
  const outperformers = new Set<string>()
  for (const item of items) {
    if (item.creatorKey && (item.outperformance ?? 0) >= 3) outperformers.add(item.creatorKey)
  }
  const outs = items.map((i) => i.outperformance).filter((v): v is number => v !== null)
  const engRates = withViews
    .map((i) => {
      const eng = sum([i.likes, i.comments, i.shares, i.saves])
      return i.views ? eng / i.views : null
    })
    .filter((v): v is number => v !== null && Number.isFinite(v))
  const hasVph = items.some((i) => i.viewsPerHour !== null)
  const hasEph = items.some((i) => i.engagementsPerHour !== null)
  return {
    itemCount: items.length,
    creatorCount: creators.size,
    platformCounts,
    totalViews: withViews.length ? sum(withViews.map((i) => i.views)) : null,
    viewsPerHour: hasVph ? sum(items.map((i) => (i.viewsPerHour === null ? null : i.viewsPerHour * i.platformWeight))) : null,
    engagementPerHour: hasEph
      ? sum(items.map((i) => (i.engagementsPerHour === null ? null : i.engagementsPerHour * i.platformWeight)))
      : null,
    medianEngagementRate: median(engRates),
    medianOutperformance: median(outs),
    maxOutperformance: outs.length ? Math.max(...outs) : null,
    outperformingCreators: outperformers.size,
    medianAgeHours: median(ages),
    newestAgeHours: ages.length ? Math.min(...ages) : null,
    accelerationRatio: null,
    postsLast72h: 0,
    postsPrev72h: 0,
    momentum: 0,
    momentumPrior: 0,
    momentumPeak: 0,
    viewsPerHourChange: null,
    snapshotCoverage: items.length ? items.filter((i) => i.velocityMeasured).length / items.length : 0,
    metricCompleteness: items.length ? withViews.length / items.length : 0,
    unknownCreatorItems,
  }
}

// ---------------------------------------------------------------------------
// Components
// ---------------------------------------------------------------------------

export const COMPONENT_LABEL: Record<TrendComponentKey, string> = {
  velocity: 'Velocity',
  outperformance: 'Relative outperformance',
  repetition: 'Cross-creator repetition',
  engagement: 'Engagement',
  recency: 'Recency',
  acceleration: 'Acceleration',
}

export function scoreTrend(input: ScoringInput): ScoringResult {
  const { items, now, weights, norms } = input
  const m = computeTrendMetrics(items, now)
  const effectiveCreators = m.creatorCount + 0.5 * Math.min(m.unknownCreatorItems, 6)

  // Velocity: each post against typical posts of the same age on the same platform;
  // attention: the trend's total views/hour in units of a typical fresh post.
  const pace = input.pace ?? {}
  const ageOf = (i: ScoringItem) => (i.publishedAt ? Math.max(0, (now.getTime() - i.publishedAt.getTime()) / HOUR) : null)
  const vphRatios: number[] = []
  let attention = 0
  for (const i of items) {
    if (i.viewsPerHour === null) continue
    const sameAge = typicalPace(pace[i.platform], ageOf(i), 'views') ?? 900
    const fresh = pace[i.platform]?.medianViewsPerHour ?? 900
    if (sameAge > 0) vphRatios.push(i.viewsPerHour / sameAge)
    if (fresh > 0) attention += (i.viewsPerHour / fresh) * i.platformWeight
  }
  const ephRatios: number[] = []
  for (const i of items) {
    const typical = typicalPace(pace[i.platform], ageOf(i), 'engagements') ?? 45
    if (i.viewsPerHour === null && i.engagementsPerHour !== null && typical > 0) ephRatios.push(i.engagementsPerHour / typical)
  }
  let velocity: ScoreComponent
  if (vphRatios.length > 0) {
    const medRatio = median(vphRatios)!
    const medVph = median(items.map((i) => i.viewsPerHour).filter((v): v is number => v !== null))!
    velocity = component(
      0.65 * ratioScore(medRatio, 2.0) + 0.35 * logLogistic(attention, 12, 1.0),
      weights.velocity,
      {
        medianPostViewsPerHour: round(medVph),
        vsSameAgePosts: round(medRatio, 2),
        trendViewsPerHour: round(m.viewsPerHour ?? 0),
        typicalPostsWorthOfAttention: round(attention, 1),
        measuredShare: round(m.snapshotCoverage, 2),
      },
      `The median post is gaining ${fmt(medVph)} views/hour — ${round(medRatio, 1)}× typical posts of the same age; together these posts draw the attention of ~${Math.round(attention)} typical fresh posts` +
        (m.snapshotCoverage < 0.5 ? ' (partly estimated from lifetime averages until more snapshots arrive).' : '.'),
    )
  } else if (ephRatios.length > 0) {
    const med = median(ephRatios)!
    velocity = component(
      ratioScore(med, 2.0),
      weights.velocity,
      { engagementPaceVsTypical: round(med, 2) },
      `No view counts are available for these posts; velocity uses engagements instead: the median post gains engagement ${round(med, 1)}× as fast as typical.`,
    )
  } else {
    velocity = component(null, weights.velocity, {}, 'Unavailable: no view or engagement counts over time for these posts.')
  }

  // Outperformance -----------------------------------------------------------
  const outs = items.map((i) => i.outperformance).filter((v): v is number => v !== null)
  const baselineBacked = items.filter((i) => i.outperformanceMethod === 'creator_baseline').length
  const outperformance =
    outs.length === 0
      ? component(null, weights.outperformance, {}, 'Unavailable: no baseline to compare against (creator unknown or too little history).')
      : component(
          0.7 * logLogistic(m.medianOutperformance!, 1.6, 2.0) + 0.3 * logLogistic(m.maxOutperformance!, 4, 1.4),
          weights.outperformance,
          {
            medianMultiple: round(m.medianOutperformance!, 2),
            bestMultiple: round(m.maxOutperformance!, 1),
            creatorsAt3x: m.outperformingCreators,
            baselineBackedPosts: baselineBacked,
          },
          `Posts are running at a median ${round(m.medianOutperformance!, 1)}× their creators’ usual views by this age ` +
            `(best ${round(m.maxOutperformance!, 1)}×). ${m.outperformingCreators} creator${m.outperformingCreators === 1 ? ' is' : 's are'} at 3× or more.` +
            (baselineBacked < outs.length ? ` ${outs.length - baselineBacked} of ${outs.length} use a fallback baseline.` : ''),
        )

  // Repetition ----------------------------------------------------------------
  // Log scale: going from 2 to 8 creators matters as much as going from 8 to 32.
  const breadth = logLogistic(effectiveCreators, 8, 1.5)
  const repetition = component(
    0.75 * breadth + 25 * clamp(input.patternConsistency, 0, 1),
    weights.repetition,
    {
      independentCreators: m.creatorCount,
      posts: m.itemCount,
      postsWithUnknownAuthor: m.unknownCreatorItems,
      sharedPatternShare: round(input.patternConsistency, 2),
    },
    `${m.creatorCount} independent creator${m.creatorCount === 1 ? '' : 's'} across ${m.itemCount} post${m.itemCount === 1 ? '' : 's'}` +
      (m.unknownCreatorItems ? ` (${m.unknownCreatorItems} from authors the platform does not identify)` : '') +
      `; ${Math.round(input.patternConsistency * 100)}% share the same format or hook.`,
  )

  // Engagement ---------------------------------------------------------------
  const ratios: number[] = []
  const commentRatios: number[] = []
  for (const item of items) {
    const norm = norms[item.platform]
    if (item.weightedEngagementRate !== null && norm?.medianWeightedEngagementRate) {
      ratios.push(item.weightedEngagementRate / norm.medianWeightedEngagementRate)
    } else if (item.views === null && item.likes !== null && item.followers && norm?.medianLikesPerFollower) {
      ratios.push(item.likes / item.followers / norm.medianLikesPerFollower)
    }
    if (item.views && item.comments !== null && norm?.medianEngagementRate) {
      commentRatios.push(item.comments / item.views)
    }
  }
  const medRatio = median(ratios)
  const medComment = median(commentRatios)
  const engagement =
    medRatio === null
      ? component(null, weights.engagement, {}, 'Unavailable: no engagement data comparable against a niche norm.')
      : component(
          ratioScore(medRatio, 2.6),
          weights.engagement,
          { vsNicheNorm: round(medRatio, 2), medianCommentRate: medComment === null ? null : round(medComment, 4) },
          `Weighted engagement (comments, shares and saves count extra) is ${round(medRatio, 2)}× the niche norm on the same platform.`,
        )

  // Recency ------------------------------------------------------------------
  const recency =
    m.medianAgeHours === null
      ? component(null, weights.recency, {}, 'Unavailable: publication times unknown.')
      : component(
          70 * Math.exp(-m.medianAgeHours / 96) + 30 * Math.exp(-(m.newestAgeHours ?? m.medianAgeHours) / 24),
          weights.recency,
          { medianAgeHours: round(m.medianAgeHours), newestAgeHours: round(m.newestAgeHours ?? 0) },
          `The median post is ${fmt(m.medianAgeHours)}h old; the newest ${fmt(m.newestAgeHours)}h.`,
        )

  // Acceleration (momentum) ------------------------------------------------------
  const mom = momentum(items, now)
  const measured = measuredAcceleration(items)
  const viewsChange = measured.ratio !== null && measured.comparedItems >= 3 ? measured.ratio : null
  m.postsLast72h = mom.current.posts
  m.postsPrev72h = mom.prior.posts
  m.momentum = round(mom.current.weighted, 2)
  m.momentumPrior = round(mom.prior.weighted, 2)
  m.momentumPeak = round(mom.peak, 2)
  m.viewsPerHourChange = viewsChange === null ? null : round(viewsChange, 3)
  let accel: ScoringResult['acceleration']
  let acceleration: ScoreComponent
  if (mom.dated && mom.current.posts + mom.prior.posts > 0) {
    accel = { ratio: mom.perDay, basis: 'measured' }
    acceleration = component(
      ratioScore(mom.perDay, 3),
      weights.acceleration,
      {
        growthPerDay: round(mom.perDay, 2),
        postsLast3Days: mom.current.posts,
        postsPrevious3Days: mom.prior.posts,
        weightedLast3Days: round(mom.current.weighted, 1),
        weightedPrevious3Days: round(mom.prior.weighted, 1),
        viewsPerHourVsYesterday: viewsChange === null ? null : round(viewsChange, 2),
      },
      `${mom.perDay >= 1.03 ? 'Speeding up' : mom.perDay <= 0.97 ? 'Slowing down' : 'Holding steady'}: ${mom.current.posts} post${mom.current.posts === 1 ? '' : 's'} in the last 3 days ` +
        `vs ${mom.prior.posts} in the 3 days before, weighted by how far each outran its creator’s normal ` +
        `(${fmt(mom.current.weighted, 1)} vs ${fmt(mom.prior.weighted, 1)}) — ${round(mom.perDay, 2)}× per day.` +
        (viewsChange !== null ? ` Views gained in the last 12h were ${round(viewsChange, 2)}× the same hours yesterday on the same posts.` : ''),
    )
  } else {
    accel = { ratio: null, basis: 'none' }
    acceleration = component(null, weights.acceleration, {}, 'Unavailable: no posts in the last six days, or publication times unknown.')
  }
  m.accelerationRatio = accel.ratio === null ? null : round(accel.ratio, 3)

  const components: TrendComponents = { velocity, outperformance, repetition, engagement, recency, acceleration }
  const trendScore = combine(components)

  // Confidence ---------------------------------------------------------------
  const evidence = 1 - Math.exp(-m.itemCount / 6)
  const breadthFactor = 1 - Math.exp(-effectiveCreators / 3)
  const measurement = 0.5 * m.snapshotCoverage + 0.5 * m.metricCompleteness
  const meanSim = items.length ? sum(items.map((i) => i.similarity)) / items.length : 0
  const { low, high } = input.cohesionRange
  const cohesion = clamp((meanSim - low) / Math.max(0.01, high - low), 0, 1)
  const baselineCoverage = items.length ? baselineBacked / items.length : 0
  const confidence = round(
    100 * (0.3 * evidence + 0.2 * breadthFactor + 0.2 * measurement + 0.15 * cohesion + 0.15 * baselineCoverage),
    1,
  )

  return {
    trendScore,
    components,
    confidence,
    confidenceLabel: confidence >= 70 ? 'high' : confidence >= 45 ? 'medium' : 'low',
    metrics: stripInternals(m),
    acceleration: accel,
    effectiveCreators,
  }
}

function stripInternals(m: ReturnType<typeof computeTrendMetrics>): TrendMetrics {
  const { newestAgeHours: _n, unknownCreatorItems: _u, ...rest } = m
  return rest
}

/** Weighted mean of the available components, weights renormalised over them. */
export function combine(components: TrendComponents): number {
  let total = 0
  let weight = 0
  for (const key of TREND_COMPONENT_KEYS) {
    const c = components[key]
    if (c.score === null || c.weight <= 0) continue
    total += c.score * c.weight
    weight += c.weight
  }
  return weight > 0 ? round(total / weight, 1) : 0
}

/** Re-score stored components with different weights (the settings page preview). */
export function reweight(components: TrendComponents, weights: TrendWeights): number {
  const copy = {} as TrendComponents
  for (const key of TREND_COMPONENT_KEYS) copy[key] = { ...components[key], weight: weights[key] }
  return combine(copy)
}
