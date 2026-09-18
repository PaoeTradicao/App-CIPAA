// Sempre que publicar uma alteração no app, suba este número.
// Isso força o service worker a descartar o cache antigo em todos
// os aparelhos que já instalaram o app.
const CACHE_VERSION = 'cipa-vistoria-v24';

const APP_SHELL = [
  './',
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

  // Só interessa GET. POST e outros nunca devem passar pelo cache.
  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  // Nunca interceptar chamadas ao Firebase/Firestore, elas têm
  // sua própria lógica de sincronização offline.
  if (url.hostname.includes('firestore.googleapis.com') ||
      url.hostname.includes('firebaseapp.com') ||
      url.hostname.includes('googleapis.com')) {
    return;
  }

  const mesmaOrigem = url.origin === self.location.origin;

  // Só guarda no cache resposta que realmente serve: status 200, do
  // próprio site e sem redirecionamento. Sem essa checagem, uma
  // resposta ruim (erro, redirect, resposta parcial durante um deploy)
  // era guardada e depois devolvida como se fosse o arquivo certo.
  function respostaBoa(response) {
    return response && response.status === 200 && response.type === 'basic' && !response.redirected;
  }

  function guardar(request, response) {
    if (!respostaBoa(response)) return;
    const copy = response.clone();
    caches.open(CACHE_VERSION).then((cache) => cache.put(request, copy));
  }

  if (mesmaOrigem) {
    // Tudo que é NOSSO (HTML, app.js, manifest.json, ícones): a rede
    // é sempre consultada primeiro, então uma atualização publicada
    // chega assim que houver sinal. O cache só entra como reforço
    // quando o aparelho está offline.
    event.respondWith(
      fetch(request)
        .then((response) => {
          guardar(request, response);
          return response;
        })
        .catch(() =>
          // caches.open(CACHE_VERSION) em vez de caches.match global:
          // o global procura em TODAS as versões de cache, inclusive
          // antigas ainda não apagadas, e pode devolver arquivo velho.
          caches.open(CACHE_VERSION).then((cache) =>
            cache.match(request).then((cached) => {
              if (cached) return cached;
              // Numa navegação sem sinal, devolve a casca do app.
              // Usa o caminho absoluto do escopo porque a pessoa pode
              // ter aberto a pasta ("/App-CIPAA/") em vez do arquivo,
              // e esses dois são chaves diferentes no cache.
              if (request.mode === 'navigate') {
                return cache.match(new URL('index.html', self.registration.scope).href);
              }
              return Response.error();
            })
          )
        )
    );
    return;
  }

  // Bibliotecas externas (Firebase SDK, jsPDF, fontes): cache primeiro,
  // já que a URL é fixa por versão e praticamente nunca muda.
  event.respondWith(
    caches.open(CACHE_VERSION).then((cache) =>
      cache.match(request).then((cached) => {
        return (
          cached ||
          fetch(request).then((response) => {
            if (response && response.status === 200) {
              const copy = response.clone();
              cache.put(request, copy);
            }
            return response;
          })
        );
      })
    )
  );
});
