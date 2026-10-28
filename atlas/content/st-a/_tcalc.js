// Shared builders for Advanced Math A, modules A7–A10 (tensor fields, the
// covariant derivative, curvilinear calculus, the Levi-Civita tensor):
// still pictures on the graph simulation — polar grids, basis arrows, vector
// fields, a loaded beam — and the polar-coordinate formulas the generators
// share. Course-local; not a lesson (files starting with "_" are skipped).

const t = String.raw;
const DEG = Math.PI / 180;

/** Round for expressions and positions, so a generated picture has short, stable numbers. */
export const r6 = (x) => +(+x).toFixed(6);

/** The curves of a polar grid: circles every `step` out to R, and `rays` rays. */
export function polarGrid(R, { step = 1, color = 'ink4', rays = 12, width = 1 } = {}) {
  const curves = [];
  for (let q = step; q <= R + 1e-9; q += step) curves.push({ param: [`${r6(q)}*cos(t)`, `${r6(q)}*sin(t)`], t: [0, 6.2832], color, width });
  for (let k = 0; k < rays; k++) {
    const a = (2 * Math.PI * k) / rays;
    curves.push({ param: [`t*${r6(Math.cos(a))}`, `t*${r6(Math.sin(a))}`], t: [0, r6(R * 1.05)], color, width });
  }
  return curves;
}

/** A still picture on the graph sim with no axes: a window, curves, arrows, points. */
export function plane({ x, y, curves = [], arrows = [], points = [], caption, aspect = 'wide', extra = {} }) {
  return {
    type: 'graph',
    params: { x, y, equal: true, aspect, axes: false, grid: false, xlabel: '', ylabel: '', xticks: 0, yticks: 0, curves, arrows, points, ...extra },
    ...(caption ? { caption } : {}),
  };
}

/**
 * The polar coordinate basis at the point (x, y): ∂r (blue, unit length) and
 * k·∂θ (violet; the full ∂θ is r long). Returns graph arrows.
 */
export function basisAt([x, y], { k = 0.25, labels = true, width = 2.2, alpha } = {}) {
  const r = Math.hypot(x, y), c = x / r, s = y / r;
  const lab = k === 1 ? '∂θ' : `${String(k).replace(/^0\./, '0.')}∂θ`;
  return [
    { from: [r6(x), r6(y)], to: [r6(x + c), r6(y + s)], color: 'accent', width, ...(labels ? { label: '∂r' } : {}) },
    { from: [r6(x), r6(y)], to: [r6(x - k * y), r6(y + k * x)], color: 'violet', width, ...(labels ? { label: lab } : {}) },
  ];
}

/**
 * A vector field's arrows, centred on grid points: f(x, y) → [vx, vy] in
 * Cartesian components. Arrows are drawn to scale with one another, the
 * longest `maxLen` long (or `scale` per unit of field if given). skip(x, y)
 * leaves a point out (near a singularity, say).
 */
export function fieldArrows(f, { x = [-3, 3], y = [-2, 2], step = 1, maxLen = 0.8, scale, skip = () => false, color = 'ink3', width = 1.4, cap } = {}) {
  const pts = [];
  for (let i = Math.ceil(x[0] / step); i * step <= x[1] + 1e-9; i++) for (let j = Math.ceil(y[0] / step); j * step <= y[1] + 1e-9; j++) {
    const X = i * step, Y = j * step;
    if (!skip(X, Y)) pts.push([X, Y, ...f(X, Y)]);
  }
  const big = Math.max(...pts.map((p) => Math.min(Math.hypot(p[2], p[3]), cap ?? Infinity)));
  const s = scale ?? maxLen / big;
  return pts.map(([X, Y, vx, vy]) => {
    const m = Math.hypot(vx, vy), k = cap && m > cap ? cap / m : 1;
    return { from: [r6(X - (s * k * vx) / 2), r6(Y - (s * k * vy) / 2)], to: [r6(X + (s * k * vx) / 2), r6(Y + (s * k * vy) / 2)], color, width };
  });
}

/** Cartesian components of a·∂r + b·∂θ at the point (x, y). */
export const polarToCart = ([x, y], a, b) => {
  const r = Math.hypot(x, y);
  return [a * x / r - b * y, a * y / r + b * x];
};

/** Polar coordinate components (V^r, V^θ) of a Cartesian vector V at the point (x, y). */
export const cartToPolar = ([x, y], [vx, vy]) => {
  const r = Math.hypot(x, y);
  return [(x * vx + y * vy) / r, (x * vy - y * vx) / (r * r)];
};

// ── the loaded cantilever of lesson A7.1 ─────────────────────────────────────
// A cantilever fixed at x = 0 (the wall), free at x = L, carrying a downward
// load P at its tip; rectangular section b × h; y measured up from the neutral
// axis. Euler–Bernoulli beam theory: σxx = P(L − x)y/I, σxy = −(3P/2bh)(1 − 4y²/h²),
// σyy ≈ 0, with I = bh³/12. All in SI (Pa).
export const beamStress = ({ P, L, b, h }, x, y) => {
  const I = (b * h ** 3) / 12;
  return { sxx: (P * (L - x) * y) / I, sxy: -((3 * P) / (2 * b * h)) * (1 - (4 * y * y) / (h * h)), I };
};

/**
 * A still picture of the cantilever (drawn with its depth exaggerated by
 * `ys`), with marked points and optional extra arrows (in drawing units).
 * pts: [{ x, y, label }] in metres.
 */
export function beamPic({ L, h }, { pts = [], arrows = [], caption, ys = 3, load = true } = {}) {
  const H = (h / 2) * ys;
  const curves = [
    { param: [`${r6(L)}*t`, `${r6(H)}`], t: [0, 1], color: 'ink2', width: 2 },
    { param: [`${r6(L)}*t`, `${r6(-H)}`], t: [0, 1], color: 'ink2', width: 2 },
    { param: [`${r6(L)}`, `${r6(-H)} + ${r6(2 * H)}*t`], t: [0, 1], color: 'ink2', width: 2 },
    { param: ['0', `${r6(-2.2 * H)} + ${r6(4.4 * H)}*t`], t: [0, 1], color: 'ink3', width: 4 },
    { param: [`${r6(L)}*t`, '0'], t: [0, 1], color: 'ink4', width: 1, dash: [4, 4] },
  ];
  for (let k = 0; k < 6; k++) {
    const y0 = -2.2 * H + (k + 0.5) * (4.4 * H / 6);
    curves.push({ param: [`-0.06*t`, `${r6(y0)} - 0.06*t`], t: [0, 1], color: 'ink3', width: 1.2 });
  }
  const A = [...arrows];
  if (load) A.push({ from: [r6(L), r6(H + 0.32)], to: [r6(L), r6(H + 0.02)], color: 'bad', width: 2.6, label: 'load', labelDx: 6, labelDy: -12 });
  return plane({
    x: [-0.25, r6(L + 0.35)], y: [r6(-H - 0.3), r6(H + 0.4)], curves, arrows: A,
    points: pts.map((p) => ({ x: r6(p.x), y: r6(p.y * ys), color: 'gold', r: 4, label: p.label || '', labelDx: p.dx ?? 8, labelDy: p.dy ?? -4 })),
    caption,
  });
}

export { t, DEG };
