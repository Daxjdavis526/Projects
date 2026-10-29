// Harmonic functions: the real and imaginary parts of an analytic function
// each satisfy Laplace's equation u_xx + u_yy = 0. Their level curves cross
// at right angles; every harmonic u has a conjugate v (on a simply connected
// region) making u + iv analytic; and harmonic functions average: the value
// at a centre is the mean round any circle, so no peaks or pits inside.
import { lesson, mcq, multi, num } from '../../src/core/content.js';
import { r6, num as nm, apart } from './_cx.js';

const t = String.raw;
const TAU = 2 * Math.PI;

// Re zⁿ and Im zⁿ, chosen by n (1, 2, 3), as expressions
const RE = { 1: 'x', 2: 'x^2 - y^2', 3: 'x^3 - 3*x*y^2' };
const sel = (k) => `step(0.5 - abs(n - ${k}))`;
// level curves of Im zⁿ = c in polar form, r = (c / sin nθ)^(1/n): NaN (a gap) where the base is negative
const imLevels = [-3, -1.5, -0.5, 0.5, 1.5, 3].flatMap((c) => [1, 2, 3].map((k) => ({
  param: [`(${c}/sin(${k}*t))^(1/${k})*cos(t)`, `(${c}/sin(${k}*t))^(1/${k})*sin(t)`], t: [0.001, 6.282], color: 'violet', width: 1.6, dash: [5, 4], when: sel(k),
})));

// a contour picture of one function
const contour = (f, caption, o = {}) => ({ type: 'c3-contour', params: { f, x: [-2.4, 2.4], y: [-1.5, 1.5], levels: 11, labels: false, fill: true, ...o }, caption });

export default lesson({
  id: 'st-d.D3.3',
  title: 'Harmonic functions',
  minutes: 11, difficulty: 3,
  intro: t`Differentiate the Cauchy–Riemann equations $u_x = v_y$, $u_y = -v_x$ once more: $u_{xx} = v_{yx}$ and $u_{yy} = -v_{xy}$. The mixed partials of $v$ are equal, so they cancel when you add:

$$\nabla^2 u = \frac{\partial^2 u}{\partial x^2} + \frac{\partial^2 u}{\partial y^2} = 0$$

The same holds for $v$. Solutions of this — **Laplace’s equation** — are called **harmonic**. So the real and imaginary parts of every analytic function are harmonic, and their level curves cross at right angles (they are the curves the map sends to the grid lines $u = $ const and $v = $ const). Harmonic functions are the most even-tempered functions there are: the value at any point is the **average** of the values on any circle around it, so a harmonic function has no peaks or pits inside its region.`,
  symbols: [
    { tex: 'u(x, y)', text: 'a real function of two variables: a steady temperature, an electrostatic potential, a velocity potential' },
    { tex: t`\nabla^2 u`, text: t`the **Laplacian**: the sum of the second derivatives. It measures how much $u$ at a point differs from the average of $u$ nearby` },
    { tex: t`u_{xx},\ u_{yy}`, text: t`second partial derivatives: the curvature of the graph of $u$ along $x$ and along $y$. Laplace’s equation says they always cancel — a saddle, never a bowl` },
    { tex: 'v', text: t`a **harmonic conjugate** of $u$: a harmonic function with $u + iv$ analytic, found from the Cauchy–Riemann equations (unique up to a constant)` },
  ],
  why: t`Steady heat flow, electrostatics in charge-free space and ideal fluid flow all obey Laplace’s equation; and the constraint equations of general relativity — the part of Einstein’s equations that must hold on a single slice of time — are elliptic equations of this same family.`,
  visual: {
    type: 'c3-contour',
    title: 'Saddles, never bowls',
    lead: t`The filled contours are $u = \operatorname{Re} z^n$; the violet dashed curves are levels of its conjugate $v = \operatorname{Im} z^n$. Turn on the 3D view: the surface is a saddle (or a plane), curving up one way and down the other in equal measure.`,
    tasks: [
      t`For $n = 2$: the solid hyperbolas $x^2 - y^2 = c$ and the dashed ones $2xy = c$ cross at right angles everywhere except at $0$.`,
      t`Switch to 3D for $n = 3$: a “monkey saddle”. Look for a highest point inside the window — there is none; the maximum is on the edge.`,
      t`Drag the probe: its value is the average of the values around any circle centred on it.`,
    ],
    params: {
      f: `${sel(1)}*(${RE[1]}) + ${sel(2)}*(${RE[2]}) + ${sel(3)}*(${RE[3]})`,
      choices: [{ key: 'n', label: t`$u = \operatorname{Re} z^n$, with $n =$`, options: [[1, '1'], [2, '2'], [3, '3']], value: 2, explain: t`Which power of $z$ the harmonic pair comes from.` }],
      x: [-2, 2], y: [-1.5, 1.5], levels: { from: -6, to: 6, step: 1 }, labels: true, fill: true, toggle3d: true, zscale: 0.25,
      curves: imLevels, probe: [0.8, 0.4], readouts: [{ label: 'u at the probe', expr: 'fp', digits: 3 }],
    },
    caption: t`Solid contours: $u = \operatorname{Re} z^n$ at whole-number levels. Dashed: levels $\pm0.5, \pm1.5, \pm3$ of $v = \operatorname{Im} z^n$. In 3D, heights are scaled by $0.25$.`,
  },
  example: {
    prompt: t`Show that $u = x^2 - y^2 + 3x$ is harmonic, find a harmonic conjugate $v$, and name the analytic function $u + iv$.`,
    visual: contour('x^2 - y^2 + 3*x', t`Level curves of $u = x^2 - y^2 + 3x$ (shaded low blue to high gold) with levels of its conjugate $v = 2xy + 3y$ (violet, dashed). They cross at right angles except at $z = -1.5$, where $f' = 0$.`, {
      x: [-3.5, 0.5], y: [-1.5, 1.5], levels: { from: -4, to: 4, step: 0.5 },
      curves: [-3, -2, -1, 1, 2, 3].map((c) => ({ param: ['t', `${c}/(2*t + 3)`], t: [-3.5, 0.5], color: 'violet', width: 1.6, dash: [5, 4] })).concat([{ param: ['t', '0'], t: [-3.5, 0.5], color: 'violet', width: 1.6, dash: [5, 4] }, { param: ['-1.5', 't'], t: [-1.5, 1.5], color: 'violet', width: 1.6, dash: [5, 4] }]),
    }),
    steps: [
      { label: 'Harmonic?', text: t`$u_{xx} = 2$ and $u_{yy} = -2$: they cancel, so $\nabla^2 u = 0$ everywhere.` },
      { label: 'First equation', text: t`Cauchy–Riemann: $v_y = u_x = 2x + 3$. Integrate in $y$: $v = 2xy + 3y + h(x)$, where $h$ is any function of $x$ alone (it vanishes under $\partial/\partial y$).` },
      { label: 'Second equation', text: t`$v_x = -u_y$: the left side is $2y + h'(x)$, the right side $-(-2y) = 2y$. So $h'(x) = 0$ and $h$ is a constant.` },
      { label: 'Name it', text: t`$v = 2xy + 3y + C$, and $u + iv = (x^2 - y^2 + 2ixy) + 3(x + iy) = z^2 + 3z$ (plus $iC$).` },
    ],
    answer: t`$v = 2xy + 3y + C$; $\;u + iv = z^2 + 3z + iC$.`,
  },
  practice: [
    multi({
      id: 'which-harmonic', difficulty: 2,
      prompt: 'Which of these are harmonic (satisfy Laplace’s equation) wherever they are defined? Select every one.',
      visual: { ...contour('x^2 + y^2', t`$u = x^2 + y^2$, a bowl with a lowest point inside — impossible for a harmonic function.`, { x: [-2, 2], y: [-1.5, 1.5], view: '3d', zscale: 0.4 }) },
      choices: [t`$x^2 - y^2$`, t`$e^x\sin y$`, t`$\ln(x^2 + y^2)$`, t`$x^2 + y^2$`, t`$x^3$`, t`$e^x\cos x$`],
      answer: [0, 1, 2],
      why: {
        3: t`$u_{xx} + u_{yy} = 2 + 2 = 4$: a bowl, curving up both ways.`,
        4: t`$u_{xx} = 6x$, $u_{yy} = 0$: they do not cancel.`,
        5: t`This depends on $x$ only, and $\frac{d^2}{dx^2}(e^x\cos x) = -2e^x\sin x \ne 0$.`,
      },
      hints: [t`Compute $u_{xx} + u_{yy}$ for each.`, t`$\ln(x^2 + y^2) = 2\ln|z|$, twice the real part of $\operatorname{Log} z$ — harmonic away from $0$.`],
      teach: t`A function is harmonic when its second derivatives in $x$ and $y$ cancel: $u_{xx} = -u_{yy}$.`,
      explain: t`$x^2 - y^2 = \operatorname{Re} z^2$, $e^x\sin y = \operatorname{Im} e^z$ and $\ln(x^2 + y^2) = 2\operatorname{Re}\operatorname{Log} z$ (for $z \ne 0$) are harmonic; the other three are not.`,
    }),
    num({
      id: 'laplacian', difficulty: 2,
      gen(r) {
        const a = r.pick([1, 2, 3, -1]), b = r.pick([2, 4, -3]), c = r.pick([-2, 1, 3, -1]);
        const ans = 2 * a + 2 * c;
        const C = ans === 0 ? c + 1 : c, A2 = 2 * a + 2 * C;
        return {
          prompt: t`Compute $\nabla^2 u$ for $u = ${a}x^2 ${b < 0 ? '-' : '+'} ${Math.abs(b)}xy ${C < 0 ? '-' : '+'} ${Math.abs(C)}y^2$. Is it harmonic?`,
          visual: contour(`${a}*x^2 + ${b}*x*y + ${C}*y^2`, t`Level curves of $u$ (shaded low blue to high gold).`),
          answer: A2, tol: { rel: 0, abs: 1e-6 },
          errors: apart(A2, [{ value: 2 * a + 2 * C + b, feedback: t`The $xy$ term has $u_{xx} = u_{yy} = 0$: it does not contribute.` }, { value: a + C, feedback: t`$\frac{\partial^2}{\partial x^2}(${a}x^2) = ${2 * a}$: remember the factor 2.` }]),
          hints: [t`$u_{xx} = ${2 * a}$; the $xy$ term contributes nothing to either second derivative.`, t`$u_{yy} = ${2 * C}$.`],
          teach: t`Only the $x^2$ and $y^2$ terms of a quadratic contribute to its Laplacian; it is harmonic when their coefficients are opposite.`,
          explain: t`$\nabla^2 u = ${2 * a} + ${2 * C} = ${A2}$, so $u$ is not harmonic (it would be if the $y^2$ coefficient were $${-a}$).`,
        };
      },
    }),
    num({
      id: 'conjugate-exp', difficulty: 2,
      gen(r) {
        const x = r.pick([0, 0.5, 1]), y = r.pick([0.5, 1, 2, -1]);
        const ans = Math.exp(x) * Math.sin(y);
        return {
          prompt: t`The harmonic conjugate of $u = e^x\cos y$ with $v(0, 0) = 0$ is $v = e^x\sin y$ (so that $u + iv = e^z$). Evaluate $v$ at $(${x}, ${y})$, to 3 significant figures.`,
          visual: contour('e^x*sin(y)', t`Level curves of $v = e^x\sin y$ (shaded), with $u = e^x\cos y$ levels dashed: they cross at right angles.`, { x: [-1.5, 1.5], y: [-2.5, 2.5], levels: 13, curves: [-2, -1, 1, 2].map((c) => ({ param: [`ln(${c}/cos(t))`, 't'], t: [-2.5, 2.5], color: 'violet', width: 1.4, dash: [5, 4] })) }),
          answer: ans, tol: { rel: 0.005, abs: 0.002 },
          errors: apart(ans, [{ value: Math.exp(x) * Math.cos(y), feedback: 'That is u, not its conjugate.' }]),
          hints: [t`Substitute: $v = e^{${x}}\sin(${y})$.`],
          teach: t`$e^x\cos y$ and $e^x\sin y$ are the real and imaginary parts of $e^z$: a harmonic pair.`,
          explain: t`$v(${x}, ${y}) = e^{${x}}\sin(${y}) = ${nm(ans, 3)}$. Check the pair: $u_x = e^x\cos y = v_y$ and $u_y = -e^x\sin y = -v_x$.`,
        };
      },
    }),
    num({
      id: 'conjugate-build', difficulty: 3,
      gen(r) {
        const p = r.pick([1, 2, -2, 3]), q = r.pick([1, -1, 2, 4]);
        const x0 = r.pick([1, 2, -1]), y0 = r.pick([1, 2, -1, 3]);
        const ans = 2 * x0 * y0 + p * y0 - q * x0;
        return {
          prompt: t`Find the harmonic conjugate $v$ of $u = x^2 - y^2 ${p < 0 ? '-' : '+'} ${Math.abs(p)}x ${q < 0 ? '-' : '+'} ${Math.abs(q)}y$ with $v(0, 0) = 0$, and give $v(${x0}, ${y0})$.`,
          visual: contour(`x^2 - y^2 + ${p}*x + ${q}*y`, t`Level curves of $u$ (shaded low blue to high gold).`, { x: [-3, 3], y: [-2, 2] }),
          answer: ans, tol: { rel: 0, abs: 1e-6 },
          errors: apart(ans, [{ value: 2 * x0 * y0 + p * y0 + q * x0, feedback: t`Check the second equation: $v_x = -u_y = 2y - (${q})$, so the $x$ term of $v$ is $-${q}x$.` }, { value: 2 * x0 * y0 + p * y0, feedback: t`You stopped after the first equation: the second, $v_x = -u_y$, fixes the function $h(x)$.` }]),
          hints: [t`$v_y = u_x = 2x ${p < 0 ? '-' : '+'} ${Math.abs(p)}$, so $v = 2xy ${p < 0 ? '-' : '+'} ${Math.abs(p)}y + h(x)$.`, t`$v_x = 2y + h'(x)$ must equal $-u_y = 2y ${q < 0 ? '+' : '-'} ${Math.abs(q)}$.`],
          teach: 'Find a conjugate by integrating one Cauchy–Riemann equation and fixing the leftover function with the other.',
          explain: t`$h'(x) = ${-q}$, so $v = 2xy ${p < 0 ? '-' : '+'} ${Math.abs(p)}y ${q < 0 ? '+' : '-'} ${Math.abs(q)}x$, and $v(${x0}, ${y0}) = ${ans}$. Then $u + iv = z^2 + (${p} - ${q}i)z$, whose real part is indeed $u$.`,
        };
      },
    }),
    num({
      id: 'mean-value', difficulty: 2,
      gen(r) {
        const a = r.pick([1, 2, -1]), b = r.pick([1, -1, 2]), R = r.pick([1, 2, 3]);
        const ans = a * a - b * b + 3 * a;
        return {
          prompt: t`$u = x^2 - y^2 + 3x$ is harmonic. What is the average value of $u$ around the circle of radius $${R}$ centred at $(${a}, ${b})$?`,
          visual: contour('x^2 - y^2 + 3*x', t`Level curves of $u$, and the circle (gold) around the centre point.`, { x: [-5, 5], y: [-4, 4], points: [{ x: a, y: b, label: 'centre', color: 'gold' }], curves: [{ param: [`${a} + ${R}*cos(t)`, `${b} + ${R}*sin(t)`], t: [0, TAU], color: 'gold', width: 2.4 }] }),
          answer: ans, tol: { rel: 0, abs: 1e-6 },
          errors: apart(ans, [{ value: ans + R * R, feedback: t`For a non-harmonic function the circle average would include a term in $R^2$; for a harmonic one it does not depend on the radius at all.` }]),
          hints: ['Use the mean-value property: no integral is needed.', t`The average round any circle equals the value at its centre, $u(${a}, ${b})$.`],
          teach: 'A harmonic function’s value at a point equals its average on every circle around that point.',
          explain: t`$u(${a}, ${b}) = ${a * a} - ${b * b} + ${3 * a} = ${ans}$, whatever the radius. (Check by integrating: $\frac{1}{2\pi}\int_0^{2\pi} u(${a} + ${R}\cos\phi, ${b} + ${R}\sin\phi)\,d\phi$ — the $\cos^2$ and $\sin^2$ terms cancel.)`,
        };
      },
    }),
    mcq({
      id: 'max-principle', difficulty: 2,
      prompt: 'A thin metal plate has reached a steady temperature T(x, y), with no heat sources inside (so T is harmonic), and its edges are held at various temperatures. Where is the plate hottest?',
      visual: contour('x^3 - 3*x*y^2', t`A harmonic function seen as a surface (a monkey saddle): every point inside has higher and lower neighbours.`, { x: [-1.5, 1.5], y: [-1.2, 1.2], view: '3d', zscale: 0.35 }),
      choices: ['Somewhere on the edge', 'At the centre of the plate', 'At a point inside where ∂T/∂x = ∂T/∂y = 0', 'It depends: possibly at an interior hot spot'],
      answer: 0,
      why: {
        1: 'The centre is hottest only if the whole plate is at one temperature — and then the edge is equally hot.',
        2: 'Points where both first derivatives vanish are saddles for a harmonic function, never maxima (unless T is constant).',
        3: 'A hot spot inside would be hotter than the average around it, which the mean-value property forbids.',
      },
      hints: ['Use the mean-value property: the value at any interior point is the average around a small circle.', 'Can a point be hotter than the average of its surroundings?'],
      teach: 'Maximum principle: a non-constant harmonic function takes its largest and smallest values on the boundary.',
      explain: 'If an interior point were the hottest, it would be hotter than every point on a small circle around it — but it equals their average. So the maximum (and the minimum) of a non-constant harmonic function lies on the boundary.',
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-conj-cubic', difficulty: 3,
      gen(r) {
        const x = r.pick([1, 2, -1]), y = r.pick([1, -1, 2]);
        const ans = 3 * x * x * y - y ** 3;
        return {
          prompt: t`Find the harmonic conjugate $v$ of $u = x^3 - 3xy^2$ with $v(0, 0) = 0$, and give $v(${x}, ${y})$.`,
          visual: contour('x^3 - 3*x*y^2', t`Level curves of $u = x^3 - 3xy^2$ (shaded).`, { x: [-2.4, 2.4], y: [-1.5, 1.5], levels: 15 }),
          answer: ans, tol: { rel: 0, abs: 1e-6 },
          errors: apart(ans, [{ value: -ans, feedback: t`Check the sign with $v_y = u_x = 3x^2 - 3y^2$.` }]),
          hints: [t`$v_y = u_x = 3x^2 - 3y^2$, so $v = 3x^2y - y^3 + h(x)$.`, t`$v_x = 6xy + h'$ must equal $-u_y = 6xy$.`],
          teach: 'Integrate one Cauchy–Riemann equation, then fix the remaining function with the other.',
          explain: t`$v = 3x^2y - y^3$ (so $u + iv = z^3$), and $v(${x}, ${y}) = ${3 * x * x * y} - (${y ** 3}) = ${ans}$.`,
        };
      },
    }),
    mcq({
      id: 'cp-orthogonal', difficulty: 2,
      prompt: t`Why do the level curves of $u$ and of $v$ cross at right angles wherever $f = u + iv$ is analytic with $f' \ne 0$?`,
      visual: { type: 'cx-map', params: { f: 'z2', x: [0.2, 2], y: [0.2, 2], wx: [0, 4], wy: [0, 4], grid: 'none', drag: false, readout: false, curves: [1, 2, 3].map((c) => ({ param: [`sqrt((t + sqrt(t^2 + ${c * c}))/2)`, `${c}/(2*sqrt((t + sqrt(t^2 + ${c * c}))/2))`], t: [-4, 4], color: 'accent' })).concat([1, 2, 3].map((c) => ({ param: [`sqrt((${c} + sqrt(${c * c} + t^2))/2)`, `t/(2*sqrt((${c} + sqrt(${c * c} + t^2))/2))`], t: [0, 4], color: 'warn' }))) }, caption: t`Left: some level curves of $v = 2xy$ (blue) and of $u = x^2 - y^2$ (orange) in the first quadrant. Right: their images under $f = z^2$ — horizontal and vertical lines.` },
      choices: [t`$f$ sends them to the lines $v = $ const and $u = $ const, which are perpendicular, and an analytic map with $f' \ne 0$ preserves angles`, 'Because u and v are both harmonic', 'Because u and v have equal Laplacians', 'They are not always perpendicular; it happens only for polynomials'],
      answer: 0,
      why: { 1: t`Two harmonic functions need not have perpendicular level curves: $x$ and $x + y$ are both harmonic, and their level lines meet at $45^\circ$.`, 2: 'Equal Laplacians (both zero) says nothing about angles between level curves.', 3: t`It holds for every analytic $f$ with $f' \ne 0$ — for $e^z$ it is rays and circles.` },
      hints: ['What does f do to a level curve of u? Where does it land in the w-plane?'],
      teach: 'Level curves of u and v are the pre-images of the w-grid, and conformality keeps the grid’s right angles.',
      explain: t`On a level curve of $u$, $f$ takes values on a vertical line $u = c$; on a level curve of $v$, on a horizontal line. Those lines are perpendicular, and $f$ preserves angles where $f' \ne 0$, so the curves were perpendicular too. (Equivalently: $\nabla u\cdot\nabla v = u_xv_x + u_yv_y = u_xv_x - v_xu_x = 0$ by Cauchy–Riemann.)`,
    }),
    num({
      id: 'cp-heat-shield', difficulty: 3, transfer: true,
      gen(r) {
        const base = r.pick([[410, 425, 455, 470, 450, 420], [380, 388, 396, 446, 431, 405], [512, 530, 561, 574, 549, 520], [300, 305, 312, 356, 340, 320]]);
        const ans = base.reduce((s, x) => s + x, 0) / base.length;
        const pts = base.map((T, k) => ({ x: r6(Math.cos(k * TAU / 6)), y: r6(Math.sin(k * TAU / 6)), label: `${T} K`, color: 'gold' }));
        return {
          prompt: t`During a long steady test, a flat heat-shield panel with no internal heat sources has a temperature field $T(x, y)$ that obeys Laplace’s equation. Six thermocouples, equally spaced round a circle of radius 5 cm, read ${base.join(', ')} K. Estimate the temperature at the centre of the circle.`,
          visual: { type: 'graph', params: { x: [-2, 2], y: [-1.4, 1.4], equal: true, axes: false, grid: false, xlabel: '', ylabel: '', curves: [{ param: ['cos(t)', 'sin(t)'], t: [0, TAU], color: 'ink3', dash: [4, 4], width: 1.4 }], points: [...pts, { x: 0, y: 0, label: '?', color: 'accent' }] }, caption: 'The six thermocouples on a circle of radius 5 cm (drawn to a schematic scale) and the centre point.' },
          answer: ans, units: 'K', tol: { rel: 0, abs: 0.6 },
          errors: [{ value: (Math.max(...base) + Math.min(...base)) / 2, feedback: 'The mean-value property uses the average of all the readings round the circle, not the middle of the range.' }],
          hints: ['A harmonic function equals its average round any circle centred on the point.', 'Six equally spaced sensors approximate that average by their arithmetic mean.'],
          teach: 'The mean-value property turns a ring of sensors into an estimate of the value at its centre.',
          explain: t`$\bar T = (${base.join(' + ')})/6 = ${nm(ans, 4)}$ K. Exact for the true average round the circle; with six samples it is an estimate, accurate when $T$ varies smoothly round the ring. (Steady state and no sources are what make $T$ harmonic; a panel still heating up, or with internal heating, does not obey Laplace’s equation.)`,
        };
      },
    }),
  ],
  sources: [
    { label: 'Needham, Visual Complex Analysis (25th anniversary ed.), ch. 12 (flows and harmonic functions)', url: 'https://global.oup.com/academic/product/visual-complex-analysis-9780192868916' },
    { label: 'Brown & Churchill, Complex Variables and Applications (9th ed.), ch. 2 (harmonic functions)', url: 'https://openlibrary.org/isbn/9780073383170' },
  ],
});
