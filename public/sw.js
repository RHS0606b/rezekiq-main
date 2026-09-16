const CACHE_NAME = 'rezekiq-v3';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/favicon.svg',
  '/logo.png',
  '/manifest.json'
];

self.addEventListener('install', (event) => {
  // Biarkan browser meng-install di background tanpa menginterupsi tab aktif pengguna
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

self.addEventListener('activate', (event) => {
  // Bersihkan cache lama dengan aman tanpa memaksa reload (tanpa clients.claim)
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  
  const url = new URL(event.request.url);
  // Hindari intercept request eksternal / CDN
  if (url.origin !== self.location.origin) {
    return;
  }

  // Khusus halaman navigasi HTML, gunakan Network First agar update selalu segar tanpa auto-reload paksa
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => caches.match('/index.html'))
    );
    return;
  }

  // Aset statis lainnya menggunakan cache first
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
