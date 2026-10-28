// Helpers for the Scientific Programming lessons P4–P8 (plotting, SymPy,
// floating point, numerical derivatives and integrals).
//
// 1. Pictures for the `graph` simulation built from straight segments:
//    polylines (what Matplotlib's plot() draws), error bars and bars.
// 2. The double-precision facts the lessons print — spacing of floats,
//    finite-difference errors, quadrature rules — computed here in
//    JavaScript's numbers, which are the same IEEE 754 binary64 floats as
//    Python's, rounded the same way for + − × ÷ and sqrt.

export const lg = Math.log10;

// ── pictures ────────────────────────────────────────────────────────────
// a number spliced into a graph expression (no "-0", no ugly 17-digit tails)
const n = (v) => String(+(+v).toPrecision(12));

/** A straight segment from (x0, y0) to (x1, y1), as a parametric graph curve. */
export const seg = (x0, y0, x1, y1, o = {}) => ({ param: [`${n(x0)} + (${n(x1 - x0)})*t`, `${n(y0)} + (${n(y1 - y0)})*t`], t: [0, 1], width: 2, ...o });

/** Straight lines joining the points in the order given — what ax.plot(x, y) draws. */
export const polyline = (pts, o = {}) => pts.slice(1).map((p, i) => seg(pts[i][0], pts[i][1], p[0], p[1], o));

/** A vertical error bar of half-length s, with caps of half-width cap. */
export const errbar = (x, y, s, cap, o = {}) => [seg(x, y - s, x, y + s, { width: 1.4, ...o }), seg(x - cap, y + s, x + cap, y + s, { width: 1.4, ...o }), seg(x - cap, y - s, x + cap, y - s, { width: 1.4, ...o })];

/** A bar from x0 to x1 rising from `base` to height h (a graph shade). */
export const bar = (x0, x1, h, o = {}) => ({ fn: n(h), lower: n(o.base ?? 0), from: x0, to: x1, color: o.color || 'accent', alpha: o.alpha ?? 0.45 });

/** A seeded generator of standard normal numbers (mulberry32 + Box–Muller), for synthetic data. */
export function normals(seed) {
  let a = seed >>> 0;
  const u = () => { a = (a + 0x6d2b79f5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  return () => Math.sqrt(-2 * Math.log(1 - u())) * Math.cos(2 * Math.PI * u());
}

// ── floating point ──────────────────────────────────────────────────────
/** The gap from |x| to the next larger binary64 float (math.ulp(x) in Python). */
export function ulp(x) {
  const d = new DataView(new ArrayBuffer(8));
  d.setFloat64(0, Math.abs(x));
  const e = (d.getUint16(0) >> 4) & 0x7ff;
  return e === 0 ? 2 ** -1074 : 2 ** (e - 1075);
}
/** The same for float32 (np.spacing(np.float32(x))). */
export function ulp32(x) {
  const d = new DataView(new ArrayBuffer(4));
  d.setFloat32(0, Math.abs(x));
  const e = (d.getUint32(0) >>> 23) & 0xff;
  return e === 0 ? 2 ** -149 : 2 ** (e - 150);
}
export const EPS = 2 ** -52;           // binary64 machine epsilon
export const EPS32 = 2 ** -23;         // binary32

// ── numerical derivatives and integrals ─────────────────────────────────
export const forward = (f, x, h) => (f(x + h) - f(x)) / h;
export const central = (f, x, h) => (f(x + h) - f(x - h)) / (2 * h);

/** Composite trapezoid and Simpson rules with n subintervals, written as the lessons' Python writes them. */
export function trap(f, a, b, nn) {
  const h = (b - a) / nn;
  let s = 0.5 * (f(a) + f(b));
  for (let k = 1; k < nn; k++) s += f(a + k * h);
  return h * s;
}
export function simpson(f, a, b, nn) {
  const h = (b - a) / nn;
  let s = f(a) + f(b);
  for (let k = 1; k < nn; k++) s += (k % 2 ? 4 : 2) * f(a + k * h);
  return (h / 3) * s;
}
/** Trapezoid rule on samples ys spaced h apart. */
export const trapData = (ys, h) => h * (ys.reduce((s, y) => s + y, 0) - 0.5 * (ys[0] + ys[ys.length - 1]));
/** Simpson's rule on an odd number of samples spaced h apart. */
export const simpsonData = (ys, h) => (h / 3) * ys.reduce((s, y, k) => s + (k === 0 || k === ys.length - 1 ? 1 : k % 2 ? 4 : 2) * y, 0);

/** Gauss–Legendre on many panels: a reference value for smooth integrands. */
export function gaussRef(f, a, b, panels = 200) {
  const X = [-0.9061798459386640, -0.5384693101056831, 0, 0.5384693101056831, 0.9061798459386640];
  const W = [0.2369268850561891, 0.4786286704993665, 0.5688888888888889, 0.4786286704993665, 0.2369268850561891];
  const h = (b - a) / panels;
  let s = 0;
  for (let p = 0; p < panels; p++) { const c = a + (p + 0.5) * h; for (let i = 0; i < 5; i++) s += W[i] * f(c + (h / 2) * X[i]); }
  return (s * h) / 2;
}

/** The complete elliptic integral of the first kind K(m), parameter m = k² (SciPy's ellipk), by the AGM. */
export function ellipK(m) {
  let a = 1, g = Math.sqrt(1 - m);
  for (let i = 0; i < 40 && Math.abs(a - g) > 1e-16 * a; i++) [a, g] = [(a + g) / 2, Math.sqrt(a * g)];
  return Math.PI / (2 * a);
}
