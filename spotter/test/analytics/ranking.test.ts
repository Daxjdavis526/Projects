import { describe, expect, it } from 'vitest'
import { rankOpportunities, type RankCandidate } from '@/core/analytics/ranking'
import { opportunityScore } from '@/core/analytics/relevance'
import { defaultSettings, mergeSettings } from '@/core/config/settings'

const settings = defaultSettings()
let axis = 0
/** Orthogonal centroids, so only the tests that mean to trigger the diversity rule do. */
function oneHot(): number[] {
  const v = new Array<number>(64).fill(0)
  v[axis++ % 64] = 1
  return v
}
const cand = (id: string, trend: number, fit: number, over: Partial<RankCandidate> = {}): RankCandidate => ({
  clusterId: id,
  trendScore: trend,
  fitScore: fit,
  confidence: 80,
  itemCount: 10,
  creatorCount: 6,
  isBreakout: false,
  topicKey: id,
  centroid: oneHot(),
  ...over,
})

describe('rankOpportunities', () => {
  it('ranks a well-fitting trend above a hotter but poorly fitting one (the brief’s example)', () => {
    const { ranked } = rankOpportunities([cand('hot-but-off-brand', 96, 31), cand('fits', 86, 94)], settings)
    expect(ranked.map((r) => r.clusterId)).toEqual(['fits', 'hot-but-off-brand'])
    expect(ranked[0]!.opportunityScore).toBe(opportunityScore(86, 94, 0.5))
  })

  it('lets the weighting be changed so global heat dominates', () => {
    const heatFirst = mergeSettings(settings, { fit: { trendWeight: 0.9 } })
    const { ranked } = rankOpportunities([cand('hot-but-off-brand', 96, 31), cand('fits', 86, 94)], heatFirst)
    expect(ranked[0]!.clusterId).toBe('hot-but-off-brand')
  })

  it('excludes low-confidence and thin trends, with the reason', () => {
    const { ranked, excluded } = rankOpportunities(
      [cand('ok', 70, 70), cand('unsure', 90, 90, { confidence: 10 }), cand('thin', 90, 90, { itemCount: 1, creatorCount: 1 })],
      settings,
    )
    expect(ranked.map((r) => r.clusterId)).toEqual(['ok'])
    expect(excluded.find((e) => e.clusterId === 'unsure')!.reason).toMatch(/confidence/)
    expect(excluded.find((e) => e.clusterId === 'thin')!.reason).toMatch(/posts from/)
  })

  it('keeps a single-post breakout even though it lacks repetition', () => {
    const { ranked } = rankOpportunities([cand('breakout', 80, 80, { itemCount: 1, creatorCount: 1, isBreakout: true })], settings)
    expect(ranked).toHaveLength(1)
  })

  it('does not return two opportunities on the same topic', () => {
    const { ranked, excluded } = rankOpportunities([cand('a', 90, 90, { topicKey: 'squat' }), cand('b', 85, 85, { topicKey: 'squat' }), cand('c', 60, 60)], settings)
    expect(ranked.map((r) => r.clusterId)).toEqual(['a', 'c'])
    expect(excluded[0]!.reason).toMatch(/too similar/)
  })

  it('returns at most the configured number of recommendations', () => {
    const many = Array.from({ length: 20 }, (_, i) => cand(`t${i}`, 50 + i, 50 + i))
    expect(rankOpportunities(many, settings).ranked).toHaveLength(settings.recommendations.count)
  })
})
