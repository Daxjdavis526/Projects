// Picture builders and constants for the PHYS 2210 first- and second-law
// lessons (modules M18 and M19): small PV diagrams of given states and paths,
// and energy-flow diagrams of engines, refrigerators and heat pumps — all
// `therm-pv` specs, which the content test validates like any other visual.
// The physics (and every number a lesson computes) comes from the same
// DOM-free model the simulation draws with.
// Not a lesson: the leading underscore keeps it out of the lesson registry.

import * as TD from '../../src/viz/model/therm-pv.js';

export { TD };
export const R = TD.R;                 // 8.314 462 618 J/(mol K), exact
export const C0 = 273.15;              // K at 0 °C

/** Moles of an ideal gas at P (kPa), V (L), T (K). */
export const molesOf = (PkPa, VL, T) => (PkPa * VL) / (R * T);

/** A number as plain text with n significant figures and a true minus sign, for canvas labels. */
export const lab = (x, n = 3) => String(+(+x).toPrecision(n)).replace('-', '−');

/**
 * A static PV diagram of named states joined by legs (the sim's 'paths' mode).
 * Defaults suit a problem picture: no readouts, no heat colours, no isotherm
 * guides; switch them on per picture.
 *   states  { A: { P, V, label?, dx?, dy? } } in the display units (kPa and L unless punit/vunit say otherwise)
 *   paths   [{ from: 'A', legs: [['isobaric', 'B'], …] }]
 */
export function pvPic({ states, paths, caption, ...rest }) {
  return {
    type: 'therm-pv',
    params: { mode: 'paths', states, paths, heat: false, legend: false, isotherms: false, readouts: [], ...rest },
    caption: caption ?? 'A quasi-static path: the gas is in equilibrium at every point along it. The area under the path is the work done by the gas.',
  };
}

/** One path through a list of [kind, state] legs from `from`. */
export const one = (from, ...legs) => [{ from, legs }];

/**
 * An energy-flow diagram: device 'engine' | 'fridge' | 'pump', the three
 * energies (they must balance) and the words on the picture.
 */
export function flowPic({ device = 'engine', Qh, Qc, W, labels = {}, caption }) {
  return {
    type: 'therm-pv',
    params: { mode: 'flow', device, Qh, Qc, W, labels },
    caption: caption ?? 'Arrow widths are to scale with the energy each carries per cycle. What flows in equals what flows out: the device itself ends each cycle unchanged.',
  };
}

const r4 = (v) => +(+v).toFixed(4);
/** A label-only point (no visible dot). */
const tag = (x, y, text, color = 'ink2', dx = 0, dy = 0) => ({ x: r4(x), y: r4(y), r: 0.01, color, label: text, labelDx: dx, labelDy: dy });
/** Rough canvas width of a label, for centring it (px). */
const half = (s) => 3.4 * [...s].length;

/**
 * First-law bookkeeping as three signed bars: heat into the gas Q, work done
 * by the gas W and the change in internal energy ΔE_int (= Q − W). The bar
 * being asked for (ask: 'Q' | 'W' | 'dU') is left empty with a question mark.
 */
export function ledger({ Q, W, dU, ask = 'dU', unit = 'J', caption, alt }) {
  const items = [
    ['Q', 'Q', Q, Q >= 0 ? 'bad' : 'accent'],
    ['W', 'W', W, 'gold'],
    ['dU', 'ΔEᵢₙₜ', dU, 'violet'],
  ];
  const top = Math.max(...items.filter(([k]) => k !== ask).map(([, , v]) => Math.abs(v)), 1);
  const shade = [], points = [];
  const fmtv = (v) => `${v > 0 ? '+' : v < 0 ? '−' : ''}${+Math.abs(v).toPrecision(4)} ${unit}`;
  items.forEach(([k, name, v, color], i) => {
    const x0 = 0.6 + 1.6 * i, x1 = x0 + 0.9, cx = (x0 + x1) / 2;
    if (k === ask) {
      points.push(tag(cx, 0.16 * top, `${name} = ?`, 'ink', -half(`${name} = ?`), 0));
      return;
    }
    shade.push({ fn: String(r4(v)), lower: '0', from: r4(x0), to: r4(x1), color, alpha: 0.6 });
    const text = `${name} = ${fmtv(v)}`;
    points.push(tag(cx, v >= 0 ? v + 0.12 * top : v - 0.12 * top, text, color, -half(text), 0));
  });
  return {
    type: 'graph',
    params: {
      x: [0, 5.4], y: [r4(-1.35 * top), r4(1.35 * top)], aspect: 'wide', xticks: 0.001, xlabel: ' ', ylabel: `energy (${unit})`, grid: true,
      alt: alt || 'Bars for the heat into a gas, the work it does and the change in its internal energy',
      shade, points, hlines: [{ y: 0, color: 'ink3' }],
    },
    caption: caption ?? 'Energy bookkeeping for the gas. Heat into the gas counts positive, heat out negative; work done by the gas counts positive, work done on it negative. ΔEᵢₙₜ = Q − W.',
  };
}

const hseg = (x0, x1, y, color, width = 2, dash = false) => ({ fn: String(r4(y)), domain: [r4(x0), r4(x1)], color, width, dash });
const vseg = (x, y0, y1, color, width = 2, dash = false) => ({ param: [String(r4(x)), `${r4(y0)} + ${r4(y1 - y0)}*t`], t: [0, 1], color, width, dash });
const box = (x0, x1, y0, y1, color, width) => [hseg(x0, x1, y0, color, width), hseg(x0, x1, y1, color, width), vseg(x0, y0, y1, color, width), vseg(x1, y0, y1, color, width)];

/**
 * An insulated box before and after the partition is removed: gas on one side
 * and vacuum on the other, then gas everywhere (a free expansion).
 */
export function freeBoxPic({ left = 'gas', right = 'vacuum', after = 'gas fills the box', caption, alt } = {}) {
  const curves = [...box(0, 4, 0, 2, 'ink3', 4), vseg(2, 0, 2, 'ink2', 3), ...box(5.6, 9.6, 0, 2, 'ink3', 4)];
  const shade = [{ fn: '2', lower: '0', from: 0, to: 2, color: 'accent', alpha: 0.45 }, { fn: '2', lower: '0', from: 5.6, to: 9.6, color: 'accent', alpha: 0.22 }];
  const points = [
    tag(1, 1, left, 'ink', -half(left)), tag(3, 1, right, 'ink3', -half(right)), tag(7.6, 1, after, 'ink', -half(after)),
    tag(2, 2.35, 'before', 'ink2', -half('before')), tag(7.6, 2.35, 'after', 'ink2', -half('after')),
    tag(4.8, -0.4, 'insulated walls: no heat in or out', 'ink3', -half('insulated walls: no heat in or out')),
  ];
  return {
    type: 'graph',
    params: { x: [-0.4, 10], y: [-0.8, 2.7], equal: true, aspect: 'wide', axes: false, grid: false, xlabel: '', ylabel: '', alt: alt || 'A gas filling an insulated box after a partition is removed', curves, shade, points, arrows: [{ from: [4.25, 1], to: [5.35, 1], color: 'gold' }] },
    caption: caption ?? 'Not to scale. The partition is pulled out and the gas rushes into the empty half.',
  };
}
