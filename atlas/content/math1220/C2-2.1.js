// Integration by parts — the product rule run backwards.
import { lesson, mcq, num, expr } from '../../src/core/content.js';
import { nice } from '../../src/core/format.js';

const t = String.raw;

// the integrand as a picture: its curve, and the signed area a definite
// integral would measure (above the axis in blue, below in red)
const integrand = (fn, x, y, from, to, caption) => ({
  type: 'graph',
  params: {
    x, y, aspect: 'wide',
    curves: [{ fn, color: 'accent' }],
    shade: [{ fn: `max(${fn}, 0)`, from, to, color: 'accent', alpha: 0.22 }, { fn: `min(${fn}, 0)`, from, to, color: 'bad', alpha: 0.22 }],
  },
  caption,
});

export default lesson({
  id: 'math1220.C2-2.1',
  title: 'Integration by parts',
  minutes: 8, difficulty: 2,
  intro: t`Integration by parts is the product rule run backwards. When the integrand is a product of two different kinds of function — a polynomial times a sine or an exponential, or a lone logarithm — it trades the integral you have for one you can do:

$$\int u\,dv = uv - \int v\,du$$

You will use it constantly: for Fourier coefficients, for expectation values in quantum mechanics, and every time physics moves a derivative from one function onto another.`,
  symbols: [
    { tex: 'u', text: 'the factor you choose to **differentiate** — pick the one that gets simpler' },
    { tex: 'dv', text: 'the factor you choose to **integrate** — it must be something you can integrate' },
    { tex: 'du', text: 'the derivative of $u$, times $dx$' },
    { tex: 'v', text: 'an antiderivative of $dv$ (no $+C$ needed here)' },
  ],
  why: t`It comes straight from the product rule: $(uv)' = u'v + uv'$, so integrating both sides gives $uv = \int v\,du + \int u\,dv$.`,
  visual: {
    type: 'ibp-area',
    title: 'Two areas that always add up to a rectangle',
    lead: t`Plot the curve $(u, v)$ as $x$ runs from $a$ to $b$. The blue area is $\int u\,dv$, the amber area is $\int v\,du$, and together they fill the rectangle $uv\big|_a^b$.`,
    tasks: ['Slide b and watch the two readouts always sum to uv.', 'Switch to ∫ ln x dx: there u = ln x and v = x.'],
  },
  example: {
    prompt: t`Find $\displaystyle\int x\cos x\,dx$.`,
    steps: [
      { label: 'Choose', text: t`Let $u = x$ (it gets simpler when differentiated) and $dv = \cos x\,dx$ (easy to integrate).` },
      { label: 'Compute the pieces', text: t`$du = dx$ and $v = \sin x$.` },
      { label: 'Apply the formula', text: t`$\displaystyle\int x\cos x\,dx = x\sin x - \int \sin x\,dx$` },
      { label: 'Finish', text: t`$\displaystyle = x\sin x + \cos x + C$` },
      { label: 'Check', text: t`Differentiate: $\frac{d}{dx}(x\sin x + \cos x) = \sin x + x\cos x - \sin x = x\cos x$. ✓` },
    ],
    answer: t`$\displaystyle\int x\cos x\,dx = x\sin x + \cos x + C$`,
  },
  practice: [
    mcq({
      id: 'choose-u', difficulty: 1,
      prompt: t`To evaluate $\displaystyle\int x\,e^{3x}\,dx$ by parts, which choice works best?`,
      visual: integrand('x*e^(3x)', [-1.2, 0.75], [-0.25, 2.4], 0, 0.5, t`The integrand $x e^{3x}$: a polynomial factor times an exponential one.`),
      choices: [t`$u = x$, $dv = e^{3x}\,dx$`, t`$u = e^{3x}$, $dv = x\,dx$`, t`$u = x e^{3x}$, $dv = dx$`, t`$u = 3x$, $dv = e^{x}\,dx$`],
      answer: 0,
      why: {
        1: t`Then $v = x^2/2$ and the new integral $\int \tfrac{x^2}{2}\,3e^{3x}\,dx$ is harder than the one you started with.`,
        2: t`Then $du$ is a product again and nothing simplifies.`,
        3: t`This split does not reproduce the integrand: $3x \cdot e^{x} \ne x e^{3x}$.`,
      },
      hints: ['Pick u to be the factor that gets simpler when you differentiate it.', 'Differentiating x gives 1; integrating e^{3x} just rescales it.'],
      teach: t`Choose $u$ to be the factor that simplifies when differentiated and $dv$ the factor you can integrate.`,
      explain: t`With $u = x$, $du = dx$, and $v = \tfrac13 e^{3x}$, so the leftover integral $\int \tfrac13 e^{3x}\,dx$ is elementary.`,
    }),
    expr({
      id: 'x-exp-kx', difficulty: 2,
      gen(r) {
        const k = r.int(2, 5);
        return {
          prompt: t`Find $\displaystyle\int x\,e^{${k}x}\,dx$.`,
          visual: integrand(`x*e^(${k}x)`, [-3 / k, 1.5 / k], [-0.6 / k, 7 / k], 0, 1 / k, t`$y = x e^{${k}x}$. Any antiderivative $F$ gives the shaded area as $F(\tfrac1{${k}}) - F(0)$.`),
          answer: `(x/${k} - 1/${k * k}) e^(${k}x)`,
          answerTeX: t`\left(\frac{x}{${k}} - \frac{1}{${k * k}}\right)e^{${k}x}`,
          vars: { x: [-1.5, 1.5] }, mode: 'constant',
          errors: [{ answer: `(x/${k} + 1/${k * k}) e^(${k}x)`, feedback: t`Check the sign: $\int v\,du$ is *subtracted*.` }, { answer: `(${k}x - 1) e^(${k}x)`, feedback: t`It looks like you multiplied by $${k}$ instead of dividing: $v = \frac{1}{${k}}e^{${k}x}$.` }],
          hints: [t`Let $u = x$ and $dv = e^{${k}x}\,dx$.`, t`Then $du = dx$ and $v = \tfrac{1}{${k}}e^{${k}x}$.`, t`$\int x e^{${k}x}dx = \tfrac{x}{${k}}e^{${k}x} - \tfrac{1}{${k}}\int e^{${k}x}dx$.`],
          teach: t`For a polynomial times an exponential, differentiate the polynomial and integrate the exponential.`,
          explain: t`$u = x$, $v = \tfrac1{${k}}e^{${k}x}$: $\;\tfrac{x}{${k}}e^{${k}x} - \tfrac{1}{${k}}\int e^{${k}x}dx = \tfrac{x}{${k}}e^{${k}x} - \tfrac{1}{${k * k}}e^{${k}x} + C$.`,
          solution: t`Differentiate the answer to check: $\frac{d}{dx}\left[\left(\frac{x}{${k}} - \frac1{${k * k}}\right)e^{${k}x}\right] = \frac1{${k}}e^{${k}x} + \left(x - \frac1{${k}}\right)e^{${k}x} = x e^{${k}x}$.`,
        };
      },
    }),
    expr({
      id: 'x-sin-kx', difficulty: 2,
      gen(r) {
        const k = r.int(2, 4);
        return {
          prompt: t`Find $\displaystyle\int x\sin(${k}x)\,dx$.`,
          visual: integrand(`x*sin(${k}x)`, [-2, 2], [-2.1, 2.1], 0, Math.PI / k, t`$y = x\sin(${k}x)$, with the first hump, from $0$ to $\pi/${k}$, shaded.`),
          answer: `-x cos(${k}x)/${k} + sin(${k}x)/${k * k}`,
          answerTeX: t`-\frac{x\cos(${k}x)}{${k}} + \frac{\sin(${k}x)}{${k * k}}`,
          vars: { x: [-2, 2] }, mode: 'constant',
          errors: [{ answer: `x cos(${k}x)/${k} - sin(${k}x)/${k * k}`, feedback: t`An antiderivative of $\sin(${k}x)$ is $-\tfrac1{${k}}\cos(${k}x)$ — watch that minus sign.` }],
          hints: [t`Take $u = x$ and $dv = \sin(${k}x)\,dx$.`, t`$v = -\tfrac1{${k}}\cos(${k}x)$, so you get $-\tfrac{x}{${k}}\cos(${k}x) + \tfrac1{${k}}\int\cos(${k}x)\,dx$.`],
          teach: t`Integrating $\sin(kx)$ gives $-\tfrac1k\cos(kx)$; the two minus signs are where most slips happen.`,
          explain: t`$-\tfrac{x}{${k}}\cos(${k}x) + \tfrac1{${k}}\cdot\tfrac1{${k}}\sin(${k}x) + C$.`,
        };
      },
    }),
    expr({
      id: 'ln-x', difficulty: 2,
      prompt: t`Find $\displaystyle\int \ln x\,dx$.`,
      visual: { type: 'graph', params: { x: [-0.2, 4.2], y: [-2.2, 1.8], aspect: 'wide', curves: [{ fn: 'ln(x)', color: 'accent', domain: [0.06, 4.2], label: 'y = ln x', labelAt: 3.3 }], shade: [{ fn: 'ln(x)', from: 1, to: 'e', color: 'accent', alpha: 0.25 }], vlines: [{ x: 'e', label: 'e' }] }, caption: t`The shaded area from $1$ to $e$ is exactly $1$ — check it with your answer once you have it.` },
      answer: 'x ln(x) - x', answerTeX: t`x\ln x - x`,
      vars: { x: [0.3, 4] }, mode: 'constant',
      errors: [{ answer: '1/x', feedback: t`That is the *derivative* of $\ln x$, not an antiderivative.` }, { answer: 'x ln(x)', feedback: t`Close — you dropped the $-\int v\,du = -\int 1\,dx$ term.` }],
      hints: [t`There is only one factor — so let $u = \ln x$ and $dv = dx$.`, t`Then $du = \tfrac1x\,dx$ and $v = x$.`],
      teach: t`A lone logarithm or inverse-trig function is integrated by parts with $dv = dx$.`,
      explain: t`$\int \ln x\,dx = x\ln x - \int x\cdot\tfrac1x\,dx = x\ln x - x + C$.`,
    }),
    num({
      id: 'definite-xcos', difficulty: 2,
      gen(r) {
        const opts = [[Math.PI / 2, t`\tfrac{\pi}{2}`], [Math.PI, t`\pi`], [2 * Math.PI / 3, t`\tfrac{2\pi}{3}`]];
        const [b, bt] = r.pick(opts);
        const val = b * Math.sin(b) + Math.cos(b) - 1;
        return {
          prompt: t`Evaluate $\displaystyle\int_0^{${bt}} x\cos x\,dx$. Give a decimal to 3 significant figures.`,
          visual: integrand('x*cos(x)', [-0.2, 3.4], [-3.3, 1], 0, b, t`$y = x\cos x$ from $0$ to $${bt}$. Area below the axis (red) counts as negative.`),
          answer: val, tol: { rel: 0.005, abs: 0.002 },
          hints: [t`You found $\int x\cos x\,dx = x\sin x + \cos x$ in the worked example.`, t`Evaluate $x\sin x + \cos x$ at $${bt}$ and at $0$, then subtract.`],
          teach: t`For a definite integral, evaluate the antiderivative at both limits — the $uv$ term too.`,
          explain: t`$\left[x\sin x + \cos x\right]_0^{${bt}} = ${nice(b * Math.sin(b) + Math.cos(b))} - 1 = ${nice(val)}$.`,
        };
      },
    }),
    mcq({
      id: 'find-error', difficulty: 3, kind: 'error',
      prompt: t`A student writes:

$$\int x^2 e^x\,dx \;=\; x^2 e^x - \int x e^x\,dx \;=\; x^2e^x - xe^x + e^x + C.$$

Where is the mistake?`,
      choices: [
        t`$du$ should be $2x\,dx$, so the second integral is $2\int x e^x\,dx$`,
        t`$dv$ should have been $x^2\,dx$`,
        t`The last term should be $-e^x$`,
        t`$v$ should be $e^x/x$`,
      ],
      answer: 0,
      why: { 1: 'That choice makes the next integral harder, but it is not an error in the computation shown.', 2: t`Given their (wrong) middle line, $-\int xe^x\,dx = -xe^x + e^x$ is right; the slip is earlier.`, 3: t`$\int e^x\,dx = e^x$; dividing by $x$ is not integration.` },
      hints: ['Check each piece: u, du, v and dv.', t`With $u = x^2$, what is $du$?`],
      teach: t`Always write out $u$, $du$, $v$ and $dv$ before substituting — dropped factors hide in $du$.`,
      explain: t`With $u = x^2$, $du = 2x\,dx$. The correct result is $x^2e^x - 2xe^x + 2e^x + C$.`,
      solution: t`$\int x^2e^x dx = x^2e^x - 2\int xe^x dx$, and $\int xe^x dx = xe^x - e^x$, so the answer is $e^x(x^2 - 2x + 2) + C$.`,
    }),
    mcq({
      id: 'which-method', difficulty: 2,
      prompt: 'Which integral is best done by integration by parts?',
      choices: [t`$\int x\cos x\,dx$`, t`$\int 2x\cos(x^2)\,dx$`, t`$\int \cos^2 x\,dx$`, t`$\int \dfrac{dx}{1+x^2}$`],
      answer: 0,
      why: { 1: t`The $2x$ is the derivative of the inside function $x^2$ — that is a substitution, $u = x^2$.`, 2: t`Use the identity $\cos^2x = \tfrac12(1+\cos 2x)$.`, 3: t`That is the derivative of $\arctan x$.` },
      hints: ['Look for a product of two unrelated kinds of function.', 'If one factor is the derivative of something inside the other, substitution wins.'],
      teach: 'Parts handles products of unrelated factors; substitution handles a function times the derivative of its inside.',
      explain: t`$x\cos x$ is a polynomial times a trig function with no inside-derivative relationship, the classic case for parts.`,
    }),
  ],
  checkpoint: [
    expr({
      id: 'cp-x-cos-kx', difficulty: 2,
      gen(r) {
        const k = r.int(2, 5);
        return {
          prompt: t`Find $\displaystyle\int x\cos(${k}x)\,dx$.`,
          visual: integrand(`x*cos(${k}x)`, [-2, 2], [-2.1, 2.1], 0, Math.PI / (2 * k), t`$y = x\cos(${k}x)$; the shaded area runs from $0$ to $\pi/${2 * k}$.`),
          answer: `x sin(${k}x)/${k} + cos(${k}x)/${k * k}`,
          answerTeX: t`\frac{x\sin(${k}x)}{${k}} + \frac{\cos(${k}x)}{${k * k}}`,
          vars: { x: [-2, 2] }, mode: 'constant',
          hints: ['u = x, dv = cos(kx) dx.'],
          teach: t`$u = x$ simplifies; $\cos(kx)$ integrates to $\tfrac1k\sin(kx)$.`,
          explain: t`$\tfrac{x}{${k}}\sin(${k}x) - \tfrac1{${k}}\int\sin(${k}x)dx = \tfrac{x}{${k}}\sin(${k}x) + \tfrac{1}{${k * k}}\cos(${k}x) + C$.`,
        };
      },
    }),
    num({
      id: 'cp-def', difficulty: 2,
      prompt: t`Evaluate $\displaystyle\int_0^1 x\,e^{x}\,dx$ exactly.`,
      visual: integrand('x*e^x', [-0.3, 1.3], [-0.4, 3.6], 0, 1, t`The area under $y = x e^x$ from $0$ to $1$.`),
      answer: 1, tol: { rel: 1e-3 },
      hints: [t`$\int xe^x\,dx = xe^x - e^x$.`],
      teach: 'Evaluate uv − ∫v du between the limits.',
      explain: t`$\left[xe^x - e^x\right]_0^1 = (e - e) - (0 - 1) = 1$.`,
    }),
    mcq({
      id: 'cp-boundary', difficulty: 3, transfer: true,
      visual: { type: 'graph', params: { x: [-0.3, 3.5], y: [-0.35, 1.45], aspect: 'wide', curves: [{ fn: 'sin(x)', color: 'accent', domain: [0, 'pi'], label: 'f', labelAt: 1.2 }, { fn: 'x*(pi - x)/2', color: 'gold', domain: [0, 'pi'], label: 'g', labelAt: 2.2, labelDy: -16 }], points: [{ x: 0, y: 0, label: 'a' }, { x: 'pi', y: 0, label: 'b' }] }, caption: t`Two functions that both vanish at the ends of $[a, b]$, so $[fg]_a^b = 0$.` },
      prompt: t`On an interval $[a, b]$, integration by parts reads $\int_a^b f\,g'\,dx = \big[f g\big]_a^b - \int_a^b f'\,g\,dx$. If $f$ and $g$ both vanish at $a$ and $b$ (as wave functions do at infinity in quantum mechanics), then $\int_a^b f\,g'\,dx$ equals:`,
      choices: [t`$-\int_a^b f'\,g\,dx$`, t`$\int_a^b f'\,g\,dx$`, '0', t`$f(b)g(b)$`],
      answer: 0,
      why: { 1: 'The minus sign from the formula survives.', 2: 'Only the boundary term vanishes, not the remaining integral.', 3: 'f(b)g(b) is zero here — and it is the boundary term that drops out.' },
      hints: ['Which term in the formula involves only the endpoint values?', t`If $f(a)=f(b)=0$ (or $g$ does), then $[fg]_a^b = f(b)g(b) - f(a)g(a) = 0$.`],
      teach: 'When the boundary term vanishes, integrating by parts simply moves the derivative across, with a minus sign.',
      explain: t`The boundary term $[fg]_a^b = 0$, leaving $-\int_a^b f'g\,dx$ — the move behind $\langle p\rangle$ calculations and Hermitian operators.`,
    }),
  ],
  sources: [{ label: 'OpenStax Calculus Vol. 2, §3.1', url: 'https://openstax.org/books/calculus-volume-2/pages/3-1-integration-by-parts' }],
});
