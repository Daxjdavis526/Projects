// Curvature of plane curves: signed curvature as the turning rate of the
// tangent, the general-parameter formula, curves determined by κ(s), the
// rotation index — and why a curve's curvature is not intrinsic.
import { lesson, mcq, num, order } from '../../src/core/content.js';
import { nice } from '../../src/core/format.js';
import { r6, kappaSigned } from './_dg.js';

const t = String.raw;
const DEG = Math.PI / 180;

const pic = (curves, x, y, { points = [], arrows = [], caption, equal = true, xlabel, ylabel } = {}) => ({
  type: 'graph',
  params: { x, y, equal, aspect: 'wide', curves, points, arrows, ...(xlabel ? { xlabel, ylabel } : {}) },
  caption,
});

// expressions for the explore picture: y = a sin x at x0, direction d = ±1
const FP = 'a*cos(x0)', W = `sqrt(1 + (${FP})^2)`, K = `(-a*sin(x0))/(1 + (${FP})^2)^1.5`, PY = 'a*sin(x0)';

export default lesson({
  id: 'st-c.C1.3',
  title: 'Curvature of plane curves',
  minutes: 12, difficulty: 3,
  intro: t`Run along a plane curve at unit speed. The unit tangent $\mathbf T(s) = \alpha'(s)$ can only turn, and how fast it turns per unit length is the curvature. In the plane there is a natural way to measure the turning *with a sign*: write $\mathbf T = (\cos\theta, \sin\theta)$ and let $\mathbf N_s$ be $\mathbf T$ rotated a quarter-turn anticlockwise. Then

$$\mathbf T'(s) = \kappa_s(s)\,\mathbf N_s(s), \qquad \kappa_s = \frac{d\theta}{ds}.$$

The **signed curvature** $\kappa_s$ is positive where the curve turns left, negative where it turns right, and zero at an inflection; $|\kappa_s|$ is the reciprocal of the radius of the best-fitting (osculating) circle. Remarkably, $\kappa_s(s)$ alone fixes the curve up to a rigid motion. Yet it is **not** something a creature living on the curve could measure — the first sign that curvature comes in two kinds.`,
  symbols: [
    { tex: 's', text: 'arc length, the unit-speed parameter of the previous lesson' },
    { tex: t`\mathbf T(s)`, text: t`the unit tangent $\alpha'(s)$, with $|\mathbf T| = 1$` },
    { tex: t`\theta(s)`, text: 'the tangent angle: the direction of T measured anticlockwise from the x-axis, in radians' },
    { tex: t`\mathbf N_s(s)`, text: t`the signed unit normal: $\mathbf T$ turned $90^\circ$ anticlockwise, $(-\sin\theta, \cos\theta)$` },
    { tex: t`\kappa_s`, text: t`the signed curvature, in radians per unit length (so $\text{m}^{-1}$ for a curve in metres)` },
  ],
  why: t`Curvature of a curve is **extrinsic**: it describes how the curve sits in the plane, and walkers on the curve cannot see it. A surface’s Gaussian curvature will turn out to be intrinsic (module C6) — and the curvature of spacetime, with no space around it, has to be.`,
  visual: {
    type: 'graph',
    title: 'The tangent turns; the circle fits',
    lead: t`The curve is $y = a\sin x$. At the point $x_0$ you see the unit tangent $\mathbf T$ (blue), the signed normal $\mathbf N_s$ (gold, always on $\mathbf T$’s left) and the osculating circle, centred at $\alpha + \mathbf N_s/\kappa_s$.`,
    tasks: [
      t`Put $x_0$ on the crest at $\pi/2 \approx 1.57$: the curve turns right, so $\kappa_s = -a$, and the circle (radius $1/a$) sits below.`,
      t`Slide $x_0$ to $\pi \approx 3.14$: an inflection. $\kappa_s$ passes through 0 and the circle grows without bound, then reappears on the other side.`,
      t`Reverse the direction of travel: $\mathbf T$ and $\mathbf N_s$ both flip and $\kappa_s$ changes sign, but the circle does not move — $|\kappa_s|$ is the geometry, the sign is bookkeeping.`,
    ],
    params: {
      x: [-0.6, 7], y: [-2.6, 2.6], equal: true, aspect: 'wide',
      sliders: [
        { key: 'x0', label: '$x_0$', min: 0, max: 6.3, step: 0.01, value: 1, explain: 'Where along the curve you stand.' },
        { key: 'a', label: 'amplitude $a$', min: 0.2, max: 1.5, step: 0.05, value: 1, explain: 'A taller wave bends more sharply at its crests.' },
      ],
      choices: [{ key: 'd', label: 'Direction of travel', options: [[1, 'left to right'], [-1, 'right to left']], value: 1, explain: t`Which way the parameter runs; it fixes $\mathbf T$ and the sign of $\kappa_s$.` }],
      curves: [
        { fn: 'a*sin(x)', color: 'ink2', width: 2.2 },
        { param: [`x0 - (${FP})/(${W})/(${K}) + cos(t)/abs(${K})`, `${PY} + 1/(${W})/(${K}) + sin(t)/abs(${K})`], t: [0, '2*pi'], color: 'violet', width: 1.4, dash: [6, 5], when: `step(abs(${K}) - 0.04)` },
      ],
      arrows: [
        { from: ['x0', PY], to: [`x0 + d/(${W})`, `${PY} + d*(${FP})/(${W})`], color: 'accent', label: 'T' },
        { from: ['x0', PY], to: [`x0 - d*(${FP})/(${W})`, `${PY} + d/(${W})`], color: 'gold', label: 'Nₛ' },
      ],
      points: [{ x: 'x0', y: PY, color: 'ink', label: '' }],
      readouts: [
        { label: t`$\kappa_s$`, expr: `d*${K}`, digits: 3 },
        { label: 'circle radius $1/|\\kappa_s|$', expr: `1/abs(${K})`, digits: 3 },
      ],
    },
    caption: t`Exact formulas at every point: $\kappa_s = f''/(1 + f'^2)^{3/2}$ for the graph of $f$, times $-1$ when travelled right to left. One unit is the same length on both axes, so the circle is round.`,
  },
  example: {
    prompt: t`Show that a unit-speed plane curve with constant signed curvature $\kappa_s = k \ne 0$ is a circle of radius $1/|k|$, and find which way round it goes.`,
    visual: pic([{ param: ['2*sin(t/2)', '2 - 2*cos(t/2)'], t: [0, '4*pi'], color: 'accent', width: 2.2 }, { param: ['2*sin(t/2)', '-2 + 2*cos(t/2)'], t: [0, '4*pi'], color: 'warn', width: 2.2, dash: [6, 5] }], [-4.6, 4.6], [-4.4, 4.4], {
      arrows: [{ from: [0, 0], to: [1.2, 0], color: 'ink', label: 'T(0)' }],
      points: [{ x: 0, y: 2, color: 'accent', r: 3, label: 'k = 0.5', labelDx: 8 }, { x: 0, y: -2, color: 'warn', r: 3, label: 'k = −0.5', labelDx: 8 }],
      caption: t`Two curves leaving the origin along $\mathbf T(0) = (1, 0)$: $k = 0.5$ turns left round the centre $(0, 2)$, $k = -0.5$ turns right round $(0, -2)$.`,
    }),
    steps: [
      { label: 'Angle', text: t`Write $\alpha'(s) = \mathbf T(s) = (\cos\theta(s), \sin\theta(s))$. Then $\theta' = \kappa_s = k$, so $\theta(s) = ks + \theta_0$.` },
      { label: 'Integrate once more', text: t`$\alpha(s) = \displaystyle\int (\cos(ks + \theta_0), \sin(ks + \theta_0))\,ds = \mathbf c + \frac1k\big(\sin(ks + \theta_0),\ -\cos(ks + \theta_0)\big)$, for a constant vector $\mathbf c$.` },
      { label: 'Recognise it', text: t`$|\alpha(s) - \mathbf c| = \dfrac{1}{|k|}\sqrt{\sin^2 + \cos^2} = \dfrac1{|k|}$: every point is at distance $1/|k|$ from $\mathbf c$. A circle.` },
      { label: 'Which way', text: t`$\theta$ increases with $s$ when $k > 0$: the tangent turns anticlockwise and the curve goes round anticlockwise; $k < 0$ goes clockwise.` },
      { label: 'Sense check', text: t`$k = 0$ gives constant $\theta$ — a straight line, the circle of infinite radius. And only $\mathbf c$ and $\theta_0$ were free: a translation and a rotation, nothing else.` },
    ],
    answer: t`$\alpha(s) = \mathbf c + \tfrac1k(\sin(ks + \theta_0), -\cos(ks + \theta_0))$: a circle of radius $1/|k|$, anticlockwise for $k > 0$, clockwise for $k < 0$, unique up to a rigid motion.`,
  },
  practice: [
    num({
      id: 'graph-kappa', difficulty: 2,
      gen(r) {
        const c = r.pick([1, 2, 3]), x0 = r.pick([-1, -0.5, 0.5, 1]);
        const f1 = 3 * x0 * x0 - c, f2 = 6 * x0, k = f2 / (1 + f1 * f1) ** 1.5;
        return {
          prompt: t`Find the signed curvature of the graph $y = x^3 - ${c}x$, travelled left to right, at $x = ${x0}$. Give 3 significant figures.`,
          visual: pic([{ fn: `x^3 - ${c}*x`, color: 'accent', width: 2.4, domain: [-2.2, 2.2] }], [-2.4, 2.4], [-3, 3], { equal: false, points: [{ x: x0, y: r6(x0 ** 3 - c * x0), color: 'gold', label: `x = ${x0}` }], caption: t`The cubic and the point. The axes have different scales, so judge the bending by the formula, not the eye.` }),
          answer: k, tol: { rel: 0.005 },
          errors: [{ value: f2, feedback: t`That is $f''$ alone. The curvature divides by $(1 + f'^2)^{3/2}$: steep parts of a graph bend less per unit of length than per unit of $x$.` }].filter((e) => Math.abs(e.value - k) > 0.01 * Math.abs(k)),
          hints: [t`For a graph $y = f(x)$ travelled left to right, $\kappa_s = \dfrac{f''(x)}{(1 + f'(x)^2)^{3/2}}$.`, t`$f'(${x0}) = ${nice(f1)}$ and $f''(${x0}) = ${nice(f2)}$.`],
          teach: t`For a graph, $\kappa_s = f''/(1 + f'^2)^{3/2}$; its sign is the sign of $f''$ — concave up turns left.`,
          explain: t`$\kappa_s = \dfrac{${nice(f2)}}{(1 + ${nice(f1 * f1)})^{3/2}} = ${nice(k, 4)}$. It is ${k > 0 ? 'positive: the graph is concave up there, turning left' : 'negative: the graph is concave down there, turning right'}.`,
        };
      },
    }),
    mcq({
      id: 'clockwise', difficulty: 1,
      prompt: t`What is the signed curvature of a circle of radius $R$ traversed **clockwise**?`,
      visual: pic([{ param: ['cos(t)', 'sin(t)'], t: [0, '2*pi'], color: 'accent', width: 2.2 }], [-1.9, 1.9], [-1.4, 1.4], { arrows: [{ from: [0, 1], to: [0.7, 1], color: 'accent', label: 'T' }, { from: [0, 1], to: [0, 1.6], color: 'gold', label: 'Nₛ' }, { from: [0, 0], to: [0, 0.95], color: 'ink3', label: 'R' }], caption: t`Clockwise travel at the top: $\mathbf T$ points right, and $\mathbf N_s$ — its left — points away from the centre.` }),
      choices: [t`$-1/R$`, t`$1/R$`, t`$-R$`, '0'],
      answer: 0,
      why: { 1: t`That is the anticlockwise value. Clockwise, $\theta$ decreases as you go, so $d\theta/ds < 0$.`, 2: t`Curvature has units of 1/length: a bigger circle bends less.`, 3: 'Only a straight line has zero curvature; a circle keeps turning.' },
      hints: [t`$\kappa_s = d\theta/ds$. Does the tangent angle increase or decrease as you go round clockwise?`],
      teach: t`The sign of $\kappa_s$ records which way the curve turns: left (anticlockwise) positive, right negative.`,
      explain: t`Going clockwise the tangent turns through $-2\pi$ in a length $2\pi R$, so $\kappa_s = -1/R$. $\mathbf T' = \kappa_s\mathbf N_s$ still points at the centre: $-1/R$ times the outward $\mathbf N_s$.`,
    }),
    num({
      id: 'turning-rate', difficulty: 2,
      gen(r) {
        const a = r.pick([0.4, 0.6, 0.8]), b = r.pick([0.05, 0.1, 0.15]), s0 = r.pick([2, 3, 5]);
        const k = a - 2 * b * s0;
        return {
          prompt: t`A test track’s centre line is logged by heading: at distance $s$ (km) from the start, the direction of travel is $\theta(s) = ${a}s - ${b}s^2$ radians, measured anticlockwise. What is the signed curvature at $s = ${s0}$ km, in $\text{km}^{-1}$?`,
          visual: pic([{ fn: `${a}*x - ${b}*x^2`, color: 'accent', width: 2.4, domain: [0, 8] }], [-0.3, 8.3], [-6, 3], { equal: false, xlabel: 's (km)', ylabel: 'θ (rad)', points: [{ x: s0, y: r6(a * s0 - b * s0 * s0), color: 'gold', label: `s = ${s0}` }], caption: t`Heading against distance — not the track itself. Its slope is the curvature.` }),
          answer: k, units: 'km^-1', tol: { rel: 0.01, abs: 0.002 },
          errors: [{ value: a * s0 - b * s0 * s0, feedback: t`That is the heading $\theta(${s0})$ itself. Curvature is its *rate of change* along the track, $d\theta/ds$.` }],
          hints: [t`$\kappa_s = d\theta/ds$.`, t`$\dfrac{d}{ds}(${a}s - ${b}s^2) = ${a} - ${2 * b}s$.`],
          teach: t`Curvature is the rate at which the heading turns per unit distance, $\kappa_s = d\theta/ds$.`,
          explain: t`$\kappa_s(${s0}) = ${a} - ${nice(2 * b)}(${s0}) = ${nice(k)}\ \text{km}^{-1}$, ${k > 0 ? `a left-hand bend of radius $${nice(1 / k, 3)}$ km` : k < 0 ? `a right-hand bend of radius $${nice(-1 / k, 3)}$ km` : 'momentarily straight'}.`,
        };
      },
    }),
    order({
      id: 'kappa-formula', difficulty: 3,
      prompt: t`Derive the signed curvature of a regular plane curve $(x(t), y(t))$ in any parameter $t$. Order the steps.`,
      visual: pic([{ param: ['cos(t) + 0.4*cos(2*t)', 'sin(t) - 0.3*sin(2*t)'], t: [0, '2*pi'], color: 'accent', width: 2.2 }], [-1.6, 2], [-1.5, 1.5], { arrows: [{ from: [r6(Math.cos(1) + 0.4 * Math.cos(2)), r6(Math.sin(1) - 0.3 * Math.sin(2))], to: [r6(Math.cos(1) + 0.4 * Math.cos(2) - (Math.sin(1) + 0.8 * Math.sin(2)) * 0.5), r6(Math.sin(1) - 0.3 * Math.sin(2) + (Math.cos(1) - 0.6 * Math.cos(2)) * 0.5)], color: 'gold', label: '(x′, y′)/2' }], caption: t`The velocity $(x', y')$ at a point: its direction is the tangent angle $\theta$.` }),
      items: [
        t`The tangent angle satisfies $\tan\theta = y'/x'$ (locally, $\theta = \arctan(y'/x')$ up to a constant).`,
        t`Differentiate in $t$: $\dfrac{d\theta}{dt} = \dfrac{x'y'' - y'x''}{x'^2 + y'^2}$.`,
        t`Arc length gives $\dfrac{ds}{dt} = \sqrt{x'^2 + y'^2}$.`,
        t`Chain rule: $\kappa_s = \dfrac{d\theta}{ds} = \dfrac{d\theta/dt}{ds/dt} = \dfrac{x'y'' - y'x''}{(x'^2 + y'^2)^{3/2}}$.`,
      ],
      hints: ['Curvature is dθ/ds, but the curve is given in t: compute dθ/dt and ds/dt separately.', t`$\frac{d}{dt}\arctan u = \frac{u'}{1 + u^2}$ with $u = y'/x'$.`],
      teach: t`The general formula is just $\kappa_s = (d\theta/dt)/(ds/dt)$, written in components.`,
      explain: t`With $u = y'/x'$, $u' = (x'y'' - y'x'')/x'^2$ and $1 + u^2 = (x'^2 + y'^2)/x'^2$, giving $d\theta/dt$. Dividing by the speed converts the per-$t$ rate into a per-length rate. The numerator is $\det(\alpha', \alpha'')$: the formula is the same whatever the parameter, as curvature must be.`,
    }),
    num({
      id: 'cycloid-top', difficulty: 3,
      gen(r) {
        const R = r.pick([0.3, 0.5, 2, 1.5, 0.25]);
        const k = kappaSigned(2 * R, 0, 0, -R);
        return {
          prompt: t`A wheel of radius $${R}$ m rolls left to right; a point on its rim traces $\alpha(t) = R(t - \sin t,\ 1 - \cos t)$. What is the signed curvature of its path at the top of an arch, $t = \pi$, in $\text{m}^{-1}$?`,
          visual: pic([{ param: ['t - sin(t)', '1 - cos(t)'], t: [0, '2*pi'], color: 'accent', width: 2.4 }, { param: ['pi + cos(t)', '1 + sin(t)'], t: [0, '2*pi'], color: 'ink3', width: 1.2, dash: true }], [-0.5, 6.8], [-0.4, 2.6], { points: [{ x: r6(Math.PI), y: 2, color: 'gold', label: 't = π' }], caption: t`One arch, in units of $R$, with the wheel at $t = \pi$. Is the path’s radius of curvature at the top equal to the wheel’s?` }),
          answer: k, units: 'm^-1', tol: { rel: 0.005 },
          errors: [{ value: -1 / R, feedback: t`The path is not the wheel: the rim point moves with the hub as well as round it. Compute $\kappa_s = (x'y'' - y'x'')/(x'^2 + y'^2)^{3/2}$ at $t = \pi$.` }, { value: -1 / (2 * R), feedback: t`Check the denominator: the speed at the top is $2R$, so $(x'^2 + y'^2)^{3/2} = 8R^3$.` }],
          hints: [t`$x' = R(1 - \cos t)$, $y' = R\sin t$, $x'' = R\sin t$, $y'' = R\cos t$; at $t = \pi$: $(2R, 0, 0, -R)$.`, t`$\kappa_s = \dfrac{(2R)(-R) - 0}{(2R)^3}$.`],
          teach: t`In a general parameter, $\kappa_s = (x'y'' - y'x'')/(x'^2 + y'^2)^{3/2}$.`,
          explain: t`$\kappa_s = \dfrac{-2R^2}{8R^3} = -\dfrac{1}{4R} = ${nice(k, 4)}\ \text{m}^{-1}$: the path turns right with radius $4R = ${nice(4 * R, 3)}$ m, four times the wheel’s. The point is moving at $2R$ per radian, so its path is flatter than the rim it rides on.`,
        };
      },
    }),
    num({
      id: 'turning-number', difficulty: 3,
      gen(r) {
        const [name, X, Y, T, ans, win] = r.pick([
          ['the ellipse $(2\\cos t,\\ \\sin t)$', '2*cos(t)', 'sin(t)', t`0 \le t \le 2\pi`, 2 * Math.PI, [[-2.8, 2.8], [-1.5, 1.5]]],
          ['the figure-eight $(\\sin t,\\ \\sin t\\cos t)$', 'sin(t)', 'sin(t)*cos(t)', t`0 \le t \le 2\pi`, 0, [[-1.5, 1.5], [-0.8, 0.8]]],
          ['the limaçon $r = 1 + 2\\cos t$, i.e. $\\big((1 + 2\\cos t)\\cos t,\\ (1 + 2\\cos t)\\sin t\\big)$', '(1 + 2*cos(t))*cos(t)', '(1 + 2*cos(t))*sin(t)', t`0 \le t \le 2\pi`, 4 * Math.PI, [[-0.8, 3.6], [-2, 2]]],
          ['the ellipse $(2\\cos t,\\ -\\sin t)$', '2*cos(t)', '-sin(t)', t`0 \le t \le 2\pi`, -2 * Math.PI, [[-2.8, 2.8], [-1.5, 1.5]]],
        ]);
        return {
          prompt: t`Find the total signed curvature $\displaystyle\oint\kappa_s\,ds$ of ${name}, once round ($${T}$), in radians.`,
          visual: pic([{ param: [X, Y], t: [0, '2*pi'], color: 'accent', width: 2.4 }], win[0], win[1], { arrows: [{ from: [r6(+eval0(X, 0)), r6(+eval0(Y, 0))], to: [r6(eval0(X, 0) + 0.25 * d0(X)), r6(eval0(Y, 0) + 0.25 * d0(Y))], color: 'gold', label: 't = 0' }], caption: 'The closed curve, and the direction of travel at t = 0.' }),
          answer: ans, units: 'rad', tol: { rel: 0, abs: 0.05 },
          errors: [{ value: Math.abs(ans) === 2 * Math.PI ? -ans : ans === 0 ? 2 * Math.PI : 2 * Math.PI, feedback: 'Follow the tangent all the way round and count its net turns, with sign: anticlockwise turns count +2π, clockwise −2π.' }].filter((e) => Math.abs(e.value - ans) > 0.1),
          hints: [t`$\oint\kappa_s\,ds = \oint d\theta$: the net angle the tangent turns through.`, 'Trace the curve with a finger and watch the direction of the tangent: how many full turns, and which way?'],
          teach: t`The total signed curvature of a closed curve is $2\pi$ times its rotation index — an integer that small deformations cannot change.`,
          explain: t`$\oint\kappa_s\,ds = \theta(\text{end}) - \theta(\text{start}) = ${nice(ans / Math.PI)}\pi$ rad. Hopf’s Umlaufsatz: for a simple closed curve it is exactly $\pm2\pi$. The figure-eight’s two lobes turn opposite ways and cancel; the limaçon’s inner loop adds an extra turn.`,
        };
      },
    }),
    mcq({
      id: 'ant-on-wire', difficulty: 3,
      prompt: t`An ant lives on a thin wire bent into a curve. It can walk along the wire and measure distances along it, but cannot look off the wire. Can it measure the wire’s curvature?`,
      visual: pic([{ param: ['t', '0'], t: [-3, 3], color: 'accent', width: 2.4 }, { param: ['1.9*sin(t/1.9)', '1.9 - 1.9*cos(t/1.9) - 2.6'], t: [-3, 3], color: 'gold', width: 2.4 }], [-3.6, 3.6], [-2.8, 1.1], { points: [...[-3, -2, -1, 0, 1, 2, 3].map((s) => ({ x: s, y: 0, color: 'accent', r: 3 })), ...[-3, -2, -1, 0, 1, 2, 3].map((s) => ({ x: r6(1.9 * Math.sin(s / 1.9)), y: r6(1.9 - 1.9 * Math.cos(s / 1.9) - 2.6), color: 'gold', r: 3 }))], caption: 'A straight wire and a bent one of the same length, each marked every unit of arc length. Matching the marks matches every distance the ant can measure.' }),
      choices: [
        t`No: any two curves of the same length are matched, distance for distance, by $s \mapsto s$, so nothing measurable along the wire distinguishes bent from straight`,
        'Yes: by walking out and back and measuring how far it has turned',
        'Yes: by comparing the distance walked with the straight-line distance between start and end',
        t`Only if the curvature is constant, by measuring the circumference`,
      ],
      answer: 0,
      why: {
        1: 'Turning is a direction in the plane — invisible from inside a one-dimensional world, where there is only forward and back.',
        2: 'The straight-line distance is measured through the plane, off the wire. That is exactly what the ant cannot do.',
        3: 'A circle of length L and a straight segment of length L with its ends identified look the same from inside: both are loops of length L.',
      },
      hints: ['Parameterize both curves by arc length. What does the ant see in each case?', t`Every measurement the ant makes is a distance $|s_1 - s_2|$ along the wire. Do those numbers differ between a straight wire and a bent one?`],
      teach: 'The curvature of a curve is extrinsic: it is invisible to measurements made along the curve.',
      explain: t`In arc length, every curve of length $L$ is just the interval $[0, L]$ to its inhabitants. $\kappa$ describes how that interval is placed in the plane. Surfaces are different: a two-dimensional creature *can* detect some curvature — the Gaussian curvature of module C6 — and in general relativity that intrinsic kind is the only kind there is.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-rate-turn', difficulty: 2, transfer: true,
      gen(r) {
        const v = r.pick([60, 90, 120, 150, 200]);
        const om = 3 * DEG, R = v / om / 1000;
        return {
          prompt: t`An aircraft flies a standard-rate turn: its heading changes at $3^\circ$ per second. At a true airspeed of $${v}$ m/s in still air, what is the radius of its turn, in km? (Use $\kappa = d\theta/ds$.)`,
          visual: pic([{ param: ['cos(t)', 'sin(t)'], t: [0, 2.4], color: 'accent', width: 2.4 }], [-1.3, 1.6], [-0.4, 1.3], { arrows: [{ from: [r6(Math.cos(1.2)), r6(Math.sin(1.2))], to: [r6(Math.cos(1.2) - 0.45 * Math.sin(1.2)), r6(Math.sin(1.2) + 0.45 * Math.cos(1.2))], color: 'gold', label: 'heading' }, { from: [0, 0], to: [r6(0.97 * Math.cos(0.5)), r6(0.97 * Math.sin(0.5))], color: 'ink3', label: 'R' }], caption: 'Part of the turn seen from above (not to scale). Heading turns by 3° each second, so a full circle takes 2 minutes.' }),
          answer: R, units: 'km', tol: { rel: 0.01 },
          errors: [{ value: (v / 3) / 1000, feedback: t`Convert the turn rate to radians per second first: $3^\circ/\text{s} = ${nice(om, 4)}$ rad/s.` }, { value: om / v * 1000, feedback: t`That is the curvature $\kappa$ (per km). The radius is $1/\kappa$.` }],
          hints: [t`$\kappa = \dfrac{d\theta}{ds} = \dfrac{d\theta/dt}{ds/dt} = \dfrac{\omega}{v}$.`, t`$\omega = 3^\circ/\text{s} = ${nice(om, 4)}$ rad/s, and $R = 1/\kappa = v/\omega$.`],
          teach: 'For a vehicle, curvature is turn rate over speed: κ = ω/v.',
          explain: t`$\kappa = \dfrac{\omega}{v} = \dfrac{${nice(om, 4)}\ \text{rad/s}}{${v}\ \text{m/s}} = ${nice(1000 * om / v, 3)}\ \text{km}^{-1}$, so $R = ${nice(R * 1000, 4)}$ m $= ${nice(R, 3)}$ km. Faster aircraft at the same rate fly wider circles, and need steeper bank angles to do it — so fast jets usually turn more slowly than standard rate.`,
        };
      },
    }),
    num({
      id: 'cp-param-kappa', difficulty: 3,
      gen(r) {
        const t0 = r.pick([0.5, 1, 2, -1, -0.5]);
        const k = kappaSigned(2 * t0, 3 * t0 * t0, 2, 6 * t0);
        return {
          prompt: t`Find the signed curvature of $\alpha(t) = (t^2,\ t^3)$ at $t = ${t0}$, to 3 significant figures.`,
          visual: pic([{ param: ['t^2', 't^3'], t: [-2.1, 2.1], color: 'accent', width: 2.4 }], [-0.4, 4.6], [-9.5, 9.5], { equal: false, points: [{ x: t0 * t0, y: t0 ** 3, color: 'gold', label: `t = ${t0}` }], caption: t`The cusp $y^2 = x^3$, travelled upward. The axes have different scales.` }),
          answer: k, tol: { rel: 0.005 },
          hints: [t`$\kappa_s = \dfrac{x'y'' - y'x''}{(x'^2 + y'^2)^{3/2}}$.`, t`Here $x' = 2t$, $y' = 3t^2$, $x'' = 2$, $y'' = 6t$.`],
          teach: 'Use the general-parameter formula; the parameter need not be arc length.',
          explain: t`Numerator $12t^2 - 6t^2 = 6t^2 = ${nice(6 * t0 * t0)}$; denominator $(4t^2 + 9t^4)^{3/2} = ${nice((4 * t0 * t0 + 9 * t0 ** 4) ** 1.5, 4)}$; so $\kappa_s = ${nice(k, 4)}$. It is positive on both branches — the curve always turns left — and grows without bound as $t \to 0$, the cusp.`,
        };
      },
    }),
    mcq({
      id: 'cp-congruent', difficulty: 2,
      prompt: t`Two unit-speed plane curves $\alpha(s)$ and $\beta(s)$, $0 \le s \le L$, have signed curvatures related by $\kappa_\beta(s) = -\kappa_\alpha(s)$ for every $s$. What can you conclude?`,
      visual: pic([{ param: ['t', '0.25*t^2 - 0.04*t^3'], t: [0, 5], color: 'accent', width: 2.2 }, { param: ['t', '-(0.25*t^2 - 0.04*t^3)'], t: [0, 5], color: 'gold', width: 2.2, dash: [6, 5] }], [-0.4, 5.4], [-1.5, 1.5], { caption: t`A curve and its reflection in the $x$-axis.` }),
      choices: [
        'β is a mirror image of α, moved rigidly into place',
        'β is α rotated and translated, without reflection',
        'β is α traversed backwards',
        'Nothing: curvature does not determine a curve',
      ],
      answer: 0,
      why: {
        1: 'A rotation keeps left turns left, so it keeps κs. Only a reflection flips every sign.',
        2: t`Reversing the direction flips $\kappa_s$ but also reverses the order of $s$: the reversed curve has $-\kappa_\alpha(L - s)$, not $-\kappa_\alpha(s)$.`,
        3: t`It does, up to a rigid motion: $\theta = \int\kappa_s\,ds$, then $\alpha = \int(\cos\theta, \sin\theta)\,ds$.`,
      },
      hints: [t`Reflect a curve in the $x$-axis: what happens to its tangent angle $\theta$?`],
      teach: 'Signed curvature determines a plane curve up to a rotation and translation; flipping its sign gives the mirror image.',
      explain: t`Reflection sends $\theta \to -\theta$, so $\kappa_s \to -\kappa_s$ at each $s$. By the fundamental theorem for plane curves, $\beta$ is then the reflected $\alpha$ followed by a rotation and translation.`,
    }),
  ],
  sources: [
    { label: 'Pressley, Elementary Differential Geometry (2nd ed.), §2.1–2.2 (signed curvature)', url: 'https://link.springer.com/book/10.1007/978-1-84882-891-9' },
    { label: 'do Carmo, Differential Geometry of Curves and Surfaces, §1-5 and §5-7 (rotation index)', url: 'https://store.doverpublications.com/products/9780486806990' },
    { label: 'FAA Instrument Flying Handbook (FAA-H-8083-15B), standard-rate turns', url: 'https://www.faa.gov/regulations_policies/handbooks_manuals/aviation/instrument_flying_handbook' },
  ],
});

// helpers for the turning-number pictures: evaluate a curve expression at t = 0, and its derivative there
function eval0(src) {
  return { '2*cos(t)': 2, 'sin(t)': 0, 'sin(t)*cos(t)': 0, '(1 + 2*cos(t))*cos(t)': 3, '(1 + 2*cos(t))*sin(t)': 0, '-sin(t)': 0 }[src];
}
function d0(src) {
  return { '2*cos(t)': 0, 'sin(t)': 1, 'sin(t)*cos(t)': 1, '(1 + 2*cos(t))*cos(t)': 0, '(1 + 2*cos(t))*sin(t)': 3, '-sin(t)': -1 }[src];
}
