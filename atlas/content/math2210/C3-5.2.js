// Line integrals: adding up a field along a curve. The work integral
// ∫ F · dr = ∫ F(r(t)) · r′(t) dt, its dependence on direction (not on pace),
// the scalar line integral ∫ f ds (the mass of a wire), and the flux of a
// plane field across a curve.
import { lesson, mcq, num } from '../../src/core/content.js';
import { nice } from '../../src/core/format.js';
import { pickExpr } from './_space.js';
import { r6, co } from './_fields.js';
import * as M from '../../src/viz/model/c3-vector.js';

const t = String.raw;
const PI = Math.PI;

/** A small picture on c3-lineint: field and path(s), no bead, no numbers. */
const linePic = (P, Q, paths, { x = [-3, 3], y = [-1.9, 1.9], caption, ...rest } = {}) => ({
  type: 'c3-lineint',
  params: { P, Q, x, y, paths, bead: false, readout: false, compare: paths.length > 1, ...rest },
  caption,
});
const frac3 = (n) => (n % 3 === 0 ? `${n / 3}` : `\\tfrac{${n}}{3}`);

export default lesson({
  id: 'math2210.C3-5.2',
  title: 'Line integrals',
  minutes: 12, difficulty: 3,
  intro: t`A **line integral** adds up a vector field along a curve $C$. Cut $C$ into small steps $d\vec r$: each step contributes $\vec F\cdot d\vec r$, the part of the field **along** the step times the step’s length. With a parametrization $\vec r(t)$, $a \le t \le b$, a step is $d\vec r = \vec r\,'(t)\,dt$, so

$$\int_C \vec F\cdot d\vec r = \int_a^b \vec F\big(\vec r(t)\big)\cdot\vec r\,'(t)\,dt$$

When $\vec F$ is a force this is the **work** done on a body moving along $C$ — Physics I’s $W = Fd\cos\theta$, for a force that varies along a path that bends — and round a closed loop it is the **circulation** of a flow. Reverse the direction of $C$ and the integral changes sign; trace $C$ faster or slower and it does not change at all.`,
  symbols: [
    { tex: 'C', text: 'the curve, **with a direction**: it runs from a start to an end' },
    { tex: '\\vec r(t),\\ a \\le t \\le b', text: 'a parametrization: the point of $C$ reached at parameter $t$, from the start ($t = a$) to the end ($t = b$)' },
    { tex: "\\vec r\\,'(t)", text: 'the velocity along the curve, tangent to it; one small step is $d\\vec r = \\vec r\\,\'(t)\\,dt$' },
    { tex: '\\vec F\\big(\\vec r(t)\\big)', text: 'the field at the point reached: substitute $x(t)$ and $y(t)$ into $P$ and $Q$' },
    { tex: '\\vec F\\cdot d\\vec r', text: 'the part of $\\vec F$ along the step times its length — in joules when $\\vec F$ is a force in newtons and lengths are in metres' },
    { tex: '\\oint_C', text: 'a line integral round a **closed** curve: the circulation' },
  ],
  why: t`Work and potential energy, voltage $\int\vec E\cdot d\vec l$, the circulation that holds a wing up, and Ampère’s and Faraday’s laws in Physics II are all line integrals.`,
  visual: {
    type: 'c3-lineint',
    title: 'Add up the field along the way',
    lead: t`A bead rides the gold path. At the bead, the gold arrow is $\vec F$, the white arrow the direction of travel $T$, and the thick arrow the part of $\vec F$ along $T$ — blue when it helps the motion, red when it opposes it. The lower graph is the integrand $\vec F\cdot\vec r\,'$ against the parameter; its shaded area so far is the running total. Press **Play**.`,
    tasks: [
      'Whirlpool on the wave: the bead rides with the flow at first and against it later — watch the integrand change sign, and the total end up negative.',
      'Tick “Reverse the direction”: every contribution flips sign, and so does the total.',
      'Change the pace: the integrand’s graph changes shape, but its total area — the line integral — does not.',
      'Uniform push: on either path the total is just the change in x, as for any constant force.',
    ],
    params: {
      P: pickExpr('k', ['1', '-y', 'y']), Q: pickExpr('k', ['0', 'x', '0']),
      x: [-3, 3], y: [-1.9, 1.9],
      choices: [{ key: 'k', label: 'Field', options: [[0, 'Uniform push ⟨1, 0⟩'], [1, 'Whirlpool ⟨−y, x⟩'], [2, 'Shear ⟨y, 0⟩']], value: 1, explain: 'Three fields from the last lesson, each in arbitrary units.' }],
      paths: [
        { x: 't', y: '0.3 + 1.1*sin(1.4*t + 0.5)', t: [-2.5, 2.4], label: 'wave', color: 'gold', labelAt: 0.9, labelDy: -14 },
        { x: '2.4*cos(t)', y: '1.6*sin(t)', t: [0, 'pi'], label: 'arc', color: 'gold', labelAt: 0.28 },
      ],
      reparam: true, at: 0.3,
    },
    caption: t`Field arrows show direction; their lengths are compressed and colour gives strength. The vectors at the bead share one scale. The integrals are computed numerically.`,
  },
  example: {
    prompt: t`A bead is pushed along the parabola $y = x^2$ from $(0, 0)$ to $(1, 1)$ (lengths in metres) by the force field $\vec F = \langle 2y,\ x\rangle$ N. How much work does the field do? Compare the straight path $y = x$ between the same points.`,
    visual: linePic('2*y', 'x', [
      { x: 't', y: 't^2', t: [0, 1], label: 'parabola', color: 'gold', labelAt: 0.75, labelDx: 10, labelDy: 12 },
      { x: 't', y: 't', t: [0, 1], label: 'line', color: 'violet', labelAt: 0.45, labelDx: -46, labelDy: -10 },
    ], { x: [-0.35, 1.45], y: [-0.15, 1.2], readout: true, points: [{ x: 0, y: 0, label: '(0, 0)', labelDx: -46, labelDy: 10 }, { x: 1, y: 1, label: '(1, 1)', labelDx: 8, labelDy: -8 }], caption: t`The field $\langle 2y, x\rangle$ and the two paths. The readout gives each path’s work, computed numerically.` }),
    steps: [
      { label: 'Parametrize', text: t`$\vec r(t) = \langle t,\ t^2\rangle$ for $0 \le t \le 1$ runs along $y = x^2$ from $(0, 0)$ to $(1, 1)$, with $\vec r\,'(t) = \langle 1,\ 2t\rangle$.` },
      { label: 'Field on the curve', text: t`Substitute $x = t$, $y = t^2$: $\vec F(\vec r(t)) = \langle 2t^2,\ t\rangle$.` },
      { label: 'Dot with the step', text: t`$\vec F\cdot\vec r\,' = 2t^2\cdot 1 + t\cdot 2t = 4t^2$.` },
      { label: 'Integrate', text: t`$W = \displaystyle\int_0^1 4t^2\,dt = \tfrac43\ \text{J} \approx 1.33$ J.` },
      { label: 'The straight path', text: t`$\vec r = \langle t, t\rangle$, $\vec r\,' = \langle 1, 1\rangle$, $\vec F = \langle 2t,\ t\rangle$, so $\vec F\cdot\vec r\,' = 3t$ and $W = \int_0^1 3t\,dt = \tfrac32$ J. **Different paths, different work**: this force is not conservative — the next lesson is about the ones that are.` },
      { label: 'Sense check', text: t`Units: newtons times metres are joules. Walked backwards, from $(1, 1)$ to $(0, 0)$ along the parabola, the work is $-\tfrac43$ J.` },
    ],
    answer: t`$W = \tfrac43$ J along the parabola and $\tfrac32$ J along the line.`,
  },
  practice: [
    mcq({
      id: 'sign', difficulty: 1,
      gen(r) {
        const whirl = (x, y) => [-y, x], down = () => [0, -1];
        const arc = { X: (u) => 1.5 * Math.cos(u), Y: (u) => 1.5 * Math.sin(u) };
        const cases = [
          { P: '-y', Q: 'x', F: whirl, c: arc, path: { x: '1.5*cos(t)', y: '1.5*sin(t)', t: [0.3, 2.6] }, what: t`the whirlpool field $\langle -y, x\rangle$, along an arc traced anticlockwise` },
          { P: '-y', Q: 'x', F: whirl, c: arc, path: { x: '1.5*cos(t)', y: '1.5*sin(t)', t: [2.6, 0.3] }, what: t`the whirlpool field $\langle -y, x\rangle$, along an arc traced clockwise` },
          { P: '-y', Q: 'x', F: whirl, c: { X: (u) => 0.2 * u, Y: (u) => 0.15 * u }, path: { x: '0.2*t', y: '0.15*t', t: [2, 11] }, what: t`the whirlpool field $\langle -y, x\rangle$, along a ray straight out from the origin` },
          { P: '0', Q: '-1', F: down, c: { X: (u) => u, Y: (u) => 0.6 * u + 0.35 * Math.sin(2.5 * u) }, path: { x: 't', y: '0.6*t + 0.35*sin(2.5*t)', t: [-2.4, 2.4] }, what: t`a uniform downward field $\langle 0, -1\rangle$ (like gravity), along a path that climbs` },
        ];
        const k = r.int(0, 3), C = cases[k];
        const W = M.work(C.F, C.c, C.path.t[0], C.path.t[1]);
        const ans = Math.abs(W) < 1e-9 ? 2 : W > 0 ? 0 : 1;
        const why = {
          0: t`Positive needs $\vec F$ to have a component **along** the direction of travel; check the arrows against the path’s arrowheads.`,
          1: t`Negative needs $\vec F$ to point **against** the direction of travel; check the arrows against the path’s arrowheads.`,
          2: t`Zero needs $\vec F$ at right angles to the path all along (or contributions that cancel exactly). Here the arrows have a component along the path.`,
          3: t`No formula is needed for the sign: each step contributes $\vec F\cdot d\vec r$, positive where $\vec F$ has a component along the direction of travel and negative where it points against it.`,
        };
        delete why[ans];
        return {
          prompt: t`The picture shows ${C.what}. Is $\int_C \vec F\cdot d\vec r$ positive, negative or zero?`,
          visual: linePic(C.P, C.Q, [{ ...C.path, color: 'gold' }], { caption: 'The field (arrows compressed; colour shows strength) and the path C, its direction marked by arrowheads.' }),
          choices: ['Positive', 'Negative', 'Zero', 'It cannot be told without computing the integral'],
          fixedOrder: true, answer: ans, why,
          hints: [t`At each point compare the field arrow with the direction of travel: is the angle between them less than $90^\circ$, more, or exactly $90^\circ$?`],
          teach: 'Each step adds F · dr = |F||dr| cos θ: positive where the field helps the motion, negative where it opposes it, zero where it is perpendicular.',
          explain: ans === 0 ? t`Along the whole path $\vec F$ has a component along the direction of travel, so every $\vec F\cdot d\vec r > 0$: the integral is $${nice(+W.toPrecision(3))}$.`
            : ans === 1 ? t`Along the whole path $\vec F$ points partly against the direction of travel, so every $\vec F\cdot d\vec r < 0$: the integral is $${nice(+W.toPrecision(3))}$${k === 3 ? ' — negative work, as when you lift something against gravity' : ''}.`
            : t`The whirlpool field is at right angles to every ray from the origin, so $\vec F\cdot d\vec r = 0$ at each step and the integral is $0$.`,
        };
      },
    }),
    num({
      id: 'segment', difficulty: 2,
      gen(r) {
        const [a, b] = r.pick([[2, 1], [1, 2], [2, 3], [3, 1], [1, 3], [3, 2]]);
        const W = (a * b * b) / 3 + (a * b) / 2;
        return {
          prompt: t`Find $\displaystyle\int_C \vec F\cdot d\vec r$ for $\vec F = \langle y^2,\ x\rangle$ along the straight segment $C$ from $(0, 0)$ to $(${a}, ${b})$.`,
          visual: linePic('y^2', 'x', [{ x: `${a}*t`, y: `${b}*t`, t: [0, 1], color: 'gold' }], { x: [-0.8, 4.2], y: [-0.4, 3.4], points: [{ x: 0, y: 0, label: '(0, 0)', labelDx: -12, labelDy: 12, labelAlign: 'right' }, { x: a, y: b, label: `(${a}, ${b})` }], caption: t`The field $\langle y^2, x\rangle$ (arrows compressed) and the segment $C$.` }),
          answer: W, tol: { rel: 1e-3 },
          errors: [
            { value: (b * b) / 3 + a / 2, feedback: t`You dropped $\vec r\,'(t)$. With $\vec r = \langle ${co(a, 't')}, ${co(b, 't')}\rangle$, the step is $d\vec r = \langle ${a}, ${b}\rangle\,dt$, and those components multiply $P$ and $Q$.` },
            { value: a * b * b + a * b, feedback: t`That treats $\vec F$ as constant, equal to its value at the end. The field changes along the segment: integrate.` },
          ],
          hints: [t`Parametrize: $\vec r(t) = \langle ${co(a, 't')},\ ${co(b, 't')}\rangle$, $0 \le t \le 1$, so $\vec r\,'(t) = \langle ${a},\ ${b}\rangle$.`, t`$\vec F(\vec r(t)) = \langle ${co(b * b, 't^2')},\ ${co(a, 't')}\rangle$, so $\vec F\cdot\vec r\,' = ${co(a * b * b, 't^2')} + ${co(a * b, 't')}$.`],
          teach: 'Parametrize, substitute the curve into the field, dot with r′(t) and integrate over t.',
          explain: t`$\displaystyle\int_0^1 (${co(a * b * b, 't^2')} + ${co(a * b, 't')})\,dt = \frac{${a * b * b}}{3} + \frac{${a * b}}{2} = ${nice(+W.toPrecision(4))}$.`,
        };
      },
    }),
    num({
      id: 'wire-mass', difficulty: 2,
      gen(r) {
        const c = r.pick([2, 3, 4]), R = r.pick([2, 3, 5]);
        const m = c * PI * R + 2 * R * R;
        return {
          prompt: t`A thin wire is bent into the semicircle $x^2 + y^2 = ${R * R}$, $y \ge 0$ (in cm). Its linear density grows with height: $\rho(x, y) = ${c} + y$ grams per cm. Its mass is the **scalar** line integral $m = \int_C \rho\,ds$, where $ds = |\vec r\,'(t)|\,dt$ is a length. Find $m$.`,
          visual: {
            type: 'graph',
            params: {
              x: [-R * 1.6, R * 1.6], y: [-R * 0.25, R * 1.3], equal: true, aspect: 'wide', xlabel: 'x (cm)', ylabel: 'y (cm)',
              curves: [{ param: [`${R}*cos(t)`, `${R}*sin(t)`], t: [0, PI], color: 'gold', width: 4 }],
              points: [{ x: 0, y: R, color: 'gold', r: 3, label: `ρ = ${c + R} g/cm`, labelDx: 8, labelDy: -12 }, { x: R, y: 0, color: 'gold', r: 3, label: `ρ = ${c} g/cm`, labelDx: 8, labelDy: -10 }, { x: -R, y: 0, color: 'gold', r: 3, label: `ρ = ${c} g/cm`, labelDx: -10, labelDy: -10, labelAlign: 'right' }],
            },
            caption: 'The wire, with its density at three points: lightest at the ends, heaviest at the top.',
          },
          answer: m, units: 'g', tol: { rel: 2e-3 },
          errors: [
            { value: c * PI + 2 * R, feedback: t`You left out the length factor: with $\vec r = \langle ${R}\cos t, ${R}\sin t\rangle$, $ds = |\vec r\,'(t)|\,dt = ${R}\,dt$.` },
            { value: (c + R / 2) * PI * R, feedback: t`That multiplies the length by the density halfway up, but the density is not linear in arc length: integrate $\rho$ along the wire.` },
          ],
          hints: [t`Parametrize: $\vec r(t) = \langle ${R}\cos t,\ ${R}\sin t\rangle$, $0 \le t \le \pi$; then $|\vec r\,'(t)| = ${R}$.`, t`$m = \displaystyle\int_0^\pi (${c} + ${R}\sin t)\cdot ${R}\,dt$.`],
          teach: 'A scalar line integral ∫ f ds weights each bit of length ds by f; ds = |r′(t)| dt.',
          explain: t`$m = \displaystyle\int_0^\pi (${c} + ${R}\sin t)\,${R}\,dt = ${c * R}\pi + ${R * R}[-\cos t]_0^\pi = ${c * R}\pi + ${2 * R * R} \approx ${nice(+m.toPrecision(4))}$ g. Unlike $\int\vec F\cdot d\vec r$, this does not depend on which way you walk the wire: $ds$ is a length.`,
        };
      },
    }),
    mcq({
      id: 'reverse', difficulty: 1,
      prompt: t`Along a curve $C$ from $P$ to $Q$, $\int_C \vec F\cdot d\vec r = 7$. The same curve walked from $Q$ back to $P$ is called $-C$. What is $\int_{-C} \vec F\cdot d\vec r$?`,
      visual: {
        type: 'graph',
        params: {
          x: [-3.2, 3.2], y: [-1.1, 1.9], equal: true, aspect: 'wide', axes: false, grid: false, xlabel: '', ylabel: '',
          curves: [{ param: ['t', '0.5 + 0.7*sin(1.1*t)'], t: [-2.5, 2.5], color: 'gold', width: 3 }, { param: ['t', '0.05 + 0.7*sin(1.1*t)'], t: [-2.5, 2.5], color: 'violet', width: 3 }],
          arrows: [{ from: [-0.15, 0.39], to: [0.15, 0.61], color: 'gold', width: 3, label: 'C', labelDx: -4, labelDy: -14 }, { from: [0.15, 0.16], to: [-0.15, -0.06], color: 'violet', width: 3, label: '−C', labelDx: -2, labelDy: 14 }],
          points: [{ x: -2.5, y: r6(0.275 + 0.7 * Math.sin(-2.75)), color: 'ink', label: 'P', labelDx: -12, labelAlign: 'right' }, { x: 2.5, y: r6(0.275 + 0.7 * Math.sin(2.75)), color: 'ink', label: 'Q', labelDx: 10 }],
        },
        caption: 'One curve with two directions, drawn side by side: C runs from P to Q (gold), −C from Q to P (violet).',
      },
      choices: ['$-7$', '$7$', '$0$', '$\\tfrac17$'],
      answer: 0,
      why: {
        1: t`That would be right for a **scalar** integral $\int f\,ds$, where $ds$ is a length. Here every step $d\vec r$ points the other way, so every $\vec F\cdot d\vec r$ changes sign.`,
        2: t`Zero is what you get by going **out and back**: $C$ followed by $-C$. A single trip along $-C$ gives $-7$.`,
        3: 'Reversing direction flips signs; it does not invert the value.',
      },
      hints: [t`What happens to each small step $d\vec r$ when you walk the other way?`],
      teach: 'Reversing a curve’s direction reverses every step dr, so ∫ F · dr changes sign; ∫ f ds does not.',
      explain: t`On $-C$ every step $d\vec r$ is the negative of a step on $C$, so $\int_{-C}\vec F\cdot d\vec r = -\int_C\vec F\cdot d\vec r = -7$. The work done going one way is undone coming back.`,
    }),
    mcq({
      id: 'pace', difficulty: 2,
      prompt: t`Two parametrizations trace the same quarter circle from $(1, 0)$ to $(0, 1)$: $\vec r_1(t) = \langle\cos t,\ \sin t\rangle$ for $0 \le t \le \tfrac\pi2$, and $\vec r_2(s) = \langle\cos 2s,\ \sin 2s\rangle$ for $0 \le s \le \tfrac\pi4$, which moves twice as fast. How do the line integrals $\int \vec F\cdot d\vec r$ of a field $\vec F$ computed with them compare?`,
      visual: {
        type: 'graph',
        params: {
          x: [-0.4, 1.5], y: [-0.2, 1.25], equal: true, aspect: 'wide',
          curves: [{ param: ['cos(t)', 'sin(t)'], t: [0, PI / 2], color: 'ink3', width: 2 }],
          points: [
            ...Array.from({ length: 9 }, (_, k) => ({ x: r6(0.9 * Math.cos((k * PI) / 16)), y: r6(0.9 * Math.sin((k * PI) / 16)), color: 'accent', r: 3.5 })),
            ...Array.from({ length: 5 }, (_, k) => ({ x: r6(1.1 * Math.cos((k * PI) / 8)), y: r6(1.1 * Math.sin((k * PI) / 8)), color: 'gold', r: 3.5 })),
            { x: 0.9, y: 0, color: 'accent', r: 3.5, label: 'r₁', labelDx: -22, labelDy: -10 }, { x: 1.1, y: 0, color: 'gold', r: 3.5, label: 'r₂', labelDx: 8, labelDy: -8 },
          ],
        },
        caption: t`The quarter circle, with the points each parametrization reaches at equal parameter steps of $\pi/16$, drawn just inside (blue, $\vec r_1$) and just outside (gold, $\vec r_2$): $\vec r_2$ covers twice the arc per step.`,
      },
      choices: ['They are equal', t`$\vec r_2$ gives twice as much: it moves twice as fast`, t`$\vec r_2$ gives half as much: its parameter range is half as long`, t`It depends on $\vec F$`],
      answer: 0,
      why: {
        1: t`Its velocity $\vec r_2\,'$ is twice as long, but it runs for half the parameter range: $\vec F\cdot\vec r_2\,'(s)\,ds$ adds up the same steps $d\vec r$.`,
        2: t`The shorter range is exactly compensated by the doubled velocity in $d\vec r = \vec r\,'\,ds$.`,
        3: t`For every field the substitution $t = 2s$ turns one integral into the other: $\vec r_2(s) = \vec r_1(2s)$, so $\vec r_2\,'(s)\,ds = \vec r_1\,'(t)\,dt$.`,
      },
      hints: [t`Notice that $\vec r_2(s) = \vec r_1(2s)$. Substitute $t = 2s$.`, t`$d\vec r$ is a displacement along the curve: does it depend on how fast you made it?`],
      teach: 'A line integral depends on the curve and its direction, not on the pace at which a parametrization traces it.',
      explain: t`With $t = 2s$, $\vec r_2\,'(s)\,ds = 2\vec r_1\,'(2s)\,ds = \vec r_1\,'(t)\,dt$ and the limits $0 \to \tfrac\pi4$ become $0 \to \tfrac\pi2$: the two integrals are the same integral. Only the curve and its direction matter.`,
    }),
    num({
      id: 'flux-across', difficulty: 3,
      gen(r) {
        const [p, q] = r.pick([[2, 1], [1, 3], [3, 2], [1, 2]]), [a, b] = r.pick([[2, 1], [3, 1], [1.5, 1], [2.5, 1.2]]);
        const flux = PI * a * b * (p + q);
        return {
          prompt: t`The **flux** of a plane field across a closed curve measures how much flows **out through** it: $\oint_C \vec F\cdot\hat n\,ds$, where $\hat n$ is the outward unit normal. For a curve traced anticlockwise, $\hat n\,ds = \langle y'(t),\ -x'(t)\rangle\,dt$. Find the flux of $\vec F = \langle ${p === 1 ? '' : p}x,\ ${q === 1 ? '' : q}y\rangle$ out of the ellipse $x = ${co(a, '\\cos t')}$, $y = ${co(b, '\\sin t')}$, $0 \le t \le 2\pi$.`,
          visual: linePic(`${p}*x`, `${q}*y`, [{ x: `${a}*cos(t)`, y: `${b}*sin(t)`, t: [0, 2 * PI], color: 'gold' }], { mode: 'flux', x: [-3.4, 3.4], y: [-2.1, 2.1], caption: 'The field (arrows compressed) and the ellipse, traced anticlockwise. Flux counts the part of the field crossing the curve, not the part along it.' }),
          answer: flux, tol: { rel: 2e-3 },
          errors: [{ value: 0, feedback: t`That is the **circulation** $\oint\vec F\cdot d\vec r$, which uses the part of $\vec F$ along the curve. Flux uses the part across it: $\vec F\cdot\hat n\,ds = (Py' - Qx')\,dt$.` }],
          hints: [t`$\vec F\cdot\hat n\,ds = (P\,y' - Q\,x')\,dt$ with $x' = -${co(a, '\\sin t')}$ and $y' = ${co(b, '\\cos t')}$.`, t`$P y' - Q x' = (${co(p * a, '\\cos t')})(${co(b, '\\cos t')}) + (${co(q * b, '\\sin t')})(${co(a, '\\sin t')}) = ${co(p * a * b, '\\cos^2 t')} + ${co(q * a * b, '\\sin^2 t')}$.`, t`Over a full turn, $\int_0^{2\pi}\cos^2 t\,dt = \int_0^{2\pi}\sin^2 t\,dt = \pi$.`],
          teach: 'Flux across a curve counts the normal component: ∮ F · n ds = ∮ (P dy − Q dx) for an anticlockwise loop.',
          explain: t`$\displaystyle\oint (P\,y' - Q\,x')\,dt = \int_0^{2\pi} \left(${co(p * a * b, '\\cos^2 t')} + ${co(q * a * b, '\\sin^2 t')}\right)dt = ${co(p * a * b, '\\pi')} + ${co(q * a * b, '\\pi')} = ${nice(+flux.toPrecision(4))}$. Positive: the field streams outward through the whole ellipse.`,
        };
      },
    }),
    mcq({
      id: 'error-substitute', difficulty: 2, kind: 'error',
      prompt: t`To find $\int_C \vec F\cdot d\vec r$ for $\vec F = \langle y,\ x\rangle$ along $\vec r(t) = \langle t^2,\ t\rangle$, $0 \le t \le 1$, a student writes
$$\int_0^1 \langle y,\ x\rangle\cdot\langle 2t,\ 1\rangle\,dt = \int_0^1 (2ty + x)\,dt = 2y\cdot\tfrac12 + x = x + y.$$
What went wrong?`,
      visual: linePic('y', 'x', [{ x: 't^2', y: 't', t: [0, 1], color: 'gold' }], { x: [-0.5, 1.5], y: [-0.25, 1.25], points: [{ x: 0, y: 0, label: '(0, 0)', labelDx: -12, labelDy: 12, labelAlign: 'right' }, { x: 1, y: 1, label: '(1, 1)' }], caption: t`The field $\langle y, x\rangle$ and the curve $x = t^2$, $y = t$.` }),
      choices: [
        t`$x$ and $y$ must be replaced by $t^2$ and $t$ first: $\vec F(\vec r(t)) = \langle t,\ t^2\rangle$, giving $\int_0^1 3t^2\,dt = 1$`,
        t`The step should be $d\vec r = \langle t^2,\ t\rangle\,dt$, not $\langle 2t,\ 1\rangle\,dt$`,
        t`It needs a double integral over $x$ and $y$, each from $0$ to $1$`,
        t`Nothing: the answer $x + y$ is right, evaluated at the end point it gives $2$`,
      ],
      answer: 0,
      why: {
        1: t`$d\vec r = \vec r\,'(t)\,dt$, and $\vec r\,'(t) = \langle 2t,\ 1\rangle$: the student got that part right.`,
        2: t`A line integral runs along the curve, one parameter: a double integral would be over a region.`,
        3: t`A definite integral is a number. Leaving $x$ and $y$ in it shows they were treated as constants, but along $C$ they change with $t$.`,
      },
      hints: [t`Along the curve, are $x$ and $y$ constants?`, t`On $C$, $x = t^2$ and $y = t$: put those into $\vec F$ before integrating.`],
      teach: 'Along the curve x and y are functions of t: substitute them into F before integrating.',
      explain: t`$\vec F(\vec r(t)) = \langle t,\ t^2\rangle$, so $\vec F\cdot\vec r\,' = 2t^2 + t^2 = 3t^2$ and the integral is $1$. (This field is $\nabla(xy)$, so the answer is also $xy$ at the end minus at the start, $1 - 0$ — next lesson.)`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-work', difficulty: 2,
      gen(r) {
        const [a, b] = r.pick([[1, 2], [3, 1], [2, 4], [1, 4], [3, 2]]);
        const W = (a + 2 * b) / 3;
        return {
          prompt: t`Find the work done by $\vec F = \langle ${a === 1 ? '' : a}y,\ ${b === 1 ? '' : b}x\rangle$ (in N) on a particle moving along $y = x^2$ from $(0, 0)$ to $(1, 1)$ (in m).`,
          visual: linePic(`${a}*y`, `${b}*x`, [{ x: 't', y: 't^2', t: [0, 1], color: 'gold' }], { x: [-0.5, 1.5], y: [-0.25, 1.25], points: [{ x: 0, y: 0, label: '(0, 0)', labelDx: -12, labelDy: 12, labelAlign: 'right' }, { x: 1, y: 1, label: '(1, 1)' }], caption: 'The force field (arrows compressed) and the parabolic path.' }),
          answer: W, units: 'J', tol: { rel: 2e-3 },
          errors: [{ value: (a + b) / 3, feedback: t`On $y = x^2$, $dy = 2t\,dt$: the factor $2$ from $\vec r\,' = \langle 1, 2t\rangle$ is missing.` }],
          hints: [t`$\vec r(t) = \langle t,\ t^2\rangle$, $\vec r\,'(t) = \langle 1,\ 2t\rangle$.`],
          teach: 'Parametrize the path, substitute it into F, dot with r′(t), integrate.',
          explain: t`$\vec F(\vec r(t)) = \langle ${a}t^2,\ ${b}t\rangle$, so $\vec F\cdot\vec r\,' = ${a}t^2 + ${2 * b}t^2 = ${a + 2 * b}t^2$ and $W = \int_0^1 ${a + 2 * b}t^2\,dt = ${frac3(a + 2 * b)} \approx ${nice(+W.toPrecision(4))}$ J.`,
        };
      },
    }),
    num({
      id: 'cp-lift', difficulty: 3, transfer: true,
      gen(r) {
        const k = r.pick([2, 2.5, 3]), V = r.pick([50, 60]), rho = 1.225, R = 2;
        const Gamma = 2 * PI * k, L = rho * V * Gamma;
        // check the circulation numerically, clockwise round the circle
        const F = (x, y) => [V + (k * y) / (x * x + y * y), (-k * x) / (x * x + y * y)];
        const G = M.work(F, { X: (tt) => R * Math.cos(tt), Y: (tt) => -R * Math.sin(tt) }, 0, 2 * PI);
        return {
          prompt: t`In two-dimensional ideal flow, the air round a wing section moving at $V = ${V}$ m/s is modelled as a uniform stream plus a vortex:
$$\vec v = \left\langle ${V} + \frac{${k}\,y}{x^2 + y^2},\ \ -\frac{${k}\,x}{x^2 + y^2}\right\rangle\ \text{m/s},$$
with the wing at the origin and lengths in metres. The **Kutta–Joukowski theorem** says the lift per metre of span is $L' = \rho V\Gamma$, where $\Gamma$ is the circulation $\oint\vec v\cdot d\vec r$ taken **clockwise** round any loop enclosing the wing. Take the circle of radius ${R} m traced clockwise, $\vec r(t) = \langle ${R}\cos t,\ -${R}\sin t\rangle$, and air of density $\rho = 1.225$ kg/m³. Find $L'$.`,
          visual: linePic(`1 + 0.9*y/(x^2 + y^2)`, `-0.9*x/(x^2 + y^2)`, [{ x: `${R}*cos(t)`, y: `-${R}*sin(t)`, t: [0, 2 * PI], color: 'gold' }], { x: [-3.6, 3.6], y: [-2.25, 2.25], points: [{ x: 0, y: 0, color: 'ink', r: 4, label: 'wing', labelDx: 8, labelDy: -10 }], caption: `The flow past the wing section and the clockwise measuring loop. For visibility the vortex is drawn about ${Math.round((0.9 * V) / k)} times stronger, relative to the stream, than in the problem; arrow lengths compressed.` }),
          answer: L, units: 'N/m', tol: { rel: 0.01 },
          errors: [{ value: rho * V * k, feedback: t`$\Gamma$ is the whole circulation round the loop, $2\pi\times${k}$ m²/s — not the coefficient ${k} alone.` }],
          hints: [t`The uniform part $\langle ${V}, 0\rangle$ gives $\oint ${V}\,dx = 0$ round any closed loop.`, t`On the circle, $x = ${R}\cos t$, $y = -${R}\sin t$ and $x^2 + y^2 = ${R * R}$; the vortex part dotted with $\vec r\,' = \langle -${R}\sin t,\ -${R}\cos t\rangle$ is $${k}\sin^2 t + ${k}\cos^2 t = ${k}$.`, t`So $\Gamma = \int_0^{2\pi} ${k}\,dt = ${nice(+Gamma.toPrecision(4))}$ m²/s; multiply by $\rho V$.`],
          teach: 'Lift per unit span is ρVΓ, where the circulation Γ is a closed line integral of the velocity round the wing.',
          explain: t`$\Gamma = ${nice(+G.toPrecision(4))}$ m²/s (the stream adds nothing round a closed loop, and the radius drops out), so $L' = 1.225 \times ${V} \times ${nice(+Gamma.toPrecision(4))} \approx ${Math.round(L)}$ N/m. Over an 11 m span that is about ${nice(+(11 * L / 1000).toPrecision(3))} kN — the weight of a ${Math.round((11 * L) / 9.81 / 10) * 10} kg light aircraft. (Real wings have finite span and viscous air; Kutta–Joukowski is the two-dimensional ideal-flow result.)`,
        };
      },
    }),
    mcq({
      id: 'cp-unchanged', difficulty: 2,
      prompt: t`Which change leaves $\int_C \vec F\cdot d\vec r$ unchanged for **every** field $\vec F$?`,
      visual: linePic('-y + 0.4', 'x', [{ x: '1.8*cos(t)', y: '1.2*sin(t)', t: [-0.4, 2.6], color: 'gold' }], { caption: 'A field and a curve C, its direction marked.' }),
      choices: ['Tracing the same curve, in the same direction, at a different speed', 'Tracing the same curve in the opposite direction', 'Replacing C by a different curve with the same two end points', 'Doubling the field'],
      answer: 0,
      why: {
        1: 'Reversing the direction flips the sign of every F · dr.',
        2: 'Only for special (conservative) fields does every path between two points give the same value — that is next lesson. In general the value depends on the path.',
        3: 'The integral is linear in F: doubling F doubles it.',
      },
      hints: ['Which of these changes the steps dr themselves, and which only how fast they are taken?'],
      teach: 'A line integral of a vector field depends on the curve and its direction, but not on the parametrization’s speed.',
      explain: 'Reparametrizing changes how fast the steps dr are taken, not the steps: the sum is the same. Reversing flips the sign, other paths generally give other values, and doubling F doubles the result.',
    }),
  ],
  sources: [
    { label: 'OpenStax Calculus Vol. 3, §6.2 Line integrals', url: 'https://openstax.org/books/calculus-volume-3/pages/6-2-line-integrals' },
    { label: 'Anderson, Fundamentals of Aerodynamics, §3.16 (Kutta–Joukowski theorem)', url: 'https://www.mheducation.com/highered/product/fundamentals-aerodynamics-anderson/M9781259129919.html' },
  ],
});
