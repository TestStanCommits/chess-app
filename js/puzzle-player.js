// Herbruikbare puzzelspeler: gebruikt door de dagelijkse puzzels en door de lessen.

import {Chess} from "../vendor/chess.js/chess.js"
import {createBoard, enableInput, showLastMove, uciToMove, COLOR, MARKER_TYPE, ARROW_TYPE} from "./board.js"
import * as store from "./storage.js"
import {THEMES, mainTheme, trackedThemes} from "./themes.js"
import {$} from "./ui.js"

const INTERVALS = [1, 3, 7, 14, 30]   // dagen tot de volgende herhaling

/**
 * Maakt een puzzelspeler in `container`.
 * onResult(puzzle, success): na afloop van een puzzel (resultaat is al opgeslagen)
 * onNext(): als de speler op "Volgende" tikt
 */
export function createPuzzlePlayer(container, {onResult, onNext}) {
    container.innerHTML = `
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
        <div class="pz-feedback"></div>`
    const board = createBoard($(".board", container))
    let cur = null

    const setFeedback = (kind, html) => {
        $(".pz-feedback", container).innerHTML = `<div class="feedback ${kind}">${html}</div>`
    }

    function play(puzzle, {label = "", dots = null, nextLabel = "Volgende ›"} = {}) {
        $(".pz-next", container).hidden = true
        $(".pz-next", container).textContent = nextLabel
        $(".pz-hint", container).hidden = false
        $(".pz-solution", container).hidden = false
        $(".pz-feedback", container).innerHTML = ""
        setDots(dots)
        const chess = new Chess(puzzle.fen)
        // De eerste zet is van de tegenstander; de speler heeft de andere kleur.
        const color = chess.turn() === "w" ? "b" : "w"
        cur = {puzzle, chess, color, idx: 0, failed: false, hints: 0, done: false}
        $(".pz-turn", container).innerHTML = `<span class="piece-dot ${color}"></span>
            Jij speelt met <b>${color === "w" ? "wit" : "zwart"}</b>${label ? " · " + label : ""}`
        board.disableMoveInput()
        board.removeArrows()
        board.removeMarkers()
        board.setOrientation(color === "w" ? COLOR.white : COLOR.black)
        board.setPosition(puzzle.fen)
        const mine = cur
        setTimeout(() => mine === cur && opponentMove(), 600)
    }

    function setDots(results) {
        // results: array met true/false/null per puzzel; de eerste null is de huidige
        if (!results) {
            $(".pz-dots", container).innerHTML = ""
            return
        }
        const now = results.indexOf(null)
        $(".pz-dots", container).innerHTML = results.map((r, i) => {
            const cls = r === true ? "ok" : r === false ? "fail" : i === now ? "now" : ""
            return `<span class="dot ${cls}"></span>`
        }).join("")
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
            if (cur.idx >= puzzle.moves.length || chess.isCheckmate()) return finish(!cur.failed && cur.hints === 0)
            setFeedback("good", "Goed zo! Ga door…")
            setTimeout(opponentMove, 450)
        } else {
            cur.failed = true
            setFeedback("bad", "Dat is niet de beste zet. Probeer het nog eens.")
            $(".board-wrap", container).classList.add("shake")
            const mine = cur
            setTimeout(() => {
                $(".board-wrap", container).classList.remove("shake")
                if (mine !== cur) return
                chess.undo()
                board.setPosition(chess.fen(), true)
                showLastMove(board, chess.history({verbose: true}).at(-1))
                enableInput(board, chess, cur.color, playerMove)
            }, 700)
        }
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
            if (cur.idx >= cur.puzzle.moves.length) return finish(false)
            const move = cur.chess.move(uciToMove(cur.puzzle.moves[cur.idx]))
            board.removeArrows()
            board.addArrow(ARROW_TYPE.success, move.from, move.to)
            board.setPosition(cur.chess.fen(), true)
            showLastMove(board, move)
            cur.idx++
            setTimeout(step, 1100)
        }
        step()
    }

    function finish(success) {
        const {puzzle} = cur
        cur.done = true
        recordPuzzle(puzzle, success)
        const theme = mainTheme(puzzle.themes)
        const t = theme && THEMES[theme]
        const headline = success ? "✅ Opgelost!" : cur.hints > 0 && !cur.failed ? "✔️ Opgelost met hint" : "❌ Niet in één keer goed"
        const later = success ? "" : `<p class="muted">Deze puzzel komt morgen terug om te herhalen.</p>`
        setFeedback(success ? "good" : "bad", `<b>${headline}</b>
            ${t ? `<div class="theme-card"><div class="theme-name">${t.name}</div><p>${t.uitleg}</p><p class="muted">👀 ${t.tip}</p></div>` : ""}
            ${later}`)
        $(".pz-hint", container).hidden = true
        $(".pz-solution", container).hidden = true
        $(".pz-next", container).hidden = false
        onResult(puzzle, success)
    }

    $(".pz-hint", container).onclick = hint
    $(".pz-solution", container).onclick = showSolution
    $(".pz-next", container).onclick = () => onNext()

    return {
        play,
        setDots,
        setNextLabel: (text) => $(".pz-next", container).textContent = text,
        stop: () => {
            cur = null
            board.disableMoveInput()
        },
    }
}

/** Slaat het resultaat op: gespreide herhaling, puzzelrating en thema-statistiek. */
export function recordPuzzle(puzzle, success) {
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
