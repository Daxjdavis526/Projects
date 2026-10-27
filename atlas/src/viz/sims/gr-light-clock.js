// Two identical light clocks: one at rest beside you, one moving sideways at
// speed v. A tick is one round trip of a light pulse between two mirrors a
// distance L apart. Both pulses travel at the same speed c (Einstein's second
// postulate), but in your frame the moving clock's pulse runs along a longer
// zigzag, so each of its ticks lasts γ = 1/√(1 − v²/c²) times longer. The
// optional triangle is half a tick: up L, across vΔt/2, along the light path
// cΔt/2 — Pythagoras gives γ. Physics in model/gr-clock.js (c = 1).
//
//   { type: 'gr-light-clock', params: { beta: 0.6, triangle: true, slider: true } }
//   slider: false fixes the speed (for a question about one particular speed);
//   readout: false hides γ, labels: false keeps numbers off the triangle (so a
//   question does not show its own answer); titles: [left, right] renames the panels.

import { themeColors } from '../plot.js';
import { gamma } from '../model/relativity.js';
import { restTick, movingTick, halfTickTriangle } from '../model/gr-clock.js';

export const defaults = { beta: 0.6, triangle: true, slider: true, readout: true, labels: true, titles: null };

export function mount(F, P) {
  const { canvas, box } = F.canvas({ aspect: 'wide', label: P.alt || 'Two light clocks: one at rest beside you, one moving sideways' });
  if (P.slider !== false) F.slider({ key: 'beta', label: 'Speed of the moving clock $v/c$', min: 0, max: 0.99, step: 0.01, value: P.beta, explain: 'The two clocks are identical; only their motion relative to you differs.' });
  else F.params.beta = P.beta;
  F.toggle({ key: 'triangle', label: 'Show the half-tick triangle', value: P.triangle, explain: 'Up $L$, across $v\\,\\Delta t/2$, and along the light path $c\\,\\Delta t/2$.' });

  const L = 1;                                  // mirror separation (world units; c = 1 unit per animation second)
  const reduced = () => document.documentElement.getAttribute('data-motion') === 'reduce' || !!globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  const start = () => 0.3 * movingTick(L, F.params.beta);
  let t = start();
  let running = !reduced();
  const step = (dt) => { if (running) t += dt; draw(); };
  let loop = F.animate(step);
  const playBtn = F.button({
    label: running ? 'Pause' : 'Play',
    onClick: () => {
      running = !running;
      playBtn.textContent = running ? 'Pause' : 'Play';
      loop.stop();
      if (running) loop = F.animate(step, { force: true });
      else draw();
    },
  });
  F.button({ label: 'Restart', onClick: () => { t = start(); draw(); } });
  F.onChange((key) => { if (key === 'beta') t = start(); draw(); });

  let lastReadout = '';
  function draw() {
    const C = themeColors();
    const W = canvas.clientWidth || 600, H = canvas.clientHeight || 300, dpr = Math.min(2, devicePixelRatio || 1);
    if (canvas.width !== Math.round(W * dpr) || canvas.height !== Math.round(H * dpr)) { canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr); }
    const g = canvas.getContext('2d');
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    g.clearRect(0, 0, W, H);
    const beta = F.params.beta, gam = gamma(beta);
    const small = W < 520;
    // narrow screens: a taller canvas, so labels and counters have room
    const want = small ? '4 / 3' : '';
    if (box.style.aspectRatio !== want) { box.style.aspectRatio = want; return requestAnimationFrame(draw); }
    const font = (px, w = 500) => `${w} ${px}px Inter, system-ui, sans-serif`;
    const top = small ? 34 : 42, bot = H - (small ? 46 : 42);
    const s = bot - top;                        // pixels per unit of L
    const WL = Math.round(W * 0.27);            // the rest clock's panel
    const xR0 = WL + 14, xR1 = W - 10, WR = xR1 - xR0;
    const mirror = (x, y, glow) => {
      g.save();
      g.strokeStyle = glow ? C.gold : C.ink2; g.lineWidth = glow ? 4 : 3; g.lineCap = 'round';
      g.beginPath(); g.moveTo(x - 22, y); g.lineTo(x + 22, y); g.stroke();
      g.restore();
    };
    const photon = (x, y) => {
      g.save();
      g.fillStyle = C.gold; g.globalAlpha = 0.25; g.beginPath(); g.arc(x, y, 10, 0, 2 * Math.PI); g.fill();
      g.globalAlpha = 1; g.beginPath(); g.arc(x, y, 4.5, 0, 2 * Math.PI); g.fill();
      g.restore();
    };
    const label = (text, x, y, o = {}) => {
      g.save(); g.font = font(o.size || (small ? 11 : 12.5), o.weight || 500); g.fillStyle = o.color || C.ink2;
      g.textAlign = o.align || 'left'; g.textBaseline = o.baseline || 'middle';
      if (o.within) {                     // keep the text inside [lo, hi] horizontally
        const w = g.measureText(text).width, [lo, hi] = o.within, a = o.align || 'left';
        const left = a === 'right' ? x - w : a === 'center' ? x - w / 2 : x;
        const shift = left < lo ? lo - left : left + w > hi ? hi - (left + w) : 0;
        x += shift;
      }
      if (o.halo) { g.lineWidth = 4; g.strokeStyle = C.bg; g.strokeText(text, x, y); }
      g.fillText(text, x, y); g.restore();
    };

    // ── the clock at rest ──────────────────────────────────────────────
    const T0 = restTick(L);
    const cx = WL / 2;
    const ph0 = (t / T0) % 1;
    g.save(); g.strokeStyle = C.ink4; g.setLineDash([4, 5]); g.lineWidth = 1.2;
    g.beginPath(); g.moveTo(cx, bot); g.lineTo(cx, top); g.stroke(); g.restore();
    mirror(cx, top, false); mirror(cx, bot, ph0 < 0.06 && t > 0.06);
    photon(cx, bot - s * (ph0 < 0.5 ? 2 * ph0 : 2 * (1 - ph0)));
    label(P.titles?.[0] || (small ? 'at rest' : 'at rest beside you'), 8, 14, { color: C.ink2, size: small && P.titles ? 9.5 : undefined, within: [4, WL - 4] });
    label(`ticks: ${Math.floor(t / T0)}`, cx, H - 12, { align: 'center', color: C.ink, weight: 650 });
    label('L', cx + 10, (top + bot) / 2, { color: C.ink3 });
    g.save(); g.strokeStyle = C.line2; g.lineWidth = 1; g.beginPath(); g.moveTo(WL, 6); g.lineTo(WL, H - 6); g.stroke(); g.restore();

    // ── the moving clock ───────────────────────────────────────────────
    const T = movingTick(L, beta);
    const ux = (tt) => 26 + beta * tt * s;                      // unwrapped x of the clock in the panel
    const wraps = Math.floor((ux(t) - 26) / Math.max(1, WR - 40));
    const off = xR0 - wraps * Math.max(1, WR - 40);
    const X = (tt) => off + ux(tt);
    const Y = (h) => bot - h * s;
    label(P.titles?.[1] || (beta > 0 ? `${small ? 'v' : 'moving at v'} = ${beta.toFixed(2)}c` : 'not moving (v = 0)'), xR0 + 4, 14, { color: C.ink2, size: small && P.titles ? 9.5 : undefined });
    g.save();
    g.beginPath(); g.rect(xR0, 0, WR, H); g.clip();
    // the path ahead in this tick (dashed), then the path already travelled
    const k = Math.floor(t / (T / 2));                          // bounces so far
    const tickStart = Math.floor(t / T) * T;
    const ahead = [[X(t), Y(heightAt(t))]];
    for (let j = k + 1; j * (T / 2) <= tickStart + T + 1e-9; j++) ahead.push([X(j * T / 2), Y(j % 2 ? L : 0)]);
    poly(ahead, C.ink3, 1.2, [5, 5]);
    const trail = [];
    const firstJ = Math.max(0, Math.floor((t - (WR + 60) / Math.max(1e-6, beta * s)) / (T / 2)));
    for (let j = beta > 0 ? firstJ : Math.max(0, k - 1); j <= k; j++) trail.push([X(j * T / 2), Y(j % 2 ? L : 0)]);
    trail.push([X(t), Y(heightAt(t))]);
    poly(trail, C.gold, 2.2, []);
    // the half-tick triangle of the current tick
    if (F.params.triangle && beta > 0.02) {
      const A = [X(tickStart), Y(0)], B = [X(tickStart + T / 2), Y(L)], Cc = [X(tickStart + T / 2), Y(0)];
      poly([A, Cc], C.accent, 2, []);
      poly([Cc, B], C.accent, 2, []);
      poly([A, B], C.gold, 3, []);
      const tri = halfTickTriangle(L, beta);
      label(`L`, Cc[0] + 7, (Cc[1] + B[1]) / 2, { color: C.accent, weight: 650, halo: true });
      label(P.labels === false ? 'v·Δt/2' : `v·Δt/2 = ${(tri.across / L).toFixed(2)} L`, (A[0] + Cc[0]) / 2, Cc[1] + 13, { color: C.accent, align: 'center', weight: 650, halo: true, size: small ? 10.5 : 12, within: [xR0 + 2, xR1 - 2] });
      label(P.labels === false ? 'c·Δt/2' : `c·Δt/2 = ${(tri.slant / L).toFixed(2)} L`, (A[0] + B[0]) / 2 - 8, (A[1] + B[1]) / 2, { color: C.gold, align: 'right', weight: 650, halo: true, size: small ? 10.5 : 12, within: [xR0 + 2, xR1 - 2] });
    }
    const xc = X(t);
    mirror(xc, top, false); mirror(xc, bot, (t % T) / T < 0.06 && t > 0.06);
    photon(xc, Y(heightAt(t)));
    g.restore();
    label(`ticks: ${Math.floor(t / T)}`, xR0 + WR / 2, H - 12, { align: 'center', color: C.ink, weight: 650 });

    const key = `${beta}|${Math.floor(t / T0)}|${Math.floor(t / T)}`;
    if (P.readout !== false && key !== lastReadout) {
      lastReadout = key;
      F.readout([
        ['$\\gamma = 1/\\sqrt{1 - v^2/c^2}$', gam.toFixed(4)],
        ['one tick at rest', '\\Delta\\tau = 2L/c'],
        ['one tick of the moving clock, timed by you', `\\Delta t = ${gam.toFixed(3)}\\,\\Delta\\tau`],
        ['ticks so far (rest : moving)', `${Math.floor(t / T0)} : ${Math.floor(t / T)}`],
      ]);
    }

    function heightAt(tt) { const ph = (tt / T) % 1; return ph < 0.5 ? 2 * ph * L : 2 * (1 - ph) * L; }
    function poly(pts, color, width, dash) {
      g.save(); g.strokeStyle = color; g.lineWidth = width; g.setLineDash(dash); g.lineJoin = 'round'; g.lineCap = 'round';
      g.beginPath(); pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.stroke(); g.restore();
    }
  }
  F.draw(draw);
  F.caption(P.caption || `Both clocks are identical and both light pulses move at the same speed $c$; positions are those in your frame at each instant (not what a camera would record, which adds light-travel delays). The mirror gap $L$ lies across the motion, so it is the same in both frames. Light is slowed enormously for the animation — a real light clock with mirrors 1 m apart ticks every ${(2 / 299792458 * 1e9).toFixed(1)} ns.`);
  return { get: (k) => F.params[k] };
}

export function validate(P) {
  const p = [];
  if (!(P.beta >= 0 && P.beta <= 0.99)) p.push('gr-light-clock: beta must lie in [0, 0.99]');
  return p;
}
