// Cosmology. A lattice of galaxies whose spacings all grow with the scale
// factor (so v ∝ d from any of them); a light wave stretching as it crosses;
// the Friedmann equations; the history a(t) of a flat ΛCDM universe with the
// Planck 2018 contents, integrated numerically — slowing, then speeding up;
// the energy budget; the microwave background; the open tensions; the future.

import { TAU, ramp, win, clamp, lerp, hash } from '../kit.js';
import { background, text, note, path, circle, glow, seg, arrow, panel, COL } from '../paint.js';
import { ageAt, scaleFactorAt, deceleration, YEAR, COSMO } from '../physics.js';
import { FACTS } from '../data.js';

// a(t) for the plot: cosmic time (Gyr) for a grid of scale factors
const HISTORY = (() => {
  const out = [];
  for (let a = 0.002; a <= 1.75; a += 0.01) out.push([ageAt(a, COSMO, 800) / YEAR / 1e9, a]);
  let aT = 0.3; while (deceleration(aT) > 0) aT += 0.001;
  return { pts: out, aT, tT: ageAt(aT, COSMO, 800) / YEAR / 1e9, now: ageAt(1, COSMO, 2000) / YEAR / 1e9 };
})();

function galaxy(g, x, y, r, a, col = '#cfd8ff', spin = 0) {
  glow(g, x, y, r * 3, col, a * 0.45);
  g.save(); g.translate(x, y); g.rotate(spin); g.scale(1, 0.55);
  circle(g, 0, 0, r, { fill: col, alpha: a * 0.8 });
  g.restore();
}

function lattice(g, t, A, a) {
  // the scale factor grows through these captions
  const sf = lerp(0.55, 1.15, ramp(t, A[0] + 1, A[3], (u) => u));
  const home = t < A[2] ? [0, 0] : [2, -1];            // whose point of view
  const spacing = 230;
  const cx = 960, cy = 470;
  for (let i = -5; i <= 5; i++) {
    for (let j = -3; j <= 3; j++) {
      const x = cx + (i - home[0]) * spacing * sf + (hash(i * 13 + j, 3) - 0.5) * 30;
      const y = cy + (j - home[1]) * spacing * sf * 0.62 + (hash(i * 7 + j, 4) - 0.5) * 20;
      if (x < -60 || x > 1980 || y < -60 || y > 900) continue;
      const me = i === home[0] && j === home[1];
      galaxy(g, x, y, me ? 13 : 9, a, me ? COL.gold : '#cfd8ff', hash(i, j));
      if (!me && ramp(t, A[1], A[1] + 1) > 0) {
        // velocity ∝ distance from "you"
        const dx = x - cx, dy = y - cy;
        const k = 0.16 * ramp(t, A[1], A[1] + 1);
        arrow(g, x, y, x + dx * k, y + dy * k, { color: COL.light, width: 2, alpha: a * 0.7, head: 9 });
      }
    }
  }
  text(g, 'you', cx, cy + 46, { size: 24, color: COL.gold, alpha: a });
  text(g, `scale factor a = ${sf.toFixed(2)}`, 1700, 860, { size: 28, color: COL.ink, alpha: a });
  if (t >= A[2]) text(g, 'same law, seen from another galaxy', 960, 140, { size: 28, color: COL.gold, alpha: a * ramp(t, A[2], A[2] + 1) });
}

function redshift(g, t, A, a) {
  const k = ramp(t, A[3] + 0.5, A[4] - 1, (u) => u);
  const sf0 = 0.5, sf = lerp(sf0, 1, k);
  const x0 = 260, x1 = lerp(260, 1660, k);
  galaxy(g, 260, 470, 14, a);
  galaxy(g, 1660, 470, 14, a, COL.gold);
  text(g, 'emitted when a = 0.5', 260, 540, { size: 24, color: COL.dim, alpha: a });
  text(g, 'received today, a = 1', 1660, 540, { size: 24, color: COL.dim, alpha: a });
  // the wave: wavelength proportional to the scale factor at each moment
  const pts = [];
  const lam = 60 * (sf / sf0);
  for (let x = x0; x <= x1; x += 2) pts.push([x, 470 + 40 * Math.sin(((x - x1) / lam) * TAU)]);
  const col = k < 0.5 ? COL.light : k < 0.85 ? '#ffd56e' : COL.coral;
  path(g, pts, { color: col, width: 3, alpha: a });
  text(g, `wavelength × ${(sf / sf0).toFixed(2)}`, 960, 640, { size: 32, color: col, alpha: a });
  text(g, `1 + z = ${(sf / sf0).toFixed(2)}`, 960, 690, { size: 30, color: COL.ink, alpha: a });
}

function historyPlot(g, t, A, a) {
  const ox = 260, oy = 820, w = 1100, h = 560;
  const tmax = 26, amax = 1.75;
  const X = (gy) => ox + (gy / tmax) * w, Y = (sf) => oy - (sf / amax) * h;
  seg(g, ox, oy, ox + w + 20, oy, { color: COL.dim, width: 2, alpha: a });
  seg(g, ox, oy, ox, oy - h - 20, { color: COL.dim, width: 2, alpha: a });
  for (let gy = 0; gy <= tmax; gy += 5) text(g, `${gy}`, X(gy), oy + 34, { size: 22, color: COL.dim, alpha: a });
  for (let sf = 0; sf <= 1.5; sf += 0.5) text(g, sf.toFixed(1), ox - 14, Y(sf) + 8, { size: 22, color: COL.dim, alpha: a, align: 'right' });
  text(g, 'billions of years since the Big Bang', ox + w / 2, oy + 70, { size: 24, color: COL.dim, alpha: a });
  text(g, 'scale factor, a', ox, oy - h - 34, { size: 24, color: COL.dim, alpha: a, align: 'left' });
  const draw = ramp(t, A[5] + 0.5, A[5] + 5);
  const before = [], after = [];
  for (const [gy, sf] of HISTORY.pts) {
    if (gy > tmax * draw) break;
    (sf <= HISTORY.aT ? before : after).push([X(gy), Y(sf)]);
  }
  if (after.length) after.unshift(before[before.length - 1]);
  path(g, before, { color: COL.blue, width: 4, alpha: a });
  path(g, after, { color: COL.gold, width: 4, alpha: a });
  const sp = ramp(t, A[6], A[6] + 1) * a;
  if (sp > 0) {
    circle(g, X(HISTORY.tT), Y(HISTORY.aT), 8, { fill: COL.ink, alpha: sp });
    text(g, 'slowing ↓  speeding up ↑', X(HISTORY.tT) + 16, Y(HISTORY.aT) + 36, { size: 24, color: COL.ink, alpha: sp, align: 'left' });
  }
  const nw = ramp(t, A[5] + 2.5, A[5] + 3.5) * a;
  seg(g, X(HISTORY.now), oy, X(HISTORY.now), Y(1), { color: COL.dim, width: 1.5, alpha: nw, dash: [4, 6] });
  circle(g, X(HISTORY.now), Y(1), 9, { fill: COL.gold, alpha: nw });
  text(g, `today: ${HISTORY.now.toFixed(1)} billion years`, X(HISTORY.now) - 14, Y(1) - 22, { size: 24, color: COL.gold, alpha: nw, align: 'right' });
  note(g, 'flat ΛCDM with Planck 2018 contents, integrated from the Friedmann equation', ox + w / 2, oy - h - 70, a);
}

function budget(g, t, a) {
  const cx = 1640, cy = 470, R = 170;
  const parts = [[FACTS.composition.energy, 'dark energy', COL.violet], [FACTS.composition.dark, 'dark matter', COL.blue], [FACTS.composition.ordinary, 'ordinary matter', COL.gold]];
  let a0 = -Math.PI / 2;
  const grow = ramp(t, 0, 2);
  for (const [pct, lab, col] of parts) {
    const a1 = a0 + (pct / 100) * TAU * grow;
    g.save(); g.globalAlpha = a;
    g.beginPath(); g.arc(cx, cy, R, a0, a1); g.arc(cx, cy, R * 0.58, a1, a0, true); g.closePath();
    g.fillStyle = col; g.fill(); g.restore();
    const mid = (a0 + a1) / 2;
    text(g, `${pct}%`, cx + Math.cos(mid) * R * 0.79, cy + Math.sin(mid) * R * 0.79 + 9, { size: 24, color: '#0b1020', weight: 600, alpha: a * grow });
    a0 = a1;
  }
  parts.forEach(([pct, lab, col], i) => text(g, `${lab}`, cx, cy + R + 50 + i * 36, { size: 24, color: col, alpha: a }));
}

export default function draw(g, t, s) {
  const A = s.at;
  background(g, t, { stars: 80, seed: 111 });
  const lt = win(t, 0.2, A[3], 0.9, 0.8);
  if (lt > 0) lattice(g, t, A, lt);
  const rz = win(t, A[3] - 0.2, A[4], 0.8, 0.8);
  if (rz > 0) redshift(g, t, A, rz);
  const hp = win(t, A[5] - 0.2, A[8], 0.9, 0.8);
  if (hp > 0) historyPlot(g, t, A, hp);
  const bd = win(t, A[7] - 0.2, A[8], 0.8, 0.8);
  if (bd > 0) budget(g, t - A[7], bd);
  // the microwave background (an illustration of an all-sky map, not the data)
  const cm = win(t, A[8] - 0.2, A[9], 0.9, 0.8);
  if (cm > 0) {
    const cx = 960, cy = 470, rx = 560, ry = 280;
    g.save();
    g.globalAlpha = cm;
    g.beginPath(); g.ellipse(cx, cy, rx, ry, 0, 0, TAU); g.clip();
    for (let i = 0; i < 1800; i++) {
      const x = cx + (hash(i, 1) - 0.5) * 2 * rx, y = cy + (hash(i, 2) - 0.5) * 2 * ry;
      const v = hash(i, 3);
      g.fillStyle = v > 0.5 ? `rgba(255,${130 + v * 80},80,0.55)` : `rgba(80,${120 + v * 120},255,0.55)`;
      g.beginPath(); g.arc(x, y, 10 + hash(i, 4) * 16, 0, TAU); g.fill();
    }
    g.restore();
    text(g, 'cosmic microwave background: 2.725 K', cx, cy + ry + 60, { size: 32, color: COL.ink, alpha: cm });
    text(g, `age in this model: ${FACTS.age.value} ± ${FACTS.age.err} billion years`, cx, cy + ry + 104, { size: 26, color: COL.gold, alpha: cm });
    note(g, 'an illustration of the all-sky map, not the measured data', cx, cy - ry - 30, cm);
  }
  // open questions
  const oq = win(t, A[9] - 0.2, A[10], 0.8, 0.8);
  if (oq > 0) {
    const ox = 560, oy = 500, w = 800, X = (v) => ox + ((v - 64) / 12) * w;
    seg(g, ox, oy, ox + w, oy, { color: COL.dim, width: 2, alpha: oq });
    for (let v = 64; v <= 76; v += 2) text(g, `${v}`, X(v), oy + 36, { size: 22, color: COL.dim, alpha: oq });
    text(g, 'expansion rate today, H₀ (km/s/Mpc)', ox + w / 2, oy + 76, { size: 24, color: COL.dim, alpha: oq });
    const bar = (v, half, y, lab, col) => {
      seg(g, X(v - half), y, X(v + half), y, { color: col, width: 4, alpha: oq });
      circle(g, X(v), y, 9, { fill: col, alpha: oq });
      text(g, lab, X(v), y - 22, { size: 24, color: col, alpha: oq });
    };
    bar(FACTS.hubbleEarly.value, 0.5, oy - 80, 'early universe: about 67', COL.blue);
    bar(FACTS.hubbleLocal.value, 1, oy - 170, 'local measurements: about 73', COL.coral);
    note(g, 'error bars schematic', ox + w / 2, oy + 120, oq);
  }
  const fz = ramp(t, A[10] - 0.2, A[10] + 1);
  if (fz > 0) {
    const sf = 1 + (t - A[10]) * 0.12;
    for (let i = 0; i < 40; i++) {
      const x = 960 + (hash(i, 7) - 0.5) * 900 * sf, y = 470 + (hash(i, 8) - 0.5) * 600 * sf;
      galaxy(g, x, y, 8, fz * Math.max(0.15, 1 - (t - A[10]) * 0.06), '#cfd8ff', hash(i, 9));
    }
    text(g, 'the Big Freeze, if Λ is constant', 960, 160, { size: 30, color: COL.light, alpha: fz });
  }
}
