// XI. The job — the clean room he could see but not touch, the cubicle, and
// the browser tabs that started to pile up.

import { W, H, TAU, clamp, lerp, smooth, ramp, win, keys, hash, noise1, css, mix, easeInOut, easeOut } from '../kit.js';
import { vgrad, glow, box, circle, line, radial, vignette, layer, rrect, text, SANS, SERIF, motes } from '../paint.js';
import { figure, P, pose, blend, stride } from '../figure.js';
import { satellite } from '../props.js';

const HIM = { skin: '#b08a76', hair: '#2a2018', top: '#56687e', bottom: '#2e3444', shoes: '#1e1c1e' };
const SUIT = { skin: '#e8ecf0', hair: '#e8ecf0', top: '#f2f5f8', bottom: '#eef2f6', shoes: '#e4e9ee', gloves: '#6a8ad8' };

// ─── the clean room ──────────────────────────────────────────────────────

export function cleanroom(ctx, t) {
  const GY = 930;
  const zoom = lerp(1.0, 1.08, smooth(t / 28));
  ctx.save();
  ctx.translate(960, 600); ctx.scale(zoom, zoom); ctx.translate(-960, -600);
  // corridor
  box(ctx, -40, -40, W + 80, H + 80, '#171b23');
  const WX = 180, WY = 150, WW = 1560, WH = 660;
  // inside the window: the clean room
  ctx.save();
  ctx.beginPath(); ctx.rect(WX, WY, WW, WH); ctx.clip();
  vgrad(ctx, [[0, '#e9f0f6'], [1, '#dde6ee']], WY, WY + WH, WX, WW, WY, WY + WH);
  for (let i = 0; i < 6; i++) box(ctx, WX + 60 + i * 250, WY + 20, 180, 16, '#ffffff');
  box(ctx, WX, WY + 520, WW, WH - 520, '#cfd9e2');
  for (let i = 0; i < 12; i++) line(ctx, WX + i * 140, WY + 520, WX + i * 140 - 60, WY + WH, '#bcc8d4', 2);
  // the satellite on its stand
  box(ctx, 900, 560, 120, 150, '#9aa6b2');
  box(ctx, 860, 700, 200, 14, '#8a96a2');
  satellite(ctx, 960, 430, { s: 1.35, deploy: 0.18 });
  // technicians in bunny suits
  const tech = (x, pz, face) => figure(ctx, 'man', pz, { x, ground: WY + 590, s: 1.35, face, colors: SUIT, gloves: 1, hood: '#f2f5f8', mask: '#dfe6ee', goggle: '#5a7088' });
  const work = Math.sin(t * 2.2) * 0.15;
  tech(760, pose({ ...P.stand(t, 1), lean: 0.12, s1: 1.5 + work, e1: 0.6, s2: 1.2, e2: 0.9, neck: -0.1 }), 1);
  const wu = (t * 0.035) % 1;
  const wx = lerp(1700, 1150, wu);
  tech(wx, P.walk(stride(1700 - wx, 1.35) * 0.6, 0.55), -1);
  tech(1500, pose({ ...P.stand(t, 3), lean: 0.3, neck: 0.4, s1: 1.1 + Math.sin(t * 1.3) * 0.08, e1: 0.8, s2: 1.0, e2: 0.9 }), -1);
  box(ctx, 1440, WY + 460, 200, 12, '#b8c4d0'); box(ctx, 1450, WY + 472, 10, 118, '#aab6c2'); box(ctx, 1620, WY + 472, 10, 118, '#aab6c2');
  ctx.restore();
  // the glass, its frame and reflections
  ctx.save();
  ctx.globalAlpha = 0.09; ctx.fillStyle = '#ffffff';
  for (let i = 0; i < 4; i++) { const x = WX + 200 + i * 420; ctx.beginPath(); ctx.moveTo(x, WY); ctx.lineTo(x + 120, WY); ctx.lineTo(x - 80, WY + WH); ctx.lineTo(x - 200, WY + WH); ctx.fill(); }
  ctx.restore();
  ctx.strokeStyle = '#2a303a'; ctx.lineWidth = 20; ctx.strokeRect(WX - 10, WY - 10, WW + 20, WH + 20);
  line(ctx, WX + WW / 2, WY, WX + WW / 2, WY + WH, '#2a303a', 10);
  glow(ctx, 960, 500, 1200, '#dff0ff', 0.12);
  box(ctx, -40, GY, W + 80, H, '#10131a');
  box(ctx, -40, WY + WH + 10, W + 80, GY - WY - WH - 10, '#1c2029');
  // him, on the outside of the glass
  const S = 2.3;
  const walkU = ramp(t, 0.5, 5, (k) => k);
  let x = lerp(1980, 1120, smooth(walkU));
  let pz, view = 'side', back = false, face = -1;
  if (walkU < 1) pz = blend(P.walk(stride(1980 - x, S)), P.stand(t, 2), ramp(t, 4.6, 5));
  else {
    view = 'front'; back = true;
    const hand = win(t, 14, 26, 1.2, 1.5);
    pz = pose({ ...P.stand(t, 2), s1: lerp(0.08, 0.75, hand), e1: lerp(0.1, 1.8, hand), s2: 0.08, e2: 0.1, h1: 0.05, h2: 0.05, neck: 0 });
  }
  const J = figure(ctx, 'man', pz, { x, ground: GY, s: S, view, back, face, colors: { ...HIM, top: '#2e3a4a', bottom: '#1e2430', skin: '#6a5a58', hair: '#141214' } });
  if (!back) {
    box(ctx, J.top[0] - 18 * face, J.top[1] + 30, 14, 20, '#e8ecf0');
    line(ctx, J.top[0] - 6 * face, J.top[1] + 4, J.top[0] - 11 * face, J.top[1] + 30, '#3a6ab8', 2);
  }
  ctx.restore();
  vignette(ctx, 0.6);
}

// ─── the cubicle ─────────────────────────────────────────────────────────

function cadScreen(ctx, t, x0, y0, w, h) {
  box(ctx, x0 - 14, y0 - 14, w + 28, h + 28, '#1a1c20', 1, 8);
  box(ctx, x0, y0, w, h, '#2a2e36');
  box(ctx, x0, y0, w, 30, '#3a3f4a');
  for (let i = 0; i < 12; i++) box(ctx, x0 + 10 + i * 26, y0 + 7, 18, 16, '#56607a', 0.8, 2);
  box(ctx, x0, y0 + 30, 110, h - 30, '#30343d');
  for (let i = 0; i < 10; i++) box(ctx, x0 + 12, y0 + 48 + i * 22, 60 + hash(i, 3) * 30, 8, '#6a7488', 0.7, 2);
  // an isometric bracket, spun a little with each click
  const clicks = [5, 6.4, 8, 9.1, 12, 13.5, 15];
  let n = 0; for (const c of clicks) if (t > c) n++;
  const rot = n * 0.18 + 0.2 * Math.sin(t * 0.2);
  const cx = x0 + 110 + (w - 110) / 2, cy = y0 + h / 2 + 20;
  const P3 = (X, Y, Z) => {
    const cr = Math.cos(rot), sr = Math.sin(rot);
    const x = X * cr - Z * sr, z = X * sr + Z * cr;
    return [cx + (x - z) * 0.87 * 1.6, cy + ((x + z) * 0.5 - Y) * 1.6];
  };
  const E = (a, b) => { const p = P3(...a), q = P3(...b); ctx.moveTo(p[0], p[1]); ctx.lineTo(q[0], q[1]); };
  ctx.save();
  ctx.strokeStyle = '#7fd8ff'; ctx.lineWidth = 1.6;
  ctx.beginPath();
  // L-bracket: a base plate and an upright with a hole in each
  const base = [[-40, 0, -25], [40, 0, -25], [40, 0, 25], [-40, 0, 25]];
  const baseT = base.map(([x, y, z]) => [x, 6, z]);
  const up = [[-40, 6, -25], [-40, 60, -25], [-40, 60, 25], [-40, 6, 25]];
  const upT = up.map(([x, y, z]) => [-34, y, z]);
  for (const loop of [base, baseT, up, upT]) for (let i = 0; i < 4; i++) E(loop[i], loop[(i + 1) % 4]);
  for (let i = 0; i < 4; i++) { E(base[i], baseT[i]); E(up[i], upT[i]); }
  ctx.stroke();
  // holes
  for (const [X, Z] of [[15, 0]]) {
    ctx.beginPath();
    for (let k = 0; k <= 24; k++) { const a = (k / 24) * TAU; const p = P3(X + Math.cos(a) * 8, 6, Z + Math.sin(a) * 8); k ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]); }
    ctx.stroke();
  }
  ctx.restore();
  // dimensions
  const d1 = P3(-40, 0, 32), d2 = P3(40, 0, 32);
  ctx.strokeStyle = '#ffd27a'; ctx.lineWidth = 1.2;
  ctx.beginPath(); ctx.moveTo(d1[0], d1[1] + 18); ctx.lineTo(d2[0], d2[1] + 18); ctx.stroke();
  text(ctx, '50.80', (d1[0] + d2[0]) / 2, (d1[1] + d2[1]) / 2 + 40, { face: SANS, size: 16, color: '#ffd27a' });
  text(ctx, 'Ø 6.35', cx + 140, cy - 60, { face: SANS, size: 16, color: '#ffd27a' });
  text(ctx, 'R 3.18', cx - 170, cy - 110, { face: SANS, size: 16, color: '#ffd27a' });
  text(ctx, 'BRACKET_MOUNT_REV_C.SLDPRT', x0 + 120, y0 + h - 12, { face: SANS, size: 14, color: '#8a94a8', align: 'left' });
}

export function cad(ctx, t) {
  const GY = 930;
  const close = ramp(t, 15.5, 25, easeInOut);
  const zoom = lerp(1.0, 1.12, close);
  ctx.save();
  ctx.translate(960, 620); ctx.scale(zoom, zoom); ctx.translate(-960, -620);
  // office wall, ceiling panel, a little window
  box(ctx, -40, -40, W + 80, H + 80, '#9a9ea4');
  const ceil = lerp(0, 130, close);
  box(ctx, -40, -40, W + 80, 70 + ceil, '#c8ccd0');
  const fl = 0.85 + 0.15 * (noise1(t * 6, 3) > 0.7 ? 0 : 1);
  box(ctx, 600, 40 + ceil, 700, 26, '#f4f8fa', fl);
  glow(ctx, 950, 60 + ceil, 700, '#e8f4ff', 0.2 * fl);
  // the window, where the sky is
  const WX = 1560, WY = 200;
  vgrad(ctx, [[0, '#6aa0d8'], [1, '#b8d8f0']], WY, WY + 320, WX, 250, WY, WY + 320);
  for (let i = 0; i < 3; i++) radial(ctx, WX + 60 + ((t * 8 + i * 120) % 300), WY + 90 + i * 60, 60, [[0, '#ffffff', 0.7], [1, '#ffffff', 0]]);
  if (t > 29.5 && t < 33) {
    // a bird, crossing free
    const u = (t - 29.5) / 3.5;
    const bx = lerp(WX - 20, WX + 280, u), by = WY + 200 - Math.sin(u * Math.PI) * 90;
    const f = Math.sin(t * 16) * 9;
    ctx.save(); ctx.beginPath(); ctx.rect(WX, WY, 250, 320); ctx.clip();
    ctx.strokeStyle = '#2a3440'; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.moveTo(bx - 16, by - f); ctx.lineTo(bx, by); ctx.lineTo(bx + 16, by - f); ctx.stroke();
    ctx.restore();
  }
  ctx.strokeStyle = '#e8eaec'; ctx.lineWidth = 12; ctx.strokeRect(WX - 6, WY - 6, 262, 332);
  // clock racing through the day
  const hrs = 9 + ramp(t, 8, 30, (k) => k) * 8;
  circle(ctx, 1340, 230, 50, '#f4f4f0');
  ctx.strokeStyle = '#2a2a2a'; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(1340, 230, 50, 0, TAU); ctx.stroke();
  const ha = (hrs % 12) / 12 * TAU - Math.PI / 2, ma = (hrs % 1) * TAU - Math.PI / 2;
  line(ctx, 1340, 230, 1340 + Math.cos(ha) * 24, 230 + Math.sin(ha) * 24, '#1a1a1a', 5);
  line(ctx, 1340, 230, 1340 + Math.cos(ma) * 38, 230 + Math.sin(ma) * 38, '#1a1a1a', 3);
  // cubicle partitions, closing in
  const PT = 540;
  const leftEdge = lerp(-40, 360, close), rightEdge = lerp(1500, 1440, close);
  box(ctx, leftEdge, PT, rightEdge - leftEdge, GY - PT, '#80858c');
  for (let y = PT + 10; y < GY; y += 8) box(ctx, leftEdge, y, rightEdge - leftEdge, 1, '#767b82');
  box(ctx, leftEdge, PT - 10, rightEdge - leftEdge, 12, '#5a5e64');
  // a partition sliding in from the right, over the window
  const rp = lerp(W + 40, 1500, close);
  box(ctx, rp, 300, W + 80 - rp, GY - 300, '#7a7f86');
  box(ctx, rp, 290, 14, GY - 290, '#5a5e64');
  box(ctx, leftEdge - 14, 300, 14, GY - 300, '#5a5e64');
  if (close > 0) box(ctx, -40, 300, leftEdge + 40 - 14, GY - 300, '#7a7f86');
  // the coworker, leaning over the partition
  const co = win(t, 1.2, 9.5, 1.2, 1.2);
  if (co > 0) {
    ctx.save();
    ctx.beginPath(); ctx.rect(0, 0, W, PT - 8); ctx.clip();
    figure(ctx, 'man', pose({ ...P.stand(t, 9), lean: 0.12, s1: 1.4, e1: 1.8, s2: 1.35, e2: 1.9, neck: 0.1 }), { x: 520, ground: GY - 120 + lerp(300, 0, co), s: 2.3, face: 1, colors: { skin: '#9a7a66', hair: '#3a2a1a', top: '#dcdcd4', bottom: '#3a3a44', shoes: '#222' } });
    ctx.restore();
  }
  // desk and monitor
  box(ctx, 720, 720, 740, 16, '#6a5a4c');
  box(ctx, 740, 736, 14, GY - 736, '#4a4038'); box(ctx, 1430, 736, 14, GY - 736, '#4a4038');
  cadScreen(ctx, t, 1010, 380, 400, 280);
  box(ctx, 1190, 674, 40, 46, '#1a1c20');
  box(ctx, 1150, 712, 120, 8, '#1a1c20');
  glow(ctx, 1210, 520, 400, '#9fd8ff', 0.12);
  // him, at the mouse
  const S = 2.35;
  const clicks = [5, 6.4, 8, 9.1, 12, 13.5, 15];
  let tap = 0; for (const c of clicks) tap = Math.max(tap, win(t, c - 0.1, c + 0.15, 0.05, 0.1));
  const look = win(t, 30.8, 38, 0.6, 1.5);
  const pz = pose({ ...P.sit(t, 4), lean: lerp(0.22, 0.12, look), neck: lerp(0.2 + ramp(t, 16, 26) * 0.2, -0.35, look), s1: 0.95, e1: 0.9 - tap * 0.1, s2: 0.6, e2: 1.2 });
  box(ctx, 660, 800, 170, 16, '#2a2a30');
  box(ctx, 740, 816, 12, GY - 816, '#1a1a1e');
  box(ctx, 640, 560, 18, 250, '#2a2a30', 1, 4);
  figure(ctx, 'man', pz, { x: 760, ground: GY, s: S, colors: HIM });
  box(ctx, 1000, 706, 36, 14, '#1a1c20', 1, 6);
  vgrad(ctx, [[0, '#5a5e64'], [1, '#3a3e44']], GY, H + 60);
  ctx.restore();
  vignette(ctx, 0.45 + close * 0.35);
}

// ─── the tabs ────────────────────────────────────────────────────────────

const QUERIES = [
  [1.5, 'how do startups raise money', 'How startups raise money'],
  [6.5, 'pre-seed vs seed round', 'Pre-seed vs. seed'],
  [12, 'how to pitch investors', 'Writing a pitch deck'],
  [17, 'rocket engine startup', 'Rocket engine startups'],
];

export function research(ctx, t) {
  box(ctx, -20, -20, W + 40, H + 40, '#0c0d10');
  const x0 = 120, y0 = 60, w = 1680, h = 920;
  box(ctx, x0 - 24, y0 - 24, w + 48, h + 48, '#18191d', 1, 22);
  box(ctx, x0, y0, w, h, '#f4f5f7', 1, 6);
  // tabs
  box(ctx, x0, y0, w, 64, '#dfe2e7');
  const tabs = [['Bracket rev C — PDM', 0]];
  for (const [at, , title] of QUERIES) if (t > at + 2.4) tabs.push([title, at]);
  tabs.forEach(([title, at], i) => {
    const tw = 300;
    const a = i === 0 ? 1 : ramp(t, at + 2.4, at + 2.8);
    const active = i === tabs.length - 1;
    box(ctx, x0 + 12 + i * (tw + 6), y0 + 12 + (1 - a) * 20, tw, 52, active ? '#f4f5f7' : '#cfd3da', a, 10);
    text(ctx, title, x0 + 32 + i * (tw + 6), y0 + 46, { face: SANS, size: 20, color: '#2a2f3a', align: 'left', alpha: a });
  });
  // search bar
  let q = null;
  for (const e of QUERIES) if (t >= e[0]) q = e;
  box(ctx, x0 + 40, y0 + 96, w - 80, 70, '#ffffff', 1, 35);
  ctx.strokeStyle = '#c9ced8'; ctx.lineWidth = 2; ctx.beginPath(); rrect(ctx, x0 + 40, y0 + 96, w - 80, 70, 35); ctx.stroke();
  if (q) {
    const typed = q[1].slice(0, Math.floor(clamp((t - q[0]) / 2.1) * q[1].length));
    text(ctx, typed, x0 + 90, y0 + 143, { face: SANS, size: 30, color: '#1a1f2a', align: 'left' });
    if (Math.floor(t * 2) % 2 === 0 && t - q[0] < 3) {
      ctx.font = `400 30px ${SANS}`;
      box(ctx, x0 + 92 + ctx.measureText(typed).width, y0 + 112, 3, 38, '#1a1f2a');
    }
    // results
    const shown = ramp(t, q[0] + 2.3, q[0] + 2.9);
    for (let r = 0; r < 5; r++) {
      const ry = y0 + 230 + r * 128;
      const a = clamp(shown * 5 - r);
      box(ctx, x0 + 90, ry, 420 + hash(r + q[0] * 3, 5) * 380, 26, '#2a5ad0', a * 0.85, 6);
      box(ctx, x0 + 90, ry + 42, 1100, 14, '#9aa2b0', a * 0.6, 6);
      box(ctx, x0 + 90, ry + 66, 800 + hash(r, 6) * 300, 14, '#9aa2b0', a * 0.6, 6);
    }
  } else {
    text(ctx, 'Search', x0 + 90, y0 + 143, { face: SANS, size: 30, color: '#9aa2b0', align: 'left' });
  }
  // a sticky note on the bezel
  ctx.save();
  ctx.translate(1680, 900); ctx.rotate(0.06);
  box(ctx, 0, 0, 170, 150, '#f6e27a');
  text(ctx, 'farm?', 85, 70, { face: SERIF, size: 42, italic: true, color: '#3a3020' });
  ctx.strokeStyle = '#3a3020'; ctx.lineWidth = 2.5;
  ctx.beginPath(); ctx.moveTo(60, 125); ctx.lineTo(60, 100); ctx.lineTo(85, 84); ctx.lineTo(110, 100); ctx.lineTo(110, 125); ctx.closePath(); ctx.stroke();
  ctx.restore();
  vignette(ctx, 0.4);
}
