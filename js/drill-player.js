// Oefenstelling tegen de computer: zet mat binnen een maximaal aantal zetten.
// Stockfish verdedigt op volle sterkte, zodat je de techniek echt moet beheersen.

import {Chess} from "../vendor/chess.js/chess.js"
import {createBoard, enableInput, showLastMove, uciToMove, COLOR, ARROW_TYPE} from "./board.js"
import * as engine from "./engine.js"
import {$} from "./ui.js"

const VALUE = {p: 1, n: 3, b: 3, r: 5, q: 9, k: 0}

function material(chess, color) {
    return chess.board().flat().filter((sq) => sq && sq.color === color).reduce((sum, sq) => sum + VALUE[sq.type], 0)
}

/** onResult(success) na afloop; onNext() bij "Volgende". */
export function createDrillPlayer(container, {onResult, onNext}) {
    container.innerHTML = `
        <div class="pz-top">
            <div class="pz-dots"></div>
            <div class="dr-title center"></div>
            <div class="dr-count center muted"></div>
        </div>
        <div class="board-wrap"><div class="board"></div></div>
        <div class="button-row">
            <button class="btn secondary dr-hint">💡 Tip</button>
            <button class="btn secondary dr-restart">↺ Opnieuw</button>
            <button class="btn primary dr-next" hidden>Volgende ›</button>
        </div>
        <div class="pz-feedback"></div>`
    const board = createBoard($(".board", container))
    let cur = null

    const setFeedback = (kind, html) => {
        $(".pz-feedback", container).innerHTML = `<div class="feedback ${kind}">${html}</div>`
    }

    function play(drill, {dots = ""} = {}) {
        const chess = new Chess(drill.fen)
        const color = chess.turn()
        cur = {drill, chess, color, moves: 0, done: false, startMaterial: material(chess, color)}
        $(".pz-dots", container).innerHTML = dots
        $(".dr-title", container).innerHTML = `<b>${drill.title}</b>`
        $(".dr-next", container).hidden = true
        $(".dr-hint", container).hidden = false
        $(".dr-restart", container).hidden = false
        updateCount()
        setFeedback("", `Jij speelt met ${color === "w" ? "wit" : "zwart"}. De computer verdedigt zo goed mogelijk. Lukt het binnen ${drill.maxMoves} zetten?`)
        board.removeArrows()
        board.removeMarkers()
        board.setOrientation(color === "w" ? COLOR.white : COLOR.black)
        board.setPosition(drill.fen)
        engine.newGame()
        enableInput(board, chess, color, playerMove)
    }

    function updateCount() {
        $(".dr-count", container).textContent = `Zet ${cur.moves} van maximaal ${cur.drill.maxMoves}`
    }

    async function playerMove(m) {
        if (!cur || cur.done) return
        const mine = cur
        const {chess} = cur
        board.disableMoveInput()
        board.removeArrows()
        const move = chess.move(m)
        cur.moves++
        updateCount()
        board.setPosition(chess.fen())
        showLastMove(board, move)
        if (checkEnd()) return
        const res = await engine.analyse(chess.fen(), {depth: 10})
        if (mine !== cur || !res.bestmove) return
        const reply = chess.move(uciToMove(res.bestmove))
        await board.setPosition(chess.fen(), true)
        showLastMove(board, reply)
        if (checkEnd()) return
        enableInput(board, chess, cur.color, playerMove)
    }

    function checkEnd() {
        const {chess, drill} = cur
        if (chess.isCheckmate()) return end(true, `Schaakmat in ${cur.moves} zetten! Je beheerst deze techniek.`)
        if (chess.isStalemate()) return end(false, "Pat: de koning staat niet schaak maar kan geen kant op. Dat is remise. Laat de koning altijd een veld over tot je mat geeft.")
        if (material(chess, cur.color) < cur.startMaterial) return end(false, "Je bent materiaal kwijtgeraakt. Let op: staat je stuk na je zet gedekt, of naast de vijandelijke koning?")
        if (chess.isDraw()) return end(false, "Remise. Probeer het opnieuw.")
        if (cur.moves >= drill.maxMoves && chess.turn() === cur.color) return end(false, `Het is niet gelukt binnen ${drill.maxMoves} zetten. Lees de stappen in de uitleg nog eens en probeer het opnieuw.`)
        return false
    }

    function end(success, text) {
        cur.done = true
        board.disableMoveInput()
        setFeedback(success ? "good" : "bad", `<b>${success ? "✅ Gelukt!" : "❌ Nog niet gelukt"}</b><p>${text}</p>`)
        $(".dr-hint", container).hidden = true
        $(".dr-restart", container).hidden = true
        $(".dr-next", container).hidden = false
        onResult(success)
        return true
    }

    $(".dr-hint", container).onclick = async () => {
        if (!cur || cur.done || cur.chess.turn() !== cur.color) return
        const mine = cur
        setFeedback("", "💡 Even denken…")
        const res = await engine.analyse(cur.chess.fen(), {depth: 14})
        if (mine !== cur || !res.bestmove) return
        board.removeArrows()
        board.addArrow(ARROW_TYPE.success, res.bestmove.slice(0, 2), res.bestmove.slice(2, 4))
        setFeedback("", "💡 De groene pijl toont de beste zet. Probeer te begrijpen <b>waarom</b>: welk veld neemt hij de koning af?")
    }
    $(".dr-restart", container).onclick = () => cur && play(cur.drill, {dots: $(".pz-dots", container).innerHTML})
    $(".dr-next", container).onclick = () => onNext()

    return {
        play,
        stop: () => {
            cur = null
            board.disableMoveInput()
        },
    }
}
