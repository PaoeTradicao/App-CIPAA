// Sempre que publicar uma alteração no app, suba este número.
// Isso força o service worker a descartar o cache antigo em todos
// os aparelhos que já instalaram o app.
const CACHE_VERSION = 'cipa-vistoria-v8';

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
  const url = new URL(request.url);

  // Nunca interceptar chamadas ao Firebase/Firestore - elas têm
  // sua própria lógica de sincronização offline.
  if (url.hostname.includes('firestore.googleapis.com') ||
      url.hostname.includes('firebaseapp.com') ||
      url.hostname.includes('googleapis.com')) {
    return;
  }

  const mesmaOrigem = url.origin === self.location.origin;

  if (mesmaOrigem) {
    // Tudo que é NOSSO (HTML, app.js, manifest.json, ícones): a rede
    // é sempre consultada primeiro, então uma atualização publicada
    // chega assim que houver sinal. O cache só entra como reforço
    // quando o aparelho está offline. Antes o app.js era "cache
    // primeiro", o que fazia o celular ficar preso numa versão
    // antiga por muito tempo mesmo depois de publicar uma correção.
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE_VERSION).then((cache) => cache.put(request, copy));
          return response;
        })
        .catch(() =>
          caches.match(request).then((cached) => cached || (request.mode === 'navigate' ? caches.match('./index.html') : Response.error()))
        )
    );
    return;
  }

  // Bibliotecas externas (Firebase SDK, jsPDF, fontes): cache primeiro,
  // já que a URL é fixa por versão e praticamente nunca muda.
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
