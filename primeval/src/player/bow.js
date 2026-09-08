// The recurve bow, and the arrows it puts into things.
//
// Arrows are real projectiles: gravity, drag, and a raycast per step against
// terrain and animals. They stick where they land and can be pulled back out.

import * as THREE from 'three';
import { clamp, lerp, smoothstep } from '../math/noise.js';

const GRAVITY = 11.4;
const DRAG = 0.06;

/**
 * The bow, authored in its own frame: limbs run along ±Y, the bow's plane is
 * XY, and the arrow lies along -Z (away from the eye). Holding that convention
 * is what makes the aim pose a straight `rotation.set(0,0,0)`.
 */
function bowGeometry() {
  const parts = [];
  const wood = new THREE.Color(0x4a3524);
  const horn = new THREE.Color(0x241b14);
  const push = (g, c) => {
    const n = g.attributes.position.count;
    const col = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) { col[i * 3] = c.r; col[i * 3 + 1] = c.g; col[i * 3 + 2] = c.b; }
    g.setAttribute('color', new THREE.BufferAttribute(col, 3));
    parts.push(g);
  };
  // A tapered segment between two points in the XY plane.
  const seg = (ax, ay, bx, by, r0, r1) => {
    const dx = bx - ax, dy = by - ay;
    const len = Math.hypot(dx, dy) || 0.001;
    const g = new THREE.CylinderGeometry(r1, r0, len, 6, 1, false);
    g.translate(0, len / 2, 0);
    const q = new THREE.Quaternion().setFromUnitVectors(
      new THREE.Vector3(0, 1, 0), new THREE.Vector3(dx / len, dy / len, 0));
    g.applyQuaternion(q);
    g.translate(ax, ay, 0);
    return g;
  };

  // Riser.
  const grip = new THREE.CylinderGeometry(0.016, 0.019, 0.18, 8);
  grip.translate(0, 0, 0.010);
  push(grip, horn);
  const shelf = new THREE.BoxGeometry(0.028, 0.04, 0.045);
  shelf.translate(0.015, 0.016, -0.022);
  push(shelf, horn);

  // Limbs: swept outward, then recurved back at the tips.
  for (const sgn of [-1, 1]) {
    let x = 0, y = sgn * 0.088, ang = 0;         // ang: lean away from vertical
    for (let i = 0; i < 8; i++) {
      const len = 0.055;
      const t = i / 7;
      // Curve out, then hook back — a recurve profile.
      ang += (i < 5 ? 0.10 : -0.30);
      const nx = x + Math.sin(ang) * len * -1;
      const ny = y + Math.cos(ang) * len * sgn;
      push(seg(x, y, nx, ny, 0.0125 - t * 0.006, 0.0120 - t * 0.006), i > 5 ? horn : wood);
      x = nx; y = ny;
    }
    // Nock tip.
    const tip = new THREE.SphereGeometry(0.008, 6, 4);
    tip.translate(x, y, 0);
    push(tip, horn);
  }
  return mergeSimple(parts);
}

function mergeSimple(geos) {
  let vt = 0, it = 0;
  for (const g of geos) { vt += g.attributes.position.count; it += g.index ? g.index.count : g.attributes.position.count; }
  const pos = new Float32Array(vt * 3), nrm = new Float32Array(vt * 3), col = new Float32Array(vt * 3);
  const idx = new Uint16Array(it);
  let vo = 0, io = 0;
  for (const g of geos) {
    const n = g.attributes.position.count;
    pos.set(g.attributes.position.array.subarray(0, n * 3), vo * 3);
    nrm.set(g.attributes.normal.array.subarray(0, n * 3), vo * 3);
    col.set(g.attributes.color.array.subarray(0, n * 3), vo * 3);
    if (g.index) { for (let i = 0; i < g.index.count; i++) idx[io + i] = g.index.array[i] + vo; io += g.index.count; }
    else { for (let i = 0; i < n; i++) idx[io + i] = vo + i; io += n; }
    vo += n;
  }
  const out = new THREE.BufferGeometry();
  out.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  out.setAttribute('normal', new THREE.BufferAttribute(nrm, 3));
  out.setAttribute('color', new THREE.BufferAttribute(col, 3));
  out.setIndex(new THREE.BufferAttribute(idx, 1));
  return out;
}

function arrowGeometry() {
  const parts = [];
  const shaftC = new THREE.Color(0x6b5a41), headC = new THREE.Color(0x3a3d42), fletchC = new THREE.Color(0xb8534a);
  const push = (g, c) => {
    const n = g.attributes.position.count;
    const col = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) { col[i * 3] = c.r; col[i * 3 + 1] = c.g; col[i * 3 + 2] = c.b; }
    g.setAttribute('color', new THREE.BufferAttribute(col, 3));
    parts.push(g);
  };
  const shaft = new THREE.CylinderGeometry(0.0055, 0.0055, 0.74, 6);
  shaft.rotateX(Math.PI / 2);
  push(shaft, shaftC);
  const head = new THREE.ConeGeometry(0.013, 0.075, 6);
  head.rotateX(Math.PI / 2);
  head.translate(0, 0, 0.40);
  push(head, headC);
  for (let i = 0; i < 3; i++) {
    const f = new THREE.PlaneGeometry(0.028, 0.10);
    f.rotateY(Math.PI / 2);
    f.rotateZ((i / 3) * Math.PI * 2);
    f.translate(0, 0, -0.31);
    f.computeVertexNormals();
    push(f, fletchC);
  }
  return mergeSimple(parts);
}

class Arrow {
  constructor(mesh) {
    this.mesh = mesh;
    this.vel = new THREE.Vector3();
    this.prev = new THREE.Vector3();
    this.live = false;
    this.stuck = false;
    this.age = 0;
    this.power = 1;
  }
}

export class Bow {
  constructor(scene, camera) {
    this.scene = scene;
    this.camera = camera;
    this.material = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.75, metalness: 0.08, side: THREE.DoubleSide });

    this.group = new THREE.Group();
    this.group.name = 'bow-view';
    const geo = bowGeometry();
    this.bowMesh = new THREE.Mesh(geo, this.material);
    this.group.add(this.bowMesh);

    // String: three points so it can be pulled into a V.
    const sg = new THREE.BufferGeometry();
    sg.setAttribute('position', new THREE.BufferAttribute(new Float32Array(9), 3));
    this.string = new THREE.Line(sg, new THREE.LineBasicMaterial({ color: 0xd8d2c4, transparent: true, opacity: 0.85 }));
    this.group.add(this.string);

    this.arrowGeo = arrowGeometry();
    this.nocked = new THREE.Mesh(this.arrowGeo, this.material);
    this.nocked.rotation.y = Math.PI;
    this.nocked.scale.setScalar(0.78);
    this.group.add(this.nocked);

    camera.add(this.group);
    // A real bow is 1.2 m tall. Held 40 cm from the eye it would be the only
    // thing on screen, so the viewmodel is scaled and pushed out — the usual
    // first-person cheat.
    this.group.scale.setScalar(0.54);
    this.group.position.set(0.24, -0.26, -0.62);
    this.group.rotation.set(-0.10, 0.42, 0.34);
    this.group.visible = false;

    this.pool = [];
    this.flying = [];
    this.worldArrows = [];      // stuck in terrain, recoverable
    this.draw = 0;
    this.releasing = 0;
    this.aiming = 0;
    this.equipped = false;
    this.cooldown = 0;
    this.onShoot = null;
    this.onHit = null;
  }

  _obtain() {
    for (const a of this.pool) if (!a.live) return a;
    const m = new THREE.Mesh(this.arrowGeo, this.material);
    m.castShadow = false;
    const a = new Arrow(m);
    this.pool.push(a);
    return a;
  }

  equip(on) {
    this.equipped = on;
    this.group.visible = on;
    if (!on) this.draw = 0;
  }

  /**
   * @param inv  Inventory, for arrow supply
   * @returns HUD state
   */
  update(dt, input, player, ctx) {
    this.cooldown = Math.max(0, this.cooldown - dt);
    const hasArrows = ctx.inventory.count('arrow') > 0;

    if (this.equipped && !player.frozen) {
      const wantDraw = input.held(0) && hasArrows && this.cooldown <= 0;
      const drawRate = 1 / 0.85;
      this.draw = clamp(this.draw + (wantDraw ? dt * drawRate : -dt * 3.4), 0, 1);
      this.aiming = clamp(this.aiming + (input.held(2) ? dt * 6 : -dt * 6), 0, 1);

      // Holding at full draw is tiring, and a tired shot wanders.
      if (this.draw > 0.6) player.stamina = Math.max(0, player.stamina - 5.5 * dt);

      if (!input.held(0) && this.releasing <= 0 && this.drawnLast > 0.14 && hasArrows) {
        this.shoot(player, ctx);
      }
      this.drawnLast = this.draw;
    } else {
      this.draw = lerp(this.draw, 0, 1 - Math.exp(-dt * 8));
      this.aiming = lerp(this.aiming, 0, 1 - Math.exp(-dt * 8));
      this.drawnLast = 0;
    }
    this.releasing = Math.max(0, this.releasing - dt);

    this.poseView(dt, player);
    this.stepArrows(dt, ctx);

    return {
      draw: this.draw,
      aiming: this.aiming,
      arrows: ctx.inventory.count('arrow'),
    };
  }

  shoot(player, ctx) {
    if (!ctx.inventory.take('arrow', 1)) return;
    const power = smoothstep(0.12, 1.0, this.draw);
    const speed = lerp(26, 68, power);
    const a = this._obtain();
    const eye = player.eyePosition;
    const dir = player.lookDir(new THREE.Vector3());
    // Fatigue and a fast heartbeat put the arrow somewhere near where you aimed.
    const wobble = (1 - player.stamina / 100) * 0.022 + (1 - power) * 0.012;
    dir.x += (Math.random() - 0.5) * wobble;
    dir.y += (Math.random() - 0.5) * wobble;
    dir.z += (Math.random() - 0.5) * wobble;
    dir.normalize();

    a.mesh.position.copy(eye).addScaledVector(dir, 0.55);
    a.prev.copy(a.mesh.position);
    a.vel.copy(dir).multiplyScalar(speed);
    a.live = true; a.stuck = false; a.age = 0; a.power = power;
    a.mesh.visible = true;
    if (!a.mesh.parent) this.scene.add(a.mesh);
    this.flying.push(a);

    this.draw = 0;
    this.releasing = 0.24;
    this.cooldown = 0.34;
    player.addRecoil(0.016 * power, (Math.random() - 0.5) * 0.008);
    this.onShoot?.(power);
    ctx.makeNoise?.(a.mesh.position, 0.35, 34);
  }

  stepArrows(dt, ctx) {
    for (let i = this.flying.length - 1; i >= 0; i--) {
      const a = this.flying[i];
      a.age += dt;
      a.prev.copy(a.mesh.position);
      a.vel.y -= GRAVITY * dt;
      a.vel.multiplyScalar(1 - DRAG * dt);
      a.mesh.position.addScaledVector(a.vel, dt);
      // Point along the flight path — this is what sells the arc.
      const dir = a.vel.clone().normalize();
      a.mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), dir);

      const seg = new THREE.Vector3().subVectors(a.mesh.position, a.prev);
      const dist = seg.length();
      if (dist > 0.0001) {
        seg.divideScalar(dist);
        const hit = ctx.eco?.raycast(a.prev, seg, dist);
        if (hit) {
          const point = a.prev.clone().addScaledVector(seg, hit.t);
          const dmg = lerp(11, 38, a.power) * hit.mult;
          const killed = hit.creature.damage(dmg, hit.part, ctx.playerPos);
          hit.creature.attachArrow(a.mesh, point, hit.part);
          a.live = false;
          this.flying.splice(i, 1);
          this.onHit?.(hit, dmg, killed);
          ctx.eco.alarm(point, 90, 'attack');
          continue;
        }
      }
      // Terrain.
      const gy = ctx.world.heightAt(a.mesh.position.x, a.mesh.position.z);
      const wl = ctx.world.waterAt ? ctx.world.waterAt(a.mesh.position.x, a.mesh.position.z) : null;
      if (wl !== null && a.mesh.position.y < wl) {
        // Splash: arrows lost to water are lost.
        ctx.onSplash?.(a.mesh.position.clone());
        a.live = false; a.mesh.visible = false;
        this.scene.remove(a.mesh);
        this.flying.splice(i, 1);
        continue;
      }
      if (a.mesh.position.y <= gy) {
        a.mesh.position.y = gy + 0.02;
        a.live = false; a.stuck = true;
        this.flying.splice(i, 1);
        this.worldArrows.push(a);
        this.onHit?.(null, 0, false);
        continue;
      }
      if (a.age > 12) {
        a.live = false; a.mesh.visible = false;
        this.scene.remove(a.mesh);
        this.flying.splice(i, 1);
      }
    }
  }

  /** Nearest recoverable arrow within reach, or null. */
  recoverable(pos, maxDist = 2.4) {
    let best = null, bd = maxDist * maxDist;
    for (const a of this.worldArrows) {
      const d2 = a.mesh.position.distanceToSquared(pos);
      if (d2 < bd) { bd = d2; best = a; }
    }
    return best;
  }

  recover(a) {
    const i = this.worldArrows.indexOf(a);
    if (i >= 0) this.worldArrows.splice(i, 1);
    a.mesh.visible = false;
    this.scene.remove(a.mesh);
    a.stuck = false;
  }

  /** Bow in hand: raise on aim, shake at full draw, kick on release. */
  poseView(dt, player) {
    if (!this.equipped) return;
    const g = this.group;
    const aim = this.aiming;
    const d = this.draw;
    const t = performance.now() * 0.001;
    const strain = Math.pow(d, 2.2);
    const sway = (1 - aim * 0.6) * 0.012 + strain * 0.006 * (1 - player.stamina / 100 + 0.3);

    // Rest: canted low and right. Aim: centred, bow plane square to the eye,
    // so you are literally looking down the arrow.
    const restX = lerp(0.26, 0.075, aim), restY = lerp(-0.28, -0.155, aim);
    const kick = this.releasing > 0 ? Math.sin(this.releasing / 0.24 * Math.PI) * 0.11 : 0;
    g.position.set(
      restX + Math.sin(t * 1.3) * sway + player.bob * 0.4,
      restY + Math.cos(t * 1.7) * sway - strain * 0.010 + player.bob * 0.6,
      lerp(-0.62, -0.54, aim) + kick
    );
    g.scale.setScalar(lerp(0.54, 0.48, aim));
    g.rotation.set(
      lerp(-0.10, 0.0, aim) - strain * 0.03,
      lerp(0.42, 0.0, aim),
      lerp(0.34, 0.06, aim)
    );

    // String and nocked arrow follow the draw.
    const pull = 0.015 + d * 0.235;
    const pos = this.string.geometry.attributes.position;
    pos.setXYZ(0, -0.040, 0.372, 0);
    pos.setXYZ(1, 0, 0, pull);
    pos.setXYZ(2, -0.040, -0.372, 0);
    pos.needsUpdate = true;
    this.nocked.visible = d > 0.02 || this.releasing > 0;
    // The arrow rides the string: nock at the draw point, head out front.
    this.nocked.position.set(0, 0.014, pull - 0.30);
    this.nocked.rotation.set(0, Math.PI, 0);
  }

  dispose() {
    this.arrowGeo.dispose();
    this.bowMesh.geometry.dispose();
    this.material.dispose();
  }
}
