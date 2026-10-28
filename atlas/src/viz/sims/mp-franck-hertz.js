// The Franck–Hertz experiment. A tube of mercury vapour (or neon): electrons
// leave the cathode, gain energy on their way to the grid, and must climb a
// small retarding voltage to reach the anode. Above, the tube with its
// electrons — each flash is an atom excited by a collision (ultraviolet and
// invisible for mercury, an orange glow for neon). Below it, the kinetic
// energy of a typical electron along the tube: a sawtooth that drops by ΔE at
// every excitation. Beneath, the anode current against the accelerating
// voltage, traced as you raise V: it falls each time V passes another ΔE.
// Physics in model/mp-franck-hertz.js (tested in test/mp-franck-hertz.test.mjs).
//
//   { type: 'mp-franck-hertz', params: {
//       gas: 'hg',            // 'hg' (mercury, ΔE = 4.89 eV, V up to 30 V) or 'ne' (neon, about 18.7 eV, up to 80 V)
//       V: 12,                // accelerating voltage, volts
//       Vr: 1.5,              // retarding voltage between grid and anode, volts (the slider runs 0–5)
//       contact: 0,           // contact potential, volts: shifts every peak by this much (real tubes: about 2 V)
//       graph: true,          // the current–voltage graph under the tube
//       play: null,           // animate the electrons (default: yes in the Explore step, no in a question)
//       controls: null,       // true, false, or a list of: gas V Vr
//       readout: true,
//       hide: [],             // any of: E1 (the excitation energy and the peak spacing), glow (the excitation flashes and glow),
//                             //   curve (the current curve beyond the present voltage), count (atoms excited per electron)
//   } }

import { Plot } from '../plot.js';
import * as FH from '../model/mp-franck-hertz.js';
import { makeRng } from '../../core/rng.js';

export const defaults = { gas: 'hg', V: 12, Vr: 1.5, contact: 0, graph: true, play: null, controls: null, readout: true, hide: [] };
const CONTROLS = ['gas', 'V', 'Vr'];
const HIDE = ['E1', 'glow', 'curve', 'count'];
const XG = 0.8;                                        // the grid’s position along the tube (cathode 0, anode 1)
const f2 = (x) => (Math.abs(x) >= 10 ? x.toFixed(1) : x.toFixed(2));

export function mount(F, P0) {
  const P = { ...defaults, ...P0 };
  const hide = new Set(P.hide || []);
  const wanted = P.controls === true || (P.controls === null && !F.compact) ? CONTROLS : Array.isArray(P.controls) ? P.controls : [];
  const vKey = (g) => (g === 'ne' ? 'Vne' : 'Vhg');
  // one accelerating-voltage slider per gas, so each has a sensible range; only the current gas’s is shown
  const vCtl = {};
  if (wanted.includes('gas')) F.choice({ key: 'gas', label: 'Gas in the tube', options: [['hg', 'mercury vapour'], ['ne', 'neon']], value: P.gas, explain: 'Mercury’s first excited level is 4.89 eV up; neon’s, about 18.7 eV.' });
  else F.params.gas = P.gas;
  for (const g of ['hg', 'ne']) {
    const start = g === P.gas ? P.V : g === 'ne' ? 30 : 12;
    if (wanted.includes('V')) vCtl[g] = F.slider({ key: vKey(g), label: 'Accelerating voltage $V$', min: 0, max: FH.GASES[g].Vmax, step: 0.05, value: Math.min(start, FH.GASES[g].Vmax), unit: '\\mathrm{V}', explain: 'Between cathode and grid: an electron arriving at the grid without a collision has gained $eV$.' });
    else F.params[vKey(g)] = start;
  }
  if (wanted.includes('Vr')) F.slider({ key: 'Vr', label: 'Retarding voltage $V_r$', min: 0, max: 5, step: 0.05, value: P.Vr, unit: '\\mathrm{V}', explain: 'Between grid and anode: an electron needs at least $eV_r$ left to reach the anode.' });
  else F.params.Vr = P.Vr;
  const showSlider = () => { for (const g of ['hg', 'ne']) if (vCtl[g]) vCtl[g].node.style.display = g === F.params.gas ? '' : 'none'; };
  showSlider();

  const { canvas } = F.canvas({ aspect: 'wide', label: P.alt || 'A Franck–Hertz tube and the energy of an electron along it' });
  const plot = new Plot(canvas, { x: [-0.13, 1.13], y: [-1.3, 1.32], grid: false, axes: false, pad: { l: 4, r: 4, t: 4, b: 4 } });
  const gcan = P.graph !== false ? F.canvas({ aspect: 'wide', label: 'The anode current against the accelerating voltage' }) : null;
  const gplot = gcan ? new Plot(gcan.canvas, { x: [0, 30], y: [0, 1], xlabel: 'accelerating voltage V (V)', ylabel: 'anode current' }) : null;

  const now = () => {
    const gas = FH.GASES[F.params.gas] ? F.params.gas : 'hg', G = FH.GASES[gas];
    const V = Math.min(G.Vmax, Math.max(0, F.params[vKey(gas)] ?? P.V)), Vr = F.params.Vr;
    return { gas, G, V, Vr, U: Math.max(0, V - P.contact), E1: G.E1 };
  };
  let curveCache = null;
  const curveOf = (gas, Vr) => {
    const key = `${gas},${Vr},${P.contact}`;
    if (!curveCache || curveCache.key !== key) {
      const pts = FH.curve(gas, { Vr, contact: P.contact }, 1000);
      curveCache = { key, pts, top: Math.max(...pts.map((p) => p[1])), peaks: FH.peaks(pts) };
    }
    return curveCache;
  };

  // ---- electrons: each plans its excitations when it leaves the cathode
  let rng = makeRng(11), electrons = [], flashes = [], spawn = 0, planKey = '';
  function plan(S) {
    const e = { x: 0, y: 0.68 + 0.42 * rng.next(), dir: 1, hits: [], kg: 0 };
    let k = 1;
    while (S.U > 0) {
      const at = k * S.E1 + -S.G.lambda * Math.log(1 - rng.next());       // the field energy at the k-th excitation
      if (at >= S.U) break;
      e.hits.push({ x: (XG * at) / S.U, done: false });
      k++;
      if (k > 40) break;
    }
    e.kg = S.U - e.hits.length * S.E1;
    e.turn = e.kg < S.Vr ? XG + (1 - XG) * Math.max(0, e.kg) / Math.max(1e-9, S.Vr) : null;
    return e;
  }
  function stepSim(dt, S) {
    if (S.gas !== planKey) { electrons = []; flashes = []; planKey = S.gas; }
    spawn += dt * 7;
    while (spawn >= 1 && electrons.length < 60) { electrons.push(plan(S)); spawn -= 1; }
    for (const e of electrons) {
      e.x += e.dir * 0.3 * dt;
      for (const h of e.hits) if (!h.done && e.x >= h.x) { h.done = true; flashes.push({ x: h.x, y: e.y, t: 0.45 }); }
      if (e.dir > 0 && e.turn !== null && e.x >= e.turn) e.dir = -1;
    }
    electrons = electrons.filter((e) => (e.dir > 0 ? e.x < 1 : e.x > XG));
    for (const f of flashes) f.t -= dt;
    flashes = flashes.filter((f) => f.t > 0);
  }
  /** a representative still: run the tube for a few seconds from a fixed seed */
  function warm() { rng = makeRng(11); electrons = []; flashes = []; planKey = ''; spawn = 0; const S = now(); for (let i = 0; i < 80; i++) stepSim(0.05, S); }

  const reduced = () => document.documentElement.getAttribute('data-motion') === 'reduce' || !!globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  let running = (P.play ?? !F.compact) && !reduced();
  if (!running) warm();

  function drawTube() {
    const S = now(), C = plot.col;
    plot.clear();
    const narrow = (canvas.clientWidth || 600) < 520, fs = narrow ? 10 : 11.5;
    const visible = S.G.visible;
    // the glass and the electrodes
    plot.rect(-0.05, 0.6, 1.1, 0.58, { color: 'ink3', alpha: 0.05, width: 1.2, stroke: 'ink3' });
    // the glow: where typical electrons excite atoms (orange for neon; marked faintly for mercury’s invisible ultraviolet)
    if (!hide.has('glow')) {
      const places = FH.excitationPlaces(S.U, S.E1).map((p) => p + S.G.lambda / Math.max(S.U, 1e-9));
      for (const p of places) {
        const x = XG * Math.min(1, p), w = Math.max(0.012, (XG * 2 * S.G.lambda) / Math.max(S.U, 1e-9));
        if (x > XG) continue;
        plot.rect(x - w / 2, 0.62, w, 0.54, { color: visible ? 'warn' : 'violet', alpha: visible ? 0.45 : 0.12, stroke: false });
      }
      if (places.length && !visible) plot.text('ultraviolet, 254 nm: invisible', XG * Math.min(1, places[0]), 1.24, { color: 'violet', align: 'center', size: fs - 1 });
    }
    plot.line(0, 0.62, 0, 1.16, { color: 'warn', width: 4 });
    plot.line(XG, 0.62, XG, 1.16, { color: 'ink2', width: 1.6, dash: [3, 4] });
    plot.line(1, 0.62, 1, 1.16, { color: 'ink', width: 4 });
    plot.text('cathode', 0, 0.62, { color: 'warn', align: 'center', dy: 11, size: fs });
    plot.text('grid', XG, 0.62, { color: 'ink2', align: 'center', dy: 11, size: fs });
    plot.text('anode', 1, 0.62, { color: 'ink', align: 'center', dy: 11, size: fs });
    plot.text(`${S.G.label}: V = ${f2(S.V)} V`, 0.4, 0.62, { color: 'ink2', align: 'center', dy: 11, size: fs });
    // electrons and collision flashes
    if (!hide.has('glow')) for (const f of flashes) plot.circle(f.x, f.y, 0.018 + 0.03 * (0.45 - f.t), { fill: visible ? 'warn' : 'violet', alpha: Math.min(1, f.t / 0.3), stroke: false });
    for (const e of electrons) plot.point(e.x, e.y, { color: e.dir > 0 ? 'accent' : 'bad', r: 2.6 });
    // ---- the energy of a typical electron along the tube (collisions exactly at ΔE)
    const Emax = 1.3 * S.E1, Y = (E) => -1.1 + (1.38 * E) / Emax;
    plot.line(-0.02, Y(0), 1.02, Y(0), { color: 'ink4', width: 1 });
    plot.line(0, Y(0), 0, Y(Emax), { color: 'ink4', width: 1 });
    plot.text('kinetic energy of a typical electron', 0, Y(Emax), { color: 'ink3', dx: 6, dy: 2, size: fs - 1 });
    plot.line(0, Y(S.E1), 1.02, Y(S.E1), { color: 'gold', width: 1, dash: [5, 4] });
    plot.text(hide.has('E1') ? 'ΔE = ?' : `ΔE = ${f2(S.E1)} eV`, 1.1, Y(S.E1), { color: 'gold', align: 'right', dy: -9, size: fs - 0.5 });
    plot.rect(XG, Y(0), 1 - XG, Y(Math.min(S.Vr, Emax)) - Y(0), { color: 'bad', alpha: 0.12, stroke: false });
    plot.text(`retarding ${f2(S.Vr)} V`, (XG + 1) / 2, Y(0), { color: 'bad', align: 'center', dy: 11, size: fs - 1 });
    const pts = [];
    if (S.U > 0) {
      let k = 0;
      for (let i = 0; i <= 400; i++) {
        const x = (XG * i) / 400, Fe = (S.U * x) / XG;
        if (Fe >= (k + 1) * S.E1 && k < 60) { pts.push([XG * ((k + 1) * S.E1) / S.U, S.E1]); pts.push([NaN, NaN]); pts.push([XG * ((k + 1) * S.E1) / S.U, 0]); k++; }
        pts.push([x, Fe - k * S.E1]);
      }
      const kg = S.U - k * S.E1;
      if (kg >= S.Vr) pts.push([1, kg - S.Vr]);
      else pts.push([XG + (1 - XG) * Math.max(0, kg) / Math.max(1e-9, S.Vr), 0]);
      plot.path(pts.map(([x, E]) => [x, Number.isFinite(E) ? Y(E) : NaN]), { color: 'accent', width: 2.2 });
      // the drops at each excitation, dashed
      for (let j = 1; j <= k; j++) { const x = (XG * j * S.E1) / S.U; plot.line(x, Y(S.E1), x, Y(0), { color: 'accent', width: 1.2, dash: [3, 3] }); }
      plot.text(kg >= S.Vr ? 'reaches the anode' : 'turned back: too little energy left', kg >= S.Vr ? 1 : XG, Y(Math.max(0, kg - S.Vr)), { color: kg >= S.Vr ? 'good' : 'bad', align: 'right', dx: kg >= S.Vr ? -4 : -6, dy: -10, size: fs - 1 });
    }
  }

  function drawGraph() {
    if (!gplot) return;
    const S = now(), cv = curveOf(S.gas, S.Vr);
    gplot.setView([0, S.G.Vmax], [0, 1.12 * cv.top]);
    gplot.clear();
    if (!hide.has('curve')) gplot.fn((v) => FH.anodeCurrent(v, S.gas, { Vr: S.Vr, contact: P.contact }), { color: 'ink4', width: 1.4 });
    gplot.fn((v) => FH.anodeCurrent(v, S.gas, { Vr: S.Vr, contact: P.contact }), { color: 'accent', width: 2.6, domain: [0, Math.max(1e-6, S.V)] });
    gplot.point(S.V, FH.anodeCurrent(S.V, S.gas, { Vr: S.Vr, contact: P.contact }), { color: 'gold', r: 5 });
    // the spacing of the first two peaks the trace has passed
    const pk = cv.peaks.filter((v) => v <= S.V || !hide.has('curve'));
    if (pk.length >= 2 && !hide.has('E1')) {
      const y = 1.04 * cv.top;
      gplot.line(pk[0], 0, pk[0], y, { color: 'ink3', width: 1, dash: [4, 4] });
      gplot.line(pk[1], 0, pk[1], y, { color: 'ink3', width: 1, dash: [4, 4] });
      gplot.arrow(pk[0], y, pk[1], y, { color: 'gold', width: 1.6, head: 7 });
      gplot.arrow(pk[1], y, pk[0], y, { color: 'gold', width: 1.6, head: 7 });
      gplot.text(`ΔV = ${f2(pk[1] - pk[0])} V`, (pk[0] + pk[1]) / 2, y, { color: 'gold', align: 'center', dy: -9, size: 11.5 });
    }
  }

  let lastRead = '';
  function readout() {
    if (P.readout === false) return;
    const S = now(), key = [S.gas, S.V, S.Vr].join();
    if (key === lastRead) return;
    lastRead = key;
    const cv = curveOf(S.gas, S.Vr), I = FH.anodeCurrent(S.V, S.gas, { Vr: S.Vr, contact: P.contact });
    F.readout([
      ['$V$', `${f2(S.V)}\\,\\mathrm{V}`],
      ['atoms a typical electron excites', hide.has('count') ? '?' : String(FH.excitations(S.U, S.E1))],
      ['anode current', `${Math.round((100 * I) / cv.top)}\\%\\text{ of the largest}`],
      S.G.visible ? ['light from the excited atoms', '\\text{orange-red, by way of a lower level}'] : ['photon from the excited atom', hide.has('E1') ? '?' : `${FH.photonNm(S.E1).toFixed(1)}\\,\\mathrm{nm}\\text{ (ultraviolet)}`],
    ]);
  }

  function drawAll() { readout(); drawTube(); drawGraph(); }
  let loop = F.animate((dt) => { if (running) { stepSim(dt, now()); drawTube(); } });
  if (!F.compact && P.play !== false) {
    const btn = F.button({ label: running ? 'Pause' : 'Play', onClick: () => {
      running = !running; btn.textContent = running ? 'Pause' : 'Play';
      loop.stop(); loop = F.animate((dt) => { if (running) { stepSim(dt, now()); drawTube(); } }, { force: running });
      if (!running) drawTube();
    } });
  }
  // sweep the accelerating voltage from 0 to the top of its range, as Franck and Hertz did by hand
  if (wanted.includes('V')) {
    let sweep = null;
    F.button({ label: 'Sweep V', onClick: () => {
      sweep?.stop();
      const S = now(), key = vKey(S.gas), top = S.G.Vmax;
      F.set(key, 0);
      sweep = F.animate((dt) => {
        const v = Math.min(top, (F.params[key] ?? 0) + (top / 9) * dt);
        F.set(key, +v.toFixed(2));
        if (v >= top) sweep.stop();
      }, { force: true });
    } });
  }
  F.onChange((k) => { if (k === 'gas') showSlider(); if (!running) warm(); drawAll(); });
  F.draw(drawAll);
  F.caption(P.caption || `A teaching model, not to scale: electrons gain energy steadily, excite an atom soon after they have ΔE to give, and lose exactly that much; elastic collisions (which cost them almost nothing), space charge and the higher levels are left out, and the overall rise of the current with V is modelled simply. ${P.contact ? `Every peak is shifted by a ${P.contact} V contact potential, as in real tubes. ` : ''}Mercury’s 4.89 eV photons are ultraviolet and invisible; neon’s excited atoms first drop to an intermediate level, giving off the orange-red light seen as glowing layers.`);
  return { get: (k) => F.params[k] };
}

export function validate(P) {
  const p = [];
  if (!FH.GASES[P.gas]) p.push(`mp-franck-hertz: unknown gas “${P.gas}”`);
  else if (!(P.V >= 0 && P.V <= FH.GASES[P.gas].Vmax)) p.push(`mp-franck-hertz: V must lie in 0–${FH.GASES[P.gas].Vmax} V for ${P.gas}`);
  if (!(P.Vr >= 0 && P.Vr <= 5)) p.push('mp-franck-hertz: Vr must lie in 0–5 V');
  if (!(P.contact >= 0 && P.contact <= 5)) p.push('mp-franck-hertz: contact must lie in 0–5 V');
  for (const h of P.hide || []) if (!HIDE.includes(h)) p.push(`mp-franck-hertz: unknown hide “${h}”`);
  if (Array.isArray(P.controls)) for (const c of P.controls) if (!CONTROLS.includes(c)) p.push(`mp-franck-hertz: unknown control “${c}”`);
  return p;
}
