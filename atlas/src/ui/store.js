// Persistence: the append-only event log and a small key/value store, in
// IndexedDB under the "physics-atlas" name. Every project in this repository
// shares one origin, so names are namespaced, and a learner's progress can be
// exported to a JSON file and imported back (merged by event id) — Safari can
// evict script-written data after seven days without a visit.

const DB_NAME = 'physics-atlas';
const DB_VERSION = 1;
export const SCHEMA = 1;          // version of the exported JSON format

let dbp = null;
let memory = null;               // fallback when IndexedDB is unavailable (private windows, tests)

function open() {
  if (dbp) return dbp;
  dbp = new Promise((resolve) => {
    let req;
    try { req = indexedDB.open(DB_NAME, DB_VERSION); } catch { resolve(null); return; }
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains('events')) db.createObjectStore('events', { keyPath: 'id' });
      if (!db.objectStoreNames.contains('kv')) db.createObjectStore('kv');
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => resolve(null);
    req.onblocked = () => resolve(null);
  });
  return dbp;
}

const reqP = (req) => new Promise((res, rej) => { req.onsuccess = () => res(req.result); req.onerror = () => rej(req.error); });

async function db() {
  const d = await open();
  if (!d && !memory) memory = { events: [], kv: {} };
  return d;
}

export async function loadEvents() {
  const d = await db();
  if (!d) return memory.events.slice();
  return reqP(d.transaction('events').objectStore('events').getAll());
}

export async function addEvents(evs) {
  const d = await db();
  if (!d) { memory.events.push(...evs); return; }
  const tx = d.transaction('events', 'readwrite');
  const os = tx.objectStore('events');
  for (const e of evs) os.put(e);
  await new Promise((res, rej) => { tx.oncomplete = res; tx.onerror = () => rej(tx.error); });
}

export async function getKV(key, fallback = null) {
  const d = await db();
  if (!d) return key in memory.kv ? memory.kv[key] : fallback;
  const v = await reqP(d.transaction('kv').objectStore('kv').get(key));
  return v === undefined ? fallback : v;
}

export async function setKV(key, value) {
  const d = await db();
  if (!d) { memory.kv[key] = value; return; }
  const tx = d.transaction('kv', 'readwrite');
  tx.objectStore('kv').put(value, key);
  await new Promise((res, rej) => { tx.oncomplete = res; tx.onerror = () => rej(tx.error); });
}

export async function wipe() {
  const d = await db();
  if (!d) { memory = { events: [], kv: {} }; return; }
  const tx = d.transaction(['events', 'kv'], 'readwrite');
  tx.objectStore('events').clear();
  tx.objectStore('kv').clear();
  await new Promise((res, rej) => { tx.oncomplete = res; tx.onerror = () => rej(tx.error); });
}

/** Ask the browser not to evict our data (best effort). */
export async function persist() {
  try { return await navigator.storage?.persist?.(); } catch { return false; }
}
export async function persisted() {
  try { return await navigator.storage?.persisted?.(); } catch { return false; }
}

export const newId = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;

/** The export file: every event plus profile and settings. */
export async function exportJSON() {
  const [events, profile, settings, seen] = await Promise.all([loadEvents(), getKV('profile'), getKV('settings'), getKV('achievementsSeen')]);
  return { app: 'physics-atlas', schema: SCHEMA, exported: new Date().toISOString(), profile, settings, achievementsSeen: seen, events };
}

/** Merge an export into the current store; returns how many events were new. */
export async function importJSON(data) {
  if (!data || data.app !== 'physics-atlas') throw new Error('This file is not a Physics Atlas export.');
  const migrated = migrate(data);
  const have = new Set((await loadEvents()).map((e) => e.id));
  const fresh = migrated.events.filter((e) => e && e.id && !have.has(e.id));
  await addEvents(fresh);
  if (migrated.profile && !(await getKV('profile'))) await setKV('profile', migrated.profile);
  if (migrated.settings) await setKV('settings', { ...(await getKV('settings', {})), ...migrated.settings });
  return fresh.length;
}

/** Pure migrations from older export schemas (none yet beyond version 1). */
export function migrate(data) {
  let d = { ...data };
  if (!d.schema) d = { ...d, schema: 1 };
  return d;
}
