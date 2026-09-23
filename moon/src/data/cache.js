/* =============================================================================
   CACHE — keep what NASA already sent you
   -----------------------------------------------------------------------------
   Elevation patches and imagery tiles go into IndexedDB, so revisiting a place
   costs nothing and an offline session still has whatever you have seen before.
   Size is capped and enforced by evicting the least recently used entries.

   Everything degrades: if IndexedDB is unavailable (private browsing, a locked
   down browser), the cache silently becomes a no-op and the game just re-fetches.
   ========================================================================== */

const DB_NAME = 'selene-cache';
const STORE = 'blobs';
const META = 'meta';

export class Cache {
  constructor(maxBytes) {
    this.maxBytes = maxBytes;
    this.db = null;
    this.bytes = 0;
    this.entries = 0;
    this.ready = this.open().catch(() => { this.db = null; });
  }

  async open() {
    if (typeof indexedDB === 'undefined') return;
    this.db = await new Promise((resolve, reject) => {
      const req = indexedDB.open(DB_NAME, 1);
      req.onupgradeneeded = () => {
        const db = req.result;
        if (!db.objectStoreNames.contains(STORE)) {
          const s = db.createObjectStore(STORE, { keyPath: 'key' });
          s.createIndex('used', 'used');
        }
        if (!db.objectStoreNames.contains(META)) db.createObjectStore(META);
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
    await this.measure();
  }

  tx(mode) {
    return this.db.transaction(STORE, mode).objectStore(STORE);
  }

  async measure() {
    if (!this.db) return;
    await new Promise((resolve) => {
      let bytes = 0, n = 0;
      const req = this.tx('readonly').openCursor();
      req.onsuccess = () => {
        const c = req.result;
        if (!c) { this.bytes = bytes; this.entries = n; resolve(); return; }
        bytes += c.value.size || 0; n++;
        c.continue();
      };
      req.onerror = () => resolve();
    });
  }

  async get(key) {
    await this.ready;
    if (!this.db) return null;
    return new Promise((resolve) => {
      const req = this.tx('readonly').get(key);
      req.onsuccess = () => {
        const v = req.result;
        if (!v) return resolve(null);
        /* Touch the entry so eviction sees it as recently used. Fire and
           forget: a failed touch only costs us a cache entry later. */
        try {
          const s = this.tx('readwrite');
          s.put({ ...v, used: Date.now() });
        } catch { /* ignore */ }
        resolve(v.data);
      };
      req.onerror = () => resolve(null);
    });
  }

  put(key, data) {
    if (!this.db) return;
    const size = data.byteLength || 0;
    try {
      this.tx('readwrite').put({ key, data, size, used: Date.now() });
      this.bytes += size;
      this.entries++;
      if (this.bytes > this.maxBytes) this.evict();
    } catch { /* quota or a closed database: not worth interrupting anything */ }
  }

  /** Drop the least recently used entries until comfortably under the cap. */
  async evict() {
    if (!this.db || this._evicting) return;
    this._evicting = true;
    const target = this.maxBytes * 0.8;
    await new Promise((resolve) => {
      const store = this.db.transaction(STORE, 'readwrite').objectStore(STORE);
      const req = store.index('used').openCursor();
      req.onsuccess = () => {
        const c = req.result;
        if (!c || this.bytes <= target) return resolve();
        this.bytes -= c.value.size || 0;
        this.entries--;
        c.delete();
        c.continue();
      };
      req.onerror = () => resolve();
    });
    this._evicting = false;
  }

  async clear() {
    await this.ready;
    if (!this.db) return;
    await new Promise((resolve) => {
      const req = this.tx('readwrite').clear();
      req.onsuccess = req.onerror = () => resolve();
    });
    this.bytes = 0; this.entries = 0;
  }

  setLimit(bytes) {
    this.maxBytes = bytes;
    if (this.bytes > bytes) this.evict();
  }

  status() {
    if (!this.db) return 'unavailable';
    return `${(this.bytes / 1e6).toFixed(0)} MB of ${(this.maxBytes / 1e6).toFixed(0)} MB, ${this.entries} items`;
  }
}
