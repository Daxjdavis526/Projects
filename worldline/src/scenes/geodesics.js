// Curved spacetime. Two walkers heading due north along meridians of a
// globe (great circles) converge without turning; two balls falling toward
// Earth's centre converge too — the tide that no frame removes. An orbit is a
// helix of a worldline. Higher clocks run faster. A thrown ball's path is
// the one with the most proper time (computed for four candidate paths).
// And the rubber sheet, with what it gets wrong.

import { TAU, ramp, win, clamp, lerp } from '../kit.js';
import { background, text, note, path, circle, glow, seg, arrow, panel, clockFace, COL } from '../paint.js';
import { thrownBallGain } from '../physics.js';

const DEG = Math.PI / 180;

// orthographic globe, tilted so the north pole leans toward the viewer
function project(lat, lon, cx, cy, R, el = 22 * DEG, lon0 = 0) {
  const x = Math.cos(lat) * Math.sin(lon - lon0), y = Math.sin(lat), z = Math.cos(lat) * Math.cos(lon - lon0);
  const y2 = y * Math.cos(el) - z * Math.sin(el), z2 = y * Math.sin(el) + z * Math.cos(el);
  return [cx + R * x, cy - R * y2, z2];
}

function globe(g, t, A, a) {
  const cx = 720, cy = 520, R = 340;
  glow(g, cx, cy, R * 1.4, '#3a6fd0', 0.25 * a);
  circle(g, cx, cy, R, { fill: 'rgba(30,52,96,0.9)', stroke: '#6f8fc8', width: 2, alpha: a });
  const curve = (f, n = 90) => {
    let seg0 = [];
    const out = [];
    for (let i = 0; i <= n; i++) {
      const [x, y, z] = f(i / n);
      if (z > 0) seg0.push([x, y]); else { if (seg0.length > 1) out.push(seg0); seg0 = []; }
    }
    if (seg0.length > 1) out.push(seg0);
    return out;
  };
  for (let lon = -180; lon < 180; lon += 20) for (const s of curve((u) => project((u * 180 - 90) * DEG, lon * DEG, cx, cy, R))) path(g, s, { color: '#8fb0e6', width: 1, alpha: a * 0.35 });
  for (let lat = -60; lat <= 80; lat += 20) for (const s of curve((u) => project(lat * DEG, (u * 360 - 180) * DEG, cx, cy, R), 120)) path(g, s, { color: lat === 0 ? '#c9d6ea' : '#8fb0e6', width: lat === 0 ? 2 : 1, alpha: a * (lat === 0 ? 0.8 : 0.35) });
  text(g, 'equator', ...project(-6 * DEG, -60 * DEG, cx, cy, R).slice(0, 2), { size: 22, color: COL.dim, alpha: a });
  // the walkers: due north from the equator, 50° of longitude apart
  const k = ramp(t, 1.2, A[1] + 3, (u) => u);
  const lat = k * 90 * DEG;
  const lons = [-25 * DEG, 25 * DEG];
  const cols = [COL.gold, COL.light];
  lons.forEach((lon, i) => {
    const pts = [];
    for (let j = 0; j <= 60; j++) { const p = project((j / 60) * lat, lon, cx, cy, R); pts.push([p[0], p[1]]); }
    path(g, pts, { color: cols[i], width: 4, alpha: a });
    const [x, y] = project(lat, lon, cx, cy, R);
    glow(g, x, y, 24, cols[i], a);
    circle(g, x, y, 8, { fill: cols[i], alpha: a });
  });
  // the gap between them, along their shared latitude
  if (k < 0.97) {
    const gap = [];
    for (let j = 0; j <= 30; j++) { const p = project(lat, lerp(lons[0], lons[1], j / 30), cx, cy, R); gap.push([p[0], p[1]]); }
    path(g, gap, { color: COL.ink, width: 1.5, alpha: a * 0.7, dash: [4, 6] });
  }
  const sep = 50 * Math.cos(lat);
  text(g, 'gap = 50° of longitude × cos(latitude)', 1450, 380, { size: 26, color: COL.ink, alpha: a });
  text(g, `latitude ${(k * 90).toFixed(0)}°  →  gap ${(sep * 111).toFixed(0)} km`, 1450, 430, { size: 30, color: COL.gold, alpha: a });
  text(g, 'neither walker ever turns', 1450, 520, { size: 28, color: COL.dim, alpha: a });
  note(g, '(1° of longitude at the equator ≈ 111 km)', 1450, 470, a);
}

function tides(g, t, A, a) {
  const cx = 960, cy = 1560, R = 820;
  glow(g, cx, cy, R * 1.15, '#3a6fd0', 0.3 * a);
  circle(g, cx, cy, R, { fill: '#2f6fd6', alpha: a });
  text(g, 'Earth', cx, cy - R + 70, { size: 28, color: COL.ink, alpha: a });
  const start = 190, k = ((t - A[2]) % 5.5) / 5.5;
  const fall = 470 * k * k;
  const sep0 = 300;
  const angle = Math.atan2(sep0 / 2, cy - start);
  // each ball's path: a straight line toward Earth's centre (drawn to the surface)
  const surf = cy - R;
  for (const sgn of [-1, 1]) {
    seg(g, cx + sgn * sep0 / 2, start, cx + sgn * Math.tan(angle) * (cy - surf), surf, { color: COL.dim, width: 1, alpha: a * 0.4, dash: [4, 8] });
  }
  const [x1, y1] = [cx - Math.tan(angle) * (cy - start - fall), start + fall];
  const [x2, y2] = [cx + Math.tan(angle) * (cy - start - fall), start + fall];
  // the free-falling frame around them
  panel(g, x1 - 70, y1 - 70, x2 - x1 + 140, 140, { alpha: a * 0.6, fill: 'rgba(12,20,38,0.35)', stroke: 'rgba(242,193,78,0.5)' });
  for (const [x, y] of [[x1, y1], [x2, y2]]) { glow(g, x, y, 30, COL.gold, a); circle(g, x, y, 14, { fill: COL.gold, alpha: a }); }
  arrow(g, x1 + 24, y1, x1 + 74, y1, { color: COL.coral, width: 3, alpha: a });
  arrow(g, x2 - 24, y2, x2 - 74, y2, { color: COL.coral, width: 3, alpha: a });
  text(g, `gap ${((x2 - x1) / sep0 * 100).toFixed(1)}% of start`, cx, y1 - 90, { size: 26, color: COL.ink, alpha: a });
  note(g, 'each ball falls straight toward Earth’s centre', 1560, 300, a);
  note(g, 'the convergence is exaggerated', 1560, 336, a);
}

function helix(g, t, A, a) {
  const cx = 960, base = 800, top = 150, R = 220;
  // Earth's worldline: a tube
  g.save(); g.globalAlpha = a * 0.5; g.fillStyle = '#2f6fd6'; g.fillRect(cx - 50, top, 100, base - top); g.restore();
  circle(g, cx, base, 50, { fill: '#2f6fd6', alpha: a });
  text(g, 'Earth’s worldline', cx, base + 84, { size: 24, color: COL.ink, alpha: a });
  const k = ramp(t, A[4], A[5] + 4, (u) => u);
  const turns = 3.2, n = 400;
  const front = [], back = [];
  for (let i = 0; i <= n * k; i++) {
    const u = i / n, th = u * turns * TAU;
    const x = cx + R * Math.cos(th), y = base - u * (base - top) - 40 * Math.sin(th);
    (Math.sin(th) < 0 ? back : front).push([x, y, i]);
  }
  // draw as dots so the depth order reads
  for (const [x, y] of back) circle(g, x, y, 2.4, { fill: COL.gold, alpha: a * 0.35 });
  for (const [x, y] of front) circle(g, x, y, 2.8, { fill: COL.gold, alpha: a });
  arrow(g, cx + R + 140, base, cx + R + 140, top, { color: COL.dim, width: 3, alpha: a });
  text(g, 'time', cx + R + 160, (base + top) / 2, { size: 26, color: COL.dim, alpha: a, align: 'left' });
  text(g, 'a satellite’s worldline:', cx - R - 160, 380, { size: 26, color: COL.gold, alpha: a, align: 'right' });
  text(g, 'a helix, the straightest path', cx - R - 160, 418, { size: 26, color: COL.gold, alpha: a, align: 'right' });
  text(g, 'available in curved spacetime', cx - R - 160, 456, { size: 26, color: COL.gold, alpha: a, align: 'right' });
  note(g, 'time axis compressed enormously: one orbit is light-hours tall', cx - R - 160, 500, a, 'right');
}

function towerClocks(g, t, A, a) {
  const cx = 960;
  for (let i = 0; i < 5; i++) {
    const y = 780 - i * 150, rate = 1 + 0.035 * i;           // exaggerated
    clockFace(g, cx, y, 52, ((t - A[6]) / 5) * rate, { alpha: a, hand: i > 2 ? COL.gold : COL.blue });
    text(g, i === 4 ? 'higher: faster' : i === 0 ? 'lower: slower' : '', cx + 90, y + 8, { size: 26, color: COL.ink, alpha: a, align: 'left' });
  }
  note(g, 'rates exaggerated', cx, 870, a);
}

function thrown(g, t, A, a) {
  // left: the everyday picture, h against t
  const ox = 220, oy = 760, w = 640, h = 440;
  const v0 = 10, gg = 9.81, T = (2 * v0) / gg, hmax = (v0 * v0) / (2 * gg);
  const X = (tt) => ox + (tt / T) * w, Y = (hh) => oy - (hh / 6) * h;
  seg(g, ox, oy, ox + w + 20, oy, { color: COL.dim, width: 2, alpha: a });
  seg(g, ox, oy, ox, oy - h - 20, { color: COL.dim, width: 2, alpha: a });
  text(g, `time (0 to ${T.toFixed(2)} s)`, ox + w / 2, oy + 40, { size: 22, color: COL.dim, alpha: a });
  text(g, 'height (m)', ox - 14, oy - h - 30, { size: 22, color: COL.dim, alpha: a, align: 'left' });
  const show = ramp(t, A[8] - 0.2, A[8] + 1) * a;
  const ks = [[0, COL.blue], [0.5, COL.violet], [1, COL.gold], [1.5, COL.coral]];
  for (const [k, col] of ks) {
    if (k !== 1 && show <= 0) continue;
    const pts = [];
    for (let i = 0; i <= 80; i++) { const tt = (i / 80) * T; pts.push([X(tt), Y(k * (v0 * tt - 0.5 * gg * tt * tt))]); }
    path(g, pts, { color: col, width: k === 1 ? 4 : 2.5, alpha: k === 1 ? a : show, dash: k === 1 ? null : [8, 6] });
  }
  text(g, 'ball thrown up at 10 m/s', ox + w / 2, Y(hmax) - 30, { size: 24, color: COL.gold, alpha: a });
  // right: the same events in spacetime proportions
  const sp = win(t, A[7] + 1, A[8], 1, 0.8);
  if (sp > 0) {
    const rx = 1060, ry = 520, rw = 720;
    seg(g, rx, ry, rx + rw, ry, { color: COL.gold, width: 4, alpha: sp });
    circle(g, rx, ry, 7, { fill: COL.gold, alpha: sp }); circle(g, rx + rw, ry, 7, { fill: COL.gold, alpha: sp });
    text(g, 'the same path, with time drawn as ct:', rx + rw / 2, ry - 120, { size: 26, color: COL.ink, alpha: sp });
    text(g, '600,000 km of time, at most 5.1 m of height', rx + rw / 2, ry - 70, { size: 28, color: COL.gold, alpha: sp });
    text(g, 'drawn to true proportions, it is straight', rx + rw / 2, ry + 60, { size: 24, color: COL.dim, alpha: sp });
  }
  // the proper time each candidate path collects
  if (show > 0) {
    const bx = 1120, by = 330;
    text(g, 'extra time on the ball’s clock (×10⁻¹⁶ s)', bx + 260, by - 50, { size: 24, color: COL.dim, alpha: show });
    ks.forEach(([k, col], i) => {
      const val = thrownBallGain(k) * 1e16;
      const y = by + i * 80;
      text(g, k === 0 ? 'stay put' : k === 1 ? 'free fall' : k < 1 ? 'lower arc' : 'higher arc', bx - 20, y + 9, { size: 26, color: col, alpha: show, align: 'right' });
      g.save(); g.globalAlpha = show; g.fillStyle = col; g.fillRect(bx, y - 16, 120 * val * ramp(t, A[8] + 0.6, A[8] + 2.2), 32); g.restore();
      text(g, val.toFixed(1), bx + 120 * val + 14, y + 9, { size: 26, color: COL.ink, alpha: show * ramp(t, A[8] + 1.8, A[8] + 2.4), align: 'left' });
    });
    text(g, 'free fall collects the most', bx + 260, by + 340, { size: 30, color: COL.gold, alpha: show * ramp(t, A[8] + 2.4, A[8] + 3.4) });
  }
}

function rubberSheet(g, t, A, a) {
  const cx = 600, cy = 470;
  // a grid pulled down around a ball, seen at an angle
  for (let i = -8; i <= 8; i++) {
    const row = [], col = [];
    for (let j = -8; j <= 8; j++) {
      const f = (x, z) => { const r = Math.hypot(x, z); return 180 / (1 + (r / 2.2) ** 2); };
      row.push([cx + j * 52 + i * 18, cy + i * 22 + f(j, i)]);
      col.push([cx + i * 52 + j * 18, cy + j * 22 + f(i, j)]);
    }
    path(g, row, { color: '#8fb0e6', width: 1.5, alpha: a * 0.6 });
    path(g, col, { color: '#8fb0e6', width: 1.5, alpha: a * 0.6 });
  }
  circle(g, cx, cy + 140, 46, { fill: '#ffd56e', alpha: a });
  arrow(g, cx, cy + 210, cx, cy + 300, { color: COL.coral, width: 4, alpha: a });
  text(g, 'pulled down by… gravity?', cx + 30, cy + 320, { size: 24, color: COL.coral, alpha: a, align: 'left' });
  const items = [['✓', 'mass distorts its surroundings', COL.green], ['✗', 'uses gravity to explain gravity', COL.coral], ['✗', 'leaves out time — the main part', COL.coral], ['✗', 'needs a fictitious extra dimension', COL.coral]];
  items.forEach(([m, s, c], i) => {
    const k = ramp(t, A[9] + 0.8 + i * 1.2, A[9] + 1.6 + i * 1.2) * a;
    text(g, m, 1180, 300 + i * 70, { size: 34, color: c, alpha: k });
    text(g, s, 1220, 300 + i * 70, { size: 28, color: COL.ink, alpha: k, align: 'left' });
  });
}

export default function draw(g, t, s) {
  const A = s.at;
  background(g, t, { stars: 70, seed: 71 });
  const gl = win(t, 0.3, A[2], 1, 0.8);
  if (gl > 0) globe(g, t, A, gl);
  const td = win(t, A[2] - 0.2, A[4], 0.9, 0.8);
  if (td > 0) tides(g, t, A, td);
  const hx = win(t, A[4] - 0.2, A[6], 0.9, 0.8);
  if (hx > 0) helix(g, t, A, hx);
  const tc = win(t, A[6] - 0.2, A[7], 0.8, 0.8);
  if (tc > 0) towerClocks(g, t, A, tc);
  const th = win(t, A[7] - 0.2, A[9], 0.9, 0.8);
  if (th > 0) thrown(g, t, A, th);
  const rs = ramp(t, A[9] - 0.2, A[9] + 1);
  if (rs > 0) rubberSheet(g, t, A, rs);
}
