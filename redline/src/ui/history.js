/* Test history: every recorded run, traces and all, kept in the browser's
   IndexedDB so a campaign can span sessions and last week's runs can be
   overlaid on today's. Two object stores: a light `index` (the summary the
   notebook and the campaign table need) and `data` (the arrays, loaded only
   when a run is opened). Every call is guarded: without IndexedDB — a
   private window, a blocked origin — history is simply empty and the
   session's own runs still work. */

import { RunData } from '../instruments/store.js';

const DB = 'redline-history';
const KEEP = 80;                // runs; oldest are dropped beyond this

let dbp = null;
function db() {
  if (dbp) return dbp;
  dbp = new Promise((res, rej) => {
    try {
      const r = indexedDB.open(DB, 1);
      r.onupgradeneeded = () => {
        const d = r.result;
        if (!d.objectStoreNames.contains('index')) d.createObjectStore('index', { keyPath: 'id' });
        if (!d.objectStoreNames.contains('data')) d.createObjectStore('data', { keyPath: 'id' });
      };
      r.onsuccess = () => res(r.result);
      r.onerror = () => rej(r.error);
    } catch (e) { rej(e); }
  });
  return dbp;
}

const req = r => new Promise((res, rej) => { r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error); });

/* The light record kept for every run. */
export function summarize(run, extra = {}) {
  return {
    id: run.id, stand: run.meta.config.stand, date: extra.date || new Date().toISOString(),
    clock: run.clock, level: extra.level || null, mode: run.meta.mode, objective: run.meta.objective,
    meta: run.meta, plan: run.plan, tFire: run.tFire, firings: run.firings, start: run.start, stop: run.stop,
    reason: run.reason, aborted: run.aborted, abort: run.abort, alarms: run.alarms, events: run.events,
    metrics: run.metrics, rate: run.data.rate, n: run.data.n, hist: true,
  };
}

export const history = {
  available: typeof indexedDB !== 'undefined',
  cache: new Map(),             // id -> full run (with data)
  index: [],                    // light records, newest first

  async refresh() {
    try {
      const d = await db();
      const all = await req(d.transaction('index').objectStore('index').getAll());
      this.index = all.sort((a, b) => (a.date < b.date ? 1 : -1));
    } catch { this.index = []; }
    return this.index;
  },

  async save(run, extra) {
    try {
      const d = await db();
      const rec = summarize(run, extra);
      const tx = d.transaction(['index', 'data'], 'readwrite');
      tx.objectStore('index').put(rec);
      tx.objectStore('data').put({ id: run.id, ids: run.data.ids, rate: run.data.rate, T: run.data.T, V: run.data.V });
      await new Promise((res, rej) => { tx.oncomplete = res; tx.onerror = () => rej(tx.error); });
      this.cache.set(run.id, run);
      await this.refresh();
      if (this.index.length > KEEP) for (const old of this.index.slice(KEEP)) await this.remove(old.id);
    } catch { /* history is a convenience; never break a session over it */ }
  },

  async load(id) {
    if (this.cache.has(id)) return this.cache.get(id);
    try {
      const d = await db();
      const tx = d.transaction(['index', 'data']);
      const [rec, dat] = await Promise.all([req(tx.objectStore('index').get(id)), req(tx.objectStore('data').get(id))]);
      if (!rec || !dat) return null;
      const run = { ...rec, data: RunData.fromArrays(dat.ids, dat.rate, dat.T, dat.V), notes: [] };
      this.cache.set(id, run);
      return run;
    } catch { return null; }
  },

  async remove(id) {
    try {
      const d = await db();
      const tx = d.transaction(['index', 'data'], 'readwrite');
      tx.objectStore('index').delete(id); tx.objectStore('data').delete(id);
      await new Promise(res => { tx.oncomplete = res; tx.onerror = res; });
      this.cache.delete(id);
      this.index = this.index.filter(r => r.id !== id);
    } catch { /* ignore */ }
  },

  async clear() {
    try {
      const d = await db();
      const tx = d.transaction(['index', 'data'], 'readwrite');
      tx.objectStore('index').clear(); tx.objectStore('data').clear();
      await new Promise(res => { tx.oncomplete = res; tx.onerror = res; });
    } catch { /* ignore */ }
    this.cache.clear(); this.index = [];
  },
};

/* CSV of every channel of a run, time relative to T-0. */
export function runCSV(run) {
  const d = run.data, ref = run.tFire ?? run.start;
  const head = ['t_rel_s', ...d.ids].join(',');
  const lines = [`# ${run.id} · ${run.meta?.objective || ''} · ${d.rate} Hz · SI units (Pa gauge for pressures, N, K, kg/s, A) · fictional hardware`, head];
  const V = d.V;
  for (let k = 0; k < d.T.length; k++) {
    let row = (d.T[k] - ref).toFixed(5);
    for (let c = 0; c < V.length; c++) { const v = V[c][k]; row += ',' + (Number.isNaN(v) ? '' : +v.toPrecision(7)); }
    lines.push(row);
  }
  return lines.join('\n');
}

export function download(name, text, type = 'text/csv') {
  const url = URL.createObjectURL(new Blob([text], { type }));
  const a = document.createElement('a');
  a.href = url; a.download = name;
  document.body.append(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}
