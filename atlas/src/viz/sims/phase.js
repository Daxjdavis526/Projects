// Phase portraits of a 2D system x′ = f(x, y), y′ = g(x, y) — or, with
// `slope: true`, the slope field of a single equation y′ = f(t, y) with
// Euler and RK4 approximations from a starting point you drag. Click anywhere
// on the portrait to launch a trajectory (integrated both ways with RK4).

import { Plot } from '../plot.js';
import { fn } from '../model/exprfn.js';
import { rk4 } from '../model/numeric.js';

export const defaults = { fx: 'y', fy: '-x - 0.3*y', x: [-3, 3], y: [-3, 3], seeds: [[2, 0], [0, 2.5]] };

export function mount(F, P) {
  const { canvas } = F.canvas({ aspect: 'square', label: P.slope ? 'A slope field with numerical solutions' : 'A phase portrait — click to add a trajectory' });
  for (const s of P.sliders || []) F.slider(s);
  const keys = (P.sliders || []).map((s) => s.key);
  const plot = new Plot(canvas, { x: P.x, y: P.y, equal: !P.slope, xlabel: P.slope ? 't' : (P.xlabel || 'x'), ylabel: P.slope ? 'y' : (P.ylabel || 'y') });
  const E = () => { const e = {}; for (const k of keys) e[k] = F.params[k]; return e; };
  let seeds = (P.seeds || []).map((s) => s.slice());
  const start = { t: P.start?.[0] ?? P.x[0], y: P.start?.[1] ?? 1 };
  if (P.slope) {
    const [hMin, hMax] = P.hRange || [0.05, 1];          // match the step to the time span shown
    F.slider({ key: 'h', label: 'Euler step $h$', min: hMin, max: hMax, step: (hMax - hMin) / 40, value: P.h ?? (hMin + hMax) / 2, unit: '', explain: 'Smaller steps follow the true curve more closely; Euler’s error shrinks in proportion to $h$.' });
    plot.handle(() => [start.t, start.y], (t, y) => { start.t = t; start.y = y; });
    plot.onDrag = () => draw();
  } else {
    canvas.addEventListener('click', (e) => {
      const r = canvas.getBoundingClientRect();
      seeds.push([plot.ix(e.clientX - r.left), plot.iy(e.clientY - r.top)]);
      if (seeds.length > 12) seeds.shift();
      draw();
    });
    F.button({ label: 'Clear trajectories', onClick: () => { seeds = []; draw(); } });
  }
  F.onChange(() => draw());

  function draw() {
    plot.clear();
    const env = E();
    if (P.slope) {
      const f = fn(P.f, ['t', 'y', ...keys]);
      const fy = (t, y) => f({ ...env, t, y });
      const nx = 22, ny = 16;
      for (let i = 0; i <= nx; i++) for (let j = 0; j <= ny; j++) {
        const t = plot.vx0 + (plot.vx1 - plot.vx0) * i / nx, y = plot.vy0 + (plot.vy1 - plot.vy0) * j / ny;
        const m = fy(t, y);
        if (!Number.isFinite(m)) continue;
        // direction of slope m on screen: world (1, m) scaled by pixels per unit
        const kx = (plot.R - plot.L) / (plot.vx1 - plot.vx0), ky = (plot.B - plot.T) / (plot.vy1 - plot.vy0);
        const ex = kx, ey = -m * ky, el = Math.hypot(ex, ey);
        const half = 0.35 * Math.min((plot.R - plot.L) / nx, (plot.B - plot.T) / ny);
        const cx = plot.X(t), cy = plot.Y(y);
        plot.ctx.strokeStyle = plot.col.ink3; plot.ctx.lineWidth = 1.2;
        plot.ctx.beginPath(); plot.ctx.moveTo(cx - (ex / el) * half, cy - (ey / el) * half); plot.ctx.lineTo(cx + (ex / el) * half, cy + (ey / el) * half); plot.ctx.stroke();
      }
      // RK4 "truth" (fine steps) and Euler with step h
      const T1 = plot.vx1;
      const fine = [[start.t, start.y]];
      let y = [start.y], t = start.t;
      const hf = (T1 - start.t) / 800;
      for (let k = 0; k < 800; k++) { y = rk4((tt, yy) => [fy(tt, yy[0])], t, y, hf); t += hf; fine.push([t, y[0]]); }
      plot.path(fine, { color: 'accent', width: 2.4 });
      const h = F.params.h;
      const eu = [[start.t, start.y]];
      let ye = start.y; t = start.t;
      while (t < T1 - 1e-9) { ye = ye + h * fy(t, ye); t += h; eu.push([t, ye]); }
      plot.path(eu, { color: 'warn', width: 2 });
      for (const [a, b] of eu) plot.point(a, b, { color: 'warn', r: 3 });
      plot.drawHandles();
      const tEnd = eu[eu.length - 1][0];
      const exactEnd = fine.reduce((best, p) => (Math.abs(p[0] - tEnd) < Math.abs(best[0] - tEnd) ? p : best), fine[0])[1];
      F.readout([['start', `(${start.t.toFixed(2)}, ${start.y.toFixed(2)})`], ['Euler at end', eu[eu.length - 1][1].toFixed(4)], ['RK4 (fine) at end', exactEnd.toFixed(4)], ['Euler error', Math.abs(eu[eu.length - 1][1] - exactEnd).toExponential(2)]]);
      return;
    }
    const f = fn(P.fx, ['x', 'y', ...keys]), g = fn(P.fy, ['x', 'y', ...keys]);
    const vec = (x, y) => [f({ ...env, x, y }), g({ ...env, x, y })];
    const n = 18;
    for (let i = 0; i <= n; i++) for (let j = 0; j <= n; j++) {
      const x = plot.vx0 + (plot.vx1 - plot.vx0) * i / n, y = plot.vy0 + (plot.vy1 - plot.vy0) * j / n;
      const [u, v] = vec(x, y);
      const m = Math.hypot(u, v);
      if (!(m > 1e-12) || !Number.isFinite(m)) continue;
      const s = ((plot.vx1 - plot.vx0) / n) * 0.42 / m;
      plot.arrow(x - u * s / 2, y - v * s / 2, x + u * s / 2, y + v * s / 2, { color: 'ink4', width: 1.1, head: 5 });
    }
    const pal = ['accent', 'gold', 'good', 'violet', 'teal', 'warn', 'bad'];
    seeds.forEach(([x0, y0], k) => {
      for (const dir of [1, -1]) {
        const pts = [[x0, y0]];
        let s = [x0, y0];
        for (let i = 0; i < 1500; i++) {
          s = rk4((t, z) => vec(z[0], z[1]).map((q) => q * dir), 0, s, 0.01);
          if (!Number.isFinite(s[0]) || Math.abs(s[0]) > 1e3 || Math.abs(s[1]) > 1e3) break;
          pts.push(s);
        }
        plot.path(pts, { color: pal[k % pal.length], width: 2 });
      }
      plot.point(x0, y0, { color: pal[k % pal.length], r: 3.5 });
    });
    if (P.matrix) {
      // each entry: a number, a slider key or an expression of the slider keys ('-b')
      const [a, b, c, d] = P.matrix.map((m) => (typeof m === 'number' ? m : m in env ? env[m] : fn(m, Object.keys(env))(env)));
      const tr = a + d, det = a * d - b * c, disc = tr * tr - 4 * det;
      const kind = det < 0 ? 'saddle' : disc < 0 ? (Math.abs(tr) < 1e-9 ? 'center' : tr < 0 ? 'stable spiral' : 'unstable spiral') : tr < 0 ? 'stable node' : 'unstable node';
      F.readout([['trace', tr.toFixed(3)], ['determinant', det.toFixed(3)], ['$\\tau^2 - 4\\Delta$', disc.toFixed(3)], ['equilibrium type', `\\text{${kind}}`]]);
    }
  }
  F.draw(draw);
  F.caption(P.caption || (P.slope ? 'Blue: an accurate RK4 solution. Orange: Euler’s method with step $h$ — each step follows the slope at its start.' : 'Click to launch trajectories (traced forward and backward in time with RK4). Arrows show direction only.'));
}

export function validate(P) {
  const keys = (P.sliders || []).map((s) => s.key);
  const out = [];
  const tryF = (src, vars, w) => { try { fn(src, [...vars, ...keys]); } catch (e) { out.push(`phase ${w}: “${src}” — ${e.message}`); } };
  if (P.slope) tryF(P.f, ['t', 'y'], 'f');
  else { tryF(P.fx, ['x', 'y'], 'fx'); tryF(P.fy, ['x', 'y'], 'fy'); }
  return out;
}
