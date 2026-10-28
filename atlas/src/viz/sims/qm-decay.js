// Radioactive decay, nucleus by nucleus. A sample of N₀ unstable nuclei
// (the squares) decays at random: each one, independently, has the same
// chance of decaying in every moment, however long it has already lasted.
// The count left (the staircase) follows the exponential law N₀·2^(−t/T½)
// (the curve), more and more closely the bigger the sample — and after two
// half-lives a quarter remain, not none. Physics in model/qm-nuclear.js
// (tested in test/qm-nuclear.test.mjs).
//
//   { type: 'qm-decay', params: {
//       isotope: 'pu238',   // a key of ISOTOPES (c14 pu238 i131 tc99m rn222 co60 cs137 am241 u238)
//       N0: 400,            // 100, 400 or 1600 nuclei
//       t: 0,               // the time shown at first, in half-lives (a still picture shows the sample then)
//       speed: 0.4,         // half-lives per second while running
//       tmax: 5,            // length of the graph’s time axis, in half-lives
//       curve: true,        // draw the exponential law
//       seed: 1,            // which random sample
//       play: null,         // run on mount: default yes for the Explore picture (never under reduced motion)
//       controls: null,     // true, false, or a list of: isotope N0 speed curve
//       readout: true,
//       hide: [],           // 'count' hides how many are left; 'time' hides the time readout
//   } }

import { themeColors } from '../plot.js';
import * as Nu from '../model/qm-nuclear.js';
import { makeRng } from '../../core/rng.js';

export const defaults = { isotope: 'pu238', N0: 400, t: 0, speed: 0.4, tmax: 5, curve: true, seed: 1, play: null, controls: null, readout: true, hide: [] };
const CONTROLS = ['isotope', 'N0', 'speed', 'curve'];
const CHOICES = ['c14', 'pu238', 'i131', 'tc99m', 'rn222'];
const fmtT = (x) => (x >= 1e6 ? x.toExponential(2).replace(/e\+?(\d+)/, '×10^$1') : x >= 100 ? x.toFixed(0) : x >= 10 ? x.toFixed(1) : x.toFixed(2));

export function mount(F, P0) {
  const P = { ...defaults, ...P0 };
  const hide = new Set(P.hide || []);
  const wanted = P.controls === true || (P.controls === null && !F.compact) ? CONTROLS : Array.isArray(P.controls) ? P.controls : [];
  const isoList = CHOICES.includes(P.isotope) ? CHOICES : [P.isotope, ...CHOICES];
  const ctl = (key, make) => (wanted.includes(key) ? make() : (F.params[key] = P[key]));
  ctl('isotope', () => F.choice({ key: 'isotope', label: 'Isotope', options: isoList.map((k) => [k, `${Nu.ISOTOPES[k].label} (${Nu.ISOTOPES[k].T} ${Nu.ISOTOPES[k].unit === 'yr' ? 'yr' : Nu.ISOTOPES[k].unit})`]), value: P.isotope, explain: 'Each has its own half-life; the shape of the decay is the same for all.' }));
  ctl('N0', () => F.choice({ key: 'N0', label: 'Nuclei at the start', options: [[100, '100'], [400, '400'], [1600, '1600']], value: P.N0, explain: 'Small samples wander noticeably around the curve; large ones follow it closely.' }));
  ctl('speed', () => F.slider({ key: 'speed', label: 'Playback speed', min: 0.05, max: 2, value: P.speed, logScale: true, unit: '\\text{ half-lives/s}', explain: 'How fast the clock runs in the picture.', fmt: (v) => v.toFixed(2) }));
  ctl('curve', () => F.toggle({ key: 'curve', label: 'Show the exponential law', value: P.curve, explain: '$N = N_0\\,2^{-t/T_{1/2}}$: what an enormous sample would do.' }));

  const { canvas, box } = F.canvas({ aspect: 'wide', label: P.alt || 'A sample of radioactive nuclei decaying one at a time, and the number left against time' });
  const ctx = canvas.getContext('2d');
  let seed = P.seed, times = [], sorted = [], t = P.t;
  function newSample() {
    const rng = makeRng(1000 + seed), N0 = +F.params.N0;
    times = Array.from({ length: N0 }, () => Nu.decayTime(rng.next(), 1));      // in half-lives
    sorted = [...times].sort((a, b) => a - b);
  }
  const left = (tt) => { let lo = 0, hi = sorted.length; while (lo < hi) { const m = (lo + hi) >> 1; if (sorted[m] <= tt) lo = m + 1; else hi = m; } return sorted.length - lo; };
  newSample();

  function draw() {
    const C = themeColors();
    const W = canvas.clientWidth || 600, H = canvas.clientHeight || 300, dpr = Math.min(2, devicePixelRatio || 1);
    const narrow = W < 520, want = narrow ? '3 / 4' : '';
    if (box.style.aspectRatio !== want) { box.style.aspectRatio = want; requestAnimationFrame(draw); return; }
    if (canvas.width !== Math.round(W * dpr) || canvas.height !== Math.round(H * dpr)) { canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr); }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);
    const fs = narrow ? 10 : 11.5, iso = Nu.ISOTOPES[F.params.isotope] || Nu.ISOTOPES.pu238, N0 = times.length, tmax = P.tmax;
    const txt = (s, x, y, o = {}) => {
      ctx.save(); ctx.font = `${o.w || 600} ${o.size || fs}px Inter, system-ui, sans-serif`; ctx.textAlign = o.align || 'center'; ctx.textBaseline = 'middle';
      ctx.lineWidth = 3.5; ctx.strokeStyle = C.bg; ctx.globalAlpha = 0.9; ctx.strokeText(s, x, y); ctx.globalAlpha = 1;
      ctx.fillStyle = o.color || C.ink; ctx.fillText(s, x, y); ctx.restore();
    };
    const line = (x0, y0, x1, y1, col, w = 1, dash = []) => { ctx.save(); ctx.strokeStyle = col; ctx.lineWidth = w; ctx.setLineDash(dash); ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke(); ctx.restore(); };
    // the sample
    const G = narrow ? { x0: W * 0.12, y0: 8, size: Math.min(W * 0.76, H * 0.42) } : { x0: 10, y0: H * 0.08, size: Math.min(W * 0.36, H * 0.84) };
    const cols = Math.round(Math.sqrt(N0)), cell = G.size / cols, gap = cell > 6 ? 1.2 : 0.5;
    for (let i = 0; i < N0; i++) {
      const x = G.x0 + (i % cols) * cell, y = G.y0 + Math.floor(i / cols) * cell, dt = t - times[i];
      ctx.save();
      if (dt < 0) { ctx.fillStyle = C.accent; ctx.globalAlpha = 0.9; }
      else if (dt < 0.08) { ctx.fillStyle = C.warn; ctx.globalAlpha = 1; }
      else { ctx.fillStyle = C.ink4; ctx.globalAlpha = 0.35; }
      ctx.fillRect(x + gap / 2, y + gap / 2, cell - gap, cell - gap);
      ctx.restore();
    }
    const n = left(t);
    txt(hide.has('count') ? `${N0} nuclei at the start` : `${n} of ${N0} left`, G.x0 + G.size / 2, G.y0 + G.size + 14, { color: C.ink2 });
    // the graph: N against time in half-lives
    const B = narrow ? { x0: W * 0.14, x1: W - 12, y0: H * 0.56, y1: H - 34 } : { x0: W * 0.47, x1: W - 14, y0: H * 0.08, y1: H - 40 };
    const X = (tt) => B.x0 + (tt / tmax) * (B.x1 - B.x0), Y = (nn) => B.y1 - (nn / (N0 * 1.06)) * (B.y1 - B.y0);
    line(B.x0, B.y1, B.x1, B.y1, C.ink3, 1.2); line(B.x0, B.y0, B.x0, B.y1, C.ink3, 1.2);
    for (let k = 1; k <= tmax; k++) {
      line(X(k), B.y0, X(k), B.y1, C.line2 || C.ink4, 1, [4, 4]);
      txt(`${k}`, X(k), B.y1 + 10, { color: C.ink3, w: 500, size: fs - 1 });
      txt(`${fmtT(k * iso.T)} ${iso.unit}`, X(k), B.y1 + 23, { color: C.ink3, w: 500, size: fs - 2.5 });
    }
    txt('0', X(0), B.y1 + 10, { color: C.ink3, w: 500, size: fs - 1 });
    [[1, 'N₀'], [0.5, '½'], [0.25, '¼'], [0.125, '⅛']].forEach(([f, s]) => { line(B.x0, Y(N0 * f), B.x1, Y(N0 * f), C.ink4, 1, [2, 4]); txt(s, B.x0 - 8, Y(N0 * f), { color: C.ink3, align: 'right', size: fs - 0.5 }); });
    txt('time (half-lives)', B.x1, B.y1 + (narrow ? 34 : 36) > H - 4 ? B.y0 - 6 : B.y1 + 36, { color: C.ink2, align: 'right', size: fs - 1, w: 500 });
    if (F.params.curve) {
      ctx.save(); ctx.strokeStyle = C.warn; ctx.lineWidth = 2; ctx.beginPath();
      for (let k = 0; k <= 200; k++) { const tt = (k / 200) * tmax; const x = X(tt), y = Y(N0 * Math.pow(2, -tt)); if (k) ctx.lineTo(x, y); else ctx.moveTo(x, y); }
      ctx.stroke(); ctx.restore();
    }
    // the count so far, as a staircase
    ctx.save(); ctx.strokeStyle = C.accent; ctx.lineWidth = 2.2; ctx.beginPath(); ctx.moveTo(X(0), Y(N0));
    let cur = N0;
    for (const td of sorted) { if (td > t || td > tmax) break; ctx.lineTo(X(td), Y(cur)); cur--; ctx.lineTo(X(td), Y(cur)); }
    ctx.lineTo(X(Math.min(t, tmax)), Y(cur)); ctx.stroke(); ctx.restore();
    if (t > 0) { ctx.save(); ctx.fillStyle = C.gold; ctx.beginPath(); ctx.arc(X(Math.min(t, tmax)), Y(n), 4.5, 0, 2 * Math.PI); ctx.fill(); ctx.restore(); }
    txt(iso.label, B.x1, B.y0 + 4, { align: 'right', color: C.ink2, w: 650 });
  }

  let lastRead = '';
  function readout() {
    if (P.readout === false) return;
    const iso = Nu.ISOTOPES[F.params.isotope] || Nu.ISOTOPES.pu238, N0 = times.length, n = left(t);
    const key = `${t.toFixed(3)},${N0},${F.params.isotope}`;
    if (key === lastRead) return;
    lastRead = key;
    F.readout([
      ['elapsed', hide.has('time') ? '?' : `${t.toFixed(2)}\\ T_{1/2} = ${fmtT(t * iso.T).replace(/×10\^(\d+)/, '\\times10^{$1}')}\\ \\text{${iso.unit}}`],
      ['left', hide.has('count') ? '?' : `${n}`],
      ['the law: $N_0\\,2^{-t/T_{1/2}}$', `${(N0 * Math.pow(2, -t)).toFixed(1)}`],
      ['half-life $T_{1/2}$', `${fmtT(iso.T).replace(/×10\^(\d+)/, '\\times10^{$1}')}\\ \\text{${iso.unit}}`],
    ]);
  }

  const reduced = () => document.documentElement.getAttribute('data-motion') === 'reduce' || !!globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  let running = (P.play ?? !F.compact) && !reduced() && t < P.tmax;
  let loop = F.animate((dt) => {
    if (running) { t = Math.min(P.tmax, t + F.params.speed * dt); if (t >= P.tmax) { running = false; if (btn) btn.textContent = 'Play'; } }
    draw(); readout();
  });
  let btn = null;
  if (!F.compact) {
    btn = F.button({ label: running ? 'Pause' : 'Play', primary: true, onClick: () => {
      if (t >= P.tmax) t = 0;
      running = !running; btn.textContent = running ? 'Pause' : 'Play';
      loop.stop(); loop = F.animate((dt) => { if (running) { t = Math.min(P.tmax, t + F.params.speed * dt); if (t >= P.tmax) { running = false; btn.textContent = 'Play'; } } draw(); readout(); }, { force: running });
      draw(); readout();
    } });
    F.button({ label: 'New sample', onClick: () => { seed++; t = 0; newSample(); draw(); readout(); } });
    F.button({ label: '+1 half-life', onClick: () => { t = Math.min(P.tmax, Math.round((t + 1) * 1e6) / 1e6); draw(); readout(); } });
  }
  F.onChange((key) => { if (key === 'N0') { t = 0; newSample(); } draw(); readout(); });
  F.draw(() => { draw(); readout(); });
  F.caption(P.caption || 'Each square is one nucleus: blue until it decays, a brief orange flash when it does, grey after. Which nucleus decays when is random; only the chance per unit time is fixed. The picture is a model sample of a few hundred nuclei — a real gram holds about 10²¹ — and time is speeded up enormously.');
  return { get: (k) => (k === 't' ? t : F.params[k]) };
}

export function validate(P) {
  const p = [];
  if (!Nu.ISOTOPES[P.isotope]) p.push(`qm-decay: unknown isotope “${P.isotope}”`);
  if (![100, 400, 1600].includes(+P.N0)) p.push('qm-decay: N0 is 100, 400 or 1600');
  if (!(P.t >= 0 && P.t <= P.tmax)) p.push('qm-decay: t must lie in [0, tmax] half-lives');
  if (!(P.tmax >= 1 && P.tmax <= 10)) p.push('qm-decay: tmax must lie in 1–10 half-lives');
  if (!(P.speed >= 0.05 && P.speed <= 2)) p.push('qm-decay: speed must lie in 0.05–2');
  for (const h of P.hide || []) if (!['count', 'time'].includes(h)) p.push(`qm-decay: unknown hide “${h}”`);
  if (Array.isArray(P.controls)) for (const c of P.controls) if (!CONTROLS.includes(c)) p.push(`qm-decay: unknown control “${c}”`);
  return p;
}
