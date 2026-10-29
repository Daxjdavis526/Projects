// The one-dimensional Schrödinger equation, DOM-free (tested in
// test/mp-schrodinger.test.mjs). Units: lengths in nm, energies in eV,
// times in fs, masses in electron masses (an effective mass m* = 0.067
// is an electron in GaAs). Used by the mp-schrodinger simulation and the
// PHYS 2710 lessons on wells, tunnelling and the oscillator.
//
// Bound states:
//   infinite well (walls at 0 and L)   — exact: Eₙ = n²π²ħ²/2mL², ψₙ = √(2/L) sin(nπx/L)
//   finite well (V = 0 on 0…L, V₀ outside) — exact roots of the even and odd
//       transcendental equations z tan z = √(z₀² − z²), −z cot z = √(z₀² − z²)
//   harmonic oscillator (V = ½mω²x²)    — exact: Eₙ = (n + ½)ħω, Hermite functions
//   any potential on a finite interval with hard walls — a finite-difference
//       matrix, eigenvalues by Sturm-sequence bisection, eigenvectors by
//       inverse iteration (the double well uses it)
// Scattering: a plane wave from the left on piecewise-constant potentials
// (a step, a rectangular barrier, two barriers), matched exactly at every
// edge: reflection and transmission probabilities and ψ(x) everywhere.

export const HBARC = 197.3269804;                 // eV nm (ħc, exact in the 2019 SI to these digits)
export const MEC2 = 510998.95069;                 // eV, the electron's rest energy (CODATA 2022)
export const HBAR_EVFS = 0.6582119569;            // eV fs (ħ)
export const H_EVFS = 2 * Math.PI * HBAR_EVFS;    // eV fs (h)
export const T0 = (HBARC * HBARC) / (2 * MEC2);   // ħ²/2mₑ = 0.038 099 8 eV nm²

// ---------- the infinite square well, walls at x = 0 and x = L ----------
/** Eₙ = n²π²ħ²/(2mL²), in eV, for L in nm and m in electron masses. */
export const boxEnergy = (n, L, m = 1) => (n * n * Math.PI * Math.PI * T0) / (m * L * L);
/** ψₙ(x) = √(2/L) sin(nπx/L) inside, 0 outside (nm⁻¹ᐟ²). */
export const boxPsi = (n, x, L) => (x <= 0 || x >= L ? 0 : Math.sqrt(2 / L) * Math.sin((n * Math.PI * x) / L));
/** The probability of finding a particle in state n between a and b (0 ≤ a < b ≤ L). */
export function boxProb(n, a, b, L) {
  const F = (x) => x / L - Math.sin((2 * n * Math.PI * x) / L) / (2 * n * Math.PI);
  const c = (x) => Math.max(0, Math.min(L, x));
  return F(c(b)) - F(c(a));
}

// ---------- the finite square well: V = 0 on 0 < x < L, V₀ outside ----------
/** The well's strength z₀ = (L/2)√(2mV₀)/ħ; it holds ⌈2z₀/π⌉ bound states. */
export const wellZ0 = (V0, L, m = 1) => (L / 2) * Math.sqrt((m * V0) / T0);
export const boundCount = (V0, L, m = 1) => Math.max(1, Math.ceil((2 * wellZ0(V0, L, m)) / Math.PI));

function bisect(f, lo, hi, it = 200) {
  let flo = f(lo);
  for (let i = 0; i < it; i++) {
    const mid = (lo + hi) / 2, fm = f(mid);
    if (fm === 0) return mid;
    if ((fm < 0) === (flo < 0)) { lo = mid; flo = fm; } else hi = mid;
    if (hi - lo < 1e-15 * Math.max(1, hi)) break;
  }
  return (lo + hi) / 2;
}

/**
 * The bound states of a finite well, lowest first: { n, E (eV, above the
 * well's floor), z = ka, k, kappa (nm⁻¹), parity }. State n has its
 * z in [(n − 1)π/2, nπ/2): even states solve z sin z = √(z₀² − z²) cos z,
 * odd ones z cos z = −√(z₀² − z²) sin z (forms with no poles).
 */
export function finiteLevels(V0, L, m = 1) {
  const z0 = wellZ0(V0, L, m), a = L / 2, out = [];
  const s = (z) => Math.sqrt(Math.max(0, z0 * z0 - z * z));
  for (let j = 0; (j * Math.PI) / 2 < z0; j++) {
    const lo = (j * Math.PI) / 2, hi = Math.min(((j + 1) * Math.PI) / 2, z0);
    const even = j % 2 === 0;
    const f = even ? (z) => z * Math.sin(z) - s(z) * Math.cos(z) : (z) => z * Math.cos(z) + s(z) * Math.sin(z);
    const z = bisect(f, lo + 1e-14, hi);
    out.push({ n: j + 1, z, k: z / a, kappa: s(z) / a, E: (T0 * z * z) / (m * a * a), parity: even ? 'even' : 'odd' });
  }
  return out;
}

/** ψ(x) of a finite-well level (normalised; positive just inside the left wall). */
export function finitePsi(level, x, L) {
  const a = L / 2, u = x - a, { k, kappa, parity } = level;
  const even = parity === 'even';
  const inside = (v) => (even ? Math.cos(k * v) : Math.sin(k * v));
  const edge = inside(a);                        // ψ at the right wall, before normalising
  const norm = even ? a + Math.sin(2 * k * a) / (2 * k) + (edge * edge) / kappa : a - Math.sin(2 * k * a) / (2 * k) + (edge * edge) / kappa;
  const A = 1 / Math.sqrt(norm), sgn = Math.sign(inside(-a)) || 1;
  if (Math.abs(u) <= a) return sgn * A * inside(u);
  return sgn * A * (u > 0 ? edge : inside(-a)) * Math.exp(-kappa * (Math.abs(u) - a));
}

// ---------- the harmonic oscillator, V = ½mω²x², centred on x = 0 ----------
/** The oscillator's length scale b = √(ħ/mω), in nm, for ħω in eV. */
export const oscLength = (hw, m = 1) => Math.sqrt((2 * T0) / (m * hw));
export const oscEnergy = (n, hw) => (n + 0.5) * hw;
/** The Hermite polynomial Hₙ(ξ) (physicists'): H₀ = 1, H₁ = 2ξ, Hₙ₊₁ = 2ξHₙ − 2nHₙ₋₁. */
export function hermite(n, x) {
  let h0 = 1, h1 = 2 * x;
  if (n === 0) return h0;
  for (let k = 1; k < n; k++) { const h2 = 2 * x * h1 - 2 * k * h0; h0 = h1; h1 = h2; }
  return h1;
}
/** ψₙ(x) = Hₙ(x/b) e^{−x²/2b²} / √(2ⁿ n! √π b), by the stable normalised recurrence. */
export function oscPsi(n, x, b) {
  const xi = x / b;
  let p0 = Math.PI ** -0.25 * Math.exp((-xi * xi) / 2), p1 = Math.SQRT2 * xi * p0;
  if (n === 0) return p0 / Math.sqrt(b);
  for (let k = 1; k < n; k++) { const p2 = Math.sqrt(2 / (k + 1)) * xi * p1 - Math.sqrt(k / (k + 1)) * p0; p0 = p1; p1 = p2; }
  return p1 / Math.sqrt(b);
}
/** The classical turning point of level n: ½mω²A² = Eₙ, so A = b√(2n + 1). */
export const oscTurning = (n, b) => b * Math.sqrt(2 * n + 1);
/** The classical probability density of an oscillator of amplitude A: 1/(π√(A² − x²)). */
export const oscClassical = (x, A) => (Math.abs(x) < A ? 1 / (Math.PI * Math.sqrt(A * A - x * x)) : 0);

// ---------- any potential between hard walls: finite differences ----------
/**
 * The lowest `count` eigenstates of −(ħ²/2m)ψ″ + V(x)ψ = Eψ on (x0, x1)
 * with ψ = 0 at both ends, on N interior grid points.
 * Returns { x, h, E: [eV], psi: [Float64Array] } with Σψ²h = 1 and each ψ
 * positive on its first lobe from the left.
 */
export function solveFD(V, x0, x1, { N = 1000, m = 1, count = 8 } = {}) {
  const h = (x1 - x0) / (N + 1), t = T0 / (m * h * h);
  const x = new Float64Array(N), d = new Float64Array(N);
  let vmin = Infinity, dmax = -Infinity;
  for (let i = 0; i < N; i++) { x[i] = x0 + (i + 1) * h; const v = V(x[i]); d[i] = 2 * t + v; vmin = Math.min(vmin, v); dmax = Math.max(dmax, d[i]); }
  const t2 = t * t;
  // the number of eigenvalues below λ: sign changes of the Sturm sequence
  const below = (lam) => {
    let q = d[0] - lam, c = q < 0 ? 1 : 0;
    for (let i = 1; i < N; i++) { q = d[i] - lam - t2 / (q === 0 ? 1e-300 : q); if (q < 0) c++; }
    return c;
  };
  const E = [], psi = [];
  const n = Math.min(count, N);
  for (let k = 0; k < n; k++) {
    let lo = vmin, hi = dmax + 2 * t;
    for (let it = 0; it < 100 && hi - lo > 1e-13 * Math.max(1, Math.abs(hi)); it++) { const mid = (lo + hi) / 2; if (below(mid) > k) hi = mid; else lo = mid; }
    const lam = (lo + hi) / 2;
    E.push(lam);
    psi.push(inverseIteration(d, t, lam, h));
  }
  return { x, h, E, psi };
}

function inverseIteration(d, t, lam, h) {
  const N = d.length, shift = lam + 1e-10 * Math.max(1, Math.abs(lam));
  let y = new Float64Array(N).fill(1);
  const c = new Float64Array(N), z = new Float64Array(N);
  for (let it = 0; it < 4; it++) {
    // Thomas algorithm for (D − λ)z − t(z₍ᵢ₋₁₎ + z₍ᵢ₊₁₎) = y
    let b0 = d[0] - shift;
    if (b0 === 0) b0 = 1e-300;
    c[0] = -t / b0; z[0] = y[0] / b0;
    for (let i = 1; i < N; i++) {
      let den = d[i] - shift + t * c[i - 1];
      if (den === 0) den = 1e-300;
      c[i] = -t / den; z[i] = (y[i] + t * z[i - 1]) / den;
    }
    for (let i = N - 2; i >= 0; i--) z[i] -= c[i] * z[i + 1];
    let s = 0;
    for (let i = 0; i < N; i++) s += z[i] * z[i];
    s = Math.sqrt(s * h);
    y = Float64Array.from(z, (v) => v / s);
  }
  let peak = 0;
  for (let i = 0; i < N; i++) peak = Math.max(peak, Math.abs(y[i]));
  const first = y.findIndex((v) => Math.abs(v) > 0.05 * peak);
  if (y[first] < 0) for (let i = 0; i < N; i++) y[i] = -y[i];
  return y;
}

// ---------- the double well: two boxes of width (L − w)/2 joined by a barrier ----------
/** Hard walls at 0 and L; a barrier of height Vb and width w in the middle. */
export const doubleWellV = (L, w, Vb) => (x) => (Math.abs(x - L / 2) < w / 2 ? Vb : 0);

// ---------- scattering from piecewise-constant potentials ----------
const cx = (re, im = 0) => ({ re, im });
const add = (a, b) => cx(a.re + b.re, a.im + b.im);
const sub = (a, b) => cx(a.re - b.re, a.im - b.im);
const mul = (a, b) => cx(a.re * b.re - a.im * b.im, a.re * b.im + a.im * b.re);
const div = (a, b) => { const q = b.re * b.re + b.im * b.im; return cx((a.re * b.re + a.im * b.im) / q, (a.im * b.re - a.re * b.im) / q); };
const cexp = (a) => { const r = Math.exp(a.re); return cx(r * Math.cos(a.im), r * Math.sin(a.im)); };
const abs2 = (a) => a.re * a.re + a.im * a.im;

/** The wavenumber √(2m(E − V))/ħ: real above the potential, i·κ below it. */
const waveK = (E, V, m) => (E >= V ? cx(Math.sqrt((m * (E - V)) / T0), 0) : cx(0, Math.sqrt((m * (V - E)) / T0)));

/**
 * A plane wave e^{ikx} arriving from the left on a potential that is constant
 * between the edges xs[0] < xs[1] < …: pieces[j] is V on region j (region 0
 * runs from −∞ to xs[0], the last from the last edge to +∞).
 * Returns { T, R, k: [complex], A, B, edges } — in region j,
 * ψ = Aⱼ e^{ikⱼ(x − Xⱼ)} + Bⱼ e^{−ikⱼ(x − Xⱼ)} with Xⱼ its left edge (X₀ = xs[0]).
 */
export function scatter(E, pieces, xs, m = 1) {
  if (E <= 0) E = 1e-9;
  const nR = pieces.length;
  // nudge E off any V exactly (k = 0 there would make the matching singular)
  for (const V of pieces) if (Math.abs(E - V) < 1e-12) E += 1e-9;
  const k = pieces.map((V) => waveK(E, V, m));
  const X = pieces.map((_, j) => (j === 0 ? xs[0] : xs[j - 1]));
  const A = new Array(nR), B = new Array(nR);
  A[nR - 1] = cx(1); B[nR - 1] = cx(0);
  const I = cx(0, 1);
  for (let j = nR - 2; j >= 0; j--) {
    const b = xs[j];
    // ψ and ψ′ just right of the edge (Xⱼ₊₁ = b)
    const psi = add(A[j + 1], B[j + 1]);
    const dpsi = mul(mul(I, k[j + 1]), sub(A[j + 1], B[j + 1]));
    const P = cexp(mul(mul(I, k[j]), cx(b - X[j])));
    const q = div(dpsi, mul(I, k[j]));
    A[j] = div(mul(cx(0.5), add(psi, q)), P);
    B[j] = mul(mul(cx(0.5), sub(psi, q)), P);
  }
  const a0 = A[0];
  for (let j = 0; j < nR; j++) { A[j] = div(A[j], a0); B[j] = div(B[j], a0); }
  const kL = k[0].re, kR = k[nR - 1];
  const T = kR.im === 0 && kR.re > 0 ? (kR.re / kL) * abs2(A[nR - 1]) : 0;
  return { E, T, R: abs2(B[0]), k, A, B, X, edges: xs };
}

/** ψ(x) of a scattering solution from scatter(): { re, im, abs2 }. */
export function scatterPsi(S, x) {
  let j = 0;
  while (j < S.edges.length && x >= S.edges[j]) j++;
  const I = cx(0, 1), ph = mul(mul(I, S.k[j]), cx(x - S.X[j]));
  const v = add(mul(S.A[j], cexp(ph)), mul(S.B[j], cexp(cx(-ph.re, -ph.im))));
  return { re: v.re, im: v.im, abs2: abs2(v) };
}

/** A rectangular barrier of height V0 and width w starting at x = 0. */
export const barrier = (E, V0, w, m = 1) => scatter(E, [0, V0, 0], [0, w], m);
/** A potential step of height V0 at x = 0. */
export const step = (E, V0, m = 1) => scatter(E, [0, V0], [0], m);

/** The textbook closed form for a rectangular barrier (a check on scatter()). */
export function barrierT(E, V0, w, m = 1) {
  if (Math.abs(E - V0) < 1e-12) return 1 / (1 + (m * V0 * w * w) / (4 * T0));
  if (E < V0) { const kap = Math.sqrt((m * (V0 - E)) / T0); return 1 / (1 + (V0 * V0 * Math.sinh(kap * w) ** 2) / (4 * E * (V0 - E))); }
  const q = Math.sqrt((m * (E - V0)) / T0);
  return 1 / (1 + (V0 * V0 * Math.sin(q * w) ** 2) / (4 * E * (E - V0)));
}
/** The decay constant κ = √(2m(V₀ − E))/ħ inside a barrier, nm⁻¹. */
export const kappa = (E, V0, m = 1) => Math.sqrt((m * Math.max(0, V0 - E)) / T0);
/** The thick-barrier estimate T ≈ 16(E/V₀)(1 − E/V₀)e^{−2κw}. */
export const barrierTApprox = (E, V0, w, m = 1) => 16 * (E / V0) * (1 - E / V0) * Math.exp(-2 * kappa(E, V0, m) * w);

// ---------- superpositions and averages on a grid ----------
/** |Ψ(x, t)|² for (ψa e^{−iEa t/ħ} + ψb e^{−iEb t/ħ})/√2 with real ψa, ψb; t in fs. */
export const superDensity = (pa, pb, Ea, Eb, t) => 0.5 * (pa * pa + pb * pb + 2 * pa * pb * Math.cos(((Eb - Ea) * t) / HBAR_EVFS));

/** ∫f dx by the trapezoid rule on samples. */
export function trapz(xs, ys) {
  let s = 0;
  for (let i = 1; i < xs.length; i++) s += 0.5 * (xs[i] - xs[i - 1]) * (ys[i] + ys[i - 1]);
  return s;
}
/** ⟨x⟩ and Δx of a density sampled on a grid. */
export function moments(xs, rho) {
  const n = trapz(xs, rho), m1 = trapz(xs, rho.map((r, i) => r * xs[i])) / n, m2 = trapz(xs, rho.map((r, i) => r * xs[i] * xs[i])) / n;
  return { norm: n, mean: m1, sd: Math.sqrt(Math.max(0, m2 - m1 * m1)) };
}
