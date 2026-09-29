import { describe, expect, it } from 'vitest'
import {
  engagementRates,
  itemVelocity,
  observedValueAt,
  valueAt,
  weightedEngagementRate,
  type ItemSeries,
  type SnapshotPoint,
} from '@/core/analytics/metrics'

const H = 3_600_000
const t0 = Date.parse('2026-09-28T00:00:00Z')
const snap = (hours: number, views: number | null, likes: number | null = null): SnapshotPoint => ({
  t: t0 + hours * H,
  views,
  likes,
  comments: null,
  shares: null,
  saves: null,
})
const series = (snapshots: SnapshotPoint[], publishedHoursBeforeT0 = 0): ItemSeries => ({
  contentItemId: 'x',
  platform: 'youtube',
  creatorId: 'c',
  publishedAt: new Date(t0 - publishedHoursBeforeT0 * H),
  snapshots,
})

describe('itemVelocity', () => {
  it('uses the lifetime average when only one snapshot exists, and says so', () => {
    const v = itemVelocity(series([snap(10, 50_000)]), new Date(t0 + 10 * H))
    expect(v.viewsPerHour).toBeCloseTo(5_000)
    expect(v.velocityMeasured).toBe(false)
    expect(v.accelerationRatio).toBeNull()
  })

  it('measures recent velocity between the last two snapshots', () => {
    // The brief's example curve: 180k at 09:00, 250k at 12:00, 410k at 18:00.
    const s = series([snap(9, 180_000), snap(12, 250_000), snap(18, 410_000)])
    const v = itemVelocity(s, new Date(t0 + 18 * H))
    expect(v.viewsPerHour).toBeCloseTo((410_000 - 250_000) / 6)
    expect(v.velocityMeasured).toBe(true)
    // 26.7k/h now vs 23.3k/h in the previous segment: accelerating.
    expect(v.accelerationRatio!).toBeCloseTo(26_666.67 / 23_333.33, 2)
  })

  it('detects a slowing post', () => {
    const s = series([snap(6, 300_000), snap(12, 400_000), snap(18, 430_000)])
    const v = itemVelocity(s, new Date(t0 + 18 * H))
    expect(v.accelerationRatio!).toBeLessThan(0.5)
  })

  it('falls back to engagement velocity when views are not exposed (e.g. hashtag results)', () => {
    const s = series([snap(4, null, 400), snap(10, null, 1_000)])
    const v = itemVelocity(s, new Date(t0 + 10 * H))
    expect(v.viewsPerHour).toBeNull()
    expect(v.engagementsPerHour).toBeCloseTo(100)
  })

  it('ignores snapshots too close together to measure a rate', () => {
    const s = series([snap(10, 50_000), snap(10.1, 50_500)])
    const v = itemVelocity(s, new Date(t0 + 10.1 * H))
    // Falls back to the segment from publication.
    expect(v.velocityMeasured).toBe(false)
    expect(v.viewsPerHour).toBeCloseTo(50_500 / 10.1, 0)
  })

  it('returns nulls, not zeros, when nothing is known', () => {
    const v = itemVelocity({ ...series([]), publishedAt: null }, new Date(t0))
    expect(v.viewsPerHour).toBeNull()
    expect(v.ageHours).toBeNull()
    expect(v.latest).toBeNull()
  })
})

describe('interpolation', () => {
  const s = series([snap(10, 100_000), snap(20, 150_000)])

  it('valueAt interpolates between snapshots and from the publication origin', () => {
    expect(valueAt(s, t0 + 15 * H)).toBeCloseTo(125_000)
    expect(valueAt(s, t0 + 5 * H)).toBeCloseTo(50_000)
    expect(valueAt(s, t0 + 25 * H)).toBeNull() // no extrapolation
  })

  it('observedValueAt refuses to guess before the first observation', () => {
    expect(observedValueAt(s, t0 + 15 * H)).toBeCloseTo(125_000)
    expect(observedValueAt(s, t0 + 5 * H)).toBeNull()
    expect(observedValueAt(s, t0 - H)).toBe(0) // before publication: did not exist
  })
})

describe('engagement rates', () => {
  it('computes ratios only where both sides exist', () => {
    const r = engagementRates({ t: 0, views: 10_000, likes: 500, comments: 50, shares: null, saves: null })
    expect(r.likeRate).toBeCloseTo(0.05)
    expect(r.commentRate).toBeCloseTo(0.005)
    expect(r.shareRate).toBeNull()
    expect(r.engagementRate).toBeCloseTo(0.055)
  })

  it('weights comments, shares and saves above likes', () => {
    const likesOnly = weightedEngagementRate({ t: 0, views: 1_000, likes: 50, comments: 0, shares: null, saves: null })!
    const withComments = weightedEngagementRate({ t: 0, views: 1_000, likes: 40, comments: 10, shares: null, saves: null })!
    expect(withComments).toBeGreaterThan(likesOnly)
    expect(weightedEngagementRate({ t: 0, views: null, likes: 5, comments: 1, shares: null, saves: null })).toBeNull()
  })
})
