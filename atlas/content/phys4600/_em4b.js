// Shared helpers for PHYS 4600 modules M3 and M4 (electromagnetic waves,
// potentials and gauges): CODATA 2022 constants (re-exported from the
// course's _em4.js), the impedance of free space, skin depths, plasma
// frequencies, the complex wave number of a conductor (exact and in the
// good-conductor limit), normal-incidence and Fresnel coefficients, the
// rectangular waveguide (from model/em4b-guide.js), retarded times, and
// builders for static graph pictures (a standing wave in front of a mirror, a
// wave meeting an interface, a spacetime diagram). Files whose names start
// with "_" are helpers, not lessons.

import { MU0, EPS0, C, PI, DEG } from './_em4.js';

export { MU0, EPS0, C, QE, ME, PI, DEG, SIGMA, sf, bare, tag, outOf, into, circArrows } from './_em4.js';
export { cutoff, guide, WR90, te } from '../../src/viz/model/em4b-guide.js';

/** The impedance of free space, √(μ₀/ε₀), in ohms (about 376.73 Ω). */
export const Z0 = Math.sqrt(MU0 / EPS0);

/** Skin depth (m) of a good conductor: √(2/(ωμσ)), with μ = μᵣμ₀. */
export const skin = (sigma, f, mur = 1) => Math.sqrt(2 / (2 * PI * f * MU0 * mur * sigma));

/**
 * The complex wave number k̃ = k + iκ of a medium with conductivity σ (S/m),
 * relative permittivity εᵣ and permeability μᵣ at frequency f (Hz), exactly
 * (Griffiths eq. 9.126): returns { k, kappa } in 1/m.
 */
export function kTilde(sigma, f, er = 1, mur = 1) {
  const w = 2 * PI * f, eps = er * EPS0, mu = mur * MU0, q = sigma / (eps * w);
  const base = w * Math.sqrt((eps * mu) / 2), root = Math.sqrt(1 + q * q);
  return { k: base * Math.sqrt(root + 1), kappa: base * Math.sqrt(root - 1) };
}

/** Plasma frequency f_p (Hz) of an electron density n (per m³): (1/2π)√(ne²/ε₀m). */
export const QE_ = 1.602176634e-19, ME_ = 9.1093837139e-31;
export const plasmaF = (n) => Math.sqrt((n * QE_ * QE_) / (EPS0 * ME_)) / (2 * PI);
/** The electron density (per m³) whose plasma frequency is f (Hz). */
export const plasmaN = (f) => ((2 * PI * f) ** 2 * EPS0 * ME_) / (QE_ * QE_);

/** Normal incidence, non-magnetic media: amplitude r = (n₁ − n₂)/(n₁ + n₂), t = 2n₁/(n₁ + n₂), and the power fractions. */
export function normal(n1, n2) {
  const r = (n1 - n2) / (n1 + n2), t = (2 * n1) / (n1 + n2);
  return { r, t, R: r * r, T: (n2 / n1) * t * t };
}

/**
 * Fresnel amplitude coefficients for non-magnetic media at angle of incidence
 * th (rad), in Griffiths's convention for p (E in the plane of incidence:
 * r_p = (α − β)/(α + β), t_p = 2/(α + β), α = cos θ_T/cos θ_I, β = n₂/n₁) and
 * the matching s (E perpendicular to it). Null beyond the critical angle.
 */
export function fresnel(n1, n2, th) {
  const st = (n1 / n2) * Math.sin(th);
  if (st >= 1) return null;
  const ci = Math.cos(th), ct = Math.sqrt(1 - st * st), a = ct / ci, b = n2 / n1;
  const rp = (a - b) / (a + b), tp = 2 / (a + b);
  const rs = (n1 * ci - n2 * ct) / (n1 * ci + n2 * ct), ts = (2 * n1 * ci) / (n1 * ci + n2 * ct);
  return { thT: Math.asin(st), a, b, rp, tp, rs, ts, Rp: rp * rp, Tp: a * b * tp * tp, Rs: rs * rs, Ts: a * b * ts * ts };
}

/** Brewster's angle (rad) going from n₁ into n₂: tan θ_B = n₂/n₁. */
export const brewster = (n1, n2) => Math.atan(n2 / n1);

/**
 * Retarded time for a charge on the worldline x = w(t) (along x, c = 1 units
 * unless c is given) seen at (X, Y) at time T: the root of
 * c(T − t_r) = |(X − w(t_r), Y)|, by bisection (the left side falls faster
 * than the right whenever |w′| < c, so the root is unique).
 */
export function retarded(w, X, Y, T, c = 1, span = 1e3) {
  const f = (tr) => c * (T - tr) - Math.hypot(X - w(tr), Y);
  let lo = T - span, hi = T;
  for (let k = 0; k < 200 && hi - lo > 1e-13 * Math.max(1, Math.abs(T)); k++) {
    const m = (lo + hi) / 2;
    if (f(m) > 0) lo = m; else hi = m;
  }
  return (lo + hi) / 2;
}

// ── pictures ──

const r4 = (v) => +(+v).toPrecision(4);

/**
 * A wave meeting a perfect mirror at z = 0 (on the right), seen at phase ωt =
 * ph (degrees): E (violet) and cB (teal) against z/λ, for an amplitude
 * reflection r (1: a perfect mirror). Options: S (draw the Poynting vector),
 * env (draw the envelopes), marks (extra points), window [z0, 0].
 */
export function standPic(caption, { r = 1, ph = 30, S = false, env = false, z0 = -2, labels = true, points = [], vlines = [], E = true, B = true } = {}) {
  const p = r4((ph * PI) / 180);
  const curves = [];
  if (env) {
    curves.push({ fn: `sqrt(1 + ${r * r} - ${2 * r}*cos(4*pi*x))`, domain: [z0, 0], color: 'violet', width: 1, dash: [3, 4] });
    curves.push({ fn: `-sqrt(1 + ${r * r} - ${2 * r}*cos(4*pi*x))`, domain: [z0, 0], color: 'violet', width: 1, dash: [3, 4] });
  }
  if (E) curves.push({ fn: `cos(2*pi*x - ${p}) - ${r}*cos(2*pi*x + ${p})`, domain: [z0, 0], color: 'violet', width: 2.4, ...(labels ? { label: 'E', labelAt: z0 + 0.12, labelDy: -2 } : {}) });
  if (B) curves.push({ fn: `cos(2*pi*x - ${p}) + ${r}*cos(2*pi*x + ${p})`, domain: [z0, 0], color: 'teal', width: 2.4, dash: [7, 4], ...(labels ? { label: 'cB', labelAt: z0 + 0.32, labelDy: -2 } : {}) });
  if (S) curves.push({ fn: `(cos(2*pi*x - ${p}))^2 - ${r * r}*(cos(2*pi*x + ${p}))^2`, domain: [z0, 0], color: 'gold', width: 1.6 });
  return {
    type: 'graph',
    params: {
      x: [z0, 0.3], y: [-2.3, 2.3], aspect: 'wide', xlabel: 'z / λ', ylabel: '', yticks: 0, grid: false,
      shade: [{ fn: '2.3', lower: '-2.3', from: 0, to: 0.3, color: 'ink3', alpha: 0.45 }],
      curves,
      points: [{ x: 0.15, y: 1.95, r: 0, label: r === 1 ? 'mirror' : 'surface', labelAlign: 'center', labelDx: 0, labelDy: 0, color: 'ink2' }, ...points],
      vlines,
    },
    caption,
  };
}
