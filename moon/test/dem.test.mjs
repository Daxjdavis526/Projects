/* Headless validation of the vendored elevation data and the decoder.

   This is the test that catches a rolled, flipped or mis-scaled raster before
   anything is rendered: it decodes the shipped PNGs with the same code the
   browser uses and checks real places against published elevations. */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadVendoredHeightfield, loadPyramidLevel, readJson } from '../src/terrain/loader.js';
import { Heightfield, Raster, Pad } from '../src/terrain/heightfield.js';

const here = path.dirname(fileURLToPath(import.meta.url));
const DATA = path.join(here, '..', 'data');

let failures = 0;
const check = (label, cond, detail = '') => {
  console.log((cond ? '  ok   ' : '  FAIL ') + label + (detail ? '  — ' + detail : ''));
  if (!cond) failures++;
};

const manifest = JSON.parse(fs.readFileSync(path.join(DATA, 'manifest.json'), 'utf8'));
const checks = JSON.parse(fs.readFileSync(path.join(DATA, 'checks.json'), 'utf8'));

console.log('manifest');
check('frame is ME of DE421', /Mean Earth/i.test(manifest.frame), manifest.frame.slice(0, 46) + '...');
check('datum is the 1737.4 km sphere', manifest.datum.reference_radius_m === 1737400);
check('column 0 is -180 E, row 0 is +90 N',
  manifest.convention.lon0_deg === -180 && manifest.convention.lat0_deg === 90);

console.log('decoding the vendored pyramid (16 ppd, 128 tiles)');
const t0 = Date.now();
const { heightfield: hf } = await loadVendoredHeightfield(DATA, { level: 3 });
console.log(`         decoded in ${((Date.now() - t0) / 1000).toFixed(1)} s`);

const at = (lat, lon) => hf.sampleData(lat, lon, {}).h;
/* The vendored global layer on its own, with no high-resolution window blended
   in: this is what checks.json recorded from the original LOLA .img. */
const lola = hf.rasters.find(r => r.id === 'lola16');
const atLola = (lat, lon) => lola.sample(lat, lon);

console.log('real places, real elevations');
/* Wagner et al. 2012 put the Apollo 11 descent stage at -1929 m; NASA Trek's
   LOLA 128 ppd service reports -1928 m there. A 1.9 km pixel cannot resolve
   that exactly, but it must land within a hundred metres of it. */
const a11 = at(0.67415, 23.47314);
check('Tranquility Base is about 1.9 km below the datum',
  a11 > -2050 && a11 < -1800, a11.toFixed(1) + ' m');
check('the decoder agrees with the pipeline that wrote the tiles',
  Math.abs(atLola(0.67415, 23.47314) - checks.points.apollo11) < 0.2,
  `${atLola(0.67415, 23.47314).toFixed(1)} vs ${checks.points.apollo11} m from checks.json`);

const a15 = at(26.13237, 3.63330), a17 = at(20.19108, 30.77220);
check('Apollo 15 at Hadley is below the datum', a15 < -1000 && a15 > -3000, a15.toFixed(0) + ' m');
check('Apollo 17 in Taurus-Littrow is below the datum', a17 < -1500 && a17 > -3500, a17.toFixed(0) + ' m');

/* Maria are low, far-side highlands are high: the single most obvious way to
   catch a raster that has been rolled by 180 degrees. */
const imbrium = atLola(34.72, -14.91), antipode = atLola(0, 180);
check('Mare Imbrium is low', imbrium < -1500, imbrium.toFixed(0) + ' m');
check('the far-side highlands at the Earth antipode are high', antipode > 2000, antipode.toFixed(0) + ' m');

/* The crustal dichotomy: the far side averages well above the near side. Getting
   this backwards is exactly what a 180 degree roll of the raster would look like. */
let nearSum = 0, nearW = 0, farSum = 0, farW = 0;
for (let la = -85; la <= 85; la += 2.5) {
  for (let lo = -180; lo < 180; lo += 2.5) {
    const c = Math.cos(la * Math.PI / 180), h = atLola(la, lo);
    if (Math.abs(lo) < 90) { nearSum += h * c; nearW += c; } else { farSum += h * c; farW += c; }
  }
}
const nearMean = nearSum / nearW, farMean = farSum / farW;
check('the far side averages 1-3 km above the near side',
  farMean - nearMean > 1000 && farMean - nearMean < 3000,
  `near ${nearMean.toFixed(0)} m, far ${farMean.toFixed(0)} m`);

/* South Pole-Aitken is the deepest place on the Moon; the limb highlands the
   highest. The published LOLA extremes are about -9.1 and +10.8 km. */
check('global minimum is near -9 km', checks.global_min_m < -8500 && checks.global_min_m > -9500,
  (checks.global_min_m / 1000).toFixed(2) + ' km');
check('global maximum is near +10.8 km', checks.global_max_m > 10000 && checks.global_max_m < 11500,
  (checks.global_max_m / 1000).toFixed(2) + ' km');

/* Tycho's floor is far below its rim: a crater that survived downsampling. */
const tychoFloor = at(-43.31, -11.36);
let tychoRim = -1e9;
for (let a = 0; a < 360; a += 15) {
  const r = 43000 / 1737400 * (180 / Math.PI);
  const lat = -43.31 + r * Math.cos(a * Math.PI / 180);
  const lon = -11.36 + r * Math.sin(a * Math.PI / 180) / Math.cos(-43.31 * Math.PI / 180);
  tychoRim = Math.max(tychoRim, at(lat, lon));
}
check('Tycho has a rim above its floor', tychoRim - tychoFloor > 1500,
  `floor ${tychoFloor.toFixed(0)} m, rim ${tychoRim.toFixed(0)} m`);

console.log('longitude wrap');
const west = at(0, -179.999), east = at(0, 179.999);
check('the 180 deg meridian is continuous', Math.abs(west - east) < 200,
  `${west.toFixed(0)} vs ${east.toFixed(0)} m`);
check('sampling past +180 wraps', Math.abs(at(0, 180.001) - at(0, -179.999)) < 1e-3);

console.log('coverage mask');
check('mask loaded', !!hf.measuredMask);
check('the mask is mostly measured',
  manifest.measured.measured_fraction > 0.9 && manifest.measured.measured_fraction <= 1.0,
  (manifest.measured.measured_fraction * 100).toFixed(1) + '%');

console.log('high-resolution windows at Tranquility Base');
const nac = hf.rasters.find(r => r.id === 'apollo11_nac');
const sldem = hf.rasters.find(r => r.id === 'apollo11_sldem');
check('the 2 m NAC window is loaded', !!nac && nac.res_m < 2.5, nac && nac.res_m + ' m/px');
check('the 59 m SLDEM window is loaded', !!sldem && sldem.res_m < 70, sldem && sldem.res_m.toFixed(1) + ' m/px');
check('the NAC window contains the landing site', nac.contains(0.67415, 23.47314));

const probe = hf.probe(0.67415, 23.47314);
check('the finest layer answers at the landing site', probe.layer === 'apollo11_nac',
  `${probe.layer} at ${probe.res_m.toFixed(1)} m/px`);
check('the NAC elevation agrees with LOLA to within 60 m',
  Math.abs(probe.dataHeight - atLola(0.67415, 23.47314)) < 60,
  `NAC ${probe.dataHeight.toFixed(1)} m vs LOLA ${atLola(0.67415, 23.47314).toFixed(1)} m`);

/* Crossing out of the high-resolution window must not produce a cliff. */
let worstStep = 0;
for (let lon = 23.40; lon < 23.55; lon += 0.0005) {
  const h0 = hf.sampleData(0.674, lon, {}).h;
  const h1 = hf.sampleData(0.674, lon + 0.0005, {}).h;
  worstStep = Math.max(worstStep, Math.abs(h1 - h0));
}
check('no cliff where the NAC window meets LOLA', worstStep < 25,
  worstStep.toFixed(1) + ' m per 15 m step');

console.log('sampling behaviour');
const detailFree = hf.sampleData(10, 20, {});
check('provenance is reported', !!detailFree.source && !!detailFree.label,
  `${detailFree.label}, ${detailFree.res_m.toFixed(0)} m/px`);
check('slope on the maria is gentle', hf.slopeAt(20, 25, 2000) < 6,
  hf.slopeAt(20, 25, 2000).toFixed(2) + ' deg');

console.log('landing pads (the only edit to real terrain)');
const before = hf.heightAt(0.674, 23.473);
hf.setPads([new Pad({ lat: 0.674, lon: 23.473, radius: 22, feather: 14, height: before + 3 })]);
check('the pad flattens its centre', Math.abs(hf.heightAt(0.674, 23.473) - (before + 3)) < 0.01);
check('the pad has faded out by 40 m',
  Math.abs(hf.heightAt(0.674 + 40 / 1737400 * 180 / Math.PI, 23.473) - before) < 0.4);
hf.setPads([]);

console.log('synthetic raster maths');
{
  const w = 64, h = 32, data = new Float32Array(w * h);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) data[y * w + x] = x * 10;
  const r = new Raster({ id: 'ramp', bbox: [0, 0, 64, 32], width: w, height: h, res_m: 1, margin: 0 }, data);
  check('bilinear hits pixel centres', Math.abs(r.sample(31.5, 0.5) - 0) < 1e-6);
  check('bilinear interpolates between them', Math.abs(r.sample(31.5, 1.0) - 5) < 1e-6);
  const hf2 = new Heightfield();
  hf2.addRaster(r);
  check('a lone raster answers everywhere inside it', Math.abs(hf2.sampleData(16, 32, {}).h - 315) < 1e-3);
}

console.log(failures === 0 ? '\ndem: all checks passed' : `\ndem: ${failures} FAILED`);
process.exit(failures ? 1 : 0);
