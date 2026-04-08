// Service worker for the Glean PWA.
//
// Strategy:
//   - HTML documents:  network-first → cache fallback  (always pick up new builds)
//   - Hashed assets:   cache-first                     (content-hashed, immutable)
//   - Content JSON:    stale-while-revalidate          (fast + auto-updates)
//   - Everything else: network → cache fallback
//
// VERSION is bumped on each meaningful change; on activate, old caches are
// purged. Network-first HTML means a fresh document is always fetched when
// online, so hashed asset references never get stale.

const VERSION = 'study-v4';

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(VERSION).then((cache) =>
      cache.addAll(['./', './index.html']).catch(() => {})
    )
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k)))
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  // Only handle http/https — skip chrome-extension:// and other schemes
  if (url.protocol !== 'http:' && url.protocol !== 'https:') return;
  if (url.origin !== self.location.origin) return;

  const isDocument =
    request.destination === 'document' ||
    request.mode === 'navigate' ||
    url.pathname.endsWith('/') ||
    url.pathname.endsWith('.html');

  const isHashedAsset = url.pathname.includes('/assets/');

  const isContentJson =
    url.pathname.includes('/content/') && url.pathname.endsWith('.json');

  // 1. HTML: network-first, cache fallback for offline
  if (isDocument) {
    event.respondWith(
      fetch(request)
        .then((res) => {
          if (res.ok) {
            const copy = res.clone();
            caches.open(VERSION).then((c) => c.put(request, copy));
          }
          return res;
        })
        .catch(() =>
          caches.match(request).then((cached) => cached || caches.match('./index.html'))
        )
    );
    return;
  }

  // 2. Hashed assets: cache-first (immutable)
  if (isHashedAsset) {
    event.respondWith(
      caches.match(request).then(
        (cached) =>
          cached ||
          fetch(request).then((res) => {
            if (res.ok) {
              const copy = res.clone();
              caches.open(VERSION).then((c) => c.put(request, copy));
            }
            return res;
          })
      )
    );
    return;
  }

  // 3. Content JSON: stale-while-revalidate
  if (isContentJson) {
    event.respondWith(
      caches.open(VERSION).then(async (cache) => {
        const cached = await cache.match(request);
        const networkPromise = fetch(request)
          .then((res) => {
            if (res.ok) cache.put(request, res.clone());
            return res;
          })
          .catch(() => cached || new Response('', { status: 504 }));
        return cached || networkPromise;
      })
    );
    return;
  }

  // 4. Default: network → cache fallback
  event.respondWith(
    fetch(request).catch(() =>
      caches.match(request).then((cached) => cached ?? new Response('', { status: 504 }))
    )
  );
});
