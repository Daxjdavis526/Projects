// VII. The question — a bench press, a line he couldn't answer, and the
// application he sent that same night.

import { W, H, TAU, clamp, lerp, smooth, ramp, win, keys, hash, noise1, css, mix, easeInOut, easeOut } from '../kit.js';
import { vgrad, glow, box, circle, line, radial, vignette, layer, rrect, text, SANS, SERIF } from '../paint.js';
import { figure, P, pose, blend, stride } from '../figure.js';
import { laptop } from '../props.js';
import { STARS } from './kid.js';

// ─── the gym ─────────────────────────────────────────────────────────────

const GY = 900;
const PAD = 790;           // bench pad top
const S = 2.0;
const HOOK = [772, 585];   // where the bar racks
const REPS = [0.2, 3.2, 6.2, 9.2];

function plates(ctx, x, y) {
  circle(ctx, x, y, 52, '#0d0d0f');
  circle(ctx, x, y, 44, '#18181b');
  circle(ctx, x, y, 34, '#0f0f11');
  ctx.strokeStyle = css('#2a2a2e'); ctx.lineWidth = 2;
  ctx.beginPath(); ctx.arc(x, y, 40, 0, TAU); ctx.stroke();
  circle(ctx, x, y, 10, '#8c8f96');
  circle(ctx, x, y, 5, '#44464c');
}

function gymRoom(ctx, t, dim) {
  vgrad(ctx, [[0, '#1d1513'], [1, '#2a1f1b']], -200, GY);
  // brick, faintly
  ctx.strokeStyle = css('#120c0b', 0.35); ctx.lineWidth = 2;
  ctx.beginPath();
  for (let y = 0; y < GY; y += 28) { ctx.moveTo(-200, y); ctx.lineTo(W + 200, y); }
  for (let y = 0; y < GY; y += 28) for (let x = ((y / 28) % 2) * 40 - 200; x < W + 200; x += 80) { ctx.moveTo(x, y); ctx.lineTo(x, y + 28); }
  ctx.stroke();
  // mirror
  box(ctx, 120, 250, 1680, 470, '#2e2a2c');
  box(ctx, 120, 250, 1680, 470, '#56606c', 0.18);
  for (let i = 0; i < 5; i++) {
    ctx.save(); ctx.globalAlpha = 0.06; ctx.fillStyle = '#ffffff';
    ctx.beginPath(); const x = 200 + i * 360; ctx.moveTo(x, 250); ctx.lineTo(x + 60, 250); ctx.lineTo(x - 80, 720); ctx.lineTo(x - 140, 720); ctx.fill(); ctx.restore();
  }
  box(ctx, 110, 240, 1700, 12, '#141012'); box(ctx, 110, 718, 1700, 12, '#141012');
  // plate tree and dumbbells
  box(ctx, 1640, 640, 16, GY - 640, '#141416');
  for (let k = 0; k < 4; k++) circle(ctx, 1648, 700 + k * 44 - (k % 2) * 6, 38 - k * 5, '#0e0e10');
  box(ctx, 190, 760, 380, 14, '#141416');
  for (let k = 0; k < 7; k++) { box(ctx, 200 + k * 52, 740, 38, 18, '#0e0e10', 1, 5); }
  // hanging lamps
  for (const lx of [420, 960, 1500]) {
    line(ctx, lx, -200, lx, 90, '#0d0b0b', 3);
    ctx.fillStyle = '#0d0b0b';
    ctx.beginPath(); ctx.moveTo(lx - 40, 130); ctx.lineTo(lx + 40, 130); ctx.lineTo(lx + 14, 90); ctx.lineTo(lx - 14, 90); ctx.fill();
    const on = 1 - dim * (lx === 1500 ? 0.3 : 0.85);
    glow(ctx, lx, 140, 520, '#ffb86a', 0.28 * on);
    glow(ctx, lx, 132, 40, '#fff0d0', 0.8 * on);
  }
  vgrad(ctx, [[0, '#171313'], [1, '#0c0a0a']], GY, H + 200);
}

function barPos(t) {
  // hands / bar during the set, then racked
  const top = [900, 590], bottom = [940, 745];
  if (t >= 13.6) return { at: HOOK, racked: 1 };
  if (t >= 12.4) return { at: [lerp(top[0], HOOK[0], ramp(t, 12.4, 13.6, easeInOut)), lerp(top[1], HOOK[1], ramp(t, 12.4, 13.6, easeInOut))], racked: ramp(t, 12.4, 13.6) };
  let d = 0;
  for (const r of REPS) {
    if (t >= r && t < r + 1.0) d = smooth((t - r) / 1.0);
    else if (t >= r + 1.0 && t < r + 1.8) d = 1 - easeOut((t - r - 1.0) / 0.8);
  }
  return { at: [lerp(top[0], bottom[0], d), lerp(top[1], bottom[1], d)], racked: 0 };
}

// Solve the lying lifter's arm so the hand lands on the bar.
function armTo(sh, hand, ua, fa) {
  const dx = hand[0] - sh[0], dy = hand[1] - sh[1];
  const d = Math.min(Math.hypot(dx, dy), ua + fa - 0.01);
  const base = Math.atan2(dy, dx);
  const a = Math.acos((ua * ua + d * d - fa * fa) / (2 * ua * d));
  const upper = base + a;                   // elbow on the foot side
  const ex = sh[0] + Math.cos(upper) * ua, ey = sh[1] + Math.sin(upper) * ua;
  const fore = Math.atan2(hand[1] - ey, hand[0] - ex);
  return { upper, fore };
}

export function gym(ctx, t) {
  const dim = ramp(t, 29, 36);
  const push = ramp(t, 28, 44, easeInOut);
  ctx.save();
  const cx = lerp(960, 1330, push), cy = lerp(700, 600, push), z = lerp(1.18, 1.5, push);
  ctx.translate(960, lerp(700, 560, push)); ctx.scale(z, z); ctx.translate(-cx, -cy);
  gymRoom(ctx, t, dim);

  // rack uprights and the bench
  box(ctx, 740, 420, 18, GY - 420, '#1c1c20');
  box(ctx, 740, HOOK[1] + 6, 44, 10, '#2a2a30');
  box(ctx, 780, PAD, 400, 26, '#3a1f1f', 1, 8);
  box(ctx, 820, PAD + 26, 14, GY - PAD - 26, '#1c1c20');
  box(ctx, 1130, PAD + 26, 14, GY - PAD - 26, '#1c1c20');

  const bro = { skin: '#8a6450', hair: '#1a1411', top: '#1f2126', bottom: '#2d3444', shoes: '#141416' };
  const me = { skin: '#8a6450', hair: '#211a16', top: '#5a3f3a', bottom: '#2a2f3c', shoes: '#141416' };
  const bar = barPos(t);

  // ── the brother: lying, pressing, then sitting up ──
  const sitU = ramp(t, 14.2, 16.2, easeInOut);
  const hip = [950, PAD - 12];
  let broPose;
  if (sitU <= 0) {
    // world-space shoulder of a figure lying head-left: hip.x - torso
    const sh = [hip[0] - 50 * 0.9 * S * 1.0, hip[1] - 1.5 * S];
    const target = bar.racked >= 1 ? [lerp(bar.at[0], 870, ramp(t, 13.6, 14.2)), lerp(bar.at[1], 700, ramp(t, 13.6, 14.2))] : [bar.at[0], bar.at[1]];
    const { upper, fore } = armTo(sh, target, 29 * S, 26 * S + 4 * S);
    // world angle -> local (rot −π/2): local down = world +x, so θ = world angle measured from +x toward −y
    const toLocal = (wa) => Math.atan2(-Math.sin(wa), Math.cos(wa));
    const u1 = toLocal(upper), f1 = toLocal(fore);
    broPose = pose({ rot: -Math.PI / 2, lean: 0, neck: -0.15, s1: u1, e1: f1 - u1, s2: u1 - 0.05, e2: f1 - u1, h1: -0.25, k1: 1.3, h2: -0.4, k2: 1.15 });
  } else {
    const lie = pose({ rot: -Math.PI / 2, lean: 0, neck: -0.15, s1: 0.2, e1: 0.4, s2: 0.1, e2: 0.4, h1: -0.25, k1: 1.3, h2: -0.4, k2: 1.15 });
    const sit = pose({ rot: 0, lean: 0.12, neck: 0.05, s1: 0.55, e1: 0.9, s2: 0.45, e2: 0.9, h1: 1.45, k1: 1.45, h2: 1.35, k2: 1.35 });
    broPose = blend(lie, sit, sitU);
    if (t > 18.5) {
      const talk = win(t, 18.8, 29.5, 0.6, 1.2);
      broPose.s1 = lerp(broPose.s1, 0.95 + Math.sin(t * 2.4) * 0.12, talk);
      broPose.e1 = lerp(broPose.e1, 0.7 + Math.sin(t * 3.1) * 0.15, talk);
      broPose.neck = lerp(0.05, -0.05, talk);
    }
  }
  figure(ctx, 'brother', broPose, { x: hip[0] + 20 * sitU, y: hip[1] - (PAD - 12 - (PAD - 14 - 12)) * sitU, s: S, sleeves: 'short', colors: bro });
  // the bar and its plates, in front of him
  plates(ctx, bar.at[0], bar.at[1]);

  // ── him: spotting at the head of the bench, then around to face his brother ──
  const walkU = ramp(t, 14.4, 16.8, (k) => k);
  let x = 610, face = 1, mp;
  if (t < 14.4) {
    mp = pose({ ...P.stand(t, 5), lean: 0.3, neck: 0.3, s1: 1.25, e1: 0.35, s2: 1.15, e2: 0.4 });
    const talk = win(t, 2.8, 12.5, 0.5, 0.5);
    mp.neck = lerp(0.3, 0.15, talk) + Math.sin(t * 2.5) * 0.04 * talk;
    const bh = bar.at[1];
    mp.s1 = lerp(1.25, 1.0, clamp((bh - 590) / 150)); mp.s2 = mp.s1 - 0.08;
  } else if (walkU < 1) {
    x = lerp(610, 1340, smooth(walkU));
    face = walkU < 0.08 ? 1 : 1;
    mp = blend(P.walk(stride(x - 610, S)), P.stand(t, 5), ramp(t, 16.4, 16.8));
  } else {
    x = 1340; face = -1;
    mp = P.stand(t, 5);
    // the words land
    mp.neck = lerp(0.05, 0.4, ramp(t, 26, 31));
    mp.lean = lerp(0.01, 0.05, ramp(t, 26, 31));
  }
  if (walkU >= 1 || t < 14.4) {
    figure(ctx, 'man', mp, { x, ground: GY, s: S, face, colors: me });
  } else {
    // walking behind the bench end, then turning
    figure(ctx, 'man', mp, { x, ground: GY, s: S, face: 1, colors: me });
  }
  ctx.restore();

  // the room falls away and something older comes back
  if (dim > 0) {
    ctx.fillStyle = css('#000000', 0.45 * dim);
    ctx.fillRect(0, 0, W, H);
    const sx = 960 + (1340 - cx) * z, sy = lerp(700, 560, push) + (GY - 220 - cy) * z;
    glow(ctx, sx, sy, 520, '#ffcf8a', 0.18 * dim);
    STARS.draw(ctx, t, { alpha: 0.55 * ramp(t, 31, 40), dy: -700, big: 0.6 });
  }
  vignette(ctx, 0.6 + dim * 0.2);
}

// ─── that night ──────────────────────────────────────────────────────────

const FY = 900;
const MAJOR = 'Aerospace Engineering';

function kitchen(ctx, t, star) {
  vgrad(ctx, [[0, '#0e1222'], [1, '#161a2c']], 0, FY);
  // window with the night outside
  const wx = 1180, wy = 200, ww = 420, wh = 380;
  ctx.save();
  ctx.beginPath(); ctx.rect(wx, wy, ww, wh); ctx.clip();
  vgrad(ctx, [[0, '#050818'], [1, '#1a2248']], wy, wy + wh, wx, ww, wy, wy + wh);
  STARS.draw(ctx, t, { dx: -100, dy: -520, big: 0.7 });
  const flare = star;
  glow(ctx, wx + 290, wy + 110, 60 + 50 * flare, '#e8f0ff', 0.35 + 0.6 * flare);
  circle(ctx, wx + 290, wy + 110, 2.5 + flare * 1.5, '#ffffff');
  if (flare > 0.2) {
    ctx.fillStyle = css('#ffffff', 0.4 * flare);
    ctx.fillRect(wx + 290 - 50 * flare, wy + 109.5, 100 * flare, 1.2);
    ctx.fillRect(wx + 289.5, wy + 110 - 50 * flare, 1.2, 100 * flare);
  }
  ctx.fillStyle = '#070912';
  ctx.beginPath(); ctx.moveTo(wx, wy + wh); ctx.lineTo(wx, wy + wh - 60); ctx.lineTo(wx + 140, wy + wh - 90); ctx.lineTo(wx + 300, wy + wh - 50); ctx.lineTo(wx + ww, wy + wh - 70); ctx.lineTo(wx + ww, wy + wh); ctx.fill();
  ctx.restore();
  ctx.strokeStyle = css('#232842'); ctx.lineWidth = 16; ctx.strokeRect(wx - 8, wy - 8, ww + 16, wh + 16);
  line(ctx, wx + ww / 2, wy, wx + ww / 2, wy + wh, '#232842', 8);
  // cabinets, a fridge
  box(ctx, 80, 160, 520, 200, '#161a28');
  for (let i = 0; i < 3; i++) box(ctx, 90 + i * 172, 170, 160, 180, '#1b2030');
  box(ctx, 80, 620, 520, 280, '#161a28');
  box(ctx, 70, 600, 540, 20, '#232838');
  box(ctx, 1700, 280, 180, 620, '#1a1e2c');
  vgrad(ctx, [[0, '#0d0f18'], [1, '#07080d']], FY, H + 100);
}

function formScreen(ctx, t) {
  // the laptop screen, filling the frame
  box(ctx, 0, 0, W, H, '#07080c');
  const x0 = 170, y0 = 70, w = 1580, h = 900;
  box(ctx, x0 - 26, y0 - 26, w + 52, h + 52, '#14161b', 1, 30);
  box(ctx, x0, y0, w, h, '#f3f5f8', 1, 6);
  box(ctx, x0, y0, w, 90, '#1f3a64', 1, 6);
  box(ctx, x0, y0 + 60, w, 30, '#1f3a64');
  text(ctx, 'UNIVERSITY ADMISSIONS', x0 + 60, y0 + 58, { face: SANS, size: 28, spacing: 6, color: '#ffffff', align: 'left' });
  text(ctx, 'Undergraduate application · Step 4 of 4', x0 + 60, y0 + 160, { face: SANS, size: 30, color: '#1d2433', align: 'left', weight: 500 });
  // a completed progress bar
  box(ctx, x0 + 60, y0 + 190, 1460, 8, '#d8dde5', 1, 4);
  box(ctx, x0 + 60, y0 + 190, 1460, 8, '#2f7d4c', 1, 4);
  const field = (label, value, y, caret) => {
    text(ctx, label, x0 + 60, y, { face: SANS, size: 24, color: '#5a6272', align: 'left' });
    box(ctx, x0 + 60, y + 18, 900, 74, '#ffffff', 1, 8);
    ctx.strokeStyle = css(caret ? '#2f6bd8' : '#c9d0da'); ctx.lineWidth = caret ? 3 : 2;
    ctx.beginPath(); rrect(ctx, x0 + 60, y + 18, 900, 74, 8); ctx.stroke();
    text(ctx, value, x0 + 88, y + 67, { face: SANS, size: 32, color: '#141a26', align: 'left' });
    if (caret && Math.floor(t * 2) % 2 === 0) {
      ctx.font = `400 32px ${SANS}`;
      const cw = ctx.measureText(value).width;
      box(ctx, x0 + 92 + cw, y + 36, 3, 40, '#141a26');
    }
  };
  const typed = MAJOR.slice(0, Math.floor(clamp((t - 8.6) / 2.4) * MAJOR.length));
  field('Intended major', typed, y0 + 290, t < 11.6);
  field('Starting term', 'Fall', y0 + 430, false);
  // certification
  const checked = t > 12.1;
  box(ctx, x0 + 60, y0 + 580, 36, 36, checked ? '#2f6bd8' : '#ffffff', 1, 6);
  if (!checked) { ctx.strokeStyle = '#9aa3b2'; ctx.lineWidth = 2; ctx.beginPath(); rrect(ctx, x0 + 60, y0 + 580, 36, 36, 6); ctx.stroke(); }
  else { ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(x0 + 68, y0 + 598); ctx.lineTo(x0 + 76, y0 + 607); ctx.lineTo(x0 + 89, y0 + 588); ctx.stroke(); }
  text(ctx, 'I certify that everything in this application is true.', x0 + 116, y0 + 608, { face: SANS, size: 26, color: '#2a3140', align: 'left' });
  // the button
  const done = t > 13.4;
  const pressed = win(t, 13.05, 13.4, 0.05, 0.1);
  const bx = x0 + 60, by = y0 + 690, bw = 420, bh = 90;
  box(ctx, bx, by + pressed * 3, bw, bh, done ? '#2f7d4c' : mix('#2f6bd8', '#1d4ba8', pressed), 1, 12);
  text(ctx, done ? 'Submitted' : 'Submit application', bx + bw / 2, by + 58 + pressed * 3, { face: SANS, size: 30, color: '#ffffff', weight: 500 });
  if (done) {
    const k = ramp(t, 13.4, 14);
    circle(ctx, bx + bw + 70, by + 45, 34 * easeOut(k), '#2f7d4c');
    ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 6;
    ctx.beginPath(); ctx.moveTo(bx + bw + 54, by + 46); ctx.lineTo(bx + bw + 66, by + 58); ctx.lineTo(bx + bw + 88, by + 32); ctx.globalAlpha = k; ctx.stroke(); ctx.globalAlpha = 1;
    text(ctx, 'Your application has been received.', bx + bw + 130, by + 56, { face: SANS, size: 28, color: '#2f7d4c', align: 'left', alpha: k });
  }
  // the cursor
  const cxp = keys(t, [[8, [1400, 900]], [11.8, [1400, 900]], [12.1, [x0 + 78, y0 + 598]], [12.4, [x0 + 78, y0 + 598]], [13.0, [bx + 260, by + 50]]], easeInOut);
  ctx.save();
  ctx.translate(cxp[0], cxp[1]);
  ctx.fillStyle = '#111'; ctx.strokeStyle = '#fff'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, 34); ctx.lineTo(9, 26); ctx.lineTo(16, 40); ctx.lineTo(22, 37); ctx.lineTo(15, 23); ctx.lineTo(26, 22); ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.restore();
  vignette(ctx, 0.25);
}

export function apply(ctx, t) {
  const close = win(t, 8.2, 16.6, 0.7, 0.8);
  const star = win(t, 18.5, 24, 1.5, 2);
  if (close < 1) {
    kitchen(ctx, t, star);
    // the table
    box(ctx, 700, 700, 560, 18, '#2a2230');
    box(ctx, 730, 718, 16, FY - 718, '#1e1824');
    box(ctx, 1214, 718, 16, FY - 718, '#1e1824');
    // him, typing — later leaning back, hands behind his head, looking out
    const back = ramp(t, 16.8, 18.6, easeInOut);
    const type = Math.sin(t * 16) * 0.05 * (1 - back);
    const sitP = pose({ ...P.sit(t, 3), lean: lerp(0.2, -0.22, back), neck: lerp(0.3, -0.3, back), s1: lerp(0.85, 2.75, back) + type, e1: lerp(0.95, 2.4, back), s2: lerp(0.8, 2.62, back) - type, e2: lerp(1.0, 2.5, back) });
    box(ctx, 520, 730, 150, 14, '#1c1622');
    box(ctx, 528, 744, 12, FY - 744, '#161219'); box(ctx, 650, 744, 12, FY - 744, '#161219');
    box(ctx, 505, 480, 16, 264, '#1c1622', 1, 4);
    figure(ctx, 'man', sitP, { x: 600, ground: FY, s: 2.0, colors: { skin: '#7c7a92', hair: '#15141c', top: '#2c3246', bottom: '#20263a', shoes: '#101118' } });
    laptop(ctx, 900, 700, { s: 1.5, face: 1, glowC: '#c4d6ff', glowA: 0.7 });
    glow(ctx, 780, 600, 300, '#a8c0ff', 0.12);
  }
  if (close > 0) layer(ctx, close, (g) => formScreen(g, t));
  vignette(ctx, 0.55);
}
