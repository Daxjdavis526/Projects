/* =============================================================================
   SHOCK SHELL — the stalled shock, sloshed by the SASI
   -----------------------------------------------------------------------------
   An icosphere displaced along its normals by the asymmetry field:

     R(n) = R_shock * (1 + zeta(n) + rt * fbm(warp(n)))

   zeta is the l<=4 spherical-harmonic field grown by the physics; the fbm
   term is the higher-frequency Rayleigh-Taylor structure that develops once
   the explosion is under way. Normals are recomputed from finite differences
   of the displacement — without that the lobes cannot catch light and the
   whole thing flattens into a decal.

   Shading is additive Fresnel: an optically thin shell is limb-brightened,
   which is why this never reads as a solid ball. A debug mode renders zeta
   raw on an undisplaced sphere (diverging blue/red) — the fastest way to see
   whether the physics is actually reaching the pixels.
   ========================================================================== */

import { NOISE_KIT, BLACKBODY, SPHERICAL_HARMONICS } from './common.glsl.js';

export const shockVert = /* glsl */`
${NOISE_KIT}
${SPHERICAL_HARMONICS}

uniform float uA[24];
uniform float uR;          // mean shock radius, km
uniform float uRT;         // Rayleigh-Taylor amplitude
uniform float uTime;
uniform float uDebugZeta;  // 1 = render zeta raw, no displacement

varying vec3  vN;
varying vec3  vV;
varying float vZeta;
varying float vBump;

#include <common>
#include <logdepthbuf_pars_vertex>

float radial(vec3 n){
  float z = zetaSH(n, uA);
  float b = uRT > 0.001
    ? uRT * fbm(n * 3.1 + 0.3 * vec3(fbm(n * 1.7 + uTime * 0.02, 2, 2.1, 0.5)), 3, 2.2, 0.52)
    : 0.0;
  return 1.0 + z + b;
}

void main(){
  vec3 n = normalize(position);
  float f = uDebugZeta > 0.5 ? 1.0 : radial(n);
  vec3 p = n * uR * f;
  vZeta = zetaSH(n, uA);
  vBump = f - 1.0;

  /* displaced-surface normal from finite differences in the tangent plane */
  vec3 t1 = normalize(abs(n.y) < 0.94 ? cross(n, vec3(0.0, 1.0, 0.0)) : cross(n, vec3(1.0, 0.0, 0.0)));
  vec3 t2 = cross(n, t1);
  float e = 0.02;
  float f1 = uDebugZeta > 0.5 ? 1.0 : radial(normalize(n + e * t1));
  float f2 = uDebugZeta > 0.5 ? 1.0 : radial(normalize(n + e * t2));
  vec3 dp1 = normalize(n + e * t1) * f1 - n * f;
  vec3 dp2 = normalize(n + e * t2) * f2 - n * f;
  vec3 nrm = normalize(cross(dp2, dp1));
  if (dot(nrm, n) < 0.0) nrm = -nrm;

  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  vV = -mv.xyz;
  vN = normalize(normalMatrix * nrm);
  gl_Position = projectionMatrix * mv;
  #include <logdepthbuf_vertex>
}
`;

export const shockFrag = /* glsl */`
${NOISE_KIT}
${BLACKBODY}

uniform float uTime;
uniform float uHeat;       // 0..1: how hard the gain region is being heated
uniform float uAlpha;
uniform float uDebugZeta;

varying vec3  vN;
varying vec3  vV;
varying float vZeta;
varying float vBump;

#include <logdepthbuf_pars_fragment>

vec3 divRamp(float x){
  x = clamp(x, 0.0, 1.0);
  vec3 blue = vec3(0.25, 0.55, 1.0), white = vec3(0.98), red = vec3(1.0, 0.30, 0.18);
  return x < 0.5 ? mix(blue, white, x * 2.0) : mix(white, red, x * 2.0 - 1.0);
}

void main(){
  #include <logdepthbuf_fragment>

  if (uDebugZeta > 0.5) {
    /* raw field: blue = inward, red = outward, black = zero. Dark-neutral so
       the structure is legible over black with additive blending. */
    float z = clamp(vZeta * 2.0, -1.0, 1.0);
    vec3 c = z > 0.0 ? vec3(1.0, 0.25, 0.12) * z : vec3(0.2, 0.45, 1.0) * -z;
    gl_FragColor = vec4(c, 1.0);
    return;
  }

  vec3 N = normalize(vN), V = normalize(vV);
  float rim = pow(1.0 - abs(dot(N, V)), 1.9);

  /* shock-heated matter: hot blue-white at the front, warmer where the
     surface bulges outward (the heated, rising plumes) */
  vec3 hot = blackbody(17000.0);
  vec3 warm = blackbody(6500.0);
  vec3 col = mix(warm, hot, clamp(0.5 + 1.6 * vBump, 0.0, 1.0));

  /* slow roiling brightness so the surface is alive even between sloshes */
  float roil = 0.8 + 0.4 * fbm(normalize(vN) * 2.6 + vec3(0.0, 0.0, uTime * 0.25), 2, 2.1, 0.5);

  float a = rim * roil * uAlpha * (0.55 + 0.45 * uHeat);
  gl_FragColor = vec4(col * a * (0.9 + 0.9 * uHeat), a);
}
`;
