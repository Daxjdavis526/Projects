// Curve sketching — the sign of f′ says rising or falling, the sign of f″ says
// which way the curve bends; together they fix the shape of a graph.
import { lesson, mcq, num, match } from '../../src/core/content.js';
import { nice } from '../../src/core/format.js';
import { curveFig, fitY } from './_c1kit.js';

const t = String.raw;
const E1 = Math.exp(-1), E2 = 2 * Math.exp(-2);

// a graph of f′ (not f), drawn in green so it is not mistaken for f
const fprimeFig = (fn, x, y, caption, more = {}) => ({
  type: 'graph',
  params: { x, y, aspect: 'wide', ylabel: 'f′(x)', curves: [{ fn, color: 'good', label: 'f′', labelAt: x[1] - 0.35 }], ...more },
  caption,
});

// the second-derivative test, one variant per sign of f″(c)
const SECOND = [
  { s: -1, ans: 0, fn: '2 - 0.75*(x - 2)^2' },
  { s: 1, ans: 1, fn: '1 + 0.75*(x - 2)^2' },
  { s: 0, ans: 3, fn: '1.5 + 0.3*(x - 2)^3' },
];

export default lesson({
  id: 'math1210.C1-4.5',
  title: 'Curve sketching: what f′ and f″ say',
  minutes: 10, difficulty: 2,
  intro: t`Two signs describe the shape of a graph. The first derivative says which way it goes; the second says which way it bends:

$$f' > 0:\ \text{rising}, \quad f' < 0:\ \text{falling}; \qquad f'' > 0:\ \text{concave up}, \quad f'' < 0:\ \text{concave down}$$

Where $f'$ changes sign the graph has a peak or a valley (the **first-derivative test**); where $f''$ changes sign it has an **inflection point**, where the bending reverses and the slope is steepest or shallowest. A physicist reads these off motion graphs every day: velocity is the slope of position, acceleration its bending.`,
  symbols: [
    { tex: "f'(x)", text: 'the slope of $f$ at $x$; its **sign** says rising ($+$) or falling ($-$)' },
    { tex: "f''(x)", text: 'the rate of change of the slope; its **sign** says concave up (slope increasing, $+$) or concave down (slope decreasing, $-$)' },
    { tex: 'c', text: "a **critical point**: where $f'(c) = 0$ or $f'(c)$ does not exist — the only candidates for peaks and valleys" },
    { tex: '\\text{inflection point}', text: "a point where the graph is continuous and $f''$ **changes sign**" },
  ],
  why: t`Reading a graph’s shape from its derivatives is how you check a model before trusting a number from it: where a potential has its minimum, when a gauge needle peaks, where a beam profile is steepest.`,
  visual: {
    type: 'graph',
    title: 'Slope and bending, read off the derivatives',
    lead: t`The blue curve is $f(x) = x^3 - 3px$. Switch on $f'$ (green) and $f''$ (amber), change $p$, and drag the gold point. Compare the **signs** of the green and amber curves with what the blue curve is doing above them.`,
    tasks: [
      'Show f and f′. Wherever green is above the axis, blue rises; wherever green is below, blue falls.',
      'Set p = 1: green crosses zero at x = −1 (from + to −: a peak) and x = 1 (from − to +: a valley).',
      'Show f″ too. Amber changes sign at x = 0 for every p: there the blue curve switches from bending down to bending up — the inflection point, where the slope is least.',
    ],
    params: {
      x: [-3, 3], y: [-6, 6], aspect: 'wide',
      sliders: [{ key: 'p', label: t`Parameter $p$`, min: -1, max: 2, step: 0.05, value: 1, explain: t`$f'(x) = 3x^2 - 3p$: for $p > 0$ it has two zeros, $x = \pm\sqrt p$; for $p < 0$ none.` }],
      choices: [{ key: 's', label: 'Show', options: [[0, 'f only'], [1, 'f and f′'], [2, 'f, f′ and f″']], value: 1, explain: 'Which derivatives to draw on top of f.' }],
      curves: [
        { fn: 'x^3 - 3*p*x', color: 'accent', label: 'f', labelAt: 2.05, labelDx: 8 },
        { fn: '3*x^2 - 3*p', color: 'good', dash: true, width: 1.8, when: 'step(s - 0.5)', label: 'f′', labelAt: 1.6, labelDx: -22 },
        { fn: '6*x', color: 'warn', dash: true, width: 1.8, when: 'step(s - 1.5)', label: 'f″', labelAt: 0.8 },
      ],
      tangent: { fn: 'x^3 - 3*p*x', at: -1.6 },
      readouts: [
        { label: t`$x$`, expr: 'x0', digits: 3 },
        { label: t`$f'(x)$`, expr: '3*x0^2 - 3*p', digits: 3 },
        { label: t`$f''(x)$`, expr: '6*x0', digits: 3 },
      ],
    },
    caption: 'All three curves share one set of axes, so their heights are in different units; only the signs and zeros are meant to be compared.',
  },
  example: {
    prompt: t`A critically damped gauge needle, kicked at $t = 0$, deflects as $\theta(t) = A\,\dfrac{t}{\tau}\,e^{-t/\tau}$, where $A$ sets the size and $\tau$ is the gauge’s time constant. In units where $\tau = 1$ and $A = 1$, sketch $f(t) = t\,e^{-t}$ for $t \ge 0$: when does the needle peak, and when is it swinging back fastest?`,
    visual: curveFig({ fn: 'x*e^(-x)', x: [-0.3, 6.2], y: [-0.06, 0.46], xlabel: 't / τ', ylabel: 'θ / A', domain: [0, 6.2], points: [{ x: 1, y: E1, color: 'gold', label: 'peak' }, { x: 2, y: E2, color: 'violet', label: 'inflection' }], caption: t`$f(t) = t e^{-t}$: up to a peak at $t = \tau$, back down fastest at the inflection point $t = 2\tau$, then creeping towards $0$. An ideal critically damped needle; real gauges are often tuned slightly underdamped, so they overshoot a little.` }),
    steps: [
      { label: 'Ends', text: t`$f(0) = 0$, and as $t \to \infty$ the exponential wins: $f \to 0$. So the graph starts and ends on the axis.` },
      { label: 'First derivative', text: t`Product rule: $f'(t) = e^{-t} - t e^{-t} = (1 - t)\,e^{-t}$. Since $e^{-t} > 0$, the sign is the sign of $1 - t$: positive before $t = 1$, negative after.` },
      { label: 'Peak', text: t`$f'$ changes from $+$ to $-$ at $t = 1$: a maximum, $f(1) = e^{-1} \approx 0.368$. The needle peaks at $t = \tau$.` },
      { label: 'Second derivative', text: t`$f''(t) = -e^{-t} - (1 - t)e^{-t} = (t - 2)\,e^{-t}$: negative before $t = 2$ (concave down), positive after (concave up).` },
      { label: 'Inflection', text: t`$f''$ changes sign at $t = 2$, where $f(2) = 2e^{-2} \approx 0.271$ and $f'(2) = -e^{-2} \approx -0.135$ — the most negative slope: the needle returns fastest at $t = 2\tau$.` },
      { label: 'Sense check', text: t`A peak followed by a slow exponential tail is exactly how a damped instrument settles. The slope just after the kick is $f'(0) = 1$, the steepest on the whole curve.` },
    ],
    answer: t`Peak at $t = \tau$ (height $A/e$); fastest return at the inflection point $t = 2\tau$; concave down before it, concave up after, approaching $0$.`,
  },
  practice: [
    mcq({
      id: 'read-fprime', difficulty: 2,
      prompt: t`The graph shows the **derivative** $f'$ of a function $f$ — not $f$ itself. At which $x$ does $f$ have a local maximum?`,
      visual: fprimeFig('0.5*(x + 2)*(x - 1)*(x - 3)', [-3, 4], [-6, 6], t`The derivative $f'(x)$. It crosses zero three times.`),
      choices: [t`$x = 1$`, t`$x = -2$`, t`$x = 3$`, t`$x \approx -0.8$, where $f'$ is largest`],
      answer: 0,
      why: {
        1: t`At $x = -2$, $f'$ goes from negative to positive: $f$ stops falling and starts rising — a valley.`,
        2: t`At $x = 3$, $f'$ goes from $-$ to $+$ again: another valley.`,
        3: t`Where $f'$ is largest, $f$ is rising most steeply — an inflection point of $f$, not a peak.`,
      },
      hints: [t`A peak of $f$ is where $f$ stops rising and starts falling: $f'$ changes from $+$ to $-$.`, 'Look for a zero of the green curve where it passes from above the axis to below.'],
      teach: t`First-derivative test: $f'$ changing from $+$ to $-$ marks a local maximum of $f$; from $-$ to $+$, a local minimum.`,
      explain: t`$f'$ is positive on $(-2, 1)$ and negative on $(1, 3)$, so $f$ rises up to $x = 1$ and then falls: a local maximum at $x = 1$.`,
    }),
    num({
      id: 'inflect-cubic', difficulty: 2,
      gen(r) {
        const b = r.pick([-9, -6, -3, 3, 6, 9]), c = r.int(-4, 4), x0 = -b / 3;
        const f = (x) => x ** 3 + b * x * x + c * x;
        const ft = t`x^3 ${b < 0 ? '-' : '+'} ${Math.abs(b)}x^2 ${c < 0 ? '-' : '+'} ${Math.abs(c) === 1 ? '' : Math.abs(c)}x`;
        return {
          prompt: t`At what $x$ does $f(x) = ${c === 0 ? t`x^3 ${b < 0 ? '-' : '+'} ${Math.abs(b)}x^2` : ft}$ have its inflection point?`,
          answer: x0, tol: { rel: 0, abs: 0.01 },
          errors: [{ value: -b / 6, feedback: t`$f''(x) = 6x + ${2 * b}$: solve $6x = ${-2 * b}$.` }],
          hints: [t`Differentiate twice: $f''(x) = 6x ${b < 0 ? '-' : '+'} ${Math.abs(2 * b)}$.`, t`Solve $f''(x) = 0$; it changes sign there because $f''$ is a line with nonzero slope.`],
          teach: t`Every cubic has exactly one inflection point, where its linear second derivative crosses zero.`,
          explain: t`$f''(x) = 6x ${b < 0 ? '-' : '+'} ${Math.abs(2 * b)} = 0$ at $x = ${nice(x0)}$, and $f''$ changes sign there: concave down to the left, concave up to the right.`,
          visual: curveFig({ fn: `x^3 + ${b}*x^2 + ${c}*x`, x: [x0 - 4, x0 + 4], y: fitY(f, x0 - 3.6, x0 + 3.6), caption: t`$y = f(x)$. Find where the bending changes direction.` }),
        };
      },
    }),
    num({
      id: 'local-max-value', difficulty: 2,
      gen(r) {
        const k = r.int(1, 3), d = r.int(-3, 3), fx = (x) => x ** 3 - 3 * k * k * x + d, ans = 2 * k ** 3 + d;
        return {
          prompt: t`Find the local **maximum value** of $f(x) = x^3 - ${3 * k * k}x${d === 0 ? '' : d < 0 ? ` - ${-d}` : ` + ${d}`}$.`,
          answer: ans, tol: { rel: 0, abs: 0.01 },
          errors: [{ value: -2 * k ** 3 + d, feedback: t`That is the value at $x = ${k}$, where $f'$ goes from $-$ to $+$: the local minimum.` }, ...(ans === -k ? [] : [{ value: -k, feedback: 'That is where the maximum is. The question asks for its value, f(x) there.' }])],
          hints: [t`$f'(x) = 3x^2 - ${3 * k * k} = 0$ at $x = \pm ${k}$.`, t`$f'' = 6x$ is negative at $x = -${k}$: that is the maximum. Evaluate $f(-${k})$.`],
          teach: 'Find the critical points, classify them (sign change of f′, or the sign of f″), then evaluate f at the maximum.',
          explain: t`Critical points $x = \pm${k}$; $f''(-${k}) = -${6 * k} < 0$, so $x = -${k}$ is the maximum: $f(-${k}) = -${k ** 3} + ${3 * k ** 3}${d === 0 ? '' : d < 0 ? ` - ${-d}` : ` + ${d}`} = ${ans}$.`,
          visual: curveFig({ fn: `x^3 - ${3 * k * k}*x + ${d}`, x: [-2.2 * k, 2.2 * k], y: fitY(fx, -2 * k, 2 * k), caption: t`$y = f(x)$ with its hump and its dip.` }),
        };
      },
    }),
    mcq({
      id: 'x4-not-inflect', difficulty: 2,
      prompt: t`For $f(x) = x^4$, $f''(0) = 0$. Is $(0, 0)$ an inflection point?`,
      visual: curveFig({ fn: 'x^4', x: [-1.6, 1.6], y: [-0.4, 3], curves: [{ fn: '12*x^2', color: 'warn', dash: true, width: 1.6, label: 'f″ = 12x²', labelAt: 0.42, labelDx: 6 }], caption: t`$y = x^4$ (blue) and its second derivative $12x^2$ (amber), which touches zero at $x = 0$ but never goes below it.` }),
      choices: [
        t`No: $f''$ does not change sign at $0$ — the curve is concave up on both sides`,
        t`Yes: $f''(0) = 0$ is the definition of an inflection point`,
        t`Yes: the curve is flattest there`,
        t`No: $f'(0) = 0$, and inflection points can never have a horizontal tangent`,
      ],
      answer: 0,
      why: {
        1: t`$f'' = 0$ only makes $x = 0$ a *candidate*. An inflection needs the concavity to change, and $12x^2 \ge 0$ on both sides.`,
        2: 'Flat is about f′, not f″. The bottom of a valley is flat, and it is no inflection point.',
        3: t`$x^3$ has a horizontal tangent at its inflection point $0$. A flat tangent does not rule it out.`,
      },
      hints: [t`An inflection point needs $f''$ to change sign. What sign does $12x^2$ have just left and just right of $0$?`, 'Look at the amber curve: does it cross the axis or only touch it?'],
      teach: t`$f''(c) = 0$ is not enough: an inflection point needs $f''$ to change sign at $c$.`,
      explain: t`$f''(x) = 12x^2$ is positive on both sides of $0$, so $x^4$ is concave up everywhere — the origin is a minimum, not an inflection point.`,
    }),
    match({
      id: 'match-shapes', difficulty: 2,
      prompt: 'Match each arc of the graph to the signs of its first and second derivatives.',
      visual: {
        type: 'graph',
        params: {
          x: [-0.3, 8.5], y: [-0.2, 2.7], aspect: 'wide', yticks: 0, ylabel: '',
          curves: [
            { fn: '0.6*x^2 + 0.2', color: 'accent', domain: [0, 1.6], label: '1', labelAt: 0.8, labelDx: -16, labelDy: -14 },
            { fn: '2.2 - 0.6*(3.8 - x)^2', color: 'accent', domain: [2.2, 3.8], label: '2', labelAt: 2.9, labelDx: -14, labelDy: -14 },
            { fn: '0.6*(6 - x)^2 + 0.2', color: 'accent', domain: [4.4, 6], label: '3', labelAt: 5.2, labelDx: 4, labelDy: -14 },
            { fn: '2.2 - 0.6*(x - 6.6)^2', color: 'accent', domain: [6.6, 8.2], label: '4', labelAt: 7.4, labelDx: 4, labelDy: -14 },
          ],
        },
        caption: 'Four separate arcs, each read from left to right.',
      },
      left: ['Arc 1', 'Arc 2', 'Arc 3', 'Arc 4'],
      right: ['f′ > 0 and f″ > 0', 'f′ > 0 and f″ < 0', 'f′ < 0 and f″ > 0', 'f′ < 0 and f″ < 0'],
      answer: [0, 1, 2, 3],
      hints: ['Rising means f′ > 0. Then ask: is the slope getting steeper (f″ > 0) or flatter (f″ < 0) as you move right?', 'Concave up holds water like a cup; concave down sheds it like a dome.'],
      teach: 'f′ is the direction, f″ the bending: concave up means the slope is increasing, whether the curve is rising or falling.',
      explain: 'Arc 1 rises ever more steeply (f′ > 0, f″ > 0). Arc 2 rises but levels off (f′ > 0, f″ < 0). Arc 3 falls but levels off — its slope is increasing towards 0 (f′ < 0, f″ > 0). Arc 4 falls ever more steeply (f′ < 0, f″ < 0).',
    }),
    num({
      id: 'gauss-width', difficulty: 3,
      gen(r) {
        const s = r.pick([0.8, 1.2, 1.5, 2]), c = 2 * s * s;
        return {
          prompt: t`A laser beam’s intensity across its width is $I(x) = I_0\,e^{-x^2/${nice(c)}}$, with $x$ in mm and $I_0$ the peak intensity. At what $x > 0$ does the intensity fall off most steeply — the inflection point of the profile? Give mm.`,
          answer: s, units: 'mm', tol: { rel: 0.005 },
          errors: [{ value: Math.sqrt(c), feedback: t`Check $f''$: the inflection is where $\dfrac{2x^2}{${nice(c)}} = 1$, so $x^2 = ${nice(c)}/2$.` }, { value: c / 2, feedback: t`That is $x^2$. Take the square root.` }],
          hints: [t`With $k = 1/${nice(c)}$: $I' = -2kx\,I$, and $I'' = (4k^2x^2 - 2k)\,I$.`, t`$I'' = 0$ where $4k^2x^2 = 2k$, i.e. $x^2 = \dfrac{1}{2k} = \dfrac{${nice(c)}}{2}$.`],
          teach: t`A Gaussian $e^{-x^2/(2\sigma^2)}$ has its inflection points at $x = \pm\sigma$ — which is why $\sigma$ is called its width.`,
          explain: t`$I''$ has the sign of $\dfrac{4x^2}{${nice(c)}^2} - \dfrac{2}{${nice(c)}}$, which changes sign at $x^2 = ${nice(c / 2)}$: $x = ${nice(s)}$ mm. Writing the exponent as $x^2/(2\sigma^2)$ shows $\sigma = ${nice(s)}$ mm — the inflection point **is** the standard width.`,
          visual: curveFig({ fn: `e^(-x^2/${c})`, x: [-3.2 * s, 3.2 * s], y: [-0.08, 1.15], xlabel: 'x (mm)', ylabel: 'I / I₀', caption: 'An ideal Gaussian beam profile (a real beam has some departure from it).' }),
        };
      },
    }),
    mcq({
      id: 'find-error-crit', difficulty: 2, kind: 'error',
      prompt: t`A student writes: “For $f(x) = x^3$, $f'(0) = 0$, so $f$ has a local maximum or minimum at $x = 0$.” What is wrong?`,
      visual: curveFig({ fn: 'x^3', x: [-1.6, 1.6], y: [-2.2, 2.2], at: 0, f: (x) => x ** 3, df: (x) => 3 * x * x, span: 0.8, caption: t`$y = x^3$ and its tangent at the origin: flat, yet the curve keeps rising through it.` }),
      choices: [
        t`$f'$ does not change sign at $0$: the curve rises on both sides, so there is no peak or valley`,
        t`$f'(0)$ is not $0$; it is $3$`,
        t`It is a minimum, because $f(0) = 0$ is the smallest value nearby`,
        t`Critical points are where $f(x) = 0$, not $f'(x) = 0$`,
      ],
      answer: 0,
      why: {
        1: t`$f'(x) = 3x^2$, so $f'(0) = 0$. The flat tangent is real.`,
        2: t`$f(-0.1) = -0.001 < 0 = f(0)$: points to the left are lower.`,
        3: t`Zeros of $f$ are where the graph crosses the axis. Critical points are zeros of $f'$ (or where $f'$ does not exist).`,
      },
      hints: ['A critical point is only a candidate. What does the first-derivative test need?', t`What sign does $f'(x) = 3x^2$ have just left and just right of $0$?`],
      teach: t`$f'(c) = 0$ makes $c$ a candidate; only a sign change of $f'$ makes it a peak or a valley.`,
      explain: t`$f'(x) = 3x^2 \ge 0$ on both sides, so $f$ rises through the origin, pausing with a flat tangent. It is an inflection point, not an extremum.`,
    }),
  ],
  checkpoint: [
    mcq({
      id: 'cp-second-test', difficulty: 2,
      gen(r) {
        const v = r.pick(SECOND), k = v.s === 0 ? 0 : r.int(1, 6) * v.s;
        return {
          prompt: t`$f'(2) = 0$ and $f''(2) = ${k}$. What does the second-derivative test say about $x = 2$?`,
          choices: ['A local maximum', 'A local minimum', 'An inflection point', 'The test cannot decide'],
          answer: v.ans,
          why: v.s < 0 ? {
            1: t`Concave up would be a cup, whose flat point is the bottom. Here $f'' < 0$: a dome.`,
            2: t`An inflection point needs $f''$ to change sign; here $f''(2) \ne 0$, so the concavity is the same on both sides.`,
            3: t`The test decides whenever $f''(c) \ne 0$: its sign gives the answer.`,
          } : v.s > 0 ? {
            0: t`Concave down would be a dome, whose flat point is the top. Here $f'' > 0$: a cup.`,
            2: t`An inflection point needs $f''$ to change sign; here $f''(2) \ne 0$, so the concavity is the same on both sides.`,
            3: t`The test decides whenever $f''(c) \ne 0$: its sign gives the answer.`,
          } : {
            0: t`With $f''(2) = 0$ the test gives no verdict: $-x^4$ has a maximum at $0$ with $f' = f'' = 0$ there, but $x^4$ has a minimum and $x^3$ neither.`,
            1: t`With $f''(2) = 0$ the test gives no verdict: $x^4$ has a minimum at $0$ with $f' = f'' = 0$ there, but $-x^4$ has a maximum and $x^3$ neither.`,
            2: t`$f''(2) = 0$ alone does not make an inflection point — $f''$ must change sign, and you are not told that.`,
          },
          hints: [t`At a flat point, concave up (a cup) is a valley; concave down (a dome) is a peak.`, t`If $f''(c) = 0$, the second-derivative test gives no verdict — use the first-derivative test.`],
          teach: t`Second-derivative test: $f'(c) = 0$ with $f''(c) < 0$ is a maximum, with $f''(c) > 0$ a minimum, and $f''(c) = 0$ decides nothing.`,
          explain: v.s < 0 ? t`$f''(2) = ${k} < 0$: concave down at a flat point — a local maximum.` : v.s > 0 ? t`$f''(2) = ${k} > 0$: concave up at a flat point — a local minimum.` : t`$f''(2) = 0$: the test is silent. The point could be a maximum, a minimum or neither; check the sign of $f'$ on each side.`,
          visual: v.s === 0
            ? curveFig({ fn: '1 + 0.25*(x - 2)^4', x: [0, 4], y: [-0.2, 3.4], points: [{ x: 2, y: 1, color: 'gold' }], curves: [{ fn: '1 + 0.3*(x - 2)^3', color: 'violet', domain: [0.3, 3.7] }], caption: t`Two functions with $f'(2) = f''(2) = 0$: a minimum (blue) and an inflection point (violet). The values alone cannot tell them apart.` })
            : curveFig({ fn: v.fn, x: [0, 4], y: [-0.2, 3.4], points: [{ x: 2, y: v.s > 0 ? 1 : 2, color: 'gold' }], curves: [{ fn: `${v.s > 0 ? 1 : 2}`, color: 'gold', dash: true, width: 1.4, domain: [1.3, 2.7] }], caption: 'One function with these values near x = 2, with its flat tangent there.' }),
        };
      },
    }),
    num({
      id: 'cp-lj', difficulty: 3, transfer: true,
      gen(r) {
        const [gas, s] = r.pick([['neon', 0.275], ['argon', 0.340], ['krypton', 0.365], ['xenon', 0.398]]);
        const rm = 2 ** (1 / 6) * s;
        return {
          prompt: t`Two ${gas} atoms interact through the Lennard-Jones potential $U(r) = 4\varepsilon\left[\left(\dfrac{\sigma}{r}\right)^{12} - \left(\dfrac{\sigma}{r}\right)^{6}\right]$, with $\sigma = ${s.toFixed(3)}$ nm and $\varepsilon$ the depth of the well. At what separation $r$ is $U$ smallest — the equilibrium spacing? Give nm.`,
          answer: rm, units: 'nm', tol: { rel: 0.005 },
          errors: [{ value: s, feedback: t`At $r = \sigma$ the potential is $0$, not a minimum. Set $U'(r) = 0$.` }, { value: 2 * s, feedback: t`Solving $U' = 0$ gives $r^6 = 2\sigma^6$: a sixth root, not a factor of 2.` }],
          hints: [t`$U'(r) = 4\varepsilon\left[-\dfrac{12\sigma^{12}}{r^{13}} + \dfrac{6\sigma^6}{r^7}\right]$.`, t`Setting it to zero: $12\sigma^{12}/r^{13} = 6\sigma^6/r^7$, so $r^6 = 2\sigma^6$.`],
          teach: 'An equilibrium is a critical point of the potential; it is stable when that critical point is a minimum.',
          explain: t`$U' = 0$ gives $r^6 = 2\sigma^6$, so $r = 2^{1/6}\sigma = 1.1225\times${s.toFixed(3)} = ${nice(rm, 4)}$ nm. $U'$ goes from $-$ to $+$ there (the force changes from repulsive to attractive), so it is a minimum: a stable spacing.`,
          visual: curveFig({ fn: `4*((${s}/x)^12 - (${s}/x)^6)`, x: [0.8 * s, 2.6 * s], y: [-1.3, 1.6], xlabel: 'r (nm)', ylabel: 'U / ε', domain: [0.95 * s, 2.6 * s], caption: t`The Lennard-Jones model, with $U$ in units of the well depth $\varepsilon$ and a typical fitted $\sigma$. It is an empirical model; real interatomic potentials differ in detail.` }),
        };
      },
    }),
    mcq({
      id: 'cp-fprime-inflect', difficulty: 3,
      prompt: t`The graph shows $f'(x) = x^3 - 3x$. Where does $f$ have its inflection points?`,
      visual: fprimeFig('x^3 - 3*x', [-2.4, 2.4], [-3.2, 3.2], t`The derivative $f'$, not $f$. It has a hump and a dip.`),
      choices: [t`$x = -1$ and $x = 1$`, t`$x = -\sqrt3,\ 0,\ \sqrt3$`, t`$x = 0$ only`, t`Nowhere: $f'$ is a cubic, and only cubics themselves have inflection points`],
      answer: 0,
      why: {
        1: t`Those are the zeros of $f'$: the peaks and valleys of $f$.`,
        2: t`$x = 0$ is where $f'$ crosses zero — a peak of $f$. The inflection points are where $f'$ peaks or dips.`,
        3: t`$f$ is a quartic here ($\tfrac14x^4 - \tfrac32x^2 + C$), and it has inflection points wherever $f''$ changes sign.`,
      },
      hints: [t`An inflection point of $f$ is where $f''$ changes sign — where the slope $f'$ stops increasing and starts decreasing, or the reverse.`, t`So look for the hump and the dip of $f'$: $f''(x) = 3x^2 - 3 = 0$.`],
      teach: t`Inflection points of $f$ are the local extremes of $f'$: where the slope is steepest or shallowest.`,
      explain: t`$f''(x) = 3x^2 - 3$ changes sign at $x = \pm1$, exactly where the graph of $f'$ has its hump and dip. The zeros of $f'$, $0$ and $\pm\sqrt3$, are the extremes of $f$ instead.`,
    }),
  ],
  sources: [{ label: 'OpenStax Calculus Vol. 1, §4.5 Derivatives and the shape of a graph', url: 'https://openstax.org/books/calculus-volume-1/pages/4-5-derivatives-and-the-shape-of-a-graph' }],
});
