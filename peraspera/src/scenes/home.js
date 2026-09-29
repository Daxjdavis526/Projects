// IX. Home — dawn, a country road, and the driveway of their new house.

import { W, H, TAU, clamp, lerp, smooth, ramp, win, keys, hash, noise1, fbm1, css, mix, easeInOut, easeOut, easeIn } from '../kit.js';
import { vgrad, glow, box, circle, line, radial, vignette, rays, hills, tree, motes, grass } from '../paint.js';
import { figure, P, pose, blend, stride } from '../figure.js';
import { car, house, fence } from '../props.js';
import { STARS } from './kid.js';

const GY = 900;
const HOUSE_X = 2560;     // world x of the new house
const STOP_X = 3060;      // where the car stops, on the driveway

function carX(t) {
  // cruising, then braking to a stop at 15.2 s
  const v = 260, tb = 11.2, T = 15.2;
  const xb = 300 + v * tb;
  if (t < tb) return 300 + v * t;
  const u = clamp((t - tb) / (T - tb));
  const x = xb + (STOP_X - xb) * (1 - (1 - u) * (1 - u));
  return x;
}

export function driveway(ctx, t) {
  const cx = carX(t);
  const camX = Math.min(cx - 860, HOUSE_X - 780) + keys(t, [[15, 0], [30, 60]], easeInOut);
  const sunU = ramp(t, 8, 34, (k) => k);
  const sunY = lerp(760, 420, easeOut(sunU));
  const warm = ramp(t, 4, 30);
  const crane = ramp(t, 30, 42, easeInOut);

  ctx.save();
  ctx.translate(0, crane * 90);
  // dawn sky
  vgrad(ctx, [
    [0, mix('#1c2250', '#4a6aa8', warm)],
    [0.5, mix('#6a5a8a', '#e8a8a0', warm)],
    [0.85, mix('#e0907a', '#ffd6a0', warm)],
    [1, mix('#f0b080', '#fff0c8', warm)],
  ], -300, GY - 40, -40, W + 80, -400, GY);
  STARS.draw(ctx, t, { alpha: 0.7 * (1 - ramp(t, 0, 12)), dy: -900 });
  const sunSX = HOUSE_X - camX;
  glow(ctx, sunSX, sunY, 1200, '#ffcf8a', 0.25 + 0.35 * warm);
  glow(ctx, sunSX, sunY, 180, '#fff4d8', 0.5 + 0.4 * warm);
  circle(ctx, sunSX, sunY, 70, '#fff6e0', 0.9);
  if (t > 16) rays(ctx, t, sunSX, sunY, { angle: Math.PI / 2 - 0.1, spread: Math.PI * 1.6, n: 14, len: 1600, color: '#ffe2a8', a: 0.09 * ramp(t, 16, 26), width: 0.04 });
  // distant hills in parallax
  const hf = (x) => 700 - 120 * (0.5 + 0.5 * fbm1((x + camX * 0.2) * 0.0015, 101, 5));
  hills(ctx, hf, mix('#5a5070', '#a88a8a', warm), 1, -40, W + 40);
  const hf2 = (x) => 780 - 70 * (0.5 + 0.5 * fbm1((x + camX * 0.45) * 0.002, 102, 4));
  hills(ctx, hf2, mix('#3a4a48', '#7a8a60', warm), 1, -40, W + 40);

  ctx.save();
  ctx.translate(-camX, 0);
  // fields and a fence line going by
  box(ctx, camX - 100, 800, W + 200, 110, mix('#3e4e38', '#8a9a5a', warm));
  for (let k = Math.floor((camX - 200) / 900); k < (camX + W + 200) / 900; k++) {
    const x = k * 900 + 300;
    if (Math.abs(x - HOUSE_X) < 700) continue;
    box(ctx, x, 560, 10, 340, '#2e2a2a');
    box(ctx, x - 40, 580, 90, 8, '#2e2a2a');
    ctx.strokeStyle = css('#2e2a2a', 0.6); ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(x, 590); ctx.quadraticCurveTo(x + 450, 640, x + 900, 590); ctx.stroke();
  }
  fence(ctx, Math.max(camX - 100, 0), Math.min(camX + W + 100, HOUSE_X - 500), 880, { h: 60, gap: 110, color: mix('#3a3230', '#6a5a4a', warm), rails: 2, w: 6 });
  // the house
  tree(ctx, HOUSE_X - 470, GY, 420, mix('#2a3428', '#4a5a3a', warm), 21);
  house(ctx, HOUSE_X, GY, { w: 640, h: 310, roof: 170, wall: mix('#8a7a78', '#e2d2bc', warm), roofC: mix('#3a3034', '#6a5448', warm), door: '#5a3a30', lit: lerp(0.9, 0.35, warm), porch: 1 - warm * 0.6, garage: true, chimney: true, trim: mix('#a8a0a0', '#f4ede2', warm) });
  // young tree, lawn, driveway
  box(ctx, HOUSE_X + 420, GY - 120, 6, 120, '#4a3a2e');
  circle(ctx, HOUSE_X + 423, GY - 140, 36, mix('#3a4a30', '#6a8a4a', warm));
  box(ctx, camX - 100, GY, W + 200, H - GY + 200, mix('#3a4a30', '#7a9450', warm));
  box(ctx, HOUSE_X + 50, GY, 700, 36, mix('#8a8480', '#d8d0c4', warm));
  // the road in front
  box(ctx, camX - 100, GY + 36, W + 200, 90, mix('#2a2a30', '#5a5858', warm));
  for (let k = Math.floor(camX / 140) - 1; k < (camX + W) / 140 + 1; k++) box(ctx, k * 140, GY + 78, 70, 5, '#e8dcc0', 0.6);
  ctx.restore();

  // the car
  const moving = t < 15.2;
  const turnIn = ramp(t, 12.2, 15.2, easeInOut);
  const cy = lerp(GY + 110, GY + 44, turnIn);
  const cs = lerp(1.35, 1.22, turnIn);
  const heads = t < 17.4 ? 2 : t < 18.2 ? 1 : 0;
  car(ctx, cx - camX, cy, { s: cs, color: mix('#3a4450', '#6d7a88', warm), glass: '#1a2230', roll: cx, heads, headColor: '#1a1618', lights: (1 - warm) * (moving ? 1 : 1 - ramp(t, 15.5, 16.5)), bounce: moving ? Math.sin(t * 13) * 0.8 : 0, tail: t > 14.4 && t < 16 ? 1 : 0 });

  // the two of them
  const S = 2.0;
  const colsH = { skin: '#b08a76', hair: '#2a2018', top: '#4a5a6c', bottom: '#3a4050', shoes: '#2a241e' };
  const colsW = { skin: '#b08a76', hair: '#4a3222', top: '#c88a7a', bottom: '#3a4458', shoes: '#2a2428' };
  if (t > 17) {
    const outH = ramp(t, 17.2, 17.8), outW = ramp(t, 18, 18.6);
    const walkH = ramp(t, 18.6, 22.2, (k) => k), walkW = ramp(t, 19, 22.4, (k) => k);
    const xH0 = STOP_X - 120, xW0 = STOP_X + 120;
    const xH1 = HOUSE_X + 20, xW1 = HOUSE_X + 120;
    const xh = lerp(xH0, xH1, smooth(walkH)), xw = lerp(xW0, xW1, smooth(walkW));
    const standing = walkH >= 1 && walkW >= 1;
    if (!standing) {
      const pH = walkH > 0 && walkH < 1 ? P.walk(stride(xH0 - xh, S)) : P.stand(t, 1);
      const pW = walkW > 0 && walkW < 1 ? P.walk(stride(xW0 - xw, S)) : P.stand(t, 2);
      figure(ctx, 'woman', pW, { x: xw - camX, ground: GY + 48, s: S * 0.94, face: -1, colors: colsW, alpha: outW });
      figure(ctx, 'man', pH, { x: xh - camX, ground: GY + 48, s: S, face: -1, colors: colsH, alpha: outH });
    } else {
      // side by side, backs to us, facing the house and the sunrise; hands held; her head on his shoulder
      const lean = ramp(t, 27, 29);
      const pH = pose({ ...P.stand(t, 1), s1: 0.28, e1: 0.1, s2: 0.06, e2: 0.1, h1: 0.05, h2: 0.05 });
      const pW = pose({ ...P.stand(t, 2), s2: 0.28, e2: 0.1, s1: 0.06, e1: 0.1, h1: 0.03, h2: 0.03, lean: 0.05 * lean, neck: 0.3 * lean });
      figure(ctx, 'man', pH, { x: xH1 - camX, ground: GY + 48, s: S, view: 'front', back: true, colors: colsH });
      figure(ctx, 'woman', pW, { x: xW1 - camX - 10 * lean, ground: GY + 48, s: S * 0.94, view: 'front', back: true, colors: colsW, face: -1 });
    }
  }
  ctx.restore();
  motes(ctx, t, { n: 50, x0: 0, x1: W, y0: 200, y1: 1000, color: '#ffe8b8', a: 0.5 * warm, size: 1.6, glowR: 5, seed: 41, rise: 4 });
  glow(ctx, HOUSE_X - camX, sunY, 1600, '#ffd8a0', 0.12 * ramp(t, 20, 40), 'screen');
  vignette(ctx, 0.45);
}
