/**
 * Trend stage: EMERGING, ACCELERATING, MATURE or DECLINING, decided from
 * collected metrics, and always with the reason stated.
 *
 * The input is the trend's momentum — posts published in the last 3 days
 * versus the 3 days before, each weighted by how far it outran its creator's
 * normal (core/analytics/scoring.ts) — plus the trend's age and how far its
 * momentum sits below its own peak. Momentum is used rather than summed
 * views/hour because a sum of views is dominated by whichever big account
 * posted last: one large creator's upload would flip a fading trend to
 * "accelerating".
 *
 *   DECLINING     momentum below 45% of its 10-day peak and not recovering,
 *                 or shrinking to ≤ 0.85× per day, or no posts in six days
 *   ACCELERATING  momentum growing ≥ 1.15× per day, trend older than 4 days
 *   EMERGING      younger than 4 days (by its oldest post) and not shrinking
 *   MATURE        everything else: established and roughly steady
 */
import type { TrendStage } from '../domain/types'
import { round } from './stats'

export const STAGE_THRESHOLDS = {
  /** Momentum growth per day at or above which a trend is accelerating (or emerging, if young). */
  accelerating: 1.15,
  /** Growth per day at or below which a trend is declining. */
  declining: 0.85,
  /** Share of its own 10-day peak momentum below which a trend that is not recovering is declining. */
  belowPeak: 0.45,
  /** Trends whose oldest post is younger than this are "emerging" while they are not shrinking. */
  youngHours: 96,
  /** Fewer posts than this across both 3-day windows and the stage is flagged as thin evidence. */
  minPosts: 4,
} as const

export interface StageInput {
  /** Momentum growth per day; null when there is nothing dated to measure. */
  growthPerDay: number | null
  /** Hours since the oldest post in the trend was published. */
  trendAgeHours: number | null
  itemCount: number
  postsLast72h: number
  postsPrev72h: number
  /** Performance-weighted posts in the last 72 hours, and the highest value over the last ten days. */
  momentum: number
  momentumPeak: number
}

export interface StageResult {
  stage: TrendStage
  basis: string
  /** 'measured' with enough posts to go on; 'estimated' when the call rests on a handful. */
  evidence: 'measured' | 'estimated'
}

export function classifyStage(input: StageInput): StageResult {
  const T = STAGE_THRESHOLDS
  const g = input.growthPerDay
  const posts = input.postsLast72h + input.postsPrev72h
  const evidence = posts >= T.minPosts ? 'measured' : 'estimated'
  const young = input.trendAgeHours !== null && input.trendAgeHours < T.youngHours
  const ageText = input.trendAgeHours === null ? '' : ` First post ${Math.max(0, Math.round(input.trendAgeHours / 24))}d ago.`
  const postsText = `${input.postsLast72h} post${input.postsLast72h === 1 ? '' : 's'} in the last 3 days vs ${input.postsPrev72h} in the 3 before`
  const growthText = g === null ? '' : `Momentum ${g >= 1 ? 'growing' : 'shrinking'} ${round(g, 2)}× per day (${postsText}).`
  const result = (stage: TrendStage, basis: string): StageResult => ({ stage, basis: `${basis}${ageText}`.trim(), evidence })

  if (g === null || posts === 0) return result(young ? 'emerging' : 'declining', young ? 'Too new to measure momentum yet.' : 'No new posts in the last six days.')

  if (!young && input.momentumPeak > 0 && input.momentum < T.belowPeak * input.momentumPeak && g < 1) {
    const pct = Math.round((100 * input.momentum) / input.momentumPeak)
    return result('declining', `Momentum is ${pct}% of its 10-day peak and still falling. ${growthText}`)
  }
  if (g >= T.accelerating) return result(young ? 'emerging' : 'accelerating', growthText)
  if (g <= T.declining) return result('declining', growthText)
  if (young) return result('emerging', growthText)
  return result('mature', `${growthText} ${input.itemCount} posts so far.`)
}

export const STAGE_LABEL: Record<TrendStage, string> = {
  emerging: 'Emerging',
  accelerating: 'Accelerating',
  mature: 'Mature',
  declining: 'Declining',
}
