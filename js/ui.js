// Kleine DOM-hulpjes.

export const $ = (selector, root = document) => root.querySelector(selector)

export function el(html) {
    const t = document.createElement("template")
    t.innerHTML = html.trim()
    return t.content.firstElementChild
}

let toastTimer = null
export function toast(text) {
    let t = $("#toast")
    if (!t) {
        t = el(`<div id="toast" role="status"></div>`)
        document.body.appendChild(t)
    }
    t.textContent = text
    t.classList.add("show")
    clearTimeout(toastTimer)
    toastTimer = setTimeout(() => t.classList.remove("show"), 2200)
}
