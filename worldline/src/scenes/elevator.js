// The equivalence principle. Two metals falling together; free fall without
// weight; three boxes — a falling elevator, a rocket accelerating at 9.8 m/s²
// in deep space, a room on Earth — and why the last two can't be told apart;
// a light beam bending inside the accelerating rocket; and an orbit as a fall.

import { TAU, ramp, win, clamp, hash } from '../kit.js';
import { background, text, note, path, circle, glow, seg, arrow, panel, rrect, COL } from '../paint.js';

const PW = 470, PH = 500, PT = 200;

function figure(g, x, yFeet, a, color = COL.ink, tilt = 0) {
  g.save();
  g.translate(x, yFeet); g.rotate(tilt);
  circle(g, 0, -118, 17, { fill: color, alpha: a });
  path(g, [[0, -100], [0, -45]], { color, width: 8, alpha: a });
  path(g, [[-22, -78], [0, -92], [22, -78]], { color, width: 6, alpha: a });
  path(g, [[-14, 0], [0, -45], [14, 0]], { color, width: 7, alpha: a });
  g.restore();
}

function scale(g, x, y, reading, a) {
  panel(g, x - 40, y - 10, 80, 16, { r: 4, alpha: a, fill: '#3b4a68', stroke: null });
  text(g, reading, x, y + 40, { size: 22, color: COL.dim, alpha: a });
}

function box(g, cx, a, label) {
  panel(g, cx - PW / 2, PT, PW, PH, { alpha: a, r: 16, fill: 'rgba(12,20,38,0.9)' });
  text(g, label, cx, PT + PH + 96, { size: 26, color: COL.ink, alpha: a });
}

// apple dropped at `t0`, falling 9.8 m/s² relative to the floor, looping
function appleY(t, t0, yHand, yFloor) {
  const T = 3.2;
  if (t < t0) return yHand;
  const k = ((t - t0) % T);
  const fall = 0.5 * 600 * k * k;           // px, an on-screen 9.8 m/s²
  return Math.min(yHand + fall, yFloor);
}

function apple(g, x, y, a) { circle(g, x, y, 13, { fill: '#e2504a', alpha: a }); seg(g, x, y - 13, x + 3, y - 22, { color: '#7a5', width: 3, alpha: a }); }

export default function draw(g, t, s) {
  const A = s.at;
  background(g, t, { stars: 40, seed: 51 });

  // 1. two metals fall together
  const m1 = win(t, 0.2, A[1], 0.8, 0.8);
  if (m1 > 0) {
    const cx = 960;
    panel(g, cx - 360, 170, 720, 600, { alpha: m1 * 0.8 });
    for (let k = 0; k <= 10; k++) seg(g, cx - 330, 210 + k * 50, cx - 300, 210 + k * 50, { color: COL.dim, width: 2, alpha: m1 });
    const k = ((t - 0.2) % 2.6) / 2.6;
    const y = 220 + 500 * k * k;
    circle(g, cx - 90, y, 30, { fill: '#b9c2cf', alpha: m1 });
    circle(g, cx + 90, y, 30, { fill: '#e6e2d6', alpha: m1 });
    text(g, 'titanium', cx - 90, y - 46, { size: 24, color: COL.dim, alpha: m1 });
    text(g, 'platinum', cx + 90, y - 46, { size: 24, color: COL.dim, alpha: m1 });
    seg(g, cx - 160, y, cx + 160, y, { color: COL.gold, width: 1.5, alpha: m1 * 0.6, dash: [5, 7] });
    text(g, 'MICROSCOPE (2022): the same acceleration to a few parts in 10¹⁵', cx, 830, { size: 26, color: COL.ink, alpha: m1 });
  }

  // 2. falling freely, no weight felt
  const m2 = win(t, A[1] - 0.2, A[2], 0.8, 0.8);
  if (m2 > 0) {
    const cx = 960;
    // a building wall scrolling up past the faller
    const scroll = ((t - A[1]) * 380) % 160;
    for (let k = -1; k < 7; k++) {
      const y = 140 + k * 160 - scroll;
      panel(g, cx - 380, y, 140, 100, { alpha: m2 * 0.6, r: 6, fill: '#1e2a44', stroke: null });
    }
    figure(g, cx + 40, 640, m2, COL.ink, 0.08 * Math.sin(t));
    text(g, '“the happiest thought of my life”', cx + 300, 420, { face: '"Cormorant Garamond", Georgia, serif', size: 46, italic: true, color: COL.ink, alpha: m2, align: 'left' });
    text(g, 'Einstein, 1907', cx + 300, 470, { size: 24, spacing: 4, color: COL.dim, alpha: m2, align: 'left' });
    text(g, 'falling freely: no felt weight', cx + 40, 720, { size: 26, color: COL.gold, alpha: m2 });
  }

  // 3–4. the three boxes
  const bx = win(t, A[2] - 0.2, A[5], 0.9, 0.8);
  if (bx > 0) {
    const xs = [330, 960, 1590];
    // (a) falling elevator: shaft scrolling up, everything floats
    box(g, xs[0], bx, 'falling elevator');
    const sc = ((t - A[2]) * 420) % 120;
    for (let k = -1; k < 6; k++) seg(g, xs[0] - PW / 2 - 18, PT + k * 120 - sc, xs[0] - PW / 2 - 18, PT + k * 120 + 60 - sc, { color: COL.dim, width: 4, alpha: bx * 0.6 });
    for (let k = -1; k < 6; k++) seg(g, xs[0] + PW / 2 + 18, PT + k * 120 - sc, xs[0] + PW / 2 + 18, PT + k * 120 + 60 - sc, { color: COL.dim, width: 4, alpha: bx * 0.6 });
    const fl = Math.sin((t - A[2]) * 0.8) * 12;
    figure(g, xs[0] - 50, PT + PH - 70 + fl, bx, COL.ink, 0.15 * Math.sin((t - A[2]) * 0.5));
    apple(g, xs[0] + 90, PT + 230 - fl * 0.7, bx);
    scale(g, xs[0] - 50, PT + PH - 30, 'scale: 0', bx);
    arrow(g, xs[0] + PW / 2 + 50, PT + 160, xs[0] + PW / 2 + 50, PT + 260, { color: COL.dim, width: 3, alpha: bx });
    // (b) rocket: stars stream past faster and faster; (c) a room on Earth
    const b = ramp(t, A[3] - 0.2, A[3] + 0.8) * bx;
    if (b > 0) {
      box(g, xs[1], b, 'rocket, accelerating at 9.8 m/s²');
      box(g, xs[2], b, 'a room on Earth');
      const tt = t - A[3];
      for (let i = 0; i < 18; i++) {
        const y = (hash(i, 3) * 900 + 0.5 * 30 * tt * tt * (0.6 + hash(i, 4))) % 900;
        circle(g, xs[1] + (hash(i, 5) - 0.5) * (PW + 160), 120 + y, 1.6, { fill: '#dfe8ff', alpha: b * 0.8 });
      }
      path(g, [[xs[1] - 34, PT + PH + 2], [xs[1], PT + PH + 50 + 8 * Math.sin(t * 30)], [xs[1] + 34, PT + PH + 2]], { color: COL.gold, width: 0, alpha: b, fill: 'rgba(255,170,80,0.85)', close: true });
      g.save(); g.globalAlpha = b; g.fillStyle = '#2d6b3f'; g.fillRect(xs[2] - PW / 2, PT + PH + 4, PW, 26); g.restore();
      for (const x of [xs[1], xs[2]]) {
        figure(g, x - 70, PT + PH - 40, b);
        scale(g, x - 70, PT + PH - 30, 'scale: normal weight', b);
        const y = appleY(t, A[3] + 1.2, PT + 280, PT + PH - 52);
        apple(g, x + 80, y, b);
      }
      const eq = ramp(t, A[4] - 0.2, A[4] + 0.8) * b;
      text(g, '=', (xs[1] + xs[2]) / 2, PT + PH / 2 + 20, { size: 90, weight: 300, color: COL.gold, alpha: eq });
      text(g, 'no experiment inside a small box can tell these two apart', (xs[1] + xs[2]) / 2, PT - 30, { size: 26, color: COL.gold, alpha: eq });
    }
  }

  // 5. light falls: a beam crossing the accelerating rocket (in the rocket's frame)
  const lb = win(t, A[5] - 0.2, A[6] + 0.3, 0.9, 0.6);
  if (lb > 0) {
    const x0 = 520, x1 = 1400, y0 = 330, cx = (x0 + x1) / 2;
    panel(g, x0 - 20, 190, x1 - x0 + 40, 560, { alpha: lb, fill: 'rgba(12,20,38,0.9)' });
    path(g, [[cx - 60, 752], [cx, 820 + 10 * Math.sin(t * 30)], [cx + 60, 752]], { color: COL.gold, width: 0, alpha: lb, fill: 'rgba(255,170,80,0.85)', close: true });
    arrow(g, x1 + 90, 700, x1 + 90, 360, { color: COL.dim, width: 3, alpha: lb });
    text(g, 'accelerating', x1 + 110, 540, { size: 22, color: COL.dim, alpha: lb, align: 'left' });
    const drop = 240;                                   // exaggerated
    const k = clamp(((t - A[5] - 0.8) % 3.4) / 2.2);
    const pts = [];
    for (let i = 0; i <= 80 * k; i++) { const u = i / 80; pts.push([x0 + (x1 - x0) * u, y0 + drop * u * u]); }
    path(g, pts, { color: COL.light, width: 4, alpha: lb });
    if (pts.length) { const [hx, hy] = pts[pts.length - 1]; glow(g, hx, hy, 30, COL.light, lb); }
    seg(g, x0, y0, x1, y0, { color: COL.dim, width: 1.5, alpha: lb * 0.6, dash: [6, 8] });
    text(g, 'aimed straight across', x1 - 10, y0 - 16, { size: 22, color: COL.dim, alpha: lb, align: 'right' });
    text(g, 'lands lower', x1 - 10, y0 + drop + 40, { size: 24, color: COL.light, alpha: lb * k, align: 'right' });
    note(g, 'the bend is hugely exaggerated', cx, 730, lb);
  }
  // 6. only half the answer
  const hf = win(t, A[6] - 0.2, A[7], 0.8, 0.8);
  if (hf > 0) {
    const bx0 = 620, by = 860, w = 330;
    const bar = (y, val, col, lab) => {
      g.save(); g.globalAlpha = hf; g.fillStyle = col; g.fillRect(bx0, y - 18, w * (val / 1.75) * ramp(t, A[6] + 0.5, A[6] + 2), 36); g.restore();
      text(g, lab, bx0 - 20, y + 9, { size: 24, color: COL.ink, alpha: hf, align: 'right' });
      text(g, `${val.toFixed(2)}″`, bx0 + w * (val / 1.75) + 16, y + 9, { size: 26, color: col, alpha: hf * ramp(t, A[6] + 1.5, A[6] + 2.2), align: 'left' });
    };
    panel(g, 220, by - 300, 1480, 200, { alpha: hf * 0.0 });
    bar(by - 250, 0.87, COL.blue, 'acceleration argument alone');
    bar(by - 190, 1.75, COL.gold, 'general relativity, as measured');
    text(g, 'starlight grazing the Sun', bx0 + w / 2, by - 300, { size: 24, color: COL.dim, alpha: hf });
  }
  // 7. you are the one accelerating; an orbit is a fall
  const or = ramp(t, A[7] - 0.2, A[7] + 1);
  if (or > 0) {
    const ex = 1240, ey = 560, R = 170;
    glow(g, ex, ey, 260, '#4f8fff', 0.3 * or);
    circle(g, ex, ey, R, { fill: '#2f6fd6', alpha: or });
    circle(g, ex - 40, ey - 50, 60, { fill: '#58a06b', alpha: or * 0.6 });
    const orb = R + 34;
    circle(g, ex, ey, orb, { stroke: COL.dim, width: 1.5, alpha: or * 0.6, dash: [4, 8] });
    const ph = (t - A[7]) * 0.5;
    const ix = ex + orb * Math.cos(ph), iy = ey - orb * Math.sin(ph);
    glow(g, ix, iy, 22, COL.gold, or);
    circle(g, ix, iy, 6, { fill: COL.gold, alpha: or });
    text(g, 'space station: falling all the way around', ex, ey + orb + 60, { size: 26, color: COL.gold, alpha: or });
    note(g, 'orbit height exaggerated', ex, ey + orb + 100, or);
    figure(g, 560, 720, or);
    g.save(); g.globalAlpha = or; g.fillStyle = '#2d6b3f'; g.fillRect(380, 724, 360, 24); g.restore();
    arrow(g, 560, 830, 560, 760, { color: COL.coral, width: 5, alpha: or });
    text(g, 'the floor pushes you up,', 560, 450, { size: 28, color: COL.ink, alpha: or });
    text(g, 'off your free-fall path', 560, 490, { size: 28, color: COL.ink, alpha: or });
  }
}
