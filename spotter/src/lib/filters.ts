/**
 * Dashboard filters, carried in the URL so every view is linkable and the
 * browser's back button works. One parser for server and client.
 */
import type { Platform, TrendStage } from '@/core/domain/types'
import { PLATFORMS, TREND_STAGES } from '@/core/domain/types'

export const RANGES = { '1d': 1, '3d': 3, '7d': 7, '14d': 14, '30d': 30 } as const
export type RangeKey = keyof typeof RANGES

export interface Filters {
  platform: Platform | null
  topic: string | null
  stage: TrendStage | null
  range: RangeKey
  minConfidence: number
}

type Params = Record<string, string | string[] | undefined>

function one(params: Params, key: string): string | null {
  const v = params[key]
  return typeof v === 'string' ? v : Array.isArray(v) ? (v[0] ?? null) : null
}

export function parseFilters(params: Params, defaults: { range?: RangeKey; minConfidence?: number } = {}): Filters {
  const platform = one(params, 'platform')
  const stage = one(params, 'stage')
  const range = one(params, 'range')
  const topic = one(params, 'topic')
  const conf = Number(one(params, 'conf'))
  return {
    platform: platform && (PLATFORMS as readonly string[]).includes(platform) ? (platform as Platform) : null,
    stage: stage && (TREND_STAGES as readonly string[]).includes(stage) ? (stage as TrendStage) : null,
    range: range && range in RANGES ? (range as RangeKey) : (defaults.range ?? '14d'),
    topic: topic && /^[a-z0-9_]{2,80}$/.test(topic) ? topic : null,
    minConfidence: Number.isFinite(conf) && conf >= 0 && conf <= 100 ? conf : (defaults.minConfidence ?? 0),
  }
}

export function filtersToQuery(f: Partial<Filters>): string {
  const q = new URLSearchParams()
  if (f.platform) q.set('platform', f.platform)
  if (f.topic) q.set('topic', f.topic)
  if (f.stage) q.set('stage', f.stage)
  if (f.range) q.set('range', f.range)
  if (f.minConfidence) q.set('conf', String(f.minConfidence))
  const s = q.toString()
  return s ? `?${s}` : ''
}
