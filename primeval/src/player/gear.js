// Equipment, scanning, and the E key.
//
// Everything the player can point at, pick up, eat or shoot with is resolved
// here so game.js stays a scheduler rather than a pile of special cases.

import * as THREE from 'three';
import { Bow } from './bow.js';
import { Rifle } from './rifle.js';
import { ITEMS } from './inventory.js';
import { SPECIES, dangerWord } from '../life/species.js';
import { POI_TYPES } from '../world/poi.js';
import { BIOME_NAME, sampleSite } from '../world/field.js';
import { clamp, lerp, smoothstep } from '../math/noise.js';

export const SLOT = { NONE: 0, BOW: 1, RIFLE: 2, SCANNER: 3 };

const _ray = new THREE.Raycaster();
const _dir = new THREE.Vector3();

export class Gear {
  constructor(game) {
    this.game = game;
    this.bow = new Bow(game.scene, game.camera);
    // Built up front so the shaders compile with everything else; it simply
    // is not selectable until the armoury opens.
    this.rifle = new Rifle(game.scene, game.camera, game.fx);
    this.slot = SLOT.BOW;
    this.unlocked = { bow: true, rifle: false, mech: false };
    this.scanT = 0;
    this.scanTarget = null;
    this.scanResult = null;
    this.codex = new Set();
    this.lastScanned = null;
    this.interaction = null;
    this.harvestT = 0;

    // Effects and scoring hang off the weapons rather than living inside them.
    this.bow.onHit = (hit, dmg, killed, groundPoint) => {
      if (hit) {
        game.fx?.hitFlesh(hit.point, new THREE.Vector3(0, 0.3, 0), 0.9);
        game.hud.log(`${hit.part.toUpperCase()} hit — ${Math.round(dmg)}`, hit.part === 'head' ? 'good' : '');
        if (killed) game.emit('creatureDeath', hit.creature, 'player');
      } else if (groundPoint) {
        game.fx?.impact(groundPoint, new THREE.Vector3(0, 1, 0),
          { color: 0x8a7a63, sparks: 2, dust: 3, scale: 0.5 });
      }
    };
    this.bow.onShoot = (power) => game.emit('bowShot', power);
    this.rifle.onFire = (kind, power) => game.emit('rifleFire', kind, power);
  }

  /** Stow the viewmodels entirely — in a cockpit your hands are elsewhere. */
  setHidden(hidden) {
    if (this._hidden === hidden) return;
    this._hidden = hidden;
    this.bow.group.visible = !hidden && this.slot === SLOT.BOW;
    this.rifle.group.visible = !hidden && this.slot === SLOT.RIFLE;
    if (hidden) { this.interaction = null; this.scanT = 0; this.scanResult = null; }
  }

  equip(slot) {
    if (slot === SLOT.RIFLE && !this.unlocked.rifle) return;
    this.slot = slot;
    this.bow.equip(slot === SLOT.BOW && !this._hidden);
    this.rifle.equip(slot === SLOT.RIFLE && !this._hidden);
  }

  cycle(dir) {
    const avail = [SLOT.BOW];
    if (this.unlocked.rifle) avail.push(SLOT.RIFLE);
    avail.push(SLOT.SCANNER);
    let i = avail.indexOf(this.slot);
    if (i < 0) i = 0;
    this.equip(avail[(i + dir + avail.length) % avail.length]);
  }

  // -------------------------------------------------------------------------
  // scanning
  // -------------------------------------------------------------------------

  /** What the crosshair is on, at scanning range. */
  probeScan() {
    const g = this.game;
    const eye = g.camera.position;
    g.player.lookDir(_dir);

    const creature = g.eco?.raycast(eye, _dir, 300);
    let poiHit = null;
    if (g.poi) {
      _ray.set(eye, _dir);
      _ray.far = 160;
      const hits = _ray.intersectObjects(g.poi.group.children, false);
      if (hits.length) {
        poiHit = { dist: hits[0].distance, site: g.poi.active.find(s => s.mesh === hits[0].object) };
      }
    }
    if (creature && (!poiHit || creature.t < poiHit.dist)) {
      return { kind: 'creature', creature: creature.creature, dist: creature.t };
    }
    if (poiHit && poiHit.site) return { kind: 'poi', site: poiHit.site, dist: poiHit.dist };

    // Nothing solid — read the ground the crosshair is pointing at.
    for (let d = 6; d < 180; d *= 1.4) {
      const x = eye.x + _dir.x * d, y = eye.y + _dir.y * d, z = eye.z + _dir.z * d;
      if (g.locale.heightAt(x, z) > y) return { kind: 'terrain', x, z, dist: d };
    }
    return null;
  }

  scanPanel(target) {
    if (!target) return null;
    if (target.kind === 'creature') {
      const c = target.creature, sp = c.sp;
      const st = c.state;
      return {
        name: sp.name,
        klass: `${sp.binomial} · ${sp.klass}`,
        rows: [
          ['SPECIES', sp.name],
          ['LENGTH', `${(sp.lengthM * c.scale).toFixed(1)} m`],
          ['MASS', sp.massT >= 1 ? `${(sp.massT * c.scale).toFixed(1)} t` : `${Math.round(sp.massT * c.scale * 1000)} kg`],
          ['DIET', sp.diet],
          ['DANGER', dangerWord(sp.danger), sp.danger >= 6],
          ['STATE', c.alive ? st : 'DECEASED', st === 'CHASE' || st === 'ATTACK' || st === 'STALK'],
          ['RANGE', `${target.dist.toFixed(0)} m`],
        ],
        desc: sp.scan,
        id: `sp:${sp.id}`,
      };
    }
    if (target.kind === 'poi') {
      const t = POI_TYPES[target.site.type];
      return {
        name: t.name, klass: t.klass,
        rows: [...t.rows, ['RANGE', `${target.dist.toFixed(0)} m`]],
        desc: t.desc,
        id: `poi:${target.site.type}`,
      };
    }
    const site = sampleSite(target.x, target.z);
    return {
      name: BIOME_NAME[site.biome],
      klass: 'SURFACE COMPOSITION',
      rows: [
        ['ELEVATION', `${site.h.toFixed(0)} m`],
        ['GRADIENT', `${(site.slope * 90).toFixed(0)}°`],
        ['MOISTURE', `${(site.moist * 100).toFixed(0)}%`],
        ['THERMAL', site.hot > 0.6 ? 'ELEVATED' : 'NOMINAL', site.hot > 0.75],
        ['SURFACE WATER', site.water !== null ? 'PRESENT' : 'NONE'],
      ],
      desc: substrateNote(site),
      id: `bio:${site.biome}`,
    };
  }

  updateScan(dt, input) {
    const holding = input.down('KeyQ');
    if (!holding) {
      this.scanT = Math.max(0, this.scanT - dt * 2.5);
      if (this.scanT <= 0) { this.scanResult = null; this.scanTarget = null; }
      return;
    }
    const t = this.probeScan();
    const sameTarget = t && this.scanTarget &&
      t.kind === this.scanTarget.kind &&
      (t.creature === this.scanTarget.creature) &&
      (t.site === this.scanTarget.site);
    if (!sameTarget) { this.scanTarget = t; this.scanT = 0; this.scanResult = null; }
    if (!t) return;
    this.scanT = Math.min(1, this.scanT + dt * 1.35);
    if (this.scanT >= 1 && !this.scanResult) {
      this.scanResult = this.scanPanel(t);
      if (this.scanResult) {
        const fresh = !this.codex.has(this.scanResult.id);
        this.codex.add(this.scanResult.id);
        this.lastScanned = this.scanResult;
        this.game.emit('scan', this.scanResult, fresh, t);
      }
    }
  }

  // -------------------------------------------------------------------------
  // interaction
  // -------------------------------------------------------------------------

  /** The single best thing the E key would do right now. */
  probeInteract() {
    const g = this.game;
    const p = g.player.pos;
    const eye = g.camera.position;

    // Vehicles first — they are the biggest things nearby and the most wanted.
    if (g.ship && g.mode === 'ON_FOOT') {
      const d = g.ship.entryDistance(eye);
      if (d < 7.0) return { key: 'E', label: `BOARD ${g.ship.name}`, act: () => g.emit('enterShip') };
    }
    if (g.mechBay && g.mode === 'ON_FOOT' && this.unlocked.mech) {
      const d = eye.distanceTo(g.mechBay.position);
      if (d < 5.0) return { key: 'E', label: 'ENTER EXOSUIT', act: () => g.emit('enterMech') };
    }
    for (const t of (g.terminals ?? [])) {
      if (eye.distanceTo(t.position) < t.radius) {
        return { key: 'E', label: t.label, act: () => t.act() };
      }
    }

    // A fish, close enough to take out of the water by hand.
    const fish = g.eco?.nearest(p, 2.6, c => c.sp.aquatic && c.alive);
    if (fish) {
      return {
        key: 'E', label: `CATCH ${fish.sp.name}`,
        act: () => {
          fish.die();
          fish.harvested = true;
          g.inventory.add('fish_raw', 1 + (Math.random() < 0.3 ? 1 : 0));
          g.hud.log(`Caught a ${fish.sp.name.toLowerCase()}. Cook it aboard the ship.`, 'good');
          g.fx?.splash(fish.pos.clone(), 0.7);
          g.emit('caught', fish);
        },
      };
    }

    // A corpse you can butcher.
    const corpse = g.eco?.nearest(p, 4.2, c => !c.alive && !c.harvested);
    if (corpse) {
      return {
        key: 'E', label: `HARVEST ${corpse.sp.name}`,
        act: () => this.harvest(corpse),
      };
    }
    // A site you can loot.
    const site = g.poi?.nearest(p, 4.6);
    if (site && !site.looted) {
      return { key: 'E', label: `SEARCH ${POI_TYPES[site.type].name}`, act: () => this.loot(site) };
    }
    // Berries.
    const bush = g.veg?.nearestHarvest(p, 3.0);
    if (bush) {
      return { key: 'E', label: 'GATHER BERRIES', act: () => this.gather(bush) };
    }
    // An arrow you can pull back out.
    const arrow = this.bow.recoverable(p, 2.6);
    if (arrow) {
      return { key: 'E', label: 'RECOVER ARROW', act: () => { this.bow.recover(arrow); g.inventory.add('arrow', 1); g.hud.log('Recovered an arrow.'); } };
    }
    return null;
  }

  harvest(c) {
    c.harvested = true;
    const g = this.game;
    const loot = c.sp.loot ?? {};
    const lines = [];
    for (const [id, n] of Object.entries(loot)) {
      const key = id === 'meat' ? 'meat_raw' : id;
      if (!ITEMS[key]) continue;
      const amount = Math.max(1, Math.round(n * c.scale));
      g.inventory.add(key, amount);
      lines.push(`${amount}× ${ITEMS[key].name}`);
    }
    // Pull any arrows back out of it.
    let recovered = 0;
    for (const a of c.arrows) {
      a.parent?.remove(a);
      if (Math.random() < 0.7) recovered++;
    }
    c.arrows.length = 0;
    if (recovered) { g.inventory.add('arrow', recovered); lines.push(`${recovered}× Arrow`); }
    g.hud.log(`Harvested ${c.sp.name}: ${lines.join(', ')}`, 'good');
    g.emit('harvest', c);
  }

  loot(site) {
    site.looted = true;
    const g = this.game;
    const t = POI_TYPES[site.type];
    const lines = [];
    for (const [id, n] of t.loot) {
      g.inventory.add(id, n);
      lines.push(`${n}× ${ITEMS[id].name}`);
    }
    g.hud.log(`${t.name}: ${lines.join(', ')}`, 'good');
    g.emit('loot', site);
    if (site.type === 'nest') {
      // Taking eggs is noticed.
      g.eco?.alarm(site.pos, 160, 'attack');
      g.hud.log('Something in the trees stops making noise.', 'warn');
    }
  }

  gather(bush) {
    const g = this.game;
    g.veg.consume(bush.key);
    const n = 2 + Math.floor(Math.random() * 3);
    g.inventory.add('berries', n);
    g.hud.log(`Gathered ${n}× Sable Berries.`, 'good');
    g.emit('gather', bush);
    // Rebuild the field so the stripped bush actually disappears.
    g.veg.origin.set(1e9, 0, 1e9);
  }

  // -------------------------------------------------------------------------

  update(dt, input, ctx) {
    const g = this.game;
    if (input.hit('Digit1')) this.equip(SLOT.BOW);
    if (input.hit('Digit2') && this.unlocked.rifle) this.equip(SLOT.RIFLE);
    if (input.hit('Digit3')) this.equip(SLOT.SCANNER);
    if (input.mouse.wheel) this.cycle(input.mouse.wheel > 0 ? 1 : -1);

    this.updateScan(dt, input);

    const bowState = this.bow.update(dt, input, g.player, ctx);
    this.rifle.update(dt, input, g.player, ctx);

    this.interaction = g.mode === 'ON_FOOT' ? this.probeInteract() : null;
    if (this.interaction && input.hit('KeyE')) this.interaction.act();

    return bowState;
  }

  /** What the weapon panel should say. */
  hudState() {
    if (this.slot === SLOT.BOW) {
      const n = this.game.inventory.count('arrow');
      return {
        name: 'RECURVE BOW',
        sub: this.bow.draw > 0.85 ? 'FULL DRAW' : this.bow.draw > 0.02 ? 'DRAWING' : 'HOLD LMB TO DRAW',
        big: String(n), small: '/ 40',
        heat: this.bow.draw, overheat: false,
      };
    }
    if (this.slot === SLOT.RIFLE && this.rifle) return this.rifle.hudState();
    return {
      name: 'FIELD SCANNER', sub: 'HOLD Q TO ANALYSE',
      big: String(this.codex.size), small: 'ENTRIES', heat: this.scanT, overheat: false,
    };
  }
}

function substrateNote(site) {
  if (site.hot > 0.7) return 'Basaltic. Ground temperature above ambient; the crust here is measured in decades, not epochs.';
  if (site.water !== null) return 'Saturated. Standing water over a silt bed — soft going, loud going.';
  if (site.h > 1200) return 'Frost-shattered rock over permafrost. Very little grows. Very little hunts.';
  if (site.moist > 0.7) return 'Deep leaf litter over clay. Holds a footprint for days, which cuts both ways.';
  if (site.slope > 0.4) return 'Exposed bedrock, loose scree. Climbable, but not while being chased.';
  return 'Dry loam over weathered basalt. Root mat shallow enough to walk through without noise.';
}
