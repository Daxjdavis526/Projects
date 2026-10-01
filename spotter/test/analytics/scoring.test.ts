import { describe, expect, it } from 'vitest'
import type { NicheNorms } from '@/core/analytics/baseline'
import type { SnapshotPoint } from '@/core/analytics/metrics'
import { combine, measuredAcceleration, momentum, reweight, scoreTrend, type ScoringItem } from '@/core/analytics/scoring'
import { defaultSettings } from '@/core/config/settings'
import type { Platform } from '@/core/domain/types'

const H = 3_600_000
const now = new Date('2026-09-29T19:00:00Z')
const weights = defaultSettings().trend.weights
const norms: NicheNorms = {
  youtube: { medianViewsPerFollower: 0.2, medianSettledViews: 30_000, medianLikesPerFollower: 0.01, medianEngagementRate: 0.05, medianWeightedEngagementRate: 0.07, sampleSize: 200 },
  instagram: { medianViewsPerFollower: 0.2, medianSettledViews: 20_000, medianLikesPerFollower: 0.02, medianEngagementRate: 0.05, medianWeightedEngagementRate: 0.07, sampleSize: 100 },
}

let counter = 0
function item(opts: {
  creator?: string | null
  platform?: Platform
  ageHours?: number
  views?: number | null
  vph?: number | null
  out?: number | null
  likesRate?: number
  commentsRate?: number
  snapshots?: SnapshotPoint[]
  sim?: number
}): ScoringItem {
  const id = `item-${++counter}`
  const ageHours = opts.ageHours ?? 20
  const views = opts.views === undefined ? 100_000 : opts.views
  const publishedAt = new Date(now.getTime() - ageHours * H)
  const likes = views === null ? 1_000 : Math.round(views * (opts.likesRate ?? 0.05))
  const comments = views === null ? 40 : Math.round(views * (opts.commentsRate ?? 0.004))
  return {
    contentItemId: id,
    platform: opts.platform ?? 'youtube',
    creatorKey: opts.creator === undefined ? `creator-${counter}` : opts.creator,
    publishedAt,
    views,
    likes,
    comments,
    shares: null,
    saves: null,
    followers: 100_000,
    viewsPerHour: opts.vph === undefined ? (views === null ? null : views / ageHours) : opts.vph,
    velocityMeasured: true,
    engagementsPerHour: (likes + comments) / ageHours,
    weightedEngagementRate: views ? (likes + 3 * comments) / views : null,
    outperformance: opts.out === undefined ? 2 : opts.out,
    outperformanceMethod: opts.out === null ? null : 'creator_baseline',
    snapshotCount: 3,
    similarity: opts.sim ?? 0.7,
    platformWeight: 1,
    series: { contentItemId: id, platform: opts.platform ?? 'youtube', creatorId: null, publishedAt, snapshots: opts.snapshots ?? [] },
  }
}

const base = { now, norms, weights, patternConsistency: 0.5, cohesionRange: { low: 0.35, high: 0.8 } }

describe('scoreTrend', () => {
  it('produces a bounded score with every component inspectable', () => {
    const r = scoreTrend({ ...base, items: [item({}), item({}), item({})] })
    expect(r.trendScore).toBeGreaterThan(0)
    expect(r.trendScore).toBeLessThanOrEqual(100)
    for (const c of Object.values(r.components)) {
      expect(typeof c.explanation).toBe('string')
      expect(c.explanation.length).toBeGreaterThan(10)
      if (c.score !== null) expect(c.score).toBeGreaterThanOrEqual(0)
    }
    expect(r.trendScore).toBe(combine(r.components))
  })

  it('ranks a small creator’s sudden 700k above a big account’s ordinary 1M', () => {
    // 30k-follower creator, 700k views in 20h: far above their baseline.
    const breakout = scoreTrend({ ...base, items: [item({ views: 700_000, out: 25 }), item({ views: 650_000, out: 18 }), item({ views: 500_000, out: 12 })] })
    // Huge account, 1M views, but that is normal for them.
    const ordinary = scoreTrend({ ...base, items: [item({ views: 1_000_000, out: 1 }), item({ views: 1_100_000, out: 0.9 }), item({ views: 950_000, out: 1.1 })] })
    expect(breakout.components.outperformance.score!).toBeGreaterThan(ordinary.components.outperformance.score! + 30)
    expect(breakout.trendScore).toBeGreaterThan(ordinary.trendScore)
  })

  it('rewards more independent creators doing the same thing', () => {
    const few = scoreTrend({ ...base, items: [item({ creator: 'a' }), item({ creator: 'a' }), item({ creator: 'b' })] })
    const many = scoreTrend({ ...base, items: Array.from({ length: 9 }, (_, i) => item({ creator: `c${i}` })) })
    expect(many.components.repetition.score!).toBeGreaterThan(few.components.repetition.score!)
    expect(many.metrics.creatorCount).toBe(9)
  })

  it('marks components with missing inputs unavailable and redistributes their weight', () => {
    const r = scoreTrend({ ...base, items: [item({ out: null }), item({ out: null }), item({ out: null })] })
    expect(r.components.outperformance.score).toBeNull()
    expect(r.components.outperformance.explanation).toMatch(/Unavailable/)
    // The total is the weighted mean of the remaining components, not dragged down by a zero.
    const available = Object.values(r.components).filter((c) => c.score !== null)
    const expected = available.reduce((s, c) => s + c.score! * c.weight, 0) / available.reduce((s, c) => s + c.weight, 0)
    expect(r.trendScore).toBeCloseTo(expected, 0)
  })

  it('judges velocity against posts of the same age, not against fresh ones', () => {
    const pace = {
      youtube: {
        medianViewsPerHour: 4_000,
        medianEngagementsPerHour: 200,
        byAge: [
          { maxAgeHours: 24, medianViewsPerHour: 4_000, medianEngagementsPerHour: 200 },
          { maxAgeHours: 72, medianViewsPerHour: 1_500, medianEngagementsPerHour: 80 },
          { maxAgeHours: 168, medianViewsPerHour: 300, medianEngagementsPerHour: 15 },
          { maxAgeHours: Infinity, medianViewsPerHour: 60, medianEngagementsPerHour: 3 },
        ],
      },
    }
    // Week-old posts moving at twice the pace typical for their age.
    const old = scoreTrend({ ...base, pace, items: [item({ ageHours: 150, vph: 600 }), item({ ageHours: 130, vph: 600 }), item({ ageHours: 160, vph: 600 })] })
    expect(old.components.velocity.inputs.vsSameAgePosts).toBe(2)
    // The same posts judged against fresh ones would look 7× slower than typical.
    expect(old.components.velocity.score!).toBeGreaterThan(50)
    expect(old.components.velocity.inputs.typicalPostsWorthOfAttention).toBe(0.5)
  })

  it('uses engagement velocity when a platform exposes no view counts', () => {
    const r = scoreTrend({ ...base, items: [item({ views: null, platform: 'instagram' }), item({ views: null, platform: 'instagram' })] })
    expect(r.components.velocity.score).not.toBeNull()
    expect(r.components.velocity.explanation).toMatch(/engagements/)
    expect(r.metrics.totalViews).toBeNull()
    expect(r.metrics.metricCompleteness).toBe(0)
  })

  it('counts posts from authors the platform does not identify only partially', () => {
    const r = scoreTrend({ ...base, items: Array.from({ length: 4 }, () => item({ creator: null, views: null, platform: 'instagram' })) })
    expect(r.metrics.creatorCount).toBe(0)
    expect(r.effectiveCreators).toBe(2)
  })

  it('is more confident with more evidence', () => {
    const thin = scoreTrend({ ...base, items: [item({}), item({})] })
    const thick = scoreTrend({ ...base, items: Array.from({ length: 14 }, (_, i) => item({ creator: `k${i}` })) })
    expect(thick.confidence).toBeGreaterThan(thin.confidence)
  })

  it('applies configurable weights, and reweighting reproduces the combine rule', () => {
    const r = scoreTrend({ ...base, items: [item({ out: 20 }), item({ out: 15 }), item({ out: 12 })] })
    const outOnly = reweight(r.components, { velocity: 0, outperformance: 1, repetition: 0, engagement: 0, recency: 0, acceleration: 0 })
    expect(outOnly).toBe(r.components.outperformance.score)
  })
})

describe('acceleration', () => {
  const snaps = (points: Array<[number, number]>): SnapshotPoint[] =>
    points.map(([hoursAgo, views]) => ({ t: now.getTime() - hoursAgo * H, views, likes: null, comments: null, shares: null, saves: null }))

  it('compares the last 12h with the same window 24h earlier on the same posts', () => {
    // Two posts gaining faster today than yesterday.
    const a = item({ ageHours: 60, snapshots: snaps([[48, 10_000], [36, 20_000], [24, 30_000], [12, 50_000], [0, 90_000]]) })
    const b = item({ ageHours: 60, snapshots: snaps([[48, 5_000], [36, 10_000], [24, 15_000], [12, 30_000], [0, 60_000]]) })
    const m = measuredAcceleration([a, b])
    // now: (40k + 30k)/12h ; 24h earlier: (10k + 5k)/12h  → 70/15
    expect(m.ratio!).toBeCloseTo(70 / 15, 2)
    expect(m.comparedItems).toBe(2)
  })

  it('counts a brand-new post as growth from zero', () => {
    const old = item({ ageHours: 60, snapshots: snaps([[36, 10_000], [24, 20_000], [12, 30_000], [0, 40_000]]) })
    const fresh = item({ ageHours: 10, snapshots: snaps([[6, 20_000], [0, 40_000]]) })
    const m = measuredAcceleration([old, fresh])
    // Fresh post: it did not exist 24h ago, and its 12h window starts at publication (0 views).
    expect(m.ratio!).toBeCloseTo((10_000 + 40_000) / 10_000, 2)
  })

  it('does not invent a ratio for posts that were not observed back then', () => {
    const late = item({ ageHours: 72, snapshots: snaps([[1, 100_000], [0, 101_000]]) })
    expect(measuredAcceleration([late]).ratio).toBeNull()
  })

})

describe('momentum (the acceleration component)', () => {
  const posts = (n: number, fromHours: number, toHours: number, out: number | null = 1) =>
    Array.from({ length: n }, (_, k) => item({ ageHours: fromHours + ((toHours - fromHours) * (k + 0.5)) / n, out }))

  it('compares performance-weighted posts in the last 3 days with the 3 days before', () => {
    const m = momentum([...posts(12, 0, 72), ...posts(6, 72, 144)], now)
    expect(m.current.posts).toBe(12)
    expect(m.prior.posts).toBe(6)
    expect(m.perDay).toBeCloseTo(Math.cbrt(13 / 7), 5)
  })

  it('weights each post by its outperformance, capped so one viral post cannot swing it', () => {
    const viral = momentum([item({ ageHours: 10, out: 40 }), ...posts(6, 72, 144)], now)
    expect(viral.current.weighted).toBe(4)
    // One giant post against six ordinary ones three days earlier is still a slowdown.
    expect(viral.perDay).toBeLessThan(1)
  })

  it('counts a post on the day it was published, whenever it was discovered', () => {
    // Momentum three days ago is rebuilt from publication times, not from what was stored then.
    const m = momentum(posts(9, 80, 130), now)
    expect(m.current.posts).toBe(0)
    expect(m.prior.posts).toBe(9)
    expect(m.peak).toBeGreaterThanOrEqual(m.prior.weighted)
  })

  it('shrinks tiny samples toward “no change”', () => {
    const m = momentum([...posts(2, 0, 72), ...posts(1, 72, 144)], now)
    expect(m.perDay).toBeLessThan(Math.cbrt(2))
    expect(m.perDay).toBeGreaterThan(1)
  })

  it('reports momentum in the score with its inputs, and views/hour change only as context', () => {
    const r = scoreTrend({ ...base, items: [...posts(10, 0, 72, 2), ...posts(5, 72, 144, 1)] })
    expect(r.acceleration.basis).toBe('measured')
    expect(r.components.acceleration.inputs.postsLast3Days).toBe(10)
    expect(r.components.acceleration.explanation).toMatch(/Speeding up: 10 posts in the last 3 days vs 5/)
    expect(r.metrics.accelerationRatio).toBeCloseTo(Math.cbrt(21 / 6), 3)
  })

  it('is unavailable, not zero, when nothing was posted in six days', () => {
    const r = scoreTrend({ ...base, items: posts(4, 200, 300) })
    expect(r.components.acceleration.score).toBeNull()
    expect(r.acceleration.basis).toBe('none')
  })
})
