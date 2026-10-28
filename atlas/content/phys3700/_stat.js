// Constants, distributions and picture builders for the PHYS 3700 lessons of
// modules T6–T7 (Boltzmann statistics, quantum statistics). Every number a
// lesson prints is computed from these; every picture builder returns an
// ordinary `graph` spec, which the content test validates like any other.
// Not a lesson: the leading underscore keeps it out of the lesson registry.
//
// Sources: CODATA 2022 (constants); NIST Atomic Spectra Database (atomic
// levels); NASA planetary fact sheets (masses, radii, escape speeds); Fixsen
// 2009 (CMB temperature); IAU 2015 nominal solar values; Kittel, Introduction
// to Solid State Physics, 8th ed., Tables 5.1 and 6.3 (Debye temperatures,
// electronic heat-capacity coefficients); NIST Cryogenic Material Properties
// (the OFHC-copper specific-heat fit, 4–300 K).

import { KB, H, HBAR, CL, AMU, EV, G, R, NA, HCK, DIATOMIC, r4, lab, texNum, apart } from './_count.js';
export { KB, H, HBAR, CL, AMU, EV, G, R, NA, HCK, DIATOMIC, r4, lab, texNum, apart };

// ─── constants ─────────────────────────────────────────────────────────────
export const ME = 9.1093837139e-31;        // kg, electron (CODATA 2022)
export const MPROTON = 1.67262192595e-27;  // kg, proton (CODATA 2022)
export const MNEUTRON = 1.67492750056e-27; // kg, neutron (CODATA 2022)
export const MSUN = 1.98841e30;            // kg (IAU nominal GM☉ / G)
export const KEV = KB / EV;                // eV per kelvin, 8.617 333…×10⁻⁵
export const SIGMA = (2 * Math.PI ** 5 * KB ** 4) / (15 * H ** 3 * CL ** 2);   // W m⁻² K⁻⁴, 5.670 374…×10⁻⁸
export const ARAD = (4 * SIGMA) / CL;      // J m⁻³ K⁻⁴, the radiation constant a = 4σ/c
export const ZETA3 = 1.2020569031595942;   // ζ(3)
export const ZETA32 = 2.612375348685488;   // ζ(3/2)
export const T_CMB = 2.72548;              // K, Fixsen (2009)
export const T_SUN = 5772;                 // K, IAU 2015 nominal effective temperature
export const R_SUN = 6.957e8;              // m, IAU 2015 nominal radius
export const AU = 1.495978707e11;          // m

/** Bodies for escape problems (NASA planetary fact sheets): GM in m³/s², mean radius in m, surface gravity in m/s². */
export const BODY = {
  earth: { name: 'Earth', GM: 3.986004418e14, R: 6.371e6 },
  moon: { name: 'the Moon', GM: 4.9028e12, R: 1.7374e6 },
  mars: { name: 'Mars', GM: 4.282837e13, R: 3.3895e6 },
  titan: { name: 'Titan', GM: 8.978e12, R: 2.5747e6 },
  mercury: { name: 'Mercury', GM: 2.2032e13, R: 2.4397e6 },
};
export const vEsc = (b, h = 0) => Math.sqrt((2 * BODY[b].GM) / (BODY[b].R + h));
export const gSurf = (b) => BODY[b].GM / BODY[b].R ** 2;

/** Molecular and atomic masses, u. */
export const MASS = { H: 1.00794, He: 4.002602, N2: 28.0134, O2: 31.9988, O: 15.999, Ar: 39.948, CO2: 44.0095, H2: 2.01588, Xe: 131.293, Rb87: 86.909180531, He4: 4.00260325413, Na23: 22.98976928 };

// ─── Maxwell speeds ────────────────────────────────────────────────────────
export const vMostProbable = (mU, T) => Math.sqrt((2 * KB * T) / (mU * AMU));
export const vMean = (mU, T) => Math.sqrt((8 * KB * T) / (Math.PI * mU * AMU));
export const vRms = (mU, T) => Math.sqrt((3 * KB * T) / (mU * AMU));

/** The complementary error function (Numerical Recipes erfcc: fractional error below 1.2 × 10⁻⁷ everywhere). */
export function erfc(x) {
  const z = Math.abs(x), t = 1 / (1 + 0.5 * z);
  const r = t * Math.exp(-z * z - 1.26551223 + t * (1.00002368 + t * (0.37409196 + t * (0.09678418 + t * (-0.18628806 + t * (0.27886807 + t * (-1.13520398 + t * (1.48851587 + t * (-0.82215223 + t * 0.17087277)))))))));
  return x >= 0 ? r : 2 - r;
}
export const erf = (x) => 1 - erfc(x);
/** The fraction of a Maxwell gas faster than x times the most probable speed. */
export const tailFrac = (x) => erfc(x) + (2 / Math.sqrt(Math.PI)) * x * Math.exp(-x * x);
/** Its natural log, safe for large x (where the fraction underflows). */
export const lnTail = (x) => (x < 8 ? Math.log(tailFrac(x)) : -x * x + Math.log((2 * x) / Math.sqrt(Math.PI) * (1 + 1 / (2 * x * x))));

// ─── quantum gases ─────────────────────────────────────────────────────────
/** The quantum volume v_Q = (h/√(2πmkT))³, m in kg. */
export const vQ = (m, T) => (H / Math.sqrt(2 * Math.PI * m * KB * T)) ** 3;
/** The Fermi energy (J) of spin-½ fermions of mass m at number density n. */
export const fermiE = (n, m = ME) => ((H * H) / (8 * m)) * ((3 * n) / Math.PI) ** (2 / 3);
/** The BEC temperature (K) of an ideal spin-0 Bose gas of mass m at density n. */
export const becTc = (n, m) => ((H * H) / (2 * Math.PI * m * KB)) * (n / ZETA32) ** (2 / 3);
/** Fermi–Dirac, Bose–Einstein and Boltzmann occupancies at x = (ε − μ)/kT. */
export const nFD = (x) => 1 / (Math.exp(x) + 1);
export const nBE = (x) => 1 / (Math.exp(x) - 1);
export const nMB = (x) => Math.exp(-x);

// ─── solids ────────────────────────────────────────────────────────────────
/** Einstein-solid molar C_V/(3R) at t = T/θ_E. */
export const einsteinC = (t) => { const u = 1 / t; return u > 300 ? 0 : (u * u * Math.exp(u)) / (Math.exp(u) - 1) ** 2; };
/** Debye molar C_V/(3R) at t = T/θ_D (Simpson's rule on the Debye integral). */
export function debyeC(t) {
  const u = 1 / t, n = 600, h = u / n;
  let s = 0;
  for (let i = 0; i <= n; i++) {
    const x = i === 0 ? 1e-9 : i * h;
    const f = x > 600 ? 0 : (x ** 4 * Math.exp(x)) / Math.expm1(x) ** 2;
    s += (i === 0 || i === n ? 1 : i % 2 ? 4 : 2) * f;
  }
  return 3 * t ** 3 * ((s * h) / 3);
}
/** The Debye integral ∫₀^u x⁴eˣ/(eˣ − 1)² dx as expression text of the graph variable (t = T/θ is `tv`), for curves: Gauss–Legendre above t = 0.06, the T³ law below. */
export function debyeCExpr(tv = 'x', n = 20) {
  const [xs, ws] = gaussLegendre(n);
  const u = `(1/(${tv}))`;
  const terms = xs.map((s, i) => {
    const a = r6((s + 1) / 2), w = r6(ws[i] / 2);
    return `${w}*(${a}*${u})^4*e^(${a}*${u})/(e^(${a}*${u}) - 1)^2`;
  });
  const quad = `3*(${tv})^3*${u}*(${terms.join(' + ')})`;
  return `step(${tv} - 0.06)*${quad} + step(0.06 - ${tv})*${r6((4 * Math.PI ** 4) / 5)}*(${tv})^3`;
}
const r6 = (v) => +(+v).toPrecision(9);
function gaussLegendre(n) {
  const xs = [], ws = [];
  for (let i = 1; i <= n; i++) {
    let x = Math.cos((Math.PI * (i - 0.25)) / (n + 0.5)), dp = 0;
    for (let it = 0; it < 100; it++) {
      let p0 = 1, p1 = x;
      for (let k = 2; k <= n; k++) { const p2 = ((2 * k - 1) * x * p1 - (k - 1) * p0) / k; p0 = p1; p1 = p2; }
      dp = (n * (x * p1 - p0)) / (x * x - 1);
      const dx = p1 / dp; x -= dx;
      if (Math.abs(dx) < 1e-15) break;
    }
    xs.push(x); ws.push(2 / ((1 - x * x) * dp * dp));
  }
  return [xs, ws];
}

/** Copper: Debye temperature (K, Kittel Table 5.1), electronic γ (J mol⁻¹ K⁻², Kittel Table 6.3), molar mass (kg/mol). */
export const CU = { theta: 343, gamma: 0.695e-3, M: 0.063546 };
/** Debye T³ coefficient per mole: C = βT³ with β = 12π⁴R/(5θ³). */
export const debyeBeta = (theta) => (12 * Math.PI ** 4 * R) / (5 * theta ** 3);
/** Debye temperatures, K (Kittel Table 5.1). */
export const THETA_D = { Cu: 343, Al: 428, Ag: 225, Au: 165, Pb: 105, Fe: 470, Si: 645, C: 2230 };
// NIST's fit for OFHC copper, 4–300 K: log₁₀ c = Σ aᵢ (log₁₀ T)ⁱ, c in J/(kg K)
const CU_FIT = [-1.91844, -0.15973, 8.61013, -18.996, 21.9661, -12.7328, 3.54322, -0.3797];
/** OFHC copper's measured specific heat (NIST fit), J/(kg K). */
export const cuSpecific = (T) => { const x = Math.log10(T); return 10 ** CU_FIT.reduce((s, a, i) => s + a * x ** i, 0); };
/** The same as expression text of the graph variable Tv. */
export const cuSpecificExpr = (Tv = 'x') => `10^(${CU_FIT.map((a, i) => `(${a})*(log10(${Tv}))^${i}`).join(' + ')})`;

// ─── radiation ─────────────────────────────────────────────────────────────
/** Photon energy density (J/m³) and number density (m⁻³) of blackbody radiation at T. */
export const uRad = (T) => ARAD * T ** 4;
export const nPhoton = (T) => ((2 * ZETA3) / Math.PI ** 2) * ((KB * T) / (HBAR * CL)) ** 3;

// ─── pictures ──────────────────────────────────────────────────────────────

/** A label-only point. */
export const tag = (x, y, text, color = 'ink2', dx = 0, dy = 0) => ({ x: r4(x), y: r4(y), r: 0.01, color, label: text, labelDx: dx, labelDy: dy });

/**
 * An energy ladder: each level a horizontal bar at its energy, as long as its
 * share of the population (or its Boltzmann weight). levels: [{ E, p, g, label, color }].
 */
export function ladderPic(levels, { y, x = [0, 1.15], xlabel = 'share of the population', ylabel = 'energy', caption, alt, showG = true, extra = {} } = {}) {
  const curves = [], points = [];
  for (const L of levels) {
    curves.push({ fn: String(r4(L.E)), domain: [0, x[1]], color: 'ink4', width: 1, dash: true });
    curves.push({ fn: String(r4(L.E)), domain: [0, Math.max(0.004, r4(L.p))], color: L.color || 'accent', width: 7 });
    const text = [L.label, showG && L.g ? `g = ${L.g}` : ''].filter(Boolean).join(', ');
    if (text) points.push(tag(Math.max(0.004, L.p), L.E, text, 'ink2', 8, -9));
  }
  return {
    type: 'graph',
    params: { x, y, aspect: 'wide', axesAt: 'edge', xlabel, ylabel, curves: [...curves, ...(extra.curves || [])], points: [...points, ...(extra.points || [])], ...(extra.params || {}), alt: alt || 'Energy levels drawn as bars whose lengths are their populations' },
    caption,
  };
}

/** The Maxwell distribution D(v) (per km/s) for a gas of mass mU (u) at T, speed in km/s; optional shaded tail above vcut (km/s). */
export function maxwellExpr(mU, T, v = 'x') {
  const a = (mU * AMU) / (2 * KB * T) * 1e6;       // m/(2kT) in (km/s)⁻²
  return `${r6(4 * Math.PI * (a / Math.PI) ** 1.5)}*(${v})^2*e^(-${r6(a)}*(${v})^2)`;
}
export function maxwellPic({ gases, vmax, vcut = null, cutLabel = 'escape speed', marks = false, caption, alt, ymax = null, extra = {} }) {
  const curves = [], shade = [], vlines = [];
  let top = 0;
  for (const g of gases) {
    const fn = maxwellExpr(g.m, g.T);
    curves.push({ fn, domain: [0, vmax], color: g.color || 'accent', width: 2.4, ...(g.label ? { label: g.label, labelAt: r4(vMostProbable(g.m, g.T) / 1000 * (g.at ?? 1.35)), labelDx: 6, labelDy: -6 } : {}) });
    top = Math.max(top, 4 / Math.sqrt(Math.PI) / (vMostProbable(g.m, g.T) / 1000) * Math.exp(-1));
    if (vcut !== null && g.shade !== false) shade.push({ fn, lower: '0', from: r4(vcut), to: vmax, color: g.color || 'accent', alpha: 0.35 });
    if (marks) {
      const vp = vMostProbable(g.m, g.T) / 1000, vb = vMean(g.m, g.T) / 1000, vr = vRms(g.m, g.T) / 1000;
      vlines.push({ x: r4(vp), color: 'ink3', label: 'vₚ' }, { x: r4(vb), color: 'ink3', label: 'v̄' }, { x: r4(vr), color: 'ink3', label: 'vᵣₘₛ' });
    }
  }
  if (vcut !== null) vlines.push({ x: r4(vcut), color: 'warn', label: cutLabel });
  return {
    type: 'graph',
    params: { x: [0, vmax], y: [0, r4(ymax ?? top * 1.2)], aspect: 'wide', axesAt: 'edge', xlabel: 'speed v (km/s)', ylabel: 'D(v) (per km/s)', curves: [...curves, ...(extra.curves || [])], shade, vlines: [...vlines, ...(extra.vlines || [])], points: extra.points || [], ...(extra.params || {}), alt: alt || 'The Maxwell speed distribution' },
    caption,
  };
}

/** Occupancy against x = (ε − μ)/kT: Fermi–Dirac, Bose–Einstein, Boltzmann. */
export function occPic({ which = ['fd', 'be', 'mb'], x = [-3, 4], y = [0, 2.2], marks = [], caption, alt, labels = true, extra = {} } = {}) {
  const C = {
    fd: { fn: '1/(e^x + 1)', domain: [x[0], x[1]], color: 'accent', label: 'Fermi–Dirac', labelAt: -2.2, labelDy: 14 },
    be: { fn: '1/(e^x - 1)', domain: [Math.max(0.12, x[0]), x[1]], color: 'warn', label: 'Bose–Einstein', labelAt: 0.75, labelDx: 8 },
    mb: { fn: 'e^(-x)', domain: [Math.max(x[0], -0.8), x[1]], color: 'ink3', dash: true, label: 'Boltzmann', labelAt: -0.6, labelDx: 8, labelDy: -2 },
  };
  const curves = which.map((k) => { const c = { ...C[k] }; if (!labels) { delete c.label; delete c.labelAt; } return c; });
  return {
    type: 'graph',
    params: { x, y, aspect: 'wide', axesAt: 'edge', xlabel: '(ε − μ) / kT', ylabel: 'mean occupancy n̄', curves: [...curves, ...(extra.curves || [])], vlines: [{ x: 0, color: 'ink4' }, ...(extra.vlines || [])], hlines: [{ y: 1, color: 'ink4' }, ...(extra.hlines || [])], points: [...marks, ...(extra.points || [])], ...(extra.params || {}), alt: alt || 'Mean occupancy of a single-particle state for fermions, bosons and classical particles' },
    caption,
  };
}
