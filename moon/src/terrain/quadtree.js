/* =============================================================================
   QUADTREE — deciding which tiles to draw
   -----------------------------------------------------------------------------
   Pure selection logic; it knows nothing about three.js. Every frame it walks
   the six cube faces and produces the set of tiles that should be visible, the
   ones that should be built next, and the ones that can be thrown away.

   A node splits when the camera is closer than `splitK` tile widths. Since a
   tile is always 33 vertices across, that keeps the on-screen size of a triangle
   roughly constant however far away you are, which is the whole trick behind
   drawing a body 10 900 km around at centimetre detail.

   Two rules keep the surface watertight while tiles stream in:
     * a node that wants to split keeps drawing itself until all four children
       have arrived, so there is never a hole;
     * a node that wants to merge keeps drawing its children until it has
       arrived itself.
   ========================================================================== */

import { tileKey, tileBoundingSphere, edgeArc, belowHorizon, children as childrenOf,
         parent as parentOf, tileForUnit } from './cubesphere.js';
import { R_MOON, TERRAIN } from '../config.js';

export class Quadtree {
  /**
   * @param {object} opts { maxLevel, splitK, tileBudget, cacheSize, verts }
   */
  constructor(opts = {}) {
    this.maxLevel = opts.maxLevel ?? 18;
    this.splitK = opts.splitK ?? TERRAIN.splitK;
    /* Multiplies the split distance. A long lens magnifies the ground without
       moving the camera any closer to it, so a tile that was small enough on a
       normal lens becomes a smooth wall at 250 mm; the renderer raises this in
       proportion to the magnification. */
    this.lodScale = 1;
    this.tileBudget = opts.tileBudget ?? 900;
    this.cacheSize = opts.cacheSize ?? 1400;
    this.tiles = new Map();          // key -> { state, tile, lastWanted, level, ... }
    this.frame = 0;
    this.stats = { visible: 0, wanted: 0, pending: 0, resident: 0, triangles: 0 };
  }

  get(key) { return this.tiles.get(key); }

  /** Record that a built tile has arrived. */
  install(key, payload) {
    let e = this.tiles.get(key);
    if (!e) {
      e = { key, level: payload.level, face: payload.face, i: payload.i, j: payload.j };
      this.tiles.set(key, e);
    }
    e.tile = payload;
    e.state = 'resident';
    e.lastWanted = this.frame;
    return e;
  }

  markPending(key, meta) {
    let e = this.tiles.get(key);
    if (!e) { e = { key, ...meta }; this.tiles.set(key, e); }
    e.state = 'pending';
    e.lastWanted = this.frame;
    return e;
  }

  isResident(key) {
    const e = this.tiles.get(key);
    return !!(e && e.state === 'resident');
  }

  /**
   * Choose the visible set for a camera position.
   *
   * @param {object} cam      camera position, world metres (doubles)
   * @param {function} inView optional frustum test taking a bounding sphere
   * @returns {{ draw: string[], request: object[], evict: string[] }}
   */
  select(cam, inView) {
    this.frame++;
    const draw = [];
    const request = [];
    const sphere = { x: 0, y: 0, z: 0, r: 0 };
    const camAlt = Math.hypot(cam.x, cam.y, cam.z) - R_MOON;
    /* Near the ground, keep refining tiles just behind the camera as well: the
       shadow cascade needs geometry there even though it is out of frame. */
    const shadowRadius = camAlt < 4000 ? 220 : 0;

    const walk = (face, level, i, j) => {
      const key = tileKey(face, level, i, j);
      tileBoundingSphere(face, level, i, j, -9500, 11500, sphere);
      const dx = sphere.x - cam.x, dy = sphere.y - cam.y, dz = sphere.z - cam.z;
      const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
      const near = Math.max(0, dist - sphere.r);

      /* The roots are always walked, because everything else hangs off them,
         but from level one down a tile that is over the horizon or out of
         frame is not worth descending into. */
      if (level > 0) {
        if (belowHorizon(cam, sphere)) return;
        if (level > 1 && inView && near > shadowRadius && !inView(sphere)) return;
      }

      const arc = edgeArc(level);
      const wantSplit = level < this.maxLevel && near < this.splitK * this.lodScale * arc;
      const entry = this.tiles.get(key);
      if (entry) entry.lastWanted = this.frame;

      if (wantSplit) {
        const kids = childrenOf(face, level, i, j);
        let allReady = true;
        for (const k of kids) if (!this.isResident(tileKey(k[0], k[1], k[2], k[3]))) allReady = false;
        if (allReady) {
          for (const k of kids) walk(k[0], k[1], k[2], k[3]);
          return;
        }
        /* Children are not ready: draw this level, and ask for them. */
        for (const k of kids) {
          const kk = tileKey(k[0], k[1], k[2], k[3]);
          const ke = this.tiles.get(kk);
          if (ke) { ke.lastWanted = this.frame; if (ke.state === 'resident' || ke.state === 'pending') continue; }
          request.push({ key: kk, face: k[0], level: k[1], i: k[2], j: k[3],
                         priority: near / arc });
        }
      }

      if (this.isResident(key)) {
        /* Drawing a tile whose triangles are wider than the distance to it puts
           a plane through the landscape rather than covering it. When that
           would happen, leave the gap: the chain of tiles under the camera is
           requested first, so it is a gap for a second, not a wall for a
           session. */
        const tooCoarse = wantSplit && near < arc * 0.03 && level < 6;
        if (!tooCoarse) draw.push(key);
      } else {
        if (!entry || entry.state !== 'pending') {
          request.push({ key, face, level, i, j, priority: near / arc });
        }
        /* Nothing to draw here yet; the parent is still covering this ground. */
      }
    };

    for (let f = 0; f < 6; f++) walk(f, 0, 0, 0);

    /* The ground directly under the camera has to arrive before anything else,
       and every tile in the chain from the root down to it has to be built to
       get there. Requesting that chain explicitly turns "wait a minute for the
       surface to sharpen" into "two seconds", because the breadth-first flood
       across the rest of the hemisphere no longer competes with it. */
    const r = Math.hypot(cam.x, cam.y, cam.z) || 1;
    const t = tileForUnit(this.maxLevel, cam.x / r, cam.y / r, cam.z / r);
    let face = t.face, level = this.maxLevel, i = t.i, j = t.j;
    const chain = [];
    while (level >= 0) {
      chain.push([face, level, i, j]);
      const p = parentOf(face, level, i, j);
      if (!p) break;
      [face, level, i, j] = p;
    }
    /* Whole quadruplets, not just the one tile the camera sits on: a node only
       hands over to its children once all four have arrived, so asking for one
       of them would leave the descent stuck one level short. */
    for (const [f, l, ii, jj] of chain) {
      const p = parentOf(f, l, ii, jj);
      const sibs = p ? childrenOf(p[0], p[1], p[2], p[3]) : [[f, l, ii, jj]];
      for (const [sf, sl, si, sj] of sibs) {
        const key = tileKey(sf, sl, si, sj);
        const e = this.tiles.get(key);
        if (e) e.lastWanted = this.frame;
        if (!e || (e.state !== 'resident' && e.state !== 'pending')) {
          request.push({ key, face: sf, level: sl, i: si, j: sj, priority: -1000 + sl });
        }
      }
    }

    request.sort((a, b) => a.priority - b.priority);
    const evict = this.collect();

    this.stats.visible = draw.length;
    this.stats.wanted = request.length;
    this.stats.resident = this.tiles.size;
    return { draw, request, evict };
  }

  /** Least-recently-wanted eviction, keeping ancestors of live tiles. */
  collect() {
    const evict = [];
    if (this.tiles.size <= this.cacheSize) return evict;
    const sorted = [...this.tiles.values()]
      .filter(e => e.state === 'resident' && e.lastWanted < this.frame)
      .sort((a, b) => a.lastWanted - b.lastWanted);
    const over = this.tiles.size - this.cacheSize;
    for (let n = 0; n < sorted.length && evict.length < over; n++) {
      const e = sorted[n];
      if (this.hasLiveDescendant(e)) continue;
      evict.push(e.key);
      this.tiles.delete(e.key);
    }
    return evict;
  }

  hasLiveDescendant(e) {
    for (const k of childrenOf(e.face, e.level, e.i, e.j)) {
      const c = this.tiles.get(tileKey(k[0], k[1], k[2], k[3]));
      if (c && c.lastWanted >= this.frame) return true;
    }
    return false;
  }

  /** The finest resident tile containing a direction, for physics queries. */
  finestAt(face, level, i, j) {
    let f = face, l = level, ii = i, jj = j;
    while (l >= 0) {
      const k = tileKey(f, l, ii, jj);
      if (this.isResident(k)) return this.tiles.get(k);
      const p = parentOf(f, l, ii, jj);
      if (!p) return null;
      [f, l, ii, jj] = p;
    }
    return null;
  }

  clear() { this.tiles.clear(); }
}
