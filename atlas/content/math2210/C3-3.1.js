// Limits and continuity in several variables: a limit at a point of the
// plane has to agree along every path of approach, not just the two sides
// of a number line.
import { lesson, mcq, num } from '../../src/core/content.js';
import { nice } from '../../src/core/format.js';
import { surf, linePaths, polarGrid, r6 } from './_partials.js';

const t = String.raw;

// the graph of a function along a few paths, plotted against x (the path's
// own x-coordinate): constant curves for functions that depend only on direction
function alongPaths(curves, { x = [-2, 2], y, points = [], caption }) {
  return {
    type: 'graph',
    params: {
      x, y, aspect: 'wide', xlabel: 'x along the path', ylabel: 'f',
      curves: curves.map((c) => ({ width: 2.4, labelDx: 6, labelDy: -12, ...c })),
      points,
    },
    caption,
  };
}

// f = x²y/(x⁴ + y²): zero along every line through the origin, ½ along y = x²
const RIDGE = (x, y) => `${x}^2*${y}/(${x}^4 + ${y}^2)`;

export default lesson({
  id: 'math2210.C3-3.1',
  title: 'Limits and continuity in several variables',
  minutes: 9, difficulty: 2,
  intro: t`On a number line, $x$ can approach $a$ from only two sides. In the plane, $(x, y)$ can approach a point $(a, b)$ along infinitely many paths — lines, parabolas, spirals — and a limit exists only if **every path leads to the same value**:

$$\lim_{(x,y)\to(a,b)} f(x,y) = L$$

means $f(x, y)$ stays as close to $L$ as you like whenever $(x, y) \ne (a, b)$ is close enough to $(a, b)$, from any direction. Temperatures, potentials and force directions are functions of several variables, and whether they have a limit at a point decides whether they have a sensible value there at all.`,
  symbols: [
    { tex: 'f(x,y)', text: 'a function of two variables: a height, a temperature, a potential — in whatever units it carries' },
    { tex: '(a,b)', text: 'the point being approached; $f$ need not even be defined there' },
    { tex: '(x,y)\\to(a,b)', text: 'the distance $\\sqrt{(x-a)^2 + (y-b)^2}$ shrinks to zero, along any path at all' },
    { tex: 'L', text: 'the limit: the single value that $f$ approaches along every path' },
  ],
  why: t`A function is **continuous** at $(a, b)$ when the limit exists and equals $f(a, b)$ — the property that lets you trust a field’s value from measurements nearby, and whose failure at a point (a charge, the pole of a coordinate grid) is always worth a second look.`,
  visual: {
    type: 'surface3d',
    title: 'One surface, a different height in every direction',
    lead: t`This is the graph of $f(x, y) = \dfrac{2xy}{x^2 + y^2}$, which is undefined at the origin. The gold line is a straight path into the origin at angle $\varphi$ to the $x$-axis. Follow it in: what height does $f$ approach?`,
    tasks: [
      t`Start at $\varphi = 0^\circ$: along the $x$-axis, $f$ is $0$ all the way in.`,
      t`Turn to $45^\circ$, then to $135^\circ$: along $y = x$ the height is $1$, along $y = -x$ it is $-1$. Different paths, different limits — so $f$ has no limit at the origin.`,
      'Look at the pale level curves on the floor: every one is a ray through the origin, so every height between −1 and 1 crowds into that one point.',
    ],
    params: {
      z: '2x*y/(x^2 + y^2)', domain: [[-2, 2], [-2, 2]], n: 41, levels: 10, pitch: 1.0, dist: 9.5, alpha: 0.8,
      sliders: [{ key: 'phi', label: t`Direction of approach $\varphi$`, min: 0, max: 180, step: 5, value: 20, unit: '^\\circ', explain: t`The path is the line through the origin at angle $\varphi$: $y = x\tan\varphi$.` }],
      curves: [
        { param: ['t*cos(phi*pi/180)', 't*sin(phi*pi/180)', 'sin(2*phi*pi/180)'], t: [0.06, 2.1], color: 'gold', width: 3 },
        { param: ['t*cos(phi*pi/180)', 't*sin(phi*pi/180)', 'sin(2*phi*pi/180)'], t: [-2.1, -0.06], color: 'gold', width: 3 },
        { param: ['t*cos(phi*pi/180)', 't*sin(phi*pi/180)', '-1.7'], t: [-2.1, 2.1], color: 'gold', width: 1.2 },
      ],
      readouts: [{ label: 'height along this line', expr: 'sin(2*phi*pi/180)', digits: 3 }],
    },
    caption: t`The graph of $f = 2xy/(x^2 + y^2)$, undefined at the origin. The thin gold line on the floor is the path’s shadow; the pale floor lines are level curves of $f$. In polar coordinates $f = \sin 2\theta$. Drag to rotate.`,
  },
  example: {
    prompt: t`Does $\displaystyle\lim_{(x,y)\to(0,0)} \frac{x^2 y}{x^4 + y^2}$ exist?`,
    visual: alongPaths([
      { fn: 'x/(x^2 + 1)', color: 'accent', label: 'along y = x', labelAt: 1.25 },
      { fn: '2x/(x^2 + 4)', color: 'violet', label: 'along y = 2x', labelAt: -1.9, labelDy: 14 },
      { fn: '0.5', color: 'gold', label: 'along y = x²', labelAt: -1.9 },
    ], {
      y: [-0.65, 0.75],
      points: [{ x: 0, y: 0, color: 'accent', r: 4, label: '→ 0', labelDx: 8, labelDy: 12 }, { x: 0, y: 0.5, color: 'gold', r: 4, label: '→ ½', labelDx: 8, labelDy: -12 }],
      caption: t`The value of $f$ along three paths into the origin, plotted against the path’s $x$-coordinate. The dots at $x = 0$ mark what each path approaches; $f$ itself is undefined there.`,
    }),
    steps: [
      { label: 'Try the axes', text: t`Along the $x$-axis ($y = 0$), $f = 0/x^4 = 0$. Along the $y$-axis ($x = 0$), $f = 0/y^2 = 0$. Both say $0$.` },
      { label: 'Try every line', text: t`On $y = mx$: $f = \dfrac{m x^3}{x^4 + m^2 x^2} = \dfrac{m x}{x^2 + m^2} \to 0$ as $x \to 0$, for every slope $m$. So **every straight line** gives $0$.` },
      { label: 'Do not stop there', text: t`Lines are not every path. The $x^4$ next to $y^2$ suggests comparing $y$ with $x^2$: on the parabola $y = x^2$, $f = \dfrac{x^4}{x^4 + x^4} = \dfrac12$ for every $x \ne 0$.` },
      { label: 'Conclude', text: t`Two paths give two different values, $0$ and $\tfrac12$, so the limit **does not exist**.` },
      { label: 'Sense check', text: t`On $y = kx^2$, $f = \dfrac{k}{1 + k^2}$: the graph has a ridge of height $\tfrac12$ along $y = x^2$ and a valley of depth $-\tfrac12$ along $y = -x^2$. Both hug the $x$-axis so tightly near the origin that every straight line slips between them.` },
    ],
    answer: t`No. Every line gives $0$, but the parabola $y = x^2$ gives $\tfrac12$.`,
  },
  practice: [
    num({
      id: 'slit', difficulty: 1,
      gen(r) {
        const a = r.pick([1, 2, -1, 1.5, -0.5]);
        return {
          prompt: t`The function $f(x, y) = \dfrac{x^2 - y^2}{x - y}$ is undefined on the whole line $y = x$. Find $\displaystyle\lim_{(x,y)\to(${a},\,${a})} f(x,y)$.`,
          visual: surf((x, y) => `(${x}^2 - ${y}^2)/(${x} - ${y})`, { domain: [[-2.5, 2.5], [-2.5, 2.5]], n: 40, zscale: 0.5, dist: 10, caption: t`The graph of $f$ (heights halved): a plane with a slit along $y = x$, where $f$ is undefined. Drag to rotate.` }),
          answer: 2 * a, tol: { rel: 1e-6, abs: 1e-9 },
          errors: [{ value: a, feedback: t`Close — but after cancelling, $f = x + y$, which approaches $${a} + ${a}$.` }],
          hints: ['Factor the numerator.', t`For $x \ne y$, $\dfrac{x^2 - y^2}{x - y} = x + y$.`],
          teach: 'A limit never uses the value at the point itself, so cancelling a factor that vanishes only there is allowed.',
          explain: t`Wherever $x \ne y$, $\dfrac{(x - y)(x + y)}{x - y} = x + y$, and $x + y \to ${a} + ${a} = ${nice(2 * a)}$. The limit exists even though $f$ is undefined on the whole line through the point.`,
        };
      },
    }),
    num({
      id: 'along-line', difficulty: 2,
      gen(r) {
        const k = r.pick([2, 3, 4, 5]), m = r.pick([2, 3, -2, -3]);
        const L = (k * m) / (1 + m * m);
        return {
          prompt: t`Let $f(x, y) = \dfrac{${k}xy}{x^2 + y^2}$. What value does $f$ approach as $(x, y) \to (0, 0)$ along the line $y = ${m}x$?`,
          visual: surf((x, y) => `${k}*${x}*${y}/(${x}^2 + ${y}^2)`, { n: 40, zscale: 0.5, dist: 9.5, paths: linePaths(m, 2), caption: t`The graph of $f$ (heights halved), with the path $y = ${m}x$ in gold. Drag to rotate.` }),
          answer: L, tol: { rel: 1e-3 },
          errors: [{ value: (k * m) / (1 + m), feedback: t`Square the slope: on $y = ${m}x$, $x^2 + y^2 = x^2 + ${m * m}x^2 = ${1 + m * m}x^2$.` }],
          hints: [t`Substitute $y = ${m}x$ and cancel the $x^2$.`, t`$f = \dfrac{${k}\cdot ${m}\,x^2}{(1 + ${m * m})\,x^2}$ for $x \ne 0$.`],
          teach: 'Along a path, f becomes a function of one variable, and its limit is an ordinary one-variable limit.',
          explain: t`On $y = ${m}x$: $f = \dfrac{${k}\cdot${m}\,x^2}{x^2 + ${m * m}x^2} = \dfrac{${k * m}}{${1 + m * m}} = ${nice(L)}$ for every $x \ne 0$. Another slope gives another value, so this $f$ has no limit at the origin.`,
        };
      },
    }),
    mcq({
      id: 'two-paths', difficulty: 1,
      prompt: t`As $(x, y) \to (0, 0)$, a function $f$ approaches $0$ along the $x$-axis and $\tfrac12$ along the line $y = x$. What can you conclude about $\displaystyle\lim_{(x,y)\to(0,0)} f(x,y)$?`,
      visual: alongPaths([
        { fn: '0', color: 'accent', label: 'along the x-axis', labelAt: 0.5, labelDy: 14 },
        { fn: '0.5', color: 'gold', label: 'along y = x', labelAt: 0.5 },
      ], { y: [-0.4, 0.8], points: [{ x: 0, y: 0, color: 'accent', r: 4 }, { x: 0, y: 0.5, color: 'gold', r: 4 }], caption: t`The value of $f$ along the two paths, plotted against the path’s $x$-coordinate. The dots mark the values each path approaches.` }),
      choices: ['It does not exist', t`It is $0$, the value along the axis`, t`It is $\tfrac14$, the average of the two`, 'Nothing yet: more paths must be checked before deciding'],
      answer: 0,
      why: {
        1: 'No path is special. A limit must be the same along every path, the axes included.',
        2: 'Limits are never averaged: two different values along two paths already rule out a single limit.',
        3: 'More paths can never rescue a limit that two paths disagree on. Checking more paths matters only when all the paths tried so far agree.',
      },
      hints: ['If the limit were L, what would f approach along each of these paths?'],
      teach: 'Two paths with different limits prove that a limit in several variables does not exist.',
      explain: t`If the limit were $L$, every path would approach $L$ — so $0 = L = \tfrac12$, which is impossible. One disagreement is proof enough; this is the standard way to show a limit does not exist.`,
    }),
    num({
      id: 'parabola', difficulty: 2,
      gen(r) {
        const k = r.pick([2, 3, 4, -2, -3]);
        const L = k / (1 + k * k), reach = r6(Math.sqrt(1.15 / Math.abs(k)));
        return {
          prompt: t`For $f(x, y) = \dfrac{x^2 y}{x^4 + y^2}$, what value does $f$ approach as $(x, y) \to (0, 0)$ along the parabola $y = ${k}x^2$?`,
          visual: surf(RIDGE, { domain: [[-1.2, 1.2], [-1.2, 1.2]], n: 48, zscale: 1.6, dist: 6.5, pitch: 0.6, paths: [{ x: 't', y: `${k}*t^2`, t: [-reach, -0.02] }, { x: 't', y: `${k}*t^2`, t: [0.02, reach] }], caption: t`The graph of $f$ (heights scaled by 1.6) with the parabola $y = ${k}x^2$ in gold. Drag to rotate.` }),
          answer: L, tol: { rel: 1e-3 },
          errors: [
            { value: 0, feedback: t`That is the limit along every straight line, not along this parabola: substitute $y = ${k}x^2$.` },
            { value: k / (1 + k), feedback: t`Square the coefficient: $y^2 = ${k * k}x^4$.` },
          ],
          hints: [t`Substitute $y = ${k}x^2$: every term then carries $x^4$.`, t`$f = \dfrac{${k}x^4}{x^4 + ${k * k}x^4}$ for $x \ne 0$.`],
          teach: 'When the powers in a limit pair y with x², test parabolas y = kx², not just lines.',
          explain: t`On $y = ${k}x^2$: $f = \dfrac{x^2\cdot ${k}x^2}{x^4 + ${k * k}x^4} = \dfrac{${k}}{${1 + k * k}} = ${nice(L)}$. Lines all give $0$, so $f$ has no limit at the origin.`,
        };
      },
    }),
    mcq({
      id: 'squeeze', difficulty: 2,
      prompt: t`In polar coordinates, $\dfrac{x^3}{x^2 + y^2} = \dfrac{r^3\cos^3\theta}{r^2} = r\cos^3\theta$. What is $\displaystyle\lim_{(x,y)\to(0,0)} \frac{x^3}{x^2 + y^2}$?`,
      visual: surf((x, y) => `${x}^3/(${x}^2 + ${y}^2)`, { n: 40, dist: 9, caption: t`The graph of $x^3/(x^2 + y^2)$, which is undefined at the origin. Drag to rotate.` }),
      choices: ['0', t`It does not exist: the value depends on $\theta$`, t`$\cos^3\theta$`, '1'],
      answer: 0,
      why: {
        1: t`The direction does still appear, but multiplied by $r$: $|r\cos^3\theta| \le r$, which goes to $0$ whatever $\theta$ does.`,
        2: t`A limit is one number, not a function of direction. $\cos^3\theta$ is what is left if the factor $r$ is dropped by mistake.`,
        3: t`Nothing here approaches $1$: the function is never bigger than $r$ in size.`,
      },
      hints: [t`$|\cos\theta| \le 1$ for every $\theta$.`, t`So $|r\cos^3\theta| \le r$. What does $r$ do as $(x, y) \to (0, 0)$?`],
      teach: 'If |f − L| is at most a function of r alone that tends to 0, the limit is L, whatever the path.',
      explain: t`$\left|\dfrac{x^3}{x^2 + y^2} - 0\right| = r\,|\cos\theta|^3 \le r \to 0$. The bound uses only the distance $r$, so it holds along **every** path at once: the limit is $0$.`,
    }),
    num({
      id: 'fill-hole', difficulty: 2,
      gen(r) {
        const k = r.pick([2, 3, 4, 5, 6]);
        return {
          prompt: t`Away from the origin, $f(x, y) = \dfrac{\sqrt{1 + ${k}(x^2 + y^2)} - 1}{x^2 + y^2}$. What value should $f(0, 0)$ be given to make $f$ continuous there?`,
          visual: surf((x, y) => `(sqrt(1 + ${k}*(${x}^2 + ${y}^2)) - 1)/(${x}^2 + ${y}^2)`, { n: 40, zscale: 0.8, dist: 9, caption: t`The graph of $f$ (heights scaled by 0.8): smooth everywhere except for the missing point at the origin. Drag to rotate.` }),
          answer: k / 2, tol: { rel: 1e-3 },
          errors: [{ value: k, feedback: t`Close: rationalise properly. $\sqrt{1 + ${k}u} - 1 \approx \tfrac{${k}}{2}u$ for small $u$, not $${k}u$.` }, { value: 0, feedback: t`The numerator goes to $0$ — but so does the denominator. Simplify before taking the limit.` }],
          hints: [t`$f$ depends on $x$ and $y$ only through $u = x^2 + y^2$, so this is a one-variable limit as $u \to 0^+$.`, t`Multiply top and bottom by $\sqrt{1 + ${k}u} + 1$: the top becomes $${k}u$.`],
          teach: 'A function of x² + y² alone has a limit at the origin that is a one-variable limit in u = x² + y².',
          explain: t`With $u = x^2 + y^2$: $\dfrac{\sqrt{1 + ${k}u} - 1}{u} = \dfrac{${k}u}{u(\sqrt{1 + ${k}u} + 1)} = \dfrac{${k}}{\sqrt{1 + ${k}u} + 1} \to \dfrac{${k}}{2}$. Defining $f(0, 0) = ${nice(k / 2)}$ makes $f$ continuous.`,
        };
      },
    }),
    mcq({
      id: 'error-lines', difficulty: 3, kind: 'error',
      prompt: t`A student wants $\displaystyle\lim_{(x,y)\to(0,0)} \frac{x y^2}{x^2 + y^4}$ and writes: “On $y = mx$, $f = \dfrac{m^2 x}{1 + m^4 x^2} \to 0$ for every $m$; on the $y$-axis, $f = 0$. So the limit is $0$.” What is wrong?`,
      visual: surf((x, y) => `${x}*${y}^2/(${x}^2 + ${y}^4)`, { domain: [[-1.2, 1.2], [-1.2, 1.2]], n: 48, zscale: 1.6, dist: 6.5, pitch: 0.6, caption: t`The graph of $xy^2/(x^2 + y^4)$ near the origin (heights scaled by 1.6). Drag to rotate.` }),
      choices: [
        t`Straight lines are not every path: on $x = y^2$, $f = \tfrac12$`,
        t`The algebra is wrong: on $y = mx$ the limit is $m^2$`,
        t`The $y$-axis gives a different value from the lines, so the limit fails there`,
        'Nothing: checking every line through the origin proves the limit is 0',
      ],
      answer: 0,
      why: {
        1: t`Their algebra is right: $\dfrac{m^2x^3}{x^2 + m^4x^4} = \dfrac{m^2 x}{1 + m^4x^2}$, which tends to $0$.`,
        2: t`On the $y$-axis $x = 0$, so $f = 0$ — the same value the lines give.`,
        3: t`Lines are a tiny family of paths. A limit needs **every** path to agree, and a curved path can disagree with all of them.`,
      },
      hints: ['Is a straight line the only way to reach the origin?', t`The $y^4$ next to $x^2$ suggests comparing $x$ with $y^2$. Try the path $x = y^2$.`],
      teach: 'Agreement along every straight line does not prove a limit exists; a single curved path can disagree.',
      explain: t`On $x = y^2$: $f = \dfrac{y^2\cdot y^2}{y^4 + y^4} = \dfrac12$ for every $y \ne 0$. Lines give $0$, this parabola gives $\tfrac12$, so there is no limit. The graph’s ridge runs along $x = y^2$, too close to the $y$-axis for any line to follow.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-line', difficulty: 2,
      gen(r) {
        const a = r.pick([1, 2, 3]), b = r.pick([5, 6, 7]), m = r.pick([1, 2, 3]);
        const L = (a + b * m * m) / (1 + m * m);
        return {
          prompt: t`Let $f(x, y) = \dfrac{${a}x^2 + ${b}y^2}{x^2 + y^2}$. What value does $f$ approach as $(x, y) \to (0, 0)$ along the line $y = ${m}x$?`,
          visual: surf((x, y) => `(${a}*${x}^2 + ${b}*${y}^2)/(${x}^2 + ${y}^2)`, { n: 40, zscale: 0.35, dist: 9.5, paths: linePaths(m, 2).map((p) => ({ ...p, color: 'gold' })), caption: t`The graph of $f$ (heights scaled by 0.35), with the path $y = ${m}x$ in gold. Drag to rotate.` }),
          answer: L, tol: { rel: 1e-3 },
          hints: [t`Substitute $y = ${m}x$ and cancel $x^2$.`],
          teach: 'On a line y = mx, a ratio of quadratics becomes a constant that depends on m.',
          explain: t`$f = \dfrac{${a}x^2 + ${b * m * m}x^2}{x^2 + ${m * m}x^2} = \dfrac{${a + b * m * m}}{${1 + m * m}} = ${nice(L)}$. Since different slopes give different values, the limit at the origin does not exist.`,
        };
      },
    }),
    mcq({
      id: 'cp-which', difficulty: 2,
      prompt: t`Which of these functions has a limit as $(x, y) \to (0, 0)$?`,
      visual: { type: 'graph', params: { x: [-2.4, 2.4], y: [-1.6, 1.6], equal: true, aspect: 'wide', curves: polarGrid({ rings: [0.4, 0.8, 1.2], rays: 8, reach: 1.5, color: 'ink3' }), points: [{ x: 0, y: 0, color: 'gold', r: 4, label: 'origin', labelDx: 8, labelDy: 12 }] }, caption: t`In polar coordinates, approaching the origin means $r \to 0$ while the direction $\theta$ does anything it likes. A limit exists when what is left depends on $r$ alone and settles down.` },
      choices: [t`$\dfrac{x^2 y}{x^2 + y^2}$`, t`$\dfrac{xy}{x^2 + y^2}$`, t`$\dfrac{x^2 - y^2}{x^2 + y^2}$`, t`$\dfrac{x}{\sqrt{x^2 + y^2}}$`],
      answer: 0,
      why: {
        1: t`In polar form this is $\cos\theta\sin\theta$: it depends on direction only, and every value in $[-\tfrac12, \tfrac12]$ is approached.`,
        2: t`In polar form this is $\cos 2\theta$: $1$ along the $x$-axis, $-1$ along the $y$-axis.`,
        3: t`In polar form this is $\cos\theta$: $1$ approaching from the right, $-1$ from the left.`,
      },
      hints: [t`Rewrite each one with $x = r\cos\theta$, $y = r\sin\theta$.`],
      teach: 'Converting to polar coordinates shows whether a limit at the origin survives the direction θ or is squeezed by a power of r.',
      explain: t`$\dfrac{x^2 y}{x^2 + y^2} = r\cos^2\theta\sin\theta$, and $|r\cos^2\theta\sin\theta| \le r \to 0$, so its limit is $0$. The other three reduce to functions of $\theta$ alone, which take different values in different directions.`,
    }),
    mcq({
      id: 'cp-vor', difficulty: 3, transfer: true,
      prompt: t`A VOR navigation beacon tells an aircraft which **radial** it is on: the compass bearing $\theta(x, y)$ of the aircraft’s ground position $(x, y)$, as seen from the station at the origin. Does $\theta(x, y)$ have a limit as $(x, y)$ approaches the station?`,
      visual: {
        type: 'graph',
        params: {
          x: [-3.2, 3.2], y: [-2.2, 2.2], equal: true, aspect: 'wide', axes: false, grid: false, xlabel: '', ylabel: '',
          curves: Array.from({ length: 12 }, (_, j) => { const b = (j * 30 * Math.PI) / 180; return { param: [`t*${r6(Math.sin(b))}`, `t*${r6(Math.cos(b))}`], t: [0.15, 2.05], color: 'ink3', width: 1 }; }),
          points: [
            { x: 0, y: 0, color: 'gold', r: 5, label: 'station', labelDx: 10, labelDy: 14 },
            { x: 0, y: 2.05, r: 0.01, color: 'ink2', label: '360°', labelDx: -12, labelDy: -10 },
            { x: 2.05, y: 0, r: 0.01, color: 'ink2', label: '090°', labelDx: 6, labelDy: 0 },
            { x: 0, y: -2.05, r: 0.01, color: 'ink2', label: '180°', labelDx: -12, labelDy: 10 },
            { x: -2.05, y: 0, r: 0.01, color: 'ink2', label: '270°', labelDx: -34, labelDy: 0 },
          ],
          arrows: [{ from: [-2.6, -1.3], to: [1.2, 0.6], color: 'accent', label: 'aircraft track', labelDx: 8, labelDy: -10 }],
        },
        caption: 'Seen from above, north up: every grey line is a radial, labelled by its bearing from the station. Not to scale.',
      },
      choices: [
        t`No: along each radial $\theta$ is constant, and the radials approaching the station carry every bearing from $0^\circ$ to $360^\circ$`,
        t`Yes: $0^\circ$, because bearings are measured from north`,
        t`Yes: the bearing of the radial the aircraft is flying along as it arrives`,
        t`Yes, provided the aircraft flies at constant altitude`,
      ],
      answer: 0,
      why: {
        1: t`North is only where the bearings are counted from. An aircraft coming in on the $090^\circ$ radial sees $\theta = 90^\circ$ all the way in.`,
        2: t`That is a limit along one path. A limit at the point must be the same for every path, and other aircraft arrive on other radials.`,
        3: t`Altitude does not enter: $\theta$ depends only on the direction of $(x, y)$ from the station.`,
      },
      hints: [t`Along a single radial, what is $\theta$ doing?`, 'Different radials all lead to the same point. Do they lead to the same value?'],
      teach: 'An angle coordinate has no limit at the centre of its own grid: every direction carries a different constant value.',
      explain: t`$\theta$ is constant on each radial, so its limit along a radial is that radial’s bearing — a different number for each. No single limit exists, and no value at the station could make $\theta$ continuous. Pilots know the region overhead as the **cone of confusion**: the needle swings and the TO/FROM flag flips as the station passes beneath (the antenna pattern adds to it). The polar angle $\theta$ fails the same way at $r = 0$ — a defect of the coordinates, not of the place.`,
    }),
  ],
  sources: [{ label: 'OpenStax Calculus Vol. 3, §4.2 Limits and continuity', url: 'https://openstax.org/books/calculus-volume-3/pages/4-2-limits-and-continuity' }],
});
