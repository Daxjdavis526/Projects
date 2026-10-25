// Prologue: Newton's law (Earth and Moon, the pull updating instantly while
// light takes time), Mercury's orbit precessing (its real eccentricity and
// Kepler motion, the precession exaggerated by a stated factor), and the
// planet Vulcan that wasn't there.

import { TAU, ramp, win, clamp } from '../kit.js';
import { background, text, note, path, circle, glow, seg, arrow, COL } from '../paint.js';
import { perihelionAdvance, GM_SUN, ARCSEC } from '../physics.js';

const E_MERC = 0.2056;
const ORBIT_S = 3.2;                       // one Mercury year on screen, seconds
const PREC_DEG = 9;                        // shown advance per orbit
const REAL = perihelionAdvance(GM_SUN, 5.7909e10, E_MERC) / ARCSEC;   // ≈ 0.1035″
const EXAGGERATION = (PREC_DEG * 3600) / REAL;

// Solve Kepler's equation M = E − e sin E.
function eccentricAnomaly(M, e) {
  let E = M;
  for (let i = 0; i < 8; i++) E -= (E - e * Math.sin(E) - M) / (1 - e * Math.cos(E));
  return E;
}

function mercury(g, t, a, A) {
  const cx = 960, cy = 470, aPx = 300, bPx = aPx * Math.sqrt(1 - E_MERC ** 2);
  glow(g, cx, cy, 120, '#ffcf6b', 0.7 * a);
  circle(g, cx, cy, 30, { fill: '#ffd56e', alpha: a });
  const orbits = t / ORBIT_S;
  // past orbits as a faint rosette, the current one bright
  for (let k = Math.max(0, Math.floor(orbits) - 6); k <= Math.floor(orbits); k++) {
    const w = (k * PREC_DEG * Math.PI) / 180;
    const pts = [];
    for (let i = 0; i <= 120; i++) {
      const E = (i / 120) * TAU;
      const x = aPx * (Math.cos(E) - E_MERC), y = bPx * Math.sin(E);
      pts.push([cx + x * Math.cos(w) - y * Math.sin(w), cy + x * Math.sin(w) + y * Math.cos(w)]);
    }
    const cur = k === Math.floor(orbits);
    path(g, pts, { color: cur ? COL.ink : COL.blue, width: cur ? 2 : 1.5, alpha: a * (cur ? 0.55 : 0.12 + 0.05 * (k - orbits + 6)) });
    // the perihelion of each orbit
    const px = cx + aPx * (1 - E_MERC) * Math.cos(w), py = cy + aPx * (1 - E_MERC) * Math.sin(w);
    circle(g, px, py, 4, { fill: COL.gold, alpha: a * (cur ? 1 : 0.4) });
  }
  // Mercury itself, moving with Kepler's second law
  const k = Math.floor(orbits), w = (k * PREC_DEG * Math.PI) / 180;
  const E = eccentricAnomaly((orbits - k) * TAU, E_MERC);
  const x = aPx * (Math.cos(E) - E_MERC), y = bPx * Math.sin(E);
  const mx = cx + x * Math.cos(w) - y * Math.sin(w), my = cy + x * Math.sin(w) + y * Math.cos(w);
  glow(g, mx, my, 26, '#c9b8a6', 0.5 * a);
  circle(g, mx, my, 9, { fill: '#c9b8a6', alpha: a });
  text(g, 'Mercury', mx + 18, my - 14, { size: 22, color: COL.dim, alpha: a, align: 'left' });
  note(g, `precession exaggerated about ${Math.round(EXAGGERATION / 1e5) * 100},000 times — the real excess over Newton is ${REAL.toFixed(2)}″ per orbit`, 960, 860, a * 0.9);

  // Vulcan: a dotted inner orbit that was never there
  const v = win(t, A[3] - 0.3, A[4] + 2, 0.8, 1);
  if (v > 0) {
    const R = 130, ph = t * 1.2;
    circle(g, cx, cy, R, { stroke: COL.coral, width: 2, alpha: v * a * 0.7, dash: [4, 9] });
    const vx = cx + R * Math.cos(ph), vy = cy + R * Math.sin(ph);
    circle(g, vx, vy, 7, { stroke: COL.coral, width: 2, alpha: v * a });
    text(g, 'Vulcan?', vx + 16, vy + 6, { size: 24, italic: true, color: COL.coral, alpha: v * a, align: 'left' });
    const x = ramp(t, A[3] + 2.4, A[3] + 3.2);
    if (x > 0) {
      seg(g, vx - 16, vy - 16, vx - 16 + 32 * x, vy - 16 + 32 * x, { color: COL.coral, width: 4, alpha: v * a });
      seg(g, vx + 16, vy - 16, vx + 16 - 32 * x, vy - 16 + 32 * x, { color: COL.coral, width: 4, alpha: v * a });
    }
  }
}

function earthMoon(g, t, a, A) {
  const ex = 560, ey = 520, R = 320;
  const ph = t * 0.35;
  const mx = ex + R * Math.cos(ph), my = ey - R * Math.sin(ph) * 0.92;
  glow(g, ex, ey, 160, '#4f8fff', 0.35 * a);
  circle(g, ex, ey, 84, { fill: '#2f6fd6', alpha: a });
  circle(g, ex - 18, ey - 20, 30, { fill: '#58a06b', alpha: a * 0.6 });
  circle(g, mx, my, 24, { fill: '#cfd3da', alpha: a });
  text(g, 'Earth', ex, ey + 128, { size: 26, color: COL.dim, alpha: a });
  text(g, 'Moon', mx, my + 52, { size: 24, color: COL.dim, alpha: a });
  // the pull: Newton's line updates instantly, wherever the Moon is
  const d = Math.hypot(mx - ex, my - ey), ux = (mx - ex) / d, uy = (my - ey) / d;
  arrow(g, mx - ux * 30, my - uy * 30, mx - ux * 110, my - uy * 110, { color: COL.gold, width: 4, alpha: a });
  arrow(g, ex + ux * 92, ey + uy * 92, ex + ux * 172, ey + uy * 172, { color: COL.gold, width: 4, alpha: a });
  // light, by contrast, takes time: pulses spread from Earth
  const l = win(t, A[1] + 1, A[2] - 0.2, 1, 0.6);
  if (l > 0) {
    seg(g, ex, ey, mx, my, { color: COL.gold, width: 1.5, alpha: l * a * 0.6, dash: [3, 6] });
    for (let i = 0; i < 3; i++) {
      const r = (((t - A[1]) * 140 + i * 160) % 480) + 90;
      circle(g, ex, ey, r, { stroke: COL.light, width: 2, alpha: l * a * 0.55 * (1 - r / 570) });
    }
    text(g, 'Newton: the pull updates instantly', 1180, 700, { size: 28, color: COL.gold, alpha: l * a, align: 'left' });
    text(g, 'light: always takes time to arrive', 1180, 745, { size: 28, color: COL.light, alpha: l * a, align: 'left' });
  }
}

export default function draw(g, t, s) {
  const A = s.at;
  background(g, t, { stars: 160, seed: 3 });
  const em = 1 - ramp(t, A[2] - 0.6, A[2] + 0.4);
  if (em > 0) earthMoon(g, t, em * ramp(t, 0.3, 1.6), A);
  const m = ramp(t, A[2] - 0.2, A[2] + 1.2) * (1 - ramp(t, A[4], A[4] + 1.5));
  if (m > 0) mercury(g, t - A[2] + 0.5, m, A.map((x) => x - A[2] + 0.5));
  const y = ramp(t, A[4] + 0.4, A[4] + 1.6);
  if (y > 0) {
    text(g, '1905', 760, 520, { size: 120, weight: 300, color: COL.ink, alpha: y });
    text(g, '1915', 1160, 520, { size: 120, weight: 300, color: COL.gold, alpha: ramp(t, A[4] + 1.6, A[4] + 2.8) });
    text(g, 'special relativity', 760, 575, { size: 28, color: COL.dim, alpha: y });
    text(g, 'general relativity', 1160, 575, { size: 28, color: COL.dim, alpha: ramp(t, A[4] + 1.6, A[4] + 2.8) });
  }
}
