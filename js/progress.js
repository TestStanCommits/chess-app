// Voortgang: reeks, puzzelscore, zwakste thema's en partijen.

import * as store from "./storage.js"
import {THEMES} from "./themes.js"
import {dueCount} from "./puzzles.js"
import {LESSONS, THEME_LESSON} from "./lessons-data.js"
import {$} from "./ui.js"

let root = null
let onReview = null
let onLesson = null

export function init(container, {review, lesson}) {
    root = container
    onReview = review
    onLesson = lesson
}

const WEEKDAYS = ["zo", "ma", "di", "wo", "do", "vr", "za"]

export function show() {
    const st = store.get()
    const streak = store.streak()

    // Laatste 7 dagen
    const week = []
    for (let i = 6; i >= 0; i--) {
        const key = store.addDays(store.dayKey(), -i)
        const d = st.days[key]
        const [y, m, dd] = key.split("-").map(Number)
        week.push({label: WEEKDAYS[new Date(y, m - 1, dd).getDay()], active: d && (d.puzzles > 0 || d.games > 0), goal: d && d.session})
    }
    let weekPuzzles = 0, weekCorrect = 0
    for (let i = 0; i < 7; i++) {
        const d = st.days[store.addDays(store.dayKey(), -i)]
        if (d) {
            weekPuzzles += d.puzzles
            weekCorrect += d.correct
        }
    }

    // Zwakste thema's: minstens 3 pogingen, laagste score eerst.
    const themes = Object.entries(st.themes)
        .map(([t, s]) => ({t, total: s.ok + s.fail, pct: Math.round(s.ok / (s.ok + s.fail) * 100)}))
        .filter((x) => x.total >= 3 && THEMES[x.t])
        .sort((a, b) => a.pct - b.pct || b.total - a.total)
        .slice(0, 3)

    const games = st.games
    const w = games.filter((g) => g.result === "win").length
    const d = games.filter((g) => g.result === "draw").length
    const l = games.filter((g) => g.result === "loss").length
    const lessonsPassed = LESSONS.filter((l) => st.lessons[l.id]?.passed).length
    const nextLesson = LESSONS.find((l) => !st.lessons[l.id]?.passed)
    const learned = Object.values(st.puzzles).filter((p) => p.fails > 0 && !p.due).length

    root.innerHTML = `
        <div class="card-list">
            <div class="card hero">
                <div class="streak">🔥 ${streak}</div>
                <p>${streak === 0 ? "Train vandaag om een reeks te beginnen." : `dag${streak === 1 ? "" : "en"} op rij getraind`}</p>
                <div class="week">${week.map((x) => `<div class="day ${x.goal ? "goal" : x.active ? "active" : ""}"><span></span>${x.label}</div>`).join("")}</div>
            </div>
            <div class="card">
                <h3>Leertraject</h3>
                <div class="stats">
                    <div><div class="stat">${lessonsPassed}/${LESSONS.length}</div><div class="muted">lessen beheerst</div></div>
                </div>
                <div class="progress"><div class="progress-bar" style="width:${lessonsPassed / LESSONS.length * 100}%"></div></div>
                ${nextLesson ? `<button class="game-row lesson-link" data-id="${nextLesson.id}">Volgende: ${nextLesson.title}<span>Open ›</span></button>` : ""}
            </div>
            <div class="card">
                <h3>Puzzels</h3>
                <div class="stats">
                    <div><div class="stat">${Math.round(st.puzzleRating)}</div><div class="muted">puzzelrating</div></div>
                    <div><div class="stat">${weekPuzzles ? Math.round(weekCorrect / weekPuzzles * 100) + "%" : "–"}</div><div class="muted">goed (7 dagen)</div></div>
                    <div><div class="stat">${st.puzzleCount}</div><div class="muted">gemaakt</div></div>
                </div>
                <p class="muted">${dueCount()} om te herhalen · ${learned} fout gemaakte puzzel${learned === 1 ? "" : "s"} inmiddels geleerd</p>
            </div>
            <div class="card">
                <h3>Zwakste thema's</h3>
                ${themes.length === 0 ? `<p class="muted">Maak eerst wat puzzels, dan zie je hier waar je het meest van kunt leren.</p>` :
                themes.map((x) => `
                    <div class="theme-row">
                        <div class="theme-row-head"><b>${THEMES[x.t].name}</b><span>${x.pct}% goed</span></div>
                        <div class="bar"><div style="width:${x.pct}%"></div></div>
                        <p class="muted small">${THEMES[x.t].tip}</p>
                        ${THEME_LESSON[x.t] ? `<button class="btn link lesson-link" data-id="${THEME_LESSON[x.t]}">Herhaal de les ›</button>` : ""}
                    </div>`).join("")}
            </div>
            <div class="card">
                <h3>Partijen tegen de computer</h3>
                <div class="stats">
                    <div><div class="stat">${w}</div><div class="muted">gewonnen</div></div>
                    <div><div class="stat">${d}</div><div class="muted">remise</div></div>
                    <div><div class="stat">${l}</div><div class="muted">verloren</div></div>
                </div>
                <p class="muted">Computer staat nu op niveau ${st.botLevel}.</p>
                <div class="game-list">
                    ${games.slice(-5).reverse().map((g, i) => {
                        const index = games.length - 1 - i
                        const icon = {win: "✅", draw: "🤝", loss: "❌"}[g.result]
                        return `<button class="game-row" data-i="${index}">${icon} ${g.date.slice(8)}-${g.date.slice(5, 7)} · ${g.color === "w" ? "wit" : "zwart"} · niveau ${g.level}<span>Review ›</span></button>`
                    }).join("")}
                </div>
            </div>
            <button class="btn link danger reset">Alle voortgang wissen</button>
        </div>`
    root.querySelectorAll(".lesson-link").forEach((b) => b.onclick = () => onLesson(b.dataset.id))
    root.querySelectorAll(".game-row[data-i]").forEach((b) => b.onclick = () => onReview(+b.dataset.i))
    $(".reset", root).onclick = () => {
        if (confirm("Alle voortgang wissen? Dit kan niet ongedaan worden gemaakt.")) {
            store.reset()
            location.reload()
        }
    }
}
