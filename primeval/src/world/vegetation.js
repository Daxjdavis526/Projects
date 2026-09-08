// Instanced scatter: forests, undergrowth, rocks and everything else that
// carpets THERA.
//
// Placement is a pure function of the cell coordinate, so the same tree grows
// in the same spot every time you walk back — no storage, no popping identity.
// Rebuilds are spread over several frames because a full field is ~8000
// instances and each one needs a ground sample.

import * as THREE from 'three';
import {
  canopyTree, treeFern, giantFern, cycad, stiltTree, spireTree, snag,
  berryBush, grassClump, reeds, glowcap, boulder, obsidian, driftwood,
} from './props.js';
import { heightAt, sampleSite, riverField, BIOME } from './field.js';
import { hash2, clamp, lerp } from '../math/noise.js';
import { injectWind } from './shaders.js';

const _m = new THREE.Matrix4();
const _q = new THREE.Quaternion();
const _p = new THREE.Vector3();
const _s = new THREE.Vector3();
const _e = new THREE.Euler();
const _c = new THREE.Color();

/**
 * One species. `density(site, x, z)` returns the expected number of instances
 * per cell, which is turned into a whole number stochastically so low densities
 * still produce the occasional plant.
 */
class Layer {
  constructor(name, geometries, opts) {
    this.name = name;
    this.geometries = geometries;
    this.cell = opts.cell;
    this.density = opts.density;
    this.range = opts.range;
    this.capacity = opts.capacity;
    this.scaleMin = opts.scaleMin ?? 0.8;
    this.scaleMax = opts.scaleMax ?? 1.25;
    this.tint = opts.tint ?? 0.14;
    this.alignSlope = opts.alignSlope ?? 0;
    this.castShadow = opts.castShadow ?? false;
    this.emissive = opts.emissive ?? false;
    this.collide = opts.collide ?? 0;     // trunk radius, 0 = walk through
    this.harvest = opts.harvest ?? null;  // { item, amount }
    this.falloff = opts.falloff ?? 0;     // density lost at the far edge
    this.sink = opts.sink ?? 0;
    this.seed = opts.seed ?? 1;
    this.meshes = [];
    this.matrices = [];
    this.colors = [];
    this.counts = [];
    this.instances = [];                  // world positions, for gameplay queries
  }
}

export class Vegetation {
  constructor(scene, quality) {
    this.quality = quality;
    this.group = new THREE.Group();
    this.group.name = 'vegetation';
    scene.add(this.group);

    this.material = injectWind(new THREE.MeshStandardMaterial({
      vertexColors: true, roughness: 0.88, metalness: 0.0,
      side: THREE.DoubleSide, alphaTest: 0, dithering: true,
    }));
    this.glowMaterial = injectWind(new THREE.MeshStandardMaterial({
      vertexColors: true, roughness: 0.5, metalness: 0.0,
      emissive: new THREE.Color(0.10, 0.85, 0.72), emissiveIntensity: 1.6,
      side: THREE.DoubleSide,
    }));

    const D = quality.vegDensity;
    const R = quality.vegRange;
    const G = quality.grassRange;
    const N = (n) => Math.max(24, Math.round(n * D));

    const v = (fn, n, scale = 1) => Array.from({ length: n }, (_, i) => fn(1000 + i * 77, scale));

    this.layers = [
      new Layer('canopy', v(canopyTree, 3), {
        cell: 21, range: R, capacity: N(1100), scaleMin: 0.72, scaleMax: 1.55,
        castShadow: true, collide: 0.55, seed: 11, falloff: 0.45,
        density: (s) => s.biome === BIOME.JUNGLE ? 1.35 : s.biome === BIOME.SWAMP ? 0.42
          : s.biome === BIOME.PLAINS ? 0.13 : 0,
      }),
      new Layer('treefern', v(treeFern, 3), {
        cell: 9.5, range: Math.min(R, 210), capacity: N(1300), castShadow: true,
        collide: 0.2, seed: 23, falloff: 0.4,
        density: (s) => s.biome === BIOME.JUNGLE ? 1.5 : s.biome === BIOME.SWAMP ? 0.9 : 0,
      }),
      new Layer('groundfern', v(giantFern, 3), {
        cell: 5.0, range: Math.max(G * 1.5, 105), capacity: N(3200), alignSlope: 0.55,
        seed: 31, falloff: 0.35,
        density: (s) => s.biome === BIOME.JUNGLE ? 2.9 : s.biome === BIOME.SWAMP ? 1.9
          : s.biome === BIOME.PLAINS ? 0.35 : 0,
      }),
      new Layer('cycad', v(cycad, 2), {
        cell: 12, range: Math.min(R, 300), capacity: N(700), castShadow: true,
        collide: 0.2, seed: 43, falloff: 0.4,
        density: (s) => s.biome === BIOME.PLAINS ? 0.8 : s.biome === BIOME.BEACH ? 0.6
          : s.biome === BIOME.JUNGLE ? 0.45 : 0,
      }),
      new Layer('stilt', v(stiltTree, 2), {
        cell: 13, range: Math.min(R, 320), capacity: N(600), castShadow: true,
        collide: 0.4, seed: 57, falloff: 0.4,
        density: (s) => s.biome === BIOME.SWAMP ? 1.4 : (s.river > 0.25 ? 0.6 : 0),
      }),
      new Layer('spire', v(spireTree, 2), {
        cell: 15, range: R, capacity: N(800), castShadow: true, collide: 0.35,
        seed: 61, falloff: 0.45,
        density: (s) => s.biome === BIOME.HIGHLAND ? 1.15 : s.biome === BIOME.ALPINE ? 0.3 : 0,
      }),
      new Layer('snag', v(snag, 2), {
        cell: 22, range: R, capacity: N(320), castShadow: true, collide: 0.3,
        seed: 73, falloff: 0.4,
        density: (s) => s.biome === BIOME.VOLCANIC ? 0.9 : s.biome === BIOME.SWAMP ? 0.3 : 0,
      }),
      new Layer('berry', v(berryBush, 2), {
        cell: 15, range: Math.max(G * 1.9, 130), capacity: N(240), seed: 89,
        scaleMin: 0.7, scaleMax: 1.05,
        harvest: { item: 'berries', amount: 3 },
        density: (s) => s.biome === BIOME.JUNGLE ? 0.5 : s.biome === BIOME.PLAINS ? 0.32
          : s.biome === BIOME.SWAMP ? 0.2 : 0,
      }),
      new Layer('grass', [grassClump(1, 1, false), grassClump(2, 1, true), grassClump(3, 1, false)], {
        cell: 2.35, range: G, capacity: N(7000), alignSlope: 0.7, tint: 0.22,
        seed: 97, falloff: 0.3, scaleMin: 0.7, scaleMax: 1.5,
        density: (s) => s.biome === BIOME.PLAINS ? 3.1 : s.biome === BIOME.JUNGLE ? 2.4
          : s.biome === BIOME.HIGHLAND ? 1.2 : s.biome === BIOME.BEACH ? 0.35
            : s.biome === BIOME.SWAMP ? 1.3 : 0,
      }),
      new Layer('reeds', v(reeds, 2), {
        cell: 4.5, range: Math.max(G * 1.2, 95), capacity: N(900), seed: 103, falloff: 0.3,
        density: (s) => s.biome === BIOME.SWAMP ? 1.8 : (s.river > 0.3 ? 2.0 : 0),
      }),
      new Layer('glowcap', v(glowcap, 2), {
        cell: 10, range: Math.max(G * 1.5, 110), capacity: N(280), emissive: true, seed: 109,
        density: (s) => s.biome === BIOME.JUNGLE ? 0.5 : s.biome === BIOME.SWAMP ? 0.75 : 0,
      }),
      new Layer('boulder', v(boulder, 3), {
        cell: 24, range: R, capacity: N(520), castShadow: true, collide: 0.9,
        seed: 127, falloff: 0.4,
        scaleMin: 0.6, scaleMax: 2.8, alignSlope: 0.5, sink: 0.25,
        density: (s) => s.biome === BIOME.HIGHLAND ? 1.1 : s.biome === BIOME.ALPINE ? 1.5
          : s.biome === BIOME.VOLCANIC ? 0.9 : s.biome === BIOME.BEACH ? 0.4 : 0.2,
      }),
      new Layer('obsidian', v(obsidian, 2), {
        cell: 17, range: Math.min(R, 320), capacity: N(420), seed: 139, alignSlope: 0.4, falloff: 0.4,
        density: (s) => s.biome === BIOME.VOLCANIC ? 1.3 : 0,
      }),
      new Layer('driftwood', v(driftwood, 2), {
        cell: 28, range: Math.min(R, 260), capacity: N(140), seed: 149, alignSlope: 0.8,
        density: (s) => s.biome === BIOME.BEACH ? 0.7 : 0,
      }),
    ];

    for (const L of this.layers) this._createMeshes(L);

    this.origin = new THREE.Vector3(1e9, 0, 1e9);
    this.rebuildDist = 26;
    this.job = null;
    this.consumed = new Set();
    this.treeColliders = [];
    this.enabled = true;
    this.budgetCellsPerFrame = 900;
  }

  _createMeshes(L) {
    const per = Math.max(8, Math.ceil(L.capacity / L.geometries.length));
    for (let i = 0; i < L.geometries.length; i++) {
      const geo = L.geometries[i];
      const mat = L.emissive ? this.glowMaterial : this.material;
      const mesh = new THREE.InstancedMesh(geo, mat, per);
      mesh.count = 0;
      mesh.castShadow = L.castShadow;
      mesh.receiveShadow = true;
      mesh.frustumCulled = false;
      mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
      mesh.instanceColor = new THREE.InstancedBufferAttribute(new Float32Array(per * 3), 3);
      mesh.instanceColor.setUsage(THREE.DynamicDrawUsage);
      mesh.name = `${L.name}${i}`;
      this.group.add(mesh);
      L.meshes.push(mesh);
      L.matrices.push(new Float32Array(per * 16));
      L.colors.push(new Float32Array(per * 3));
      L.counts.push(0);
    }
  }

  /** Mark one harvestable instance as taken so it stops coming back. */
  consume(key) { this.consumed.add(key); }

  /**
   * Nearest harvestable instance to a point, or null.
   * Returns { key, position, layer, harvest, distance }.
   */
  nearestHarvest(pos, maxDist = 3.2) {
    let best = null, bestD = maxDist * maxDist;
    for (const L of this.layers) {
      if (!L.harvest) continue;
      for (const inst of L.instances) {
        const dx = inst.x - pos.x, dy = inst.y - pos.y, dz = inst.z - pos.z;
        const d2 = dx * dx + dy * dy * 0.35 + dz * dz;
        if (d2 < bestD) { bestD = d2; best = { key: inst.key, position: inst, layer: L, harvest: L.harvest, distance: Math.sqrt(d2) }; }
      }
    }
    return best;
  }

  /** Positions of nearby trunks, so creatures and the player can be blocked. */
  get colliderList() { return this.treeColliders; }

  update(dt, px, pz, py) {
    if (!this.enabled) return;
    if (this.job) { this._stepJob(); return; }
    const d = Math.hypot(px - this.origin.x, pz - this.origin.z);
    const tooHigh = py !== undefined && py - heightAt(px, pz) > 260;
    if (tooHigh) {
      if (this.group.visible) this.group.visible = false;
      return;
    }
    this.group.visible = true;
    if (d > this.rebuildDist) this._startJob(px, pz);
  }

  _startJob(px, pz) {
    const cells = [];
    for (const L of this.layers) {
      const r = L.range;
      const c = L.cell;
      const i0 = Math.floor((px - r) / c), i1 = Math.ceil((px + r) / c);
      const j0 = Math.floor((pz - r) / c), j1 = Math.ceil((pz + r) / c);
      for (let j = j0; j <= j1; j++) {
        for (let i = i0; i <= i1; i++) {
          const cx = (i + 0.5) * c, cz = (j + 0.5) * c;
          const dx = cx - px, dz = cz - pz;
          if (dx * dx + dz * dz > r * r) continue;
          cells.push({ L, i, j, d2: dx * dx + dz * dz });
        }
      }
    }
    // Nearest first: when a layer runs out of instance capacity, the plants it
    // drops should be the ones over the horizon, not the ones at your feet.
    cells.sort((a, b) => a.d2 - b.d2);
    this.job = { px, pz, cells, index: 0, counts: new Map(), instances: new Map() };
    for (const L of this.layers) {
      this.job.counts.set(L, L.meshes.map(() => 0));
      this.job.instances.set(L, []);
    }
  }

  _stepJob() {
    const job = this.job;
    const end = Math.min(job.cells.length, job.index + this.budgetCellsPerFrame);
    for (; job.index < end; job.index++) {
      const cell = job.cells[job.index];
      this._fillCell(cell.L, cell.i, cell.j, job, Math.sqrt(cell.d2));
    }
    if (job.index >= job.cells.length) {
      // Publish: swap staged buffers into the live meshes.
      for (const L of this.layers) {
        const counts = job.counts.get(L);
        for (let k = 0; k < L.meshes.length; k++) {
          const mesh = L.meshes[k];
          const n = counts[k];
          mesh.instanceMatrix.array.set(L.matrices[k].subarray(0, n * 16));
          mesh.instanceColor.array.set(L.colors[k].subarray(0, n * 3));
          mesh.count = n;
          mesh.instanceMatrix.needsUpdate = true;
          mesh.instanceColor.needsUpdate = true;
        }
        L.instances = job.instances.get(L);
      }
      this._rebuildColliders(job.px, job.pz);
      this.origin.set(job.px, 0, job.pz);
      this.job = null;
    }
  }

  _fillCell(L, i, j, job, dist) {
    const c = L.cell;
    const cx = (i + 0.5) * c, cz = (j + 0.5) * c;
    const site = sampleSite(cx, cz);
    if (site.water !== null && L.name !== 'reeds') return;
    if (site.h < -1 && L.name !== 'reeds') return;
    let dens = L.density(site, cx, cz);
    if (dens <= 0) return;
    // Riverbanks are lush; steep ground and lava fields are not.
    dens *= lerp(1, 0.15, clamp((site.slope - 0.30) / 0.32, 0, 1));
    // Thin out with distance. Fog hides the difference and it buys back a lot
    // of instances for the ground you are actually standing on.
    if (L.falloff > 0 && dist !== undefined) {
      dens *= lerp(1, 1 - L.falloff, clamp(dist / L.range, 0, 1));
    }
    const r0 = hash2(i, j, L.seed);
    const whole = Math.floor(dens);
    const n = whole + (r0 < (dens - whole) ? 1 : 0);
    if (n <= 0) return;

    const counts = job.counts.get(L);
    const list = job.instances.get(L);
    for (let k = 0; k < n; k++) {
      const rx = hash2(i * 31 + k, j, L.seed + 5);
      const rz = hash2(i, j * 31 + k, L.seed + 9);
      const rs = hash2(i + k, j - k, L.seed + 17);
      const rr = hash2(i - k, j + k, L.seed + 23);
      const x = (i + rx) * c, z = (j + rz) * c;
      const key = `${L.name}:${i}:${j}:${k}`;
      if (L.harvest && this.consumed.has(key)) continue;
      const y = heightAt(x, z);
      if (y < (L.name === 'reeds' ? -1.6 : 0.05)) continue;

      const vIdx = Math.floor(rs * L.meshes.length) % L.meshes.length;
      const cap = L.meshes[vIdx].instanceMatrix.count;
      if (counts[vIdx] >= cap) continue;

      const scale = lerp(L.scaleMin, L.scaleMax, rr);
      _p.set(x, y - L.sink * scale, z);
      _e.set(0, rr * Math.PI * 2, 0, 'YXZ');
      if (L.alignSlope > 0) {
        // Lean with the ground, but never all the way over.
        const e = 1.1;
        const nx = heightAt(x - e, z) - heightAt(x + e, z);
        const nz = heightAt(x, z - e) - heightAt(x, z + e);
        _e.x = clamp(nz / (2 * e), -0.6, 0.6) * L.alignSlope;
        _e.z = clamp(-nx / (2 * e), -0.6, 0.6) * L.alignSlope;
      }
      _q.setFromEuler(_e);
      _s.setScalar(scale);
      _m.compose(_p, _q, _s);
      _m.toArray(L.matrices[vIdx], counts[vIdx] * 16);

      // Per-plant colour drift so a forest is not one flat green.
      const tint = 1 - L.tint * 0.5 + rs * L.tint;
      const warm = 1 + (rx - 0.5) * L.tint * 0.9;
      const ci = counts[vIdx] * 3;
      L.colors[vIdx][ci] = tint * warm;
      L.colors[vIdx][ci + 1] = tint;
      L.colors[vIdx][ci + 2] = tint * (2 - warm);
      counts[vIdx]++;

      if (L.harvest || L.collide > 0) {
        list.push({ x, y, z, key, scale, collide: L.collide });
      }
    }
  }

  _rebuildColliders(px, pz) {
    this.treeColliders.length = 0;
    for (const L of this.layers) {
      if (L.collide <= 0) continue;
      for (const inst of L.instances) {
        const dx = inst.x - px, dz = inst.z - pz;
        if (dx * dx + dz * dz > 44 * 44) continue;
        this.treeColliders.push({ x: inst.x, y: inst.y, z: inst.z, r: L.collide * inst.scale, h: 6 });
      }
    }
  }

  setNightGlow(t) {
    this.glowMaterial.emissiveIntensity = lerp(0.35, 3.4, t);
  }

  dispose() {
    for (const L of this.layers) for (const m of L.meshes) m.dispose();
    this.material.dispose();
    this.glowMaterial.dispose();
  }
}
