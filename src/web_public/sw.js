const CACHE_NAME = 'webui-cache-v1';
const CORE_ASSETS = [
  '/index.html',
  '/style.css',
  '/script.js'
];

// Install event: Cache core assets
self.addEventListener('install', event => {
  console.log('Service Worker: Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Service Worker: Caching core assets');
        return cache.addAll(CORE_ASSETS);
      })
      .then(() => self.skipWaiting()) // Force the waiting service worker to become the active service worker.
      .catch(error => {
        console.error('Service Worker: Caching failed', error);
      })
  );
});

// Activate event: Clean up old caches
self.addEventListener('activate', event => {
  console.log('Service Worker: Activating...');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Service Worker: Deleting old cache', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim()) // Take control of all open clients.
  );
});

// Fetch event: Serve core assets from cache first, then network
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // Only handle requests for core assets and same-origin requests
  if (CORE_ASSETS.includes(url.pathname) && self.origin === url.origin) {
    console.log('Service Worker: Fetching ', event.request.url);
    event.respondWith(
      caches.match(event.request)
        .then(cachedResponse => {
          if (cachedResponse) {
            console.log('Service Worker: Found in cache', event.request.url);
            return cachedResponse;
          }
          console.log('Service Worker: Not in cache, fetching from network', event.request.url);
          return fetch(event.request);
        })
        .catch(error => {
          console.error('Service Worker: Fetch error', error);
          // You could return a custom offline page here if needed
        })
    );
  } else {
    // For other requests (e.g., API calls, images not in CORE_ASSETS), bypass the service worker
    // and fetch directly from the network.
    // console.log('Service Worker: Bypassing for non-core asset or cross-origin request', event.request.url);
    return; // Let the browser handle it
  }
});
