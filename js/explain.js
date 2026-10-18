// Legt in één eenvoudige zin uit waarom een zet een fout was.

import {Chess} from "../vendor/chess.js/chess.js"
import {uciToMove, prettySan, pieceName} from "./board.js"

const VALUE = {p: 1, n: 3, b: 3, r: 5, q: 9, k: 0}

/**
 * fen: stelling vóór de fout
 * played: de gespeelde zet (chess.js verbose move)
 * bestLine: engine-regel in de stelling vóór de fout (vanuit de speler)
 * replyLine: engine-regel ná de fout (vanuit de tegenstander), of null als de partij afgelopen is
 * cpLoss: verlies in centipionnen
 */
export function explain({fen, played, bestLine, replyLine, cpLoss}) {
    const best = new Chess(fen).move(uciToMove(bestLine.move))
    const bestSan = `<b>${prettySan(best.san)}</b>`

    let reply = null
    if (replyLine && replyLine.move) {
        const c = new Chess(fen)
        c.move(played.san)
        reply = c.move(uciToMove(replyLine.move))
    }
    const replySan = reply && `<b>${prettySan(reply.san)}</b>`

    if (replyLine && replyLine.mate > 0) {
        return replyLine.mate === 1
            ? `Na jouw zet kan de tegenstander direct mat geven met ${replySan}. Beter was ${bestSan}.`
            : `Na jouw zet heeft de tegenstander een matcombinatie (mat in ${replyLine.mate}), te beginnen met ${replySan}. Beter was ${bestSan}.`
    }
    if (bestLine.mate > 0) {
        return bestLine.mate === 1
            ? `Je miste mat in één zet: ${bestSan}!`
            : `Je miste een matcombinatie: ${bestSan} leidt tot mat in ${bestLine.mate}.`
    }
    if (reply && reply.captured) {
        if (played.captured && reply.to === played.to && VALUE[played.piece] > VALUE[played.captured]) {
            return `Je sloeg een ${pieceName(played.captured)}, maar je ${pieceName(played.piece)} wordt teruggeslagen: een slechte ruil. Beter was ${bestSan}.`
        }
        if (reply.to === played.to && !played.captured) {
            return `Je ${pieceName(played.piece)} op ${played.to} is niet goed gedekt: de tegenstander slaat hem met ${replySan}. Beter was ${bestSan}.`
        }
        if (VALUE[reply.captured] >= 3) {
            return `Na jouw zet kan de tegenstander je ${pieceName(reply.captured)} op ${reply.to} winnen met ${replySan}. Beter was ${bestSan}.`
        }
    }
    if (best.captured && VALUE[best.captured] >= 1 && !played.captured) {
        return `Met ${bestSan} kon je een ${pieceName(best.captured)} winnen.`
    }
    if (reply && reply.san.includes("+")) {
        return `Na jouw zet krijgt de tegenstander een sterke aanval met ${replySan}. Beter was ${bestSan}.`
    }
    const pawns = Math.max(1, Math.round(cpLoss / 100))
    const cost = cpLoss >= 800 ? "een heel stuk of meer" : `ongeveer ${pawns} pion${pawns === 1 ? "" : "nen"}`
    return `${bestSan} was beter. Jouw zet kost ${cost} aan voordeel.`
}
