// Pythagorean and reciprocal identities — sin²θ + cos²θ = 1 is Pythagoras on the unit circle; sec, csc and cot are reciprocals.
import { lesson, mcq, num, expr } from '../../src/core/content.js';
import { sig } from '../../src/core/format.js';
import { N } from './_m0kit.js';
import { PI, circleFig, trigGraph } from './_m0trig.js';

const t = String.raw;
const TRIPLES = [[3, 4, 5], [5, 12, 13], [8, 15, 17], [7, 24, 25]];
const QN = { 2: 'second', 3: 'third', 4: 'fourth' };
const EX = { th: PI - Math.asin(0.6) };

export default lesson({
  id: 'm0.M0-8.1',
  title: 'Pythagorean and reciprocal identities',
  minutes: 9, difficulty: 2,
  intro: t`An **identity** is an equation true for every angle, not just some. The most used one is Pythagoras’ theorem on the unit circle: $P = (\cos\theta, \sin\theta)$ is $1$ from the centre, so

$$\sin^2\theta + \cos^2\theta = 1$$

($\sin^2\theta$ means $(\sin\theta)^2$, not $\sin(\theta^2)$.) Divide it by $\cos^2\theta$ and by $\sin^2\theta$ and you get two cousins, $1 + \tan^2\theta = \sec^2\theta$ and $\cot^2\theta + 1 = \csc^2\theta$. The **reciprocal functions** are just names: $\sec\theta = \dfrac{1}{\cos\theta}$, $\csc\theta = \dfrac{1}{\sin\theta}$, $\cot\theta = \dfrac{\cos\theta}{\sin\theta}$. Given one function’s value and the quadrant, these give all the others — the identity supplies the size, the quadrant the sign.`,
  symbols: [
    { tex: '\\sin^2\\theta', text: 'shorthand for $(\\sin\\theta)^2$, the square of the sine' },
    { tex: '\\sec\\theta', text: 'the **secant**, $1/\\cos\\theta$; not defined where $\\cos\\theta = 0$' },
    { tex: '\\csc\\theta', text: 'the **cosecant**, $1/\\sin\\theta$; not defined where $\\sin\\theta = 0$' },
    { tex: '\\cot\\theta', text: 'the **cotangent**, $\\cos\\theta/\\sin\\theta = 1/\\tan\\theta$' },
  ],
  why: t`Identities are the moves of trigonometric algebra. Calculus II leans on them constantly: $\int \sin^2 x\,dx$, trigonometric substitution ($\sqrt{1 - x^2}$ becomes $\cos\theta$), and $\tfrac{d}{dx}\tan x = \sec^2 x$. In physics, $\sin^2 + \cos^2 = 1$ is what keeps an oscillator’s energy constant as it trades between kinetic and potential.`,
  visual: {
    type: 'graph',
    title: 'Two squares that always fill the band',
    lead: t`Orange: $\sin^2 x$, stacked from the bottom. Blue: $\cos^2 x$, stacked on top of it. Move the marker $u$ and read the heights.`,
    tasks: [
      t`At any $u$ the two pieces add to exactly $1$: where one swells the other shrinks.`,
      t`At $u = \pi/4$ they are equal, $\tfrac12$ each — the $45^\circ$ point of the circle.`,
      t`Check the second identity in the readouts: $1 + \tan^2 u$ and $\sec^2 u$ always agree (and both blow up as $u \to \pi/2$).`,
    ],
    params: {
      x: [-0.1, 6.4], y: [-0.25, 1.35], aspect: 'wide', xlabel: 'x', ylabel: '', yticks: 4,
      sliders: [{ key: 'u', label: t`Marker $u$`, min: 0, max: 6.28, step: 0.01, value: 1, unit: '\\text{rad}', explain: t`The angle at which the readouts are taken.` }],
      shade: [{ fn: 'sin(x)^2', lower: '0', from: 0, to: N(2 * PI), color: 'warn', alpha: 0.35 }, { fn: '1', lower: 'sin(x)^2', from: 0, to: N(2 * PI), color: 'accent', alpha: 0.3 }],
      curves: [{ fn: 'sin(x)^2', color: 'warn', domain: [0, N(2 * PI)], label: 'sin²x', labelAt: N(PI / 2), labelDx: -14, labelDy: 14 }, { fn: '1', color: 'ink', width: 1.6, domain: [0, N(2 * PI)] }],
      vlines: [{ x: 'u', color: 'gold' }],
      points: [{ x: 'u', y: 'sin(u)^2', color: 'gold', r: 4.5 }, { x: N(PI), y: 0.8, r: 0, label: 'cos²x', color: 'accent', labelAlign: 'center', labelDx: 0, labelDy: 0 }],
      readouts: [
        { label: t`$\sin^2 u$`, expr: 'sin(u)^2', digits: 3 },
        { label: t`$\cos^2 u$`, expr: 'cos(u)^2', digits: 3 },
        { label: 'sum', expr: 'sin(u)^2 + cos(u)^2', digits: 6 },
        { label: t`$1 + \tan^2 u$`, expr: '1 + tan(u)^2', digits: 4 },
        { label: t`$\sec^2 u$`, expr: '1/cos(u)^2', digits: 4 },
      ],
    },
    caption: t`Exact. The orange band is $\sin^2 x$; the blue band above it is $\cos^2 x$; together they always reach the line $y = 1$.`,
  },
  example: {
    prompt: t`An angle $\theta$ in the second quadrant has $\sin\theta = \tfrac35$. Find $\cos\theta$, $\tan\theta$, $\sec\theta$, $\csc\theta$ and $\cot\theta$.`,
    visual: circleFig({ th: EX.th, caption: t`$P$ in the second quadrant at height $\tfrac35$: the cosine leg points left.` }),
    steps: [
      { label: 'Size from the identity', text: t`$\cos^2\theta = 1 - \sin^2\theta = 1 - \tfrac{9}{25} = \tfrac{16}{25}$, so $|\cos\theta| = \tfrac45$.` },
      { label: 'Sign from the quadrant', text: t`In quadrant II the $x$-coordinate is negative: $\cos\theta = -\tfrac45$. The identity alone cannot tell you this — it only fixes the square.` },
      { label: 'Tangent', text: t`$\tan\theta = \dfrac{\sin\theta}{\cos\theta} = \dfrac{3/5}{-4/5} = -\tfrac34$.` },
      { label: 'Reciprocals', text: t`Flip each: $\sec\theta = -\tfrac54$, $\csc\theta = \tfrac53$, $\cot\theta = -\tfrac43$.` },
      { label: 'Check', text: t`$1 + \tan^2\theta = 1 + \tfrac{9}{16} = \tfrac{25}{16} = \sec^2\theta$ ✓.` },
    ],
    answer: t`$\cos\theta = -\tfrac45$, $\tan\theta = -\tfrac34$, $\sec\theta = -\tfrac54$, $\csc\theta = \tfrac53$, $\cot\theta = -\tfrac43$.`,
  },
  practice: [
    num({
      id: 'cos-from-sin', difficulty: 2,
      gen(r) {
        const [a, b, c] = r.pick(TRIPLES), q = r.pick([2, 3, 4]), s = (q === 2 ? 1 : -1) * (a / c), cs = (q === 4 ? 1 : -1) * (b / c);
        const th = q === 2 ? PI - Math.asin(a / c) : q === 3 ? PI + Math.asin(a / c) : 2 * PI - Math.asin(a / c);
        return {
          prompt: t`An angle $\theta$ in the ${QN[q]} quadrant has $\sin\theta = ${s < 0 ? '-' : ''}\tfrac{${a}}{${c}}$. What is $\cos\theta$, as a decimal?`,
          answer: cs, tol: { rel: 0.005 },
          errors: [{ value: -cs, feedback: t`The size is right, but in the ${QN[q]} quadrant the $x$-coordinate is ${cs < 0 ? 'negative' : 'positive'}. The identity gives only $\cos^2\theta$; the quadrant gives the sign.` }, { value: 1 - Math.abs(s), feedback: t`$\sin^2 + \cos^2 = 1$ is about the **squares**: $\cos^2\theta = 1 - \sin^2\theta$, then take a square root.` }, { value: 1 - s * s, feedback: t`That is $\cos^2\theta$. Take its square root (with the right sign).` }],
          hints: [t`$\cos^2\theta = 1 - \left(\tfrac{${a}}{${c}}\right)^2$.`, t`Then choose the sign: in the ${QN[q]} quadrant, is $x$ positive or negative?`],
          teach: t`From $\sin\theta$: $\cos\theta = \pm\sqrt{1 - \sin^2\theta}$, with the sign of $x$ in $\theta$’s quadrant.`,
          explain: t`$\cos^2\theta = 1 - \tfrac{${a * a}}{${c * c}} = \tfrac{${b * b}}{${c * c}}$, so $|\cos\theta| = \tfrac{${b}}{${c}}$; in the ${QN[q]} quadrant, $\cos\theta = ${cs < 0 ? '-' : ''}\tfrac{${b}}{${c}} = ${sig(cs, 4)}$.`,
          visual: circleFig({ th, legLabels: false, caption: t`The angle in the ${QN[q]} quadrant (orange leg: the sine, blue leg: the cosine).` }),
        };
      },
    }),
    mcq({
      id: 'cos-squared', difficulty: 1,
      prompt: t`What does $\cos^2 x$ mean?`,
      visual: trigGraph({ curves: [{ fn: 'cos(x)^2', color: 'accent', label: 'y = cos²x', labelAt: N(PI), labelDx: -24, labelDy: -14 }, { fn: 'cos(x)', color: 'ink3', dash: true, width: 1.3, label: 'y = cos x', labelAt: N(PI), labelDx: -24, labelDy: 16 }], caption: t`$\cos^2 x$ (blue) never goes below zero; $\cos x$ (dashed) does.` }),
      choices: [t`$(\cos x)^2$`, t`$\cos(x^2)$`, t`$\cos(\cos x)$`, t`$2\cos x$`],
      answer: 0,
      why: {
        1: t`That would be written $\cos(x^2)$, with the square inside. A power written on the function name squares the *output*.`,
        2: t`$\cos(\cos x)$ is the cosine applied twice, a composition. $\cos^2 x$ multiplies the value by itself.`,
        3: t`Squaring is not doubling: at $x = 0$, $(\cos 0)^2 = 1$ but $2\cos 0 = 2$.`,
      },
      hints: [t`The convention: $\sin^n x = (\sin x)^n$ for positive powers.`],
      teach: t`A positive power on a trig function’s name means the power of its value: $\cos^2 x = (\cos x)^2$.`,
      explain: t`$\cos^2 x = (\cos x)^2 = \cos x \cdot \cos x$, which is why it is never negative. (The exception to the convention is $\cos^{-1} x$, which means the inverse function, not $1/\cos x$ — see [inverse trigonometric functions](#/lesson/m0.M0-8.4).)`,
    }),
    expr({
      id: 'simplify-pyth', difficulty: 2,
      gen(r) {
        const k = r.int(0, 2);
        const C = [
          { q: t`\dfrac{1 - \cos^2 x}{\sin x}`, a: 'sin(x)', aT: t`\sin x`, forbid: ['cos'], err: [{ answer: '1', feedback: t`$1 - \cos^2 x$ is $\sin^2 x$, not $\sin x$ — the identity is about squares.` }], plot: '(1 - cos(x)^2)/sin(x)' },
          { q: t`\dfrac{\sin^2 x}{1 - \cos x}`, a: '1 + cos(x)', aT: t`1 + \cos x`, forbid: ['sin'], err: [{ answer: '1 - cos(x)', feedback: t`$\sin^2 x = 1 - \cos^2 x = (1 - \cos x)(1 + \cos x)$: what is left after cancelling is $1 + \cos x$.` }], plot: 'sin(x)^2/(1 - cos(x))' },
          { q: t`\left(\sec^2 x - 1\right)\cos^2 x`, a: 'sin(x)^2', aT: t`\sin^2 x`, forbid: ['sec', 'tan', 'cos'], err: [{ answer: '1', feedback: t`$\sec^2 x - 1$ is $\tan^2 x$, not $\sec^2 x$: the $-1$ matters.` }], plot: '(1/cos(x)^2 - 1)*cos(x)^2' },
        ][k];
        return {
          prompt: t`Simplify $${C.q}$ to a single term, using a Pythagorean identity.`,
          answer: C.a, answerTeX: C.aT, vars: { x: [0.4, 1.3] }, forbid: C.forbid, errors: C.err,
          hints: [t`Rewrite with $\sin^2 x + \cos^2 x = 1$ (or $1 + \tan^2 x = \sec^2 x$).`, k === 1 ? t`Factor $1 - \cos^2 x$ as a difference of squares.` : t`Replace the bracket by a single squared function, then cancel.`],
          teach: t`Pythagorean identities turn $1 - \cos^2$, $1 - \sin^2$ and $\sec^2 - 1$ into single squares.`,
          explain: k === 0 ? t`$\dfrac{1 - \cos^2 x}{\sin x} = \dfrac{\sin^2 x}{\sin x} = \sin x$ (where $\sin x \neq 0$).` : k === 1 ? t`$\dfrac{\sin^2 x}{1 - \cos x} = \dfrac{(1 - \cos x)(1 + \cos x)}{1 - \cos x} = 1 + \cos x$ (where $\cos x \neq 1$).` : t`$(\sec^2 x - 1)\cos^2 x = \tan^2 x \cos^2 x = \dfrac{\sin^2 x}{\cos^2 x}\cos^2 x = \sin^2 x$.`,
          visual: trigGraph({ curves: [{ fn: C.plot, color: 'accent', samples: 600 }], lo: 0.05, hi: 2 * PI - 0.05, y: [-1.4, 2.4], caption: t`The expression as given, plotted: its graph is a familiar curve (gaps where it is not defined are not drawn).` }),
        };
      },
    }),
    expr({
      id: 'simplify-recip', difficulty: 2,
      gen(r) {
        const k = r.int(0, 2);
        const C = [
          { q: t`\tan x\,\cos x`, a: 'sin(x)', aT: t`\sin x`, forbid: ['tan', 'cos'], plot: 'tan(x)*cos(x)' },
          { q: t`\sin x\,\sec x`, a: 'tan(x)', aT: t`\tan x`, forbid: ['sec', 'sin', 'cos'], plot: 'sin(x)/cos(x)' },
          { q: t`\cot x\,\sec x`, a: '1/sin(x)', aT: t`\csc x`, forbid: ['cot', 'sec', 'cos'], plot: '(cos(x)/sin(x))/cos(x)' },
        ][k];
        return {
          prompt: t`Write $${C.q}$ as a single trigonometric function.`,
          answer: C.a, answerTeX: C.aT, vars: { x: [0.3, 1.2] }, forbid: C.forbid,
          errors: [{ answer: `1/(${C.a})`, feedback: t`Upside down: write every function in terms of $\sin$ and $\cos$ and cancel carefully.` }],
          hints: [t`Write each factor with sines and cosines: $\tan = \sin/\cos$, $\sec = 1/\cos$, $\cot = \cos/\sin$.`],
          teach: t`When in doubt, rewrite everything in sines and cosines.`,
          explain: [t`$\tan x\cos x = \dfrac{\sin x}{\cos x}\cos x = \sin x$.`, t`$\sin x\sec x = \dfrac{\sin x}{\cos x} = \tan x$.`, t`$\cot x\sec x = \dfrac{\cos x}{\sin x}\cdot\dfrac{1}{\cos x} = \dfrac{1}{\sin x} = \csc x$.`][k],
          visual: trigGraph({ curves: [{ fn: C.plot, color: 'accent', samples: 800 }], lo: 0.05, hi: 2 * PI - 0.05, y: [-3.5, 3.5], caption: t`The product as given, plotted; recognise the curve. Vertical jumps at the gaps are not drawn.` }),
        };
      },
    }),
    num({
      id: 'sec-from-tan', difficulty: 2,
      gen(r) {
        const [a, b, c] = r.pick(TRIPLES), q = r.pick([1, 3]), k = a / b, ans = (q === 1 ? 1 : -1) * (c / b);
        return {
          prompt: t`An angle in the ${q === 1 ? 'first' : 'third'} quadrant has $\tan\theta = \tfrac{${a}}{${b}}$. What is $\sec\theta$, as a decimal?`,
          answer: ans, tol: { rel: 0.005 },
          errors: [{ value: -ans, feedback: t`Size right, sign wrong: $\sec\theta = 1/\cos\theta$ has the sign of the cosine, which is ${q === 1 ? 'positive' : 'negative'} in the ${q === 1 ? 'first' : 'third'} quadrant.` }, { value: 1 + k * k, feedback: t`That is $\sec^2\theta$. Take the square root (with the right sign).` }, { value: 1 / k, feedback: t`$1/\tan\theta$ is the cotangent. The secant is $1/\cos\theta$.` }],
          hints: [t`$\sec^2\theta = 1 + \tan^2\theta$.`, t`$\sec\theta$ has the same sign as $\cos\theta$.`],
          teach: t`$1 + \tan^2\theta = \sec^2\theta$: the tangent gives the secant’s size, the quadrant its sign.`,
          explain: t`$\sec^2\theta = 1 + \tfrac{${a * a}}{${b * b}} = \tfrac{${c * c}}{${b * b}}$, so $|\sec\theta| = \tfrac{${c}}{${b}}$; ${q === 1 ? 'positive in quadrant I' : 'negative in quadrant III, where the cosine is negative'}: $\sec\theta = ${sig(ans, 4)}$.`,
          visual: circleFig({ th: (q === 1 ? 0 : PI) + Math.atan(k), legLabels: false, caption: t`The angle, with the ray’s slope equal to $\tan\theta = ${a}/${b}$.` }),
        };
      },
    }),
    mcq({
      id: 'find-error', difficulty: 2, kind: 'error',
      prompt: t`A student writes: “Since $\sin x + \cos x = 1$, at $x = \pi/4$ where $\sin x = \cos x$, each must equal $\tfrac12$.” What is wrong?`,
      visual: trigGraph({ curves: [{ fn: 'sin(x) + cos(x)', color: 'accent', label: 'sin x + cos x', labelAt: 0.3, labelDx: 6, labelDy: -14 }, { fn: 'sin(x)^2 + cos(x)^2', color: 'gold', label: 'sin²x + cos²x', labelAt: N(1.2 * PI), labelDx: 0, labelDy: -12 }], y: [-1.7, 1.8], caption: t`The sum of the functions (blue) against the sum of their squares (gold).` }),
      choices: [t`The identity is about squares: $\sin^2 x + \cos^2 x = 1$, so each is $\tfrac{\sqrt2}{2}$ at $\pi/4$.`, t`Nothing: $\sin\tfrac{\pi}{4} = \cos\tfrac{\pi}{4} = \tfrac12$.`, t`$\sin x = \cos x$ at $x = \pi/2$, not $\pi/4$.`, t`The identity only holds for acute angles.`],
      answer: 0,
      why: {
        1: t`$\sin\tfrac{\pi}{4} = \tfrac{\sqrt2}{2} \approx 0.707$: the half-square triangle has legs $1, 1$ and hypotenuse $\sqrt2$.`,
        2: t`At $\pi/2$, $\sin = 1$ and $\cos = 0$. They are equal at $\pi/4$, as the student says.`,
        3: t`$\sin^2 x + \cos^2 x = 1$ holds for every angle — it is Pythagoras on the unit circle. The student’s version holds for almost none.`,
      },
      hints: [t`Evaluate $\sin x + \cos x$ at $x = \pi/4$ on the graph. Is it $1$?`],
      teach: t`$\sin x + \cos x$ is not $1$; the squares add to $1$.`,
      explain: t`$\sin x + \cos x$ swings between $-\sqrt2$ and $\sqrt2$; only the squares add to $1$. At $\pi/4$: $2\sin^2\tfrac{\pi}{4} = 1$ gives $\sin\tfrac{\pi}{4} = \tfrac{\sqrt2}{2}$.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-tan', difficulty: 2,
      gen(r) {
        const [a, b, c] = r.pick(TRIPLES), ans = a / b;
        return {
          prompt: t`An angle $\theta$ in the third quadrant has $\cos\theta = -\tfrac{${b}}{${c}}$. What is $\tan\theta$?`,
          answer: ans, tol: { rel: 0.005 },
          errors: [{ value: -ans, feedback: t`In quadrant III sine and cosine are **both** negative, so their ratio is positive.` }, { value: b / a, feedback: t`That is $\cos/\sin$, the cotangent. $\tan\theta = \sin\theta/\cos\theta$.` }],
          hints: [t`Find $\sin\theta$ first: $\sin^2\theta = 1 - \cos^2\theta$, negative in quadrant III.`, t`Then divide: $\tan\theta = \sin\theta/\cos\theta$.`],
          teach: t`Find the missing function with $\sin^2 + \cos^2 = 1$, fix its sign by the quadrant, then divide.`,
          explain: t`$\sin\theta = -\sqrt{1 - \tfrac{${b * b}}{${c * c}}} = -\tfrac{${a}}{${c}}$, so $\tan\theta = \dfrac{-${a}/${c}}{-${b}/${c}} = \tfrac{${a}}{${b}} = ${sig(ans, 4)}$.`,
          visual: circleFig({ th: PI + Math.atan(a / b), legLabels: false, caption: t`The angle in the third quadrant: both legs point the negative way.` }),
        };
      },
    }),
    num({
      id: 'cp-glide', difficulty: 3, transfer: true,
      gen(r) {
        const [LD, v, what] = r.pick([[40, 28, 'a high-performance sailplane'], [4.5, 110, 'a lifting-body test vehicle'], [17, 70, 'an airliner with all engines out'], [6, 95, 'a winged re-entry glider at low speed']]);
        const s = 1 / Math.sqrt(1 + LD * LD), ans = v * s;
        return {
          prompt: t`In a steady unpowered glide, the glide angle $\gamma$ below the horizontal satisfies $\cot\gamma = L/D$, the lift-to-drag ratio. For ${what}, $L/D = ${LD}$ at an airspeed of $${v}$ m/s along the flight path. How fast does it sink — its vertical speed $v\sin\gamma$?`,
          answer: ans, units: 'm/s', tol: { rel: 0.01 },
          errors: [{ value: v / LD, feedback: t`$v/(L/D) = v\tan\gamma$, which is the sink rate per unit of *horizontal* speed. With the airspeed along the path you need $\sin\gamma$: use $\csc^2\gamma = 1 + \cot^2\gamma$.` }, { value: v / (1 + LD * LD), feedback: t`$1 + \cot^2\gamma$ is $\csc^2\gamma$: take the square root before inverting.` }].filter((e) => Math.abs(e.value - ans) > 0.01 * ans),
          hints: [t`$\csc^2\gamma = 1 + \cot^2\gamma = 1 + ${LD}^2$.`, t`$\sin\gamma = 1/\csc\gamma = 1\big/\sqrt{1 + ${LD}^2}$; then multiply by $${v}$ m/s.`],
          teach: t`$1 + \cot^2\gamma = \csc^2\gamma$ turns a ratio (the cotangent) into the sine you need.`,
          explain: t`$\sin\gamma = 1/\sqrt{1 + ${LD * LD}} = ${sig(s, 4)}$, so the sink rate is $${v} \times ${sig(s, 4)} = ${sig(ans, 3)}$ m/s (a glide angle of $${sig(Math.atan(1 / LD) * 180 / PI, 3)}^\circ$).${LD >= 17 ? ' For small angles $\\sin\\gamma \\approx \\tan\\gamma$, and the two answers nearly agree.' : ' At steep angles $\\sin\\gamma$ and $\\tan\\gamma$ differ noticeably.'}`,
          visual: { type: 'graph', params: { x: [-0.5, 10.5], y: [-3.6, 0.8], equal: true, aspect: 'wide', axes: false, grid: false, xticks: 0, yticks: 0, xlabel: '', ylabel: '', curves: [{ fn: '0', color: 'ink3', dash: true, width: 1.2, domain: [0, 10] }], arrows: [{ from: [0, 0], to: [N(10 * Math.cos(Math.atan(1 / Math.min(LD, 4)))), N(-10 * Math.sin(Math.atan(1 / Math.min(LD, 4))))], color: 'accent', label: 'v along the path', labelDx: -60, labelDy: 14 }], points: [{ x: 2.2, y: -0.22, r: 0, label: 'γ', color: 'gold', labelDx: 0, labelDy: 0 }] }, caption: t`The flight path below the horizontal (dashed). Not to scale: the angle is drawn ${LD > 4 ? 'steeper than the real one' : 'to scale'} so it can be seen.` },
        };
      },
    }),
    mcq({
      id: 'cp-not-identity', difficulty: 2,
      prompt: t`Which of these is **not** an identity (true for every angle where both sides are defined)?`,
      visual: trigGraph({ curves: [{ fn: 'tan(x)^2', color: 'accent', samples: 800, label: 'tan²x', labelAt: 0.6, labelDx: 4, labelDy: 10 }, { fn: '1/cos(x)^2', color: 'gold', samples: 800, label: 'sec²x', labelAt: 0.6, labelDx: 4, labelDy: -12 }], lo: -PI, hi: PI, y: [-0.4, 4.5], caption: t`$\tan^2 x$ and $\sec^2 x$: the gold curve sits a constant distance above the blue one.` }),
      choices: [t`$\tan^2\theta - 1 = \sec^2\theta$`, t`$1 + \tan^2\theta = \sec^2\theta$`, t`$\cot^2\theta + 1 = \csc^2\theta$`, t`$\sin^2\theta = 1 - \cos^2\theta$`],
      answer: 0,
      why: {
        1: t`True: divide $\sin^2 + \cos^2 = 1$ by $\cos^2\theta$. The graph shows $\sec^2$ exactly $1$ above $\tan^2$.`,
        2: t`True: divide $\sin^2 + \cos^2 = 1$ by $\sin^2\theta$.`,
        3: t`True: it is $\sin^2 + \cos^2 = 1$ rearranged.`,
      },
      hints: [t`Each true one comes from dividing $\sin^2\theta + \cos^2\theta = 1$ by something. Test $\theta = 0$ in each.`],
      teach: t`$\sec^2$ exceeds $\tan^2$ by exactly $1$; $\csc^2$ exceeds $\cot^2$ by exactly $1$.`,
      explain: t`At $\theta = 0$: $\tan^2 0 - 1 = -1$ but $\sec^2 0 = 1$. The correct relation is $\sec^2\theta - \tan^2\theta = 1$.`,
    }),
  ],
  sources: [
    { label: 'OpenStax Precalculus 2e, §7.1 Solving Trigonometric Equations with Identities', url: 'https://openstax.org/books/precalculus-2e/pages/7-1-solving-trigonometric-equations-with-identities' },
    { label: 'OpenStax Precalculus 2e, §5.3 The Other Trigonometric Functions', url: 'https://openstax.org/books/precalculus-2e/pages/5-3-the-other-trigonometric-functions' },
  ],
});
