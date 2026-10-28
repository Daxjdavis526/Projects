// Figure builders for the last M0 lessons (M0-12 sequences and series, M0-13
// quantitative reasoning, M0-14 logic and proof) and the M0 boss: a sequence
// as dots, a Fermi estimate as a floating staircase on a log scale, Pascal's
// triangle, an Euler diagram for an implication, and a row of dominoes for
// induction. Every figure is a plain 'graph' visual; labels drawn on the
// canvas are plain text (Unicode), never TeX.
import { N, lab } from './_m0kit.js';

/** Unicode superscript for an integer: −3 → ⁻³. */
export const sup = (n) => String(n).replace(/-/g, '⁻').replace(/\d/g, (d) => '⁰¹²³⁴⁵⁶⁷⁸⁹'[d]);
/** Unicode subscript for an integer: 12 → ₁₂. */
export const sub = (n) => String(n).replace(/\d/g, (d) => '₀₁₂₃₄₅₆₇₈₉'[d]);
/** A plain-text power of ten for a canvas label: 3 → 10³. */
export const p10 = (n) => `10${sup(n)}`;

/** The binomial coefficient C(n, k), exact for the small n these lessons use. */
export function choose(n, k) {
  if (k < 0 || k > n) return 0;
  let c = 1;
  for (let j = 1; j <= k; j++) c = (c * (n - k + j)) / j;
  return Math.round(c);
}
/** Is n prime? (trial division; n is small here) */
export function isPrime(n) {
  if (n < 2 || !Number.isInteger(n)) return false;
  for (let d = 2; d * d <= n; d++) if (n % d === 0) return false;
  return true;
}

/**
 * A sequence as dots at n = n0, n0 + 1, …, with an optional dashed guide curve
 * (an expression of x), a horizontal threshold line and a '?' at one index.
 * values: numbers; colors: one colour per dot (default accent); ns: the indices of the
 * values when they are not consecutive.
 */
export function seqDots({ values, n0 = 1, ns, colors, guide, guideColor = 'ink3', hline, x, y, xlabel = 'n', ylabel = 'aₙ', caption, extra = {}, ask, labels, r = 5 }) {
  const lo = Math.min(0, ...values), hi = Math.max(0, ...values), pad = 0.14 * (hi - lo || 1);
  const at = (i) => (ns ? ns[i] : n0 + i);
  const points = values.map((v, i) => ({ x: at(i), y: N(v), color: colors ? colors[i % colors.length] : 'accent', r,
    ...(labels && labels[i] ? { label: labels[i], labelAlign: 'center', labelDx: 0, labelDy: v >= 0 ? -13 : 15 } : {}) }));
  if (ask) points.push({ x: ask.n, y: N(ask.y ?? (hi + lo) / 2), r: 0, label: '?', color: 'violet', labelAlign: 'center', labelDx: 0, labelDy: 0 });
  const last = at(values.length - 1);
  const X = x || [at(0) - 0.7, last + 0.7 + (ask ? Math.max(0, ask.n - last) : 0)];
  const curves = guide ? [{ fn: guide, color: guideColor, width: 1.6, dash: true, domain: [X[0], X[1]] }] : [];
  return {
    type: 'graph',
    params: { x: X, y: y || [+N(lo - (lo < 0 ? pad : 0.06 * (hi - lo || 1))), +N(hi + pad)], aspect: 'wide', xlabel, ylabel, xticks: Math.max(2, Math.min(12, Math.round(X[1] - X[0]))), curves, points,
      ...(hline ? { hlines: [hline] } : {}), ...extra },
    caption,
  };
}

/**
 * A Fermi estimate as a floating staircase on a log scale: each factor is a bar
 * rising (or falling) by log₁₀ of the factor from where the last one ended,
 * and the last bar (gold) is the whole product. real: the measured value, drawn
 * as a dashed line. Labels sit above each bar.
 *   steps [{ factor, label }]
 */
export function staircase({ steps, real, realLabel, y, caption, ylabel = 'running product', extra = {}, totalLabel = 'estimate' }) {
  let cum = 0;
  const shade = [], curves = [], points = [];
  steps.forEach((s, i) => {
    const k = i + 1, lo = cum, hi = cum + Math.log10(s.factor);
    shade.push({ fn: N(Math.max(lo, hi)), lower: N(Math.min(lo, hi)), from: N(k - 0.36), to: N(k + 0.36), color: 'accent', alpha: 0.4 });
    if (i) curves.push({ fn: N(lo), domain: [N(k - 0.64), N(k - 0.36)], color: 'ink3', width: 1.2, dash: true });
    points.push({ x: k, y: N(Math.max(lo, hi)), r: 0, label: s.label, labelAlign: 'center', labelDx: 0, labelDy: -11, color: 'ink2' });
    cum = hi;
  });
  const K = steps.length + 1;
  shade.push({ fn: N(cum), lower: '0', from: N(K - 0.36), to: N(K + 0.36), color: 'gold', alpha: 0.5 });
  curves.push({ fn: N(cum), domain: [N(K - 1.64), N(K - 0.36)], color: 'ink3', width: 1.2, dash: true });
  points.push({ x: K, y: N(cum), r: 0, label: totalLabel, labelAlign: 'center', labelDx: 0, labelDy: -11, color: 'gold' });
  const hl = real ? [{ y: N(Math.log10(real)), color: 'good', label: realLabel }] : [];
  const top = Math.max(cum, ...(real ? [Math.log10(real)] : []));
  return {
    type: 'graph',
    params: { x: [0.3, K + 0.7], y: y || [Math.min(0, Math.floor(cum)) - 0.5, Math.ceil(top) + 1.5], ylog: true, aspect: 'wide', xlabel: '', xticks: 0, ylabel, grid: true, shade, curves, points, hlines: hl, ...extra },
    caption,
  };
}

/**
 * Pascal's triangle, rows 0 … rows−1, as numbers on the canvas. hide: [[row, k], …]
 * entries replaced by '?'; highlight: [[row, k], …] in gold.
 */
export function pascal({ rows = 6, hide = [], highlight = [], caption, extra = {}, sums = false }) {
  const points = [];
  const is = (list, i, k) => list.some(([a, b]) => a === i && b === k);
  for (let i = 0; i < rows; i++) {
    for (let k = 0; k <= i; k++) {
      const hidden = is(hide, i, k);
      points.push({ x: N(k - i / 2), y: -i, r: 0, label: hidden ? '?' : String(choose(i, k)), labelAlign: 'center', labelDx: 0, labelDy: 0,
        color: hidden ? 'violet' : is(highlight, i, k) ? 'gold' : 'ink' });
    }
    if (sums) points.push({ x: N(rows / 2 + 0.9), y: -i, r: 0, label: `→ ${choose(i, 0) * 2 ** i}`, labelAlign: 'left', labelDx: 0, labelDy: 0, color: 'ink3' });
  }
  const half = rows / 2 + (sums ? 2.4 : 0.8);
  return {
    type: 'graph',
    params: { x: [N(-half), N(half)].map(Number), y: [-rows + 0.4, 0.7], aspect: 'wide', axes: false, grid: false, xticks: 0, yticks: 0, xlabel: '', ylabel: '', points, ...extra },
    caption,
  };
}

/** A closed circle as a parametric curve. */
const ring = (cx, cy, r, o = {}) => ({ param: [`${N(cx)} + ${N(r)}*cos(t)`, `${N(cy)} + ${N(r)}*sin(t)`], t: [0, 6.2832], color: 'accent', width: 2.2, ...o });
/** A filled disc as shade between two half-circles. */
const disc = (cx, cy, r, color, alpha) => ({ fn: `${N(cy)} + sqrt(max(0, ${N(r * r)} - (x - ${N(cx)})^2))`, lower: `${N(cy)} - sqrt(max(0, ${N(r * r)} - (x - ${N(cx)})^2))`, from: N(cx - r), to: N(cx + r), color, alpha });

/**
 * An Euler diagram of P ⇒ Q: the set where P holds (inner disc) inside the set
 * where Q holds (outer disc). Labels are plain text. points: graph points to add
 * (e.g. a test case). outsideLabel: a label for the region outside Q.
 */
export function euler({ inner = 'P', outer = 'Q', outsideLabel, points = [], caption, extra = {}, innerAt = [-0.9, 0], outerR = 2.2, innerR = 1 }) {
  const shade = [disc(0, 0, outerR, 'teal', 0.14), disc(innerAt[0], innerAt[1], innerR, 'accent', 0.3)];
  const curves = [ring(0, 0, outerR, { color: 'teal' }), ring(innerAt[0], innerAt[1], innerR, { color: 'accent' })];
  const pts = [
    { x: N(innerAt[0]), y: N(innerAt[1]), r: 0, label: inner, labelAlign: 'center', labelDx: 0, labelDy: 0, color: 'accent' },
    { x: N(outerR * 0.5), y: N(outerR * 0.55), r: 0, label: outer, labelAlign: 'center', labelDx: 0, labelDy: 0, color: 'teal' },
  ];
  if (outsideLabel) pts.push({ x: N(outerR + 1.9), y: N(outerR - 0.3), r: 0, label: outsideLabel, labelAlign: 'center', labelDx: 0, labelDy: 0, color: 'ink3' });
  return {
    type: 'graph',
    params: { x: [-5, 5], y: [-2.5, 2.5], equal: true, aspect: 'wide', axes: false, grid: false, xticks: 0, yticks: 0, xlabel: '', ylabel: '', shade, curves, points: [...pts, ...points], ...extra },
    caption,
  };
}

const H = 1.6;   // a domino's height; they stand 1 apart
const LEAN = [0.92, Math.sqrt(H * H - 0.92 * 0.92)];   // a fallen domino leans on the next one: its tip moves (Δx, Δy)
/**
 * A row of n dominoes at x = 1 … n. fallen: how many have fallen, a number or
 * an expression of a slider key (each falls onto the next; the last lies flat).
 * missing: indices with no domino (a gap breaks the chain). labels under each.
 */
export function dominoes({ n = 8, fallen = 0, missing = [], caption, extra = {}, labels = true, color = 'accent', fallenColor = 'gold', sliders }) {
  const curves = [], points = [];
  for (let k = 1; k <= n; k++) {
    if (missing.includes(k)) { points.push({ x: k, y: -0.35, r: 0, label: '×', labelAlign: 'center', labelDx: 0, labelDy: 0, color: 'bad' }); continue; }
    const down = typeof fallen === 'number' ? (k <= fallen ? '1' : '0') : `step(${fallen} - ${k} + 0.5)`;
    const up = typeof fallen === 'number' ? (k <= fallen ? '0' : '1') : `step(${k} - 0.5 - (${fallen}))`;
    const lastInRow = k === n || missing.includes(k + 1) || (typeof fallen === 'number' && k === fallen);
    const tip = lastInRow ? [H, 0.12] : LEAN;
    curves.push({ param: [`${k}`, `${N(H)}*t`], t: [0, 1], color, width: 9, when: up });
    curves.push({ param: [`${k} + ${N(tip[0])}*t`, `${N(tip[1])}*t`], t: [0, 1], color: fallenColor, width: 9, when: down });
    if (labels) points.push({ x: k, y: 0, r: 0, label: `${k}`, labelAlign: 'center', labelDx: 0, labelDy: 14, color: 'ink3' });
  }
  return {
    type: 'graph',
    params: { x: [0, n + 2], y: [-0.6, 2.4], equal: true, aspect: 'wide', axes: false, grid: false, xticks: 0, yticks: 0, xlabel: '', ylabel: '',
      curves: [{ fn: '0', domain: [0.3, n + 1.7], color: 'ink4', width: 1.5 }, ...curves], points, ...(sliders ? { sliders } : {}), ...extra },
    caption,
  };
}

/**
 * Dimensions as bars: for each quantity, three bars give the powers of M, L and
 * T in its dimensions. groups [{ label, e: [m, l, t] }]; labels sit under each group.
 */
export function dimBars({ groups, caption, extra = {}, y }) {
  const COL = ['violet', 'accent', 'gold'], shade = [], curves = [], points = [];
  let lo = -1, hi = 1;
  groups.forEach((g, i) => {
    const x0 = i * 4;
    g.e.forEach((v, j) => {
      const xc = x0 + j + 1;
      if (v) shade.push({ fn: N(v), lower: '0', from: N(xc - 0.38), to: N(xc + 0.38), color: COL[j], alpha: 0.55 });
      if (v) curves.push({ fn: N(v), domain: [N(xc - 0.38), N(xc + 0.38)], color: COL[j], width: 2.2 });
      lo = Math.min(lo, v); hi = Math.max(hi, v);
    });
    points.push({ x: x0 + 2, y: 0, r: 0, label: g.label, labelAlign: 'center', labelDx: 0, labelDy: 0, color: 'ink' });
  });
  for (const p of points) p.y = N((y ? y[0] : lo - 1.3) + 0.4);
  return {
    type: 'graph',
    params: { x: [0.2, groups.length * 4 - 0.2], y: y || [lo - 1.3, hi + 1.9], aspect: 'wide', xlabel: '', xticks: 0, ylabel: 'power', yticks: 6, grid: true,
      shade, curves: [{ fn: '0', domain: [0.2, groups.length * 4 - 0.2], color: 'ink3', width: 1.2 }, ...curves], points,
      legend: [{ label: 'M (mass)', color: 'violet' }, { label: 'L (length)', color: 'accent' }, { label: 'T (time)', color: 'gold' }], legendAt: 'tr', ...extra },
    caption,
  };
}

/** A truth table as display TeX (rows of T/F), from column headers and a row function. */
export function truthTable(headers, rowFn) {
  const rows = [[true, true], [true, false], [false, true], [false, false]].map(([p, q]) => rowFn(p, q).map((v) => (typeof v === 'boolean' ? (v ? '\\text{T}' : '\\text{F}') : v)).join(' & '));
  return `$$\\begin{array}{${headers.map(() => 'c').join('|')}} ${headers.join(' & ')} \\\\ \\hline ${rows.join(' \\\\ ')} \\end{array}$$`;
}

export { N, lab };
