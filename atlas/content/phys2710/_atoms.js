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
  74: 59.31824, 79: 68.8037, 82: 74.9694,
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
