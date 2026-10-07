/* AlgoVisuals service worker
 *
 * - Pages: network first, falling back to the cache, then to /offline.
 * - Build assets (/_next/static, icons, fonts): cache first. They are content-hashed.
 * - React Server Component requests are left to the network. When they fail
 *   offline, Next.js falls back to a full page load, which this worker serves
 *   from the cache.
 * - "Save for offline" sends CACHE_URLS to download a whole tutorial.
 */

const VERSION = "v1";
const PAGES_CACHE = `algo-visuals-pages-${VERSION}`;
const ASSETS_CACHE = `algo-visuals-assets-${VERSION}`;
const OFFLINE_URL = "/offline";
const PRECACHE_PAGES = ["/", OFFLINE_URL, "/tutorials", "/visualizer"];
const PRECACHE_ASSETS = ["/manifest.webmanifest", "/icons/icon-192.png", "/icons/icon-512.png", "/icon.svg"];
// Personalized or auth-related pages are never written to the cache.
const NEVER_CACHE = [/^\/api\//, /^\/dashboard/, /^\/signin/];
const STATIC_ASSET = /^\/_next\/static\/|\.(?:png|jpg|jpeg|svg|webp|avif|ico|woff2?)$/;

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const pages = await caches.open(PAGES_CACHE);
      const assets = await caches.open(ASSETS_CACHE);
      // One failed URL should not abort the whole install.
      await Promise.allSettled([
        ...PRECACHE_PAGES.map((url) => pages.add(new Request(url, { cache: "reload" }))),
        ...PRECACHE_ASSETS.map((url) => assets.add(url)),
      ]);
      await self.skipWaiting();
    })(),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keep = new Set([PAGES_CACHE, ASSETS_CACHE]);
      for (const key of await caches.keys()) {
        if (key.startsWith("algo-visuals-") && !keep.has(key)) await caches.delete(key);
      }
      if (self.registration.navigationPreload) await self.registration.navigationPreload.enable();
      await self.clients.claim();
    })(),
  );
});

function isCacheable(response, url) {
  if (!response || !response.ok || response.type !== "basic" || response.redirected) return false;
  if (NEVER_CACHE.some((pattern) => pattern.test(url.pathname))) return false;
  const cacheControl = response.headers.get("Cache-Control") || "";
  return !/no-store|private/.test(cacheControl);
}

async function networkFirst(event, url) {
  const cache = await caches.open(PAGES_CACHE);
  try {
    const preloaded = await event.preloadResponse;
    const response = preloaded || (await fetch(event.request));
    if (isCacheable(response, url)) await cache.put(url.pathname, response.clone());
    return response;
  } catch {
    const cached = (await cache.match(url.pathname)) || (await cache.match(event.request, { ignoreSearch: true }));
    if (cached) return cached;
    // Redirect (rather than serve the offline page under this URL) so the
    // page hydrates with a matching pathname and can offer a retry.
    if (url.pathname !== OFFLINE_URL) {
      const target = new URL(OFFLINE_URL, self.location.origin);
      target.searchParams.set("from", url.pathname + url.search);
      return Response.redirect(target.href, 302);
    }
    return (await cache.match(OFFLINE_URL)) || Response.error();
  }
}

async function cacheFirst(request) {
  const cache = await caches.open(ASSETS_CACHE);
  const cached = await cache.match(request);
  if (cached) return cached;
  const response = await fetch(request);
  if (response.ok && response.type === "basic") await cache.put(request, response.clone());
  return response;
}

async function staleWhileRevalidate(request) {
  const cache = await caches.open(ASSETS_CACHE);
  const cached = await cache.match(request);
  const network = fetch(request)
    .then((response) => {
      if (response.ok) cache.put(request, response.clone());
      return response;
    })
    .catch(() => cached);
  return cached || network;
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (url.pathname.startsWith("/api/")) return;
  if (request.headers.get("RSC") || url.searchParams.has("_rsc")) return;

  if (request.mode === "navigate") {
    event.respondWith(networkFirst(event, url));
    return;
  }
  if (STATIC_ASSET.test(url.pathname)) {
    event.respondWith(cacheFirst(request));
    return;
  }
  if (url.pathname === "/manifest.webmanifest") {
    event.respondWith(staleWhileRevalidate(request));
  }
});

// Download a list of pages (and the build assets they reference) for offline use.
self.addEventListener("message", (event) => {
  const data = event.data || {};
  const port = event.ports && event.ports[0];
  if (data.type !== "CACHE_URLS" || !Array.isArray(data.urls)) return;

  event.waitUntil(
    (async () => {
      const pages = await caches.open(PAGES_CACHE);
      const assets = await caches.open(ASSETS_CACHE);
      const total = data.urls.length;
      let done = 0;
      let failed = 0;
      const assetUrls = new Set();

      for (const href of data.urls) {
        try {
          const url = new URL(href, self.location.origin);
          const response = await fetch(url, { credentials: "same-origin" });
          if (!isCacheable(response, url)) throw new Error(`Not cacheable: ${href}`);
          const html = await response.clone().text();
          for (const match of html.matchAll(/\/_next\/static\/[^"'\s)\\]+/g)) assetUrls.add(match[0]);
          await pages.put(url.pathname, response);
        } catch {
          failed++;
        }
        done++;
        if (port) port.postMessage({ type: "progress", done, total, failed });
      }

      await Promise.allSettled(
        [...assetUrls].map(async (asset) => {
          if (await assets.match(asset)) return;
          const response = await fetch(asset);
          if (response.ok) await assets.put(asset, response);
        }),
      );

      if (port) port.postMessage({ type: "done", done, total, failed });
    })(),
  );
});
