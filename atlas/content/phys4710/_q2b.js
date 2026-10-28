// Shared helpers for the PHYS 4710 lessons M5–M9 (WKB, scattering, quantum
// dynamics, foundations, the relativistic teaser): constants, small numerics
// and picture builders. Every picture is an ordinary sim spec, so the content
// test validates it like any other visual. Not a lesson: the leading
// underscore keeps it out of the registry.
//
// Exact constants are the 2019 SI's; measured ones are CODATA 2022 (Rev. Mod.
// Phys. 97, 025002, 2025), taken through phys4700/_qm.js and phys4710/_q2.js.

import { C, H, HBAR, QE, ME, MP, MU_B, r6, seg, label, ALPHA, EPS0, A0, RYD, EH, KB, MN, G0, MP_ME, RINF } from './_q2.js';
import { blochPic, HBARC_EVNM, HB2M_EVNM2, GAMMA_P, GAMMA_P_HZ, CS_HFS } from '../phys4700/_qm.js';

export { C, H, HBAR, QE, ME, MP, MU_B, r6, seg, label, ALPHA, EPS0, A0, RYD, EH, KB, MN, G0, MP_ME, RINF, blochPic, HBARC_EVNM, HB2M_EVNM2, GAMMA_P, GAMMA_P_HZ, CS_HFS };

const t = String.raw;

export const MEC2_EV = (ME * C * C) / QE;          // eV: 510 998.950…
export const HC_EVNM = 2 * Math.PI * HBARC_EVNM;    // eV nm: 1239.841 98…
export const HBAR_EVS = HBAR / QE;                  // eV s
export const GM_EARTH = 3.986004418e14;             // m³ s⁻², IERS/WGS 84
export const R_EARTH = 6.3710e6;                    // m, mean radius

/** de Broglie wavelength (nm) of a particle of kinetic energy K (eV) and mass m (kg); non-relativistic. */
export const lambdaNm = (K, m = ME) => HC_EVNM / Math.sqrt(2 * ((m * C * C) / QE) * K);

/** A q2b-wkb picture for a question: no controls, readouts optional. */
export const wkbPic = (params, caption) => ({ type: 'q2b-wkb', params: { controls: false, readout: false, ...params }, ...(caption ? { caption } : {}) });

/** A q2b-scatter picture for a question: no controls. */
export const scatPic = (params, caption) => ({ type: 'q2b-scatter', params: { controls: false, readout: false, ...params }, ...(caption ? { caption } : {}) });

/**
 * A potential-energy sketch as a graph: curves [{ fn, domain, color }],
 * an energy line E across [x0, x1], optional shaded forbidden stretches,
 * walls (vertical bars) and labels.
 */
export function potPic({ x, y, curves = [], E = null, Ecolor = 'gold', Elabel = 'E', walls = [], shade = [], points = [], arrows = [], xlabel = 'x (nm)', ylabel = 'energy (eV)', caption, extra = {} }) {
  const cs = curves.map((c) => ({ width: 2.4, color: 'ink2', ...c }));
  for (const w of walls) cs.push(seg(w, y[0], w, y[1], 'ink2', 3));
  if (E) cs.push({ ...seg(E.from, E.y, E.to, E.y, Ecolor, 2), dash: E.dash || [6, 4] });
  const pts = [...points];
  if (E && Elabel) pts.push(E.right ? label(E.to, E.y, Elabel, Ecolor, -6, -10, 'right') : label(E.from, E.y, Elabel, Ecolor, 6, -10));
  return {
    type: 'graph',
    params: { x, y, aspect: 'wide', xlabel, ylabel, axesAt: 'edge', xticks: 5, yticks: 4, curves: cs, shade, points: pts, arrows, ...extra },
    caption,
  };
}

/** Bisection for a continuous f with a sign change on [a, b]. */
export function bisect(f, a, b, n = 200) {
  let fa = f(a);
  for (let i = 0; i < n; i++) {
    const c = 0.5 * (a + b), fc = f(c);
    if ((fc < 0) === (fa < 0)) { a = c; fa = fc; } else b = c;
  }
  return 0.5 * (a + b);
}

/** Composite Simpson's rule on [a, b] with n (even) panels. */
export function simpson(f, a, b, n = 2000) {
  const h = (b - a) / n;
  let s = f(a) + f(b);
  for (let i = 1; i < n; i++) s += (i % 2 ? 4 : 2) * f(a + i * h);
  return (s * h) / 3;
}

/** ∫ f over [a, b] for f with square-root behaviour at the ends (x = c − d cos θ, then Simpson in θ). */
export function endInt(f, a, b, n = 2000) {
  const c = (a + b) / 2, d = (b - a) / 2;
  return simpson((th) => f(c - d * Math.cos(th)) * d * Math.sin(th), 0, Math.PI, n);
}

void t;
