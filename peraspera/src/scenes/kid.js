// I. The kid — a hill under the stars, and the bedroom where he fell for
// rockets and then, slowly, talked himself out of them.

import { W, H, TAU, clamp, lerp, smooth, ramp, win, keys, hash, noise1, fbm1, css, mix, easeInOut, easeOut } from '../kit.js';
import { vgrad, glow, Starfield, milkyWay, shootingStar, hills, grass, tree, motes, radial, box, rrect, circle, line, layer, text, SANS, vignette } from '../paint.js';
import { figure, P, pose, blend, stride } from '../figure.js';

// ─── the hill (shared with the last scene of the film and the last of the
//     post-credits, which come back to this exact place) ─────────────────

export const STARS = new Starfield(1, 1700, W, H * 2.2);

export const nearHill = (x) => 862 - 78 * Math.exp(-(((x - 800) / 600) ** 2)) - 14 * fbm1(x * 0.004, 9);
const farHill = (x) => 800 - 60 * (0.5 + 0.5 * fbm1(x * 0.0016, 3, 5));

// tilt: how far the world is pushed down (the camera looking up). glowK
// warms the horizon toward dawn.
export function nightSky(ctx, t, tilt = 0, { stars = 1, milky = 0.85, dawn = 0 } = {}) {
  const hz = 800 + tilt;
  vgrad(ctx, [
    [0, mix('#010208', '#0a1233', dawn)],
    [0.45, mix('#060a1f', '#1c2656', dawn)],
    [0.78, mix('#121840', '#5a4a78', dawn)],
    [1, mix('#2b2553', '#e0927a', dawn)],
  ], hz - 1700, hz, -2, W + 4, -2, H + 2);
  milkyWay(ctx, { x: 980, y: 330 + tilt * 0.45, angle: -0.5, alpha: milky * stars });
  STARS.draw(ctx, t, { dy: -560 + tilt * 0.45, alpha: stars });
}

export function nightLand(ctx, t, tilt = 0, { town = 1, flies = 1 } = {}) {
  ctx.save();
  ctx.translate(0, tilt);
  // far ridge with a small town's lights
  hills(ctx, farHill, '#0a0e24');
  for (let i = 0; i < 46; i++) {
    const x = 60 + hash(i, 71) * 520;
    const y = farHill(x) + 6 + hash(i, 72) * 30;
    const a = town * (0.45 + 0.4 * Math.sin(t * (1 + hash(i, 73) * 2) + i)) * (0.5 + hash(i, 74) * 0.5);
    ctx.fillStyle = css(hash(i, 75) > 0.3 ? '#ffcf8a' : '#fff1d6', a);
    ctx.fillRect(x, y, 2, 2);
  }
  glow(ctx, 300, farHill(300) + 20, 320, '#ff9f5a', 0.08 * town);
  // the near hill
  tree(ctx, 1480, nearHill(1480) + 6, 430, '#030409', 2, Math.sin(t * 0.6) * 0.012);
  hills(ctx, nearHill, '#030409');
  grass(ctx, t, nearHill, { color: '#030409', density: 0.7, h: 16, seed: 5, wind: 0.8 });
  if (flies) motes(ctx, t, { n: 26, x0: 100, x1: 1800, y0: 690, y1: 900, color: '#d6ff9a', a: 0.8 * flies, size: 1.6, drift: 20, rise: 2, blink: 1, glowR: 7, seed: 31 });
  ctx.restore();
}

// Lying on the grass: hip position for a body on the hill at x.
export function lieAt(x, s, build = 'man') {
  return { x, y: nearHill(x) - (build === 'kid' ? 8 : 11) * s };
}

// The angle to aim a lying figure's near arm at a point in the sky.
export function aimFromLying(sx, sy, tx, ty) {
  return Math.atan2(-(ty - sy), tx - sx);
}

const KID_SIL = '#030409';

export function sky(ctx, t) {
  const tilt = keys(t, [[0, 780], [6.5, 780], [21, 0]], easeInOut);
  nightSky(ctx, t, tilt, { stars: ramp(t, 0, 7) });

  // a satellite, steady and unblinking, crossing the whole sky
  const su = invl(t, 10, 36);
  const sx = lerp(260, 1650, su), sy = lerp(160, 70, su) + Math.sin(su * Math.PI) * -40 + tilt * 0.45;
  if (su > 0 && su < 1) {
    const a = Math.sin(su * Math.PI) ** 0.5 * 0.95;
    glow(ctx, sx, sy, 10, '#ffffff', a * 0.8);
    circle(ctx, sx, sy, 1.9, '#ffffff', a);
  }
  shootingStar(ctx, invl(t, 25.2, 26.3), 1250, 110 + tilt * 0.45, 1640, 300 + tilt * 0.45, 1);

  nightLand(ctx, t, tilt);

  // the kid, on his back in the grass
  const s = 2.4;
  const hip = lieAt(820, s, 'kid');
  ctx.save();
  ctx.translate(0, tilt);
  const base = P.lieBack(t);
  // raises his arm at 19.5 and follows the satellite with it
  const shoulder = [hip.x - 28 * s, hip.y - 4 * s];
  const aim = aimFromLying(shoulder[0], shoulder[1], sx, sy - tilt);
  const k = ramp(t, 19.5, 21.5, easeOut);
  const k2 = ramp(t, 27.5, 29.5);
  const pz = pose({ ...base,
    s1: lerp(base.s1, aim, k * (1 - k2)) + lerp(0, 0, k2),
    e1: lerp(base.e1, 0.12, k * (1 - k2)),
    neck: base.neck - 0.25 * k,
    h1: base.h1 + Math.sin(t * 0.5) * 0.04, k1: base.k1 + Math.sin(t * 0.5) * 0.08,
  });
  if (k2 > 0) { pz.s1 = lerp(aim, base.s1, k2); pz.e1 = lerp(0.12, base.e1, k2); }
  figure(ctx, 'kid', pz, { x: hip.x, y: hip.y, s, sil: KID_SIL });
  ctx.restore();

  vignette(ctx, 0.55);
}

function invl(t, a, b) { return clamp((t - a) / (b - a)); }

// ─── the bedroom ──────────────────────────────────────────────────────────

const FLOOR = 880;
const WIN = { x: 1320, y: 230, w: 330, h: 400 };
const GLOW_STARS = Array.from({ length: 34 }, (_, i) => ({
  x: 90 + hash(i, 501) * 1180, y: 50 + hash(i, 502) * 170, r: 5 + hash(i, 503) * 6, rot: hash(i, 504) * TAU,
}));

function starShape(ctx, x, y, r, rot) {
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const a = rot + (i * Math.PI) / 5;
    const rr = i % 2 ? r * 0.45 : r;
    ctx.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr);
  }
  ctx.closePath();
  ctx.fill();
}

function windowView(ctx, t, blinds, moonU) {
  const { x, y, w, h } = WIN;
  ctx.save();
  ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip();
  vgrad(ctx, [[0, '#050a1e'], [1, '#1d2552']], y, y + h, x, w, y, y + h);
  STARS.draw(ctx, t, { dx: 0, dy: -300, big: 0.5 });
  // the moon arcs over when time runs fast
  const mx = lerp(x + w * 0.78, x + w * 0.12, moonU), my = y + 110 - Math.sin(moonU * Math.PI) * 50;
  glow(ctx, mx, my, 120, '#cfdcff', 0.25);
  circle(ctx, mx, my, 30, '#e9eefc');
  circle(ctx, mx - 8, my - 6, 6, '#cfd6ea');
  circle(ctx, mx + 9, my + 8, 4, '#d3d9ec');
  // rooftops
  ctx.fillStyle = '#070912';
  ctx.beginPath();
  ctx.moveTo(x, y + h);
  ctx.lineTo(x, y + h - 70); ctx.lineTo(x + 60, y + h - 110); ctx.lineTo(x + 120, y + h - 70);
  ctx.lineTo(x + 170, y + h - 70); ctx.lineTo(x + 170, y + h - 95); ctx.lineTo(x + 250, y + h - 95); ctx.lineTo(x + 290, y + h - 60); ctx.lineTo(x + w, y + h - 60);
  ctx.lineTo(x + w, y + h);
  ctx.fill();
  ctx.fillStyle = css('#ffcc88', 0.7);
  ctx.fillRect(x + 50, y + h - 60, 10, 12);
  ctx.fillRect(x + 200, y + h - 75, 8, 10);
  // blinds
  if (blinds > 0) {
    const bottom = y + h * blinds;
    for (let yy = y; yy < bottom; yy += 13) {
      box(ctx, x, yy, w, 10.5, '#262c45');
      box(ctx, x, yy + 9, w, 1.5, '#161a2c');
    }
  }
  ctx.restore();
  // frame
  ctx.strokeStyle = css('#1d2440'); ctx.lineWidth = 14;
  ctx.strokeRect(x - 7, y - 7, w + 14, h + 14);
  ctx.lineWidth = 6;
  line(ctx, x + w / 2, y, x + w / 2, y + h, '#1d2440', 6);
  line(ctx, x, y + h / 2, x + w, y + h / 2, '#1d2440', 6);
  box(ctx, x - 24, y + h + 6, w + 48, 12, '#1a2038');
  // the blind's roll and cord
  box(ctx, x - 10, y - 18, w + 20, 14, '#20263f');
  line(ctx, x + 16, y - 6, x + 16, y + 60 + blinds * (h - 40), '#aab0c8', 2, 0.55);
  circle(ctx, x + 16, y + 62 + blinds * (h - 40), 4, '#aab0c8', 0.6);
}

function posters(ctx, age) {
  const fade = (c) => mix(c, '#2a2e3c', age * 0.55);
  // Saturn V
  box(ctx, 400, 250, 170, 300, fade('#172550'));
  ctx.save();
  ctx.fillStyle = css(fade('#eef0f6'));
  const rx = 485;
  ctx.fillRect(rx - 11, 300, 22, 190);          // stack
  ctx.beginPath(); ctx.moveTo(rx - 11, 300); ctx.lineTo(rx, 272); ctx.lineTo(rx + 11, 300); ctx.fill();
  ctx.fillRect(rx - 1, 262, 2, 12);             // escape tower
  ctx.fillStyle = css(fade('#1a1a1a'));
  ctx.fillRect(rx - 11, 360, 22, 6); ctx.fillRect(rx - 11, 420, 22, 6); ctx.fillRect(rx - 11, 470, 22, 5);
  ctx.fillStyle = css(fade('#eef0f6'));
  ctx.beginPath(); ctx.moveTo(rx - 11, 470); ctx.lineTo(rx - 22, 492); ctx.lineTo(rx - 11, 490); ctx.fill();
  ctx.beginPath(); ctx.moveTo(rx + 11, 470); ctx.lineTo(rx + 22, 492); ctx.lineTo(rx + 11, 490); ctx.fill();
  circle(ctx, 535, 285, 14, fade('#e8e2cc'));
  ctx.restore();
  text(ctx, 'APOLLO', 485, 530, { face: SANS, size: 18, spacing: 7, color: fade('#e7dcc2') });
  // astronaut
  box(ctx, 612, 285, 150, 196, fade('#241a38'));
  for (let i = 0; i < 16; i++) circle(ctx, 620 + hash(i, 61) * 134, 292 + hash(i, 62) * 180, 1.1, fade('#ffffff'), 0.8);
  circle(ctx, 687, 380, 50, fade('#e9e9ee'));
  ctx.save();
  ctx.fillStyle = css(fade('#c28a2c'));
  ctx.beginPath(); ctx.ellipse(689, 382, 34, 28, 0, 0, TAU); ctx.fill();
  ctx.fillStyle = css(fade('#f3c66a'), 0.8);
  ctx.beginPath(); ctx.ellipse(680, 372, 12, 7, -0.5, 0, TAU); ctx.fill();
  ctx.restore();
  box(ctx, 650, 430, 74, 40, fade('#e9e9ee'), 1, 8);
  if (age > 0) {  // the corner has come unstuck
    ctx.fillStyle = css('#141a30');
    ctx.beginPath(); ctx.moveTo(762, 285); ctx.lineTo(762, 325); ctx.lineTo(722, 285); ctx.fill();
    ctx.fillStyle = css(mix('#3a3a4a', '#241a38', 0.4));
    ctx.beginPath(); ctx.moveTo(722, 285); ctx.lineTo(762, 325); ctx.lineTo(730, 318); ctx.fill();
  }
  // an agency roundel
  const cx = 880, cy = 370;
  circle(ctx, cx, cy, 64, fade('#0b3d91'));
  for (let i = 0; i < 9; i++) circle(ctx, cx - 40 + hash(i, 81) * 80, cy - 40 + hash(i, 82) * 80, 1.4, fade('#ffffff'));
  ctx.save();
  ctx.strokeStyle = css(fade('#ffffff')); ctx.lineWidth = 2.5;
  ctx.beginPath(); ctx.ellipse(cx + 4, cy + 4, 58, 16, -0.45, 0, TAU); ctx.stroke();
  ctx.fillStyle = css(fade('#fc3d21'));
  ctx.beginPath();
  ctx.moveTo(cx - 62, cy + 26); ctx.quadraticCurveTo(cx, cy - 10, cx + 58, cy - 44);
  ctx.quadraticCurveTo(cx + 10, cy - 2, cx - 50, cy + 36); ctx.closePath(); ctx.fill();
  ctx.restore();
}

function room(ctx, t, age, blinds, moonU, lamp) {
  // wall
  vgrad(ctx, [[0, mix('#0e1430', '#10131f', age)], [1, mix('#182044', '#191c2c', age)]], 0, FLOOR);
  // wall glow from the window
  glow(ctx, WIN.x + WIN.w / 2, WIN.y + WIN.h / 2, 700, '#5a6ea8', 0.10 * (1 - blinds), 'source-over');
  // glow-in-the-dark stars on the ceiling edge; they lose their glow as he grows up
  const gs = lerp(0.75, 0.07, age);
  ctx.save();
  for (const s of GLOW_STARS) {
    ctx.fillStyle = css('#d8ffb0', gs * (0.75 + 0.25 * Math.sin(t * 0.8 + s.x)));
    starShape(ctx, s.x, s.y, s.r, s.rot);
  }
  ctx.restore();
  if (gs > 0.2) for (const s of GLOW_STARS) glow(ctx, s.x, s.y, s.r * 3.2, '#b6ff8a', gs * 0.18);
  posters(ctx, age);
  // shelf and the model rocket
  box(ctx, 1040, 560, 210, 10, '#241c22');
  line(ctx, 1060, 570, 1068, 590, '#241c22', 4);
  line(ctx, 1230, 570, 1222, 590, '#241c22', 4);
  const dusty = mix('#f0f0f4', '#6a6c78', age);
  ctx.fillStyle = css(dusty);
  ctx.fillRect(1133, 470, 16, 88);
  ctx.beginPath(); ctx.moveTo(1133, 470); ctx.quadraticCurveTo(1141, 438, 1149, 470); ctx.fill();
  ctx.fillStyle = css(mix('#d8352a', '#5a3a3a', age));
  ctx.beginPath(); ctx.moveTo(1133, 530); ctx.lineTo(1118, 558); ctx.lineTo(1133, 556); ctx.fill();
  ctx.beginPath(); ctx.moveTo(1149, 530); ctx.lineTo(1164, 558); ctx.lineTo(1149, 556); ctx.fill();
  ctx.fillRect(1133, 500, 16, 5);
  // floor
  vgrad(ctx, [[0, '#0b0e1d'], [1, '#05060d']], FLOOR, H);
  for (let i = 0; i < 9; i++) line(ctx, 0, FLOOR + 12 + i * i * 3.2, W, FLOOR + 12 + i * i * 3.2, '#000000', 1, 0.35);
  box(ctx, 0, FLOOR - 6, W, 8, '#0d1122');
  windowView(ctx, t, blinds, moonU);
  // moonlight on the floor
  const ml = (1 - blinds) * 0.13;
  if (ml > 0.002) {
    ctx.save();
    ctx.fillStyle = css('#a9bcff', ml);
    ctx.beginPath();
    ctx.moveTo(1110, FLOOR); ctx.lineTo(1470, FLOOR); ctx.lineTo(1340, H); ctx.lineTo(880, H); ctx.closePath(); ctx.fill();
    ctx.fillStyle = css('#05060d', ml * 3);
    ctx.fillRect(1175, FLOOR, 8, H - FLOOR);
    ctx.restore();
  }
  // bed
  box(ctx, 170, 540, 40, FLOOR - 540, '#221a26', 1, 6);
  if (lamp === 0) box(ctx, 205, 640, 110, 70, '#5a5070', 1, 26);
  box(ctx, 210, 705, 740, 60, '#2a2130');
  box(ctx, 930, 720, 26, FLOOR - 720, '#221a26');
  box(ctx, 215, 760, 12, FLOOR - 760, '#1a141e');
  if (lamp > 0) {
    // the desk and its lamp
    box(ctx, 1020, 648, 270, 16, '#2b2228');
    box(ctx, 1030, 664, 14, FLOOR - 664, '#221a20');
    box(ctx, 1266, 664, 14, FLOOR - 664, '#221a20');
    box(ctx, 1150, 664, 120, 70, '#241c22');
    for (let i = 0; i < 4; i++) {
      ctx.save(); ctx.translate(1080 + i * 30, 645); ctx.rotate((hash(i, 88) - 0.5) * 0.4);
      box(ctx, -30, -3, 60, 3, '#d8d2c4'); line(ctx, -18, -2, 8, -2, '#b23a2e', 2, 0.8);
      ctx.restore();
    }
    line(ctx, 1262, 648, 1250, 560, '#191419', 6);
    line(ctx, 1250, 560, 1205, 535, '#191419', 6);
    ctx.fillStyle = css('#191419');
    ctx.beginPath(); ctx.moveTo(1188, 522); ctx.lineTo(1224, 544); ctx.lineTo(1200, 572); ctx.lineTo(1170, 555); ctx.fill();
  }
}

export function bedroom(ctx, t) {
  const zoom = lerp(1, 1.07, smooth(t / 36));
  ctx.save();
  ctx.translate(W / 2, H / 2); ctx.scale(zoom, zoom); ctx.translate(-W / 2, -H / 2 - 10 * smooth(t / 36));

  const age = ramp(t, 15, 21);           // the dissolve from boy to teenager
  const moonU = 0.15 + ramp(t, 14, 21, (k) => k) * 2.4 % 1;
  const blinds = ramp(t, 30.2, 31.7, easeInOut);

  // ── the boy, reading by flashlight ──
  if (age < 1) {
    layer(ctx, 1, (g) => {
      room(g, t, 0, 0, t < 14 ? 0.15 : 0.15 + (moonU - 0.15), 0);
      const s = 3.5;
      const look = ramp(t, 11.5, 13.2) * (1 - ramp(t, 17, 18));
      const read = pose({
        lean: -0.2, neck: lerp(0.35, -0.35, look),
        h1: 1.52, k1: 0.12, h2: 1.48, k2: 0.1,
        s1: lerp(1.25, 0.8, look), e1: lerp(1.0, 1.4, look), s2: lerp(1.1, 0.7, look), e2: lerp(1.25, 1.5, look),
      });
      const J = figure(g, 'kid', read, { x: 290, y: 712, s, colors: { skin: '#8d7b8c', hair: '#211a26', top: '#3a5488', bottom: '#2d4270', shoes: '#2d4270' } });
      // the book and the flashlight
      const bx = (J.hand1[0] + J.hand2[0]) / 2, by = (J.hand1[1] + J.hand2[1]) / 2;
      g.save();
      g.translate(bx + 6, by - 8);
      g.rotate(lerp(-0.5, 0.3, look));
      g.scale(2.1, 2.1);
      box(g, -2, -22, 30, 40, '#e9e1cc');
      box(g, -2, -22, 30, 40, '#b33a2e', 0.0);
      line(g, 0, -22, 0, 18, '#8a7f6a', 2);
      // a page turning
      const pt = Math.max(win(t, 3.5, 4.4, 0.45, 0.45), win(t, 11, 11.9, 0.45, 0.45));
      if (pt > 0) { g.save(); g.scale(1 - pt * 2 > -1 ? Math.cos(pt * Math.PI) : 1, 1); box(g, 0, -22, 28, 40, '#f4eedf'); g.restore(); }
      g.restore();
      const fl = 1 - look;
      glow(g, bx + 30, by - 20, 240, '#ffd98a', 0.5 * fl + 0.12);
      glow(g, bx + 30, by - 20, 60, '#fff4d0', 0.5 * fl);
      // blanket
      g.fillStyle = css('#3f3150');
      g.beginPath();
      g.moveTo(330, 770); g.lineTo(330, 700);
      g.quadraticCurveTo(380, 668, 450, 676);
      g.quadraticCurveTo(560, 640, 640, 684);
      g.quadraticCurveTo(760, 700, 940, 706);
      g.lineTo(940, 770); g.closePath(); g.fill();
      g.strokeStyle = css('#2c2238'); g.lineWidth = 3;
      g.beginPath(); g.moveTo(420, 715); g.quadraticCurveTo(600, 700, 900, 725); g.stroke();
      // pillow
    });
  }

  // ── the teenager, who has decided ──
  if (age > 0) {
    layer(ctx, age, (g) => {
      room(g, t, 1, blinds, 0.45 + (moonU - 0.15) * 0.1, 1);
      // an empty bed, unmade
      g.fillStyle = css('#312840');
      g.beginPath(); g.moveTo(230, 712); g.quadraticCurveTo(420, 690, 560, 706); g.quadraticCurveTo(760, 716, 940, 708); g.lineTo(940, 770); g.lineTo(230, 770); g.fill();
      box(g, 215, 676, 72, 36, '#4a4260', 1, 16);

      const s = 3.3;
      const colors = { skin: '#8d7b8c', hair: '#1c1720', top: '#363c56', bottom: '#262d44', shoes: '#141620' };
      const slump = pose({ lean: 1.0 + Math.sin(t * 1.1) * 0.015, neck: 0.25, h1: 1.5, k1: 1.45, h2: 1.44, k2: 1.4, s1: 0.45, e1: 1.9, s2: 0.35, e2: 1.95 });
      const sitUp = pose({ lean: 0.08, neck: 0.4, h1: 1.5, k1: 1.45, h2: 1.44, k2: 1.4, s1: 0.2, e1: 0.4, s2: 0.1, e2: 0.4 });
      let pz, x = 960;
      const rise = ramp(t, 25.6, 26.6), stand = ramp(t, 26.6, 27.4);
      const walkU = ramp(t, 27.3, 29.6, (k) => k);
      const reach = ramp(t, 29.6, 30.2), pull = ramp(t, 30.2, 31.7, easeInOut);
      if (t < 26.6) pz = blend(slump, sitUp, rise);
      else if (t < 27.3) pz = blend(sitUp, P.stand(t, 3), stand);
      else if (walkU < 1) {
        x = lerp(960, 1240, smooth(walkU));
        pz = blend(P.walk(stride(x - 960, s)), P.stand(t, 3), ramp(t, 29.2, 29.6));
      } else {
        x = 1240;
        pz = P.stand(t, 3);
      }
      if (t >= 29.6) {
        pz.s1 = lerp(pz.s1, lerp(2.62, 1.75, pull), reach);
        pz.e1 = lerp(pz.e1, lerp(0.35, 0.2, pull), reach);
        pz.neck = lerp(0.1, 0.55, ramp(t, 31, 33));
        pz.lean = 0.03;
      }
      {
        // chair
        box(g, 880, 732, 150, 14, '#241b22');
        box(g, 888, 746, 12, FLOOR - 746, '#1c151a'); box(g, 1010, 746, 12, FLOOR - 746, '#1c151a');
        box(g, 868, 520, 16, 226, '#241b22', 1, 4);
      }
      figure(g, 'teen', pz, { x, ground: FLOOR, s, colors });
      glow(g, 1195, 580, 360, '#ffc070', 0.3);
      glow(g, 1195, 560, 50, '#fff0c8', 0.45);
    });
  }
  ctx.restore();
  vignette(ctx, 0.7);
}
