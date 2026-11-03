// Classification of second-order PDEs A u_xx + 2B u_xy + C u_yy + … = 0 by
// the discriminant B² − AC: the conic of the principal symbol, the real
// characteristic directions, the canonical form, and the type map in the
// (B, C) plane with a draggable point. Includes the mixed-type Tricomi equation.

import type { DemoDef, DemoCtx, DemoInstance } from '../types';
import { classify2 } from '../../core/numeric/pde';
import { fmt, tx, pal, alpha, heatImage, divergingLut, clamp, P } from './common';

const PRESETS: Record<string, [number, number, number]> = { laplace: [1, 0, 1], heat: [1, 0, 0], wave: [1, 0, -1], skew: [1, 1.5, 1], tricomi: [0, 0, 1] };
const BEHAVIOUR: Record<string, string> = {
  elliptic: '**Elliptic** (Laplace, Poisson, steady states): no real characteristics; solutions are as smooth as the coefficients allow, every boundary value influences every interior point, and one boundary condition all around is the right data. A kink in the boundary data is smoothed out instantly.',
  parabolic: '**Parabolic** (heat, diffusion): one double family of characteristics — the lines of constant time. Information spreads at infinite speed but decays; solutions become smooth immediately for $t > 0$ and the problem is well posed forward in time only.',
  hyperbolic: '**Hyperbolic** (waves): two real families of characteristics along which signals travel at finite speed. Kinks and jumps in the data are *not* smoothed — they travel along characteristics. Initial position and velocity are the right data.',
  degenerate: 'All second-order coefficients vanish: this is not a second-order equation.',
};

export const classify: DemoDef = {
  id: 'pde.classify', module: 'pde', title: 'Classifying PDEs: elliptic, parabolic, hyperbolic',
  topic: 'PDE classification · the discriminant · characteristics · canonical forms · mixed type',
  summary: 'The second-order part A u_xx + 2B u_xy + C u_yy decides almost everything about a linear PDE. Its discriminant B² − AC sorts it into elliptic, parabolic or hyperbolic — named after the conic its symbol draws.',
  tex: 'A\\,u_{xx} + 2B\\,u_{xy} + C\\,u_{yy} + \\ldots = 0:\\qquad B^2 - AC\\ \\begin{cases} < 0 & \\text{elliptic} \\\\ = 0 & \\text{parabolic} \\\\ > 0 & \\text{hyperbolic} \\end{cases}\\qquad \\frac{dy}{dx} = \\frac{B \\pm \\sqrt{B^2 - AC}}{A}',
  view: 'split2d',
  params: [
    { key: 'A', label: 'A  (coefficient of u_xx)', value: 1, min: -2, max: 2, step: 0.01 },
    { key: 'B', label: 'B  (half the coefficient of u_xy)', value: 0, min: -2, max: 2, step: 0.01 },
    { key: 'C', label: 'C  (coefficient of u_yy)', value: -1, min: -2, max: 2, step: 0.01 },
  ],
  choices: [{ key: 'preset', label: 'Equation', value: 'wave', options: [['custom', 'custom (sliders)'], ['laplace', 'Laplace u_xx + u_yy'], ['heat', 'heat u_xx − u_y (y = t)'], ['wave', 'wave u_xx − u_yy (y = ct)'], ['skew', 'u_xx + 3u_xy + u_yy'], ['tricomi', 'Tricomi y·u_xx + u_yy (mixed)']] }],
  toggles: [{ key: 'conic', label: 'Symbol conic Aξ² + 2Bξη + Cη² = ±1', value: true }, { key: 'chars', label: 'Characteristics', value: true }],
  experiments: [
    'Drag the point in the (B, C) plane across the parabola C = B²/A: the conic on the left changes from an ellipse through a pair of lines to a hyperbola.',
    'Start at the wave equation and turn on characteristics: two families x ± y = const. Slide C toward 0: they fold together into one family (parabolic).',
    'Choose u_xx + 3u_xy + u_yy: it looks elliptic (positive coefficients) but B² − AC = 1.25 > 0 — hyperbolic. The mixed term matters.',
    'Choose Tricomi: elliptic for y > 0, hyperbolic for y < 0, with cusped characteristics. It models transonic flow: subsonic above, supersonic below.',
    'Flip the signs of A, B, C together: the type does not change (multiply the equation by −1).',
  ],
  connections: ['pde.laplace', 'pde.heat1d', 'pde.wave', 'pde.stability'],
  accuracy: 'Exact: the discriminant, the characteristic slopes (B ± √(B² − AC))/A, and the eigenvalues of the symbol matrix [[A, B], [B, C]] (closed form). Lower-order terms do not affect the type and are omitted. For the Tricomi equation the characteristics x ± (2/3)(−y)^{3/2} = const are exact.',
  create: (ctx) => classifyDemo(ctx),
};

function classifyDemo(ctx: DemoCtx): DemoInstance {
  const plot = ctx.plot!, plot2 = ctx.plot2!;
  plot.opts.equal = true; plot.opts.xLabel = 'x'; plot.opts.yLabel = 'y';
  plot2.opts.xLabel = 'B'; plot2.opts.yLabel = 'C';
  let last = ctx.choices.preset, mapImg: ImageData | null = null, mapKey = '';

  const update = () => {
    const c = pal(ctx), p = ctx.params, preset = ctx.choices.preset;
    if (preset !== last) {
      last = preset;
      const v = PRESETS[preset];
      if (v) { ctx.setParam('A', v[0]); ctx.setParam('B', v[1]); ctx.setParam('C', v[2]); }
    } else if (preset !== 'custom' && PRESETS[preset] && preset !== 'tricomi' && PRESETS[preset].some((v, i) => Math.abs(v - [p.A, p.B, p.C][i]) > 1e-9)) {
      last = 'custom'; ctx.setChoice('preset', 'custom');
    }
    const tri = ctx.choices.preset === 'tricomi';
    const { A, B, C } = p;
    const cl = classify2(A, B, C);
    // eigenvalues of [[A, B], [B, C]]
    const m = (A + C) / 2, d = Math.hypot((A - C) / 2, B), l1 = m + d, l2 = m - d;

    plot.setView({ x0: -2.2, x1: 2.2, y0: -2.2, y1: 2.2 });
    plot.setDraw((g) => {
      const v = g.view;
      if (tri) {
        g.polygon([[v.x0, 0], [v.x1, 0], [v.x1, v.y1], [v.x0, v.y1]], { fill: alpha(c.blue, 0.1) });
        g.polygon([[v.x0, 0], [v.x1, 0], [v.x1, v.y0], [v.x0, v.y0]], { fill: alpha(c.red, 0.1) });
        if (ctx.toggles.chars) for (let k = -12; k <= 12; k++) for (const s of [1, -1]) g.path(Array.from({ length: 80 }, (_, i) => { const y = -(i / 79) * 2.3; return [k * 0.35 + s * (2 / 3) * Math.pow(-y, 1.5), y] as P; }), { color: alpha(s > 0 ? c.red : c.orange, 0.75), width: 1.2 });
        g.text([v.x0 + 0.1, 1.9], 'y > 0: elliptic (subsonic)', { color: c.blue, font: '600 12px Inter, sans-serif' });
        g.text([v.x0 + 0.1, -1.95], 'y < 0: hyperbolic (supersonic)', { color: c.red, font: '600 12px Inter, sans-serif' });
        g.line([v.x0, 0], [v.x1, 0], { color: c.ink, width: 2, dash: [6, 4] });
        g.text([v.x1 - 0.1, 0.05], 'sonic line: parabolic', { color: c.ink, font: '12px Inter, sans-serif', align: 'right', baseline: 'bottom' });
        return;
      }
      const tint = cl.type === 'elliptic' ? c.blue : cl.type === 'hyperbolic' ? c.red : c.gold;
      g.polygon([[v.x0, v.y0], [v.x1, v.y0], [v.x1, v.y1], [v.x0, v.y1]], { fill: alpha(tint, 0.06) });
      if (ctx.toggles.chars) for (const s of cl.slopes) for (let k = -14; k <= 14; k++) {
        const c0 = k * 0.3;
        if (!Number.isFinite(s)) g.line([c0, v.y0], [c0, v.y1], { color: alpha(tint, 0.55), width: 1.1 });
        else { const nrm = Math.hypot(1, s); g.line([-5, -5 * s + c0 * nrm], [5, 5 * s + c0 * nrm], { color: alpha(tint, 0.55), width: 1.1 }); }
      }
      if (ctx.toggles.conic) {
        g.implicit((x, y) => A * x * x + 2 * B * x * y + C * y * y - 1, { color: c.gold, width: 2.6 }, 220);
        g.implicit((x, y) => A * x * x + 2 * B * x * y + C * y * y + 1, { color: c.cyan, width: 2, dash: [5, 4] }, 220);
      }
      g.text([v.x0 + 0.1, v.y1 - 0.1], `${cl.type.toUpperCase()}   B² − AC = ${fmt(cl.disc, 4)}`, { color: tint, font: '700 13px Inter, sans-serif', baseline: 'top' });
      if (ctx.toggles.conic) g.text([v.x0 + 0.1, v.y1 - 0.38], '━ Aξ² + 2Bξη + Cη² = 1   ┅ = −1', { color: c.muted, font: '12px Inter, sans-serif', baseline: 'top' });
      if (ctx.toggles.chars && cl.type === 'elliptic') g.text([0, v.y0 + 0.15], 'no real characteristics', { color: c.muted, font: '12px Inter, sans-serif', align: 'center' });
    });

    // the type map in the (B, C) plane for this A
    const R = 2.2, W = 220;
    const mk = `${A}|${ctx.dark}`;
    if (mk !== mapKey) {
      mapImg = heatImage(W, W, (i, j) => { const b = -R + (2 * R * (i + 0.5)) / W, cc = -R + (2 * R * (j + 0.5)) / W; const t = classify2(A, b, cc).type; return t === 'hyperbolic' ? 0.55 : t === 'elliptic' ? -0.55 : 0; }, -1, 1, divergingLut(ctx.dark), mapImg);
      mapKey = mk;
    }
    plot2.setView({ x0: -R, x1: R, y0: -R, y1: R });
    plot2.setDraw((g) => {
      if (mapImg) g.image(mapImg, -R, R, -R, R);
      if (Math.abs(A) > 1e-9) g.fn((b) => (b * b) / A, { color: c.gold, width: 2.4 }, [-R, R]);
      else g.line([0, -R], [0, R], { color: c.gold, width: 2.4 });
      g.text([-R + 0.1, R - 0.1], `A = ${fmt(A, 3)}:  red hyperbolic · blue elliptic · gold line parabolic`, { color: c.ink, font: '12px Inter, sans-serif', baseline: 'top' });
      if (!tri) g.handle({ id: 'bc', at: [B, C], color: c.ink, label: '(B, C)', onDrag: ([b, cc]) => { ctx.setParam('B', +clamp(b, -2, 2).toFixed(3)); ctx.setParam('C', +clamp(cc, -2, 2).toFixed(3)); } });
    });

    const canon = cl.type === 'elliptic' ? 'u_{\\xi\\xi} + u_{\\eta\\eta} + \\ldots = 0' : cl.type === 'parabolic' ? 'u_{\\xi\\xi} + \\ldots = 0' : cl.type === 'hyperbolic' ? 'u_{\\xi\\xi} - u_{\\eta\\eta} + \\ldots = 0\\ \\text{or}\\ u_{\\xi\\eta} + \\ldots = 0' : '\\text{—}';
    ctx.setReadouts(tri ? [
      { label: 'discriminant B² − AC', value: '−y (depends on position)' },
      { label: 'type', value: 'elliptic for y > 0, hyperbolic for y < 0' },
      { label: 'characteristics (y < 0)', value: 'x ± ⅔(−y)^{3/2} = const' },
    ] : [
      { label: 'discriminant B² − AC', value: fmt(cl.disc, 6), tone: cl.type === 'hyperbolic' ? 'bad' : cl.type === 'elliptic' ? 'good' : 'warn' },
      { label: 'type', value: cl.type },
      { label: 'characteristic slopes dy/dx', value: cl.slopes.length ? cl.slopes.map((s) => (Number.isFinite(s) ? fmt(s, 5) : '∞ (vertical)')).join(', ') : 'none (complex)' },
      { label: 'eigenvalues of [[A, B], [B, C]]', value: `${fmt(l1, 5)}, ${fmt(l2, 5)}` },
      { label: 'canonical form', value: canon, tex: true },
    ]);
    ctx.setNote(tri ? `**Mixed type.** The Tricomi equation $y\\,u_{xx} + u_{yy} = 0$ has $B^2 - AC = -y$: elliptic above the line $y = 0$, hyperbolic below. It is the model for **transonic flow** around a wing: subsonic (elliptic) and supersonic (hyperbolic, with shock-carrying characteristics) regions meeting at the sonic line.`
      : `$${tx(A, 3)}\\,u_{xx} ${B >= 0 ? '+' : '-'} ${tx(Math.abs(2 * B), 3)}\\,u_{xy} ${C >= 0 ? '+' : '-'} ${tx(Math.abs(C), 3)}\\,u_{yy} + \\ldots = 0$. The type is the sign pattern of the eigenvalues of the symbol (same signs: elliptic; one zero: parabolic; opposite signs: hyperbolic) — the same test as for the conic $A\\xi^2 + 2B\\xi\\eta + C\\eta^2 = 1$.\n\n${BEHAVIOUR[cl.type]}`);
    ctx.warn('');
  };
  return { update, dispose() {} };
}
