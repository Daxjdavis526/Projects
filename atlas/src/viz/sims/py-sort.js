// Sorting and searching, step by step: the values as bars, and an algorithm
// walked through one comparison at a time — insertion sort (a key walking left
// through the sorted part), bottom-up merge sort (runs merged pairwise), or a
// binary search for the bracket T[i] ≤ x < T[i+1] in a sorted table (the range
// halving with each probe). A comparison counter runs alongside.
//
//   { type: 'py-sort', params: {
//       mode: 'insertion' | 'merge' | 'search',
//       values: [5, 2, 4, 6, 1, 3],     // the list (for search: the sorted table)
//       target: 147,                     // search only: the value to bracket, in [values[0], values[n−1])
//       labels: ['0', '10', …],          // optional text under each bar instead of its index
//       unit: '°C',                       // optional, appended to the target's label
//       step: 0,                          // the frame shown first (0 = the start)
//       controls: true } }                // false: a still picture of that frame (for a question)
//
// The traces come from ../model/py-sort.js (tested in test/py-sort.test.mjs).

import { themeColors } from '../plot.js';
import { h, mdi } from '../../ui/dom.js';
import { insertionTrace, mergeTrace, searchTrace } from '../model/py-sort.js';

export const defaults = { mode: 'insertion', values: [5, 2, 4, 6, 1, 3], target: null, labels: null, unit: '', step: 0, controls: true };
const MODES = ['insertion', 'merge', 'search'];

const traceOf = (P) => (P.mode === 'merge' ? mergeTrace(P.values) : P.mode === 'search' ? searchTrace(P.values, P.target) : insertionTrace(P.values));

export function mount(F, P) {
  const frames = traceOf(P);
  const { canvas, box } = F.canvas({ aspect: 'wide', label: P.alt || `${P.mode === 'search' ? 'Binary search' : P.mode === 'merge' ? 'Merge sort' : 'Insertion sort'}, step by step` });
  const noteEl = h('div.small', { style: { padding: '.45rem .9rem 0', minHeight: '1.4em' } });
  box.after(noteEl);
  const ctx = canvas.getContext('2d');
  const live = P.controls !== false && frames.length > 1;
  const start = Math.max(0, Math.min(frames.length - 1, P.step || 0));
  let anim = null;
  if (live) {
    F.slider({ key: 'step', label: 'Step', min: 1, max: frames.length, step: 1, value: start + 1, explain: P.mode === 'search' ? 'Each step is one probe of the table.' : 'Each step is one comparison (or one merge) of the algorithm.' });
    F.button({ label: '◀ Back', onClick: () => { anim?.stop(); F.set('step', Math.max(1, F.params.step - 1)); } });
    F.button({ label: 'Next ▶', primary: true, onClick: () => { anim?.stop(); F.set('step', Math.min(frames.length, F.params.step + 1)); } });
    F.button({ label: 'Play', onClick: () => {
      anim?.stop();
      if (F.params.step >= frames.length) F.set('step', 1);
      let acc = 0;
      anim = F.animate((dt) => {
        acc += dt;
        if (acc < 0.7) return;
        acc = 0;
        if (F.params.step >= frames.length) { anim.stop(); return; }
        F.set('step', F.params.step + 1);
      }, { force: true });
    } });
  }
  F.onChange(() => draw());

  function draw() {
    const k = live ? F.params.step - 1 : start;
    const fr = frames[k];
    const c = themeColors();
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const W = canvas.clientWidth || 600, H = canvas.clientHeight || 300;
    canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);
    paint(ctx, W, H, fr, P, c);
    noteEl.replaceChildren(mdi(fr.note));
    F.readout([[P.mode === 'search' ? 'probes so far' : 'comparisons so far', String(fr.comparisons)], ['step', `${k + 1}\\text{ of }${frames.length}`]]);
  }
  F.draw(draw);
}

function paint(g, W, H, fr, P, c) {
  const a = fr.arr, n = a.length, m = fr.mark || {};
  const L = 14, R = W - 14, T = 30, B = H - (P.mode === 'search' ? 46 : 30);
  const slot = (R - L) / n, bw = Math.max(2, slot * 0.72);
  const lo = Math.min(...P.values), hi = Math.max(...P.values);
  const y = (v) => B - (B - T) * (hi > lo ? 0.1 + 0.9 * ((v - lo) / (hi - lo)) : 0.6);
  const inRange = (r, i) => r && i >= r[0] && i < r[1];
  const font = (px, w = 500) => `${w} ${px}px Inter, system-ui, sans-serif`;
  const mono = (px) => `${px}px "JetBrains Mono", ui-monospace, Menlo, monospace`;
  const lblPx = Math.max(8.5, Math.min(12, slot * 0.36));
  const every = Math.max(1, Math.ceil(26 / slot));
  // target line for a search
  if (P.mode === 'search' && Number.isFinite(P.target)) {
    g.save(); g.strokeStyle = c.bad; g.lineWidth = 1.4; g.setLineDash([6, 5]);
    g.beginPath(); g.moveTo(L, y(P.target)); g.lineTo(R, y(P.target)); g.stroke(); g.restore();
    g.font = font(12, 650); g.textAlign = 'left'; g.textBaseline = 'bottom';
    const label = `x = ${+P.target.toPrecision(5)}${P.unit ? ' ' + P.unit : ''}`;
    g.lineWidth = 3.5; g.strokeStyle = c.bg; g.strokeText(label, L + 4, y(P.target) - 3);
    g.fillStyle = c.bad; g.fillText(label, L + 4, y(P.target) - 3);
  }
  for (let i = 0; i < n; i++) {
    const x = L + i * slot + (slot - bw) / 2, top = y(a[i]);
    let col = c.ink3, alpha = 0.38;
    if (inRange(m.sorted, i)) { col = c.accent; alpha = 0.7; }
    if (m.runs) { if (inRange(m.runs[0], i)) { col = c.accent; alpha = 0.75; } else if (inRange(m.runs[1], i)) { col = c.violet; alpha = 0.75; } }
    if (inRange(m.merged, i)) { col = c.good; alpha = 0.7; }
    if (P.mode === 'search') {
      const inside = i >= m.lo && i <= m.hi;
      col = c.accent; alpha = inside ? 0.6 : 0.12;
      if (m.found !== undefined && (i === m.found || i === m.found + 1)) { col = c.good; alpha = 0.85; }
    }
    if (i === m.key || i === m.mid) { col = c.gold; alpha = 0.95; }
    g.globalAlpha = alpha; g.fillStyle = col;
    g.fillRect(x, top, bw, B - top);
    g.globalAlpha = 1;
    if (m.compare && m.compare.includes(i)) { g.strokeStyle = c.warn; g.lineWidth = 2; g.strokeRect(x - 1.5, top - 1.5, bw + 3, B - top + 3); }
    // value above, index (or label) below
    if (slot >= 16 || i % every === 0) {
      g.font = mono(lblPx); g.textAlign = 'center';
      g.fillStyle = alpha < 0.2 ? c.ink4 : c.ink; g.textBaseline = 'bottom';
      if (slot >= 16) g.fillText(fmt(a[i]), x + bw / 2, top - 3);
      g.fillStyle = c.ink3; g.textBaseline = 'top';
      g.fillText(P.labels ? String(P.labels[i]) : String(i), x + bw / 2, B + 4);
    }
  }
  // the search's bracket
  if (P.mode === 'search' && Number.isInteger(m.lo)) {
    const cx = (i) => L + i * slot + slot / 2, yb = B + 24;
    g.strokeStyle = c.ink2; g.lineWidth = 1.4;
    g.beginPath(); g.moveTo(cx(m.lo), yb - 5); g.lineTo(cx(m.lo), yb); g.lineTo(cx(m.hi), yb); g.lineTo(cx(m.hi), yb - 5); g.stroke();
    g.font = font(11, 600); g.fillStyle = c.ink2; g.textBaseline = 'top';
    g.textAlign = 'center';
    g.fillText('lo', cx(m.lo), yb + 3);
    g.fillText('hi', cx(m.hi), yb + 3);
    if (Number.isInteger(m.mid)) { g.fillStyle = c.gold; g.fillText('mid', cx(m.mid), yb + 3); }
  }
}

function fmt(v) { return Number.isInteger(v) ? String(v) : String(+v.toPrecision(3)); }

/** Node-side check used by the content tests. */
export function validate(P) {
  const out = [];
  if (!MODES.includes(P.mode)) out.push(`py-sort: unknown mode ${P.mode}`);
  const v = P.values;
  if (!Array.isArray(v) || v.length < 2 || v.length > 48 || !v.every(Number.isFinite)) out.push('py-sort: values must be 2 to 48 finite numbers');
  else if (P.mode === 'search') {
    if (!v.every((x, i) => i === 0 || x > v[i - 1])) out.push('py-sort: a search table must be strictly increasing');
    if (!Number.isFinite(P.target) || P.target < v[0] || P.target >= v[v.length - 1]) out.push('py-sort: the search target must lie in [values[0], values[n − 1])');
  }
  if (P.labels && (!Array.isArray(P.labels) || P.labels.length !== v?.length)) out.push('py-sort: labels must match the values one for one');
  if (!out.length) {
    const n = traceOf(P).length;
    if (!(Number.isInteger(P.step ?? 0) && (P.step ?? 0) >= 0 && (P.step ?? 0) < n)) out.push(`py-sort: step must be a frame index below ${n}`);
  }
  return out;
}
