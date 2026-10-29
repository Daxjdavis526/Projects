// Runs every test file in this folder and prints one line each.
//   node atlas/test/all.mjs            (exit status 1 if any failed)
import { readdirSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
let failed = 0;
for (const f of readdirSync(here).filter((n) => n.endsWith('.test.mjs')).sort()) {
  const r = spawnSync(process.execPath, [join(here, f)], { encoding: 'utf8', maxBuffer: 64 << 20 });
  const out = (r.stdout || '') + (r.stderr || '');
  const summary = out.trim().split('\n').filter((l) => /passed|failed/.test(l)).pop() || out.trim().split('\n').pop();
  if (r.status !== 0) { failed++; console.log(`✗ ${f}: ${summary}`); console.log(out.split('\n').filter((l) => l.startsWith('FAIL')).slice(0, 10).join('\n')); }
  else console.log(`✓ ${f}: ${summary}`);
}
process.exit(failed ? 1 : 0);
