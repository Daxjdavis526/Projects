// The Physics Atlas's service worker: it makes the Atlas an app that opens with
// no network. Network first, so a new version is picked up whenever you are
// online; every file it fetches is also kept, and the kept copy answers when
// the network fails or takes longer than a few seconds. Settings → "Save for
// offline" fills the same cache with every file at once (offline-files.json).
// Only GET requests inside the Atlas's own folder are touched.

const CACHE = 'atlas-files';
const WAIT_MS = 4000;                  // past this, a kept copy beats a slow network
const SHELL = ['index.html', 'css/atlas.css', 'src/ui/app.js', 'manifest.webmanifest', 'icons/icon-192.png',
  'vendor/katex-0.19.0/katex.min.css', 'vendor/katex-0.19.0/katex.min.js'];

const scope = () => self.registration.scope;
// a page load, with or without index.html in its address, is one entry: index.html
const keyOf = (req) => (req.mode === 'navigate' ? new URL('index.html', scope()).href : req.url.split('#')[0]);

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE)
    .then((c) => c.addAll(SHELL.map((f) => new URL(f, scope()).href)))
    .catch(() => {})                   // offline at install: the shell is kept on first use instead
    .then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => e.waitUntil(self.clients.claim()));

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET' || req.headers.has('range')) return;
  if (!req.url.startsWith(scope())) return;
  e.respondWith(networkFirst(e));
});

function networkFirst(e) {
  const req = e.request, key = keyOf(req);
  const fresh = fetch(req).then((res) => {
    // keep a copy in the background (the event is still open: its response is not out yet)
    if (res.ok && res.type === 'basic') { const copy = res.clone(); e.waitUntil(caches.open(CACHE).then((c) => c.put(key, copy)).catch(() => {})); }
    return res;
  });
  e.waitUntil(fresh.catch(() => {}));
  const kept = () => caches.open(CACHE).then((c) => c.match(key));
  return new Promise((resolve, reject) => {
    let done = false;
    const finish = (r) => { if (!done) { done = true; resolve(r); } };
    const timer = setTimeout(() => kept().then((r) => { if (r) finish(r); }), WAIT_MS);
    fresh.then((r) => { clearTimeout(timer); finish(r); }, async (err) => {
      clearTimeout(timer);
      if (done) return;
      const r = await kept();
      if (r) finish(r); else { done = true; reject(err); }
    });
  });
}
