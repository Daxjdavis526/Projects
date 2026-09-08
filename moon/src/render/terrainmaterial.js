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
import { OPTICS, TERRAIN } from '../config.js';
import { ALBEDO_GLSL } from './albedo.js';

const PARS = /* glsl */`
uniform vec3  uSunDir;          // unit, world space
uniform vec3  uEarthDir;
uniform vec3  uEarthshine;      // radiance, already tinted
uniform float uSunAngularRadius;
uniform vec3  uMoonCentre;      // -origin, so worldPos - uMoonCentre is radial
uniform float uDetailAmount;    // albedo variation, 0 in scientific mode
uniform float uMicroRelief;     // metres of bump on the finest grains
uniform float uDetailPeriod;    // metres; the noise repeats on this lattice
uniform float uPixelAngle;      // radians subtended by one pixel
uniform int   uOverlay;         // 0 none, 1 elevation, 2 slope, 3 geology,
                                // 4 sunlight, 5 temperature
uniform sampler2D uGeologyMap;
uniform sampler2D uTemperatureMap;
uniform vec2  uElevationRange;  // metres, for the elevation ramp
uniform float uOverlayMix;
uniform float uOppositionB0;
uniform float uOppositionH;
uniform float uHG;
uniform float uBrdfNorm;
uniform int   uPlain;           // scientific visualisation: plain Lambert
uniform vec4  uImageryRect;     // x, y, width, height in equirectangular uv
uniform float uImageryAmount;
uniform float uImageryContrast; // how much of the picture's contrast to keep
uniform float uImageryBlurLod;  // mip level standing in for the local mean
uniform sampler2D uImagery;
varying float vSunVis;
varying float vEarthVis;
varying vec2  vDetailXY;
varying vec3  vWorldPos;
varying vec3  vNormal2;         // the surface normal in world space, for overlays
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
  vNormal2 = normalize(mat3(modelMatrix) * objectNormal);
  vDetailXY = aDetail;
  vLatLonUv = uv;

  vec3 up = normalize(wp - uMoonCentre);
  vec3 east = normalize(cross(vec3(0.0, 0.0, 1.0), up));
  vec3 north = cross(up, east);

  /* The softness is the larger of the Sun's own angular radius and the angular
     resolution of the horizon map itself. Eight azimuths interpolated linearly
     know the skyline to a degree or so, and using only the quarter-degree Sun
     as the softness turns a grazing polar dawn into hard polygonal patches of
     black and white: the map is being asked for a precision it does not have.
     Ordinary terrain is unaffected, because there the skyline rises steeply
     enough that a degree of blur is a few centimetres on the ground. */
  vSunVis = horizonVisibility(uSunDir, up, east, north, aHorizon0, aHorizon1,
                              max(uSunAngularRadius, 0.020));
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

const NOISE = /* glsl */`
/* Regolith micro-texture. Value noise on a surface-aligned lattice in metres,
   octaves from eight metres down to twelve centimetres, each fading out as the
   pixel it covers grows wider than its own cell — so the surface gains detail
   as you approach and never shimmers in the distance. The lattice wraps on
   uDetailPeriod so the coordinate can be kept small enough for a float without
   a seam appearing where it wraps.

   None of this is measured. It stands in for what no orbital dataset resolves:
   grains, clods, pits and the dusting of small fragments that make regolith
   look like regolith rather than a smooth grey shell. */
const vec3 SELENE_HASH = vec3(0.1031, 0.1030, 0.0973);

float seleneHash(vec2 cell, float period) {
  vec2 c = mod(cell, period);
  vec3 q = fract(c.xyx * SELENE_HASH);
  q += dot(q, q.yzx + 33.33);
  return fract((q.x + q.y) * q.z);
}

float seleneNoise(vec2 x, float period) {
  vec2 i = floor(x), f = fract(x);
  f = f * f * (3.0 - 2.0 * f);
  float a = seleneHash(i, period);
  float b = seleneHash(i + vec2(1.0, 0.0), period);
  float c = seleneHash(i + vec2(0.0, 1.0), period);
  float d = seleneHash(i + vec2(1.0, 1.0), period);
  return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
}

/* Sum the octaves, dropping each one as it approaches the size of a pixel. */
float seleneRegolith(vec2 metres, float widthM) {
  float sum = 0.0, weight = 0.0;
  float cell = 8.0, amp = 1.0;
  for (int o = 0; o < 5; o++) {
    float fade = 1.0 - smoothstep(0.30, 1.0, widthM / cell);
    if (fade > 0.001) {
      sum += amp * fade * (seleneNoise(metres / cell, uDetailPeriod / cell) - 0.5);
      weight += amp * fade;
    }
    cell *= 0.25;
    amp *= 0.62;
  }
  return weight > 0.0 ? sum / weight : 0.0;
}
`;

const OVERLAY = /* glsl */`
/* Map overlays for the site picker. These are not how the Moon looks; they are
   how a dataset looks, which is why they replace the surface rather than tint
   it, and why the legend is always on screen next to them. */
vec3 seleneRamp(float t) {
  /* A perceptually ordered ramp that survives being printed in grey: deep blue
     through green and yellow to white. */
  t = clamp(t, 0.0, 1.0);
  vec3 c0 = vec3(0.05, 0.08, 0.30);
  vec3 c1 = vec3(0.10, 0.42, 0.55);
  vec3 c2 = vec3(0.35, 0.68, 0.38);
  vec3 c3 = vec3(0.92, 0.78, 0.30);
  vec3 c4 = vec3(1.00, 0.97, 0.92);
  return t < 0.25 ? mix(c0, c1, t * 4.0)
       : t < 0.5  ? mix(c1, c2, (t - 0.25) * 4.0)
       : t < 0.75 ? mix(c2, c3, (t - 0.5) * 4.0)
                  : mix(c3, c4, (t - 0.75) * 4.0);
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
    uDetailAmount: { value: opts.plain ? 0 : 0.22 },
    uMicroRelief: { value: opts.plain ? 0 : 0.055 },
    uDetailPeriod: { value: TERRAIN.detailPeriod },
    uPixelAngle: { value: 0.0012 },
    uOverlay: { value: 0 },
    uGeologyMap: { value: null },
    uTemperatureMap: { value: null },
    uElevationRange: { value: new THREE.Vector2(-9000, 10700) },
    uOverlayMix: { value: 0.88 },
    uAlbedoMax: { value: OPTICS.albedoMax },
    uAlbedoKnee: { value: OPTICS.albedoKnee },
    uOppositionB0: { value: OPTICS.oppositionB0 },
    uOppositionH: { value: OPTICS.oppositionH },
    uHG: { value: OPTICS.hgG },
    uBrdfNorm: { value: 1 },
    uPlain: { value: opts.plain ? 1 : 0 },
    uImagery: { value: opts.imagery || null },
    uImageryRect: { value: new THREE.Vector4(0, 0, 1, 1) },
    uImageryAmount: { value: 0 },
    uImageryContrast: { value: 0.55 },
    uImageryBlurLod: { value: 4 },
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
      .replace('#include <common>',
        `#include <common>\n${PARS}\n${ALBEDO_GLSL}\n${NOISE}\n${OVERLAY}\n${BRDF}`)
      /* Bump the shading normal with the same noise. Screen-space derivatives
         are taken in view space, where the numbers are small: a world position
         near 1.7e6 m has no precision left in a float to differentiate. */
      .replace('#include <normal_fragment_begin>', /* glsl */`
        #include <normal_fragment_begin>
        if (uMicroRelief > 0.0 && seleneWidth < 4.0) {
          vec3 pos = -vViewPosition;
          vec3 sigmaX = dFdx(pos), sigmaY = dFdy(pos);
          vec3 R1 = cross(sigmaY, normal), R2 = cross(normal, sigmaX);
          float det = dot(sigmaX, R1);
          float h = seleneMicro * uMicroRelief;
          vec3 grad = sign(det) * (dFdx(h) * R1 + dFdy(h) * R2);
          normal = normalize(abs(det) * normal - grad);
        }
      `)
      /* Albedo: the global colour map, optionally overlaid with streamed
         high-resolution imagery, times a fine procedural variation that gives
         the surface texture at arm's length. */
      .replace('#include <map_fragment>', /* glsl */`
        #include <map_fragment>
        /* The map is a picture, not a reflectance; read it as one. */
        diffuseColor.rgb = albedoFromMap(diffuseColor.rgb);
        float seleneImagery = 0.0;
        if (uImageryAmount > 0.0) {
          vec2 iuv = (vLatLonUv - uImageryRect.xy) / uImageryRect.zw;
          if (iuv.x > 0.0 && iuv.x < 1.0 && iuv.y > 0.0 && iuv.y < 1.0) {
            /* Feather the edges. A streamed tile is a rectangle on a sphere and
               a hard boundary reads as a rectangle, which is the one shape the
               Moon does not have. */
            vec2 edge = min(iuv, 1.0 - iuv);
            float feather = smoothstep(0.0, 0.06, min(edge.x, edge.y));
            /* An orbital mosaic is not an albedo map: it was photographed under
               one particular Sun, and its crater shadows are baked in. Using it
               raw would shade the ground twice, once from the picture and once
               from our own Sun, which is why a NAC mosaic dropped straight onto
               terrain looks like soot.

               So it is divided by a blurred copy of itself. What survives is the
               local ratio — genuinely brighter and darker material, fresh ejecta
               against mature regolith — while the broad illumination gradient
               that produced it cancels out. That ratio then modulates the albedo
               the colour map already established, rather than replacing it. */
            const vec3 W = vec3(0.2126, 0.7152, 0.0722);
            float hi = dot(texture2D(uImagery, iuv).rgb, W);
            float lo = dot(textureLod(uImagery, iuv, uImageryBlurLod).rgb, W);
            float ratio = clamp(hi / max(lo, 1e-3), 0.35, 2.4);
            diffuseColor.rgb *= mix(1.0, pow(ratio, uImageryContrast), uImageryAmount * feather);
            seleneImagery = uImageryAmount * feather;
          }
        }
        /* How much ground one pixel covers, which decides how much of the
           regolith texture can be drawn without it turning into noise.

           This is computed from the view distance and the pixel's angular size
           rather than from the screen derivative of the texture coordinate,
           because that coordinate runs to hundreds of metres and a float has
           about six centimetres of precision there: the derivative of it comes
           out as numerical noise at exactly the range where the detail matters,
           and the texture fades out instead of appearing. */
        float seleneDist = length(vViewPosition);
        float seleneGraze = max(0.10, abs(dot(normalize(vNormal), normalize(vViewPosition))));
        float seleneWidth = seleneDist * uPixelAngle / seleneGraze;
        /* A tile the size of a continent cannot carry metre-scale coordinates
           in a float, and the noise on one degenerates into stripes. Those
           tiles are always far away, so the texture is simply switched off
           past the point where the lattice residual says the tile is coarse. */
        float seleneScale = 1.0 - smoothstep(2500.0, 12000.0,
          max(abs(vDetailXY.x), abs(vDetailXY.y)));
        float seleneMicro = seleneScale * seleneRegolith(vDetailXY, seleneWidth);
        if (uDetailAmount > 0.0) {
          /* Where real imagery is present it already shows this variation, so
             the invented part steps back rather than doubling it. */
          diffuseColor.rgb *= 1.0 + uDetailAmount * (1.0 - 0.6 * seleneImagery) * seleneMicro * 2.0;
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
      .replace('#include <lights_fragment_end>', '#include <lights_fragment_end>')
      /* Overlays go in at the very end, over the finished shading, because the
         point of them is to show a dataset rather than a landscape. A little
         of the real shading is left underneath so the relief still reads. */
      .replace('#include <dithering_fragment>', /* glsl */`
        #include <dithering_fragment>
        if (uOverlay > 0) {
          vec3 up = normalize(vWorldPos - uMoonCentre);
          vec3 over = vec3(0.0);
          if (uOverlay == 1) {
            float h = length(vWorldPos - uMoonCentre) - 1737400.0;
            over = seleneRamp((h - uElevationRange.x) /
                              max(1.0, uElevationRange.y - uElevationRange.x));
          } else if (uOverlay == 2) {
            float slope = acos(clamp(dot(normalize(vNormal2), up), 0.0, 1.0));
            over = seleneRamp(slope / 0.61);            // 0 to 35 degrees
          } else if (uOverlay == 3) {
            over = texture2D(uGeologyMap, vLatLonUv).rgb;
          } else if (uOverlay == 4) {
            over = mix(vec3(0.03, 0.03, 0.06), vec3(1.0, 0.95, 0.85), vSunVis);
          } else if (uOverlay == 5) {
            over = texture2D(uTemperatureMap, vLatLonUv).rgb;
          }
          float shade = 0.45 + 0.55 * clamp(dot(normalize(vNormal2), uSunDir), 0.0, 1.0);
          gl_FragColor.rgb = mix(gl_FragColor.rgb, over * shade, uOverlayMix);
        }
      `);

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
