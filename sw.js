// Service worker: maakt de app offline bruikbaar.
// Dit bestand wordt gegenereerd door tools/build_sw.py; pas tools/sw.template.js aan.

const CACHE = "schaaktrainer-bdd9fd7269"
const ASSETS = [
    "./",
    "css/app.css",
    "icons/apple-touch-icon.png",
    "icons/icon-192.png",
    "icons/icon-512.png",
    "index.html",
    "js/app.js",
    "js/board.js",
    "js/engine.js",
    "js/explain.js",
    "js/play.js",
    "js/progress.js",
    "js/puzzles.js",
    "js/review.js",
    "js/storage.js",
    "js/themes.js",
    "js/ui.js",
    "manifest.webmanifest",
    "vendor/chess.js/chess.js",
    "vendor/cm-chessboard/assets/chessboard.css",
    "vendor/cm-chessboard/assets/extensions/arrows/arrows.css",
    "vendor/cm-chessboard/assets/extensions/arrows/arrows.svg",
    "vendor/cm-chessboard/assets/extensions/markers/markers.css",
    "vendor/cm-chessboard/assets/extensions/markers/markers.svg",
    "vendor/cm-chessboard/assets/extensions/promotion-dialog/promotion-dialog.css",
    "vendor/cm-chessboard/assets/pieces/standard.svg",
    "vendor/cm-chessboard/src/Chessboard.js",
    "vendor/cm-chessboard/src/extensions/arrows/Arrows.js",
    "vendor/cm-chessboard/src/extensions/markers/Markers.js",
    "vendor/cm-chessboard/src/extensions/promotion-dialog/PromotionDialog.js",
    "vendor/cm-chessboard/src/lib/Svg.js",
    "vendor/cm-chessboard/src/lib/Utils.js",
    "vendor/cm-chessboard/src/model/ChessboardState.js",
    "vendor/cm-chessboard/src/model/Extension.js",
    "vendor/cm-chessboard/src/model/Position.js",
    "vendor/cm-chessboard/src/view/ChessboardView.js",
    "vendor/cm-chessboard/src/view/PositionAnimationsQueue.js",
    "vendor/cm-chessboard/src/view/VisualMoveInput.js",
    "vendor/stockfish/stockfish-19-lite-single.js",
    "vendor/stockfish/stockfish-19-lite-single.wasm"
]

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
