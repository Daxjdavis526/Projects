// Shared helpers for PHYS 3600 modules M5 and M6 (dielectrics and
// magnetostatics): CODATA 2022 constants, numerical field integrals (Biot–
// Savart along a polygon, a circular loop off its axis, a uniformly charged
// disk off its axis), the dipole fields, and builders for static graph
// pictures (arrows gated by a choice, circles, sheets). Every field these
// helpers return is computed — by a closed form where one is quoted in the
// lessons, otherwise by Gauss–Legendre quadrature. Files whose names start
// with "_" are helpers, not lessons.

import { strength } from '../math2210/_fields.js';

export { sf, th } from './_toolkit.js';

// ── constants, CODATA 2022 (SI) ──
export const QE = 1.602176634e-19;          // elementary charge, C (exact)
export const ME = 9.1093837139e-31;         // electron mass, kg
export const MP = 1.67262192595e-27;        // proton mass, kg
export const AMU = 1.66053906892e-27;       // atomic mass constant, kg
export const EPS0 = 8.8541878188e-12;       // vacuum permittivity, F/m
export const MU0 = 1.25663706127e-6;        // vacuum permeability, N/A²
export const H = 6.62607015e-34;            // Planck constant, J s (exact)
export const HBAR = H / (2 * Math.PI);
export const KC = 1 / (4 * Math.PI * EPS0);
export const KM = MU0 / (4 * Math.PI);      // μ₀/4π, T·m/A
export const PI = Math.PI;
export const DEG = PI / 180;

// ── quadrature ──
// 20-point Gauss–Legendre nodes and weights on [−1, 1]
const GL_X = [0.0765265211334973, 0.2277858511416451, 0.3737060887154195, 0.5108670019508271, 0.6360536807265150, 0.7463319064601508, 0.8391169718222188, 0.9122344282513259, 0.9639719272779138, 0.9931285991850949];
const GL_W = [0.1527533871307258, 0.1491729864726037, 0.1420961093183820, 0.1316886384491766, 0.1181945319615184, 0.1019301198172404, 0.0832767415767048, 0.0626720483341091, 0.0406014298003869, 0.0176140071391521];

/** ∫ₐᵇ f by composite 20-point Gauss–Legendre on n panels. */
export function gauss(f, a, b, n = 8) {
  const h = (b - a) / n;
  let s = 0;
  for (let k = 0; k < n; k++) {
    const m = a + (k + 0.5) * h, r = h / 2;
    for (let j = 0; j < 10; j++) s += GL_W[j] * (f(m - r * GL_X[j]) + f(m + r * GL_X[j])) * r;
  }
  return s;
}

const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];

/**
 * B (T) at point r from a current I (A) flowing along the polygon pts
 * (metres, [[x, y, z], …], open unless the last point repeats the first),
 * by Gauss–Legendre quadrature of the Biot–Savart integral on each side.
 */
export function biotSavart(pts, I, r, panels = 16) {
  const B = [0, 0, 0];
  for (let k = 0; k + 1 < pts.length; k++) {
    const a = pts[k], b = pts[k + 1], dl = [b[0] - a[0], b[1] - a[1], b[2] - a[2]];
    for (let c = 0; c < 3; c++) {
      B[c] += gauss((t) => {
        const p = [a[0] + t * dl[0], a[1] + t * dl[1], a[2] + t * dl[2]];
        const R = [r[0] - p[0], r[1] - p[1], r[2] - p[2]], d = Math.hypot(...R);
        return cross(dl, R)[c] / d ** 3;
      }, 0, 1, panels);
    }
  }
  return B.map((v) => KM * I * v);
}

/** B (T) of a circular loop (radius R, current I, in the plane z = 0, centred on the origin) at (s, z), numerically: [B_s, B_z]. */
export function loopB(I, R, s, z, panels = 24) {
  const f = (c) => gauss((p) => {
    const dl = [-R * Math.sin(p), R * Math.cos(p), 0], Rv = [s - R * Math.cos(p), -R * Math.sin(p), z];
    const d = Math.hypot(...Rv);
    return cross(dl, Rv)[c] / d ** 3;
  }, 0, 2 * PI, panels);
  return [KM * I * f(0), KM * I * f(2)];
}

/** On-axis field of a loop (closed form): μ₀IR²/2(R² + z²)^{3/2}. */
export const loopAxis = (I, R, z) => (MU0 * I * R * R) / (2 * (R * R + z * z) ** 1.5);

/**
 * E (V/m) of a disk of uniform charge σ (radius a, in the plane z = 0, centred
 * on the axis) at (s, z) off its axis, numerically: [E_s, E_z].
 */
export function diskE(sigma, a, s, z, nr = 5, np = 6) {
  let Es = 0, Ez = 0;
  // one pass for both components: Σ w (R/d³) ρ over the disk
  const hr = a / nr, hp = (2 * PI) / np;
  for (let i = 0; i < nr; i++) for (let a1 = 0; a1 < 10; a1++) for (const sr of [-1, 1]) {
    const rho = (i + 0.5) * hr + sr * (hr / 2) * GL_X[a1], wr = GL_W[a1] * (hr / 2);
    for (let j = 0; j < np; j++) for (let b1 = 0; b1 < 10; b1++) for (const sp of [-1, 1]) {
      const p = (j + 0.5) * hp + sp * (hp / 2) * GL_X[b1], w = wr * GL_W[b1] * (hp / 2);
      const R0 = s - rho * Math.cos(p), R1 = -rho * Math.sin(p), d3 = (R0 * R0 + R1 * R1 + z * z) ** 1.5;
      Es += (w * R0 * rho) / d3; Ez += (w * z * rho) / d3;
    }
  }
  return [KC * sigma * Es, KC * sigma * Ez];
}

/** On-axis field of a disk (closed form), z > 0: σ/2ε₀ (1 − z/√(z² + a²)). */
export const diskAxis = (sigma, a, z) => (sigma / (2 * EPS0)) * (1 - z / Math.sqrt(z * z + a * a));

/** Size of a pure dipole's field (B for moment m in A·m², via μ₀/4π) at distance r, angle θ (rad) from its axis. */
export const dipoleB = (m, r, th) => ((KM * m) / r ** 3) * Math.sqrt(1 + 3 * Math.cos(th) ** 2);

// ── pictures ──

/** A circle as a graph curve. */
export const circle = (R, color = 'ink3', extra = {}, cx = 0, cy = 0) => ({ param: [`${cx} + ${R}*cos(t)`, `${cy} + ${R}*sin(t)`], t: [0, 2 * PI], color, width: 2, ...extra });

/** A closed polygon as a graph curve list (one straight curve per side). */
export const polygon = (pts, color = 'ink3', extra = {}) => pts.map((p, k) => {
  const q = pts[(k + 1) % pts.length];
  return { param: [`${r6(p[0])} + t*(${r6(q[0] - p[0])})`, `${r6(p[1])} + t*(${r6(q[1] - p[1])})`], t: [0, 1], color, width: 2, ...extra };
});

const r6 = (v) => +(+v).toPrecision(6);

/**
 * Graph arrows for a plane field (u, v) = F(x, y) at the given points, with
 * lengths compressed as field2d draws them (weak arrows at least a third as
 * long as those of strength maxM), coloured by strength; `when` gates them.
 * F returns [u, v]; points where it is zero or not finite are skipped.
 */
export function arrowsAt(points, F, { len = 0.3, maxM = null, when, width = 1.5, minFrac = 0.35, color } = {}) {
  const vals = points.map(([x, y]) => { const [u, v] = F(x, y); return [x, y, u, v, Math.hypot(u, v)]; }).filter((p) => Number.isFinite(p[4]) && p[4] > 1e-12);
  const M = maxM ?? Math.max(...vals.map((p) => p[4]));
  return vals.map(([x, y, u, v, m]) => {
    const f = Math.min(1, m / M), s = (len * (minFrac + (1 - minFrac) * f)) / m;
    return { from: [r6(x - (u * s) / 2), r6(y - (v * s) / 2)], to: [r6(x + (u * s) / 2), r6(y + (v * s) / 2)], color: color || strength(f), width, ...(when ? { when } : {}) };
  });
}

/** Grid points filling x × y (n across, square cells), cell-centred. */
export function grid([x0, x1], [y0, y1], n) {
  const dx = (x1 - x0) / n, rows = Math.max(1, Math.round((y1 - y0) / dx)), dy = (y1 - y0) / rows, out = [];
  for (let i = 0; i < n; i++) for (let j = 0; j < rows; j++) out.push([x0 + (i + 0.5) * dx, y0 + (j + 0.5) * dy]);
  return out;
}

/** `when` for "choice key equals j". */
export const is = (key, j) => `step(0.5 - abs(${key} - ${j}))`;

/** The bare frame for a static picture on graph: equal scales, no axes or grid. */
export const bare = (x, y, extra = {}) => ({ x, y, equal: true, aspect: 'wide', axes: false, grid: false, xlabel: '', ylabel: '', ...extra });
