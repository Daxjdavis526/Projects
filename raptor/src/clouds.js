// Pseudo-volumetric clouds: layered fields of soft, lit billboards streamed in
// cells around the camera. Cheap enough to fly through at 900 kt, thick enough
// to lose the horizon in.

import * as THREE from 'three';
import { origin } from './world.js';
import { value2, fbm, rand2 } from './noise.js';

const CELL = 5000;             // metres
const RING = 5;                // cells either side of the camera

const VERT = /* glsl */`
attribute vec3 iPos;
attribute vec2 iParam;          // x: radius, y: seed
varying vec2 vUv;
varying float vSeed;
varying float vFade;
varying vec3 vWorld;
uniform float uFadeNear;
uniform float uFadeFar;
void main() {
  vUv = uv;
  vSeed = iParam.y;
  vec4 mv = modelViewMatrix * vec4(iPos, 1.0);
  float d = -mv.z;
  vFade = smoothstep(uFadeNear, uFadeNear * 2.2, d) * (1.0 - smoothstep(uFadeFar * 0.75, uFadeFar, d));
  mv.xy += position.xy * iParam.x;
  vWorld = iPos;
  gl_Position = projectionMatrix * mv;
}`;

const FRAG = /* glsl */`
precision highp float;
varying vec2 vUv; varying float vSeed; varying float vFade; varying vec3 vWorld;
uniform vec3 uSun;
uniform vec3 uSunColor;
uniform vec3 uSkyColor;
uniform float uOpacity;
uniform float uFlash;

float h(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float n2(vec2 p){
  vec2 i = floor(p), f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(mix(h(i), h(i + vec2(1,0)), f.x), mix(h(i + vec2(0,1)), h(i + vec2(1,1)), f.x), f.y);
}

void main() {
  vec2 p = vUv * 2.0 - 1.0;
  float r = length(p);
  if (r > 1.0) discard;
  // lumpy edge so puffs don't read as discs
  float lump = n2(p * 2.6 + vSeed * 17.0) * 0.42 + n2(p * 6.1 + vSeed * 5.0) * 0.20;
  float a = smoothstep(1.0, 0.12, r + lump * 0.55);
  a *= uOpacity * vFade;
  if (a < 0.004) discard;

  // fake self-shadowing: the sun-facing side of each puff is brighter
  vec3 nrm = normalize(vec3(p, sqrt(max(0.0, 1.0 - r * r))));
  float lambert = clamp(dot(nrm, uSun) * 0.5 + 0.62, 0.0, 1.0);
  float rim = pow(clamp(dot(nrm, uSun), 0.0, 1.0), 3.0);
  vec3 col = mix(uSkyColor * 0.72, uSunColor, lambert);
  col += uSunColor * rim * 0.45;
  col += vec3(1.0) * uFlash;
  gl_FragColor = vec4(col, a);
}`;

class Layer {
  constructor(scene, opts) {
    Object.assign(this, opts);
    const geo = new THREE.InstancedBufferGeometry();
    const q = new THREE.PlaneGeometry(2, 2);
    geo.index = q.index;
    geo.attributes.position = q.attributes.position;
    geo.attributes.uv = q.attributes.uv;
    this.max = opts.max;
    this.iPos = new Float32Array(this.max * 3);
    this.iParam = new Float32Array(this.max * 2);
    geo.setAttribute('iPos', new THREE.InstancedBufferAttribute(this.iPos, 3));
    geo.setAttribute('iParam', new THREE.InstancedBufferAttribute(this.iParam, 2));
    geo.instanceCount = 0;
    this.geo = geo;

    this.mat = new THREE.ShaderMaterial({
      uniforms: {
        uSun: { value: new THREE.Vector3(0, 1, 0) },
        uSunColor: { value: new THREE.Color(1, 0.97, 0.92) },
        uSkyColor: { value: new THREE.Color(0.55, 0.66, 0.82) },
        uOpacity: { value: opts.opacity },
        uFlash: { value: 0 },
        uFadeNear: { value: opts.puffRadius * 1.2 },
        uFadeFar: { value: opts.viewRange },
      },
      vertexShader: VERT, fragmentShader: FRAG,
      transparent: true, depthWrite: false, side: THREE.DoubleSide,
    });
    this.mesh = new THREE.Mesh(geo, this.mat);
    this.mesh.frustumCulled = false;
    this.mesh.renderOrder = opts.renderOrder || 10;
    scene.add(this.mesh);
    this.anchor = null;
  }

  rebuild(camWorld, coverage) {
    const cx = Math.round(camWorld.x / CELL), cz = Math.round(camWorld.z / CELL);
    let n = 0;
    const R = this.ring;
    for (let j = -R; j <= R; j++) {
      for (let i = -R; i <= R; i++) {
        const gx = cx + i, gz = cz + j;
        const wx = gx * CELL, wz = gz * CELL;
        // coverage field: big weather systems drifting across the map
        const cov = (fbm(wx * this.covScale, wz * this.covScale, 3) * 0.5 + 0.5);
        const local = cov * (0.45 + 0.9 * coverage) - (1 - coverage) * 0.35;
        if (local < this.threshold) continue;
        const count = Math.min(this.perCell,
          Math.floor(this.perCell * Math.min(1, (local - this.threshold) * 2.4)));
        for (let k = 0; k < count && n < this.max; k++) {
          const r1 = rand2(gx * 733 + k * 7, gz * 197 + k * 13);
          const r2 = rand2(gx * 131 + k * 3, gz * 911 + k * 5);
          const r3 = rand2(gx * 379 + k * 11, gz * 547 + k * 17);
          const px = wx + (r1 - 0.5) * CELL;
          const pz = wz + (r2 - 0.5) * CELL;
          const py = this.altitude + (r3 - 0.5) * this.thickness;
          this.iPos[n * 3] = px; this.iPos[n * 3 + 1] = py; this.iPos[n * 3 + 2] = pz;
          this.iParam[n * 2] = this.puffRadius * (0.55 + r3 * 0.95);
          this.iParam[n * 2 + 1] = r1 * 31.7;
          n++;
        }
      }
    }
    this.geo.attributes.iPos.needsUpdate = true;
    this.geo.attributes.iParam.needsUpdate = true;
    this.geo.instanceCount = n;
    this.anchor = { cx, cz };
    this.count = n;
  }

  place() { this.mesh.position.set(-origin.x, -origin.y, -origin.z); }
}

export class Clouds {
  constructor(scene) {
    this.layers = [
      new Layer(scene, {                              // fair-weather cumulus
        altitude: 1900, thickness: 700, puffRadius: 340, perCell: 26, max: 3400,
        opacity: 0.86, covScale: 3.2e-5, threshold: 0.30, ring: 4, viewRange: 42000,
        renderOrder: 12,
      }),
      new Layer(scene, {                              // altostratus deck
        altitude: 5200, thickness: 900, puffRadius: 900, perCell: 10, max: 1400,
        opacity: 0.55, covScale: 1.4e-5, threshold: 0.40, ring: 5, viewRange: 90000,
        renderOrder: 11,
      }),
      new Layer(scene, {                              // cirrus
        altitude: 9600, thickness: 1400, puffRadius: 2100, perCell: 5, max: 800,
        opacity: 0.30, covScale: 7e-6, threshold: 0.42, ring: 5, viewRange: 160000,
        renderOrder: 10,
      }),
    ];
    this.storm = new Layer(scene, {                   // towering cumulonimbus
      altitude: 4200, thickness: 6500, puffRadius: 700, perCell: 20, max: 1600,
      opacity: 0.92, covScale: 2.2e-5, threshold: 0.62, ring: 3, viewRange: 60000,
      renderOrder: 13,
    });
    this.layers.push(this.storm);
    this.inCloud = 0;
    this._rebuildTimer = 0;
  }

  update(dt, camWorld, sky, weather) {
    this._rebuildTimer -= dt;
    for (let i = 0; i < this.layers.length; i++) {
      const L = this.layers[i];
      const cx = Math.round(camWorld.x / CELL), cz = Math.round(camWorld.z / CELL);
      const moved = !L.anchor || L.anchor.cx !== cx || L.anchor.cz !== cz;
      if (moved || this._rebuildTimer <= 0) {
        const cov = L === this.storm ? weather.stormCells : weather.cloudCover;
        L.rebuild(camWorld, cov);
      }
      L.place();
      L.mat.uniforms.uSun.value.copy(sky.sunDir);
      const up = Math.max(0.02, sky.sunDir.y);
      L.mat.uniforms.uSunColor.value.setRGB(
        1.0 * Math.pow(up, 0.25), 0.96 * Math.pow(up, 0.38), 0.90 * Math.pow(up, 0.55));
      L.mat.uniforms.uSkyColor.value.setRGB(0.30 * up + 0.03, 0.42 * up + 0.04, 0.62 * up + 0.06);
      L.mat.uniforms.uFlash.value = weather.flash * (L === this.storm ? 1.0 : 0.35);
      L.mat.uniforms.uOpacity.value = L.opacity * (0.6 + 0.4 * weather.cloudCover);
    }
    if (this._rebuildTimer <= 0) this._rebuildTimer = 4.0;

    // how deep inside a cloud deck is the camera?
    let inside = 0;
    for (const L of this.layers) {
      const cov = L === this.storm ? weather.stormCells : weather.cloudCover;
      if (cov < L.threshold) continue;
      const d = Math.abs(camWorld.y - L.altitude);
      if (d < L.thickness * 0.5) {
        const local = fbm(camWorld.x * L.covScale, camWorld.z * L.covScale, 3) * 0.5 + 0.5;
        const localCov = local * (0.45 + 0.9 * cov);
        if (localCov > L.threshold) {
          inside = Math.max(inside, (1 - d / (L.thickness * 0.5)) * Math.min(1, (localCov - L.threshold) * 3));
        }
      }
    }
    this.inCloud += (inside - this.inCloud) * Math.min(1, dt * 3.5);
  }
}
