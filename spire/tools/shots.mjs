/* Screenshots of SPIRE, headless.

   Serves spire/ on a local port, opens it in Chromium (software WebGL) and
   photographs the drawing, the wash half way, and the building at several
   times of day and from several sides.

     node spire/tools/shots.mjs [outdir] [only-name-substring]

   Needs Playwright (npm i -g playwright, or NODE_PATH pointing at it). */
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const out = path.resolve(process.argv[2] || path.join(root, 'shots'));
const only = process.argv[3] || '';
fs.mkdirSync(out, { recursive: true });

let chromium;
try { ({ chromium } = await import('playwright')); }
catch { ({ chromium } = createRequire(import.meta.url)(path.join(process.env.NODE_PATH || '/opt/node22/lib/node_modules', 'playwright'))); }

const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css' };
const server = http.createServer((req, res) => {
  const p = path.join(root, decodeURIComponent(req.url.split('?')[0]).replace(/\/$/, '/index.html'));
  if (!p.startsWith(root) || !fs.existsSync(p)) { res.writeHead(404); res.end(); return; }
  res.writeHead(200, { 'Content-Type': TYPES[path.extname(p)] || 'application/octet-stream' });
  fs.createReadStream(p).pipe(res);
});
await new Promise(r => server.listen(0, r));
const url = `http://127.0.0.1:${server.address().port}/index.html?shot`;

const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const page = await browser.newPage({ viewport: { width: 1280, height: 860 } });
page.on('pageerror', e => console.log('PAGE ERROR', e.message));
page.on('console', m => { if (m.type() === 'error' || m.type() === 'warning') console.log('console:', m.text()); });
await page.goto(url);
await page.waitForFunction(() => window.__spire && window.__spire.ready, null, { timeout: 60000 });

const SHOTS = [
  { name: 'sketch', set: { mode: 'sketch', draw: 1 } },
  { name: 'sketch-drawing', set: { mode: 'sketch', draw: 0.5 } },
  { name: 'wash', set: { progress: 0.45, t: 0.64, draw: 1 } },
  { name: 'golden', set: { mode: 'built', t: 0.64 } },
  { name: 'midday', set: { mode: 'built', t: 0.35, view: { az: 2.2, dist: 1100, height: 60 } } },
  { name: 'dusk', set: { mode: 'built', t: 0.8, view: { az: 4.0, dist: 1000, height: 40 } } },
  { name: 'night', set: { mode: 'built', t: 1.0, view: { az: 0.62, dist: 900, height: 30 } } },
  { name: 'model', set: { mode: 'model', t: 0.55, view: { az: 1.2, dist: 950, height: 50 } } },
  { name: 'close', set: { mode: 'built', t: 0.55, pos: [180, 60, 260], target: [0, 150, 0] } },
  { name: 'aerial', set: { mode: 'built', t: 0.45, pos: [520, 520, 620], target: [0, 160, 0] } },
];
for (const s of SHOTS) {
  if (only && !s.name.includes(only)) continue;
  await page.evaluate((o) => window.__spire.set(o), s.set);
  // let the slower things settle (env bake, damping)
  await page.evaluate(() => new Promise(r => { let n = 0; const f = () => (++n > 6 ? r() : requestAnimationFrame(f)); f(); }));
  await page.screenshot({ path: path.join(out, `${s.name}.png`) });
  console.log('wrote', s.name);
}
await browser.close();
server.close();
