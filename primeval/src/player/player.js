// The person inside the suit: movement, camera, and the three numbers that
// decide whether you live through the night.

import * as THREE from 'three';
import { PLAYER, KEYS } from '../config.js';
import { clamp, lerp, smoothstep } from '../math/noise.js';

const _fwd = new THREE.Vector3();
const _right = new THREE.Vector3();
const _move = new THREE.Vector3();

export class Player {
  constructor(camera, colliders) {
    this.camera = camera;
    this.colliders = colliders;
    this.pos = new THREE.Vector3(0, 0, 0);      // feet
    this.vel = new THREE.Vector3();
    this.yaw = 0;
    this.pitch = 0;
    this.grounded = false;
    this.crouching = false;
    this.sprinting = false;
    this.swimming = false;
    this.submerged = 0;

    this.health = PLAYER.maxHealth;
    this.stamina = PLAYER.maxStamina;
    this.hunger = PLAYER.maxHunger;
    this.alive = true;

    this.eye = PLAYER.eyeHeight;
    this.eyeSmooth = PLAYER.eyeHeight;
    this.bob = 0;
    this.bobAmt = 0;
    this.landDip = 0;
    this.shake = 0;
    this.shakeDecay = 3.2;
    this.recoil = new THREE.Vector2();
    this.fovBoost = 0;
    this.enabled = true;
    this.noise = 0;             // how loud the player currently is, 0..1
    this.lastDamageTime = -99;
    this.damageFlash = 0;
    this.stepPhase = 0;
    this.onStep = null;
    this.gravityScale = 1;
    this.speedScale = 1;
    this.frozen = false;
  }

  setPosition(x, y, z) { this.pos.set(x, y, z); this.vel.set(0, 0, 0); }

  get eyePosition() {
    return new THREE.Vector3(this.pos.x, this.pos.y + this.eyeSmooth, this.pos.z);
  }

  look(input, dt) {
    if (!this.enabled || this.frozen) return;
    const s = input.sensitivity;
    this.yaw -= input.mouse.dx * s;
    this.pitch -= input.mouse.dy * s * (input.invertY ? -1 : 1);
    this.pitch = clamp(this.pitch, -Math.PI / 2 + 0.02, Math.PI / 2 - 0.02);
    // Recoil decays back toward centre.
    this.recoil.multiplyScalar(Math.max(0, 1 - dt * 7));
  }

  addRecoil(pitchAmt, yawAmt) {
    this.recoil.x += pitchAmt;
    this.recoil.y += yawAmt;
  }

  addShake(amount) { this.shake = Math.min(1.6, this.shake + amount); }

  damage(amount, source = '') {
    if (!this.alive) return;
    this.health = Math.max(0, this.health - amount);
    this.damageFlash = Math.min(1, this.damageFlash + amount / 42);
    this.addShake(Math.min(0.7, amount / 45));
    if (this.health <= 0) this.alive = false;
    this.lastSource = source;
  }

  heal(a) { this.health = Math.min(PLAYER.maxHealth, this.health + a); }
  feed(a) { this.hunger = Math.min(PLAYER.maxHunger, this.hunger + a); }

  /**
   * @param world  { heightAt(x,z), waterAt(x,z), gravity }
   */
  update(dt, input, world, opts = {}) {
    const canMove = this.enabled && !this.frozen && this.alive;
    const g = world.gravity * this.gravityScale;

    const groundY = world.heightAt(this.pos.x, this.pos.z);
    const colY = this.colliders
      ? this.colliders.surfaceAt(this.pos.x, this.pos.z, this.pos.y + PLAYER.stepUp, PLAYER.radius * 0.9)
      : -Infinity;
    const support = Math.max(groundY, colY);

    const waterY = world.waterAt ? world.waterAt(this.pos.x, this.pos.z) : null;
    const headY = this.pos.y + this.eye;
    this.submerged = waterY === null ? 0 : clamp((waterY - this.pos.y) / this.eye, 0, 1.2);
    this.swimming = this.submerged > 0.72;

    // --- intent ---
    const ax = canMove ? input.moveAxis() : { x: 0, z: 0 };
    const moving = ax.x !== 0 || ax.z !== 0;
    const wantSprint = canMove && input.any(KEYS.sprint) && ax.z > 0.1 && this.stamina > 1 && !this.crouching;
    this.sprinting = wantSprint && !this.swimming;
    const wantCrouch = canMove && input.any(KEYS.crouch) && !this.swimming;
    this.crouching = wantCrouch;
    this.eye = lerp(this.eye, this.crouching ? PLAYER.crouchHeight : PLAYER.eyeHeight, 1 - Math.exp(-dt * 12));

    let speed = this.swimming ? PLAYER.swimSpeed
      : this.crouching ? PLAYER.crouchSpeed
        : this.sprinting ? PLAYER.sprintSpeed : PLAYER.walkSpeed;
    speed *= this.speedScale * (opts.speedMul ?? 1);
    // Wading is slow and loud.
    if (!this.swimming && this.submerged > 0.15) speed *= lerp(1, 0.55, this.submerged);
    // Steep ground costs speed.
    if (this.grounded) {
      const nx = world.heightAt(this.pos.x + 1.4, this.pos.z) - groundY;
      const nz = world.heightAt(this.pos.x, this.pos.z + 1.4) - groundY;
      const slope = clamp(Math.hypot(nx, nz) / 1.4, 0, 3);
      speed *= lerp(1, 0.42, smoothstep(0.55, 1.5, slope));
    }

    _fwd.set(-Math.sin(this.yaw), 0, -Math.cos(this.yaw));
    _right.set(Math.cos(this.yaw), 0, -Math.sin(this.yaw));
    _move.set(0, 0, 0)
      .addScaledVector(_fwd, ax.z)
      .addScaledVector(_right, ax.x);
    if (_move.lengthSq() > 0) _move.normalize().multiplyScalar(speed);

    // --- horizontal integration ---
    const accel = this.grounded ? 34 : (this.swimming ? 10 : 7);
    const k = 1 - Math.exp(-dt * accel);
    this.vel.x = lerp(this.vel.x, _move.x, k);
    this.vel.z = lerp(this.vel.z, _move.z, k);

    // --- vertical ---
    if (this.swimming) {
      const rise = (canMove && input.any(KEYS.jump)) ? 3.0 : (canMove && input.any(KEYS.crouch) ? -2.6 : 0);
      const buoy = (waterY - (this.pos.y + this.eye * 0.72)) * 3.4;
      this.vel.y = lerp(this.vel.y, clamp(buoy, -2.4, 2.4) + rise, 1 - Math.exp(-dt * 5));
      this.grounded = false;
    } else {
      this.vel.y -= g * dt;
      if (canMove && input.anyHit(KEYS.jump) && this.grounded && this.stamina > 8) {
        this.vel.y = PLAYER.jumpSpeed * (opts.jumpMul ?? 1);
        this.stamina -= 7;
        this.grounded = false;
      }
    }

    this.pos.addScaledVector(this.vel, dt);

    // --- ground / collision resolve ---
    if (this.colliders) this.colliders.resolve(this.pos, PLAYER.radius, Math.max(0.9, this.eye), PLAYER.stepUp);

    const groundY2 = world.heightAt(this.pos.x, this.pos.z);
    const colY2 = this.colliders
      ? this.colliders.surfaceAt(this.pos.x, this.pos.z, this.pos.y + PLAYER.stepUp, PLAYER.radius * 0.9)
      : -Infinity;
    const floor = Math.max(groundY2, colY2);

    const wasGrounded = this.grounded;
    if (this.pos.y <= floor + 0.001) {
      if (!wasGrounded && this.vel.y < -7) {
        // Landing: dip the camera and take fall damage past a threshold.
        const impact = -this.vel.y;
        this.landDip = clamp((impact - 6) * 0.05, 0, 0.42);
        this.addShake(clamp((impact - 9) * 0.03, 0, 0.5));
        if (impact > 13 && !this.swimming) {
          this.damage(clamp((impact - 13) * 4.2, 0, 100), 'fall');
        }
        if (this.onStep) this.onStep('land', clamp(impact / 14, 0.2, 1));
      }
      this.pos.y = floor;
      this.vel.y = Math.max(0, this.vel.y);
      this.grounded = true;
    } else {
      this.grounded = false;
    }

    // --- stamina / hunger / health ---
    if (this.sprinting && moving && this.grounded) {
      this.stamina = Math.max(0, this.stamina - PLAYER.staminaDrain * dt);
    } else if (this.swimming && moving) {
      this.stamina = Math.max(0, this.stamina - 6 * dt);
    } else {
      this.stamina = Math.min(PLAYER.maxStamina, this.stamina + PLAYER.staminaRegen * dt * (this.grounded ? 1 : 0.4));
    }
    if (this.stamina <= 0.5) this.sprinting = false;

    if (opts.survival !== false) {
      const burn = 1 + (this.sprinting ? 1.6 : 0) + (this.swimming ? 0.9 : 0);
      this.hunger = Math.max(0, this.hunger - (PLAYER.hungerRate / 60) * burn * dt);
      if (this.hunger <= 0) this.damage(1.6 * dt, 'starvation');
      else if (this.hunger < 22) this.stamina = Math.min(this.stamina, PLAYER.maxStamina * 0.55);
      else if (this.health < PLAYER.maxHealth && this.hunger > 55) {
        this.health = Math.min(PLAYER.maxHealth, this.health + 0.9 * dt);
      }
    }
    // Drowning.
    if (this.submerged > 1.0) {
      this.breath = (this.breath ?? 100) - 9 * dt;
      if (this.breath < 0) this.damage(9 * dt, 'drowning');
    } else {
      this.breath = Math.min(100, (this.breath ?? 100) + 22 * dt);
    }

    // --- head bob and steps ---
    const hspeed = Math.hypot(this.vel.x, this.vel.z);
    const targetBob = this.grounded ? clamp(hspeed / PLAYER.sprintSpeed, 0, 1) : 0;
    this.bobAmt = lerp(this.bobAmt, targetBob, 1 - Math.exp(-dt * 8));
    if (this.grounded && hspeed > 0.6) {
      const rate = (this.sprinting ? 8.4 : 5.6) * (hspeed / Math.max(1, speed));
      const before = this.stepPhase;
      this.stepPhase += dt * rate;
      if (Math.floor(before / Math.PI) !== Math.floor(this.stepPhase / Math.PI) && this.onStep) {
        this.onStep(this.submerged > 0.2 ? 'water' : 'foot', this.sprinting ? 1 : 0.6);
      }
    }
    this.bob = Math.sin(this.stepPhase) * 0.035 * this.bobAmt;
    this.landDip = lerp(this.landDip, 0, 1 - Math.exp(-dt * 9));

    // How loud is the player right now? Predators listen to this.
    this.noise = clamp(
      (this.sprinting ? 0.75 : hspeed > 0.6 ? 0.34 : 0.06) +
      (this.crouching ? -0.22 : 0) + (this.submerged > 0.2 ? 0.2 : 0), 0, 1);

    this.damageFlash = Math.max(0, this.damageFlash - dt * 1.4);
    this.shake = Math.max(0, this.shake - dt * this.shakeDecay);
    this.eyeSmooth = lerp(this.eyeSmooth, this.eye, 1 - Math.exp(-dt * 14));

    this.applyCamera(dt, opts);
  }

  applyCamera(dt, opts = {}) {
    const cam = this.camera;
    const shakeAmp = this.shake * this.shake * 0.34;
    const t = performance.now() * 0.001;
    cam.position.set(
      this.pos.x + Math.sin(this.stepPhase * 0.5) * 0.022 * this.bobAmt + Math.sin(t * 43.0) * shakeAmp * 0.5,
      this.pos.y + this.eyeSmooth + this.bob - this.landDip + Math.sin(t * 37.0) * shakeAmp * 0.6,
      this.pos.z + Math.cos(t * 51.0) * shakeAmp * 0.5
    );
    cam.rotation.set(
      this.pitch + this.recoil.x + Math.sin(t * 29.0) * shakeAmp * 0.4,
      this.yaw + this.recoil.y + Math.cos(t * 33.0) * shakeAmp * 0.35,
      Math.sin(this.stepPhase * 0.5) * 0.012 * this.bobAmt + (opts.roll ?? 0),
      'YXZ'
    );
  }

  /** Unit vector the player is looking along. */
  lookDir(out = new THREE.Vector3()) {
    const cp = Math.cos(this.pitch + this.recoil.x), sp = Math.sin(this.pitch + this.recoil.x);
    const y = this.yaw + this.recoil.y;
    return out.set(-Math.sin(y) * cp, sp, -Math.cos(y) * cp);
  }
}
