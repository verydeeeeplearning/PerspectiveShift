const CACHE_NAME = "perspectiveshift-shell-v1";
const APP_SHELL = ["/", "/manifest.json", "/textures/noise.svg"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)).then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
          return Promise.resolve(false);
        }),
      ),
    ).then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) {
        return cached;
      }
      return fetch(event.request)
        .then((response) => {
          if (!response || response.status !== 200 || response.type !== "basic") {
            return response;
          }
          const cloned = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, cloned));
          return response;
        })
        .catch(() => caches.match("/"));
    }),
  );
});

self.addEventListener("push", (event) => {
  const payload = event.data ? event.data.json() : {};
  const title = payload.title || "PerspectiveShift";
  const body = payload.body || "새 알림이 도착했어요.";
  const targetUrl = payload.url || "/";

  event.waitUntil(
    self.registration.showNotification(title, {
      body,
      icon: "/icons/icon-192.svg",
      badge: "/icons/icon-192.svg",
      data: { targetUrl },
    }),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const targetUrl = event.notification?.data?.targetUrl || "/";
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clients) => {
      const matched = clients.find((client) => client.url.includes(targetUrl));
      if (matched) {
        return matched.focus();
      }
      return self.clients.openWindow(targetUrl);
    }),
  );
});
