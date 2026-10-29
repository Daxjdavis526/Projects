// The brachistochrone race. Frictionless beads are released together from
// rest at A and slide to B along different wires — the straight line, the
// circular arc that leaves A heading straight down, the cycloid, a power curve
// y ∝ x^p whose steepness at the start is a slider, and a "drop" (straight
// down, then level, turning the corner without losing speed). Each bead's
// speed is √(2gy) at depth y; its motion along the wire comes from the
// travel-time integral ∫ ds/√(2gy), computed numerically, so the race is run
// in true relative time (slowed for viewing). The cycloid wins every race.
//
// mode 'tauto': the tautochrone. Beads released from different heights on an
// upturned cycloid all reach the bottom together, after π√(a/g).
// The physics is model/cm2-var.js (tested in test/cm2-var.test.mjs).
//
//   { type: 'cm2-race', params: {
//       mode: 'race',                       // or 'tauto'
//       x1: 1.5, y1: 1,                     // race: B is x1 across and y1 below A (m)
//       curves: ['line', 'arc', 'cycloid'], // any of line arc cycloid power drop
//       p: 0.5,                             // the power curve's exponent (0.3–1.5; below 1 it starts steep)
//       sliders: [],                        // race: any of x1 y1 p
//       a: 0.5, starts: [30, 90, 150],      // tauto: the cycloid's size a (m) and release angles θ₀ (deg, 0–180)
//       times: true,                        // the finishing times (readouts and labels); false hides them
//       play: true,                         // a Play button (nothing moves until it is pressed)
//       at: 0,                              // a still picture: where the beads are at this time (s)
//       slow: 4,                            // slow motion: real seconds per simulated second
//       labels: true,                       // A, B and the curves' names
//   } }

import { Plot } from '../plot.js';
import * as V from '../model/cm2-var.js';

export const defaults = {
  mode: 'race', x1: 1.5, y1: 1, curves: ['line', 'arc', 'cycloid'], p: 0.5, sliders: [], a: 0.5, starts: [30, 90, 150],
  times: true, play: true, at: 0, slow: 4, labels: true,
};
const COLOR = { line: 'ink3', arc: 'violet', cycloid: 'accent', power: 'good', drop: 'gold' };
const NAME = { line: 'straight line', arc: 'circular arc', cycloid: 'cycloid', power: 'steep curve', drop: 'drop and level' };
const NAME_TEX = { line: 'line', arc: 'arc', cycloid: 'cycloid', power: 'steep curve', drop: 'drop' };
const trim = (x, n = 3) => String(+(+x).toPrecision(n));

export function mount(F, P0) {
  const P = { ...defaults, ...P0 };
  const tauto = P.mode === 'tauto';
  const { canvas } = F.canvas({ aspect: tauto ? 'wide' : '', label: tauto ? 'Beads released from different heights on a cycloid bowl' : 'Beads racing from A to B along different wires' });
  const sl = P.sliders || [];
  if (!tauto) {
    if (sl.includes('x1')) F.slider({ key: 'x1', label: 'B across $x_B$', min: 0.3, max: 3, step: 0.05, value: P.x1, unit: '\\mathrm{m}', explain: 'How far B lies to the side of A.' });
    else F.params.x1 = P.x1;
    if (sl.includes('y1')) F.slider({ key: 'y1', label: 'B below $y_B$', min: 0.3, max: 2, step: 0.05, value: P.y1, unit: '\\mathrm{m}', explain: 'How far B lies below A. The beads start from rest at A.' });
    else F.params.y1 = P.y1;
    if (sl.includes('p') && P.curves.includes('power')) F.slider({ key: 'p', label: 'Steep curve: exponent $p$', min: 0.3, max: 1.5, step: 0.05, value: P.p, unit: '', explain: 'The green wire is $y = y_B(x/x_B)^p$: below 1 it plunges at the start, above 1 it starts flat.' });
    else F.params.p = P.p;
  }
  const plot = new Plot(canvas, { x: [0, 1], y: [0, 1], equal: true, xlabel: 'x (m)', ylabel: tauto ? 'height (m)' : 'height (m)', grid: true, yticks: 5 });

  // travel tables, rebuilt when B or p changes
  let tabs = null, key = '';
  const build = () => {
    const k = `${F.params.x1}|${F.params.y1}|${F.params.p}`;
    if (k === key) return;
    key = k;
    tabs = {};
    for (const c of P.curves) tabs[c] = V.travel(V.pathOf(c, +F.params.x1, +F.params.y1, +F.params.p), V.G, 1500, V.gridQ(c, +F.params.p));
  };
  const total = () => (tauto ? V.tautoTime(P.a) : Math.max(...Object.values(tabs).map((t) => t.T)));

  const S = { t: P.at || 0, running: false };
  let btn = null;
  const anim = P.play ? F.animate((dt) => {
    if (!S.running) return;
    S.t += dt / (P.slow || 4);
    const end = tauto ? 2 * V.tautoTime(P.a) : total() * 1.05;
    if (S.t >= end) { S.t = end; S.running = false; btn.textContent = 'Replay'; }
    draw();
  }, { force: true }) : null;
  if (anim) {
    btn = F.button({ label: 'Play', primary: true, onClick: () => {
      if (S.running) { S.running = false; btn.textContent = 'Play'; return; }
      if (btn.textContent === 'Replay') S.t = 0;
      S.running = true; btn.textContent = 'Pause'; anim.start();
    } });
    F.button({ label: 'Reset', onClick: () => { S.running = false; S.t = 0; btn.textContent = 'Play'; draw(); } });
  }
  F.onChange(() => { S.running = false; S.t = 0; if (btn) btn.textContent = 'Play'; draw(); });

  function drawRace() {
    build();
    const x1 = +F.params.x1, y1 = +F.params.y1;
    const top = 0.25 * y1 + 0.12, low = -y1 * 1.12 - 0.08;
    // the arc and cycloid may dip below B
    let deepest = y1;
    for (const c of P.curves) for (const y of tabs[c].ys) deepest = Math.max(deepest, y);
    plot.setView([-0.12 * x1 - 0.1, x1 * 1.12 + 0.1], [Math.min(low, -deepest * 1.06 - 0.06), top]);
    plot.clear();
    for (const c of P.curves) {
      const T = tabs[c], pts = [];
      for (let i = 0; i < T.xs.length; i += 5) pts.push([T.xs[i], -T.ys[i]]);
      pts.push([T.xs[T.xs.length - 1], -T.ys[T.ys.length - 1]]);
      plot.path(pts, { color: COLOR[c], width: c === 'cycloid' ? 2.6 : 2 });
    }
    plot.point(0, 0, { color: 'ink', r: 4.5, label: P.labels ? 'A' : '', ldx: -14, ldy: -8 });
    plot.point(x1, -y1, { color: 'ink', r: 4.5, label: P.labels ? 'B' : '', ldx: 10, ldy: 2 });
    // beads, and finishers in order
    const done = [];
    for (const c of P.curves) {
      const [x, y] = V.positionAt(tabs[c], S.t);
      plot.point(x, -y, { color: COLOR[c], r: 6.5 });
      if (S.t >= tabs[c].T) done.push(c);
    }
    // legend, top right
    if (P.labels) {
      const pad = 10;
      P.curves.forEach((c, i) => {
        const yy = pad + 9 + i * 17;
        const g = plot.ctx;
        g.save(); g.fillStyle = plot.color(COLOR[c]); g.beginPath(); g.arc(plot.R - 132, yy, 5, 0, 2 * Math.PI); g.fill(); g.restore();
        const tlabel = P.times && done.includes(c) ? `  ${trim(tabs[c].T)} s` : '';
        plot.text(NAME[c] + tlabel, plot.R - 122, yy, { screen: true, color: COLOR[c], size: 12 });
      });
    }
    const rows = [['$t$', `${trim(S.t)}\\,\\mathrm{s}`]];
    if (P.times) for (const c of P.curves) rows.push([NAME_TEX[c], `${trim(tabs[c].T)}\\,\\mathrm{s}`]);
    F.readout(P.play ? rows : rows.slice(1));
  }

  function drawTauto() {
    const a = P.a, Tb = V.tautoTime(a);
    const pts = [];
    for (let i = 0; i <= 200; i++) { const th = -Math.PI + (2 * Math.PI * i) / 200; pts.push(V.tautoPoint(a, th)); }
    plot.setView([-Math.PI * a * 1.08, Math.PI * a * 1.08], [-0.15 * a, 2.25 * a]);
    plot.clear();
    plot.path(pts, { color: 'ink2', width: 3 });
    plot.point(0, 0, { color: 'ink', r: 3.5, label: P.labels ? 'bottom' : '', ldx: 0, ldy: 14, lalign: 'center' });
    const cols = ['accent', 'warn', 'good', 'violet'];
    (P.starts || []).forEach((d, i) => {
      const th = V.tautoTheta(a, (d * Math.PI) / 180, S.t);
      const [x0, y0] = V.tautoPoint(a, (d * Math.PI) / 180);
      plot.point(x0, y0, { color: 'bg', ring: cols[i % 4], r: 4 });
      const [x, y] = V.tautoPoint(a, th);
      plot.point(x, y, { color: cols[i % 4], r: 6.5 });
    });
    const rows = [['$t$', `${trim(S.t)}\\,\\mathrm{s}`]];
    if (P.times) rows.push(['to the bottom, every bead', `\\pi\\sqrt{a/g} = ${trim(Tb)}\\,\\mathrm{s}`]);
    F.readout(P.play ? rows : rows.slice(1));
  }

  function draw() { if (tauto) drawTauto(); else drawRace(); }
  F.draw(draw);
  F.caption(tauto
    ? 'Frictionless beads on an upturned cycloid $x = a(\\theta + \\sin\\theta)$, $y = a(1 - \\cos\\theta)$, released from rest at the small rings. Motion slowed down for viewing.'
    : 'Frictionless point beads from rest, $g = 9.8$ m/s²; times from the integral $\\int ds/\\sqrt{2gy}$, computed numerically. The drop turns its corner without losing speed (an idealization). Motion slowed down for viewing.');
  return { get: (k) => F.params[k] };
}

export function validate(P0) {
  const P = { ...defaults, ...P0 }, out = [];
  if (!['race', 'tauto'].includes(P.mode)) out.push("mode must be 'race' or 'tauto'");
  for (const c of P.curves || []) if (!V.KINDS.includes(c)) out.push(`unknown curve “${c}”`);
  if (!(P.x1 >= 0.3 && P.x1 <= 3)) out.push('x1 must lie in [0.3, 3] m');
  if (!(P.y1 >= 0.3 && P.y1 <= 2)) out.push('y1 must lie in [0.3, 2] m');
  if (!(P.p >= 0.3 && P.p <= 1.5)) out.push('p must lie in [0.3, 1.5]');
  for (const s of P.sliders || []) if (!['x1', 'y1', 'p'].includes(s)) out.push(`unknown slider “${s}”`);
  if (!(P.a > 0)) out.push('a must be positive');
  for (const d of P.starts || []) if (!(d > 0 && d <= 180)) out.push('starts are release angles in (0, 180] degrees');
  if (!(P.at >= 0)) out.push('at must be a time ≥ 0');
  return out;
}
