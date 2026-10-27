// Screenshots of the Atlas for visual checks — pages, lesson steps and every
// simulation in the gallery — in dark and light themes. Several rendering
// bugs in this repository were only ever visible in a screenshot.
//   python3 -m http.server 8765 --bind 127.0.0.1   (from the repository root)
//   node atlas/tools/shots.mjs [out-dir] [pages|sims|lesson:<id>|all]
// Playwright comes preinstalled in this environment; nothing is installed.

import { createRequire } from 'node:module';
import { mkdirSync } from 'node:fs';

const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const out = (process.argv[2] || 'shots').replace(/\/$/, '') + '/';
const what = process.argv[3] || 'all';
const BASE = process.env.ATLAS_URL || 'http://127.0.0.1:8765/atlas/';
mkdirSync(out, { recursive: true });

const PAGES = [['home', '#/'], ['library', '#/library'], ['course', '#/course/math1220'], ['gr', '#/gr'], ['map', '#/map'], ['review', '#/review'], ['progress', '#/progress'], ['manifest', '#/manifest'], ['settings', '#/settings'], ['explore', '#/explore']];

const browser = await chromium.launch();
const errors = [];
async function newPage(theme, width = 1280, height = 860) {
  const page = await browser.newPage({ viewport: { width, height } });
  page.on('pageerror', (e) => errors.push(`${page.url()}: ${e.message}`));
  page.on('console', (m) => { if (m.type() === 'error') errors.push(`${page.url()}: ${m.text()}`); });
  await page.goto(BASE + '#/settings');
  await page.evaluate((th) => { sessionStorage.setItem('atlas:skipWelcome', '1'); localStorage.setItem('atlas:theme', th); }, theme);
  return page;
}

for (const theme of ['dark', 'light']) {
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
  if (what.startsWith('lesson:')) {
    const id = what.slice(7);
    const page = await newPage(theme);
    await page.goto(BASE + '#/lesson/' + id); await page.waitForTimeout(900);
    let k = 0;
    await page.screenshot({ path: `${out}${theme}-lesson-${k++}.png`, fullPage: true });
    for (let step = 0; step < 3; step++) {
      const next = await page.$('.player-nav .btn.primary');
      if (!next) break;
      await next.click(); await page.waitForTimeout(1000);
      const all = await page.$('text=Show all');
      if (all) { await all.click(); await page.waitForTimeout(300); }
      await page.screenshot({ path: `${out}${theme}-lesson-${k++}.png`, fullPage: true });
    }
  }
}
await browser.close();
console.log(errors.length ? errors.join('\n') : 'no page errors');
process.exit(errors.length ? 1 : 0);
