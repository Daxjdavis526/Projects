// Points of interest: the reasons to walk somewhere specific.
//
// Sites are chosen deterministically from the world seed, so the fossil bed
// you found at grid 14,-3 is there when you come back with a bigger gun.

import * as THREE from 'three';
import { heightAt, sampleSite, slopeAt, BIOME } from './field.js';
import { hash2, clamp, lerp, rng32 } from '../math/noise.js';
import { injectCurve } from './shaders.js';
import { mergeGeometries, paint, sway } from './props.js';

const CELL = 620;          // one candidate site per 620 m cell

export const POI_TYPES = {
  probe: {
    name: 'CRASHED PROBE', klass: 'SALVAGE',
    loot: [['probe', 1], ['cell', 1], ['arrow', 6]],
    desc: 'Survey drone, impact-deformed. Anthropic-standard telemetry package, still cycling on reserve power. It has been down for eleven years.',
    rows: [['ORIGIN', 'THERA SURVEY 3'], ['STATE', 'INERT'], ['USE', 'SALVAGE / POWER CELL']],
  },
  fossil: {
    name: 'FOSSIL BED', klass: 'GEOLOGICAL',
    loot: [['fossil', 2], ['sample', 1]],
    desc: 'Exposed lakebed shale. The animals in this layer are not the animals walking on top of it, which means THERA has done this before.',
    rows: [['COMPOSITION', 'CALCAREOUS SHALE'], ['AGE', 'DEEP'], ['USE', 'SURVEY DATA']],
  },
  crystal: {
    name: 'CRYSTAL VENT', klass: 'MINERAL',
    loot: [['crystal', 3], ['ore', 1]],
    desc: 'Silicate needles grown in a still-warm lava tube. Piezoelectric under load — the station fabricator will take everything you can carry.',
    rows: [['COMPOSITION', 'SILICATE / TRACE IRIDIUM'], ['RARITY', 'UNCOMMON'], ['USE', 'WEAPON FABRICATION']],
  },
  nest: {
    name: 'NEST MOUND', klass: 'BIOLOGICAL',
    loot: [['egg', 2], ['sample', 1]],
    desc: 'Vegetation mound, internally heated by rot to within a degree of body temperature. The parent is not far. The parent is never far.',
    rows: [['SPECIES', 'INDETERMINATE'], ['CLUTCH', 'ACTIVE'], ['DANGER', 'PARENT NEARBY', true]],
  },
  outcrop: {
    name: 'ORE OUTCROP', klass: 'MINERAL',
    loot: [['ore', 3]],
    desc: 'Ferrite nodules weathered out of the host rock. Unusually pure, which suggests a very quiet geological history for this ridge.',
    rows: [['COMPOSITION', 'FERRITE'], ['RARITY', 'COMMON'], ['USE', 'REPAIR / FABRICATION']],
  },
  monolith: {
    name: 'FRACTURE SPIRE', klass: 'GEOLOGICAL',
    loot: [['sample', 1]],
    desc: 'Columnar jointing, exposed by erosion, standing forty metres clear of the surrounding country. Nothing built it. It only looks that way.',
    rows: [['COMPOSITION', 'BASALT COLUMN'], ['ORIGIN', 'NATURAL'], ['USE', 'NAVIGATION LANDMARK']],
  },
  camp: {
    name: 'FIELD CACHE', klass: 'SALVAGE',
    loot: [['arrow', 10], ['meat_cooked', 1], ['cell', 1]],
    desc: 'Supply cache from an earlier survey rotation. Beacon dead, seals intact. Somebody meant to come back for this.',
    rows: [['ORIGIN', 'THERA SURVEY 2'], ['STATE', 'SEALED'], ['USE', 'RESUPPLY']],
  },
};

// --- meshes ----------------------------------------------------------------

function probeMesh(seed) {
  const r = rng32(seed), parts = [];
  const hull = new THREE.IcosahedronGeometry(0.9, 1);
  hull.scale(1.3, 0.75, 1.0);
  parts.push(sway(paint(hull, new THREE.Color(0x39413f), new THREE.Color(0x767f7c)), 0));
  for (let i = 0; i < 3; i++) {
    const a = r() * Math.PI * 2;
    const leg = new THREE.CylinderGeometry(0.05, 0.03, 1.5, 5);
    leg.rotateZ(0.7 + r() * 0.3);
    leg.rotateY(a);
    leg.translate(Math.cos(a) * 0.7, -0.15, Math.sin(a) * 0.7);
    parts.push(sway(paint(leg, new THREE.Color(0x2a2e2d), new THREE.Color(0x4b514f)), 0));
  }
  const dish = new THREE.SphereGeometry(0.6, 12, 6, 0, Math.PI * 2, 0, Math.PI * 0.42);
  dish.rotateX(-2.1);
  dish.translate(0.3, 0.75, -0.4);
  parts.push(sway(paint(dish, new THREE.Color(0x8a9490), new THREE.Color(0xcfd6d2)), 0));
  const g = mergeGeometries(parts);
  g.rotateZ(0.34);
  g.translate(0, 0.55, 0);
  return g;
}

function fossilMesh(seed) {
  const r = rng32(seed), parts = [];
  const slab = new THREE.BoxGeometry(3.4, 0.35, 2.6);
  slab.translate(0, 0.16, 0);
  parts.push(sway(paint(slab, new THREE.Color(0x4d4a41), new THREE.Color(0x8b8577)), 0));
  // A ribcage arcing out of the rock.
  for (let i = 0; i < 7; i++) {
    const t = i / 6;
    const rib = new THREE.TorusGeometry(0.42 + Math.sin(t * Math.PI) * 0.3, 0.035, 4, 10, Math.PI);
    rib.rotateY(Math.PI / 2);
    rib.translate(-1.2 + t * 2.4, 0.30, 0);
    parts.push(sway(paint(rib, new THREE.Color(0xb9b0a0), new THREE.Color(0xded7c8)), 0));
  }
  const spine = new THREE.CylinderGeometry(0.06, 0.06, 2.7, 6);
  spine.rotateZ(Math.PI / 2);
  spine.translate(0, 0.33, 0);
  parts.push(sway(paint(spine, new THREE.Color(0xc9c1b1), new THREE.Color(0xe6e0d2)), 0));
  return mergeGeometries(parts);
}

function crystalMesh(seed) {
  const r = rng32(seed), parts = [];
  const base = new THREE.IcosahedronGeometry(1.1, 0);
  base.scale(1.5, 0.6, 1.5);
  parts.push(sway(paint(base, new THREE.Color(0x1c1512), new THREE.Color(0x3a2a20)), 0));
  for (let i = 0; i < 9; i++) {
    const a = r() * Math.PI * 2, d = r() * 1.1;
    const h = 0.5 + r() * 1.7;
    const c = new THREE.ConeGeometry(0.10 + r() * 0.10, h, 5);
    c.rotateZ((r() - 0.5) * 0.6);
    c.rotateY(a);
    c.translate(Math.cos(a) * d, h * 0.5 + 0.2, Math.sin(a) * d);
    parts.push(sway(paint(c, new THREE.Color(0x3a1a52), new THREE.Color(0xd07bff)), 0));
  }
  return mergeGeometries(parts);
}

function nestMesh(seed) {
  const r = rng32(seed), parts = [];
  const mound = new THREE.SphereGeometry(2.0, 14, 8, 0, Math.PI * 2, 0, Math.PI * 0.5);
  mound.scale(1, 0.42, 1);
  parts.push(sway(paint(mound, new THREE.Color(0x2e2a1c), new THREE.Color(0x574f34)), 0));
  const bowl = new THREE.SphereGeometry(1.1, 12, 6, 0, Math.PI * 2, 0, Math.PI * 0.5);
  bowl.scale(1, -0.3, 1);
  bowl.translate(0, 0.92, 0);
  parts.push(sway(paint(bowl, new THREE.Color(0x1a1710), new THREE.Color(0x2b2618)), 0));
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * Math.PI * 2 + r();
    const e = new THREE.SphereGeometry(0.30, 10, 7);
    e.scale(1, 1.32, 1);
    e.translate(Math.cos(a) * 0.42, 0.80, Math.sin(a) * 0.42);
    parts.push(sway(paint(e, new THREE.Color(0x9c9276), new THREE.Color(0xd8cfb4)), 0));
  }
  return mergeGeometries(parts);
}

function outcropMesh(seed) {
  const r = rng32(seed), parts = [];
  for (let i = 0; i < 5; i++) {
    const g = new THREE.IcosahedronGeometry(0.5 + r() * 1.1, 0);
    const a = r() * Math.PI * 2, d = r() * 1.4;
    g.translate(Math.cos(a) * d, 0.3 + r() * 0.6, Math.sin(a) * d);
    parts.push(sway(paint(g, new THREE.Color(0x2e2a26), new THREE.Color(0x6b5a44)), 0));
  }
  for (let i = 0; i < 4; i++) {
    const g = new THREE.IcosahedronGeometry(0.14 + r() * 0.10, 0);
    const a = r() * Math.PI * 2, d = 0.6 + r() * 0.9;
    g.translate(Math.cos(a) * d, 0.55 + r() * 0.7, Math.sin(a) * d);
    parts.push(sway(paint(g, new THREE.Color(0x6a4a24), new THREE.Color(0xc59a4a)), 0));
  }
  return mergeGeometries(parts);
}

function monolithMesh(seed) {
  const r = rng32(seed), parts = [];
  const n = 7 + Math.floor(r() * 5);
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2 + r() * 0.4;
    const d = 1.1 + r() * 2.4;
    const h = 9 + r() * 26;
    const col = new THREE.CylinderGeometry(0.9 + r() * 0.5, 1.2 + r() * 0.5, h, 6);
    col.rotateY(r() * 3);
    col.rotateZ((r() - 0.5) * 0.10);
    col.translate(Math.cos(a) * d, h * 0.42, Math.sin(a) * d);
    parts.push(sway(paint(col, new THREE.Color(0x1d1e20), new THREE.Color(0x53555a)), 0));
  }
  return mergeGeometries(parts);
}

function campMesh(seed) {
  const r = rng32(seed), parts = [];
  const crate = new THREE.BoxGeometry(1.3, 0.85, 0.9);
  crate.translate(0, 0.44, 0);
  parts.push(sway(paint(crate, new THREE.Color(0x2c3a33), new THREE.Color(0x63796d)), 0));
  const crate2 = new THREE.BoxGeometry(0.8, 0.6, 0.8);
  crate2.rotateY(0.5);
  crate2.translate(1.1, 0.31, 0.4);
  parts.push(sway(paint(crate2, new THREE.Color(0x39301f), new THREE.Color(0x7d6c48)), 0));
  const mast = new THREE.CylinderGeometry(0.045, 0.06, 2.6, 6);
  mast.translate(-0.9, 1.3, -0.2);
  parts.push(sway(paint(mast, new THREE.Color(0x2a2c2e), new THREE.Color(0x64686b)), 0));
  const lamp = new THREE.IcosahedronGeometry(0.14, 0);
  lamp.translate(-0.9, 2.6, -0.2);
  parts.push(sway(paint(lamp, new THREE.Color(0xffb347), new THREE.Color(0xffd9a0)), 0));
  return mergeGeometries(parts);
}

const BUILDERS = {
  probe: probeMesh, fossil: fossilMesh, crystal: crystalMesh, nest: nestMesh,
  outcrop: outcropMesh, monolith: monolithMesh, camp: campMesh,
};

/** Which sites can occur where. */
function typeFor(site, roll) {
  const opts = [];
  const add = (t, w) => { if (w > 0) opts.push([t, w]); };
  add('probe', 0.55);
  add('camp', 0.4);
  add('monolith', site.biome === BIOME.HIGHLAND || site.biome === BIOME.ALPINE || site.biome === BIOME.VOLCANIC ? 1.0 : 0.15);
  add('crystal', site.hot > 0.6 ? 1.6 : 0);
  add('outcrop', site.biome === BIOME.HIGHLAND ? 1.4 : site.biome === BIOME.VOLCANIC ? 0.8 : 0.2);
  add('fossil', site.biome === BIOME.PLAINS || site.biome === BIOME.HIGHLAND ? 1.1 : 0.25);
  add('nest', site.biome === BIOME.JUNGLE || site.biome === BIOME.PLAINS || site.biome === BIOME.SWAMP ? 1.0 : 0.1);
  let total = 0;
  for (const o of opts) total += o[1];
  let r = roll * total;
  for (const o of opts) { r -= o[1]; if (r <= 0) return o[0]; }
  return 'probe';
}

class Site {
  constructor(key, type, x, y, z, seed) {
    this.key = key; this.type = type;
    this.pos = new THREE.Vector3(x, y, z);
    this.seed = seed;
    this.mesh = null;
    this.looted = false;
    this.scanned = false;
  }
}

export class PointsOfInterest {
  constructor(scene, quality) {
    this.scene = scene;
    this.group = new THREE.Group();
    this.group.name = 'poi';
    scene.add(this.group);
    this.material = injectCurve(new THREE.MeshStandardMaterial({
      vertexColors: true, roughness: 0.82, metalness: 0.12, side: THREE.DoubleSide,
    }));
    this.geoCache = new Map();
    this.sites = new Map();       // key -> Site (persistent state)
    this.active = [];
    this.range = 620;
    this.origin = new THREE.Vector3(1e9, 0, 1e9);
    this.discovered = new Set();
  }

  geometryFor(type, seed) {
    const k = `${type}:${seed % 4}`;
    if (!this.geoCache.has(k)) this.geoCache.set(k, BUILDERS[type](seed));
    return this.geoCache.get(k);
  }

  /** Deterministic site for a cell, or null if the cell is empty/unsuitable. */
  siteFor(i, j) {
    const key = `${i},${j}`;
    if (this.sites.has(key)) return this.sites.get(key);
    const r0 = hash2(i, j, 4441);
    if (r0 > 0.42) { this.sites.set(key, null); return null; }
    const x = (i + hash2(i, j, 17)) * CELL;
    const z = (j + hash2(i, j, 29)) * CELL;
    const site = sampleSite(x, z);
    if (site.h < 3 || site.water !== null || site.slope > 0.34) { this.sites.set(key, null); return null; }
    const type = typeFor(site, hash2(i, j, 71));
    const s = new Site(key, type, x, heightAt(x, z), z, (i * 733 + j * 977) | 0);
    this.sites.set(key, s);
    return s;
  }

  update(dt, px, pz) {
    if (Math.hypot(px - this.origin.x, pz - this.origin.z) < 90) return;
    this.origin.set(px, 0, pz);
    const span = Math.ceil(this.range / CELL) + 1;
    const ci = Math.floor(px / CELL), cj = Math.floor(pz / CELL);
    const wanted = new Set();
    for (let j = cj - span; j <= cj + span; j++) {
      for (let i = ci - span; i <= ci + span; i++) {
        const s = this.siteFor(i, j);
        if (!s) continue;
        if (Math.hypot(s.pos.x - px, s.pos.z - pz) > this.range) continue;
        wanted.add(s.key);
        if (!s.mesh) {
          const geo = this.geometryFor(s.type, s.seed);
          const m = new THREE.Mesh(geo, this.material);
          m.position.copy(s.pos);
          m.rotation.y = hash2(s.seed, 3, 91) * Math.PI * 2;
          m.castShadow = true;
          m.receiveShadow = true;
          this.group.add(m);
          s.mesh = m;
        }
      }
    }
    for (const [, s] of this.sites) {
      if (s && s.mesh && !wanted.has(s.key)) {
        this.group.remove(s.mesh);
        s.mesh = null;
      }
    }
    this.active = [...this.sites.values()].filter(s => s && s.mesh);
  }

  nearest(pos, maxDist = 4.5) {
    let best = null, bd = maxDist * maxDist;
    for (const s of this.active) {
      const d2 = s.pos.distanceToSquared(pos);
      if (d2 < bd) { bd = d2; best = s; }
    }
    return best;
  }

  /** Sites within a radius, for the compass and the survey objective. */
  within(pos, radius) {
    return this.active.filter(s => s.pos.distanceTo(pos) <= radius);
  }
}
