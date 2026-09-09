/* =============================================================================
   SURFACE STREAMER — pulling NASA's finer data in around wherever you are
   -----------------------------------------------------------------------------
   Decides what to ask for and when. The rule is simple: as you descend, the
   terrain wants finer measurements than the vendored 1.9 km global layer can
   give, so fetch a patch of the best measured elevation covering where you are,
   and a patch of the best imagery, and hand them to the terrain.

   Patches are nested rather than tiled: a wide, coarse one for the country
   around you, then progressively smaller and finer ones, each replacing the
   previous when you walk out of it. That is a handful of requests instead of
   hundreds, and it matches how the services are organised anyway.

   Everything is optional. Turn streaming off, or lose the network, and the game
   keeps running on the vendored data with the overlay saying exactly that.
   ========================================================================== */

import { R_MOON } from '../config.js';

/* Each ring: how wide a patch, how many pixels, and the altitude below which it
   is worth having. The finest is only requested once you are close enough that
   metre-scale relief is actually visible. */
const RINGS = [
  { span: 4.0,   size: 513, maxAlt: 400000 },
  { span: 0.6,   size: 513, maxAlt: 60000 },
  { span: 0.08,  size: 513, maxAlt: 9000 },
  { span: 0.012, size: 513, maxAlt: 1200 },
];

export class SurfaceStreamer {
  /**
   * @param {Streams} streams
   * @param {object} opts { heightfield, terrain, onLayer }
   */
  constructor(streams, opts) {
    this.streams = streams;
    this.heightfield = opts.heightfield;
    this.terrain = opts.terrain;
    this.onLayer = opts.onLayer || (() => {});
    this.rings = RINGS.map((r, i) => ({
      ...r, id: `stream${i}`, centre: null, busy: false, layer: null,
      skipped: null, lastError: null,
    }));
    this.imagery = { bounds: null, busy: false, level: -1, source: null,
                     res_m: null, key: null, atBest: false, lastError: null };
    this.lastImageryAt = 0;
  }

  /** Distance in metres from a ring's centre, or Infinity if it has none. */
  static distance(centre, lat, lon) {
    if (!centre) return Infinity;
    const dLat = (lat - centre.lat) * Math.PI / 180;
    const dLon = (lon - centre.lon) * Math.PI / 180 * Math.cos(lat * Math.PI / 180);
    return Math.hypot(dLat, dLon) * R_MOON;
  }

  /**
   * Called every frame or so with where the camera is.
   * @param {number} lat @param {number} lon @param {number} alt metres above ground
   */
  update(lat, lon, alt) {
    /* Read live rather than captured. This used to hold its own copy taken at
       construction, so the settings toggle was one-way: a session started with
       ?offline=1 could be switched to "on" and nothing would ever be fetched,
       because the copy said no and the copy was never written again. */
    if (!this.streams.enabled) return;

    for (const ring of this.rings) {
      if (alt > ring.maxAlt || ring.busy) continue;
      const halfSpanM = ring.span * 0.5 * Math.PI / 180 * R_MOON;
      /* Re-fetch once the camera has left the middle half of the patch. */
      if (SurfaceStreamer.distance(ring.centre, lat, lon) < halfSpanM * 0.5) continue;
      this.fetchRing(ring, lat, lon);
      break;              // one new patch at a time; the nearest ring first
    }

    this.updateImagery(lat, lon, alt);
  }

  async fetchRing(ring, lat, lon) {
    ring.busy = true;
    const half = ring.span / 2;
    const lonHalf = half / Math.max(0.05, Math.cos(lat * Math.PI / 180));
    const area = {
      latMin: Math.max(-90, lat - half), latMax: Math.min(90, lat + half),
      lonMin: lon - lonHalf, lonMax: lon + lonHalf,
    };
    try {
      const patch = await this.streams.elevation(area, ring.size);
      /* A request that came back at all settles the question for this patch,
         useful or not: centre the ring so the same square is not re-asked for
         every frame. Only a genuine failure leaves it un-centred to retry. */
      if (patch && patch.failed) { ring.lastError = patch.error; return; }
      ring.centre = { lat, lon };
      ring.lastError = null;
      if (!patch || patch.empty) { ring.layer = null; return; }
      /* Worth adding if it beats the coarsest coverage anywhere in the patch,
         not just under the camera: a wide 118 m layer still improves the
         ground around a narrow 2 m site model. */
      const half = ring.span / 2;
      let worst = 0;
      for (const [dLat, dLon] of [[0, 0], [-half, -half], [-half, half], [half, -half], [half, half]]) {
        worst = Math.max(worst, this.heightfield.sampleData(lat + dLat * 0.9, lon + dLon * 0.9, {}).res_m);
      }
      if (patch.res_m >= worst * 0.9) { ring.layer = null; ring.skipped = patch.res_m; return; }

      /* Fill any holes with the surrounding measured surface rather than
         leaving NaNs to punch through the terrain. */
      let sum = 0, n = 0;
      for (const v of patch.data) if (Number.isFinite(v)) { sum += v; n++; }
      /* A patch with nothing finite in it has nothing to fill the holes from.
         `streams.elevation` already rejects anything under half valid, so this
         is unreachable in practice — but it used to reach for an identifier
         that does not exist in this scope, which would have turned a bad patch
         into a ReferenceError swallowed by the catch below and retried
         forever. */
      if (!n) { ring.layer = null; ring.lastError = 'no valid samples'; return; }
      const mean = sum / n;
      for (let i = 0; i < patch.data.length; i++) {
        if (!Number.isFinite(patch.data[i])) patch.data[i] = mean;
      }

      const spec = {
        id: ring.id, bbox: [area.lonMin, area.latMin, area.lonMax, area.latMax],
        width: patch.width, height: patch.height, res_m: patch.res_m,
        priority: 1, source: patch.source, label: 'MEASURED',
        margin: ring.span * 0.06,
      };
      ring.layer = spec;
      ring.skipped = null;
      this.terrain.addStreamedRaster(spec, patch.data, this.heightfield, spec.bbox);
      this.onLayer('elevation', spec);
    } catch (e) {
      /* Leave the ring un-centred so the next pass retries it. */
      ring.centre = null;
      ring.lastError = e.message || String(e);
    } finally {
      ring.busy = false;
    }
  }

  async updateImagery(lat, lon, alt) {
    if (this.imagery.busy) return;
    const now = performance.now();
    if (now - this.lastImageryAt < 1500) return;
    /* Ask for imagery about as fine as a pixel on screen would want: roughly
       the altitude divided by a few hundred, floored at the best available. */
    const wantRes = Math.max(0.5, alt / 400);
    const b = this.imagery.bounds;
    const inside = b && lat > b.latMin && lat < b.latMax && lon > b.lonMin && lon < b.lonMax;
    const marginLat = b ? (b.latMax - b.latMin) * 0.22 : 0;
    const wellInside = inside &&
      lat > b.latMin + marginLat && lat < b.latMax - marginLat;
    if (wellInside && (this.imagery.atBest || this.imagery.res_m <= wantRes * 1.6)) return;

    this.imagery.busy = true;
    this.lastImageryAt = now;
    try {
      const tile = await this.streams.imageryTile(lat, lon, wantRes);
      if (!tile) { this.imagery.lastError = 'no tile returned'; return; }
      /* Imagery coarser than the vendored colour map is not an improvement, it
         is a rectangle. The global map resolves about 1.3 km per pixel, so
         anything above that is dropped rather than laid over the Moon. */
      if (tile.res_m > 1300) return;
      if (this.imagery.res_m !== null && tile.res_m > this.imagery.res_m && wellInside) return;
      /* The same tile again is not worth a new texture upload. */
      if (tile.key === this.imagery.key) { this.imagery.atBest = tile.atBest; return; }
      this.imagery.bounds = tile.bounds;
      this.imagery.level = tile.level;
      this.imagery.res_m = tile.res_m;
      this.imagery.source = tile.source;
      this.imagery.key = tile.key;
      this.imagery.atBest = tile.atBest;
      this.terrain.setImagery(tile.bitmap, tile.bounds);
      this.imagery.lastError = null;
      this.onLayer('imagery', tile);
    } catch (e) {
      /* Keep the last picture, and keep the reason the new one did not come:
         dropping it entirely is what made a dead network indistinguishable
         from ground that simply has no finer mosaic. */
      this.imagery.lastError = e.message || String(e);
    } finally {
      this.imagery.busy = false;
    }
  }

  /**
   * What the overlay should say about the surface under the player — including
   * what went wrong, which is the part that was recorded and never read. Four
   * fields here were written on every failure and never surfaced anywhere,
   * which reads like handled error plumbing and is worse than none: the game's
   * whole claim is that it tells you what it knows and how it knows it.
   */
  describe() {
    const finest = this.rings.filter(r => r.layer).sort((a, b) => a.layer.res_m - b.layer.res_m)[0];
    /* The nearest ring that could not be had, and why. Nearest first, because
       that is the one whose absence you are actually standing on. */
    const failed = this.rings.filter(r => r.lastError);
    const skipped = this.rings.filter(r => r.skipped !== null && !r.layer);
    return {
      elevation: finest ? finest.layer : null,
      imagery: this.imagery.bounds ? {
        res_m: this.imagery.res_m, source: this.imagery.source, level: this.imagery.level,
      } : null,
      /* Nothing finer was fetched, and here is why: a request that failed, or
         a request that succeeded and brought back nothing better than the
         ground already has. Those are different facts. */
      elevationError: failed.length ? failed[failed.length - 1].lastError : null,
      elevationSkipped: !finest && skipped.length
        ? Math.min(...skipped.map(r => r.skipped)) : null,
      imageryError: this.imagery.lastError,
      status: this.streams.status(),
    };
  }
}
