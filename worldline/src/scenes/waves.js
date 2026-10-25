// Gravitational waves. Spiral ripples from a binary; a ring of free particles
// in the plus and cross patterns; a binary spiralling in on the leading-order
// inspiral formula with its waveform; GW150914's numbers and its chirp (the
// score plays the same waveform as sound); LIGO's interferometer; the scale
// of the measurement; GW170817; the growing catalogue; LISA.

import { TAU, ramp, win, clamp, lerp, hash } from '../kit.js';
import { background, text, note, path, circle, glow, seg, arrow, panel, COL } from '../paint.js';
import { chirpWave, chirpFrequency, chirpPhase, timeToMerge, waveDisplace, MSUN_SECONDS } from '../physics.js';
import { FACTS } from '../data.js';
import { chirpPlays } from '../timing.js';

const MC = 30 * MSUN_SECONDS;
const T0 = -0.25, T1 = 0.03;                       // waveform window, seconds of real time
const WAVE = (() => {
  const pts = [];
  for (let i = 0; i <= 2400; i++) { const tt = T0 + ((T1 - T0) * i) / 2400; pts.push([tt, chirpWave(tt, { Mc: MC }).h]); }
  return pts;
})();


function spiral(g, t, cx, cy, a) {
  const om = 1.6;
  for (let arm = 0; arm < 2; arm++) {
    const pts = [];
    for (let r = 40; r < 900; r += 6) pts.push([cx + r * Math.cos(om * (t - r / 220) + arm * Math.PI), cy + r * Math.sin(om * (t - r / 220) + arm * Math.PI) * 0.9]);
    for (let i = 1; i < pts.length; i++) seg(g, ...pts[i - 1], ...pts[i], { color: COL.light, width: 3, alpha: a * 0.7 * (1 - i / pts.length) });
  }
  for (const k of [0, 1]) {
    const x = cx + 26 * Math.cos(om * t + k * Math.PI), y = cy + 26 * Math.sin(om * t + k * Math.PI) * 0.9;
    glow(g, x, y, 30, COL.gold, a); circle(g, x, y, 10, { fill: '#000', stroke: COL.gold, width: 2, alpha: a });
  }
}

function ringOf(g, t, cx, cy, pol, a) {
  const ph = (t * TAU) / 1.6, h = 0.35;
  for (let i = 0; i < 28; i++) {
    const p = (i / 28) * TAU;
    const [x, y] = waveDisplace(Math.cos(p), Math.sin(p), h, ph, pol);
    circle(g, cx + 170 * x, cy + 170 * y, 8, { fill: COL.gold, alpha: a });
  }
  circle(g, cx, cy, 170, { stroke: COL.dim, width: 1.5, alpha: a * 0.5, dash: [5, 7] });
  text(g, pol === 'plus' ? '“plus”' : '“cross”', cx, cy + 240, { size: 30, color: COL.ink, alpha: a });
}

function waveformPlot(g, ox, oy, w, h, tNow, a, { playhead = null, freq = false } = {}) {
  const X = (tt) => ox + ((tt - T0) / (T1 - T0)) * w, Y = (v) => oy - v * h;
  seg(g, ox, oy, ox + w, oy, { color: COL.faint, width: 1, alpha: a });
  const pts = [];
  for (const [tt, v] of WAVE) { if (tt > tNow) break; pts.push([X(tt), Y(v)]); }
  path(g, pts, { color: COL.light, width: 2, alpha: a });
  for (const [tt, lab] of [[-0.2, '−0.20 s'], [-0.1, '−0.10 s'], [0, 'merger']]) {
    seg(g, X(tt), oy + h + 10, X(tt), oy + h + 22, { color: COL.dim, width: 2, alpha: a });
    text(g, lab, X(tt), oy + h + 50, { size: 22, color: COL.dim, alpha: a });
  }
  if (freq) {
    const fp = [];
    for (let tt = T0; tt < -0.0035; tt += 0.001) fp.push([X(tt), oy - h - 40 - (chirpFrequency(-tt, MC) / 260) * 120]);
    path(g, fp, { color: COL.gold, width: 2.5, alpha: a });
    text(g, '35 Hz', X(-0.17), oy - h - 40 - (35 / 260) * 120 - 14, { size: 22, color: COL.gold, alpha: a });
    text(g, '→ 250 Hz', X(0) + 10, oy - h - 40 - (250 / 260) * 120, { size: 22, color: COL.gold, alpha: a, align: 'left' });
    text(g, 'wave frequency', X(-0.24), oy - h - 160, { size: 22, color: COL.gold, alpha: a, align: 'left' });
  }
  if (playhead !== null) {
    const x = X(playhead);
    seg(g, x, oy - h - 10, x, oy + h + 10, { color: COL.coral, width: 3, alpha: a });
  }
}

function inspiral(g, t, A, a) {
  const span = A[3] - A[2] - 0.5;                    // film seconds for the last 0.25 s
  const slow = span / -T0;
  const tt = T0 + Math.max(0, t - A[2] - 0.3) / slow;
  const cx = 960, cy = 360;
  if (tt < 0) {
    const tau = -tt;
    const f = chirpFrequency(Math.max(tau, 1e-4), MC);
    const sep = 230 * (f / 35) ** (-2 / 3);
    const orb = chirpPhase(tau, MC) / 2;
    for (const [k, m] of [[0, 36], [1, 29]]) {
      const share = k === 0 ? 29 / 65 : 36 / 65;      // the heavier hole sits nearer the centre
      const x = cx + (k ? -1 : 1) * sep * share * Math.cos(orb), y = cy + (k ? -1 : 1) * sep * share * Math.sin(orb) * 0.5;
      glow(g, x, y, 40, COL.gold, a * 0.7);
      circle(g, x, y, 10 + m * 0.35, { fill: '#000', stroke: COL.gold, width: 2, alpha: a });
    }
  } else {
    const ring = Math.exp(-tt / 0.004);
    glow(g, cx, cy, 80 + 120 * ring, COL.gold, a * (0.4 + ring));
    circle(g, cx, cy, 30, { fill: '#000', stroke: COL.gold, width: 2, alpha: a });
  }
  waveformPlot(g, 360, 720, 1200, 90, tt, a);
  note(g, `slowed about ${Math.round(slow)}×: the last quarter-second before merger`, 640, 150, a);
  note(g, '(leading-order inspiral; merger and ring-down sketched)', 640, 184, a);
}

function interferometer(g, t, A, a) {
  const bx = 640, by = 640, xEnd = 1560, yEnd = 170;
  const wv = Math.sin((t - A[6]) * 2.4) * ramp(t, A[6] + 2, A[6] + 3);
  // the x arm lengthens while the y arm shortens (y mirror moves down), and back
  const dx = 28 * wv, dy = 28 * wv;                // exaggerated arm changes
  // vacuum tubes
  panel(g, bx, by - 14, xEnd - bx + dx + 20, 28, { r: 14, alpha: a * 0.6, fill: 'rgba(40,56,90,0.6)', stroke: null });
  panel(g, bx - 14, yEnd + dy - 20, 28, by - yEnd - dy + 20, { r: 14, alpha: a * 0.6, fill: 'rgba(40,56,90,0.6)', stroke: null });
  // laser and beams
  panel(g, 200, by - 30, 120, 60, { r: 8, alpha: a, fill: '#3a2030', stroke: COL.coral });
  text(g, 'laser', 260, by + 70, { size: 24, color: COL.coral, alpha: a });
  seg(g, 320, by, bx, by, { color: COL.coral, width: 4, alpha: a });
  seg(g, bx, by, xEnd + dx, by, { color: COL.coral, width: 3, alpha: a * 0.8 });
  seg(g, bx, by, bx, yEnd + dy, { color: COL.coral, width: 3, alpha: a * 0.8 });
  // mirrors and splitter
  seg(g, bx - 30, by + 30, bx + 30, by - 30, { color: '#cfe3ff', width: 6, alpha: a });
  seg(g, xEnd + dx, by - 40, xEnd + dx, by + 40, { color: '#cfe3ff', width: 8, alpha: a });
  seg(g, bx - 40, yEnd + dy, bx + 40, yEnd + dy, { color: '#cfe3ff', width: 8, alpha: a });
  text(g, '4 km', (bx + xEnd) / 2, by + 60, { size: 28, color: COL.ink, alpha: a });
  text(g, '4 km', bx + 40, (by + yEnd) / 2, { size: 28, color: COL.ink, alpha: a, align: 'left' });
  // the detector: dark while the arms are equal, light leaks out when they differ
  const leak = Math.sin(((dx + dy) / 56) * Math.PI / 2) ** 2;   // arm-length difference
  seg(g, bx, by, bx, by + 130, { color: COL.coral, width: 3, alpha: a * leak });
  panel(g, bx - 50, by + 130, 100, 50, { r: 8, alpha: a, fill: '#16202f' });
  glow(g, bx, by + 155, 70, '#ffffff', a * leak);
  text(g, 'detector', bx + 70, by + 165, { size: 24, color: COL.ink, alpha: a, align: 'left' });
  note(g, 'arm changes exaggerated by a factor of about 10²⁰', 1240, 820, a);
}

function scaleRuler(g, t, a) {
  const x0 = 220, x1 = 1700, y = 520;
  const lmin = -19, lmax = 4;
  const X = (l) => x0 + ((lmax - l) / (lmax - lmin)) * (x1 - x0);
  seg(g, x0, y, x1, y, { color: COL.dim, width: 3, alpha: a });
  for (let l = lmax; l >= lmin; l--) seg(g, X(l), y - 8, X(l), y + 8, { color: COL.dim, width: 2, alpha: a * 0.6 });
  const marks = [[Math.log10(4000), 'LIGO arm, 4 km', COL.ink], [-10, 'an atom, ~10⁻¹⁰ m', COL.ink], [Math.log10(1.7e-15), 'a proton, ~10⁻¹⁵ m', COL.ink], [Math.log10(4e-18), 'the change, ~4 × 10⁻¹⁸ m', COL.gold]];
  marks.forEach(([l, lab, col], i) => {
    const k = ramp(t, 0.3 + i * 1.2, 1 + i * 1.2) * a;
    glow(g, X(l), y, 26, col, k);
    circle(g, X(l), y, 8, { fill: col, alpha: k });
    text(g, lab, X(l), y + (i % 2 ? 70 : -40), { size: 28, color: col, alpha: k });
  });
  text(g, 'each tick: ten times smaller →', x0, y - 120, { size: 24, color: COL.dim, alpha: a, align: 'left' });
}

function neutronStars(g, t, A, a) {
  const ox = 260, oy = 560, w = 1400;
  const X = (s) => ox + ((s + 12) / 16) * w;
  seg(g, ox, oy, ox + w, oy, { color: COL.dim, width: 2, alpha: a });
  for (let s = -12; s <= 4; s += 2) text(g, `${s > 0 ? '+' : ''}${s} s`, X(s), oy + 44, { size: 20, color: COL.dim, alpha: a });
  // the inspiral of two neutron stars sweeps up for a long time
  const pts = [];
  for (let s = -12; s < -0.02; s += 0.004) { const f = chirpFrequency(-s, 1.19 * MSUN_SECONDS); pts.push([X(s), oy - 120 - 60 * (f / 400) ** (2 / 3) * Math.cos(chirpPhase(-s, 1.19 * MSUN_SECONDS) * 0.02)]); }
  path(g, pts, { color: COL.light, width: 2, alpha: a });
  text(g, 'gravitational waves', X(-6), oy - 230, { size: 26, color: COL.light, alpha: a });
  const k = ramp(t, A[8] + 2, A[8] + 3) * a;
  seg(g, X(1.7), oy - 20, X(1.7), oy - 260, { color: COL.coral, width: 6, alpha: k });
  glow(g, X(1.7), oy - 260, 40, COL.coral, k);
  text(g, 'gamma rays, +1.7 s', X(1.7) + 20, oy - 240, { size: 26, color: COL.coral, alpha: k, align: 'left' });
  note(g, 'waveform schematic; times relative to the merger (GW170817)', 960, 650, a);
}

function catalogue(g, t, A, a) {
  // the kilonova
  const kn = win(t, A[9] - 0.2, A[9] + 4, 0.8, 1.2);
  glow(g, 520, 460, 200, '#ff7a3c', kn);
  circle(g, 520, 460, 30, { fill: '#ffd0a0', alpha: kn });
  text(g, 'kilonova: gold, platinum…', 520, 700, { size: 30, color: COL.gold, alpha: kn });
  // 390 candidates, one dot each
  const n = Math.floor(FACTS.candidates.value * ramp(t, A[9] + 2, A[9] + 7, (u) => u));
  const cols = 30, ox = 980, oy = 290, d = 22;
  for (let i = 0; i < n; i++) circle(g, ox + (i % cols) * d, oy + Math.floor(i / cols) * d, 6, { fill: i < 3 ? COL.gold : COL.light, alpha: a * 0.9 });
  text(g, `${n} candidate signals`, ox + (cols * d) / 2, oy - 40, { size: 32, color: COL.ink, alpha: a });
  text(g, 'GWTC-5.0, through January 2025 (published May 2026)', ox + (cols * d) / 2, oy + 14 * d + 30, { size: 22, color: COL.dim, alpha: a });
}

function lisa(g, t, a) {
  const cx = 960, cy = 500, R = 300;
  glow(g, cx, cy, 120, '#ffcf6b', a);
  circle(g, cx, cy, 30, { fill: '#ffd56e', alpha: a });
  circle(g, cx, cy, R, { stroke: COL.dim, width: 1.5, alpha: a * 0.6, dash: [4, 8] });
  const ph = t * 0.12;
  circle(g, cx + R * Math.cos(ph), cy - R * Math.sin(ph), 12, { fill: '#2f6fd6', alpha: a });
  const lp = ph - 0.35, lx = cx + R * Math.cos(lp), ly = cy - R * Math.sin(lp);
  const tri = [0, 1, 2, 0].map((k) => [lx + 40 * Math.cos(t * 0.5 + (k * TAU) / 3), ly + 40 * Math.sin(t * 0.5 + (k * TAU) / 3)]);
  path(g, tri, { color: COL.gold, width: 2.5, alpha: a });
  for (const p of tri.slice(0, 3)) circle(g, ...p, 5, { fill: COL.gold, alpha: a });
  text(g, 'LISA, following Earth around the Sun', cx, cy + R + 60, { size: 28, color: COL.gold, alpha: a });
  text(g, 'planned launch: 2035 (ESA)', cx, cy + R + 100, { size: 26, color: COL.dim, alpha: a });
  note(g, 'not to scale', cx, cy - R - 30, a);
}

export default function draw(g, t, s) {
  const A = s.at;
  background(g, t, { stars: 120, seed: 101 });
  const sp = win(t, 0.2, A[1], 0.9, 0.8);
  if (sp > 0) spiral(g, t, 960, 480, sp);
  const rg = win(t, A[1] - 0.2, A[2], 0.8, 0.8);
  if (rg > 0) { ringOf(g, t, 560, 470, 'plus', rg); ringOf(g, t, 1360, 470, 'cross', rg); note(g, 'stretching exaggerated about 10²⁰ times', 960, 120, rg); }
  const ip = win(t, A[2] - 0.2, A[4], 0.8, 0.8);
  if (ip > 0) inspiral(g, t, A, ip);
  const card = win(t, A[3], A[4] + 0.2, 0.8, 0.8);
  if (card > 0) {
    panel(g, 1340, 170, 460, 250, { alpha: card });
    text(g, 'GW150914 · 14 Sep 2015', 1570, 220, { size: 26, spacing: 2, color: COL.dim, alpha: card });
    text(g, '36 + 29 → 62 Suns', 1570, 280, { size: 38, color: COL.ink, alpha: card });
    text(g, '≈ 3 Suns radiated as waves', 1570, 330, { size: 28, color: COL.gold, alpha: card });
    text(g, '1.3 billion light-years away', 1570, 375, { size: 26, color: COL.dim, alpha: card });
  }
  const wf = win(t, A[4] - 0.2, A[6] + 0.2, 0.8, 0.8);
  if (wf > 0) {
    const plays = chirpPlays(s);
    let ph = null;
    for (const p of plays) if (t >= p && t < p + 0.28) ph = T0 + (t - p);
    waveformPlot(g, 360, 640, 1200, 120, T1, wf, { playhead: ph, freq: true });
    const heard = ramp(t, plays[0] - 0.8, plays[0]);
    text(g, ph !== null ? '♪  listen' : 'the chirp, as sound', 960, 860, { size: 28, color: ph !== null ? COL.coral : COL.dim, alpha: wf * heard });
  }
  const io = win(t, A[6] - 0.2, A[7], 0.9, 0.8);
  if (io > 0) interferometer(g, t, A, io);
  const sr = win(t, A[7] - 0.2, A[8], 0.8, 0.8);
  if (sr > 0) scaleRuler(g, t - A[7], sr);
  const ns = win(t, A[8] - 0.2, A[9], 0.8, 0.8);
  if (ns > 0) neutronStars(g, t, A, ns);
  const ct = win(t, A[9] - 0.2, A[10], 0.8, 0.8);
  if (ct > 0) catalogue(g, t, A, ct);
  const ls = ramp(t, A[10] - 0.2, A[10] + 1);
  if (ls > 0) lisa(g, t, ls);
}
