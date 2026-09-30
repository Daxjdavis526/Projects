/**
 * Metrics derived from a content item's snapshot history.
 *
 * Views accumulate from zero at publication, so (publishedAt, 0) is a real
 * data point, not an assumption about the curve: it lets a single snapshot
 * give a lifetime average rate, and two snapshots give a measured recent
 * velocity plus an acceleration ratio. Nothing is extrapolated beyond the
 * latest snapshot.
 */
import type { Platform } from '../domain/types'

const HOUR = 3_600_000

export interface SnapshotPoint {
  t: number
  views: number | null
  likes: number | null
  comments: number | null
  shares: number | null
  saves: number | null
}

export interface ItemSeries {
  contentItemId: string
  platform: Platform
  creatorId: string | null
  publishedAt: Date | null
  snapshots: SnapshotPoint[]
}

export interface ItemVelocity {
  ageHours: number | null
  latest: SnapshotPoint | null
  snapshotCount: number
  /** Views per hour now: measured between the last two snapshots when possible, else lifetime average. */
  viewsPerHour: number | null
  /** True when viewsPerHour came from two real snapshots, not the lifetime average. */
  velocityMeasured: boolean
  /** Likes + comments + shares + saves per hour, same method. */
  engagementsPerHour: number | null
  /** Recent segment rate ÷ previous segment rate. >1 speeding up, <1 slowing. */
  accelerationRatio: number | null
}

/** Engagements = the sum of whichever engagement counters exist. */
export function engagements(p: SnapshotPoint): number | null {
  const parts = [p.likes, p.comments, p.shares, p.saves].filter((v): v is number => typeof v === 'number')
  return parts.length === 0 ? null : parts.reduce((s, v) => s + v, 0)
}

type Field = (p: SnapshotPoint) => number | null

/** Minimum gap for a rate between two snapshots to be meaningful. */
const MIN_GAP_HOURS = 0.75

function rateBetween(a: { t: number; v: number }, b: { t: number; v: number }): number | null {
  const hours = (b.t - a.t) / HOUR
  if (hours < MIN_GAP_HOURS) return null
  return Math.max(0, (b.v - a.v) / hours)
}

/** Points with a value for `field`, oldest first, prefixed by (publishedAt, 0). */
function seriesFor(item: ItemSeries, field: Field): Array<{ t: number; v: number }> {
  const points = item.snapshots
    .map((s) => ({ t: s.t, v: field(s) }))
    .filter((p): p is { t: number; v: number } => typeof p.v === 'number')
    .sort((a, b) => a.t - b.t)
  // De-duplicate identical timestamps (keep the last value).
  const dedup: Array<{ t: number; v: number }> = []
  for (const p of points) {
    if (dedup.length > 0 && dedup[dedup.length - 1]!.t === p.t) dedup[dedup.length - 1] = p
    else dedup.push(p)
  }
  if (item.publishedAt && dedup.length > 0 && item.publishedAt.getTime() < dedup[0]!.t) {
    dedup.unshift({ t: item.publishedAt.getTime(), v: 0 })
  }
  return dedup
}

function velocityFor(item: ItemSeries, field: Field): { rate: number | null; measured: boolean; acceleration: number | null } {
  const pts = seriesFor(item, field)
  if (pts.length < 2) return { rate: null, measured: false, acceleration: null }
  const last = pts[pts.length - 1]!
  // Most recent segment long enough to measure.
  let recent: number | null = null
  let recentStartIndex = -1
  for (let i = pts.length - 2; i >= 0; i--) {
    recent = rateBetween(pts[i]!, last)
    if (recent !== null) {
      recentStartIndex = i
      break
    }
  }
  if (recent === null) return { rate: null, measured: false, acceleration: null }
  const hasOrigin = item.publishedAt !== null && pts[0]!.v === 0 && pts[0]!.t === item.publishedAt.getTime()
  const measured = !(hasOrigin && recentStartIndex === 0)
  let acceleration: number | null = null
  const segEnd = pts[recentStartIndex]!
  for (let j = recentStartIndex - 1; j >= 0; j--) {
    const previous = rateBetween(pts[j]!, segEnd)
    if (previous !== null) {
      acceleration = previous > 0 ? recent / previous : recent > 0 ? null : 1
      break
    }
  }
  return { rate: recent, measured, acceleration }
}

export function itemVelocity(item: ItemSeries, now: Date): ItemVelocity {
  const sorted = [...item.snapshots].sort((a, b) => a.t - b.t)
  const latest = sorted[sorted.length - 1] ?? null
  const ageHours = item.publishedAt ? Math.max(0, (now.getTime() - item.publishedAt.getTime()) / HOUR) : null
  const views = velocityFor(item, (p) => p.views)
  const eng = velocityFor(item, engagements)
  return {
    ageHours,
    latest,
    snapshotCount: sorted.length,
    viewsPerHour: views.rate,
    velocityMeasured: views.measured,
    engagementsPerHour: eng.rate,
    accelerationRatio: views.acceleration ?? (views.rate === null ? eng.acceleration : null),
  }
}

/**
 * Cumulative value of `field` at time t by linear interpolation between
 * snapshots (and the publication origin). Returns null outside the observed
 * range: no extrapolation.
 */
export function valueAt(item: ItemSeries, t: number, field: Field = (p) => p.views): number | null {
  const pts = seriesFor(item, field)
  if (pts.length === 0 || t < pts[0]!.t || t > pts[pts.length - 1]!.t) return null
  for (let i = 1; i < pts.length; i++) {
    const a = pts[i - 1]!
    const b = pts[i]!
    if (t <= b.t) {
      if (b.t === a.t) return b.v
      return a.v + ((b.v - a.v) * (t - a.t)) / (b.t - a.t)
    }
  }
  return pts[pts.length - 1]!.v
}

/**
 * Like valueAt, but only inside the span of real observations: between the
 * first and last snapshot. Before publication it is 0 (nothing existed yet);
 * between publication and the first snapshot it is unknown (null), because
 * the shape of the curve there was never observed.
 */
export function observedValueAt(item: ItemSeries, t: number, field: Field = (p) => p.views): number | null {
  const pub = item.publishedAt?.getTime() ?? null
  if (pub !== null && t <= pub) return 0
  const real = item.snapshots
    .map((s) => ({ t: s.t, v: field(s) }))
    .filter((p): p is { t: number; v: number } => typeof p.v === 'number')
    .sort((a, b) => a.t - b.t)
  if (real.length === 0 || t < real[0]!.t || t > real[real.length - 1]!.t) return null
  for (let i = 1; i < real.length; i++) {
    const a = real[i - 1]!
    const b = real[i]!
    if (t <= b.t) return b.t === a.t ? b.v : a.v + ((b.v - a.v) * (t - a.t)) / (b.t - a.t)
  }
  return real[real.length - 1]!.v
}

export interface RateBreakdown {
  likeRate: number | null
  commentRate: number | null
  shareRate: number | null
  saveRate: number | null
  engagementRate: number | null
}

/** Engagement ratios against views. Null where views or the counter is unknown. */
export function engagementRates(p: SnapshotPoint | null): RateBreakdown {
  const views = p?.views ?? null
  const ratio = (x: number | null | undefined) => (views && views > 0 && typeof x === 'number' ? x / views : null)
  const eng = p ? engagements(p) : null
  return {
    likeRate: ratio(p?.likes),
    commentRate: ratio(p?.comments),
    shareRate: ratio(p?.shares),
    saveRate: ratio(p?.saves),
    engagementRate: ratio(eng),
  }
}

/**
 * Weighted engagement used for scoring: comments, shares and saves signal
 * more deliberate interest than a like, and debates show up in comments.
 */
export function weightedEngagementRate(p: SnapshotPoint | null): number | null {
  if (!p || !p.views || p.views <= 0) return null
  const parts: Array<[number | null, number]> = [
    [p.likes, 1],
    [p.comments, 3],
    [p.shares, 2],
    [p.saves, 2],
  ]
  const present = parts.filter(([v]) => typeof v === 'number') as Array<[number, number]>
  if (present.length === 0) return null
  return present.reduce((s, [v, w]) => s + v * w, 0) / p.views
}
