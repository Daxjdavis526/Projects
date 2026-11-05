// Numerical integration. Adaptive Gauss–Kronrod (7-point Gauss inside 15-point
// Kronrod) with a global error estimate, infinite limits by substitution, and
// honest reporting: every result says it is numerical and how sure it is.

export interface QuadResult {
  value: number;
  error: number;          // estimated absolute error
  evals: number;
  ok: boolean;            // reached the requested tolerance
  warning?: string;       // e.g. "the integrand is not finite near x = 0" or "may diverge"
}

const XK = [0.991455371120812639, 0.949107912342758525, 0.864864423359769073, 0.741531185599394440,
  0.586087235467691130, 0.405845151377397167, 0.207784955007898468, 0];
const WK = [0.022935322010529225, 0.063092092629978553, 0.104790010322250184, 0.140653259715525919,
  0.169004726639267903, 0.190350578064785410, 0.204432940075298892, 0.209482141084727828];
const WG = [0.129484966168869693, 0.279705391489276668, 0.381830050505118945, 0.417959183673469388];

function gk15(f: (x: number) => number, a: number, b: number): { k: number; err: number; bad: boolean } {
  const c = (a + b) / 2, h = (b - a) / 2;
  const fc = f(c);
  let k = fc * WK[7], g = fc * WG[3], bad = !Number.isFinite(fc);
  for (let j = 0; j < 7; j++) {
    const dx = h * XK[j];
    const f1 = f(c - dx), f2 = f(c + dx);
    if (!Number.isFinite(f1) || !Number.isFinite(f2)) bad = true;
    k += WK[j] * (f1 + f2);
    if (j % 2 === 1) g += WG[(j - 1) / 2] * (f1 + f2);
  }
  return { k: k * h, err: Math.abs((k - g) * h), bad };
}

/**
 * ∫_a^b f(x) dx. Limits may be ±Infinity. tol is relative (with an absolute floor).
 */
export function integrate(f: (x: number) => number, a: number, b: number, tol = 1e-10, maxEvals = 200000): QuadResult {
  if (a === b) return { value: 0, error: 0, evals: 0, ok: true };
  if (a > b) { const r = integrate(f, b, a, tol, maxEvals); return { ...r, value: -r.value }; }
  // infinite limits: x = t/(1−t²) maps (−1, 1) onto the real line
  if (!Number.isFinite(a) || !Number.isFinite(b)) {
    let g: (t: number) => number, lo: number, hi: number;
    if (!Number.isFinite(a) && !Number.isFinite(b)) { g = (t) => { const d = 1 - t * t; return f(t / d) * (1 + t * t) / (d * d); }; lo = -1; hi = 1; }
    else if (!Number.isFinite(b)) { g = (t) => { const d = 1 - t; return f(a + t / d) / (d * d); }; lo = 0; hi = 1; }
    else { g = (t) => { const d = 1 + t; return f(b + t / d) / (d * d); }; lo = -1; hi = 0; }
    const r = integrate((t) => (t <= lo || t >= hi ? 0 : g(t)), lo, hi, tol, maxEvals);
    if (r.ok && Math.abs(r.value) > 1e15) r.warning = 'The integral appears to diverge';
    return r;
  }
  type Seg = { a: number; b: number; k: number; err: number; bad: boolean };
  const segs: Seg[] = [];
  let evals = 0;
  const push = (lo: number, hi: number) => { const r = gk15(f, lo, hi); evals += 15; segs.push({ a: lo, b: hi, ...r }); };
  push(a, b);
  let total = segs[0].k, err = segs[0].err;
  let badAt: number | null = null;
  while (evals < maxEvals) {
    total = 0; err = 0;
    for (const s of segs) { total += s.k; err += s.err; }
    if (err <= Math.max(tol * Math.abs(total), 1e-14)) break;
    // split the segment with the largest error
    let worst = 0;
    for (let i = 1; i < segs.length; i++) if (segs[i].err > segs[worst].err) worst = i;
    const s = segs[worst];
    if (s.b - s.a < 1e-12 * Math.max(1, Math.abs(s.a))) { if (s.bad) badAt = (s.a + s.b) / 2; break; }
    segs.splice(worst, 1);
    const m = (s.a + s.b) / 2;
    push(s.a, m); push(m, s.b);
  }
  total = 0; err = 0;
  for (const s of segs) { total += s.k; err += s.err; if (s.bad && badAt === null) badAt = (s.a + s.b) / 2; }
  const ok = Number.isFinite(total) && err <= Math.max(tol * Math.abs(total), 1e-14) * 10;
  const res: QuadResult = { value: total, error: err, evals, ok };
  if (badAt !== null) res.warning = `The integrand is not finite near x = ${+badAt.toPrecision(4)}`;
  else if (!ok) res.warning = Number.isFinite(total) ? 'Could not reach full accuracy — the integral may diverge or oscillate too fast' : 'The integral does not have a finite value';
  return res;
}

/** Riemann and trapezoid/Simpson sums, for teaching (n subintervals). */
export function riemann(f: (x: number) => number, a: number, b: number, n: number, rule: 'left' | 'right' | 'mid' | 'trap' | 'simpson'): number {
  const h = (b - a) / n;
  let s = 0;
  if (rule === 'simpson') {
    const m = n % 2 ? n + 1 : n, hh = (b - a) / m;
    s = f(a) + f(b);
    for (let i = 1; i < m; i++) s += (i % 2 ? 4 : 2) * f(a + i * hh);
    return (s * hh) / 3;
  }
  for (let i = 0; i < n; i++) {
    const x0 = a + i * h;
    s += rule === 'left' ? f(x0) : rule === 'right' ? f(x0 + h) : rule === 'mid' ? f(x0 + h / 2) : (f(x0) + f(x0 + h)) / 2;
  }
  return s * h;
}

/** ∫∫ f over [ax,bx]×[ay(x),by(x)] by nested adaptive quadrature. */
export function integrate2(f: (x: number, y: number) => number, ax: number, bx: number, ay: (x: number) => number, by: (x: number) => number, tol = 1e-8): QuadResult {
  let warn: string | undefined;
  const r = integrate((x) => {
    const inner = integrate((y) => f(x, y), ay(x), by(x), tol, 20000);
    if (inner.warning && !warn) warn = inner.warning;
    return inner.value;
  }, ax, bx, tol, 20000);
  return { ...r, warning: r.warning ?? warn };
}
