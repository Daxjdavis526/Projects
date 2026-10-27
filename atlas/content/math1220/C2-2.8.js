// A strategy for integration: classify, try, combine — and check by differentiating.
import { lesson, mcq, expr, match } from '../../src/core/content.js';
import { kx, fgraph } from './_integration.js';

const t = String.raw;

export default lesson({
  id: 'math1220.C2-2.8',
  title: 'A strategy for integration',
  minutes: 10, difficulty: 3,
  intro: t`No single method does every integral, but a routine finds the right one quickly:

1. **Simplify**: expand, cancel, or apply an identity.
2. **Look for a substitution**: a function multiplied by (a multiple of) the derivative of its inside.
3. **Classify the integrand**: a product of unlike functions → parts; powers of trig functions → trig integrals; $\sqrt{a^2 \pm x^2}$ or $\sqrt{x^2 - a^2}$ → trig substitution; a rational function → partial fractions.
4. **Try again**: rewrite the integrand, or chain two methods together.

Whatever you find — by hand, from a table or from a computer algebra system — **check it by differentiating**:

$$\frac{d}{dx}F(x) = f(x)$$

Some integrals, such as $\int e^{-x^2}dx$, have no elementary antiderivative at all. That is a theorem, not a gap in our tricks — and it is where numerical integration takes over.`,
  symbols: [
    { tex: 'f(x)', text: 'the integrand: the function you were given' },
    { tex: 'F(x)', text: 'a candidate antiderivative, wherever it came from: your working, a table, or a CAS' },
    { tex: t`\frac{d}{dx}`, text: 'differentiation, which is purely mechanical — so it is the reliable check' },
    { tex: t`F(x) + C`, text: t`every antiderivative of $f$ on an interval: two correct answers can differ only by a constant` },
  ],
  why: t`Integration needs insight but differentiation is mechanical, so every antiderivative — yours, a table’s or a computer’s — is checked by differentiating it.`,
  visual: {
    type: 'graph',
    title: 'An antiderivative with no formula',
    lead: t`The blue curve is $f(x) = e^{-x^2}$. No combination of elementary functions has it as a derivative, yet it has an antiderivative: the violet curve $F(x) = \int_0^x e^{-t^2}\,dt$, the shaded area under blue from $0$ to $x_0$. Drag the point along the violet curve; the gold line is its tangent.`,
    tasks: [
      'Wherever the point sits, the slope of violet equals the height of blue — that is what “F is an antiderivative of f” means.',
      'Drag to x₀ = 0: the slope is 1, the top of the blue bump.',
      'Drag far right: violet levels off at √π/2 ≈ 0.886, half of the famous Gaussian integral.',
    ],
    params: {
      x: [-3, 3], y: [-1.05, 1.25],
      curves: [
        { fn: 'exp(-x^2)', color: 'accent', label: 'f(x) = e^(−x²)', labelAt: -1.6 },
        { fn: 'sqrt(pi)/2*erf(x)', color: 'violet', label: 'F(x)', labelAt: 2.2 },
      ],
      shade: [{ fn: 'exp(-x^2)', from: 0, to: 'x0', color: 'accent', alpha: 0.25 }],
      tangent: { fn: 'sqrt(pi)/2*erf(x)', at: 0.7 },
      readouts: [
        { label: t`slope of $F$ at $x_0$`, expr: 'slope' },
        { label: t`$f(x_0) = e^{-x_0^2}$`, expr: 'exp(-x0^2)' },
        { label: t`$F(x_0)$`, expr: 'sqrt(pi)/2*erf(x0)' },
      ],
    },
    caption: t`$F(x) = \tfrac{\sqrt\pi}{2}\operatorname{erf}(x)$, evaluated by a series: “erf” is a named special function precisely because no elementary formula exists. The slope readout is a numerical derivative. Shading is drawn only for $x_0 > 0$.`,
  },
  example: {
    prompt: t`Find $\displaystyle\int e^{\sqrt{x}}\,dx$.`,
    steps: [
      { label: 'Look for structure', text: t`The trouble is the $\sqrt x$ inside the exponential. Nothing outside is its derivative, so there is no direct substitution — but replacing $\sqrt x$ by a new variable may still simplify things.` },
      { label: 'Substitute', text: t`Let $w = \sqrt x$, so $x = w^2$ and $dx = 2w\,dw$: $$\int e^{\sqrt x}\,dx = \int 2w\,e^{w}\,dw.$$` },
      { label: 'Recognise parts', text: t`Now it is a polynomial times an exponential: $u = w$, $dv = e^{w}dw$ gives $\int 2we^{w}\,dw = 2(we^{w} - e^{w}) = 2(w - 1)e^{w}$.` },
      { label: 'Back-substitute', text: t`$2(\sqrt x - 1)\,e^{\sqrt x} + C$.` },
      { label: 'Check', text: t`$\dfrac{d}{dx}\Big[2(\sqrt x - 1)e^{\sqrt x}\Big] = \dfrac{e^{\sqrt x}}{\sqrt x} + 2(\sqrt x - 1)\dfrac{e^{\sqrt x}}{2\sqrt x} = \dfrac{e^{\sqrt x}}{\sqrt x}\big(1 + \sqrt x - 1\big) = e^{\sqrt x}.$ ✓` },
    ],
    answer: t`$\displaystyle\int e^{\sqrt x}\,dx = 2(\sqrt x - 1)\,e^{\sqrt x} + C$ — a substitution followed by parts.`,
  },
  practice: [
    mcq({
      id: 'first-move', difficulty: 1,
      gen(r) {
        const a = r.int(1, 9), sq = Math.sqrt(a);
        const coef = Number.isInteger(sq) ? (sq === 1 ? '' : String(sq)) : t`\sqrt{${a}}`;
        return {
          prompt: t`What is the best first move for $\displaystyle\int \frac{x}{x^2 + ${a}}\,dx$?`,
          choices: [t`Substitute $u = x^2 + ${a}$`, 'Partial fractions', t`Trig substitution $x = ${coef}\tan\theta$`, 'Integration by parts'],
          answer: 0,
          why: {
            1: t`$x^2 + ${a}$ does not factor over the reals, and the numerator is already (half) the derivative of the denominator.`,
            2: 'It works, but it is a long way round when the derivative of the denominator is sitting in the numerator.',
            3: 'Parts would replace one simple integral with a harder one.',
          },
          hints: ['Before classifying, look for a substitution.', t`What is the derivative of $x^2 + ${a}$?`],
          teach: 'Always check for an inside function whose derivative is present before reaching for a heavier method.',
          explain: t`$u = x^2 + ${a}$, $du = 2x\,dx$: $\;\int\frac{x\,dx}{x^2 + ${a}} = \tfrac12\ln(x^2 + ${a}) + C$.`,
          visual: fgraph({ f: `x/(x^2 + ${a})`, F: `ln(x^2 + ${a})/2`, x: [-6, 6] }),
        };
      },
    }),
    match({
      id: 'classify', difficulty: 2,
      prompt: 'Match each integral with the method that does it most directly.',
      left: [t`$\int x^2\ln x\,dx$`, t`$\int \sin^2 x\cos^3 x\,dx$`, t`$\int \sqrt{9 - x^2}\,dx$`, t`$\int \dfrac{x + 1}{x^2 - 5x + 6}\,dx$`],
      right: ['Integration by parts', 'Trig identity, then substitution', 'Trigonometric substitution', 'Partial fractions', 'Substitution with u = the inside function'],
      answer: [0, 1, 2, 3],
      hints: ['Look at the form: a product of unlike functions, a trig power, a root of a quadratic, a rational function.', t`$x^2 - 5x + 6 = (x - 2)(x - 3)$; $\cos^3 x$ is an odd power.`],
      teach: 'Classify by form: products → parts, trig powers → identities, roots of quadratics → trig substitution, rational → partial fractions.',
      explain: t`$x^2\ln x$: parts with $u = \ln x$. $\;\sin^2x\cos^3x$: save a $\cos x$, $u = \sin x$. $\;\sqrt{9 - x^2}$: $x = 3\sin\theta$. $\;\dfrac{x + 1}{(x - 2)(x - 3)}$: partial fractions.`,
    }),
    expr({
      id: 'log-power', difficulty: 2,
      gen(r) {
        const n = r.int(1, 3);
        return {
          prompt: t`Find $\displaystyle\int \frac{${n === 1 ? t`\ln x` : t`(\ln x)^{${n}}`}}{x}\,dx$.`,
          answer: `ln(x)^${n + 1}/${n + 1}`,
          answerTeX: t`\frac{(\ln x)^{${n + 1}}}{${n + 1}}`,
          integrand: `ln(x)^${n}/x`,
          vars: { x: [0.4, 6] }, mode: 'constant',
          errors: [{ answer: `ln(x)^${n + 1}`, feedback: t`Power rule: divide by the new power, ${n + 1}.` }],
          hints: [t`The derivative of $\ln x$, namely $\tfrac1x$, is sitting right there.`, t`Let $u = \ln x$, $du = \tfrac{dx}{x}$: $\;\int u^{${n}}\,du$.`],
          teach: 'A substitution is hiding whenever the derivative of an inside function multiplies the integrand — check before trying parts.',
          explain: t`$u = \ln x$ gives $\int u^{${n}}\,du = \dfrac{u^{${n + 1}}}{${n + 1}} = \dfrac{(\ln x)^{${n + 1}}}{${n + 1}} + C$.`,
          visual: fgraph({ f: `ln(x)^${n}/x`, F: `ln(x)^${n + 1}/${n + 1}`, x: [0.2, 6], trim: 0.04 }),
        };
      },
    }),
    expr({
      id: 'sub-then-parts', difficulty: 3,
      gen(r) {
        const k = r.pick([1, 2, -1]);
        const E = t`e^{${kx(k, 'x^2')}}`, e = `e^(${k}*x^2)`;
        // ∫ x³ e^{kx²} dx = ½ ∫ w e^{kw} dw = e^{kw}(w/(2k) − 1/(2k²))
        return {
          prompt: t`Find $\displaystyle\int x^3 ${E}\,dx$.`,
          answer: `${e}*(x^2/(${2 * k}) - 1/${2 * k * k})`,
          answerTeX: k === 1 ? t`\tfrac12(x^2 - 1)\,e^{x^2}` : k === 2 ? t`\tfrac18(2x^2 - 1)\,e^{2x^2}` : t`-\tfrac12(x^2 + 1)\,e^{-x^2}`,
          integrand: `x^3*${e}`,
          vars: { x: [-1.4, 1.4] }, mode: 'constant',
          errors: [{ answer: `${e}*x^2/(${2 * k})`, feedback: 'You stopped after the first term of the integration by parts: the leftover integral contributes too.' }],
          hints: [
            t`Split $x^3 = x^2\cdot x$ and substitute $w = x^2$, $dw = 2x\,dx$: $\;\tfrac12\int w\,e^{${kx(k, 'w')}}\,dw$.`,
            t`Now parts with $u = w$: $\int w\,e^{${kx(k, 'w')}}dw = e^{${kx(k, 'w')}}\left(\tfrac{w}{${k}} - \tfrac{1}{${k * k}}\right)$.`,
          ],
          teach: 'When one method leaves a familiar form, finish with a second: here substitution, then parts.',
          explain: t`$\tfrac12 e^{${kx(k, 'w')}}\left(\tfrac{w}{${k}} - \tfrac{1}{${k * k}}\right)$ with $w = x^2$: $\;${k === 1 ? t`\tfrac12(x^2 - 1)\,e^{x^2}` : k === 2 ? t`\tfrac18(2x^2 - 1)\,e^{2x^2}` : t`-\tfrac12(x^2 + 1)\,e^{-x^2}`} + C$.`,
          visual: fgraph({ f: `x^3*${e}`, F: `${e}*(x^2/(${2 * k}) - 1/${2 * k * k})`, x: k > 0 ? [-1.3 / Math.sqrt(k), 1.3 / Math.sqrt(k)] : [-3, 3] }),
        };
      },
    }),
    expr({
      id: 'fermi', difficulty: 3,
      gen(r) {
        const k = r.int(1, 3);
        return {
          prompt: t`Find $\displaystyle\int \frac{dx}{1 + e^{${kx(k)}}}$.`,
          answer: `x - ln(1 + e^(${kx(k)}))/${k}`,
          answerTeX: k === 1 ? t`x - \ln(1 + e^{x})` : t`x - \frac{1}{${k}}\ln(1 + e^{${kx(k)}})`,
          integrand: `1/(1 + e^(${kx(k)}))`,
          vars: { x: [-2, 2] }, mode: 'constant',
          errors: [{ answer: `ln(1 + e^(${kx(k)}))/${k}`, feedback: t`That is $\int\frac{${k === 1 ? '' : k}e^{${kx(k)}}}{1 + e^{${kx(k)}}}dx$ — the numerator has no $e^{${kx(k)}}$ here.` }],
          hints: [
            t`Rewrite: $\dfrac{1}{1 + e^{${kx(k)}}} = 1 - \dfrac{e^{${kx(k)}}}{1 + e^{${kx(k)}}}$.`,
            t`The second piece is a substitution: $u = 1 + e^{${kx(k)}}$, $du = ${k === 1 ? '' : k}e^{${kx(k)}}dx$.`,
          ],
          teach: 'Add and subtract to manufacture a substitution: 1/(1 + e^u) = 1 − e^u/(1 + e^u).',
          explain: t`$\int 1\,dx - \int\dfrac{e^{${kx(k)}}}{1 + e^{${kx(k)}}}dx = x - \tfrac{1}{${k}}\ln(1 + e^{${kx(k)}}) + C$.`,
          visual: {
            type: 'graph',
            params: { x: [-6 / k, 6 / k], y: [-0.1, 1.15], curves: [{ fn: `1/(1 + exp(${k}*x))`, color: 'accent' }] },
            caption: 'The integrand is a smoothed step: the same shape as the Fermi–Dirac occupation function of electrons in a metal.',
          },
        };
      },
    }),
    mcq({
      id: 'non-elementary', difficulty: 2,
      prompt: 'Which of these has no antiderivative made of elementary functions?',
      choices: [t`$\int e^{-x^2}\,dx$`, t`$\int x\,e^{-x^2}\,dx$`, t`$\int x^2 e^{-x}\,dx$`, t`$\int e^{-x}\sin x\,dx$`],
      answer: 0,
      why: {
        1: t`Substitute $u = -x^2$: the answer is $-\tfrac12 e^{-x^2} + C$.`,
        2: t`Two rounds of parts: $-e^{-x}(x^2 + 2x + 2) + C$.`,
        3: t`Cyclic parts: $-\tfrac12 e^{-x}(\sin x + \cos x) + C$.`,
      },
      hints: ['Three of these yield to a method from this module.', t`Which one has no $x$ outside to act as $du$, and no product to integrate by parts?`],
      teach: t`$e^{-x^2}$ has an antiderivative, but it is not elementary; you evaluate its integrals numerically or with the special function erf.`,
      explain: t`Liouville’s theorem shows that no elementary $F$ has $F' = e^{-x^2}$. Its antiderivative is written $\tfrac{\sqrt\pi}{2}\operatorname{erf}(x)$ and computed numerically or by series.`,
      visual: { type: 'graph', params: { x: [0, 3.2], y: [-0.1, 1.1], curves: [{ fn: 'exp(-x^2)', color: 'accent', label: 'e^(−x²)', labelAt: 0.25 }, { fn: 'x*exp(-x^2)', color: 'warn', label: 'x e^(−x²)', labelAt: 1.25 }, { fn: 'x^2*exp(-x)', color: 'good', label: 'x² e^(−x)', labelAt: 2.4 }, { fn: 'exp(-x)*sin(x)', color: 'violet', label: 'e^(−x) sin x', labelAt: 0.75, labelDy: 14 }] }, caption: 'All four integrands are smooth, gentle curves: whether an elementary antiderivative exists cannot be seen in a graph. Every one of them has an antiderivative.' },
    }),
    mcq({
      id: 'cas-check', difficulty: 3,
      prompt: t`A computer algebra system gives $\displaystyle\int \sin x\cos x\,dx = -\tfrac14\cos 2x + C$. Your notes say $\tfrac12\sin^2 x + C$. Which is right?`,
      choices: ['Both: they differ by a constant', 'Only the CAS', t`Only $\tfrac12\sin^2 x$`, t`Neither: it should be $\sin^2 x + C$`],
      answer: 0,
      why: {
        1: t`Differentiate yours: $\sin x\cos x$. It is right too.`,
        2: t`Differentiate the CAS answer: $\tfrac12\sin 2x = \sin x\cos x$. It is right too.`,
        3: t`$\frac{d}{dx}\sin^2 x = 2\sin x\cos x$ — twice the integrand.`,
      },
      hints: ['Differentiate both answers.', t`Use $\cos 2x = 1 - 2\sin^2 x$ to compare them directly.`],
      teach: 'Different-looking antiderivatives are both right if their derivatives agree; then they differ by a constant.',
      explain: t`$-\tfrac14\cos 2x = -\tfrac14(1 - 2\sin^2 x) = \tfrac12\sin^2 x - \tfrac14$: the same function shifted by $\tfrac14$, absorbed into $C$.`,
      visual: fgraph({ f: '-cos(2x)/4', x: [-3.2, 3.2], extra: [{ fn: 'sin(x)^2/2', color: 'warn', dash: true, width: 2 }], caption: t`The CAS answer (blue) and yours (dashed), each drawn with $C = 0$.` }),
    }),
  ],
  checkpoint: [
    expr({
      id: 'cp-x-sec2', difficulty: 3,
      prompt: t`Find $\displaystyle\int x\sec^2 x\,dx$.`,
      answer: 'x tan(x) + ln(abs(cos(x)))',
      answerTeX: t`x\tan x + \ln\lvert\cos x\rvert`,
      integrand: 'x*sec(x)^2',
      vars: { x: [-1.2, 1.2] }, mode: 'constant',
      hints: [t`Parts with $u = x$, $dv = \sec^2 x\,dx$, so $v = \tan x$.`, t`$\int\tan x\,dx = -\ln\lvert\cos x\rvert$.`],
      teach: 'A polynomial times a function you can integrate: parts, then a known trig integral.',
      explain: t`$x\tan x - \int\tan x\,dx = x\tan x + \ln\lvert\cos x\rvert + C$.`,
      visual: fgraph({ f: 'x*sec(x)^2', F: 'x*tan(x) + ln(abs(cos(x)))', x: [-1.3, 1.3], trim: 0.06 }),
    }),
    expr({
      id: 'cp-cos-root', difficulty: 3,
      prompt: t`Find $\displaystyle\int \cos\sqrt{x}\,dx$ for $x > 0$.`,
      answer: '2sqrt(x) sin(sqrt(x)) + 2cos(sqrt(x))',
      answerTeX: t`2\sqrt{x}\,\sin\sqrt{x} + 2\cos\sqrt{x}`,
      integrand: 'cos(sqrt(x))',
      vars: { x: [0.1, 9] }, mode: 'constant',
      hints: [t`Let $w = \sqrt x$: $dx = 2w\,dw$.`, t`Then $\int 2w\cos w\,dw$ by parts.`],
      teach: 'Substitute away the root, then integrate by parts.',
      explain: t`$\int 2w\cos w\,dw = 2(w\sin w + \cos w)$, so the answer is $2\sqrt x\sin\sqrt x + 2\cos\sqrt x + C$.`,
      visual: fgraph({ f: 'cos(sqrt(x))', F: '2sqrt(x)*sin(sqrt(x)) + 2cos(sqrt(x))', x: [0, 40] }),
    }),
    mcq({
      id: 'cp-gps-gaussian', difficulty: 3, transfer: true,
      prompt: t`A GPS receiver’s position error along one axis is normally distributed with standard deviation $\sigma$. The probability that an error lies within $\pm\sigma$ is $$P = \frac{1}{\sqrt{2\pi}}\int_{-1}^{1} e^{-z^2/2}\,dz.$$ What is the right plan for computing it?`,
      choices: [
        'No elementary antiderivative exists: evaluate it numerically',
        t`Substitute $u = -z^2/2$, so $du = -z\,dz$`,
        t`Integrate by parts with $u = e^{-z^2/2}$ and $dv = dz$`,
        t`Complete the square in the exponent and use an arctangent`,
      ],
      answer: 0,
      why: {
        1: t`$du = -z\,dz$ needs a factor $z$ outside the exponential, and there is none.`,
        2: t`Then $v = z$ and $\int v\,du = \int z^2 e^{-z^2/2}\,dz$ — harder than before.`,
        3: 'An arctangent comes from 1/(x² + a²), not from an exponential.',
      },
      hints: ['Run the strategy: is there a substitution? a product? a rational function?', t`$\int e^{-z^2/2}dz$ is the classic non-elementary integral.`],
      teach: 'Recognising a non-elementary integral is part of the strategy: the right move is a numerical method.',
      explain: t`$\int e^{-z^2/2}dz$ is non-elementary. Numerically, $P = \operatorname{erf}(1/\sqrt2) \approx 0.6827$ — the familiar “68%” of the normal distribution.`,
      visual: {
        type: 'graph',
        params: { x: [-3.5, 3.5], y: [0, 0.48], xlabel: 'z = error/σ', ylabel: ' ', curves: [{ fn: 'exp(-x^2/2)/sqrt(2pi)', color: 'accent' }], shade: [{ fn: 'exp(-x^2/2)/sqrt(2pi)', from: -1, to: 1 }] },
        caption: 'The standard normal density; the shaded area is P. Treating the error as normal is itself a model.',
      },
    }),
  ],
  sources: [{ label: 'OpenStax Calculus Vol. 2, §3.5', url: 'https://openstax.org/books/calculus-volume-2/pages/3-5-other-strategies-for-integration' }],
});
