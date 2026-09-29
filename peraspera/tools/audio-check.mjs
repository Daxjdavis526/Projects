// Render the soundtrack offline in headless Chromium and report levels per
// scene: nothing silent that shouldn't be, nothing clipping, no NaNs.
//   node tools/audio-check.mjs                 all scenes
//   node tools/audio-check.mjs sky gym         some scenes
//   node tools/audio-check.mjs --spectrogram sky:20:12 out.png
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import { execSync } from 'node:child_process';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const require = createRequire(import.meta.url);
let playwright;
try { playwright = require('playwright'); } catch { playwright = require(join(execSync('npm root -g').toString().trim(), 'playwright')); }
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.woff2': 'font/woff2' };
const server = createServer(async (req, res) => {
  try { const p = join(root, new URL(req.url, 'http://x').pathname); res.writeHead(200, { 'content-type': TYPES[extname(p)] || 'application/octet-stream' }); res.end(await readFile(p)); }
  catch { res.writeHead(404); res.end(); }
}).listen(0);
const browser = await playwright.chromium.launch();
const page = await browser.newPage();
page.on('pageerror', (e) => console.error('page error:', e.message));
page.on('console', (m) => { if (m.type() === 'error') console.error('console:', m.text()); });
await page.goto(`http://localhost:${server.address().port}/tools/audio.html`);
await page.waitForFunction(() => window.__ready === true);
const tl = await page.evaluate(() => window.timeline);
const verbose = process.argv.includes('-v');
const args = process.argv.slice(2).filter((a) => a !== '-v');
let failed = false;
if (args[0] === '--spectrogram') {
  const [id, at, dur] = args[1].split(':');
  const s = tl.find((x) => x.id === id);
  await page.setViewportSize({ width: Math.max(400, Number(dur) * 40), height: 400 });
  const r = await page.evaluate(([T, d]) => window.renderSpan(T, d, true), [s.start + Number(at), Number(dur)]);
  await page.locator('#c').screenshot({ path: args[2] || 'spectrogram.png' });
  console.log(JSON.stringify(r));
} else {
  const ids = args.length ? args : tl.map((s) => s.id);
  for (const id of ids) {
    const s = tl.find((x) => x.id === id);
    const r = await page.evaluate(([T, d]) => window.renderSpan(T, d), [s.start, s.dur]);
    const maxPeak = Math.max(...r.peak), loud = Math.max(...r.rms), quiet = Math.min(...r.rms);
    const flag = r.nan ? 'NaN!' : maxPeak > -0.3 ? 'CLIP?' : '';
    if (flag) failed = true;
    console.log(`${id.padEnd(14)} rms ${quiet.toFixed(0).padStart(5)}..${loud.toFixed(0).padStart(4)} dB  peak ${maxPeak.toFixed(1).padStart(6)} dB  ${flag}`);
    if (verbose) console.log('   peaks', r.peak.join(' '));
    console.log('   ' + r.rms.map((v) => (v < -60 ? '_' : v < -40 ? '.' : v < -30 ? ':' : v < -22 ? '+' : v < -15 ? '#' : '@')).join(''));
  }
}
await browser.close();
server.close();
process.exit(failed ? 1 : 0);
