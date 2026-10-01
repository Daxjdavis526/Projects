/**
 * Small, dependency-free statistics used throughout the engine.
 */

export function median(values: readonly number[]): number | null {
  const xs = values.filter((v) => Number.isFinite(v)).sort((a, b) => a - b)
  if (xs.length === 0) return null
  const mid = Math.floor(xs.length / 2)
  return xs.length % 2 === 1 ? xs[mid]! : (xs[mid - 1]! + xs[mid]!) / 2
}

export function quantile(values: readonly number[], q: number): number | null {
  const xs = values.filter((v) => Number.isFinite(v)).sort((a, b) => a - b)
  if (xs.length === 0) return null
  const pos = (xs.length - 1) * Math.min(1, Math.max(0, q))
  const lo = Math.floor(pos)
  const hi = Math.ceil(pos)
  return xs[lo]! + (xs[hi]! - xs[lo]!) * (pos - lo)
}

/** Median absolute deviation (unscaled). */
export function mad(values: readonly number[]): number | null {
  const m = median(values)
  if (m === null) return null
  return median(values.map((v) => Math.abs(v - m)))
}

export function mean(values: readonly number[]): number | null {
  const xs = values.filter((v) => Number.isFinite(v))
  return xs.length === 0 ? null : xs.reduce((s, v) => s + v, 0) / xs.length
}

export function sum(values: readonly (number | null | undefined)[]): number {
  let total = 0
  for (const v of values) if (typeof v === 'number' && Number.isFinite(v)) total += v
  return total
}

export function clamp(value: number, min = 0, max = 100): number {
  return Math.min(max, Math.max(min, value))
}

/**
 * Log-logistic curve mapping a positive quantity onto 0–100:
 *   score = 100 · x^k / (x^k + mid^k)
 * `mid` scores 50; each doubling of x adds progressively less. Used for every
 * "how big is this number" component, so all of them read the same way.
 */
export function logLogistic(x: number, mid: number, steepness = 1.2): number {
  if (!Number.isFinite(x) || x <= 0) return 0
  const a = Math.pow(x, steepness)
  return (100 * a) / (a + Math.pow(mid, steepness))
}

/** 0–100 score of a ratio around 1: ratio 1 → 50, ratio 2 → high, ratio 0.5 → low. */
export function ratioScore(ratio: number, steepness = 2): number {
  return logLogistic(ratio, 1, steepness)
}

export function round(value: number, digits = 1): number {
  const f = 10 ** digits
  return Math.round(value * f) / f
}

/** Count occurrences and return the most common values. */
export function topCounts<T extends string>(values: readonly T[], limit = 5): Array<{ value: T; count: number }> {
  const counts = new Map<T, number>()
  for (const v of values) counts.set(v, (counts.get(v) ?? 0) + 1)
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || (a[0] < b[0] ? -1 : 1))
    .slice(0, limit)
    .map(([value, count]) => ({ value, count }))
}
