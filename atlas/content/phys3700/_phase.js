// Data and pictures for the PHYS 3700 lessons of modules T3–T5: phase
// boundaries of water, carbon dioxide, oxygen and para-hydrogen; steam states
// for the Rankine cycle; throttling and liquefaction numbers; standard
// thermochemical values; and NASA polynomials for gas-phase Gibbs energies at
// combustion temperatures. Lessons compute every derived number from these.
// Not a lesson: the leading underscore keeps it out of the lesson registry.
//
// Sources (cited again in each lesson's references):
// - Fluid properties: the reference equations of state used by the NIST
//   Chemistry WebBook (IAPWS-95 for water, Span & Wagner 1996 for CO₂, Schmidt &
//   Wagner 1985 for O₂, Leachman et al. 2009 for para-hydrogen), evaluated with
//   CoolProp 8.0, which implements the same equations. Vapour-pressure and
//   melting curves below are least-squares fits to those equations (fit errors
//   noted beside each).
// - Sublimation: IAPWS R14-08 (2011) for ice; Span & Wagner (1996) eq. 3.12 for
//   dry ice. Both checked against independent facts: 611.15 Pa over ice at 0 °C;
//   dry ice sublimes at 194.69 K under one atmosphere.
// - Standard enthalpies and entropies at 298.15 K and 1 bar: CODATA Key Values
//   for Thermodynamics (Cox, Wagman & Medvedev 1989); carbon allotropes from the
//   NBS tables (Wagman et al. 1982), as quoted by Schroeder.
// - Gas Gibbs energies at high temperature: NASA 7-coefficient polynomials of
//   McBride, Gordon & Reno, NASA TM-4513 (1993) — the data behind NASA's CEA
//   program; they agree with the NIST-JANAF tables to a few tenths of a kJ/mol.

import { R, KB, NA, ATM } from './_count.js';
export { R, KB, NA, ATM };

const r4 = (v) => +(+v).toFixed(4);
const g6 = (v) => +(+v).toPrecision(6);
export const FARADAY = 1.602176634e-19 * 6.02214076e23;   // C/mol, exact (e·N_A)
export const BAR = 1e5;

// ─── pure substances ───────────────────────────────────────────────────────
// Tt, Pt: triple point (K, Pa); Tc, Pc: critical point; M: kg/mol; Tb: normal
// boiling point at 101 325 Pa; Lb: latent heat of vaporization there (J/mol);
// Ltp: the same at the triple point; rhoL, rhoV: boiling liquid and vapour
// densities at Tb (kg/m³).
// vap: log₁₀(P/Pa) = a + b/T + c log₁₀T + d T from triple to critical point
//      (largest error: water 0.9 %, CO₂ 0.2 %, O₂ 0.5 %, H₂ 0.3 %).
// melt: T(K) = m0 + m1 p + m2 p² + m3 p³ with p in MPa, up to 100 MPa (H₂: 30 MPa)
//      (largest error under 0.01 K).
export const SUBST = {
  water: { name: 'water', formula: 'H₂O', Tt: 273.16, Pt: 611.655, Tc: 647.096, Pc: 22.064e6, M: 0.0180153, Tb: 373.12, Lb: 40650, Ltp: 45050, rhoL: 958.4, rhoV: 0.5977,
    vap: [43.456079, -3442.647, -12.056937, 0.0047835818], melt: [273.16, -0.0743253, -0.000155731, 3.85318e-08], meltTop: 100e6 },
  co2: { name: 'carbon dioxide', formula: 'CO₂', Tt: 216.592, Pt: 517950, Tc: 304.128, Pc: 7.3773e6, M: 0.0440098, Tsub: 194.69, Lb: 17440, Ltp: 15420, rhoL: 1285, rhoV: 2.958,
    vap: [59.956957, -2033.2014, -20.814553, 0.017357938], melt: [216.482, 0.213863, -0.000212863, 2.9227e-07], meltTop: 100e6 },
  o2: { name: 'oxygen', formula: 'O₂', Tt: 54.361, Pt: 146.28, Tc: 154.581, Pc: 5.043e6, M: 0.0319988, Tb: 90.188, Lb: 6818, Ltp: 7767, rhoL: 1141, rhoV: 4.467,
    vap: [23.03778, -529.9073, -6.8223523, 0.013105357], melt: [54.3592, 0.114953, -9.12795e-05, 1.19831e-07], meltTop: 80e6 },
  h2: { name: 'para-hydrogen', formula: 'H₂', Tt: 13.8033, Pt: 7041, Tc: 32.938, Pc: 1.2858e6, M: 0.00201588, Tb: 20.271, Lb: 899.2, Ltp: 907.3, rhoL: 70.83, rhoV: 1.339,
    vap: [6.5814943, -43.695666, 0.14696482, 0.01912585], melt: [13.807, 0.327005, -0.00296141, 2.56869e-05], meltTop: 30e6 },
};
// Saturation temperatures read straight from the reference equations (K), for checking Clausius–Clapeyron estimates.
export const TSAT = {
  water: { 33.7e3: 344.94, 70e3: 363.08, 2e5: 393.36 },
  o2: { 2e5: 97.236, 3e5: 102.02, 3.5e5: 103.98, 5e5: 108.81 },
  h2: { 2e5: 22.802, 3e5: 24.566, 3.5e5: 25.294, 5e5: 27.112 },
};

/** Vapour pressure (Pa) on the liquid–gas curve at T (K), triple to critical point. */
export function vapP(key, T) {
  const [a, b, c, d] = SUBST[key].vap;
  return 10 ** (a + b / T + c * Math.log10(T) + d * T);
}
/** The same as expression text: log₁₀(P/Pa) as a function of the expression Tv. */
export function vapExpr(key, Tv = 'x') {
  const [a, b, c, d] = SUBST[key].vap;
  return `${a} + (${b})/(${Tv}) + (${c})*log10(${Tv}) + (${d})*(${Tv})`;
}
/** Melting temperature (K) at pressure P (Pa). */
export function meltT(key, P) {
  const m = SUBST[key].melt, p = P / 1e6;
  return m[0] + m[1] * p + m[2] * p * p + m[3] * p ** 3;
}
/** Melting temperature as expression text of p (MPa). */
export function meltExpr(key, p = 'p') {
  const m = SUBST[key].melt;
  return `${m[0]} + (${m[1]})*(${p}) + (${m[2]})*(${p})^2 + (${m[3]})*(${p})^3`;
}
/** Sublimation pressure (Pa) at T below the triple point: IAPWS 2011 (ice), Span–Wagner (dry ice), else Clausius–Clapeyron with Ltp (rough). */
export function subP(key, T) {
  const s = SUBST[key];
  if (key === 'water') {
    const th = T / s.Tt;
    return s.Pt * Math.exp((-21.2144006 * th ** 0.00333333333 + 27.3203819 * th ** 1.20666667 - 6.1059813 * th ** 1.70333333) / th);
  }
  if (key === 'co2') {
    const th = 1 - T / s.Tt;
    return s.Pt * Math.exp((s.Tt / T) * (-14.740846 * th + 2.4327015 * th ** 1.9 - 5.3061778 * th ** 2.9));
  }
  return s.Pt * Math.exp((-s.Ltp / R) * (1 / T - 1 / s.Tt));
}
/** Sublimation curve as expression text: log₁₀(P/Pa) of the expression Tv. */
export function subExpr(key, Tv = 'x') {
  const s = SUBST[key], T = `(${Tv})`;
  if (key === 'water') { const th = `(${T}/${s.Tt})`; return `log10(${s.Pt}) + (-21.2144006*${th}^0.00333333333 + 27.3203819*${th}^1.20666667 - 6.1059813*${th}^1.70333333)/${th}/ln(10)`; }
  if (key === 'co2') { const th = `(1 - ${T}/${s.Tt})`; return `log10(${s.Pt}) + (${s.Tt}/${T})*(-14.740846*${th} + 2.4327015*${th}^1.9 - 5.3061778*${th}^2.9)/ln(10)`; }
  return `log10(${s.Pt}) - ${r4(s.Ltp / R)}*(1/${T} - 1/${s.Tt})/ln(10)`;
}
/** Which phase is stable at (T, P): 'solid', 'liquid', 'gas' or 'supercritical' (above both Tc and Pc). Ice Ih only for water. */
export function phaseAt(key, T, P) {
  const s = SUBST[key];
  if (T < s.Tt) return P < subP(key, T) ? 'gas' : T < meltT(key, P) ? 'solid' : 'liquid';
  if (T < s.Tc ? P < vapP(key, T) : P < s.Pc) return 'gas';
  if (T < meltT(key, P)) return 'solid';
  return T >= s.Tc ? 'supercritical' : 'liquid';
}

// ─── Clausius–Clapeyron (vapour as an ideal gas, liquid volume neglected, L constant) ──
/** Boiling temperature (K) at pressure P, from a known point (T0, P0) and molar latent heat L (J/mol). */
export const ccT = (T0, P0, L, P) => 1 / (1 / T0 - (R / L) * Math.log(P / P0));
/** Vapour pressure (Pa) at T from a known point. */
export const ccP = (T0, P0, L, T) => P0 * Math.exp((-L / R) * (1 / T - 1 / T0));

// ─── water and ice near 0 °C ───────────────────────────────────────────────
// Ice Ih density 917 kg/m³ and liquid 999.84 kg/m³ at 0 °C (CRC Handbook);
// latent heat of fusion 334 kJ/kg (rounded, as in PHYS 2210).
export const ICE = { rhoIce: 917, rhoWater: 999.84, Lf: 334e3, Tm: 273.15 };

// ─── the Rankine cycle: steam states (IAPWS-95, via the NIST WebBook equations) ─
// Turbine inlet 10 MPa and 500 °C; condenser 10 kPa. h in kJ/kg, s in kJ/(kg K).
export const STEAM = {
  pb: 10e6, pc: 10e3, Tc: 45.81, Tsat: 311.00, Tin: 500,
  h1: 191.81, v1: 0.0010103, s1: 0.6492,           // saturated liquid leaving the condenser
  h2: 201.88,                                       // compressed liquid after an isentropic pump
  h3: 3375.1, s3: 6.5995,                           // superheated steam at the turbine inlet
  hf: 191.81, hg: 2583.9, sf: 0.6492, sg: 8.1488,   // saturated liquid and vapour at 10 kPa
  sf10: 3.3606, sg10: 5.6160,                       // saturated liquid and vapour at 10 MPa
};
// Steam T–s dome: s(kJ/(kg K)) = Σ cᵢ uⁱ with u = (1 − T/647.096 K)^(1/3), both branches through the
// critical point (s = 4.407); error ≤ 0.006 (liquid) and 0.021 (vapour) kJ/(kg K).
const DOME_F = [4.407, -1.773618, 4.92776, -38.61218, 128.1528, -251.3587, 250.3851, -102.6604];
const DOME_G = [4.407, 2.771475, -19.83198, 177.2899, -687.1213, 1366.559, -1357.49, 538.9193];
// At 10 MPa: compressed liquid s(t) from 46 °C to 311 °C, and superheated vapour s(t) from 311 °C to 500 °C (t in °C).
const LIQ10 = [-0.01264349, 0.01578408, -3.687103e-05, 1.32515e-07, -3.442934e-10, 4.345003e-13];
const SUP10 = [-18.61399, 0.2109838, -0.0006957324, 1.046243e-06, -5.940595e-10];
const poly = (c, v) => c.map((a, i) => `(${a})*(${v})^${i}`).join(' + ');

/** A T–s diagram of the Rankine cycle on the steam dome (t in °C on the vertical axis). */
export function rankinePic({ caption, labels = true, ask = null, x = [-0.3, 9.4], y = [0, 620], alt } = {}) {
  const S = STEAM, u = '(1 - (t + 273.15)/647.096)^(1/3)';
  const curves = [
    { param: [poly(DOME_F, u), 't'], t: [0.01, 373.946], color: 'ink3', width: 1.6 },
    { param: [poly(DOME_G, u), 't'], t: [0.01, 373.946], color: 'ink3', width: 1.6 },
    // 2 → 3: heating at 10 MPa (liquid, boiling, superheat)
    { param: [poly(LIQ10, 't'), 't'], t: [46.14, S.Tsat], color: 'warn', width: 2.6 },
    { param: ['t', String(S.Tsat)], t: [S.sf10, S.sg10], color: 'warn', width: 2.6 },
    { param: [poly(SUP10, 't'), 't'], t: [S.Tsat, S.Tin], color: 'warn', width: 2.6 },
    // 3 → 4: turbine, 4 → 1: condenser, 1 → 2: pump
    { param: [String(S.s3), 't'], t: [S.Tc, S.Tin], color: 'gold', width: 2.6 },
    { param: ['t', String(S.Tc)], t: [S.s1, S.s3], color: 'accent', width: 2.6 },
  ];
  const pts = [
    { x: S.s1, y: S.Tc, r: 4.5, color: 'ink', label: labels ? '1, 2' : '', labelDx: -30, labelDy: 2 },
    { x: S.s3, y: S.Tin, r: 4.5, color: 'ink', label: labels ? '3' : '', labelDx: 8 },
    { x: S.s3, y: S.Tc, r: 4.5, color: 'ink', label: labels ? '4' : '', labelDx: 8, labelDy: 14 },
    { x: 2.0, y: 330, r: 0.01, color: 'warn', label: 'boiler (10 MPa)', labelDx: -60, labelDy: -6 },
    { x: 3.2, y: S.Tc, r: 0.01, color: 'accent', label: 'condenser (10 kPa)', labelDx: -40, labelDy: -10 },
    { x: S.s3, y: 270, r: 0.01, color: 'gold', label: 'turbine', labelDx: 8 },
  ];
  if (ask) pts.push(...ask);
  return {
    type: 'graph',
    params: { x, y, aspect: 'wide', xlabel: 'entropy s (kJ/(kg·K))', ylabel: 'temperature (°C)', axesAt: 'edge', alt: alt || 'The Rankine cycle on a temperature–entropy diagram of water', curves, points: pts, },
    caption: caption ?? 'The ideal Rankine cycle on water’s T–s diagram (IAPWS-95 states; the dome and the heating line are fits good to about 0.02 kJ/(kg·K)). The pump’s temperature rise is too small to see: states 1 and 2 overlap.',
  };
}

// ─── throttling and liquefaction (reference equations, via CoolProp) ───────
// Joule–Thomson coefficients at 300 K and 1 bar (K/bar); temperatures after
// throttling from 300 K and 200 bar to 1 bar (isenthalpic); the low-pressure
// inversion temperature (K), where μ_JT changes sign.
export const JT = {
  N2: { mu: 0.212, after: 269.2, Tinv: 620 },
  O2: { mu: 0.265, after: 253.4, Tinv: 760 },
  H2: { mu: -0.030, after: 307.2, Tinv: 202 },
  He: { mu: -0.063, after: 312.3, Tinv: 45 },
};
// Liquefaction from gas at 300 K and 1 atm to saturated liquid at 1 atm, per kg:
// Δh = h_gas − h_liquid (J/kg), Δs = s_gas − s_liquid (J/(kg K)). Normal hydrogen,
// no ortho–para conversion.
export const LIQUEFY = {
  H2: { dh: 3.9583e6, ds: 53464, name: 'hydrogen', Tb: 20.37 },
  O2: { dh: 406.08e3, ds: 3471.0, name: 'oxygen', Tb: 90.19 },
  N2: { dh: 433.21e3, ds: 4007.6, name: 'nitrogen', Tb: 77.35 },
};
/** Least work (J/kg) to liquefy, rejecting heat to surroundings at T0: W = T0Δs − Δh. */
export const liqWork = (g, T0 = 300) => T0 * LIQUEFY[g].ds - LIQUEFY[g].dh;
// Water near 20 °C and 1 atm: density (kg/m³), thermal expansion coefficient β (1/K).
export const WATER20 = { rho: 998.21, beta: 2.068e-4 };

// ─── standard values at 298.15 K and 1 bar (CODATA Key Values) ─────────────
// ΔfH in J/mol, S in J/(mol K).
export const STD = {
  H2: { H: 0, S: 130.680 }, O2: { H: 0, S: 205.152 },
  H2Ol: { H: -285830, S: 69.95 }, H2Og: { H: -241826, S: 188.835 },
};
// Graphite → diamond at 298.15 K (NBS tables): ΔH, ΔG (J/mol); molar entropies (J/(mol K)); molar volumes (m³/mol).
export const CARBON = { dH: 1895, dG: 2900, Sg: 5.740, Sd: 2.377, Vg: 5.31e-6, Vd: 3.42e-6 };

// ─── NASA polynomials (McBride, Gordon & Reno 1993) ────────────────────────
// cp/R = a1 + a2T + a3T² + a4T³ + a5T⁴; h/RT = a1 + a2T/2 + … + a6/T; s/R = a1 lnT + a2T + … + a7.
// lo: 200–1000 K, hi: 1000–6000 K. Copied by script from the NASA data file.
export const NASA7 = {
  H2: { lo: [2.34433112, 0.00798052075, -1.9478151e-05, 2.01572094e-08, -7.37611761e-12, -917.935173, 0.683010238], hi: [2.93286579, 0.000826607967, -1.46402335e-07, 1.54100359e-11, -6.88804432e-16, -813.065597, -1.02432887] },
  O2: { lo: [3.78245636, -0.00299673415, 9.847302e-06, -9.68129508e-09, 3.24372836e-12, -1063.94356, 3.65767573], hi: [3.66096083, 0.000656365523, -1.41149485e-07, 2.05797658e-11, -1.29913248e-15, -1215.97725, 3.41536184] },
  H2O: { lo: [4.19864056, -0.0020364341, 6.52040211e-06, -5.48797062e-09, 1.77197817e-12, -30293.7267, -0.849032208], hi: [2.67703787, 0.00297318329, -7.7376969e-07, 9.44336689e-11, -4.26900959e-15, -29885.8938, 6.88255571] },
  OH: { lo: [3.99201543, -0.00240131752, 4.61793841e-06, -3.88113333e-09, 1.3641147e-12, 3615.08056, -0.103925458], hi: [2.83864607, 0.00110725586, -2.93914978e-07, 4.20524247e-11, -2.42169092e-15, 3943.95852, 5.84452662] },
  H: { lo: [2.5, 0.0, 0.0, 0.0, 0.0, 25473.6599, -0.446682853], hi: [2.50000286, -5.65334214e-09, 3.63251723e-12, -9.1994972e-16, 7.95260746e-20, 25473.6589, -0.446698494] },
  O: { lo: [3.1682671, -0.00327931884, 6.64306396e-06, -6.12806624e-09, 2.11265971e-12, 29122.2592, 2.05193346], hi: [2.54363697, -2.73162486e-05, -4.1902952e-09, 4.95481845e-12, -4.79553694e-16, 29226.012, 4.92229457] },
  CO: { lo: [3.57953347, -0.00061035368, 1.01681433e-06, 9.07005884e-10, -9.04424499e-13, -14344.086, 3.50840928], hi: [3.04848583, 0.00135172818, -4.85794075e-07, 7.88536486e-11, -4.69807489e-15, -14266.1171, 6.0170979] },
  CO2: { lo: [2.35677352, 0.00898459677, -7.12356269e-06, 2.45919022e-09, -1.43699548e-13, -48371.9697, 9.90105222], hi: [4.63659493, 0.00274131991, -9.95828531e-07, 1.60373011e-10, -9.16103468e-15, -49024.9341, -1.93534855] },
};
/** Molar cp, h, s and g = h − Ts of a gas at T and the standard pressure (J/mol, J/(mol K)). */
export function gas(sp, T) {
  const a = T < 1000 ? NASA7[sp].lo : NASA7[sp].hi;
  const cp = R * (a[0] + a[1] * T + a[2] * T ** 2 + a[3] * T ** 3 + a[4] * T ** 4);
  const h = R * T * (a[0] + (a[1] * T) / 2 + (a[2] * T ** 2) / 3 + (a[3] * T ** 3) / 4 + (a[4] * T ** 4) / 5 + a[5] / T);
  const s = R * (a[0] * Math.log(T) + a[1] * T + (a[2] * T ** 2) / 2 + (a[3] * T ** 3) / 3 + (a[4] * T ** 4) / 4 + a[6]);
  return { cp, h, s, g: h - T * s };
}
/** g/(RT) of a gas as expression text in Tv (high-temperature range, T ≥ 1000 K). */
export function gRTExpr(sp, Tv = 'x') {
  const a = NASA7[sp].hi, T = `(${Tv})`;
  return `(${a[0]}*(1 - ln(${T})) - (${a[1]})*${T}/2 - (${a[2]})*${T}^2/6 - (${a[3]})*${T}^3/12 - (${a[4]})*${T}^4/20 + (${a[5]})/${T} - (${a[6]}))`;
}
/** Standard reaction quantities at T for a reaction given as { species: stoichiometric number } (products +, reactants −). */
export function rxn(nu, T) {
  let dH = 0, dS = 0, dG = 0;
  for (const [sp, n] of Object.entries(nu)) { const q = gas(sp, T); dH += n * q.h; dS += n * q.s; dG += n * q.g; }
  return { dH, dS, dG, K: Math.exp(-dG / (R * T)) };
}
export const SPLIT = { H2O: -1, H2: 1, O2: 0.5 };          // H₂O ⇌ H₂ + ½O₂
export const SPLIT_OH = { H2O: -1, OH: 1, H2: 0.5 };       // H₂O ⇌ OH + ½H₂
export const SPLIT_CO2 = { CO2: -1, CO: 1, O2: 0.5 };      // CO₂ ⇌ CO + ½O₂
/** ln K of H₂O ⇌ H₂ + ½O₂ as expression text in Tv (T ≥ 1000 K). */
export const lnKsplitExpr = (Tv = 'x') => `-(${gRTExpr('H2', Tv)} + 0.5*${gRTExpr('O2', Tv)} - ${gRTExpr('H2O', Tv)})`;

/**
 * Fraction α of pure steam dissociated by H₂O ⇌ H₂ + ½O₂ alone, at T (K) and total
 * pressure P (bar), from K = α(α/2)^½ / [(1 − α)(1 + α/2)^½] · (P/P°)^½. With
 * Q = K²P°/P this is the cubic (1 − Q)α³ + 3Qα − 2Q = 0, solved by bisection.
 */
export function alphaSplit(T, Pbar, K = rxn(SPLIT, T).K) {
  const Q = (K * K) / Pbar;
  const f = (y) => (1 - Q) * y ** 3 + 3 * Q * y - 2 * Q;
  let lo = 0, hi = 1;
  for (let i = 0; i < 80; i++) { const m = (lo + hi) / 2; if (f(m) < 0) lo = m; else hi = m; }
  return (lo + hi) / 2;
}
/** The same α as expression text (Cardano's formula, valid while Q = K²/P < 1): T expression Tv, pressure (bar) expression Pv. */
export function alphaSplitExpr(Tv = 'x', Pv = 'P') {
  const Q = `(e^(2*(${lnKsplitExpr(Tv)}))/(${Pv}))`;
  const p = `(3*${Q}/(1 - ${Q}))`, q = `(-2*${Q}/(1 - ${Q}))`;
  const D = `sqrt(${q}^2/4 + ${p}^3/27)`;
  return `cbrt(-${q}/2 + ${D}) + cbrt(-${q}/2 - ${D})`;
}

// ─── phase-diagram pictures ────────────────────────────────────────────────
/**
 * A P–T phase diagram on a log pressure axis (linear temperature). Curves:
 * sublimation, vaporization (to the critical point) and melting.
 *   T: [min, max] in K; P: [log₁₀ min, log₁₀ max] in Pa
 *   marks: { triple, critical } labels (false hides); regions: label the phases
 *   points, hlines, vlines, arrows: added as given
 */
export function phasePic(key, { T, P, marks = true, regions = true, points = [], hlines = [], vlines = [], arrows = [], curves = [], drag, readouts, sliders, caption, alt, roughSub = null } = {}) {
  const s = SUBST[key];
  const lt = Math.log10(s.Pt), lc = Math.log10(s.Pc);
  const topP = Math.min(P[1], Math.log10(s.meltTop));
  const subRough = roughSub ?? !['water', 'co2'].includes(key);
  const cs = [
    { fn: subExpr(key, 'x'), domain: [T[0], s.Tt], color: 'violet', width: 2.4, dash: subRough ? true : undefined },
    { fn: vapExpr(key, 'x'), domain: [s.Tt, s.Tc], color: 'accent', width: 2.4 },
    { param: [meltExpr(key, '10^t/1000000'), 't'], t: [r4(lt), r4(topP)], color: 'teal', width: 2.4 },
    ...curves,
  ];
  const pts = [];
  if (marks) {
    pts.push({ x: s.Tt, y: r4(lt), r: 5, color: 'gold', label: marks === true || marks.triple ? (marks.triple || 'triple point') : '', labelDx: 8, labelDy: 14 });
    pts.push({ x: s.Tc, y: r4(lc), r: 5, color: 'warn', label: marks === true || marks.critical ? (marks.critical || 'critical point') : '', labelDx: -40, labelDy: -12 });
  }
  if (regions) {
    const span = T[1] - T[0];
    const lab = (x, y, text) => ({ x: r4(x), y: r4(y), r: 0.01, color: 'ink2', label: text, labelDx: -3.2 * text.length, labelDy: 0 });
    pts.push(lab(T[0] + 0.07 * span + (key === 'water' ? 0 : 0), P[0] + 0.78 * (P[1] - P[0]), 'solid'));
    pts.push(lab(Math.min(s.Tc - 0.05 * span, (s.Tt + s.Tc) / 2), Math.min(P[1] - 0.12 * (P[1] - P[0]), lc + 0.35), 'liquid'));
    pts.push(lab(T[0] + 0.62 * span, P[0] + 0.18 * (P[1] - P[0]), 'gas'));
  }
  return {
    type: 'graph',
    params: { x: T, y: P, aspect: 'wide', ylog: true, xlabel: 'temperature (K)', ylabel: 'pressure (Pa)', axesAt: 'edge', alt: alt || `The phase diagram of ${s.name}`,
      curves: cs, points: [...pts, ...points], hlines, vlines, arrows, ...(drag ? { drag } : {}), ...(readouts ? { readouts } : {}), ...(sliders ? { sliders } : {}) },
    caption: caption ?? `The phase diagram of ${s.name} (reference equations of state; fits within 1 %). Pressure on a log scale.${subRough ? ' Dashed: the solid–gas curve estimated by Clausius–Clapeyron.' : ''}`,
  };
}

export { r4, g6 };
