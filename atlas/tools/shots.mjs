// Screenshots of the Atlas for visual checks — pages, lesson steps and every
// simulation in the gallery — in dark and light themes. Several rendering
// bugs in this repository were only ever visible in a screenshot.
//   node atlas/tools/shots.mjs <out-dir> [pages|sims|lesson:<id>|sim:<id>|all] [dark|light]
// It serves the repository itself on a free local port (so several runs can
// go at once) and prints any page errors; exit status 1 if there were some.
// Playwright comes preinstalled in this environment; nothing is installed.

import { createRequire } from 'node:module';
import { mkdirSync, createReadStream, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { join, extname, normalize, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const out = (process.argv[2] || 'shots').replace(/\/$/, '') + '/';
const what = process.argv[3] || 'all';
const themes = process.argv[4] ? [process.argv[4]] : ['dark', 'light'];
mkdirSync(out, { recursive: true });

// a static file server over the repository root
const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.woff2': 'font/woff2', '.woff': 'font/woff', '.ttf': 'font/ttf', '.wasm': 'application/wasm', '.zip': 'application/zip', '.whl': 'application/zip', '.tar': 'application/x-tar', '.py': 'text/plain' };
const server = createServer((req, res) => {
  let path = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  if (path.endsWith('/')) path += 'index.html';
  const file = normalize(join(ROOT, path));
  if (!file.startsWith(ROOT)) { res.writeHead(403).end(); return; }
  try { if (!statSync(file).isFile()) throw new Error(); } catch { res.writeHead(404).end(); return; }
  res.writeHead(200, { 'content-type': TYPES[extname(file)] || 'application/octet-stream' });
  createReadStream(file).pipe(res);
});
await new Promise((r) => server.listen(0, '127.0.0.1', r));
const BASE = process.env.ATLAS_URL || `http://127.0.0.1:${server.address().port}/atlas/`;

const PAGES = [['home', '#/'], ['library', '#/library'], ['course', '#/course/math1220'], ['gr', '#/gr'], ['map', '#/map'], ['review', '#/review'], ['progress', '#/progress'], ['manifest', '#/manifest'], ['settings', '#/settings'], ['explore', '#/explore']];

const browser = await chromium.launch();
const errors = [];
async function newPage(theme, width = 1280, height = 860) {
  const page = await browser.newPage({ viewport: { width, height } });
  page.on('pageerror', (e) => errors.push(`${page.url()}: ${e.message}`));
  page.on('console', (m) => { if (m.type() === 'error') errors.push(`${page.url()}: ${m.text()}`); });
  await page.goto(BASE + '#/settings');
  await page.waitForTimeout(400);
  // set the theme through the app itself, so it is saved with the other settings
  await page.evaluate(async (th) => {
    sessionStorage.setItem('atlas:skipWelcome', '1');
    const state = await import('./src/ui/state.js');
    await state.setSettings({ theme: th });
  }, theme);
  return page;
}

for (const theme of themes) {
  if (what === 'all' || what === 'pages') {
    const page = await newPage(theme);
    for (const [name, hash] of PAGES) {
      await page.goto(BASE + hash); await page.waitForTimeout(900);
      await page.screenshot({ path: `${out}${theme}-${name}.png`, fullPage: true });
    }
    const phone = await newPage(theme, 390, 844);
    for (const [name, hash] of PAGES.slice(0, 4)) {
      await phone.goto(BASE + hash); await phone.waitForTimeout(900);
      await phone.screenshot({ path: `${out}${theme}-phone-${name}.png`, fullPage: true });
    }
  }
  if (what === 'all' || what === 'sims') {
    const { default: GALLERY } = await import('../content/gallery.js');
    const page = await newPage(theme);
    for (const g of GALLERY) {
      await page.goto(BASE + '#/explore/' + g.id); await page.waitForTimeout(1200);
      await page.screenshot({ path: `${out}${theme}-sim-${g.id}.png`, fullPage: true });
    }
  }
  if (what.startsWith('sim:')) {
    const page = await newPage(theme);
    await page.goto(BASE + '#/explore/' + what.slice(4)); await page.waitForTimeout(1200);
    await page.screenshot({ path: `${out}${theme}-sim-${what.slice(4)}.png`, fullPage: true });
  }
  if (what.startsWith('lesson:')) {
    // every step up to the first practice question, then each practice
    // question with a hint and then its solution, then each checkpoint
    // question and its worked answer
    const id = what.slice(7);
    const page = await newPage(theme);
    await page.goto(BASE + '#/lesson/' + id); await page.waitForTimeout(1000);
    let k = 0;
    const shot = async (tag) => page.screenshot({ path: `${out}${theme}-${id}-${String(k++).padStart(2, '0')}-${tag}.png`, fullPage: true });
    await shot('intro');
    for (let step = 0; step < 6; step++) {
      const crumb = await page.$eval('.crumb', (e) => e.textContent).catch(() => '');
      if (crumb === 'Practice' || crumb === 'Checkpoint') break;
      const next = await page.$('.player-nav .btn.primary');
      if (!next) break;
      await next.click(); await page.waitForTimeout(1100);
      const all = await page.$('button:has-text("Show all")');
      if (all) { await all.click(); await page.waitForTimeout(300); }
      const now = await page.$eval('.crumb', (e) => e.textContent).catch(() => 'step');
      const runBtn = await page.$('.stage button:has-text("Run ▶")');
      if (runBtn) {
        await runBtn.click();
        await page.waitForFunction(() => ![...document.querySelectorAll('.stage button')].some((b) => b.textContent.includes('Running')), null, { timeout: 120000 }).catch(() => {});
        await page.waitForTimeout(300);
      }
      await shot(now.toLowerCase().replace(/\W+/g, '-'));
    }
    // walk the practice questions: show one with its first hint, then make a
    // throwaway attempt and open the solution, which ends the question
    for (let q = 0; q < 10; q++) {
      const crumb = await page.$eval('.crumb', (e) => e.textContent).catch(() => '');
      if (crumb !== 'Practice') break;
      const hint = await page.$('button:has-text("Hint")');
      if (hint) { await hint.click(); await page.waitForTimeout(250); }
      await shot(`practice-${q + 1}`);
      const choice = await page.$('.stage button.choice');
      if (choice) await choice.click();
      else {
        const input = await page.$('.stage .answer input');
        if (input) await input.fill('1');
      }
      const check = await page.$('.stage button.btn.primary:has-text("Check")');
      if (check && await check.isEnabled()) {
        await check.click(); await page.waitForTimeout(150);
        const conf = await page.$('.stage .confidence button');
        if (conf) { await conf.click(); await page.waitForTimeout(150); }
        // a coding exercise runs Python: wait for it to finish
        await page.waitForFunction(() => ![...document.querySelectorAll('.stage button')].some((b) => b.textContent.includes('Running')), null, { timeout: 120000 }).catch(() => {});
      }
      const give = await page.$('.stage button:has-text("Show solution")');
      if (give) { await give.click(); await page.waitForTimeout(400); }
      await shot(`practice-${q + 1}-answered`);
      const nxt = await page.$('button:has-text("Next question"), button:has-text("On to the checkpoint"), button:has-text("Finish")');
      if (!nxt) break;
      await nxt.click(); await page.waitForTimeout(900);
    }
    // the checkpoint: each question, then its worked answer ("I don't know" reveals it)
    for (let q = 0; q < 6; q++) {
      const crumb = await page.$eval('.crumb', (e) => e.textContent).catch(() => '');
      if (crumb !== 'Checkpoint') break;
      await shot(`checkpoint-${q + 1}`);
      const dunno = await page.$('.stage button:has-text("I don’t know")');
      if (!dunno) break;
      await dunno.click(); await page.waitForTimeout(400);
      await shot(`checkpoint-${q + 1}-answered`);
      const nxt = await page.$('.stage button:has-text("Next"), .stage button:has-text("See results")');
      if (!nxt) break;
      await nxt.click(); await page.waitForTimeout(900);
    }
  }
}
await browser.close();
server.close();
console.log(errors.length ? errors.join('\n') : 'no page errors');
process.exit(errors.length ? 1 : 0);
