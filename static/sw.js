/* thevoidis service worker — offline re-reads for a static library.
   Strategies:
   - HTML navigations: network-first, cached copy as fallback (then /)
   - static assets (css/js/fonts/images/vtt/json): stale-while-revalidate
   - heavy media (mp3/webm/pdf): network only, never cached here
*/
const CACHE = 'thevoidis-v1';
const STATIC_RE = /\.(?:css|js|mjs|png|jpe?g|gif|webp|svg|ico|woff2?|ttf|vtt|json|xml|txt|webmanifest)$/i;

self.addEventListener('install', () => self.skipWaiting());

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  const accept = req.headers.get('accept') || '';
  const isNav = req.mode === 'navigate' || accept.includes('text/html');

  if (isNav) {
    event.respondWith((async () => {
      try {
        const res = await fetch(req);
        if (res && res.ok) {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(req, copy));
        }
        return res;
      } catch (err) {
        const hit = await caches.match(req, { ignoreSearch: true });
        return hit || (await caches.match('/'));
      }
    })());
    return;
  }

  if (STATIC_RE.test(url.pathname)) {
    event.respondWith((async () => {
      const hit = await caches.match(req);
      const net = fetch(req).then((res) => {
        if (res && res.ok) {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(req, copy));
        }
        return res;
      }).catch(() => undefined);
      return hit || (await net) || Response.error();
    })());
  }
  /* everything else (mp3/webm/pdf) is left to the browser's own handling */
});
