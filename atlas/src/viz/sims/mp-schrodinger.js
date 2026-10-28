// The one-dimensional Schrödinger equation, two ways.
//
// 'bound': a well — infinite, finite, harmonic or double — and its stationary
// states. Above, the energy diagram: the potential V(x) with every bound
// level drawn where the particle may classically be, the chosen one in gold.
// Below, on its own axes, that state's ψ(x) or |ψ|²: drawing the wave apart
// from the energy keeps the decaying tail from reading as a loss of energy
// (a documented misconception). Shaded: where the level is classically
// forbidden. Options: a probability window with P(a < x < b), the classical
// density at the same energy, the infinite well's levels for comparison, and
// a two-state superposition that sloshes in time.
// 'scatter': a plane wave from the left meets a step, a rectangular barrier
// or two barriers: the energy diagram, |ψ|² (incident and reflected waves
// interfering on the left, the transmitted wave on the right), and the
// transmission probability against energy on a log or linear scale.
// Units: nm, eV, fs; mass in electron masses. Physics in
// model/mp-schrodinger.js (tested in test/mp-schrodinger.test.mjs).
//
//   { type: 'mp-schrodinger', params: {
//       mode: 'bound',        // 'bound' or 'scatter'
//       well: 'infinite',     // bound: infinite | finite | harmonic | double
//       L: 1,                 // bound: the well's width, nm (0.1–5; infinite, finite, double)
//       V0: 5,                // bound: the finite well's depth or the double well's central barrier, eV (0.05–50)
//       w: 0.15,              // bound, double: the central barrier's width, nm (0.02–1)
//       hw: 0.5,              // bound, harmonic: the level spacing ħω, eV (0.02–2)
//       mass: 1,              // the particle's mass in electron masses (0.02–10; an effective mass in a crystal)
//       n: 1,                 // bound: the chosen state (1, 2 … in a well; 0, 1 … for the oscillator)
//       show: 'prob',         // 'psi' (ψ, or Re ψ when scattering), 'prob' (|ψ|²) or 'both'
//       levels: true,         // bound: every bound level, not only the chosen one
//       top: null,            // bound: how many levels to draw (default: enough to show the chosen one and a few more)
//       forbidden: true,      // shade where the chosen level is classically forbidden
//       classical: false,     // bound: the classical probability density at the same energy (infinite, finite, harmonic)
//       compare: false,       // bound, finite: the infinite well's levels, dashed
//       window: null,         // bound: [a, b] in nm — shade the probability between a and b and give its value
//       super: null,          // bound: [n₁, n₂] — (ψ₁ + ψ₂)/√2 evolving in time, with ⟨x⟩
//       barrier: 'rect',      // scatter: 'rect', 'step' or 'double'
//       E: 0.5,               // scatter: the particle's energy, eV (0.005–50)
//       Vb: 1,                // scatter: the barrier's (or step's) height, eV (0.01–50)
//       d: 1,                 // scatter: each barrier's thickness, nm (0.02–5)
//       gap: 1,               // scatter, double: the gap between the barriers, nm (0.1–10)
//       tlog: true,           // scatter: transmission on a log scale (10⁻¹⁰ … 1)
//       panels: null,         // any of 'energy', 'wave', 'T' (default: energy and wave; T too in the Explore step)
//       play: null,           // super: animate (default: yes in the Explore step, no in a question)
//       t: 0,                 // super: the starting time, fs
//       controls: null,       // true, false, or a list of: mode well L V0 w hw mass n show window compare classical barrier E Vb d gap tlog
//       readout: true,
//       hide: [],             // any of: energy (level energies), labels (level labels), prob (P in the window),
//                             //         moments (⟨x⟩, Δx), count (how many bound states), T (transmission), axis (ψ's axis numbers)
//   } }

import { Plot, themeColors } from '../plot.js';
import * as S from '../model/mp-schrodinger.js';

export const defaults = {
  mode: 'bound', well: 'infinite', L: 1, V0: 5, w: 0.15, hw: 0.5, mass: 1, n: 1, show: 'prob', levels: true, top: null, forbidden: true,
  classical: false, compare: false, window: null, super: null, barrier: 'rect', E: 0.5, Vb: 1, d: 1, gap: 1, tlog: true,
  panels: null, play: null, t: 0, controls: null, readout: true, hide: [],
};
const WELLS = ['infinite', 'finite', 'harmonic', 'double'];
const BARRIERS = ['rect', 'step', 'double'];
const CONTROLS = ['mode', 'well', 'L', 'V0', 'w', 'hw', 'mass', 'n', 'show', 'window', 'compare', 'classical', 'barrier', 'E', 'Vb', 'd', 'gap', 'tlog'];
const BOUND_KEYS = ['well', 'L', 'V0', 'w', 'hw', 'n', 'window', 'compare', 'classical'];
const SCATTER_KEYS = ['barrier', 'E', 'Vb', 'd', 'gap', 'tlog'];
const HIDE = ['energy', 'labels', 'prob', 'moments', 'count', 'T', 'axis'];
const PANELS = ['energy', 'wave', 'T'];
const NMAX = 12;

const f3 = (v) => (!Number.isFinite(v) ? '—' : Math.abs(v) >= 100 ? v.toFixed(0) : Math.abs(v) >= 0.001 ? v.toPrecision(3) : v.toExponential(2));
/** A number as TeX for the readout: 3 figures, ×10ⁿ when small. */
function texNum(v) {
  if (!Number.isFinite(v)) return '\\text{—}';
  if (v === 0) return '0';
  const a = Math.abs(v);
  if (a >= 0.001 && a < 1e4) return a >= 100 ? v.toFixed(0) : v.toPrecision(3);
  const e = Math.floor(Math.log10(a)), m = v / 10 ** e;
  return `${m.toFixed(2)}\\times10^{${e}}`;
}

/** The chosen well's levels and wave functions. */
function boundModel(p) {
  const m = p.mass, kind = WELLS.includes(p.well) ? p.well : 'infinite';
  const ground = kind === 'harmonic' ? 0 : 1;
  if (kind === 'infinite') {
    const L = p.L, top = Math.min(NMAX, p.topN);
    return {
      kind, ground, L, V: (x) => (x > 0 && x < L ? 0 : Infinity), xr: [-0.3 * L, 1.3 * L],
      levels: Array.from({ length: top }, (_, i) => ({ n: i + 1, E: S.boxEnergy(i + 1, L, m) })),
      psi: (n) => (x) => S.boxPsi(n, x, L), edges: [0, L], allowed: () => [[0, L]],
    };
  }
  if (kind === 'finite') {
    const L = p.L, V0 = p.V0, lev = S.finiteLevels(V0, L, m);
    return {
      kind, ground, L, V0, V: (x) => (x > 0 && x < L ? 0 : V0), xr: [-0.6 * L - 0.25, 1.6 * L + 0.25],
      levels: lev.map((l) => ({ n: l.n, E: l.E, lev: l })), psi: (n) => { const l = lev[n - 1]; return (x) => S.finitePsi(l, x, L); },
      edges: [0, L], allowed: () => [[0, L]],
    };
  }
  if (kind === 'harmonic') {
    const hw = p.hw, b = S.oscLength(hw, m), top = Math.min(NMAX, p.topN);
    const A = S.oscTurning(top - 1, b) * 1.25;
    return {
      kind, ground, b, hw, V: (x) => 0.5 * hw * (x / b) ** 2, xr: [-A, A],
      levels: Array.from({ length: top }, (_, i) => ({ n: i, E: S.oscEnergy(i, hw) })),
      psi: (n) => (x) => S.oscPsi(n, x, b), edges: [], allowed: (E) => { const a = b * Math.sqrt((2 * E) / hw); return [[-a, a]]; },
    };
  }
  // double: hard walls at 0 and L, a central barrier V0 high and w wide
  const L = p.L, w = Math.min(p.w, 0.8 * L), V0 = p.V0, V = S.doubleWellV(L, w, V0);
  const sol = S.solveFD(V, 0, L, { N: 900, m, count: Math.min(NMAX, p.topN) });
  const interp = (arr) => (x) => {
    if (x <= 0 || x >= L) return 0;
    const u = x / sol.h - 1, i = Math.floor(u), f = u - i;
    const a = i < 0 ? 0 : arr[i], c = i + 1 >= arr.length ? 0 : arr[i + 1];
    return a + f * (c - a);
  };
  const c0 = L / 2 - w / 2, c1 = L / 2 + w / 2;
  return {
    kind, ground, L, V0, w, V: (x) => (x > 0 && x < L ? V(x) : Infinity), xr: [-0.15 * L, 1.15 * L],
    levels: sol.E.map((E, i) => ({ n: i + 1, E })), psi: (n) => interp(sol.psi[n - 1]), edges: [0, c0, c1, L],
    allowed: (E) => (E > V0 ? [[0, L]] : [[0, c0], [c1, L]]),
  };
}

function scatterModel(p) {
  const kind = BARRIERS.includes(p.barrier) ? p.barrier : 'rect', d = p.d, Vb = p.Vb, m = p.mass;
  let pieces, xs, xr;
  if (kind === 'step') { pieces = [0, Vb]; xs = [0]; xr = [-2.4, 2.4]; }
  else if (kind === 'rect') { pieces = [0, Vb, 0]; xs = [0, d]; const pad = Math.max(1.2, 1.2 * d); xr = [-pad, d + pad]; }
  else { pieces = [0, Vb, 0, Vb, 0]; xs = [0, d, d + p.gap, 2 * d + p.gap]; const pad = Math.max(1, 0.6 * (2 * d + p.gap)); xr = [-pad, 2 * d + p.gap + pad]; }
  const V = (x) => { let j = 0; while (j < xs.length && x >= xs[j]) j++; return pieces[j]; };
  const solve = (E) => S.scatter(E, pieces, xs, m);
  return { kind, pieces, xs, xr, V, solve, Vb, d };
}

export function mount(F, P0) {
  const P = { ...defaults, ...P0 };
  const hide = new Set(P.hide || []);
  const DEFAULT_CTL = P.mode === 'scatter' ? ['barrier', 'E', 'Vb', 'd', 'gap', 'mass', 'show', 'tlog'] : ['well', 'L', 'V0', 'w', 'hw', 'mass', 'n', 'show', 'compare', 'classical', ...(P.window ? ['window'] : [])];
  const wanted = P.controls === true ? CONTROLS : P.controls === null && !F.compact ? DEFAULT_CTL : Array.isArray(P.controls) ? P.controls : [];
  const nodes = {};
  const ctl = (key, make) => { if (wanted.includes(key)) nodes[key] = make().node; else F.params[key] = P[key]; };
  const lg = (v) => (v < 1 ? v.toPrecision(2) : v < 10 ? v.toFixed(2) : v.toFixed(1));

  ctl('mode', () => F.choice({ key: 'mode', label: 'Situation', options: [['bound', 'a well: bound states'], ['scatter', 'a barrier: scattering']], value: P.mode, explain: 'Trapped between walls the energy comes in levels; meeting a barrier, any energy is allowed and part of the wave gets through.' }));
  ctl('well', () => F.choice({ key: 'well', label: 'Well', options: [['infinite', 'infinite'], ['finite', 'finite'], ['harmonic', 'harmonic'], ['double', 'double']], value: P.well, explain: 'The potential energy V(x) the particle moves in.' }));
  ctl('L', () => F.slider({ key: 'L', label: 'Width $L$', min: 0.1, max: 5, step: 0.01, value: P.L, unit: '\\mathrm{nm}', explain: 'The width of the well. Narrower walls squeeze the wave, raising every level.' }));
  ctl('V0', () => F.slider({ key: 'V0', label: 'Height $V_0$', min: 0.05, max: 50, value: P.V0, logScale: true, unit: '\\mathrm{eV}', fmt: lg, explain: 'The finite well’s walls, or the double well’s central barrier, in electronvolts.' }));
  ctl('w', () => F.slider({ key: 'w', label: 'Barrier width $w$', min: 0.02, max: 1, step: 0.01, value: P.w, unit: '\\mathrm{nm}', explain: 'The thickness of the wall between the two halves of the double well.' }));
  ctl('hw', () => F.slider({ key: 'hw', label: 'Level spacing $\\hbar\\omega$', min: 0.02, max: 2, step: 0.01, value: P.hw, unit: '\\mathrm{eV}', explain: 'A stiffer spring (larger $\\omega = \\sqrt{k/m}$) spaces the levels further apart.' }));
  ctl('mass', () => F.slider({ key: 'mass', label: 'Mass $m/m_e$', min: 0.02, max: 10, value: P.mass, logScale: true, fmt: lg, explain: 'In electron masses. Inside a crystal an electron moves as if lighter or heavier: 0.067 in GaAs.' }));
  ctl('n', () => F.slider({ key: 'n', label: 'State $n$', min: 0, max: NMAX - 1, step: 1, value: P.n, explain: 'Which stationary state to draw: $n = 1, 2, \\ldots$ in a well, $n = 0, 1, \\ldots$ for the oscillator.' }));
  ctl('show', () => F.choice({ key: 'show', label: 'Draw', options: [['prob', '|ψ|²'], ['psi', 'ψ'], ['both', 'both']], value: P.show, explain: '$\\psi$ is the amplitude; $|\\psi|^2$ is the probability density, what a detector samples.' }));
  if (wanted.includes('window')) {
    const [a0, b0] = P.window || [0.25 * P.L, 0.75 * P.L];
    nodes.a = F.slider({ key: 'a', label: 'Window from $a$', min: -2, max: 6, step: 0.01, value: a0, unit: '\\mathrm{nm}', explain: 'The left end of the region whose probability is shaded.' }).node;
    nodes.b = F.slider({ key: 'b', label: 'to $b$', min: -2, max: 6, step: 0.01, value: b0, unit: '\\mathrm{nm}', explain: 'The right end: $P = \\int_a^b |\\psi|^2\\,dx$.' }).node;
  } else if (P.window) { F.params.a = P.window[0]; F.params.b = P.window[1]; }
  ctl('compare', () => F.toggle({ key: 'compare', label: 'Compare with the infinite well', value: P.compare, explain: 'Dashed: the levels if the walls were infinitely high.' }));
  ctl('classical', () => F.toggle({ key: 'classical', label: 'Classical probability', value: P.classical, explain: 'How a classical particle with the same energy would share its time between places.' }));
  ctl('barrier', () => F.choice({ key: 'barrier', label: 'Obstacle', options: [['rect', 'barrier'], ['step', 'step'], ['double', 'two barriers']], value: P.barrier, explain: 'The potential energy the incoming particle meets.' }));
  ctl('E', () => F.slider({ key: 'E', label: 'Energy $E$', min: 0.005, max: 50, value: P.E, logScale: true, unit: '\\mathrm{eV}', fmt: lg, explain: 'The particle’s total energy — the same on both sides of the barrier.' }));
  ctl('Vb', () => F.slider({ key: 'Vb', label: 'Barrier height $V_0$', min: 0.01, max: 50, value: P.Vb, logScale: true, unit: '\\mathrm{eV}', fmt: lg, explain: 'The barrier’s potential energy.' }));
  ctl('d', () => F.slider({ key: 'd', label: 'Thickness $d$', min: 0.02, max: 5, value: P.d, logScale: true, unit: '\\mathrm{nm}', fmt: lg, explain: 'Each barrier’s thickness. Below the top, transmission falls roughly as $e^{-2\\kappa d}$.' }));
  ctl('gap', () => F.slider({ key: 'gap', label: 'Gap between barriers', min: 0.1, max: 10, value: P.gap, logScale: true, unit: '\\mathrm{nm}', fmt: lg, explain: 'Two barriers make a resonant cavity: at some energies the wave gets through completely.' }));
  ctl('tlog', () => F.toggle({ key: 'tlog', label: 'Transmission on a log scale', value: P.tlog, explain: 'Tunnelling probabilities span many powers of ten.' }));

  const panelsFor = (mode) => (Array.isArray(P.panels) ? P.panels : mode === 'scatter' && !F.compact ? ['energy', 'wave', 'T'] : ['energy', 'wave']);
  const cE = F.canvas({ aspect: 'wide', label: P.alt || 'Energy diagram: the potential energy and the energy levels' });
  const cW = F.canvas({ aspect: 'wide', label: 'The wave function or probability density' });
  const cT = F.canvas({ aspect: 'wide', label: 'Transmission probability against energy' });
  const pE = new Plot(cE.canvas, { x: [0, 1], y: [0, 1], xlabel: 'x (nm)', ylabel: 'energy (eV)' });
  const pW = new Plot(cW.canvas, { x: [0, 1], y: [0, 1], xlabel: 'x (nm)', ylabel: '' });
  const pT = new Plot(cT.canvas, { x: [0, 3], y: [0, 1], xlabel: 'energy E / V₀', ylabel: 'transmission T' });

  let T = P.t || 0;
  let cache = { key: '', M: null };
  const params = () => {
    const p = { ...P, ...F.params };
    p.mode = p.mode === 'scatter' ? 'scatter' : 'bound';
    const sup = Array.isArray(P.super) ? P.super : null;
    const nSel = Math.round(p.n);
    p.topN = Math.max(p.top || 0, (sup ? Math.max(...sup) : nSel) + (p.well === 'harmonic' ? 2 : 1), p.well === 'harmonic' ? 6 : 4);
    p.sup = sup;
    return p;
  };
  const model = (p) => {
    const key = [p.mode, p.well, p.L, p.V0, p.w, p.hw, p.mass, p.topN, p.barrier, p.Vb, p.d, p.gap].join();
    if (cache.key !== key) cache = { key, M: p.mode === 'bound' ? boundModel(p) : scatterModel(p) };
    return cache.M;
  };
  const chosen = (M, p) => {
    const lo = M.ground, hi = M.levels.length - 1 + M.ground;
    return Math.max(lo, Math.min(hi, Math.round(p.n)));
  };

  function layout(mode) {
    const want = panelsFor(mode), narrow = (cE.box.clientWidth || 600) < 520;
    const ratio = narrow ? '2 / 1' : '2.7 / 1';
    for (const [c, k] of [[cE, 'energy'], [cW, 'wave'], [cT, 'T']]) {
      c.box.hidden = !want.includes(k);
      const r = k === 'T' ? (narrow ? '2.2 / 1' : '3.2 / 1') : ratio;
      if (c.box.style.aspectRatio !== r) c.box.style.aspectRatio = r;
    }
    for (const [k, node] of Object.entries(nodes)) {
      if (k === 'mode') continue;
      const isB = BOUND_KEYS.includes(k) || k === 'a' || k === 'b', isS = SCATTER_KEYS.includes(k);
      let show = mode === 'bound' ? !isS : !isB;
      if (mode === 'bound') {
        const wl = F.params.well;
        if (k === 'L') show = wl !== 'harmonic';
        if (k === 'V0') show = wl === 'finite' || wl === 'double';
        if (k === 'w') show = wl === 'double';
        if (k === 'hw') show = wl === 'harmonic';
        if (k === 'compare') show = wl === 'finite';
        if (k === 'classical') show = wl !== 'double';
      } else if (k === 'gap') show = F.params.barrier === 'double';
      node.hidden = !show;
    }
    return { want, narrow };
  }

  // ---------------- bound states ----------------
  function drawBound(p, want, narrow) {
    const M = model(p), C = themeColors();
    const n = chosen(M, p), lev = M.levels, fs = narrow ? 10 : 11.5;
    const sup = p.sup && p.sup.every((k) => k >= M.ground && k < lev.length + M.ground) ? p.sup : null;
    const sel = sup || [n];
    const Esel = (k) => lev[k - M.ground].E;
    const Emax = M.kind === 'finite' ? M.V0 * 1.22 : M.kind === 'double' ? Math.max(lev[lev.length - 1].E, M.V0) * 1.14 : lev[lev.length - 1].E * 1.12;
    const [x0, x1] = M.xr;
    // energy diagram
    if (want.includes('energy')) {
      pE.setView([x0, x1], [0, Emax]);
      pE.clear();
      const g = pE.ctx;
      // the potential: walls shaded
      if (M.kind === 'infinite' || M.kind === 'double') {
        pE.rect(x0, 0, -x0, Emax, { color: 'ink3', alpha: 0.16, stroke: false });
        pE.rect(M.L, 0, x1 - M.L, Emax, { color: 'ink3', alpha: 0.16, stroke: false });
      }
      const xsV = [], N = 900;
      for (let i = 0; i <= N; i++) { const x = x0 + ((x1 - x0) * i) / N; xsV.push([x, Math.min(Emax * 1.5, M.V(x))]); }
      if (M.kind === 'finite') { pE.rect(x0, 0, -x0, M.V0, { color: 'ink3', alpha: 0.12, stroke: false }); pE.rect(M.L, 0, x1 - M.L, M.V0, { color: 'ink3', alpha: 0.12, stroke: false }); }
      if (M.kind === 'double') pE.rect(M.edges[1], 0, M.edges[2] - M.edges[1], M.V0, { color: 'ink3', alpha: 0.16, stroke: false });
      g.save(); g.beginPath(); g.rect(pE.L, pE.T, pE.R - pE.L, pE.B - pE.T); g.clip();
      pE.path(xsV, { color: 'ink2', width: 2.4 });
      g.restore();
      // the infinite well for comparison
      if (M.kind === 'finite' && p.compare) {
        for (let k = 1; k <= 12; k++) { const E = S.boxEnergy(k, M.L, p.mass); if (E > Emax) break; pE.line(0, E, M.L, E, { color: 'ink3', width: 1.2, dash: [5, 4] }); if (k === 1) pE.text('infinite well', M.L, E, { color: 'ink3', size: fs - 1, dx: 6, dy: 0 }); }
      }
      for (const l of lev) {
        const isSel = sel.includes(l.n);
        if (!isSel && !p.levels) continue;
        if (l.E > Emax) continue;
        const spans = M.allowed(l.E);
        for (const [a, b] of spans) pE.line(Math.max(a, x0), l.E, Math.min(b, x1), l.E, { color: isSel ? 'gold' : 'accent', width: isSel ? 2.8 : 1.4, alpha: isSel ? 1 : 0.75 });
        if (!hide.has('labels') && (isSel || lev.length <= 8)) {
          const xr = spans[spans.length - 1][1];
          const txt = hide.has('energy') ? `n = ${l.n}` : `n = ${l.n}: ${f3(l.E)} eV`;
          pE.text(txt, Math.min(xr, x1), l.E, { color: isSel ? 'gold' : 'ink2', size: isSel ? fs : fs - 1, dx: 7, dy: 0, weight: isSel ? 650 : 500 });
        }
      }
      if (M.kind === 'finite') pE.text(`V₀ = ${f3(M.V0)} eV`, x0 + 0.02 * (x1 - x0), M.V0, { color: 'ink2', size: fs - 1, dy: -10 });
      if (M.kind === 'double' && M.V0 < Emax) pE.text(`barrier ${f3(M.V0)} eV`, M.L / 2, M.V0, { color: 'ink2', size: fs - 1, align: 'center', dy: -10 });
      if (M.kind === 'harmonic') pE.text('V = ½mω²x²', x1 - 0.02 * (x1 - x0), Emax * 0.94, { color: 'ink2', size: fs - 1, align: 'right' });
    }
    // the wave
    if (want.includes('wave')) {
      const N = 1200, xs = [], ys = [], ps = [];
      const fA = M.psi(sel[0]), fB = sup ? M.psi(sel[1]) : null;
      for (let i = 0; i <= N; i++) {
        const x = x0 + ((x1 - x0) * i) / N, a = fA(x);
        xs.push(x);
        if (sup) { const b = fB(x); ys.push(NaN); ps.push(S.superDensity(a, b, Esel(sel[0]), Esel(sel[1]), T)); }
        else { ys.push(a); ps.push(a * a); }
      }
      const showPsi = !sup && (p.show === 'psi' || p.show === 'both'), showProb = sup || p.show !== 'psi';
      let peakP = 0, peakY = 0;
      if (sup) {
        // fix the scale over a whole period: the largest density the two states can make
        for (let i = 0; i <= N; i++) { const a = fA(xs[i]), b = fB(xs[i]); peakP = Math.max(peakP, 0.5 * (Math.abs(a) + Math.abs(b)) ** 2); }
      } else for (let i = 0; i <= N; i++) { peakP = Math.max(peakP, ps[i]); peakY = Math.max(peakY, Math.abs(ys[i])); }
      const both = showPsi && showProb;
      const yr = showPsi ? [-1.18 * peakY, 1.18 * peakY] : [0, 1.16 * peakP];
      pW.o.yticks = both || hide.has('axis') ? 0 : undefined;
      pW.o.ylabel = both ? '' : showPsi ? 'ψ (nm⁻¹ᐟ²)' : '|ψ|² (nm⁻¹)';
      pW.setView([x0, x1], yr);
      pW.clear();
      // forbidden regions for the chosen level
      if (p.forbidden && !sup && M.kind !== 'infinite') {
        const E = Esel(n), spans = M.allowed(E);
        const gaps = [];
        let cur = x0;
        for (const [a, b] of spans) { if (a > cur) gaps.push([cur, Math.min(a, x1)]); cur = Math.max(cur, b); }
        if (cur < x1) gaps.push([cur, x1]);
        for (const [a, b] of gaps) if (b > a) pW.rect(a, yr[0], b - a, yr[1] - yr[0], { color: 'ink3', alpha: 0.1, stroke: false });
        const big = gaps.find(([a, b]) => b - a > 0.16 * (x1 - x0));
        if (big) pW.text('classically forbidden', (big[0] + big[1]) / 2, yr[1] - 0.07 * (yr[1] - yr[0]), { color: 'ink3', size: fs - 1.5, align: 'center' });
      }
      if (M.kind === 'infinite' || M.kind === 'double') {
        pW.rect(x0, yr[0], -x0, yr[1] - yr[0], { color: 'ink3', alpha: 0.16, stroke: false });
        pW.rect(M.L, yr[0], x1 - M.L, yr[1] - yr[0], { color: 'ink3', alpha: 0.16, stroke: false });
      }
      for (const e of M.edges) pW.line(e, yr[0], e, yr[1], { color: 'ink4', width: 1, dash: [4, 4] });
      // the probability window
      let Pwin = null;
      const wa = F.params.a, wb = F.params.b;
      if (Number.isFinite(wa) && Number.isFinite(wb) && wb > wa && showProb) {
        const g = [], gy = [];
        for (let i = 0; i <= 600; i++) { const x = wa + ((wb - wa) * i) / 600; g.push(x); const a = fA(x); gy.push(sup ? S.superDensity(a, fB(x), Esel(sel[0]), Esel(sel[1]), T) : a * a); }
        Pwin = S.trapz(g, gy);
        const scale = showPsi && both ? (peakY * 1.0) / peakP : 1;
        pW.area((x) => { const a = fA(x); return (sup ? S.superDensity(a, fB(x), Esel(sel[0]), Esel(sel[1]), T) : a * a) * scale; }, wa, wb, { color: 'gold', alpha: 0.35, samples: 300 });
        pW.line(wa, yr[0], wa, yr[1], { color: 'gold', width: 1.4 });
        pW.line(wb, yr[0], wb, yr[1], { color: 'gold', width: 1.4 });
      }
      if (showProb) {
        const scale = both ? peakY / peakP : 1;
        pW.area((x) => { const a = fA(x); return (sup ? S.superDensity(a, fB(x), Esel(sel[0]), Esel(sel[1]), T) : a * a) * scale; }, x0, x1, { color: 'accent', alpha: 0.18, samples: 600 });
        pW.path(xs.map((x, i) => [x, ps[i] * scale]), { color: 'accent', width: 2.2 });
      }
      if (showPsi) {
        pW.line(x0, 0, x1, 0, { color: 'ink4', width: 1 });
        pW.path(xs.map((x, i) => [x, ys[i]]), { color: 'violet', width: both ? 1.6 : 2.2 });
      }
      // classical density at the same energy
      if (p.classical && !sup && showProb && !both && M.kind !== 'double') {
        const E = Esel(n);
        if (M.kind === 'harmonic') { const A = M.b * Math.sqrt((2 * E) / M.hw); pW.fn((x) => S.oscClassical(x, A), { color: 'gold', width: 1.8, dash: [6, 4], domain: [-A * 0.9995, A * 0.9995], samples: 900 }); }
        else pW.line(0, 1 / M.L, M.L, 1 / M.L, { color: 'gold', width: 1.8, dash: [6, 4] });
        pW.text('classical', M.kind === 'harmonic' ? 0 : M.L / 2, M.kind === 'harmonic' ? Math.min(yr[1] * 0.9, 1.6 / (Math.PI * M.b * Math.sqrt((2 * E) / M.hw))) : 1 / M.L, { color: 'gold', size: fs - 1, align: 'center', dy: -10 });
      }
      // ⟨x⟩ of the superposition
      let mom = null;
      const wide = [];
      const gx0 = M.kind === 'harmonic' ? x0 * 1.5 : x0 - (M.kind === 'finite' ? 1.5 : 0), gx1 = M.kind === 'harmonic' ? x1 * 1.5 : x1 + (M.kind === 'finite' ? 1.5 : 0);
      for (let i = 0; i <= 1600; i++) wide.push(gx0 + ((gx1 - gx0) * i) / 1600);
      const rho = wide.map((x) => { const a = fA(x); return sup ? S.superDensity(a, fB(x), Esel(sel[0]), Esel(sel[1]), T) : a * a; });
      mom = S.moments(wide, rho);
      if (sup) {
        pW.line(mom.mean, yr[0], mom.mean, yr[1], { color: 'violet', width: 1.8, dash: [6, 3] });
        pW.text('⟨x⟩', mom.mean, yr[1] - 0.08 * (yr[1] - yr[0]), { color: 'violet', size: fs, dx: 5 });
      }
      if (both) {
        pW.text('ψ', x1 - 0.02 * (x1 - x0), yr[0] + 0.12 * (yr[1] - yr[0]), { color: 'violet', size: fs, align: 'right' });
        pW.text('|ψ|² (own scale)', x1 - 0.02 * (x1 - x0), yr[1] - 0.12 * (yr[1] - yr[0]), { color: 'accent', size: fs - 0.5, align: 'right' });
      }
      return { M, n, sel, sup, Pwin, mom };
    }
    return { M, n, sel, sup, Pwin: null, mom: null };
  }

  // ---------------- scattering ----------------
  function drawScatter(p, want, narrow) {
    const M = model(p), fs = narrow ? 10 : 11.5, E = p.E, sol = M.solve(E);
    const [x0, x1] = M.xr;
    const Emax = Math.max(M.Vb, E) * 1.3;
    if (want.includes('energy')) {
      pE.setView([x0, x1], [0, Emax]);
      pE.clear();
      for (let j = 0; j < M.pieces.length; j++) {
        if (!(M.pieces[j] > 0)) continue;
        const a = j === 0 ? x0 : M.xs[j - 1], b = j < M.xs.length ? M.xs[j] : x1;
        pE.rect(a, 0, b - a, M.pieces[j], { color: 'ink3', alpha: 0.16, stroke: false });
      }
      const pts = [];
      for (let i = 0; i <= 1000; i++) { const x = x0 + ((x1 - x0) * i) / 1000; pts.push([x, M.V(x)]); }
      pE.path(pts, { color: 'ink2', width: 2.4 });
      pE.line(x0, E, x1, E, { color: 'gold', width: 2.4 });
      pE.text(`E = ${f3(E)} eV, the same everywhere`, x0 + 0.02 * (x1 - x0), E, { color: 'gold', size: fs, dy: E > 0.8 * Emax ? 12 : -11 });
      pE.text(`V₀ = ${f3(M.Vb)} eV`, M.kind === 'step' ? x1 - 0.02 * (x1 - x0) : M.xs[0], M.Vb, { color: 'ink2', size: fs - 1, align: M.kind === 'step' ? 'right' : 'left', dy: Math.abs(M.Vb - E) < 0.12 * Emax ? (M.Vb > E ? -11 : 12) : -11 });
      pE.arrow(x0 + 0.06 * (x1 - x0), 0.4 * Math.min(E, Emax), x0 + 0.2 * (x1 - x0), 0.4 * Math.min(E, Emax), { color: 'accent', width: 1.8, head: 8 });
      pE.text('incoming', x0 + 0.13 * (x1 - x0), 0.4 * Math.min(E, Emax), { color: 'accent', size: fs - 1, align: 'center', dy: 11 });
    }
    if (want.includes('wave')) {
      const N = 1400, xs = [], pr = [], re = [];
      for (let i = 0; i <= N; i++) { const x = x0 + ((x1 - x0) * i) / N, v = S.scatterPsi(sol, x); xs.push(x); pr.push(v.abs2); re.push(v.re); }
      const showPsi = p.show === 'psi' || p.show === 'both', showProb = p.show !== 'psi';
      const top = Math.max(...pr, 1);
      const yr = showPsi && !showProb ? [-1.2 * Math.sqrt(top), 1.2 * Math.sqrt(top)] : showPsi ? [-1.2 * Math.sqrt(top), 1.12 * top] : [0, 1.12 * top];
      pW.o.yticks = hide.has('axis') ? 0 : undefined;
      pW.o.ylabel = showProb ? '|ψ|² (incident wave = 1)' : 'Re ψ';
      pW.setView([x0, x1], yr);
      pW.clear();
      for (let j = 0; j < M.pieces.length; j++) {
        if (!(M.pieces[j] > E) || !p.forbidden) continue;
        const a = j === 0 ? x0 : M.xs[j - 1], b = j < M.xs.length ? M.xs[j] : x1;
        pW.rect(a, yr[0], b - a, yr[1] - yr[0], { color: 'ink3', alpha: 0.1, stroke: false });
      }
      for (const e of M.xs) pW.line(e, yr[0], e, yr[1], { color: 'ink4', width: 1, dash: [4, 4] });
      if (showPsi) pW.path(xs.map((x, i) => [x, re[i]]), { color: 'violet', width: 1.5 });
      if (showProb) {
        pW.area((x) => S.scatterPsi(sol, x).abs2, x0, x1, { color: 'accent', alpha: 0.18, samples: 700 });
        pW.path(xs.map((x, i) => [x, pr[i]]), { color: 'accent', width: 2.2 });
        if (!hide.has('T') && sol.T > 0) pW.text(`transmitted: |ψ|² = T = ${f3(sol.T)}`, x1 - 0.02 * (x1 - x0), Math.min(yr[1] * 0.92, Math.max(sol.T, 0.08 * yr[1]) + 0.07 * (yr[1] - yr[0])), { color: 'accent', size: fs - 1, align: 'right' });
        pW.text('incident + reflected', x0 + 0.02 * (x1 - x0), yr[1] - 0.07 * (yr[1] - yr[0]), { color: 'ink2', size: fs - 1 });
      }
    }
    if (want.includes('T')) {
      const lgT = !!p.tlog, lo = -10;
      pT.o.yfmt = lgT ? (v) => { const k = Math.round(v); return Math.abs(v - k) > 1e-9 ? '' : k === 0 ? '1' : `10${String(k).replace('-', '⁻').replace(/\d/g, (c) => '⁰¹²³⁴⁵⁶⁷⁸⁹'[c])}`; } : undefined;
      pT.o.ylabel = 'transmission T';
      pT.setView([0, 3], lgT ? [lo, 0.4] : [0, 1.08]);
      pT.clear();
      const f = (u) => { const t = M.solve(u * M.Vb).T; return lgT ? Math.max(lo - 1, Math.log10(Math.max(t, 1e-300))) : t; };
      pT.fn(f, { color: 'accent', width: 2.2, domain: [0.002, 3], samples: 700 });
      pT.line(1, lgT ? lo : 0, 1, lgT ? 0.4 : 1.08, { color: 'ink3', width: 1, dash: [4, 4] });
      pT.text('E = V₀', 1, lgT ? lo + 0.6 : 0.06, { color: 'ink3', size: fs - 1, dx: 5 });
      const u = E / M.Vb;
      if (u <= 3 && !hide.has('T')) pT.point(u, f(u), { color: 'gold', r: 5.5 });
    }
    return { M, sol };
  }

  function readout(info, p) {
    if (P.readout === false) return;
    const q = (k, v) => (hide.has(k) ? '?' : v);
    if (p.mode === 'scatter') {
      const { sol, M } = info;
      const kap = p.E < M.Vb ? S.kappa(p.E, M.Vb, p.mass) : NaN;
      F.readout([
        ['transmission $T$', q('T', texNum(sol.T))],
        ['reflection $R$', q('T', texNum(sol.R))],
        Number.isFinite(kap) && M.kind !== 'step' ? ['$\\kappa$', `${texNum(kap)}\\ \\text{nm}^{-1}`] : null,
        Number.isFinite(kap) && M.kind !== 'step' ? ['$e^{-2\\kappa d}$', q('T', texNum(Math.exp(-2 * kap * M.d)))] : null,
      ]);
      return;
    }
    const { M, n, sup, Pwin, mom } = info;
    if (sup) {
      const Ea = M.levels[sup[0] - M.ground].E, Eb = M.levels[sup[1] - M.ground].E, per = S.H_EVFS / Math.abs(Eb - Ea);
      F.readout([
        ['time', `${texNum(T)}\\ \\text{fs}`],
        ['period $h/\\Delta E$', q('energy', `${texNum(per)}\\ \\text{fs}`)],
        mom ? ['$\\langle x\\rangle$', q('moments', `${texNum(mom.mean)}\\ \\text{nm}`)] : null,
        Pwin !== null ? ['$P(a<x<b)$', q('prob', Pwin.toFixed(3))] : null,
      ]);
      return;
    }
    const E = M.levels[n - M.ground].E;
    F.readout([
      [`$E_{${n}}$`, q('energy', `${texNum(E)}\\ \\text{eV}`)],
      M.kind === 'finite' ? ['bound states', q('count', String(M.levels.length))] : null,
      Pwin !== null ? ['$P(a<x<b)$', q('prob', Pwin.toFixed(3))] : null,
      mom ? ['$\\langle x\\rangle$', q('moments', `${texNum(mom.mean)}\\ \\text{nm}`)] : null,
      mom ? ['$\\Delta x$', q('moments', `${texNum(mom.sd)}\\ \\text{nm}`)] : null,
    ]);
  }

  function draw() {
    const p = params();
    const { want, narrow } = layout(p.mode);
    const info = p.mode === 'scatter' ? drawScatter(p, want, narrow) : drawBound(p, want, narrow);
    readout(info, p);
  }

  // the superposition plays; a stationary state does not move
  const reduced = () => document.documentElement.getAttribute('data-motion') === 'reduce' || !!globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  if (Array.isArray(P.super) && P.mode === 'bound') {
    let running = (P.play ?? !F.compact) && !reduced();
    const step = (dt) => {
      const p = params(), M = model(p), sup = p.sup;
      if (!sup || !M.levels[sup[1] - M.ground]) return;
      const per = S.H_EVFS / Math.abs(M.levels[sup[1] - M.ground].E - M.levels[sup[0] - M.ground].E);
      T = (T + (dt * per) / 4) % (per * 1000);       // one period in about four seconds
      draw();
    };
    let loop = F.animate((dt) => { if (running) step(dt); });
    if (!F.compact && P.play !== false) {
      const btn = F.button({ label: running ? 'Pause' : 'Play', onClick: () => {
        running = !running; btn.textContent = running ? 'Pause' : 'Play';
        loop.stop(); loop = F.animate((dt) => { if (running) step(dt); }, { force: running });
      } });
      F.button({ label: 'Restart', onClick: () => { T = 0; draw(); } });
    }
  }

  F.onChange((k) => {
    // keep the chosen state among the levels that exist
    if (k === 'well' || k === 'V0' || k === 'L' || k === 'mass' || k === 'n') {
      const p = params();
      if (p.mode === 'bound') {
        const M = model(p), lo = M.ground, hi = M.levels.length - 1 + M.ground, nn = Math.round(F.params.n);
        if (wanted.includes('n') && (nn < lo || nn > hi) && M.kind !== 'infinite' && M.kind !== 'harmonic') F.set('n', Math.max(lo, Math.min(hi, nn)));
        else if (wanted.includes('n') && nn < lo) F.set('n', lo);
      }
    }
    draw();
  });
  F.draw(draw);
  F.caption(P.caption || (P.mode === 'scatter'
    ? 'Exact stationary solutions for a wave arriving from the left, with |ψ|² of the incoming wave set to 1. The energy is the same on both sides of the barrier: only the amplitude falls inside it. One dimension, and no time dependence: a real particle is a packet, a spread of such waves.'
    : 'The energy diagram (top) and the wave (bottom) share the x-axis but not their vertical axes: the particle’s energy does not change from place to place. Infinite, finite and harmonic wells are solved exactly; the double well by finite differences. The overall sign of ψ is arbitrary.'));
  return { get: (k) => F.params[k] };
}

export function validate(P) {
  const p = [];
  const inr = (v, a, b) => typeof v === 'number' && v >= a && v <= b;
  if (!['bound', 'scatter'].includes(P.mode)) p.push('mp-schrodinger: mode is bound or scatter');
  if (!WELLS.includes(P.well)) p.push(`mp-schrodinger: unknown well “${P.well}”`);
  if (!BARRIERS.includes(P.barrier)) p.push(`mp-schrodinger: unknown barrier “${P.barrier}”`);
  if (!inr(P.L, 0.1, 5)) p.push('mp-schrodinger: L must lie in 0.1–5 nm');
  if (!inr(P.V0, 0.05, 50)) p.push('mp-schrodinger: V0 must lie in 0.05–50 eV');
  if (!inr(P.w, 0.02, 1)) p.push('mp-schrodinger: w must lie in 0.02–1 nm');
  if (!inr(P.hw, 0.02, 2)) p.push('mp-schrodinger: hw must lie in 0.02–2 eV');
  if (!inr(P.mass, 0.02, 10)) p.push('mp-schrodinger: mass must lie in 0.02–10 electron masses');
  if (!inr(P.E, 0.005, 50)) p.push('mp-schrodinger: E must lie in 0.005–50 eV');
  if (!inr(P.Vb, 0.01, 50)) p.push('mp-schrodinger: Vb must lie in 0.01–50 eV');
  if (!inr(P.d, 0.02, 5)) p.push('mp-schrodinger: d must lie in 0.02–5 nm');
  if (!inr(P.gap, 0.1, 10)) p.push('mp-schrodinger: gap must lie in 0.1–10 nm');
  if (!['psi', 'prob', 'both'].includes(P.show)) p.push('mp-schrodinger: show is psi, prob or both');
  const ground = P.well === 'harmonic' ? 0 : 1;
  const count = P.well === 'finite' && inr(P.V0, 0.05, 50) && inr(P.L, 0.1, 5) && inr(P.mass, 0.02, 10) ? S.boundCount(P.V0, P.L, P.mass) : NMAX;
  const okN = (k) => Number.isInteger(k) && k >= ground && k < ground + Math.min(count, NMAX);
  if (P.mode === 'bound' && !okN(P.n)) p.push(`mp-schrodinger: n = ${P.n} is not a state of this well (${ground}…${ground + Math.min(count, NMAX) - 1})`);
  if (P.super !== null && !(Array.isArray(P.super) && P.super.length === 2 && P.super.every(okN) && P.super[0] !== P.super[1])) p.push('mp-schrodinger: super is [n₁, n₂], two different states of the well');
  if (P.window !== null && !(Array.isArray(P.window) && P.window.length === 2 && P.window[0] < P.window[1] && P.window.every((v) => inr(v, -2, 6)))) p.push('mp-schrodinger: window is [a, b] with −2 ≤ a < b ≤ 6 nm');
  if (P.top !== null && !(Number.isInteger(P.top) && P.top >= 1 && P.top <= NMAX)) p.push(`mp-schrodinger: top must be an integer 1–${NMAX}`);
  if (P.panels !== null && !(Array.isArray(P.panels) && P.panels.length && P.panels.every((k) => PANELS.includes(k)))) p.push('mp-schrodinger: panels is a list of energy, wave, T');
  for (const h of P.hide || []) if (!HIDE.includes(h)) p.push(`mp-schrodinger: unknown hide “${h}”`);
  if (Array.isArray(P.controls)) for (const c of P.controls) if (!CONTROLS.includes(c)) p.push(`mp-schrodinger: unknown control “${c}”`);
  if (!(P.t >= 0)) p.push('mp-schrodinger: t must be ≥ 0');
  return p;
}
