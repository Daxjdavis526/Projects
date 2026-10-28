// Every coding exercise, run in real Python: Pyodide (the same build the
// browser uses, from atlas/vendor) in Node. The reference solution must pass
// every test; the starter code must not (or the exercise asks nothing).
//   node atlas/test/code.test.mjs              all courses
//   node atlas/test/code.test.mjs prog         one course (or one lesson id)

import { fileURLToPath } from 'node:url';
import { CATALOG } from '../content/catalog.js';
import { itemsOf, instantiate } from '../src/core/content.js';
import { testScript, SCIENTIFIC, imports, cleanTraceback } from '../src/lab/harness.js';

const only = process.argv[2];
let pass = 0, fail = 0;
function check(name, ok, detail = '') {
  if (ok) pass++;
  else { fail++; console.log(`FAIL  ${name}${detail ? '  — ' + detail : ''}`); }
}

// collect every coding exercise first, so Python only starts if there is one
const jobs = [];
for (const L0 of Object.values(CATALOG.lessons)) {
  if (!L0.ready || (only && L0.course !== only && L0.id !== only)) continue;
  const L = (await L0.load()).default;
  for (const { def } of itemsOf(L)) {
    if (def.type !== 'code') continue;
    for (let v = 0; v < (def.gen ? 5 : 1); v++) jobs.push({ where: `${L.id}/${def.id}${def.gen ? ` v${v}` : ''}`, item: instantiate(L, def, v) });
  }
}
for (const c of CATALOG.courses) {
  if (!c.bossLoad || (only && c.id !== only)) continue;
  const B = (await c.bossLoad()).default;
  for (const round of B.rounds) for (const def of round.items) {
    if (def.type === 'code') jobs.push({ where: `${c.id} boss/${def.id}`, item: instantiate({ id: `${c.id}.boss`, skills: [def.skill] }, def, 0) });
  }
}

if (jobs.length) {
  const { loadPyodide } = await import('../vendor/pyodide-314.0.7/pyodide.mjs');
  const py = await loadPyodide({ indexURL: fileURLToPath(new URL('../vendor/pyodide-314.0.7/', import.meta.url)) });
  let printed = '';
  py.setStdout({ batched: (s) => { printed += s + '\n'; } });
  py.setStderr({ batched: () => {} });
  const loaded = new Set();
  // SymPy and mpmath are installed from their own pinned wheels in the browser;
  // here Pyodide's lock-file copies would need the network, so read the same wheels
  const { readFileSync } = await import('node:fs');
  async function prepare(src) {
    const sci = SCIENTIFIC.filter((m) => imports(src, m) && !loaded.has(m));
    if (sci.length) { await py.loadPackage(sci, { messageCallback: () => {} }); sci.forEach((m) => loaded.add(m)); }
    for (const pkg of imports(src, 'sympy') ? ['mpmath', 'sympy'] : imports(src, 'mpmath') ? ['mpmath'] : []) {
      if (loaded.has(pkg)) continue;
      const dir = new URL('../vendor/pyodide-314.0.7/wheels/', import.meta.url);
      const manifest = JSON.parse(readFileSync(new URL('wheels.json', dir), 'utf8'));
      const file = Object.keys(manifest).find((f) => f.startsWith(pkg + '-'));
      py.unpackArchive(new Uint8Array(readFileSync(new URL(file, dir))), 'wheel');   // Pyodide wants a plain byte array, not a Buffer
      loaded.add(pkg);
    }
  }
  async function runWith(src, item) {
    const ns = py.globals.get('dict')();
    printed = '';
    try {
      await prepare(src + '\n' + item.tests.map((t) => t.code).join('\n'));
      await py.runPythonAsync(src, { globals: ns });
      ns.set('_stdout', printed);
      return { ok: true, tests: JSON.parse(await py.runPythonAsync(testScript(item.tests), { globals: ns })) };
    } catch (e) {
      return { ok: false, error: cleanTraceback(e.message) };
    } finally {
      ns.destroy();
      // figures belong to one exercise: close them so the next one starts clean, as in the browser
      if (loaded.has('matplotlib')) await py.runPythonAsync('import matplotlib.pyplot as _p; _p.close("all")').catch(() => {});
    }
  }
  for (const { where, item } of jobs) {
    const ref = await runWith(item.answer, item);
    const bad = ref.ok ? ref.tests.filter((t) => !t.ok) : [];
    check(`${where}: the reference solution passes every test`, ref.ok && !bad.length, ref.ok ? bad.map((t) => `${t.name}${t.error ? ` (${t.error})` : ''}`).join('; ') : ref.error);
    const st = await runWith(item.starter || 'pass', item);
    check(`${where}: the starter code does not already pass`, !st.ok || st.tests.some((t) => !t.ok));
  }
}

console.log(`${jobs.length} coding exercises run in Python`);
console.log(`${pass} passed, ${fail} failed`);
if (fail) process.exit(1);
