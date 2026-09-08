// The planet, expressed as pure math.
//
// Everything about THERA's shape — where the land is, how high, how wet, which
// biome, where the rivers run and where the volcanoes stand — is an analytic
// function of (x, z). Nothing here touches the DOM or three.js, so the whole
// planet can be probed from node in test/field.test.mjs.

import { Noise, hash2, clamp, lerp, smoothstep } from '../math/noise.js';
import { WORLD_SEED, PLANET } from '../config.js';

export const BIOME = {
  OCEAN: 0, BEACH: 1, JUNGLE: 2, PLAINS: 3,
  SWAMP: 4, HIGHLAND: 5, VOLCANIC: 6, ALPINE: 7,
};

export const BIOME_NAME = [
  'ABYSSAL SHELF', 'COASTAL STRAND', 'CANOPY JUNGLE', 'INTERIOR PLAINS',
  'MIRE BASIN', 'HIGHLAND SCARP', 'VOLCANIC WASTE', 'ALPINE RIDGE',
];

// --- noise banks -----------------------------------------------------------
const nCont = new Noise(WORLD_SEED);
const nWarp = new Noise(WORLD_SEED + 17);
const nWarp2 = new Noise(WORLD_SEED + 29);
const nMtn = new Noise(WORLD_SEED + 53);
const nMask = new Noise(WORLD_SEED + 71);
const nHill = new Noise(WORLD_SEED + 97);
const nDetail = new Noise(WORLD_SEED + 131);
const nMoist = new Noise(WORLD_SEED + 173);
const nRiver = new Noise(WORLD_SEED + 211);
const nHot = new Noise(WORLD_SEED + 257);
const nMicro = new Noise(WORLD_SEED + 307);

// --- frequencies (1 / metres) ---------------------------------------------
const F_CONT = 0.0000172;
const F_WARP = 0.0000355;
const F_MASK = 0.0000615;
const F_MTN = 0.000223;
const F_HILL = 0.00108;
const F_DETAIL = 0.0061;
const F_MICRO = 0.031;
const F_MOIST = 0.0000712;
const F_RIVER = 0.000094;
const F_HOT = 0.0000418;

const SEA = PLANET.seaLevel;

/** Domain-warped continental field, roughly [-1, 1]. Positive is land. */
export function continentField(x, z) {
  const wx = nWarp.noise2(x * F_WARP, z * F_WARP) * 9000;
  const wz = nWarp2.noise2(x * F_WARP + 41.3, z * F_WARP - 17.9) * 9000;
  // The +0.17 bias is deliberate: THERA is a land-heavy world, because an
  // ocean planet is a boring one to be stranded on.
  return nCont.fbm2((x + wx) * F_CONT, (z + wz) * F_CONT, 4, 2.11, 0.52) + 0.17;
}

/** How mountainous this longitude/latitude wants to be, 0..1. */
export function orogenyField(x, z) {
  const m = nMask.fbm2(x * F_MASK, z * F_MASK, 3, 2.07, 0.5);
  return smoothstep(-0.08, 0.52, m);
}

/** Volcanic hotspot intensity, 0..1. High values are the ash-and-lava country. */
export function hotspotField(x, z) {
  const h = nHot.fbm2(x * F_HOT + 88.1, z * F_HOT - 51.7, 3, 2.13, 0.52);
  return smoothstep(0.14, 0.62, h);
}

/**
 * Broad, smooth land elevation with no crags in it. Rivers use this as their
 * gradient so their surface always slopes downhill toward the sea.
 */
export function broadHeight(x, z) {
  const c = continentField(x, z);
  const shelf = c < 0
    ? c * 320                                   // ocean basins
    : Math.pow(c, 1.22) * 900;                  // land mass rises inland
  const oro = orogenyField(x, z);
  const swell = nHill.fbm2(x * F_HILL * 0.22, z * F_HILL * 0.22, 2, 2.0, 0.5) * 46 * (0.4 + oro);
  return shelf + (c > 0 ? swell : swell * 0.2);
}

// --- rivers ----------------------------------------------------------------
const RIVER_HALFWIDTH = 0.052;

/** 0 outside a river, 1 dead in the middle of the channel. */
export function riverField(x, z) {
  const wx = nWarp.noise2(x * F_RIVER * 0.6 + 300, z * F_RIVER * 0.6) * 2600;
  const wz = nWarp2.noise2(x * F_RIVER * 0.6, z * F_RIVER * 0.6 + 300) * 2600;
  const v = nRiver.fbm2((x + wx) * F_RIVER, (z + wz) * F_RIVER, 3, 2.09, 0.5);
  const t = 1 - smoothstep(0, RIVER_HALFWIDTH, Math.abs(v));
  // Rivers only exist on land, and thin out in the high mountains.
  const c = continentField(x, z);
  const landGate = smoothstep(0.005, 0.09, c);
  return t * landGate;
}

/** Height of a river's water surface at (x, z) — meaningful where riverField > 0. */
export function riverSurface(x, z) {
  return broadHeight(x, z) * 0.94 - 3.5;
}

// --- volcanoes -------------------------------------------------------------
const VOLC_CELL = 7400;        // one candidate site per 7.4 km cell
const volcCells = new Map();   // cell key -> site or null; sites never change

/** Deterministic volcano site for one cell, or null. Memoised: heightAt is hot. */
function volcanoCell(i, j) {
  const key = i * 73856093 ^ j * 19349663;
  let site = volcCells.get(key);
  if (site !== undefined) return site;
  site = null;
  const r0 = hash2(i, j, 7717);
  const hot = hotspotField((i + 0.5) * VOLC_CELL, (j + 0.5) * VOLC_CELL);
  if (r0 <= 0.14 + hot * 0.62) {
    const cx = (i + hash2(i, j, 31)) * VOLC_CELL;
    const cz = (j + hash2(i, j, 47)) * VOLC_CELL;
    if (continentField(cx, cz) >= 0.02) {
      site = {
        cx, cz,
        peak: 620 + hash2(i, j, 61) * 1500 * (0.45 + hot),
        radius: 1250 + hash2(i, j, 73) * 1900,
        hot,
      };
    }
  }
  if (volcCells.size > 4096) volcCells.clear();
  volcCells.set(key, site);
  return site;
}

/** Every volcano cone whose influence reaches within `pad` metres of (x, z). */
export function volcanoesNear(x, z, pad = 0) {
  const out = [];
  const ci = Math.floor(x / VOLC_CELL), cj = Math.floor(z / VOLC_CELL);
  const span = 1 + Math.ceil(pad / VOLC_CELL);
  for (let dj = -span; dj <= span; dj++) {
    for (let di = -span; di <= span; di++) {
      const s = volcanoCell(ci + di, cj + dj);
      if (s) out.push(s);
    }
  }
  return out;
}

/**
 * Volcano cone contribution at (x, z), plus the nearest cone's data.
 * Returns { h, dist, cx, cz, peak, radius } — dist is Infinity when none is near.
 */
export function volcanoAt(x, z) {
  const ci = Math.floor(x / VOLC_CELL), cj = Math.floor(z / VOLC_CELL);
  let sum = 0, best = Infinity, bx = 0, bz = 0, bp = 0, br = 1;
  for (let dj = -1; dj <= 1; dj++) {
    for (let di = -1; di <= 1; di++) {
      const s = volcanoCell(ci + di, cj + dj);
      if (!s) continue;
      const dx = x - s.cx, dz = z - s.cz;
      const d = Math.sqrt(dx * dx + dz * dz);
      const t = d / s.radius;
      if (t >= 3.2) continue;
      // Shield cone with a caldera bitten out of the summit.
      let cone = s.peak * Math.exp(-t * t * 1.05);
      const crater = s.radius * 0.14;
      if (d < crater) {
        const k = 1 - d / crater;
        cone -= s.peak * 0.19 * k * k * (3 - 2 * k);
      }
      sum += cone;
      if (d < best) { best = d; bx = s.cx; bz = s.cz; bp = s.peak; br = s.radius; }
    }
  }
  return { h: sum, dist: best, cx: bx, cz: bz, peak: bp, radius: br };
}

// --- the height field ------------------------------------------------------

/**
 * Terrain height in metres above sea level.
 * `detail` 0..1 trims the high-frequency octaves for distant LOD chunks, where
 * they would cost as much and be smaller than a pixel.
 */
export function heightAt(x, z, detail = 1) {
  const c = continentField(x, z);
  const oro = orogenyField(x, z);
  const hot = hotspotField(x, z);

  let h = c < 0 ? c * 330 - 12 : Math.pow(c, 1.22) * 920;

  // Continental shelf: flatten the near-shore so beaches are gentle.
  if (c > -0.055 && c < 0.045) {
    const t = smoothstep(-0.055, 0.045, c);
    h = lerp(-26, 14, t) * (0.65 + 0.35 * t);
  }

  const land = smoothstep(-0.01, 0.06, c);

  // Mountain ranges — ridged multifractal, gated by the orogeny mask.
  if (oro > 0.02 && land > 0.02) {
    const r = nMtn.ridged2(x * F_MTN, z * F_MTN, detail > 0.5 ? 6 : 4, 2.07, 0.52);
    const amp = 1180 * oro * oro * land;
    h += Math.pow(r, 1.35) * amp;
  }

  // Rolling hills everywhere on land.
  h += nHill.fbm2(x * F_HILL, z * F_HILL, 3, 2.05, 0.5) * (17 + 44 * oro) * land;

  // Volcanoes ride on top of everything.
  const v = volcanoAt(x, z);
  h += v.h;

  if (detail > 0.35) {
    const rough = 0.35 + 0.65 * oro;
    h += nDetail.fbm2(x * F_DETAIL, z * F_DETAIL, 3, 2.11, 0.5) * 7.5 * rough * (0.35 + land);
  }
  if (detail > 0.75) {
    h += nMicro.noise2(x * F_MICRO, z * F_MICRO) * 0.62 * (0.3 + land);
  }

  // River carving — after the mountains, so channels cut through ridges.
  const rf = riverField(x, z);
  if (rf > 0.001) {
    const surf = riverSurface(x, z);
    const bed = surf - 1.2 - 5.4 * rf;
    const t = smoothstep(0.0, 0.85, rf);
    if (bed < h) h = lerp(h, bed, t);
  }

  // Volcanic country is scoured flatter between the cones — old lava plains.
  if (hot > 0.55 && land > 0.5) {
    const t = (hot - 0.55) / 0.45 * 0.35;
    const plain = lerp(h, Math.max(h * 0.82, 30), t);
    h = plain;
  }

  return h;
}

/** Height of standing water at (x, z), or null where the ground is dry. */
export function waterAt(x, z) {
  const h = heightAt(x, z);
  const rf = riverField(x, z);
  if (rf > 0.18) {
    const lvl = riverSurface(x, z) - 1.1;
    if (lvl > h && lvl > SEA - 40) return Math.max(lvl, h + 0.05) > h ? lvl : null;
  }
  if (h < SEA) return SEA;
  return null;
}

/** Cheap surface normal from central differences. */
export function normalAt(x, z, e = 1.2) {
  const hL = heightAt(x - e, z), hR = heightAt(x + e, z);
  const hD = heightAt(x, z - e), hU = heightAt(x, z + e);
  let nx = hL - hR, ny = 2 * e, nz = hD - hU;
  const l = Math.hypot(nx, ny, nz) || 1;
  return [nx / l, ny / l, nz / l];
}

/** 0 = flat ground, 1 = vertical cliff. */
export function slopeAt(x, z, e = 2.0) {
  const n = normalAt(x, z, e);
  return clamp(1 - n[1], 0, 1);
}

/** Moisture, 0 (arid) .. 1 (dripping). */
export function moistureAt(x, z, h) {
  const base = nMoist.fbm2(x * F_MOIST, z * F_MOIST, 3, 2.03, 0.5) * 0.5 + 0.5;
  const height = h === undefined ? heightAt(x, z) : h;
  const coastal = 1 - smoothstep(0, 260, Math.max(0, height));
  const river = riverField(x, z);
  const alt = 1 - smoothstep(300, 1500, Math.max(0, height));
  return clamp(base * 0.72 + coastal * 0.24 + river * 0.35 + alt * 0.14, 0, 1);
}

/** Temperature, 0 (frozen) .. 1 (sweltering). Latitude is the z axis. */
export function temperatureAt(x, z, h) {
  const height = h === undefined ? heightAt(x, z) : h;
  const lat = clamp(1 - Math.abs(z) / 210000, 0, 1);
  const lapse = smoothstep(200, 2100, Math.max(0, height));
  const wobble = nMoist.noise2(x * F_MOIST * 0.7 + 500, z * F_MOIST * 0.7) * 0.09;
  return clamp(lat * 0.95 + 0.05 + wobble - lapse * 0.95, 0, 1);
}

/**
 * Full description of a spot on the planet. One call, because callers almost
 * always want several of these numbers at once and each is noise-expensive.
 */
export function sampleSite(x, z) {
  const h = heightAt(x, z);
  const slope = slopeAt(x, z);
  const moist = moistureAt(x, z, h);
  const temp = temperatureAt(x, z, h);
  const hot = hotspotField(x, z);
  const river = riverField(x, z);
  const water = waterAt(x, z);
  return { h, slope, moist, temp, hot, river, water, biome: classify(h, slope, moist, temp, hot, river) };
}

export function classify(h, slope, moist, temp, hot, river) {
  if (h < SEA - 0.4) return BIOME.OCEAN;
  if (h < SEA + 3.2 && slope < 0.34) return BIOME.BEACH;
  if (hot > 0.68 && h > 40) return BIOME.VOLCANIC;
  if (h > 1450 || (h > 950 && temp < 0.34)) return BIOME.ALPINE;
  if (h > 480 || slope > 0.52) return BIOME.HIGHLAND;
  if (moist > 0.70 && h < 70 && slope < 0.15) return BIOME.SWAMP;
  if (river > 0.05 && moist > 0.56) return BIOME.JUNGLE;
  if (moist > 0.60 && temp > 0.55) return BIOME.JUNGLE;
  return BIOME.PLAINS;
}

export function biomeAt(x, z) {
  return sampleSite(x, z).biome;
}

/**
 * Search outward from a hint for somewhere a spacecraft could put down:
 * dry land, gentle slope, not in a river, not on a cliff.
 */
export function findLandingSite(hintX, hintZ, wantBiome = BIOME.JUNGLE) {
  let best = null, bestScore = -Infinity;
  for (let ring = 0; ring < 26; ring++) {
    const r = ring * 145;
    const steps = ring === 0 ? 1 : 10 + ring * 2;
    for (let s = 0; s < steps; s++) {
      const a = (s / steps) * Math.PI * 2 + ring * 0.7;
      const x = hintX + Math.cos(a) * r;
      const z = hintZ + Math.sin(a) * r;
      const site = sampleSite(x, z);
      if (site.h < 6 || site.water !== null) continue;
      // Flatness sampled over the actual footprint of the ship.
      let maxDev = 0;
      for (let k = 0; k < 8; k++) {
        const ang = (k / 8) * Math.PI * 2;
        const d = Math.abs(heightAt(x + Math.cos(ang) * 13, z + Math.sin(ang) * 13) - site.h);
        if (d > maxDev) maxDev = d;
      }
      if (maxDev > 2.6) continue;
      let score = 100 - maxDev * 14 - site.slope * 90 - r * 0.004;
      if (site.biome === wantBiome) score += 45;
      if (site.river > 0.02 && site.river < 0.2) score += 22;   // near water, not in it
      if (site.h > 300) score -= 40;
      if (score > bestScore) { bestScore = score; best = { x, z, h: site.h, biome: site.biome }; }
    }
    if (best && bestScore > 110) break;
  }
  return best || { x: hintX, z: hintZ, h: Math.max(8, heightAt(hintX, hintZ)), biome: BIOME.PLAINS };
}
