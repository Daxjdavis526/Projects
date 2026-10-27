// Small DOM helpers: element construction, math rendering through KaTeX,
// lesson markup, icons, progress rings and toasts. No framework.

import { render as renderMarkup, renderInline } from '../core/markup.js';
import { STATES, STATE_LABEL } from '../core/mastery.js';

/** h('div.card#x', {attrs}, ...children) */
export function h(sel, attrs, ...kids) {
  if (attrs === null || typeof attrs !== 'object' || attrs instanceof Node || Array.isArray(attrs)) { kids.unshift(attrs); attrs = {}; }
  const m = /^([a-z0-9-]+)?((?:[.#][\w-]+)*)$/i.exec(sel) || [];
  const el = document.createElement(m[1] || 'div');
  for (const part of (m[2] || '').match(/[.#][\w-]+/g) || []) {
    if (part[0] === '.') el.classList.add(part.slice(1));
    else el.id = part.slice(1);
  }
  for (const [k, v] of Object.entries(attrs)) {
    if (v === undefined || v === null || v === false) continue;
    if (k === 'class') el.className += (el.className ? ' ' : '') + v;
    else if (k === 'style' && typeof v === 'object') Object.assign(el.style, v);
    else if (k === 'html') el.innerHTML = v;
    else if (k.startsWith('on') && typeof v === 'function') el.addEventListener(k.slice(2).toLowerCase(), v);
    else if (v === true) el.setAttribute(k, '');
    else el.setAttribute(k, v);
  }
  append(el, kids);
  return el;
}

export function append(el, kids) {
  for (const k of kids.flat(Infinity)) {
    if (k === null || k === undefined || k === false) continue;
    el.appendChild(k instanceof Node ? k : document.createTextNode(String(k)));
  }
  return el;
}

export const clear = (el) => { while (el.firstChild) el.removeChild(el.firstChild); return el; };

// Pages pass optional pieces straight to append/replaceChildren
// (`cond ? el : null`, arrays of rows). The DOM would print those as the text
// "null" or "[object HTMLDivElement]", so these methods flatten arrays and drop
// null, undefined and false for every element in the app.
for (const name of ['append', 'prepend', 'replaceChildren', 'before', 'after']) {
  for (const proto of [Element.prototype, DocumentFragment.prototype]) {
    const native = proto[name];
    if (!native || native.__atlas) continue;
    const wrapped = function (...kids) { return native.apply(this, kids.flat(Infinity).filter((k) => k !== null && k !== undefined && k !== false)); };
    wrapped.__atlas = true;
    proto[name] = wrapped;
  }
}

// ── math ─────────────────────────────────────────────────────────────────
const texCache = new Map();
export function tex(src, display = false) {
  const key = (display ? 'D' : 'I') + src;
  let out = texCache.get(key);
  if (out) return out;
  const K = globalThis.katex;
  if (!K) return `<code>${escapeHTML(src)}</code>`;
  try {
    out = K.renderToString(src, { displayMode: display, throwOnError: false, output: 'htmlAndMathml', strict: 'ignore', trust: false });
  } catch (e) {
    out = `<code class="tex-error">${escapeHTML(src)}</code>`;
  }
  if (texCache.size > 4000) texCache.clear();
  texCache.set(key, out);
  return out;
}
const escapeHTML = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/** Lesson markup → element (block). */
export const md = (text, cls = 'prose') => h(`div.${cls}`, { html: renderMarkup(text, tex) });
/** Inline markup → span. */
export const mdi = (text, cls = '') => h(cls ? `span.${cls}` : 'span', { html: renderInline(text, tex) });
/** A TeX fragment → span. */
export const math = (src, display = false) => h(display ? 'div.display-math' : 'span', { html: tex(src, display) });

// ── icons (24 × 24, stroked) ─────────────────────────────────────────────
const P = {
  home: 'M3 10.5 12 3l9 7.5V21a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1z',
  book: 'M4 4.5A2.5 2.5 0 0 1 6.5 2H20v17H6.5A2.5 2.5 0 0 0 4 21.5zM4 21.5A2.5 2.5 0 0 0 6.5 22H20M8 6h8M8 10h6',
  map: 'M9 4 3 6v14l6-2 6 2 6-2V4l-6 2zM9 4v14M15 6v14',
  review: 'M4 12a8 8 0 0 1 13.66-5.66L20 8.5M20 4v4.5h-4.5M20 12a8 8 0 0 1-13.66 5.66L4 15.5M4 20v-4.5h4.5',
  orbit: 'M12 12m-2.5 0a2.5 2.5 0 1 0 5 0a2.5 2.5 0 1 0 -5 0M3 12c0-2.5 4-4.5 9-4.5s9 2 9 4.5-4 4.5-9 4.5-9-2-9-4.5zM19.5 5.5l-1 1',
  trophy: 'M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0zM17 5h3v2a3 3 0 0 1-3 3M7 5H4v2a3 3 0 0 0 3 3',
  list: 'M8 6h13M8 12h13M8 18h13M3.5 6h.01M3.5 12h.01M3.5 18h.01',
  gear: 'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z',
  flask: 'M9 3h6M10 3v6L4.5 19a1.5 1.5 0 0 0 1.3 2.2h12.4a1.5 1.5 0 0 0 1.3-2.2L14 9V3M7 14h10',
  code: 'M8 7l-5 5 5 5M16 7l5 5-5 5M14 4l-4 16',
  play: 'M7 4.5v15l12-7.5z',
  check: 'M4.5 12.5l5 5 10-11',
  x: 'M6 6l12 12M18 6 6 18',
  bulb: 'M9 18h6M10 21h4M12 3a6 6 0 0 0-3.6 10.8c.7.55 1.1 1.3 1.1 2.2h5c0-.9.4-1.65 1.1-2.2A6 6 0 0 0 12 3z',
  lock: 'M6 11h12v10H6zM8.5 11V8a3.5 3.5 0 0 1 7 0v3',
  right: 'M5 12h14M13 6l6 6-6 6',
  left: 'M19 12H5M11 6l-6 6 6 6',
  spark: 'M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8zM19 16l.8 2.2L22 19l-2.2.8L19 22l-.8-2.2L16 19l2.2-.8z',
  star: 'M12 3.5l2.6 5.3 5.9.86-4.25 4.14 1 5.86L12 16.9l-5.25 2.76 1-5.86L3.5 9.66l5.9-.86z',
  clock: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 7v5l3 2',
  target: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM12 12h.01',
  info: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 11v5M12 8h.01',
  down: 'M12 4v12M6 10l6 6 6-6M5 20h14',
  up: 'M12 20V8M6 14l6-6 6 6M5 4h14',
  eye: 'M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12zM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z',
  bolt: 'M13 2 4 14h7l-1 8 9-12h-7z',
  calendar: 'M4 6h16v15H4zM4 10h16M8 3v4M16 3v4',
  sword: 'M14.5 4H20v5.5L9 20.5 3.5 15zM6 13l5 5M3 21l3-3',
  compass: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM15.5 8.5l-2 5-5 2 2-5z',
  grid: 'M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z',
  sun: 'M12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4',
  moon: 'M20 14.5A8 8 0 0 1 9.5 4 8 8 0 1 0 20 14.5z',
  more: 'M5 12h.01M12 12h.01M19 12h.01',
  restart: 'M3 12a9 9 0 1 0 3-6.7L3 8M3 3v5h5',
  layers: 'M12 3 2 8l10 5 10-5zM2 13l10 5 10-5M2 17.5l10 5 10-5',
  atom: 'M12 12h.01M12 3c-2.5 0-4 4-4 9s1.5 9 4 9 4-4 4-9-1.5-9-4-9zM4.2 7.5c-1.25 2.17 1.4 5.52 5.73 8.02 4.33 2.5 8.52 3.16 9.77.98 1.25-2.17-1.4-5.52-5.73-8.02C9.64 5.98 5.45 5.32 4.2 7.5z',
  wave: 'M2 12c2-5 4-5 6 0s4 5 6 0 4-5 6 0',
};
export function icon(name, cls = '') {
  const d = P[name] || P.info;
  const filled = name === 'play' || name === 'star';
  return `<svg class="${cls}" width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" fill="${filled ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="${filled ? 0 : 1.7}" stroke-linecap="round" stroke-linejoin="round"><path d="${d}"/></svg>`;
}
export const ic = (name, cls = '') => h('span', { html: icon(name, cls), style: { display: 'inline-flex' } });

export const LOGO = `<svg width="34" height="34" viewBox="0 0 40 40" aria-hidden="true"><defs><radialGradient id="lg-g" cx="35%" cy="30%"><stop offset="0" stop-color="#9cc4ff"/><stop offset=".55" stop-color="#3f7fe6"/><stop offset="1" stop-color="#14306b"/></radialGradient></defs><circle cx="20" cy="20" r="11" fill="url(#lg-g)"/><path d="M9.3 17.5q10.7 4 21.4 0M9.6 23.2q10.4 3.6 20.8 0M20 9q-6 11 0 22M20 9q6 11 0 22" fill="none" stroke="rgba(255,255,255,.45)" stroke-width=".8"/><ellipse cx="20" cy="20" rx="18" ry="6.2" fill="none" stroke="#8cbaff" stroke-width="1.3" transform="rotate(-22 20 20)" opacity=".9"/><circle cx="35.3" cy="13.4" r="1.9" fill="#f2c14e"/></svg>`;

// ── progress ring ────────────────────────────────────────────────────────
export function ring(frac, { size = 44, stroke = 5, label = '', color = 'var(--accent)', track = 'var(--panel-3)', sub = '' } = {}) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const f = Math.max(0, Math.min(1, frac || 0));
  const fs = size > 60 ? 15 : size > 44 ? 12 : 10.5;
  return `<svg class="ring" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" role="img" aria-label="${Math.round(f * 100)} percent">
  <circle cx="${size / 2}" cy="${size / 2}" r="${r}" fill="none" stroke="${track}" stroke-width="${stroke}"/>
  <circle cx="${size / 2}" cy="${size / 2}" r="${r}" fill="none" stroke="${color}" stroke-width="${stroke}" stroke-linecap="round"
    stroke-dasharray="${(c * f).toFixed(2)} ${c.toFixed(2)}" transform="rotate(-90 ${size / 2} ${size / 2})"/>
  ${label ? `<text x="50%" y="${sub ? '46%' : '50%'}" text-anchor="middle" dominant-baseline="central" font-size="${fs}" font-weight="700" fill="var(--ink)">${label}</text>` : ''}
  ${sub ? `<text x="50%" y="66%" text-anchor="middle" dominant-baseline="central" font-size="${fs * 0.62}" fill="var(--ink-3)">${sub}</text>` : ''}
</svg>`;
}

export function bar(frac, cls = '') {
  return h(`div.bar${cls ? '.' + cls : ''}`, { role: 'progressbar', 'aria-valuemin': 0, 'aria-valuemax': 100, 'aria-valuenow': Math.round((frac || 0) * 100) },
    h('span', { style: { width: `${Math.max(0, Math.min(1, frac || 0)) * 100}%` } }));
}

// ── mastery state pill ───────────────────────────────────────────────────
export function statePill(state, extra = '') {
  const i = STATES.indexOf(state);
  return h(`span.state.s${Math.max(0, i)}`, { title: 'The Atlas’s estimate from your answers' }, h('i'), STATE_LABEL[state] || 'Not started', extra);
}
export const stateColor = (state) => `var(--st-${Math.max(0, STATES.indexOf(state))})`;

// ── toasts ───────────────────────────────────────────────────────────────
let toastBox = null;
export function toast({ title, body = '', icon: ico = 'spark', art = null, ms = 4200 }) {
  if (!toastBox) { toastBox = h('div.toasts', { role: 'status', 'aria-live': 'polite' }); document.body.appendChild(toastBox); }
  const t = h('div.toast', art ? h('span', { html: art }) : h('span', { html: icon(ico), style: { color: 'var(--accent-2)', display: 'inline-flex' } }), h('div', h('b', title), body ? h('small', body) : null));
  toastBox.appendChild(t);
  setTimeout(() => { t.style.transition = 'opacity .4s'; t.style.opacity = '0'; setTimeout(() => t.remove(), 450); }, ms);
}

export function difficultyDots(d = 2) {
  return h('span.diff', { title: ['', 'Introductory', 'Standard', 'Challenging', 'Advanced'][d] + ' difficulty', 'aria-label': `difficulty ${d} of 4` },
    [1, 2, 3, 4].map((k) => h(k <= d ? 'i.on' : 'i')));
}

export function fmtMinutes(m) { return m >= 60 ? `${(m / 60).toFixed(1)} h` : `${Math.round(m)} min`; }
export function plural(n, w, ws = w + 's') { return `${n} ${n === 1 ? w : ws}`; }
export function relTime(t, now = Date.now()) {
  const d = Math.round((now - t) / 86400000);
  if (d <= 0) return 'today';
  if (d === 1) return 'yesterday';
  if (d < 7) return `${d} days ago`;
  if (d < 30) return `${Math.round(d / 7)} weeks ago`;
  return new Date(t).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}
