// Controleert alle stellingen en zetten in het leertraject.  Gebruik: node tools/check_lessons.mjs
import {Chess} from "../vendor/chess.js/chess.js"
import {LESSONS} from "../js/lessons-data.js"

let errors = 0
const fail = (lesson, msg) => {
    errors++
    console.log(`✗ ${lesson.id}: ${msg}`)
}

// Zetten in {{...}} moeten legaal zijn in een stelling die in het voorbeeld voorkomt.
function checkRefs(lesson, text, fens) {
    for (const [, san] of (text || "").matchAll(/\{\{(.+?)\}\}/g)) {
        if (!fens.some((f) => { try { new Chess(f).move(san); return true } catch { return false } })) {
            fail(lesson, `verwijzing {{${san}}} is in geen enkele voorbeeldstelling legaal`)
        }
    }
}

for (const lesson of LESSONS) {
    const allText = JSON.stringify(lesson.uitleg)
    const fens = []
    for (const ex of lesson.voorbeelden || []) {
        let c
        try { c = new Chess(ex.fen) } catch (e) { fail(lesson, "ongeldige FEN " + ex.fen); continue }
        fens.push(c.fen())
        for (const step of ex.steps) {
            try {
                const m = c.move(step.san)
                if (m.san !== step.san) fail(lesson, `zet ${step.san} heet eigenlijk ${m.san}`)
            } catch (e) {
                fail(lesson, `illegale zet ${step.san} in ${c.fen()}`)
                break
            }
            fens.push(c.fen())
        }
    }
    for (const ex of lesson.voorbeelden || []) {
        checkRefs(lesson, ex.intro, fens)
        for (const s of ex.steps) checkRefs(lesson, s.text, fens)
    }
    checkRefs(lesson, allText, fens)
    for (const b of lesson.uitleg.filter((b) => b.board)) {
        try { new Chess(b.board.fen) } catch { fail(lesson, "ongeldige diagram-FEN") }
    }
    for (const d of lesson.oefeningen.drills || []) {
        try { new Chess(d.fen) } catch { fail(lesson, "ongeldige drill-FEN " + d.fen) }
    }
}
const pat = new Chess("k7/8/1Q6/8/8/8/8/6K1 b - - 0 1")
if (!pat.isStalemate()) { errors++; console.log("✗ matdame: patdiagram is geen pat") }
console.log(errors ? `${errors} fout(en)` : `Alle ${LESSONS.length} lessen in orde`)
process.exit(errors ? 1 : 0)
