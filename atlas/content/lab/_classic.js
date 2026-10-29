// Shared pieces for the lab course's later simulated experiments (lab.E.18–
// E.26): the experiments' model (src/viz/model/labg-classics.js — the same
// code the labg-classics simulation draws with, so a number in a prompt, its
// picture and its key come from one seeded computation), pictures of the
// rig, number formatting, and the sources. Not a lesson: the leading
// underscore keeps it out of the registry.

import * as M from '../../src/viz/model/labg-classics.js';
import { sf, pmTeX } from '../phys2210/_lab.js';
import { tex } from '../../src/core/format.js';

export { M, sf, pmTeX, tex };
const t = String.raw;

/** A static picture of the rig: the data, the fit and residuals (no readout). */
export const rigPlot = (exp, params = {}, caption) => ({ type: 'labg-classics', params: { exp, view: 'plot', ...params }, ...(caption ? { caption } : {}) });
/** The raw signal behind one reading. */
export const rigRaw = (exp, params = {}, caption) => ({ type: 'labg-classics', params: { exp, view: 'raw', ...params }, ...(caption ? { caption } : {}) });

/** “v ± σ” as TeX with σ to two figures (no unit). */
export const pmT = (v, s) => { const r = M.pm(v, s); return r.s ? t`${r.v} \pm ${r.s}` : r.v; };
/** A result object from the model as “v ± σ” in its display scale. */
export const resT = (r) => pmT(r.value / r.scale, r.sigma / r.scale);
/** The z of a result against a value. */
export const zOf = (v, s, ref) => (v - ref) / s;
/** A number to n significant figures as plain text (trailing zeros kept). */
export const f = (x, n = 3) => sf(x, n);
/** A number short enough for a graph expression. */
export const r6 = (x) => +(+x).toPrecision(6);

/** The closing note every simulated experiment carries. */
export const SIMNOTE = 'Simulated data: a browser cannot replace bench work.';

/** A small TeX table: rows of cells, first row the header. */
export function table(rows) {
  const cols = rows[0].length;
  const body = rows.map((r, i) => r.join(' & ') + (i === 0 ? t` \\ \hline` : t` \\`)).join(' ');
  return t`$$\begin{array}{${'c'.repeat(cols).split('').join('|')}} ${body} \end{array}$$`;
}
/** A table laid out in columns (a header row, then one row per reading): cols = [[head, ...cells], …]. */
export const colTable = (cols) => table(cols[0].map((_, i) => cols.map((c) => c[i])));

export const SRC = {
  codata: { label: 'CODATA recommended values of the fundamental physical constants: 2022, Rev. Mod. Phys. 97, 025002 (2025)', url: 'https://doi.org/10.1103/RevModPhys.97.025002' },
  asd: { label: 'NIST Atomic Spectra Database (lines of H I and Ne I)', url: 'https://physics.nist.gov/PhysRefData/ASD/lines_form.html' },
  nudat: { label: 'NNDC NuDat 3: Ba-137m, half-life 2.552 min', url: 'https://www.nndc.bnl.gov/nudat3/' },
  taylor: (ch) => ({ label: `J. R. Taylor, An Introduction to Error Analysis, 2nd ed. (University Science Books, 1997)${ch ? `, ${ch}` : ''}`, url: 'https://uscibooks.aip.org/books/an-introduction-to-error-analysis-the-study-of-uncertainties-in-physical-measurements-3rd-edition/' }),
  usu: { label: 'USU PHYS 3870/3880 list of experiments (J. R. Dennison)', url: 'https://www.physics.usu.edu/dennison/3870-3880/Experiments/List%20of%20Experiments.pdf' },
  os3: (sec, slug) => ({ label: `OpenStax University Physics Vol. 3, §${sec}`, url: `https://openstax.org/books/university-physics-volume-3/pages/${slug}` }),
  os1: (sec, slug) => ({ label: `OpenStax University Physics Vol. 1, §${sec}`, url: `https://openstax.org/books/university-physics-volume-1/pages/${slug}` }),
};
