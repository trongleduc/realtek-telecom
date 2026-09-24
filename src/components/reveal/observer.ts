/**
 * One shared IntersectionObserver for every reveal element on the page.
 *
 * Visibility is written straight to the DOM as a `data-shown` attribute instead of React state,
 * so re-renders (e.g. after a click that updates some parent state) never reset it.
 *
 * - Shown when at least SHOW_RATIO of the element (or of the viewport, for very tall elements) is visible.
 * - Hidden only once the element has fully left the viewport, which gives a hysteresis band and
 *   prevents flicker at the edge.
 * - Never hidden while it contains the focused element (keyboard users, open inputs, clicked buttons).
 */
const SHOW_RATIO = 0.12

let observer: IntersectionObserver | null = null

function handle(entries: IntersectionObserverEntry[]) {
  for (const entry of entries) {
    const el = entry.target as HTMLElement
    const viewport = entry.rootBounds?.height ?? window.innerHeight
    const visibleEnough = entry.intersectionRatio >= SHOW_RATIO || entry.intersectionRect.height >= viewport * 0.35

    if (entry.isIntersecting && visibleEnough) {
      el.setAttribute('data-shown', '')
      if (el.dataset.revealOnce !== undefined) observer?.unobserve(el)
    } else if (!entry.isIntersecting) {
      if (el.contains(document.activeElement)) continue
      el.removeAttribute('data-shown')
    }
  }
}

/** An element kept visible because it held focus is hidden once focus leaves, if it is off screen by then. */
function onFocusOut(event: FocusEvent) {
  const el = (event.target as Element | null)?.closest?.('[data-reveal][data-shown]')
  if (!el || el.contains(event.relatedTarget as Node | null)) return
  const rect = el.getBoundingClientRect()
  if (rect.bottom < 0 || rect.top > window.innerHeight) el.removeAttribute('data-shown')
}

function getObserver() {
  if (observer) return observer
  observer = new IntersectionObserver(handle, {
    threshold: [0, 0.05, SHOW_RATIO, 0.25, 0.5],
    rootMargin: '0px 0px -6% 0px',
  })
  document.addEventListener('focusout', onFocusOut)
  return observer
}

export function observeReveal(el: Element) {
  if (!('IntersectionObserver' in window)) {
    el.setAttribute('data-shown', '')
    return () => {}
  }
  const io = getObserver()
  io.observe(el)
  return () => io.unobserve(el)
}
