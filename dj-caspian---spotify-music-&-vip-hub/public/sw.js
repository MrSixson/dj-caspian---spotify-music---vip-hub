const CACHE_PREFIX = "dj-caspian-pwa-";
const CACHE_VERSION = "v1";
const APP_CACHE = CACHE_PREFIX + CACHE_VERSION;

self.addEventListener("install", (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(APP_CACHE);
    const scopeUrl = new URL(self.registration.scope);
    const appShell = new URL("./", scopeUrl).toString();
    try {
      await cache.add(new Request(appShell, { cache: "reload" }));
    } catch {
      // Installation must remain available even if the first shell request is interrupted.
    }
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
      try {
        const response = await fetch(request);
        if (response.ok) {
          const shellUrl = new URL("./", scopeUrl).toString();
          await cache.put(shellUrl, response.clone());
        }
        return response;
      } catch {
        return (await cache.match(request)) ||
          (await cache.match(new URL("./", scopeUrl).toString())) ||
          new Response("DJ Caspian is offline. Please reconnect and try again.", {
            status: 503,
            headers: { "Content-Type": "text/plain; charset=utf-8" }
          });
      }
    })());
    return;
  }

  // Cache only versioned/static app assets. Audio, media streams and API data
  // remain network-only to avoid stale or unexpectedly large cached content.
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
