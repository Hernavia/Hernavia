const CACHE_NAME = 'hernavia-cache-v1';
const urlsToCache = [
  '/', // página principal
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

// Instala el service worker y guarda los archivos
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

// Usa los archivos del caché primero, si existen
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      // Si está en caché, lo usa. Si no, lo descarga y guarda.
      return response || fetch(event.request).then(fetchResponse => {
        return caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, fetchResponse.clone());
          return fetchResponse;
        });
      });
    })
  );
});

// Limpia versiones viejas del caché
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.map(key => {
          if (!cacheWhitelist.includes(key)) {
            return caches.delete(key);
          }
        })
      );
    })
  );
});
