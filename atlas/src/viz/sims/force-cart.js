// Newton's second law on a track: a cart of mass m pushed by a constant
// applied force, with optional kinetic friction. Forces are drawn to scale on
// the cart; the lower panel plots velocity against time, whose slope is the
// acceleration a = F_net / m.

import { Plot, themeColors } from '../plot.js';

export const defaults = { F: 12, m: 4, mu: 0, g: 9.8 };

export function mount(F, params) {
  const { canvas } = F.canvas({ aspect: 'wide', label: 'A cart on a track with force arrows, and a velocity–time graph' });
  const ctx = canvas.getContext('2d');
  F.slider({ key: 'F', label: 'Applied force $F$', min: 0, max: 40, step: 0.5, value: params.F, unit: '\\mathrm{N}', explain: 'Horizontal push on the cart.' });
  F.slider({ key: 'm', label: 'Mass $m$', min: 0.5, max: 20, step: 0.5, value: params.m, unit: '\\mathrm{kg}', explain: 'More mass, more inertia: the same force gives less acceleration.' });
  F.slider({ key: 'mu', label: 'Friction coefficient $\\mu_k$', min: 0, max: 0.6, step: 0.01, value: params.mu, unit: '', explain: 'Kinetic friction opposes motion with magnitude $\\mu_k m g$ once the cart moves.' });
  const S = { x: 0, v: 0, t: 0, hist: [[0, 0]], running: false };
  const play = F.button({ label: 'Play', primary: true, onClick: () => { S.running = !S.running; play.textContent = S.running ? 'Pause' : 'Play'; if (S.running) anim.start(); } });
  F.button({ label: 'Reset', onClick: () => { reset(); draw(); } });
  const reset = () => { S.x = 0; S.v = 0; S.t = 0; S.hist = [[0, 0]]; S.running = false; play.textContent = 'Play'; };
  F.onChange(() => { reset(); draw(); });

  const accel = () => {
    const { F: f, m, mu, g } = { ...F.params, g: params.g };
    const fricMax = mu * m * g;
    if (S.v > 1e-9) return (f - fricMax) / m;
    // at rest: static friction (taken equal to kinetic here) holds until F exceeds it
    return f > fricMax ? (f - fricMax) / m : 0;
  };

  const anim = F.animate((dt) => {
    if (!S.running) return;
    const steps = 4;
    for (let k = 0; k < steps; k++) {
      const h = dt / steps;
      const a = accel();
      S.v = Math.max(0, S.v + a * h);
      S.x += S.v * h;
      S.t += h;
    }
    if (S.hist.length === 0 || S.t - S.hist[S.hist.length - 1][0] > 0.04) S.hist.push([S.t, S.v]);
    if (S.t > 8) { S.running = false; play.textContent = 'Play'; }
    draw();
  }, { force: true });

  const vplot = new Plot(canvas, { x: [0, 8], y: [0, 20], xlabel: 't (s)', ylabel: 'v (m/s)', pad: { l: 46, r: 16, t: 0, b: 30 } });

  function draw() {
    const c = themeColors();
    const dpr = Math.min(2, devicePixelRatio || 1);
    const W = canvas.clientWidth, H = canvas.clientHeight;
    if (canvas.width !== Math.round(W * dpr)) { canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr); }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);
    const trackY = H * 0.36;
    // track with metre marks; the view scrolls to keep the cart visible
    const pxPerM = Math.max(18, W / 26);
    const viewX = Math.max(0, S.x - (W * 0.55) / pxPerM);
    ctx.strokeStyle = c.line3; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(0, trackY); ctx.lineTo(W, trackY); ctx.stroke();
    ctx.fillStyle = c.ink3; ctx.font = '10px Inter, sans-serif'; ctx.textAlign = 'center';
    for (let m = Math.floor(viewX); m < viewX + W / pxPerM + 1; m++) {
      const px = 40 + (m - viewX) * pxPerM;
      ctx.fillRect(px, trackY, 1, m % 5 === 0 ? 8 : 4);
      if (m % 5 === 0) ctx.fillText(`${m} m`, px, trackY + 18);
    }
    // cart
    const cx = 40 + (S.x - viewX) * pxPerM;
    const cw = 70, ch = 34;
    ctx.fillStyle = c.accent; ctx.globalAlpha = 0.9;
    ctx.fillRect(cx - cw / 2, trackY - ch - 10, cw, ch);
    ctx.globalAlpha = 1;
    ctx.fillStyle = c.panel; ctx.strokeStyle = c.ink2;
    for (const wx of [-cw / 3, cw / 3]) { ctx.beginPath(); ctx.arc(cx + wx, trackY - 6, 6, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); }
    ctx.fillStyle = '#fff'; ctx.font = '600 12px Inter, sans-serif'; ctx.fillText(`${F.params.m} kg`, cx, trackY - ch / 2 - 10 + 4);
    // force arrows to scale: 4 px per newton
    const k = 4, my = trackY - ch / 2 - 10;
    const fric = S.v > 1e-9 || F.params.F > F.params.mu * F.params.m * params.g ? F.params.mu * F.params.m * params.g : Math.min(F.params.F, F.params.mu * F.params.m * params.g);
    arrow(ctx, cx + cw / 2, my, cx + cw / 2 + F.params.F * k, my, c.good, `F = ${F.params.F.toFixed(1)} N`);
    if (fric > 0.01) arrow(ctx, cx - cw / 2, my + 8, cx - cw / 2 - fric * k, my + 8, c.bad, `f = ${fric.toFixed(1)} N`);
    const wN = F.params.m * params.g;
    arrow(ctx, cx, trackY - 10, cx, trackY - 10 + Math.min(110, wN * 0.6), c.ink3, `mg = ${wN.toFixed(0)} N`, true);
    arrow(ctx, cx, trackY - ch - 10, cx, trackY - ch - 10 - Math.min(110, wN * 0.6), c.ink3, `N = ${wN.toFixed(0)} N`, true);
    // v–t graph in the lower half
    ctx.save();
    ctx.translate(0, H * 0.5);
    const sub = { clientWidth: W, clientHeight: H * 0.5 };
    vplot.w = W; vplot.h = H * 0.5; vplot.o.pad = { l: 46, r: 16, t: 6, b: 30 };
    const vmax = Math.max(4, Math.ceil(((F.params.F) / F.params.m) * 8 * 1.1));
    vplot.setView([0, 8], [0, vmax]); vplot._fit(); vplot.refreshTheme();
    vplot.grid(); vplot.axes();
    vplot.path(S.hist, { color: 'accent', width: 2.2 });
    const aNow = accel();
    vplot.line(0, 0, 8, aNow * 8, { color: 'ink3', width: 1, dash: [4, 4] });
    ctx.restore();
    void sub;
    F.readout([
      ['$F_\\text{net}$', `${(F.params.F - fric).toFixed(2)}\\,\\mathrm{N}`],
      ['$a = F_\\text{net}/m$', `${aNow.toFixed(2)}\\,\\mathrm{m/s^2}`],
      ['$t$', `${S.t.toFixed(2)}\\,\\mathrm{s}`],
      ['$v$', `${S.v.toFixed(2)}\\,\\mathrm{m/s}`],
      ['$x$', `${S.x.toFixed(2)}\\,\\mathrm{m}`],
    ]);
  }
  F.draw(draw);
  F.caption('Air resistance ignored; static and kinetic friction are taken as equal for simplicity. Forces are drawn to scale; the dashed line is $v = a t$.');
}

function arrow(ctx, x0, y0, x1, y1, color, label, vertical = false) {
  const len = Math.hypot(x1 - x0, y1 - y0);
  if (len < 2) return;
  const ux = (x1 - x0) / len, uy = (y1 - y0) / len, hd = Math.min(10, len / 2);
  ctx.save();
  ctx.strokeStyle = color; ctx.fillStyle = color; ctx.lineWidth = 2.5;
  ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1 - ux * hd * 0.6, y1 - uy * hd * 0.6); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x1 - ux * hd - uy * hd * 0.5, y1 - uy * hd + ux * hd * 0.5); ctx.lineTo(x1 - ux * hd + uy * hd * 0.5, y1 - uy * hd - ux * hd * 0.5); ctx.closePath(); ctx.fill();
  ctx.font = '600 11px Inter, sans-serif';
  ctx.textAlign = vertical ? 'left' : ux > 0 ? 'left' : 'right';
  ctx.fillText(label, vertical ? x1 + 6 : x1 + (ux > 0 ? 6 : -6), vertical ? y1 : y1 - 8);
  ctx.restore();
}
