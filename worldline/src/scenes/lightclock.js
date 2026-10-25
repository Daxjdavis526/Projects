// Special relativity from a light clock. The two postulates; a clock at rest
// ticking; an identical clock flying past at 0.6c whose pulse traces a
// slanted zigzag at exactly the speed of light (so it ticks every γP); the
// half-tick triangle; and the Lorentz factor rising as v → c.

import { ramp, win, clamp, lerp } from '../kit.js';
import { background, text, note, path, circle, glow, seg, arrow, panel, COL } from '../paint.js';
import { gamma, lightClock } from '../physics.js';
import { clockTimes } from '../timing.js';

export const L = 300;                       // mirror gap, px


function mirrors(g, x, yTop, w, a) {
  g.save();
  g.globalAlpha = a;
  g.fillStyle = '#c9d6ea';
  g.fillRect(x - w / 2, yTop - 8, w, 8);
  g.fillRect(x - w / 2, yTop + L, w, 8);
  g.restore();
  seg(g, x - w / 2 + 6, yTop, x - w / 2 + 6, yTop + L, { color: COL.faint, width: 2, alpha: a * 0.6 });
  seg(g, x + w / 2 - 6, yTop, x + w / 2 - 6, yTop + L, { color: COL.faint, width: 2, alpha: a * 0.6 });
}

function photon(g, x, y, a) {
  glow(g, x, y, 34, COL.light, 0.8 * a);
  circle(g, x, y, 7, { fill: '#e8fbff', alpha: a });
}

function postulates(g, t, A) {
  // 1. a smooth ride: a ball dropped inside a steadily moving cabin falls straight down in the cabin
  const p1 = win(t, A[0], A[2] - 0.3, 0.8, 0.8);
  if (p1 > 0) {
    const vx = 120, x0 = 200 + ((t - A[0]) * vx) % 900, y0 = 330;
    panel(g, x0 - 130, y0 - 150, 260, 300, { alpha: p1, r: 18 });
    const drop = ((t - A[0]) % 2.2) / 2.2;
    const by = y0 - 110 + 220 * drop * drop;
    circle(g, x0, by, 14, { fill: COL.gold, alpha: p1 });
    seg(g, x0, y0 - 120, x0, y0 + 130, { color: COL.gold, width: 1.5, alpha: p1 * 0.4, dash: [4, 8] });
    arrow(g, x0 - 60, y0 + 190, x0 + 60, y0 + 190, { color: COL.dim, width: 3, alpha: p1 });
    text(g, 'steady motion', x0, y0 + 230, { size: 24, color: COL.dim, alpha: p1 });
    text(g, '1', 120, 190, { size: 90, weight: 300, color: COL.gold, alpha: p1 });
    text(g, 'Same laws of physics for everyone moving steadily', 1440, 300, { size: 34, color: COL.ink, alpha: p1 });
    text(g, 'inside, the ball falls straight down, as at rest', 1440, 350, { size: 26, color: COL.dim, alpha: p1 });
  }
  // 2. light at c for everyone
  const p2 = win(t, A[1], A[2] - 0.3, 0.8, 0.8);
  if (p2 > 0) {
    const y = 620;
    const lx = 140 + ((t - A[1]) * 520) % 1700;
    seg(g, 100, y, 1820, y, { color: COL.faint, width: 1, alpha: p2 });
    glow(g, lx, y, 40, COL.light, p2);
    circle(g, lx, y, 7, { fill: '#e8fbff', alpha: p2 });
    const obs = [[420, 0, 'at rest'], [980, 0.5, 'moving at 0.5c'], [1480, 0.9, 'moving at 0.9c']];
    for (const [ox, b, lab] of obs) {
      const x = ox + ((t - A[1]) * b * 120) % 160;
      circle(g, x, y + 70, 16, { fill: COL.blue, alpha: p2 });
      if (b) arrow(g, x + 26, y + 70, x + 26 + b * 90, y + 70, { color: COL.blue, width: 3, alpha: p2 });
      text(g, lab, x, y + 125, { size: 22, color: COL.dim, alpha: p2 });
      text(g, 'measures c', x, y + 158, { size: 24, color: COL.light, alpha: p2 });
    }
    text(g, '2', 120, 560, { size: 90, weight: 300, color: COL.light, alpha: p2 });
    text(g, 'c = 299,792,458 m/s for every one of them', 1440, 520, { size: 30, color: COL.ink, alpha: p2 });
  }
}

export default function draw(g, t, s) {
  const A = s.at;
  const { P, beta } = s.params;
  const c = (2 * L) / P;                       // px per second
  const yTop = 300;
  background(g, t, { stars: 70, seed: 11 });
  postulates(g, t, A);

  const { rest0, move0 } = clockTimes(s);
  const clocksA = win(t, A[2] - 0.2, A[7] - 0.2, 0.9, 0.9);
  if (clocksA > 0) {
    // the clock at rest
    const rx = 300;
    const r = lightClock(Math.max(0, t - rest0), P, 0);
    mirrors(g, rx, yTop, 150, clocksA);
    photon(g, rx, yTop + L - r.h * L, clocksA);
    text(g, 'at rest', rx, yTop + L + 70, { size: 28, color: COL.ink, alpha: clocksA });

    // the moving clock, seen from the ground: it crosses the right of the
    // frame, its pulse leaving a zigzag trail, and is replaced by the next
    const m = win(t, A[3] - 0.2, A[5] + 0.2, 0.8, 0.7) * clocksA;
    const tm = t - move0;
    const g6 = gamma(beta), Pm = P * g6, v = beta * c;
    const lane0 = 640, lane1 = 1820;
    const cross = (lane1 - lane0) / v;           // seconds to cross the lane
    if (m > 0) {
      seg(g, lane0 - 40, yTop + L + 20, lane1 + 40, yTop + L + 20, { color: COL.faint, width: 1, alpha: m * 0.5 });
      if (tm >= 0) {
        const k = Math.floor(tm / cross), tl = tm - k * cross;
        const x = lane0 + v * tl;
        // the trail: the pulse's path in the ground frame since this crossing began
        const pts = [];
        for (let i = 0; i <= 160; i++) {
          const ti = (tl * i) / 160, tt = k * cross + ti;
          pts.push([lane0 + v * ti, yTop + L - lightClock(tt, P, beta).h * L]);
        }
        path(g, pts, { color: COL.light, width: 2.5, alpha: m * 0.75 });
        mirrors(g, x, yTop, 150, m);
        photon(g, x, yTop + L - lightClock(tm, P, beta).h * L, m);
        arrow(g, x - 50, yTop + L + 55, x + 50, yTop + L + 55, { color: COL.dim, width: 3, alpha: m });
      } else {
        mirrors(g, lane0, yTop, 150, m);
        photon(g, lane0, yTop + L, m);
      }
      text(g, 'moving at 0.6c, seen from the ground', 1230, yTop + L + 110, { size: 28, color: COL.ink, alpha: m });
      // tick counters, both from the moment the moving clock set off
      const nr = Math.max(0, Math.floor((t - move0) / P)), nm = Math.max(0, Math.floor(tm / Pm));
      text(g, `ticks: ${nr}`, rx, yTop - 50, { size: 34, color: COL.gold, alpha: m });
      text(g, `ticks: ${nm}`, 1230, yTop - 50, { size: 34, color: COL.gold, alpha: m });
    }

    // one tick of the moving clock, frozen: the pulse's slanted path, and
    // the right triangle that half a tick makes
    const tri = win(t, A[5] + 0.1, A[7] - 0.4, 0.8, 0.8) * clocksA;
    if (tri > 0) {
      const bx = 860, by = yTop + L, half = (v * Pm) / 2;
      for (const x of [bx, bx + half, bx + 2 * half]) mirrors(g, x, yTop, 150, tri * 0.35);
      path(g, [[bx, by], [bx + half, by - L], [bx + 2 * half, by]], { color: COL.light, width: 3, alpha: tri });
      path(g, [[bx, by], [bx + half, by - L], [bx + half, by], [bx, by]], { color: COL.gold, width: 3, alpha: tri, fill: 'rgba(242,193,78,0.12)' });
      text(g, 'c·Δt/2', bx + half / 2 - 26, by - L / 2 - 10, { size: 30, color: COL.light, alpha: tri, align: 'right' });
      text(g, 'L', bx + half + 16, by - L / 2, { size: 32, italic: true, color: COL.ink, alpha: tri, align: 'left' });
      text(g, 'v·Δt/2', bx + half / 2, by + 44, { size: 30, color: COL.ink, alpha: tri });
      text(g, 'one tick of the moving clock, seen from the ground (Δt)', bx + half, by + 110, { size: 26, color: COL.dim, alpha: tri });
    }
  }

  // γ against speed
  const gp = ramp(t, A[7] - 0.2, A[7] + 1);
  if (gp > 0) {
    const ox = 980, oy = 840, w = 760, h = 560;
    const X = (b) => ox + b * w, Y = (gm) => oy - ((gm - 1) / 7) * h;
    seg(g, ox, oy, ox + w + 20, oy, { color: COL.dim, width: 2, alpha: gp });
    seg(g, ox, oy, ox, oy - h - 20, { color: COL.dim, width: 2, alpha: gp });
    for (let b = 0; b <= 1.0001; b += 0.25) text(g, `${Math.round(b * 100)}%`, X(b), oy + 36, { size: 22, color: COL.dim, alpha: gp });
    for (let gm = 1; gm <= 8; gm++) {
      seg(g, ox - 8, Y(gm), ox, Y(gm), { color: COL.dim, width: 2, alpha: gp });
      text(g, `${gm}`, ox - 18, Y(gm) + 8, { size: 22, color: COL.dim, alpha: gp, align: 'right' });
    }
    text(g, 'speed, as a fraction of c', ox + w / 2, oy + 74, { size: 24, color: COL.dim, alpha: gp });
    text(g, 'γ', ox - 50, oy - h / 2, { size: 38, italic: true, color: COL.ink, alpha: gp });
    const pts = [];
    for (let b = 0; b <= 0.9912; b += 0.002) pts.push([X(b), Y(gamma(b))]);
    path(g, pts, { color: COL.gold, width: 3.5, alpha: gp });
    const b = lerp(0, 0.99, ramp(t, A[7] + 0.8, A[7] + 6));
    const gx = X(b), gy = Y(gamma(b));
    glow(g, gx, gy, 30, COL.gold, gp * 0.8);
    circle(g, gx, gy, 8, { fill: COL.gold, alpha: gp });
    text(g, `v = ${(b * 100).toFixed(0)}% of c    γ = ${gamma(b).toFixed(2)}`, gx - 20, gy - 30, { size: 28, color: COL.ink, alpha: gp, align: 'right' });
  }
}
