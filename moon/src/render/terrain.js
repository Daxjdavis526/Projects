/* =============================================================================
   TERRAIN — quadtree meshes, the worker pool, and streaming
   -----------------------------------------------------------------------------
   Owns the three.js side of the surface: it asks the quadtree what should be
   visible, asks the workers to build what is missing, turns the buffers they
   send back into meshes, and re-places everything when the floating origin
   moves.
   ========================================================================== */

import * as THREE from 'three';
import { Quadtree } from '../terrain/quadtree.js';
import { tileForUnit, tileKey, parent as parentOf } from '../terrain/cubesphere.js';
import { heightInTile } from '../terrain/tilebuilder.js';
import { makeTerrainMaterial, updateTerrainUniforms } from './terrainmaterial.js';
import { R_MOON, TERRAIN } from '../config.js';

export class TerrainSystem {
  /**
   * @param {Stage} stage
   * @param {object} opts { base, quality, manifest, geology, workers, colourMap }
   */
  constructor(stage, opts) {
    this.stage = stage;
    this.base = opts.base;
    this.quality = opts.quality;
    this.manifest = opts.manifest;
    this.group = new THREE.Group();
    this.group.matrixAutoUpdate = false;
    stage.world.add(this.group);

    this.material = makeTerrainMaterial({
      map: opts.colourMap,
      plain: !!opts.quality.plain,
    });

    this.quadtree = new Quadtree({
      maxLevel: opts.quality.maxLevel,
      tileBudget: opts.quality.tileBudget,
      cacheSize: opts.quality.cache,
    });

    this.meshes = new Map();          // key -> THREE.Mesh
    this.inFlight = new Map();        // key -> worker index
    this.gen = 0;
    this.ready = false;
    this.installBudget = 4;
    this.pendingInstall = [];
    this.onProgress = opts.onProgress || (() => {});
    this.stats = { tiles: 0, triangles: 0, queued: 0, building: 0 };

    const count = opts.workers ?? 1;
    this.workers = [];
    this.busy = [];
    for (let n = 0; n < count; n++) {
      const w = new Worker(new URL('../terrain/worker.js', import.meta.url), { type: 'module' });
      w.onmessage = (e) => this.onWorkerMessage(n, e.data);
      this.workers.push(w);
      this.busy.push(0);
    }
    this.readyCount = 0;
    for (const w of this.workers) {
      w.postMessage({
        type: 'init', base: opts.base,
        config: {
          verts: TERRAIN.verts, apron: opts.quality.apron, level: 3,
          rocks: opts.quality.rocks, noProcedural: !!opts.quality.noProcedural,
        },
        geology: opts.geology || null,
      });
    }
  }

  onWorkerMessage(n, m) {
    switch (m.type) {
      case 'ready':
        this.readyCount++;
        this.onProgress('terrain', this.readyCount / this.workers.length);
        if (this.readyCount === this.workers.length) this.ready = true;
        break;
      case 'progress':
        this.onProgress(m.stage, m.fraction);
        break;
      case 'tile':
        this.busy[n]--;
        this.inFlight.delete(m.key);
        if (m.gen === this.gen) this.pendingInstall.push(m);
        break;
      case 'error':
        this.busy[n] = Math.max(0, this.busy[n] - 1);
        this.inFlight.delete(m.key);
        console.error('terrain worker:', m.message);
        break;
    }
  }

  /** Hand a streamed elevation layer to every worker and to the local copy. */
  addStreamedRaster(spec, data, localHeightfield) {
    for (const w of this.workers) {
      /* Each worker needs its own copy; the array is small (a tile of floats). */
      w.postMessage({ type: 'raster', spec, data: data.slice() });
    }
    if (localHeightfield) {
      import('../terrain/heightfield.js').then(({ Raster }) => {
        localHeightfield.addRaster(new Raster(spec, data));
      });
    }
    this.invalidate();
  }

  setPads(pads) {
    for (const w of this.workers) w.postMessage({ type: 'pads', pads });
    this.invalidate();
  }

  /** Throw away every built tile: used when the terrain definition changes. */
  invalidate() {
    this.gen++;
    for (const [key, mesh] of this.meshes) this.disposeMesh(key, mesh);
    this.meshes.clear();
    this.quadtree.clear();
    this.inFlight.clear();
    this.pendingInstall.length = 0;
  }

  disposeMesh(key, mesh) {
    this.group.remove(mesh);
    mesh.geometry.dispose();
  }

  /** Called once per frame with the camera position in world metres. */
  update(cam, frustum, rebased) {
    if (!this.ready) return;

    /* Install what the workers finished. Turning buffers into GPU geometry costs
       about a fifth of a millisecond each, so this is time-boxed rather than
       counted: a fixed budget of four per frame is fine at sixty frames a second
       and catastrophic at ten, where the workers out-produce it, the backlog
       grows without bound, and the quadtree never learns that the tiles it is
       waiting for actually exist. */
    const installUntil = performance.now() + 6;
    let installed = 0;
    while (this.pendingInstall.length &&
           (installed < 4 || performance.now() < installUntil)) {
      this.install(this.pendingInstall.shift());
      installed++;
    }

    const inView = frustum ? (s) => frustum.intersectsSphere(
      this._sphere(s.x - this.stage.origin.origin.x, s.y - this.stage.origin.origin.y,
                   s.z - this.stage.origin.origin.z, s.r)) : null;

    const { draw, request, evict } = this.quadtree.select(cam, inView);

    /* Show the chosen set. */
    for (const [key, mesh] of this.meshes) mesh.visible = false;
    let triangles = 0;
    for (const key of draw) {
      const mesh = this.meshes.get(key);
      if (mesh) {
        mesh.visible = true;
        triangles += mesh.geometry.index.count / 3;
      }
    }

    if (rebased) this.replaceAll();

    for (const key of evict) {
      const mesh = this.meshes.get(key);
      if (mesh) { this.disposeMesh(key, mesh); this.meshes.delete(key); }
    }
    if (evict.length) for (const w of this.workers) w.postMessage({ type: 'evict', keys: evict });

    /* Dispatch builds, deepest-first among the closest, keeping each worker
       fed but not so deep that cancelling is useless. */
    const perWorker = 4;
    for (const req of request) {
      if (this.inFlight.has(req.key)) continue;
      const n = this.leastBusy();
      if (this.busy[n] >= perWorker) break;
      this.busy[n]++;
      this.inFlight.set(req.key, n);
      this.quadtree.markPending(req.key, req);
      this.workers[n].postMessage({
        type: 'build', key: req.key, face: req.face, level: req.level,
        i: req.i, j: req.j, gen: this.gen,
      });
    }

    this.stats.tiles = draw.length;
    this.stats.triangles = triangles;
    this.stats.queued = request.length;
    this.stats.building = this.inFlight.size;
  }

  _sphere(x, y, z, r) {
    this.__s = this.__s || new THREE.Sphere();
    this.__s.center.set(x, y, z);
    this.__s.radius = r;
    return this.__s;
  }

  leastBusy() {
    let best = 0;
    for (let n = 1; n < this.busy.length; n++) if (this.busy[n] < this.busy[best]) best = n;
    return best;
  }

  install(m) {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(m.positions, 3));
    g.setAttribute('normal', new THREE.BufferAttribute(m.normals, 3));
    g.setAttribute('uv', new THREE.BufferAttribute(m.uv, 2));
    g.setAttribute('aDetail', new THREE.BufferAttribute(m.detail, 2));
    g.setIndex(new THREE.BufferAttribute(m.index, 1));

    if (m.horizon) {
      const n = m.verts * m.verts;
      const total = m.positions.length / 3;
      const h0 = new Uint8Array(total * 4), h1 = new Uint8Array(total * 4);
      for (let i = 0; i < n; i++) {
        for (let d = 0; d < 4; d++) {
          h0[i * 4 + d] = m.horizon[i * 8 + d];
          h1[i * 4 + d] = m.horizon[i * 8 + 4 + d];
        }
      }
      /* Skirt vertices copy the edge vertex they hang from, in the same order
         buildTile emitted them. */
      let s = n;
      const copy = (src) => {
        for (let d = 0; d < 4; d++) {
          h0[s * 4 + d] = h0[src * 4 + d];
          h1[s * 4 + d] = h1[src * 4 + d];
        }
        s++;
      };
      const v = m.verts;
      for (let a = 0; a < v; a++) copy(a);
      for (let a = 0; a < v; a++) copy((v - 1) * v + a);
      for (let b = 0; b < v; b++) copy(b * v);
      for (let b = 0; b < v; b++) copy(b * v + (v - 1));
      g.setAttribute('aHorizon0', new THREE.BufferAttribute(h0, 4, true));
      g.setAttribute('aHorizon1', new THREE.BufferAttribute(h1, 4, true));
    }

    g.boundingSphere = new THREE.Sphere(new THREE.Vector3(0, 0, 0), m.bounds.radius * 1.05);

    const mesh = new THREE.Mesh(g, this.material);
    mesh.matrixAutoUpdate = false;
    mesh.castShadow = m.level >= 14;
    mesh.receiveShadow = true;
    mesh.frustumCulled = false;          // the quadtree already culled it
    mesh.userData.centre = m.centre;
    mesh.userData.payload = m;
    this.place(mesh);

    const old = this.meshes.get(m.key);
    if (old) this.disposeMesh(m.key, old);
    this.meshes.set(m.key, mesh);
    this.group.add(mesh);
    mesh.visible = false;
    this.quadtree.install(m.key, m);
  }

  place(mesh) {
    const o = this.stage.origin.origin, c = mesh.userData.centre;
    mesh.position.set(c[0] - o.x, c[1] - o.y, c[2] - o.z);
    mesh.updateMatrix();
  }

  replaceAll() {
    for (const mesh of this.meshes.values()) this.place(mesh);
  }

  /**
   * Height of the drawn surface below a direction, from the finest resident
   * tile. This is what the player stands on, so it is the same triangles the
   * GPU is drawing rather than a separately evaluated surface.
   *
   * @returns {number|null} metres above the datum, or null if nothing is loaded
   */
  heightAtUnit(x, y, z, maxLevel = this.quality.maxLevel) {
    const t = tileForUnit(maxLevel, x, y, z, TERRAIN.verts, this._t || (this._t = {}));
    let level = maxLevel, i = t.i, j = t.j, face = t.face;
    while (level >= 0) {
      const e = this.quadtree.get(tileKey(face, level, i, j));
      if (e && e.state === 'resident') {
        const local = tileForUnit(level, x, y, z, TERRAIN.verts, this._u || (this._u = {}));
        return heightInTile(e.tile, local.a, local.b);
      }
      const p = parentOf(face, level, i, j);
      if (!p) break;
      [face, level, i, j] = p;
    }
    return null;
  }

  updateSky(sky) {
    updateTerrainUniforms(this.material, { ...sky, origin: this.stage.origin.origin });
  }

  dispose() {
    for (const w of this.workers) w.terminate();
    this.invalidate();
    this.material.dispose();
  }
}
