/* =============================================================================
   LOADER — put the vendored data into a Heightfield
   -----------------------------------------------------------------------------
   Works from `fetch` in the browser and from the filesystem in Node, so the
   tests exercise the same decode path the game uses.
   ========================================================================== */

import { decodeElevationPng, decodePng8 } from './png16.js';
import { Heightfield, Raster, rasterFromPyramid } from './heightfield.js';

/* In Node the tests point `base` at the data directory on disk; in the browser
   it is a URL prefix. Both go through these two functions so the decode path is
   identical. */
const IN_NODE = typeof process !== 'undefined' && !!process.versions?.node;

async function nodeRead(base, rel) {
  const { readFile } = await import('node:fs/promises');
  const path = await import('node:path');
  return readFile(path.join(base, rel));
}

/** Read a file as an ArrayBuffer, in either environment. */
export async function readBinary(base, rel) {
  if (IN_NODE) {
    const buf = await nodeRead(base, rel);
    return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);
  }
  const res = await fetch(base + rel);
  if (!res.ok) throw new Error(`${rel}: HTTP ${res.status}`);
  return res.arrayBuffer();
}

export async function readJson(base, rel) {
  if (IN_NODE) return JSON.parse(await nodeRead(base, rel));
  const res = await fetch(base + rel);
  if (!res.ok) throw new Error(`${rel}: HTTP ${res.status}`);
  return res.json();
}

/**
 * Load one level of the LOLA pyramid as a single global raster.
 * Level 3 (16 ppd) is 128 tiles and about 18 MB of PNG; level 1 (4 ppd) is
 * enough to draw the globe from orbit while the rest arrives.
 */
export async function loadPyramidLevel(base, manifest, z, onTile) {
  const layer = manifest.dem.layers[z];
  const tiles = [];
  for (let y = 0; y < layer.ny; y++) {
    for (let x = 0; x < layer.nx; x++) {
      const rel = layer.path.replace('{x}', x).replace('{y}', y);
      const buf = await readBinary(base, rel);
      const { data } = await decodeElevationPng(buf, manifest.convention.png16_bias_m);
      tiles.push({ x, y, data });
      if (onTile) onTile(tiles.length, layer.nx * layer.ny);
    }
  }
  return rasterFromPyramid({ ...layer, id: layer.id }, tiles);
}

/** Load a vendored window (the Apollo 11 NAC and SLDEM crops). */
export async function loadWindow(base, manifest, spec) {
  const buf = await readBinary(base, spec.path);
  const { width, height, data } = await decodeElevationPng(buf, manifest.convention.png16_bias_m);
  return new Raster({
    id: spec.id, bbox: spec.bbox, width, height, res_m: spec.res_m,
    priority: spec.priority ?? 0, source: spec.source, label: 'MEASURED',
  }, data);
}

/** The LOLA observation-count mask: 255 where the altimeter actually ranged. */
export async function loadMeasuredMask(base, manifest) {
  const buf = await readBinary(base, manifest.measured.path);
  return decodePng8(buf);
}

/**
 * Build a Heightfield with the vendored data.
 * @param {string} base  directory or URL prefix ending in '/'
 * @param {object} opts  { level: pyramid level to load (default 3 = 16 ppd),
 *                         windows: load the Apollo 11 crops (default true),
 *                         mask: load the measured mask (default true),
 *                         onProgress }
 */
export async function loadVendoredHeightfield(base, opts = {}) {
  const manifest = await readJson(base, 'manifest.json');
  const hf = new Heightfield();
  const level = opts.level ?? 3;
  const p = opts.onProgress || (() => {});

  p('topography', 0);
  hf.addRaster(await loadPyramidLevel(base, manifest, level, (i, n) => p('topography', i / n)));

  if (opts.mask !== false) {
    p('coverage', 0);
    hf.measuredMask = await loadMeasuredMask(base, manifest);
  }
  if (opts.windows !== false) {
    for (const spec of manifest.dem.windows) {
      p('site data', 0);
      hf.addRaster(await loadWindow(base, manifest, spec));
    }
  }
  p('ready', 1);
  return { heightfield: hf, manifest };
}
