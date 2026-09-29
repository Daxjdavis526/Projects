// After the credits — what I think happens next. A test stand at the edge of
// a field, a hot fire that matches the model, a stage, and a hill at night.

import { W, H, TAU, clamp, lerp, smooth, ramp, win, keys, hash, noise1, fbm1, css, mix, easeInOut, easeOut, easeIn } from '../kit.js';
import { vgrad, glow, box, circle, line, radial, vignette, layer, rrect, text, SANS, SERIF, motes, rays, hills, tree, grass, sparks, smoke, flakes, shootingStar } from '../paint.js';
import { figure, P, pose, blend, stride } from '../figure.js';
import { laptop, fence, house } from '../props.js';
import { STARS, nightSky, nearHill } from './kid.js';
import { barn, chapel } from './dream.js';
import { pcPredicted, pcMeasured, ENGINE } from '../data.js';

const HIM = { skin: '#b08a76', hair: '#2a2018', top: '#3e5a74', bottom: '#3a3e4a', shoes: '#2a241e' };
const BRO = { skin: '#b08a76', hair: '#1d1612', top: '#26292e', bottom: '#3a4458', shoes: '#2a2420', gloves: '#5a4a36' };
const HER = { skin: '#b08a76', hair: '#4a3222', top: '#b8767a', bottom: '#b8767a', shoes: '#3a2a28' };

// ─── the stand ───────────────────────────────────────────────────────────

// A vertical test stand, engine firing downward into a deflector.
// (x, y) = ground under its centre; s = scale.
function testStand(ctx, x, y, s, { sil = null, frost = 1 } = {}) {
  const C = (c) => sil || c;
  ctx.save();
  ctx.translate(x, y); ctx.scale(s, s);
  // concrete pad and deflector
  box(ctx, -220, -20, 440, 20, C('#9a968c'));
  ctx.fillStyle = css(C('#8a867c'));
  ctx.beginPath(); ctx.moveTo(-70, -20); ctx.lineTo(70, -20); ctx.lineTo(150, -70); ctx.lineTo(150, -20); ctx.closePath(); ctx.fill();
  // frame: legs, bracing, top deck
  const steel = C('#4a5058');
  for (const lx of [-130, 130]) box(ctx, lx - 8, -520, 16, 500, steel);
  for (let k = 0; k < 4; k++) {
    const y0 = -40 - k * 120, y1 = y0 - 120;
    ctx.strokeStyle = css(steel); ctx.lineWidth = 7;
    ctx.beginPath(); ctx.moveTo(-130, y0); ctx.lineTo(130, y1); ctx.moveTo(130, y0); ctx.lineTo(-130, y1); ctx.stroke();
    box(ctx, -134, y1 - 4, 268, 8, steel);
  }
  box(ctx, -160, -536, 320, 16, steel);
  // two tanks: oxygen frosted white, methane grey
  box(ctx, -110, -500, 90, 280, C('#eef2f4'), 1, 40);
  if (!sil && frost > 0) for (let i = 0; i < 12; i++) box(ctx, -104 + hash(i, 3) * 70, -480 + hash(i, 4) * 240, 12, 2, '#cfe4f0', 0.8 * frost);
  box(ctx, 20, -500, 90, 280, C('#8a929c'), 1, 40);
  // feed lines, valves
  ctx.strokeStyle = css(C('#b0b4ba')); ctx.lineWidth = 8;
  ctx.beginPath(); ctx.moveTo(-65, -220); ctx.quadraticCurveTo(-60, -170, -12, -160); ctx.moveTo(65, -220); ctx.quadraticCurveTo(60, -170, 12, -160); ctx.stroke();
  box(ctx, -80, -205, 30, 22, C('#c83a2a'), 1, 4); box(ctx, 50, -205, 30, 22, C('#2a6ab8'), 1, 4);
  // the engine: injector, chamber, bell, nozzle down
  box(ctx, -30, -168, 60, 16, C('#6a6e76'));
  box(ctx, -24, -152, 48, 44, C('#a86a3a'));
  ctx.fillStyle = css(C('#8a5a3a'));
  ctx.beginPath(); ctx.moveTo(-24, -108); ctx.lineTo(24, -108); ctx.lineTo(10, -94); ctx.lineTo(-10, -94); ctx.closePath(); ctx.fill();
  ctx.beginPath(); ctx.moveTo(-10, -94); ctx.lineTo(10, -94); ctx.quadraticCurveTo(22, -70, 32, -52); ctx.lineTo(-32, -52); ctx.quadraticCurveTo(-22, -70, -10, -94); ctx.fill();
  ctx.restore();
  return { nx: x, ny: y - 52 * s };
}

function farmDay(ctx, t, camX, GY) {
  vgrad(ctx, [[0, '#5e94cc'], [0.6, '#a8cce6'], [1, '#e6eef0']], -100, 760);
  glow(ctx, 380 - camX * 0.1, 140, 500, '#fffbe8', 0.5);
  for (let i = 0; i < 6; i++) {
    const cx = ((hash(i, 13) * 2800 + t * 9 - camX * 0.3) % 2800) - 400, cy = 110 + hash(i, 14) * 170;
    for (let k = 0; k < 5; k++) radial(ctx, cx + k * 55, cy + Math.sin(k) * 14, 80 + hash(k + i, 15) * 40, [[0, '#ffffff', 0.6], [1, '#ffffff', 0]]);
  }
  const far = (x) => 640 - 110 * (0.5 + 0.5 * fbm1((x + camX * 0.25) * 0.0016, 131, 5));
  hills(ctx, far, '#8aa4b8');
  chapel(ctx, 420 - camX * 0.25, far(420 - camX * 0.25) + 6, 0.9);
  const mid = (x) => 740 - 90 * (0.5 + 0.5 * fbm1((x + camX * 0.55) * 0.0019, 132, 4));
  hills(ctx, mid, '#6f9a52');
}

export function stand(ctx, t) {
  const GY = 900;
  const camX = keys(t, [[0, 0], [6, 0], [20, 1250], [36, 1330]], easeInOut);
  farmDay(ctx, t, camX, GY);
  ctx.save();
  ctx.translate(-camX, 0);
  box(ctx, camX - 100, 740, W + 300, GY - 740 + 30, '#88ac5a');
  for (let r = 0; r < 7; r++) line(ctx, camX - 100, 760 + r * 20, camX + W + 300, 760 + r * 20 + 10, '#76984c', 3, 0.5);
  house(ctx, 640, GY, { w: 560, h: 280, roof: 150, wall: '#f4ede0', roofC: '#5a5048', door: '#3a5a4a', lit: 0.2, garage: false, chimney: true });
  box(ctx, 360, GY - 20, 560, 20, '#d8cdb8');
  barn(ctx, 1320, GY);
  tree(ctx, 1860, GY + 10, 620, '#4a6a34', 41, Math.sin(t * 0.7) * 0.01);
  fence(ctx, 200, 2400, GY + 30, { h: 60, gap: 90, color: '#8a6a4a', rails: 2, w: 6 });
  // chickens
  for (let i = 0; i < 7; i++) {
    const cx = 900 + hash(i, 21) * 240 + Math.sin(t * 0.3 + i) * 20, cy = GY + 50 + hash(i, 22) * 30;
    const peck = Math.max(0, Math.sin(t * 3 + i * 2)) ** 8 * 6;
    ctx.save(); ctx.translate(cx, cy); ctx.scale(hash(i, 23) > 0.5 ? 1 : -1, 1);
    ctx.fillStyle = '#f4efe6'; ctx.beginPath(); ctx.ellipse(0, -10, 12, 9, 0, 0, TAU); ctx.fill();
    circle(ctx, 10, -18 + peck, 6, '#f4efe6'); circle(ctx, 11, -24 + peck, 3, '#c83a2a');
    ctx.restore();
  }
  // the test site at the edge of the field
  const SX = 2950;
  box(ctx, SX - 700, GY - 10, 1000, 20, '#b8b0a0');
  testStand(ctx, SX, GY + 10, 0.9);
  // a shipping container for a control room, and a folding table
  box(ctx, SX - 620, GY - 250, 360, 250, '#3a6a8a');
  for (let k = 0; k < 14; k++) box(ctx, SX - 616 + k * 26, GY - 246, 6, 242, '#2e5a78');
  box(ctx, SX - 520, GY - 200, 110, 70, '#cfe4f0');
  box(ctx, SX - 240, GY - 80, 180, 10, '#6a6a70');
  box(ctx, SX - 230, GY - 70, 6, 70, '#4a4a50'); box(ctx, SX - 76, GY - 70, 6, 70, '#4a4a50');
  laptop(ctx, SX - 130, GY - 80, { s: 1.0, face: 1, glowA: 0.2 });
  // him at the laptop
  const S = 1.9;
  const me = pose({ ...P.stand(t, 5), lean: 0.25, neck: 0.35, s1: 1.0 + Math.sin(t * 7) * 0.03, e1: 0.8, s2: 0.9, e2: 0.9 });
  figure(ctx, 'man', me, { x: SX - 270, ground: GY + 20, s: S, colors: HIM });
  // his brother at the stand, welding the last bracket
  const welding = t > 20 && t < 27;
  const bp = welding
    ? pose({ ...P.kneel(), lean: 0.3, neck: 0.45, s1: 1.25, e1: 0.4, s2: 1.1, e2: 0.7 })
    : pose({ ...P.stand(t, 8), lean: 0.1, neck: 0.1, s1: 1.2 + Math.sin(t * 2) * 0.1, e1: 1.0, s2: 0.2, e2: 0.3 });
  const JB = figure(ctx, 'brother', bp, { x: SX + 160, ground: GY + 20, s: S, face: -1, sleeves: 'short', colors: BRO, gloves: 1, weldmask: welding ? '#1b1c1e' : null });
  if (welding) {
    const wx = JB.hand1[0] - 30, wy = JB.hand1[1] - 10;
    const fl = 0.7 + 0.3 * noise1(t * 40, 5);
    glow(ctx, wx, wy, 260, '#cfe0ff', 0.4 * fl);
    glow(ctx, wx, wy, 24, '#ffffff', 0.9 * fl);
    sparks(ctx, t, { x: wx, y: wy, rate: 120, life: 1, speed: 380, angle: -Math.PI / 2, spread: 3.2, g: 1400, floor: GY + 20, seed: 81, size: 1.5, t0: 20 });
  }
  // the kids on the fence rail, watching
  const kidP = pose({ ...P.sit(t, 3), s1: 0.5, e1: 0.8, s2: 0.6, e2: 0.7 });
  figure(ctx, 'kid', kidP, { x: SX - 900, y: GY - 60, s: 1.4, colors: { skin: '#c8a08a', hair: '#3a2a1a', top: '#5aa06a', bottom: '#4a5a7a', shoes: '#3a2a20' } });
  figure(ctx, 'girl', kidP, { x: SX - 820, y: GY - 60, s: 1.4, colors: { skin: '#c8a08a', hair: '#6a4a2a', top: '#d8707a', bottom: '#4a5a7a', shoes: '#3a2a20' } });
  grass(ctx, t, () => GY + 110, { x0: camX - 100, x1: camX + W + 100, density: 0.3, h: 26, color: '#6a8a40', seed: 7, wind: 1 });
  ctx.restore();
  vignette(ctx, 0.35);
}

// ─── the hot fire ────────────────────────────────────────────────────────

const IGN = 12, CUT = 20;

function pcPanel(ctx, t, x0, y0, w, h, a) {
  if (a <= 0) return;
  ctx.save();
  ctx.globalAlpha = a;
  box(ctx, x0 - 14, y0 - 14, w + 28, h + 28, '#1c1e24', 1, 14);
  box(ctx, x0, y0, w, h, '#0e1118', 1, 6);
  text(ctx, 'CHAMBER PRESSURE  (bar)', x0 + 24, y0 + 40, { face: SANS, size: 20, spacing: 3, color: '#8aa0c0', align: 'left' });
  text(ctx, 'hot fire 001', x0 + w - 24, y0 + 40, { face: SANS, size: 18, color: '#5a6a80', align: 'right' });
  const px0 = x0 + 60, py0 = y0 + h - 60, pw = w - 90, ph = h - 130;
  line(ctx, px0, py0, px0 + pw, py0, '#3a4458', 2); line(ctx, px0, py0, px0, py0 - ph, '#3a4458', 2);
  for (const p of [10, 20]) { const yy = py0 - (p / 24) * ph; line(ctx, px0, yy, px0 + pw, yy, '#1e2634', 1); text(ctx, String(p), px0 - 14, yy + 6, { face: SANS, size: 16, color: '#5a6a80', align: 'right' }); }
  const T = 7;
  // model: dashed
  ctx.strokeStyle = '#8ab4ff'; ctx.lineWidth = 2.5; ctx.setLineDash([10, 8]);
  ctx.beginPath();
  for (let i = 0; i <= 140; i++) { const s = (i / 140) * T; const x = px0 + (s / T) * pw, y = py0 - (pcPredicted(s) / 24) * ph; i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }
  ctx.stroke(); ctx.setLineDash([]);
  // test: drawn in as the data arrives
  const k = ramp(t, 22, 25.5);
  ctx.strokeStyle = '#ffb44a'; ctx.lineWidth = 3;
  ctx.beginPath();
  for (let i = 0; i <= 280 * k; i++) { const s = (i / 280) * T; const x = px0 + (s / T) * pw, y = py0 - (pcMeasured(s) / 24) * ph; i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }
  ctx.stroke();
  line(ctx, x0 + 30, y0 + h - 22, x0 + 60, y0 + h - 22, '#8ab4ff', 2.5);
  text(ctx, 'model', x0 + 70, y0 + h - 16, { face: SANS, size: 16, color: '#8ab4ff', align: 'left' });
  line(ctx, x0 + 150, y0 + h - 22, x0 + 180, y0 + h - 22, '#ffb44a', 3);
  text(ctx, 'test', x0 + 190, y0 + h - 16, { face: SANS, size: 16, color: '#ffb44a', align: 'left' });
  text(ctx, 'within 1.5%', x0 + w - 24, y0 + h - 16, { face: SANS, size: 18, color: '#c3e88d', align: 'right', alpha: ramp(t, 25.5, 26.5) });
  ctx.restore();
}

export function fire(ctx, t) {
  const GY = 900;
  const on = t > IGN && t < CUT;
  const rampUp = ramp(t, IGN, IGN + 0.5);
  const thrustK = on ? rampUp * (0.92 + 0.08 * noise1(t * 20, 3)) : 0;
  const after = t >= CUT ? Math.exp(-(t - CUT) * 1.2) : 0;
  const light = thrustK + after * 0.4;
  const shake = thrustK * 5;
  ctx.save();
  ctx.translate(Math.sin(t * 83) * shake, Math.cos(t * 67) * shake);
  // dusk
  vgrad(ctx, [[0, '#1a1c44'], [0.5, '#6a3a6a'], [0.85, '#e0785a'], [1, '#f8b070']], -100, 780);
  STARS.draw(ctx, t, { alpha: 0.5, dy: -1000, big: 0.4 });
  hills(ctx, (x) => 760 - 80 * (0.5 + 0.5 * fbm1(x * 0.0018, 141)), '#2a2038');
  box(ctx, -40, 760, W + 80, H, mix('#1a1420', '#6a3a28', light * 0.6));
  // the flame trench under the stand
  box(ctx, 1180, GY - 44, 280, 150, '#0a080c');
  // the stand
  const { nx, ny } = testStand(ctx, 1320, GY - 40, 1.05, { sil: mix('#140e16', '#3a2418', light * 0.5) });
  // the plume: down into the deflector, then out along the ground
  if (thrustK > 0) {
    const L = 230 * thrustK;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    const g = ctx.createLinearGradient(nx, ny, nx, ny + L);
    g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(0.15, 'rgba(200,220,255,0.95)'); g.addColorStop(0.6, 'rgba(255,170,90,0.7)'); g.addColorStop(1, 'rgba(255,120,60,0)');
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.moveTo(nx - 32, ny); ctx.quadraticCurveTo(nx - 44, ny + L * 0.5, nx - 14, ny + L); ctx.lineTo(nx + 14, ny + L); ctx.quadraticCurveTo(nx + 44, ny + L * 0.5, nx + 32, ny); ctx.fill();
    // shock diamonds
    for (let k = 0; k < 5; k++) {
      const dy = 24 + k * 30 + noise1(t * 12 + k, 7) * 3;
      if (dy > L * 0.8) break;
      ctx.fillStyle = css('#fff8e8', 0.8 - k * 0.12);
      ctx.beginPath(); ctx.ellipse(nx, ny + dy, 11 - k * 1.2, 9, 0, 0, TAU); ctx.fill();
    }
    ctx.restore();
    glow(ctx, nx, ny + 60, 1400, '#ffb070', 0.35 * thrustK);
    glow(ctx, nx, ny + 40, 220, '#ffffff', 0.6 * thrustK);
  }
  // exhaust and steam rolling out along the ground
  smoke(ctx, t, { x: nx + 60, y: GY - 60, rate: 16, life: 6, rise: 22, spread: 60, size: 60, grow: 220, color: '#d8c8c0', a: 0.35, seed: 31, wind: 170, t0: IGN + 0.2, t1: CUT + 0.4 });
  smoke(ctx, t, { x: nx - 60, y: GY - 60, rate: 12, life: 6, rise: 22, spread: 60, size: 60, grow: 200, color: '#d8c8c0', a: 0.3, seed: 32, wind: -150, t0: IGN + 0.2, t1: CUT + 0.4 });
  if (after > 0.05) glow(ctx, nx, ny + 10, 40, '#ff8a3a', after * 0.8);

  // the family behind the barrier
  const cheer = t > 20.4 ? 1 : 0;
  const jump = (k) => (cheer ? Math.abs(Math.sin((t - 20.4) * 6 + k)) * 26 * (1 - ramp(t, 26, 28)) : 0);
  const sil = '#0e0a10';
  const rim = light;
  const S = 1.9;
  const drawP = (build, pz, x, o = {}) => {
    const J = figure(ctx, build, pz, { x, ground: GY + 30 - (o.jump || 0), s: o.s || S, face: o.face || 1, sil, ...o.extra });
    return J;
  };
  // him, the controller in his hand, then arms up
  const up = ramp(t, 20.4, 20.9);
  const meP = pose({ ...P.stand(t, 1), lean: lerp(0.1, 0, up), neck: lerp(0.05, -0.2, up), s1: lerp(0.9, 2.8, up), e1: lerp(1.1, 0.3, up), s2: lerp(0.2, 2.7, up), e2: 0.3 });
  const brotherHug = win(t, 22, 27, 0.6, 0.8);
  const broP = blend(pose({ ...P.stand(t, 2), s1: 1.0, e1: 1.9, s2: 0.95, e2: 1.95 }), pose({ lean: 0.1, s1: 1.3, e1: 1.2, s2: 1.2, e2: 1.3, neck: 0.2 }), brotherHug);
  drawP('brother', broP, lerp(420, 540, brotherHug), { face: 1 });
  const J = drawP('man', brotherHug > 0.5 ? pose({ lean: 0.08, neck: 0.1, s1: 1.2, e1: 1.3, s2: 1.1, e2: 1.4 }) : meP, 640, { face: brotherHug > 0.5 ? -1 : 1 });
  drawP('woman', pose({ ...P.stand(t, 3), s1: 1.2, e1: 1.7, s2: up ? 2.6 : 1.1, e2: up ? 0.4 : 1.8 }), 790, { extra: { dress: sil } });
  figure(ctx, 'toddler', pose({ h1: 1.5, k1: 1.6, h2: 1.4, k2: 1.5, s1: 0.8, e1: 0.8 }), { x: 800, y: GY + 30 - 1.9 * 110, s: 1.3, sil });
  // two kids with ear defenders, jumping at the end
  for (const [kx, b, k] of [[900, 'kid', 0], [980, 'girl', 1.3]]) {
    const kp = pose({ ...P.stand(t, k), s1: cheer ? 2.8 : 1.6, e1: cheer ? 0.2 : 2.2, s2: cheer ? 2.7 : 1.5, e2: cheer ? 0.2 : 2.3 });
    const JK = figure(ctx, b, kp, { x: kx, ground: GY + 30 - jump(k), s: 1.6, sil });
    // ear defenders
    const r = JK.headR;
    ctx.strokeStyle = sil; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.arc(JK.head[0], JK.head[1], r * 1.25, Math.PI * 1.05, Math.PI * 1.95); ctx.stroke();
    box(ctx, JK.head[0] - r * 1.45, JK.head[1] - r * 0.45, r * 0.5, r * 0.9, sil, 1, 4);
    box(ctx, JK.head[0] + r * 0.95, JK.head[1] - r * 0.45, r * 0.5, r * 0.9, sil, 1, 4);
  }
  // the concrete barrier in front of them
  ctx.fillStyle = css(mix('#1a1418', '#5a4a44', light * 0.5));
  ctx.beginPath(); ctx.moveTo(300, GY + 40); ctx.lineTo(320, GY - 80); ctx.lineTo(1080, GY - 80); ctx.lineTo(1100, GY + 40); ctx.closePath(); ctx.fill();
  laptop(ctx, 640, GY - 80, { s: 1.1, face: -1, glowA: 0.4 });
  // his phone, lighting up with calls
  if (t > 28.5) {
    const ring = Math.sin(t * 30) * 2 * (t < 33 ? 1 : 0);
    box(ctx, 900 + ring, GY - 118, 26, 46, '#0c0d10', 1, 4);
    box(ctx, 903 + ring, GY - 114, 20, 38, '#cfe0ff', 0.9, 2);
    glow(ctx, 913, GY - 95, 90, '#bcd4ff', 0.35);
  }
  ctx.restore();
  // rim light: everything catches the fire
  if (light > 0.02) glow(ctx, 1320, 700, 1800, '#ffa060', 0.15 * light, 'screen');
  pcPanel(ctx, t, 1180, 90, 640, 330, win(t, 21.5, 42, 0.8, 1.5));
  vignette(ctx, 0.5);
}

// ─── the stage ───────────────────────────────────────────────────────────

export function stage(ctx, t) {
  vgrad(ctx, [[0, '#07061a'], [0.7, '#1a1236'], [1, '#2a1a3a']], 0, 820);
  // sweeping beams
  for (let i = 0; i < 6; i++) {
    const a = Math.PI / 2 + Math.sin(t * 0.6 + i * 1.3) * 0.5;
    rays(ctx, t, 200 + i * 300, -20, { angle: a, spread: 0.02, n: 1, len: 1100, color: i % 2 ? '#a88aff' : '#ffd08a', a: 0.12, width: 0.08, seed: i });
  }
  // stage and its reflection
  vgrad(ctx, [[0, '#2a2030'], [1, '#120c18']], 820, H);
  glow(ctx, 960, 830, 600, '#ffd8a0', 0.18);
  // the spotlight cone from above
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  const g = ctx.createLinearGradient(0, 0, 0, 840);
  g.addColorStop(0, 'rgba(255,236,200,0.02)'); g.addColorStop(1, 'rgba(255,236,200,0.18)');
  ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(900, -10); ctx.lineTo(1020, -10); ctx.lineTo(1180, 840); ctx.lineTo(740, 840); ctx.fill();
  ctx.restore();
  // him, flexing
  const biceps = pose({ s1: 1.62, e1: 1.95, s2: 1.62, e2: 1.95, h1: 0.14, h2: 0.14, neck: -0.05 });
  const lats = pose({ s1: 0.55, e1: -1.35, s2: 0.55, e2: -1.35, h1: 0.14, h2: 0.14 });
  const which = t < 7 ? 0 : t < 9 ? ramp(t, 7, 9) : t < 14 ? 1 : 1 - ramp(t, 14, 16);
  const pz = blend(biceps, lats, which);
  const pulse = Math.sin(t * 5) * 0.04;
  pz.e1 += pulse; pz.e2 += pulse;
  figure(ctx, 'brother', pz, { x: 960, ground: 830, s: 2.9, view: 'front', sleeves: 'short', colors: { skin: '#9a5e3a', hair: '#1a1210', top: '#9a5e3a', bottom: '#1a1a2a', shoes: '#9a5e3a' } });
  glow(ctx, 960, 540, 380, '#ffe0b0', 0.16);
  // flashes, confetti at the end
  for (let i = 0; i < 16; i++) {
    const ft = 1 + hash(i, 5) * 20;
    const k = 1 - clamp((t - ft) / 0.2);
    if (t >= ft && k > 0) glow(ctx, 150 + hash(i, 6) * 1620, 930 + hash(i, 7) * 100, 90, '#ffffff', k);
  }
  flakes(ctx, t, { n: 90, colors: ['#e8b84a', '#fff4d8', '#d8a0ff'], seed: 5, x0: 400, x1: 1520, fall: 90, sway: 30, size: 6, t0: 14 });
  // the crowd; one of them holding a sign up
  for (let i = 0; i < 24; i++) {
    const x = 40 + i * 80 + hash(i, 1) * 20;
    const bob = Math.abs(Math.sin(t * 4 + i)) * 8;
    circle(ctx, x, 990 - bob, 30, '#07060c');
    box(ctx, x - 48, 1010 - bob, 96, 90, '#07060c', 1, 26);
    if (hash(i, 2) > 0.6) { ctx.save(); ctx.translate(x + 24, 1010 - bob); ctx.rotate(-0.25 + Math.sin(t * 5 + i) * 0.25); box(ctx, -7, -110, 14, 110, '#07060c', 1, 7); ctx.restore(); }
  }
  // his brother — the loudest one in the building
  const hx = 700, jumpY = Math.abs(Math.sin(t * 5.5)) * 16;
  circle(ctx, hx, 960 - jumpY, 32, '#0c0a12');
  box(ctx, hx - 50, 985 - jumpY, 100, 100, '#0c0a12', 1, 26);
  ctx.save();
  ctx.translate(hx, 880 - jumpY);
  ctx.rotate(Math.sin(t * 3) * 0.08);
  line(ctx, -60, 60, -60, -10, '#0c0a12', 10); line(ctx, 60, 60, 60, -10, '#0c0a12', 10);
  box(ctx, -130, -90, 260, 90, '#f4efe4', 1, 4);
  text(ctx, 'THAT’S MY', 0, -52, { face: SANS, size: 28, weight: 600, spacing: 3, color: '#1a1a2a' });
  text(ctx, 'BROTHER', 0, -16, { face: SANS, size: 34, weight: 700, spacing: 4, color: '#c83a2a' });
  ctx.restore();
  glow(ctx, hx, 900, 200, '#ffd8a0', 0.12);
  vignette(ctx, 0.55);
}

// ─── the hill, years from now ────────────────────────────────────────────

export function night(ctx, t) {
  const tilt = keys(t, [[0, 60], [18, 0], [50, 0]], easeInOut);
  const zoom = keys(t, [[0, 1.4], [18, 1.24], [58, 1.12]], easeInOut);
  ctx.save();
  ctx.translate(900, 780); ctx.scale(zoom, zoom); ctx.translate(-860, -780);
  nightSky(ctx, t, tilt, { stars: 1 });
  // a launch, far off, climbing and pitching downrange
  const u = clamp((t - 19) / 15);
  const path = (k) => [1300 + 330 * k ** 1.7, 770 - 640 * (1 - (1 - k) ** 1.6)];
  if (t > 18.6) {
    const pad = win(t, 18.6, 23, 0.4, 3);
    glow(ctx, 1300, 780 + tilt, 500, '#ffb070', 0.35 * pad);
  }
  if (u > 0) {
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.lineCap = 'round';
    const N = 60;
    for (let i = 1; i <= N; i++) {
      const k0 = (u * (i - 1)) / N, k1 = (u * i) / N;
      const [x0, y0] = path(k0), [x1, y1] = path(k1);
      const age = 1 - i / N;
      ctx.strokeStyle = css(mix('#ffd8a0', '#a8b8e8', age), (1 - age) * 0.7 * (1 - ramp(t, 40, 48)));
      ctx.lineWidth = 2 + age * 10;
      ctx.beginPath(); ctx.moveTo(x0, y0 + tilt); ctx.lineTo(x1, y1 + tilt); ctx.stroke();
    }
    ctx.restore();
    const [hx, hy] = path(u);
    if (u < 1) {
      glow(ctx, hx, hy + tilt, 60, '#fff0d0', 0.9);
      circle(ctx, hx, hy + tilt, 3.5, '#ffffff');
    }
    if (t > 28.5 && t < 29.3) glow(ctx, path(clamp((28.8 - 19) / 15))[0], path(clamp((28.8 - 19) / 15))[1] + tilt, 40, '#ffffff', 1 - Math.abs(t - 28.9) / 0.4);
  }
  // the land: the farm below the hill, the far stand's tower against the glow
  ctx.save();
  ctx.translate(0, tilt);
  hills(ctx, (x) => 800 - 60 * (0.5 + 0.5 * fbm1(x * 0.0016, 3, 5)), '#0a0e24');
  // their house and barn, lit
  box(ctx, 90, 690, 220, 110, '#05060c');
  ctx.fillStyle = '#05060c'; ctx.beginPath(); ctx.moveTo(76, 694); ctx.lineTo(200, 610); ctx.lineTo(324, 694); ctx.fill();
  box(ctx, 130, 720, 40, 34, '#ffcf87', 0.9); box(ctx, 230, 720, 40, 34, '#ffcf87', 0.8);
  glow(ctx, 200, 740, 200, '#ffb85a', 0.2);
  ctx.save(); ctx.translate(430, 800); ctx.scale(0.42, 0.42); barn(ctx, 0, 0); ctx.restore();
  box(ctx, 350, 660, 180, 140, '#05060c', 0.85);
  // the test stand on the far rise
  box(ctx, 1180, 700, 6, 90, '#05060c'); box(ctx, 1220, 700, 6, 90, '#05060c'); box(ctx, 1176, 696, 54, 6, '#05060c');
  circle(ctx, 1203, 692, 2.5, '#ff4a3a', 0.5 + 0.5 * Math.sin(t * 2));
  tree(ctx, 1560, nearHill(1560) + 6, 400, '#030409', 2, Math.sin(t * 0.6) * 0.012);
  hills(ctx, nearHill, '#030409');
  grass(ctx, t, nearHill, { color: '#030409', density: 0.7, h: 16, seed: 5, wind: 0.8 });
  motes(ctx, t, { n: 22, x0: 100, x1: 1800, y0: 690, y1: 900, color: '#d6ff9a', a: 0.8, size: 1.6, drift: 20, rise: 2, blink: 1, glowR: 7, seed: 31 });

  // the family on the hill
  const sil = '#030409';
  const point = win(t, 21.5, 36, 1.2, 2);
  const aimAng = (sx, sy) => { const [tx, ty] = path(clamp(u)); return Math.atan2(ty - sy, tx - sx); };
  // him, sitting, the toddler in his lap
  const S = 1.75;
  const gx = 820, gy = nearHill(820);
  const sitHim = pose({ lean: -0.2, neck: lerp(-0.35, -0.55, point), h1: 1.5, k1: 1.2, h2: 1.4, k2: 1.0, s1: -0.6, e1: 0.1, s2: -0.7, e2: 0.1 });
  if (point > 0) {
    // world pointing angle -> shoulder angle measured from down toward forward
    const wa = aimAng(gx + 10, gy - 150);
    const th = Math.atan2(Math.cos(wa), Math.sin(wa));
    sitHim.s1 = lerp(-0.6, th - sitHim.lean, point); sitHim.e1 = lerp(0.1, 0.05, point);
  }
  figure(ctx, 'man', sitHim, { x: gx, y: gy - 12 * S, s: S, sil });
  figure(ctx, 'toddler', pose({ lean: -0.1, neck: -0.4, h1: 1.5, k1: 0.6, h2: 1.4, k2: 0.5, s1: 1.9, e1: 0.2, s2: 1.6, e2: 0.4 }), { x: gx + 42, y: gy - 12 * S - 30, s: 1.35, sil });
  // her beside him, her head on his shoulder
  figure(ctx, 'woman', pose({ lean: -0.05, neck: -0.25, h1: 1.5, k1: 1.3, h2: 1.4, k2: 1.1, s1: 0.4, e1: 0.8, s2: -0.5, e2: 0.1 }), { x: gx - 70, y: gy - 12 * S + 4, s: S * 0.94, sil });
  // two on their backs in front, pointing up
  for (const [kx, b, ks] of [[1010, 'kid', 1.9], [640, 'girl', 1.8]]) {
    const kp = P.lieBack(t + kx);
    const ky = nearHill(kx) - 8 * ks;
    if (point > 0) {
      const wa = aimAng(kx - 28 * ks, ky);
      const th = -wa;
      kp.s1 = lerp(kp.s1, th, point); kp.e1 = lerp(kp.e1, 0.1, point);
    }
    figure(ctx, b, kp, { x: kx, y: ky, s: ks, sil });
  }
  ctx.restore();
  ctx.restore();
  vignette(ctx, 0.55);
}
