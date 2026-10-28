// The photoelectric effect on a lab bench. Light of a chosen wavelength and
// brightness falls on a metal plate (the cathode) inside an evacuated tube.
// A photon carrying more than the metal’s work function φ frees one
// electron, which crosses to the collector unless the retarding voltage
// turns it back. Under the tube, one of two graphs: the Millikan graph —
// K_max against frequency, a straight line of slope h for every metal — or
// the photocurrent against the retarding voltage. Physics in
// model/qm-photoelectric.js (tested in test/qm-photoelectric.test.mjs).
//
//   { type: 'qm-photoelectric', params: {
//       metal: 'potassium',     // a key of METALS: cesium potassium sodium zinc copper gold platinum
//       lambda: 450,            // wavelength in nm (the slider runs 190–800)
//       intensity: 60,          // brightness: photons per second, as % of the maximum
//       V: 0,                   // retarding voltage in volts (negative pulls electrons across)
//       panel: 'millikan',      // 'millikan' (K_max against f) or 'iv' (current against V)
//       graph: true,            // false draws the tube alone
//       controls: null,         // true, false, or a list of: metal lambda intensity V panel (default: all, none when compact)
//       readout: true,          // the numbers under the picture
//       hide: [],               // 'K' hides K_max and V₀ (for a question that asks for them); 'phi' hides φ
//       metals: null,           // the metals offered and drawn on the Millikan graph
//   } }

import { Plot, themeColors } from '../plot.js';
import { photonEV, freqHz, wavelengthToRGB, isVisible, H_EVS, bandOf } from '../model/qm-light.js';
import * as M from '../model/qm-photoelectric.js';
import { makeRng } from '../../core/rng.js';

export const defaults = { metal: 'potassium', lambda: 450, intensity: 60, V: 0, panel: 'millikan', graph: true, controls: null, readout: true, hide: [], metals: null };
const CHOICES = ['cesium', 'potassium', 'sodium', 'zinc', 'copper', 'platinum'];
const CONTROLS = ['metal', 'lambda', 'intensity', 'V', 'panel'];
const F14 = 1e14;                       // frequency unit on the graph
const fmt = (x, n = 3) => (Math.abs(x) < 1e-9 ? '0' : String(+x.toPrecision(n)));

export function mount(F, P0) {
  const P = { ...defaults, ...P0 };
  const hide = new Set(P.hide || []);
  const wanted = P.controls === true || (P.controls === null && !F.compact) ? CONTROLS : Array.isArray(P.controls) ? P.controls : [];
  const metals = P.metals || (CHOICES.includes(P.metal) ? CHOICES : [P.metal, ...CHOICES]);
  const ctl = (key, make) => (wanted.includes(key) ? make() : (F.params[key] = P[key]));
  ctl('metal', () => F.choice({ key: 'metal', label: 'Cathode metal', options: metals.map((k) => [k, hide.has('phi') ? M.METALS[k].label : `${M.METALS[k].symbol}, φ = ${M.METALS[k].phi.toFixed(2)} eV`]), value: P.metal, explain: 'The work function $\\varphi$: the least energy that can free an electron from this surface.' }));
  ctl('lambda', () => F.slider({ key: 'lambda', label: 'Wavelength $\\lambda$', min: 190, max: 800, step: 1, value: P.lambda, unit: '\\mathrm{nm}', explain: 'Sets the colour — and the energy $hf = hc/\\lambda$ that every photon carries.' }));
  ctl('intensity', () => F.slider({ key: 'intensity', label: 'Brightness', min: 0, max: 100, step: 1, value: P.intensity, unit: '\\%', explain: 'How many photons arrive each second. Each one still carries the same energy $hf$.' }));
  ctl('V', () => F.slider({ key: 'V', label: 'Retarding voltage $V$', min: -2, max: 5, step: 0.01, value: P.V, unit: '\\mathrm{V}', explain: 'Positive: the collector is held negative and pushes electrons back. Negative: it pulls them across.' }));
  if (P.graph !== false) ctl('panel', () => F.choice({ key: 'panel', label: 'Graph', options: [['millikan', 'Kmax against frequency'], ['iv', 'current against voltage']], value: P.panel, explain: 'Millikan’s graph, or the current through the tube as the voltage changes.' }));

  const { canvas, box } = F.canvas({ aspect: 'wide', label: P.alt || 'A phototube: light falls on a metal plate and ejected electrons cross to a collector' });
  const ctx = canvas.getContext('2d');
  const gcan = P.graph !== false ? F.canvas({ aspect: 'wide', label: 'A graph of the photoelectric measurements' }) : null;
  const plot = gcan ? new Plot(gcan.canvas, { x: [0, 1], y: [0, 1] }) : null;

  const now = () => {
    const metal = M.METALS[F.params.metal] ? F.params.metal : P.metal;
    const phi = M.METALS[metal].phi, nm = F.params.lambda, I = F.params.intensity / 100, V = F.params.V;
    return { metal, phi, nm, I, V, ...M.state({ nm, phi, intensity: I, V }) };
  };

  // ---- the animated tube: photons travel down the beam; electrons cross the gap
  const B = 0.9, A = (B * B) / 2;        // gap-widths per second per √eV; with A = B²/2 an electron reaches the collector iff K > eV
  let rng = makeRng(7), photons = [], electrons = [], flashes = [];
  function stepSim(dt, S) {
    const rate = 34 * S.I;
    let n = rate * dt;
    while (n > 0) { if (rng.next() < Math.min(1, n)) photons.push({ s: 0, y: rng.next(), u: 1.9 + 0.3 * rng.next() }); n -= 1; }
    for (const p of photons) p.s += p.u * dt;
    for (const p of photons.filter((q) => q.s >= 1)) {
      if (S.emits && electrons.length < 300 && rng.next() < 0.55) electrons.push({ x: 0, v: B * Math.sqrt(M.sampleK(S.K, rng.next())), y: p.y });
    }
    photons = photons.filter((q) => q.s < 1);
    for (const e of electrons) { e.v -= A * S.V * dt; e.x += e.v * dt; }
    for (const e of electrons) if (e.x >= 1) flashes.push({ y: e.y, t: 0.25 });
    electrons = electrons.filter((e) => e.x < 1 && e.x > -0.01 && !(Math.abs(e.v) < 1e-3 && S.V > 0 && e.x < 0.002));
    for (const f of flashes) f.t -= dt;
    flashes = flashes.filter((f) => f.t > 0);
  }
  /** a representative still: run the bench for a few seconds from a fixed seed */
  function warm() { rng = makeRng(7); photons = []; electrons = []; flashes = []; const S = now(); for (let k = 0; k < 240; k++) stepSim(1 / 60, S); }

  function drawTube() {
    const C = themeColors();
    const W = canvas.clientWidth || 600, H = canvas.clientHeight || 300, dpr = Math.min(2, devicePixelRatio || 1);
    const want = W < 520 ? '4 / 3' : '';
    if (box.style.aspectRatio !== want) { box.style.aspectRatio = want; requestAnimationFrame(drawAll); return; }
    if (canvas.width !== Math.round(W * dpr) || canvas.height !== Math.round(H * dpr)) { canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr); }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);
    const S = now(), small = W < 520, fs = small ? 10.5 : 12;
    const txt = (s, x, y, o = {}) => {
      ctx.save(); ctx.font = `${o.w || 600} ${o.size || fs}px Inter, system-ui, sans-serif`; ctx.textAlign = o.align || 'center'; ctx.textBaseline = 'middle';
      ctx.lineWidth = 3.5; ctx.strokeStyle = C.bg; ctx.globalAlpha = 0.9; ctx.strokeText(s, x, y); ctx.globalAlpha = 1;
      ctx.fillStyle = o.color || C.ink; ctx.fillText(s, x, y); ctx.restore();
    };
    const line = (x0, y0, x1, y1, col, w = 2, dash = []) => { ctx.save(); ctx.strokeStyle = col; ctx.lineWidth = w; ctx.setLineDash(dash); ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke(); ctx.restore(); };
    // geometry
    const gx0 = W * 0.07, gx1 = W * 0.93, gy0 = H * 0.2, gy1 = H * 0.7;
    const xc = W * 0.21, xa = W * 0.79, py0 = gy0 + 0.12 * (gy1 - gy0), py1 = gy1 - 0.12 * (gy1 - gy0);
    const ly = H * 0.06, lx = W * 0.47;                       // the lamp
    const ty0 = py0 + 0.18 * (py1 - py0), ty1 = py1 - 0.18 * (py1 - py0);   // where the beam lands
    // glass envelope
    ctx.save(); ctx.strokeStyle = C.ink3; ctx.lineWidth = 1.6; ctx.beginPath();
    const r = 18; ctx.moveTo(gx0 + r, gy0); ctx.arcTo(gx1, gy0, gx1, gy1, r); ctx.arcTo(gx1, gy1, gx0, gy1, r); ctx.arcTo(gx0, gy1, gx0, gy0, r); ctx.arcTo(gx0, gy0, gx1, gy0, r); ctx.closePath();
    ctx.fillStyle = C.panel; ctx.globalAlpha = 0.35; ctx.fill(); ctx.globalAlpha = 1; ctx.stroke(); ctx.restore();
    txt('vacuum', (gx0 + gx1) / 2, gy1 - 12, { color: C.ink3, w: 500, size: fs - 1 });
    // the beam
    const [cr, cg, cb] = wavelengthToRGB(S.nm), vis = isVisible(S.nm);
    if (S.I > 0) {
      ctx.save(); ctx.beginPath(); ctx.moveTo(lx - 4, ly); ctx.lineTo(lx + 4, ly); ctx.lineTo(xc + 3, ty1); ctx.lineTo(xc + 3, ty0); ctx.closePath();
      ctx.fillStyle = `rgba(${cr}, ${cg}, ${cb}, ${(vis ? 0.1 : 0.06) + 0.22 * S.I})`; ctx.fill();
      if (!vis) { ctx.setLineDash([4, 4]); ctx.strokeStyle = `rgba(${cr}, ${cg}, ${cb}, 0.8)`; ctx.lineWidth = 1; ctx.stroke(); }
      ctx.restore();
    }
    // the lamp
    ctx.save(); ctx.fillStyle = vis ? `rgb(${cr}, ${cg}, ${cb})` : C.ink3; ctx.beginPath(); ctx.arc(lx, ly, 7, 0, 2 * Math.PI); ctx.fill(); ctx.restore();
    txt(vis ? `${Math.round(S.nm)} nm light` : `${Math.round(S.nm)} nm: ${bandOf(S.nm)}, invisible`, lx + 14, ly, { align: 'left', color: C.ink2, w: 600 });
    // photons
    for (const p of photons) {
      const ty = ty0 + p.y * (ty1 - ty0), x = lx + (xc + 3 - lx) * p.s, y = ly + (ty - ly) * p.s;
      ctx.save(); ctx.fillStyle = `rgb(${cr}, ${cg}, ${cb})`; ctx.globalAlpha = 0.3; ctx.beginPath(); ctx.arc(x, y, 5.5, 0, 2 * Math.PI); ctx.fill();
      ctx.globalAlpha = 1; ctx.beginPath(); ctx.arc(x, y, 2.4, 0, 2 * Math.PI); ctx.fill(); ctx.restore();
    }
    // the plates
    line(xc, py0, xc, py1, C.ink2, 6);
    line(xa, py0, xa, py1, C.ink2, 3, [6, 4]);
    txt(`cathode: ${M.METALS[S.metal].label}`, xc + 2, py0 - 12, { color: C.ink2, w: 600, size: fs - 0.5 });
    txt('collector', xa, py0 - 12, { color: C.ink2, w: 600, size: fs - 0.5 });
    // electrons
    for (const e of electrons) {
      const x = xc + 5 + e.x * (xa - xc - 10), y = ty0 + e.y * (ty1 - ty0);
      ctx.save(); ctx.fillStyle = C.accent; ctx.beginPath(); ctx.arc(x, y, 3.2, 0, 2 * Math.PI); ctx.fill(); ctx.restore();
    }
    for (const f of flashes) { ctx.save(); ctx.strokeStyle = C.good; ctx.globalAlpha = f.t * 3; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(xa, ty0 + f.y * (ty1 - ty0), 5 + 14 * (0.25 - f.t), 0, 2 * Math.PI); ctx.stroke(); ctx.restore(); }
    if (S.I > 0 && !S.emits) txt(hide.has('phi') ? 'no electrons: each photon has too little energy' : `no electrons: hf = ${fmt(S.E)} eV < φ = ${S.phi.toFixed(2)} eV`, (xc + xa) / 2, (py0 + py1) / 2, { color: C.bad, w: 650 });
    // the external circuit: ammeter and adjustable source
    const wy = H * 0.86, xm = xc + 0.3 * (xa - xc), xs = xc + 0.7 * (xa - xc);
    line(xc, py1, xc, wy, C.ink3, 1.6); line(xa, py1, xa, wy, C.ink3, 1.6);
    line(xc, wy, xm - 13, wy, C.ink3, 1.6); line(xm + 13, wy, xs - 6, wy, C.ink3, 1.6); line(xs + 6, wy, xa, wy, C.ink3, 1.6);
    ctx.save(); ctx.strokeStyle = C.ink2; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.arc(xm, wy, 13, 0, 2 * Math.PI); ctx.stroke(); ctx.restore();
    txt('A', xm, wy, { color: C.ink2, w: 700 });
    line(xs - 6, wy - 13, xs - 6, wy + 13, C.ink2, 2); line(xs + 6, wy - 7, xs + 6, wy + 7, C.ink2, 3.4);
    const cur = S.current * 100;
    txt(`current ${cur < 0.05 ? '0' : fmt(cur, 2)}%`, xm, wy + 22, { color: cur > 0 ? C.good : C.ink3, w: 650, size: fs - 0.5 });
    txt(`V = ${S.V > 0 ? '+' : ''}${S.V.toFixed(2)} V`, xs, wy + 22, { color: C.ink2, w: 650, size: fs - 0.5 });
  }

  function drawGraph() {
    if (!plot) return;
    const S = now(), C = themeColors();
    if (F.params.panel === 'iv') {
      plot.o.xlabel = 'retarding voltage V (V)'; plot.o.ylabel = 'current (fraction of maximum)';
      plot.setView([-2, 5], [0, 1.15]);
      plot.clear();
      plot.fn((v) => S.I * M.currentFraction(v, S.K), { color: 'accent', width: 2.6 });
      if (S.emits) {
        plot.line(S.K, 0, S.K, 1.12, { color: 'gold', width: 1.4, dash: [5, 4] });
        plot.text(hide.has('K') ? 'V₀' : `V₀ = ${fmt(S.K)} V`, S.K, 1.08, { color: 'gold', dx: 6, align: 'left' });
      }
      plot.point(S.V, S.I * M.currentFraction(S.V, S.K), { color: 'gold', r: 5 });
      plot.text(S.emits ? 'every electron collected' : 'below threshold: no current at any voltage', S.emits ? -1.9 : 1.5, S.emits ? S.I + 0.05 : 0.2, { color: 'ink3', align: S.emits ? 'left' : 'center', size: 11.5 });
    } else {
      plot.o.xlabel = 'frequency f (10¹⁴ Hz)'; plot.o.ylabel = 'Kₘₐₓ (eV)';
      plot.setView([0, 16], [-6, 5]);
      plot.clear();
      // the visible band along the bottom
      for (let nm = 380; nm <= 750; nm += 4) {
        const f = freqHz(nm) / F14, [r, g, b] = wavelengthToRGB(nm);
        plot.rect(f - 0.04, -5.95, 0.11, 0.35, { color: `rgb(${r}, ${g}, ${b})`, alpha: 0.9, stroke: false });
      }
      plot.text('visible', freqHz(560) / F14, -5.35, { color: 'ink3', align: 'center', size: 11 });
      for (const k of metals) {
        const phi = M.METALS[k].phi, f0 = M.thresholdHz(phi) / F14, me = k === S.metal;
        plot.fn((f) => (f <= f0 ? H_EVS * f * F14 - phi : NaN), { color: me ? 'accent' : 'ink4', width: me ? 1.6 : 1, dash: [5, 4], domain: [0, f0] });
        plot.fn((f) => H_EVS * f * F14 - phi, { color: me ? 'accent' : 'ink3', width: me ? 2.8 : 1.2, domain: [f0, 16] });
      }
      const f0 = M.thresholdHz(S.phi) / F14;
      plot.point(f0, 0, { color: 'accent', r: 3.5 });
      if (!hide.has('phi')) plot.text(`−φ = −${S.phi.toFixed(2)} eV`, 0, -S.phi, { color: 'accent', dx: 8, dy: 12, align: 'left', size: 11.5 });
      plot.text('slope = h, the same for every metal', 15.8, H_EVS * 15.8 * F14 - S.phi, { color: 'accent', align: 'right', dy: -16, size: 11.5 });
      const f = S.f / F14;
      if (S.emits) { plot.point(f, S.K, { color: 'gold', r: 5.5, label: hide.has('K') ? 'Kₘₐₓ = ?' : `Kₘₐₓ = ${fmt(S.K)} eV`, ldx: -10, ldy: -14, lalign: 'right' }); }
      else plot.point(f, 0, { color: 'bad', r: 5, label: 'no electrons', ldx: 8, ldy: -12 });
    }
  }

  const reduced = () => document.documentElement.getAttribute('data-motion') === 'reduce' || !!globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  let running = !reduced();
  if (!running) warm();
  function drawAll() { drawTube(); drawGraph(); }
  let loop = F.animate((dt) => { if (running) stepSim(dt, now()); drawTube(); });
  // a question's small picture just runs (or, under reduced motion, shows a still); the full one gets Play/Pause
  if (!F.compact) {
    const btn = F.button({ label: running ? 'Pause' : 'Play', onClick: () => {
      running = !running; btn.textContent = running ? 'Pause' : 'Play';
      loop.stop(); loop = F.animate((dt) => { if (running) stepSim(dt, now()); drawTube(); }, { force: running });
      if (!running) drawTube();
    } });
  }

  let last = '';
  function readout() {
    if (P.readout === false) return;
    const S = now();
    const key = [S.metal, S.nm, S.I, S.V, F.params.panel].join();
    if (key === last) return;
    last = key;
    F.readout([
      ['$\\lambda$', `${Math.round(S.nm)}\\,\\mathrm{nm}`],
      ['$f$', `${(S.f / F14).toFixed(2)}\\times10^{14}\\,\\mathrm{Hz}`],
      ['photon energy $hf$', `${fmt(S.E, 4)}\\,\\mathrm{eV}`],
      ['$\\varphi$', hide.has('phi') ? '?' : `${S.phi.toFixed(2)}\\,\\mathrm{eV}`],
      ['$K_{\\max}$', hide.has('K') ? '?' : S.emits ? `${fmt(S.K)}\\,\\mathrm{eV}` : '0 \\text{ (no electrons)}'],
      ['stopping potential $V_0$', hide.has('K') ? '?' : `${fmt(S.K)}\\,\\mathrm{V}`],
      ['current', `${fmt(S.current * 100, 2)}\\%\\text{ of maximum}`],
    ]);
  }
  F.onChange(() => { if (!running) warm(); readout(); drawAll(); });
  F.draw(() => { readout(); drawAll(); });
  F.caption(P.caption || 'Photons are drawn as dots, slowed enormously; how many arrive each second follows the brightness. Electrons leave with a spread of energies up to Kₘₐₓ (those from deeper in the metal come out slower). Work functions are typical values for clean surfaces (Michaelson 1977); real surfaces differ by a few tenths of an eV. The current–voltage curve is a simple model of the electrons’ energy spread.');
  return { get: (k) => F.params[k] };
}

/** Node-safe check of the parameters a lesson passes. */
export function validate(P) {
  const p = [];
  if (!M.METALS[P.metal]) p.push(`qm-photoelectric: unknown metal “${P.metal}”`);
  if (!(P.lambda >= 100 && P.lambda <= 1100)) p.push('qm-photoelectric: lambda must be a wavelength in nm, 100–1100');
  if (!(P.intensity >= 0 && P.intensity <= 100)) p.push('qm-photoelectric: intensity is a percentage, 0–100');
  if (!(P.V >= -5 && P.V <= 10)) p.push('qm-photoelectric: V must lie in −5…10 V');
  if (!['millikan', 'iv'].includes(P.panel)) p.push('qm-photoelectric: panel is millikan or iv');
  for (const h of P.hide || []) if (!['K', 'phi'].includes(h)) p.push(`qm-photoelectric: unknown hide “${h}”`);
  if (Array.isArray(P.controls)) for (const c of P.controls) if (!CONTROLS.includes(c)) p.push(`qm-photoelectric: unknown control “${c}”`);
  for (const m of P.metals || []) if (!M.METALS[m]) p.push(`qm-photoelectric: unknown metal “${m}” in metals`);
  return p;
}
