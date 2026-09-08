// Population manager: who is alive near you, and who is about to be.
//
// Animals are pooled per species and streamed in a ring around the player —
// far enough out that they are already going about their business when you
// first see them, close enough that the world is never empty.

import * as THREE from 'three';
import { SPECIES, SPECIES_LIST, DIET, creatureHeight } from './species.js';
import { Creature, STATE } from './creature.js';
import { buildCreature, makeCreatureMaterial } from './anatomy.js';
import { sampleSite, heightAt, waterAt, BIOME } from '../world/field.js';
import { clamp, lerp, hash2, smoothstep } from '../math/noise.js';
import { injectCurve } from '../world/shaders.js';

/** How far you can see through each biome, as a multiplier on sight range. */
const COVER = {
  [BIOME.OCEAN]: 1.0, [BIOME.BEACH]: 1.0, [BIOME.JUNGLE]: 0.42,
  [BIOME.PLAINS]: 1.0, [BIOME.SWAMP]: 0.55, [BIOME.HIGHLAND]: 0.9,
  [BIOME.VOLCANIC]: 0.8, [BIOME.ALPINE]: 1.0,
};

export class Ecology {
  constructor(scene, quality) {
    this.scene = scene;
    this.quality = quality;
    this.group = new THREE.Group();
    this.group.name = 'life';
    scene.add(this.group);

    this.material = injectCurve(makeCreatureMaterial());
    this.geometries = new Map();
    this.pools = new Map();
    this.live = [];
    this.time = 0;
    this.budget = quality.maxDinos;
    this.spawnTimer = 0;
    this.events = { onAttack: null, onCall: null, onDeath: null };
    this.playerNoise = 0;
    this.dayT = 1;
    this.corpses = [];
    this.enabled = true;
    this._sph = [];
  }

  /** Build every species' skin once, up front. */
  prepare() {
    for (const sp of SPECIES_LIST) {
      if (this.geometries.has(sp.id)) continue;
      const built = buildCreature(sp.body, 7 + sp.name.length * 13);
      this.geometries.set(sp.id, built.geometry);
      this.pools.set(sp.id, []);
    }
  }

  _obtain(sp) {
    const pool = this.pools.get(sp.id);
    for (const c of pool) if (!c.active) return c;
    if (pool.length >= (sp.spawn.maxAlive ?? 4) + 2) return null;
    const c = new Creature(sp, this.geometries.get(sp.id), this.material);
    this.group.add(c.mesh);
    pool.push(c);
    return c;
  }

  countAlive(sp) {
    let n = 0;
    for (const c of this.live) if (c.sp === sp && c.active) n++;
    return n;
  }

  spawnRadius(sp) { return clamp(140 + sp.lengthM * 24, 170, 560); }
  despawnRadius(sp) { return this.spawnRadius(sp) * 1.9 + 120; }

  /**
   * Weighted pick of a species suited to a spot, or null if nothing lives here.
   */
  pickSpecies(site, night) {
    let total = 0;
    const opts = [];
    for (const sp of SPECIES_LIST) {
      if (sp.spawn.aquatic) continue;            // fish are placed separately
      const w0 = sp.spawn.biomes[site.biome];
      if (!w0) continue;
      if (sp.spawn.nearWater && site.river < 0.12 && site.water === null) continue;
      if (this.countAlive(sp) >= (sp.spawn.maxAlive ?? 4)) continue;
      let w = w0 * sp.spawn.weight;
      // Night shifts the roster toward the things that hunt in it.
      w *= lerp(1, 0.35 + (sp.behavior.nocturnal ?? 0) * 2.2, night);
      total += w;
      opts.push({ sp, w });
    }
    if (!total) return null;
    let r = Math.random() * total;
    for (const o of opts) { r -= o.w; if (r <= 0) return o.sp; }
    return opts[opts.length - 1].sp;
  }

  /** Try to place one animal (or a whole herd) somewhere out around the player. */
  trySpawn(px, pz, forward) {
    if (this.live.length >= this.budget) return false;
    const night = 1 - this.dayT;
    for (let attempt = 0; attempt < 8; attempt++) {
      // Bias placement behind and to the sides so animals are not seen to pop in.
      const a = Math.random() * Math.PI * 2;
      const behind = -(forward.x * Math.cos(a) + forward.z * Math.sin(a));
      if (behind < -0.35 && Math.random() < 0.6) continue;
      const r = lerp(150, 470, Math.random());
      const x = px + Math.cos(a) * r, z = pz + Math.sin(a) * r;
      const site = sampleSite(x, z);
      if (site.h < 0.5) continue;
      const sp = this.pickSpecies(site, night);
      if (!sp) continue;
      if (r > this.spawnRadius(sp)) continue;
      if (sp.spawn.minDistance && r < sp.spawn.minDistance) continue;
      if (sp.rare && Math.random() > 0.12) continue;

      const herd = sp.behavior.herd ?? 1;
      const n = herd > 1 ? 1 + Math.floor(Math.random() * herd) : 1;
      let placed = 0;
      for (let i = 0; i < n; i++) {
        if (this.live.length >= this.budget) break;
        if (this.countAlive(sp) >= (sp.spawn.maxAlive ?? 4)) break;
        const spread = (sp.behavior.spacing ?? 8) * Math.sqrt(i);
        const aa = Math.random() * Math.PI * 2;
        const cx = x + Math.cos(aa) * spread, cz = z + Math.sin(aa) * spread;
        const h = heightAt(cx, cz);
        if (h < 0.4) continue;
        const c = this._obtain(sp);
        if (!c) break;
        c.spawn(cx, h, cz, { packIndex: i });
        this.live.push(c);
        placed++;
      }
      return placed > 0;
    }
    return false;
  }

  /** Explicitly place a named species near a point — used by set pieces. */
  spawnAt(speciesId, x, z, opts = {}) {
    const sp = SPECIES[speciesId];
    if (!sp) return null;
    const c = this._obtain(sp);
    if (!c) return null;
    c.spawn(x, heightAt(x, z), z, opts);
    this.live.push(c);
    return c;
  }

  /** Nearest living animal to a point, optionally filtered. */
  nearest(pos, maxDist = 200, filter = null) {
    let best = null, bestD = maxDist * maxDist;
    for (const c of this.live) {
      if (!c.active || !c.alive) continue;
      if (filter && !filter(c)) continue;
      const dx = c.pos.x - pos.x, dz = c.pos.z - pos.z, dy = c.pos.y - pos.y;
      const d2 = dx * dx + dy * dy + dz * dz;
      if (d2 < bestD) { bestD = d2; best = c; }
    }
    return best;
  }

  /** Ray against every animal. Returns the closest hit or null. */
  raycast(origin, dir, maxDist = 260, skip = null) {
    let best = null;
    for (const c of this.live) {
      if (!c.active || c === skip) continue;
      const hit = c.raycast(origin, dir, maxDist);
      if (hit && (!best || hit.t < best.t)) best = hit;
    }
    return best;
  }

  /** What a predator would like to eat, nearby. */
  findPrey(hunter) {
    const st = hunter.sp.stats;
    let best = null, bestScore = -1;
    for (const c of this.live) {
      if (!c.active || !c.alive || c === hunter) continue;
      if (c.sp.diet === DIET.CARNIVORE && c.sp.massT >= hunter.sp.massT * 0.7) continue;
      if (c.sp.massT > hunter.sp.massT * 3.2) continue;      // too big to bother
      const d = hunter.pos.distanceTo(c.pos);
      if (d > st.sight * 0.9) continue;
      const score = (1 - d / st.sight) * (c.sp.massT + 0.05) * (c.state === STATE.SLEEP ? 1.6 : 1);
      if (score > bestScore) { bestScore = score; best = c; }
    }
    return best;
  }

  /** Anything nearby that a herd would react to. */
  alarm(origin, radius, source) {
    for (const c of this.live) {
      if (!c.active || !c.alive) continue;
      const d = c.pos.distanceTo(origin);
      if (d > radius) continue;
      c.awareness = Math.min(1.4, c.awareness + (1 - d / radius) * 0.9);
      c.lastKnown.copy(origin);
      if (c.sp.behavior.standsGround && source === 'attack') c.setState(STATE.THREATEN);
      else if (!c.isPredator && c.sp.behavior.skittish) c.setState(STATE.FLEE);
    }
  }

  update(dt, ctx) {
    if (!this.enabled) return;
    this.time += dt;
    const px = ctx.playerPos.x, pz = ctx.playerPos.z;
    const site = sampleSite(px, pz);
    const cover = COVER[site.biome] ?? 1;

    const cctx = {
      playerPos: ctx.playerPos,
      playerNoise: ctx.playerNoise,
      dayT: this.dayT,
      world: ctx.world,
      cover,
      time: this.time,
      findPrey: (h) => this.findPrey(h),
      onAttack: (c, target, dmg) => this.handleAttack(c, target, dmg, ctx),
      onCall: (c, kind) => {
        if (kind === 'roar') c.roar();
        this.events.onCall?.(c, kind);
      },
    };

    // Streaming.
    this.spawnTimer -= dt;
    if (this.spawnTimer <= 0) {
      this.spawnTimer = 0.55;
      if (this.live.length < this.budget) this.trySpawn(px, pz, ctx.forward);
    }

    for (let i = this.live.length - 1; i >= 0; i--) {
      const c = this.live[i];
      const dx = c.pos.x - px, dz = c.pos.z - pz;
      const d = Math.hypot(dx, dz);
      if (d > this.despawnRadius(c.sp) || (!c.alive && c.deathT > 150)) {
        c.despawn();
        this.live.splice(i, 1);
        continue;
      }
      // Distant animals still move and think; they just stop bothering with
      // knees and tail waves.
      const detail = d < 130 ? 1 : d < 320 ? 0.5 : 0;
      if (detail === 0.5 && (i + Math.floor(this.time * 30)) % 2) {
        c.update(dt, cctx, 0);
      } else {
        c.update(dt, cctx, detail);
      }
    }

    // Eyeshine: bright enough to catch the bloom, so a predator in the dark
    // reads as two points of light before it reads as an animal.
    this.material.userData.eye.value = smoothstep(0.5, 0.0, this.dayT) * 6.5;
  }

  handleAttack(c, target, dmg, ctx) {
    c.roar();
    if (target === 'player') {
      ctx.onPlayerHit?.(c, dmg);
    } else if (target && target.active) {
      const killed = target.damage(dmg, 'body', c.pos);
      this.alarm(target.pos, 70, 'attack');
      if (killed) {
        this.events.onDeath?.(target, c);
        c.target = null;
        c.setState(STATE.IDLE);
      }
    }
    this.events.onAttack?.(c, target, dmg);
  }

  /** Every animal within a radius, for the scanner and the HUD. */
  within(pos, radius) {
    const out = [];
    for (const c of this.live) {
      if (!c.active) continue;
      if (c.pos.distanceTo(pos) <= radius) out.push(c);
    }
    return out;
  }

  clear() {
    for (const c of this.live) c.despawn();
    this.live.length = 0;
  }
}
