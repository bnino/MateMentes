const CACHE_NAME = 'matementes-v1';
const NAV_CACHE = 'nav-cache-v1';

const PRECACHE_URLS = [
  '/', 
  '/index.html'
];

function isCacheableRequest(request) {
  return request.url.startsWith('http://') || request.url.startsWith('https://');
}

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS))
  );
});

self.addEventListener('activate', (event) => {
  clients.claim();
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(k => k !== CACHE_NAME && k !== NAV_CACHE).map(k => caches.delete(k))
      )
    )
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;

  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req)
        .then(res => {
          if (isCacheableRequest(req) && res.ok) {
            const copy = res.clone();
            caches.open(NAV_CACHE).then(c => c.put(req, copy));
          }
          return res.clone(); // <-- ahora siempre devolvemos un clon
        })
        .catch(() => caches.match('/'))
    );
    return;
  }

  if (req.destination === 'script' || req.destination === 'style' || req.destination === 'image') {
    event.respondWith(
      caches.match(req).then((cached) => {
        if (cached) {
          fetch(req).then((res) => {
            if (isCacheableRequest(req) && res.ok) {
              caches.open(CACHE_NAME).then(c => c.put(req, res.clone()));
            }
          }).catch(() => {});
          return cached;
        }
        return fetch(req).then((res) => {
          if (isCacheableRequest(req) && res.ok) {
            const copy = res.clone();
            caches.open(CACHE_NAME).then(c => c.put(req, copy));
          }
          return res.clone(); // <-- clon antes de devolver
        }).catch(() => caches.match('/'));
      })
    );
    return;
  }

  event.respondWith(
    fetch(req)
      .then((res) => {
        if (isCacheableRequest(req) && res.ok) {
          const copy = res.clone();
          caches.open(CACHE_NAME).then(c => c.put(req, copy));
        }
        return res.clone(); // <-- clon antes de devolver
      })
      .catch(() => caches.match(req))
  );
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
