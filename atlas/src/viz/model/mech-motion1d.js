// Motion along a line, from a description to sampled x(t), v(t) and a(t).
// The motion may be given by its position x(t), its velocity v(t) (with x0),
// its acceleration a(t) (with x0 and v0), or as segments of constant
// acceleration. DOM-free; tested in test/mech-motion1d.test.mjs.
//
// Integration: on each cell [t, t + h] of the time grid,
//   v(t + h) = v(t) + ∫ a(s) ds
//   x(t + h) = x(t) + v(t) h + ∫ (t + h − s) a(s) ds
// with 3-point Gauss–Legendre quadrature. That is exact for an acceleration
// that is a polynomial of degree ≤ 4 within the cell (≤ 3 for x), and it never
// samples a at a cell edge — so a jump in a placed on a break point (burnout,
// a change of segment) is integrated exactly.

const GL = [[-Math.sqrt(3 / 5), 5 / 9], [0, 8 / 9], [Math.sqrt(3 / 5), 5 / 9]];

/** ∫ f over [p, q] and ∫ (q − s) f(s) ds over [p, q], by 3-point Gauss–Legendre. */
function cell(f, p, q) {
  const m = (p + q) / 2, r = (q - p) / 2;
  let i0 = 0, i1 = 0;
  for (const [u, w] of GL) { const s = m + r * u, fs = f(s); i0 += w * fs; i1 += w * (q - s) * fs; }
  return [i0 * r, i1 * r];
}

/** Piecewise-constant acceleration [{ a, dt }, …] → { a(t), breaks, end }. After the last segment a = 0. */
export function fromSegments(segments) {
  const edges = [0];
  for (const s of segments) edges.push(edges[edges.length - 1] + s.dt);
  const a = (t) => {
    for (let k = 0; k < segments.length; k++) if (t < edges[k + 1]) return t >= edges[k] ? segments[k].a : 0;
    return 0;
  };
  return { a, breaks: edges.slice(1), end: edges[edges.length - 1] };
}

/**
 * @param {object} spec
 *   T          duration, s (> 0)
 *   x | v | a  functions of t (exactly one), or
 *   segments   [{ a, dt }] constant-acceleration pieces
 *   x0, v0     initial position and velocity (for v, a and segments)
 *   breaks     times where a (or v) may jump; the grid puts a node on each
 *   n          number of cells (default 600)
 * @returns {{ T, t: number[], x: number[], v: number[], a: number[], aLeft: number[], at(tq): {x, v, a}, dist(tq): number }}
 *   aLeft[i] is the limit of a from the left at t[i] — it differs from a[i] only at a jump.
 */
export function motion1d(spec) {
  const T = spec.T;
  if (!(T > 0)) throw new Error('motion1d: T must be positive');
  let { x: fx, v: fv, a: fa } = spec;
  let breaks = (spec.breaks || []).slice();
  if (spec.segments) { const s = fromSegments(spec.segments); fa = s.a; breaks = breaks.concat(s.breaks); }
  const mode = fx ? 'x' : fv ? 'v' : fa ? 'a' : null;
  if (!mode) throw new Error('motion1d: give x, v, a or segments');
  const x0 = spec.x0 ?? 0, v0 = spec.v0 ?? 0;
  const n = spec.n || 600;

  // the grid: uniform nodes plus every break inside (0, T)
  const set = new Set();
  for (let i = 0; i <= n; i++) set.add((T * i) / n);
  for (const b of breaks) if (b > 0 && b < T) set.add(b);
  const t = [...set].sort((p, q) => p - q);
  // drop nodes closer than 1e-9 T to a neighbour (a break almost on a node)
  const tt = [t[0]];
  for (let i = 1; i < t.length; i++) if (t[i] - tt[tt.length - 1] > 1e-9 * T) tt.push(t[i]); else if (i === t.length - 1) tt[tt.length - 1] = t[i];
  const N = tt.length;

  const hd = 1e-4 * Math.max(T, 1e-3);                 // step for numerical derivatives
  const d1 = (f, s) => (f(s + hd) - f(s - hd)) / (2 * hd);
  const d2 = (f, s) => (f(s + 10 * hd) - 2 * f(s) + f(s - 10 * hd)) / (100 * hd * hd);

  const X = new Array(N), V = new Array(N), A = new Array(N), AL = new Array(N);
  if (mode === 'x') {
    for (let i = 0; i < N; i++) { X[i] = fx(tt[i]); V[i] = d1(fx, tt[i]); A[i] = AL[i] = d2(fx, tt[i]); }
  } else if (mode === 'v') {
    X[0] = x0;
    for (let i = 0; i < N; i++) {
      V[i] = fv(tt[i]); A[i] = AL[i] = d1(fv, tt[i]);
      if (i) X[i] = X[i - 1] + cell(fv, tt[i - 1], tt[i])[0];
    }
  } else {
    X[0] = x0; V[0] = v0;
    for (let i = 0; i < N; i++) {
      // at a jump, a[i] is the value just after it and aLeft[i] the value just before
      A[i] = i < N - 1 ? fa(tt[i] + 1e-12 * T) : fa(T - 1e-12 * T);     // the last node: from the left
      AL[i] = i ? fa(tt[i] - 1e-12 * T) : A[i];
      if (i) {
        const h = tt[i] - tt[i - 1], [ia, ixa] = cell(fa, tt[i - 1], tt[i]);
        V[i] = V[i - 1] + ia;
        X[i] = X[i - 1] + V[i - 1] * h + ixa;
      }
    }
  }

  const cellOf = (tq) => {
    let lo = 0, hi = N - 1;
    while (hi - lo > 1) { const m = (lo + hi) >> 1; if (tt[m] <= tq) lo = m; else hi = m; }
    return lo;
  };
  function at(tq) {
    const s = Math.max(0, Math.min(T, tq));
    if (mode === 'x') return { x: fx(s), v: d1(fx, s), a: d2(fx, s) };
    const i = cellOf(s);
    if (mode === 'v') return { x: X[i] + (s > tt[i] ? cell(fv, tt[i], s)[0] : 0), v: fv(s), a: d1(fv, s) };
    const aNow = fa(s < T ? s + 1e-12 * T : s - 1e-12 * T);
    if (s <= tt[i]) return { x: X[i], v: V[i], a: aNow };
    const [ia, ixa] = cell(fa, tt[i], s);
    return { x: X[i] + V[i] * (s - tt[i]) + ixa, v: V[i] + ia, a: aNow };
  }

  // distance travelled: sum |Δx| per cell, splitting a cell where v changes sign
  const D = new Array(N); D[0] = 0;
  const pieceDist = (p, q) => {
    const vp = at(p).v, vq = at(q).v;
    const xp = at(p).x, xq = at(q).x;
    if (vp * vq >= 0) return Math.abs(xq - xp);
    let lo = p, hi = q;
    for (let k = 0; k < 60; k++) { const m = (lo + hi) / 2; if (at(m).v * vp > 0) lo = m; else hi = m; }
    const xm = at((lo + hi) / 2).x;
    return Math.abs(xm - xp) + Math.abs(xq - xm);
  };
  for (let i = 1; i < N; i++) {
    const sameSign = V[i - 1] * V[i] > 0;
    D[i] = D[i - 1] + (sameSign ? Math.abs(X[i] - X[i - 1]) : pieceDist(tt[i - 1], tt[i]));
  }
  function dist(tq) {
    const s = Math.max(0, Math.min(T, tq)), i = cellOf(s);
    return D[i] + (s > tt[i] ? pieceDist(tt[i], s) : 0);
  }

  return { T, t: tt, x: X, v: V, a: A, aLeft: AL, at, dist };
}
