// Data and picture builders for the PHYS 2710 lessons on many-electron atoms,
// statistical physics and molecules (modules MP9–MP11) that _constants.js and
// _quanta.js do not carry. Not a lesson: the leading underscore keeps it out
// of the registry.
//
// Element configurations and first ionization energies live in
// src/viz/model/mp-shells.js (NIST Atomic Spectra Database). Successive
// ionization energies here are NIST ASD too. X-ray emission energies are
// Bearden’s (1967), as tabulated in the X-ray Data Booklet (LBNL); absorption
// edges are Bearden & Burr’s (1967), from the same booklet. Atomic masses are
// AME2020, in u.

import { seg, label, frame, r6 } from './_diagrams.js';
import { position, symbol } from '../../src/viz/model/mp-shells.js';

// ---- successive ionization energies, eV (NIST ASD): [first, second, third, fourth]
export const IE_SUCCESSIVE = {
  He: [24.587389, 54.417765],
  Li: [5.391715, 75.640094, 122.454358],
  Be: [9.322699, 18.21115, 153.896205, 217.718584],
  Na: [5.139077, 47.28636, 71.62],
  Mg: [7.646236, 15.035271, 80.1436],
  Al: [5.985769, 18.828563, 28.447642, 119.9924],
};

// ---- Kα₁ emission energies, keV (Bearden 1967 via the X-ray Data Booklet), by Z
export const KALPHA1 = {
  11: 1.04098, 12: 1.25360, 13: 1.48670, 14: 1.73998, 15: 2.0137, 16: 2.30784, 17: 2.62239, 18: 2.95770, 19: 3.3138, 20: 3.69168,
  21: 4.0906, 22: 4.51084, 23: 4.95220, 24: 5.41472, 25: 5.89875, 26: 6.40384, 27: 6.93032, 28: 7.47815, 29: 8.04778, 30: 8.63886,
  31: 9.25174, 32: 9.88642, 33: 10.54372, 34: 11.2224, 35: 11.9242, 36: 12.649, 37: 13.3953, 38: 14.1650, 39: 14.9584, 40: 15.7751,
  41: 16.6151, 42: 17.47934, 44: 19.2792, 45: 20.2161, 46: 21.1771, 47: 22.16292, 48: 23.1736, 50: 25.2713,
  49: 24.2097, 51: 26.3591, 56: 32.1936, 74: 59.31824, 78: 66.832, 79: 68.8037, 82: 74.9694,
};
// ---- K absorption edges, keV (Bearden & Burr 1967 via the X-ray Data Booklet)
export const K_EDGE = { 26: 7.11198, 27: 7.70895, 28: 8.33328, 29: 8.97903, 39: 17.0384, 40: 17.9976, 41: 18.9856, 42: 19.9995 };
// ---- Kβ₁ emission energies, keV (same source)
export const KBETA1 = { 26: 7.05798, 28: 8.26466, 29: 8.90529, 42: 19.6083 };

/** Moseley’s estimate of a Kα photon’s energy, in keV: (3/4) R∞hc (Z − 1)². */
export const moseleyKeV = (Z, ryd = 13.605693122990) => (0.75 * ryd * (Z - 1) ** 2) / 1000;

/**
 * An orbital box diagram as a graph: subshells bottom-up, each with its 2l + 1
 * orbitals as boxes, electrons as up and down arrows (Hund’s rule within each
 * subshell). rows: [{ name: '2p', count: 4 } | { core: '[He] core' }]; count
 * null draws empty boxes. `newest: true` paints the last electron of the top
 * occupied row gold. `counts` writes “4/6” beside each row.
 */
export function boxDiagram(rows, { caption, counts = true, newest = false, aspect = 'wide', alignMl = false, mlLabels = false, extraPoints = [], extraArrows = [] } = {}) {
  const curves = [], shade = [], points = [], arrows = [];
  const L = { s: 0, p: 1, d: 2, f: 3 };
  const P = 1.55;                                     // row pitch
  const lmax = Math.max(0, ...rows.filter((r) => r.name).map((r) => L[r.name.at(-1)]));
  const x0Of = (l) => (alignMl ? lmax - l : 0);       // where a row’s first box (m_l = +l) starts
  let maxB = alignMl ? 2 * lmax + 1 : 1;
  const signed = (m) => (m > 0 ? `+${m}` : m < 0 ? `−${-m}` : '0');
  if (mlLabels) {
    const lab = alignMl ? lmax : L[rows.find((r) => r.name).name.at(-1)];
    for (let k = 0; k <= 2 * lab; k++) points.push(label(k + 0.5, -0.32, signed(lab - k), 'ink3', 0, 4, 'center'));
    points.push(label(-0.35, -0.32, 'mₗ', 'ink3', 0, 4, 'right'));
  }
  rows.forEach((r, i) => {
    const y = i * P;
    if (r.core) {
      shade.push({ fn: r6(y + 0.95), lower: r6(y + 0.05), from: 0, to: 5, color: 'ink3', alpha: 0.14 });
      points.push(label(0.25, y + 0.5, r.core, 'ink2', 0, 0, 'left'));
      maxB = Math.max(maxB, 5);
      return;
    }
    const l = L[r.name.at(-1)], m = 2 * l + 1, x0 = x0Of(l);
    maxB = Math.max(maxB, m);
    curves.push(seg(x0, y, x0 + m, y, 'ink2', 1.4), seg(x0, y + 1, x0 + m, y + 1, 'ink2', 1.4));
    for (let k = 0; k <= m; k++) curves.push(seg(x0 + k, y, x0 + k, y + 1, 'ink2', 1.4));
    points.push(label(-0.35, y + 0.5, r.name, 'ink', 0, 0, 'right'));
    if (r.count != null) {
      const top = rows.slice(i + 1).every((q) => q.core || !q.count);
      for (let k = 0; k < m; k++) {
        const up = r.count > k, down = r.count > m + k;
        const lastUp = newest && top && r.count === k + 1, lastDown = newest && top && r.count === m + k + 1;
        if (up) arrows.push({ from: [r6(x0 + k + 0.32), r6(y + 0.12)], to: [r6(x0 + k + 0.32), r6(y + 0.9)], color: lastUp ? 'gold' : 'accent', width: 2.2 });
        if (down) arrows.push({ from: [r6(x0 + k + 0.68), r6(y + 0.88)], to: [r6(x0 + k + 0.68), r6(y + 0.1)], color: lastDown ? 'gold' : 'warn', width: 2.2 });
      }
      if (counts) points.push(label(x0 + m + 0.3, y + 0.5, `${r.count}/${2 * m}`, 'ink3', 0, 0, 'left'));
    }
  });
  const H = rows.length * P - 0.55;
  return {
    type: 'graph',
    params: frame([-2.2, maxB + 2.2], [mlLabels ? -1.1 : -0.5, H + 0.5], { aspect, curves, shade, points: [...points, ...extraPoints], arrows: [...arrows, ...extraArrows] }),
    caption: caption ?? 'Each box is an orbital (one value of mₗ); each arrow an electron, up for mₛ = +½ and down for −½. Subshells are stacked in the order they fill, not to an energy scale.',
  };
}

/**
 * Levels of the infinite square well, Eₙ = n²E₁, with N particles in them:
 * fermions two to a level (spin up and down), bosons all in the lowest. A
 * graph; energies in units of E₁. `show: false` draws the empty ladder.
 */
export function wellLadder(N, { kind = 'fermion', nTop = 5, show = true, caption, unit = 'E₁' } = {}) {
  const curves = [seg(-1.2, 0, -1.2, nTop * nTop + 3, 'ink2', 3), seg(5.2, 0, 5.2, nTop * nTop + 3, 'ink2', 3)];
  const points = [], arrows = [];
  for (let n = 1; n <= nTop; n++) {
    curves.push(seg(-1, n * n, 5, n * n, 'ink3', 1.6));
    points.push(label(5.2, n * n, `n = ${n}: ${n * n} ${unit}`, 'ink3', 8, 0, 'left'));
  }
  if (show) {
    if (kind === 'fermion') {
      for (let k = 0; k < N; k++) {
        const n = Math.floor(k / 2) + 1, x = k % 2 ? 2.6 : 1.4, y = n * n;
        arrows.push(k % 2 ? { from: [x, y + 0.9], to: [x, r6(y - 0.1)], color: 'warn', width: 2 } : { from: [x, r6(y - 0.1)], to: [x, y + 0.9], color: 'accent', width: 2 });
      }
    } else {
      for (let k = 0; k < N; k++) points.push({ x: r6(0.2 + (k * 4.6) / Math.max(1, N)), y: 1.35, r: 4.5, color: 'violet' });
    }
  }
  return {
    type: 'graph',
    params: { x: [-2.5, 11], y: [-1, nTop * nTop + 3], aspect: 'wide', axes: false, grid: false, xlabel: '', ylabel: '', curves, points, arrows },
    caption: caption ?? 'An infinite square well and its levels Eₙ = n²E₁, to scale. Arrows are electrons (spin up or down).',
  };
}

export { seg, label, frame, r6 };

/**
 * The periodic table as a grid of dots (a graph): marked elements large, in
 * colour, with their symbols; the rest small and grey. marks: { Z: color };
 * symbols: extra Zs to name; rows: period numbers to underline.
 */
export function tableDots({ marks = {}, symbols = [], rows = [], caption } = {}) {
  const points = [], curves = [];
  for (let Z = 1; Z <= 86; Z++) {
    const { row, col } = position(Z), y = row === 8 ? -7.7 : -row;
    const m = marks[Z];
    points.push(m ? { x: col, y, r: 7.5, color: m } : { x: col, y, r: 2.6, color: 'ink4' });
    if (m || symbols.includes(Z)) points.push(label(col, y, symbol(Z), m || 'ink2', 8, -11, 'left'));
  }
  for (const p of rows) curves.push(seg(0.5, -p - 0.42, 18.5, -p - 0.42, 'gold', 1.6, true));
  return {
    type: 'graph',
    params: frame([-0.5, 19.5], [-8.4, -0.3], { aspect: 'wide', points, curves }),
    caption: caption ?? 'The periodic table as dots, hydrogen (top left) to radon; the strip below is the f-block, which belongs in period 6 between groups 2 and 3.',
  };
}

/** Bars (a graph): [[label, value, color]], with the value written above each bar. */
export function bars(items, { ylabel = '', ymax, caption, digits = 3, unit = '' } = {}) {
  const top = ymax ?? 1.18 * Math.max(...items.map((i) => i[1]));
  const shade = [], points = [];
  items.forEach(([lab, v, color = 'accent'], i) => {
    shade.push({ fn: String(r6(v)), lower: '0', from: i + 0.2, to: i + 0.8, color, alpha: 0.7 });
    points.push(label(i + 0.5, v, `${+v.toPrecision(digits)}${unit}`, color, 0, -10, 'center'), label(i + 0.5, 0, lab, 'ink2', 0, 12, 'center'));
  });
  return {
    type: 'graph',
    params: { x: [-0.2, items.length + 0.2], y: [0, r6(top)], aspect: 'wide', xticks: 0, xlabel: '', ylabel, axesAt: 'edge', grid: false, shade, points },
    caption,
  };
}

/**
 * The X-ray levels of a heavy atom (a graph, schematic, not to scale): the K,
 * L and M shells under the ionization limit, a vacancy in K, and arrows for
 * the Kα (L → K) and Kβ (M → K) lines and the K absorption edge.
 *   show: any of 'ka', 'kb', 'edge'; ask: a key whose label reads “?”.
 */
export function xrayLevels({ show = ['ka', 'kb', 'edge'], ask = null, caption } = {}) {
  const Y = { K: 0.6, L: 6.4, M: 8.2, top: 9.6 };
  const curves = [seg(0, Y.K, 6.6, Y.K, 'ink2', 2.4), seg(0, Y.L, 6.6, Y.L, 'ink2', 2.4), seg(0, Y.M, 6.6, Y.M, 'ink2', 2.4), seg(0, Y.top, 6.6, Y.top, 'ink3', 1.2, true)];
  const points = [
    label(0, Y.K, 'K shell (n = 1)', 'ink2', -8, 0, 'right'), label(0, Y.L, 'L shell (n = 2)', 'ink2', -8, 0, 'right'),
    label(0, Y.M, 'M shell (n = 3)', 'ink2', -8, 0, 'right'), label(0, Y.top, 'ionized', 'ink3', -8, 0, 'right'),
    { x: 0.7, y: Y.K, r: 6, color: 'accent' }, { x: 1.4, y: Y.K, r: 6, color: 'bad' }, label(1.4, Y.K, 'vacancy', 'bad', 0, 16, 'center'),
  ];
  const arrows = [];
  const lab = (k, txt) => (ask === k ? `${txt} = ?` : txt);
  if (show.includes('ka')) { arrows.push({ from: [2.6, Y.L], to: [2.6, Y.K + 0.2], color: 'gold', width: 2.6 }); points.push(label(2.6, 3.4, lab('ka', 'Kα'), 'gold', 7, 0, 'left')); }
  if (show.includes('kb')) { arrows.push({ from: [3.9, Y.M], to: [3.9, Y.K + 0.2], color: 'violet', width: 2.6 }); points.push(label(3.9, 4.4, lab('kb', 'Kβ'), 'violet', 7, 0, 'left')); }
  if (show.includes('edge')) { arrows.push({ from: [5.5, Y.K], to: [5.5, Y.top + 0.4], color: 'accent', width: 2.2 }); points.push(label(5.5, 2.6, lab('edge', 'K edge'), 'accent', 7, 0, 'left')); }
  return {
    type: 'graph',
    params: frame([-4.6, 8.6], [-0.6, 10.4], { aspect: 'wide', equal: false, curves, points, arrows }),
    caption: caption ?? 'X-ray levels of a heavy atom, schematic and not to scale: in copper the K shell lies 8.98 keV below the ionization limit and the L shell only about 0.93 keV. A vacancy in K (red) is filled from L (the Kα line) or M (Kβ); the K edge is the least energy that can make the vacancy.',
  };
}

/**
 * An X-ray fluorescence spectrum (a graph): Gaussian peaks on a small
 * background, widths growing as √E like a silicon drift detector’s
 * (about 130 eV across at 6 keV). peaks: [[keV, height, label, color]].
 */
export function xrfSpectrum(peaks, { x = [0, 10], ask = null, caption, numbers = true } = {}) {
  const w = (E) => r6(0.055 * Math.sqrt(E / 6) + 0.012);
  const fn = ['0.04*exp(-x/6)', ...peaks.map(([E, h]) => `${r6(h)}*exp(-((x - ${r6(E)})/${w(E)})^2)`)].join(' + ');
  const top = Math.max(...peaks.map((p) => p[1]));
  const points = peaks.filter((p) => p[2]).map(([E, h, lab, color]) => label(E, h, ask !== null && Math.abs(E - ask) < 1e-9 ? '?' : lab, color || 'ink2', 0, -12, 'center'));
  return {
    type: 'graph',
    params: { x, y: [0, r6(top * 1.22)], aspect: 'wide', xlabel: 'photon energy (keV)', ylabel: 'counts', yticks: 0, axesAt: 'edge', ...(numbers ? {} : { xticks: 0 }), curves: [{ fn, domain: [r6(x[0] + 0.3), x[1]], color: 'accent', width: 2 }], points },
    caption: caption ?? 'An X-ray fluorescence spectrum, schematic: peak heights illustrative, widths those of a good silicon drift detector.',
  };
}

/**
 * An energy-level diagram (a graph): levels as horizontal lines with labels
 * at the right, and vertical arrows between them. Energies are in whatever
 * unit the caller chooses; the picture is drawn to that scale.
 *   list:   [{ E, label, color, x0, x1, labelLeft, dy }]  (x0, x1: the line’s ends; default 0 and 4)
 *   arrows: [{ from, to, x, x2, color, label, dash, left, dy }] — vertical unless x2 is given; the label sits beside the arrow’s middle
 */
export function levels(list, { arrows = [], caption, x = [-1.5, 9], pad = 0.12, aspect = 'wide' } = {}) {
  const Es = list.map((l) => l.E), lo = Math.min(...Es), hi = Math.max(...Es), span = hi - lo || 1;
  const curves = [], points = [], arr = [];
  for (const l of list) {
    const x0 = l.x0 ?? 0, x1 = l.x1 ?? 4;
    curves.push(seg(x0, l.E, x1, l.E, l.color || 'ink2', l.width || 2.4, !!l.dash));
    if (l.label) points.push(l.labelLeft ? label(x0, l.E, l.label, l.color || 'ink2', -8, l.dy ?? 0, 'right') : label(x1, l.E, l.label, l.color || 'ink2', 8, l.dy ?? 0, 'left'));
  }
  for (const a of arrows) {
    const x2 = a.x2 ?? a.x;
    arr.push({ from: [r6(a.x), r6(a.from)], to: [r6(x2), r6(a.to)], color: a.color || 'gold', width: a.width || 2.4, ...(a.dash ? { dash: [5, 4] } : {}) });
    if (a.label) points.push(label((a.x + x2) / 2, (a.from + a.to) / 2, a.label, a.color || 'gold', a.left ? -7 : 7, a.dy ?? 0, a.left ? 'right' : 'left'));
  }
  return {
    type: 'graph',
    params: frame(x, [r6(lo - pad * span), r6(hi + pad * span)], { aspect, equal: false, curves, points, arrows: arr }),
    caption,
  };
}

/**
 * The Maxwell–Boltzmann energy distribution against E/kT (a graph): the
 * density of states ∝ √E and the Boltzmann factor e^(−E/kT) (dashed), and
 * their product, normalized (solid). marks: any of 'peak', 'mean'.
 */
export function mbEnergy({ marks = ['peak', 'mean'], caption, parts = true } = {}) {
  const curves = [{ fn: '1.1284*sqrt(x)*exp(-x)', color: 'accent', width: 2.8 }];
  const points = [];
  if (parts) {
    curves.push({ fn: '0.42*sqrt(x)', color: 'violet', width: 1.6, dash: true }, { fn: 'exp(-x)', color: 'warn', width: 1.6, dash: true });
    points.push(label(5.4, 0.42 * Math.sqrt(5.4), 'states: ∝ √E', 'violet', 0, -12, 'right'), label(0.9, Math.exp(-0.9), 'Boltzmann factor', 'warn', 8, -4, 'left'), label(2.6, 1.1284 * Math.sqrt(2.6) * Math.exp(-2.6), 'their product', 'accent', 8, -8, 'left'));
  }
  if (marks.includes('peak')) points.push({ x: 0.5, y: r6(1.1284 * Math.sqrt(0.5) * Math.exp(-0.5)), r: 5, color: 'gold', label: 'most probable: kT/2', labelDx: 8, labelDy: -12 });
  if (marks.includes('mean')) points.push({ x: 1.5, y: r6(1.1284 * Math.sqrt(1.5) * Math.exp(-1.5)), r: 5, color: 'good', label: 'mean: 3kT/2', labelDx: 8, labelDy: -8 });
  return {
    type: 'graph',
    params: { x: [0, 6], y: [0, 1.1], aspect: 'wide', xlabel: 'kinetic energy E / kT', ylabel: 'share per unit of E/kT', axesAt: 'edge', curves, points },
    caption: caption ?? 'The Maxwell–Boltzmann distribution of kinetic energies, the same for every ideal gas at a given temperature: the number of states rises as √E, the Boltzmann factor falls as e^(−E/kT), and their product peaks at kT/2.',
  };
}
