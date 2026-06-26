const CACHE = 'villa-il-fanale-v14';
const CORE = [
  './', './index.html', './styles.css', './app.js', './manifest.json',
  './assets/icon-192.png', './assets/icon-512.png', './assets/farol.png',
  './assets/jardin-entrada.png', './assets/logo-completo.png',
  './reservar/', './reservar/index.html', './reservar/public.css', './reservar/public.js'
];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(CORE)));
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key !== CACHE).map(key => caches.delete(key)))));
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  if (url.origin !== location.origin) return;
  const dynamicPublicFile = url.pathname.includes('/assets/pagina-') || url.pathname.endsWith('/reservar/content.json') || url.pathname.endsWith('/reservar/config.js');
  if (dynamicPublicFile) {
    event.respondWith(fetch(event.request, { cache: 'no-store' }));
    return;
  }
  if (event.request.mode === 'navigate') {
    event.respondWith(fetch(event.request).catch(() => caches.match('./index.html')));
    return;
  }
  event.respondWith(
    caches.match(event.request).then(cached => cached || fetch(event.request).then(response => {
      if (!response || !response.ok || response.type !== 'basic') return response;
      const copy = response.clone();
      caches.open(CACHE).then(cache => cache.put(event.request, copy));
      return response;
    }).catch(() => caches.match(event.request)))
  );
});
