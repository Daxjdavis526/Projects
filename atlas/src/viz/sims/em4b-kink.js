// A point charge that moves uniformly, stops, or starts — its electric field
// lines at one instant, computed from the Liénard–Wiechert field (PHYS 4600
// M4.3–M4.4). Physics in model/em4b-kink.js (tested in
// test/em4b-kink.test.mjs). Two panels:
//
//   field  the x–y plane with field lines traced along the exact field at
//          time t. After a stop (or start) the news spreads at c: inside the
//          inner dashed circle the field is that of the charge as it is now;
//          outside the outer circle it still points from where the charge
//          would be had nothing happened; in the shell between, the lines run
//          sideways — the kink, the radiation field. A draggable probe P marks
//          the charge's retarded position (where it was when it sent the field
//          now at P) and its present position.
//   cone   the spacetime diagram (x across, ct up) of the same motion: the
//          charge's worldline, and the past light cone of the event “P, now”,
//          cut through the line of motion (a hyperbola, since P is off the
//          line). Where the worldline crosses it is the retarded event.
//
//   { type: 'em4b-kink', params: {
//       mode: 'stop',          // 'uniform' | 'stop' | 'start'
//       modes: null,           // a list of modes to offer as a choice
//       beta: 0.6,             // the speed before a stop / after a start / throughout, as a fraction of c
//       tau: 0.4,              // how long the stop or start takes (in units of the length unit / c)
//       time: 3,               // the moment shown, t (0: the change begins)
//       lines: 16,             // field lines around the charge
//       view: 6,               // half-width of the field panel, length units
//       probe: [-2, 2.5],      // P, or null for none
//       panels: ['field', 'cone'],
//       shells: true,          // the dashed news circles
//       play: null,            // animate t (default: in the Explore step, not in a problem)
//       controls: null,        // true, false or a list of: beta tau time mode
//       readout: true,
//       readouts: null,        // rows: time tr delay xr xnow beta
//       hide: [],              // rows printed as “?”; 'retarded' hides the retarded marks
//       labels: true,
//   } }
//
// Units: c = 1. The charge moves along x; the plane shown contains its path,
// so the drawing is a slice through a pattern symmetric about that line.
// Field lines start equally spaced in angle in the charge's own frame, which
// shows where the field is strong but is not a flux-faithful density in a
// plane slice.

import { Plot } from '../plot.js';
import * as K from '../model/em4b-kink.js';

export const defaults = {
  mode: 'stop', modes: null, beta: 0.6, tau: 0.4, time: 3, lines: 16, view: 6, probe: [-2, 2.5],
  panels: ['field', 'cone'], shells: true, play: null, controls: null, readout: true, readouts: null, hide: [], labels: true,
};
const MODES = ['uniform', 'stop', 'start'];
const PANELS = ['field', 'cone'];
const ROWS = ['time', 'tr', 'delay', 'xr', 'xnow', 'beta'];
const trim = (x, d = 3) => (Number.isFinite(x) ? String(+(+x).toPrecision(d)) : '\\text{—}');

export function validate(P0) {
  const P = { ...defaults, ...P0 }, out = [];
  if (!MODES.includes(P.mode)) out.push(`em4b-kink: mode must be one of ${MODES.join(', ')}`);
  for (const m of P.modes || []) if (!MODES.includes(m)) out.push(`em4b-kink: unknown mode ${m}`);
  if (!(typeof P.beta === 'number' && Math.abs(P.beta) < 0.99)) out.push('em4b-kink: beta must be a number with |beta| < 0.99');
  if (!(typeof P.tau === 'number' && P.tau > 0)) out.push('em4b-kink: tau must be positive');
  if (typeof P.time !== 'number') out.push('em4b-kink: time must be a number');
  if (!(Number.isInteger(P.lines) && P.lines >= 4 && P.lines <= 40)) out.push('em4b-kink: lines must be a whole number from 4 to 40');
  if (!(P.view > 0)) out.push('em4b-kink: view must be positive');
  if (P.probe !== null && !(Array.isArray(P.probe) && P.probe.length === 2 && P.probe.every(Number.isFinite))) out.push('em4b-kink: probe must be [x, y] or null');
  for (const p of P.panels || []) if (!PANELS.includes(p)) out.push(`em4b-kink: unknown panel ${p}`);
  if (Array.isArray(P.controls)) for (const c of P.controls) if (!['beta', 'tau', 'time', 'mode'].includes(c)) out.push(`em4b-kink: unknown control ${c}`);
  for (const r of P.readouts || []) if (!ROWS.includes(r)) out.push(`em4b-kink: unknown readout ${r}`);
  for (const h of P.hide || []) if (![...ROWS, 'retarded'].includes(h)) out.push(`em4b-kink: unknown hide ${h}`);
  return out;
}

export async function mount(F, P0) {
  const P = { ...defaults, ...P0 };
  let reduced = false;
  try { reduced = (await import('../../ui/state.js')).reducedMotion(); } catch { reduced = true; }
  const panels = (P.panels || PANELS).filter((p) => PANELS.includes(p));
  const hide = new Set(P.hide || []);
  const V = P.view;
  const want = P.controls === true ? ['mode', 'beta', 'tau', 'time'] : Array.isArray(P.controls) ? P.controls : P.controls === false || F.compact ? [] : ['beta', 'time'];
  const modes = P.modes && P.modes.length > 1 ? P.modes : null;
  const put = (k, v) => { F.params[k] = v; };
  const tmax = V * 1.3;

  if (modes) F.choice({ key: 'mode', label: 'Motion', options: modes.map((m) => [m, { uniform: 'uniform', stop: 'stops', start: 'starts' }[m]]), value: P.mode, explain: 'A charge coasting at constant velocity, one that brakes to rest, or one that is kicked into motion.' });
  else put('mode', P.mode);
  if (want.includes('beta')) F.slider({ key: 'beta', label: 'Speed $v/c$', min: 0, max: 0.95, step: 0.01, value: P.beta, explain: 'The speed before the stop, after the start, or throughout.' });
  else put('beta', P.beta);
  if (want.includes('tau')) F.slider({ key: 'tau', label: 'Duration of the change $\\tau$', min: 0.05, max: 2, step: 0.05, value: P.tau, explain: 'How long the braking or the kick lasts: the thickness of the radiation shell is cτ.' });
  else put('tau', P.tau);
  if (want.includes('time')) F.slider({ key: 'time', label: 'Time $t$', min: -1, max: +tmax.toFixed(1), step: 0.05, value: P.time, explain: 'In units where c = 1; the change begins at t = 0.' });
  else put('time', P.time);

  const fCv = panels.includes('field') ? F.canvas({ aspect: 'wide', label: P.alt || 'Electric field lines of a moving point charge at one instant' }) : null;
  const cCv = panels.includes('cone') ? F.canvas({ aspect: F.compact ? 'wide' : 'wide', label: 'A spacetime diagram of the charge’s worldline and the past light cone of the probe' }) : null;
  const pf = fCv && new Plot(fCv.canvas, { x: [-V, V], y: [-V / 2.2, V / 2.2], equal: true, grid: false, axes: false, pad: { l: 6, r: 6, t: 6, b: 6 } });
  const pc = cCv && new Plot(cCv.canvas, { x: [-V, V], y: [0, 1], xlabel: 'x', ylabel: 'ct', pad: { l: 40, r: 12, t: 10, b: 30 } });

  const probe = P.probe ? { x: P.probe[0], y: P.probe[1] } : null;
  if (pf && probe && !F.compact) {
    pf.handle(() => [probe.x, probe.y], (x, y) => { probe.x = Math.max(-V, Math.min(V, x)); probe.y = y; }, { hollow: true });
    pf.onDrag = () => draw();
  }

  const still = P.play === false || F.compact;
  const S = { running: !still && (P.play ?? true) && !reduced && want.includes('time') };
  const anim = F.animate((dt) => {
    if (!S.running) return;
    let t = F.params.time + dt * V / 4;
    if (t > tmax) t = -1;
    F.set('time', +t.toFixed(3));
  }, { force: true });
  if (!still && want.includes('time')) {
    const btn = F.button({ label: S.running ? 'Pause' : 'Play', primary: true, onClick: () => { S.running = !S.running; btn.textContent = S.running ? 'Pause' : 'Play'; if (S.running) anim.start(); } });
  }
  F.onChange(() => draw());

  function drawField(W, T, mode, tau) {
    pf.clear();
    const box = { bx: (pf.vx1 - pf.vx0) / 2 + V * 0.05, by: (pf.vy1 - pf.vy0) / 2 + V * 0.05 };
    // news shells
    if (P.shells !== false) for (const s of K.shells(mode, W, T, tau)) pf.circle(s.cx, 0, s.r, { color: 'gold', width: 1.2, dash: [5, 5], alpha: 0.7 });
    // field lines
    const n = P.lines;
    for (let k = 0; k < n; k++) {
      const th0 = ((k + 0.5) * 2 * Math.PI) / n;
      const pts = K.fieldLine(W, T, th0, { eps: V * 0.012, h: V * 0.008, bx: box.bx, by: box.by, maxSteps: 900 });
      pf.path(pts, { color: 'accent', width: 1.5 });
    }
    // the path of the charge and the charge itself
    pf.line(-V * 2, 0, V * 2, 0, { color: 'ink4', width: 1, dash: [2, 5] });
    const xn = W.x(T);
    pf.point(xn, 0, { color: 'bad', r: 6 });
    if (mode !== 'uniform' && P.labels !== false) {
      const ghost = mode === 'stop' ? F.params.beta * T : 0;   // where the charge would be had nothing happened
      if (T > tau && Math.abs(ghost) < V) { pf.circle(ghost, 0, V * 0.02, { color: 'bad', width: 1.5, dash: [2, 2] }); pf.text('where it would be', ghost, 0, { color: 'ink3', size: 11, dy: -14, align: 'center' }); }
    }
    // probe and retarded position
    if (probe) {
      const E = K.field(W, T, probe.x, probe.y);
      if (!hide.has('retarded')) {
        pf.line(E.xr, 0, probe.x, probe.y, { color: 'violet', width: 1.4, dash: [4, 3] });
        pf.circle(E.xr, 0, V * 0.018, { color: 'violet', width: 2 });
        if (P.labels !== false) pf.text('retarded position', E.xr, 0, { color: 'violet', size: 11, dy: 16, align: 'center' });
      }
      const m = Math.hypot(E.Ex, E.Ey) || 1, L = V * 0.09;
      pf.arrow(probe.x, probe.y, probe.x + (E.Ex / m) * L, probe.y + (E.Ey / m) * L, { color: 'gold', width: 2.4 });
      pf.point(probe.x, probe.y, { color: 'gold', r: 4, label: P.labels !== false ? 'P' : '' });
      pf.drawHandles();
      return E;
    }
    return null;
  }

  function drawCone(W, T, E) {
    const t0 = T - 2 * V * 0.9, t1 = T + V * 0.25;
    pc.setView([-V, V], [t0, t1]);
    pc.clear();
    // worldline x(t)
    pc.curve((s) => W.x(s), (s) => s, t0 - 1, t1, { color: 'bad', width: 2.4, samples: 600 });
    // light lines through the present event, for scale
    if (probe) {
      const Y = Math.abs(probe.y), X = probe.x;
      pc.curve((u) => X + u, (u) => T - Math.hypot(u, Y), -3 * V, 3 * V, { color: 'gold', width: 2, samples: 600 });
      pc.point(X, T, { color: 'gold', r: 4.5, label: P.labels !== false ? 'P, now' : '' });
      if (E && !hide.has('retarded')) pc.point(E.xr, E.tr, { color: 'violet', r: 5.5, label: P.labels !== false ? 'retarded event' : '' });
    }
    pc.line(-V, T, V, T, { color: 'ink3', width: 1, dash: [4, 4] });
    pc.point(W.x(T), T, { color: 'bad', r: 4.5, label: P.labels !== false ? 'charge now' : '', ldy: 12 });
  }

  function draw() {
    const mode = F.params.mode, beta = F.params.beta, tau = F.params.tau, T = F.params.time;
    const W = K.worldline(mode, beta, tau);
    const E = pf ? drawField(W, T, mode, tau) : (probe ? K.field(W, T, probe.x, probe.y) : null);
    if (pc) drawCone(W, T, E);
    if (P.readout === false) { F.readout([]); return; }
    const rows = {
      time: ['Time $t$', trim(T, 3)],
      tr: ['Retarded time $t_r$', E ? trim(E.tr, 3) : '\\text{—}'],
      delay: ['Light delay $t - t_r = \\mathscr{r}/c$', E ? trim(T - E.tr, 3) : '\\text{—}'],
      xr: ['Retarded position $x(t_r)$', E ? trim(E.xr, 3) : '\\text{—}'],
      xnow: ['Present position $x(t)$', trim(W.x(T), 3)],
      beta: ['Speed now $v/c$', trim(W.v(T), 3)],
    };
    const keys = (P.readouts || (probe ? ['time', 'tr', 'xr', 'xnow'] : ['time', 'xnow', 'beta'])).filter((k) => rows[k]);
    F.readout(keys.map((k) => (hide.has(k) ? [rows[k][0], '?'] : rows[k])));
  }
  F.draw(draw);
  if (!P.caption) F.caption('Exact Liénard–Wiechert field lines at one instant (c = 1), in the plane containing the charge’s path. Lines start evenly spaced in angle in the charge’s own frame; their density in this slice is only a guide to the field’s strength.');
  return { get: (k) => (k === 'point' && probe ? { x: probe.x, y: probe.y } : F.params[k]) };
}
