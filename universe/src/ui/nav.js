/* ============================================================================
   ui/nav.js — the NEARBY destinations dock
   ----------------------------------------------------------------------------
   An exploration-game style nav list: the closest named objects to the
   camera, live distances, click to jump. N hops to the nearest star.
   ========================================================================== */
import { fmtLen } from '../scale.js';

export class NavDock {
  constructor(registry, goto) {
    this.registry = registry;
    this.goto = goto;
    this.el = document.querySelector('#navdock');
    this.list = document.querySelector('#navlist');
    this.cool = 0;
    document.querySelector('#navToggle').onclick = () =>
      this.el.classList.toggle('min');
  }

  nearest(ctx, kindFilter = null, excludeObj = null) {
    const cp = ctx.camPos;
    let best = null, bestD = Infinity;
    for (const o of this.registry) {
      if (!o.pos || o === excludeObj) continue;
      if (kindFilter && o.kind !== kindFilter) continue;
      const p = o.pos(ctx);
      const d = Math.hypot(p[0]-cp[0], p[1]-cp[1], p[2]-cp[2]);
      if (d > 1e7 && d < bestD) { bestD = d; best = o; }
    }
    return best;
  }

  update(ctx, dt, currentFocus) {
    this.cool -= dt;
    if (this.cool > 0) return;
    this.cool = 0.5;
    const cp = ctx.camPos;
    const scored = [];
    for (const o of this.registry) {
      if (!o.pos || o === currentFocus) continue;
      const p = o.pos(ctx);
      const d = Math.hypot(p[0]-cp[0], p[1]-cp[1], p[2]-cp[2]);
      if (d > 1e7) scored.push([d, o]);
    }
    scored.sort((a, b) => a[0] - b[0]);
    const rows = scored.slice(0, 6);
    this.list.innerHTML = '';
    for (const [d, o] of rows) {
      const b = document.createElement('button');
      b.className = 'navrow';
      b.innerHTML = `<i style="background:#${o.color.getHexString()}"></i>` +
        `<span class="nm">${o.name}</span><span class="ds">${fmtLen(d)}</span>`;
      b.onclick = () => this.goto(o);
      this.list.appendChild(b);
    }
  }
}
