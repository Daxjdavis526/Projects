// Spacetime: the interval, the light cone and causality, proper time as an
// odometer, and the twins — each twin's worldline marked off in years of
// that twin's own clock, from the Lorentz geometry.

import { TAU, ramp, win, clamp, lerp } from '../kit.js';
import { background, text, note, path, circle, glow, seg, arrow, panel, clockFace, stAxes, stPt, COL } from '../paint.js';
import { gamma, travellerAt, travellerProperTime } from '../physics.js';

function cone(g, cx, cy, R, a) {
  const h = R, rx = R * 0.95, ry = R * 0.2;
  // filled interiors first
  g.save();
  g.globalAlpha = a * 0.12;
  g.fillStyle = COL.gold;
  g.beginPath(); g.moveTo(cx, cy); g.lineTo(cx - rx, cy - h); g.ellipse(cx, cy - h, rx, ry, 0, Math.PI, 0, true); g.closePath(); g.fill();
  g.fillStyle = COL.blue;
  g.beginPath(); g.moveTo(cx, cy); g.lineTo(cx - rx, cy + h); g.ellipse(cx, cy + h, rx, ry, 0, Math.PI, 0, false); g.closePath(); g.fill();
  g.restore();
  const rim = (y, dash) => {
    const pts = [];
    for (let i = 0; i <= 96; i++) { const p = (i / 96) * TAU; pts.push([cx + rx * Math.cos(p), y + ry * Math.sin(p)]); }
    path(g, pts, { color: COL.light, width: 2.5, alpha: a, dash });
  };
  rim(cy - h, null); rim(cy + h, [8, 8]);
  seg(g, cx - rx, cy - h, cx + rx, cy + h, { color: COL.light, width: 2.5, alpha: a });
  seg(g, cx + rx, cy - h, cx - rx, cy + h, { color: COL.light, width: 2.5, alpha: a });
  glow(g, cx, cy, 40, '#ffffff', a * 0.6);
  circle(g, cx, cy, 8, { fill: '#ffffff', alpha: a });
  text(g, 'here and now', cx + 22, cy + 8, { size: 24, color: COL.ink, alpha: a, align: 'left' });
}

// A wiggly worldline x(ct) = 0.8 sin(π ct / 3) between the same two events
// as the straight one, (0, 0) and (0, 6) — top speed 0.84c — and the ct
// values where its own clock completes each half unit of proper time.
const wig = (ct) => 0.8 * Math.sin((Math.PI * ct) / 3);
const WIGGLE = (() => {
  const ticks = [];
  let tau = 0, next = 0.5;
  for (let ct = 0; ct <= 6; ct += 0.001) {
    const v = ((0.8 * Math.PI) / 3) * Math.cos((Math.PI * ct) / 3);
    tau += Math.sqrt(1 - v * v) * 0.001;
    if (tau >= next) { ticks.push(ct); next += 0.5; }
  }
  return ticks;
})();

function odometer(g, t, a) {
  const ox = 700, oy = 870, s = 95;
  const P = stPt(ox, oy, s);
  stAxes(g, ox, oy, s, { xmin: -3, xmax: 3, tmin: -0.2, tmax: 6.2, alpha: a });
  const pts = [];
  for (let ct = 0; ct <= 6.001; ct += 0.05) pts.push(P(wig(ct), ct));
  seg(g, ...P(0, 0), ...P(0, 6), { color: COL.blue, width: 3, alpha: a * 0.8 });
  for (let k = 1; k <= 12; k++) circle(g, ...P(0, k * 0.5), 5, { fill: COL.blue, alpha: a * 0.8 });
  path(g, pts, { color: COL.gold, width: 3.5, alpha: a });
  for (const ct of WIGGLE) circle(g, ...P(wig(ct), ct), 6, { fill: COL.gold, alpha: a });
  for (const ct of [0, 6]) circle(g, ...P(0, ct), 9, { fill: COL.ink, alpha: a });
  text(g, `wandering clock: ${WIGGLE.length} ticks`, ...P(0.95, 1.5), { size: 24, color: COL.gold, alpha: a, align: 'left' });
  text(g, 'straight clock: 12 ticks', ...P(0.2, 4.1), { size: 24, color: COL.blue, alpha: a, align: 'left' });
  note(g, 'dots: every half unit of each clock’s own proper time', 1150, 760, a, 'left');
  note(g, 'the wandering clock records less time between the same two events', 1150, 795, a, 'left');
}

function twins(g, t, A, D, beta, a) {
  const ox = 760, oy = 880, s = 72;
  const P = stPt(ox, oy, s);
  stAxes(g, ox, oy, s, { xmin: -2.2, xmax: 6.4, tmin: -0.2, tmax: 10.6, alpha: a, labels: false });
  text(g, 'light-years', ...P(6.3, -0.55), { size: 22, color: COL.dim, alpha: a, align: 'right' });
  text(g, 'years', ...P(0.15, 10.55), { size: 22, color: COL.dim, alpha: a, align: 'left' });
  // light from the departure, for reference
  seg(g, ...P(0, 0), ...P(6.2, 6.2), { color: COL.light, width: 1.5, alpha: a * 0.35, dash: [5, 7] });
  // the star
  seg(g, ...P(D, 0), ...P(D, 10.6), { color: COL.dim, width: 2, alpha: a * 0.6, dash: [3, 8] });
  text(g, `star, ${D} light-years away`, ...P(D + 0.15, 10.2), { size: 22, color: COL.dim, alpha: a, align: 'left' });
  const Tc = 10 * ramp(t, A[4] + 1.5, A[5] + 3, (k) => k);
  // home twin: x = 0
  seg(g, ...P(0, 0), ...P(0, Tc), { color: COL.blue, width: 4, alpha: a });
  for (let y = 1; y <= Math.floor(Tc + 1e-9); y++) {
    circle(g, ...P(0, y), 6, { fill: COL.blue, alpha: a });
    text(g, `${y}`, ...P(-0.25, y - 0.12), { size: 20, color: COL.blue, alpha: a, align: 'right' });
  }
  // traveller: out and back
  const g8 = gamma(beta);
  const tauNow = Tc <= D / beta ? Tc / g8 : D / beta / g8 + (Tc - D / beta) / g8;
  const pts = [];
  for (let k = 0; k <= 60; k++) { const tau = (tauNow * k) / 60; pts.push(P(...travellerAt(tau, D, beta))); }
  path(g, pts, { color: COL.gold, width: 4, alpha: a });
  for (let y = 1; y <= Math.floor(tauNow + 1e-9); y++) {
    const [x, ct] = travellerAt(y, D, beta);
    circle(g, ...P(x, ct), 6, { fill: COL.gold, alpha: a });
    text(g, `${y}`, ...P(x + 0.22, ct - 0.12), { size: 20, color: COL.gold, alpha: a, align: 'left' });
  }
  // the two clocks
  const home = Math.min(Tc, 10), trav = Math.min(tauNow, travellerProperTime(D, beta));
  clockFace(g, 1500, 430, 74, home / 12, { alpha: a, hand: COL.blue });
  clockFace(g, 1730, 430, 74, trav / 12, { alpha: a, hand: COL.gold });
  text(g, `home: ${home.toFixed(1)} yr`, 1500, 548, { size: 26, color: COL.blue, alpha: a });
  text(g, `traveller: ${trav.toFixed(1)} yr`, 1730, 548, { size: 26, color: COL.gold, alpha: a });
  const v = ramp(t, A[6], A[6] + 1) * a;
  if (v > 0) {
    text(g, 'straight worldline: 10 years', 1615, 640, { size: 28, color: COL.blue, alpha: v });
    text(g, 'bent worldline: 6 years', 1615, 684, { size: 28, color: COL.gold, alpha: v });
    text(g, 'straight = most proper time', 1615, 740, { size: 30, color: COL.ink, alpha: v });
  }
}

export default function draw(g, t, s) {
  const A = s.at;
  const { D, beta } = s.params;
  background(g, t, { stars: 60, seed: 41 });
  // the interval: two events and the pieces of their separation
  const iv = win(t, 0.2, A[1], 0.8, 0.8);
  if (iv > 0) {
    const ox = 760, oy = 860, sc = 110, P = stPt(ox, oy, sc);
    stAxes(g, ox, oy, sc, { xmin: -1.5, xmax: 5, tmin: -0.2, tmax: 5, alpha: iv });
    const e1 = P(0.5, 0.8), e2 = P(3.0, 4.2);
    seg(g, ...e1, e2[0], e1[1], { color: COL.ink, width: 2, alpha: iv * 0.7, dash: [6, 6] });
    seg(g, e2[0], e1[1], ...e2, { color: COL.ink, width: 2, alpha: iv * 0.7, dash: [6, 6] });
    seg(g, ...e1, ...e2, { color: COL.gold, width: 3, alpha: iv });
    for (const e of [e1, e2]) circle(g, ...e, 9, { fill: COL.gold, alpha: iv });
    text(g, 'Δx', (e1[0] + e2[0]) / 2, e1[1] + 36, { size: 28, color: COL.ink, alpha: iv });
    text(g, 'c Δt', e2[0] + 18, (e1[1] + e2[1]) / 2, { size: 28, color: COL.ink, alpha: iv, align: 'left' });
    text(g, 'every observer splits this into different Δt and Δx —', 1480, 560, { size: 26, color: COL.dim, alpha: iv });
    text(g, 'but gets the same Δs²', 1480, 600, { size: 30, color: COL.ink, alpha: iv });
  }
  const cn = win(t, A[1] - 0.2, A[3], 0.9, 0.8);
  if (cn > 0) {
    const cx = 960, cy = 560, R = 290;
    cone(g, cx, cy, R, cn);
    text(g, 'FUTURE', cx, cy - R * 0.55, { size: 30, spacing: 6, color: COL.gold, alpha: cn });
    const pa = ramp(t, A[2] - 0.3, A[2] + 0.7) * cn;
    text(g, 'PAST', cx, cy + R * 0.62, { size: 30, spacing: 6, color: COL.blue, alpha: pa });
    text(g, 'ELSEWHERE', cx - R * 1.45, cy + 10, { size: 30, spacing: 6, color: COL.dim, alpha: pa });
    text(g, 'ELSEWHERE', cx + R * 1.45, cy + 10, { size: 30, spacing: 6, color: COL.dim, alpha: pa });
    // an event inside the future cone can be reached slower than light
    const fx = cx + 80, fy = cy - 190;
    arrow(g, cx, cy, fx - 4, fy + 10, { color: COL.gold, width: 3, alpha: cn });
    circle(g, fx, fy, 8, { fill: COL.gold, alpha: cn });
    text(g, 'can be influenced', fx + 18, fy - 6, { size: 22, color: COL.gold, alpha: cn, align: 'left' });
    // one outside cannot
    const sx = cx + 470, sy = cy - 90;
    seg(g, cx, cy, sx, sy, { color: COL.coral, width: 2.5, alpha: pa, dash: [6, 8] });
    circle(g, sx, sy, 8, { fill: COL.coral, alpha: pa });
    text(g, 'needs faster than light', sx - 10, sy - 26, { size: 22, color: COL.coral, alpha: pa, align: 'right' });
  }
  const od = win(t, A[3] - 0.2, A[4], 0.9, 0.8);
  if (od > 0) odometer(g, t, od);
  const tw = ramp(t, A[4] - 0.2, A[4] + 1);
  if (tw > 0) twins(g, t, A, D, beta, tw);
}
