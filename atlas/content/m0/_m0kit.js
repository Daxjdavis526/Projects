// Figure builders for the M0 algebra and arithmetic lessons (M0-1 to M0-3):
// number lines, area models, bar charts of terms, log-scale ladders and the
// two sides of an equation drawn as curves. Every one returns a plain 'graph'
// visual, so a lesson can still add anything the graph accepts via `extra`.
// Labels drawn on the canvas are plain text (Unicode), never TeX.

/** A number as text an expression can hold (no -0, at most 10 significant figures). */
export const N = (v) => { const s = String(Number(Number(v).toPrecision(10))); return s === '-0' ? '0' : s; };

/** TeX for a signed term after an operator: (3, 'x') → "+ 3x", (-1, 'x') → "- x", (-4) → "- 4". */
export const sgn = (c, v = '') => `${c < 0 ? '-' : '+'} ${Math.abs(c) === 1 && v ? '' : Math.abs(c)}${v}`;

/** A number in plain text with a real minus sign (for canvas labels). */
export const lab = (v) => String(v).replace(/^-/, '−');

/** TeX for a number with thin-space thousands separators: 32500 → 32\,500. */
export const thou = (v, digits = 0) => {
  const [i, f] = Math.abs(v).toFixed(digits).split('.');
  return `${v < 0 ? '-' : ''}${i.replace(/\B(?=(\d{3})+(?!\d))/g, '\\,')}${f ? '.' + f : ''}`;
};

/**
 * A number line: the x-axis alone, with shaded segments, rays and marked points.
 *   segments [{ from, to, color }]           a thick bar on the line
 *   rays     [{ from, dir: ±1, color }]      a thick bar running off one end, with an arrowhead
 *   points   [{ x, label, hollow, color, level }]  closed (or hollow, for an excluded endpoint) dots;
 *            the label sits above the dot, one row higher per level (to stagger crowded labels)
 * The line is the bottom edge of the frame (y = 0), so arrows and notes fit above it.
 */
export function numberLine({ x, segments = [], rays = [], points = [], arrows = [], xlabel = 'x', xticks, caption, extra = {}, y = [0, 1] }) {
  const curves = [], arr = [...arrows];
  for (const s of segments) curves.push({ fn: '0', domain: [s.from, s.to], color: s.color || 'accent', width: 7 });
  for (const r of rays) {
    const end = r.dir > 0 ? x[1] - 0.02 * (x[1] - x[0]) : x[0] + 0.02 * (x[1] - x[0]);
    curves.push({ fn: '0', domain: r.dir > 0 ? [r.from, end] : [end, r.from], color: r.color || 'accent', width: 7 });
    arr.push({ from: [r.dir > 0 ? end - 0.03 * (x[1] - x[0]) : end + 0.03 * (x[1] - x[0]), 0], to: [end, 0], color: r.color || 'accent', width: 3 });
  }
  const pts = points.map((p) => ({ x: p.x, y: 0, label: p.label, hollow: p.hollow, color: p.color || 'gold', r: p.r ?? 5.5, labelDx: p.labelDx ?? 0, labelAlign: 'center', labelDy: p.labelDy ?? -17 - 17 * (p.level || 0) }));
  return {
    type: 'graph',
    params: { x, y, aspect: 'wide', axesAt: 'edge', xlabel, ylabel: '', yticks: 0, grid: false, xticks, curves, points: pts, arrows: arr, ...extra },
    caption,
  };
}

/**
 * An area model: rectangles (world units) with a label in each and optional
 * side labels. rects [{ x, y, w, h, color, alpha, label, dashed }];
 * sides [{ x, y, label }] are free labels (no dot). Axes, ticks and grid are off.
 */
export function areaModel({ rects, sides = [], x, y, caption, extra = {}, aspect = 'wide' }) {
  const shade = [], curves = [], points = [];
  for (const r of rects) {
    const top = r.y + r.h, right = r.x + r.w;
    shade.push({ fn: N(top), lower: N(r.y), from: N(r.x), to: N(right), color: r.color || 'accent', alpha: r.alpha ?? 0.3 });
    const edge = { color: r.edge || 'ink3', width: 1.4, dash: r.dashed ? true : undefined };
    curves.push({ fn: N(r.y), domain: [N(r.x), N(right)], ...edge }, { fn: N(top), domain: [N(r.x), N(right)], ...edge });
    curves.push({ param: [N(r.x), 't'], t: [N(r.y), N(top)], ...edge }, { param: [N(right), 't'], t: [N(r.y), N(top)], ...edge });
    if (r.label) points.push({ x: r.x + r.w / 2, y: r.y + r.h / 2, r: 0, label: r.label, labelAlign: 'center', labelDx: 0, labelDy: 0, color: r.labelColor || 'ink' });
  }
  for (const s of sides) points.push({ x: s.x, y: s.y, r: 0, label: s.label, labelAlign: 'center', labelDx: 0, labelDy: 0, color: s.color || 'ink2' });
  return {
    type: 'graph',
    params: { x, y, aspect, equal: true, axes: false, grid: false, xticks: 0, yticks: 0, xlabel: '', ylabel: '', shade, curves, points, ...extra },
    caption,
  };
}

/**
 * Bars standing on the integers k = k0, k0 + 1, … with heights `values`
 * (one bar per value, width 0.7). labels: text above each bar. With xlabel '' the
 * bars are categories and the k axis loses its numbers.
 */
export function bars({ values, k0 = 1, labels, colors, x, y, xlabel = 'k', ylabel = '', caption, extra = {}, yticks, alpha = 0.45 }) {
  const shade = [], curves = [], points = [];
  values.forEach((v, i) => {
    const k = k0 + i, lo = Math.min(0, v), hi = Math.max(0, v);
    const color = colors ? colors[i % colors.length] : 'accent';
    shade.push({ fn: N(hi), lower: N(lo), from: N(k - 0.35), to: N(k + 0.35), color, alpha });
    curves.push({ fn: N(v), domain: [N(k - 0.35), N(k + 0.35)], color, width: 2.4 });
    if (labels && labels[i]) points.push({ x: k, y: v, r: 0, label: labels[i], labelAlign: 'center', labelDx: 0, labelDy: v >= 0 ? -11 : 13, color: 'ink2' });
  });
  const lo = Math.min(0, ...values), hi = Math.max(0, ...values), pad = 0.18 * (hi - lo || 1);
  return {
    type: 'graph',
    params: { x: x || [k0 - 0.8, k0 + values.length - 0.2], y: y || [lo - (lo < 0 ? pad : 0.06 * (hi - lo)), hi + pad], aspect: 'wide', xlabel, ylabel, grid: false, yticks, xticks: xlabel ? Math.max(2, values.length) : 0, shade, curves, points, ...extra },
    caption,
  };
}

/**
 * A log-scale ladder: quantities placed by their power of ten along one axis.
 * items [{ v, label, color }]; labels alternate above and below the line.
 */
export function logLadder({ items, x, xlabel = 'size (m)', caption, extra = {}, alternate = true }) {
  const points = items.map((it, i) => ({
    x: Math.log10(it.v), y: 0, label: it.label, color: it.color || 'gold', r: 5,
    labelAlign: 'center', labelDx: 0, labelDy: alternate && i % 2 ? 19 : -16,
  }));
  return {
    type: 'graph',
    params: { x, y: [-1, 1], xlog: true, aspect: 'wide', xlabel, ylabel: '', yticks: 0, grid: true, points, ...extra },
    caption,
  };
}

/**
 * The two sides of an equation as curves y = lhs and y = rhs. Ticks are off on
 * x by default (xticks: 0) so the picture shows that the curves meet without
 * reading the solution off for the learner; pass xticks to show them.
 */
export function bothSides({ lhs, rhs, x, y, lhsLabel, rhsLabel, lhsAt, rhsAt, xticks = 0, yticks, xlabel = 'x', ylabel = 'y', caption, extra = {}, lhsDomain, rhsDomain, legendAt = 'tl' }) {
  const curves = [
    { fn: lhs, color: 'accent', domain: lhsDomain, label: lhsAt !== undefined ? lhsLabel : undefined, labelAt: lhsAt },
    { fn: rhs, color: 'gold', domain: rhsDomain, label: rhsAt !== undefined ? rhsLabel : undefined, labelAt: rhsAt },
  ];
  const legend = lhsAt === undefined && lhsLabel ? [{ label: lhsLabel, color: 'accent' }, { label: rhsLabel, color: 'gold' }] : undefined;
  return {
    type: 'graph',
    params: { x, y, aspect: 'wide', xlabel, ylabel, xticks, yticks, curves, legend, legendAt: legend ? legendAt : undefined, ...extra },
    caption,
  };
}
