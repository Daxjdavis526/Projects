// Trigonometric substitution with a live reference triangle: the three square
// roots √(a² − x²), √(a² + x²), √(x² − a²) are sides of a right triangle, and
// the substitution is just reading an angle off that triangle.

import type { DemoDef, DemoCtx, DemoInstance, StepRow } from '../types';
import { integrate } from '../../core/numeric/quad';
import { fmt, texNum, ink, muted, rgba, clamp, BLUE, GOLD, GREEN, RED, VIOLET, FONT, symbolicRunner, sympyIntegralRows, mtex, safeTutorial } from './util';

type Form = 'sin' | 'tan' | 'sec';
interface FormDef {
  label: string; root: string; sub: string; integrandTeX: string; lower: (a: number) => number; xr: (a: number) => [number, number];
  f: (x: number, a: number) => number; theta: (x: number, a: number) => number;
  /** the antiderivative in θ, and back in x (both exact), measured from the lower limit */
  Ftheta: (th: number, a: number) => number; Fx: (x: number, a: number) => number;
  thetaTeX: string; xTeX: string; src: (A: string) => string; steps: StepRow[]; physics: string;
}

const FORMS: Record<Form, FormDef> = {
  sin: {
    label: '√(a² − x²): x = a sin θ', root: '\\sqrt{a^2 - x^2}', sub: 'x = a\\sin\\theta', integrandTeX: '\\sqrt{a^2-x^2}',
    lower: () => 0, xr: (a) => [-a, a],
    f: (x, a) => Math.sqrt(Math.max(0, a * a - x * x)), theta: (x, a) => Math.asin(clamp(x / a, -1, 1)),
    Ftheta: (th, a) => (a * a / 2) * (th + Math.sin(th) * Math.cos(th)),
    Fx: (x, a) => (a * a / 2) * Math.asin(clamp(x / a, -1, 1)) + (x / 2) * Math.sqrt(Math.max(0, a * a - x * x)),
    thetaTeX: '\\tfrac{a^2}{2}\\left(\\theta + \\sin\\theta\\cos\\theta\\right)', xTeX: '\\tfrac{a^2}{2}\\arcsin\\tfrac{x}{a} + \\tfrac{x}{2}\\sqrt{a^2-x^2}',
    src: (A) => `sqrt(${A}^2 - x^2)`,
    steps: [
      { title: 'Read the substitution off the triangle', tex: 'x = a\\sin\\theta,\\quad dx = a\\cos\\theta\\,d\\theta,\\quad \\sqrt{a^2-x^2} = a\\cos\\theta', detail: 'Hypotenuse a, opposite side x: the remaining side is √(a² − x²) by Pythagoras — and it is a cos θ.', rule: 'triangle' },
      { title: 'The root disappears', tex: '\\int\\sqrt{a^2-x^2}\\,dx = \\int a\\cos\\theta\\cdot a\\cos\\theta\\,d\\theta = a^2\\int\\cos^2\\theta\\,d\\theta', rule: 'substitution' },
      { title: 'Half-angle identity (an even power — see Trigonometric integrals)', tex: 'a^2\\int\\tfrac{1+\\cos2\\theta}{2}\\,d\\theta = \\tfrac{a^2}{2}\\left(\\theta + \\sin\\theta\\cos\\theta\\right) + C', rule: 'identity' },
      { title: 'Back to x with the triangle: sin θ = x/a, cos θ = √(a² − x²)/a', tex: '= \\tfrac{a^2}{2}\\arcsin\\tfrac{x}{a} + \\tfrac{x}{2}\\sqrt{a^2-x^2} + C', rule: 'triangle' },
    ],
    physics: 'Geometrically the answer is a circular sector (a²θ/2) plus a triangle (x·√(a²−x²)/2) — turn on the geometric picture.',
  },
  tan: {
    label: '√(a² + x²): x = a tan θ', root: '\\sqrt{a^2 + x^2}', sub: 'x = a\\tan\\theta', integrandTeX: '\\dfrac{1}{(a^2+x^2)^{3/2}}',
    lower: () => 0, xr: (a) => [-4 * a, 4 * a],
    f: (x, a) => Math.pow(a * a + x * x, -1.5), theta: (x, a) => Math.atan(x / a),
    Ftheta: (th, a) => Math.sin(th) / (a * a), Fx: (x, a) => x / (a * a * Math.sqrt(a * a + x * x)),
    thetaTeX: '\\tfrac{1}{a^2}\\sin\\theta', xTeX: '\\dfrac{x}{a^2\\sqrt{a^2+x^2}}',
    src: (A) => `1/(${A}^2 + x^2)^(3/2)`,
    steps: [
      { title: 'Read the substitution off the triangle', tex: 'x = a\\tan\\theta,\\quad dx = a\\sec^2\\theta\\,d\\theta,\\quad \\sqrt{a^2+x^2} = a\\sec\\theta', detail: 'Legs a and x: the hypotenuse is √(a² + x²) = a sec θ.', rule: 'triangle' },
      { title: 'The root disappears', tex: '\\int\\frac{dx}{(a^2+x^2)^{3/2}} = \\int\\frac{a\\sec^2\\theta}{a^3\\sec^3\\theta}\\,d\\theta = \\frac{1}{a^2}\\int\\cos\\theta\\,d\\theta', rule: 'substitution' },
      { title: 'Integrate', tex: '= \\tfrac{1}{a^2}\\sin\\theta + C', rule: 'table' },
      { title: 'Back to x: sin θ = opposite/hypotenuse', tex: '= \\dfrac{x}{a^2\\sqrt{a^2+x^2}} + C', rule: 'triangle' },
    ],
    physics: 'Physics: this is the electric field of a charged rod. A segment of charge density λ at distance a gives E = kλa ∫ dx/(a² + x²)^{3/2} = (kλ/a)(sin θ₂ − sin θ₁) — the angles of this very triangle; an infinite rod (θ → ±90°) gives 2kλ/a.',
  },
  sec: {
    label: '√(x² − a²): x = a sec θ', root: '\\sqrt{x^2 - a^2}', sub: 'x = a\\sec\\theta', integrandTeX: '\\dfrac{\\sqrt{x^2-a^2}}{x}',
    lower: (a) => a, xr: (a) => [a, 4 * a],
    f: (x, a) => (x >= a ? Math.sqrt(x * x - a * a) / x : NaN), theta: (x, a) => Math.acos(clamp(a / x, -1, 1)),
    Ftheta: (th, a) => a * (Math.tan(th) - th), Fx: (x, a) => Math.sqrt(Math.max(0, x * x - a * a)) - a * Math.acos(clamp(a / x, -1, 1)),
    thetaTeX: 'a\\left(\\tan\\theta - \\theta\\right)', xTeX: '\\sqrt{x^2-a^2} - a\\,\\operatorname{arcsec}\\tfrac{x}{a}',
    src: (A) => `sqrt(x^2 - ${A}^2)/x`,
    steps: [
      { title: 'Read the substitution off the triangle', tex: 'x = a\\sec\\theta,\\quad dx = a\\sec\\theta\\tan\\theta\\,d\\theta,\\quad \\sqrt{x^2-a^2} = a\\tan\\theta', detail: 'Hypotenuse x, adjacent side a: the opposite side is √(x² − a²) = a tan θ.', rule: 'triangle' },
      { title: 'The root disappears', tex: '\\int\\frac{\\sqrt{x^2-a^2}}{x}\\,dx = \\int\\frac{a\\tan\\theta}{a\\sec\\theta}\\,a\\sec\\theta\\tan\\theta\\,d\\theta = a\\int\\tan^2\\theta\\,d\\theta', rule: 'substitution' },
      { title: 'Use tan²θ = sec²θ − 1', tex: 'a\\int(\\sec^2\\theta - 1)\\,d\\theta = a(\\tan\\theta - \\theta) + C', rule: 'identity' },
      { title: 'Back to x: tan θ = √(x² − a²)/a, θ = arcsec(x/a)', tex: '= \\sqrt{x^2-a^2} - a\\,\\operatorname{arcsec}\\tfrac{x}{a} + C', rule: 'triangle' },
    ],
    physics: 'The secant substitution needs x ≥ a: the triangle has hypotenuse x and cannot exist when x < a, just as the root is not real there.',
  },
};

export const trigsubDemo: DemoDef = {
  id: 'calc2.trigsub', module: 'calc2', title: 'Trigonometric substitution', topic: 'Trigonometric substitution and the reference triangle',
  summary: 'Each of √(a² − x²), √(a² + x²), √(x² − a²) is a side of a right triangle. Naming an angle θ in that triangle turns the root into a trigonometric function — and the triangle converts the answer back to x.',
  tex: '\\sqrt{a^2-x^2}\\;\\xrightarrow{x = a\\sin\\theta}\\; a\\cos\\theta',
  view: 'split2d',
  params: [
    { key: 'a', label: 'a', value: 2, min: 0.5, max: 3, step: 0.05 },
    { key: 'x', label: 'upper limit x (drag)', value: 1.2, min: -12, max: 12, step: 0.01 },
  ],
  choices: [{ key: 'form', label: 'Square root', value: 'sin', options: (Object.keys(FORMS) as Form[]).map((k) => [k, FORMS[k].label]) }],
  toggles: [{ key: 'geo', label: 'Geometric picture (sector + triangle)', value: true }],
  experiments: [
    'Drag x and watch the triangle: θ is the angle whose sine (or tangent, or secant) is x/a — exactly the substitution.',
    'For √(a² − x²), turn on the geometric picture: the area is a sector of angle θ plus a triangle — the two terms of the answer.',
    'Choose √(a² + x²) and drag x far out: θ approaches 90° and the integral approaches 1/a² — the field of an infinitely long charged rod.',
    'Choose √(x² − a²) and try to drag x below a: the triangle cannot close — the root is not real there.',
  ],
  connections: ['calc2.trigint', 'calc2.parts', 'calc2.polar'],
  accuracy: 'The antiderivatives (in θ and in x) are exact; their values are compared with adaptive quadrature (≈1e−10). SymPy works the same integral with a rounded a (a/100 as an exact fraction).',
  tutorial: safeTutorial([
    { text: '**Why a triangle?** Pythagoras says the three sides of a right triangle satisfy $\\text{hyp}^2 = \\text{opp}^2 + \\text{adj}^2$. So $\\sqrt{a^2 - x^2}$ is a leg of a triangle whose hypotenuse is $a$ and other leg is $x$. Calling the angle opposite $x$ by the name $\\theta$, we get $x = a\\sin\\theta$ — that *is* the substitution.', set: { choices: { form: 'sin' }, params: { a: 2, x: 1.2 }, toggles: { geo: false } }, task: 'Drag x (left plot) and watch θ follow in the triangle.' },
    { text: 'With $x = a\\sin\\theta$: $dx = a\\cos\\theta\\,d\\theta$ and the root becomes $a\\cos\\theta$ — no root left. The integral is $a^2\\int\\cos^2\\theta\\,d\\theta = \\tfrac{a^2}{2}(\\theta + \\sin\\theta\\cos\\theta)$.', task: 'Compare the readouts “in θ” and “in x”: they agree.' },
    { text: '**Geometry check.** The area under the circle $y = (a^2 - x^2)^{1/2}$ from 0 to $x$ is a circular sector with angle $\\theta$ (area $a^2\\theta/2$) plus a triangle (area $\\tfrac12 x\\,(a^2-x^2)^{1/2}$) — the two terms of the answer, one each.', set: { toggles: { geo: true } }, task: 'Drag x all the way to a: the area becomes a quarter disc, πa²/4.', done: (c) => Math.abs(c.params.x - c.params.a) < 0.03 },
    { text: 'For $\\sqrt{a^2 + x^2}$ the legs are $a$ and $x$; the hypotenuse is the root. So $x = a\\tan\\theta$ and the root is $a\\sec\\theta$. Integrating $1/(a^2+x^2)^{3/2}$ gives $\\sin\\theta/a^2$ — which you read off the triangle as $x/(a^2(a^2+x^2)^{1/2})$.', set: { choices: { form: 'tan' }, params: { a: 1, x: 1 } }, task: 'Drag x to make θ = 60° (x = a√3).', done: (c) => Math.abs(Math.atan(c.params.x / c.params.a) - Math.PI / 3) < 0.01 },
    { text: '**Physics.** The field of a uniformly charged rod at distance $a$ involves exactly this integral; the answer $(\\sin\\theta_2 - \\sin\\theta_1)/a$ uses the angles to the rod’s ends. As the rod becomes infinite, $\\theta \\to 90°$ and the integral tends to $1/a^2$.', task: 'Drag x far to the right and watch the integral approach 1/a².' },
    { text: 'For $\\sqrt{x^2 - a^2}$ the root is a leg and $x$ the hypotenuse: $x = a\\sec\\theta$, root $= a\\tan\\theta$. The triangle exists only when $x \\ge a$ — the same condition that makes the root real.', set: { choices: { form: 'sec' }, params: { a: 1, x: 2 } } },
  ]),
  create: (ctx) => createTrigSub(ctx),
};

function createTrigSub(ctx: DemoCtx): DemoInstance {
  const L = ctx.plot!, R = ctx.plot2!;
  R.opts.equal = true; R.opts.pan = false; R.opts.grid = false; R.opts.axes = false;
  L.opts.xLabel = 'x';
  const runner = symbolicRunner(ctx);
  let lastKey = '';
  const update = () => {
    const form = (ctx.choices.form as Form) in FORMS ? (ctx.choices.form as Form) : 'sin';
    const F = FORMS[form], a = ctx.params.a;
    const [lo, hi] = F.xr(a);
    const x = clamp(ctx.params.x, lo, hi);
    ctx.warn(x !== ctx.params.x ? (form === 'sec' && ctx.params.x < a ? `√(x² − a²) is not real for x < a = ${fmt(a, 3)}: the triangle with hypotenuse x and leg a cannot be drawn. Using x = ${fmt(x, 3)}.` : `For this picture x stays in [${fmt(lo, 3)}, ${fmt(hi, 3)}]; using x = ${fmt(x, 3)}.`) : '');
    const x0 = F.lower(a), th = F.theta(x, a), th0 = F.theta(x0, a);
    const viaTheta = F.Ftheta(th, a) - F.Ftheta(th0, a), viaX = F.Fx(x, a) - F.Fx(x0, a);
    const q = integrate((t) => F.f(t, a), x0, x, 1e-11);
    const key = `${form}|${a}`;
    if (key !== lastKey) {
      lastKey = key;
      let M = 0; for (let i = 0; i <= 300; i++) { const v = F.f(lo + ((hi - lo) * i) / 300, a); if (Number.isFinite(v)) M = Math.max(M, v); }
      L.setView({ x0: Math.min(lo, 0) - (hi - lo) * 0.08, x1: hi + (hi - lo) * 0.08, y0: -M * 0.15, y1: M * 1.25 });
    }
    const t = ink(ctx);
    L.setDraw((g) => {
      const fx = (s: number) => F.f(s, a);
      g.fillBetween(fx, () => 0, Math.min(x0, x), Math.max(x0, x), { fill: rgba(GOLD, 0.3) });
      if (form === 'sin' && ctx.toggles.geo) {
        // sector from the y-axis to the radius through (x, y), and the triangle under that radius
        const y = fx(x), arc: [number, number][] = [[0, 0]];
        const phi1 = Math.PI / 2, phi2 = Math.atan2(y, x);
        for (let i = 0; i <= 40; i++) { const p = phi1 + ((phi2 - phi1) * i) / 40; arc.push([a * Math.cos(p), a * Math.sin(p)]); }
        g.polygon(arc, { fill: rgba(VIOLET, 0.35), color: VIOLET, width: 1.5 });
        g.polygon([[0, 0], [x, 0], [x, y]], { fill: rgba(BLUE, 0.35), color: BLUE, width: 1.5 });
        g.text([a * Math.cos((phi1 + phi2) / 2) * 0.55, a * Math.sin((phi1 + phi2) / 2) * 0.55], 'sector  a²θ/2', { color: VIOLET, font: FONT, align: 'center' });
        g.text([x * 0.62, y * 0.22], 'triangle', { color: BLUE, font: FONT, align: 'center' });
      }
      g.fn(fx, { color: GOLD, width: 2.6 }, [lo, hi]);
      g.text([g.view.x1, g.view.y1], `y = ${form === 'sin' ? '√(a² − x²)' : form === 'tan' ? '1/(a² + x²)^{3/2}' : '√(x² − a²)/x'}`, { color: GOLD, font: FONT, align: 'right' }, -12, 22);
      g.handle({ id: 'x', at: [x, fx(x)], color: GREEN, label: `x = ${fmt(x, 3)}`, constrain: ([px]) => [clamp(px, lo, hi), fx(clamp(px, lo, hi))], onDrag: ([px]) => ctx.setParam('x', +clamp(px, lo, hi).toFixed(3)) });
    });

    // the reference triangle: angle θ at the origin, adjacent along +x
    const root = form === 'sin' ? Math.sqrt(Math.max(0, a * a - x * x)) : form === 'tan' ? Math.sqrt(a * a + x * x) : Math.sqrt(Math.max(0, x * x - a * a));
    const [adj, opp] = form === 'sin' ? [root, x] : form === 'tan' ? [a, x] : [a, root];
    const labels = form === 'sin' ? { adj: `√(a² − x²) = ${fmt(root, 3)}`, opp: `x = ${fmt(x, 3)}`, hyp: `a = ${fmt(a, 3)}` }
      : form === 'tan' ? { adj: `a = ${fmt(a, 3)}`, opp: `x = ${fmt(x, 3)}`, hyp: `√(a² + x²) = ${fmt(root, 3)}` }
        : { adj: `a = ${fmt(a, 3)}`, opp: `√(x² − a²) = ${fmt(root, 3)}`, hyp: `x = ${fmt(x, 3)}` };
    const s = Math.max(Math.abs(adj), Math.abs(opp), 0.3);
    R.setView({ x0: -0.35 * s, x1: Math.max(adj, 0.3) + 0.9 * s, y0: Math.min(0, opp) - 0.35 * s, y1: Math.max(0, opp) + 0.35 * s });
    R.setDraw((g) => {
      const A: [number, number] = [0, 0], B: [number, number] = [adj, 0], C: [number, number] = [adj, opp];
      g.polygon([A, B, C], { fill: rgba(BLUE, 0.12), color: t, width: 2.4 });
      const sq = 0.07 * s, sg = Math.sign(opp) || 1;
      g.path([[adj - sq, 0], [adj - sq, sg * sq], [adj, sg * sq]], { color: muted(ctx), width: 1.2 });
      const arc: [number, number][] = [];
      const r = 0.22 * s;
      for (let i = 0; i <= 30; i++) { const p = (th * i) / 30; arc.push([r * Math.cos(p), r * Math.sin(p)]); }
      g.path(arc, { color: RED, width: 2 });
      g.text([r * 1.25 * Math.cos(th / 2), r * 1.25 * Math.sin(th / 2)], `θ = ${fmt((th * 180) / Math.PI, 3)}°`, { color: RED, font: FONT, baseline: 'middle' }, 6, 0);
      g.text([adj / 2, 0], labels.adj, { color: form === 'sin' ? GOLD : t, font: FONT, align: 'center', baseline: sg > 0 ? 'top' : 'bottom' }, 0, sg > 0 ? 8 : -8);
      g.text([adj, opp / 2], labels.opp, { color: form === 'sec' ? GOLD : t, font: FONT, baseline: 'middle' }, 10, 0);
      g.text([adj / 2, opp / 2], labels.hyp, { color: form === 'tan' ? GOLD : t, font: FONT, align: 'right', baseline: sg > 0 ? 'bottom' : 'top' }, -10, sg > 0 ? -6 : 6);
      const rel = form === 'sin' ? `sin θ = x / a = ${fmt(x / a, 4)}` : form === 'tan' ? `tan θ = x / a = ${fmt(x / a, 4)}` : `sec θ = x / a = ${fmt(x / a, 4)}`;
      g.text([g.view.x0, g.view.y1], rel, { color: t, font: '600 14px Inter, sans-serif' }, 12, 24);
      g.text([g.view.x0, g.view.y1], 'the reference triangle', { color: muted(ctx), font: '12px Inter, sans-serif' }, 12, 44);
    });

    const ok = Math.abs(viaTheta - q.value) < 1e-8 * Math.max(1, Math.abs(q.value)) && Math.abs(viaX - q.value) < 1e-8 * Math.max(1, Math.abs(q.value));
    ctx.setReadouts([
      { label: 'θ', value: `${fmt(th, 6)} rad = ${fmt((th * 180) / Math.PI, 5)}°` },
      { label: 'antiderivative in θ', value: F.thetaTeX, tex: true },
      { label: 'antiderivative back in x', value: F.xTeX, tex: true },
      { label: `∫ from ${fmt(x0, 3)} to x, evaluated in θ`, value: fmt(viaTheta, 10) },
      { label: '… evaluated in x', value: fmt(viaX, 10) },
      { label: 'adaptive quadrature', value: `${fmt(q.value, 10)}  (±${q.error.toExponential(0)})`, tone: ok ? 'good' : 'bad' },
      ...(form === 'tan' ? [{ label: 'limit as x → ∞  (infinite rod)', value: `1/a² = ${fmt(1 / (a * a), 6)}` }] : []),
      ...(form === 'sin' && ctx.toggles.geo ? [{ label: 'sector + triangle', value: `${fmt((a * a / 2) * (Math.PI / 2 - Math.atan2(F.f(x, a), x)), 6)} + ${fmt((x * F.f(x, a)) / 2, 6)}` }] : []),
    ]);
    ctx.setNote(mtex(`Substitute $${F.sub}$: the root $${F.root}$ becomes a side of the triangle. ${F.physics}`));
    const A = `(${Math.round(a * 100)}/100)`;
    runner.request(`${form}|${A}`, [...F.steps, { title: `Definite, from ${fmt(x0, 3)} to ${fmt(x, 4)}`, tex: `= ${texNum(viaX, 10)}`, detail: `Quadrature: ${fmt(q.value, 10)}.`, rule: 'check' }], () => sympyIntegralRows(F.src(A)));
  };
  return { update, dispose() { runner.dispose(); } };
}
