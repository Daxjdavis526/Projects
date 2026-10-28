// Transfer functions H(s) = K / ((s − p₁)(s − p₂)⋯(s − pₙ)), DOM-free, for
// sims/de-poles.js:
//   - the poles from a short list of real poles and conjugate pairs σ ± iω
//     (a pair with ω = 0 is a double real pole, so dragging a pair onto the
//     real axis keeps the order);
//   - the gain K that makes H(0) = 1 (a system that passes a constant input
//     unchanged, as a spring–mass–damper's x/(F/k) or an RC filter does);
//   - the partial-fraction expansion of H, repeated poles included, and from
//     it the impulse response h(t) = L⁻¹{H} and the step response L⁻¹{H/s}
//     exactly, as sums of terms c tᵏ⁻¹e^{qt}/(k − 1)!, one group per pole;
//   - the frequency response H(iω) and the distances |iω − p| it is built from.
// Tested headlessly: node atlas/test/de-poles.test.mjs

// ─── complex numbers as { re, im } ────────────────────────────────────────
const C = (re, im = 0) => ({ re, im });
const add = (a, b) => C(a.re + b.re, a.im + b.im);
const sub = (a, b) => C(a.re - b.re, a.im - b.im);
const mul = (a, b) => C(a.re * b.re - a.im * b.im, a.re * b.im + a.im * b.re);
const scale = (a, k) => C(a.re * k, a.im * k);
function div(a, b) { const d = b.re * b.re + b.im * b.im; return C((a.re * b.re + a.im * b.im) / d, (a.im * b.re - a.re * b.im) / d); }
const cabs = (a) => Math.hypot(a.re, a.im);
function cexp(a) { const m = Math.exp(a.re); return C(m * Math.cos(a.im), m * Math.sin(a.im)); }
function cpow(a, n) { let r = C(1); for (let k = 0; k < n; k++) r = mul(r, a); return r; }

/** The largest order the model handles (two conjugate pairs). */
export const MAX_ORDER = 4;

/**
 * The poles of a pole list: { re } is one real pole; { re, im } with im ≥ 0 is
 * the pair re ± i·im (two poles; with im = 0, a double pole at re).
 * Returns [{ re, im }, …] with the upper pole of each pair first.
 */
export function polesOf(spec) {
  const out = [];
  for (const q of spec) {
    if (q.im === undefined || q.im === null) out.push(C(+q.re, 0));
    else { const w = Math.abs(+q.im); out.push(C(+q.re, w), C(+q.re, -w)); }
  }
  return out;
}

/** The order of a pole list: real poles count once, pairs twice. */
export const orderOf = (spec) => spec.reduce((n, q) => n + (q.im === undefined || q.im === null ? 1 : 2), 0);

/** P(0) = Π(0 − pₖ), real for a set closed under conjugation. */
export function atZero(poles) {
  let p = C(1);
  for (const q of poles) p = mul(p, C(-q.re, -q.im));
  return p.re;
}

/** The gain K that makes H(0) = 1; 1 if a pole sits at (or next to) the origin. */
export function gain(poles) {
  const p0 = atZero(poles);
  return Math.abs(p0) > 1e-9 ? p0 : 1;
}

/** Group coincident poles (within a relative 1e-7) into { q, m } clusters. */
export function clusters(poles) {
  const out = [];
  for (const p of poles) {
    const c = out.find((k) => cabs(sub(k.q, p)) <= 1e-7 * Math.max(1, cabs(p)));
    if (c) { c.q = scale(add(scale(c.q, c.m), p), 1 / (c.m + 1)); c.m++; }
    else out.push({ q: C(p.re, p.im), m: 1 });
  }
  return out;
}

/**
 * The partial-fraction expansion of K / Π(s − pₖ):
 * [{ q, k, c }] meaning c / (s − q)ᵏ, with q and c complex.
 *
 * For a cluster q of multiplicity m, write H = g(s)/(s − q)^m with
 * g = K Π_{others} (s − q_l)^{−m_l}. The coefficient of 1/(s − q)^k is the
 * Taylor coefficient a_{m−k} of g about q. With L = ln g, whose Taylor
 * coefficients are ℓᵣ = −Σ m_l (−1)^{r+1} / (r d_lʳ), d_l = q − q_l, the
 * coefficients of g = e^L follow from a₀ = e^{L(q)} and n aₙ = Σ r ℓᵣ aₙ₋ᵣ.
 */
export function partialFractions(poles, K = gain(poles)) {
  const cl = clusters(poles), out = [];
  cl.forEach((c, j) => {
    const others = cl.filter((_, l) => l !== j).map((o) => ({ d: sub(c.q, o.q), m: o.m }));
    let a0 = C(K);
    for (const o of others) a0 = div(a0, cpow(o.d, o.m));
    const ell = [C(0)];
    for (let r = 1; r < c.m; r++) {
      let s = C(0);
      for (const o of others) s = add(s, scale(div(C(1), cpow(o.d, r)), (-o.m * (r % 2 ? 1 : -1)) / r));
      ell.push(s);
    }
    const a = [a0];
    for (let n = 1; n < c.m; n++) {
      let s = C(0);
      for (let r = 1; r <= n; r++) s = add(s, scale(mul(ell[r], a[n - r]), r));
      a.push(scale(s, 1 / n));
    }
    for (let k = 1; k <= c.m; k++) out.push({ q: c.q, k, c: a[c.m - k] });
  });
  return out;
}

const FACT = [1, 1, 2, 6, 24, 120];

/** Σ c tᵏ⁻¹ e^{qt}/(k − 1)! over the given terms, real part, for t ≥ 0 (0 before). */
export function sumTerms(terms, t) {
  if (t < 0) return 0;
  let s = 0;
  for (const { q, k, c } of terms) s += (mul(c, cexp(scale(q, t))).re * t ** (k - 1)) / FACT[k - 1];
  return s;
}

/** The impulse response h(t) = L⁻¹{K / Π(s − pₖ)} as a function of t. */
export function impulse(poles, K = gain(poles)) {
  const terms = partialFractions(poles, K);
  return (t) => sumTerms(terms, t);
}

/** The unit-step response L⁻¹{H(s)/s}: the impulse response with a pole added at 0. */
export function stepResponse(poles, K = gain(poles)) {
  return impulse([...poles, C(0)], K);
}

/**
 * The response split into one real term per pole group — a real pole, or a
 * conjugate pair taken together (its two complex terms are conjugates, so
 * their sum is twice the real part of the upper one): [{ q, f }] with q the
 * pole (the upper one of a pair) and f(t) its contribution.
 */
export function modeTerms(poles, K = gain(poles), { step = false } = {}) {
  const all = partialFractions(step ? [...poles, C(0)] : poles, K);
  const groups = [];
  for (const term of all) {
    if (term.q.im < -1e-12) continue;                         // folded into its upper partner
    let g = groups.find((x) => cabs(sub(x.q, term.q)) < 1e-9 * Math.max(1, cabs(term.q)));
    if (!g) groups.push((g = { q: term.q, terms: [] }));
    g.terms.push(term);
  }
  return groups.map((g) => {
    const pair = g.q.im > 1e-12;
    return { q: g.q, f: (t) => (pair ? 2 : 1) * sumTerms(g.terms, t) };
  });
}

/** H(iω): { re, im, mag, phase } (phase in radians, in (−π, π]). */
export function freq(poles, K, w) {
  let H = C(K);
  for (const p of poles) H = div(H, C(-p.re, w - p.im));
  return { re: H.re, im: H.im, mag: cabs(H), phase: Math.atan2(H.im, H.re) };
}

/** The phase of H(iω), unwrapped continuously from ω = 0: Σ −arg(iω − pₖ) + arg K. */
export function phaseUnwrapped(poles, K, w) {
  let ph = K < 0 ? Math.PI : 0;
  for (const p of poles) ph -= Math.atan2(w - p.im, -p.re);
  return ph;
}

/** |iω − p|: the distance from the point iω on the imaginary axis to a pole. */
export const dist = (p, w) => Math.hypot(p.re, w - p.im);

/** The largest gain |H(iω)| for 0 ≤ ω ≤ wmax and where it occurs: { w, mag }. */
export function peak(poles, K, wmax) {
  const n = 600, g = (w) => freq(poles, K, w).mag;
  let bw = 0, bm = g(0);
  for (let i = 1; i <= n; i++) { const w = (wmax * i) / n, m = g(w); if (m > bm) { bm = m; bw = w; } }
  // golden-section refinement around the best grid point
  let lo = Math.max(0, bw - wmax / n), hi = Math.min(wmax, bw + wmax / n);
  const r = (Math.sqrt(5) - 1) / 2;
  for (let k = 0; k < 60; k++) {
    const a = hi - r * (hi - lo), b = lo + r * (hi - lo);
    if (g(a) > g(b)) hi = b; else lo = a;
  }
  const w = (lo + hi) / 2, m = g(w);
  return m >= bm ? { w, mag: m } : { w: bw, mag: bm };
}

/** The first ω > 0 at which |H(iω)| falls to 1/√2 of |H(0)| (the bandwidth), or null within wmax. */
export function cutoff(poles, K, wmax) {
  const g = (w) => freq(poles, K, w).mag, target = g(0) / Math.SQRT2;
  if (!Number.isFinite(target)) return null;
  const n = 2000;
  let prev = 0;
  for (let i = 1; i <= n; i++) {
    const w = (wmax * i) / n;
    if (g(w) <= target) {
      let lo = prev, hi = w;
      for (let k = 0; k < 60; k++) { const mid = (lo + hi) / 2; if (g(mid) > target) lo = mid; else hi = mid; }
      return (lo + hi) / 2;
    }
    prev = w;
  }
  return null;
}

/** The pole nearest the imaginary axis (largest real part): it decides how long the response lasts. */
export function slowest(poles) {
  return poles.reduce((b, p) => (p.re > b.re + 1e-12 || (Math.abs(p.re - b.re) <= 1e-12 && p.im > b.im) ? p : b), poles[0]);
}
