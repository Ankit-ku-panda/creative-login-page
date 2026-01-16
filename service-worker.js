const CACHE_NAME = '3d-web-cache-v2';
const PRECACHE_ASSETS = [
  './',
  './index.html',
  './dashboard.html',
  './style.css',
  './script.js',
  './bg.png',
  './model.png',
  './icon.svg',
  './icon-192.svg',
  './icon-512.svg',
  './dragon_1.jpg',
  './dragon_2.jpg',
  './dragon_3.jpg',
  './dragon_4.jpg',
  './dragon_5.jpg',
  './dragon_6.jpg',
  './dragon_7.jpg',
  './dragon_8.jpg',
  './dragon_9.jpg',
  './dragon_10.jpg'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(PRECACHE_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.map(key => {
        if (key !== CACHE_NAME) return caches.delete(key);
      })
    ))
  );
  self.clients.claim();
});

// Helper: try cache first, then network (with update)
function cacheFirst(request) {
  return caches.match(request).then(cached => {
    if (cached) return cached;
    return fetch(request).then(response => {
      return response;
    }).catch(() => caches.match('./'));
  });
}

// Helper: network first with cache fallback
function networkFirst(request) {
  return fetch(request).then(response => {
    return response;
  }).catch(() => caches.match(request).then(cached => cached || caches.match('./')));
}

self.addEventListener('fetch', event => {
  const req = event.request;

  // Navigation requests -> network first (SPA-friendly)
  if (req.mode === 'navigate') {
    event.respondWith(networkFirst(req));
    return;
  }

  // Images -> cache-first for performance
  if (req.destination === 'image') {
    event.respondWith(cacheFirst(req));
    return;
  }

  // CSS/JS -> stale-while-revalidate behavior
  if (req.destination === 'style' || req.destination === 'script') {
    event.respondWith(
      caches.open(CACHE_NAME).then(cache =>
        cache.match(req).then(cached =>
          Promise.resolve(cached || fetch(req).then(networkRes => {
            // Optionally cache new responses
            try { cache.put(req, networkRes.clone()); } catch (e) {}
            return networkRes;
          }))
        )
      )
    );
    return;
  }

  // Default: try cache, fall back to network
  event.respondWith(caches.match(req).then(cached => cached || fetch(req)));
});
