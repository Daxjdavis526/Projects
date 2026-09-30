import { describe, expect, it } from 'vitest'
import {
  computeBaseline,
  expectedGrowthFraction,
  expectedViewsAt,
  MIN_BASELINE_SAMPLES,
  outperformanceRatio,
  robustZ,
  type BaselineSample,
} from '@/core/analytics/baseline'

const now = new Date('2026-09-29T12:00:00Z')
const daysAgo = (d: number) => new Date(now.getTime() - d * 86_400_000)
const sample = (views: number, ageDays = 10, extra: Partial<BaselineSample> = {}): BaselineSample => ({
  views,
  engagements: Math.round(views * 0.05),
  followers: 100_000,
  publishedAt: daysAgo(ageDays),
  durationSeconds: 40,
  ...extra,
})

describe('computeBaseline', () => {
  it('takes the median of settled views for a typical creator', () => {
    const b = computeBaseline([50_000, 60_000, 70_000, 80_000, 90_000, 100_000].map((v) => sample(v)), now)
    expect(b.sufficient).toBe(true)
    expect(b.sampleSize).toBe(6)
    // Geometric midpoint of 70k and 80k on the log scale.
    expect(b.medianViews).toBeGreaterThan(70_000)
    expect(b.medianViews).toBeLessThan(80_000)
  })

  it('is not dragged up by one viral post', () => {
    const typical = [50_000, 60_000, 70_000, 80_000, 90_000, 100_000].map((v) => sample(v))
    const withViral = [...typical, sample(5_000_000)]
    const a = computeBaseline(typical, now)
    const b = computeBaseline(withViral, now)
    // A mean would jump ~10×; the robust median moves by one rank position.
    expect(b.medianViews! / a.medianViews!).toBeLessThan(1.15)
    expect(b.logSpread! / a.logSpread!).toBeLessThan(1.6)
  })

  it('refuses to trust fewer than the minimum number of settled samples', () => {
    const b = computeBaseline([sample(10_000), sample(12_000)], now)
    expect(b.sufficient).toBe(false)
    expect(b.sampleSize).toBe(2)
    expect(MIN_BASELINE_SAMPLES).toBeGreaterThan(2)
  })

  it('leaves out posts too young to have settled and posts with no view count', () => {
    const b = computeBaseline([sample(1_000, 0.5), sample(0), { ...sample(10_000), views: null }, sample(20_000)], now)
    expect(b.sampleSize).toBe(1)
  })

  it('age-adjusts samples that have not finished accumulating', () => {
    // A 3-day-old short with 60k views is on track for more than 60k.
    const young = computeBaseline(Array.from({ length: 5 }, () => sample(60_000, 3)), now)
    const old = computeBaseline(Array.from({ length: 5 }, () => sample(60_000, 30)), now)
    expect(young.medianViews!).toBeGreaterThan(old.medianViews!)
  })
})

describe('outperformance', () => {
  const baseline = computeBaseline([50_000, 60_000, 75_000, 80_000, 90_000, 100_000].map((v) => sample(v)), now)

  it('scores the brief’s example: 670k after 8 hours for a 50k–100k creator is a very large multiple', () => {
    const expected = expectedViewsAt(8, false, baseline, 100_000, null, 'youtube')
    expect(expected?.method).toBe('creator_baseline')
    const ratio = outperformanceRatio(670_000, expected)!
    // By 8 hours a typical post has ~20% of its eventual ~78k views.
    expect(ratio).toBeGreaterThan(30)
    expect(robustZ(670_000, 8, false, baseline)!).toBeGreaterThan(3)
  })

  it('treats a typical post at a typical age as about 1×', () => {
    const expected = expectedViewsAt(24 * 14, false, baseline, 100_000, null, 'youtube')
    const ratio = outperformanceRatio(77_000, expected)!
    expect(ratio).toBeGreaterThan(0.8)
    expect(ratio).toBeLessThan(1.25)
  })

  it('falls back to followers × niche views-per-follower when the creator has no baseline', () => {
    const niche = { youtube: { medianViewsPerFollower: 0.2, medianSettledViews: 40_000, medianLikesPerFollower: null, medianEngagementRate: null, medianWeightedEngagementRate: null, sampleSize: 50 } }
    const expected = expectedViewsAt(24 * 30, false, null, 30_000, niche, 'youtube')
    expect(expected?.method).toBe('follower_ratio')
    expect(expected!.expected).toBeCloseTo(6_000, -2)
    // A 30k-follower creator suddenly at 700k is far above expectation.
    expect(outperformanceRatio(700_000, expected)!).toBeGreaterThan(100)
  })

  it('returns null rather than guessing when there is nothing to compare against', () => {
    expect(expectedViewsAt(24, false, null, null, null, 'tiktok')).toBeNull()
    expect(outperformanceRatio(10_000, null)).toBeNull()
  })

  it('uses a slower accumulation curve for long-form video', () => {
    expect(expectedGrowthFraction(24, true)).toBeLessThan(expectedGrowthFraction(24, false))
    expect(expectedGrowthFraction(0, false)).toBe(0)
  })
})
