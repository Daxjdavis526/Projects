// Constants, number formats and picture builders for the PHYS 2210 fluids
// lessons (module M14). The builders return ordinary visual specs for the
// mech-tank, mech-flow and graph simulations, so the content test validates
// them like any other visual. Not a lesson: the leading underscore keeps it
// out of the registry.

import { fmt, sig } from '../../src/core/format.js';

/** The Atlas's g for these lessons, m/s² (as in the rest of PHYS 2210). */
export const G = 9.8;
/** One standard atmosphere, Pa. */
export const P_ATM = 101325;
/** Pa in one psi (pound-force per square inch). */
export const PSI = 6894.757;

/** Densities used in these lessons, kg/m³: rounded handbook values (LOX and LH₂ at their boiling points). */
export const RHO = {
  water: 1000, seawater: 1025, lox: 1141, rp1: 810, lh2: 70.8, mercury: 13600, ice: 917,
  air: 1.225, helium: 0.169, aluminium: 2700, steel: 7800, oak: 750, ethanol: 789,
};

/** Text with n significant figures (plain, for prose and canvas labels). */
export const s3 = (x) => fmt(x, 3);

/**
 * A number as TeX with n significant figures: thousands split by thin spaces
 * (12 300 → 12\,300), and ×10ⁿ outside [10⁻³, 10⁶).
 */
export function tn(x, n = 3) {
  if (!Number.isFinite(x)) return String(x);
  if (x === 0) return '0';
  const a = Math.abs(x);
  if (a >= 1e6 || a < 1e-3) {
    const [m, e] = x.toExponential(n - 1).split('e');
    return `${m} \\times 10^{${parseInt(e, 10)}}`;
  }
  const p = Math.floor(Math.log10(a)), d = Math.max(0, n - 1 - p);
  const [int, dec] = sig(x, n).toFixed(d).split('.');
  const sign = int.startsWith('-') ? '-' : '', digits = int.replace('-', '');
  const grouped = digits.length > 4 ? digits.replace(/\B(?=(\d{3})+(?!\d))/g, '\\,') : digits;
  return `${sign}${grouped}${dec ? '.' + dec : ''}`;
}

/** A mech-tank visual: tank({ scene: 'vessels', … }, caption). */
export const tank = (params, caption) => ({ type: 'mech-tank', params, ...(caption ? { caption } : {}) });
/** A mech-flow visual. */
export const flow = (params, caption) => ({ type: 'mech-flow', params, ...(caption ? { caption } : {}) });

const r4 = (v) => +(+v).toPrecision(6);

/** A straight segment as a graph curve. */
export const seg = (a, b, { color = 'ink2', width = 2, dash = false } = {}) => ({
  param: [`${r4(a[0])} + t*${r4(b[0] - a[0])}`, `${r4(a[1])} + t*${r4(b[1] - a[1])}`], t: [0, 1], color, width, dash,
});

/** A polyline through world points, as graph curves (closed when `close`). */
export function outline(pts, { close = false, ...style } = {}) {
  const P = close ? [...pts, pts[0]] : pts;
  return P.slice(1).map((p, k) => seg(P[k], p, style));
}

/** A filled rectangle as a graph shade (x from x0 to x1, y from y0 to y1). */
export const box = (x0, x1, y0, y1, color = 'accent', alpha = 0.3) => ({ fn: String(r4(y1)), lower: String(r4(y0)), from: r4(x0), to: r4(x1), color, alpha });

/** A text label at (x, y): the label of an invisible point. */
export const label = (x, y, text, color = 'ink2', dx = 0, dy = 0) => ({ x: r4(x), y: r4(y), r: 0.01, color, label: text, labelDx: dx, labelDy: dy });

/**
 * Mass against volume: one line per substance, m = ρV (V in litres, m in kg), with
 * optional points. lines: [{ rho, label, color, dash }]; points: [{ V, m, label }].
 */
export function massVolume({ lines, points = [], V = 20, m, caption, labelAt = 0.82 }) {
  const top = m ?? Math.max(...lines.map((l) => (l.rho * V) / 1000)) * 1.1;
  return {
    type: 'graph',
    params: {
      aspect: 'wide', x: [0, V], y: [0, r4(top)], xlabel: 'volume V (L)', ylabel: 'mass m (kg)',
      curves: lines.map((l, k) => {
        const end = Math.min(V, (top * 1000) / l.rho);
        return { fn: `${l.rho / 1000}*x`, domain: [0, r4(end)], color: l.color || ['accent', 'warn', 'good', 'violet'][k % 4], width: 2.4, dash: !!l.dash, label: l.label, labelAt: r4(end * labelAt), labelDx: -4, labelDy: -12 };
      }),
      points: points.map((p) => ({ x: p.V, y: r4(p.m), color: 'gold', label: p.label })),
    },
    caption: caption ?? 'Mass grows in proportion to volume for each substance: the slope of its line is its density.',
  };
}
