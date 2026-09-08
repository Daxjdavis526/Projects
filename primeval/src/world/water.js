// Standing water: one endless ocean plane at sea level, plus a streamed mesh
// that follows the river network wherever the player walks.
//
// Both share a shader that fakes depth, flow, fresnel and foam well enough
// that you will stop at a riverbank and look at it.

import * as THREE from 'three';
import { heightAt, riverField, riverSurface, waterAt } from './field.js';
import { clamp, lerp, smoothstep } from '../math/noise.js';
import { sharedUniforms } from './shaders.js';
import { PLANET } from '../config.js';

const WATER_VERT = /* glsl */`
uniform vec3 uCurveOrigin;
uniform float uCurveRadius;
uniform float uCurveAmount;
uniform float uTime;
attribute float aDepth;     // metres of water above the bed
attribute float aFlow;      // 0 still, 1 white water
attribute float aMask;      // 0 outside the channel, 1 inside
varying float vDepth;
varying float vFlow;
varying float vMask;
varying vec3 vWorld;
varying vec3 vToCam;

void main() {
  vec4 wp = modelMatrix * vec4( position, 1.0 );
  vDepth = aDepth; vFlow = aFlow; vMask = aMask;
  // Swell. Ocean gets long rollers, rivers get chop scaled by their flow.
  float swell = sin( wp.x * 0.055 + uTime * 0.75 ) * cos( wp.z * 0.041 - uTime * 0.62 ) * 0.34
              + sin( wp.x * 0.21 - uTime * 1.6 ) * 0.09;
  wp.y += swell * clamp( vDepth * 0.35, 0.05, 1.0 ) * ( 1.0 - vFlow * 0.6 );
  vWorld = wp.xyz;
  vec2 d = wp.xz - uCurveOrigin.xz;
  wp.y -= ( dot( d, d ) / ( 2.0 * uCurveRadius ) ) * uCurveAmount;
  vec4 mv = viewMatrix * wp;
  vToCam = cameraPosition - vWorld;
  gl_Position = projectionMatrix * mv;
}
`;

const WATER_FRAG = /* glsl */`
precision highp float;
varying float vDepth;
varying float vFlow;
varying float vMask;
varying vec3 vWorld;
varying vec3 vToCam;
uniform float uTime;
uniform vec3 uSunDir;
uniform vec3 uSunColor;
uniform vec3 uSkyColor;
uniform vec3 uShallow;
uniform vec3 uDeep;
uniform vec3 uFogColor;
uniform float uFogDensity;
uniform float uMurk;

float h12(vec2 p){ vec3 p3 = fract(vec3(p.xyx) * 0.1031); p3 += dot(p3, p3.yzx + 33.33); return fract((p3.x + p3.y) * p3.z); }
float n2(vec2 p){
  vec2 i = floor(p), f = fract(p); f = f*f*(3.0-2.0*f);
  return mix(mix(h12(i), h12(i+vec2(1,0)), f.x), mix(h12(i+vec2(0,1)), h12(i+vec2(1,1)), f.x), f.y);
}
float fbm(vec2 p){ float v=0.0,a=0.5; for(int i=0;i<4;i++){ v+=a*n2(p); p*=2.07; a*=0.5; } return v; }

// Ripple normal from two counter-scrolling noise fields.
vec3 rippleNormal(vec2 p, float t, float amp) {
  float e = 0.35;
  vec2 s1 = p * 0.55 + vec2(t * 0.28, t * 0.13);
  vec2 s2 = p * 1.35 - vec2(t * 0.19, t * 0.34);
  float h  = fbm(s1) * 0.6 + fbm(s2) * 0.4;
  float hx = fbm(s1 + vec2(e, 0.0)) * 0.6 + fbm(s2 + vec2(e, 0.0)) * 0.4;
  float hz = fbm(s1 + vec2(0.0, e)) * 0.6 + fbm(s2 + vec2(0.0, e)) * 0.4;
  return normalize(vec3((h - hx) * amp, 0.14, (h - hz) * amp));
}

void main() {
  if (vMask < 0.02) discard;
  vec3 V = normalize(vToCam);
  float dist = length(vToCam);
  // Ripples flatten with distance so the far water does not shimmer to noise.
  float detail = 1.0 - smoothstep(35.0, 260.0, dist);
  vec3 N = rippleNormal(vWorld.xz, uTime, (0.5 + vFlow * 1.6) * (0.25 + detail * 0.75));

  float fres = pow(1.0 - clamp(dot(N, V), 0.0, 1.0), 4.0);
  fres = mix(0.06, 1.0, fres);

  // Body colour by depth. Shallow water shows the bed, deep water does not.
  float dt = smoothstep(0.0, 4.5, vDepth);
  vec3 body = mix(uShallow, uDeep, dt);
  body = mix(body, uDeep * 0.7, uMurk * 0.6);

  vec3 refl = uSkyColor;
  vec3 H = normalize(uSunDir + V);
  float spec = pow(max(dot(N, H), 0.0), 190.0) * 2.4
             + pow(max(dot(N, H), 0.0), 26.0) * 0.22;

  vec3 col = mix(body, refl, fres * 0.82);
  col += uSunColor * spec * (0.5 + detail * 0.9);

  // Foam: at the shoreline, and anywhere the channel is running fast.
  float edge = 1.0 - smoothstep(0.0, 0.85, vDepth);
  float churn = fbm(vWorld.xz * 1.7 + vec2(uTime * 0.9, -uTime * 0.7));
  float foam = clamp(edge * 0.85 + vFlow * smoothstep(0.35, 0.85, churn) * 1.5, 0.0, 1.0);
  foam *= 0.35 + 0.65 * smoothstep(0.25, 0.7, churn);
  col = mix(col, vec3(0.92, 0.95, 0.97), foam * 0.85);

  // Shallow water stays see-through, so you can spot fish from the bank.
  float alpha = clamp(mix(0.44, 0.94, dt) + foam * 0.5, 0.0, 1.0) * vMask;

  // Exponential-squared fog, matched to the scene's own.
  float f = 1.0 - exp( -uFogDensity * uFogDensity * dist * dist );
  col = mix(col, uFogColor, clamp(f, 0.0, 1.0));

  gl_FragColor = vec4(col, alpha);
}
`;

function makeMaterial() {
  return new THREE.ShaderMaterial({
    uniforms: {
      uCurveOrigin: sharedUniforms.uCurveOrigin,
      uCurveRadius: sharedUniforms.uCurveRadius,
      uCurveAmount: sharedUniforms.uCurveAmount,
      uTime: sharedUniforms.uTime,
      uSunDir: { value: new THREE.Vector3(0, 1, 0) },
      uSunColor: { value: new THREE.Color(1, 0.95, 0.88) },
      uSkyColor: { value: new THREE.Color(0.35, 0.5, 0.68) },
      uShallow: { value: new THREE.Color(0.24, 0.46, 0.43) },
      uDeep: { value: new THREE.Color(0.015, 0.055, 0.085) },
      uFogColor: { value: new THREE.Color(0.6, 0.7, 0.76) },
      uFogDensity: { value: 0.0009 },
      uMurk: { value: 0 },
    },
    vertexShader: WATER_VERT,
    fragmentShader: WATER_FRAG,
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
  });
}

const OCEAN_RADIUS = 26000;
const RIVER_SPAN = 460;      // metres across the streamed river patch
const RIVER_GRID = 76;       // vertices per edge

export class Water {
  constructor(scene, quality) {
    this.material = makeMaterial();
    this.quality = quality;

    // --- ocean: one disc at sea level, always there, hidden by any land ---
    const og = new THREE.CircleGeometry(OCEAN_RADIUS, 96);
    og.rotateX(-Math.PI / 2);
    const n = og.attributes.position.count;
    const depth = new Float32Array(n).fill(24);
    const flow = new Float32Array(n);
    const mask = new Float32Array(n).fill(1);
    og.setAttribute('aDepth', new THREE.BufferAttribute(depth, 1));
    og.setAttribute('aFlow', new THREE.BufferAttribute(flow, 1));
    og.setAttribute('aMask', new THREE.BufferAttribute(mask, 1));
    this.ocean = new THREE.Mesh(og, this.material);
    this.ocean.frustumCulled = false;
    this.ocean.renderOrder = 5;
    this.ocean.position.y = PLANET.seaLevel;
    scene.add(this.ocean);

    // --- rivers: a grid that follows the player ---
    const rg = new THREE.PlaneGeometry(RIVER_SPAN, RIVER_SPAN, RIVER_GRID - 1, RIVER_GRID - 1);
    rg.rotateX(-Math.PI / 2);
    const rn = rg.attributes.position.count;
    rg.setAttribute('aDepth', new THREE.BufferAttribute(new Float32Array(rn), 1));
    rg.setAttribute('aFlow', new THREE.BufferAttribute(new Float32Array(rn), 1));
    rg.setAttribute('aMask', new THREE.BufferAttribute(new Float32Array(rn), 1));
    rg.boundingSphere = new THREE.Sphere(new THREE.Vector3(), RIVER_SPAN);
    this.river = new THREE.Mesh(rg, this.material);
    this.river.frustumCulled = false;
    this.river.renderOrder = 6;
    scene.add(this.river);

    this.riverOrigin = new THREE.Vector3(1e9, 0, 1e9);
    this.rebuildDist = 42;
    this.job = null;
    this.rowsPerFrame = 12;
    this.group = { visible: true };
    this.enabled = true;
  }

  setVisible(v) {
    this.ocean.visible = v;
    this.river.visible = v;
  }

  /** Refresh sun/sky/fog so water sits in the same light as everything else. */
  syncLighting(daylight, storm = 0) {
    const u = this.material.uniforms;
    u.uSunDir.value.copy(daylight.sunDir);
    u.uSunColor.value.copy(daylight.sun.color).multiplyScalar(clamp(daylight.sun.intensity / 3, 0.05, 1.4));
    // Water reflects the sky it sits under.
    const sky = new THREE.Color().copy(daylight.horizonColor).multiplyScalar(1.35);
    sky.lerp(new THREE.Color(0.05, 0.12, 0.26), 0.35 * daylight.dayT);
    u.uSkyColor.value.copy(sky);
    u.uFogColor.value.copy(daylight.fog.color);
    u.uFogDensity.value = daylight.fog.density;
    const night = daylight.nightT;
    u.uShallow.value.setRGB(lerp(0.24, 0.04, night), lerp(0.46, 0.09, night), lerp(0.43, 0.11, night));
    u.uDeep.value.setRGB(lerp(0.015, 0.004, night), lerp(0.055, 0.013, night), lerp(0.085, 0.026, night));
    u.uMurk.value = storm * 0.6;
  }

  update(dt, px, pz) {
    if (!this.enabled) return;
    if (this.job) { this._stepJob(); return; }
    const d = Math.hypot(px - this.riverOrigin.x, pz - this.riverOrigin.z);
    if (d > this.rebuildDist) this._startJob(px, pz);
  }

  _startJob(px, pz) {
    // Snap to the grid so vertices land in the same spots each rebuild.
    const step = RIVER_SPAN / (RIVER_GRID - 1);
    const ox = Math.round(px / step) * step;
    const oz = Math.round(pz / step) * step;
    this.job = { ox, oz, row: 0, step };
  }

  _stepJob() {
    const job = this.job;
    const g = this.river.geometry;
    const pos = g.attributes.position;
    const aDepth = g.attributes.aDepth;
    const aFlow = g.attributes.aFlow;
    const aMask = g.attributes.aMask;
    const half = RIVER_SPAN / 2;
    const endRow = Math.min(RIVER_GRID, job.row + this.rowsPerFrame);

    for (; job.row < endRow; job.row++) {
      const j = job.row;
      const wz = job.oz - half + j * job.step;
      for (let i = 0; i < RIVER_GRID; i++) {
        const wx = job.ox - half + i * job.step;
        const idx = j * RIVER_GRID + i;
        const rf = riverField(wx, wz);
        let mask = 0, level = 0, depth = 0, flow = 0;
        if (rf > 0.13) {
          const surf = riverSurface(wx, wz) - 1.1;
          const bed = heightAt(wx, wz);
          depth = surf - bed;
          if (depth > 0.02) {
            mask = smoothstep(0.13, 0.30, rf);
            level = surf;
            // Fall line: how fast the water surface is dropping downstream.
            const d1 = riverSurface(wx + 14, wz) - riverSurface(wx - 14, wz);
            const d2 = riverSurface(wx, wz + 14) - riverSurface(wx, wz - 14);
            flow = clamp(Math.hypot(d1, d2) / 28 * 6.5, 0, 1);
          }
        }
        if (mask <= 0) {
          // Park unused vertices well underground rather than leaving them to
          // z-fight with the terrain.
          pos.setXYZ(idx, wx - job.ox, -260, wz - job.oz);
        } else {
          pos.setXYZ(idx, wx - job.ox, level, wz - job.oz);
        }
        aDepth.setX(idx, depth);
        aFlow.setX(idx, flow);
        aMask.setX(idx, mask);
      }
    }

    if (job.row >= RIVER_GRID) {
      pos.needsUpdate = true;
      aDepth.needsUpdate = true;
      aFlow.needsUpdate = true;
      aMask.needsUpdate = true;
      this.river.position.set(job.ox, 0, job.oz);
      this.riverOrigin.set(job.ox, 0, job.oz);
      this.job = null;
    }
  }

  dispose() {
    this.ocean.geometry.dispose();
    this.river.geometry.dispose();
    this.material.dispose();
  }
}

/** Is this point under water, and how deep? Cheap enough to call every frame. */
export function submersion(x, y, z) {
  const w = waterAt(x, z);
  if (w === null) return 0;
  return Math.max(0, w - y);
}
