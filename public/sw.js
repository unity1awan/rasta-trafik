const CACHE = "rasta-trafik-v1";

const PRECACHE = [
  "/",
  "/manifest.json",
  "/icon.svg",
];

// Installera — förcacha app-skalet
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(PRECACHE))
  );
  self.skipWaiting();
});

// Aktivera — ta bort gamla cacher
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch — network-first för API, cache-first för statiska assets
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // API-anrop och externa resurser — aldrig cacha
  if (
    url.pathname.startsWith("/api/") ||
    url.origin !== self.location.origin ||
    request.method !== "GET"
  ) {
    return;
  }

  // Statiska assets — cache-first, uppdatera i bakgrunden
  event.respondWith(
    caches.open(CACHE).then(async (cache) => {
      const cached = await cache.match(request);
      const networkFetch = fetch(request)
        .then((res) => {
          if (res.ok) cache.put(request, res.clone());
          return res;
        })
        .catch(() => cached);

      return cached ?? networkFetch;
    })
  );
});
