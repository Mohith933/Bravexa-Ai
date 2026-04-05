const CACHE_NAME = "bravexa-v1";

const urlsToCache = [
  "/",
  "/index.html",
  "/Login.html",
  "/dashboard.html",
  "/style.css",
  "/script.js",
  "/main.js",
  "/chat.png",
  "/avatar.png"
];

// Install
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache);
    })
  );
});

// Fetch (offline support)
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
