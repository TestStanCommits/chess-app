// Service worker: maakt de app offline bruikbaar.
// Dit bestand wordt gegenereerd door tools/build_sw.py; pas tools/sw.template.js aan.

const CACHE = "schaaktrainer-__VERSION__"
const ASSETS = __ASSETS__

self.addEventListener("install", (event) => {
    event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(ASSETS)).then(() => self.skipWaiting()))
})

self.addEventListener("activate", (event) => {
    event.waitUntil(
        caches.keys()
            .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
            .then(() => self.clients.claim())
    )
})

self.addEventListener("fetch", (event) => {
    const req = event.request
    if (req.method !== "GET" || new URL(req.url).origin !== location.origin) return
    // Puzzels: eerst uit de cache (snel, offline), op de achtergrond verversen.
    if (req.url.includes("/data/")) {
        event.respondWith(caches.open(CACHE).then(async (cache) => {
            const cached = await cache.match(req)
            const fresh = fetch(req).then((res) => {
                if (res.ok) cache.put(req, res.clone())
                return res
            }).catch(() => cached)
            return cached || fresh
        }))
        return
    }
    event.respondWith(caches.match(req, {ignoreSearch: true}).then((cached) => cached || fetch(req)))
})
