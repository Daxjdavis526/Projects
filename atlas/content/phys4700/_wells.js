// Picture builders and small numerics for the PHYS 4700 stationary-state and
// formalism lessons (M3–M4). Every picture is an ordinary sim spec, so the
// content test validates it like any other visual. Not a lesson: the leading
// underscore keeps it out of the registry.
//
// Units follow the mp-schrodinger model: nm, eV, fs, and masses in electron
// masses; T0 = ħ²/2mₑ = 0.038 099 8… eV nm² (CODATA 2022 through ħc and mₑc²).

import { T0, H_EVFS, HBAR_EVFS, boxEnergy, finiteLevels, boundCount, wellZ0 } from '../../src/viz/model/mp-schrodinger.js';
import { r6, seg, label } from './_qm.js';

export { T0, H_EVFS, HBAR_EVFS, boxEnergy, finiteLevels, boundCount, wellZ0, r6, seg, label };

/** The infinite well's ψₙ(x) on [0, L] as a graph expression of x. */
export const boxFn = (n, L, scale = 1) => `${r6(scale * Math.sqrt(2 / L))}*sin(${n}*pi*x/${r6(L)})`;

/**
 * Infinite-well wave functions on their own axes: curves [{ n, c (coefficient), color, label, dash }]
 * or raw expressions [{ fn, color, label }].
 */
export function boxPic({ L = 1, curves = [], y, ylabel = 'ψ (nm⁻½)', caption, shade = [], points = [], vlines = [], extra = {} }) {
  const ymax = y || [-1.9 / Math.sqrt(L), 1.9 / Math.sqrt(L)];
  return {
    type: 'graph',
    params: {
      x: [0, r6(L)], y: ymax.map(r6), aspect: 'wide', xlabel: 'x (nm)', ylabel, axesAt: 'edge', xticks: 5, yticks: 4,
      curves: curves.map((c) => (c.sum || c.param ? c : { fn: c.fn || boxFn(c.n, L, c.c ?? 1), color: c.color || 'accent', width: c.width || 2.2, ...(c.dash ? { dash: c.dash } : {}), ...(c.label ? { label: c.label, labelAt: c.labelAt ?? L * 0.1, labelDx: c.labelDx ?? 4, labelDy: c.labelDy ?? -12 } : {}) })),
      shade, points, vlines, ...extra,
    },
    caption,
  };
}

/**
 * Probabilities as bars standing on an energy axis: bars [{ E, p, color, label }].
 * The bar heights are the probabilities; the labels sit above them.
 */
export function energyBars(bars, { xmax, xlabel = 'energy (eV)', ylabel = 'probability', caption, ymax = 1.1, hideP = false } = {}) {
  const X = xmax || Math.max(...bars.map((b) => b.E)) * 1.15;
  return {
    type: 'graph',
    params: {
      x: [0, r6(X)], y: [0, ymax], aspect: 'wide', xlabel, ylabel, axesAt: 'edge', xticks: 5, yticks: hideP ? 0 : 4,
      curves: bars.map((b) => seg(b.E, 0, b.E, b.p, b.color || 'gold', 8)),
      points: bars.filter((b) => b.label).map((b) => label(b.E, b.p, b.label, b.color || 'gold', 0, -12, 'center')),
    },
    caption,
  };
}

/** Infinite-well energy (eV) of level n for an electron (or mass m in mₑ) in a box L nm wide. */
export const En = (n, L, m = 1) => boxEnergy(n, L, m);

/** Bisection on [a, b] for a continuous f with a sign change. */
export function bisect(f, a, b, tol = 1e-13) {
  let fa = f(a);
  for (let i = 0; i < 200 && b - a > tol; i++) {
    const c = 0.5 * (a + b), fc = f(c);
    if ((fc <= 0) === (fa <= 0)) { a = c; fa = fc; } else b = c;
  }
  return 0.5 * (a + b);
}

/**
 * The finite well's bound-state roots z = ka (a = L/2) for a given z₀, by
 * bisection on the forms with no poles: even z sin z − √(z₀² − z²) cos z = 0,
 * odd z cos z + √(z₀² − z²) sin z = 0. Returns [{ z, parity }] lowest first.
 */
export function finiteRoots(z0) {
  const out = [];
  const s = (z) => Math.sqrt(Math.max(0, z0 * z0 - z * z));
  for (let j = 0; ; j++) {
    const a = j * Math.PI / 2;
    if (a >= z0) break;
    const b = Math.min(z0, a + Math.PI / 2);
    const even = j % 2 === 0;
    const f = even ? (z) => z * Math.sin(z) - s(z) * Math.cos(z) : (z) => z * Math.cos(z) + s(z) * Math.sin(z);
    if (f(a) * f(b) > 0) continue;
    out.push({ z: bisect(f, a, b), parity: even ? 'even' : 'odd' });
  }
  return out;
}
