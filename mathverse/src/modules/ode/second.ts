// Second-order linear equations with constant coefficients: the characteristic
// equation and its roots in the complex plane (drag them), and the
// nonhomogeneous equation y = y_h + y_p by undetermined coefficients.

import type { DemoDef, DemoCtx, DemoInstance, Readout, StepRow } from '../types';
import { homog2, homog2TeX, charRoots, dampingKind, solveLinear2, forcingFn, Forcing } from '../../core/numeric/dynamics';
import { solveAdaptive } from '../../core/numeric/ode';
import { fmt, tx, pal, csvOf, P, label, fitView, range, changed, fmtRoot, texRoot, seriesOf } from './common';

const toneOf = (kind: string): Readout['tone'] => (kind.startsWith('under') ? 'good' : kind.startsWith('crit') ? 'warn' : kind.startsWith('over') ? undefined : kind === 'undamped' ? 'muted' : 'bad');

// ── characteristic roots ──────────────────────────────────────────────────
export const charroots: DemoDef = {
  id: 'ode.charroots', module: 'ode', title: 'Characteristic roots and solution types',
  topic: 'Second-order equations · characteristic equation · over-, critically and under-damped',
  summary: 'Trying y = e^(rt) in y″ + by′ + cy = 0 gives r² + br + c = 0. Where its two roots sit in the complex plane decides everything: decay or growth (the real part), oscillation (the imaginary part).',
  tex: "y'' + b\\,y' + c\\,y = 0 \\;\\Rightarrow\\; r^2 + b\\,r + c = 0",
  view: 'split2d',
  params: [
    { key: 'b', label: 'b (damping)', value: 1, min: -2, max: 6, step: 0.01 },
    { key: 'c', label: 'c (stiffness)', value: 4, min: -4, max: 12, step: 0.01 },
    { key: 'y0', label: 'y(0)', value: 1, min: -3, max: 3, step: 0.01 },
    { key: 'v0', label: "y′(0)", value: 0, min: -6, max: 6, step: 0.01 },
    { key: 'T', label: 'time span T', value: 12, min: 2, max: 30, step: 0.1 },
  ],
  toggles: [{ key: 'locus', label: 'Root locus as b varies (c fixed)', value: true }, { key: 'envelope', label: 'Envelope ±M·e^(αt)', value: true }, { key: 'basis', label: 'Basis solutions', value: false }],
  experiments: [
    'Drag the upper root straight down onto the real axis: the oscillation slows and stops exactly when the roots collide — critical damping.',
    'Keep dragging along the real axis to pull the roots apart: overdamped, two pure exponentials.',
    'Drag a root into the right half-plane: the solution grows. Stability is “every root has negative real part”.',
    'Follow the root locus: increasing b at fixed c moves the pair around a circle of radius √c, then splits it along the real axis.',
    'Make c negative: one root is positive whatever b is — a saddle, like a pencil balanced on its tip.',
  ],
  connections: ['ode.spring', 'ode.nonhomog', 'ode.phase', 'ode.resonance'],
  accuracy: 'Exact. Roots by the quadratic formula; the solution is the closed form e^(αt)[y₀C(t) + (y′₀ − αy₀)S(t)], which is the over-, critically or under-damped formula and stays accurate as the roots collide (no division by r₁ − r₂).',
  create: (ctx) => charInst(ctx),
};

function charInst(ctx: DemoCtx): DemoInstance {
  const plot = ctx.plot!, cp = ctx.plot2!;
  plot.opts.xLabel = 't'; plot.opts.yLabel = 'y';
  cp.opts.equal = true; cp.opts.xLabel = 'Re r'; cp.opts.yLabel = 'Im r';
  cp.setView({ x0: -5, x1: 2.5, y0: -4, y1: 4 });
  const reframe = changed();
  let sol: (t: number) => number = () => 0;

  const setBC = (b: number, c: number) => { ctx.setParam('b', clamp(b, -2, 6)); ctx.setParam('c', clamp(c, -4, 12)); update(); };

  function update() {
    const { b, c, y0, v0, T } = ctx.params;
    const P = pal(ctx), S = seriesOf(P);
    const H = homog2(b, c, y0, v0);
    sol = H.y;
    const roots = charRoots(b, c), kind = dampingKind(b, c);
    const al = -b / 2, q = (b * b) / 4 - c;
    const pts = Array.from({ length: 801 }, (_, i) => { const t = (T * i) / 800; return [t, H.y(t)] as P; });
    const [lo, hi] = range(pts.map((p) => p[1]), 1e6);
    if (reframe(`${T}`)) plot.setView(fitView([0, T], [Math.min(lo, -1.5), Math.max(hi, 1.5)], 0.08));
    const M = q < 0 ? Math.hypot(y0, (v0 - al * y0) / Math.sqrt(-q)) : 0;
    const dt = T * 0.12;
    plot.setDraw((g) => {
      if (ctx.toggles.basis) {
        const b1 = homog2(b, c, 1, 0).y, b2 = homog2(b, c, 0, 1).y;
        g.fn(b1, { color: S[3], width: 1.4, dash: [5, 4] }, [0, T]); g.fn(b2, { color: S[4], width: 1.4, dash: [5, 4] }, [0, T]);
      }
      if (ctx.toggles.envelope && q < 0) { g.fn((t) => M * Math.exp(al * t), { color: P.muted, width: 1.3, dash: [3, 4] }, [0, T]); g.fn((t) => -M * Math.exp(al * t), { color: P.muted, width: 1.3, dash: [3, 4] }, [0, T]); }
      g.path(pts, { color: P.blue, width: 3 });
      g.line([0, y0], [dt, y0 + v0 * dt], { color: P.orange, width: 2.2 });
      g.handle({ id: 'y0', at: [0, y0], color: P.gold, label: 'y(0)', constrain: ([, y]) => [0, y], onDrag: ([, y]) => { ctx.setParam('y0', clamp(y, -3, 3)); update(); } });
      g.handle({ id: 'v0', at: [dt, y0 + v0 * dt], r: 6, color: P.orange, label: "drag: slope y′(0)", constrain: ([, y]) => [dt, y], onDrag: ([, y]) => { ctx.setParam('v0', clamp((y - y0) / dt, -6, 6)); update(); } });
    });
    cp.setDraw((g) => {
      const v = g.view;
      g.polygon([[v.x0, v.y0], [0, v.y0], [0, v.y1], [v.x0, v.y1]], { fill: P.fill(P.green, 0.06) });
      g.polygon([[0, v.y0], [v.x1, v.y0], [v.x1, v.y1], [0, v.y1]], { fill: P.fill(P.red, 0.07) });
      label(g, [v.x0 + 0.15, v.y0 + 0.3], 'decaying (Re r < 0)', P.green, { size: 11 });
      label(g, [v.x1 - 0.15, v.y0 + 0.3], 'growing', P.red, { size: 11, align: 'right' });
      if (c > 0) g.parametric((s) => Math.sqrt(c) * Math.cos(s), (s) => Math.sqrt(c) * Math.sin(s), 0, 2 * Math.PI, { color: P.muted, width: 1, dash: [4, 4] }, 200);
      if (ctx.toggles.locus) {
        const up: P[] = [], dn: P[] = [];
        for (let i = 0; i <= 400; i++) {
          const bb = -2 + (8 * i) / 400, r = charRoots(bb, c);
          up.push([r[0].re, r[0].im]); dn.push([r[1].re, r[1].im]);
        }
        g.path(up, { color: P.violet, width: 1.6, alpha: 0.6 }); g.path(dn, { color: P.violet, width: 1.6, alpha: 0.6 });
        label(g, [v.x0 + 0.15, v.y1 - 0.35], 'violet: the roots as b runs over [−2, 6]', P.violet, { size: 11 });
      }
      const snap = (v.y1 - v.y0) * 0.03;
      if (q < 0) {
        g.point([roots[1].re, roots[1].im], 6, { fill: P.gold, alpha: 0.55 });
        g.handle({ id: 'r1', at: [roots[0].re, roots[0].im], color: P.gold, label: `r = ${fmtRoot(roots[0], 3)}`, onDrag: ([x, y]) => Math.abs(y) < snap ? setBC(-2 * x, x * x) : setBC(-2 * x, x * x + y * y) });
      } else {
        const [r1, r2] = [roots[0].re, roots[1].re];
        g.handle({ id: 'r1', at: [r1, 0], color: P.gold, label: `r₁ = ${fmt(r1, 3)}`, onDrag: ([x, y]) => Math.abs(y) > snap ? setBC(-2 * x, x * x + y * y) : setBC(-(x + r2), x * r2) });
        g.handle({ id: 'r2', at: [r2, 0], color: P.cyan, label: `r₂ = ${fmt(r2, 3)}`, onDrag: ([x, y]) => Math.abs(y) > snap ? setBC(-2 * x, x * x + y * y) : setBC(-(x + r1), x * r1) });
      }
    });
    const rows: Readout[] = [
      { label: 'characteristic equation', value: `r^2 ${b < 0 ? '-' : '+'} ${tx(Math.abs(b))}\\,r ${c < 0 ? '-' : '+'} ${tx(Math.abs(c))} = 0`, tex: true },
      { label: 'roots', value: q < 0 ? `${fmtRoot(roots[0])},  ${fmtRoot(roots[1])}` : `${fmt(roots[0].re)},  ${fmt(roots[1].re)}` },
      { label: 'discriminant b² − 4c', value: fmt(b * b - 4 * c) },
      { label: 'solution type', value: kind, tone: toneOf(kind) },
    ];
    if (c > 0) rows.push({ label: 'natural frequency ω₀ = √c', value: fmt(Math.sqrt(c)) }, { label: 'damping ratio ζ = b / (2√c)', value: fmt(b / (2 * Math.sqrt(c))) });
    if (q < 0) rows.push({ label: 'damped frequency ω_d = √(c − b²/4)', value: fmt(Math.sqrt(-q)) });
    rows.push({ label: 'solution', value: homog2TeX(b, c, y0, v0), tex: true });
    ctx.setReadouts(rows);
    ctx.setSteps([
      { title: 'Try an exponential', tex: `y = e^{rt}\\;\\Rightarrow\\; (r^2 + ${tx(b)}r + ${tx(c)})\\,e^{rt} = 0` },
      { title: 'Characteristic roots', tex: `r = \\frac{-b \\pm \\sqrt{b^2 - 4c}}{2} = ${texRoot(roots[0])},\\; ${texRoot(roots[1])}` },
      { title: q > 0 ? 'Two real roots: two exponentials' : q < 0 ? 'Complex pair α ± iβ: by Euler’s formula, an oscillation in an envelope' : 'A double root: the second solution is t e^{rt}', tex: q > 0 ? 'y = C_1 e^{r_1 t} + C_2 e^{r_2 t}' : q < 0 ? 'y = e^{\\alpha t}(C_1\\cos\\beta t + C_2 \\sin \\beta t)' : 'y = (C_1 + C_2 t)\\,e^{rt}' },
      { title: 'Fit y(0) and y′(0)', tex: homog2TeX(b, c, y0, v0) },
    ]);
    ctx.setNote(`**${kind[0].toUpperCase() + kind.slice(1)}.** Drag the roots on the right (or the initial value and slope on the left). The same equation describes a mass on a spring ($b = c_d/m$, $c = k/m$) and an RLC circuit ($b = R/L$, $c = 1/LC$): it is the reason a radio tunes and a car's suspension stops bouncing.`);
  }
  return {
    update,
    csv() { const T = ctx.params.T; return csvOf(['t', 'y (exact)'], Array.from({ length: 501 }, (_, i) => { const t = (T * i) / 500; return [t, sol(t)]; })); },
    dispose() {},
  };
}

// ── nonhomogeneous equations ──────────────────────────────────────────────
const FORCINGS: [string, string][] = [['cos', 'g = A cos ωt'], ['exp', 'g = A e^(at)'], ['const', 'g = A (constant)'], ['lin', 'g = A t (ramp)']];

export const nonhomog: DemoDef = {
  id: 'ode.nonhomog', module: 'ode', title: 'Homogeneous and nonhomogeneous equations',
  topic: 'Second-order equations · superposition · undetermined coefficients · y = y_h + y_p',
  summary: 'Every solution of a linear nonhomogeneous equation is one particular solution plus a solution of the homogeneous equation. The initial conditions only choose the homogeneous part.',
  tex: "y'' + b\\,y' + c\\,y = g(t),\\qquad y = y_h + y_p",
  view: '2d',
  params: [
    { key: 'b', label: 'b (damping)', value: 0.6, min: -1, max: 5, step: 0.01 },
    { key: 'c', label: 'c (stiffness)', value: 4, min: -2, max: 12, step: 0.01 },
    { key: 'A', label: 'forcing amplitude A', value: 2, min: -4, max: 4, step: 0.01 },
    { key: 'w', label: 'ω or a in g(t)', value: 1.2, min: -2, max: 5, step: 0.01 },
    { key: 'y0', label: 'y(0)', value: 1.5, min: -3, max: 3, step: 0.01 },
    { key: 'v0', label: "y′(0)", value: 0, min: -5, max: 5, step: 0.01 },
    { key: 'T', label: 'time span T', value: 20, min: 2, max: 40, step: 0.1 },
  ],
  choices: [{ key: 'g', label: 'Forcing g(t)', value: 'cos', options: FORCINGS }],
  toggles: [{ key: 'parts', label: 'Show y_h and y_p separately', value: true }, { key: 'family', label: 'Other initial conditions', value: true }, { key: 'numeric', label: 'Numerical check (DP45 dots)', value: false }],
  experiments: [
    'With damping, all the faint solutions (other initial conditions) merge onto y_p: the transient y_h decays and the steady state is the same for everyone.',
    'Set b = 0 and ω = √c (e.g. c = 4, ω = 2): resonance. The trial solution must be multiplied by t and the amplitude grows linearly — see the Steps tab.',
    'Choose g = A e^{at} and make a equal to a characteristic root (b = 3, c = 2, a = −1): the guess K e^{at} fails and K t e^{at} works.',
    'Drag y(0): only the homogeneous part (dashed) changes; y_p does not care about initial conditions.',
  ],
  connections: ['ode.charroots', 'ode.resonance', 'ode.linear1', 'ode.spring'],
  accuracy: 'Exact: y_p by undetermined coefficients (including the resonant t- and t²-multiplied cases), y_h by the closed form. The optional dots are an independent Dormand–Prince solution, and the readout gives the largest difference.',
  create: (ctx) => nonhomogInst(ctx),
};

function nonhomogInst(ctx: DemoCtx): DemoInstance {
  const plot = ctx.plot!;
  plot.opts.xLabel = 't'; plot.opts.yLabel = 'y';
  const reframe = changed();
  let full: (t: number) => number = () => 0, yp: (t: number) => number = () => 0, yh: (t: number) => number = () => 0;

  function update() {
    const { b, c, A, w, y0, v0, T } = ctx.params;
    const kind = ctx.choices.g ?? 'cos';
    const g: Forcing = kind === 'cos' ? { kind: 'cos', A, w: Math.abs(w) } : kind === 'exp' ? { kind: 'exp', A, a: w } : kind === 'const' ? { kind: 'const', A } : { kind: 'lin', A };
    const s = solveLinear2(b, c, g, y0, v0);
    full = s.y; yp = s.yp; yh = s.yh;
    const p = s.particular, P = pal(ctx), G = forcingFn(g);
    const n = 800, pts = Array.from({ length: n + 1 }, (_, i) => { const t = (T * i) / n; return [t, s.y(t)] as P; });
    const [lo, hi] = range(pts.map((q) => q[1]), 1e6);
    if (reframe(`${kind}|${T}`)) plot.setView(fitView([0, T], [Math.min(lo, -1.5), Math.max(hi, 1.5)], 0.08));
    let num: P[] = [], numErr = NaN;
    if (ctx.toggles.numeric) {
      const tr = solveAdaptive((t, y) => [y[1], G(t) - b * y[1] - c * y[0]], [y0, v0], 0, T, { rtol: 1e-10, atol: 1e-12, maxStep: T / 80 });
      num = tr.t.map((t, i) => [t, tr.y[i][0]] as P);
      numErr = Math.max(...tr.t.map((t, i) => Math.abs(tr.y[i][0] - s.y(t)) / Math.max(1, Math.abs(s.y(t)))));
    }
    const fam = ctx.toggles.family ? [-2, -1, 1, 2].map((d) => { const o = solveLinear2(b, c, g, y0 + d * 0.8, v0 - d * 0.6); return Array.from({ length: 401 }, (_, i) => { const t = (T * i) / 400; return [t, o.y(t)] as P; }); }) : [];
    plot.setDraw((gr) => {
      for (const f of fam) gr.path(f, { color: P.faint, width: 1.3 });
      if (ctx.toggles.parts) {
        gr.fn(s.yh, { color: P.violet, width: 1.8, dash: [7, 5] }, [0, T]);
        gr.fn(s.yp, { color: P.green, width: 2, dash: [2, 4] }, [0, T]);
      }
      gr.path(pts, { color: P.blue, width: 3 });
      if (num.length) for (let i = 0; i < num.length; i += Math.max(1, Math.floor(num.length / 60))) gr.point(num[i], 2.8, { fill: P.gold });
      const x = gr.view.x0 + (gr.view.x1 - gr.view.x0) * 0.62, y = gr.view.y1 - (gr.view.y1 - gr.view.y0) * 0.05, dy = (gr.view.y1 - gr.view.y0) * 0.05;
      label(gr, [x, y], 'y = y_h + y_p', P.blue, { bold: true });
      if (ctx.toggles.parts) { label(gr, [x, y - dy], 'y_h  (homogeneous: carries the initial conditions)', P.violet); label(gr, [x, y - 2 * dy], 'y_p  (particular: the response to g)', P.green); }
      gr.handle({ id: 'y0', at: [0, y0], color: P.gold, label: 'y(0)', constrain: ([, yy]) => [0, yy], onDrag: ([, yy]) => { ctx.setParam('y0', clamp(yy, -3, 3)); update(); } });
    });
    const roots = charRoots(b, c);
    const gTeX = kind === 'cos' ? `${tx(A)}\\cos ${tx(Math.abs(w))}t` : kind === 'exp' ? `${tx(A)}\\,e^{${tx(w)}t}` : kind === 'const' ? tx(A) : `${tx(A)}\\,t`;
    const rows: Readout[] = [
      { label: 'equation', value: `y'' + ${tx(b)}y' + ${tx(c)}y = ${gTeX}`, tex: true },
      { label: 'characteristic roots', value: `${fmtRoot(roots[0])},  ${fmtRoot(roots[1])}` },
      { label: 'particular solution', value: p.tex, tex: true },
      { label: 'resonance', value: p.resonance ? `yes — the forcing solves the homogeneous equation; trial × t${p.resonance === 2 ? '²' : ''}` : 'no', tone: p.resonance ? 'warn' : 'good' },
      { label: 'homogeneous part', value: homog2TeX(b, c, y0 - p.yp(0), v0 - p.dyp(0)).replace(/^y =/, 'y_h ='), tex: true },
    ];
    if (Number.isFinite(numErr)) rows.push({ label: 'max |exact − DP45| (relative)', value: fmt(numErr, 2), tone: numErr < 1e-6 ? 'good' : 'warn' });
    ctx.setReadouts(rows);
    const steps: StepRow[] = [
      { title: 'Solve the homogeneous equation first', tex: `r^2 + ${tx(b)}r + ${tx(c)} = 0 \\Rightarrow r = ${texRoot(roots[0])},\\; ${texRoot(roots[1])}` },
      { title: 'Trial solution shaped like g', tex: p.guess, detail: p.resonance ? 'The natural guess already solves the homogeneous equation (it would give 0 = g), so multiply by t' + (p.resonance === 2 ? ' twice' : '') + '.' : 'g is not a homogeneous solution, so the plain guess works.' },
      { title: 'Substitute and match coefficients', tex: p.tex },
      { title: 'Add the homogeneous solution and fit y(0), y′(0)', tex: homog2TeX(b, c, y0 - p.yp(0), v0 - p.dyp(0)).replace(/^y =/, 'y_h =') },
      { title: 'Superposition', tex: 'y = y_h + y_p', detail: 'The difference of any two solutions solves the homogeneous equation; that is why the general solution is “one particular solution + all homogeneous ones”.' },
    ];
    ctx.setSteps(steps);
    ctx.warn(p.resonance && b <= 0 ? 'Resonance with no damping: the response grows without bound (linearly for a cosine forcing).' : '');
    ctx.setNote(b > 0 && c > 0 ? 'With positive damping the homogeneous part decays, so every solution (faint) converges to the same **steady state** $y_p$: the system forgets its initial conditions but not its forcing.' : 'Without damping the homogeneous part never decays: the initial conditions are remembered forever.');
  }
  return {
    update,
    csv() { const T = ctx.params.T; return csvOf(['t', 'y', 'y_h', 'y_p'], Array.from({ length: 801 }, (_, i) => { const t = (T * i) / 800; return [t, full(t), yh(t), yp(t)]; })); },
    dispose() {},
  };
}

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
