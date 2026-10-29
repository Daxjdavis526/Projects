// Partial-wave scattering from a sphere of radius a: a hard sphere, an
// attractive square well or a repulsive square barrier, at any wavenumber ka.
//
// Panels: 'angle' — dσ/dΩ against the scattering angle θ (log scale), exact
// from the partial waves, with the first Born approximation dashed; 'polar' —
// the same as a polar diagram with the beam arriving from the left;
// 'partials' — each partial wave's cross section σₗ as a bar against its
// unitarity ceiling 4π(2l + 1)/k² (hollow), with δₗ in degrees; 'sigma' — the
// total σ against ka, with a marker at the current ka.
// Physics in model/q2b-scatter.js (tested in test/q2b-scatter.test.mjs).
//
//   { type: 'q2b-scatter', params: {
//       target: 'hard',        // hard | well | barrier
//       ka: 1,                 // wavenumber × radius (0.05–12)
//       g: 2,                  // well or barrier strength √(2mV₀)·a/ħ (0–8)
//       born: false,           // draw the first Born approximation (well and barrier only)
//       panels: null,          // any of 'angle', 'polar', 'partials', 'sigma' (default: polar, partials and sigma; angle and partials in a question)
//       lmax: 10,              // the highest l drawn in 'partials'
//       logy: true,            // 'angle': a log scale for dσ/dΩ
//       controls: null,        // true, false, or a list of: target ka g born
//       readout: true,
//       hide: [],              // any of: sigma, born, phases (the δₗ labels), lmax
//   } }

import { Plot } from '../plot.js';
import * as S from '../model/q2b-scatter.js';

export const defaults = { target: 'hard', ka: 1, g: 2, born: false, panels: null, lmax: 10, logy: true, controls: null, readout: true, hide: [] };
const TARGETS = { hard: 'hard sphere', well: 'attractive well', barrier: 'repulsive barrier' };
const CONTROLS = ['target', 'ka', 'g', 'born'];
const PANELS = ['angle', 'polar', 'partials', 'sigma'];
const HIDE = ['sigma', 'born', 'phases', 'lmax'];
const DEG = 180 / Math.PI;
const f3 = (v) => (!Number.isFinite(v) ? '—' : Math.abs(v) >= 1000 ? v.toFixed(0) : Math.abs(v) >= 0.01 ? v.toPrecision(3) : v.toExponential(2));
const t3 = (v) => { const s = f3(v); return s.includes('e') ? s.replace(/e([+-]\d+)/, (m, e) => `\\times10^{${+e}}`) : s; };

export function mount(F, P0) {
  const P = { ...defaults, ...P0 };
  const hide = new Set(P.hide || []);
  const wanted = P.controls === true || (P.controls === null && !F.compact) ? CONTROLS : Array.isArray(P.controls) ? P.controls : [];
  const ctl = (key, make) => (wanted.includes(key) ? make() : (F.params[key] = P[key]));
  ctl('target', () => F.choice({ key: 'target', label: 'Target', options: Object.entries(TARGETS), value: P.target, explain: 'An impenetrable sphere, or a square well or barrier of radius a and depth or height V₀.' }));
  ctl('ka', () => F.slider({ key: 'ka', label: 'Wavenumber $ka$', min: 0.05, max: 12, step: 0.05, value: P.ka, explain: 'The incoming wavenumber times the radius: how many radians of wave fit in one radius. Partial waves up to l ≈ ka matter.' }));
  ctl('g', () => F.slider({ key: 'g', label: 'Strength $g = \\sqrt{2mV_0}\\,a/\\hbar$', min: 0, max: 8, step: 0.05, value: P.g, explain: 'How strong the well or barrier is, as a dimensionless number. The well first holds a bound state at g = π/2.' }));
  ctl('born', () => F.toggle({ key: 'born', label: 'First Born approximation', value: P.born, explain: 'Draw the Born approximation (dashed), which treats the potential as weak.' }));

  const panels = P.panels || (F.compact ? ['angle', 'partials'] : ['polar', 'partials', 'sigma']);
  const pl = {}, cv = {};
  const LBL = { angle: 'Differential cross section against angle', polar: 'Differential cross section as a polar diagram', partials: 'Partial cross sections', sigma: 'Total cross section against ka' };
  for (const k of PANELS) if (panels.includes(k)) { cv[k] = F.canvas({ aspect: 'wide', label: LBL[k] }).canvas; }
  if (cv.angle) pl.angle = new Plot(cv.angle, { x: [0, 180], y: [0, 1], xlabel: 'scattering angle θ (degrees)', ylabel: P.logy ? 'dσ/dΩ (a²), log scale' : 'dσ/dΩ (a²)', axesAt: 'edge', xticks: 6 });
  if (cv.polar) pl.polar = new Plot(cv.polar, { x: [-1.6, 1.6], y: [-1, 1], equal: true, axes: false, grid: false });
  if (cv.partials) pl.partials = new Plot(cv.partials, { x: [-0.7, 10.7], y: [0, 1], xlabel: 'channel l', ylabel: 'σₗ (πa²)', axesAt: 'edge', xticks: 0 });
  if (cv.sigma) pl.sigma = new Plot(cv.sigma, { x: [0, 12], y: [0, 6], xlabel: 'ka', ylabel: 'σ (πa²)', axesAt: 'edge' });

  const sigCache = new Map();
  const state = () => {
    const target = TARGETS[F.params.target] ? F.params.target : 'hard';
    const ka = Math.max(0.01, +F.params.ka), g = target === 'hard' ? 0 : +F.params.g;
    const d = S.phaseShifts(target, ka, g), cs = S.crossSections(d, ka);
    const born = !!F.params.born && target !== 'hard';
    return { target, ka, g, d, cs, born };
  };
  const narrow = (c) => (c.clientWidth || 600) < 520;

  function drawAngle(st) {
    const p = pl.angle; if (!p) return;
    const N = 361, ys = [], yb = [];
    for (let i = 0; i < N; i++) { const th = (Math.PI * i) / (N - 1); ys.push(S.diffCross(st.d, st.ka, th)); if (st.born) yb.push(S.bornAt(st.target, st.g, st.ka, th) ** 2); }
    const log = P.logy !== false;
    const all = [...ys, ...(st.born ? yb : [])].filter((v) => v > 0);
    const top = Math.max(...all), bot = Math.max(Math.min(...all), top * 1e-6);
    const tr = (v) => (log ? Math.log10(Math.max(v, bot * 0.5)) : v);
    if (log) { p.o.yfmt = (t) => { const n = Math.round(t); return Math.abs(t - n) > 1e-9 ? '' : n === 0 ? '1' : `10${String(n).replace('-', '⁻').replace(/\d/g, (c) => '⁰¹²³⁴⁵⁶⁷⁸⁹'[c])}`; }; }
    const y0 = log ? Math.floor(Math.log10(bot)) : 0, y1 = log ? Math.log10(top) + 0.3 : top * 1.15;
    p.setView([0, 180], [y0, Math.max(y1, y0 + 1)]);
    p.clear();
    p.path(ys.map((v, i) => [(180 * i) / (N - 1), tr(v)]), { color: 'accent', width: 2.4 });
    if (st.born) p.path(yb.map((v, i) => [(180 * i) / (N - 1), tr(v)]), { color: 'gold', width: 2, dash: [6, 4] });
    p.text(st.born ? 'blue: exact (partial waves) · gold dashed: Born' : 'exact, from the partial waves', 178, y1, { align: 'right', dy: 10, color: 'ink3', size: narrow(cv.angle) ? 10.5 : 11.5 });
  }

  function drawPolar(st) {
    const p = pl.polar; if (!p) return;
    const N = 361, r = [], rb = [];
    for (let i = 0; i < N; i++) { const th = (Math.PI * i) / (N - 1); r.push(S.diffCross(st.d, st.ka, th)); if (st.born) rb.push(S.bornAt(st.target, st.g, st.ka, th) ** 2); }
    const top = Math.max(...r, ...(st.born ? rb : [0]));
    p.clear();
    const pts = (arr) => { const out = []; for (let i = 0; i < N; i++) { const th = (Math.PI * i) / (N - 1), q = arr[i] / top; out.push([q * Math.cos(th), q * Math.sin(th)]); } for (let i = N - 1; i >= 0; i--) { const th = (Math.PI * i) / (N - 1), q = arr[i] / top; out.push([q * Math.cos(th), -q * Math.sin(th)]); } return out; };
    for (const q of [0.5, 1]) p.circle(0, 0, q, { color: 'ink4', width: 1, dash: [2, 4] });
    p.arrow(-1.55, 0, -0.2, 0, { color: 'ink3', width: 1.6 });
    p.text('beam', -1.55, 0, { dy: -10, color: 'ink3', size: 11 });
    p.path(pts(r), { color: 'accent', width: 2.2, fill: 'accent', fillAlpha: 0.15 });
    if (st.born) p.path(pts(rb), { color: 'gold', width: 1.8, dash: [6, 4] });
    p.circle(0, 0, 0.05, { fill: 'ink2', color: 'ink2' });
    p.text('forward (θ = 0)', 1.05, 0, { dx: 2, dy: -9, color: 'ink3', size: 11 });
    p.text('back', -1.02, 0, { dy: 12, align: 'right', color: 'ink3', size: 11 });
    p.text(st.born ? 'dσ/dΩ, scaled to its largest value · Born dashed' : 'dσ/dΩ, scaled to its largest value', 1.55, 0.95, { align: 'right', color: 'ink3', size: narrow(cv.polar) ? 10.5 : 11.5 });
  }

  function drawPartials(st) {
    const p = pl.partials; if (!p) return;
    const L = Math.min(P.lmax, 20);
    const ceil = (l) => (4 * (2 * l + 1)) / (st.ka * st.ka);
    const shown = Array.from({ length: L + 1 }, (_, l) => (l < st.d.length ? st.cs.parts[l] : 0));
    const ymax = Math.max(...shown, 1e-6) * 1.35;
    p.o.xticks = 0;
    p.setView([-0.7, L + 0.7], [0, ymax]);
    p.clear();
    for (let l = 0; l <= L; l++) {
      if (ceil(l) <= ymax) p.rect(l - 0.32, 0, 0.64, ceil(l), { fill: false, color: 'ink3', width: 1 });
      if (shown[l] > 0) p.rect(l - 0.32, 0, 0.64, shown[l], { color: 'accent', alpha: 0.75, stroke: false });
      p.text(String(l), l, 0, { align: 'center', dy: 10, color: 'ink3', size: 11 });
      if (!hide.has('phases') && l < st.d.length && shown[l] > ymax * 0.02) p.text(`${(st.d[l] * DEG).toFixed(0)}°`, l, shown[l], { align: 'center', dy: -9, color: 'accent', size: narrow(cv.partials) ? 9.5 : 10.5 });
    }
    p.text('bars: σₗ · outlines (where in range): the ceiling 4π(2l + 1)/k², reached when δₗ = 90°', L + 0.6, ymax, { align: 'right', dy: 10, color: 'ink3', size: narrow(cv.partials) ? 9.5 : 11 });
  }

  function drawSigma(st) {
    const p = pl.sigma; if (!p) return;
    const key = `${st.target}|${st.g}`;
    if (!sigCache.has(key)) {
      const pts = [], pb = [];
      for (let i = 0; i <= 360; i++) { const ka = 0.05 + (11.95 * i) / 360; pts.push([ka, S.crossSections(S.phaseShifts(st.target, ka, st.g), ka).total]); if (st.target !== 'hard') pb.push([ka, S.bornTotal(st.target, st.g, ka, 120)]); }
      if (sigCache.size > 30) sigCache.clear();
      sigCache.set(key, { pts, pb });
    }
    const { pts, pb } = sigCache.get(key);
    const ymax = Math.min(60, Math.max(0.02, ...pts.map((q) => q[1]).filter((v) => v < 60), ...(st.born ? pb.map((q) => q[1]).filter((v) => v < 60) : [])) * 1.15);
    p.setView([0, 12], [0, ymax]);
    p.clear();
    if (st.target === 'hard') {
      p.line(0, 4, 12, 4, { color: 'ink3', dash: [5, 4] }); p.text('4πa²', 11.9, 4, { align: 'right', dy: -9, color: 'ink3', size: 11 });
      p.line(0, 2, 12, 2, { color: 'ink3', dash: [5, 4] }); p.text('2πa²', 11.9, 2, { align: 'right', dy: -9, color: 'ink3', size: 11 });
    }
    if (ymax > 1.1) { p.line(0, 1, 12, 1, { color: 'ink4', dash: [2, 4] }); p.text('πa² (the geometric area)', 11.9, 1, { align: 'right', dy: 10, color: 'ink4', size: 10.5 }); }
    p.path(pts.map(([x, y]) => [x, Math.min(y, ymax * 1.5)]), { color: 'accent', width: 2.2 });
    if (st.born && pb.length) p.path(pb.map(([x, y]) => [x, Math.min(y, ymax * 1.5)]), { color: 'gold', width: 1.8, dash: [6, 4] });
    p.point(st.ka, Math.min(st.cs.total, ymax), { color: 'gold', r: 5 });
  }

  function readout(st) {
    if (P.readout === false) return;
    const q = (k, v) => (hide.has(k) ? '?' : v);
    let lm = 0; st.cs.parts.forEach((v, l) => { if (v > 0.01 * st.cs.total) lm = l; });
    F.readout([
      ['$ka$', st.ka.toFixed(2)],
      ['$\\sigma/\\pi a^2$', q('sigma', t3(st.cs.total))],
      ...(st.born ? [['Born $\\sigma/\\pi a^2$', q('born', t3(S.bornTotal(st.target, st.g, st.ka)))]] : []),
      ['$\\delta_0$', q('phases', `${(st.d[0] * DEG).toFixed(1)}^\\circ`)],
      ['waves that matter', q('lmax', `l \\le ${lm}`)],
    ]);
  }

  const draw = () => { const st = state(); drawAngle(st); drawPolar(st); drawPartials(st); drawSigma(st); readout(st); };
  F.onChange(draw);
  F.draw(draw);
  F.caption(P.caption || 'Exact partial-wave results for a sharp-edged sphere of radius a (non-relativistic, spinless, elastic). Phase shifts are shown modulo 180°. Lengths are in units of a, so cross sections are in units of the geometric area πa².');
  return { get: (k) => F.params[k] };
}

export function validate(P) {
  const p = [];
  if (!TARGETS[P.target]) p.push(`q2b-scatter: unknown target “${P.target}”`);
  if (!(P.ka >= 0.05 && P.ka <= 12)) p.push('q2b-scatter: ka must lie in 0.05–12');
  if (!(P.g >= 0 && P.g <= 8)) p.push('q2b-scatter: g must lie in 0–8');
  if (!(Number.isInteger(P.lmax) && P.lmax >= 2 && P.lmax <= 20)) p.push('q2b-scatter: lmax is an integer from 2 to 20');
  if (P.panels) for (const k of P.panels) if (!PANELS.includes(k)) p.push(`q2b-scatter: unknown panel “${k}”`);
  for (const h of P.hide || []) if (!HIDE.includes(h)) p.push(`q2b-scatter: unknown hide “${h}”`);
  if (Array.isArray(P.controls)) for (const c of P.controls) if (!CONTROLS.includes(c)) p.push(`q2b-scatter: unknown control “${c}”`);
  return p;
}
