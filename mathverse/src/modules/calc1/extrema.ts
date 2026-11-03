// Critical points and extrema on a closed interval: the closed-interval method
// (critical points + endpoints), the first- and second-derivative tests, and a
// sign chart of f′. Corners (f′ undefined) are found as critical points too.

import type { DemoDef, DemoCtx, DemoInstance, Readout, StepRow } from '../types';
import { FxInput, fmt, fmtc, yRange, ink, muted, SERIES, FONT, SMALL, shortTeX, clamp, txt } from './common';
import { findRoots } from '../../core/numeric/roots';

interface Cand { x: number; y: number; why: 'endpoint' | 'f′ = 0' | 'f′ undefined'; test: string; kind: 'local max' | 'local min' | 'neither' | 'endpoint' }

/** Critical points of f in (a, b): zeros of f′ and places where f′ jumps sign without passing through 0. */
function criticalPoints(f: (x: number) => number, D1: (x: number) => number, a: number, b: number): { x: number; why: Cand['why'] }[] {
  const out: { x: number; why: Cand['why'] }[] = findRoots(D1, a, b, 800).filter((r) => r > a && r < b).map((x) => ({ x, why: 'f′ = 0' as const }));
  const n = 800;
  let x0 = a, d0 = D1(a);
  for (let i = 1; i <= n; i++) {
    const x1 = a + ((b - a) * i) / n, d1 = D1(x1);
    if (Number.isFinite(d0) && Number.isFinite(d1) && d0 * d1 < 0) {
      let lo = x0, hi = x1;
      for (let k = 0; k < 60; k++) { const m = (lo + hi) / 2; if (D1(m) * d0 > 0) lo = m; else hi = m; }
      const c = (lo + hi) / 2, h = Math.max(1e-7, (hi - lo) * 4);
      const jump = Math.min(Math.abs(D1(c - h)), Math.abs(D1(c + h)));
      const continuous = Math.abs(f(c - h) - f(c + h)) < 1e-4 * (1 + Math.abs(f(c)));
      if (jump > 1e-4 && continuous && !out.some((o) => Math.abs(o.x - c) < 1e-6)) out.push({ x: c, why: 'f′ undefined' });
    }
    x0 = x1; d0 = d1;
  }
  // zeros of f′ that touch without crossing (x³ at 0): local minima of |f′| that reach ~0
  const xs = Array.from({ length: n + 1 }, (_, i) => a + ((b - a) * i) / n), ds = xs.map((x) => Math.abs(D1(x)));
  const scale = Math.max(1e-300, ...ds.filter(Number.isFinite));
  for (let i = 1; i < n; i++) {
    if (!(ds[i] <= ds[i - 1] && ds[i] <= ds[i + 1]) || !Number.isFinite(ds[i])) continue;
    let lo = xs[i - 1], hi = xs[i + 1];
    for (let k = 0; k < 80; k++) { const m1 = lo + (hi - lo) * 0.382, m2 = lo + (hi - lo) * 0.618; if (Math.abs(D1(m1)) < Math.abs(D1(m2))) hi = m2; else lo = m1; }
    const c = (lo + hi) / 2;
    if (Math.abs(D1(c)) < 1e-9 * (1 + scale) && c > a && c < b && !out.some((o) => Math.abs(o.x - c) < 1e-5 * (b - a))) out.push({ x: c, why: 'f′ = 0' });
  }
  return out.sort((p, q) => p.x - q.x);
}

function extremaDemo(ctx: DemoCtx): DemoInstance {
  const plot = ctx.plot!;
  const fin = new FxInput('x^3 - 6x^2 + 9x + 1');
  plot.opts.xLabel = 'x'; plot.opts.yLabel = 'y';
  let cands: Cand[] = [];

  const update = () => {
    const [fx, changed] = fin.read(ctx);
    const { f, D1, D2 } = fx;
    let a = ctx.params.a, b = ctx.params.b;
    if (a > b) [a, b] = [b, a];
    if (changed) {
      const L = Math.max(b - a, 0.5), [lo, hi] = yRange([f], a, b, { q: 0, pad: 0.3 });
      plot.setView({ x0: a - 0.25 * L, x1: b + 0.25 * L, y0: lo, y1: hi });
      fin.warn(ctx, '');
    }
    // continuity check on [a, b] (the extreme value theorem's hypothesis)
    let broken = NaN;
    for (let i = 0; i <= 2000; i++) { const x = a + ((b - a) * i) / 2000; if (!Number.isFinite(f(x))) { broken = x; break; } }
    const crit = Number.isNaN(broken) ? criticalPoints(f, D1, a, b) : [];
    cands = [
      { x: a, y: f(a), why: 'endpoint', test: '', kind: 'endpoint' },
      ...crit.map(({ x, why }) => {
        const h = Math.max(1e-5, 1e-4 * (b - a));
        const l = D1(x - h), r = D1(x + h), c2 = why === 'f′ = 0' ? D2(x) : NaN;
        const first = l > 0 && r < 0 ? 'local max' : l < 0 && r > 0 ? 'local min' : 'neither';
        const sgn = (v: number) => (v > 0 ? '+' : v < 0 ? '−' : '0');
        const second = why !== 'f′ = 0' ? '' : Math.abs(c2) < 1e-9 ? 'f″ = 0: second test inconclusive' : c2 < 0 ? `f″ = ${fmt(c2, 3)} < 0 ⇒ local max` : `f″ = ${fmt(c2, 3)} > 0 ⇒ local min`;
        return { x, y: f(x), why, test: `f′: ${sgn(l)} → ${sgn(r)}${second ? `;  ${second}` : ''}`, kind: first } as Cand;
      }),
      { x: b, y: f(b), why: 'endpoint', test: '', kind: 'endpoint' },
    ];
    const ys = cands.map((c) => c.y).filter(Number.isFinite);
    const gmax = Math.max(...ys), gmin = Math.min(...ys);
    const tol = 1e-9 * (1 + Math.abs(gmax) + Math.abs(gmin));
    const x0 = clamp(ctx.params.x0, plot.view.x0, plot.view.x1), y0 = f(x0), m = D1(x0);

    plot.setDraw((g) => {
      const { y0: vy0, y1: vy1 } = g.view, H = vy1 - vy0;
      g.polygon([[a, vy0], [b, vy0], [b, vy1], [a, vy1]], { fill: ctx.dark ? 'rgba(255,255,255,0.035)' : 'rgba(0,0,0,0.035)' });
      g.fn(f, { color: SERIES[0], width: 1.4, alpha: 0.5 });
      g.fn(f, { color: SERIES[0], width: 3 }, [a, b]);
      // sign chart of f′ along the bottom
      if (ctx.toggles.signs) {
        const yb = vy0 + H * 0.04, n = 300;
        let start = a, s0 = Math.sign(D1(a));
        const seg = (p: number, q: number, s: number) => {
          if (q - p <= 0) return;
          g.line([p, yb], [q, yb], { color: s > 0 ? SERIES[3] : s < 0 ? SERIES[2] : muted(ctx), width: 6 });
          if ((q - p) * g.ppx > 22) g.text([(p + q) / 2, yb], s > 0 ? 'f′ > 0 ↗' : s < 0 ? 'f′ < 0 ↘' : '', { color: s > 0 ? txt(ctx, SERIES[3]) : txt(ctx, SERIES[2]), font: SMALL, align: 'center', baseline: 'bottom' }, 0, -6);
        };
        for (let i = 1; i <= n; i++) { const x = a + ((b - a) * i) / n, s = Math.sign(D1(x)); if (s !== s0 || i === n) { seg(start, x, s0); start = x; s0 = s; } }
      }
      if (ctx.toggles.tangent && Number.isFinite(y0) && Number.isFinite(m)) {
        const span = (g.view.x1 - g.view.x0) * 0.12;
        g.line([x0 - span, y0 - m * span], [x0 + span, y0 + m * span], { color: SERIES[1], width: 2 });
      }
      for (const c of cands) {
        if (!Number.isFinite(c.y)) continue;
        const isMax = Math.abs(c.y - gmax) <= tol, isMin = Math.abs(c.y - gmin) <= tol;
        const col = isMax ? '#ff9f5a' : isMin ? '#4fd1d9' : c.kind === 'local max' ? 'rgba(255,159,90,0.8)' : c.kind === 'local min' ? 'rgba(79,209,217,0.8)' : muted(ctx);
        g.point([c.x, c.y], isMax || isMin ? 8 : 5.5, { fill: col, color: ink(ctx), width: c.why === 'endpoint' ? 2 : 0 });
        const label = isMax ? 'global max' : isMin ? 'global min' : c.kind === 'endpoint' ? '' : c.kind;
        if (label) g.text([c.x, c.y], label, { color: col, font: FONT, align: 'center', baseline: isMin ? 'top' : 'bottom' }, 0, isMin ? 12 : -12);
      }
      g.handle({ id: 'a', at: [a, f(a)], color: ink(ctx), label: 'a', onDrag: ([px]) => { ctx.setParam('a', px); update(); }, constrain: ([px]) => [px, f(px)] });
      g.handle({ id: 'b', at: [b, f(b)], color: ink(ctx), label: 'b', onDrag: ([px]) => { ctx.setParam('b', px); update(); }, constrain: ([px]) => [px, f(px)] });
      if (ctx.toggles.tangent && Number.isFinite(y0)) g.handle({ id: 'x0', at: [x0, y0], color: SERIES[1], onDrag: ([px]) => { ctx.setParam('x0', px); update(); }, constrain: ([px]) => [px, f(px)] });
    });
    const maxAt = cands.filter((c) => Math.abs(c.y - gmax) <= tol).map((c) => fmtc(c.x, 5)).join(', ');
    const minAt = cands.filter((c) => Math.abs(c.y - gmin) <= tol).map((c) => fmtc(c.x, 5)).join(', ');
    const rows: Readout[] = [
      { label: 'interval', value: `[${fmt(a, 4)}, ${fmt(b, 4)}]` },
      { label: 'global maximum', value: Number.isFinite(gmax) ? `${fmt(gmax, 8)}  at x = ${maxAt}` : '—', tone: 'warn' },
      { label: 'global minimum', value: Number.isFinite(gmin) ? `${fmt(gmin, 8)}  at x = ${minAt}` : '—', tone: 'good' },
      { label: 'critical points inside', value: crit.length ? crit.map((c) => fmtc(c.x, 5) + (c.why === 'f′ undefined' ? ' (corner)' : '')).join(', ') : 'none' },
    ];
    if (ctx.toggles.tangent) rows.push({ label: `slope f′(x₀) at x₀ = ${fmt(x0, 3)}`, value: fmt(m, 6), tone: Math.abs(m) < 1e-3 ? 'good' : undefined });
    const t1 = shortTeX(fx.d1);
    if (t1) rows.push({ label: 'f′(x)', value: t1, tex: true });
    ctx.setReadouts(rows);
    const steps: StepRow[] = [
      { title: 'Find the critical points in (a, b)', detail: 'Solve f′(x) = 0 (numerically, on the exact derivative) and look for points where f′ does not exist.', tex: t1 ? `f'(x) = ${t1} = 0` : undefined },
      ...cands.map((c): StepRow => ({
        title: `${c.why === 'endpoint' ? 'Endpoint' : 'Critical point'}  x = ${fmtc(c.x, 6)}`,
        rule: c.why,
        detail: `f(x) = ${fmt(c.y, 8)}${c.test ? `\nfirst-derivative test: ${c.test} ⇒ ${c.kind}` : ''}`,
      })),
      { title: 'Compare the values', detail: `Largest: ${fmt(gmax, 8)} (global max). Smallest: ${fmt(gmin, 8)} (global min). On a closed interval a continuous function attains both — at a critical point or at an endpoint.`, rule: 'closed-interval method' },
    ];
    ctx.setSteps(steps);
    ctx.setNote('**The closed-interval method.** A continuous $f$ on $[a, b]$ has a global maximum and minimum (extreme value theorem). They can only occur where $f\'(x) = 0$, where $f\'$ does not exist, or at $a$ and $b$ — so list those candidates and compare their values (Steps tab). Locally, $f\'$ changing from $+$ to $-$ means a peak, $-$ to $+$ a valley (first-derivative test); $f\'\' < 0$ at a stationary point means a peak (second-derivative test). Drag $a$ and $b$: the global winners can jump to an endpoint.');
    fin.warn(ctx, !Number.isNaN(broken) ? `f is not defined at x ≈ ${fmt(broken, 4)} inside [a, b]: the extreme value theorem needs f continuous on the whole closed interval, and there may be no maximum or minimum.` : '');
  };
  return { update, dispose() {} };
}

export const extremaDemos: DemoDef[] = [
  {
    id: 'calc1.extrema', module: 'calc1', title: 'Critical points and extrema',
    topic: 'Critical points · local and global extrema · first and second derivative tests · closed-interval method',
    summary: 'Find the highest and lowest points of f on [a, b]: list the critical points and the endpoints, test each one, and compare. Drag the endpoints and watch the global extremes jump.',
    tex: "\\text{candidates: } a,\\ b,\\ c \\text{ with } f'(c) = 0 \\text{ or } \\nexists",
    view: '2d',
    input: { label: 'f(x) =', value: 'x^3 - 6x^2 + 9x + 1', placeholder: 'e.g. x e^(-x), abs(x^2 - 1), x^(2/3)' },
    params: [
      { key: 'a', label: 'a (drag the left end)', value: -0.3, min: -6, max: 6, step: 0.01 },
      { key: 'b', label: 'b (drag the right end)', value: 3.8, min: -6, max: 6, step: 0.01 },
      { key: 'x0', label: 'x₀ (tangent probe)', value: 2, min: -6, max: 6, step: 0.01 },
    ],
    toggles: [
      { key: 'signs', label: 'Sign chart of f′', value: true },
      { key: 'tangent', label: 'Tangent probe', value: true },
    ],
    experiments: [
      'Drag b to the right past about 4.1: the global maximum jumps from the local peak at x = 1 to the endpoint b.',
      'Slide the tangent probe across x = 1 and x = 3: the slope passes through 0 and changes sign there.',
      'Type x^3 and include 0: f′(0) = 0, but the sign chart is + then + — a critical point that is not an extremum.',
      'Type abs(x^2 - 1): the corners at x = ±1 are critical points where f′ does not exist — and they are the minima.',
      'Type 1/x on [−1, 1]: f is not continuous there, so there is no global max or min — the theorem’s hypothesis matters.',
    ],
    connections: ['calc1.shape', 'calc1.optimize', 'calc1.refraction'],
    accuracy: 'f′ and f″ are exact symbolic derivatives. Critical points are located numerically: zeros of f′ by Brent’s method (~1e−13), corners by bisection on sign changes of f′ (800 samples on [a, b]; two critical points closer than the sample spacing can be merged). Values are compared to 9 significant digits.',
    create: extremaDemo,
  },
];
