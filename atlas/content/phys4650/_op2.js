// Picture builders for PHYS 4650 O4–O6 (geometrical optics, superposition,
// polarization): the op2-bench ray tracer, the op2-jones polarization chain,
// and a few static graphs. Files whose names start with "_" are helpers, not
// lessons.

import * as B from '../../src/viz/model/op2-bench.js';
import { sf } from './_op.js';

export { B };

/** An op2-bench visual. */
export const bench = (params, caption) => ({ type: 'op2-bench', params: { labels: true, ...params }, caption });

/** A thin lens of N-BK7 (or any material) built from two surfaces, centred at z, with radii R1, R2 and centre thickness t. */
export const lensSurfs = (z, R1, R2, t, mat = 'crown', ap = 10, label) => [
  { kind: 'surf', z, R: R1, mat, ap, ...(label ? { label } : {}) },
  { kind: 'surf', z: z + t, R: R2, n: 1, ap },
];

/** The Hubble Space Telescope's two mirrors (metres): Ritchey–Chrétien prescription, primary vertex at z = 0. */
export const HUBBLE = { R1: -11.04, k1: -1.0023, R2: -1.358, k2: -1.4965, d: 4.906, D: 2.4, D2: 0.267, hole: 0.3 };
export const hubbleEls = (k1 = HUBBLE.k1, extra = {}) => [
  { kind: 'mirror', z: 0, R: HUBBLE.R1, k: k1, ap: HUBBLE.D / 2, hole: HUBBLE.hole, label: 'primary', ...extra },
  { kind: 'mirror', z: -HUBBLE.d, R: HUBBLE.R2, k: HUBBLE.k2, ap: HUBBLE.D2 / 2, label: 'secondary' },
];

/** Round to n significant figures for a canvas label. */
export const lab = (x, n = 3) => String(sf(x, n));
