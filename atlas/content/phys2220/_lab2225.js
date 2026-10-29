// Shared pieces for the PHYS 2225 lab strand (module L of PHYS 2220): the
// virtual experiments live in src/viz/model/lab-bench.js beside the PHYS 2215
// ones, and content/phys2210/_lab.js already has the plotting and reporting
// helpers; this adds what the E&M and optics labs need on top. Not a lesson:
// the leading underscore keeps it out of the registry.

import { B } from '../phys2210/_lab.js';

/** Seeded readings from the bench and their analysis. */
export function run(r, id, { sys = null, params = {}, axes, ok = () => true } = {}) {
  for (let k = 0; ; k++) {
    const rows = B.makeData(id, { seed: r.int(1, 999999), sys, params }).rows;
    const an = B.experiment(id).E.axes ? B.analyse(id, rows, { sys, params, axes }) : null;
    if (k > 40 || ok(an, rows)) return { rows, an, f: an?.series[0].fit, q: an?.results[0] };
  }
}

/** Keep only the known slips that land well away from the answer (some coincide for some parameters). */
export const apart = (errors, answer, rel = 0.03) => errors.filter((e) => Math.abs(e.value - answer) > rel * Math.abs(answer));

/**
 * An uncertainty budget drawn as bars, in percent: terms [{ label, pct, color }],
 * plus their quadrature sum unless `total` is false.
 */
export function budget(terms, caption, { total = true, xlabel = 'relative uncertainty (%)' } = {}) {
  const all = total ? [...terms, { label: 'combined, in quadrature', pct: Math.hypot(...terms.map((q) => q.pct)), color: 'gold' }] : terms;
  const n = all.length, r4 = (x) => +x.toFixed(4);
  const xmax = 1.15 * Math.max(...all.map((q) => q.pct));
  return {
    type: 'graph',
    params: {
      aspect: 'wide', x: [0, r4(xmax)], y: [0.4, n + 0.75], xlabel, ylabel: ' ', yticks: 0.001,
      alt: 'An uncertainty budget as bars: each source’s relative uncertainty and their combination',
      curves: all.map((q, i) => ({ param: [`${r4(q.pct)}*t`, String(n - i)], t: [0, 1], color: q.color || 'accent', width: 9 })),
      points: all.map((q, i) => ({ x: 0, y: n - i, r: 0.01, color: q.color || 'ink2', label: `${q.label}: ${q.pct.toFixed(2)}%`, labelDx: 2, labelDy: -16 })),
    },
    caption,
  };
}
