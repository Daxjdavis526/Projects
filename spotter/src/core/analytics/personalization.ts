/**
 * What works for this creator, learned from their own posts.
 *
 * Each own post gets a log-lift: ln(views ÷ what this creator normally gets
 * on that platform by that age). Lifts are grouped by feature — topic,
 * format, hook, style, length, posting window, weekday, platform — and each
 * group's mean is shrunk toward zero by `k` pseudo-posts (empirical-Bayes
 * style), so two lucky posts do not become a "pattern". lift = exp(shrunk).
 */
import type { Platform } from '../domain/types'
import { PLATFORM_LABEL } from '../domain/types'
import { median, round } from './stats'

export const PERSONALIZATION_DIMENSIONS = [
  'topic',
  'format',
  'hook_type',
  'style',
  'controversy',
  'length',
  'posting_window',
  'weekday',
  'platform',
] as const
export type PersonalizationDimension = (typeof PERSONALIZATION_DIMENSIONS)[number]

export const DIMENSION_LABEL: Record<PersonalizationDimension, string> = {
  topic: 'Topic',
  format: 'Format',
  hook_type: 'Hook',
  style: 'Style',
  controversy: 'Controversy',
  length: 'Length',
  posting_window: 'Posting time',
  weekday: 'Weekday',
  platform: 'Platform',
}

export interface OwnPostFeatures {
  topic?: string | null
  format?: string | null
  hook_type?: string | null
  style?: string | null
  controversy?: string | null
  length?: string | null
  posting_window?: string | null
  weekday?: string | null
  platform?: string | null
}

export interface OwnPost {
  contentItemId: string
  platform: Platform
  views: number
  expectedViews: number
  engagementRate: number | null
  features: OwnPostFeatures
}

export interface LiftRecord {
  dimension: PersonalizationDimension
  value: string
  postCount: number
  meanLogLift: number
  shrunkLogLift: number
  lift: number
  medianViews: number | null
  avgEngagementRate: number | null
  /** 0–1: how much to trust this lift (sample size and consistency). */
  confidence: number
}

export const SHRINKAGE_K = 2

export function lengthBucket(seconds: number | null | undefined): string | null {
  if (seconds === null || seconds === undefined || !Number.isFinite(seconds) || seconds <= 0) return null
  if (seconds < 30) return 'Under 30s'
  if (seconds <= 45) return '30–45s'
  if (seconds <= 60) return '45–60s'
  if (seconds <= 90) return '60–90s'
  if (seconds <= 180) return '90s–3m'
  if (seconds <= 600) return '3–10m'
  return '10m+'
}

function localParts(date: Date, timeZone: string): { hour: number; weekday: string } {
  const parts = new Intl.DateTimeFormat('en-US', { timeZone, hour: 'numeric', hourCycle: 'h23', weekday: 'long' }).formatToParts(date)
  const hour = Number(parts.find((p) => p.type === 'hour')?.value ?? '0')
  const weekday = parts.find((p) => p.type === 'weekday')?.value ?? 'Unknown'
  return { hour: hour === 24 ? 0 : hour, weekday }
}

export function postingWindow(date: Date, timeZone: string): string {
  const { hour } = localParts(date, timeZone)
  if (hour >= 5 && hour < 11) return 'Morning (5–11)'
  if (hour >= 11 && hour < 16) return 'Midday (11–16)'
  if (hour >= 16 && hour < 21) return 'Evening (16–21)'
  return 'Night (21–5)'
}

export function weekday(date: Date, timeZone: string): string {
  return localParts(date, timeZone).weekday
}

export function computeLifts(posts: OwnPost[], k = SHRINKAGE_K): LiftRecord[] {
  const groups = new Map<string, { dimension: PersonalizationDimension; value: string; posts: OwnPost[]; logs: number[] }>()
  for (const post of posts) {
    if (post.views <= 0 || post.expectedViews <= 0) continue
    const logLift = Math.log(post.views / post.expectedViews)
    for (const dimension of PERSONALIZATION_DIMENSIONS) {
      const value = post.features[dimension]
      if (!value) continue
      const key = `${dimension}\u0000${value}`
      let g = groups.get(key)
      if (!g) groups.set(key, (g = { dimension, value, posts: [], logs: [] }))
      g.posts.push(post)
      g.logs.push(logLift)
    }
  }
  const out: LiftRecord[] = []
  for (const g of groups.values()) {
    const n = g.logs.length
    const total = g.logs.reduce((s, v) => s + v, 0)
    const mean = total / n
    const shrunk = total / (n + k)
    const variance = n > 1 ? g.logs.reduce((s, v) => s + (v - mean) ** 2, 0) / (n - 1) : 1
    const se = Math.sqrt(variance / n)
    // Confidence rises with sample size and falls with noisy, inconsistent lifts.
    const confidence = (n / (n + k)) * Math.max(0, 1 - Math.min(1, se / (Math.abs(mean) + 0.25)))
    const engagement = g.posts.map((p) => p.engagementRate).filter((v): v is number => v !== null)
    out.push({
      dimension: g.dimension,
      value: g.value,
      postCount: n,
      meanLogLift: mean,
      shrunkLogLift: shrunk,
      lift: Math.exp(shrunk),
      medianViews: median(g.posts.map((p) => p.views)),
      avgEngagementRate: engagement.length ? engagement.reduce((s, v) => s + v, 0) / engagement.length : null,
      confidence: round(confidence, 3),
    })
  }
  return out.sort((a, b) => a.dimension.localeCompare(b.dimension) || b.shrunkLogLift - a.shrunkLogLift)
}

function describeValue(dimension: PersonalizationDimension, value: string): string {
  switch (dimension) {
    case 'topic':
      return `posting about ${value.toLowerCase()}`
    case 'format':
      return `using the ${value.toLowerCase()} format`
    case 'hook_type':
      return `opening with a ${value.toLowerCase()} hook`
    case 'style':
      return `the tone is ${value.toLowerCase()}`
    case 'controversy':
      return value === 'high' ? 'the topic is controversial' : 'the topic is uncontroversial'
    case 'length':
      return `videos run ${value}`
    case 'posting_window':
      return `posting in the ${value.split(' ')[0]!.toLowerCase()}`
    case 'weekday':
      return `posting on ${value}s`
    case 'platform':
      return `posting on ${PLATFORM_LABEL[value as Platform] ?? value}`
  }
}

/**
 * Plain-English statements about the strongest, best-supported patterns,
 * e.g. "You get 2.1× your normal views when the topic is controversial (11 posts)."
 */
export function buildInsights(lifts: LiftRecord[], limit = 6): string[] {
  return lifts
    .filter((l) => l.postCount >= 3 && l.confidence >= 0.25 && Math.abs(l.shrunkLogLift) >= 0.15)
    .sort((a, b) => Math.abs(b.shrunkLogLift) * b.confidence - Math.abs(a.shrunkLogLift) * a.confidence)
    .slice(0, limit)
    .map((l) => {
      const multiple = l.lift >= 1 ? `${round(l.lift, 1)}×` : `${round(l.lift, 2)}×`
      const direction = l.lift >= 1 ? 'your normal views' : 'your normal views — below average'
      return `You get ${multiple} ${direction} when ${describeValue(l.dimension, l.value)} (${l.postCount} posts).`
    })
}
