// Shader injections shared by every material in the world.
//
// Two effects live here:
//   curvature — bends distant geometry down over the horizon so THERA reads as
//               a planet rather than an infinite plane. Applied to terrain,
//               vegetation, water, props and creatures alike, or they would
//               float off the ground at range.
//   wind      — one coherent gust field so ferns, canopies and grass all lean
//               the same way at the same moment.

import * as THREE from 'three';

export const sharedUniforms = {
  uCurveOrigin: { value: new THREE.Vector3() },
  uCurveRadius: { value: 420000 },
  uCurveAmount: { value: 1 },
  uTime: { value: 0 },
  uWind: { value: new THREE.Vector3(1, 0, 0.3) },  // xz direction, y = strength
  uWindGust: { value: 0.35 },
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
vec4 mvPosition = viewMatrix * primevalWorld;
gl_Position = projectionMatrix * mvPosition;
`;

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
