// The simulated advanced-lab experiments behind sims/labg-rig.js and the lab
// course's lessons lab.E.10–E.17: a cavity blackbody seen by a thermopile
// (Stefan–Boltzmann), the normal Zeeman effect through a Fabry–Pérot etalon,
// Compton scattering of Cs-137 gammas, a NaI(Tl) gamma-ray spectrometer,
// pulsed NMR inversion recovery, the muon lifetime from stopped cosmic rays,
// the Hall effect in germanium, and the superconducting transition of YBCO.
// DOM-free; checked by test/labg-rig.test.mjs.
//
// Each run is made from a seeded generator, with every random deviate drawn
// in a fixed order before any systematic is applied — so a seed always gives
// the same data, and switching a systematic (a flag) on or off re-reads the
// *same* scatter. Each experiment carries a real systematic of its own (the
// thermometer in a cavity, the field gradient across a lamp, a drifting
// photomultiplier gain, a pulse that is not quite 180°, afterpulsing, an
// offset voltage that drifts as a sample warms, thermal lag) and offers the
// analyses a lab would compare. Same look and conventions as labe-rig (E.1–E.9).
//
// Physical constants: CODATA 2022 (via scipy.constants 1.18). The muon
// lifetime is the PDG value; μ⁻ in carbon is Suzuki, Measday & Roalsvig,
// Phys. Rev. C 35, 2212 (1987); gamma-line energies are DDEP/NNDC values.
// Apparatus numbers are illustrative values typical of teaching apparatus,
// not the specification of any one product.

import { makeRng } from '../../core/rng.js';
import { gaussian, fitLine, pm } from './lab-bench.js';
import { chi2Sf } from './labx-stats.js';

export { pm, chi2Sf, fitLine };

// ─── constants ────────────────────────────────────────────────────────────
export const K = {
  h: 6.62607015e-34, c: 299792458, kB: 1.380649e-23, e: 1.602176634e-19, me: 9.1093837139e-31,
  sigma: 5.670374419e-8,      // W m⁻² K⁻⁴ (Stefan–Boltzmann)
  wien: 2.897771955e-3,       // m K
  muBh: 13.9962449171,        // GHz/T: the Bohr magneton over h
  mec2: 510.99895069,         // keV
  gp: 42.577478461,           // MHz/T: the free proton's γ/2π
  gpw: 42.57638543,           // MHz/T: protons shielded in a sphere of water at 25 °C
  tauMu: 2.1969811,           // μs: the free muon (PDG)
  tauMuC: 2.0263,             // μs: a μ⁻ bound in carbon (decay and nuclear capture)
  muRatio: 1.27,              // μ⁺/μ⁻ at sea level, at the momenta that stop in a detector (approximate)
};
K.em = K.e / K.me;

/** Gamma-ray energies (keV), DDEP / NNDC. */
export const LINES = {
  am241: 59.5409, cs137: 661.657, na22a: 510.999, na22b: 1274.537, co60a: 1173.228, co60b: 1332.492,
  mn54: 834.848, k40: 1460.820, zn65: 1115.539, co57: 122.0607, bi207a: 569.698, bi207b: 1063.656,
};

const D2R = Math.PI / 180;

// ─── random numbers ───────────────────────────────────────────────────────
/** Poisson deviate for mean λ from a uniform u and a normal z (normal approximation above λ = 200). */
export function poissonFrom(lam, u, z) {
  if (!(lam > 0)) return 0;
  if (lam > 200) return Math.max(0, Math.round(lam + Math.sqrt(lam) * z));
  let k = 0, p = Math.exp(-lam), c = p;
  while (u > c && k < 2000) { k++; p *= lam / k; c += p; }
  return k;
}
const draws = (rng, n) => Array.from({ length: n }, () => gaussian(rng));
const unis = (rng, n) => Array.from({ length: n }, () => rng.next());

// ─── fitting ──────────────────────────────────────────────────────────────
function solve(A, b) {
  const n = b.length, M = A.map((r, i) => [...r, b[i]]);
  for (let c = 0; c < n; c++) {
    let p = c; for (let r = c + 1; r < n; r++) if (Math.abs(M[r][c]) > Math.abs(M[p][c])) p = r;
    [M[c], M[p]] = [M[p], M[c]];
    if (Math.abs(M[c][c]) < 1e-300) return null;
    for (let r = 0; r < n; r++) if (r !== c) { const f = M[r][c] / M[c][c]; for (let k = c; k <= n; k++) M[r][k] -= f * M[c][k]; }
  }
  return M.map((r, i) => r[n] / r[i]);
}
export function inverse(A) {
  const n = A.length, cols = [];
  for (let j = 0; j < n; j++) { const e = Array(n).fill(0); e[j] = 1; const x = solve(A, e); if (!x) return null; cols.push(x); }
  return A.map((_, i) => cols.map((c) => c[i]));
}

/**
 * Levenberg–Marquardt. Least squares (χ² with the σ's given) or, with
 * poisson: true, the binned Poisson maximum likelihood: y are counts, the
 * weights are recomputed from the model (σ² = μ) every step, and the cost is
 * the likelihood-ratio statistic 2Σ[μ − n + n ln(n/μ)] (Baker & Cousins).
 * Returns p, the covariance (JᵀWJ)⁻¹, the σ's, the cost (χ² or the Poisson
 * deviance), dof, and the residuals.
 */
export function lm(f, x, y, sy, p0, { poisson = false, scale = null, iters = 400 } = {}) {
  const n = x.length, m = p0.length;
  const sc = scale || p0.map((v) => Math.abs(v) || 1);
  const sig = (q, i) => (poisson ? Math.sqrt(Math.max(f(x[i], q), 1e-9)) : sy[i]);
  const cost = (q) => {
    let c = 0;
    for (let i = 0; i < n; i++) {
      const mu = f(x[i], q);
      if (poisson) { if (!(mu > 0)) return Infinity; c += 2 * (mu - y[i] + (y[i] > 0 ? y[i] * Math.log(y[i] / mu) : 0)); }
      else c += ((y[i] - mu) / sy[i]) ** 2;
    }
    return c;
  };
  const normal = (q) => {
    const A = Array.from({ length: m }, () => Array(m).fill(0)), g = Array(m).fill(0);
    for (let i = 0; i < n; i++) {
      const f0 = f(x[i], q), s = sig(q, i);
      const J = q.map((_, j) => { const hq = q.slice(); const hh = 1e-6 * sc[j]; hq[j] += hh; return (f(x[i], hq) - f0) / hh / s; });
      const r = (y[i] - f0) / s;
      for (let a = 0; a < m; a++) { g[a] += J[a] * r; for (let b = 0; b < m; b++) A[a][b] += J[a] * J[b]; }
    }
    return { A, g };
  };
  let p = p0.slice(), c = cost(p), lam = 1e-3;
  for (let it = 0; it < iters; it++) {
    const { A, g } = normal(p);
    const Ad = A.map((row, i) => row.map((v, j) => (i === j ? v * (1 + lam) : v)));
    const d = solve(Ad, g);
    if (!d) { lam *= 10; continue; }
    const pt = p.map((v, j) => v + d[j]);
    const ct = cost(pt);
    if (Number.isFinite(ct) && ct <= c) {
      const done = c - ct < 1e-11 * Math.max(1, c);
      p = pt; c = ct; lam = Math.max(1e-12, lam / 10);
      if (done) break;
    } else lam *= 10;
    if (lam > 1e12) break;
  }
  const cov = inverse(normal(p).A) || p.map(() => p.map(() => NaN));
  const dof = n - m;
  return { p, cov, sp: p.map((_, j) => Math.sqrt(cov[j][j])), chi2: c, dof, chi2r: dof > 0 ? c / dof : NaN, n, residuals: x.map((xi, i) => y[i] - f(xi, p)), f: (t) => f(t, p) };
}

/** σ of g(p) from the covariance of p (numerical gradient). */
export function propagate(g, p, cov) {
  const g0 = g(p);
  const grad = p.map((v, j) => { const q = p.slice(); const hh = 1e-6 * (Math.abs(v) || 1); q[j] += hh; return (g(q) - g0) / hh; });
  let s2 = 0;
  for (let i = 0; i < p.length; i++) for (let j = 0; j < p.length; j++) s2 += grad[i] * cov[i][j] * grad[j];
  return Math.sqrt(Math.max(0, s2));
}

/** A result: value ± σ (statistical ⊕ Type B, both kept), accepted value and z. */
function result(key, label, value, sStat, { rel = 0, abs = 0, scale = 1, unit = '', accepted = null, note = null } = {}) {
  const sB = Math.hypot(rel * value, abs);
  const sigma = Math.hypot(sStat, sB);
  const z = accepted !== null && sigma > 0 ? (value - accepted) / sigma : null;
  return { key, label, value, sigma, sStat, sB, scale, unit, accepted, z, note };
}

const r6 = (v) => +(+v).toPrecision(6);

// ─── E.10: a cavity blackbody and a thermopile ────────────────────────────
export const BB = {
  T0: 296.0,                  // K: the room (and the thermopile's own) temperature
  As: Math.PI * 0.005 ** 2,   // m²: the cavity's aperture, 10.0 mm across
  Ad: Math.PI * 0.0025 ** 2,  // m²: the thermopile's aperture, 5.0 mm across
  d: 0.200,                   // m: aperture to aperture
  eps: 0.99,                  // the cavity's effective emissivity
  S: 25.0,                    // V/W: the thermopile's responsivity (certificate ±3 %)
  temps: [400, 450, 500, 550, 600, 650, 700, 750, 800, 850, 900, 950, 1000],
  gradient: 0.02,             // the thermocouple reads low by 2 % of (T − T0) when it sits off the cavity's floor
  sT: 0.4, sV0: 2e-6, sVrel: 0.002,   // K; V; fractional
  typeB: { S: 0.03, d: 0.0025, As: 0.005, Ad: 0.005, eps: 0.005 },     // fractional
};
/** The geometric factor As·Ad/(π d²), in m². */
export const bbG = () => (BB.As * BB.Ad) / (Math.PI * BB.d ** 2);
/** The thermopile's voltage (V) for a cavity at T. */
export const bbV = (T, sig = K.sigma) => BB.S * BB.eps * sig * (T ** 4 - BB.T0 ** 4) * bbG();
/** The fractional Type B uncertainty of σ from the geometry and the responsivity: d enters squared. */
export const bbTypeB = () => { const u = BB.typeB; return Math.hypot(u.S, 2 * u.d, u.As, u.Ad, u.eps); };

function blackbody(o) {
  const g = makeRng(o.seed), z = draws(g, 2 * BB.temps.length);
  const sys = o.flags.gradient;
  const rows = BB.temps.map((T, i) => {
    const Tr = T - (sys ? BB.gradient * (T - BB.T0) : 0) + BB.sT * z[2 * i];
    const V0 = bbV(T), sV = Math.hypot(BB.sV0, BB.sVrel * V0);
    return { T, Tr: +Tr.toFixed(1), V: V0 + sV * z[2 * i + 1], sV };
  });
  const mV = rows.map((r) => 1000 * r.V), smV = rows.map((r) => 1000 * r.sV);
  const out = { rows };
  if (o.analysis === 'loglog') {
    const x = rows.map((r) => Math.log(r.Tr)), y = rows.map((r) => Math.log(1000 * r.V)), sy = rows.map((r) => Math.hypot(r.sV / r.V, (4 * BB.sT) / r.Tr));
    const fit = fitLine(x, y, sy);
    fit.f = (t) => fit.a + fit.b * t;
    Object.assign(out, {
      data: { x, y, sy, xlabel: 'ln(T / 1 K)', ylabel: 'ln(V / 1 mV)' }, fit, line: true,
      rawFit: (T) => Math.exp(fit.a) * T ** fit.b,
      results: [result('n', 'exponent $n$ in $V \\propto T^n$', fit.b, fit.sb, { accepted: 4 })],
    });
  } else {
    const x = rows.map((r) => (r.Tr ** 4 - BB.T0 ** 4) / 1e10), sy = rows.map((r) => Math.hypot(1000 * r.sV, 1000 * bbV(r.Tr) * (4 * BB.sT * r.Tr ** 3) / (r.Tr ** 4 - BB.T0 ** 4)));
    const fit = fitLine(x, mV, sy);
    fit.f = (t) => fit.a + fit.b * t;
    const k = BB.S * BB.eps * bbG();                       // V per (W m⁻²)
    const sig = (fit.b / 1000 / 1e10) / k;
    Object.assign(out, {
      data: { x, y: mV, sy, xlabel: 'T⁴ − T₀⁴ (10¹⁰ K⁴)', ylabel: 'V (mV)', zeroX: true }, fit, line: true,
      rawFit: (T) => fit.a + fit.b * (T ** 4 - BB.T0 ** 4) / 1e10,
      results: [result('sigma', '$\\sigma$', sig, (sig * fit.sb) / fit.b, { rel: bbTypeB(), scale: 1e-8, unit: '\\times10^{-8}\\ \\mathrm{W\\,m^{-2}\\,K^{-4}}', accepted: K.sigma })],
    });
  }
  out.raw = {
    x: [350, 1050], y: [-0.8, 1000 * bbV(1000) * 1.12], xlabel: 'T read by the thermocouple (K)', ylabel: 'V (mV)',
    points: rows.map((r, i) => ({ x: r.Tr, y: mV[i], sy: smV[i] })), curve: (T) => 1000 * out.rawFit(T),
  };
  return out;
}

// ─── E.11: the normal Zeeman effect (Cd 643.8 nm) through a Fabry–Pérot ───
export const ZM = {
  lam: 643.84696e-9, n: 1.457, d: 3.000e-3, f: 0.150, R: 0.85,
  fields: [0.20, 0.30, 0.40, 0.50, 0.60, 0.70, 0.80, 0.90],     // T, read by the probe at the gap's centre
  lampFactor: 0.970,          // the field where the lamp's discharge sits, as a fraction of the centre's
  uMap: 0.005,                // the field map's own uncertainty (fractional)
  uProbe: 0.010,              // the Hall probe's calibration (fractional, Type B)
  sDelta: 0.012, sSplit: 0.030, eps0: 0.32,                  // mm²: r² read from a ring fit; the fractional order at the centre
};
/** The etalon's free spectral range in GHz: c/(2nd). */
export const zmFSR = () => K.c / (2 * ZM.n * ZM.d) / 1e9;
/** The spacing of successive orders in r² (mm²): f² nλ/d. */
export const zmDelta = () => (ZM.f ** 2 * ZM.n * ZM.lam) / ZM.d * 1e6;
/** The Airy transmission of the etalon at r² (mm²) for a line shifted by dv (GHz). */
export function zmAiry(r2, dv) {
  const F = (4 * ZM.R) / (1 - ZM.R) ** 2;
  const s = Math.sin(Math.PI * (ZM.eps0 + r2 / zmDelta() + dv / zmFSR()));
  return 1 / (1 + F * s * s);
}

function zeeman(o) {
  const g = makeRng(o.seed), z = draws(g, 2 * ZM.fields.length + 400);
  const sys = o.flags.gradient;
  const D = zmDelta(), FSR = zmFSR();
  const rows = ZM.fields.map((B, i) => {
    const Bl = sys ? ZM.lampFactor * B : B;                    // the field the atoms feel
    const dv = K.muBh * Bl;                                    // GHz: each σ component's shift
    const delta = D + ZM.sDelta * z[2 * i];
    const split = (2 * dv / FSR) * D + ZM.sSplit * z[2 * i + 1];
    return { B, Bl, delta, split, dv: (split / delta) * FSR / 2, sdv: (FSR / 2) * Math.hypot(ZM.sSplit / delta, (split * ZM.sDelta) / delta ** 2) };
  });
  const factor = o.analysis === 'mapped' ? (sys ? ZM.lampFactor : 1) : 1;
  const x = rows.map((r) => r.B * factor), y = rows.map((r) => r.dv), sy = rows.map((r) => r.sdv);
  const fit = fitLine(x, y, sy);
  fit.f = (t) => fit.a + fit.b * t;
  const rel = Math.hypot(ZM.uProbe, o.analysis === 'mapped' ? ZM.uMap : 0);
  const at = Math.max(0, Math.min(ZM.fields.length - 1, o.at ?? 3));
  const r0 = rows[at];
  const pts = [];
  for (let k = 0; k <= 600; k++) { const r2 = (3.3 * D * k) / 600; const v = 0.5 * zmAiry(r2, r0.dv) + 0.5 * zmAiry(r2, -r0.dv) + 0.012 * z[2 * ZM.fields.length + (k % 400)]; pts.push([r6(r2), r6(v)]); }
  const res = [
    result('muB', '$\\mu_B/h$', fit.b, fit.sb, { rel, unit: '\\mathrm{GHz/T}', accepted: K.muBh }),
    result('em', '$e/m = 4\\pi\\,\\mu_B/h$', 4 * Math.PI * fit.b * 1e9, 4 * Math.PI * fit.sb * 1e9, { rel, scale: 1e11, unit: '\\times10^{11}\\ \\mathrm{C/kg}', accepted: K.em }),
  ];
  return {
    rows, fit, line: true, results: res,
    data: { x, y, sy, xlabel: o.analysis === 'mapped' ? 'B at the lamp (T)' : 'B read at the gap centre (T)', ylabel: 'shift of each σ line (GHz)', zeroX: true, zeroY: true },
    raw: { x: [0, r6(3.3 * D)], y: [0, 1.12], xlabel: 'ring radius squared, r² (mm²)', ylabel: 'intensity', paths: [{ pts, color: 'teal', width: 1.4 }], texts: [{ s: `B = ${ZM.fields[at].toFixed(2)} T (probe)`, x: r6(3.3 * D), y: 1.1, align: 'right', color: 'ink2', dy: 4 }] },
  };
}

// ─── E.12: Compton scattering of Cs-137 gammas ────────────────────────────
export const CP = {
  E0: LINES.cs137, angles: [30, 45, 60, 75, 90, 105, 120], N30: 2500, bg: 1.5,
  drift: 0.025,               // the photomultiplier's gain falls by 2.5 % over the seven hours
  uCal: 0.0015, sCs: 0.25,    // fractional calibration uncertainty; keV scatter of each Cs-137 recalibration
};
/** The scattered photon's energy (keV) at angle θ (degrees). */
export const comptonE = (th, E = CP.E0, m = K.mec2) => E / (1 + (E / m) * (1 - Math.cos(th * D2R)));
/** A NaI(Tl) detector's FWHM (keV) at energy E: 7 % at 662 keV, growing as √E (a teaching model). */
export const naiFWHM = (E) => 0.07 * 661.657 * Math.sqrt(E / 661.657);
/** The Klein–Nishina cross-section's shape, dσ/dΩ ∝ P²(P + 1/P − sin²θ) with P = E′/E. */
export const kleinNishina = (th) => { const P = comptonE(th) / CP.E0; return P * P * (P + 1 / P - Math.sin(th * D2R) ** 2); };

function compton(o) {
  const g = makeRng(o.seed), n = CP.angles.length, z = draws(g, 2 * n);
  const zs = draws(g, 200), us = unis(g, 200);
  const sys = o.flags.drift;
  const rows = CP.angles.map((th, k) => {
    const E = comptonE(th), N = Math.round((CP.N30 * kleinNishina(th)) / kleinNishina(30));
    const gain = sys ? 1 - (CP.drift * k) / (n - 1) : 1;
    const sStat = ((naiFWHM(E) / 2.3548) / Math.sqrt(N)) * 1.25;
    const Em = E * gain + sStat * z[2 * k];
    const Ecs = CP.E0 * gain + CP.sCs * z[2 * k + 1];
    return { th, E, N, gain, Em, Ecs, sStat };
  });
  const each = o.analysis === 'each';
  const Eu = rows.map((r) => {
    const E = each ? (r.Em * CP.E0) / r.Ecs : r.Em;
    const s = Math.hypot(r.sStat, CP.uCal * E, each ? (CP.sCs * E) / CP.E0 : 0);
    return { E, s };
  });
  const x = rows.map((r) => 1 - Math.cos(r.th * D2R));
  const y = Eu.map((e) => 1000 * (1 / e.E - 1 / CP.E0)), sy = Eu.map((e) => (1000 * e.s) / e.E ** 2);
  const fit = fitLine(x, y, sy);
  fit.f = (t) => fit.a + fit.b * t;
  const m = 1000 / fit.b;
  const at = Math.max(0, Math.min(n - 1, o.at ?? 6));
  const r0 = rows[at];
  const w = 4, bins = [], counts = [];
  const sg = naiFWHM(r0.Em) / 2.3548;
  for (let k = 0; k < 190; k++) {
    const e = (k + 0.5) * w;
    const lam = r0.N * w * Math.exp(-0.5 * ((e - r0.Em) / sg) ** 2) / (sg * Math.sqrt(2 * Math.PI)) + CP.bg * w * (0.25 + 4 * Math.exp(-e / 120)) * (r0.N / 600) ** 0.5;
    bins.push(k * w); counts.push(poissonFrom(lam, us[k], zs[k]));
  }
  bins.push(190 * w);
  const ymax = Math.max(...counts) * 1.15;
  return {
    rows: rows.map((r, i) => ({ ...r, Eused: Eu[i].E, sE: Eu[i].s })), fit, line: true,
    data: { x, y, sy, xlabel: '1 − cos θ', ylabel: '1/E′ − 1/E (MeV⁻¹)', zeroX: true, zeroY: true },
    results: [result('mc2', '$m_ec^2 = 1/\\text{slope}$', m, (m * fit.sb) / fit.b, { unit: '\\mathrm{keV}', accepted: K.mec2 })],
    raw: {
      x: [0, 760], y: [0, r6(ymax)], xlabel: 'energy (keV, start-of-run calibration)', ylabel: 'counts per 4 keV',
      bars: { edges: bins, counts, color: 'accent' },
      vlines: [{ x: r6(r0.E), color: 'good', dash: [6, 4] }],
      texts: [{ s: `θ = ${r0.th}°`, x: 740, y: r6(ymax * 0.93), align: 'right', color: 'ink2' }, { s: 'dashed: E′ predicted', x: 740, y: r6(ymax * 0.82), align: 'right', color: 'good', size: 10.5 }],
    },
  };
}

// ─── E.13: a NaI(Tl) gamma-ray spectrometer ───────────────────────────────
export const GS = {
  nch: 1024, a: -3.0, b: 1.550, q: 3.0e-6,        // true response: E = a + b·ch + q·ch² (keV)
  gainShift: 0.015,                               // the unknown's run: gain 1.5 % higher (the room warmed)
  sources: {
    am241: { label: 'Am-241', lines: [[LINES.am241, 15000]] },
    na22: { label: 'Na-22', lines: [[LINES.na22a, 15000], [LINES.na22b, 3500]] },
    cs137: { label: 'Cs-137', lines: [[LINES.cs137, 20000]] },
    co60: { label: 'Co-60', lines: [[LINES.co60a, 8000], [LINES.co60b, 7000]] },
    unknown: { label: 'unknown', lines: [[LINES.mn54, 9000]], k40: 1500 },
  },
  k40: 450,                                       // counts in the K-40 background line in a calibration run
  cal: [['am241', 0], ['na22', 0], ['cs137', 0], ['co60', 0], ['co60', 1], ['na22', 1]],
};
/** The true channel (fractional) of energy E, with an optional gain factor. */
export const gsChannel = (E, gain = 1) => { const { a, b, q } = GS; return (gain * (-b + Math.sqrt(b * b - 4 * q * (a - E)))) / (2 * q); };

/** The expected counts in each channel for a source (gain: the run's gain factor). */
export function gsExpect(src, gain = 1) {
  const S = GS.sources[src];
  const lines = [...S.lines, [LINES.k40, S.k40 || GS.k40]];
  const mu = new Float64Array(GS.nch);
  const erfc = (x) => { const t = 1 / (1 + 0.5 * Math.abs(x)); const y = t * Math.exp(-x * x - 1.26551223 + t * (1.00002368 + t * (0.37409196 + t * (0.09678418 + t * (-0.18628806 + t * (0.27886807 + t * (-1.13520398 + t * (1.48851587 + t * (-0.82215223 + t * 0.17087277))))))))); return x >= 0 ? y : 2 - y; };
  const dE = GS.b;                                 // keV per channel (near enough for the shapes)
  for (const [E, N] of lines) {
    const c0 = gsChannel(E, gain), sc = naiFWHM(E) / 2.3548 / dE;
    const Ec = (2 * E * E) / (K.mec2 + 2 * E), cEdge = gsChannel(Ec, gain);
    const Ebs = E / (1 + (2 * E) / K.mec2), cBs = gsChannel(Ebs, gain), sBs = naiFWHM(Ebs) / 2.3548 / dE;
    const cont = (N * 1.6 * (E / 661.657) ** 0.5) / cEdge;    // Compton continuum, counts per channel
    for (let ch = 0; ch < GS.nch; ch++) {
      mu[ch] += (N / (sc * Math.sqrt(2 * Math.PI))) * Math.exp(-0.5 * ((ch - c0) / sc) ** 2);
      mu[ch] += cont * 0.5 * erfc((ch - cEdge) / (Math.SQRT2 * sc)) * (ch > 8 ? 1 : 0);
      mu[ch] += (0.06 * N / (sBs * Math.sqrt(2 * Math.PI))) * Math.exp(-0.5 * ((ch - cBs) / sBs) ** 2);
    }
  }
  for (let ch = 0; ch < GS.nch; ch++) mu[ch] += 2 + 60 * Math.exp(-ch / 60);   // room background
  return mu;
}

/**
 * A peak's centroid by the region-of-interest method: ±1 FWHM about a guess,
 * a straight background through the mean of three channels at each edge,
 * the net counts' first moment, and its Poisson uncertainty.
 */
export function roiCentroid(counts, guess, fwhm) {
  const lo = Math.max(3, Math.round(guess - fwhm)), hi = Math.min(counts.length - 4, Math.round(guess + fwhm));
  const bl = (counts[lo - 1] + counts[lo - 2] + counts[lo - 3]) / 3, bh = (counts[hi + 1] + counts[hi + 2] + counts[hi + 3]) / 3;
  let S = 0, S1 = 0;
  const net = [];
  for (let ch = lo; ch <= hi; ch++) { const bg = bl + ((bh - bl) * (ch - lo)) / (hi - lo); const nn = counts[ch] - bg; net.push([ch, nn]); S += nn; S1 += ch * nn; }
  const c = S1 / S;
  let v = 0;
  for (let ch = lo; ch <= hi; ch++) v += (ch - c) ** 2 * Math.max(counts[ch], 1);
  return { c, sc: Math.sqrt(v) / S, net: S, lo, hi };
}

function gammaRun(o) {
  const g = makeRng(o.seed);
  const spectra = {};
  for (const key of Object.keys(GS.sources)) {
    const zz = draws(g, GS.nch), uu = unis(g, GS.nch);
    const gain = key === 'unknown' && o.flags.drift ? 1 + GS.gainShift : 1;
    const mu = gsExpect(key, gain);
    spectra[key] = Array.from(mu, (m, i) => poissonFrom(m, uu[i], zz[i]));
  }
  // calibration: centroids of the known lines, fitted E = a + b·ch (weighted)
  const cal = GS.cal.map(([src, j]) => {
    const E = GS.sources[src].lines[j][0];
    const guess = gsChannel(E), fw = naiFWHM(E) / GS.b;
    return { src, E, ...roiCentroid(spectra[src], guess, fw) };
  });
  let fit = fitLine(cal.map((c) => c.c), cal.map((c) => c.E), cal.map((c) => 0.0015 * c.E));
  for (let it = 0; it < 3; it++) fit = fitLine(cal.map((c) => c.c), cal.map((c) => c.E), cal.map((c) => Math.hypot(fit.b * c.sc, 0.0015 * c.E)));
  fit.f = (t) => fit.a + fit.b * t;
  const Eof = (c) => fit.a + fit.b * c;
  const sEof = (c, sc) => Math.sqrt(fit.sa ** 2 + c * c * fit.sb ** 2 + 2 * c * fit.cov + (fit.b * sc) ** 2);
  const U = spectra.unknown;
  const guessU = gsChannel(LINES.mn54, o.flags.drift ? 1 + GS.gainShift : 1);
  const pu = roiCentroid(U, guessU, naiFWHM(LINES.mn54) / GS.b);
  const pk = roiCentroid(U, gsChannel(LINES.k40, o.flags.drift ? 1 + GS.gainShift : 1), naiFWHM(LINES.k40) / GS.b);
  let Eu = Eof(pu.c), sEu = sEof(pu.c, pu.sc);
  const Ek = Eof(pk.c), sEk = sEof(pk.c, pk.sc);
  if (o.analysis === 'k40') { const fK = LINES.k40 / Ek; sEu = Math.hypot(fK * sEu, (Eu * fK * sEk) / Ek); Eu *= fK; }
  const src = GS.sources[o.src] ? o.src : 'unknown';
  const S = spectra[src];
  const lg = Array.from(S, (v) => (v > 0 ? Math.log10(v) : NaN));
  const pts = [];
  for (let ch = 0; ch < GS.nch; ch++) if (Number.isFinite(lg[ch])) pts.push([ch, r6(lg[ch])]);
  return {
    spectra, cal, fit, line: true, peak: pu, k40: pk, Ek, sEk,
    data: { x: cal.map((c) => c.c), y: cal.map((c) => c.E), sy: cal.map((c) => Math.hypot(fit.b * c.sc, 0.0015 * c.E)), xlabel: 'peak centroid (channel)', ylabel: 'E (keV)', zeroX: true },
    results: [
      result('E', 'unknown’s line', Eu, sEu, { unit: '\\mathrm{keV}', accepted: LINES.mn54 }),
      result('k40', 'K-40 background line', Ek, sEk, { unit: '\\mathrm{keV}', accepted: LINES.k40 }),
    ],
    raw: { x: [0, GS.nch], y: [0, Math.ceil(Math.max(...lg.filter(Number.isFinite)) + 0.3)], xlabel: 'channel', ylabel: 'counts per channel', ylog: true, paths: [{ pts, color: 'accent', width: 1.1 }], texts: [{ s: GS.sources[src].label, x: GS.nch - 10, y: Math.max(...lg.filter(Number.isFinite)), align: 'right', color: 'ink2' }] },
  };
}

// ─── E.14: pulsed NMR, inversion recovery ─────────────────────────────────
export const NM = {
  T1: 32.0,                   // ms
  delays: [1, 2, 4, 6, 8, 10, 13, 16, 20, 25, 30, 40, 50, 65, 80, 100, 130],   // ms
  long: 300, nLong: 4,        // ms: the delay for M∞, and how many times it is read
  M0: 1.0, sM: 0.012,         // V: the equilibrium signal, and the noise on one reading
  badAngle: 160,              // degrees: the "180°" pulse when it is mis-set
  T2s: 0.25, df: 12,          // ms, kHz: the FID's decay (field inhomogeneity) and its beat (off-resonance)
};
/** The inversion-recovery signal M(τ) for a "180°" pulse of angle θ (degrees). */
export const nmrM = (tau, angle = 180, T1 = NM.T1, M0 = NM.M0) => M0 * (1 - (1 - Math.cos(angle * D2R)) * Math.exp(-tau / T1));

function nmr(o) {
  const g = makeRng(o.seed), z = draws(g, NM.delays.length + NM.nLong + 300);
  const angle = o.flags.angle ? NM.badAngle : 180;
  const M = NM.delays.map((t, i) => nmrM(t, angle) + NM.sM * z[i]);
  const ML = Array.from({ length: NM.nLong }, (_, i) => nmrM(NM.long, angle) + NM.sM * z[NM.delays.length + i]);
  const Minf = ML.reduce((s, v) => s + v, 0) / NM.nLong, sMinf = NM.sM / Math.sqrt(NM.nLong);
  const out = { M, Minf, sMinf, angle };
  if (o.analysis === 'null') {
    const i = M.findIndex((v, k) => k > 0 && M[k - 1] < 0 && v >= 0);
    const t0 = NM.delays[i - 1], t1 = NM.delays[i], f = -M[i - 1] / (M[i] - M[i - 1]);
    const tn = t0 + f * (t1 - t0), slope = (M[i] - M[i - 1]) / (t1 - t0);
    const stn = (NM.sM * Math.hypot(1 - f, f)) / slope;
    const T1 = tn / Math.LN2, sT1 = stn / Math.LN2;
    Object.assign(out, {
      tn, T1, line: false,
      data: { x: NM.delays.slice(0, Math.min(NM.delays.length, i + 4)), y: M.slice(0, Math.min(NM.delays.length, i + 4)), sy: Array(Math.min(NM.delays.length, i + 4)).fill(NM.sM), xlabel: 'delay τ (ms)', ylabel: 'M (V)', zeroX: true, curve: (t) => nmrM(t, 180, T1, Minf), mark: { x: tn, y: 0 } },
      fit: { chi2: NaN, dof: 0, f: (t) => nmrM(t, 180, T1, Minf), residuals: NM.delays.slice(0, Math.min(NM.delays.length, i + 4)).map((t, k) => M[k] - nmrM(t, 180, T1, Minf)) },
      results: [result('T1', '$T_1 = \\tau_{\\text{null}}/\\ln 2$', T1, sT1, { unit: '\\mathrm{ms}', accepted: NM.T1, note: 'true' })],
    });
  } else if (o.analysis === 'semilog') {
    const use = NM.delays.map((t, i) => i).filter((i) => NM.delays[i] <= 100 && Minf - M[i] > 5 * NM.sM);
    const x = use.map((i) => NM.delays[i]), y = use.map((i) => Math.log(Minf - M[i])), sy = use.map((i) => Math.hypot(NM.sM, sMinf) / (Minf - M[i]));
    const fit = fitLine(x, y, sy);
    fit.f = (t) => fit.a + fit.b * t;
    const T1 = -1 / fit.b, k = Math.exp(fit.a) / Minf;
    Object.assign(out, {
      T1, k, fit, line: true,
      data: { x, y, sy, xlabel: 'delay τ (ms)', ylabel: 'ln((M∞ − M) / 1 V)', zeroX: true },
      results: [
        result('T1', '$T_1 = -1/\\text{slope}$', T1, fit.sb / fit.b ** 2, { unit: '\\mathrm{ms}', accepted: NM.T1, note: 'true' }),
        result('k', '$k = e^{\\text{intercept}}/M_\\infty$ (2 for a perfect 180°)', k, k * Math.hypot(fit.sa, sMinf / Minf), { accepted: null }),
      ],
    });
  } else {
    const x = [...NM.delays, ...Array(NM.nLong).fill(NM.long)], y = [...M, ...ML], sy = x.map(() => NM.sM);
    const fit = lm((t, p) => p[0] * (1 - p[1] * Math.exp(-t / p[2])), x, y, sy, [Minf, 2, NM.delays[M.findIndex((v) => v > 0)] / Math.LN2]);
    Object.assign(out, {
      T1: fit.p[2], k: fit.p[1], fit, line: false,
      data: { x, y, sy, xlabel: 'delay τ (ms)', ylabel: 'M (V)', zeroX: true, curve: fit.f },
      results: [
        result('T1', '$T_1$ (three-parameter fit)', fit.p[2], fit.sp[2], { unit: '\\mathrm{ms}', accepted: NM.T1, note: 'true' }),
        result('k', '$k$ (2 for a perfect 180°)', fit.p[1], fit.sp[1], { accepted: null }),
      ],
    });
  }
  const at = Math.max(0, Math.min(NM.delays.length - 1, o.at ?? 4));
  const pts = [];
  for (let k = 0; k <= 300; k++) { const t = k / 300; pts.push([r6(t), r6(M[at] * Math.exp(-t / NM.T2s) * Math.cos(2 * Math.PI * NM.df * t) + 0.012 * z[NM.delays.length + NM.nLong + (k % 290)])]); }
  out.raw = { x: [0, 1], y: [-1.15, 1.15], xlabel: 'time after the 90° pulse (ms)', ylabel: 'receiver (V)', paths: [{ pts, color: 'teal', width: 1.3 }], hlines: [{ y: 0, color: 'ink3' }], texts: [{ s: `τ = ${NM.delays[at]} ms`, x: 0.98, y: 1.05, align: 'right', color: 'ink2' }] };
  return out;
}

// ─── E.15: the muon lifetime ──────────────────────────────────────────────
export const MU = {
  window: 20, bin: 0.25,      // μs
  bgFrac: 0.04,               // accidental stops, flat in time, as a fraction of the events
  apFrac: 0.05, apTau: 0.12,  // afterpulses: a fraction of extra early stops, and their time scale (μs)
  cut: 1.0,                   // μs: the start of the fit window when early bins are cut
};
/** The fraction of decay events from μ⁻ (a captured μ⁻ makes no decay electron). */
export function muMinusShare(ratio = K.muRatio) {
  const fp = ratio / (1 + ratio), fm = 1 / (1 + ratio);
  const dec = fm * (K.tauMuC / K.tauMu);
  return dec / (fp + dec);
}
/** Expected counts in [t0, t1) for N events (mix of μ⁺, μ⁻ in carbon, flat background, optional afterpulses). */
export function muExpect(t0, t1, N, ap = false) {
  const W = MU.window, fm = muMinusShare(), fp = 1 - fm;
  const nd = N * (1 - MU.bgFrac);
  const part = (tau) => (Math.exp(-t0 / tau) - Math.exp(-t1 / tau)) / (1 - Math.exp(-W / tau));
  let mu = nd * (fp * part(K.tauMu) + fm * part(K.tauMuC)) + (N * MU.bgFrac * (t1 - t0)) / W;
  if (ap) mu += N * MU.apFrac * (Math.exp(-t0 / MU.apTau) - Math.exp(-t1 / MU.apTau));
  return mu;
}
/** Fit A e^(−t/τ) + B (integrated over each bin) by binned Poisson maximum likelihood. */
export function muFit(edges, counts, from = 0) {
  const idx = counts.map((_, i) => i).filter((i) => edges[i] >= from - 1e-9);
  const x = idx.map((i) => i), y = idx.map((i) => counts[i]);
  const f = (i, p) => p[0] * p[1] * (Math.exp(-edges[i] / p[1]) - Math.exp(-edges[i + 1] / p[1])) + p[2] * (edges[i + 1] - edges[i]);
  const tot = y.reduce((s, v) => s + v, 0);
  return lm(f, x, y, null, [tot / 2, 2.0, Math.max(0.5, (y[y.length - 1] + 1) / (edges[1] - edges[0]))], { poisson: true });
}
/** The lifetime a single-exponential fit gives for the expected (noise-free) histogram of the μ⁺/μ⁻ mix. */
export function muMixTau(from = MU.cut) {
  const nb = Math.round(MU.window / MU.bin), edges = Array.from({ length: nb + 1 }, (_, i) => +(i * MU.bin).toFixed(6));
  const mu = edges.slice(0, -1).map((t, i) => muExpect(t, edges[i + 1], 1e6));
  return muFit(edges, mu, from).p[1];
}

function muon(o) {
  const N = Math.round(o.N || 4000);
  const nb = Math.round(MU.window / MU.bin), edges = Array.from({ length: nb + 1 }, (_, i) => +(i * MU.bin).toFixed(6));
  const g = makeRng(o.seed), z = draws(g, nb), u = unis(g, nb);
  const counts = edges.slice(0, -1).map((t, i) => poissonFrom(muExpect(t, edges[i + 1], N, o.flags.afterpulse), u[i], z[i]));
  const from = o.analysis === 'cut' ? MU.cut : 0;
  const fit = muFit(edges, counts, from);
  const mid = edges.slice(0, -1).map((t) => t + MU.bin / 2);
  const model = (t) => { const i = Math.min(nb - 1, Math.max(0, Math.floor(t / MU.bin))); return fit.p[0] * fit.p[1] * (Math.exp(-edges[i] / fit.p[1]) - Math.exp(-edges[i + 1] / fit.p[1])) + fit.p[2] * MU.bin; };
  const used = mid.map((t, i) => i).filter((i) => edges[i] >= from - 1e-9);
  const lg = counts.map((c) => (c > 0 ? Math.log10(c) : NaN));
  const smooth = []; for (let k = 0; k <= 400; k++) { const t = (k / 400) * MU.window; smooth.push([r6(t), r6(fit.p[0] * fit.p[1] * (1 - Math.exp(-MU.bin / fit.p[1])) * Math.exp(-t / fit.p[1]) + fit.p[2] * MU.bin)]); }
  const top = Math.max(...counts) * 1.12;
  return {
    edges, counts, fit, N, from,
    data: { x: used.map((i) => mid[i]), y: used.map((i) => counts[i]), sy: used.map((i) => Math.sqrt(Math.max(model(mid[i]), 1))), xlabel: 'decay time t (μs)', ylabel: 'counts per 0.25 μs', zeroX: true, curveSteps: true, normRes: true, model },
    results: [
      result('tau', '$\\tau$ (Poisson fit)', fit.p[1], fit.sp[1], { unit: '\\mu\\mathrm{s}', accepted: K.tauMu }),
    ],
    mixTau: muMixTau(from),
    raw: { x: [0, MU.window], y: [0, r6(top)], xlabel: 'time from the muon’s stop to its decay (μs)', ylabel: 'counts per bin', bars: { edges, counts, color: 'accent' }, paths: [{ pts: smooth, color: 'gold', width: 2 }], vlines: from > 0 ? [{ x: from, color: 'warn', dash: [5, 4] }] : [] },
  };
}

// ─── E.16: the Hall effect in n-type germanium ────────────────────────────
export const HL = {
  t: 1.00e-3, w: 10.0e-3, l: 20.0e-3, I: 30.0e-3,            // m, m, m, A
  n: 1.20e21, mu: 0.360,                                     // m⁻³ (electrons), m²/(V s) (Hall mobility)
  V0: 9.0e-3, drift: 0.20e-3, Vth: 0.15e-3, xi: 1.0,         // V offset (misaligned contacts); V/min as the sample warms; V thermoelectric; magnetoresistance coefficient
  fields: [0.05, 0.10, 0.15, 0.20, 0.25, 0.30],              // T
  sV: 20e-6, sB: 0.5e-3,                                     // V; T (teslameter reading)
  typeB: { B: 0.010, t: 0.010, I: 0.002 },
  muTab: 0.39,                                               // m²/(V s): electrons in pure Ge at 300 K (Sze)
};
export const hallRH = () => -1 / (HL.n * K.e);
export const hallRho = () => 1 / (HL.n * K.e * HL.mu);

function hall(o) {
  const g = makeRng(o.seed), z = draws(g, 4 * HL.fields.length + 4);
  const drift = o.flags.drift ? HL.drift : 0;
  const V = (B, tmin, k) => {
    const off = (HL.V0 + drift * tmin) * (1 + HL.xi * (HL.mu * B) ** 2);
    return (hallRH() * HL.I * B) / HL.t + off + HL.Vth + HL.sV * z[k];
  };
  const Bm = (B, k) => B + HL.sB * z[2 * HL.fields.length + k];
  let x, y, sy, readings;
  if (o.analysis === 'single') {
    const Bs = [0, ...HL.fields];
    readings = Bs.map((B, i) => ({ B: Bm(B, i), t: 2 * i, V: V(B, 2 * i, i) }));
    x = readings.map((r) => r.B); y = readings.map((r) => 1000 * r.V); sy = x.map(() => 1000 * HL.sV);
  } else {
    readings = [];
    HL.fields.forEach((B, i) => {
      readings.push({ B: Bm(B, i), t: 2 * i, V: V(B, 2 * i, i) });
      readings.push({ B: -Bm(B, i + HL.fields.length) , t: 2 * i + 0.5, V: V(-B, 2 * i + 0.5, i + HL.fields.length) });
    });
    x = HL.fields.map((_, i) => (readings[2 * i].B - readings[2 * i + 1].B) / 2);
    y = HL.fields.map((_, i) => (1000 * (readings[2 * i].V - readings[2 * i + 1].V)) / 2);
    sy = x.map(() => (1000 * HL.sV) / Math.SQRT2);
  }
  const fit = fitLine(x, y, sy);
  fit.f = (b) => fit.a + fit.b * b;
  const RH = (fit.b / 1000) * HL.t / HL.I, sRH = (fit.sb / 1000) * HL.t / HL.I;
  const rel = Math.hypot(HL.typeB.B, HL.typeB.t, HL.typeB.I);
  const nn = -1 / (RH * K.e), rho = hallRho();
  return {
    readings, fit, line: true, RH, n: nn, rho,
    data: { x, y, sy, xlabel: o.analysis === 'single' ? 'B (T)' : '|B| (T)', ylabel: o.analysis === 'single' ? 'V (mV)' : 'Hall voltage [V(+B) − V(−B)]/2 (mV)', zeroX: true },
    results: [
      result('RH', '$R_H = \\text{slope}\\times t/I$', RH, sRH, { rel, scale: 1e-3, unit: '\\times10^{-3}\\ \\mathrm{m^3/C}', accepted: hallRH(), note: 'sample' }),
      result('mu', '$\\mu_H = |R_H|/\\rho$', Math.abs(RH) / rho, Math.abs(sRH) / rho, { rel: Math.hypot(rel, 0.01), unit: '\\mathrm{m^2/(V\\,s)}', accepted: null }),
    ],
    raw: {
      x: [-1, readings[readings.length - 1].t + 1], y: [r6(Math.min(...readings.map((r) => 1000 * r.V)) - 6), r6(Math.max(...readings.map((r) => 1000 * r.V)) + 6)],
      xlabel: 'time (min)', ylabel: 'V across the sample (mV)',
      points: readings.map((r) => ({ x: r.t, y: r6(1000 * r.V), color: r.B < -1e-9 ? 'violet' : 'accent' })),
      hlines: [{ y: r6(1000 * (HL.V0 + HL.Vth)), color: 'ink3', dash: [5, 4] }],
      texts: [{ s: 'blue: +B   violet: −B', x: readings[readings.length - 1].t + 0.8, y: r6(Math.max(...readings.map((r) => 1000 * r.V)) + 4), align: 'right', color: 'ink2', size: 10.5 }],
    },
  };
}

// ─── E.17: YBCO's superconducting transition ──────────────────────────────
export const TC = {
  Tc: 92.0, w: 0.35,          // K: the midpoint, and the logistic width (10–90 % is 2 ln 9 · w)
  Ra: 0.10e-3, Rb: 1.0e-5,    // Ω and Ω/K: the normal state R = Ra + Rb·T
  I: 0.100,                   // A
  rate: 1.0, lag: 50,         // K/min sweep; s: the sample's lag behind the sensor
  T: [80, 110], dT: 0.25,     // K: the sweep, a reading every 15 s
  emf: 6.0e-6, emfDrift: 0.5e-6, sV: 0.3e-6, sT: 0.03, uSensor: 0.3,
  normal: [97, 110],          // K: where the normal state is fitted
  typical: 92,                // K: YBa₂Cu₃O₇ at optimal oxygen content
};
const logistic = (x) => 1 / (1 + Math.exp(-x));
export const tcR = (Ts) => (TC.Ra + TC.Rb * Ts) * logistic((Ts - TC.Tc) / TC.w);
/** The temperature where a sweep's normalized R(T) crosses level q, by linear interpolation. */
function crossing(T, r, q) {
  for (let i = 1; i < T.length; i++) if ((r[i - 1] - q) * (r[i] - q) <= 0 && r[i] !== r[i - 1]) return T[i - 1] + ((q - r[i - 1]) * (T[i] - T[i - 1])) / (r[i] - r[i - 1]);
  return NaN;
}

function tc(o) {
  const n = Math.round((TC.T[1] - TC.T[0]) / TC.dT) + 1;
  const g = makeRng(o.seed), z = draws(g, 6 * n);
  const off = (TC.rate / 60) * TC.lag;                       // K: sensor minus sample while warming
  const sweep = (dir, k0) => {
    const T = [], R = [];
    for (let i = 0; i < n; i++) {
      const Tsens = dir > 0 ? TC.T[0] + i * TC.dT : TC.T[1] - i * TC.dT;
      const Ts = Tsens - dir * off;
      const frac = i / (n - 1);
      const emf = o.flags.emf ? TC.emf + TC.emfDrift * frac : 0;
      const Vp = TC.I * tcR(Ts) + emf + TC.sV * z[k0 + 3 * i];
      const Vm = -TC.I * tcR(Ts) + emf + TC.sV * z[k0 + 3 * i + 1];
      const V = o.flags.rev ? (Vp - Vm) / 2 : Vp;
      T.push(+(Tsens + TC.sT * z[k0 + 3 * i + 2]).toFixed(3)); R.push(V / TC.I);
    }
    const iN = T.map((t, i) => i).filter((i) => T[i] >= TC.normal[0] && T[i] <= TC.normal[1]);
    const nf = fitLine(iN.map((i) => T[i]), iN.map((i) => R[i]));
    const r = R.map((v, i) => v / (nf.a + nf.b * T[i]));
    const order = T.map((t, i) => i).sort((a, b) => T[a] - T[b]);
    const Ts2 = order.map((i) => T[i]), r2 = order.map((i) => r[i]);
    const mid = crossing(Ts2, r2, 0.5), t10 = crossing(Ts2, r2, 0.1), t90 = crossing(Ts2, r2, 0.9);
    const low = R.filter((_, i) => T[i] < TC.Tc - 4);
    const floor = low.reduce((s, v) => s + v, 0) / low.length;
    const sFloor = Math.sqrt(low.reduce((s, v) => s + (v - floor) ** 2, 0) / (low.length - 1) / low.length);
    return { T, R, r, mid, width: t90 - t10, floor, sFloor, nf };
  };
  const warm = sweep(+1, 0), cool = sweep(-1, 3 * n);
  const pick = o.analysis === 'cool' ? cool.mid : o.analysis === 'warm' ? warm.mid : (warm.mid + cool.mid) / 2;
  const sMid = Math.hypot(TC.uSensor, 0.03, o.analysis === 'avg' ? 0 : 0);
  const half = Math.abs(warm.mid - cool.mid) / 2;
  const used = o.analysis === 'cool' ? [cool] : o.analysis === 'warm' ? [warm] : [warm, cool];
  const zoomPts = (s) => s.T.map((t, i) => [t, s.r[i]]).filter(([t]) => t > TC.Tc - 5 && t < TC.Tc + 5);
  return {
    warm, cool, half, Tc: pick, line: false,
    data: {
      x: [], y: [], sy: [], xlabel: 'T read by the sensor (K)', ylabel: 'R / R(normal)', x0: TC.Tc - 5, x1: TC.Tc + 5, y0: -0.08, y1: 1.12,
      paths: used.map((s) => ({ pts: zoomPts(s), color: s === warm ? 'warn' : 'accent', width: 1.8 })),
      marks: used.map((s) => ({ x: s.mid, y: 0.5, color: s === warm ? 'warn' : 'accent' })),
      hline: 0.5,
    },
    fit: null,
    results: [
      result('Tc', o.analysis === 'avg' ? '$T_c$ (mean of the two sweeps)' : `$T_c$ (${o.analysis === 'warm' ? 'warming' : 'cooling'} sweep)`, pick, sMid, { unit: '\\mathrm{K}', accepted: null }),
      result('half', 'half the warming–cooling gap', half, 0, { unit: '\\mathrm{K}', accepted: null }),
      result('floor', '$R$ below $T_c$', 1e6 * (used[0].floor), 1e6 * used[0].sFloor, { unit: '\\mu\\Omega', accepted: null }),
    ],
    raw: {
      x: [TC.T[0], TC.T[1]], y: [-0.06, 1.25], xlabel: 'T read by the sensor (K)', ylabel: 'R (mΩ)',
      paths: [{ pts: cool.T.map((t, i) => [t, r6(1000 * cool.R[i])]), color: 'accent', width: 1.6 }, { pts: warm.T.map((t, i) => [t, r6(1000 * warm.R[i])]), color: 'warn', width: 1.6 }],
      texts: [{ s: 'cooling', x: 108, y: 1.0, align: 'right', color: 'accent', dy: 14 }, { s: 'warming', x: 108, y: 1.0, align: 'right', color: 'warn', dy: -2 }],
    },
  };
}

// ─── the registry ─────────────────────────────────────────────────────────
export const RIGS = {
  blackbody: {
    title: 'A cavity blackbody seen by a thermopile', run: blackbody,
    note: 'The cavity is taken as a grey body of emissivity 0.99 at one temperature, the apertures as small and on axis, and the thermopile’s response as linear.',
    flags: [{ key: 'gradient', label: 'Thermocouple off the cavity floor', value: true, explain: 'The cavity’s thermocouple sits where the wall is cooler than the floor that radiates: it reads low by 2 % of the temperature rise.' }],
    analyses: [['net', '$V$ against $T^4 - T_0^4$'], ['loglog', '$\\ln V$ against $\\ln T$']],
  },
  zeeman: {
    title: 'The cadmium red line split in a magnetic field, seen through a Fabry–Pérot etalon', run: zeeman,
    note: 'Transverse view through a polarizer that passes only the σ components; the etalon is ideal and the field uniform across the lamp unless the gradient is switched on.',
    flags: [{ key: 'gradient', label: 'Lamp off the gap centre', value: true, explain: 'The probe was calibrated at the centre of the gap; the lamp’s glowing column sits where the field is 3 % weaker.' }],
    analyses: [['centre', 'B as read at the gap centre'], ['mapped', 'B corrected by a field map']],
    at: { label: 'Profile shown at $B$', values: ZM.fields, unit: '\\mathrm{T}', explain: 'Which field’s ring profile the top panel shows (the probe’s reading).' },
  },
  compton: {
    title: 'Cs-137 gammas scattered by an aluminium rod into a NaI(Tl) detector', run: compton,
    note: 'Each angle is an hour of counting; the scattered photopeak sits on a smooth background, and the detector’s angular acceptance is taken as a point.',
    flags: [{ key: 'drift', label: 'Photomultiplier gain drifts', value: true, explain: 'As the tube and the room warm through the day, the gain falls by 2.5 % between the first angle and the last.' }],
    analyses: [['once', 'Calibrate once, at the start'], ['each', 'Recalibrate on Cs-137 at each angle']],
    at: { label: 'Spectrum shown at $\\theta$', values: CP.angles, unit: '^\\circ', explain: 'Which angle’s spectrum the top panel shows.' },
  },
  gamma: {
    title: 'A NaI(Tl) spectrometer: calibration sources and an unknown', run: gammaRun,
    note: 'Line shapes are a teaching model: a Gaussian photopeak with FWHM growing as √E, a flat Compton continuum with a smeared edge, a small backscatter peak and a falling room background.',
    flags: [{ key: 'drift', label: 'Gain shifts before the unknown’s run', value: true, explain: 'The room warmed overnight: the unknown was counted with the gain 1.5 % higher than during the calibration.' }],
    analyses: [['cal', 'Calibration only'], ['k40', 'Calibration + K-40 line as a check']],
    src: { label: 'Spectrum shown', options: Object.entries(GS.sources).map(([k, v]) => [k, v.label]), explain: 'Each source counted on its own; every spectrum also holds the K-40 line at 1461 keV from the building’s concrete.' },
  },
  nmr: {
    title: 'Pulsed proton NMR: inversion recovery', run: nmr,
    note: 'Quadrature detection with the phase set, so the signal keeps its sign; relaxation is a single exponential.',
    flags: [{ key: 'angle', label: 'The “180°” pulse is really 160°', value: true, explain: 'The pulse length was set by eye on a weak signal: the magnetization is tipped by 160°, not 180°, so it starts at −0.94 M₀, not −M₀.' }],
    analyses: [['fit3', 'Three-parameter fit'], ['semilog', '$\\ln(M_\\infty - M)$ against $\\tau$'], ['null', 'Null point: $T_1 = \\tau_0/\\ln 2$']],
    at: { label: 'FID shown at delay $\\tau$', values: NM.delays, unit: '\\mathrm{ms}', explain: 'The receiver’s output after the 90° read pulse, for one delay: its starting height is M(τ).' },
  },
  muon: {
    title: 'Cosmic-ray muons stopping and decaying in a plastic scintillator', run: muon,
    note: 'Sea-level muons, μ⁺/μ⁻ = 1.27; a μ⁻ in carbon disappears faster (2.026 μs) because some are captured by nuclei. Accidental stops are flat in time.',
    flags: [{ key: 'afterpulse', label: 'Photomultiplier afterpulsing', value: true, explain: 'The tube sometimes fires again a few hundred nanoseconds after the muon’s flash, faking an early “decay”.' }],
    analyses: [['cut', 'Fit from 1 μs'], ['all', 'Fit every bin']],
    N: { label: 'Events recorded $N$', min: 1000, max: 50000, value: 4000, explain: 'Stopping muons arrive at a few per minute: 4000 is about two days of running.' },
  },
  hall: {
    title: 'The Hall voltage across a germanium slab', run: hall,
    note: 'A 1 mm slab of n-type Ge carrying 30 mA; the voltage contacts are misaligned by 0.2 mm, which adds an offset proportional to the current.',
    flags: [{ key: 'drift', label: 'Sample warms during the run', value: true, explain: 'The current heats the slab; its resistivity, and with it the misalignment offset, creeps up by 0.2 mV a minute.' }],
    analyses: [['reverse', 'Reverse the field at each step'], ['single', 'One polarity, fit with an intercept']],
  },
  tc: {
    title: 'A YBCO pellet’s resistance through its superconducting transition', run: tc,
    note: 'Four-probe resistance at 100 mA; the sensor is on the copper block, and the pellet lags it by 50 s while the block is swept at 1 K/min.',
    flags: [
      { key: 'emf', label: 'Thermal EMFs in the voltage leads', value: true, explain: 'Junctions of unlike metals at different temperatures add a few microvolts that do not depend on the current.' },
      { key: 'rev', label: 'Reverse the current at each reading', value: false, explain: 'Half the difference of V(+I) and V(−I) keeps the part that follows the current and drops the rest.' },
    ],
    analyses: [['avg', 'Mean of both sweeps'], ['warm', 'Warming sweep only'], ['cool', 'Cooling sweep only']],
  },
};

/** Run an experiment: { seed, flags, analysis, at, src, N }. */
export function run(id, opts = {}) {
  const R = RIGS[id];
  if (!R) throw new Error(`labg-rig: no experiment “${id}”`);
  const flags = {};
  for (const f of R.flags) flags[f.key] = opts.flags?.[f.key] ?? f.value;
  const analysis = R.analyses.some((a) => a[0] === opts.analysis) ? opts.analysis : R.analyses[0][0];
  const out = R.run({ seed: opts.seed ?? 1, flags, analysis, at: opts.at, src: opts.src ?? 'unknown', N: opts.N ?? R.N?.value });
  if (out.fit && out.fit.dof > 0 && Number.isFinite(out.fit.chi2)) out.fit.pval = chi2Sf(out.fit.chi2, out.fit.dof);
  return { ...out, flags, analysis, rig: R };
}
