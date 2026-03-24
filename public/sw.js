// This service worker immediately unregisters itself.
// It exists only to clean up the old CRA service worker that was cached in browsers.
self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", () => {
  self.registration.unregister().then(() => {
    return self.clients.matchAll({ type: "window" });
  }).then((clients) => {
    clients.forEach((client) => client.navigate(client.url));
  });
});
