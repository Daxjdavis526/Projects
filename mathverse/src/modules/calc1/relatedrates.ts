// Related rates: a ladder sliding down a wall and a cone filling with water.
// One quantity changes at a known rate; differentiating the constraint that
// ties the quantities together gives the others' rates, live.

import type { DemoDef, DemoCtx, DemoInstance, Readout } from '../types';
import { fmt, fmtTeX, ink, muted, SERIES, FONT, SMALL, clamp, txt } from './common';

const K = 0.5;  // cone: radius / height

function ratesDemo(ctx: DemoCtx): DemoInstance {
  const plot = ctx.plot!, plot2 = ctx.plot2!;
  plot.opts.equal = true; plot.opts.grid = false;
  let lastScene = '', lastSize = NaN;

  const update = () => {
    const ladder = ctx.choices.scene !== 'cone';
    const S = ctx.params.size, rate = ctx.params.rate;
    if (ctx.choices.scene !== lastScene || S !== lastSize) {
      lastScene = ctx.choices.scene; lastSize = S;
      if (ladder) {
        plot.opts.xLabel = 'x'; plot.opts.yLabel = 'y';
        plot.setView({ x0: -0.25 * S, x1: 1.15 * S, y0: -0.15 * S, y1: 1.12 * S });
        plot2.opts.xLabel = 'x (foot)'; plot2.opts.yLabel = 'dy/dt';
        plot2.setView({ x0: -0.05 * S, x1: 1.05 * S, y0: -6 * rate - 0.5, y1: 0.8 });
      } else {
        plot.opts.xLabel = ''; plot.opts.yLabel = 'h';
        plot.setView({ x0: -0.85 * S, x1: 0.85 * S, y0: -0.1 * S, y1: 1.25 * S });
        plot2.opts.xLabel = 'h (depth)'; plot2.opts.yLabel = 'dh/dt';
        const top = rate / (Math.PI * (K * 0.12 * S) ** 2);
        plot2.setView({ x0: -0.05 * S, x1: 1.05 * S, y0: -0.1 * Math.min(top, 3), y1: Math.min(top, 3) * 1.1 });
      }
    }
    if (ladder) drawLadder(S, rate); else drawCone(S, rate);
  };

  const drawLadder = (L: number, v: number) => {
    const x = clamp(ctx.params.pos, 0.001 * L, 0.999 * L), y = Math.sqrt(L * L - x * x);
    const dydt = -(x / y) * v, theta = Math.atan2(y, x), dthdt = -v / y;
    const scale = 0.35 * L / Math.max(1, v);
    plot.setDraw((g) => {
      const c = ink(ctx), mc = muted(ctx);
      g.polygon([[-0.2 * L, 0], [0, 0], [0, 1.1 * L], [-0.2 * L, 1.1 * L]], { fill: ctx.dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)' });
      g.line([0, 0], [0, 1.1 * L], { color: mc, width: 2 });
      g.line([-0.2 * L, 0], [1.15 * L, 0], { color: mc, width: 2 });
      g.line([x, 0], [0, y], { color: SERIES[6], width: 7 });
      // rungs
      for (let k = 1; k < 10; k++) { const t = k / 10, px = x * (1 - t), py = y * t, nx = y / L, ny = x / L; g.line([px - nx * 0.04 * L, py - ny * 0.04 * L], [px + nx * 0.04 * L, py + ny * 0.04 * L], { color: SERIES[6], width: 2 }); }
      g.arrow([x, 0.04 * L], [x + v * scale, 0.04 * L], { color: SERIES[0], width: 2.5 });
      const dy = Math.max(dydt * scale, -1.2 * L);
      g.arrow([0.03 * L, y], [0.03 * L, y + dy], { color: SERIES[2], width: 2.5 });
      g.text([x + v * scale, 0.04 * L], `dx/dt = ${fmt(v, 3)}`, { color: txt(ctx, SERIES[0]), font: FONT, baseline: 'bottom' }, 4, -6);
      g.text([0.03 * L, y + dy / 2], `dy/dt = ${fmt(dydt, 3)}`, { color: txt(ctx, SERIES[2]), font: FONT, baseline: 'middle' }, 10, 0);
      g.text([x / 2, 0], `x = ${fmt(x, 3)}`, { color: c, font: SMALL, align: 'center', baseline: 'top' }, 0, 6);
      g.text([0, y / 2], `y = ${fmt(y, 3)}`, { color: c, font: SMALL, align: 'right', baseline: 'middle' }, -8, 0);
      g.text([x / 2, y / 2], `L = ${fmt(L, 3)}`, { color: txt(ctx, SERIES[6]), font: FONT }, 12, -6);
      g.handle({ id: 'foot', at: [x, 0], color: SERIES[0], onDrag: ([px]) => { ctx.setParam('pos', clamp(px, 0.001 * L, 0.999 * L)); update(); }, constrain: ([px]) => [clamp(px, 0.001 * L, 0.999 * L), 0] });
    });
    plot2.setDraw((g) => {
      g.fn((s) => (s > 0 && s < L ? -(s / Math.sqrt(L * L - s * s)) * v : NaN), { color: SERIES[2], width: 2.4 });
      g.line([L, g.view.y0], [L, g.view.y1], { color: muted(ctx), width: 1, dash: [4, 4] });
      g.point([x, dydt], 6, { fill: SERIES[2] });
      g.text([0.45 * L, g.view.y0], 'the top’s speed blows up as x → L', { color: muted(ctx), font: SMALL, align: 'center', baseline: 'bottom' }, 0, -12);
    });
    const rows: Readout[] = [
      { label: 'x (foot)', value: fmt(x, 6) }, { label: 'y (top)', value: fmt(y, 6) },
      { label: 'dx/dt (given)', value: fmt(v, 6) },
      { label: 'dy/dt = −(x/y)·dx/dt', value: fmt(dydt, 6), tone: 'warn' },
      { label: 'dθ/dt = −(dx/dt)/y  (rad per unit time)', value: fmt(dthdt, 6) },
      { label: 'angle θ with the floor', value: `${fmt((theta * 180) / Math.PI, 4)}°` },
      { label: 'check: x² + y² − L²', value: (x * x + y * y - L * L).toExponential(1), tone: 'muted' },
    ];
    ctx.setReadouts(rows);
    ctx.setSteps([
      { title: 'The constraint (Pythagoras), true at every instant', tex: 'x(t)^2 + y(t)^2 = L^2' },
      { title: 'Differentiate both sides with respect to t', tex: '2x\\,\\frac{dx}{dt} + 2y\\,\\frac{dy}{dt} = 0', rule: 'chain rule' },
      { title: 'Solve for the unknown rate', tex: '\\frac{dy}{dt} = -\\frac{x}{y}\\,\\frac{dx}{dt}' },
      { title: 'Now', tex: `\\frac{dy}{dt} = -\\frac{${fmtTeX(x, 4)}}{${fmtTeX(y, 4)}}\\cdot ${fmtTeX(v, 4)} = ${fmtTeX(dydt, 6)}` },
    ]);
    ctx.setNote(`The foot is pulled away at a steady $\\tfrac{dx}{dt} = ${fmtTeX(v, 3)}$. Differentiating $x^2 + y^2 = L^2$ gives $\\tfrac{dy}{dt} = -\\tfrac{x}{y}\\tfrac{dx}{dt}$: slow at first, faster and faster as the top nears the floor.`);
    ctx.warn(y < 0.08 * L ? 'Model limit: as y → 0 the predicted speed of the top grows without bound. A real ladder’s top leaves the wall before that — the constraint x² + y² = L² stops holding.' : '');
  };

  const drawCone = (H: number, Q: number) => {
    const R = K * H;
    const h = clamp(ctx.params.pos, 0, H), r = K * h;
    const V = (Math.PI / 3) * r * r * h, Vfull = (Math.PI / 3) * R * R * H;
    const dhdt = h > 0 ? Q / (Math.PI * r * r) : Infinity, drdt = K * dhdt;
    plot.setDraw((g) => {
      const mc = muted(ctx);
      if (h > 0) g.polygon([[0, 0], [r, h], [-r, h]], { fill: 'rgba(79,209,217,0.45)', color: SERIES[5], width: 1.5 });
      g.path([[-R, H], [0, 0], [R, H]], { color: ink(ctx), width: 2.5 });
      g.polygon([[-R, H], [R, H], [R * 0.98, H * 1.01], [-R * 0.98, H * 1.01]], { color: mc, width: 1 });
      // the faucet stream
      g.line([0, 1.22 * H], [0, Math.max(h, 0)], { color: 'rgba(79,209,217,0.8)', width: 3 });
      g.polygon([[-0.12 * R, 1.22 * H], [0.35 * R, 1.22 * H], [0.35 * R, 1.17 * H], [-0.12 * R, 1.17 * H]], { fill: mc });
      g.text([0.35 * R, 1.2 * H], `dV/dt = ${fmt(Q, 3)}`, { color: txt(ctx, SERIES[5]), font: FONT, baseline: 'middle' }, 8, 0);
      if (h > 0) {
        const s = Math.min(dhdt, 3) * 0.2 * H / Math.max(1e-9, Math.min(3, Q));
        g.arrow([r * 0.55, h], [r * 0.55, h + Math.min(s, 0.4 * H)], { color: SERIES[2], width: 2.5 });
        g.text([r, h], `h = ${fmt(h, 3)},  r = ${fmt(r, 3)}`, { color: ink(ctx), font: SMALL, baseline: 'middle' }, 10, 0);
      }
      g.text([R, H], `R = ${fmt(R, 3)}, H = ${fmt(H, 3)}`, { color: mc, font: SMALL, align: 'right', baseline: 'bottom' }, 0, -6);
      g.handle({ id: 'surface', at: [0, h], color: SERIES[5], onDrag: ([, py]) => { ctx.setParam('pos', clamp(py, 0, H)); update(); }, constrain: ([, py]) => [0, clamp(py, 0, H)] });
    });
    plot2.setDraw((g) => {
      g.fn((s) => (s > 0 && s <= H ? Q / (Math.PI * (K * s) ** 2) : NaN), { color: SERIES[2], width: 2.4 });
      if (h > 0) g.point([h, dhdt], 6, { fill: SERIES[2] });
      g.text([g.view.x1, g.view.y1], 'dh/dt = (dV/dt) / (π r²): fast at the narrow bottom', { color: muted(ctx), font: SMALL, align: 'right', baseline: 'top' }, -12, 50);
    });
    ctx.setReadouts([
      { label: 'depth h', value: fmt(h, 6) }, { label: 'surface radius r = (R/H)·h', value: fmt(r, 6) },
      { label: 'volume V = πr²h/3', value: `${fmt(V, 6)}  of ${fmt(Vfull, 5)}` },
      { label: 'dV/dt (given)', value: fmt(Q, 6) },
      { label: 'dh/dt = (dV/dt)/(π r²)', value: fmt(dhdt, 6), tone: 'warn' },
      { label: 'dr/dt = (R/H)·dh/dt', value: fmt(drdt, 6) },
      { label: 'time until full', value: fmt((Vfull - V) / Q, 5) },
    ]);
    ctx.setSteps([
      { title: 'Volume of water, using similar triangles r = (R/H) h', tex: `V = \\tfrac13\\pi r^2 h = \\tfrac{\\pi}{3}\\left(\\tfrac{R}{H}\\right)^2 h^3` },
      { title: 'Differentiate with respect to t', tex: `\\frac{dV}{dt} = \\pi\\left(\\tfrac{R}{H}\\right)^2 h^2\\,\\frac{dh}{dt} = \\pi r^2\\,\\frac{dh}{dt}`, rule: 'chain rule' },
      { title: 'Solve', tex: '\\frac{dh}{dt} = \\frac{dV/dt}{\\pi r^2}', detail: 'πr² is the area of the water surface: new water spreads over it.' },
      { title: 'Now', tex: h > 0 ? `\\frac{dh}{dt} = \\frac{${fmtTeX(Q, 4)}}{\\pi\\cdot ${fmtTeX(r, 4)}^2} = ${fmtTeX(dhdt, 6)}` : '\\text{empty: } dh/dt \\to \\infty' },
    ]);
    ctx.setNote(`Water pours in at a constant $\\tfrac{dV}{dt} = ${fmtTeX(Q, 3)}$, but the depth rises at $\\tfrac{dh}{dt} = \\tfrac{dV/dt}{\\pi r^2}$ — the inflow spread over the surface area. Near the narrow tip it shoots up; near the wide top it crawls.`);
    ctx.warn(h <= 0 ? 'At h = 0 the surface has no area: dh/dt = (dV/dt)/(πr²) is infinite. Start the clock a moment later, or drag the surface up.' : h >= H ? 'The cone is full.' : '');
  };

  return {
    update,
    tick(dt) {
      const S = ctx.params.size, rate = ctx.params.rate;
      if (ctx.choices.scene !== 'cone') {
        const x = ctx.params.pos + rate * dt;
        ctx.setParam('pos', Math.min(x, 0.999 * S));
      } else {
        const h = Math.max(ctx.params.pos, 0);
        const V = (Math.PI / 3) * K * K * h ** 3 + rate * dt;
        ctx.setParam('pos', Math.min(S, Math.cbrt((3 * V) / (Math.PI * K * K))));
      }
      update();
    },
    reset() { ctx.setParam('pos', ctx.choices.scene === 'cone' ? 0.3 : 1); },
    dispose() {},
  };
}

export const ratesDemos: DemoDef[] = [
  {
    id: 'calc1.relatedrates', module: 'calc1', title: 'Related rates: ladder and cone',
    topic: 'Related rates · implicit differentiation in time · chain rule',
    summary: 'Two classic related-rates problems running live. A constraint ties the quantities together at every instant; differentiating it in time ties their rates together too.',
    tex: "x\\dot x + y\\dot y = 0,\\qquad \\dot V = \\pi r^2\\,\\dot h",
    view: 'split2d', animated: true,
    params: [
      { key: 'pos', label: 'state: foot distance x / water depth h', value: 1, min: 0, max: 10, step: 0.001 },
      { key: 'rate', label: 'given rate: dx/dt / dV/dt', value: 0.6, min: 0.05, max: 3, step: 0.01 },
      { key: 'size', label: 'size: ladder length L / cone height H', value: 5, min: 2, max: 10, step: 0.1 },
    ],
    choices: [{ key: 'scene', label: 'Problem', options: [['ladder', 'Sliding ladder'], ['cone', 'Filling cone']], value: 'ladder' }],
    experiments: [
      'Press play with the ladder: the foot moves steadily but the top accelerates. Where is |dy/dt| = dx/dt? (At x = y: θ = 45°.)',
      'Let the ladder run to the end: dy/dt → −∞. The mathematics is right; the physics model (top touching the wall) has stopped being true.',
      'Switch to the cone and press play: the level shoots up at first and then slows, although water flows in at a constant rate.',
      'Double dV/dt: every rate doubles. Rates are linear in the given rate — the geometry fixes only the ratio.',
    ],
    connections: ['calc1.implicit', 'calc1.chain', 'calc1.motion'],
    accuracy: 'The rates are exact formulas from differentiating the constraint, evaluated at the current state; the animation advances the state exactly (x grows linearly; the cone’s depth comes from the exact volume V(t) = V₀ + (dV/dt)·t). The ladder model ignores the moment the top leaves the wall.',
    create: ratesDemo,
  },
];
