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

const BASE = new URL('../../vendor/pyodide-314.0.7/', import.meta.url).href;
let py = null;
let currentId = null;
let captured = '';            // what the current program has printed
const installed = new Set();

const PLOT_MODULE = `
"""atlas.plot — a small pyplot-like plotting bridge drawn by the Atlas itself
(themed, crisp, quick to load). For anything more, import matplotlib.pyplot.

It mirrors pyplot's most common calls: plot, scatter, xlabel, ylabel, title,
legend, grid, axhline, axvline, xlim, ylim, figure and show.
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

// Matplotlib, themed to match the Atlas, and the hand-off of its open figures.
const MPL_MODULE = `
import io as _io, base64 as _b64, json as _json, sys as _sys

_DARK = {"figure.facecolor": "#0e1526", "axes.facecolor": "#0e1526", "savefig.facecolor": "#0e1526",
         "axes.edgecolor": "#4b5873", "axes.labelcolor": "#aab6ca", "text.color": "#e7edf7",
         "xtick.color": "#aab6ca", "ytick.color": "#aab6ca", "grid.color": "#25304a", "legend.facecolor": "#121b30",
         "legend.edgecolor": "#25304a"}
_LIGHT = {"figure.facecolor": "#ffffff", "axes.facecolor": "#ffffff", "savefig.facecolor": "#ffffff",
          "axes.edgecolor": "#97a3b8", "axes.labelcolor": "#3d4a63", "text.color": "#0d1628",
          "xtick.color": "#3d4a63", "ytick.color": "#3d4a63", "grid.color": "#e3e8f1"}

def style(dark):
    import matplotlib
    from cycler import cycler
    matplotlib.rcParams.update(_DARK if dark else _LIGHT)
    matplotlib.rcParams.update({"axes.prop_cycle": cycler(color=["#5c9dff", "#f3b74f", "#38d39f", "#b38cff", "#ff6b7d", "#33c4b4", "#f2c14e"]),
                                "figure.figsize": (7.0, 4.2), "figure.dpi": 100, "axes.grid": True, "grid.linewidth": 0.6,
                                "font.size": 10.5, "axes.spines.top": False, "axes.spines.right": False})

def take():
    if "matplotlib.pyplot" not in _sys.modules:
        return "[]"
    plt = _sys.modules["matplotlib.pyplot"]
    out = []
    for n in plt.get_fignums():
        buf = _io.BytesIO()
        plt.figure(n).savefig(buf, format="png", dpi=110, bbox_inches="tight")
        out.append("data:image/png;base64," + _b64.b64encode(buf.getvalue()).decode())
    plt.close("all")
    return _json.dumps(out)
`;

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
    'warnings.filterwarnings("ignore", message=".*non-interactive.*")'].join('\n'));
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
