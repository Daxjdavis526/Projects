// Polar curves and areas: a ray sweeps round, the curve is drawn as θ grows,
// and the swept sector's area ½∫r² dθ accumulates. Coefficients are sliders;
// the right plot shows r(θ) on ordinary axes (where r < 0 the point is
// plotted on the opposite side). Kepler's second law closes the loop.

import type { DemoDef, DemoCtx, DemoInstance } from '../types';
import { integrate } from '../../core/numeric/quad';
import { fmt, ink, muted, rgba, clamp, BLUE, GOLD, RED, VIOLET, FONT, safeTutorial } from './util';

interface Curve { label: string; r: (th: number, a: number, b: number, k: number) => number; tex: string; range: [number, number]; area?: (a: number, b: number, k: number) => { v: number; tex: string } | null; note: string }
const CURVES: Record<string, Curve> = {
  limacon: { label: 'limaçon r = a + b cos θ (a = b: cardioid)', r: (t, a, b) => a + b * Math.cos(t), tex: 'r = a + b\\cos\\theta', range: [0, 2 * Math.PI],
    area: (a, b) => ({ v: Math.PI * (a * a + (b * b) / 2), tex: '\\pi\\left(a^2 + \\tfrac{b^2}{2}\\right)' }),
    note: 'With |b| > |a| the limaçon has an inner loop where r < 0 — the formula ½∫r²dθ then counts the inner loop twice.' },
  rose: { label: 'rose r = a cos(kθ)', r: (t, a, _b, k) => a * Math.cos(k * t), tex: 'r = a\\cos k\\theta', range: [0, 2 * Math.PI],
    area: (a, _b, k) => (Number.isInteger(k) && k > 0 ? { v: (Math.PI * a * a) / 2, tex: '\\tfrac{\\pi a^2}{2}' } : null),
    note: 'Integer k: 2k petals if k is even; k petals if k is odd — each traced twice over 0 ≤ θ < 2π, so the integral counts the area twice (the rose itself has area πa²/4). Petals with r < 0 are drawn on the opposite side.' },
  spiral: { label: 'spiral of Archimedes r = aθ', r: (t, a) => a * t, tex: 'r = a\\theta', range: [0, 6 * Math.PI],
    area: () => null, note: 'Each turn moves out by 2πa. The area swept in the first turn is ½∫₀^{2π} a²θ² dθ = 4π³a²/3.' },
  lemniscate: { label: 'lemniscate r² = a² cos 2θ', r: (t, a) => { const c = Math.cos(2 * t); return c >= 0 ? a * Math.sqrt(c) : NaN; }, tex: 'r^2 = a^2\\cos 2\\theta', range: [0, 2 * Math.PI],
    area: (a) => ({ v: a * a, tex: 'a^2' }), note: 'Where cos 2θ < 0 there is no point at all (r² cannot be negative). Total area a² — Bernoulli’s lemniscate.' },
  conic: { label: 'orbit r = a(1 − e²)/(1 + e cos θ)', r: (t, a, _b, e) => (a * (1 - e * e)) / (1 + e * Math.cos(t)), tex: 'r = \\frac{a(1-e^2)}{1 + e\\cos\\theta}', range: [0, 2 * Math.PI],
    area: (a, _b, e) => (e < 1 ? { v: Math.PI * a * a * Math.sqrt(1 - e * e), tex: '\\pi a^2\\sqrt{1-e^2} = \\pi a b' } : null),
    note: 'A Kepler orbit with the Sun at the origin (a focus): semi-major axis a, eccentricity e (the k slider). Turn on Kepler timing: the planet moves so that the swept area grows at a constant rate — Kepler’s second law, which is conservation of angular momentum: ½r²θ′ = L/(2m).' },
};

export const polarDemo: DemoDef = {
  id: 'calc2.polar', module: 'calc2', title: 'Polar curves and areas', topic: 'Polar coordinates, polar curves, area in polar coordinates',
  summary: 'A point at distance r in direction θ. As θ sweeps round, the curve is drawn and a thin sector of area ½r²dθ is swept at each instant — so the area is ½∫r² dθ.',
  tex: 'A = \\frac12\\int_\\alpha^\\beta r(\\theta)^2\\,d\\theta,\\qquad x = r\\cos\\theta,\\ y = r\\sin\\theta',
  view: 'split2d', animated: true,
  params: [
    { key: 'th', label: 'θ now (play to sweep)', value: 2.2, min: 0, max: 6 * Math.PI, step: 0.001 },
    { key: 'a', label: 'a', value: 1.5, min: 0, max: 4, step: 0.01 },
    { key: 'b', label: 'b', value: 1.5, min: -4, max: 4, step: 0.01 },
    { key: 'k', label: 'k (petal number / eccentricity e)', value: 3, min: 0, max: 8, step: 0.01 },
    { key: 'n', label: 'sectors for the Riemann sum', value: 12, min: 2, max: 120, step: 1 },
  ],
  choices: [{ key: 'c', label: 'Curve', value: 'limacon', options: Object.entries(CURVES).map(([k, c]) => [k, c.label] as [string, string]) }],
  toggles: [{ key: 'sectors', label: 'Show the sector Riemann sum', value: false }, { key: 'kepler', label: 'Kepler timing (orbit: equal areas in equal times)', value: false }],
  experiments: [
    'Play: the ray sweeps and the shaded area grows. With a = b the limaçon is a cardioid, of area 3πa²/2.',
    'Make b larger than a: the inner loop appears exactly where r(θ) < 0 on the right-hand plot.',
    'Rose: set k = 2 and k = 3. Why four petals for k = 2 but only three for k = 3? Watch where r is negative.',
    'Turn on the sector Riemann sum: thin wedges of area ½r²Δθ approximate the region — the polar analogue of rectangles.',
    'Orbit with e = 0.6 and Kepler timing: the planet races past the Sun and crawls at the far end, sweeping equal areas in equal times.',
  ],
  connections: ['calc2.parametric', 'calc2.trigsub'],
  accuracy: 'The swept area is adaptive quadrature of ½r² (≈1e−10); exact closed forms are shown where they exist. Kepler timing integrates dθ/dt = C/r² with small steps, C chosen so one orbit takes 12 s.',
  tutorial: safeTutorial([
    { text: '**Polar coordinates.** Instead of $(x, y)$, give a direction $\\theta$ and a distance $r$: $x = r\\cos\\theta$, $y = r\\sin\\theta$. A polar curve gives $r$ as a function of $\\theta$. Left: the curve; right: the same $r(\\theta)$ drawn on ordinary axes.', set: { choices: { c: 'limacon' }, params: { a: 1.5, b: 1.5, th: 1, n: 12 }, toggles: { sectors: false, kepler: false } }, task: 'Press play and watch the ray sweep.' },
    { text: '**Area.** In a small turn $d\\theta$ the ray sweeps a thin sector — nearly a triangle of area $\\tfrac12 r\\cdot r\\,d\\theta$. So $A = \\tfrac12\\int r^2 d\\theta$. Turn on the sector sum: wedges replace rectangles.', set: { toggles: { sectors: true }, params: { th: 6.283 } }, task: 'Raise the number of sectors until the sum matches the area.', done: (c) => c.params.n >= 60 },
    { text: 'For the **cardioid** $r = a(1 + \\cos\\theta)$: $A = \\tfrac12\\int_0^{2\\pi} a^2(1+\\cos\\theta)^2d\\theta = \\tfrac{3\\pi a^2}{2}$ (expand, and use the half-angle identity).', task: 'Check the readout against 3πa²/2 with a = 1.5: 10.6029.' },
    { text: '**Negative r.** If $r(\\theta) < 0$, the point is plotted in the opposite direction. With $b > a$ the limaçon dips below zero (right plot) and draws an inner loop (left).', set: { params: { a: 1, b: 2 }, toggles: { sectors: false } }, task: 'Find the θ where r = 0 on the right plot: the curve passes through the origin there.' },
    { text: '**Roses.** $r = a\\cos k\\theta$: with $k$ odd the petals with $r < 0$ land on top of the others ($k$ petals); with $k$ even they land between ($2k$ petals).', set: { choices: { c: 'rose' }, params: { a: 2, k: 2, th: 6.283 } }, task: 'Try k = 3 and k = 4.' },
    { text: '**Kepler’s second law.** A planet’s orbit is the conic $r = \\frac{a(1-e^2)}{1+e\\cos\\theta}$. Angular momentum conservation says $r^2\\dot\\theta$ is constant, i.e. $\\frac{dA}{dt} = \\tfrac12 r^2\\dot\\theta$ is constant: equal areas in equal times.', set: { choices: { c: 'conic' }, params: { a: 2.5, k: 0.6, th: 0 }, toggles: { kepler: true } }, task: 'Press play: fast near the Sun, slow far away.' },
  ]),
  create: (ctx) => createPolar(ctx),
};

function createPolar(ctx: DemoCtx): DemoInstance {
  const L = ctx.plot!, R = ctx.plot2!;
  L.opts.equal = true; L.opts.xLabel = 'x'; L.opts.yLabel = 'y';
  R.opts.xLabel = 'θ'; R.opts.yLabel = 'r';
  let lastKey = '';
  const curveOf = () => CURVES[ctx.choices.c] ?? CURVES.limacon;
  const update = () => {
    const C = curveOf();
    const { a, b } = ctx.params;
    let k = ctx.params.k;
    const isConic = ctx.choices.c === 'conic';
    if (isConic) k = clamp(k, 0, 0.95);
    const r = (t: number) => C.r(t, a, b, k);
    const [t0, t1] = C.range;
    const th = clamp(ctx.params.th, t0, t1);
    const key = `${ctx.choices.c}|${Math.round(a * 4)}|${Math.round(b * 4)}|${Math.round(k * 4)}`;
    if (key !== lastKey) {
      lastKey = key;
      let m = 0.5;
      for (let i = 0; i <= 720; i++) { const t = t0 + ((t1 - t0) * i) / 720, v = r(t); if (Number.isFinite(v)) m = Math.max(m, Math.abs(v)); }
      L.setView({ x0: -m * 1.25, x1: m * 1.25, y0: -m * 1.25, y1: m * 1.25 });
      R.setView({ x0: t0 - 0.3, x1: t1 + 0.3, y0: -m * 1.2, y1: m * 1.2 });
    }
    const swept = integrate((t) => { const v = r(t); return Number.isFinite(v) ? 0.5 * v * v : 0; }, t0, th, 1e-10);
    const total = integrate((t) => { const v = r(t); return Number.isFinite(v) ? 0.5 * v * v : 0; }, t0, t1, 1e-10);
    const n = Math.round(ctx.params.n);
    let sectorSum = 0;
    const tcol = ink(ctx);
    const X = (t: number) => r(t) * Math.cos(t), Y = (t: number) => r(t) * Math.sin(t);
    L.setDraw((g) => {
      // polar grid
      const m = (g.view.x1 - g.view.x0) / 2;
      for (let q = 1; q <= 4; q++) { const rr = (m * q) / 4.5, ring: [number, number][] = []; for (let i = 0; i <= 90; i++) { const p = (2 * Math.PI * i) / 90; ring.push([rr * Math.cos(p), rr * Math.sin(p)]); } g.path(ring, { color: rgba('#8b93a7', 0.18), width: 1 }); }
      for (let q = 0; q < 12; q++) { const p = (Math.PI * q) / 6; g.line([0, 0], [m * 2 * Math.cos(p), m * 2 * Math.sin(p)], { color: rgba('#8b93a7', 0.1), width: 1 }); }
      // swept region as a fan of thin triangles from the origin
      const steps = Math.max(2, Math.ceil(((th - t0) / (2 * Math.PI)) * 360));
      for (let i = 0; i < steps; i++) {
        const ta = t0 + ((th - t0) * i) / steps, tb = t0 + ((th - t0) * (i + 1)) / steps;
        if (!Number.isFinite(r(ta)) || !Number.isFinite(r(tb))) continue;
        g.polygon([[0, 0], [X(ta), Y(ta)], [X(tb), Y(tb)]], { fill: rgba(r((ta + tb) / 2) >= 0 ? BLUE : RED, 0.22) });
      }
      if (ctx.toggles.sectors) {
        const dt = (t1 - t0) / n;
        for (let i = 0; i < n; i++) {
          const tm = t0 + (i + 0.5) * dt, rm = r(tm);
          if (!Number.isFinite(rm)) continue;
          sectorSum += 0.5 * rm * rm * dt;
          const arc: [number, number][] = [[0, 0]];
          for (let j = 0; j <= 8; j++) { const p = t0 + i * dt + (dt * j) / 8; arc.push([rm * Math.cos(p), rm * Math.sin(p)]); }
          g.polygon(arc, { fill: rgba(i % 2 ? VIOLET : GOLD, 0.18), color: i % 2 ? VIOLET : GOLD, width: 1 });
        }
      }
      g.parametric(X, Y, t0, t1, { color: muted(ctx), width: 1.4, alpha: 0.7 }, 1500);
      g.parametric(X, Y, t0, th, { color: tcol, width: 2.8 }, 1200);
      const rv = r(th);
      if (Number.isFinite(rv)) {
        const far = (g.view.x1 - g.view.x0);
        g.line([0, 0], [far * Math.cos(th), far * Math.sin(th)], { color: rgba(GOLD, 0.5), width: 1, dash: [4, 4] });
        g.line([0, 0], [X(th), Y(th)], { color: GOLD, width: 2.4 });
        g.handle({ id: 'th', at: [X(th), Y(th)], color: GOLD, label: `θ = ${fmt(th, 3)}`, onDrag: ([px, py]) => {
          let ang = Math.atan2(py, px); if (ang < 0) ang += 2 * Math.PI;
          // nearest θ in the range with that direction (r may be negative: try the opposite direction too)
          let best = th, bd = Infinity;
          for (let i = 0; i <= 1440; i++) { const s = t0 + ((t1 - t0) * i) / 1440; const dd = Math.hypot(X(s) - px, Y(s) - py); if (dd < bd) { bd = dd; best = s; } }
          void ang; ctx.setParam('th', +best.toFixed(4));
        } });
      }
      if (isConic) { g.point([0, 0], 8, { fill: '#ffd166' }); g.text([0, 0], 'Sun', { color: GOLD, font: FONT }, 10, -10); }
      g.text([g.view.x0, g.view.y1], C.label, { color: tcol, font: FONT }, 10, 22);
    });
    R.setDraw((g) => {
      g.fn((t) => { const v = r(t); return v < 0 ? v : NaN; }, { color: RED, width: 2.4 }, [t0, t1]);
      g.fn((t) => { const v = r(t); return v >= 0 ? v : NaN; }, { color: BLUE, width: 2.4 }, [t0, t1]);
      g.line([th, g.view.y0], [th, g.view.y1], { color: GOLD, width: 1, dash: [4, 4] });
      const rv = r(th);
      if (Number.isFinite(rv)) g.point([th, rv], 6, { fill: GOLD });
      for (const [v, lab] of [[Math.PI / 2, 'π/2'], [Math.PI, 'π'], [1.5 * Math.PI, '3π/2'], [2 * Math.PI, '2π']] as [number, string][]) if (v <= t1) g.text([v, 0], lab, { color: muted(ctx), font: '11px Inter, sans-serif', align: 'center', baseline: 'top' }, 0, 16);
      g.text([g.view.x0, g.view.y1], 'r(θ) on ordinary axes — red where r < 0 (plotted opposite)', { color: tcol, font: FONT }, 10, 22);
      g.handle({ id: 'thr', at: [th, Number.isFinite(rv) ? rv : 0], color: GOLD, onDrag: ([x]) => ctx.setParam('th', +clamp(x, t0, t1).toFixed(4)) });
    });
    const ex = C.area?.(a, b, k) ?? null;
    const rv = r(th), dr = (r(th + 1e-5) - r(th - 1e-5)) / 2e-5;
    const slope = (dr * Math.sin(th) + rv * Math.cos(th)) / (dr * Math.cos(th) - rv * Math.sin(th));
    ctx.setReadouts([
      { label: 'θ', value: `${fmt(th, 5)} rad = ${fmt((th * 180) / Math.PI, 4)}°` },
      { label: 'r(θ)', value: fmt(rv, 6), tone: rv < 0 ? 'warn' : undefined },
      { label: 'slope dy/dx', value: Number.isFinite(slope) ? fmt(slope, 5) : 'vertical' },
      { label: `swept area ½∫ r² dθ from ${fmt(t0, 3)}`, value: fmt(swept.value, 10) },
      { label: `full range [${fmt(t0, 3)}, ${fmt(t1, 4)}]`, value: fmt(total.value, 10) },
      ...(ex ? [{ label: 'exact (full range)', value: `${ex.tex} = ${fmt(ex.v, 10)}`, tex: true }] : []),
      ...(ctx.toggles.sectors ? [{ label: `sector sum, ${n} wedges`, value: fmt(sectorSum, 10) }] : []),
    ]);
    ctx.warn(isConic && ctx.params.k > 0.95 ? 'For the orbit the k slider is the eccentricity e, kept below 0.95 here (e ≥ 1 is a parabola or hyperbola — not closed).' : '');
    ctx.setNote(`$${C.tex}$. ${C.note}${ctx.choices.c === 'rose' && !Number.isInteger(k) ? ' (k is not an integer: the rose does not close over [0, 2π].)' : ''}`);
  };
  return {
    update,
    tick(dt) {
      const C = curveOf(), [t0, t1] = C.range;
      let th = ctx.params.th;
      if (ctx.choices.c === 'conic' && ctx.toggles.kepler) {
        const a = ctx.params.a, e = clamp(ctx.params.k, 0, 0.95);
        // dA/dt constant: one orbit (area πab) in 12 s → dθ/dt = 2(dA/dt)/r²
        const dA = (Math.PI * a * a * Math.sqrt(1 - e * e)) / 12;
        for (let i = 0; i < 10; i++) { const rr = C.r(th, a, 0, e); th += (2 * dA / (rr * rr)) * (dt / 10); }
      } else th += dt * (t1 - t0) / 10;
      if (th > t1) th = t0;
      ctx.setParam('th', th); update();
    },
    dispose() {},
  };
}
