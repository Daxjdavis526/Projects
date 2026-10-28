// Coupled oscillators and their normal modes. Masses in a line, joined by
// springs, move along the line; the motion is the exact sum of the normal
// modes of M x″ = −K x (no numerical drift). Two systems:
//   'pair' — two masses between two walls, with a coupling spring between
//            them: the in-phase and out-of-phase modes, and beats (energy
//            sloshing from one mass to the other) when one mass starts alone;
//   'co2'  — a linear molecule O–C–O as three balls and two springs with free
//            ends: the symmetric and antisymmetric stretches, and the zero
//            mode (sliding as a whole) that a free molecule also has.
// Top: the masses (displacements exaggerated) with ghosts at rest. Below:
// each displacement against time, and (pair) the share of the energy each
// oscillator holds. Model: model/de-modes.js (test/de-plane.test.mjs).
//
//   { type: 'de-modes', params: {
//       system: 'pair',                 // or 'co2'
//       m: 1, m2: 1, k: 10, kc: 1,      // pair: masses (kg), wall springs and coupling spring (N/m)
//       ratio: 0.75,                    // co2: carbon mass over oxygen mass (12/16)
//       controls: ['kc'],               // sliders to offer: any of 'k', 'kc', 'm2' (pair), 'ratio' (co2)
//       start: 'one',                   // 'one' (the first mass pulled aside alone), 'mode1', 'mode2' (co2: also 'mode0')
//       starts: true,                   // offer the starting states as buttons
//       play: true,                     // run the animation (a Play button either way; never under reduced motion until pressed)
//       graph: true, T: null,           // x(t) panel and its time window (default: one full beat, or six periods)
//       energy: true,                   // pair: energy bars for the two oscillators
//       readout: true,                  // the mode frequencies (false hides them)
//   } }

import { Plot } from '../plot.js';
import { chainK, modes, motion } from '../model/de-modes.js';

export const defaults = { system: 'pair', m: 1, m2: 1, k: 10, kc: 1, ratio: 0.75, controls: ['kc'], start: 'one', starts: true, play: true, graph: true, T: null, energy: true, readout: true };

const tx = (v, d = 4) => String(+(+v).toPrecision(d));

export async function mount(F, P0) {
  const P = { ...defaults, ...P0 };
  const co2 = P.system === 'co2';
  let reduced = false;
  try { reduced = (await import('../../ui/state.js')).reducedMotion(); } catch { reduced = true; }
  const pic = F.canvas({ height: F.compact ? '120px' : '150px', label: co2 ? 'A carbon dioxide molecule as three balls on two springs' : 'Two masses between two walls, joined by springs' });
  const gr = P.graph ? F.canvas({ aspect: 'wide', label: 'The displacements against time' }) : null;
  const C = new Set(P.controls || []);
  if (!co2) {
    if (C.has('k')) F.slider({ key: 'k', label: 'Wall springs $k$', min: 1, max: 40, step: 0.5, value: P.k, unit: '\\mathrm{N/m}', explain: 'The two outer springs, each tying a mass to a wall.' });
    if (C.has('kc')) F.slider({ key: 'kc', label: 'Coupling spring $k_c$', min: 0, max: 20, step: 0.1, value: P.kc, unit: '\\mathrm{N/m}', explain: 'The spring between the masses. Weak coupling: two nearly equal frequencies and slow beats.' });
    if (C.has('m2')) F.slider({ key: 'm2', label: 'Second mass $m_2$', min: 0.25, max: 4, step: 0.05, value: P.m2, unit: '\\mathrm{kg}', explain: 'Unequal masses tilt the mode shapes: the modes are no longer (1, 1) and (1, −1).' });
  } else if (C.has('ratio')) F.slider({ key: 'ratio', label: 'Centre mass / end mass', min: 0.2, max: 3, step: 0.01, value: P.ratio, explain: 'For CO₂ it is 12/16 = 0.75. A heavier centre makes the antisymmetric stretch slower.' });
  const starts = co2 ? [['mode1', 'Symmetric stretch'], ['mode2', 'Antisymmetric stretch'], ['one', 'Push one O atom'], ['mode0', 'Slide as a whole']] : [['one', 'Pull mass 1 alone'], ['mode1', 'Mode 1 (in phase)'], ['mode2', 'Mode 2 (out of phase)']];
  if (P.starts) F.choice({ key: 'start', label: 'Starting state', options: starts, value: P.start });
  else F.params.start = P.start;

  const get = (k) => +(F.params[k] ?? P[k]);
  function system() {
    if (co2) { const r = get('ratio'); return { masses: [1, r, 1], springs: [0, 1, 1, 0], names: ['O', 'C', 'O'] }; }
    return { masses: [get('m'), get('m2')], springs: [get('k'), get('kc'), get('k')], names: ['1', '2'] };
  }
  function build() {
    const sys = system(), K = chainK(sys.springs), ms = modes(sys.masses, K);
    const n = sys.masses.length, st = F.params.start;
    let x0 = Array(n).fill(0), v0 = Array(n).fill(0);
    const live = ms.filter((m) => m.omega > 0);
    if (st === 'one') { if (co2) v0 = [1, 0, 0]; else x0 = [1, 0]; }
    else if (st === 'mode0' && co2) v0 = ms[0].shape.map((s) => 0.25 * s);
    else {
      const m = live[st === 'mode2' ? 1 : 0];
      if (co2) v0 = m.shape.map((s) => s * m.omega); else x0 = m.shape.slice();
    }
    const wmax = Math.max(...live.map((m) => m.omega)), wmin = Math.min(...live.map((m) => m.omega));
    const beat = !co2 && live.length === 2 && live[1].omega - live[0].omega > 1e-9 ? (2 * Math.PI) / (live[1].omega - live[0].omega) : null;
    const T = P.T ?? (beat && beat < 30 * (2 * Math.PI) / wmin ? beat : 6 * (2 * Math.PI) / wmin);
    return { sys, ms, live, x: motion(sys.masses, K, x0, v0), wmax, beat, T };
  }

  const S = { t: 0, running: !!P.play && !reduced && !F.compact, B: build() };
  let playBtn = null;
  const anim = F.animate((dt) => {
    if (!S.running) return;
    // the fastest mode takes about 1.3 s of real time per cycle
    S.t += dt * ((2 * Math.PI) / S.B.wmax) / 1.3;
    if (S.t > S.B.T) S.t = 0;
    draw();
  }, { force: true });
  playBtn = F.button({ label: S.running ? 'Pause' : 'Play', primary: true, onClick: () => {
    S.running = !S.running; playBtn.textContent = S.running ? 'Pause' : 'Play';
    if (S.running) anim.start();
  } });
  F.onChange(() => { S.B = build(); S.t = 0; draw(); });

  const pp = new Plot(pic.canvas, { x: [0, 1], y: [0, 1], grid: false, axes: false, pad: { l: 10, r: 10, t: 6, b: 6 } });
  const pg = gr && new Plot(gr.canvas, { x: [0, 1], y: [-1.2, 1.2], xlabel: 't (s)', ylabel: co2 ? 'velocity-scaled x' : 'x', pad: { l: 46, r: 16, t: 14, b: 34 } });

  function zigzag(g, x0, x1, y, h, turns = 7) {
    const L = x1 - x0;
    g.beginPath(); g.moveTo(x0, y);
    const a = x0 + 0.12 * L, b = x1 - 0.12 * L;
    g.lineTo(a, y);
    for (let i = 0; i < turns; i++) g.lineTo(a + ((b - a) * (i + 0.5)) / turns, y + (i % 2 ? -h : h));
    g.lineTo(b, y); g.lineTo(x1, y); g.stroke();
  }

  function draw() {
    const B = S.B, { sys } = B, n = sys.masses.length;
    const st = B.x(S.t);
    // the picture, in pixels
    pp.clear();
    const g = pp.ctx, W = pp.w, H = pp.h, y = H * 0.52, col = pp.col;
    const wallW = co2 ? 0 : 14, left = 12 + wallW, right = W - 12 - wallW - (P.energy && !co2 ? 70 : 0);
    const gap = (right - left) / (n + 1), amp = gap * 0.32;
    const scale = Math.max(...[0, 0.25, 0.5, 0.75].map((f) => Math.max(...B.x(f * B.T).x.map(Math.abs))), 1e-9);
    const pos = (i, xi) => left + gap * (i + 1) + (amp * xi) / scale;
    g.save();
    if (!co2) {
      g.fillStyle = col.ink4; g.fillRect(12, y - 34, wallW, 68); g.fillRect(right, y - 34, wallW, 68);
    }
    const r = co2 ? [16, 13, 16] : sys.masses.map((m) => 12 + 6 * Math.sqrt(m / Math.max(...sys.masses)));
    // ghosts at rest
    g.strokeStyle = col.line3; g.setLineDash([3, 4]); g.lineWidth = 1;
    for (let i = 0; i < n; i++) { g.beginPath(); g.moveTo(pos(i, 0), y - 30); g.lineTo(pos(i, 0), y + 30); g.stroke(); }
    g.setLineDash([]);
    // springs
    g.strokeStyle = col.ink2; g.lineWidth = 1.6;
    const ends = [left, ...st.x.map((xi, i) => pos(i, xi)), right];
    for (let j = 0; j <= n; j++) {
      if (!sys.springs[j]) continue;
      const a = ends[j] + (j ? r[j - 1] : 0), b = ends[j + 1] - (j < n ? r[j] : 0);
      g.strokeStyle = !co2 && j === 1 ? col.gold : col.ink2;
      zigzag(g, a, b, y, 7, 7);
    }
    // masses
    for (let i = 0; i < n; i++) {
      const cx = pos(i, st.x[i]);
      g.fillStyle = co2 ? (i === 1 ? col.ink3 : col.bad) : i ? col.violet : col.accent;
      if (co2) { g.beginPath(); g.arc(cx, y, r[i], 0, Math.PI * 2); g.fill(); }
      else { const s = r[i]; g.beginPath(); g.roundRect?.(cx - s, y - s, 2 * s, 2 * s, 4); if (!g.roundRect) g.rect(cx - s, y - s, 2 * s, 2 * s); g.fill(); }
      pp.text(sys.names[i], cx, y, { screen: true, align: 'center', color: co2 && i === 1 ? 'ink' : 'void', weight: 700, size: 12, halo: false });
    }
    // energy bars: ½mv² + ½kx² of each oscillator (the coupling spring's share not counted)
    if (P.energy && !co2) {
      const k = sys.springs[0], E = sys.masses.map((m, i) => 0.5 * m * st.v[i] ** 2 + 0.5 * k * st.x[i] ** 2);
      const E0 = sys.masses.map((m, i) => { const s0 = B.x(0); return 0.5 * m * s0.v[i] ** 2 + 0.5 * k * s0.x[i] ** 2; });
      const tot = Math.max(1e-12, E0[0] + E0[1] + 0.5 * sys.springs[1] * (B.x(0).x[1] - B.x(0).x[0]) ** 2);
      const bx = W - 66, top = y - 40, h = 80;
      for (let i = 0; i < 2; i++) {
        const xb = bx + i * 30;
        g.strokeStyle = col.line3; g.strokeRect(xb, top, 18, h);
        g.fillStyle = i ? col.violet : col.accent;
        const f = Math.min(1, E[i] / tot);
        g.fillRect(xb + 1, top + h * (1 - f), 16, h * f);
        pp.text(i ? 'E₂' : 'E₁', xb + 9, top + h + 12, { screen: true, align: 'center', color: 'ink2', size: 11 });
      }
    }
    g.restore();

    // the graph of the displacements
    if (pg) {
      pg.setView([0, B.T], [-1.15 * scale, 1.15 * scale]);
      pg.clear();
      const colors = co2 ? ['bad', 'ink2', 'warn'] : ['accent', 'violet'];
      for (let i = 0; i < n; i++) {
        const pts = [];
        for (let k = 0; k <= 600; k++) { const t = (B.T * k) / 600; pts.push([t, B.x(t).x[i]]); }
        pg.path(pts, { color: colors[i], width: co2 && i === 1 ? 2.6 : 2 });
      }
      pg.line(S.t, pg.vy0, S.t, pg.vy1, { color: 'gold', width: 1.4, dash: [4, 4] });
      const labels = co2 ? ['left O', 'C', 'right O'] : ['x₁', 'x₂'];
      labels.forEach((L, i) => pg.text(L, pg.vx1, pg.vy1, { dx: -8 - 64 * (labels.length - 1 - i), dy: 10, align: 'right', color: colors[i], weight: 650 }));
    }
    if (P.readout !== false) {
      const rows = B.live.map((m, j) => [co2 ? (j ? 'antisymmetric $\\omega$' : 'symmetric $\\omega$') : `$\\omega_${j + 1}$`, co2 ? `${tx(m.omega)}\\,\\sqrt{k/m_{\\mathrm O}}` : `${tx(m.omega)}\\ \\mathrm{rad/s}`]);
      if (co2) rows.push(['ratio', tx(B.live[1].omega / B.live[0].omega)]);
      rows.push(...B.live.map((m, j) => [`mode ${j + 1}`, `(${m.shape.map((v) => tx(v, 3)).join(',\\ ')})`]));
      if (B.beat) rows.push(['beat period $2\\pi/(\\omega_2 - \\omega_1)$', `${tx(B.beat, 3)}\\ \\mathrm{s}`]);
      F.readout(rows);
    }
  }

  F.draw(draw);
  F.caption(P.caption || (co2
    ? 'A one-dimensional ball-and-spring model of CO₂: one spring constant per bond, motion along the axis only (the bending mode is left out). Displacements are exaggerated; the graph shows the atoms’ displacements in arbitrary units.'
    : 'Frictionless masses on springs that obey Hooke’s law. Displacements are exaggerated and drawn to a common scale. Energy bars: ½mv² + ½kx² for each mass with its wall spring; the small share stored in the coupling spring is not shown.'));
}

export function validate(P) {
  const out = [];
  if (!['pair', 'co2'].includes(P.system)) out.push('de-modes: system must be pair or co2');
  for (const k of ['m', 'm2', 'k', 'ratio']) if (!(P[k] > 0)) out.push(`de-modes: ${k} must be positive`);
  if (!(P.kc >= 0)) out.push('de-modes: kc must be zero or positive');
  const ok = P.system === 'co2' ? ['one', 'mode0', 'mode1', 'mode2'] : ['one', 'mode1', 'mode2'];
  if (!ok.includes(P.start)) out.push(`de-modes: start must be one of ${ok.join(', ')}`);
  for (const c of P.controls || []) if (!['k', 'kc', 'm2', 'ratio'].includes(c)) out.push(`de-modes: unknown control “${c}”`);
  if (P.T !== null && !(P.T > 0)) out.push('de-modes: T must be a positive time');
  return out;
}
