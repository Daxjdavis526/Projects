/* Screenshots of the 3D cell cameras during real runs, headless.

   Serves redline/ on a local port, opens it in Chromium (software WebGL),
   drives a session through the same commands an operator would give, and
   photographs each camera at chosen moments.

     node redline/tools/cell-shots.mjs [hot|cold|coldgas|regen|tp|all] [outdir]

   Needs Playwright (npm i -g playwright, or NODE_PATH pointing at it). */
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const which = process.argv[2] || 'hot';
const out = path.resolve(process.argv[3] || path.join(root, 'shots'));
fs.mkdirSync(out, { recursive: true });

let chromium;
try { ({ chromium } = await import('playwright')); }
catch { ({ chromium } = createRequire(import.meta.url)(path.join(process.env.NODE_PATH || '/opt/node22/lib/node_modules', 'playwright'))); }

const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml' };
const server = http.createServer((req, res) => {
  const p = path.join(root, decodeURIComponent(req.url.split('?')[0]).replace(/\/$/, '/index.html'));
  if (!p.startsWith(root) || !fs.existsSync(p)) { res.writeHead(404); res.end(); return; }
  res.writeHead(200, { 'Content-Type': TYPES[path.extname(p)] || 'application/octet-stream' });
  fs.createReadStream(p).pipe(res);
});
await new Promise(r => server.listen(0, r));
const url = `http://127.0.0.1:${server.address().port}/index.html`;

const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const page = await browser.newPage({ viewport: { width: 1600, height: 900 } });
page.on('pageerror', e => console.log('PAGE ERROR', e.message));
page.on('console', m => { if (m.type() === 'error') console.log('console:', m.text()); });
await page.goto(url);
await page.waitForFunction(() => !!window.redline);

/* In the page: start a stand, prepare it the way the tests do, open the
   cameras. */
async function prepare(stand, setup) {
  await page.evaluate(({ stand, setup }) => {
    const app = window.redline;
    app._confirmedLeave = true;             // no 'start a new session?' question
    app.start(null, 'independent', stand);
    app._confirmedLeave = false;
    document.querySelectorAll('.modal .btn.primary, .modal button').forEach(b => { if (/Begin/.test(b.textContent)) b.click(); });
    const S = app.session, ex = (a, x = {}) => S.execute(a, x, { confirmed: true });
    const psi = x => x * 6894.757;
    window.__ex = ex; window.__psi = psi;
    // eslint-disable-next-line no-new-func
    new Function('S', 'ex', 'psi', setup)(S, ex, psi);
    app.views.control.showStage('cell');
  }, { stand, setup });
  await page.waitForFunction(stand => window.redline.session.def.id === stand && window.redline.views.control.cell && !window.redline.views.control.cell.failed && window.redline.views.control.cell.renderer, stand, { timeout: 60000 });
}
/* Fire, run the sim (synchronously) to T+tShot, freeze it, let the camera
   settle for some real frames, photograph each camera. */
const ONLY = process.env.CAMS ? process.env.CAMS.split(',').map(x => +x - 1) : null;
async function fireAndShoot(tag, tShot, cams = [0, 1, 2, 3, 4], { full = true, preRoll = 1.2 } = {}) {
  if (ONLY) cams = cams.filter(c => ONLY.includes(c));
  await page.evaluate(({ tShot, preRoll, full }) => {
    const S = window.redline.session, ex = window.__ex;
    ex('record', { on: true }); S.run(0.5);
    const a = ex('arm'), f = ex('fire');
    if (!a.ok || !f.ok) throw new Error('arm/fire refused: ' + JSON.stringify(a.blocked || a.confirm || f.blocked || f));
    const T0 = S.t + 5;
    S.run(Math.max(0, T0 + tShot - preRoll - S.t));
    window.__T = T0 + tShot;
    const cv = window.redline.views.control.cell;
    if (full && !cv.full) cv.toggleFull(true);
  }, { tShot, preRoll, full });
  // the last stretch runs live, so particles build up
  await page.waitForFunction(() => window.redline.session.t >= window.__T, null, { timeout: 120000, polling: 50 });
  await page.evaluate(() => { window.redline.session.frozen = true; });
  for (const c of cams) {
    await page.evaluate(c => window.redline.views.control.cell.setCam(c), c);
    await page.waitForTimeout(1500);
    const f = path.join(out, `${tag}-cam${c + 1}.png`);
    await page.screenshot({ path: f });
    console.log('wrote', f);
  }
  await page.evaluate(() => { window.redline.session.frozen = false; const cv = window.redline.views.control.cell; if (cv.full) cv.toggleFull(false); });
}

const READY_HOT = `
  ex('daqPower', { on: true }); S.run(5);
  ex('zero', { ids: S.def.sensors.filter(x => x.kind === 'PT').map(x => x.id) });
  ex('tare', { ids: ['WT-716', 'WT-726'] }); ex('daqRate', { rate: 2000 });
  ex('tech', { task: 'loadPropellants' }); S.run(121);
  ex('meterCal', { line: 'ox', fluid: 'OX-1' }); ex('meterCal', { line: 'fu', fluid: 'FU-1' });
  ex('tech', { task: 'openHV' }); S.run(9);
  for (const id of ['VV-601', 'VV-711', 'VV-721']) ex('valve', { id, open: false });
  ex('valve', { id: 'IV-601', open: true }); S.run(2); ex('clearCell'); S.run(7);
  ex('regSet', { id: 'PR-630', value: psi(150) }); ex('regSet', { id: 'PR-610', value: psi(400) }); ex('regSet', { id: 'PR-620', value: psi(400) });
  S.run(30); ex('tare', { ids: ['LC-901'] });
  ex('plan', { plan: { mode: 'hot', duration: 4, lead: 0, ignLead: 0.5, ignOff: 1.0, ignCheck: 0.5, shutdown: 'ox-first', shutLag: 0.05, postPurge: 3 } });`;

if (which === 'hot' || which === 'all') {
  await prepare('TS-2', READY_HOT);
  if (!ONLY) {
    await page.evaluate(() => window.redline.views.control.cell.setCam(0));
    await page.waitForTimeout(1500);
    await page.screenshot({ path: path.join(out, 'hot-before-cam1.png') });
  }
  await fireAndShoot('hot', 2.0);
  // the tape: the ignition again, at a fiftieth of real speed
  await page.evaluate(() => { const S = window.redline.session; S.run(12); window.redline.views.control.cell.toggleFull(true); window.redline.views.control.cell.setCam(1); const cv = window.redline.views.control.cell; cv.startReplay(0.02); if (cv.rep) cv.rep.t += 0.05; });
  await page.waitForTimeout(2500);
  await page.screenshot({ path: path.join(out, 'hot-replay-cam2.png') });
  console.log('wrote', path.join(out, 'hot-replay-cam2.png'));
  await page.evaluate(() => { const cv = window.redline.views.control.cell; cv.stopReplay(); cv.toggleFull(false); });
}
if (which === 'regen' || which === 'all') {
  await prepare('TS-2R', READY_HOT.replace("duration: 4", "duration: 6"));
  await fireAndShoot('regen', 3.0, [1, 2]);
}
if (which === 'cold' || which === 'all') {
  await prepare('TS-2', `
    ex('daqPower', { on: true }); S.run(5);
    ex('zero', { ids: S.def.sensors.filter(x => x.kind === 'PT').map(x => x.id) });
    ex('tare', { ids: ['WT-716', 'WT-726'] });
    ex('tech', { task: 'fillTanks' }); S.run(91);
    ex('tech', { task: 'openHV' }); S.run(9);
    for (const id of ['VV-601', 'VV-711', 'VV-721']) ex('valve', { id, open: false });
    ex('valve', { id: 'IV-601', open: true }); S.run(2); ex('clearCell'); S.run(7);
    ex('regSet', { id: 'PR-630', value: psi(150) }); ex('regSet', { id: 'PR-610', value: psi(150) }); ex('regSet', { id: 'PR-620', value: psi(150) });
    S.run(30);
    ex('plan', { plan: { mode: 'single', duration: 4, sides: 'both', lead: 0, postPurge: 3 } });`);
  await fireAndShoot('cold', 2.0, [1, 2]);
}
if (which === 'coldgas' || which === 'all') {
  await prepare('TS-1', `
    ex('daqPower', { on: true }); S.run(5);
    ex('tech', { task: 'openHV' }); S.run(9);
    ex('valve', { id: 'VV-101', open: false }); ex('valve', { id: 'VV-201', open: false });
    ex('valve', { id: 'IV-101', open: true }); S.run(2); ex('clearCell'); S.run(7);
    ex('regSet', { id: 'PR-101', value: psi(150) }); S.run(20);
    ex('plan', { plan: { mode: 'single', duration: 3 } });`);
  await fireAndShoot('coldgas', 1.5, [1, 2]);
}
if (which === 'tp' || which === 'all') {
  await prepare('TS-3', `
    ex('daqPower', { on: true }); S.run(5);
    ex('zero', { ids: S.def.sensors.filter(x => x.kind === 'PT').map(x => x.id) }); ex('tare', { ids: ['WT-411', 'WT-421'] });
    ex('tech', { task: 'fillTanks' }); S.run(91); ex('tech', { task: 'turnRotor' }); S.run(31);
    ex('tech', { task: 'openHV' }); S.run(9);
    for (const id of ['VV-301', 'VV-413', 'VV-423']) ex('valve', { id, open: false });
    ex('valve', { id: 'IV-301', open: true }); S.run(2); ex('clearCell'); S.run(7);
    ex('regSet', { id: 'PR-410', value: psi(50) }); ex('regSet', { id: 'PR-420', value: psi(50) }); S.run(25);
    ex('plan', { plan: { mode: 'spin', ctl: 'speed', speed: 36000, ramp: 3, duration: 8, thr: 0.66 } });`);
  await fireAndShoot('tp', 6.0, [0, 1, 2]);
}

await browser.close();
server.close();
