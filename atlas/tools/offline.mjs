// Regenerates offline-files.json — every file the Atlas needs to run with no
// network, which Settings → "Save for offline" downloads into the service
// worker's cache. Two groups: `app` (pages, lessons, simulations, KaTeX, fonts,
// icons) and `python` (Pyodide and its wheels, only for the code lab and coding
// exercises). Tests, tools and Markdown are left out.
//   node atlas/tools/offline.mjs          rewrite offline-files.json
//   node atlas/tools/offline.mjs --check  exit 1 if it is out of date
// register.mjs runs it too, so adding a lesson keeps the list current.

import { readdirSync, readFileSync, writeFileSync, renameSync, statSync, existsSync } from 'node:fs';
import { join, dirname, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const FILE = join(ROOT, 'offline-files.json');
const SKIP_DIRS = new Set(['test', 'tools', '.git', 'node_modules']);
const SKIP_FILE = (f) => /\.(md|txt)$/i.test(f) || /^LICENSE/i.test(f) || f === 'offline-files.json' || f.startsWith('.');

function walk(dir, out) {
  for (const f of readdirSync(dir).sort()) {
    const p = join(dir, f);
    if (statSync(p).isDirectory()) { if (!SKIP_DIRS.has(f)) walk(p, out); }
    else if (!SKIP_FILE(f)) out.push({ path: relative(ROOT, p).split(sep).join('/'), size: statSync(p).size });
  }
  return out;
}

export function scanOffline() {
  const all = walk(ROOT, []);
  const isPy = (f) => /^vendor\/pyodide-/.test(f.path);
  const group = (files) => ({ files: files.map((f) => f.path), bytes: files.reduce((s, f) => s + f.size, 0) });
  return { app: group(all.filter((f) => !isPy(f))), python: group(all.filter(isPy)) };
}

export function renderOffline(list = scanOffline()) {
  return JSON.stringify(list, null, 0).replace(/","/g, '",\n"') + '\n';
}

export function writeOffline({ check = false } = {}) {
  const want = renderOffline();
  const have = existsSync(FILE) ? readFileSync(FILE, 'utf8') : '';
  if (check) return have === want;
  if (have !== want) {
    const tmp = `${FILE}.${process.pid}.tmp`;
    writeFileSync(tmp, want);
    renameSync(tmp, FILE);
  }
  return true;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  if (process.argv.includes('--check')) {
    if (!writeOffline({ check: true })) { console.log('offline-files.json is out of date — run: node atlas/tools/offline.mjs'); process.exit(1); }
    console.log('offline-files.json is up to date');
  } else {
    writeOffline();
    const s = scanOffline();
    console.log(`offline-files.json: ${s.app.files.length} app files (${(s.app.bytes / 1e6).toFixed(1)} MB), ${s.python.files.length} Python files (${(s.python.bytes / 1e6).toFixed(1)} MB)`);
  }
}
