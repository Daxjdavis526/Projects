/* =============================================================================
   WORKER — builds tile geometry off the main thread
   -----------------------------------------------------------------------------
   Imports only pure modules: no DOM, no three.js. The worker owns its own copy
   of the heightfield, so it can answer a build request without talking to
   anyone, and every buffer it produces is transferred rather than copied.

   Protocol
     main -> worker
       init    { manifest, base, config }        load the vendored data
       raster  { spec, data }                    add a streamed layer
       drop    { id }                            remove one
       pads    { pads }                          the ship's landing pad
       build   { key, face, level, i, j, gen, rocks }
       cancel  { key }
       evict   { keys }                          forget cached horizon rings
     worker -> main
       ready   { }
       progress{ stage, fraction }
       tile    { ...geometry, gen }              buffers transferred
       error   { key, message }
   ========================================================================== */

import { Heightfield, Raster, Pad } from './heightfield.js';
import { Detail } from './detail.js';
import { buildTile, horizonQuadrant } from './tilebuilder.js';
import { loadVendoredHeightfield } from './loader.js';
import { parent } from './cubesphere.js';
import { TERRAIN } from '../config.js';

let hf = null;
let detail = null;
let apron = TERRAIN.apron;
let verts = TERRAIN.verts;
let rockDensity = 1;
/* Far-field horizon rings, kept so a child can inherit what its parent could
   see beyond its own apron. Bounded, and dropped when a tile is evicted. */
const horizonCache = new Map();
const cancelled = new Set();

function post(msg, transfer) {
  self.postMessage(msg, transfer || []);
}

self.onmessage = async (e) => {
  const m = e.data;
  try {
    switch (m.type) {
      case 'init': return await init(m);
      case 'raster': return addRaster(m);
      case 'drop': return hf && hf.removeRaster(m.id);
      case 'pads': return hf && hf.setPads(m.pads.map(p => new Pad(p)));
      case 'build': return build(m);
      case 'cancel': return void cancelled.add(m.key);
      case 'evict': return void m.keys.forEach(k => horizonCache.delete(k));
      case 'quality': return setQuality(m);
    }
  } catch (err) {
    post({ type: 'error', key: m.key, message: String(err && err.stack || err) });
  }
};

async function init(m) {
  verts = m.config.verts ?? TERRAIN.verts;
  apron = m.config.apron ?? TERRAIN.apron;
  rockDensity = m.config.rocks ?? 1;
  const res = await loadVendoredHeightfield(m.base, {
    level: m.config.level ?? 3,
    mask: false,                       // the mask is only needed for the overlay
    onProgress: (stage, fraction) => post({ type: 'progress', stage, fraction }),
  });
  hf = res.heightfield;
  detail = new Detail({
    enabled: !m.config.noProcedural,
    roughness: makeRoughness(m.geology),
  });
  hf.attachDetail(detail);
  post({ type: 'ready', layers: hf.rasters.map(r => ({ id: r.id, res_m: r.res_m })) });
}

function setQuality(m) {
  apron = m.apron ?? apron;
  rockDensity = m.rocks ?? rockDensity;
  if (detail) detail.enabled = !m.noProcedural;
  horizonCache.clear();
}

/**
 * Terrain roughness from the USGS geologic unit map: young mare is smooth,
 * ancient highlands are saturated with craters and much rougher. Without this
 * every square kilometre of the Moon would look the same.
 */
function makeRoughness(geology) {
  if (!geology || !geology.data) return () => 0.5;
  const { width, height, data, rough } = geology;
  return (lat, lon) => {
    const x = Math.min(width - 1, Math.max(0, ((lon + 180) / 360 * width) | 0));
    const y = Math.min(height - 1, Math.max(0, ((90 - lat) / 180 * height) | 0));
    return rough[data[y * width + x]] ?? 0.5;
  };
}

function addRaster(m) {
  if (!hf) return;
  hf.addRaster(new Raster(m.spec, m.data));
  post({ type: 'layer', id: m.spec.id, res_m: m.spec.res_m });
}

function build(m) {
  if (!hf) return;
  if (cancelled.has(m.key)) { cancelled.delete(m.key); return; }

  const src = {
    heightAt: (lat, lon) => hf.heightAt(lat, lon),
    rocksIn: (latMin, lonMin, latMax, lonMax) => {
      const res = hf.sampleData((latMin + latMax) / 2, (lonMin + lonMax) / 2, {}).res_m;
      return detail.rocks(latMin, lonMin, latMax, lonMax, res, rockDensity);
    },
  };

  /* Inherit the parent's far-field horizon, if we still have it. */
  let inherited = null;
  const p = parent(m.face, m.level, m.i, m.j);
  if (p) {
    const pk = `${p[0]}:${p[1]}:${p[2]}:${p[3]}`;
    const pf = horizonCache.get(pk);
    if (pf) inherited = horizonQuadrant(pf, verts, m.i & 1, m.j & 1);
  }

  const t = buildTile({
    face: m.face, level: m.level, i: m.i, j: m.j,
    verts, apron, rocks: m.rocks !== false && rockDensity > 0,
  }, src, inherited);

  if (t.horizon && t.horizon.far) {
    if (horizonCache.size > 3000) horizonCache.clear();
    horizonCache.set(m.key, t.horizon.far);
  }

  const payload = {
    type: 'tile', gen: m.gen, key: t.key,
    face: t.face, level: t.level, i: t.i, j: t.j, verts: t.verts,
    centre: [t.centre.x, t.centre.y, t.centre.z],
    positions: t.positions, normals: t.normals, uv: t.uv, detail: t.detail,
    index: t.index, heights: t.heights,
    horizon: t.horizon ? new Uint8Array(t.horizon) : null,
    rocks: t.rocks, bounds: t.bounds, spacing: t.spacing,
  };
  const transfer = [payload.positions.buffer, payload.normals.buffer, payload.uv.buffer,
                    payload.detail.buffer, payload.index.buffer, payload.heights.buffer];
  if (payload.horizon) transfer.push(payload.horizon.buffer);
  if (payload.rocks) transfer.push(payload.rocks.buffer);
  post(payload, transfer);
}
