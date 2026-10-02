/* Smoke, steam, water and sparks: CPU particles drawn as soft sprites.

   Two pools: one blended normally (steam, smoke, mist, spray, cold fog —
   things that block light), one added (sparks, embers). Each particle has
   a kind that sets its colour, growth, buoyancy and drag; the flame's light
   colours whatever is near it, so the steam cloud downstream of a firing
   glows orange from inside. */
import * as THREE from 'three';
import { puff } from './textures.js';

const KINDS = {
  //            colour              a0    grow  buoy   drag  life
  steam:  { c: [0.93, 0.93, 0.92], a: 0.10, g: 0.7, b: 0.6, d: 1.2, life: 4.0 },
  smoke:  { c: [0.16, 0.15, 0.14], a: 0.30, g: 0.9, b: 0.6, d: 1.2, life: 5.0 },
  mist:   { c: [0.86, 0.9, 0.94], a: 0.22, g: 0.7, b: 0.05, d: 2.4, life: 3.0 },
  drop:   { c: [0.75, 0.86, 0.95], a: 0.55, g: 0.0, b: -9.81, d: 0.15, life: 2.5 },
  fog:    { c: [0.92, 0.95, 0.98], a: 0.22, g: 0.9, b: -0.25, d: 1.8, life: 4.0 },
  vent:   { c: [0.9, 0.93, 0.96], a: 0.25, g: 1.4, b: 0.2, d: 2.0, life: 2.2 },
  dust:   { c: [0.55, 0.47, 0.36], a: 0.25, g: 1.0, b: 0.1, d: 1.6, life: 3.0 },
  spark:  { c: [1.0, 0.55, 0.15], a: 1.0, g: 0.0, b: -9.81, d: 0.3, life: 0.9, add: true },
  // a fuel-rich exhaust finishing its burn in the air: an orange, flickering flame
  fire:   { c: [1.0, 0.48, 0.12], a: 0.42, g: 1.8, b: 1.2, d: 1.6, life: 0.6, add: true },
  ember:  { c: [1.0, 0.35, 0.08], a: 0.9, g: 0.0, b: 0.4, d: 1.0, life: 1.2, add: true },
};

const vert = /* glsl */`
attribute float aSize;
attribute vec4 aColor;
varying vec4 vColor;
varying vec3 vWorld;
uniform float uScale;
void main() {
  vColor = aColor;
  vec4 w = modelMatrix * vec4(position, 1.0);
  vWorld = w.xyz;
  vec4 mv = viewMatrix * w;
  gl_PointSize = clamp(aSize * uScale / max(0.05, -mv.z), 0.0, 512.0);
  gl_Position = projectionMatrix * mv;
}`;
const frag = /* glsl */`
uniform sampler2D uMap;
uniform vec3 uAmb;            // daylight / floodlight colour on the particles
uniform vec3 uFlamePos, uFlameCol;
uniform float uFlame;         // flame brightness
uniform float uAdd;
varying vec4 vColor;
varying vec3 vWorld;
void main() {
  vec4 t = texture2D(uMap, gl_PointCoord);
  if (uAdd > 0.5) { gl_FragColor = vec4(vColor.rgb * vColor.a * t.a * 3.0, 1.0); return; }
  float d = distance(vWorld, uFlamePos);
  vec3 lit = vColor.rgb * (uAmb + uFlameCol * uFlame / (1.0 + d * d * 2.5));
  gl_FragColor = vec4(lit, vColor.a * t.a);
}`;

class Pool {
  constructor(n, additive, map) {
    this.n = n; this.next = 0;
    this.pos = new Float32Array(n * 3); this.vel = new Float32Array(n * 3);
    this.age = new Float32Array(n).fill(1e9); this.life = new Float32Array(n).fill(1);
    this.size0 = new Float32Array(n); this.kind = new Array(n).fill(null);
    this.col = new Float32Array(n * 4); this.size = new Float32Array(n);
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(this.pos, 3).setUsage(THREE.DynamicDrawUsage));
    geo.setAttribute('aColor', new THREE.BufferAttribute(this.col, 4).setUsage(THREE.DynamicDrawUsage));
    geo.setAttribute('aSize', new THREE.BufferAttribute(this.size, 1).setUsage(THREE.DynamicDrawUsage));
    geo.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 1e4);
    this.u = {
      uMap: { value: map }, uScale: { value: 600 }, uAmb: { value: new THREE.Color(1, 1, 1) },
      uFlamePos: { value: new THREE.Vector3() }, uFlameCol: { value: new THREE.Color(1, 0.6, 0.3) }, uFlame: { value: 0 }, uAdd: { value: additive ? 1 : 0 },
    };
    this.points = new THREE.Points(geo, new THREE.ShaderMaterial({
      uniforms: this.u, vertexShader: vert, fragmentShader: frag, transparent: true, depthWrite: false,
      blending: additive ? THREE.AdditiveBlending : THREE.NormalBlending,
    }));
    this.points.frustumCulled = false;
    this.points.renderOrder = additive ? 12 : 11;
    this.geo = geo;
  }
  spawn(kind, p, v, size, life) {
    const i = this.next; this.next = (this.next + 1) % this.n;
    this.pos.set(p, i * 3); this.vel.set(v, i * 3);
    this.age[i] = 0; this.life[i] = life ?? KINDS[kind].life * (0.7 + 0.6 * Math.random());
    this.size0[i] = size; this.kind[i] = kind;
  }
  step(dt, wind, groundY = 0, onLand = null) {
    const { pos, vel, age, life, col, size } = this;
    for (let i = 0; i < this.n; i++) {
      if (age[i] >= life[i]) { size[i] = 0; col[i * 4 + 3] = 0; continue; }
      const K = KINDS[this.kind[i]];
      age[i] += dt;
      const f = age[i] / life[i];
      const j = i * 3;
      // drag toward the wind, buoyancy (or gravity) on y
      const dk = Math.min(1, K.d * dt);
      vel[j] += (wind.x - vel[j]) * dk; vel[j + 2] += (wind.z - vel[j + 2]) * dk;
      vel[j + 1] += K.b * dt - vel[j + 1] * dk * (K.b < -1 ? 0 : 1);
      pos[j] += vel[j] * dt; pos[j + 1] += vel[j + 1] * dt; pos[j + 2] += vel[j + 2] * dt;
      if (pos[j + 1] < groundY) {
        if (onLand && this.kind[i] === 'drop') onLand(pos[j], pos[j + 2], vel[j], vel[j + 2]);
        if (K.b < -1) { age[i] = life[i]; continue; }
        pos[j + 1] = groundY; vel[j + 1] = Math.abs(vel[j + 1]) * 0.2;
      }
      size[i] = this.size0[i] * (1 + K.g * age[i]);
      const a = K.a * (f < 0.1 ? f / 0.1 : 1) * (1 - f) * (1 - f);
      col[i * 4] = K.c[0]; col[i * 4 + 1] = K.c[1]; col[i * 4 + 2] = K.c[2]; col[i * 4 + 3] = a;
    }
    this.geo.attributes.position.needsUpdate = true;
    this.geo.attributes.aColor.needsUpdate = true;
    this.geo.attributes.aSize.needsUpdate = true;
  }
}

export class Particles {
  constructor({ count = 2400 } = {}) {
    const map = puff();
    this.soft = new Pool(count, false, map);
    this.add = new Pool(Math.round(count / 4), true, map);
    this.group = new THREE.Group();
    this.group.add(this.soft.points, this.add.points);
    this.wind = new THREE.Vector3(0.6, 0, -0.3);
    this.acc = {};
  }
  /* Emit `rate` per second of a kind, from p with velocity v (arrays), with
     spread s (m/s) and initial size; call every frame with the frame's dt. */
  emit(key, kind, rate, dt, p, v, { spread = 0.3, size = 0.2, jitter = 0, life } = {}) {
    if (!(rate > 0)) return;
    this.acc[key] = (this.acc[key] || 0) + rate * dt;
    const pool = KINDS[kind].add ? this.add : this.soft;
    while (this.acc[key] >= 1) {
      this.acc[key] -= 1;
      const r = () => (Math.random() - 0.5) * 2;
      pool.spawn(kind,
        [p[0] + r() * jitter, p[1] + r() * jitter, p[2] + r() * jitter],
        [v[0] + r() * spread, v[1] + r() * spread, v[2] + r() * spread],
        size * (0.7 + 0.6 * Math.random()), life);
    }
  }
  burst(kind, n, p, v, opts) { this.acc['_b'] = 0; this.emit('_b', kind, n, 1, p, v, opts); }
  setLight({ amb, flamePos, flameCol, flame }) {
    for (const P of [this.soft]) {
      P.u.uAmb.value.copy(amb); P.u.uFlamePos.value.copy(flamePos); P.u.uFlameCol.value.copy(flameCol); P.u.uFlame.value = flame;
    }
  }
  setScale(px) { this.soft.u.uScale.value = px; this.add.u.uScale.value = px; }
  step(dt) {
    const mist = [];
    this.soft.step(dt, this.wind, 0.0, (x, z, vx, vz) => { if (mist.length < 30 && Math.random() < 0.35) mist.push([x, z, vx, vz]); });
    this.add.step(dt, this.wind, 0.0);
    for (const [x, z, vx, vz] of mist) this.soft.spawn('mist', [x, 0.05, z], [vx * 0.1, 0.4, vz * 0.1], 0.25);
  }
}
