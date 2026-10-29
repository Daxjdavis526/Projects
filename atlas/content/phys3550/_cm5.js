// Picture builders and constants for the PHYS 3550 chaos, scattering and
// bridge lessons (M10–M13) and the course boss: still cm5-pendulum and
// cm5-logistic pictures (no controls, no Play, no numbers), and the numbers
// the M10 lessons quote, computed by model/cm5-chaos.js. Not a lesson: the
// leading underscore keeps it out of the registry.

import * as K from '../../src/viz/model/cm5-chaos.js';
import { sci, r6, gpic, seg, lab, distinct } from './_cm.js';

export { K, sci, r6, gpic, seg, lab, distinct };

/** A still driven-pendulum picture. */
export function pendPic(params, caption) {
  return { type: 'cm5-pendulum', params: { controls: [], play: false, readout: false, ...params }, caption };
}

/** A still logistic-map picture. */
export function logPic(params, caption) {
  return { type: 'cm5-logistic', params: { controls: [], readout: false, ...params }, caption };
}

/** Taylor's pendulum, in numbers: ω, ω₀, β and the linear response amplitude per unit γ. */
export const TAY = (() => {
  const { w, w0, beta } = K.TAYLOR;
  const gain = (w0 * w0) / Math.sqrt((w0 * w0 - w * w) ** 2 + 4 * beta * beta * w * w);   // A/γ, rad
  return { w, w0, beta, gain };
})();

/** The logistic map's period-doubling parameters r₁ … r₉ and superstable R₀ … R₁₁ (computed at import, ~30 ms). */
export const LOG = (() => {
  const r = K.doublings(9), R = K.superstable(12);
  return { r, R, dr: K.deltaEstimates(r), dR: K.deltaEstimates(R), rinf: K.accumulation(r) };
})();
