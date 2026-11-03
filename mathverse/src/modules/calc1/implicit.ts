// Implicit differentiation: a curve F(x, y) = 0 with a point you drag along it
// (projected back onto the curve by Newton's method) and its tangent line,
// slope dy/dx = −F_x / F_y from exact partial derivatives.

import type { DemoDef, DemoCtx, DemoInstance, Readout } from '../types';
import { Node, parse, compile, toTeX, freeSymbols, CONSTANTS, sub } from '../../core/expr';
import { fmtc, fmtTeX, dx, ink, muted, SERIES, SMALL, txt } from './common';

interface Curve { F: Node; lhs: Node; rhs: Node; Fx: Node | null; Fy: Node | null; src: string }

function readCurve(src: string): Curve {
  const parts = src.split('=');
  if (parts.length > 2) throw new Error('Use one “=” sign, e.g.  x^2 + y^2 = 25');
  const lhs = parse(parts[0], { names: ['x', 'y'] });
  const rhs = parts.length === 2 ? parse(parts[1], { names: ['x', 'y'] }) : { t: 'num', v: 0 } as Node;
  const F = sub(lhs, rhs);
  const stray = [...freeSymbols(F)].filter((s) => s !== 'x' && s !== 'y' && !(s in CONSTANTS));
  if (stray.length) throw new Error(`“${stray[0]}” has no value — write the curve in x and y only`);
  const fs = freeSymbols(F);
  if (!fs.has('y')) throw new Error('The equation needs y in it (otherwise it is not a curve in the plane)');
  return { F, lhs, rhs, Fx: dx(F, 'x'), Fy: dx(F, 'y'), src };
}

function implicitDemo(ctx: DemoCtx): DemoInstance {
  const plot = ctx.plot!;
  plot.opts.equal = true; plot.opts.xLabel = 'x'; plot.opts.yLabel = 'y';
  const fallback = 'x^3 + y^3 = 6 x y';
  let cv = readCurve(fallback), lastSrc = '', perr = '';
  let F = (x: number, y: number) => NaN, Fx = F, Fy = F;

  const rebuild = () => {
    const src = ctx.input || fallback;
    if (src === lastSrc) return false;
    lastSrc = src;
    try { cv = readCurve(src); perr = ''; } catch (e) { perr = `${(e as Error).message}. Showing the last curve that worked.`; }
    const c = compile(cv.F, ['x', 'y']);
    F = (x, y) => c([x, y]);
    const num = (i: 0 | 1) => (x: number, y: number) => { const h = 1e-6; return i ? (F(x, y + h) - F(x, y - h)) / (2 * h) : (F(x + h, y) - F(x - h, y)) / (2 * h); };
    const cx = cv.Fx ? compile(cv.Fx, ['x', 'y']) : null, cy = cv.Fy ? compile(cv.Fy, ['x', 'y']) : null;
    Fx = cx ? (x, y) => cx([x, y]) : num(0);
    Fy = cy ? (x, y) => cy([x, y]) : num(1);
    plot.setView({ x0: -6, x1: 6, y0: -4.5, y1: 4.5 });
    return true;
  };

  /** Newton projection onto F = 0 along the gradient; null when it does not converge. */
  const project = (p: [number, number]): [number, number] | null => {
    let [x, y] = p;
    for (let k = 0; k < 40; k++) {
      const f = F(x, y), gx = Fx(x, y), gy = Fy(x, y), g2 = gx * gx + gy * gy;
      if (!Number.isFinite(f) || !(g2 > 1e-24)) return null;
      const s = f / g2;
      x -= s * gx; y -= s * gy;
      if (Math.abs(f) < 1e-13) break;
    }
    const f = F(x, y);
    return Number.isFinite(f) && Math.abs(f) < 1e-8 && Math.hypot(x - p[0], y - p[1]) < 3 ? [x, y] : null;
  };

  const update = () => {
    const fresh = rebuild();
    let px = ctx.params.px, py = ctx.params.py;
    if (fresh || Math.abs(F(px, py)) > 1e-8) {
      const q = project([px, py]) ?? project([3, 3]) ?? project([1, 1]) ?? project([-1, 2]);
      if (q) { [px, py] = q; ctx.setParam('px', px); ctx.setParam('py', py); }
    }
    const fx = Fx(px, py), fy = Fy(px, py), slope = -fx / fy;
    const g2 = Math.hypot(fx, fy);
    const singular = g2 < 1e-9, vertical = !singular && Math.abs(fy) < 1e-9 * Math.max(1, Math.abs(fx));
    plot.setDraw((g) => {
      if (ctx.toggles.levels) {
        for (let k = -4; k <= 4; k++) if (k) {
          const c = k * k * Math.sign(k) * 0.6;
          g.implicit((x, y) => F(x, y) - c, { color: k > 0 ? 'rgba(239,107,115,0.35)' : 'rgba(106,169,255,0.35)', width: 1 }, 140);
        }
      }
      g.implicit((x, y) => F(x, y), { color: SERIES[0], width: 2.6 }, 240);
      const span = (g.view.x1 - g.view.x0) * 0.35;
      if (!singular && ctx.toggles.tangent) {
        // the tangent direction is perpendicular to ∇F = (F_x, F_y)
        const tx = -fy / g2, ty = fx / g2;
        g.line([px - tx * span, py - ty * span], [px + tx * span, py + ty * span], { color: SERIES[1], width: 2.2 });
      }
      if (!singular && ctx.toggles.grad) {
        const L = (g.view.x1 - g.view.x0) * 0.08;
        g.arrow([px, py], [px + (fx / g2) * L, py + (fy / g2) * L], { color: SERIES[4], width: 2 });
        g.text([px + (fx / g2) * L, py + (fy / g2) * L], '∇F', { color: txt(ctx, SERIES[4]), font: SMALL }, 6, -4);
      }
      g.handle({ id: 'P', at: [px, py], color: ink(ctx), label: 'P', onDrag: (p) => { const q = project(p); if (q) { ctx.setParam('px', q[0]); ctx.setParam('py', q[1]); update(); } } });
      g.text([g.view.x1, g.view.y0], ctx.toggles.levels ? 'other level sets F = c: red c > 0, blue c < 0' : '', { color: muted(ctx), font: SMALL, align: 'right', baseline: 'bottom' }, -12, -10);
    });
    const rows: Readout[] = [
      { label: 'P', value: `(${fmtc(px, 6)}, ${fmtc(py, 6)})` },
      { label: 'F(P)  (residual)', value: Math.abs(F(px, py)).toExponential(1), tone: 'muted' },
      { label: `∂F/∂x at P${cv.Fx ? '' : ' (numerical)'}`, value: fmtc(fx, 6) },
      { label: `∂F/∂y at P${cv.Fy ? '' : ' (numerical)'}`, value: fmtc(fy, 6) },
      { label: 'dy/dx = −F_x / F_y', value: singular ? 'undefined (singular point)' : vertical ? '∞ (vertical tangent)' : fmtc(slope, 8), tone: singular || vertical ? 'warn' : 'good' },
    ];
    if (cv.Fx) rows.push({ label: '∂F/∂x', value: toTeX(cv.Fx), tex: true });
    if (cv.Fy) rows.push({ label: '∂F/∂y', value: toTeX(cv.Fy), tex: true });
    ctx.setReadouts(rows);
    const fxT = cv.Fx ? toTeX(cv.Fx) : 'F_x', fyT = cv.Fy ? toTeX(cv.Fy) : 'F_y';
    ctx.setSteps([
      { title: 'The curve', tex: `${toTeX(cv.lhs)} = ${toTeX(cv.rhs)}`, detail: 'y is not given as a formula in x, but near most points the curve is the graph of some y(x).' },
      { title: 'Differentiate both sides with respect to x, treating y as y(x)', tex: `\\frac{d}{dx}\\Big[F(x, y(x))\\Big] = F_x + F_y\\,\\frac{dy}{dx} = 0`, rule: 'chain rule' },
      { title: 'The partial derivatives', tex: `F_x = ${fxT},\\qquad F_y = ${fyT}`, rule: 'exact' },
      { title: 'Solve for dy/dx', tex: `\\frac{dy}{dx} = -\\frac{F_x}{F_y} = -\\frac{${fxT}}{${fyT}}`, rule: 'algebra' },
      { title: 'At P', tex: singular ? '\\text{both partials vanish: no tangent slope from this formula}' : vertical ? `F_y = 0:\\ \\text{vertical tangent}` : `\\frac{dy}{dx} = -\\frac{${fmtTeX(fx, 6)}}{${fmtTeX(fy, 6)}} = ${fmtTeX(slope, 8)}` },
    ]);
    ctx.setNote(`Differentiate the equation itself, remembering that $y$ depends on $x$ (chain rule): every $y$-term picks up a factor $\\tfrac{dy}{dx}$. Solving gives $\\dfrac{dy}{dx} = -\\dfrac{F_x}{F_y}$. The gold tangent is perpendicular to the violet gradient $\\nabla F$: the curve is the level set $F = 0$, and the gradient always crosses level sets at right angles. Where $F_y = 0$ the tangent is vertical and the curve is not locally a graph $y(x)$.`);
    ctx.warn(perr || (singular ? 'P is a singular point: both partial derivatives vanish, so the implicit-function theorem gives no tangent (the curve may cross itself here).' : vertical ? 'F_y = 0 at P: the tangent is vertical and dy/dx does not exist. Near P the curve is a graph x(y), not y(x).' : ''));
  };
  return { update, dispose() {} };
}

export const implicitDemos: DemoDef[] = [
  {
    id: 'calc1.implicit', module: 'calc1', title: 'Implicit differentiation',
    topic: 'Implicit differentiation · implicit curves · tangent lines · vertical tangents',
    summary: 'A curve given by an equation, not a formula y = f(x). Drag a point along it: the tangent comes from differentiating the equation itself, dy/dx = −F_x/F_y.',
    tex: "F(x,y)=0 \\;\\Rightarrow\\; \\frac{dy}{dx} = -\\frac{\\partial F/\\partial x}{\\partial F/\\partial y}",
    view: '2d',
    input: { label: 'Curve', value: 'x^3 + y^3 = 6 x y', placeholder: 'e.g. x^2 + y^2 = 16,  y^2 = x^3 - x,  sin(x y) = y/2' },
    params: [
      { key: 'px', label: 'P: x (drag the point)', value: 3, min: -10, max: 10, step: 0.001 },
      { key: 'py', label: 'P: y', value: 3, min: -10, max: 10, step: 0.001 },
    ],
    toggles: [
      { key: 'tangent', label: 'Tangent line', value: true },
      { key: 'grad', label: 'Gradient ∇F (normal)', value: true },
      { key: 'levels', label: 'Neighbouring level sets', value: false },
    ],
    experiments: [
      'Drag P around the loop of the folium. Where is the tangent horizontal? Where vertical? (Horizontal: F_x = 0. Vertical: F_y = 0.)',
      'Drag P into the origin of the folium: both partials vanish — the curve crosses itself and has two tangents there.',
      'Type x^2 + y^2 = 16: dy/dx = −x/y, the radius and the tangent are perpendicular. At y = 0 the tangent is vertical.',
      'Type y^2 = x^3 - x (an elliptic curve): two pieces, and vertical tangents where it crosses the x-axis.',
      'Turn on the neighbouring level sets: the curve is one contour of the surface z = F(x, y), and ∇F crosses every contour at right angles.',
    ],
    connections: ['calc1.chain', 'calc1.relatedrates', 'calc1.secant'],
    accuracy: 'F_x and F_y are exact symbolic partial derivatives. The curve is traced by marching squares on a grid (thin features smaller than a grid cell can be missed), and the dragged point is projected onto F = 0 by Newton’s method to a residual below 10⁻⁸ (shown).',
    create: implicitDemo,
  },
];
