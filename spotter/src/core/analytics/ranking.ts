/**
 * Choosing today's opportunities from scored trends.
 *
 * Gates (configurable): minimum confidence, minimum posts and independent
 * creators — unless a single post is an extreme breakout. Then rank by
 * Opportunity = w·Trend + (1−w)·Fit, and keep the list diverse: a second
 * cluster on the same topic, or with a near-identical centroid, is skipped.
 */
import type { AppSettings } from '../config/settings'
import { cosine, type Vector } from './clustering'
import { opportunityScore } from './relevance'

export interface RankCandidate {
  clusterId: string
  trendScore: number
  fitScore: number
  confidence: number
  itemCount: number
  creatorCount: number
  isBreakout: boolean
  topicKey: string | null
  centroid: Vector
}

export interface Ranked extends RankCandidate {
  opportunityScore: number
  rank: number
}

export interface Excluded {
  clusterId: string
  reason: string
}

export function rankOpportunities(
  candidates: RankCandidate[],
  settings: Pick<AppSettings, 'trend' | 'fit' | 'recommendations'>,
): { ranked: Ranked[]; excluded: Excluded[] } {
  const excluded: Excluded[] = []
  const eligible: Array<RankCandidate & { opportunityScore: number }> = []
  const { minConfidence, minContentCount, minCreatorCount } = settings.trend
  for (const cand of candidates) {
    if (cand.confidence < minConfidence) {
      excluded.push({ clusterId: cand.clusterId, reason: `confidence ${Math.round(cand.confidence)} < minimum ${minConfidence}` })
      continue
    }
    const enoughEvidence = cand.itemCount >= minContentCount && cand.creatorCount >= minCreatorCount
    if (!enoughEvidence && !cand.isBreakout) {
      excluded.push({
        clusterId: cand.clusterId,
        reason: `${cand.itemCount} posts from ${cand.creatorCount} creators (needs ${minContentCount} posts from ${minCreatorCount}+ creators, or a breakout)`,
      })
      continue
    }
    eligible.push({ ...cand, opportunityScore: opportunityScore(cand.trendScore, cand.fitScore, settings.fit.trendWeight) })
  }
  eligible.sort((a, b) => b.opportunityScore - a.opportunityScore || b.confidence - a.confidence || (a.clusterId < b.clusterId ? -1 : 1))

  const ranked: Ranked[] = []
  for (const cand of eligible) {
    if (ranked.length >= settings.recommendations.count) break
    const duplicate = ranked.find(
      (r) => (cand.topicKey && r.topicKey === cand.topicKey) || cosine(r.centroid, cand.centroid) >= 0.92,
    )
    if (duplicate) {
      excluded.push({ clusterId: cand.clusterId, reason: `too similar to a higher-ranked opportunity (${duplicate.clusterId})` })
      continue
    }
    ranked.push({ ...cand, rank: ranked.length + 1 })
  }
  return { ranked, excluded }
}
