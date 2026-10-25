// The muon experiment. A cosmic ray makes muons high in the air; muons fall
// past the summit of Mount Washington toward sea level. Each muon has its own
// decay time, drawn from the exponential law with a 2.2 μs mean life. In one
// lane their clocks run at the rest rate (about 5% arrive); in the other they
// run slow by the measured factor 8.8 (about 72% arrive). Then the muon's
// own view: a mountain contracted by γ ≈ 10.

import { ramp, win, hash, clamp } from '../kit.js';
import { background, text, note, path, circle, glow, seg, arrow, panel, COL } from '../paint.js';
import { gamma, survival } from '../physics.js';
import { FACTS } from '../data.js';

const TOP = 250, BOT = 800;               // summit and sea level on screen
const DESCENT = 4.2;                      // screen seconds for the 6.4 μs trip
const SCALE = DESCENT / FACTS.muonTrip.value;   // screen seconds per μs
const N = 60;                             // muons per lane
const SPACING = 0.16;                     // seconds between muons

// muon i: when it passes the summit (lane time), its decay time in its own
// frame (μs), and its arrival or decay time on screen for clocks slowed by k
function muon(i, k) {
  const tau = -FACTS.muonLife.value * Math.log(1 - hash(i, 41) * 0.9999);
  const born = i * SPACING;
  const lifeScreen = tau * k * SCALE;
  const arrives = lifeScreen >= DESCENT;
  return { born, x: hash(i, 43), end: born + Math.min(lifeScreen, DESCENT), arrives };
}

function lane(g, t, x0, w, k, label, color, a) {
  panel(g, x0 - 10, TOP - 60, w + 20, BOT - TOP + 130, { alpha: a * 0.6, r: 12 });
  seg(g, x0, TOP, x0 + w, TOP, { color: COL.dim, width: 2, alpha: a, dash: [6, 6] });
  seg(g, x0, BOT, x0 + w, BOT, { color: COL.dim, width: 2, alpha: a });
  text(g, label, x0 + w / 2, TOP - 20, { size: 25, color, alpha: a });
  let started = 0, arrived = 0;
  for (let i = 0; i < N; i++) {
    const m = muon(i, k);
    if (t < m.born) continue;
    started++;
    const tt = t - m.born;
    const x = x0 + 20 + m.x * (w - 40);
    if (tt < m.end - m.born) {
      const y = TOP + (BOT - TOP) * (tt / DESCENT);
      glow(g, x, y, 14, color, a * 0.6);
      circle(g, x, y, 4, { fill: color, alpha: a });
    } else if (!m.arrives) {
      const y = TOP + (BOT - TOP) * ((m.end - m.born) / DESCENT);
      const f = clamp((tt - (m.end - m.born)) / 0.5);
      if (f < 1) circle(g, x, y, 4 + f * 18, { stroke: color, width: 2, alpha: a * (1 - f) * 0.8 });
    } else {
      arrived++;
      circle(g, x, BOT + 14 + (i % 4) * 9, 4, { fill: color, alpha: a * 0.9 });
    }
  }
  // the count, for muons that have had time to finish the trip
  let done = 0, ok = 0;
  for (let i = 0; i < N; i++) { const m = muon(i, k); if (t >= m.born + DESCENT) { done++; if (m.arrives) ok++; } }
  if (done) text(g, `${ok} of ${done} arrived`, x0 + w / 2, BOT + 80, { size: 26, color: COL.ink, alpha: a });
  return { started, arrived };
}

function mountain(g, a) {
  const pts = [[60, BOT], [180, 700], [300, 560], [420, 420], [520, TOP], [610, 380], [720, 520], [860, 690], [960, BOT]];
  path(g, pts, { color: '#5b6b8a', width: 3, alpha: a, fill: 'rgba(52,64,92,0.75)', close: true });
  seg(g, 40, BOT, 980, BOT, { color: COL.dim, width: 2, alpha: a });
  arrow(g, 1000, BOT, 1000, TOP + 6, { color: COL.ink, width: 2, alpha: a, head: 12 });
  arrow(g, 1000, TOP, 1000, BOT - 6, { color: COL.ink, width: 2, alpha: a, head: 12 });
  text(g, '1.9 km', 1016, (TOP + BOT) / 2 + 8, { size: 26, color: COL.ink, alpha: a, align: 'left' });
  text(g, 'Mount Washington summit', 520, TOP - 24, { size: 24, color: COL.dim, alpha: a });
  text(g, 'sea level', 160, BOT + 40, { size: 24, color: COL.dim, alpha: a });
}

function shower(g, t, a) {
  // a cosmic-ray proton strikes the upper air and sprays secondaries
  const hit = 1.2, x = 640, y = 150;
  const k = clamp((t - 0.2) / hit);
  seg(g, x - 260 + 260 * k, y - 120 + 120 * k, x - 260, y - 120, { color: COL.coral, width: 3, alpha: a });
  if (t > hit + 0.2) {
    const s = clamp((t - hit - 0.2) / 2.5);
    for (let i = 0; i < 26; i++) {
      const ang = Math.PI / 2 + (hash(i, 5) - 0.5) * 1.1;
      const len = s * (240 + hash(i, 6) * 520);
      seg(g, x, y, x + Math.cos(ang) * len, y + Math.sin(ang) * len, { color: i % 3 ? COL.light : COL.gold, width: 1.5, alpha: a * (0.8 - 0.5 * s) });
    }
    glow(g, x, y, 60, COL.gold, a * (1 - s));
  }
  text(g, 'cosmic ray', x - 270, y - 140, { size: 24, color: COL.coral, alpha: a, align: 'left' });
  text(g, 'muons, made ~15 km up', x + 140, y + 200, { size: 24, color: COL.light, alpha: a * clamp((t - hit) / 1.5), align: 'left' });
}

export default function draw(g, t, s) {
  const A = s.at;
  background(g, t, { stars: 60, seed: 21 });
  const sh = win(t, 0, A[1] - 0.2, 0.6, 0.8);
  if (sh > 0) shower(g, t, sh);
  const mt = win(t, A[1] - 0.4, A[4], 1, 0.8);
  if (mt > 0) mountain(g, mt);
  const ln = win(t, A[2], A[4], 0.8, 0.8);
  if (ln > 0) {
    lane(g, t - A[2], 1180, 290, 1, 'if their clocks ran at the rest rate', COL.coral, ln);
    lane(g, t - A[2], 1530, 290, FACTS.muonDilation.value, 'measured: clocks slowed 8.8×', COL.gold, ln * ramp(t, A[3] - 0.4, A[3] + 0.6) + ln * 0.25 * (1 - ramp(t, A[3] - 0.4, A[3] + 0.6)));
    note(g, `expected: ${(survival(6.4, 2.2) * 100).toFixed(0)}% vs ${(survival(6.4, 2.2 * 8.8) * 100).toFixed(0)}% arrive`, 1500, 960 - 70, ln * 0.0);
  }
  // the muon's view: the same mountain, contracted along the motion
  const mv = ramp(t, A[4] - 0.2, A[4] + 1);
  if (mv > 0) {
    const g10 = FACTS.muonDilation.value;          // the measured factor, so both stories agree
    const hGround = BOT - TOP, hMuon = hGround / g10;
    const yb = 820;
    panel(g, 330, 170, 520, 720, { alpha: mv * 0.7 });
    panel(g, 1070, 170, 520, 720, { alpha: mv * 0.7 });
    text(g, 'the ground’s view', 590, 220, { size: 30, color: COL.ink, alpha: mv });
    text(g, 'the muon’s view', 1330, 220, { size: 30, color: COL.ink, alpha: mv });
    // ground's view: full height, the muon's clock slow
    path(g, [[420, yb], [590, yb - hGround], [760, yb]], { color: '#5b6b8a', width: 3, alpha: mv, fill: 'rgba(52,64,92,0.75)', close: true });
    text(g, '1.9 km', 590, yb + 44, { size: 28, color: COL.ink, alpha: mv });
    text(g, 'the muon’s clock runs slow', 590, yb + 84, { size: 24, color: COL.gold, alpha: mv });
    // muon's view: the mountain squashed by γ, rushing up
    const rush = ((t - A[4]) % 2) / 2;
    const yy = yb - rush * 40;
    path(g, [[1160, yy], [1330, yy - hMuon], [1500, yy]], { color: '#5b6b8a', width: 3, alpha: mv, fill: 'rgba(52,64,92,0.75)', close: true });
    glow(g, 1330, yy - hMuon - 220, 26, COL.gold, mv);
    circle(g, 1330, yy - hMuon - 220, 7, { fill: COL.gold, alpha: mv });
    text(g, 'muon (at rest in its own frame)', 1330, yy - hMuon - 260, { size: 22, color: COL.dim, alpha: mv });
    arrow(g, 1540, yb - 10, 1540, yb - 110, { color: COL.dim, width: 3, alpha: mv });
    text(g, `≈ ${(1.9 / g10).toFixed(2)} km`, 1330, yb + 44, { size: 28, color: COL.ink, alpha: mv });
    text(g, `contracted ${g10}×, the factor that slows its clock`, 1330, yb + 84, { size: 24, color: COL.gold, alpha: mv });
  }
}
