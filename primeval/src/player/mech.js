// Driving the BASTION.
//
// The whole design brief for this thing is momentum: it should feel like four
// tonnes of powered armour that can cross a ridge in three bounds and land
// hard enough to stagger whatever is standing there.

import * as THREE from 'three';
import { buildMech } from './mechmodel.js';
import { MECH } from '../config.js';
import { clamp, lerp, smoothstep } from '../math/noise.js';

const _v = new THREE.Vector3();
const _d = new THREE.Vector3();

export class Mech {
  constructor(scene, camera) {
    const art = buildMech();
    this.art = art;
    this.group = art.group;
    scene.add(this.group);
    this.camera = camera;

    this.pos = new THREE.Vector3();
    this.vel = new THREE.Vector3();
    this.yaw = 0;
    this.pitch = 0;
    this.grounded = false;
    this.piloted = false;
    this.deployed = false;      // has it been brought down to THERA
    this.thirdPerson = false;

    this.armor = MECH.maxArmor;
    this.energy = MECH.maxEnergy;
    this.boost = MECH.maxBoost;
    this.heat = 0;
    this.overheated = false;
    this.gait = 0;
    this.crouch = 0;
    this.landImpact = 0;
    this.punchT = 0;
    this.fireT = 0;
    this.boosting = 0;
    this.shake = 0;
    this.stepPhase = 0;
    this.onStep = null;
    this.onFire = null;
    this.onLand = null;
    this.onPunch = null;
    this.chase = new THREE.Vector3();
    this.group.visible = false;
  }

  place(x, y, z, yaw = 0) {
    this.pos.set(x, y, z);
    this.vel.set(0, 0, 0);
    this.yaw = yaw;
    this.group.visible = true;
    this.sync();
  }

  sync() {
    this.group.position.copy(this.pos);
    this.group.rotation.y = this.yaw;
  }

  get forward() { return _d.set(-Math.sin(this.yaw), 0, -Math.cos(this.yaw)); }
  get muzzleWorld() {
    this.art.cannonMuzzle.updateWorldMatrix(true, false);
    return new THREE.Vector3().setFromMatrixPosition(this.art.cannonMuzzle.matrixWorld);
  }

  lookDir(out = new THREE.Vector3()) {
    const cp = Math.cos(this.pitch), sp = Math.sin(this.pitch);
    return out.set(-Math.sin(this.yaw) * cp, sp, -Math.cos(this.yaw) * cp);
  }

  damage(n) {
    this.armor = Math.max(0, this.armor - n);
    this.shake = Math.min(1.4, this.shake + n / 260);
    return this.armor <= 0;
  }

  update(dt, input, game) {
    const world = game.locale;
    const grav = world.gravity;

    if (this.piloted) this.control(dt, input, game);

    // --- motion ------------------------------------------------------------
    const ax = this.piloted ? input.moveAxis() : { x: 0, z: 0 };
    const sprinting = this.piloted && input.any(['ShiftLeft', 'ShiftRight']) && ax.z > 0.1;
    const speed = sprinting ? MECH.sprintSpeed : MECH.walkSpeed;
    const fwd = this.forward.clone();
    const right = _v.set(Math.cos(this.yaw), 0, -Math.sin(this.yaw));
    const want = new THREE.Vector3()
      .addScaledVector(fwd, ax.z).addScaledVector(right, ax.x);
    if (want.lengthSq() > 0) want.normalize().multiplyScalar(speed);

    const accel = this.grounded ? 16 : 4.5;
    const k = 1 - Math.exp(-dt * accel);
    this.vel.x = lerp(this.vel.x, want.x, k);
    this.vel.z = lerp(this.vel.z, want.z, k);
    this.vel.y -= grav * dt * 1.25;      // heavy: falls faster than a person

    // --- boost -------------------------------------------------------------
    const wantBoost = this.piloted && input.down('Space');
    if (wantBoost && this.grounded) {
      this.vel.y = MECH.jumpSpeed;
      this.grounded = false;
      this.boost = Math.max(0, this.boost - 8);
      this.onStep?.('jump', 1);
    } else if (wantBoost && !this.grounded && this.boost > 0) {
      this.vel.y += MECH.boostForce * dt;
      this.boost = Math.max(0, this.boost - 26 * dt);
      this.boosting = 1;
      // Boost also gives lateral authority — this is how you cross terrain.
      this.vel.x += want.x * dt * 2.4;
      this.vel.z += want.z * dt * 2.4;
    }
    this.boosting = lerp(this.boosting, wantBoost && !this.grounded && this.boost > 0 ? 1 : 0,
      1 - Math.exp(-dt * 10));
    if (this.grounded) this.boost = Math.min(MECH.maxBoost, this.boost + 16 * dt);

    this.pos.addScaledVector(this.vel, dt);

    // --- ground ------------------------------------------------------------
    if (game.colliders) game.colliders.resolve(this.pos, MECH.radius, MECH.height, MECH.stepUp);
    const groundY = world.heightAt(this.pos.x, this.pos.z);
    const colY = game.colliders
      ? game.colliders.surfaceAt(this.pos.x, this.pos.z, this.pos.y + MECH.stepUp, MECH.radius) : -Infinity;
    const floor = Math.max(groundY, colY);
    const wasGrounded = this.grounded;
    if (this.pos.y <= floor + 0.001) {
      if (!wasGrounded && this.vel.y < -6) {
        const impact = -this.vel.y;
        this.landImpact = clamp(impact / 22, 0, 1.6);
        this.shake = Math.min(1.6, this.shake + this.landImpact * 0.9);
        this.onLand?.(this.landImpact, this.pos.clone());
        // Anything standing where you land has a bad time.
        if (impact > 13 && game.eco) {
          for (const c of game.eco.live) {
            if (!c.active || !c.alive) continue;
            const d = c.pos.distanceTo(this.pos);
            if (d < 9) c.damage(clamp((1 - d / 9) * impact * 5, 0, 400), 'body', this.pos);
          }
          game.eco.alarm(this.pos, 220, 'attack');
        }
        if (impact > 34) this.damage((impact - 34) * 6);
      }
      this.pos.y = floor;
      this.vel.y = Math.max(0, this.vel.y);
      this.grounded = true;
    } else {
      this.grounded = false;
    }
    this.vel.x *= this.grounded ? 1 : 1;

    // --- weapons -----------------------------------------------------------
    this.fireT = Math.max(0, this.fireT - dt);
    this.punchT = Math.max(0, this.punchT - dt);
    if (this.piloted && !this.overheated) {
      if (input.held(0) && this.fireT <= 0 && this.energy > 2) {
        this.fire(game);
      }
      if (input.click(2) && this.punchT <= 0) this.punch(game);
    }
    if (this.piloted && input.hit('KeyR') && this.heat > 4) {
      this.heat = Math.max(0, this.heat - 45);
      this.onFire?.('vent');
    }
    this.heat = Math.max(0, this.heat - (this.overheated ? 34 : 17) * dt);
    if (this.heat <= 12) this.overheated = false;
    this.energy = Math.min(MECH.maxEnergy, this.energy + 9 * dt);
    this.armor = Math.min(MECH.maxArmor, this.armor + 4 * dt);

    this.shake = Math.max(0, this.shake - dt * 2.2);
    this.landImpact = lerp(this.landImpact, 0, 1 - Math.exp(-dt * 6));

    this.animate(dt, game);
    this.sync();
    if (this.piloted) this.driveCamera(dt, input);
  }

  control(dt, input, game) {
    const s = input.sensitivity;
    this.yaw -= input.mouse.dx * s;
    this.pitch = clamp(this.pitch - input.mouse.dy * s, -1.2, 1.0);
    if (input.hit('KeyV')) this.thirdPerson = !this.thirdPerson;
  }

  fire(game) {
    this.fireT = 0.14;
    this.energy -= 2.6;
    this.heat = Math.min(100, this.heat + 5.4);
    if (this.heat >= 100) { this.overheated = true; }
    const origin = this.muzzleWorld;
    const dir = this.lookDir();
    const hit = game.eco?.raycast(origin, dir, 420);
    let point = null;
    if (hit) {
      point = origin.clone().addScaledVector(dir, hit.t);
      hit.creature.damage(150 * hit.mult, hit.part, this.pos);
      game.eco.alarm(point, 200, 'attack');
    } else {
      // Terrain.
      for (let d = 4; d < 420; d *= 1.25) {
        const x = origin.x + dir.x * d, y = origin.y + dir.y * d, z = origin.z + dir.z * d;
        if (game.locale.heightAt(x, z) > y) { point = new THREE.Vector3(x, y, z); break; }
      }
    }
    this.onFire?.('shot', origin, point ?? origin.clone().addScaledVector(dir, 400), hit);
    this.shake = Math.min(1.0, this.shake + 0.10);
  }

  punch(game) {
    this.punchT = 0.55;
    const origin = this.pos.clone().addScaledVector(this.forward, 2.6).setY(this.pos.y + 2.4);
    let hitOne = null;
    if (game.eco) {
      for (const c of game.eco.live) {
        if (!c.active || !c.alive) continue;
        if (c.pos.distanceTo(origin) < 4.6) {
          c.damage(420, 'body', this.pos);
          hitOne = c;
          break;
        }
      }
    }
    this.onPunch?.(origin, hitOne);
    this.shake = Math.min(1.2, this.shake + 0.22);
  }

  animate(dt, game) {
    const a = this.art;
    const speed = Math.hypot(this.vel.x, this.vel.z);
    const moving = clamp(speed / MECH.walkSpeed, 0, 1.6);
    const stride = 3.4;
    const before = this.gait;
    this.gait += (speed / stride) * dt * Math.PI * 2;
    if (this.grounded && speed > 1 &&
      Math.floor(before / Math.PI) !== Math.floor(this.gait / Math.PI)) {
      this.onStep?.('foot', clamp(speed / MECH.sprintSpeed, 0.3, 1));
      this.shake = Math.min(0.7, this.shake + 0.06 * clamp(speed / 10, 0.3, 1));
    }

    // Legs.
    const compress = this.landImpact * 0.55 + this.crouch * 0.3;
    for (let i = 0; i < a.legs.length; i++) {
      const leg = a.legs[i];
      const ph = this.gait + (i === 0 ? 0 : Math.PI);
      const s = Math.sin(ph), lift = Math.max(0, s);
      if (this.grounded) {
        leg.hip.rotation.x = -s * 0.34 * moving - compress * 0.4;
        leg.knee.rotation.x = lift * 0.72 * moving + 0.16 + compress * 0.95;
        leg.ankle.rotation.x = -lift * 0.48 * moving - 0.10 - compress * 0.5;
      } else {
        // Tucked in the air, trailing on the way down.
        const t = clamp(-this.vel.y / 14, -1, 1);
        leg.hip.rotation.x = lerp(leg.hip.rotation.x, -0.35 + t * 0.3, 1 - Math.exp(-dt * 6));
        leg.knee.rotation.x = lerp(leg.knee.rotation.x, 0.8 - t * 0.4, 1 - Math.exp(-dt * 6));
        leg.ankle.rotation.x = lerp(leg.ankle.rotation.x, -0.4, 1 - Math.exp(-dt * 6));
      }
    }
    a.hips.position.y = 2.28 - compress * 0.55 + Math.sin(this.gait * 2) * 0.055 * moving;
    a.hips.rotation.z = Math.sin(this.gait) * 0.035 * moving;
    a.torso.rotation.y = lerp(a.torso.rotation.y, 0, 1 - Math.exp(-dt * 5));
    a.torso.rotation.x = lerp(a.torso.rotation.x, clamp(-this.pitch * 0.28, -0.3, 0.3) + moving * 0.06,
      1 - Math.exp(-dt * 6));
    a.head.rotation.x = lerp(a.head.rotation.x, -this.pitch * 0.5, 1 - Math.exp(-dt * 8));

    // Arms: the cannon tracks the aim, the fist winds up for a punch.
    const cannon = a.arms[1];
    const recoil = this.fireT / 0.14;
    cannon.shoulder.rotation.x = lerp(cannon.shoulder.rotation.x,
      -1.35 - this.pitch * 0.55 + recoil * 0.16, 1 - Math.exp(-dt * 14));
    cannon.elbow.rotation.x = lerp(cannon.elbow.rotation.x, 0.28 - recoil * 0.1, 1 - Math.exp(-dt * 12));
    const fist = a.arms[0];
    const p = this.punchT / 0.55;
    const swing = p > 0.65 ? (1 - p) / 0.35 : p / 0.65;
    fist.shoulder.rotation.x = lerp(fist.shoulder.rotation.x,
      -swing * 1.9 + Math.sin(this.gait) * 0.22 * moving, 1 - Math.exp(-dt * 18));
    fist.elbow.rotation.x = lerp(fist.elbow.rotation.x, 0.5 - swing * 0.45, 1 - Math.exp(-dt * 16));

    // Thrusters.
    a.flameMat.opacity = this.boosting * (0.55 + Math.sin(performance.now() * 0.05) * 0.15);
    for (const t of a.thrusters) t.scale.y = 0.4 + this.boosting * 1.4;
    a.emisU.value = 0.7 + this.boosting * 1.2 + (this.heat / 100) * 1.6;
    a.light.intensity = this.piloted ? 12 : 0;
    a.material.emissiveIntensity = 1;
  }

  driveCamera(dt, input) {
    const cam = this.camera;
    const shakeAmp = this.shake * this.shake * 0.10;
    const t = performance.now() * 0.001;
    if (this.thirdPerson) {
      const back = this.forward.clone().multiplyScalar(-11);
      const want = this.pos.clone().add(back).add(new THREE.Vector3(0, 6.4, 0));
      this.chase.lerp(want, 1 - Math.exp(-dt * 7));
      cam.position.copy(this.chase);
      cam.up.set(0, 1, 0);
      cam.lookAt(this.pos.clone().add(new THREE.Vector3(0, 3.0, 0)).addScaledVector(this.forward, 5));
    } else {
      // Seated in the chest, behind the visor.
      const eye = new THREE.Vector3(0, MECH.eyeHeight - this.landImpact * 0.5, -0.15);
      eye.applyAxisAngle(new THREE.Vector3(0, 1, 0), this.yaw);
      cam.position.copy(this.pos).add(eye);
      cam.up.set(0, 1, 0);
      cam.rotation.set(this.pitch, this.yaw, 0, 'YXZ');
    }
    if (shakeAmp > 0.0001) {
      cam.position.x += Math.sin(t * 44) * shakeAmp * 3.2;
      cam.position.y += Math.sin(t * 37) * shakeAmp * 3.2;
      cam.rotateZ(Math.sin(t * 29) * shakeAmp * 0.4);
    }
  }

  hudState() {
    return {
      armor: this.armor, armorMax: MECH.maxArmor,
      energy: this.energy, boost: this.boost, heat: this.heat,
    };
  }
}
