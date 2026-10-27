// The page-side handle on the Python worker: start it lazily, run code,
// stream output, stop runaway code by terminating and respawning the worker.

let worker = null;
let ready = null;
let info = null;
let nextId = 1;
const pending = new Map();
const listeners = new Set();

export const onStatus = (fn) => { listeners.add(fn); return () => listeners.delete(fn); };
const status = (s) => listeners.forEach((fn) => fn(s));

export function start() {
  if (ready) return ready;
  status({ state: 'loading', text: 'Loading Python (about 13 MB the first time; cached afterwards)…' });
  worker = new Worker(new URL('./py-worker.js', import.meta.url), { type: 'module' });
  ready = new Promise((resolve, reject) => {
    worker.onmessage = (e) => {
      const m = e.data;
      if (m.type === 'ready') { info = m; status({ state: 'ready', text: `Python ${m.python} · Pyodide ${m.version}` }); resolve(m); return; }
      if (m.type === 'fatal') { status({ state: 'error', text: m.error }); reject(new Error(m.error)); return; }
      const p = pending.get(m.id);
      if (!p) return;
      if (m.type === 'stdout' || m.type === 'stderr' || m.type === 'status') p.onOutput?.(m);
      if (m.type === 'done') { pending.delete(m.id); p.resolve(m); }
    };
    worker.onerror = (e) => { status({ state: 'error', text: e.message || 'The Python worker failed to start.' }); reject(e); };
  });
  worker.postMessage({ type: 'init' });
  return ready;
}

/** Run code; resolves with { ok, result, error, figures, checks, ms }. */
export async function run(code, { onOutput, check, timeoutMs = 20000 } = {}) {
  await start();
  const id = nextId++;
  return new Promise((resolve) => {
    const timer = setTimeout(() => { stop(); resolve({ ok: false, error: `Stopped after ${timeoutMs / 1000} s — is there an infinite loop?`, figures: [] }); }, timeoutMs);
    pending.set(id, { onOutput, resolve: (m) => { clearTimeout(timer); resolve(m); } });
    worker.postMessage({ type: 'run', id, code, check });
  });
}

/** Terminate a runaway program; the next run starts a fresh interpreter. */
export function stop() {
  if (worker) worker.terminate();
  worker = null; ready = null;
  for (const [, p] of pending) p.resolve({ ok: false, error: 'Stopped.', figures: [] });
  pending.clear();
  status({ state: 'stopped', text: 'Stopped. Python will restart on the next run.' });
}

export const pythonInfo = () => info;
