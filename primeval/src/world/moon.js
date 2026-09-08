// ANVIL: the moon.
//
// A different planet through the same quadtree. No water, no weather, no
// atmosphere — just regolith, craters, rilles and very long shadows.

import { Noise, hash2, clamp, lerp, smoothstep } from '../math/noise.js';
import { WORLD_SEED, MOON } from '../config.js';

const nBase = new Noise(WORLD_SEED + 901);
const nRidge = new Noise(WORLD_SEED + 907);
const nDetail = new Noise(WORLD_SEED + 911);
const nRille = new Noise(WORLD_SEED + 919);
const nGrain = new Noise(WORLD_SEED + 929);

const CRATER_CELL = 340;
const craterCache = new Map();

/** One crater per cell, with a rim, a bowl and sometimes a central peak. */
function craterCell(i, j) {
  const key = i * 73856093 ^ j * 19349663;
  let c = craterCache.get(key);
  if (c !== undefined) return c;
  c = null;
  const r0 = hash2(i, j, 5501);
  if (r0 < 0.62) {
    const rad = 22 + Math.pow(hash2(i, j, 5507), 3.4) * 320;
    c = {
      x: (i + hash2(i, j, 5519)) * CRATER_CELL,
      z: (j + hash2(i, j, 5521)) * CRATER_CELL,
      r: rad,
      depth: rad * (0.16 + hash2(i, j, 5527) * 0.14),
      peak: rad > 150 && hash2(i, j, 5531) > 0.55 ? rad * 0.11 : 0,
    };
  }
  if (craterCache.size > 8192) craterCache.clear();
  craterCache.set(key, c);
  return c;
}

// The station needs level ground under it, so the field itself is flattened
// there rather than hiding the problem with a plinth.
let baseSite = null;
export function setBaseSite(x, z, h, radius = 120) {
  baseSite = { x, z, h, radius };
  craterCache.clear();
}
export function getBaseSite() { return baseSite; }

export function moonHeight(x, z, detail = 1) {
  // Mare basins and highland blocks.
  let h = nBase.fbm2(x * 0.000085, z * 0.000085, 4, 2.09, 0.52) * 620;
  const mask = smoothstep(-0.15, 0.4, nBase.noise2(x * 0.000042 + 40, z * 0.000042));
  h += nRidge.ridged2(x * 0.00042, z * 0.00042, 5, 2.05, 0.5) * 380 * mask;
  h += nDetail.fbm2(x * 0.0031, z * 0.0031, 3, 2.11, 0.5) * 7.5;
  if (detail > 0.7) h += nGrain.noise2(x * 0.055, z * 0.055) * 0.42;

  // Rilles: long collapsed lava channels.
  const rv = nRille.fbm2(x * 0.00019 + 70, z * 0.00019, 2, 2.0, 0.5);
  const rt = 1 - smoothstep(0, 0.035, Math.abs(rv));
  if (rt > 0.01) h -= rt * 46 * (0.4 + mask);

  // Craters, newest on top.
  const ci = Math.floor(x / CRATER_CELL), cj = Math.floor(z / CRATER_CELL);
  for (let dj = -2; dj <= 2; dj++) {
    for (let di = -2; di <= 2; di++) {
      const c = craterCell(ci + di, cj + dj);
      if (!c) continue;
      const dx = x - c.x, dz = z - c.z;
      const d = Math.sqrt(dx * dx + dz * dz);
      if (d > c.r * 1.55) continue;
      const t = d / c.r;
      if (t < 1) {
        // Parabolic bowl with a raised rim.
        h -= c.depth * (1 - t * t) * 0.9;
        h += c.depth * 0.34 * Math.exp(-Math.pow((t - 0.94) * 7, 2));
        if (c.peak && t < 0.22) h += c.peak * (1 - t / 0.22);
      } else {
        // Ejecta blanket falling off outside the rim.
        h += c.depth * 0.30 * Math.exp(-Math.pow((t - 1) * 4.2, 2));
      }
    }
  }

  if (baseSite) {
    const d = Math.hypot(x - baseSite.x, z - baseSite.z);
    const t = 1 - smoothstep(baseSite.radius * 0.55, baseSite.radius * 1.5, d);
    if (t > 0.001) h = lerp(h, baseSite.h, t);
  }
  return h;
}

const REGOLITH = [0.128, 0.122, 0.118];
const HIGHLAND = [0.235, 0.228, 0.216];
const MARE = [0.068, 0.066, 0.070];
const FRESH = [0.34, 0.335, 0.325];

export function moonColor(h, slope, a, b, c, river, out) {
  const t = smoothstep(-180, 520, h);
  let r = lerp(MARE[0], REGOLITH[0], t), g = lerp(MARE[1], REGOLITH[1], t), bl = lerp(MARE[2], REGOLITH[2], t);
  const hi = smoothstep(420, 900, h);
  r = lerp(r, HIGHLAND[0], hi); g = lerp(g, HIGHLAND[1], hi); bl = lerp(bl, HIGHLAND[2], hi);
  // Steep faces shed dust and read brighter.
  const st = smoothstep(0.24, 0.62, slope);
  r = lerp(r, FRESH[0], st); g = lerp(g, FRESH[1], st); bl = lerp(bl, FRESH[2], st);
  out[0] = r; out[1] = g; out[2] = bl;
  return out;
}

export const ANVIL_SAMPLER = {
  height: (x, z, detail) => moonHeight(x, z, detail),
  climate: () => [0, 0, 0],
  color: moonColor,
  river: () => 0,
  // All regolith, all the time — the accent sheet's fourth cell.
  splat: (h, slope, a, b, c, r, out) => {
    out[0] = 0;
    out[1] = 1 - smoothstep(0.30, 0.66, slope);   // rock takes over on scarps
    out[2] = 3;
    return out;
  },
};

/** Flat enough for a landing pad, with a view. */
export function findMoonSite(hintX, hintZ) {
  let best = null, bestScore = -Infinity;
  for (let ring = 0; ring < 20; ring++) {
    const r = ring * 120;
    const steps = ring === 0 ? 1 : 8 + ring * 2;
    for (let s = 0; s < steps; s++) {
      const a = (s / steps) * Math.PI * 2 + ring * 0.6;
      const x = hintX + Math.cos(a) * r, z = hintZ + Math.sin(a) * r;
      const h = moonHeight(x, z);
      let dev = 0;
      for (let k = 0; k < 10; k++) {
        const ang = (k / 10) * Math.PI * 2;
        const rr = 20 + (k % 2) * 22;
        dev = Math.max(dev, Math.abs(moonHeight(x + Math.cos(ang) * rr, z + Math.sin(ang) * rr) - h));
      }
      const score = 100 - dev * 9 - r * 0.01 + (h > 120 ? 12 : 0);
      if (score > bestScore) { bestScore = score; best = { x, z, h }; }
    }
    if (best && bestScore > 82) break;
  }
  return best;
}

export const MOON_LOCALE = {
  id: 'moon',
  name: MOON.name,
  gravity: MOON.gravity,
  curveRadius: MOON.curveRadius,
  dayLength: MOON.dayLength,
  heightAt: (x, z) => moonHeight(x, z),
  waterAt: () => null,
  hasAtmosphere: false,
};
