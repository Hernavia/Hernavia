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
  '/Hernavia/identidad.html', // faltaba esta
  '/Hernavia/noticias-random.html'
];

// Instalar y precachear archivos
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
      .then(() => self.skipWaiting()) // mejor poner skipWaiting después del precache
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

// Estrategia: cache-first con actualización en segundo plano
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return; // ignorar POST y otros métodos

  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      const networkFetch = fetch(event.request)
        .then(response => {
          if (
            response &&
            response.status === 200 &&
            response.type === 'basic'
          ) {
            const cloned = response.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(event.request, cloned));
          }
          return response;
        })
        .catch(() => cachedResponse); // fallback a caché si no hay red

      // respuesta inmediata con caché o red si no hay nada guardado
      return cachedResponse || networkFetch;
    })
  );
});
