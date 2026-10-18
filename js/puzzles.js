// Dagelijkse puzzels met gespreide herhaling.

import {Chess} from "../vendor/chess.js/chess.js"
import {createBoard, enableInput, showLastMove, uciToMove, COLOR, MARKER_TYPE, ARROW_TYPE} from "./board.js"
import * as store from "./storage.js"
import {THEMES, mainTheme, trackedThemes} from "./themes.js"
import {$, el, toast} from "./ui.js"

const SESSION_SIZE = 10
const MAX_REVIEWS = 5
const INTERVALS = [1, 3, 7, 14, 30]   // dagen tot de volgende herhaling

let all = null          // [{id, fen, moves, rating, themes}]
let byId = null
let board = null
let root = null

// Toestand van de huidige puzzel
let cur = null

export async function loadPuzzles() {
    if (all) return all
    const res = await fetch("data/puzzles.json")
    if (!res.ok) throw new Error("Geen puzzels gevonden")
    const data = await res.json()
    all = data.puzzles.map(([id, fen, moves, rating, themes]) => ({id, fen, moves: moves.split(" "), rating, themes}))
    byId = new Map(all.map((p) => [p.id, p]))
    return all
}

export function dueCount() {
    const today = store.dayKey()
    return Object.values(store.get().puzzles).filter((p) => p.due && p.due <= today).length
}

function shuffle(a) {
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]]
    }
    return a
}

function buildSession() {
    const st = store.get()
    const today = store.dayKey()
    const reviews = Object.entries(st.puzzles)
        .filter(([id, p]) => p.due && p.due <= today && byId.has(id))
        .sort((a, b) => a[1].due.localeCompare(b[1].due))
        .slice(0, MAX_REVIEWS)
        .map(([id]) => id)
    const need = SESSION_SIZE - reviews.length
    const r = st.puzzleRating
    let candidates = []
    for (let range = 100; range <= 800 && candidates.length < need * 3; range += 100) {
        candidates = all.filter((p) => !st.puzzles[p.id] && Math.abs(p.rating - r) <= range)
    }
    const fresh = shuffle(candidates).slice(0, need).sort((a, b) => a.rating - b.rating).map((p) => p.id)
    // Begin met een nieuwe (makkelijkste) puzzel, herhalingen ertussendoor.
    const ids = fresh.slice(0, 1)
    const rest = shuffle([...fresh.slice(1), ...reviews])
    return {date: today, ids: ids.concat(rest), index: 0, results: [], ratingStart: r}
}

export function init(container) {
    root = container
    root.innerHTML = `
        <div class="pz-start card-list"></div>
        <div class="pz-run" hidden>
            <div class="pz-top">
                <div class="pz-dots"></div>
                <div class="pz-turn"></div>
            </div>
            <div class="board-wrap"><div class="board"></div></div>
            <div class="button-row">
                <button class="btn secondary pz-hint">💡 Hint</button>
                <button class="btn secondary pz-solution">Oplossing</button>
                <button class="btn primary pz-next" hidden>Volgende ›</button>
            </div>
            <div class="pz-feedback"></div>
        </div>
        <div class="pz-summary card-list" hidden></div>`
    board = createBoard($(".board", root))
    $(".pz-hint", root).onclick = hint
    $(".pz-solution", root).onclick = showSolution
    $(".pz-next", root).onclick = next
}

export async function show() {
    const st = store.get()
    if (st.session && st.session.date === store.dayKey() && st.session.index < st.session.ids.length && cur) {
        return  // sessie loopt nog, laat hem staan
    }
    renderStart()
}

async function renderStart() {
    const start = $(".pz-start", root)
    $(".pz-run", root).hidden = true
    $(".pz-summary", root).hidden = true
    start.hidden = false
    try {
        await loadPuzzles()
    } catch (e) {
        start.innerHTML = `<div class="card"><h2>Puzzels nog niet beschikbaar</h2>
            <p>Het puzzelbestand ontbreekt nog. Probeer het later opnieuw.</p></div>`
        return
    }
    const st = store.get()
    const day = store.today()
    const due = dueCount()
    const open = st.session && st.session.date === store.dayKey() && st.session.index < st.session.ids.length
    start.innerHTML = `
        <div class="card hero">
            <h2>${day.session ? "Dagdoel gehaald ✅" : "Dagelijkse puzzels"}</h2>
            <p>${day.session
                ? "Goed bezig! Wil je nog meer oefenen? Een extra sessie mag altijd."
                : `${SESSION_SIZE} puzzels op jouw niveau. Duurt ongeveer 10 minuten.`}</p>
            <p class="muted">${due > 0 ? `${due} puzzel${due === 1 ? "" : "s"} om te herhalen` : "Geen herhalingen voor vandaag"}
                · puzzelrating ${Math.round(st.puzzleRating)}</p>
            <button class="btn primary big pz-go">${open ? "Verder met sessie" : day.session ? "Nog een sessie" : "Start"}</button>
        </div>
        <div class="card">
            <h3>Zo werkt het</h3>
            <ul class="plain">
                <li>De tegenstander doet eerst een zet. Daarna ben jij aan de beurt.</li>
                <li>Zoek de <b>beste</b> zet: kijk eerst naar schaakjes, slagzetten en dreigingen.</li>
                <li>Fout of hint gebruikt? Dan komt de puzzel terug na 1, 3, 7, 14 en 30 dagen, tot je hem kent.</li>
            </ul>
        </div>`
    $(".pz-go", start).onclick = () => {
        if (!open) {
            st.session = buildSession()
            store.save()
        }
        startPuzzle()
    }
}

function renderDots() {
    const s = store.get().session
    $(".pz-dots", root).innerHTML = s.ids.map((id, i) => {
        const r = s.results[i]
        const cls = r === true ? "ok" : r === false ? "fail" : i === s.index ? "now" : ""
        return `<span class="dot ${cls}"></span>`
    }).join("")
}

function startPuzzle() {
    const s = store.get().session
    if (s.index >= s.ids.length) return finishSession()
    const puzzle = byId.get(s.ids[s.index])
    if (!puzzle) {
        s.index++
        return startPuzzle()
    }
    $(".pz-start", root).hidden = true
    $(".pz-summary", root).hidden = true
    $(".pz-run", root).hidden = false
    $(".pz-next", root).hidden = true
    $(".pz-hint", root).hidden = false
    $(".pz-solution", root).hidden = false
    $(".pz-feedback", root).innerHTML = ""
    renderDots()

    const chess = new Chess(puzzle.fen)
    // De eerste zet is van de tegenstander; de speler heeft de andere kleur.
    const color = chess.turn() === "w" ? "b" : "w"
    cur = {puzzle, chess, color, idx: 0, failed: false, hints: 0, done: false}
    $(".pz-turn", root).innerHTML = `<span class="piece-dot ${color}"></span>
        Jij speelt met <b>${color === "w" ? "wit" : "zwart"}</b> · puzzel ${s.index + 1} van ${s.ids.length}`
    board.disableMoveInput()
    board.removeArrows()
    board.removeMarkers()
    board.setOrientation(color === "w" ? COLOR.white : COLOR.black)
    board.setPosition(puzzle.fen)
    setTimeout(() => opponentMove(), 600)
}

function opponentMove() {
    const {chess, puzzle} = cur
    const mine = cur
    const move = chess.move(uciToMove(puzzle.moves[cur.idx]))
    cur.idx++
    board.setPosition(chess.fen(), true).then(() => {
        if (mine !== cur) return
        showLastMove(board, move)
        if (cur.idx === 1) setFeedback("", "Vind de beste zet.")
        enableInput(board, chess, cur.color, playerMove)
    })
}

function playerMove(m) {
    if (!cur || cur.done) return
    const {chess, puzzle} = cur
    board.disableMoveInput()
    const expected = puzzle.moves[cur.idx]
    const move = chess.move(m)
    const uci = move.from + move.to + (move.promotion || "")
    board.setPosition(chess.fen())
    showLastMove(board, move)
    // Een andere zet die óók mat geeft, rekenen we goed (net als Lichess).
    if (uci === expected || chess.isCheckmate()) {
        cur.idx++
        if (cur.idx >= puzzle.moves.length || chess.isCheckmate()) return solved()
        setFeedback("good", "Goed zo! Ga door…")
        setTimeout(opponentMove, 450)
    } else {
        cur.failed = true
        setFeedback("bad", "Dat is niet de beste zet. Probeer het nog eens.")
        $(".board-wrap", root).classList.add("shake")
        setTimeout(() => {
            $(".board-wrap", root).classList.remove("shake")
            chess.undo()
            board.setPosition(chess.fen(), true)
            showLastMove(board, chess.history({verbose: true}).at(-1))
            enableInput(board, chess, cur.color, playerMove)
        }, 700)
    }
}

function setFeedback(kind, html) {
    $(".pz-feedback", root).innerHTML = `<div class="feedback ${kind}">${html}</div>`
}

function hint() {
    if (!cur || cur.done) return
    cur.hints++
    const theme = mainTheme(cur.puzzle.themes)
    const from = cur.puzzle.moves[cur.idx].slice(0, 2)
    if (cur.hints === 1 && theme) {
        setFeedback("", `💡 Tip: dit is een <b>${THEMES[theme].name.toLowerCase()}</b>. ${THEMES[theme].tip}`)
    } else {
        board.removeMarkers(MARKER_TYPE.circlePrimary)
        board.addMarker(MARKER_TYPE.circlePrimary, from)
        setFeedback("", "💡 Tip: zet met het omcirkelde stuk.")
    }
}

function showSolution() {
    if (!cur || cur.done) return
    cur.failed = true
    cur.done = true
    board.disableMoveInput()
    const mine = cur
    const step = () => {
        if (mine !== cur) return
        if (cur.idx >= cur.puzzle.moves.length) return finishPuzzle(false)
        const m = uciToMove(cur.puzzle.moves[cur.idx])
        const move = cur.chess.move(m)
        board.removeArrows()
        board.addArrow(ARROW_TYPE.success, move.from, move.to)
        board.setPosition(cur.chess.fen(), true)
        showLastMove(board, move)
        cur.idx++
        setTimeout(step, 1100)
    }
    step()
}

function solved() {
    cur.done = true
    finishPuzzle(!cur.failed && cur.hints === 0)
}

function finishPuzzle(success) {
    const {puzzle} = cur
    cur.done = true
    record(puzzle, success)
    const s = store.get().session
    s.results[s.index] = success
    s.index++
    store.save()
    renderDots()
    const theme = mainTheme(puzzle.themes)
    const t = theme && THEMES[theme]
    const headline = success ? "✅ Opgelost!" : cur.hints > 0 && !cur.failed ? "✔️ Opgelost met hint" : "❌ Niet in één keer goed"
    const later = success ? "" : `<p class="muted">Deze puzzel komt morgen terug om te herhalen.</p>`
    setFeedback(success ? "good" : "bad", `<b>${headline}</b>
        ${t ? `<div class="theme-card"><div class="theme-name">${t.name}</div><p>${t.uitleg}</p><p class="muted">👀 ${t.tip}</p></div>` : ""}
        ${later}`)
    $(".pz-hint", root).hidden = true
    $(".pz-solution", root).hidden = true
    $(".pz-next", root).hidden = false
    $(".pz-next", root).textContent = s.index >= s.ids.length ? "Klaar ›" : "Volgende ›"
}

function record(puzzle, success) {
    const st = store.get()
    const today = store.dayKey()
    const p = st.puzzles[puzzle.id] || {box: 0, fails: 0, seen: 0}
    const isReview = !!p.due
    p.seen++
    if (success) {
        if (isReview) {
            p.box++
            if (p.box >= INTERVALS.length) delete p.due   // geleerd!
            else p.due = store.addDays(today, INTERVALS[p.box])
        }
    } else {
        p.fails++
        p.box = 0
        p.due = store.addDays(today, INTERVALS[0])
    }
    st.puzzles[puzzle.id] = p

    // Rating alleen bijwerken bij nieuwe puzzels (Elo).
    if (!isReview) {
        const expected = 1 / (1 + Math.pow(10, (puzzle.rating - st.puzzleRating) / 400))
        const k = st.puzzleCount < 30 ? 40 : 20
        st.puzzleRating = Math.max(400, st.puzzleRating + k * ((success ? 1 : 0) - expected))
    }
    st.puzzleCount++
    for (const t of trackedThemes(puzzle.themes)) {
        const stat = st.themes[t] || {ok: 0, fail: 0}
        success ? stat.ok++ : stat.fail++
        st.themes[t] = stat
    }
    const day = store.today()
    day.puzzles++
    if (success) day.correct++
    store.save()
}

function next() {
    const s = store.get().session
    if (s.index >= s.ids.length) finishSession()
    else startPuzzle()
}

function finishSession() {
    const st = store.get()
    const s = st.session
    cur = null
    store.today().session = true
    store.save()
    const good = s.results.filter(Boolean).length
    const diff = Math.round(st.puzzleRating - s.ratingStart)
    $(".pz-run", root).hidden = true
    const sum = $(".pz-summary", root)
    sum.hidden = false
    sum.innerHTML = `
        <div class="card hero">
            <h2>Sessie klaar! 🎉</h2>
            <p class="big-number">${good} / ${s.ids.length}</p>
            <p>in één keer goed</p>
            <p class="muted">Puzzelrating ${Math.round(st.puzzleRating)} (${diff >= 0 ? "+" : ""}${diff})
                · reeks ${store.streak()} dag${store.streak() === 1 ? "" : "en"}</p>
            <button class="btn primary big pz-home">Terug</button>
        </div>`
    $(".pz-home", sum).onclick = renderStart
    toast("Dagdoel gehaald!")
}
