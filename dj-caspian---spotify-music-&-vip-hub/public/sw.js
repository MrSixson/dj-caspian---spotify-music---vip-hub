const CACHE_PREFIX = "dj-caspian-pwa-";
const CACHE_VERSION = "v1";
const APP_CACHE = CACHE_PREFIX + CACHE_VERSION;

self.addEventListener("install", (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(APP_CACHE);
    const scopeUrl = new URL(self.registration.scope);
    const appShell = new URL("./", scopeUrl).toString();
    const offlinePage = new URL("offline.html", scopeUrl).toString();
    await Promise.all([appShell, offlinePage].map(async (url) => {
      try {
        await cache.add(new Request(url, { cache: "reload" }));
      } catch {
        // Installation must remain available even if an optional shell request is interrupted.
      }
    }));
    await self.skipWaiting();
  })());
});

self.addEventListener("activate", (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys
      .filter((key) => key.startsWith(CACHE_PREFIX) && key !== APP_CACHE)
      .map((key) => caches.delete(key)));
    await self.clients.claim();
  })());
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;

  const requestUrl = new URL(request.url);
  const scopeUrl = new URL(self.registration.scope);

  // Never intercept cross-origin requests or authentication, database, storage,
  // payment, or other API traffic. User-specific responses must not enter this cache.
  if (requestUrl.origin !== scopeUrl.origin) return;
  if (!requestUrl.pathname.startsWith(scopeUrl.pathname)) return;
  if (/\/(auth|rest|storage|functions|realtime)\/v1\//i.test(requestUrl.pathname)) return;

  if (request.mode === "navigate") {
    event.respondWith((async () => {
      const cache = await caches.open(APP_CACHE);
      const appShell = new URL("./", scopeUrl).toString();
      const offlinePage = new URL("offline.html", scopeUrl).toString();
      try {
        const response = await fetch(request);
        if (response.ok) await cache.put(appShell, response.clone());
        return response;
      } catch {
        return (await cache.match(request)) ||
          (await cache.match(appShell)) ||
          (await cache.match(offlinePage)) ||
          new Response("DJ Caspian is offline. Please reconnect and try again.", {
            status: 503,
            headers: { "Content-Type": "text/plain; charset=utf-8" }
          });
      }
    })());
    return;
  }

  // Cache only static app assets. Audio streams and API data stay network-only.
  const isStaticAsset = /\.(?:js|css|woff2?|ttf|otf|svg|png|webp|ico)$/i.test(requestUrl.pathname);
  if (!isStaticAsset) return;

  event.respondWith((async () => {
    const cache = await caches.open(APP_CACHE);
    const cached = await cache.match(request);
    const network = fetch(request).then((response) => {
      if (response.ok && response.type === "basic") {
        cache.put(request, response.clone());
      }
      return response;
    });
    return cached || network;
  })());
});
