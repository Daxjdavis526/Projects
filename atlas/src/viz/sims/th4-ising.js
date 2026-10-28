// The two-dimensional Ising model, run live by Metropolis Monte Carlo. Above:
// the L × L lattice of spins (up and down in two colours) with its
// temperature and magnetization. Below, either the magnetization against
// temperature — Onsager and Yang's exact curve for the infinite lattice, the
// mean-field curve, and a dot for each temperature you have measured at — or
// a trace of the magnetization sweep by sweep. Temperatures are kT/J, fields
// h/J. Seeded: a static picture (pre-run for `sweeps` sweeps) is the same
// every time. Physics in model/th4-ising.js (tested in test/th4-ising.test.mjs).
//
//   { type: 'th4-ising', params: {
//       T: 2.0,                // kT/J (0.5–5)
//       h: 0,                  // external field h/J (−1–1)
//       L: 48,                 // lattice side: 16, 32, 48 or 64
//       start: 'cold',         // 'cold' (all up), 'hot' (random), 'half' (two domains)
//       sweeps: 0,             // Metropolis sweeps run before the picture is drawn (0–3000)
//       panels: ['lattice', 'curve'],   // any of: lattice curve trace (drawn in that order)
//       onsager: true,         // the exact infinite-lattice curve on the curve panel
//       mf: false,             // the mean-field curve on the curve panel
//       tc: true,              // the line at Onsager's T_c (and its label)
//       rate: 20,              // sweeps per second while playing
//       controls: null,        // true, false, or a list of: T h L start play
//       play: null,            // start running (default: in an Explore step, not in a small picture)
//       readout: true,
//       hide: [],              // readouts shown as “?”: T m avg E acc
//       seed: 1, alt: null,
//   } }

import { Plot } from '../plot.js';
import * as M from '../model/th4-ising.js';

export const defaults = { T: 2.0, h: 0, L: 48, start: 'cold', sweeps: 0, panels: ['lattice', 'curve'], onsager: true, mf: false, tc: true, rate: 20, controls: null, play: null, readout: true, hide: [], seed: 1, alt: null };
const CONTROLS = ['T', 'h', 'L', 'start', 'play'];
const PANELS = ['lattice', 'curve', 'trace'];
const HIDE = ['T', 'm', 'avg', 'E', 'acc'];
const SIZES = [16, 32, 48, 64];
const STARTS = ['cold', 'hot', 'half'];
const f3 = (x) => String(+(+x).toFixed(3)).replace('-', '−');
const BURN = 40;        // sweeps discarded after a change before averaging
const TRACE = 200;      // sweeps shown on the trace panel

export function mount(F, P0) {
  const P = { ...defaults, ...P0 };
  const hide = new Set(P.hide || []);
  const panels = (P.panels || []).filter((p) => PANELS.includes(p));
  const all = P.controls === true || (P.controls === null && !F.compact);
  const wanted = all ? ['T', 'L', 'start', 'play'] : Array.isArray(P.controls) ? P.controls : [];
  const ctl = (key, make) => (wanted.includes(key) ? make() : (F.params[key] = P[key]));
  ctl('T', () => F.slider({ key: 'T', label: 'Temperature $kT/J$', min: 0.5, max: 5, step: 0.05, value: P.T, explain: 'Thermal energy in units of the bond energy $J$. Onsager’s exact critical point is $kT_c/J = 2.269$.' }));
  ctl('h', () => F.slider({ key: 'h', label: 'Field $h/J$', min: -1, max: 1, step: 0.05, value: P.h, explain: 'An outside magnetic field, as an energy per spin in units of $J$: it favours up spins when positive.' }));
  ctl('L', () => F.choice({ key: 'L', label: 'Lattice', options: SIZES.map((n) => [n, `${n} × ${n}`]), value: P.L, explain: 'Spins per side, with periodic edges (the right neighbour of the last column is the first). Bigger lattices fluctuate less.' }));
  ctl('start', () => F.choice({ key: 'start', label: 'Start from', options: [['cold', 'all up'], ['hot', 'random'], ['half', 'two domains']], value: P.start, explain: 'The configuration the run begins from. At equilibrium it should not matter — but below $T_c$ getting there can take a very long time.' }));

  const lat = panels.includes('lattice') ? F.canvas({ aspect: 'wide', label: P.alt || 'A square lattice of up and down spins' }) : null;
  const cur = panels.includes('curve') ? F.canvas({ aspect: 'wide', label: 'Magnetization per spin against temperature' }) : null;
  const tra = panels.includes('trace') ? F.canvas({ aspect: 'wide', label: 'Magnetization per spin, sweep by sweep' }) : null;
  const pLat = lat && new Plot(lat.canvas, { x: [0, 1], y: [0, 1], grid: false, axes: false });
  const pc = cur && new Plot(cur.canvas, { x: [0, 5], y: [0, 1.08], xlabel: 'kT / J', ylabel: '|m|', axesAt: 'edge', yticks: 5 });
  const pt = tra && new Plot(tra.canvas, { x: [0, TRACE], y: [-1.1, 1.1], xlabel: 'sweeps', ylabel: 'm', axesAt: 'edge', yticks: 4 });

  let S, hist, sum, n, measured = new Map();
  const restart = () => {
    S = M.lattice(F.params.L, F.params.start, P.seed);
    hist = []; sum = 0; n = 0;
  };
  const record = () => {
    const m = M.magnetization(S);
    hist.push(m); if (hist.length > TRACE) hist.shift();
    if (S.sweeps > BURN) { sum += Math.abs(m); n++; }
  };
  restart();
  for (let k = 0; k < Math.min(3000, P.sweeps | 0); k++) { M.sweep(S, F.params.T, F.params.h); record(); }
  if (n) measured.set(F.params.T.toFixed(2), sum / n);
  let sinceChange = S.sweeps;

  function drawLattice() {
    const pl = pLat, g = pl.ctx;
    pl.resize(); pl.refreshTheme();
    const w = pl.w, hgt = pl.h;
    g.clearRect(0, 0, w, hgt);
    const up = pl.color('accent'), dn = pl.color('warn');
    const L = S.L, side = Math.min(hgt - 12, w * 0.55), cell = side / L, x0 = 6, y0 = (hgt - side) / 2;
    for (let i = 0; i < L * L; i++) {
      const x = i % L, y = (i - x) / L;
      g.fillStyle = S.s[i] > 0 ? up : dn;
      const ax = Math.round(x0 + x * cell), ay = Math.round(y0 + y * cell);
      g.fillRect(ax, ay, Math.round(x0 + (x + 1) * cell) - ax, Math.round(y0 + (y + 1) * cell) - ay);
    }
    g.strokeStyle = pl.color('ink3'); g.lineWidth = 1; g.strokeRect(x0 + 0.5, y0 + 0.5, side - 1, side - 1);
    const narrow = w < 520, fs = narrow ? 11 : 13, tx = x0 + side + (narrow ? 10 : 18);
    const lines = [];
    lines.push([hide.has('T') ? 'kT/J = ?' : `kT/J = ${f3(F.params.T)}`, 'ink']);
    if (!hide.has('T')) lines.push([`T/Tc = ${f3(F.params.T / M.TC)}`, 'ink2']);
    if (F.params.h) lines.push([`h/J = ${f3(F.params.h)}`, 'ink2']);
    lines.push([hide.has('m') ? 'm = ?' : `m = ${f3(M.magnetization(S))}`, 'ink']);
    lines.push([`${S.sweeps} sweeps`, 'ink3']);
    lines.forEach(([s, col], k) => pl.text(s, tx, y0 + 10 + k * (fs + 7), { screen: true, color: col, size: fs, halo: false }));
    const ly = y0 + side - 10;
    g.fillStyle = up; g.fillRect(tx, ly - fs + 2, fs - 2, fs - 2);
    pl.text('up', tx + fs + 2, ly - fs / 2 + 1, { screen: true, color: 'ink2', size: fs - 1, halo: false });
    g.fillStyle = dn; g.fillRect(tx + fs + 32, ly - fs + 2, fs - 2, fs - 2);
    pl.text('down', tx + 2 * fs + 34, ly - fs / 2 + 1, { screen: true, color: 'ink2', size: fs - 1, halo: false });
  }

  function drawCurve() {
    pc.clear();
    const narrow = (cur.canvas.clientWidth || 600) < 520, fs = narrow ? 10.5 : 12;
    if (P.mf) {
      pc.fn((T) => M.meanFieldM(T), { domain: [0.3, 3.999], color: 'ink3', width: 1.8, dash: [6, 4], samples: 300 });
      pc.text('mean field', 3.55, 0.42, { color: 'ink3', size: fs });
    }
    if (P.onsager) {
      pc.fn((T) => M.onsagerM(T), { domain: [0.3, M.TC], color: 'gold', width: 2.4, samples: 400 });
      pc.line(M.TC, 0, 5, 0, { color: 'gold', width: 2.4 });
      pc.text('exact (infinite lattice)', 0.35, 1.03, { color: 'gold', size: fs, dy: 2 });
    }
    if (P.tc) {
      pc.line(M.TC, 0, M.TC, 1.08, { color: 'ink3', width: 1, dash: [3, 4] });
      pc.text('Tc', M.TC, 0.62, { color: 'ink2', size: fs, dx: 5 });
    }
    if (!hide.has('T')) pc.line(F.params.T, 0, F.params.T, 1.08, { color: 'accent', width: 2, alpha: 0.75 });
    if (!hide.has('avg')) for (const [k, v] of measured) pc.point(+k, v, { color: 'accent', r: 3.5 });
    if (!hide.has('avg') && n) pc.point(F.params.T, sum / n, { color: 'accent', r: 5.5, ring: 'ink' });
  }

  function drawTrace() {
    pt.clear();
    const off = Math.max(0, S.sweeps - hist.length);
    pt.setView([off, off + TRACE], [-1.1, 1.1]);
    pt.clear();
    const ms = M.onsagerM(F.params.T);
    if (P.onsager && F.params.h === 0 && !hide.has('T')) {
      pt.line(off, ms, off + TRACE, ms, { color: 'gold', width: 1.5, dash: [5, 4] });
      pt.line(off, -ms, off + TRACE, -ms, { color: 'gold', width: 1.5, dash: [5, 4] });
    }
    pt.line(off, 0, off + TRACE, 0, { color: 'ink4', width: 1 });
    if (!hide.has('m')) pt.path(hist.map((m, i) => [off + i + 1, m]), { color: 'accent', width: 1.8 });
  }

  function draw() {
    if (lat) drawLattice();
    if (pc) drawCurve();
    if (pt) drawTrace();
    if (P.readout !== false) {
      const q = (k, v) => (hide.has(k) ? '?' : v);
      F.readout([
        ['$kT/J$', q('T', f3(F.params.T))],
        ['$m$ now', q('m', f3(M.magnetization(S)))],
        ['$\\langle|m|\\rangle$', q('avg', n ? `${f3(sum / n)}\\ (${n}\\ \\text{sweeps})` : '\\text{settling}')],
        ['exact $|m|$, infinite lattice', q('T', f3(M.onsagerM(F.params.T)))],
        ['$E/NJ$', q('E', f3(M.energy(S, F.params.h)))],
        ['flips accepted', q('acc', S.tried ? `${Math.round((100 * S.accepted) / S.tried)}\\%` : '–')],
      ]);
    }
  }

  const reduced = () => document.documentElement.getAttribute('data-motion') === 'reduce' || !!globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  let running = (P.play ?? !F.compact) && !reduced();
  let acc = 0;
  const step = (dt) => {
    acc += dt * P.rate;
    let k = Math.floor(acc);
    if (!k) return;
    acc -= k;
    for (let i = 0; i < Math.min(k, 5); i++) {
      M.sweep(S, F.params.T, F.params.h);
      const m = M.magnetization(S);
      hist.push(m); if (hist.length > TRACE) hist.shift();
      if (S.sweeps - sinceChange > BURN) { sum += Math.abs(m); n++; }
    }
    if (n && F.params.h === 0) measured.set(F.params.T.toFixed(2), sum / n);
    draw();
  };
  let loop = F.animate((dt) => { if (running) step(dt); });
  const showPlay = !F.compact ? P.play !== false : wanted.includes('play');
  if (showPlay) {
    const btn = F.button({ label: running ? 'Pause' : 'Play', onClick: () => {
      running = !running; btn.textContent = running ? 'Pause' : 'Play';
      loop.stop(); loop = F.animate((dt) => { if (running) step(dt); }, { force: running });
    } });
    F.button({ label: '+50 sweeps', onClick: () => { for (let i = 0; i < 50; i++) { M.sweep(S, F.params.T, F.params.h); record(); } draw(); } });
    F.button({ label: 'Restart', onClick: () => { restart(); sinceChange = 0; draw(); } });
  }
  F.onChange((k) => {
    if (k === 'L' || k === 'start') { restart(); sinceChange = 0; }
    if (k === 'T' || k === 'h') { sum = 0; n = 0; sinceChange = S.sweeps; }
    draw();
  });
  F.draw(draw);
  F.caption('Nearest-neighbour Ising model on a square lattice with periodic edges, updated by Metropolis Monte Carlo. A finite lattice has no sharp transition: near Tc its magnetization fluctuates and wanders, and above Tc it never quite reaches zero. The gold curve is the exact result for an infinite lattice (Onsager 1944, Yang 1952).');
  return { get: (k) => (k === 'm' ? M.magnetization(S) : k === 'avg' ? (n ? sum / n : 0) : F.params[k]) };
}

export function validate(P) {
  const p = [];
  if (!(P.T >= 0.5 && P.T <= 5)) p.push('th4-ising: T (kT/J) lies in 0.5–5');
  if (!(P.h >= -1 && P.h <= 1)) p.push('th4-ising: h lies in −1 to 1');
  if (!SIZES.includes(P.L)) p.push('th4-ising: L is 16, 32, 48 or 64');
  if (!STARTS.includes(P.start)) p.push('th4-ising: start is cold, hot or half');
  if (!(Number.isInteger(P.sweeps) && P.sweeps >= 0 && P.sweeps <= 3000)) p.push('th4-ising: sweeps is a whole number, 0–3000');
  if (!Array.isArray(P.panels) || !P.panels.length) p.push('th4-ising: panels is a non-empty list');
  else for (const q of P.panels) if (!PANELS.includes(q)) p.push(`th4-ising: unknown panel “${q}”`);
  if (!(P.rate > 0 && P.rate <= 60)) p.push('th4-ising: rate lies in 0–60 sweeps per second');
  if (Array.isArray(P.controls)) for (const c of P.controls) if (!CONTROLS.includes(c)) p.push(`th4-ising: unknown control “${c}”`);
  for (const h of P.hide || []) if (!HIDE.includes(h)) p.push(`th4-ising: unknown hide “${h}”`);
  return p;
}
