/* Minimal service worker — cache-first for app shell, network for live data (tiles, OSRM, Nominatim). */
const VERSION = "sixt-swap-v1";
const SHELL = [
  "./",
  "./index.html",
  "./app.js",
  "./stations.js",
  "./manifest.json",
  "./icon-192.png",
  "./icon-512.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(VERSION).then((cache) => cache.addAll(SHELL)).catch(() => {})
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);

  // Network-only for live APIs and tile providers
  if (
    url.host.includes("nominatim.openstreetmap.org") ||
    url.host.includes("router.project-osrm.org") ||
    url.host.includes("basemaps.cartocdn.com") ||
    url.host.includes("unpkg.com")
  ) {
    return; // let the browser handle it normally
  }

  // Cache-first for own origin shell
  if (url.origin === self.location.origin) {
    event.respondWith(
      caches.match(req).then((hit) => hit || fetch(req).then((res) => {
        const copy = res.clone();
        caches.open(VERSION).then((c) => c.put(req, copy)).catch(() => {});
        return res;
      }).catch(() => caches.match("./index.html")))
    );
  }
});
