// The SymPy worker: Pyodide (CPython 3.14 in WebAssembly) with SymPy and
// mpmath installed from hash-checked wheels shipped inside the app. Runs off
// the UI thread; the client terminates and restarts it to cancel a long job.
import casPy from './cas.py?raw';

declare const self: DedicatedWorkerGlobalScope;

type Py = { runPython: (s: string) => unknown; unpackArchive: (b: ArrayBuffer, f: string) => void; globals: { get: (k: string) => (s: string) => string } };
let py: Py | null = null;
let handle: ((s: string) => string) | null = null;

async function sha256Hex(buf: ArrayBuffer): Promise<string> {
  const d = await crypto.subtle.digest('SHA-256', buf);
  return [...new Uint8Array(d)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

async function boot(base: string) {
  const mod = await import(/* @vite-ignore */ `${base}pyodide.mjs`);
  py = await mod.loadPyodide({ indexURL: base }) as Py;
  const manifest = await (await fetch(`${base}wheels/wheels.json`)).json() as Record<string, { sha256: string }>;
  for (const pkg of ['mpmath', 'sympy']) {
    const file = Object.keys(manifest).find((f) => f.startsWith(pkg + '-'))!;
    const buf = await (await fetch(`${base}wheels/${file}`)).arrayBuffer();
    if ((await sha256Hex(buf)) !== manifest[file].sha256) throw new Error(`${file} failed its integrity check`);
    py.unpackArchive(buf, 'wheel');
  }
  py.runPython(casPy);
  handle = py.globals.get('handle');
}

self.onmessage = async (e: MessageEvent) => {
  const m = e.data as { type: 'init'; base: string } | { type: 'call'; id: number; request: string };
  if (m.type === 'init') {
    try { await boot(m.base); self.postMessage({ type: 'ready' }); } catch (err) { self.postMessage({ type: 'fatal', error: String((err as Error)?.message ?? err) }); }
    return;
  }
  if (!handle) { self.postMessage({ type: 'result', id: m.id, json: JSON.stringify({ ok: false, error: 'The algebra engine is not ready yet' }) }); return; }
  try { self.postMessage({ type: 'result', id: m.id, json: handle(m.request) }); }
  catch (err) { self.postMessage({ type: 'result', id: m.id, json: JSON.stringify({ ok: false, error: String((err as Error)?.message ?? err) }) }); }
};
