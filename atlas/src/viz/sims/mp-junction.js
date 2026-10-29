// The p–n junction: its band diagram above its current–voltage curve. Across
// the picture runs the device, p-type on the left and n-type on the right,
// with the depletion region between (true widths, in μm). Up the picture,
// electron energy: the conduction band (blue) and the valence band (orange)
// step down from the p side to the n side by the barrier e(V_bi − V), and
// the Fermi level (gold, dashed) splits by eV under bias. Electrons are
// dots, holes rings. Forward bias lowers the barrier: electrons and holes
// cross and recombine, giving light of the gap’s colour in a direct-gap
// material (an LED) and mostly heat in silicon. Sunlight makes pairs that
// the junction’s field separates: a solar cell. Below, the ideal-diode
// curve I = I₀(e^(eV/kT) − 1) − I_L with the working point and, in light,
// the maximum-power rectangle. Physics in model/mp-solids.js (tested in
// test/mp-solids.test.mjs).
//
//   { type: 'mp-junction', params: {
//       material: 'si',   // si ge gaas gaasp ingan (SEMIS in model/mp-solids.js)
//       V: 0,             // bias, V (forward positive): −1 V up to just below the built-in potential
//       light: 0,         // sunlight on the junction, in suns (0–1; one sun = 1000 W/m²)
//       iv: true,         // the current–voltage graph
//       play: null,       // animate the carriers (default: yes in the Explore step, never under reduced motion)
//       controls: null,   // true, false, or a list of: material V light
//       readout: true,
//       hide: [],         // any of: barrier (its height), I (the current), lambda (the LED’s colour), W (the depletion width), power
//   } }
// An item reads the bias as get('V') (whichever material is shown) and the light as get('light').

import { Plot } from '../plot.js';
import * as S from '../model/mp-solids.js';
import { wavelengthToRGB } from '../model/qm-light.js';
import { makeRng } from '../../core/rng.js';

export const defaults = { material: 'si', V: 0, light: 0, iv: true, play: null, controls: null, readout: true, hide: [] };
const CONTROLS = ['material', 'V', 'light'];
const HIDE = ['barrier', 'I', 'lambda', 'W', 'power'];
const KEYS = Object.keys(S.SEMIS);
const VMIN = -1;
const vmax = (key) => +(S.junction(key, 0).Vbi - 0.03).toFixed(2);
const f2 = (x) => (Math.abs(x) < 0.005 ? '0.00' : x.toFixed(2));
/** A current in A as TeX, in a sensible unit. */
function texI(I) {
  const a = Math.abs(I);
  if (a >= 1e-3) return `${(I * 1e3).toPrecision(3)}\\,\\mathrm{mA}`;
  if (a >= 1e-6) return `${(I * 1e6).toPrecision(3)}\\,\\mu\\mathrm{A}`;
  if (a >= 1e-9) return `${(I * 1e9).toPrecision(3)}\\,\\mathrm{nA}`;
  if (a === 0) return '0';
  const e = Math.floor(Math.log10(a)), m = I / 10 ** e;
  return `${m.toFixed(2)}\\times10^{${e}}\\,\\mathrm{A}`;
}
const colourName = (nm) => (nm < 380 ? 'ultraviolet' : nm < 450 ? 'violet' : nm < 495 ? 'blue' : nm < 570 ? 'green' : nm < 590 ? 'yellow' : nm < 620 ? 'orange' : nm <= 750 ? 'red' : 'infrared');

export function mount(F, P0) {
  const P = { ...defaults, ...P0 };
  const hide = new Set(P.hide || []);
  const wanted = P.controls === true || (P.controls === null && !F.compact) ? CONTROLS : Array.isArray(P.controls) ? P.controls : [];
  const pick = wanted.includes('material');
  // one bias slider per material (each has its own built-in potential); only the current one is shown
  const vKey = (m) => (pick ? `V_${m}` : 'V');
  if (pick) F.choice({ key: 'material', label: 'Semiconductor', options: KEYS.map((k) => [k, S.SEMIS[k].short]), value: P.material, explain: 'Each has its own band gap: silicon 1.12 eV, germanium 0.66, GaAs 1.42; the LED alloys’ gaps are typical values.' });
  else F.params.material = P.material;
  const vCtl = {};
  for (const m of pick ? KEYS : [P.material]) {
    const start = m === P.material ? Math.min(P.V, vmax(m)) : 0;
    if (wanted.includes('V')) vCtl[m] = F.slider({ key: vKey(m), label: 'Bias voltage $V$', min: VMIN, max: vmax(m), step: 0.01, value: start, unit: '\\mathrm{V}', explain: 'Positive: forward bias (p side positive), which lowers the barrier. Negative: reverse bias, which raises it.' });
    else F.params[vKey(m)] = start;
  }
  if (wanted.includes('light')) F.slider({ key: 'light', label: 'Sunlight', min: 0, max: 1, step: 0.01, value: P.light, unit: '\\text{ sun}', explain: 'One sun is 1000 W/m² on the ground. Each photon above the gap can make an electron–hole pair.' });
  else F.params.light = P.light;
  const showSlider = () => { for (const m of KEYS) if (vCtl[m]) vCtl[m].node.style.display = m === F.params.material ? '' : 'none'; };
  showSlider();

  const now = () => {
    const key = S.SEMIS[F.params.material] ? F.params.material : 'si';
    const V = Math.max(VMIN, Math.min(vmax(key), F.params[vKey(key)] ?? 0));
    return { key, V, light: Math.max(0, Math.min(1, +F.params.light || 0)), ...S.junction(key, V, Math.max(0, Math.min(1, +F.params.light || 0))) };
  };

  const { canvas } = F.canvas({ aspect: 'wide', label: P.alt || 'The band diagram of a p–n junction: electron energy against position' });
  const plot = new Plot(canvas, { x: [-1.05, 1.05], y: [-1, 1], grid: false, axes: true, axesAt: 'edge', xlabel: 'position (μm)', ylabel: 'electron energy (eV)', yticks: 5 });
  const gcan = P.iv !== false ? F.canvas({ aspect: 'wide', label: 'The current through the junction against the bias voltage' }) : null;
  const gplot = gcan ? new Plot(gcan.canvas, { x: [-1, 1], y: [-10, 45], xlabel: 'bias V (V)', ylabel: 'current (mA)', axesAt: 'edge' }) : null;

  // ---- carriers: a fixed population (majorities in the bulk, a few minorities), plus ones in flight
  const rng0 = makeRng(5);
  const still = [];
  for (let i = 0; i < 26; i++) still.push({ kind: 'e', x: 0.1 + 0.95 * rng0.next(), d: rng0.next() });     // n-side electrons (x as a fraction past xn)
  for (let i = 0; i < 26; i++) still.push({ kind: 'h', x: -0.1 - 0.95 * rng0.next(), d: rng0.next() });    // p-side holes
  for (let i = 0; i < 2; i++) still.push({ kind: 'e', x: -0.3 - 0.6 * rng0.next(), d: rng0.next(), minority: true });
  for (let i = 0; i < 2; i++) still.push({ kind: 'h', x: 0.3 + 0.6 * rng0.next(), d: rng0.next(), minority: true });
  let rng = makeRng(9), moving = [], flashes = [], acc = { f: 0, s: 0 };
  function spawn(St) {
    const xp = St.xp * 1e6, xn = St.xn * 1e6;
    const Id = S.diode(St.V, St.I0);
    const rf = Id > 1e-6 ? Math.min(30, 6 * Math.log10(Id / 1e-6)) : 0, rs = 18 * St.light;
    return { rf, rs, xp, xn };
  }
  function stepSim(dt, St) {
    const { rf, rs, xp, xn } = spawn(St);
    acc.f += rf * dt; acc.s += rs * dt;
    while (acc.f >= 1) {      // an electron from the n side or a hole from the p side crosses and recombines
      acc.f -= 1;
      if (rng.next() < 0.5) moving.push({ kind: 'e', x: Math.min(1, xn + 0.1 + 0.8 * rng.next()), to: -xp - 0.05 - 0.35 * rng.next(), d: rng.next(), v: -1.1, then: 'recombine' });
      else moving.push({ kind: 'h', x: Math.max(-1, -xp - 0.1 - 0.8 * rng.next()), to: xn + 0.05 + 0.35 * rng.next(), d: rng.next(), v: 1.1, then: 'recombine' });
    }
    while (acc.s >= 1) {      // a photon makes a pair near the junction; the field pulls them apart
      acc.s -= 1;
      const x = -xp - 0.15 + (xp + xn + 0.3) * rng.next();
      flashes.push({ kind: 'absorb', x, t: 0.5 });
      moving.push({ kind: 'e', x, to: 1.05, d: rng.next(), v: 1.4, delay: 0.35 }, { kind: 'h', x, to: -1.05, d: rng.next(), v: -1.4, delay: 0.35 });
    }
    for (const c of moving) {
      if (c.delay > 0) { c.delay -= dt; continue; }
      c.x += c.v * dt;
      if ((c.v < 0 && c.x <= c.to) || (c.v > 0 && c.x >= c.to)) { c.done = true; if (c.then === 'recombine') flashes.push({ kind: 'emit', x: c.to, t: 0.7 }); }
    }
    moving = moving.filter((c) => !c.done);
    for (const f of flashes) f.t -= dt;
    flashes = flashes.filter((f) => f.t > 0);
  }
  function warm() { rng = makeRng(9); moving = []; flashes = []; acc = { f: 0.5, s: 0.5 }; const St = now(); for (let i = 0; i < 50; i++) stepSim(0.04, St); }

  const reduced = () => document.documentElement.getAttribute('data-motion') === 'reduce' || !!globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  let running = (P.play ?? !F.compact) && !reduced();
  if (!running) warm();

  function drawBands() {
    const St = now(), m = St.m, g = plot.ctx;
    const xp = St.xp * 1e6, xn = St.xn * 1e6, Vj = St.Vj;
    const top = m.Eg + 0.75, bot = -(m.Eg - 2 * S.JUNCTION.delta - VMIN) - 0.45;
    plot.setView([-1.05, 1.05], [bot, top]);
    plot.clear();
    const narrow = (canvas.clientWidth || 600) < 520, fs = narrow ? 10 : 11.5;
    const Ec = (x) => m.Eg - Vj * S.profile(x, xp, xn), Ev = (x) => Ec(x) - m.Eg;
    // the depletion region and its fixed charges
    plot.rect(-xp, bot, xp + xn, top - bot, { color: 'gold', alpha: 0.08, stroke: false });
    plot.text('depletion region', (xn - xp) / 2, top, { color: 'gold', align: 'center', dy: 9, size: fs - 0.5 });
    plot.text('p-type', -1, top, { color: 'warn', dx: 4, dy: 9, size: fs, weight: 650 });
    plot.text('n-type', 1.05, top, { color: 'accent', align: 'right', dx: -6, dy: 9, size: fs, weight: 650 });
    const nIon = Math.max(1, Math.round((xp + xn) / 0.09));
    for (let i = 0; i < nIon; i++) {
      const x = -xp + ((i + 0.5) * (xp + xn)) / nIon;
      plot.text(x < 0 ? '−' : '+', x, bot, { color: x < 0 ? 'warn' : 'accent', align: 'center', dy: -12, size: fs + 1, weight: 700 });
    }
    // the bands
    plot.fn(Ec, { color: 'accent', width: 3 });
    plot.fn(Ev, { color: 'warn', width: 3 });
    // Fermi levels: one in equilibrium, split by eV under bias
    const EFp = S.JUNCTION.delta, EFn = m.Eg - Vj - S.JUNCTION.delta, split = Math.abs(St.V) > 0.005;
    plot.line(-1.05, EFp, split ? 0 : 1.05, EFp, { color: 'gold', width: 1.6, dash: [6, 4] });
    if (split) plot.line(0, EFn, 1.05, EFn, { color: 'gold', width: 1.6, dash: [6, 4] });
    // the barrier an electron on the n side must climb
    const xb = Math.min(0.9, xn + 0.1);
    plot.line(xb - 0.12, m.Eg, xb + 0.06, m.Eg, { color: 'violet', width: 1, dash: [3, 3] });
    plot.arrow(xb, Ec(1.05), xb, m.Eg, { color: 'violet', width: 1.6, head: 7 });
    // carriers: pixel offsets above the conduction band (electrons) or below the valence band (holes)
    const Cc = plot.col;
    const dot = (x, E, d, kind, alpha = 1) => {
      const X = plot.X(x), Y = plot.Y(E) + (kind === 'e' ? -(4 + 9 * d) : 4 + 9 * d);
      g.save(); g.globalAlpha = alpha; g.beginPath(); g.arc(X, Y, 3.4, 0, 2 * Math.PI);
      if (kind === 'e') { g.fillStyle = Cc.accent; g.fill(); } else { g.strokeStyle = Cc.warn; g.lineWidth = 1.8; g.stroke(); }
      g.restore();
    };
    for (const c of still) {
      const x = c.minority ? c.x : c.kind === 'e' ? xn + c.x * (1.05 - xn) / 1.05 : -xp + c.x * (1.05 - xp) / 1.05;
      dot(x, c.kind === 'e' ? Ec(x) : Ev(x), c.d, c.kind, c.minority ? 0.85 : 1);
    }
    for (const c of moving) if (!(c.delay > 0)) dot(c.x, c.kind === 'e' ? Ec(c.x) : Ev(c.x), c.d, c.kind);
    // labels last, on top of the carriers
    plot.text('conduction band', -1, m.Eg, { color: 'accent', dx: 4, dy: -24, size: fs });
    plot.text('valence band', -1, 0, { color: 'warn', dx: 4, dy: 26, size: fs });
    plot.text(split ? 'Fermi level (p)' : 'Fermi level', -0.62, EFp, { color: 'gold', dy: -10, size: fs - 1 });
    if (split) {
      plot.text('Fermi level (n)', 0.62, EFn, { color: 'gold', dy: 11, size: fs - 1 });
      plot.arrow(0.03, EFp, 0.03, EFn, { color: 'gold', width: 1.4, head: 6 });
      plot.text(`eV = ${f2(St.V)} eV`, 0.06, (EFp + EFn) / 2, { color: 'gold', size: fs - 1 });
    }
    plot.text(hide.has('barrier') ? 'barrier: ?' : `barrier ${f2(Vj)} eV`, xb + 0.03, m.Eg, { color: 'violet', dy: -10, size: fs - 0.5 });
    // flashes: a pair made by a photon, or a recombination giving light (direct gap) or heat (indirect)
    const nm = S.ledNm(m.Eg), [r, gg, b] = wavelengthToRGB(nm), light = `rgb(${r}, ${gg}, ${b})`;
    for (const f of flashes) {
      const a = Math.min(1, f.t / 0.35), X = plot.X(f.x), y1 = plot.Y(Ec(f.x)), y0 = plot.Y(Ev(f.x));
      g.save(); g.globalAlpha = a;
      g.strokeStyle = f.kind === 'absorb' ? Cc.gold : m.direct ? light : Cc.ink3; g.lineWidth = 1.6; g.setLineDash([3, 3]);
      g.beginPath(); g.moveTo(X, y0); g.lineTo(X, y1); g.stroke(); g.setLineDash([]);
      // a photon: arriving from above (absorbed) or leaving up and to the side (emitted, direct gaps only)
      if (f.kind === 'absorb' || m.direct) {
        const up = f.kind === 'absorb', len = 34, sx = X + (up ? -18 : 6), sy = (y0 + y1) / 2 - (up ? 26 : 10);
        g.strokeStyle = up ? Cc.gold : light; g.lineWidth = 1.6; g.beginPath();
        for (let i = 0; i <= 20; i++) { const s = i / 20, px = sx + (up ? 14 : 20) * s, py = sy + (up ? 1 : -1) * len * s * 0.6 + 3 * Math.sin(s * 14); if (i) g.lineTo(px, py); else g.moveTo(px, py); }
        g.stroke();
      }
      g.restore();
    }
  }

  function drawIV() {
    if (!gplot) return;
    const St = now(), key = St.key;
    const IL1 = wanted.includes('light') || P.light > 0 ? S.junction(key, 0, 1).IL * 1e3 : 0;
    gplot.setView([VMIN, S.junction(key, 0).Vbi], [-(Math.max(8, 1.15 * IL1) + 2), 45]);
    gplot.clear();
    const I = (v) => S.cell(v, St.I0, St.IL) * 1e3;
    if (St.IL > 0) {
      const M = S.mpp(St.I0, St.IL), voc = S.vOC(St.I0, St.IL);
      if (!hide.has('power')) {
        gplot.rect(0, M.I * 1e3, M.V, -M.I * 1e3, { color: 'good', alpha: 0.18, width: 1 });
        gplot.text('maximum power', M.V / 2, (M.I * 1e3) / 2, { color: 'good', align: 'center', size: 11 });
      }
      gplot.point(voc, 0, { color: 'ink2', r: 3.5, label: 'open circuit', ldx: -8, ldy: -11, lalign: 'right' });
    }
    gplot.fn(I, { color: 'accent', width: 2.6 });
    gplot.point(St.V, Math.max(-1e9, Math.min(1e9, St.I * 1e3)), { color: 'gold', r: 5.5 });
  }

  let last = '';
  function readout() {
    if (P.readout === false) return;
    const St = now(), key = [St.key, St.V, St.light].join();
    if (key === last) return;
    last = key;
    const nm = S.ledNm(St.m.Eg), Id = S.diode(St.V, St.I0), rows = [
      ['bias $V$', `${f2(St.V)}\\,\\mathrm{V}`],
      ['barrier $e(V_{bi} - V)$', hide.has('barrier') ? '?' : `${f2(St.Vj)}\\,\\mathrm{eV}`],
      ['depletion width', hide.has('W') ? '?' : `${(St.W * 1e6).toFixed(2)}\\,\\mu\\mathrm{m}`],
      ['current $I$', hide.has('I') ? '?' : texI(St.I)],
    ];
    if (St.V > 0 && Id > 1e-6) rows.push(['recombination gives', St.m.direct ? (hide.has('lambda') ? '?' : `\\text{light, }${nm.toFixed(0)}\\,\\mathrm{nm}\\text{ (${colourName(nm)})}`) : '\\text{mostly heat (indirect gap)}']);
    if (St.IL > 0 && !hide.has('power')) {
      const Pw = -St.V * St.I, M = S.mpp(St.I0, St.IL);
      rows.push(['power delivered', Pw > 0 ? `${(Pw * 1e3).toFixed(1)}\\,\\mathrm{mW}` : '\\text{none}'], ['best possible', `${(M.P * 1e3).toFixed(1)}\\,\\mathrm{mW}\\text{ at }${M.V.toFixed(2)}\\,\\mathrm{V}`]);
    }
    F.readout(rows);
  }

  function drawAll() { readout(); drawBands(); drawIV(); }
  let loop = F.animate((dt) => { if (running) { stepSim(dt, now()); drawBands(); } });
  if (!F.compact && P.play !== false) {
    const btn = F.button({ label: running ? 'Pause' : 'Play', onClick: () => {
      running = !running; btn.textContent = running ? 'Pause' : 'Play';
      loop.stop(); loop = F.animate((dt) => { if (running) { stepSim(dt, now()); drawBands(); } }, { force: running });
      if (!running) drawBands();
    } });
  }
  F.onChange((k) => { if (k === 'material') showSlider(); if (!running) warm(); drawAll(); });
  F.draw(drawAll);
  F.caption(P.caption || 'A teaching model of an ideal junction, 1 cm² across, doped 10¹⁶ cm⁻³ on each side, at 300 K. Positions are to scale; carriers are a sprinkling, not their real numbers (about 10¹⁶ per cm³ of each majority). The current is the ideal-diode law with $I_0 \\propto e^{-E_g/kT}$, scaled to a typical silicon diode; real diodes and LEDs need a few tenths of a volt more (series resistance, recombination in the junction). Sunlight is a 5772 K blackbody of 1000 W/m², every photon above the gap giving one electron.');
  return { get: (k) => (k === 'V' ? now().V : F.params[k]) };
}

export function validate(P) {
  const p = [];
  if (!S.SEMIS[P.material]) p.push(`mp-junction: unknown material “${P.material}”`);
  else if (!(P.V >= VMIN && P.V <= vmax(P.material))) p.push(`mp-junction: V must lie in ${VMIN}–${vmax(P.material)} V for ${P.material}`);
  if (!(P.light >= 0 && P.light <= 1)) p.push('mp-junction: light must lie in 0–1 sun');
  for (const h of P.hide || []) if (!HIDE.includes(h)) p.push(`mp-junction: unknown hide “${h}”`);
  if (Array.isArray(P.controls)) for (const c of P.controls) if (!CONTROLS.includes(c)) p.push(`mp-junction: unknown control “${c}”`);
  return p;
}
