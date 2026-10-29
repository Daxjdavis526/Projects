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
export function solenoidPic({ len = '?', d = '?', N = '?', field = false, current = null, caption, loops = 12, raw = false }) {
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
  const points = [lab(0, -1.7, raw ? len : `ℓ = ${len}`, 'ink', 0, -11), lab(-3.15, 0, raw ? d : `d = ${d}`, 'ink', 0, 0, 'right'), ...(N === null ? [] : [lab(0, 1.18, raw ? N : `N = ${N}`, 'ink')])];
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

/** the impedance triangle: R along x, the net reactance up (inductive) or down (capacitive), Z the hypotenuse; labels at the sides' middles */
export function impedanceTriangle({ R, X, labels = { R: 'R', X: 'net reactance', Z: 'Z' }, showZ = true, caption }) {
  const s = 1 / Math.max(R, Math.abs(X), 1e-9);
  const r = R * s, x = X * s, up = x >= 0 ? 1 : -1, ph = Math.atan2(x, r), ra = Math.min(0.28, 0.45 * Math.hypot(r, x));
  return {
    type: 'graph',
    params: {
      x: [-0.75, 1.75], y: [Math.min(-0.3, x - 0.22), Math.max(0.3, x + 0.22)], aspect: 'wide', equal: true, axes: false, grid: false, xlabel: '', ylabel: '',
      curves: Math.abs(ph) > 0.05 ? [{ param: [`${ra}*cos(t)`, `${ra}*sin(t)`], t: [Math.min(0, r6(ph)), Math.max(0, r6(ph))], color: 'ink2', width: 1.5 }] : [],
      arrows: [
        { from: [0, 0], to: [r6(r), 0], color: COL.R },
        { from: [r6(r), 0], to: [r6(r), r6(x)], color: x >= 0 ? COL.L : COL.C },
        ...(showZ ? [{ from: [0, 0], to: [r6(r), r6(x)], color: COL.v }] : []),
      ],
      points: [
        { x: r6(r / 2), y: 0, r: 0.01, color: COL.R, label: labels.R, labelDx: 0, labelDy: up * 14, labelAlign: 'center' },
        { x: r6(r), y: r6(x / 2), r: 0.01, color: x >= 0 ? COL.L : COL.C, label: labels.X, labelDx: 9, labelDy: 0, labelAlign: 'left' },
        ...(showZ ? [{ x: r6(r / 2), y: r6(x / 2), r: 0.01, color: COL.v, label: labels.Z, labelDx: -10, labelDy: -up * 10, labelAlign: 'right' }] : []),
        ...(Math.abs(ph) > 0.05 ? [{ x: r6((ra + 0.07) * Math.cos(ph / 2)), y: r6((ra + 0.07) * Math.sin(ph / 2)), r: 0.01, color: 'ink2', label: 'φ', labelDx: 0, labelDy: 0, labelAlign: 'center' }] : []),
      ],
    },
    caption: caption ?? 'The impedance triangle: R along the current’s direction, the net reactance at right angles, and Z their phasor sum.',
  };
}

// ─── light: em-wave, em-spectrum and direction pictures (B6.3–B6.5) ─────────
/** An em-wave picture for a problem: a still, no controls, no readout. */
export const wavePic = (params, caption) => ({ type: 'em-wave', params: { controls: [], readout: false, phase: 40, ...params }, ...(caption ? { caption } : {}) });
/** An em-spectrum picture for a problem: no slider, no readout. */
export const specPic = (params, caption) => ({ type: 'em-spectrum', params: { controls: [], readout: false, ...params }, ...(caption ? { caption } : {}) });

/** Unit vectors along the axes, by name. */
export const AXES = { '+x': [1, 0, 0], '-x': [-1, 0, 0], '+y': [0, 1, 0], '-y': [0, -1, 0], '+z': [0, 0, 1], '-z': [0, 0, -1] };
export const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
/** The name ('+x', '-z', …) of an axis direction; null if v is not along an axis. */
export const axisName = (v) => Object.keys(AXES).find((k) => AXES[k].every((c, i) => c === (v[i] || 0))) ?? null;
/** The opposite axis direction: '+x' ↔ '-x'. */
export const flip = (d) => (d[0] === '+' ? '-' : '+') + d[1];

/**
 * Directions in a wave drawn as arrows on labelled x, y, z axes (calc-vectors3d):
 * E violet, B teal, the direction of travel gold. Each is an axis name
 * ('+x', '-z', …) or null to leave it out.
 */
export function triad({ E = null, B = null, k = null, caption }) {
  const vectors = [];
  const add = (d, color, label, len) => { if (d) vectors.push({ to: AXES[d].map((c) => c * len), color, label, width: 3.4 }); };
  add(E, 'violet', '\\vec E', 1.2);
  add(B, 'teal', '\\vec B', 1.2);
  add(k, 'gold', '\\text{travel}', 1.6);
  return {
    type: 'calc-vectors3d',
    params: { range: 2.2, grid: false, vectors, aspect: 'wide' },
    caption: caption ?? 'The axes are right-handed; dashed lines are the negative axes. Drag to turn the picture.',
  };
}

/**
 * A snapshot of a plane wave along x at one instant: E (violet) and B (teal,
 * drawn smaller so both can be seen) in step, with one wavelength marked.
 * Axis numbers hidden.
 */
export function fieldSnapshot({ waves = 2, showB = true, mark = 'λ', caption }) {
  const curves = [{ fn: 'sin(2*pi*x)', domain: [0, waves], color: COL.E, width: 2.6, label: 'E', labelAt: 1.75, labelDy: 18 }];
  if (showB) curves.push({ fn: '0.62*sin(2*pi*x)', domain: [0, waves], color: COL.B, width: 2.4, label: 'B', labelAt: 1.75, labelDy: -14 });
  const y = 1.22;
  return {
    type: 'graph',
    params: {
      x: [0, waves], y: [-1.45, 1.55], aspect: 'wide', axesAt: 'edge', xlabel: 'x', ylabel: '', xticks: 0.001, yticks: 0.001, curves,
      arrows: mark ? [{ from: [0.75, y], to: [0.25, y], color: 'ink2' }, { from: [0.75, y], to: [1.25, y], color: 'ink2' }] : [],
      points: mark ? [lab(0.75, y, mark, 'ink2', 0, -11)] : [],
      vlines: mark ? [{ x: 0.25, color: 'ink4' }, { x: 1.25, color: 'ink4' }] : [],
    },
    caption: caption ?? 'The fields along the line of travel at one instant: electric field violet, magnetic field teal (drawn to a smaller scale so the two can be told apart).',
  };
}
