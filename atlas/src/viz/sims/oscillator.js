// A mass on a spring — or a pendulum — with damping and an optional driving
// force. The moving system, energy bars (kinetic, potential, lost to damping)
// and the x–t graph update live. For the pendulum, the exact nonlinear motion
// is integrated alongside the small-angle approximation.

import { Plot, themeColors } from '../plot.js';
import { rk4 } from '../model/numeric.js';

export const defaults = { kind: 'spring', m: 1, k: 4, b: 0, F0: 0, wd: 2, x0: 1, L: 1, g: 9.8, theta0: 30 };

export function mount(F, P) {
  const { canvas } = F.canvas({ aspect: 'wide', label: P.kind === 'pendulum' ? 'A swinging pendulum and its angle over time' : 'A mass on a spring with energy bars and a position graph' });
  const pend = P.kind === 'pendulum';
  if (pend) {
    F.slider({ key: 'L', label: 'Length $L$', min: 0.2, max: 3, step: 0.05, value: P.L, unit: '\\mathrm{m}', explain: 'Small-angle period $T = 2\\pi\\sqrt{L/g}$.' });
    F.slider({ key: 'theta0', label: 'Release angle $\\theta_0$', min: 1, max: 170, step: 1, value: P.theta0, unit: '^\\circ', explain: 'Large angles make the true period longer than the small-angle formula.' });
    F.slider({ key: 'b', label: 'Damping $b$', min: 0, max: 1, step: 0.01, value: P.b, unit: '\\mathrm{s^{-1}}', explain: 'Angular damping rate.' });
  } else {
    F.slider({ key: 'm', label: 'Mass $m$', min: 0.2, max: 5, step: 0.1, value: P.m, unit: '\\mathrm{kg}', explain: 'More mass, slower oscillation.' });
    F.slider({ key: 'k', label: 'Spring constant $k$', min: 0.5, max: 20, step: 0.1, value: P.k, unit: '\\mathrm{N/m}', explain: 'Stiffer spring, faster oscillation: $\\omega_0 = \\sqrt{k/m}$.' });
    F.slider({ key: 'b', label: 'Damping $b$', min: 0, max: 6, step: 0.05, value: P.b, unit: '\\mathrm{kg/s}', explain: 'Drag force $-b\\dot x$. Critical damping at $b = 2\\sqrt{km}$.' });
    F.slider({ key: 'F0', label: 'Driving amplitude $F_0$', min: 0, max: 5, step: 0.1, value: P.F0, unit: '\\mathrm{N}', explain: 'Force $F_0\\cos(\\omega_d t)$.' });
    F.slider({ key: 'wd', label: 'Driving frequency $\\omega_d$', min: 0.2, max: 6, step: 0.02, value: P.wd, unit: '\\mathrm{rad/s}', explain: 'Resonance when $\\omega_d \\approx \\omega_0$ (for light damping).' });
  }
  const S = { t: 0, y: null, hist: [], small: [], lost: 0 };
  const reset = () => { S.t = 0; S.y = pend ? [F.params.theta0 * Math.PI / 180, 0] : [P.x0, 0]; S.hist = []; S.small = []; S.lost = 0; };
  reset();
  F.button({ label: 'Restart', onClick: () => { reset(); } });
  F.onChange(() => reset());
  const plot = new Plot(canvas, { x: [0, 10], y: [-1.2, 1.2] });

  const deriv = (t, y) => {
    if (pend) return [y[1], -(F.params.g ?? 9.8) / F.params.L * Math.sin(y[0]) - F.params.b * y[1]];
    const { m, k, b, F0, wd } = F.params;
    return [y[1], (-k * y[0] - b * y[1] + F0 * Math.cos(wd * t)) / m];
  };
  F.animate((dt) => {
    const steps = 10, h = dt / steps;
    for (let i = 0; i < steps; i++) {
      const before = energy(S.y);
      S.y = rk4(deriv, S.t, S.y, h); S.t += h;
      if (!pend && F.params.F0 === 0) S.lost += Math.max(0, before - energy(S.y));
      if (pend) S.lost += Math.max(0, before - energy(S.y));
    }
    S.hist.push([S.t, pend ? S.y[0] * 180 / Math.PI : S.y[0]]);
    if (pend) { const w0 = Math.sqrt(9.8 / F.params.L); S.small.push([S.t, F.params.theta0 * Math.cos(w0 * S.t) * Math.exp(-F.params.b * S.t / 2)]); }
    if (S.hist.length > 2000) { S.hist.shift(); S.small.shift(); }
    draw();
  }, { force: false });

  function energy(y) {
    if (pend) { const g = 9.8, L = F.params.L; return 0.5 * L * L * y[1] * y[1] + g * L * (1 - Math.cos(y[0])); }
    return 0.5 * F.params.m * y[1] * y[1] + 0.5 * F.params.k * y[0] * y[0];
  }

  function draw() {
    const c = themeColors();
    const W = canvas.clientWidth, H = canvas.clientHeight, dpr = Math.min(2, devicePixelRatio || 1);
    canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
    const g = canvas.getContext('2d'); g.setTransform(dpr, 0, 0, dpr, 0, 0); g.clearRect(0, 0, W, H);
    const panel = W * 0.36;
    // the physical system
    if (pend) {
      const px = panel / 2, py = 24, len = Math.min(panel * 0.42, H * 0.36) * Math.min(1, F.params.L / 1.5 + 0.4);
      const th = S.y[0];
      const bx = px + len * Math.sin(th), by = py + len * Math.cos(th);
      g.strokeStyle = c.ink3; g.lineWidth = 2; g.beginPath(); g.moveTo(px - 30, py); g.lineTo(px + 30, py); g.stroke();
      g.strokeStyle = c.ink2; g.lineWidth = 1.6; g.beginPath(); g.moveTo(px, py); g.lineTo(bx, by); g.stroke();
      g.fillStyle = c.accent; g.beginPath(); g.arc(bx, by, 12, 0, Math.PI * 2); g.fill();
    } else {
      const wy = H * 0.3, x0 = 20, eq = panel * 0.55, scale = panel * 0.18;
      const mx = eq + S.y[0] * scale;
      g.strokeStyle = c.ink3; g.lineWidth = 3; g.beginPath(); g.moveTo(x0, wy - 30); g.lineTo(x0, wy + 30); g.stroke();
      g.strokeStyle = c.ink2; g.lineWidth = 1.6; g.beginPath(); g.moveTo(x0, wy);
      const coils = 12;
      for (let i = 1; i <= coils * 2; i++) g.lineTo(x0 + ((mx - 22 - x0) * i) / (coils * 2), wy + (i % 2 ? -9 : 9));
      g.lineTo(mx - 22, wy); g.stroke();
      g.fillStyle = c.accent; g.fillRect(mx - 22, wy - 20, 44, 40);
      g.strokeStyle = c.ink4; g.setLineDash([3, 4]); g.beginPath(); g.moveTo(eq, wy - 34); g.lineTo(eq, wy + 34); g.stroke(); g.setLineDash([]);
    }
    // energy bars
    const KE = pend ? 0.5 * F.params.L ** 2 * S.y[1] ** 2 : 0.5 * F.params.m * S.y[1] ** 2;
    const PE = pend ? 9.8 * F.params.L * (1 - Math.cos(S.y[0])) : 0.5 * F.params.k * S.y[0] ** 2;
    const tot = Math.max(1e-9, KE + PE + S.lost);
    const bars = [['K', KE, c.accent], ['U', PE, c.good], ['lost', S.lost, c.warn]];
    const bx0 = 18, by0 = H - 18, bw = (panel - 40) / 3, bh = H * 0.36;
    g.font = '11px Inter, sans-serif'; g.textAlign = 'center';
    bars.forEach(([lab, v, col], i) => {
      const x = bx0 + i * (bw + 4), hh = (v / tot) * bh;
      g.fillStyle = c.panel; g.fillRect(x, by0 - bh, bw - 6, bh);
      g.fillStyle = col; g.fillRect(x, by0 - hh, bw - 6, hh);
      g.fillStyle = c.ink2; g.fillText(lab, x + (bw - 6) / 2, by0 + 12);
    });
    // x–t graph
    const tNow = S.t, t0 = Math.max(0, tNow - 10);
    const amp = pend ? Math.max(5, F.params.theta0 * 1.15) : Math.max(1.2, ...S.hist.map((p) => Math.abs(p[1]))) * 1.1;
    plot.o.pad = { l: panel + 46, r: 14, t: 14, b: 30 };
    plot.o.xlabel = 't (s)'; plot.o.ylabel = pend ? 'θ (°)' : 'x (m)';
    plot.ctx = g; plot.w = W; plot.h = H;
    plot.setView([t0, t0 + 10], [-amp, amp]); plot.refreshTheme(); plot.grid(); plot.axes();
    if (pend) plot.path(S.small, { color: 'ink3', width: 1.2, dash: [5, 5] });
    plot.path(S.hist, { color: 'accent', width: 2 });
    const w0 = pend ? Math.sqrt(9.8 / F.params.L) : Math.sqrt(F.params.k / F.params.m);
    F.readout(pend ? [
      ['small-angle period', `${(2 * Math.PI / w0).toFixed(3)}\\,\\mathrm{s}`],
      ['exact period (θ₀)', `${exactPeriod(F.params.L, F.params.theta0).toFixed(3)}\\,\\mathrm{s}`],
      ['angle now', `${(S.y[0] * 180 / Math.PI).toFixed(1)}^\\circ`],
    ] : [
      ['$\\omega_0 = \\sqrt{k/m}$', `${w0.toFixed(3)}\\,\\mathrm{rad/s}`],
      ['period $2\\pi/\\omega_0$', `${(2 * Math.PI / w0).toFixed(3)}\\,\\mathrm{s}`],
      ['damping ratio $b/2\\sqrt{km}$', `${(F.params.b / (2 * Math.sqrt(F.params.k * F.params.m))).toFixed(3)}`],
      ['$x$ now', `${S.y[0].toFixed(3)}\\,\\mathrm{m}`],
    ]);
  }
  F.draw(draw);
  F.caption(pend ? 'Dashed: the small-angle solution $\\theta_0\\cos\\omega_0 t$. Solid: the exact equation $\\ddot\\theta = -(g/L)\\sin\\theta$, integrated with RK4. The pendulum drawing is not to scale.' : 'Linear spring, viscous damping, sinusoidal driving; integrated with RK4. Energy “lost” goes to damping (shown only without driving).');
}

// exact pendulum period via the complete elliptic integral (AGM)
function exactPeriod(L, theta0Deg) {
  const k = Math.sin((theta0Deg * Math.PI) / 360);
  let a = 1, b = Math.sqrt(1 - k * k);
  for (let i = 0; i < 30; i++) { const an = (a + b) / 2; b = Math.sqrt(a * b); a = an; }
  return (2 * Math.PI * Math.sqrt(L / 9.8)) / a;
}
