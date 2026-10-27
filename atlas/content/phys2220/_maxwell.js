// Constants, number formats and picture builders for the PHYS 2220
// inductance, AC-circuit and Maxwell lessons (modules B4–B6). Not a lesson:
// the leading underscore keeps it out of the registry.
//
// Answers are computed with the rounded constants the prompts quote
// (μ₀ = 4π×10⁻⁷ T·m/A, ε₀ = 8.854×10⁻¹² F/m, c = 3.00×10⁸ m/s where a prompt
// says so), so a learner who uses them lands on the key.
//
// Colours, the same in every picture of these modules (and in the em-ac
// simulation): current blue ('accent'); source voltage gold; v_R orange
// ('warn', heat); v_L and magnetic field teal; v_C and electric field violet.

export const MU0 = 4e-7 * Math.PI;      // T·m/A
export const EPS0 = 8.854e-12;          // F/m
export const C_LIGHT = 2.998e8;         // m/s
export const C3 = 3.0e8;                // m/s, the rounded value prompts may quote
export const H_PLANCK = 6.626e-34;      // J·s
export const EV = 1.602e-19;            // J
export const DEG = Math.PI / 180;
export const COL = { i: 'accent', v: 'gold', R: 'warn', L: 'teal', C: 'violet', B: 'teal', E: 'violet', k: 'ink2' };

/** A number as TeX with n significant figures, with ×10ⁿ outside [10⁻³, 10⁴). */
export function tn(x, n = 3) {
  if (!Number.isFinite(x)) return String(x);
  if (x === 0) return '0';
  const r = +x.toPrecision(n), a = Math.abs(r);
  if (a >= 1e4 || a < 1e-3) {
    const [m, e] = r.toExponential(n - 1).split('e');
    return `${m} \\times 10^{${parseInt(e, 10)}}`;
  }
  const d = Math.max(0, n - 1 - Math.floor(Math.log10(a)));
  return r.toFixed(d);
}
/** Round to n significant figures, as a number. */
export const sf = (x, n = 3) => (x === 0 ? 0 : +x.toPrecision(n));
/** Six significant figures, for numbers written into expressions. */
export const r6 = (v) => +(+v).toPrecision(6);
/** Keep only the slips that land well away from the answer (some coincide for some parameters). */
export const apart = (errors, answer, rel = 0.03) => errors.filter((e) => Number.isFinite(e.value) && Math.abs(e.value - answer) > rel * Math.abs(answer));

const PRE = [[1e9, 'G'], [1e6, 'M'], [1e3, 'k'], [1, ''], [1e-3, 'm'], [1e-6, 'µ'], [1e-9, 'n'], [1e-12, 'p']];
/** Plain text with an SI prefix, for canvas labels and prose: si(0.000987, 'H') → "0.987 mH". */
export function si(x, unit, n = 3) {
  if (x === 0) return `0 ${unit}`;
  const [f, p] = PRE.find(([s]) => Math.abs(x) >= s * 0.9995) || PRE[PRE.length - 1];
  return `${+(x / f).toPrecision(n)} ${p}${unit}`.replace('-', '−');
}
/** The same inside TeX, keeping n significant figures: siTeX(0.000987, 'H') → "0.987\\ \\text{mH}". */
export function siTeX(x, unit, n = 3) {
  const u = unit === 'Ω' ? '\\Omega' : `\\text{${unit}}`;
  if (x === 0) return `0\\ ${u}`;
  const [f, p] = PRE.find(([s]) => Math.abs(x) >= s * 0.9995) || PRE[PRE.length - 1];
  const pre = p === 'µ' ? '\\mu' : p ? `\\text{${p}}` : '';
  return `${(x / f).toPrecision(n)}\\ ${pre}${u}`;
}

// ─── simulation shorthands ─────────────────────────────────────────────────
/** An em-ac picture for a problem: a still, no controls, no readout (show what the question needs). */
export const acPic = (params, caption) => ({ type: 'em-ac', params: { controls: [], readout: false, ...params }, ...(caption ? { caption } : {}) });

// ─── graph pictures ────────────────────────────────────────────────────────
/** A straight segment as a graph curve. */
export const seg = (a, b, { color = 'ink2', width = 2.2, dash = false } = {}) => ({
  param: [`${r6(a[0])} + t*${r6(b[0] - a[0])}`, `${r6(a[1])} + t*${r6(b[1] - a[1])}`], t: [0, 1], color, width, ...(dash ? { dash: true } : {}),
});
/** A text label at (x, y): a point too small to see, with its label centred on it. */
export const lab = (x, y, text, color = 'ink2', dx = 0, dy = 0, align = 'center') => ({ x: r6(x), y: r6(y), r: 0.01, color, label: text, labelDx: dx, labelDy: dy, labelAlign: align });
/** A polyline through points, as graph curves. */
export const pwl = (pts, opts) => pts.slice(1).map((p, k) => seg(pts[k], p, opts));

/**
 * A solenoid sketched from the side (not to scale): windings, the length ℓ and
 * diameter d dimensioned, the turn count above; optionally the field inside
 * and the current in the leads.
 */
export function solenoidPic({ len = '?', d = '?', N = '?', field = false, current = null, caption, loops = 12 }) {
  const x0 = -2.4, x1 = 2.4, ry = 0.85, rx = 0.17;
  const curves = [];
  for (let k = 0; k < loops; k++) {
    const xc = x0 + ((x1 - x0) * (k + 0.5)) / loops;
    curves.push({ param: [`${r6(xc)} + ${rx}*cos(t)`, `${ry}*sin(t)`], t: [r6(Math.PI / 2), r6((3 * Math.PI) / 2)], color: 'ink3', width: 1.3, dash: true });
    curves.push({ param: [`${r6(xc)} + ${rx}*cos(t)`, `${ry}*sin(t)`], t: [r6(-Math.PI / 2), r6(Math.PI / 2)], color: 'ink2', width: 2.2 });
  }
  const xa = x0 + (x1 - x0) / (2 * loops), xb = x1 - (x1 - x0) / (2 * loops);
  curves.push(...pwl([[xa, -ry], [xa, -1.25], [-3.3, -1.25]], { color: 'ink2', width: 2 }), ...pwl([[xb, -ry], [xb, -1.25], [3.3, -1.25]], { color: 'ink2', width: 2 }));
  if (field) curves.push(seg([x0 - 0.5, 0], [x1 + 0.5, 0], { color: COL.B, width: 1.8 }), seg([x0 - 0.5, 0.42], [x1 + 0.5, 0.42], { color: COL.B, width: 1.5 }), seg([x0 - 0.5, -0.42], [x1 + 0.5, -0.42], { color: COL.B, width: 1.5 }));
  const arrows = [
    { from: [0, -1.7], to: [x0, -1.7], color: 'ink3' }, { from: [0, -1.7], to: [x1, -1.7], color: 'ink3' },
    { from: [-3.0, 0], to: [-3.0, ry], color: 'ink3' }, { from: [-3.0, 0], to: [-3.0, -ry], color: 'ink3' },
  ];
  if (field) arrows.push({ from: [x1 + 0.2, 0], to: [x1 + 0.75, 0], color: COL.B, label: 'B', labelDx: 6, labelDy: -8 });
  if (current) arrows.push({ from: [-3.3, -1.25], to: [-2.75, -1.25], color: COL.i, label: current, labelDx: -30, labelDy: 14 });
  const points = [lab(0, -1.7, `ℓ = ${len}`, 'ink', 0, -11), lab(-3.15, 0, `d = ${d}`, 'ink', 0, 0, 'right'), lab(0, 1.18, `N = ${N}`, 'ink')];
  return {
    type: 'graph',
    params: { x: [-4.9, 4], y: [-2.05, 1.5], aspect: 'wide', equal: true, axes: false, grid: false, xlabel: '', ylabel: '', curves, arrows, points },
    caption: caption ?? 'The solenoid from the side, not to scale: the drawing shows a few of the turns. Its length is many times its diameter, so the field inside is nearly uniform.',
  };
}

/**
 * The current through a coil against time, as straight pieces between the
 * given points [t, I] (t in the time unit, I in the current unit). `marks`
 * are labelled points; the emf is not drawn unless asked for.
 */
export function currentGraph({ pts, tUnit = 'ms', iUnit = 'A', y, x, marks = [], extra = {}, caption, ylabel }) {
  const ts = pts.map((p) => p[0]), Is = pts.map((p) => p[1]);
  const xr = x ?? [0, r6(Math.max(...ts) * 1.04)], yr = y ?? [r6(Math.min(0, ...Is) * 1.2), r6(Math.max(...Is) * 1.25 || 1)];
  return {
    type: 'graph',
    params: { x: xr, y: yr, aspect: 'wide', axesAt: 'edge', xlabel: `t (${tUnit})`, ylabel: ylabel ?? `I (${iUnit})`, curves: pwl(pts, { color: COL.i, width: 2.6 }), points: marks, ...extra },
    ...(caption ? { caption } : {}),
  };
}

/**
 * v(t) and i(t) for an AC element: v = sin(ωt) (amplitude 1) and
 * i = a·sin(ωt − φ), φ in degrees (positive: the current lags). Time in
 * periods. `show` picks the curves to draw.
 */
export function acTraces({ phi = 90, a = 0.65, show = ['v', 'i'], marks = [], vlines = [], caption, periods = 2, labels = true }) {
  const curves = [];
  if (show.includes('v')) curves.push({ fn: 'sin(2*pi*x)', color: COL.v, width: 2.6, ...(labels ? { label: 'v', labelAt: 0.25, labelDy: -14 } : {}) });
  if (show.includes('i')) curves.push({ fn: `${a}*sin(2*pi*x - ${r6(phi * DEG)})`, color: COL.i, width: 2.6, ...(labels ? { label: 'i', labelAt: r6(0.25 + phi / 360 + (phi / 360 + 0.25 > 1 ? -1 : 0)), labelDy: -14 } : {}) });
  return {
    type: 'graph',
    params: { x: [0, periods], y: [-1.3, 1.3], aspect: 'wide', axesAt: 'edge', xlabel: 't (periods)', ylabel: '', yticks: 0.001, xticks: periods * 4, curves, points: marks, vlines },
    caption: caption ?? 'The source voltage v (gold) and the current i (blue) against time, in periods of the source. The current is drawn to its own scale.',
  };
}

/** A static phasor diagram: arrows from the origin (or from a given tail), angle in degrees from +x. */
export function phasorPic({ items, R = 1.2, caption, circle = true, extra = {} }) {
  const arrows = [], points = [], curves = [];
  for (const it of items) {
    const a = it.deg * DEG, from = it.from ?? [0, 0];
    const to = [from[0] + it.len * Math.cos(a), from[1] + it.len * Math.sin(a)];
    arrows.push({ from: from.map(r6), to: to.map(r6), color: it.color, ...(it.label ? { label: it.label, labelDx: it.ldx ?? (Math.cos(a) >= -0.2 ? 6 : -22), labelDy: it.ldy ?? (Math.sin(a) >= 0 ? -10 : 12) } : {}) });
    it.to = to;
  }
  if (circle) curves.push({ param: [`${R}*cos(t)`, `${R}*sin(t)`], t: [0, 6.2832], color: 'ink4', width: 1 });
  return {
    type: 'graph',
    params: { x: [-1.6 * R, 1.6 * R], y: [-1.15 * R, 1.15 * R], aspect: 'wide', equal: true, grid: false, axes: true, xlabel: '', ylabel: '', xticks: 0.001, yticks: 0.001, curves, arrows, points, ...extra },
    caption: caption ?? 'A phasor diagram: each arrow’s length is an amplitude, and its height, as the diagram rotates counter-clockwise, is the value at that instant.',
  };
}

/** A time axis for a span T seconds: [factor to multiply seconds by, unit]. */
export const tAxis = (T) => (T >= 2 ? [1, 's'] : T >= 2e-3 ? [1e3, 'ms'] : [1e6, 'µs']);

/**
 * The current in an RL circuit after the switch moves: rising from 0 toward
 * ℰ/R (on), or decaying from ℰ/R (off). The time constant and the final
 * current are marked unless asked not to be; `vlines`, `marks` and `curves`
 * pass on (times in the axis unit, which is chosen from τ).
 */
export function rlGraph({ E, R, L, on = true, span = 5, marks = [], tauLine = true, finalLine = true, vlines = [], hlines = [], curves = [], caption, numbers = true, ylabel = 'I (A)' }) {
  const tau = L / R, I = E / R, [f, u] = tAxis(span * tau), T = tau * f, tm = span * T;
  const fn = on ? `${r6(I)}*(1 - e^(-x/${r6(T)}))` : `${r6(I)}*e^(-x/${r6(T)})`;
  return {
    type: 'graph',
    params: {
      x: [0, r6(tm)], y: [0, r6(I * 1.2)], aspect: 'wide', axesAt: 'edge', xlabel: `t (${u})`, ylabel,
      ...(numbers ? {} : { xticks: 0.001, yticks: 0.001 }),
      curves: [{ fn, color: COL.i, width: 2.6, domain: [0, r6(tm)] }, ...curves],
      hlines: [...(finalLine ? [{ y: r6(I), color: 'ink3', label: on ? 'ℰ/R' : '' }] : []), ...hlines],
      vlines: [...(tauLine ? [{ x: r6(T), color: 'gold', label: 'τ' }] : []), ...vlines],
      points: marks,
    },
    caption: caption ?? `The current after the switch ${on ? 'connects the battery' : 'cuts the battery out'}${tauLine ? '; the gold line marks one time constant' : ''}.`,
  };
}
