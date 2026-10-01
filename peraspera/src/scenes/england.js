// II. England — a terraced street in the rain, a door that opens, and then a
// street where every door stays shut.

import { W, H, TAU, clamp, lerp, smooth, ramp, win, keys, hash, noise1, css, mix, easeInOut } from '../kit.js';
import { vgrad, glow, rain, splashes, box, circle, line, radial, vignette, layer, rrect } from '../paint.js';
import { figure, P, pose, blend, stride } from '../figure.js';
import { streetlamp, suitcase } from '../props.js';

const GY = 860;          // pavement
const KERB = 905;
const U = 540;           // one house
const S = 1.2;           // figure scale

const MISSIONARY = { skin: '#9b837a', hair: '#1e1a1a', top: '#cdd5df', bottom: '#1c2029', shoes: '#0e0f12' };

function sky(ctx, t, dark) {
  vgrad(ctx, [[0, mix('#343f52', '#1c2230', dark)], [0.7, mix('#5d6879', '#343b4a', dark)], [1, mix('#747d8c', '#454b58', dark)]], 0, GY - 300);
  // slow low cloud
  for (let i = 0; i < 9; i++) {
    const x = ((hash(i, 21) * 2600 + t * (8 + hash(i, 22) * 10)) % 2600) - 340;
    const y = 40 + hash(i, 23) * 200;
    radial(ctx, x, y, 260 + hash(i, 24) * 200, [[0, mix('#28303f', '#141922', dark), 0.35], [1, '#28303f', 0]]);
  }
}

function terrace(ctx, t, camX, lights, rainbows) {
  const first = Math.floor((camX - 300) / U), last = Math.floor((camX + W + 300) / U);
  for (let k = first; k <= last; k++) {
    const x = k * U - camX;
    const brick = mix('#5c3a33', '#4a3230', hash(k, 3) * 0.5);
    // walls
    box(ctx, x, 150, U, GY - 150, brick);
    // brick courses, faintly
    ctx.save();
    ctx.strokeStyle = css('#2c1c1a', 0.22); ctx.lineWidth = 1;
    ctx.beginPath();
    for (let y = 160; y < GY; y += 14) { ctx.moveTo(x, y); ctx.lineTo(x + U, y); }
    ctx.stroke();
    ctx.restore();
    // roof and chimney
    box(ctx, x - 2, 150, U + 4, 64, '#252a35');
    box(ctx, x - 2, 206, U + 4, 10, '#1d212a');
    if (k % 2 === 0) {
      box(ctx, x - 40, 58, 80, 96, mix(brick, '#000', 0.15));
      for (let p = 0; p < 3; p++) box(ctx, x - 30 + p * 22, 38, 14, 22, '#6a4a3a');
    }
    // party wall pilaster
    box(ctx, x - 6, 216, 12, GY - 216, mix(brick, '#000', 0.2));
    // upstairs sashes
    const winLit = (i) => lights[((k * 3 + i) % lights.length + lights.length) % lights.length];
    for (const [wx, i] of [[60, 0], [330, 1]]) {
      const lit = winLit(i);
      box(ctx, x + wx - 8, 282, 140, 196, '#e4e0d6');
      box(ctx, x + wx, 290, 124, 180, mix('#1b2130', '#ffc978', lit * 0.85));
      line(ctx, x + wx, 380, x + wx + 124, 380, '#e4e0d6', 6);
      line(ctx, x + wx + 62, 290, x + wx + 62, 470, '#e4e0d6', 3);
      box(ctx, x + wx - 14, 478, 152, 10, '#d8d4ca');
      if (lit > 0.05) glow(ctx, x + wx + 62, 380, 180, '#ffb85a', 0.22 * lit);
    }
    // the bay window
    const litB = winLit(2);
    box(ctx, x + 40, 575, 230, 12, '#d8d4ca');
    box(ctx, x + 44, 587, 222, 245, '#e4e0d6');
    box(ctx, x + 52, 597, 206, 225, mix('#1a202c', '#ffcb80', litB * 0.9));
    for (const px of [102, 208]) box(ctx, x + px - 4, 597, 8, 225, '#e4e0d6');
    box(ctx, x + 52, 700, 206, 6, '#e4e0d6');
    box(ctx, x + 36, 832, 238, 14, '#d0ccc2');
    if (litB > 0.05) {
      glow(ctx, x + 155, 710, 260, '#ffb85a', 0.25 * litB);
      // curtains, drawn back
      box(ctx, x + 52, 597, 26, 225, '#7a3a2a', litB * 0.8);
      box(ctx, x + 232, 597, 26, 225, '#7a3a2a', litB * 0.8);
    }
    const rb = rainbows(k);
    if (rb > 0) {
      // a child's rainbow taped to the glass
      box(ctx, x + 120, 610, 74, 58, '#efece4', rb);
      const cols = ['#e2463a', '#f29a2e', '#f2d03a', '#58b04a', '#3a7ad0', '#7a4ab0'];
      ctx.save(); ctx.globalAlpha = rb; ctx.lineWidth = 4;
      cols.forEach((c, j) => { ctx.strokeStyle = c; ctx.beginPath(); ctx.arc(x + 157, 656, 26 - j * 4, Math.PI, TAU); ctx.stroke(); });
      ctx.restore();
    }
  }
}

function door(ctx, x, open, warm, color) {
  // x = world-to-screen x of the door's left edge
  box(ctx, x - 14, 548, 138, 316, '#e4e0d6');
  ctx.fillStyle = css('#e4e0d6');
  ctx.beginPath(); ctx.arc(x + 55, 560, 69, Math.PI, TAU); ctx.fill();
  ctx.fillStyle = css(mix('#1a202c', '#ffcb80', warm * 0.8));
  ctx.beginPath(); ctx.arc(x + 55, 560, 55, Math.PI, TAU); ctx.fill();
  box(ctx, x, 560, 110, 300, mix('#1a1410', '#ffc36e', warm));
  if (warm > 0.02) {
    glow(ctx, x + 55, 720, 380, '#ffb557', 0.5 * warm);
  }
  // the door leaf swinging inward shows as a narrowing panel
  const w = 110 * (1 - open * 0.82);
  box(ctx, x + 110 - w, 560, w, 300, color);
  if (open < 0.5) {
    box(ctx, x + 110 - w + w * 0.15, 590, w * 0.7, 100, mix(color, '#000', 0.2));
    box(ctx, x + 110 - w + w * 0.15, 720, w * 0.7, 110, mix(color, '#000', 0.2));
    circle(ctx, x + 110 - w + w * 0.12, 720, 4, '#caa45a');
  }
  box(ctx, x - 20, 856, 150, 12, '#9a968e');
}

function umbrella(ctx, hx, hy, top, open = 1) {
  const cx = hx + 4, cy = top;
  line(ctx, hx, hy + 6, cx, cy, '#0c0d10', 3);
  ctx.fillStyle = css('#0c0d10');
  ctx.beginPath();
  const r = 78 * open;
  ctx.moveTo(cx - r, cy + 14);
  ctx.quadraticCurveTo(cx - r * 0.9, cy - 40, cx, cy - 44);
  ctx.quadraticCurveTo(cx + r * 0.9, cy - 40, cx + r, cy + 14);
  for (let i = 4; i >= 0; i--) {
    const xa = cx - r + (i + 1) * (2 * r) / 5, xb = cx - r + i * (2 * r) / 5;
    ctx.quadraticCurveTo((xa + xb) / 2, cy + 2, xb, cy + 14);
  }
  ctx.closePath();
  ctx.fill();
  line(ctx, cx, cy - 44, cx, cy - 54, '#0c0d10', 3);
}

function missionary(ctx, t, x, pz, o = {}) {
  const J = figure(ctx, 'man', pz, { x, ground: GY, s: S, colors: MISSIONARY, tie: o.tie, tag: '#0a0a0a', view: o.view, back: o.back, face: o.face ?? 1, alpha: o.alpha });
  return J;
}

function bus(ctx, x) {
  // a double-decker going left, 1300 px long, ground at y 1010
  const y = 1012;
  ctx.save();
  box(ctx, x, y - 530, 1300, 500, '#a8231c', 1, 26);
  box(ctx, x, y - 280, 1300, 14, '#7a1712');
  for (const row of [0, 1]) {
    const wy = row ? y - 500 : y - 262;
    box(ctx, x + 40, wy, 1220, 150, '#2a2622');
    for (let i = 0; i < 9; i++) {
      box(ctx, x + 50 + i * 135, wy + 10, 122, 130, '#e8cf94', 0.85);
      if (hash(i + row * 9, 77) > 0.4) {
        circle(ctx, x + 110 + i * 135 + (hash(i, 78) - 0.5) * 40, wy + 70, 18, '#3a2e26');
        box(ctx, x + 88 + i * 135 + (hash(i, 78) - 0.5) * 40, wy + 88, 44, 52, '#3a2e26');
      }
    }
  }
  box(ctx, x + 30, y - 522, 260, 22, '#111');
  for (const wx of [200, 1030]) { circle(ctx, x + wx, y - 30, 58, '#101114'); circle(ctx, x + wx, y - 30, 26, '#444'); }
  ctx.restore();
}

export function england(ctx, t) {
  const dark = ramp(t, 24, 34);
  const camX = keys(t, [[0, 0], [16, 620], [24, 660], [34, 700], [48, 520]], easeInOut);
  const zoom = keys(t, [[0, 1.22], [15, 1.32], [24, 1.38], [33, 1.06], [48, 1.0]], easeInOut);
  const zx = keys(t, [[0, 760], [15, 900], [24, 940], [33, 960]], easeInOut);
  ctx.save();
  ctx.translate(zx, GY); ctx.scale(zoom, zoom); ctx.translate(-zx, -GY);
  sky(ctx, t, dark);

  // who is home: windows go dark one by one after the lockdown line
  const lights = [];
  for (let i = 0; i < 12; i++) {
    const base = hash(i, 41) > 0.35 ? 1 : 0;
    const off = 25.5 + hash(i, 42) * 6;
    lights.push(base * (1 - ramp(t, off, off + 0.4)) + (i === 4 ? 0.25 * ramp(t, 32, 34) : 0));
  }
  const rainbows = (k) => (k === 1 || k === 3 || k === 6 ? ramp(t, 27 + k * 0.6, 28.5 + k * 0.6) : 0);
  terrace(ctx, t, camX, lights, rainbows);

  // the door they knock on
  const DOORX = 2 * U + 330;
  const open1 = win(t, 17.8, 24.4, 0.6, 0.5);
  const open2 = win(t, 34.2, 36.4, 0.4, 0.5);
  const opn = Math.max(open1, open2);
  door(ctx, DOORX - camX, opn, opn, '#23385a');

  // pavement, kerb, road
  vgrad(ctx, [[0, '#4a505a'], [1, '#3a3f48']], GY, KERB);
  box(ctx, -2, KERB - 4, W + 4, 10, '#5d626b');
  vgrad(ctx, [[0, '#23272e'], [1, '#15181d']], KERB + 6, H);
  // wet reflections on the road
  for (let k = -2; k < 8; k++) {
    const lx = k * 900 + 249 - camX;
    if (lx < -300 || lx > W + 300) continue;
    ctx.save();
    ctx.translate(lx + Math.sin(t * 2.3 + k) * 4, KERB + 10);
    ctx.scale(1, 5);
    radial(ctx, 0, 0, 34, [[0, '#ffc66e', 0.2], [1, '#ffc66e', 0]]);
    ctx.restore();
  }
  if (opn > 0.05) {
    // doorlight on the wet pavement
    ctx.fillStyle = css('#ffb557', 0.28 * opn);
    ctx.beginPath();
    const dx = DOORX - camX;
    ctx.moveTo(dx, GY); ctx.lineTo(dx + 110, GY); ctx.lineTo(dx + 190, KERB); ctx.lineTo(dx - 80, KERB); ctx.fill();
  }

  // streetlamps
  for (let k = -1; k < 5; k++) streetlamp(ctx, k * 900 + 200 - camX, GY + 8, { h: 470 });

  // ── the two of them ──
  if (t < 24.5) {
    const walkEnd = 15.4;
    const u = clamp(t / walkEnd);
    const dist = 1010 * u;                      // world px walked
    const xHim = 470 + dist, xComp = 340 + dist;
    const turn = ramp(t, 15.4, 16);
    const entering = ramp(t, 20.6, 23.6);
    let pzH, pzC, view = 'side', back = false;
    if (t < 15.4) {
      pzH = P.walk(stride(dist, S) + 0.1); pzC = P.walk(stride(dist, S) + 0.6);
      pzH.s1 = 0.5 + Math.sin(t * 5) * 0.03; pzH.e1 = 1.45;
      pzC.s1 = 0.5 + Math.sin(t * 5 + 1) * 0.03; pzC.e1 = 1.45;
    } else {
      view = 'front'; back = true;
      pzH = pose({ s1: 0.3, e1: 1.1, s2: 0.1, e2: 0.2, h1: 0.04, h2: 0.04 });
      pzC = pose({ s1: 0.3, e1: 1.1, s2: 0.1, e2: 0.2, h1: 0.04, h2: 0.04 });
      // he knocks
      const kn = win(t, 16.2, 17.4, 0.25, 0.3);
      pzH.s2 = lerp(0.1, 0.5, kn); pzH.e2 = lerp(0.2, 2.6, kn) + Math.sin(t * 22) * 0.12 * kn;
      // umbrellas come down as the door opens
    }
    const alpha = 1 - entering;
    const drawOne = (x0, pz, tie, delay) => {
      let x = x0;
      if (view === 'front') x = x0 + lerp(0, DOORX + 55 - x0, ramp(t, 20.6 + delay, 23.4 + delay));
      const sx = x - camX;
      layer(ctx, alpha, (g) => {
        const J = figure(g, 'man', pz, { x: sx, ground: GY - (view === 'front' ? 8 * ramp(t, 20.6 + delay, 23.6 + delay) : 0), s: S * (view === 'front' ? 1 - 0.06 * ramp(t, 20.6 + delay, 23.6 + delay) : 1), colors: MISSIONARY, tie, tag: '#0a0a0a', view, back });
        const shut = ramp(t, 18.3, 19.2);
        if (view === 'side') umbrella(g, J.hand1[0], J.hand1[1], J.head[1] - 34);
        else if (shut < 1) umbrella(g, J.hand1[0] - 4, J.hand1[1], J.head[1] - 34, 1 - shut * 0.9);
        else line(g, J.hand1[0], J.hand1[1], J.hand1[0] + 6, J.hand1[1] + 70, '#0c0d10', 5);
      });
    };
    drawOne(xComp, pzC, '#6d2a2a', 0.5);
    drawOne(xHim, pzH, '#2a4a8a', 0);
    // the person at the door
    if (open1 > 0.1) {
      const dx = DOORX - camX;
      figure(ctx, 'woman', pose({ s1: 0.2, e1: 0.4, s2: 0.2, e2: 0.4 }), { x: dx + 58, ground: GY - 4, s: S * 0.97, view: 'front', sil: '#2a1a12', alpha: clamp(open1 * 1.5) * (1 - ramp(t, 22.5, 24)) });
    }
  }

  // ── going home: one missionary, one suitcase, an empty street ──
  if (t > 34.4) {
    const u = ramp(t, 35, 47.5, (k) => k);
    const x0 = DOORX + 30;
    const walkT = t < 40 ? u : u;
    const paused = win(t, 40.2, 42.8, 0.4, 0.5);
    const dist = 900 * walkT - 60 * paused;
    const x = x0 - dist - camX;
    let pz = blend(P.walk(stride(dist, S)), P.stand(t, 2), paused);
    pz.s1 = 0.5; pz.e1 = 1.45;
    const face = paused > 0.5 ? 1 : -1;
    const J = figure(ctx, 'man', pz, { x, ground: GY, s: S, face, colors: MISSIONARY, tie: '#2a4a8a', tag: '#0a0a0a', alpha: ramp(t, 34.4, 35.2) });
    umbrella(ctx, J.hand1[0], J.hand1[1], J.head[1] - 34);
    // suitcase trails behind in the other hand
    const sx = J.hand2[0] + (face > 0 ? -34 : 34);
    ctx.save();
    ctx.translate(sx, GY);
    ctx.rotate(face > 0 ? 0.12 : -0.12);
    suitcase(ctx, 0, 0, { s: 1.35, handle: 0.8 });
    ctx.restore();
  }

  // a plane climbing away above the cloud
  if (t > 36.5) {
    const u = ramp(t, 36.5, 47.5, (k) => k);
    const px = lerp(260, 1700, u), py = lerp(210, 90, u);
    circle(ctx, px, py, 2, '#c8ccd4', 0.8);
    if ((t * 1.3) % 1 < 0.12) glow(ctx, px, py, 18, '#ffffff', 0.9);
    if ((t * 1.1 + 0.5) % 1 < 0.5) circle(ctx, px + 3, py + 2, 1.8, '#ff4030', 0.9);
  }

  // the bus goes by, filling the frame for a moment
  const bu = (t - 8.2) / 1.6;
  if (bu > 0 && bu < 1) {
    const bx = lerp(W + 100, -1500, bu);
    layer(ctx, 0.35, (g) => bus(g, bx + 70));
    bus(ctx, bx);
  }

  ctx.restore();
  rain(ctx, t, { n: Math.round(lerp(420, 700, dark)), a: lerp(0.3, 0.38, dark), color: '#b8c6d8', angle: 0.14, speed: 1500 });
  splashes(ctx, t, { n: 60, y0: GY, y1: H, color: '#c8d4e2', a: 0.35 });
  vgrad(ctx, [[0, '#0a0d14', 0], [1, '#0a0d14', 0.55]], 0, H);
  vignette(ctx, 0.65);
  // the whole street cools and dims as the lockdown settles in
  ctx.fillStyle = css('#0a1020', 0.28 * dark);
  ctx.fillRect(0, 0, W, H);
}
