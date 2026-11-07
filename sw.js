const CACHE_NAME = 'vekshito-quiz-v2';
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
  './data/categories/biology.js',
  './data/categories/chemistry.js',
  './data/categories/physics.js',
  './data/categories/history.js',
  './data/categories/geography.js',
  './data/categories/literature.js',
  './data/categories/russian.js',
  './data/categories/math_logic.js',
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
