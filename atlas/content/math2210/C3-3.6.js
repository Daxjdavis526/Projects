// The gradient as a covector: the partial derivatives of f form a machine
// that eats a displacement and returns a number, df(v) — no metric needed.
// Turning it into an arrow needs the metric ("raising the index"), and in
// polar coordinates (∂f/∂r, ∂f/∂θ) are not the arrow's components. The
// bridge from Calculus III to the tensors of general relativity.
import { lesson, mcq, num } from '../../src/core/content.js';
import { nice } from '../../src/core/format.js';
import { polarGrid, r6 } from './_partials.js';

const t = String.raw;
const DEG = Math.PI / 180;

// the Explore: f = y (choice 0) or f = xy (choice 1), at the polar point (rr, th°)
const C = 'cos(th*pi/180)', S = 'sin(th*pi/180)';
const pick = (a, b) => `(step(0.5 - fsel)*(${a}) + step(fsel - 0.5)*(${b}))`;
const FR = pick(S, `2*rr*${S}*${C}`);                         // ∂f/∂r
const FT = pick(`rr*${C}`, `rr^2*(${C}^2 - ${S}^2)`);         // ∂f/∂θ (per radian)
const PX = `rr*${C}`, PY = `rr*${S}`;
const K = 0.8;                                                  // arrow scale: map units per (unit of f per unit length)
// an arrow at P with polar-unit-basis components (a, b): a r̂ + b θ̂
const at = (a, b, o) => ({ from: [PX, PY], to: [`${PX} + ${K}*((${a})*${C} - (${b})*${S})`, `${PY} + ${K}*((${a})*${S} + (${b})*${C})`], ...o });

/**
 * A covector as a stack of level lines a·x + b·y = k·step on the graph sim,
 * with optional arrows (displacements). Lines are drawn parametrically, so any (a, b) works.
 */
function stack(a, b, { step = 1, x = [-1, 5], y = [-1, 4], arrows = [], points = [], caption, xlabel = 'x', ylabel = 'y' }) {
  const n2 = a * a + b * b, L = 12;
  const ks = [];
  const corners = [[x[0], y[0]], [x[1], y[0]], [x[0], y[1]], [x[1], y[1]]].map(([u, v]) => (a * u + b * v) / step);
  for (let k = Math.ceil(Math.min(...corners)); k <= Math.floor(Math.max(...corners)); k++) ks.push(k);
  return {
    type: 'graph',
    params: {
      x, y, equal: true, aspect: 'wide', xlabel, ylabel,
      curves: ks.map((k) => ({ param: [`${r6((k * step * a) / n2)} - ${r6(b / Math.sqrt(n2))}*t`, `${r6((k * step * b) / n2)} + ${r6(a / Math.sqrt(n2))}*t`], t: [-L, L], color: k === 0 ? 'accent' : 'accent2', width: k === 0 ? 2 : 1.2 })),
      arrows, points,
    },
    caption,
  };
}

/** A polar picture on c3-contour: f's level curves, the polar grid, a point P at (r, θ) and arrows. */
function polarPic(f, r, th, { arrows = [], caption, levels = 9, labels = true, unitBasis = true, ...rest } = {}) {
  const P = [r6(r * Math.cos(th)), r6(r * Math.sin(th))];
  const u = (v, len) => [r6(P[0] + v[0] * len), r6(P[1] + v[1] * len)];
  return {
    type: 'c3-contour',
    params: {
      f, x: [-4.4, 4.4], y: [-3.7, 3.7], levels, labels, fillAlpha: 0.25, ...rest,
      curves: polarGrid({ rings: [1, 2, 3, 4], rays: 12, reach: 4.3, color: 'ink4' }),
      points: [{ x: P[0], y: P[1], color: 'ink', label: 'P', labelDx: -16, labelDy: 12 }],
      arrows: [
        ...(unitBasis ? [{ from: P, to: u([Math.cos(th), Math.sin(th)], 0.7), color: 'ink3', label: 'r̂' }, { from: P, to: u([-Math.sin(th), Math.cos(th)], 0.7), color: 'ink3', label: 'θ̂' }] : []),
        ...arrows,
      ],
    },
    caption,
  };
}

export default lesson({
  id: 'math2210.C3-3.6',
  title: 'The gradient as a covector',
  minutes: 12, difficulty: 3,
  intro: t`So far the gradient has been an arrow. But what you actually compute first — the list of partial derivatives — is a different kind of object: a machine that takes in a displacement $\vec v$ and returns a number, the change in $f$ along it:

$$df(\vec v) = \frac{\partial f}{\partial x}\,v^x + \frac{\partial f}{\partial y}\,v^y$$

This **covector** $df$ needs no lengths and no angles. Its components transform **oppositely** to a displacement’s when you change coordinates, so the number $df(\vec v)$ never changes. To draw $df$ as the arrow $\nabla f$ you need one more ingredient, the **metric** — the rule for measuring lengths — and in curved coordinates such as polar coordinates, the arrow’s components are **not** the partial derivatives. General relativity is built on this distinction.`,
  symbols: [
    { tex: 'df', text: 'the **differential** of $f$ at a point: a covector, a linear machine that turns a displacement into the first-order change of $f$' },
    { tex: '\\vec v = (v^x,\\ v^y)', text: 'a small displacement and its components. The raised letters are labels, not powers: relativity writes vector components with upper indices' },
    { tex: '\\dfrac{\\partial f}{\\partial x},\\ \\dfrac{\\partial f}{\\partial y}', text: 'the covector’s components: units of $f$ **per** unit of each coordinate (per metre, per kilometre, per radian…)' },
    { tex: 'df(\\vec v)', text: 'a plain number, in the units of $f$ — the same whatever coordinates you compute it in' },
  ],
  why: t`In relativity a displacement $dx^\mu$ carries an upper index and a gradient $\partial_\mu\phi$ a lower one; the metric $g_{\mu\nu}$ is the only bridge between them, and lessons on tensors start exactly here.`,
  visual: {
    type: 'c3-contour',
    title: 'One gradient, two sets of numbers',
    lead: t`The map shows level curves of $f$ on a polar grid. At the point $P = (r, \theta)$, grey arrows are the unit vectors $\hat r$ and $\hat\theta$. The **green** arrow is the true gradient $\nabla f$. The **red** arrow is what you get by mistaking the partial derivatives $(\partial f/\partial r,\ \partial f/\partial\theta)$ for its components along $\hat r$ and $\hat\theta$.`,
    tasks: [
      t`With $f = y$, set $\theta = 0^\circ$ and slide $r$ from 1 to 3. The green arrow never changes — the slope of $f = y$ is the same everywhere — but the red one grows threefold, because $\partial f/\partial\theta = r\cos\theta$.`,
      t`Set $r = 1$: the two arrows coincide. Only on the unit circle is one radian of angle one unit of distance.`,
      t`Switch to $f = xy$ and turn $\theta$: the green arrow always crosses the level curve at right angles; the red one does not.`,
    ],
    params: {
      f: pick('y', 'x*y'), x: [-3.8, 3.8], y: [-3.1, 3.1], levels: 11, labels: false, fillAlpha: 0.25,
      choices: [{ key: 'fsel', label: 'Function', options: [[0, 'f = y'], [1, 'f = xy']], value: 0 }],
      sliders: [
        { key: 'rr', label: 'Radius $r$', min: 0.5, max: 3, step: 0.1, value: 2, explain: t`The distance of $P$ from the origin.` },
        { key: 'th', label: t`Angle $\theta$`, min: -180, max: 180, step: 5, value: 40, unit: '^\\circ', explain: t`The polar angle of $P$, anticlockwise from the $+x$ axis.` },
      ],
      curves: polarGrid({ rings: [1, 2, 3], rays: 12, reach: 3.6, color: 'ink4' }),
      points: [{ x: PX, y: PY, color: 'ink', label: 'P', labelDx: -16, labelDy: 12 }],
      arrows: [
        at('0.9375', '0', { color: 'ink3', label: 'r̂' }),
        at('0', '0.9375', { color: 'ink3', label: 'θ̂' }),
        at(FR, `${FT}/rr`, { color: 'good', label: '∇f' }),
        at(FR, FT, { color: 'bad', label: '(∂f/∂r, ∂f/∂θ)' }),
      ],
      readouts: [
        { label: t`$\partial f/\partial r$`, expr: FR, digits: 3 },
        { label: t`$\partial f/\partial\theta$ (per radian)`, expr: FT, digits: 3 },
        { label: t`$|\nabla f|$`, expr: `sqrt((${FR})^2 + (${FT}/rr)^2)`, digits: 3 },
        { label: 'red arrow’s length', expr: `sqrt((${FR})^2 + (${FT})^2)`, digits: 3 },
      ],
    },
    caption: t`The plane with its ordinary distances, labelled in polar coordinates; $\hat r$ and $\hat\theta$ are drawn 0.75 long, the gradients at 0.8 map units per unit of slope. The polar metric is $ds^2 = dr^2 + r^2\,d\theta^2$: a step $d\theta$ moves you $r\,d\theta$.`,
  },
  example: {
    prompt: t`Let $f(x, y) = xy$. At the point with polar coordinates $r = 2$, $\theta = \pi/6$: (a) find the covector components $\partial f/\partial r$ and $\partial f/\partial\theta$; (b) for the step $dr = 0.1$, $d\theta = 0.05$ rad, find $df$, and check it in Cartesian coordinates; (c) find the gradient arrow’s components along $\hat r$ and $\hat\theta$.`,
    visual: polarPic('x*y', 2, Math.PI / 6, { arrows: [{ from: [1.7321, 1], to: [1.7321 + 0.8 * 1, 1 + 0.8 * 1.7321], color: 'good', label: '∇f' }], caption: t`Level curves of $xy$ on a polar grid, with $P$ at $r = 2$, $\theta = 30^\circ$, its unit vectors, and the gradient $\nabla f = (y, x) = (1, \sqrt3)$ drawn 0.8 to scale.` }),
    steps: [
      { label: 'Covector in polar form', text: t`In polar coordinates $f = r^2\cos\theta\sin\theta = \tfrac12 r^2\sin2\theta$, so $\dfrac{\partial f}{\partial r} = r\sin2\theta = 2\sin60^\circ = 1.732$ and $\dfrac{\partial f}{\partial\theta} = r^2\cos2\theta = 4\cos60^\circ = 2$. Note the units: $\partial f/\partial\theta$ is per **radian**.` },
      { label: 'Pair it with a step', text: t`$df = \dfrac{\partial f}{\partial r}dr + \dfrac{\partial f}{\partial\theta}d\theta = 1.732(0.1) + 2(0.05) = 0.2732$. No lengths were needed — only the step’s coordinate components.` },
      { label: 'Same number in Cartesian', text: t`The same step is $dx = \cos\theta\,dr - r\sin\theta\,d\theta = 0.0366$ and $dy = \sin\theta\,dr + r\cos\theta\,d\theta = 0.1366$. With $\nabla f = (y, x) = (1, 1.732)$: $df = 1(0.0366) + 1.732(0.1366) = 0.2732$. ✓ The components changed; the number did not.` },
      { label: 'Raise the index', text: t`An arrow’s component along $\hat\theta$ is a rate **per unit distance**, and a step $d\theta$ covers a distance $r\,d\theta$ (the metric $ds^2 = dr^2 + r^2d\theta^2$). So $\nabla f = \dfrac{\partial f}{\partial r}\hat r + \dfrac1r\dfrac{\partial f}{\partial\theta}\hat\theta = 1.732\,\hat r + 1\,\hat\theta$.` },
      { label: 'Sense check', text: t`$|\nabla f| = \sqrt{1.732^2 + 1^2} = 2$, and the Cartesian $|(1, 1.732)| = 2$. ✓ Reading $(1.732, 2)$ as the arrow’s components would give a length of $2.65$ — wrong by the factor $r$ in the $\theta$ part.` },
    ],
    answer: t`(a) $(1.732,\ 2)$; (b) $df = 0.2732$ both ways; (c) $\nabla f = 1.732\,\hat r + 1\,\hat\theta$, of length 2.`,
  },
  practice: [
    num({
      id: 'pairing', difficulty: 1,
      gen(r) {
        const a = r.pick([2, 3, 4]), b = r.pick([-2, -1, 1, 2]), vx = r.pick([3, 4, 5]), vy = r.pick([1, 2, -1]);
        const df = a * vx + b * vy;
        return {
          prompt: t`At a point on a plate, the temperature’s covector has components $\left(\dfrac{\partial T}{\partial x},\ \dfrac{\partial T}{\partial y}\right) = (${a},\ ${b})$ K/cm. By how much does the temperature change, to first order, along the displacement $\vec v = (${vx},\ ${vy})$ mm? (Mind the units.)`,
          visual: stack(a / 10, b / 10, { step: 0.5, x: [-2, 7], y: [-3, 4], arrows: [{ from: [0, 0], to: [vx, vy], color: 'gold', label: 'v', labelDx: 6, labelDy: -6 }], xlabel: 'x (mm)', ylabel: 'y (mm)', caption: t`The covector $dT$ drawn as a stack of equally spaced level lines of its linearisation (the thick one passes through the start), and the displacement $\vec v$ in gold, in millimetres. The denser the stack, the larger the covector.` }),
          answer: df / 10, units: 'K', difference: true, tol: { rel: 1e-3, abs: 1e-6 },
          errors: [{ value: df, feedback: t`The covector is per **centimetre** and the displacement is in **millimetres**: convert $\vec v$ to $(${vx / 10},\ ${vy / 10})$ cm first.` }],
          hints: [t`$dT(\vec v) = \dfrac{\partial T}{\partial x}v^x + \dfrac{\partial T}{\partial y}v^y$, with every length in the same unit.`, t`$\vec v = (${vx / 10},\ ${vy / 10})$ cm.`],
          teach: 'A covector pairs with a displacement by multiplying matching components and adding: per-centimetre times centimetres gives a plain change.',
          explain: t`$dT = ${a}(${vx / 10}) + ${b < 0 ? `(${b})` : b}(${vy / 10}) = ${nice(df / 10)}$ K. No lengths or angles entered — only components. In the picture the stack’s lines are half a kelvin apart, so $\vec v$ crosses about ${nice(Math.abs(df / 5))} of them.`,
        };
      },
    }),
    num({
      id: 'units', difficulty: 2,
      gen(r) {
        const g = r.pick([0.002, 0.004, 0.006]), dx = r.pick([1500, 2500, 4000]);
        return {
          prompt: t`Along a runway the air temperature rises at $\dfrac{\partial T}{\partial x} = ${g}$ K/m. Re-express the coordinate in kilometres, $x' = x/1000$. What is $\dfrac{\partial T}{\partial x'}$, in K per km? (A displacement of ${dx} m becomes ${dx / 1000} km: its component shrinks by 1000.)`,
          visual: stack(g * 1000, 0, { step: 1, x: [-0.5, 5], y: [-1, 1.6], arrows: [{ from: [0, 0.6], to: [dx / 1000, 0.6], color: 'gold', label: `${dx} m = ${dx / 1000} km`, labelDx: -40, labelDy: -12 }], xlabel: 'x′ (km)', ylabel: '', caption: t`Isotherms one kelvin apart (blue) along the runway, and the displacement (gold). Changing units relabels the axis; the lines and the arrow are untouched.` }),
          answer: g * 1000, units: 'K/km', tol: { rel: 1e-3 },
          errors: [{ value: g / 1000, feedback: t`That is how a displacement’s component changes. A covector’s component is **per** unit length, so it changes the opposite way: per kilometre is 1000 times per metre.` }],
          hints: [t`By the chain rule, $\dfrac{\partial T}{\partial x'} = \dfrac{\partial T}{\partial x}\dfrac{dx}{dx'}$, and $x = 1000\,x'$.`],
          teach: 'Under a change of units a displacement’s components scale one way and a covector’s components scale the other, so their pairing is unchanged.',
          explain: t`$\dfrac{\partial T}{\partial x'} = ${g} \times 1000 = ${nice(g * 1000)}$ K/km. Check the pairing: $${g}\ \text{K/m} \times ${dx}\ \text{m} = ${nice(g * dx)}$ K and $${nice(g * 1000)}\ \text{K/km} \times ${dx / 1000}\ \text{km} = ${nice(g * dx)}$ K. The components moved in opposite directions; the physics did not.`,
        };
      },
    }),
    num({
      id: 'theta-comp', difficulty: 2,
      gen(r) {
        const R = r.pick([2, 3]), ang = r.pick([30, 60, 150, -30]);
        // f = x: ∂f/∂θ = −r sin θ; the θ̂-component of ∇f = x̂ is −sin θ
        const comp = -Math.sin(ang * DEG);
        return {
          prompt: t`For $f(x, y) = x$, at the point with polar coordinates $r = ${R}$, $\theta = ${ang}^\circ$: here $\dfrac{\partial f}{\partial\theta} = -r\sin\theta = ${nice(+(-R * Math.sin(ang * DEG)).toFixed(4))}$ per radian. What is the component of the gradient arrow $\nabla f$ along the unit vector $\hat\theta$?`,
          visual: polarPic('x', R, ang * DEG, { levels: 9, caption: t`Level curves of $f = x$ (vertical lines) on a polar grid, with $P$ and its unit vectors $\hat r$, $\hat\theta$.` }),
          answer: comp, tol: { rel: 1e-3, abs: 1e-6 },
          errors: [
            { value: -R * Math.sin(ang * DEG), feedback: t`That is $\partial f/\partial\theta$, a rate per radian. Along $\hat\theta$ a radian is $r = ${R}$ units of distance, so divide by $r$.` },
            { value: -Math.sin(ang * DEG) / R, feedback: t`Dividing by $r^2$ gives the component along the coordinate vector $\partial_\theta$, which is $r$ long. Along the **unit** vector $\hat\theta$, divide by $r$ once.` },
          ],
          hints: [t`A step $d\theta$ moves you a distance $r\,d\theta$, so the rate per unit distance in the $\hat\theta$ direction is $\dfrac{1}{r}\dfrac{\partial f}{\partial\theta}$.`, t`Check: $\nabla f = \hat x$ everywhere, and $\hat x\cdot\hat\theta = -\sin\theta$.`],
          teach: 'An arrow’s θ̂-component is (1/r)·∂f/∂θ: the metric converts “per radian” into “per unit length”.',
          explain: t`$\dfrac1r\dfrac{\partial f}{\partial\theta} = \dfrac{-${R}\sin${ang}^\circ}{${R}} = ${nice(+comp.toFixed(4))}$. Indeed $\nabla x = \hat x$, and $\hat x\cdot\hat\theta = -\sin\theta$. The raw $\partial f/\partial\theta$ would make the arrow ${R} times too long in that direction.`,
        };
      },
    }),
    mcq({
      id: 'needs-metric', difficulty: 2,
      prompt: t`You know only the covector $df$ at a point — its components — and nothing about lengths or angles in your coordinates. Which of these can you **not** work out?`,
      visual: stack(1, 2, { step: 1, x: [-1, 5], y: [-1, 3], arrows: [{ from: [0, 0], to: [2, 1], color: 'gold', label: 'v', labelDx: 6, labelDy: 8 }, { from: [0, 0], to: [2, -1], color: 'violet', label: 'w', labelDx: 6, labelDy: 8 }], caption: t`A covector drawn as its stack of level lines, and two displacements. Nothing in the picture says how long a unit is in each direction.` }),
      choices: [
        'The direction of steepest ascent',
        t`The change of $f$ along the displacement $\vec v$`,
        t`Whether the displacement $\vec w$ runs along a level curve`,
        t`Which of $\vec v$ and $2\vec v$ changes $f$ more`,
      ],
      answer: 0,
      why: {
        1: t`That is $df(\vec v)$: multiply components and add. No metric needed.`,
        2: t`$\vec w$ runs along a level curve exactly when $df(\vec w) = 0$ — again just the pairing.`,
        3: t`$df(2\vec v) = 2\,df(\vec v)$: linearity alone answers it.`,
      },
      hints: ['Steepest per what? Comparing directions fairly means comparing steps of equal length.', 'Which of these needs you to know when two displacements have the same length?'],
      teach: 'Pairing a covector with a displacement needs no metric; comparing directions “per unit length” — steepest ascent, the arrow ∇f — does.',
      explain: t`“Steepest” means the largest change per unit **distance**, and distance needs the metric. Stretch the $y$-axis’s units and the steepest direction swings round, while $df(\vec v)$, the level curves and linearity stay put. That is why $\nabla f$, the arrow, depends on the metric and $df$ does not.`,
    }),
    num({
      id: 'transform', difficulty: 3,
      gen(r) {
        const a = r.pick([2, 3, 4, 6]), b = r.pick([1, -1, 2, -2]);
        return {
          prompt: t`In coordinates $(x, y)$ a covector has components $\left(\dfrac{\partial f}{\partial x},\ \dfrac{\partial f}{\partial y}\right) = (${a},\ ${b})$. New coordinates are $u = x + y$, $v = x - y$. What is $\dfrac{\partial f}{\partial u}$?`,
          visual: {
            type: 'graph',
            params: {
              x: [-2.6, 2.6], y: [-1.6, 1.6], equal: true, aspect: 'wide',
              curves: [-3, -2, -1, 0, 1, 2, 3].flatMap((k) => [
                { param: [`${k / 2} + t`, `${k / 2} - t`], t: [-3, 3], color: 'violet', width: k === 0 ? 2 : 1 },
                { param: [`${k / 2} + t`, `${-k / 2} + t`], t: [-3, 3], color: 'teal', width: k === 0 ? 2 : 1 },
              ]),
            },
            caption: t`The new coordinate grid over the old one: violet lines are $u = x + y = $ const, teal lines $v = x - y = $ const, one unit apart.`,
          },
          answer: (a + b) / 2, tol: { rel: 1e-3, abs: 1e-9 },
          errors: [
            { value: a + b, feedback: t`That transforms the covector like a displacement ($du = dx + dy$). Covectors use the inverse: $x = \tfrac{u + v}{2}$, so $\dfrac{\partial x}{\partial u} = \dfrac{\partial y}{\partial u} = \tfrac12$.` },
            ...(b !== 0 ? [{ value: (a - b) / 2, feedback: t`That is $\partial f/\partial v$: $\dfrac{\partial y}{\partial v} = -\tfrac12$.` }] : []),
          ],
          hints: [t`Solve for the old coordinates: $x = \tfrac{u + v}{2}$, $y = \tfrac{u - v}{2}$.`, t`Chain rule: $\dfrac{\partial f}{\partial u} = \dfrac{\partial f}{\partial x}\dfrac{\partial x}{\partial u} + \dfrac{\partial f}{\partial y}\dfrac{\partial y}{\partial u}$.`],
          teach: 'Covector components transform with the inverse of the matrix that transforms displacements — the chain rule guarantees it.',
          explain: t`$\dfrac{\partial f}{\partial u} = ${a}\cdot\tfrac12 + ${b < 0 ? `(${b})` : b}\cdot\tfrac12 = ${nice((a + b) / 2)}$. A displacement $(dx, dy)$ becomes $(du, dv) = (dx + dy,\ dx - dy)$, and you can check that $\dfrac{\partial f}{\partial u}du + \dfrac{\partial f}{\partial v}dv = ${a}\,dx + ${b < 0 ? `(${b})` : b}\,dy$: the pairing is the same in both systems.`,
        };
      },
    }),
    mcq({
      id: 'error-angle', difficulty: 3, kind: 'error',
      prompt: t`The polar angle $\theta(x, y)$ has $\dfrac{\partial\theta}{\partial r} = 0$ and $\dfrac{\partial\theta}{\partial\theta} = 1$. A student concludes that $\nabla\theta = \hat\theta$, an arrow of length 1 at every point. What is wrong?`,
      visual: polarPic('atan2(y, x)', 2, Math.PI / 4, { levels: 12, labels: false, caption: t`Level curves of $\theta$ are the rays from the origin (the cut where $\theta$ jumps from $\pi$ to $-\pi$ is drawn too). The point $P$ is at $r = 2$.` }),
      choices: [
        t`$\partial\theta/\partial\theta = 1$ is per radian, not per unit length: $\nabla\theta = \tfrac1r\hat\theta$, shorter far from the origin`,
        t`Nothing: $\theta$ grows at the same rate everywhere, so its gradient is the same length everywhere`,
        t`$\nabla\theta$ should point along $\hat r$, away from the origin`,
        t`$\nabla\theta$ is zero, because $\theta$ does not depend on $r$`,
      ],
      answer: 0,
      why: {
        1: t`It grows by one per **radian** everywhere, but a radian of arc is $r$ units of distance. Far out, the rays (its level curves) are far apart: the slope per unit distance is small.`,
        2: t`Moving along $\hat r$ keeps you on a ray, a level curve of $\theta$. The gradient is perpendicular to it.`,
        3: t`$\partial\theta/\partial r = 0$ kills only the $\hat r$ part; moving around the circle still changes $\theta$.`,
      },
      hints: [t`How far do you travel when $\theta$ increases by one radian at radius $r$?`, t`The arrow’s $\hat\theta$-component is $\dfrac1r\dfrac{\partial\theta}{\partial\theta}$.`],
      teach: 'Partial derivatives with respect to an angle are per radian; turning them into an arrow’s components needs the metric’s factor 1/r.',
      explain: t`At radius $r$ a step $d\theta$ covers $r\,d\theta$, so the rate per unit distance is $\tfrac1r$: $\nabla\theta = \tfrac1r\hat\theta = \left(-\tfrac{y}{x^2 + y^2},\ \tfrac{x}{x^2 + y^2}\right)$. This is the velocity field of an ideal vortex, $\vec v \propto \nabla\theta$, whose speed falls as $1/r$.`,
    }),
    mcq({
      id: 'minkowski', difficulty: 3,
      prompt: t`In flat spacetime with $c = 1$ and the metric $\eta = \mathrm{diag}(-1,\ 1)$ in $(t, x)$, a scalar field $\phi = 3t + 2x$ has covector components $(\partial_t\phi,\ \partial_x\phi) = (3,\ 2)$. Raising the index with the metric, what are the components $(\partial^t\phi,\ \partial^x\phi)$ of the arrow?`,
      visual: stack(2, 3, { step: 2, x: [-1.5, 3], y: [-0.8, 2.4], xlabel: 'x', ylabel: 't', caption: t`A spacetime diagram ($t$ up, $x$ across, $c = 1$) with the covector $d\phi$ as its stack of level lines $3t + 2x = $ const, two units of $\phi$ apart. The arrow is what the question asks for.` }),
      choices: ['(−3, 2)', '(3, 2)', '(3, −2)', '(−3, −2)'],
      answer: 0,
      why: {
        1: 'That copies the covector components unchanged — only right when the metric is the identity, as in Euclidean Cartesian coordinates.',
        2: t`The minus sign belongs to the time component: $\eta^{tt} = -1$ and $\eta^{xx} = +1$.`,
        3: t`Only the time–time entry of the inverse metric is negative; the space component keeps its sign.`,
      },
      hints: [t`Raising an index uses the inverse metric: $\partial^\mu\phi = \eta^{\mu\nu}\partial_\nu\phi$ (summed over $\nu$).`, t`For $\eta = \mathrm{diag}(-1, 1)$ the inverse is also $\mathrm{diag}(-1, 1)$.`],
      teach: 'With signature (−, +), raising an index flips the sign of the time component: ∂^t φ = −∂_t φ.',
      explain: t`$\partial^t\phi = \eta^{tt}\partial_t\phi = -3$ and $\partial^x\phi = \eta^{xx}\partial_x\phi = +2$. In Carroll’s conventions, signature $(-,+,+,+)$, this sign flip is everywhere: it is why a field increasing toward the future has a gradient arrow pointing toward the **past**.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-pair', difficulty: 2,
      gen(r) {
        const fr = r.pick([2, 3, -1]), fth = r.pick([4, 6, -2]), dr = r.pick([0.1, 0.2]), dth = r.pick([0.05, -0.05, 0.1]);
        const df = fr * dr + fth * dth;
        return {
          prompt: t`At a point, $\dfrac{\partial f}{\partial r} = ${fr}$ and $\dfrac{\partial f}{\partial\theta} = ${fth}$ (per radian). Estimate the change in $f$ for the step $dr = ${dr}$, $d\theta = ${dth}$ rad.`,
          visual: polarPic('x*y', 2, 0.6, { levels: 9, labels: false, unitBasis: false, arrows: [{ from: [r6(2 * Math.cos(0.6)), r6(2 * Math.sin(0.6))], to: [r6((2 + 4 * dr) * Math.cos(0.6 + 4 * dth)), r6((2 + 4 * dr) * Math.sin(0.6 + 4 * dth))], color: 'gold', label: 'step (×4)' }], caption: t`A point on a polar grid and the step, drawn four times larger so it shows. The pairing needs only the step’s coordinate components.` }),
          answer: df, tol: { rel: 1e-3, abs: 1e-9 },
          hints: [t`$df = \dfrac{\partial f}{\partial r}dr + \dfrac{\partial f}{\partial\theta}d\theta$.`],
          teach: 'df pairs coordinate components with coordinate steps — in any coordinates, with no metric.',
          explain: t`$df = ${fr}(${dr}) + ${fth < 0 ? `(${fth})` : fth}(${dth}) = ${nice(df)}$. The radius $r$ never entered: the covector does not need it.`,
        };
      },
    }),
    num({
      id: 'cp-length', difficulty: 3,
      gen(r) {
        const R = r.pick([2, 4, 5]), fr = r.pick([3, 4]), fth = r.pick([8, 10, 12]);
        const len = Math.hypot(fr, fth / R);
        return {
          prompt: t`At a point with $r = ${R}$, a function has $\dfrac{\partial f}{\partial r} = ${fr}$ and $\dfrac{\partial f}{\partial\theta} = ${fth}$ per radian. In the plane’s ordinary geometry ($ds^2 = dr^2 + r^2d\theta^2$), what is the length $|\nabla f|$ of its gradient arrow — the steepest slope?`,
          visual: polarPic('x^2 + y^2', R / 2, 0.5, { levels: [], fill: false, labels: false, caption: t`The point at $r = ${R}$ on a polar grid (rings every 2 units), with its unit vectors $\hat r$ and $\hat\theta$.` }),
          answer: len, tol: { rel: 2e-3 },
          errors: [{ value: Math.hypot(fr, fth), feedback: t`$${fth}$ is per radian. Along $\hat\theta$ the slope per unit length is $\tfrac{1}{${R}}\times${fth}$.` }, { value: Math.hypot(fr, fth / (R * R)), feedback: t`$\tfrac{1}{r^2}\tfrac{\partial f}{\partial\theta}$ is the component along $\partial_\theta$, a vector $r$ long. For the length, use the unit-vector component $\tfrac1r\tfrac{\partial f}{\partial\theta}$.` }],
          hints: [t`In the unit basis, $\nabla f = \dfrac{\partial f}{\partial r}\hat r + \dfrac1r\dfrac{\partial f}{\partial\theta}\hat\theta$.`, t`$|\nabla f| = \sqrt{\left(\dfrac{\partial f}{\partial r}\right)^2 + \left(\dfrac1r\dfrac{\partial f}{\partial\theta}\right)^2}$.`],
          teach: 'The gradient’s length needs the metric: |∇f|² = (∂f/∂r)² + (∂f/∂θ)²/r² in polar coordinates.',
          explain: t`$|\nabla f| = \sqrt{${fr}^2 + (${fth}/${R})^2} = ${nice(+len.toPrecision(4))}$. In index language, $|\nabla f|^2 = g^{ij}\,\partial_i f\,\partial_j f$ with $g^{rr} = 1$, $g^{\theta\theta} = 1/r^2$.`,
        };
      },
    }),
    num({
      id: 'cp-wake', difficulty: 3, transfer: true,
      gen(r) {
        const G = r.pick([400, 500, 600]), R = r.pick([10, 15, 20]);
        const v = G / (2 * Math.PI * R);
        return {
          prompt: t`Behind a large airliner on approach, each wingtip trails a vortex. Outside its core it is close to a free vortex, with velocity $\vec v = \dfrac{\Gamma}{2\pi}\nabla\theta$, where $\theta$ is the polar angle around the vortex axis and the circulation is $\Gamma = ${G}$ m²/s. How fast does the air swirl ${R} m from the axis?`,
          visual: polarPic('atan2(y, x)', 2, 2.2, { levels: 12, labels: false, unitBasis: false, caption: t`Level curves of $\theta$ around the vortex axis (the rays), one grid ring per ${R / 2} m. Their spacing grows with distance — and so does the slope’s denominator.` }),
          answer: v, units: 'm/s', tol: { rel: 0.01 },
          errors: [{ value: G / (2 * Math.PI), feedback: t`That takes $|\nabla\theta| = 1$, reading $\partial\theta/\partial\theta = 1$ (per radian) as a slope per metre — a swirl as fast at 1 km as at 1 m. $|\nabla\theta| = 1/r$.` }],
          hints: [t`$\theta$ changes by one radian over an arc of length $r$, so $|\nabla\theta| = 1/r$.`, t`$|\vec v| = \dfrac{\Gamma}{2\pi r}$.`],
          teach: 'The gradient of the angle is (1/r) θ̂, so a free vortex’s speed falls as 1/r.',
          explain: t`$|\vec v| = \dfrac{\Gamma}{2\pi}\cdot\dfrac1r = \dfrac{${G}}{2\pi\times${R}} = ${v.toFixed(1)}$ m/s. That is why air-traffic control spaces landings behind heavy aircraft: the swirl is strong enough to roll a light aircraft. (A real wake vortex has a viscous core and decays over minutes; the free vortex is the model outside the core.)`,
        };
      },
    }),
  ],
  sources: [
    { label: 'OpenStax Calculus Vol. 3, §4.6 Directional derivatives and the gradient', url: 'https://openstax.org/books/calculus-volume-3/pages/4-6-directional-derivatives-and-the-gradient' },
    { label: 'Carroll, Lecture Notes on General Relativity, ch. 1 (dual vectors) and ch. 2 (gradients and the metric)', url: 'https://arxiv.org/abs/gr-qc/9712019' },
  ],
});
