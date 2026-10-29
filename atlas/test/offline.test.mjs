// The installable app: the offline file list matches the files on disk, the
// manifest names icons that exist, and the service worker's shell files exist.
//   node atlas/test/offline.test.mjs

import { readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { writeOffline, scanOffline } from '../tools/offline.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
let pass = 0, fail = 0;
const check = (name, ok, detail = '') => { if (ok) pass++; else { fail++; console.log(`FAIL  ${name}${detail ? '  — ' + detail : ''}`); } };

check('offline-files.json is up to date (run node atlas/tools/register.mjs)', writeOffline({ check: true }));
const list = scanOffline();
check('the offline list holds the app and its lessons', list.app.files.includes('index.html') && list.app.files.includes('sw.js') && list.app.files.some((f) => f.startsWith('content/gr/')));
check('the Python lab is its own optional group', list.python.files.some((f) => f.endsWith('.wasm')) && !list.app.files.some((f) => f.startsWith('vendor/pyodide')));
check('tests and tools stay off the device', !list.app.files.some((f) => /^(test|tools)\//.test(f) || f.endsWith('.md')));

const man = JSON.parse(readFileSync(join(ROOT, 'manifest.webmanifest'), 'utf8'));
check('manifest: standalone, scoped to the Atlas folder', man.display === 'standalone' && man.scope === './' && man.start_url.startsWith('./'));
for (const ic of man.icons) check(`manifest icon ${ic.src} exists`, existsSync(join(ROOT, ic.src)));
check('manifest has a 512 px maskable icon', man.icons.some((i) => i.purpose === 'maskable' && i.sizes === '512x512'));

const sw = readFileSync(join(ROOT, 'sw.js'), 'utf8');
const shell = JSON.parse(/const SHELL = (\[[\s\S]*?\]);/.exec(sw)[1].replace(/'/g, '"'));
for (const f of shell) check(`service-worker shell file ${f} exists`, existsSync(join(ROOT, f)));
const html = readFileSync(join(ROOT, 'index.html'), 'utf8');
check('index.html links the manifest and the iPhone icon', html.includes('rel="manifest"') && html.includes('rel="apple-touch-icon"') && existsSync(join(ROOT, 'icons/apple-touch-icon.png')));

console.log(`${pass} passed, ${fail} failed`);
if (fail) process.exit(1);
