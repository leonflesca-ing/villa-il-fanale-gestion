const CACHE = 'villa-il-fanale-v7';
const CORE = [
  './', './index.html', './styles.css', './app.js', './manifest.json',
  './assets/icon-192.png', './assets/icon-512.png', './assets/farol.png',
  './assets/jardin-entrada.png', './assets/logo-completo.png',
  './reservar/', './reservar/index.html', './reservar/public.css', './reservar/public.js', './reservar/config.js', './reservar/content.json'
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
  event.respondWith(
    caches.match(event.request).then(cached => cached || fetch(event.request).then(response => {
      const copy = response.clone();
      caches.open(CACHE).then(cache => cache.put(event.request, copy));
      return response;
    }).catch(() => caches.match('./index.html')))
  );
});
