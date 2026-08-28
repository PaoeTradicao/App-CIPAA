// Sempre que publicar uma alteração no app, suba este número.
// Isso força o service worker a descartar o cache antigo em todos
// os aparelhos que já instalaram o app.
const CACHE_VERSION = 'cipa-vistoria-v3';

const APP_SHELL = [
  './index.html',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-maskable-512.png',
  './icons/apple-touch-icon.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION).then((cache) => cache.addAll(APP_SHELL))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_VERSION)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Nunca interceptar chamadas ao Firebase/Firestore - elas têm
  // sua própria lógica de sincronização offline.
  if (request.url.includes('firestore.googleapis.com') ||
      request.url.includes('firebaseapp.com') ||
      request.url.includes('googleapis.com')) {
    return;
  }

  // HTML: tenta a rede primeiro, para pegar atualizações rápido;
  // se falhar (sem sinal), cai para o cache.
  if (request.mode === 'navigate' || request.destination === 'document') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE_VERSION).then((cache) => cache.put(request, copy));
          return response;
        })
        .catch(() => caches.match('./index.html'))
    );
    return;
  }

  // Estáticos (ícones, manifest): cache primeiro, rede como reforço.
  event.respondWith(
    caches.match(request).then((cached) => {
      return (
        cached ||
        fetch(request).then((response) => {
          const copy = response.clone();
          caches.open(CACHE_VERSION).then((cache) => cache.put(request, copy));
          return response;
        })
      );
    })
  );
});
