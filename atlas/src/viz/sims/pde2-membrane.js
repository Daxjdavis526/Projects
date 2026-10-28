// The normal modes of a membrane fixed along its edge — a rectangular panel
// or a circular drumhead. Above: one mode (or a superposition of two), seen
// from above as shading (blue up, orange down) with its nodal lines in bold,
// or as a 3D surface you can turn; Play sets it vibrating. Below: the
// frequency ladder — the lowest modes as stems at their frequency divided by
// the fundamental's, with dashed ticks at whole multiples 1×, 2×, 3×… A
// string's overtones land on the ticks; a drum's (Bessel zeros) do not.
// Mode shapes and Bessel zeros in model/pde2-membrane.js (computed, not
// tabulated; tested in test/pde2.test.mjs).
//
//   { type: 'pde2-membrane', params: {
//       shape: 'disk',          // disk | rect
//       aspect: 1,              // rect: the side ratio b/a (window 0 ≤ x ≤ 1, 0 ≤ y ≤ aspect)
//       m: 0, n: 1,             // the mode. Disk: m nodal diameters, n − 1 nodal circles. Rect: m half-waves along x, n along y
//       mix: null,              // [m2, n2, s]: add s × the mode (m2, n2) — e.g. [2, 1, 1] with (1, 2) on a square: a Chladni-like pattern
//       view: 'top',            // top | 3d
//       toggle: null,           // offer the top/3D choice (default: in the Explore step)
//       nodal: true,            // draw the nodal lines
//       ladder: true,           // the frequency ladder (default true; false hides it)
//       count: 10,              // modes on the ladder
//       harmonics: true,        // dashed ticks at whole multiples of the fundamental
//       c: null, L: null,       // wave speed (m/s) and size (m: the side a, or the radius): readouts in Hz
//       play: null,             // animate (default: in the Explore step, not in a problem)
//       controls: null,         // true, false, or a list of: shape m n aspect
//       readout: true,
//       hide: [],               // readouts shown as “?”: ratio freq nodal
//       labels: true,           // (m, n) labels on the ladder stems
//   } }

import { Plot } from '../plot.js';
import { View3D } from '../three-d.js';
import * as M from '../model/pde2-membrane.js';
import { sampleGrid, contourSegments, joinSegments } from '../model/c3-contour.js';

export const defaults = { shape: 'disk', aspect: 1, m: 0, n: 1, mix: null, view: 'top', toggle: null, nodal: true, ladder: true, count: 10, harmonics: true, c: null, L: null, play: null, controls: null, readout: true, hide: [], labels: true };
const CONTROLS = ['shape', 'm', 'n', 'aspect'];
const HIDE = ['ratio', 'freq', 'nodal'];
const f4 = (x) => String(+x.toPrecision(4));
const POS = [60, 140, 230], NEG = [235, 135, 55];

export function mount(F, P0) {
  const P = { ...defaults, ...P0 };
  const hide = new Set(P.hide || []);
  const wanted = P.controls === true || (P.controls === null && !F.compact) ? ['m', 'n'] : Array.isArray(P.controls) ? P.controls : [];
  const ctl = (key, make) => (wanted.includes(key) ? make() : (F.params[key] = P[key]));
  ctl('shape', () => F.choice({ key: 'shape', label: 'Membrane', options: [['disk', 'circular drumhead'], ['rect', 'rectangular panel']], value: P.shape, explain: 'The same wave equation, fixed along a different edge.' }));
  const disk = () => F.params.shape === 'disk';
  ctl('m', () => F.slider({ key: 'm', label: 'Mode number $m$', min: P.shape === 'rect' && !wanted.includes('shape') ? 1 : 0, max: 6, step: 1, value: P.m, unit: '', explain: P.shape === 'disk' ? 'The number of nodal diameters: straight nodal lines through the centre.' : 'The number of half-waves across $x$ (at least 1).' }));
  ctl('n', () => F.slider({ key: 'n', label: 'Mode number $n$', min: 1, max: 5, step: 1, value: P.n, unit: '', explain: P.shape === 'disk' ? 'The $n$-th zero of $J_m$ sits on the rim, so $n - 1$ nodal circles lie inside.' : 'The number of half-waves along $y$.' }));
  ctl('aspect', () => F.slider({ key: 'aspect', label: 'Side ratio $b/a$', min: 0.4, max: 2, step: 0.05, value: P.aspect, unit: '', explain: 'Panel only: a square ($b/a = 1$) has pairs of modes sharing one frequency; stretch it and the pairs split.' }));
  const toggle = P.toggle ?? !F.compact;
  if (toggle) F.choice({ key: '__view', label: 'View', options: [['top', 'from above'], ['3d', 'in 3D']], value: P.view, explain: 'Shading from above shows the nodal lines; the 3D view shows the shape.' });
  else F.params.__view = P.view;

  const a = F.canvas({ aspect: 'wide', label: P.alt || 'A membrane vibrating in one of its normal modes' });
  const plot = new Plot(a.canvas, { x: [-1.2, 1.2], y: [-1.1, 1.1], equal: true, xlabel: '', ylabel: '', axes: false, grid: false });
  const view = new View3D(a.canvas, { yaw: -0.6, pitch: 0.62, dist: 8.5 });
  view.onChange = () => { if (F.params.__view === '3d') draw(); };
  const lad = P.ladder !== false ? F.canvas({ label: 'The frequency ladder: each mode’s frequency divided by the fundamental’s', height: F.compact ? '120px' : '160px' }) : null;
  const lp = lad ? new Plot(lad.canvas, { x: [0, 4], y: [0, 1], xlabel: 'frequency ÷ fundamental', ylabel: '', yticks: 0, grid: false, axesAt: 'edge' }) : null;
  const off = document.createElement('canvas');

  const mode = () => {
    const sh = disk() ? 'disk' : 'rect';
    let m = Math.round(F.params.m), n = Math.round(F.params.n);
    if (sh === 'rect' && m < 1) m = 1;
    return { sh, m, n, asp: sh === 'rect' ? +F.params.aspect : 1 };
  };

  let phase = 0;
  function field(sh, m, n, asp) {
    const pk1 = M.peak(sh, m, n);
    const mix = P.mix;
    const pk2 = mix ? M.peak(sh, mix[0], mix[1]) : 1;
    return (x, y) => {
      const v = M.shape(sh, m, n, x, y, asp) / pk1;
      return mix ? (v + (mix[2] ?? 1) * M.shape(sh, mix[0], mix[1], x, y, asp) / pk2) / (1 + Math.abs(mix[2] ?? 1)) : v;
    };
  }

  function draw() {
    const { sh, m, n, asp } = mode();
    const f = field(sh, m, n, asp);
    const amp = Math.cos(phase);
    // map the membrane into a window centred on 0: disk radius 1, rectangle scaled to fit
    const sc = sh === 'disk' ? 1 : 2 / Math.max(1, asp) * 0.95;
    const w = sh === 'disk' ? [-1, 1] : [-0.5 * sc, 0.5 * sc], hgt = sh === 'disk' ? [-1, 1] : [-0.5 * asp * sc, 0.5 * asp * sc];
    const toM = (X, Y) => (sh === 'disk' ? [X, Y] : [X / sc + 0.5, Y / sc + 0.5 * asp]);
    const g = (X, Y) => { const [x, y] = toM(X, Y); return f(x, y); };
    if (F.params.__view === '3d') draw3d(g, sh, w, hgt, amp);
    else draw2d(g, sh, w, hgt, amp);
    if (lp) drawLadder(sh, m, n, asp);
    if (P.readout !== false) {
      const q = (k, v) => (hide.has(k) ? '?' : v);
      const r = M.modeK(sh, m, n, asp) / M.fundamental(sh, asp);
      const rows = [['mode $(m, n)$', `(${m},\\ ${n})`]];
      rows.push(['nodal lines', q('nodal', sh === 'disk' ? `${m}\\text{ diam.}, ${n - 1}\\text{ circ.}` : `${m - 1}\\text{ vert.}, ${n - 1}\\text{ horiz.}`)]);
      rows.push([sh === 'disk' ? '$j_{mn}$' : '$k a$', q('ratio', f4(M.modeK(sh, m, n, asp)))]);
      rows.push(['$f / f_{\\text{fund}}$', q('ratio', f4(r))]);
      if (P.c && P.L) rows.push(['$f$', q('freq', `${f4(M.freqHz(sh, m, n, P.c, P.L, asp))}\\,\\text{Hz}`)]);
      F.readout(rows);
    }
  }

  function draw2d(g, sh, w, hgt, amp) {
    plot.clear();
    const ctx = plot.ctx;
    const N = 150;
    const X0 = plot.vx0, X1 = plot.vx1, Y0 = plot.vy0, Y1 = plot.vy1;
    const ny = Math.max(20, Math.round((N * (Y1 - Y0)) / (X1 - X0)));
    off.width = N; off.height = ny;
    const ox = off.getContext('2d'), img = ox.createImageData(N, ny);
    for (let i = 0; i < N; i++) for (let j = 0; j < ny; j++) {
      const X = X0 + ((i + 0.5) * (X1 - X0)) / N, Y = Y1 - ((j + 0.5) * (Y1 - Y0)) / ny;
      const v = g(X, Y) * amp, k = 4 * (j * N + i);
      if (!Number.isFinite(v)) { img.data[k + 3] = 0; continue; }
      const c = v >= 0 ? POS : NEG, s = Math.min(1, Math.abs(v));
      img.data[k] = c[0]; img.data[k + 1] = c[1]; img.data[k + 2] = c[2]; img.data[k + 3] = Math.round(40 + 200 * s);
    }
    ox.putImageData(img, 0, 0);
    ctx.save(); plot._clip(); ctx.imageSmoothingEnabled = true;
    ctx.drawImage(off, plot.X(X0), plot.Y(Y1), plot.X(X1) - plot.X(X0), plot.Y(Y0) - plot.Y(Y1));
    ctx.restore();
    // the fixed edge
    if (sh === 'disk') plot.circle(0, 0, 1, { color: 'ink', width: 2.2 });
    else plot.path([[w[0], hgt[0]], [w[1], hgt[0]], [w[1], hgt[1]], [w[0], hgt[1]], [w[0], hgt[0]]], { color: 'ink', width: 2.2 });
    if (P.nodal !== false) {
      // nodal lines: the zero set of the shape, traced on a grid inset from the edge (which is itself a nodal line)
      const e = 0.004;
      const gx = sh === 'disk' ? [-1 + e, 1 - e] : [w[0] + e, w[1] - e], gy = sh === 'disk' ? [-1 + e, 1 - e] : [hgt[0] + e, hgt[1] - e];
      const grid = sampleGrid((X, Y) => (sh === 'disk' && Math.hypot(X, Y) > 1 - e ? NaN : g(X, Y)), gx, gy, 161, 161);
      for (const line of joinSegments(contourSegments(grid, 0))) plot.path(line, { color: 'ink', width: 2.4 });
    }
  }

  function draw3d(g, sh, w, hgt, amp) {
    view.begin();
    const S = 2.2, Z = 1.1, K = 44;
    let grid;
    if (sh === 'disk') {
      grid = Array.from({ length: K + 1 }, (_, i) => Array.from({ length: 2 * K + 1 }, (_, j) => {
        const r = i / K, th = (Math.PI * j) / K, X = r * Math.cos(th), Y = r * Math.sin(th);
        const v = i === K ? 0 : g(X, Y);
        return [S * X, S * Y, Z * v * amp];
      }));
    } else {
      grid = Array.from({ length: K + 1 }, (_, i) => Array.from({ length: K + 1 }, (_, j) => {
        const X = w[0] + ((w[1] - w[0]) * i) / K, Y = hgt[0] + ((hgt[1] - hgt[0]) * j) / K;
        const v = i === 0 || j === 0 || i === K || j === K ? 0 : g(X, Y);
        return [S * X, S * Y, Z * v * amp];
      }));
    }
    view.surface(grid, { colorBy: (p) => 0.5 + p[2] / (2 * Z), alpha: 0.9 });
    // the rim
    const rim = sh === 'disk'
      ? Array.from({ length: 121 }, (_, k) => [S * Math.cos((2 * Math.PI * k) / 120), S * Math.sin((2 * Math.PI * k) / 120), 0])
      : [[w[0], hgt[0]], [w[1], hgt[0]], [w[1], hgt[1]], [w[0], hgt[1]], [w[0], hgt[0]]].map(([X, Y]) => [S * X, S * Y, 0]);
    view.line(rim, { color: 'ink', width: 2.4, bias: 0.02 });
    view.end();
  }

  function drawLadder(sh, m, n, asp) {
    const list = M.modeList(sh, P.count, asp);
    const top = Math.max(4, Math.ceil(list[list.length - 1].ratio + 0.3));
    lp.setView([0, top], [0, 1.45]);
    lp.clear();
    const narrow = (lad.canvas.clientWidth || 600) < 520, fs = narrow ? 9.5 : 11;
    if (P.harmonics !== false) for (let k = 1; k <= top; k++) {
      lp.line(k, 0, k, 1.22, { color: 'ink4', width: 1, dash: [4, 4] });
      lp.text(`${k}×`, k, 1.33, { color: 'ink3', align: 'center', size: fs });
    }
    const cur = M.modeK(sh, m, n, asp) / M.fundamental(sh, asp);
    // modes sharing a frequency share one stem; their labels stack
    const groups = [];
    for (const o of list) {
      const g = groups.find((q) => Math.abs(q.r - o.ratio) < 1e-7);
      if (g) g.items.push(o); else groups.push({ r: o.ratio, items: [o] });
    }
    let curDrawn = false;
    const placed = [];
    for (const g of groups) {
      const isCur = Math.abs(g.r - cur) < 1e-7;
      lp.line(g.r, 0, g.r, 0.45, { color: isCur ? 'gold' : 'accent', width: isCur ? 3.2 : 2.2 });
      const labels = g.items.filter((o) => !(o.m === m && o.n === n)).map((o) => `${o.m},${o.n}`);
      // stems closer than about 30 px start their labels one row higher
      const near = (lad.canvas.clientWidth ? 30 / (lp.X(1) - lp.X(0)) : 0.12);
      let lvl = 0;
      while (placed.some((q) => q.l === lvl && Math.abs(q.x - g.r) < near)) lvl++;
      const rows = labels.length + (isCur ? 1 : 0);
      for (let i = 0; i < rows; i++) placed.push({ x: g.r, l: lvl + i });
      if (P.labels !== false && !narrow) labels.forEach((L, i) => lp.text(L, g.r, 0.55 + 0.2 * (lvl + i), { color: 'ink2', align: 'center', size: fs - 1 }));
      if (isCur) { lp.text(`(${m},${n})`, g.r, 0.55 + 0.2 * (narrow ? 0 : lvl + labels.length), { color: 'gold', align: 'center', size: fs, weight: 700 }); curDrawn = true; }
    }
    if (!curDrawn && cur <= top) {
      lp.line(cur, 0, cur, 0.45, { color: 'gold', width: 3.2 });
      lp.text(`(${m},${n})`, cur, 0.55, { color: 'gold', align: 'center', size: fs, weight: 700 });
    }
  }

  const reduced = () => document.documentElement.getAttribute('data-motion') === 'reduce' || !!globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  let running = (P.play ?? !F.compact) && !reduced();
  const tick = (dt) => {
    const { sh, m, n, asp } = mode();
    phase += dt * 2 * Math.PI * 0.45 * (M.modeK(sh, m, n, asp) / M.fundamental(sh, asp));
    draw();
  };
  let loop = F.animate((dt) => { if (running) tick(dt); });
  if (!F.compact && P.play !== false) {
    const btn = F.button({ label: running ? 'Pause' : 'Play', onClick: () => {
      running = !running; btn.textContent = running ? 'Pause' : 'Play';
      if (!running) { phase = 0; draw(); }
      loop.stop(); loop = F.animate((dt) => { if (running) tick(dt); }, { force: running });
    } });
  }
  F.onChange(() => draw());
  F.draw(draw);
  F.caption(P.caption || 'An ideal membrane: uniform tension, no bending stiffness, no air around it, small amplitude. Shading: blue displaced up, orange down; bold lines stay still (nodal lines). Animation slowed to a fraction of a hertz.');
  return { get: (k) => F.params[k] };
}

export function validate(P) {
  const p = [];
  if (!['disk', 'rect'].includes(P.shape)) p.push('pde2-membrane: shape is disk or rect');
  const mmin = P.shape === 'rect' ? 1 : 0;
  if (!(Number.isInteger(P.m) && P.m >= mmin && P.m <= 6)) p.push(`pde2-membrane: m is a whole number from ${mmin} to 6`);
  if (!(Number.isInteger(P.n) && P.n >= 1 && P.n <= 5)) p.push('pde2-membrane: n is a whole number from 1 to 5');
  if (!(P.aspect >= 0.4 && P.aspect <= 2)) p.push('pde2-membrane: aspect lies in 0.4–2');
  if (P.mix != null && !(Array.isArray(P.mix) && P.mix.length >= 2 && Number.isInteger(P.mix[0]) && Number.isInteger(P.mix[1]) && P.mix[0] >= mmin && P.mix[1] >= 1)) p.push('pde2-membrane: mix is [m2, n2, s] with whole mode numbers');
  if (!['top', '3d'].includes(P.view)) p.push('pde2-membrane: view is top or 3d');
  if (!(Number.isInteger(P.count) && P.count >= 2 && P.count <= 30)) p.push('pde2-membrane: count is 2–30');
  if ((P.c == null) !== (P.L == null)) p.push('pde2-membrane: give both c and L, or neither');
  if (P.c != null && !(P.c > 0 && P.L > 0)) p.push('pde2-membrane: c and L must be positive');
  if (Array.isArray(P.controls)) for (const c of P.controls) if (!CONTROLS.includes(c)) p.push(`pde2-membrane: unknown control “${c}”`);
  for (const h of P.hide || []) if (!HIDE.includes(h)) p.push(`pde2-membrane: unknown hide “${h}”`);
  return p;
}
