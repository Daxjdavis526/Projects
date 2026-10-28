// Shared helpers for PHYS 4650 (Optics I): constants (CODATA 2022, IAU 2015
// nominal values), refractive indices from Sellmeier fits (re-exported from the
// optics-rays model: SCHOTT's N-BK7 and F2, Malitson's fused silica, and so on),
// number formatting for prose and TeX, and a few picture builders. Files whose
// names start with "_" are helpers, not lessons.

import { indexOf } from '../../src/viz/model/optics-rays.js';

export { indexOf };
export const C = 299792458;                 // m/s, exact
export const EPS0 = 8.8541878188e-12;       // F/m, CODATA 2022
export const MU0 = 1.25663706127e-6;        // N/A², CODATA 2022
export const H = 6.62607015e-34;            // J s, exact
export const QE = 1.602176634e-19;          // C, exact
export const ME = 9.1093837139e-31;         // kg, CODATA 2022
export const KB = 1.380649e-23;             // J/K, exact
export const GM_SUN = 1.3271244e20;         // m³/s², IAU 2015 nominal
export const R_SUN = 6.957e8;               // m, IAU 2015 nominal
export const L_SUN = 3.828e26;              // W, IAU 2015 nominal
export const AU = 1.495978707e11;           // m, exact (IAU 2012)
export const S_SUN = 1361;                  // W/m², total solar irradiance at 1 AU (Kopp & Lean 2011)
export const PI = Math.PI;
export const DEG = PI / 180;
export const ARCSEC = PI / (180 * 3600);

/** A number with n significant figures, as a number (prints without e-notation for ordinary sizes). */
export const sf = (x, n = 3) => +(+x).toPrecision(n);

/** Materials the lessons use, with a display name and the key of their Sellmeier fit. */
export const MATS = {
  bk7: { key: 'crown', name: 'crown glass (N-BK7)' },
  f2: { key: 'flint', name: 'flint glass (F2)' },
  sf11: { key: 'denseflint', name: 'dense flint (SF11)' },
  silica: { key: 'silica', name: 'fused silica' },
  sapphire: { key: 'sapphire', name: 'sapphire' },
  water: { key: 'water', name: 'water' },
  diamond: { key: 'diamond', name: 'diamond' },
};
/** Refractive index of a material (a MATS key) at a vacuum wavelength in nm. */
export const nOf = (mat, nm) => indexOf(MATS[mat].key, nm);

/** A static graph with no axes or grid, equal scales: a picture. */
export const bare = (x, y, extra = {}) => ({ x, y, equal: true, aspect: 'wide', axes: false, grid: false, xlabel: '', ylabel: '', ...extra });

/** A label with no dot. */
export const tag = (x, y, label, color = 'ink2', extra = {}) => ({ x: sf(x, 5), y: sf(y, 5), r: 0, label, color, ...extra });
