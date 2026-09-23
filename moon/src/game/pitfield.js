/* =============================================================================
   PIT FIELD — putting the catalogued holes into the ground
   -----------------------------------------------------------------------------
   Four pits, each a few hundred kilobytes of one-metre raster, installed when
   you come near one and dropped when you leave. The same path the NASA streamer
   uses: `TerrainSystem.addStreamedRaster` posts the patch to every tile worker
   and adds it to the main thread's heightfield in one call, so the ground the
   physics queries and the ground that gets drawn are the same ground. Getting
   that wrong is a bug this project has had before and does not want again.

   Range rather than always-on because the patches are big and there is no point
   holding Marius Hills in three heightfields while you are at Tycho. Install at
   thirty kilometres, which is over the horizon from the ground and about ten
   seconds of driving; drop at fifty, so walking back and forth across the
   boundary does not thrash.
   ========================================================================== */

import { PITS, buildPitRaster, distanceToPit } from '../data/pits.js';
import { caveFor } from './cave.js';
import { Raster } from '../terrain/heightfield.js';

const INSTALL_RANGE = 30000;
const DROP_RANGE = 50000;
/* How far the surrounding ground has to move before the hole is recut. */
const RELEVEL = 2;

export class PitField {
  /**
   * @param {object} opts { heightfield, terrain }
   */
  constructor(opts) {
    this.hf = opts.heightfield;
    this.terrain = opts.terrain;
    this.installed = new Map();       // id -> { pit, base }
    /* The one pit with a published cave under it gets one, built at the same
       moment the hole is cut and from the same surface elevation, so the
       conduit mouth and the shaft wall cannot drift apart. Null the rest of the
       time, which is nearly always. */
    this.cave = null;
    this.stats = { installed: 0, bytes: 0 };
  }

  /** The pit you are inside, or null. Used by the overlay and the log. */
  at(lat, lon) {
    for (const pit of PITS) {
      if (distanceToPit(pit, lat, lon) <= pit.funnelMax / 2) return pit;
    }
    return null;
  }

  /** The nearest catalogued pit and how far away it is. */
  nearest(lat, lon) {
    let best = null;
    for (const pit of PITS) {
      const range = distanceToPit(pit, lat, lon);
      if (!best || range < best.range) best = { pit, range };
    }
    return best;
  }

  /**
   * Called with the camera position, a few times a second at most.
   * Installing a pit rebuilds the tiles under it, so this must not be chatty.
   */
  update(lat, lon) {
    for (const pit of PITS) {
      const range = distanceToPit(pit, lat, lon);
      const have = this.installed.has(pit.id);
      if (!have && range < INSTALL_RANGE) this.install(pit);
      else if (have && range > DROP_RANGE) this.drop(pit);
    }
    /* The hole is cut relative to the ground that was there when it went in,
       and at thirty kilometres that ground may still be the vendored global at
       nearly two kilometres a pixel. When the finer data arrives the plain
       moves and the pit does not, which is a step at the rim rather than a
       pit in a slope. So re-level: cheap enough to do every couple of seconds,
       and it only ever fires when the surroundings have actually changed. */
    if (this.installed.size && (this._tick = (this._tick || 0) + 1) % 90 === 0) {
      for (const e of [...this.installed.values()]) {
        if (Math.abs(this.baseFor(e.pit) - e.base) > RELEVEL) {
          this.drop(e.pit);
          this.install(e.pit);
        }
      }
    }
    return this;
  }

  /**
   * The surrounding surface, read at four points around the rim and averaged,
   * so a pit on a slope sits in that slope.
   */
  baseFor(pit) {
    const mPerDeg = 1737400 * Math.PI / 180;
    const d = (pit.funnelMax * 1.4) / mPerDeg;
    const dl = d / Math.max(0.05, Math.cos(pit.lat * Math.PI / 180));
    let sum = 0;
    for (const [a, b] of [[d, 0], [-d, 0], [0, dl], [0, -dl]]) {
      sum += this.hf.heightAt(pit.lat + a, pit.lon + b);
    }
    return sum / 4;
  }

  install(pit) {
    if (this.installed.has(pit.id)) return null;
    /* Sampled before the pit exists, so the hole is cut into the real ground
       rather than into a flat assumption. */
    const base = this.baseFor(pit);

    const { spec, data } = buildPitRaster(pit, base);
    if (this.terrain) {
      this.terrain.addStreamedRaster(spec, data, this.hf, spec.bbox);
    } else {
      /* Headless: no renderer, so the heightfield is the only consumer. This
         is the path the tests take. */
      this.hf.addRaster(new Raster(spec, data));
    }
    this.installed.set(pit.id, { pit, base, bytes: data.byteLength });
    const cave = caveFor(pit, base);
    if (cave) this.cave = cave;
    this.recount();
    return { pit, base };
  }

  drop(pit) {
    const e = this.installed.get(pit.id);
    if (!e) return;
    this.installed.delete(pit.id);
    if (this.cave && this.cave.pit.id === pit.id) this.cave = null;
    this.hf.removeRaster(`pit:${pit.id}`);
    if (this.terrain) this.terrain.dropRaster(`pit:${pit.id}`, this.boundsOf(pit));
    this.recount();
  }

  /** The pit's patch in lon/lat, for invalidating just that ground. */
  boundsOf(pit) {
    const mPerDeg = 1737400 * Math.PI / 180;
    const d = (pit.funnelMax * 1.6) / mPerDeg;
    const dl = d / Math.max(0.05, Math.cos(pit.lat * Math.PI / 180));
    return [pit.lon - dl, pit.lat - d, pit.lon + dl, pit.lat + d];
  }

  recount() {
    this.stats.installed = this.installed.size;
    this.stats.bytes = [...this.installed.values()].reduce((n, e) => n + e.bytes, 0);
  }

  /** The floor elevation of an installed pit, for anything that needs it. */
  floorOf(pit) {
    const e = this.installed.get(pit.id);
    return e ? e.base - pit.depth : null;
  }
}
