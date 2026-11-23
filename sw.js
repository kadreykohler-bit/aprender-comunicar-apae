const CACHE_NAME = 'aprender-comunicar-offline-v6';
const ARQUIVOS_ESSENCIAIS = [
  './',
  './index.html',
  './manifest.json',
  './sw.js',
  './assets/css/style.css',
  './assets/js/app.js',
  './assets/js/register-sw.js',
  './assets/icons/icon-192.png',
  './assets/icons/icon-512.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async cache => {
      for (const arquivo of ARQUIVOS_ESSENCIAIS) {
        try {
          await cache.add(arquivo);
        } catch (erro) {
          console.warn('Arquivo opcional ignorado no cache:', arquivo);
        }
      }
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(chaves =>
      Promise.all(
        chaves.map(chave => (chave !== CACHE_NAME ? caches.delete(chave) : null))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then(respostaCache => {
      if (respostaCache) return respostaCache;
      return fetch(event.request).then(respostaRede => {
        const copia = respostaRede.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, copia));
        return respostaRede;
      });
    })
  );
});