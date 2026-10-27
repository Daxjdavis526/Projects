// Shared pieces for the PHYS 2215 lab strand (module L): every lab is a
// virtual experiment run on the lab-bench simulation, whose model
// (src/viz/model/lab-bench.js) also generates the data in the problems — so
// a number in a prompt, the picture above it and the answer key all come from
// the same seeded readings.

import * as B from '../../src/viz/model/lab-bench.js';

export { B };
const t = String.raw;

/** A number with exactly n significant figures, trailing zeros kept (9.80). */
export const sf = (x, n = 3) => {
  if (!Number.isFinite(x)) return '—';
  if (x === 0) return '0';
  const p = Math.floor(Math.log10(Math.abs(x)));
  return x.toFixed(Math.max(0, n - 1 - p));
};
/** A value with d decimal places. */
export const dp = (x, d) => x.toFixed(d);
/** “value ± σ” with σ to two figures (one if it starts with 3–9 and `one`), value to match, as plain text. */
export function pmTxt(v, s, unit = '') {
  const r = B.pm(v, s);
  return `${r.v} ± ${r.s}${unit ? ` ${unit}` : ''}`;
}
/** The same as TeX (unit as TeX, e.g. \text{m/s}^2). */
export function pmTeX(v, s, unitTeX = '') {
  const r = B.pm(v, s);
  return t`${r.v} \pm ${r.s}${unitTeX ? t`\ ${unitTeX}` : ''}`;
}
/** A reading as its instrument prints it. */
export const rd = (x, res) => x.toFixed(Math.max(0, Math.ceil(-Math.log10(res) - 1e-9)));

/** Seeded rows and their analysis. */
export function run(exp, opts = {}) {
  const d = B.makeData(exp, opts);
  const an = B.experiment(exp).E.axes ? B.analyse(exp, d.rows, opts) : null;
  return { rows: d.rows, P: d.P, an, E: B.EXPERIMENTS[exp] };
}

/** Rows as a static plot’s `data` ([setting, readings…], or [readings…] for repeats). */
export const dataOf = (rows, repeat = false) => rows.map((r) => (repeat ? r.R.slice() : [r.s, ...r.R]));

/**
 * A static picture from the bench: the data plotted (with or without the fit)
 * and, optionally, the table. Readouts are off unless asked for: a problem’s
 * picture must not give away its answer.
 */
export function plot(exp, rows, { repeat = false, caption, ...params } = {}) {
  return { type: 'lab-bench', params: { exp, view: 'plot', data: dataOf(rows, repeat), ...(repeat ? { repeat: !!B.EXPERIMENTS[exp].setting, at: rows[0]?.s } : {}), ...params }, ...(caption ? { caption } : {}) };
}
export const apparatus = (exp, params = {}, caption) => ({ type: 'lab-bench', params: { exp, view: 'apparatus', ...params }, ...(caption ? { caption } : {}) });

/** A list of readings for a prompt: “1.98, 2.03 and 1.95 s”. */
export function list(xs, res, unit) {
  const s = xs.map((x) => rd(x, res));
  return `${s.slice(0, -1).join(', ')} and ${s[s.length - 1]}${unit ? ` ${unit}` : ''}`;
}

/**
 * Results with ±1σ bars stacked down the page against a true value (a
 * “forest plot”): which bars miss it. results: [{ v, s }].
 */
export function forest(results, truth, { xlabel, unit = '', caption, xr } = {}) {
  const n = results.length;
  const lo = Math.min(...results.map((q) => q.v - q.s), truth), hi = Math.max(...results.map((q) => q.v + q.s), truth);
  const pad = 0.12 * (hi - lo);
  const r5 = (x) => +x.toFixed(5);
  const curves = [], points = [];
  results.forEach((q, i) => {
    const y = n - i, miss = Math.abs(q.v - truth) > q.s;
    const col = miss ? 'warn' : 'accent';
    curves.push({ param: [`${r5(q.v - q.s)} + ${r5(2 * q.s)}*t`, String(y)], t: [0, 1], color: col, width: 2.2 });
    points.push({ x: r5(q.v), y, r: 3.6, color: col });
  });
  return {
    type: 'graph',
    params: {
      aspect: 'wide', x: xr || [r5(lo - pad), r5(hi + pad)], y: [0.2, n + 2.2], xlabel: xlabel || '', ylabel: ' ', yticks: 0.001, xticks: 6,
      alt: 'Many results, each a dot with a ±1σ bar, against the true value',
      curves, points,
      vlines: [{ x: r5(truth), label: `true ${sf(truth, 4)}${unit ? ' ' + unit : ''}`, color: 'good' }],
    },
    caption: caption ?? 'Each row is one group’s result with its ±1σ bar; amber bars miss the true value. Honest ±1σ bars miss about one time in three.',
  };
}

export const SOURCES = {
  taylor: (ch) => ({ label: `J. R. Taylor, An Introduction to Error Analysis, 2nd ed. (University Science Books, 1997)${ch ? `, ${ch}` : ''}`, url: 'https://uscibooks.aip.org/books/an-introduction-to-error-analysis-the-study-of-uncertainties-in-physical-measurements-3rd-edition/' }),
  gum: { label: 'JCGM 100:2008 — Guide to the Expression of Uncertainty in Measurement (the GUM)', url: 'https://www.bipm.org/documents/20126/2071204/JCGM_100_2008_E.pdf' },
  nist: { label: 'B. N. Taylor & C. E. Kuyatt, NIST Technical Note 1297: Guidelines for Evaluating and Expressing the Uncertainty of NIST Measurement Results (1994)', url: 'https://www.nist.gov/pml/nist-technical-note-1297' },
  aapt: { label: 'AAPT, Recommendations for the Undergraduate Physics Laboratory Curriculum (2014)', url: 'https://www.aapt.org/Resources/upload/LabGuidlinesDocument_EBendorsed_nov10.pdf' },
  polyfit: { label: 'NumPy documentation: numpy.polyfit (weights w = 1/σ; cov=True rescales by χ²/dof)', url: 'https://numpy.org/doc/stable/reference/generated/numpy.polyfit.html' },
  openstax: (sec, slug, title) => ({ label: `OpenStax University Physics Vol. 1, §${sec}${title ? ` — ${title}` : ''}`, url: `https://openstax.org/books/university-physics-volume-1/pages/${slug}` }),
};

/**
 * A few labelled results as horizontal ±1σ bars on one axis, e.g. a
 * prediction against a measurement. rows: [{ v, s, label, color }].
 */
export function compare(rows, { xlabel = '', caption, xr, truth } = {}) {
  const n = rows.length;
  const lo = Math.min(...rows.map((q) => q.v - 2.2 * q.s), truth ?? Infinity), hi = Math.max(...rows.map((q) => q.v + 2.2 * q.s), truth ?? -Infinity);
  const pad = 0.08 * (hi - lo);
  const r5 = (x) => +x.toPrecision(7);
  const curves = [], points = [];
  rows.forEach((q, i) => {
    const y = n - i, col = q.color || (i ? 'violet' : 'accent');
    curves.push({ param: [`${r5(q.v - q.s)} + ${r5(2 * q.s)}*t`, String(y)], t: [0, 1], color: col, width: 3 });
    curves.push({ param: [`${r5(q.v - 2 * q.s)} + ${r5(4 * q.s)}*t`, String(y)], t: [0, 1], color: col, width: 1, dash: true });
    points.push({ x: r5(q.v), y, r: 4.5, color: col, label: q.label, labelDx: -30, labelDy: -16 });
  });
  return {
    type: 'graph',
    params: {
      aspect: 'wide', x: xr || [r5(lo - pad), r5(hi + pad)], y: [0.3, n + 0.9], xlabel, ylabel: ' ', yticks: 0.001, xticks: 6,
      alt: 'Results drawn as bars: solid ±1σ, dashed ±2σ', curves, points,
      ...(truth !== undefined ? { vlines: [{ x: r5(truth), color: 'good' }] } : {}),
    },
    caption: caption ?? 'Each result with its ±1σ bar (solid) and ±2σ (dashed).',
  };
}
