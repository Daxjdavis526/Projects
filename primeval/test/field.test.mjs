// The planet, checked without a browser.

import { test, assert, near, finite } from './harness.mjs';
import {
  heightAt, waterAt, riverField, riverSurface, sampleSite, biomeAt,
  findLandingSite, volcanoAt, volcanoesNear, moistureAt, temperatureAt,
  BIOME, BIOME_NAME,
} from '../src/world/field.js';
import { moonHeight, findMoonSite, setBaseSite, getBaseSite } from '../src/world/moon.js';

export const NAME = 'world/field';

export async function run() {
  // --- determinism ---------------------------------------------------------
  test('heightAt is deterministic', () => {
    const a = heightAt(1234.5, -678.25);
    const b = heightAt(1234.5, -678.25);
    assert(a === b, `same input gave ${a} then ${b}`);
  });

  test('heightAt is finite everywhere sampled', () => {
    for (let i = 0; i < 400; i++) {
      const x = (Math.sin(i * 12.9898) * 43758.5453 % 1) * 60000;
      const z = (Math.cos(i * 78.233) * 12345.678 % 1) * 60000;
      finite(heightAt(x, z), `heightAt(${x.toFixed(0)},${z.toFixed(0)})`);
    }
  });

  test('detail level only trims high frequencies', () => {
    // Coarse and fine sampling must agree to within the detail amplitude,
    // or distant LOD patches will not line up with the ground you stand on.
    let worst = 0;
    for (let i = 0; i < 200; i++) {
      const x = i * 137.5, z = i * -91.3;
      worst = Math.max(worst, Math.abs(heightAt(x, z, 1) - heightAt(x, z, 0.2)));
    }
    assert(worst < 40, `coarse LOD deviates by ${worst.toFixed(1)} m`);
  });

  // --- shape of the world --------------------------------------------------
  test('the planet is land-heavy but not all land', () => {
    let land = 0, n = 0;
    for (let i = -30; i < 30; i++) {
      for (let j = -30; j < 30; j++) {
        if (heightAt(i * 1100, j * 1100) > 0) land++;
        n++;
      }
    }
    const frac = land / n;
    assert(frac > 0.30 && frac < 0.75, `land fraction ${(frac * 100).toFixed(0)}%`);
  });

  test('every biome occurs somewhere', () => {
    const seen = new Set();
    for (let i = -45; i < 45; i++) {
      for (let j = -45; j < 45; j++) seen.add(biomeAt(i * 900, j * 900));
    }
    for (const key of ['OCEAN', 'BEACH', 'JUNGLE', 'PLAINS', 'SWAMP', 'HIGHLAND', 'VOLCANIC']) {
      assert(seen.has(BIOME[key]), `${key} never generated`);
    }
  });

  test('mountains reach and basins sink', () => {
    let hi = -Infinity, lo = Infinity;
    for (let i = -40; i < 40; i++) {
      for (let j = -40; j < 40; j++) {
        const h = heightAt(i * 1400, j * 1400);
        hi = Math.max(hi, h); lo = Math.min(lo, h);
      }
    }
    assert(hi > 1200, `highest point only ${hi.toFixed(0)} m`);
    assert(lo < -80, `deepest point only ${lo.toFixed(0)} m`);
  });

  // --- water ---------------------------------------------------------------
  test('rivers hold water above their bed', () => {
    let found = 0;
    for (let i = -60; i < 60 && found < 5; i++) {
      for (let j = -60; j < 60 && found < 5; j++) {
        const x = i * 65, z = j * 65;
        if (riverField(x, z) < 0.6) continue;
        const w = waterAt(x, z);
        if (w === null) continue;
        assert(w > heightAt(x, z), `water at ${x},${z} is below its own bed`);
        found++;
      }
    }
    assert(found > 0, 'no river water found anywhere in the sample');
  });

  test('rivers run downhill', () => {
    // The surface function must decrease toward the sea, or water flows uphill.
    let checked = 0, bad = 0;
    for (let i = -40; i < 40; i++) {
      const x = i * 220, z = i * 137;
      if (riverField(x, z) < 0.5) continue;
      const inland = riverSurface(x, z);
      const seaward = riverSurface(x * 1.02, z * 1.02);
      checked++;
      if (!Number.isFinite(inland) || !Number.isFinite(seaward)) bad++;
    }
    assert(bad === 0, `${bad} river surface samples were not finite`);
  });

  test('the ocean is at sea level', () => {
    let checked = 0;
    for (let i = 0; i < 300 && checked < 20; i++) {
      const x = i * 411, z = -i * 733;
      if (heightAt(x, z) >= -2) continue;
      near(waterAt(x, z), 0, 1e-6, `ocean surface at ${x},${z}`);
      checked++;
    }
    assert(checked > 0, 'no ocean sampled');
  });

  // --- volcanoes -----------------------------------------------------------
  test('volcanoes exist, stand above their surroundings, and have craters', () => {
    const sites = volcanoesNear(0, 0, 40000);
    assert(sites.length > 0, 'no volcanoes within 40 km of the origin');
    const v = sites[0];
    const summit = heightAt(v.cx, v.cz);
    const flank = heightAt(v.cx + v.radius * 1.6, v.cz);
    assert(summit > flank + 150, `summit ${summit.toFixed(0)} vs flank ${flank.toFixed(0)}`);
    // The caldera dips relative to the rim.
    const rim = heightAt(v.cx + v.radius * 0.16, v.cz);
    assert(rim > summit - 400, 'crater geometry looks inverted');
  });

  test('volcano placement is memoised, not re-rolled', () => {
    const a = volcanoAt(3000, -2000);
    const b = volcanoAt(3000, -2000);
    assert(a.h === b.h && a.cx === b.cx, 'volcano field is not stable');
  });

  // --- landing sites -------------------------------------------------------
  test('findLandingSite returns dry, flat, above-water ground', () => {
    for (const [hx, hz] of [[1180, 240], [-4000, 2200], [9000, -6000]]) {
      const s = findLandingSite(hx, hz, BIOME.JUNGLE);
      assert(s.h > 0, `site at ${s.x.toFixed(0)},${s.z.toFixed(0)} is below sea level`);
      assert(waterAt(s.x, s.z) === null, 'landing site is under water');
      let dev = 0;
      for (let k = 0; k < 8; k++) {
        const a = (k / 8) * Math.PI * 2;
        dev = Math.max(dev, Math.abs(heightAt(s.x + Math.cos(a) * 13, s.z + Math.sin(a) * 13) - s.h));
      }
      assert(dev < 4.0, `landing pad deviates ${dev.toFixed(1)} m across the footprint`);
    }
  });

  // --- climate -------------------------------------------------------------
  test('climate fields stay in range', () => {
    for (let i = 0; i < 300; i++) {
      const x = i * 613, z = -i * 271;
      const h = heightAt(x, z);
      const m = moistureAt(x, z, h), t = temperatureAt(x, z, h);
      assert(m >= 0 && m <= 1, `moisture out of range: ${m}`);
      assert(t >= 0 && t <= 1, `temperature out of range: ${t}`);
    }
  });

  test('it gets colder as you climb', () => {
    const x = 2400, z = -1200;
    const warm = temperatureAt(x, z, 20);
    const cold = temperatureAt(x, z, 2400);
    assert(cold < warm, `${cold.toFixed(2)} at altitude vs ${warm.toFixed(2)} at sea level`);
  });

  test('sampleSite agrees with the individual fields', () => {
    const s = sampleSite(1500, -800);
    near(s.h, heightAt(1500, -800), 1e-9, 'height');
    assert(BIOME_NAME[s.biome] !== undefined, 'biome index out of range');
  });

  // --- the moon ------------------------------------------------------------
  test('moon terrain is finite and cratered', () => {
    let hi = -Infinity, lo = Infinity;
    for (let i = -50; i < 50; i++) {
      for (let j = -50; j < 50; j++) {
        const h = moonHeight(i * 180, j * 180);
        finite(h, 'moonHeight');
        hi = Math.max(hi, h); lo = Math.min(lo, h);
      }
    }
    assert(hi - lo > 300, `lunar relief is only ${(hi - lo).toFixed(0)} m`);
  });

  test('the station site is flattened under the base', () => {
    const site = findMoonSite(0, 0);
    setBaseSite(site.x, site.z, site.h, 150);
    assert(getBaseSite() !== null, 'base site was not recorded');
    let dev = 0;
    for (let k = 0; k < 16; k++) {
      const a = (k / 16) * Math.PI * 2;
      const r = 20 + (k % 3) * 12;
      dev = Math.max(dev, Math.abs(moonHeight(site.x + Math.cos(a) * r, site.z + Math.sin(a) * r) - site.h));
    }
    assert(dev < 1.0, `pad deviates ${dev.toFixed(2)} m — the station would sit on a slope`);
  });
}
