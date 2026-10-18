// Leertraject: lessen met uitleg → uitgewerkt voorbeeld → oefenen → beheersingstoets.

import {Chess} from "../vendor/chess.js/chess.js"
import {createBoard, showLastMove, prettySan, ARROW_TYPE} from "./board.js"
import {createPuzzlePlayer} from "./puzzle-player.js"
import {createDrillPlayer} from "./drill-player.js"
import {loadPuzzles, shuffle} from "./puzzles.js"
import {PARTS, LESSONS, METHOD, BOOKS} from "./lessons-data.js"
import * as store from "./storage.js"
import {$, toast} from "./ui.js"

const PASS = 0.8   // beheerst bij 80% goed

let root = null
let exampleBoard = null
let puzzlePlayer = null
let drillPlayer = null
let lesson = null     // huidige les
let practice = null   // {items, index, results}

/** {{Nf3}} → ♘f3 in tekst. */
function fmt(html) {
    return (html || "").replace(/\{\{(.+?)\}\}/g, (_, san) => `<b class="san">${prettySan(san)}</b>`)
}

export function init(container) {
    root = container
    root.innerHTML = `
        <div class="ls-home card-list"></div>
        <div class="ls-method card-list" hidden></div>
        <div class="ls-lesson" hidden>
            <div class="ls-head">
                <button class="btn link ls-back">‹ Lessen</button>
                <div class="ls-steps">
                    <button data-step="uitleg">1 Uitleg</button>
                    <button data-step="voorbeeld">2 Voorbeeld</button>
                    <button data-step="oefenen">3 Oefenen</button>
                </div>
            </div>
            <div class="ls-page ls-uitleg card-list"></div>
            <div class="ls-page ls-voorbeeld">
                <div class="ex-tabs segmented"></div>
                <div class="card ex-text"></div>
                <div class="board-wrap"><div class="board"></div></div>
                <div class="button-row">
                    <button class="btn secondary ex-prev">‹ Terug</button>
                    <button class="btn primary ex-next">Volgende zet ›</button>
                </div>
                <button class="btn primary big ex-practice">Zelf oefenen ›</button>
            </div>
            <div class="ls-page ls-oefenen">
                <div class="pr-puzzle"></div>
                <div class="pr-drill"></div>
                <div class="pr-result card-list"></div>
            </div>
        </div>`
    exampleBoard = createBoard($(".ls-voorbeeld .board", root))
    puzzlePlayer = createPuzzlePlayer($(".pr-puzzle", root), {onResult: (p, ok) => itemDone(ok), onNext: nextItem})
    drillPlayer = createDrillPlayer($(".pr-drill", root), {onResult: itemDone, onNext: nextItem})
    $(".ls-back", root).onclick = () => {
        puzzlePlayer.stop()
        drillPlayer.stop()
        renderHome()
    }
    root.querySelectorAll(".ls-steps button").forEach((b) => b.onclick = () => showStep(b.dataset.step))
}

export function show() {
    if (lesson) return   // een geopende les blijft open
    renderHome()
}

function status(id) {
    return store.get().lessons[id]
}

function nextLesson() {
    return LESSONS.find((l) => !status(l.id)?.passed) || null
}

function renderHome() {
    lesson = null
    $(".ls-lesson", root).hidden = true
    $(".ls-method", root).hidden = true
    const home = $(".ls-home", root)
    home.hidden = false
    const passed = LESSONS.filter((l) => status(l.id)?.passed).length
    const next = nextLesson()
    const nextNo = next ? LESSONS.indexOf(next) + 1 : null
    home.innerHTML = `
        <div class="card hero">
            <h2>Leertraject</h2>
            <p class="muted">${passed} van ${LESSONS.length} lessen beheerst</p>
            <div class="progress"><div class="progress-bar" style="width:${passed / LESSONS.length * 100}%"></div></div>
            ${next ? `<p>Volgende: <b>Les ${nextNo}. ${next.title}</b></p>
                <button class="btn primary big ls-continue">${passed ? "Verder leren" : "Begin met les 1"}</button>`
                : `<p>Je hebt alle lessen beheerst! 🎓 Houd je kennis bij met de dagelijkse puzzels.</p>`}
            <p class="muted small">Dagelijkse routine van 15 minuten: één les (of een herhaling) en daarna de dagelijkse puzzels.</p>
        </div>
        ${PARTS.map((part) => `
            <div class="card">
                <h3>${part.title}</h3>
                <p class="muted small">${part.sub}</p>
                <div class="lesson-list">
                    ${LESSONS.filter((l) => l.part === part.id).map((l) => {
                        const s = status(l.id)
                        const no = LESSONS.indexOf(l) + 1
                        const badge = s?.passed ? `<span class="badge ok">✓ beheerst</span>`
                            : s ? `<span class="badge">${Math.round(s.best * 100)}%</span>`
                            : l === next ? `<span class="badge next">volgende</span>` : ""
                        return `<button class="lesson-row" data-id="${l.id}"><span class="no">${no}</span><span class="lt">${l.title}</span>${badge}</button>`
                    }).join("")}
                </div>
            </div>`).join("")}
        <button class="card method-link">
            <h3>📚 Over deze methode</h3>
            <p class="muted small">De onderwijskundige onderbouwing en de schaakboeken waarop dit traject is gebaseerd.</p>
        </button>`
    const cont = $(".ls-continue", home)
    if (cont) cont.onclick = () => openLesson(next.id)
    home.querySelectorAll(".lesson-row").forEach((b) => b.onclick = () => openLesson(b.dataset.id))
    $(".method-link", home).onclick = renderMethod
    window.scrollTo(0, 0)
}

function renderMethod() {
    $(".ls-home", root).hidden = true
    const m = $(".ls-method", root)
    m.hidden = false
    m.innerHTML = `
        <button class="btn link back-home">‹ Lessen</button>
        <div class="card">
            <h2>Over deze methode</h2>
            <p>Dit leertraject volgt de opbouw van klassieke schaakleerboeken en lesmethodes: <b>één onderwerp per les</b>,
               in een vaste volgorde van eenvoudig naar complex. Elke les heeft dezelfde vier fasen:</p>
            <ol class="plain">
                <li><b>Uitleg</b>: het concept, met een kernregel.</li>
                <li><b>Uitgewerkt voorbeeld</b>: zet voor zet, met toelichting.</li>
                <li><b>Oefenen</b>: opgaven op precies dit thema.</li>
                <li><b>Beheersingstoets</b>: 80% goed = beheerst.</li>
            </ol>
            <p>Die opbouw is niet willekeurig. Hij steunt op deze inzichten uit de leerpsychologie:</p>
        </div>
        ${METHOD.map((x) => `<div class="card"><h3>${x.title}</h3><p>${x.text}</p></div>`).join("")}
        <div class="card">
            <h2>De boeken</h2>
            <p class="muted small">De teksten in deze app zijn zelf geschreven. Deze boeken dienden als didactisch voorbeeld en zijn een aanrader om verder te lezen.</p>
            ${BOOKS.map((b) => `<div class="book"><div><b>${b.title}</b></div><div class="muted small">${b.author}</div><p>${b.text}</p></div>`).join("")}
        </div>`
    $(".back-home", m).onclick = renderHome
    window.scrollTo(0, 0)
}

export function openLesson(id) {
    lesson = LESSONS.find((l) => l.id === id)
    $(".ls-home", root).hidden = true
    $(".ls-method", root).hidden = true
    $(".ls-lesson", root).hidden = false
    renderUitleg()
    showStep("uitleg")
}

function showStep(step) {
    root.querySelectorAll(".ls-steps button").forEach((b) => b.classList.toggle("active", b.dataset.step === step))
    root.querySelectorAll(".ls-page").forEach((p) => p.hidden = !p.classList.contains("ls-" + step))
    if (step !== "oefenen") {
        puzzlePlayer.stop()
        drillPlayer.stop()
    }
    if (step === "voorbeeld") startExample(0)
    if (step === "oefenen") startPractice()
    window.scrollTo(0, 0)
}

// ── 1. Uitleg ──────────────────────────────────────────────

function renderUitleg() {
    const no = LESSONS.indexOf(lesson) + 1
    const part = PARTS.find((p) => p.id === lesson.part)
    const page = $(".ls-uitleg", root)
    page.innerHTML = `
        <div class="card">
            <div class="muted small">${part.title} · Les ${no}</div>
            <h2>${lesson.title}</h2>
            <p class="goal">🎯 <b>Leerdoel:</b> ${lesson.goal}</p>
            ${lesson.uitleg.map(block).join("")}
        </div>
        <div class="card literature"><b>📚 In de boeken</b><p>${lesson.literatuur}</p></div>
        <button class="btn primary big to-example">Bekijk het voorbeeld ›</button>`
    page.querySelectorAll(".diagram").forEach((el) => {
        createBoard(el).setPosition(el.dataset.fen)
    })
    $(".to-example", page).onclick = () => showStep("voorbeeld")
}

function block(b) {
    if (b.p) return `<p>${fmt(b.p)}</p>`
    if (b.rule) return `<div class="rule"><div class="rule-label">Kernregel</div>${fmt(b.rule)}</div>`
    if (b.list) return `<ul class="plain">${b.list.map((x) => `<li>${fmt(x)}</li>`).join("")}</ul>`
    if (b.table) return `<table class="values">${b.table.map(([a, v]) => `<tr><td>${a}</td><td>${v}</td></tr>`).join("")}</table>`
    if (b.board) return `<figure><div class="diagram" data-fen="${b.board.fen}"></div><figcaption>${fmt(b.board.caption)}</figcaption></figure>`
    return ""
}

// ── 2. Uitgewerkt voorbeeld ──────────────────────────────────

let ex = null   // {example, index, step, chess}

function startExample(index) {
    const examples = lesson.voorbeelden
    const tabs = $(".ex-tabs", root)
    tabs.hidden = examples.length < 2
    tabs.innerHTML = examples.map((e, i) => `<button data-i="${i}" class="${i === index ? "active" : ""}">Voorbeeld ${i + 1}</button>`).join("")
    tabs.querySelectorAll("button").forEach((b) => b.onclick = () => startExample(+b.dataset.i))
    const example = examples[index]
    ex = {example, index, step: 0}
    exampleBoard.setOrientation(new Chess(example.fen).turn() === "w" ? "w" : "b")
    renderExampleStep(false)
    $(".ex-prev", root).onclick = () => {
        if (ex.step > 0) {
            ex.step--
            renderExampleStep(false)
        }
    }
    $(".ex-next", root).onclick = () => {
        if (ex.step < ex.example.steps.length) {
            ex.step++
            renderExampleStep(true)
        } else if (ex.index < lesson.voorbeelden.length - 1) {
            startExample(ex.index + 1)
        } else {
            showStep("oefenen")
        }
    }
    $(".ex-practice", root).onclick = () => showStep("oefenen")
}

function renderExampleStep(animated) {
    const {example, step} = ex
    const chess = new Chess(example.fen)
    let last = null
    for (let i = 0; i < step; i++) last = chess.move(example.steps[i].san)
    exampleBoard.setPosition(chess.fen(), animated)
    exampleBoard.removeArrows()
    exampleBoard.removeMarkers()
    showLastMove(exampleBoard, last)
    const arrows = step === 0 ? example.arrows : example.steps[step - 1].arrows
    for (const [from, to, kind] of arrows || []) {
        exampleBoard.addArrow(kind === "success" ? ARROW_TYPE.success : ARROW_TYPE.danger, from, to)
    }
    const total = example.steps.length
    let html
    if (step === 0) {
        html = `<p>${fmt(example.intro)}</p><p class="muted small">Tik op <b>Volgende zet</b> om de stappen te volgen.</p>`
    } else {
        const s = example.steps[step - 1]
        const moveNo = chess.history().length
        const label = `${Math.ceil(moveNo / 2)}${moveNo % 2 === 1 ? "." : "…"} ${prettySan(s.san)}`
        html = `<div class="muted small">Stap ${step} van ${total}</div><p><b class="san">${label}</b> ${fmt(s.text)}</p>`
    }
    $(".ex-text", root).innerHTML = html
    $(".ex-prev", root).disabled = step === 0
    const last2 = step >= total
    $(".ex-next", root).textContent = !last2 ? "Volgende zet ›"
        : ex.index < lesson.voorbeelden.length - 1 ? "Volgend voorbeeld ›" : "Zelf oefenen ›"
    $(".ex-practice", root).hidden = !last2 || ex.index < lesson.voorbeelden.length - 1
}

// ── 3. Oefenen en beheersingstoets ─────────────────────────────

async function startPractice() {
    const result = $(".pr-result", root)
    result.innerHTML = ""
    $(".pr-puzzle", root).hidden = true
    $(".pr-drill", root).hidden = true
    const ex = lesson.oefeningen
    let items = []
    if (ex.drills) {
        items = ex.drills.map((d) => ({type: "drill", drill: d}))
    } else {
        try {
            const all = await loadPuzzles()
            const seen = store.get().puzzles
            const pool = all.filter((p) => p.rating >= ex.puzzles.min && p.rating < ex.puzzles.max &&
                (!ex.puzzles.themes || ex.puzzles.themes.some((t) => p.themes.split(" ").includes(t))))
            // Liefst puzzels die je nog niet gezien hebt, makkelijkste eerst.
            const fresh = pool.filter((p) => !seen[p.id])
            const pick = shuffle(fresh.length >= ex.puzzles.count ? fresh : pool).slice(0, ex.puzzles.count)
            items = pick.sort((a, b) => a.rating - b.rating).map((p) => ({type: "puzzle", puzzle: p}))
        } catch (e) {
            result.innerHTML = `<div class="card"><p>De oefenpuzzels zijn nog niet beschikbaar. Probeer het later opnieuw.</p></div>`
            return
        }
    }
    practice = {items, index: 0, results: items.map(() => null)}
    playItem()
}

function dotsHtml() {
    const now = practice.results.indexOf(null)
    return practice.results.map((r, i) =>
        `<span class="dot ${r === true ? "ok" : r === false ? "fail" : i === now ? "now" : ""}"></span>`).join("")
}

function playItem() {
    const item = practice.items[practice.index]
    const n = practice.items.length
    $(".pr-puzzle", root).hidden = item.type !== "puzzle"
    $(".pr-drill", root).hidden = item.type !== "drill"
    if (item.type === "puzzle") {
        puzzlePlayer.play(item.puzzle, {label: `opgave ${practice.index + 1} van ${n}`, dots: practice.results})
    } else {
        drillPlayer.play(item.drill, {dots: dotsHtml()})
    }
}

function itemDone(ok) {
    practice.results[practice.index] = ok
    const isLast = practice.index >= practice.items.length - 1
    if (practice.items[practice.index].type === "puzzle") {
        puzzlePlayer.setDots(practice.results)
        puzzlePlayer.setNextLabel(isLast ? "Bekijk resultaat ›" : "Volgende ›")
    }
}

function nextItem() {
    if (practice.index < practice.items.length - 1) {
        practice.index++
        playItem()
    } else {
        finishPractice()
    }
}

function finishPractice() {
    puzzlePlayer.stop()
    drillPlayer.stop()
    $(".pr-puzzle", root).hidden = true
    $(".pr-drill", root).hidden = true
    const good = practice.results.filter(Boolean).length
    const n = practice.results.length
    const score = good / n
    const passed = score >= PASS
    const st = store.get()
    const prev = st.lessons[lesson.id] || {best: 0, passed: false, attempts: 0}
    st.lessons[lesson.id] = {
        best: Math.max(prev.best, score),
        passed: prev.passed || passed,
        attempts: prev.attempts + 1,
        date: store.dayKey(),
    }
    store.save()
    const idx = LESSONS.indexOf(lesson)
    const next = LESSONS[idx + 1]
    const result = $(".pr-result", root)
    result.innerHTML = `
        <div class="card hero">
            <h2>${passed ? "Les beheerst! 🎓" : "Nog niet beheerst"}</h2>
            <p class="big-number">${good} / ${n}</p>
            <p>${passed
                ? "Je beheerst dit onderwerp. Fout gemaakte opgaven komen terug in je dagelijkse puzzels."
                : `Voor beheersing heb je ${Math.ceil(PASS * n)} van de ${n} nodig. Lees de kernregel nog eens en probeer het opnieuw. Herhalen hoort bij leren.`}</p>
            ${passed && next ? `<button class="btn primary big pr-nextlesson">Volgende les: ${next.title} ›</button>` : ""}
            <button class="btn ${passed ? "secondary" : "primary"} big pr-again">Opnieuw oefenen</button>
            ${!passed ? `<button class="btn secondary big pr-reread">Uitleg nog eens lezen</button>` : ""}
        </div>`
    const nl = $(".pr-nextlesson", result)
    if (nl) nl.onclick = () => openLesson(next.id)
    $(".pr-again", result).onclick = startPractice
    const rr = $(".pr-reread", result)
    if (rr) rr.onclick = () => showStep("uitleg")
    if (passed) toast("Les beheerst!")
    window.scrollTo(0, 0)
}
