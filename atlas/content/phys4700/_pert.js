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
