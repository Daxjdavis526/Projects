// Canvas drawing helpers shared by every scene. Everything is drawn in a
// virtual 1920×1080 frame; the film scales the context before calling in.
// Every animated helper is a pure function of time, so any frame can be
// rendered directly — seeking and screenshots need no simulation history.

import { W, H, TAU, clamp, lerp, hash, noise1, fbm1, css, rgb, mix, smooth } from './kit.js';

// Backing-store pixels per virtual pixel; set by the film on resize.
export const view = { px: 1 };

// ─── offscreen canvases ────────────────────────────────────────────────────

function makeCanvas(w, h) {
  if (typeof OffscreenCanvas !== 'undefined') return new OffscreenCanvas(w, h);
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  return c;
}

// A picture drawn once at the current resolution and reused every frame.
const caches = new Map();
export function cached(key, w, h, draw) {
  const k = `${key}@${view.px}`;
  let c = caches.get(k);
  if (!c) {
    const pw = Math.max(1, Math.ceil(w * view.px)), ph = Math.max(1, Math.ceil(h * view.px));
    c = makeCanvas(pw, ph);
    const g = c.getContext('2d');
    g.scale(view.px, view.px);
    draw(g, w, h);
    caches.set(k, c);
  }
  return c;
}
export function clearCaches() { caches.clear(); layers.length = 0; }

// Full-frame scratch layers, for things that must be composited as a whole
// (a translucent figure whose limbs overlap, a scene dissolving over another).
const layers = [];
let layerDepth = 0;
export function layer(ctx, alpha, draw, mode = 'source-over') {
  if (alpha <= 0.001) return;
  if (alpha >= 0.999 && mode === 'source-over') { draw(ctx); return; }
  const pw = ctx.canvas.width, ph = ctx.canvas.height;
  let c = layers[layerDepth];
  if (!c || c.width !== pw || c.height !== ph) { c = makeCanvas(pw, ph); layers[layerDepth] = c; }
  const g = c.getContext('2d');
  g.setTransform(1, 0, 0, 1, 0, 0);
  g.clearRect(0, 0, pw, ph);
  g.setTransform(ctx.getTransform());
  layerDepth++;
  try { draw(g); } finally { layerDepth--; }
  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.globalAlpha = alpha;
  ctx.globalCompositeOperation = mode;
  ctx.drawImage(c, 0, 0);
  ctx.restore();
}

// ─── fills and light ───────────────────────────────────────────────────────

export function fill(ctx, color, alpha = 1) {
  ctx.fillStyle = css(color, alpha);
  ctx.fillRect(-2, -2, W + 4, H + 4);
}

// stops: [[0, '#000'], [1, '#fff']] — vertical from y0 to y1.
export function vgrad(ctx, stops, y0 = 0, y1 = H, x = -2, w = W + 4, top = y0, bottom = y1) {
  const g = ctx.createLinearGradient(0, y0, 0, y1);
  for (const [p, c, a] of stops) g.addColorStop(clamp(p), css(c, a ?? 1));
  ctx.fillStyle = g;
  ctx.fillRect(x, top, w, bottom - top);
}

export function radial(ctx, x, y, r, stops, mode) {
  const g = ctx.createRadialGradient(x, y, 0, x, y, r);
  for (const [p, c, a] of stops) g.addColorStop(clamp(p), css(c, a ?? 1));
  ctx.save();
  if (mode) ctx.globalCompositeOperation = mode;
  ctx.fillStyle = g;
  ctx.fillRect(x - r, y - r, r * 2, r * 2);
  ctx.restore();
}

// A soft additive light.
export function glow(ctx, x, y, r, color, a = 1, mode = 'lighter') {
  if (a <= 0.002 || r <= 0) return;
  radial(ctx, x, y, r, [[0, color, a], [0.25, color, a * 0.45], [0.6, color, a * 0.1], [1, color, 0]], mode);
}

export function vignette(ctx, k = 0.6, color = '#000', inner = 0.45) {
  const g = ctx.createRadialGradient(W / 2, H / 2, H * inner, W / 2, H / 2, H * 1.05);
  g.addColorStop(0, css(color, 0));
  g.addColorStop(1, css(color, k));
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
}

// Crepuscular rays fanning from (x, y).
export function rays(ctx, t, x, y, { angle = Math.PI / 2, spread = 0.9, len = 1400, n = 9, color = '#ffe8b0', a = 0.12, seed = 3, width = 0.05 } = {}) {
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  for (let i = 0; i < n; i++) {
    const u = n === 1 ? 0.5 : i / (n - 1);
    const th = angle + (u - 0.5) * spread + noise1(t * 0.08 + i * 3.1, seed) * 0.03;
    const wv = width * (0.5 + hash(i, seed));
    const al = a * (0.35 + 0.65 * (0.5 + 0.5 * noise1(t * 0.25 + i * 7.3, seed + 1)));
    const g = ctx.createLinearGradient(x, y, x + Math.cos(th) * len, y + Math.sin(th) * len);
    g.addColorStop(0, css(color, al));
    g.addColorStop(1, css(color, 0));
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + Math.cos(th - wv) * len, y + Math.sin(th - wv) * len);
    ctx.lineTo(x + Math.cos(th + wv) * len, y + Math.sin(th + wv) * len);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();
}

// ─── stars ─────────────────────────────────────────────────────────────────

const STAR_TINTS = ['#aac4ff', '#d4e0ff', '#ffffff', '#fff4e0', '#ffe2b8', '#ffc98f'];

export class Starfield {
  constructor(seed = 1, n = 1400, w = W, h = H * 2) {
    this.w = w; this.h = h;
    const s = [];
    for (let i = 0; i < n; i++) {
      const m = hash(i, seed * 11 + 1);
      s.push({
        x: hash(i, seed) * w,
        y: hash(i, seed + 7) * h,
        m: m ** 7,                                   // brightness, mostly faint
        c: STAR_TINTS[Math.floor(hash(i, seed + 3) * STAR_TINTS.length)],
        tw: 0.6 + hash(i, seed + 5) * 2.2,           // twinkle rate
        ph: hash(i, seed + 9) * TAU,
      });
    }
    this.stars = s;
  }

  // dx, dy shift the field (parallax / tilt); rot rotates it about (cx, cy).
  draw(ctx, t, { alpha = 1, dx = 0, dy = 0, twinkle = 1, scale = 1, cx = W / 2, cy = H / 2, rot = 0, big = 1, clipY = Infinity } = {}) {
    if (alpha <= 0) return;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    const cr = Math.cos(rot), sr = Math.sin(rot);
    for (let i = 0; i < this.stars.length; i++) {
      const s = this.stars[i];
      let x = s.x + dx, y = s.y + dy;
      if (rot) {
        const ox = x - cx, oy = y - cy;
        x = cx + ox * cr - oy * sr; y = cy + ox * sr + oy * cr;
      }
      if (x < -20 || x > W + 20 || y < -20 || y > Math.min(H + 20, clipY)) continue;
      const tw = 1 - twinkle * 0.45 * (0.5 + 0.5 * Math.sin(t * s.tw + s.ph)) * (1 - s.m);
      const a = alpha * clamp(0.18 + s.m * 1.4) * tw;
      const r = (0.55 + s.m * 2.1) * scale;
      ctx.fillStyle = css(s.c, a);
      ctx.fillRect(x - r, y - r, r * 2, r * 2);
      if (s.m > 0.5 && big > 0) {
        const gr = r * 5 * big;
        const g = ctx.createRadialGradient(x, y, 0, x, y, gr);
        g.addColorStop(0, css(s.c, a * 0.55));
        g.addColorStop(1, css(s.c, 0));
        ctx.fillStyle = g;
        ctx.fillRect(x - gr, y - gr, gr * 2, gr * 2);
        if (s.m > 0.8) {  // diffraction glint
          ctx.fillStyle = css(s.c, a * 0.22);
          ctx.fillRect(x - gr * 1.4, y - 0.5, gr * 2.8, 1);
          ctx.fillRect(x - 0.5, y - gr * 1.4, 1, gr * 2.8);
        }
      }
    }
    ctx.restore();
  }
}

// The Milky Way as a pre-rendered band, drawn with a transform.
export function milkyWay(ctx, { x = W / 2, y = H / 2, angle = -0.5, alpha = 1, scale = 1 } = {}) {
  if (alpha <= 0) return;
  const bw = 2600, bh = 700;
  const img = cached('milkyway', bw, bh, (g) => {
    // diffuse glow
    for (let i = 0; i < 90; i++) {
      const u = i / 89;
      const px = u * bw;
      const off = fbm1(u * 3, 41) * 90;
      const r = 150 + fbm1(u * 5, 42) * 90;
      const tone = mix('#8fa3d9', '#e8d6c0', clamp(0.5 + fbm1(u * 4, 45)));
      const gr = g.createRadialGradient(px, bh / 2 + off, 0, px, bh / 2 + off, r);
      gr.addColorStop(0, css(tone, 0.07));
      gr.addColorStop(1, css(tone, 0));
      g.fillStyle = gr;
      g.fillRect(px - r, bh / 2 + off - r, r * 2, r * 2);
    }
    // star dust, densest along the spine
    for (let i = 0; i < 16000; i++) {
      const u = hash(i, 91);
      const px = u * bw;
      const spread = (hash(i, 92) + hash(i, 93) + hash(i, 94) - 1.5) * 2;
      const py = bh / 2 + fbm1(u * 3, 41) * 90 + spread * 120;
      const b = hash(i, 95) ** 3;
      g.fillStyle = css(hash(i, 96) > 0.5 ? '#dfe6ff' : '#ffeedd', 0.15 + b * 0.6);
      const r = 0.4 + b * 0.9;
      g.fillRect(px, py, r, r);
    }
    // dust lanes
    g.globalCompositeOperation = 'destination-out';
    for (let i = 0; i < 70; i++) {
      const u = i / 69;
      const px = u * bw;
      const py = bh / 2 + fbm1(u * 3, 41) * 90 + fbm1(u * 9, 47) * 40;
      const r = 40 + hash(i, 48) * 60;
      const gr = g.createRadialGradient(px, py, 0, px, py, r);
      gr.addColorStop(0, 'rgba(0,0,0,0.55)');
      gr.addColorStop(1, 'rgba(0,0,0,0)');
      g.fillStyle = gr;
      g.fillRect(px - r, py - r, r * 2, r * 2);
    }
  });
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.globalCompositeOperation = 'lighter';
  ctx.translate(x, y);
  ctx.rotate(angle);
  ctx.scale(scale, scale);
  ctx.drawImage(img, -bw / 2, -bh / 2, bw, bh);
  ctx.restore();
}

// A streak across the sky. u in [0,1] is its life.
export function shootingStar(ctx, u, x0, y0, x1, y1, a = 1) {
  if (u <= 0 || u >= 1) return;
  const head = smooth(u);
  const tail = Math.max(0, head - 0.28);
  const hx = lerp(x0, x1, head), hy = lerp(y0, y1, head);
  const tx = lerp(x0, x1, tail), ty = lerp(y0, y1, tail);
  const fade = Math.sin(u * Math.PI) * a;
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  const g = ctx.createLinearGradient(tx, ty, hx, hy);
  g.addColorStop(0, 'rgba(255,255,255,0)');
  g.addColorStop(1, css('#ffffff', fade));
  ctx.strokeStyle = g;
  ctx.lineWidth = 2.2;
  ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(tx, ty); ctx.lineTo(hx, hy); ctx.stroke();
  ctx.restore();
  glow(ctx, hx, hy, 18, '#dfe8ff', fade * 0.8);
}

// ─── landscape ─────────────────────────────────────────────────────────────

// A rolling horizon. Returns the height function so figures can stand on it.
export function hillFn(base, amp, freq, seed, oct = 4) {
  return (x) => base - amp * (0.5 + 0.5 * fbm1(x * freq, seed, oct));
}
export function hills(ctx, f, color, alpha = 1, x0 = -40, x1 = W + 40, bottom = H + 40, step = 6) {
  ctx.fillStyle = css(color, alpha);
  ctx.beginPath();
  ctx.moveTo(x0, bottom);
  for (let x = x0; x <= x1; x += step) ctx.lineTo(x, f(x));
  ctx.lineTo(x1, f(x1));
  ctx.lineTo(x1, bottom);
  ctx.closePath();
  ctx.fill();
}

// Grass blades along a ground function, swaying in the wind.
export function grass(ctx, t, f, { x0 = -20, x1 = W + 20, density = 0.5, h = 18, color = '#000', seed = 5, wind = 1 } = {}) {
  ctx.strokeStyle = css(color);
  ctx.lineCap = 'round';
  const n = Math.floor((x1 - x0) * density);
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  for (let i = 0; i < n; i++) {
    const x = x0 + hash(i, seed) * (x1 - x0);
    const y = f(x) + 2;
    const hh = h * (0.4 + hash(i, seed + 1) * 0.9);
    const sway = (Math.sin(t * 1.3 + x * 0.013) * 0.6 + noise1(t * 0.7 + x * 0.004, seed) * 0.8) * wind;
    const tipx = x + sway * hh * 0.35 + (hash(i, seed + 2) - 0.5) * hh * 0.4;
    ctx.moveTo(x, y);
    ctx.quadraticCurveTo(x + (tipx - x) * 0.3, y - hh * 0.6, tipx, y - hh);
  }
  ctx.stroke();
}

// A silhouetted tree, drawn once and cached. size ~ height in px.
export function tree(ctx, x, y, size, color, seed = 1, sway = 0) {
  const s = size / 560;
  const img = cached(`tree${seed}:${color}`, 900, 640, (g) => {
    g.fillStyle = g.strokeStyle = css(color);
    g.lineCap = 'round';
    const branch = (bx, by, ang, len, w, d) => {
      const ex = bx + Math.cos(ang) * len, ey = by + Math.sin(ang) * len;
      g.lineWidth = w;
      g.beginPath(); g.moveTo(bx, by);
      g.quadraticCurveTo(bx + Math.cos(ang + 0.2) * len * 0.5, by + Math.sin(ang + 0.2) * len * 0.5, ex, ey);
      g.stroke();
      if (d <= 0 || len < 8) {
        // leaf clump
        for (let k = 0; k < 7; k++) {
          const r = 10 + hash(k + d * 13 + Math.floor(ex), seed) * 18;
          g.beginPath();
          g.arc(ex + (hash(k, seed + Math.floor(ey)) - 0.5) * 34, ey + (hash(k + 9, seed + Math.floor(ex)) - 0.5) * 28, r, 0, TAU);
          g.fill();
        }
        return;
      }
      const n = 2 + (hash(d * 7 + Math.floor(bx), seed) > 0.6 ? 1 : 0);
      for (let k = 0; k < n; k++) {
        const da = (k / (n - 1 || 1) - 0.5) * 1.1 + (hash(k + d * 5 + Math.floor(ey), seed) - 0.5) * 0.5;
        branch(ex, ey, ang + da, len * (0.68 + hash(k * 3 + d, seed) * 0.18), w * 0.66, d - 1);
      }
    };
    branch(450, 640, -Math.PI / 2, 150, 30, 5);
  });
  ctx.save();
  ctx.translate(x, y);
  if (sway) ctx.transform(1, 0, sway, 1, 0, 0);
  ctx.drawImage(img, -450 * s, -640 * s, 900 * s, 640 * s);
  ctx.restore();
}

// ─── weather and particles ────────────────────────────────────────────────

export function rain(ctx, t, { n = 500, speed = 1400, angle = 0.12, len = 34, color = '#c8d6e8', a = 0.35, seed = 7, x0 = -100, x1 = W + 100, y0 = -60, y1 = H + 60, width = 1.2 } = {}) {
  ctx.save();
  ctx.strokeStyle = css(color, a);
  ctx.lineWidth = width;
  ctx.beginPath();
  const span = y1 - y0;
  const dx = Math.sin(angle), dy = Math.cos(angle);
  for (let i = 0; i < n; i++) {
    const v = speed * (0.75 + hash(i, seed) * 0.5);
    const y = y0 + ((t * v + hash(i, seed + 1) * span) % span);
    const x = x0 + hash(i, seed + 2) * (x1 - x0) + (y - y0) * dx / dy;
    const l = len * (0.6 + hash(i, seed + 3) * 0.8);
    ctx.moveTo(x, y);
    ctx.lineTo(x - dx * l, y - dy * l);
  }
  ctx.stroke();
  ctx.restore();
}

// Rain hitting a surface: expanding rings, each alive for a fraction of a second.
export function splashes(ctx, t, { n = 60, y0 = 900, y1 = H, x0 = 0, x1 = W, color = '#c8d6e8', a = 0.3, seed = 8, rate = 3 } = {}) {
  ctx.save();
  ctx.strokeStyle = css(color, a);
  ctx.lineWidth = 1;
  for (let i = 0; i < n; i++) {
    const cyc = t * rate + hash(i, seed);
    const k = cyc - Math.floor(cyc);
    const gen = Math.floor(cyc);
    const x = x0 + hash(i * 131 + gen, seed + 1) * (x1 - x0);
    const y = y0 + hash(i * 71 + gen, seed + 2) * (y1 - y0);
    const persp = 0.4 + 0.6 * (y - y0) / (y1 - y0 || 1);
    const r = k * 9 * persp;
    ctx.globalAlpha = (1 - k);
    ctx.beginPath();
    ctx.ellipse(x, y, r, r * 0.3, 0, 0, TAU);
    ctx.stroke();
  }
  ctx.restore();
}

// A continuous spray of hot sparks from (x, y). Each spark is born at a fixed
// time and flies ballistically, bouncing once off the floor.
export function sparks(ctx, t, { x, y, rate = 120, life = 1.2, speed = 420, angle = -Math.PI / 2, spread = 1.2, g = 900, floor = H, seed = 11, size = 1.6, t0 = -Infinity, t1 = Infinity, drag = 0.6, hot = 1, streak = 0.028 } = {}) {
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  ctx.lineCap = 'round';
  const kLo = Math.max(Math.floor((t - life) * rate), Math.ceil(t0 * rate));
  const kHi = Math.min(Math.floor(t * rate), Math.floor(t1 * rate));
  for (let k = kLo; k <= kHi; k++) {
    const born = k / rate;
    const age = t - born;
    if (age < 0) continue;
    const L = life * (0.4 + hash(k, seed) * 0.9);
    if (age > L) continue;
    const th = angle + (hash(k, seed + 1) - 0.5) * spread;
    const v = speed * (0.35 + hash(k, seed + 2) * 0.9);
    let vx = Math.cos(th) * v, vy = Math.sin(th) * v;
    // linear drag, integrated exactly
    const d = drag;
    const e = Math.exp(-d * age);
    let px = x + vx * (1 - e) / d;
    let py = y + (vy + g / d) * (1 - e) / d - g * age / d;
    let cvx = vx * e, cvy = (vy + g / d) * e - g / d;
    if (py > floor) {  // one soft bounce
      py = floor - (py - floor) * 0.25;
      cvy = -cvy * 0.25;
    }
    const heat = (1 - age / L);
    const c = heat > 0.75 ? '#fffbe8' : heat > 0.45 ? '#ffd27a' : heat > 0.2 ? '#ff9a3a' : '#d9481c';
    ctx.strokeStyle = css(c, clamp(heat * 1.4) * hot);
    ctx.lineWidth = size * (0.6 + heat);
    ctx.beginPath();
    ctx.moveTo(px, py);
    ctx.lineTo(px - cvx * streak, py - cvy * streak);
    ctx.stroke();
  }
  ctx.restore();
}

// Slow motes drifting in light (dust, pollen, embers, fireflies).
export function motes(ctx, t, { n = 60, x0 = 0, x1 = W, y0 = 0, y1 = H, color = '#fff2d0', a = 0.5, size = 2, seed = 13, drift = 12, rise = 6, blink = 0, glowR = 0 } = {}) {
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  for (let i = 0; i < n; i++) {
    const w = x1 - x0, h = y1 - y0;
    let x = x0 + ((hash(i, seed) * w + noise1(t * 0.15 + i, seed) * drift * 4 + t * drift * (hash(i, seed + 4) - 0.5)) % w + w) % w;
    let y = y0 + ((hash(i, seed + 1) * h - t * rise * (0.5 + hash(i, seed + 5)) + noise1(t * 0.2 + i * 3, seed + 2) * drift * 3) % h + h) % h;
    let al = a * (0.35 + 0.65 * hash(i, seed + 3));
    if (blink) al *= clamp(0.5 + 0.9 * Math.sin(t * (0.6 + hash(i, seed + 6) * 1.2) * blink + i));
    if (al <= 0.01) continue;
    const r = size * (0.5 + hash(i, seed + 7));
    ctx.fillStyle = css(color, al);
    ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill();
    if (glowR) glow(ctx, x, y, glowR * r, color, al * 0.4);
  }
  ctx.restore();
}

// Petals / confetti: flat flakes tumbling down.
export function flakes(ctx, t, { n = 80, colors = ['#fff'], seed = 17, x0 = 0, x1 = W, y0 = -40, y1 = H + 40, fall = 60, sway = 40, size = 6, a = 0.9, t0 = 0 } = {}) {
  ctx.save();
  const span = y1 - y0;
  for (let i = 0; i < n; i++) {
    const born = t0 + hash(i, seed + 9) * 3;
    if (t < born) continue;
    const age = t - born;
    const y = y0 + ((hash(i, seed + 1) * 0.3 * span + age * fall * (0.6 + hash(i, seed + 2) * 0.8)) % span);
    const x = x0 + hash(i, seed) * (x1 - x0) + Math.sin(age * (0.8 + hash(i, seed + 3)) + i) * sway;
    const spin = age * (1 + hash(i, seed + 4) * 3) + i;
    ctx.fillStyle = css(colors[i % colors.length], a);
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(spin * 0.7);
    ctx.scale(1, Math.abs(Math.cos(spin)) * 0.8 + 0.2);
    ctx.beginPath();
    ctx.ellipse(0, 0, size, size * 0.6, 0, 0, TAU);
    ctx.fill();
    ctx.restore();
  }
  ctx.restore();
}

// Rising smoke puffs from (x, y).
export function smoke(ctx, t, { x, y, rate = 8, life = 4, rise = 60, spread = 40, size = 40, grow = 60, color = '#888', a = 0.25, seed = 19, t0 = -Infinity, t1 = Infinity, wind = 10 } = {}) {
  ctx.save();
  const kLo = Math.max(Math.floor((t - life) * rate), Math.ceil(t0 * rate));
  const kHi = Math.min(Math.floor(t * rate), Math.floor(t1 * rate));
  for (let k = kLo; k <= kHi; k++) {
    const age = t - k / rate;
    if (age < 0 || age > life) continue;
    const u = age / life;
    const px = x + (hash(k, seed) - 0.5) * spread * (0.3 + u) + wind * age + noise1(age + k, seed) * 10;
    const py = y - rise * age * (0.7 + hash(k, seed + 1) * 0.6);
    const r = size * (0.5 + hash(k, seed + 2) * 0.6) + grow * u;
    const al = a * Math.sin(Math.PI * Math.min(1, u * 1.4 + 0.02)) * (1 - u);
    radial(ctx, px, py, r, [[0, color, al], [0.6, color, al * 0.5], [1, color, 0]]);
  }
  ctx.restore();
}

// ─── film texture ─────────────────────────────────────────────────────────

let grainTiles = null;
export function grain(ctx, t, amount = 0.06) {
  if (amount <= 0) return;
  if (!grainTiles) {
    grainTiles = [];
    for (let k = 0; k < 4; k++) {
      const c = makeCanvas(256, 256);
      const g = c.getContext('2d');
      const im = g.createImageData(256, 256);
      for (let i = 0; i < 256 * 256; i++) {
        const v = Math.floor(hash(i, 300 + k) * 255);
        im.data[i * 4] = im.data[i * 4 + 1] = im.data[i * 4 + 2] = v;
        im.data[i * 4 + 3] = 255;
      }
      g.putImageData(im, 0, 0);
      grainTiles.push(c);
    }
  }
  const tile = grainTiles[Math.floor(t * 24) % 4];
  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.globalAlpha = amount;
  ctx.globalCompositeOperation = 'overlay';
  const pat = ctx.createPattern(tile, 'repeat');
  const ox = Math.floor(hash(Math.floor(t * 24), 5) * 256), oy = Math.floor(hash(Math.floor(t * 24), 6) * 256);
  pat.setTransform?.(new DOMMatrix([1, 0, 0, 1, ox, oy]));
  ctx.fillStyle = pat;
  ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  ctx.restore();
}

// ─── geometry ─────────────────────────────────────────────────────────────

export function rrect(ctx, x, y, w, h, r) {
  r = Math.min(r, Math.abs(w) / 2, Math.abs(h) / 2);
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}
export function box(ctx, x, y, w, h, color, alpha = 1, r = 0) {
  ctx.fillStyle = css(color, alpha);
  if (r) { ctx.beginPath(); rrect(ctx, x, y, w, h, r); ctx.fill(); } else ctx.fillRect(x, y, w, h);
}
export function line(ctx, x0, y0, x1, y1, color, w = 2, alpha = 1) {
  ctx.strokeStyle = css(color, alpha);
  ctx.lineWidth = w;
  ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke();
}
export function circle(ctx, x, y, r, color, alpha = 1) {
  ctx.fillStyle = css(color, alpha);
  ctx.beginPath(); ctx.arc(x, y, Math.max(0, r), 0, TAU); ctx.fill();
}

// The outline of two circles joined by their tangents — a tapered limb.
export function capsulePath(ctx, x1, y1, r1, x2, y2, r2) {
  const dx = x2 - x1, dy = y2 - y1;
  const d = Math.hypot(dx, dy);
  if (d < 1e-6 || d <= Math.abs(r1 - r2)) {
    ctx.moveTo(x1 + Math.max(r1, r2), y1);
    ctx.arc(x1, y1, Math.max(r1, r2), 0, TAU);
    return;
  }
  const a = Math.atan2(dy, dx);
  const b = Math.acos((r1 - r2) / d);
  ctx.moveTo(x1 + Math.cos(a + b) * r1, y1 + Math.sin(a + b) * r1);
  ctx.arc(x1, y1, r1, a + b, a - b + TAU * (a - b < a + b ? 1 : 0), false);
  ctx.arc(x2, y2, r2, a - b, a + b, false);
  ctx.closePath();
}

// Text in the film's two faces.
export const SERIF = '"Cormorant Garamond", "Iowan Old Style", Palatino, Georgia, serif';
export const SANS = 'Jost, "Avenir Next", "Segoe UI", Helvetica, Arial, sans-serif';
export function text(ctx, str, x, y, { size = 40, face = SERIF, italic = false, weight = 400, color = '#fff', alpha = 1, align = 'center', base = 'alphabetic', spacing = 0, shadow = 0 } = {}) {
  if (alpha <= 0.002) return;
  ctx.save();
  ctx.font = `${italic ? 'italic ' : ''}${weight} ${size}px ${face}`;
  ctx.textAlign = align;
  ctx.textBaseline = base;
  if ('letterSpacing' in ctx) ctx.letterSpacing = `${spacing}px`;
  if (shadow) {
    ctx.shadowColor = `rgba(0,0,0,${0.75 * alpha})`;
    ctx.shadowBlur = shadow;
  }
  ctx.fillStyle = css(color, alpha);
  ctx.fillText(str, x, y);
  ctx.restore();
}

export { rgb, mix, css };

// Draw something through a heat haze: rendered to a scratch layer, then
// copied back in horizontal strips that sway independently.
let hazeCanvas = null;
export function haze(ctx, t, amt, draw, strip = 12) {
  const pw = ctx.canvas.width, ph = ctx.canvas.height;
  if (!hazeCanvas || hazeCanvas.width !== pw || hazeCanvas.height !== ph) hazeCanvas = makeCanvas(pw, ph);
  const g = hazeCanvas.getContext('2d');
  g.setTransform(1, 0, 0, 1, 0, 0);
  g.clearRect(0, 0, pw, ph);
  g.setTransform(ctx.getTransform());
  draw(g);
  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  const sp = Math.max(2, Math.round(strip * view.px));
  for (let y = 0; y < ph; y += sp) {
    const off = amt * view.px * (Math.sin(t * 3.1 + y * 0.045 / view.px) * 0.6 + Math.sin(t * 5.3 + y * 0.11 / view.px) * 0.4);
    ctx.drawImage(hazeCanvas, 0, y, pw, sp, off, y, pw, sp);
  }
  ctx.restore();
}

// A figure's shadow cast along the ground by a low sun: drawn by the caller
// inside the given transform.
export function castShadow(ctx, groundY, skew, squash, alpha, draw) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.translate(0, groundY);
  ctx.transform(1, 0, skew, -squash, 0, 0);
  ctx.translate(0, -groundY);
  draw(ctx);
  ctx.restore();
}
