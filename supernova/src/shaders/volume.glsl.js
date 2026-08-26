/* =============================================================================
   VOLUME — raymarched stellar interior (and, later, ejecta)
   -----------------------------------------------------------------------------
   One back-face bounding sphere; the fragment shader intersects the view ray
   with the sphere analytically, optionally clamps the entry point to a
   cutaway plane, and marches front-to-back sampling the radial profile
   textures. Because the profile is a smooth 1D texture and composition
   transitions are smoothstepped in mass, shell boundaries are inherently
   soft — the exact opposite of nested translucent spheres, which sort badly
   and draw hard edges.

   Transfer functions, selected by uMode:
     0  STRUCTURE  composition-coloured, density-weighted — the classic cutaway
     1  ELEMENTS   composition only, brighter, with the legend's colours
     2  DENSITY    sequential ramp on log density
     3  TEMPERATURE blackbody ramp on log temperature — not a rainbow
     4  VELOCITY   diverging blue/red on radial velocity — real Doppler sense

   The march is jittered with an interleaved-gradient offset to convert
   banding into noise, and early-exits at alpha 0.98.
   ========================================================================== */

import { BLACKBODY } from './common.glsl.js';

export const volumeVert = /* glsl */`
varying vec3 vWorldPos;
#include <common>
#include <logdepthbuf_pars_vertex>
void main(){
  vec4 wp = modelMatrix * vec4(position, 1.0);
  vWorldPos = wp.xyz;
  gl_Position = projectionMatrix * viewMatrix * wp;
  #include <logdepthbuf_vertex>
}
`;

export const volumeFrag = /* glsl */`
${BLACKBODY}

uniform sampler2D uProfile;
uniform sampler2D uCompA;
uniform sampler2D uCompB;
uniform sampler2D uRadiusLUT;
uniform float uRmax;          // km — the LUT's radial span
uniform vec2  uRhoRange;
uniform vec2  uTRange;

uniform vec3  uCenter;        // sphere centre, world (camera-relative) km
uniform float uRadius;        // bounding-sphere radius, km
uniform int   uSteps;
uniform int   uMode;
uniform float uGain;          // overall emission gain
uniform float uCut;           // 0 = full sphere, 1 = cutaway active
uniform vec3  uCutNormal;     // cutaway plane normal (points into the KEPT half)
uniform float uTime;
uniform float uMassMap;       // 1 = display radius maps to MASS coordinate

varying vec3 vWorldPos;

#include <logdepthbuf_pars_fragment>

/* element colours, matching config.ELEMENT_COLOR */
const vec3 C_H  = vec3(1.00, 0.72, 0.74);
const vec3 C_He = vec3(1.00, 0.90, 0.62);
const vec3 C_C  = vec3(0.62, 0.66, 0.72);
const vec3 C_O  = vec3(0.30, 0.92, 0.86);
const vec3 C_Ne = vec3(0.55, 0.72, 1.00);
const vec3 C_Mg = vec3(0.78, 0.62, 1.00);
const vec3 C_Si = vec3(1.00, 0.62, 0.38);
const vec3 C_Fe = vec3(1.00, 0.84, 0.44);

/* Composition colour plus PURITY: sum X_i^2 is 1 for pure material and dips
   in the smoothstepped transition zones, which paints exactly the soft dark
   seam between shells that a textbook onion diagram draws — for free, and
   physically meaningfully (those zones really are mixtures). */
vec4 compColor(float u){
  vec4 A = texture2D(uCompA, vec2(u, 0.5));
  vec4 B = texture2D(uCompB, vec2(u, 0.5));
  vec3 col = A.r * C_H + A.g * C_He + A.b * C_C + A.a * C_O
           + B.r * C_Ne + B.g * C_Mg + B.b * C_Si + B.a * C_Fe;
  float purity = dot(A, A) + dot(B, B);
  return vec4(col, purity);
}

/* magma-like sequential ramp for density — dark violet to white-hot */
vec3 seqRamp(float x){
  x = clamp(x, 0.0, 1.0);
  return vec3(
    smoothstep(0.0, 0.7, x) + 0.3 * smoothstep(0.7, 1.0, x),
    0.9 * smoothstep(0.25, 0.95, x),
    0.55 * smoothstep(0.0, 0.25, x) * (1.0 - smoothstep(0.3, 0.8, x)) + smoothstep(0.8, 1.0, x));
}

/* diverging blue-white-red for velocity, blue = approaching = negative v */
vec3 divRamp(float x){
  x = clamp(x, 0.0, 1.0);
  vec3 blue = vec3(0.25, 0.55, 1.0), white = vec3(0.98), red = vec3(1.0, 0.30, 0.18);
  return x < 0.5 ? mix(blue, white, x * 2.0) : mix(white, red, x * 2.0 - 1.0);
}

void main(){
  #include <logdepthbuf_fragment>

  /* ray from the camera (origin, floating-origin convention) through this
     back-face fragment */
  vec3 rd = normalize(vWorldPos);
  vec3 oc = -uCenter;
  float b = dot(oc, rd);
  float c = dot(oc, oc) - uRadius * uRadius;
  float disc = b * b - c;
  if (disc < 0.0) discard;
  float sq = sqrt(disc);
  float t0 = max(-b - sq, 0.0);
  float t1 = -b + sq;
  if (t1 <= t0) discard;

  /* Cutaway geometry. The volume occupies the half-space the photosphere was
     clipped OUT of (uCutNormal points into it; the plane passes through the
     star's centre). A view ray traverses that half and, if it would cross the
     plane into the intact half, it hits the CUT WALL — sliced stellar
     material, to be shaded as a nearly opaque surface whose colour is the
     local shell. That wall is where the onion lives. */
  float tWall = -1.0;
  if (uCut > 0.5) {
    float dn = dot(rd, uCutNormal);
    float tp = abs(dn) > 1e-9 ? dot(uCenter, uCutNormal) / dn : -1.0;
    bool startInside = dot(t0 * rd - uCenter, uCutNormal) > 0.0;
    if (startInside) {
      if (dn < 0.0 && tp > t0 && tp < t1) { t1 = tp; tWall = tp; }
    } else {
      if (dn > 0.0 && tp > t0) t0 = max(t0, tp);   // enters the open half late
      else discard;                                 // never reaches the open half
      if (t0 >= t1) discard;
    }
  }

  /* interleaved-gradient jitter — banding becomes noise the eye forgives */
  float jit = fract(52.9829189 * fract(dot(gl_FragCoord.xy, vec2(0.06711056, 0.00583715))));

  float stepLen = (t1 - t0) / float(uSteps);
  vec3 acc = vec3(0.0);
  float alpha = 0.0;

  for (int i = 0; i < 96; i++) {
    if (i >= uSteps || alpha > 0.98) break;
    float t = t0 + (float(i) + jit) * stepLen;
    vec3 p = t * rd - uCenter;                  // position relative to centre
    float r = length(p);
    if (r > uRadius) continue;

    /* Display radius -> mass coordinate.

       An evolved star is preposterously centrally concentrated: the iron core
       is ~1e-6 of the stellar radius and the hydrogen envelope is essentially
       all of the volume. Any to-scale cutaway is a featureless envelope with
       an invisible dot at the centre — true, but useless. So the cutaway is
       drawn the way stellar-structure diagrams have always been drawn: in
       MASS coordinate. The shell grid concentrates half its resolution inside
       the inner two solar masses, so the burning shells get the visual space
       their physics deserves. The UI discloses this whenever the mode is on. */
    float dNorm = r / uRadius;
    float u;
    if (uMassMap > 0.5) {
      u = dNorm;
    } else {
      float lutX = 1.0 + log(max(dNorm, 1e-9)) / 16.118;   // log-radius LUT
      u = texture2D(uRadiusLUT, vec2(clamp(lutX, 0.0, 1.0), 0.5)).r;
    }
    vec4 prof = texture2D(uProfile, vec2(u, 0.5));
    float lrho = mix(uRhoRange.x, uRhoRange.y, prof.r);   // log10 rho
    float lT   = mix(uTRange.x, uTRange.y, prof.g);       // log10 T

    /* extinction rises with density; emission with temperature */
    float dens = clamp((lrho + 8.0) / 18.0, 0.0, 1.0);
    float sigma = max(pow(dens, 1.4) * 9.0, 0.55);

    vec3 col;
    if (uMode == 2) {
      col = seqRamp(dens);
      sigma = max(sigma, 0.25);
    } else if (uMode == 3) {
      col = blackbody(pow(10.0, lT) * 0.35 + 900.0);
      sigma = max(sigma, 0.25);
    } else if (uMode == 4) {
      col = divRamp(prof.b);
      sigma = max(sigma, 0.25);
    } else {
      /* STRUCTURE / ELEMENTS: composition colour banded by purity, with a
         restrained thermal glow that only the silicon/iron region earns. */
      vec4 cc = compColor(u);
      float heat = smoothstep(0.62, 0.95, prof.g);
      float band = 0.18 + 0.85 * cc.a * cc.a;
      col = cc.rgb * band * (1.0 + 1.6 * heat * heat);
      if (uMode == 1) col = cc.rgb * (0.30 + 0.75 * cc.a);
    }

    /* In cutaway mode the march is a whisper of depth haze — the cut wall is
       the diagram, and fogging it with envelope glow would defeat the point. */
    float tauScale = uCut > 0.5 ? 0.006 : 0.045;
    float aStep = 1.0 - exp(-sigma * stepLen / uRadius * float(uSteps) * tauScale);
    acc += (1.0 - alpha) * aStep * col;
    alpha += (1.0 - alpha) * aStep;
  }

  /* Composite the cut wall behind whatever glow the march accumulated. */
  if (tWall > 0.0) {
    vec3 pW = tWall * rd - uCenter;
    float rW = length(pW) / uRadius;
    float uW;
    if (uMassMap > 0.5) {
      uW = rW;
    } else {
      float lutW = 1.0 + log(max(rW, 1e-9)) / 16.118;
      uW = texture2D(uRadiusLUT, vec2(clamp(lutW, 0.0, 1.0), 0.5)).r;
    }
    vec4 profW = texture2D(uProfile, vec2(uW, 0.5));
    vec3 wallCol;
    if (uMode == 2) {
      wallCol = seqRamp(clamp((mix(uRhoRange.x, uRhoRange.y, profW.r) + 8.0) / 18.0, 0.0, 1.0));
    } else if (uMode == 3) {
      wallCol = blackbody(pow(10.0, mix(uTRange.x, uTRange.y, profW.g)) * 0.35 + 900.0);
    } else if (uMode == 4) {
      wallCol = divRamp(profW.b);
    } else {
      vec4 ccW = compColor(uW);
      float heatW = smoothstep(0.62, 0.95, profW.g);
      wallCol = ccW.rgb * (0.17 + 0.68 * ccW.a * ccW.a) * (1.0 + 0.9 * heatW * heatW);
    }
    /* subtle inward shading gives the slice dimensionality */
    wallCol *= 0.60 + 0.13 * clamp(1.0 - rW, 0.0, 1.0);   // keep ACES saturated
    acc += (1.0 - alpha) * wallCol;
    alpha = 1.0;
  }

  gl_FragColor = vec4(acc * uGain, alpha);
}
`;
