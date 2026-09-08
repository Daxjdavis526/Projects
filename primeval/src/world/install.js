// Wires the world systems into a Game. Kept separate so game.js does not need
// to know the full cast.

import * as THREE from 'three';
import { clamp } from '../math/noise.js';
import { Vegetation } from './vegetation.js';
import { Water } from './water.js';
import { Ecology } from '../life/ecology.js';
import { PointsOfInterest } from './poi.js';
import { VehicleSystem } from './vehicles.js';
import { Weather } from './weather.js';
import { Clouds } from './clouds.js';
import { Audio } from '../audio/audio.js';
import { lavaUniform } from './terrain.js';
import { SPECIES } from '../life/species.js';

export function installWorld(game) {
  game.addSystem(new WeatherSystem());
  game.addSystem(new VehicleSystem());
  game.addSystem(new PoiSystem());
  game.addSystem(new WaterSystem());
  game.addSystem(new VegetationSystem());
  game.addSystem(new LifeSystem());
  game.addSystem(new SoundSystem());
  game.addSystem(new Director());
  return game;
}

/**
 * Set pieces. Small, rare, and hand-placed: the opening titles, and the beat
 * where THERA introduces itself about six seconds after you first stand on it.
 */
class Director {
  async load(game) {
    this.t = 0;
    this.opening = 0;
    this.firstLandingT = -1;
    this.greeted = false;

    // Only for the real opening; a debug spawn straight onto THERA skips it.
    game.on('start', () => { if (game.locale.id === 'moon') this.opening = 0.01; });
    game.on('shipLanded', () => {
      if (game.locale.id === 'planet' && !this.greeted) this.firstLandingT = 0;
    });
    game.on('disembarked', () => {
      if (game.locale.id === 'planet' && !this.greeted && this.firstLandingT < 0) this.firstLandingT = 0;
    });
    game.on('unlock', (what) => {
      game.hud.cinematic(true, what === 'rifle'
        ? 'ARMOURY UNSEALED · SUNDER PULSE LANCE'
        : 'FABRICATION COMPLETE · BASTION EXOSUIT');
      this.clearIn = 4.5;
    });
  }

  update(dt, game) {
    this.t += dt;

    // --- opening titles ---------------------------------------------------
    if (this.opening > 0) {
      const before = this.opening;
      this.opening += dt;
      const lines = [
        [0.0, 'ANVIL STATION · SURVEY ROTATION 4'],
        [3.6, 'THERA is 402,000 kilometres below you.'],
        [7.4, 'Survey Site ECHO-7 is waiting. So is everything else.'],
        [11.2, null],
      ];
      for (const [at, text] of lines) {
        if (before < at && this.opening >= at) {
          if (text) game.hud.cinematic(true, text);
          else { game.hud.cinematic(false); this.opening = -1; }
        }
      }
      if (before < 0.02) game.hud.cinematic(true, lines[0][1]);
    }

    if (this.clearIn > 0) {
      this.clearIn -= dt;
      if (this.clearIn <= 0) game.hud.cinematic(false);
    }

    // --- first contact ----------------------------------------------------
    if (this.firstLandingT >= 0) {
      this.firstLandingT += dt;
      if (this.firstLandingT > 6.5) {
        this.greeted = true;
        this.firstLandingT = -1;
        // Something enormous, a long way off, in a direction you cannot see.
        const p = game.camera.position;
        const a = Math.random() * Math.PI * 2;
        const at = new THREE.Vector3(p.x + Math.cos(a) * 520, p.y + 30, p.z + Math.sin(a) * 520);
        game.audio?.voice(at, { pitch: 0.22, power: 1.0, length: 2.6, rasp: 0.8, kind: 'roar' });
        game.hud.subtitle('Something enormous, a long way off', 4.5);
        game.player.addShake(0.08);
      }
    }
  }
}

class LifeSystem {
  async load(game) {
    this.eco = new Ecology(game.scene, game.quality, game.textures);
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

class WeatherSystem {
  async load(game) {
    this.weather = new Weather(game.scene, game.quality);
    game.weather = this.weather;
    this.clouds = new Clouds(game.scene, game.quality);
    game.clouds = this.clouds;
    this.weather.onEvent = (kind, text) => {
      game.hud.subtitle(text, 5);
      game.emit('worldEvent', kind, text);
    };
    this.weather.onThunder = (dist) => game.emit('thunder', dist);
  }
  update(dt, game) {
    this.weather.update(dt, game);
    if (game.locale.id === 'planet') this.clouds.update(dt, game);
    else this.clouds.setVisible(false);
    lavaUniform.value = 0.35 + game.daylight.nightT * 1.5;
    // Lightning washes the screen for a frame or two.
    const grade = game.renderer.grade.uniforms;
    if (this.weather.lightning > 0.01) {
      grade.uVignette.value *= 1 - this.weather.lightning * 0.4;
    }
  }
}

class PoiSystem {
  async load(game) {
    this.poi = new PointsOfInterest(game.scene, game.quality);
    game.poi = this.poi;
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
    this.veg = new Vegetation(game.scene, game.quality, game.textures);
    game.veg = this.veg;
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

class SoundSystem {
  async load(game) {
    this.audio = new Audio();
    game.audio = this.audio;
    this.fwd = new THREE.Vector3();
    this.up = new THREE.Vector3();
    this.chargeVoice = null;

    game.on('start', () => { this.audio.start(); this.audio.resume(); });

    // --- the player -------------------------------------------------------
    game.player.onStep = (kind, power) => {
      const p = game.camera.position;
      if (kind === 'water') this.audio.burst(p, { freq: 900, q: 0.8, length: 0.22, peak: 0.22 * power });
      else if (kind === 'land') this.audio.burst(p, { freq: 220, q: 0.7, length: 0.26, peak: 0.4 * power });
      else this.audio.burst(p, { freq: 430, q: 1.4, length: 0.10, peak: 0.13 * power });
    };

    // --- creatures ---------------------------------------------------------
    game.on('creatureCall', (c, kind) => {
      const v = c.sp.voice;
      this.audio.voice(c.pos, {
        pitch: v.pitch, power: kind === 'roar' ? 1.0 : 0.62,
        length: kind === 'roar' ? 1.6 / Math.max(0.3, v.pitch) * 0.5 + 0.9 : 0.7,
        rasp: 0.5 + c.sp.danger * 0.05, kind,
      });
      // A roar close enough to matter also shakes you.
      const d = c.pos.distanceTo(game.camera.position);
      if (kind === 'roar' && d < 70 && c.sp.stats.roarShake) {
        game.player.addShake(c.sp.stats.roarShake * (1 - d / 70));
        game.hud.subtitle(`${c.sp.name} — CLOSE`, 2.2);
      } else if (kind === 'roar' && d < 900 && c.sp.danger >= 8) {
        game.hud.subtitle(`Distant roar · ${Math.round(d)} m`, 2.6);
      }
    });
    game.on('creatureAttack', (c) => {
      this.audio.voice(c.pos, { pitch: c.sp.voice.pitch * 1.2, power: 1, length: 0.55, kind: 'roar' });
      this.audio.burst(c.pos, { freq: 260, q: 0.9, length: 0.18, peak: 0.4 });
    });
    game.on('creatureDeath', (c) => {
      this.audio.voice(c.pos, { pitch: c.sp.voice.pitch * 0.85, power: 0.8, length: 1.5, rasp: 1.0 });
      this.audio.burst(c.pos, { freq: 150, q: 0.6, length: 0.7, peak: 0.3 });
    });
    game.on('playerHit', () => {
      this.audio.burst(game.camera.position, { freq: 180, q: 0.5, length: 0.3, peak: 0.5, refDistance: 1 });
    });

    // --- weapons -----------------------------------------------------------
    game.on('bowShot', (power) => {
      const p = game.camera.position;
      this.audio.burst(p, { freq: 1400, q: 3.0, length: 0.09, peak: 0.16 + power * 0.14, refDistance: 2 });
      this.audio.zap(p, { f0: 320, f1: 90, length: 0.16, peak: 0.10, noise: 0.9, type: 'triangle' });
    });
    game.on('rifleFire', (kind, power) => {
      const p = game.camera.position;
      if (kind === 'shot') this.audio.zap(p, { f0: 2600, f1: 160, length: 0.22, peak: 0.42, noise: 0.5 });
      else if (kind === 'charged') {
        this.audio.zap(p, { f0: 900, f1: 44, length: 1.5, peak: 0.75, noise: 0.7, type: 'square' });
        this.audio.thunder(60);
      } else if (kind === 'vent') this.audio.burst(p, { freq: 3200, q: 0.6, length: 0.65, peak: 0.22, refDistance: 2 });
      else if (kind === 'overheat') this.audio.zap(p, { f0: 700, f1: 120, length: 0.5, peak: 0.3, noise: 0.9, type: 'square' });
    });

    // --- machines ----------------------------------------------------------
    game.on('mechStep', (kind, power) => {
      this.audio.burst(game.mech.pos, { freq: 90, q: 0.8, length: 0.35, peak: 0.55 * power, refDistance: 9 });
      this.audio.burst(game.mech.pos, { freq: 1800, q: 2.0, length: 0.10, peak: 0.10 * power, refDistance: 9 });
    });
    game.on('mechLand', (impact) => {
      this.audio.burst(game.mech.pos, { freq: 62, q: 0.7, length: 0.9, peak: Math.min(0.9, 0.4 + impact * 0.5), refDistance: 14 });
      this.audio.thunder(30);
    });
    game.on('mechFire', () => this.audio.zap(game.mech.muzzleWorld, { f0: 1400, f1: 90, length: 0.3, peak: 0.5, noise: 0.6 }));
    game.on('mechPunch', (hit) => {
      this.audio.burst(game.mech.pos, { freq: hit ? 150 : 900, q: 0.8, length: hit ? 0.4 : 0.14, peak: hit ? 0.6 : 0.2, refDistance: 8 });
    });
    game.on('thunder', (dist) => this.audio.thunder(dist));
    game.on('splash', (p) => this.audio.burst(p, { freq: 1200, q: 0.7, length: 0.3, peak: 0.3 }));
    game.on('shipLaunch', () => this.audio.thunder(40));
    game.on('transitStart', () => this.audio.zap(game.camera.position, { f0: 60, f1: 1400, length: 2.4, peak: 0.5, noise: 0.5, type: 'sawtooth' }));
  }

  update(dt, game) {
    const a = this.audio;
    if (!a.ready) return;
    const cam = game.camera;
    this.fwd.set(0, 0, -1).applyQuaternion(cam.quaternion);
    this.up.set(0, 1, 0).applyQuaternion(cam.quaternion);
    const w = game.weather ? game.weather.audioState(game) : {
      wind: 0.2, rain: 0, river: 0, volcano: 0, quake: 0, insects: 0, nightChorus: 0,
    };
    const ship = game.ship;
    const inShip = game.mode === 'SHIP';
    const inMech = game.mode === 'MECH';
    a.update(dt, {
      position: cam.position, forward: this.fwd, up: this.up,
      atmosphere: game.atmosphere,
      altitudeT: clamp((cam.position.y - 200) / 8000, 0, 1),
      interior: game.locale.id === 'moon' && game.mode === 'ON_FOOT'
        && game.station && Math.hypot(cam.position.x - game.moonSite.x, cam.position.z - game.moonSite.z) < 34,
      ...w,
      engine: {
        level: ship ? (inShip ? ship.burn * 1.0 : ship.burn * 0.35) : 0,
        speed: ship ? ship.speed : 0,
        heat: ship ? ship.entryHeat : 0,
      },
      servo: inMech ? clamp(Math.hypot(game.mech.vel.x, game.mech.vel.z) / 14, 0, 1) : 0,
    });
  }
}

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
