// Initial value problems: when a solution exists, when it is unique, and when
// it is not — y′ = √|y| branches off zero at any moment you like; y′ = 1 + y²
// is smooth yet escapes to infinity; a Lipschitz equation has exactly one
// solution, which Picard's iteration constructs.

import type { DemoDef, DemoCtx, DemoInstance, Readout } from '../types';
import { solveAdaptive, Trajectory } from '../../core/numeric/ode';
import { fmt, pal, csvOf, P, drawRuns, label, seriesOf } from './common';

type Eq = 'sqrt' | 'cbrt' | 'tan' | 'lip';

const F: Record<Eq, (t: number, y: number) => number> = {
  sqrt: (_t, y) => Math.sqrt(Math.abs(y)),
  cbrt: (_t, y) => 3 * Math.cbrt(y) ** 2,
  tan: (_t, y) => 1 + y * y,
  lip: (t, y) => -y + Math.sin(t),
};
const DFDY: Record<Eq, (t: number, y: number) => number> = {
  sqrt: (_t, y) => (y === 0 ? Infinity : Math.sign(y) / (2 * Math.sqrt(Math.abs(y)))),
  cbrt: (_t, y) => (y === 0 ? Infinity : 2 / Math.cbrt(y)),
  tan: (_t, y) => 2 * y,
  lip: () => -1,
};
// the branching profile g with y = g(t − c) leaving zero, and its inverse
const G = { sqrt: (s: number) => (s * s) / 4, cbrt: (s: number) => s * s * s };
const GINV = { sqrt: (y: number) => 2 * Math.sqrt(y), cbrt: (y: number) => Math.cbrt(y) };

export const ivp: DemoDef = {
  id: 'ode.ivp', module: 'ode', title: 'Existence and uniqueness of solutions',
  topic: 'Initial value problems · Picard–Lindelöf · non-uniqueness · blow-up · Picard iteration',
  summary: 'If f and ∂f/∂y are continuous near (t₀, y₀), exactly one solution passes through that point (Picard–Lindelöf). Here the hypothesis fails and solutions branch, or holds and the solution still escapes to infinity.',
  tex: "|f(t,y_1) - f(t,y_2)| \\le L\\,|y_1 - y_2|",
  view: '2d',
  params: [
    { key: 't0', label: 'initial time t₀', value: 0, min: -4, max: 5, step: 0.01 },
    { key: 'y0', label: 'initial value y₀', value: 0, min: -3, max: 3.5, step: 0.01 },
    { key: 'c', label: 'leaves zero (forward) at t =', value: 1.5, min: -4, max: 6, step: 0.01 },
    { key: 'cb', label: 'arrives at zero (backward) from t =', value: -2, min: -4, max: 6, step: 0.01 },
    { key: 'iters', label: 'Picard iterations', value: 3, min: 0, max: 10, step: 1 },
  ],
  choices: [{ key: 'eq', label: 'Equation', value: 'sqrt', options: [['sqrt', "y′ = √|y|  (not Lipschitz at 0)"], ['cbrt', "y′ = 3|y|^(2/3)  (not Lipschitz at 0)"], ['tan', "y′ = 1 + y²  (smooth, blows up)"], ['lip', "y′ = −y + sin t  (globally Lipschitz)"]] }],
  toggles: [{ key: 'family', label: 'Other solutions through the same point', value: true }, { key: 'numeric', label: 'What a numerical solver returns', value: true }, { key: 'picard', label: 'Picard iterates', value: false }],
  experiments: [
    'With y′ = √|y| and y₀ = 0, drag the green handle: the solution may sit at zero for as long as you like, then leave. Every choice solves the same initial value problem.',
    'Note what the numerical solver (gold, dashed) does at y₀ = 0: it silently returns y ≡ 0, one of infinitely many answers.',
    'Lift y₀ above 0: forward in time the solution is now unique, but backward it reaches zero and branches again.',
    'Switch to y′ = 1 + y²: f is smooth everywhere, yet the solution tan(t + C) exists only on an interval of length π.',
    'Turn on Picard iterates with the Lipschitz equation and raise the count: the iterates converge to the solution — this is the existence proof, run live.',
  ],
  connections: ['ode.slopefield', 'ode.separable', 'ode.euler'],
  accuracy: 'Branching solutions and tan are exact closed forms. The gold dashed curve is Dormand–Prince 5(4). Picard iterates are computed on a 1200-point grid with the trapezoid rule (error ≈ 10⁻⁶, numerical).',
  create: (ctx) => ivpInst(ctx),
};

function ivpInst(ctx: DemoCtx): DemoInstance {
  const plot = ctx.plot!;
  plot.opts.xLabel = 't'; plot.opts.yLabel = 'y';
  plot.setView({ x0: -4.2, x1: 6.2, y0: -3, y1: 4 });
  let sel: (t: number) => number = () => 0;

  function update() {
    const eq = (ctx.choices.eq ?? 'sqrt') as Eq;
    const f = F[eq], c = pal(ctx), S = seriesOf(c);
    const { t0 } = ctx.params;
    let y0 = ctx.params.y0;
    const nonLip = eq === 'sqrt' || eq === 'cbrt';
    if (nonLip && Math.abs(y0) < 0.04 && y0 !== 0) { y0 = 0; ctx.setParam('y0', 0); }
    const v = plot.view;
    const rows: Readout[] = [];
    const curves: { pts: P[]; color: string; width: number; dash?: number[] }[] = [];
    const handles: { id: string; at: P; color: string; label: string; key: 'c' | 'cb'; min: number; max: number }[] = [];
    const vlines: number[] = [];
    let uniqueOn = '';
    const sampleT = (fn: (t: number) => number, a = v.x0, b = v.x1, n = 600) => Array.from({ length: n + 1 }, (_, i) => { const t = a + ((b - a) * i) / n; return [t, fn(t)] as P; });

    if (nonLip) {
      const g = G[eq], gi = GINV[eq];
      let cF: number, cB: number, freeF = false, freeB = false;
      if (y0 > 0) { cF = t0 - gi(y0); cB = Math.min(ctx.params.cb, cF); freeB = true; uniqueOn = `(${fmt(cF, 3)}, ∞): forward unique, backward branches before t = ${fmt(cF, 3)}`; }
      else if (y0 < 0) { cB = t0 + gi(-y0); cF = Math.max(ctx.params.c, cB); freeF = true; uniqueOn = `(−∞, ${fmt(cB, 3)}): backward unique, forward branches after t = ${fmt(cB, 3)}`; }
      else { cF = Math.max(ctx.params.c, t0); cB = Math.min(ctx.params.cb, t0); freeF = freeB = true; uniqueOn = 'nowhere — branches immediately in both directions'; }
      const sol = (cf: number, cb: number) => (t: number) => (t >= cf ? g(t - cf) : t <= cb ? -g(cb - t) : 0);
      sel = sol(cF, cB);
      if (ctx.toggles.family) {
        for (let i = 0; i < 7; i++) {
          const cf = freeF ? (y0 < 0 ? cB : t0) + i * 0.75 : cF;
          const cb = freeB ? (y0 > 0 ? cF : t0) - i * 0.75 : cB;
          curves.push({ pts: sampleT(sol(cf, cb)), color: c.muted, width: 1.4 });
        }
      }
      curves.push({ pts: sampleT(sel), color: c.blue, width: 3.2 });
      if (freeF) handles.push({ id: 'c', at: [cF, 0], color: c.green, label: 'leaves 0', key: 'c', min: y0 < 0 ? cB : t0, max: 6 });
      if (freeB) handles.push({ id: 'cb', at: [cB, 0], color: c.violet, label: 'arrives at 0', key: 'cb', min: -4, max: y0 > 0 ? cF : t0 });
      const d = DFDY[eq](t0, y0);
      rows.push(
        { label: 'f(t₀, y₀)', value: fmt(f(t0, y0)) },
        { label: '∂f/∂y at (t₀, y₀)', value: Number.isFinite(d) ? fmt(d) : '∞ (unbounded near y = 0)', tone: Number.isFinite(d) ? undefined : 'bad' },
        { label: 'Lipschitz in y near y₀?', value: y0 === 0 ? 'no — uniqueness can fail' : 'yes, locally (but not near y = 0)', tone: y0 === 0 ? 'bad' : 'warn' },
        { label: 'solution unique on', value: uniqueOn },
        { label: 'this solution', value: `0 on [${fmt(cB, 3)}, ${fmt(cF, 3)}], ${eq === 'sqrt' ? '(t − c)²/4' : '(t − c)³'} after` },
      );
    } else if (eq === 'tan') {
      const C = Math.atan(y0) - t0, a = -Math.PI / 2 - C, b = Math.PI / 2 - C;
      sel = (t) => (t > a && t < b ? Math.tan(t + C) : NaN);
      if (ctx.toggles.family) for (let i = -3; i <= 3; i++) { const Ci = C + i * 0.45; if (i) curves.push({ pts: sampleT((t) => Math.tan(t + Ci), v.x0, v.x1, 1200), color: c.muted, width: 1.4 }); }
      curves.push({ pts: sampleT(sel, Math.max(v.x0, a + 1e-3), Math.min(v.x1, b - 1e-3), 1200), color: c.blue, width: 3.2 });
      vlines.push(a, b);
      rows.push(
        { label: 'f and ∂f/∂y = 2y', value: 'continuous everywhere', tone: 'good' },
        { label: 'solution', value: `y = tan(t ${C < 0 ? '−' : '+'} ${fmt(Math.abs(C), 4)})` },
        { label: 'maximal interval of existence', value: `(${fmt(a, 4)}, ${fmt(b, 4)}) — length π`, tone: 'warn' },
        { label: 'unique?', value: 'yes, on the whole interval', tone: 'good' },
      );
    } else {
      // y' = −y + sin t: y = (sin t − cos t)/2 + C e^{−t}
      const yp = (t: number) => (Math.sin(t) - Math.cos(t)) / 2;
      const C = (y0 - yp(t0)) * Math.exp(t0);
      sel = (t) => yp(t) + C * Math.exp(-t);
      if (ctx.toggles.family) for (let i = -4; i <= 4; i++) { if (!i) continue; const Ci = (y0 + i * 0.7 - yp(t0)) * Math.exp(t0); curves.push({ pts: sampleT((t) => yp(t) + Ci * Math.exp(-t)), color: c.muted, width: 1.4 }); }
      curves.push({ pts: sampleT(sel), color: c.blue, width: 3.2 });
      rows.push(
        { label: 'Lipschitz constant L', value: '1 (since |∂f/∂y| = 1 everywhere)', tone: 'good' },
        { label: 'unique?', value: 'yes, for all t: solutions never cross', tone: 'good' },
        { label: 'solution', value: `(sin t − cos t)/2 ${C < 0 ? '−' : '+'} ${fmt(Math.abs(C), 4)} e^{−t}` },
      );
    }

    // what a numerical solver does
    let num: Trajectory[] = [];
    if (ctx.toggles.numeric) {
      const rhs = (t: number, Y: number[]) => [f(t, Y[0])];
      const o = { maxStep: 0.05, maxSteps: 20000, rtol: 1e-9, atol: 1e-12 };
      num = [solveAdaptive(rhs, [y0], t0, v.x1, o), solveAdaptive(rhs, [y0], t0, v.x0, o)];
    }
    // Picard iterates on a grid
    const picard: P[][] = [];
    if (ctx.toggles.picard) {
      const N = 1200, a = v.x0, b = v.x1, hh = (b - a) / N;
      const ts = Array.from({ length: N + 1 }, (_, i) => a + i * hh);
      const i0 = Math.round((t0 - a) / hh);
      let yk = ts.map(() => y0);
      picard.push(ts.map((t, i) => [t, yk[i]] as P));
      for (let it = 0; it < ctx.params.iters; it++) {
        const fv = ts.map((t, i) => f(t, yk[i]));
        const next = new Array(N + 1).fill(y0);
        for (let i = i0 + 1; i <= N; i++) next[i] = next[i - 1] + (hh / 2) * (fv[i - 1] + fv[i]);
        for (let i = i0 - 1; i >= 0; i--) next[i] = next[i + 1] - (hh / 2) * (fv[i + 1] + fv[i]);
        yk = next.map((y) => (Number.isFinite(y) && Math.abs(y) < 1e6 ? y : NaN));
        picard.push(ts.map((t, i) => [t, yk[i]] as P));
      }
      const last = picard[picard.length - 1];
      const dev = Math.max(...last.filter((p, i) => i % 10 === 0 && Number.isFinite(p[1]) && Math.abs(p[0] - t0) < 1.5).map((p) => Math.abs(p[1] - sel(p[0]))).filter(Number.isFinite), 0);
      rows.push({ label: `Picard iterate ${ctx.params.iters} vs solution (|t − t₀| < 1.5)`, value: fmt(dev, 3), tone: dev < 1e-3 ? 'good' : undefined });
    }

    plot.setDraw((g) => {
      g.slopeField(f, 24, { color: c.field, width: 1.1, alpha: 0.45 });
      for (const x of vlines) g.line([x, g.view.y0], [x, g.view.y1], { color: c.red, width: 1.4, dash: [6, 5] });
      for (const cv of curves) drawRuns(g, cv.pts, { color: cv.color, width: cv.width, dash: cv.dash }, 50);
      picard.forEach((pts, i) => drawRuns(g, pts, { color: S[(i + 4) % S.length], width: 1.6, alpha: 0.4 + (0.6 * (i + 1)) / picard.length }, 50));
      if (picard.length) label(g, [g.view.x0 + 0.2, g.view.y0 + 0.3], `Picard iterates y₀ … y${ctx.params.iters}`, c.muted);
      for (const tr of num) drawRuns(g, tr.t.map((s, k) => [s, tr.y[k][0]] as P), { color: c.gold, width: 2.2, dash: [7, 6] }, 50);
      for (const h of handles) g.handle({ id: h.id, at: h.at, color: h.color, label: h.label, constrain: ([t]) => [Math.min(h.max, Math.max(h.min, t)), 0], onDrag: ([t]) => { ctx.setParam(h.key, Math.min(h.max, Math.max(h.min, t))); update(); } });
      g.handle({ id: 'ic', at: [t0, y0], color: c.gold, label: '(t₀, y₀)', onDrag: ([t, y]) => { ctx.setParam('t0', Math.max(-4, Math.min(5, t))); ctx.setParam('y0', Math.max(-3, Math.min(3.5, y))); update(); } });
    });
    if (ctx.toggles.numeric && nonLip && y0 === 0) rows.push({ label: 'numerical solver returns', value: 'y ≡ 0 (one of infinitely many)', tone: 'warn' });
    const blown = num.find((tr) => !tr.ok);
    if (blown) rows.push({ label: 'numerical solver', value: `stops near t = ${fmt(blown.t[blown.t.length - 1], 4)} (blow-up)`, tone: 'warn' });
    ctx.setReadouts(rows);
    ctx.warn('');
    ctx.setNote(nonLip
      ? `$f(y) = ${eq === 'sqrt' ? '\\sqrt{|y|}' : '3|y|^{2/3}'}$ is continuous, so solutions exist (Peano), but $\\partial f/\\partial y$ is unbounded at $y = 0$, so it is not Lipschitz there and uniqueness fails: a solution may rest on $y = 0$ and leave it at **any** time. Drag the ${y0 >= 0 ? 'green' : ''}${y0 === 0 ? ' and ' : ''}${y0 <= 0 ? 'violet' : ''} handle${y0 === 0 ? 's' : ''}. Physically: a tank that is empty now could have emptied at any earlier moment (Torricelli).`
      : eq === 'tan' ? 'Picard–Lindelöf guarantees a unique solution only on **some** interval around $t_0$. Here $y = \\tan(t + C)$ runs to infinity a distance $\\pi/2 \\mp \\arctan y_0$ away: the superlinear growth of $1 + y^2$ beats any time span.'
        : 'Globally Lipschitz: there is exactly one solution, it exists for all $t$, and two solutions approach each other like $e^{-t}$. Picard iteration $y_{n+1}(t) = y_0 + \\int_{t_0}^t f(s, y_n(s))\\,ds$ converges to it — the existence proof made visible.');
  }

  return {
    update,
    csv() { const pts = Array.from({ length: 501 }, (_, i) => { const t = -4 + (10 * i) / 500; return [t, sel(t)]; }); return csvOf(['t', 'y (selected solution, exact)'], pts); },
    dispose() {},
  };
}
