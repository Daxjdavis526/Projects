// Derivatives of inverse functions — reflect a graph in y = x and every slope
// turns into its reciprocal; arcsin, arctan and friends follow.
import { lesson, mcq, num, expr } from '../../src/core/content.js';
import { nice } from '../../src/core/format.js';
import { N, curveFig, fitY, lineAt } from './_c1kit.js';

const t = String.raw;
const DEG = 180 / Math.PI;

// f and its inverse on one picture: the curve, its mirror image in y = x,
// and the two corresponding points P (on f) and Q (on the inverse)
function mirrorFig({ fs, f, a, x, caption, tangents = false, df }) {
  const b = f(a);
  const curves = [
    { fn: fs, color: 'accent', domain: x, label: 'f', labelAt: x[1] * 0.55, labelDx: 8, labelDy: 4 },
    { param: [fs.replace(/x/g, 't'), 't'], t: x, color: 'violet', label: 'f⁻¹', labelAt: x[1] * 0.55, labelDx: 8 },
    { fn: 'x', color: 'ink3', dash: true, width: 1.2 },
  ];
  if (tangents) {
    const m = df(a);
    curves.push({ fn: lineAt(a, b, m), color: 'gold', dash: true, width: 1.6, domain: [a - 0.6, a + 0.6] });
    curves.push({ fn: lineAt(b, a, 1 / m), color: 'gold', dash: true, width: 1.6, domain: [b - 0.6 * m, b + 0.6 * m] });
  }
  return {
    type: 'graph',
    params: { x: [-1, Math.max(b, a) + 1.5], y: [-1, Math.max(b, a) + 1.5], equal: true, curves, points: [{ x: a, y: b, color: 'accent', label: 'P' }, { x: b, y: a, color: 'violet', label: 'Q' }] },
    caption,
  };
}

export default lesson({
  id: 'math1210.C1-3.9',
  title: 'Derivatives of inverse functions',
  minutes: 9, difficulty: 3,
  intro: t`An inverse function undoes $f$: if $f(a) = b$ then $f^{-1}(b) = a$, and its graph is the graph of $f$ reflected in the line $y = x$. Reflection swaps rise and run, so **every slope becomes its reciprocal**:

$$\big(f^{-1}\big)'(b) = \frac{1}{f'(a)}, \qquad \text{where } b = f(a)$$

That rule, applied to the trigonometric functions, gives the derivatives of the inverse trigonometric functions: $\dfrac{d}{dx}\arcsin x = \dfrac{1}{\sqrt{1 - x^2}}$, $\dfrac{d}{dx}\arctan x = \dfrac{1}{1 + x^2}$, and $\dfrac{d}{dx}\operatorname{arcsec} x = \dfrac{1}{|x|\sqrt{x^2 - 1}}$. Angles computed from measured lengths — an elevation from a height and a distance, a heading from two velocity components — are inverse trigonometric functions, and so are their rates.`,
  symbols: [
    { tex: 'f^{-1}', text: 'the inverse function: $f^{-1}(b)$ is the input that $f$ maps to $b$. It is **not** $1/f$' },
    { tex: 'a', text: 'a point in the domain of $f$' },
    { tex: 'b = f(a)', text: 'the matching point in the domain of $f^{-1}$' },
    { tex: "f'(a)", text: 'the slope of $f$ at $a$, which must be nonzero' },
    { tex: '\\arcsin,\\ \\arctan', text: 'the inverse sine and inverse tangent, returning angles in radians (also written $\\sin^{-1}$, $\\tan^{-1}$)' },
  ],
  why: t`Every time you turn a measurement back into the quantity that produced it — an angle from its tangent, a speed from a rapidity, a time from a decayed amount — you are using an inverse function, and its derivative tells you how errors and rates carry over.`,
  visual: {
    type: 'graph',
    title: 'Reflected graphs, reciprocal slopes',
    lead: t`The blue curve is $y = \sin x$ on $[-\pi/2, \pi/2]$, the violet curve its reflection $y = \arcsin x$. The slider moves a point $P$ on the sine and its mirror image $Q$ on the arcsine. The gold lines are the tangents at both.`,
    tasks: [
      t`Check that the two slopes always multiply to $1$.`,
      t`Slide toward the end of the sine, $x \to \pi/2$: the sine flattens, and the arcsine’s tangent turns vertical — its slope $1/\sqrt{1 - x^2}$ blows up at $x = 1$.`,
      t`At the centre both slopes are $1$: there the curve is its own reflection, to first order.`,
    ],
    params: {
      x: [-1.8, 1.8], y: [-1.8, 1.8], equal: true,
      sliders: [{ key: 'p', label: 'Position of P', min: -1.45, max: 1.45, step: 0.01, value: 1.2, unit: t`\text{rad}`, explain: t`The angle $a$ of the point $P = (a, \sin a)$ on the sine; its mirror image is $Q = (\sin a, a)$.` }],
      curves: [
        { fn: 'sin(x)', color: 'accent', domain: [-Math.PI / 2, Math.PI / 2], label: 'sin', labelAt: -1.2, labelDx: -4, labelDy: 18 },
        { fn: 'asin(x)', color: 'violet', domain: [-1, 1], label: 'arcsin', labelAt: -0.97, labelDx: 10, labelDy: 6 },
        { fn: 'x', color: 'ink3', dash: true, width: 1.2 },
        { fn: 'sin(p) + cos(p)*(x - p)', color: 'gold', width: 1.8, domain: ['p - 0.45', 'p + 0.45'] },
        { fn: 'p + (x - sin(p))/cos(p)', color: 'gold', width: 1.8, domain: ['sin(p) - 0.45*cos(p)', 'sin(p) + 0.45*cos(p)'] },
      ],
      points: [{ x: 'p', y: 'sin(p)', color: 'accent', label: 'P', labelDx: 8, labelDy: 18 }, { x: 'sin(p)', y: 'p', color: 'violet', label: 'Q', labelDx: -10, labelAlign: 'right' }],
      readouts: [
        { label: t`slope of sin at P`, expr: 'cos(p)', digits: 4 },
        { label: t`slope of arcsin at Q`, expr: '1/cos(p)', digits: 4 },
        { label: 'product', expr: 'cos(p)/cos(p)', digits: 3 },
        { label: t`$1/\sqrt{1 - x^2}$ at Q`, expr: '1/sqrt(1 - sin(p)^2)', digits: 4 },
      ],
    },
    caption: t`Both axes share one scale, so the reflection in the dashed line $y = x$ is a true mirror image. Restricting the sine to $[-\pi/2, \pi/2]$ is what makes it invertible.`,
  },
  example: {
    prompt: t`Derive $\dfrac{d}{dx}\arcsin x$ for $-1 < x < 1$.`,
    visual: curveFig({ fn: 'asin(x)', x: [-1.6, 1.6], y: [-1.85, 1.85], domain: [-1, 1], color: 'violet', at: 0.6, f: Math.asin, df: (x) => 1 / Math.sqrt(1 - x * x), span: 0.3, caption: t`$y = \arcsin x$, with the tangent at $x = 0.6$, where the slope is $1/0.8 = 1.25$. The tangents turn vertical at $x = \pm1$.` }),
    steps: [
      { label: 'Undo the inverse', text: t`Let $y = \arcsin x$. Then $\sin y = x$, with $-\tfrac{\pi}{2} \le y \le \tfrac{\pi}{2}$.` },
      { label: 'Differentiate implicitly', text: t`$\cos y\,\dfrac{dy}{dx} = 1$, so $\dfrac{dy}{dx} = \dfrac{1}{\cos y}$ — the reciprocal of the sine’s slope, as the rule promises.` },
      { label: 'Write it in x', text: t`$\cos y = \sqrt{1 - \sin^2 y} = \sqrt{1 - x^2}$, taking the **positive** root because $\cos y \ge 0$ for $y$ in $[-\tfrac{\pi}{2}, \tfrac{\pi}{2}]$.` },
      { label: 'Conclude', text: t`$\dfrac{d}{dx}\arcsin x = \dfrac{1}{\sqrt{1 - x^2}}$.` },
      { label: 'Sense check', text: t`At $x = 0$ the slope is $1$, like the sine’s at $0$. As $x \to \pm 1$ it grows without bound — the vertical tangents in the picture. At $x = 0.6$: $1/\sqrt{0.64} = 1.25$.` },
    ],
    answer: t`$\dfrac{d}{dx}\arcsin x = \dfrac{1}{\sqrt{1 - x^2}}$ for $|x| < 1$.`,
  },
  practice: [
    num({
      id: 'inverse-at-point', difficulty: 2,
      gen(r) {
        const k = r.pick([1, 2, 3]), c = r.pick([0, 1, 2]), a = r.pick([1, 1.5]);
        const f = (x) => x ** 3 + k * x + c, df = (x) => 3 * x * x + k;
        const b = f(a), ans = 1 / df(a);
        return {
          prompt: t`Let $f(x) = x^3 + ${k === 1 ? '' : k}x${c ? t` + ${c}` : ''}$, which is increasing, so it has an inverse. Given $f(${a}) = ${nice(b)}$, find $\big(f^{-1}\big)'(${nice(b)})$.`,
          answer: ans, tol: { rel: 0.005 },
          errors: [{ value: df(a), feedback: t`That is $f'(${a})$, the slope of $f$ at $P$. The inverse’s slope at $Q$ is its reciprocal.` }, { value: 1 / df(b), feedback: t`That evaluates $f'$ at $${nice(b)}$. The slope of $f^{-1}$ at $${nice(b)}$ comes from $f'$ at the matching point $a = ${a}$.` }],
          hints: [t`$\big(f^{-1}\big)'(b) = \dfrac{1}{f'(a)}$ where $f(a) = b$ — here $a = ${a}$.`, t`$f'(x) = 3x^2 + ${k}$.`],
          teach: t`The slope of $f^{-1}$ at $b$ is $1/f'(a)$, with $f'$ evaluated at the matching point $a = f^{-1}(b)$.`,
          explain: t`$f'(${a}) = 3(${a})^2 + ${k} = ${nice(df(a))}$, so $\big(f^{-1}\big)'(${nice(b)}) = \dfrac{1}{${nice(df(a))}} = ${nice(ans, 4)}$. No formula for $f^{-1}$ was needed.`,
          visual: mirrorFig({ fs: `x^3 + ${k}*x + ${c}`, f, a, x: [-0.6, 2], caption: t`$f$ (blue) and $f^{-1}$ (violet), mirror images in $y = x$. $P = (${a}, ${nice(b)})$ on $f$ matches $Q = (${nice(b)}, ${a})$ on $f^{-1}$.` }),
        };
      },
    }),
    expr({
      id: 'arctan-kx', difficulty: 2,
      gen(r) {
        const k = r.pick([2, 3, 4, 5]);
        return {
          prompt: t`Find $\dfrac{d}{dx}\arctan(${k}x)$.`,
          lhs: t`\frac{d}{dx}\arctan(${k}x)`,
          answer: `${k}/(1 + ${k * k}x^2)`, answerTeX: t`\frac{${k}}{1 + ${k * k}x^2}`,
          vars: { x: [-1.5, 1.5] }, derivativeOf: `atan(${k}*x)`,
          errors: [
            { answer: `1/(1 + ${k * k}x^2)`, feedback: t`Multiply by the inner derivative, $${k}$.` },
            { answer: `${k}/(1 + ${k}x^2)`, feedback: t`The inside is squared whole: $(${k}x)^2 = ${k * k}x^2$.` },
          ],
          hints: [t`$\dfrac{d}{du}\arctan u = \dfrac{1}{1 + u^2}$, with $u = ${k}x$.`],
          teach: t`Inverse-trigonometric derivatives take the chain rule like any other: $\frac{d}{dx}\arctan(u) = \frac{u'}{1 + u^2}$.`,
          explain: t`$\dfrac{1}{1 + (${k}x)^2}\cdot ${k} = \dfrac{${k}}{1 + ${k * k}x^2}$ — steepest at $0$, slope $${k}$, and flattening toward the asymptotes $\pm\pi/2$.`,
          visual: curveFig({ fn: `atan(${k}*x)`, x: [-3, 3], y: [-2, 2], caption: t`$y = \arctan(${k}x)$, squeezed between its asymptotes $y = \pm\pi/2$.`, extra: { hlines: [{ y: Math.PI / 2, label: 'π/2' }, { y: -Math.PI / 2, label: '−π/2' }] } }),
        };
      },
    }),
    mcq({
      id: 'arccos', difficulty: 2,
      prompt: t`What is $\dfrac{d}{dx}\arccos x$ for $-1 < x < 1$?`,
      visual: curveFig({ fn: 'acos(x)', x: [-1.5, 1.5], y: [-0.4, 3.5], domain: [-1, 1], color: 'violet', at: 0, f: Math.acos, df: (x) => -1 / Math.sqrt(1 - x * x), span: 0.4, caption: t`$y = \arccos x$ falls from $\pi$ to $0$ across $[-1, 1]$.` }),
      choices: [t`$-\dfrac{1}{\sqrt{1 - x^2}}$`, t`$\dfrac{1}{\sqrt{1 - x^2}}$`, t`$\sec x\tan x$`, t`$-\dfrac{1}{1 + x^2}$`],
      answer: 0,
      why: {
        1: t`That is the derivative of $\arcsin x$. The arccosine falls, so its slope must be negative.`,
        2: t`That is the derivative of $\dfrac{1}{\cos x}$. $\arccos x$ (or $\cos^{-1}x$) is the inverse function, not the reciprocal.`,
        3: t`That is the derivative of $\operatorname{arccot} x$; the arccosine’s comes from $\sin y = \sqrt{1 - x^2}$.`,
      },
      hints: [t`Let $y = \arccos x$, so $\cos y = x$; differentiate implicitly.`],
      teach: t`$\arccos x = \frac{\pi}{2} - \arcsin x$, so its derivative is the arcsine’s with a minus sign.`,
      explain: t`$-\sin y\,y' = 1$ and $\sin y = \sqrt{1 - x^2} \ge 0$ for $y$ in $[0, \pi]$, so $y' = -\dfrac{1}{\sqrt{1 - x^2}}$: slope $-1$ at the centre, as in the picture.`,
    }),
    expr({
      id: 'arcsin-scaled', difficulty: 2,
      gen(r) {
        const a = r.pick([2, 3, 4, 5]);
        return {
          prompt: t`Find $\dfrac{d}{dx}\arcsin\left(\dfrac{x}{${a}}\right)$ for $|x| < ${a}$, and simplify.`,
          lhs: t`\frac{d}{dx}\arcsin\left(\frac{x}{${a}}\right)`,
          answer: `1/sqrt(${a * a} - x^2)`, answerTeX: t`\frac{1}{\sqrt{${a * a} - x^2}}`,
          vars: { x: [-0.8 * a, 0.8 * a] }, derivativeOf: `asin(x/${a})`,
          errors: [{ answer: `1/sqrt(1 - x^2/${a * a})`, feedback: t`You left out the inner derivative, $\frac{1}{${a}}$.` }, { answer: `1/sqrt(1 - x^2)`, feedback: t`That is the derivative of $\arcsin x$; here the inside is $x/${a}$.` }],
          hints: [t`$\dfrac{d}{dx}\arcsin u = \dfrac{u'}{\sqrt{1 - u^2}}$ with $u = \dfrac{x}{${a}}$.`, t`$\dfrac{1}{${a}}\cdot\dfrac{1}{\sqrt{1 - x^2/${a * a}}}$; bring the $${a}$ inside the root as $\sqrt{${a * a}}$.`],
          teach: t`$\frac{d}{dx}\arcsin\frac{x}{a} = \frac{1}{\sqrt{a^2 - x^2}}$ — the form that turns up in integrals over circles.`,
          explain: t`$\dfrac{1}{${a}}\cdot\dfrac{1}{\sqrt{1 - x^2/${a * a}}} = \dfrac{1}{\sqrt{${a * a}(1 - x^2/${a * a})}} = \dfrac{1}{\sqrt{${a * a} - x^2}}$.`,
          visual: curveFig({ fn: `asin(x/${a})`, x: [-a * 1.3, a * 1.3], y: [-1.9, 1.9], domain: [-a, a], color: 'violet', caption: t`$y = \arcsin(x/${a})$: the arcsine stretched to the interval $[-${a}, ${a}]$.` }),
        };
      },
    }),
    num({
      id: 'elevation', difficulty: 3,
      gen(r) {
        const d = r.pick([2, 3, 5]), h = r.pick([1, 2, 4, 6]);
        const perRad = d / (d * d + h * h), ans = perRad * DEG;
        return {
          prompt: t`A tracking camera stands $${d}$ km from a launch pad. When a rocket rising vertically above the pad is at altitude $h$, the camera’s elevation angle is $\theta = \arctan(h/${d})$. At $h = ${h}$ km, by how many **degrees** does $\theta$ grow per kilometre of climb?`,
          answer: ans, units: 'deg/km', tol: { rel: 0.005 },
          errors: [{ value: DEG / (1 + (h / d) ** 2), feedback: t`The inside is $h/${d}$: the chain rule adds a factor $\tfrac{1}{${d}}$ per kilometre.` }],
          hints: [t`$\dfrac{d\theta}{dh} = \dfrac{1}{1 + (h/${d})^2}\cdot\dfrac{1}{${d}} = \dfrac{${d}}{${d * d} + h^2}$ radians per km.`, t`Convert radians to degrees: multiply by $180/\pi$.`],
          teach: t`Rates of an angle computed with arctan come out in radians; convert at the end.`,
          explain: t`$\dfrac{d\theta}{dh} = \dfrac{${d}}{${d * d} + ${h * h}} = ${nice(perRad, 3)}$ rad/km $= ${nice(ans, 3)}^\circ$ per km. The higher the rocket, the less each kilometre turns the camera.`,
          visual: curveFig({ fn: `atan(x/${d})*180/pi`, x: [-0.4, 12.5], y: [-6, 100], xlabel: 'h (km)', ylabel: 'θ (degrees)', domain: [0, 12.5], points: [{ x: h, y: Math.atan(h / d) * DEG, color: 'gold', label: `${h} km` }], caption: t`The camera’s elevation angle against the rocket’s altitude, for a flat ground and a perfectly vertical climb.` }),
        };
      },
    }),
    mcq({
      id: 'find-error-reciprocal', difficulty: 3, kind: 'error',
      prompt: t`A student writes

$$\frac{d}{dx}\sin^{-1}x = \frac{d}{dx}(\sin x)^{-1} = -\frac{\cos x}{\sin^2 x}.$$

What is wrong?`,
      visual: curveFig({ fn: 'asin(x)', x: [-1.6, 1.6], y: [-1.85, 1.85], domain: [-1, 1], color: 'violet', at: 0.5, f: Math.asin, df: (x) => 1 / Math.sqrt(1 - x * x), span: 0.35, caption: t`$y = \sin^{-1}x$ rises everywhere. At $x = 0.5$ the student’s formula gives about $-3.8$.` }),
      choices: [
        t`$\sin^{-1}x$ means the inverse function $\arcsin x$, not $\dfrac{1}{\sin x}$; its derivative is $\dfrac{1}{\sqrt{1 - x^2}}$`,
        t`The derivative of $(\sin x)^{-1}$ is $-\dfrac{\cos x}{\sin x}$, not over $\sin^2 x$`,
        t`The angle must be in degrees for an inverse sine`,
        t`Nothing is wrong`,
      ],
      answer: 0,
      why: {
        1: t`$\frac{d}{dx}(\sin x)^{-1} = -\frac{\cos x}{\sin^2 x}$ is correct — for the reciprocal. The problem is that $\sin^{-1}x$ is not the reciprocal.`,
        2: t`Degrees would only add factors; the slip is in reading the notation.`,
        3: t`The graph rises, yet the formula is negative at $x = 0.5$. And $\csc x$ is not even defined at $x = 0$, where $\sin^{-1}$ is.`,
      },
      hints: [t`What does the $-1$ in $\sin^{-1}$ mean — a power, or an inverse?`, t`$\sin^{-1}x$ is the angle whose sine is $x$.`],
      teach: t`$f^{-1}$ is the inverse function, never $1/f$; $\sin^{-1}x = \arcsin x$, while $(\sin x)^{-1} = \csc x$.`,
      explain: t`$\sin^{-1}x = \arcsin x$, with derivative $\dfrac{1}{\sqrt{1 - x^2}}$ — at $x = 0.5$ that is $1.155$, the positive slope in the picture. The student differentiated $\csc x$.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-inverse', difficulty: 2,
      gen(r) {
        const k = r.pick([2, 3, 4]), a = r.pick([0, 1]);
        const f = (x) => x ** 5 + k * x + 1, df = (x) => 5 * x ** 4 + k;
        const b = f(a), ans = 1 / df(a);
        return {
          prompt: t`$f(x) = x^5 + ${k}x + 1$ is increasing everywhere. Find $\big(f^{-1}\big)'(${b})$.`,
          answer: ans, tol: { rel: 0.005 },
          errors: [{ value: df(a), feedback: t`That is $f'$ at the matching point; the inverse’s slope is its reciprocal.` }],
          hints: [t`First find $a$ with $f(a) = ${b}$ — try a small whole number.`],
          teach: t`Find the matching point $a = f^{-1}(b)$ by inspection, then take $1/f'(a)$.`,
          explain: t`$f(${a}) = ${b}$, so $a = ${a}$; $f'(${a}) = ${df(a)}$, and $\big(f^{-1}\big)'(${b}) = \dfrac{1}{${df(a)}} = ${nice(ans, 4)}$.`,
          visual: mirrorFig({ fs: `x^5 + ${k}*x + 1`, f, a, x: [-0.9, 1.25], caption: t`$f$ (blue) and $f^{-1}$ (violet), mirror images in $y = x$. $Q$ is the point of $f^{-1}$ in question.` }),
        };
      },
    }),
    num({
      id: 'cp-rapidity', difficulty: 3, transfer: true,
      gen(r) {
        const beta = r.pick([0.5, 0.6, 0.8, 0.9, 0.95]);
        const ans = 1 / (1 - beta * beta), gamma = 1 / Math.sqrt(1 - beta * beta);
        return {
          prompt: t`In special relativity a speed $\beta = v/c$ has a **rapidity** $\phi$ defined by $\beta = \tanh\phi$, so $\phi = \operatorname{artanh}\beta$. Given that $\dfrac{d}{d\phi}\tanh\phi = 1 - \tanh^2\phi$, find $\dfrac{d\phi}{d\beta}$ at $\beta = ${beta}$.`,
          answer: ans, tol: { rel: 0.005 },
          errors: [{ value: gamma, feedback: t`That is the Lorentz factor $\gamma = 1/\sqrt{1 - \beta^2}$. The inverse-function rule gives $1/(1 - \beta^2)$, which is $\gamma^2$.` }, { value: 1 - beta * beta, feedback: t`That is the slope of $\tanh$ itself. The inverse’s slope is the reciprocal.` }],
          hints: [t`$\dfrac{d\phi}{d\beta} = \dfrac{1}{d\beta/d\phi}$.`, t`$\dfrac{d\beta}{d\phi} = 1 - \tanh^2\phi = 1 - \beta^2$.`],
          teach: t`The inverse-function rule turns the slope of $\tanh$ into the slope of $\operatorname{artanh}$ without a formula for it.`,
          explain: t`$\dfrac{d\phi}{d\beta} = \dfrac{1}{1 - \beta^2} = \dfrac{1}{${nice(1 - beta * beta)}} = ${nice(ans, 4)}$ — that is $\gamma^2$. Near light speed a small gain in $\beta$ costs a large gain in rapidity, which is why $c$ can never be reached.`,
          visual: curveFig({ fn: '0.5*ln((1 + x)/(1 - x))', x: [-0.05, 1.05], y: [-0.2, 3.4], xlabel: 'β = v/c', ylabel: 'rapidity φ', domain: [0, 0.998], points: [{ x: beta, y: Math.atanh(beta), color: 'gold', label: `β = ${beta}` }], caption: t`Rapidity against speed. Rapidities of collinear boosts simply add; speeds do not. As $\beta \to 1$ the rapidity grows without bound.`, extra: { vlines: [{ x: 1, label: 'c' }] } }),
        };
      },
    }),
    expr({
      id: 'cp-arctan-x2', difficulty: 2,
      prompt: t`Find $\dfrac{d}{dx}\arctan\left(x^2\right)$.`,
      lhs: t`\frac{d}{dx}\arctan(x^2)`,
      answer: '2x/(1 + x^4)', answerTeX: t`\frac{2x}{1 + x^4}`,
      vars: { x: [-1.5, 1.5] }, derivativeOf: 'atan(x^2)',
      errors: [{ answer: '1/(1 + x^4)', feedback: t`Multiply by the inner derivative, $2x$.` }, { answer: '2x/(1 + x^2)', feedback: t`The $u^2$ in $\frac{1}{1+u^2}$ is $(x^2)^2 = x^4$.` }],
      hints: [t`$u = x^2$; $\dfrac{d}{dx}\arctan u = \dfrac{u'}{1 + u^2}$.`],
      teach: t`$\frac{d}{dx}\arctan u = \frac{u'}{1 + u^2}$, with $u^2$ the square of the whole inside.`,
      explain: t`$\dfrac{2x}{1 + (x^2)^2} = \dfrac{2x}{1 + x^4}$: zero at the minimum $x = 0$, and an odd function, as the even curve requires.`,
      visual: curveFig({ fn: 'atan(x^2)', x: [-3, 3], y: [-0.3, 1.9], caption: t`$y = \arctan(x^2)$: even, with its minimum at $0$, rising toward $\pi/2$.` }),
    }),
  ],
  sources: [{ label: 'OpenStax Calculus Vol. 1, §3.7 Derivatives of inverse functions', url: 'https://openstax.org/books/calculus-volume-1/pages/3-7-derivatives-of-inverse-functions' }],
});
