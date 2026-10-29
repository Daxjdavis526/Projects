// Derivatives of trigonometric functions — sine and cosine turn into each
// other, but only when the angle is measured in radians.
import { lesson, mcq, num, expr } from '../../src/core/content.js';
import { nice } from '../../src/core/format.js';
import { N, curveFig, fitY } from './_c1kit.js';

const t = String.raw;
const D = Math.PI / 180;

export default lesson({
  id: 'math1210.C1-3.5',
  title: 'Derivatives of trigonometric functions',
  minutes: 9, difficulty: 2,
  intro: t`Measure the angle in **radians** and the sine and cosine differentiate into each other:

$$\frac{d}{dx}\sin x = \cos x, \qquad \frac{d}{dx}\cos x = -\sin x$$

Both rules rest on two limits, $\dfrac{\sin h}{h} \to 1$ and $\dfrac{\cos h - 1}{h} \to 0$ as $h \to 0$, and both limits hold only in radians. The other four trigonometric functions follow from these two by the quotient rule. Every oscillation in physics — a mass on a spring, an alternating current, a light wave — is built from sines and cosines, and these two rules are why its velocity runs a quarter of a cycle ahead of its position.`,
  symbols: [
    { tex: 'x', text: 'the angle, in **radians** (one radian is the angle whose arc equals the radius, about $57.3^\\circ$)' },
    { tex: '\\sin x,\\ \\cos x', text: 'the vertical and horizontal coordinates of the point at angle $x$ on a circle of radius 1 — pure numbers' },
    { tex: '\\frac{d}{dx}', text: 'the derivative with respect to $x$: the slope of the graph, here per radian' },
    { tex: 'h', text: 'a small change in the angle, in radians, used in the limits that prove the rules' },
  ],
  why: t`Differentiate $\sin$ twice and you get $-\sin$ back: that single fact, $y'' = -y$, is the equation of every simple harmonic oscillator you will meet in mechanics, circuits and quantum physics.`,
  visual: {
    type: 'graph',
    title: 'The slope of the sine is the cosine',
    lead: t`The blue curve is $y = \sin x$, with $x$ in radians. Drag the gold point along it: the gold line is the tangent there, and the red dot is plotted at the height of that tangent’s **slope**. The dashed green curve is $y = \cos x$.`,
    tasks: [
      t`Drag the gold point to the top of the first hump, near $x = 1.57$: the slope is $0$, and the red dot sits where the cosine crosses the axis.`,
      t`Drag it to $x = 0$: the slope is $1$. Near zero, $\sin x \approx x$ — that is the limit $\sin h / h \to 1$ in a picture.`,
      t`Sweep the gold point across a whole cycle: the red dot traces the dashed cosine exactly.`,
    ],
    params: {
      x: [-0.5, 7], y: [-1.6, 1.6], aspect: 'wide', xlabel: 'x (rad)',
      curves: [
        { fn: 'sin(x)', color: 'accent', label: 'sin x', labelAt: 2.2, labelDy: -14 },
        { fn: 'cos(x)', color: 'good', dash: true, width: 1.6, label: 'cos x', labelAt: 5.8, labelDy: 14 },
      ],
      tangent: { fn: 'sin(x)', at: 0.6 },
      points: [{ x: 'x0', y: 'slope', color: 'bad', r: 5 }],
      readouts: [
        { label: t`angle $x$`, expr: 'x0', unit: t`\text{rad}`, digits: 3 },
        { label: 'slope of the tangent (red dot)', expr: 'slope', digits: 3 },
        { label: t`$\cos x$`, expr: 'cos(x0)', digits: 3 },
      ],
    },
    caption: t`The slope is measured numerically from the curve, per radian. Plot the same sine against degrees and every slope shrinks by the factor $\pi/180$.`,
  },
  example: {
    prompt: t`Prove from the definition of the derivative that $\dfrac{d}{dx}\sin x = \cos x$.`,
    visual: {
      type: 'graph',
      params: {
        x: [-3.2, 3.2], y: [-1.3, 1.4], aspect: 'wide', xlabel: 'h (rad)',
        curves: [
          { fn: 'sin(x)/x', color: 'accent', label: 'sin h / h', labelAt: 1.9, labelDy: -14 },
          { fn: '(cos(x) - 1)/x', color: 'violet', label: '(cos h − 1) / h', labelAt: 2.2, labelDy: 20 },
        ],
        points: [{ x: 0, y: 1, color: 'accent' }, { x: 0, y: 0, color: 'violet' }],
      },
      caption: t`The two ratios that carry the proof, with $h$ in radians. Neither is defined at $h = 0$; their limits there are $1$ and $0$.`,
    },
    steps: [
      { label: 'Write the limit', text: t`$\dfrac{d}{dx}\sin x = \displaystyle\lim_{h\to0}\frac{\sin(x+h) - \sin x}{h}$.` },
      { label: 'Expand the sine of a sum', text: t`$\sin(x + h) = \sin x\cos h + \cos x\sin h$, so the quotient regroups as $\sin x\cdot\dfrac{\cos h - 1}{h} + \cos x\cdot\dfrac{\sin h}{h}$. Now $x$ is fixed and only $h$ moves.` },
      { label: 'Use the two limits', text: t`As $h \to 0$ (in radians), $\dfrac{\sin h}{h} \to 1$ — a short arc and its half-chord are nearly equal — and $\dfrac{\cos h - 1}{h} \to 0$, because $1 - \cos h$ shrinks like $h^2/2$, faster than $h$.` },
      { label: 'Conclude', text: t`The limit is $\sin x\cdot 0 + \cos x\cdot 1 = \cos x$. The same expansion of $\cos(x + h)$ gives $\dfrac{d}{dx}\cos x = -\sin x$.` },
      { label: 'Sense check', text: t`At $x = 0$ the slope should be $\cos 0 = 1$: indeed $\sin(0.01)/0.01 = 0.99998$. In degrees, $\sin(1^\circ)/1 = 0.01745 = \pi/180$, not $1$ — the rule needs radians.` },
    ],
    answer: t`$\dfrac{d}{dx}\sin x = \cos x$, for $x$ in radians.`,
  },
  practice: [
    num({
      id: 'per-degree', difficulty: 2,
      gen(r) {
        const d = r.pick([20, 30, 40, 60]);
        const ans = D * Math.cos(d * D);
        return {
          prompt: t`A spreadsheet plots $y = \sin x$ with $x$ in **degrees**. What is the slope of that graph at $x = ${d}^\circ$, in units of “per degree”? Give 3 significant figures.`,
          answer: ans, tol: { rel: 0.005 },
          errors: [{ value: Math.cos(d * D), feedback: t`That is $\cos ${d}^\circ$ — the slope per **radian**. A degree is only $\pi/180$ of a radian, so per degree the slope is $\pi/180$ times smaller.` }],
          hints: [t`Write the angle in radians: $\sin(x^\circ) = \sin\left(\dfrac{\pi x}{180}\right)$.`, t`Per degree, the slope is $\dfrac{\pi}{180}\cos(x^\circ)$.`],
          teach: t`$\frac{d}{dx}\sin x = \cos x$ only for $x$ in radians; in degrees every trigonometric derivative picks up a factor $\pi/180$.`,
          explain: t`$\dfrac{\pi}{180}\cos ${d}^\circ = 0.017453 \times ${nice(Math.cos(d * D), 4)} = ${nice(ans, 3)}$ per degree.`,
          visual: curveFig({ fn: `sin(pi*x/180)`, x: [-15, 375], y: [-1.3, 1.3], xlabel: 'x (degrees)', at: d, f: (x) => Math.sin(x * D), df: (x) => D * Math.cos(x * D), span: 70, caption: t`$y = \sin x$ against degrees, with the tangent at $${d}^\circ$. Over one degree the curve rises by only about a hundredth.` }),
        };
      },
    }),
    expr({
      id: 'xn-trig', difficulty: 2,
      gen(r) {
        const n = r.pick([2, 3]), isSin = r.bool(0.5);
        const F = isSin ? `x^${n}*sin(x)` : `x^${n}*cos(x)`;
        const xn1 = n === 2 ? 'x' : `x^${n - 1}`;
        const answer = isSin ? `${n}*${xn1}*sin(x) + x^${n}*cos(x)` : `${n}*${xn1}*cos(x) - x^${n}*sin(x)`;
        const fT = isSin ? t`x^{${n}}\sin x` : t`x^{${n}}\cos x`;
        const f = (x) => x ** n * (isSin ? Math.sin(x) : Math.cos(x));
        return {
          prompt: t`Differentiate $f(x) = ${fT}$.`,
          lhs: t`f'(x)`,
          answer,
          answerTeX: isSin ? t`${n}${xn1 === 'x' ? 'x' : t`x^{${n - 1}}`}\sin x + x^{${n}}\cos x` : t`${n}${xn1 === 'x' ? 'x' : t`x^{${n - 1}}`}\cos x - x^{${n}}\sin x`,
          vars: { x: [-2, 2] }, derivativeOf: F,
          errors: [{ answer: isSin ? `${n}*${xn1}*cos(x)` : `-${n}*${xn1}*sin(x)`, feedback: t`You multiplied the two derivatives. The product rule is $(uv)' = u'v + uv'$ — two terms.` }],
          hints: [t`It is a product: $u = x^{${n}}$ and $v = ${isSin ? t`\sin x` : t`\cos x`}$.`, t`$u' = ${n}${xn1 === 'x' ? 'x' : t`x^{${n - 1}}`}$ and $v' = ${isSin ? t`\cos x` : t`-\sin x`}$; now form $u'v + uv'$.`],
          teach: t`The trigonometric rules slot into the product rule like any other derivative.`,
          explain: t`$(uv)' = u'v + uv'$ with $u = x^{${n}}$, $v = ${isSin ? t`\sin x` : t`\cos x`}$: $\;f'(x) = ${isSin ? t`${n}${xn1 === 'x' ? 'x' : t`x^{${n - 1}}`}\sin x + x^{${n}}\cos x` : t`${n}${xn1 === 'x' ? 'x' : t`x^{${n - 1}}`}\cos x - x^{${n}}\sin x`}$.`,
          visual: curveFig({ fn: F, x: [-3.2, 3.2], y: fitY(f, -3.2, 3.2), caption: t`$y = ${fT}$. Its slope must vanish at every turning point — check your answer against one.` }),
        };
      },
    }),
    expr({
      id: 'tan-rule', difficulty: 2,
      prompt: t`Use the quotient rule on $\tan x = \dfrac{\sin x}{\cos x}$ to find $\dfrac{d}{dx}\tan x$.`,
      lhs: t`\frac{d}{dx}\tan x`,
      answer: '1/cos(x)^2', answerTeX: t`\sec^2 x = \frac{1}{\cos^2 x}`,
      vars: { x: [-1.2, 1.2] }, derivativeOf: 'tan(x)',
      errors: [
        { answer: '-1/cos(x)^2', feedback: t`Check the sign: the numerator is $\cos x\cdot\cos x - \sin x\cdot(-\sin x) = \cos^2 x + \sin^2 x$, which is $+1$.` },
        { answer: '-cos(x)/sin(x)', feedback: t`You divided the derivative of the top by the derivative of the bottom. The quotient rule is $\left(\frac{u}{v}\right)' = \frac{u'v - uv'}{v^2}$.` },
      ],
      hints: [t`$u = \sin x$, $v = \cos x$, and $\left(\dfrac{u}{v}\right)' = \dfrac{u'v - uv'}{v^2}$.`, t`The numerator is $\cos^2 x + \sin^2 x$. What is that?`],
      teach: t`The quotient rule turns $\tan x$ into $\sec^2 x$, using $\sin^2 x + \cos^2 x = 1$.`,
      explain: t`$\dfrac{\cos x\cdot\cos x - \sin x\cdot(-\sin x)}{\cos^2 x} = \dfrac{1}{\cos^2 x} = \sec^2 x$. It is never below $1$: the tangent function climbs everywhere, steepest near its asymptotes.`,
      visual: curveFig({ fn: 'tan(x)', domain: [-1.45, 1.45], x: [-1.6, 1.6], y: [-5, 5], at: 0.8, f: Math.tan, df: (x) => 1 / Math.cos(x) ** 2, span: 0.45, caption: t`$y = \tan x$ between its asymptotes at $\pm\pi/2$, with one tangent line. Every slope is at least $1$.` }),
    }),
    mcq({
      id: 'sec-rule', difficulty: 2,
      prompt: t`What is $\dfrac{d}{dx}\sec x$, where $\sec x = \dfrac{1}{\cos x}$?`,
      visual: curveFig({ fn: '1/cos(x)', domain: [-1.35, 1.35], x: [-1.6, 1.6], y: [-0.5, 5], at: 0.7, f: (x) => 1 / Math.cos(x), df: (x) => Math.sin(x) / Math.cos(x) ** 2, span: 0.4, caption: t`$y = \sec x$ on $(-\pi/2, \pi/2)$: falling to the left of $0$, rising to the right.` }),
      choices: [t`$\sec x\tan x$`, t`$-\sec x\tan x$`, t`$-\csc x$`, t`$\sec^2 x$`],
      answer: 0,
      why: {
        1: t`The minus sign of $(\cos x)' = -\sin x$ is cancelled by the minus sign of the reciprocal rule: $\left(\frac{1}{v}\right)' = -\frac{v'}{v^2} = \frac{\sin x}{\cos^2 x}$. The picture agrees — the slope is positive for $x > 0$.`,
        2: t`That is $\frac{1}{(\cos x)'} = \frac{1}{-\sin x}$: you differentiated the denominator and kept the fraction. A reciprocal differentiates as $-\frac{v'}{v^2}$.`,
        3: t`$\sec^2 x$ is the derivative of $\tan x$, not of $\sec x$.`,
      },
      hints: [t`Treat it as $\dfrac{1}{v}$ with $v = \cos x$: its derivative is $-\dfrac{v'}{v^2}$.`],
      teach: t`$\left(\frac{1}{v}\right)' = -\frac{v'}{v^2}$, so $(\sec x)' = \frac{\sin x}{\cos^2 x} = \sec x\tan x$.`,
      explain: t`$-\dfrac{-\sin x}{\cos^2 x} = \dfrac{1}{\cos x}\cdot\dfrac{\sin x}{\cos x} = \sec x\tan x$. The same steps give $(\csc x)' = -\csc x\cot x$ and $(\cot x)' = -\csc^2 x$.`,
    }),
    num({
      id: 'centrifuge', difficulty: 2,
      gen(r) {
        const R = r.pick([6, 7.5, 8, 9]), d = r.pick([20, 30, 40, 50, 60, 70]);
        const ans = R * Math.cos(d * D);
        return {
          prompt: t`A human-training centrifuge has an arm of radius $R = ${R}$ m. With the arm at angle $\theta$ above the horizontal, the cab is at height $y = R\sin\theta$ above the hub. At $\theta = ${d}^\circ$, how fast does the height change with the angle? Give $\dfrac{dy}{d\theta}$ in metres per **radian**.`,
          answer: ans, units: 'm/rad', tol: { rel: 0.005 },
          errors: [
            { value: R * Math.sin(d * D), feedback: t`That is the height $R\sin\theta$ itself, not its rate of change.` },
            { value: ans * D, feedback: t`That is per degree. The question asks per radian, where $\dfrac{d}{d\theta}\sin\theta = \cos\theta$ exactly.` },
          ],
          hints: [t`$\dfrac{dy}{d\theta} = R\cos\theta$ — with $\theta$ in radians, although you may evaluate $\cos ${d}^\circ$ in degrees.`],
          teach: t`A constant factor rides along: $\frac{d}{d\theta}(R\sin\theta) = R\cos\theta$.`,
          explain: t`$R\cos\theta = ${R} \times ${nice(Math.cos(d * D), 4)} = ${nice(ans, 4)}$ m/rad. Near the top of the circle ($\theta \to 90^\circ$) the cab moves sideways and its height barely changes, so the rate falls to zero.`,
          visual: curveFig({ fn: `${R}*sin(x)`, x: [-0.2, 3.4], y: [-1.5, R * 1.3], xlabel: 'θ (rad)', ylabel: 'y (m)', domain: [0, Math.PI], points: [{ x: d * D, y: R * Math.sin(d * D), color: 'gold', label: `${d}°` }], caption: t`The cab’s height against the arm’s angle, over half a turn. The arm’s length is constant; only the angle changes.` }),
        };
      },
    }),
    mcq({
      id: 'shm', difficulty: 2,
      prompt: t`Which function satisfies $y'' = -y$, the equation of a simple harmonic oscillator?`,
      visual: {
        type: 'graph',
        params: { x: [-0.3, 6.6], y: [-1.5, 1.5], aspect: 'wide', curves: [{ fn: 'sin(x)', color: 'accent', label: 'sin x', labelAt: 1.2, labelDy: -14 }, { fn: '-sin(x)', color: 'bad', dash: true, label: '(sin x)″ = −sin x', labelAt: 4.1, labelDy: -14 }] },
        caption: t`A sine and its second derivative: each is the other turned upside down. The choices are to be tested the same way.`,
      },
      choices: [t`$y = 3\sin x - 2\cos x$`, t`$y = \sin x + x$`, t`$y = x\sin x$`, t`$y = \sin x\cos x$`],
      answer: 0,
      why: {
        1: t`$(\sin x + x)'' = -\sin x$, but $-y = -\sin x - x$: the $x$ term has second derivative $0$, not $-x$.`,
        2: t`$(x\sin x)'' = 2\cos x - x\sin x$: the product rule leaves an extra $2\cos x$.`,
        3: t`$\sin x\cos x = \frac12\sin 2x$, and its second derivative is $-2\sin 2x = -4y$ — it oscillates twice as fast.`,
      },
      hints: [t`Differentiate each candidate twice. $(\sin x)'' = -\sin x$ and $(\cos x)'' = -\cos x$.`],
      teach: t`Sine and cosine both return to minus themselves after two derivatives, so any combination $A\sin x + B\cos x$ solves $y'' = -y$.`,
      explain: t`$y' = 3\cos x + 2\sin x$ and $y'' = -3\sin x + 2\cos x = -y$. ✓ This is the general solution of the oscillator equation (with angular frequency $1$ rad/s when $x$ is time in seconds).`,
    }),
    mcq({
      id: 'find-error-product', difficulty: 3, kind: 'error',
      prompt: t`A student writes

$$\frac{d}{dx}(\sin x\cos x) = (\cos x)(-\sin x) = -\sin x\cos x.$$

What is wrong?`,
      visual: curveFig({ fn: 'sin(x)*cos(x)', x: [-3.2, 3.2], y: [-0.8, 0.8], at: 0, f: (x) => Math.sin(x) * Math.cos(x), df: (x) => Math.cos(2 * x), span: 0.5, caption: t`$y = \sin x\cos x$ and its tangent at $x = 0$, which climbs with slope $1$. The student’s formula gives $0$ there.` }),
      choices: [
        t`The derivative of a product is not the product of the derivatives; the answer is $\cos^2 x - \sin^2 x$`,
        t`The derivative of $\cos x$ is $+\sin x$, so the answer is $\sin x\cos x$`,
        t`Nothing — the answer $-\sin x\cos x$ is right`,
        t`The angle must be converted to degrees before differentiating`,
      ],
      answer: 0,
      why: {
        1: t`$(\cos x)' = -\sin x$ is right; the error is in how the two derivatives were combined.`,
        2: t`At $x = 0$ the graph climbs with slope $1$, but $-\sin 0\cos 0 = 0$. The formula fails the simplest check.`,
        3: t`Degrees would only add factors of $\pi/180$; the rules are cleanest in radians, and the slip is elsewhere.`,
      },
      hints: [t`Test the student’s answer at $x = 0$ against the tangent in the picture.`, t`Apply $(uv)' = u'v + uv'$ with $u = \sin x$, $v = \cos x$.`],
      teach: t`$(uv)' = u'v + uv'$ — never $u'v'$.`,
      explain: t`$(\sin x\cos x)' = \cos x\cdot\cos x + \sin x\cdot(-\sin x) = \cos^2 x - \sin^2 x = \cos 2x$, which is $1$ at $x = 0$, matching the tangent.`,
    }),
  ],
  checkpoint: [
    expr({
      id: 'cp-sinc', difficulty: 3,
      prompt: t`The amplitude of light diffracted by a single slit follows $f(x) = \dfrac{\sin x}{x}$. Find $f'(x)$ for $x \ne 0$.`,
      lhs: t`f'(x)`,
      answer: '(x*cos(x) - sin(x))/x^2', answerTeX: t`\frac{x\cos x - \sin x}{x^2}`,
      vars: { x: [0.5, 3] }, derivativeOf: 'sin(x)/x',
      errors: [{ answer: '(sin(x) - x*cos(x))/x^2', feedback: t`The quotient rule’s numerator is $u'v - uv'$ — top’s derivative first: $\cos x\cdot x - \sin x\cdot 1$.` }, { answer: 'cos(x)', feedback: t`You differentiated top and bottom separately. Use $\left(\frac{u}{v}\right)' = \frac{u'v - uv'}{v^2}$.` }],
      hints: [t`$u = \sin x$, $v = x$: so $u' = \cos x$ and $v' = 1$.`, t`$\dfrac{u'v - uv'}{v^2} = \dfrac{x\cos x - \sin x}{x^2}$.`],
      teach: t`The quotient rule with a trigonometric numerator: $\left(\frac{u}{v}\right)' = \frac{u'v - uv'}{v^2}$.`,
      explain: t`$f'(x) = \dfrac{x\cos x - \sin x}{x^2}$. Its zeros, where $\tan x = x$, mark the side maxima of the diffraction pattern.`,
      visual: curveFig({ fn: 'sin(x)/x', x: [-12, 12], y: [-0.4, 1.15], caption: t`$y = \sin x / x$, the slit’s amplitude pattern ($x$ is a scaled angle). Its value at $0$ is the limit $1$.` }),
    }),
    num({
      id: 'cp-panel', difficulty: 3, transfer: true,
      gen(r) {
        const P0 = r.pick([800, 1200, 1500, 2000]), d = r.pick([20, 30, 40, 50, 60]);
        const perRad = -P0 * Math.sin(d * D), ans = perRad * D;
        return {
          prompt: t`A spacecraft’s solar array gives $P = P_0\cos\theta$ watts when tilted $\theta$ away from the Sun, with $P_0 = ${P0}$ W. At $\theta = ${d}^\circ$, at what rate does its power change with tilt? Give $\dfrac{dP}{d\theta}$ in watts per **degree**.`,
          answer: ans, units: 'W/deg', tol: { rel: 0.005 },
          errors: [{ value: perRad, feedback: t`That is per radian. One degree is $\pi/180$ rad, so multiply by $\pi/180$.` }, { value: -P0 * Math.cos(d * D) * D, feedback: t`$\frac{d}{d\theta}\cos\theta = -\sin\theta$, not $-\cos\theta$.` }],
          hints: [t`$\dfrac{dP}{d\theta} = -P_0\sin\theta$ per radian.`, t`Per degree: multiply by $\dfrac{\pi}{180}$.`],
          teach: t`Differentiate in radians, then convert the rate to the angle unit you need.`,
          explain: t`$-P_0\sin\theta = -${P0}\times${nice(Math.sin(d * D), 4)} = ${nice(perRad, 4)}$ W/rad, so $${nice(perRad, 4)}\times\dfrac{\pi}{180} = ${nice(ans, 3)}$ W per degree.`,
          visual: curveFig({ fn: `${P0}*cos(pi*x/180)`, x: [-4, 94], y: [-0.08 * P0, 1.12 * P0], xlabel: 'θ (degrees)', ylabel: 'P (W)', domain: [0, 90], points: [{ x: d, y: P0 * Math.cos(d * D), color: 'gold', label: `${d}°` }], caption: t`The ideal cosine law for a flat array. Real cells lose extra power at steep tilts, as more light is reflected from the cover glass.` }),
        };
      },
    }),
    mcq({
      id: 'cp-horizontal', difficulty: 2,
      prompt: t`On $0 \le x \le \pi$, where is the tangent to $y = \sin x + \cos x$ horizontal?`,
      visual: { type: 'graph', params: { x: [-0.2, 3.4], y: [-1.3, 1.7], aspect: 'wide', curves: [{ fn: 'sin(x) + cos(x)', color: 'accent', domain: [0, 'pi'] }] }, caption: t`$y = \sin x + \cos x$ on $[0, \pi]$.` },
      choices: [t`$x = \pi/4$`, t`$x = 3\pi/4$`, t`$x = \pi/2$`, t`$x = 0$`],
      answer: 0,
      why: {
        1: t`At $3\pi/4$ the function itself is $0$; a horizontal tangent needs the *derivative* to be $0$.`,
        2: t`At $\pi/2$ the sine alone has a flat top, but the cosine is still falling with slope $-1$ there.`,
        3: t`At $0$ the slope is $\cos 0 - \sin 0 = 1$: the curve is still climbing.`,
      },
      hints: [t`Set $y' = \cos x - \sin x$ equal to $0$.`],
      teach: t`A horizontal tangent is where the derivative is zero.`,
      explain: t`$\cos x - \sin x = 0$ means $\tan x = 1$, so $x = \pi/4$, where $y = \sqrt2$ — the top of the curve.`,
    }),
  ],
  sources: [{ label: 'OpenStax Calculus Vol. 1, §3.5 Derivatives of trigonometric functions', url: 'https://openstax.org/books/calculus-volume-1/pages/3-5-derivatives-of-trigonometric-functions' }],
});
