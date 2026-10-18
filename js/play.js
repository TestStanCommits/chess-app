// Spelen tegen de computer, met een sterkte die zich aanpast aan je resultaten.

import {Chess} from "../vendor/chess.js/chess.js"
import {createBoard, enableInput, showLastMove, uciToMove, prettySan, COLOR} from "./board.js"
import * as engine from "./engine.js"
import * as store from "./storage.js"
import {$, toast} from "./ui.js"

// Niveau 1 is heel zwak (maakt vaak blunders), niveau 10 is volle sterkte.
// depth: rekendiepte, blunder: kans op een willekeurige zet, temp: hoe "slordig" hij kiest uit goede zetten.
export const LEVELS = [null,
    {depth: 1, blunder: 0.30, temp: 250},
    {depth: 1, blunder: 0.20, temp: 180},
    {depth: 2, blunder: 0.14, temp: 130},
    {depth: 3, blunder: 0.10, temp: 90},
    {depth: 4, blunder: 0.07, temp: 60},
    {depth: 5, blunder: 0.05, temp: 40},
    {depth: 7, blunder: 0.03, temp: 25},
    {depth: 9, blunder: 0.015, temp: 12},
    {depth: 12, blunder: 0.005, temp: 5},
    {depth: 15, blunder: 0, temp: 0},
]

let root = null
let board = null
let chess = null
let game = null      // {color, level, moves: [san], result}
let onReview = null
let thinking = false

export function init(container, {review}) {
    onReview = review
    root = container
    root.innerHTML = `
        <div class="pl-setup card-list"></div>
        <div class="pl-game" hidden>
            <div class="pl-bar"><span class="piece-dot pl-bot-color"></span> <span class="pl-bot"></span><span class="pl-thinking" hidden> denkt na…</span></div>
            <div class="board-wrap"><div class="board"></div></div>
            <div class="pl-moves"></div>
            <div class="pl-end"></div>
            <div class="button-row pl-actions">
                <button class="btn secondary pl-resign">Opgeven</button>
            </div>
        </div>`
    board = createBoard($(".board", root))
    $(".pl-resign", root).onclick = () => {
        if (game && !game.result && confirm("Weet je zeker dat je wilt opgeven?")) endGame("loss", "Je hebt opgegeven.")
    }
}

export function show() {
    engine.warmUp()
    if (game) return    // lopende of net afgelopen partij blijft staan
    const saved = store.get().currentGame
    if (saved) resume(saved)
    else renderSetup()
}

function renderSetup() {
    const st = store.get()
    $(".pl-game", root).hidden = true
    const setup = $(".pl-setup", root)
    setup.hidden = false
    const recent = st.games.slice(-10)
    const w = recent.filter((g) => g.result === "win").length
    const l = recent.filter((g) => g.result === "loss").length
    setup.innerHTML = `
        <div class="card hero">
            <h2>Speel tegen de computer</h2>
            <div class="level">
                <button class="btn round pl-minus" aria-label="Zwakker">−</button>
                <div><div class="level-num">${st.botLevel}</div><div class="muted">niveau (1–10)</div></div>
                <button class="btn round pl-plus" aria-label="Sterker">+</button>
            </div>
            <p class="muted">Win je, dan wordt de computer een niveau sterker. Verlies je, dan wordt hij zwakker.
                Zo win je ongeveer de helft van je partijen.${recent.length ? ` Laatste ${recent.length}: ${w} gewonnen, ${l} verloren.` : ""}</p>
            <div class="segmented">
                <button data-color="w">Wit</button>
                <button data-color="random" class="active">Willekeurig</button>
                <button data-color="b">Zwart</button>
            </div>
            <button class="btn primary big pl-start">Start partij</button>
        </div>
        <div class="card">
            <h3>Tip voor elke zet</h3>
            <ol class="plain">
                <li>Wat wil de tegenstander met zijn laatste zet?</li>
                <li>Kan ik schaak geven, iets slaan of iets aanvallen?</li>
                <li>Staat er na mijn zet iets ongedekt?</li>
            </ol>
        </div>`
    let colorChoice = "random"
    setup.querySelectorAll(".segmented button").forEach((b) => b.onclick = () => {
        setup.querySelectorAll(".segmented button").forEach((x) => x.classList.remove("active"))
        b.classList.add("active")
        colorChoice = b.dataset.color
    })
    $(".pl-minus", setup).onclick = () => setLevel(st.botLevel - 1)
    $(".pl-plus", setup).onclick = () => setLevel(st.botLevel + 1)
    $(".pl-start", setup).onclick = () => {
        const color = colorChoice === "random" ? (Math.random() < 0.5 ? "w" : "b") : colorChoice
        startGame(color)
    }
}

function setLevel(level) {
    const st = store.get()
    st.botLevel = Math.max(1, Math.min(10, level))
    store.save()
    renderSetup()
}

function startGame(color) {
    game = {color, level: store.get().botLevel, moves: [], result: null, date: store.dayKey()}
    chess = new Chess()
    engine.newGame()
    saveCurrent()
    renderGame()
}

function resume(saved) {
    game = saved
    chess = new Chess()
    for (const san of game.moves) chess.move(san)
    renderGame()
}

function saveCurrent() {
    store.get().currentGame = game && !game.result ? game : null
    store.save()
}

function renderGame() {
    $(".pl-setup", root).hidden = true
    $(".pl-game", root).hidden = false
    $(".pl-end", root).innerHTML = ""
    $(".pl-actions", root).hidden = false
    const botColor = game.color === "w" ? "b" : "w"
    $(".pl-bot-color", root).className = "piece-dot pl-bot-color " + botColor
    $(".pl-bot", root).textContent = `Computer · niveau ${game.level}`
    board.removeMarkers()
    board.removeArrows()
    board.setOrientation(game.color === "w" ? COLOR.white : COLOR.black)
    board.setPosition(chess.fen())
    showLastMove(board, chess.history({verbose: true}).at(-1))
    renderMoves()
    nextTurn()
}

function renderMoves() {
    const h = chess.history()
    const parts = []
    for (let i = 0; i < h.length; i += 2) {
        parts.push(`<span class="mv"><span class="muted">${i / 2 + 1}.</span> ${prettySan(h[i])} ${h[i + 1] ? prettySan(h[i + 1]) : ""}</span>`)
    }
    const box = $(".pl-moves", root)
    box.innerHTML = parts.join(" ")
    box.scrollLeft = box.scrollWidth
}

function nextTurn() {
    if (checkGameOver()) return
    if (chess.turn() === game.color) {
        enableInput(board, chess, game.color, playerMove)
    } else {
        board.disableMoveInput()
        botMove()
    }
}

function playerMove(m) {
    if (!game || game.result || chess.turn() !== game.color) return
    board.disableMoveInput()
    const move = chess.move(m)
    game.moves.push(move.san)
    saveCurrent()
    board.setPosition(chess.fen())
    showLastMove(board, move)
    renderMoves()
    nextTurn()
}

async function botMove() {
    if (thinking) return
    thinking = true
    $(".pl-thinking", root).hidden = false
    const myGame = game
    const lvl = LEVELS[game.level]
    const started = Date.now()
    const fen = chess.fen()
    let uci
    try {
        uci = await pickMove(fen, lvl)
    } finally {
        thinking = false
    }
    // Even "nadenken", zodat de zet niet direct verschijnt.
    const wait = Math.max(0, 500 + Math.random() * 500 - (Date.now() - started))
    await new Promise((r) => setTimeout(r, wait))
    $(".pl-thinking", root).hidden = true
    if (myGame !== game || game.result || chess.fen() !== fen) return
    const move = chess.move(uciToMove(uci))
    game.moves.push(move.san)
    saveCurrent()
    await board.setPosition(chess.fen(), true)
    showLastMove(board, move)
    renderMoves()
    nextTurn()
}

async function pickMove(fen, lvl) {
    const legal = new Chess(fen).moves({verbose: true})
    if (Math.random() < lvl.blunder) {
        const m = legal[Math.floor(Math.random() * legal.length)]
        return m.from + m.to + (m.promotion || "")
    }
    const res = await engine.analyse(fen, {depth: lvl.depth, multipv: lvl.temp > 0 ? 4 : 1})
    if (!res.lines.length || lvl.temp === 0) return res.bestmove
    // Kies uit de beste zetten; slechtere zetten hebben minder kans (softmax).
    const scores = res.lines.map(engine.scoreToCp)
    const top = Math.max(...scores)
    const weights = scores.map((s) => Math.exp((s - top) / lvl.temp))
    let r = Math.random() * weights.reduce((a, b) => a + b, 0)
    for (let i = 0; i < weights.length; i++) {
        r -= weights[i]
        if (r <= 0) return res.lines[i].move
    }
    return res.bestmove
}

function checkGameOver() {
    if (!chess.isGameOver()) return false
    if (chess.isCheckmate()) {
        const won = chess.turn() !== game.color
        endGame(won ? "win" : "loss", won ? "Schaakmat! Jij wint! 🎉" : "Schaakmat. De computer wint.")
    } else if (chess.isStalemate()) {
        endGame("draw", "Pat: remise. Let op: wie geen zet meer heeft maar niet schaak staat, speelt remise!")
    } else if (chess.isThreefoldRepetition()) {
        endGame("draw", "Remise door drie keer dezelfde stelling.")
    } else if (chess.isInsufficientMaterial()) {
        endGame("draw", "Remise: niemand heeft genoeg stukken om mat te geven.")
    } else {
        endGame("draw", "Remise.")
    }
    return true
}

function endGame(result, text) {
    board.disableMoveInput()
    game.result = result
    const st = store.get()
    const before = st.botLevel
    if (result === "win") st.botLevel = Math.min(10, game.level + 1)
    if (result === "loss") st.botLevel = Math.max(1, game.level - 1)
    st.games.push({date: game.date, color: game.color, level: game.level, moves: game.moves, result})
    if (st.games.length > 30) st.games.splice(0, st.games.length - 30)
    store.today().games++
    saveCurrent()
    const levelText = st.botLevel > before ? `De computer gaat naar niveau ${st.botLevel}.`
        : st.botLevel < before ? `De computer gaat terug naar niveau ${st.botLevel}.` : ""
    const index = st.games.length - 1
    $(".pl-actions", root).hidden = true
    $(".pl-end", root).innerHTML = `
        <div class="card hero">
            <h2>${text}</h2>
            <p class="muted">${levelText}</p>
            ${game.moves.length >= 4 ? `<button class="btn primary big pl-review">🔍 Bekijk mijn fouten</button>` : ""}
            <button class="btn secondary big pl-new">Nieuwe partij</button>
        </div>`
    const rv = $(".pl-review", root)
    if (rv) rv.onclick = () => onReview(index)
    $(".pl-new", root).onclick = () => {
        game = null
        renderSetup()
    }
    if (result === "win") toast("Gewonnen!")
}
