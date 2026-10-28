// Small numerics for the PHYS 4700 perturbation-theory lessons (M8) and the
// course boss: an infinite square well with piecewise-constant steps inside,
// solved exactly by shooting (the wave function is a sine, cosine, sinh or
// cosh on each flat piece, so the propagation is exact), and its
// perturbation series from closed-form matrix elements. Not a lesson: the
// leading underscore keeps it out of the registry.
//
// Units: the well runs from 0 to 1 (lengths in units of its width a) and
// energies are in units of the unperturbed ground state E₁⁰ = π²ħ²/2ma², so
// Eₙ⁰ = n² and the equation reads ψ″ = −π²(E − V)ψ.

/** Propagate (ψ, ψ′) across a flat piece of width w where E − V = d. */
function step(psi, dpsi, d, w) {
  const k2 = Math.PI * Math.PI * d;
  if (k2 > 1e-14) {
    const k = Math.sqrt(k2), c = Math.cos(k * w), s = Math.sin(k * w);
    return [psi * c + (dpsi / k) * s, -psi * k * s + dpsi * c];
  }
  if (k2 < -1e-14) {
    const q = Math.sqrt(-k2), c = Math.cosh(q * w), s = Math.sinh(q * w);
    return [psi * c + (dpsi / q) * s, psi * q * s + dpsi * c];
  }
  return [psi + dpsi * w, dpsi];
}

/** ψ at the far wall for energy E, starting ψ(0) = 0, ψ′(0) = 1; pieces [{ from, to, V }] cover [0, 1] with V = 0 elsewhere. */
export function wallValue(E, pieces) {
  const cuts = [...new Set([0, 1, ...pieces.flatMap((p) => [p.from, p.to])])].filter((x) => x >= 0 && x <= 1).sort((a, b) => a - b);
  const Vat = (x) => pieces.reduce((v, p) => (x > p.from && x < p.to ? v + p.V : v), 0);
  let s = [0, 1];
  for (let i = 0; i + 1 < cuts.length; i++) s = step(s[0], s[1], E - Vat((cuts[i] + cuts[i + 1]) / 2), cuts[i + 1] - cuts[i]);
  return s[0];
}

/** The exact n-th level (n = 1, 2, …) of the well with steps, by counting sign changes of ψ(1) and bisecting. */
export function exactLevel(n, pieces) {
  const vmin = Math.min(0, ...pieces.map((p) => p.V)), vmax = Math.max(0, ...pieces.map((p) => p.V));
  let E = vmin + 1e-9, f = wallValue(E, pieces), count = 0;
  const dE = 0.002;
  for (let i = 0; i < 2e6; i++) {
    const E2 = E + dE, f2 = wallValue(E2, pieces);
    if ((f2 < 0) !== (f < 0)) {
      count++;
      if (count === n) {
        let a = E, b = E2, fa = f;
        for (let j = 0; j < 100; j++) { const c = (a + b) / 2, fc = wallValue(c, pieces); if ((fc < 0) === (fa < 0)) { a = c; fa = fc; } else b = c; }
        return (a + b) / 2;
      }
    }
    E = E2; f = f2;
    if (E > vmax + (n + 2) ** 2 + 10) break;
  }
  throw new Error('exactLevel: root not found');
}

/** ⟨m|V|n⟩ for one step of height V on [x1, x2], with ψₙ = √2 sin(nπx). */
export function stepElement(m, n, { from: x1, to: x2, V }) {
  const P = Math.PI;
  if (m === n) return V * ((x2 - x1) - (Math.sin(2 * n * P * x2) - Math.sin(2 * n * P * x1)) / (2 * n * P));
  const F = (x) => Math.sin((m - n) * P * x) / ((m - n) * P) - Math.sin((m + n) * P * x) / ((m + n) * P);
  return V * (F(x2) - F(x1));
}
export const element = (m, n, pieces) => pieces.reduce((s, p) => s + stepElement(m, n, p), 0);

/** First- and second-order shifts of level n (sum to M states). */
export function pertShifts(n, pieces, M = 3000) {
  const E1 = element(n, n, pieces);
  let E2 = 0;
  for (let m = 1; m <= M; m++) if (m !== n) { const v = element(m, n, pieces); E2 += (v * v) / (n * n - m * m); }
  return { E1, E2 };
}

/** The exact wave function of level n, normalized, sampled at N + 1 points: [[x, ψ], …]. */
export function exactPsi(n, pieces, N = 400) {
  const E = exactLevel(n, pieces);
  const Vat = (x) => pieces.reduce((v, p) => (x > p.from && x < p.to ? v + p.V : v), 0);
  const pts = [];
  let s = [0, 1], x = 0;
  const h = 1 / N;
  pts.push([0, 0]);
  for (let i = 0; i < N; i++) { s = step(s[0], s[1], E - Vat(x + h / 2), h); x += h; pts.push([x, s[0]]); }
  let norm = 0;
  for (let i = 0; i < N; i++) norm += ((pts[i][1] ** 2 + pts[i + 1][1] ** 2) / 2) * h;
  const c = 1 / Math.sqrt(norm), sgn = pts[Math.round(N / (2 * n))][1] < 0 ? -1 : 1;
  return { E, slope: sgn * c, pts: pts.map(([xx, y]) => [xx, sgn * c * y]) };
}

/**
 * The exact, normalized ψₙ as a graph expression of x on [0, 1] (piecewise
 * sines or hyperbolic functions, joined with step()), and its energy.
 */
export function exactPsiExpr(n, pieces) {
  const E = exactLevel(n, pieces);
  const cuts = [...new Set([0, 1, ...pieces.flatMap((p) => [p.from, p.to])])].filter((x) => x >= 0 && x <= 1).sort((a, b) => a - b);
  const Vat = (x) => pieces.reduce((v, p) => (x > p.from && x < p.to ? v + p.V : v), 0);
  const { slope } = exactPsi(n, pieces, 4000);
  let s = [0, slope];
  const R = (v) => +(+v).toPrecision(9);
  const parts = [];
  for (let i = 0; i + 1 < cuts.length; i++) {
    const a = cuts[i], b = cuts[i + 1], d = E - Vat((a + b) / 2), k2 = Math.PI * Math.PI * d;
    let body;
    if (k2 > 1e-14) { const k = Math.sqrt(k2); body = `(${R(s[0])}*cos(${R(k)}*(x - ${R(a)})) + ${R(s[1] / k)}*sin(${R(k)}*(x - ${R(a)})))`; }
    else if (k2 < -1e-14) { const q = Math.sqrt(-k2); body = `(${R(s[0])}*cosh(${R(q)}*(x - ${R(a)})) + ${R(s[1] / q)}*sinh(${R(q)}*(x - ${R(a)})))`; }
    else body = `(${R(s[0])} + ${R(s[1])}*(x - ${R(a)}))`;
    const win = i === 0 ? `step(${R(b)} - x)` : i === cuts.length - 2 ? `step(x - ${R(a)})` : `step(x - ${R(a)})*step(${R(b)} - x)`;
    parts.push(`${win}*${body}`);
    s = step(s[0], s[1], d, b - a);
  }
  return { E, expr: parts.join(' + ') };
}

// ── hydrogen's fine structure (Griffiths & Schroeter §7.3), from CODATA 2022 constants ──
import { QE as E_, HBAR as HB_, C as C_, H as H_, RINF as RINF_, MEC2 as MEC2_ } from '../phys2710/_constants.js';
export const EPS0 = 8.8541878188e-12;                          // F/m, vacuum permittivity (CODATA 2022)
export const ALPHA = (E_ * E_) / (4 * Math.PI * EPS0 * HB_ * C_);  // the fine-structure constant, 1/137.035 999 2…
export const RYD_EV = (H_ * C_ * RINF_) / E_;                  // hcR∞ = ½α²mₑc² in eV: 13.605 693 1…
export const MEC2_EV = MEC2_ * 1e6;                            // eV
export const LAMB_2S_HZ = 1057.8e6;                            // Hz, the 2S½–2P½ Lamb shift (measured, ≈ 1057.8 MHz; QED)
/** Eₙ²/2mc² = Ryα²/4n⁴ in eV (infinitely heavy nucleus): the unit of fine structure for level n (Z scales it by Z⁴). */
export const fsUnit = (n, Z = 1) => (Z ** 4 * RYD_EV * ALPHA * ALPHA) / (4 * n ** 4);
/** First-order fine-structure shift of level (n, j), eV: (Eₙ²/2mc²)(3 − 4n/(j + ½)). */
export const fsShift = (n, j, Z = 1) => fsUnit(n, Z) * (3 - (4 * n) / (j + 0.5));
/** The relativistic (p⁴) part alone for (n, l), eV. */
export const relShift = (n, l, Z = 1) => -fsUnit(n, Z) * ((4 * n) / (l + 0.5) - 3);

/** Eigenvalues of a real symmetric matrix (array of rows), ascending, by cyclic Jacobi rotations. */
export function symEig(A0) {
  const n = A0.length, A = A0.map((row) => row.slice());
  for (let sweep = 0; sweep < 100; sweep++) {
    let off = 0;
    for (let p = 0; p < n; p++) for (let q = p + 1; q < n; q++) off += A[p][q] * A[p][q];
    if (off < 1e-26) break;
    for (let p = 0; p < n; p++) for (let q = p + 1; q < n; q++) {
      if (Math.abs(A[p][q]) < 1e-300) continue;
      const th = (A[q][q] - A[p][p]) / (2 * A[p][q]);
      const tt = Math.sign(th || 1) / (Math.abs(th) + Math.sqrt(th * th + 1)), c = 1 / Math.sqrt(tt * tt + 1), s = tt * c;
      for (let k = 0; k < n; k++) { const akp = A[k][p], akq = A[k][q]; A[k][p] = c * akp - s * akq; A[k][q] = s * akp + c * akq; }
      for (let k = 0; k < n; k++) { const apk = A[p][k], aqk = A[q][k]; A[p][k] = c * apk - s * aqk; A[q][k] = s * apk + c * aqk; }
    }
  }
  return A.map((row, i) => row[i]).sort((a, b) => a - b);
}

/**
 * The oscillator H = p²/2 + x²/2 + λx⁴ (units ħω and √(ħ/mω)) in its first N
 * number states, x = (a + a†)/√2 and x⁴ the fourth power of the truncated x:
 * the lowest eigenvalue.
 */
export function anharmonicE0(lambda, N = 60) {
  const X = Array.from({ length: N }, (_, i) => Array.from({ length: N }, (__, j) => (j === i + 1 ? Math.sqrt(j / 2) : i === j + 1 ? Math.sqrt(i / 2) : 0)));
  const mul = (P, Q) => P.map((row) => Q[0].map((_, j) => row.reduce((s, v, k) => s + v * Q[k][j], 0)));
  const X2 = mul(X, X), X4 = mul(X2, X2);
  return symEig(X4.map((row, i) => row.map((v, j) => lambda * v + (i === j ? i + 0.5 : 0))))[0];
}
