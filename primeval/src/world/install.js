// Wires the world systems into a Game. Kept separate so game.js does not need
// to know the full cast.

import * as THREE from 'three';
import { clamp } from '../math/noise.js';
import { Vegetation } from './vegetation.js';
import { Water } from './water.js';
import { Ecology } from '../life/ecology.js';
import { PointsOfInterest } from './poi.js';
import { SPECIES } from '../life/species.js';

export function installWorld(game) {
  game.addSystem(new PoiSystem());
  game.addSystem(new WaterSystem());
  game.addSystem(new VegetationSystem());
  game.addSystem(new LifeSystem());
  return game;
}

class LifeSystem {
  async load(game) {
    this.eco = new Ecology(game.scene, game.quality);
    this.eco.prepare();
    game.eco = this.eco;
    this.forward = new THREE.Vector3(0, 0, 1);

    this.eco.events.onCall = (c, kind) => game.emit('creatureCall', c, kind);
    this.eco.events.onDeath = (c, killer) => game.emit('creatureDeath', c, killer);
    this.eco.events.onAttack = (c, target, dmg) => game.emit('creatureAttack', c, target, dmg);

    // ?spawn=ashmaw drops one in front of you. For screenshots and for
    // finding out how a new species looks without walking for ten minutes.
    const want = new URLSearchParams(location.search).get('spawn');
    if (want) {
      const p = game.player.pos;
      const fx = -Math.sin(game.player.yaw), fz = -Math.cos(game.player.yaw);
      const ids = want.split(',').filter(id => SPECIES[id]);
      let lateral = 0;
      for (const id of ids) {
        const sp = SPECIES[id];
        const d = 14 + sp.lengthM * 1.3;
        lateral += sp.lengthM * 0.75;
        const c = this.eco.spawnAt(id, p.x + fx * d - fz * lateral, p.z + fz * d + fx * lateral);
        if (c) { c.yaw = c.targetYaw = game.player.yaw + Math.PI; c.desiredSpeed = 0; }
        lateral += sp.lengthM * 0.75;
      }
    }
  }

  update(dt, game) {
    if (game.locale.id !== 'planet') { this.eco.group.visible = false; return; }
    this.eco.group.visible = true;
    this.eco.dayT = game.daylight.dayT;
    const cam = game.camera.position;
    this.forward.set(-Math.sin(game.player.yaw), 0, -Math.cos(game.player.yaw));
    this.eco.update(dt, {
      playerPos: cam,
      playerNoise: game.mode === 'ON_FOOT' ? game.player.noise : 1.0,
      world: game.locale,
      forward: this.forward,
      onPlayerHit: (c, dmg) => {
        const p = game.player;
        p.damage(dmg * (game.damageScale ?? 1), c.sp.name);
        // Knocked back, hard, in the direction the animal is facing.
        p.vel.x += Math.sin(c.yaw) * Math.min(11, dmg * 0.1);
        p.vel.z += Math.cos(c.yaw) * Math.min(11, dmg * 0.1);
        p.vel.y += Math.min(5, dmg * 0.035);
        p.addShake(clamp(dmg / 90, 0.2, 1.1));
        game.emit('playerHit', c, dmg);
      },
    });
    // Animals are solid. Walking into a Titanospine's leg should stop you.
    if (game.mode === 'ON_FOOT' || game.mode === 'MECH') {
      const p = game.player.pos;
      const rad = game.mode === 'MECH' ? 1.5 : 0.45;
      for (const c of this.eco.live) {
        if (!c.active) continue;
        const dx = p.x - c.pos.x, dz = p.z - c.pos.z;
        const rr = c.radius * c.scale + rad;
        const d2 = dx * dx + dz * dz;
        if (d2 >= rr * rr || d2 < 1e-6) continue;
        if (p.y > c.pos.y + c.height * c.scale) continue;
        const d = Math.sqrt(d2), push = (rr - d) / d;
        p.x += dx * push; p.z += dz * push;
      }
    }
  }
}

class PoiSystem {
  async load(game) {
    this.poi = new PointsOfInterest(game.scene, game.quality);
    game.poi = this.poi;
    const p = game.player.pos;
    this.poi.update(0, p.x, p.z);
  }
  update(dt, game) {
    if (game.locale.id !== 'planet') { this.poi.group.visible = false; return; }
    this.poi.group.visible = true;
    const c = game.camera.position;
    this.poi.update(dt, c.x, c.z);
  }
}

class WaterSystem {
  async load(game) {
    this.water = new Water(game.scene, game.quality);
    game.water = this.water;
    const p = game.player.pos;
    this.water.update(0, p.x, p.z);
    let guard = 0;
    while (this.water.job && guard++ < 200) this.water._stepJob();
  }

  update(dt, game) {
    if (game.locale.id !== 'planet') { this.water.setVisible(false); return; }
    this.water.setVisible(true);
    const c = game.camera.position;
    this.water.update(dt, c.x, c.z);
    this.water.syncLighting(game.daylight, game.storm);
  }
}

class VegetationSystem {
  async load(game) {
    this.veg = new Vegetation(game.scene, game.quality);
    game.veg = this.veg;
    const p = game.player.pos;
    // Grow the whole first field before the player ever sees the ground.
    this.veg.update(0, p.x, p.z, p.y);
    let guard = 0;
    while (this.veg.job && guard++ < 400) this.veg._stepJob();
  }

  update(dt, game) {
    if (game.locale.id !== 'planet') { this.veg.group.visible = false; return; }
    const c = game.camera.position;
    this.veg.update(dt, c.x, c.z, c.y);
    this.veg.setNightGlow(game.daylight.nightT);
    // Trunks are solid. Push the player out of any they are standing in.
    if (game.mode === 'ON_FOOT') pushOut(game.player.pos, 0.42, this.veg.treeColliders);
  }
}

const _d = new THREE.Vector2();

/** Shove a point out of a list of vertical cylinders. */
export function pushOut(pos, radius, cylinders) {
  for (const c of cylinders) {
    if (pos.y > c.y + c.h || pos.y + 1.8 < c.y) continue;
    const dx = pos.x - c.x, dz = pos.z - c.z;
    const rr = c.r + radius;
    const d2 = dx * dx + dz * dz;
    if (d2 >= rr * rr || d2 < 1e-8) continue;
    const d = Math.sqrt(d2);
    const push = (rr - d) / d;
    pos.x += dx * push;
    pos.z += dz * push;
  }
}
