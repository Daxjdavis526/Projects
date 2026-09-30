/**
 * Deterministic pseudo-randomness for the demo world. The same seed and
 * inputs always produce the same world, so a demo database can be rebuilt
 * and tests can assert on exact outcomes.
 */

/** 32-bit string hash (cyrb53 folded), used to derive sub-seeds. */
export function hashString(input: string, seed = 0): number {
  let h1 = 0xdeadbeef ^ seed
  let h2 = 0x41c6ce57 ^ seed
  for (let i = 0; i < input.length; i++) {
    const ch = input.charCodeAt(i)
    h1 = Math.imul(h1 ^ ch, 2654435761)
    h2 = Math.imul(h2 ^ ch, 1597334677)
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909)
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909)
  return (h1 ^ h2) >>> 0
}

export interface Rng {
  next(): number
  int(minInclusive: number, maxInclusive: number): number
  float(min: number, max: number): number
  normal(mean?: number, sd?: number): number
  logNormal(medianValue: number, sigma: number): number
  pick<T>(items: readonly T[]): T
  weighted<T>(items: readonly T[], weight: (item: T) => number): T
  chance(p: number): boolean
  poisson(lambda: number): number
  shuffle<T>(items: readonly T[]): T[]
  sample<T>(items: readonly T[], n: number): T[]
}

/** mulberry32: small, fast, good enough for simulation. */
export function createRng(seed: number): Rng {
  let a = seed >>> 0
  const next = () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
  const normal = (mean = 0, sd = 1) => {
    let u = 0
    while (u === 0) u = next()
    const v = next()
    return mean + sd * Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v)
  }
  const rng: Rng = {
    next,
    int: (min, max) => min + Math.floor(next() * (max - min + 1)),
    float: (min, max) => min + next() * (max - min),
    normal,
    logNormal: (medianValue, sigma) => medianValue * Math.exp(normal(0, sigma)),
    pick: (items) => items[Math.floor(next() * items.length)]!,
    weighted: (items, weight) => {
      const weights = items.map((i) => Math.max(0, weight(i)))
      const total = weights.reduce((s, w) => s + w, 0)
      let r = next() * total
      for (let i = 0; i < items.length; i++) {
        r -= weights[i]!
        if (r <= 0) return items[i]!
      }
      return items[items.length - 1]!
    },
    chance: (p) => next() < p,
    poisson: (lambda) => {
      if (lambda <= 0) return 0
      if (lambda > 30) return Math.max(0, Math.round(normal(lambda, Math.sqrt(lambda))))
      const limit = Math.exp(-lambda)
      let k = 0
      let p = 1
      do {
        k++
        p *= next()
      } while (p > limit)
      return k - 1
    },
    shuffle: (items) => {
      const out = [...items]
      for (let i = out.length - 1; i > 0; i--) {
        const j = Math.floor(next() * (i + 1))
        ;[out[i], out[j]] = [out[j]!, out[i]!]
      }
      return out
    },
    sample: (items, n) => rng.shuffle(items).slice(0, n),
  }
  return rng
}

export function rngFor(seed: number, ...parts: Array<string | number>): Rng {
  return createRng(hashString(parts.join('|'), seed))
}
