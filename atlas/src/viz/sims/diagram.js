// Static diagrams for questions: a block with labelled force arrows, a block
// on an incline, and simple vector sketches. Drawn on canvas with the theme's
// colours; arrows are proportional to the given sizes (not to any scale in
// newtons unless the question says so).

import { themeColors } from '../plot.js';

export const defaults = { kind: 'block' };

export function mount(F, params) {
  const { canvas } = F.canvas({ aspect: 'wide', label: params.alt || 'Force diagram' });
  const ctx = canvas.getContext('2d');
  function draw() {
    const c = themeColors();
    const dpr = Math.min(2, devicePixelRatio || 1);
    const W = canvas.clientWidth, H = canvas.clientHeight;
    canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);
    if (params.kind === 'incline') incline(ctx, W, H, params, c);
    else block(ctx, W, H, params, c);
  }
  F.draw(draw);
}

function block(ctx, W, H, p, c) {
  const cx = W / 2, cy = H * 0.55, s = Math.min(W, H) * 0.22;
  ctx.strokeStyle = c.line3; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(W * 0.08, cy + s / 2); ctx.lineTo(W * 0.92, cy + s / 2); ctx.stroke();
  ctx.fillStyle = c.accent; ctx.globalAlpha = 0.85;
  roundRect(ctx, cx - s / 2, cy - s / 2, s, s, 6); ctx.fill();
  ctx.globalAlpha = 1;
  ctx.fillStyle = '#fff'; ctx.font = '600 14px Inter, sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  if (p.mass !== undefined) ctx.fillText(massText(p.mass), cx, cy);
  const L = Math.min(W, H) * 0.36;
  for (const f of p.forces || []) {
    const a = (f.dir * Math.PI) / 180;
    const ox = cx + Math.cos(a) * s * 0.5, oy = cy - Math.sin(a) * s * 0.5;
    const len = fit(ox, oy, a, Math.max(18, L * (f.size ?? 1)), W, H);
    arrow(ctx, ox, oy, ox + Math.cos(a) * len, oy - Math.sin(a) * len, colorFor(f, c), f.label);
  }
}

function incline(ctx, W, H, p, c) {
  const th = ((p.angle ?? 30) * Math.PI) / 180;
  const x0 = W * 0.12, y0 = H * 0.86, base = W * 0.76;
  const hgt = Math.min(H * 0.7, base * Math.tan(th));
  const b2 = hgt / Math.tan(th);
  ctx.fillStyle = c.panel; ctx.strokeStyle = c.line3; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x0 + b2, y0); ctx.lineTo(x0 + b2, y0 - hgt); ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.fillStyle = c.ink2; ctx.font = '12px Inter, sans-serif'; ctx.textAlign = 'left';
  ctx.fillText(`${p.angle ?? 30}°`, x0 + 34, y0 - 8);
  // block on the slope
  const t = 0.55, bx = x0 + b2 * t, by = y0 - hgt * t, s = Math.min(W, H) * 0.12;
  ctx.save(); ctx.translate(bx, by); ctx.rotate(-th);
  ctx.fillStyle = c.accent; ctx.globalAlpha = 0.85; roundRect(ctx, -s / 2, -s, s, s, 5); ctx.fill(); ctx.globalAlpha = 1;
  ctx.fillStyle = '#fff'; ctx.font = '600 12px Inter, sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  if (p.mass !== undefined) ctx.fillText(massText(p.mass), 0, -s / 2);
  ctx.restore();
  const cx = bx - Math.sin(th) * s / 2, cy = by - Math.cos(th) * s / 2;
  const L = Math.min(W, H) * 0.3;
  for (const f of p.forces || []) {
    // directions: 'down' (gravity), 'normal' (out of the slope), 'into-slope', 'up-slope', 'down-slope'
    const a = { down: -Math.PI / 2, normal: Math.PI / 2 - th, 'into-slope': -Math.PI / 2 - th, 'up-slope': th, 'down-slope': Math.PI + th }[f.dir] ?? 0;
    const len = fit(cx, cy, a, Math.max(18, L * (f.size ?? 1)), W, H);
    arrow(ctx, cx, cy, cx + Math.cos(a) * len, cy - Math.sin(a) * len, colorFor(f, c), f.label);
  }
}

// a number is a mass in kg; a string is shown as written ("m", "2m", "5.0 kg")
const massText = (m) => (typeof m === 'number' ? `${m} kg` : String(m));

// shorten an arrow from (x, y) at angle a so its head and label stay on the canvas
function fit(x, y, a, len, W, H, margin = 24) {
  const dx = Math.cos(a), dy = -Math.sin(a);
  let room = Infinity;
  if (dx > 1e-6) room = Math.min(room, (W - margin - x) / dx);
  if (dx < -1e-6) room = Math.min(room, (margin - x) / dx);
  if (dy > 1e-6) room = Math.min(room, (H - margin - y) / dy);
  if (dy < -1e-6) room = Math.min(room, (margin - y) / dy);
  return Math.max(14, Math.min(len, room));
}

function colorFor(f, c) {
  return f.color ? c[f.color] || f.color : /mg|weight|W/.test(f.label || '') ? c.ink2 : /^f|fric/.test(f.label || '') ? c.bad : /^N/.test(f.label || '') ? c.teal : c.good;
}

function arrow(ctx, x0, y0, x1, y1, color, label) {
  const len = Math.hypot(x1 - x0, y1 - y0);
  const ux = (x1 - x0) / len, uy = (y1 - y0) / len, hd = Math.min(11, len / 2.2);
  ctx.save();
  ctx.strokeStyle = color; ctx.fillStyle = color; ctx.lineWidth = 2.6; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1 - ux * hd * 0.6, y1 - uy * hd * 0.6); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x1 - ux * hd - uy * hd * 0.5, y1 - uy * hd + ux * hd * 0.5); ctx.lineTo(x1 - ux * hd + uy * hd * 0.5, y1 - uy * hd - ux * hd * 0.5); ctx.closePath(); ctx.fill();
  if (label) {
    ctx.font = '600 13px Inter, sans-serif';
    ctx.textAlign = ux > 0.3 ? 'left' : ux < -0.3 ? 'right' : 'center';
    ctx.textBaseline = uy > 0.3 ? 'top' : uy < -0.3 ? 'bottom' : 'middle';
    ctx.fillText(label, x1 + ux * 8, y1 + uy * 8);
  }
  ctx.restore();
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
}
