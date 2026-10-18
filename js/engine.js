// Kleine wrapper rond Stockfish (WASM, single-threaded) die als Web Worker draait.
// Alle opdrachten gaan via een wachtrij, zodat analyses nooit door elkaar lopen.

const ENGINE_URL = "vendor/stockfish/stockfish-19-lite-single.js"

let worker = null
let ready = null
let queue = Promise.resolve()
let listener = null

function start() {
    if (ready) return ready
    worker = new Worker(ENGINE_URL)
    worker.onmessage = (e) => listener && listener(String(e.data))
    ready = new Promise((resolve) => {
        listener = (line) => {
            if (line === "readyok") {
                listener = null
                resolve()
            }
        }
        worker.postMessage("uci")
        worker.postMessage("setoption name Hash value 16")
        worker.postMessage("isready")
    })
    return ready
}

function parseInfo(line) {
    // info depth 10 seldepth 14 multipv 1 score cp 34 nodes ... pv e2e4 e7e5
    const parts = line.split(" ")
    const info = {}
    for (let i = 1; i < parts.length; i++) {
        const key = parts[i]
        if (key === "depth") info.depth = +parts[++i]
        else if (key === "multipv") info.multipv = +parts[++i]
        else if (key === "score") {
            const kind = parts[++i]
            const value = +parts[++i]
            if (kind === "cp") info.cp = value
            else info.mate = value
            if (parts[i + 1] === "lowerbound" || parts[i + 1] === "upperbound") info.bound = true
        } else if (key === "pv") {
            info.pv = parts.slice(i + 1)
            break
        }
    }
    return info
}

/**
 * Analyseert een stelling.
 * Geeft {bestmove, lines: [{move, cp, mate, pv}]} terug; scores zijn vanuit de partij die aan zet is.
 */
export function analyse(fen, {depth = 10, multipv = 1, movetime = null} = {}) {
    const job = async () => {
        await start()
        return new Promise((resolve) => {
            const lines = []
            listener = (line) => {
                if (line.startsWith("info ") && line.includes(" pv ")) {
                    const info = parseInfo(line)
                    if (info.bound || !info.pv) return
                    lines[(info.multipv || 1) - 1] = {move: info.pv[0], cp: info.cp, mate: info.mate, pv: info.pv, depth: info.depth}
                } else if (line.startsWith("bestmove")) {
                    listener = null
                    const best = line.split(" ")[1]
                    resolve({bestmove: best === "(none)" ? null : best, lines: lines.filter(Boolean)})
                }
            }
            worker.postMessage("setoption name MultiPV value " + multipv)
            worker.postMessage("position fen " + fen)
            worker.postMessage(movetime ? `go depth ${depth} movetime ${movetime}` : `go depth ${depth}`)
        })
    }
    const result = queue.then(job)
    queue = result.catch(() => {})
    return result
}

export function newGame() {
    queue = queue.then(async () => {
        await start()
        worker.postMessage("ucinewgame")
    })
    return queue
}

/** Start de engine alvast op de achtergrond, zodat de eerste zet sneller is. */
export function warmUp() {
    start()
}

/** Zet een engine-score om naar centipionnen (mat = groot getal). */
export function scoreToCp(line) {
    if (!line) return 0
    if (line.mate !== undefined) return line.mate > 0 ? 10000 - line.mate * 10 : -10000 - line.mate * 10
    return line.cp
}

/** Winstkans (0-100) volgens de formule die Lichess gebruikt. */
export function winChance(cp) {
    const c = Math.max(-1000, Math.min(1000, cp))
    return 50 + 50 * (2 / (1 + Math.exp(-0.00368208 * c)) - 1)
}
