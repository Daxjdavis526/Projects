// Fourier partial sums and how they converge — the model behind
// sims/fa-series.js. Every wave has period 2π on −π < x ≤ π and closed-form
// coefficients, in the real convention
//     f(x) ~ a₀/2 + Σₙ (aₙ cos nx + bₙ sin nx),
// with its mean square ⟨f²⟩ = (1/2π)∫f² known exactly, so Parseval's identity
// ⟨f²⟩ = (a₀/2)² + ½Σ(aₙ² + bₙ²) gives the mean-square error of any partial sum
// without integrating. At a jump the function's value is the midpoint, as
// Dirichlet's theorem says the series converges there.
//
// Partial sums may be weighted: Dirichlet (plain truncation), Fejér (the
// Cesàro mean, weights 1 − n/(N+1)) or Lanczos (σ-factors sin(nπ/(N+1)) /
// (nπ/(N+1))). DOM-free; tested by test/fa-series.test.mjs.

export const WAVES = ['square', 'saw', 'triangle', 'parabola', 'smooth', 'pulse'];
export const METHODS = ['dirichlet', 'fejer', 'lanczos'];
const PI = Math.PI;

// modified Bessel Iₙ(z) by its power series (z small; fine for z ≤ 2 and any n)
export function besselI(n, z) {
  let t = 1;
  for (let j = 1; j <= n; j++) t *= z / 2 / j;      // (z/2)ⁿ/n!
  let s = 0;
  for (let k = 0; k < 80; k++) {
    s += t;
    t *= (z * z) / 4 / ((k + 1) * (k + 1 + n));
    if (t < 1e-18 * s) break;
  }
  return s;
}

const I0_1 = besselI(0, 1), I0_2 = besselI(0, 2);

// f, the coefficients (n ≥ 1) and the constant term a₀/2, mean square, jumps and kinks
export const WAVE = {
  square: { label: 'square wave', f: (x) => (x === 0 || Math.abs(x) === PI ? 0 : Math.sign(x)), a0h: 0, coef: (n) => [0, n % 2 ? 4 / (n * PI) : 0], msq: 1, jumps: [0, PI], hi: 1 },
  saw: { label: 'sawtooth', f: (x) => (Math.abs(x) === PI ? 0 : x / PI), a0h: 0, coef: (n) => [0, (2 * (n % 2 ? 1 : -1)) / (n * PI)], msq: 1 / 3, jumps: [PI], hi: 1 },
  triangle: { label: 'triangle wave', f: (x) => 1 - (2 * Math.abs(x)) / PI, a0h: 0, coef: (n) => [n % 2 ? 8 / (PI * PI * n * n) : 0, 0], msq: 1 / 3, jumps: [], hi: 1 },
  parabola: { label: 'parabola (x/π)²', f: (x) => (x / PI) ** 2, a0h: 1 / 3, coef: (n) => [(4 * (n % 2 ? -1 : 1)) / (PI * PI * n * n), 0], msq: 1 / 5, jumps: [], hi: 1 },
  smooth: { label: 'smooth e^(cos x − 1)', f: (x) => Math.exp(Math.cos(x) - 1), a0h: Math.exp(-1) * I0_1, coef: (n) => [2 * Math.exp(-1) * besselI(n, 1), 0], msq: Math.exp(-2) * I0_2, jumps: [], hi: 1, smooth: true },
  pulse: { label: 'pulse (on a quarter of the time)', f: (x) => (Math.abs(Math.abs(x) - PI / 4) < 1e-15 ? 0.5 : Math.abs(x) < PI / 4 ? 1 : 0), a0h: 0.25, coef: (n) => [(2 * Math.sin((n * PI) / 4)) / (n * PI), 0], msq: 0.25, jumps: [-PI / 4, PI / 4], hi: 1 },
};

/** wrap x into (−π, π] */
export function wrap(x) {
  let y = ((x + PI) % (2 * PI) + 2 * PI) % (2 * PI) - PI;
  if (y === -PI) y = PI;
  return y;
}

export const f = (wave, x) => WAVE[wave].f(wrap(x));

/** coefficients for n = 0…nmax: a[0] = a₀/2 (so the constant term is a[0]), b[0] = 0 */
export function coeffs(wave, nmax) {
  const W = WAVE[wave], a = [W.a0h], b = [0];
  for (let n = 1; n <= nmax; n++) { const [an, bn] = W.coef(n); a.push(an); b.push(bn); }
  return { a, b };
}

/** energy of harmonic n as a share of ⟨f²⟩'s units: E₀ = (a₀/2)², Eₙ = (aₙ² + bₙ²)/2 */
export function energies(wave, nmax) {
  const { a, b } = coeffs(wave, nmax);
  return a.map((an, n) => (n === 0 ? an * an : (an * an + b[n] * b[n]) / 2));
}

export function weight(method, n, N) {
  if (n > N) return 0;
  if (method === 'fejer') return 1 - n / (N + 1);
  if (method === 'lanczos') { if (n === 0) return 1; const u = (n * PI) / (N + 1); return Math.sin(u) / u; }
  return 1;
}

/** the (weighted) partial sum S_N at x, from precomputed coefficients */
export function partial(C, x, N, method = 'dirichlet') {
  let s = C.a[0];
  for (let n = 1; n <= N; n++) {
    const w = weight(method, n, N);
    if (w) s += w * (C.a[n] * Math.cos(n * x) + C.b[n] * Math.sin(n * x));
  }
  return s;
}

/** the mean-square tail ½Σ_{n>N}(aₙ² + bₙ²): by subtraction from ⟨f²⟩, or summed directly for a smooth wave (no cancellation) */
export function tail(wave, N) {
  const W = WAVE[wave];
  if (W.smooth) { let s = 0; for (let n = N + 1; n <= N + 120; n++) { const [an, bn] = W.coef(n); s += (an * an + bn * bn) / 2; } return s; }
  const E = energies(wave, N);
  let s = 0;
  for (const e of E) s += e;
  return Math.max(0, W.msq - s);
}

/** the root-mean-square error ‖f − S_N‖ (per unit length, over a period) — exact, by Parseval */
export function rmsError(wave, N, method = 'dirichlet') {
  const E = energies(wave, N);
  let s = tail(wave, N);
  for (let n = 0; n <= N; n++) { const w = weight(method, n, N); s += (1 - w) ** 2 * E[n]; }
  return Math.sqrt(s);
}

/** Bessel's sum: the share of ⟨f²⟩ that the first N harmonics carry */
export function captured(wave, N) {
  const E = energies(wave, N);
  return E.reduce((s, e) => s + e, 0) / WAVE[wave].msq;
}

// the sample points used for the uniform (sup) error: a grid with 0 and ±π on it,
// plus points just either side of every jump (where |f − S_N| tends to half the jump)
export function supGrid(wave, G = 1000) {
  const xs = [];
  for (let g = 0; g <= G; g++) xs.push(-PI + (2 * PI * g) / G);
  for (const j of WAVE[wave].jumps) for (const d of [-1e-9, 1e-9]) xs.push(wrap(j + d));
  return xs;
}

/** max over x of |f(x) − S_N(x)| (sampled on supGrid) */
export function supError(wave, N, method = 'dirichlet', xs = supGrid(wave)) {
  const C = coeffs(wave, N);
  let m = 0;
  for (const x of xs) m = Math.max(m, Math.abs(f(wave, x) - partial(C, x, N, method)));
  return m;
}

/** the highest point of S_N over a period (grid then golden-section refinement) */
export function peak(wave, N, method = 'dirichlet') {
  const C = coeffs(wave, N);
  const G = Math.max(2000, 40 * N);
  let best = -Infinity, bx = 0;
  for (let g = 0; g < G; g++) { const x = -PI + (2 * PI * (g + 0.5)) / G, y = partial(C, x, N, method); if (y > best) { best = y; bx = x; } }
  let lo = bx - (2 * PI) / G, hi = bx + (2 * PI) / G;
  const r = (Math.sqrt(5) - 1) / 2;
  for (let i = 0; i < 60; i++) {
    const m1 = hi - r * (hi - lo), m2 = lo + r * (hi - lo);
    if (partial(C, m1, N, method) > partial(C, m2, N, method)) hi = m2; else lo = m1;
  }
  const x = (lo + hi) / 2;
  return { x, y: partial(C, x, N, method) };
}

/** error curves against N = 1…Nmax: rms (exact), pointwise at x0, and sup */
export function errorCurves(wave, method, x0, Nmax, withSup = true) {
  const C = coeffs(wave, Nmax), xs = supGrid(wave, 600), fx = xs.map((x) => f(wave, x));
  // terms table for the sup error: T[n][g]
  const T = [];
  if (withSup) for (let n = 0; n <= Nmax; n++) T.push(xs.map((x) => (n === 0 ? C.a[0] : C.a[n] * Math.cos(n * x) + C.b[n] * Math.sin(n * x))));
  const rms = [], pt = [], sup = [];
  const f0 = f(wave, x0);
  for (let N = 1; N <= Nmax; N++) {
    rms.push(rmsError(wave, N, method));
    pt.push(Math.abs(f0 - partial(C, x0, N, method)));
    if (withSup) {
      let m = 0;
      for (let g = 0; g < xs.length; g++) {
        let s = 0;
        for (let n = 0; n <= N; n++) { const w = weight(method, n, N); if (w) s += w * T[n][g]; }
        m = Math.max(m, Math.abs(fx[g] - s));
      }
      sup.push(m);
    }
  }
  return { rms, pt, sup };
}

// the sine integral Si(x) = ∫₀ˣ sin t / t dt, by Simpson's rule
export function Si(x, n = 4000) {
  const h = x / n;
  let s = 0;
  for (let i = 0; i <= n; i++) { const t = i * h; s += (i === 0 || i === n ? 1 : i % 2 ? 4 : 2) * (t ? Math.sin(t) / t : 1); }
  return (s * h) / 3;
}
export const SI_PI = Si(PI);
/** the limit of the peak of the ±1 square wave's partial sums, (2/π)Si(π) */
export const GIBBS_PEAK = (2 / PI) * SI_PI;
/** the overshoot as a fraction of the jump, Si(π)/π − ½ */
export const GIBBS_FRAC = SI_PI / PI - 0.5;
