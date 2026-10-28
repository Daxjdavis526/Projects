// Functions of several variables and their graphs — a number for every point
// of a region, the graph as a landscape, domains set by algebra and by
// physics, and traces: the one-variable graphs hidden inside a surface.
import { lesson, mcq, num, expr } from '../../src/core/content.js';
import { nice, fmt, polyTeX, polyText } from '../../src/core/format.js';
import { graphOf, boxGraph, pickExpr, sterm } from './_space.js';

const t = String.raw;

// the Explore's five surfaces, as templates (x, y) => expression
const SURF = [
  (x, y) => `(${x}^2 + ${y}^2)/3`,
  (x, y) => `(${x}^2 - ${y}^2)/2`,
  (x, y) => `2.2*exp(-(${x}^2 + ${y}^2))`,
  (x, y) => `-1/sqrt(${x}^2 + ${y}^2 + 0.12)`,
  (x, y) => `0.8*sin(2*${x})`,
];
const F = (x, y) => pickExpr('q', SURF.map((s) => s(x, y)));

// the rocket equation Δv = vₑ ln R (km/s), on a box vₑ ∈ [0, 4.5], R ∈ [1, 10]
const ROCKET = (ve, R) => `${ve}*ln(${R})`;
const rocketPicture = (caption) => boxGraph(ROCKET, [0, 4.5], [1, 10], {
  zmax: 4.5 * Math.log(10), traces: [{ y: 6 }, { x: 3.4 }], labels: ['vₑ', 'R', 'Δv'], caption,
});

// largest |f| over the square [−2, 2]², to pick a height scale that fits
const maxAbs = (f, L = 2) => {
  let m = 0;
  for (let i = 0; i <= 40; i++) for (let j = 0; j <= 40; j++) m = Math.max(m, Math.abs(f(-L + (2 * L * i) / 40, -L + (2 * L * j) / 40)));
  return m;
};
const fit = (f, L = 2, top = 2.4) => +(top / maxAbs(f, L)).toPrecision(2);

// the four saddles of the “which graph” problem: TeX, template, and how it looks along the axes and diagonals
const SADDLES = [
  { tex: t`z = x^2 - y^2`, f: (x, y) => `(${x}^2 - ${y}^2)/2`, look: t`rises along the $x$-axis, falls along the $y$-axis, and is flat along the diagonals $y = \pm x$` },
  { tex: t`z = y^2 - x^2`, f: (x, y) => `(${y}^2 - ${x}^2)/2`, look: t`falls along the $x$-axis, rises along the $y$-axis, and is flat along the diagonals $y = \pm x$` },
  { tex: t`z = xy`, f: (x, y) => `${x}*${y}/2`, look: t`is flat along both axes, rises along $y = x$ and falls along $y = -x$` },
  { tex: t`z = -xy`, f: (x, y) => `-${x}*${y}/2`, look: t`is flat along both axes, falls along $y = x$ and rises along $y = -x$` },
];

// US Standard Atmosphere 1976: density (kg/m³) at geometric altitude (km)
const RHO = { 9: 0.4671, 10: 0.4135, 11: 0.3648, 12: 0.3119, 13: 0.2666 };

export default lesson({
  id: 'math2210.C3-0.1',
  title: 'Functions of several variables and their graphs',
  minutes: 10, difficulty: 2,
  intro: t`A **function of two variables** assigns one number to each point of a region of the plane:

$$z = f(x, y), \qquad (x, y) \in D$$

The region $D$ is the **domain**, and the set of values the function produces is its **range**. The **graph** is the surface of points $(x, y, f(x, y))$: a landscape whose height above each point is the function’s value there. Slice the landscape with a vertical plane $y = b$ or $x = a$ and the cut is a **trace**, an ordinary one-variable graph. Physics is full of such functions: the temperature across a heat shield, the gravitational potential around a planet, the $\Delta v$ a rocket gets from its exhaust speed and mass ratio.`,
  symbols: [
    { tex: 'f', text: 'the rule: exactly one output for each input pair' },
    { tex: '(x, y)', text: 'the two **independent variables**, the inputs — together, a point of the plane' },
    { tex: 'z', text: t`the output, drawn as the height of the graph above the point $(x, y)$; its units are whatever $f$ measures (kelvin, joules per kilogram, km/s)` },
    { tex: 'D', text: 'the **domain**: every input point where the formula makes sense — mathematically (no square roots of negatives, no division by zero) and physically' },
    { tex: '\\{(x, y, f(x, y))\\}', text: 'the **graph**: a surface in space, one height for each point of the domain' },
  ],
  why: t`Every idea in this course — partial derivatives, gradients, double integrals, potentials, fields — is about functions of several variables, and in general relativity the metric itself is a set of functions of four coordinates.`,
  visual: {
    type: 'surface3d',
    title: 'A surface and its traces',
    lead: t`Pick a surface and drag the picture to turn it. The gold curve is the trace in the plane $y = y_0$, the violet curve the trace in the plane $x = x_0$; they cross at the point above $(x_0, y_0)$, whose height $f(x_0, y_0)$ is the readout.`,
    tasks: [
      t`**Saddle** with $x_0 = y_0 = 0$: the gold trace $z = x^2/2$ opens up, the violet trace $z = -y^2/2$ opens down. One point, two directions, two different bends.`,
      t`**Gravity well**: every trace through the centre plunges; far out the surface is nearly flat, because the potential hardly changes out there.`,
      t`**Wave crests**: $f$ ignores $y$, so every gold trace is the same sine wave and every violet trace is a level line.`,
    ],
    params: {
      domain: [[-2, 2], [-2, 2]],
      z: F('x', 'y'),
      choices: [{ key: 'q', label: 'Surface', options: [[0, 'Bowl'], [1, 'Saddle'], [2, 'Hill'], [3, 'Gravity well'], [4, 'Wave crests']], value: 1, explain: 'Bowl $(x^2 + y^2)/3$, saddle $(x^2 - y^2)/2$, hill $2.2e^{-(x^2 + y^2)}$, well $-1/\\sqrt{x^2 + y^2 + 0.12}$, crests $0.8\\sin 2x$.' }],
      sliders: [
        { key: 'x0', label: '$x_0$', min: -2, max: 2, step: 0.1, value: 0.8, explain: 'Where the violet plane $x = x_0$ cuts the surface.' },
        { key: 'y0', label: '$y_0$', min: -2, max: 2, step: 0.1, value: -0.6, explain: 'Where the gold plane $y = y_0$ cuts the surface.' },
      ],
      curves: [
        { param: ['t', 'y0', F('t', 'y0')], t: [-2, 2], color: 'gold' },
        { param: ['x0', 't', F('x0', 't')], t: [-2, 2], color: 'violet' },
      ],
      readouts: [{ label: '$f(x_0, y_0)$', expr: F('x0', 'y0'), digits: 3 }],
    },
    caption: t`Drag to rotate; scroll or pinch to zoom. Heights are to scale. The well is softened at the centre so it fits: $-1/\sqrt{x^2 + y^2 + 0.12}$ instead of $-1/\sqrt{x^2 + y^2}$, which plunges without limit.`,
  },
  example: {
    prompt: t`The ideal rocket equation gives the change in velocity a rocket stage can produce as a function of two variables,

$$\Delta v = f(v_e, R) = v_e\ln R,$$

where $v_e$ is the exhaust speed and $R = m_0/m_f$ the **mass ratio**: the mass at ignition over the mass at burnout. (a) What is the domain, on physical grounds? (b) Evaluate $f(3.4\ \text{km/s},\ 6)$. (c) Describe the traces $R = 6$ and $v_e = 3.4$ km/s.`,
    visual: rocketPicture(t`The graph of $\Delta v = v_e\ln R$ for $0 \le v_e \le 4.5$ km/s and $1 \le R \le 10$ (axes from the corner $v_e = 0$, $R = 1$; heights shrunk to fit). Gold: the trace $R = 6$. Violet: the trace $v_e = 3.4$ km/s. Drag to rotate.`),
    steps: [
      { label: 'Domain', text: t`Exhaust leaves at some positive speed, so $v_e > 0$. A stage ends lighter than it started, so $R = m_0/m_f \ge 1$; at $R = 1$ nothing has burned and $\Delta v = 0$. The formula would accept $0 < R < 1$ (a negative $\Delta v$), but no rocket gains mass by firing: **the physics, not just the algebra, sets the domain**, $D = \{(v_e, R) : v_e > 0,\ R \ge 1\}$.` },
      { label: 'Evaluate', text: t`$f(3.4,\ 6) = 3.4\ln 6 = 3.4\times1.792 = 6.09$ km/s.` },
      { label: 'Trace at fixed mass ratio', text: t`Hold $R = 6$: $\Delta v = (\ln 6)\,v_e = 1.792\,v_e$, a straight line through the origin (gold). Double the exhaust speed and you double $\Delta v$.` },
      { label: 'Trace at fixed exhaust speed', text: t`Hold $v_e = 3.4$ km/s: $\Delta v = 3.4\ln R$, a logarithm (violet). Each doubling of $R$ adds the same $3.4\ln 2 = 2.36$ km/s, so the curve keeps flattening — the “tyranny of the rocket equation”.` },
      { label: 'Sense check', text: t`Reaching low Earth orbit takes about $9.4$ km/s once gravity and drag losses are counted. A single stage with $v_e = 3.4$ km/s would need $R = e^{9.4/3.4} \approx 16$: about 94% of its lift-off mass would have to be propellant. That is why orbital rockets have stages.` },
    ],
    answer: t`$D$: $v_e > 0$ and $R \ge 1$. $f(3.4, 6) \approx 6.09$ km/s. The trace $R = 6$ is the line $\Delta v = 1.79\,v_e$; the trace $v_e = 3.4$ km/s is the logarithm $\Delta v = 3.4\ln R$.`,
  },
  practice: [
    num({
      id: 'evaluate', difficulty: 1,
      gen(r) {
        let c, a, b, p, q, val;
        do {
          c = r.int(6, 10); a = r.pick([1, 2]); b = r.pick([1, 2, 3]); p = r.intExcept(-2, 2, [0]); q = r.intExcept(-2, 2, [0]);
          val = c - a * p * p - b * q * q;
        } while (val === 0);
        const errors = [{ value: c - a * p - b * q, feedback: 'Square each coordinate before multiplying: the formula has x² and y².' }];
        if (p < 0) errors.push({ value: c + a * p * p - b * q * q, feedback: t`$(${p})^2 = ${p * p}$: the square of a negative number is positive.` });
        const f = (x, y) => `${c} - ${a}*${x}^2 - ${b}*${y}^2`;
        return {
          prompt: t`Let $f(x, y) = ${c}${sterm(-a, 'x^2')}${sterm(-b, 'y^2')}$. Evaluate $f(${p}, ${q})$.`,
          answer: val, tol: { rel: 1e-9, abs: 1e-9 },
          errors: errors.filter((e) => e.value !== val),
          hints: [t`Substitute $x = ${p}$ and $y = ${q}$ into the formula.`],
          teach: 'A function of two variables takes a pair of numbers in and gives one number out: substitute both.',
          explain: t`$f(${p}, ${q}) = ${c} - ${a}(${p})^2 - ${b}(${q})^2 = ${c} - ${a * p * p} - ${b * q * q} = ${val}$: the height of the graph above the point $(${p}, ${q})$.`,
          visual: graphOf(f, { domain: [[-3, 3], [-3, 3]], traces: [{ y: q }, { x: p }], zs: fit((x, y) => c - a * x * x - b * y * y, 3), axisLen: 3.6, dist: 12, caption: t`The graph of $f$ (heights scaled to fit) and its two traces through the point above $(${p}, ${q})$, where they cross. Drag to rotate.` }),
        };
      },
    }),
    num({
      id: 'domain-area', difficulty: 2,
      gen(r) {
        const [A, B] = r.pick([[3, 2], [4, 2], [4, 3], [5, 2], [5, 3], [5, 4]]);
        const C = A * A * B * B, area = Math.PI * A * B, L = Math.max(A, B);
        return {
          prompt: t`What is the area of the domain of $f(x, y) = \sqrt{${C} - ${B * B}x^2 - ${A * A}y^2}$? Give 3 significant figures.`,
          answer: area, tol: { rel: 0.005 },
          errors: [{ value: Math.PI * C, feedback: t`Divide through by ${C} first: the domain is $\frac{x^2}{${A * A}} + \frac{y^2}{${B * B}} \le 1$, an ellipse with semi-axes ${A} and ${B} — not a circle, and not the coefficients.` }],
          hints: [t`The square root needs $${C} - ${B * B}x^2 - ${A * A}y^2 \ge 0$, that is $${B * B}x^2 + ${A * A}y^2 \le ${C}$.`, t`Divide by ${C}: $\frac{x^2}{${A * A}} + \frac{y^2}{${B * B}} \le 1$ is an ellipse with semi-axes ${A} and ${B}; its area is $\pi ab$.`],
          teach: 'The domain of a square root is where the expression under it is not negative — here a whole region of the plane.',
          explain: t`The domain is the filled ellipse $\frac{x^2}{${A * A}} + \frac{y^2}{${B * B}} \le 1$, of area $\pi(${A})(${B}) = ${A * B}\pi \approx ${fmt(area, 4)}$. Above it the graph is a dome; outside it $f$ is undefined.`,
          visual: graphOf((x, y) => `sqrt(${C} - ${B * B}*${x}^2 - ${A * A}*${y}^2)`, { disk: [A, B], zs: +(2 / (A * B)).toPrecision(2), axisLen: L + 1, dist: 2.6 * L + 3, curves: [{ param: [`${A}*cos(t)`, `${B}*sin(t)`, '0'], t: [0, 2 * Math.PI], color: 'gold' }], caption: 'The graph of f, drawn only where f is defined: the dome stands on its domain, whose edge is the gold curve on the floor. Heights shrunk to fit; drag to rotate.' }),
        };
      },
    }),
    (() => {
      const order = [1, 0, 2, 3], S = SADDLES[1];   // the picture shows z = y² − x²
      const why = {};
      order.slice(1).forEach((k, j) => { why[j + 1] = t`$${SADDLES[k].tex}$ ${SADDLES[k].look}. The surface in the picture ${S.look}.`; });
      return mcq({
        id: 'which-graph', difficulty: 2,
        prompt: 'Which function has this graph? Use the two traces drawn on it, and turn the picture.',
        choices: order.map((k) => t`$${SADDLES[k].tex}$`), answer: 0, why,
        hints: [t`Read the gold trace (above the $x$-axis, $y = 0$) and the violet trace (above the $y$-axis, $x = 0$): does each rise, fall or stay flat?`, t`On the $x$-axis, $x^2 - y^2$ becomes $x^2$, $y^2 - x^2$ becomes $-x^2$, and both $\pm xy$ become $0$.`],
        teach: 'Identify a surface by its traces: set y = 0 and x = 0 and see which one-variable graphs are left.',
        explain: t`The surface ${S.look}: that is $${S.tex}$, the familiar saddle $x^2 - y^2$ turned through $90^\circ$. Along the $x$-axis its trace is $z = f(x, 0) = -x^2$, along the $y$-axis $z = f(0, y) = y^2$ — ordinary graphs you can read.`,
        visual: graphOf(S.f, { traces: [{ y: 0 }, { x: 0 }], caption: 'Gold: the trace above the x-axis (y = 0). Violet: the trace above the y-axis (x = 0). Heights halved; drag to rotate.' }),
      });
    })(),
    expr({
      id: 'trace', difficulty: 2,
      gen(r) {
        const a = r.pick([1, 2]), c = r.pick([-3, -2, -1, 1, 2, 3]), b = r.pick([-2, -1, 1, 2]);
        const coefs = [-b * b, c * b, a];
        const f = (x, y) => `${a}*${x}^2 + ${c}*${x}*${y} - ${y}^2`;
        const errors = [{ answer: polyText([a * b * b, c * b, -1]), feedback: t`That is the trace in the plane $x = ${b}$, with $x$ renamed: here $y$ is the variable you fix.` }];
        if (b !== 1) errors.push({ answer: polyText([-b, c * b, a]), feedback: t`At $y = ${b}$, the term $-y^2$ is $-(${b})^2 = ${-b * b}$.` });
        return {
          prompt: t`Find the trace of the graph of $f(x, y) = ${a === 1 ? '' : a}x^2${sterm(c, 'xy')} - y^2$ in the plane $y = ${b}$: write $z$ as a function of $x$.`,
          answer: polyText(coefs), answerTeX: polyTeX(coefs), lhs: 'z',
          vars: { x: [-3, 3] }, errors,
          hints: [t`Every point of the plane $y = ${b}$ has $y = ${b}$: substitute it.`, t`$z = ${a}x^2 + (${c})x(${b}) - (${b})^2$.`],
          teach: 'A trace fixes one variable; what is left is an ordinary function of the other.',
          explain: t`Setting $y = ${b}$ gives $z = ${polyTeX(coefs)}$: the gold curve, a parabola lying in the plane $y = ${b}$.`,
          visual: graphOf(f, { traces: [{ y: b }], zs: fit((x, y) => a * x * x + c * x * y - y * y), caption: t`The graph of $f$ (heights scaled to fit) and, in gold, its trace in the plane $y = ${b}$. Drag to rotate.` }),
        };
      },
    }),
    mcq({
      id: 'revolution', difficulty: 2,
      prompt: t`In the plane of a planet’s equator, the gravitational potential is $\Phi(x, y) = -\dfrac{GM}{\sqrt{x^2 + y^2}}$. Its graph looks the same in every direction from the centre. Why?`,
      choices: [
        t`$\Phi$ depends on $x$ and $y$ only through the distance $\sqrt{x^2 + y^2}$, so every point on a circle about the centre has the same height`,
        t`$\Phi$ is negative everywhere`,
        t`$x$ and $y$ enter symmetrically, and any function that treats $x$ and $y$ alike gives a surface of revolution`,
        t`The domain is the whole plane`,
      ],
      answer: 0,
      why: {
        1: t`A negative function can have any shape: $-1 - x^2$ is negative everywhere and is not the same in every direction.`,
        2: t`Swapping $x$ and $y$ is only one symmetry. $f = xy$ treats $x$ and $y$ alike, yet it is a saddle that rises along $y = x$ and falls along $y = -x$.`,
        3: t`The domain excludes the centre, where $\sqrt{x^2 + y^2} = 0$ — and the domain says where $f$ is defined, not what shape it has.`,
      },
      hints: ['What stays the same as you walk around a circle centred on the planet?', t`On the circle $x^2 + y^2 = r^2$, $\Phi = -GM/r$ — one value.`],
      teach: 'A function of the distance from the axis alone has a graph that is a surface of revolution.',
      explain: t`Every point at distance $r$ from the centre has $\Phi = -GM/r$, so the graph is the curve $z = -GM/r$ spun about the vertical axis: a funnel, steep near the planet and nearly flat far away.`,
      visual: graphOf((x, y) => `-1/sqrt(${x}^2 + ${y}^2 + 0.12)`, { caption: t`The graph of $\Phi$ (units with $GM = 1$), softened at the centre to fit — the true $-1/r$ plunges without limit there. Inside a real planet the potential stays finite, because less of the mass lies below you.` }),
    }),
    mcq({
      id: 'trough', difficulty: 2,
      prompt: t`In three dimensions, what is the graph of the function of two variables $f(x, y) = x^2$?`,
      choices: [
        t`A parabolic trough: the parabola $z = x^2$ slid along the whole $y$-axis`,
        t`The single parabola $z = x^2$ in the $xz$-plane`,
        t`A bowl, $z = x^2 + y^2$`,
        t`A plane, because $y$ does not appear`,
      ],
      answer: 0,
      why: {
        1: t`That is only the trace in the plane $y = 0$. The domain is the whole plane: for every $y$ there is a point $(x, y, x^2)$.`,
        2: t`A bowl climbs in the $y$-direction too. Here moving in $y$ changes nothing.`,
        3: t`The missing $y$ means the surface does not change as $y$ changes, but it still curves in $x$.`,
      },
      hints: [t`For a fixed $y$, which curve do you get? Does it depend on $y$?`, t`Every trace $y = b$ is the same parabola $z = x^2$.`],
      teach: 'A variable missing from the formula is a direction in which the graph does not change: the surface is a cylinder over the curve you see.',
      explain: t`Every trace $y = b$ is the parabola $z = x^2$, so the graph is that parabola slid along the $y$-axis: a parabolic cylinder, shaped like a trough.`,
      visual: { type: 'graph', params: { x: [-2.5, 2.5], y: [-0.5, 4.5], aspect: 'wide', xlabel: 'x', ylabel: 'z', curves: [{ fn: 'x^2', color: 'accent', label: 'z = x²', labelAt: 1.55 }] }, caption: t`The trace of the graph in the plane $y = 0$. What happens at other values of $y$?` },
    }),
    mcq({
      id: 'rocket-gain', difficulty: 2,
      prompt: t`A stage has exhaust speed $v_e = 3.4$ km/s and mass ratio $R = 6$, so $\Delta v = v_e\ln R = 6.09$ km/s. Which gives more extra $\Delta v$: a 10% higher exhaust speed or a 10% higher mass ratio?`,
      choices: [
        t`10% more exhaust speed: $\Delta v$ is proportional to $v_e$ but only logarithmic in $R$`,
        t`10% more mass ratio: $R$ is the larger number`,
        t`They give the same gain, because both are 10%`,
        t`Neither changes $\Delta v$ much: it is set by gravity`,
      ],
      answer: 0,
      why: {
        1: t`A larger number does not mean a larger effect: $\ln(1.1R) = \ln R + \ln 1.1$ adds only $3.4\times0.095 = 0.32$ km/s.`,
        2: t`The two traces have different shapes: the $v_e$ trace is a straight line, the $R$ trace a flattening logarithm, so equal percentage changes give different gains.`,
        3: t`Gravity losses matter for a whole launch, but the rocket equation itself contains only $v_e$ and $R$.`,
      },
      hints: [t`Compute $1.1v_e\ln R$ and $v_e\ln(1.1R)$.`, t`$v_e\ln(1.1R) = v_e\ln R + v_e\ln 1.1$, and $\ln 1.1 \approx 0.095$.`],
      teach: 'Along each trace the function can change in a completely different way — that is what having two variables means.',
      explain: t`More exhaust speed: $\Delta v$ grows by 10%, to $6.70$ km/s (+0.61 km/s). More mass ratio: $\Delta v = 3.4\ln 6.6 = 6.42$ km/s (+0.32 km/s). That is why engine designers fight for every second of specific impulse.`,
      visual: rocketPicture(t`$\Delta v = v_e\ln R$ with its traces through $(3.4, 6)$: the gold one ($R$ fixed) is a straight line, the violet one ($v_e$ fixed) a flattening logarithm. Heights shrunk to fit; drag to rotate.`),
    }),
    mcq({
      id: 'domain-error', difficulty: 3, kind: 'error',
      prompt: t`A student writes: “The domain of $f(x, y) = \ln(x + y)$ is $x > 0$ and $y > 0$, because a logarithm needs positive numbers.” What is wrong?`,
      choices: [
        t`The logarithm needs only $x + y > 0$: the domain is the half-plane above the line $y = -x$, which includes points such as $(3, -1)$`,
        t`The boundary should be included: $x \ge 0$ and $y \ge 0$`,
        t`Nothing is wrong: both coordinates must be positive`,
        t`A logarithm accepts any input, so the domain is the whole plane`,
      ],
      answer: 0,
      why: {
        1: t`$\ln 0$ is undefined, so the boundary is not included — and the region is still too small: $f(3, -1) = \ln 2$ is fine.`,
        2: t`Try $(3, -1)$: $x + y = 2 > 0$ and $\ln 2 \approx 0.69$, even though $y < 0$.`,
        3: t`$\ln$ of zero or of a negative number is undefined, so there is a restriction — just not on $x$ and $y$ separately.`,
      },
      hints: [t`What exactly goes into the logarithm?`, t`Evaluate $f(3, -1)$. Is it defined?`],
      teach: 'A domain condition applies to the whole expression inside the function, not to each variable separately.',
      explain: t`$\ln u$ needs $u > 0$, and here $u = x + y$. So the domain is $\{(x, y) : x + y > 0\}$, the open half-plane above the line $y = -x$ — far larger than the first quadrant.`,
      visual: { type: 'graph', params: { x: [-2.5, 5], y: [-3, 4], aspect: 'wide', equal: true, shade: [{ fn: '10', lower: '0', from: 0, to: 12, color: 'accent', alpha: 0.2 }], points: [{ x: 3, y: -1, color: 'gold', label: 'P(3, −1)' }] }, caption: 'Shaded: the student’s claimed domain, x > 0 and y > 0. The point P(3, −1) lies outside it.' },
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-evaluate', difficulty: 2,
      gen(r) {
        const [p, q] = r.pick([[1, 2], [2, 3], [-1, 3], [3, -2], [-2, -2], [1, -4], [2, 4], [-3, 1]]);
        const val = Math.sqrt(25 - p * p - q * q);
        return {
          prompt: t`Evaluate $f(x, y) = \sqrt{25 - x^2 - y^2}$ at $(${p}, ${q})$, to 3 significant figures.`,
          answer: val, tol: { rel: 0.005 },
          errors: [{ value: 25 - p * p - q * q, feedback: 'Take the square root at the end.' }],
          hints: [t`$25 - (${p})^2 - (${q})^2 = ${25 - p * p - q * q}$.`],
          teach: 'Substitute both coordinates, then apply the outer function.',
          explain: t`$f(${p}, ${q}) = \sqrt{25 - ${p * p} - ${q * q}} = \sqrt{${25 - p * p - q * q}} \approx ${fmt(val)}$. The graph is the upper half of the sphere of radius 5, and this is its height above $(${p}, ${q})$.`,
          visual: graphOf((x, y) => `sqrt(25 - ${x}^2 - ${y}^2)`, { disk: [5, 5], traces: [{ y: q }, { x: p }], zs: 0.5, axisLen: 6, dist: 16, caption: 'The graph of f and its traces through the point; heights halved. Drag to rotate.' }),
        };
      },
    }),
    expr({
      id: 'cp-trace', difficulty: 2,
      gen(r) {
        const b = r.pick([1, 2, 3]), a = r.pick([-2, -1, 1, 2]);
        const coefs = [b * a * a, -1, a];
        return {
          prompt: t`Find the trace of the graph of $f(x, y) = xy^2 + ${b === 1 ? '' : b}x^2 - y$ in the plane $x = ${a}$: write $z$ as a function of $y$.`,
          answer: polyText(coefs, 'y'), answerTeX: polyTeX(coefs, 'y'), lhs: 'z',
          vars: { y: [-3, 3] },
          hints: [t`Substitute $x = ${a}$.`],
          teach: 'Fix x, and the trace is a function of y alone.',
          explain: t`$z = (${a})y^2 + ${b}(${a})^2 - y = ${polyTeX(coefs, 'y')}$: the violet curve in the plane $x = ${a}$.`,
          visual: graphOf((x, y) => `${x}*${y}^2 + ${b}*${x}^2 - ${y}`, { traces: [{ x: a }], zs: fit((x, y) => x * y * y + b * x * x - y), caption: t`The graph of $f$ (heights scaled to fit) and its trace in the plane $x = ${a}$, in violet. Drag to rotate.` }),
        };
      },
    }),
    num({
      id: 'cp-maxq', difficulty: 2, transfer: true,
      gen(r) {
        const h = r.pick([9, 10, 11, 12, 13]), rho = RHO[h], v = r.pick([380, 400, 420, 440, 460, 480]);
        const q = (0.5 * rho * v * v) / 1000;
        return {
          prompt: t`The aerodynamic load on a climbing rocket is set by the **dynamic pressure**, a function of air density and speed: $q(\rho, v) = \tfrac12\rho v^2$. Passing ${h} km, where $\rho = ${rho}$ kg/m³, a launcher is doing ${v} m/s. What is $q$, in kPa?`,
          answer: q, units: 'kPa', tol: { rel: 0.005 },
          errors: [{ value: (rho * v * v) / 1000, feedback: t`Keep the factor $\tfrac12$.` }, { value: (0.5 * rho * v) / 1000, feedback: 'The speed is squared.' }],
          hints: [t`$q = \tfrac12(${rho})(${v})^2$ Pa; divide by 1000 for kPa.`],
          teach: 'A physical law with two inputs is a function of two variables: substitute both, with their units.',
          explain: t`$q = \tfrac12(${rho}\ \text{kg/m}^3)(${v}\ \text{m/s})^2 = ${fmt(q * 1000, 4)}$ Pa $\approx ${fmt(q)}$ kPa. Climbing, $v$ rises while $\rho$ falls, so $q$ peaks somewhere in between — the “max-Q” that launch commentators call out, around 30 kPa for large launchers.`,
          visual: boxGraph((p, w) => `0.5*${p}*${w}^2/1000`, [0.25, 0.55], [300, 550], { zmax: 0.5 * 0.55 * 550 * 550 / 1000, traces: [{ x: rho }, { y: v }], labels: ['ρ', 'v', 'q'], caption: t`The graph of $q = \tfrac12\rho v^2$ for $0.25 \le \rho \le 0.55$ kg/m³ and $300 \le v \le 550$ m/s (axes from that corner; heights to scale but unlabelled), with its traces through this flight’s values. Drag to rotate.` }),
        };
      },
    }),
  ],
  sources: [
    { label: 'OpenStax Calculus Vol. 3, §4.1 Functions of Several Variables', url: 'https://openstax.org/books/calculus-volume-3/pages/4-1-functions-of-several-variables' },
    { label: 'U.S. Standard Atmosphere, 1976 (NASA-TM-X-74335)', url: 'https://ntrs.nasa.gov/citations/19770009539' },
  ],
});
