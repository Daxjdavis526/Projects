// Headless test runner.
//
//   node primeval/test/run.mjs
//
// The game modules import three.js by the bare specifier "three", which the
// browser resolves through the importmap in index.html. Node has no importmap,
// so this bootstraps a throwaway node_modules/three that re-exports the same
// vendored bundle. It is gitignored; nothing is downloaded.

import { mkdirSync, writeFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..');
const shim = join(root, 'node_modules', 'three');

if (!existsSync(join(shim, 'index.js'))) {
  mkdirSync(shim, { recursive: true });
  writeFileSync(join(shim, 'package.json'), JSON.stringify({
    name: 'three', type: 'module', main: 'index.js',
    exports: { '.': './index.js', './addons/*': '../../vendor/three/jsm/*' },
  }, null, 2));
  writeFileSync(join(shim, 'index.js'), "export * from '../../vendor/three/three.module.min.js';\n");
}

import { results } from './harness.mjs';

const suites = ['./field.test.mjs', './anatomy.test.mjs', './physics.test.mjs',
  './movement.test.mjs', './transit.test.mjs'];
for (const s of suites) {
  const mod = await import(s);
  process.stdout.write(`\n${mod.NAME.padEnd(22)} `);
  await mod.run();
}

console.log('\n');
if (results.failures.length) {
  console.log('FAILURES:\n');
  for (const f of results.failures) console.log('  ' + f + '\n');
}
console.log(`${results.passed} passed, ${results.failed} failed`);
process.exit(results.failed ? 1 : 0);
