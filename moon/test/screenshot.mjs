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
  ['orbit', 'site=apollo11&view=orbit&alt=1400000&quality=balanced'],
  ['descent', 'site=apollo11&view=ground&alt=9000&quality=balanced'],
  ['tranquility-now', 'site=apollo11&view=ground&alt=2.2&quality=high'],
  ['tranquility-1969', 'site=apollo11&view=ground&alt=2.2&t=1969-07-20T20:17:40Z&quality=high'],
  ['tycho', 'site=tycho&view=ground&alt=60&quality=balanced'],
  ['shackleton', 'site=shackleton_rim&view=ground&alt=6&quality=balanced'],
  ['farside', 'site=farside_highlands&view=ground&alt=3&quality=balanced'],
];

const shots = args.filter((a, i) => args[i - 1] === '--shot')
  .map(s => [s.split(':')[0], s.slice(s.indexOf(':') + 1)]);
const SHOTS = shots.length ? shots : DEFAULT_SHOTS;

const MIME = {
  '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript',
  '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg',
  '.bin': 'application/octet-stream', '.css': 'text/css',
};

async function serve() {
  const server = createServer(async (req, res) => {
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
    const url = `http://127.0.0.1:${port}/index.html?${query}`;
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
