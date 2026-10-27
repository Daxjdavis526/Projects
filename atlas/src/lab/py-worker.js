// A module worker running real CPython (Pyodide 314.0.7, Python 3.14) for the
// code lab and coding exercises. It loads on first use (about 13 MB, then
// cached), installs SymPy and mpmath from hash-pinned wheels on demand, and
// streams stdout/stderr back. Runaway code is stopped by terminating the
// worker from the page — no SharedArrayBuffer needed.

import { loadPyodide } from '../../vendor/pyodide-314.0.7/pyodide.mjs';

const BASE = new URL('../../vendor/pyodide-314.0.7/', import.meta.url).href;
let py = null;
let currentId = null;
const installed = new Set();

const PLOT_MODULE = `
"""atlas.plot — a small pyplot-like plotting bridge drawn by the Atlas.

Matplotlib itself needs compiled packages the Atlas does not bundle yet, so
this module mirrors its most common calls: plot, scatter, xlabel, ylabel,
title, legend, grid, axhline, axvline, xlim, ylim, figure and show.
"""
import json as _json, math as _math

_figs = []
_cur = None

def _fig():
    global _cur
    if _cur is None:
        _cur = {"series": [], "title": "", "xlabel": "", "ylabel": "", "legend": False, "grid": True, "hlines": [], "vlines": [], "xlim": None, "ylim": None}
    return _cur

def _floats(seq):
    out = []
    for v in seq:
        try:
            f = float(v)
            out.append(f if _math.isfinite(f) else None)
        except (TypeError, ValueError):
            out.append(None)
    return out

def figure(title=None):
    show()
    if title:
        _fig()["title"] = str(title)

def plot(x, y=None, label=None, style="-", color=None):
    if y is None:
        y = list(x); x = list(range(len(y)))
    _fig()["series"].append({"kind": "line", "x": _floats(x), "y": _floats(y), "label": label, "dash": "--" in style or ":" in style, "color": color})

def scatter(x, y, label=None, color=None):
    _fig()["series"].append({"kind": "scatter", "x": _floats(x), "y": _floats(y), "label": label, "color": color})

def xlabel(s): _fig()["xlabel"] = str(s)
def ylabel(s): _fig()["ylabel"] = str(s)
def title(s): _fig()["title"] = str(s)
def legend(): _fig()["legend"] = True
def grid(on=True): _fig()["grid"] = bool(on)
def axhline(y=0.0): _fig()["hlines"].append(float(y))
def axvline(x=0.0): _fig()["vlines"].append(float(x))
def xlim(a, b): _fig()["xlim"] = [float(a), float(b)]
def ylim(a, b): _fig()["ylim"] = [float(a), float(b)]

def show():
    global _cur
    if _cur is not None and _cur["series"]:
        _figs.append(_cur)
    _cur = None

def _take():
    show()
    out = _json.dumps(_figs)
    _figs.clear()
    return out
`;

async function boot() {
  py = await loadPyodide({ indexURL: BASE });
  py.FS.mkdirTree('/home/pyodide/atlas');
  py.FS.writeFile('/home/pyodide/atlas/__init__.py', '"""Helpers provided by The Physics Atlas."""\n');
  py.FS.writeFile('/home/pyodide/atlas/plot.py', PLOT_MODULE);
  await py.runPythonAsync('import sys\nif "/home/pyodide" not in sys.path: sys.path.insert(0, "/home/pyodide")');
  py.setStdout({ batched: (s) => postMessage({ type: 'stdout', id: currentId, text: s + '\n' }) });
  py.setStderr({ batched: (s) => postMessage({ type: 'stderr', id: currentId, text: s + '\n' }) });
  postMessage({ type: 'ready', version: py.version, python: py.runPython('import sys; sys.version.split()[0]') });
}

async function sha256Hex(buf) {
  const d = await crypto.subtle.digest('SHA-256', buf);
  return [...new Uint8Array(d)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

async function ensurePackages(code) {
  const want = [];
  if (/\b(import|from)\s+sympy\b/.test(code)) want.push('mpmath', 'sympy');
  else if (/\b(import|from)\s+mpmath\b/.test(code)) want.push('mpmath');
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
    const t0 = performance.now();
    try {
      await ensurePackages(m.code);
      if (m.globals) for (const [k, v] of Object.entries(m.globals)) py.globals.set(k, v);
      const result = await py.runPythonAsync(m.code);
      let shown = undefined;
      if (result !== undefined && result !== null) {
        try { shown = String(result); } finally { result?.destroy?.(); }
      }
      const figs = JSON.parse(py.runPython('import atlas.plot as _ap\n_ap._take()'));
      let checks = null;
      if (m.check) checks = JSON.parse(await py.runPythonAsync(m.check));
      postMessage({ type: 'done', id: m.id, ok: true, result: shown, figures: figs, checks, ms: performance.now() - t0 });
    } catch (err) {
      let figs = [];
      try { figs = JSON.parse(py.runPython('import atlas.plot as _ap\n_ap._take()')); } catch { /* ignore */ }
      postMessage({ type: 'done', id: m.id, ok: false, error: String(err?.message || err), figures: figs, ms: performance.now() - t0 });
    }
  }
};
