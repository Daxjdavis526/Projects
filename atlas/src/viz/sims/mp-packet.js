// Wave packets, two views.
//
// 'build': a packet made by adding N plane waves with Gaussian amplitudes
// around k₀. Above, the real part of ψ and its envelope |ψ| as time runs: a
// violet dot rides a crest (phase velocity ω/k), a gold one the envelope’s
// peak (group velocity dω/dk); with dispersion the packet spreads. Below, the
// dispersion relation ω(k): the chord from the origin has slope v_phase, the
// tangent at k₀ has slope v_group, and bars show the waves’ amplitudes.
// 'xk': the probability density |ψ(x)|² of a packet beside its spread of
// wavenumbers |φ(k)|², for a Gaussian, the ground state of a box or a
// two-sided exponential: squeeze one and the other widens, and Δx·Δk never
// drops below ½ — reaching it only for the Gaussian.
// Units are dimensionless (ħ = m = 1 for the free particle). Physics in
// model/mp-packet.js (tested in test/mp-packet.test.mjs).
//
//   { type: 'mp-packet', params: {
//       view: 'build',         // 'build' or 'xk'
//       disp: 'free',          // build: none | free | water | massive
//       sk: 0.8,               // build: the spread Δk of the wavenumbers
//       N: 31,                 // build: how many plane waves are added (1–61)
//       t: 0,                  // build: the starting time
//       dispersion: null,      // build: the ω(k) panel (default: shown in the Explore step, not in a question)
//       shape: 'gauss',        // xk: gauss | box | exp
//       dx: 1,                 // xk: the position spread Δx
//       play: null,            // build: animate (default: yes in the Explore step, no in a question)
//       controls: null,        // true, false, or a list of: disp sk N shape dx
//       readout: true,
//       hide: [],              // any of: dx, dk, product, speeds — their readouts show “?”
//   } }

import { Plot } from '../plot.js';
import * as W from '../model/mp-packet.js';

export const defaults = { view: 'build', disp: 'free', sk: 0.8, N: 31, t: 0, shape: 'gauss', dx: 1, dispersion: null, play: null, controls: null, readout: true, hide: [] };
const CONTROLS = { build: ['disp', 'sk', 'N'], xk: ['shape', 'dx'] };
const HIDE = ['dx', 'dk', 'product', 'speeds'];
const K0 = 6;                                        // the central wavenumber
const XL = -5, XR = 27;                              // the build view’s window
const TRAVEL = 22;                                   // how far the envelope travels before the clip restarts
const f3 = (x) => (!Number.isFinite(x) ? '\\infty' : Math.abs(x) >= 100 ? x.toFixed(0) : x.toPrecision(3));

export function mount(F, P0) {
  const P = { ...defaults, ...P0 };
  const hide = new Set(P.hide || []);
  const all = CONTROLS[P.view] || [];
  const wanted = P.controls === true || (P.controls === null && !F.compact) ? all : Array.isArray(P.controls) ? P.controls : [];
  const ctl = (key, make) => (wanted.includes(key) ? make() : (F.params[key] = P[key]));
  if (P.view === 'xk') return mountXK(F, P, hide, ctl);

  ctl('disp', () => F.choice({ key: 'disp', label: 'Dispersion relation', options: [['none', 'none: ω = ck'], ['free', 'free particle'], ['water', 'deep water'], ['massive', 'relativistic particle']], value: P.disp, explain: 'How each wave’s frequency depends on its wavenumber. Only ω ∝ k keeps the packet’s shape.' }));
  ctl('sk', () => F.slider({ key: 'sk', label: 'Spread of wavenumbers $\\Delta k$', min: 0.3, max: 2, step: 0.05, value: P.sk, explain: 'A wider spread of wavenumbers makes a shorter packet: $\\Delta x\\,\\Delta k \\ge \\tfrac12$.' }));
  ctl('N', () => F.slider({ key: 'N', label: 'Number of waves $N$', min: 1, max: 61, step: 1, value: P.N, explain: 'One wave fills all space; a few make a repeating train; many make a single packet.' }));

  const { canvas } = F.canvas({ aspect: 'wide', label: P.alt || 'A wave packet: the real part of ψ and its envelope' });
  const plot = new Plot(canvas, { x: [XL, XR], y: [-1.35, 1.35], xlabel: 'x', ylabel: '', yticks: 0, xticks: 8 });
  const dcan = (P.dispersion ?? !F.compact) ? F.canvas({ aspect: 'wide', label: 'The dispersion relation with the phase and group velocities' }) : null;
  const dplot = dcan ? new Plot(dcan.canvas, { x: [0, 12], y: [0, 1], xlabel: 'wavenumber k', ylabel: 'ω' }) : null;

  let T = P.t;
  const state = () => {
    const disp = W.DISPERSIONS[F.params.disp] ? F.params.disp : 'free', D = W.DISPERSIONS[disp];
    const comps = W.components(K0, F.params.sk, Math.round(F.params.N));
    return { disp, D, comps, vp: D.vp(K0), vg: D.vg(K0) };
  };

  function drawPacket() {
    const S = state();
    plot.clear();
    const narrow = (canvas.clientWidth || 600) < 520, fs = narrow ? 10.5 : 12;
    // sample once, draw both curves
    const n = Math.max(500, Math.round(plot.R - plot.L) * 2), xs = [], re = [], ab = [];
    for (let i = 0; i <= n; i++) { const x = XL + ((XR - XL) * i) / n, p = W.psi(x, T, S.comps, S.disp); xs.push(x); re.push(p.re); ab.push(p.abs); }
    plot.path(xs.map((x, i) => [x, ab[i]]), { color: 'gold', width: 1.4, dash: [5, 4] });
    plot.path(xs.map((x, i) => [x, -ab[i]]), { color: 'gold', width: 1.4, dash: [5, 4] });
    plot.path(xs.map((x, i) => [x, re[i]]), { color: 'accent', width: 1.8 });
    // the envelope’s peak rides at the group velocity
    const xg = S.vg * T;
    if (S.comps.length > 1 && xg >= XL && xg <= XR) {
      plot.point(xg, W.psi(xg, T, S.comps, S.disp).abs, { color: 'gold', r: 5.5 });
      plot.text('envelope: group velocity', xg, 1.18, { color: 'gold', align: 'center', size: fs - 1 });
    }
    // a crest of the central wave rides at the phase velocity; follow the one nearest the envelope’s peak
    const lam0 = (2 * Math.PI) / K0, m = Math.round(((S.vg - S.vp) * T) / lam0), xc = S.vp * T + m * lam0;
    if (xc >= XL && xc <= XR) {
      plot.point(xc, W.psi(xc, T, S.comps, S.disp).re, { color: 'violet', r: 5 });
      plot.text('a crest: phase velocity', xc, -1.2, { color: 'violet', align: 'center', size: fs - 1 });
    }
  }

  function drawDispersion() {
    if (!dplot) return;
    const S = state(), D = S.D;
    const top = { none: 12, free: 72, water: 3.6, massive: 13.6 }[S.disp];
    dplot.setView([0, 12], [0, top]);
    dplot.clear();
    // the waves’ amplitudes as bars along the bottom
    const amax = Math.max(...S.comps.map((c) => c.a));
    for (const c of S.comps) dplot.line(c.k, 0, c.k, (0.22 * top * c.a) / amax, { color: 'accent', width: S.comps.length > 40 ? 1.2 : 2, alpha: 0.7 });
    dplot.fn((k) => D.w(k), { color: 'ink2', width: 2.2, domain: [0.01, 12] });
    const w0 = D.w(K0);
    dplot.line(0, 0, 12, (12 * w0) / K0, { color: 'violet', width: 1.6, dash: [6, 4] });
    dplot.line(K0 - 4, w0 - 4 * S.vg, K0 + 4, w0 + 4 * S.vg, { color: 'gold', width: 1.8 });
    dplot.point(K0, w0, { color: 'ink', r: 4 });
    const fs = 11.5;
    dplot.text(`chord: ω/k = v(phase) = ${hide.has('speeds') ? '?' : f3(S.vp).replace('\\infty', '∞')}`, 0.4, 0.93 * top, { color: 'violet', size: fs });
    dplot.text(`tangent: dω/dk = v(group) = ${hide.has('speeds') ? '?' : f3(S.vg).replace('\\infty', '∞')}`, 0.4, 0.82 * top, { color: 'gold', size: fs });
    dplot.text(D.label, 11.8, 0.3 * top, { color: 'ink2', align: 'right', size: fs });
    dplot.text('amplitudes of the waves added', K0, 0.24 * top, { color: 'accent', align: 'center', dy: -6, size: fs - 1 });
  }

  let lastRead = '';
  function readout() {
    if (P.readout === false) return;
    const S = state(), key = [S.disp, F.params.sk, F.params.N, T.toFixed(2)].join();
    if (key === lastRead) return;
    lastRead = key;
    const dk = W.spreadK(S.comps);
    let dx = Infinity;
    if (S.comps.length > 1) {
      const xs = [], ys = [];
      for (let i = 0; i <= 800; i++) { const x = XL + ((XR - XL) * i) / 800; xs.push(x); ys.push(W.psi(x, T, S.comps, S.disp).abs ** 2); }
      dx = W.moments(xs, ys).sd;
    }
    const q = (k, v) => (hide.has(k) ? '?' : v);
    F.readout([
      ['$\\Delta x$', q('dx', f3(dx))],
      ['$\\Delta k$', q('dk', f3(dk))],
      ['$\\Delta x\\,\\Delta k$', q('product', S.comps.length > 1 ? f3(dx * dk) : '\\text{—}')],
      ['$v_\\text{phase}$', q('speeds', f3(S.vp))],
      ['$v_\\text{group}$', q('speeds', f3(S.vg))],
      ['time', T.toFixed(2)],
    ]);
  }

  const reduced = () => document.documentElement.getAttribute('data-motion') === 'reduce' || !!globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  let running = (P.play ?? !F.compact) && !reduced();
  const step = (dt) => {
    const S = state(), rate = TRAVEL / (7 * Math.max(0.05, S.vg));    // the envelope crosses the window in about 7 s whatever its speed
    T += dt * rate;
    if (S.vg * T > TRAVEL) T = 0;
    drawPacket(); readout();
  };
  let loop = F.animate((dt) => { if (running) step(dt); });
  if (!F.compact && P.play !== false) {
    const btn = F.button({ label: running ? 'Pause' : 'Play', onClick: () => {
      running = !running; btn.textContent = running ? 'Pause' : 'Play';
      loop.stop(); loop = F.animate((dt) => { if (running) step(dt); }, { force: running });
    } });
    F.button({ label: 'Restart', onClick: () => { T = 0; drawPacket(); readout(); } });
  }
  F.onChange((k) => { if (k === 'disp') T = 0; drawPacket(); drawDispersion(); readout(); });
  F.draw(() => { drawPacket(); drawDispersion(); readout(); });
  F.caption(P.caption || 'Dimensionless units (for the free particle, ħ = m = 1); the central wavenumber is k₀ = 6. The real part of ψ is drawn solid and the envelope |ψ| dashed. Time is sped up or slowed down so the envelope always crosses the window in about seven seconds. With few waves the “packet” repeats along x: only a continuous spread of wavenumbers makes a single packet.');
  return { get: (k) => F.params[k] };
}

function mountXK(F, P, hide, ctl) {
  ctl('shape', () => F.choice({ key: 'shape', label: 'Shape of the packet', options: Object.entries(W.SHAPES).map(([k, s]) => [k, s.label]), value: P.shape, explain: 'Three ways to confine a particle, each with its own trade-off between Δx and Δk.' }));
  ctl('dx', () => F.slider({ key: 'dx', label: 'Position spread $\\Delta x$', min: 0.3, max: 2, step: 0.01, value: P.dx, explain: 'The standard deviation of where the particle may be found.' }));
  const { canvas } = F.canvas({ aspect: 'wide', label: P.alt || 'The probability density in position' });
  const px = new Plot(canvas, { x: [-6, 6], y: [-0.08, 1.25], xlabel: 'position x', ylabel: '', yticks: 0 });
  const kc = F.canvas({ aspect: 'wide', label: 'The spread of wavenumbers' });
  const pk = new Plot(kc.canvas, { x: [-8, 8], y: [-0.08, 1.25], xlabel: 'wavenumber k (momentum p = ħk)', ylabel: '', yticks: 0 });
  const now = () => {
    const shape = W.SHAPES[F.params.shape] ? F.params.shape : 'gauss', S = W.SHAPES[shape], dx = F.params.dx;
    const a = dx / S.sx(1);                          // the shape’s width parameter that gives this Δx
    return { shape, S, a, dx, dk: S.sk(a) };
  };
  function draw() {
    const st = now();
    // position
    px.clear();
    const peak = st.S.rho(0, st.a);
    px.rect(-st.dx, -0.08, 2 * st.dx, 1.33, { color: 'accent', alpha: 0.08, stroke: false });
    px.area((x) => st.S.rho(x, st.a) / peak, -6, 6, { color: 'accent', alpha: 0.35, samples: 600 });
    px.fn((x) => st.S.rho(x, st.a) / peak, { color: 'accent', width: 2.2, samples: 900 });
    px.fn((x) => st.S.psi(x, st.a), { color: 'ink3', width: 1.2, dash: [4, 4], samples: 900 });
    px.arrow(0, 1.12, st.dx, 1.12, { color: 'accent', width: 1.6, head: 7 });
    px.arrow(0, 1.12, -st.dx, 1.12, { color: 'accent', width: 1.6, head: 7 });
    px.text(hide.has('dx') ? '2Δx = ?' : `2Δx = ${(2 * st.dx).toFixed(2)}`, 0, 1.12, { color: 'accent', align: 'center', dy: -10, size: 12 });
    px.text('|ψ(x)|²: where the particle may be found', 5.9, 0.85, { color: 'accent', align: 'right', size: 11.5 });
    px.text('ψ(x), dashed', 5.9, 0.72, { color: 'ink3', align: 'right', size: 11 });
    // wavenumber
    pk.clear();
    pk.rect(-st.dk, -0.08, 2 * st.dk, 1.33, { color: 'gold', alpha: 0.08, stroke: false });
    pk.area((k) => st.S.phi2(k, st.a), -8, 8, { color: 'gold', alpha: 0.35, samples: 800 });
    pk.fn((k) => st.S.phi2(k, st.a), { color: 'gold', width: 2.2, samples: 1200 });
    const shown = Math.min(st.dk, 7.9);
    pk.arrow(0, 1.12, shown, 1.12, { color: 'gold', width: 1.6, head: 7 });
    pk.arrow(0, 1.12, -shown, 1.12, { color: 'gold', width: 1.6, head: 7 });
    pk.text(hide.has('dk') ? '2Δk = ?' : `2Δk = ${(2 * st.dk).toFixed(2)}`, 0, 1.12, { color: 'gold', align: 'center', dy: -10, size: 12 });
    pk.text('|φ(k)|²: the spread of wavenumbers', 7.9, 0.85, { color: 'gold', align: 'right', size: 11.5 });
    if (P.readout !== false) {
      const prod = st.dx * st.dk, q = (k, v) => (hide.has(k) ? '?' : v);
      F.readout([
        ['$\\Delta x$', q('dx', st.dx.toFixed(3))],
        ['$\\Delta k$', q('dk', st.dk.toFixed(3))],
        ['$\\Delta x\\,\\Delta k$', q('product', `${prod.toFixed(3)}${Math.abs(prod - 0.5) < 1e-9 ? '\\text{ — the minimum, }\\tfrac12' : '\\text{ (above }\\tfrac12\\text{)}'}`)],
        ['so $\\Delta x\\,\\Delta p$', q('product', `${prod.toFixed(3)}\\,\\hbar`)],
      ]);
    }
  }
  F.onChange(draw);
  F.draw(draw);
  F.caption(P.caption || 'Each curve is scaled to the same height; the shaded bands span ±Δx and ±Δk (standard deviations). Dimensionless units: Δx·Δk is a pure number, and with p = ħk it is Δx·Δp in units of ħ.');
  return { get: (k) => F.params[k] };
}

export function validate(P) {
  const p = [];
  if (!['build', 'xk'].includes(P.view)) p.push('mp-packet: view is build or xk');
  if (!W.DISPERSIONS[P.disp]) p.push(`mp-packet: unknown dispersion “${P.disp}”`);
  if (!W.SHAPES[P.shape]) p.push(`mp-packet: unknown shape “${P.shape}”`);
  if (!(P.sk >= 0.3 && P.sk <= 2)) p.push('mp-packet: sk must lie in 0.3–2');
  if (!(P.N >= 1 && P.N <= 61)) p.push('mp-packet: N must lie in 1–61');
  if (!(P.dx >= 0.3 && P.dx <= 2)) p.push('mp-packet: dx must lie in 0.3–2');
  if (!(P.t >= 0)) p.push('mp-packet: t must be ≥ 0');
  for (const h of P.hide || []) if (!HIDE.includes(h)) p.push(`mp-packet: unknown hide “${h}”`);
  const all = [...CONTROLS.build, ...CONTROLS.xk];
  if (Array.isArray(P.controls)) for (const c of P.controls) if (!all.includes(c)) p.push(`mp-packet: unknown control “${c}”`);
  return p;
}
