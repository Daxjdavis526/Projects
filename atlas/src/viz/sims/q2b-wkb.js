// The WKB approximation against the exact answer.
//
// 'well': a one-dimensional well (harmonic, |x|, x⁴, a bouncing particle
// above a hard floor, or a box with a sloping floor) in units ħ = m = 1.
// Panels: 'energy' — V(x) with the exact levels (solid) and the WKB levels
// (dashed), the chosen one in gold; 'wave' — the exact ψ (blue) against the
// WKB ψ (gold, dashed), which matches it everywhere except near the turning
// points, where it blows up; the forbidden regions shaded; optionally the
// WKB envelope ±2C/√p; 'phase' — the classical orbit in the (x, p) plane at
// the level's energy, whose area ∮p dx is (n + ½)h for two soft turning
// points (the shaded area, with its value in units of h).
// 'airy': the region round one turning point, where V is nearly linear: the
// exact solution Ai(z) against the two WKB forms, which diverge at z = 0;
// a probe slider z gives both values and their ratio.
// Physics in model/q2b-wkb.js (tested in test/q2b-wkb.test.mjs).
//
//   { type: 'q2b-wkb', params: {
//       view: 'well',          // 'well' or 'airy'
//       pot: 'harmonic',       // harmonic | linear | quartic | bouncer | tilt
//       n: 0,                  // the level: 0, 1, 2 … for harmonic, linear and quartic; 1, 2, … for bouncer and tilt
//       F: 3,                  // tilt: the floor's slope (0–10), V = F·x on [0, π]
//       show: 'psi',           // 'psi' or 'prob' (|ψ|²)
//       exact: true,           // draw the exact solution
//       wkb: true,             // draw the WKB solution (and the WKB levels)
//       envelope: false,       // wave: the WKB envelope ±2C/√p (amplitude ∝ 1/√p)
//       panels: null,          // any of 'energy', 'wave', 'phase' (default: energy and wave; phase too in the Explore step)
//       z: -3,                 // airy: the probe's position
//       controls: null,        // true, false, or a list of: pot n F show wkb envelope z
//       readout: true,
//       hide: [],              // any of: energy (level energies), wkb (the WKB energy), error, action, labels
//   } }

import { Plot } from '../plot.js';
import * as W from '../model/q2b-wkb.js';

export const defaults = { view: 'well', pot: 'harmonic', n: 0, F: 3, show: 'psi', exact: true, wkb: true, envelope: false, panels: null, z: -3, controls: null, readout: true, hide: [] };
const POTS = Object.keys(W.POTS);
const CONTROLS = ['pot', 'n', 'F', 'show', 'wkb', 'envelope', 'z'];
const HIDE = ['energy', 'wkb', 'error', 'action', 'labels'];
const PANELS = ['energy', 'wave', 'phase'];
const f4 = (v) => (Math.abs(v) >= 100 ? v.toFixed(1) : v.toPrecision(4));

export function mount(F, P0) {
  const P = { ...defaults, ...P0 };
  const hide = new Set(P.hide || []);
  const wanted = P.controls === true || (P.controls === null && !F.compact) ? CONTROLS : Array.isArray(P.controls) ? P.controls : [];
  const ctl = (key, make) => (wanted.includes(key) ? make() : (F.params[key] = P[key]));
  if (P.view === 'airy') return mountAiry(F, P, ctl);

  ctl('pot', () => F.choice({ key: 'pot', label: 'Well', options: POTS.map((k) => [k, W.POTS[k].label]), value: P.pot, explain: 'The potential, in units where ħ = m = 1. The bouncer is a particle above a hard floor in uniform gravity.' }));
  ctl('n', () => F.slider({ key: 'n', label: 'Level $n$', min: 0, max: 15, step: 1, value: P.n, explain: 'Which stationary state: n counts from 0 in the soft wells and from 1 in the bouncer and the box, as the textbooks do.' }));
  ctl('F', () => F.slider({ key: 'F', label: 'Floor slope $F$', min: 0, max: 10, step: 0.5, value: P.F, explain: 'Only for the box: the floor rises as V = F·x across the box from 0 to π.' }));
  ctl('show', () => F.choice({ key: 'show', label: 'Show', options: [['psi', 'ψ(x)'], ['prob', '|ψ(x)|²']], value: P.show, explain: 'The wave function or the probability density.' }));
  ctl('wkb', () => F.toggle({ key: 'wkb', label: 'WKB solution', value: P.wkb, explain: 'Draw the WKB wave function and levels (gold, dashed).' }));
  ctl('envelope', () => F.toggle({ key: 'envelope', label: 'WKB envelope', value: P.envelope, explain: 'The amplitude 2C/√p of the WKB wave: large where the particle is slow.' }));

  const panels = P.panels || (F.compact ? ['energy', 'wave'] : ['energy', 'wave', 'phase']);
  const cv = {};
  for (const k of PANELS) if (panels.includes(k)) cv[k] = F.canvas({ aspect: 'wide', label: { energy: 'The potential and its energy levels', wave: 'The exact and WKB wave functions', phase: 'The classical orbit in phase space' }[k] }).canvas;
  const pl = {};
  if (cv.energy) pl.energy = new Plot(cv.energy, { x: [-1, 1], y: [0, 1], xlabel: 'x', ylabel: 'energy', axesAt: 'edge' });
  if (cv.wave) pl.wave = new Plot(cv.wave, { x: [-1, 1], y: [-1, 1], xlabel: 'x', ylabel: '', axesAt: 'edge', yticks: 0 });
  if (cv.phase) pl.phase = new Plot(cv.phase, { x: [-1, 1], y: [-1, 1], xlabel: 'x', ylabel: 'p', axesAt: 'edge' });

  const state = () => {
    const pot = W.POTS[F.params.pot] ? F.params.pot : 'harmonic', D = W.POTS[pot];
    const slope = pot === 'tilt' ? +F.params.F : 0;
    const nLab = Math.max(D.first, Math.min(D.nmax + D.first, Math.round(+F.params.n)));
    const nodes = W.nodesOf(pot, nLab);
    const E = W.exactLevel(pot, nodes, slope), Ew = W.wkbLevel(pot, nodes, slope);
    const T = W.turning(pot, E, slope), V = W.potential(pot, slope);
    // the window: the allowed region and some way into the forbidden ones
    const span = T.x2 - T.x1, m = Math.max(1.2, 0.3 * span);
    const xa = T.soft1 ? Math.max(D.xa, T.x1 - m) : D.xa, xb = T.soft2 ? Math.min(D.xb, T.x2 + m) : D.xb;
    const lo = D.xa === 0 ? -0.04 * (xb - xa) : xa;
    return { pot, D, slope, nLab, nodes, E, Ew, T, V, xa: Math.min(lo, xa), xb, x0: xa };
  };

  function drawEnergy(S) {
    const p = pl.energy; if (!p) return;
    const vmin = S.V(0);
    // the levels to draw: up to two above the chosen one, as long as they fit in the window
    const fits = (k) => { const Tk = W.turning(S.pot, W.exactLevel(S.pot, k, S.slope), S.slope); return Tk.x1 >= S.xa - 1e-9 && Tk.x2 <= S.xb + 1e-9; };
    let kTop = S.nodes;
    while (kTop < S.nodes + 2 && fits(kTop + 1)) kTop++;
    const Etop = W.exactLevel(S.pot, kTop, S.slope);
    const top = vmin + Math.max(Etop - vmin, (S.E - vmin) * 1.2) * 1.14;
    p.setView([S.xa, S.xb], [vmin - 0.05 * (top - vmin), top]);
    p.clear();
    if (S.D.wallL) { p.rect(S.xa, vmin - top, S.D.xa - S.xa, 3 * top, { color: 'ink4', alpha: 0.35, stroke: false }); p.line(S.D.xa, vmin - top, S.D.xa, 2 * top, { color: 'ink2', width: 2.5 }); }
    if (S.D.wallR) p.line(S.D.xb, vmin - top, S.D.xb, 2 * top, { color: 'ink2', width: 2.5 });
    p.fn((x) => (x < S.D.xa || x > S.D.xb ? NaN : S.V(x)), { color: 'ink2', width: 2.2, samples: 600 });
    for (let k = 0; k <= kTop; k++) {
      const Ek = W.exactLevel(S.pot, k, S.slope), Tk = W.turning(S.pot, Ek, S.slope);
      if (Ek > top) break;
      const on = k === S.nodes;
      p.line(Tk.x1, Ek, Tk.x2, Ek, { color: on ? 'gold' : 'accent', width: on ? 2.6 : 1.6 });
      if (F.params.wkb) { const Ewk = W.wkbLevel(S.pot, k, S.slope), Tw = W.turning(S.pot, Ewk, S.slope); p.line(Tw.x1, Ewk, Tw.x2, Ewk, { color: on ? 'warn' : 'ink3', width: 1.4, dash: [5, 4] }); }
      if (!hide.has('labels')) p.text(`n = ${W.labelOf(S.pot, k)}`, Tk.x2, Ek, { dx: 8, color: on ? 'gold' : 'ink3', size: 11 });
    }
    if (S.T.soft1) p.point(S.T.x1, S.E, { color: 'gold', r: 4 });
    if (S.T.soft2) p.point(S.T.x2, S.E, { color: 'gold', r: 4 });
    p.text(F.params.wkb ? 'solid: exact levels · dashed: WKB levels' : 'the exact levels', S.xb, top, { align: 'right', dy: 10, color: 'ink3', size: 11 });
  }

  function drawWave(S) {
    const p = pl.wave; if (!p) return;
    const ex = W.exactPsi(S.pot, S.E, S.slope);
    const prob = F.params.show === 'prob';
    const pts = [];
    let ymax = 0;
    for (let i = 0; i < ex.xs.length; i += 2) if (ex.xs[i] >= S.xa && ex.xs[i] <= S.xb) { const y = prob ? ex.ys[i] ** 2 : ex.ys[i]; pts.push([ex.xs[i], y]); ymax = Math.max(ymax, Math.abs(y)); }
    const Y = ymax * 1.45;
    p.setView([S.xa, S.xb], prob ? [-0.06 * Y, Y] : [-Y, Y]);
    p.clear();
    // forbidden regions (and the wall's region)
    const yy0 = prob ? -0.06 * Y : -Y;
    if (S.T.x1 > S.xa) p.rect(S.xa, yy0, S.T.x1 - S.xa, 2 * Y, { color: 'ink4', alpha: S.T.soft1 ? 0.18 : 0.35, stroke: false });
    if (S.T.x2 < S.xb) p.rect(S.T.x2, yy0, S.xb - S.T.x2, 2 * Y, { color: 'ink4', alpha: S.T.soft2 ? 0.18 : 0.35, stroke: false });
    if (!prob) p.line(S.xa, 0, S.xb, 0, { color: 'ink4', width: 1 });
    if (F.params.envelope && !prob) {
      for (const s of [1, -1]) p.fn((x) => s * W.wkbEnvelope(S.pot, S.E, x, S.slope), { color: 'violet', width: 1.3, dash: [2, 3], samples: 300, domain: [S.T.x1, S.T.x2] });
    }
    if (F.params.exact !== false && P.exact !== false) p.path(pts, { color: 'accent', width: 2.4 });
    if (F.params.wkb) {
      const xs = [], n = 420;
      for (let i = 0; i <= n; i++) xs.push(S.xa + ((S.xb - S.xa) * i) / n);
      const ys = W.wkbPsi(S.pot, S.E, xs, S.slope, S.nodes);
      const cap = 3 * Y;
      p.path(xs.map((x, i) => [x, Math.max(-cap, Math.min(cap, prob ? ys[i] ** 2 : ys[i]))]), { color: 'gold', width: 2, dash: [6, 4] });
    }
    for (const [x, soft] of [[S.T.x1, S.T.soft1], [S.T.x2, S.T.soft2]]) if (soft) p.line(x, yy0, x, Y, { color: 'gold', width: 1, dash: [3, 3] });
    const narrow = (cv.wave.clientWidth || 600) < 520, fs = narrow ? 10.5 : 11.5;
    p.text(F.params.wkb ? (prob ? 'blue: exact |ψ|² · gold dashed: WKB' : 'blue: exact ψ · gold dashed: WKB') : (prob ? 'exact |ψ|²' : 'exact ψ'), S.xb, Y, { align: 'right', dy: 10, color: 'ink3', size: fs });
    if (S.T.soft2) p.text('turning point', S.T.x2, yy0, { dx: 4, dy: -10, color: 'gold', size: fs - 0.5 });
  }

  function drawPhase(S) {
    const p = pl.phase; if (!p) return;
    const pmax = Math.sqrt(2 * (S.E - S.V(0))) * 1.25;
    p.setView([S.xa, S.xb], [-pmax, pmax]);
    p.clear();
    const n = 500, up = [], dn = [];
    for (let i = 0; i <= n; i++) { const x = S.T.x1 + ((S.T.x2 - S.T.x1) * i) / n, pp = Math.sqrt(Math.max(0, 2 * (S.E - S.V(x)))); up.push([x, pp]); dn.push([x, -pp]); }
    const loop = [...up, ...dn.reverse()];
    p.path(loop, { color: 'gold', width: 2.2, close: true, fill: 'gold', fillAlpha: 0.18 });
    const A = 2 * W.action(S.pot, S.E, S.slope) / (2 * Math.PI);
    const nu = W.maslov(S.T);
    p.text(hide.has('action') ? 'shaded area: ∮p dx = ?' : `shaded area: ∮p dx = ${A.toFixed(3)} h`, S.xb, pmax, { align: 'right', dy: 10, color: 'gold', size: 11.5 });
    p.text(`WKB rule: ∮p dx = ${nu === 0.5 ? '(n + ½) h' : nu === 0.75 ? '(n − ¼) h' : 'n h'}`, S.xb, pmax, { align: 'right', dy: 26, color: 'ink3', size: 11 });
  }

  function readout(S) {
    if (P.readout === false) return;
    const q = (k, v) => (hide.has(k) ? '?' : v);
    const err = (S.Ew - S.E) / (S.E - S.V(0) || 1);
    F.readout([
      ['$n$', String(S.nLab)],
      ['$E$ exact', q('energy', f4(S.E))],
      ['$E$ WKB', q('wkb', f4(S.Ew))],
      ['WKB error', q('error', `${(100 * (S.Ew - S.E) / S.E).toFixed(Math.abs(err) < 0.001 ? 4 : 2)}\\%`)],
      ['$\\oint p\\,dx/h$', q('action', (2 * W.action(S.pot, S.E, S.slope) / (2 * Math.PI)).toFixed(4))],
    ]);
  }

  const draw = () => { const S = state(); drawEnergy(S); drawWave(S); drawPhase(S); readout(S); };
  F.onChange(draw);
  F.draw(draw);
  F.caption(P.caption || 'Units ħ = m = 1. The exact levels and wave functions are computed numerically (Numerov’s method), the WKB ones from ∫p dx = (n + ν)πħ and the connection formulas. The WKB wave function diverges at the turning points (dashed gold lines), where its assumption of a slowly varying wavelength fails; it is drawn cut off there.');
  return { get: (k) => F.params[k] };
}

function mountAiry(F, P, ctl) {
  ctl('wkb', () => F.toggle({ key: 'wkb', label: 'WKB forms', value: P.wkb, explain: 'The two WKB solutions on either side of the turning point.' }));
  ctl('z', () => F.slider({ key: 'z', label: 'Probe $z$', min: -10, max: 4, step: 0.05, value: P.z, explain: 'Distance from the turning point in units of the natural length $\\ell = (\\hbar^2/2mF)^{1/3}$; negative is the allowed side.' }));
  const { canvas } = F.canvas({ aspect: 'wide', label: P.alt || 'The Airy function and its WKB forms near a turning point' });
  const p = new Plot(canvas, { x: [-10, 4], y: [-0.62, 0.8], xlabel: 'z', ylabel: '', axesAt: 'edge', yticks: 4 });
  function draw() {
    p.clear();
    p.rect(0, -0.62, 4, 1.42, { color: 'ink4', alpha: 0.18, stroke: false });
    p.line(-10, 0, 4, 0, { color: 'ink4', width: 1 });
    p.fn(W.airy, { color: 'accent', width: 2.4, samples: 900 });
    if (F.params.wkb) {
      p.fn((z) => (z < -0.02 ? Math.max(-3, Math.min(3, W.airyWkb(z))) : NaN), { color: 'gold', width: 2, dash: [6, 4], samples: 900, domain: [-10, -0.02] });
      p.fn((z) => (z > 0.02 ? Math.min(3, W.airyWkb(z)) : NaN), { color: 'gold', width: 2, dash: [6, 4], samples: 400, domain: [0.02, 4] });
    }
    p.line(0, -0.62, 0, 0.8, { color: 'gold', width: 1, dash: [3, 3] });
    const z = +F.params.z;
    p.line(z, -0.62, z, 0.8, { color: 'violet', width: 1.4 });
    p.point(z, W.airy(z), { color: 'violet', r: 4.5 });
    const narrow = (canvas.clientWidth || 600) < 520, fs = narrow ? 10.5 : 11.5;
    p.text('turning point', 0, 0.8, { dx: 5, dy: 10, color: 'gold', size: fs });
    p.text('forbidden', 3.9, -0.5, { align: 'right', color: 'ink3', size: fs });
    p.text(F.params.wkb ? 'blue: exact Ai(z) · gold dashed: WKB' : 'blue: exact Ai(z)', -9.9, 0.8, { dy: 10, color: 'ink3', size: fs });
    if (P.readout !== false) {
      const a = W.airy(z), w = W.airyWkb(z);
      F.readout([
        ['$z$', z.toFixed(2)],
        ['$\\mathrm{Ai}(z)$', a.toPrecision(4)],
        ['WKB', Number.isFinite(w) ? w.toPrecision(4) : '\\infty'],
        ['WKB ÷ exact', Number.isFinite(w) && Math.abs(a) > 1e-3 ? (w / a).toFixed(3) : '\\text{—}'],
      ]);
    }
  }
  F.onChange(draw);
  F.draw(draw);
  F.caption(P.caption || 'Near a turning point a smooth potential is nearly a straight line, and the Schrödinger equation becomes Airy’s equation ψ″ = zψ in the scaled distance z. Its solution that decays into the forbidden side (shaded) is Ai(z), drawn exactly. The WKB forms (dashed) match it a few units away on both sides and fail only near z = 0: matching across that gap is what the connection formulas do.');
  return { get: (k) => F.params[k] };
}

export function validate(P) {
  const p = [];
  if (!['well', 'airy'].includes(P.view)) p.push('q2b-wkb: view is well or airy');
  if (!W.POTS[P.pot]) p.push(`q2b-wkb: unknown well “${P.pot}”`);
  else {
    const D = W.POTS[P.pot];
    if (!(Number.isInteger(P.n) && P.n >= D.first && P.n <= D.nmax + D.first)) p.push(`q2b-wkb: n for ${P.pot} must be an integer from ${D.first} to ${D.nmax + D.first}`);
  }
  if (!(P.F >= 0 && P.F <= 10)) p.push('q2b-wkb: F must lie in 0–10');
  if (!['psi', 'prob'].includes(P.show)) p.push('q2b-wkb: show is psi or prob');
  if (!(P.z >= -10 && P.z <= 4)) p.push('q2b-wkb: z must lie in −10 … 4');
  if (P.panels) for (const k of P.panels) if (!PANELS.includes(k)) p.push(`q2b-wkb: unknown panel “${k}”`);
  for (const h of P.hide || []) if (!HIDE.includes(h)) p.push(`q2b-wkb: unknown hide “${h}”`);
  if (Array.isArray(P.controls)) for (const c of P.controls) if (!CONTROLS.includes(c)) p.push(`q2b-wkb: unknown control “${c}”`);
  return p;
}
