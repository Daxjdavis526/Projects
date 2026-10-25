// The mathematics, as pictures. The metric as Pythagoras on a flat sheet and
// on a sphere; flat spacetime's hyperbola of equal proper time; a circle on a
// sphere falling short of 2πr; Einstein's equations; how stiff spacetime is;
// a ball of free-falling particles shrinking (Ricci) or changing shape
// (Weyl); and the ten independent components of the metric.

import { TAU, ramp, win, clamp, lerp } from '../kit.js';
import { background, text, note, path, circle, glow, seg, arrow, panel, stAxes, stPt, COL } from '../paint.js';

const DEG = Math.PI / 180;

function flatGrid(g, t, a) {
  const ox = 200, oy = 220, sz = 64;
  for (let i = 0; i <= 10; i++) {
    seg(g, ox + i * sz, oy, ox + i * sz, oy + 10 * sz, { color: COL.grid, width: 1, alpha: a * 0.35 });
    seg(g, ox, oy + i * sz, ox + 10 * sz, oy + i * sz, { color: COL.grid, width: 1, alpha: a * 0.35 });
  }
  const x0 = ox + 3 * sz, y0 = oy + 7 * sz, dx = 4 * sz, dy = 3 * sz;
  path(g, [[x0, y0], [x0 + dx, y0], [x0 + dx, y0 - dy], [x0, y0]], { color: COL.gold, width: 3.5, alpha: a, fill: 'rgba(242,193,78,0.1)' });
  text(g, 'dx', x0 + dx / 2, y0 + 40, { size: 32, italic: true, color: COL.ink, alpha: a });
  text(g, 'dy', x0 + dx + 20, y0 - dy / 2, { size: 32, italic: true, color: COL.ink, alpha: a, align: 'left' });
  text(g, 'ds', x0 + dx / 2 - 30, y0 - dy / 2 - 16, { size: 32, italic: true, color: COL.gold, alpha: a, align: 'right' });
}

function project(lat, lon, cx, cy, R, el = 20 * DEG) {
  const x = Math.cos(lat) * Math.sin(lon), y = Math.sin(lat), z = Math.cos(lat) * Math.cos(lon);
  return [cx + R * x, cy - R * (y * Math.cos(el) - z * Math.sin(el)), y * Math.sin(el) + z * Math.cos(el)];
}

function sphere(g, t, a, cx = 540, cy = 540, R = 330, capLat = null) {
  glow(g, cx, cy, R * 1.3, '#3a6fd0', 0.22 * a);
  circle(g, cx, cy, R, { fill: 'rgba(30,52,96,0.9)', stroke: '#6f8fc8', width: 2, alpha: a });
  const line = (f, n) => {
    let cur = [];
    for (let i = 0; i <= n; i++) {
      const [x, y, z] = f(i / n);
      if (z > 0) cur.push([x, y]); else { if (cur.length > 1) path(g, cur, { color: '#8fb0e6', width: 1, alpha: a * 0.4 }); cur = []; }
    }
    if (cur.length > 1) path(g, cur, { color: '#8fb0e6', width: 1, alpha: a * 0.4 });
  };
  for (let lon = -180; lon < 180; lon += 20) line((u) => project((u * 180 - 90) * DEG, lon * DEG, cx, cy, R), 90);
  for (let lat = -60; lat <= 80; lat += 20) line((u) => project(lat * DEG, (u * 360 - 180) * DEG, cx, cy, R), 120);
  if (capLat !== null) {
    const pts = [];
    for (let i = 0; i <= 120; i++) { const p = project(capLat, (i / 120) * TAU, cx, cy, R); pts.push([p[0], p[1]]); }
    path(g, pts, { color: COL.gold, width: 4, alpha: a });
    // the radius, measured along the surface from the pole
    const arc = [];
    for (let i = 0; i <= 40; i++) { const p = project(lerp(Math.PI / 2, capLat, i / 40), 0, cx, cy, R); arc.push([p[0], p[1]]); }
    path(g, arc, { color: COL.light, width: 3.5, alpha: a });
    const mid = project((Math.PI / 2 + capLat) / 2, 0, cx, cy, R);
    text(g, 'r', mid[0] + 14, mid[1], { size: 34, italic: true, color: COL.light, alpha: a, align: 'left' });
  }
}

function sphereTriangle(g, a) {
  const cx = 540, cy = 540, R = 330;
  const lat0 = 30 * DEG, lat1 = 50 * DEG, lon0 = -10 * DEG, lon1 = 20 * DEG;
  const P = (la, lo) => project(la, lo, cx, cy, R);
  const edge = (f) => { const pts = []; for (let i = 0; i <= 30; i++) { const p = f(i / 30); pts.push([p[0], p[1]]); } return pts; };
  path(g, edge((u) => P(lat0, lerp(lon0, lon1, u))), { color: COL.gold, width: 3.5, alpha: a });
  path(g, edge((u) => P(lerp(lat0, lat1, u), lon1)), { color: COL.gold, width: 3.5, alpha: a });
  path(g, edge((u) => P(lat1, lerp(lon1, lon0, u))), { color: COL.gold, width: 3.5, alpha: a });
  path(g, edge((u) => P(lerp(lat1, lat0, u), lon0)), { color: COL.gold, width: 3.5, alpha: a });
  const b = P(lat0, (lon0 + lon1) / 2), r = P(lat1, (lon0 + lon1) / 2);
  text(g, 'R sinθ dφ', b[0], b[1] + 36, { size: 26, color: COL.ink, alpha: a });
  text(g, 'shorter here', r[0], r[1] - 18, { size: 22, color: COL.dim, alpha: a });
  note(g, 'θ is measured from the north pole: the same dφ spans less distance near the pole', 540, 130, a);
}

function hyperbola(g, t, a) {
  const ox = 520, oy = 860, s = 140;
  const P = stPt(ox, oy, s);
  stAxes(g, ox, oy, s, { xmin: -3.2, xmax: 3.2, tmin: -0.2, tmax: 4.6, alpha: a });
  seg(g, ...P(0, 0), ...P(3.2, 3.2), { color: COL.light, width: 2, alpha: a * 0.7 });
  seg(g, ...P(0, 0), ...P(-3.2, 3.2), { color: COL.light, width: 2, alpha: a * 0.7 });
  // events one unit of proper time from the origin: (ct)² − x² = 1
  for (const tau of [1, 2, 3]) {
    const pts = [];
    for (let u = -2.2; u <= 2.2; u += 0.02) { const x = tau * Math.sinh(u), ct = tau * Math.cosh(u); if (Math.abs(x) < 3.2 && ct < 4.6) pts.push(P(x, ct)); }
    path(g, pts, { color: COL.gold, width: 2.5, alpha: a * (tau === 1 ? 1 : 0.5) });
  }
  // observers at different speeds, each reaching the same hyperbolas
  for (const beta of [-0.6, -0.3, 0, 0.3, 0.6]) {
    const end = 4.4 / Math.max(1, 1 / Math.sqrt(1 - beta * beta)) ;
    seg(g, ...P(0, 0), ...P(beta * 4.4, 4.4), { color: COL.blue, width: 2, alpha: a * 0.8 });
    for (const tau of [1, 2, 3]) {
      const gm = 1 / Math.sqrt(1 - beta * beta);
      const ct = tau * gm, x = beta * ct;
      if (ct < 4.6) circle(g, ...P(x, ct), 6, { fill: COL.gold, alpha: a });
    }
  }
  text(g, 'each dot: 1, 2, 3 units of proper time', 1080, 640, { size: 26, color: COL.gold, alpha: a, align: 'left' });
  text(g, 'for observers moving at different speeds', 1080, 680, { size: 26, color: COL.dim, alpha: a, align: 'left' });
  text(g, 'equal −ds² lies on hyperbolas, not circles', 1080, 720, { size: 26, color: COL.dim, alpha: a, align: 'left' });
}

function stiffness(g, t, a) {
  text(g, '8πG / c⁴  ≈  2.1 × 10⁻⁴³ per newton', 760, 340, { size: 52, weight: 300, color: COL.ink, alpha: a });
  // a drop of water, and its radius of curvature compared with the Earth–Sun distance
  const x0 = 260, y0 = 640, au = 920;
  glow(g, x0, y0, 30, COL.light, a);
  circle(g, x0, y0, 10, { fill: COL.light, alpha: a });
  text(g, 'inside water', x0, y0 + 50, { size: 24, color: COL.light, alpha: a });
  seg(g, x0, y0 - 110, x0 + au, y0 - 110, { color: COL.dim, width: 2, alpha: a });
  circle(g, x0 + au, y0 - 110, 12, { fill: '#ffd56e', alpha: a });
  text(g, 'Earth–Sun distance', x0 + au / 2, y0 - 130, { size: 24, color: COL.dim, alpha: a });
  seg(g, x0, y0 + 110, x0 + 1.5 * au, y0 + 110, { color: COL.gold, width: 3, alpha: a });
  text(g, 'radius of curvature: about 1.5 times as far', x0 + 0.75 * au, y0 + 150, { size: 26, color: COL.gold, alpha: a });
}

const RING = 28;
function ball(g, t, a, cx, cy, mode) {
  const k = ((t % 4) / 4);
  const pts = [];
  for (let i = 0; i < RING; i++) {
    const p = (i / RING) * TAU;
    let x = Math.cos(p), y = Math.sin(p);
    if (mode === 'ricci') { const f = 1 - 0.32 * k * k; x *= f; y *= f; }
    else { const e = 0.22 * k * k; x *= 1 - e; y *= 1 + 2 * e; }
    pts.push([cx + 150 * x, cy + 150 * y]);
  }
  for (const [x, y] of pts) circle(g, x, y, 7, { fill: COL.gold, alpha: a });
  circle(g, cx, cy, 150, { stroke: COL.dim, width: 1.5, alpha: a * 0.5, dash: [5, 7] });
}

function components(g, t, a) {
  const ox = 360, oy = 300, c = 96, idx = ['t', 'x', 'y', 'z'];
  for (let i = 0; i < 4; i++) {
    text(g, idx[i], ox + i * c + c / 2, oy - 18, { size: 28, italic: true, color: COL.dim, alpha: a });
    text(g, idx[i], ox - 22, oy + i * c + c / 2 + 10, { size: 28, italic: true, color: COL.dim, alpha: a, align: 'right' });
    for (let j = 0; j < 4; j++) {
      const own = j >= i;
      panel(g, ox + j * c + 4, oy + i * c + 4, c - 8, c - 8, { r: 8, alpha: a, fill: own ? 'rgba(242,193,78,0.22)' : 'rgba(30,44,70,0.5)', stroke: own ? 'rgba(242,193,78,0.6)' : 'rgba(143,179,227,0.2)' });
      text(g, `g${idx[i]}${idx[j]}`, ox + j * c + c / 2, oy + i * c + c / 2 + 10, { size: 26, italic: true, color: own ? COL.ink : COL.dim, alpha: a });
    }
  }
  text(g, 'symmetric: g_xt = g_tx, so 10 of the 16 are independent', ox + 2 * c, oy + 4 * c + 60, { size: 26, color: COL.ink, alpha: a });
  text(g, '10 unknown functions of position and time', 1340, 420, { size: 32, color: COL.gold, alpha: a });
  text(g, '10 coupled, nonlinear partial differential equations', 1340, 470, { size: 28, color: COL.ink, alpha: a });
  text(g, 'nonlinear because gravity’s own energy gravitates', 1340, 520, { size: 24, color: COL.dim, alpha: a });
}

export default function draw(g, t, s) {
  const A = s.at;
  background(g, t, { stars: 60, seed: 81 });
  // 0. coordinates are labels
  const c0 = win(t, 0.3, A[1], 0.8, 0.6);
  if (c0 > 0) {
    for (let i = -6; i <= 6; i++) {
      const pts = [], pts2 = [];
      for (let j = -6; j <= 6; j++) {
        const f = (u, v) => [960 + u * 70 + 12 * Math.sin(v * 0.6), 520 + v * 60 + 10 * Math.sin(u * 0.5)];
        pts.push(f(i, j)); pts2.push(f(j, i));
      }
      path(g, pts, { color: COL.grid, width: 1.2, alpha: c0 * 0.5 });
      path(g, pts2, { color: COL.grid, width: 1.2, alpha: c0 * 0.5 });
    }
    circle(g, 960 - 70, 520 + 60, 8, { fill: COL.gold, alpha: c0 });
    circle(g, 960 + 140, 520 - 60, 8, { fill: COL.gold, alpha: c0 });
    seg(g, 960 - 70, 520 + 60, 960 + 140, 520 - 60, { color: COL.gold, width: 3, alpha: c0, dash: [6, 6] });
    text(g, 'coordinates are only labels — the metric turns them into real distances', 960, 190, { size: 30, color: COL.ink, alpha: c0 });
  }
  const f1 = win(t, A[1] - 0.2, A[2], 0.8, 0.6);
  if (f1 > 0) flatGrid(g, t, f1);
  const f2 = win(t, A[2] - 0.2, A[3], 0.8, 0.6);
  if (f2 > 0) { sphere(g, t, f2); sphereTriangle(g, f2); }
  const f3 = win(t, A[3] - 0.2, A[4], 0.8, 0.6);
  if (f3 > 0) hyperbola(g, t, f3);
  const f4 = win(t, A[4] - 0.2, A[5], 0.8, 0.6);
  if (f4 > 0) {
    const r = ramp(t, A[4] + 0.5, A[4] + 4) * 60 * DEG;      // radius as an angle from the pole
    sphere(g, t, f4, 540, 560, 320, Math.PI / 2 - r);
    const ratio = r > 0.001 ? Math.sin(r) / r : 1;
    text(g, `circumference ÷ 2πr = ${ratio.toFixed(3)}`, 1340, 560, { size: 34, color: COL.gold, alpha: f4 });
    text(g, 'on a flat sheet it would be exactly 1', 1340, 610, { size: 26, color: COL.dim, alpha: f4 });
    text(g, 'Earth, r = 100 km: 25.8 m short of 2πr', 1340, 700, { size: 30, color: COL.ink, alpha: f4 });
  }
  const f5 = win(t, A[5] - 0.2, A[7], 0.9, 0.6);
  if (f5 > 0) {
    glow(g, 960, 420, 700, '#3050a0', 0.25 * f5);
    const st = win(t, A[6], A[7], 0.8, 0.6);
    if (st > 0) stiffness(g, t, st);
  }
  const f7 = win(t, A[7] - 0.2, A[9], 0.8, 0.6);
  if (f7 > 0) {
    const r = ramp(t, A[7], A[7] + 0.8) * f7, w = ramp(t, A[8] - 0.2, A[8] + 0.8) * f7;
    // inside matter: a haze, and the ball shrinking
    glow(g, 560, 560, 360, '#4a6fc0', 0.5 * r);
    ball(g, t - A[7], r, 560, 560, 'ricci');
    text(g, 'inside matter: the ball starts to shrink', 560, 790, { size: 28, color: COL.ink, alpha: r });
    text(g, '(Ricci curvature: volume)', 560, 830, { size: 24, color: COL.dim, alpha: r });
    // in vacuum near a mass: stretched one way, squeezed the other
    ball(g, t - A[8], w, 1360, 560, 'weyl');
    circle(g, 1360, 160, 34, { fill: '#cfd3da', alpha: w });
    text(g, 'Moon', 1420, 170, { size: 24, color: COL.dim, alpha: w, align: 'left' });
    text(g, 'in empty space: shape changes, volume doesn’t', 1360, 790, { size: 28, color: COL.ink, alpha: w });
    text(g, '(Weyl curvature: tides, gravitational waves)', 1360, 830, { size: 24, color: COL.dim, alpha: w });
    note(g, 'deformations exaggerated', 960, 880, Math.max(r, w));
  }
  const f9 = ramp(t, A[9] - 0.2, A[9] + 0.8);
  if (f9 > 0) components(g, t, f9);
}
