/* =============================================================================
   RIG — free-flight and orbit camera, adaptive speed, input mode state machine
   -----------------------------------------------------------------------------
   The camera has to work from 12 km (crawling around a neutron star) to 1e14 km
   (crossing a 3000-year-old remnant). A fixed speed is useless across 13
   decades, so speed is derived from the distance to whatever you are looking
   at: v = k * d, clamped. Approaching the neutron star slows you down
   automatically; leaving it speeds you up. The scroll wheel applies a manual
   multiplier on top for when the automatic choice is not what you wanted.

   Position is kept in f64 (plain JS numbers) and handed to the floating origin,
   never written into a f32 Object3D.position — that is what keeps precision
   where it matters, next to the camera.
   ========================================================================== */

import * as THREE from 'three';
import { CAMERA } from '../config.js';

export const MODE = { FREE: 'free', ORBIT: 'orbit', CINEMATIC: 'cinematic' };

export class Rig {
  constructor(stage, dom) {
    this.stage = stage;
    this.dom = dom;
    this.mode = MODE.ORBIT;

    /* f64 world position, km. Starts well back from a 600 Rsun supergiant. */
    this.pos = { x: 0, y: 0.18e9, z: 2.6e9 };
    this.quat = new THREE.Quaternion();
    this.vel = { x: 0, y: 0, z: 0 };

    /* orbit state */
    this.target = { x: 0, y: 0, z: 0 };
    this.orbitDist = 2.6e9;
    this.yaw = 0; this.pitch = -0.06;

    this.speedMul = 1;
    this.speed = 0;
    this.locked = false;
    this.suspended = false;      // true while a modal owns the input
    this.keys = Object.create(null);

    this._bind();
  }

  /* --- input ------------------------------------------------------------- */
  _bind() {
    const d = this.dom;

    addEventListener('keydown', e => {
      if (this.suspended) return;
      this.keys[e.code] = true;
      if (e.code === 'Space') e.preventDefault();
    });
    addEventListener('keyup', e => { this.keys[e.code] = false; });
    addEventListener('blur', () => { this.keys = Object.create(null); });

    d.addEventListener('mousedown', e => {
      if (this.suspended) return;
      if (this.mode === MODE.FREE && !this.locked) d.requestPointerLock();
      this._drag = e.button === 0;
      this._px = e.clientX; this._py = e.clientY;
    });
    addEventListener('mouseup', () => { this._drag = false; });

    addEventListener('mousemove', e => {
      if (this.suspended) return;
      if (this.locked) {
        this.yaw   -= e.movementX * CAMERA.lookSpeed;
        this.pitch -= e.movementY * CAMERA.lookSpeed;
      } else if (this._drag && this.mode === MODE.ORBIT) {
        this.yaw   -= (e.clientX - this._px) * CAMERA.lookSpeed * 1.3;
        this.pitch -= (e.clientY - this._py) * CAMERA.lookSpeed * 1.3;
        this._px = e.clientX; this._py = e.clientY;
      }
      this.pitch = Math.max(-1.553, Math.min(1.553, this.pitch));
    });

    d.addEventListener('wheel', e => {
      if (this.suspended) return;
      e.preventDefault();
      const f = Math.exp(-e.deltaY * 0.0011);
      if (this.mode === MODE.ORBIT) this.orbitDist = Math.max(20, this.orbitDist * f);
      else this.speedMul = Math.min(1e4, Math.max(1e-4, this.speedMul * f));
    }, { passive: false });

    document.addEventListener('pointerlockchange', () => {
      this.locked = document.pointerLockElement === d;
      if (this.locked) this.mode = MODE.FREE;
    });
  }

  /* Modals call this so Escape and WASD stop reaching the camera. */
  suspend(on) {
    this.suspended = on;
    if (on) {
      this.keys = Object.create(null);
      if (this.locked) document.exitPointerLock();
    }
  }

  focusOn(x, y, z, dist) {
    this.target.x = x; this.target.y = y; this.target.z = z;
    if (dist) this.orbitDist = dist;
    this.mode = MODE.ORBIT;
    if (this.locked) document.exitPointerLock();
  }

  /* --- per-frame --------------------------------------------------------- */
  update(dt, focusRadius = 1e6) {
    if (this.mode === MODE.CINEMATIC) { this._commit(); return; }

    const e = new THREE.Euler(this.pitch, this.yaw, 0, 'YXZ');
    this.quat.setFromEuler(e);

    if (this.mode === MODE.ORBIT) {
      const off = new THREE.Vector3(0, 0, this.orbitDist).applyQuaternion(this.quat);
      this.pos.x = this.target.x + off.x;
      this.pos.y = this.target.y + off.y;
      this.pos.z = this.target.z + off.z;
      this.speed = 0;
    } else {
      /* Distance to the thing of interest sets the speed scale. */
      const dx = this.pos.x - this.target.x,
            dy = this.pos.y - this.target.y,
            dz = this.pos.z - this.target.z;
      const d = Math.max(Math.hypot(dx, dy, dz) - focusRadius, focusRadius * 0.02);
      let v = Math.min(Math.max(CAMERA.speedFactor * d, CAMERA.speedMin), CAMERA.speedMax);
      v *= this.speedMul;
      if (this.keys.ShiftLeft || this.keys.ShiftRight) v *= CAMERA.boost;

      const k = this.keys;
      const ax = (k.KeyD ? 1 : 0) - (k.KeyA ? 1 : 0);
      const ay = (k.KeyE ? 1 : 0) - (k.KeyQ ? 1 : 0);
      const az = (k.KeyS ? 1 : 0) - (k.KeyW ? 1 : 0);

      const dir = new THREE.Vector3(ax, 0, az).applyQuaternion(this.quat);
      dir.y += ay;
      if (dir.lengthSq() > 0) dir.normalize();

      /* Exponential approach — framerate independent, no jerk at speed changes */
      const a = 1 - Math.exp(-CAMERA.damping * dt);
      this.vel.x += (dir.x * v - this.vel.x) * a;
      this.vel.y += (dir.y * v - this.vel.y) * a;
      this.vel.z += (dir.z * v - this.vel.z) * a;

      this.pos.x += this.vel.x * dt;
      this.pos.y += this.vel.y * dt;
      this.pos.z += this.vel.z * dt;
      this.speed = Math.hypot(this.vel.x, this.vel.y, this.vel.z);
    }

    this._commit();
  }

  /* Push f64 position into the floating origin; camera itself stays at 0. */
  _commit() {
    const s = this.stage;
    s.origin.x = this.pos.x; s.origin.y = this.pos.y; s.origin.z = this.pos.z;
    s.camera.position.set(0, 0, 0);
    s.camera.quaternion.copy(this.quat);
  }
}
