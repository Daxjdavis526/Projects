// Normal modes of a vibrating membrane fixed along its edge, DOM-free.
// Rectangle a × b: φ_mn = sin(mπx/a) sin(nπy/b), ω_mn = cπ√((m/a)² + (n/b)²).
// Disk of radius a: φ_mn = J_m(j_mn r/a) cos(mθ), ω_mn = c j_mn / a, where j_mn
// is the n-th positive zero of the Bessel function J_m — computed here by
// bracketing and bisection, not typed from a table. Used by the pde2-membrane
// simulation and the st-b lessons; tested in test/pde2.test.mjs.

import { besselJ } from '../../core/expr.js';

const zeroCache = new Map();

/** The k-th positive zero j_{m,k} of J_m (m ≥ 0 integer, k ≥ 1), to about 1e-13. */
export function besselZero(m, k) {
  const key = `${m},${k}`;
  if (zeroCache.has(key)) return zeroCache.get(key);
  // J_m has no zeros in (0, m]; scan from just above 0 in steps much smaller than the zero spacing (≈ π)
  let x = Math.max(1e-6, m === 0 ? 0.5 : m), f = besselJ(m, x), found = 0, z = NaN;
  const h = 0.05;
  while (found < k) {
    const x2 = x + h, f2 = besselJ(m, x2);
    if (f === 0 || f * f2 < 0) {
      let lo = x, hi = x2, flo = f;
      for (let i = 0; i < 80; i++) {
        const mid = 0.5 * (lo + hi), fm = besselJ(m, mid);
        if (flo * fm <= 0) hi = mid; else { lo = mid; flo = fm; }
      }
      found++;
      z = 0.5 * (lo + hi);
      x = x2; f = f2;
      if (found === k) break;
      continue;
    }
    x = x2; f = f2;
  }
  zeroCache.set(key, z);
  return z;
}

/** The dimensionless wavenumber of a mode: k·a, so that ω = c·k. Rectangle: with a = 1 and b = aspect. */
export function modeK(shape, m, n, aspect = 1) {
  if (shape === 'disk') return besselZero(m, n);
  return Math.PI * Math.hypot(m, n / aspect);
}

/** The lowest mode: (1, 1) for a rectangle, (0, 1) for a disk. */
export const fundamental = (shape, aspect = 1) => (shape === 'disk' ? modeK('disk', 0, 1) : modeK('rect', 1, 1, aspect));

/** The mode shape at (x, y): rectangle on [0, 1] × [0, aspect]; disk of radius 1 centred at 0 (NaN outside). */
export function shape(sh, m, n, x, y, aspect = 1) {
  if (sh === 'disk') {
    const r = Math.hypot(x, y);
    if (r > 1) return NaN;
    return besselJ(m, besselZero(m, n) * r) * Math.cos(m * Math.atan2(y, x));
  }
  if (x < 0 || x > 1 || y < 0 || y > aspect) return NaN;
  return Math.sin(m * Math.PI * x) * Math.sin((n * Math.PI * y) / aspect);
}

/** The largest |value| of a mode shape (for scaling): 1 for a rectangle, max|J_m| on [0, j_mn] for a disk. */
export function peak(sh, m, n) {
  if (sh !== 'disk') return 1;
  const j = besselZero(m, n);
  let best = 0;
  for (let i = 0; i <= 400; i++) best = Math.max(best, Math.abs(besselJ(m, (j * i) / 400)));
  return best;
}

/**
 * The lowest `count` modes, sorted by frequency: [{ m, n, k, ratio }] with ratio = k / k_fundamental.
 * For the disk each m ≥ 1 is listed once, though it stands for two modes (cos mθ and sin mθ).
 */
export function modeList(sh, count = 10, aspect = 1) {
  const out = [];
  const M = 12;
  for (let m = sh === 'disk' ? 0 : 1; m <= M; m++) for (let n = 1; n <= M; n++) out.push({ m, n, k: modeK(sh, m, n, aspect) });
  out.sort((p, q) => p.k - q.k);
  const k0 = fundamental(sh, aspect);
  return out.slice(0, count).map((o) => ({ ...o, ratio: o.k / k0 }));
}

/** Frequency in Hz of mode (m, n) for wave speed c (m/s) and size L (m): the side a of a rectangle, or the radius of a disk. */
export function freqHz(sh, m, n, c, L, aspect = 1) {
  return (c * modeK(sh, m, n, aspect)) / (2 * Math.PI * L);
}
