// Vector calculus, DOM-free: line integrals along parametrized curves (work,
// flux across a plane curve, scalar ∫ f ds), surface integrals over
// parametrized surfaces (area, flux, the flux of the curl), numerical
// divergence and curl, volume integrals over balls, boxes and cylinders, and
// regions cut into cells whose boundary integrals telescope (Green's
// theorem, the divergence theorem in the plane, and the fundamental theorem
// of calculus on an interval). Used by the c3-lineint, c3-cells and c3-flux
// simulations; tested headlessly in test/c3-vector.test.mjs.
//
// Quadrature is composite Gauss–Legendre (5 points per panel): its nodes lie
// strictly inside each panel, so an integrand may blow up at an endpoint — the
// vortex field at the centre of a disk — without poisoning the sum. It is
// symmetric, so an edge walked backwards uses the same points as forwards
// and two cells sharing an edge cancel there to rounding.

const GX = [-0.9061798459386640, -0.5384693101056831, 0, 0.5384693101056831, 0.9061798459386640];
const GW = [0.2369268850561891, 0.4786286704993665, 0.5688888888888889, 0.4786286704993665, 0.2369268850561891];

/** ∫ₐᵇ f by composite 5-point Gauss–Legendre over `panels` equal panels (reversed limits change the sign). */
export function gauss(f, a, b, panels = 32) {
  if (a === b) return 0;
  const h = (b - a) / panels;
  let s = 0;
  for (let k = 0; k < panels; k++) {
    const m = a + (k + 0.5) * h;
    for (let i = 0; i < 5; i++) s += GW[i] * f(m + 0.5 * h * GX[i]);
  }
  return 0.5 * h * s;
}

/** ∬ g(u, v) over [u0, u1] × [v0, v1], Gauss–Legendre in both directions. */
export function gauss2(g, [u0, u1], [v0, v1], pu = 16, pv = 16) {
  return gauss((u) => gauss((v) => g(u, v), v0, v1, pv), u0, u1, pu);
}

/** The nodes and weights gauss() uses, as arrays, for callers that cache values. */
export function nodes(a, b, panels = 32) {
  const h = (b - a) / panels, x = [], w = [];
  for (let k = 0; k < panels; k++) {
    const m = a + (k + 0.5) * h;
    for (let i = 0; i < 5; i++) { x.push(m + 0.5 * h * GX[i]); w.push(0.5 * h * GW[i]); }
  }
  return { x, w };
}

/** Central difference of a scalar function of one variable. */
export const d1 = (f, t, h = 1e-5) => (f(t + h) - f(t - h)) / (2 * h);

// ─── curves in the plane ───────────────────────────────────────────────────
// A curve is { X(t), Y(t) } (and Z(t) in space) over [a, b]; F(x, y) returns [P, Q].

/** The velocity r′(t) of a plane or space curve, by central differences scaled to the parameter range. */
export function velocity(c, t, span = 1) {
  const h = 1e-6 * Math.max(1, Math.abs(span));
  const v = [d1(c.X, t, h), d1(c.Y, t, h)];
  if (c.Z) v.push(d1(c.Z, t, h));
  return v;
}

/** F(r(t)) · r′(t): the integrand of the work integral ∫ F · dr. */
export function workIntegrand(F, c, t, span = 1) {
  const r = c.Z ? [c.X(t), c.Y(t), c.Z(t)] : [c.X(t), c.Y(t)];
  const v = velocity(c, t, span), f = F(...r);
  return f.reduce((s, x, k) => s + x * v[k], 0);
}

/** F(r(t)) · n |r′(t)| = P y′ − Q x′: the integrand of the flux across a plane curve, n pointing to the right of travel. */
export function fluxIntegrand(F, c, t, span = 1) {
  const [vx, vy] = velocity(c, t, span), [p, q] = F(c.X(t), c.Y(t));
  return p * vy - q * vx;
}

/** f(r(t)) |r′(t)|: the integrand of a scalar line integral ∫ f ds. */
export function scalarIntegrand(f, c, t, span = 1) {
  const v = velocity(c, t, span);
  const r = c.Z ? [c.X(t), c.Y(t), c.Z(t)] : [c.X(t), c.Y(t)];
  return f(...r) * Math.hypot(...v);
}

/** ∫_C F · dr along c from t = a to t = b. */
export const work = (F, c, a, b, panels = 64) => gauss((t) => workIntegrand(F, c, t, b - a), a, b, panels);
/** ∫_C F · n ds across a plane curve (n to the right of the direction of travel: outward for an anticlockwise loop). */
export const fluxAcross = (F, c, a, b, panels = 64) => gauss((t) => fluxIntegrand(F, c, t, b - a), a, b, panels);
/** ∫_C f ds (independent of direction). */
export const scalarLine = (f, c, a, b, panels = 64) => Math.abs(gauss((t) => scalarIntegrand(f, c, t, b - a), a, b, panels));
/** The length of a curve. */
export const arcLength = (c, a, b, panels = 64) => scalarLine(() => 1, c, a, b, panels);

/**
 * A running integral: samples of the integrand g on [a, b] and its running
 * total from a, on n + 1 evenly spaced points (Gauss–Legendre on each step).
 */
export function running(g, a, b, n = 200) {
  const ts = [], vals = [], cum = [0];
  for (let k = 0; k <= n; k++) { const t = a + ((b - a) * k) / n; ts.push(t); vals.push(g(t)); }
  for (let k = 1; k <= n; k++) cum.push(cum[k - 1] + gauss(g, ts[k - 1], ts[k], 1));
  return { ts, vals, cum };
}

/**
 * Reparametrizations of [0, 1] onto itself, with their derivatives: the same
 * path traversed steadily, speeding up, or slowly at both ends.
 */
export const REPARAM = {
  steady: { phi: (s) => s, dphi: () => 1 },
  faster: { phi: (s) => s * s, dphi: (s) => 2 * s },
  startstop: { phi: (s) => s - Math.sin(2 * Math.PI * s) / (2 * Math.PI), dphi: (s) => 1 - Math.cos(2 * Math.PI * s) },
};

// ─── derivatives of fields ─────────────────────────────────────────────────

/** ∂Q/∂x − ∂P/∂y of a plane field F(x, y) = [P, Q], numerically. */
export function curl2(F, x, y, h = 1e-5) {
  return (F(x + h, y)[1] - F(x - h, y)[1]) / (2 * h) - (F(x, y + h)[0] - F(x, y - h)[0]) / (2 * h);
}
/** ∂P/∂x + ∂Q/∂y of a plane field, numerically. */
export function div2(F, x, y, h = 1e-5) {
  return (F(x + h, y)[0] - F(x - h, y)[0]) / (2 * h) + (F(x, y + h)[1] - F(x, y - h)[1]) / (2 * h);
}
/** ∇ · F of a field in space F(x, y, z) = [P, Q, R], numerically. */
export function div3(F, x, y, z, h = 1e-5) {
  return (F(x + h, y, z)[0] - F(x - h, y, z)[0] + F(x, y + h, z)[1] - F(x, y - h, z)[1] + F(x, y, z + h)[2] - F(x, y, z - h)[2]) / (2 * h);
}
/** ∇ × F of a field in space, numerically. */
export function curl3(F, x, y, z, h = 1e-5) {
  const dx = (k) => (F(x + h, y, z)[k] - F(x - h, y, z)[k]) / (2 * h);
  const dy = (k) => (F(x, y + h, z)[k] - F(x, y - h, z)[k]) / (2 * h);
  const dz = (k) => (F(x, y, z + h)[k] - F(x, y, z - h)[k]) / (2 * h);
  return [dy(2) - dz(1), dz(0) - dx(2), dx(1) - dy(0)];
}

// ─── surfaces ──────────────────────────────────────────────────────────────
// A surface is S(u, v) → [x, y, z] over [u0, u1] × [v0, v1]; its normal is
// r_u × r_v (or the opposite, with flip).

export const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
export const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];

/** The tangent vectors r_u and r_v of a surface at (u, v), by central differences. */
export function tangents(S, u, v, h = 1e-5) {
  const a = S(u + h, v), b = S(u - h, v), c = S(u, v + h), d = S(u, v - h);
  return [[0, 1, 2].map((k) => (a[k] - b[k]) / (2 * h)), [0, 1, 2].map((k) => (c[k] - d[k]) / (2 * h))];
}
/** r_u × r_v at (u, v): the normal whose length is the area-stretching factor. */
export function normal(S, u, v, h = 1e-5) { const [ru, rv] = tangents(S, u, v, h); return cross(ru, rv); }

/** ∬ |r_u × r_v| du dv: the area of a surface. */
export const area = (S, ur, vr, pu = 16, pv = 16) => gauss2((u, v) => Math.hypot(...normal(S, u, v)), ur, vr, pu, pv);
/** ∬_S f dS, a scalar surface integral. */
export const scalarSurface = (f, S, ur, vr, pu = 16, pv = 16) => gauss2((u, v) => f(...S(u, v)) * Math.hypot(...normal(S, u, v)), ur, vr, pu, pv);
/** ∬_S F · dS with dS = (r_u × r_v) du dv (sign −1 flips the orientation). */
export const flux = (F, S, ur, vr, { pu = 16, pv = 16, sign = 1 } = {}) => sign * gauss2((u, v) => dot(F(...S(u, v)), normal(S, u, v)), ur, vr, pu, pv);
/** ∬_S (∇ × F) · dS. */
export const curlFlux = (F, S, ur, vr, o = {}) => flux((x, y, z) => curl3(F, x, y, z), S, ur, vr, o);

// ─── volumes ───────────────────────────────────────────────────────────────

/** ∭ g over the ball |r − c| ≤ R, in spherical coordinates. */
export function ballIntegral(g, [cx, cy, cz], R, p = 12) {
  return gauss((rho) => gauss((phi) => gauss((th) => {
    const s = Math.sin(phi);
    return g(cx + rho * s * Math.cos(th), cy + rho * s * Math.sin(th), cz + rho * Math.cos(phi)) * rho * rho * s;
  }, 0, 2 * Math.PI, p), 0, Math.PI, p), 0, R, p);
}
/** ∭ g over the box [x0, x1] × [y0, y1] × [z0, z1]. */
export function boxIntegral(g, xr, yr, zr, p = 10) {
  return gauss((x) => gauss((y) => gauss((z) => g(x, y, z), zr[0], zr[1], p), yr[0], yr[1], p), xr[0], xr[1], p);
}
/** ∭ g over the cylinder x² + y² ≤ R² (about (cx, cy)), z0 ≤ z ≤ z1, in cylindrical coordinates. */
export function cylinderIntegral(g, [cx, cy], R, [z0, z1], p = 12) {
  return gauss((r) => gauss((th) => gauss((z) => g(cx + r * Math.cos(th), cy + r * Math.sin(th), z) * r, z0, z1, p), 0, 2 * Math.PI, p), 0, R, p);
}

// ─── regions cut into cells ────────────────────────────────────────────────
// A cell is a closed loop of straight or curved edges, walked anticlockwise;
// an edge is { X(t), Y(t) } over t ∈ [0, 1]. Neighbouring cells walk their
// shared edge in opposite directions, so their contributions there cancel.

const seg = (x0, y0, x1, y1) => ({ X: (t) => x0 + (x1 - x0) * t, Y: (t) => y0 + (y1 - y0) * t });
const arc = (cx, cy, r, a0, a1) => ({ X: (t) => cx + r * Math.cos(a0 + (a1 - a0) * t), Y: (t) => cy + r * Math.sin(a0 + (a1 - a0) * t) });

/**
 * The cells of a region:
 *   { kind: 'rect', x: [x0, x1], y: [y0, y1], m, n }           an m × n grid of rectangles
 *   { kind: 'disk', c: [cx, cy], r: R, m, n }                   m rings × n sectors (the centre cells are wedges)
 *   { kind: 'annulus', c: [cx, cy], r: [r0, r1], m, n }         m rings × n sectors
 * Each cell: { edges, centre: [x, y], area, i, j }. The region's boundary: { outer: [edges], inner: [edges] }
 * (the inner boundary of an annulus is walked clockwise, keeping the region on the left).
 */
export function cellsOf(R) {
  const cells = [];
  if (R.kind === 'rect') {
    const [x0, x1] = R.x, [y0, y1] = R.y, m = R.m, n = R.n, hx = (x1 - x0) / m, hy = (y1 - y0) / n;
    for (let i = 0; i < m; i++) for (let j = 0; j < n; j++) {
      const a = x0 + i * hx, b = a + hx, c = y0 + j * hy, d = c + hy;
      cells.push({ i, j, centre: [(a + b) / 2, (c + d) / 2], area: hx * hy, edges: [seg(a, c, b, c), seg(b, c, b, d), seg(b, d, a, d), seg(a, d, a, c)], box: [a, b, c, d] });
    }
    return { cells, boundary: { outer: [seg(x0, y0, x1, y0), seg(x1, y0, x1, y1), seg(x1, y1, x0, y1), seg(x0, y1, x0, y0)], inner: [] } };
  }
  const [cx, cy] = R.c || [0, 0];
  const [r0, r1] = R.kind === 'disk' ? [0, R.r] : R.r;
  const m = R.m, n = R.n, hr = (r1 - r0) / m, ha = (2 * Math.PI) / n;
  for (let i = 0; i < m; i++) for (let j = 0; j < n; j++) {
    const ra = r0 + i * hr, rb = ra + hr, a = j * ha, b = a + ha;
    const edges = [
      seg(cx + ra * Math.cos(a), cy + ra * Math.sin(a), cx + rb * Math.cos(a), cy + rb * Math.sin(a)),
      arc(cx, cy, rb, a, b),
      seg(cx + rb * Math.cos(b), cy + rb * Math.sin(b), cx + ra * Math.cos(b), cy + ra * Math.sin(b)),
    ];
    if (ra > 0) edges.push(arc(cx, cy, ra, b, a));
    const rm = (ra + rb) / 2, am = a + ha / 2;
    // the centroid of an annular sector, so a cell's value per area is compared with the curl at a fair point
    const rc = ra === 0 ? (2 * rb) / 3 : (2 / 3) * ((rb ** 3 - ra ** 3) / (rb ** 2 - ra ** 2));
    const k = Math.sin(ha / 2) / (ha / 2);
    cells.push({ i, j, centre: [cx + rc * k * Math.cos(am), cy + rc * k * Math.sin(am)], mid: [cx + rm * Math.cos(am), cy + rm * Math.sin(am)], area: 0.5 * ha * (rb * rb - ra * ra), edges, polar: [ra, rb, a, b] });
  }
  return {
    cells,
    boundary: { outer: [arc(cx, cy, r1, 0, 2 * Math.PI)], inner: r0 > 0 ? [arc(cx, cy, r0, 2 * Math.PI, 0)] : [] },
  };
}

/** The circulation (mode 'circ') or outward flux (mode 'flux') of F around a loop of edges. */
export function loopValue(F, edges, mode = 'circ', panels = 8) {
  let s = 0;
  for (const e of edges) s += mode === 'flux' ? fluxAcross(F, e, 0, 1, panels) : work(F, e, 0, 1, panels);
  return s;
}

/** ∬ over a region of g(x, y) — the curl or the divergence — summed cell by cell (each cell by Gauss–Legendre). */
export function regionIntegral(g, R, p = 4) {
  const { cells } = cellsOf({ ...R, m: Math.max(R.m, 6), n: Math.max(R.n, R.kind === 'rect' ? 6 : 24) });
  let s = 0;
  for (const c of cells) {
    if (c.box) { const [a, b, cc, d] = c.box; s += gauss2(g, [a, b], [cc, d], p, p); }
    else {
      const [ra, rb, a, b] = c.polar, [cx, cy] = R.c || [0, 0];
      s += gauss2((r, th) => g(cx + r * Math.cos(th), cy + r * Math.sin(th)) * r, [ra, rb], [a, b], p, p);
    }
  }
  return s;
}
