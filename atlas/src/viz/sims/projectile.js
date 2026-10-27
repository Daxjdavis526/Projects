// Projectile motion with adjustable launch speed, angle, height and gravity,
// and optional quadratic air drag. The trajectory is integrated (RK4); the
// velocity vector and its components ride along with the projectile.

import { Plot } from '../plot.js';
import { rk4 } from '../model/numeric.js';

export const defaults = { v0: 20, angle: 45, h0: 0, g: 9.8, drag: false, k: 0.02, ghost: true };

export function mount(F, P) {
  const { canvas } = F.canvas({ aspect: 'wide', label: 'A projectile’s trajectory' });
  F.slider({ key: 'v0', label: 'Launch speed $v_0$', min: 1, max: 50, step: 0.5, value: P.v0, unit: '\\mathrm{m/s}', explain: 'Speed leaving the launcher.' });
  F.slider({ key: 'angle', label: 'Launch angle $\\theta$', min: 0, max: 90, step: 1, value: P.angle, unit: '^\\circ', explain: 'Measured up from the horizontal.' });
  F.slider({ key: 'h0', label: 'Launch height $h$', min: 0, max: 50, step: 1, value: P.h0, unit: '\\mathrm{m}', explain: 'Height above the landing level.' });
  F.choice({ key: 'g', label: 'Gravity $g$', options: [[9.8, 'Earth 9.8'], [1.62, 'Moon 1.62'], [3.71, 'Mars 3.71'], [24.8, 'Jupiter 24.8']], value: P.g, explain: 'In $\\mathrm{m/s^2}$.' });
  F.toggle({ key: 'drag', label: 'Air drag', value: P.drag, explain: 'Quadratic drag $\\vec a_\\text{drag} = -k|\\vec v|\\vec v$ with $k = 0.02\\ \\mathrm{m^{-1}}$ (a dense ball).' });
  const S = { t: 0, running: false, traj: [] };
  const play = F.button({ label: 'Launch', primary: true, onClick: () => { S.t = 0; S.running = true; anim.start(); } });
  void play;
  F.onChange(() => { S.running = false; S.t = Infinity; draw(); });

  const plot = new Plot(canvas, { x: [0, 100], y: [0, 50], equal: true, xlabel: 'x (m)', ylabel: 'y (m)' });

  function simulate() {
    const { v0, angle, h0, g, drag } = F.params;
    const th = (angle * Math.PI) / 180;
    let y = [0, h0, v0 * Math.cos(th), v0 * Math.sin(th)];
    const k = drag ? P.k : 0;
    const f = (t, s) => { const sp = Math.hypot(s[2], s[3]); return [s[2], s[3], -k * sp * s[2], -g - k * sp * s[3]]; };
    const out = [[0, ...y]];
    let t = 0;
    const dt = 0.005 * Math.max(1, v0 / 20);
    for (let i = 0; i < 200000; i++) {
      const ny = rk4(f, t, y, dt);
      t += dt;
      if (ny[1] < 0) { // interpolate to the ground
        const fr = y[1] / (y[1] - ny[1]);
        out.push([t - dt + fr * dt, y[0] + fr * (ny[0] - y[0]), 0, ny[2], ny[3]]);
        break;
      }
      y = ny; out.push([t, ...y]);
    }
    return out;
  }
  const anim = F.animate((dt) => {
    if (!S.running) return;
    S.t += dt * 1.5;
    if (S.t >= S.traj[S.traj.length - 1][0]) { S.t = Infinity; S.running = false; }
    draw(true);
  }, { force: true });

  function draw(keep) {
    if (!keep) S.traj = simulate();
    const tr = S.traj;
    const xmax = Math.max(10, ...tr.map((p) => p[1])) * 1.1, ymax = Math.max(5, ...tr.map((p) => p[2])) * 1.25;
    plot.setView([0, xmax], [0, ymax]);
    plot.clear();
    // no-drag ghost for comparison
    if (F.params.drag) {
      const { v0, angle, h0, g } = F.params, th = angle * Math.PI / 180;
      plot.curve((t) => v0 * Math.cos(th) * t, (t) => h0 + v0 * Math.sin(th) * t - 0.5 * g * t * t, 0, (v0 * Math.sin(th) + Math.sqrt((v0 * Math.sin(th)) ** 2 + 2 * g * h0)) / g, { color: 'ink3', width: 1.2, dash: [5, 5] });
    }
    const upTo = Number.isFinite(S.t) ? tr.filter((p) => p[0] <= S.t) : tr;
    plot.path(tr.map((p) => [p[1], p[2]]), { color: 'accent', width: 1.4, alpha: Number.isFinite(S.t) ? 0.3 : 1 });
    plot.path(upTo.map((p) => [p[1], p[2]]), { color: 'accent', width: 2.4 });
    const cur = upTo[upTo.length - 1] || tr[0];
    const vs = 0.06 * Math.max(xmax, ymax) / Math.max(1, F.params.v0) * 6;
    plot.arrow(cur[1], cur[2], cur[1] + cur[3] * vs, cur[2] + cur[4] * vs, { color: 'gold', width: 2.2, label: 'v' });
    plot.arrow(cur[1], cur[2], cur[1] + cur[3] * vs, cur[2], { color: 'good', width: 1.6 });
    plot.arrow(cur[1], cur[2], cur[1], cur[2] + cur[4] * vs, { color: 'good', width: 1.6 });
    plot.point(cur[1], cur[2], { color: 'ink', r: 6 });
    const top = tr.reduce((a, p) => (p[2] > a[2] ? p : a), tr[0]);
    plot.point(top[1], top[2], { color: 'warn', r: 3.5, label: `max ${top[2].toFixed(1)} m` });
    const end = tr[tr.length - 1];
    F.readout([
      ['range', `${end[1].toFixed(2)}\\,\\mathrm{m}`], ['max height', `${top[2].toFixed(2)}\\,\\mathrm{m}`],
      ['flight time', `${end[0].toFixed(2)}\\,\\mathrm{s}`], ['$v_x$ now', `${cur[3].toFixed(2)}\\,\\mathrm{m/s}`], ['$v_y$ now', `${cur[4].toFixed(2)}\\,\\mathrm{m/s}`],
    ]);
  }
  F.draw(() => draw());
  F.caption('Point mass, flat ground, uniform gravity. Without drag the path is an exact parabola; with drag it is integrated numerically (RK4). Scale: metres on both axes.');
  return { get: (k) => F.params[k] };
}
