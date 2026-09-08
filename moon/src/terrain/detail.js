/* =============================================================================
   DETAIL — the sub-resolution surface, and only the sub-resolution surface
   -----------------------------------------------------------------------------
   The measured data stops at 118 m/px over most of the Moon and 2 m/px at
   Tranquility Base. Standing on it, you would be looking at a smooth plastic
   sheet. This module adds what a real surface has below that scale: small
   craters, the rolling roughness between them, and scattered rocks.

   The rule that keeps this honest is a band limit. Every component is faded out
   for wavelengths longer than about twice the source pixel, so a real 500 m
   crater is never touched, moved, filled or duplicated; the invention starts
   only where the measurement runs out. Turn the source resolution up (walk into
   the 2 m window at Tranquility Base) and the procedural contribution shrinks
   to match.

   Everything is a pure function of position and a global seed, so the main
   thread, the terrain workers and the Node tests all produce the same surface,
   and the rock you tripped over is still there when you walk back.

   Crater statistics follow the observed equilibrium size-frequency
   distribution on the maria: a cumulative power law of exponent about -1.83,
   depth/diameter near 0.2 when fresh, rims about 0.04 D, ejecta thinning as
   r^-3 (Hartmann & Gaskell; Pike). Roughness amplitude is scaled so that a
   100 m baseline sees a few metres of relief, which is what the Apollo panoramas
   look like.
   ========================================================================== */

import { TERRAIN } from '../config.js';

const R = 1737400;
const DEG = Math.PI / 180;

/* --- hashing ---------------------------------------------------------------
   Integer hash, not sin() based: identical in every engine, and stable across
   the huge coordinates a full-scale Moon produces. */
function hash3(x, y, z, seed) {
  let h = seed ^ 0x9e3779b9;
  h = Math.imul(h ^ (x | 0), 0x85ebca6b); h ^= h >>> 13;
  h = Math.imul(h ^ (y | 0), 0xc2b2ae35); h ^= h >>> 16;
  h = Math.imul(h ^ (z | 0), 0x27d4eb2f); h ^= h >>> 15;
  return h >>> 0;
}
const rand01 = (h) => h / 4294967296;

/** Three independent randoms from one cell hash. */
function cellRandom(x, y, z, seed, out = [0, 0, 0]) {
  const h = hash3(x, y, z, seed);
  out[0] = rand01(h);
  out[1] = rand01(Math.imul(h ^ 0x51633e2d, 0x9e3779b1) >>> 0);
  out[2] = rand01(Math.imul(h ^ 0x1b873593, 0x85ebca77) >>> 0);
  return out;
}

/* --- value noise on the sphere ---------------------------------------------
   Sampling in 3-D world space avoids every projection artefact: no stretched
   noise at the poles, no seam at the date line. */
function valueNoise3(x, y, z, seed) {
  const xi = Math.floor(x), yi = Math.floor(y), zi = Math.floor(z);
  const xf = x - xi, yf = y - yi, zf = z - zi;
  const u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf), w = zf * zf * (3 - 2 * zf);
  let acc = 0;
  for (let dz = 0; dz < 2; dz++) {
    const wz = dz ? w : 1 - w;
    for (let dy = 0; dy < 2; dy++) {
      const wy = dy ? v : 1 - v;
      for (let dx = 0; dx < 2; dx++) {
        const wx = dx ? u : 1 - u;
        acc += wx * wy * wz * (rand01(hash3(xi + dx, yi + dy, zi + dz, seed)) * 2 - 1);
      }
    }
  }
  return acc;
}

/**
 * How much a component of wavelength `lambda` is allowed to contribute when the
 * source data resolves `res` metres per pixel. Full strength well below the
 * Nyquist limit, zero at and above it.
 */
export function bandWeight(lambda, res) {
  const cut = 2 * res;
  if (lambda >= cut) return 0;
  const t = 1 - lambda / cut;
  return t * t * (3 - 2 * t);
}

export class Detail {
  /**
   * @param {object} opts { seed, ampAt100m, hurst, craterMinD, rockCell,
   *                        enabled, roughness(lat,lon) -> 0..1 }
   */
  constructor(opts = {}) {
    this.seed = opts.seed ?? TERRAIN.seed;
    this.amp100 = opts.ampAt100m ?? TERRAIN.detailAmpAt100m;
    this.hurst = opts.hurst ?? TERRAIN.detailHurst;
    this.craterMinD = opts.craterMinD ?? TERRAIN.craterMinD;
    this.rockCell = opts.rockCell ?? TERRAIN.rockCell;
    this.eqSlope = opts.eqSlope ?? TERRAIN.craterEqSlope;
    /* A safety stop, not the working limit. What actually decides how far down
       the crater bands run is the vertex spacing of the tile being built: see
       `craters`. Five bands used to be the limit, and with a 1.9 km source
       pixel that meant the smallest crater anywhere on the far side was sixty
       metres across, so a hundred metres of ground held two enormous bowls and
       nothing else. */
    this.maxBands = opts.maxBands ?? 14;
    this.enabled = opts.enabled !== false;
    /* Terrain roughness varies with geology: highlands are saturated with old
       craters and much rougher than young mare. Supplied by the caller from the
       USGS unit map; 0.5 is a neutral default. */
    this.roughnessAt = opts.roughness || (() => 0.5);
  }

  /** Unit vector for a lat/lon, in the same frame the heightfield uses. */
  _unit(lat, lon, out) {
    const la = lat * DEG, lo = lon * DEG, c = Math.cos(la);
    out.x = c * Math.cos(lo); out.y = c * Math.sin(lo); out.z = Math.sin(la);
    return out;
  }

  /**
   * Fractal roughness: octaves of value noise, each faded in only once the
   * source data is too coarse to contain it.
   */
  roughness(lat, lon, res, rough, minLambda = 0.25) {
    const p = this._unit(lat, lon, this._p || (this._p = { x: 0, y: 0, z: 0 }));
    const x = p.x * R, y = p.y * R, z = p.z * R;
    let h = 0;
    /* Wavelengths from the resolution limit down to the finest the geometry
       asking the question can actually hold. */
    let lambda = 2048;
    while (lambda > res * 2) lambda *= 0.5;
    const floor = Math.max(0.25, minLambda);
    /* Nine octaves below the resolution limit. Anything finer contributes a few
       centimetres of geometry and is far cheaper as shader normal detail. */
    for (let n = 0; n < 9 && lambda >= floor; lambda *= 0.5, n++) {
      const w = bandWeight(lambda, res);
      if (w <= 0) continue;
      const amp = this.amp100 * Math.pow(lambda * 0.01, this.hurst);
      const f = 1 / lambda;
      h += w * amp * valueNoise3(x * f, y * f, z * f, this.seed ^ (lambda * 7919));
    }
    return h * (0.55 + 1.1 * rough);
  }

  /**
   * Crater field.
   *
   * Craters are anchored to a lattice of cubic cells, one candidate per cell per
   * size band. Two details matter for correctness:
   *
   *  - Only cells that the sphere actually passes through produce a crater. The
   *    surface is two-dimensional; cells floating above or buried below it hold
   *    nothing.
   *  - The candidate is jittered *tangentially*, in the plane of the surface at
   *    its cell centre, not freely in three dimensions. Jittering in space and
   *    then projecting onto the sphere would let a crater slide several cells
   *    from where it was hashed, and it would pop into existence when the query
   *    point crossed a cell boundary. Keeping the jitter tangential and bounded
   *    guarantees that every crater able to influence a point lies in one of the
   *    twenty-seven neighbouring cells, so the surface is continuous.
   */
  craters(lat, lon, res, rough, minLambda = 0) {
    const p = this._unit(lat, lon, this._c || (this._c = { x: 0, y: 0, z: 0 }));
    const px = p.x * R, py = p.y * R, pz = p.z * R;
    const maxD = Math.min(2 * res, 4000);
    /* The lower end is set by whoever is asking, not by a fixed band count. A
       tile whose vertices are half a metre apart can hold a two-metre crater
       and should have thousands of them; a tile whose vertices are twenty
       kilometres apart cannot hold any of this and must not pay for it, and
       would only alias if it tried. Three vertices across is the smallest bowl
       that reads as a bowl rather than as a spike. */
    const minD = Math.max(this.craterMinD, minLambda);
    let h = 0, bands = 0;
    const rnd = this._r || (this._r = [0, 0, 0]);
    for (let D = maxD; D >= minD && bands < this.maxBands; D *= 0.5) {
      const w = bandWeight(D * 2.2, res);
      if (w <= 0) continue;
      bands++;
      const cell = D * 3.2;
      const jitter = 0.8 * cell;          // +/- 0.4 cell, the bound the proof needs
      const reach = D * 1.25;             // 2.5 crater radii
      /* Half a cell per axis in three dimensions is 0.4*sqrt(3) of a cell in
         the worst case, and projecting onto the sphere cannot lengthen it. */
      const maxOffset = 0.4 * Math.sqrt(3) * cell;
      const farLimit2 = (reach + maxOffset) * (reach + maxOffset);
      const inv = 1 / cell;
      const cx = Math.floor(px * inv), cy = Math.floor(py * inv), cz = Math.floor(pz * inv);
      const band = this.seed ^ ((D * 1000) | 0);
      /* A cube of side `cell` centred at distance cl from the origin can only
         be cut by the sphere when |cl - R| <= half its diagonal. */
      const half = 0.867 * cell;
      const rLo = R - half, rHi = R + half, rLo2 = rLo * rLo, rHi2 = rHi * rHi;
      for (let dz = -1; dz <= 1; dz++) {
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            const hx = cx + dx, hy = cy + dy, hz = cz + dz;
            const ccx = (hx + 0.5) * cell, ccy = (hy + 0.5) * cell, ccz = (hz + 0.5) * cell;
            const cl2 = ccx * ccx + ccy * ccy + ccz * ccz;
            if (cl2 < rLo2 || cl2 > rHi2) continue;     // the surface misses this cell
            const cl = Math.sqrt(cl2);
            /* Reject the cell before hashing it. The crater it may hold sits
               within `maxOffset` of the cell centre and reaches `reach` beyond
               itself, so a cell whose centre is further than the sum away
               cannot touch this point however it hashes. Most of the
               twenty-seven fail here, and the hash and the projection below
               are the expensive part. */
            const k0 = R / cl;
            const sx = px - ccx * k0, sy = py - ccy * k0, sz = pz - ccz * k0;
            if (sx * sx + sy * sy + sz * sz > farLimit2) continue;

            const hh = hash3(hx, hy, hz, band);
            const occupancy = 0.85 * (0.55 + 0.9 * rough);
            if (rand01(hh) > occupancy) continue;
            cellRandom(hx, hy, hz, this.seed ^ 0x2545f491, rnd);
            /* Jitter the cell centre in space and project the result back down
               to the surface. Projection can only shorten the tangential part
               of a displacement and discards the radial part entirely, so a
               jitter bounded by half a cell per axis moves the crater by at
               most `maxOffset` along the surface -- which is what makes the
               twenty-seven neighbours a complete search and stops craters
               popping in and out as the query crosses a cell boundary. */
            const qx = ccx + (rnd[0] - 0.5) * jitter;
            const qy = ccy + (rnd[1] - 0.5) * jitter;
            const qz = ccz + (rnd[2] - 0.5) * jitter;
            const ql = Math.sqrt(qx * qx + qy * qy + qz * qz) || 1;
            const k = R / ql;
            const ex = px - qx * k, ey = py - qy * k, ez = pz - qz * k;
            const dist2 = ex * ex + ey * ey + ez * ez;
            if (dist2 > reach * reach) continue;
            const dist = Math.sqrt(dist2);
            /* Age: fresh craters are deep bowls with sharp rims, old ones are
               shallow dishes. Both exist side by side on a real surface. It is
               drawn from the cell hash rather than from the jitter triple, so
               that moving a crater does not also change how old it is. */
            /* Weighted towards old, because most craters are. A surface at
               equilibrium is mostly degraded bowls a few per cent deep with a
               minority of sharp fresh ones, not a field of identical dimples;
               sqrt of a uniform draw puts the mean age at two thirds. */
            const age = Math.sqrt(rand01(Math.imul(hh ^ 0x6d2b79f5, 0x9e3779b1) >>> 0));
            const depth = D * (0.17 - 0.12 * age);
            const rim = D * (0.038 - 0.026 * age);
            h += w * craterProfile(dist / (D * 0.5), depth, rim);
          }
        }
      }
    }
    return h;
  }

  /** Total procedural elevation at a point, in metres. */
  heightAt(lat, lon, res, minLambda = 0) {
    if (!this.enabled || !(res > 0)) return 0;
    const rough = this.roughnessAt(lat, lon);
    return this.roughness(lat, lon, res, rough, minLambda) +
           this.craters(lat, lon, res, rough, minLambda);
  }

  /**
   * Rocks lying on the surface in a patch, for instanced rendering and for
   * collision. Deterministic, so the boulder you climbed is there tomorrow.
   *
   * @returns {Array<{lat,lon,radius,seed,tilt}>}
   */
  rocks(latMin, lonMin, latMax, lonMax, minLambda, density = 1) {
    const out = [];
    if (!this.enabled || density <= 0) return out;
    /* Rocks are scattered by how close the tile is, not by how good the
       elevation data is. There are rocks on every square metre of the Moon
       whether or not anyone has flown a laser altimeter over it at two metres
       a pixel, and gating on the source resolution -- which is what this used
       to do -- meant the entire far side had a bare, swept-looking surface
       because the only elevation there is 1.9 km per pixel.

       What the gate is really for is cost: only tiles small enough to be
       underfoot should carry instances. Eight metres is a tile about eighty
       across, so rocks appear within a couple of hundred metres of you and a
       ten-centimetre cobble beyond that would be under a pixel anyway. */
    if (!(minLambda <= 8)) return out;
    const midLat = (latMin + latMax) / 2;
    const mPerDegLat = R * DEG;
    const mPerDegLon = R * DEG * Math.max(0.02, Math.cos(midLat * DEG));
    const cell = this.rockCell;
    const y0 = Math.floor(latMin * mPerDegLat / cell), y1 = Math.ceil(latMax * mPerDegLat / cell);
    const x0 = Math.floor(lonMin * mPerDegLon / cell), x1 = Math.ceil(lonMax * mPerDegLon / cell);
    if ((x1 - x0) * (y1 - y0) > 20000) return out;      // sanity guard
    const rnd = [0, 0, 0];
    for (let gy = y0; gy <= y1; gy++) {
      for (let gx = x0; gx <= x1; gx++) {
        cellRandom(gx, gy, 0, this.seed ^ 0x7f4a7c15, rnd);
        const rough = this.roughnessAt((gy + 0.5) * cell / mPerDegLat, (gx + 0.5) * cell / mPerDegLon);
        /* Rock abundance on the Moon is a percent or two of the surface; the
           size distribution is another D^-2-ish power law, so metre boulders
           are rare and pebbles are everywhere. */
        const count = Math.round((0.4 + 2.6 * rough) * density);
        for (let k = 0; k < count; k++) {
          const h = hash3(gx, gy, k + 1, this.seed ^ 0x68e31da4);
          const r0 = rand01(h);
          const r1 = rand01(Math.imul(h ^ 0x2545f491, 0x9e3779b1) >>> 0);
          const r2 = rand01(Math.imul(h ^ 0x94d049bb, 0x85ebca6b) >>> 0);
          const radius = 0.06 * Math.pow(1 - r2 * 0.999, -0.45);   // metres
          if (radius > 4.5) continue;
          const lat = ((gy + r0) * cell) / mPerDegLat;
          const lon = ((gx + r1) * cell) / mPerDegLon;
          if (lat < latMin || lat > latMax || lon < lonMin || lon > lonMax) continue;
          out.push({ lat, lon, radius, seed: h, tilt: r1 * Math.PI * 2 });
        }
      }
    }
    return out;
  }
}

/**
 * Radial profile of a crater, normalised to its radius.
 *
 * Inside: a bowl that flattens towards the floor and towards the rim crest, so
 * the steepest wall sits at about 0.6 of the radius. For a fresh crater with
 * depth/diameter near 0.2 that puts the maximum wall slope around 32 degrees,
 * which is what small lunar craters actually have; a plain paraboloid would put
 * a 39 degree wall right at the rim, steeper than regolith stands.
 *
 * Outside: the raised rim decaying as r^-3, the classical ejecta thinning law,
 * faded out by two and a half radii.
 */
export function craterProfile(t, depth, rim) {
  if (t < 1) {
    const s = 1 - t * t;
    return -depth * s * s + rim * t * t * t * t;
  }
  if (t > 2.5) return 0;
  const e = (t - 1) / 1.5;
  return rim * Math.pow(1 + (t - 1) * 4, -3) * (1 - e * e);
}
