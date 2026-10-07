// Minimal service worker stub
// Future: implement offline caching strategy

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

self.addEventListener('fetch', (event) => {
  // Pass through all requests for now
  event.respondWith(fetch(event.request));
});
