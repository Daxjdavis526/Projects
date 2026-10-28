// Picture builders and data for the PHYS 2710 lessons on solids (module
// MP12): the Kronig–Penney band condition, E(k) band diagrams, band-filling
// pictures, the Fermi–Dirac occupation and the superconductor’s phase
// diagram and field lines. Every picture is an ordinary `graph` (or
// `mp-junction`) spec, so the content test validates it like any other
// visual. The physics lives in src/viz/model/mp-solids.js (tested in
// test/mp-solids.test.mjs). Not a lesson: the leading underscore keeps it
// out of the registry.

import * as S from '../../src/viz/model/mp-solids.js';
import { r6, seg, label } from './_diagrams.js';

export { S, r6, seg, label };

/** The right-hand side of the Kronig–Penney condition as an expression of x = E/E₁ (P a number or a slider key). */
export const kpExpr = (P) => `(cos(pi*sqrt(x)) + (${P})*sin(pi*sqrt(x))/(pi*sqrt(x)))`;

/**
 * The band condition plotted against energy: the curve, the strip |f| ≤ 1 where waves
 * exist, and (optionally) the allowed parts highlighted with the bands gathered
 * along the bottom. P is a number or the key of a slider in `extra.sliders`.
 */
export function kpPlot({ P, x = [0, 17], y = [-3, 5], highlight = true, zones = true, caption, extra = {} }) {
  const F = kpExpr(P), ok = `0*sqrt(step(1 - abs(${F})) - 0.5)`;
  const curves = [{ fn: F, domain: [0.002, x[1]], color: highlight ? 'ink3' : 'accent', width: highlight ? 1.6 : 2.4 }];
  if (highlight) {
    curves.push({ fn: `${F} + ${ok}`, domain: [0.002, x[1]], color: 'accent', width: 3 });
    curves.push({ fn: `-2.45 + ${ok}`, domain: [0.002, x[1]], color: 'accent', width: 8 });
  }
  return {
    type: 'graph',
    params: {
      x, y, aspect: 'wide', axesAt: 'edge', xlabel: 'electron energy E / E₁', ylabel: 'right-hand side',
      shade: [{ fn: '1', lower: '-1', from: x[0], to: x[1], color: 'good', alpha: 0.13 }],
      curves: [...curves, ...(extra.curves || [])],
      hlines: [{ y: 1, color: 'good' }, { y: -1, color: 'good' }],
      vlines: zones ? [1, 4, 9, 16].filter((v) => v < x[1]).map((v) => ({ x: v, color: 'ink4' })) : [],
      points: [
        ...(highlight ? [label(0.15, -2.05, 'allowed bands', 'accent', 0, 0, 'left')] : []),
        label(x[1], 1, 'cos ka = +1', 'good', -4, -10, 'right'), label(x[1], -1, 'cos ka = −1', 'good', -4, 11, 'right'),
        ...(extra.points || []),
      ],
      ...Object.fromEntries(Object.entries(extra).filter(([k]) => !['curves', 'points'].includes(k))),
    },
    caption: caption ?? 'The Kronig–Penney condition in its thin-barrier limit, a one-dimensional teaching model: waves exist only where the curve lies in the green strip. E₁ = h²/8ma² is the ground-state energy of a box one lattice spacing wide.',
  };
}

/**
 * The bands E(k) in the extended zone for barrier strength P (a number): band n spans
 * (n − 1)π/a ≤ |k| ≤ nπ/a. The free-electron parabola E = (ka/π)²E₁ is dashed.
 */
export function ekPlot({ P, n = 3, free = true, gaps = true, caption, extra = {}, y = null }) {
  const B = S.kpBands(P, n), curves = [], shade = [];
  const A = `acos(max(-1, min(1, cos(t) + ${r6(P)}*sin(t)/t)))/pi`;
  B.forEach(([lo, hi], i) => {
    const k = i + 1, xk = k % 2 ? `${k - 1} + ${A}` : `${k} - ${A}`;
    for (const s of [1, -1]) curves.push({ param: [`${s}*(${xk})`, '(t/pi)^2'], t: [r6(lo), r6(hi)], color: 'accent', width: 3 });
    if (gaps && k < n) shade.push({ fn: String(r6((B[k][0] / Math.PI) ** 2)), lower: String(k * k), from: -n, to: n, color: 'bad', alpha: 0.12 });
  });
  const top = y ?? [0, r6(n * n * 1.08)];
  return {
    type: 'graph',
    params: {
      x: [-n, n], y: top, aspect: 'wide', axesAt: 'edge', xlabel: 'crystal wave number ka/π', ylabel: 'E / E₁',
      shade: [...shade, ...(extra.shade || [])],
      curves: [...(free ? [{ fn: 'x^2', color: 'ink3', width: 1.4, dash: true }] : []), ...curves, ...(extra.curves || [])],
      vlines: Array.from({ length: 2 * n - 1 }, (_, i) => ({ x: i - n + 1, color: 'ink4' })).filter((l) => l.x !== 0),
      points: extra.points || [],
      ...(extra.arrows ? { arrows: extra.arrows } : {}),
    },
    caption: caption ?? `Kronig–Penney bands (P = ${r6(P)}) in the extended zone, solid, against the free electron’s parabola, dashed. Gaps (shaded) open at k = nπ/a, where the electron’s wave is Bragg-reflected by the lattice. A one-dimensional teaching model.`,
  };
}

/**
 * Bands as boxes, side by side: cols = [{ name, bands: [[lo, hi, filled 0–1]], EF, gapLabel, color }].
 * Energies in eV (schematic positions). Filled parts are shaded darker; E_F dashed.
 */
export function bandBoxes({ cols, y = [-1, 9], caption, extra = {} }) {
  const shade = [], curves = [], points = [];
  cols.forEach((c, i) => {
    const x0 = i * 1.5, x1 = x0 + 1;
    points.push(label(x0 + 0.5, y[1], c.name, 'ink', 0, 10, 'center'));
    for (const [lo, hi, fill = 0] of c.bands) {
      shade.push({ fn: String(r6(hi)), lower: String(r6(lo)), from: x0, to: x1, color: c.color || 'accent', alpha: 0.12 });
      curves.push(seg(x0, lo, x1, lo, c.color || 'accent', 1.4), seg(x0, hi, x1, hi, c.color || 'accent', 1.4), seg(x0, lo, x0, hi, c.color || 'accent', 1.4), seg(x1, lo, x1, hi, c.color || 'accent', 1.4));
      if (fill > 0) shade.push({ fn: String(r6(lo + fill * (hi - lo))), lower: String(r6(lo)), from: x0, to: x1, color: c.color || 'accent', alpha: 0.5 });
    }
    if (c.EF !== undefined) curves.push(seg(x0 - 0.12, c.EF, x1 + 0.12, c.EF, 'gold', 1.6, true));
    if (c.gapLabel) points.push(label(x0 + 0.5, c.gapAt, c.gapLabel, 'bad', 0, c.EF !== undefined && Math.abs(c.EF - c.gapAt) < 0.5 ? -11 : 0, 'center'));
    for (const p of c.points || []) points.push(p(x0, x1));
  });
  return {
    type: 'graph',
    params: {
      x: [-0.3, r6(cols.length * 1.5 - 0.2)], y, aspect: 'wide', axesAt: 'edge', xlabel: '', xticks: 0, ylabel: 'electron energy (eV)', grid: false,
      shade: [...shade, ...(extra.shade || [])], curves: [...curves, ...(extra.curves || [])], points: [...points, ...(extra.points || [])],
      ...(extra.arrows ? { arrows: extra.arrows } : {}),
    },
    caption: caption ?? 'Bands as boxes: dark shading is filled with electrons, light shading empty; the dashed gold line is the Fermi level. Schematic heights.',
  };
}

/**
 * The energy picture of one semiconductor: the full valence band, the gap Eg and the
 * empty conduction band, with an optional photon arrow across the gap (arrow: label text).
 */
export function gapPicture(Eg, { name = '', arrow = null, arrowColor = 'gold', gapText = null, caption, extra = {} } = {}) {
  const pts = [label(0.5, -1.1, 'valence band (full)', 'ink', 0, 0, 'center'), label(0.5, Eg + 1.1, 'conduction band (empty)', 'ink', 0, 0, 'center')];
  if (gapText) pts.push(label(1.04, Eg / 2, gapText, 'bad', 0, 0, 'left'));
  if (arrow) pts.push(label(0.56, Eg / 2, arrow, arrowColor, 0, 0, 'left'));
  return bandBoxes({
    cols: [{ name, bands: [[-2.2, 0, 1], [Eg, Eg + 2.2, 0]] }],
    y: [-2.6, Eg + 2.9], caption,
    extra: { ...extra, points: [...pts, ...(extra.points || [])], arrows: [...(arrow ? [{ from: [0.5, 0], to: [0.5, Eg], color: arrowColor, width: 2.4 }] : []), ...(extra.arrows || [])] },
  });
}
