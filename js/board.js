// Schaakbord (cm-chessboard) met invoer die alleen legale zetten toestaat.

import {Chessboard, COLOR, INPUT_EVENT_TYPE, BORDER_TYPE} from "../vendor/cm-chessboard/src/Chessboard.js"
import {Markers, MARKER_TYPE} from "../vendor/cm-chessboard/src/extensions/markers/Markers.js"
import {Arrows, ARROW_TYPE} from "../vendor/cm-chessboard/src/extensions/arrows/Arrows.js"
import {PromotionDialog, PROMOTION_DIALOG_RESULT_TYPE} from "../vendor/cm-chessboard/src/extensions/promotion-dialog/PromotionDialog.js"

export {COLOR, MARKER_TYPE, ARROW_TYPE}

const LAST_MOVE = {class: "marker-last-move", slice: "markerSquare"}

export function createBoard(element) {
    return new Chessboard(element, {
        assetsUrl: "vendor/cm-chessboard/assets/",
        style: {
            cssClass: "green",
            borderType: BORDER_TYPE.none,
            showCoordinates: true,
            animationDuration: 250,
        },
        extensions: [
            {class: Markers, props: {autoMarkers: MARKER_TYPE.square}},
            {class: Arrows},
            {class: PromotionDialog, props: {language: "nl"}},
        ],
    })
}

/**
 * Laat de speler zetten doen voor `color` ("w" of "b").
 * `chess` is een chess.js-object met de huidige stelling.
 * `onMove({from, to, promotion})` wordt aangeroepen met een legale zet; de aanroeper voert die uit.
 */
export function enableInput(board, chess, color, onMove) {
    board.enableMoveInput((event) => {
        switch (event.type) {
            case INPUT_EVENT_TYPE.moveInputStarted: {
                const moves = chess.moves({square: event.squareFrom, verbose: true})
                board.removeLegalMovesMarkers()
                board.addLegalMovesMarkers(moves)
                return moves.length > 0
            }
            case INPUT_EVENT_TYPE.validateMoveInput: {
                board.removeLegalMovesMarkers()
                const moves = chess.moves({square: event.squareFrom, verbose: true})
                    .filter((m) => m.to === event.squareTo)
                if (moves.length === 0) return false
                if (moves[0].promotion) {
                    // Toon het promotiekeuzemenu; de zet gaat pas door na de keuze.
                    board.setPiece(event.squareFrom, null)
                    board.setPiece(event.squareTo, color + "p")
                    board.showPromotionDialog(event.squareTo, color === "w" ? COLOR.white : COLOR.black, (result) => {
                        if (result.type === PROMOTION_DIALOG_RESULT_TYPE.pieceSelected) {
                            onMove({from: event.squareFrom, to: event.squareTo, promotion: result.piece.charAt(1)})
                        } else {
                            board.setPosition(chess.fen())
                        }
                    })
                    return true
                }
                // Wacht tot de verplaatsanimatie klaar is voordat de aanroeper de stelling bijwerkt.
                setTimeout(() => onMove({from: event.squareFrom, to: event.squareTo}))
                return true
            }
            case INPUT_EVENT_TYPE.moveInputCanceled:
                board.removeLegalMovesMarkers()
                break
        }
    }, color === "w" ? COLOR.white : COLOR.black)
}

/** Markeert de laatste zet met gekleurde velden. */
export function showLastMove(board, move) {
    board.removeMarkers(LAST_MOVE)
    if (move) {
        board.addMarker(LAST_MOVE, move.from)
        board.addMarker(LAST_MOVE, move.to)
    }
}

/** Zet een UCI-zet ("e2e4", "e7e8q") om naar {from, to, promotion}. */
export function uciToMove(uci) {
    return {from: uci.slice(0, 2), to: uci.slice(2, 4), promotion: uci[4]}
}

const FIGURINES = {K: "♔", Q: "♕", R: "♖", B: "♗", N: "♘"}

/** Toont een zet met stukfiguurtjes, bijv. "♘f3". */
export function prettySan(san) {
    return san.replace(/[KQRBN]/g, (c) => FIGURINES[c] + "︎")
}

const NAMES = {p: "pion", n: "paard", b: "loper", r: "toren", q: "dame", k: "koning"}
export function pieceName(type) {
    return NAMES[type]
}
