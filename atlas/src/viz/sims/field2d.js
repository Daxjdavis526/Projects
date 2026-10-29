// A 2D vector field F(x, y) = (P, Q) written as expressions, drawn as arrows
// coloured by magnitude, with tracer particles flowing along it, an optional
// potential's level curves, and a draggable probe that reads out the field,
// its divergence and its curl (computed numerically). An optional closed loop
// shows the circulation ∮F·dr against the flux of the curl (Green's theorem).
// readout: false hides every number (so a problem's picture does not print its
// answer); probe: false also removes the probe and its arrow.
//
// The divergence it reads is the 2D one, ∂Fx/∂x + ∂Fy/∂y. For a field that lives in
// the plane (long cylinders, line charges) that is the truth; for a slice through a
// 3D field (a sphere's dipole, a point charge) it is not ∇·F — turn the readout off.

import { Plot, themeColors } from '../plot.js';
import { fn } from '../model/exprfn.js';

export const defaults = { P: '-y', Q: 'x', x: [-3, 3], y: [-3, 3], density: 15, particles: true, loop: null, readout: true, probe: undefined };

export function mount(F, Pp) {
  const { canvas } = F.canvas({ aspect: 'square', label: Pp.alt || 'A vector field with a movable probe' });
  for (const s of Pp.sliders || []) F.slider(s);
  for (const c of Pp.choices || []) F.choice(c);
  const keys = [...(Pp.sliders || []).map((s) => s.key), ...(Pp.choices || []).map((c) => c.key)];
  const plot = new Plot(canvas, { x: Pp.x, y: Pp.y, equal: true, xlabel: 'x', ylabel: 'y' });
  const probe = { x: Pp.probe?.[0] ?? 1, y: Pp.probe?.[1] ?? 0.5 };
  const showProbe = Pp.probe !== false;
  if (showProbe) plot.handle(() => [probe.x, probe.y], (x, y) => { probe.x = x; probe.y = y; });
  plot.onDrag = () => draw();
  const vars = ['x', 'y', ...keys];
  const env = () => { const e = {}; for (const k of keys) e[k] = F.params[k]; return e; };
  const FX = () => { const p = fn(Pp.P, vars), q = fn(Pp.Q, vars), E = env(); return (x, y) => [p({ ...E, x, y }), q({ ...E, x, y })]; };
  let parts = [];
  const seed = () => { parts = Array.from({ length: 140 }, () => ({ x: rnd(plot.vx0, plot.vx1), y: rnd(plot.vy0, plot.vy1), age: Math.random() * 80 })); };
  F.onChange(() => draw());
  if (Pp.particles) F.animate((dt) => {
    const f = FX();
    for (const p of parts) {
      const [u, v] = f(p.x, p.y);
      const sp = Math.hypot(u, v) || 1;
      const step = Math.min(sp, 3) / sp * dt * 0.9;
      p.x += u * step; p.y += v * step; p.age++;
      if (p.age > 120 || p.x < plot.vx0 || p.x > plot.vx1 || p.y < plot.vy0 || p.y > plot.vy1 || !Number.isFinite(p.x)) { p.x = rnd(plot.vx0, plot.vx1); p.y = rnd(plot.vy0, plot.vy1); p.age = 0; }
    }
    draw();
  });

  function draw() {
    plot.clear();
    if (!parts.length) seed();
    const f = FX();
    const c = themeColors();
    // potential level curves
    if (Pp.potential) {
      const phi = fn(Pp.potential, vars), E = env();
      const N = 60, vals = [];
      for (let i = 0; i <= N; i++) { vals[i] = []; for (let j = 0; j <= N; j++) vals[i][j] = phi({ ...E, x: plot.vx0 + (plot.vx1 - plot.vx0) * i / N, y: plot.vy0 + (plot.vy1 - plot.vy0) * j / N }); }
      const flat = vals.flat().filter(Number.isFinite).sort((a, b) => a - b);
      for (let q = 1; q < 12; q++) {
        const lev = flat[Math.floor((flat.length * q) / 12)];
        for (let i = 0; i < N; i++) for (let j = 0; j < N; j++) {
          const pts = [];
          const corners = [[i, j], [i + 1, j], [i + 1, j + 1], [i, j + 1]];
          for (let k = 0; k < 4; k++) {
            const [a1, b1] = corners[k], [a2, b2] = corners[(k + 1) % 4];
            const v1 = vals[a1][b1], v2 = vals[a2][b2];
            if ((v1 - lev) * (v2 - lev) < 0) { const t = (lev - v1) / (v2 - v1); pts.push([plot.vx0 + (plot.vx1 - plot.vx0) * (a1 + (a2 - a1) * t) / N, plot.vy0 + (plot.vy1 - plot.vy0) * (b1 + (b2 - b1) * t) / N]); }
          }
          if (pts.length >= 2) plot.line(pts[0][0], pts[0][1], pts[1][0], pts[1][1], { color: 'violet', width: 1, alpha: 0.6 });
        }
      }
    }
    // arrows
    const n = Pp.density, dx = (plot.vx1 - plot.vx0) / n, dy = (plot.vy1 - plot.vy0) / n;
    let maxM = 1e-9;
    const grid = [];
    for (let i = 0; i <= n; i++) for (let j = 0; j <= n; j++) {
      const x = plot.vx0 + i * dx, y = plot.vy0 + j * dy;
      const [u, v] = f(x, y);
      const m = Math.hypot(u, v);
      if (Number.isFinite(m)) { maxM = Math.max(maxM, m); grid.push([x, y, u, v, m]); }
    }
    const len = Math.min(dx, dy) * 0.8;
    for (const [x, y, u, v, m] of grid) {
      if (m < 1e-12) continue;
      const s = len * (0.35 + 0.65 * Math.min(1, m / maxM)) / m;
      const t = Math.min(1, m / maxM);
      plot.arrow(x - u * s / 2, y - v * s / 2, x + u * s / 2, y + v * s / 2, { color: `rgba(${Math.round(92 + 150 * t)},${Math.round(157 + 36 * t)},${Math.round(255 - 177 * t)},0.85)`, width: 1.3, head: 6 });
    }
    // particles
    if (Pp.particles) {
      const g = plot.ctx; g.fillStyle = c.ink;
      for (const p of parts) { g.globalAlpha = Math.min(1, p.age / 20) * 0.8; g.beginPath(); g.arc(plot.X(p.x), plot.Y(p.y), 1.6, 0, 6.3); g.fill(); }
      g.globalAlpha = 1;
    }
    // loop and Green's theorem
    const rows = [];
    if (Pp.loop) {
      const R = Pp.loop.r ?? 1, cx = Pp.loop.c?.[0] ?? 0, cy = Pp.loop.c?.[1] ?? 0;
      plot.circle(cx, cy, R, { color: 'gold', width: 2 });
      let circ = 0;
      const N = 400;
      for (let k = 0; k < N; k++) {
        const t = (2 * Math.PI * (k + 0.5)) / N, x = cx + R * Math.cos(t), y = cy + R * Math.sin(t);
        const [u, v] = f(x, y);
        circ += (u * -Math.sin(t) + v * Math.cos(t)) * R * (2 * Math.PI / N);
      }
      let curlFlux = 0;
      const M = 80;
      for (let i = 0; i < M; i++) for (let j = 0; j < M; j++) {
        const x = cx - R + (2 * R * (i + 0.5)) / M, y = cy - R + (2 * R * (j + 0.5)) / M;
        if ((x - cx) ** 2 + (y - cy) ** 2 > R * R) continue;
        curlFlux += curlAt(f, x, y) * (2 * R / M) ** 2;
      }
      rows.push(['$\\oint \\vec F\\cdot d\\vec r$', circ.toFixed(3)], ['$\\iint (\\nabla\\times\\vec F)_z\\,dA$', curlFlux.toFixed(3)]);
    }
    // probe
    const [u, v] = f(probe.x, probe.y);
    if (showProbe) plot.arrow(probe.x, probe.y, probe.x + u * len / Math.max(1e-9, maxM) * 1.6, probe.y + v * len / Math.max(1e-9, maxM) * 1.6, { color: 'gold', width: 2.6 });
    plot.drawHandles();
    if (Pp.readout === false) { F.readout([]); return; }
    const h = 1e-4;
    const div = (f(probe.x + h, probe.y)[0] - f(probe.x - h, probe.y)[0]) / (2 * h) + (f(probe.x, probe.y + h)[1] - f(probe.x, probe.y - h)[1]) / (2 * h);
    F.readout([['probe', `(${probe.x.toFixed(2)}, ${probe.y.toFixed(2)})`], ['$\\vec F$', `(${u.toFixed(3)}, ${v.toFixed(3)})`], ['$\\nabla\\cdot\\vec F$', div.toFixed(3)], ['$(\\nabla\\times\\vec F)_z$', curlAt(f, probe.x, probe.y).toFixed(3)], ...rows]);
  }
  F.draw(draw);
  F.caption(Pp.caption || 'Arrow length is compressed so weak and strong regions are both visible; colour shows strength. Divergence and curl at the probe are computed numerically.');
  return { get: (k) => (k === 'point' ? { x: probe.x, y: probe.y } : F.params[k]) };
}

function curlAt(f, x, y) { const h = 1e-4; return (f(x + h, y)[1] - f(x - h, y)[1]) / (2 * h) - (f(x, y + h)[0] - f(x, y - h)[0]) / (2 * h); }
const rnd = (a, b) => a + Math.random() * (b - a);

export function validate(P) {
  const keys = [...(P.sliders || []).map((s) => s.key), ...(P.choices || []).map((c) => c.key)];
  const out = [];
  for (const [k, src] of [['P', P.P], ['Q', P.Q], ['potential', P.potential]]) {
    if (src === undefined) continue;
    try { fn(src, ['x', 'y', ...keys]); } catch (e) { out.push(`field2d ${k}: “${src}” — ${e.message}`); }
  }
  return out;
}
