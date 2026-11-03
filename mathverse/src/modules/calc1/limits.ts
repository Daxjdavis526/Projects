// Limits and continuity: the ε–δ game with draggable bands, one-sided limits
// approached by sequences of points, and the classification of a point as
// continuous, removable, jump, infinite or oscillating.

import type { DemoDef, DemoCtx, DemoInstance, Readout, StepRow } from '../types';
import { FxInput, fmt, fmtc, fitView, ink, muted, SERIES, FONT, SMALL, clamp, txt } from './common';
import { classifyPoint, largestDelta, PointReport, LimitEstimate } from '../../core/numeric/limits';

const KIND_TEXT: Record<PointReport['kind'], string> = {
  continuous: 'continuous: the limit exists and equals f(a)',
  removable: 'removable discontinuity: the limit exists but f(a) is missing or different',
  jump: 'jump discontinuity: the one-sided limits differ',
  infinite: 'infinite discontinuity: f grows without bound (a vertical asymptote)',
  oscillating: 'essential (oscillating): f keeps wiggling, no limit',
  undefined: 'f is not defined near a',
};

const SHORT: Record<PointReport['kind'], string> = { continuous: 'Continuous', removable: 'Removable discontinuity', jump: 'Jump discontinuity', infinite: 'Infinite discontinuity', oscillating: 'Oscillating (essential) discontinuity', undefined: 'Undefined' };

const limText = (l: LimitEstimate) => l.kind === 'finite' ? `${fmtc(l.value, 10)}  (±${l.error.toExponential(0)})` : l.kind === '+inf' ? '+∞' : l.kind === '-inf' ? '−∞' : l.kind === 'oscillates' ? 'does not exist (oscillates)' : 'does not exist (undefined)';

function limitsDemo(ctx: DemoCtx): DemoInstance {
  const plot = ctx.plot!;
  const fin = new FxInput('(x^2 - 1)/(x - 1)');
  plot.opts.xLabel = 'x'; plot.opts.yLabel = 'y';
  let lastA = NaN, lastSrc = '';
  let report: PointReport | null = null;

  const update = () => {
    const [fx, changed] = fin.read(ctx);
    const f = fx.f;
    const a = ctx.params.a, eps = Math.max(1e-6, ctx.params.eps), delta = Math.max(1e-6, ctx.params.delta);
    const side = ctx.choices.side as 'both' | 'left' | 'right';
    if (changed || a !== lastA || !report || fx.src !== lastSrc) { report = classifyPoint(f, a); lastA = a; lastSrc = fx.src; }
    if (changed) { fitView(plot, [f], a - 3, a + 3); fin.warn(ctx, ''); }
    const r = report;
    // the limit being tested on this side
    let L = NaN, Lnote = '';
    if (side === 'left') L = r.left.kind === 'finite' ? r.left.value : NaN;
    else if (side === 'right') L = r.right.kind === 'finite' ? r.right.value : NaN;
    else if (Number.isFinite(r.limit)) L = r.limit;
    else if (r.kind === 'jump') { L = (r.left.value + r.right.value) / 2; Lnote = 'no two-sided limit — testing the midpoint of the jump'; }
    else if (r.left.kind === 'finite' && r.right.kind !== 'finite') L = r.left.value;
    // does this δ work for this ε? (sampled)
    let worst: [number, number] | null = null, works = Number.isFinite(L);
    if (works) {
      for (let i = 1; i <= 500 && works; i++) {
        const h = (delta * i) / 500;
        for (const s of side === 'both' ? [-1, 1] : side === 'left' ? [-1] : [1]) {
          const x = a + s * h, y = f(x);
          if (!Number.isFinite(y) || Math.abs(y - L) >= eps) { works = false; worst = [x, y]; break; }
        }
      }
    }
    const dMax = Number.isFinite(L) ? largestDelta(f, a, L, eps, 4, side) : NaN;

    plot.setDraw((g) => {
      const { x0, x1, y0, y1 } = g.view, W = x1 - x0, H = y1 - y0;
      const lo = side === 'right' ? a : a - delta, hi = side === 'left' ? a : a + delta;
      if (ctx.toggles.bands) {
        g.polygon([[lo, y0], [hi, y0], [hi, y1], [lo, y1]], { fill: 'rgba(106,169,255,0.10)' });
        if (Number.isFinite(L)) {
          g.polygon([[x0, L - eps], [x1, L - eps], [x1, L + eps], [x0, L + eps]], { fill: 'rgba(242,193,78,0.12)' });
          g.line([x0, L + eps], [x1, L + eps], { color: 'rgba(242,193,78,0.6)', width: 1 });
          g.line([x0, L - eps], [x1, L - eps], { color: 'rgba(242,193,78,0.6)', width: 1 });
        }
        if (ctx.toggles.auto && Number.isFinite(dMax)) {
          const a0 = side === 'right' ? a : a - dMax, a1 = side === 'left' ? a : a + dMax;
          g.line([a0, y0], [a0, y1], { color: SERIES[5], width: 1.4, dash: [6, 4] });
          g.line([a1, y0], [a1, y1], { color: SERIES[5], width: 1.4, dash: [6, 4] });
        }
      }
      g.line([a, y0], [a, y1], { color: muted(ctx), width: 1, dash: [3, 4] });
      g.fn(f, { color: SERIES[0], width: 2.4 });
      // inside the δ-window: green where within ε of L, red where not
      if (ctx.toggles.bands && Number.isFinite(L)) {
        const n = 240;
        let run: [number, number][] = [], ok0: boolean | null = null;
        const flush = () => { if (run.length > 1 && ok0 !== null) g.path(run, { color: ok0 ? SERIES[3] : SERIES[2], width: 4 }); };
        for (let i = 0; i <= n; i++) {
          const x = lo + ((hi - lo) * i) / n;
          if (Math.abs(x - a) < 1e-12) { flush(); run = []; continue; }
          const y = f(x);
          if (!Number.isFinite(y)) { flush(); run = []; ok0 = null; continue; }
          const ok = Math.abs(y - L) < eps;
          if (ok !== ok0 && run.length) { run.push([x, y]); flush(); run = [[x, y]]; ok0 = ok; continue; }
          ok0 = ok; run.push([x, y]);
        }
        flush();
      }
      // sequences marching in from each side
      if (ctx.toggles.approach) {
        for (const [est, col] of [[r.left, SERIES[6]], [r.right, SERIES[7]]] as const) {
          if ((side === 'left' && est === r.right) || (side === 'right' && est === r.left)) continue;
          est.samples.slice(0, 9).forEach(([x, y], k) => { if (Number.isFinite(y) && y > y0 - H && y < y1 + H) g.point([x, y], Math.max(2.2, 5 - k * 0.35), { fill: col }); });
        }
      }
      // the limit point (open) and the value f(a) (filled)
      const fa = r.value;
      for (const est of [r.left, r.right]) if (est.kind === 'finite') g.point([a, est.value], 6, { fill: ctx.dark ? '#0d1017' : '#f7f8fa', color: est === r.left ? SERIES[6] : SERIES[7], width: 2 });
      if (Number.isFinite(fa)) g.point([a, fa], 5, { fill: SERIES[1] });
      if (worst && Number.isFinite(worst[1])) { g.point(worst, 6, { fill: txt(ctx, SERIES[2]) }); g.text(worst, 'outside the ε-band', { color: txt(ctx, SERIES[2]), font: SMALL, baseline: 'top' }, 10, 8); }
      // handles: ε on the band edge, δ on the window edge, a on the axis
      if (Number.isFinite(L)) g.handle({ id: 'eps', at: [x0 + W * 0.06, L + eps], color: SERIES[1], label: 'ε', onDrag: ([, py]) => { ctx.setParam('eps', clamp(Math.abs(py - L), 0.001, 5)); update(); }, constrain: ([, py]) => [x0 + W * 0.06, py] });
      g.handle({ id: 'delta', at: [side === 'left' ? a - delta : a + delta, y0 + H * 0.07], color: SERIES[0], label: 'δ', onDrag: ([px]) => { ctx.setParam('delta', clamp(Math.abs(px - a), 0.0005, 5)); update(); }, constrain: ([px]) => [px, y0 + H * 0.07] });
      g.handle({ id: 'a', at: [a, y0 + H * 0.15], color: ink(ctx), label: 'a', onDrag: ([px]) => { ctx.setParam('a', clamp(px, -10, 10)); update(); }, constrain: ([px]) => [px, y0 + H * 0.15] });
      if (Number.isFinite(L)) g.text([x1, L + eps], `L + ε`, { color: txt(ctx, SERIES[1]), font: SMALL, align: 'right', baseline: 'bottom' }, -6, -3);
      g.text([x0, y1], `${SHORT[r.kind]} at a = ${fmtc(a, 4)}`, { color: r.kind === 'continuous' ? txt(ctx, SERIES[3]) : txt(ctx, SERIES[1]), font: FONT, align: 'left', baseline: 'top' }, 12, 10);
    });

    const rows: Readout[] = [
      { label: 'lim x→a⁻ f(x)  (numerical)', value: limText(r.left) },
      { label: 'lim x→a⁺ f(x)  (numerical)', value: limText(r.right) },
      { label: 'f(a)', value: Number.isFinite(r.value) ? fmtc(r.value, 10) : 'undefined' },
      { label: 'verdict', value: SHORT[r.kind], tone: r.kind === 'continuous' ? 'good' : 'warn' },
    ];
    if (Number.isFinite(L)) {
      rows.push({ label: `ε = ${fmt(eps, 3)}, δ = ${fmt(delta, 3)}`, value: works ? 'works: every sampled x in the window is within ε' : `fails at x = ${fmt(worst![0], 5)}`, tone: works ? 'good' : 'bad' });
      rows.push({ label: 'largest δ that works (sampled)', value: dMax < 1e-9 ? 'none — no δ works for this ε' : fmt(dMax, 5), tone: dMax < 1e-9 ? 'bad' : undefined });
    }
    ctx.setReadouts(rows);
    const steps: StepRow[] = [];
    for (const [name, est] of [['from the left', r.left], ['from the right', r.right]] as const) {
      if ((side === 'left' && est === r.right) || (side === 'right' && est === r.left)) continue;
      steps.push({ title: `Approaching a ${name}`, detail: est.samples.filter((_, k) => k % 3 === 0).slice(0, 7).map(([x, y]) => `x = ${fmt(x, 9)}   f(x) = ${fmt(y, 9)}`).join('\n'), rule: limText(est) });
    }
    ctx.setSteps(steps);
    const sideTeX = side === 'left' ? 'a^-' : side === 'right' ? 'a^+' : 'a';
    ctx.setNote(`**${KIND_TEXT[r.kind][0].toUpperCase() + KIND_TEXT[r.kind].slice(1)}.** ` + (Number.isFinite(L)
      ? `$\\lim_{x\\to ${sideTeX}} f(x) = L$ means: for **every** $\\varepsilon > 0$ (the gold band around $L = ${fmtc(L, 6)}$) there is **some** $\\delta > 0$ (the blue window) such that $0 < |x - a| < \\delta$ forces $|f(x) - L| < \\varepsilon$. Inside the window the curve is green where it stays in the band and red where it escapes. ${works ? 'This δ works.' : 'This δ fails — shrink it.'} ${Lnote ? `(${Lnote}: for $\\varepsilon$ smaller than half the jump, no $\\delta$ works.)` : ''} The value $f(a)$ plays no part — the hole at $x = a$ is excluded.`
      : `There is no finite limit to test here (${KIND_TEXT[r.kind]}). The orange and pink dots show the sequences $x = a \\pm h$ marching in; their $f$-values do not settle on one number.`));
    fin.warn(ctx, r.kind === 'undefined' ? `f is not defined near a = ${fmt(a)}.` : '');
  };
  return { update, dispose() {} };
}

export const limitDemos: DemoDef[] = [
  {
    id: 'calc1.limits', module: 'calc1', title: 'Limits and continuity: the ε–δ game',
    topic: 'Limits · ε–δ definition · one-sided limits · continuity · removable, jump and infinite discontinuities',
    summary: 'Challenge a limit: pick any ε-band around L, then find a δ-window around a that keeps the curve inside the band. One-sided limits are traced by sequences of points, and the point is classified as continuous or as a removable, jump, infinite or oscillating discontinuity.',
    tex: '0<|x-a|<\\delta \\;\\Rightarrow\\; |f(x)-L|<\\varepsilon',
    view: '2d',
    input: { label: 'f(x) =', value: '(x^2 - 1)/(x - 1)', placeholder: 'e.g. sin(x)/x, floor(x), 1/(x-2), sin(1/x)' },
    params: [
      { key: 'a', label: 'a (the point)', value: 1, min: -5, max: 5, step: 0.01 },
      { key: 'eps', label: 'ε (band half-height)', value: 0.5, min: 0.005, max: 2, step: 0.005 },
      { key: 'delta', label: 'δ (window half-width)', value: 0.6, min: 0.001, max: 2, step: 0.001 },
    ],
    choices: [{ key: 'side', label: 'Limit', options: [['both', 'Two-sided  x → a'], ['left', 'From the left  x → a⁻'], ['right', 'From the right  x → a⁺']], value: 'both' }],
    toggles: [
      { key: 'bands', label: 'ε-band and δ-window', value: true },
      { key: 'approach', label: 'Sequences approaching a', value: true },
      { key: 'auto', label: 'Show the largest δ that works', value: false },
    ],
    experiments: [
      'Shrink ε by dragging its handle. Each time, find a δ that turns the whole window green. For a line, δ = ε / |slope| always works.',
      'Type floor(x) with a = 1. From the left the limit is 0, from the right 1 — switch the limit to one-sided and each works. Two-sided, any ε < ½ fails.',
      'Type sin(1/x) with a = 0: no band thinner than 1 can ever be satisfied, however small δ is. Then try x sin(1/x): squeezed to 0.',
      'Type 1/(x-2) with a = 2: the values run off to ±∞. Infinite limits are not limits in the ε–δ sense.',
      'Type sqrt(x) with a = 0: only the right-hand limit exists, and the function is continuous from the right.',
    ],
    connections: ['calc1.secant', 'calc1.shape'],
    accuracy: 'Limits are numerical: f is sampled at a ± h for h halving from 0.09 to ~3×10⁻⁹ and the sequence is accelerated (Aitken Δ²) inside the range where rounding error has not yet taken over; the error estimate is shown. Divergence and oscillation are recognized from the sample pattern. The ε–δ check samples 500 points per side, so a spike narrower than the spacing could be missed.',
    create: limitsDemo,
  },
];
