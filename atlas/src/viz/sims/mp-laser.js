// A laser, atom by atom. Above: the energy levels of the gain medium, drawn
// to scale for a real laser (ruby for the three-level scheme, Nd:YAG for the
// four-level one), with its atoms as dots on the levels — pumped up, decaying
// fast to the upper laser level, and leaving it by spontaneous or stimulated
// emission. Below: the cavity — a rod between a full mirror and a partly
// transmitting one — with the photons of the laser mode bouncing between the
// mirrors, spontaneous photons escaping sideways, and the beam leaving
// through the output mirror. Last: the steady state against the pump rate:
// the inversion, clamped at threshold, and the output, which switches on at
// threshold. Physics in model/mp-laser.js (tested in test/mp-laser.test.mjs).
//
//   { type: 'mp-laser', params: {
//       scheme: 'four',       // 'two', 'three' (ruby-like) or 'four' (Nd:YAG-like)
//       W: 0.5,               // pump rate per atom, in units of 1/τ₂₁ (0.01–3)
//       R: 0.95,              // the output mirror’s reflectivity (0.80–0.995)
//       panels: null,         // any of 'levels', 'cavity', 'curve' (default: all three; compact: levels and cavity)
//       compare: true,        // the curve panel also shows the other schemes’ output, faintly
//       play: null,           // animate (default: yes in the Explore step, no in a question)
//       controls: null,       // true, false, or a list of: scheme W R
//       readout: true,
//       hide: [],             // any of: threshold (the threshold pump and its line), output (the output readout and curve)
//   } }

import { Plot } from '../plot.js';
import * as L from '../model/mp-laser.js';
import { makeRng } from '../../core/rng.js';

export const defaults = { scheme: 'four', W: 0.5, R: 0.95, panels: null, compare: true, play: null, controls: null, readout: true, hide: [] };
const CONTROLS = ['scheme', 'W', 'R'];
const PANELS = ['levels', 'cavity', 'curve'];
const HIDE = ['threshold', 'output'];
const WMIN = 0.01, WMAX = 3;
const NAMES = { g: 'ground state', p: 'pump band', u: 'upper laser level', l: 'lower laser level' };
const SHORT = { g: 'ground', p: 'pump', u: 'upper', l: 'lower' };
const SPEED = 0.6;                    // units of τ₂₁ per second of animation
const DT = 0.004;

export function mount(F, P0) {
  const P = { ...defaults, ...P0 };
  const hide = new Set(P.hide || []);
  const wanted = P.controls === true || (P.controls === null && !F.compact) ? CONTROLS : Array.isArray(P.controls) ? P.controls : [];
  const panels = Array.isArray(P.panels) ? P.panels : F.compact ? ['levels', 'cavity'] : PANELS;

  if (wanted.includes('scheme')) F.choice({ key: 'scheme', label: 'Level scheme', options: [['two', 'two-level'], ['three', 'three-level (ruby)'], ['four', 'four-level (Nd:YAG)']], value: P.scheme, explain: 'Which levels the pump fills and which ones the laser light joins.' });
  else F.params.scheme = P.scheme;
  if (wanted.includes('W')) F.slider({ key: 'W', label: 'Pump rate $W$', min: WMIN, max: WMAX, value: P.W, logScale: true, unit: '/\\tau_{21}', fmt: (v) => (v < 0.1 ? v.toFixed(3) : v.toFixed(2)), explain: 'How often each ground-state atom is lifted by the pump, in units of the upper level’s spontaneous decay rate. Logarithmic.' });
  else F.params.W = P.W;
  if (wanted.includes('R')) F.slider({ key: 'R', label: 'Output mirror reflectivity $R$', min: 0.8, max: 0.995, step: 0.005, value: P.R, unit: '', fmt: (v) => `${(100 * v).toFixed(1)}\\%`, explain: 'The rest of the light that reaches it leaves as the beam. A better mirror keeps photons longer, lowering the threshold — but lets less out.' });
  else F.params.R = P.R;

  const top = panels.includes('levels') || panels.includes('cavity') ? F.canvas({ aspect: panels.includes('levels') && panels.includes('cavity') ? '' : 'wide', label: P.alt || 'The energy levels of a laser medium with its atoms, and the laser cavity with its photons' }) : null;
  const plot = top ? new Plot(top.canvas, { x: [0, 100], y: [0, 62.5], grid: false, axes: false, pad: { l: 0, r: 0, t: 0, b: 0 } }) : null;
  const cur = panels.includes('curve') ? F.canvas({ aspect: 'wide', label: 'Steady-state inversion and output against pump rate' }) : null;
  const cplot = cur ? new Plot(cur.canvas, { x: [Math.log10(WMIN), Math.log10(WMAX)], y: [-1.3, 1.45], xlabel: 'pump rate W (units of 1/τ₂₁)', ylabel: '', yticks: 6, axesAt: 'edge', xfmt: (v) => `${+(10 ** v).toPrecision(2)}` }) : null;

  const now = () => ({ scheme: L.SCHEMES[F.params.scheme] ? F.params.scheme : 'four', W: Math.min(WMAX, Math.max(WMIN, F.params.W)), R: Math.min(0.995, Math.max(0.8, F.params.R)) });

  // ---- the stochastic atoms and the light they make
  let rng = makeRng(5).next, atoms = new L.Atoms(now().scheme), photons = [], sparks = [], pulses = [], flashes = [], outGlow = 0;
  function syncPhotons() {
    const want = Math.min(80, atoms.q);
    while (photons.length < want) photons.push({ x: rng(), y: 0.25 + 0.5 * rng(), dir: rng() < 0.5 ? -1 : 1 });
    while (photons.length > want) photons.pop();
  }
  function advance(simTime, S, visual = true) {
    const n = Math.max(1, Math.round(simTime / DT));
    for (let i = 0; i < n; i++) {
      const ev = atoms.step(DT, S.W, S.R, rng);
      if (!visual) continue;
      for (const e of ev) {
        if (e.kind === 'spont' && !e.axial && sparks.length < 60) { const a = 2 * Math.PI * rng(); sparks.push({ x: 0.1 + 0.8 * rng(), y: 0.5, vx: Math.cos(a), vy: Math.sin(a), t: 0.6 }); }
        if (e.kind === 'out') { pulses.push({ x: 0 }); outGlow = Math.min(1, outGlow + 0.08); }
        if ((e.kind === 'pump' || e.kind === 'stim') && flashes.length < 40) flashes.push({ atom: e.atom, kind: e.kind, t: 0.35 });
      }
    }
    syncPhotons();
  }
  function moveLight(dt) {
    for (const p of photons) { p.x += p.dir * dt * 1.6; if (p.x > 1) { p.x = 2 - p.x; p.dir = -1; } if (p.x < 0) { p.x = -p.x; p.dir = 1; } }
    for (const s of sparks) { s.x += s.vx * dt * 0.25; s.y += s.vy * dt * 1.2; s.t -= dt; }
    sparks = sparks.filter((s) => s.t > 0);
    for (const p of pulses) p.x += dt * 1.6;
    pulses = pulses.filter((p) => p.x < 1);
    for (const f of flashes) f.t -= dt;
    flashes = flashes.filter((f) => f.t > 0);
    outGlow *= Math.exp(-dt * 1.5);
  }
  /** a representative still: run from the ground state long enough to settle, with a fixed seed */
  function warm() {
    const S = now();
    rng = makeRng(5).next; atoms = new L.Atoms(S.scheme); photons = []; sparks = []; pulses = []; flashes = []; outGlow = 0;
    advance(30, S, false);
    const ss = L.steady(S.scheme, S.W, S.R);
    outGlow = Math.min(1, ss.output / 30);
  }

  // ---- drawing
  function drawTop() {
    if (!plot) return;
    const S = now(), real = L.REAL[S.scheme], sch = L.SCHEMES[S.scheme];
    const w = top.canvas.clientWidth || 600, h = top.canvas.clientHeight || 375, H = (100 * h) / w;
    plot.setView([0, 100], [0, H]);
    plot.clear();
    const fs = w < 520 ? 9 : 11;
    const both = panels.includes('levels') && panels.includes('cavity');
    const levY0 = both ? 0.36 * H : 4, levY1 = H - 3;
    if (panels.includes('levels')) {
      const Emax = Math.max(...Object.values(real.levels));
      const yOf = (lv) => levY0 + 3 + (levY1 - levY0 - 9) * (real.levels[lv] / Emax);
      const x0 = 24, x1 = 54;
      const counts = atoms.counts();
      const placed = Object.fromEntries(sch.levels.map((lv) => [lv, 0]));
      const posOf = {};
      atoms.state.forEach((lv, i) => { posOf[i] = [x0 + 0.5 + (placed[lv]++ + 0.5) * ((x1 - x0 - 1) / L.NA), yOf(lv)]; });
      // labels left of the lines; two levels closer than a label’s height are nudged apart
      const ys = sch.levels.map(yOf);
      sch.levels.forEach((lv, k) => {
        const y = ys[k], laserLv = lv === sch.upper || lv === sch.lower;
        const near = ys.find((o, j) => j !== k && Math.abs(o - y) < 2.6);
        const dy = near === undefined ? 0 : near > y ? 6 : -6;
        plot.line(x0, y, x1, y, { color: laserLv ? 'ink' : 'ink3', width: laserLv ? 2.2 : 1.6 });
        plot.text(w < 520 ? SHORT[lv] : `${NAMES[lv]}${S.scheme === 'two' ? '' : `, ${real.levels[lv].toFixed(2)} eV`}`, x0 - 1, y, { color: laserLv ? 'ink2' : 'ink3', align: 'right', dy, size: fs - 1 });
        plot.text(String(counts[lv]), x1 + 0.8, y, { color: laserLv ? 'ink' : 'ink3', size: fs - 1, dy });
      });
      for (const [i, [x, y]] of Object.entries(posOf)) plot.point(x, y + 0.9, { color: 'accent', r: 2.6 });
      for (const f of flashes) { const p = posOf[f.atom]; if (p) plot.circle(p[0], p[1] + 0.9, 1.6 * (1 - f.t / 0.35) + 0.4, { fill: f.kind === 'stim' ? 'bad' : 'violet', alpha: f.t / 0.35, stroke: false }); }
      // the processes, as arrows
      const ax = (k) => x1 + 6 + 3.2 * k;
      const arrow = (k, a, b, color, dash) => plot.arrow(ax(k), yOf(a) + (yOf(b) > yOf(a) ? 0.6 : -0.6), ax(k), yOf(b), { color, width: 2.2, head: 7, dash: dash ? [4, 3] : [] });
      const items = [];
      const pumpW = 1.2 + 2.6 * Math.log10(S.W / WMIN) / Math.log10(WMAX / WMIN);
      plot.arrow(ax(0), yOf(sch.pump[0]) + 0.6, ax(0), yOf(sch.pump[1]), { color: 'violet', width: pumpW, head: 7 });
      const nar = w < 520;
      items.push(['violet', `pump${real.pump && !nar ? ` (${real.pump} nm)` : ''}`]);
      if (S.scheme !== 'two') { arrow(1, 'p', 'u', 'ink3', true); items.push(['ink3', nar ? 'fast decay' : 'fast decay (heat)']); }
      arrow(2, sch.upper, sch.lower, 'bad'); items.push(['bad', nar ? `laser${real.laser ? ` ${real.laser} nm` : ''}` : `laser transition${real.laser ? ` (${real.laser} nm)` : ''}`]);
      if (S.scheme === 'four') { arrow(3, 'l', 'g', 'ink3', true); }
      items.forEach(([c, txt], k) => { const y = levY1 - 2 - 3.6 * k; plot.line(ax(4) + 2, y, ax(4) + 4.5, y, { color: c, width: 2.4 }); plot.text(txt, ax(4) + 5.2, y, { color: c, size: fs - 1 }); });
      const inv = counts[sch.upper] - counts[sch.lower];
      plot.text(nar ? (inv > 0 ? `inverted: +${inv}` : `not inverted: ${inv}`) : inv > 0 ? `inverted: ${inv} more atoms up` : `not inverted: ${-inv} more atoms down`, ax(4) + 2, levY1 - 2 - 3.6 * items.length - 1, { color: inv > 0 ? 'good' : 'warn', size: fs - 1 });
      plot.text('atoms', x1 + 0.8, levY1 - 0.5, { color: 'ink3', size: fs - 2 });
      plot.text(real.name, x0, levY1 + 0.5, { color: 'ink2', size: fs, weight: 650 });
    }
    if (panels.includes('cavity')) {
      const cy0 = both ? 3 : 4, cy1 = both ? 0.36 * H - 5 : H - 6, cx0 = 8, cx1 = 76;
      const X = (u) => cx0 + 2 + u * (cx1 - cx0 - 4), Y = (v) => cy0 + v * (cy1 - cy0);
      // the gain medium and the mirrors
      plot.rect(cx0 + 2, Y(0.22), cx1 - cx0 - 4, Y(0.78) - Y(0.22), { color: 'accent', alpha: 0.08, stroke: 'ink4', width: 1 });
      plot.rect(cx0 - 0.6, Y(0.05), 1.6, Y(0.95) - Y(0.05), { color: 'ink2', alpha: 0.9, stroke: 'ink2' });
      plot.rect(cx1 - 1, Y(0.05), 1.6, Y(0.95) - Y(0.05), { color: 'ink3', alpha: 0.45, stroke: 'ink2' });
      plot.text('full mirror', cx0, Y(0.05), { color: 'ink3', size: fs - 1.5, dy: 9, align: 'center' });
      plot.text(`output mirror, R = ${(100 * S.R).toFixed(1)}%`, cx1, Y(0.05), { color: 'ink3', size: fs - 1.5, dy: 9, align: 'center' });
      for (const s of sparks) plot.line(X(s.x), Y(s.y), X(s.x) + s.vx * 1.2, Y(s.y) + s.vy * 1.2, { color: 'gold', width: 1.4, alpha: Math.min(1, s.t / 0.3) });
      for (const p of photons) plot.line(X(p.x) - p.dir * 0.9, Y(p.y), X(p.x) + p.dir * 0.9, Y(p.y), { color: 'bad', width: 2.2 });
      // the beam
      if (!hide.has('output')) {
        if (outGlow > 0.01) plot.rect(cx1 + 0.6, Y(0.42), 98 - cx1, Y(0.58) - Y(0.42), { color: 'bad', alpha: Math.min(0.55, outGlow), stroke: false });
        for (const p of pulses) plot.line(cx1 + 1 + p.x * (98 - cx1 - 2), Y(0.5), cx1 + 2.2 + p.x * (98 - cx1 - 2), Y(0.5), { color: 'bad', width: 2.6 });
      }
      plot.text(`${atoms.q} photon${atoms.q === 1 ? '' : 's'} in the laser mode${atoms.q > 80 ? ' (80 drawn)' : ''}`, (cx0 + cx1) / 2, Y(0.95), { color: 'ink2', size: fs - 1, dy: -9, align: 'center' });
    }
  }

  let curveCache = null;
  function curves(R) {
    const key = `${R}`;
    if (curveCache?.key === key) return curveCache;
    const ws = Array.from({ length: 90 }, (_, i) => 10 ** (Math.log10(WMIN) + (i / 89) * Math.log10(WMAX / WMIN)));
    const by = {};
    for (const s of ['two', 'three', 'four']) by[s] = ws.map((W) => L.steady(s, W, R));
    const top = Math.max(...by.four.map((x) => x.output), 1e-9);
    curveCache = { key, ws, by, top };
    return curveCache;
  }
  function drawCurve() {
    if (!cplot) return;
    const S = now(), C = curves(S.R);
    cplot.clear();
    const lw = (W) => Math.log10(W);
    cplot.line(cplot.vx0, 0, cplot.vx1, 0, { color: 'ink4', width: 1 });
    if (P.compare && !hide.has('output')) for (const s of ['two', 'three', 'four']) if (s !== S.scheme) cplot.path(C.ws.map((W, i) => [lw(W), C.by[s][i].output / C.top]), { color: 'ink4', width: 1.2, dash: [4, 4] });
    const dth = L.thresholdInversion(S.R);
    cplot.line(cplot.vx0, 1, cplot.vx1, 1, { color: 'gold', width: 1, dash: [3, 4], alpha: 0.6 });
    cplot.path(C.ws.map((W, i) => [lw(W), Math.max(-5, C.by[S.scheme][i].inversion / dth)]), { color: 'gold', width: 2.4 });
    if (!hide.has('output')) cplot.path(C.ws.map((W, i) => [lw(W), C.by[S.scheme][i].output / C.top]), { color: 'bad', width: 2.6 });
    const th = L.thresholdPump(S.scheme, S.R);
    if (!hide.has('threshold') && th < WMAX) { cplot.line(lw(th), cplot.vy0, lw(th), cplot.vy1, { color: 'ink3', width: 1.2, dash: [5, 5] }); cplot.text('threshold', lw(th), cplot.vy0, { color: 'ink3', dx: 4, dy: -10 }); }
    const ss = L.steady(S.scheme, S.W, S.R);
    cplot.point(lw(S.W), Math.max(cplot.vy0, ss.inversion / dth), { color: 'gold', r: 5 });
    if (!hide.has('output')) cplot.point(lw(S.W), ss.output / C.top, { color: 'bad', r: 5 });
    const narrow = (cur.canvas.clientWidth || 600) < 520;
    cplot.text(narrow ? 'inversion ÷ threshold' : 'inversion ÷ threshold inversion (clamps at 1)', lw(WMIN) + 0.05, 1, { color: 'gold', dy: -10, size: narrow ? 9.5 : 11.5 });
    if (!hide.has('output')) cplot.text(narrow ? 'output' : `laser output, relative${P.compare ? ' (dashed: the other schemes)' : ''}`, narrow ? lw(WMAX) - 0.03 : lw(WMIN) + 0.05, 1.32, { color: 'bad', size: narrow ? 9.5 : 11.5, align: narrow ? 'right' : 'left' });
  }

  let lastRead = '';
  function readout() {
    if (P.readout === false) return;
    const S = now(), key = [S.scheme, S.W, S.R].join();
    if (key === lastRead) return;
    lastRead = key;
    const ss = L.steady(S.scheme, S.W, S.R), th = L.thresholdPump(S.scheme, S.R), sch = L.SCHEMES[S.scheme];
    F.readout([
      ['steady upper / lower laser level', `${ss.N[sch.upper].toFixed(1)}\\ /\\ ${ss.N[sch.lower].toFixed(1)}\\text{ of ${L.NA} atoms}`],
      hide.has('threshold') ? null : ['threshold pump', th === Infinity ? '\\text{none: never inverts}' : `${th.toFixed(th < 0.1 ? 3 : 2)}/\\tau_{21}`],
      hide.has('output') ? null : ['steady photons in the mode', ss.q < 1 ? '\\text{fewer than 1}' : `${Math.round(ss.q)}`],
    ]);
  }

  const reduced = () => document.documentElement.getAttribute('data-motion') === 'reduce' || !!globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  let running = (P.play ?? !F.compact) && !reduced();
  warm();
  if (running) { atoms.reset(); }
  const tick = (dt) => { if (!running) return; const S = now(); advance(dt * SPEED, S); moveLight(dt); drawTop(); };
  let loop = F.animate(tick);
  if (!F.compact && P.play !== false) {
    const btn = F.button({ label: running ? 'Pause' : 'Play', onClick: () => {
      running = !running; btn.textContent = running ? 'Pause' : 'Play';
      loop.stop(); loop = F.animate(tick, { force: running });
      if (!running) drawTop();
    } });
    F.button({ label: 'Start from the ground state', onClick: () => { atoms.reset(); photons = []; sparks = []; pulses = []; outGlow = 0; drawTop(); } });
  }
  F.onChange((k) => {
    if (k === 'scheme') { atoms = new L.Atoms(now().scheme); photons = []; if (!running) warm(); }
    else if (!running) warm();
    readout(); drawTop(); drawCurve();
  });
  F.draw(() => { readout(); drawTop(); drawCurve(); });
  F.caption(P.caption || 'A teaching model: 40 atoms and one cavity mode, with time slowed by a factor of millions — real upper-level lifetimes are microseconds (Nd:YAG: 0.23 ms; ruby: 3 ms) and light crosses a cavity in nanoseconds. Level energies are to scale for ruby and Nd:YAG; output is relative, scaled to the four-level laser at full pump.');
  return { get: (k) => F.params[k] };
}

export function validate(P) {
  const p = [];
  if (!L.SCHEMES[P.scheme]) p.push(`mp-laser: unknown scheme “${P.scheme}”`);
  if (!(P.W >= WMIN && P.W <= WMAX)) p.push(`mp-laser: W must lie in ${WMIN}–${WMAX}`);
  if (!(P.R >= 0.8 && P.R <= 0.995)) p.push('mp-laser: R must lie in 0.80–0.995');
  for (const x of P.panels || []) if (!PANELS.includes(x)) p.push(`mp-laser: unknown panel “${x}”`);
  for (const h of P.hide || []) if (!HIDE.includes(h)) p.push(`mp-laser: unknown hide “${h}”`);
  if (Array.isArray(P.controls)) for (const c of P.controls) if (!CONTROLS.includes(c)) p.push(`mp-laser: unknown control “${c}”`);
  return p;
}
