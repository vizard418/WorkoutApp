const CACHE_NAME = "workout-app-v2";

const urlsToCache = [
  "/",
  "/index.html",

  "/styles/variables.css",
  "/styles/base.css",
  "/styles/layout.css",
  "/styles/components.css",
  "/styles/modal.css",
  "/styles/utilities.css",

  "/js/main.js",
  "/js/ui.js",
  "/js/modal.js",
  "/js/timer.js",
  "/js/state.js",
  "/js/storage.js",
  "/js/render.js",

  "/icons/icon-192.png",
  "/icons/icon-512.png"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener("fetch", event => {
  const request = event.request;

  // solo manejar GET (evita warnings y errores con otros metodos)
  if (request.method !== "GET") return;

  // ignorar requests externas (fonts, extensiones, etc.)
  if (!request.url.startsWith(self.location.origin)) return;

  event.respondWith(
    caches.match(request).then(response => {
      return response || fetch(request);
    })
  );
});
