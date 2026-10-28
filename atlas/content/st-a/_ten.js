// Shared picture builders for Advanced Math A (vector and tensor analysis).
// Course-local: other courses may import these, but should not edit them.

const t = String.raw;
const DEG = Math.PI / 180;

/** Round for expressions and positions, so a generated picture has short, stable numbers. */
export const r6 = (x) => +(+x).toFixed(6);

/** A perpendicular unit basis turned anticlockwise by `deg` degrees. */
export const turned = (deg) => [[r6(Math.cos(deg * DEG)), r6(Math.sin(deg * DEG))], [r6(-Math.sin(deg * DEG)), r6(Math.cos(deg * DEG))]];

/** A still ten-basis picture: nothing to drag, no sliders, no numbers. */
export const still = (params, caption) => ({
  type: 'ten-basis',
  params: { dragBasis: false, dragVector: false, covSliders: false, readout: false, ...params },
  caption,
});

/**
 * A 3D arrow with its component path (along e₁, then e₂, then e₃) in a
 * perpendicular basis, on calc-vectors3d. v: [x, y, z]; label: TeX.
 */
export function arrow3(v, { label = t`\mathbf V`, caption, components = true, extra = [], range } = {}) {
  const R = range || Math.max(2, Math.ceil(Math.max(...v.map(Math.abs)) + 0.5));
  return {
    type: 'calc-vectors3d',
    params: {
      range: R,
      vectors: [{ to: v.map(r6), color: 'gold', label }, ...extra],
      components: components ? [{ to: v.map(r6), color: 'ink3' }] : [],
    },
    caption,
  };
}

/**
 * A grid of numbers drawn on the graph sim: rows top to bottom, columns left to
 * right, each entry a number; hl: a list of [row, col] (0-based) ringed in gold;
 * rowNames / colNames: plain-text labels at the left and top.
 */
export function grid(rows, { hl = [], rowNames, colNames, caption, dx = 1, extra = {} } = {}) {
  const n = rows.length, m = rows[0].length;
  const pts = [];
  rows.forEach((row, i) => row.forEach((v, j) => {
    const on = hl.some(([a, b]) => a === i && b === j), label = String(v).replace('-', '−'), R = Math.max(15, 6 + 3.7 * label.length);
    if (on) pts.push({ x: j * dx, y: -i, r: R, color: 'gold' }, { x: j * dx, y: -i, r: R - 2.5, color: 'panel' });
    pts.push({ x: j * dx, y: -i, r: 0.01, color: on ? 'ink' : 'ink2', label, labelDx: 0, labelDy: 0, labelAlign: 'center' });
  }));
  (rowNames || []).forEach((s, i) => pts.push({ x: -0.8 * dx, y: -i, r: 0.01, color: 'ink3', label: s, labelDx: 0, labelDy: 0, labelAlign: 'center' }));
  (colNames || []).forEach((s, j) => pts.push({ x: j * dx, y: 0.7, r: 0.01, color: 'ink3', label: s, labelDx: 0, labelDy: 0, labelAlign: 'center' }));
  return {
    type: 'graph',
    params: { x: [-1.3 * dx, (m - 0.2) * dx], y: [-(n - 0.4), 1.2], axes: false, grid: false, xlabel: '', ylabel: '', xticks: 0, yticks: 0, points: pts, ...extra },
    caption,
  };
}

/**
 * An index diagram on the graph sim: each array is a labelled node and each
 * free index a leg — pointing up for an upper index, down for a lower one. A
 * summed pair is a line joining two nodes (labelled with the dummy index), or
 * a loop on one node (a trace). Nodes sit on one row at x = 0, 1.6, 3.2, …
 * unless given x.
 *   nodes: [{ name: 'M', up: ['i'], down: [] }, …]
 *   links: [{ a: 0, b: 1, index: 'j', arc: false }]   loops: [{ node: 2, index: 'k' }]
 */
export function legs(nodes, { links = [], loops = [], caption, gap = 1.6 } = {}) {
  const X = nodes.map((n, k) => n.x ?? k * gap);
  const curves = [], points = [];
  const seg = (x0, y0, x1, y1, o = {}) => curves.push({ param: [`${r6(x0)} + ${r6(x1 - x0)}*t`, `${r6(y0)} + ${r6(y1 - y0)}*t`], t: [0, 1], color: o.color || 'ink2', width: o.width || 2 });
  const tag = (x, y, s, o = {}) => points.push({ x: r6(x), y: r6(y), r: 0.01, color: o.color || 'ink2', label: s, labelDx: o.dx ?? 0, labelDy: o.dy ?? 0, labelAlign: 'center' });
  nodes.forEach((n, k) => {
    const x = X[k];
    const fan = (list, sgn) => list.forEach((ix, j) => {
      const off = (j - (list.length - 1) / 2) * 0.32;
      seg(x + off * 0.4, sgn * 0.2, x + off, sgn * 0.72);
      tag(x + off, sgn * 0.72, ix, { dy: sgn > 0 ? -11 : 11, color: 'ink' });
    });
    fan(n.up || [], 1);
    fan(n.down || [], -1);
  });
  for (const L of links) {
    const [x0, x1] = [X[L.a], X[L.b]];
    if (L.arc) {
      const h = 0.55 + 0.12 * Math.abs(x1 - x0);
      curves.push({ param: [`${r6(x0)} + ${r6(x1 - x0)}*t`, `-0.2 - ${r6(h)}*sin(pi*t)`], t: [0, 1], color: 'gold', width: 2.4 });
      tag((x0 + x1) / 2, -0.2 - h, L.index, { dy: 12, color: 'gold' });
    } else {
      seg(x0 + 0.12, 0, x1 - 0.12, 0, { color: 'gold', width: 2.4 });
      tag((x0 + x1) / 2, 0, L.index, { dy: -12, color: 'gold' });
    }
  }
  for (const L of loops) {
    const x = X[L.node];
    curves.push({ param: [`${r6(x + 0.42)} + 0.26*cos(t)`, '0.26*sin(t)'], t: [-2.4, 2.4], color: 'gold', width: 2.4 });
    tag(x + 0.78, 0, L.index, { color: 'gold', dx: 4 });
  }
  nodes.forEach((n, k) => {
    points.push({ x: X[k], y: 0, r: 15, color: 'accent' }, { x: X[k], y: 0, r: 12.5, color: 'panel' });
    tag(X[k], 0, n.name, { color: 'ink' });
  });
  const lo = Math.min(...X), hi = Math.max(...X);
  const deep = links.some((L) => L.arc) ? 1.45 : 1.15;
  return {
    type: 'graph',
    params: { x: [r6(lo - 0.9), r6(hi + 1.1)], y: [-deep, 1.15], aspect: 'wide', axes: false, grid: false, xlabel: '', ylabel: '', xticks: 0, yticks: 0, curves, points },
    caption: caption || 'An index diagram: each array is a circle; a free index is a loose leg, up for an upper index and down for a lower one; a gold line joins the two halves of a summed pair.',
  };
}

/** The Levi-Civita symbol for indices 1–3: (i − j)(j − k)(k − i)/2. */
export const eps = (i, j, k) => ((i - j) * (j - k) * (k - i)) / 2;
/** The same as an Atlas expression of three index expressions. */
export const epsExpr = (a, b, c) => `((${a}) - (${b}))*((${b}) - (${c}))*((${c}) - (${a}))/2`;
/** The Kronecker delta of two index expressions, as an Atlas expression. */
export const deltaExpr = (a, b) => `(1 - min(1, abs((${a}) - (${b}))))`;

/**
 * The 27 entries of ε_ijk as three 3×3 slices on the graph sim: slice i, row j,
 * column k. values: false hides the numbers. rings: [{ i, j, k, color }] (numbers
 * or expressions of slider keys; i may be 'each' to ring the same (j, k) in every
 * slice). sliders/readouts are passed through.
 */
export function epsSlices({ values = true, rings = [], sliders, readouts, caption } = {}) {
  const pts = [];
  const off = (i) => 4.2 * (i - 1);
  const tagp = (x, y, s, color) => pts.push({ x, y, r: 0.01, color, label: s, labelDx: 0, labelDy: 0, labelAlign: 'center' });
  for (const g of rings) {
    const slices = g.i === 'each' ? [1, 2, 3] : [g.i];
    for (const i of slices) {
      const x = typeof i === 'number' && typeof g.k === 'number' ? off(i) + g.k - 1 : `${typeof i === 'number' ? off(i) : `4.2*((${i}) - 1)`} + (${g.k}) - 1`;
      const y = typeof g.j === 'number' ? 1 - g.j : `1 - (${g.j})`;
      const R = g.r || 15;
      pts.push({ x, y, r: R, color: g.color || 'gold' }, { x, y, r: R - 2.5, color: 'panel' });
    }
  }
  for (let i = 1; i <= 3; i++) {
    tagp(off(i) + 1, 1.05, `ε${'₁₂₃'[i - 1]}ⱼₖ`, 'accent');
    for (let j = 1; j <= 3; j++) for (let k = 1; k <= 3; k++) {
      const e = eps(i, j, k);
      if (values) tagp(off(i) + k - 1, 1 - j, e > 0 ? '+1' : e < 0 ? '−1' : '0', e > 0 ? 'good' : e < 0 ? 'bad' : 'ink4');
      else tagp(off(i) + k - 1, 1 - j, '·', 'ink3');
    }
  }
  return {
    type: 'graph',
    params: { x: [-0.9, 11.1], y: [-2.55, 1.55], aspect: 'wide', axes: false, grid: false, xlabel: '', ylabel: '', xticks: 0, yticks: 0, points: pts, ...(sliders ? { sliders } : {}), ...(readouts ? { readouts } : {}) },
    caption: caption || t`The symbol $\varepsilon_{ijk}$ as three slices, one for each value of $i$; in each slice $j$ numbers the rows (top to bottom) and $k$ the columns (left to right). Only six of the 27 entries are not zero.`,
  };
}
