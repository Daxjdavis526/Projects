// Parametric curves: a parameter slider moves a point along (x(t), y(t)),
// with its velocity and acceleration (exact symbolic derivatives), the slope
// dy/dx = y′/x′, the arc length travelled and the area swept.

import type { DemoDef, DemoCtx, DemoInstance } from '../types';
import { parse, compile, derivative, toTeX, Node } from '../../core/expr';
import { integrate } from '../../core/numeric/quad';
import { fmt, ink, muted, rgba, clamp, BLUE, GOLD, GREEN, RED, VIOLET, FONT, safeTutorial } from './util';

interface Preset { label: string; x: string; y: string; t: [number, number]; note: string; abc: [number, number, number] }
const PRESETS: Record<string, Preset> = {
  cycloid: { label: 'cycloid (rolling wheel)', x: 'a*(t - sin(t))', y: 'a*(1 - cos(t))', t: [0, 4 * Math.PI], abc: [1, 0, 0], note: 'A point on the rim of a wheel of radius a rolling along the x-axis. At the cusps the velocity is zero — the rim point is momentarily at rest on the ground. Physics: the cycloid is the brachistochrone and the tautochrone.' },
  ellipse: { label: 'ellipse (an orbit)', x: 'a*cos(t)', y: 'b*sin(t)', t: [0, 2 * Math.PI], abc: [2, 1, 0], note: 'x = a cos t, y = b sin t. The swept area over a full turn is πab. (t is not the time of a Kepler orbit — a planet speeds up near the focus; see the polar demo.)' },
  lissajous: { label: 'Lissajous figure', x: 'sin(a*t + c)', y: 'sin(b*t)', t: [0, 2 * Math.PI], abc: [3, 2, 0.5], note: 'Two perpendicular oscillations with frequencies a and b — what an oscilloscope draws. A rational ratio a/b closes the curve.' },
  projectile: { label: 'projectile (v, angle)', x: 'a*cos(b)*t', y: 'a*sin(b)*t - 4.905*t^2', t: [0, 3], abc: [12, 0.9, 0], note: 'Launch speed a (m/s) at angle b (rad), g = 9.81 m/s². The velocity is constant horizontally; the acceleration is (0, −g) everywhere.' },
  epicycloid: { label: 'epicycloid (wheel on a wheel)', x: '(a + b)*cos(t) - b*cos((a + b)/b*t)', y: '(a + b)*sin(t) - b*sin((a + b)/b*t)', t: [0, 2 * Math.PI], abc: [3, 1, 0], note: 'A circle of radius b rolling around one of radius a. With a/b an integer k, the curve has k cusps (a = b gives a cardioid).' },
  custom: { label: 'your own (type below)', x: '', y: '', t: [0, 2 * Math.PI], abc: [1, 1, 0], note: 'Your curve: velocity and acceleration are exact symbolic derivatives of what you typed.' },
};

export const parametricDemo: DemoDef = {
  id: 'calc2.parametric', module: 'calc2', title: 'Parametric curves', topic: 'Parametric equations, velocity, slope, arc length and area',
  summary: 'A curve traced by a moving point: x and y both depend on a parameter t. The velocity (x′, y′) is tangent to the curve, its length is the speed, and dy/dx = y′/x′.',
  tex: '\\frac{dy}{dx} = \\frac{y\'(t)}{x\'(t)},\\qquad L = \\int_{t_0}^{t_1}\\sqrt{x\'(t)^2 + y\'(t)^2}\\,dt',
  view: '2d', animated: true,
  input: { label: 'custom (x(t), y(t)) =', value: '(cos(3*t), sin(2*t))', placeholder: '(x(t), y(t)) using t and a, b, c' },
  params: [
    { key: 't', label: 'parameter t (drag the point, or play)', value: 1, min: -20, max: 20, step: 0.001 },
    { key: 'a', label: 'a', value: 1, min: 0.1, max: 15, step: 0.01 },
    { key: 'b', label: 'b', value: 1, min: 0, max: 6, step: 0.01 },
    { key: 'c', label: 'c', value: 0, min: -3.2, max: 3.2, step: 0.01 },
  ],
  choices: [{ key: 'p', label: 'Curve', value: 'cycloid', options: Object.entries(PRESETS).map(([k, p]) => [k, p.label] as [string, string]) }],
  toggles: [{ key: 'vel', label: 'Velocity r′(t)', value: true }, { key: 'acc', label: 'Acceleration r″(t)', value: false }, { key: 'tan', label: 'Tangent line', value: true }, { key: 'trace', label: 'Draw only up to t', value: false }],
  experiments: [
    'Play the cycloid: the point stops at each cusp (speed 0) and moves at twice the wheel’s speed at the top.',
    'At a cusp x′ = y′ = 0 and dy/dx = 0/0 — the slope is undefined even though the curve is continuous.',
    'Turn on acceleration for the projectile: it is (0, −9.81) at every point. Only the velocity changes.',
    'Lissajous with a = 3, b = 2: change c (the phase) and the figure turns in space. Try a = 3, b = 2.01 — it never closes.',
    'Read the swept area −∫ y dx… for the ellipse over a full turn: πab.',
  ],
  connections: ['calc2.polar', 'calc2.arclength'],
  accuracy: 'Velocity, acceleration and slope use exact symbolic derivatives. Arc length and swept area are adaptive quadrature (≈1e−10).',
  tutorial: safeTutorial([
    { text: '**A curve as motion.** Instead of $y = f(x)$, give both coordinates as functions of a parameter: $(x(t), y(t))$. The cycloid is the path of a point on a rolling wheel: $x = a(t - \\sin t)$, $y = a(1 - \\cos t)$.', set: { choices: { p: 'cycloid' }, params: { a: 1, t: 1 }, toggles: { vel: true, acc: false, tan: true, trace: true } }, task: 'Press play and watch the wheel roll.' },
    { text: '**Velocity** is the derivative of each coordinate: $\\mathbf r\'(t) = (x\'(t), y\'(t))$. It is tangent to the curve, and its length $\\sqrt{x\'^2 + y\'^2}$ is the speed.', task: 'Drag the point to the top of an arch (t = π): the speed is 2a — twice the wheel’s.', done: (c) => Math.abs(c.params.t - Math.PI) < 0.05 },
    { text: '**Slope.** By the chain rule $\\frac{dy}{dt} = \\frac{dy}{dx}\\frac{dx}{dt}$, so $\\frac{dy}{dx} = \\frac{y\'}{x\'}$ — wherever $x\' \\ne 0$. At a cusp both vanish and the slope is undefined.', task: 'Move t to 2π (a cusp) and read the speed and the slope.', done: (c) => Math.abs(c.params.t - 2 * Math.PI) < 0.05 },
    { text: '**Arc length** is $\\int \\text{speed}\\,dt$. One arch of the cycloid has length $8a$ — computed by Christopher Wren in 1658.', task: 'Set t = 2π and read the arc length from t₀: 8.', done: (c) => Math.abs(c.params.t - 2 * Math.PI) < 0.02 },
    { text: '**Physics.** For a projectile, $\\mathbf r(t) = (v\\cos\\alpha\\,t,\\ v\\sin\\alpha\\,t - \\tfrac12 g t^2)$: the acceleration is $(0, -g)$ everywhere. The velocity rotates downward while its horizontal part never changes.', set: { choices: { p: 'projectile' }, params: { a: 12, b: 0.9, t: 0.5 }, toggles: { acc: true, trace: false } }, task: 'Play: the green acceleration arrow never changes.' },
  ]),
  create: (ctx) => createParam(ctx),
};

function createParam(ctx: DemoCtx): DemoInstance {
  const plot = ctx.plot!;
  plot.opts.equal = true; plot.opts.xLabel = 'x'; plot.opts.yLabel = 'y';
  let lastKey = '';
  let comp: { X: Node; Y: Node; dX: Node | null; dY: Node | null; ddX: Node | null; ddY: Node | null; err?: string } | null = null;
  let compKey = '';
  const names = ['t', 'a', 'b', 'c'];
  const d = (n: Node) => { try { return derivative(n, 't'); } catch { return null; } };
  const build = (xs: string, ys: string) => {
    const k = `${xs}|${ys}`;
    if (k === compKey && comp) return comp;
    compKey = k;
    try {
      const X = parse(xs, { names }), Y = parse(ys, { names });
      const dX = d(X), dY = d(Y);
      comp = { X, Y, dX, dY, ddX: dX && d(dX), ddY: dY && d(dY) };
    } catch (e) { comp = { X: { t: 'num', v: 0 }, Y: { t: 'num', v: 0 }, dX: null, dY: null, ddX: null, ddY: null, err: (e as Error).message }; }
    return comp;
  };
  const range = (): [number, number] => (PRESETS[ctx.choices.p] ?? PRESETS.cycloid).t;
  const update = () => {
    const key = PRESETS[ctx.choices.p] ? ctx.choices.p : 'cycloid';
    const P = PRESETS[key];
    let xs = P.x, ys = P.y;
    if (key === 'custom') {
      const m = ctx.input.trim().replace(/^\(|\)$/g, '');
      const depth = (s: string) => { let dd = 0; for (let i = 0; i < s.length; i++) { if (s[i] === '(') dd++; else if (s[i] === ')') dd--; else if (s[i] === ',' && dd === 0) return i; } return -1; };
      const i = depth(m);
      if (i < 0) { ctx.warn('Type the custom curve as (x(t), y(t)), e.g. (cos(3*t), sin(2*t)).'); return; }
      xs = m.slice(0, i); ys = m.slice(i + 1);
    }
    const C = build(xs, ys);
    if (C.err) { ctx.warn(`Cannot read the curve: ${C.err}`); return; }
    // a newly chosen curve starts from its own natural a, b, c
    if (lastKey && key !== lastKey && key !== 'custom') { ctx.setParam('a', P.abc[0]); ctx.setParam('b', P.abc[1]); ctx.setParam('c', P.abc[2]); }
    const pv = { a: ctx.params.a, b: ctx.params.b, c: ctx.params.c };
    const vars = ['t'];
    let fx: (t: number) => number, fy: (t: number) => number;
    try { const cx = compile(C.X, vars, pv), cy = compile(C.Y, vars, pv); fx = (t) => cx([t]); fy = (t) => cy([t]); }
    catch (e) { ctx.warn((e as Error).message); return; }
    const num = (f: (t: number) => number) => (t: number) => (f(t + 1e-5) - f(t - 1e-5)) / 2e-5;
    const mk = (n: Node | null, fb: (t: number) => number) => { if (!n) return fb; const c = compile(n, vars, pv); return (t: number) => c([t]); };
    const vx = mk(C.dX, num(fx)), vy = mk(C.dY, num(fy)), ax = mk(C.ddX, num(vx)), ay = mk(C.ddY, num(vy));
    const [t0, t1] = P.t;
    const t = clamp(ctx.params.t, t0, t1);
    if (key !== lastKey) {
      lastKey = key;
      let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity;
      for (let i = 0; i <= 600; i++) { const s = t0 + ((t1 - t0) * i) / 600, X = fx(s), Y = fy(s); if (Number.isFinite(X) && Number.isFinite(Y)) { x0 = Math.min(x0, X); x1 = Math.max(x1, X); y0 = Math.min(y0, Y); y1 = Math.max(y1, Y); } }
      const m = 0.2 * Math.max(x1 - x0, y1 - y0, 0.5);
      plot.setView({ x0: x0 - m, x1: x1 + m, y0: y0 - m, y1: y1 + m });
    }
    const X = fx(t), Y = fy(t), VX = vx(t), VY = vy(t), AX = ax(t), AY = ay(t);
    const speed = Math.hypot(VX, VY);
    const arc = integrate((s) => Math.hypot(vx(s), vy(s)), t0, t, 1e-10);
    const area = integrate((s) => fx(s) * vy(s) - fy(s) * vx(s), t0, t, 1e-10);   // ½∮(x dy − y dx) ×2
    const col = ink(ctx);
    plot.setDraw((g) => {
      const span = Math.max(g.view.x1 - g.view.x0, 1e-9);
      // velocity arrows scaled to a fixed fraction of the view (the scale is reported)
      let vmax = 0; for (let i = 0; i <= 200; i++) { const s = t0 + ((t1 - t0) * i) / 200; vmax = Math.max(vmax, Math.hypot(vx(s), vy(s))); }
      const k = vmax > 0 ? (0.18 * span) / vmax : 1;
      if (key === 'cycloid') {
        const a = ctx.params.a, cxw = a * t, cyw = a;
        const circ: [number, number][] = [];
        for (let i = 0; i <= 60; i++) { const p = (2 * Math.PI * i) / 60; circ.push([cxw + a * Math.cos(p), cyw + a * Math.sin(p)]); }
        g.polygon(circ, { color: muted(ctx), width: 1.4, fill: rgba(BLUE, 0.06) });
        g.line([cxw, cyw], [X, Y], { color: muted(ctx), width: 1.4 });
        g.point([cxw, cyw], 3, { fill: muted(ctx) });
        g.line([g.view.x0, 0], [g.view.x1, 0], { color: muted(ctx), width: 2 });
      }
      if (ctx.toggles.trace) g.parametric(fx, fy, t0, t, { color: BLUE, width: 2.8 }, 900);
      else { g.parametric(fx, fy, t0, t1, { color: BLUE, width: 2.6 }, 1400); g.parametric(fx, fy, t0, t, { color: GOLD, width: 1.6, alpha: 0.9 }, 900); }
      if (ctx.toggles.tan && speed > 1e-9) { const L = span * 0.3; g.line([X - (VX / speed) * L, Y - (VY / speed) * L], [X + (VX / speed) * L, Y + (VY / speed) * L], { color: rgba(VIOLET, 0.7), width: 1.4, dash: [6, 4] }); }
      if (ctx.toggles.vel) g.arrow([X, Y], [X + VX * k, Y + VY * k], { color: RED, width: 2.6 });
      if (ctx.toggles.acc) g.arrow([X, Y], [X + AX * k * 0.5, Y + AY * k * 0.5], { color: GREEN, width: 2.6 });
      g.handle({ id: 'pt', at: [X, Y], color: GOLD, label: `t = ${fmt(t, 4)}`, onDrag: (p) => {
        let best = t, bd = Infinity;
        for (let i = 0; i <= 1500; i++) { const s = t0 + ((t1 - t0) * i) / 1500; const dd = Math.hypot(fx(s) - p[0], fy(s) - p[1]) + 0.002 * Math.abs(s - t) * span; if (dd < bd) { bd = dd; best = s; } }
        ctx.setParam('t', +best.toFixed(4));
      } });
      g.text([g.view.x0, g.view.y1], `x(t) = ${xs.replace(/\*/g, '·')}`, { color: col, font: FONT }, 10, 22);
      g.text([g.view.x0, g.view.y1], `y(t) = ${ys.replace(/\*/g, '·')}`, { color: col, font: FONT }, 10, 40);
      g.text([g.view.x0, g.view.y1], `t from ${fmt(t0, 4)} to ${fmt(t1, 4)}${ctx.toggles.vel ? `   red: velocity (× ${fmt(k, 2)})` : ''}${ctx.toggles.acc ? `   green: acceleration (× ${fmt(k / 2, 2)})` : ''}`, { color: muted(ctx), font: FONT }, 10, 58);
    });
    const slope = Math.abs(VX) < 1e-12 ? (Math.abs(VY) < 1e-12 ? NaN : Infinity) : VY / VX;
    ctx.warn(ctx.params.t !== t ? `This curve uses ${fmt(t0, 4)} ≤ t ≤ ${fmt(t1, 4)}.` : '');
    ctx.setReadouts([
      { label: 'point (x, y)', value: `(${fmt(X, 5)}, ${fmt(Y, 5)})` },
      { label: 'velocity (x′, y′)', value: `(${fmt(VX, 5)}, ${fmt(VY, 5)})` },
      { label: 'speed |r′|', value: fmt(speed, 6), tone: speed < 1e-6 ? 'warn' : undefined },
      { label: 'slope dy/dx = y′/x′', value: Number.isNaN(slope) ? 'undefined (0/0: a cusp or a stop)' : Number.isFinite(slope) ? fmt(slope, 6) : 'vertical tangent' },
      { label: 'acceleration (x″, y″)', value: `(${fmt(AX, 5)}, ${fmt(AY, 5)})` },
      { label: `arc length from t = ${fmt(t0, 3)}`, value: fmt(arc.value, 10) },
      { label: 'area swept from the origin, ½∫(x dy − y dx)', value: fmt(area.value / 2, 10) },
      ...(C.dX && C.dY ? [{ label: 'r′(t)', value: `\\left(${toTeX(C.dX)},\\ ${toTeX(C.dY)}\\right)`, tex: true }] : []),
    ]);
    ctx.setNote(P.note);
  };
  let dir = 1;
  return {
    update,
    tick(dt) { const [t0, t1] = range(); let s = clamp(ctx.params.t, t0, t1) + dir * dt * (t1 - t0) / 10; if (s >= t1) { s = t1; dir = -1; } else if (s <= t0) { s = t0; dir = 1; } ctx.setParam('t', s); update(); },
    dispose() {},
  };
}
