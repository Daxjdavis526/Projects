// Relativity of simultaneity. A train moves at 0.5c past a platform;
// lightning strikes both ends as they pass two marks. Light spreads at c in
// the platform frame: the platform observer, midway, gets both flashes at
// once; the passenger, moving toward the front, gets the front flash first.
// Then the same events on a spacetime diagram, with the passenger's tilted
// line of "now" — computed from the Lorentz transformation.

import { ramp, win, clamp } from '../kit.js';
import { background, text, note, path, circle, glow, seg, arrow, panel, stAxes, stPt, COL } from '../paint.js';
import { gamma, lightning } from '../physics.js';

const HALF = 560;                    // half the distance between the marks, px
const C = 380;                       // light, px per second (on screen)
const MARK_L = 960 - HALF, MARK_R = 960 + HALF;

function person(g, x, y, color, a, flash = 0) {
  circle(g, x, y - 62, 14, { fill: color, alpha: a });
  path(g, [[x, y - 46], [x, y - 10]], { color, width: 6, alpha: a });
  path(g, [[x - 14, y], [x, y - 12], [x + 14, y]], { color, width: 5, alpha: a });
  if (flash > 0) glow(g, x, y - 62, 50, '#ffffff', flash);
}

function trainScene(g, t, beta, a) {
  // the strike repeats every 7 s so both captions see it
  const cyc = 7, tc = ((t % cyc) + cyc) % cyc, strike = 2.2;
  const v = beta * C;
  const ts = tc - strike;                  // time since the strikes
  const shift = v * ts;                    // train's position relative to its strike-time position
  const yRail = 640;
  // platform and its two marks
  g.save(); g.globalAlpha = a; g.fillStyle = '#26324c'; g.fillRect(80, yRail + 30, 1760, 40); g.restore();
  for (const x of [MARK_L, MARK_R]) seg(g, x, yRail + 30, x, yRail + 90, { color: COL.coral, width: 4, alpha: a });
  text(g, 'platform', 160, yRail + 110, { size: 24, color: COL.dim, alpha: a, align: 'left' });
  // the train: its ends are at the marks at the strike
  const x0 = MARK_L + shift, x1 = MARK_R + shift;
  g.save(); g.globalAlpha = a;
  g.fillStyle = '#334a75'; g.fillRect(x0, yRail - 150, x1 - x0, 150);
  g.fillStyle = '#41598a';
  for (let wx = x0 + 40; wx < x1 - 80; wx += 120) g.fillRect(wx, yRail - 120, 80, 50);
  g.restore();
  arrow(g, x1 + 30, yRail - 75, x1 + 120, yRail - 75, { color: COL.dim, width: 3, alpha: a });
  text(g, 'train at 0.5c', x1 + 75, yRail - 100, { size: 22, color: COL.dim, alpha: a });
  // the observers
  const L = HALF / C;
  const arr = lightning(L, beta);
  const flashP = ts >= arr.platform[0] && ts < arr.platform[0] + 0.5 ? 1 - (ts - arr.platform[0]) / 0.5 : 0;
  person(g, 960, yRail + 30, COL.ink, a, flashP * a);
  text(g, 'on the platform', 960, yRail + 150, { size: 24, color: COL.ink, alpha: a });
  const front = arr.passengerSees[1], back = arr.passengerSees[0];
  const fF = ts >= front && ts < front + 0.5 ? 1 - (ts - front) / 0.5 : 0;
  const fB = ts >= back && ts < back + 0.5 ? 1 - (ts - back) / 0.5 : 0;
  person(g, 960 + shift, yRail - 10, COL.gold, a, Math.max(fF, fB) * a);
  text(g, 'passenger', 960 + shift, yRail - 170, { size: 24, color: COL.gold, alpha: a });
  // the strikes and the light spreading from them, at c in the platform frame
  if (ts >= 0) {
    for (const x of [MARK_L, MARK_R]) {
      const r = C * ts;
      if (ts < 0.35) glow(g, x, yRail - 200, 140, '#ffffff', a * (1 - ts / 0.35));
      if (ts < 0.35) path(g, [[x - 20, 120], [x + 15, 260], [x - 10, 300], [x + 10, yRail - 150]], { color: '#ffffff', width: 4, alpha: a * (1 - ts / 0.35) });
      if (r < 1300) circle(g, x, yRail - 75, r, { stroke: COL.light, width: 2.5, alpha: a * 0.7 * (1 - r / 1300) });
    }
  }
  // what each saw, as it happens
  const lbl = (str, x, y, k) => text(g, str, x, y, { size: 26, color: COL.ink, alpha: a * k });
  if (ts > arr.platform[0]) lbl('both flashes together', 960, yRail + 190, clamp((ts - arr.platform[0]) / 0.4));
  if (ts > front) lbl('front flash first…', 960 + v * front, yRail - 210, clamp((ts - front) / 0.4) * (ts < back ? 1 : 0.5));
  if (ts > back) lbl('…then the back one', 960 + v * back, yRail - 250, clamp((ts - back) / 0.4));
}

function diagram(g, t, A, beta, a) {
  const ox = 960, oy = 840, s = 120;
  const P = stPt(ox, oy, s);
  stAxes(g, ox, oy, s, { xmin: -4.5, xmax: 4.5, tmin: -0.2, tmax: 5.4, alpha: a });
  const L = 2, t0 = 0.7;                    // strikes at x = ±2, ct = 0.7
  // worldlines: the marks (vertical) and the platform observer at x = 0
  seg(g, ...P(0, -0.2), ...P(0, 5.4), { color: COL.ink, width: 3, alpha: a * 0.8 });
  text(g, 'platform observer', ...P(0.1, 5.2), { size: 22, color: COL.ink, alpha: a, align: 'left' });
  // the passenger: x = β (ct − t0)
  const w = ramp(t, A[4], A[4] + 2) * a;
  const pl = (ct) => P(beta * (ct - t0), ct);
  path(g, [pl(-0.2), pl(5.4)], { color: COL.gold, width: 3.5, alpha: w });
  text(g, 'passenger (0.5c)', ...P(beta * (5.2 - t0) + 0.15, 5.2), { size: 22, color: COL.gold, alpha: w, align: 'left' });
  // the two strike events
  const ev = ramp(t, A[4] - 0.2, A[4] + 0.6) * a;
  for (const x of [-L, L]) {
    glow(g, ...P(x, t0), 34, '#ffffff', ev);
    circle(g, ...P(x, t0), 9, { fill: '#ffffff', alpha: ev });
  }
  text(g, 'back strike', ...P(-L, t0 - 0.35), { size: 22, color: COL.ink, alpha: ev });
  text(g, 'front strike', ...P(L, t0 - 0.35), { size: 22, color: COL.ink, alpha: ev });
  // light from each strike, at 45°
  const lr = ramp(t, A[4] + 1, A[4] + 4);
  if (lr > 0) {
    const reach = 4.4 * lr;
    seg(g, ...P(-L, t0), ...P(-L + reach, t0 + reach), { color: COL.light, width: 2.5, alpha: a });
    seg(g, ...P(L, t0), ...P(L - reach, t0 + reach), { color: COL.light, width: 2.5, alpha: a });
    // where the light meets the observers
    const meet = [[0, t0 + L], [(beta * L) / (1 + beta), t0 + L / (1 + beta)], [(beta * L) / (1 - beta), t0 + L / (1 - beta)]];
    for (const [x, ct] of meet) if (ct - t0 <= reach + 0.01) circle(g, ...P(x, ct), 7, { fill: COL.light, alpha: a });
  }
  // the passenger's "now": a line of constant t', slope β in this diagram
  const nw = ramp(t, A[5], A[5] + 1.2) * a;
  if (nw > 0) {
    // slide the line along her worldline: her clock reading tau'
    // it pauses where the front strike is past and the back one is not
    const ctHere = t0 - 1.8 + 2.4 * ramp(t, A[5] + 1.2, A[5] + 5) + 2.2 * ramp(t, A[6] + 1, A[6] + 6);
    const xh = beta * (ctHere - t0);
    const line = (x) => ctHere + beta * (x - xh);
    path(g, [P(-4.4, line(-4.4)), P(4.4, line(4.4))], { color: COL.gold, width: 2.5, alpha: nw, dash: [12, 8] });
    circle(g, ...P(xh, ctHere), 8, { fill: COL.gold, alpha: nw });
    text(g, 'her “now”', ...P(4.3, line(4.3) + 0.25), { size: 24, color: COL.gold, alpha: nw, align: 'right' });
    // which strikes lie on or below her current "now"?
    const doneF = t0 <= line(L) + 1e-9, doneB = t0 <= line(-L) + 1e-9;
    text(g, doneF ? 'front strike: already happened' : 'front strike: not yet', 1460, 520, { size: 26, color: doneF ? COL.green : COL.dim, alpha: nw, align: 'left' });
    text(g, doneB ? 'back strike: already happened' : 'back strike: not yet', 1460, 560, { size: 26, color: doneB ? COL.green : COL.dim, alpha: nw, align: 'left' });
  }
}

export default function draw(g, t, s) {
  const A = s.at;
  const { beta } = s.params;
  background(g, t, { stars: 50, seed: 31 });
  const tr = win(t, 0.2, A[3], 0.8, 0.8);
  if (tr > 0) trainScene(g, t - 0.2, beta, tr);
  const dg = ramp(t, A[3] - 0.2, A[3] + 1);
  if (dg > 0) {
    diagram(g, t, A, beta, dg);
    const intro = win(t, A[3], A[4], 0.6, 0.6);
    if (intro > 0) {
      circle(g, 960 + 2.6 * 120, 840 - 3 * 120, 9, { fill: COL.ink, alpha: intro });
      text(g, 'an event: a place, at an instant', 960 + 2.6 * 120 + 18, 840 - 3 * 120 + 8, { size: 24, color: COL.ink, alpha: intro, align: 'left' });
    }
  }
}
