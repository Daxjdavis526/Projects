// A long equation that cannot wrap must not widen the page: on a phone the
// browser would then zoom the whole page out, shrinking every word. Each
// equation that runs past the right edge of the content becomes a strip of
// its own that scrolls sideways. Only newly inserted maths is measured, so a
// readout redrawn every frame costs almost nothing.

let main = null;

function edge() {
  const r = main.getBoundingClientRect(), cs = getComputedStyle(main);
  return Math.min(r.right - parseFloat(cs.paddingRight), document.documentElement.clientWidth);
}

function fit(el, right) {
  const box = el.closest('.katex-display') || el;
  const r = box.getBoundingClientRect();
  if (!r.width || r.right <= right + 1) return;
  box.classList.add('math-scroll');
  box.style.maxWidth = `${Math.max(80, Math.floor(right - r.left))}px`;
}

function scan(nodes) {
  const right = edge();
  for (const n of nodes) {
    if (n.nodeType !== 1) continue;
    if (n.classList.contains('katex')) fit(n, right);
    for (const k of n.querySelectorAll('.katex')) fit(k, right);
  }
}

export function watchMath(el) {
  main = el;
  let pending = [];
  let queued = false;
  new MutationObserver((records) => {
    for (const rec of records) pending.push(...rec.addedNodes);
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => { queued = false; const nodes = pending; pending = []; scan(nodes); });
  }).observe(main, { childList: true, subtree: true });
  // a turned phone has a new edge: measure everything again
  let t = 0;
  addEventListener('resize', () => { clearTimeout(t); t = setTimeout(() => {
    for (const b of main.querySelectorAll('.math-scroll')) { b.classList.remove('math-scroll'); b.style.maxWidth = ''; }
    scan([main]);
  }, 150); });
}
