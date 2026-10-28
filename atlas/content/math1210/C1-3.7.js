// Implicit differentiation — slopes of curves that are not graphs of a
// function: orbits, adiabats, and a relativistic rocket’s worldline.
import { lesson, mcq, num, expr } from '../../src/core/content.js';
import { nice } from '../../src/core/format.js';
import { N, lineAt } from './_c1kit.js';

const t = String.raw;

// an ellipse x²/A² + y²/B² = 1 drawn as a parametric curve, with optional extras
const ellipse = (A, B, color = 'accent') => ({ param: [`${A}*cos(t)`, `${B}*sin(t)`], t: [0, 2 * Math.PI], color });

// x² + xy + y² = 7, solved for y: the two halves of a tilted ellipse
const TILT = ['(-x + sqrt(28 - 3*x^2))/2', '(-x - sqrt(28 - 3*x^2))/2'];
const TILT_X = Math.sqrt(28 / 3) - 1e-6;

export default lesson({
  id: 'math1210.C1-3.7',
  title: 'Implicit differentiation',
  minutes: 9, difficulty: 2,
  intro: t`Many curves are given by an equation in $x$ and $y$ rather than a formula $y = f(x)$: an orbit, a circle, a gas’s $PV$ curve. You can still find their slopes. Treat $y$ as an unknown function of $x$, differentiate **both sides** of the equation with respect to $x$, and solve for $dy/dx$. Every time you differentiate something made of $y$, the chain rule hands you a factor $dy/dx$:

$$\frac{d}{dx}\big[y^n\big] = n\,y^{n-1}\,\frac{dy}{dx}$$

For the circle $x^2 + y^2 = r^2$ this gives $2x + 2y\,\dfrac{dy}{dx} = 0$, so $\dfrac{dy}{dx} = -\dfrac{x}{y}$ — one formula for both halves, with no square roots.`,
  symbols: [
    { tex: 'x', text: 'the independent variable' },
    { tex: 'y', text: 'a quantity tied to $x$ by an equation, treated as an (unknown) function $y(x)$' },
    { tex: '\\frac{dy}{dx}', text: 'the slope of the curve at the point $(x, y)$; the answer usually involves both coordinates' },
    { tex: 'n', text: 'any fixed real power' },
  ],
  why: t`Physics hands you relations, not formulas — $PV^\gamma = \text{const}$, an energy that is conserved, the orbit equation — and implicit differentiation reads rates and slopes straight off them; it is also the engine of related rates (C1-4.1).`,
  visual: {
    type: 'graph',
    title: 'The tangent to an orbit',
    lead: t`A satellite’s orbit is the ellipse $\dfrac{x^2}{a^2} + \dfrac{y^2}{b^2} = 1$, with the planet at a focus. The gold line is the tangent at the satellite: its velocity always points along it. Implicit differentiation gives the slope as $\dfrac{dy}{dx} = -\dfrac{b^2x}{a^2y}$; the readouts compare that formula with the slope of the drawn tangent.`,
    tasks: [
      t`Move the satellite around the orbit: the formula and the tangent always agree.`,
      t`Put it at the top, $y = b$: the slope is $0$. Move it to the far end, $y = 0$: the formula divides by zero, and the tangent is vertical.`,
      t`Make $b$ equal to $a$: the orbit is a circle, the planet sits at the centre, and the slope becomes $-x/y$.`,
    ],
    params: {
      x: [-2.6, 2.6], y: [-2.2, 2.2], equal: true, xlabel: 'x', ylabel: 'y', xticks: 6, yticks: 5,
      sliders: [
        { key: 's', label: 'Position on the orbit', min: 0, max: 6.28, step: 0.01, value: 0.9, unit: t`\text{rad}`, explain: t`The angle parameter $s$ of the point $(a\cos s,\ b\sin s)$ — not the angle seen from the planet.` },
        { key: 'b', label: t`Semi-minor axis $b$`, min: 1, max: 2, step: 0.05, value: 1.4, explain: t`Half the orbit’s narrow width; the semi-major axis is fixed at $a = 2$.` },
      ],
      curves: [
        { param: ['2*cos(t)', 'b*sin(t)'], t: [0, 2 * Math.PI], color: 'accent' },
        { param: ['2*cos(s) - 2*sin(s)*t', 'b*sin(s) + b*cos(s)*t'], t: [-0.7, 0.7], color: 'gold', width: 2 },
      ],
      points: [
        { x: 'sqrt(4 - b^2)', y: 0, color: 'warn', r: 6, label: 'planet', labelDx: -10, labelDy: 16, labelAlign: 'right' },
        { x: '2*cos(s)', y: 'b*sin(s)', color: 'gold', r: 5, label: 'satellite' },
      ],
      readouts: [
        { label: t`$x$`, expr: '2*cos(s)', digits: 3 },
        { label: t`$y$`, expr: 'b*sin(s)', digits: 3 },
        { label: t`formula $-\frac{b^2x}{a^2y}$`, expr: '-(b^2*2*cos(s))/(4*b*sin(s))', digits: 3 },
        { label: 'slope of the tangent', expr: '(b*cos(s))/(-2*sin(s))', digits: 3 },
      ],
    },
    caption: t`A Kepler orbit with $a = 2$ in arbitrary units. The satellite’s speed varies around the orbit (fastest nearest the planet); only its direction is shown.`,
  },
  example: {
    prompt: t`Find the slope of the curve $x^2 + xy + y^2 = 7$ at the point $(1, 2)$, and the tangent line there.`,
    visual: {
      type: 'graph',
      params: {
        x: [-4, 4], y: [-3.6, 3.6], aspect: 'wide', equal: true,
        curves: [
          { fn: TILT[0], color: 'accent', domain: [-TILT_X, TILT_X] }, { fn: TILT[1], color: 'accent', domain: [-TILT_X, TILT_X] },
          { fn: lineAt(1, 2, -0.8), color: 'gold', dash: true, width: 1.8, domain: [-1.2, 3.4] },
        ],
        points: [{ x: 1, y: 2, color: 'gold', label: '(1, 2)' }],
      },
      caption: t`The curve is a tilted ellipse. No single formula $y = f(x)$ covers it — each $x$ has two points — but implicit differentiation finds the slope at either.`,
    },
    steps: [
      { label: 'Check the point', text: t`$1 + 1\cdot 2 + 4 = 7$ ✓ — the point is on the curve.` },
      { label: 'Differentiate both sides', text: t`$\dfrac{d}{dx}(x^2) = 2x$. $\dfrac{d}{dx}(xy) = y + x\dfrac{dy}{dx}$ by the product rule. $\dfrac{d}{dx}(y^2) = 2y\dfrac{dy}{dx}$ by the chain rule. The constant $7$ gives $0$.` },
      { label: 'Collect the slope terms', text: t`$2x + y + (x + 2y)\dfrac{dy}{dx} = 0$, so $\dfrac{dy}{dx} = -\dfrac{2x + y}{x + 2y}$.` },
      { label: 'Substitute the point', text: t`At $(1, 2)$: $\dfrac{dy}{dx} = -\dfrac{2 + 2}{1 + 4} = -\dfrac45$. Substitute only **after** differentiating: $x$ and $y$ vary along the curve.` },
      { label: 'Write the tangent', text: t`$y - 2 = -\tfrac45(x - 1)$, that is $y = -0.8x + 2.8$. The picture agrees: the curve is falling gently there.` },
    ],
    answer: t`$\dfrac{dy}{dx} = -\dfrac{2x + y}{x + 2y} = -\dfrac45$ at $(1, 2)$; tangent $y = -0.8x + 2.8$.`,
  },
  practice: [
    mcq({
      id: 'y-cubed', difficulty: 1,
      prompt: t`Treating $y$ as a function of $x$, what is $\dfrac{d}{dx}\big(y^3\big)$?`,
      visual: { type: 'graph', params: { x: [-2.2, 2.2], y: [-1.6, 1.6], aspect: 'wide', curves: [{ param: ['t^3 + t', 't'], t: [-1.15, 1.15], color: 'accent', label: 'y³ + y = x', labelAt: 0.9, labelDx: 8 }] }, caption: t`The curve $y^3 + y = x$: $y$ is a function of $x$, but you cannot easily solve for it. Its slope still comes from differentiating $y^3$.` },
      choices: [t`$3y^2\,\dfrac{dy}{dx}$`, t`$3y^2$`, t`$0$`, t`$3x^2$`],
      answer: 0,
      why: {
        1: t`That would be the derivative with respect to $y$. With respect to $x$, the chain rule adds the factor $dy/dx$.`,
        2: t`$y$ is not a constant: it changes as $x$ changes along the curve.`,
        3: t`$y^3$ is not $x^3$; differentiate the expression you have and keep the chain-rule factor.`,
      },
      hints: [t`$y^3$ is a function of a function: outer $u^3$, inner $u = y(x)$.`],
      teach: t`Differentiating any expression in $y$ with respect to $x$ produces a factor $dy/dx$.`,
      explain: t`By the chain rule, $\dfrac{d}{dx}y^3 = 3y^2\,\dfrac{dy}{dx}$. For the curve in the picture, $3y^2 y' + y' = 1$, so $y' = \dfrac{1}{3y^2 + 1}$.`,
    }),
    expr({
      id: 'ellipse-slope', difficulty: 2,
      gen(r) {
        const [a, b] = r.pick([[2, 3], [3, 2], [4, 1], [1, 4], [2, 5], [5, 3]]), c = a * b * 4;
        const A = Math.sqrt(c / a), B = Math.sqrt(c / b);
        return {
          prompt: t`Find $\dfrac{dy}{dx}$ for the ellipse $${a === 1 ? '' : a}x^2 + ${b === 1 ? '' : b}y^2 = ${c}$, in terms of $x$ and $y$.`,
          lhs: t`\frac{dy}{dx}`,
          answer: `-${a}x/(${b}y)`, answerTeX: t`-\frac{${a === 1 ? '' : a}x}{${b === 1 ? '' : b}y}`,
          vars: { x: [0.3, 1.5], y: [0.3, 1.5] },
          errors: [
            { answer: `-x/y`, feedback: t`Keep the coefficients: $\frac{d}{dx}(${a === 1 ? '' : a}x^2) = ${2 * a}x$ and $\frac{d}{dx}(${b === 1 ? '' : b}y^2) = ${2 * b}y\,y'$.` },
            { answer: `${a}x/(${b}y)`, feedback: t`Moving $${2 * a}x$ to the other side makes it negative.` },
            { answer: `-${b}y/(${a}x)`, feedback: t`Upside down: solve $${2 * a}x + ${2 * b}y\,y' = 0$ for $y'$.` },
          ],
          hints: [t`Differentiate term by term: $${2 * a}x + ${2 * b}y\dfrac{dy}{dx} = 0$.`],
          teach: t`Differentiate both sides, then solve the resulting linear equation for $dy/dx$.`,
          explain: t`$${2 * a}x + ${2 * b}y\,y' = 0$, so $y' = -\dfrac{${2 * a}x}{${2 * b}y} = -\dfrac{${a === 1 ? '' : a}x}{${b === 1 ? '' : b}y}$. In the upper right quarter both coordinates are positive and the slope is negative, as the picture shows.`,
          visual: { type: 'graph', params: { x: [-1.25 * Math.max(A, B), 1.25 * Math.max(A, B)], y: [-1.15 * Math.max(A, B), 1.15 * Math.max(A, B)], aspect: 'wide', equal: true, curves: [ellipse(N(A), N(B))] }, caption: t`The ellipse $${a === 1 ? '' : a}x^2 + ${b === 1 ? '' : b}y^2 = ${c}$, with semi-axes $${nice(A, 3)}$ and $${nice(B, 3)}$.` },
        };
      },
    }),
    num({
      id: 'cubic-curve', difficulty: 2,
      gen(r) {
        const [x0, y0] = r.pick([[1, 1], [2, 1], [3, 1], [1, 2], [3, 2]]);
        const k = x0 * x0 * y0 + y0 ** 3;
        const ans = -2 * x0 * y0 / (x0 * x0 + 3 * y0 * y0), wrong = -(2 * x0 * y0 + 3 * y0 * y0) / (x0 * x0);
        const top = Math.cbrt(k);
        return {
          prompt: t`The point $(${x0}, ${y0})$ lies on the curve $x^2y + y^3 = ${k}$. What is the slope $\dfrac{dy}{dx}$ there?`,
          answer: ans, tol: { rel: 0.005 },
          errors: [{ value: wrong, feedback: t`$\frac{d}{dx}(y^3) = 3y^2\,\frac{dy}{dx}$ — you dropped the chain-rule factor, so $3y^2$ landed on the wrong side.` }],
          hints: [t`Product rule on $x^2y$: $2xy + x^2\dfrac{dy}{dx}$. Chain rule on $y^3$: $3y^2\dfrac{dy}{dx}$.`, t`So $\dfrac{dy}{dx} = -\dfrac{2xy}{x^2 + 3y^2}$; now substitute the point.`],
          teach: t`Collect every term containing $dy/dx$ on one side, factor it out, divide.`,
          explain: t`$2xy + (x^2 + 3y^2)\,y' = 0$, so $y' = -\dfrac{2xy}{x^2 + 3y^2} = -\dfrac{${2 * x0 * y0}}{${x0 * x0 + 3 * y0 * y0}} = ${nice(ans)}$.`,
          visual: {
            type: 'graph',
            params: {
              x: [-4.5, 4.5], y: [-0.3, top * 1.35], aspect: 'wide',
              curves: [
                { param: [`sqrt((${k} - t^3)/t)`, 't'], t: [0.06, top - 1e-6], color: 'accent' }, { param: [`-sqrt((${k} - t^3)/t)`, 't'], t: [0.06, top - 1e-6], color: 'accent' },
              ],
              points: [{ x: x0, y: y0, color: 'gold', label: `(${x0}, ${y0})` }],
            },
            caption: t`The curve $x^2y + y^3 = ${k}$. Each $x$ has exactly one $y$, but solving the cubic for it is no fun — differentiate the equation instead.`,
          },
        };
      },
    }),
    num({
      id: 'adiabat', difficulty: 2,
      gen(r) {
        const P = r.pick([100, 150, 200, 300]), V = r.pick([1, 2, 4, 5]);
        const g = 1.4, ans = -g * P / V, C = P * V ** g;
        return {
          prompt: t`Air expanding with no heat flow (adiabatically) obeys $PV^{\gamma} = \text{constant}$, with $\gamma = 1.4$. At $P = ${P}$ kPa and $V = ${V}$ L, what is $\dfrac{dP}{dV}$?`,
          answer: ans, units: 'kPa/L', tol: { rel: 0.005 },
          errors: [{ value: -P / V, feedback: t`That is the isothermal slope, from $PV = \text{const}$. With $V^{\gamma}$ the chain rule brings down a factor $\gamma$.` }],
          hints: [t`Differentiate with respect to $V$, treating $P$ as a function of $V$: $\dfrac{dP}{dV}V^{\gamma} + P\gamma V^{\gamma - 1} = 0$.`, t`Divide by $V^{\gamma}$: $\dfrac{dP}{dV} = -\gamma\dfrac{P}{V}$.`],
          teach: t`Differentiating a conservation law such as $PV^\gamma = C$ gives the slope without solving for $P$.`,
          explain: t`$\dfrac{dP}{dV} = -\gamma\dfrac{P}{V} = -1.4\times\dfrac{${P}}{${V}} = ${nice(ans)}$ kPa/L — steeper than the isotherm through the same point, which is why an adiabatic compression heats a gas.`,
          visual: {
            type: 'graph',
            params: {
              x: [0, 3 * V], y: [0, 2.6 * P], aspect: 'wide', xlabel: 'V (L)', ylabel: 'P (kPa)',
              curves: [
                { fn: `${N(C)}*x^(-1.4)`, color: 'accent', domain: [V / 2, 3 * V], label: 'adiabat', labelAt: 2.4 * V, labelDy: -12 },
                { fn: `${P * V}/x`, color: 'ink3', dash: true, width: 1.4, domain: [V / 2.4, 3 * V], label: 'isotherm', labelAt: 2.4 * V, labelDy: -12 },
              ],
              points: [{ x: V, y: P, color: 'gold', label: `(${V} L, ${P} kPa)` }],
            },
            caption: t`The adiabat $PV^{1.4} = \text{const}$ through the state, and the isotherm $PV = \text{const}$ (dashed) for comparison. Ideal-gas behaviour assumed.`,
          },
        };
      },
    }),
    mcq({
      id: 'vertical-tangent', difficulty: 2,
      prompt: t`On the orbit $\dfrac{x^2}{a^2} + \dfrac{y^2}{b^2} = 1$, the slope is $\dfrac{dy}{dx} = -\dfrac{b^2x}{a^2y}$. Where is the satellite’s velocity vertical — that is, the tangent vertical?`,
      visual: { type: 'graph', params: { x: [-2.6, 2.6], y: [-1.7, 1.7], aspect: 'wide', equal: true, curves: [ellipse(2, 1.3)], points: [{ x: N(Math.sqrt(4 - 1.69)), y: 0, color: 'warn', r: 6, label: 'planet', labelDy: 16 }] }, caption: t`An orbit with $a = 2$ and $b = 1.3$, the planet at a focus. Arbitrary units.` },
      choices: [t`At $(\pm a, 0)$, where $y = 0$`, t`At $(0, \pm b)$, where $x = 0$`, 'Nowhere: an orbit has no vertical tangent', 'At the point of the orbit nearest the focus only'],
      answer: 0,
      why: {
        1: t`Where $x = 0$ the slope is $0$: those tangents are horizontal.`,
        2: t`The formula’s denominator vanishes where $y = 0$, and there the picture shows the orbit running straight up and down.`,
        3: t`The point nearest the focus, $(a, 0)$ here, is one of two; the far end $(-a, 0)$ has a vertical tangent too.`,
      },
      hints: [t`A vertical line has an infinite slope. When does the formula divide by zero?`],
      teach: t`Where implicit $dy/dx$ has a zero denominator (and nonzero numerator), the tangent is vertical.`,
      explain: t`The denominator $a^2y$ is zero at $y = 0$, the ends of the major axis $(\pm a, 0)$ — the closest and farthest points of the orbit, where the satellite moves exactly at right angles to the line through the planet.`,
    }),
    mcq({
      id: 'find-error-xy', difficulty: 3, kind: 'error',
      prompt: t`A student differentiates $xy = 6$:

$$x\,\frac{dy}{dx} = 0 \quad\Longrightarrow\quad \frac{dy}{dx} = 0.$$

What went wrong?`,
      visual: { type: 'graph', params: { x: [0, 6.5], y: [0, 6.5], aspect: 'wide', equal: true, curves: [{ fn: '6/x', color: 'accent', domain: [0.9, 6.5] }, { fn: lineAt(2, 3, -1.5), color: 'gold', dash: true, width: 1.8, domain: [0.8, 3.4] }], points: [{ x: 2, y: 3, color: 'gold', label: '(2, 3)' }] }, caption: t`The hyperbola $xy = 6$ falls everywhere — its slope is never $0$.` },
      choices: [
        t`$xy$ is a product: its derivative is $y + x\dfrac{dy}{dx}$`,
        t`The right side should differentiate to $6$, not $0$`,
        t`Nothing — the constant $6$ forces a zero slope`,
        t`Implicit differentiation is not allowed when $y$ can be solved for`,
      ],
      answer: 0,
      why: {
        1: t`$6$ is a constant, and the derivative of a constant is $0$; that side is right.`,
        2: t`A constant *value* of $xy$ does not make $y$ constant: as $x$ grows, $y$ must shrink to keep the product $6$.`,
        3: t`Solving first ($y = 6/x$) is allowed and gives the same answer; implicit differentiation is allowed too, done correctly.`,
      },
      hints: [t`Both factors of $xy$ change as you move along the curve.`, t`Product rule: $\dfrac{d}{dx}(xy) = 1\cdot y + x\dfrac{dy}{dx}$.`],
      teach: t`A term that mixes $x$ and $y$ needs the product rule, and the $y$ factor brings its own $dy/dx$.`,
      explain: t`$y + x\,y' = 0$ gives $y' = -\dfrac{y}{x}$: at $(2, 3)$ the slope is $-1.5$, the tangent in the picture. Solving first, $y = 6/x$ gives $y' = -6/x^2 = -1.5$ ✓.`,
    }),
    num({
      id: 'second-derivative', difficulty: 3,
      gen(r) {
        const [x0, y0, R] = r.pick([[3, 4, 5], [4, 3, 5], [6, 8, 10], [5, 12, 13], [12, 5, 13], [8, 6, 10]]);
        const ans = -(R * R) / y0 ** 3;
        return {
          prompt: t`For the circle $x^2 + y^2 = ${R * R}$, find $\dfrac{d^2y}{dx^2}$ at the point $(${x0}, ${y0})$.`,
          answer: ans, tol: { rel: 0.005 },
          errors: [{ value: -1 / y0, feedback: t`Differentiating $y' = -x/y$ needs the quotient rule, and the $y$ in it brings a $y'$ of its own: $y'' = -\dfrac{y - x\,y'}{y^2}$.` }],
          hints: [t`First, $y' = -\dfrac{x}{y}$, which is $${nice(-x0 / y0)}$ at the point.`, t`Quotient rule: $y'' = -\dfrac{y\cdot 1 - x\cdot y'}{y^2}$.`, t`Substitute $y' = -x/y$: $y'' = -\dfrac{y^2 + x^2}{y^3} = -\dfrac{${R * R}}{y^3}$.`],
          teach: t`For a second derivative, differentiate the first-derivative formula again — and remember that $y$ inside it still depends on $x$.`,
          explain: t`$y'' = -\dfrac{x^2 + y^2}{y^3} = -\dfrac{${R * R}}{${y0}^3} = ${nice(ans)}$. Negative, because the top half of a circle bends downward.`,
          visual: { type: 'graph', params: { x: [-1.35 * R, 1.35 * R], y: [-1.15 * R, 1.15 * R], aspect: 'wide', equal: true, curves: [ellipse(R, R)], points: [{ x: x0, y: y0, color: 'gold', label: `(${x0}, ${y0})` }] }, caption: t`The circle of radius $${R}$. On the top half the curve bends downward, so expect $y'' < 0$.` },
        };
      },
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-conic', difficulty: 2,
      gen(r) {
        const [x0, y0] = r.pick([[1, 3], [1, 2], [2, 1], [2, 3], [3, 1]]);
        const k = x0 * x0 + 3 * x0 * y0 + y0 * y0, ans = -(2 * x0 + 3 * y0) / (3 * x0 + 2 * y0);
        return {
          prompt: t`Find the slope of $x^2 + 3xy + y^2 = ${k}$ at the point $(${x0}, ${y0})$.`,
          answer: ans, tol: { rel: 0.005 },
          errors: [{ value: -(2 * x0) / (2 * y0), feedback: t`The middle term $3xy$ is a product; it contributes $3y + 3x\,y'$.` }],
          hints: [t`$2x + 3y + 3x\,y' + 2y\,y' = 0$.`],
          teach: t`Differentiate every term, product rule on the mixed term, then solve for $y'$.`,
          explain: t`$y' = -\dfrac{2x + 3y}{3x + 2y} = -\dfrac{${2 * x0 + 3 * y0}}{${3 * x0 + 2 * y0}} = ${nice(ans)}$.`,
          visual: { type: 'graph', params: { x: [-6, 6], y: [-6, 6], aspect: 'wide', equal: true, curves: [{ fn: `(-3*x + sqrt(5*x^2 + ${4 * k}))/2`, color: 'accent' }, { fn: `(-3*x - sqrt(5*x^2 + ${4 * k}))/2`, color: 'accent' }], points: [{ x: x0, y: y0, color: 'gold', label: `(${x0}, ${y0})` }] }, caption: t`The curve $x^2 + 3xy + y^2 = ${k}$ is a hyperbola with two branches.` },
        };
      },
    }),
    num({
      id: 'cp-hyperbolic', difficulty: 3, transfer: true,
      gen(r) {
        const [tt, xx] = r.pick([[0.75, 1.25], [2.4, 2.6], [1.875, 2.125], [1.05, 1.45], [0.225, 1.025]]);
        const ans = tt / xx;
        return {
          prompt: t`Work with $c = 1$: distances in light-years, times in years. A rocket that keeps a constant acceleration of about $1g$ as measured on board follows the worldline $x^2 - t^2 = 1$. At the event $t = ${tt}$ yr, $x = ${xx}$ ly, what is its velocity $\dfrac{dx}{dt}$, as a fraction of the speed of light?`,
          answer: ans, tol: { rel: 0.005 },
          errors: [{ value: xx / tt, feedback: t`Upside down: $2x\,\dfrac{dx}{dt} - 2t = 0$ gives $\dfrac{dx}{dt} = \dfrac{t}{x}$. A speed above $1$ would be faster than light.` }],
          hints: [t`Differentiate both sides with respect to $t$; $x$ is the unknown function: $2x\dfrac{dx}{dt} - 2t = 0$.`, t`So $\dfrac{dx}{dt} = \dfrac{t}{x}$.`],
          teach: t`Implicit differentiation works with any variable — here $t$ — and reads a velocity straight off a worldline’s equation.`,
          explain: t`$\dfrac{dx}{dt} = \dfrac{t}{x} = \dfrac{${tt}}{${xx}} = ${nice(ans, 4)}$. Because $x^2 = 1 + t^2 > t^2$, the ratio $t/x$ is always below $1$: the rocket approaches the speed of light but never reaches it.`,
          visual: {
            type: 'graph',
            params: {
              x: [-0.3, 3.4], y: [-0.2, 3], aspect: 'wide', equal: true, xlabel: 'x (ly)', ylabel: 't (yr)',
              curves: [{ param: ['sqrt(1 + t^2)', 't'], t: [0, 3], color: 'accent', label: 'worldline', labelAt: 2.6, labelDx: 8 }, { fn: 'x', color: 'warn', dash: true, width: 1.4, domain: [0, 3], label: 'light ray', labelAt: 2.6, labelDx: -78, labelDy: -4 }],
              points: [{ x: xx, y: tt, color: 'gold' }],
            },
            caption: t`A spacetime diagram, time upward. The worldline creeps toward the light ray but never crosses it. Special relativity in flat spacetime; $1$ ly/yr$^2$ of proper acceleration is $9.5\ \text{m/s}^2$.`,
          },
        };
      },
    }),
    mcq({
      id: 'cp-circle', difficulty: 2,
      prompt: t`What is the slope of the tangent to the circle $x^2 + y^2 = 25$ at the point $P = (3, -4)$?`,
      visual: { type: 'graph', params: { x: [-7, 7], y: [-6, 6], aspect: 'wide', equal: true, curves: [ellipse(5, 5)], points: [{ x: 3, y: -4, color: 'gold', label: 'P', labelDy: 16 }, { x: 0, y: 0, color: 'ink3' }] }, caption: t`The circle of radius $5$ and the point $P$ on its lower half.` },
      choices: [t`$\tfrac34$`, t`$-\tfrac34$`, t`$\tfrac43$`, t`$-\tfrac43$`],
      answer: 0,
      why: {
        1: t`$-x/y = -3/(-4)$: the two minus signs make the slope positive. The picture agrees — the circle climbs to the right at $P$.`,
        2: t`Upside down: $2x + 2y\,y' = 0$ gives $y' = -x/y$, not $-y/x$.`,
        3: t`That is the slope of the radius from the centre to $P$. The tangent is perpendicular to the radius.`,
      },
      hints: [t`$y' = -\dfrac{x}{y}$. Mind the sign of $y$.`],
      teach: t`On a circle the tangent is perpendicular to the radius, and $-x/y$ is exactly the negative reciprocal of the radius’s slope $y/x$.`,
      explain: t`$y' = -\dfrac{3}{-4} = \dfrac34$. The radius to $P$ has slope $-\tfrac43$; the product of the two slopes is $-1$, so they are perpendicular. ✓`,
    }),
  ],
  sources: [{ label: 'OpenStax Calculus Vol. 1, §3.8 Implicit differentiation', url: 'https://openstax.org/books/calculus-volume-1/pages/3-8-implicit-differentiation' }],
});
