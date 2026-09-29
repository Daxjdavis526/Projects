/* Tiny DOM helpers. No framework: the UI is a set of panels that build
   their DOM once and update text and attributes in place each frame. */

const SVGNS = 'http://www.w3.org/2000/svg';

/* h('div.cls#id', {attrs}, ...children) */
/* A string, node or array in the attributes position is a child. */
const isAttrs = a => a !== null && typeof a === 'object' && !(a instanceof Node) && !Array.isArray(a);

export function h(sel, attrs, ...kids) {
  if (!isAttrs(attrs)) { kids.unshift(attrs); attrs = null; }
  const { tag, id, cls } = parseSel(sel);
  const el = document.createElement(tag);
  if (id) el.id = id;
  if (cls.length) el.className = cls.join(' ');
  applyAttrs(el, attrs);
  append(el, kids);
  return el;
}

export function s(sel, attrs, ...kids) {
  if (!isAttrs(attrs)) { kids.unshift(attrs); attrs = null; }
  const { tag, id, cls } = parseSel(sel);
  const el = document.createElementNS(SVGNS, tag);
  if (id) el.setAttribute('id', id);
  if (cls.length) el.setAttribute('class', cls.join(' '));
  applyAttrs(el, attrs, true);
  append(el, kids);
  return el;
}

function parseSel(sel) {
  const m = sel.match(/^([a-zA-Z0-9]*)/);
  const tag = m[1] || 'div';
  const id = (sel.match(/#([\w-]+)/) || [])[1];
  const cls = [...sel.matchAll(/\.([\w-]+)/g)].map(x => x[1]);
  return { tag, id, cls };
}

function applyAttrs(el, attrs, isSvg) {
  if (!attrs || typeof attrs !== 'object' || attrs instanceof Node || Array.isArray(attrs)) return;
  for (const [k, v] of Object.entries(attrs)) {
    if (v === undefined || v === null || v === false) continue;
    if (k.startsWith('on') && typeof v === 'function') el.addEventListener(k.slice(2).toLowerCase(), v);
    else if (k === 'style' && typeof v === 'object') Object.assign(el.style, v);
    else if (k === 'text') el.textContent = v;
    else if (k === 'html') el.innerHTML = v;       // only ever used with our own static strings
    else if (k === 'class' && isSvg) el.setAttribute('class', v);
    else if (k === 'class') el.className = v;
    else if (k === 'dataset') Object.assign(el.dataset, v);
    else if (!isSvg && k in el && typeof v !== 'string') el[k] = v;
    else el.setAttribute(k, v === true ? '' : v);
  }
}

function append(el, kids) {
  for (const k of kids.flat(Infinity)) {
    if (k === null || k === undefined || k === false) continue;
    // an attrs object in child position is ignored
    if (typeof k === 'object' && !(k instanceof Node)) continue;
    el.append(k instanceof Node ? k : document.createTextNode(String(k)));
  }
}

export function clear(el) { while (el.firstChild) el.removeChild(el.firstChild); return el; }

export function setText(el, t) { if (el.textContent !== t) el.textContent = t; }

export function toggleClass(el, c, on) { if (el.classList.contains(c) !== !!on) el.classList.toggle(c, !!on); }

/* A button that looks like the rest of the console. */
export function btn(label, onClick, cls = '', attrs = {}) {
  return h('button.btn' + (cls ? '.' + cls.split(' ').join('.') : ''), { type: 'button', onclick: onClick, ...attrs }, label);
}

export function throttle(fn, ms) {
  let last = 0;
  return (...a) => { const n = performance.now(); if (n - last >= ms) { last = n; fn(...a); } };
}
