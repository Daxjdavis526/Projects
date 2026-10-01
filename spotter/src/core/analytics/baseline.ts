/**
 * Creator baselines: what a *typical* post from this creator gets.
 *
 * Robust by construction: the baseline is the median of log views, and its
 * spread is the median absolute deviation (MAD) of log views. One viral post
 * moves neither, so a creator's breakout never inflates the bar their next
 * post is judged against.
 *
 * Young posts have not finished accumulating views, so each sample is
 * age-adjusted with a generic accumulation curve before it enters the
 * baseline, and a young post is judged against the baseline scaled to its
 * age ("expected views by now"), not against the settled total.
 */
import type { Platform } from '../domain/types'
import { mad, median, quantile } from './stats'

const HOUR = 3_600_000

export const BASELINE_METHOD = 'robust-log-median-v1'
/** Below this many settled samples a creator's own baseline is not trusted. */
export const MIN_BASELINE_SAMPLES = 5
/** Posts younger than this are too unsettled to enter a baseline. */
export const MIN_SAMPLE_AGE_HOURS = 36

/**
 * Generic share of eventual views a post has collected by a given age.
 * Short-form accumulates faster than long-form. This is an approximation
 * used only to compare like with like; it is documented as such in the UI.
 */
export function expectedGrowthFraction(ageHours: number, longForm = false): number {
  if (ageHours <= 0) return 0
  const tau = longForm ? 96 : 36
  return 1 - Math.exp(-ageHours / tau)
}

export interface BaselineSample {
  views: number | null
  engagements: number | null
  followers: number | null
  publishedAt: Date | null
  durationSeconds: number | null
}

export interface Baseline {
  method: string
  sampleSize: number
  sufficient: boolean
  medianViews: number | null
  /** 1.4826 × MAD of ln(views): a robust standard deviation on the log scale. */
  logSpread: number | null
  madLogViews: number | null
  p25Views: number | null
  p75Views: number | null
  medianEngagementRate: number | null
  medianViewsPerFollower: number | null
}

function settledViews(sample: BaselineSample, now: Date): number | null {
  if (sample.views === null || !sample.publishedAt) return null
  const ageHours = (now.getTime() - sample.publishedAt.getTime()) / HOUR
  if (ageHours < MIN_SAMPLE_AGE_HOURS) return null
  const g = expectedGrowthFraction(ageHours, (sample.durationSeconds ?? 0) > 180)
  return g > 0 ? sample.views / g : null
}

export function computeBaseline(samples: BaselineSample[], now: Date): Baseline {
  const settled: number[] = []
  const engagementRates: number[] = []
  const perFollower: number[] = []
  for (const s of samples) {
    const v = settledViews(s, now)
    if (v === null || v <= 0) continue
    settled.push(v)
    if (s.engagements !== null && s.views) engagementRates.push(s.engagements / s.views)
    if (s.followers) perFollower.push(v / s.followers)
  }
  const logs = settled.map((v) => Math.log(v))
  const medLog = median(logs)
  const madLog = mad(logs)
  return {
    method: BASELINE_METHOD,
    sampleSize: settled.length,
    sufficient: settled.length >= MIN_BASELINE_SAMPLES,
    medianViews: medLog === null ? null : Math.exp(medLog),
    madLogViews: madLog,
    logSpread: madLog === null ? null : Math.max(0.15, 1.4826 * madLog),
    p25Views: quantile(settled, 0.25),
    p75Views: quantile(settled, 0.75),
    medianEngagementRate: median(engagementRates),
    medianViewsPerFollower: median(perFollower),
  }
}

export interface ExpectedViews {
  expected: number
  method: 'creator_baseline' | 'follower_ratio' | 'platform_median'
}

/**
 * Views a post of this creator would be expected to have at this age.
 * Falls back from the creator's own baseline, to followers × the niche's
 * typical views-per-follower, to the platform median — and says which.
 */
export function expectedViewsAt(
  ageHours: number,
  longForm: boolean,
  baseline: Baseline | null,
  followers: number | null,
  niche: NicheNorms | null,
  platform: Platform,
): ExpectedViews | null {
  const g = expectedGrowthFraction(ageHours, longForm)
  if (g <= 0) return null
  if (baseline?.sufficient && baseline.medianViews) {
    return { expected: baseline.medianViews * g, method: 'creator_baseline' }
  }
  const norms = niche?.[platform]
  if (followers && norms?.medianViewsPerFollower) {
    return { expected: followers * norms.medianViewsPerFollower * g, method: 'follower_ratio' }
  }
  if (norms?.medianSettledViews) return { expected: norms.medianSettledViews * g, method: 'platform_median' }
  return null
}

export interface PlatformNorms {
  medianViewsPerFollower: number | null
  medianSettledViews: number | null
  medianLikesPerFollower: number | null
  medianEngagementRate: number | null
  medianWeightedEngagementRate: number | null
  sampleSize: number
}

export type NicheNorms = Partial<Record<Platform, PlatformNorms>>

/**
 * How far a post is above (or below) what was expected, as a ratio.
 * 1.0 = exactly typical; 7.4 = seven times the creator's normal by this age.
 */
export function outperformanceRatio(views: number, expected: ExpectedViews | null): number | null {
  if (!expected || expected.expected <= 0) return null
  return views / expected.expected
}

/** Robust z-score on the log scale: how unusual this post is for this creator. */
export function robustZ(views: number, ageHours: number, longForm: boolean, baseline: Baseline | null): number | null {
  if (!baseline?.sufficient || !baseline.medianViews || !baseline.logSpread) return null
  const g = expectedGrowthFraction(ageHours, longForm)
  if (g <= 0 || views <= 0) return null
  return (Math.log(views / g) - Math.log(baseline.medianViews)) / baseline.logSpread
}
