// III. Iron — the family shop (railings for their dad), and later the sign
// on a shop of the brothers' own.

import { W, H, TAU, clamp, lerp, smooth, ramp, win, keys, hash, noise1, fbm1, css, mix, easeInOut, easeOut } from '../kit.js';
import { vgrad, glow, sparks, smoke, rays, box, circle, line, radial, vignette, layer, motes, hills, fill, rrect } from '../paint.js';
import { figure, P, pose, blend, stride } from '../figure.js';
import { car, starPath } from '../props.js';
import { STARS } from './kid.js';

// ─── the family shop ─────────────────────────────────────────────────────

const FY = 880;               // floor
const TABLE = 668;            // welding table top
const RAIL_TOP = 505, RAIL_BOT = 648;

// The arc runs in beads: on for 1.8 s, off for 0.45 s, inside the weld windows.
const WELD = [[1.5, 10.5], [12.5, 18], [19.5, 36]];
function arc(ts) {
  for (const [a, b] of WELD) {
    if (ts >= a && ts < b) {
      const u = (ts - a) / 2.25;
      const bead = Math.floor(u);
      return { on: u - bead < 0.8, bead: bead + (a > 12 ? 4 : 0) + (a > 19 ? 3 : 0), since: (u - bead) * 2.25 };
    }
  }
  return { on: false, bead: -1, since: 0 };
}
const GRIND = [[4, 10], [15, 19], [21.5, 40]];
const grinding = (ts) => GRIND.some(([a, b]) => ts >= a && ts < b);

function shopRoom(ctx, t, light) {
  // corrugated back wall
  box(ctx, -900, -800, W + 1800, FY + 800, '#1f1b18');
  ctx.save();
  for (let x = -900; x < W + 900; x += 18) box(ctx, x, -800, 7, FY + 800, '#27221e');
  ctx.restore();
  // roof trusses, high up
  ctx.strokeStyle = css('#141110'); ctx.lineWidth = 10;
  ctx.beginPath();
  for (let x = -960; x < W + 200; x += 240) { ctx.moveTo(x, 40); ctx.lineTo(x + 240, -120); ctx.moveTo(x, -120); ctx.lineTo(x + 240, 40); }
  ctx.moveTo(-900, 40); ctx.lineTo(W + 40, 40);
  ctx.moveTo(-900, -120); ctx.lineTo(W + 40, -120);
  ctx.stroke();
  // high windows and their dusty shafts
  for (let i = 0; i < 4; i++) {
    const x = 330 + i * 250;
    box(ctx, x, 90, 170, 70, '#8a8472');
    line(ctx, x + 85, 90, x + 85, 160, '#3a342e', 4);
    rays(ctx, t, x + 85, 125, { angle: 1.18, spread: 0.22, len: 1000, n: 3, color: '#ffe2a8', a: 0.07 * light, seed: i });
  }
  // columns
  for (const cx of [170, 1400]) {
    box(ctx, cx - 26, 0, 52, FY, '#171413');
    box(ctx, cx - 26, 0, 8, FY, '#221d1b');
    box(ctx, cx + 18, 0, 8, FY, '#221d1b');
  }
  // the roll-up door, open to the yard
  const dx = 1460, dw = 420, dt = 300;
  vgrad(ctx, [[0, '#dfe6ea'], [1, '#f4efe2']], dt, FY, dx, dw, dt, FY);
  hills(ctx, (x) => 690 - 60 * (0.5 + 0.5 * Math.sin(x * 0.012)), '#9aa58a', 1, dx, dx + dw, FY);
  box(ctx, dx, 760, dw, FY - 760, '#c8bea4');
  car(ctx, dx + 210, 810, { s: 0.62, color: '#5a6a78', face: -1 });
  box(ctx, dx - 12, dt - 20, dw + 24, 22, '#2e2924');
  box(ctx, dx - 12, dt, 12, FY - dt, '#15120f'); box(ctx, dx + dw, dt, 12, FY - dt, '#15120f');
  // steel stock on a cantilever rack
  for (let r = 0; r < 4; r++) {
    const y = 470 + r * 70;
    box(ctx, 20, y, 12, 8, '#141110');
    for (let k = 0; k < 3; k++) box(ctx, 30, y - 8 - k * 7, 360 - k * 30, 6, mix('#4a4540', '#2c2825', k * 0.3));
  }
  box(ctx, 20, 440, 14, FY - 440, '#141110');
  // finished railings leaning on the wall
  for (let k = 0; k < 3; k++) {
    ctx.save();
    ctx.translate(1180 + k * 34, FY);
    ctx.rotate(-0.1);
    ctx.strokeStyle = css('#0e0d0c'); ctx.lineWidth = 7;
    ctx.strokeRect(0, -330, 190, 300);
    ctx.lineWidth = 4;
    ctx.beginPath();
    for (let p = 1; p < 8; p++) { ctx.moveTo(p * 24, -330); ctx.lineTo(p * 24, -30); }
    ctx.stroke();
    ctx.restore();
  }
  // floor
  vgrad(ctx, [[0, '#23201c'], [1, '#12100e']], FY, H + 400, -900, W + 1800, FY, H + 400);
  ctx.fillStyle = css('#fff4dc', 0.07 * light);
  ctx.beginPath(); ctx.moveTo(dx, FY); ctx.lineTo(dx + dw, FY); ctx.lineTo(dx + dw - 120, H + 20); ctx.lineTo(dx - 300, H + 20); ctx.fill();
}

function railing(ctx, ts, heat) {
  // the table
  box(ctx, 600, TABLE, 600, 18, '#2c2926');
  box(ctx, 620, TABLE + 18, 16, FY - TABLE - 18, '#1c1a18');
  box(ctx, 1164, TABLE + 18, 16, FY - TABLE - 18, '#1c1a18');
  box(ctx, 636, 800, 528, 10, '#1c1a18');
  // clamps
  for (const x of [660, 1120]) { box(ctx, x - 8, RAIL_BOT - 30, 16, 50, '#6a2a1a'); }
  // the panel: rails and pickets
  ctx.strokeStyle = css('#141312'); ctx.lineWidth = 9;
  ctx.beginPath(); ctx.moveTo(640, RAIL_TOP); ctx.lineTo(1160, RAIL_TOP); ctx.moveTo(640, RAIL_BOT); ctx.lineTo(1160, RAIL_BOT); ctx.stroke();
  ctx.lineWidth = 6;
  ctx.beginPath();
  for (let p = 0; p < 12; p++) { const x = 670 + p * 44; ctx.moveTo(x, RAIL_TOP); ctx.lineTo(x, RAIL_BOT); }
  ctx.stroke();
  // welds still cooling: orange to dull red to nothing
  for (const [x, y, age] of heat) {
    if (age < 0 || age > 5) continue;
    const k = 1 - age / 5;
    circle(ctx, x, y, 6, mix('#5a1a0a', '#ffb050', k * k), k);
    glow(ctx, x, y, 26, '#ff7a2a', 0.5 * k * k);
  }
}

function weldPoint(bead) {
  const i = ((bead % 11) + 11) % 11;
  return [680 + i * 44, RAIL_TOP + 4];
}

export function shop(ctx, t) {
  // slow motion after 24 s — the sparks hang in the air
  const ts = t < 24 ? t : 24 + (t - 24) * 0.32;
  const slow = ramp(t, 23, 26);
  const A = arc(ts);
  const flick = A.on ? 0.65 + 0.35 * noise1(ts * 45, 3) + 0.15 * noise1(ts * 130, 4) : 0;
  const [wx, wy] = A.bead >= 0 ? weldPoint(A.bead) : weldPoint(0);
  const G = grinding(ts);

  const cam = ramp(t, 24, 36, easeInOut);
  const zoom = lerp(1.0, 1.05, smooth(t / 24)) + 0.45 * cam;
  const cx = lerp(900, 380, cam), cy = lerp(620, 250, cam);
  const ax = lerp(900, 960, cam), ay = lerp(620, 600, cam);
  ctx.save();
  ctx.translate(ax, ay); ctx.scale(zoom, zoom); ctx.translate(-cx, -cy);

  shopRoom(ctx, t, 1);

  // heat left behind by earlier beads
  const heat = [];
  for (let b = 0; b < 20; b++) {
    // bead b ends at: window start + (local index)*2.25 + 1.8
    let end = null;
    const local = b < 4 ? [WELD[0], b] : b < 7 ? [WELD[1], b - 4] : [WELD[2], b - 7];
    end = local[0][0] + local[1] * 2.25 + 1.8;
    if (end > local[0][1]) continue;
    const [px, py] = weldPoint(b);
    heat.push([px, py, ts - end]);
  }
  railing(ctx, ts, heat);

  // ── the brother at the grinder ──
  const bx = 400;
  const up = ramp(ts, 21.5, 23);
  const bro = pose({ lean: lerp(0.3, 0.12, up), neck: lerp(0.35, -0.1, up), s1: lerp(1.1, 1.6, up), e1: lerp(0.5, 0.6, up), s2: lerp(1.0, 1.5, up), e2: lerp(0.6, 0.7, up), h1: 0.2, k1: 0.15, h2: -0.15, k2: 0.1 });
  // his work: a post in a vice
  box(ctx, 250, 700, 70, 30, '#2a2724');
  box(ctx, 270, 730, 30, FY - 730, '#1c1a18');
  box(ctx, 279, lerp(560, 520, up), 12, 150, '#161412');
  const JB = figure(ctx, 'brother', bro, { x: bx, ground: FY, s: 2.2, face: -1, sleeves: 'short', colors: { skin: '#7a5c4c', hair: '#1a1512', top: '#24272c', bottom: '#262c38', shoes: '#141414', gloves: '#3a3a3a' }, gloves: 1 });
  const gp = [(JB.hand1[0] + JB.hand2[0]) / 2 - 18, (JB.hand1[1] + JB.hand2[1]) / 2];
  // grinder body and guard
  ctx.save(); ctx.translate(gp[0], gp[1]); ctx.rotate(lerp(0.2, -0.6, up));
  box(ctx, -8, -12, 70, 22, '#3d4a5a', 1, 8);
  ctx.fillStyle = css('#8a8e94'); ctx.beginPath(); ctx.ellipse(-12, 0, 8, 26, 0, 0, TAU); ctx.fill();
  ctx.restore();
  const gx = gp[0] - 20, gy = gp[1] + lerp(10, -14, up);
  if (G) {
    sparks(ctx, ts, { x: gx, y: gy, rate: 260, life: lerp(0.9, 2.4, up), speed: lerp(900, 700, up), angle: lerp(Math.PI * 0.85, -Math.PI * 0.62, up), spread: lerp(0.35, 0.5, up), g: lerp(700, 240, up), floor: FY, seed: 41, size: 1.3, drag: lerp(1.2, 0.35, up), streak: lerp(0.03, 0.012, slow) });
    glow(ctx, gx, gy, 120, '#ffae50', 0.35);
  }

  // ── him, welding ──
  const lean = 0.42 + Math.sin(ts * 0.8) * 0.02;
  const reach = (wx - 560) / 380;
  const me = pose({ lean, neck: 0.45, s1: 0.95 + reach * 0.35, e1: 0.35, s2: 0.75, e2: 1.05, h1: 0.22, k1: 0.25, h2: -0.2, k2: 0.1 });
  const hx = lerp(430, 520, clamp(reach));
  const J = figure(ctx, 'man', me, { x: hx + 90, ground: FY, s: 2.3, colors: { skin: '#7a5c4c', hair: '#1c1714', top: '#3a3e46', bottom: '#2a3242', shoes: '#141414', gloves: '#5d4a36' }, gloves: 1, weldmask: '#1b1c1e' });
  // torch and its cable
  ctx.strokeStyle = css('#0f0f10'); ctx.lineWidth = 6; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(J.hand1[0], J.hand1[1]); ctx.quadraticCurveTo(J.hand1[0] + 20, J.hand1[1] + 5, wx - 6, wy - 6); ctx.stroke();
  ctx.lineWidth = 7;
  ctx.beginPath(); ctx.moveTo(J.hand1[0] - 6, J.hand1[1] + 4); ctx.bezierCurveTo(J.hand1[0] - 60, J.hand1[1] + 160, 420, FY - 10, 300, FY - 4); ctx.stroke();

  if (A.on) {
    sparks(ctx, ts, { x: wx, y: wy, rate: 140, life: 1.1, speed: 420, angle: -Math.PI / 2, spread: 3.4, g: 1500, floor: TABLE, seed: 17 + A.bead, size: 1.6, drag: 0.8, t0: ts - A.since, streak: lerp(0.028, 0.01, slow) });
  }
  smoke(ctx, ts, { x: wx, y: wy - 10, rate: 6, life: 5, rise: 40, spread: 30, size: 16, grow: 80, color: '#6a6660', a: 0.12, seed: 9, wind: 8 });

  ctx.restore();

  // the arc lights the whole room, stuttering
  if (flick > 0) {
    const sx = ax + (wx - cx) * zoom, sy = ay + (wy - cy) * zoom;
    glow(ctx, sx, sy, 1100 * zoom, '#b8d4ff', 0.2 * flick);
    glow(ctx, sx, sy, 300 * zoom, '#dfeaff', 0.5 * flick);
    glow(ctx, sx, sy, 34 * zoom, '#ffffff', 1.0 * flick);
  }

  // up in the dark roof, the last sparks become something else
  const starsK = ramp(t, 29, 35);
  if (starsK > 0) STARS.draw(ctx, t, { alpha: starsK * 0.6, dy: -400, big: 0.6 });
  motes(ctx, t * 0.4, { n: 40, x0: 0, x1: W, y0: 0, y1: H, color: '#ffb35a', a: 0.6 * slow, size: 1.5, rise: 26, drift: 10, seed: 33, glowR: 5 });
  vignette(ctx, 0.75);
}

// ─── the brothers' own shop ──────────────────────────────────────────────

const GY2 = 890;

function emblem(ctx, x, y, w, h, shine) {
  box(ctx, x, y, w, h, '#2a2d31', 1, 6);
  box(ctx, x + 8, y + 8, w - 16, h - 16, '#34383d', 1, 4);
  ctx.save();
  ctx.translate(x + w / 2, y + h / 2);
  // two hammers crossed, and a star over them
  for (const sd of [-1, 1]) {
    ctx.save();
    ctx.rotate(sd * 0.7);
    box(ctx, -5, -38, 10, 76, '#c98a4a', 1, 3);
    box(ctx, -18, -44, 36, 14, '#d9dde2', 1, 3);
    ctx.restore();
  }
  ctx.fillStyle = css('#e8b25a');
  starPath(ctx, 0, -12, 14);
  ctx.fill();
  ctx.restore();
  if (shine > 0 && shine < 1) {
    ctx.save();
    ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip();
    const sx = lerp(x - 80, x + w + 80, shine);
    const g = ctx.createLinearGradient(sx - 40, 0, sx + 40, 0);
    g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(0.5, 'rgba(255,255,255,0.35)'); g.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = g;
    ctx.fillRect(sx - 40, y, 80, h);
    ctx.restore();
  }
}

export function brothers(ctx, t) {
  const zoom = lerp(1, 1.08, smooth(t / 22));
  ctx.save();
  ctx.translate(W / 2, GY2); ctx.scale(zoom, zoom); ctx.translate(-W / 2, -GY2);
  // sky, mountains
  vgrad(ctx, [[0, '#5d97cf'], [0.7, '#a9cbe6'], [1, '#e3eef3']], -100, 650);
  glow(ctx, 260, 120, 400, '#fff6dc', 0.45);
  for (let i = 0; i < 6; i++) {
    const x = ((hash(i, 5) * 2400 + t * 12) % 2400) - 240, y = 90 + hash(i, 6) * 160;
    for (let k = 0; k < 5; k++) radial(ctx, x + k * 50, y + Math.sin(k) * 12, 70 + hash(k + i, 7) * 40, [[0, '#ffffff', 0.55], [1, '#ffffff', 0]]);
  }
  hills(ctx, (x) => 560 - 230 * (0.5 + 0.5 * fbm1(x * 0.0022, 12, 5)) - 60 * Math.exp(-(((x - 1300) / 300) ** 2)), '#8ea3bd');
  hills(ctx, (x) => 640 - 90 * (0.5 + 0.5 * fbm1(x * 0.003, 14)), '#7b8f7a');
  box(ctx, -40, 640, W + 80, H, '#b9ad93');
  // the building
  box(ctx, 380, 190, 1180, GY2 - 190, '#9aa0a6');
  for (let x = 380; x < 1560; x += 26) box(ctx, x, 190, 7, GY2 - 190, '#8b9197');
  ctx.fillStyle = css('#4a4f56');
  ctx.beginPath(); ctx.moveTo(350, 200); ctx.lineTo(970, 110); ctx.lineTo(1590, 200); ctx.closePath(); ctx.fill();
  box(ctx, 470, 330, 520, GY2 - 330, '#d3d6da');
  for (let y = 330; y < GY2; y += 30) box(ctx, 470, y, 520, 4, '#b9bdc2');
  box(ctx, 1220, 500, 110, GY2 - 500, '#355a78');
  circle(ctx, 1312, 700, 5, '#d8c28a');
  box(ctx, 1370, 420, 140, 110, '#e4e8ec'); box(ctx, 1378, 428, 124, 94, '#5a7288');
  // gravel lot
  vgrad(ctx, [[0, '#c4b89e'], [1, '#a89c82']], GY2 - 10, H + 60, -40, W + 80, GY2 - 10, H + 60);
  car(ctx, 1760, GY2 + 40, { s: 1.0, color: '#2f3a48', face: -1 });

  // the sign frame: two posts and a crossbar with hooks
  const S2 = 1.9;
  const PX0 = 700, PX1 = 1230;
  box(ctx, PX0 - 10, 380, 20, GY2 - 380 + 30, '#2a2d31');
  box(ctx, PX1 - 10, 380, 20, GY2 - 380 + 30, '#2a2d31');
  box(ctx, PX0 - 20, 372, PX1 - PX0 + 40, 16, '#2a2d31');
  const lift = ramp(t, 2, 6.2, easeInOut);
  const seated = ramp(t, 6.2, 7.4);
  const signY = lerp(640, 420, lift) - 6 * (1 - seated) * lift;
  const tiltS = (1 - seated) * lift * 0.04;
  // chains
  line(ctx, PX0 + 80, 388, PX0 + 80, signY, '#1a1c1f', 3, lift);
  line(ctx, PX1 - 80, 388, PX1 - 80, signY, '#1a1c1f', 3, seated);
  ctx.save();
  ctx.translate((PX0 + PX1) / 2, signY + 70); ctx.rotate(tiltS); ctx.translate(-(PX0 + PX1) / 2, -(signY + 70));
  emblem(ctx, PX0 + 30, signY, PX1 - PX0 - 60, 140, ramp(t, 8, 9.6));
  ctx.restore();

  // ── the brothers ──
  const him = { skin: '#b08a72', hair: '#2a1f18', top: '#6c7480', bottom: '#34425a', shoes: '#2a2420' };
  const bro = { skin: '#b08a72', hair: '#1d1612', top: '#23262b', bottom: '#34425a', shoes: '#2a2420' };
  const armsUp = lift > 0 && t < 8.6 ? 1 - ramp(t, 7.6, 8.6) : 0;
  const reachUp = armsUp * ramp(t, 1, 2);
  const upP = pose({ s1: lerp(0.15, 2.65, reachUp), e1: lerp(0.2, 0.35, reachUp), s2: lerp(0.15, 2.65, reachUp), e2: lerp(0.2, 0.35, reachUp), h1: 0.08, h2: 0.08 });
  let xB = 860, xH = 1070;
  if (t < 9.2) {
    figure(ctx, 'brother', upP, { x: xB, ground: GY2, s: S2, view: 'front', back: true, sleeves: 'short', colors: bro });
    figure(ctx, 'man', upP, { x: xH, ground: GY2, s: S2, view: 'front', back: true, colors: him });
  } else if (t < 16.4) {
    // turn to each other; a handshake; a high five
    const shake = win(t, 10.4, 14.6, 0.6, 0.6);
    const hi = win(t, 15.1, 15.9, 0.3, 0.3);
    const meet = ramp(t, 9.2, 10.4);
    const pB = blend(P.stand(t, 1), pose({ s1: 0.95 + Math.sin(t * 9) * 0.08 * shake, e1: 0.25, s2: -0.05, e2: 0.2 }), shake);
    const pH = blend(P.stand(t, 2), pose({ s1: 0.95 + Math.sin(t * 9) * 0.08 * shake, e1: 0.25, s2: -0.05, e2: 0.2 }), shake);
    if (hi > 0) { pB.s1 = lerp(pB.s1, 2.7, hi); pB.e1 = lerp(pB.e1, 0.2, hi); pH.s1 = lerp(pH.s1, 2.7, hi); pH.e1 = lerp(pH.e1, 0.2, hi); }
    xB = lerp(860, 900, meet); xH = lerp(1070, 1010, meet);
    figure(ctx, 'man', pH, { x: xH, ground: GY2, s: S2, face: -1, colors: him });
    figure(ctx, 'brother', pB, { x: xB, ground: GY2, s: S2, face: 1, sleeves: 'short', colors: bro });
  } else {
    // side by side, looking at what they made, his arm over his brother's shoulders
    const k = ramp(t, 16.4, 17.6);
    const pB = pose({ s1: 0.08, e1: 0.15, s2: 0.08, e2: 0.15, h1: 0.06, h2: 0.06 });
    const pH = pose({ s1: 0.08, e1: 0.15, s2: lerp(0.08, 1.45, k), e2: lerp(0.15, 0.25, k), h1: 0.05, h2: 0.05 });
    figure(ctx, 'brother', pB, { x: 900, ground: GY2, s: S2, view: 'front', back: true, sleeves: 'short', colors: bro });
    figure(ctx, 'man', pH, { x: 1030, ground: GY2, s: S2, view: 'front', back: true, colors: him });
  }
  // birds
  for (let i = 0; i < 5; i++) {
    const u = (t * 0.05 + hash(i, 9)) % 1;
    const x = lerp(-100, W + 100, u), y = 180 + hash(i, 10) * 120 + Math.sin(t * 2 + i) * 8;
    const f = Math.sin(t * 9 + i * 2) * 6;
    ctx.strokeStyle = css('#2a3440', 0.8); ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(x - 10, y - f); ctx.lineTo(x, y); ctx.lineTo(x + 10, y - f); ctx.stroke();
  }
  ctx.restore();
  vignette(ctx, 0.35);
}
