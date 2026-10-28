// One arrow, one stack of lines and a basis on a plane with no preferred axes:
// the basis is yours to choose, and only the components care. The algebra is
// in model/ten-basis.js (test/ten-basis.test.mjs).
//
//   mode 'vector'   — an arrow V and a basis e₁, e₂ (drag their tips, turn
//     them rigidly with a slider, or pick a preset). The dashed parallelogram
//     builds V = V¹e₁ + V²e₂; the components change as the basis does, the
//     arrow does not. ghost: true keeps the starting basis, faint, so old and
//     new components can be compared (the new basis is then named e′₁, e′₂).
//   mode 'covector' — a covector ω drawn as its stack of lines ω = …, −1, 0,
//     1, 2, …, and an arrow V piercing it: ω(V) is the signed number of lines
//     V crosses (the crossed ones are drawn bold). Sliders set the components
//     ω₁ = ω(e₁), ω₂ = ω(e₂); dragging the basis keeps the stack where it is
//     and updates the sliders. dual: true draws the dual basis e¹, e² as their
//     own stacks: e¹ is parallel to e₂ and e₁ crosses exactly one of its lines.
//
//   { type: 'ten-basis', params: {
//       mode: 'vector',
//       basis: [[1, 0], [0.5, 0.87]],   // e₁, e₂ (paper coordinates — used only to draw)
//       dragBasis: true,                // drag the tips of e₁ and e₂
//       rotate: false,                  // or: a slider φ (degrees, key 'phi') turning the starting basis rigidly
//       rotateRange: [-90, 90],
//       presets: null,                  // or [{ label: 'Square', basis: [[1, 0], [0, 1]] }, …] — a choice (key 'preset')
//       vector: [2, 1], dragVector: true, tail: [0, 0],
//       vname: 'V', vtex: 'V',          // the arrow's name on the canvas (plain text) and in the readout (TeX)
//       construction: true,             // the parallelogram V¹e₁ + V²e₂
//       grid: 'basis',                  // 'basis' (faint lines of constant V¹ and V²) | 'paper' | 'none'
//       ghost: false, names: null,      // ghost: true keeps the starting basis faint, or give the old basis [[x, y], [x, y]];
//                                       // names: the basis arrows' canvas labels, e.g. ['e₁', 'e₂']
//       ghostNames: ['e₁', 'e₂'],       // the starting basis's labels when ghost is on
//       covector: [1, 0.5],             // mode 'covector': ω's components in the starting basis
//       covSliders: true, wname: 'ω', wtex: '\\omega', levelLabels: true, crossings: true,
//       dual: false,                    // the dual basis as two stacks
//       arrows: [],                     // extra fixed arrows [{ from, to, color, label }] (paper coordinates)
//       readout: true,                  // false hides every number; or a list of 'V', 'Vold', 'w', 'wold', 'pair', 'A', 'len'
//       view: 3, center: [0, 0], snap: 0.1, aspect: '' } }
//
// A point item may read the arrow's tip (get('point')); a slider item the
// rotation 'phi'. A picture must not show its answer: readout: false.

import { Plot } from '../plot.js';
import * as M from '../model/ten-basis.js';

export const defaults = {
  mode: 'vector', basis: [[1, 0], [0, 1]], dragBasis: false, rotate: false, rotateRange: [-90, 90], presets: null,
  vector: [2, 1], dragVector: true, tail: [0, 0], vname: 'V', vtex: 'V', construction: true, grid: 'basis', ghost: false, names: null,
  covector: [1, 0.5], covSliders: true, wname: 'ω', wtex: '\\omega', levelLabels: true, crossings: true, dual: false,
  ghostNames: ['e₁', 'e₂'], arrows: [], readout: true, view: 3, center: [0, 0], snap: 0.1, aspect: '',
};

const DEG = Math.PI / 180;
const f3 = (v) => (Number.isFinite(v) ? String(+v.toFixed(3)).replace(/^-0$/, '0') : '\\text{—}');
const vec = (a, b) => `(${f3(a)},\\ ${f3(b)})`;
const mat = (A) => (A ? `\\begin{pmatrix} ${f3(A[0][0])} & ${f3(A[0][1])} \\\\ ${f3(A[1][0])} & ${f3(A[1][1])} \\end{pmatrix}` : '\\text{—}');

export function mount(F, P) {
  const { canvas } = F.canvas({ aspect: P.aspect, label: P.alt || (P.mode === 'covector' ? 'A covector drawn as a stack of parallel lines, an arrow piercing it, and a basis' : 'An arrow and a basis on a plane, with the parallelogram that gives the arrow’s components') });
  const start = P.basis.map((e) => e.slice());
  let basis = start.map((e) => e.slice());
  const tip = { x: P.vector[0], y: P.vector[1] };
  const tail = P.tail;
  const cov = P.mode === 'covector';
  let row = cov ? M.covFromComps(start, P.covector) : null;
  let syncing = false;
  const ghost = !!P.ghost;
  const old = Array.isArray(P.ghost) ? P.ghost : start;   // the basis kept faint for comparison
  const names = P.names || (ghost ? ['e′₁', 'e′₂'] : ['e₁', 'e₂']);
  const pr = ghost ? "'" : '';                       // primes on the new components in the readout

  if (P.presets?.length) F.choice({ key: 'preset', label: 'Basis', options: P.presets.map((p, i) => [i, p.label]), value: 0, explain: 'The same arrow, described with a different pair of basis arrows.' });
  if (P.rotate) F.slider({ key: 'phi', label: 'Turn the basis by $\\varphi$', min: P.rotateRange[0], max: P.rotateRange[1], step: 1, value: 0, unit: '^\\circ', explain: 'Both basis arrows turn together, anticlockwise for positive angles. The arrow itself stays where it is.' });
  if (cov && P.covSliders) {
    F.slider({ key: 'w1', label: `$${P.wtex}_1 = ${P.wtex}(\\mathbf e_1)$`, min: -3, max: 3, step: 0.1, value: P.covector[0], explain: `How many lines of the stack $\\mathbf e_1$ crosses: the first component of $${P.wtex}$.` });
    F.slider({ key: 'w2', label: `$${P.wtex}_2 = ${P.wtex}(\\mathbf e_2)$`, min: -3, max: 3, step: 0.1, value: P.covector[1], explain: `How many lines $\\mathbf e_2$ crosses. Both zero: no stack at all.` });
  }

  const plot = new Plot(canvas, { x: [P.center[0] - P.view * 1.6, P.center[0] + P.view * 1.6], y: [P.center[1] - P.view, P.center[1] + P.view], equal: true, grid: false, axes: false, pad: { l: 8, r: 8, t: 8, b: 8 } });
  const snap = (v) => (P.snap ? Math.round(v / P.snap) * P.snap : v);
  const inside = (x, y) => [Math.max(plot.vx0 + 0.15, Math.min(plot.vx1 - 0.15, x)), Math.max(plot.vy0 + 0.15, Math.min(plot.vy1 - 0.15, y))];

  // keep the stack where it is while the basis moves: re-read its components
  function basisMoved() {
    if (!cov || !P.covSliders) return;
    const [w1, w2] = M.covComps(basis, row);
    syncing = true; F.set('w1', +w1.toFixed(6)); F.set('w2', +w2.toFixed(6)); syncing = false;
  }
  if (P.dragBasis) {
    [0, 1].forEach((i) => plot.handle(() => basis[i], (x, y) => {
      const [sx, sy] = inside(snap(x), snap(y));
      const next = basis.map((e, k) => (k === i ? [sx, sy] : e));
      if (Math.abs(M.det(next)) < 0.05 || Math.hypot(sx, sy) < 0.2) return;   // keep the basis a basis
      basis = next; basisMoved();
    }, { hollow: true, label: `the tip of ${names[i]}` }));
  }
  if (P.dragVector) plot.handle(() => [tip.x, tip.y], (x, y) => { [tip.x, tip.y] = inside(snap(x), snap(y)); }, { hollow: true, label: `the tip of ${P.vname}` });
  plot.onDrag = () => { draw(); F.notify('point'); };

  F.onChange((key) => {
    if ((key === 'w1' || key === 'w2') && !syncing) row = M.covFromComps(basis, [F.params.w1, F.params.w2]);
    if (key === 'phi') { basis = M.rotate(start, F.params.phi * DEG); basisMoved(); }
    if (key === 'preset') { basis = P.presets[F.params.preset].basis.map((e) => e.slice()); basisMoved(); }
    draw();
  });

  const win = () => [[plot.vx0, plot.vx1], [plot.vy0, plot.vy1]];
  const pxPerUnit = () => plot.X(1) - plot.X(0);

  // a stack of lines row = k: faint, or strong with level labels; `bold` lists levels to draw thick
  function stack(r, { color, width = 1.3, alpha = 1, dash, labels = false, name = '', bold = [], boldColor = 'warn' }) {
    const [wx, wy] = win();
    const spacing = pxPerUnit() / Math.hypot(r[0], r[1]);          // pixels between neighbouring lines
    if (!(spacing > 3)) return;
    const ks = M.levelsIn(r, wx, wy);
    for (const k of ks) {
      const seg = M.clipLine(r, k, wx, wy);
      if (!seg) continue;
      const isBold = bold.includes(k);
      plot.line(seg[0][0], seg[0][1], seg[1][0], seg[1][1], { color: isBold ? boldColor : color, width: isBold ? 3 : k === 0 ? width + 0.9 : width, alpha: isBold ? 1 : alpha, dash: isBold ? [] : dash });
      if (labels && (spacing > 17 || k % 2 === 0)) {
        // the label sits near the end of the line that is higher on the screen, nudged inward
        const [p, q] = seg[0][1] >= seg[1][1] ? seg : [seg[1], seg[0]];
        const L = Math.hypot(q[0] - p[0], q[1] - p[1]) || 1, inward = 14 / pxPerUnit();
        const lx = p[0] + ((q[0] - p[0]) / L) * inward, ly = p[1] + ((q[1] - p[1]) / L) * inward;
        plot.text(k === 1 && name ? `${name} = 1` : String(k).replace('-', '−'), lx, ly, { color: isBold ? boldColor : color, size: 11.5, weight: 650, align: 'center', dx: 0, dy: 0 });
      }
    }
  }

  function draw() {
    plot.clear();
    const g = plot.ctx;
    g.save(); plot._clip();
    const [wx, wy] = win();
    const V = [tip.x - tail[0], tip.y - tail[1]];
    const c = M.comps(basis, V);
    const dual = M.dual(basis);
    if (P.grid === 'paper') {
      for (let x = Math.ceil(wx[0]); x <= wx[1]; x++) plot.line(x, wy[0], x, wy[1], { color: 'ink4', width: 1, alpha: 0.35 });
      for (let y = Math.ceil(wy[0]); y <= wy[1]; y++) plot.line(wx[0], y, wx[1], y, { color: 'ink4', width: 1, alpha: 0.35 });
    }
    if (P.dual) {
      stack(dual[0], { color: 'accent', width: 1.2, dash: [6, 4], labels: true, name: 'e¹' });
      stack(dual[1], { color: 'violet', width: 1.2, dash: [6, 4], labels: true, name: 'e²' });
    } else if (P.grid === 'basis') {
      stack(dual[0], { color: 'accent', width: 1, alpha: 0.3 });
      stack(dual[1], { color: 'violet', width: 1, alpha: 0.3 });
    }
    let w = null;
    if (cov) {
      w = M.covComps(basis, row);
      const bold = P.crossings ? M.crossed(row, tail, [tip.x, tip.y]) : [];
      stack(row, { color: 'teal', width: 1.5, labels: P.levelLabels, bold });
    }
    // the starting basis, kept faint for comparison
    if (ghost) old.forEach((e, i) => plot.arrow(0, 0, e[0], e[1], { color: i ? 'violet' : 'accent', width: 1.8, alpha: 0.45, dash: [5, 4], label: P.ghostNames[i], ldx: -22, ldy: 12 }));
    // the parallelogram of components
    if (P.construction && Number.isFinite(c[0])) {
      const a = M.combine(basis, [c[0], 0]), b = M.combine(basis, [0, c[1]]);
      const T = (p) => [tail[0] + p[0], tail[1] + p[1]];
      const [A, B] = [T(a), T(b)];
      plot.line(tail[0], tail[1], A[0], A[1], { color: 'accent', width: 2, dash: [6, 4] });
      plot.line(A[0], A[1], tip.x, tip.y, { color: 'violet', width: 1.6, dash: [6, 4], alpha: 0.85 });
      plot.line(tail[0], tail[1], B[0], B[1], { color: 'violet', width: 2, dash: [6, 4] });
      plot.line(B[0], B[1], tip.x, tip.y, { color: 'accent', width: 1.6, dash: [6, 4], alpha: 0.85 });
      if (Math.hypot(a[0], a[1]) * pxPerUnit() > 40) plot.text(`${P.vname}${pr ? '′' : ''}¹${names[0]}`, (tail[0] + A[0]) / 2, (tail[1] + A[1]) / 2, { color: 'accent', dx: 0, dy: 14, size: 11.5, weight: 650, align: 'center' });
      if (Math.hypot(b[0], b[1]) * pxPerUnit() > 40) plot.text(`${P.vname}${pr ? '′' : ''}²${names[1]}`, (tail[0] + B[0]) / 2, (tail[1] + B[1]) / 2, { color: 'violet', dx: -10, dy: 0, size: 11.5, weight: 650, align: 'right' });
    }
    for (const a of P.arrows || []) plot.arrow(a.from[0], a.from[1], a.to[0], a.to[1], { color: a.color || 'ink2', width: 2.2, label: a.label });
    basis.forEach((e, i) => plot.arrow(0, 0, e[0], e[1], { color: i ? 'violet' : 'accent', width: 3, label: names[i], ldx: 6, ldy: i ? -10 : 12 }));
    plot.arrow(tail[0], tail[1], tip.x, tip.y, { color: 'gold', width: 3.2, label: P.vname, ldx: 8, ldy: -10 });
    plot.point(0, 0, { color: 'ink2', r: 3 });
    g.restore();
    plot.drawHandles();

    if (P.readout === false) return;
    const want = (k) => P.readout === true || (Array.isArray(P.readout) && P.readout.includes(k));
    const rows = [];
    const vt = P.vtex, wt = P.wtex;
    if (want('V')) rows.push([`$(${vt}${pr}^1,\\ ${vt}${pr}^2)$`, vec(...c)]);
    if (ghost && want('Vold')) rows.push([`in the old basis $(${vt}^1,\\ ${vt}^2)$`, vec(...M.comps(old, V))]);
    if (cov && want('w')) rows.push([`$(${wt}${pr}_1,\\ ${wt}${pr}_2)$`, vec(...w)]);
    if (cov && ghost && want('wold')) rows.push([`in the old basis $(${wt}_1,\\ ${wt}_2)$`, vec(...M.covComps(old, row))]);
    if (cov && want('pair')) rows.push([`$${wt}(${vt}) = ${wt}${pr}_i\\,${vt}${pr}^i$`, f3(w[0] * c[0] + w[1] * c[1])]);
    if (ghost && want('A')) { const A = M.changeMatrix(old, basis); rows.push(['$A$ (columns: the new basis in the old)', mat(A)], ['$A^{-1}$', mat(M.inv2(A))]); }
    if (want('len') && P.readout !== true) rows.push([`true length $|${vt}|$`, f3(M.len(V))], [`$\\sqrt{(${vt}${pr}^1)^2 + (${vt}${pr}^2)^2}$`, f3(Math.hypot(c[0], c[1]))]);
    F.readout(rows);
  }
  F.draw(draw);
  F.caption(cov
    ? `The teal lines are the covector $${P.wtex}$: the line marked $k$ is where $${P.wtex}$ has the value $k$. The number $${P.wtex}(${P.vtex})$ counts the lines the gold arrow crosses (bold), with a sign for direction and a fraction for the part-way gap. Nothing here uses a ruler or a protractor.`
    : `The gold arrow is one fixed arrow. The dashed parallelogram splits it along the basis arrows: $${P.vtex} = ${P.vtex}^1\\mathbf e_1 + ${P.vtex}^2\\mathbf e_2$. The faint lines are where $${P.vtex}^1$ or $${P.vtex}^2$ is a whole number.`);
  return { get: (k) => (k === 'point' ? { x: tip.x, y: tip.y } : F.params[k]) };
}

export function validate(P) {
  const p = [];
  const isVec = (v) => Array.isArray(v) && v.length === 2 && v.every(Number.isFinite);
  if (!['vector', 'covector'].includes(P.mode)) p.push(`ten-basis: unknown mode “${P.mode}” (use vector or covector)`);
  if (!(Array.isArray(P.basis) && P.basis.length === 2 && P.basis.every(isVec))) p.push('ten-basis: basis must be [[x, y], [x, y]]');
  else if (Math.abs(M.det(P.basis)) < 0.05) p.push('ten-basis: the two basis arrows must not be parallel');
  if (!isVec(P.vector) || !isVec(P.tail)) p.push('ten-basis: vector and tail must be [x, y]');
  if (P.mode === 'covector' && !isVec(P.covector)) p.push('ten-basis: covector must be its two components [ω₁, ω₂]');
  if (P.mode === 'covector' && P.covSliders && isVec(P.covector) && P.covector.some((w) => w < -3 || w > 3)) p.push('ten-basis: covector components must lie in [−3, 3] for the sliders');
  if (P.rotate && P.dragBasis) p.push('ten-basis: use rotate or dragBasis, not both');
  if (P.presets && !(Array.isArray(P.presets) && P.presets.every((q) => typeof q.label === 'string' && Array.isArray(q.basis) && q.basis.length === 2 && q.basis.every(isVec) && Math.abs(M.det(q.basis)) > 0.05))) p.push('ten-basis: presets must be [{ label, basis: [[x, y], [x, y]] }] with non-parallel arrows');
  if (P.presets && P.presets.length && JSON.stringify(P.presets[0].basis) !== JSON.stringify(P.basis)) p.push('ten-basis: the first preset must be the starting basis');
  if (Array.isArray(P.ghost) && !(P.ghost.length === 2 && P.ghost.every(isVec) && Math.abs(M.det(P.ghost)) > 0.05)) p.push('ten-basis: ghost must be true, false or a basis [[x, y], [x, y]]');
  if (!['basis', 'paper', 'none'].includes(P.grid)) p.push(`ten-basis: grid must be basis, paper or none (got ${P.grid})`);
  if (!(P.view > 0.5 && P.view < 50)) p.push('ten-basis: view (the half-height) must lie in (0.5, 50)');
  if (!(P.readout === true || P.readout === false || (Array.isArray(P.readout) && P.readout.every((k) => ['V', 'Vold', 'w', 'wold', 'pair', 'A', 'len'].includes(k))))) p.push('ten-basis: readout must be true, false or a list of V, Vold, w, wold, pair, A, len');
  for (const a of P.arrows || []) if (!isVec(a.from) || !isVec(a.to)) p.push('ten-basis: arrows need from: [x, y] and to: [x, y]');
  for (const s of [P.vname, P.wname, ...(P.names || []), ...(P.ghostNames || []), ...(P.arrows || []).map((a) => a.label).filter(Boolean)]) if (typeof s === 'string' && /\$|\\[A-Za-z]|_[{A-Za-z0-9]|\^[{A-Za-z0-9]/.test(s)) p.push(`ten-basis: canvas label “${s}” must be plain text (Unicode), not TeX`);
  return p;
}
