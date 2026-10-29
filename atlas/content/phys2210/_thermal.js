// Constants and picture builders for the PHYS 2210 thermal lessons (modules
// M16 and M17). Every picture builder returns an ordinary `graph` spec, so the
// content test validates it like any other visual.
// Not a lesson: the leading underscore keeps it out of the lesson registry.

import { fmt } from '../../src/core/format.js';
export { sci, thou } from './_energy.js';
export { s3 } from './_kinematics.js';

// ─── constants ─────────────────────────────────────────────────────────────
// Exact SI values (2019 redefinition), as tabulated by NIST (CODATA 2022).
export const KB = 1.380649e-23;          // J/K
export const NA = 6.02214076e23;         // 1/mol
export const R = KB * NA;                // 8.314 462 618… J/(mol K)
export const SIGMA = 5.670374419e-8;     // W/(m² K⁴), Stefan–Boltzmann
export const C0 = 273.15;                // K at 0 °C, by definition
export const ATM = 101325;               // Pa, one standard atmosphere

/** Kelvin ↔ Celsius ↔ Fahrenheit. */
export const toC = (K) => K - C0;
export const toK = (C) => C + C0;
export const cToF = (C) => 1.8 * C + 32;
export const kToF = (K) => cToF(toC(K));

/** Molar masses, g/mol (IUPAC standard atomic weights). */
export const MOLAR = { H2: 2.01588, He: 4.002602, N2: 28.0134, O2: 31.9988, Ar: 39.948, Xe: 131.293, CO2: 44.0095, O: 15.999 };

// Cryogens at one standard atmosphere, from the NIST Chemistry WebBook's fluid
// properties (Span et al. 2000 for N₂, Schmidt & Wagner 1985 for O₂), rounded:
// normal boiling point Tb (K), latent heat of vaporization Lv (J/kg), density of
// the boiling liquid (kg/m³), specific heat of the liquid and of the gas (J/(kg K)).
export const LN2 = { Tb: 77.36, Lv: 199e3, rho: 806, c: 2040, cGas: 1040, Tm: 63.15, Lf: 25.7e3 };
export const LOX = { Tb: 90.19, Lv: 213e3, rho: 1141, c: 1700 };

// Water near atmospheric pressure (OpenStax University Physics Vol. 2, Tables 1.3 and 1.4).
export const WATER = { c: 4184, cIce: 2090, cSteam: 2010, Lf: 334e3, Lv: 2257e3 };

// Specific heats near 25 °C, J/(kg K) (CRC Handbook); 304 stainless from NIST's fit at 293 K.
export const SPECIFIC = { water: 4184, aluminium: 897, copper: 385, iron: 449, steel: 470, lead: 129, silver: 235, titanium: 523, gold: 129 };

// 304 stainless steel at cryogenic temperatures: NIST's curve fits (cryogenic
// material properties database, trc.nist.gov/cryogenics), valid 4–300 K, ±5 %.
const SS_DL = [-2.9554e2, -3.9811e-1, 9.2683e-3, -2.0261e-5, 1.7127e-8];
const SS_CP = [22.0061, -127.5528, 303.647, -381.0098, 274.0328, -112.9212, 24.7593, -2.239153, 0];
/** 304 stainless: (L − L₂₉₃)/L₂₉₃ at T (K); constant below 23 K. */
export const ssContraction = (T) => (T < 23 ? -300.04e-5 : SS_DL.reduce((s, c, i) => s + c * T ** i, 0) * 1e-5);
/** 304 stainless: specific heat c(T), J/(kg K). */
export const ssSpecificHeat = (T) => { const x = Math.log10(T); return 10 ** SS_CP.reduce((s, c, i) => s + c * x ** i, 0); };
/** 304 stainless: heat to cool 1 kg from T1 down to T0 (J/kg) — the integral of c dT, by Simpson's rule. */
export function ssEnthalpy(T0, T1, n = 400) {
  const h = (T1 - T0) / n;
  let s = ssSpecificHeat(T0) + ssSpecificHeat(T1);
  for (let i = 1; i < n; i++) s += (i % 2 ? 4 : 2) * ssSpecificHeat(T0 + i * h);
  return (s * h) / 3;
}
/** The same fits as expression text of T (for graph curves). */
export const ssContractionExpr = (L = 1) => `${L}*(${SS_DL.map((c, i) => `(${c})*x^${i}`).join(' + ')})*1e-5`;
export const ssSpecificHeatExpr = () => `10^(${SS_CP.map((c, i) => `(${c})*(log10(x))^${i}`).join(' + ')})`;

// ─── small text helpers ────────────────────────────────────────────────────
const r4 = (v) => +(+v).toFixed(4);
/** A number with up to n significant figures (trailing zeros dropped) and a true minus sign, for canvas labels. */
export const lab = (x, n = 5) => String(+(+x).toPrecision(n)).replace('-', '−');
/** TeX for a signed number: a real minus sign in math mode works as-is; this keeps “−” for prose. */
export const neg = (x, n = 4) => fmt(x, n).replace('-', '−');
/** A label-only point (no visible dot). Centred when `centre` (by an estimate of the text width). */
export const tag = (x, y, text, color = 'ink2', dx = 0, dy = 0, centre = false) => ({ x: r4(x), y: r4(y), r: 0.01, color, label: text, labelDx: centre ? dx - 3.3 * [...text].length : dx, labelDy: dy });

// ─── pictures ──────────────────────────────────────────────────────────────

const SCALES = {
  K: { head: 'kelvin', text: (K) => `${lab(K)} K` },
  C: { head: 'Celsius', text: (K) => `${lab(toC(K))} °C` },
  F: { head: 'Fahrenheit', text: (K) => `${lab(kToF(K))} °F` },
};

/**
 * Thermometer scales side by side: one vertical line per scale, with marked
 * temperatures read across. The vertical position is the temperature itself.
 *   marks    [{ K, name, color, cells: { K: 'text' | '?' | false, … } }] — a cell defaults to the value
 *   cols     which scales, left to right: 'K', 'C', 'F'
 *   bracket  { from: K1, to: K2, label } — a two-headed arrow beside the first scale
 */
export function scalesPic({ marks, cols = ['K', 'C'], bracket = null, range = null, caption, alt }) {
  const xs = cols.map((_, i) => 1.5 * i);
  const Ks = marks.map((m) => m.K);
  const lo0 = range ? range[0] : Math.min(...Ks), hi0 = range ? range[1] : Math.max(...Ks);
  const span = Math.max(hi0 - lo0, 40);
  const y0 = lo0 - 0.1 * span, y1 = hi0 + 0.2 * span;
  const curves = [], points = [], arrows = [];
  xs.forEach((x, i) => {
    curves.push({ param: [String(x), 't'], t: [r4(y0), r4(y1 - 0.06 * span)], color: 'ink3', width: 2 });
    points.push(tag(x, y1 - 0.02 * span, SCALES[cols[i]].head, 'ink2', 0, 0, true));
  });
  for (const m of marks) {
    const color = m.color || 'accent';
    curves.push({ fn: String(r4(m.K)), domain: [-0.1, r4(xs[xs.length - 1] + 0.1)], color: 'ink4', width: 1, dash: true });
    if (m.name) points.push(tag(-1.65, m.K, m.name, color, 0, 0));
    cols.forEach((col, i) => {
      const cell = m.cells?.[col];
      if (cell === false) return;
      points.push({ x: xs[i], y: r4(m.K), r: 4.5, color, label: cell ?? SCALES[col].text(m.K), labelDx: 8, labelDy: 0 });
    });
  }
  if (bracket) {
    const bx = -0.28;
    arrows.push({ from: [bx, r4((bracket.from + bracket.to) / 2)], to: [bx, r4(bracket.to)], color: 'gold' }, { from: [bx, r4((bracket.from + bracket.to) / 2)], to: [bx, r4(bracket.from)], color: 'gold' });
    points.push(tag(bx, (bracket.from + bracket.to) / 2, bracket.label, 'gold', -10 - 6.6 * [...bracket.label].length, 0));
  }
  return {
    type: 'graph',
    params: { x: [-1.7, r4(xs[xs.length - 1] + 1.25)], y: [r4(y0), r4(y1)], aspect: 'wide', axes: false, grid: false, xlabel: '', ylabel: '', alt: alt || 'Temperature scales side by side', curves, points, arrows },
    caption: caption ?? 'Each vertical line is a thermometer scale; a dashed line joins the readings of one temperature on each. Heights are temperatures, drawn to scale.',
  };
}

/**
 * Bodies side by side, with temperatures over them and arrows for heat flow.
 *   bodies  [{ name, temp, w = 1, h = 1, color = 'accent' }]
 *   flows   [{ from, to, label = 'Q' }] between adjacent bodies, by index
 */
export function bodiesPic({ bodies, flows = [], gap = 1.1, caption, alt }) {
  let x = 0;
  const shade = [], points = [], arrows = [];
  const at = bodies.map((b) => { const p = { x0: x, x1: x + (b.w ?? 1), h: b.h ?? 1 }; x += (b.w ?? 1) + gap; return p; });
  const H = Math.max(...at.map((p) => p.h));
  bodies.forEach((b, i) => {
    const p = at[i], cx = (p.x0 + p.x1) / 2;
    shade.push({ fn: String(r4(p.h)), lower: '0', from: r4(p.x0), to: r4(p.x1), color: b.color || 'accent', alpha: b.alpha ?? 0.5 });
    if (b.name) points.push(tag(cx, -0.14 * H, b.name, 'ink', 0, 0, true));
    if (b.temp) points.push(tag(cx, p.h + 0.14 * H, b.temp, b.color || 'accent', 0, 0, true));
  });
  for (const f of flows) {
    const a = at[f.from], b = at[f.to], y = 0.5 * Math.min(a.h, b.h);
    const [xa, xb] = f.from < f.to ? [a.x1 + 0.12, b.x0 - 0.12] : [a.x0 - 0.12, b.x1 + 0.12];
    arrows.push({ from: [r4(xa), r4(y)], to: [r4(xb), r4(y)], color: f.color || 'gold', label: f.label ?? 'Q', labelDx: f.from < f.to ? -24 - 3 * (f.label ?? 'Q').length : 6, labelDy: -14 });
  }
  const W = x - gap;
  return {
    type: 'graph',
    params: { x: [-0.6, r4(W + 0.6)], y: [r4(-0.42 * H), r4(1.45 * H)], equal: true, aspect: 'wide', axes: false, grid: false, xlabel: '', ylabel: '', alt: alt || 'Bodies with their temperatures', shade, points, arrows },
    caption: caption ?? 'Not to scale. Arrows show the direction heat flows.',
  };
}

/**
 * Two bodies in thermal contact, insulated from everything else: temperature
 * against time. Heat flow ∝ the temperature difference, so both approach the
 * common temperature exponentially, with time constant tau (minutes).
 *   r  = C_B / C_A, the ratio of the heat capacities
 */
export function equilibriumGraph({ TA, TB, r = 1, tau = 2, tmax = 10, names = ['A', 'B'], showEq = true, y = null, caption, alt }) {
  const Teq = (TA + r * TB) / (1 + r);
  const lo = Math.min(TA, TB), hi = Math.max(TA, TB), pad = 0.12 * (hi - lo);
  return {
    type: 'graph',
    params: {
      x: [0, tmax], y: y || [r4(lo - pad), r4(hi + pad)], aspect: 'wide', xlabel: 't (min)', ylabel: 'T (K)',
      alt: alt || 'Two temperatures approaching each other over time',
      curves: [
        { fn: `${r4(Teq)} + ${r4(TA - Teq)}*exp(-x/${tau})`, color: 'warn', width: 2.6, label: names[0], labelAt: 0.3, labelDy: TA > TB ? -12 : 14 },
        { fn: `${r4(Teq)} + ${r4(TB - Teq)}*exp(-x/${tau})`, color: 'accent', width: 2.6, label: names[1], labelAt: 0.3, labelDy: TB > TA ? -12 : 14 },
      ],
      hlines: showEq ? [{ y: r4(Teq), label: 'equilibrium', color: 'ink3' }] : [],
    },
    caption: caption ?? 'Each body is taken to have one uniform temperature, and the pair is insulated from everything else.',
  };
}

/**
 * A pipe seen end-on: a cold fluid inside a steel wall, with an optional layer
 * outside it (frost, or insulation of a given thickness as a fraction of the radius).
 */
export function pipePic({ inside = 'LOX, 90 K', outside = 'humid air, 293 K', layer = 'frost', layerT = 0.3, caption, alt }) {
  const circle = (r, color, width, dash = false) => ({ param: [`${r}*cos(t)`, `${r}*sin(t)`], t: [0, 6.2832], color, width, dash });
  const curves = [circle(1, 'ink2', 5)];
  if (layer) for (let k = 1; k <= 4; k++) curves.push(circle(r4(1.04 + (k * layerT) / 4), layer === 'frost' ? 'ink3' : 'warn', layer === 'frost' ? 1.4 : 2, layer === 'frost'));
  const points = [tag(0, 0, inside, 'accent', 0, 0, true), tag(0.62, -1.02, 'steel wall', 'ink2', 10, 6)];
  if (layer) points.push(tag(0.78, 0.98, layer, layer === 'frost' ? 'ink2' : 'warn', 12, -6));
  points.push(tag(-2.9, 1.25, outside, 'warn', 0, 0));
  return {
    type: 'graph',
    params: {
      x: [-3, 3], y: [-1.5, 1.5], equal: true, aspect: 'wide', axes: false, grid: false, xlabel: '', ylabel: '', alt: alt || 'A cold pipe seen end-on',
      shade: [{ fn: 'sqrt(max(0, 0.9 - x^2))', lower: '-sqrt(max(0, 0.9 - x^2))', from: -0.9487, to: 0.9487, color: 'accent', alpha: 0.28 }],
      curves, points,
    },
    caption: caption ?? 'A cold line seen end-on, not to scale.',
  };
}

// 6061-T6 aluminium: NIST's fit for (L − L₂₉₃)/L₂₉₃, valid 4–300 K (constant below 18 K).
const AL_DL = [-4.1277e2, -3.0389e-1, 8.7696e-3, -9.9821e-6, 0];
export const alContraction = (T) => (T < 18 ? -415.45e-5 : AL_DL.reduce((s, c, i) => s + c * T ** i, 0) * 1e-5);
/** NIST contraction polynomials as expression text in variable v, scaled by k (k = 1000 gives mm per metre). */
const polyExpr = (C, v, k) => `${k}*(${C.map((c, i) => `(${c})*${v}^${i}`).join(' + ')})*1e-5`;
export const ssDLExpr = (v = 'x', k = 1000) => polyExpr(SS_DL, v, k);
export const alDLExpr = (v = 'x', k = 1000) => polyExpr(AL_DL, v, k);
/** Linear expansion coefficients at 293 K from the same fits (the slopes there), 1/K. */
export const ALPHA_SS = 1.54e-5, ALPHA_AL = 2.26e-5;

/**
 * NIST's measured contraction of 304 stainless (and 6061 aluminium) on cooling from 293 K,
 * in mm per metre, against temperature.
 *   mats    ['ss'] or ['ss', 'al']
 *   linear  also draw ΔL = αL₀ΔT with the room-temperature α (dashed)
 *   vline   a temperature to mark; chord: draw the chord from 293 K to this temperature
 */
export function contractionGraph({ mats = ['ss'], linear = false, vline = null, chord = null, caption, alt }) {
  const curves = [];
  const M = { ss: { name: '304 stainless', expr: ssDLExpr, low: 23, f: -3.0004, color: 'accent', alpha: ALPHA_SS, labelAt: 150 }, al: { name: '6061 aluminium', expr: alDLExpr, low: 18, f: -4.1545, color: 'warn', alpha: ALPHA_AL, labelAt: 120 } };
  for (const k of mats) {
    const m = M[k];
    curves.push({ fn: m.expr(), domain: [m.low, 300], color: m.color, width: 2.6, label: m.name, labelAt: m.labelAt, labelDx: 8, labelDy: k === 'al' ? 16 : -12 });
    curves.push({ fn: String(m.f), domain: [4, m.low], color: m.color, width: 2.6 });
    if (linear) curves.push({ fn: `${m.alpha * 1000}*(x - 293)`, domain: [4, 300], color: m.color, width: 1.4, dash: true });
  }
  const points = [], vlines = [];
  if (vline) vlines.push({ x: vline.T, label: vline.label, color: 'ink3' });
  if (chord) {
    const y = ssContraction(chord) * 1000;
    curves.push({ param: [`293 + t*(${r4(chord - 293)})`, `t*${r4(y)}`], t: [0, 1], color: 'gold', width: 2 });
    points.push({ x: 293, y: 0, r: 4, color: 'gold' }, { x: r4(chord), y: r4(y), r: 4, color: 'gold' });
  }
  return {
    type: 'graph',
    params: { x: [0, 310], y: [mats.includes('al') ? -4.6 : -3.4, 0.5], aspect: 'wide', xlabel: 'T (K)', ylabel: 'ΔL/L₀ (mm per m)', alt: alt || 'Measured thermal contraction of metals against temperature', curves, points, vlines },
    caption: caption ?? 'Change in length per metre on cooling from 293 K, from NIST’s fits to measurements (±5 %).' + (linear ? ' Dashed: the straight line ΔL = αL₀ΔT with the room-temperature α.' : ''),
  };
}

/**
 * A bar before and after a temperature change, the change exaggerated.
 *   before, after   labels for the two bars; dL the label of the change ('ΔL = ?')
 *   grow            true if it lengthens; clamped: the bar is held between rigid walls instead
 */
export function expansionPic({ before, after, dL = 'ΔL', grow = true, clamped = false, caption, alt }) {
  const L = 4, d = grow ? 0.55 : -0.55;
  const rect = (x0, x1, y0, y1, color, dash = false) => ({ param: [`${x0} + (${x1 - x0})*min(max(4*t, 0), 1) - (${x1 - x0})*min(max(4*t - 2, 0), 1)`, `${y0} + (${y1 - y0})*min(max(4*t - 1, 0), 1) - (${y1 - y0})*min(max(4*t - 3, 0), 1)`], t: [0, 1], color, width: 1.6, dash });
  const shade = [], curves = [], arrows = [], points = [];
  if (clamped) {
    shade.push({ fn: '0.75', lower: '0.25', from: 0, to: L, color: 'accent', alpha: 0.55 });
    for (const xw of [0, L]) {
      const s = xw === 0 ? -1 : 1;
      curves.push({ param: [String(xw), 't'], t: [-0.25, 1.25], color: 'ink2', width: 4 });
      for (let k = 0; k < 6; k++) curves.push({ param: [`${xw} + ${s}*0.22*t`, `${-0.2 + k * 0.28} + 0.22*t`], t: [0, 1], color: 'ink3', width: 1.2 });
    }
    points.push(tag(L / 2, 0.5, before, 'ink', 0, 0, true), tag(L / 2, -0.05, after, 'ink2', 0, 0, true));
    return { type: 'graph', params: { x: [-0.9, L + 0.9], y: [-0.5, 1.5], equal: true, aspect: 'wide', axes: false, grid: false, xlabel: '', ylabel: '', alt: alt || 'A bar held between two rigid walls', shade, curves, points }, caption: caption ?? 'The bar is held between rigid walls, so it cannot change length. Not to scale.' };
  }
  shade.push({ fn: '1.6', lower: '1.15', from: 0, to: L, color: 'accent', alpha: 0.35 });
  shade.push({ fn: '0.6', lower: '0.15', from: 0, to: r4(L + d), color: grow ? 'warn' : 'teal', alpha: 0.5 });
  curves.push({ param: [String(L), 't'], t: [0, 1.6], color: 'ink3', width: 1, dash: true });
  arrows.push({ from: [L, 0.86], to: [r4(L + d), 0.86], color: 'gold' }, { from: [r4(L + d), 0.86], to: [L, 0.86], color: 'gold' });
  points.push(tag(0.05, 1.82, before, 'ink2', 0, 0), tag(0.05, -0.08, after, 'ink2', 0, 0), tag(Math.max(L, L + d) + 0.15, 0.86, dL, 'gold', 4, 0));
  return {
    type: 'graph',
    params: { x: [-0.4, L + 1.9], y: [-0.4, 2.05], equal: true, aspect: 'wide', axes: false, grid: false, xlabel: '', ylabel: '', alt: alt || 'A bar before and after a temperature change', shade, curves, arrows, points },
    caption: caption ?? 'The change in length is exaggerated hugely so you can see it.',
  };
}

/** A plate with a circular hole (the setting for “does the hole grow?”). */
export function plateHolePic({ caption } = {}) {
  return {
    type: 'graph',
    params: {
      x: [-3, 3], y: [-1.5, 1.5], equal: true, aspect: 'wide', axes: false, grid: false, xlabel: '', ylabel: '', alt: 'A metal plate with a round hole',
      shade: [{ fn: '1.1', lower: '-1.1', from: -2, to: 2, color: 'ink3', alpha: 0.6 }, { fn: 'sqrt(max(0, 0.36 - x^2))', lower: '-sqrt(max(0, 0.36 - x^2))', from: -0.6, to: 0.6, color: 'bg', alpha: 1 }],
      curves: [{ param: ['0.6*cos(t)', '0.6*sin(t)'], t: [0, 6.2832], color: 'ink2', width: 1.6 }],
      points: [tag(-1.9, 1.3, 'steel plate', 'ink2'), tag(0, 0, 'hole', 'ink2', 0, 0, true)],
    },
    caption: caption ?? 'A steel plate with a round hole, before it is heated.',
  };
}

/** A cube and the same cube after warming, front views, the change exaggerated. */
export function cubePic({ caption } = {}) {
  const sq = (x0, s, color, width) => ({ param: [`${x0} + ${s}*min(max(4*t, 0), 1) - ${s}*min(max(4*t - 2, 0), 1)`, `${s}*min(max(4*t - 1, 0), 1) - ${s}*min(max(4*t - 3, 0), 1)`], t: [0, 1], color, width });
  return {
    type: 'graph',
    params: {
      x: [-0.6, 5.2], y: [-0.55, 2.3], equal: true, aspect: 'wide', axes: false, grid: false, xlabel: '', ylabel: '', alt: 'A cube before and after warming',
      shade: [{ fn: '1.5', lower: '0', from: 0, to: 1.5, color: 'accent', alpha: 0.4 }, { fn: '1.8', lower: '0', from: 2.6, to: 4.4, color: 'warn', alpha: 0.45 }],
      curves: [sq(0, 1.5, 'accent', 1.5), sq(2.6, 1.8, 'warn', 1.5)],
      points: [tag(0.75, -0.25, 'side L', 'ink2', 0, 0, true), tag(3.5, -0.25, 'side L(1 + αΔT)', 'ink2', 0, 0, true), tag(0.75, 1.75, 'before', 'accent', 0, 0, true), tag(3.5, 2.05, 'warmer by ΔT', 'warn', 0, 0, true)],
    },
    caption: caption ?? 'Every side of the cube grows by the same fraction αΔT. The growth is exaggerated.',
  };
}

/** A bearing ring and a shaft, end-on: the shaft is a little too big for the bore. */
export function ringShaftPic({ caption } = {}) {
  const circ = (cx, r, color, width) => ({ param: [`${cx} + ${r}*cos(t)`, `${r}*sin(t)`], t: [0, 6.2832], color, width });
  return {
    type: 'graph',
    params: {
      x: [-2.6, 2.6], y: [-1.3, 1.3], equal: true, aspect: 'wide', axes: false, grid: false, xlabel: '', ylabel: '', alt: 'A ring and a shaft that is slightly too large for it',
      shade: [{ fn: 'sqrt(max(0, 0.5329 - (x - 1.1)^2))', lower: '-sqrt(max(0, 0.5329 - (x - 1.1)^2))', from: 0.37, to: 1.83, color: 'ink3', alpha: 0.7 }],
      curves: [circ(-1.1, 1.0, 'accent', 3), circ(-1.1, 0.7, 'accent', 3), circ(1.1, 0.73, 'ink2', 1.6)],
      points: [tag(-1.1, -1.17, 'bearing ring', 'accent', 0, 0, true), tag(1.1, -1.0, 'shaft (a little too wide)', 'ink2', 0, 0, true)],
    },
    caption: caption ?? 'End views. The shaft is a little wider than the ring’s bore, so it will not go in at room temperature. The difference is exaggerated.',
  };
}

/**
 * Temperature against heat added for one body: a straight line of slope 1/(mc),
 * from T1 to T2. The heat axis carries no numbers (it is what a question asks for).
 */
export function tqPic({ T1, T2, name = 'water', unit = '°C', xlabel = 'heat added, Q', ask = 'Q = ?', caption, alt }) {
  const lo = Math.min(T1, T2), hi = Math.max(T1, T2), pad = 0.18 * (hi - lo);
  return {
    type: 'graph',
    params: {
      x: [-0.08, 1.25], y: [r4(lo - pad), r4(hi + pad)], aspect: 'wide', xlabel, ylabel: `T (${unit})`, xticks: 0.001,
      alt: alt || 'Temperature rising steadily as heat is added',
      curves: [{ fn: `${r4(T1)} + ${r4(T2 - T1)}*x`, domain: [0, 1], color: 'accent', width: 2.8, label: name, labelAt: 0.5, labelDx: -18, labelDy: -14 }],
      points: [{ x: 0, y: r4(T1), r: 5, color: 'accent', label: `${lab(T1)} ${unit}`, labelDx: 10, labelDy: 12 }, { x: 1, y: r4(T2), r: 5, color: 'warn', label: `${lab(T2)} ${unit}`, labelDx: 10, labelDy: 0 }],
      arrows: [{ from: [0, r4(lo - 0.09 * (hi - lo))], to: [1, r4(lo - 0.09 * (hi - lo))], color: 'gold', label: ask, labelDx: -60, labelDy: -12 }],
    },
    caption: caption ?? 'With no melting or boiling, the temperature rises in proportion to the heat added: the slope is 1/(mc).',
  };
}

/** Specific heats as bars, J/(kg·K). items: [[name, c, color?]] */
export function cBars(items, { caption, alt } = {}) {
  const top = Math.max(...items.map((it) => it[1]));
  const shade = [], points = [];
  items.forEach(([name, c, color], i) => {
    shade.push({ fn: String(c), lower: '0', from: r4(i + 0.2), to: r4(i + 0.8), color: color || 'accent', alpha: 0.6 });
    points.push(tag(i + 0.5, -0.07 * top, name, 'ink', 0, 0, true), tag(i + 0.5, c + 0.06 * top, String(c), color || 'accent', 0, 0, true));
  });
  return {
    type: 'graph',
    params: { x: [0, items.length], y: [r4(-0.16 * top), r4(1.18 * top)], aspect: 'wide', xticks: 0.001, xlabel: ' ', ylabel: 'c (J/(kg·K))', alt: alt || 'Specific heats of several materials', shade, points },
    caption: caption ?? 'Specific heats near room temperature: the energy that warms 1 kg by 1 K.',
  };
}

/** NIST's specific heat of 304 stainless against temperature, with the area from T1 to T2 shaded (that area is Q/m). */
export function cpGraph({ T1 = 77, T2 = 293, room = true, caption, alt } = {}) {
  const f = ssSpecificHeatExpr();
  return {
    type: 'graph',
    params: {
      x: [0, 310], y: [0, 560], aspect: 'wide', xlabel: 'T (K)', ylabel: 'c (J/(kg·K))',
      alt: alt || 'Specific heat of stainless steel falling at low temperature',
      curves: [{ fn: f, domain: [4, 300], color: 'accent', width: 2.6, label: '304 stainless (NIST)', labelAt: 60, labelDx: 6, labelDy: -14 }, ...(room ? [{ fn: '470', domain: [4, 300], color: 'ink3', width: 1.2, dash: true, label: 'its value at 293 K', labelAt: 10, labelDx: 0, labelDy: -12 }] : [])],
      shade: [{ fn: f, from: T1, to: T2, color: 'accent', alpha: 0.22 }],
      vlines: [{ x: T1, label: `${T1} K`, color: 'ink3' }, { x: T2, label: `${T2} K`, color: 'ink3' }],
    },
    caption: caption ?? 'The specific heat of 304 stainless steel from NIST’s fit to measurements (±5 %). The shaded area, ∫c dT, is the heat per kilogram to cool it between the two temperatures.',
  };
}

/** A cooling channel: coolant enters at Tin and leaves at Tout, heat Q̇ flowing in through the wall. */
export function flowPic({ Tin, Tout, mdot, caption, alt }) {
  return {
    type: 'graph',
    params: {
      x: [-0.6, 6.6], y: [-1.6, 1.9], equal: true, aspect: 'wide', axes: false, grid: false, xlabel: '', ylabel: '', alt: alt || 'Coolant flowing through a heated channel',
      shade: [{ fn: '0.5', lower: '-0.5', from: 0, to: 6, color: 'accent', alpha: 0.35 }, { fn: '1.35', lower: '0.62', from: 1, to: 5, color: 'bad', alpha: 0.28 }],
      curves: [{ fn: '0.55', domain: [0, 6], color: 'ink2', width: 2.5 }, { fn: '-0.55', domain: [0, 6], color: 'ink2', width: 2.5 }],
      arrows: [
        { from: [-0.5, 0], to: [0.6, 0], color: 'accent', label: `${Tin}`, labelDx: -40, labelDy: -16 },
        { from: [5.4, 0], to: [6.5, 0], color: 'warn', label: `${Tout}`, labelDx: -52, labelDy: -16 },
        { from: [2.2, 1.25], to: [2.2, 0.62], color: 'bad' }, { from: [3, 1.25], to: [3, 0.62], color: 'bad' }, { from: [3.8, 1.25], to: [3.8, 0.62], color: 'bad' },
      ],
      points: [tag(3, 1.6, 'hot combustion gas: heat flows in through the wall', 'bad', 0, 0, true), tag(3, 0, `cooling water, ${mdot}`, 'ink', 0, 0, true), tag(3, -1.0, 'chamber wall (cut away)', 'ink3', 0, 0, true)],
    },
    caption: caption ?? 'Not to scale. All the heat that crosses the wall is carried away by the water.',
  };
}

/** Keep only the error values that sit clearly apart from the answer (and from each other) — a slip that lands on the key is no slip. */
export function apart(errors, answer, rel = 0.03) {
  const out = [];
  for (const e of errors) {
    if (!Number.isFinite(e.value)) continue;
    const far = (v) => Math.abs(e.value - v) > rel * Math.max(Math.abs(v), Math.abs(e.value));
    if (far(answer) && out.every((o) => far(o.value))) out.push(e);
  }
  return out;
}

/**
 * A heating curve: temperature against heat added, built from segments in
 * order. A segment with T0 = T1 is a phase change (a plateau).
 *   segs     [{ dQ (kJ), T0, T1, label, letter }]
 *   numbers  false hides the heat axis's numbers
 *   hi       index of a segment to highlight (shaded under)
 */
export function heatingCurve({ segs, unit = '°C', numbers = true, hi = null, letters = false, labels = true, y = null, caption, alt }) {
  let x = 0;
  const curves = [], points = [], shade = [];
  const Ts = segs.flatMap((s) => [s.T0, s.T1]);
  const lo = Math.min(...Ts), top = Math.max(...Ts), pad = 0.12 * (top - lo);
  segs.forEach((s, i) => {
    const x0 = x, x1 = x + s.dQ, slope = (s.T1 - s.T0) / s.dQ;
    const fn = `${r4(s.T0)} + ${r4(slope)}*(x - ${r4(x0)})`;
    curves.push({ fn, domain: [r4(x0), r4(x1)], color: s.T0 === s.T1 ? 'warn' : 'accent', width: 3 });
    if (hi === i) shade.push({ fn, lower: String(r4(lo - pad)), from: r4(x0), to: r4(x1), color: 'gold', alpha: 0.18 });
    const mx = (x0 + x1) / 2, my = (s.T0 + s.T1) / 2;
    if (letters && s.letter) points.push(tag(mx, my, s.letter, 'gold', s.T0 === s.T1 ? -4 : -18, s.T0 === s.T1 ? -14 : -6));
    if (labels && s.label) points.push(tag(mx, my, s.label, 'ink2', s.dx ?? 8, s.dy ?? (s.T0 === s.T1 ? 14 : 12), s.T0 === s.T1));
    x = x1;
  });
  return {
    type: 'graph',
    params: { x: [0, r4(x * 1.04)], y: y || [r4(lo - pad), r4(top + pad)], aspect: 'wide', xlabel: 'heat added, Q (kJ)', ylabel: `T (${unit})`, ...(numbers ? {} : { xticks: 0.001 }), alt: alt || 'A heating curve: temperature against heat added, with flat steps where the substance melts or boils', curves, points, shade },
    caption: caption ?? 'Heat added slowly, so the whole sample keeps one temperature. Flat steps (orange): the phase is changing and the temperature does not rise. Specific heats taken as constant within each phase.',
  };
}

/** One kilogram of water from ice at T0 (°C) to steam at T1 (°C), as heating-curve segments (kJ). */
export function waterSegs(T0 = -20, T1 = 120, m = 1) {
  return [
    { dQ: (m * 2.09 * (0 - T0)), T0, T1: 0, label: 'ice warms', letter: '1', dx: 10, dy: 12 },
    { dQ: m * 334, T0: 0, T1: 0, label: 'melts at 0 °C', letter: '2' },
    { dQ: m * 4.184 * 100, T0: 0, T1: 100, label: 'water warms', letter: '3', dx: 10, dy: 14 },
    { dQ: m * 2257, T0: 100, T1: 100, label: 'boils at 100 °C', letter: '4' },
    { dQ: m * 2.01 * (T1 - 100), T0: 100, T1, label: '', letter: '5' },
  ].filter((s) => s.dQ > 0);
}

/**
 * A vessel of cryogenic liquid in cross-section: a vacuum-jacketed dewar or a propellant tank.
 *   kind     'dewar' | 'tank'
 *   leak     draw heat-leak arrows through the wall
 *   heater   a heater coil at the bottom, labelled with this text; bolt: a warm bolt dropped in
 */
export function vesselPic({ kind = 'dewar', liquid = 'LN₂, 77 K', level = 0.6, leak = false, heater = null, bolt = false, vent = 'N₂ gas out', leakLabel = 'heat leak', caption, alt }) {
  const curves = [], shade = [], arrows = [], points = [];
  const W = kind === 'tank' ? 1.3 : 1, H = kind === 'tank' ? 3.2 : 2.2, top = H;
  // walls: a U (dewar, with an inner wall: the vacuum jacket) or a capsule (tank)
  const U = (w, b, color, width) => ({ param: [`${r4(-w)} + ${r4(2 * w)}*min(max(3*t - 1, 0), 1)`, `${top} - ${r4(top - b)}*min(max(3*t, 0), 1) + ${r4(top - b)}*min(max(3*t - 2, 0), 1)`], t: [0, 1], color, width });
  if (kind === 'dewar') {
    curves.push(U(W, 0, 'ink2', 2.4), U(W - 0.14, 0.14, 'ink3', 1.6));
    shade.push({ fn: String(r4(0.14 + level * (H - 0.3))), lower: '0.14', from: r4(-W + 0.14), to: r4(W - 0.14), color: 'accent', alpha: 0.4 });
    if (!leak) points.push(tag(W + 0.08, r4(H - 0.35), 'vacuum jacket', 'ink3', 8, 0));
  } else {
    const d = 0.35;
    curves.push({ param: [String(-W), 't'], t: [d, r4(H - d)], color: 'ink2', width: 2.4 }, { param: [String(W), 't'], t: [d, r4(H - d)], color: 'ink2', width: 2.4 });
    curves.push({ param: [`${W}*cos(t)`, `${r4(H - d)} + ${d}*sin(t)`], t: [0, 3.1416], color: 'ink2', width: 2.4 }, { param: [`${W}*cos(t)`, `${d} + ${d}*sin(t)`], t: [3.1416, 6.2832], color: 'ink2', width: 2.4 });
    shade.push({ fn: String(r4(level * H)), lower: `${d} - ${d}*sqrt(max(0, 1 - x^2/${r4(W * W)}))`, from: -W, to: W, color: 'accent', alpha: 0.4 });
  }
  points.push(tag(0, Math.max(0.4, level * H * 0.45), liquid, 'ink', 0, 0, true));  // ly below matches this
  // bubbles rising through the liquid
  const ly = Math.max(0.4, level * H * 0.45);
  [[-0.55, 0.5], [0.45, 0.8], [-0.7, 1.05], [0.6, 0.35], [-0.5, 1.35], [0.55, 1.5]].forEach(([bx, by]) => { if (by < level * H - 0.1 && Math.abs(by - ly) > 0.15) points.push({ x: r4(bx * W), y: r4(by), r: 3, color: 'ink2' }); });
  if (bolt) shade.push({ fn: '0.42', lower: '0.17', from: -0.18, to: 0.18, color: 'ink', alpha: 0.65 });
  if (bolt) points.push(tag(0.2, 0.3, typeof bolt === 'string' ? bolt : 'warm bolt', 'ink2', 6, 0));
  if (heater) {
    curves.push({ param: ['-0.5 + t', '0.24 + 0.06*sin(18.85*t)'], t: [0, 1], color: 'bad', width: 2 });
    points.push(tag(0.55, 0.24, heater, 'bad', 6, 0));
  }
  if (leak) for (const yy of [0.45, 1.1, 1.75].filter((v) => v < H - 0.2)) arrows.push({ from: [r4(-W - 0.75), yy], to: [r4(-W - 0.08), yy], color: 'warn' }, { from: [r4(W + 0.75), yy], to: [r4(W + 0.08), yy], color: 'warn' });
  if (leak) points.push(tag(-W - 0.8, Math.min(H - 0.1, 2.15), leakLabel, 'warn', 0, 0));
  if (vent) { arrows.push({ from: [0, r4(top + 0.05)], to: [0, r4(top + 0.65)], color: 'ink2' }); points.push(tag(0.1, top + 0.45, vent, 'ink2', 8, 0)); }
  return {
    type: 'graph',
    params: { x: [-2.6, 2.6], y: [-0.3, r4(top + 0.85)], equal: true, aspect: 'wide', axes: false, grid: false, xlabel: '', ylabel: '', alt: alt || 'A vessel of boiling cryogenic liquid in cross-section', curves, shade, arrows, points },
    caption: caption ?? 'Cross-section, not to scale. The liquid boils at constant temperature; the vapour escapes through the vent, so the pressure stays at one atmosphere.',
  };
}

/**
 * Steady conduction through a flat wall of layers: the temperature profile.
 *   layers  [{ name, w (drawn width), color }] from the hot side to the cold side
 *   temps   the temperatures at the n + 1 faces, hot side first (K); '?' entries in `show` hide labels
 *   show    which face temperatures to label (indices), default the two outer faces
 */
export function wallPic({ layers, temps, show = null, hot = 'outside', cold = 'inside', ask = null, caption, alt }) {
  let x = 0;
  const shade = [], curves = [], points = [], arrows = [];
  const lo = Math.min(...temps), hi = Math.max(...temps), pad = 0.18 * (hi - lo);
  const xs = [0];
  layers.forEach((L, i) => {
    shade.push({ fn: String(r4(hi + pad)), lower: String(r4(lo - pad)), from: r4(x), to: r4(x + L.w), color: L.color || 'accent', alpha: 0.16 });
    curves.push({ fn: `${r4(temps[i])} + ${r4((temps[i + 1] - temps[i]) / L.w)}*(x - ${r4(x)})`, domain: [r4(x), r4(x + L.w)], color: 'gold', width: 3 });
    points.push(tag(x + L.w / 2, lo - 0.1 * pad, L.name, 'ink2', 0, 0, true));
    x += L.w; xs.push(x);
  });
  const W = x;
  curves.push({ fn: String(r4(temps[0])), domain: [r4(-0.18 * W), 0], color: 'gold', width: 3 }, { fn: String(r4(temps[temps.length - 1])), domain: [r4(W), r4(1.18 * W)], color: 'gold', width: 3 });
  (show ?? [0, temps.length - 1]).forEach((k) => points.push({ x: r4(xs[k]), y: r4(temps[k]), r: 4.5, color: 'gold', label: `${lab(temps[k], 5)} K`, labelDx: 8, labelDy: -10 }));
  points.push(tag(-0.17 * W, hi + 0.55 * pad, hot, 'warn', 0, 0), tag(1.02 * W, lo + 0.75 * pad, cold, 'accent', 0, 0));
  if (ask) arrows.push({ from: [r4(0.15 * W), r4(hi + 0.6 * pad)], to: [r4(0.85 * W), r4(hi + 0.6 * pad)], color: 'bad', label: ask, labelDx: -40, labelDy: -12 });
  return {
    type: 'graph',
    params: { x: [r4(-0.2 * W), r4(1.2 * W)], y: [r4(lo - pad), r4(hi + pad)], aspect: 'wide', xlabel: 'position through the wall', ylabel: 'T (K)', xticks: 0.001, alt: alt || 'Temperature falling through the layers of a wall', shade, curves, points, arrows },
    caption: caption ?? 'Steady conduction through a flat wall: the temperature falls in a straight line across each layer, steepest where the material conducts worst. Layer widths are not to scale.',
  };
}

/** Radiated power per square metre, εσT⁴, against absolute temperature. */
export function radiationGraph({ eps = 1, Tmax = 600, marks = [], numbers = false, caption, alt }) {
  const top = eps * SIGMA * Tmax ** 4;
  return {
    type: 'graph',
    params: {
      x: [0, Tmax], y: [0, r4(1.12 * top)], aspect: 'wide', xlabel: 'T (K)', ylabel: 'P/A (W/m²)', ...(numbers ? {} : { yticks: 0.001 }),
      alt: alt || 'Radiated power per area rising as the fourth power of temperature',
      curves: [{ fn: `${eps}*${SIGMA}*x^4`, color: 'warn', width: 2.8, label: `εσT⁴, ε = ${eps}`, labelAt: Tmax * 0.55, labelDx: -100, labelDy: -10 }],
      vlines: marks.map((m) => ({ x: m.T, label: m.label, color: 'ink3' })),
    },
    caption: caption ?? 'Emitted power per square metre of surface against absolute temperature: εσT⁴. Doubling T multiplies it by sixteen.',
  };
}

/**
 * Radiation shields in a vacuum gap: a warm wall, N thin shiny shields, a cold wall.
 *   N  the number of shields (drawn up to 12; more are labelled)
 */
export function shieldsPic({ N = 0, Th = '293 K', Tc = '90 K', eps = 'ε = 0.05', caption, alt }) {
  const shade = [{ fn: '1', lower: '-1', from: -0.35, to: 0, color: 'warn', alpha: 0.5 }, { fn: '1', lower: '-1', from: 4, to: 4.35, color: 'accent', alpha: 0.5 }];
  const curves = [], points = [tag(-0.17, 1.15, `warm wall, ${Th}`, 'warn', 0, 0, true), tag(4.17, 1.15, `cold wall, ${Tc}`, 'accent', 0, 0, true)];
  const n = Math.min(N, 12);
  for (let k = 1; k <= n; k++) curves.push({ param: [String(r4((4 * k) / (n + 1))), 't'], t: [-0.95, 0.95], color: 'ink2', width: 1.6 });
  points.push(tag(2, -1.2, N ? `${N} shiny shields (${eps}), vacuum between` : `vacuum gap; both surfaces ${eps}`, 'ink2', 0, 0, true));
  const arrows = [{ from: [0.1, 0], to: [3.9, 0], color: 'bad' }];
  points.push(tag(2, 0.12, 'radiation', 'bad', 0, -10, true));
  return {
    type: 'graph',
    params: { x: [-0.9, 4.9], y: [-1.5, 1.45], equal: true, aspect: 'wide', axes: false, grid: false, xlabel: '', ylabel: '', alt: alt || 'Radiation crossing a vacuum gap between a warm wall and a cold wall', shade, curves, arrows, points },
    caption: caption ?? 'A vacuum gap stops conduction and convection; only radiation crosses it. Not to scale.',
  };
}

/** Most probable speed √(2RT/M), m/s (M in g/mol). */
export const vpOf = (T, M) => Math.sqrt((2 * R * T) / (M / 1000));

/**
 * Maxwell–Boltzmann speed distributions, as the share of molecules per 100 m/s.
 *   curves  [{ T, M, label, color, labelAt }]
 *   marks   [{ v, label, color }] vertical lines; shadeFrom: shade the first curve's tail above this speed
 */
export function mbGraph({ curves, vmax = null, marks = [], shadeFrom = null, numbers = true, kms = false, caption, alt }) {
  const k = kms ? 1000 : 1;                                       // kms: the speed axis in km/s
  const top = vmax ?? Math.ceil((3.2 * Math.max(...curves.map((c) => vpOf(c.T, c.M)))) / 100) * 100;
  const peak = Math.max(...curves.map((c) => (100 * (4 / Math.sqrt(Math.PI)) * Math.exp(-1)) / vpOf(c.T, c.M)));
  const f = (c) => { const a = r4(vpOf(c.T, c.M)); const v = kms ? '(1000*x)' : 'x'; return `100*(4/sqrt(pi))*${v}^2/${a}^3*exp(-${v}^2/${a}^2)`; };
  return {
    type: 'graph',
    params: {
      x: [0, r4(top / k)], y: [0, r4(1.18 * peak)], aspect: 'wide', xlabel: kms ? 'speed v (km/s)' : 'speed v (m/s)', ylabel: 'share per 100 m/s', ...(numbers ? {} : { yticks: 0.001 }),
      alt: alt || 'Maxwell–Boltzmann speed distributions',
      curves: curves.map((c, i) => ({ fn: f(c), domain: [0, r4(top / k)], color: c.color || ['accent', 'warn', 'teal', 'violet'][i], width: 2.6, label: c.label, labelAt: r4((c.labelAt ?? 1.1 * vpOf(c.T, c.M)) / k), labelDx: c.labelDx ?? 8, labelDy: c.labelDy ?? -12 })),
      shade: shadeFrom === null ? [] : [{ fn: f(curves[0]), from: r4(shadeFrom / k), to: r4(top / k), color: 'gold', alpha: 0.45 }],
      vlines: marks.map((m) => ({ x: r4(m.v / k), label: m.label, color: m.color || 'ink3' })),
    },
    caption: caption ?? 'Maxwell–Boltzmann distributions: the height is the share of molecules per 100 m/s of speed; the area under each curve is 1 (all the molecules).',
  };
}

/**
 * Equipartition as bars: one bar of height ½k_BT for each active quadratic degree of
 * freedom of one molecule — translation (blue), rotation (teal), vibration (violet).
 *   frozen  draw these extra degrees of freedom as empty outlines (e.g. { vib: 2 })
 */
export function dofBars({ trans = 3, rot = 0, vib = 0, frozen = {}, title = '', caption, alt } = {}) {
  const shade = [], points = [], curves = [];
  const groups = [['trans', trans, 'accent', 'translation'], ['rot', rot, 'teal', 'rotation'], ['vib', vib, 'violet', 'vibration']];
  let x = 0;
  for (const [key, n, color, name] of groups) {
    const nf = frozen[key] || 0;
    if (!n && !nf) continue;
    const x0 = x;
    for (let k = 0; k < n + nf; k++) {
      const a = x + 0.12, b = x + 0.88;
      if (k < n) shade.push({ fn: '1', lower: '0', from: r4(a), to: r4(b), color, alpha: 0.65 });
      else curves.push({ param: [`${r4(a)} + ${r4(b - a)}*min(max(4*t, 0), 1) - ${r4(b - a)}*min(max(4*t - 2, 0), 1)`, `min(max(4*t - 1, 0), 1) - min(max(4*t - 3, 0), 1)`], t: [0, 1], color, width: 1.2, dash: true });
      x += 1;
    }
    points.push(tag((x0 + x) / 2, -0.16, nf && !n ? `${name} (frozen)` : name, color, 0, 0, true));
    x += 0.4;
  }
  points.push(tag(-0.15, 1, '½ kT', 'ink2', -48, 0));
  if (title) points.push(tag(x / 2, 1.42, title, 'ink', 0, 0, true));
  return {
    type: 'graph',
    params: { x: [-1.2, r4(x + 0.3)], y: [-0.4, 1.6], aspect: 'wide', axes: false, grid: false, xlabel: '', ylabel: '', alt: alt || 'Bars of energy per degree of freedom', shade, curves, points },
    caption: caption ?? 'Equipartition: each active quadratic degree of freedom holds $\\tfrac12k_BT$ on average. Dashed outlines are degrees of freedom frozen out at this temperature.',
  };
}

/** A diatomic molecule with its three translation directions and two rotation axes. */
export function dumbbellPic({ caption } = {}) {
  const circ = (cx, cy, r, color, width) => ({ param: [`${cx} + ${r}*cos(t)`, `${cy} + ${r}*sin(t)`], t: [0, 6.2832], color, width });
  return {
    type: 'graph',
    params: {
      x: [-3.2, 3.2], y: [-1.6, 1.6], equal: true, aspect: 'wide', axes: false, grid: false, xlabel: '', ylabel: '', alt: 'A diatomic molecule with its axes of motion',
      shade: [{ fn: 'sqrt(max(0, 0.16 - (x + 0.7)^2))', lower: '-sqrt(max(0, 0.16 - (x + 0.7)^2))', from: -1.1, to: -0.3, color: 'accent', alpha: 0.8 }, { fn: 'sqrt(max(0, 0.16 - (x - 0.7)^2))', lower: '-sqrt(max(0, 0.16 - (x - 0.7)^2))', from: 0.3, to: 1.1, color: 'accent', alpha: 0.8 }],
      curves: [{ fn: '0', domain: [-0.3, 0.3], color: 'ink2', width: 4 }, { fn: '0', domain: [-2.4, 2.4], color: 'ink4', width: 1, dash: true }, { param: ['0', 't'], t: [-1.3, 1.3], color: 'teal', width: 1.4, dash: true }, { param: ['0.45*cos(t)', '1.05 + 0.15*sin(t)'], t: [0.3, 5.6], color: 'teal', width: 1.8 }, { param: ['1.9 + 0.15*cos(t)', '0.4*sin(t)'], t: [-2.7, 2.7], color: 'violet', width: 1.6 }],
      arrows: [{ from: [-2.2, -1.1], to: [-1.4, -1.1], color: 'gold', label: 'x' }, { from: [-2.2, -1.1], to: [-2.2, -0.3], color: 'gold', label: 'y' }, { from: [-2.2, -1.1], to: [-2.65, -1.4], color: 'gold', label: 'z', labelDx: -14, labelDy: 6 }],
      points: [{ x: 0.5, y: 1.25, r: 0.01, color: 'teal', label: 'rotation about a perpendicular axis', labelDx: 6, labelDy: 0 }, { x: 1.4, y: -0.75, r: 0.01, color: 'violet', label: 'spin about the bond', labelDx: 0, labelDy: 6 }],
    },
    caption: caption ?? 'A diatomic molecule and the ways it might move: along x, y and z; rotating about axes through its centre; spinning about its own bond. Not to scale.',
  };
}

/** Molar heat capacities of solid elements near 25 °C (c × M), against the Dulong–Petit value 3R. */
export function molarBars({ caption } = {}) {
  const data = [['Al', 897, 26.982], ['Fe', 449, 55.845], ['Cu', 385, 63.546], ['Ag', 235, 107.87], ['Au', 129, 196.97], ['Pb', 129, 207.2]];
  const shade = [], points = [];
  data.forEach(([sym, c, M], i) => {
    const C = (c * M) / 1000;
    shade.push({ fn: String(r4(C)), lower: '0', from: r4(i + 0.2), to: r4(i + 0.8), color: 'accent', alpha: 0.6 });
    points.push(tag(i + 0.5, -2.2, sym, 'ink', 0, 0, true), tag(i + 0.5, C + 1.7, fmt(C, 3), 'accent', 0, 0, true));
  });
  return {
    type: 'graph',
    params: { x: [0, data.length + 1.1], y: [-4, 32], aspect: 'wide', xticks: 0.001, xlabel: ' ', ylabel: 'C (J/(mol·K))', alt: 'Molar heat capacities of metals, all close to 3R', shade, points, hlines: [{ y: r4(3 * R), label: '3R = 24.9', color: 'gold' }] },
    caption: caption ?? 'Molar heat capacities of metals near 25 °C (specific heat × molar mass, CRC data): all close to 3R, as equipartition predicts for atoms that both move and are held by springs.',
  };
}

/** C_V/R of hydrogen gas against temperature (logarithmic axis), as a schematic of freeze-out. */
export function h2Graph({ caption } = {}) {
  const cv = '1.5 + 1/(1 + (140/10^x)^3) + 1/(1 + (4500/10^x)^2.5)';
  return {
    type: 'graph',
    params: {
      x: [0.9, 4.25], y: [-0.25, 4], aspect: 'wide', xticks: 0.001, xlabel: 'temperature (logarithmic)', ylabel: 'Cᵥ / R',
      alt: 'The molar heat capacity of hydrogen rising in steps as rotation and then vibration switch on',
      curves: [{ fn: cv, color: 'accent', width: 2.8 }],
      hlines: [{ y: 1.5, label: '3/2: translation only', color: 'ink3' }, { y: 2.5, label: '5/2: + rotation', color: 'ink3' }, { y: 3.5, label: '7/2: + vibration', color: 'ink3' }],
      points: [1, 2, 3, 4].map((k) => ({ x: k, y: 0, r: 3, color: 'ink3', label: k === 4 ? '10 000 K' : `${10 ** k} K`, labelDx: k === 4 ? -48 : -14, labelDy: -12 })),
    },
    caption: caption ?? 'A schematic of hydrogen’s molar heat capacity: rotation switches on around 100 K, vibration only above a few thousand kelvin (real hydrogen starts to break apart there). Steps smoothed; the details of hydrogen’s two spin forms are left out.',
  };
}
