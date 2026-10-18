// Dagelijkse puzzels met gespreide herhaling.

import {createPuzzlePlayer} from "./puzzle-player.js"
import * as store from "./storage.js"
import {$, toast} from "./ui.js"

const SESSION_SIZE = 10
const MAX_REVIEWS = 5

let all = null          // [{id, fen, moves, rating, themes}]
let byId = null
let root = null
let player = null
let running = false

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

export function shuffle(a) {
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
        <div class="pz-run" hidden></div>
        <div class="pz-summary card-list" hidden></div>`
    player = createPuzzlePlayer($(".pz-run", root), {
        onResult: (puzzle, success) => {
            const s = store.get().session
            s.results[s.index] = success
            s.index++
            store.save()
            player.setDots(dots())
            player.setNextLabel(s.index >= s.ids.length ? "Klaar ›" : "Volgende ›")
        },
        onNext: () => {
            const s = store.get().session
            if (s.index >= s.ids.length) finishSession()
            else startPuzzle()
        },
    })
}

export async function show() {
    const st = store.get()
    if (st.session && st.session.date === store.dayKey() && st.session.index < st.session.ids.length && running) {
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

function dots() {
    const s = store.get().session
    return s.ids.map((id, i) => s.results[i] ?? null)
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
    running = true
    player.play(puzzle, {label: `puzzel ${s.index + 1} van ${s.ids.length}`, dots: dots()})
}

function finishSession() {
    const st = store.get()
    const s = st.session
    running = false
    player.stop()
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
