/* Headless checks on the NASA Trek streaming layer.

   The network is not exercised here — a saved Trek response stands in for it,
   so this runs offline and stays honest about what the code does with the
   bytes: which service it picks for a patch, how many pixels it asks for, what
   resolution it then claims, and where a WMTS tile actually lands. */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { readGeoTiff } from '../src/data/tiff.js';
import { Streams, TREK_ORIGIN } from '../src/data/streams.js';
import { R_MOON } from '../src/config.js';

const here = path.dirname(fileURLToPath(import.meta.url));
const registry = JSON.parse(readFileSync(path.join(here, '..', 'data', 'streams.json')));
const fixture = readFileSync(path.join(here, 'fixtures', 'trek_dem_33.tif'));
const fixtureBuf = fixture.buffer.slice(fixture.byteOffset, fixture.byteOffset + fixture.byteLength);

let failures = 0;
const check = (label, cond, detail = '') => {
  console.log((cond ? '  ok   ' : '  FAIL ') + label + (detail ? '  — ' + detail : ''));
  if (!cond) failures++;
};

console.log('geotiff reader');
{
  const img = readGeoTiff(fixtureBuf);
  check('reads the declared size', img.width === 33 && img.height === 33,
        `${img.width}x${img.height}`);
  check('every sample is finite', img.data.every(Number.isFinite));
  let lo = Infinity, hi = -Infinity;
  for (const v of img.data) { lo = Math.min(lo, v); hi = Math.max(hi, v); }
  /* The patch is a corner of Mare Tranquillitatis, which LOLA puts a little
     under two kilometres below the 1737.4 km datum. */
  check('elevations are Tranquillitatis-like', lo > -2100 && hi < -1700,
        `${lo.toFixed(0)} … ${hi.toFixed(0)} m`);
  check('the patch is not flat', hi - lo > 5, (hi - lo).toFixed(1) + ' m of relief');
  check('carries a pixel scale', img.pixelScale.length >= 2 && img.pixelScale[0] > 0,
        String(img.pixelScale.slice(0, 2)));
  check('carries a tie point', img.tiePoint.length >= 6, String(img.tiePoint.length));
}

console.log('service coverage');
{
  const global = registry.elevation.find(s => s.id === 'LRO_LOLA_DEM_Global_256ppd_v06');
  const area = { latMin: 0.6, latMax: 0.75, lonMin: 23.4, lonMax: 23.55 };
  check('a global service contains any patch', Streams.contains(global.bbox, area));
  check('a patch is rejected when it overflows the box',
        !Streams.contains([23.4, 0.6, 23.5, 0.7], area));
  check('a patch written past the seam still matches',
        Streams.contains([-180, -90, 180, 90], { latMin: -1, latMax: 1, lonMin: 359, lonMax: 361 }));
  check('a polar service does not cover the equator',
        !Streams.contains([-180, -90, 180, -75], area));
}

console.log('service choice');
{
  const s = new Streams(registry, { enabled: true });
  const wide = s.candidateElevation({ latMin: -1, latMax: 3, lonMin: 21.5, lonMax: 25.5 });
  check('a wide patch falls back to a global model', wide.length > 0 && wide[0].kind === 'global',
        wide[0] && `${wide[0].id} ${wide[0].res_m} m`);
  /* Trek has no stereo model of Tranquility Base — the game carries the PDS
     one instead — so the best it can stream there is the LOLA grid. The Apollo
     metric-camera mosaic is nominally finer but only covers its ground tracks,
     and must not be preferred on the strength of its advertised box. */
  const tight = s.candidateElevation({ latMin: 0.66, latMax: 0.69, lonMin: 23.46, lonMax: 23.49 });
  check('a patch at Tranquility Base prefers the measured LOLA grid',
        tight.length > 0 && tight[0].id === 'LRO_LOLA_DEM_Global_256ppd_v06',
        tight[0] && `${tight[0].id} ${tight[0].res_m} m`);
  check('a sparse mosaic is never tried first',
        tight[0].priority < 3 && wide[0].priority < 3);
  const tycho = s.candidateElevation({ latMin: -43.32, latMax: -43.30, lonMin: -11.37, lonMax: -11.35 });
  check('a patch inside a stereo site model prefers metre-scale topography',
        tycho.length > 0 && tycho[0].res_m < 5, tycho[0] && `${tycho[0].id} ${tycho[0].res_m} m`);
  check('candidates are ordered by trust then resolution',
        tight.every((c, i) => i === 0 || tight[i - 1].priority < c.priority ||
                    (tight[i - 1].priority === c.priority && tight[i - 1].res_m <= c.res_m)));
  check('candidates are capped', tight.length <= 3, String(tight.length));
  const south = s.candidateElevation({ latMin: -89.8, latMax: -89.6, lonMin: 129.6, lonMax: 130.0 });
  check('the south pole has a polar model', south.some(c => /Pole/i.test(c.id)),
        south.map(c => c.id).join(', ').slice(0, 90));
}

console.log('request sizing');
{
  const s = new Streams(registry, { enabled: true });
  const asked = [];
  s.fetchWithRetry = async (url) => { asked.push(url); return fixtureBuf; };
  const svc = registry.elevation.find(s2 => s2.id === 'LRO_LOLA_DEM_Global_256ppd_v06');
  /* 0.02° is about 600 m: at 118 m per measured pixel there are only six of
     them across it, so asking for 513 would be inventing 500. */
  const patch = await s.elevationFrom(svc, { latMin: 0.6, latMax: 0.62, lonMin: 23.4, lonMax: 23.42 }, 513);
  const size = Number(/size=(\d+),/.exec(asked[0])[1]);
  check('never asks for more pixels than were measured', size <= 40, String(size));
  check('never asks for fewer than a usable grid', size >= 33, String(size));
  check('reports the resolution it actually got', patch && patch.res_m >= svc.res_m,
        patch && `${patch.res_m.toFixed(1)} m vs ${svc.res_m} m native`);
  check('reports the service it came from', patch && patch.source.includes('LOLA'));
  check('asks the right service', asked[0].includes('LRO_LOLA_DEM_Global_256ppd_v06'));
  check('asks in lunar degrees', asked[0].includes('bboxSR=104903'));
  check('asks for real numbers, not a picture', asked[0].includes('pixelType=F32'));

  /* A wide patch is allowed all the pixels it asked for. */
  asked.length = 0;
  await s.elevationFrom(svc, { latMin: 0, latMax: 4, lonMin: 20, lonMax: 24 }, 513);
  check('a wide patch keeps its full grid', Number(/size=(\d+),/.exec(asked[0])[1]) === 513);
}

console.log('failure and coverage handling');
{
  const s = new Streams(registry, { enabled: true });
  s.fetchWithRetry = async () => { throw new Error('offline'); };
  const r = await s.elevation({ latMin: 0.6, latMax: 0.62, lonMin: 23.4, lonMax: 23.42 }, 65);
  check('a dead network is reported as a failure, not as empty ground',
        r && r.failed === true && !r.empty, JSON.stringify(r));

  const s2 = new Streams(registry, { enabled: true });
  const nodata = new Float32Array(33 * 33).fill(-3.4e38);
  s2.fetchWithRetry = async () => makeTiff(33, 33, nodata);
  const empty = await s2.elevation({ latMin: 0.6, latMax: 0.62, lonMin: 23.4, lonMax: 23.42 }, 65);
  check('a service with no data there answers empty', empty && empty.empty === true);
  check('an empty answer does not count as a fetched layer', s2.stats.elevation === 0);

  const off = new Streams(registry, { enabled: false });
  check('streaming off returns nothing at all',
        (await off.elevation({ latMin: 0, latMax: 1, lonMin: 0, lonMax: 1 })) === null);
  check('streaming off says so', off.status() === 'off');
}

console.log('imagery geometry');
{
  check('level 8 is about the WAC mosaic pixel', Math.abs(Streams.wmtsRes(8) - 83) < 2,
        Streams.wmtsRes(8).toFixed(1) + ' m');
  check('each level halves the pixel',
        Math.abs(Streams.wmtsRes(5) / Streams.wmtsRes(6) - 2) < 1e-9);
  check('level 0 is two tiles around the equator',
        Math.abs(Streams.wmtsRes(0) * 256 * 2 - 2 * Math.PI * R_MOON) < 1);

  for (const [lat, lon] of [[0.674, 23.473], [-43.31, -11.36], [89.9, 179.9], [-89.9, -179.9]]) {
    const t = Streams.wmtsTile(8, lat, lon);
    const b = Streams.wmtsBounds(8, t.col, t.row);
    const inside = lat >= b.latMin - 1e-9 && lat <= b.latMax + 1e-9 &&
                   lon >= b.lonMin - 1e-9 && lon <= b.lonMax + 1e-9;
    check(`tile for ${lat}, ${lon} contains it`, inside,
          `${b.latMin.toFixed(2)}…${b.latMax.toFixed(2)}, ${b.lonMin.toFixed(2)}…${b.lonMax.toFixed(2)}`);
  }

  const s = new Streams(registry, { enabled: true });
  const at11 = s.bestImagery(0.674, 23.473);
  check('Tranquility Base gets the NAC mosaic', at11 && at11.res_m < 1,
        at11 && `${at11.id} ${at11.res_m} m`);
  const elsewhere = s.bestImagery(-43.31, -11.36);
  check('everywhere else gets the WAC mosaic', elsewhere && elsewhere.id.includes('WAC'),
        elsewhere && elsewhere.id);
}

console.log('origin');
{
  check('talks to NASA by default', new Streams(registry, {}).origin === TREK_ORIGIN);
  check('can be pointed at a relay',
        new Streams(registry, { origin: 'http://localhost/nasa' }).origin === 'http://localhost/nasa');
}

/* A minimal uncompressed single-strip float32 TIFF, for the no-data case. */
function makeTiff(w, h, data) {
  const entries = [
    [256, 3, 1, w], [257, 3, 1, h], [258, 3, 1, 32], [259, 3, 1, 1],
    [262, 3, 1, 1], [273, 4, 1, 8 + 2 + 12 * 9 + 4], [277, 3, 1, 1],
    [278, 3, 1, h], [339, 3, 1, 3],
  ];
  const headerBytes = 8 + 2 + entries.length * 12 + 4;
  const buf = new ArrayBuffer(headerBytes + data.length * 4);
  const v = new DataView(buf);
  v.setUint16(0, 0x4949, true); v.setUint16(2, 42, true); v.setUint32(4, 8, true);
  v.setUint16(8, entries.length, true);
  entries.forEach(([tag, type, n, value], i) => {
    const p = 10 + i * 12;
    v.setUint16(p, tag, true); v.setUint16(p + 2, type, true); v.setUint32(p + 4, n, true);
    if (type === 3) v.setUint16(p + 8, value, true); else v.setUint32(p + 8, value, true);
  });
  for (let i = 0; i < data.length; i++) v.setFloat32(headerBytes + i * 4, data[i], true);
  return buf;
}

console.log(failures ? `\n${failures} failed` : '\nall good');
process.exit(failures);
