import * as puzzles from "./puzzles.js"
import * as play from "./play.js"
import * as review from "./review.js"
import * as progress from "./progress.js"
import {$} from "./ui.js"

const views = {puzzles, play, progress, review}
const TITLES = {puzzles: "Puzzels", play: "Spelen", progress: "Voortgang", review: "Review"}
let current = null
let reviewReturn = "play"

function showView(name) {
    for (const v of Object.keys(views)) $(`#view-${v}`).hidden = v !== name
    document.querySelectorAll(".tabbar button").forEach((b) => b.classList.toggle("active", b.dataset.view === name))
    $("#title").textContent = TITLES[name]
    current = name
    if (name !== "review") {
        views[name].show()
        try { localStorage.setItem("schaaktrainer.tab", name) } catch (e) {}
    }
    window.scrollTo(0, 0)
}

function openReview(index) {
    reviewReturn = current
    showView("review")
    review.open(index)
}

puzzles.init($("#view-puzzles"))
play.init($("#view-play"), {review: openReview})
progress.init($("#view-progress"), {review: openReview})
review.init($("#view-review"), {back: () => showView(reviewReturn)})

document.querySelectorAll(".tabbar button").forEach((b) => b.onclick = () => showView(b.dataset.view))

let start = "puzzles"
try { start = localStorage.getItem("schaaktrainer.tab") || start } catch (e) {}
showView(views[start] ? start : "puzzles")

if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("sw.js").catch((e) => console.warn("Service worker niet geregistreerd", e))
}
