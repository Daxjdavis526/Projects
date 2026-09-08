/* =============================================================================
   ALBEDO — turning a picture of the Moon into a reflectance
   -----------------------------------------------------------------------------
   The vendored global colour map is an image, not a measurement. Over most of
   the Moon its linear luminance happens to sit very close to the real normal
   albedo — Mare Tranquillitatis reads 0.07, typical highlands 0.11, the
   Apennine front 0.17, which is what the photometry says. The bright end is
   another matter: the ray craters are stretched for display, so Tycho's ejecta
   reads 0.76, and nothing on the Moon reflects three quarters of the light that
   hits it. The brightest fresh material measured is nearer a quarter.

   Feeding 0.76 to the renderer does not merely make Tycho too bright: it pushes
   the whole frame into the top of the tone curve, where the filmic response
   turns neutral grey into warm sand. The Moon then looks like a beach.

   So the map is read through a soft knee: below the real albedo range it is
   left alone to within a percent, and above it, it rolls over asymptotically to
   a physical maximum instead of clipping.

       a = L / (1 + (L / Amax)^p)^(1/p)

   Chromaticity is preserved — the colour is scaled, not desaturated — because
   the mare/highland colour difference in the map is real, and small.
   ========================================================================== */

import { OPTICS } from '../config.js';

/**
 * @param {number} L linear luminance of the colour map, 0..1
 * @returns {number} normal albedo, asymptotically bounded by OPTICS.albedoMax
 */
export function albedoFromMap(L) {
  const p = OPTICS.albedoKnee;
  return L / Math.pow(1 + Math.pow(Math.max(0, L) / OPTICS.albedoMax, p), 1 / p);
}

/** The same curve, for the shader. Uses the same two constants. */
export const ALBEDO_GLSL = /* glsl */`
uniform float uAlbedoMax;
uniform float uAlbedoKnee;

vec3 albedoFromMap(vec3 c) {
  float L = max(dot(c, vec3(0.2126, 0.7152, 0.0722)), 1e-5);
  float a = L / pow(1.0 + pow(L / uAlbedoMax, uAlbedoKnee), 1.0 / uAlbedoKnee);
  return c * (a / L);
}
`;
