// V. Her — the paddock at sundown where he met her, and the temple where
// they were sealed.

import { W, H, TAU, clamp, lerp, smooth, ramp, win, keys, hash, noise1, fbm1, css, mix, easeInOut, easeOut } from '../kit.js';
import { vgrad, glow, box, circle, line, radial, vignette, layer, flakes, motes, hills, tree, rrect } from '../paint.js';
import { figure, P, pose, blend, stride } from '../figure.js';
import { bikeSide, fence } from '../props.js';
import { STARS } from './kid.js';

const GY = 880;
const SIL = '#1f1418';

function paddock(ctx, t) {
  vgrad(ctx, [[0, '#3d2a52'], [0.45, '#b0506a'], [0.75, '#f08a5a'], [1, '#ffc27a']], -100, GY);
  glow(ctx, 960, 690, 1100, '#ff9a5a', 0.45);
  glow(ctx, 960, 690, 260, '#ffd8a0', 0.6);
  circle(ctx, 960, 690, 95, '#fff0cc');
  // thin cloud bands across the sun
  for (let i = 0; i < 4; i++) {
    const y = 560 + i * 48, x = ((t * 6 + i * 300) % 600) - 300;
    ctx.save(); ctx.globalAlpha = 0.25; ctx.fillStyle = '#9a3a5a';
    ctx.beginPath(); ctx.ellipse(960 + x, y, 700 - i * 60, 6 + i * 2, 0, 0, TAU); ctx.fill(); ctx.restore();
  }
  // distant hills
  hills(ctx, (x) => 790 - 50 * (0.5 + 0.5 * fbm1(x * 0.002, 71)), '#5a3040');
  // awnings, a transporter, bikes on stands, flags
  const aw = (x, w) => {
    ctx.fillStyle = css(SIL);
    ctx.beginPath(); ctx.moveTo(x - w / 2, 640); ctx.lineTo(x + w / 2, 640); ctx.lineTo(x + w / 2 + 30, 690); ctx.lineTo(x - w / 2 - 30, 690); ctx.fill();
    box(ctx, x - w / 2 - 25, 690, 8, GY - 690, SIL); box(ctx, x + w / 2 + 17, 690, 8, GY - 690, SIL);
  };
  aw(260, 360);
  aw(1650, 420);
  box(ctx, 1320, 600, 220, GY - 600, SIL);
  box(ctx, 1320, 600, 260, 40, SIL);
  bikeSide(ctx, 200, GY, { s: 1.3, sil: SIL, stand: true });
  bikeSide(ctx, 1700, GY, { s: 1.3, face: -1, sil: SIL, stand: true });
  for (const [fx, c] of [[520, '#c8302a'], [1420, '#2255cc'], [1880, '#e0a020']]) {
    box(ctx, fx, 380, 5, GY - 380, SIL);
    ctx.fillStyle = css(mix(c, SIL, 0.55));
    ctx.beginPath(); ctx.moveTo(fx + 5, 385);
    for (let k = 0; k <= 10; k++) ctx.lineTo(fx + 5 + k * 12, 385 + Math.sin(t * 4 + k * 0.7 + fx) * 6 * (k / 10));
    for (let k = 10; k >= 0; k--) ctx.lineTo(fx + 5 + k * 12, 440 + Math.sin(t * 4 + k * 0.7 + fx) * 6 * (k / 10));
    ctx.fill();
  }
  fence(ctx, -20, W + 20, GY, { h: 150, gap: 120, color: SIL, rails: 3, w: 6 });
  // the paddock asphalt, holding the sun
  vgrad(ctx, [[0, '#3a2228'], [1, '#150c10']], GY, H);
  ctx.save();
  ctx.translate(960, GY + 10); ctx.scale(1, 0.18);
  radial(ctx, 0, 0, 700, [[0, '#ffb070', 0.5], [1, '#ffb070', 0]]);
  ctx.restore();
}

export function meet(ctx, t) {
  const zoom = keys(t, [[0, 1.0], [12, 1.12], [26, 1.0]], easeInOut);
  ctx.save();
  ctx.translate(960, GY); ctx.scale(zoom, zoom); ctx.translate(-960, -GY);
  paddock(ctx, t);

  const S = 1.9;
  // him: walks in with his helmet under his arm, then slows
  const walkU = ramp(t, 0, 8.5, (k) => 1 - (1 - k) ** 1.6);
  let xH = lerp(120, 840, walkU);
  // her: at the fence, turns when he comes near, steps toward him
  let xW = 1150;
  const turn = t > 5.5 ? -1 : 1;
  const step = ramp(t, 9.5, 11.5);
  xW = lerp(1150, 1075, step);
  const together = ramp(t, 17, 26, (k) => k);
  let pH, pW, faceH = 1, faceW = turn;
  if (t < 17) {
    const walking = 1 - ramp(t, 7.5, 8.8);
    pH = blend(P.stand(t, 1), P.walk(stride(xH - 120, S)), walking);
    pH.s2 = 0.35; pH.e2 = 1.5;                  // helmet arm
    const talk = win(t, 12.5, 16.5, 0.5, 0.5);
    pH.s1 = lerp(pH.s1, 0.5 + Math.sin(t * 2.2) * 0.2, talk); pH.e1 = lerp(pH.e1, 1.2, talk);
    pW = t > 9.5 && t < 11.5 ? blend(P.walk(stride((xW - 1150), S * 0.95)), P.stand(t, 3), ramp(t, 11, 11.5)) : P.stand(t, 3);
    const hair = win(t, 13.2, 15.5, 0.6, 0.6);
    pW.s1 = lerp(pW.s1, 2.5, hair); pW.e1 = lerp(pW.e1, 2.5, hair);
    pW.neck = t > 12 ? 0.1 + Math.sin(t * 0.8) * 0.05 : pW.neck;
  } else {
    // walking away along the fence together, hand in hand
    const d = 520 * together;
    xH = 840 + d; xW = 900 + d;
    faceW = 1;
    pH = P.walk(stride(d, S) + 0.25, lerp(0.3, 0.8, ramp(t, 17, 18.5)));
    pW = P.walk(stride(d, S) + 0.75, lerp(0.3, 0.8, ramp(t, 17, 18.5)));
    const hold = ramp(t, 19.5, 21);
    pH.s2 = lerp(0.35, 0.3, hold); pH.e2 = lerp(1.5, 0.15, hold);
    pW.s1 = lerp(pW.s1, -0.35, hold); pW.e1 = lerp(pW.e1, 0.1, hold);
  }
  const JW = figure(ctx, 'woman', pW, { x: xW, ground: GY, s: S * 0.95, face: faceW, sil: SIL, hairSway: Math.sin(t * 1.2) * 4 });
  const JH = figure(ctx, 'man', pH, { x: xH, ground: GY, s: S, face: faceH, sil: SIL });
  if (t < 19.5) circle(ctx, JH.hand2[0] + 6, JH.hand2[1] - 14, 24, SIL);     // the helmet
  ctx.restore();
  // the light between them when they meet
  const between = win(t, 10.5, 17.5, 1.5, 1.5);
  glow(ctx, 960, 690 - 0, 320, '#ffe2b0', 0.35 * between);
  vignette(ctx, 0.5);
}

// ─── the wedding ─────────────────────────────────────────────────────────

const TY = 860;   // temple grounds

function temple(ctx, t, dusk) {
  const wall = mix('#f4ece6', '#c9b8c8', dusk);
  const shade = mix('#e2d4d0', '#a898b0', dusk);
  const winC = mix('#f0d9a8', '#ffd28a', dusk);
  // broad steps and base
  box(ctx, 560, TY - 40, 800, 40, shade);
  box(ctx, 600, 400, 720, TY - 440, wall);
  // pilasters and tall arched windows
  for (let i = 0; i < 7; i++) {
    const x = 632 + i * 100;
    box(ctx, x - 6, 400, 12, TY - 440, shade);
    if (i < 6) {
      const wx = x + 26;
      ctx.fillStyle = css(winC, 0.4 + dusk * 0.5);
      ctx.beginPath(); rrect(ctx, wx, 470, 46, 300, 23); ctx.fill();
      if (dusk > 0.3) glow(ctx, wx + 23, 620, 90, '#ffcf88', 0.25 * dusk);
    }
  }
  box(ctx, 590, 390, 740, 16, shade);
  // the tower, tier by tier, and the spire
  box(ctx, 870, 250, 180, 150, wall);
  box(ctx, 860, 244, 200, 12, shade);
  box(ctx, 895, 160, 130, 90, wall);
  box(ctx, 887, 154, 146, 10, shade);
  box(ctx, 918, 100, 84, 60, wall);
  for (const [x, y, w, h] of [[900, 280, 30, 90], [990, 280, 30, 90], [940, 180, 40, 55], [948, 112, 24, 38]]) {
    ctx.fillStyle = css(winC, 0.5 + dusk * 0.4);
    ctx.beginPath(); rrect(ctx, x, y, w, h, w / 2); ctx.fill();
  }
  ctx.fillStyle = css(wall);
  ctx.beginPath(); ctx.moveTo(918, 100); ctx.lineTo(960, -10); ctx.lineTo(1002, 100); ctx.closePath(); ctx.fill();
  // a gold figure on the spire, catching the last of the sun
  ctx.fillStyle = '#e8b94a';
  ctx.beginPath(); ctx.ellipse(960, -24, 4, 13, 0, 0, TAU); ctx.fill();
  circle(ctx, 960, -40, 3.5, '#e8b94a');
  line(ctx, 961, -34, 972, -44, '#e8b94a', 2);
  glow(ctx, 960, -30, 40, '#ffd878', 0.5);
}

export function wedding(ctx, t) {
  const dusk = ramp(t, 0, 26, (k) => k);
  const zoom = lerp(1, 1.1, smooth(t / 26));
  ctx.save();
  ctx.translate(960, 800); ctx.scale(zoom, zoom); ctx.translate(-960, -800);
  ctx.translate(0, 70);
  vgrad(ctx, [[0, mix('#5a5aa0', '#141a44', dusk)], [0.55, mix('#e0a0b0', '#7a5a90', dusk)], [1, mix('#ffd0a8', '#e89a8a', dusk)]], -200, TY);
  STARS.draw(ctx, t, { alpha: ramp(t, 10, 26) * 0.8, dy: -900 });
  glow(ctx, 960, TY - 100, 900, '#ffb890', 0.3 * (1 - dusk * 0.5));
  // trees either side
  tree(ctx, 300, TY + 10, 520, '#2a2a3c', 4);
  tree(ctx, 1640, TY + 10, 560, '#2a2a3c', 5);
  tree(ctx, 120, TY + 20, 380, '#23233a', 6);
  tree(ctx, 1820, TY + 20, 400, '#23233a', 7);
  temple(ctx, t, dusk);
  // reflecting pool
  box(ctx, -100, TY, W + 200, 140, '#2e3050');
  ctx.save();
  ctx.beginPath(); ctx.rect(560, TY + 6, 800, 110); ctx.clip();
  ctx.translate(0, TY * 2 + 6); ctx.scale(1, -0.35);
  ctx.globalAlpha = 0.35;
  temple(ctx, t, dusk);
  ctx.restore();
  box(ctx, 560, TY + 6, 800, 110, '#3a3c68', 0.35);
  for (let i = 0; i < 14; i++) line(ctx, 580 + hash(i, 3) * 700, TY + 20 + hash(i, 4) * 90, 620 + hash(i, 3) * 700 + Math.sin(t + i) * 10, TY + 20 + hash(i, 4) * 90, '#e8d8e8', 1.5, 0.3);
  vgrad(ctx, [[0, '#3a3450'], [1, '#1a1830']], TY + 140, H + 200);
  // lamps along the walk
  for (const lx of [420, 700, 1220, 1500]) {
    box(ctx, lx - 3, TY + 40, 6, 120, '#1a1a26');
    circle(ctx, lx, TY + 36, 8, '#fff0d0', 0.4 + dusk * 0.6);
    glow(ctx, lx, TY + 36, 90, '#ffd8a0', 0.4 * dusk + 0.1);
  }
  // the two of them, hands held
  const S = 2.1;
  const lean = win(t, 9.5, 20, 2, 2);
  const him = { skin: '#b58f7a', hair: '#2a1f18', top: '#15171f', bottom: '#15171f', shoes: '#0c0c10' };
  const her = { skin: '#b58f7a', hair: '#3a2a20', top: '#f6f2ec', bottom: '#f6f2ec', shoes: '#f6f2ec' };
  const pH = pose({ ...P.stand(t, 1), s1: 0.75, e1: 0.4, s2: 0.6, e2: 0.5, lean: 0.06 * lean + 0.02, neck: 0.15 * lean });
  const pW = pose({ ...P.stand(t, 2), s1: 0.75, e1: 0.4, s2: 0.6, e2: 0.5, lean: 0.06 * lean + 0.02, neck: 0.2 * lean - 0.05 });
  const gx = 960, gy = TY + 50;
  // her veil, behind her
  const JW = figure(ctx, 'woman', pW, { x: gx + 62, ground: gy, s: S * 0.95, face: -1, colors: her, dress: '#f6f2ec', flare: 34, sway: Math.sin(t * 0.9) * 2,
    prop2: (g, J) => {
      g.fillStyle = 'rgba(255,255,255,0.55)';
      g.beginPath();
      g.moveTo(J.head[0] - 4, J.head[1] - 10);
      g.quadraticCurveTo(J.head[0] - 40, J.head[1] + 40 + Math.sin(t) * 3, J.head[0] - 30 + Math.sin(t * 0.8) * 4, J.head[1] + 150);
      g.lineTo(J.head[0] - 6, J.head[1] + 140);
      g.quadraticCurveTo(J.head[0] - 10, J.head[1] + 30, J.head[0] + 6, J.head[1] - 6);
      g.fill();
    } });
  figure(ctx, 'man', pH, { x: gx - 62, ground: gy, s: S, face: 1, colors: him, tie: '#f0ece6' });
  flakes(ctx, t, { n: 70, colors: ['#ffffff', '#f6d6e0', '#ffe8f0'], seed: 3, x0: 300, x1: 1600, y0: 200, y1: H + 100, fall: 45, sway: 50, size: 5, a: 0.8 });
  motes(ctx, t, { n: 40, x0: 400, x1: 1500, y0: 300, y1: 1000, color: '#ffe8c0', a: 0.5, size: 1.6, glowR: 5, seed: 21 });
  ctx.restore();
  glow(ctx, 960, 900, 500, '#ffd8b8', 0.15);
  vignette(ctx, 0.55);
}
