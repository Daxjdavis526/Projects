// Matter waves through slits, one particle at a time. Electrons from a gun
// pass a barrier with one or two slits and land on a screen, each at a
// single spot — yet the spots build up a wave’s interference pattern.
// Raising the accelerating voltage shortens λ = h/p and packs the fringes
// closer; narrowing a slit spreads the pattern (Δy·Δp ≈ h); recording which
// slit each electron used removes the fringes. Physics in
// model/qm-matterwaves.js (tested in test/qm-matterwaves.test.mjs).
//
//   { type: 'qm-slits', params: {
//       mode: 'double',     // 'double' or 'single'
//       kV: 50,             // accelerating voltage, kV (the slider runs 1–100)
//       a: 0.5,             // slit width, μm
//       d: 2.0,             // slit separation, centre to centre, μm
//       which: false,       // a detector records which slit each electron used (double only)
//       curve: true,        // draw the predicted probability curve over the histogram
//       hits: 0,            // start with this many electrons already recorded (a still picture)
//       rate: 60,           // electrons per second while running
//       play: null,         // animate: default yes for the Explore picture, no for a question’s small one
//       controls: null,     // true, false, or a list of: mode kV a d which curve rate
//       readout: true,
//       hide: [],           // 'lambda' hides λ and the fringe and envelope angles
//       range: null,        // half-width of the screen as an angle, μrad (default: fits the starting pattern)
//   } }

import { themeColors } from '../plot.js';
import * as W from '../model/qm-matterwaves.js';
import { makeRng } from '../../core/rng.js';

export const defaults = { mode: 'double', kV: 50, a: 0.5, d: 2.0, which: false, curve: true, hits: 0, rate: 60, play: null, controls: null, readout: true, hide: [], range: null };
const CONTROLS = ['mode', 'kV', 'a', 'd', 'which', 'curve', 'rate'];
const BINS = 160;

export function mount(F, P0) {
  const P = { ...defaults, ...P0 };
  const hide = new Set(P.hide || []);
  const wanted = P.controls === true || (P.controls === null && !F.compact) ? CONTROLS : Array.isArray(P.controls) ? P.controls : [];
  const ctl = (key, make) => (wanted.includes(key) ? make() : (F.params[key] = P[key]));
  ctl('mode', () => F.choice({ key: 'mode', label: 'Barrier', options: [['double', 'two slits'], ['single', 'one slit']], value: P.mode, explain: 'Two slits make fringes; one slit alone makes a single broad spot with faint side bands.' }));
  ctl('kV', () => F.slider({ key: 'kV', label: 'Accelerating voltage', min: 1, max: 100, value: P.kV, logScale: true, unit: '\\mathrm{kV}', explain: 'More voltage, more momentum, shorter wavelength $\\lambda = h/p$.', fmt: (v) => (v < 10 ? v.toFixed(1) : v.toFixed(0)) }));
  ctl('a', () => F.slider({ key: 'a', label: 'Slit width $a$', min: 0.1, max: 2, step: 0.05, value: P.a, unit: '\\mu\\mathrm{m}', explain: 'A narrower slit pins down where the electron crossed — and spreads where it can land.' }));
  ctl('d', () => F.slider({ key: 'd', label: 'Slit separation $d$', min: 0.5, max: 6, step: 0.1, value: P.d, unit: '\\mu\\mathrm{m}', explain: 'Centre to centre. Wider-spaced slits give closer-spaced fringes.' }));
  ctl('which', () => F.toggle({ key: 'which', label: 'Detect which slit each electron uses', value: P.which, explain: 'Any record of the path, however gentle, destroys the interference.' }));
  ctl('curve', () => F.toggle({ key: 'curve', label: 'Show the predicted pattern', value: P.curve, explain: 'The wave’s probability of arrival, |ψ|², scaled to the number of electrons.' }));
  ctl('rate', () => F.slider({ key: 'rate', label: 'Electrons per second', min: 1, max: 1000, value: P.rate, logScale: true, explain: 'Even one at a time, the pattern still builds up.', fmt: (v) => v.toFixed(0) }));

  const { canvas, box } = F.canvas({ aspect: 'wide', label: P.alt || 'Electrons passing through slits and landing one by one on a screen' });
  const ctx = canvas.getContext('2d');

  const settings = () => {
    const mode = F.params.mode, a = F.params.a * 1e-6;
    const d = Math.max(F.params.d, F.params.a + 0.05) * 1e-6;
    const lambda = W.lambdaFromK('electron', F.params.kV * 1e3);
    return { mode, a, d, lambda, eff: mode === 'double' && F.params.which ? 'which' : mode };
  };
  const S0 = settings();
  const RANGE = (P.range ?? (2.6 * S0.lambda / S0.a) * 1e6) * 1e-6;      // half-width of the screen, rad
  let rng = makeRng(11), hits = [], counts = new Float64Array(BINS), total = 0, flights = [], pending = 0, sampler = null, pdfMax = 1;

  function resetPattern() {
    const S = settings();
    const pdf = (x) => W.intensity(x, { lambda: S.lambda, a: S.a, d: S.d, mode: S.eff });
    sampler = W.makeSampler(pdf, -RANGE, RANGE, 4000);
    // the largest expected bin share, for scaling bars and curve
    let m = 0;
    for (let i = 0; i < BINS; i++) { const x = -RANGE + ((i + 0.5) * 2 * RANGE) / BINS; m = Math.max(m, pdf(x)); }
    let integral = 0;
    for (let i = 0; i < 4000; i++) integral += pdf(-RANGE + ((i + 0.5) * 2 * RANGE) / 4000) * (2 * RANGE / 4000);
    pdfMax = (m * (2 * RANGE / BINS)) / integral;            // expected fraction of all hits in the fullest bin
    hits = []; counts = new Float64Array(BINS); total = 0; flights = []; pending = 0; rng = makeRng(11);
  }
  function addHit(withFlight) {
    const th = sampler(rng.next());
    const bin = Math.min(BINS - 1, Math.max(0, Math.floor(((th + RANGE) / (2 * RANGE)) * BINS)));
    counts[bin]++; total++;
    hits.push({ th, jx: rng.next() });
    if (hits.length > 4000) hits.shift();
    if (withFlight) flights.push({ t: 0, th, slit: rng.next() < 0.5 ? -1 : 1 });
  }
  resetPattern();
  for (let k = 0; k < P.hits; k++) addHit(false);

  function step(dt) {
    pending += F.params.rate * dt;
    const show = F.params.rate <= 40;
    while (pending >= 1) { pending -= 1; addHit(show); }
    for (const f of flights) f.t += dt;
    flights = flights.filter((f) => f.t < 0.7);
  }

  function draw() {
    const C = themeColors();
    const Wd = canvas.clientWidth || 600, H = canvas.clientHeight || 300, dpr = Math.min(2, devicePixelRatio || 1);
    const narrow = Wd < 520, want = narrow ? '4 / 3' : '';
    if (box.style.aspectRatio !== want) { box.style.aspectRatio = want; requestAnimationFrame(draw); return; }
    if (canvas.width !== Math.round(Wd * dpr) || canvas.height !== Math.round(H * dpr)) { canvas.width = Math.round(Wd * dpr); canvas.height = Math.round(H * dpr); }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, Wd, H);
    const S = settings(), fs = narrow ? 10 : 11.5;
    const txt = (s, x, y, o = {}) => {
      ctx.save(); ctx.font = `${o.w || 600} ${o.size || fs}px Inter, system-ui, sans-serif`; ctx.textAlign = o.align || 'center'; ctx.textBaseline = 'middle';
      ctx.lineWidth = 3.5; ctx.strokeStyle = C.bg; ctx.globalAlpha = 0.9; ctx.strokeText(s, x, y); ctx.globalAlpha = 1;
      ctx.fillStyle = o.color || C.ink; ctx.fillText(s, x, y); ctx.restore();
    };
    const top = H * 0.08, bot = H * 0.92, cy = (top + bot) / 2;
    const yOf = (th) => cy - (th / RANGE) * (bot - top) / 2;
    const xg = Wd * 0.07, xb = Wd * 0.3, xs = Wd * 0.58, sw = narrow ? 18 : 26, xh0 = xs + sw + 10, xh1 = Wd - 8;
    // the gun
    ctx.save(); ctx.fillStyle = C.ink3; ctx.fillRect(xg - 18, cy - 11, 30, 22); ctx.restore();
    txt('electron gun', xg - 3, cy + 26, { color: C.ink2, size: fs - 0.5 });
    txt(`${F.params.kV < 10 ? F.params.kV.toFixed(1) : F.params.kV.toFixed(0)} kV`, xg - 3, cy - 24, { color: C.ink2, size: fs - 0.5 });
    // the barrier: slits drawn far larger than scale, in the right proportions
    const dpx = Math.max(H * 0.07, Math.min(H * 0.34, H * 0.12 * Math.sqrt(S.d / 2e-6))), apx = Math.max(3, dpx * Math.min(0.9, S.a / S.d));
    const gaps = S.mode === 'double' ? [[cy - dpx / 2 - apx / 2, cy - dpx / 2 + apx / 2], [cy + dpx / 2 - apx / 2, cy + dpx / 2 + apx / 2]] : [[cy - Math.max(3, H * 0.03 * S.a / 0.5e-6) / 2, cy + Math.max(3, H * 0.03 * S.a / 0.5e-6) / 2]];
    ctx.save(); ctx.fillStyle = C.ink2;
    let y0 = top - 6;
    for (const [g0, g1] of gaps) { ctx.fillRect(xb - 4, y0, 8, g0 - y0); y0 = g1; }
    ctx.fillRect(xb - 4, y0, 8, bot + 6 - y0); ctx.restore();
    if (S.mode === 'double' && F.params.which) {
      for (const [g0, g1] of gaps) { ctx.save(); ctx.strokeStyle = C.warn; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(xb + 14, (g0 + g1) / 2, 6, 0, 2 * Math.PI); ctx.stroke(); ctx.restore(); }
      txt('which-slit detectors', xb + 16, top - 2, { color: C.warn, size: fs - 0.5 });
    }
    // particles in flight: a dot to the barrier, then a spreading wave to the screen
    for (const f of flights) {
      if (f.t < 0.35) {
        const x = xg + 12 + ((xb - 4 - xg - 12) * f.t) / 0.35;
        ctx.save(); ctx.fillStyle = C.accent; ctx.beginPath(); ctx.arc(x, cy, 3.5, 0, 2 * Math.PI); ctx.fill(); ctx.restore();
      } else {
        const r = ((f.t - 0.35) / 0.35) * (xs - xb);
        const from = S.mode === 'double' && F.params.which ? [gaps[f.slit < 0 ? 0 : 1]] : gaps;
        for (const [g0, g1] of from) { ctx.save(); ctx.strokeStyle = C.accent; ctx.globalAlpha = 0.35 * (1 - (f.t - 0.35) / 0.35); ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(xb + 4, (g0 + g1) / 2, Math.max(1, r), -1.1, 1.1); ctx.stroke(); ctx.restore(); }
      }
    }
    // the screen and its hits
    ctx.save(); ctx.fillStyle = C.panel; ctx.globalAlpha = 0.9; ctx.fillRect(xs, top, sw, bot - top); ctx.globalAlpha = 1; ctx.strokeStyle = C.ink3; ctx.lineWidth = 1; ctx.strokeRect(xs, top, sw, bot - top); ctx.restore();
    ctx.save(); ctx.fillStyle = C.gold;
    for (const h of hits) { const y = yOf(h.th); if (y > top && y < bot) ctx.fillRect(xs + 2 + h.jx * (sw - 5), y - 0.9, 1.8, 1.8); }
    ctx.restore();
    for (const f of flights) if (f.t > 0.6) { ctx.save(); ctx.strokeStyle = C.gold; ctx.globalAlpha = (0.7 - f.t) * 10; ctx.beginPath(); ctx.arc(xs + sw / 2, yOf(f.th), 6, 0, 2 * Math.PI); ctx.stroke(); ctx.restore(); }
    txt('screen', xs + sw / 2, bot + 12 > H - 4 ? top - 8 : bot + 12, { color: C.ink2, size: fs - 0.5 });
    // histogram and predicted curve
    const expMax = total * pdfMax, maxCount = Math.max(...counts), ref = Math.max(1, maxCount, expMax);
    const L = xh1 - xh0, bh = (bot - top) / BINS;
    ctx.save(); ctx.fillStyle = C.accent; ctx.globalAlpha = 0.55;
    for (let i = 0; i < BINS; i++) if (counts[i]) ctx.fillRect(xh0, bot - (i + 1) * bh, (counts[i] / ref) * L, Math.max(1, bh - 0.3));
    ctx.restore();
    if (F.params.curve) {
      const pdf = (x) => W.intensity(x, { lambda: S.lambda, a: S.a, d: S.d, mode: S.eff });
      const scale = total > 0 ? (expMax / ref) * L : L * 0.9;
      ctx.save(); ctx.strokeStyle = C.warn; ctx.lineWidth = 1.6; ctx.beginPath();
      // the pattern is 1 at its centre, so pdf × scale is the expected bar length in each bin
      for (let k = 0; k <= 600; k++) { const th = -RANGE + (2 * RANGE * k) / 600, x = xh0 + pdf(th) * scale, y = yOf(th); if (k === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y); }
      ctx.stroke(); ctx.restore();
    }
    ctx.save(); ctx.strokeStyle = C.ink4; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(xh0, top); ctx.lineTo(xh0, bot); ctx.stroke(); ctx.restore();
    txt(`electrons so far: ${total}`, xh1, top - 2 < 8 ? 8 : top - 2, { align: 'right', color: C.ink2, size: fs - 0.5 });
    if (!hide.has('lambda')) {
      txt(`+${(RANGE * 1e6).toFixed(0)} μrad`, xs - 6, top + 6, { align: 'right', color: C.ink3, w: 500, size: fs - 1 });
      txt(`−${(RANGE * 1e6).toFixed(0)} μrad`, xs - 6, bot - 6, { align: 'right', color: C.ink3, w: 500, size: fs - 1 });
    }
  }
  function readout() {
    if (P.readout === false) return;
    const S = settings();
    const rows = [['$\\lambda = h/p$', hide.has('lambda') ? '?' : `${(S.lambda * 1e12).toPrecision(3)}\\,\\mathrm{pm}`]];
    if (S.mode === 'double' && !F.params.which) rows.push(['fringe spacing $\\lambda/d$', hide.has('lambda') ? '?' : `${(S.lambda / S.d * 1e6).toPrecision(3)}\\,\\mu\\mathrm{rad}`]);
    rows.push(['first dark angle $\\lambda/a$', hide.has('lambda') ? '?' : `${(S.lambda / S.a * 1e6).toPrecision(3)}\\,\\mu\\mathrm{rad}`]);
    rows.push(['electrons recorded', String(total)]);
    F.readout(rows);
  }

  const reduced = () => document.documentElement.getAttribute('data-motion') === 'reduce' || !!globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  let running = (P.play ?? !F.compact) && !reduced();
  if (!running && total === 0 && P.hits === 0 && !F.compact) for (let k = 0; k < 1500; k++) addHit(false);   // a still that shows the pattern
  let lastShown = -1;
  let loop = F.animate((dt) => { if (running) step(dt); if (running || total !== lastShown) { draw(); readout(); lastShown = total; } });
  if (!F.compact) {
    const btn = F.button({ label: running ? 'Pause' : 'Play', primary: true, onClick: () => {
      running = !running; btn.textContent = running ? 'Pause' : 'Play';
      loop.stop(); loop = F.animate((dt) => { if (running) step(dt); draw(); readout(); }, { force: running });
      if (!running) { draw(); readout(); }
    } });
    F.button({ label: 'Clear the screen', onClick: () => { resetPattern(); draw(); readout(); } });
    F.button({ label: '+1000 at once', onClick: () => { for (let k = 0; k < 1000; k++) addHit(false); draw(); readout(); } });
  }
  F.onChange((key) => { if (key !== 'curve' && key !== 'rate') { resetPattern(); if (!running) for (let k = 0; k < 1500; k++) addHit(false); } draw(); readout(); });
  F.draw(() => { draw(); readout(); });
  F.caption(P.caption || 'Angles on the screen are real for the settings shown — at a screen 1 m away, 1 μrad is 1 μm, so real electron fringes are microns apart and are magnified with electron lenses before they are recorded. The slits and the gun are drawn far larger than scale, and each electron’s flight is slowed enormously.');
  return { get: (k) => F.params[k] };
}

export function validate(P) {
  const p = [];
  if (!['double', 'single'].includes(P.mode)) p.push('qm-slits: mode is double or single');
  if (!(P.kV >= 1 && P.kV <= 100)) p.push('qm-slits: kV must lie in 1–100');
  if (!(P.a >= 0.1 && P.a <= 2)) p.push('qm-slits: slit width a must lie in 0.1–2 μm');
  if (!(P.d >= 0.5 && P.d <= 6)) p.push('qm-slits: slit separation d must lie in 0.5–6 μm');
  if (P.mode === 'double' && !(P.d > P.a)) p.push('qm-slits: the separation must exceed the slit width');
  if (!(P.hits >= 0 && P.hits <= 20000)) p.push('qm-slits: hits must lie in 0–20000');
  if (!(P.rate >= 1 && P.rate <= 1000)) p.push('qm-slits: rate must lie in 1–1000');
  for (const h of P.hide || []) if (h !== 'lambda') p.push(`qm-slits: unknown hide “${h}”`);
  if (Array.isArray(P.controls)) for (const c of P.controls) if (!CONTROLS.includes(c)) p.push(`qm-slits: unknown control “${c}”`);
  return p;
}
