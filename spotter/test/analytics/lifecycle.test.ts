import { describe, expect, it } from 'vitest'
import { classifyStage, type StageInput } from '@/core/analytics/lifecycle'

const input = (over: Partial<StageInput>): StageInput => ({
  growthPerDay: 1,
  trendAgeHours: 24 * 8,
  itemCount: 40,
  postsLast72h: 12,
  postsPrev72h: 12,
  momentum: 18,
  momentumPeak: 20,
  ...over,
})

describe('classifyStage', () => {
  it('ACCELERATING: established trend whose momentum grows ≥15% a day', () => {
    const r = classifyStage(input({ growthPerDay: 1.3, postsLast72h: 20, postsPrev72h: 9 }))
    expect(r.stage).toBe('accelerating')
    expect(r.evidence).toBe('measured')
    expect(r.basis).toMatch(/growing 1\.3× per day \(20 posts in the last 3 days vs 9 in the 3 before\)/)
    expect(classifyStage(input({ growthPerDay: 1.1 })).stage).toBe('mature')
  })

  it('EMERGING: a young trend that is not shrinking', () => {
    expect(classifyStage(input({ growthPerDay: 2.4, trendAgeHours: 40, postsPrev72h: 0 })).stage).toBe('emerging')
    expect(classifyStage(input({ growthPerDay: 1, trendAgeHours: 60 })).stage).toBe('emerging')
  })

  it('MATURE: large and steady', () => {
    expect(classifyStage(input({ growthPerDay: 1.02 })).stage).toBe('mature')
  })

  it('DECLINING: shrinking day over day', () => {
    expect(classifyStage(input({ growthPerDay: 0.7 })).stage).toBe('declining')
    expect(classifyStage(input({ growthPerDay: 0.9 })).stage).toBe('mature')
  })

  it('DECLINING: far below its own peak and not recovering', () => {
    const r = classifyStage(input({ growthPerDay: 0.92, momentum: 3, momentumPeak: 20 }))
    expect(r.stage).toBe('declining')
    expect(r.basis).toMatch(/15% of its 10-day peak/)
  })

  it('does not call a recovering trend declining just because it is below its peak', () => {
    expect(classifyStage(input({ growthPerDay: 1.1, momentum: 3, momentumPeak: 20 })).stage).toBe('mature')
  })

  it('DECLINING: nothing posted in six days', () => {
    const r = classifyStage(input({ growthPerDay: 1 / Math.cbrt(9), postsLast72h: 0, postsPrev72h: 0, momentum: 0 }))
    expect(r.stage).toBe('declining')
    expect(r.basis).toMatch(/No new posts/)
  })

  it('flags a call that rests on only a handful of posts', () => {
    const r = classifyStage(input({ growthPerDay: 1.4, postsLast72h: 2, postsPrev72h: 0 }))
    expect(r.evidence).toBe('estimated')
  })
})
