const CACHE_NAME = "workout-app-v2";

const STATIC_ASSETS = [
  "./",
  "./index.html",
  "./styles.css",
  "./app.js",
  "./icons/icon-192.png",
  "./icons/icon-512.png"
];

/* =========================
   INSTALL
========================= */

self.addEventListener("install", event => {
  self.skipWaiting();

  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
});

/* =========================
   ACTIVATE (IMPORTANTE)
========================= */

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );

  self.clients.claim();
});

/* =========================
   FETCH STRATEGY
========================= */

self.addEventListener("fetch", event => {
  const request = event.request;

  /* JS / CSS / HTML -> network first */
  if (
    request.destination === "script" ||
    request.destination === "style" ||
    request.destination === "document"
  ) {
    event.respondWith(
      fetch(request)
        .then(response => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(request, clone);
          });
          return response;
        })
        .catch(() => caches.match(request))
    );
    return;
  }

  /* assets -> cache first */
  event.respondWith(
    caches.match(request).then(response => {
      return response || fetch(request);
    })
  );
});
