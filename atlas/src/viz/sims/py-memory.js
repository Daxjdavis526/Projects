// Python's memory as names and objects — frames of names on the left, the
// objects they refer to on the right, an arrow for every reference. It shows
// aliasing (two names, one list), copies (two lists), the function object that
// keeps a mutable default argument alive between calls, the call stack of a
// recursion, and a NumPy view sharing its base array's buffer. One picture, or
// a short program stepped through line by line.
//
//   { type: 'py-memory', params: {
//       code: ['a = [1, 2, 3]', 'b = a', 'b.append(4)'],   // optional listing; a step marks the line just run
//       steps: [{
//         line: 1,                                 // index into code of the line just run (omit for none)
//         note: '`b = a` binds a second name',     // markup shown under the picture at this step
//         frames: [{ name: 'Global frame', vars: [['a', '@L1'], ['b', '@L1']] }],
//         objects: { L1: { type: 'list', items: [1, 2, 3] } },
//         highlight: ['L1', 'Global frame:b'],     // objects (by key) and names (frame:name) drawn in gold
//       }, …],
//       step: 0 } }                                // the step shown first (0-based)
//
// Values: anything not starting with '@' is drawn as written, so give Python's
// own spelling as a string ('2.0', "'He'", 'None'); '@key' is a reference to
// objects[key], drawn as a dot with an arrow.
// Object types:
//   list, tuple   cells with their indices above:   { type: 'list', items: [1, '@L2'] }
//   dict          key → value rows:                  { type: 'dict', items: [["'Mars'", '1.524'], …] }
//   array         an ndarray's buffer of numbers:    { type: 'array', items: [0, 1, 2], dtype: 'int64' }
//   view          a NumPy view into another array:   { type: 'view', of: 'A1', start: 1, stop: 4, label: 'b = a[1:4]' }
//                 drawn as a header whose arrow points into its base's buffer,
//                 with the shared cells bracketed in the view's colour
//   record        anything with named fields — a function object and its
//                 defaults, an instance:             { type: 'record', label: 'function f(x, log=…)', fields: [['defaults', '@L1']] }
// Any object may carry `label` (replacing the type name drawn above it) and
// `faded: true` (garbage: nothing refers to it any more).
// Small ints, floats and strings are drawn inside the boxes for clarity; in
// CPython they are objects too — captions should say so where it matters.

import { themeColors } from '../plot.js';
import { h, mdi } from '../../ui/dom.js';

export const defaults = { code: null, steps: [], step: 0 };
const TYPES = ['list', 'tuple', 'dict', 'array', 'view', 'record'];
const isRef = (v) => typeof v === 'string' && v.startsWith('@');

export function mount(F, P) {
  const steps = P.steps || [];
  const { canvas, box } = F.canvas({ aspect: '', label: P.alt || 'Diagram of names and the objects they refer to' });
  box.style.aspectRatio = 'auto';
  const noteEl = h('div.small', { style: { padding: '.45rem .9rem 0', minHeight: '1.4em' } });
  box.after(noteEl);
  const ctx = canvas.getContext('2d');
  if (steps.length > 1) {
    F.slider({ key: 'step', label: 'Step', min: 1, max: steps.length, step: 1, value: Math.min(steps.length, (P.step || 0) + 1), explain: 'Each step runs one more line of the program; the highlighted line is the one just run.' });
    F.button({ label: '◀ Back', onClick: () => F.set('step', Math.max(1, F.params.step - 1)) });
    F.button({ label: 'Next ▶', primary: true, onClick: () => F.set('step', Math.min(steps.length, F.params.step + 1)) });
  }
  F.onChange(() => draw());
  let lastH = 0;

  function draw() {
    const k = steps.length > 1 ? F.params.step - 1 : Math.min(steps.length - 1, P.step || 0);
    const S = steps[Math.max(0, k)];
    if (!S) return;
    const c = themeColors();
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const W = canvas.clientWidth || 600;
    const L = layout(ctx, S, P.code, W);
    const Hpx = Math.ceil(L.height * L.scale) + 4;
    if (Math.abs(Hpx - lastH) > 1) { lastH = Hpx; box.style.height = `${Hpx}px`; }
    canvas.width = Math.round(W * dpr); canvas.height = Math.round(Hpx * dpr);
    ctx.setTransform(dpr * L.scale, 0, 0, dpr * L.scale, 0, 0);
    ctx.clearRect(0, 0, W / L.scale, Hpx / L.scale);
    ctx.translate(L.shift, 0);
    paint(ctx, L, S, P.code, c);
    noteEl.replaceChildren(S.note ? mdi(S.note) : '');
    noteEl.hidden = !S.note;
  }
  F.draw(draw);
}

// ---- layout (pure: measures text with the context, places every box) ----

const SANS = (px, w = 500) => `${w} ${px}px Inter, system-ui, sans-serif`;
const MONO = (px) => `${px}px "JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, Consolas, monospace`;
const ROW = 27, CELL_H = 28, HEAD = 17, IDX = 13, GAP = 16, COLGAP = 52, PAD = 10;

function layout(ctx, S, code, W) {
  const tw = (s, font) => { ctx.font = font; return ctx.measureText(String(s)).width; };
  const valW = (v) => (isRef(v) ? 12 : tw(v, MONO(12.5)));
  // the code listing
  let codeBox = null;
  if (code?.length) {
    const lw = Math.max(...code.map((l) => tw(l, MONO(12.5))));
    codeBox = { w: lw + 44, h: code.length * 21 + 14 };
  }
  // frames
  const frames = (S.frames || []).map((f) => {
    const nameW = Math.max(30, ...f.vars.map(([n]) => tw(n, MONO(12.5))));
    const vw = Math.max(40, ...f.vars.map(([, v]) => valW(v) + 18));
    const w = Math.max(tw(f.name, SANS(12, 650)) + 20, nameW + vw + 30);
    return { f, nameW, vw, w, h: HEAD + 8 + Math.max(1, f.vars.length) * ROW + 6 };
  });
  const fw = Math.max(110, ...frames.map((q) => q.w));
  frames.forEach((q) => { q.w = fw; });
  // objects: sizes
  const objs = {};
  for (const [key, o] of Object.entries(S.objects || {})) {
    const label = o.label ?? (o.type === 'array' ? `ndarray${o.dtype ? ' · ' + o.dtype : ''}` : o.type === 'view' ? 'ndarray (view)' : o.type);
    const headW = tw(label, SANS(11.5, 600)) + 4;
    let w, hh, cells = null, rows = null;
    if (o.type === 'list' || o.type === 'tuple' || o.type === 'array') {
      cells = (o.items || []).map((v) => Math.max(30, valW(v) + 16));
      w = Math.max(cells.reduce((a, b) => a + b, 0), o.items?.length ? 0 : 40);
      hh = HEAD + IDX + CELL_H;
    } else if (o.type === 'dict' || o.type === 'record' || o.type === 'view') {
      const pairs = o.type === 'dict' ? o.items || [] : o.type === 'record' ? o.fields || [] : [['base', `@${o.of}`]];
      const kw = Math.max(26, ...pairs.map(([kk]) => tw(kk, MONO(12.5)) + 14));
      const vw = Math.max(34, ...pairs.map(([, v]) => valW(v) + 18));
      rows = { pairs, kw, vw };
      w = kw + vw;
      hh = HEAD + Math.max(1, pairs.length) * ROW;
      if (o.type === 'record' && !pairs.length) { rows = null; w = headW + 18; hh = ROW; }
    }
    objs[key] = { key, o, label, w: Math.max(w, headW), cw: w, h: hh, cells, rows, depth: null, order: 0 };
  }
  // reference depth from the frames, breadth first
  const refsOf = (o) => {
    if (o.type === 'list' || o.type === 'tuple' || o.type === 'array') return (o.items || []).filter(isRef);
    if (o.type === 'dict') return (o.items || []).flatMap(([kk, v]) => [kk, v]).filter(isRef);
    if (o.type === 'record') return (o.fields || []).map(([, v]) => v).filter(isRef);
    if (o.type === 'view') return [`@${o.of}`];
    return [];
  };
  let order = 0, queue = [];
  for (const q of frames) for (const [, v] of q.f.vars) {
    const t = isRef(v) && objs[v.slice(1)];
    if (t && t.depth === null) { t.depth = 1; t.order = order++; queue.push(t); }
  }
  while (queue.length) {
    const next = [];
    for (const o of queue) for (const r of refsOf(o.o)) {
      const t = objs[r.slice(1)];
      if (t && t.depth === null) { t.depth = o.depth + 1; t.order = order++; next.push(t); }
    }
    queue = next;
  }
  for (const o of Object.values(objs)) if (o.depth === null) { o.depth = 1; o.order = order++; }
  const ncol = Math.max(0, ...Object.values(objs).map((o) => o.depth));
  const colW = Array.from({ length: ncol }, (_, i) => Math.max(0, ...Object.values(objs).filter((o) => o.depth === i + 1).map((o) => o.w)));
  const diagramW = fw + colW.reduce((a, b) => a + b + COLGAP, 0);
  // the listing beside the diagram when there is room, else above it
  const side = codeBox && codeBox.w + 24 + diagramW + 2 * PAD <= W;
  const x0 = PAD + (side ? codeBox.w + 24 : 0);
  const y0 = PAD + (codeBox && !side ? codeBox.h + 14 : 0);
  if (codeBox) { codeBox.x = PAD; codeBox.y = PAD; }
  // frames, top to bottom
  let y = y0;
  for (const q of frames) {
    q.x = x0; q.y = y;
    q.slots = q.f.vars.map(([n, v], i) => ({ name: n, v, cx: q.x + q.nameW + 20 + q.vw / 2, cy: q.y + HEAD + 8 + i * ROW + ROW / 2 }));
    y += q.h + GAP;
  }
  const framesBottom = y - GAP;
  // object columns: each object as near its first referrer's height as the column allows
  const sources = {};
  for (const q of frames) for (const s of q.slots) if (isRef(s.v) && !sources[s.v]) sources[s.v] = s.cy;
  let cx = x0 + fw + COLGAP;
  for (let col = 1; col <= ncol; col++) {
    let yy = y0;
    const inCol = Object.values(objs).filter((o) => o.depth === col).sort((a, b) => a.order - b.order);
    for (const o of inCol) {
      const anchor = o.rows ? HEAD + ROW / 2 : o.cells ? HEAD + IDX + CELL_H / 2 : ROW / 2;
      const want = sources[`@${o.key}`] !== undefined ? sources[`@${o.key}`] - anchor : yy;
      o.x = cx; o.y = Math.max(yy, want);
      o.anchorY = o.y + anchor;
      yy = o.y + o.h + GAP + 6;
      // what this object points at, for the next column
      positionSlots(o);
      for (const s of o.slots) if (isRef(s.v) && sources[s.v] === undefined) sources[s.v] = s.cy;
    }
    cx += colW[col - 1] + COLGAP;
  }
  const bottom = Math.max(framesBottom, codeBox ? codeBox.y + codeBox.h : 0, ...Object.values(objs).map((o) => o.y + o.h + 14));
  const width = Math.max(cx - COLGAP + PAD, codeBox ? codeBox.x + codeBox.w + PAD : 0);
  const scale = Math.min(1, W / width);
  const shift = Math.max(0, (W / scale - width) / 2);
  return { frames, objs, codeBox, side, height: bottom + PAD, scale, shift };
}

function positionSlots(o) {
  o.slots = [];
  if (o.cells) {
    let x = o.x;
    o.cellX = [];
    o.cells.forEach((w, i) => { o.cellX.push(x); o.slots.push({ v: o.o.items[i], cx: x + w / 2, cy: o.y + HEAD + IDX + CELL_H / 2 }); x += w; });
  } else if (o.rows) {
    o.rows.pairs.forEach(([kk, v], i) => {
      const cy = o.y + HEAD + i * ROW + ROW / 2;
      if (isRef(kk)) o.slots.push({ v: kk, cx: o.x + o.rows.kw / 2, cy });
      o.slots.push({ v, cx: o.x + o.rows.kw + o.rows.vw / 2, cy });
    });
  }
}

// ---- painting ----

function paint(g, L, S, code, c) {
  const hi = new Set(S.highlight || []);
  const round = (x, y, w, hh, r) => { g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + hh, r); g.arcTo(x + w, y + hh, x, y + hh, r); g.arcTo(x, y + hh, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath(); };
  const text = (s, x, y, font, color, align = 'left') => { g.font = font; g.fillStyle = color; g.textAlign = align; g.textBaseline = 'middle'; g.fillText(String(s), x, y); };
  // the listing, with the line just run marked
  if (L.codeBox && code) {
    const B = L.codeBox;
    round(B.x, B.y, B.w, B.h, 8); g.fillStyle = c.bg; g.fill(); g.strokeStyle = c.line2; g.lineWidth = 1; g.stroke();
    code.forEach((line, i) => {
      const ly = B.y + 7 + i * 21 + 10.5;
      if (S.line === i) { g.fillStyle = c.accent; g.globalAlpha = 0.18; g.fillRect(B.x + 1, ly - 10.5, B.w - 2, 21); g.globalAlpha = 1; text('→', B.x + 8, ly, SANS(12, 700), c.accent); }
      text(i + 1, B.x + 30, ly, MONO(11), c.ink3, 'right');
      text(line, B.x + 38, ly, MONO(12.5), S.line === i ? c.ink : c.ink2);
    });
  }
  const arrows = [];
  // frames
  for (const q of L.frames) {
    round(q.x, q.y, q.w, q.h, 7); g.fillStyle = c.panel; g.fill(); g.strokeStyle = c.line3; g.lineWidth = 1.2; g.stroke();
    text(q.f.name, q.x + 10, q.y + HEAD / 2 + 4, SANS(12, 650), c.ink2);
    for (const s of q.slots) {
      const gold = hi.has(`${q.f.name}:${s.name}`);
      text(s.name, q.x + q.nameW + 10, s.cy, MONO(12.5), gold ? c.gold : c.ink, 'right');
      cell(g, s.cx - q.vw / 2 + 4, s.cy - 11, q.vw - 8, 22, c, gold ? c.gold : c.line3, gold);
      drawValue(s, gold ? c.gold : c.accent2, arrows, gold);
    }
  }
  // objects
  for (const o of Object.values(L.objs)) {
    const gold = hi.has(o.key);
    const edge = gold ? c.gold : c.line3;
    g.globalAlpha = o.o.faded ? 0.38 : 1;
    if (!o.cells && !o.rows) {
      cell(g, o.x, o.y, o.w, ROW, c, edge, gold, c.violet);
      text(o.label, o.x + 9, o.y + ROW / 2, SANS(11.5, 600), gold ? c.gold : c.ink2);
      g.globalAlpha = 1;
      continue;
    }
    text(o.label, o.x, o.y + HEAD / 2, SANS(11.5, 600), gold ? c.gold : c.ink3);
    if (o.cells) {
      o.cells.forEach((w, i) => {
        const x = o.cellX[i];
        text(i, x + w / 2, o.y + HEAD + IDX / 2, MONO(10), c.ink4, 'center');
        cell(g, x, o.y + HEAD + IDX, w, CELL_H, c, edge, gold, o.o.type === 'tuple' ? c.violet : c.accent);
      });
    } else if (o.rows) {
      o.rows.pairs.forEach(([kk], i) => {
        const yy = o.y + HEAD + i * ROW;
        cell(g, o.x, yy, o.rows.kw, ROW, c, edge, gold, c.teal);
        cell(g, o.x + o.rows.kw, yy, o.rows.vw, ROW, c, edge, gold, c.accent);
        if (!isRef(kk)) text(kk, o.x + o.rows.kw / 2, yy + ROW / 2, MONO(12.5), c.ink, 'center');
      });
    }
    for (const s of o.slots) drawValue(s, c.accent2, arrows, false, o.o.type === 'view' ? { of: o.o.of, start: o.o.start } : null);
    g.globalAlpha = 1;
  }
  // a view brackets the cells it shares with its base
  for (const o of Object.values(L.objs)) {
    if (o.o.type !== 'view') continue;
    const base = L.objs[o.o.of];
    if (!base?.cells) continue;
    const step = o.o.step || 1, stop = Math.min(o.o.stop ?? base.cells.length, base.cells.length);
    for (let i = o.o.start || 0; i < stop; i += step) {
      const x = base.cellX[i], w = base.cells[i];
      g.strokeStyle = c.gold; g.lineWidth = 2.2;
      round(x + 2, base.y + HEAD + IDX + 2, w - 4, CELL_H - 4, 4); g.stroke();
    }
  }
  // arrows on top, as Python Tutor draws them
  for (const a of arrows) {
    const t = L.objs[a.ref.slice(1)];
    if (!t) continue;
    const top = t.cells ? t.y + HEAD + IDX : t.rows ? t.y + HEAD : t.y, bottom = t.y + t.h;
    let tx, ty, dir;
    if (a.into && t.cells) {
      const i = a.into.start || 0;
      tx = t.cellX[i] + t.cells[i] / 2;
      [ty, dir] = a.y < top ? [top, 'down'] : [bottom, 'up'];
    } else if (t.x >= a.x + 12) [tx, ty, dir] = [t.x, t.anchorY, 'right'];
    else { tx = t.x + Math.min(22, t.cw / 2); [ty, dir] = a.y < top ? [top, 'down'] : [bottom, 'up']; }
    arrow(g, a.x, a.y, tx, ty, a.color, dir);
  }

  function drawValue(s, color, list, gold, into) {
    if (isRef(s.v)) {
      g.fillStyle = color; g.beginPath(); g.arc(s.cx, s.cy, 3.6, 0, 2 * Math.PI); g.fill();
      list.push({ x: s.cx, y: s.cy, ref: s.v, color: gold ? c.gold : color, into });
    } else text(s.v, s.cx, s.cy, MONO(12.5), c.ink, 'center');
  }
}

function cell(g, x, y, w, hh, c, edge, gold, tint = null) {
  if (tint) { g.fillStyle = tint; const a = g.globalAlpha; g.globalAlpha = a * 0.09; g.fillRect(x, y, w, hh); g.globalAlpha = a; }
  g.strokeStyle = edge; g.lineWidth = gold ? 2 : 1; g.strokeRect(x + 0.5, y + 0.5, w - 1, hh - 1);
}

function arrow(g, x0, y0, x1, y1, color, dir) {
  g.save();
  g.strokeStyle = color; g.fillStyle = color; g.lineWidth = 1.7;
  g.beginPath(); g.moveTo(x0, y0);
  let ex, ey, ang;
  if (dir === 'down' || dir === 'up') {
    // into the top (or the bottom) of a box: a reference back to the left, or into a buffer cell
    const s = dir === 'down' ? 1 : -1;
    g.bezierCurveTo(x0 + 34, y0, x1, y1 - s * 42, x1, y1 - s * 2);
    ex = x1; ey = y1 - s * 2; ang = s * Math.PI / 2;
  } else {
    const d = Math.max(30, Math.abs(x1 - x0) * 0.45);
    g.bezierCurveTo(x0 + d, y0, x1 - d, y1, x1 - 2, y1);
    ex = x1 - 2; ey = y1; ang = 0;
  }
  g.stroke();
  g.beginPath();
  g.moveTo(ex, ey);
  g.lineTo(ex - 9 * Math.cos(ang) + 4.5 * Math.sin(ang), ey - 9 * Math.sin(ang) - 4.5 * Math.cos(ang));
  g.lineTo(ex - 9 * Math.cos(ang) - 4.5 * Math.sin(ang), ey - 9 * Math.sin(ang) + 4.5 * Math.cos(ang));
  g.closePath(); g.fill();
  g.restore();
}

/** Node-side check used by the content tests: every step is drawable and every reference resolves. */
export function validate(P) {
  const out = [];
  const steps = P.steps || [];
  if (!steps.length) out.push('py-memory needs at least one step');
  if (P.code !== null && P.code !== undefined && !(Array.isArray(P.code) && P.code.every((l) => typeof l === 'string'))) out.push('code must be a list of lines');
  steps.forEach((S, k) => {
    const where = `step ${k + 1}`;
    const objs = S.objects || {};
    if (!Array.isArray(S.frames)) out.push(`${where}: frames must be a list`);
    if (S.line !== undefined && !(P.code && Number.isInteger(S.line) && S.line >= 0 && S.line < P.code.length)) out.push(`${where}: line ${S.line} is not a line of the code`);
    const check = (v, what) => { if (isRef(v) && !objs[v.slice(1)]) out.push(`${where}: ${what} refers to ${v}, which is not in objects`); };
    for (const f of S.frames || []) {
      if (!f.name || !Array.isArray(f.vars)) { out.push(`${where}: a frame needs a name and vars`); continue; }
      for (const pair of f.vars) { if (!Array.isArray(pair) || pair.length !== 2) out.push(`${where}: frame ${f.name}: each var is [name, value]`); else check(pair[1], `${f.name}:${pair[0]}`); }
    }
    for (const [key, o] of Object.entries(objs)) {
      if (!TYPES.includes(o.type)) { out.push(`${where}: object ${key} has unknown type ${o.type}`); continue; }
      if (['list', 'tuple', 'array'].includes(o.type)) (o.items || []).forEach((v, i) => check(v, `${key}[${i}]`));
      if (o.type === 'dict') for (const pair of o.items || []) { if (!Array.isArray(pair) || pair.length !== 2) out.push(`${where}: dict ${key}: each item is [key, value]`); else pair.forEach((v) => check(v, `${key} item`)); }
      if (o.type === 'record') for (const pair of o.fields || []) { if (!Array.isArray(pair) || pair.length !== 2) out.push(`${where}: record ${key}: each field is [name, value]`); else check(pair[1], `${key}.${pair[0]}`); }
      if (o.type === 'view') {
        const base = objs[o.of];
        if (!base || base.type !== 'array') out.push(`${where}: view ${key} must be of an array in objects`);
        else if (!(Number.isInteger(o.start ?? 0) && (o.stop ?? base.items.length) <= base.items.length)) out.push(`${where}: view ${key} runs past its base`);
      }
    }
    for (const hname of S.highlight || []) if (!objs[hname] && !(S.frames || []).some((f) => f.vars.some(([n]) => `${f.name}:${n}` === hname))) out.push(`${where}: highlight ${hname} names nothing`);
  });
  return out;
}
