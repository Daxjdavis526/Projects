// Seeded random numbers, so every generated question variant is reproducible:
// the same seed always gives the same numbers, the same answer key and the
// same choice order, in the browser and in the Node test suite.

/** mulberry32 — small, fast, good enough for picking question parameters. */
export function makeRng(seed = 1) {
  let a = (typeof seed === 'string' ? hashString(seed) : seed) >>> 0;
  const next = () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const rng = {
    next,
    /** integer in [lo, hi] inclusive */
    int: (lo, hi) => lo + Math.floor(next() * (hi - lo + 1)),
    /** integer in [lo, hi] other than those listed */
    intExcept: (lo, hi, except = []) => {
      for (let k = 0; k < 1000; k++) { const v = lo + Math.floor(next() * (hi - lo + 1)); if (!except.includes(v)) return v; }
      throw new Error('intExcept: no value available');
    },
    /** float in [lo, hi), rounded to `step` if given (e.g. 0.1) */
    float: (lo, hi, step) => {
      const v = lo + (hi - lo) * next();
      return step ? roundTo(v, step) : v;
    },
    pick: (arr) => arr[Math.floor(next() * arr.length)],
    sign: () => (next() < 0.5 ? -1 : 1),
    bool: (p = 0.5) => next() < p,
    shuffle: (arr) => {
      const a2 = arr.slice();
      for (let i = a2.length - 1; i > 0; i--) { const j = Math.floor(next() * (i + 1)); [a2[i], a2[j]] = [a2[j], a2[i]]; }
      return a2;
    },
    /** a permutation of 0..n-1 */
    perm: (n) => rng.shuffle([...Array(n).keys()]),
  };
  return rng;
}

export function roundTo(v, step) {
  const r = Math.round(v / step) * step;
  const decimals = Math.max(0, -Math.floor(Math.log10(step) + 1e-9));
  return +r.toFixed(decimals);
}

/** FNV-1a, for turning ids like "phys2210.M5.2/q3#7" into seeds. */
export function hashString(s) {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 0x01000193); }
  return h >>> 0;
}
