// X. Rockets — a lecture hall he was ahead of, the nights he taught himself
// propulsion, and a thrust stand in the back yard.

import { W, H, TAU, clamp, lerp, smooth, ramp, win, keys, hash, noise1, fbm1, css, mix, easeInOut, easeOut } from '../kit.js';
import { vgrad, glow, box, circle, line, radial, vignette, layer, rrect, text, SANS, SERIF, smoke, sparks, motes, hills, tree } from '../paint.js';
import { figure, P, pose, blend, stride } from '../figure.js';
import { laptop, nozzleWall, fence } from '../props.js';
import { STARS } from './kid.js';
import { C6, C6_BURN, thrustC6 } from '../data.js';

const HIM = { skin: '#b08a76', hair: '#2a2018', top: '#3c4a5e', bottom: '#2e3444', shoes: '#1e1c1e' };

// ─── the lecture hall ────────────────────────────────────────────────────

// A pencil drawing revealed stroke by stroke. Each stroke is a polyline.
function sketch(ctx, strokes, k, color = '#3a3a44', width = 3) {
  let total = 0;
  const lens = strokes.map((s) => { let L = 0; for (let i = 1; i < s.length; i++) L += Math.hypot(s[i][0] - s[i - 1][0], s[i][1] - s[i - 1][1]); total += L; return L; });
  let left = total * clamp(k);
  ctx.save();
  ctx.strokeStyle = css(color); ctx.lineWidth = width; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  let tip = null;
  strokes.forEach((s, j) => {
    if (left <= 0) return;
    ctx.beginPath(); ctx.moveTo(s[0][0], s[0][1]);
    for (let i = 1; i < s.length; i++) {
      const d = Math.hypot(s[i][0] - s[i - 1][0], s[i][1] - s[i - 1][1]);
      if (left < d) {
        const f = left / d;
        const px = lerp(s[i - 1][0], s[i][0], f), py = lerp(s[i - 1][1], s[i][1], f);
        ctx.lineTo(px, py); tip = [px, py]; left = 0; break;
      }
      ctx.lineTo(s[i][0], s[i][1]); left -= d; tip = s[i];
    }
    ctx.stroke();
  });
  ctx.restore();
  return tip;
}

function engineSketch(x, y, sc) {
  // chamber and bell nozzle, both walls, plus injector, plume lines and notes
  const wall = nozzleWall(1, 0.32, 0.12, 0.34, 0.38);
  const up = wall.map(([u, r]) => [x + u * sc, y - r * sc]);
  const dn = wall.map(([u, r]) => [x + u * sc, y + r * sc]);
  return [
    up, dn,
    [[x, y - 0.32 * sc], [x, y + 0.32 * sc]],
    [[x - 30, y - 0.2 * sc], [x, y - 0.2 * sc]], [[x - 30, y + 0.2 * sc], [x, y + 0.2 * sc]],
    [[x + sc * 1.05, y - 0.3 * sc], [x + sc * 1.5, y - 0.45 * sc]],
    [[x + sc * 1.05, y], [x + sc * 1.55, y]],
    [[x + sc * 1.05, y + 0.3 * sc], [x + sc * 1.5, y + 0.45 * sc]],
    [[x + sc * 0.38, y + 0.2 * sc], [x + sc * 0.38, y + 0.5 * sc]],
  ];
}

export function school(ctx, t) {
  const zoomIn = ramp(t, 9, 11.5, easeInOut);
  if (zoomIn < 1) {
    // the hall, side on: tiers climbing to the right
    vgrad(ctx, [[0, '#2c2a30'], [1, '#3a363a']], 0, H);
    box(ctx, 60, 200, 620, 360, '#27402f');
    box(ctx, 50, 190, 640, 12, '#6a5a48'); box(ctx, 50, 558, 640, 14, '#6a5a48');
    text(ctx, 'F = ma', 130, 290, { face: SERIF, size: 58, italic: true, color: '#e8e8e0', align: 'left', alpha: 0.85 });
    text(ctx, 'ΣF = 0', 130, 380, { face: SERIF, size: 50, italic: true, color: '#e8e8e0', align: 'left', alpha: 0.75 });
    ctx.save(); ctx.strokeStyle = 'rgba(232,232,224,0.7)'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(420, 480); ctx.lineTo(640, 480); ctx.lineTo(420, 380); ctx.closePath(); ctx.stroke();
    ctx.strokeRect(470, 400, 50, 40);
    ctx.beginPath(); ctx.moveTo(495, 420); ctx.lineTo(495, 490); ctx.stroke();
    ctx.restore();
    // professor, writing
    const writeA = Math.max(win(t, 1.6, 3, 0.3, 0.3), win(t, 5.6, 7, 0.3, 0.3), win(t, 9.6, 11, 0.3, 0.3));
    figure(ctx, 'man', pose({ ...P.stand(t, 4), s1: lerp(0.2, 2.2, writeA) + Math.sin(t * 12) * 0.05 * writeA, e1: lerp(0.2, 0.6, writeA), neck: 0.05 }), { x: 520, ground: 880, s: 2.0, face: -1, colors: { skin: '#9a8070', hair: '#aaa6a0', top: '#5a4e44', bottom: '#3a3530', shoes: '#1c1a18' } });
    // tiers of desks
    const rows = [[860, 880], [1100, 800], [1340, 720], [1580, 640], [1820, 560]];
    rows.forEach(([rx, ry], i) => {
      box(ctx, rx - 160, ry, 400, H - ry, '#221f24');
      box(ctx, rx - 150, ry - 150, 20, 150, '#1a181c');
      box(ctx, rx + 40, ry - 110, 170, 12, '#4a3f38');
      box(ctx, rx + 120, ry - 98, 10, 98, '#1a181c');
    });
    // students; him in the front row, upright and writing
    rows.forEach(([rx, ry], i) => {
      const me = i === 0;
      const slump = me ? 0 : 0.35 + hash(i, 3) * 0.3;
      const sp = pose({ ...P.sit(t, i), lean: me ? 0.25 : 0.45 + slump * 0.3, neck: me ? 0.35 : 0.6, s1: me ? 0.95 + Math.sin(t * 8) * 0.04 : 0.9, e1: me ? 0.7 : 1.2, s2: 0.8, e2: 0.9 });
      const J = figure(ctx, i % 2 ? 'woman' : 'man', sp, { x: rx - 70, ground: ry, s: 1.9, colors: me ? HIM : { skin: '#7a6a62', hair: '#1c1a1c', top: ['#4a3a3a', '#3a4a3e', '#44405a', '#5a4a3a'][i % 4], bottom: '#2a2830', shoes: '#141414' } });
      if (!me && hash(i, 7) > 0.3) {
        box(ctx, J.hand1[0] - 6, J.hand1[1] - 16, 12, 20, '#cfe0ff', 0.9);
        glow(ctx, J.hand1[0], J.hand1[1] - 6, 60, '#bcd4ff', 0.3);
      }
      if (me) box(ctx, J.hand1[0] - 30, J.hand1[1] + 4, 70, 6, '#f0ece0');
    });
    vignette(ctx, 0.6);
  }
  if (zoomIn > 0) {
    layer(ctx, zoomIn, (g) => {
      // his notebook: a nozzle, pencilled in while the lecture drones on
      box(g, -20, -20, W + 40, H + 40, '#e9e3d4');
      for (let y = 120; y < H; y += 44) line(g, 0, y, W, y, '#9ab0c8', 1.5, 0.6);
      line(g, 220, 0, 220, H, '#d88a8a', 2, 0.6);
      text(g, 'F = ma (again)', 260, 150, { face: SERIF, size: 40, italic: true, color: '#6a6a78', align: 'left', alpha: 0.7 });
      const k = ramp(t, 10.5, 22, (x) => x);
      const tip = sketch(g, engineSketch(620, 560, 560), k, '#33333d', 4);
      const notes = [[13.5, 'throat', 780, 790], [15.5, 'ε = Aₑ / Aₜ', 1250, 300], [17.5, 'Pc = ?', 380, 400], [19, 'Iₛₚ ↑', 1480, 760]];
      for (const [at, str, x, y] of notes) text(g, str, x, y, { face: SERIF, size: 46, italic: true, color: '#33333d', align: 'left', alpha: ramp(t, at, at + 0.6) });
      if (tip) {
        // the pencil
        g.save(); g.translate(tip[0], tip[1]); g.rotate(-0.7);
        box(g, -5, -150, 12, 150, '#e0b040');
        g.fillStyle = '#f0d0a0'; g.beginPath(); g.moveTo(-5, 0); g.lineTo(7, 0); g.lineTo(1, 18); g.fill();
        g.restore();
      }
      vignette(g, 0.35);
    });
  }
}

// ─── the nights of study ─────────────────────────────────────────────────

const EQUATIONS = [
  ['F = ṁ vₑ + (pₑ − pₐ) Aₑ', 300, 300],
  ['Iₛₚ = F / (ṁ g₀)', 1180, 210],
  ['c* = pc Aₜ / ṁ', 1360, 420],
  ['Δv = Iₛₚ g₀ ln(m₀ / mf)', 520, 180],
  ['Aₑ / Aₜ = ε', 820, 360],
];

export function study(ctx, t) {
  const FY = 720;
  vgrad(ctx, [[0, '#0c0e18'], [1, '#141622']], 0, H);
  // a window full of night
  ctx.save();
  ctx.beginPath(); ctx.rect(120, 120, 300, 360); ctx.clip();
  vgrad(ctx, [[0, '#050818'], [1, '#141a38']], 120, 480, 120, 300, 120, 480);
  STARS.draw(ctx, t, { dx: 0, dy: -700, big: 0.5 });
  ctx.restore();
  ctx.strokeStyle = css('#1c2034'); ctx.lineWidth = 12; ctx.strokeRect(114, 114, 312, 372);
  // wall clock racing through the night
  const hrs = 11.6 + ramp(t, 0, 26, (k) => k) * 3.3;
  circle(ctx, 1700, 200, 60, '#d8d4c8', 0.8);
  circle(ctx, 1700, 200, 54, '#1c1e28');
  circle(ctx, 1700, 200, 50, '#d8d4c8', 0.85);
  const ha = (hrs % 12) / 12 * TAU - Math.PI / 2, ma = (hrs % 1) * TAU - Math.PI / 2;
  line(ctx, 1700, 200, 1700 + Math.cos(ha) * 26, 200 + Math.sin(ha) * 26, '#1c1e28', 5);
  line(ctx, 1700, 200, 1700 + Math.cos(ma) * 40, 200 + Math.sin(ma) * 40, '#1c1e28', 3);

  // the desk, the lamp, the book
  box(ctx, 840, FY, 920, 20, '#3a2e28');
  box(ctx, 900, FY + 20, 18, H - FY, '#2a221e'); box(ctx, 1700, FY + 20, 18, H - FY, '#2a221e');
  box(ctx, -20, 935, W + 40, H, '#0a0b12');
  line(ctx, 1560, FY, 1540, 560, '#1a1618', 7); line(ctx, 1540, 560, 1470, 520, '#1a1618', 7);
  ctx.fillStyle = '#1a1618'; ctx.beginPath(); ctx.moveTo(1450, 500); ctx.lineTo(1500, 530); ctx.lineTo(1470, 568); ctx.lineTo(1426, 542); ctx.fill();
  glow(ctx, 1300, FY, 700, '#ffc27a', 0.4);
  glow(ctx, 1460, 545, 50, '#fff0d0', 0.7);
  // the open book, a page turning now and then
  box(ctx, 1020, FY - 10, 360, 12, '#e8e0cc');
  box(ctx, 1020, FY - 14, 176, 6, '#f2ecdc'); box(ctx, 1204, FY - 14, 176, 6, '#f2ecdc');
  // coffee
  box(ctx, 1600, FY - 50, 44, 50, '#8a3a2e', 1, 6);
  smoke(ctx, t, { x: 1622, y: FY - 54, rate: 2, life: 4, rise: 30, spread: 10, size: 6, grow: 20, color: '#c8c0b8', a: 0.18, seed: 5, wind: 3 });
  // him, reading, chin on his hand; writing between pages
  const writing = win(t, 5, 9, 0.5, 0.5) + win(t, 17, 22, 0.5, 0.5);
  const sp = pose({ ...P.sit(t, 2), lean: 0.42, neck: 0.3, s1: lerp(0.85, 1.0, writing) + Math.sin(t * 9) * 0.04 * writing, e1: lerp(2.4, 0.8, writing), s2: 0.9, e2: 0.9 });
  box(ctx, 600, 800, 200, 16, '#241c22'); box(ctx, 608, 816, 14, H - 816, '#1c161a'); box(ctx, 778, 816, 14, H - 816, '#1c161a');
  box(ctx, 588, 470, 20, 346, '#241c22', 1, 4);
  figure(ctx, 'man', sp, { x: 720, ground: 935, s: 2.8, colors: { ...HIM, skin: '#a07e6a' } });
  glow(ctx, 980, 560, 260, '#ffc27a', 0.12);

  // the nozzle hovering over the desk, with flow through it
  const nx = 900, ny = 470, sc = 520;
  const wall = nozzleWall(1, 0.3, 0.11, 0.33, 0.38);
  const show = ramp(t, 1, 4) * (1 - ramp(t, 24, 26));
  ctx.save();
  ctx.globalAlpha = 0.85 * show;
  ctx.globalCompositeOperation = 'lighter';
  for (const sgn of [-1, 1]) {
    ctx.strokeStyle = 'rgba(150,200,255,0.8)'; ctx.lineWidth = 2.5;
    ctx.beginPath();
    wall.forEach(([u, r], i) => (i ? ctx.lineTo(nx + u * sc, ny + sgn * r * sc) : ctx.moveTo(nx + u * sc, ny + sgn * r * sc)));
    ctx.stroke();
  }
  // flow: particles speeding up through the throat
  for (let i = 0; i < 90; i++) {
    const lane = (hash(i, 3) - 0.5) * 1.8;
    const ph = (t * 0.22 + hash(i, 4)) % 1;
    const u = ph < 0.4 ? ph * 0.95 : 0.38 + (ph - 0.4) ** 0.7 * 1.04;
    if (u > 1.25) continue;
    let r = 0.3;
    for (const [wu, wr] of wall) if (wu <= Math.min(u, 1)) r = wr;
    if (u > 1) r = 0.33 + (u - 1) * 0.3;
    const px = nx + u * sc, py = ny + lane * r * sc * 0.5;
    const heat = clamp(1 - u);
    ctx.fillStyle = css(mix('#6ab0ff', '#ffb050', heat), 0.8);
    ctx.beginPath(); ctx.arc(px, py, 2.4, 0, TAU); ctx.fill();
  }
  ctx.restore();
  // equations drifting up and fading
  EQUATIONS.forEach(([str, x, y], i) => {
    const at = 1 + i * 4.2;
    const a = win(t, at, at + 9, 1.5, 2);
    if (a <= 0) return;
    const dy = (t - at) * -8;
    text(ctx, str, x, y + dy, { face: SERIF, size: 44, italic: true, color: '#cfe0ff', alpha: a * 0.85, shadow: 18 });
  });
  vignette(ctx, 0.6);
}

// ─── the thrust stand ────────────────────────────────────────────────────

const GY = 900;
const IGN = 16;
const STAND = { x: 1180, base: GY - 6 };

function standRig(ctx, flash) {
  const { x, base } = STAND;
  box(ctx, x - 150, base, 300, 16, '#5a4632');                     // plank
  box(ctx, x - 90, base - 300, 14, 300, '#50555c');                // uprights
  box(ctx, x + 76, base - 300, 14, 300, '#50555c');
  box(ctx, x - 100, base - 306, 200, 12, '#50555c');
  box(ctx, x - 90, base - 150, 180, 10, '#50555c');
  box(ctx, x - 28, base - 38, 56, 30, '#2a6aa8', 1, 3);            // load cell
  line(ctx, x + 28, base - 24, x + 150, base - 4, '#101010', 3);
  // the motor, nozzle up, bearing down on the load cell
  box(ctx, x - 14, base - 148, 28, 110, '#e0d6c0', 1, 3);
  box(ctx, x - 14, base - 128, 28, 40, '#3a6ab8');
  box(ctx, x - 9, base - 156, 18, 10, '#6a6a6a');
  box(ctx, x - 30, base - 110, 60, 8, '#50555c');                  // retaining ring
}

function plotPanel(ctx, t, x0, y0, w, h, a) {
  if (a <= 0) return;
  ctx.save();
  ctx.globalAlpha = a;
  box(ctx, x0 - 14, y0 - 14, w + 28, h + 28, '#1c1e24', 1, 14);
  box(ctx, x0, y0, w, h, '#0e1118', 1, 6);
  text(ctx, 'THRUST  (N)', x0 + 24, y0 + 40, { face: SANS, size: 20, spacing: 3, color: '#8aa0c0', align: 'left' });
  text(ctx, 'Estes C6 · load cell 1 kHz', x0 + w - 24, y0 + 40, { face: SANS, size: 18, color: '#5a6a80', align: 'right' });
  const px0 = x0 + 60, py0 = y0 + h - 40, pw = w - 90, ph = h - 110;
  line(ctx, px0, py0, px0 + pw, py0, '#3a4458', 2);
  line(ctx, px0, py0, px0, py0 - ph, '#3a4458', 2);
  for (const f of [5, 10, 15]) {
    const yy = py0 - (f / 16) * ph;
    line(ctx, px0, yy, px0 + pw, yy, '#1e2634', 1);
    text(ctx, String(f), px0 - 14, yy + 6, { face: SANS, size: 16, color: '#5a6a80', align: 'right' });
  }
  const tt = t - IGN;
  ctx.strokeStyle = '#ffb44a'; ctx.lineWidth = 3; ctx.lineJoin = 'round';
  ctx.beginPath();
  const n = 200;
  let last = null;
  for (let i = 0; i <= n; i++) {
    const s = (i / n) * 2.4;
    if (s > tt) break;
    const px = px0 + (s / 2.4) * pw, py = py0 - (thrustC6(s) / 16) * ph;
    i ? ctx.lineTo(px, py) : ctx.moveTo(px, py);
    last = [px, py];
  }
  ctx.stroke();
  if (last && tt < 2.4) glow(ctx, last[0], last[1], 30, '#ffb44a', 0.8);
  if (tt > C6_BURN + 0.3) {
    text(ctx, 'peak 14.1 N · total impulse 8.8 N·s · burn 1.86 s', x0 + 24, y0 + h - 8, { face: SANS, size: 17, color: '#8aa0c0', align: 'left', alpha: ramp(tt, 2.2, 2.8) });
  }
  ctx.restore();
}

export function teststand(ctx, t) {
  const tt = t - IGN;
  const F = thrustC6(tt);
  const burning = tt > 0 && tt < C6_BURN;
  const flash = burning ? 0.5 + F / 14 : 0;
  const shake = burning ? (F / 14) * 3 : 0;
  ctx.save();
  ctx.translate(Math.sin(t * 70) * shake, Math.cos(t * 53) * shake);
  // dusk in the back yard
  vgrad(ctx, [[0, '#141a3a'], [0.6, '#3a3a6a'], [0.9, '#b8687a'], [1, '#e89a78']], -50, 760);
  STARS.draw(ctx, t, { alpha: 0.6, dy: -900, big: 0.5 });
  hills(ctx, (x) => 740 - 50 * (0.5 + 0.5 * fbm1(x * 0.002, 121)), '#1c1e30');
  tree(ctx, 240, 770, 420, '#12141e', 31);
  fence(ctx, -20, W + 20, 800, { h: 110, gap: 26, color: '#241e24', rails: 2, w: 20 });
  // garage wall with a work light
  box(ctx, 1560, 340, 420, 580, '#2a2830');
  box(ctx, 1600, 520, 260, 400, '#34323a');
  glow(ctx, 1640, 420, 400, '#ffd89a', 0.3);
  circle(ctx, 1640, 420, 10, '#fff4d8');
  vgrad(ctx, [[0, '#26301e'], [1, '#141a10']], 800, H + 60);
  standRig(ctx, flash);
  // the firing: a jet out of the top of the motor, smoke, sparks
  const nzx = STAND.x, nzy = STAND.base - 156;
  if (burning) {
    const L = 60 + F * 22 + noise1(t * 30, 3) * 12;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    const g = ctx.createLinearGradient(nzx, nzy, nzx, nzy - L);
    g.addColorStop(0, 'rgba(255,255,240,1)'); g.addColorStop(0.25, 'rgba(255,210,120,0.9)'); g.addColorStop(1, 'rgba(255,120,40,0)');
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.moveTo(nzx - 9, nzy); ctx.quadraticCurveTo(nzx - 26, nzy - L * 0.5, nzx, nzy - L); ctx.quadraticCurveTo(nzx + 26, nzy - L * 0.5, nzx + 9, nzy); ctx.fill();
    ctx.restore();
    glow(ctx, nzx, nzy - 40, 700, '#ffb060', 0.25 + flash * 0.25);
    glow(ctx, nzx, nzy - 20, 90, '#fff4d0', 0.8);
  }
  sparks(ctx, t, { x: nzx, y: nzy - 10, rate: 120, life: 1.2, speed: 700, angle: -Math.PI / 2, spread: 0.5, g: 700, floor: GY, seed: 51, size: 1.6, t0: IGN, t1: IGN + C6_BURN });
  smoke(ctx, t, { x: nzx, y: nzy - 40, rate: 14, life: 7, rise: 70, spread: 50, size: 30, grow: 180, color: '#b8b4b0', a: 0.3, seed: 12, wind: 22, t0: IGN, t1: IGN + C6_BURN });
  // the delay charge's little pop, five seconds later
  smoke(ctx, t, { x: STAND.x, y: STAND.base - 30, rate: 20, life: 4, rise: 20, spread: 60, size: 20, grow: 90, color: '#a8a4a0', a: 0.25, seed: 13, wind: 18, t0: IGN + C6_BURN + 5, t1: IGN + C6_BURN + 5.3 });

  // him: setting up, backing off with the igniter, the countdown, then a jump
  const S = 2.2;
  const colors = { ...HIM, skin: '#8a6e62' };
  // the crate and laptop
  box(ctx, 560, GY - 110, 130, 110, '#6a5238');
  laptop(ctx, 640, GY - 110, { s: 1.1, face: -1, glowC: '#bcd4ff', glowA: 0.6 });
  line(ctx, 690, GY - 40, 1030, GY - 6, '#101010', 2);
  let x, pz, face = 1;
  if (t < 7) {
    // crouched at the stand, fitting the igniter
    x = 1010;
    pz = pose({ ...P.kneel(), lean: 0.4, neck: 0.5, s1: 1.1 + Math.sin(t * 3) * 0.1, e1: 0.4, s2: 1.0, e2: 0.6 });
  } else if (t < 10.5) {
    const u = ramp(t, 7.3, 10.3, (k) => k);
    x = lerp(1010, 760, smooth(u));
    face = -1;
    pz = u > 0 && u < 1 ? P.walk(stride(1010 - x, S)) : P.stand(t, 1);
    if (t < 7.3) pz = blend(P.kneel(), P.stand(t, 1), ramp(t, 7, 7.3));
  } else if (t < 19.3) {
    // crouched by the laptop with the controller in hand
    x = 760; face = 1;
    const k = ramp(t, 10.5, 11.3);
    pz = blend(P.stand(t, 1), pose({ ...P.kneel(), lean: 0.2, neck: 0.1, s1: 0.9, e1: 1.2, s2: 0.8, e2: 1.3 }), k);
    if (t > 15.6) { pz.s1 = 0.95; pz.e1 = 1.0; }
  } else {
    // the jump
    x = 760; face = 1;
    const j = t - 19.3;
    const up = j < 0.8 ? Math.sin((j / 0.8) * Math.PI) * 60 : 0;
    const arms = ramp(t, 19.3, 19.6);
    pz = pose({ ...P.stand(t, 1), s1: lerp(0.2, 2.8, arms), e1: 0.3, s2: lerp(0.1, 2.7, arms), e2: 0.35, neck: -0.15 });
    if (j < 0.8) { pz.h1 = 0.3; pz.k1 = 0.5; pz.h2 = 0.1; pz.k2 = 0.6; }
    ctx.save(); ctx.translate(0, -up);
    figure(ctx, 'man', pz, { x, ground: GY, s: S, face, colors });
    ctx.restore();
    pz = null;
  }
  if (pz) {
    const J = figure(ctx, 'man', pz, { x, ground: GY, s: S, face, colors });
    if (t >= 10.5 && t < 19.3) box(ctx, J.hand1[0] - 10, J.hand1[1] - 14, 22, 28, '#c83a2a', 1, 4);
  }
  ctx.restore();
  plotPanel(ctx, t, 1180, 90, 640, 330, win(t, 15.2, 30, 0.6, 1.2));
  vignette(ctx, 0.55);
}
