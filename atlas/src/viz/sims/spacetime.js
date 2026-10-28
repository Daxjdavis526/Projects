// A Minkowski diagram (c = 1). The black axes belong to the frame you stand
// in; the gold axes are those of an observer moving at β. Drag the events;
// the readout gives their coordinates in both frames and the invariant
// interval between them. Lines of simultaneity, the light cone and the
// hyperbolae of constant interval can be switched on.

import { Plot } from '../plot.js';
import { gamma, boost } from '../model/relativity.js';

export const defaults = { beta: 0.5, events: [[2, 1], [3, -1.5]], range: 5, simultaneity: true, hyperbolae: true };

export function mount(F, P) {
  const { canvas } = F.canvas({ aspect: 'square', label: 'A spacetime diagram with two observers' });
  const R = P.range;
  const plot = new Plot(canvas, { x: [-R, R], y: [-R * 0.2, R * 1.4], equal: true, xlabel: 'x', ylabel: 't' });
  F.slider({ key: 'beta', label: 'Velocity of the moving frame $\\beta = v/c$', min: -0.95, max: 0.95, step: 0.01, value: P.beta, unit: '', explain: 'Its time axis is the worldline $x = \\beta t$; its space axis tilts by the same angle toward the light cone.' });
  F.toggle({ key: 'sim', label: 'Lines of simultaneity', value: P.simultaneity, explain: 'Events on a gold dashed line happen at the same $t\'$ for the moving observer.' });
  F.toggle({ key: 'hyp', label: 'Hyperbolae of constant interval', value: P.hyperbolae, explain: 'Every observer agrees on $t^2 - x^2$; a boost slides events along these curves.' });
  // names: labels for the events (default A, B, …; a multiple-choice problem should use others, P, Q …)
  const ev = P.events.map(([t, x], k) => ({ t, x, name: P.names?.[k] ?? String.fromCharCode(65 + k) }));
  for (const e of ev) plot.handle(() => [e.x, e.t], (x, t) => { e.x = x; e.t = t; });
  plot.onDrag = () => draw();
  F.onChange(() => draw());

  function draw() {
    plot.clear();
    const b = F.params.beta, g = gamma(b);
    // light cone
    plot.line(-R * 1.5, R * 1.5, R * 1.5, -R * 1.5, { color: 'warn', width: 1, dash: [5, 5], alpha: 0.5 });
    plot.line(-R * 1.5, -R * 1.5, R * 1.5, R * 1.5, { color: 'warn', width: 1, dash: [5, 5], alpha: 0.5 });
    if (F.params.hyp) for (const s of [1, 2, 3, 4]) {
      plot.curve((u) => s * Math.sinh(u), (u) => s * Math.cosh(u), -2.5, 2.5, { color: 'ink3', width: 1, alpha: 0.6 });
      plot.curve((u) => s * Math.cosh(u), (u) => s * Math.sinh(u), -2.5, 2.5, { color: 'ink3', width: 1, alpha: 0.35 });
    }
    // moving frame axes: t' axis x = βt, x' axis t = βx, with tick marks at unit proper intervals
    plot.line(-R * b * 1.4, -R * 1.4, R * b * 1.4, R * 1.4, { color: 'gold', width: 2.2 });
    plot.line(-R * 1.4, -R * b * 1.4, R * 1.4, R * b * 1.4, { color: 'gold', width: 2.2 });
    for (let k = 1; k <= 6; k++) {
      plot.point(g * b * k, g * k, { color: 'gold', r: 2.5 });
      plot.point(g * k, g * b * k, { color: 'gold', r: 2.5 });
      plot.point(-g * k, -g * b * k, { color: 'gold', r: 2.5 });
    }
    plot.text("t′", g * b * 5.6, g * 5.6, { color: 'gold', dx: 8, weight: 700 });
    plot.text("x′", g * 5.2, g * b * 5.2, { color: 'gold', dy: -12, weight: 700 });
    // events
    const rows = [];
    for (const e of ev) {
      const [tp, xp] = boost(e.t, e.x, b);
      if (F.params.sim) plot.line(e.x - 6, e.t - 6 * b, e.x + 6, e.t + 6 * b, { color: 'gold', width: 1, dash: [3, 4], alpha: 0.6 });
      plot.point(e.x, e.t, { color: 'accent2', r: 5, label: e.name });
      rows.push([`${e.name}: $(t, x)$`, `(${e.t.toFixed(2)}, ${e.x.toFixed(2)})`], [`${e.name}: $(t', x')$`, `(${tp.toFixed(2)}, ${xp.toFixed(2)})`]);
    }
    if (ev.length >= 2) {
      const dt = ev[1].t - ev[0].t, dx = ev[1].x - ev[0].x;
      const s2 = dt * dt - dx * dx;
      rows.push(['$\\Delta t^2 - \\Delta x^2$', s2.toFixed(3)], ['separation', s2 > 1e-9 ? '\\text{timelike}' : s2 < -1e-9 ? '\\text{spacelike}' : '\\text{lightlike}']);
    }
    rows.push(['$\\gamma$', g.toFixed(4)]);
    plot.drawHandles();
    F.readout(rows);
  }
  F.draw(draw);
  F.caption('Units with $c = 1$: light travels at 45°. Gold dots mark one unit of the moving observer’s own time and distance — they sit on the hyperbolae, which is why moving rulers look short and moving clocks look slow.');
  return { get: (k) => F.params[k] };
}

/** Node-side check used by the content tests. */
export function validate(P) {
  const p = [];
  if (!Array.isArray(P.events) || !P.events.every((e) => Array.isArray(e) && e.length === 2 && e.every(Number.isFinite))) p.push('spacetime: events must be [[t, x], …] with finite numbers');
  if (P.names && (!Array.isArray(P.names) || P.names.length < (P.events || []).length)) p.push('spacetime: names needs one label per event');
  if (!(Math.abs(P.beta) < 1)) p.push('spacetime: beta must lie between −1 and 1');
  return p;
}
