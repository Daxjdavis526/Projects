// Mounting a visualization: a frame with a canvas area, labelled controls
// (every parameter shows its value, unit and a one-line explanation), a live
// readout and a caption that says what is simplified or not to scale. Each
// simulation lives in sims/<type>.js and exports mount(frame, params).

import { h, tex, md, mdi } from '../ui/dom.js';
import { reducedMotion } from '../ui/state.js';

const cache = new Map();
const load = (type) => {
  if (!cache.has(type)) cache.set(type, import(`./sims/${type}.js`));
  return cache.get(type);
};

/**
 * @param {HTMLElement} el
 * @param {{type:string, params?:object, caption?:string, note?:string, tasks?:string[]}} spec
 * @param {{compact?:boolean, onChange?:Function}} opts
 */
export async function mountViz(el, spec, opts = {}) {
  const mod = await load(spec.type);
  const frame = makeFrame(el, spec, opts);
  const ctl = (await mod.mount(frame, { ...(mod.defaults || {}), ...(spec.params || {}) })) || {};
  frame._finish();
  return {
    destroy() { frame._destroy(); ctl.destroy?.(); },
    get: (k) => (ctl.get ? ctl.get(k) : frame.params[k]),
    set: (k, v) => frame.set(k, v),
  };
}

function makeFrame(el, spec, opts) {
  const root = h('figure.viz', { style: { margin: 0 } });
  const stage = h('div');
  const controls = h('div.viz-controls');
  const readout = h('div.viz-readout', { 'aria-live': 'polite' });
  const caption = h('figcaption.viz-caption');
  root.append(stage, controls, readout, caption);
  el.append(root);

  const params = {};
  const listeners = [];
  const destroyers = [];
  const ctrls = {};
  let changeQueued = false;
  const changed = (key) => {
    for (const fn of listeners) fn(key, params);
    opts.onChange?.(key, params);
    if (!changeQueued) { changeQueued = true; requestAnimationFrame(() => { changeQueued = false; }); }
  };

  const F = {
    el: root, params, compact: !!opts.compact,
    /** A canvas area; aspect 'wide' (2:1), 'square' or default 16:10. Calls draw() on resize. */
    canvas({ aspect = '', label = '', height } = {}) {
      const c = h('canvas', { role: 'img', 'aria-label': label || spec.alt || 'Interactive visualization' });
      const box = h(`div.viz-canvas${aspect ? '.' + aspect : ''}`, c);
      if (height) box.style.aspectRatio = 'auto', box.style.height = height;
      const overlay = h('div.overlay');
      box.append(overlay);
      stage.append(box);
      const ro = new ResizeObserver(() => F._redraw?.());
      ro.observe(box);
      destroyers.push(() => ro.disconnect());
      return { canvas: c, box, overlay };
    },
    /** Register the draw function used on resize and theme change. */
    draw(fn) { F._redraw = fn; },
    slider({ key, label, min, max, step = (max - min) / 100, value, unit = '', explain = '', fmt, logScale = false }) {
      params[key] = value;
      const show = h('b');
      const input = h('input', { type: 'range', min: logScale ? Math.log10(min) : min, max: logScale ? Math.log10(max) : max, step: logScale ? (Math.log10(max) - Math.log10(min)) / 200 : step, value: logScale ? Math.log10(value) : value, 'aria-label': label });
      const fmtv = fmt || ((v) => (Math.abs(v) >= 1e4 || (Math.abs(v) < 1e-2 && v !== 0) ? v.toExponential(2) : String(+v.toFixed(Math.max(0, -Math.floor(Math.log10(step || 1)))))));
      const paint = () => {
        const v = params[key];
        show.innerHTML = tex(`${fmtv(v)}${unit ? '\\;' + unit : ''}`);
        const lo = +input.min, hi = +input.max, cur = logScale ? Math.log10(v) : v;
        input.style.setProperty('--p', `${((cur - lo) / (hi - lo)) * 100}%`);
        input.setAttribute('aria-valuetext', `${fmtv(v)} ${unit.replace(/\\[a-z]+|[{}\\]/gi, '')}`);
      };
      input.addEventListener('input', () => { params[key] = logScale ? 10 ** +input.value : +input.value; paint(); changed(key); });
      const node = h('div.ctl', h('label', h('span', { html: renderLabel(label) }), show), input, explain ? h('small', mdi(explain)) : null);
      controls.append(node);
      paint();
      ctrls[key] = { set: (v) => { params[key] = v; input.value = logScale ? Math.log10(v) : v; paint(); }, node };
      return ctrls[key];
    },
    choice({ key, label, options, value, explain = '' }) {
      params[key] = value;
      const btns = options.map(([v, text]) => h('button', { type: 'button', 'aria-pressed': String(v === value), onclick: () => { params[key] = v; paint(); changed(key); } }, text));
      const paint = () => btns.forEach((b, i) => b.setAttribute('aria-pressed', String(options[i][0] === params[key])));
      const node = h('div.ctl', h('label', h('span', { html: renderLabel(label) })), h('div.seg', btns), explain ? h('small', mdi(explain)) : null);
      controls.append(node);
      ctrls[key] = { set: (v) => { params[key] = v; paint(); }, node };
      return ctrls[key];
    },
    toggle({ key, label, value = false, explain = '' }) {
      params[key] = value;
      const cb = h('input', { type: 'checkbox', checked: value || null });
      cb.addEventListener('change', () => { params[key] = cb.checked; changed(key); });
      const node = h('div.ctl', h('label', { style: { justifyContent: 'flex-start', gap: '.5rem', cursor: 'pointer' } }, cb, h('span', { html: renderLabel(label) })), explain ? h('small', mdi(explain)) : null);
      controls.append(node);
      ctrls[key] = { set: (v) => { params[key] = v; cb.checked = v; }, node };
      return ctrls[key];
    },
    button({ label, onClick, primary = false }) {
      const b = h(primary ? 'button.btn.small.primary' : 'button.btn.small', { type: 'button', onclick: onClick }, label);
      let row = controls.querySelector('.btn-row');
      if (!row) { row = h('div.ctl.btn-row', h('div.btns')); controls.append(row); }
      row.querySelector('.btns').append(b);
      return b;
    },
    set(key, v) { params[key] = v; ctrls[key]?.set(v); changed(key); },
    /** Announce a change that is not a control — a dragged point — so a question re-reads its answer. */
    notify(key) { changed(key); },
    onChange(fn) { listeners.push(fn); },
    /** Readout rows: [[label, value-as-TeX], ...] */
    readout(rows) {
      const live = rows.filter(Boolean);
      readout.hidden = !live.length;
      readout.replaceChildren(...live.map(([k, v]) => h('span', h('span', { html: renderLabel(k) }), ' ', h('b', { html: tex(String(v)) }))));
    },
    caption(text) { caption.replaceChildren(mdi(text)); },
    /**
     * Animation loop: fn(dt, t) each frame while visible. With reduced motion,
     * it runs only when `force` is set (e.g. the user pressed Play).
     */
    animate(fn, { force = false } = {}) {
      let raf = 0, last = performance.now(), t = 0, visible = true, running = true;
      const io = new IntersectionObserver((es) => { visible = es[0]?.isIntersecting ?? true; if (visible && running) loop(performance.now()); });
      io.observe(root);
      const loop = (now) => {
        cancelAnimationFrame(raf);
        if (!running || !visible) return;
        const dt = Math.min(0.05, (now - last) / 1000);
        last = now; t += dt;
        fn(dt, t);
        if (!reducedMotion() || force) raf = requestAnimationFrame(loop);
      };
      raf = requestAnimationFrame((n) => { last = n; loop(n); });
      const stop = () => { running = false; cancelAnimationFrame(raf); io.disconnect(); };
      destroyers.push(stop);
      return { stop, start: () => { running = true; last = performance.now(); loop(last); } };
    },
    onDestroy(fn) { destroyers.push(fn); },
    _finish() {
      if (!controls.children.length) controls.remove();
      if (spec.caption || spec.note) caption.replaceChildren(spec.caption ? mdi(spec.caption) : '', spec.note ? h('span.note', ' ', mdi(spec.note)) : '');
      if (!caption.textContent.trim()) caption.remove();
      if (spec.tasks?.length && !opts.compact) root.after(h('div.callout', h('b', 'Try this: '), h('span', mdi(spec.tasks.join(' · ')))));
      F._redraw?.();
      if (!readout.childElementCount) readout.hidden = true;     // a static picture has no readout bar
    },
    _destroy() { destroyers.forEach((d) => { try { d(); } catch { /* ignore */ } }); root.remove(); },
  };
  return F;
}

// Labels may contain $TeX$.
function renderLabel(label) {
  return String(label).replace(/\$([^$]+)\$/g, (m, t) => tex(t));
}

export { md };
