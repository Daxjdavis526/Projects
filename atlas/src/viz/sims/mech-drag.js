// Falling through air. A body dropped from rest — a skydiver, a capsule under
// its parachutes, a ball — feels its weight mg and a quadratic drag force
// D = ½ρ C_D A v² that grows with speed. On the left, the body with both forces
// drawn to one scale: the drag arrow grows until it matches the weight. On the
// right, speed against time, approaching the terminal speed
// v_t = √(2mg/(ρ C_D A)) along the exact solution v = v_t tanh(gt/v_t), with
// free fall (v = gt) for comparison. Physics in model/mech-forces.js.
//
//   { type: 'mech-drag', params: {
//       m: 80, CdA: 0.42, alt: 0,      // mass (kg), drag coefficient × frontal area (m²), altitude (km) setting ρ
//       rho: 1.2,                      // or the air density directly (kg/m³), overriding alt
//       icon: 'skydiver',              // skydiver capsule ball
//       time: 0, T: 30,                // the time cursor and the graph's span (s; default ≈ 4 v_t/g)
//       sliders: ['m', 'CdA', 'alt'],  // or true; the time slider and Play come with any sliders
//       postures: true,                // offer skydiver postures (belly, head-down, canopy)
//       linear: false,                 // also draw linear drag with the same terminal speed
//       show: 'both',                  // 'both', 'graph' or 'body'
//   } }

import { Plot } from '../plot.js';
import * as MF from '../model/mech-forces.js';

const G = MF.G;
export const defaults = { m: 80, CdA: 0.42, alt: 0, icon: 'skydiver', time: 0, show: 'both', linear: false, postures: false };
const POSTURES = [[0.42, 'Belly to earth'], [0.22, 'Head down'], [40, 'Canopy open']];
const ICONS = ['skydiver', 'capsule', 'ball'];
const trim = (x, n = 3) => String(+(+x).toPrecision(n));

export function mount(F, P0) {
  const P = { ...defaults, ...P0 };
  const compact = F.compact;
  const { canvas } = F.canvas({ aspect: P.aspect ?? (compact ? 'wide' : ''), label: P.alt_text || 'A falling body with its weight and drag forces, and a graph of its speed against time' });
  const ctx = canvas.getContext('2d');
  const graph = new Plot(canvas, { x: [0, 10], y: [0, 10], xlabel: 't (s)', ylabel: '' });
  const left = new Plot(canvas, { x: [-1.5, 1.5], y: [-2, 2], equal: true, grid: false, axes: false });

  const wanted = P.sliders === true ? ['m', 'CdA', 'alt'] : P.sliders || [];
  const live = wanted.length > 0 || P.play;
  const env = () => {
    const m = F.params.m ?? P.m, CdA = F.params.CdA ?? P.CdA, alt = F.params.alt ?? P.alt;
    const rho = P.rho ?? MF.airDensity(alt);
    const vt = MF.terminalSpeed(m, CdA, rho);
    return { m, CdA, alt, rho, vt };
  };
  const span = () => P.T ?? Math.max(4, Math.ceil(((4 * env().vt) / G) / 2) * 2);
  let timeCtl = null;
  if (live) timeCtl = F.slider({ key: 'time', label: 'Time $t$', min: 0, max: span(), step: 0.05, value: Math.min(P.time, span()), unit: '\\mathrm{s}', explain: 'Seconds since the drop, from rest.' });
  else F.params.time = P.time;
  if (P.postures) F.choice({ key: 'CdA', label: 'Posture', options: POSTURES.map(([v, t]) => [v, t]), value: P.CdA, explain: '$C_D A$: how much air the body pushes aside. Typical values for an 80 kg skydiver with gear.' });
  for (const k of wanted) {
    if (k === 'm') F.slider({ key: 'm', label: 'Mass $m$', min: Math.min(40, P.m), max: Math.max(150, P.m), step: 1, value: P.m, unit: '\\mathrm{kg}', explain: 'More weight needs more drag to balance it, so a faster terminal speed.' });
    if (k === 'CdA' && !P.postures) F.slider({ key: 'CdA', label: 'Drag area $C_D A$', min: Math.min(0.05, P.CdA), max: Math.max(60, P.CdA), value: P.CdA, logScale: true, unit: '\\mathrm{m^2}', explain: 'Drag coefficient times frontal area: about 0.4 m² spread-eagled, tens of m² under a canopy.' });
    if (k === 'alt') F.slider({ key: 'alt', label: 'Altitude', min: 0, max: 40, step: 0.5, value: P.alt, unit: '\\mathrm{km}', explain: 'Sets the air density $\\rho$ (US Standard Atmosphere), held fixed during the fall.' });
  }
  const S = { running: false };
  let play = null;
  const anim = live ? F.animate((dt) => {
    if (!S.running) return;
    const T = span();
    let t = F.params.time + dt * Math.max(1, T / 10);
    if (t >= T) { t = T; S.running = false; play.textContent = 'Replay'; }
    F.set('time', t);
  }, { force: true }) : null;
  if (live) play = F.button({ label: 'Play', primary: true, onClick: () => {
    if (S.running) { S.running = false; play.textContent = 'Play'; return; }
    if (F.params.time >= span() - 1e-9) F.set('time', 0);
    S.running = true; play.textContent = 'Pause'; anim.start();
  } });
  F.onChange((key) => {
    if (key !== 'time' && timeCtl) {
      const T = span(), input = timeCtl.node.querySelector('input');
      if (input) input.max = String(T);
      if (F.params.time > T) timeCtl.set(T);
    }
    draw();
  });

  function draw() {
    const e = env(), t = F.params.time ?? 0, T = span();
    const v = MF.fallSpeed(t, e.vt), D = MF.dragForce(v, e.CdA, e.rho), W = e.m * G;
    graph.resize(); graph.refreshTheme();
    const Wd = graph.w, H = graph.h;
    ctx.clearRect(0, 0, Wd, H);
    const show = P.show;
    const split = show === 'both' ? Math.round(Wd * (Wd < 560 ? 0.38 : 0.34)) : show === 'body' ? Wd : 0;
    // the body and its two forces
    if (show !== 'graph') {
      left.o.pad = { l: 6, r: Wd - split + 6, t: 26, b: 10 };
      left.setView([-1.5, 1.5], [-2.1, 2.1]);
      left.refreshTheme();
      body(left, P.icon);
      const k = (P.icon === 'capsule' ? 1.25 : 1.5) / W;   // the weight arrow's length in the picture
      left.arrow(0, -0.15, 0, -0.15 - W * k, { color: 'ink2', width: 2.8, head: 11 });
      left.text(`mg = ${fmtN(W)}`, 0.12, -0.15 - W * k + 0.1, { color: 'ink2', size: 12, weight: 650 });
      if (D * k > 0.04) {
        left.arrow(0, 0.15, 0, 0.15 + D * k, { color: 'warn', width: 2.8, head: 11 });
        left.text(`D = ${fmtN(D)}`, 0.12, 0.15 + D * k - 0.1, { color: 'warn', size: 12, weight: 650 });
      } else left.text('D ≈ 0', 0.12, 0.35, { color: 'warn', size: 12, weight: 650 });
      left.text(v > 0.995 * e.vt ? 'At terminal speed: D = mg' : t === 0 ? 'Just released: no drag yet' : 'Speeding up: D < mg', left.L, 13, { screen: true, color: 'ink2', size: 12, weight: 600 });
      if (show === 'both') { ctx.save(); ctx.strokeStyle = graph.col.line2; ctx.setLineDash([4, 6]); ctx.beginPath(); ctx.moveTo(split + 0.5, 8); ctx.lineTo(split + 0.5, H - 8); ctx.stroke(); ctx.restore(); }
    }
    // speed against time
    if (show !== 'body') {
      graph.o.pad = { l: split + 50, r: 18, t: 18, b: 34 };
      const vmax = Math.max(e.vt * 1.18, 1);
      graph.setView([0, T], [0, vmax]);
      graph.grid(); graph.axes();
      graph.text('v (m/s)', graph.L + 6, graph.T + 2, { screen: true, color: 'ink2', size: 12, baseline: 'top' });
      graph.fn((x) => G * x, { color: 'ink3', width: 1.5, dash: [5, 5], domain: [0, Math.min(T, vmax / G)] });
      graph.line(0, e.vt, T, e.vt, { color: 'gold', width: 1.5, dash: [6, 5] });
      if (P.linear) graph.fn((x) => MF.fallSpeedLinear(x, e.vt), { color: 'violet', width: 2 });
      graph.fn((x) => MF.fallSpeed(x, e.vt), { color: 'accent', width: 2.6 });
      graph.text(`v_t = ${trim(e.vt)} m/s`, T, e.vt, { align: 'right', dx: -4, dy: -10, color: 'gold', size: 12, weight: 650 });
      const xg = Math.min(T, (vmax * 0.82) / G);
      graph.text('no air', xg, G * xg, { dx: 6, dy: 0, color: 'ink3', size: 11.5 });
      if (P.linear) { const xl = T * 0.55; graph.text('linear drag', xl, MF.fallSpeedLinear(xl, e.vt), { dy: 14, color: 'violet', size: 11.5 }); }
      graph.line(t, 0, t, vmax, { color: 'ink3', width: 1, dash: [3, 4] });
      graph.point(t, v, { color: 'accent', r: 5 });
    }
    if (live || P.readout) F.readout([
      ['$t$', `${trim(t)}\\,\\mathrm{s}`], ['speed $v$', `${trim(v)}\\,\\mathrm{m/s}`], ['drag / weight', trim(D / W)],
      ['acceleration', `${trim(G * (1 - (v * v) / (e.vt * e.vt)))}\\,\\mathrm{m/s^2}`], ['terminal speed $v_t$', `${trim(e.vt)}\\,\\mathrm{m/s}`], ['air density $\\rho$', `${trim(e.rho)}\\,\\mathrm{kg/m^3}`],
    ]);
  }

  function body(pl, icon) {
    const c = 'accent';
    if (icon === 'ball') { pl.circle(0, 0, 0.32, { fill: c, color: c, width: 1 }); return; }
    if (icon === 'capsule') {
      const chute = (F.params.CdA ?? P.CdA) > 5;
      if (chute) {
        pl.path([[-1.0, 1.6], [1.0, 1.6], [0.9, 1.92], [0, 2.06], [-0.9, 1.92]], { close: true, color: 'warn', width: 1.5, fill: 'warn', fillAlpha: 0.35 });
        for (const x of [-1.0, -0.35, 0.35, 1.0]) pl.line(x, 1.6, 0, 0.32, { color: 'ink3', width: 1 });
      }
      pl.path([[-0.48, -0.28], [0.48, -0.28], [0.15, 0.32], [-0.15, 0.32]], { close: true, color: c, width: 1.4, fill: c, fillAlpha: 0.85 });
      pl.path([[-0.52, -0.36], [0.52, -0.36], [0.48, -0.28], [-0.48, -0.28]], { close: true, color: 'ink2', width: 1, fill: 'ink2', fillAlpha: 1 });
      return;
    }
    const cda = F.params.CdA ?? P.CdA;
    if (cda > 5) {                                           // canopy open: upright under a wing
      pl.path([[-1.1, 1.3], [1.1, 1.3], [1.0, 1.62], [-1.0, 1.62]], { close: true, color: 'warn', width: 1.5, fill: 'warn', fillAlpha: 0.35 });
      for (const x of [-1.05, -0.4, 0.4, 1.05]) pl.line(x, 1.3, 0, 0.42, { color: 'ink3', width: 1 });
      pl.path([[0, 0.38], [0, -0.3]], { color: c, width: 6 }); pl.circle(0, 0.5, 0.13, { fill: c, color: c, width: 1 });
      pl.path([[0, -0.3], [-0.12, -0.75]], { color: c, width: 3.5 }); pl.path([[0, -0.3], [0.12, -0.75]], { color: c, width: 3.5 });
      return;
    }
    if (cda < 0.3) {                                         // head down: a streamlined vertical body
      pl.path([[0, 0.55], [0, -0.35]], { color: c, width: 7 }); pl.circle(0, -0.5, 0.14, { fill: c, color: c, width: 1 });
      pl.path([[0, 0.55], [-0.1, 0.95]], { color: c, width: 3.5 }); pl.path([[0, 0.55], [0.1, 0.95]], { color: c, width: 3.5 });
      pl.path([[0, -0.25], [-0.12, 0.15]], { color: c, width: 3 }); pl.path([[0, -0.25], [0.12, 0.15]], { color: c, width: 3 });
      return;
    }
    // belly to earth, seen from the side: spread out flat
    pl.path([[-0.55, 0], [0.4, 0]], { color: c, width: 8 }); pl.circle(0.58, 0.02, 0.14, { fill: c, color: c, width: 1 });
    pl.path([[0.3, 0], [0.45, 0.32], [0.75, 0.42]], { color: c, width: 3.5 });
    pl.path([[-0.5, 0], [-0.8, 0.28], [-1.0, 0.24]], { color: c, width: 3.5 });
  }

  F.draw(draw);
  F.caption('Quadratic drag $D = \\tfrac12\\rho C_D A v^2$ with $C_D A$ fixed, and the air density held at its value for the chosen altitude — a real fall from high up meets denser air as it descends. Both force arrows share one scale; the dashed grey line is a fall with no air at all. $g = 9.8\\ \\text{m/s}^2$.');
  return { get: (k) => F.params[k] };
}

function fmtN(v) {
  const a = Math.abs(v);
  if (a >= 1e4) return `${trim(v / 1e3)} kN`;
  if (a >= 100) return `${Math.round(v)} N`;
  return `${trim(v)} N`;
}

/** Node-side check used by the content tests. */
export function validate(P0) {
  const P = { ...defaults, ...P0 }, problems = [];
  if (!(P.m > 0)) problems.push('m must be positive');
  if (!(P.CdA > 0)) problems.push('CdA must be positive');
  if (P.rho !== undefined && !(P.rho > 0)) problems.push('rho must be positive');
  if (!(P.alt >= 0 && P.alt <= 40)) problems.push('alt must be in [0, 40] km');
  if (!ICONS.includes(P.icon)) problems.push(`icon must be one of ${ICONS.join(', ')}`);
  if (!['both', 'graph', 'body'].includes(P.show)) problems.push('show must be both, graph or body');
  const wanted = P.sliders === true ? ['m', 'CdA', 'alt'] : P.sliders || [];
  for (const k of wanted) if (!['m', 'CdA', 'alt'].includes(k)) problems.push(`unknown slider “${k}” (use m, CdA, alt)`);
  if (P.postures && !POSTURES.some(([v]) => v === P.CdA)) problems.push(`with postures, CdA must be one of ${POSTURES.map(([v]) => v).join(', ')}`);
  const vt = MF.terminalSpeed(P.m, P.CdA, P.rho ?? MF.airDensity(P.alt));
  if (!Number.isFinite(vt)) problems.push('terminal speed is not finite');
  if (P.time < 0 || (P.T !== undefined && P.time > P.T)) problems.push('time must lie in [0, T]');
  return problems;
}
