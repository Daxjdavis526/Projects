/* Screenshots of the viewer, headless: serves zr1/, opens it in Chromium
   (software WebGL) and photographs each named view.

     node zr1/tools/shots.mjs [outdir] [views=34,side,front,rear,top] [glass|cut]

   Needs Playwright (npm i -g playwright, or NODE_PATH pointing at it). */
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const out = path.resolve(process.argv[2] || path.join(root, 'shots'));
const views = (process.argv[3] || '34,side,front,rear,top').split(',');
const toggles = (process.argv[4] || '').split(',').filter(Boolean);
const model = process.argv[5] || '';
fs.mkdirSync(out, { recursive: true });

let chromium;
try { ({ chromium } = await import('playwright')); }
catch { ({ chromium } = createRequire(import.meta.url)(path.join(process.env.NODE_PATH || '/opt/node22/lib/node_modules', 'playwright'))); }

const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.glb': 'model/gltf-binary' };
const server = http.createServer((req, res) => {
  const p = path.join(root, decodeURIComponent(req.url.split('?')[0]).replace(/\/$/, '/index.html'));
  if (!p.startsWith(root) || !fs.existsSync(p)) { res.writeHead(404); res.end(); return; }
  res.writeHead(200, { 'Content-Type': TYPES[path.extname(p)] || 'application/octet-stream' });
  fs.createReadStream(p).pipe(res);
});
await new Promise(r => server.listen(0, r));
const url = `http://127.0.0.1:${server.address().port}/index.html?shot${model ? '&model=' + model : ''}${process.env.CLAY ? '&clay' : ''}`;
const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const page = await browser.newPage({ viewport: { width: 1200, height: 700 } });
page.on('pageerror', e => console.log('PAGE ERROR', e.message));
page.on('console', m => { if (m.type() === 'error') console.log('console:', m.text()); });
await page.goto(url);
await page.waitForFunction(() => !document.getElementById('msg'), null, { timeout: 120000 });
await page.evaluate(() => { document.getElementById('hud').style.display = 'none'; document.getElementById('parts').style.display = 'none'; });
for (const t of toggles) await page.evaluate((id) => window.zr1.click(id), t);
for (const v of views) {
  await page.evaluate((k) => { window.zr1.setView(k); window.zr1.render(); }, v);
  await page.screenshot({ timeout: 300000, path: path.join(out, `view_${v}${toggles.length ? '_' + toggles.join('_') : ''}.png`) });
}
await browser.close();
server.close();
console.log('shots in', out);
