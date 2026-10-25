// Black holes. Collapse; the horizon at r_s; clocks hovering at 3 r_s and
// 1.1 r_s ticking at √(1 − r_s/r) of the distant rate; light rays traced
// through Schwarzschild spacetime (captured inside b = 3√3/2 r_s); a bound
// orbit precessing, integrated from the geodesic equation; the ISCO and an
// accretion disk; a spinning (Kerr) hole's ergosphere; the EHT ring sizes;
// the Sun swapped for a black hole; and the singularity.

import { TAU, ramp, win, clamp, lerp, hash } from '../kit.js';
import { background, text, note, path, circle, glow, seg, arrow, panel, clockFace, COL } from '../paint.js';
import { photonPath, orbit, hoverRate, schwarzschildRadius, GM_SUN, GM_EARTH, CAPTURE_B, efficiencySchwarzschild, efficiencyMaxKerr } from '../physics.js';

const CX = 720, CY = 540, S = 64;               // hole centre, px per r_s
const X = (x) => CX + x * S, Y = (y) => CY - y * S;

// light rays, traced once
const RAYS = [0.9, 1.6, 2.2, 2.45, 2.56, 2.62, 2.8, 3.3, 4.2, 5.4, 6.8].flatMap((b) => {
  const r = photonPath(b, { start: 11, maxR: 16, step: 0.003 });
  const pts = r.pts.map(([x, y]) => [X(x), Y(y)]);
  const len = [0];
  for (let i = 1; i < pts.length; i++) len.push(len[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
  const mirror = pts.map(([x, y]) => [x, 2 * CY - y]);
  return [{ b, pts, len, captured: r.captured }, { b: -b, pts: mirror, len, captured: r.captured }];
});

// a bound orbit between 6 and 12 r_s, drawn at its own scale
const ORB_S = 36, ORB_CY = 500;
const ORB = (() => {
  const o = orbit(6, 12, { orbits: 6, step: 0.002 });
  const tPeri = o.samples.find((s) => s.phi >= o.periapses[1]).t;
  return { ...o, period: tPeri, advance: ((o.periapses[1] - TAU) * 180) / Math.PI };
})();
function orbitAt(tc) {
  const s = ORB.samples;
  let lo = 0, hi = s.length - 1;
  if (tc >= s[hi].t) tc = tc % s[hi].t;
  while (hi - lo > 1) { const m = (lo + hi) >> 1; if (s[m].t < tc) lo = m; else hi = m; }
  return lo;
}

function hole(g, a, r = 1) {
  glow(g, CX, CY, S * r * 2.2, '#5b6fd0', 0.25 * a);
  circle(g, CX, CY, S * r, { fill: '#000000', stroke: '#2a3350', width: 2, alpha: a });
}
const ring = (g, r, color, a, label, dash = [6, 8], angle = -0.6) => {
  circle(g, CX, CY, r * S, { stroke: color, width: 2, alpha: a, dash });
  if (label) text(g, label, CX + r * S * Math.cos(angle) + 10, CY + r * S * Math.sin(angle) - 8, { size: 22, color, alpha: a, align: 'left' });
};

function collapse(g, t, a) {
  const k = ramp(t, 1.5, 8, (u) => u * u);
  const R = lerp(300, S * 0.2, k);
  glow(g, CX, CY, R * 1.6, '#ffb35c', a * (1 - k) * 0.8);
  circle(g, CX, CY, R, { fill: k < 0.75 ? '#ffcf8a' : '#3a2a1a', alpha: a * (1 - k * 0.6) });
  const h = ramp(t, 6.5, 8.5) * a;
  if (h > 0) { circle(g, CX, CY, S, { fill: '#000', alpha: h }); ring(g, 1, COL.light, h, 'a horizon forms', [4, 6]); }
  text(g, 'core heavier than about 2–2.3 Suns', 1420, 470, { size: 30, color: COL.ink, alpha: a });
  text(g, 'nothing known can stop the collapse', 1420, 515, { size: 26, color: COL.dim, alpha: a });
}

function hoverClocks(g, t, A, a) {
  const spots = [[Infinity, 'far away'], [3, '3 rₛ'], [1.1, '1.1 rₛ']];
  const cx = [1700, 1440, 1180];
  spots.forEach(([r, lab], i) => {
    const rate = r === Infinity ? 1 : hoverRate(r);
    const px = r === Infinity ? 1300 : X(r);
    if (r !== Infinity) { circle(g, px, CY, 7, { fill: COL.gold, alpha: a }); seg(g, px, CY - 10, cx[i], 460, { color: COL.dim, width: 1.5, alpha: a * 0.6, dash: [4, 6] }); }
    clockFace(g, cx[i], 370, 66, ((t - A[3]) / 4) * rate, { alpha: a, hand: COL.gold });
    text(g, lab, cx[i], 478 + (i ? 0 : 0), { size: 24, color: COL.ink, alpha: a });
    text(g, `${(rate * 100).toFixed(0)}% rate`, cx[i], 512, { size: 26, color: COL.gold, alpha: a });
  });
}

function rays(g, t, A, a) {
  const speed = 360;                                   // px per second along each ray
  for (const ray of RAYS) {
    const d = (t - A[4] - 0.3 - Math.abs(ray.b) * 0.15) * speed;
    if (d <= 0) continue;
    const pts = [];
    let i = 0;
    for (; i < ray.pts.length && ray.len[i] <= d; i++) pts.push(ray.pts[i]);
    if (pts.length < 2) continue;
    const col = ray.captured ? COL.coral : COL.light;
    path(g, pts, { color: col, width: 2.4, alpha: a * 0.9 });
    if (i < ray.pts.length) { const [hx, hy] = pts[pts.length - 1]; glow(g, hx, hy, 16, col, a); }
  }
  // the capture zone, marked on the incoming side
  const m = ramp(t, A[5], A[5] + 1) * a;
  if (m > 0) {
    const xL = X(-10.5);
    seg(g, xL, Y(CAPTURE_B), xL, Y(-CAPTURE_B), { color: COL.coral, width: 4, alpha: m });
    seg(g, xL, Y(CAPTURE_B), xL + 16, Y(CAPTURE_B), { color: COL.coral, width: 4, alpha: m });
    seg(g, xL, Y(-CAPTURE_B), xL + 16, Y(-CAPTURE_B), { color: COL.coral, width: 4, alpha: m });
    text(g, `aimed within ${CAPTURE_B.toFixed(1)} rₛ:`, xL - 14, CY - 10, { size: 22, color: COL.coral, alpha: m, align: 'right' });
    text(g, 'captured', xL - 14, CY + 20, { size: 22, color: COL.coral, alpha: m, align: 'right' });
  }
}

function precess(g, t, A, a) {
  const tc = Math.max(0, t - A[6]) * (ORB.period / 5);   // one radial period per 5 s
  const i = orbitAt(tc);
  const s = ORB.samples;
  const back = Math.max(0, i - Math.floor(s.length / 6 * 2.2));
  const pts = [];
  const OX = (x) => CX + x * ORB_S, OY = (y) => ORB_CY - y * ORB_S;
  glow(g, CX, ORB_CY, ORB_S * 2.2, '#5b6fd0', 0.25 * a);
  circle(g, CX, ORB_CY, ORB_S, { fill: '#000', stroke: '#2a3350', width: 2, alpha: a });
  circle(g, CX, ORB_CY, 1.5 * ORB_S, { stroke: COL.light, width: 1.5, alpha: a * 0.7, dash: [3, 6] });
  circle(g, CX, ORB_CY, 3 * ORB_S, { stroke: COL.gold, width: 2, alpha: a, dash: [8, 6] });
  text(g, 'innermost stable orbit, 3 rₛ', CX, ORB_CY + 3 * ORB_S + 34, { size: 22, color: COL.gold, alpha: a });
  for (let j = back; j <= i; j += 8) pts.push([OX(s[j].r * Math.cos(s[j].phi)), OY(s[j].r * Math.sin(s[j].phi))]);
  path(g, pts, { color: COL.gold, width: 2.5, alpha: a * 0.8 });
  const [x, y] = [OX(s[i].r * Math.cos(s[i].phi)), OY(s[i].r * Math.sin(s[i].phi))];
  glow(g, x, y, 22, COL.gold, a);
  circle(g, x, y, 7, { fill: COL.gold, alpha: a });
  text(g, `each loop swings ${ORB.advance.toFixed(0)}° further round`, 1420, 300, { size: 28, color: COL.gold, alpha: a });
  text(g, 'orbit between 6 and 12 rₛ, integrated from', 1420, 345, { size: 24, color: COL.dim, alpha: a });
  text(g, 'the Schwarzschild geodesic equation (not exaggerated)', 1420, 380, { size: 24, color: COL.dim, alpha: a });
}

function disk(g, t, a) {
  g.save();
  g.globalCompositeOperation = 'lighter';
  for (let i = 0; i < 900; i++) {
    const r = 3 + 9 * hash(i, 9) ** 1.6;
    const om = 0.9 * r ** -1.5 * 6;                        // Keplerian, sped up
    const ph = hash(i, 10) * TAU + om * t;
    const hot = clamp(1.2 - (r - 3) / 6);
    const x = X(r * Math.cos(ph)), y = CY - r * S * 0.32 * Math.sin(ph);
    circle(g, x, y, 1.2 + hot * 1.6, { fill: hot > 0.6 ? '#fff1d0' : hot > 0.3 ? '#ffb35c' : '#c0602a', alpha: a * (0.25 + 0.5 * hot) });
  }
  g.restore();
  glow(g, CX, CY, 3.5 * S, '#ff9a3c', a * 0.25);
  const bars = [[efficiencySchwarzschild * 100, 'non-spinning hole', COL.gold], [efficiencyMaxKerr * 100, 'fastest-spinning hole', COL.coral], [0.7, 'hydrogen fusion', COL.blue]];
  text(g, 'rest-mass energy radiated', 1560, 640, { size: 26, color: COL.dim, alpha: a });
  bars.forEach(([v, lab, col], k) => {
    const y = 700 + k * 64;
    g.save(); g.globalAlpha = a; g.fillStyle = col; g.fillRect(1440, y - 16, 7 * v, 32); g.restore();
    text(g, `${v.toFixed(1)}%`, 1440 + 7 * v + 12, y + 9, { size: 26, color: COL.ink, alpha: a, align: 'left' });
    text(g, lab, 1425, y + 9, { size: 24, color: COL.ink, alpha: a, align: 'right' });
  });
}

function kerr(g, t, a) {
  const M = 0.5, spin = 0.9 * M;                           // r_s = 2M = 1
  const rPlus = M + Math.sqrt(M * M - spin * spin);
  const erg = [];
  for (let i = 0; i <= 120; i++) {
    const th = (i / 120) * TAU;
    const r = M + Math.sqrt(M * M - spin * spin * Math.cos(th) ** 2);
    erg.push([X(r * 2.2 * Math.sin(th)), Y(r * 2.2 * Math.cos(th))]);
  }
  path(g, erg, { color: COL.violet, width: 2.5, alpha: a, fill: 'rgba(180,156,255,0.08)', close: true });
  circle(g, CX, CY, rPlus * 2.2 * S, { fill: '#000', stroke: '#2a3350', width: 2, alpha: a });
  for (let i = 0; i < 70; i++) {
    const r = rPlus * 2.2 + (hash(i, 12) * 2.2) * 1.3;
    const om = 2.4 / r ** 1.5;
    const ph = hash(i, 13) * TAU + om * t;
    circle(g, X(r * Math.cos(ph)), CY - r * S * 0.3 * Math.sin(ph), 2.5, { fill: COL.violet, alpha: a * 0.8 });
  }
  text(g, 'ergosphere: nothing can stay still here', CX, Y(2.4) - 10, { size: 24, color: COL.violet, alpha: a });
  note(g, 'spin 0.9 of the maximum, horizon and ergosphere drawn 2.2× larger', CX, Y(-2.6), a);
  text(g, 'Gravity Probe B (2011), frame dragging by Earth:', 1440, 640, { size: 26, color: COL.ink, alpha: a });
  text(g, 'measured −37.2 ± 7.2 mas/yr', 1440, 690, { size: 30, color: COL.green, alpha: a });
  text(g, 'GR predicts −39.2 mas/yr', 1440, 734, { size: 26, color: COL.dim, alpha: a });
}

function eht(g, t, a) {
  const draw = (cx, cy, R, lab, val) => {
    for (let i = 0; i < 160; i++) {
      const p = (i / 160) * TAU;
      const bright = 0.55 + 0.45 * Math.max(0, Math.sin(p));      // brighter on one side
      glow(g, cx + R * Math.cos(p), cy + R * Math.sin(p), 26, '#ff9a3c', a * 0.22 * bright);
    }
    circle(g, cx, cy, R * 0.62, { fill: '#000', alpha: a * 0.9 });
    text(g, lab, cx, cy + R + 70, { size: 30, color: COL.ink, alpha: a });
    text(g, val, cx, cy + R + 110, { size: 28, color: COL.gold, alpha: a });
  };
  draw(620, 470, 150, 'M87* (2019)', 'ring 42 ± 3 μas');
  draw(1300, 470, 150, 'Sagittarius A* (2022)', 'ring 51.8 ± 2.3 μas');
  note(g, 'illustrations of glowing rings, not the EHT images; μas = millionths of an arcsecond', 960, 860, a);
}

function swap(g, t, A, a) {
  const cx = 960, cy = 520, R = 300;
  const k = ramp(t, A[10] + 1.5, A[10] + 4);
  glow(g, cx, cy, 140 * (1 - k) + 20, '#ffcf6b', a * (1 - k * 0.7));
  circle(g, cx, cy, 46 * (1 - k) + 3, { fill: k < 0.99 ? '#ffd56e' : '#000', stroke: '#2a3350', alpha: a });
  circle(g, cx, cy, R, { stroke: COL.dim, width: 1.5, alpha: a * 0.6, dash: [4, 8] });
  const ph = (t - A[10]) * 0.6;
  circle(g, cx + R * Math.cos(ph), cy - R * Math.sin(ph), 14, { fill: '#2f6fd6', alpha: a });
  text(g, k < 0.5 ? 'the Sun' : 'a black hole of the same mass (rₛ ≈ 3 km)', cx, cy + 90, { size: 26, color: COL.ink, alpha: a });
  text(g, 'Earth’s orbit: unchanged', cx + R + 40, cy, { size: 28, color: COL.gold, alpha: a, align: 'left' });
}

export default function draw(g, t, s) {
  const A = s.at;
  background(g, t, { stars: 140, seed: 91 });
  const c0 = win(t, 0.2, A[1] + 0.5, 0.8, 0.8);
  if (c0 > 0) collapse(g, t, c0);
  const main = win(t, A[1] + 0.2, A[6], 0.8, 0.6);
  if (main > 0) {
    hole(g, main);
    ring(g, 1, COL.light, main, 'event horizon, rₛ', [4, 6], 0.75);
    const r2 = win(t, A[2], A[3], 0.8, 0.6);
    if (r2 > 0) {
      text(g, `Sun: rₛ = ${(schwarzschildRadius(GM_SUN) / 1000).toFixed(2)} km`, 1440, 520, { size: 34, color: COL.ink, alpha: r2 });
      text(g, `Earth: rₛ = ${(schwarzschildRadius(GM_EARTH) * 1000).toFixed(1)} mm`, 1440, 575, { size: 34, color: COL.ink, alpha: r2 });
      text(g, 'rₛ = 2GM/c²', 1440, 640, { size: 28, color: COL.dim, alpha: r2 });
    }
    const hc = win(t, A[3] - 0.2, A[4], 0.8, 0.6);
    if (hc > 0) hoverClocks(g, t, A, hc);
    const ps = ramp(t, A[4] - 0.2, A[4] + 0.6) * main;
    if (ps > 0) ring(g, 1.5, COL.light, ps, 'photon sphere, 1.5 rₛ', [3, 6], -2.5);
    const ry = win(t, A[4] - 0.2, A[6], 0.6, 0.8);
    if (ry > 0) rays(g, t, A, ry);
  }
  const ob = win(t, A[6] - 0.2, A[7] + 0.4, 0.8, 0.8);
  if (ob > 0) precess(g, t, A, ob);
  const dk = win(t, A[7] - 0.4, A[8], 0.8, 0.8);
  if (dk > 0) { disk(g, t, dk); circle(g, CX, CY, S, { fill: '#000', alpha: dk }); }
  const kr = win(t, A[8] - 0.2, A[9], 0.8, 0.8);
  if (kr > 0) kerr(g, t, kr);
  const eh = win(t, A[9] - 0.2, A[10], 0.8, 0.8);
  if (eh > 0) eht(g, t, eh);
  const sw = win(t, A[10] - 0.2, A[11], 0.8, 0.8);
  if (sw > 0) swap(g, t, A, sw);
  const sg = ramp(t, A[11] - 0.2, A[11] + 1);
  if (sg > 0) {
    hole(g, sg, 1.6);
    glow(g, CX, CY, 40, '#ffffff', sg * (0.5 + 0.3 * Math.sin(t * 3)));
    text(g, 'r = 0', CX, CY + 8, { size: 26, color: COL.ink, alpha: sg });
    text(g, 'the singularity: GR stops making predictions', 1440, 480, { size: 30, color: COL.ink, alpha: sg });
    text(g, 'what replaces it? (quantum gravity)', 1440, 530, { size: 28, color: COL.violet, alpha: sg });
    note(g, 'inside the horizon, r = 0 is a moment in the infaller’s future, not a place', 1440, 580, sg);
  }
}
