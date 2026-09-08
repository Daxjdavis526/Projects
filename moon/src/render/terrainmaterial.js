/* =============================================================================
   TERRAIN MATERIAL — how lunar regolith actually reflects light
   -----------------------------------------------------------------------------
   The Moon is not Lambertian and it is not shiny. It is a porous, backscattering
   powder: the full Moon is far brighter than a diffuse sphere would be, and it
   looks flat rather than shaded towards the limb, because every grain throws
   light straight back where it came from.

   This material starts from three.js's standard material, so shadow maps and
   cascaded shadow maps keep working, and replaces the direct lighting term with:

       Lommel-Seeliger      mu0 / (mu0 + mu)     the porous-surface base
       Henyey-Greenstein    g = -0.25            backscatter
       opposition surge     B0 = 0.9, h = 0.06   the sharp brightening at zero phase

   normalised so that at 30 degrees of phase it matches a Lambertian surface of
   the same albedo, which keeps exposure sane.

   Two more things come in here:

   The horizon map. Eight angles per vertex say how high the terrain rises in
   each compass direction. Comparing the Sun's elevation against the interpolated
   angle switches sunlight off inside a crater whose real rim blocks it, at any
   distance and with no shadow map involved. This is what makes crater floors go
   properly black.

   Earthshine. From the near side the Earth is 1e-4 of the Sun's irradiance and
   blue; it is the only reason the lunar night is not perfectly dark. It gets its
   own horizon test, so it too is blocked by terrain.

   Everything is in linear radiance; tone mapping and eye adaptation happen in
   the renderer.
   ========================================================================== */

import * as THREE from 'three';
import { OPTICS } from '../config.js';

const PARS = /* glsl */`
uniform vec3  uSunDir;          // unit, world space
uniform vec3  uEarthDir;
uniform vec3  uEarthshine;      // radiance, already tinted
uniform float uSunAngularRadius;
uniform vec3  uMoonCentre;      // -origin, so worldPos - uMoonCentre is radial
uniform float uDetailScale;
uniform float uDetailAmount;
uniform float uOppositionB0;
uniform float uOppositionH;
uniform float uHG;
uniform float uBrdfNorm;
uniform int   uPlain;           // scientific visualisation: plain Lambert
uniform vec4  uImageryRect;     // x, y, width, height in equirectangular uv
uniform float uImageryAmount;
uniform sampler2D uImagery;
varying float vSunVis;
varying float vEarthVis;
varying vec2  vDetailXY;
varying vec3  vWorldPos;
varying vec2  vLatLonUv;
`;

const VERTEX_HEAD = /* glsl */`
attribute vec4 aHorizon0;       // horizon angle, 0/45/90/135 degrees azimuth
attribute vec4 aHorizon1;       // 180/225/270/315
attribute vec2 aDetail;
`;

const VERTEX_BODY = /* glsl */`
  vec3 wp = (modelMatrix * vec4(transformed, 1.0)).xyz;
  vWorldPos = wp;
  vDetailXY = aDetail;
  vLatLonUv = uv;

  vec3 up = normalize(wp - uMoonCentre);
  vec3 east = normalize(cross(vec3(0.0, 0.0, 1.0), up));
  vec3 north = cross(up, east);

  vSunVis = horizonVisibility(uSunDir, up, east, north, aHorizon0, aHorizon1,
                              uSunAngularRadius);
  vEarthVis = horizonVisibility(uEarthDir, up, east, north, aHorizon0, aHorizon1,
                                0.017);
`;

/* Interpolate the eight stored horizon angles at the azimuth of a light, and
   compare with its elevation. The softness is the angular radius of the source,
   so the Sun's half-degree disc gives a real penumbra at the terminator. */
const HORIZON_FN = /* glsl */`
float horizonVisibility(vec3 dir, vec3 up, vec3 east, vec3 north,
                        vec4 h0, vec4 h1, float softness) {
  float el = asin(clamp(dot(dir, up), -1.0, 1.0));
  float az = atan(dot(dir, east), dot(dir, north));      // 0 = north, +east
  float t = az / 0.7853981634;                            // in units of 45 deg
  t = mod(t + 8.0, 8.0);
  int i0 = int(floor(t));
  float f = t - float(i0);
  float a[8];
  a[0] = h0.x; a[1] = h0.y; a[2] = h0.z; a[3] = h0.w;
  a[4] = h1.x; a[5] = h1.y; a[6] = h1.z; a[7] = h1.w;
  int i1 = int(mod(float(i0) + 1.0, 8.0));
  float hz = mix(a[i0], a[i1], f) * 1.5707963268;         // stored 0..1 over 90 deg
  return smoothstep(hz - softness, hz + softness, el);
}
`;

/* The regolith BRDF, replacing three.js's direct diffuse term. */
const BRDF = /* glsl */`
float lunarBrdf(float mu0, float mu, float phase) {
  float ls = mu0 / max(mu0 + mu, 1e-4);
  float g2 = uHG * uHG;
  float hg = (1.0 - g2) / pow(1.0 + g2 - 2.0 * uHG * cos(3.14159265 - phase), 1.5);
  float surge = 1.0 + uOppositionB0 / (1.0 + tan(min(phase, 3.0) * 0.5) / uOppositionH);
  return ls * hg * surge * uBrdfNorm;
}
`;

export function makeTerrainMaterial(opts = {}) {
  const uniforms = {
    uSunDir: { value: new THREE.Vector3(1, 0, 0) },
    uEarthDir: { value: new THREE.Vector3(0, 1, 0) },
    uEarthshine: { value: new THREE.Vector3(0, 0, 0) },
    uSunAngularRadius: { value: 0.00465 },
    uMoonCentre: { value: new THREE.Vector3(0, 0, 0) },
    uDetailScale: { value: 0.35 },
    uDetailAmount: { value: opts.plain ? 0 : 0.16 },
    uOppositionB0: { value: OPTICS.oppositionB0 },
    uOppositionH: { value: OPTICS.oppositionH },
    uHG: { value: OPTICS.hgG },
    uBrdfNorm: { value: 1 },
    uPlain: { value: opts.plain ? 1 : 0 },
    uImagery: { value: opts.imagery || null },
    uImageryRect: { value: new THREE.Vector4(0, 0, 1, 1) },
    uImageryAmount: { value: 0 },
  };

  /* Normalise so the BRDF equals Lambert at 30 degrees phase, viewed head on. */
  {
    const g = OPTICS.hgG, p = OPTICS.normalisePhase;
    const mu0 = Math.cos(p), mu = 1;
    const ls = mu0 / (mu0 + mu);
    const hg = (1 - g * g) / Math.pow(1 + g * g - 2 * g * Math.cos(Math.PI - p), 1.5);
    const surge = 1 + OPTICS.oppositionB0 / (1 + Math.tan(p / 2) / OPTICS.oppositionH);
    uniforms.uBrdfNorm.value = mu0 / (ls * hg * surge);
  }

  const material = new THREE.MeshStandardMaterial({
    map: opts.map || null,
    roughness: 1,
    metalness: 0,
    color: 0xffffff,
    dithering: true,
  });
  material.defines = { SELENE_TERRAIN: '' };
  material.userData.uniforms = uniforms;

  material.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, uniforms);

    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', `#include <common>\n${PARS}\n${VERTEX_HEAD}\n${HORIZON_FN}`)
      .replace('#include <fog_vertex>', `#include <fog_vertex>\n${VERTEX_BODY}`);

    shader.fragmentShader = shader.fragmentShader
      .replace('#include <common>', `#include <common>\n${PARS}\n${BRDF}`)
      /* Albedo: the global colour map, optionally overlaid with streamed
         high-resolution imagery, times a fine procedural variation that gives
         the surface texture at arm's length. */
      .replace('#include <map_fragment>', /* glsl */`
        #include <map_fragment>
        if (uImageryAmount > 0.0) {
          vec2 iuv = (vLatLonUv - uImageryRect.xy) / uImageryRect.zw;
          if (iuv.x > 0.0 && iuv.x < 1.0 && iuv.y > 0.0 && iuv.y < 1.0) {
            vec3 hi = texture2D(uImagery, iuv).rgb;
            float lum = dot(diffuseColor.rgb, vec3(0.2126, 0.7152, 0.0722));
            float hiLum = max(dot(hi, vec3(0.2126, 0.7152, 0.0722)), 1e-3);
            diffuseColor.rgb = mix(diffuseColor.rgb, hi * (lum / hiLum), uImageryAmount);
          }
        }
        if (uDetailAmount > 0.0) {
          vec2 d = vDetailXY * uDetailScale;
          float n = sin(d.x * 1.7) * sin(d.y * 2.3) + 0.6 * sin(d.x * 5.1 + 1.3) * sin(d.y * 4.7);
          diffuseColor.rgb *= 1.0 + uDetailAmount * n * 0.5;
        }
      `)
      /* Direct lighting: the regolith BRDF, plus the horizon test for the Sun.
         Anything that is not the Sun (helmet lamps, rover lights) keeps the
         standard diffuse response and is never horizon-attenuated. */
      .replace('#include <lights_fragment_begin>', /* glsl */`
        #include <lights_fragment_begin>
        #ifdef SELENE_TERRAIN
        {
          vec3 N = normalize(normal);
          vec3 V = normalize(vViewPosition);
          vec3 albedo = diffuseColor.rgb;
          reflectedLight.directDiffuse = vec3(0.0);
          reflectedLight.indirectDiffuse = vec3(0.0);
          reflectedLight.directSpecular = vec3(0.0);
          reflectedLight.indirectSpecular = vec3(0.0);
          #if ( NUM_DIR_LIGHTS > 0 )
          #pragma unroll_loop_start
          for ( int i = 0; i < NUM_DIR_LIGHTS; i ++ ) {
            DirectionalLight dl = directionalLights[ i ];
            vec3 L = dl.direction;
            float mu0 = dot(N, L);
            if (mu0 > 0.0) {
              float mu = max(dot(N, V), 1e-3);
              float phase = acos(clamp(dot(L, V), -1.0, 1.0));
              float isSun = step(0.999, dot(L, uSunDir));
              float shadow = 1.0;
              #if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_DIR_LIGHT_SHADOWS )
              DirectionalLightShadow dls = directionalLightShadows[ i ];
              shadow = getShadow( directionalShadowMap[ i ], dls.shadowMapSize,
                                  dls.shadowIntensity, dls.shadowBias,
                                  dls.shadowRadius, vDirectionalShadowCoord[ i ] );
              #endif
              float vis = mix(1.0, vSunVis, isSun);
              float brdf = uPlain == 1 ? mu0 : lunarBrdf(mu0, mu, phase);
              reflectedLight.directDiffuse += albedo * dl.color * brdf * shadow * vis;
            }
          }
          #pragma unroll_loop_end
          #endif

          /* Earthshine: not a light in the scene, because it must not go through
             the shadow map or be confused with the Sun. */
          float me = dot(N, uEarthDir);
          if (me > 0.0) {
            reflectedLight.indirectDiffuse += albedo * uEarthshine * me * vEarthVis;
          }
        }
        #endif
      `)
      /* Spot and point lights (helmet lamps) still need their contribution, and
         three.js adds it after the block above, so nothing else to do here. */
      .replace('#include <lights_fragment_end>', '#include <lights_fragment_end>');

    material.userData.shader = shader;
  };

  material.customProgramCacheKey = () => 'selene-terrain-' + (opts.plain ? 'plain' : 'brdf');
  return material;
}

/** Push the current sky state into the material's uniforms. */
export function updateTerrainUniforms(material, { sunDir, earthDir, earthshine,
                                                  sunAngularRadius, origin }) {
  const u = material.userData.uniforms;
  if (!u) return;
  u.uSunDir.value.set(sunDir.x, sunDir.y, sunDir.z);
  u.uEarthDir.value.set(earthDir.x, earthDir.y, earthDir.z);
  u.uEarthshine.value.set(earthshine.x, earthshine.y, earthshine.z);
  u.uSunAngularRadius.value = sunAngularRadius;
  u.uMoonCentre.value.set(-origin.x, -origin.y, -origin.z);
}
