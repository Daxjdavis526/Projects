// Drawing helpers shared by the scenes: backgrounds, text, lines, arrows,
// glows, clocks, panels and the spacetime-diagram axes. Everything draws in
// the 1920 × 1080 frame and keeps no state between frames.

import { W, H, TAU, clamp, hash, css } from './kit.js';

export const SANS = 'Jost, "Avenir Next", "Segoe UI", Helvetica, Arial, sans-serif';
export const SERIF = '"Cormorant Garamond", Georgia, serif';

export const COL = {
  bg0: '#060a14', bg1: '#0c1426',
  ink: '#eaf0f8', dim: '#8f9bb3', faint: '#4a5876',
  grid: '#7896c8',
  light: '#8fe3ff',     // photons, light rays, light cones
  gold: '#f2c14e',      // worldlines, the thing to watch
  blue: '#6fa8ff',      // structure, equations
  coral: '#ff7a6b',     // warnings, “science fiction”, captured
  green: '#7ee0a1',     // confirmed
  violet: '#b49cff',
};

export function background(g, t = 0, { stars = 0, seed = 1, glow = null } = {}) {
  const gr = g.createLinearGradient(0, 0, 0, H);
  gr.addColorStop(0, COL.bg1);
  gr.addColorStop(1, COL.bg0);
  g.fillStyle = gr;
  g.fillRect(0, 0, W, H);
  if (glow) {
    const [x, y, r, c, a] = glow;
    const rg = g.createRadialGradient(x, y, 0, x, y, r);
    rg.addColorStop(0, css(c, a));
    rg.addColorStop(1, css(c, 0));
    g.fillStyle = rg;
    g.fillRect(0, 0, W, H);
  }
  if (stars) starfield(g, t, stars, seed);
}

export function starfield(g, t, n = 220, seed = 1, alpha = 1) {
  g.save();
  for (let i = 0; i < n; i++) {
    const x = hash(i, seed) * W, y = hash(i, seed + 1) * H;
    const r = 0.5 + hash(i, seed + 2) ** 3 * 1.8;
    const tw = 0.65 + 0.35 * Math.sin(t * (0.6 + hash(i, seed + 3) * 1.4) + i);
    g.globalAlpha = alpha * tw * (0.35 + 0.65 * hash(i, seed + 4));
    g.fillStyle = '#dfe8ff';
    g.beginPath(); g.arc(x, y, r, 0, TAU); g.fill();
  }
  g.restore();
}

// Text. Options: size, face, weight, italic, color, alpha, align, baseline,
// spacing (px of letter spacing), shadow (blur px).
export function text(g, str, x, y, o = {}) {
  const { size = 32, face = SANS, weight = 400, italic = false, color = COL.ink, alpha = 1,
    align = 'center', baseline = 'alphabetic', spacing = 0, shadow = 0 } = o;
  if (alpha <= 0.002) return 0;
  g.save();
  g.globalAlpha = clamp(alpha);
  g.font = `${italic ? 'italic ' : ''}${weight} ${size}px ${face}`;
  if ('letterSpacing' in g) g.letterSpacing = `${spacing}px`;
  g.textAlign = align;
  g.textBaseline = baseline;
  if (shadow) { g.shadowColor = 'rgba(0,0,0,0.85)'; g.shadowBlur = shadow; }
  g.fillStyle = color;
  g.fillText(str, x, y);
  const w = g.measureText(str).width;
  g.restore();
  return w;
}

// A small italic note, e.g. "not to scale".
export const note = (g, str, x, y, alpha = 1, align = 'center') =>
  text(g, str, x, y, { size: 22, italic: true, color: COL.dim, alpha, align });

export function path(g, pts, o = {}) {
  const { color = COL.ink, width = 3, alpha = 1, dash = null, close = false, fill = null, cap = 'round' } = o;
  if (pts.length < 2 || alpha <= 0.002) return;
  g.save();
  g.globalAlpha = clamp(alpha);
  g.lineCap = cap; g.lineJoin = 'round';
  g.beginPath();
  g.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length; i++) g.lineTo(pts[i][0], pts[i][1]);
  if (close) g.closePath();
  if (fill) { g.fillStyle = fill; g.fill(); }
  if (width > 0) {
    if (dash) g.setLineDash(dash);
    g.strokeStyle = color; g.lineWidth = width; g.stroke();
  }
  g.restore();
}

export const seg = (g, x1, y1, x2, y2, o) => path(g, [[x1, y1], [x2, y2]], o);

export function arrow(g, x1, y1, x2, y2, o = {}) {
  const { color = COL.ink, width = 3, alpha = 1, head = 14, dash = null } = o;
  const a = Math.atan2(y2 - y1, x2 - x1);
  seg(g, x1, y1, x2 - Math.cos(a) * head * 0.6, y2 - Math.sin(a) * head * 0.6, { color, width, alpha, dash });
  path(g, [
    [x2 - Math.cos(a - 0.42) * head, y2 - Math.sin(a - 0.42) * head],
    [x2, y2],
    [x2 - Math.cos(a + 0.42) * head, y2 - Math.sin(a + 0.42) * head],
  ], { color, width: 0, alpha, fill: css(color, 1), close: true });
}

export function circle(g, x, y, r, o = {}) {
  const { fill = null, stroke = null, width = 2, alpha = 1, dash = null } = o;
  if (alpha <= 0.002 || r <= 0) return;
  g.save();
  g.globalAlpha = clamp(alpha);
  g.beginPath(); g.arc(x, y, r, 0, TAU);
  if (fill) { g.fillStyle = fill; g.fill(); }
  if (stroke) { if (dash) g.setLineDash(dash); g.strokeStyle = stroke; g.lineWidth = width; g.stroke(); }
  g.restore();
}

export function glow(g, x, y, r, color, alpha = 1) {
  if (alpha <= 0.002) return;
  g.save();
  const rg = g.createRadialGradient(x, y, 0, x, y, r);
  rg.addColorStop(0, css(color, alpha));
  rg.addColorStop(0.35, css(color, alpha * 0.35));
  rg.addColorStop(1, css(color, 0));
  g.fillStyle = rg;
  g.fillRect(x - r, y - r, 2 * r, 2 * r);
  g.restore();
}

export function rrect(g, x, y, w, h, r) {
  g.beginPath();
  g.moveTo(x + r, y);
  g.arcTo(x + w, y, x + w, y + h, r);
  g.arcTo(x + w, y + h, x, y + h, r);
  g.arcTo(x, y + h, x, y, r);
  g.arcTo(x, y, x + w, y, r);
  g.closePath();
}

export function panel(g, x, y, w, h, o = {}) {
  const { fill = 'rgba(14,22,42,0.82)', stroke = 'rgba(143,179,227,0.28)', r = 14, alpha = 1, width = 1.5 } = o;
  if (alpha <= 0.002) return;
  g.save();
  g.globalAlpha = clamp(alpha);
  rrect(g, x, y, w, h, r);
  g.fillStyle = fill; g.fill();
  if (stroke) { g.strokeStyle = stroke; g.lineWidth = width; g.stroke(); }
  g.restore();
}

// An analog clock face with one hand at `turns` revolutions.
export function clockFace(g, x, y, r, turns, o = {}) {
  const { color = COL.ink, alpha = 1, hand = COL.gold, face = 'rgba(10,16,30,0.85)' } = o;
  if (alpha <= 0.002) return;
  circle(g, x, y, r, { fill: face, stroke: color, width: Math.max(2, r * 0.06), alpha });
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * TAU;
    seg(g, x + Math.sin(a) * r * 0.78, y - Math.cos(a) * r * 0.78, x + Math.sin(a) * r * 0.9, y - Math.cos(a) * r * 0.9, { color, width: Math.max(1.5, r * 0.03), alpha: alpha * 0.8 });
  }
  const a = turns * TAU;
  seg(g, x, y, x + Math.sin(a) * r * 0.72, y - Math.cos(a) * r * 0.72, { color: hand, width: Math.max(2.5, r * 0.07), alpha });
  circle(g, x, y, Math.max(3, r * 0.07), { fill: hand, alpha });
}

// Spacetime-diagram axes: origin (ox, oy), scale px per unit, extents in units.
export function stAxes(g, ox, oy, s, { xmin = -4, xmax = 4, tmin = -0.5, tmax = 4, alpha = 1, grid = true, labels = true } = {}) {
  if (grid) {
    for (let x = Math.ceil(xmin); x <= xmax; x++) seg(g, ox + x * s, oy - tmin * s, ox + x * s, oy - tmax * s, { color: COL.grid, width: 1, alpha: 0.12 * alpha });
    for (let t = Math.ceil(tmin); t <= tmax; t++) seg(g, ox + xmin * s, oy - t * s, ox + xmax * s, oy - t * s, { color: COL.grid, width: 1, alpha: 0.12 * alpha });
  }
  arrow(g, ox + xmin * s, oy, ox + xmax * s + 16, oy, { color: COL.dim, width: 2, alpha });
  arrow(g, ox, oy - tmin * s, ox, oy - tmax * s - 16, { color: COL.dim, width: 2, alpha });
  if (labels) {
    text(g, 'space, x', ox + xmax * s + 10, oy + 34, { size: 24, color: COL.dim, alpha, align: 'right' });
    text(g, 'time, ct', ox + 14, oy - tmax * s - 6, { size: 24, color: COL.dim, alpha, align: 'left' });
  }
}

// Map a spacetime-diagram point (x, ct) to the screen.
export const stPt = (ox, oy, s) => (x, t) => [ox + x * s, oy - t * s];
