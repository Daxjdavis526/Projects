// Render frames of the film to PNG with headless Chromium, for looking at.
//
//   node tools/frames.mjs out/ sky@12 bedroom@5 bedroom@28 ...
//   node tools/frames.mjs out/ sky            (six frames spread through the scene)
//   node tools/frames.mjs out/ 125.5          (film time in seconds)
//   node tools/frames.mjs sheet.png sky bedroom@5 ...   (one contact sheet, two columns)
//
// Serves the project directory itself; needs Playwright (npm i -g playwright).

import { createServer } from 'node:http';
import { readFile, mkdir } from 'node:fs/promises';
import { extname, join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import { execSync } from 'node:child_process';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const require = createRequire(import.meta.url);
let playwright;
try { playwright = require('playwright'); } catch {
  playwright = require(join(execSync('npm root -g').toString().trim(), 'playwright'));
}

const [out = 'frames', ...specs] = process.argv.slice(2);
const SHEET = out.endsWith('.png');
if (!SHEET) await mkdir(out, { recursive: true });

const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.woff2': 'font/woff2', '.css': 'text/css', '.png': 'image/png' };
const server = createServer(async (req, res) => {
  try {
    const path = join(root, decodeURIComponent(new URL(req.url, 'http://x').pathname));
    const body = await readFile(path.endsWith('/') ? join(path, 'index.html') : path);
    res.writeHead(200, { 'content-type': TYPES[extname(path)] || 'application/octet-stream' });
    res.end(body);
  } catch { res.writeHead(404); res.end(); }
}).listen(0);
const port = server.address().port;

const browser = await playwright.chromium.launch({ executablePath: process.env.CHROMIUM || undefined });
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
page.on('pageerror', (e) => console.error('page error:', e.message));
page.on('console', (m) => { if (m.type() === 'error' || m.type() === 'warning') console.error('console:', m.text()); });
await page.goto(`http://localhost:${port}/index.html?still`);
await page.waitForFunction(() => window.__ready === true, null, { timeout: 30000 });
const timeline = await page.evaluate(() => window.film.timeline.map((s) => ({ id: s.id, start: s.start, dur: s.dur })));

const shots = [];
for (const spec of specs) {
  if (/^[\d.]+$/.test(spec)) { shots.push([Number(spec), `t${spec}`]); continue; }
  const [id, at] = spec.split('@');
  const s = timeline.find((x) => x.id === id);
  if (!s) { console.error('no scene', id); continue; }
  if (at !== undefined) shots.push([s.start + Number(at), `${id}@${at}`]);
  else for (let i = 0; i < 6; i++) { const a = +(s.dur * (i + 0.5) / 6).toFixed(1); shots.push([s.start + a, `${id}@${a}`]); }
}
const thumbs = [];
for (const [T, name] of shots) {
  const ms = await page.evaluate((T) => { const t0 = performance.now(); window.film.frame(T); return performance.now() - t0; }, T);
  if (SHEET) thumbs.push([name, await page.evaluate(() => document.getElementById('film').toDataURL('image/jpeg', 0.82))]);
  else await page.screenshot({ path: join(out, `${name}.png`) });
  console.log(`${name}  (${ms.toFixed(1)} ms)`);
}
if (SHEET) {
  const sheet = await browser.newPage({ viewport: { width: 1920, height: 540 }, deviceScaleFactor: 1 });
  await sheet.setContent(`<body style="margin:0;background:#222;display:grid;grid-template-columns:960px 960px;font:14px sans-serif;color:#ccc">${
    thumbs.map(([n, d]) => `<div style="position:relative"><img src="${d}" style="width:960px;height:540px;display:block"><span style="position:absolute;left:6px;top:4px;background:#000a;padding:1px 6px">${n}</span></div>`).join('')}</body>`);
  await sheet.screenshot({ path: out, fullPage: true });
}
await browser.close();
server.close();
