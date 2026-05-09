const CACHE_NAME = 'overhoorder-v1';
const RUNTIME_CACHE = 'overhoorder-runtime';
const ASSETS_TO_CACHE = [
  '/',
  '/index.php',
  '/offline.html',
  '/host.css',
  '/aurora.js',
  '/card.js',
  '/list.js',
  '/input.js',
  '/oefening.js',
  '/taalvragen.js',
  '/newtest.js',
  '/runtime.js',
  '/manifest.json',
  '/icon.png',
  '/favicon.png',
  '/favicon.ico'
];

// Install event - cache essential assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[Service Worker] Caching essential assets');
        return cache.addAll(ASSETS_TO_CACHE).catch(err => {
          console.warn('[Service Worker] Some assets failed to cache:', err);
          // Don't fail the install if some assets can't be cached
          return Promise.resolve();
        });
      })
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE) {
            console.log('[Service Worker] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip external requests (CDN, external APIs)
  if (url.origin !== location.origin && !url.href.includes('cdn.jsdelivr.net')) {
    return;
  }

  // Handle different types of requests
  if (request.destination === 'style' || request.destination === 'script' || request.destination === 'image') {
    // Assets: cache first, network fallback
    event.respondWith(
      caches.match(request).then(response => {
        if (response) {
          return response;
        }
        return fetch(request).then(response => {
          if (!response || response.status !== 200 || response.type === 'error') {
            return response;
          }
          // Clone and cache the response
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(request, responseClone);
          });
          return response;
        }).catch(() => {
          // Return offline placeholder
          if (request.destination === 'image') {
            return new Response('offline', { status: 503 });
          }
          return new Response('', { status: 503 });
        });
      })
    );
  } else {
    // HTML and API: network first, cache fallback
    event.respondWith(
      fetch(request)
        .then(response => {
          if (!response || response.status !== 200) {
            return response;
          }
          // Clone and cache successful responses
          const responseClone = response.clone();
          caches.open(RUNTIME_CACHE).then(cache => {
            cache.put(request, responseClone);
          });
          return response;
        })
        .catch(() => {
          return caches.match(request).then(response => {
            if (response) {
              return response;
            }
            // Return offline page or error response
            return new Response(
              '<h1>Offline</h1><p>Je bent offline. Dit gedeelte van de website vereist een internet verbinding.</p>',
              {
                status: 503,
                statusText: 'Service Unavailable',
                headers: new Headers({
                  'Content-Type': 'text/html; charset=utf-8'
                })
              }
            );
          });
        })
    );
  }
});

// Handle messages from clients
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
