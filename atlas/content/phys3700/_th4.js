// Constants, formulas and picture builders for the PHYS 3700 lessons of
// modules T8–T11 (the Ising model, Monte Carlo, ensembles and information,
// transport, stars and black holes) and for the course boss. Every number a
// lesson prints is computed from these. Not a lesson: the leading underscore
// keeps it out of the lesson registry.
//
// Sources: CODATA 2022 (constants); IAU 2015 nominal solar values; NASA Moon
// fact sheet (lunar mass); Fixsen (2009) for the CMB temperature; the U.S.
// Standard Atmosphere 1976 (temperature, number density, and its mean free
// path with an effective collision diameter of 3.65 × 10⁻¹⁰ m); Onsager (1944)
// and Yang (1952) for the square-lattice Ising model, Houtappel (1950) for the
// honeycomb and triangular lattices; the Lane–Emden n = 3 constant
// ω₃ = 2.01824 (Chandrasekhar 1939); Hawking (1975) and Bekenstein (1973) for
// black-hole temperature and entropy — a theoretical prediction: Hawking
// radiation has never been observed.

import { KB, H, HBAR, CL, G, EV, AMU, ME, MPROTON, MSUN, T_CMB, SIGMA, R_SUN, r4, texNum, apart, lab } from './_stat.js';
export { KB, H, HBAR, CL, G, EV, AMU, ME, MPROTON, MSUN, T_CMB, SIGMA, R_SUN, r4, texNum, apart, lab };

export const MEV = 1e-3 * EV;               // J per meV
export const YEAR = 3.15576e7;              // s, a Julian year
export const MOON = 7.346e22;               // kg (NASA Moon fact sheet)
export const EARTH = 5.9722e24;             // kg (NASA Earth fact sheet)
export const LN2 = Math.LN2;

// ─── Ising ─────────────────────────────────────────────────────────────────
/** Exact critical temperatures kT_c/J of the 2D Ising model (Onsager 1944; Houtappel 1950). */
export const TC_SQUARE = 2 / Math.log(1 + Math.SQRT2);    // 2.269 185
export const TC_HONEY = 2 / Math.log(2 + Math.sqrt(3));   // 1.518 651
export const TC_TRI = 4 / Math.log(3);                    // 3.640 957
/** Yang's spontaneous magnetization of the square lattice at kT/J = x (0 at and above T_c). */
export const yang = (x) => (x >= TC_SQUARE ? 0 : (1 - Math.sinh(2 / x) ** -4) ** 0.125);
/** Yang's curve as graph expression text in x (kT/J), for x below T_c. */
export const YANG_EXPR = '(1 - 1/sinh(2/x)^4)^0.125';
/** The mean-field magnetization: the positive root of m = tanh(z m / t). */
export function mfM(t, z = 4) {
  let m = 1;
  for (let k = 0; k < 5000; k++) { const n = Math.tanh((z * m) / t); if (Math.abs(n - m) < 1e-14) return n; m = n; }
  return m;
}

/** A row of spins as up and down arrows: spins is a list of ±1. */
export function chainPic(spins, { caption, alt, ring = false, mark = null } = {}) {
  const N = spins.length;
  const arrows = spins.map((s, i) => ({ from: [i + 1, r4(-0.42 * s)], to: [i + 1, r4(0.42 * s)], color: s > 0 ? 'accent' : 'warn', width: 3 }));
  const points = [];
  if (mark !== null) points.push({ x: mark + 1, y: -0.75, r: 0.01, color: 'gold', label: '▲', labelDx: -5, labelDy: 0 });
  const curves = [{ fn: '0', domain: [0.6, N + 0.4], color: 'ink4', width: 1, dash: true }];
  if (ring) curves.push({ param: [`${(N + 1) / 2} + ${(N - 1) / 2}*cos(t)`, `-0.62 + 0.12*sin(t)`], t: [Math.PI, 2 * Math.PI], color: 'ink3', width: 1.2, dash: true });
  return {
    type: 'graph',
    params: { x: [0.3, N + 0.7], y: [-0.85, 0.75], aspect: 'wide', axes: false, grid: false, xlabel: '', ylabel: '', arrows, points, curves, alt: alt || `A row of ${N} spins, each pointing up or down` },
    caption,
  };
}

/** One spin (centre) and its four neighbours on a square lattice, as arrows. */
export function crossPic(centre, nbs, { caption, alt } = {}) {
  const pos = [[0, 1], [1, 0], [0, -1], [-1, 0]];
  const arrows = [[0, 0, centre], ...pos.map(([x, y], k) => [x, y, nbs[k]])].map(([x, y, s], k) => ({ from: [x, r4(y - 0.3 * s)], to: [x, r4(y + 0.3 * s)], color: k === 0 ? 'gold' : s > 0 ? 'accent' : 'warn', width: k === 0 ? 4 : 3 }));
  const curves = [{ fn: '0', domain: [-1.6, 1.6], color: 'ink4', width: 1, dash: true }, { param: ['0', 't'], t: [-1.6, 1.6], color: 'ink4', width: 1, dash: true }];
  return {
    type: 'graph',
    params: { x: [-2.6, 2.6], y: [-1.5, 1.5], aspect: 'wide', axes: false, grid: false, xlabel: '', ylabel: '', equal: true, arrows, curves, alt: alt || 'A spin, drawn gold, with its four nearest neighbours' },
    caption,
  };
}

/** A th4-ising picture: static by default. */
export const isingPic = (params, caption) => ({ type: 'th4-ising', params: { play: false, readout: false, controls: false, ...params }, ...(caption ? { caption } : {}) });

// ─── stars ─────────────────────────────────────────────────────────────────
export const OMEGA3 = 2.01824;              // −ξ²θ′ at the surface of the n = 3 Lane–Emden polytrope
/** The Planck mass cubed, (ħc/G)^(3/2), kg³. */
export const MPL3 = ((HBAR * CL) / G) ** 1.5;
/** The Chandrasekhar mass (kg) for μ_e nucleons per electron, mass per nucleon m. */
export const chandra = (mue = 2, m = MPROTON) => ((Math.sqrt(3 * Math.PI) / 2) * OMEGA3 * MPL3) / (mue * m) ** 2;

// ─── black holes (theory: Hawking radiation has never been observed) ──────
/** Schwarzschild radius, m. */
export const rs = (M) => (2 * G * M) / (CL * CL);
/** Hawking temperature, K. */
export const hawkingT = (M) => (HBAR * CL ** 3) / (8 * Math.PI * G * M * KB);
/** Bekenstein–Hawking entropy over k: 4πGM²/(ħc). */
export const bhS = (M) => (4 * Math.PI * G * M * M) / (HBAR * CL);
/** Heat capacity d(Mc²)/dT_H, J/K (negative). */
export const bhC = (M) => (-8 * Math.PI * G * M * M * KB) / (HBAR * CL);
/** Blackbody power from the horizon area at T_H (photons only, no greybody factors), W: ħc⁶/(15360πG²M²). */
export const bhP = (M) => (HBAR * CL ** 6) / (15360 * Math.PI * G * G * M * M);
/** Evaporation time on the same photons-only estimate, s: 5120πG²M³/(ħc⁴). */
export const bhLife = (M) => (5120 * Math.PI * G * G * M ** 3) / (HBAR * CL ** 4);
/** The mass whose Hawking temperature equals the CMB's, kg (about 0.6 Moon masses). */
export const M_CROSS = (HBAR * CL ** 3) / (8 * Math.PI * G * KB * T_CMB);
/** log₁₀ T_H as graph expression text in x = log₁₀(M/kg). */
export const LOG_TH_EXPR = `${r4(Math.log10(hawkingT(1)))} - x`;

// ─── the atmosphere (U.S. Standard Atmosphere 1976) ────────────────────────
/** Geometric altitude (km), kinetic temperature (K), number density (m⁻³), mean molar mass (g/mol). */
export const ATM76 = [
  { z: 0, T: 288.15, n: 2.5469e25, M: 28.96 },
  { z: 25, T: 221.55, n: 8.3344e23, M: 28.96 },
  { z: 50, T: 270.65, n: 2.1353e22, M: 28.96 },
  { z: 75, T: 208.40, n: 8.3015e20, M: 28.96 },
  { z: 86, T: 186.87, n: 1.4472e20, M: 28.95 },
  { z: 100, T: 195.08, n: 1.1883e19, M: 28.39 },
  { z: 120, T: 360.00, n: 5.1050e17, M: 26.19 },
  { z: 150, T: 634.39, n: 5.1851e16, M: 24.10 },
  { z: 200, T: 854.56, n: 7.1807e15, M: 21.30 },
  { z: 250, T: 941.33, n: 1.9057e15, M: 19.19 },
  { z: 300, T: 976.01, n: 6.5072e14, M: 17.72 },
  { z: 350, T: 990.06, n: 2.5237e14, M: 16.74 },
  { z: 400, T: 995.83, n: 1.0559e14, M: 15.98 },
  { z: 450, T: 998.22, n: 4.6778e13, M: 15.25 },
  { z: 500, T: 999.24, n: 2.1911e13, M: 14.33 },
];
export const atmAt = (z) => ATM76.find((r) => r.z === z);
/** log₁₀ of a column of the table as graph expression text in x (altitude, km), linear between rows. */
export function atmExpr(f, xv = 'x') {
  const R = ATM76.map((r) => [r.z, Math.log10(f(r))]);
  return R.slice(0, -1).map(([a, la], i) => { const [b, lb] = R[i + 1]; const a0 = i === 0 ? a - 1 : a, b0 = i === R.length - 2 ? b + 1 : b;
    return `step(${xv} - ${a0})*step(${b0} - ${xv})*(${r4(la)} + ${r4((lb - la) / (b - a))}*(${xv} - ${a}))`; }).join(' + ');
}
export const D_EFF = 3.65e-10;              // m, the 1976 standard's effective collision diameter
/** Mean free path λ = 1/(√2 π d² n), m. */
export const mfp = (n, d = D_EFF) => 1 / (Math.SQRT2 * Math.PI * d * d * n);

// ─── black-hole pictures (shared by T11.2's style and the boss) ───────────
/** Predicted Hawking temperature against mass on log axes, with the CMB line, the crossover, and an optional marked mass. */
export function hawkingPic({ M = null, caption, cross = true, x = [8, 38], y = [-16, 16] } = {}) {
  const lt1 = r4(Math.log10(hawkingT(1)));
  return {
    type: 'graph',
    params: {
      x, y, aspect: 'wide', axesAt: 'edge', xlog: true, ylog: true, xlabel: 'mass (kg)', ylabel: 'Hawking temperature (K)',
      curves: [{ fn: `${lt1} - x`, domain: x, color: 'violet', width: 2.4 }],
      hlines: [{ y: r4(Math.log10(T_CMB)), color: 'warn', label: 'CMB today, 2.725 K' }],
      vlines: [...(cross ? [{ x: r4(Math.log10(M_CROSS)), color: 'ink4' }] : []), ...(M === null ? [] : [{ x: r4(Math.log10(M)), color: 'gold' }])],
    },
    caption: caption || 'Predicted Hawking temperature against mass (log axes): T ∝ 1/M. The grey line is the crossover, about 0.6 Moon masses, where a hole is exactly as warm as the CMB. Theory: never observed.',
  };
}
/** Bekenstein–Hawking entropy against mass on log axes (slope 2), with an optional marked mass. */
export function entropyPic({ M = null, caption, x = [10, 32] } = {}) {
  const ls1 = r4(Math.log10(bhS(1)));
  return {
    type: 'graph',
    params: {
      x, y: [ls1 + 2 * x[0], ls1 + 2 * x[1]], aspect: 'wide', axesAt: 'edge', xlog: true, ylog: true, xlabel: 'mass (kg)', ylabel: 'entropy S / k',
      curves: [{ fn: `${ls1} + 2*x`, domain: x, color: 'violet', width: 2.4 }],
      vlines: M === null ? [] : [{ x: r4(Math.log10(M)), color: 'gold' }],
    },
    caption: caption || 'Bekenstein–Hawking entropy against mass on log axes: a line of slope 2, since S ∝ M². Theory.',
  };
}
