/* ============================================================================
   ui/labels.js — zoom-gated, decluttered, fading HTML labels
   ----------------------------------------------------------------------------
   main.js projects every registry object each frame (obj._sx/_sy/_behind/_px);
   this module decides which deserve a label: band-gated by zoom, sorted by
   priority, greedily decluttered in screen space, opacity eased — labels
   breathe in and out rather than popping.
   ========================================================================== */
import { bandFade } from '../scale.js';

export class Labels {
  constructor(container, onClick) {
    this.root = container;
    this.onClick = onClick;
    this.state = new Map();   // obj.id -> {o, t, el}
    this.density = 1;
    this.selected = null;
  }

  update(ctx, registry, dt) {
    const W = ctx.cssW, H = ctx.cssH;
    // candidates: on screen, inside their band
    const cands = [];
    for (const o of registry) {
      let f = bandFade(ctx.logS, o.labelBand[0], o.labelBand[1], 0.35);
      if (this.selected === o && !o._behind) f = Math.max(f, 1);
      if (f < 0.02 || o._behind) { this._target(o, 0); continue; }
      if (o._sx < -40 || o._sx > W + 40 || o._sy < -20 || o._sy > H + 20) { this._target(o, 0); continue; }
      cands.push([o, f]);
    }
    cands.sort((a, b) =>
      (b[0] === this.selected ? 1e3 : b[0].priority) - (a[0] === this.selected ? 1e3 : a[0].priority));
    // greedy declutter
    const rects = [];
    const maxN = Math.round(16 * this.density);
    let n = 0;
    for (const [o, f] of cands) {
      if (n >= maxN && o !== this.selected) { this._target(o, 0); continue; }
      const w = o.name.length * 7 + 26, h = 20;
      const r = [o._sx, o._sy - h / 2, o._sx + w, o._sy + h / 2];
      let hit = false;
      for (const q of rects)
        if (r[0] < q[2] && r[2] > q[0] && r[1] < q[3] && r[3] > q[1]) { hit = true; break; }
      if (hit && o !== this.selected) { this._target(o, 0); continue; }
      rects.push(r);
      this._target(o, f);
      n++;
    }
    // apply
    const ease = 1 - Math.exp(-dt * 5);
    for (const o of registry) {
      const st = this.state.get(o.id);
      if (!st) continue;
      st.o += (st.t - st.o) * ease;
      if (st.o < 0.02 && st.t === 0) {
        if (st.el) { st.el.remove(); st.el = null; }
        this.state.delete(o.id);
        continue;
      }
      if (!st.el) {
        const el = document.createElement('div');
        el.className = 'lbl';
        el.innerHTML = '<i></i><span></span>';
        el.querySelector('span').textContent = o.name;
        el.querySelector('i').style.color = '#' + o.color.getHexString();
        el.onclick = (e) => { e.stopPropagation(); this.onClick(o); };
        this.root.appendChild(el);
        st.el = el;
      }
      st.el.style.opacity = st.o.toFixed(2);
      st.el.style.left = o._sx + 'px';
      st.el.style.top = o._sy + 'px';
      st.el.classList.toggle('sel', o === this.selected);
    }
  }

  _target(o, t) {
    let st = this.state.get(o.id);
    if (!st) { if (t <= 0) return; st = { o: 0, t: 0, el: null }; this.state.set(o.id, st); }
    st.t = t;
  }
}
