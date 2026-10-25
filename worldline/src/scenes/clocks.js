// Gravitational time dilation. A signal climbing an accelerating rocket
// arrives redshifted; so does one climbing a tower; so the lower clock runs
// slow (the rate difference drawn hugely exaggerated). Then GPS: the orbit
// drawn to scale, the two corrections and the net, the retuned clock, and
// what a day of uncorrected drift would mean.

import { TAU, ramp, win, clamp } from '../kit.js';
import { background, text, note, path, circle, glow, seg, arrow, panel, clockFace, COL } from '../paint.js';
import { gpsRates, C, R_EARTH } from '../physics.js';
import { FACTS } from '../data.js';

// a wave packet from (x, y0) up to y1 whose wavelength grows by `stretch`
function climbingWave(g, x, y0, y1, t, stretch, a, color = COL.light) {
  const pts = [];
  const len = y0 - y1;
  let ph = 0;
  for (let i = 0; i <= 300; i++) {
    const u = i / 300, y = y0 - len * u;
    const lam = 26 * (1 + stretch * u);
    ph += (len / 300) / lam * TAU;
    pts.push([x + 16 * Math.sin(ph - t * 9), y]);
  }
  path(g, pts, { color, width: 3, alpha: a });
}

export default function draw(g, t, s) {
  const A = s.at;
  background(g, t, { stars: 50, seed: 61 });

  // 1. the rocket: floor to ceiling, redshifted
  const r = win(t, 0.2, A[1] + 0.2, 0.8, 0.8);
  if (r > 0) {
    const cx = 760;
    panel(g, cx - 200, 180, 400, 600, { alpha: r, fill: 'rgba(12,20,38,0.9)' });
    path(g, [[cx - 60, 782], [cx, 850 + 10 * Math.sin(t * 30)], [cx + 60, 782]], { width: 0, alpha: r, fill: 'rgba(255,170,80,0.85)', close: true });
    climbingWave(g, cx, 750, 220, t, 0.9, r);
    text(g, 'sent from the floor', cx + 230, 740, { size: 24, color: COL.ink, alpha: r, align: 'left' });
    text(g, 'arrives stretched: lower frequency', cx + 230, 240, { size: 24, color: COL.light, alpha: r, align: 'left' });
    arrow(g, cx + 260, 620, cx + 260, 360, { color: COL.dim, width: 3, alpha: r });
    text(g, 'accelerating', cx + 280, 500, { size: 22, color: COL.dim, alpha: r, align: 'left' });
    note(g, 'stretching exaggerated', cx, 830 + 50, r);
  }

  // 2–3. the tower on Earth, and the measurements
  const tw = win(t, A[1] + 0.2, A[3], 0.8, 0.8);
  if (tw > 0) {
    const cx = 620;
    g.save(); g.globalAlpha = tw; g.fillStyle = '#2d6b3f'; g.fillRect(140, 800, 960, 30); g.fillStyle = '#26324c'; g.fillRect(cx - 70, 200, 140, 600); g.restore();
    climbingWave(g, cx + 160, 760, 260, t, 0.6, tw * 0.8);
    const tt = Math.max(0, t - A[1]);
    const exag = 0.06;                                     // drawn rate difference (hugely exaggerated)
    clockFace(g, cx, 270, 58, tt / 6, { alpha: tw, hand: COL.gold });
    clockFace(g, cx, 730, 58, (tt / 6) * (1 - exag), { alpha: tw, hand: COL.blue });
    text(g, 'higher: runs faster', cx - 90, 280, { size: 24, color: COL.gold, alpha: tw, align: 'right' });
    text(g, 'lower: runs slower', cx - 90, 740, { size: 24, color: COL.blue, alpha: tw, align: 'right' });
    note(g, 'the difference between the clocks is enormously exaggerated', cx, 880, tw);
    const ms = ramp(t, A[2] - 0.2, A[2] + 1) * tw;
    if (ms > 0) {
      text(g, '≈ 1.1 × 10⁻¹⁶ per metre of height', 1420, 470, { size: 34, color: COL.ink, alpha: ms });
      text(g, 'NIST, 2010: clocks 33 cm apart', 1420, 560, { size: 28, color: COL.dim, alpha: ms });
      text(g, 'JILA, 2022: across a 1 mm cloud of atoms', 1420, 606, { size: 28, color: COL.dim, alpha: ms });
    }
  }

  // 4–7. GPS
  const gp = ramp(t, A[3] - 0.2, A[3] + 1);
  if (gp > 0) {
    const ex = 560, ey = 500, Re = 72;                     // Earth, px
    const orb = Re * (FACTS.gpsOrbitRadius.value / R_EARTH);  // to scale
    glow(g, ex, ey, 180, '#4f8fff', 0.35 * gp);
    circle(g, ex, ey, Re, { fill: '#2f6fd6', alpha: gp });
    circle(g, ex - 18, ey - 20, 28, { fill: '#58a06b', alpha: gp * 0.6 });
    circle(g, ex, ey, orb, { stroke: COL.dim, width: 1.5, alpha: gp * 0.7, dash: [4, 8] });
    for (let i = 0; i < 6; i++) {
      const ph = (t - A[3]) * 0.25 + (i * TAU) / 6;
      const sx = ex + orb * Math.cos(ph), sy = ey + orb * Math.sin(ph) * 0.96;
      glow(g, sx, sy, 20, COL.gold, gp * 0.8);
      circle(g, sx, sy, 6, { fill: COL.gold, alpha: gp });
    }
    note(g, 'orbit radius ≈ 26,600 km, drawn to scale with Earth', ex, ey + orb + 50, gp);
    const rates = gpsRates();
    const L1 = ramp(t, A[3] + 2, A[3] + 3) * gp, L2 = ramp(t, A[4] + 0.5, A[4] + 1.5) * gp, L3 = ramp(t, A[4] + 3, A[4] + 4) * gp;
    const lx = 1080, ly = 300;
    panel(g, lx - 30, ly - 70, 760, 380, { alpha: gp * 0.85 });
    text(g, 'a GPS clock, compared with one on the ground', lx, ly - 22, { size: 26, color: COL.dim, alpha: gp, align: 'left' });
    text(g, 'weaker gravity', lx, ly + 50, { size: 32, color: COL.ink, alpha: L1, align: 'left' });
    text(g, `+${(rates.gravity * 1e6).toFixed(1)} μs/day`, lx + 690, ly + 50, { size: 34, color: COL.green, alpha: L1, align: 'right' });
    text(g, 'orbital speed', lx, ly + 120, { size: 32, color: COL.ink, alpha: L2, align: 'left' });
    text(g, `${(rates.velocity * 1e6).toFixed(1).replace('-', '−')} μs/day`, lx + 690, ly + 120, { size: 34, color: COL.coral, alpha: L2, align: 'right' });
    seg(g, lx, ly + 160, lx + 690, ly + 160, { color: COL.dim, width: 2, alpha: L3 });
    text(g, 'net', lx, ly + 220, { size: 34, color: COL.ink, alpha: L3, align: 'left' });
    text(g, `+${(rates.net * 1e6).toFixed(1)} μs/day`, lx + 690, ly + 220, { size: 40, color: COL.gold, alpha: L3, align: 'right' });
    const f = win(t, A[5] - 0.2, A[6], 1, 0.6) * gp;
    if (f > 0) {
      text(g, 'set before launch to', 1460, 760, { size: 28, color: COL.dim, alpha: f });
      text(g, `${(10.23 * (1 - rates.fraction)).toFixed(11)} MHz`, 1460, 818, { size: 46, color: COL.gold, alpha: f });
      text(g, 'not 10.23 MHz', 1460, 862, { size: 26, color: COL.dim, alpha: f });
    }
    const e = ramp(t, A[6] - 0.2, A[6] + 1) * gp;
    if (e > 0) {
      const km = (rates.net * C) / 1000;
      text(g, `38.6 μs × c = ${km.toFixed(1)} km`, 1460, 790, { size: 44, color: COL.coral, alpha: e });
      text(g, 'Ashby: over 11 km of navigation error in a day', 1460, 846, { size: 26, color: COL.dim, alpha: e });
    }
  }
}
