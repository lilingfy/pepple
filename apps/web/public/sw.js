// Service worker for offline fallback only.
// Do not cache Next.js chunks or API responses: stale chunks can keep old
// client code alive after a deploy and make page transitions fail.
const CACHE_NAME = 'pebble-v2';
const OFFLINE_URLS = ['/', '/panic'];

function shouldBypassCache(request) {
  const url = new URL(request.url);

  return (
    request.method !== 'GET' ||
    url.pathname.startsWith('/_next/') ||
    url.pathname.startsWith('/api/') ||
    url.pathname === '/sw.js'
  );
}

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(OFFLINE_URLS))
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => Promise.all(
        cacheNames
          .filter((cacheName) => cacheName !== CACHE_NAME)
          .map((cacheName) => caches.delete(cacheName))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  if (shouldBypassCache(event.request)) {
    return;
  }

  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => caches.match('/panic'))
    );
    return;
  }

  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});
