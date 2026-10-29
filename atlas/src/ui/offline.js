// Installing the Atlas and keeping it offline. The service worker (sw.js) keeps
// every file it fetches in one cache; "Save for offline" fills that cache with
// the whole file list (offline-files.json) so nothing has to be visited first.

const CACHE = 'atlas-files';
const base = () => new URL('.', location.href.split('#')[0]).href;

export const supported = () => 'caches' in window && 'serviceWorker' in navigator;

/** 'installed' (opened from the home screen), 'prompt' (the browser offers an Install button), 'ios' or 'manual'. */
export function installState() {
  if (matchMedia('(display-mode: standalone)').matches || navigator.standalone) return 'installed';
  if (window.atlasInstall) return 'prompt';
  if (/iP(hone|ad|od)/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)) return 'ios';
  return 'manual';
}

/** Show the browser's own install dialog (Android, desktop Chrome and Edge). */
export async function promptInstall() {
  const e = window.atlasInstall;
  if (!e) return false;
  e.prompt();
  const { outcome } = await e.userChoice;
  window.atlasInstall = null;
  return outcome === 'accepted';
}

async function fileList() {
  const r = await fetch(base() + 'offline-files.json', { cache: 'no-store' });
  if (!r.ok) throw new Error('the offline file list could not be loaded');
  return r.json();
}

/** How much of each group is already kept: { app: {have, total, bytes}, python: {…} }. */
export async function status() {
  if (!supported()) return null;
  const list = await fileList();
  const cache = await caches.open(CACHE);
  const kept = new Set((await cache.keys()).map((r) => r.url));
  const count = (g) => ({ have: g.files.filter((f) => kept.has(base() + f)).length, total: g.files.length, bytes: g.bytes });
  return { app: count(list.app), python: count(list.python) };
}

/**
 * Download every file not yet kept. onProgress(done, total) after each file;
 * a few files at a time, so a phone stays responsive. Returns the number fetched.
 */
export async function save({ python = false, onProgress = () => {} } = {}) {
  const list = await fileList();
  const cache = await caches.open(CACHE);
  const kept = new Set((await cache.keys()).map((r) => r.url));
  const want = [...list.app.files, ...(python ? list.python.files : [])].map((f) => base() + f).filter((u) => !kept.has(u));
  // the page itself is kept under index.html (the service worker answers every page load from it)
  let done = 0, failed = 0, i = 0;
  const total = want.length;
  async function worker() {
    while (i < want.length) {
      const url = want[i++];
      try {
        const r = await fetch(url, { cache: 'no-cache' });
        if (r.ok) await cache.put(url, r); else failed++;
      } catch { failed++; }
      onProgress(++done, total);
    }
  }
  await Promise.all(Array.from({ length: 6 }, worker));
  if (navigator.storage?.persist) navigator.storage.persist().catch(() => {});
  if (failed) throw new Error(`${failed} of ${total} files could not be downloaded — check the connection and try again (the rest are kept)`);
  return total;
}

/** Forget the offline copy (the app still works online, and keeps what it fetches again). */
export async function remove() {
  if (supported()) await caches.delete(CACHE);
}

export const mb = (bytes) => `${Math.round(bytes / 1e6)} MB`;
