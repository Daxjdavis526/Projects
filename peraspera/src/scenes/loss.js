// VI. Loss — an empty pit lane under cloud, an orange helmet on the wall,
// and a slow lap with raised hands.

import { W, H, TAU, clamp, lerp, smooth, ramp, win, keys, hash, noise1, fbm1, css, mix, easeInOut } from '../kit.js';
import { vgrad, glow, rain, splashes, box, circle, line, radial, vignette, hills, rrect } from '../paint.js';
import { figure, P, pose, blend, stride } from '../figure.js';
import { bikeSide } from '../props.js';

const GY = 900;            // pit lane
const WALL = 690;          // top of the pit wall
const TRACK = 640;         // track surface seen through the fence

function helmet(ctx, x, y, r, color, accent) {
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = css(color);
  ctx.beginPath(); ctx.ellipse(0, -r, r * 1.1, r, 0, Math.PI, TAU); ctx.lineTo(r * 1.1, -r * 0.2); ctx.lineTo(-r * 1.1, -r * 0.2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(0, -r * 0.2, r * 1.1, r * 0.25, 0, 0, Math.PI); ctx.fill();
  ctx.fillStyle = css('#1a1c22', 0.9);
  ctx.beginPath(); ctx.ellipse(r * 0.45, -r * 0.9, r * 0.6, r * 0.34, -0.1, 0, TAU); ctx.fill();
  ctx.fillStyle = css(accent);
  ctx.fillRect(-r * 1.0, -r * 1.35, r * 0.9, r * 0.14);
  ctx.restore();
}

function flowers(ctx, x, y, seed) {
  for (let i = 0; i < 5; i++) {
    const fx = x + i * 26 + hash(i, seed) * 10, fy = y;
    ctx.save();
    ctx.translate(fx, fy);
    ctx.rotate(-0.3 + hash(i, seed + 1) * 0.3);
    ctx.fillStyle = css('#d8d2c2');
    ctx.beginPath(); ctx.moveTo(-10, 0); ctx.lineTo(10, 0); ctx.lineTo(18, -60); ctx.lineTo(-18, -60); ctx.fill();
    for (let k = 0; k < 5; k++) circle(ctx, -12 + k * 6, -64 - hash(k + i * 5, seed + 2) * 12, 7, ['#c8404a', '#f2f0ea', '#e8a030', '#d86a8a', '#f2f0ea'][(k + i) % 5]);
    ctx.restore();
  }
}

export function friend(ctx, t) {
  const zoom = lerp(1.0, 1.08, smooth(t / 38));
  ctx.save();
  ctx.translate(900, 760); ctx.scale(zoom, zoom); ctx.translate(-900, -760);
  const wet = ramp(t, 18, 26);
  vgrad(ctx, [[0, '#5b626c'], [0.6, '#8a9096'], [1, '#a4a8ac']], -100, TRACK);
  for (let i = 0; i < 8; i++) radial(ctx, hash(i, 3) * W + t * 5, 100 + hash(i, 4) * 250, 400, [[0, '#4a5058', 0.3], [1, '#4a5058', 0]]);
  // far side: grass, an empty grandstand
  hills(ctx, (x) => 520 - 30 * (0.5 + 0.5 * fbm1(x * 0.002, 81)), '#5f6a5a');
  box(ctx, 1150, 380, 700, 150, '#4f5358');
  for (let r = 0; r < 5; r++) box(ctx, 1150, 395 + r * 26, 700, 3, '#3e4247');
  box(ctx, 1130, 360, 740, 22, '#3a3d42');
  box(ctx, -100, 540, W + 200, TRACK - 540, '#66705e');
  // the track surface
  vgrad(ctx, [[0, '#4d5056'], [1, mix('#44474d', '#34373c', wet)]], TRACK - 50, WALL);
  for (let x = -100; x < W + 100; x += 80) box(ctx, x, TRACK - 52, 40, 8, (x / 80) % 2 ? '#a83a36' : '#d8d6d0');

  // the memorial lap — riders go by slowly, one arm raised
  for (let k = 0; k < 9; k++) {
    const start = 13.5 + k * 1.55;
    const u = (t - start) / 9;
    if (u < 0 || u > 1) continue;
    const x = lerp(-250, W + 250, u);
    const y = TRACK - 12 + (k % 2) * 16;
    const s = 0.95;
    bikeSide(ctx, x, y, { s, sil: '#2e3238' });
    const raised = k !== 4;
    const rp = pose({ lean: 0.45, neck: -0.1, h1: 1.3, k1: 1.95, h2: 1.25, k2: 1.9, s1: raised ? 2.7 + Math.sin(t * 2 + k) * 0.05 : 1.1, e1: raised ? 0.15 : 0.6, s2: 1.05, e2: 0.5 });
    figure(ctx, 'man', rp, { x: x - 8 * s, y: y - 100 * s, s: s * 0.92, sil: '#2e3238', helmet: '#2e3238' });
  }

  // the fence above the pit wall
  ctx.strokeStyle = css('#2b2e33', 0.55); ctx.lineWidth = 1.4;
  ctx.beginPath();
  for (let x = -100; x < W + 100; x += 22) { ctx.moveTo(x, 420); ctx.lineTo(x + 230, WALL); ctx.moveTo(x + 230, 420); ctx.lineTo(x, WALL); }
  ctx.stroke();
  for (let x = -100; x < W + 100; x += 300) box(ctx, x, 400, 10, WALL - 400, '#25282c');
  box(ctx, -100, 404, W + 200, 8, '#25282c');
  // pit wall
  box(ctx, -100, WALL, W + 200, GY - WALL, '#7c7f82');
  box(ctx, -100, WALL, W + 200, 14, '#909396');
  for (let x = 0; x < W; x += 360) box(ctx, x, WALL + 14, 3, GY - WALL - 14, '#65686b');
  // pit lane
  vgrad(ctx, [[0, mix('#4a4c50', '#3a3c40', wet)], [1, '#2a2c30']], GY, H + 200);
  if (wet > 0) {
    ctx.save(); ctx.translate(0, GY); ctx.scale(1, -0.25); ctx.globalAlpha = 0.25 * wet;
    box(ctx, -100, 0, W + 200, GY - WALL, '#9a9da0');
    ctx.restore();
  }

  // his friend's helmet on the wall, and flowers at its foot
  helmet(ctx, 1260, WALL, 34, '#f07a1a', '#1a1a1a');
  flowers(ctx, 1150, GY, 3);
  flowers(ctx, 1320, GY + 6, 9);

  // him
  const S = 1.9;
  const look = ramp(t, 15, 18) * (1 - ramp(t, 27, 29));
  const standU = ramp(t, 29.5, 31);
  const walkU = ramp(t, 31, 34.2, (k) => k);
  let x = 640, pz, face = 1;
  const sitP = pose({ lean: 0.1, neck: lerp(0.6, -0.05, look), h1: 2.0, k1: 2.4, h2: 1.9, k2: 2.3, s1: 0.75, e1: 0.9, s2: 0.65, e2: 1.0 });
  if (t < 29.5) pz = sitP;
  else if (t < 31) pz = blend(sitP, P.stand(t, 2), standU);
  else if (walkU < 1) { x = lerp(640, 1180, smooth(walkU)); pz = blend(P.walk(stride(x - 640, S)), P.stand(t, 2), ramp(t, 33.8, 34.2)); }
  else { x = 1180; pz = P.stand(t, 2); }
  if (t > 33.8) {
    const touch = ramp(t, 34, 35.2);
    pz.s1 = lerp(pz.s1, 1.35, touch); pz.e1 = lerp(pz.e1, 0.35, touch);
    pz.neck = lerp(pz.neck, 0.5, ramp(t, 34.5, 36));
  }
  const J = figure(ctx, 'man', pz, { x, ground: GY, s: S, face, colors: { skin: '#8d7468', hair: '#23201e', top: '#40454e', bottom: '#2c3240', shoes: '#18191c' } });
  if (t < 29.5) helmet(ctx, J.hand1[0] + 4, J.hand1[1] + 18, 26, '#eef1f6', '#2255cc');
  else if (t < 30.5) helmet(ctx, 610, GY, 26, '#eef1f6', '#2255cc');
  else helmet(ctx, 610, GY, 26, '#eef1f6', '#2255cc');

  ctx.restore();
  rain(ctx, t, { n: Math.round(420 * wet), a: 0.28 * wet, color: '#c8ced6', angle: 0.08, speed: 1300 });
  if (wet > 0.05) splashes(ctx, t, { n: Math.round(50 * wet), y0: GY, y1: H, color: '#c8ced6', a: 0.35 * wet });
  // everything is a little drained of colour
  ctx.fillStyle = css('#50565e', 0.18);
  ctx.fillRect(0, 0, W, H);
  vignette(ctx, 0.6);
}
