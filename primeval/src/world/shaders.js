// Shader injections shared by every material in the world.
//
// Two effects live here:
//   curvature — bends distant geometry down over the horizon so THERA reads as
//               a planet rather than an infinite plane. Applied to terrain,
//               vegetation, water, props and creatures alike, or they would
//               float off the ground at range.
//   wind      — one coherent gust field so ferns, canopies and grass all lean
//               the same way at the same moment.
//   aerial    — replaces three's flat exponential fog with something closer to
//               real atmospheric scattering: haze that pools in low ground,
//               thins with altitude, and glows warm when you look toward the
//               sun. This is what stops a landscape reading as a flat green
//               poster, and it costs a dot product.

import * as THREE from 'three';

export const sharedUniforms = {
  uCurveOrigin: { value: new THREE.Vector3() },
  uCurveRadius: { value: 420000 },
  uCurveAmount: { value: 1 },
  uTime: { value: 0 },
  uWind: { value: new THREE.Vector3(1, 0, 0.3) },  // xz direction, y = strength
  uWindGust: { value: 0.35 },
  // Aerial perspective. Driven by Daylight.update.
  uSunDir: { value: new THREE.Vector3(0, 1, 0) },
  uAerialCool: { value: new THREE.Color(0.55, 0.66, 0.78) },   // looking away
  uAerialWarm: { value: new THREE.Color(1.00, 0.86, 0.66) },   // into the sun
  uAerialHeight: { value: new THREE.Vector2(0, 900) },         // floor, falloff
  uAerialMix: { value: 1 },                                    // 0 = vacuum
};

const CURVE_FN = /* glsl */`
uniform vec3 uCurveOrigin;
uniform float uCurveRadius;
uniform float uCurveAmount;
vec3 primevalCurve(vec3 wp) {
  vec2 d = wp.xz - uCurveOrigin.xz;
  float d2 = dot(d, d);
  wp.y -= (d2 / (2.0 * uCurveRadius)) * uCurveAmount;
  return wp;
}
`;

const PROJECT_CURVED = /* glsl */`
vec4 primevalWorld = vec4( transformed, 1.0 );
#ifdef USE_INSTANCING
  primevalWorld = instanceMatrix * primevalWorld;
#endif
primevalWorld = modelMatrix * primevalWorld;
primevalWorld.xyz = primevalCurve( primevalWorld.xyz );
vPvWorld = primevalWorld.xyz;
vec4 mvPosition = viewMatrix * primevalWorld;
gl_Position = projectionMatrix * mvPosition;
`;

// Fragment-side scattering. Replaces <fog_fragment>; needs vPvWorld from the
// vertex stage, which PROJECT_CURVED supplies.
const AERIAL_DECL = /* glsl */`
uniform vec3 uSunDir;
uniform vec3 uAerialCool;
uniform vec3 uAerialWarm;
uniform vec2 uAerialHeight;
uniform float uAerialMix;
`;

const AERIAL_FRAG = /* glsl */`
#ifdef USE_FOG
  vec3 pvV = normalize(vPvWorld - cameraPosition);
  float pvMu = clamp(dot(pvV, uSunDir), 0.0, 1.0);
  // A forward-scatter lobe on top of a broad one: the haze lights up around
  // the sun and stays cool blue behind you.
  float pvMie = pow(pvMu, 7.0) * 0.66 + pvMu * pvMu * 0.34;
  vec3 pvHaze = mix(uAerialCool, uAerialWarm, clamp(pvMie, 0.0, 1.0));
  // Density falls off with altitude, so ridges stand clear of the valley murk.
  float pvAlt = exp(-max(vPvWorld.y - uAerialHeight.x, 0.0) / uAerialHeight.y);
  float pvD = fogDensity * mix(1.0, 0.42 + pvAlt * 1.10, uAerialMix);
  float fogFactor = 1.0 - exp(-pvD * pvD * vFogDepth * vFogDepth);
  gl_FragColor.rgb = mix(gl_FragColor.rgb, mix(fogColor, pvHaze, uAerialMix), fogFactor);
#endif
`;

const PV_WORLD_VARYING = 'varying vec3 vPvWorld;';

/**
 * Wire the aerial-perspective uniforms and fragment into a compiling shader.
 * Exported because materials that hand-roll their own curved projection (the
 * terrain) still need the same sky.
 */
export function attachAerial(shader) {
  // Only safe on a shader that actually took the curved projection: that is
  // where vPvWorld gets written, and an unwritten varying is garbage.
  if (!shader.vertexShader.includes('vPvWorld =')) return;
  shader.uniforms.uSunDir = sharedUniforms.uSunDir;
  shader.uniforms.uAerialCool = sharedUniforms.uAerialCool;
  shader.uniforms.uAerialWarm = sharedUniforms.uAerialWarm;
  shader.uniforms.uAerialHeight = sharedUniforms.uAerialHeight;
  shader.uniforms.uAerialMix = sharedUniforms.uAerialMix;
  if (!shader.vertexShader.includes(PV_WORLD_VARYING)) {
    shader.vertexShader = PV_WORLD_VARYING + '\n' + shader.vertexShader;
  }
  shader.fragmentShader = AERIAL_DECL
    + (shader.fragmentShader.includes(PV_WORLD_VARYING) ? '' : PV_WORLD_VARYING + '\n')
    + shader.fragmentShader;
  shader.fragmentShader = shader.fragmentShader.replace(
    '#include <fog_fragment>', AERIAL_FRAG
  );
}

const WIND_FN = /* glsl */`
uniform float uTime;
uniform vec3 uWind;
uniform float uWindGust;
// Sway strength is supplied per-vertex; 0 at the root, 1 at the leaf tips.
vec3 primevalWind(vec3 local, vec3 worldAnchor, float sway) {
  if (sway <= 0.0) return local;
  float phase = worldAnchor.x * 0.13 + worldAnchor.z * 0.11;
  float gust = 0.55 + 0.45 * sin(uTime * 0.31 + worldAnchor.x * 0.004 + worldAnchor.z * 0.0031);
  float a = sin(uTime * 1.9 + phase) * 0.62 + sin(uTime * 3.7 + phase * 1.7) * 0.24;
  float amp = sway * uWindGust * (0.35 + gust) * (0.5 + uWind.y);
  local.x += uWind.x * a * amp;
  local.z += uWind.z * a * amp;
  local.y -= abs(a) * amp * 0.22;
  return local;
}
`;

/**
 * Bend a material's geometry around the planet.
 * Safe to call on any of three's built-in materials.
 */
export function injectCurve(material) {
  material.userData.primevalCurve = true;
  const prev = material.onBeforeCompile;
  material.onBeforeCompile = (shader, renderer) => {
    if (prev) prev(shader, renderer);
    shader.uniforms.uCurveOrigin = sharedUniforms.uCurveOrigin;
    shader.uniforms.uCurveRadius = sharedUniforms.uCurveRadius;
    shader.uniforms.uCurveAmount = sharedUniforms.uCurveAmount;
    shader.vertexShader = CURVE_FN + shader.vertexShader;
    shader.vertexShader = shader.vertexShader.replace(
      '#include <project_vertex>', PROJECT_CURVED
    );
    attachAerial(shader);
  };
  return material;
}

/**
 * Curvature plus wind sway. Geometry must carry an `aSway` float attribute.
 * `anchorFromInstance` uses the instance matrix translation as the gust phase
 * anchor, so every blade in a clump moves together instead of shimmering.
 */
export function injectWind(material, { anchorFromInstance = true } = {}) {
  material.userData.primevalCurve = true;
  const prev = material.onBeforeCompile;
  material.onBeforeCompile = (shader, renderer) => {
    if (prev) prev(shader, renderer);
    shader.uniforms.uCurveOrigin = sharedUniforms.uCurveOrigin;
    shader.uniforms.uCurveRadius = sharedUniforms.uCurveRadius;
    shader.uniforms.uCurveAmount = sharedUniforms.uCurveAmount;
    shader.uniforms.uTime = sharedUniforms.uTime;
    shader.uniforms.uWind = sharedUniforms.uWind;
    shader.uniforms.uWindGust = sharedUniforms.uWindGust;
    shader.vertexShader = CURVE_FN + WIND_FN +
      'attribute float aSway;\n' + shader.vertexShader;
    shader.vertexShader = shader.vertexShader.replace(
      '#include <begin_vertex>',
      /* glsl */`
      vec3 transformed = vec3( position );
      vec3 primevalAnchor = ${anchorFromInstance
        ? '(modelMatrix * vec4(0.0,0.0,0.0,1.0)).xyz'
        : '(modelMatrix * vec4(position,1.0)).xyz'};
      #ifdef USE_INSTANCING
        primevalAnchor = (modelMatrix * instanceMatrix * vec4(0.0,0.0,0.0,1.0)).xyz;
      #endif
      transformed = primevalWind( transformed, primevalAnchor, aSway );
      `);
    shader.vertexShader = shader.vertexShader.replace(
      '#include <project_vertex>', PROJECT_CURVED
    );
    attachAerial(shader);
  };
  return material;
}

/** Cheap hash noise usable inside any fragment shader we author. */
export const GLSL_NOISE = /* glsl */`
float pvHash(vec2 p){ p = fract(p * vec2(233.34, 851.73)); p += dot(p, p + 23.45); return fract(p.x * p.y); }
float pvNoise(vec2 p){
  vec2 i = floor(p), f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  float a = pvHash(i), b = pvHash(i + vec2(1.0, 0.0));
  float c = pvHash(i + vec2(0.0, 1.0)), d = pvHash(i + vec2(1.0, 1.0));
  return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
}
float pvFbm(vec2 p){
  float v = 0.0, a = 0.5;
  for (int i = 0; i < 4; i++) { v += a * pvNoise(p); p *= 2.03; a *= 0.5; }
  return v;
}
`;

/** Add an `aSway` attribute to a geometry, ramped by height above its base. */
export function addSwayAttribute(geometry, { power = 1.4, scale = 1, floor = 0 } = {}) {
  const pos = geometry.attributes.position;
  geometry.computeBoundingBox();
  const bb = geometry.boundingBox;
  const h = Math.max(0.0001, bb.max.y - bb.min.y);
  const arr = new Float32Array(pos.count);
  for (let i = 0; i < pos.count; i++) {
    const t = (pos.getY(i) - bb.min.y) / h;
    arr[i] = (floor + Math.pow(t, power) * scale) ;
  }
  geometry.setAttribute('aSway', new THREE.BufferAttribute(arr, 1));
  return geometry;
}
