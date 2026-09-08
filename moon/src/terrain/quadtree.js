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
    this.verts = opts.verts ?? TERRAIN.verts;
    this.tileBudget = opts.tileBudget ?? 900;
    /* How much the split distance is being pulled in to stay inside that
       budget. The budget was stored by the constructor and read by nothing,
       so the quality tiers named a number of tiles that had no effect on
       anything: what actually held the draw list down was the streaming rate,
       which means the limit was "however fast tiles happen to arrive" and the
       count would keep climbing the longer you stood still. One over this
       multiplies the split distance, so a frame that overshoots refines a
       little less on the next one and a frame well inside it relaxes back.
       Bounded, and slow enough in both directions that it cannot oscillate
       visibly. */
    this.budgetScale = 1;
    this.cacheSize = opts.cacheSize ?? 1400;
    this.tiles = new Map();          // key -> { state, tile, lastWanted, level, ... }
    this.frame = 0;
    /* Tiles asked to rebuild this frame, so one frame does not queue the same
       rebuild twice. */
    this.rebuildQueued = new Set();
    this.stats = { visible: 0, wanted: 0, pending: 0, resident: 0, triangles: 0,
                   budgetScale: 1 };
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
    e.stale = false;
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
    this.rebuildQueued.clear();
    const draw = [];
    const request = [];
    const sphere = { x: 0, y: 0, z: 0, r: 0 };
    const loose = { x: 0, y: 0, z: 0, r: 0 };
    const camAlt = Math.hypot(cam.x, cam.y, cam.z) - R_MOON;
    /* Near the ground, keep refining tiles just behind the camera as well: the
       shadow cascade needs geometry there even though it is out of frame. */
    const shadowRadius = camAlt < 4000 ? 220 : 0;

    /* How tall a tile might be, when nothing has measured it yet.

       The global range is 21 km, from the floor of the South Pole-Aitken basin
       to the top of the far-side highlands, and using it for every tile is what
       this used to do. The consequence is not subtle: a level 17 tile is twenty
       metres across, and a bounding sphere inflated to ten kilometres of
       elevation spread puts its near distance at zero for any camera within ten
       kilometres. Everything within that radius then refined to the finest
       level available -- three hundred tiles of centimetre detail seen from
       seven kilometres up -- while the middle distance stayed coarse, and the
       boundary between the two was a straight bright line running to the
       horizon.

       So a tile that has not been built yet is bounded by what the Moon can
       actually do over its own width. Crater walls reach about 35 degrees, and
       the steepest sustained slopes anywhere are not far past that, so seven
       tenths of the tile's arc is a generous bound on its relief; a floor of a
       few hundred metres keeps small tiles honest about the ground they sit on
       until their parent's real bounds are known. */
    const heightSpread = (level, entry) => {
      /* An ancestor that has been built knows the real answer for this ground,
         and a child is inside its parent's range up to the detail added below
         it, which the margin covers. */
      let e = entry;
      for (let n = 0; n < 20 && e; n++) {
        const b = e.tile && e.tile.bounds;
        /* The tile stores radii; the bounding sphere wants elevations. The
           margin covers what a child can hold that its ancestor never sampled:
           a coarse grid misses whatever the ground does between two of its
           vertices, so the allowance grows with that ancestor's own spacing. */
        if (b) {
          const m = e.level === level ? 60
            : Math.max(120, 0.75 * edgeArc(e.level) / (this.verts - 1));
          return { lo: b.rMin - R_MOON - m, hi: b.rMax - R_MOON + m };
        }
        const p = parentOf(e.face, e.level, e.i, e.j);
        e = p ? this.tiles.get(tileKey(p[0], p[1], p[2], p[3])) : null;
      }
      /* Nothing built anywhere above this tile yet, which happens only in the
         first frames. The whole range is the only safe answer: a bound that
         does not contain the ground gets the tile culled below the horizon and
         the surface never appears at all. */
      return { lo: -9500, hi: 11500 };
    };

    const walk = (face, level, i, j) => {
      const key = tileKey(face, level, i, j);
      /* Two spheres, because culling and level of detail want opposite errors
         from the same estimate. Throwing a tile away needs an over-estimate:
         cull something that was actually visible and you punch a hole in the
         landscape at the horizon. Deciding how finely to draw it needs a
         realistic one: over-estimate there and every tile within ten kilometres
         reports zero distance and refines to the finest level there is. */
      tileBoundingSphere(face, level, i, j, -9500, 11500, loose);
      const span = heightSpread(level, this.tiles.get(key));
      tileBoundingSphere(face, level, i, j, span.lo, span.hi, sphere);
      const dx = sphere.x - cam.x, dy = sphere.y - cam.y, dz = sphere.z - cam.z;
      const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
      const near = Math.max(0, dist - sphere.r);

      /* The roots are always walked, because everything else hangs off them,
         but from level one down a tile that is over the horizon or out of
         frame is not worth descending into. */
      if (level > 0) {
        if (belowHorizon(cam, loose)) return;
        if (level > 1 && inView && near > shadowRadius && !inView(loose)) return;
      }

      const arc = edgeArc(level);
      const wantSplit = level < this.maxLevel &&
        near < this.splitK * this.lodScale * this.budgetScale * arc;
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

      /* A resident tile whose ground has changed under it asks to be built
         again while staying on screen: see terrain.invalidateArea. */
      if (entry && entry.stale && !this.rebuildQueued.has(key)) {
        this.rebuildQueued.add(key);
        request.push({ key, face, level, i, j, priority: near / arc - 5000 });
      }

      if (this.isResident(key)) {
        /* Drawing a tile whose triangles are kilometres wide, from inside it,
           puts a plane through the landscape rather than covering it. The test
           is how far a triangle's chord departs from the sphere: three metres
           is a tile edge of about two hundred kilometres, and anything coarser
           than that visibly cuts through the ground you are standing on. Below
           it the departure is centimetres and the tile is a fine stand-in
           while its children load. */
        const chord = arc / (this.verts - 1);
        const sagitta = chord * chord / (8 * R_MOON);
        /* How much departure matters depends on how close you are to it. Three
           metres is intolerable with your boots on the ground and invisible
           from ten kilometres up, where refusing to draw coarse tiles would
           punch holes in the landscape while their children build. */
        const tooCoarse = wantSplit && near < arc * 0.1 &&
          sagitta > Math.max(3, camAlt * 0.02);
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

    /* Close the loop on the budget. A tenth of the error per frame settles in
       well under a second at any frame rate a person would play at, and the
       floor stops a pathological frame from collapsing the terrain to blocks.
       Only ever tightened while over budget: coming back is the same rate. */
    const over = draw.length / this.tileBudget;
    const want = over > 1 ? this.budgetScale / Math.pow(over, 0.5) : 1;
    this.budgetScale += (Math.max(0.25, Math.min(1, want)) - this.budgetScale) * 0.1;

    this.stats.visible = draw.length;
    this.stats.budgetScale = this.budgetScale;
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
