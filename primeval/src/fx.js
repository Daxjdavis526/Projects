// Pooled visual effects: beams, flashes, sparks, dust, splashes.
// Everything here is additive, unlit and short-lived.

import * as THREE from 'three';
import { clamp, lerp } from './math/noise.js';

const BEAMS = 14;
const FLASHES = 26;
const PARTICLES = 340;

const _v = new THREE.Vector3();
const _m = new THREE.Matrix4();
const _q = new THREE.Quaternion();
const _s = new THREE.Vector3();
const UP = new THREE.Vector3(0, 1, 0);

export class Effects {
  constructor(scene, camera) {
    this.scene = scene;
    this.camera = camera;
    this.group = new THREE.Group();
    this.group.name = 'fx';
    this.group.frustumCulled = false;
    scene.add(this.group);

    // --- beams -------------------------------------------------------------
    const beamGeo = new THREE.CylinderGeometry(1, 1, 1, 6, 1, true);
    beamGeo.translate(0, 0.5, 0);
    this.beams = [];
    for (let i = 0; i < BEAMS; i++) {
      const mat = new THREE.MeshBasicMaterial({
        color: 0x9fe8ff, transparent: true, opacity: 0,
        blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide,
      });
      const m = new THREE.Mesh(beamGeo, mat);
      m.visible = false;
      m.frustumCulled = false;
      this.group.add(m);
      this.beams.push({ mesh: m, mat, t: 0, life: 1, w0: 1 });
    }

    // --- flashes -----------------------------------------------------------
    const flashGeo = new THREE.PlaneGeometry(1, 1);
    this.flashes = [];
    for (let i = 0; i < FLASHES; i++) {
      const mat = new THREE.MeshBasicMaterial({
        color: 0xffffff, transparent: true, opacity: 0,
        blending: THREE.AdditiveBlending, depthWrite: false, depthTest: true,
        side: THREE.DoubleSide, toneMapped: false,
      });
      const m = new THREE.Mesh(flashGeo, mat);
      m.visible = false;
      m.frustumCulled = false;
      this.group.add(m);
      this.flashes.push({ mesh: m, mat, t: 0, life: 1, size: 1 });
    }

    // --- particles ---------------------------------------------------------
    const pGeo = new THREE.PlaneGeometry(1, 1);
    const pMat = new THREE.MeshBasicMaterial({
      transparent: true, opacity: 0.9, vertexColors: true,
      blending: THREE.NormalBlending, depthWrite: false, side: THREE.DoubleSide,
    });
    this.pMesh = new THREE.InstancedMesh(pGeo, pMat, PARTICLES);
    this.pMesh.frustumCulled = false;
    this.pMesh.instanceColor = new THREE.InstancedBufferAttribute(new Float32Array(PARTICLES * 3), 3);
    this.pMesh.count = 0;
    this.group.add(this.pMesh);
    this.particles = [];
    for (let i = 0; i < PARTICLES; i++) {
      this.particles.push({
        alive: false, pos: new THREE.Vector3(), vel: new THREE.Vector3(),
        t: 0, life: 1, size: 1, grow: 0, drag: 1, grav: 0,
        col: new THREE.Color(), fade: 1, additive: false,
      });
    }
    this.pCursor = 0;

    // Additive particle pass, for embers and sparks.
    const aMat = pMat.clone();
    aMat.blending = THREE.AdditiveBlending;
    this.aMesh = new THREE.InstancedMesh(pGeo, aMat, PARTICLES);
    this.aMesh.frustumCulled = false;
    this.aMesh.instanceColor = new THREE.InstancedBufferAttribute(new Float32Array(PARTICLES * 3), 3);
    this.aMesh.count = 0;
    this.group.add(this.aMesh);

    this.lights = [];
    for (let i = 0; i < 4; i++) {
      const l = new THREE.PointLight(0xffffff, 0, 40, 2);
      l.visible = false;
      this.group.add(l);
      this.lights.push({ light: l, t: 0, life: 1, peak: 0 });
    }
  }

  // -------------------------------------------------------------------------

  beam(from, to, { color = 0x9fe8ff, width = 0.09, life = 0.12, taper = 1 } = {}) {
    const b = this.beams.find(x => x.t <= 0) ?? this.beams[0];
    const len = from.distanceTo(to);
    if (len < 0.01) return;
    _v.subVectors(to, from).normalize();
    _q.setFromUnitVectors(UP, _v);
    b.mesh.position.copy(from);
    b.mesh.quaternion.copy(_q);
    b.mesh.scale.set(width, len, width);
    b.mat.color.setHex(color);
    b.mat.opacity = 1;
    b.mesh.visible = true;
    b.t = life; b.life = life; b.w0 = width; b.taper = taper;
  }

  flash(pos, { color = 0xffffff, size = 1.2, life = 0.16 } = {}) {
    const f = this.flashes.find(x => x.t <= 0) ?? this.flashes[0];
    f.mesh.position.copy(pos);
    f.mat.color.setHex(color);
    f.mat.opacity = 1;
    f.mesh.visible = true;
    f.t = life; f.life = life; f.size = size;
  }

  light(pos, color, intensity, life = 0.2, distance = 40) {
    const l = this.lights.find(x => x.t <= 0) ?? this.lights[0];
    l.light.position.copy(pos);
    l.light.color.setHex(color);
    l.light.distance = distance;
    l.light.visible = true;
    l.t = life; l.life = life; l.peak = intensity;
  }

  particle(pos, vel, opts = {}) {
    const p = this.particles[this.pCursor];
    this.pCursor = (this.pCursor + 1) % PARTICLES;
    p.alive = true;
    p.pos.copy(pos);
    p.vel.copy(vel);
    p.t = 0;
    p.life = opts.life ?? 1;
    p.size = opts.size ?? 0.2;
    p.grow = opts.grow ?? 0;
    p.drag = opts.drag ?? 1.2;
    p.grav = opts.grav ?? 0;
    p.fade = opts.fade ?? 1;
    p.additive = !!opts.additive;
    p.col.set(opts.color ?? 0xffffff);
    return p;
  }

  /** A generic impact: a flash, a few sparks and a puff of whatever it hit. */
  impact(pos, normal, { color = 0xffc98a, sparks = 8, dust = 5, scale = 1, sparkColor = 0xffd9a0 } = {}) {
    this.flash(pos, { color, size: 1.1 * scale, life: 0.14 });
    for (let i = 0; i < sparks; i++) {
      _v.set(
        normal.x + (Math.random() - 0.5) * 1.4,
        normal.y + (Math.random() - 0.5) * 1.4 + 0.3,
        normal.z + (Math.random() - 0.5) * 1.4
      ).normalize().multiplyScalar((3 + Math.random() * 7) * scale);
      this.particle(pos, _v, {
        life: 0.4 + Math.random() * 0.5, size: 0.05 * scale, grav: 9,
        color: sparkColor, additive: true, drag: 1.0,
      });
    }
    for (let i = 0; i < dust; i++) {
      _v.set((Math.random() - 0.5) * 2, Math.random() * 1.6, (Math.random() - 0.5) * 2)
        .multiplyScalar(1.4 * scale);
      this.particle(pos, _v, {
        life: 0.8 + Math.random() * 0.9, size: 0.35 * scale, grow: 1.4 * scale,
        color: 0x6b6154, drag: 2.4, fade: 0.55,
      });
    }
  }

  /** A heavy footfall or landing. */
  dustRing(pos, radius, count = 14, color = 0x6f6558) {
    for (let i = 0; i < count; i++) {
      const a = (i / count) * Math.PI * 2 + Math.random() * 0.4;
      _v.set(Math.cos(a) * radius * (2.2 + Math.random()), 1.2 + Math.random() * 2, Math.sin(a) * radius * (2.2 + Math.random()));
      this.particle(pos, _v, {
        life: 1.1 + Math.random() * 0.8, size: 0.5 * radius, grow: 2.2 * radius,
        color, drag: 2.6, fade: 0.5,
      });
    }
  }

  splash(pos, scale = 1) {
    for (let i = 0; i < 12; i++) {
      _v.set((Math.random() - 0.5) * 4, 2 + Math.random() * 4, (Math.random() - 0.5) * 4).multiplyScalar(scale);
      this.particle(pos, _v, {
        life: 0.5 + Math.random() * 0.4, size: 0.09 * scale, grav: 11,
        color: 0xbfe0e6, drag: 0.6, additive: false,
      });
    }
    this.flash(pos, { color: 0x9fd0d8, size: 0.9 * scale, life: 0.2 });
  }

  /** Blood / tissue hit, used when an arrow or a bolt lands on an animal. */
  hitFlesh(pos, dir, scale = 1) {
    for (let i = 0; i < 9; i++) {
      _v.set(dir.x + (Math.random() - 0.5), dir.y + (Math.random() - 0.5) + 0.25, dir.z + (Math.random() - 0.5))
        .normalize().multiplyScalar((2 + Math.random() * 5) * scale);
      this.particle(pos, _v, {
        life: 0.55 + Math.random() * 0.4, size: 0.07 * scale, grav: 10,
        color: 0x6d1420, drag: 1.0,
      });
    }
  }

  // -------------------------------------------------------------------------

  update(dt) {
    for (const b of this.beams) {
      if (b.t <= 0) continue;
      b.t -= dt;
      const k = clamp(b.t / b.life, 0, 1);
      b.mat.opacity = k * k;
      b.mesh.scale.x = b.mesh.scale.z = b.w0 * (0.35 + k * 0.65);
      if (b.t <= 0) b.mesh.visible = false;
    }
    for (const f of this.flashes) {
      if (f.t <= 0) continue;
      f.t -= dt;
      const k = clamp(f.t / f.life, 0, 1);
      f.mat.opacity = k;
      const sc = f.size * (1.35 - k * 0.45);
      f.mesh.scale.set(sc, sc, sc);
      f.mesh.quaternion.copy(this.camera.quaternion);
      if (f.t <= 0) f.mesh.visible = false;
    }
    for (const l of this.lights) {
      if (l.t <= 0) continue;
      l.t -= dt;
      const k = clamp(l.t / l.life, 0, 1);
      l.light.intensity = l.peak * k * k;
      if (l.t <= 0) l.light.visible = false;
    }

    // Particles, split into the normal and additive passes.
    let nN = 0, nA = 0;
    const camQ = this.camera.quaternion;
    for (const p of this.particles) {
      if (!p.alive) continue;
      p.t += dt;
      if (p.t >= p.life) { p.alive = false; continue; }
      p.vel.y -= p.grav * dt;
      p.vel.multiplyScalar(1 - Math.min(1, p.drag * dt));
      p.pos.addScaledVector(p.vel, dt);
      const k = 1 - p.t / p.life;
      const size = p.size + p.grow * (1 - k);
      _s.setScalar(size);
      _m.compose(p.pos, camQ, _s);
      const mesh = p.additive ? this.aMesh : this.pMesh;
      const idx = p.additive ? nA++ : nN++;
      if (idx >= PARTICLES) continue;
      mesh.setMatrixAt(idx, _m);
      const a = Math.pow(k, p.fade);
      mesh.instanceColor.setXYZ(idx, p.col.r * a, p.col.g * a, p.col.b * a);
    }
    this.pMesh.count = nN;
    this.aMesh.count = nA;
    if (nN) { this.pMesh.instanceMatrix.needsUpdate = true; this.pMesh.instanceColor.needsUpdate = true; }
    if (nA) { this.aMesh.instanceMatrix.needsUpdate = true; this.aMesh.instanceColor.needsUpdate = true; }
  }
}
