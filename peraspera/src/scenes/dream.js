// XII. The dream — the engine he is building out of code, the farm he is
// building it for, and the same sky he started under.

import { W, H, TAU, clamp, lerp, smooth, ramp, win, keys, hash, noise1, fbm1, css, mix, easeInOut, easeOut } from '../kit.js';
import { vgrad, glow, box, circle, line, radial, vignette, layer, rrect, text, SANS, SERIF, motes, rays, hills, tree, grass, shootingStar } from '../paint.js';
import { figure, P, pose, blend, stride } from '../figure.js';
import { laptop, nozzleWall, fence, house } from '../props.js';
import { STARS, nightSky, nightLand, nearHill, lieAt, aimFromLying } from './kid.js';
import { ENGINE, massFlow } from '../data.js';

const HIM = { skin: '#9a7a6a', hair: '#1e1814', top: '#34405a', bottom: '#262c3c', shoes: '#1a181a' };
const HER = { skin: '#9a7a6a', hair: '#3a2618', top: '#8a5a6a', bottom: '#8a5a6a', shoes: '#2a2228' };

// ─── the model ───────────────────────────────────────────────────────────

const CHAT = [
  [2, 'me', 'add a regen cooling jacket to the chamber'],
  [5, 'ai', 'code'],
  [12, 'me', 'why is heat flux highest at the throat?'],
  [15, 'ai', 'Bartz: flux scales with mass flux — it peaks where the flow is squeezed tightest. Check the coolant velocity there.'],
  [21, 'me', 'ok. sweep chamber pressure 10 → 30 bar'],
  [23.5, 'ai', 'code'],
];

function codeBars(ctx, x, y, w, rows, seed, t) {
  const cols = ['#c792ea', '#82aaff', '#c3e88d', '#f78c6c', '#89ddff', '#a6accd'];
  for (let r = 0; r < rows; r++) {
    let cx = x + (hash(r, seed) > 0.6 ? 24 : 0) + (hash(r, seed + 1) > 0.8 ? 24 : 0);
    const n = 2 + Math.floor(hash(r, seed + 2) * 4);
    for (let k = 0; k < n; k++) {
      const bw = 20 + hash(r * 7 + k, seed + 3) * 90;
      if (cx + bw > x + w) break;
      box(ctx, cx, y + r * 20, bw, 9, cols[(r + k + seed) % cols.length], 0.85, 3);
      cx += bw + 10;
    }
  }
}

function modelPanel(ctx, t, x0, y0, w, h, a) {
  if (a <= 0) return;
  ctx.save();
  ctx.globalAlpha = a;
  box(ctx, x0 - 16, y0 - 16, w + 32, h + 32, '#16181e', 1, 18);
  box(ctx, x0, y0, w, h, '#0f1117', 1, 8);
  const split = x0 + w * 0.42;
  line(ctx, split, y0, split, y0 + h, '#23262f', 2);
  // ── chat and code, scrolling ──
  ctx.save();
  ctx.beginPath(); ctx.rect(x0, y0, split - x0, h); ctx.clip();
  let y = y0 + 30;
  const scroll = Math.max(0, (t - 16) * 18);
  y -= scroll;
  for (const [at, who, msg] of CHAT) {
    if (t < at) break;
    const k = ramp(t, at, at + 0.4);
    if (msg === 'code') {
      const rows = Math.floor(clamp((t - at) / 2.5) * 11) + 1;
      box(ctx, x0 + 20, y, split - x0 - 40, rows * 20 + 20, '#171a22', k, 8);
      codeBars(ctx, x0 + 36, y + 14, split - x0 - 80, rows, Math.floor(at * 3), t);
      y += rows * 20 + 40;
    } else if (who === 'me') {
      ctx.font = `400 19px ${SANS}`;
      const tw = Math.min(ctx.measureText(msg).width, split - x0 - 120);
      box(ctx, split - tw - 60, y, tw + 36, 40, '#2e4a7a', k, 12);
      text(ctx, msg, split - 42, y + 27, { face: SANS, size: 19, color: '#e8eef8', align: 'right', alpha: k });
      y += 60;
    } else {
      // wrap the assistant's words
      ctx.font = `400 19px ${SANS}`;
      const words = msg.split(' '), lines = []; let cur = '';
      for (const wd of words) { const tl = cur ? cur + ' ' + wd : wd; if (ctx.measureText(tl).width > split - x0 - 90) { lines.push(cur); cur = wd; } else cur = tl; }
      lines.push(cur);
      const shown = Math.floor(clamp((t - at) / 2) * lines.length + 0.99);
      for (let i = 0; i < shown; i++) text(ctx, lines[i], x0 + 32, y + 22 + i * 26, { face: SANS, size: 19, color: '#c8cede', align: 'left', alpha: k });
      y += lines.length * 26 + 30;
    }
  }
  ctx.restore();
  // ── the engine ──
  const ex = split + 60, ey = y0 + 190, esc = (x0 + w - ex - 60);
  text(ctx, 'ENGINE MODEL v0.9', split + 40, y0 + 44, { face: SANS, size: 18, spacing: 4, color: '#7a88a8', align: 'left' });
  const wall = nozzleWall(1, 0.3, 0.11, 0.33, 0.38);
  const hot = (u) => (u < 0.38 ? mix('#fff2c8', '#ff9a3a', u / 0.38) : mix('#ff9a3a', '#3a5ad8', (u - 0.38) / 0.62));
  for (let i = 0; i < wall.length - 1; i++) {
    const [u0, r0] = wall[i], [u1, r1] = wall[i + 1];
    ctx.fillStyle = css(hot(u0), 0.85);
    ctx.beginPath();
    ctx.moveTo(ex + u0 * esc, ey - r0 * esc * 0.62); ctx.lineTo(ex + u1 * esc, ey - r1 * esc * 0.62);
    ctx.lineTo(ex + u1 * esc, ey + r1 * esc * 0.62); ctx.lineTo(ex + u0 * esc, ey + r0 * esc * 0.62); ctx.fill();
  }
  for (const sgn of [-1, 1]) {
    ctx.strokeStyle = '#d8e0f0'; ctx.lineWidth = 3;
    ctx.beginPath();
    wall.forEach(([u, r], i) => (i ? ctx.lineTo(ex + u * esc, ey + sgn * r * esc * 0.62) : ctx.moveTo(ex + u * esc, ey + sgn * r * esc * 0.62)));
    ctx.stroke();
  }
  // streaks through the flow
  for (let i = 0; i < 26; i++) {
    const lane = (hash(i, 9) - 0.5) * 1.6;
    const ph = (t * 0.35 + hash(i, 10)) % 1;
    const u = ph < 0.4 ? ph * 0.95 : 0.38 + (ph - 0.4) ** 0.7 * 1.04;
    if (u > 1) continue;
    let r = 0.3; for (const [wu, wr] of wall) if (wu <= u) r = wr;
    const px = ex + u * esc, py = ey + lane * r * esc * 0.62 * 0.5;
    line(ctx, px - 6 - u * 24, py, px, py, '#ffffff', 2, 0.6);
  }
  // wall heat flux along the engine, peaking at the throat
  const py0 = y0 + 425, ph = 90;
  line(ctx, ex, py0, ex + esc, py0, '#2a2f3c', 2);
  text(ctx, 'wall heat flux', ex, py0 - ph - 12, { face: SANS, size: 16, color: '#7a88a8', align: 'left' });
  ctx.strokeStyle = '#ff7a4a'; ctx.lineWidth = 3;
  ctx.beginPath();
  const drawn = clamp((t - 6) / 4);
  for (let i = 0; i <= 80 * drawn; i++) {
    const u = i / 80;
    const q = Math.exp(-(((u - 0.39) / 0.07) ** 2)) * 0.9 + (u < 0.39 ? 0.25 : 0.1 * (1 - u));
    const px = ex + u * esc, pyy = py0 - q * ph;
    i ? ctx.lineTo(px, pyy) : ctx.moveTo(px, pyy);
  }
  ctx.stroke();
  // readouts
  const R = [
    ['p c', `${ENGINE.pc_bar.toFixed(1)} bar`], ['O/F', ENGINE.of.toFixed(1)], ['ε', ENGINE.eps.toFixed(1)],
    ['I sp (SL)', `${ENGINE.isp_sl} s`], ['thrust', `${ENGINE.thrust_kN.toFixed(2)} kN`], ['ṁ', `${massFlow().toFixed(2)} kg/s`],
  ];
  R.forEach(([k2, v], i) => {
    const rx = split + 40 + (i % 3) * 190, ry = y0 + 470 + Math.floor(i / 3) * 50;
    const a2 = ramp(t, 3 + i * 0.4, 3.6 + i * 0.4);
    text(ctx, k2, rx, ry, { face: SANS, size: 16, color: '#7a88a8', align: 'left', alpha: a2 });
    text(ctx, v, rx, ry + 26, { face: SANS, size: 24, color: '#e8eef8', align: 'left', alpha: a2 });
  });
  ctx.restore();
}

export function code(ctx, t) {
  const FY = 930;
  const panel = win(t, 1, 27.5, 1.5, 1.8);
  vgrad(ctx, [[0, '#0d0f16'], [1, '#161822']], 0, FY);
  box(ctx, -20, FY, W + 40, H, '#0a0b10');
  // a window, a lamp, a clock
  ctx.save(); ctx.beginPath(); ctx.rect(1500, 170, 300, 340); ctx.clip();
  vgrad(ctx, [[0, '#050818'], [1, '#141a38']], 170, 510, 1500, 300, 170, 510);
  STARS.draw(ctx, t, { dx: 400, dy: -600, big: 0.6 });
  ctx.restore();
  ctx.strokeStyle = '#1c2034'; ctx.lineWidth = 12; ctx.strokeRect(1494, 164, 312, 352);
  // desk, laptop, lamp
  box(ctx, 640, 720, 760, 18, '#34282a');
  box(ctx, 660, 738, 16, FY - 738, '#241c1e'); box(ctx, 1370, 738, 16, FY - 738, '#241c1e');
  line(ctx, 1320, 720, 1300, 560, '#141214', 7); line(ctx, 1300, 560, 1230, 520, '#141214', 7);
  ctx.fillStyle = '#141214'; ctx.beginPath(); ctx.moveTo(1210, 500); ctx.lineTo(1260, 530); ctx.lineTo(1232, 568); ctx.lineTo(1186, 542); ctx.fill();
  glow(ctx, 1150, 720, 600, '#ffbf70', 0.33);
  laptop(ctx, 1000, 720, { s: 1.7, face: 1, glowC: '#b8ccff', glowA: 0.8 });
  box(ctx, 1260, 690, 40, 30, '#7a3a2e', 1, 5);

  // him at the laptop; later leaning back into her
  const S = 2.5;
  const back = ramp(t, 29.5, 31.5, easeInOut);
  const typing = (1 - back) * (t < 27 ? 1 : 1 - ramp(t, 27, 28));
  const tap = Math.sin(t * 17) * 0.05 * typing;
  const pz = pose({ ...P.sit(t, 6), lean: lerp(0.28, -0.05, back), neck: lerp(0.2, -0.35, back), s1: 0.95 + tap, e1: lerp(0.95, 1.1, back), s2: lerp(0.9, 1.7, back) - tap, e2: lerp(1.0, 2.0, back) });
  box(ctx, 420, 820, 190, 16, '#1c1618'); box(ctx, 430, 836, 14, FY - 836, '#141012'); box(ctx, 590, 836, 14, FY - 836, '#141012');
  box(ctx, 410, 500, 20, 336, '#1c1618', 1, 4);
  figure(ctx, 'man', pz, { x: 540, ground: FY, s: S, colors: HIM });
  glow(ctx, 800, 560, 360, '#a8c0ff', 0.14 * (1 - back * 0.5));

  // her, coming in from the dark behind him — a hand on his shoulder, a hand on the baby
  if (t > 27) {
    const walkU = ramp(t, 27.2, 30.2, (k) => k);
    const x = lerp(-120, 420, smooth(walkU));
    let pw = walkU < 1 ? blend(P.walk(stride(x + 120, S * 0.94), 0.7), P.stand(t, 3), ramp(t, 29.8, 30.2)) : P.stand(t, 3);
    const touch = ramp(t, 30.2, 31.4);
    pw.s1 = lerp(pw.s1, 1.15, touch); pw.e1 = lerp(pw.e1, 0.2, touch);
    pw.s2 = lerp(pw.s2, 0.55, touch); pw.e2 = lerp(pw.e2, 1.7, touch);
    pw.neck = lerp(pw.neck, 0.3, touch);
    figure(ctx, 'woman', pw, { x, ground: FY, s: S * 0.94, face: 1, colors: HER, belly: 1 });
    glow(ctx, 470, 560, 420, '#ffc88a', 0.18 * touch);
  }
  modelPanel(ctx, t, 820, 90, 1020, 560, panel);
  vignette(ctx, 0.6);
}

// ─── the farm ────────────────────────────────────────────────────────────

export function barn(ctx, x, y) {
  const c = '#a8423a', trim = '#f2ece2';
  ctx.fillStyle = c;
  ctx.beginPath();
  ctx.moveTo(x - 170, y); ctx.lineTo(x - 170, y - 190); ctx.lineTo(x - 120, y - 280); ctx.lineTo(x, y - 330);
  ctx.lineTo(x + 120, y - 280); ctx.lineTo(x + 170, y - 190); ctx.lineTo(x + 170, y); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#6a2a26';
  ctx.beginPath(); ctx.moveTo(x - 186, y - 186); ctx.lineTo(x - 128, y - 290); ctx.lineTo(x, y - 344); ctx.lineTo(x + 128, y - 290); ctx.lineTo(x + 186, y - 186); ctx.lineTo(x + 170, y - 186); ctx.lineTo(x + 116, y - 280); ctx.lineTo(x, y - 328); ctx.lineTo(x - 116, y - 280); ctx.lineTo(x - 170, y - 186); ctx.fill();
  box(ctx, x - 70, y - 170, 140, 170, '#8a3430');
  ctx.strokeStyle = trim; ctx.lineWidth = 6;
  ctx.strokeRect(x - 70, y - 170, 140, 170);
  ctx.beginPath(); ctx.moveTo(x - 70, y - 170); ctx.lineTo(x + 70, y); ctx.moveTo(x + 70, y - 170); ctx.lineTo(x - 70, y); ctx.stroke();
  box(ctx, x - 26, y - 262, 52, 44, '#3a1a18');
  ctx.strokeRect(x - 26, y - 262, 52, 44);
  // silo
  box(ctx, x + 190, y - 360, 90, 360, '#c9c2b4');
  ctx.fillStyle = '#8a8478'; ctx.beginPath(); ctx.arc(x + 235, y - 360, 45, Math.PI, TAU); ctx.fill();
}

export function chapel(ctx, x, y, s) {
  box(ctx, x - 40 * s, y - 60 * s, 80 * s, 60 * s, '#f6f0e6');
  ctx.fillStyle = '#b8b0a4';
  ctx.beginPath(); ctx.moveTo(x - 46 * s, y - 60 * s); ctx.lineTo(x, y - 92 * s); ctx.lineTo(x + 46 * s, y - 60 * s); ctx.fill();
  box(ctx, x + 18 * s, y - 120 * s, 18 * s, 60 * s, '#f6f0e6');
  ctx.fillStyle = '#f6f0e6'; ctx.beginPath(); ctx.moveTo(x + 16 * s, y - 120 * s); ctx.lineTo(x + 27 * s, y - 160 * s); ctx.lineTo(x + 38 * s, y - 120 * s); ctx.fill();
  box(ctx, x - 8 * s, y - 30 * s, 16 * s, 30 * s, '#8a6a4a');
}

export function farm(ctx, t) {
  const pan = ramp(t, 0, 40, (k) => k);
  const camX = lerp(0, 380, easeInOut(pan));
  const GY = 900;
  // a warm sky with the sun behind cloud
  vgrad(ctx, [[0, '#7aa0d0'], [0.5, '#f0c890'], [1, '#ffe6b0']], -100, 760);
  const sunX = 1500 - camX * 0.2, sunY = 260;
  glow(ctx, sunX, sunY, 900, '#fff0c8', 0.55);
  for (let i = 0; i < 8; i++) {
    const cx = ((hash(i, 3) * 2600 + t * 10 - camX * 0.3) % 2600) - 340, cy = 120 + hash(i, 4) * 180;
    for (let k = 0; k < 6; k++) radial(ctx, cx + k * 60, cy + Math.sin(k * 1.3) * 18, 90 + hash(k + i, 5) * 50, [[0, '#fff8ec', 0.6], [1, '#fff8ec', 0]]);
  }
  rays(ctx, t, sunX, sunY, { angle: Math.PI / 2 + 0.25, spread: 1.4, n: 11, len: 1400, color: '#fff2c0', a: 0.12, width: 0.035 });
  // far hills with a little white chapel on one
  const far = (x) => 640 - 110 * (0.5 + 0.5 * fbm1((x + camX * 0.25) * 0.0016, 131, 5));
  hills(ctx, far, '#8fa8b0');
  chapel(ctx, 420 - camX * 0.25, far(420 - camX * 0.25) + 6, 0.9);
  glow(ctx, 420 - camX * 0.25 + 20, far(420 - camX * 0.25) - 100, 120, '#fff8e0', 0.35);
  const mid = (x) => 740 - 90 * (0.5 + 0.5 * fbm1((x + camX * 0.55) * 0.0019, 132, 4));
  hills(ctx, mid, '#7fa05a');
  ctx.save();
  ctx.translate(-camX, 0);
  // fields in rows
  box(ctx, camX - 100, 740, W + 300, GY - 740 + 20, '#8fb060');
  for (let r = 0; r < 7; r++) line(ctx, camX - 100, 760 + r * 20, camX + W + 300, 760 + r * 20 + 10, '#7a9a50', 3, 0.6);
  // house and barn, the oak and its swing
  house(ctx, 640, GY, { w: 560, h: 280, roof: 150, wall: '#f4ede0', roofC: '#5a5048', door: '#3a5a4a', lit: 0.6, garage: false, chimney: true, porch: 0.4 });
  box(ctx, 360, GY - 20, 560, 20, '#d8cdb8');
  barn(ctx, 1320, GY);
  tree(ctx, 1860, GY + 10, 620, '#4a6a34', 41, Math.sin(t * 0.7) * 0.01);
  const sw = Math.sin(t * 1.6) * 0.35;
  ctx.save(); ctx.translate(1800, GY - 380); ctx.rotate(sw);
  line(ctx, -26, 0, -26, 300, '#5a4a3a', 2.5); line(ctx, 26, 0, 26, 300, '#5a4a3a', 2.5);
  box(ctx, -36, 298, 72, 10, '#6a5040');
  figure(ctx, 'girl', pose({ lean: -0.1, neck: -0.1, h1: 1.5, k1: 1.2 + sw, h2: 1.4, k2: 1.1 + sw, s1: 2.9, e1: 0.2, s2: 2.85, e2: 0.2 }), { x: 0, y: 292, s: 1.3, colors: { skin: '#c8a08a', hair: '#6a4a2a', top: '#e8b84a', bottom: '#e8b84a', shoes: '#5a3a2a' } });
  ctx.restore();
  fence(ctx, camX - 100, 1100, GY + 40, { h: 60, gap: 90, color: '#8a6a4a', rails: 2, w: 6 });
  // cows in the far pasture
  for (const [cx, cf] of [[1040, 1], [1110, -1]]) {
    ctx.save(); ctx.translate(cx, 772); ctx.scale(cf, 1);
    box(ctx, -26, -22, 52, 22, '#f4f0ea', 1, 8); box(ctx, 12, -18, 10, 10, '#3a3430');
    circle(ctx, 30, -14, 8, '#f4f0ea'); box(ctx, -22, -2, 5, 12, '#f4f0ea'); box(ctx, 16, -2, 5, 12, '#f4f0ea');
    ctx.restore();
  }
  // the family
  // her on the porch with the baby
  figure(ctx, 'woman', pose({ ...P.stand(t, 3), s1: 1.2, e1: 1.6, s2: 1.1, e2: 1.7, neck: 0.25 }), { x: 520, ground: GY - 20, s: 1.6, colors: { skin: '#c8a08a', hair: '#5a3a24', top: '#c87a7a', bottom: '#c87a7a', shoes: '#4a3a30' }, dress: '#c87a7a', flare: 22 });
  box(ctx, 540, GY - 190, 30, 20, '#f6f0e6', 1, 10);
  // him walking the rows, the smallest one on his shoulders
  const S = 1.75;
  const walkD = t * 60;
  const px = 900 + walkD;
  const pz = P.walk(stride(walkD, S), 0.8);
  pz.s1 = 2.7; pz.e1 = 0.5; pz.s2 = 2.6; pz.e2 = 0.6;
  const J = figure(ctx, 'man', pz, { x: px, ground: GY + 60, s: S, colors: { skin: '#c8a08a', hair: '#3a2a1a', top: '#5a7a9a', bottom: '#4a4a5a', shoes: '#3a3028' } });
  figure(ctx, 'toddler', pose({ lean: 0, neck: 0.1, h1: 1.5, k1: 1.9, h2: 1.4, k2: 1.8, s1: 2.6, e1: 0.4, s2: 2.5, e2: 0.4 }), { x: J.head[0] - 4, y: J.head[1] - J.headR * 0.9, s: 1.5, face: 1, colors: { skin: '#c8a08a', hair: '#8a6a3a', top: '#7ab0d0', bottom: '#7ab0d0', shoes: '#5a4a3a' } });
  // two more, running ahead
  for (let k = 0; k < 2; k++) {
    const d = t * 130 + k * 160;
    const kx = 1150 + d * 0.8 + Math.sin(t * 1.5 + k) * 40;
    const kp = P.walk(stride(d, 1.4, 'kid') * 1.2, 1.3);
    kp.lean = 0.25; kp.s1 *= 1.6; kp.s2 *= 1.6;
    figure(ctx, k ? 'girl' : 'kid', kp, { x: kx, ground: GY + 80 + k * 14, s: 1.4, colors: { skin: '#c8a08a', hair: k ? '#6a4a2a' : '#3a2a1a', top: k ? '#d8707a' : '#5aa06a', bottom: '#4a5a7a', shoes: '#3a2a20' } });
  }
  grass(ctx, t, () => GY + 100, { x0: camX - 100, x1: camX + W + 100, density: 0.35, h: 30, color: '#6a8a40', seed: 7, wind: 1 });
  ctx.restore();
  // chickens pecking near the house (screen space is fine for dots)
  motes(ctx, t, { n: 60, x0: 0, x1: W, y0: 200, y1: 1000, color: '#fff4c8', a: 0.6, size: 1.8, glowR: 5, seed: 71, rise: 5, drift: 18 });
  // the dream's edges: soft, bright
  const g = ctx.createRadialGradient(W / 2, H / 2, H * 0.42, W / 2, H / 2, H * 1.0);
  g.addColorStop(0, 'rgba(255,244,220,0)'); g.addColorStop(1, 'rgba(255,244,220,0.55)');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
}

// ─── look up ─────────────────────────────────────────────────────────────

export function lookup(ctx, t) {
  const tilt = keys(t, [[0, 0], [23, 0], [36, 700]], easeInOut);
  nightSky(ctx, t, tilt, { stars: 1 });
  // the satellite again
  const su = clamp((t - 24) / 26);
  const sx = lerp(300, 1600, su), sy = lerp(170, 80, su) - Math.sin(su * Math.PI) * 40 + tilt * 0.45;
  if (su > 0 && su < 1) { glow(ctx, sx, sy, 10, '#ffffff', Math.sin(su * Math.PI) * 0.8); circle(ctx, sx, sy, 1.9, '#ffffff', Math.sin(su * Math.PI)); }
  shootingStar(ctx, clamp((t - 44.5) / 1.2), 1200, 120 + tilt * 0.45, 1600, 320 + tilt * 0.45, 1);
  nightLand(ctx, t, tilt, { town: 0.6 });

  ctx.save();
  ctx.translate(0, tilt);
  // their house at the edge of the hill, a window and the back door lit
  const hx = 190, hy = nearHill(hx) + 20;
  box(ctx, hx - 170, hy - 230, 300, 250, '#05060c');
  ctx.fillStyle = '#05060c'; ctx.beginPath(); ctx.moveTo(hx - 190, hy - 226); ctx.lineTo(hx - 20, hy - 340); ctx.lineTo(hx + 150, hy - 226); ctx.fill();
  box(ctx, hx - 120, hy - 190, 70, 60, '#ffcf87', 0.85);
  glow(ctx, hx - 85, hy - 160, 160, '#ffb85a', 0.3);
  const door = win(t, 2.2, 4.4, 0.4, 0.6);
  box(ctx, hx + 40, hy - 160, 60, 140, door > 0 ? '#ffc27a' : '#0a0b12', door > 0 ? door : 1);
  if (door > 0) glow(ctx, hx + 70, hy - 90, 260, '#ffb060', 0.35 * door);

  // him: out the door, into the grass, down onto his back
  const S = 1.75;
  const walkU = ramp(t, 3.4, 11.5, (k) => k);
  const x = lerp(hx + 70, 860, smooth(walkU));
  const standLook = ramp(t, 11.5, 13);
  const down = ramp(t, 13.2, 17, easeInOut);
  let pz;
  // stand -> kneel -> sit back on the grass -> lie down
  const standP = pose({ ...P.stand(t, 2), neck: -0.55 });
  const kneelP = pose({ ...P.kneel(), neck: -0.2, lean: 0.05 });
  const sitP = pose({ rot: 0, lean: -0.25, neck: -0.4, h1: 1.35, k1: 0.6, h2: 1.3, k2: 0.9, s1: -0.7, e1: 0.1, s2: -0.8, e2: 0.1 });
  const lieP = P.lieBack(t);
  if (walkU < 1) pz = P.walk(stride(x - hx - 70, S));
  else if (down <= 0) pz = { ...P.stand(t, 2), neck: lerp(0.05, -0.55, standLook) };
  else if (down < 0.33) pz = blend(standP, kneelP, down / 0.33);
  else if (down < 0.66) pz = blend(kneelP, sitP, (down - 0.33) / 0.33);
  else pz = blend(sitP, lieP, (down - 0.66) / 0.34);
  // raise an arm at the sky at the same moment the boy beside him does
  const hip = lieAt(860, S, 'man');
  const point = win(t, 20.5, 33, 1.5, 2);
  const shoulder = [hip.x - 45 * S, hip.y - 4 * S];
  const aim = aimFromLying(shoulder[0], shoulder[1], 1300, 120);
  if (down >= 1 && point > 0) { pz.s1 = lerp(pz.s1, aim, point); pz.e1 = lerp(pz.e1, 0.1, point); }
  const standY = nearHill(x);
  const opts = { x, s: S, sil: '#030409' };
  if (down < 0.5) figure(ctx, 'man', pz, { ...opts, ground: standY + 4 });
  else {
    const k = (down - 0.5) / 0.5;
    const sitY = nearHill(x) - 12 * S;
    figure(ctx, 'man', pz, { ...opts, y: lerp(sitY, hip.y, smooth(k)), x: lerp(x, hip.x, smooth(k)) });
  }

  // the boy he was, right beside him
  const ghost = win(t, 16.5, 31, 3, 3);
  if (ghost > 0) {
    const ks = 2.4;
    const kh = lieAt(560, ks, 'kid');
    const kp = P.lieBack(t + 3);
    const kaim = aimFromLying(kh.x - 28 * ks, kh.y - 4 * ks, 1300, 120);
    if (point > 0) { kp.s1 = lerp(kp.s1, kaim, point); kp.e1 = lerp(kp.e1, 0.12, point); }
    layer(ctx, ghost * 0.42, (g) => {
      figure(g, 'kid', kp, { x: kh.x, y: kh.y, s: ks, sil: '#9ab4ff' });
    }, 'lighter');
    glow(ctx, kh.x - 40, kh.y - 20, 160, '#9ab4ff', 0.12 * ghost);
  }
  ctx.restore();
  vignette(ctx, 0.55);
}
