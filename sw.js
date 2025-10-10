const CACHE_NAME = 'hernavia-cache-v2';
const urlsToCache = [
  '/Hernavia/',
  '/Hernavia/index.html',
  '/Hernavia/estilo.css',
  '/Hernavia/favicono.png',
  '/Hernavia/futuro.mp3',
  '/Hernavia/img/puedenideas.png',
  '/Hernavia/documentos.html',
  '/Hernavia/noticias.html',
  '/Hernavia/consultas.html',
  '/Hernavia/simbolos.html',
  '/Hernavia/comounirse.html',
  '/Hernavia/sugerencias.html',
  '/Hernavia/noticias-random.html'
];

// Instalar y precachear archivos
self.addEventListener('install', event => {
  self.skipWaiting(); // fuerza al SW a activarse más rápido
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
      .catch(err => console.error('Error al precachear:', err))
  );
});

// Activar: limpiar versiones antiguas
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.map(key => {
          if (!cacheWhitelist.includes(key)) {
            console.log('Eliminando caché antiguo:', key);
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Estrategia de cache mejorada: cache-first con validación en red
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return; // ignorar POST (como los formularios)

  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      const fetchPromise = fetch(event.request)
        .then(networkResponse => {
          // solo cachea si es válido
          if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then(cache => {
              cache.put(event.request, responseClone);
            });
          }
          return networkResponse;
        })
        .catch(() => cachedResponse); // si no hay red, usar caché

      // responde rápido con el caché mientras valida en segundo plano
      return cachedResponse || fetchPromise;
    })
  );
});
