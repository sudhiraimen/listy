// Listy service worker: offline app shell + cached cover images.
const SHELL_CACHE = 'shelf-shell-v11';
const COVER_CACHE = 'shelf-covers-v1';
const MAX_COVERS = 400;
const SHELL = ['./', './index.html', './manifest.webmanifest',
  './icons/icon-192.png', './icons/icon-512.png', './icons/apple-touch-icon.png', './icons/favicon.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(SHELL_CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(k => k !== SHELL_CACHE && k !== COVER_CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

async function trimCovers() {
  const c = await caches.open(COVER_CACHE);
  const keys = await c.keys();
  for (let i = 0; i < keys.length - MAX_COVERS; i++) await c.delete(keys[i]);
}

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  // The app page: try the network first so updates show up right away; use the saved copy
  // when offline or if the network takes longer than 3 seconds.
  if (req.mode === 'navigate' && url.origin === self.location.origin) {
    e.respondWith(caches.open(SHELL_CACHE).then(async c => {
      const saved = c.match('./index.html');
      const net = fetch(req).then(r => { if (r.ok) c.put('./index.html', r.clone()); return r; });
      net.catch(() => {}); // offline: handled below, don't report it as an error
      const slow = new Promise(res => setTimeout(res, 3000)).then(() => saved);
      try { return (await Promise.race([net, slow])) || await net; }
      catch { return (await saved) || Response.error(); }
    }));
    return;
  }

  // Other app files (icons, manifest): serve from cache right away, refresh in the background.
  if (url.origin === self.location.origin) {
    e.respondWith(caches.open(SHELL_CACHE).then(async c => {
      const hit = await c.match(req, { ignoreSearch: true });
      const net = fetch(req).then(r => { if (r.ok) c.put(req, r.clone()); return r; }).catch(() => hit || Response.error());
      return hit || net;
    }));
    return;
  }

  // Cover images and the title font: cache first so the app still looks right offline.
  if (req.destination === 'image' || req.destination === 'font' || url.hostname === 'fonts.googleapis.com') {
    e.respondWith(caches.open(COVER_CACHE).then(async c => {
      const hit = await c.match(req);
      if (hit) return hit;
      try {
        const r = await fetch(req);
        if (r.ok || r.type === 'opaque') { c.put(req, r.clone()); trimCovers(); }
        return r;
      } catch { return Response.error(); }
    }));
  }
  // Search API calls go straight to the network.
});
