// Variation of parameters: y_p = u₁y₁ + u₂y₂ with u′ from Cramer's rule and the
// Wronskian, for any continuous forcing — sec t, tan t, eᵗ/t, ln t — that
// undetermined coefficients cannot handle; the standard-form trap; and the
// Duhamel integral y(t) = ∫ sin ω(t − s)/ω · g(s) ds: a response built from
// impulse responses (residual vibration after a thruster pulse).
import { lesson, mcq, num, expr } from '../../src/core/content.js';
import { nice, fmt, frac } from '../../src/core/format.js';
import { r6, co, sg, lead } from './_second.js';

const t = String.raw;

/** The Explore's forcing, chosen by G: 1 a 2 s pulse, 2 a decaying 1/(1 + t), 3 the resonant cos t. */
const GX = (s) => `(step(1.5 - G)*(step(${s}) - step(${s} - 2)) + step(G - 1.5)*step(2.5 - G)/(1 + ${s}) + step(G - 2.5)*cos(${s}))`;
const SK = '(k + 0.5)*0.05';

export default lesson({
  id: 'math2280.DE-3.4',
  title: 'Variation of parameters',
  minutes: 14, difficulty: 3,
  intro: t`Undetermined coefficients needs a forcing whose derivatives keep repeating. **Variation of parameters** works for any continuous forcing — $\sec t$, $\ln t$, a measured thrust curve. Let the constants of $y_c = c_1y_1 + c_2y_2$ vary: try $y_p = u_1y_1 + u_2y_2$, demand $u_1'y_1 + u_2'y_2 = 0$, and the equation leaves $u_1'y_1' + u_2'y_2' = g$. Solving these two by Cramer’s rule — whose determinant is the Wronskian — gives

$$y_p = -y_1\int\frac{y_2\,g}{W}\,dt + y_2\int\frac{y_1\,g}{W}\,dt,$$

where $g$ is the forcing **after** the equation is divided by the coefficient of $y''$. For $y'' + \omega^2y = g$ from rest it becomes $y(t) = \displaystyle\int_0^t\frac{\sin\omega(t - s)}{\omega}\,g(s)\,ds$: the response is a sum of the ringing left by every slice of the push.`,
  symbols: [
    { tex: 'y_1,\\ y_2', text: 'a fundamental set of the homogeneous equation $y\'\' + p\\,y\' + q\\,y = 0$' },
    { tex: 'W', text: 'their Wronskian $y_1y_2\' - y_1\'y_2$, never zero on the interval' },
    { tex: 'g(t)', text: 'the forcing in **standard form** — divided by the coefficient of $y\'\'$' },
    { tex: 'u_1,\\ u_2', text: 'the varying “constants”: $u_1\' = -y_2g/W$ and $u_2\' = y_1g/W$' },
    { tex: 's', text: 'the integration variable: the moment at which each slice of forcing acts' },
    { tex: '\\frac{\\sin\\omega(t - s)}{\\omega}', text: 'the response at time $t$ to a unit kick at time $s$ — the **impulse response**, or Green’s function, of $y\'\' + \\omega^2y$' },
  ],
  why: t`It is the general method — it even works for variable coefficients once $y_1$ and $y_2$ are known — and its integral form, a response built from impulse responses, is the convolution that Laplace transforms (DE-6) and every linear instrument’s transfer function rest on.`,
  visual: {
    type: 'graph',
    title: 'A response built from kicks',
    lead: t`An undamped oscillator $y'' + y = g(t)$, at rest until $t = 0$. Each slice of the push, at time $s$, leaves the oscillator ringing as $\sin(t - s)\,g(s)\,ds$; the response at time $T$ is the area under the violet curve $\sin(T - s)\,g(s)$ from $0$ to $T$ — shaded blue where it adds and red where it subtracts. Move $T$ and watch the area become the blue response curve.`,
    tasks: [
      t`Thruster pulse: slide $T$ from 0 to 2. While the thruster fires the integrand is mostly positive and $y$ climbs. After it stops, the kernel just sweeps across the finished pulse and $y$ rings with amplitude $2\sin 1 \approx 1.68$.`,
      t`Choose $\cos t$, a push at the natural frequency: $\sin(T - s)\cos s$ keeps a positive average, so the area — and $y$ — grows like $\tfrac{T}{2}\sin T$, the resonance of DE-3.3.`,
      t`Choose $1/(1 + t)$: undetermined coefficients has no guess for it, but the integral works just the same.`,
    ],
    params: {
      x: [0, 12], y: [-6.5, 6.5], aspect: 'wide', xlabel: 't, s', ylabel: '',
      choices: [{ key: 'G', label: 'Forcing $g(t)$', options: [[1, 'Thruster pulse, 0 < t < 2'], [2, '1/(1 + t)'], [3, 'cos t (resonant)']], value: 1, explain: 'The push per unit mass, starting at t = 0.' }],
      sliders: [{ key: 'T', label: 'Time $T$', min: 0, max: 12, step: 0.05, value: 3, explain: 'The moment at which the response is evaluated: the integral runs over the push from 0 to $T$.' }],
      shade: [
        { fn: `max(sin(T - x)*${GX('x')}, 0)`, from: 0, to: 'T', color: 'accent', alpha: 0.3 },
        { fn: `min(sin(T - x)*${GX('x')}, 0)`, from: 0, to: 'T', color: 'bad', alpha: 0.3 },
      ],
      curves: [
        { fn: GX('x'), color: 'gold', width: 1.8, dash: true, label: 'g', labelAt: 0.5, labelDx: 4, labelDy: -10 },
        { fn: `sin(T - x)*${GX('x')}`, domain: [0, 'T'], color: 'violet', width: 1.6 },
        { sum: `0.05*sin(x - ${SK})*${GX(SK)}*step(x - ${SK})`, k: [0, 239], color: 'accent', width: 2.6 },
      ],
      vlines: [{ x: 'T', label: 'T', color: 'ink3' }],
      integral: { fn: `sin(T - x)*${GX('x')}`, from: 0, to: 'T' },
      readouts: [{ label: '$y(T)$ = shaded area', expr: 'integral', digits: 3 }],
    },
    caption: t`Gold, dashed: the forcing. Violet: the integrand $\sin(T - s)\,g(s)$ for the current $T$. Blue: the response $y(t)$, computed as a sum of 240 thin kicks; the readout integrates numerically. No damping.`,
  },
  example: {
    prompt: t`Solve $y'' + y = \sec t$ on $-\tfrac{\pi}{2} < t < \tfrac{\pi}{2}$, with $y(0) = 0$ and $y'(0) = 0$.`,
    visual: {
      type: 'graph',
      params: {
        x: [-1.6, 1.6], y: [-0.6, 4], aspect: 'wide', xlabel: 't', ylabel: '',
        curves: [
          { fn: '1/cos(x)', domain: [-1.33, 1.33], color: 'gold', width: 2, dash: true, label: 'sec t', labelAt: 1.1, labelDx: -50, labelDy: -4 },
          { fn: 'cos(x)*ln(cos(x)) + x*sin(x)', domain: [-1.5707, 1.5707], color: 'accent', width: 2.6, label: 'y(t)', labelAt: 1.35, labelDx: 6, labelDy: 14 },
        ],
        vlines: [{ x: -1.5708, label: '−π/2' }, { x: 1.5708, label: 'π/2' }],
      },
      caption: t`The forcing $\sec t$ (dashed) blows up at $\pm\pi/2$; the solution stays finite, rising to $\pi/2$ at the ends of the interval.`,
    },
    steps: [
      { label: 'Why not guess', text: t`The derivatives of $\sec t$ — $\sec t\tan t$, $\sec t\tan^2 t + \sec^3 t$, … — never close up into a finite family, so undetermined coefficients has no guess to make.` },
      { label: 'Fundamental set', text: t`$y_1 = \cos t$, $y_2 = \sin t$, with $W = \cos^2 t + \sin^2 t = 1$. The equation is in standard form, so $g = \sec t$.` },
      { label: 'The u′', text: t`$u_1' = -\dfrac{y_2\,g}{W} = -\sin t\sec t = -\tan t$, so $u_1 = \ln|\cos t|$. $u_2' = \dfrac{y_1\,g}{W} = \cos t\sec t = 1$, so $u_2 = t$.` },
      { label: 'Particular solution', text: t`$y_p = u_1y_1 + u_2y_2 = \cos t\,\ln(\cos t) + t\sin t$ (with $\cos t > 0$ on the interval).` },
      { label: 'Fit the start', text: t`$y_p(0) = 0$, and $y_p' = -\sin t\ln\cos t - \sin t + \sin t + t\cos t$ gives $y_p'(0) = 0$. So the initial conditions need no $y_c$ at all: $y = y_p$.` },
      { label: 'Sense check', text: t`Substituting: $y_p'' + y_p = \sec t$ ✓ (any constants of integration in $u_1$, $u_2$ would only add $c_1\cos t + c_2\sin t$). The theorem promised a solution on the whole interval where $\sec t$ is continuous, and that is exactly where this one lives.` },
    ],
    answer: t`$y = \cos t\,\ln(\cos t) + t\sin t$`,
  },
  practice: [
    mcq({
      id: 'when-vop', difficulty: 2,
      prompt: t`For $y'' + 4y' + 3y = g(t)$, which forcing can undetermined coefficients **not** handle?`,
      choices: [t`$\ln t$`, t`$t^2e^{-t}$`, t`$e^{t}\cos 3t$`, t`$t\sin t$`],
      answer: 0,
      why: {
        1: t`Its derivatives stay among $t^2e^{-t}$, $te^{-t}$, $e^{-t}$ — a finite family, so a guess exists (with an extra $t$, since $-1$ is a root).`,
        2: t`Derivatives of $e^t\cos 3t$ stay among $e^t\cos 3t$ and $e^t\sin 3t$: guess $e^t(A\cos 3t + B\sin 3t)$.`,
        3: t`Its derivatives stay among $t\sin t$, $t\cos t$, $\sin t$, $\cos t$: guess $(At + B)\cos t + (Ct + D)\sin t$.`,
      },
      hints: ['Undetermined coefficients works only when the forcing and all its derivatives fit in a finite list of functions.', t`Differentiate $\ln t$ a few times: $1/t$, $-1/t^2$, $2/t^3$, …`],
      teach: 'Undetermined coefficients needs a forcing whose derivatives span a finite family; for anything else, use variation of parameters.',
      explain: t`$\ln t$ differentiates to $1/t$, $-1/t^2$, $2/t^3$, … — new functions for ever, so no finite guess can match it. Variation of parameters handles it, as an integral.`,
      visual: {
        type: 'graph',
        params: {
          x: [0, 4], y: [-3, 3], aspect: 'wide', xlabel: 't', ylabel: '',
          curves: [
            { fn: 'ln(x)', domain: [0.05, 4], color: 'accent', label: 'ln t', labelAt: 3.3, labelDx: 4, labelDy: -10 },
            { fn: '1/x', domain: [0.34, 4], color: 'violet', label: '1/t', labelAt: 2.6, labelDx: 4, labelDy: -8 },
            { fn: '-1/x^2', domain: [0.58, 4], color: 'teal', label: '−1/t²', labelAt: 1.1, labelDx: 6, labelDy: 14 },
            { fn: '2/x^3', domain: [0.88, 4], color: 'warn', label: '2/t³', labelAt: 1.05, labelDx: 8, labelDy: -4 },
          ],
        },
        caption: t`$\ln t$ and its first three derivatives: each one is a new kind of function, so the list never closes.`,
      },
    }),
    expr({
      id: 'u2-prime', difficulty: 2,
      prompt: t`For $y'' - 3y' + 2y = \dfrac{e^{3t}}{1 + e^t}$ the fundamental set is $y_1 = e^t$, $y_2 = e^{2t}$. Find $u_2'(t)$, the derivative of the coefficient that multiplies $y_2$.`,
      answer: 'e^t/(1 + e^t)', answerTeX: t`\dfrac{e^t}{1 + e^t}`, lhs: "u_2'(t)",
      vars: { t: [-1, 1] },
      errors: [
        { answer: 'e^(4t)/(1 + e^t)', feedback: t`Divide by the Wronskian: $W = e^t\cdot2e^{2t} - e^t\cdot e^{2t} = e^{3t}$.` },
        { answer: '-e^(2t)/(1 + e^t)', feedback: t`That is $u_1' = -y_2g/W$. For $u_2'$ use $y_1$: $u_2' = y_1g/W$.` },
      ],
      hints: [t`$W = y_1y_2' - y_1'y_2 = e^t\cdot2e^{2t} - e^t\cdot e^{2t}$.`, t`$u_2' = \dfrac{y_1\,g}{W} = \dfrac{e^t}{e^{3t}}\cdot\dfrac{e^{3t}}{1 + e^t}$.`],
      teach: 'u₂′ = y₁g/W and u₁′ = −y₂g/W: each coefficient’s derivative uses the other solution, divided by the Wronskian.',
      explain: t`$W = e^{3t}$, so $u_2' = \dfrac{e^t\cdot e^{3t}/(1 + e^t)}{e^{3t}} = \dfrac{e^t}{1 + e^t}$, and $u_2 = \ln(1 + e^t)$. Carrying on gives $y_p = (e^t + e^{2t})\ln(1 + e^t)$ (after dropping a multiple of $e^{2t}$).`,
      visual: {
        type: 'graph',
        params: {
          x: [-2, 1.2], y: [-0.5, 6], aspect: 'wide', xlabel: 't', ylabel: '',
          curves: [
            { fn: 'exp(x)', color: 'ink3', width: 1.4, dash: true, label: 'y₁ = eᵗ', labelAt: 0.6, labelDx: 8, labelDy: 8 },
            { fn: 'exp(2x)', color: 'ink3', width: 1.4, dash: true, label: 'y₂ = e²ᵗ', labelAt: 0.75, labelDx: -66, labelDy: -6 },
            { fn: 'exp(3x)/(1 + exp(x))', color: 'accent', width: 2.4, label: 'g(t)', labelAt: 1.05, labelDx: 8, labelDy: 0 },
          ],
        },
        caption: 'The forcing (blue) and the fundamental set (dashed). A ratio of exponentials: no finite guess fits it.',
      },
    }),
    expr({
      id: 'et-over-t', difficulty: 3,
      prompt: t`Solve $y'' - 2y' + y = \dfrac{e^t}{t}$ for $t > 0$, with $y(1) = 0$ and $y'(1) = 0$.`,
      answer: 'e^t*(t*ln(t) + 1 - t)', answerTeX: t`e^t\,(t\ln t + 1 - t)`, lhs: 'y(t)',
      vars: { t: [0.5, 3] },
      errors: [{ answer: 't*e^t*ln(t)', feedback: t`That is a particular solution, but its slope at $t = 1$ is $e$, not 0. Add $c_1e^t + c_2te^t$ and fit both conditions.` }],
      hints: [t`$y_1 = e^t$, $y_2 = te^t$ (a double root), $W = e^{2t}$. Then $u_1' = -\dfrac{te^t\cdot e^t/t}{e^{2t}} = -1$ and $u_2' = \dfrac{e^t\cdot e^t/t}{e^{2t}} = \dfrac1t$.`, t`$u_1 = -t$, $u_2 = \ln t$, so $y_p = -te^t + te^t\ln t$. Add $c_1e^t + c_2te^t$, and use $y(1) = 0$, $y'(1) = 0$.`],
      teach: 'Variation of parameters gives a particular solution; the initial conditions then fix the homogeneous part, as always.',
      explain: t`$y_p = te^t\ln t - te^t$. With $y = y_p + c_1e^t + c_2te^t$: $y(1) = e(-1 + c_1 + c_2) = 0$ and $y'(1) = e(-1 + c_1 + 2c_2) = 0$, so $c_2 = 0$ and $c_1 = 1$. So $y = e^t(t\ln t + 1 - t)$.`,
      visual: {
        type: 'graph',
        params: {
          x: [0, 3], y: [-1, 12], aspect: 'wide', xlabel: 't', ylabel: '',
          curves: [{ fn: 'exp(x)/x', domain: [0.2, 3], color: 'accent', width: 2.4, label: 'eᵗ / t', labelAt: 2.4, labelDx: -40, labelDy: -10 }],
          vlines: [{ x: 1, label: 't = 1', color: 'gold' }],
        },
        caption: t`The forcing $e^t/t$: it blows up at $t = 0$, so the solution lives on $t > 0$. The initial data are given at $t = 1$ (gold).`,
      },
    }),
    num({
      id: 'standard-form', difficulty: 3,
      prompt: t`For $t > 0$, $t^2y'' - 2t\,y' + 2y = t^3$ has the fundamental set $y_1 = t$, $y_2 = t^2$ (with $W = t^2$). Use variation of parameters to solve it with $y(1) = 0$ and $y'(1) = 0$, and give $y(2)$.`,
      answer: 1, tol: { rel: 0.002, abs: 0.002 },
      errors: [{ value: 11 / 6, feedback: t`The formulas need standard form: divide by $t^2$ first, so $g = t$, not $t^3$. With $g = t^3$ you solved a different equation.` }],
      hints: [t`Divide by $t^2$: $y'' - \dfrac2t\,y' + \dfrac{2}{t^2}\,y = t$, so $g = t$.`, t`$u_1' = -\dfrac{t^2\cdot t}{t^2} = -t$ and $u_2' = \dfrac{t\cdot t}{t^2} = 1$: $y_p = -\tfrac{t^2}{2}\cdot t + t\cdot t^2 = \tfrac{t^3}{2}$. Then fit $c_1t + c_2t^2$.`],
      teach: 'Variation of parameters uses the forcing of the standard form — divide by the coefficient of y″ before reading off g.',
      explain: t`With $g = t$: $u_1 = -\tfrac{t^2}{2}$, $u_2 = t$, $y_p = \tfrac{t^3}{2}$. Then $y = \tfrac{t^3}{2} + c_1t + c_2t^2$ with $\tfrac12 + c_1 + c_2 = 0$ and $\tfrac32 + c_1 + 2c_2 = 0$: $c_2 = -1$, $c_1 = \tfrac12$. So $y = \tfrac12t(t - 1)^2$ and $y(2) = 1$.`,
      visual: {
        type: 'graph',
        params: {
          x: [0, 2.6], y: [-0.5, 8], aspect: 'wide', xlabel: 't', ylabel: '',
          curves: [
            { fn: 'x^3', color: 'warn', width: 2, dash: true, label: 't³ as written', labelAt: 1.75, labelDx: -86, labelDy: -6 },
            { fn: 'x', color: 'accent', width: 2.4, label: 'g = t³/t² = t', labelAt: 2.1, labelDx: -20, labelDy: 16 },
          ],
        },
        caption: 'The right-hand side as written (orange, dashed) and the forcing g of the standard form (blue), after dividing by t².',
      },
    }),
    expr({
      id: 'tan-ivp', difficulty: 3,
      prompt: t`Solve $y'' + y = \tan t$ on $-\tfrac{\pi}{2} < t < \tfrac{\pi}{2}$, with $y(0) = 0$ and $y'(0) = 0$.`,
      answer: 'sin(t) - cos(t)*ln(sec(t) + tan(t))', answerTeX: t`\sin t - \cos t\,\ln(\sec t + \tan t)`, lhs: 'y(t)',
      vars: { t: [-1.2, 1.2] },
      errors: [{ answer: '-cos(t)*ln(sec(t) + tan(t))', feedback: t`That particular solution has $y'(0) = -1$. Add $c_1\cos t + c_2\sin t$: here $c_2 = 1$.` }],
      hints: [t`$W = 1$, so $u_1' = -\sin t\tan t = -\dfrac{\sin^2 t}{\cos t} = \cos t - \sec t$ and $u_2' = \cos t\tan t = \sin t$.`, t`$u_1 = \sin t - \ln(\sec t + \tan t)$, $u_2 = -\cos t$, so $y_p = -\cos t\ln(\sec t + \tan t)$. Its slope at 0 is $-1$.`],
      teach: 'With y₁ = cos t, y₂ = sin t and W = 1, the formulas reduce to two plain integrals of the forcing times sin t and cos t.',
      explain: t`$y_p = \cos t\,[\sin t - \ln(\sec t + \tan t)] - \sin t\cos t = -\cos t\ln(\sec t + \tan t)$. Then $y_p(0) = 0$ and $y_p'(0) = -1$, so add $\sin t$: $y = \sin t - \cos t\ln(\sec t + \tan t)$.`,
      visual: {
        type: 'graph',
        params: {
          x: [-1.6, 1.6], y: [-4, 4], aspect: 'wide', xlabel: 't', ylabel: '',
          curves: [{ fn: 'tan(x)', domain: [-1.33, 1.33], color: 'accent', width: 2.4, label: 'tan t', labelAt: 1.15, labelDx: -46, labelDy: -6 }],
          vlines: [{ x: -1.5708, label: '−π/2' }, { x: 1.5708, label: 'π/2' }],
        },
        caption: t`The forcing $\tan t$, continuous only between $-\pi/2$ and $\pi/2$ — the interval on which the solution is guaranteed.`,
      },
    }),
    mcq({
      id: 'green-kernel', difficulty: 2,
      prompt: t`A flexible boom on a spacecraft behaves like $y'' + 4y = g(t)$ (undamped, $\omega = 2$ rad/s), where $g$ is a measured thruster force per unit mass with no formula. Starting from rest at $t = 0$, which expression gives its deflection?`,
      choices: [
        t`$y(t) = \displaystyle\int_0^t \tfrac12\sin 2(t - s)\,g(s)\,ds$`,
        t`$y(t) = \displaystyle\int_0^t \sin 2(t - s)\,g(s)\,ds$`,
        t`$y(t) = \displaystyle\int_0^t \tfrac12\sin 2(s - t)\,g(s)\,ds$`,
        t`$y(t) = \displaystyle\int_0^t \tfrac12\cos 2(t - s)\,g(s)\,ds$`,
      ],
      answer: 0,
      why: {
        1: t`For $y_1 = \cos 2t$, $y_2 = \sin 2t$ the Wronskian is 2, not 1: the kernel is $\sin 2(t - s)/2$.`,
        2: t`The sign is reversed: a kick at time $s$ must push $y$ the same way as $g(s)$ just afterwards, and $\sin 2(s - t) < 0$ for $t$ slightly after $s$.`,
        3: t`A kick changes the velocity, not the position: just after it, $y$ must still be 0. $\cos 2(t - s)$ starts at 1.`,
      },
      hints: [t`Combine the two variation-of-parameters terms: $-\cos 2t\sin 2s + \sin 2t\cos 2s = \sin 2(t - s)$.`, t`$W[\cos 2t, \sin 2t] = 2$, and the formula divides by $W$.`],
      teach: 'For y″ + ω²y = g from rest, y(t) = ∫₀ᵗ sin ω(t − s)/ω · g(s) ds: each slice of forcing starts a ringing that begins at zero.',
      explain: t`$y_p = \displaystyle\int_0^t \frac{-\cos 2t\sin 2s + \sin 2t\cos 2s}{2}\,g(s)\,ds = \int_0^t \frac{\sin 2(t - s)}{2}\,g(s)\,ds$, which starts at $y(0) = 0$, $y'(0) = 0$. The kernel $\tfrac12\sin 2(t - s)$ is the boom’s response to a unit kick at time $s$. A measured $g$ is integrated numerically.`,
      visual: {
        type: 'graph',
        params: {
          x: [0, 6], y: [-0.2, 1.2], aspect: 'wide', xlabel: 't (s)', ylabel: 'g',
          curves: [{ fn: '(1 - exp(-3x))*exp(-0.4x)*(1 + 0.08*sin(15x))', color: 'gold', width: 2.2, label: 'measured thrust', labelAt: 2.2, labelDx: 6, labelDy: -12 }],
        },
        caption: 'A thrust profile with no formula: a rise, a decay, and ripple from the combustion. Illustrative, not real data.',
      },
    }),
  ],
  checkpoint: [
    expr({
      id: 'cp-csc', difficulty: 3,
      prompt: t`Solve $y'' + y = \csc t$ on $0 < t < \pi$, with $y\left(\tfrac{\pi}{2}\right) = 0$ and $y'\left(\tfrac{\pi}{2}\right) = 0$.`,
      answer: '(pi/2 - t)*cos(t) + sin(t)*ln(sin(t))', answerTeX: t`\left(\tfrac{\pi}{2} - t\right)\cos t + \sin t\,\ln(\sin t)`, lhs: 'y(t)',
      vars: { t: [0.3, 2.8] },
      hints: [t`$u_1' = -\sin t\csc t = -1$ and $u_2' = \cos t\csc t = \cot t$.`, t`$y_p = -t\cos t + \sin t\ln(\sin t)$; then fit $c_1\cos t + c_2\sin t$ at $t = \pi/2$.`],
      teach: 'Variation of parameters, then the initial conditions — at whatever t₀ they are given.',
      explain: t`$u_1 = -t$, $u_2 = \ln\sin t$, so $y_p = -t\cos t + \sin t\ln\sin t$, with $y_p(\tfrac{\pi}{2}) = 0$ and $y_p'(\tfrac{\pi}{2}) = \tfrac{\pi}{2}$. Adding $c_1\cos t + c_2\sin t$: $c_2 = 0$ and $\tfrac{\pi}{2} - c_1 = 0$. So $y = (\tfrac{\pi}{2} - t)\cos t + \sin t\ln(\sin t)$.`,
      visual: {
        type: 'graph',
        params: {
          x: [0, 3.2], y: [-0.5, 5], aspect: 'wide', xlabel: 't', ylabel: '',
          curves: [{ fn: '1/sin(x)', domain: [0.2, 2.94], color: 'accent', width: 2.4, label: 'csc t', labelAt: 0.32, labelDx: 8, labelDy: 0 }],
          vlines: [{ x: 1.5708, label: 't₀ = π/2', color: 'gold' }],
        },
        caption: t`The forcing $\csc t$, continuous on $(0, \pi)$; the data are given at its lowest point, $t = \pi/2$.`,
      },
    }),
    mcq({
      id: 'cp-why-wronskian', difficulty: 2,
      prompt: t`In variation of parameters, $u_1'$ and $u_2'$ solve $u_1'y_1 + u_2'y_2 = 0$ and $u_1'y_1' + u_2'y_2' = g$. Why can this system always be solved on an interval where $y_1$, $y_2$ is a fundamental set?`,
      choices: [
        t`Its determinant is the Wronskian $W = y_1y_2' - y_1'y_2$, which never vanishes there`,
        t`Because $g$ is continuous`,
        t`Because the first equation was chosen freely, so any $u_1'$, $u_2'$ will do`,
        t`Because $y_1$ and $y_2$ are never zero`,
      ],
      answer: 0,
      why: {
        1: t`Continuity of $g$ makes the integrals exist; solvability of the $2\times2$ system depends on its matrix, $\begin{pmatrix} y_1 & y_2 \\ y_1' & y_2' \end{pmatrix}$.`,
        2: t`The first equation was a free choice, but once made, $u_1'$ and $u_2'$ are pinned down — by a system that needs a nonzero determinant.`,
        3: t`$\cos t$ and $\sin t$ both vanish somewhere, and the method still works: what matters is that they are never *proportional*.`,
      },
      hints: ['Write the two equations as a matrix acting on (u₁′, u₂′).', t`The matrix is $\begin{pmatrix} y_1 & y_2 \\ y_1' & y_2' \end{pmatrix}$. What is its determinant?`],
      teach: 'The Wronskian is the determinant of the system for u₁′ and u₂′ — which is why it appears in both formulas.',
      explain: t`By Cramer’s rule $u_1' = \dfrac{\begin{vmatrix} 0 & y_2 \\ g & y_2' \end{vmatrix}}{W} = -\dfrac{y_2g}{W}$ and $u_2' = \dfrac{\begin{vmatrix} y_1 & 0 \\ y_1' & g \end{vmatrix}}{W} = \dfrac{y_1g}{W}$, valid wherever $W \neq 0$ — everywhere on the interval, for a fundamental set.`,
      visual: {
        type: 'graph',
        params: {
          x: [0, 7], y: [-1.3, 1.6], aspect: 'wide', xlabel: 't', ylabel: '',
          curves: [
            { fn: 'cos(x)', color: 'accent', label: 'y₁ = cos t', labelAt: 6.2, labelDx: -40, labelDy: -12 },
            { fn: 'sin(x)', color: 'violet', label: 'y₂ = sin t', labelAt: 1.6, labelDx: 6, labelDy: -10 },
            { fn: '1', color: 'gold', width: 2, dash: true, label: 'W = 1', labelAt: 3.2, labelDx: 6, labelDy: -10 },
          ],
        },
        caption: 'A fundamental set: each function vanishes somewhere, but their Wronskian (gold) never does.',
      },
    }),
    num({
      id: 'cp-pulse', difficulty: 3, transfer: true,
      gen(r) {
        const tau = r.pick([1, 2, 3]), a0 = r.pick([0.01, 0.02, 0.05]);
        const w = Math.PI / 2, A = (2 * a0 * Math.abs(Math.sin((w * tau) / 2))) / (w * w) * 1000;
        return {
          prompt: t`A spacecraft fires an attitude thruster for $\tau = ${tau}$ s. During the firing its solar panel’s lowest mode, with natural frequency $f_0 = 0.25$ Hz and negligible damping, feels a steady push: $x'' + \omega_0^2x = a_0$ for $0 < t < \tau$, with $a_0 = ${a0}$ m/s², and $x'' + \omega_0^2x = 0$ afterwards. Starting from rest, with what amplitude, in mm, does the panel tip vibrate after the firing?`,
          answer: A, units: 'mm', tol: { rel: 0.01 },
          errors: [
            { value: (a0 / (w * w)) * 1000, feedback: t`That is the static deflection $a_0/\omega_0^2$. After the pulse the motion is $\dfrac{a_0}{\omega_0^2}[\cos\omega_0(t - \tau) - \cos\omega_0t]$, whose amplitude is $\dfrac{2a_0}{\omega_0^2}\left|\sin\dfrac{\omega_0\tau}{2}\right|$.` },
            { value: ((2 * a0) / (w * w)) * 1000, feedback: t`That is the largest possible residual; it happens only when $\sin(\omega_0\tau/2) = \pm1$. Include the factor $|\sin(\omega_0\tau/2)|$.` },
          ].filter((e) => Math.abs(e.value - A) > 0.01 * A),
          hints: [t`$x(t) = \displaystyle\int_0^\tau \frac{\sin\omega_0(t - s)}{\omega_0}\,a_0\,ds$ for $t > \tau$, with $\omega_0 = 2\pi(0.25) = \pi/2$ rad/s.`, t`The integral is $\dfrac{a_0}{\omega_0^2}[\cos\omega_0(t - \tau) - \cos\omega_0t] = \dfrac{2a_0}{\omega_0^2}\sin\dfrac{\omega_0\tau}{2}\,\sin\omega_0\!\left(t - \dfrac{\tau}{2}\right)$.`],
          teach: 'The residual vibration after a pulse is the Duhamel integral over the pulse — and it vanishes when the pulse lasts a whole number of periods.',
          explain: t`$\omega_0 = \pi/2$ rad/s, so the amplitude is $\dfrac{2(${a0})}{(\pi/2)^2}\left|\sin\dfrac{\pi\cdot${tau}}{4}\right| = ${fmt(A, 3)}$ mm. Fire for exactly one period, 4 s, and $\sin(\omega_0\tau/2) = 0$: the second half of the push cancels the ringing started by the first, and the panel is left still. Shaping commands this way (input shaping) is used to point flexible spacecraft quietly.`,
          visual: {
            type: 'graph',
            params: {
              x: [0, 12], y: [-0.4, 1.4], yticks: 0, aspect: 'wide', xlabel: 't (s)', ylabel: '',
              curves: [{ fn: `step(${tau} - x)`, domain: [0.001, 12], color: 'gold', width: 2.4, label: 'thruster on', labelAt: tau / 2, labelDx: -30, labelDy: -10 }],
              vlines: [{ x: tau, label: `τ = ${tau} s`, color: 'ink3' }],
            },
            caption: 'The push on the panel’s mode: on for τ seconds, then off. The panel’s period is 4 s. Damping and the panel’s other modes are ignored.',
          },
        };
      },
    }),
  ],
  sources: [
    { label: 'J. Lebl, Notes on Diffy Qs, §2.5 Nonhomogeneous equations (variation of parameters)', url: 'https://www.jirka.org/diffyqs/' },
    { label: 'OpenStax Calculus Vol. 3, §7.2 Nonhomogeneous linear equations', url: 'https://openstax.org/books/calculus-volume-3/pages/7-2-nonhomogeneous-linear-equations' },
  ],
});
