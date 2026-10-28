// The singular value decomposition, seen two ways.
//
// mode 'map': a 2×2 matrix A = UΣVᵀ as rotate → stretch → rotate. The unit
// circle and its two right singular vectors v₁, v₂ are carried through the
// stages one factor at a time: Vᵀ turns v₁, v₂ onto the axes, Σ stretches the
// axes by σ₁ and σ₂ (the circle becomes an axis-aligned ellipse), U turns the
// ellipse into place, where its semi-axes are σ₁u₁ and σ₂u₂ = Av₁ and Av₂. A
// faint grid rides along so the turns show. Options: a unit vector x at a
// slider angle with its image Ax (find the direction stretched most), and a
// toggle that keeps only σ₁ — the best rank-1 approximation squashes the
// circle onto a segment. When det A < 0 one of the turns is a reflection
// (V is always chosen to be a rotation, so U is the reflection).
//
// mode 'image': a synthetic grey-scale picture (computed, not a file) beside
// its rank-k truncation Σⱼ≤ₖ σⱼuⱼvⱼᵀ, with the singular values on a log scale:
// kept ones blue, dropped ones grey, σₖ₊₁ (the largest error, Eckart–Young)
// in gold. A slider sets k; the readout gives the numbers stored and the
// relative error. The algebra is in model/la-svd.js (test/la-svd.test.mjs).
//
//   { type: 'la-svd', params: {
//       mode: 'map',                  // 'map' | 'image'
//       // map
//       A: [[2, 1], [1, 2]],          // numbers or expressions of slider keys
//       sliders: [], constants: {},
//       stage: 3,                     // 0: the circle, 1: after Vᵀ, 2: after ΣVᵀ, 3: after UΣVᵀ = A
//       stages: true,                 // a control to step through the factors
//       vectors: true,                // v₁, v₂ and their images through the stages
//       names: true,                  // label those arrows (plain text, drawn on the canvas)
//       grid: true,                   // the image of the grid, faint
//       x: null,                      // a slider key (or expression) for the angle of a unit vector x, in degrees: x and Ax drawn
//       rank1: false,                 // a toggle: keep only σ₁ (the best rank-1 approximation)
//       view: null,                   // the window's half-height (default: fitted to σ₁)
//       // image
//       image: 'satellite',           // satellite | blocks | checker | disc | stripe | noise (model/la-svd.js)
//       choose: false,                // offer the pictures as a choice
//       size: [48, 64],               // rows, columns
//       noise: 0,                     // added random speckle (standard deviation, image values 0–1)
//       k: 4, kmax: 40,               // the rank slider's start and top
//       spectrum: true,               // the singular-value panel
//       readout: true,                // false hides every number; map: a list of 'A', 'sigma', 'U', 'V', 'x'; image: 'k', 'store', 'err', 'sigma'
//   } }

import { Plot } from '../plot.js';
import { fn } from '../model/exprfn.js';
import * as S from '../model/la-svd.js';

export const defaults = {
  mode: 'map', A: [[2, 1], [1, 2]], sliders: [], constants: {}, stage: 3, stages: true, vectors: true, names: true, grid: true,
  x: null, rank1: false, view: null,
  image: 'satellite', choose: false, size: [48, 64], noise: 0, k: 4, kmax: 40, spectrum: true, readout: true,
};

const keysOf = (P) => [...(P.sliders || []).map((s) => s.key), ...Object.keys(P.constants || {})];
const num = (x) => {
  if (!Number.isFinite(x)) return '\\text{—}';
  const r = Math.round(x);
  if (Math.abs(x - r) < 1e-9) return String(r);
  return String(+x.toFixed(3));
};
const txt = (x) => num(x).replace('-', '−');
const matTeX = (A) => `\\begin{bmatrix} ${num(A[0][0])} & ${num(A[0][1])} \\\\ ${num(A[1][0])} & ${num(A[1][1])} \\end{bmatrix}`;
const CIRCLE = Array.from({ length: 121 }, (_, k) => [Math.cos((2 * Math.PI * k) / 120), Math.sin((2 * Math.PI * k) / 120)]);
const PICNAME = { satellite: 'satellite', blocks: 'blocks', checker: 'checkerboard', disc: 'disc', stripe: 'diagonal stripe', noise: 'random noise' };

export function mount(F, P) {
  return P.mode === 'image' ? mountImage(F, P) : mountMap(F, P);
}

function mountMap(F, P) {
  const narrow = (F.el.getBoundingClientRect().width || 800) < 560;
  const { canvas } = F.canvas({ aspect: narrow ? '' : 'wide', label: P.alt || 'The unit circle carried through the three factors of the SVD: a turn, a stretch along the axes, and a turn' });
  for (const s of P.sliders || []) F.slider(s);
  const keys = keysOf(P);
  const env = () => { const e = { ...(P.constants || {}) }; for (const s of P.sliders || []) e[s.key] = +F.params[s.key]; return e; };
  const ev = (src, E) => (typeof src === 'number' ? src : fn(src, keys)(E));
  const mat = (E) => P.A.map((row) => row.map((s) => ev(s, E)));
  if (P.stages) F.choice({ key: 'stage', label: 'Factors applied', options: [[0, 'none'], [1, '$V^{\\mathsf T}$ (turn)'], [2, '$\\Sigma V^{\\mathsf T}$ (stretch)'], [3, '$U\\Sigma V^{\\mathsf T} = A$ (turn)']], value: P.stage, explain: 'The SVD applies $A$ to a vector in three steps, right to left: first $V^{\\mathsf T}$, then $\\Sigma$, then $U$.' });
  if (P.rank1) F.toggle({ key: 'r1', label: 'Keep only $\\sigma_1$ (rank 1)', value: false, explain: 'Replaces $A$ by $\\sigma_1\\mathbf u_1\\mathbf v_1^{\\mathsf T}$, the closest rank-1 matrix: every vector lands on the line of $\\mathbf u_1$.' });
  const across = narrow ? 1.6 : 2;
  const s0 = S.svd2(mat(env())).s[0];
  const W = P.view || Math.max(1.25, 1.18 * s0);
  const plot = new Plot(canvas, { x: [-across * W, across * W], y: [-W, W], equal: true, xlabel: '', ylabel: '', axes: true, grid: true });
  F.onChange(() => draw());

  function draw() {
    plot.clear();
    const E = env(), A = mat(E), st = S.stages2(A);
    const stage = P.stages ? +F.params.stage : P.stage;
    const r1 = P.rank1 && F.params.r1;
    const M = r1 && stage === 3 ? S.rank1of2(A) : st.maps[stage];
    const g = plot.ctx;
    g.save(); plot._clip();
    if (P.grid) {
      const K = Math.ceil(2.2 * W) + 1;
      for (let k = -K; k <= K; k++) {
        const a = S.apply2(M, [k, -K]), b = S.apply2(M, [k, K]), c = S.apply2(M, [-K, k]), d = S.apply2(M, [K, k]);
        plot.line(a[0], a[1], b[0], b[1], { color: 'accent', width: k === 0 ? 1.4 : 0.8, alpha: k === 0 ? 0.45 : 0.18 });
        plot.line(c[0], c[1], d[0], d[1], { color: 'accent', width: k === 0 ? 1.4 : 0.8, alpha: k === 0 ? 0.45 : 0.18 });
      }
    }
    // the unit circle, faint; then its image now
    plot.path(CIRCLE, { close: true, color: 'ink3', width: 1.2, dash: [4, 4], fill: 'ink3', fillAlpha: 0.06 });
    if (r1 && stage === 3) {
      const ell = CIRCLE.map((p) => S.apply2(A, p));
      plot.path(ell, { close: true, color: 'accent', width: 1.4, dash: [6, 5] });
    }
    plot.path(CIRCLE.map((p) => S.apply2(M, p)), { close: true, color: 'accent', width: 2.2, fill: 'accent', fillAlpha: r1 && stage === 3 ? 0 : 0.22 });
    g.restore();

    // the singular vectors through the stages
    if (P.vectors) {
      const v1 = [st.V[0][0], st.V[1][0]], v2 = [st.V[0][1], st.V[1][1]];
      const w1 = S.apply2(M, v1), w2 = S.apply2(M, v2);
      const N1 = ['v₁', 'e₁', 'σ₁e₁', 'σ₁u₁'][stage], N2 = ['v₂', 'e₂', 'σ₂e₂', r1 ? '0' : 'σ₂u₂'][stage];
      if (stage > 0) {   // the starting vectors, faint, for comparison
        plot.arrow(0, 0, v1[0], v1[1], { color: 'good', width: 1.4, dash: [4, 4], alpha: 0.6 });
        plot.arrow(0, 0, v2[0], v2[1], { color: 'warn', width: 1.4, dash: [4, 4], alpha: 0.6 });
      }
      const lab = (w) => { const L = Math.hypot(...w) || 1; return { ldx: 6 + 10 * (w[0] / L), ldy: -6 - 12 * (w[1] / L) }; };
      plot.arrow(0, 0, w1[0], w1[1], { color: 'good', width: 3, label: P.names ? N1 : undefined, ...lab(w1) });
      if (Math.hypot(...w2) > 1e-6) plot.arrow(0, 0, w2[0], w2[1], { color: 'warn', width: 3, label: P.names ? N2 : undefined, ...lab(w2) });
    }
    let x = null, Ax = null;
    if (P.x != null) {
      const th = (ev(P.x, E) * Math.PI) / 180;
      x = [Math.cos(th), Math.sin(th)];
      Ax = S.apply2(r1 ? S.rank1of2(A) : A, x);
      plot.arrow(0, 0, x[0], x[1], { color: 'ink2', width: 2, dash: [5, 4], label: 'x', ldx: 6, ldy: -10 });
      plot.arrow(0, 0, Ax[0], Ax[1], { color: 'gold', width: 3, label: 'Ax', ldx: 8, ldy: -12 });
    }
    if (st.det < 0 && stage === 3 && !r1) plot.text('det A < 0: one of the two turns is a reflection', plot.vx0 + 0.1, plot.vy1 - 0.25, { color: 'ink3', weight: 600 });

    const want = (k) => P.readout === true || (Array.isArray(P.readout) && P.readout.includes(k));
    const rows = [];
    if (want('A')) rows.push(['$A$', matTeX(A)]);
    if (want('sigma')) rows.push(['$\\sigma_1,\\ \\sigma_2$', `${num(st.s[0])},\\ ${num(st.s[1])}`]);
    if (want('U')) rows.push(['$U$', matTeX(st.U)]);
    if (want('V')) rows.push(['$V$', matTeX(st.V)]);
    if (P.x != null && want('x')) rows.push(['$|A\\mathbf x|$', num(Math.hypot(...Ax))]);
    F.readout(P.readout === false ? [] : rows);
  }
  F.draw(draw);
  F.caption(P.caption || 'Dashed: the unit circle. Blue: its image after the factors chosen. Green and orange: v₁ and v₂ carried along; at the end they are the ellipse’s semi-axes σ₁u₁ and σ₂u₂. The faint grid shows the turns.');
  return { get: (k) => F.params[k] };
}

function mountImage(F, P) {
  const narrow = (F.el.getBoundingClientRect().width || 800) < 560;
  const { canvas } = F.canvas({ aspect: narrow ? '' : 'wide', label: P.alt || 'A grey-scale picture beside its rank-k approximation from the SVD, with the singular values on a log scale' });
  const [m, n] = P.size;
  if (P.choose) F.choice({ key: 'img', label: 'Picture', options: S.IMAGES.map((k) => [k, PICNAME[k]]), value: P.image, explain: 'All are computed, pixel by pixel. Rectangles lined up with the pixel grid are cheap; round and slanted edges are not.' });
  F.slider({ key: 'k', label: 'Rank $k$ (terms kept)', min: 1, max: Math.min(P.kmax, m, n), step: 1, value: P.k, explain: 'How many terms $\\sigma_j\\mathbf u_j\\mathbf v_j^{\\mathsf T}$ of the SVD are added up.' });
  const cache = {};
  const get = (name) => (cache[name] ??= (() => { const A = S.image(name, { m, n, noise: P.noise }); return { A, svd: S.svd(A) }; })());
  const plot = new Plot(canvas, { x: [0, 1], y: [0, 1], axes: false, grid: false, pad: { l: 0, r: 0, t: 0, b: 0 } });
  F.onChange(() => draw());

  function cells(g, A, x0, y0, w, h) {
    const cw = w / n, ch = h / m;
    for (let i = 0; i < m; i++) for (let j = 0; j < n; j++) {
      const v = Math.round(255 * Math.max(0, Math.min(1, A[i][j])));
      g.fillStyle = `rgb(${v},${v},${v})`;
      g.fillRect(x0 + j * cw, y0 + i * ch, Math.ceil(cw) + 0.5, Math.ceil(ch) + 0.5);
    }
    g.strokeStyle = plot.col.ink3 || '#888'; g.lineWidth = 1; g.strokeRect(x0 - 0.5, y0 - 0.5, w + 1, h + 1);
  }

  function draw() {
    plot.clear();
    const g = plot.ctx, Wd = plot.w, Ht = plot.h;
    const name = P.choose ? F.params.img : P.image, { A, svd } = get(name);
    const k = Math.round(+F.params.k), Ak = S.rankK(svd, k), err = S.truncationError(svd.s, k), st = S.storage(m, n, k);
    // layout: two pictures side by side, the spectrum to the right (wide) or below (narrow)
    const gap = 14, top = 26;
    const specH = P.spectrum && narrow ? Ht * 0.36 : 0, specW = P.spectrum && !narrow ? Wd * 0.3 : 0;
    const availW = Wd - specW - 3 * gap, availH = Ht - top - specH - gap - (narrow ? 14 : 8);
    const pw = Math.min(availW / 2, (availH * n) / m), ph = (pw * m) / n;
    const x1 = gap + Math.max(0, (availW - 2 * pw) / 2), x2 = x1 + pw + gap;
    cells(g, A, x1, top, pw, ph);
    cells(g, Ak, x2, top, pw, ph);
    plot.text('original', x1 + pw / 2, top - 11, { screen: true, align: 'center', color: 'ink2', weight: 650 });
    plot.text(`rank ${k}`, x2 + pw / 2, top - 11, { screen: true, align: 'center', color: 'accent', weight: 700 });
    if (P.spectrum) {
      // σⱼ against j on a log scale
      const sx0 = narrow ? 44 : Wd - specW - gap + 34, sy0 = narrow ? top + ph + 34 : top, sw = (narrow ? Wd - 44 - gap : specW - 34), sh = narrow ? specH - 30 : ph;
      const s = svd.s, smax = s[0], floor = Math.max(smax * 1e-4, s[Math.min(s.length - 1, Math.max(P.kmax, 30))] || smax * 1e-4);
      const lo = Math.log10(floor) - 0.1, hi = Math.log10(smax) + 0.1, J = Math.min(s.length, Math.max(P.kmax, 30));
      const X = (j) => sx0 + ((j - 0.5) / J) * sw, Y = (v) => sy0 + sh - ((Math.log10(Math.max(v, floor)) - lo) / (hi - lo)) * sh;
      g.save();
      g.strokeStyle = plot.col.ink4 || '#999'; g.lineWidth = 1;
      g.beginPath(); g.moveTo(sx0, sy0); g.lineTo(sx0, sy0 + sh); g.lineTo(sx0 + sw, sy0 + sh); g.stroke();
      g.restore();
      for (let e = Math.ceil(lo); e <= Math.floor(hi); e++) plot.text(e === 0 ? '1' : e === 1 ? '10' : `10${e < 0 ? '⁻' : ''}${'⁰¹²³⁴⁵⁶⁷⁸⁹'[Math.abs(e)]}`, sx0 - 5, Y(10 ** e), { screen: true, align: 'right', color: 'ink3', size: 11 });
      for (let j = 1; j <= J; j++) {
        const color = j <= k ? 'accent' : j === k + 1 ? 'gold' : 'ink4';
        plot.line(plot.ix(X(j)), plot.iy(sy0 + sh), plot.ix(X(j)), plot.iy(Y(s[j - 1])), { color, width: j === k + 1 ? 2.5 : 1.6 });
        plot.point(plot.ix(X(j)), plot.iy(Y(s[j - 1])), { color, r: j === k + 1 ? 4 : 2.6 });
      }
      plot.text('singular values σⱼ (log scale)', sx0 + sw / 2, sy0 + sh + 13, { screen: true, align: 'center', color: 'ink2', size: 11.5 });
      if (k < s.length) plot.text(`σ${String(k + 1).replace(/\d/g, (d) => '₀₁₂₃₄₅₆₇₈₉'[d])} = largest error`, Math.min(X(k + 1) + 8, sx0 + sw - 4), Y(s[k]) - 10, { screen: true, align: X(k + 1) + 8 > sx0 + sw - 110 ? 'right' : 'left', color: 'gold', weight: 650, size: 11.5 });
    }
    const want = (key) => P.readout === true || (Array.isArray(P.readout) && P.readout.includes(key));
    const rows = [];
    if (want('k')) rows.push(['picture', `${m}\\times${n}`]);
    if (want('store')) rows.push(['numbers stored', `${st.kept}\\ \\text{of}\\ ${st.full}\\ (${num((100 * st.kept) / st.full)}\\%)`]);
    if (want('err')) rows.push(['relative error $\\|A - A_k\\|_F / \\|A\\|_F$', `${num(100 * err.rel)}\\%`]);
    if (want('sigma')) rows.push([`$\\sigma_{${k + 1}}$ (largest error)`, num(err.spectral)]);
    F.readout(P.readout === false ? [] : rows);
  }
  F.draw(draw);
  F.caption(P.caption || 'Left: the picture as a matrix of grey levels (computed, not a photograph). Right: the sum of its first k SVD terms, grey levels clipped to black–white for display. Right panel: every singular value, kept (blue), the first one dropped (gold) and the rest (grey).');
  return { get: (k) => F.params[k] };
}

/** Node-side check used by the content tests. */
export function validate(P) {
  const problems = [];
  const keys = keysOf(P);
  const check = (src, where) => {
    if (typeof src === 'number') { if (!Number.isFinite(src)) problems.push(`la-svd ${where}: not a finite number`); return; }
    if (typeof src !== 'string') { problems.push(`la-svd ${where}: expected a number or an expression`); return; }
    try { fn(src, keys); } catch (e) { problems.push(`la-svd ${where}: “${src}” — ${e.message}`); }
  };
  if (!['map', 'image'].includes(P.mode)) problems.push('la-svd: mode must be map or image');
  for (const s of P.sliders || []) {
    if (!(s.min < s.max) || s.value < s.min || s.value > s.max) problems.push(`la-svd slider ${s.key}: value must lie in [min, max]`);
    if (!s.label) problems.push(`la-svd slider ${s.key} needs a label`);
    if (s.key === 'k' || s.key === 'stage') problems.push(`la-svd slider key “${s.key}” is reserved`);
  }
  if (P.mode === 'map') {
    if (!Array.isArray(P.A) || P.A.length !== 2 || !P.A.every((r) => Array.isArray(r) && r.length === 2)) problems.push('la-svd: A must be a 2×2 matrix [[a, b], [c, d]]');
    else P.A.forEach((r, i) => r.forEach((s, j) => check(s, `A[${i}][${j}]`)));
    if (![0, 1, 2, 3].includes(P.stage)) problems.push('la-svd: stage must be 0, 1, 2 or 3');
    if (P.x != null) check(P.x, 'x');
    if (P.view != null && !(P.view > 0)) problems.push('la-svd: view must be a positive number');
    const ok = ['A', 'sigma', 'U', 'V', 'x'];
    if (!(P.readout === true || P.readout === false || (Array.isArray(P.readout) && P.readout.every((k) => ok.includes(k))))) problems.push(`la-svd: readout must be true, false or a list of ${ok.join(', ')}`);
  } else {
    if (!S.IMAGES.includes(P.image)) problems.push(`la-svd: image must be one of ${S.IMAGES.join(', ')}`);
    if (!(Array.isArray(P.size) && P.size.length === 2 && P.size.every((v) => Number.isInteger(v) && v >= 8 && v <= 96))) problems.push('la-svd: size must be [rows, columns], each an integer from 8 to 96');
    else {
      const lim = Math.min(P.kmax, ...P.size);
      if (!(Number.isInteger(P.k) && P.k >= 1 && P.k <= lim)) problems.push(`la-svd: k must be an integer from 1 to ${lim}`);
    }
    if (!(P.noise >= 0 && P.noise <= 0.5)) problems.push('la-svd: noise must lie in [0, 0.5]');
    const ok = ['k', 'store', 'err', 'sigma'];
    if (!(P.readout === true || P.readout === false || (Array.isArray(P.readout) && P.readout.every((k) => ok.includes(k))))) problems.push(`la-svd: readout must be true, false or a list of ${ok.join(', ')}`);
  }
  return problems;
}
