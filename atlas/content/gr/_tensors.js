// Shared picture builders and constants for the Road's Derivation-Mode
// lessons of steps 10–19 (gr.S10.d … gr.S19.d): covariant derivatives,
// Christoffel symbols, geodesics, transport, curvature and the field
// equations. Every number a lesson prints is computed from these or in the
// lesson itself, so a printed value and its key cannot disagree. Not a
// lesson: files starting with "_" are skipped by tools/register.mjs.

const t = String.raw;

/** Rounded to n significant figures, as a number (for picture coordinates). */
export const rnd = (x, n = 4) => {
  if (!x) return x;
  const p = 10 ** (n - 1 - Math.floor(Math.log10(Math.abs(x))));
  return Math.round(x * p) / p;
};

/** The curves of a polar grid (circles r = 1, 2, … and rays every 30°), for the graph sim. */
export function polarGrid(R = 4, color = 'ink4') {
  const curves = [];
  for (let r = 1; r <= R; r++) curves.push({ param: [`${r}*cos(t)`, `${r}*sin(t)`], t: [0, 6.2832], color, width: 1 });
  for (let k = 0; k < 12; k++) {
    const a = (k * Math.PI) / 6;
    curves.push({ param: [`${rnd(Math.cos(a), 6)}*t`, `${rnd(Math.sin(a), 6)}*t`], t: [0, R + 0.6], color, width: 1 });
  }
  return curves;
}

/**
 * Arrows of a vector field on a flat plane at the integer grid points, each
 * centred on its point. kind: 'uniform' (e_x), 'swirl' (∂_θ = −y ∂_x + x ∂_y),
 * 'radial' (r ∂_r = x ∂_x + y ∂_y), or 'power' (r^k ê_r, needs k). `when` is a
 * graph expression that switches the set on and off.
 */
export function fieldArrows(kind, { R = 4, Ry = 3, scale = 0.6, k = 1, when, color = 'ink3' } = {}) {
  const pts = [];
  for (let i = -R; i <= R; i++) for (let j = -Ry; j <= Ry; j++) if (kind === 'uniform' || Math.hypot(i, j) > 0.5) pts.push([i, j]);
  const vec = ([i, j]) => {
    const r = Math.hypot(i, j);
    if (kind === 'uniform') return [1, 0];
    if (kind === 'swirl') return [-j, i];
    if (kind === 'radial') return [i, j];
    return [(r ** k * i) / r, (r ** k * j) / r];
  };
  // uniform arrows have length `scale`; the others are drawn to scale with each other, the longest 0.85
  const longest = Math.max(...pts.map((p) => Math.hypot(...vec(p))));
  const s = kind === 'uniform' ? scale : 0.85 / longest;
  return pts.map((p) => {
    const [vx, vy] = vec(p), [i, j] = p;
    return { from: [rnd(i - (s * vx) / 2, 5), rnd(j - (s * vy) / 2, 5)], to: [rnd(i + (s * vx) / 2, 5), rnd(j + (s * vy) / 2, 5)], color, ...(when ? { when } : {}) };
  });
}

/** A still picture of a vector field on a polar grid, with optional marked points. */
export function fieldGraph(kind, { k, points = [], arrows = [], caption, R = 4, Ry = 3 } = {}) {
  return {
    type: 'graph',
    params: {
      x: [-R - 0.4, R + 0.4], y: [-Ry - 0.4, Ry + 0.4], equal: true, axes: false, grid: false, xlabel: '', ylabel: '',
      curves: polarGrid(R + 1),
      arrows: [...fieldArrows(kind, { R, Ry, k }), ...arrows],
      points: [{ x: 0, y: 0, r: 3, color: 'ink2' }, ...points],
    },
    ...(caption ? { caption } : {}),
  };
}

/** A still picture from the gr-surface simulation: no controls, no numbers. */
export const surfacePic = (params, caption) => ({
  type: 'gr-surface',
  params: { controls: false, readout: false, ...params },
  ...(caption ? { caption } : {}),
});

/** A unit sphere (surface3d) with curves drawn on it: curves are [x(t), y(t), z(t)] expressions. */
export function spherePic(curves, caption, { yaw = -0.6, pitch = 0.35, dist = 4.2 } = {}) {
  return {
    type: 'surface3d',
    params: {
      surface: ['sin(v)*cos(u)', 'sin(v)*sin(u)', 'cos(v)'], domain: [[0, 6.2832], [0, 3.1416]], n: 28, axes: false, alpha: 0.55, colorBy: false,
      yaw, pitch, dist, curves,
    },
    ...(caption ? { caption } : {}),
  };
}

/** A small table drawn with the graph sim: rows of [label, value] text (canvas text, Unicode only). */
export function textRows(rows, { caption, width = 6, colors = [] } = {}) {
  const n = rows.length;
  return {
    type: 'graph',
    params: {
      x: [0, width], y: [-n - 0.2, 0.4], axes: false, grid: false, xlabel: '', ylabel: '',
      points: rows.flatMap(([a, b], k) => [
        { x: 0.1, y: -k - 0.45, r: 0.01, color: colors[k] || 'ink2', label: a, labelDx: 0, labelDy: 0 },
        ...(b ? [{ x: width * 0.55, y: -k - 0.45, r: 0.01, color: colors[k] || 'ink', label: b, labelDx: 0, labelDy: 0 }] : []),
      ]),
    },
    ...(caption ? { caption } : {}),
  };
}

export { t };
