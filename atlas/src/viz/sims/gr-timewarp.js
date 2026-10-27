// Maximal aging near Earth's surface. Left: a spacetime diagram with time
// running left to right and height up. A clock is thrown up from the ground
// at event A (t = 0) and caught at event B (t = T). The blue worldline stays
// on the ground; the gold dashed one is real free fall; the violet one is a
// trial path whose apex you drag. The bands brighten upward because clocks
// higher up tick faster (by gh/c²). Right: the aging meter — the trial
// clock's extra proper time over the ground clock against the apex height,
// which peaks exactly at free fall. Physics in model/gr-aging.js (tested).

import { Plot } from '../plot.js';
import { SHAPES, budget, freeFall, G_EARTH } from '../model/gr-aging.js';

export const defaults = { T: 2, H: 2.5, shape: 'arc', shapes: true, meter: true };
const H_MAX = 20, T_MIN = 0.6, T_MAX = 4;

export function validate(P) {
  const p = [];
  if (!SHAPES[P.shape]) p.push(`gr-timewarp: unknown shape “${P.shape}” (use ${Object.keys(SHAPES).join(', ')})`);
  if (!(P.T >= T_MIN && P.T <= T_MAX)) p.push(`gr-timewarp: T must lie in [${T_MIN}, ${T_MAX}] s`);
  if (!(P.H >= 0 && P.H <= H_MAX)) p.push(`gr-timewarp: H must lie in [0, ${H_MAX}] m`);
  return p;
}

export function mount(F, P) {
  const { canvas } = F.canvas({ aspect: 'wide', label: 'Worldlines of a thrown clock on a height–time diagram, and how much time each clock records' });
  F.slider({ key: 'H', label: 'Apex of the violet trial path $H$', min: 0, max: H_MAX, step: 0.05, value: P.H, unit: '\\mathrm{m}', explain: 'Or drag the round handle. The gold dashed path is real free fall.' });
  F.slider({ key: 'T', label: 'Time from A to B, $T$', min: T_MIN, max: T_MAX, step: 0.05, value: P.T, unit: '\\mathrm{s}', explain: 'Every path leaves the ground at A and is back on it at B.' });
  if (P.shapes) F.choice({ key: 'shape', label: 'Shape of the trial path', options: Object.entries(SHAPES).map(([k, s]) => [k, s.label]), value: P.shape, explain: 'Arc: smooth, like a throw. Up, down: steady speed up, then down. Hover: rise fast, wait, drop fast.' });
  else F.params.shape = P.shape;
  F.onChange(() => draw());

  const left = new Plot(canvas, { x: [0, 2], y: [0, 6], xlabel: 't (s)', ylabel: 'h (m)' });
  const right = new Plot(canvas, { x: [0, 10], y: [-1, 1], xlabel: 'apex H (m)' });
  left.handle(() => [F.params.T / 2, F.params.H], (x, y) => { F.set('H', Math.max(0, Math.min(H_MAX, Math.round(y / 0.05) * 0.05))); });

  const net16 = (shape, H, T) => budget(shape, H, T).net / 1e-16;

  function clip(pl, fn) {
    const g = pl.ctx;
    g.save(); g.beginPath(); g.rect(pl.L - 1, pl.T - 1, pl.R - pl.L + 2, pl.B - pl.T + 2); g.clip();
    fn(); g.restore();
  }

  function draw() {
    const W = canvas.clientWidth || 600;
    const meter = P.meter;
    const split = meter ? 0.58 : 1;
    left.o.pad = { l: 44, r: meter ? W * (1 - split) + 6 : 14, t: 14, b: 34 };
    right.o.pad = { l: W * split + 34, r: 12, t: 26, b: 34 };
    const { T, H, shape } = F.params;
    const S = SHAPES[shape];
    const Hff = freeFall.apex(T);
    const top = Math.max(H, Hff, 1) * 1.18 + 0.3;
    left.setView([-0.07 * T, 1.07 * T], [-0.13 * top, top]);
    left.clear();
    // clock-rate bands: brighter higher up
    clip(left, () => {
      const N = 10;
      for (let k = 0; k < N; k++) left.rect(left.vx0, (k * top) / N, left.vx1 - left.vx0, top / N, { color: 'gold', alpha: 0.015 + 0.013 * k, stroke: false });
    });
    left.text('clocks tick faster ↑', left.R - 6, left.T + 10, { screen: true, align: 'right', color: 'gold', size: 11 });
    clip(left, () => {
      left.line(0, 0, T, 0, { color: 'accent2', width: 3.2 });
      left.fn((t) => freeFall.h(T, t), { domain: [0, T], color: 'gold', width: 2.2, dash: [6, 5] });
      const pts = []; for (let i = 0; i <= 240; i++) { const t = (T * i) / 240; pts.push([t, S.h(H, T, t)]); }
      left.path(pts, { color: 'violet', width: 2.8 });
    });
    const tl = 0.8 * T;
    left.text('free fall', tl, freeFall.h(T, tl), { dx: 8, dy: -2, color: 'gold', size: 11, weight: 650 });
    left.text('ground clock', T / 2, 0, { dy: 12, align: 'center', color: 'accent2', size: 11, weight: 650 });
    left.point(0, 0, { color: 'ink', r: 4 }); left.text('A', 0, 0, { dx: -10, dy: -11, align: 'center', color: 'ink', size: 12, weight: 700 });
    left.point(T, 0, { color: 'ink', r: 4 }); left.text('B', T, 0, { dx: 10, dy: -11, align: 'center', color: 'ink', size: 12, weight: 700 });
    left.drawHandles();

    const b = budget(shape, H, T), best = freeFall.gain(T);
    if (meter) {
      right.resize(); right.refreshTheme();
      const peak = best / 1e-16;
      const Hm = Math.max(2.3 * Hff, H * 1.12, 1);
      right.setView([0, Hm], [-0.75 * peak, 1.3 * peak]);
      right.grid(); right.axes();
      clip(right, () => {
        right.line(0, peak, Hm, peak, { color: 'gold', width: 1.4, dash: [5, 4] });
        right.fn((x) => net16(shape, x, T), { color: 'violet', width: 2.4 });
        const d = 1e-3 * Hm, slope = (net16(shape, H + d, T) - net16(shape, H - d, T)) / (2 * d), w = 0.14 * Hm;
        right.line(H - w, net16(shape, H, T) - slope * w, H + w, net16(shape, H, T) + slope * w, { color: 'violet', width: 1.4, alpha: 0.7 });
        right.point(H, net16(shape, H, T), { color: 'violet', r: 5 });
      });
      right.text('free fall', right.R - 4, right.Y(peak) - 9, { screen: true, align: 'right', color: 'gold', size: 11 });
      right.text(W < 480 ? 'aging (10⁻¹⁶ s)' : 'aging meter (10⁻¹⁶ s)', right.L + 2, 12, { screen: true, color: 'ink2', size: 11, weight: 650 });
    }
    const s = (x) => (x === 0 ? '0' : `${x < 0 ? '-' : '+'}${sci(Math.abs(x))}`);
    F.readout([
      ['height bonus', `${s(b.bonus)}\\,\\mathrm{s}`],
      ['speed penalty', `${s(-b.penalty)}\\,\\mathrm{s}`],
      ['violet clock gains', `${s(b.net)}\\,\\mathrm{s}`],
      ['free-fall clock gains', `${s(best)}\\,\\mathrm{s}`],
    ]);
  }
  F.draw(draw);
  F.caption('Gains are over the clock left on the ground, in weak, uniform gravity (g = 9.81 m/s²): a clock at height h runs fast by gh/c², a clock moving at speed v runs slow by v²/2c². Heights and times are to scale; the brightening bands only mark the direction of faster clocks. The real gains are about 10⁻¹⁶ s: far too small to notice, yet they decide the path.');
  return { get: (k) => F.params[k] };
}

function sci(x) {
  const [m, e] = x.toExponential(2).split('e');
  return `${m}\\times10^{${parseInt(e, 10)}}`;
}
void G_EARTH;
