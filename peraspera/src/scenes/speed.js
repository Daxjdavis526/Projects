// IV. Speed — a pseudo-3D chase behind his bike through a circuit at golden
// hour, the flag, and a podium.

import { W, H, TAU, clamp, lerp, smooth, ramp, win, keys, hash, noise1, fbm1, css, mix, easeInOut, easeOut } from '../kit.js';
import { vgrad, glow, sparks, box, circle, line, radial, vignette, layer, flakes, hills, rrect } from '../paint.js';
import { figure, P, pose, blend, stride } from '../figure.js';
import { bikeRear } from '../props.js';

// ─── the circuit ─────────────────────────────────────────────────────────

const SEG = 200;              // world units per road segment
const RW = 2000;              // road half-width
const DEPTH = 0.84;           // camera depth (1 / tan(fov/2))
const CAM_H = 640;
const AHEAD = 620;            // the player's bike, in front of the camera
const HORIZON = 470;
const N = 240;                // segments drawn

// Centreline lateral offset and elevation as functions of distance.
const X = (z) => 26000 * Math.sin(z / 19000) + 9000 * Math.sin(z / 7000 + 1.3);
const dX = (z) => (26000 / 19000) * Math.cos(z / 19000) + (9000 / 7000) * Math.cos(z / 7000 + 1.3);
const ddX = (z) => -(26000 / 19000 ** 2) * Math.sin(z / 19000) - (9000 / 7000 ** 2) * Math.sin(z / 7000 + 1.3);
const Y = (z) => 300 * Math.sin(z / 15000) + 120 * Math.sin(z / 5000);

const V = 6200;
function dist(t) {
  if (t < 38.2) return V * t;
  const u = t - 38.2;
  return V * 38.2 + V * u - 0.5 * 700 * u * u;
}
const speedAt = (t) => (t < 38.2 ? V : Math.max(1800, V - 700 * (t - 38.2)));
const FINISH = dist(37.6) + AHEAD;

// the others on track: [start ahead, speed, lateral, colours, helmet]
const RIVALS = [
  [2600, 5650, -700, '#d8262c', '#1a1a1a', '#f2f2f2'],
  [5200, 5700, 650, '#1f8a4c', '#f0f0f0', '#1f8a4c'],
  [9800, 5800, -300, '#ffb000', '#1a1a1a', '#1a1a1a'],
  // his friend — orange — comes alongside for a while
  [16800, 5780, 520, '#f07a1a', '#20242e', '#f07a1a'],
  [22000, 5750, -600, '#7a3ad0', '#f2f2f2', '#7a3ad0'],
];

function bgSky(ctx, heading) {
  vgrad(ctx, [[0, '#5a78b0'], [0.55, '#d59a78'], [1, '#f6c27c']], -200, HORIZON + 20, -500, W + 1000, -600, HORIZON + 40);
  const sx = 1380 - heading * 900;
  glow(ctx, sx, HORIZON - 70, 700, '#ffd08a', 0.5);
  glow(ctx, sx, HORIZON - 70, 90, '#fff6dc', 0.9);
  for (let i = 0; i < 7; i++) {
    const cx = ((hash(i, 3) * 3000 - heading * 400) % 3000 + 3000) % 3000 - 500;
    radial(ctx, cx, 120 + hash(i, 4) * 170, 240, [[0, '#ffe0c0', 0.35], [1, '#ffe0c0', 0]]);
  }
  const off = -heading * 1400;
  hills(ctx, (x) => HORIZON + 10 - 150 * (0.5 + 0.5 * fbm1((x - off) * 0.0014, 51, 5)), '#9a7e8e', 1, -500, W + 500, HORIZON + 60);
  hills(ctx, (x) => HORIZON + 14 - 70 * (0.5 + 0.5 * fbm1((x - off * 1.5) * 0.0026, 52, 4)), '#6e6a64', 1, -500, W + 500, HORIZON + 60);
}

// ext pushes the far edge further away. The road reaches over the seam with
// the strip beyond it; the layers under the road stop short, so nothing pale
// can show through the anti-aliased edge as a line across the tarmac.
function quad(ctx, x1, y1, w1, x2, y2, w2, color, ext = 0) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(x1 - w1, y1); ctx.lineTo(x2 - w2, y2 - ext); ctx.lineTo(x2 + w2, y2 - ext); ctx.lineTo(x1 + w1, y1);
  ctx.closePath(); ctx.fill();
}

function standSprite(ctx, x, y, sc, side, t, k) {
  // a grandstand block full of people
  const w = 2600 * sc, h = 900 * sc;
  box(ctx, x - w / 2, y - h, w, h, '#4a4348');
  box(ctx, x - w / 2 - 20 * sc, y - h - 60 * sc, w + 40 * sc, 70 * sc, '#2e2a2e');
  const rows = 6, cols = 26;
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
    const hx = x - w / 2 + (c + 0.5) * (w / cols), hy = y - h + (r + 0.6) * (h / rows) - Math.abs(Math.sin(t * 6 + c + r * 3)) * 18 * sc * (hash(c * 7 + r + k, 9) > 0.6 ? 1 : 0);
    ctx.fillStyle = css(['#e8d0b8', '#3a4a6a', '#c83a2a', '#f0f0f0', '#2a2a2a'][(c + r * 3 + k) % 5]);
    ctx.fillRect(hx - 30 * sc, hy, 60 * sc, 70 * sc);
  }
}

export function track(ctx, t) {
  const cz = dist(t);
  const v = speedAt(t);
  const heading = Math.atan(dX(cz + AHEAD) * 0.02);
  const curv = ddX(cz + AHEAD + 1500);
  const lean = clamp(curv * v * v * 9e-5, -0.95, 0.95) * (t < 38.2 ? 1 : 1 - ramp(t, 38.2, 40));
  const lat = clamp(curv * 2.2e6, -500, 500) + 60 * noise1(t * 0.5, 7);
  const camX = lat, camY = Y(cz) + CAM_H;
  const base = X(cz), slope = dX(cz);

  ctx.save();
  // the camera rolls a little with the bike
  ctx.translate(W / 2, H); ctx.rotate(-lean * 0.14); ctx.translate(-W / 2, -H);
  bgSky(ctx, heading);

  // project the next N segments
  const first = Math.floor(cz / SEG);
  const P1 = [];
  for (let n = 0; n <= N; n++) {
    const z = (first + n) * SEG;
    const rz = z - cz;
    if (rz < 10) { P1.push(null); continue; }
    const sc = DEPTH / rz;
    const rx = X(z) - base - slope * rz - camX;
    const ry = Y(z) - camY;
    P1.push({ x: W / 2 + sc * rx * (W / 2), y: HORIZON - sc * ry * (W / 2) * 0.62, w: sc * RW * (W / 2), sc, z, i: first + n });
  }
  // sprites waiting to be drawn in depth order
  let maxY = H + 400;
  const drawList = [];
  for (let n = N - 1; n >= 0; n--) {
    const a = P1[n], b = P1[n + 1];
    if (!a || !b) continue;
    if (b.y >= a.y) continue;   // hidden behind a crest
    const band = Math.floor(a.i / 3) % 2;
    const fog = clamp((n - 60) / (N - 60)) ** 1.2;
    const F = (c) => css(mix(c, '#d8a882', fog * 0.85));
    quad(ctx, a.x, a.y, a.w * 8, b.x, b.y, b.w * 8, F(band ? '#5e7a3a' : '#56713a'), 1.2);
    // gravel trap
    quad(ctx, a.x, a.y, a.w * 1.9, b.x, b.y, b.w * 1.9, F(band ? '#c9b58e' : '#c2ad86'), 0.8);
    quad(ctx, a.x, a.y, a.w * 1.22, b.x, b.y, b.w * 1.22, F(band ? '#d4302a' : '#f4f1ea'), 0.4);
    quad(ctx, a.x, a.y, a.w, b.x, b.y, b.w, F(band ? '#4a4a50' : '#47474d'), 1.2);
    // white edge lines
    const eL = a.w * 0.96, eL2 = b.w * 0.96;
    ctx.fillStyle = F('#e8e4dc');
    ctx.beginPath(); ctx.moveTo(a.x - a.w, a.y); ctx.lineTo(b.x - b.w, b.y); ctx.lineTo(b.x - eL2, b.y); ctx.lineTo(a.x - eL, a.y); ctx.fill();
    ctx.beginPath(); ctx.moveTo(a.x + a.w, a.y); ctx.lineTo(b.x + b.w, b.y); ctx.lineTo(b.x + eL2, b.y); ctx.lineTo(a.x + eL, a.y); ctx.fill();
    // chequered finish line
    if (a.z <= FINISH && b.z > FINISH) {
      for (let r = 0; r < 2; r++) for (let c = 0; c < 16; c++) {
        const u0 = -1 + c / 8, u1 = -1 + (c + 1) / 8;
        const yy0 = lerp(a.y, b.y, r / 2), yy1 = lerp(a.y, b.y, (r + 1) / 2);
        const xx0 = lerp(a.x, b.x, r / 2), ww0 = lerp(a.w, b.w, r / 2), xx1 = lerp(a.x, b.x, (r + 1) / 2), ww1 = lerp(a.w, b.w, (r + 1) / 2);
        ctx.fillStyle = (c + r) % 2 ? '#111' : '#f4f4f4';
        ctx.beginPath();
        ctx.moveTo(xx0 + u0 * ww0, yy0); ctx.lineTo(xx0 + u1 * ww0, yy0); ctx.lineTo(xx1 + u1 * ww1, yy1); ctx.lineTo(xx1 + u0 * ww1, yy1); ctx.fill();
      }
      // gantry
      const gw = a.w * 1.4, gh = 2600 * a.sc * (W / 2) / 1000 * 0.9;
      box(ctx, a.x - gw, a.y - gh, 40 * a.sc * 400, gh, '#26262a');
      box(ctx, a.x + gw - 40 * a.sc * 400, a.y - gh, 40 * a.sc * 400, gh, '#26262a');
      box(ctx, a.x - gw, a.y - gh, gw * 2, gh * 0.12, '#1b1b1f');
      for (let c = 0; c < 20; c++) box(ctx, a.x - gw + c * gw / 10, a.y - gh + gh * 0.02, gw / 20, gh * 0.08, c % 2 ? '#111' : '#eee');
    }
    // roadside things for this segment
    const i = a.i;
    const s = a.sc * (W / 2);
    const gs = Math.floor(i / 180);
    if (i % 180 > 120 && i % 180 < 150 && i % 6 === 0) {
      const side = gs % 2 ? 1 : -1;
      standSprite(ctx, a.x + side * a.w * 3.2, a.y, s / 900 * 1.1, side, t, i);
    }
    if (i % 14 === 0) {
      // advertising boards on both sides
      for (const side of [-1, 1]) {
        const bx = a.x + side * a.w * 1.35, bh = 170 * s / 900, bw = 900 * s / 900;
        box(ctx, bx - bw / 2, a.y - bh, bw, bh, ['#1b4aa0', '#e8e8e8', '#c8302a', '#111'][(i / 14 + (side > 0 ? 1 : 0)) % 4]);
        box(ctx, bx - bw * 0.3, a.y - bh * 0.62, bw * 0.6, bh * 0.25, ['#f0f0f0', '#c8302a', '#f0f0f0', '#f6c000'][(i / 14 + (side > 0 ? 1 : 0)) % 4]);
      }
    }
    if (i % 23 === 7) {
      // trees beyond the run-off
      const side = hash(i, 5) > 0.5 ? 1 : -1;
      const tx = a.x + side * a.w * (2.6 + hash(i, 6) * 2);
      const th = 2200 * s / 900;
      box(ctx, tx - th * 0.03, a.y - th * 0.45, th * 0.06, th * 0.45, F('#3a2e24'));
      circle(ctx, tx, a.y - th * 0.62, th * 0.28, F('#3e5a2e'));
      circle(ctx, tx - th * 0.12, a.y - th * 0.5, th * 0.2, F('#35502a'));
    }
    if (a.z <= FINISH + SEG * 2 && b.z > FINISH + SEG * 2) {
      // a marshal waving the chequered flag
      const mx = a.x + a.w * 1.5, ms = s / 900 * 1.6;
      const wave = Math.sin(t * 8) * 0.6;
      figure(ctx, 'man', pose({ s1: 2.6 + wave * 0.3, e1: 0.2 }), { x: mx, ground: a.y, s: ms * 1.4, view: 'front', sil: '#1c1c20' });
      ctx.save();
      ctx.translate(mx + 20 * ms, a.y - 280 * ms);
      ctx.rotate(wave * 0.5);
      for (let r = 0; r < 4; r++) for (let c = 0; c < 6; c++) box(ctx, c * 18 * ms, -r * 18 * ms, 18 * ms, 18 * ms, (r + c) % 2 ? '#111' : '#f6f6f6');
      ctx.restore();
    }
    // rival bikes on this segment
    for (let k = 0; k < RIVALS.length; k++) {
      const [z0, vk, lx, col, lea, hel] = RIVALS[k];
      let rz = z0 + vk * t;
      if (k === 3) rz = z0 + vk * t + 2400 * smooth((t - 17) / 5) - 3000 * ramp(t, 27, 33);   // alongside, then gone
      if (rz >= a.z && rz < a.z + SEG) {
        const k2 = (rz - a.z) / SEG;
        const bxp = lerp(a.x, b.x, k2) + lx * a.sc * (W / 2) + 90 * a.sc * (W / 2) * noise1(t * 0.7 + k, k);
        const byp = lerp(a.y, b.y, k2);
        const rl = clamp(ddX(rz) * vk * vk * 9e-5, -0.9, 0.9);
        bikeRear(ctx, bxp, byp, { s: a.sc * (W / 2) * 1.19, lean: rl, color: col, accent: '#1a1a1a', leathers: lea, helmet: hel, star: false });
      }
    }
  }

  // ── him ──
  const bob = Math.sin(t * 17) * 1.2;
  const px = W / 2 + 18 * noise1(t * 0.8, 3), py = 1000 + bob;
  const sit = ramp(t, 39.5, 41);
  if (sit < 0.5) bikeRear(ctx, px, py, { s: 1.6, lean, color: '#eef1f6', accent: '#2255cc', leathers: '#20242e', helmet: '#f4f6f9' });
  else {
    // sat up after the flag, one fist in the air
    bikeRear(ctx, px, py, { s: 1.6, lean: 0, color: '#eef1f6', accent: '#2255cc', leathers: '#20242e', helmet: '#f4f6f9' });
    const fist = ramp(t, 40.6, 41.4, easeOut);
    ctx.save();
    ctx.translate(px, py - 1.6 * 214);
    // the arm, up and a little out, in a white glove
    ctx.rotate(0.25 * fist);
    ctx.fillStyle = '#20242e';
    ctx.beginPath(); rrect(ctx, 26, -10 - 150 * fist, 44, 150 * fist + 30, 20); ctx.fill();
    ctx.fillStyle = '#eef1f6';
    ctx.beginPath(); rrect(ctx, 22, -38 - 150 * fist, 52, 46, 16); ctx.fill();
    box(ctx, 26, -4 - 150 * fist, 44, 10, '#2255cc');
    ctx.restore();
  }
  if (Math.abs(lean) > 0.55) {
    const side = Math.sign(lean);
    const out = 1 + clamp(Math.abs(lean) / 0.8) * 1.6;
    const lx0 = side * 58 * out * 1.6, ly0 = -128 * 1.6;
    const kx = px + lx0 * Math.cos(lean) - ly0 * Math.sin(lean);
    const ky = py + lx0 * Math.sin(lean) + ly0 * Math.cos(lean) + 12;
    sparks(ctx, t, { x: kx, y: Math.min(ky + 60, H), rate: 90, life: 0.4, speed: 500, angle: Math.PI / 2 + side * 0.3 + 0.4, spread: 0.9, g: 600, floor: H + 50, seed: 5, size: 1.4 });
  }
  ctx.restore();

  // speed lines streaming from the vanishing point
  const sp = clamp(v / V) * (1 - ramp(t, 38, 40));
  if (sp > 0.05) {
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.lineCap = 'round';
    for (let i = 0; i < 40; i++) {
      const ang = hash(i, 71) * TAU;
      const ph = ((t * (1.6 + hash(i, 72))) + hash(i, 73)) % 1;
      const r0 = 500 + ph * 900, r1 = r0 + 140 + ph * 200;
      if (Math.abs(Math.sin(ang)) < 0.25 && Math.cos(ang) > 0 === false && false) continue;
      const cx = W / 2, cy = HORIZON;
      ctx.strokeStyle = css('#ffffff', 0.10 * sp * ph);
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(cx + Math.cos(ang) * r0, cy + Math.sin(ang) * r0 * 0.7); ctx.lineTo(cx + Math.cos(ang) * r1, cy + Math.sin(ang) * r1 * 0.7); ctx.stroke();
    }
    ctx.restore();
  }
  glow(ctx, 1380 - heading * 900, HORIZON - 70, 900, '#ffc070', 0.12, 'screen');
  vignette(ctx, 0.5);
}

// ─── the podium ──────────────────────────────────────────────────────────

const PG = 900;

export function podium(ctx, t) {
  const pan = ramp(t, 10.5, 17, easeInOut);
  const camX = lerp(0, -780, pan);
  ctx.save();
  ctx.translate(-camX, 0);
  const zoom = 1 + 0.05 * smooth(t / 20);
  ctx.translate(W / 2 + camX, PG); ctx.scale(zoom, zoom); ctx.translate(-W / 2 - camX, -PG);

  // late sun behind the stands
  vgrad(ctx, [[0, '#7a6aa0'], [0.5, '#e09a78'], [1, '#f8c888']], -100, 700, -1200, W + 2400);
  glow(ctx, 380, 520, 900, '#ffcf8a', 0.55);
  glow(ctx, 380, 520, 120, '#fff4d8', 0.9);
  // stands and a roof, dark against the sun
  box(ctx, -1200, 420, W + 2400, 480, '#3a2f38');
  box(ctx, -1200, 380, W + 2400, 30, '#2a2228');
  for (let i = 0; i < 400; i++) {
    const x = -1200 + hash(i, 5) * (W + 2400), y = 440 + hash(i, 6) * 300;
    circle(ctx, x, y + Math.sin(t * 7 + i) * 3 * (hash(i, 7) > 0.7 ? 1 : 0), 7, hash(i, 8) > 0.5 ? '#4a3c44' : '#2e252c');
  }
  // the fence and the pit wall
  box(ctx, -1200, 700, W + 2400, 200, '#524850');
  ctx.strokeStyle = css('#1e1a1e', 0.6); ctx.lineWidth = 2;
  ctx.beginPath();
  for (let x = -1200; x < W + 1200; x += 26) { ctx.moveTo(x, 560); ctx.lineTo(x + 140, 700); ctx.moveTo(x + 140, 560); ctx.lineTo(x, 700); }
  ctx.stroke();
  box(ctx, -1200, PG - 10, W + 2400, H - PG + 10, '#2a2428');

  // podium
  const boxes = [[W / 2 - 330, 150, '2', '#f07a1a'], [W / 2, 230, '1', '#2255cc'], [W / 2 + 330, 110, '3', '#1f8a4c']];
  for (const [x, h, n] of boxes) {
    box(ctx, x - 160, PG - h, 320, h, '#e8e4dc');
    box(ctx, x - 160, PG - h, 320, 14, '#c8c2b6');
    ctx.save();
    ctx.font = '600 90px Jost, sans-serif'; ctx.textAlign = 'center'; ctx.fillStyle = '#9a9288';
    ctx.fillText(n, x, PG - h + 110);
    ctx.restore();
  }
  // three riders; the friend in orange beside him
  const lift = ramp(t, 2.5, 4, easeOut) * (1 - ramp(t, 10.5, 12));
  const wave = Math.sin(t * 3) * 0.1;
  const me = pose({ s1: lerp(0.12, 2.8, lift) + wave * lift, e1: lerp(0.15, 0.25, lift), s2: lerp(0.12, 2.75, lift) - wave * lift, e2: lerp(0.15, 0.3, lift), h1: 0.08, h2: 0.08 });
  const clap = Math.abs(Math.sin(t * 7)) * win(t, 3.5, 9, 0.5, 0.8);
  const friend = pose({ s1: lerp(0.15, 0.7, clap > 0 ? 1 : 0) + clap * 0.2, e1: 1.2, s2: 0.7 + clap * 0.2, e2: 1.2, h1: 0.08, h2: 0.08 });
  const third = pose({ s1: 0.9, e1: 1.6, s2: 0.1, e2: 0.2, h1: 0.08, h2: 0.08 });
  const S3 = 1.9;
  const leathers = (a, b) => ({ skin: '#8a6a5a', hair: '#231a14', top: a, bottom: a, shoes: '#111', gloves: b });
  figure(ctx, 'man', friend, { x: W / 2 - 330, ground: PG - 150, s: S3, view: 'front', colors: leathers('#e8732a', '#222'), gloves: 1 });
  figure(ctx, 'man', third, { x: W / 2 + 330, ground: PG - 110, s: S3, view: 'front', colors: leathers('#1f7a44', '#222'), gloves: 1 });
  const J = figure(ctx, 'man', me, { x: W / 2, ground: PG - 230, s: S3, view: 'front', colors: leathers('#e9edf3', '#2255cc'), gloves: 1, tie: null });
  // trophy in his hands, medal on his chest
  const tx = (J.hand1[0] + J.hand2[0]) / 2, ty = (J.hand1[1] + J.hand2[1]) / 2;
  ctx.save();
  ctx.translate(tx, ty - 10);
  ctx.fillStyle = '#e6b84a';
  ctx.beginPath(); ctx.moveTo(-32, -64); ctx.quadraticCurveTo(-30, -10, 0, -4); ctx.quadraticCurveTo(30, -10, 32, -64); ctx.closePath(); ctx.fill();
  box(ctx, -5, -6, 10, 22, '#d4a53c'); box(ctx, -20, 14, 40, 10, '#b8892a');
  ctx.restore();
  glow(ctx, tx, ty - 50, 90, '#ffe7a0', 0.4 + 0.3 * Math.sin(t * 5));
  circle(ctx, J.top[0] + 8, J.top[1] + 40, 11, '#e8bd4e');
  line(ctx, J.top[0] - 6, J.top[1] + 4, J.top[0] + 8, J.top[1] + 30, '#2255cc', 4);
  line(ctx, J.top[0] + 22, J.top[1] + 4, J.top[0] + 8, J.top[1] + 30, '#2255cc', 4);

  // the one standing by the fence, off to the side, in the sun
  const herX = W / 2 - 1250;
  glow(ctx, herX - 30, PG - 330, 420, '#ffd79a', 0.55 * pan);
  glow(ctx, herX - 30, PG - 330, 120, '#fff0d0', 0.5 * pan);
  figure(ctx, 'woman', P.stand(t, 4), { x: herX, ground: PG - 4, s: 1.9, face: 1, sil: '#1e1418', hairSway: Math.sin(t * 1.3) * 3 });

  // confetti
  flakes(ctx, t, { n: 140, colors: ['#f4f1ea', '#e6b84a', '#2255cc', '#f07a1a'], seed: 9, x0: -900, x1: W + 200, fall: 90, sway: 30, size: 7, t0: 2.5 });
  ctx.restore();

  // the crowd in the foreground, and camera flashes
  for (let i = 0; i < 26; i++) {
    const x = (i / 25) * (W + 200) - 100 - camX * 1.3 % 200;
    const y = H - 30 + hash(i, 11) * 30 + Math.sin(t * 5 + i) * 6;
    circle(ctx, x, y - 70, 34, '#120e12');
    box(ctx, x - 55, y - 40, 110, 120, '#120e12', 1, 30);
    if (hash(i, 12) > 0.55) { ctx.save(); ctx.translate(x + 30, y - 40); ctx.rotate(-0.3 + Math.sin(t * 6 + i) * 0.3); box(ctx, -8, -120, 16, 120, '#120e12', 1, 8); ctx.restore(); }
  }
  for (const ft of [2, 3.1, 4.4, 5.2, 7.4, 8.3, 9.6]) {
    const k = 1 - clamp((t - ft) / 0.25);
    if (t >= ft && k > 0) {
      const fx = 200 + hash(Math.floor(ft * 10), 13) * 1500, fy = 900 + hash(Math.floor(ft * 10), 14) * 120;
      glow(ctx, fx, fy, 160, '#ffffff', k);
      glow(ctx, W / 2, 500, 1400, '#ffffff', 0.08 * k);
    }
  }
  vignette(ctx, 0.5);
}
