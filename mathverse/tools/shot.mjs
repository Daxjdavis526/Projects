// Screenshot MathVerse in a real browser (the dev server must be running: npm run dev).
//   node tools/shot.mjs <outdir> <name> <route> [waitMs] [width] [height]
// route: demo/calc1.tangent | demo/calc1.tangent/tutorial | explore/f(x)=x^2 | companion | home
// Prints page errors. Interact with the page by editing this script or writing your own Playwright steps.
import { createRequire } from 'node:module';
const { chromium } = createRequire(import.meta.url)('playwright');
const [out, name, route = '', wait = '2500', w = '1600', h = '950'] = process.argv.slice(2);
const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const p = await b.newPage({ viewport: { width: +w, height: +h } });
const errs = [];
p.on('pageerror', (e) => errs.push(e.message));
p.on('console', (m) => { if (m.type() === 'error') errs.push('console: ' + m.text()); });
const port = process.env.MV_PORT || 1420;
await p.goto(`http://localhost:${port}/#/${route.split('/').map(encodeURIComponent).join('/')}`);
await p.waitForTimeout(+wait);
await p.screenshot({ path: `${out}/${name}.png` });
console.log(errs.length ? 'ERRORS:\n' + [...new Set(errs)].join('\n') : 'no page errors');
await b.close();
