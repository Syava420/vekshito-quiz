const CACHE_NAME = 'vekshito-quiz-v1';
const ASSETS = [
  './',
  './index.html',
  './styles.css',
  './css/base.css',
  './css/screens.css',
  './app.js',
  './src/srs.js',
  './src/fuzzy-match.js',
  './src/quiz-engine.js',
  './src/ui.js',
  './src/questions-data.js',
  './data/questions.json',
  './manifest.json'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) return caches.delete(key);
        })
      )
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cached) => cached || fetch(event.request))
  );
});
