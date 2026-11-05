// Solids of revolution, arc length and surface area — the geometry behind the
// Calculus II applications of the integral. A plane region
//   R = { (x, y) : a ≤ x ≤ b, g(x) ≤ y ≤ f(x) }
// is revolved about a horizontal line y = k or a vertical line x = h. Slices
// are computed for both methods about both kinds of axis:
//   washers — cut perpendicular to the axis; each slice is a union of annuli
//   shells  — cut parallel to the axis; each slice is a cylindrical shell
// When a cut runs along y (washers about a vertical axis, shells about a
// horizontal one) the region's cross-section {x : g(x) ≤ y ≤ f(x)} may be
// several intervals; it is found by sampling and refined by bisection.

import { integrate, QuadResult } from './quad';

export interface Region { f: (x: number) => number; g: (x: number) => number; a: number; b: number }
export type Axis = { kind: 'horizontal'; k: number } | { kind: 'vertical'; h: number };

/** {x ∈ [a, b] : g(x) ≤ y ≤ f(x)} as sorted intervals. */
export function intervalsAt(R: Region, y: number, samples = 400): [number, number][] {
  const inside = (x: number) => { const F = R.f(x), G = R.g(x); return Number.isFinite(F) && Number.isFinite(G) && G <= y && y <= F; };
  const refine = (lo: number, hi: number, loIn: boolean) => {
    for (let i = 0; i < 50; i++) { const m = (lo + hi) / 2; if (inside(m) === loIn) lo = m; else hi = m; }
    return (lo + hi) / 2;
  };
  const out: [number, number][] = [];
  const h = (R.b - R.a) / samples;
  let prevIn = inside(R.a), start = prevIn ? R.a : NaN;
  for (let i = 1; i <= samples; i++) {
    const x = R.a + i * h, cur = inside(x);
    if (cur !== prevIn) {
      const e = refine(x - h, x, prevIn);
      if (cur) start = e; else { out.push([start, e]); start = NaN; }
    }
    prevIn = cur;
  }
  if (prevIn && Number.isFinite(start)) out.push([start, R.b]);
  return out.filter(([p, q]) => q > p);
}

/** Range of y over the region (sampled). */
export function yRange(R: Region, samples = 600): [number, number] {
  let lo = Infinity, hi = -Infinity;
  for (let i = 0; i <= samples; i++) {
    const x = R.a + ((R.b - R.a) * i) / samples, F = R.f(x), G = R.g(x);
    if (Number.isFinite(G)) lo = Math.min(lo, G);
    if (Number.isFinite(F)) hi = Math.max(hi, F);
  }
  return [lo, hi];
}

/** Union of radial intervals [r0, r1]. */
function unionRadii(list: [number, number][]): [number, number][] {
  const s = list.filter(([p, q]) => q > p).sort((p, q) => p[0] - q[0]);
  const out: [number, number][] = [];
  for (const iv of s) { const last = out[out.length - 1]; if (last && iv[0] <= last[1]) last[1] = Math.max(last[1], iv[1]); else out.push([iv[0], iv[1]]); }
  return out;
}

/** Radii covered when the signed interval [p, q] (distance coordinate) is revolved. */
const radiiOf = (p: number, q: number): [number, number] => (p <= 0 && q >= 0 ? [0, Math.max(-p, q)] : [Math.min(Math.abs(p), Math.abs(q)), Math.max(Math.abs(p), Math.abs(q))]);

/** Does the region cross the axis (so revolving it overlaps itself)? */
export function straddles(R: Region, ax: Axis): boolean {
  if (ax.kind === 'vertical') return R.a < ax.h - 1e-12 && R.b > ax.h + 1e-12;
  const [lo, hi] = yRange(R);
  return lo < ax.k - 1e-9 && hi > ax.k + 1e-9;
}

export interface WasherSlice { s: number; ds: number; s0: number; rings: [number, number][]; dV: number }
export interface ShellSlice { rho: number; drho: number; r0: number; heights: [number, number][]; dV: number }

/**
 * n washer slices (midpoint rule): along x for a horizontal axis, along y for a
 * vertical one. s is the slice centre along the axis, rings the annuli [r, R].
 */
export function washerSlices(R: Region, ax: Axis, n: number): WasherSlice[] {
  const out: WasherSlice[] = [];
  if (ax.kind === 'horizontal') {
    const ds = (R.b - R.a) / n;
    for (let i = 0; i < n; i++) {
      const s = R.a + (i + 0.5) * ds, F = R.f(s), G = R.g(s);
      const rings = Number.isFinite(F) && Number.isFinite(G) && F > G ? [radiiOf(G - ax.k, F - ax.k)] : [];
      out.push({ s, ds, s0: s - ds / 2, rings, dV: Math.PI * rings.reduce((t, [r, Rr]) => t + Rr * Rr - r * r, 0) * ds });
    }
  } else {
    const [lo, hi] = yRange(R), ds = (hi - lo) / n;
    for (let i = 0; i < n; i++) {
      const s = lo + (i + 0.5) * ds;
      const rings = unionRadii(intervalsAt(R, s).map(([p, q]) => radiiOf(p - ax.h, q - ax.h)));
      out.push({ s, ds, s0: s - ds / 2, rings, dV: Math.PI * rings.reduce((t, [r, Rr]) => t + Rr * Rr - r * r, 0) * ds });
    }
  }
  return out;
}

/**
 * n shell slices (midpoint rule) on the side of the axis the region lies on:
 * radius ρ from the axis, heights the intervals along the axis at that radius.
 */
export function shellSlices(R: Region, ax: Axis, n: number): ShellSlice[] {
  const out: ShellSlice[] = [];
  if (ax.kind === 'vertical') {
    // distance from the axis: x − h on the region's side
    const right = (R.a + R.b) / 2 >= ax.h;
    const r0 = right ? Math.max(0, R.a - ax.h) : Math.max(0, ax.h - R.b), r1 = right ? R.b - ax.h : ax.h - R.a;
    const dr = (r1 - r0) / n;
    for (let i = 0; i < n; i++) {
      const rho = r0 + (i + 0.5) * dr, x = right ? ax.h + rho : ax.h - rho;
      const F = R.f(x), G = R.g(x);
      const heights: [number, number][] = Number.isFinite(F) && Number.isFinite(G) && F > G ? [[G, F]] : [];
      out.push({ rho, drho: dr, r0: rho - dr / 2, heights, dV: 2 * Math.PI * rho * heights.reduce((t, [p, q]) => t + q - p, 0) * dr });
    }
  } else {
    const [lo, hi] = yRange(R);
    const above = (lo + hi) / 2 >= ax.k;
    const r0 = above ? Math.max(0, lo - ax.k) : Math.max(0, ax.k - hi), r1 = above ? hi - ax.k : ax.k - lo;
    const dr = (r1 - r0) / n;
    for (let i = 0; i < n; i++) {
      const rho = r0 + (i + 0.5) * dr, y = above ? ax.k + rho : ax.k - rho;
      const heights = intervalsAt(R, y);
      out.push({ rho, drho: dr, r0: rho - dr / 2, heights, dV: 2 * Math.PI * rho * heights.reduce((t, [p, q]) => t + q - p, 0) * dr });
    }
  }
  return out;
}

/** The exact volume as one adaptive integral (washers about a horizontal axis, shells about a vertical one). */
export function volume(R: Region, ax: Axis, tol = 1e-10): QuadResult {
  if (ax.kind === 'horizontal') {
    const r = integrate((x) => { const F = R.f(x), G = R.g(x); if (!(F > G)) return 0; const [p, q] = radiiOf(G - ax.k, F - ax.k); return Math.PI * (q * q - p * p); }, R.a, R.b, tol);
    return r;
  }
  return integrate((x) => { const F = R.f(x), G = R.g(x); return F > G ? 2 * Math.PI * Math.abs(x - ax.h) * (F - G) : 0; }, R.a, R.b, tol);
}

/** Area and centroid of the region (adaptive quadrature). */
export function centroid(R: Region): { area: number; cx: number; cy: number } {
  const h = (x: number) => Math.max(0, R.f(x) - R.g(x));
  const A = integrate(h, R.a, R.b, 1e-11).value;
  const mx = integrate((x) => x * h(x), R.a, R.b, 1e-11).value;
  const my = integrate((x) => (R.f(x) > R.g(x) ? (R.f(x) ** 2 - R.g(x) ** 2) / 2 : 0), R.a, R.b, 1e-11).value;
  return { area: A, cx: mx / A, cy: my / A };
}

/** Length of the inscribed polyline with n equal x-steps. */
export function polylineLength(f: (x: number) => number, a: number, b: number, n: number): number {
  let L = 0, px = a, py = f(a);
  for (let i = 1; i <= n; i++) { const x = a + ((b - a) * i) / n, y = f(x); L += Math.hypot(x - px, y - py); px = x; py = y; }
  return L;
}

/** Lateral area of the n frusta that approximate the surface made by revolving y = f(x) ≥ 0 about the x-axis. */
export function frustaArea(f: (x: number) => number, a: number, b: number, n: number): number {
  let S = 0, px = a, py = f(a);
  for (let i = 1; i <= n; i++) { const x = a + ((b - a) * i) / n, y = f(x); S += Math.PI * (Math.abs(py) + Math.abs(y)) * Math.hypot(x - px, y - py); px = x; py = y; }
  return S;
}
