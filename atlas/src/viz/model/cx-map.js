// Complex functions as maps of the plane — the model behind the cx-map
// simulation, DOM-free and tested headlessly (test/cx-map.test.mjs).
//
// Complex numbers are [re, im] pairs. The catalogue FNS holds every function
// the simulation can draw: its value, its derivative where it has one (null
// where it is not complex-differentiable), and — for the multivalued ones
// (log, √, complex powers) — a value on any branch, chosen by a continuous
// argument θ of z, so a point dragged round the origin can be followed off
// the principal branch. Also here: the Jacobian of (u, v) by central
// differences (what a non-analytic map does to a small circle), the
// "enhanced phase portrait" colour of a value w (a cyclic, roughly
// perceptually even hue for arg w; brightness bands for |w| and arg w), and
// the spinor map from SL(2, C) to Lorentz transformations, with
// stereographic coordinates on the celestial sphere — PSL(2, C) ≅ SO⁺(1, 3).

import { fn as compileExpr } from './exprfn.js';

const TAU = 2 * Math.PI;

// ── arithmetic ──
export const C = (re, im = 0) => [re, im];
export const add = (a, b) => [a[0] + b[0], a[1] + b[1]];
export const sub = (a, b) => [a[0] - b[0], a[1] - b[1]];
export const mul = (a, b) => [a[0] * b[0] - a[1] * b[1], a[0] * b[1] + a[1] * b[0]];
export const scale = (a, s) => [a[0] * s, a[1] * s];
export const conj = (a) => [a[0], -a[1]];
export const abs = (a) => Math.hypot(a[0], a[1]);
export const arg = (a) => Math.atan2(a[1], a[0]);
export function div(a, b) {
  const d = b[0] * b[0] + b[1] * b[1];
  return [(a[0] * b[0] + a[1] * b[1]) / d, (a[1] * b[0] - a[0] * b[1]) / d];
}
export const polar = (r, th) => [r * Math.cos(th), r * Math.sin(th)];
export const exp = (a) => polar(Math.exp(a[0]), a[1]);
/** log with a chosen argument θ (θ = arg z gives the principal value Log z). */
export const logAt = (z, th = arg(z)) => [Math.log(abs(z)), th];
export const log = (z) => logAt(z);
/** z^p for complex p, on the branch whose argument of z is θ: e^{p(ln|z| + iθ)}. */
export const powAt = (z, p, th = arg(z)) => (abs(z) === 0 ? (p[0] > 0 ? [0, 0] : [NaN, NaN]) : exp(mul(p, logAt(z, th))));
export const sqrtAt = (z, th = arg(z)) => polar(Math.sqrt(abs(z)), th / 2);
export const sin = (a) => [Math.sin(a[0]) * Math.cosh(a[1]), Math.cos(a[0]) * Math.sinh(a[1])];
export const cos = (a) => [Math.cos(a[0]) * Math.cosh(a[1]), -Math.sin(a[0]) * Math.sinh(a[1])];
export const near = (a, b, tol = 1e-9) => abs(sub(a, b)) <= tol * Math.max(1, abs(b));

/** The argument of z closest to θprev: follows arg z continuously along a path (the step must not jump round the origin). */
export function contArg(thPrev, z) {
  const a = arg(z);
  return a + TAU * Math.round((thPrev - a) / TAU);
}
/** How many whole turns a continuous argument θ is off the principal one: the branch number k. */
export const branchOf = (z, th) => Math.round((th - arg(z)) / TAU);

// ── the catalogue ──
// f(z, o, th): o holds the evaluated parameters ({ a, b, c, d } for Möbius, p for a power, u and v
// for a map given by its real parts), th an argument of z (used only by the multivalued ones).
// df(z, o, th, w): the derivative, or null where there is none. cut: the principal branch's cut.
export const FNS = {
  id: { label: 'z', f: (z) => z, df: () => [1, 0] },
  z2: { label: 'z²', f: (z) => mul(z, z), df: (z) => scale(z, 2) },
  z3: { label: 'z³', f: (z) => mul(z, mul(z, z)), df: (z) => scale(mul(z, z), 3) },
  inv: { label: '1/z', f: (z) => div([1, 0], z), df: (z) => scale(div([1, 0], mul(z, z)), -1) },
  exp: { label: 'eᶻ', f: exp, df: exp },
  log: { label: 'log z', f: (z, o, th) => logAt(z, th), df: (z) => div([1, 0], z), multi: true, cut: 'negreal' },
  sqrt: { label: '√z', f: (z, o, th) => sqrtAt(z, th), df: (z, o, th, w) => div([1, 0], scale(w, 2)), multi: true, cut: 'negreal' },
  pow: { label: 'zᶜ', f: (z, o, th) => powAt(z, o.p, th), df: (z, o, th, w) => div(mul(o.p, w), z), multi: true, cut: 'negreal' },
  mobius: { label: '(az + b)/(cz + d)', f: (z, o) => div(add(mul(o.a, z), o.b), add(mul(o.c, z), o.d)), df: (z, o) => div(sub(mul(o.a, o.d), mul(o.b, o.c)), mul(add(mul(o.c, z), o.d), add(mul(o.c, z), o.d))) },
  joukowski: { label: 'z + 1/z', f: (z) => add(z, div([1, 0], z)), df: (z) => sub([1, 0], div([1, 0], mul(z, z))) },
  sin: { label: 'sin z', f: sin, df: cos },
  cos: { label: 'cos z', f: cos, df: (z) => scale(sin(z), -1) },
  conj: { label: 'z̄', f: conj, df: null },
  uv: { label: 'u + iv', f: (z, o) => [o.u(z[0], z[1]), o.v(z[0], z[1])], df: 'cr' },
};

/** A power p is "integer" when z^p is single-valued. */
export const isIntegerPower = (p) => Math.abs(p[1]) < 1e-12 && Math.abs(p[0] - Math.round(p[0])) < 1e-12;
/** Is this function multivalued with the given parameters (so it needs a branch cut)? */
export const multivalued = (key, o = {}) => !!FNS[key]?.multi && !(key === 'pow' && isIntegerPower(o.p));

/** u + iv from expressions of x and y (Atlas syntax), compiled once. */
export function uvFrom(u, v, consts = {}) {
  const vars = ['x', 'y', ...Object.keys(consts)];
  const U = compileExpr(u, vars), V = compileExpr(v, vars);
  return { u: (x, y) => U({ ...consts, x, y }), v: (x, y) => V({ ...consts, x, y }) };
}

/** The value of f at z (principal branch unless θ is given). */
export function value(key, z, o = {}, th) {
  const F = FNS[key];
  return F.f(z, o, th ?? arg(z));
}

/** The Jacobian [[u_x, u_y], [v_x, v_y]] of the real map (x, y) ↦ (u, v), by central differences. */
export function jacobian(key, z, o = {}, th) {
  const h = 1e-5 * Math.max(1, abs(z));
  const t0 = th ?? arg(z);
  const at = (dz) => value(key, add(z, dz), o, contArg(t0, add(z, dz)));
  const fx = scale(sub(at([h, 0]), at([-h, 0])), 1 / (2 * h));
  const fy = scale(sub(at([0, h]), at([0, -h])), 1 / (2 * h));
  return [[fx[0], fy[0]], [fx[1], fy[1]]];
}

/** How far the Cauchy–Riemann equations fail: u_x − v_y and u_y + v_x (both zero where f is complex-differentiable). */
export function crResidual(J) { return [J[0][0] - J[1][1], J[0][1] + J[1][0]]; }

/**
 * The complex derivative f′(z), or null where f is not complex-differentiable.
 * A map given by u and v gets its derivative from the Jacobian when Cauchy–Riemann holds there.
 */
export function derivative(key, z, o = {}, th) {
  const F = FNS[key];
  if (!F.df) return null;
  if (F.df === 'cr') {
    const J = jacobian(key, z, o, th), [r1, r2] = crResidual(J);
    const size = Math.max(1e-9, Math.hypot(...J.flat()));
    return Math.hypot(r1, r2) <= 1e-5 * size + 1e-7 ? [J[0][0], J[1][0]] : null;
  }
  const t0 = th ?? arg(z);
  return F.df(z, o, t0, value(key, z, o, t0));
}

/** The amplitwist of f at z: the amplification |f′| and the twist arg f′ (radians), or null. */
export function amplitwist(key, z, o = {}, th) {
  const d = derivative(key, z, o, th);
  if (!d || !Number.isFinite(d[0]) || !Number.isFinite(d[1])) return null;
  return { amp: abs(d), twist: arg(d), d };
}

/** The Möbius coefficients' determinant ad − bc (zero means the map is constant). */
export const mobiusDet = (o) => sub(mul(o.a, o.d), mul(o.b, o.c));

// ── sampling curves and their images ──
/**
 * Sample a curve t ↦ z(t) and map it, following the argument continuously
 * along the curve when `follow` is set (otherwise the principal branch, so the
 * image breaks where the curve crosses the cut). Returns { z: [[x, y]…], w: [[u, v]…] };
 * a NaN entry marks a gap (a pole, or a jump bigger than `jump` in the image).
 */
export function mapCurve(key, o, zt, t0, t1, n = 240, { follow = false, th0, jump = Infinity } = {}) {
  const zs = [], ws = [];
  let th = th0, prev = null;
  for (let i = 0; i <= n; i++) {
    const z = zt(t0 + ((t1 - t0) * i) / n);
    th = follow ? (th === undefined ? arg(z) : contArg(th, z)) : arg(z);
    const w = value(key, z, o, th);
    const ok = Number.isFinite(w[0]) && Number.isFinite(w[1]);
    if (ok && prev && abs(sub(w, prev)) > jump) { zs.push([NaN, NaN]); ws.push([NaN, NaN]); }
    zs.push(z); ws.push(ok ? w : [NaN, NaN]);
    prev = ok ? w : null;
  }
  return { z: zs, w: ws };
}

// ── colour: the enhanced phase portrait ──
const srgb = (x) => (x <= 0.0031308 ? 12.92 * x : 1.055 * Math.pow(x, 1 / 2.4) - 0.055);
/** OKLab (L, a, b) → sRGB components in [0, 1] (clamped). */
export function oklabToRGB(L, a, b) {
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s = (L - 0.0894841775 * a - 1.2914855480 * b) ** 3;
  const R = 4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s;
  const G = -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s;
  const B = -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s;
  return [R, G, B].map((x) => Math.min(1, Math.max(0, srgb(Math.min(1, Math.max(0, x))))));
}
export const HUE0 = (29 * Math.PI) / 180;    // OKLab's hue of red: arg w = 0 is drawn red
/**
 * The colour of a value w: hue from arg w on a circle of constant lightness and chroma in OKLab
 * (positive reals red, positive imaginaries yellow-green, negative reals blue, negative imaginaries
 * violet); brightness steps up within each doubling of |w| (edges where |w| = 2ᵏ) and within each
 * twelfth of a turn of arg w (edges every 30°). Returns [r, g, b] in 0–255.
 */
export function phaseColor(w, { bands = true, sectors = 12 } = {}) {
  const r = abs(w);
  if (!Number.isFinite(r)) return r === Infinity ? [250, 250, 250] : [128, 128, 128];
  if (r === 0) return [10, 10, 10];
  const th = arg(w);
  let L = 0.74;
  if (bands) {
    const s1 = Math.log2(r) - Math.floor(Math.log2(r));
    const s2 = ((th / TAU) * sectors) % 1;
    L *= (0.72 + 0.28 * s1) * (0.86 + 0.14 * (s2 < 0 ? s2 + 1 : s2));
  }
  const Ch = 0.125 * (L / 0.74);
  return oklabToRGB(L, Ch * Math.cos(th + HUE0), Ch * Math.sin(th + HUE0)).map((x) => Math.round(255 * x));
}

// ── the celestial sphere: SL(2, C) → SO⁺(1, 3) ──
// A 2×2 complex matrix is [[a, b], [c, d]] with complex entries.
const m2mul = (A, B) => [[add(mul(A[0][0], B[0][0]), mul(A[0][1], B[1][0])), add(mul(A[0][0], B[0][1]), mul(A[0][1], B[1][1]))],
  [add(mul(A[1][0], B[0][0]), mul(A[1][1], B[1][0])), add(mul(A[1][0], B[0][1]), mul(A[1][1], B[1][1]))]];
const m2dag = (A) => [[conj(A[0][0]), conj(A[1][0])], [conj(A[0][1]), conj(A[1][1])]];
const PAULI = [
  [[[1, 0], [0, 0]], [[0, 0], [1, 0]]],     // σ₀ = I
  [[[0, 0], [1, 0]], [[1, 0], [0, 0]]],     // σx
  [[[0, 0], [0, -1]], [[0, 1], [0, 0]]],    // σy
  [[[1, 0], [0, 0]], [[0, 0], [-1, 0]]],    // σz
];
export const det2 = (A) => sub(mul(A[0][0], A[1][1]), mul(A[0][1], A[1][0]));
/** The Hermitian matrix X = tI + xσx + yσy + zσz of an event (t, x, y, z); det X = t² − x² − y² − z². */
export const hermitianOf = (x) => [[[x[0] + x[3], 0], [x[1], -x[2]]], [[x[1], x[2]], [x[0] - x[3], 0]]];
/** The four-vector of a Hermitian X: x^μ = ½ tr(σ_μ X). */
export const vectorOf = (X) => PAULI.map((s) => 0.5 * add(add(mul(s[0][0], X[0][0]), mul(s[0][1], X[1][0])), add(mul(s[1][0], X[0][1]), mul(s[1][1], X[1][1])))[0]);
/** The Lorentz matrix Λ^μ_ν of A ∈ SL(2, C), from X ↦ A X A†. */
export function lorentzOf(A) {
  const Ad = m2dag(A);
  const cols = [0, 1, 2, 3].map((nu) => { const e = [0, 0, 0, 0]; e[nu] = 1; return vectorOf(m2mul(m2mul(A, hermitianOf(e)), Ad)); });
  return [0, 1, 2, 3].map((mu) => cols.map((col) => col[mu]));
}
/** Stereographic coordinate of the direction (θ from the +z axis, azimuth φ): ζ = tan(θ/2) e^{iφ}. */
export const stereo = (th, ph) => polar(Math.tan(th / 2), ph);
/** The direction (θ, φ) of a stereographic coordinate ζ. */
export const unstereo = (z) => [2 * Math.atan(abs(z)), arg(z)];
/** How A acts on ζ: the null direction ψψ† with ψ = (1, ζ) goes to Aψ, so ζ ↦ (c + dζ)/(a + bζ). */
export const actOnSky = (A, z) => div(add(A[1][0], mul(A[1][1], z)), add(A[0][0], mul(A[0][1], z)));
/** Aberration: the angle from the direction of motion at which a star at θ (rest frame) is seen at speed β. */
export const aberrate = (th, beta) => Math.acos((Math.cos(th) + beta) / (1 + beta * Math.cos(th)));
