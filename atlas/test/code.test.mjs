// Every coding exercise, run in real Python: Pyodide (the same build the
// browser uses, from atlas/vendor) in Node. The reference solution must pass
// every test; the starter code must not (or the exercise asks nothing).
// Every runnable code-runner snippet (a lesson's Explore code) must run, draw
// its figures and print nothing on stderr: the learner presses Run first.
//   node atlas/test/code.test.mjs              all courses
//   node atlas/test/code.test.mjs prog         one course (or one lesson id)

import { fileURLToPath } from 'node:url';
import { CATALOG } from '../content/catalog.js';
import { itemsOf, instantiate } from '../src/core/content.js';
import { testScript, SCIENTIFIC, imports, cleanTraceback } from '../src/lab/harness.js';
import { PLOT_MODULE, MPL_MODULE } from '../src/lab/pymodules.js';

const only = process.argv[2];
let pass = 0, fail = 0;
function check(name, ok, detail = '') {
  if (ok) pass++;
  else { fail++; console.log(`FAIL  ${name}${detail ? '  — ' + detail : ''}`); }
}

// collect every coding exercise first, so Python only starts if there is one
const jobs = [], snippets = [];
// code-runner visuals sit anywhere in a lesson's data (Explore, teach steps, items)
function runners(x, where, seen = new Set()) {
  if (!x || typeof x !== 'object' || seen.has(x)) return;
  seen.add(x);
  if (x.type === 'code-runner' && typeof x.params?.code === 'string') snippets.push({ where, code: x.params.code });
  for (const v of Array.isArray(x) ? x : Object.values(x)) runners(v, where, seen);
}
for (const L0 of Object.values(CATALOG.lessons)) {
  if (!L0.ready || (only && L0.course !== only && L0.id !== only)) continue;
  const L = (await L0.load()).default;
  runners(L, L.id);
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

if (jobs.length || snippets.length) {
  const { loadPyodide } = await import('../vendor/pyodide-314.0.7/pyodide.mjs');
  const py = await loadPyodide({ indexURL: fileURLToPath(new URL('../vendor/pyodide-314.0.7/', import.meta.url)) });
  let printed = '', errText = '';
  py.setStdout({ batched: (s) => { printed += s + '\n'; } });
  py.setStderr({ batched: (s) => { errText += s + '\n'; } });
  // the same helper modules and warning filters as the browser's worker
  py.FS.mkdirTree('/home/pyodide/atlas');
  py.FS.writeFile('/home/pyodide/atlas/__init__.py', '');
  py.FS.writeFile('/home/pyodide/atlas/plot.py', PLOT_MODULE);
  py.FS.writeFile('/home/pyodide/atlas/_mpl.py', MPL_MODULE);
  await py.runPythonAsync(['import sys, os, warnings', 'sys.path.insert(0, "/home/pyodide")', 'os.environ["MPLBACKEND"] = "Agg"',
    'warnings.filterwarnings("ignore", message=".*non-interactive.*")',
    'warnings.filterwarnings("ignore", message=".*parameter as float was deprecated.*")'].join('\n'));
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
    ns.set('__name__', '__main__');
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
  let styled = false;
  for (const { where, code } of snippets) {
    const ns = py.globals.get('dict')();
    ns.set('__name__', '__main__');
    errText = '';
    let error = '';
    try {
      await prepare(code);
      if (loaded.has('matplotlib') && !styled) { await py.runPythonAsync('import atlas._mpl as _m\n_m.style(True)'); styled = true; }
      await py.runPythonAsync(code, { globals: ns });
      // drawing is where bad mathtext or a malformed figure fails, so draw
      py.runPython('import atlas.plot as _ap\n_ap._take()');
      if (loaded.has('matplotlib')) py.runPython('import atlas._mpl as _m\n_m.take()');
    } catch (e) {
      error = cleanTraceback(e.message);
      if (loaded.has('matplotlib')) await py.runPythonAsync('import matplotlib.pyplot as _p; _p.close("all")').catch(() => {});
    } finally { ns.destroy(); }
    check(`${where}: the code-runner snippet runs`, !error, error);
    check(`${where}: the code-runner snippet prints nothing on stderr`, error || !errText.trim(), errText.trim().split('\n').slice(0, 3).join(' | '));
  }
  for (const { where, item } of jobs) {
    const ref = await runWith(item.answer, item);
    const bad = ref.ok ? ref.tests.filter((t) => !t.ok) : [];
    check(`${where}: the reference solution passes every test`, ref.ok && !bad.length, ref.ok ? bad.map((t) => `${t.name}${t.error ? ` (${t.error})` : ''}`).join('; ') : ref.error);
    const st = await runWith(item.starter || 'pass', item);
    check(`${where}: the starter code does not already pass`, !st.ok || st.tests.some((t) => !t.ok));
  }
}

console.log(`${jobs.length} coding exercises and ${snippets.length} code-runner snippets run in Python`);
console.log(`${pass} passed, ${fail} failed`);
if (fail) process.exit(1);
