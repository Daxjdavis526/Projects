// The linear chain: N equal masses joined by equal springs, the system whose
// normal modes become a string's as N grows (PHYS 3750, W3–W5). Top: the
// chain moving — drawn sideways as a beaded string (transverse view) or along
// its length with springs (longitudinal view, with the displacements also
// plotted sideways above it). Beside it: the dispersion relation
// ω = 2√(k/m)|sin(qa/2)| with a dot for every mode the chain admits, the
// long-wave line ω = v q (v = a√(k/m)) dashed, and the cutoff 2√(k/m).
// Start the chain in one normal mode, pluck one mass, launch a Gaussian
// pulse, or give it any displacements; the motion is the exact sum of the
// normal modes (no numerical drift). Physics: model/wv-chain.js, tested in
// test/wv-chain.test.mjs.
//
//   { type: 'wv-chain', params: {
//       N: 8,                     // masses (1–60; a ring needs 3+)
//       bc: 'fixed',              // fixed (walls), free (end masses tied on one side only), periodic (a ring)
//       k: 100, m: 0.25, a: 0.1,  // spring constant (N/m), mass (kg), spacing (m)
//       start: 'mode',            // mode | pluck (one mass pulled aside) | pulse (a right-moving Gaussian) | custom (x0)
//       n: 1,                     // mode: the mode number (fixed 1…N; free 0…N−1; ring 0…⌊N/2⌋, its cos partner)
//       pluck: 1,                 // pluck: which mass (1…N)
//       x0: null,                 // custom: the N starting displacements (released from rest)
//       width: 2, center: null,   // pulse: Gaussian width and starting centre, in spacings (centre default: a quarter of the way)
//       view: 'transverse',       // transverse | longitudinal
//       panels: ['chain', 'disp'],// which panels: chain, disp (the dispersion plot), gallery (every mode, stacked, N ≤ 8)
//       ghost: true,              // mode: the continuous string shape the masses sample, dashed
//       line: true,               // disp: the long-wave line ω = v q
//       spectrum: true,           // disp: for pluck/pulse/custom, each mode's dot sized by how much of it the start holds
//       labels: true,             // gallery: each row's ω (false hides them)
//       controls: ['N', 'n'],     // any of N n bc start pluck width view ([] for a problem's picture)
//       maxN: 40,                 // the N slider's top
//       play: true,               // animate (never under reduced motion until Play); false: a still at `time`; 'never': no Play button
//       time: 0,                  // the moment shown when still (s)
//       readout: true,            // false hides the numbers
//       readouts: null,           // which rows: N n q omega f vq ratio cutoff v t (default depends on start)
//       hide: [],                 // rows printed as “?” (a problem must not print its answer)
//       caption: null,
//   } }

import { Plot } from '../plot.js';
import * as C from '../model/wv-chain.js';

export const defaults = {
  N: 8, bc: 'fixed', k: 100, m: 0.25, a: 0.1, start: 'mode', n: 1, pluck: 1, x0: null, width: 2, center: null,
  view: 'transverse', panels: ['chain', 'disp'], ghost: true, line: true, spectrum: true, labels: true,
  controls: ['N', 'n'], maxN: 40, play: true, time: 0, readout: true, readouts: null, hide: [], caption: null,
};
const CONTROLS = ['N', 'n', 'bc', 'start', 'pluck', 'width', 'view'];
const PANELS = ['chain', 'disp', 'gallery'];
const ROWS = ['N', 'n', 'q', 'omega', 'f', 'vq', 'ratio', 'cutoff', 'v', 't'];
const STARTS = ['mode', 'pluck', 'pulse', 'custom'];

const trim = (x, d = 3) => {
  if (!Number.isFinite(x)) return '\\text{—}';
  const a = Math.abs(x);
  if (a !== 0 && (a < 1e-3 || a >= 1e5)) { const [mm, e] = x.toExponential(d - 1).split('e'); return `${+mm}\\times10^{${+e}}`; }
  return String(+(+x).toPrecision(d));
};

export async function mount(F, P0) {
  const P = { ...defaults, ...P0 };
  let reduced = false;
  try { reduced = (await import('../../ui/state.js')).reducedMotion(); } catch { reduced = true; }
  const panels = (P.panels || PANELS).filter((p) => PANELS.includes(p));
  const C0 = new Set(P.controls || []);
  const gal = panels.includes('gallery');

  // ─── canvases ─────────────────────────────────────────────────────────
  const longi = () => F.params.view === 'longitudinal';
  const chainCv = panels.includes('chain') ? F.canvas({ height: F.compact ? '130px' : (P.view === 'longitudinal' ? '200px' : '170px'), label: 'A chain of masses joined by springs, moving' }) : null;
  const galRows = Math.min(8, P.N);
  const galCv = gal ? F.canvas({ height: `${galRows * 46 + 12}px`, label: 'Every normal mode of the chain, stacked' }) : null;
  const dispCv = panels.includes('disp') ? F.canvas({ aspect: F.compact ? 'wide' : '', label: 'The dispersion relation: frequency against wavenumber, with a dot for each mode' }) : null;

  // ─── controls ─────────────────────────────────────────────────────────
  const put = (k, v) => { F.params[k] = v; };
  if (C0.has('bc')) F.choice({ key: 'bc', label: 'Ends', options: [['fixed', 'Fixed'], ['free', 'Free'], ['periodic', 'Ring']], value: P.bc, explain: 'Fixed: walls beyond the end masses. Free: the end masses are tied on one side only. Ring: the last mass is joined to the first.' });
  else put('bc', P.bc);
  if (C0.has('N')) F.slider({ key: 'N', label: 'Masses $N$', min: 1, max: P.maxN, step: 1, value: P.N, explain: 'More masses, closer together, on a chain of the same length per mass: the string is the limit $N \\to \\infty$.' });
  else put('N', P.N);
  if (C0.has('start')) F.choice({ key: 'start', label: 'Start', options: [['mode', 'One mode'], ['pluck', 'Pluck one mass'], ['pulse', 'A pulse']], value: P.start === 'custom' ? 'mode' : P.start, explain: 'A normal mode keeps its shape; anything else is a mixture of modes, each at its own frequency.' });
  else put('start', P.start);
  if (C0.has('n')) F.slider({ key: 'n', label: 'Mode $n$', min: P.bc === 'fixed' ? 1 : 0, max: P.bc === 'periodic' ? Math.floor(P.maxN / 2) : P.maxN, step: 1, value: P.n, explain: 'The mode number: with fixed ends, mode $n$ has $n - 1$ nodes between the walls.' });
  else put('n', P.n);
  if (C0.has('pluck')) F.slider({ key: 'pluck', label: 'Plucked mass', min: 1, max: P.maxN, step: 1, value: P.pluck, explain: 'Which mass is pulled aside and released; the others start at rest where they are.' });
  else put('pluck', P.pluck);
  if (C0.has('width')) F.slider({ key: 'width', label: 'Pulse width $w$', min: 0.5, max: 8, step: 0.1, value: P.width, unit: '\\text{spacings}', explain: 'A pulse much wider than the spacing holds its shape; one only a spacing or two wide falls apart into ripples.' });
  else put('width', P.width);
  if (C0.has('view')) F.choice({ key: 'view', label: 'Motion', options: [['transverse', 'Sideways (string)'], ['longitudinal', 'Along the chain']], value: P.view, explain: 'The same equations describe beads on a string moving sideways and masses on springs moving lengthwise.' });
  else put('view', P.view);

  // ─── state ────────────────────────────────────────────────────────────
  const N = () => Math.max(F.params.bc === 'periodic' ? 3 : 1, Math.min(60, Math.round(F.params.N)));
  const w0 = Math.sqrt(P.k / P.m), v = P.a * w0;
  function build() {
    const n_ = N(), bc = F.params.bc, ms = C.chainModes(n_, bc), [lo, hi] = C.modeRange(n_, bc);
    const st = F.params.start;
    const nn = Math.max(lo, Math.min(hi, Math.round(F.params.n)));
    const mode = ms.find((m) => m.n === nn);
    let x0, v0 = null;
    if (st === 'mode') x0 = mode.shape.slice();
    else if (st === 'pluck') { x0 = Array(n_).fill(0); x0[Math.max(1, Math.min(n_, Math.round(F.params.pluck))) - 1] = 1; }
    else if (st === 'pulse') {
      const L = C.layout(n_, bc).L;
      ({ x0, v0 } = C.pulse(n_, bc, P.center ?? L / 4, F.params.width));
    } else x0 = (P.x0 || []).slice(0, n_).concat(Array(Math.max(0, n_ - (P.x0 || []).length)).fill(0));
    const amps = C.project(ms, x0), bs = v0 ? C.project(ms, v0) : ms.map(() => 0);
    const content = ms.map((m, i) => Math.hypot(amps[i], m.w > 1e-12 ? bs[i] / m.w : 0));
    const scale = Math.max(...x0.map(Math.abs), 1e-9);
    const live = ms.filter((m) => m.w > 1e-12), wmax = Math.max(...live.map((m) => m.w), 1e-9);
    const L = C.layout(n_, bc).L;
    // seconds of model time per real second
    const rate = st === 'mode' ? (mode.w > 1e-12 ? (2 * Math.PI) / (mode.w * w0) / 2 : 1) : Math.max(L / v / 6, (2 * Math.PI) / (wmax * w0) / 2.5);
    return { n: n_, bc, ms, nn, mode, x: C.motion(ms, x0, v0), content, cmax: Math.max(...content, 1e-12), scale, rate, L, st };
  }
  let B = build();
  const still = P.play === false || P.play === 'never' || gal && !panels.includes('chain');
  const S = { t: P.time || 0, running: !still && !!P.play && !reduced && !F.compact };
  const anim = F.animate((dt) => { if (!S.running) return; S.t += dt * B.rate; draw(); }, { force: true });
  if (P.play !== 'never' && panels.includes('chain')) {
    const btn = F.button({ label: S.running ? 'Pause' : 'Play', primary: true, onClick: () => { S.running = !S.running; btn.textContent = S.running ? 'Pause' : 'Play'; if (S.running) anim.start(); } });
    F.button({ label: 'Restart', onClick: () => { S.t = 0; draw(); } });
  }
  F.onChange(() => { B = build(); S.t = still ? P.time || 0 : 0; draw(); });

  const pc = chainCv && new Plot(chainCv.canvas, { x: [0, 1], y: [-1, 1], grid: false, axes: false, pad: { l: 8, r: 8, t: 8, b: 8 } });
  const pg = galCv && new Plot(galCv.canvas, { x: [0, 1], y: [0, 1], grid: false, axes: false, pad: { l: 8, r: 8, t: 6, b: 6 } });
  const pd = dispCv && new Plot(dispCv.canvas, { x: [0, 1], y: [0, 1], xlabel: 'q (rad/m)', ylabel: 'ω (rad/s)', pad: { l: 52, r: 18, t: 16, b: 36 } });

  // a beaded string: masses at world (s, y) with lines between, walls or ring copies at the ends
  function beads(p, ys, y0, h, o = {}) {
    const { pos, L } = C.layout(B.n, B.bc), g = p.ctx, col = p.col;
    const X = (s) => p.X(s), Y = (y) => p.Y(y0 + y * h);
    const r = Math.max(2.5, Math.min(o.r || 8, (p.X(1) - p.X(0)) * 0.3));
    g.save();
    // walls
    if (B.bc === 'fixed') {
      g.fillStyle = col.ink4;
      g.fillRect(X(0) - 6, Y(0) - h * (p.h / (p.vy1 - p.vy0)) * 0.9, 6, 2 * h * (p.h / (p.vy1 - p.vy0)) * 0.9);
      g.fillRect(X(L), Y(0) - h * (p.h / (p.vy1 - p.vy0)) * 0.9, 6, 2 * h * (p.h / (p.vy1 - p.vy0)) * 0.9);
    }
    // the rest line
    g.strokeStyle = col.line2; g.setLineDash([3, 4]); g.lineWidth = 1;
    g.beginPath(); g.moveTo(X(B.bc === 'free' ? pos[0] : 0), Y(0)); g.lineTo(X(B.bc === 'free' ? pos[B.n - 1] : L), Y(0)); g.stroke();
    g.setLineDash([]);
    // the string between beads
    const pts = pos.map((s, i) => [s, ys[i]]);
    if (B.bc === 'fixed') { pts.unshift([0, 0]); pts.push([L, 0]); }
    g.strokeStyle = col.ink2; g.lineWidth = 1.5;
    g.beginPath(); pts.forEach(([s, y], i) => (i ? g.lineTo(X(s), Y(y)) : g.moveTo(X(s), Y(y)))); g.stroke();
    if (B.bc === 'periodic') {
      // faded copies: mass N before mass 1, mass 1 after mass N
      g.globalAlpha = 0.35; g.setLineDash([4, 3]);
      g.beginPath(); g.moveTo(X(0), Y(ys[B.n - 1])); g.lineTo(X(pos[0]), Y(ys[0])); g.stroke();
      g.beginPath(); g.moveTo(X(pos[B.n - 1]), Y(ys[B.n - 1])); g.lineTo(X(L + 1), Y(ys[0])); g.stroke();
      g.setLineDash([]); g.fillStyle = col.accent;
      g.beginPath(); g.arc(X(0), Y(ys[B.n - 1]), r, 0, 7); g.fill();
      g.beginPath(); g.arc(X(L + 1), Y(ys[0]), r, 0, 7); g.fill();
      g.globalAlpha = 1;
    }
    for (let i = 0; i < B.n; i++) {
      g.fillStyle = o.hi === i ? col.gold : col.accent;
      g.beginPath(); g.arc(X(pos[i]), Y(ys[i]), r, 0, 7); g.fill();
    }
    g.restore();
  }

  function zigzag(g, x0, x1, y, hh, turns) {
    const Lp = x1 - x0, a = x0 + 0.15 * Lp, b = x1 - 0.15 * Lp;
    g.beginPath(); g.moveTo(x0, y); g.lineTo(a, y);
    for (let i = 0; i < turns; i++) g.lineTo(a + ((b - a) * (i + 0.5)) / turns, y + (i % 2 ? -hh : hh));
    g.lineTo(b, y); g.lineTo(x1, y); g.stroke();
  }

  function drawChain() {
    const { pos, L } = C.layout(B.n, B.bc);
    const lo = B.bc === 'periodic' ? -0.6 : -0.5, hi = B.bc === 'periodic' ? L + 1.6 : L + 0.5;
    const tau = S.t * w0, st = B.x(tau), ys = st.x.map((x) => x / B.scale);
    const hiMass = B.st === 'pluck' ? Math.max(1, Math.min(B.n, Math.round(F.params.pluck))) - 1 : -1;
    if (!longi()) {
      pc.setView([lo, hi], [-1.25, 1.25]);
      pc.clear();
      // the continuum shape the mode samples
      if (P.ghost && B.st === 'mode') {
        const f = C.continuumShape(B.n, B.bc, B.nn, B.mode.part), fs = pos.map(f);
        const den = fs.reduce((s, x) => s + x * x, 0);
        if (den > 1e-12) {
          const c = B.mode.shape.reduce((s, x, i) => s + x * fs[i], 0) / den / B.scale;
          const amp = B.mode.w > 1e-12 ? Math.cos(B.mode.w * tau) : 1;
          const a0 = B.bc === 'periodic' ? 0 : B.bc === 'free' ? 0 : 0, a1 = B.bc === 'periodic' ? L + 1 : L;
          pc.fn((s) => c * f(s), { domain: [a0, a1], color: 'ink4', width: 1, dash: [2, 4] });
          pc.fn((s) => -c * f(s), { domain: [a0, a1], color: 'ink4', width: 1, dash: [2, 4] });
          pc.fn((s) => amp * c * f(s), { domain: [a0, a1], color: 'gold', width: 1.4, dash: [6, 4], alpha: 0.8 });
        }
      }
      beads(pc, ys, 0, 1, { hi: hiMass, r: 9 });
    } else {
      // top strip: the displacements drawn sideways; bottom: the masses moving along the line
      pc.setView([lo, hi], [-2.2, 1.25]);
      pc.clear();
      beads(pc, ys.map((y) => y * 0.55), 0.45, 1, { hi: hiMass, r: 5 });
      const g = pc.ctx, col = pc.col, yb = pc.Y(-1.45), gap = pc.X(1) - pc.X(0);
      const xs = pos.map((s, i) => pc.X(s + 0.38 * ys[i]));
      const r = Math.max(3, Math.min(9, gap * 0.26));
      g.save();
      g.strokeStyle = col.ink3; g.lineWidth = 1.2;
      const ends = B.bc === 'fixed' ? [pc.X(0), ...xs, pc.X(L)] : xs;
      if (B.bc === 'fixed') { g.fillStyle = col.ink4; g.fillRect(pc.X(0) - 6, yb - 16, 6, 32); g.fillRect(pc.X(L), yb - 16, 6, 32); }
      for (let j = 0; j + 1 < ends.length; j++) {
        const a = ends[j] + (B.bc === 'fixed' && j === 0 ? 0 : r), b = ends[j + 1] - (B.bc === 'fixed' && j === ends.length - 2 ? 0 : r);
        if (b - a > 6) { if (gap > 26) zigzag(g, a, b, yb, Math.min(6, gap * 0.12), 5); else { g.beginPath(); g.moveTo(a, yb); g.lineTo(b, yb); g.stroke(); } }
      }
      if (B.bc === 'periodic') { g.setLineDash([4, 3]); g.globalAlpha = 0.5; g.beginPath(); g.moveTo(xs[B.n - 1] + r, yb); g.lineTo(pc.X(L + 1), yb); g.stroke(); g.beginPath(); g.moveTo(pc.X(0), yb); g.lineTo(xs[0] - r, yb); g.stroke(); g.setLineDash([]); g.globalAlpha = 1; }
      for (let i = 0; i < B.n; i++) {
        g.strokeStyle = col.line3; g.setLineDash([2, 3]); g.beginPath(); g.moveTo(pc.X(pos[i]), yb - 14); g.lineTo(pc.X(pos[i]), yb + 14); g.stroke(); g.setLineDash([]);
        g.fillStyle = i === hiMass ? col.gold : col.accent; g.beginPath(); g.arc(xs[i], yb, r, 0, 7); g.fill();
      }
      g.restore();
      pc.text('displacement, drawn sideways', pc.X(lo) + 4, pc.Y(1.12), { screen: true, color: 'ink3', size: 11 });
      pc.text('the masses, moving along the chain', pc.X(lo) + 4, pc.Y(-0.95), { screen: true, color: 'ink3', size: 11 });
    }
  }

  function drawGallery() {
    const { pos, L } = C.layout(B.n, B.bc);
    const rows = B.ms.slice(0, galRows);
    pg.setView([-0.5, L + (B.bc === 'periodic' ? 1.6 : 0.5)], [0, rows.length]);
    pg.clear();
    const save = B.scale;
    rows.forEach((m, k) => {
      const y0 = rows.length - k - 0.5, big = Math.max(...m.shape.map(Math.abs), 1e-9);
      B.scale = big;
      beads(pg, m.shape.map((x) => x / big), y0, 0.36, { r: 6 });
      const f = C.continuumShape(B.n, B.bc, m.n, m.part);
      const fs = pos.map(f), den = fs.reduce((s, x) => s + x * x, 0);
      if (P.ghost && den > 1e-12) {
        const c = m.shape.reduce((s, x, i) => s + x * fs[i], 0) / den / big;
        pg.fn((s) => y0 + 0.36 * c * f(s), { domain: [0, B.bc === 'periodic' ? L + 1 : L], color: 'ink4', width: 1, dash: [2, 4] });
      }
      const lab = B.bc === 'periodic' ? `p = ${m.n}${m.part === 'sin' ? ' (sin)' : ''}` : `n = ${m.n}`;
      pg.text(lab, pg.L + 4, pg.Y(y0 + 0.4), { screen: true, color: 'ink2', size: 11, weight: 650 });
      if (P.labels) pg.text(`ω = ${(+(m.w * w0).toPrecision(3))} rad/s`, pg.R - 4, pg.Y(y0 + 0.4), { screen: true, align: 'right', color: 'ink3', size: 11 });
    });
    B.scale = save;
  }

  function drawDisp() {
    const qmax = Math.PI / P.a, wmax = 2 * w0;
    pd.setView([0, qmax * 1.04], [0, wmax * 1.18]);
    pd.clear();
    pd.fn((q) => C.omegaOf(q, P.a) * w0, { domain: [0, qmax], color: 'accent', width: 2 });
    if (P.line) pd.fn((q) => v * q, { domain: [0, Math.min(qmax * 1.04, (wmax * 1.18) / v)], color: 'ink3', width: 1.4, dash: [6, 5] });
    pd.line(0, wmax, qmax * 1.04, wmax, { color: 'warn', width: 1, dash: [3, 4] });
    pd.line(qmax, 0, qmax, wmax * 1.18, { color: 'ink4', width: 1, dash: [2, 4] });
    pd.text('cutoff 2√(k/m)', pd.X(qmax * 0.02), pd.Y(wmax), { screen: true, dy: -9, color: 'warn', size: 11 });
    if (P.line) pd.text('ω = v q', pd.X(Math.min(qmax * 0.62, wmax * 0.95 / v)), pd.Y(v * Math.min(qmax * 0.62, wmax * 0.95 / v)), { screen: true, dx: -12, dy: -2, align: 'right', color: 'ink3', size: 11 });
    pd.text('q = π/a', pd.X(qmax), pd.Y(wmax * 0.12), { screen: true, dx: -6, align: 'right', color: 'ink3', size: 11 });
    const mixed = B.st !== 'mode' && P.spectrum;
    const seen = new Set();
    B.ms.forEach((m, i) => {
      const key = `${m.n}`;
      if (seen.has(key) && !mixed) return;
      seen.add(key);
      const q = m.q / P.a, w = m.w * w0;
      if (mixed) {
        const f = B.content[i] / B.cmax;
        pd.point(q, w, { color: 'ink4', r: 2 });
        if (f > 0.02) pd.point(q, w, { color: 'gold', r: 2.5 + 6 * f });
      } else pd.point(q, w, { color: m.n === B.nn && B.st === 'mode' ? 'gold' : 'ink2', r: m.n === B.nn && B.st === 'mode' ? 6 : 3 });
    });
  }

  function readout() {
    if (P.readout === false) { F.readout([]); return; }
    const m = B.mode, q = m.q / P.a, w = m.w * w0;
    const want = P.readouts || (B.st === 'mode' ? ['N', 'n', 'q', 'omega', 'vq', 'cutoff'] : ['N', 'v', 'cutoff', 't']);
    const hide = new Set(P.hide || []);
    const val = {
      N: ['$N$', `${B.n}`], n: ['mode $n$', `${B.nn}`],
      q: ['$q_n$', `${trim(q)}\\ \\mathrm{rad/m}`], omega: ['$\\omega_n$', `${trim(w)}\\ \\mathrm{rad/s}`],
      f: ['$f_n$', `${trim(w / (2 * Math.PI))}\\ \\mathrm{Hz}`], vq: ['string value $vq_n$', `${trim(v * q)}\\ \\mathrm{rad/s}`],
      ratio: ['$\\omega_n / vq_n$', q > 0 ? trim(w / (v * q), 4) : '\\text{—}'], cutoff: ['cutoff $2\\sqrt{k/m}$', `${trim(2 * w0)}\\ \\mathrm{rad/s}`],
      v: ['$v = a\\sqrt{k/m}$', `${trim(v)}\\ \\mathrm{m/s}`], t: ['$t$', `${trim(S.t, 2)}\\ \\mathrm{s}`],
    };
    F.readout(want.filter((k) => val[k]).map((k) => [val[k][0], hide.has(k) ? '?' : val[k][1]]));
  }

  function draw() {
    if (pc) drawChain();
    if (pg) drawGallery();
    if (pd) drawDisp();
    readout();
  }
  F.draw(draw);
  F.caption(P.caption || (longi()
    ? 'Equal masses and ideal Hooke’s-law springs, no friction. The displacements are exaggerated and the strip above repeats them sideways so they can be read. The motion is the exact sum of the normal modes.'
    : 'Equal beads on a light string under tension (or masses on springs, drawn sideways): small displacements, exaggerated, no damping. Dashed: the continuous string shape a mode samples. The motion is the exact sum of the normal modes.'));
  return { get: (k) => (k === 'n' ? B.nn : k === 'N' ? B.n : F.params[k]) };
}

export function validate(P) {
  const out = [];
  if (!Number.isInteger(P.N) || P.N < 1 || P.N > 60) out.push('wv-chain: N must be a whole number from 1 to 60');
  if (!C.BCS.includes(P.bc)) out.push('wv-chain: bc must be fixed, free or periodic');
  if (P.bc === 'periodic' && P.N < 3) out.push('wv-chain: a ring needs at least 3 masses');
  if (C.BCS.includes(P.bc) && Number.isInteger(P.N) && P.N >= 1) {
    const [lo, hi] = C.modeRange(P.N, P.bc);
    if (!Number.isInteger(P.n) || P.n < lo || P.n > hi) out.push(`wv-chain: n must be a whole number from ${lo} to ${hi} for ${P.bc} ends and N = ${P.N}`);
    if (!Number.isInteger(P.pluck) || P.pluck < 1 || P.pluck > P.N) out.push('wv-chain: pluck must name a mass, 1 to N');
  }
  if (!STARTS.includes(P.start)) out.push(`wv-chain: start must be one of ${STARTS.join(', ')}`);
  if (P.start === 'custom' && !(Array.isArray(P.x0) && P.x0.length === P.N && P.x0.every(Number.isFinite) && P.x0.some((x) => x !== 0))) out.push('wv-chain: a custom start needs x0, N numbers, not all zero');
  if (P.x0 !== null && P.x0 !== undefined && !(Array.isArray(P.x0) && P.x0.length === P.N)) out.push('wv-chain: x0 must list N displacements');
  for (const k of ['k', 'm', 'a', 'width']) if (!(P[k] > 0)) out.push(`wv-chain: ${k} must be positive`);
  if (!['transverse', 'longitudinal'].includes(P.view)) out.push('wv-chain: view must be transverse or longitudinal');
  for (const c of P.controls || []) if (!CONTROLS.includes(c)) out.push(`wv-chain: unknown control “${c}”`);
  if (!Array.isArray(P.panels) || !P.panels.length || P.panels.some((p) => !PANELS.includes(p))) out.push(`wv-chain: panels must be a list of ${PANELS.join(', ')}`);
  if (Array.isArray(P.panels) && P.panels.includes('gallery') && P.N > 8) out.push('wv-chain: the gallery shows at most 8 modes (N ≤ 8)');
  for (const r of [...(P.hide || []), ...(P.readouts || [])]) if (!ROWS.includes(r)) out.push(`wv-chain: unknown readout “${r}”`);
  if (!(P.maxN >= P.N && P.maxN <= 60)) out.push('wv-chain: maxN must be at least N and at most 60');
  if (![true, false, 'never'].includes(P.play)) out.push('wv-chain: play must be true, false or “never”');
  if (!(P.time >= 0)) out.push('wv-chain: time must be zero or positive');
  return out;
}
