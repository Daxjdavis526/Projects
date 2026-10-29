// Shared pieces for the lab course's advanced simulated experiments
// (lab.E.10–E.17): the seeded model the labg-rig simulation draws with, so a
// number in a prompt, its picture and its key come from one computation;
// pictures of a run; and value ± σ in TeX. Not a lesson: the leading
// underscore keeps it out of the registry.

import * as G from '../../src/viz/model/labg-rig.js';
import { tex } from '../../src/core/format.js';

export { G, tex };
const t = String.raw;

/** A static labg-rig picture of a run (no controls, no readout). */
export const rig = (exp, params = {}, caption) => ({ type: 'labg-rig', params: { exp, controls: false, results: false, ...params }, ...(caption ? { caption } : {}) });

/** value ± σ in TeX, σ to two significant figures. */
export const pmT = (v, s) => { const r = G.pm(v, s); return r.s ? t`${r.v} \pm ${r.s}` : r.v; };
/** A result of the model (scaled) as value ± σ. */
export const resT = (r) => pmT(r.value / r.scale, r.sigma / r.scale);
/** A number to n significant figures, as text. */
export const f = (x, n = 3) => String(+(+x).toPrecision(n));
/** The closing note every simulated experiment carries. */
export const SIMNOTE = 'Simulated data: a browser cannot replace bench work.';

export const SRC = {
  codata: { label: 'E. Tiesinga et al., CODATA recommended values of the fundamental physical constants (NIST, 2022 adjustment)', url: 'https://physics.nist.gov/cuu/Constants/' },
  gum: { label: 'JCGM 100:2008 — Guide to the Expression of Uncertainty in Measurement (the GUM)', url: 'https://www.bipm.org/documents/20126/2071204/JCGM_100_2008_E.pdf' },
  melissinos: { label: 'A. C. Melissinos & J. Napolitano, Experiments in Modern Physics, 2nd ed. (Academic Press, 2003)', url: 'https://www.sciencedirect.com/book/9780124898516/experiments-in-modern-physics' },
  pdg: { label: 'Particle Data Group, Review of Particle Physics (2024): the muon', url: 'https://pdg.lbl.gov/2024/listings/rpp2024-list-muon.pdf' },
  nndc: { label: 'NNDC NuDat 3 (Brookhaven National Laboratory): decay radiation of each nuclide', url: 'https://www.nndc.bnl.gov/nudat3/' },
  knoll: { label: 'G. F. Knoll, Radiation Detection and Measurement, 4th ed. (Wiley, 2010)', url: 'https://www.wiley.com/en-us/Radiation+Detection+and+Measurement%2C+4th+Edition-p-9780470131480' },
};
/** A z-score as text, one decimal (no “−0.0”). */
export const zT = (z, d = 1) => (Math.abs(z) < 0.5 * 10 ** -d ? (0).toFixed(d) : z.toFixed(d));
