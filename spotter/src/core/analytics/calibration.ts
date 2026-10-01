/**
 * Calibrating clustering thresholds for an embedding model from the posts
 * SPOTTER has already collected.
 *
 * Posts the classifier put in the same topic are treated as "should group",
 * posts in different topics as "should not". The similarity distributions of
 * the two kinds of pairs tell where this model draws the line:
 *
 *   create   midway between what unrelated pairs rarely exceed (their 95th
 *            percentile) and what most related pairs reach (their 25th)
 *   join     slightly below create: joining an existing trend's centroid is
 *            easier than founding a new one (centroids average out noise)
 *   merge    what a typical related pair reaches (75th percentile), clamped
 *            well above create
 *   fitLow   a typical unrelated pair (median): topic fit 0
 *   fitHigh  a typical related pair (median): topic fit 100
 *
 * This is a heuristic, not a ground truth: topic labels come from a
 * classifier, and "same topic" is not always "same trend". Use it for remote
 * models whose defaults are uncalibrated, and compare against the defaults.
 */
import type { EmbeddingThresholds } from '../ai/types'
import { cosine } from './clustering'
import { quantile } from './stats'

export interface LabelledVector {
  topicKey: string
  vector: number[]
}

export interface SimilarityProfile {
  posts: number
  topics: number
  samePairs: number
  crossPairs: number
  same: Record<'p05' | 'p25' | 'p50' | 'p75' | 'p95', number>
  cross: Record<'p05' | 'p25' | 'p50' | 'p75' | 'p95', number>
}

const MIN_POSTS_PER_TOPIC = 5
const MIN_TOPICS = 4
const MIN_SAME_PAIRS = 200

function summary(xs: number[]): SimilarityProfile['same'] {
  const q = (p: number) => Math.round((quantile(xs, p) ?? 0) * 1000) / 1000
  return { p05: q(0.05), p25: q(0.25), p50: q(0.5), p75: q(0.75), p95: q(0.95) }
}

/** Deterministic pseudo-random numbers, so a calibration run is reproducible. */
function lcg(seed: number): () => number {
  let s = seed >>> 0
  return () => {
    s = (Math.imul(s, 1_664_525) + 1_013_904_223) >>> 0
    return s / 4_294_967_296
  }
}

/**
 * Similarities of same-topic and different-topic pairs. Topics with fewer
 * than five posts are left out; returns null when there is too little to go on.
 */
export function similarityProfile(items: LabelledVector[], maxPairs = 60_000): SimilarityProfile | null {
  const counts = new Map<string, number>()
  for (const item of items) counts.set(item.topicKey, (counts.get(item.topicKey) ?? 0) + 1)
  const usable = items.filter((item) => (counts.get(item.topicKey) ?? 0) >= MIN_POSTS_PER_TOPIC)
  const topics = new Set(usable.map((item) => item.topicKey))
  if (topics.size < MIN_TOPICS) return null

  const byTopic = new Map<string, LabelledVector[]>()
  for (const item of usable) byTopic.set(item.topicKey, [...(byTopic.get(item.topicKey) ?? []), item])
  const same: number[] = []
  const cross: number[] = []
  const random = lcg(0x5eed)
  const pick = <T>(xs: T[]): T => xs[Math.floor(random() * xs.length)]!
  const groups = [...byTopic.values()]
  // Half the budget on same-topic pairs (rare under uniform sampling), half on random pairs.
  for (let i = 0; i < maxPairs / 2; i++) {
    const group = pick(groups)
    const a = pick(group)
    const b = pick(group)
    if (a !== b) same.push(cosine(a.vector, b.vector))
  }
  for (let i = 0; i < maxPairs / 2; i++) {
    const a = pick(usable)
    const b = pick(usable)
    if (a.topicKey !== b.topicKey) cross.push(cosine(a.vector, b.vector))
  }
  if (same.length < MIN_SAME_PAIRS || cross.length < MIN_SAME_PAIRS) return null
  return { posts: usable.length, topics: topics.size, samePairs: same.length, crossPairs: cross.length, same: summary(same), cross: summary(cross) }
}

const round2 = (v: number) => Math.round(v * 100) / 100

export function suggestThresholds(profile: SimilarityProfile): EmbeddingThresholds {
  const create = round2((profile.cross.p95 + profile.same.p25) / 2)
  const join = round2(create - 0.04)
  const merge = round2(Math.min(0.97, Math.max(create + 0.15, profile.same.p75)))
  const fitLow = round2(profile.cross.p50)
  const fitHigh = round2(Math.max(fitLow + 0.2, profile.same.p50))
  return { join, create, merge, fitLow, fitHigh }
}

/** How cleanly the model separates related from unrelated posts: 1 = no overlap between their middle 90%. */
export function separation(profile: SimilarityProfile): number {
  const gap = profile.same.p05 - profile.cross.p95
  const spread = Math.max(1e-6, profile.same.p95 - profile.cross.p05)
  return round2(Math.max(-1, Math.min(1, gap / spread)))
}
