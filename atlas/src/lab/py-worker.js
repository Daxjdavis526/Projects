// A module worker running real CPython (Pyodide 314.0.7, Python 3.14) for the
// code lab and coding exercises. It loads on first use (about 13 MB, then
// cached) and installs packages when a program imports them: NumPy, SciPy
// and Matplotlib from Pyodide's own builds (vendored beside pyodide-lock.json,
// which pins their SHA-256), SymPy and mpmath from hash-pinned wheels.
// Matplotlib draws with the Agg backend; open figures come back as PNGs.
// stdout/stderr stream back. Runaway code is stopped by terminating the
// worker from the page — no SharedArrayBuffer needed.

import { loadPyodide } from '../../vendor/pyodide-314.0.7/pyodide.mjs';
import { testScript, SCIENTIFIC, imports } from './harness.js';
import { PLOT_MODULE, MPL_MODULE } from './pymodules.js';

const BASE = new URL('../../vendor/pyodide-314.0.7/', import.meta.url).href;
let py = null;
let currentId = null;
let captured = '';            // what the current program has printed
const installed = new Set();

async function boot() {
  py = await loadPyodide({ indexURL: BASE });
  py.FS.mkdirTree('/home/pyodide/atlas');
  py.FS.writeFile('/home/pyodide/atlas/__init__.py', '"""Helpers provided by The Physics Atlas."""\n');
  py.FS.writeFile('/home/pyodide/atlas/plot.py', PLOT_MODULE);
  py.FS.writeFile('/home/pyodide/atlas/_mpl.py', MPL_MODULE);
  // Agg draws to memory (there is no screen in a worker); show() becomes harmless
  await py.runPythonAsync(['import sys, os, warnings',
    'if "/home/pyodide" not in sys.path: sys.path.insert(0, "/home/pyodide")',
    'os.environ["MPLBACKEND"] = "Agg"',
    'warnings.filterwarnings("ignore", message=".*non-interactive.*")',
    // this Matplotlib build warns about its own text layout on every tight_layout(): noise, not the learner's
    'warnings.filterwarnings("ignore", message=".*parameter as float was deprecated.*")'].join('\n'));
  py.setStdout({ batched: (s) => { captured += s + '\n'; postMessage({ type: 'stdout', id: currentId, text: s + '\n' }); } });
  py.setStderr({ batched: (s) => postMessage({ type: 'stderr', id: currentId, text: s + '\n' }) });
  postMessage({ type: 'ready', version: py.version, python: py.runPython('import sys; sys.version.split()[0]') });
}

async function sha256Hex(buf) {
  const d = await crypto.subtle.digest('SHA-256', buf);
  return [...new Uint8Array(d)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

// the compiled scientific stack (SCIENTIFIC) is loaded through Pyodide:
// dependencies and SHA-256 checks come from pyodide-lock.json

async function ensurePackages(code, theme) {
  const sci = SCIENTIFIC.filter((m) => imports(code, m) && !installed.has(m));
  if (sci.length) {
    postMessage({ type: 'status', id: currentId, text: `Loading ${sci.join(', ')} (first time only)…` });
    await py.loadPackage(sci, { messageCallback: () => {}, errorCallback: (e) => postMessage({ type: 'stderr', id: currentId, text: e + '\n' }) });
    sci.forEach((m) => installed.add(m));
  }
  if (imports(code, 'matplotlib') || installed.has('matplotlib')) {
    await py.runPythonAsync(`import atlas._mpl as _m\n_m.style(${theme === 'light' ? 'False' : 'True'})`);
  }
  const want = [];
  if (imports(code, 'sympy')) want.push('mpmath', 'sympy');
  else if (imports(code, 'mpmath')) want.push('mpmath');
  if (!want.length) return;
  const manifest = await (await fetch(BASE + 'wheels/wheels.json')).json();
  for (const pkg of want) {
    if (installed.has(pkg)) continue;
    const file = Object.keys(manifest).find((f) => f.startsWith(pkg + '-'));
    postMessage({ type: 'status', id: currentId, text: `Installing ${pkg}…` });
    const buf = await (await fetch(BASE + 'wheels/' + file)).arrayBuffer();
    const hex = await sha256Hex(buf);
    if (hex !== manifest[file].sha256) throw new Error(`${file} failed its integrity check`);
    py.unpackArchive(buf, 'wheel');
    installed.add(pkg);
  }
}

self.onmessage = async (e) => {
  const m = e.data;
  if (m.type === 'init') {
    try { await boot(); } catch (err) { postMessage({ type: 'fatal', error: String(err?.message || err) }); }
    return;
  }
  if (m.type === 'run') {
    currentId = m.id;
    captured = '';
    const t0 = performance.now();
    // an exercise (m.fresh) runs in its own namespace, so nothing from an
    // earlier attempt can make it pass
    const ns = m.fresh ? py.globals.get('dict')() : null;
    ns?.set('__name__', '__main__');   // a program is run, not imported: its __main__ guard runs, as on a real machine
    const opts = ns ? { globals: ns } : {};
    try {
      await ensurePackages(m.code + '\n' + (m.tests || []).map((t) => t.code).join('\n'), m.theme);
      if (m.globals) for (const [k, v] of Object.entries(m.globals)) (ns || py.globals).set(k, v);
      const result = await py.runPythonAsync(m.code, opts);
      let shown = undefined;
      if (result !== undefined && result !== null) {
        try { shown = String(result); } finally { result?.destroy?.(); }
      }
      let tests = null;
      if (m.tests?.length) {
        (ns || py.globals).set('_stdout', captured);
        tests = JSON.parse(await py.runPythonAsync(testScript(m.tests), opts));
      }
      const figs = JSON.parse(py.runPython('import atlas.plot as _ap\n_ap._take()'));
      const images = JSON.parse(py.runPython('import atlas._mpl as _m\n_m.take()'));
      let checks = null;
      if (m.check) checks = JSON.parse(await py.runPythonAsync(m.check, opts));
      ns?.destroy();
      postMessage({ type: 'done', id: m.id, ok: true, result: shown, figures: figs, images, checks, tests, stdout: captured, ms: performance.now() - t0 });
    } catch (err) {
      let figs = [], images = [];
      try { figs = JSON.parse(py.runPython('import atlas.plot as _ap\n_ap._take()')); } catch { /* ignore */ }
      try { images = JSON.parse(py.runPython('import atlas._mpl as _m\n_m.take()')); } catch { /* ignore */ }
      ns?.destroy();
      postMessage({ type: 'done', id: m.id, ok: false, error: String(err?.message || err), figures: figs, images, stdout: captured, ms: performance.now() - t0 });
    }
  }
};
