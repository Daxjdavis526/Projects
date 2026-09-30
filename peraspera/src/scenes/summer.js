// VIII. Summer — leaving her in the driveway, the doors, the good people
// going home one by one, and the nights.

import { W, H, TAU, clamp, lerp, smooth, ramp, win, keys, hash, noise1, fbm1, css, mix, easeInOut, easeIn, easeOut } from '../kit.js';
import { vgrad, glow, box, circle, line, radial, vignette, layer, rrect, text, SANS, haze, castShadow, hills, tree, fill, motes } from '../paint.js';
import { figure, P, pose, blend, stride } from '../figure.js';
import { car, house, suitcase, streetlamp, fence } from '../props.js';
import { STARS } from './kid.js';

const HIM = { skin: '#b08a76', hair: '#2a2018', top: '#46607e', bottom: '#6c5f4c', shoes: '#2a241e' };
const HER = { skin: '#b08a76', hair: '#4a3222', top: '#b86a6a', bottom: '#3a4458', shoes: '#2a2428' };

// ─── leaving ─────────────────────────────────────────────────────────────

export function leaving(ctx, t) {
  const GY = 880;
  const push = ramp(t, 14, 28, easeInOut);
  ctx.save();
  const z = lerp(1, 1.35, push), cx = lerp(960, 560, push), cy = lerp(700, 640, push);
  ctx.translate(960, lerp(700, 620, push)); ctx.scale(z, z); ctx.translate(-cx, -cy);
  vgrad(ctx, [[0, '#9fb8d6'], [0.7, '#e8d6c6'], [1, '#f3dcc0']], -300, GY, -600, W + 1200, -400, GY + 10);
  glow(ctx, 160, 300, 700, '#fff0d8', 0.5);
  hills(ctx, (x) => 640 - 100 * (0.5 + 0.5 * fbm1(x * 0.0018, 91)), '#a7b3bf', 1, -600, W + 600);
  tree(ctx, 1500, GY, 480, '#56644e', 11);
  tree(ctx, 1760, GY, 380, '#4c5a46', 12);
  house(ctx, 470, GY, { w: 660, h: 330, roof: 170, wall: '#d6c4ac', roofC: '#5a4a44', door: '#3f5a6c', garage: true, lit: 0 });
  box(ctx, -300, GY, W + 600, H, '#8fa074');
  box(ctx, 720, GY, 700, 60, '#cfc6b6');
  vgrad(ctx, [[0, '#8fa074'], [1, '#6e7c5a']], GY + 60, H + 200, -300, W + 600, GY + 60, H + 200);

  // the car, loaded; he gets in; it goes
  const drive = t < 11 ? 0 : easeIn(clamp((t - 11) / 5.5)) * 1500;
  const shake = t > 9.5 && t < 11.2 ? Math.sin(t * 60) * 1.2 : 0;
  car(ctx, 1060 + drive, GY + 36, { s: 1.35, color: '#6d7a88', glass: '#2a3440', roll: drive, heads: t > 8 ? 1 : 0, headColor: '#2a2420', loaded: true, bounce: shake, tail: t > 9.5 ? 1 : 0 });

  // the two of them
  const S = 2.0;
  const hug = win(t, 0, 6.6, 0.01, 0.8);
  const leaveU = ramp(t, 6.6, 7.9, (k) => k);
  const wave = win(t, 10.8, 16.8, 0.5, 0.8);
  const hold = ramp(t, 17.5, 19);
  // her
  let pW = P.stand(t, 3);
  const hugP = pose({ lean: 0.08, neck: 0.25, s1: 1.25, e1: 1.3, s2: 1.1, e2: 1.4, h1: 0.05, h2: -0.02 });
  pW = blend(pW, hugP, hug);
  if (wave > 0) { pW.s1 = lerp(pW.s1, 2.7, wave); pW.e1 = lerp(pW.e1, 0.5 + Math.sin(t * 8) * 0.35, wave); }
  if (hold > 0) {
    pW.s1 = lerp(pW.s1, 0.85, hold); pW.e1 = lerp(pW.e1, 1.9, hold);
    pW.s2 = lerp(pW.s2, 0.8, hold); pW.e2 = lerp(pW.e2, 1.95, hold);
    pW.neck = lerp(pW.neck, 0.45, ramp(t, 19, 22));
  }
  const faceW = t < 7.2 ? -1 : 1;
  figure(ctx, 'woman', pW, { x: 890, ground: GY + 30, s: S * 0.94, face: faceW, colors: HER, hairSway: Math.sin(t * 1.1) * 2 });
  // him
  if (t < 8.2) {
    let pH = blend(P.stand(t, 1), pose({ lean: 0.1, neck: 0.3, s1: 1.3, e1: 1.25, s2: 1.2, e2: 1.35 }), hug);
    let x = 820;
    if (leaveU > 0) { x = lerp(820, 1010, smooth(leaveU)); pH = blend(pH, P.walk(stride(x - 820, S)), ramp(t, 6.6, 7)); }
    figure(ctx, 'man', pH, { x, ground: GY + 30, s: S, face: 1, colors: HIM, alpha: 1 - ramp(t, 7.6, 8.2) });
  }
  ctx.restore();
  vignette(ctx, 0.35);
}

// ─── the doors ───────────────────────────────────────────────────────────

const CUTS = [[9.5, 10.2, 11.6], [12.4, 13.3, 14.6], [15.3, 16.1, 17.2], [17.9, 18.6, 19.5], [20.1, null, 20.7], [21.1, null, 21.6]];
const DOORC = ['#7a4a2a', '#e8e4dc', '#8a2a2a', '#5a6068', '#2a4a3a', '#3a3a50'];
const WORDS = [
  [22.8, 'LIE IF YOU HAVE TO', 520, 250, 58],
  [24.0, 'YOU’RE SOFT', 1420, 330, 64],
  [25.0, 'CLOSE HIM', 420, 560, 70],
  [26.1, 'NOBODY QUITS', 1480, 620, 56],
  [27.0, 'SAY WHATEVER WORKS', 960, 180, 50],
  [28.0, 'WORTHLESS', 1440, 470, 76],
  [29.0, 'DON’T YOU DARE GO HOME', 640, 720, 50],
];

function glare(ctx, k = 1) {
  glow(ctx, 1640, 110, 1300, '#fff6d8', 0.5 * k, 'screen');
  glow(ctx, 1640, 110, 160, '#ffffff', 0.9 * k);
}

function street(ctx, t, scroll, S, cycle) {
  // a sky that cycles through whole days when `cycle` is set
  let skyTop = '#efe4c8', skyBot = '#e6c28a', sunK = 1;
  if (cycle !== undefined) {
    const d = (cycle % 1);
    const night = win(d, 0.62, 1.0, 0.1, 0.1);
    const dusk = win(d, 0.5, 0.72, 0.08, 0.08);
    skyTop = mix(mix('#efe4c8', '#b86a4a', dusk), '#0e1226', night);
    skyBot = mix(mix('#e6c28a', '#f0985a', dusk), '#1a2040', night);
    sunK = 1 - Math.max(night, dusk * 0.6);
  }
  vgrad(ctx, [[0, skyTop], [1, skyBot]], 0, 840);
  if (sunK > 0) glare(ctx, sunK);
  haze(ctx, t, 3, (g) => {
    for (let k = -1; k < 6; k++) {
      const x = ((k * 520 - scroll) % 3120 + 3120) % 3120 - 520;
      house(g, x + 260, 820, { w: 440, h: 240, roof: 110, wall: '#dccaa8', roofC: '#9a8672', door: '#8a7a6a', win: '#4a4640', garage: true });
      box(g, x + 30, 820, 480, 40, '#c9bf82');
    }
  });
  box(ctx, -40, 820, W + 80, 60, '#bdb27a');
  box(ctx, -40, 880, W + 80, 60, '#dcd4c2');
  box(ctx, -40, 940, W + 80, H - 940, '#8a8474');
}

function tablet(ctx, J) {
  ctx.save();
  ctx.translate(J.hand1[0], J.hand1[1]);
  ctx.rotate(-0.4);
  box(ctx, -8, -30, 30, 42, '#1e2228', 1, 3);
  box(ctx, -5, -27, 24, 36, '#8aa0b8', 0.7, 2);
  ctx.restore();
}

function doorShot(ctx, t, i, t0, knock, slam) {
  const cut = t - t0;
  const shake = slam !== null && t > slam ? Math.exp(-(t - slam) * 9) * 14 : 0;
  ctx.save();
  ctx.translate(Math.sin(t * 90) * shake, Math.cos(t * 77) * shake * 0.6);
  const wall = ['#d8c6a4', '#cbb898', '#d2c2a8', '#c8bca4', '#d6c8ac', '#cdbc9c'][i];
  box(ctx, -40, -40, W + 80, H + 80, wall);
  for (let y = 0; y < H; y += 34) box(ctx, -40, y, W + 80, 2, mix(wall, '#000', 0.08));
  // porch
  box(ctx, -40, 930, W + 80, H, '#a89c86');
  box(ctx, 900, 920, 640, 20, '#bdb29c');
  // the door, its frame, a little window and a bell
  const dx = 1020, dy = 250, dw = 400, dh = 680;
  box(ctx, dx - 30, dy - 30, dw + 60, dh + 30, '#efe9dc');
  const open = slam === null ? 0 : knock !== null ? win(t, knock + 0.7, slam, 0.25, 0.08) : 0;
  box(ctx, dx, dy, dw, dh, '#1a1714');
  if (open > 0) {
    // the gap, and a face-shaped shadow in it
    circle(ctx, dx + 40, dy + 240, 34, '#2c2622', open);
  }
  const leaf = dw * (1 - open * 0.26);
  box(ctx, dx + dw - leaf, dy, leaf, dh, DOORC[i]);
  box(ctx, dx + dw - leaf + leaf * 0.12, dy + 60, leaf * 0.76, 230, mix(DOORC[i], '#000', 0.12));
  box(ctx, dx + dw - leaf + leaf * 0.12, dy + 350, leaf * 0.76, 280, mix(DOORC[i], '#000', 0.12));
  circle(ctx, dx + dw - leaf + 36, dy + 360, 9, '#c9a45a');
  box(ctx, dx + dw + 60, dy + 300, 22, 34, '#efe9dc', 1, 4);
  circle(ctx, dx + dw + 71, dy + 317, 6, '#b8b0a0');
  // him, close, facing the door
  const S = 2.9;
  let pz = pose({ ...P.stand(t, i), neck: 0.1, s1: 0.75, e1: 1.2 });
  if (knock !== null) {
    const kn = win(t, knock - 0.35, knock + 0.35, 0.2, 0.2);
    pz.s2 = lerp(pz.s2, 1.3, kn); pz.e2 = lerp(pz.e2, 1.3, kn) + Math.sin(t * 30) * 0.15 * kn;
  }
  if (slam !== null && t > slam) { pz.neck = lerp(0.1, 0.45, ramp(t, slam + 0.1, slam + 0.6)); }
  const J = figure(ctx, 'man', pz, { x: 720, ground: 1010, s: S, colors: HIM });
  tablet(ctx, J);
  glare(ctx, 0.5);
  ctx.restore();
}

export function doors(ctx, t) {
  if (t < 9.5) {
    // walking the same street in the heat
    const S = 2.0;
    const scroll = t * 120;
    street(ctx, t, scroll, S);
    const pz = P.walk(stride(scroll, S), 0.85);
    pz.neck = 0.3; pz.lean = 0.1;
    pz.s1 = 0.8; pz.e1 = 1.3;
    const J = figure(ctx, 'man', pz, { x: 820, ground: 920, s: S, colors: HIM });
    tablet(ctx, J);
    ctx.fillStyle = css('#fff4d8', 0.18); ctx.fillRect(0, 0, W, H);
  } else if (t < 22.4) {
    let i = 0;
    for (let k = 0; k < CUTS.length; k++) if (t >= CUTS[k][0]) i = k;
    const [t0, knock, slam] = CUTS[i];
    doorShot(ctx, t, i, t0, knock, slam);
  } else if (t < 31) {
    // the people running it
    const k = ramp(t, 22.4, 30);
    fill(ctx, '#2a2420');
    radial(ctx, 960, 820, 700, [[0, '#6a5a48', 0.6], [1, '#2a2420', 0]]);
    box(ctx, -40, 880, W + 80, H, '#1c1814');
    const S = 1.7;
    const me = pose({ ...P.stand(t, 7), neck: lerp(0.2, 0.55, k), lean: 0.05, s1: 0.7, e1: 1.3 });
    const J = figure(ctx, 'man', me, { x: 960, ground: 880, s: S, colors: { ...HIM, top: '#3a4a5c', bottom: '#4a4236' } });
    tablet(ctx, J);
    const closeIn = ramp(t, 22.4, 31, easeInOut);
    const bosses = [[-1, 260 + 140 * closeIn, 0.5], [1, 1660 - 140 * closeIn, 0.7], [-1, 560 + 60 * closeIn, 0.9]];
    for (const [side, bx, ph] of bosses) {
      const point = win(t, 22.6 + ph * 3, 31, 0.6, 0.5);
      const bp = pose({ ...P.stand(t, ph * 10), lean: 0.22 + Math.sin(t * 1.5 + ph) * 0.02, neck: 0.25, s1: lerp(0.1, 1.45, point), e1: lerp(0.2, 0.05, point) });
      figure(ctx, side < 0 ? 'brother' : 'man', bp, { x: bx, ground: 1180, s: 4.6, face: -side, sil: '#0b0908' });
    }
    for (const [at, str, x, y, size] of WORDS) {
      const a = win(t, at, at + 2.8, 0.15, 0.9);
      if (a <= 0) continue;
      const jit = (1 - ramp(t, at, at + 0.4)) * 10;
      const sc = 1 + 0.18 * (1 - easeOut(ramp(t, at, at + 0.35)));
      ctx.save();
      ctx.translate(x + Math.sin(t * 50) * jit, y);
      ctx.scale(sc, sc);
      text(ctx, str, 0, 0, { face: SANS, size, weight: 600, spacing: 4, color: str === 'WORTHLESS' ? '#d8463a' : '#efe2cf', alpha: a * 0.92 });
      ctx.restore();
    }
    vignette(ctx, 0.8);
  } else {
    // day after day after day
    const cyc = (t - 31) / 2.6;
    const S = 2.0;
    const scroll = (t - 31) * 420;
    street(ctx, t, scroll + 3000, S, cyc);
    const night = win(cyc % 1, 0.62, 1.0, 0.1, 0.1);
    ctx.fillStyle = css('#0a0e1e', 0.55 * night); ctx.fillRect(0, 0, W, H);
    const pz = P.walk(stride(scroll * 0.55, S), 0.8);
    pz.neck = 0.4; pz.lean = 0.12; pz.s1 = 0.8; pz.e1 = 1.3;
    const J = figure(ctx, 'man', pz, { x: 900, ground: 920, s: S, colors: HIM });
    tablet(ctx, J);
  }
  vignette(ctx, 0.4);
}

// ─── the good ones go home ───────────────────────────────────────────────

const LOT = 900;
const CREW = [
  // x, departure time, build, colours
  [560, 6.4, 'man', '#7a5a4a'],
  [720, 9.4, 'woman', '#5a6a8a'],
  [880, 8.0, 'man', '#6a7a5a'],
  [1040, 10.8, 'man', '#8a6a5a'],
  [1360, 4.2, 'woman', '#7a5a6a'],
];

export function goodbyes(ctx, t) {
  const pull = ramp(t, 13, 30, easeInOut);
  ctx.save();
  const z = lerp(1.12, 0.96, pull);
  ctx.translate(960, 760); ctx.scale(z, z); ctx.translate(-lerp(1000, 1080, pull), -760);
  vgrad(ctx, [[0, '#3a3058'], [0.55, '#b0607a'], [1, '#f09a6a']], -200, 720, -400, W + 800, -300, 720);
  glow(ctx, 260, 640, 800, '#ffb07a', 0.4);
  // apartment block, dark against the sky
  box(ctx, -300, 360, 1500, 380, '#2a2230');
  for (let r = 0; r < 3; r++) for (let c = 0; c < 12; c++) {
    const lit = hash(r * 12 + c, 4) > 0.7 ? 1 : 0;
    box(ctx, -250 + c * 120, 400 + r * 110, 60, 60, lit ? '#ffcf8a' : '#3a3040', lit ? 0.8 : 1);
  }
  box(ctx, -300, 340, 1500, 24, '#211a26');
  box(ctx, 1200, 480, 1100, 260, '#2e2634');
  // parked cars, a lamp that will come on
  car(ctx, 1600, 760, { s: 1.0, sil: '#1d1822' });
  car(ctx, 2100, 760, { s: 1.0, sil: '#1d1822' });
  const lampOn = ramp(t, 17.8, 18.1) * (0.8 + 0.2 * Math.sin(t * 30) * (1 - ramp(t, 18.1, 19)));
  streetlamp(ctx, 1500, 760, { h: 480, on: lampOn, color: '#ffb866' });
  // asphalt and stripes
  vgrad(ctx, [[0, '#3a3440'], [1, '#1c1a22']], 740, H + 200, -400, W + 800, 740, H + 200);
  for (let k = -4; k < 16; k++) line(ctx, k * 200, 760, k * 200 - 120, 1060, '#d8d0c0', 4, 0.35);

  // the van they leave in
  const vanGo = ramp(t, 12, 17, easeIn);
  car(ctx, -80 - vanGo * 900, 820, { s: 1.25, sil: '#1a1520', tail: t > 11.5 ? 1 : 0, face: -1 });

  const S = 1.9;
  const sil = '#21182a';
  // the others: each picks up a bag, turns, and walks away left
  for (const [x0, dep, build] of CREW) {
    const go = t - dep;
    let x = x0, pz = pose({ ...P.stand(t, x0), s1: 0.1 }), face = 1, view = 'front', alpha = 1;
    if (go > 0) {
      view = 'side'; face = -1;
      const d = Math.max(0, go - 0.5) * 150;
      x = x0 - d;
      pz = blend(P.stand(t, x0), P.walk(stride(d, S)), ramp(go, 0.3, 0.8));
      pz.s2 = 0.05; pz.e2 = 0.1;
      alpha = 1 - ramp(x, 100, -150);
    }
    if (alpha <= 0) continue;
    const ground = LOT + (go > 0 ? ramp(go, 0.4, 2) * 30 : 0);
    castShadow(ctx, ground, 1.6, 0.35, 0.25 * alpha, (g) => figure(g, build, pz, { x, ground, s: S, view, face, sil: '#000' }));
    const J = figure(ctx, build, pz, { x, ground, s: S, view, face, sil, alpha });
    if (go > 0) {
      ctx.save(); ctx.globalAlpha = alpha;
      suitcase(ctx, J.hand2[0] + 26, ground, { s: 1.3, color: sil, handle: 0.7 });
      ctx.restore();
    } else {
      suitcase(ctx, x + 50, LOT, { s: 1.3, color: sil, handle: 0 });
    }
  }
  // him, who stays
  const me = pose({ ...P.stand(t, 99), neck: lerp(0.05, 0.4, ramp(t, 12, 16)), s1: 0.08, s2: -0.02 });
  castShadow(ctx, LOT, 1.6, 0.35, 0.3, (g) => figure(g, 'man', me, { x: 1200, ground: LOT, s: S, view: 'front', sil: '#000' }));
  figure(ctx, 'man', me, { x: 1200, ground: LOT, s: S, view: 'front', sil });
  ctx.restore();
  vignette(ctx, 0.55);
}

// ─── the nights ──────────────────────────────────────────────────────────

const FLOOR = 900;
const WIN = { x: 1300, y: 250, w: 360, h: 380 };

function roomLight(t) {
  // day/night through the first 22 s, then night
  if (t >= 17.6) return { day: 0, night: 1 };
  const u = (t % 4.4) / 4.4;
  const day = 1 - ramp(u, 0.3, 0.5);
  return { day: day * (t < 17.6 ? 1 : 0), night: 1 - day, u };
}

export function nights(ctx, t) {
  ctx.save();
  const zz = lerp(1.22, 1.3, smooth(t / 46));
  ctx.translate(900, 760); ctx.scale(zz, zz); ctx.translate(-860, -760);
  const L = roomLight(t);
  const visit = win(t, 23.2, 30.6, 0.6, 0.6);
  const warm = visit;
  const wallC = mix(mix('#1a1e2a', '#6a6e78', L.day), '#3a2a24', warm * 0.6);
  box(ctx, -40, -40, W + 80, FLOOR + 40, wallC);
  box(ctx, -40, FLOOR, W + 80, H, mix(mix('#0e1016', '#3a3a40', L.day), '#2a1e18', warm * 0.5));
  box(ctx, -40, FLOOR - 10, W + 80, 12, mix('#12141c', '#50525a', L.day));
  // window: sky through the slats
  const { x, y, w, h } = WIN;
  ctx.save();
  ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip();
  vgrad(ctx, [[0, mix('#0a0e22', '#bcd0e8', L.day)], [1, mix('#1c2240', '#f0e0c0', L.day)]], y, y + h, x, w, y, y + h);
  if (L.day < 0.5) STARS.draw(ctx, t, { alpha: 1 - L.day * 2, dx: -200, dy: -500, big: 0.4 });
  for (let yy = y; yy < y + h * 0.55; yy += 16) box(ctx, x, yy, w, 11, mix('#262a36', '#b8b6ae', L.day));
  ctx.restore();
  ctx.strokeStyle = css(mix('#232734', '#8a8a90', L.day)); ctx.lineWidth = 14; ctx.strokeRect(x - 7, y - 7, w + 14, h + 14);
  // slatted light on the wall and floor
  const lc = L.day > 0.5 ? '#fff0d0' : '#ffb35a';
  const la = L.day > 0.5 ? 0.16 * L.day : 0.08 * L.night;
  ctx.save();
  ctx.fillStyle = css(lc, la);
  for (let k = 0; k < 7; k++) {
    const yy = 520 + k * 34;
    ctx.beginPath(); ctx.moveTo(760, yy); ctx.lineTo(1150, yy - 60); ctx.lineTo(1150, yy - 44); ctx.lineTo(760, yy + 16); ctx.fill();
  }
  ctx.restore();
  // calendar, filling with crosses
  box(ctx, 780, 250, 230, 250, mix('#8a8a86', '#e8e4da', L.day * 0.6 + 0.2));
  box(ctx, 780, 250, 230, 40, '#9a3a2e');
  const crossed = Math.floor(lerp(12, 64, ramp(t, 0, 22, (k) => k)));
  for (let d = 0; d < 35; d++) {
    const cx = 795 + (d % 7) * 30, cy = 305 + Math.floor(d / 7) * 38;
    box(ctx, cx, cy, 24, 30, '#000', 0.06);
    if (d < crossed % 35 || crossed >= 35 + d) {
      ctx.strokeStyle = css('#8a2a22', 0.8); ctx.lineWidth = 2.5;
      ctx.beginPath(); ctx.moveTo(cx + 3, cy + 4); ctx.lineTo(cx + 21, cy + 26); ctx.moveTo(cx + 21, cy + 4); ctx.lineTo(cx + 3, cy + 26); ctx.stroke();
    }
  }
  // the door to the left, and the mattress on the floor
  const doorOpen = win(t, 23.2, 30.5, 0.5, 0.4);
  box(ctx, 90, 330, 250, FLOOR - 330, '#07080b');
  if (doorOpen > 0) {
    box(ctx, 90, 330, 250, FLOOR - 330, '#ffc27a', doorOpen);
    glow(ctx, 215, 620, 700, '#ffb060', 0.45 * doorOpen);
  }
  box(ctx, 90 + 250 * doorOpen * 0.8, 330, 250 * (1 - doorOpen * 0.8), FLOOR - 330, mix('#2a2622', '#6a6258', L.day));
  box(ctx, 80, 320, 270, 12, mix('#20222a', '#7a7a80', L.day));
  box(ctx, 420, 850, 460, 50, mix('#2a2e3a', '#8a8a92', L.day), 1, 10);
  box(ctx, 440, 836, 110, 26, mix('#3a3e4a', '#9a9aa2', L.day), 1, 10);

  const S = 2.3;
  const sob = 1;
  // ── the time-lapse: gone all day, on the floor every night ──
  if (t < 23.4) {
    const here = t >= 17.6 ? 1 : ramp(L.u, 0.42, 0.52) * (1 - ramp(L.u, 0.95, 1));
    if (here > 0) {
      const lift = t > 20.8 ? ramp(t, 20.8, 21.6) : 0;
      const pz = P.huddle(t, sob * (1 - lift));
      pz.neck = lerp(pz.neck, 0.1, lift); pz.lean = lerp(pz.lean, 0.2, lift);
      pz.s1 = lerp(pz.s1, 0.9, lift); pz.e1 = lerp(pz.e1, 1.9, lift);
      layer(ctx, here, (g) => {
        figure(g, 'man', pz, { x: 1020, ground: FLOOR, s: S, colors: { ...HIM, skin: '#6a5a5a', top: '#2a3444', bottom: '#2a2a30' } });
      });
    }
    // the phone buzzing, lighting up
    if (t > 20.3) {
      const buzz = t < 21 ? Math.sin(t * 80) * 3 : 0;
      const inHand = ramp(t, 21, 21.6);
      const px = lerp(1120 + buzz, 1128, inHand), py = lerp(FLOOR - 6, 700, inHand);
      box(ctx, px - 16, py - 28, 32, 56, '#0c0d10', 1, 5);
      box(ctx, px - 13, py - 24, 26, 46, '#cfe0ff', 0.9, 3);
      glow(ctx, px, py, 160, '#bcd4ff', 0.35);
    }
  } else if (t < 31) {
    // she comes; he goes to her; they hold on
    const rise = ramp(t, 23.4, 24.8);
    const walkU = ramp(t, 24.6, 26.6, (k) => k);
    let x = 1020, pz;
    if (t < 24.8) pz = blend(P.huddle(t, 0), P.stand(t, 1), rise);
    else if (walkU < 1) { x = lerp(1020, 470, smooth(walkU)); pz = P.walk(stride(1020 - x, S)); }
    else { x = 470; pz = pose({ lean: 0.1, neck: 0.35, s1: 1.3, e1: 1.3, s2: 1.2, e2: 1.4 }); }
    const hugK = ramp(t, 26.6, 27.2) * (1 - ramp(t, 29.6, 30.2));
    const herX = lerp(215, 370, ramp(t, 24, 26.4)) - ramp(t, 29.8, 30.5) * 150;
    const pW = blend(P.stand(t, 3), pose({ lean: 0.1, neck: 0.3, s1: 1.25, e1: 1.3, s2: 1.1, e2: 1.4 }), hugK);
    figure(ctx, 'woman', pW, { x: herX, ground: FLOOR, s: S * 0.94, face: 1, colors: { ...HER, skin: '#9a7a6a' }, alpha: 1 - ramp(t, 30.1, 30.5) });
    figure(ctx, 'man', pz, { x, ground: FLOOR, s: S, face: walkU > 0 ? -1 : 1, colors: { ...HIM, skin: '#8a6e62', top: '#2a3444', bottom: '#2a2a30' } });
    glow(ctx, 420, 620, 500, '#ffb468', 0.25 * hugK);
  } else {
    // alone against the closed door; then, looking up
    const slide = ramp(t, 33.5, 35.5, easeInOut);
    const look = ramp(t, 38.5, 41);
    let pz = blend(pose({ ...P.stand(t, 2), neck: 0.5, s2: 0.9, e2: 0.4, lean: 0.05 }), P.huddle(t, 1 - look), slide);
    pz.neck = lerp(pz.neck, -0.15, look);
    pz.lean = lerp(pz.lean, 0.12, look);
    figure(ctx, 'man', pz, { x: lerp(470, 430, slide), ground: FLOOR, s: S, face: slide > 0.5 ? 1 : -1, colors: { ...HIM, skin: '#6a5a5a', top: '#2a3444', bottom: '#2a2a30' } });
    // a little starlight finds its way through the blinds
    glow(ctx, WIN.x + 250, WIN.y + h - 80, 160, '#dfe8ff', 0.35 * look);
  }
  ctx.restore();
  ctx.fillStyle = css('#060812', 0.35 * (1 - L.day) * (1 - warm));
  ctx.fillRect(0, 0, W, H);
  vignette(ctx, 0.7);
}
