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
 * right, each entry a labelled dot. hl: a list of [row, col] (0-based) drawn gold;
 * rowNames / colNames: plain-text labels at the left and top.
 */
export function grid(rows, { hl = [], rowNames, colNames, caption, dx = 1, extra = {} } = {}) {
  const n = rows.length, m = rows[0].length;
  const pts = [];
  rows.forEach((row, i) => row.forEach((v, j) => {
    const on = hl.some(([a, b]) => a === i && b === j);
    pts.push({ x: j * dx, y: -i, r: on ? 7 : 4, color: on ? 'gold' : 'ink3', label: String(v).replace('-', '−'), labelDx: 9, labelDy: -10 });
  }));
  (rowNames || []).forEach((s, i) => pts.push({ x: -0.75 * dx, y: -i, r: 0.1, color: 'ink2', label: s, labelDx: 0, labelDy: 0, labelAlign: 'center' }));
  (colNames || []).forEach((s, j) => pts.push({ x: j * dx, y: 0.75, r: 0.1, color: 'ink2', label: s, labelDx: 0, labelDy: 0, labelAlign: 'center' }));
  return {
    type: 'graph',
    params: { x: [-1.3 * dx, (m - 0.2) * dx], y: [-(n - 0.4), 1.2], axes: false, grid: false, xlabel: '', ylabel: '', xticks: 0, yticks: 0, points: pts, ...extra },
    caption,
  };
}
