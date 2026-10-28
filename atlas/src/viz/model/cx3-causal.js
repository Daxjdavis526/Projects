// Causality in the complex frequency plane, DOM-free. Used by
// sims/cx3-causal.js; tested headlessly in test/cx3-causal.test.mjs.
//
// A response function is a sum of damped-oscillator terms, one for each
// pole pair p = a + ib, −p̄ = −a + ib (a mirror pair, so the response in
// time is real):
//   χ(ω) = Σ −A / ((ω − p)(ω + p̄)),   which for b = −γ/2 is A/(ω₀² − ω² − iγω).
// Its response in time is the inverse Fourier transform (convention
// G(t) = (1/2π)∫χ(ω)e^{−iωt} dω): close the real line in the half-plane where
// e^{−iωt} dies — the lower one for t > 0 (clockwise, −2πi), the upper one for
// t < 0 — and add residues:
//   a pair below the axis gives  G = θ(t)  A e^{bt} sin(at)/a   (causal, decaying),
//   a pair above the axis gives  G = −θ(−t) A e^{bt} sin(at)/a  (a response before the kick).
// The Kramers–Kronig reconstruction Re χ_KK(ω) = (1/π) P∫ Im χ(ω′)/(ω′ − ω) dω′
// equals Re χ for the terms analytic in the upper half-plane (poles below)
// and −Re χ for the others, so it reproduces Re χ exactly when — and only
// when — the response is causal. hilbertNumeric checks that by quadrature.

export const mul = (a, b) => [a[0] * b[0] - a[1] * b[1], a[0] * b[1] + a[1] * b[0]];
export function div(a, b) {
  const d = b[0] * b[0] + b[1] * b[1];
  return [(a[0] * b[0] + a[1] * b[1]) / d, (a[1] * b[0] - a[0] * b[1]) / d];
}
const MIN = 0.02;   // poles keep this far off the axes (a pole on the real axis has no Fourier transform)

/** Tidy a pole list: every pair has a > 0 and b ≠ 0; amplitudes default to 1. */
export const tidy = (poles) => poles.map((q) => ({ re: Math.max(MIN, Math.abs(+q.re)), im: Math.abs(+q.im) < MIN ? (q.im < 0 ? -MIN : MIN) : +q.im, amp: q.amp ?? 1 }));

/** χ at a complex frequency w = [re, im]. */
export function chi(w, poles) {
  let s = [0, 0];
  for (const q of poles) {
    const d = mul([w[0] - q.re, w[1] - q.im], [w[0] + q.re, w[1] - q.im]);
    const t = div([-q.amp, 0], d);
    s = [s[0] + t[0], s[1] + t[1]];
  }
  return s;
}
/** One pair's term at a real frequency. */
export const term = (w, q) => chi([w, 0], [q]);

/** The response in time, by residues. */
export function G(t, poles) {
  let s = 0;
  for (const q of poles) {
    if (q.im < 0 && t > 0) s += (q.amp * Math.exp(q.im * t) * Math.sin(q.re * t)) / q.re;
    if (q.im > 0 && t < 0) s -= (q.amp * Math.exp(q.im * t) * Math.sin(q.re * t)) / q.re;
  }
  return s;
}
/** The residues of χ(ω)e^{−iωt} at the poles in one half-plane ('lower' | 'upper'): [{ at: [re, im], res: [re, im] }]. */
export function residues(t, poles, half) {
  const out = [];
  for (const q of poles) {
    if ((half === 'lower') !== (q.im < 0)) continue;
    const p = [q.re, q.im], pb = [-q.re, q.im];
    const e = (w) => { const m = Math.exp(w[1] * t); return [m * Math.cos(-w[0] * t), m * Math.sin(-w[0] * t)]; };   // e^{−iwt}
    out.push({ at: p, res: div(mul([-q.amp, 0], e(p)), [2 * q.re, 0]) });
    out.push({ at: pb, res: div(mul([-q.amp, 0], e(pb)), [-2 * q.re, 0]) });
  }
  return out;
}
/** Whether every pole lies in the lower half-plane. */
export const causal = (poles) => poles.every((q) => q.im < 0);

/** Re χ as Kramers–Kronig would rebuild it from Im χ (closed form; see the header). */
export function kkReal(w, poles) {
  let s = 0;
  for (const q of poles) s += (q.im < 0 ? 1 : -1) * term(w, q)[0];
  return s;
}

/**
 * (1/π) P∫ g(ω′)/(ω′ − ω) dω′ by quadrature: the singularity is removed by
 * pairing ω ± u, and the tails are mapped onto a finite interval. For tests.
 */
export function hilbertNumeric(g, w, { n = 20000, L = 40 } = {}) {
  // (1/π)∫_0^∞ [g(ω + u) − g(ω − u)]/u du, with u = L·s/(1 − s) on s ∈ (0, 1)
  let s = 0;
  for (let k = 0; k < n; k++) {
    const x = (k + 0.5) / n, u = (L * x) / (1 - x), du = L / (1 - x) ** 2;
    s += ((g(w + u) - g(w - u)) / u) * du;
  }
  return s / n / Math.PI;
}

/** G(t) by direct numerical Fourier inversion (for tests): (1/2π)∫χ(ω)e^{−iωt} dω over [−W, W]. */
export function Gnumeric(t, poles, { W = 400, n = 400000 } = {}) {
  let s = 0;
  const h = (2 * W) / n;
  for (let k = 0; k < n; k++) {
    const w = -W + (k + 0.5) * h, c = chi([w, 0], poles);
    s += c[0] * Math.cos(w * t) + c[1] * Math.sin(w * t);   // Re[χ e^{−iωt}]
  }
  return (s * h) / (2 * Math.PI);
}
