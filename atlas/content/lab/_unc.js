// Shared pieces for the lab course's uncertainty spine (lab.A0–A4): the
// statistics model (the same one the labx-stats simulation draws with, so a
// number in a prompt, its picture and its key come from one computation),
// number formatting for results with uncertainties, and small static
// pictures — distributions, uncertainty budgets, results with error bars.

import * as M from '../../src/viz/model/labx-stats.js';
import { sf, rd, list, pmTeX, compare, forest } from '../phys2210/_lab.js';

export { M, sf, rd, list, pmTeX, compare, forest };
const t = String.raw;

/** Round to n significant figures (a number). */
export const sig = (x, n = 3) => (x === 0 ? 0 : +x.toPrecision(n));
/** Plain-text number for canvas labels (no TeX). */
export const lab = (x, n = 3) => String(+x.toPrecision(n));

/** A static labx-stats picture (no controls, no readout unless asked). */
export function stat(mode, params = {}, caption) {
  return { type: 'labx-stats', params: { mode, controls: false, readout: false, ...params }, ...(caption ? { caption } : {}) };
}

/**
 * An uncertainty budget as horizontal bars drawn to scale, the combined
 * uncertainty (in quadrature) last. rows: [{ label, u }], unit: plain text.
 */
export function budget(rows, { unit = '', caption, combined = true, xmax } = {}) {
  const all = combined ? [...rows, { label: 'combined (quadrature)', u: Math.hypot(...rows.map((r) => r.u)), color: 'gold' }] : rows;
  const n = all.length, top = Math.max(...all.map((r) => r.u));
  const X = xmax || top * 1.08;
  const r6 = (x) => +x.toPrecision(6);
  const curves = all.map((r, i) => ({ param: [`${r6(r.u)}*t`, String(n - i)], t: [0, 1], color: r.color || (i % 2 ? 'violet' : 'accent'), width: 11 }));
  const points = all.map((r, i) => ({ x: 0, y: n - i + 0.42, r: 0, label: r.label, labelDx: 2, labelDy: 0, color: 'ink2' }));
  return {
    type: 'graph',
    params: { aspect: 'wide', x: [0, r6(X)], y: [0.4, n + 0.95], xlabel: `standard uncertainty${unit ? ` (${unit})` : ''}`, ylabel: ' ', yticks: 0, xticks: 6, axesAt: 'edge', curves, points, alt: 'An uncertainty budget: each contribution as a bar' },
    caption: caption ?? 'Each standard uncertainty drawn to scale. Independent contributions add in quadrature, so the largest dominates the total.',
  };
}

/** The standard normal curve with ±k shaded (or a one-sided tail beyond z). */
export function normalPic({ k = null, tail = null, two = true, caption, labels = true } = {}) {
  const shade = [];
  if (k) shade.push({ fn: 'e^(-x^2/2)/sqrt(2pi)', from: -k, to: k, color: 'gold', alpha: 0.35 });
  if (tail !== null) {
    shade.push({ fn: 'e^(-x^2/2)/sqrt(2pi)', from: tail, to: 5, color: 'warn', alpha: 0.45 });
    if (two) shade.push({ fn: 'e^(-x^2/2)/sqrt(2pi)', from: -5, to: -tail, color: 'warn', alpha: 0.45 });
  }
  return {
    type: 'graph',
    params: {
      aspect: 'wide', x: [-4.5, 4.5], y: [0, 0.47], xlabel: 'z = (x − μ)/σ', ylabel: 'density', xticks: 9, yticks: 4, axesAt: 'edge',
      curves: [{ fn: 'e^(-x^2/2)/sqrt(2pi)', color: 'accent' }], shade,
      ...(labels && k ? { vlines: [{ x: -k, color: 'gold' }, { x: k, color: 'gold' }] } : {}),
    },
    ...(caption ? { caption } : {}),
  };
}

/** Readings against reading number (a run chart), optional second series and a reference line. */
export function runChart(ys, { y2, ylabel = '', xlabel = 'reading number', ref, caption, yr } = {}) {
  const lo = Math.min(...ys, ...(y2 || []), ref ?? Infinity), hi = Math.max(...ys, ...(y2 || []), ref ?? -Infinity);
  const pad = 0.15 * (hi - lo || 1);
  const r6 = (x) => +x.toPrecision(7);
  return {
    type: 'graph',
    params: {
      aspect: 'wide', x: [0, ys.length + 1], y: yr || [r6(lo - pad), r6(hi + pad)], xlabel, ylabel, xticks: Math.min(10, ys.length), yticks: 5, axesAt: 'edge',
      points: [...ys.map((y, i) => ({ x: i + 1, y: r6(y), r: 4, color: 'accent' })), ...(y2 || []).map((y, i) => ({ x: i + 1, y: r6(y), r: 4, color: 'warn' }))],
      ...(ref !== undefined ? { hlines: [{ y: r6(ref), color: 'good' }] } : {}),
    },
    ...(caption ? { caption } : {}),
  };
}

export const SRC = {
  gum: { label: 'JCGM 100:2008 — Evaluation of measurement data: Guide to the Expression of Uncertainty in Measurement (the GUM)', url: 'https://www.bipm.org/documents/20126/2071204/JCGM_100_2008_E.pdf' },
  gumS1: { label: 'JCGM 101:2008 — GUM Supplement 1: Propagation of distributions using a Monte Carlo method', url: 'https://www.bipm.org/documents/20126/2071204/JCGM_101_2008_E.pdf' },
  nist: { label: 'B. N. Taylor & C. E. Kuyatt, NIST Technical Note 1297 (1994)', url: 'https://www.nist.gov/pml/nist-technical-note-1297' },
  taylor: (ch) => ({ label: `J. R. Taylor, An Introduction to Error Analysis, 2nd ed. (University Science Books, 1997)${ch ? `, ${ch}` : ''}`, url: 'https://uscibooks.aip.org/books/an-introduction-to-error-analysis-the-study-of-uncertainties-in-physical-measurements-3rd-edition/' }),
  aapt: { label: 'AAPT, Recommendations for the Undergraduate Physics Laboratory Curriculum (2014)', url: 'https://www.aapt.org/Resources/upload/LabGuidlinesDocument_EBendorsed_nov10.pdf' },
  numpy: { label: 'NumPy documentation: numpy.random.Generator', url: 'https://numpy.org/doc/stable/reference/random/generator.html' },
};
