// Calculus of parametric curves: slope dy/dx = y′/x′, speed and arc length,
// and the area under a parametric curve.
import { lesson, mcq, num } from '../../src/core/content.js';
import { nice, fmt } from '../../src/core/format.js';

const t = String.raw;

const cart = (x, y, params, caption) => ({ type: 'calc-polar', params: { grid: 'cartesian', aspect: 'wide', x, y, ...params }, caption });
const round = (v, d = 4) => +v.toFixed(d);
const CYC = ['t - sin(t)', '1 - cos(t)'];

export default lesson({
  id: 'math1220.C2-6.2',
  title: 'Calculus of parametric curves',
  minutes: 11, difficulty: 3,
  intro: t`Calculus reaches a parametric curve through its velocity. As $t$ advances by $dt$, the point moves $dx = x'(t)\,dt$ across and $dy = y'(t)\,dt$ up. Their ratio is the slope of the path, and Pythagoras gives the length of each small step:

$$\frac{dy}{dx} = \frac{dy/dt}{dx/dt}, \qquad L = \int_a^b \sqrt{\left(\frac{dx}{dt}\right)^2 + \left(\frac{dy}{dt}\right)^2}\;dt$$

The square root is the **speed**, so arc length is distance travelled — the integral of speed over time. The area under the curve follows the same way: $\int y\,dx = \int y(t)\,x'(t)\,dt$.`,
  symbols: [
    { tex: '\\frac{dx}{dt},\\ \\frac{dy}{dt}', text: 'the **velocity components**: how fast $x$ and $y$ change with $t$ (m/s when $t$ is time)' },
    { tex: '\\frac{dy}{dx}', text: 'the **slope** of the tangent line: rise per unit run of the path itself' },
    { tex: '\\sqrt{(dx/dt)^2 + (dy/dt)^2}', text: 'the **speed** — the length of the velocity vector, in m/s' },
    { tex: 'L', text: 'the **arc length**: the distance travelled along the path between $t = a$ and $t = b$ (m)' },
    { tex: 'a,\\ b', text: 'the parameter values where the piece of path starts and ends' },
  ],
  why: t`Distance travelled is the integral of speed along any path — for a probe on a curving trajectory as for a car on a road. Relativity uses the same integral, with time and space combined, to give the proper time a clock records along its worldline.`,
  visual: {
    type: 'calc-polar',
    title: 'Slope, speed and length on a cycloid',
    lead: t`A wheel of radius 1 rolls to the right; its rim traces the cycloid $x = t - \sin t$, $y = 1 - \cos t$. Gold: the tangent line at the current point. Green: the velocity $(x', y')$. The shading is the area under the path traced so far.`,
    tasks: [
      t`Set $t = \pi$ (3.14): the mark is on top of the wheel, the tangent is horizontal and the speed is $2$ — twice the speed of the wheel’s centre.`,
      t`Move $t$ towards $2\pi$ (6.28): the speed drops to $0$ and the tangent turns vertical. Where $x' = y' = 0$ the curve has a **cusp**, and $dy/dx$ is undefined.`,
      t`At $t = 2\pi$ the length reads $8$ and the area $3\pi \approx 9.42$: one arch is eight radii long and has three times the wheel’s area under it.`,
    ],
    params: {
      aspect: 'wide', grid: 'cartesian', x: [-0.4, 13], y: [-0.5, 3],
      sliders: [{ key: 'T', label: 'Angle turned $t$', min: 0.02, max: 12.56, step: 0.02, value: 2.2, unit: t`\text{rad}`, explain: t`The parameter: how far the wheel has turned. One arch is $0 \le t \le 2\pi$.` }],
      fills: [{ param: CYC, t: [0, 'T'], color: 'accent', alpha: 0.16 }],
      curves: [
        { param: CYC, t: [0, '4*pi'], color: 'ink3', width: 1.3, dash: true },
        { param: ['T + cos(t)', '1 + sin(t)'], t: [0, '2*pi'], color: 'ink4', width: 1.4 },
        { param: CYC, t: [0, 'T'], color: 'accent', width: 2.8 },
      ],
      tangents: [{ param: CYC, at: 'T', len: 1.6, velocity: 0.55, color: 'gold' }],
      readouts: [
        { label: t`slope $dy/dx$`, expr: 'slope', digits: 3 },
        { label: 'speed', expr: 'speed', digits: 3 },
        { label: t`length from $t = 0$`, expr: 'len3', digits: 4 },
        { label: 'area under it', expr: 'area', digits: 4 },
      ],
    },
    caption: t`Distances in units of the wheel’s radius. The velocity arrow is drawn at half length; the slope is undefined (shown as —) where $dx/dt = 0$. Lengths and areas are computed numerically from the curve.`,
  },
  example: {
    prompt: t`Find the length of one arch of the cycloid $x = r(t - \sin t)$, $y = r(1 - \cos t)$, $0 \le t \le 2\pi$.`,
    visual: cart([-0.6, 7], [-0.5, 2.5], {
      curves: [{ param: CYC, t: [0, '2*pi'], color: 'accent', width: 2.8 }],
      segments: [{ from: [0, 0], to: [0, 2], dash: true, color: 'ink3' }, { from: [0, 2], to: [6.2832, 2], dash: true, color: 'ink3' }, { from: [6.2832, 2], to: [6.2832, 0], dash: true, color: 'ink3' }],
      texts: [{ text: 'detour: 2 + 2π + 2 ≈ 10.28', x: 3.14, y: 2.25, color: 'ink3', size: 11.5 }, { text: 'base: 2π ≈ 6.28', x: 3.14, y: 0.22, color: 'ink3', size: 11.5 }],
    }, t`One arch with $r = 1$. Its length must lie between the base and the dashed detour round the outside.`),
    steps: [
      { label: 'Velocity', text: t`$\dfrac{dx}{dt} = r(1 - \cos t)$ and $\dfrac{dy}{dt} = r\sin t$.` },
      { label: 'Speed squared', text: t`$r^2(1 - \cos t)^2 + r^2\sin^2 t = r^2(1 - 2\cos t + \cos^2 t + \sin^2 t) = 2r^2(1 - \cos t)$.` },
      { label: 'Half-angle identity', text: t`$1 - \cos t = 2\sin^2(t/2)$, so the speed is $\sqrt{4r^2\sin^2(t/2)} = 2r\,|\sin(t/2)|$. On $0 \le t \le 2\pi$, $\sin(t/2) \ge 0$, so the bars can go.` },
      { label: 'Integrate', text: t`$L = \displaystyle\int_0^{2\pi} 2r\sin\frac{t}{2}\,dt = \Big[-4r\cos\frac{t}{2}\Big]_0^{2\pi} = 4r + 4r = 8r.$` },
      { label: 'Sense check', text: t`The arch is longer than its base, $2\pi r \approx 6.28r$, and shorter than the detour up, across and down, $(4 + 2\pi)r \approx 10.28r$ ✓. The speed $2r\sin(t/2)$ is $0$ at the cusps and $2r$ at the top, where the rim moves at twice the speed of the wheel.` },
    ],
    answer: t`$L = 8r$: one arch is exactly eight radii long — first shown by Christopher Wren in 1658.`,
  },
  practice: [
    mcq({
      id: 'slope-formula', difficulty: 1,
      prompt: t`For a curve $x = x(t)$, $y = y(t)$, the slope $\dfrac{dy}{dx}$ of the tangent line at a point is:`,
      visual: cart([-0.5, 4.2], [-0.4, 2.6], {
        curves: [{ param: ['3*cos(t)', '2*sin(t)'], t: [0, 'pi/2'], color: 'accent' }],
        tangents: [{ param: ['3*cos(t)', '2*sin(t)'], at: 0.9, len: 1.4, color: 'gold' }],
        arrows: [
          { from: [1.8648, 1.5667], to: [0.4548, 1.5667], color: 'warn', label: 'dx/dt', labelDx: -10, labelDy: 14 },
          { from: [0.4548, 1.5667], to: [0.4548, 2.3126], color: 'violet', label: 'dy/dt', labelDx: -46, labelDy: -2 },
          { from: [1.8648, 1.5667], to: [0.4548, 2.3126], color: 'good' },
        ],
      }, t`The velocity (green) at a point of the ellipse $x = 3\cos t$, $y = 2\sin t$, split into its components. The tangent line points along it.`),
      choices: [t`$\dfrac{dy/dt}{dx/dt}$`, t`$\dfrac{dx/dt}{dy/dt}$`, t`$\dfrac{dy}{dt}$`, t`$\dfrac{d^2y/dt^2}{d^2x/dt^2}$`],
      answer: 0,
      why: {
        1: 'That is run over rise — the reciprocal of the slope.',
        2: t`$dy/dt$ is only the vertical velocity; the slope also depends on how fast $x$ changes.`,
        3: 'Those are the components of the acceleration. The tangent line points along the velocity, not the acceleration.',
      },
      hints: [t`Over a short time $dt$, the point moves $dx = x'(t)\,dt$ across and $dy = y'(t)\,dt$ up.`],
      teach: 'The tangent line points along the velocity, so its slope is the vertical velocity over the horizontal velocity.',
      explain: t`$\dfrac{dy}{dx} = \dfrac{y'(t)\,dt}{x'(t)\,dt} = \dfrac{dy/dt}{dx/dt}$, valid wherever $dx/dt \ne 0$ — the chain rule $\tfrac{dy}{dt} = \tfrac{dy}{dx}\tfrac{dx}{dt}$, solved for $\tfrac{dy}{dx}$.`,
    }),
    num({
      id: 'slope-at-t', difficulty: 2,
      gen(r) {
        const t0 = r.pick([0.5, 1, 1.5, 2]);
        // avoid a slope of 0 or ±1 (where the upside-down slip would look right)
        const k = r.pick([1, 2, 4].filter((q) => { const m = (3 * t0 * t0 - q) / (2 * t0); return Math.abs(m) > 0.05 && Math.abs(Math.abs(m) - 1) > 0.05; }));
        const m = (3 * t0 * t0 - k) / (2 * t0);
        const X = (s) => s * s + 1, Y = (s) => s ** 3 - k * s;
        const T = 2.3, ys = [Y(-T), Y(T), Y(Math.sqrt(k / 3)), Y(-Math.sqrt(k / 3))];
        return {
          prompt: t`Find the slope $dy/dx$ of the curve $x = t^2 + 1$, $y = t^3 - ${k}t$ at the point where $t = ${t0}$.`,
          visual: cart([0, X(T) + 0.5], [Math.min(...ys) - 0.5, Math.max(...ys) + 0.5], {
            curves: [{ param: ['t^2 + 1', `t^3 - ${k}*t`], t: [-T, T], color: 'accent' }],
            tangents: [{ param: ['t^2 + 1', `t^3 - ${k}*t`], at: t0, len: 2.2, color: 'gold', label: `t = ${t0}` }],
          }, t`The curve for $-2.3 \le t \le 2.3$ and its tangent line at $t = ${t0}$.`),
          answer: m, tol: { rel: 0.005, abs: 1e-6 },
          errors: [{ value: (2 * t0) / (3 * t0 * t0 - k), feedback: t`That is $\dfrac{dx/dt}{dy/dt}$, upside down. The slope is rise over run: $\dfrac{dy/dt}{dx/dt}$.` }],
          hints: [t`$\dfrac{dx}{dt} = 2t$ and $\dfrac{dy}{dt} = 3t^2 - ${k}$.`, t`At $t = ${t0}$: $\dfrac{dy}{dx} = \dfrac{3(${t0})^2 - ${k}}{2(${t0})}$.`],
          teach: 'Differentiate x and y with respect to t, then divide: dy/dx = (dy/dt)/(dx/dt).',
          explain: t`$\dfrac{dy}{dx} = \dfrac{3t^2 - ${k}}{2t} = \dfrac{${nice(3 * t0 * t0 - k)}}{${nice(2 * t0)}} = ${nice(m)}$ at $t = ${t0}$.`,
        };
      },
    }),
    num({
      id: 'vertical-tangent', difficulty: 2,
      gen(r) {
        const k = r.pick([1, 1.5, 2]), x0 = -2 * k ** 3;
        const T = 1.9 * k, xT = T ** 3 - 3 * k * k * T;
        return {
          prompt: t`The curve $x = t^3 - ${nice(3 * k * k)}t$, $y = t^2$ has a vertical tangent at one point with $t > 0$. What is the $x$-coordinate of that point?`,
          visual: cart([x0 - 0.15 * Math.abs(x0) - 0.5, xT + 0.5], [-0.3, T * T + 0.4], { curves: [{ param: [`t^3 - ${nice(3 * k * k)}*t`, 't^2'], t: [-T, T], color: 'accent' }] }, t`The curve for $-${nice(T)} \le t \le ${nice(T)}$. A vertical tangent is where the path moves straight up or down for an instant.`),
          answer: x0, tol: { rel: 0.005 },
          errors: [{ value: k, feedback: t`That is the value of $t$. Substitute it into $x = t^3 - ${nice(3 * k * k)}t$.` }, { value: 0, feedback: t`$x = 0$ is where $dy/dt = 0$ — a horizontal tangent. Vertical tangents need $dx/dt = 0$.` }],
          hints: [t`A vertical tangent needs $dx/dt = 0$ (with $dy/dt \ne 0$).`, t`$\dfrac{dx}{dt} = 3t^2 - ${nice(3 * k * k)} = 0$ gives $t = ${nice(k)}$.`],
          teach: 'Horizontal tangents are where dy/dt = 0; vertical tangents are where dx/dt = 0 (and the other derivative is not).',
          explain: t`$dx/dt = 3t^2 - ${nice(3 * k * k)} = 0$ at $t = ${nice(k)}$, where $dy/dt = 2t \ne 0$. There $x = ${nice(k ** 3)} - ${nice(3 * k ** 3)} = ${nice(x0)}$ (and $y = ${nice(k * k)}$).`,
        };
      },
    }),
    num({
      id: 'ball-speed', difficulty: 2,
      gen(r) {
        const u = r.pick([8, 10, 12]), w = r.pick([15, 20, 25]), t1 = r.pick([0.5, 1, 1.5, 2.5]);
        const vy = w - 9.8 * t1, v = Math.hypot(u, vy), T = w / 4.9, X = u * T, H = (w * w) / 19.6;
        const px = u * t1, py = w * t1 - 4.9 * t1 * t1, s = (0.18 * X) / Math.hypot(u, w);
        return {
          prompt: t`A ball moves on $x = ${u}t$, $y = ${w}t - 4.9t^2$ (metres, seconds). How fast is it moving at $t = ${t1}$ s? Give 3 significant figures.`,
          visual: cart([-0.05 * X, 1.08 * X], [-0.1 * H, 1.2 * H], {
            xlabel: 'x (m)', ylabel: 'y (m)',
            curves: [{ param: [`${u}*t`, `${w}*t - 4.9*t^2`], t: [0, T], color: 'accent' }],
            arrows: [{ from: [round(px), round(py)], to: [round(px + s * u), round(py + s * vy)], color: 'good', label: 'v' }],
            points: [{ x: round(px), y: round(py), color: 'gold', label: `t = ${t1} s`, labelDx: -30, labelDy: 16 }],
          }, 'The path, with the velocity at the moment asked about (arrow length to scale with speed). No air resistance.'),
          answer: v, units: 'm/s', tol: { rel: 0.005 },
          errors: [
            { value: Math.hypot(u, w), feedback: 'That is the launch speed, at t = 0. The vertical velocity changes as gravity acts.' },
            { value: u + Math.abs(vy), feedback: 'Velocity components add like the sides of a right triangle: use the square root of the sum of squares.' },
          ],
          hints: [t`$\dfrac{dx}{dt} = ${u}$ and $\dfrac{dy}{dt} = ${w} - 9.8t$.`, t`Speed $= \sqrt{(dx/dt)^2 + (dy/dt)^2}$ at $t = ${t1}$.`],
          teach: 'Speed is the length of the velocity vector: the square root of the sum of the squared components.',
          explain: t`At $t = ${t1}$: $\dfrac{dx}{dt} = ${u}$, $\dfrac{dy}{dt} = ${w} - 9.8(${t1}) = ${nice(vy)}$, so the speed is $\sqrt{${u}^2 + (${nice(vy)})^2} = ${fmt(v)}$ m/s.`,
        };
      },
    }),
    num({
      id: 'cycloid-area', difficulty: 3,
      gen(r) {
        const R = r.pick([0.5, 1.5, 2, 3]), A = 3 * Math.PI * R * R;
        return {
          prompt: t`A wheel of radius $r = ${R}$ cm rolls along a line. Find the area between one arch of the cycloid traced by a point on its rim, $x = r(t - \sin t)$, $y = r(1 - \cos t)$, and the line. Give 3 significant figures.`,
          visual: cart([-0.4 * R, 2 * Math.PI * R + 0.4 * R], [-0.3 * R, 2.4 * R], {
            xlabel: 'x (cm)', ylabel: 'y (cm)',
            fills: [{ param: [`${R}*(t - sin(t))`, `${R}*(1 - cos(t))`], t: [0, '2*pi'], color: 'accent', alpha: 0.22 }],
            curves: [{ param: [`${R}*(t - sin(t))`, `${R}*(1 - cos(t))`], t: [0, '2*pi'], color: 'accent' }, { param: [`${R}*(pi + cos(t))`, `${R}*(1 + sin(t))`], t: [0, '2*pi'], color: 'ink3', width: 1.3, dash: true }],
          }, 'The shaded area under one arch; the dashed circle is the wheel, drawn for comparison.'),
          answer: A, units: 'cm^2', tol: { rel: 0.005 },
          errors: [
            { value: Math.PI * R * R, feedback: 'That is the area of the wheel itself. The arch encloses more.' },
            { value: 2 * Math.PI * R, feedback: t`That is $\int_0^{2\pi} y\,dt$. The area is $\int y\,dx$, and $dx = x'(t)\,dt$.` },
          ],
          hints: [t`$A = \displaystyle\int y\,dx = \int_0^{2\pi} y(t)\,x'(t)\,dt$ with $x'(t) = r(1 - \cos t)$.`, t`$A = r^2\displaystyle\int_0^{2\pi}(1 - \cos t)^2\,dt = r^2\int_0^{2\pi}\left(1 - 2\cos t + \cos^2 t\right)dt$.`, t`Over a full period, $\int\cos t\,dt = 0$ and $\int\cos^2 t\,dt = \pi$.`],
          teach: 'The area under a parametric curve is ∫ y dx with dx = x′(t) dt, over the parameter interval that traces it left to right.',
          explain: t`$A = r^2\left(2\pi - 0 + \pi\right) = 3\pi r^2 = 3\pi(${R})^2 \approx ${fmt(A)}$ cm² — exactly three times the area of the wheel.`,
        };
      },
    }),
    num({
      id: 'semicubical-length', difficulty: 3,
      gen(r) {
        const T = r.pick([1, 2]), L = ((4 + 9 * T * T) ** 1.5 - 8) / 27;
        return {
          prompt: t`Find the length of the curve $x = t^2$, $y = t^3$ from $t = 0$ to $t = ${T}$. Give 3 significant figures.`,
          visual: cart([-0.3, T * T + 1.2], [-0.3, T ** 3 + 0.4], {
            curves: [{ param: ['t^2', 't^3'], t: [-0.9, T + 0.25], color: 'ink3', width: 1.3, dash: true }, { param: ['t^2', 't^3'], t: [0, T], color: 'accent', width: 3 }],
            segments: [{ from: [0, 0], to: [T * T, T ** 3], color: 'ink3', dash: true }],
            points: [{ x: 0, y: 0, label: 't = 0', color: 'ink2', labelDx: -40, labelDy: 0 }, { x: T * T, y: T ** 3, label: `t = ${T}`, color: 'gold' }],
          }, 'The arc to be measured (bold), with its chord dashed: the arc must be a little longer than the chord.'),
          answer: L, tol: { rel: 0.005 },
          errors: [{ value: Math.hypot(T * T, T ** 3), feedback: 'That is the straight-line distance between the ends (the chord). The arc is longer.' }],
          hints: [t`$x' = 2t$ and $y' = 3t^2$, so the speed is $\sqrt{4t^2 + 9t^4} = t\sqrt{4 + 9t^2}$ for $t \ge 0$.`, t`Substitute $u = 4 + 9t^2$, $du = 18t\,dt$: $\displaystyle\int t\sqrt{4 + 9t^2}\,dt = \frac{1}{27}\left(4 + 9t^2\right)^{3/2}$.`],
          teach: 'Arc length is the integral of speed; factor the square root and look for a substitution.',
          explain: t`$L = \dfrac{1}{27}\left[(4 + 9t^2)^{3/2}\right]_0^{${T}} = \dfrac{${4 + 9 * T * T}^{3/2} - 8}{27} \approx ${fmt(L)}$, a little more than the chord $${fmt(Math.hypot(T * T, T ** 3))}$.`,
        };
      },
    }),
    mcq({
      id: 'astroid-trap', difficulty: 3, kind: 'error',
      prompt: t`A student finds the length of the astroid $x = \cos^3 t$, $y = \sin^3 t$, $0 \le t \le 2\pi$:

$$\sqrt{x'^2 + y'^2} = \sqrt{9\sin^2 t\cos^2 t} = 3\sin t\cos t, \qquad L = \int_0^{2\pi} 3\sin t\cos t\,dt = 0.$$

What went wrong?`,
      visual: cart([-1.6, 1.6], [-1.2, 1.2], { curves: [{ param: ['cos(t)^3', 'sin(t)^3'], t: [0, '2*pi'], color: 'accent' }], xticks: 6 }, 'The astroid: four arcs meeting at cusps. A length can never be zero.'),
      choices: [
        t`$\sqrt{9\sin^2 t\cos^2 t} = 3|\sin t\cos t|$; with the bars, $L = 4\int_0^{\pi/2} 3\sin t\cos t\,dt = 6$`,
        t`The speed should be $x' + y'$, not a square root`,
        t`The curve is traced twice, so the answer should be halved — still $0$`,
        t`Arc length must be computed as $\int y\,dx$`,
      ],
      answer: 0,
      why: {
        1: 'Velocity components combine by Pythagoras; adding them is not the length of the velocity vector.',
        2: 'The astroid is traced exactly once for 0 ≤ t ≤ 2π. The trouble is the negative “speed”.',
        3: t`$\int y\,dx$ is an area, not a length.`,
      },
      hints: ['A speed can never be negative. Where is 3 sin t cos t negative?', t`$\sqrt{u^2} = |u|$. Use the symmetry: the four arcs have equal length.`],
      teach: 'The square root in the arc-length integrand is never negative: √(u²) = |u|, so split the interval where u changes sign.',
      explain: t`Speed is $3|\sin t\cos t|$. On $[0, \pi/2]$ it equals $3\sin t\cos t$, giving $\int_0^{\pi/2}3\sin t\cos t\,dt = \tfrac32$; the four arcs total $L = 6$.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-ellipse-slope', difficulty: 2,
      gen(r) {
        const [a, b] = r.pick([[3, 2], [4, 3], [5, 2], [2, 1]]);
        const [t0, tt] = r.pick([[Math.PI / 6, t`\pi/6`], [Math.PI / 4, t`\pi/4`], [Math.PI / 3, t`\pi/3`], [(2 * Math.PI) / 3, t`2\pi/3`]]);
        const m = -(b * Math.cos(t0)) / (a * Math.sin(t0));
        return {
          prompt: t`Find the slope of the tangent line to the ellipse $x = ${a}\cos t$, $y = ${b}\sin t$ at $t = ${tt}$. Give 3 significant figures.`,
          visual: cart([-a - 1, a + 1], [-b - 0.8, b + 0.8], { curves: [{ param: [`${a}*cos(t)`, `${b}*sin(t)`], t: [0, '2*pi'], color: 'accent' }], tangents: [{ param: [`${a}*cos(t)`, `${b}*sin(t)`], at: round(t0, 6), len: 1.4, color: 'gold' }] }, t`The ellipse and its tangent line at $t = ${tt}$.`),
          answer: m, tol: { rel: 0.005 },
          errors: [{ value: -(a * Math.sin(t0)) / (b * Math.cos(t0)), feedback: t`Upside down: the slope is $\dfrac{dy/dt}{dx/dt}$.` }],
          hints: [t`$\dfrac{dx}{dt} = -${a}\sin t$, $\dfrac{dy}{dt} = ${b}\cos t$.`],
          teach: 'dy/dx = (dy/dt)/(dx/dt), evaluated at the given parameter.',
          explain: t`$\dfrac{dy}{dx} = \dfrac{${b}\cos t}{-${a}\sin t} = -\dfrac{${b}}{${a}}\cot t = ${nice(m)}$ at $t = ${tt}$.`,
        };
      },
    }),
    num({
      id: 'cp-rover-tread', difficulty: 3, transfer: true,
      gen(r) {
        const [name, D] = r.pick([['Perseverance', 0.525], ['Curiosity', 0.5]]);
        const n = r.pick([1, 2, 3]), R = D / 2, L = 8 * R * n;
        return {
          prompt: t`${name}’s wheels are ${D * 100} cm in diameter. A pebble is stuck to the outside of the tread. While the wheel rolls ${n === 1 ? 'one full turn' : `${n} full turns`} without slipping, how far does the pebble travel along its path? Give 3 significant figures.`,
          visual: cart([-1.3, 2 * Math.PI * n + 0.4], [-0.4, 2.4], {
            xlabel: 'x / R', ylabel: 'y / R',
            curves: [{ param: CYC, t: [0, 2 * Math.PI * n], color: 'accent' }, { param: ['cos(t)', '1 + sin(t)'], t: [0, '2*pi'], color: 'ink3', width: 1.3, dash: true }],
          }, t`The pebble’s path during ${n === 1 ? 'one turn' : `${n} turns`}, in units of the wheel radius $R$ (the wheel dashed at the start). Each arch is a cycloid.`),
          answer: L, units: 'm', tol: { rel: 0.005 },
          errors: [{ value: 2 * Math.PI * R * n, feedback: 'That is how far the rover moves — the distance along the ground. The pebble loops up and over, so it travels farther.' }],
          hints: ['The pebble traces one cycloid arch per turn of the wheel.', t`One arch of a cycloid traced by a wheel of radius $R$ has length $8R$.`],
          teach: 'A point on the rim of a rolling wheel travels 8R per turn while the wheel advances only 2πR.',
          explain: t`Each turn the pebble traces an arch of length $8R = 8(${nice(R)}) = ${nice(8 * R)}$ m, so ${n} turn${n === 1 ? '' : 's'} give ${fmt(L)} m — while the rover advances only $2\pi R\cdot${n} = ${fmt(2 * Math.PI * R * n)}$ m.`,
        };
      },
    }),
    num({
      id: 'cp-spiral-length', difficulty: 3,
      gen(r) {
        const T = r.pick([1, 1.5, 2]), L = Math.SQRT2 * (Math.exp(T) - 1);
        const ext = Math.exp(T) * 1.1;
        return {
          prompt: t`Find the length of the spiral $x = e^t\cos t$, $y = e^t\sin t$ from $t = 0$ to $t = ${T}$. Give 3 significant figures.`,
          visual: cart([-ext, ext], [-0.5, ext], { curves: [{ param: ['exp(t)*cos(t)', 'exp(t)*sin(t)'], t: [-3, T + 0.4], color: 'ink3', width: 1.3, dash: true }, { param: ['exp(t)*cos(t)', 'exp(t)*sin(t)'], t: [0, T], color: 'accent', width: 3 }], points: [{ x: 1, y: 0, label: 't = 0', color: 'ink2', labelDy: 12 }] }, t`The equiangular spiral: its radius grows by the factor $e$ every radian. Bold: the arc to be measured.`),
          answer: L, tol: { rel: 0.005 },
          errors: [{ value: Math.exp(T) - 1, feedback: t`Check the speed: $x'^2 + y'^2 = 2e^{2t}$, so the speed is $\sqrt2\,e^t$.` }],
          hints: [t`$x' = e^t(\cos t - \sin t)$ and $y' = e^t(\sin t + \cos t)$.`, t`$x'^2 + y'^2 = e^{2t}\left[(\cos t - \sin t)^2 + (\sin t + \cos t)^2\right] = 2e^{2t}$.`],
          teach: 'Arc length is ∫ speed dt; expanding the squares often collapses with sin² + cos² = 1.',
          explain: t`The speed is $\sqrt2\,e^t$, so $L = \sqrt2\displaystyle\int_0^{${T}}e^t\,dt = \sqrt2\,(e^{${T}} - 1) \approx ${fmt(L)}$.`,
        };
      },
    }),
  ],
  sources: [
    { label: 'OpenStax Calculus Vol. 2, §7.2 Calculus of Parametric Curves', url: 'https://openstax.org/books/calculus-volume-2/pages/7-2-calculus-of-parametric-curves' },
    { label: 'NASA: Perseverance rover wheels (52.5 cm diameter)', url: 'https://science.nasa.gov/mission/mars-2020-perseverance/rover-components/' },
  ],
});
