const CACHE_NAME = 'vieteuro-v2';

// Only pre-cache local app shell files to avoid install failures from CDN URLs
const APP_SHELL = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon-192.svg',
  '/icon-512.svg',
];

self.addEventListener('install', (event) => {
  // Skip waiting so the new SW activates immediately
  self.skipWaiting();

  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // Use allSettled so a single failing URL doesn't abort the whole install
      return Promise.allSettled(
        APP_SHELL.map((url) => cache.add(url).catch((err) => console.warn('SW: failed to pre-cache', url, err)))
      );
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((names) =>
        Promise.all(names.filter((n) => n !== CACHE_NAME).map((n) => caches.delete(n)))
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  // Only handle GET requests
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.match(event.request).then((cached) => {
        // Fetch from network and update cache in the background
        const networkFetch = fetch(event.request)
          .then((response) => {
            if (response.ok || response.type === 'opaque') {
              cache.put(event.request, response.clone());
            }
            return response;
          })
          .catch(() => {
            // Network failed — fall back to cache or serve index.html for navigation
            if (cached) return cached;
            if (event.request.mode === 'navigate') {
              return cache.match('/index.html');
            }
          });

        // Stale-while-revalidate: return cached immediately if available,
        // otherwise wait for network (first visit or uncached resource)
        return cached || networkFetch;
      });
    })
  );
});
