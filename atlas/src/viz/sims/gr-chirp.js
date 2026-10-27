// A gravitational-wave chirp and what it does to a detector. Right: the strain
// h(t) from two black holes spiralling together, at leading (Newtonian,
// quadrupole) order, from a low frequency until their horizons would touch,
// with a playhead marking "now". Left: a ring of free-floating test masses and
// an L-shaped interferometer whose arms run to two of them, stretched and
// squeezed by the wave's "+" polarization at the playhead — enormously
// exaggerated, with the true sizes in the readout. Play advances the playhead
// one wave cycle every 0.6 s (real time runs much faster, and faster still as
// the frequency climbs). Physics in model/gr-waves.js (tested).
//
//   { type: 'gr-chirp', params: { m1: 36, m2: 29, D: 410 } }
//   sliders: false fixes the masses and distance; play: false removes the
//   playhead and Play (p sets where "now" is, 0–1); readout: false hides the
//   numbers, so a question does not print its own answer; ring: false draws
//   the waveform alone.

import { Plot, themeColors } from '../plot.js';
import { chirpMass, tauOfF, fOfTau, phaseOfTau, tauOfPhase, strain, fContact, MPC } from '../model/gr-waves.js';

export const defaults = { m1: 36, m2: 29, D: 410, p: 0.88, fLow: 30, window: 1, sliders: true, play: true, readout: true, ring: true };
const CYCLE_SECONDS = 0.6;   // animation pace: one wave cycle per 0.6 s
const ARM = 4000;            // LIGO's arm length, m
const DISPLAY = 0.3;         // the ring is drawn stretched by up to 30% at the end of the trace

/** x as TeX in scientific notation. */
const texSci = (x, n = 3) => {
  if (!Number.isFinite(x) || x === 0) return String(x);
  const e = Math.floor(Math.log10(Math.abs(x)));
  return `${(x / 10 ** e).toFixed(n - 1)}\\times10^{${e}}`;
};
const SUP = { '-': '⁻', 0: '⁰', 1: '¹', 2: '²', 3: '³', 4: '⁴', 5: '⁵', 6: '⁶', 7: '⁷', 8: '⁸', 9: '⁹' };
const plainSci = (x) => { const e = Math.floor(Math.log10(Math.abs(x))); return `${(x / 10 ** e).toFixed(1)}×10${String(e).replace(/./g, (c) => SUP[c])}`; };

export function mount(F, P) {
  const { canvas, box } = F.canvas({ aspect: 'wide', label: P.alt || 'A gravitational-wave chirp, and a ring of test masses and a detector’s arms stretched by it' });
  if (P.sliders !== false) {
    F.slider({ key: 'm1', label: 'Mass $m_1$', min: 10, max: 60, step: 1, value: P.m1, unit: 'M_\\odot', explain: 'One black hole, in solar masses.' });
    F.slider({ key: 'm2', label: 'Mass $m_2$', min: 10, max: 60, step: 1, value: P.m2, unit: 'M_\\odot', explain: 'The other. The sweep depends only on the chirp mass $\\mathcal{M} = (m_1m_2)^{3/5}/(m_1+m_2)^{1/5}$.' });
    F.slider({ key: 'D', label: 'Distance $D$', min: 40, max: 2000, step: 10, value: P.D, unit: '\\mathrm{Mpc}', explain: 'Only the size of the strain depends on it: $h \\propto 1/D$. One megaparsec is 3.26 million light-years.' });
  } else Object.assign(F.params, { m1: P.m1, m2: P.m2, D: P.D });
  const hasPlay = P.play !== false;
  if (hasPlay) F.slider({ key: 'p', label: 'Now', min: 0, max: 1, step: 0.001, value: P.p, explain: 'Where the playhead sits, from the left end of the trace (0) to the moment the horizons would touch (1).', fmt: (v) => v.toFixed(2) });
  else F.params.p = P.p;

  const reduced = () => document.documentElement.getAttribute('data-motion') === 'reduce' || !!globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  let running = hasPlay && !reduced(), hold = 0, loop = null;
  const step = (dt) => {
    if (!running) return;
    const s = signal();
    let p = F.params.p + ((dt / CYCLE_SECONDS) * 2 * Math.PI) / Math.max(1e-9, s.phi0 - s.phiEnd);
    if (p >= 1) { p = 1; hold += dt; if (hold > 1.5) { p = 0; hold = 0; } }
    F.set('p', p);
  };
  if (hasPlay) {
    loop = F.animate(step);
    const playBtn = F.button({
      label: running ? 'Pause' : 'Play',
      onClick: () => {
        running = !running;
        playBtn.textContent = running ? 'Pause' : 'Play';
        loop.stop();
        if (running) { if (F.params.p >= 1) F.set('p', 0); loop = F.animate(step, { force: true }); }
      },
    });
    F.button({ label: 'Restart', onClick: () => { hold = 0; F.set('p', 0); } });
  }
  F.onChange(() => draw());

  function signal() {
    const { m1, m2, D } = F.params;
    const Mc = chirpMass(m1, m2), Mt = m1 + m2;
    const fEnd = fContact(Mt), tauEnd = tauOfF(fEnd, Mc);
    const tau0 = Math.max(Math.min(tauOfF(P.fLow, Mc), P.window), 4 * tauEnd);
    return { Mc, Mt, fEnd, tauEnd, tau0, phi0: phaseOfTau(tau0, Mc), phiEnd: phaseOfTau(tauEnd, Mc), Dm: D * MPC };
  }

  let shape = '';
  function draw() {
    const C = themeColors();
    const W0 = canvas.clientWidth || 600;
    const small = W0 < 520 && P.ring !== false;
    const want = small ? '1 / 1' : '';
    if (shape !== want) { shape = want; box.style.aspectRatio = want; return requestAnimationFrame(draw); }
    const s = signal();
    const phi = s.phi0 - F.params.p * (s.phi0 - s.phiEnd);
    const tau = tauOfPhase(phi, s.Mc), f = fOfTau(tau, s.Mc);
    const hAmp = strain(f, s.Mc, s.Dm), h = hAmp * Math.cos(phi), hEnd = strain(s.fEnd, s.Mc, s.Dm);
    const ringOn = P.ring !== false;
    const H0 = canvas.clientHeight || 300;
    // layout: ring panel on the left (or on top when narrow), waveform in the rest
    const ringW = ringOn ? (small ? W0 : Math.min(H0 * 1.05, W0 * 0.36)) : 0;
    const ringH = ringOn && small ? H0 * 0.44 : H0;
    const pad = small ? { l: 44, r: 12, t: ringH + 8, b: 34 } : { l: ringW + 46, r: 14, t: 16, b: 34 };
    const yMax = 1.2 * hEnd * 1e21;
    const pl = new Plot(canvas, { x: [-s.tau0, s.tau0 * 0.06], y: [-yMax, yMax], pad, axes: false, grid: true, xticks: small ? 5 : 7, yticks: 5 });
    pl.clear();
    const g = pl.ctx, font = (px, w = 500) => `${w} ${px}px Inter, system-ui, sans-serif`;
    // axes drawn by hand, so tick labels sit below the plot rather than on the zero line
    g.save();
    g.fillStyle = C.ink3; g.font = font(11);
    g.textAlign = 'center'; g.textBaseline = 'top';
    for (const tk of Plot.ticks(pl.vx0, pl.vx1, small ? 5 : 7)) if (tk <= 0) g.fillText(String(+tk.toPrecision(3)), pl.X(tk), pl.B + 4);
    g.textAlign = 'right'; g.textBaseline = 'middle';
    for (const tk of Plot.ticks(pl.vy0, pl.vy1, 5)) g.fillText(String(+tk.toPrecision(3)), pl.L - 5, pl.Y(tk));
    g.fillStyle = C.ink2; g.font = font(12);
    g.textAlign = 'right'; g.textBaseline = 'bottom'; g.fillText('time before merger (s)', pl.R, pl.B + 30);
    g.save(); g.translate(pl.L - 34, pl.T); g.rotate(-Math.PI / 2); g.textAlign = 'right'; g.textBaseline = 'middle'; g.fillText('strain h (10⁻²¹)', 0, 0); g.restore();
    g.restore();
    pl.line(pl.vx0, 0, pl.vx1, 0, { color: 'line3', width: 1 });
    // the merger: beyond where the horizons touch, only numerical relativity can say
    const xT = -s.tauEnd;
    g.save(); g.fillStyle = C.ink4; g.globalAlpha = 0.28; g.fillRect(pl.X(xT), pl.T, pl.R - pl.X(xT), pl.B - pl.T); g.restore();
    pl.line(xT, pl.vy0, xT, pl.vy1, { color: 'ink3', width: 1, dash: [4, 4] });
    g.save(); g.fillStyle = C.ink3; g.font = font(10.5); g.textAlign = 'right'; g.textBaseline = 'top';
    g.fillText(small ? 'merger: numerical relativity' : 'horizons touch · merger needs numerical relativity', pl.X(xT) - 4, pl.T + 3); g.restore();
    // the waveform, sampled evenly in phase; the part already played is brighter
    const cyc = (s.phi0 - s.phiEnd) / (2 * Math.PI);
    const n = Math.min(8000, Math.max(400, Math.ceil(cyc * 28)));
    const past = [], future = [];
    for (let k = 0; k <= n; k++) {
      const ph = s.phi0 - (k / n) * (s.phi0 - s.phiEnd);
      const tt = tauOfPhase(ph, s.Mc);
      const pt = [-tt, strain(fOfTau(tt, s.Mc), s.Mc, s.Dm) * Math.cos(ph) * 1e21];
      (ph >= phi ? past : future).push(pt);
    }
    if (past.length) future.unshift(past[past.length - 1]);
    pl.path(future, { color: 'accent', width: 1.4, alpha: 0.35 });
    pl.path(past, { color: 'accent', width: 1.7 });
    pl.line(-tau, pl.vy0, -tau, pl.vy1, { color: 'gold', width: 1.4 });
    pl.point(-tau, h * 1e21, { color: 'gold', r: 4 });

    if (ringOn) {
      const cx = ringW / 2 + (small ? 0 : 4), cy = small ? ringH / 2 + 4 : H0 / 2 - 4;
      const R0 = Math.min(ringW, ringH) * (small ? 0.3 : 0.27);
      const ex = DISPLAY / hEnd, sd = ex * h;           // displayed strain
      const pos = (th) => [cx + R0 * Math.cos(th) * (1 + sd / 2), cy - R0 * Math.sin(th) * (1 - sd / 2)];
      g.save();
      // the undisturbed ring, for reference
      g.strokeStyle = C.ink4; g.lineWidth = 1; g.setLineDash([3, 4]);
      g.beginPath(); g.arc(cx, cy, R0, 0, 2 * Math.PI); g.stroke(); g.setLineDash([]);
      // the interferometer: beam splitter at the centre, arms to the masses on the x and y axes
      const [xa, ya] = pos(0), [xb, yb] = pos(Math.PI / 2);
      g.strokeStyle = C.gold; g.lineWidth = 2;
      g.beginPath(); g.moveTo(cx, cy); g.lineTo(xa, ya); g.moveTo(cx, cy); g.lineTo(xb, yb); g.stroke();
      g.fillStyle = C.gold;
      g.fillRect(xa - 1.5, ya - 7, 3, 14); g.fillRect(xb - 7, yb - 1.5, 14, 3);
      g.beginPath(); g.moveTo(cx - 5, cy); g.lineTo(cx, cy - 5); g.lineTo(cx + 5, cy); g.lineTo(cx, cy + 5); g.closePath(); g.fill();
      // the free-floating test masses
      g.strokeStyle = C.ink3; g.lineWidth = 1;
      g.beginPath();
      for (let k = 0; k <= 64; k++) { const [x, y] = pos((k / 64) * 2 * Math.PI); if (k) g.lineTo(x, y); else g.moveTo(x, y); }
      g.stroke();
      g.fillStyle = C.accent2;
      for (let k = 0; k < 16; k++) { const [x, y] = pos((k / 16) * 2 * Math.PI); g.beginPath(); g.arc(x, y, 3.6, 0, 2 * Math.PI); g.fill(); }
      g.font = font(small ? 10.5 : 11.5); g.fillStyle = C.ink2; g.textBaseline = 'middle';
      g.textAlign = 'left'; g.fillText('x arm', Math.min(xa + 8, ringW - 34), ya + 14);
      g.textAlign = 'left'; g.fillText('y arm', xb + 9, Math.max(yb - 2, 10));
      g.textAlign = 'center'; g.fillStyle = C.ink3;
      g.fillText(`stretch shown ×${plainSci(ex)}`, cx, Math.min(cy + R0 * 1.25 + 14, (small ? ringH : H0) - 10));
      g.restore();
    }
    if (P.readout !== false) {
      F.readout([
        ['chirp mass $\\mathcal{M}$', `${s.Mc.toFixed(1)}\\,M_\\odot`],
        ['frequency now', `${f.toFixed(f < 100 ? 1 : 0)}\\,\\mathrm{Hz}`],
        ['strain amplitude $h$', texSci(hAmp)],
        ['change in arm difference $hL$ (4 km)', `${texSci(hAmp * ARM)}\\,\\mathrm{m}`],
        ['time to merger', tau < 0.1 ? `${(tau * 1e3).toFixed(1)}\\,\\mathrm{ms}` : `${tau.toFixed(3)}\\,\\mathrm{s}`],
      ]);
    }
  }
  F.draw(draw);
  F.caption('Two non-spinning black holes on a circular orbit, at leading (Newtonian, quadrupole) order, seen face-on from directly overhead; the ring and the arms respond to the wave’s “+” polarization. The trace stops where the two horizons would touch: the last orbits, the merger and the ringdown need numerical relativity, and even the last cycles drawn are only roughly right. On the ring the stretch is exaggerated about 10²⁰ times. Cosmological redshift is ignored.');
  return { get: (k) => F.params[k], destroy: () => loop?.stop() };
}

/** Node-side check used by the content tests. */
export function validate(P0) {
  const P = { ...defaults, ...P0 };
  const problems = [];
  for (const k of ['m1', 'm2', 'D', 'fLow', 'window']) if (!(P[k] > 0)) problems.push(`gr-chirp: ${k} must be a positive number`);
  if (!(P.p >= 0 && P.p <= 1)) problems.push('gr-chirp: p (where the playhead sits) must lie in [0, 1]');
  if (P.sliders !== false && !(P.m1 >= 10 && P.m1 <= 60 && P.m2 >= 10 && P.m2 <= 60 && P.D >= 40 && P.D <= 2000)) problems.push('gr-chirp: with sliders, m1 and m2 must lie in [10, 60] M☉ and D in [40, 2000] Mpc');
  return problems;
}
