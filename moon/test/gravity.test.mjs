/* GRAIL's free-air anomaly, read off the disk.

   `data/grail4.png` was built by the pipeline, recorded in the manifest,
   791 KB, and had no reader anywhere in src/ while DATA_SOURCES.md described
   the layer as "streamed + vendored 4 ppd". Half of that claim was a file
   nothing opened. This checks the half that is now true.

   The mascons are the test. Mare Serenitatis is one of the strongest positive
   anomalies on the Moon and the far-side highlands are negative; getting those
   the wrong way round, or 180 degrees out in longitude, is what a broken read
   of this raster looks like. */
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { GravityMap, G_REFERENCE } from '../src/data/gravity.js';

const DATA = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'data');

let failures = 0;
const check = (label, cond, detail = '') => {
  console.log((cond ? '  ok   ' : '  FAIL ') + label + (detail ? '  — ' + detail : ''));
  if (!cond) failures++;
};

/* The module fetches, because in the game it is a page. */
globalThis.fetch = async (url) => {
  const buf = await readFile(url.startsWith('file:') ? fileURLToPath(url) : url);
  return { ok: true, arrayBuffer: async () => buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength) };
};

const manifest = JSON.parse(await readFile(path.join(DATA, 'manifest.json'), 'utf8'));

console.log('the raster');
{
  check('the manifest describes it', !!manifest.gravity && manifest.gravity.path === 'grail4.png');
  const g = await new GravityMap(manifest.gravity).load(DATA + '/');
  check('it loads', !!g && g.data !== null);
  check('at four pixels per degree', g.width === 1440 && g.height === 720,
        `${g.width} x ${g.height}`);

  let min = Infinity, max = -Infinity;
  for (let i = 0; i < g.data.length; i++) {
    if (g.data[i] < min) min = g.data[i];
    if (g.data[i] > max) max = g.data[i];
  }
  check('and the decoded range is what the pipeline recorded',
        Math.abs(min - manifest.gravity.min) < 1 && Math.abs(max - manifest.gravity.max) < 1,
        `${min} .. ${max} mGal vs ${manifest.gravity.min} .. ${manifest.gravity.max}`);

  console.log('the mascons, which is how you know the map is the right way round');
  const serenitatis = g.mGal(28, 18);
  const imbrium = g.mGal(34.72, -14.91);
  const a11 = g.mGal(0.67415, 23.47314);
  const farside = g.mGal(0, 180);
  check('Mare Serenitatis is a strong positive anomaly', serenitatis > 200,
        serenitatis + ' mGal');
  check('Mare Imbrium is positive too', imbrium > 50, imbrium + ' mGal');
  check('Tranquility Base is near neutral', Math.abs(a11) < 120, a11 + ' mGal');
  check('and the far-side highlands are not a mascon', farside < 100, farside + ' mGal');
  /* A raster rolled by half a turn would put Serenitatis' anomaly on the far
     side, which is exactly the failure this pair catches. */
  check('so the longitudes are not rolled', serenitatis > farside + 150);

  console.log('what the overlay is handed');
  const at = g.at(28, 18);
  check('an acceleration, not just an anomaly',
        Math.abs(at.g - (G_REFERENCE + serenitatis * 1e-5)) < 1e-9, at.g.toFixed(5) + ' m/s²');
  check('and it is a fraction of a percent of lunar gravity, as the brief insisted',
        Math.abs(at.g - G_REFERENCE) / G_REFERENCE < 0.005,
        ((at.g - G_REFERENCE) / G_REFERENCE * 100).toFixed(3) + ' %');
  check('the resolution is stated', Math.abs(at.res_deg - 0.25) < 1e-9);
  check('and the source with it', /GRAIL/.test(at.source));

  console.log('edges');
  check('longitude wraps rather than reading off the end',
        g.mGal(0, 180) === g.mGal(0, -180), `${g.mGal(0, 180)} vs ${g.mGal(0, -180)}`);
  check('the poles are in range',
        Number.isFinite(g.mGal(90, 0)) && Number.isFinite(g.mGal(-90, 0)));
  check('an unloaded map answers null rather than guessing',
        new GravityMap(manifest.gravity).mGal(0, 0) === null);
  check('and no manifest is survived', new GravityMap(null).at(0, 0) === null);
}

console.log(failures ? `\n${failures} failed` : '\nall good');
process.exit(failures ? 1 : 0);
