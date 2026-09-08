// Cloud decks.
//
// Not a raymarcher — three stacked shader planes with a fake self-shadowing
// term, which from underneath reads as weather and from above reads as a
// floor of cloud tops. The layer you are inside fades out so you never see
// the plane itself.

import * as THREE from 'three';
import { PLANET } from '../config.js';
import { clamp, lerp, smoothstep } from '../math/noise.js';

const CLOUD_VERT = /* glsl */`
precision highp float;
varying vec3 vWorld;
varying float vDist;
void main() {
  vec4 wp = modelMatrix * vec4( position, 1.0 );
  vWorld = wp.xyz;
  vDist = length( wp.xz - cameraPosition.xz );
  gl_Position = projectionMatrix * viewMatrix * wp;
}
`;

const CLOUD_FRAG = /* glsl */`
precision highp float;
varying vec3 vWorld;
varying float vDist;

uniform float uTime;
uniform vec3 uSun;
uniform vec3 uSunColor;
uniform vec3 uSkyColor;
uniform float uCoverage;     // 0 clear .. 1 solid
uniform float uScale;
uniform float uOpacity;
uniform float uSharpness;
uniform vec3 uWind;
uniform float uFar;
uniform float uAbove;        // +1 looking down on the deck, -1 from below

float h12(vec2 p){ vec3 q = fract(vec3(p.xyx) * 0.1031); q += dot(q, q.yzx + 33.33); return fract((q.x + q.y) * q.z); }
float n2(vec2 p){
  vec2 i = floor(p), f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(mix(h12(i), h12(i + vec2(1,0)), f.x), mix(h12(i + vec2(0,1)), h12(i + vec2(1,1)), f.x), f.y);
}
float fbm(vec2 p){
  float v = 0.0, a = 0.5;
  mat2 rot = mat2(0.80, 0.60, -0.60, 0.80);
  for (int i = 0; i < 6; i++) { v += a * n2(p); p = rot * p * 2.03; a *= 0.5; }
  return v;
}

float density(vec2 p) {
  float base = fbm(p);
  float detail = fbm(p * 3.7 + 11.0);
  float d = base * 0.74 + detail * 0.26;
  // A slow second field opens holes, so the deck breaks into weather systems
  // instead of reading as one continuous sheet from above.
  float breaks = fbm(p * 0.28 - 7.0);
  d *= 0.55 + 0.75 * smoothstep(0.30, 0.72, breaks);
  // Coverage pushes the threshold down; sharpness controls how puffy vs flat.
  return smoothstep(1.0 - uCoverage, 1.0 - uCoverage + uSharpness, d);
}

void main() {
  vec2 p = vWorld.xz * uScale + uWind.xz * uTime * 0.0009;
  float d = density(p);
  if (d <= 0.002) discard;

  // Self-shadowing: sample toward the sun and darken where it is thick.
  vec2 step = normalize(uSun.xz + vec2(0.001)) * (0.9 / max(0.15, abs(uSun.y)));
  float occ = density(p + step * 0.06) * 0.5 + density(p + step * 0.14) * 0.3
            + density(p + step * 0.26) * 0.2;

  float lit = 1.0 - occ * 0.85;
  vec3 top = uSunColor * (0.62 + 0.38 * max(uSun.y, 0.0));
  vec3 under = mix(uSkyColor * 0.55, uSunColor * 0.22, 0.35);
  vec3 col = mix(under, top, uAbove > 0.0 ? lit : lit * 0.55 + 0.12);

  // Silver lining where the sun is low behind a thin edge.
  float rim = smoothstep(0.55, 0.0, d) * pow(max(dot(normalize(vWorld - cameraPosition), uSun), 0.0), 6.0);
  col += uSunColor * rim * 1.6;

  // Fade at the far edge, and near the camera, so no plane edge is ever visible.
  float far = 1.0 - smoothstep(uFar * 0.55, uFar, vDist);
  float near = smoothstep(120.0, 900.0, vDist);
  gl_FragColor = vec4(col, d * uOpacity * far * near);
}
`;

class Deck {
  constructor(scene, { altitude, scale, coverage, opacity, sharpness, radius, segs }) {
    this.altitude = altitude;
    const geo = new THREE.CircleGeometry(radius, segs);
    geo.rotateX(-Math.PI / 2);
    this.material = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uSun: { value: new THREE.Vector3(0, 1, 0) },
        uSunColor: { value: new THREE.Color(1, 0.96, 0.9) },
        uSkyColor: { value: new THREE.Color(0.5, 0.62, 0.78) },
        uCoverage: { value: coverage },
        uScale: { value: scale },
        uOpacity: { value: opacity },
        uSharpness: { value: sharpness },
        uWind: { value: new THREE.Vector3(1, 0, 0.3) },
        uFar: { value: radius },
        uAbove: { value: 1 },
      },
      vertexShader: CLOUD_VERT,
      fragmentShader: CLOUD_FRAG,
      transparent: true,
      depthWrite: false,
      side: THREE.DoubleSide,
      fog: false,
    });
    this.mesh = new THREE.Mesh(geo, this.material);
    this.mesh.frustumCulled = false;
    this.mesh.renderOrder = 12;
    scene.add(this.mesh);
    this.baseCoverage = coverage;
    this.baseOpacity = opacity;
  }
}

export class Clouds {
  constructor(scene, quality) {
    this.decks = [];
    const layers = [
      { altitude: PLANET.cloudDeck, scale: 0.00042, coverage: 0.52, opacity: 0.95, sharpness: 0.40, radius: 26000, segs: 64 },
      { altitude: PLANET.cloudDeck * 1.9, scale: 0.00021, coverage: 0.40, opacity: 0.55, sharpness: 0.44, radius: 34000, segs: 48 },
      { altitude: 7200, scale: 0.000085, coverage: 0.30, opacity: 0.32, sharpness: 0.42, radius: 52000, segs: 40 },
    ];
    const n = clamp(quality.cloudLayers, 1, 3);
    for (let i = 0; i < n; i++) this.decks.push(new Deck(scene, layers[i]));
    this.enabled = true;
  }

  setVisible(v) { for (const d of this.decks) d.mesh.visible = v; }

  update(dt, game) {
    if (!this.enabled) return;
    const cam = game.camera.position;
    const day = game.daylight;
    const storm = game.storm ?? 0;
    const wind = game.weather ? game.weather.windDir : { x: 1, y: 0.3 };
    for (const d of this.decks) {
      // The deck follows you so the disc is always centred on the camera.
      d.mesh.position.set(cam.x, d.altitude, cam.z);
      const u = d.material.uniforms;
      u.uTime.value = game.clock;
      u.uSun.value.copy(day.sunDir);
      u.uSunColor.value.copy(day.sun.color).multiplyScalar(clamp(day.sun.intensity / 2.6, 0.05, 1.4));
      u.uSkyColor.value.copy(day.horizonColor).multiplyScalar(1.4);
      u.uCoverage.value = clamp(d.baseCoverage + storm * 0.42, 0, 0.95);
      u.uWind.value.set(wind.x * 40, 0, wind.y * 40);
      u.uAbove.value = cam.y > d.altitude ? 1 : -1;
      // Fade the deck you are flying through, and everything in vacuum.
      const near = smoothstep(90, 520, Math.abs(cam.y - d.altitude));
      u.uOpacity.value = d.baseOpacity * near * (game.atmosphere ?? 1)
        * (1 + storm * 0.25);
      d.mesh.visible = u.uOpacity.value > 0.01;
    }
  }

  dispose() {
    for (const d of this.decks) { d.mesh.geometry.dispose(); d.material.dispose(); }
  }
}
