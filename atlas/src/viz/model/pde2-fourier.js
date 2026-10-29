// Solving linear PDEs on the whole line by Fourier transform, DOM-free.
// Convention: f̂(k) = ∫ f(x) e^{−ikx} dx, f(x) = (1/2π) ∫ f̂(k) e^{ikx} dk.
// Each equation multiplies every wavenumber by its own factor G(k, s):
//   heat      u_t = D u_xx          G = e^{−Dk²t}
//   wave      u_tt = c² u_xx, u_t(x, 0) = 0     G = cos(ckt)
//   laplace   u_xx + u_yy = 0 in y > 0, bounded, u(x, 0) = f     G = e^{−|k|y}
//   schrod    u_t = iβ u_xx (free Schrödinger-type, dispersive)  G = e^{−iβk²t}
// Initial profiles: gauss f = e^{−x²/(2w²)}, box f = 1 for |x| < w.
// The solutions are given in closed form where one exists, and otherwise by
// synthesising the inverse transform numerically. Tested in test/pde2.test.mjs.

import { erf } from '../../core/expr.js';

export const EQS = ['heat', 'wave', 'laplace', 'schrod'];

export function f0(profile, w, x) {
  return profile === 'box' ? (Math.abs(x) < w ? 1 : Math.abs(x) === w ? 0.5 : 0) : Math.exp(-(x * x) / (2 * w * w));
}

/** f̂(k) for the initial profile (real and even). */
export function fhat(profile, w, k) {
  if (profile === 'box') return Math.abs(k) < 1e-9 ? 2 * w : (2 * Math.sin(k * w)) / k;
  return w * Math.sqrt(2 * Math.PI) * Math.exp(-(k * k * w * w) / 2);
}

/** The multiplier G(k, s) as [re, im]; s is the time t, or the height y for Laplace. p = { D, c, beta }. */
export function multiplier(eq, k, s, p) {
  switch (eq) {
    case 'heat': return [Math.exp(-p.D * k * k * s), 0];
    case 'wave': return [Math.cos(p.c * k * s), 0];
    case 'laplace': return [Math.exp(-Math.abs(k) * s), 0];
    case 'schrod': { const ph = p.beta * k * k * s; return [Math.cos(ph), -Math.sin(ph)]; }
    default: return [NaN, NaN];
  }
}

/** The inverse transform (1/π)∫₀^K f̂(k) G(k) cos(kx) dk by Simpson's rule — valid because f̂ is even. Returns [re, im]. */
export function synth(profile, w, eq, s, p, x, K = 60 / w, n = 4000) {
  let re = 0, im = 0;
  const h = K / n;
  for (let i = 0; i <= n; i++) {
    const k = i * h, wt = i === 0 || i === n ? 1 : i % 2 ? 4 : 2;
    const F = fhat(profile, w, k), [gr, gi] = multiplier(eq, k, s, p), c = Math.cos(k * x);
    re += wt * F * gr * c; im += wt * F * gi * c;
  }
  return [(re * h) / (3 * Math.PI), (im * h) / (3 * Math.PI)];
}

/** u(x, s) as [re, im]: closed forms where they exist, numerical synthesis otherwise. */
export function solve(profile, w, eq, s, p, x) {
  if (s === 0) return [f0(profile, w, x), 0];
  if (eq === 'heat') {
    if (profile === 'box') { const q = Math.sqrt(4 * p.D * s); return [0.5 * (erf((x + w) / q) - erf((x - w) / q)), 0]; }
    const v = w * w + 2 * p.D * s;
    return [(w / Math.sqrt(v)) * Math.exp(-(x * x) / (2 * v)), 0];
  }
  if (eq === 'wave') return [0.5 * (f0(profile, w, x - p.c * s) + f0(profile, w, x + p.c * s)), 0];
  if (eq === 'laplace') {
    if (profile === 'box') return [(Math.atan((x + w) / s) - Math.atan((x - w) / s)) / Math.PI, 0];
    return synth(profile, w, eq, s, p, x, 14 / w + 40 / Math.max(s, 0.05), 3000);
  }
  if (eq === 'schrod') {
    if (profile === 'box') return synth(profile, w, eq, s, p, x, 80 / w, 8000);
    // e^{−x²/(2w²)} evolves to (w/√(w² + 2iβt)) e^{−x²/(2(w² + 2iβt))}
    const a = w * w, b = 2 * p.beta * s;              // σ² = a + ib
    const den = a * a + b * b;
    const er = (-(x * x) / 2) * (a / den), ei = (-(x * x) / 2) * (-b / den);   // −x²/(2σ²)
    const mod = Math.pow(den, -0.25) * w, arg = -0.5 * Math.atan2(b, a);         // w/√σ²
    const e = Math.exp(er);
    return [mod * e * Math.cos(arg + ei), mod * e * Math.sin(arg + ei)];
  }
  return [NaN, NaN];
}

/** The rms half-width of |u| over sample points: √(Σx²|u| / Σ|u|) — σ for a Gaussian. */
export function spread(xs, us) {
  let a = 0, b = 0;
  for (let i = 0; i < xs.length; i++) { a += xs[i] * xs[i] * us[i]; b += us[i]; }
  return b > 0 ? Math.sqrt(a / b) : NaN;
}
