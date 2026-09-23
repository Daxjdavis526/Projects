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

/* Why the geologic map does not feed this.
   `src/main.js` carries a per-unit albedo from the USGS map — mare basalt at
   0.07, highland anorthosite at 0.11 — and it reaches the light meter and the
   bounce term and never the rendered ground. That looks like a gap and is a
   decision: the colour map is a per-pixel measurement at 1.3 km and the
   geologic map is a category at 1:5 million, so tinting the first with the
   second would be laying a coarse guess over a fine measurement and calling
   the result more accurate. The unit albedo is used where a single number for
   the neighbourhood is what is wanted — what the eye is adapting to, and how
   much light the surroundings bounce into a shadow — and nowhere else. */

/**
 * @param {number} L linear luminance of the colour map, 0..1
 * @returns {number} normal albedo, asymptotically bounded by OPTICS.albedoMax
 */
export function albedoFromMap(L) {
  const p = OPTICS.albedoKnee;
  return L / Math.pow(1 + Math.pow(Math.max(0, L) / OPTICS.albedoMax, p), 1 / p);
}

/** The same curve, for the shader. Uses the same constants. */
export const ALBEDO_GLSL = /* glsl */`
uniform float uAlbedoMax;
uniform float uAlbedoKnee;
uniform float uChroma;

vec3 albedoFromMap(vec3 c) {
  float L = max(dot(c, vec3(0.2126, 0.7152, 0.0722)), 1e-5);
  float a = L / pow(1.0 + pow(L / uAlbedoMax, uAlbedoKnee), 1.0 / uAlbedoKnee);
  /* The colour map is a band composite, not a colorimetric one: LROC's wide
     angle camera puts 689, 643 and 604 nanometres into red, green and blue, and
     689 is redder than the eye's red. Measured over the whole map its linear
     red to blue ratio is 1.117, against the roughly 1.05 to 1.10 the published
     visual spectra give for mature regolith. So the chroma is pulled back
     towards the luminance by a fixed factor, which lands it in the middle of
     that range and stops bright highlands reading as sand. Nothing else about
     the map is touched. */
  c = mix(vec3(L), c, uChroma);
  return c * (a / L);
}
`;
