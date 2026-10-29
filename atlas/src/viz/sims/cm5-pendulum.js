// The driven damped pendulum φ̈ + 2βφ̇ + ω₀² sin φ = γω₀² cos ωt, on the
// route to chaos (PHYS 3550, M10). Taylor's parameters by default: drive
// period 1 s (ω = 2π rad/s), ω₀ = 1.5ω, β = ω₀/4; the drive strength γ is the
// drive torque as a fraction of the largest torque gravity can exert. Panels,
// top to bottom (any subset, in this order):
//   swing  the pendulum itself (two of them with `two`), at the moment shown
//   time   φ(t) over a window of drive periods, after `skip` periods of
//          transient (φ is not wrapped: a pendulum that goes over the top
//          climbs or falls by 2π each turn)
//   phase  the state-space orbit (φ wrapped into −π…π, φ̇) over the same
//          window, with the Poincaré section — one dot per drive period,
//          after a long transient: n dots for a period-n orbit, a scatter
//          of dots tracing a fractal set for a chaotic one
//   sep    ln|Δφ| for two starts Δφ₀ apart, with the least-squares line
//          through its growth (or decay): the slope estimates the Lyapunov
//          exponent λ
//   bif    the bifurcation diagram: φ (wrapped) at 40 successive drive
//          periods after a transient, for each γ in the `bif` window, with
//          the current γ marked — the period-doubling cascade
// Fixed-step RK4 (200 steps per drive period; 100 in the bifurcation
// diagram). Physics: model/cm5-chaos.js, tested in test/cm5-chaos.test.mjs.
//
//   { type: 'cm5-pendulum', params: {
//       gamma: 1.073,             // drive strength γ (dimensionless)
//       w0: 3π, beta: 3π/4, w: 2π,// natural frequency, damping (s⁻¹), drive frequency (rad/s): Taylor's
//       start: [-π/2, 0],         // φ(0) (rad) and φ̇(0) (rad/s)
//       two: false,               // a second pendulum started Δφ₀ away (time, swing and phase panels)
//       d0: 1e-4,                 // Δφ₀ (rad), for `two` and the sep panel
//       skip: 0,                  // drive periods of transient before the window
//       periods: 12,              // the window's length, in drive periods
//       panels: ['time', 'phase'],
//       poincare: true,           // phase: the Poincaré dots
//       keep: 60,                 // phase: how many Poincaré dots (after 100 periods of transient)
//       orbit: true,              // phase: the orbit itself (false: dots only)
//       bif: [1.06, 1.087],       // bif: the γ window
//       bifN: 150,                // bif: how many values of γ across it
//       marks: true,              // bif: the current γ's line; time: the drive period ticks
//       y: null,                  // time: the φ range [lo, hi] (default: fitted)
//       controls: ['gamma'],      // any of gamma d0 two ([] for a still picture)
//       gRange: [0.9, 1.11],      // the γ slider's range
//       play: true,               // animate a cursor through the window (never under reduced motion until Play); false: still
//       readout: true, readouts: null,   // rows: gamma period lambda fit d0 (default: gamma period lambda)
//       hide: [],                 // rows printed as “?”
//   } }
//
// A picture must not show its answer: readout: false (or hide) when a
// question asks for the period or λ, and marks: false on the bif panel
// when the question is where γ is.

import { Plot } from '../plot.js';
import * as K from '../model/cm5-chaos.js';

const PI = Math.PI;
export const defaults = {
  gamma: 1.073, w0: K.TAYLOR.w0, beta: K.TAYLOR.beta, w: K.TAYLOR.w, start: [-PI / 2, 0], two: false, d0: 1e-4,
  skip: 0, periods: 12, panels: ['time', 'phase'], poincare: true, keep: 60, orbit: true, bif: [1.06, 1.087], bifN: 150,
  marks: true, y: null, controls: ['gamma'], gRange: [0.9, 1.11], play: true, readout: true, readouts: null, hide: [],
};
const PANELS = ['swing', 'time', 'phase', 'sep', 'bif'];
const CONTROLS = ['gamma', 'd0', 'two'];
const ROWS = ['gamma', 'period', 'lambda', 'fit', 'd0'];
const SPP = 200;

const trim = (x, d = 3) => {
  if (!Number.isFinite(x)) return '\\text{—}';
  const a = Math.abs(x);
  if (a !== 0 && (a < 1e-3 || a >= 1e5)) { const [mm, e] = x.toExponential(d - 1).split('e'); return `${+mm}\\times10^{${+e}}`; }
  return String(+(+x).toPrecision(d));
};

// bifurcation diagrams are slow (seconds): computed once per window and kept
const BIF = new Map();
function bifData(o, lo, hi, n, start) {
  const key = JSON.stringify([o.w0, o.beta, o.w, lo, hi, n, start]);
  if (!BIF.has(key)) {
    const gs = Array.from({ length: n }, (_, i) => lo + ((hi - lo) * i) / (n - 1));
    BIF.set(key, K.bifurcation({ w0: o.w0, beta: o.beta, w: o.w }, gs, { s0: start, skip: 300, keep: 40, spp: 100 }));
  }
  return BIF.get(key);
}

/** Least-squares slope and intercept of y on x. */
function fitLine(xs, ys) {
  const n = xs.length;
  if (n < 2) return null;
  const mx = xs.reduce((s, x) => s + x, 0) / n, my = ys.reduce((s, y) => s + y, 0) / n;
  let sxy = 0, sxx = 0;
  for (let i = 0; i < n; i++) { sxy += (xs[i] - mx) * (ys[i] - my); sxx += (xs[i] - mx) ** 2; }
  const m = sxy / sxx;
  return { m, c: my - m * mx };
}

/** The part of ln|Δφ| that grows (or decays) cleanly: from t = 0 until it nears saturation (Δφ ≈ 0.1 rad) or round-off (10⁻¹³). */
export function sepFit(sep) {
  const xs = [], ys = [];
  for (let i = 0; i < sep.t.length; i++) {
    if (sep.d[i] > 0.1 || sep.d[i] < 1e-13) break;
    xs.push(sep.t[i]); ys.push(sep.ln[i]);
  }
  return fitLine(xs, ys);
}

export async function mount(F, P0) {
  const P = { ...defaults, ...P0 };
  let reduced = false;
  try { reduced = (await import('../../ui/state.js')).reducedMotion(); } catch { reduced = true; }
  const panels = PANELS.filter((p) => (P.panels || []).includes(p));
  const C0 = new Set(P.controls || []);
  const label = {
    swing: 'The driven pendulum swinging', time: 'The angle against time', phase: 'The state-space orbit with its Poincaré section',
    sep: 'The log of the separation of two nearby starts against time', bif: 'The bifurcation diagram: the angle once per drive period against drive strength',
  };
  const cv = {};
  for (const p of panels) cv[p] = F.canvas(p === 'swing' ? { height: F.compact ? '150px' : '190px', label: label[p] } : { aspect: 'wide', label: label[p] });

  if (C0.has('gamma')) F.slider({ key: 'gamma', label: 'Drive strength $\\gamma$', min: P.gRange[0], max: P.gRange[1], step: 0.0001, value: P.gamma, explain: 'The drive torque’s amplitude as a fraction of the largest torque gravity can exert ($mg\\ell$). Above 1 the drive can hold the pendulum out sideways.' });
  else F.params.gamma = P.gamma;
  if (C0.has('d0')) F.choice({ key: 'd0', label: 'Second start $\\Delta\\phi_0$', options: [[1e-2, '$10^{-2}$ rad'], [1e-4, '$10^{-4}$ rad'], [1e-6, '$10^{-6}$ rad']], value: P.d0, explain: 'How far apart the two pendulums start. Each factor of 100 buys only a fixed amount of extra predictable time.' });
  else F.params.d0 = P.d0;
  if (C0.has('two')) F.toggle({ key: 'two', label: 'Second pendulum', value: !!P.two, explain: 'Start a second, identical pendulum $\\Delta\\phi_0$ further over.' });
  else F.params.two = !!P.two;

  const o = () => ({ w0: P.w0, beta: P.beta, w: P.w, gamma: +F.params.gamma });
  const T = (2 * PI) / P.w;
  let B;
  function build() {
    const oo = o(), d0 = +F.params.d0, two = !!F.params.two;
    // the window: run through the transient, then record
    let s = P.start.slice();
    for (let n = 0; n < P.skip; n++) s = K.strobe(oo, s, SPP);
    const tA = P.skip * T;
    const A = K.run(oo, s, { periods: P.periods, spp: SPP, every: 2, t0: tA });
    let s2 = [P.start[0] + d0, P.start[1]];
    for (let n = 0; n < P.skip; n++) s2 = K.strobe(oo, s2, SPP);
    const Bb = two ? K.run(oo, s2, { periods: P.periods, spp: SPP, every: 2, t0: tA }) : null;
    const want = new Set(P.readouts || ['gamma', 'period', 'lambda']);
    const needPc = panels.includes('phase') && P.poincare || want.has('period');
    const pc = needPc ? K.poincare(oo, P.start, { skip: 100, keep: Math.max(P.keep, 40), spp: 100 }) : [];
    const per = needPc ? K.period(pc, { maxM: 16, tol: 2e-3 }) : null;
    const sep = panels.includes('sep') || want.has('fit') ? K.separation(oo, P.start, d0, { periods: P.periods, spp: SPP, every: 5 }) : null;
    const fit = sep ? sepFit(sep) : null;
    const lam = P.readout !== false && want.has('lambda') ? K.lyapunov(oo, P.start, { skip: 60, periods: 240, spp: 100 }) : null;
    return { A, Bb, pc: pc.slice(-P.keep), per, sep, fit, lam, tA, tB: tA + P.periods * T };
  }
  B = build();

  const still = P.play === false || F.compact;
  const S = { cur: still ? Infinity : B.tA, running: !still && !reduced };
  if (!still) {
    const anim = F.animate((dt) => {
      if (!S.running) return;
      S.cur += dt;
      if (S.cur > B.tB + 0.6) S.cur = B.tA;
      draw();
    }, { force: true });
    const btn = F.button({ label: S.running ? 'Pause' : 'Play', primary: true, onClick: () => { S.running = !S.running; btn.textContent = S.running ? 'Pause' : 'Play'; if (S.running) anim.start(); } });
    F.button({ label: 'Show all', onClick: () => { S.running = false; btn.textContent = 'Play'; S.cur = Infinity; draw(); } });
    if (!S.running) S.cur = Infinity;
  }
  F.onChange(() => { B = build(); if (!S.running) S.cur = Infinity; else S.cur = B.tA; draw(); });

  const plot = {};
  if (cv.swing) plot.swing = new Plot(cv.swing.canvas, { x: [-1.4, 1.4], y: [-1.3, 1.3], equal: true, grid: false, axes: false, pad: { l: 8, r: 8, t: 8, b: 8 } });
  if (cv.time) plot.time = new Plot(cv.time.canvas, { x: [0, 1], y: [-1, 1], axesAt: 'edge', xlabel: 't (s)', ylabel: 'φ (rad)', pad: { l: 52, r: 14, t: 14, b: 36 } });
  if (cv.phase) plot.phase = new Plot(cv.phase.canvas, { x: [-PI, PI], y: [-1, 1], axesAt: 'edge', xlabel: 'φ (rad, wrapped)', ylabel: 'dφ/dt (rad/s)', pad: { l: 52, r: 14, t: 14, b: 36 } });
  if (cv.sep) plot.sep = new Plot(cv.sep.canvas, { x: [0, 1], y: [-1, 1], axesAt: 'edge', xlabel: 't (s)', ylabel: 'ln |Δφ|', pad: { l: 52, r: 14, t: 14, b: 36 } });
  if (cv.bif) plot.bif = new Plot(cv.bif.canvas, { x: P.bif, y: [-1, 1], axesAt: 'edge', xlabel: 'drive strength γ', ylabel: 'φ once per period (rad)', pad: { l: 56, r: 14, t: 14, b: 36 }, xticks: 6 });

  const upto = (R) => { let n = R.t.length; if (Number.isFinite(S.cur)) { n = 0; while (n < R.t.length && R.t[n] <= S.cur) n++; } return Math.max(1, n); };

  function drawSwing() {
    const p = plot.swing;
    p.clear();
    const R = B.A, n = upto(R) - 1;
    const bob = (phi, color) => {
      const x = Math.sin(phi), y = -Math.cos(phi);
      p.line(0, 0, x, y, { color: 'ink2', width: 2.4 });
      p.point(x, y, { color, r: 10 });
    };
    p.circle(0, 0, 1, { color: 'ink4', width: 1, dash: [3, 4] });
    p.line(-0.25, 0, 0.25, 0, { color: 'ink3', width: 4 });
    if (B.Bb) bob(B.Bb.phi[n], 'warn');
    bob(R.phi[n], 'accent');
    // the drive torque's phase: an arrow whose length is γ cos ωt
    const tt = R.t[n], drv = Math.cos(P.w * tt);
    p.arrow(0, 1.12, 0.9 * drv, 1.12, { color: 'gold', width: 2.2, head: 8 });
    p.text('drive', -1.38, 1.12, { color: 'gold', size: 11 });
    p.text(`t = ${tt.toFixed(2)} s`, 1.38, -1.2, { color: 'ink3', size: 11, align: 'right' });
  }

  function drawTime() {
    const p = plot.time, R = B.A;
    let lo = Infinity, hi = -Infinity;
    for (const v of [...R.phi, ...(B.Bb ? B.Bb.phi : [])]) { lo = Math.min(lo, v); hi = Math.max(hi, v); }
    const pad = Math.max(0.15, 0.08 * (hi - lo));
    p.setView([B.tA, B.tB], P.y || [lo - pad, hi + pad]);
    p.clear();
    if (P.marks) for (let k = Math.ceil(B.tA / T); k * T <= B.tB + 1e-9; k++) p.line(k * T, p.vy0, k * T, p.vy0 + 0.04 * (p.vy1 - p.vy0), { color: 'ink3', width: 1 });
    const n = upto(R);
    const pts = (Rr) => Rr.t.slice(0, n).map((t, i) => [t, Rr.phi[i]]);
    if (B.Bb) p.path(pts(B.Bb), { color: 'warn', width: 1.6 });
    p.path(pts(R), { color: 'accent', width: 2 });
    if (Number.isFinite(S.cur) && n < R.t.length) p.point(R.t[n - 1], R.phi[n - 1], { color: 'accent', r: 4 });
  }

  function drawPhase() {
    const p = plot.phase, R = B.A, n = upto(R);
    let vmax = 1;
    for (const v of R.dphi) vmax = Math.max(vmax, Math.abs(v));
    for (const [, v] of B.pc) vmax = Math.max(vmax, Math.abs(v));
    p.setView([-PI, PI], [-1.12 * vmax, 1.12 * vmax]);
    p.clear();
    const path = (Rr, color, width, alpha) => {
      const pts = [];
      let prev = null;
      for (let i = 0; i < n; i++) {
        const x = K.wrap(Rr.phi[i]);
        if (prev !== null && Math.abs(x - prev) > PI) pts.push([NaN, NaN]);
        pts.push([x, Rr.dphi[i]]); prev = x;
      }
      p.path(pts, { color, width, alpha });
    };
    if (P.orbit) {
      if (B.Bb) path(B.Bb, 'warn', 1.3, 0.8);
      path(R, 'accent', 1.6, 0.85);
    }
    if (P.poincare) for (const [x, v] of B.pc) p.point(x, v, { color: 'gold', r: 2.6 });
    if (P.orbit && Number.isFinite(S.cur) && n < R.t.length) p.point(K.wrap(R.phi[n - 1]), R.dphi[n - 1], { color: 'accent', r: 4.5 });
  }

  function drawSep() {
    const p = plot.sep, s = B.sep;
    const finite = s.ln.filter((v) => v > -40);
    const lo = Math.min(...finite), hi = Math.max(...finite, 1);
    p.setView([0, P.periods * T], [Math.floor(lo - 1), Math.ceil(hi + 1)]);
    p.clear();
    const n = Number.isFinite(S.cur) ? Math.max(1, s.t.filter((t) => t <= S.cur - B.tA).length) : s.t.length;
    p.path(s.t.slice(0, n).map((t, i) => [t, s.ln[i] > -40 ? s.ln[i] : NaN]), { color: 'accent', width: 1.8 });
    if (B.fit) p.line(0, B.fit.c, P.periods * T, B.fit.c + B.fit.m * P.periods * T, { color: 'gold', width: 1.6, dash: [6, 5] });
    p.line(0, Math.log(PI), P.periods * T, Math.log(PI), { color: 'ink4', width: 1, dash: [2, 4] });
    p.text('Δφ = π: as far apart as angles get', p.X(0.02 * P.periods * T), p.Y(Math.log(PI)), { screen: true, dy: -10, color: 'ink3', size: 11 });
  }

  function drawBif() {
    const p = plot.bif, data = bifData(o(), P.bif[0], P.bif[1], P.bifN, P.start);
    let lo = Infinity, hi = -Infinity;
    for (const d of data) for (const v of d.phis) { lo = Math.min(lo, v); hi = Math.max(hi, v); }
    const pad = 0.06 * (hi - lo || 1);
    p.setView(P.bif, [lo - pad, hi + pad]);
    p.clear();
    const g = p.ctx;
    g.save(); g.fillStyle = p.color('ink'); g.globalAlpha = 0.75;
    for (const d of data) for (const v of d.phis) g.fillRect(p.X(d.gamma) - 0.8, p.Y(v) - 0.8, 1.6, 1.6);
    g.restore();
    const gm = +F.params.gamma;
    if (P.marks && gm >= P.bif[0] && gm <= P.bif[1]) p.line(gm, p.vy0, gm, p.vy1, { color: 'accent', width: 1.6, dash: [5, 4] });
  }

  function readout() {
    if (P.readout === false) { F.readout([]); return; }
    const hide = new Set(P.hide || []), want = P.readouts || ['gamma', 'period', 'lambda'];
    const val = {
      gamma: ['$\\gamma$', trim(+F.params.gamma, 5)],
      period: ['period', B.per ? `${B.per}\\ \\text{drive period${B.per > 1 ? 's' : ''}}` : '\\text{none found (chaotic?)}'],
      lambda: ['Lyapunov $\\lambda$', B.lam === null ? '\\text{—}' : `${trim(B.lam, 2)}\\ \\mathrm{s^{-1}}`],
      fit: ['slope of the line', B.fit ? `${trim(B.fit.m, 2)}\\ \\mathrm{s^{-1}}` : '\\text{—}'],
      d0: ['$\\Delta\\phi_0$', `${trim(+F.params.d0, 2)}\\ \\mathrm{rad}`],
    };
    F.readout(want.filter((k) => val[k]).map((k) => [val[k][0], hide.has(k) ? '?' : val[k][1]]));
  }

  function draw() {
    if (plot.swing) drawSwing();
    if (plot.time) drawTime();
    if (plot.phase) drawPhase();
    if (plot.sep) drawSep();
    if (plot.bif) drawBif();
    readout();
  }
  F.draw(draw);
  F.caption('Taylor’s pendulum: drive period 1 s, ω₀ = 1.5ω, β = ω₀/4; a rigid, massless rod and no friction but the linear damping. Integrated with fixed-step RK4: a computed chaotic orbit parts from the exact one after a few tens of seconds (round-off grows like any other small difference), but its Poincaré section and λ do not change when the step is halved. Poincaré dots start after 100 drive periods of transient, the bifurcation diagram after 300.');
  return { get: (k) => (k === 'period' ? B.per : k === 'lambda' ? B.lam : F.params[k]) };
}

export function validate(P) {
  const out = [];
  if (!(P.gamma >= 0 && P.gamma <= 3)) out.push('cm5-pendulum: gamma must be from 0 to 3');
  for (const k of ['w0', 'beta', 'w']) if (!(P[k] > 0)) out.push(`cm5-pendulum: ${k} must be positive`);
  if (!(Array.isArray(P.start) && P.start.length === 2 && P.start.every(Number.isFinite))) out.push('cm5-pendulum: start must be [φ, φ̇]');
  if (!(P.d0 > 0 && P.d0 < 1)) out.push('cm5-pendulum: d0 must be between 0 and 1 rad');
  if (!(Number.isInteger(P.skip) && P.skip >= 0 && P.skip <= 400)) out.push('cm5-pendulum: skip must be a whole number of periods, 0–400');
  if (!(P.periods > 0 && P.periods <= 60)) out.push('cm5-pendulum: periods must be from 0 to 60');
  if (!Array.isArray(P.panels) || !P.panels.length || P.panels.some((p) => !PANELS.includes(p))) out.push(`cm5-pendulum: panels must be a list of ${PANELS.join(', ')}`);
  if (!(Array.isArray(P.bif) && P.bif.length === 2 && P.bif[0] < P.bif[1] && P.bif[0] >= 0)) out.push('cm5-pendulum: bif must be [lo, hi] with lo < hi');
  if (!(Number.isInteger(P.bifN) && P.bifN >= 10 && P.bifN <= 300)) out.push('cm5-pendulum: bifN must be a whole number from 10 to 300');
  if (!(Number.isInteger(P.keep) && P.keep >= 1 && P.keep <= 400)) out.push('cm5-pendulum: keep must be a whole number from 1 to 400');
  if (!(Array.isArray(P.gRange) && P.gRange[0] < P.gRange[1])) out.push('cm5-pendulum: gRange must be [lo, hi]');
  else if ((P.controls || []).includes('gamma') && !(P.gamma >= P.gRange[0] && P.gamma <= P.gRange[1])) out.push('cm5-pendulum: with a gamma slider, gRange must contain gamma');
  if (P.y !== null && !(Array.isArray(P.y) && P.y[0] < P.y[1])) out.push('cm5-pendulum: y must be [lo, hi] or null');
  for (const c of P.controls || []) if (!CONTROLS.includes(c)) out.push(`cm5-pendulum: unknown control “${c}”`);
  for (const r of [...(P.hide || []), ...(P.readouts || [])]) if (!ROWS.includes(r)) out.push(`cm5-pendulum: unknown readout “${r}”`);
  if (![true, false].includes(P.play)) out.push('cm5-pendulum: play must be true or false');
  return out;
}
