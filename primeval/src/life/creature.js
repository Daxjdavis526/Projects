// One animal: where it is, what it wants, and how its legs move while it
// gets there.
//
// Animation is entirely procedural — a gait function drives the leg bones, a
// travelling wave drives the tail, and the neck aims the skull at whatever the
// animal is currently thinking about. There are no animation clips.

import * as THREE from 'three';
import { buildCreature } from './anatomy.js';
import { creatureHeight, creatureRadius, DIET } from './species.js';
import { clamp, lerp, smoothstep, rng32 } from '../math/noise.js';

export const STATE = {
  IDLE: 'IDLE', GRAZE: 'GRAZE', WANDER: 'WANDER', DRINK: 'DRINK', SLEEP: 'SLEEP',
  ALERT: 'ALERT', INVESTIGATE: 'INVESTIGATE', STALK: 'STALK', CHASE: 'CHASE',
  ATTACK: 'ATTACK', FLEE: 'FLEE', THREATEN: 'THREATEN', DEAD: 'DEAD',
};

const _v = new THREE.Vector3();
const _v2 = new THREE.Vector3();
const _q = new THREE.Quaternion();
const _m = new THREE.Matrix4();

let NEXT_ID = 1;

export class Creature {
  constructor(species, geometry, material) {
    this.sp = species;
    this.id = NEXT_ID++;
    const built = buildCreature(species.body, 7 + this.id * 13, true);
    this.bones = built.bones;
    this.rig = built.rig;

    this.mesh = new THREE.SkinnedMesh(geometry, material);
    this.mesh.castShadow = true;
    this.mesh.receiveShadow = true;
    this.mesh.frustumCulled = true;
    this.mesh.add(this.rig.root);
    this.mesh.updateMatrixWorld(true);
    this.skeleton = new THREE.Skeleton(this.bones);
    this.mesh.bind(this.skeleton);
    this.mesh.visible = false;

    this.height = creatureHeight(species);
    this.radius = creatureRadius(species);
    this.scale = 1;

    this.pos = new THREE.Vector3();
    this.vel = new THREE.Vector3();
    this.yaw = 0;
    this.targetYaw = 0;
    this.speed = 0;
    this.gait = 0;
    this.active = false;
    this.state = STATE.IDLE;
    this.stateTime = 0;
    this.hp = species.stats.health;
    this.awareness = 0;
    this.lastKnown = new THREE.Vector3();
    this.target = null;           // Creature or 'player'
    this.wander = new THREE.Vector3();
    this.attackCd = 0;
    this.callCd = 5 + Math.random() * 20;
    this.jawOpen = 0;
    this.headLook = new THREE.Vector3();
    this.headAim = 0;
    this.pitch = 0;
    this.roll = 0;
    this.deathT = 0;
    this.deadRoll = 0;
    this.packIndex = 0;
    this.herdCenter = null;
    this.arrows = [];
    this.lastPain = -99;
    this.rng = rng32(this.id * 9176 + 3);
    this.noiseSeed = this.rng() * 100;
    this.legPhase = species.body.biped ? [0, Math.PI] : [0, Math.PI, Math.PI * 1.5, Math.PI * 0.5];
    this.scanned = false;
    this.harvested = false;
    this.submerged = 0;
  }

  get alive() { return this.state !== STATE.DEAD; }
  get isPredator() { return this.sp.diet === DIET.CARNIVORE; }

  /** Put the animal into the world. */
  spawn(x, y, z, opts = {}) {
    this.pos.set(x, y, z);
    this.vel.set(0, 0, 0);
    this.yaw = this.targetYaw = Math.random() * Math.PI * 2;
    this.scale = opts.scale ?? lerp(0.86, 1.14, this.rng());
    this.mesh.scale.setScalar(this.scale);
    this.hp = this.sp.stats.health * this.scale;
    this.state = this.isPredator ? STATE.WANDER : STATE.GRAZE;
    this.stateTime = 0;
    this.awareness = 0;
    this.target = null;
    this.active = true;
    this.mesh.visible = true;
    this.deathT = 0;
    this.scanned = false;
    this.harvested = false;
    this.packIndex = opts.packIndex ?? 0;
    this.wander.set(x + (this.rng() - 0.5) * 60, 0, z + (this.rng() - 0.5) * 60);
    for (const a of this.arrows) a.parent?.remove(a);
    this.arrows.length = 0;
  }

  despawn() {
    this.active = false;
    this.mesh.visible = false;
    for (const a of this.arrows) a.parent?.remove(a);
    this.arrows.length = 0;
  }

  /** Approximate hit volumes in world space: head, body, hips, tail. */
  hitSpheres(out = []) {
    out.length = 0;
    const s = this.scale;
    const push = (bone, r, part, mult) => {
      bone.getWorldPosition(_v);
      out.push({ x: _v.x, y: _v.y, z: _v.z, r: r * s, part, mult });
    };
    const b = this.sp.body;
    push(this.rig.head, Math.max(0.22, b.head.width * 0.85), 'head', 2.6);
    if (this.rig.neck.length) push(this.rig.neck[Math.floor(this.rig.neck.length / 2)], Math.max(0.2, b.bodyRadius * 0.55), 'neck', 1.5);
    push(this.rig.chest, b.bodyRadius * 1.05, 'body', 1.0);
    push(this.rig.hips, b.bodyRadius * 1.0, 'body', 1.0);
    if (this.rig.tail.length > 2) push(this.rig.tail[2], b.bodyRadius * 0.5, 'tail', 0.55);
    return out;
  }

  /** Ray vs this animal. Returns { t, part, mult, point } or null. */
  raycast(origin, dir, maxDist) {
    const dx = this.pos.x - origin.x, dz = this.pos.z - origin.z;
    const rough = Math.hypot(dx, dz);
    if (rough > maxDist + this.height * 2) return null;
    const spheres = this.hitSpheres();
    let best = null;
    for (const s of spheres) {
      const ox = origin.x - s.x, oy = origin.y - s.y, oz = origin.z - s.z;
      const b = ox * dir.x + oy * dir.y + oz * dir.z;
      const c = ox * ox + oy * oy + oz * oz - s.r * s.r;
      const disc = b * b - c;
      if (disc < 0) continue;
      const t = -b - Math.sqrt(disc);
      if (t < 0 || t > maxDist) continue;
      if (!best || t < best.t) {
        best = { t, part: s.part, mult: s.mult, creature: this };
      }
    }
    return best;
  }

  damage(amount, part = 'body', from = null) {
    if (!this.alive) return false;
    this.hp -= amount;
    this.lastPain = 0;
    this.awareness = 1;
    if (from) {
      this.lastKnown.copy(from);
      if (!this.target) this.target = 'player';
    }
    if (this.hp <= 0) {
      this.die();
      return true;
    }
    // Pain changes minds. Timid animals bolt; brave ones commit.
    const st = this.sp.stats;
    if (st.aggression > 0.45 || this.sp.behavior.standsGround) {
      this.setState(this.state === STATE.CHASE ? STATE.CHASE : STATE.THREATEN);
    } else {
      this.setState(STATE.FLEE);
    }
    return false;
  }

  die() {
    this.state = STATE.DEAD;
    this.stateTime = 0;
    this.deathT = 0;
    this.deadRoll = this.rng() > 0.5 ? 1 : -1;
    this.vel.set(0, 0, 0);
    this.target = null;
  }

  setState(s) {
    if (this.state === s || this.state === STATE.DEAD) return;
    this.state = s;
    this.stateTime = 0;
  }

  // -------------------------------------------------------------------------
  // senses
  // -------------------------------------------------------------------------

  /**
   * @param ctx { playerPos, playerNoise, playerVisible, dayT, world, cover }
   */
  sense(dt, ctx) {
    const st = this.sp.stats;
    const toP = _v.subVectors(ctx.playerPos, this.pos);
    const dist = toP.length();
    let gained = 0;

    // Sight: cone, range, and whatever the canopy is doing to visibility.
    const sightRange = st.sight * ctx.cover * (ctx.dayT > 0.3 ? 1 : 0.45 + this.sp.behavior.nocturnal * 0.5);
    if (dist < sightRange) {
      const fwdX = Math.sin(this.yaw), fwdZ = Math.cos(this.yaw);
      const dot = (toP.x * fwdX + toP.z * fwdZ) / Math.max(0.001, Math.hypot(toP.x, toP.z));
      const halfFov = Math.cos(st.fov / 2);
      if (dot > halfFov - 0.15) {
        // Terrain occlusion, sampled coarsely.
        let blocked = false;
        const steps = 4;
        for (let i = 1; i < steps; i++) {
          const t = i / steps;
          const sx = this.pos.x + toP.x * t, sz = this.pos.z + toP.z * t;
          const ey = lerp(this.pos.y + this.height * 0.75, ctx.playerPos.y, t);
          if (ctx.world.heightAt(sx, sz) > ey + 1.2) { blocked = true; break; }
        }
        if (!blocked) {
          const closeness = 1 - dist / sightRange;
          const motion = 0.35 + ctx.playerNoise * 0.9;
          gained += closeness * motion * 1.7 * dt;
        }
      }
    }
    // Hearing: no cone, and it works through the trees.
    const heard = ctx.playerNoise * (st.hearing / Math.max(4, dist));
    if (heard > 0.10) gained += clamp(heard, 0, 1) * 0.85 * dt;

    if (gained > 0) {
      this.awareness = clamp(this.awareness + gained, 0, 1.4);
      this.lastKnown.copy(ctx.playerPos);
      this.lastKnownAge = 0;
    } else {
      this.awareness = Math.max(0, this.awareness - dt * 0.14);
      this.lastKnownAge = (this.lastKnownAge ?? 99) + dt;
    }
    this.playerDist = dist;
    return dist;
  }

  // -------------------------------------------------------------------------
  // brain
  // -------------------------------------------------------------------------

  think(dt, ctx) {
    const st = this.sp.stats, bh = this.sp.behavior;
    this.stateTime += dt;
    this.attackCd = Math.max(0, this.attackCd - dt);
    const dist = this.playerDist ?? 999;
    const night = 1 - ctx.dayT;

    if (this.state === STATE.DEAD) return;

    // Predator vs prey among the animals themselves.
    if (this.isPredator && !this.target && this.stateTime > 1.2) {
      const prey = ctx.findPrey(this);
      if (prey) { this.target = prey; this.setState(bh.stalk ? STATE.STALK : STATE.CHASE); }
    }

    switch (this.state) {
      case STATE.GRAZE:
      case STATE.IDLE: {
        this.desiredSpeed = 0;
        this.headAim = -0.55;                      // head down, feeding
        if (this.stateTime > 5 + this.rng() * 9) this.setState(STATE.WANDER);
        if (this.awareness > 0.35) this.setState(STATE.ALERT);
        if (night > 0.75 && bh.nocturnal < 0.3 && this.rng() < dt * 0.05) this.setState(STATE.SLEEP);
        break;
      }
      case STATE.SLEEP: {
        this.desiredSpeed = 0;
        this.headAim = -0.9;
        if (this.awareness > 0.45 || ctx.dayT > 0.35) this.setState(STATE.ALERT);
        break;
      }
      case STATE.WANDER: {
        this.desiredSpeed = st.walk;
        this.headAim = -0.2;
        if (this.beached && this.lastWater) {
          this.desiredSpeed = st.run;
          this.wander.set(this.lastWater.x, 0, this.lastWater.z);
        }
        const d = _v2.subVectors(this.wander, this.pos);
        d.y = 0;
        if (d.length() < 4 || this.stateTime > 22) {
          const a = this.rng() * Math.PI * 2, r = 18 + this.rng() * 55;
          this.wander.set(this.pos.x + Math.cos(a) * r, 0, this.pos.z + Math.sin(a) * r);
          if (this.stateTime > 22) this.setState(this.isPredator ? STATE.WANDER : STATE.GRAZE);
        }
        this.steerTo(this.wander);
        if (this.awareness > 0.35) this.setState(STATE.ALERT);
        break;
      }
      case STATE.ALERT: {
        // Head up, stopped, working out what it just noticed.
        this.desiredSpeed = 0;
        this.headAim = 0.24;
        this.faceTo(this.lastKnown);
        if (this.awareness > 0.72) {
          if (this.isPredator) this.setState(bh.stalk ? STATE.STALK : STATE.CHASE);
          else if (dist < st.flee * (bh.skittish ?? 0.5) * 1.6) this.setState(STATE.FLEE);
          else if (bh.territorial > 0.5 && dist < 34) this.setState(STATE.THREATEN);
          else this.setState(bh.curiosity > 0.4 ? STATE.INVESTIGATE : STATE.GRAZE);
        } else if (this.stateTime > 4.5) {
          this.setState(bh.curiosity > 0.5 && this.awareness > 0.2 ? STATE.INVESTIGATE : STATE.GRAZE);
        }
        break;
      }
      case STATE.INVESTIGATE: {
        this.desiredSpeed = st.walk * 1.3;
        this.headAim = 0.18;
        this.steerTo(this.lastKnown);
        if (this.pos.distanceTo(this.lastKnown) < 6 || this.stateTime > 14) {
          this.setState(this.awareness > 0.7 && this.isPredator ? STATE.CHASE : STATE.ALERT);
        }
        if (this.isPredator && this.awareness > 0.8 && dist < st.sight * 0.5) this.setState(STATE.CHASE);
        break;
      }
      case STATE.STALK: {
        // Slow, low, and it stops moving whenever you might be looking.
        const tgt = this.targetPos(ctx);
        this.desiredSpeed = st.walk * 0.85;
        this.headAim = 0.05;
        this.crouch = 1;
        this.steerTo(tgt, this.flankOffset(ctx));
        const d = this.pos.distanceTo(tgt);
        if (d < st.reach * 2.4 || this.stateTime > 26 || this.awareness > 1.15) this.setState(STATE.CHASE);
        if (this.awareness < 0.35 && this.stateTime > 8) this.setState(STATE.WANDER);
        break;
      }
      case STATE.CHASE: {
        const tgt = this.targetPos(ctx);
        this.desiredSpeed = st.run;
        this.headAim = 0.1;
        this.crouch = 0;
        this.steerTo(tgt, this.flankOffset(ctx));
        const d = this.pos.distanceTo(tgt);
        if (d < st.reach) this.setState(STATE.ATTACK);
        if (this.stateTime > 26 && d > st.sight * 0.8) { this.target = null; this.setState(STATE.WANDER); }
        if (this.awareness < 0.2 && this.target === 'player' && this.stateTime > 12) { this.target = null; this.setState(STATE.WANDER); }
        break;
      }
      case STATE.ATTACK: {
        const tgt = this.targetPos(ctx);
        this.desiredSpeed = st.run * 0.35;
        this.faceTo(tgt);
        const d = this.pos.distanceTo(tgt);
        if (this.attackCd <= 0 && d < st.reach * 1.25) {
          this.attackCd = st.cooldown;
          this.jawOpen = 1;
          ctx.onAttack(this, this.target, st.damage * this.scale);
        }
        if (d > st.reach * 1.9) this.setState(STATE.CHASE);
        break;
      }
      case STATE.THREATEN: {
        // A warning, then a charge if the warning is ignored.
        this.desiredSpeed = 0;
        this.headAim = 0.3;
        this.faceTo(this.lastKnown);
        if (this.stateTime > 2.6) {
          if (dist < 26) this.setState(STATE.CHASE);
          else this.setState(STATE.ALERT);
        }
        break;
      }
      case STATE.FLEE: {
        this.desiredSpeed = st.run;
        this.headAim = 0.18;
        _v2.subVectors(this.pos, this.lastKnown).setY(0);
        if (_v2.lengthSq() < 1) _v2.set(Math.cos(this.yaw), 0, Math.sin(this.yaw));
        _v2.normalize().multiplyScalar(70).add(this.pos);
        this.steerTo(_v2);
        const far = this.pos.distanceTo(this.lastKnown);
        if (far > st.flee * 2.4 || this.stateTime > 13) this.setState(STATE.ALERT);
        break;
      }
    }

    // Ambient calls. This is most of what makes the jungle feel occupied.
    this.callCd -= dt;
    if (this.callCd <= 0) {
      const [lo, hi] = this.sp.voice.callEvery;
      this.callCd = lo + this.rng() * (hi - lo);
      ctx.onCall(this, this.state === STATE.CHASE || this.state === STATE.ATTACK ? 'roar' : 'call');
    }
  }

  targetPos(ctx) {
    if (this.target === 'player') return ctx.playerPos;
    if (this.target && this.target.active && this.target.alive) return this.target.pos;
    this.target = null;
    return this.lastKnown;
  }

  /** Pack hunters spread out instead of queueing up behind one another. */
  flankOffset(ctx) {
    if (!this.sp.behavior.pack) return null;
    const a = this.packIndex * 2.4 + ctx.time * 0.12;
    const r = 6 + this.packIndex * 2.5;
    return _v2.set(Math.cos(a) * r, 0, Math.sin(a) * r);
  }

  steerTo(target, offset = null) {
    const tx = target.x + (offset ? offset.x : 0);
    const tz = target.z + (offset ? offset.z : 0);
    this.targetYaw = Math.atan2(tx - this.pos.x, tz - this.pos.z);
  }

  faceTo(target) {
    this.targetYaw = Math.atan2(target.x - this.pos.x, target.z - this.pos.z);
  }

  // -------------------------------------------------------------------------
  // movement + pose
  // -------------------------------------------------------------------------

  update(dt, ctx, detail = 1) {
    if (!this.active) return;
    const st = this.sp.stats;

    if (this.state === STATE.DEAD) {
      this.deathT += dt;
      this.speed = lerp(this.speed, 0, 1 - Math.exp(-dt * 6));
      this.settle(dt, ctx);
      this.poseDead(dt);
      this.applyTransform(ctx);
      return;
    }

    this.sense(dt, ctx);
    this.think(dt, ctx);
    this.lastPain += dt;

    // Turn toward the heading we want, at a species-specific rate.
    let dy = this.targetYaw - this.yaw;
    while (dy > Math.PI) dy -= Math.PI * 2;
    while (dy < -Math.PI) dy += Math.PI * 2;
    const turnRate = st.turn * (1 + this.speed / Math.max(1, st.run));
    this.yaw += clamp(dy, -turnRate * dt, turnRate * dt);

    // Big animals accelerate like big animals.
    const accel = st.run / (this.sp.massT > 3 ? 3.4 : 1.5);
    const want = this.desiredSpeed ?? 0;
    this.speed += clamp(want - this.speed, -accel * 2.2 * dt, accel * dt);
    this.speed = Math.max(0, this.speed);

    // Slope slows everything down.
    const fx = Math.sin(this.yaw), fz = Math.cos(this.yaw);
    const ahead = ctx.world.heightAt(this.pos.x + fx * 3, this.pos.z + fz * 3);
    const slope = (ahead - this.pos.y) / 3;
    const slopeMul = clamp(1 - Math.max(0, slope) * 1.1, 0.25, 1.1);

    this.pos.x += fx * this.speed * slopeMul * dt;
    this.pos.z += fz * this.speed * slopeMul * dt;
    this.settle(dt, ctx);

    if (detail > 0) this.pose(dt, ctx, detail);
    this.applyTransform(ctx);
  }

  /** Ride the terrain, and float if this animal swims. */
  settle(dt, ctx) {
    const groundY = ctx.world.heightAt(this.pos.x, this.pos.z);
    const water = ctx.world.waterAt ? ctx.world.waterAt(this.pos.x, this.pos.z) : null;
    let y = groundY;
    this.submerged = 0;
    if (water !== null && water > groundY) {
      const depth = water - groundY;
      this.submerged = clamp(depth / Math.max(0.4, this.height), 0, 1);
      if (this.sp.aquatic) {
        // Hold mid-water, and remember where the water was.
        y = lerp(groundY + 0.25, water - 0.28, 0.55);
        this.lastWater = { x: this.pos.x, z: this.pos.z };
        this.beached = false;
      }
      else if (depth > this.height * 0.9) y = water - this.height * 0.85;   // swimming
      else if (this.sp.stats.amphibious && this.state === STATE.STALK) y = groundY;
    }
    if (this.sp.aquatic && (water === null || water <= groundY)) {
      // A fish that has wandered onto dry land steers straight back.
      this.beached = true;
      y = groundY + 0.1;
    }
    if (this.sp.flying) {
      const cruise = groundY + 40 + Math.sin(ctx.time * 0.3 + this.noiseSeed) * 14;
      y = lerp(this.pos.y, cruise, 1 - Math.exp(-dt * 0.7));
    }
    this.pos.y = lerp(this.pos.y, y, 1 - Math.exp(-dt * 12));

    // Pitch and roll come from the ground under the actual feet — the hips
    // and, for a quadruped, the shoulders. Sampling a fixed radius instead
    // buries anything the size of a Titanospine in the first hillside.
    const b = this.sp.body;
    const span = (b.biped ? b.bodyLength * 0.55 : b.bodyLength) * this.scale;
    const half = Math.max(0.5, b.bodyRadius * this.scale);
    const fx = Math.sin(this.yaw), fz = Math.cos(this.yaw);
    const hF = ctx.world.heightAt(this.pos.x + fx * span, this.pos.z + fz * span);
    const hB = groundY;
    const hR = ctx.world.heightAt(this.pos.x + fz * half, this.pos.z - fx * half);
    const hL = ctx.world.heightAt(this.pos.x - fz * half, this.pos.z + fx * half);
    const tp = clamp(Math.atan2(hF - hB, Math.max(0.4, span)), -0.5, 0.5);
    const tr = clamp(Math.atan2(hR - hL, Math.max(0.4, half * 2)), -0.4, 0.4);
    this.pitch = lerp(this.pitch, -tp, 1 - Math.exp(-dt * 5));
    this.roll = lerp(this.roll, tr, 1 - Math.exp(-dt * 5));
    // Stand on the higher of the two contact points so bodies do not sink.
    if (!this.sp.flying && !this.sp.aquatic && hF > this.pos.y) {
      this.pos.y = lerp(this.pos.y, Math.max(this.pos.y, (hB + hF) * 0.5), 1 - Math.exp(-dt * 8));
    }
  }

  applyTransform(ctx) {
    this.mesh.position.copy(this.pos);
    this.mesh.rotation.set(this.pitch, this.yaw, this.roll, 'YXZ');
    if (this.state === STATE.DEAD) {
      const t = Math.min(1, this.deathT * 1.6);
      this.mesh.rotation.z = this.roll + this.deadRoll * 1.42 * smoothstep(0, 1, t);
      this.mesh.position.y -= this.sp.body.bodyRadius * 0.5 * this.scale * smoothstep(0, 1, t);
    }
  }

  /** The gait. Everything below is a function of speed and time. */
  pose(dt, ctx, detail) {
    const sp = this.sp, st = sp.stats, rig = this.rig;
    const S = this.scale;
    const stride = Math.max(0.6, (sp.body.legs.thigh + sp.body.legs.shin) * 1.55 * S);
    const running = this.speed > st.walk * 1.6;
    const cyc = this.speed / stride;
    this.gait += dt * (cyc * Math.PI * 2 + (this.speed > 0.05 ? 0 : 0));
    const moving = clamp(this.speed / Math.max(0.5, st.walk), 0, 1);
    const fast = clamp(this.speed / Math.max(1, st.run), 0, 1);

    // Idle breathing keeps a standing animal alive.
    const breathe = Math.sin(ctx.time * (sp.massT > 3 ? 0.7 : 1.7) + this.noiseSeed) * 0.02;

    const swing = lerp(0.26, 0.72, fast) * moving;
    const knee = lerp(0.35, 0.95, fast) * moving;

    for (let i = 0; i < rig.legs.length; i++) {
      const leg = rig.legs[i];
      // Wings flap about the roll axis; legs swing about the pitch axis.
      if (sp.flying && leg.front) {
        const flap = Math.sin(ctx.time * 2.4 + this.noiseSeed) * (0.32 + fast * 0.5);
        leg.upper.rotation.z = leg.side * flap;
        leg.lower.rotation.z = leg.side * flap * 0.55;
        leg.ankle.rotation.z = leg.side * flap * 0.3;
        continue;
      }
      const ph = this.gait + this.legPhase[i % this.legPhase.length];
      const s = Math.sin(ph), c = Math.cos(ph);
      const lift = Math.max(0, s);
      leg.upper.rotation.x = -s * swing + (this.crouch ? 0.18 : 0) + breathe;
      leg.lower.rotation.x = lift * knee + 0.10 + (this.crouch ? 0.3 : 0);
      leg.ankle.rotation.x = -lift * knee * 0.75 - 0.08 + c * 0.12 * moving;
      leg.toe.rotation.x = lift * 0.25;
      // A little splay so quadrupeds are not knock-kneed.
      leg.upper.rotation.z = leg.side * 0.06;
    }

    // Body bob, in time with the footfalls.
    const bob = Math.sin(this.gait * 2) * 0.035 * S * (sp.body.hipHeight) * moving;
    rig.hips.position.y = rig.hips.userData.world.y - (this.crouch ? sp.body.hipHeight * 0.18 * S : 0) + bob;
    rig.hips.rotation.x = -fast * 0.10 + breathe * 2;
    rig.hips.rotation.z = Math.sin(this.gait) * 0.045 * moving;

    // Spine: lateral sway plus a lean into turns.
    let dy = this.targetYaw - this.yaw;
    while (dy > Math.PI) dy -= Math.PI * 2;
    while (dy < -Math.PI) dy += Math.PI * 2;
    const lean = clamp(dy, -1, 1) * 0.22 * fast;
    for (let i = 0; i < rig.spine.length; i++) {
      const t = (i + 1) / rig.spine.length;
      rig.spine[i].rotation.y = Math.sin(this.gait + i * 0.5) * 0.05 * moving + lean * t * 0.5;
      rig.spine[i].rotation.z = -lean * t * 0.4;
      rig.spine[i].rotation.x = breathe * 0.6;
    }

    // Tail: a travelling wave, raised when running, dropped when idle.
    for (let i = 0; i < rig.tail.length; i++) {
      const t = i / rig.tail.length;
      const b = rig.tail[i];
      b.rotation.y = Math.sin(this.gait * 0.85 - i * 0.62) * (0.06 + 0.13 * moving) * (0.4 + t);
      b.rotation.x = lerp(0.045, -0.055, fast) + Math.sin(ctx.time * 0.8 - i * 0.4) * 0.02;
      if (this.state === STATE.STALK) b.rotation.x -= 0.03;
    }

    // Neck and head. The animal looks where it is thinking.
    const aim = this.headAim ?? 0;
    const nCount = rig.neck.length;
    let lookYaw = 0;
    if (this.target || this.awareness > 0.3) {
      const tp = this.target ? this.targetPos(ctx) : this.lastKnown;
      const want = Math.atan2(tp.x - this.pos.x, tp.z - this.pos.z);
      let d = want - this.yaw;
      while (d > Math.PI) d -= Math.PI * 2;
      while (d < -Math.PI) d += Math.PI * 2;
      lookYaw = clamp(d, -1.1, 1.1);
    }
    this.headLookSmooth = lerp(this.headLookSmooth ?? 0, lookYaw, 1 - Math.exp(-dt * 3.5));
    for (let i = 0; i < nCount; i++) {
      const t = (i + 1) / nCount;
      const b = rig.neck[i];
      b.rotation.x = aim * 0.7 / nCount + Math.sin(ctx.time * 1.3 + i) * 0.012 * (1 - moving * 0.5);
      b.rotation.y = this.headLookSmooth * 0.55 / nCount;
      b.rotation.z = Math.sin(this.gait + i * 0.7) * 0.02 * moving;
    }
    rig.head.rotation.x = aim * 0.5 + Math.sin(ctx.time * 2.1 + this.noiseSeed) * 0.02;
    rig.head.rotation.y = this.headLookSmooth * 0.45;

    // Jaw. Opens to roar, to bite, and to pant after a chase.
    const pant = running ? Math.max(0, Math.sin(ctx.time * 7)) * 0.16 : 0;
    this.jawOpen = lerp(this.jawOpen, this.roaring > 0 ? 0.9 : pant, 1 - Math.exp(-dt * 9));
    this.roaring = Math.max(0, (this.roaring ?? 0) - dt);
    rig.jaw.rotation.x = -this.jawOpen * 0.85;
  }

  poseDead(dt) {
    const rig = this.rig;
    const k = 1 - Math.exp(-dt * 3);
    for (const leg of rig.legs) {
      leg.upper.rotation.x = lerp(leg.upper.rotation.x, 0.5, k);
      leg.lower.rotation.x = lerp(leg.lower.rotation.x, 1.3, k);
      leg.ankle.rotation.x = lerp(leg.ankle.rotation.x, -0.5, k);
    }
    for (let i = 0; i < rig.neck.length; i++) {
      rig.neck[i].rotation.x = lerp(rig.neck[i].rotation.x, -0.35, k);
    }
    rig.head.rotation.x = lerp(rig.head.rotation.x, -0.5, k);
    rig.jaw.rotation.x = lerp(rig.jaw.rotation.x, -0.35, k);
    for (let i = 0; i < rig.tail.length; i++) {
      rig.tail[i].rotation.y = lerp(rig.tail[i].rotation.y, 0, k * 0.6);
      rig.tail[i].rotation.x = lerp(rig.tail[i].rotation.x, 0.06, k * 0.6);
    }
  }

  roar() { this.roaring = 1.1; }

  /** Stick an arrow into whatever part it hit; it rides along from then on. */
  attachArrow(mesh, worldPoint, part) {
    let bone = this.rig.chest;
    if (part === 'head') bone = this.rig.head;
    else if (part === 'neck') bone = this.rig.neck[Math.floor(this.rig.neck.length / 2)] ?? this.rig.chest;
    else if (part === 'tail') bone = this.rig.tail[2] ?? this.rig.hips;
    bone.updateMatrixWorld(true);
    _m.copy(bone.matrixWorld).invert();
    mesh.position.copy(worldPoint).applyMatrix4(_m);
    mesh.scale.setScalar(1 / Math.max(0.001, this.scale));
    bone.add(mesh);
    this.arrows.push(mesh);
    if (this.arrows.length > 8) {
      const old = this.arrows.shift();
      old.parent?.remove(old);
    }
  }
}
