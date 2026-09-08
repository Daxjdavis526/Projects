/* =============================================================================
   PHOTOMETRY — how bright regolith is, from any angle, under any Sun
   -----------------------------------------------------------------------------
   The Moon is a porous, backscattering powder. It does not obey Lambert's law
   and it never has: a full Moon is far brighter than a diffuse sphere would be,
   and it looks flat rather than shaded towards the limb, because every grain
   throws light back the way it came.

   Three terms, all standard:

     Lommel-Seeliger   mu0 / (mu0 + mu)     the single-scattering base for a
                                            deep, porous, dark surface
     Henyey-Greenstein g = -0.25            backscatter from the grains
     opposition surge  B0 = 0.9, h = 0.06   the sharp brightening within a few
                                            degrees of zero phase, from shadows
                                            hiding behind the grains that cast
                                            them

   Normalised so the whole thing equals a Lambertian surface of the same albedo
   at thirty degrees of phase, viewed head on, which keeps exposure sane and
   means the albedo numbers elsewhere mean what they say.

   This lives in its own file because two very different pieces of code need the
   same answer: the shader, which draws the ground, and the exposure model,
   which decides how bright to make the picture. If they disagree, the camera
   over- or under-exposes the very thing it is pointed at, and the failure looks
   like an art problem rather than an arithmetic one.
   ========================================================================== */

import { OPTICS } from '../config.js';

/**
 * @param {number} mu0   cosine of the angle between the Sun and the surface normal
 * @param {number} mu    cosine of the angle between the viewer and the normal
 * @param {number} phase angle between the Sun and the viewer, radians
 * @returns {number} radiance factor: multiply by albedo to get relative radiance
 */
export function regolithBrdf(mu0, mu, phase) {
  if (mu0 <= 0) return 0;
  const ls = mu0 / Math.max(mu0 + mu, 1e-4);
  const g = OPTICS.hgG, g2 = g * g;
  const hg = (1 - g2) / Math.pow(1 + g2 - 2 * g * Math.cos(Math.PI - phase), 1.5);
  const surge = 1 + OPTICS.oppositionB0 /
    (1 + Math.tan(Math.min(phase, 3.0) * 0.5) / OPTICS.oppositionH);
  return ls * hg * surge * NORM;
}

/* The normalisation, computed once: Lambert at thirty degrees of phase, head on. */
const NORM = (() => {
  const p = OPTICS.normalisePhase, mu0 = Math.cos(p), mu = 1;
  const g = OPTICS.hgG, g2 = g * g;
  const ls = mu0 / (mu0 + mu);
  const hg = (1 - g2) / Math.pow(1 + g2 - 2 * g * Math.cos(Math.PI - p), 1.5);
  const surge = 1 + OPTICS.oppositionB0 / (1 + Math.tan(p / 2) / OPTICS.oppositionH);
  return mu0 / (ls * hg * surge);
})();

export { NORM as BRDF_NORM };
