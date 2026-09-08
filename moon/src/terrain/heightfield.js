/* =============================================================================
   HEIGHTFIELD — the elevation of the Moon at any point, and where it came from
   -----------------------------------------------------------------------------
   Pure JS: this runs on the main thread for physics, inside the terrain workers
   for geometry, and in Node for the tests. Identical results in all three, which
   is what keeps your boots on the surface you can see.

   A stack of rasters covers the Moon at different resolutions:

       vendored LOLA pyramid    2 .. 16 ppd     everywhere, always available
       streamed LOLA 256 ppd    118 m/px        everywhere, needs the network
       streamed LOLA polar      5 .. 100 m/px   near the poles
       streamed NAC DTMs        1.5 .. 5 m/px   about fifty patches
       vendored Apollo 11 NAC   2 m/px          Tranquility Base
       vendored Apollo 11 SLDEM 59 m/px         around Tranquility Base

   sample() takes the best layer covering a point and cross-fades into the
   coarser one across a margin, so a resolution boundary is never a cliff. It
   also reports which layer answered and at what pixel size, which is what the
   SCIENCE overlay prints and what tells the procedural detail how fine it is
   allowed to be.

   The only place terrain is *edited* is a landing pad under the ship, and that
   is labelled FICTIONAL wherever it shows up.
   ========================================================================== */

import { LABEL } from '../config.js';
import { wrapLon } from '../physics/frames.js';

/** One resident raster: a regular lat/lon grid of elevations in metres. */
export class Raster {
  /**
   * @param {object} spec  { id, bbox:[w,s,e,n], width, height, res_m, priority,
   *                         source, label, wrapX }
   * @param {Float32Array|Int16Array} data  row 0 at the north edge, column 0 at
   *        the west edge. Int16 is used for the global pyramid, where elevation
   *        is stored as whole metres and the array would otherwise be 66 MB.
   */
  constructor(spec, data) {
    this.id = spec.id;
    this.bbox = spec.bbox;
    this.width = spec.width;
    this.height = spec.height;
    this.res_m = spec.res_m;
    this.priority = spec.priority ?? 2;
    this.source = spec.source || spec.id;
    this.label = spec.label || LABEL.MEASURED;
    this.wrapX = !!spec.wrapX;
    this.data = data;
    /* Stored counts become metres as value * scale + offset. The global
       pyramid is whole metres and needs neither, but a two metre window over
       ninety metres of relief would be terraced into steps you can see and
       walk up, so those are stored in millimetres about a local datum. */
    this.scale = spec.scale ?? 1;
    this.offset = spec.offset ?? 0;
    const [w, s, e, n] = spec.bbox;
    this.lonSpan = e - w;
    this.latSpan = n - s;
    this.pxLon = this.lonSpan / spec.width;
    this.pxLat = this.latSpan / spec.height;
    /* Fade to the layer beneath across this many degrees at the edge, so the
       seam between a 2 m patch and a 118 m background is a slope, not a step. */
    this.margin = spec.margin ?? Math.min(this.lonSpan, this.latSpan) * 0.06;
  }

  /** Is a point inside, allowing for longitude wrap on global layers? */
  contains(lat, lon) {
    const [w, s, e, n] = this.bbox;
    if (lat < s || lat > n) return false;
    if (this.wrapX) return true;
    const l = this.normLon(lon);
    return l >= w && l <= e;
  }

  normLon(lon) {
    const [w, , e] = this.bbox;
    let l = lon;
    if (l < w) l += 360;
    if (l > e) l -= 360;
    return l;
  }

  /**
   * How strongly this layer should be trusted at a point: 1 well inside,
   * falling to 0 at the edge so the coarser layer takes over smoothly.
   */
  weight(lat, lon) {
    if (!this.contains(lat, lon)) return 0;
    if (this.margin <= 0) return 1;
    const [w, s, e, n] = this.bbox;
    const l = this.normLon(lon);
    const dx = this.wrapX ? Infinity : Math.min(l - w, e - l);
    const dy = Math.min(lat - s, n - lat);
    const d = Math.min(dx, dy);
    if (d >= this.margin) return 1;
    const t = Math.max(0, d) / this.margin;
    return t * t * (3 - 2 * t);
  }

  /** Bilinear elevation in metres. Pixel centres are at half-integer indices. */
  sample(lat, lon) {
    const [w, , , n] = this.bbox;
    const l = this.normLon(lon);
    let x = (l - w) / this.pxLon - 0.5;
    let y = (n - lat) / this.pxLat - 0.5;
    const W = this.width, H = this.height;
    const x0 = Math.floor(x), y0 = Math.floor(y);
    const fx = x - x0, fy = y - y0;
    const cx = (i) => this.wrapX ? ((i % W) + W) % W : Math.min(W - 1, Math.max(0, i));
    const cy = (j) => Math.min(H - 1, Math.max(0, j));
    const d = this.data;
    const j0 = cy(y0) * W, j1 = cy(y0 + 1) * W;
    const i0 = cx(x0), i1 = cx(x0 + 1);
    return ((d[j0 + i0] * (1 - fx) + d[j0 + i1] * fx) * (1 - fy) +
            (d[j1 + i0] * (1 - fx) + d[j1 + i1] * fx) * fy) * this.scale + this.offset;
  }
}

/** A flattened circle of ground: the one thing that edits real terrain. */
export class Pad {
  constructor({ lat, lon, radius, feather, height }) {
    this.lat = lat; this.lon = lon;
    this.radius = radius; this.feather = feather;
    this.height = height;
  }
}

const DEG = Math.PI / 180;
const R = 1737400;

export class Heightfield {
  constructor() {
    this.rasters = [];
    this.pads = [];
    this.measuredMask = null;      // { width, height, data: Uint8Array }
    this.detail = null;            // set by attachDetail(); optional
    this._byId = new Map();
  }

  addRaster(raster) {
    if (this._byId.has(raster.id)) this.removeRaster(raster.id);
    this.rasters.push(raster);
    this._byId.set(raster.id, raster);
    /* Finest first, and among equals prefer the better-quality source. */
    this.rasters.sort((a, b) => a.res_m - b.res_m || a.priority - b.priority);
    return raster;
  }

  removeRaster(id) {
    const r = this._byId.get(id);
    if (!r) return;
    this._byId.delete(id);
    this.rasters.splice(this.rasters.indexOf(r), 1);
  }

  has(id) { return this._byId.has(id); }

  setPads(pads) { this.pads = pads; }

  addPad(pad) { this.pads.push(pad); return pad; }

  /** Attach the procedural detail generator (terrain/detail.js). */
  attachDetail(detail) { this.detail = detail; }

  /**
   * Elevation from measured data alone, plus its provenance.
   * Layers are blended from finest to coarsest by their edge weights, so a
   * high-resolution patch fades into its surroundings instead of ending in a
   * wall.
   *
   * @returns {{h:number, res_m:number, source:string, label:string, id:string}}
   */
  sampleData(lat, lon, out = {}) {
    let remaining = 1, h = 0, res = 0, best = null;
    for (const r of this.rasters) {
      const w = r.weight(lat, lon);
      if (w <= 0) continue;
      const use = w * remaining;
      h += r.sample(lat, lon) * use;
      res += r.res_m * use;
      if (!best) best = r;
      remaining -= use;
      if (remaining <= 1e-6) break;
    }
    if (remaining > 1e-6) {
      /* Nothing covers this point: only possible before the vendored global
         layer has loaded. Report the datum and say so. */
      res += 1e6 * remaining;
      out.h = h; out.res_m = res; out.source = 'no data loaded';
      out.label = LABEL.INTERPOLATED; out.id = null;
      return out;
    }
    out.h = h;
    out.res_m = res;
    out.source = best ? best.source : 'no data loaded';
    out.label = best ? best.label : LABEL.INTERPOLATED;
    out.id = best ? best.id : null;
    if (this.measuredMask && best && best.res_m > 900) {
      /* At LOLA pyramid resolution the observation-count grid says whether this
         pixel was actually ranged or filled in between ground tracks. */
      out.label = this.isMeasured(lat, lon) ? LABEL.MEASURED : LABEL.INTERPOLATED;
    }
    return out;
  }

  /** LOLA observation-count mask lookup: did the altimeter hit this pixel? */
  isMeasured(lat, lon) {
    const m = this.measuredMask;
    if (!m) return true;
    const x = Math.min(m.width - 1, Math.max(0, Math.floor((wrapLon(lon) + 180) / 360 * m.width)));
    const y = Math.min(m.height - 1, Math.max(0, Math.floor((90 - lat) / 180 * m.height)));
    return m.data[y * m.width + x] > 127;
  }

  /** Apply landing pads. They are the only edit to real terrain in the game. */
  applyPads(lat, lon, h) {
    for (const p of this.pads) {
      const d = this.groundDistance(lat, lon, p.lat, p.lon);
      if (d > p.radius + p.feather) continue;
      const t = d <= p.radius ? 1
        : 1 - smoothstep(p.radius, p.radius + p.feather, d);
      h = h * (1 - t) + p.height * t;
    }
    return h;
  }

  groundDistance(lat1, lon1, lat2, lon2) {
    const p1 = lat1 * DEG, p2 = lat2 * DEG, dl = (lon2 - lon1) * DEG;
    const s = Math.sin((p2 - p1) / 2) ** 2 + Math.cos(p1) * Math.cos(p2) * Math.sin(dl / 2) ** 2;
    return 2 * R * Math.asin(Math.min(1, Math.sqrt(s)));
  }

  /**
   * The elevation the game actually uses: measured data, plus procedural detail
   * band-limited to wavelengths the data cannot resolve, plus landing pads.
   *
   * Because the detail is limited to below the source pixel size, a real crater
   * stays exactly where the measurement puts it; only the pebbles are invented.
   */
  /**
   * @param {number} minLambda  the finest wavelength the caller can hold, in
   *   metres. A tile passes its own vertex spacing so it neither misses the
   *   detail it could show nor computes detail it would only alias. Physics
   *   asks with the default and gets everything.
   */
  heightAt(lat, lon, minLambda = 0) {
    const s = this.sampleData(lat, lon, this._tmp || (this._tmp = {}));
    let h = s.h;
    if (this.detail) h += this.detail.heightAt(lat, lon, s.res_m, minLambda);
    return this.pads.length ? this.applyPads(lat, lon, h) : h;
  }

  /** Full answer including provenance, for the SCIENCE overlay and the scanner. */
  probe(lat, lon) {
    const s = this.sampleData(lat, lon, {});
    const proc = this.detail ? this.detail.heightAt(lat, lon, s.res_m) : 0;
    const base = s.h + proc;
    const padded = this.pads.length ? this.applyPads(lat, lon, base) : base;
    return {
      height: padded,
      dataHeight: s.h,
      proceduralHeight: proc,
      padded: Math.abs(padded - base) > 1e-6,
      res_m: s.res_m,
      source: s.source,
      label: s.label,
      layer: s.id,
      measured: this.measuredMask ? this.isMeasured(lat, lon) : null,
    };
  }

  /**
   * Surface normal in the local East/North/Up frame, from finite differences at
   * a spacing matched to the data resolution.
   */
  normalAt(lat, lon, step) {
    const s = step || Math.max(0.5, this.sampleData(lat, lon, {}).res_m * 0.5);
    const dLat = (s / R) / DEG;
    const dLon = dLat / Math.max(0.02, Math.cos(lat * DEG));
    const hE = this.heightAt(lat, lon + dLon), hW = this.heightAt(lat, lon - dLon);
    const hN = this.heightAt(lat + dLat, lon), hS = this.heightAt(lat - dLat, lon);
    const dhde = (hE - hW) / (2 * s), dhdn = (hN - hS) / (2 * s);
    const inv = 1 / Math.sqrt(1 + dhde * dhde + dhdn * dhdn);
    return { e: -dhde * inv, n: -dhdn * inv, u: inv };
  }

  /** Slope in degrees, the number the site picker and the rover care about. */
  slopeAt(lat, lon, step) {
    const n = this.normalAt(lat, lon, step);
    return Math.acos(Math.min(1, Math.max(-1, n.u))) / DEG;
  }
}

export function smoothstep(a, b, x) {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
}

/* --- building rasters from the vendored pyramid ---------------------------- */

/**
 * Assemble the tiles of one pyramid level into a single global raster.
 * @param {object} layer  a manifest entry from data/manifest.json
 * @param {Array<{x:number,y:number,data:Float32Array}>} tiles
 */
export function rasterFromPyramid(layer, tiles) {
  const { w, h, tile } = layer;
  /* Int16 metres: the global 16 ppd layer is 16.6 million samples, which is
     33 MB here and would be 66 MB as float32, copied into every worker. */
  const data = new Int16Array(w * h);
  for (const t of tiles) {
    const ox = t.x * tile, oy = t.y * tile;
    for (let j = 0; j < tile; j++) {
      data.set(t.data.subarray(j * tile, (j + 1) * tile), (oy + j) * w + ox);
    }
  }
  return new Raster({
    id: layer.id, bbox: [-180, -90, 180, 90], width: w, height: h,
    res_m: layer.res_m, priority: layer.priority ?? 1, source: layer.source,
    label: 'MEASURED', wrapX: true, margin: 0,
  }, data);
}
