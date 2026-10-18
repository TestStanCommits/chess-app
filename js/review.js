// Partij-review: Stockfish zoekt je 3 grootste fouten en legt ze kort uit.

import {Chess} from "../vendor/chess.js/chess.js"
import {createBoard, showLastMove, uciToMove, prettySan, COLOR, ARROW_TYPE} from "./board.js"
import * as engine from "./engine.js"
import * as store from "./storage.js"
import {explain} from "./explain.js"
import {$} from "./ui.js"

const DEPTH = 11
const MIN_LOSS = 8   // minimaal verlies in winstkans (%) om als fout te tellen

let root = null
let board = null
let onBack = null
let token = 0

export function init(container, {back}) {
    onBack = back
    root = container
    root.innerHTML = `
        <div class="rv-head"><button class="btn link rv-back">‹ Terug</button></div>
        <div class="board-wrap"><div class="board"></div></div>
        <div class="rv-body"></div>`
    board = createBoard($(".board", root))
    $(".rv-back", root).onclick = () => {
        token++
        onBack()
    }
}

/** Analyseert partij nummer `index` uit de opgeslagen partijen. */
export async function open(index) {
    const myToken = ++token
    const g = store.get().games[index]
    const body = $(".rv-body", root)
    board.removeArrows()
    board.removeMarkers()
    board.setOrientation(g.color === "w" ? COLOR.white : COLOR.black)

    const chess = new Chess()
    const fens = [chess.fen()]
    const moves = []
    for (const san of g.moves) {
        moves.push(chess.move(san))
        fens.push(chess.fen())
    }
    board.setPosition(chess.fen())

    let mistakes = g.review
    if (!mistakes) {
        body.innerHTML = `<div class="card"><h3>Stockfish bekijkt je partij…</h3>
            <div class="progress"><div class="progress-bar" style="width:0%"></div></div>
            <p class="muted">Dit duurt meestal een halve minuut.</p></div>`
        mistakes = await analyseGame(g, fens, moves, (pct) => {
            if (myToken === token) $(".progress-bar", body).style.width = pct + "%"
        }, myToken)
        if (!mistakes) return    // weggenavigeerd
        g.review = mistakes
        store.save()
    }
    if (myToken !== token) return
    render(g, mistakes)
}

async function analyseGame(g, fens, moves, progress, myToken) {
    // Analyse van elke stelling vóór en ná een zet van de speler.
    const needed = new Set()
    moves.forEach((m, i) => {
        if (m.color === g.color) {
            needed.add(i)
            needed.add(i + 1)
        }
    })
    const results = {}
    let done = 0
    for (const i of [...needed].sort((a, b) => a - b)) {
        if (myToken !== token) return null
        const c = new Chess(fens[i])
        if (c.isGameOver()) {
            results[i] = c.isCheckmate() ? {line: {mate: 0}, cp: -10000} : {line: null, cp: 0}
        } else {
            const res = await engine.analyse(fens[i], {depth: DEPTH})
            results[i] = {line: res.lines[0], cp: engine.scoreToCp(res.lines[0])}
        }
        progress(Math.round(++done / needed.size * 100))
    }
    const found = []
    moves.forEach((m, i) => {
        if (m.color !== g.color) return
        const before = results[i]
        const after = results[i + 1]
        if (!before.line || !after) return
        const played = m.from + m.to + (m.promotion || "")
        if (played === before.line.move) return
        const cpBefore = before.cp
        const cpAfter = -after.cp
        const loss = engine.winChance(cpBefore) - engine.winChance(cpAfter)
        if (loss < MIN_LOSS) return
        found.push({
            ply: i,
            fen: fens[i],
            san: m.san,
            from: m.from,
            to: m.to,
            best: before.line.move,
            reply: after.line && after.line.move ? after.line.move : null,
            loss,
            text: explain({
                fen: fens[i],
                played: m,
                bestLine: before.line,
                replyLine: after.line && after.line.mate !== 0 ? after.line : null,
                cpLoss: Math.max(0, Math.min(cpBefore, 2000) - Math.max(cpAfter, -2000)),
            }),
        })
    })
    const playerMoves = moves.filter((m) => m.color === g.color).length
    found.sort((a, b) => b.loss - a.loss)
    return {
        top: found.slice(0, 3),
        blunders: found.filter((f) => f.loss >= 30).length,
        errors: found.filter((f) => f.loss >= 20 && f.loss < 30).length,
        playerMoves,
    }
}

function label(loss) {
    if (loss >= 30) return {text: "Blunder", mark: "??", cls: "blunder"}
    if (loss >= 20) return {text: "Fout", mark: "?", cls: "mistake"}
    return {text: "Onnauwkeurig", mark: "?!", cls: "inaccuracy"}
}

function render(g, review) {
    const body = $(".rv-body", root)
    const resultText = {win: "Gewonnen", loss: "Verloren", draw: "Remise"}[g.result]
    if (review.top.length === 0) {
        body.innerHTML = `<div class="card hero"><h2>Sterk gespeeld! 💪</h2>
            <p>Stockfish vond geen grote fouten in je ${review.playerMoves} zetten.</p></div>`
        return
    }
    body.innerHTML = `
        <p class="muted center">${resultText} tegen niveau ${g.level} · ${review.playerMoves} zetten ·
            ${review.blunders} blunder${review.blunders === 1 ? "" : "s"}, ${review.errors} fout${review.errors === 1 ? "" : "en"}</p>
        <div class="segmented rv-tabs">${review.top.map((m, i) => `<button data-i="${i}">Fout ${i + 1}</button>`).join("")}</div>
        <div class="rv-detail"></div>`
    const tabs = body.querySelectorAll(".rv-tabs button")
    tabs.forEach((b) => b.onclick = () => {
        tabs.forEach((x) => x.classList.remove("active"))
        b.classList.add("active")
        showMistake(review.top[+b.dataset.i])
    })
    tabs[0].click()
}

function showMistake(m) {
    const l = label(m.loss)
    const moveNo = Math.floor(m.ply / 2) + 1
    const c = new Chess(m.fen)
    const best = c.move(uciToMove(m.best))
    $(".rv-detail", root).innerHTML = `
        <div class="card">
            <div class="rv-move"><span class="tag ${l.cls}">${l.text}</span>
                Zet ${moveNo}: je speelde <b>${prettySan(m.san)}</b>${l.mark}</div>
            <p>${m.text}</p>
            <p class="legend"><span class="sw red"></span> jouw zet <span class="sw green"></span> betere zet: <b>${prettySan(best.san)}</b></p>
            <div class="button-row">
                <button class="btn secondary rv-mine">Jouw zet</button>
                <button class="btn secondary rv-best">Betere zet</button>
                <button class="btn secondary rv-reset">↺</button>
            </div>
        </div>`
    const reset = () => {
        board.setPosition(m.fen)
        board.removeArrows()
        board.removeMarkers()
        board.addArrow(ARROW_TYPE.danger, m.from, m.to)
        board.addArrow(ARROW_TYPE.success, m.best.slice(0, 2), m.best.slice(2, 4))
    }
    reset()
    $(".rv-reset", root).onclick = reset
    $(".rv-mine", root).onclick = () => {
        reset()
        board.removeArrows()
        const c2 = new Chess(m.fen)
        const mv = c2.move(m.san)
        board.setPosition(c2.fen(), true)
        showLastMove(board, mv)
        if (!m.reply) return
        // Laat zien hoe de tegenstander je straft.
        const fenAfter = c2.fen()
        setTimeout(() => {
            if (board.getPosition() !== fenAfter.split(" ")[0]) return
            const r = c2.move(uciToMove(m.reply))
            board.setPosition(c2.fen(), true)
            showLastMove(board, r)
            board.addArrow(ARROW_TYPE.danger, r.from, r.to)
        }, 900)
    }
    $(".rv-best", root).onclick = () => {
        reset()
        board.removeArrows()
        const c2 = new Chess(m.fen)
        const mv = c2.move(uciToMove(m.best))
        board.setPosition(c2.fen(), true)
        showLastMove(board, mv)
    }
}
