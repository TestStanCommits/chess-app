// Alle voortgang staat lokaal op de telefoon (localStorage).

const KEY = "schaaktrainer.v1"

const DEFAULTS = {
    puzzleRating: 800,       // startwaarde, past zich snel aan
    puzzleCount: 0,          // aantal opgeloste puzzels (goed of fout)
    puzzles: {},             // id -> {box, due, fails, seen}
    themes: {},              // thema -> {ok, fail}
    days: {},                // "2026-10-18" -> {puzzles, correct, games, session}
    botLevel: 2,
    games: [],               // laatste partijen
    currentGame: null,       // partij in uitvoering
}

let state = load()

function load() {
    try {
        const raw = localStorage.getItem(KEY)
        if (raw) return Object.assign(structuredClone(DEFAULTS), JSON.parse(raw))
    } catch (e) {
        console.warn("Kon voortgang niet laden", e)
    }
    return structuredClone(DEFAULTS)
}

export function save() {
    try {
        localStorage.setItem(KEY, JSON.stringify(state))
    } catch (e) {
        console.warn("Kon voortgang niet opslaan", e)
    }
}

export function get() {
    return state
}

export function reset() {
    state = structuredClone(DEFAULTS)
    save()
}

/** Datum als "JJJJ-MM-DD" in lokale tijd. */
export function dayKey(date = new Date()) {
    const y = date.getFullYear()
    const m = String(date.getMonth() + 1).padStart(2, "0")
    const d = String(date.getDate()).padStart(2, "0")
    return `${y}-${m}-${d}`
}

export function addDays(key, n) {
    const [y, m, d] = key.split("-").map(Number)
    return dayKey(new Date(y, m - 1, d + n))
}

export function today() {
    const key = dayKey()
    if (!state.days[key]) state.days[key] = {puzzles: 0, correct: 0, games: 0, session: false}
    return state.days[key]
}

/** Aantal dagen op rij dat er getraind is (vandaag telt mee zodra je iets gedaan hebt). */
export function streak() {
    const active = (k) => {
        const d = state.days[k]
        return d && (d.puzzles > 0 || d.games > 0)
    }
    let key = dayKey()
    if (!active(key)) key = addDays(key, -1)
    let count = 0
    while (active(key)) {
        count++
        key = addDays(key, -1)
    }
    return count
}
