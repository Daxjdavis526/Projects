/* =============================================================================
   PHOTOSPHERE — the surface of an evolved red supergiant
   -----------------------------------------------------------------------------
   A 600 R-sun supergiant is not a smooth ball. Its convective envelope carries
   energy in a handful of enormous cells — interferometry of Betelgeuse resolves
   only a few across the whole disc — which live for months to years and give
   the star a visibly lopsided, mottled, slowly breathing surface.

   Four things do the work here, in order of how much they matter:

     1. LOW base frequency. A handful of huge cells, not a fine granular fizz.
        High frequency is the single reason procedural stars look like orange
        noise; more octaves make it worse, not better.
     2. Strong limb darkening. A cool giant is severely limb-darkened in red
        light. This is what makes a sphere read as a star.
     3. Colour from temperature through the Planckian locus, not from a palette.
        Hot granules go visibly yellower, cool intergranular lanes redder, and
        the relationship is the real one.
     4. Slow advection. Real cells evolve over months. Anything that visibly
        boils reads as fire, not as a star.
   ========================================================================== */

import { NOISE_KIT, BLACKBODY, LIMB } from './common.glsl.js';

export const photosphereVert = /* glsl */`
${NOISE_KIT}

uniform float uTime;
uniform float uWobble;      // fractional radius perturbation of the limb

varying vec3  vNormal;
varying vec3  vView;
varying vec3  vDir;         // unit direction in star-local space

#include <common>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>

void main(){
  vDir = normalize(position);

  /* An extended, irregular atmosphere: the limb of a supergiant is not a
     clean circle. A very low frequency perturbation is enough to break it. */
  float bump = fbm(vDir * 1.7 + vec3(0.0, 0.0, uTime * 0.013), 3, 2.1, 0.55);
  vec3 p = position * (1.0 + uWobble * bump);

  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  vView   = -mv.xyz;
  vNormal = normalize(normalMatrix * normalize(p));
  gl_Position = projectionMatrix * mv;
  vec4 mvPosition = mv;                    // name the clipping chunk expects
  #include <logdepthbuf_vertex>
  #include <clipping_planes_vertex>
}
`;

export const photosphereFrag = /* glsl */`
${NOISE_KIT}
${BLACKBODY}
${LIMB}

uniform float uTime;
uniform float uTeff;        // effective temperature, K
uniform float uCellFreq;    // base spatial frequency — keep this LOW
uniform float uContrast;    // fractional temperature swing across cells
uniform float uIntensity;   // linear emissive scale at disc centre
uniform float uU1;
uniform float uU2;
uniform float uHotspot;     // large-scale brightness asymmetry
uniform float uSaturate;    // see note below

/* Convective granulation.

   The obvious tool — chained domain warping, fbm(p + k*fbm(p + k*fbm(p))) — is
   a MARBLING operator. It produces the swirled contour structure of polished
   stone, which is wrong here in a specific and visible way: convection cells
   are compact blobs separated by lanes, not folded filaments.

   A single VECTOR-valued warp gives irregular, non-repeating blobs while
   leaving the topology of the base field intact. The mild odd-power curve at
   the end widens the bright cell interiors and narrows the dark lanes, which
   is the actual asymmetry of a convecting surface: broad hot upwellings,
   narrow cool downdrafts. */
float granulation(vec3 d, float freq, float t, float lod){
  vec3 p = d * freq;
  vec3 w = vec3(
    fbm(p + vec3(11.3,  4.7, 19.1), 2, 2.0, 0.5),
    fbm(p + vec3(27.9, 33.1,  7.3), 2, 2.0, 0.5),
    fbm(p + vec3(43.7, 15.9, 51.5), 2, 2.0, 0.5));
  p += 0.38 * w + vec3(0.0, 0.0, t);

  /* Octave count drops at grazing angles, where one pixel spans a wide arc of
     the surface and the finer octaves would alias into moire hatching. */
  int oct = lod > 0.55 ? 3 : 2;
  float f = fbm(p, oct, 2.0, 0.5);
  return sign(f) * pow(abs(f), 0.78);
}

varying vec3  vNormal;
varying vec3  vView;
varying vec3  vDir;

#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>

void main(){
  #include <clipping_planes_fragment>
  #include <logdepthbuf_fragment>
  vec3 N = normalize(vNormal);
  vec3 V = normalize(vView);
  float mu = max(dot(N, V), 0.0);

  /* Convection: few, huge cells drifting very slowly. */
  float cells = granulation(vDir, uCellFreq, uTime * 0.02, mu);

  /* A second, even lower frequency term. Real supergiants are lopsided —
     one hemisphere is often measurably brighter for years at a time. */
  float lobe = fbm(vDir * 0.85 + vec3(0.0, uTime * 0.006, 0.0), 2, 2.0, 0.6);

  /* Fine structure only in the bright cell interiors, and kept deliberately
     weak. Turning this up is how a star becomes orange sandpaper: the eye
     reads the finest scale present as the object's texture, so the cells stop
     reading as cells the moment this competes with them. */
  float fine = fbm(vDir * 6.0 + vec3(uTime * 0.03), 2, 2.2, 0.5);
  float finemask = smoothstep(0.02, 0.45, cells);

  float n = cells + 0.20 * lobe + 0.030 * fine * finemask;

  /* Local effective temperature, then the real blackbody colour for it. */
  float T = uTeff * (1.0 + uContrast * n);
  vec3  col = blackbody(T);

  /* ACES filmic desaturates saturated highlights — that is what makes film
     look like film, and it is why an unmodified 3500 K blackbody tone maps to
     pale tan rather than to the orange the eye actually sees in a red
     supergiant. The chromaticity above stays physical; this is a deliberate,
     documented presentation choice to survive the tone curve, applied equally
     at every temperature so the hot-yellow / cool-red relationship is
     preserved. */
  float lum = dot(col, vec3(0.2126, 0.7152, 0.0722));
  col = max(vec3(0.0), mix(vec3(lum), col, uSaturate));

  /* Intensity: limb darkening, the large-scale asymmetry, and a mild
     brightness response to temperature. Not the full T^4 — a photosphere is
     close to isothermal in optical depth and T^4 would blow the cells out. */
  float limb = limbDarken(mu, uU1, uU2);
  float bright = pow(max(T / uTeff, 0.05), 1.0);
  float I = uIntensity * limb * bright * (1.0 + uHotspot * lobe);

  gl_FragColor = vec4(col * I, 1.0);
}
`;

/* -----------------------------------------------------------------------------
   Chromosphere / extended atmosphere. A thin additive Fresnel shell just above
   the photosphere, textured with the same low-frequency field so it reads as
   part of the same object rather than a decal ring.
-------------------------------------------------------------------------------*/
export const haloVert = /* glsl */`
varying vec3 vViewPos;
#include <common>
#include <logdepthbuf_pars_vertex>
void main(){
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  vViewPos = mv.xyz;
  gl_Position = projectionMatrix * mv;
  #include <logdepthbuf_vertex>
}
`;

export const haloFrag = /* glsl */`
${NOISE_KIT}
${BLACKBODY}

uniform float uTime;
uniform float uTeff;
uniform vec3  uCenter;      // star centre, view space
uniform float uRstar;       // photosphere radius, view units
uniform float uScaleH;      // atmospheric scale height, view units
uniform float uIntensity;

varying vec3 vViewPos;

#include <logdepthbuf_pars_fragment>

/* An extended atmosphere seen against the sky is brightest where the line of
   sight passes closest to the photosphere and falls off exponentially outward.
   Computing that from the ray's impact parameter — rather than from the
   carrier geometry's own silhouette — is what keeps the shell invisible. A
   Fresnel term on a sphere is brightest exactly AT its own edge, which is why
   it always reads as a glass ball around the star. */
void main(){
  #include <logdepthbuf_fragment>
  vec3 d = normalize(vViewPos);            // camera at origin in view space
  float tca = dot(uCenter, d);
  float b = sqrt(max(dot(uCenter, uCenter) - tca * tca, 0.0));   // impact parameter

  /* Behind the star, or occluded by it, contributes nothing. */
  if (tca < 0.0) discard;

  float h = (b - uRstar) / max(uScaleH, 1e-6);
  float glow = exp(-max(h, 0.0));

  /* Ragged, because a supergiant's atmosphere is not a smooth envelope. */
  float n = fbm(normalize(vViewPos - uCenter) * 2.4 + vec3(0.0, 0.0, uTime * 0.02), 4, 2.1, 0.55);
  glow *= 0.72 + 0.5 * n;

  vec3 col = blackbody(uTeff * 0.82);
  float lum = dot(col, vec3(0.2126, 0.7152, 0.0722));
  col = max(vec3(0.0), mix(vec3(lum), col, 1.5));

  float a = glow * uIntensity;
  gl_FragColor = vec4(col * a, a);
}
`;
