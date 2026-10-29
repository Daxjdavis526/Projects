// Elimination, one row operation at a time. Above: the matrix in exact
// fractions, with the operation just applied written out (R₂ ← R₂ − 2R₁),
// the pivot it used ringed in gold and the row it changed tinted. Below: what
// the rows mean — with two unknowns each row is a line in the plane, with
// three a plane in space (drag to turn it) — and the points they all share:
// one point, a line, or none. A row operation moves the pictures of the rows
// it changes but never the set of points they share: that is why elimination
// is allowed. The steps are computed (forward elimination to echelon form, or
// on to reduced form by Gauss–Jordan) or given by the lesson; in LU mode the
// multipliers fill L beside U as elimination goes. Exact arithmetic lives in
// model/la-linear.js (test/la-linear.test.mjs).
//
//   { type: 'la-rowreduce', params: {
//       M: [[2, 4, -2, 2], [4, 9, -3, 8], [-2, -3, 7, 10]],   // rows; entries are numbers or 'p/q' strings
//       systems: null,              // or several to choose from: [{ label: 'One point', M: […] }, …] (each may set its own mode, ops, aug)
//       aug: true,                  // the last column is the right-hand side (after a bar); a number k: the last k columns; false: none
//       mode: 'ref',                // 'ref' forward elimination | 'rref' Gauss–Jordan | 'lu' L beside U (no row exchanges)
//       ops: null,                  // the lesson's own steps instead: [['add', 2, 1, -2], ['swap', 1, 3], ['scale', 2, '1/4']] (rows from 1)
//       step: 0,                    // the step shown first (0 = the starting matrix)
//       stepper: true,              // a step slider with Back and Next; false shows `step` only (a question's picture)
//       picture: 'auto',            // 'auto': lines for 2 unknowns, planes for 3 (one right-hand side); 'none'
//       solution: true,             // mark the shared point or line
//       vars: null,                 // the unknowns' names, plain text (default x, y, z; x₁ … for more)
//       colLabels: null,            // column heads instead of the unknowns' names (plain text: 'C₁₂H₂₆')
//       rowLabels: null,            // row names (plain text) instead of R₁, R₂, …
//       view: null,                 // the picture's half-width (default 4, centred on the solution)
//       readout: true,              // the solution set below the picture; false hides it
//       notes: null,                // say on the picture what a row 0 = c means (default: with the readout)
//   } }

import { Plot } from '../plot.js';
import { View3D } from '../three-d.js';
import { h, tex } from '../../ui/dom.js';
import * as Q from '../model/la-linear.js';
import * as G from '../model/calc-vectors3d.js';

export const defaults = {
  M: null, systems: null, aug: true, mode: 'ref', ops: null, step: 0, stepper: true, picture: 'auto',
  solution: true, vars: null, colLabels: null, rowLabels: null, view: null, readout: true, notes: null,
};

const ROW_COLORS = ['accent', 'warn', 'good', 'violet', 'teal', 'bad'];
const CSS = { accent: '--accent', warn: '--warn', good: '--good', violet: '--violet', teal: '--teal', bad: '--bad', gold: '--gold' };
const SUBS = '₀₁₂₃₄₅₆₇₈₉';
const sub = (n) => String(n).replace(/\d/g, (d) => SUBS[d]);
const rhsOf = (aug) => (aug === true ? 1 : aug === false ? 0 : aug);

function build(sys, P) {
  const A = Q.qmatrix(sys.M);
  const rhs = rhsOf(sys.aug ?? P.aug), nvar = A[0].length - rhs, mode = sys.mode || P.mode;
  const ops = sys.ops ?? P.ops;
  const red = ops ? Q.replay(A, ops) : Q.reduce(A, { nvar, mode });
  const set = rhs === 1 ? Q.solutionSet(A, nvar) : null;
  return { A, rhs, nvar, mode, red, set, label: sys.label };
}

export function mount(F, P) {
  const systems = (P.systems?.length ? P.systems : [{ M: P.M }]).map((s) => build(s, P));
  let cur = systems[0];
  const vars = (n) => P.vars || (n <= 3 ? ['x', 'y', 'z'].slice(0, n) : Array.from({ length: n }, (_, k) => `x${sub(k + 1)}`));

  // the matrix panel sits above the picture
  const stage = F.el.firstChild;
  const panel = h('div', { style: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '.35rem', padding: '.8rem .6rem .5rem', overflowX: 'auto' } });
  const opLine = h('div', { style: { minHeight: '1.6rem', fontSize: '.95rem', color: 'var(--ink-2)', textAlign: 'center' }, 'aria-live': 'polite' });
  const mats = h('div', { style: { display: 'flex', flexWrap: 'wrap', gap: '.6rem 1.4rem', alignItems: 'center', justifyContent: 'center' } });
  panel.append(opLine, mats);
  stage.append(panel);

  const kind = () => (P.picture === 'none' || cur.rhs !== 1 ? 'none' : cur.nvar === 2 ? 'lines' : cur.nvar === 3 ? 'planes' : 'none');
  const pictureKind = kind();
  // one canvas for the whole life of the sim: lines or planes (every system offered has the same shape)
  let plot = null, view = null, overlay = null, noteBox = null;
  if (pictureKind === 'lines') {
    ({ canvas: plot } = F.canvas({ aspect: 'wide', label: P.alt || 'Each row of the system drawn as a line in the plane' }));
    plot = new Plot(plot, { x: [-4, 4], y: [-2, 2], equal: true, xlabel: vars(2)[0], ylabel: vars(2)[1] });
  } else if (pictureKind === 'planes') {
    const c = F.canvas({ aspect: '', label: P.alt || 'Each row of the system drawn as a plane in space — drag to turn it' });
    overlay = c.overlay;
    view = new View3D(c.canvas, { yaw: 0.6, pitch: 0.42, dist: 14, scale: 1.25 });
    view.onChange = () => draw();
    const hint = h('div', { style: { position: 'absolute', right: '10px', bottom: '6px', fontSize: '.72rem', color: 'var(--ink-3)' } }, 'drag to rotate');
    noteBox = h('div', { style: { position: 'absolute', left: '10px', top: '8px', fontSize: '.8rem', fontWeight: 650, lineHeight: 1.5 } });
    overlay.append(hint, noteBox);
  }

  // controls
  if (systems.length > 1) F.choice({ key: 'system', label: 'System', options: systems.map((s, k) => [k, s.label || `System ${k + 1}`]), value: 0 });
  const last = () => cur.red.steps.length - 1;
  let step = Math.min(P.step || 0, last());
  let stepCtl = null;
  if (P.stepper) {
    stepCtl = F.slider({ key: 'step', label: 'Step', min: 0, max: Math.max(1, last()), step: 1, value: step, explain: 'Each step is one row operation. The rows’ pictures move; the points they share do not.' });
    F.button({ label: '◀ Back', onClick: () => go(step - 1) });
    F.button({ label: 'Next ▶', primary: true, onClick: () => go(step + 1) });
    F.button({ label: 'Start over', onClick: () => go(0) });
  }
  function go(k) { step = Math.max(0, Math.min(last(), k)); if (stepCtl) F.set('step', step); else draw(); }
  F.onChange((key) => {
    if (key === 'system') {
      cur = systems[+F.params.system];
      if (stepCtl) { const inp = stepCtl.node.querySelector('input'); inp.max = Math.max(1, last()); }
      step = Math.min(step, last());
      if (stepCtl) { stepCtl.set(step); }
      framed = false;
    }
    if (key === 'step') step = Math.min(last(), Math.round(+F.params.step));
    draw();
  });

  // ── the matrix as a table: exact entries, a bracket, a bar before the right-hand side ──
  function table(Mx, { nvar, labels, rowNames, pivot, changed, source, faintUpper, isL } = {}) {
    const rows = Mx.length, cols = Mx[0].length;
    const ink = 'var(--ink-2)';
    const serif = (pos) => `linear-gradient(${ink}, ${ink}) ${pos} / 7px 2px no-repeat`;
    const t = h('table', { style: { borderCollapse: 'separate', borderSpacing: 0, fontSize: '1rem' } });
    if (labels) {
      const tr = h('tr', h('td'));
      for (let j = 0; j < cols; j++) tr.append(h('td', { style: { textAlign: 'center', fontSize: '.72rem', color: 'var(--ink-3)', padding: '0 .3rem .15rem', borderLeft: j === nvar && nvar < cols ? '1.5px solid transparent' : null } }, labels[j] ?? ''));
      t.append(tr);
    }
    for (let i = 0; i < rows; i++) {
      const tint = i === changed ? 'var(--warn-bg)' : null;
      const name = rowNames ? rowNames[i] : `R${sub(i + 1)}`;
      const tr = h('tr', h('td', { style: { fontSize: '.72rem', color: i === source ? 'var(--accent)' : i === changed ? 'var(--warn)' : 'var(--ink-3)', paddingRight: '.45rem', textAlign: 'right', fontWeight: i === changed || i === source ? 700 : 400 } }, name));
      for (let j = 0; j < cols; j++) {
        const v = Mx[i][j];
        const bg = [];
        if (j === 0 && i === 0) bg.push(serif('left top'));
        if (j === 0 && i === rows - 1) bg.push(serif('left bottom'));
        if (j === cols - 1 && i === 0) bg.push(serif('right top'));
        if (j === cols - 1 && i === rows - 1) bg.push(serif('right bottom'));
        const isPivot = pivot && pivot[0] === i && pivot[1] === j;
        const faint = (faintUpper && j > i) || v === null;
        const td = h('td', {
          style: {
            textAlign: 'center', padding: '.18rem .5rem', minWidth: '1.9rem',
            borderLeft: j === 0 ? `2px solid ${ink}` : j === nvar && nvar < cols ? '1.5px solid var(--ink-3)' : null,
            borderRight: j === cols - 1 ? `2px solid ${ink}` : null,
            background: [bg.join(', '), tint].filter(Boolean).join(', ') || null,
            color: faint ? 'var(--ink-4)' : null,
          },
          html: v === null ? '<span style="opacity:.5">·</span>' : tex(Q.qtex(v)),
        });
        if (isPivot) {
          const ring = h('span', { style: { display: 'inline-block', outline: `2px solid var(${isL ? '--accent' : '--gold'})`, outlineOffset: '2px', borderRadius: '5px', padding: '0 .1rem' }, html: td.innerHTML });
          td.replaceChildren(ring);
        }
        tr.append(td);
      }
      t.append(tr);
    }
    return t;
  }

  // ── pictures ──
  let framed = false;
  const solutionKind = () => {
    const s = cur.set;
    if (!s) return null;
    if (!s.consistent) return { kind: 'none' };
    if (!s.directions.length) return { kind: 'point', p: s.particular.map(Q.qval) };
    return { kind: s.directions.length === 1 ? 'line' : s.directions.length === 2 ? 'plane' : 'space', p: s.particular.map(Q.qval), dirs: s.directions.map((d) => d.map(Q.qval)) };
  };
  const centre = () => { const s = solutionKind(); return s && s.p ? s.p : Array(cur.nvar).fill(0); };
  const half = () => P.view || 4;

  function drawLines(Mx) {
    const [cx, cy] = centre(), W = half();
    plot.setView([cx - W, cx + W], [cy - W / 2, cy + W / 2]);
    plot.clear();
    const g = plot.ctx;
    Mx.forEach((row, i) => {
      const [a, b, c] = row.map(Q.qval), color = ROW_COLORS[i % ROW_COLORS.length];
      if (Math.abs(a) < 1e-12 && Math.abs(b) < 1e-12) return;   // 0 = 0 or 0 = c: no line to draw
      const n2 = a * a + b * b, p0 = [(a * c) / n2, (b * c) / n2], d = [-b / Math.sqrt(n2), a / Math.sqrt(n2)];
      // the point of the line nearest the window's centre, and a long segment through it
      const t0 = (cx - p0[0]) * d[0] + (cy - p0[1]) * d[1], q = [p0[0] + t0 * d[0], p0[1] + t0 * d[1]];
      g.save(); plot._clip();
      plot.line(q[0] - 4 * W * d[0], q[1] - 4 * W * d[1], q[0] + 4 * W * d[0], q[1] + 4 * W * d[1], { color, width: 2.4, alpha: i === stepData().changed ? 1 : 0.9 });
      g.restore();
      // label where the line is about to leave the window
      let tl = Infinity;
      for (const [k, lo, hi] of [[0, plot.vx0, plot.vx1], [1, plot.vy0, plot.vy1]]) {
        if (Math.abs(d[k]) < 1e-12) continue;
        for (const edge of [lo, hi]) { const tt = (edge - q[k]) / d[k]; if (tt > 0) tl = Math.min(tl, tt); }
      }
      if (Number.isFinite(tl)) {
        const lx = q[0] + d[0] * tl * 0.82, ly = q[1] + d[1] * tl * 0.82;
        plot.text(P.rowLabels ? P.rowLabels[i] : `R${sub(i + 1)}`, lx, ly, { color, weight: 700, dx: 6, dy: -10 });
      }
    });
    zeroRowNotes(Mx).forEach(([text, color], k) => plot.text(text, plot.L + 8, plot.T + 12 + 18 * k, { screen: true, color, weight: 650 }));
    const s = solutionKind();
    if (P.solution && s?.kind === 'point') plot.point(s.p[0], s.p[1], { color: 'gold', r: 5.5 });
    if (P.solution && s?.kind === 'line') {
      const [px, py] = s.p, [dx, dy] = s.dirs[0], L = Math.hypot(dx, dy);
      g.save(); plot._clip();
      plot.line(px - (4 * W * dx) / L, py - (4 * W * dy) / L, px + (4 * W * dx) / L, py + (4 * W * dy) / L, { color: 'gold', width: 7, alpha: 0.45 });
      g.restore();
    }
  }

  const pool = [];
  function drawPlanes(Mx) {
    const c = centre(), W = half() * 0.62;
    if (!framed) {
      // frame the starting scene once; afterwards the camera is the learner's
      const pts = [];
      Mx.forEach((row) => { const n = row.slice(0, 3).map(Q.qval); if (G.length(n) > 1e-12) pts.push(...G.planeCorners(n, foot(n, Q.qval(row[3]), c), W)); });
      const fr = G.frameScene(pts.length ? pts : [c], { yaw: view.yaw, pitch: view.pitch, target: c, dist: W * 5.2, halfW: (0.95 * 1.6) / (2.2 * view.scale), halfH: 0.92 / (2.2 * view.scale), fixTarget: true });
      view.target = fr.target; view.dist = fr.dist; framed = true;
    }
    view.begin();
    const marks = [];
    view.axes(W * 1.1, vars(3));
    Mx.forEach((row, i) => {
      const n = row.slice(0, 3).map(Q.qval), d = Q.qval(row[3]), color = ROW_COLORS[i % ROW_COLORS.length];
      if (G.length(n) < 1e-12) return;
      const f = foot(n, d, c);
      view.surface(G.planePatch(n, f, W, 8), { color, alpha: i === stepData().changed ? 0.36 : 0.24, wire: false });
      const k = G.planeCorners(n, f, W);
      view.line([...k, k[0]], { color, width: i === stepData().changed ? 2 : 1.2, bias: 0 });
      marks.push([k[2], P.rowLabels ? P.rowLabels[i] : `R_${i + 1}`, color]);
    });
    const s = solutionKind();
    if (P.solution && s?.kind === 'point') view.point(s.p, { color: 'gold', r: 5.5, bias: 0.5 });
    if (P.solution && s?.kind === 'line') view.line(G.linePoints(s.p, G.unit(s.dirs[0]), -1.6 * W, 1.6 * W, 30), { color: 'gold', width: 4, bias: 0.3 });
    view.end();
    marks.forEach(([p, label, color], k) => {
      let el = pool[k];
      if (!el) { el = h('div.lbl'); overlay.append(el); pool.push(el); }
      const [sx, sy, z] = view.project(p);
      el.style.display = z > 0.05 ? '' : 'none';
      el.style.left = `${sx + 10}px`; el.style.top = `${sy - 10}px`;
      el.style.color = `var(${CSS[color]})`;
      const src = P.rowLabels ? `\\text{${label}}` : label;
      if (el.dataset.src !== src) { el.dataset.src = src; el.innerHTML = tex(src); }
    });
    for (let k = marks.length; k < pool.length; k++) pool[k].style.display = 'none';
    const notes = zeroRowNotes(Mx);
    noteBox.replaceChildren(...notes.map(([text, color]) => h('div', { style: { color: `var(${color === 'bad' ? '--bad' : '--ink-3'})` } }, text)));
  }
  // the point of the plane n·r = d nearest c
  function foot(n, d, c) { const t = (d - G.dot(n, c)) / G.dot(n, n); return G.add(c, G.scale(n, t)); }

  const stepData = () => cur.red.steps[step];
  // rows whose coefficients are all zero draw nothing, so say what they mean
  const zeroRowNotes = (Mx) => (P.notes ?? P.readout !== false) ? Mx.flatMap((row, i) => {
    if (row.slice(0, cur.nvar).some((v) => !Q.qzero(v))) return [];
    const name = P.rowLabels ? P.rowLabels[i] : `R${sub(i + 1)}`, c = row[cur.nvar];
    return [Q.qzero(c) ? [`${name} reads 0 = 0: no condition at all`, 'ink3'] : [`${name} reads 0 = ${Q.qtext(c)}: no point satisfies it`, 'bad']];
  }) : [];

  function statusTeX() {
    const s = solutionKind();
    if (!s) return null;
    const names = vars(cur.nvar).map((v) => `\\text{${v}}`);
    if (s.kind === 'none') return '\\text{none: a row reduces to } 0 = c \\ne 0';
    if (s.kind === 'point') return `\\text{one: } (${names.join(', ')}) = (${cur.set.particular.map((x) => Q.qtex(x)).join(',\\ ')})`;
    const free = cur.set.freeCols.map((k) => names[k]).join(', ');
    return `\\text{${s.kind === 'line' ? 'a line' : s.kind === 'plane' ? 'a plane' : 'every point'} — free: } ${free}`;
  }

  function draw() {
    const st = stepData();
    const n = last();
    const opTxt = st.op ? (P.stepper ? `\\text{Step ${step} of ${n}:}\\quad ${Q.opTeX(st.op)}` : `\\text{After } ${Q.opTeX(st.op)}`)
      : !P.stepper ? '' : n ? `\\text{The starting matrix} \\;(${n} \\text{ step${n === 1 ? '' : 's'} to go})` : '\\text{Already reduced}';
    opLine.innerHTML = opTxt ? tex(opTxt) : '';
    opLine.style.display = opTxt ? '' : 'none';
    opLine.setAttribute('aria-label', st.op ? `Step ${step}: ${Q.opText(st.op)}` : 'The starting matrix');
    const cols = cur.A[0].length;
    const heads = P.colLabels || [...vars(cur.nvar), ...Array(cur.rhs).fill('')];
    const showHeads = !!P.colLabels || cur.nvar <= 6;
    const parts = [];
    if (cur.mode === 'lu' && st.L) {
      const ell = st.op && st.op.kind === 'add' ? [st.op.target, st.op.source] : null;
      parts.push(h('div', { style: { display: 'flex', alignItems: 'center', gap: '.4rem' } }, h('span', { html: tex('L =') }), table(st.L, { nvar: st.L.length, pivot: ell, faintUpper: true, isL: true, rowNames: Array(st.L.length).fill('') })));
      parts.push(h('div', { style: { display: 'flex', alignItems: 'center', gap: '.4rem' } }, h('span', { html: tex(step === n && !cur.red.stuck ? 'U =' : '\\to') }), table(st.M, { nvar: cur.nvar, labels: null, rowNames: P.rowLabels, pivot: st.pivot, changed: st.changed, source: st.op?.source })));
    } else {
      parts.push(table(st.M, { nvar: cur.nvar, labels: showHeads ? heads.slice(0, cols) : null, rowNames: P.rowLabels, pivot: st.pivot, changed: st.changed, source: st.op?.kind === 'add' ? st.op.source : null }));
    }
    if (cur.red.stuck && step === n) parts.push(h('div', { style: { fontSize: '.85rem', color: 'var(--bad)', maxWidth: '22rem' }, html: tex(`\\text{Zero pivot in row ${cur.red.stuck.row + 1}: a row exchange is needed } (PA = LU)`) }));
    mats.replaceChildren(...parts);
    const k = kind();
    if (k === 'lines') drawLines(st.M);
    if (k === 'planes') drawPlanes(st.M);
    const status = P.readout !== false ? statusTeX() : null;
    F.readout(status ? [['Solutions', status]] : []);
  }
  F.draw(draw);
  F.caption(pictureKind === 'lines' ? 'Each row is a line a x + b y = c, drawn in its colour; the gold point (or band) is what they share. The window is centred on the solution.'
    : pictureKind === 'planes' ? 'Each row is a plane, drawn as a square patch of it around the solution (the planes go on for ever). Drag to rotate; the gold point or line is what they share.'
      : 'Each step is one row operation: add a multiple of one row to another, swap two rows, or scale a row by a nonzero number.');
  return { get: (key) => (key === 'step' ? step : F.params[key]) };
}

/** Node-side check used by the content tests. */
export function validate(P) {
  const problems = [];
  const list = P.systems?.length ? P.systems : [{ M: P.M }];
  if (!P.systems?.length && !P.M) return ['la-rowreduce needs M (rows of the matrix) or systems'];
  if (!['ref', 'rref', 'lu'].includes(P.mode)) problems.push(`mode must be ref, rref or lu (got ${P.mode})`);
  if (!['auto', 'none'].includes(P.picture)) problems.push('picture must be auto or none');
  let shape = null;
  list.forEach((s, k) => {
    const where = list.length > 1 ? `systems[${k}]` : 'M';
    if (!Array.isArray(s.M) || !s.M.length || !s.M.every(Array.isArray)) { problems.push(`${where} must be a list of rows`); return; }
    const cols = s.M[0].length;
    if (!s.M.every((r) => r.length === cols)) { problems.push(`${where}: every row needs ${cols} entries`); return; }
    let A;
    try { A = Q.qmatrix(s.M); } catch (e) { problems.push(`${where}: ${e.message}`); return; }
    const rhs = rhsOf(s.aug ?? P.aug);
    if (!(Number.isInteger(rhs) && rhs >= 0 && rhs < cols)) { problems.push(`${where}: aug must be true, false or a number of right-hand-side columns`); return; }
    const mode = s.mode || P.mode;
    let red;
    try {
      const ops = s.ops ?? P.ops;
      red = ops ? Q.replay(A, ops) : Q.reduce(A, { nvar: cols - rhs, mode });
    } catch (e) { problems.push(`${where}: ${e.message}`); return; }
    if ((P.step || 0) > red.steps.length - 1) problems.push(`${where}: step ${P.step} is past the last step (${red.steps.length - 1})`);
    if (P.colLabels && P.colLabels.length !== cols) problems.push(`colLabels needs ${cols} entries`);
    if (P.rowLabels && P.rowLabels.length !== s.M.length) problems.push(`rowLabels needs ${s.M.length} entries`);
    const sh = `${s.M.length}×${cols}/${rhs}`;
    if (shape && sh !== shape && P.picture !== 'none') problems.push('every system offered needs the same shape (one picture serves them all)');
    shape = sh;
    if (P.vars && P.vars.length !== cols - rhs) problems.push(`vars needs ${cols - rhs} names`);
  });
  for (const s of [...(P.vars || []), ...(P.colLabels || []), ...(P.rowLabels || [])]) if (/[$\\_^]/.test(String(s))) problems.push(`label “${s}” is plain text: use Unicode (x₁, C₁₂H₂₆), not TeX`);
  return problems;
}
