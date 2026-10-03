/* Stills of a stand's 3D hardware, headless, for working on the models.
     node redline/tools/stand-preview.mjs TS-2 out.png "x,y,z,tx,ty,tz,fov" [clock] */
import http from 'node:http'; import fs from 'node:fs'; import path from 'node:path';
import { fileURLToPath } from 'node:url'; import { createRequire } from 'node:module';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const [stand = 'TS-2', out = 'preview.png', view = '', clock = '30600'] = process.argv.slice(2);
const { chromium } = createRequire(import.meta.url)(path.join(process.env.NODE_PATH || '/opt/node22/lib/node_modules', 'playwright'));
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript' };
const server = http.createServer((req, res) => {
  const p = path.join(root, decodeURIComponent(req.url.split('?')[0]));
  if (!p.startsWith(root) || !fs.existsSync(p)) { res.writeHead(404); res.end(); return; }
  res.writeHead(200, { 'Content-Type': TYPES[path.extname(p)] || 'application/octet-stream' }); fs.createReadStream(p).pipe(res);
});
await new Promise(r => server.listen(0, r));
const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const page = await browser.newPage({ viewport: { width: 1400, height: 800 } });
page.on('pageerror', e => console.log('PAGE ERROR', e.message));
page.on('console', m => { if (m.type() === 'error') console.log('console:', m.text()); });
const u = `http://127.0.0.1:${server.address().port}/tools/stand-preview.html?stand=${encodeURIComponent(stand)}&clock=${clock}` + (view ? `&view=${view}` : '') + (process.env.PEOPLE ? '&people=1' : '');
await page.goto(u);
await page.waitForFunction(() => window.done, null, { timeout: 120000 });
await page.screenshot({ path: out });
await browser.close(); server.close();
console.log('wrote', out);
