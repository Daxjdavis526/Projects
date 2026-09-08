/* Drive the page in headless Chromium and save screenshots.

   Several rendering bugs in this repository were only ever visible in a
   picture, never in a stack trace, so this is a first-class test. It starts a
   static server, waits until the terrain has actually built something, and
   writes PNGs plus any console errors.

     NODE_PATH=/opt/node22/lib/node_modules node moon/test/screenshot.mjs
     ... --out /tmp/shots --shot 'apollo11:site=apollo11&view=ground'
*/
import { createServer } from 'node:http';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { chromium } = require(process.env.NODE_PATH
  ? path.join(process.env.NODE_PATH.split(':')[0], 'playwright')
  : 'playwright');

const here = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(here, '..');

const args = process.argv.slice(2);
const argOf = (name, dflt) => {
  const i = args.indexOf('--' + name);
  return i >= 0 ? args[i + 1] : dflt;
};
const OUT = argOf('out', path.join(ROOT, '..', 'shots'));
const WIDTH = Number(argOf('width', 1600));
const HEIGHT = Number(argOf('height', 900));
const TIMEOUT = Number(argOf('timeout', 180000));
const SETTLE = Number(argOf('settle', 6000));

const DEFAULT_SHOTS = [
  ['orbit', 'site=apollo11&view=orbit&alt=1200000&t=2026-09-22T14:00Z&rate=0&quality=balanced'],
  /* Nine kilometres over Tycho rather than over mare, because the point of the
     shot is horizon curvature and relief, and Mare Tranquillitatis is genuinely
     flat. */
  ['descent', 'site=tycho&view=ground&alt=9000&t=2026-09-22T14:00Z&rate=0&yaw=20&quality=balanced'],
  /* Offset from the descent stage rather than on top of it: standing at the
     published coordinates puts the camera inside the spacecraft. */
  ['tranquility-now', 'site=0.67446,23.47353&mode=eva&t=2026-09-19T00:00Z&rate=0&yaw=230&pitch=-2&quality=high'],
  ['tranquility-1969', 'site=apollo11&mode=eva&t=1969-07-20T20:17:40Z&rate=0&quality=high'],
  ['tranquility-earth', 'site=apollo11&mode=eva&t=1969-07-20T20:17:40Z&rate=0&look=earth&fov=14&quality=high'],
  /* Night, lamps on. The one shot that shows what a lamp is for, and the one
     that caught the exposure model not knowing they existed. */
  ['night-lamps', 'site=apollo11&mode=eva&t=2026-09-15T00:00Z&rate=0&lamps=2&pitch=-20&quality=high'],
  ['third-person', 'site=apollo11&mode=eva&t=1969-07-21T02:56:15Z&rate=0&view3=1&quality=high'],
  /* On the floor six kilometres north of the centre, looking back at the
     central peak. Standing on the published centre coordinates puts you on the
     peak's own flank, where a 30-degree slope fills the frame and you slide
     down it: true, dramatic, and not a photograph of Tycho. */
  ['tycho', 'site=-43.1120,-11.36192&mode=eva&t=2026-09-22T14:00Z&rate=0&yaw=180&quality=balanced'],
  /* The rim of Shackleton never sees the Sun more than about two degrees up,
     so this is what the place actually looks like: a black world with bright
     slivers on the sunward slopes, and the lamps are not optional. */
  /* Looking along the rim rather than into the crater: the floor of Shackleton
     has not seen the Sun in a billion years and photographs as a rectangle of
     black, which is true and is not a picture. */
  ['shackleton', 'site=shackleton_rim&mode=eva&t=2026-09-14T00:00Z&rate=0&yaw=300&lamps=2&quality=balanced'],
  ['farside', 'site=farside_highlands&mode=eva&t=2026-09-08T09:00Z&rate=0&quality=balanced'],
  ['base', 'site=apollo11&mode=eva&ship=1&t=2026-09-19T00:00Z&rate=0&yaw=270&quality=balanced'],
  ['night', 'site=apollo11&mode=eva&t=2026-09-15T00:00Z&rate=0&quality=balanced'],
];

const shots = args.filter((a, i) => args[i - 1] === '--shot')
  .map(s => [s.split(':')[0], s.slice(s.indexOf(':') + 1)]);
const SHOTS = shots.length ? shots : DEFAULT_SHOTS;

const MIME = {
  '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript',
  '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg',
  '.bin': 'application/octet-stream', '.css': 'text/css', '.woff2': 'font/woff2',
};

/* Relay for NASA Trek. The browser in this sandbox cannot reach the internet
   directly, but Node can (through the agent proxy), so the harness forwards
   /nasa/* and hands the bytes back with permissive CORS. In the real game the
   page talks to trek.nasa.gov itself. */
async function relay(req, res) {
  const target = 'https://trek.nasa.gov' + req.url.slice('/nasa'.length);
  try {
    const upstream = await fetch(target);
    const buf = Buffer.from(await upstream.arrayBuffer());
    res.writeHead(upstream.status, {
      'Content-Type': upstream.headers.get('content-type') || 'application/octet-stream',
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'no-store',
    });
    res.end(buf);
  } catch (e) {
    res.writeHead(502, { 'Access-Control-Allow-Origin': '*' });
    res.end(String(e));
  }
}

async function serve() {
  const server = createServer(async (req, res) => {
    if (req.url.startsWith('/nasa/')) return relay(req, res);
    try {
      const url = decodeURIComponent(req.url.split('?')[0]);
      const file = path.join(ROOT, url === '/' ? 'index.html' : url);
      if (!file.startsWith(ROOT)) { res.writeHead(403).end(); return; }
      const body = await readFile(file);
      res.writeHead(200, {
        'Content-Type': MIME[path.extname(file)] || 'application/octet-stream',
        'Cache-Control': 'no-store',
      });
      res.end(body);
    } catch {
      res.writeHead(404).end('not found');
    }
  });
  await new Promise(r => server.listen(0, '127.0.0.1', r));
  return { server, port: server.address().port };
}

async function main() {
  await mkdir(OUT, { recursive: true });
  const { server, port } = await serve();
  const browser = await chromium.launch({
    args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader',
           '--disable-lcd-text', '--no-sandbox', '--enable-features=SharedArrayBuffer'],
  });
  const report = [];
  for (const [name, query] of SHOTS) {
    const page = await browser.newPage({ viewport: { width: WIDTH, height: HEIGHT } });
    const errors = [];
    page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
    page.on('pageerror', (e) => errors.push(String(e)));
    const relayBase = `http://127.0.0.1:${port}/nasa`;
    const url = `http://127.0.0.1:${port}/index.html?${query}` +
      (query.includes('offline=1') ? '' : `&trek=${encodeURIComponent(relayBase)}`);
    process.stdout.write(`${name.padEnd(20)} ${query}\n`);
    const t0 = Date.now();
    let ok = true, note = '';
    try {
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
      await page.waitForFunction('window.SELENE && window.SELENE.ready === true', null,
        { timeout: TIMEOUT, polling: 500 });
      /* Let the quadtree finish refining and the exposure settle. */
      await page.waitForTimeout(SETTLE);
    } catch (e) {
      ok = false;
      note = String(e).split('\n')[0];
      const fatal = await page.$eval('#fatal', n => n.textContent).catch(() => '');
      if (fatal && fatal.trim()) note += ' | ' + fatal.trim().slice(0, 400);
    }
    const stats = await page.evaluate(() => (window.SELENE ? window.SELENE.stats() : null)).catch(() => null);
    await page.screenshot({ path: path.join(OUT, name + '.png') });
    report.push({ name, ok, note, errors: errors.slice(0, 6), stats, seconds: (Date.now() - t0) / 1000 });
    console.log(`  ${ok ? 'ok  ' : 'FAIL'} ${((Date.now() - t0) / 1000).toFixed(1)} s` +
      (stats ? `  tiles ${stats.tiles} triangles ${(stats.triangles / 1000).toFixed(0)}k fps ${stats.fps.toFixed(1)}` : '') +
      (note ? `\n       ${note}` : '') +
      (errors.length ? `\n       console: ${errors.slice(0, 3).join(' | ').slice(0, 400)}` : ''));
    await page.close();
  }
  await browser.close();
  server.close();
  await writeFile(path.join(OUT, 'report.json'), JSON.stringify(report, null, 1));
  const bad = report.filter(r => !r.ok || r.errors.length);
  console.log(`\n${report.length - bad.length}/${report.length} clean, written to ${OUT}`);
  process.exit(bad.length ? 1 : 0);
}

main();
