const CACHE_NAME = 'masterflexo-v8.1-cache';
const urlsToCache = [
  './',
  './index.html',
  './manifest.json',
  './logotipo-aplicación.png',
  'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js'
];

// Instalación del Service Worker y guardado en caché
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Caché abierto');
        return cache.addAll(urlsToCache);
      })
  );
  self.skipWaiting();
});

// Activación y limpieza de cachés antiguos (muy útil cuando actualices a la 8.1)
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Estrategia Fetch: Busca primero en caché, si no está, va a la red
self.addEventListener('fetch', event => {
  // Evitar interceptar peticiones a la API de Google Sheets para que el guardado en la nube funcione siempre en vivo
  if (event.request.url.includes('script.google.com')) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Devuelve el archivo desde la caché si existe
        if (response) {
          return response;
        }
        // Si no está en caché, hace la petición a la red
        return fetch(event.request).catch(() => {
            console.log("Error de red al intentar cargar recurso no cacheado.");
        });
      })
  );
});
