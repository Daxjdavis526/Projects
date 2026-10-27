// Orbits around a mass, Newtonian or in the Schwarzschild spacetime
// (geometric units: G = c = 1, radius in units of M). The left panel is the
// orbit seen from above, integrated live; the right is the effective
// potential with the orbit's energy, showing the turning points — and, for
// Schwarzschild, the barrier that disappears inside the ISCO at 6M.

import { Plot } from '../plot.js';
import { orbitSchwarzschild, vEffMassive, vEffNewton, Lcirc } from '../model/gravity.js';

export const defaults = { mode: 'schwarzschild', r0: 20, L: 4.3, turns: 4, compare: true };

export function mount(F, P) {
  const { canvas } = F.canvas({ aspect: 'wide', label: 'An orbit seen from above and its effective potential' });
  F.choice({ key: 'mode', label: 'Gravity', options: [['newton', 'Newton'], ['schwarzschild', 'Einstein (Schwarzschild)']], value: P.mode, explain: 'Same starting point and angular momentum; only the law of gravity changes.' });
  F.slider({ key: 'r0', label: 'Starting radius $r_0$ (apoapsis)', min: 7, max: 40, step: 0.5, value: P.r0, unit: 'M', explain: 'In units of the mass $M$ ($GM/c^2$). The event horizon is at $2M$.' });
  F.slider({ key: 'L', label: 'Angular momentum $L$ per unit mass', min: 3.0, max: 8, step: 0.01, value: P.L, unit: 'M', explain: 'Lower $L$ means a more eccentric orbit. Below $L = 2\\sqrt3 M \\approx 3.46M$ no stable circular orbit exists.' });
  F.toggle({ key: 'compare', label: 'Overlay the Newtonian orbit', value: P.compare, explain: 'Dashed: what Newton predicts from the same start.' });
  F.onChange(() => draw());

  function draw() {
    const W = canvas.clientWidth, H = canvas.clientHeight;
    const dpr = Math.min(2, devicePixelRatio || 1);
    canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
    const ctx = canvas.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);
    const { mode, r0, L } = F.params;
    const schw = mode === 'schwarzschild';
    const res = orbitSchwarzschild({ r0, L, turns: P.turns, steps: 6000, newtonian: !schw });
    const R = r0 * 1.15;
    // orbit panel (left 55%)
    const pl = new Plot(canvas, { x: [-R, R], y: [-R, R], equal: true, grid: true, axes: false, pad: { l: 10, r: W * 0.45 + 10, t: 10, b: 10 } });
    pl.w = W; pl.h = H; pl.ctx = ctx; pl._fit(); pl.refreshTheme(); pl.grid();
    pl.circle(0, 0, 2, { fill: '#000', stroke: 'ink3', width: 1 });
    pl.text('horizon 2M', 0, -2.6, { color: 'ink3', align: 'center', size: 10 });
    if (schw) pl.circle(0, 0, 6, { stroke: 'ink4', width: 1, dash: [3, 4] });
    if (F.params.compare && schw) pl.path(orbitSchwarzschild({ r0, L, turns: P.turns, steps: 4000, newtonian: true }).pts, { color: 'ink3', width: 1.2, dash: [5, 5] });
    pl.path(res.pts, { color: schw ? 'gold' : 'accent', width: 2 });
    // effective potential panel (right 45%)
    const rMax = Math.max(r0 * 1.3, 30);
    const V = schw ? (r) => vEffMassive(r, L) : (r) => 1 + 2 * vEffNewton(r, L);   // 2V_N + 1 ≈ E² in the weak field
    const E2 = V(r0);
    const ys = []; for (let r = 2.2; r < rMax; r += 0.1) ys.push(V(r));
    const ylo = Math.min(...ys.filter((v) => v > 0.5)), yhi = Math.max(E2, ...ys.filter((v) => v < 1.3)) + 0.01;
    const pv = new Plot(canvas, { x: [0, rMax], y: [Math.max(0.6, ylo - 0.02), Math.min(1.2, yhi + 0.02)], pad: { l: W * 0.58, r: 14, t: 18, b: 30 }, xlabel: 'r / M', ylabel: '' });
    pv.w = W; pv.h = H; pv.ctx = ctx; pv._fit(); pv.refreshTheme(); pv.grid(); pv.axes();
    pv.fn((r) => (r > 2 ? V(r) : NaN), { color: schw ? 'gold' : 'accent', width: 2 });
    pv.line(0, E2, rMax, E2, { color: 'ink2', width: 1, dash: [5, 4] });
    pv.text(schw ? 'E² vs V_eff(r)' : 'Newtonian V_eff (scaled)', pv.L + 6, 12, { screen: true, color: 'ink2', size: 11 });
    pv.point(r0, E2, { color: 'good', r: 4 });
    // precession per orbit
    let prec = null;
    if (res.peri.length >= 2) prec = ((res.peri[1] - res.peri[0]) - 2 * Math.PI);
    const ecc = estimateEcc(res.pts);
    F.readout([
      ['$r_0$', `${r0}\\,M`], ['$L$', `${L.toFixed(2)}\\,M`],
      ['$L$ for a circle at $r_0$', `${schw ? Lcirc(r0).toFixed(3) : Math.sqrt(r0).toFixed(3)}\\,M`],
      res.captured ? ['fate', '\\text{plunges through the horizon}'] : ['periapsis advance per orbit', prec !== null ? `${(prec * 180 / Math.PI).toFixed(2)}^\\circ` : '\\text{—}'],
      ['eccentricity (approx.)', ecc.toFixed(3)],
    ]);
  }
  F.draw(draw);
  F.caption('Equatorial orbits of a test particle, integrated with RK4 in the orbit equation $u\'\' + u = M/L^2 + 3Mu^2$ ($u = 1/r$). Newton drops the $3Mu^2$ term. Distances are to scale in units of $M$; the dashed circle is the ISCO at $6M$.');
}

function estimateEcc(pts) {
  const rs = pts.map(([x, y]) => Math.hypot(x, y)).filter(Number.isFinite);
  const a = Math.max(...rs), b = Math.min(...rs);
  return (a - b) / (a + b);
}
