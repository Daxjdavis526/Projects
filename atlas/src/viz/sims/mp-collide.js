// Collisions and decays on the energy–momentum diagram. Each particle is an
// arrow (pc across, E up) whose tip sits on its mass hyperbola
// E² − (pc)² = (mc²)²; massless particles would run along the 45° light
// lines. Four-momenta add tip to tail, and the length that every observer
// agrees on — the mass of the total, √s — decides what a collision can make.
// The frame slider boosts everything: arrows slide along their hyperbolas,
// energies and momenta change, √s does not. Physics in
// model/mp-fourmomentum.js (tested in test/mp-fourmomentum.test.mjs).
//
//   { type: 'mp-collide', params: {
//       scenario: 'bevatron',  // bevatron pion pp ppbar lhc lhcfixed lambda (see SCENARIOS)
//       K: null,               // MeV: the beam's kinetic energy (each beam's, head-on; the parent's, for a decay); null = the scenario's
//       frame: 0,              // −0.5…2: 0 the lab; fixed target 1 = CM, 2 = the beam's rest frame;
//                              //   head-on 1 = a frame at 0.5c, 2 = 0.8c; decay 1 = the parent's rest frame
//       products: null,        // override the scenario's products (particle keys) — [] for none
//       range: null,           // [Kmin, Kmax] for the K slider (MeV)
//       controls: null,        // true, false, or a list of: scenario K frame
//       readout: true,
//       hide: [],              // any of: K, mass (√s), threshold (its K and the verdict; the line stays)
//   } }

import { Plot } from '../plot.js';
import * as R from '../model/mp-fourmomentum.js';

export const defaults = { scenario: 'bevatron', K: null, frame: 0, products: null, range: null, controls: null, readout: true, hide: [] };
const CONTROLS = ['scenario', 'K', 'frame'];
const HIDE = ['K', 'mass', 'threshold'];

/** The display unit for energies up to x MeV. */
const unitFor = (x) => (x < 3000 ? [1, 'MeV'] : x < 3e6 ? [1e3, 'GeV'] : [1e6, 'TeV']);
/** n significant figures, plain. */
const sig = (x, n = 3) => (x === 0 ? '0' : String(+x.toPrecision(n)));
/** An energy in MeV as TeX with a sensible unit. */
function texE(x, n = 3) {
  const [f, u] = unitFor(Math.abs(x) * 1.0001);
  return `${sig(x / f, n)}\\,\\mathrm{${u}}`;
}
const PLAIN = { e: 'e⁻', mu: 'μ', 'pi+': 'π⁺', 'pi-': 'π⁻', pi0: 'π⁰', 'K+': 'K⁺', p: 'p', pbar: 'p̄', n: 'n', Lambda: 'Λ⁰', Delta: 'Δ', d: 'd', alpha: 'α', W: 'W', Z: 'Z', H: 'H', gamma: 'γ' };

export function mount(F, P0) {
  const P = { ...defaults, ...P0 };
  const hide = new Set(P.hide || []);
  const wanted = P.controls === true || (P.controls === null && !F.compact) ? CONTROLS.filter((c) => c !== 'scenario') : Array.isArray(P.controls) ? P.controls : [];
  const scn = () => ({ ...R.SCENARIOS[F.params.scenario || P.scenario], ...(P.products ? { products: P.products } : {}) });
  F.params.scenario = P.scenario;
  const S0 = scn();

  if (wanted.includes('scenario')) {
    F.choice({ key: 'scenario', label: 'Situation', options: Object.entries(R.SCENARIOS).map(([k, s]) => [k, s.label]), value: P.scenario, explain: 'Each sets the particles, the energy and what the collision is trying to make.' });
  }
  if (wanted.includes('K')) {
    const [lo, hi] = wanted.includes('scenario') ? [1, 1e7] : P.range || S0.range;
    const log = lo > 0 && hi / lo > 50;
    F.slider({
      key: 'K', label: S0.mode === 'decay' ? 'Kinetic energy of the decaying particle' : S0.mode === 'collider' ? 'Kinetic energy of each beam' : 'Beam kinetic energy $K$',
      min: log ? lo : lo, max: hi, step: log ? undefined : (hi - lo) / 300, value: P.K ?? S0.K, logScale: log,
      fmt: (v) => texE(v), explain: log ? 'The slider is logarithmic: each notch multiplies the energy.' : 'The kinetic energy, in the lab.',
    });
  } else F.params.K = P.K ?? S0.K;
  // with a choice of situation the slider must serve every mode; otherwise it fits this one
  const [frameLo, frameHi] = wanted.includes('scenario') ? R.FRAME_RANGE : R.frameRange(S0.mode);
  if (wanted.includes('frame')) {
    F.slider({
      key: 'frame', label: 'Observer’s frame', min: frameLo, max: frameHi, step: 0.01, value: P.frame,
      fmt: (v) => {
        const mode = scn().mode;
        const names = mode === 'collider' ? { 0: 'lab' } : mode === 'decay' ? { 0: 'lab', 1: 'parent at rest' } : { 0: 'lab', 1: 'CM', 2: 'beam at rest' };
        return names[v] ? `\\text{${names[v]}}` : String(v.toFixed(2));
      },
      explain: scn().mode === 'collider'
        ? 'Watch the collision from a frame moving along the beams: ±1 is a frame moving at 0.5c.'
        : scn().mode === 'decay' ? '0 is the lab; 1 rides along with the decaying particle.' : '0 is the lab (target at rest), 1 the centre-of-momentum frame, 2 rides with the beam particle.',
    });
  } else F.params.frame = P.frame;

  const { canvas, box } = F.canvas({ aspect: 'wide', label: P.alt || 'Four-momentum arrows on an energy–momentum diagram' });
  const plot = new Plot(canvas, { x: [-1, 1], y: [0, 1], axesAt: 'edge', pad: { l: 52, r: 16, t: 14, b: 36 } });

  F.onChange((key) => {
    if (key === 'scenario') { F.set('K', R.SCENARIOS[F.params.scenario].K); F.set('frame', 0); return; }
    draw();
  });

  function draw() {
    const W = canvas.clientWidth || 600, narrow = W < 520;
    const want = narrow ? '4 / 3' : '';
    if (box.style.aspectRatio !== want) { box.style.aspectRatio = want; requestAnimationFrame(draw); return; }
    const sc = scn();
    const K = Math.max(0, +F.params.K || 0), s = +F.params.frame || 0;
    const S = R.situation({ ...sc, K });
    const y = R.frameRapidity(S, s);
    const B = (P4) => R.boost(P4, y);
    const parts = S.parts.map((q) => ({ ...q, Q: B(q.P) })), total = B(S.total);

    // a view that holds every arrow at both ends of the frame slider, so sliding never rescales
    let xmin = 0, xmax = 0, ymax = 0;
    for (const ss of [frameLo, 0, frameHi]) {
      const yy = R.frameRapidity(S, ss);
      for (const V of [...S.parts.map((q) => q.P), S.total]) {
        const [E, p] = R.boost(V, yy);
        xmin = Math.min(xmin, p); xmax = Math.max(xmax, p); ymax = Math.max(ymax, E);
      }
    }
    if (S.Mth) ymax = Math.max(ymax, S.Mth);
    const [uf, un] = unitFor(ymax);
    const span = Math.max(xmax - xmin, ymax);
    plot.o.xlabel = `pc (${un})`; plot.o.ylabel = `E (${un})`;
    // equal scales on both axes (light at 45°), widening x about its centre or raising the top — never showing E < 0
    plot.resize();
    let x0 = (xmin - 0.06 * span) / uf, x1 = (xmax + 0.06 * span) / uf, y1 = (ymax * 1.08) / uf;
    const pw = plot.R - plot.L, ph = plot.B - plot.T;
    if (pw / (x1 - x0) > ph / y1) { const c = (x0 + x1) / 2, half = (pw * y1) / ph / 2; x0 = c - half; x1 = c + half; }
    else y1 = (ph * (x1 - x0)) / pw;
    plot.setView([x0, x1], [0, y1]);
    plot.clear();
    const fs = narrow ? 11 : 12;
    const top = plot.vy1, X0 = plot.vx0, X1 = plot.vx1;

    // light lines: where massless particles live
    plot.line(0, 0, Math.min(X1, top), Math.min(X1, top), { color: 'ink3', width: 1.2, dash: [4, 5] });
    plot.line(0, 0, Math.max(X0, -top), Math.min(-X0, top), { color: 'ink3', width: 1.2, dash: [4, 5] });
    {
      const t = Math.min(X1, top) * 0.93;
      plot.text('light: E = |pc|', t, t, { color: 'ink3', dx: -8, dy: -2, align: 'right', size: fs - 1 });
    }
    // mass hyperbolas: one per distinct mass, then the threshold and the total
    const hyper = (m, o) => plot.curve((u) => (m * Math.sinh(u)) / uf, (u) => (m * Math.cosh(u)) / uf, -Math.acosh(Math.max(1, (top * uf) / m)), Math.acosh(Math.max(1, (top * uf) / m)), o);
    const seen = new Set();
    for (const q of parts) {
      if (!(q.m > 0) || seen.has(q.m) || q.m / uf < 0.004 * top) continue;
      seen.add(q.m);
      hyper(q.m, { color: 'ink3', width: 1, dash: [2, 4] });
    }
    const showTh = S.Mth > 0;   // hide: ['threshold'] keeps the line but hides the number and the verdict
    if (showTh) {
      hyper(S.Mth, { color: 'bad', width: 1.6, dash: [6, 4] });
      plot.text(`products at rest: Σmc² = ${sig(S.Mth / uf, 4)} ${un}`, 0, S.Mth / uf, { color: 'bad', dx: -8, dy: 0, align: 'right', size: fs - 1, baseline: 'bottom' });
    }
    hyper(S.M, { color: 'gold', width: 1.3, alpha: 0.7 });

    // the arrows: each part from the origin, the second copied to the tip of the first, and the total
    const [a, b] = parts;
    const pt = (V) => [V[1] / uf, V[0] / uf];
    const A = pt(a.Q), Bv = pt(b.Q), T = pt(total);
    plot.line(A[0], A[1], T[0], T[1], { color: 'violet', width: 1.4, dash: [5, 4], alpha: 0.8 });
    plot.line(Bv[0], Bv[1], T[0], T[1], { color: 'accent', width: 1.4, dash: [5, 4], alpha: 0.8 });
    plot.arrow(0, 0, A[0], A[1], { color: 'accent', width: 2.6 });
    plot.arrow(0, 0, Bv[0], Bv[1], { color: 'violet', width: 2.6 });
    plot.arrow(0, 0, T[0], T[1], { color: 'gold', width: 3.2, head: 12 });
    const px = (P2) => [plot.X(P2[0]), plot.Y(P2[1])];
    const far = (P1, P2, d = 22) => Math.hypot(px(P1)[0] - px(P2)[0], px(P1)[1] - px(P2)[1]) > d;
    const name = (q) => PLAIN[q.key] || q.key;
    const decay = S.mode === 'decay';
    const lab = (P2, text, color, right) => plot.text(text, P2[0], P2[1], { color, dx: right ? 9 : -9, dy: 0, align: right ? 'left' : 'right', size: fs, weight: 650 });
    if (Math.hypot(...A.map((v, i) => px(A)[i] - px([0, 0])[i])) > 14) lab(A, decay ? name(a) : `${name(a)} (beam)`, 'accent', A[0] >= Bv[0]);
    if (far(Bv, [0, 0], 14) && far(Bv, A)) lab(Bv, decay ? name(b) : S.mode === 'collider' ? `${name(b)} (beam)` : `${name(b)} (target)`, 'violet', Bv[0] > A[0]);
    const Tlabel = decay ? `${PLAIN[S.parent.key]} (total)` : 'total';
    if (far(T, A, 30)) plot.text(Tlabel, T[0], T[1], { color: 'gold', dx: T[0] >= 0 ? -10 : 10, dy: -12, align: T[0] >= 0 ? 'right' : 'left', size: fs, weight: 700 });
    else plot.text(Tlabel, T[0], T[1], { color: 'gold', dx: -10, dy: -14, align: 'right', size: fs, weight: 700 });
    if (!hide.has('mass')) {
      const apex = S.M / uf;
      if (apex < top * 0.98) plot.text(`√s = ${sig(S.M / uf, 4)} ${un}`, 0, apex, { color: 'gold', dx: 12, dy: 4, align: 'left', size: fs - 1, baseline: 'top' });
    }

    if (P.readout !== false) {
      const beta = Math.tanh(y);
      const ok = !S.Mth || S.M >= S.Mth * (1 - 1e-12);
      F.readout([
        ['observer', `\\beta = ${beta === 0 ? '0' : sig(beta, 4)}`],
        hide.has('K') ? ['$K$', '?'] : ['$K$ (lab)', texE(K, 4)],
        ['$E_{\\rm total}$', texE(total[0], 4)],
        ['$p_{\\rm total}c$', Math.abs(total[1]) < 1e-9 * total[0] ? '0' : texE(total[1], 4)],
        ['$\\sqrt{s}$', hide.has('mass') ? '?' : texE(S.M, 5)],
        showTh ? ['threshold', `K = ${hide.has('threshold') ? '?' : texE(S.Kth, 4)}`] : null,
        showTh && !hide.has('threshold') ? ['', ok ? '\\text{allowed}' : '\\text{too little energy}'] : null,
      ]);
    }
  }

  F.draw(draw);
  F.caption(P.caption || 'Four-momentum arrows: pc across, E up, both in the same units so light runs at 45°. Each particle’s arrow ends on its own mass hyperbola (dotted); the gold arrow is their sum, and its hyperbola marks √s, the energy available in the centre-of-momentum frame — the same for every observer. Drawn to scale.');
  return { get: (k) => F.params[k] };
}

export function validate(P) {
  const p = [];
  const S = R.SCENARIOS[P.scenario];
  if (!S) p.push(`mp-collide: unknown scenario “${P.scenario}”`);
  if (P.K != null && !(P.K >= 0 && P.K <= 1e8)) p.push('mp-collide: K must lie in 0–10⁸ MeV');
  const fr = S ? R.frameRange(S.mode) : R.FRAME_RANGE;
  if (!(P.frame >= fr[0] && P.frame <= fr[1])) p.push(`mp-collide: frame must lie in ${fr.join('…')} for this scenario`);
  for (const k of P.products || []) if (!(k in R.PARTICLES)) p.push(`mp-collide: unknown particle “${k}”`);
  if (P.range && !(Array.isArray(P.range) && P.range.length === 2 && P.range[0] >= 0 && P.range[1] > P.range[0])) p.push('mp-collide: range must be [Kmin, Kmax]');
  for (const h of P.hide || []) if (!HIDE.includes(h)) p.push(`mp-collide: unknown hide “${h}”`);
  if (Array.isArray(P.controls)) for (const c of P.controls) if (!CONTROLS.includes(c)) p.push(`mp-collide: unknown control “${c}”`);
  return p;
}
