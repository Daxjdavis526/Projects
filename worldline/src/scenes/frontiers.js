// Frontiers. Zooming down to the Planck length; the unconfirmed candidates;
// the gravity-entanglement experiments; the information question (a Page
// curve, sketched); cosmic censorship; numerical relativity; and a clear
// line between serious open research and science fiction.

import { TAU, ramp, win, clamp, lerp, hash, noise1 } from '../kit.js';
import { background, text, note, path, circle, glow, seg, arrow, panel, rrect, COL } from '../paint.js';

function zoom(g, t, a) {
  const x0 = 200, x1 = 1720, y = 470, lmax = 0, lmin = -35;
  const X = (l) => x0 + ((lmax - l) / (lmax - lmin)) * (x1 - x0);
  seg(g, x0, y, x1, y, { color: COL.dim, width: 3, alpha: a });
  for (let l = lmax; l >= lmin; l -= 5) {
    seg(g, X(l), y - 10, X(l), y + 10, { color: COL.dim, width: 2, alpha: a });
    text(g, `10${l === 0 ? '⁰' : '⁻' + String(-l).split('').map((d) => '⁰¹²³⁴⁵⁶⁷⁸⁹'[d]).join('')} m`, X(l), y + 44, { size: 20, color: COL.dim, alpha: a });
  }
  const marks = [[0, 'you', COL.ink], [-10, 'atom', COL.ink], [-15, 'proton', COL.ink], [Math.log10(1.6e-35), 'Planck length', COL.violet]];
  marks.forEach(([l, lab, col], i) => {
    const k = ramp(t, 0.5 + i * 1.1, 1.2 + i * 1.1) * a;
    circle(g, X(l), y, 8, { fill: col, alpha: k });
    text(g, lab, X(l), y - 30, { size: 26, color: col, alpha: k });
  });
  // "quantum foam" near the Planck end: an impression, not a calculation
  const f = ramp(t, 4, 6) * a;
  for (let i = 0; i < 80; i++) {
    const x = X(-35) - 140 + hash(i, 1) * 180, yy = y - 170 + hash(i, 2) * 120;
    circle(g, x, yy, 4 + 8 * (0.5 + 0.5 * noise1(t * 2 + i, 3)), { stroke: COL.violet, width: 1.5, alpha: f * 0.5 });
  }
  note(g, 'spacetime fluctuating at the smallest scales: an impression, no theory confirmed', X(-35) - 50, y - 210, f, 'right');
}

function chips(g, t, a) {
  const items = ['string theory', 'loop quantum gravity', 'asymptotic safety', 'causal sets'];
  items.forEach((s, i) => {
    const k = ramp(t, 0.3 + i * 0.6, 0.9 + i * 0.6) * a;
    const x = 340 + i * 420, y = 450;
    panel(g, x - 180, y - 50, 360, 100, { alpha: k, r: 50 });
    text(g, s, x, y + 2, { size: 30, color: COL.ink, alpha: k });
    text(g, 'unconfirmed', x, y + 34, { size: 20, color: COL.coral, alpha: k });
  });
}

function entangle(g, t, a) {
  for (const [cx, col] of [[760, COL.gold], [1160, COL.light]]) {
    for (const dy of [-60, 60]) { glow(g, cx, 460 + dy, 40, col, a * 0.6); circle(g, cx, 460 + dy, 14, { fill: col, alpha: a * 0.7 }); }
    seg(g, cx, 400, cx, 520, { color: col, width: 1.5, alpha: a * 0.5, dash: [3, 5] });
    text(g, 'in two places at once', cx, 620, { size: 22, color: COL.dim, alpha: a });
  }
  const w = 0.5 + 0.5 * Math.sin(t * 2);
  seg(g, 780, 460, 1140, 460, { color: COL.violet, width: 2, alpha: a * w, dash: [6, 6] });
  text(g, 'does gravity alone entangle them?', 960, 330, { size: 30, color: COL.violet, alpha: a });
  note(g, 'proposed by Bose et al. and by Marletto & Vedral (2017); not yet achieved', 960, 690, a);
}

function pageCurve(g, t, a) {
  const ox = 520, oy = 760, w = 900, h = 420;
  seg(g, ox, oy, ox + w, oy, { color: COL.dim, width: 2, alpha: a });
  seg(g, ox, oy, ox, oy - h, { color: COL.dim, width: 2, alpha: a });
  text(g, 'time as the black hole evaporates', ox + w / 2, oy + 40, { size: 24, color: COL.dim, alpha: a });
  text(g, 'entanglement of the radiation', ox, oy - h - 70, { size: 24, color: COL.dim, alpha: a, align: 'left' });
  const k = ramp(t, 0.5, 4, (u) => u);
  const hawk = [], page = [];
  for (let u = 0; u <= k; u += 0.01) {
    hawk.push([ox + u * w, oy - u * h * 0.95]);
    page.push([ox + u * w, oy - h * 0.95 * Math.min(u, 1 - u) * 1.9]);
  }
  path(g, hawk, { color: COL.coral, width: 3, alpha: a, dash: [8, 6] });
  path(g, page, { color: COL.green, width: 4, alpha: a });
  text(g, 'Hawking (1976): keeps rising — information lost', ox + w - 10, oy - h * 0.55, { size: 22, color: COL.coral, alpha: a, align: 'right' });
  text(g, 'Page curve: rises, then falls — information escapes', ox + w / 2, oy - h * 0.95 - 30, { size: 22, color: COL.green, alpha: a });
  note(g, 'sketch; derived since 2019 only in simplified model universes', ox + w / 2, oy + 80, a);
}

function censorship(g, t, a) {
  circle(g, 700, 470, 120, { fill: '#000', stroke: COL.light, width: 2, alpha: a, dash: [4, 6] });
  glow(g, 700, 470, 20, '#ffffff', a);
  text(g, 'hidden behind a horizon', 700, 650, { size: 26, color: COL.ink, alpha: a });
  glow(g, 1220, 470, 30, '#ffffff', a * (0.6 + 0.4 * Math.sin(t * 4)));
  text(g, '?', 1220, 380, { size: 60, color: COL.coral, alpha: a });
  text(g, 'a “naked” singularity', 1220, 650, { size: 26, color: COL.coral, alpha: a });
  text(g, 'cosmic censorship: always hidden? — unproven', 960, 220, { size: 30, color: COL.ink, alpha: a });
}

function numerical(g, t, a) {
  const cx = 960, cy = 470;
  for (let lev = 0; lev < 4; lev++) {
    const half = 380 / 2 ** lev, step = 40 / 2 ** lev;
    for (let x = -half; x <= half + 0.1; x += step) {
      seg(g, cx + x, cy - half * 0.7, cx + x, cy + half * 0.7, { color: COL.grid, width: 1, alpha: a * (0.15 + lev * 0.05) });
    }
    for (let y = -half * 0.7; y <= half * 0.7 + 0.1; y += step) seg(g, cx - half, cy + y, cx + half, cy + y, { color: COL.grid, width: 1, alpha: a * (0.15 + lev * 0.05) });
  }
  const ph = t * 1.6, sep = 70;
  for (const k of [0, 1]) circle(g, cx + sep * Math.cos(ph + k * Math.PI), cy + sep * Math.sin(ph + k * Math.PI) * 0.7, 18, { fill: '#000', stroke: COL.gold, width: 2.5, alpha: a });
  text(g, 'finer grids where spacetime curves most (adaptive mesh)', 960, 790, { size: 24, color: COL.dim, alpha: a });
  text(g, 'first full simulated mergers: 2005', 960, 160, { size: 30, color: COL.ink, alpha: a });
}

function verdict(g, t, a) {
  const col = (x, title, color, rows) => {
    panel(g, x - 360, 180, 720, 560, { alpha: a, stroke: color });
    text(g, title, x, 250, { size: 32, color, alpha: a });
    rows.forEach((r, i) => text(g, r, x, 340 + i * 70, { size: 28, color: COL.ink, alpha: a * ramp(t, 0.5 + i * 0.5, 1 + i * 0.5) }));
  };
  col(560, 'serious, unconfirmed research', COL.green, ['quantum gravity', 'black-hole information', 'cosmic censorship', 'modified gravity vs. dark sector', 'gravity and entanglement']);
  col(1360, 'science fiction (so far)', COL.coral, ['traversable wormholes', 'warp drives', '— both need negative energy', 'nobody knows how to supply']);
}

export default function draw(g, t, s) {
  const A = s.at;
  background(g, t, { stars: 90, seed: 131 });
  const parts = [[zoom, 0], [chips, 1], [entangle, 2], [pageCurve, 3], [censorship, 4], [numerical, 5]];
  parts.forEach(([fn, i]) => {
    const a = win(t, (A[i] ?? 0) - 0.2, A[i + 1], 0.8, 0.8);
    if (a > 0) fn(g, t - A[i], a);
  });
  const v = ramp(t, A[6] - 0.2, A[6] + 1);
  if (v > 0) verdict(g, t - A[6], v);
}
