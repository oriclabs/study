/**
 * Service Worker for offline PWA support.
 * Caches app shell + content for offline use.
 */

const CACHE_NAME = 'study-app-v1';
const SHELL_ASSETS = [
  '/pwa/',
  '/pwa/index.html',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(SHELL_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Only handle http/https — skip chrome-extension:// and other schemes
  if (url.protocol !== 'http:' && url.protocol !== 'https:') return;

  // Network-first for HTML pages
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() =>
        caches.match('/pwa/index.html').then(r => r || new Response('Offline', { status: 503 }))
      )
    );
    return;
  }

  // Cache-first for static assets (JS, CSS, fonts)
  if (url.pathname.match(/\.(js|css|woff2?|ttf|png|svg|ico)$/)) {
    event.respondWith(
      caches.match(event.request).then(cached => {
        if (cached) return cached;
        return fetch(event.request).then(response => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
          }
          return response;
        });
      })
    );
    return;
  }

  // Network-first for content JSON (packs might update)
  if (url.pathname.includes('/content/')) {
    event.respondWith(
      fetch(event.request).then(response => {
        if (response.ok) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        }
        return response;
      }).catch(() =>
        caches.match(event.request).then(r => r || new Response('Offline', { status: 503 }))
      )
    );
    return;
  }

  // Default: network with cache fallback
  event.respondWith(
    fetch(event.request).catch(() =>
      caches.match(event.request).then(r => r || new Response('Offline', { status: 503 }))
    )
  );
});
