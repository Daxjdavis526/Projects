import { describe, expect, it } from 'vitest'
import { separation, similarityProfile, suggestThresholds, type LabelledVector } from '@/core/analytics/calibration'

/** Posts around a few topic directions in 64 dimensions, with noise. */
function world(topics: number, perTopic: number, noise: number): LabelledVector[] {
  let s = 42
  const rand = () => ((s = (Math.imul(s, 1_103_515_245) + 12_345) >>> 0) / 4_294_967_296) * 2 - 1
  const centers = Array.from({ length: topics }, () => Array.from({ length: 64 }, rand))
  return centers.flatMap((c, t) => Array.from({ length: perTopic }, () => ({ topicKey: `t${t}`, vector: c.map((x) => x + noise * rand()) })))
}

describe('embedding calibration', () => {
  it('puts the thresholds between unrelated and related pairs', () => {
    const profile = similarityProfile(world(8, 30, 0.8))!
    expect(profile.topics).toBe(8)
    expect(profile.same.p50).toBeGreaterThan(profile.cross.p50)
    const t = suggestThresholds(profile)
    expect(t.create).toBeGreaterThan(profile.cross.p95)
    expect(t.create).toBeLessThan(profile.same.p25)
    expect(t.join).toBeLessThan(t.create)
    expect(t.merge).toBeGreaterThanOrEqual(t.create + 0.15)
    expect(t.fitHigh).toBeGreaterThan(t.fitLow)
    expect(separation(profile)).toBeGreaterThan(0)
  })

  it('reports a noisy model as poorly separated', () => {
    expect(separation(similarityProfile(world(8, 30, 6))!)).toBeLessThan(separation(similarityProfile(world(8, 30, 0.8))!))
  })

  it('refuses to calibrate on too little data', () => {
    expect(similarityProfile(world(3, 30, 0.8))).toBeNull()
    expect(similarityProfile(world(8, 4, 0.8))).toBeNull()
  })
})
