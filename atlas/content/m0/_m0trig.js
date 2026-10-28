// Figure builders and exact values for the M0 trigonometry lessons (M0-7, M0-8):
// a static unit circle, a sine-type graph with its θ axis marked in multiples of
// π, a labelled triangle, and the exact sines and cosines of the special angles.
// Every figure is a plain 'graph' visual; labels drawn on the canvas are plain
// text (Unicode), never TeX.
import { N } from './_m0kit.js';

export const PI = Math.PI;
export const D2R = PI / 180;
const gcd = (a, b) => (b ? gcd(b, a % b) : a);

/** θ (radians) as a multiple of π: TeX ('\tfrac{5\pi}{6}', '-\tfrac{\pi}{2}', '2\pi'), or null if not a multiple of π/12. */
export function piTeX(th, frac = 'tfrac') {
  const n = Math.round(th / (PI / 12));
  if (Math.abs(th - (n * PI) / 12) > 1e-9) return null;
  if (n === 0) return '0';
  const g = gcd(Math.abs(n), 12), p = n / g, q = 12 / g;
  const num = `${Math.abs(p) === 1 ? '' : Math.abs(p)}\\pi`;
  return `${p < 0 ? '-' : ''}${q === 1 ? num : `\\${frac}{${num}}{${q}}`}`;
}
/** The same as plain text for a canvas label: 5π/6, −π/2, 2π. */
export function piText(th) {
  const n = Math.round(th / (PI / 12));
  if (Math.abs(th - (n * PI) / 12) > 1e-9) return null;
  if (n === 0) return '0';
  const g = gcd(Math.abs(n), 12), p = n / g, q = 12 / g;
  const num = `${p < 0 ? '−' : ''}${Math.abs(p) === 1 ? '' : Math.abs(p)}π`;
  return q === 1 ? num : `${num}/${q}`;
}
/** The same in Atlas answer syntax: 5pi/6. */
export function piAns(th) {
  const n = Math.round(th / (PI / 12));
  const g = gcd(Math.abs(n), 12) || 12, p = n / g, q = 12 / g;
  if (n === 0) return '0';
  return `${p}pi${q === 1 ? '' : `/${q}`}`;
}

// exact sines of the multiples of 15° in [0°, 90°], as TeX (cosines by symmetry)
const SIN_EXACT = { 0: '0', 15: '\\frac{\\sqrt6 - \\sqrt2}{4}', 30: '\\frac12', 45: '\\frac{\\sqrt2}{2}', 60: '\\frac{\\sqrt3}{2}', 75: '\\frac{\\sqrt6 + \\sqrt2}{4}', 90: '1' };
const TAN_EXACT = { 0: '0', 30: '\\frac{1}{\\sqrt3}', 45: '1', 60: '\\sqrt3' };
/** Exact sin, cos or tan of an angle given in whole degrees (a multiple of 15°; tan needs a multiple of 30° or 45°), as TeX. */
export function exact(fnName, deg) {
  const d = ((deg % 360) + 360) % 360;
  const ref = d <= 90 ? d : d <= 180 ? 180 - d : d <= 270 ? d - 180 : 360 - d;
  const s = Math.sin(d * D2R), c = Math.cos(d * D2R);
  const sign = (v) => (Math.abs(v) < 1e-12 ? '' : v < 0 ? '-' : '');
  if (fnName === 'sin') return `${sign(s)}${SIN_EXACT[ref]}`;
  if (fnName === 'cos') return `${sign(c)}${SIN_EXACT[90 - ref]}`;
  if (Math.abs(c) < 1e-12) return null;
  return `${sign(s / c)}${TAN_EXACT[ref]}`;
}

/** Points labelled with multiples of π (or degrees) along y = yAt, as tick labels for a graph whose own x ticks are off. */
export function piTicks(lo, hi, step = PI / 2, yAt = 0, { deg = false, dy = 13, skipZero = true } = {}) {
  const out = [];
  for (let k = Math.ceil(lo / step - 1e-9); k * step <= hi + 1e-9; k++) {
    const t = k * step;
    if (skipZero && Math.abs(t) < 1e-9) continue;
    out.push({ x: N(t), y: N(yAt), r: 2.5, color: 'ink3', label: deg ? `${Math.round(t / D2R)}°` : piText(t), labelAlign: 'center', labelDx: 0, labelDy: dy });
  }
  return out;
}

/**
 * A static unit circle with P at angle th (radians): the radius, the arc from
 * (1, 0), the cos and sin legs and P. Pass legs: false, arc: false, ray: false,
 * point: false to hide those; pLabel: '' to leave P unlabelled; extra merges into the params.
 */
export function circleFig({ th, legs = true, arc = true, ray = true, point = true, pLabel = 'P', legLabels = true, r = 1, caption, extra = {}, win = 1.35, aspect = 'wide' }) {
  const c = Math.cos(th), s = Math.sin(th);
  const curves = [{ param: [`${r}*cos(t)`, `${r}*sin(t)`], t: [0, N(2 * PI)], color: 'ink3', width: 1.6 }];
  if (arc && Math.abs(th) > 1e-9) curves.push({ param: [`${r}*cos(t)`, `${r}*sin(t)`], t: th > 0 ? [0, N(th)] : [N(th), 0], color: 'gold', width: 4 });
  if (ray) curves.push({ param: [`t*${N(r * c)}`, `t*${N(r * s)}`], t: [0, 1], color: 'ink2', width: 2 });
  if (legs) {
    curves.push({ param: [`t*${N(r * c)}`, '0'], t: [0, 1], color: 'accent', width: 4 });
    curves.push({ param: [N(r * c), `t*${N(r * s)}`], t: [0, 1], color: 'warn', width: 4 });
  }
  const points = point ? [{ x: N(r * c), y: N(r * s), color: 'ink', r: 5, label: pLabel || undefined, labelDx: c >= 0 ? 8 : -22, labelDy: s >= 0 ? -10 : 14 }] : [];
  if (legs && legLabels) {
    if (Math.abs(c) > 0.2) points.push({ x: N((r * c) / 2), y: 0, r: 0, label: 'cos θ', color: 'accent', labelAlign: 'center', labelDx: 0, labelDy: s >= 0 ? 13 : -13 });
    if (Math.abs(s) > 0.2) points.push({ x: N(r * c), y: N((r * s) / 2), r: 0, label: 'sin θ', color: 'warn', labelAlign: c >= 0 ? 'left' : 'right', labelDx: c >= 0 ? 7 : -7, labelDy: 0 });
  }
  return {
    type: 'graph',
    params: { x: [-win * r, win * r], y: [-win * r, win * r], equal: true, aspect, xlabel: '', ylabel: '', xticks: 0, yticks: 0, grid: false, curves, points, ...extra, ...(extra.curves ? { curves: [...curves, ...extra.curves] } : {}), ...(extra.points ? { points: [...points, ...extra.points] } : {}) },
    caption,
  };
}

/**
 * A triangle through three vertices [[x, y], …] with optional vertex, side and
 * angle labels. right: index of a right-angle vertex (draws the small square).
 */
export function triFig({ v, vLabels = [], sides = [], right = null, angleAt = null, angleLabel = 'θ', caption, extra = {}, pad = 0.18, aspect = 'wide', fill = 'accent' }) {
  const xs = v.map((p) => p[0]), ys = v.map((p) => p[1]);
  const w = Math.max(...xs) - Math.min(...xs), hgt = Math.max(...ys) - Math.min(...ys), m = pad * Math.max(w, hgt);
  const curves = [];
  for (let i = 0; i < 3; i++) {
    const [a, b] = [v[i], v[(i + 1) % 3]];
    curves.push({ param: [`${N(a[0])} + t*(${N(b[0] - a[0])})`, `${N(a[1])} + t*(${N(b[1] - a[1])})`], t: [0, 1], color: 'ink2', width: 2.4 });
  }
  const points = [];
  if (right !== null) {
    const p = v[right], q1 = v[(right + 1) % 3], q2 = v[(right + 2) % 3];
    const u = (q) => { const dx = q[0] - p[0], dy = q[1] - p[1], L = Math.hypot(dx, dy); return [dx / L, dy / L]; };
    const s = 0.07 * Math.max(w, hgt), [ax, ay] = u(q1), [bx, by] = u(q2);
    const c1 = [p[0] + s * ax, p[1] + s * ay], c2 = [p[0] + s * (ax + bx), p[1] + s * (ay + by)], c3 = [p[0] + s * bx, p[1] + s * by];
    curves.push({ param: [`${N(c1[0])} + t*(${N(c2[0] - c1[0])})`, `${N(c1[1])} + t*(${N(c2[1] - c1[1])})`], t: [0, 1], color: 'ink3', width: 1.4 });
    curves.push({ param: [`${N(c2[0])} + t*(${N(c3[0] - c2[0])})`, `${N(c2[1])} + t*(${N(c3[1] - c2[1])})`], t: [0, 1], color: 'ink3', width: 1.4 });
  }
  if (angleAt !== null) {
    const p = v[angleAt], q1 = v[(angleAt + 1) % 3], q2 = v[(angleAt + 2) % 3];
    let a1 = Math.atan2(q1[1] - p[1], q1[0] - p[0]), a2 = Math.atan2(q2[1] - p[1], q2[0] - p[0]);
    let d = a2 - a1; while (d > PI) d -= 2 * PI; while (d < -PI) d += 2 * PI;
    const rr = 0.16 * Math.max(w, hgt);
    curves.push({ param: [`${N(p[0])} + ${N(rr)}*cos(t)`, `${N(p[1])} + ${N(rr)}*sin(t)`], t: d > 0 ? [N(a1), N(a1 + d)] : [N(a1 + d), N(a1)], color: 'gold', width: 2.2 });
    const mid = a1 + d / 2;
    if (angleLabel) points.push({ x: N(p[0] + 1.55 * rr * Math.cos(mid)), y: N(p[1] + 1.55 * rr * Math.sin(mid)), r: 0, label: angleLabel, color: 'gold', labelAlign: 'center', labelDx: 0, labelDy: 0 });
  }
  const cx = xs.reduce((s, x) => s + x, 0) / 3, cy = ys.reduce((s, y) => s + y, 0) / 3;
  v.forEach((p, i) => {
    if (!vLabels[i]) return;
    const dx = p[0] - cx, dy = p[1] - cy, L = Math.hypot(dx, dy) || 1;
    points.push({ x: N(p[0]), y: N(p[1]), r: 3.5, color: 'ink2', label: vLabels[i], labelAlign: 'center', labelDx: Math.round(14 * dx / L), labelDy: Math.round(-14 * dy / L) });
  });
  sides.forEach((lab, i) => {
    if (!lab) return;
    const a = v[i], b = v[(i + 1) % 3], mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2;
    let nx = -(b[1] - a[1]), ny = b[0] - a[0];
    const L = Math.hypot(nx, ny) || 1; nx /= L; ny /= L;
    if (nx * (mx - cx) + ny * (my - cy) < 0) { nx = -nx; ny = -ny; }
    points.push({ x: N(mx), y: N(my), r: 0, label: lab, color: 'accent2', labelAlign: 'center', labelDx: Math.round(16 * nx), labelDy: Math.round(-14 * ny) });
  });
  const shade = [];
  void fill;
  return {
    type: 'graph',
    params: { x: [Math.min(...xs) - m, Math.max(...xs) + m], y: [Math.min(...ys) - m, Math.max(...ys) + m], equal: true, aspect, axes: false, grid: false, xticks: 0, yticks: 0, xlabel: '', ylabel: '', curves, points, shade, ...extra, ...(extra.curves ? { curves: [...curves, ...extra.curves] } : {}), ...(extra.points ? { points: [...points, ...extra.points] } : {}) },
    caption,
  };
}

/**
 * A graph of trigonometric curves against an angle axis marked in multiples of
 * π (the graph's own x ticks are off). curves as for a graph; the tick labels
 * sit just inside the bottom of the frame.
 */
export function trigGraph({ curves, lo = 0, hi = 2 * PI, y = [-1.4, 1.4], step = PI / 2, xlabel = 'x', ylabel = 'y', caption, extra = {}, deg = false, aspect = 'wide' }) {
  const ticks = [];
  for (let k = Math.ceil(lo / step - 1e-9); k * step <= hi + 1e-9; k++) {
    const x = k * step;
    if (Math.abs(x) < 1e-9) continue;
    ticks.push({ x: N(x), y: 0, r: 2.5, color: 'ink3' });
    ticks.push({ x: N(x), y: N(y[0]), r: 0, color: 'ink3', label: deg ? `${Math.round(x / D2R)}°` : piText(x), labelAlign: 'center', labelDx: 0, labelDy: -9 });
  }
  return {
    type: 'graph',
    params: { x: [lo - 0.04 * (hi - lo), hi + 0.04 * (hi - lo)], y, aspect, xlabel, ylabel, xticks: 0, yticks: 4, curves, ...extra, points: [...ticks, ...(extra.points || [])] },
    caption,
  };
}
