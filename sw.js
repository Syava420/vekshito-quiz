/**
 * Service Worker: Full offline precaching & Stale-While-Revalidate caching.
 * Enables 100% offline usage on mobile devices (Airplane mode / no internet).
 */

const CACHE_NAME = 'vekshito-quiz-v9';

const PRECACHE_ASSETS = [
  './',
  './index.html',
  './styles.css',
  './manifest.json',
  './app.js?v=9',
  './css/base.css',
  './css/screens.css',
  './src/difficulty.js',
  './src/fuzzy-match.js',
  './src/questions-data.js',
  './src/quiz-engine.js',
  './src/srs.js',
  './src/ui.js',
  './data/questions.json',
  './data/categories/astronomy.js',
  './data/categories/biology.js',
  './data/categories/chemistry.js',
  './data/categories/culture.js',
  './data/categories/flags.js',
  './data/categories/general.js',
  './data/categories/geography.js',
  './data/categories/history.js',
  './data/categories/literature.js',
  './data/categories/math_logic.js',
  './data/categories/physics.js',
  './data/categories/russian.js',
  './data/categories/vekshito_vault_01.js',
  './data/categories/vekshito_vault_02.js',
  './data/categories/vekshito_vault_03.js',
  './data/categories/vekshito_vault_04.js',
  './data/categories/vekshito_vault_05.js',
  './data/categories/vekshito_vault_06.js',
  './data/categories/vekshito_vault_07.js',
  './assets/images/blue_whale.jpg',
  './assets/images/catherine_great.jpg',
  './assets/images/cheetah.jpg',
  './assets/images/chekhov.jpg',
  './assets/images/colosseum.jpg',
  './assets/images/eiffel_tower.jpg',
  './assets/images/einstein.jpg',
  './assets/images/flag_argentina.png',
  './assets/images/flag_brazil.png',
  './assets/images/flag_canada.png',
  './assets/images/flag_france.png',
  './assets/images/flag_germany.png',
  './assets/images/flag_italy.png',
  './assets/images/flag_japan.png',
  './assets/images/flag_korea.png',
  './assets/images/flag_uk.png',
  './assets/images/flag_usa.png',
  './assets/images/gagarin.jpg',
  './assets/images/girl_with_peaches.jpg',
  './assets/images/jupiter.jpg',
  './assets/images/lenin.jpg',
  './assets/images/mars.jpg',
  './assets/images/mendeleev.jpg',
  './assets/images/mona_lisa.jpg',
  './assets/images/morning_in_pine_forest.jpg',
  './assets/images/napoleon.jpg',
  './assets/images/newton.jpg',
  './assets/images/ninth_wave.jpg',
  './assets/images/peter_great.jpg',
  './assets/images/platypus.jpg',
  './assets/images/pushkin.jpg',
  './assets/images/saturn.jpg',
  './assets/images/starry_night.jpg',
  './assets/images/taj_mahal.jpg',
  './assets/images/the_scream.jpg',
  './assets/images/tolstoy.jpg'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS);
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((k) => {
          if (k !== CACHE_NAME) return caches.delete(k);
        })
      )
    ).then(() => self.clients.claim())
  );
});

// Cache-First with Network fallback & revalidation
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        // Revalidate in background when online
        fetch(event.request).then((networkRes) => {
          if (networkRes && networkRes.status === 200) {
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, networkRes));
          }
        }).catch(() => {});
        return cachedResponse;
      }

      return fetch(event.request).then((networkRes) => {
        if (networkRes && networkRes.status === 200) {
          const clone = networkRes.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        }
        return networkRes;
      }).catch(async () => {
        if (event.request.mode === 'navigate') {
          return (await caches.match('./index.html')) || (await caches.match('./'));
        }
      });
    })
  );
});
