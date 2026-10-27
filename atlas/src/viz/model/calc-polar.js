// Plane curves for sims/calc-polar.js: parametric and polar curves sampled,
// measured (arc length, the area a ray sweeps, the area under a parametric
// curve), cut into the thin wedges of ½∫r²dθ, conic sections written as
// r = p/(1 + e cos θ) with the focus at the pole, and a body moving on an
// elliptical orbit by Kepler's equation. DOM-free; tested in
// test/calc-polar.test.mjs.

export const TAU = 2 * Math.PI;

/** Points [x, y, t] of a parametric curve at n + 1 equally spaced parameter values. */
export function sampleParam(fx, fy, a, b, n = 600) {
  const out = [];
  for (let i = 0; i <= n; i++) { const t = a + ((b - a) * i) / n; out.push([fx(t), fy(t), t]); }
  return out;
}

/** Points [x, y, θ, r] of a polar curve r = f(θ); a negative r lands on the opposite ray. */
export function samplePolar(r, a, b, n = 600) {
  const out = [];
  for (let i = 0; i <= n; i++) { const th = a + ((b - a) * i) / n, rr = r(th); out.push([rr * Math.cos(th), rr * Math.sin(th), th, rr]); }
  return out;
}

/** Total length of a polyline [[x, y], …], skipping over non-finite points. */
export function polylineLength(pts) {
  let L = 0;
  for (let i = 1; i < pts.length; i++) {
    const [x0, y0] = pts[i - 1], [x1, y1] = pts[i];
    if (Number.isFinite(x0) && Number.isFinite(y0) && Number.isFinite(x1) && Number.isFinite(y1)) L += Math.hypot(x1 - x0, y1 - y0);
  }
  return L;
}

/**
 * Arc length of (x(t), y(t)) for a ≤ t ≤ b: inscribed polygons with n and 2n
 * chords, extrapolated (the chord error falls like 1/n² for a smooth curve).
 */
export function paramLength(fx, fy, a, b, n = 2000) {
  const L1 = polylineLength(sampleParam(fx, fy, a, b, n)), L2 = polylineLength(sampleParam(fx, fy, a, b, 2 * n));
  return (4 * L2 - L1) / 3;
}

/** Arc length of the polar curve r = f(θ), α ≤ θ ≤ β. */
export function polarLength(r, a, b, n = 2000) {
  return paramLength((th) => r(th) * Math.cos(th), (th) => r(th) * Math.sin(th), a, b, n);
}

/** Composite Simpson's rule with n (even) intervals. */
export function simpson(f, a, b, n = 2000) {
  if (n % 2) n++;
  const h = (b - a) / n;
  let s = f(a) + f(b);
  for (let i = 1; i < n; i++) s += f(a + i * h) * (i % 2 ? 4 : 2);
  return (s * h) / 3;
}

/**
 * The area swept by the segment from the pole (or from an inner curve) out to
 * r = f(θ) as θ runs from α to β: ½∫(f² − g²) dθ. Every pass counts, so a
 * curve traced twice is counted twice — exactly as the integral does.
 */
export function polarArea(r, a, b, inner = null, n = 2000) {
  return simpson((th) => { const R = r(th), q = inner ? inner(th) : 0; return 0.5 * (R * R - q * q); }, a, b, n);
}

/** Signed area of a closed polygon (counter-clockwise positive). */
export function shoelace(pts) {
  let s = 0;
  for (let i = 0; i < pts.length; i++) {
    const [x0, y0] = pts[i], [x1, y1] = pts[(i + 1) % pts.length];
    s += x0 * y1 - x1 * y0;
  }
  return s / 2;
}

/**
 * Area between a parametric curve and the x-axis, |∫ y dx| = |∫ y(t) x′(t) dt|:
 * the polygon of the curve closed along the axis, where y = 0 adds nothing.
 */
export function paramAreaToAxis(fx, fy, a, b, n = 4000) {
  const pts = sampleParam(fx, fy, a, b, n).map(([x, y]) => [x, y]);
  pts.push([fx(b), 0], [fx(a), 0]);
  return Math.abs(shoelace(pts));
}

/** Area swept by the segment from the origin to a parametric curve: |½∫(x y′ − y x′) dt|. */
export function paramAreaFromPole(fx, fy, a, b, n = 4000) {
  const pts = sampleParam(fx, fy, a, b, n).map(([x, y]) => [x, y]);
  return Math.abs(shoelace([[0, 0], ...pts]));
}

/**
 * n circular wedges approximating ½∫r²dθ on [α, β]: wedge k spans
 * [θ_k, θ_{k+1}] with the radius taken at its left end, midpoint or right end.
 */
export function wedges(r, a, b, n, rule = 'mid') {
  const h = (b - a) / n, list = [];
  let sum = 0;
  for (let k = 0; k < n; k++) {
    const t0 = a + k * h, t1 = t0 + h;
    const ts = rule === 'left' ? t0 : rule === 'right' ? t1 : t0 + h / 2;
    const R = r(ts);
    list.push({ t0, t1, r: R });
    if (Number.isFinite(R)) sum += 0.5 * R * R * h;
  }
  return { list, sum };
}

// ─── conic sections with a focus at the pole ──────────────────────────────

const EPS = 1e-9;

/** circle, ellipse, parabola or hyperbola, by eccentricity. */
export function conicType(e) {
  if (Math.abs(e) < EPS) return 'circle';
  if (Math.abs(e - 1) < EPS) return 'parabola';
  return e < 1 ? 'ellipse' : 'hyperbola';
}

/**
 * The conic r = p / (1 + e cos θ): focus at the pole, perihelion on the +x
 * axis, directrix the vertical line x = p/e. Returns its closest distance q,
 * farthest distance Q (∞ unless e < 1), semi-major axis a (negative for a
 * hyperbola, ∞ for a parabola), semi-minor axis b, centre-to-focus distance c,
 * the directrix and, for e ≥ 1, the asymptotic angle θ∞ with cos θ∞ = −1/e.
 */
export function conic(e, p) {
  const type = conicType(e);
  const q = p / (1 + e);
  const Q = e < 1 - EPS ? p / (1 - e) : Infinity;
  const a = type === 'parabola' ? Infinity : p / (1 - e * e);
  const b = e < 1 - EPS ? p / Math.sqrt(1 - e * e) : type === 'hyperbola' ? p / Math.sqrt(e * e - 1) : Infinity;
  const c = Number.isFinite(a) ? Math.abs(a) * e : Infinity;
  const directrix = e > EPS ? p / e : Infinity;
  const thetaInf = e >= 1 - EPS ? Math.acos(Math.max(-1, -1 / e)) : Math.PI;
  return { e, p, type, q, Q, a, b, c, directrix, thetaInf };
}

/** The range of θ over which r = p/(1 + e cos θ) is finite and positive (the branch round the focus). */
export function conicRange(e, margin = 1e-3) {
  if (e < 1 - EPS) return [-Math.PI, Math.PI];
  const th = Math.acos(Math.max(-1, -1 / e));
  return [-th + margin, th - margin];
}

/** e and p of the ellipse with closest distance q and farthest distance Q from its focus. */
export function fromApsides(q, Q) {
  return { e: (Q - q) / (Q + q), p: (2 * q * Q) / (q + Q), a: (q + Q) / 2 };
}

// ─── Kepler's equation ─────────────────────────────────────────────────────

/** Solve Kepler's equation M = E − e sin E for the eccentric anomaly E (0 ≤ e < 1). */
export function eccentricAnomaly(M, e) {
  // Newton's method from E = π (which converges for every M in [0, 2π] and
  // e < 1), or from E = M for a nearly circular orbit
  let E = e < 0.8 ? M : Math.PI;
  for (let i = 0; i < 60; i++) {
    const step = (E - e * Math.sin(E) - M) / (1 - e * Math.cos(E));
    E -= step;
    if (Math.abs(step) < 1e-14) break;
  }
  return E;
}

/**
 * Where a body on the ellipse r = p/(1 + e cos θ) is, a fraction `frac` of a
 * period after perihelion: eccentric anomaly E, true anomaly θ (unwrapped, so
 * it runs from 0 to 2π over one period), distance r and position.
 */
export function keplerAt(e, p, frac) {
  const turns = Math.floor(frac), f = frac - turns;
  const M = TAU * f;
  const E = eccentricAnomaly(M, e);
  const theta = 2 * Math.atan2(Math.sqrt(1 + e) * Math.sin(E / 2), Math.sqrt(1 - e) * Math.cos(E / 2)) + TAU * turns;
  const a = p / (1 - e * e);
  const r = a * (1 - e * Math.cos(E));
  return { M, E, theta, r, x: r * Math.cos(theta), y: r * Math.sin(theta) };
}

/**
 * Kepler's second law, drawn: the angles bounding n sectors swept in equal
 * times (each 1/n of a period, starting at perihelion). Each has area πab/n.
 */
export function equalTimeSectors(e, p, n) {
  const out = [];
  let prev = keplerAt(e, p, 0).theta;
  for (let k = 1; k <= n; k++) {
    const th = k === n ? TAU : keplerAt(e, p, k / n).theta;
    out.push({ t0: prev, t1: th });
    prev = th;
  }
  return out;
}
