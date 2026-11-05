// Curves in space: arc length, curvature, torsion and the Frenet frame of a
// parametrized curve; and the converse — a curve rebuilt from κ(s), τ(s) by
// integrating the Frenet–Serret equations.

import type { DemoDef, DemoCtx, DemoInstance, Readout } from '../types';
import { parse, Node, compile, derivative, freeSymbols, evaluate, toTeX, toText, NotDifferentiable, Fn } from '../../core/expr';
import { integrate } from '../../core/numeric/quad';
import { curveFrame, frenetSerret, V3, cross3, norm3 } from '../../core/numeric/geometry';
import { fmt, tx, vecTeX, COLORS } from './lib';

type View = NonNullable<DemoCtx['view3d']>;
type Arrow = ReturnType<View['addArrow']>;
type Curve = ReturnType<View['addCurve']>;
type Pt = ReturnType<View['addPoint']>;

const CURVES: Record<string, { label: string; src: string; t: [string, string] }> = {
  helix: { label: 'Helix (cos t, sin t, c t)', src: '(cos(t), sin(t), c t)', t: ['0', '4pi'] },
  trefoil: { label: 'Trefoil knot', src: '((2 + cos(3t)) cos(2t)/1.6, (2 + cos(3t)) sin(2t)/1.6, c sin(3t))', t: ['0', '2pi'] },
  viviani: { label: 'Viviani’s curve (on a sphere)', src: '(1 + cos(t), sin(t), 2 sin(t/2))', t: ['0', '4pi'] },
  cubic: { label: 'Twisted cubic (t, t², c t³)', src: '(t, t^2, c t^3)', t: ['-1.3', '1.3'] },
  planar: { label: 'Planar spiral (τ = 0)', src: '(t cos(t)/4, t sin(t)/4, 0)', t: ['0.3', '4pi'] },
  custom: { label: 'Your curve r(t) — type it below', src: '', t: ['0', '1'] },
};

function parseCurve(ctx: DemoCtx): { comps: Node[]; t0: number; t1: number; src: string } {
  const id = ctx.choices.curve ?? 'helix';
  let src: string, lo: string, hi: string;
  if (id === 'custom') {
    const parts = ctx.input.split(';').map((s) => s.trim());
    src = parts[0].replace(/^\s*r\s*\(\s*t\s*\)\s*=\s*/, '');
    const dom = parts.slice(1).map((p) => /^t\s*(?:in|∈|:|=)\s*\[(.+),(.+)\]$/.exec(p)).find(Boolean);
    [lo, hi] = dom ? [dom[1], dom[2]] : ['0', '2pi'];
  } else ({ src, t: [lo, hi] } = CURVES[id]);
  const n = parse(src);
  if (n.t !== 'tuple' || n.items.length !== 3) throw new Error('Type three components: (x(t), y(t), z(t))');
  const extra = [...freeSymbols(n)].filter((x) => x !== 't' && x !== 'c');
  if (extra.length) throw new Error(`Use only t and the slider c — “${extra[0]}” has no value`);
  const t0 = evaluate(parse(lo)), t1 = evaluate(parse(hi));
  if (!(t1 > t0)) throw new Error('The parameter interval needs lo < hi');
  return { comps: n.items, t0, t1, src };
}

// ═══ Curves: arc length, curvature, torsion ══════════════════════════════════
const curvesDemo: DemoDef = {
  id: 'geometry.curves', module: 'geometry', title: 'Space curves: arc length, curvature, torsion',
  topic: 'Curves · arc length · curvature · torsion · Frenet frame',
  summary: 'A space curve r(t) carries its own moving frame: the unit tangent T, the principal normal N toward the centre of curvature, and the binormal B = T × N. Curvature κ measures how fast T turns; torsion τ how fast the curve twists out of its osculating plane.',
  tex: 's(t) = \\int_{t_0}^{t} |\\mathbf r\'|\\,dt,\\quad \\kappa = \\frac{|\\mathbf r\' \\times \\mathbf r\'\'|}{|\\mathbf r\'|^3},\\quad \\tau = \\frac{(\\mathbf r\'\\times\\mathbf r\'\')\\cdot\\mathbf r\'\'\'}{|\\mathbf r\'\\times\\mathbf r\'\'|^2}',
  view: '3d', animated: true,
  params: [{ key: 'c', label: 'shape c', value: 0.25, min: -1.5, max: 1.5, step: 0.01 }, { key: 'pos', label: 'position along the curve (fraction of the t-range)', value: 0.3, min: 0, max: 1, step: 0.001 }],
  choices: [{ key: 'curve', label: 'Curve', value: 'helix', options: Object.entries(CURVES).map(([k, v]) => [k, v.label] as [string, string]) }, { key: 'beads', label: 'Beads', value: 's', options: [['s', 'equally spaced in arc length s'], ['t', 'equally spaced in the parameter t'], ['none', 'none']] }],
  toggles: [{ key: 'frame', label: 'Frenet frame T, N, B', value: true }, { key: 'osc', label: 'Osculating circle (radius 1/κ)', value: true }, { key: 'comb', label: 'Curvature comb (κN along the curve)', value: false }],
  input: { label: 'r(t) =', value: 'r(t) = (cos(3t), sin(2t), c sin(t)); t in [0, 2pi]', placeholder: '(x(t), y(t), z(t)); t in [lo, hi]' },
  experiments: [
    'Press play: the frame rides along the curve. T turns fastest where κ is large; the frame twists about T where τ is large.',
    'Switch the beads between “arc length” and “parameter”: on the twisted cubic, equal steps in t are very unequal steps along the curve. Arc length is the parametrization the curve itself prefers.',
    'Helix: κ and τ are constant, κ = 1/(1+c²), τ = c/(1+c²). Make c negative — the helix turns left-handed and τ changes sign.',
    'Planar spiral: τ = 0 exactly; B never moves. Turn on the curvature comb: the teeth shrink as the spiral opens up.',
    'Type your own r(t), e.g. a torus knot `(cos(3t)(2 + cos(5t))/2, sin(3t)(2 + cos(5t))/2, sin(5t)/2); t in [0, 2pi]`.',
  ],
  connections: ['geometry.frenet', 'geometry.surfaces', 'geometry.forms'],
  accuracy: 'r′, r″, r‴ are exact symbolic derivatives; κ, τ and the frame follow in floating point. Arc length is adaptive Gauss–Kronrod quadrature (tolerance 1e−10, error shown). Bead positions use a 2000-point trapezoid table of s(t) (numerical, ~1e−6).',
  create: (ctx) => createCurves(ctx),
};

function createCurves(ctx: DemoCtx): DemoInstance {
  const v = ctx.view3d!;
  let curve: Curve | null = null, pt: Pt | null = null, aT: Arrow | null = null, aN: Arrow | null = null, aB: Arrow | null = null, osc: Curve | null = null;
  const beads: Pt[] = [], comb: Curve[] = [];
  let lastKey = '', R: Fn[] = [], D1: Fn[] = [], D2: Fn[] = [], D3: Fn[] = [], t0 = 0, t1 = 1, scale = 1, exact = true, d1n: Node[] = [];
  let sTable: { t: number[]; s: number[] } = { t: [], s: [] };
  const update = () => {
    let parsed;
    try { parsed = parseCurve(ctx); ctx.warn(''); } catch (e) { ctx.warn((e as Error).message); if (!R.length) return; parsed = null; }
    const key = parsed ? `${parsed.src}|${parsed.t0}|${parsed.t1}|${ctx.params.c}` : lastKey;
    if (parsed && key !== lastKey) {
      lastKey = key; t0 = parsed.t0; t1 = parsed.t1;
      const pv = { c: ctx.params.c };
      R = parsed.comps.map((n) => compile(n, ['t'], pv));
      try {
        d1n = parsed.comps.map((n) => derivative(n, 't'));
        const d2 = d1n.map((n) => derivative(n, 't')), d3 = d2.map((n) => derivative(n, 't'));
        D1 = d1n.map((n) => compile(n, ['t'], pv)); D2 = d2.map((n) => compile(n, ['t'], pv)); D3 = d3.map((n) => compile(n, ['t'], pv));
        exact = true;
      } catch (e) {
        if (!(e instanceof NotDifferentiable)) throw e;
        exact = false; d1n = [];
        const h = 1e-4;
        D1 = R.map((f) => (x) => (f([x[0] + h]) - f([x[0] - h])) / (2 * h));
        D2 = R.map((f) => (x) => (f([x[0] + 10 * h]) - 2 * f([x[0]]) + f([x[0] - 10 * h])) / (100 * h * h));
        D3 = D2.map((f) => (x) => (f([x[0] + 10 * h]) - f([x[0] - 10 * h])) / (20 * h));
      }
      // arc-length table
      const n = 2000, T: number[] = [], S: number[] = [];
      let acc = 0, prev = 0;
      for (let i = 0; i <= n; i++) {
        const t = t0 + ((t1 - t0) * i) / n;
        const sp = Math.hypot(D1[0]([t]), D1[1]([t]), D1[2]([t]));
        if (i) acc += ((prev + sp) / 2) * ((t1 - t0) / n);
        prev = sp; T.push(t); S.push(acc);
      }
      sTable = { t: T, s: S };
      const pts: V3[] = [];
      let m = 0.5;
      for (let i = 0; i <= 900; i++) { const t = t0 + ((t1 - t0) * i) / 900; const p = R.map((f) => f([t])) as V3; pts.push(p); if (p.every(Number.isFinite)) m = Math.max(m, ...p.map(Math.abs)); }
      if (Math.abs(m * 1.1 - scale) > 0.2 * scale) { scale = m * 1.1; v.setBounds({ x: [-scale, scale], y: [-scale, scale], z: [-scale, scale] }); v.resetCamera(); }
      if (!curve) curve = v.addCurve(pts, { color: SERIES0, radius: scale * 0.012 }); else curve.set(pts);
    }
    const t = t0 + (t1 - t0) * ctx.params.pos;
    const at = (fs: Fn[], x: number) => fs.map((f) => f([x])) as V3;
    const P = at(R, t), F = curveFrame(at(D1, t), at(D2, t), at(D3, t));
    if (!pt) pt = v.addPoint(P, { color: COLORS.point, size: scale * 0.035 }); else pt.set(P);
    const L = scale * 0.32;
    const mk = (h: Arrow | null, vec: V3, color: string, label: string) => { if (!h) h = v.addArrow(P, vec, { color, label, radius: scale * 0.01 }); else h.set(P, vec); return h; };
    aT = mk(aT, F.T.map((x) => x * L) as V3, COLORS.ru, 'T'); aN = mk(aN, F.N.map((x) => x * L) as V3, COLORS.rv, 'N'); aB = mk(aB, F.B.map((x) => x * L) as V3, COLORS.n, 'B');
    for (const a of [aT, aN, aB]) a.visible(!!ctx.toggles.frame);
    // osculating circle
    const oc: V3[] = [];
    if (F.kappa > 1e-6) { const r = 1 / F.kappa; const C = P.map((x, i) => x + F.N[i] * r); for (let i = 0; i <= 120; i++) { const a = (2 * Math.PI * i) / 120; oc.push(C.map((x, k) => x - F.N[k] * r * Math.cos(a) + F.T[k] * r * Math.sin(a)) as V3); } }
    if (!osc) osc = v.addCurve(oc.length ? oc : [P, P], { color: COLORS.alt, radius: scale * 0.004 }); else osc.set(oc.length ? oc : [P, P]);
    osc.visible(!!ctx.toggles.osc && oc.length > 0 && 1 / F.kappa < scale * 6);
    // beads
    const mode = ctx.choices.beads ?? 's', nb = 24;
    for (let i = 0; i < nb; i++) {
      let tb = t0 + ((t1 - t0) * i) / (nb - 1);
      if (mode === 's') { const target = (sTable.s[sTable.s.length - 1] * i) / (nb - 1); let lo = 0, hi = sTable.s.length - 1; while (hi - lo > 1) { const m = (lo + hi) >> 1; if (sTable.s[m] < target) lo = m; else hi = m; } const f = (target - sTable.s[lo]) / (sTable.s[hi] - sTable.s[lo] || 1); tb = sTable.t[lo] + f * (sTable.t[hi] - sTable.t[lo]); }
      const q = at(R, tb);
      if (!beads[i]) beads.push(v.addPoint(q, { color: COLORS.vec, size: scale * 0.018 })); else beads[i].set(q);
      beads[i].visible(mode !== 'none');
    }
    // curvature comb
    comb.splice(0).forEach((h) => h.dispose());
    if (ctx.toggles.comb) {
      let kmax = 1e-9; const items: [V3, V3][] = [];
      for (let i = 0; i <= 90; i++) { const x = t0 + ((t1 - t0) * i) / 90; const f = curveFrame(at(D1, x), at(D2, x), at(D3, x)); if (Number.isFinite(f.kappa)) { kmax = Math.max(kmax, f.kappa); items.push([at(R, x), f.N.map((y) => y * f.kappa) as V3]); } }
      const k = (scale * 0.5) / kmax;
      const tips = items.map(([p, w]) => p.map((y, j) => y + w[j] * k) as V3);
      comb.push(v.addCurve(tips, { color: COLORS.pink, radius: 0 }));
      for (let i = 0; i < items.length; i += 2) comb.push(v.addCurve([items[i][0], tips[i]], { color: COLORS.pink, radius: 0 }));
    }
    const sNow = integrate((x) => Math.hypot(D1[0]([x]), D1[1]([x]), D1[2]([x])), t0, t, 1e-10);
    const total = integrate((x) => Math.hypot(D1[0]([x]), D1[1]([x]), D1[2]([x])), t0, t1, 1e-10);
    const rows: Readout[] = [
      { label: 't', value: fmt(t, 6) },
      { label: 'r(t)', value: vecTeX(P), tex: true },
      { label: 'speed |r′(t)| = ds/dt', value: fmt(F.speed, 6) },
      { label: 'arc length s(t) from the start', value: `${fmt(sNow.value, 9)} ± ${sNow.error.toExponential(0)}` },
      { label: 'total length', value: `${fmt(total.value, 9)} ± ${total.error.toExponential(0)}`, tone: 'muted' },
      { label: 'curvature κ', value: fmt(F.kappa, 7) },
      { label: 'radius of curvature 1/κ', value: fmt(1 / F.kappa, 6) },
      { label: 'torsion τ', value: fmt(F.tau, 7), tone: Math.abs(F.tau) < 1e-10 ? 'muted' : undefined },
    ];
    if (ctx.choices.curve === 'helix') { const c = ctx.params.c; rows.push({ label: 'exact (helix)', value: `\\kappa = \\tfrac{1}{1+c^2} = ${tx(1 / (1 + c * c), 7)},\\ \\tau = \\tfrac{c}{1+c^2} = ${tx(c / (1 + c * c), 7)}`, tex: true }); }
    if (exact && d1n.length) rows.push({ label: 'r′(t)', value: `\\left(${d1n.map((n) => toTeX(n)).join(',\\ ')}\\right)`, tex: true });
    if (!exact) rows.push({ label: 'derivatives', value: 'numerical (a function without a derivative formula)', tone: 'warn' });
    ctx.setReadouts(rows);
    ctx.setNote(`T is the direction of motion, N points to the centre of the cyan osculating circle (radius $1/\\kappa = ${tx(1 / F.kappa, 4)}$), $B = T\\times N$ is normal to the osculating plane. In physics: a particle on this path has acceleration $\\mathbf a = \\dot v\\,T + \\kappa v^2 N$ — tangential plus centripetal — and never along B. ${Math.abs(F.tau) < 1e-10 ? 'Here τ = 0: the curve stays in one plane.' : `τ = ${tx(F.tau, 4)} ${F.tau > 0 ? '> 0: it twists right-handedly' : '< 0: it twists left-handedly'} out of the osculating plane.`}`);
  };
  let dir = 1;
  return {
    update,
    tick(dt) { let p = ctx.params.pos + dir * dt * 0.06; if (p > 1) { p = 1; dir = -1; } if (p < 0) { p = 0; dir = 1; } ctx.setParam('pos', p); update(); },
    dispose() { v.clear(); },
  };
}
const SERIES0 = '#6aa9ff';

// ═══ Frenet–Serret: the curve from κ(s) and τ(s) ═════════════════════════════
const PRESETS: Record<string, { label: string; k: string; t: string }> = {
  circle: { label: 'Circle: κ = a, τ = 0', k: 'a', t: '0' },
  helix: { label: 'Helix: κ = a, τ = b', k: 'a', t: 'b' },
  euler: { label: 'Euler spiral (clothoid): κ = a s, τ = 0', k: 'a s', t: '0' },
  twist: { label: 'Growing twist: κ = a, τ = b s', k: 'a', t: 'b s' },
  wobble: { label: 'Wobble: κ = a(1 + 0.8 sin 2s), τ = b', k: 'a (1 + 0.8 sin(2 s))', t: 'b' },
  custom: { label: 'Your κ(s), τ(s) — type below', k: '', t: '' },
};

const frenetDemo: DemoDef = {
  id: 'geometry.frenet', module: 'geometry', title: 'Frenet–Serret: a curve from κ(s) and τ(s)',
  topic: 'Frenet–Serret frames · the fundamental theorem of curves · moving frames',
  summary: 'Tell a moving frame how fast to turn (curvature κ) and twist (torsion τ) at each arc length s, and the curve is determined up to a rigid motion. The Frenet–Serret equations are integrated live; the frame rides along.',
  tex: '\\frac{d}{ds}\\begin{pmatrix}T\\\\N\\\\B\\end{pmatrix} = \\begin{pmatrix}0 & \\kappa & 0\\\\ -\\kappa & 0 & \\tau\\\\ 0 & -\\tau & 0\\end{pmatrix}\\begin{pmatrix}T\\\\N\\\\B\\end{pmatrix},\\qquad \\frac{d\\mathbf r}{ds} = T',
  view: '3d', animated: true,
  params: [
    { key: 'a', label: 'a (κ₀)', value: 1, min: 0, max: 3, step: 0.01 },
    { key: 'b', label: 'b (τ₀)', value: 0.3, min: -2, max: 2, step: 0.01 },
    { key: 'L', label: 'length L', value: 14, min: 1, max: 60, step: 0.1 },
    { key: 'pos', label: 'frame at s / L', value: 0.25, min: 0, max: 1, step: 0.001 },
  ],
  choices: [{ key: 'preset', label: 'κ(s), τ(s)', value: 'helix', options: Object.entries(PRESETS).map(([k, v]) => [k, v.label] as [string, string]) }],
  toggles: [{ key: 'frame', label: 'Frenet frame T, N, B', value: true }, { key: 'osc', label: 'Osculating circle', value: true }, { key: 'plane', label: 'Osculating plane (span T, N)', value: false }],
  input: { label: 'κ(s), τ(s) =', value: '(1, 2 sin(s))', placeholder: '(kappa(s), tau(s)) — may use a, b' },
  experiments: [
    'Circle: τ = 0, κ = a gives a circle of radius 1/a. Raise a: the circle tightens.',
    'Helix: constant κ and τ give a helix of radius κ/(κ²+τ²) — the only curves with both constant. Flip the sign of b: it turns left-handed.',
    'Euler spiral: κ grows linearly with s, τ = 0. Railways and roads use it so the steering (κ) changes smoothly; make L long and it winds into a point.',
    'Press play and watch the frame: N always points into the turn, B stays put when τ = 0.',
    'Type κ(s), τ(s) yourself, e.g. `(1, 2 sin(s))` or `(1 + s/5, 0.5)`.',
  ],
  connections: ['geometry.curves', 'geometry.transport', 'geometry.geodesics'],
  accuracy: 'Numerical: adaptive Dormand–Prince 5(4) on the 12-component system (r, T, N, B) with relative tolerance 1e−10. The frame’s loss of orthonormality is reported as the drift — it should stay near 1e−9.',
  tutorial: [
    { text: '**A curve from instructions.** Imagine flying a plane with only two controls: how hard to turn (curvature κ) and how hard to roll (torsion τ). Give κ and τ as functions of distance flown s, and the path is fixed — up to where you started and which way you faced. This is the *fundamental theorem of curves*.\n\nStart with no roll: τ = 0, κ = a constant. You fly in a circle of radius 1/κ.', task: 'Change a and watch the circle’s radius 1/a.', set: { choices: { preset: 'circle' }, params: { a: 1, b: 0, L: 7, pos: 0.2 }, toggles: { frame: true, osc: true, plane: false } }, done: (c) => Math.abs(c.params.a - 1) > 0.3 },
    { text: '**The moving frame.** At each point: T is the unit tangent (direction of travel), N the principal normal (toward the centre of the turn), B = T × N the binormal. They form a right-handed orthonormal frame that rides along the curve.', task: 'Press play and watch the frame travel.', set: { choices: { preset: 'helix' }, params: { a: 1, b: 0.3, L: 20, pos: 0.1 } }, done: (c) => c.time.playing || Math.abs(c.params.pos - 0.1) > 0.05 },
    { text: '**Torsion.** With τ ≠ 0 the frame rotates about T: the curve leaves its osculating plane (span of T, N). Constant κ and τ give a helix — the only curves with both constant — of radius κ/(κ² + τ²) and pitch 2πτ/(κ² + τ²).', task: 'Make the torsion negative (b < 0): the helix becomes left-handed.', set: { choices: { preset: 'helix' }, params: { a: 1, b: 0.3, L: 20 }, toggles: { plane: true } }, done: (c) => c.params.b < -0.1 },
    { text: '**The Frenet–Serret equations** say exactly how the frame turns: T′ = κN, N′ = −κT + τB, B′ = −τN. The matrix is antisymmetric — the frame stays orthonormal — and MathVerse integrates it numerically, reporting the drift.\n\nThe Euler spiral has κ = a·s: the turning grows steadily. Engineers use it for railway and road transitions.', task: 'Choose the Euler spiral and make L longer than 15.', set: { choices: { preset: 'euler' }, params: { a: 0.3, b: 0, L: 8 } }, done: (c) => c.choices.preset === 'euler' && c.params.L > 15 },
    { text: '**Your own curvature and torsion.** Type κ(s), τ(s) as a pair. Try `(1, 2 sin(s))` (torsion that switches sign), or `(1 + 0.5 cos(s), 0.2)`. If κ = 0 somewhere the normal is undefined there — the theorem needs κ > 0.', task: 'Choose “Your κ(s), τ(s)”.', set: { params: { L: 20 } }, done: (c) => c.choices.preset === 'custom' },
    { text: '**Physics.** For a particle on this path at speed v: velocity v T, acceleration v̇ T + κv² N. The acceleration always lies in the osculating plane; B is the axis about which the motion momentarily rotates. In relativity the same idea — a frame transported along a worldline — becomes Fermi–Walker transport.', task: 'Show the osculating plane and play.', set: { choices: { preset: 'wobble' }, params: { a: 1, b: 0.4, L: 25 }, toggles: { plane: true } }, done: (c) => !!c.toggles.plane },
  ],
  create: (ctx) => createFrenet(ctx),
};

function createFrenet(ctx: DemoCtx): DemoInstance {
  const v = ctx.view3d!;
  let curve: Curve | null = null, pt: Pt | null = null, aT: Arrow | null = null, aN: Arrow | null = null, aB: Arrow | null = null, osc: Curve | null = null;
  let plane: ReturnType<View['addPlane']> | null = null;
  let res: ReturnType<typeof frenetSerret> | null = null, key = '', scale = 1, kf: Fn = () => 0, tf: Fn = () => 0;
  const update = () => {
    const pr = PRESETS[ctx.choices.preset ?? 'helix'];
    let ks = pr.k, ts = pr.t;
    if (ctx.choices.preset === 'custom') {
      try {
        const n = parse(ctx.input.replace(/^\s*\(?\s*kappa.*?=\s*/i, ''));
        if (n.t !== 'tuple' || n.items.length !== 2) throw new Error('Type a pair (κ(s), τ(s))');
        const extra = [...freeSymbols(n)].filter((x) => !['s', 'a', 'b'].includes(x));
        if (extra.length) throw new Error(`Use only s and the sliders a, b — “${extra[0]}” has no value`);
        ks = toTextOf(n.items[0]); ts = toTextOf(n.items[1]);
        ctx.warn('');
      } catch (e) { ctx.warn((e as Error).message); ks = 'a'; ts = 'b'; }
    } else ctx.warn('');
    const pv = { a: ctx.params.a, b: ctx.params.b };
    const k2 = `${ks}|${ts}|${pv.a}|${pv.b}|${ctx.params.L}`;
    if (k2 !== key) {
      key = k2;
      kf = compile(parse(ks), ['s'], pv); tf = compile(parse(ts), ['s'], pv);
      res = frenetSerret((s) => kf([s]), (s) => tf([s]), ctx.params.L, { samples: 1500 });
      let m = 0.5; const c = [0, 0, 0];
      for (const p of res.r) { for (let i = 0; i < 3; i++) c[i] += p[i] / res.r.length; }
      for (const p of res.r) m = Math.max(m, ...p.map((x, i) => Math.abs(x - c[i])));
      const sc = m * 1.15;
      if (Math.abs(sc - scale) > 0.15 * scale) { scale = sc; }
      v.setBounds({ x: [c[0] - scale, c[0] + scale], y: [c[1] - scale, c[1] + scale], z: [c[2] - scale, c[2] + scale] });
      if (!curve) { curve = v.addCurve(res.r, { color: '#6aa9ff', radius: scale * 0.012 }); v.resetCamera(); } else curve.set(res.r);
    }
    if (!res) return;
    const sNow = ctx.params.L * ctx.params.pos;
    let i = 0; while (i < res.s.length - 1 && res.s[i + 1] < sNow) i++;
    const j = Math.min(i + 1, res.s.length - 1), f = res.s[j] > res.s[i] ? (sNow - res.s[i]) / (res.s[j] - res.s[i]) : 0;
    const lerp = (A: V3[]): V3 => A[i].map((x, k) => x + f * (A[j][k] - x)) as V3;
    const P = lerp(res.r), T = lerp(res.T), N = lerp(res.N), B = cross3(T, N);
    if (!pt) pt = v.addPoint(P, { color: COLORS.point, size: scale * 0.03 }); else pt.set(P);
    const L = scale * 0.3;
    const mk = (h: Arrow | null, vec: V3, color: string, label: string) => { if (!h) h = v.addArrow(P, vec, { color, label, radius: scale * 0.009 }); else h.set(P, vec); return h; };
    aT = mk(aT, T.map((x) => x * L) as V3, COLORS.ru, 'T'); aN = mk(aN, N.map((x) => x * L) as V3, COLORS.rv, 'N'); aB = mk(aB, B.map((x) => x * L) as V3, COLORS.n, 'B');
    for (const a of [aT, aN, aB]) a.visible(!!ctx.toggles.frame);
    const kap = kf([sNow]), tau = tf([sNow]);
    const oc: V3[] = [];
    if (kap > 1e-6 && 1 / kap < scale * 5) { const r = 1 / kap; const C = P.map((x, k) => x + N[k] * r); for (let q = 0; q <= 120; q++) { const a = (2 * Math.PI * q) / 120; oc.push(C.map((x, k) => x - N[k] * r * Math.cos(a) + T[k] * r * Math.sin(a)) as V3); } }
    if (!osc) osc = v.addCurve(oc.length ? oc : [P, P], { color: COLORS.alt, radius: scale * 0.004 }); else osc.set(oc.length ? oc : [P, P]);
    osc.visible(!!ctx.toggles.osc && oc.length > 0);
    if (!plane) plane = v.addPlane(P, B, scale * 0.9, { color: COLORS.plane, opacity: 0.3 }); else plane.set(P, B);
    plane.visible(!!ctx.toggles.plane);
    const end = res.r[res.r.length - 1];
    const rows: Readout[] = [
      { label: 'κ(s), τ(s)', value: `\\kappa(s) = ${toTeX(parse(ks))},\\quad \\tau(s) = ${toTeX(parse(ts))}`, tex: true },
      { label: 's', value: fmt(sNow, 5) },
      { label: 'κ(s), τ(s) here', value: `${fmt(kap, 6)}, ${fmt(tau, 6)}`, tone: kap < 0 ? 'warn' : undefined },
      { label: 'T, N, B', value: `T = ${vecTeX(T)}`, tex: true },
      { label: 'end point r(L)', value: vecTeX(end), tex: true, tone: 'muted' },
      { label: 'frame drift (orthonormality error)', value: `${res.orthoDrift.toExponential(1)} (numerical)`, tone: res.orthoDrift < 1e-6 ? 'good' : 'warn' },
    ];
    const c0 = ctx.choices.preset;
    if (c0 === 'helix' || c0 === 'circle') { const a = ctx.params.a, b = c0 === 'circle' ? 0 : ctx.params.b, w = a * a + b * b; if (w > 0) rows.push({ label: 'exact radius κ/(κ²+τ²), rise per turn 2πτ/(κ²+τ²)', value: `${fmt(a / w, 6)},  ${fmt((2 * Math.PI * b) / w, 6)}` }); }
    ctx.setReadouts(rows);
    if (!res.ok) ctx.warn(res.warning ?? 'The integration stopped early');
    else if (kap < 0) ctx.warn('κ < 0 here. Curvature in the Frenet sense is ≥ 0; a negative value just flips N (and B). The picture is still the solution of the equations.');
    ctx.setNote(`Integrating $T' = \\kappa N,\\ N' = -\\kappa T + \\tau B,\\ B' = -\\tau N,\\ \\mathbf r' = T$ from $T = \\mathbf e_x, N = \\mathbf e_y$ at the origin. The skew-symmetric matrix keeps the frame orthonormal; the solution is unique, so κ and τ determine the curve up to a rigid motion. Total length $L = ${tx(ctx.params.L, 4)}$; straight-line distance start→end $${tx(norm3(end), 5)}$.`);
  };
  let dir = 1;
  return {
    update,
    tick(dt) { let p = ctx.params.pos + (dir * dt * 2) / Math.max(4, ctx.params.L); if (p > 1) { p = 1; dir = -1; } if (p < 0) { p = 0; dir = 1; } ctx.setParam('pos', p); update(); },
    dispose() { v.clear(); },
  };
}

const toTextOf = (n: Node) => toText(n);

export const curveDemos: DemoDef[] = [curvesDemo, frenetDemo];
