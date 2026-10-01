import { describe, expect, it } from 'vitest'
import { assignToExisting, cosine, findMerges, formNewClusters, meanVector, normalize, type Candidate } from '@/core/analytics/clustering'
import { createRng } from '@/core/demo/random'

/** Points scattered around a few well-separated directions in 32 dimensions. */
function blob(rng: ReturnType<typeof createRng>, center: number[], spread: number, n: number, prefix: string): Candidate[] {
  return Array.from({ length: n }, (_, i) => ({
    id: `${prefix}-${i}`,
    vector: normalize(center.map((c) => c + rng.normal(0, spread))),
    weight: rng.next(),
  }))
}
const axis = (i: number) => Array.from({ length: 32 }, (_, d) => (d === i ? 1 : 0))

describe('vector helpers', () => {
  it('cosine is 1 for parallel, 0 for orthogonal vectors', () => {
    expect(cosine([1, 2, 3], [2, 4, 6])).toBeCloseTo(1)
    expect(cosine(axis(0), axis(1))).toBeCloseTo(0)
    expect(cosine([0, 0], [1, 1])).toBe(0)
  })

  it('meanVector is normalised and respects weights', () => {
    const m = meanVector([axis(0), axis(1)], [3, 1])!
    expect(Math.hypot(...m)).toBeCloseTo(1)
    expect(m[0]!).toBeGreaterThan(m[1]!)
  })
})

describe('formNewClusters', () => {
  it('recovers well-separated groups and leaves stragglers unclustered', () => {
    const rng = createRng(7)
    const candidates = [
      ...blob(rng, axis(0), 0.08, 8, 'squat'),
      ...blob(rng, axis(5), 0.08, 6, 'creatine'),
      { id: 'lonely', vector: axis(20), weight: 0.5 },
    ]
    const groups = formNewClusters(candidates, 0.6, 2)
    expect(groups).toHaveLength(2)
    const sets = groups.map((g) => new Set(g.memberIds.map((id) => id.split('-')[0])))
    for (const s of sets) expect(s.size).toBe(1) // no group mixes topics
    expect(groups.flatMap((g) => g.memberIds)).not.toContain('lonely')
  })

  it('does not depend on input order', () => {
    const rng = createRng(11)
    const candidates = [...blob(rng, axis(1), 0.1, 10, 'a'), ...blob(rng, axis(2), 0.1, 10, 'b')]
    const forward = formNewClusters(candidates, 0.6).map((g) => [...g.memberIds].sort().join(','))
    const reversed = formNewClusters([...candidates].reverse(), 0.6).map((g) => [...g.memberIds].sort().join(','))
    expect(new Set(forward)).toEqual(new Set(reversed))
  })
})

describe('assignToExisting', () => {
  it('keeps cluster identity: new posts join the existing trend they resemble', () => {
    const rng = createRng(3)
    const existing = [
      { id: 'trend-squat', centroid: axis(0), firstDetectedAt: new Date('2026-09-20') },
      { id: 'trend-protein', centroid: axis(9), firstDetectedAt: new Date('2026-09-22') },
    ]
    const incoming = [...blob(rng, axis(0), 0.08, 3, 'new-squat'), { id: 'unrelated', vector: axis(30), weight: 1 }]
    const { assigned, unassigned } = assignToExisting(incoming, existing, 0.6)
    expect(assigned.every((a) => a.clusterId === 'trend-squat')).toBe(true)
    expect(assigned).toHaveLength(3)
    expect(unassigned.map((u) => u.id)).toEqual(['unrelated'])
  })
})

describe('findMerges', () => {
  it('merges converging clusters into the older one', () => {
    const merges = findMerges(
      [
        { id: 'older', centroid: normalize([1, 0.1, 0]), firstDetectedAt: new Date('2026-09-01') },
        { id: 'newer', centroid: normalize([1, 0.12, 0]), firstDetectedAt: new Date('2026-09-10') },
        { id: 'other', centroid: normalize([0, 0, 1]), firstDetectedAt: new Date('2026-09-05') },
      ],
      0.9,
    )
    expect(merges).toEqual([expect.objectContaining({ keepId: 'older', mergeId: 'newer' })])
  })
})
