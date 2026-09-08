// SUNDER — the pulse lance in the ANVIL armoury.
//
// No magazines. A battery, a heat sink, and the strong suggestion that this
// was never meant to be carried around a Cretaceous floodplain.

import * as THREE from 'three';
import { Hull } from '../ship/model.js';
import { clamp, lerp, smoothstep } from '../math/noise.js';

const BODY = [0.085, 0.090, 0.098];
const BODY_LIT = [0.155, 0.162, 0.172];
const STEEL = [0.28, 0.29, 0.31];
const TRIM = [0.70, 0.32, 0.06];
const CORE = [0.30, 0.90, 1.0];
const HOT = [1.0, 0.42, 0.10];

function buildRifle() {
  const h = new Hull();
  const plate = (x0, y0, z0, x1, y1, z1, col, e = 0) => {
    const v = [
      h.vert(x0, y0, z0, col, e), h.vert(x1, y0, z0, col, e), h.vert(x1, y0, z1, col, e), h.vert(x0, y0, z1, col, e),
      h.vert(x0, y1, z0, col, e), h.vert(x1, y1, z0, col, e), h.vert(x1, y1, z1, col, e), h.vert(x0, y1, z1, col, e),
    ];
    h.quad(v[0], v[3], v[2], v[1]); h.quad(v[4], v[5], v[6], v[7]);
    h.quad(v[0], v[1], v[5], v[4]); h.quad(v[1], v[2], v[6], v[5]);
    h.quad(v[2], v[3], v[7], v[6]); h.quad(v[3], v[0], v[4], v[7]);
  };

  // Receiver: a long angular block. -Z is forward.
  plate(-0.055, -0.045, -0.30, 0.055, 0.075, 0.28, BODY);
  plate(-0.062, 0.055, -0.24, 0.062, 0.088, 0.20, BODY_LIT);
  // Top rail with a holographic sight.
  plate(-0.020, 0.088, -0.20, 0.020, 0.108, 0.10, STEEL);
  plate(-0.032, 0.108, -0.10, 0.032, 0.175, -0.045, BODY_LIT);
  h.slab([[-0.026, 0.118, -0.052], [0.026, 0.118, -0.052],
    [0.026, 0.168, -0.052], [-0.026, 0.168, -0.052]], 0.004, CORE, 1);

  // Energy chamber: an exposed core between two collars.
  h.tube(-0.02, 0.16, 0.052, 0.052, 12, STEEL, 0, 0, 0.015);
  h.tube(0.0, 0.14, 0.040, 0.040, 12, CORE, 1.0, 0, 0.015);
  for (let i = 0; i < 4; i++) {
    h.tube(0.01 + i * 0.037, 0.022 + i * 0.037, 0.062, 0.062, 12, BODY_LIT, 0, 0, 0.015);
  }

  // Barrel shroud with cooling vents.
  h.tube(-0.62, -0.06, 0.036, 0.030, 10, BODY_LIT, 0, 0, 0.012);
  for (let i = 0; i < 7; i++) {
    const z = -0.58 + i * 0.072;
    h.tube(z, z + 0.026, 0.046, 0.046, 10, STEEL, 0, 0, 0.012);
    h.slab([[-0.048, 0.010, z + 0.004], [0.048, 0.010, z + 0.004],
      [0.048, 0.010, z + 0.022], [-0.048, 0.010, z + 0.022]], 0.008, HOT, 0.55);
  }
  // Muzzle: a four-prong emitter.
  h.tube(-0.70, -0.60, 0.030, 0.048, 10, BODY, 0, 0, 0.012);
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * Math.PI * 2 + 0.4;
    const x = Math.cos(a) * 0.040, y = 0.012 + Math.sin(a) * 0.040;
    h.tube(-0.80, -0.68, 0.010, 0.014, 5, STEEL, 0, x, y);
  }
  h.tube(-0.71, -0.695, 0.026, 0.026, 10, CORE, 1.0, 0, 0.012);

  // Under-barrel capacitor.
  plate(-0.040, -0.098, -0.42, 0.040, -0.040, 0.02, BODY);
  h.slab([[-0.034, -0.092, -0.40], [0.034, -0.092, -0.40],
    [0.034, -0.092, -0.02], [-0.034, -0.092, -0.02]], 0.008, CORE, 0.85);

  // Grip and stock.
  const g = new Hull();
  plate(-0.032, -0.24, 0.10, 0.032, -0.03, 0.20, BODY);
  plate(-0.046, -0.02, 0.24, 0.046, 0.070, 0.40, BODY_LIT);
  plate(-0.030, -0.10, 0.30, 0.030, -0.01, 0.42, BODY);
  // Hazard trim.
  h.slab([[-0.058, 0.052, 0.16], [0.058, 0.052, 0.16],
    [0.058, 0.052, 0.24], [-0.058, 0.052, 0.24]], 0.006, TRIM);
  return h.build();
}

export class Rifle {
  constructor(scene, camera, fx) {
    this.scene = scene;
    this.camera = camera;
    this.fx = fx;
    this.material = new THREE.MeshStandardMaterial({
      vertexColors: true, roughness: 0.42, metalness: 0.68, side: THREE.DoubleSide,
    });
    const emisU = { value: 1 };
    const heatU = { value: 0 };
    this.emisU = emisU; this.heatU = heatU;
    this.material.onBeforeCompile = (sh) => {
      sh.uniforms.uEmis = emisU;
      sh.uniforms.uHeat = heatU;
      sh.vertexShader = 'attribute float aEmis;\nvarying float vEmis;\nvarying vec3 vLoc;\n' + sh.vertexShader;
      sh.vertexShader = sh.vertexShader.replace('#include <begin_vertex>',
        '#include <begin_vertex>\n vEmis = aEmis; vLoc = position;');
      sh.fragmentShader = 'uniform float uEmis;\nuniform float uHeat;\nvarying float vEmis;\nvarying vec3 vLoc;\n' + sh.fragmentShader;
      sh.fragmentShader = sh.fragmentShader.replace('#include <emissivemap_fragment>', `
        #include <emissivemap_fragment>
        totalEmissiveRadiance += diffuseColor.rgb * vEmis * uEmis * 6.0;
        // The barrel glows from the muzzle back as heat builds.
        float bar = smoothstep(0.1, -0.75, vLoc.z);
        totalEmissiveRadiance += vec3(1.4, 0.35, 0.06) * bar * uHeat * uHeat * 2.2;
      `);
    };
    this.material.customProgramCacheKey = () => 'primeval-rifle';

    this.group = new THREE.Group();
    this.mesh = new THREE.Mesh(buildRifle(), this.material);
    this.group.add(this.mesh);
    camera.add(this.group);
    this.group.scale.setScalar(0.86);
    this.group.position.set(0.20, -0.20, -0.34);
    this.group.rotation.set(0.02, 0.10, 0.0);
    this.group.visible = false;

    this.equipped = false;
    this.energy = 100;
    this.heat = 0;
    this.overheated = false;
    this.charge = 0;
    this.cooldown = 0;
    this.aiming = 0;
    this.recoil = 0;
    this.ventLock = 0;
    this.onFire = null;
  }

  equip(on) {
    this.equipped = on;
    this.group.visible = on;
    if (!on) { this.charge = 0; }
  }

  update(dt, input, player, ctx) {
    this.cooldown = Math.max(0, this.cooldown - dt);
    this.ventLock = Math.max(0, this.ventLock - dt);
    this.recoil = lerp(this.recoil, 0, 1 - Math.exp(-dt * 11));

    if (this.equipped && !player.frozen) {
      this.aiming = clamp(this.aiming + (input.held(2) && this.charge <= 0 ? dt * 6 : -dt * 6), 0, 1);

      // Primary.
      if (input.held(0) && this.cooldown <= 0 && !this.overheated && this.energy > 3 && this.ventLock <= 0) {
        this.firePrimary(player, ctx);
      }
      // Secondary: hold RMB while not aiming to spool the charge.
      const charging = input.held(2) && !this.overheated && this.energy > 22 && this.ventLock <= 0;
      if (charging) {
        this.charge = clamp(this.charge + dt / 1.5, 0, 1);
        this.aiming = 0;
      } else if (this.charge > 0) {
        if (this.charge > 0.45) this.fireCharged(player, ctx);
        this.charge = 0;
      }
      if (input.hit('KeyR') && this.heat > 3) {
        this.heat = Math.max(0, this.heat - 55);
        this.ventLock = 1.1;
        this.onFire?.('vent');
      }
    } else {
      this.charge = lerp(this.charge, 0, 1 - Math.exp(-dt * 8));
      this.aiming = lerp(this.aiming, 0, 1 - Math.exp(-dt * 8));
    }

    const cool = this.overheated ? 26 : 15;
    this.heat = Math.max(0, this.heat - cool * dt);
    if (this.overheated && this.heat < 18) this.overheated = false;
    this.energy = Math.min(100, this.energy + 3.4 * dt);

    this.heatU.value = clamp(this.heat / 100, 0, 1);
    this.emisU.value = 0.35 + this.charge * 3.0 + (this.overheated ? 0 : 0.5);
    this.pose(dt, player);
  }

  firePrimary(player, ctx) {
    this.cooldown = 0.17;
    this.energy -= 3.2;
    this.heat = Math.min(100, this.heat + 8.5);
    if (this.heat >= 100) { this.overheated = true; this.onFire?.('overheat'); }

    const origin = player.eyePosition;
    const dir = player.lookDir(new THREE.Vector3());
    this.shoot(origin, dir, ctx, {
      damage: 115, color: 0x9fe8ff, width: 0.055, scale: 1, pierce: 1,
    });
    player.addRecoil(0.021, (Math.random() - 0.5) * 0.010);
    player.addShake(0.10);
    this.recoil = 1;
    this.onFire?.('shot');
  }

  fireCharged(player, ctx) {
    const power = smoothstep(0.45, 1.0, this.charge);
    this.cooldown = 0.75;
    this.energy -= 20 + power * 14;
    this.heat = Math.min(100, this.heat + 34 + power * 22);
    if (this.heat >= 100) { this.overheated = true; this.onFire?.('overheat'); }

    const origin = player.eyePosition;
    const dir = player.lookDir(new THREE.Vector3());
    this.shoot(origin, dir, ctx, {
      damage: 380 + power * 560, color: 0xd9b6ff, width: 0.26, scale: 3.2, pierce: 4,
    });
    player.addRecoil(0.085 * power, (Math.random() - 0.5) * 0.02);
    player.addShake(0.75 * power);
    this.recoil = 3.2;
    this.onFire?.('charged', power);
  }

  /** Hitscan with limited penetration. Big shots go through more than one. */
  shoot(origin, dir, ctx, { damage, color, width, scale, pierce }) {
    let remaining = pierce;
    let from = origin.clone();
    let end = origin.clone().addScaledVector(dir, 520);
    const hitCreatures = [];
    let travelled = 0;

    while (remaining > 0) {
      const hit = ctx.eco?.raycast(from, dir, 520 - travelled, null);
      if (!hit) break;
      const point = from.clone().addScaledVector(dir, hit.t);
      if (hitCreatures.includes(hit.creature)) break;
      hitCreatures.push(hit.creature);
      const killed = hit.creature.damage(damage * hit.mult, hit.part, origin);
      this.fx.hitFlesh(point, dir, scale * 0.8);
      this.fx.flash(point, { color: 0xff9a6a, size: 0.7 * scale, life: 0.12 });
      ctx.eco.alarm(point, 240, 'attack');
      if (killed) ctx.onKill?.(hit.creature);
      travelled += hit.t + 0.4;
      from = point.clone().addScaledVector(dir, 0.4);
      remaining--;
      end = point;
      if (remaining <= 0) break;
    }

    // Terrain stop.
    let terrainPoint = null;
    for (let d = 2; d < 520; d *= 1.22) {
      const x = origin.x + dir.x * d, y = origin.y + dir.y * d, z = origin.z + dir.z * d;
      if (ctx.world.heightAt(x, z) > y) {
        // Refine.
        let lo = d / 1.22, hi = d;
        for (let i = 0; i < 12; i++) {
          const mid = (lo + hi) / 2;
          const px = origin.x + dir.x * mid, py = origin.y + dir.y * mid, pz = origin.z + dir.z * mid;
          if (ctx.world.heightAt(px, pz) > py) hi = mid; else lo = mid;
        }
        terrainPoint = origin.clone().addScaledVector(dir, hi);
        break;
      }
    }
    if (terrainPoint && (!hitCreatures.length || terrainPoint.distanceTo(origin) < end.distanceTo(origin))) {
      end = terrainPoint;
      const n = new THREE.Vector3(0, 1, 0);
      this.fx.impact(end, n, { color, scale: scale * 0.9, sparks: 10 * scale, dust: 6 * scale });
      this.fx.light(end, color, 40 * scale, 0.25, 30 * scale);
    } else if (!hitCreatures.length) {
      end = origin.clone().addScaledVector(dir, 520);
    }

    // The visible bolt.
    const muzzle = origin.clone().addScaledVector(dir, 1.0);
    this.fx.beam(muzzle, end, { color, width, life: 0.10 + scale * 0.03 });
    this.fx.flash(muzzle, { color, size: 0.5 * scale, life: 0.09 });
    this.fx.light(muzzle, color, 26 * scale, 0.14, 26 * scale);
    ctx.makeNoise?.(origin, 1.0, 420 * scale);
  }

  pose(dt, player) {
    const g = this.group;
    const t = performance.now() * 0.001;
    const aim = this.aiming;
    const sway = (1 - aim * 0.7) * 0.010;
    const kick = this.recoil;
    g.position.set(
      lerp(0.20, 0.0, aim) + Math.sin(t * 1.2) * sway + player.bob * 0.4,
      lerp(-0.20, -0.088, aim) + Math.cos(t * 1.6) * sway + player.bob * 0.7 - this.charge * 0.012,
      lerp(-0.34, -0.26, aim) + kick * 0.035
    );
    g.rotation.set(
      lerp(0.02, 0.0, aim) + kick * 0.12,
      lerp(0.10, 0.0, aim),
      lerp(0.03, 0.0, aim) + Math.sin(t * 0.9) * sway * 0.5
    );
    g.scale.setScalar(lerp(0.86, 0.80, aim));
  }

  hudState() {
    return {
      name: 'SUNDER PULSE LANCE',
      sub: this.overheated ? 'THERMAL LOCK — VENTING'
        : this.charge > 0.02 ? `CHARGING ${(this.charge * 100).toFixed(0)}%`
          : 'LMB PULSE · RMB CHARGE · R VENT',
      big: `${Math.round(this.energy)}`,
      small: '% CELL',
      heat: this.heat / 100,
      overheat: this.overheated,
    };
  }
}
