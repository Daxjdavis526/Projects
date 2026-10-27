// Proper time on a spacetime diagram (c = 1). Two clocks start together at
// event A and meet again at event B. One stays home (a straight worldline);
// the other travels out and back through a turnaround event you can drag.
// Tick marks show each clock's own time: the straight worldline always
// accumulates the most — free motion maximizes proper time.

import { Plot } from '../plot.js';

export const defaults = { T: 10, tx: 3, tt: 5 };

export function mount(F, params) {
  const { canvas } = F.canvas({ aspect: 'square', label: 'Spacetime diagram with a stay-at-home and a travelling clock' });
  const plot = new Plot(canvas, { x: [-6, 6], y: [-0.6, 10.8], equal: true, xlabel: 'x (light-years)', ylabel: 't (years)' });
  const T = params.T;
  const turn = { x: params.tx, t: params.tt };
  const clamp = (x, t) => {
    t = Math.max(0.3, Math.min(T - 0.3, t));
    const lim = Math.min(t, T - t) * 0.985;      // both legs slower than light
    x = Math.max(-lim, Math.min(lim, x));
    return [x, t];
  };
  plot.handle(() => [turn.x, turn.t], (x, t) => { [turn.x, turn.t] = clamp(x, t); });
  plot.onDrag = () => draw();
  F.choice({ key: 'ticks', label: 'Tick marks every', options: [[1, '1 year'], [0.5, '½ year']], value: 1, explain: 'Each tick is one unit of the clock’s own (proper) time.' });
  F.onChange(() => draw());

  const tau = (dx, dt) => Math.sqrt(Math.max(0, dt * dt - dx * dx));

  function ticksAlong(x0, t0, x1, t1, step) {
    const total = tau(x1 - x0, t1 - t0);
    const pts = [];
    for (let s = step; s < total - 1e-9; s += step) { const f = s / total; pts.push([x0 + (x1 - x0) * f, t0 + (t1 - t0) * f]); }
    return { total, pts };
  }

  function draw() {
    plot.clear();
    // light cones from A and B
    plot.line(0, 0, 6, 6, { color: 'warn', width: 1, dash: [5, 5], alpha: 0.6 });
    plot.line(0, 0, -6, 6, { color: 'warn', width: 1, dash: [5, 5], alpha: 0.6 });
    plot.line(0, T, 6, T - 6, { color: 'warn', width: 1, dash: [5, 5], alpha: 0.6 });
    plot.line(0, T, -6, T - 6, { color: 'warn', width: 1, dash: [5, 5], alpha: 0.6 });
    plot.text('light', 4.2, 4.6, { color: 'warn', size: 11 });
    const step = F.params.ticks;
    // stay-at-home clock
    plot.line(0, 0, 0, T, { color: 'accent2', width: 3 });
    const home = ticksAlong(0, 0, 0, T, step);
    for (const [x, t] of home.pts) plot.line(x - 0.18, t, x + 0.18, t, { color: 'accent2', width: 2 });
    // traveller
    const a = ticksAlong(0, 0, turn.x, turn.t, step);
    const b = ticksAlong(turn.x, turn.t, 0, T, step);
    plot.path([[0, 0], [turn.x, turn.t], [0, T]], { color: 'gold', width: 3 });
    // continue the tick spacing across the corner
    const trav = [];
    const total = a.total + b.total;
    for (let s = step; s < total - 1e-9; s += step) {
      if (s <= a.total) { const f = s / a.total; trav.push([turn.x * f, turn.t * f]); }
      else { const f = (s - a.total) / b.total; trav.push([turn.x + (0 - turn.x) * f, turn.t + (T - turn.t) * f]); }
    }
    for (const [x, t] of trav) plot.point(x, t, { r: 2.6, color: 'gold' });
    plot.point(0, 0, { color: 'ink', label: 'A: depart' });
    plot.point(0, T, { color: 'ink', label: 'B: reunion' });
    plot.drawHandles();
    const v1 = Math.abs(turn.x) / turn.t, v2 = Math.abs(turn.x) / (T - turn.t);
    F.readout([
      ['home clock $\\tau_\\text{home}$', `${home.total.toFixed(2)}\\,\\mathrm{yr}`],
      ['travelling clock $\\tau_\\text{trav}$', `${total.toFixed(2)}\\,\\mathrm{yr}`],
      ['speeds out / back', `${v1.toFixed(2)}c\\;/\\;${v2.toFixed(2)}c`],
      ['difference', `${(home.total - total).toFixed(2)}\\,\\mathrm{yr}`],
    ]);
  }
  F.draw(draw);
  F.caption('Drag the gold turnaround event. Units: years and light-years, so light moves at 45°. Each leg is taken at constant speed and the turnaround is instantaneous — an idealization; real accelerations change the numbers but never the conclusion.');
  return { get: (k) => (k === 'point' ? { x: turn.x, y: turn.t } : F.params[k]) };
}
