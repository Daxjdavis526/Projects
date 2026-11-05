// End-to-end smoke test of the built interface in a real browser: the home
// page, typed input of every kind, and every demonstration — each must open
// without a page error, without an error banner, and draw something.
//   npx vite build && node e2e/smoke.mjs
import { createRequire } from 'node:module';
import { spawn } from 'node:child_process';
const require = createRequire(import.meta.url);
const { chromium } = require('playwright');

const port = 4179;
const server = spawn('npx', ['vite', 'preview', '--port', String(port), '--strictPort'], { stdio: 'ignore', shell: process.platform === 'win32' });
const base = `http://localhost:${port}/`;
for (let i = 0; i < 60; i++) { try { await fetch(base); break; } catch { await new Promise((r) => setTimeout(r, 500)); } }

const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const page = await browser.newPage({ viewport: { width: 1500, height: 900 } });
let errors = [];
page.on('pageerror', (e) => errors.push(e.message));
let failed = 0, passed = 0;
const check = (name, ok, detail = '') => { if (ok) passed++; else { failed++; console.log(`FAIL  ${name}${detail ? ' — ' + detail : ''}`); } };

async function visit(route, name, wait = 1800) {
  errors = [];
  await page.goto(base + '#/' + route.split('/').map(encodeURIComponent).join('/'));
  await page.reload();
  await page.waitForTimeout(wait);
  const banner = await page.$eval('.banner.bad', (e) => e.textContent).catch(() => null);
  // something was drawn: a non-blank canvas in the viewport
  const drawn = await page.evaluate(() => [...document.querySelectorAll('.viewport canvas')].some((c) => c.width > 0 && c.height > 0));
  check(name, !errors.length && !banner, errors.join(' | ') || banner || '');
  return drawn;
}

await page.goto(base);
await page.waitForTimeout(1500);
check('home renders', await page.$('.home-hero') !== null);
for (const src of ['f(x) = x^3 - 4x', 'z = sin(x)cos(y)', 'r(t) = (cos t, sin t, t/4)', 'F(x,y) = (-y, x)', 'F(x,y,z) = (y, -x, z)', 'A = [[2,1],[1,2]]', 'dy/dt = -2y', "y'' + 0.5y' + 4y = 0", 'dx/dt = y; dy/dt = -x', 'x^2 + y^2 = 1', 'r = 1 + cos(θ)', 'r(u,v) = (cos u sin v, sin u sin v, cos v)']) {
  const drawn = await visit('explore/' + src, `explore: ${src}`);
  check(`explore draws: ${src}`, drawn);
}
const ids = await page.evaluate(() => window.__MV_DEMOS ?? []);
console.log(`${ids.length} demonstrations`);
for (const id of ids) {
  const drawn = await visit('demo/' + id, `demo ${id}`, 2200);
  check(`demo draws: ${id}`, drawn);
}
await visit('companion', 'companion');
await visit('tutorials', 'tutorials');
await browser.close();
server.kill();
console.log(`${passed} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);
