// Laplace's equation in a box, solved by relaxation. The four walls are held
// at set potentials (the top may carry V₀ sin(πx/a) instead) and an optional
// electrode inside holds its own; every other grid node is repeatedly
// replaced by the average of its four neighbours. Watch the colour map and
// the equipotentials settle from a starting guess — zero, the highest wall
// value, or random — to the one solution the walls allow. Jacobi, Gauss–Seidel
// and over-relaxation (SOR, at the best ω) race on the log panel of the
// largest change per sweep. With compare: true a second run from a different
// guess goes along, and the largest gap between the two runs falls to zero:
// the uniqueness theorem, watched. A draggable probe reads V beside the
// average of its neighbours (the mean-value property) and, with exact: true,
// the Fourier-series value. Model in model/em3-relax.js (tested headlessly in
// test/em3-relax.test.mjs).
//
//   { type: 'em3-relax', params: {
//       n: 24,                  // cells across the box (4–60); the box is 1 wide (lengths in units of the width a)
//       aspect: 1,              // height / width (the grid keeps square cells)
//       walls: { left: 0, right: 0, bottom: 0, top: 100 },   // volts
//       top: 'flat',            // flat | sine: the top wall at V_top · sin(πx/a)
//       electrode: null,        // { x, y, w, h, V }: a rectangle inside the box (units of a) held at V volts
//       init: 'zero',           // zero | high | random | mean: the starting guess for the free nodes
//       method: 'gs',           // jacobi | gs | sor
//       sweeps: 0,              // sweeps done before the first frame (a number, or 'converged')
//       compare: false,         // also run from a second guess and show the largest gap between the runs
//       exact: false,           // readouts of the series value at the probe (no electrode)
//       probe: [0.5, 0.5],      // a draggable probe (snaps to nodes), or false
//       levels: 9,              // equipotentials: a count of nice levels, or a list in volts
//       labels: true,           // the equipotentials' values
//       history: null,          // the convergence panel (default: in the Explore step)
//       controls: null,         // true, false, or a list of: init method top left right bottom
//       play: null,             // start sweeping at once (default: in the Explore step)
//       readout: true,
//       hide: [],               // readouts shown as “?”: V mean exact change gap sweeps
//   } }

import { Plot, pow10Label } from '../plot.js';
import * as M from '../model/em3-relax.js';
import { contourSegments, joinSegments, niceLevels } from '../model/c3-contour.js';

export const defaults = {
  n: 24, aspect: 1, walls: { left: 0, right: 0, bottom: 0, top: 100 }, top: 'flat', electrode: null,
  init: 'zero', method: 'gs', sweeps: 0, compare: false, exact: false, probe: [0.5, 0.5], levels: 9, labels: true,
  history: null, controls: null, play: null, readout: true, hide: [],
};
const CONTROLS = ['init', 'method', 'top', 'left', 'right', 'bottom'];
const HIDE = ['V', 'mean', 'exact', 'change', 'gap', 'sweeps'];
const INITS = [['zero', 'zero'], ['high', 'highest wall'], ['random', 'random'], ['mean', 'halfway']];
const METHODS = [['jacobi', 'Jacobi'], ['gs', 'Gauss–Seidel'], ['sor', 'SOR']];
const STOPS = [[52, 92, 196], [44, 150, 170], [130, 190, 110], [240, 190, 70]];
const ramp = (t) => {
  t = Math.max(0, Math.min(1, t));
  const x = t * (STOPS.length - 1), i = Math.min(STOPS.length - 2, Math.floor(x)), f = x - i;
  return STOPS[i].map((v, k) => Math.round(v + (STOPS[i + 1][k] - v) * f));
};
const f3 = (x) => (Math.abs(x) < 5e-4 ? '0' : String(+x.toPrecision(3)));
const vtxt = (v) => `${+(+v).toPrecision(4)} V`;

export function mount(F, P0) {
  const P = { ...defaults, ...P0 };
  const hide = new Set(P.hide || []);
  const wanted = P.controls === true || (P.controls === null && !F.compact) ? ['init', 'method'] : Array.isArray(P.controls) ? P.controls : [];
  const W0 = { left: 0, right: 0, bottom: 0, top: 0, ...P.walls };
  const ctl = (key, make, value) => (wanted.includes(key) ? make() : (F.params[key] = value));
  ctl('init', () => F.choice({ key: 'init', label: 'Starting guess', options: INITS, value: P.init, explain: 'What the free nodes hold before the first sweep. The walls never change.' }), P.init);
  ctl('method', () => F.choice({ key: 'method', label: 'Sweep', options: METHODS, value: P.method, explain: 'Jacobi averages the old values; Gauss–Seidel uses each new value at once; SOR overshoots by the best factor ω.' }), P.method);
  for (const w of ['top', 'left', 'right', 'bottom']) {
    const lbl = { top: 'Top wall', left: 'Left wall', right: 'Right wall', bottom: 'Bottom wall' }[w];
    ctl(w, () => F.slider({ key: w, label: lbl, min: -100, max: 100, step: 5, value: W0[w], unit: '\\text{V}', explain: w === 'top' && P.top === 'sine' ? 'The top wall’s peak potential: it carries V sin(πx/a).' : 'The potential this wall is held at.' }), W0[w]);
  }
  const showHist = P.history ?? !F.compact;
  const asp = P.aspect;
  const a = F.canvas({ aspect: asp <= 0.62 ? 'wide' : asp >= 0.9 ? 'square' : '', label: P.alt || 'A box whose walls are held at set potentials, coloured by the potential inside' });
  const padX = 0.2, padY = 0.13;
  const plot = new Plot(a.canvas, { x: [-padX, 1 + padX], y: [-padY, asp + padY], equal: true, axes: false, grid: false });
  let hplot = null;
  if (showHist) {
    const hc = F.canvas({ aspect: 'wide', label: 'The largest change per sweep, on a logarithmic scale' });
    hplot = new Plot(hc.canvas, { x: [0, 50], y: [-6, 2], xlabel: 'sweeps', ylabel: 'largest change (V)', yfmt: pow10Label, axesAt: 'edge', yticks: 5 });
  }

  const off = document.createElement('canvas');
  let A = null, B2 = null, hist = [], done = false;
  const wallsNow = () => ({ left: F.params.left, right: F.params.right, bottom: F.params.bottom, top: F.params.top });
  const second = () => (F.params.init === 'random' ? 'zero' : 'random');
  function reset() {
    A = M.init(M.makeBox({ n: P.n, aspect: asp, walls: wallsNow(), top: P.top, electrode: P.electrode }), F.params.init, 7);
    B2 = P.compare ? M.init(M.cloneBox(A), second(), 11) : null;
    hist = []; done = false;
    const pre = P.sweeps === 'converged' ? 100000 : +P.sweeps || 0;
    for (let k = 0; k < pre && !done; k++) step1();
  }
  const scale = () => Math.max(1e-9, A.hi - A.lo);
  function step1() {
    const ch = M.sweep(A, F.params.method);
    let g = null;
    if (B2) { M.sweep(B2, F.params.method); g = M.gap(A, B2); }
    hist.push([ch, g]);
    if (ch < 1e-7 * scale() && (!B2 || g < 1e-6 * scale())) done = true;
  }

  const probe = P.probe === false ? null : { x: P.probe[0], y: P.probe[1] };
  if (probe) {
    plot.handle(() => { const p = M.at(A, probe.x, probe.y); return [p.x, p.y]; }, (x, y) => {
      probe.x = Math.max(A.h, Math.min(1 - A.h, x)); probe.y = Math.max(A.h, Math.min(A.b - A.h, y));
    }, { hollow: true, label: 'probe' });
    plot.onDrag = () => { draw(); F.notify('point'); };
  }

  function draw() {
    plot.clear();
    const g = plot.ctx, narrow = (a.canvas.clientWidth || 600) < 520, fs = narrow ? 10.5 : 12;
    // the colour map: one pixel per node, smoothed
    off.width = A.nx + 1; off.height = A.ny + 1;
    const ox = off.getContext('2d'), img = ox.createImageData(A.nx + 1, A.ny + 1), sc = scale();
    for (let i = 0; i <= A.nx; i++) for (let j = 0; j <= A.ny; j++) {
      const rgb = ramp((A.V[A.id(i, j)] - A.lo) / sc), k = 4 * ((A.ny - j) * (A.nx + 1) + i);
      img.data[k] = rgb[0]; img.data[k + 1] = rgb[1]; img.data[k + 2] = rgb[2]; img.data[k + 3] = 255;
    }
    ox.putImageData(img, 0, 0);
    const hx = A.h / 2;
    g.save(); g.globalAlpha = 0.62; g.imageSmoothingEnabled = true;
    g.drawImage(off, plot.X(-hx), plot.Y(A.b + hx), plot.X(1 + hx) - plot.X(-hx), plot.Y(-hx) - plot.Y(A.b + hx));
    g.restore();
    // equipotentials
    const gr = M.grid(A);
    const levels = Array.isArray(P.levels) ? P.levels : niceLevels(A.lo, A.hi, P.levels).filter((c) => c > A.lo + 1e-9 * sc && c < A.hi - 1e-9 * sc);
    const placed = [];
    for (const c of levels) {
      const lines = joinSegments(contourSegments(gr, c), 1e-9);
      let best = null, bl = 0;
      for (const L of lines) {
        plot.path(L, { color: 'ink', width: 1.3, alpha: 0.7 });
        const len = L.reduce((s, p, k) => (k ? s + Math.hypot(p[0] - L[k - 1][0], p[1] - L[k - 1][1]) : 0), 0);
        if (len > bl) { bl = len; best = L; }
      }
      if (P.labels && best && bl > 0.15) {
        const m = best[Math.floor(best.length / 2)];
        if (!placed.some((q) => Math.hypot(q[0] - m[0], q[1] - m[1]) < 0.12)) { placed.push(m); plot.text(vtxt(c).replace(' V', ''), m[0], m[1], { color: 'ink', size: fs - 1, align: 'center', weight: 600 }); }
      }
    }
    // the walls and the electrode
    const W = A.walls, wl = (v) => vtxt(v);
    const wallCol = (v) => (v > 0 ? 'warn' : v < 0 ? 'accent' : 'ink2');
    plot.line(0, 0, 1, 0, { color: wallCol(W.bottom), width: 4 });
    plot.line(0, A.b, 1, A.b, { color: wallCol(W.top), width: 4 });
    plot.line(0, 0, 0, A.b, { color: wallCol(W.left), width: 4 });
    plot.line(1, 0, 1, A.b, { color: wallCol(W.right), width: 4 });
    plot.text(P.top === 'sine' ? `${wl(W.top)} × sin(πx/a)` : wl(W.top), 0.5, A.b, { align: 'center', dy: -13, size: fs, color: 'ink', weight: 600 });
    plot.text(wl(W.bottom), 0.5, 0, { align: 'center', dy: 13, size: fs, color: 'ink', weight: 600 });
    plot.text(wl(W.left), 0, A.b / 2, { align: 'right', dx: -7, size: fs, color: 'ink', weight: 600 });
    plot.text(wl(W.right), 1, A.b / 2, { align: 'left', dx: 7, size: fs, color: 'ink', weight: 600 });
    if (A.electrode) {
      const e = A.electrode, h = A.h;
      plot.rect(e.i0 * h, e.j0 * h, (e.i1 - e.i0) * h, (e.j1 - e.j0) * h, { fill: 'ink3', alpha: 0.85, stroke: 'ink', width: 1.5 });
      plot.text(wl(e.V), ((e.i0 + e.i1) / 2) * h, ((e.j0 + e.j1) / 2) * h, { align: 'center', size: fs, color: 'ink', weight: 700 });
    }
    plot.text(done ? `${A.sweeps} sweeps — settled` : `${A.sweeps} sweeps`, 1, A.b, { align: 'right', dy: -13, dx: 0, size: fs - 1, color: 'ink2', screen: false, halo: true, ...(narrow ? { dy: -26 } : {}) });
    plot.drawHandles();
    drawHistory();
    readouts();
  }

  function drawHistory() {
    if (!hplot) return;
    const n = Math.max(50, Math.ceil(hist.length * 1.1 / 50) * 50), sc = scale();
    hplot.setView([0, n], [Math.log10(sc) - 9, Math.log10(sc) + 0.5]);
    hplot.clear();
    const pts = hist.map(([c], k) => [k + 1, Math.log10(Math.max(c, sc * 1e-12))]);
    hplot.path(pts, { color: 'accent', width: 2 });
    if (B2) hplot.path(hist.map(([, gg], k) => [k + 1, Math.log10(Math.max(gg, sc * 1e-12))]), { color: 'gold', width: 2, dash: [6, 4] });
    const fs = (hplot.c.clientWidth || 600) < 520 ? 10 : 11.5;
    hplot.text('largest change in a sweep', n, Math.log10(sc) + 0.2, { align: 'right', color: 'accent', size: fs, dx: -6 });
    if (B2) hplot.text('largest gap between the two runs', n, Math.log10(sc) - 0.5, { align: 'right', color: 'gold', size: fs, dx: -6 });
  }

  function readouts() {
    if (P.readout === false) { F.readout([]); return; }
    const q = (k, v) => (hide.has(k) ? '?' : v);
    const rows = [];
    if (probe) {
      const p = M.at(A, probe.x, probe.y);
      rows.push(['probe at', `(${f3(p.x)}a,\\ ${f3(p.y)}a)`], ['$V$ at the probe', q('V', `${f3(p.V)}\\,\\text{V}`)]);
      if (!A.fixed[A.id(p.i, p.j)]) rows.push(['mean of its 4 neighbours', q('mean', `${f3(M.neighbourMean(A, p.i, p.j))}\\,\\text{V}`)]);
      if (P.exact && !A.electrode) rows.push(['exact (series)', q('exact', `${f3(M.series(A.b, A.walls, p.x, p.y, { top: P.top }))}\\,\\text{V}`)]);
    }
    rows.push(['sweeps', q('sweeps', String(A.sweeps))]);
    const last = hist.length ? hist[hist.length - 1] : null;
    if (last) rows.push(['largest change, last sweep', q('change', `${tx(last[0])}\\,\\text{V}`)]);
    if (B2 && last) rows.push(['largest gap between runs', q('gap', `${tx(last[1])}\\,\\text{V}`)]);
    F.readout(rows);
  }
  const tx = (v) => { if (!(v > 0)) return '0'; const e = Math.floor(Math.log10(v)); return Math.abs(e) < 3 ? String(+v.toPrecision(2)) : `${+(v / 10 ** e).toFixed(1)}\\times10^{${e}}`; };

  const reduced = () => document.documentElement.getAttribute('data-motion') === 'reduce' || !!globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  let running = (P.play ?? !F.compact) && !reduced();
  let acc = 0;
  const tick = (dt) => {
    if (done) return;
    acc += dt * Math.max(12, A.sweeps * 0.8);      // speeds up as it goes, so slow methods still finish
    let k = Math.min(400, Math.floor(acc));
    if (!k) return;
    acc -= k;
    while (k-- > 0 && !done) step1();
    draw();
  };
  reset();
  let loop = F.animate((dt) => { if (running) tick(dt); });
  if (!F.compact && P.play !== false) {
    const btn = F.button({ label: running ? 'Pause' : 'Play', onClick: () => {
      running = !running; btn.textContent = running ? 'Pause' : 'Play';
      loop.stop(); loop = F.animate((dt) => { if (running) tick(dt); }, { force: running });
    } });
    F.button({ label: '+1 sweep', onClick: () => { if (!done) step1(); draw(); } });
    F.button({ label: '+10 sweeps', onClick: () => { for (let k = 0; k < 10 && !done; k++) step1(); draw(); } });
    F.button({ label: 'Restart', onClick: () => { reset(); draw(); } });
  }
  F.onChange((k) => { if (k !== 'point') { reset(); draw(); } });
  F.draw(draw);
  F.caption(P.caption || 'Five-point relaxation on a square grid: each sweep replaces every free node by the average of its four neighbours. The grid’s answer differs from the exact solution by an amount that shrinks as the square of the cell size; corners where two walls disagree are given the average.');
  return { get: (k) => (k === 'point' ? (probe ? (({ x, y }) => ({ x, y }))(M.at(A, probe.x, probe.y)) : null) : k === 'sweeps' ? A.sweeps : F.params[k]) };
}

export function validate(P) {
  const p = [];
  if (!(Number.isFinite(P.n) && P.n >= 4 && P.n <= 60)) p.push('em3-relax: n is 4–60 cells across');
  if (!(P.aspect >= 0.25 && P.aspect <= 2)) p.push('em3-relax: aspect lies in 0.25–2');
  for (const [k, v] of Object.entries(P.walls || {})) {
    if (!['left', 'right', 'bottom', 'top'].includes(k)) p.push(`em3-relax: unknown wall “${k}”`);
    else if (!Number.isFinite(v)) p.push(`em3-relax: wall ${k} needs a number of volts`);
  }
  if (!['flat', 'sine'].includes(P.top)) p.push('em3-relax: top is flat or sine');
  if (!INITS.some(([v]) => v === P.init)) p.push('em3-relax: init is zero, high, random or mean');
  if (!METHODS.some(([v]) => v === P.method)) p.push('em3-relax: method is jacobi, gs or sor');
  if (!(P.sweeps === 'converged' || (Number.isInteger(P.sweeps) && P.sweeps >= 0 && P.sweeps <= 100000))) p.push('em3-relax: sweeps is a whole number or “converged”');
  const e = P.electrode;
  if (e) {
    if (![e.x, e.y, e.w, e.h, e.V].every(Number.isFinite)) p.push('em3-relax: electrode needs x, y, w, h and V');
    else if (!(e.x > 0 && e.y > 0 && e.w > 0 && e.h > 0 && e.x + e.w < 1 && e.y + e.h < P.aspect)) p.push('em3-relax: the electrode must lie inside the box');
  }
  if (P.probe !== false && !(Array.isArray(P.probe) && P.probe.length === 2 && P.probe[0] > 0 && P.probe[0] < 1 && P.probe[1] > 0 && P.probe[1] < P.aspect)) p.push('em3-relax: probe is [x, y] inside the box, or false');
  if (!(Array.isArray(P.levels) ? P.levels.every(Number.isFinite) : Number.isInteger(P.levels) && P.levels >= 0 && P.levels <= 30)) p.push('em3-relax: levels is a count (0–30) or a list of volts');
  if (Array.isArray(P.controls)) for (const c of P.controls) if (!CONTROLS.includes(c)) p.push(`em3-relax: unknown control “${c}”`);
  for (const h of P.hide || []) if (!HIDE.includes(h)) p.push(`em3-relax: unknown hide “${h}”`);
  return p;
}
