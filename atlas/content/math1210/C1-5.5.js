// Substitution — the chain rule run backwards. Spot an inside function whose
// derivative is also present, rename it u, and the integral simplifies.
import { lesson, mcq, num, expr } from '../../src/core/content.js';
import { nice } from '../../src/core/format.js';
import { N, curveFig, fitY } from './_c1kit.js';
import { areaFig, thou } from './_c1int.js';

const t = String.raw;
const PI = Math.PI;

export default lesson({
  id: 'math1210.C1-5.5',
  title: 'Substitution',
  minutes: 10, difficulty: 3,
  intro: t`The chain rule says $\dfrac{d}{dx}F(g(x)) = F'(g(x))\,g'(x)$. Read backwards: when an integrand is a function of some inside expression $g(x)$, **multiplied by the derivative of that inside**, rename the inside $u = g(x)$, so $du = g'(x)\,dx$, and the integral collapses:

$$\int f(g(x))\,g'(x)\,dx = \int f(u)\,du$$

Constant factors are free to fix: if only $3x^2$ is needed and $x^2$ is present, divide by $3$. For a definite integral, change the limits to the matching values of $u$ — then you never need to go back to $x$.`,
  symbols: [
    { tex: 'g(x)', text: 'the inside function — the one buried in a power, a root, an exponent or a trig function' },
    { tex: 'u = g(x)', text: 'the new variable' },
    { tex: 'du = g\'(x)\\,dx', text: 'the differential: how a small step in $x$ becomes a small step in $u$' },
    { tex: 'f(u)', text: 'the outside function, now on its own and (one hopes) easy to integrate' },
  ],
  why: t`Physical integrals rarely arrive in textbook form: a ring of radius $r$ carries a factor $2\pi r$, a burning rocket’s mass is $m_0 - \dot m t$. Substitution is how those factors get absorbed.`,
  visual: {
    type: 'graph',
    title: 'How much of a laser beam passes through an aperture',
    lead: t`A Gaussian laser beam has intensity $I(r) = I_0e^{-2r^2/w^2}$ at distance $r$ from its axis. A thin ring of radius $r$ and width $dr$ has area $2\pi r\,dr$, so the power inside radius $R$ is the area under $2\pi r\,I(r)$ from $0$ to $R$ — the blue curve, in units with $w = 1$ and $I_0 = 1$. Slide the aperture radius $R$.`,
    tasks: [
      'At R = 1 (one beam radius w) the aperture passes 86.5% of the power: 1 − e⁻².',
      'Compare the numerical area with the formula from substitution: they agree for every R.',
      'The curve starts at 0: the centre is brightest, but a ring of radius 0 has no area.',
    ],
    params: {
      x: [-0.1, 2.3], y: [-0.1, 2.9], aspect: 'wide', xlabel: 'r / w', ylabel: '2πr I / I₀',
      sliders: [{ key: 'R', label: t`Aperture radius $R$`, min: 0.1, max: 2.2, step: 0.01, value: 1, unit: t`w`, explain: t`The radius of the hole, in units of the beam radius $w$.` }],
      curves: [{ fn: '2*pi*x*e^(-2*x^2)', color: 'accent' }],
      shade: [{ fn: '2*pi*x*e^(-2*x^2)', from: 0, to: 'R', color: 'accent', alpha: 0.25 }],
      integral: { fn: '2*pi*x*e^(-2*x^2)', from: 0, to: 'R' },
      vlines: [{ x: 'R', label: 'R' }],
      readouts: [
        { label: 'area (numerical)', expr: 'integral', digits: 5 },
        { label: t`formula $\tfrac{\pi}{2}(1 - e^{-2R^2})$`, expr: 'pi/2*(1 - e^(-2*R^2))', digits: 5 },
        { label: 'fraction of the beam', expr: '1 - e^(-2*R^2)', digits: 4 },
      ],
    },
    caption: 'An ideal TEM₀₀ Gaussian beam; real beams are only approximately Gaussian, and diffraction at the aperture edge is ignored.',
  },
  example: {
    prompt: t`For the Gaussian beam $I(r) = I_0e^{-2r^2/w^2}$, find the power through a circular aperture of radius $a$, $P(a) = \displaystyle\int_0^a I_0e^{-2r^2/w^2}\,2\pi r\,dr$, and the fraction of the whole beam that passes when $a = w$.`,
    visual: areaFig({ fn: '2*pi*x*e^(-2*x^2)', x: [-0.1, 2.3], y: [-0.1, 2.9], from: 0, to: 1, signed: false, xlabel: 'r / w', ylabel: '2πr I / I₀', caption: t`The integrand in units with $w = I_0 = 1$, shaded out to $a = w$.` }),
    steps: [
      { label: 'Spot the inside', text: t`The exponent $-2r^2/w^2$ is the inside function, and its derivative, $-4r/w^2$, is a multiple of the factor $r$ already present. Let $u = \dfrac{2r^2}{w^2}$.` },
      { label: 'Differential', text: t`$du = \dfrac{4r}{w^2}\,dr$, so $r\,dr = \dfrac{w^2}{4}\,du$.` },
      { label: 'New limits', text: t`$r = 0 \Rightarrow u = 0$; $r = a \Rightarrow u = \dfrac{2a^2}{w^2}$.` },
      { label: 'Integrate', text: t`$P(a) = 2\pi I_0\cdot\dfrac{w^2}{4}\displaystyle\int_0^{2a^2/w^2} e^{-u}\,du = \frac{\pi w^2 I_0}{2}\left(1 - e^{-2a^2/w^2}\right)$.` },
      { label: 'The whole beam', text: t`As $a \to \infty$, $P \to \dfrac{\pi w^2I_0}{2}$. So the fraction inside radius $a$ is $1 - e^{-2a^2/w^2}$; at $a = w$ it is $1 - e^{-2} = ${nice(1 - Math.exp(-2), 4)}$.` },
      { label: 'Sense check', text: t`Units: $I_0$ in W/m² times $w^2$ in m² gives watts. And $86\%$ is why $w$ — the radius where the intensity falls to $1/e^2$ of its peak — is the standard definition of a beam’s radius.` },
    ],
    answer: t`$P(a) = \dfrac{\pi w^2I_0}{2}\left(1 - e^{-2a^2/w^2}\right)$; an aperture of radius $w$ passes $86.5\%$ of the beam.`,
  },
  practice: [
    mcq({
      id: 'choose-u', difficulty: 1,
      prompt: t`Which substitution turns $\displaystyle\int \frac{\cos\sqrt{x}}{\sqrt{x}}\,dx$ into a basic integral?`,
      visual: curveFig({ fn: 'cos(sqrt(x))/sqrt(x)', x: [0, 30], y: [-0.6, 1.6], domain: [0.4, 30], caption: t`The integrand for $x > 0$: it oscillates more and more slowly as $\sqrt x$ grows.` }),
      choices: [t`$u = \sqrt{x}$`, t`$u = \cos\sqrt{x}$`, t`$u = \dfrac{1}{\sqrt{x}}$`, t`$u = x^{3/2}$`],
      answer: 0,
      why: {
        1: t`Then $du = -\dfrac{\sin\sqrt x}{2\sqrt x}dx$, and there is no $\sin\sqrt x$ in the integrand to absorb it.`,
        2: t`$du = -\tfrac12x^{-3/2}dx$ does not match anything left over.`,
        3: t`$x^{3/2}$ appears nowhere in the integrand; $du = \tfrac32\sqrt x\,dx$ does not match.`,
      },
      hints: [t`Look for the inside function. What is $\dfrac{d}{dx}\sqrt x$?`],
      teach: 'Choose u to be the inside function whose derivative (up to a constant) multiplies the rest.',
      explain: t`$u = \sqrt x$ gives $du = \dfrac{dx}{2\sqrt x}$, so $\dfrac{dx}{\sqrt x} = 2\,du$ and the integral is $2\int\cos u\,du = 2\sin\sqrt x + C$.`,
    }),
    expr({
      id: 'linear-power', difficulty: 2,
      gen(r) {
        const a = r.pick([2, 3, 5]), b = r.int(1, 4), n = r.pick([3, 4, 5]), d = a * (n + 1);
        return {
          prompt: t`Find $\displaystyle\int (${a}x + ${b})^{${n}}\,dx$.`,
          answer: `(${a}x + ${b})^${n + 1}/${d}`, answerTeX: t`\frac{(${a}x + ${b})^{${n + 1}}}{${d}}`,
          vars: { x: [-1, 1] }, mode: 'constant', integrand: `(${a}x + ${b})^${n}`,
          errors: [{ answer: `(${a}x + ${b})^${n + 1}/${n + 1}`, feedback: t`With $u = ${a}x + ${b}$, $dx = \tfrac{du}{${a}}$: divide by $${a}$ as well.` }, { answer: `${a}(${a}x + ${b})^${n + 1}/${n + 1}`, feedback: t`Differentiating would multiply by $${a}$; integrating divides by it.` }],
          hints: [t`Let $u = ${a}x + ${b}$, so $du = ${a}\,dx$ and $dx = \tfrac1{${a}}du$.`, t`$\tfrac1{${a}}\int u^{${n}}du = \tfrac1{${a}}\cdot\dfrac{u^{${n + 1}}}{${n + 1}}$.`],
          teach: 'For a linear inside function ax + b, integrate as if it were x, then divide by a.',
          explain: t`$\dfrac{1}{${a}}\cdot\dfrac{(${a}x + ${b})^{${n + 1}}}{${n + 1}} + C = \dfrac{(${a}x + ${b})^{${n + 1}}}{${d}} + C$. Differentiate to check: the chain rule brings back the $${a}$.`,
          visual: curveFig({ fn: `(${a}*x + ${b})^${n}`, x: [-(b / a) - 0.6, 0.6], y: fitY((x) => (a * x + b) ** n, -(b / a) - 0.5, 0.5), caption: t`The integrand $(${a}x + ${b})^{${n}}$: the shape of $x^{${n}}$, squeezed horizontally by $${a}$ and shifted.` }),
        };
      },
    }),
    expr({
      id: 'sin-over-cos', difficulty: 2,
      gen(r) {
        const c = r.int(2, 4);
        return {
          prompt: t`Find $\displaystyle\int \frac{\sin x}{${c} + \cos x}\,dx$.`,
          answer: `-ln(${c} + cos(x))`, answerTeX: t`-\ln(${c} + \cos x)`,
          vars: { x: [-3, 3] }, mode: 'constant', integrand: `sin(x)/(${c} + cos(x))`,
          errors: [{ answer: `ln(${c} + cos(x))`, feedback: t`$du = -\sin x\,dx$: the minus sign carries through.` }, { answer: `-cos(x)/(${c}x + sin(x))`, feedback: 'Top and bottom cannot be integrated separately. Substitute u for the denominator.' }],
          hints: [t`Let $u = ${c} + \cos x$; then $du = -\sin x\,dx$.`, t`The integral becomes $-\displaystyle\int\frac{du}{u}$.`],
          teach: t`When the numerator is (a multiple of) the derivative of the denominator, the integral is a logarithm: $\int\frac{g'}{g}dx = \ln|g| + C$.`,
          explain: t`$-\int\dfrac{du}{u} = -\ln|u| + C = -\ln(${c} + \cos x) + C$ (the absolute value is not needed: $${c} + \cos x > 0$).`,
          visual: curveFig({ fn: `sin(x)/(${c} + cos(x))`, x: [-6.5, 6.5], y: [-0.8, 0.8], caption: t`The integrand: odd and periodic, with period $2\pi$.` }),
        };
      },
    }),
    expr({
      id: 'exp-inverse', difficulty: 3,
      gen(r) {
        const k = r.int(1, 3);
        return {
          prompt: t`Find $\displaystyle\int \frac{e^{${k === 1 ? '' : k}/x}}{x^2}\,dx$ for $x > 0$.`,
          answer: `-e^(${k}/x)/${k}`, answerTeX: k === 1 ? t`-e^{1/x}` : t`-\frac{e^{${k}/x}}{${k}}`,
          vars: { x: [0.8, 3] }, mode: 'constant', integrand: `e^(${k}/x)/x^2`,
          errors: [{ answer: `e^(${k}/x)/${k}`, feedback: t`$\frac{d}{dx}\frac{${k}}{x} = -\frac{${k}}{x^2}$: keep the minus sign.` }, ...(k === 1 ? [] : [{ answer: `-${k}e^(${k}/x)`, feedback: t`$du = -\tfrac{${k}}{x^2}dx$, so $\tfrac{dx}{x^2} = -\tfrac{du}{${k}}$: divide by $${k}$.` }])],
          hints: [t`The inside function is the exponent, $u = \dfrac{${k === 1 ? 1 : k}}{x}$.`, t`$du = -\dfrac{${k}}{x^2}\,dx$, so $\dfrac{dx}{x^2} = -\dfrac{du}{${k}}$.`],
          teach: t`The inside of an exponential is often the right $u$ — check that its derivative is present.`,
          explain: t`$-\dfrac1{${k}}\int e^{u}du = -\dfrac{e^{${k}/x}}{${k}} + C$.`,
          visual: curveFig({ fn: `e^(${k}/x)/x^2`, x: [0, 4], y: [0, Math.min(14, Math.exp(k / 0.8) / 0.64) * 1.05], domain: [0.6, 4], caption: t`The integrand for $x > 0$ (cut off near the axis, where it blows up).` }),
        };
      },
    }),
    num({
      id: 'tan-def', difficulty: 3,
      gen(r) {
        const [b, bt, cb] = r.pick([[PI / 6, t`\pi/6`, t`\tfrac{\sqrt3}{2}`], [PI / 4, t`\pi/4`, t`\tfrac{\sqrt2}{2}`], [PI / 3, t`\pi/3`, t`\tfrac12`]]);
        const I = -Math.log(Math.cos(b));
        return {
          prompt: t`Evaluate $\displaystyle\int_0^{${bt}} \tan x\,dx$, to 4 significant figures.`,
          answer: I, tol: { rel: 0.0005 },
          integrand: 'tan(x)', limits: [0, b],
          errors: [{ value: Math.log(Math.cos(b)), feedback: t`With $u = \cos x$ the limits run from $1$ down to $${cb}$; mind the order and the minus sign from $du$.` }, { value: 1 / Math.cos(b) ** 2 - 1, feedback: t`$\sec^2x$ is the derivative of $\tan x$, not its antiderivative.` }],
          hints: [t`$\tan x = \dfrac{\sin x}{\cos x}$. Let $u = \cos x$, $du = -\sin x\,dx$.`, t`New limits: $x = 0 \Rightarrow u = 1$; $x = ${bt} \Rightarrow u = ${cb}$. The integral is $-\displaystyle\int_1^{${cb}} \frac{du}{u}$.`],
          teach: 'For a definite integral, change the limits to u-values and finish in u.',
          explain: t`$-\displaystyle\int_1^{${cb}}\frac{du}{u} = -\ln ${cb} + \ln 1 = ${nice(I, 5)}$.`,
          visual: areaFig({ fn: 'tan(x)', x: [-0.1, 1.45], y: [-0.2, 2.2], from: 0, to: b, signed: false, domain: [-0.1, 1.42], caption: t`$y = \tan x$ from $0$ to $${bt}$.` }),
        };
      },
    }),
    mcq({
      id: 'find-error-du', difficulty: 2, kind: 'error',
      prompt: t`A student writes $\displaystyle\int\cos(3x)\,dx = \sin(3x) + C$. What is wrong?`,
      visual: curveFig({ fn: 'cos(3*x)', x: [-2.2, 2.2], y: [-3.4, 3.4], label: 'cos 3x', labelAt: -1.9, labelDy: 18, curves: [{ fn: '3*cos(3*x)', color: 'violet', dash: true, width: 1.8, label: 'derivative of sin 3x', labelAt: 0.05, labelDx: 6 }], caption: t`The integrand (blue) and the derivative of the student’s answer (violet): three times too tall.` }),
      choices: [
        t`$du = 3\,dx$ was ignored: the answer is $\tfrac13\sin(3x) + C$`,
        t`It should be $-\sin(3x) + C$`,
        t`It should be $3\sin(3x) + C$`,
        t`It should be $\sin(3x)\cdot 3x + C$`,
      ],
      answer: 0,
      why: {
        1: t`$\frac{d}{dx}\sin u = +\cos u$; the minus sign belongs to the derivative of $\cos$.`,
        2: t`That would differentiate to $9\cos(3x)$. Integrating divides by the inner derivative.`,
        3: t`There is no product here: the $3$ is a constant inner derivative, not a factor to integrate.`,
      },
      hints: [t`Differentiate $\sin(3x)$ with the chain rule. Do you get $\cos(3x)$?`],
      teach: 'With u = 3x, dx = du/3: a constant inner derivative still has to be divided out.',
      explain: t`$\frac{d}{dx}\sin(3x) = 3\cos(3x)$, three times the integrand. With $u = 3x$, $\int\cos(3x)\,dx = \tfrac13\int\cos u\,du = \tfrac13\sin(3x) + C$.`,
    }),
  ],
  checkpoint: [
    expr({
      id: 'cp-chain-sin', difficulty: 2,
      gen(r) {
        const b = r.int(1, 3);
        return {
          prompt: t`Find $\displaystyle\int (2x + ${b})\sin(x^2 + ${b === 1 ? '' : b}x)\,dx$.`,
          answer: `-cos(x^2 + ${b}x)`, answerTeX: t`-\cos(x^2 + ${b === 1 ? '' : b}x)`,
          vars: { x: [-2, 2] }, mode: 'constant', integrand: `(2x + ${b})*sin(x^2 + ${b}x)`,
          errors: [{ answer: `cos(x^2 + ${b}x)`, feedback: t`An antiderivative of $\sin u$ is $-\cos u$.` }],
          hints: [t`$u = x^2 + ${b === 1 ? '' : b}x$, $du = (2x + ${b})\,dx$.`],
          teach: 'The factor in front is exactly du: the integral is ∫ sin u du.',
          explain: t`$\int\sin u\,du = -\cos u + C = -\cos(x^2 + ${b === 1 ? '' : b}x) + C$.`,
          visual: curveFig({ fn: `(2*x + ${b})*sin(x^2 + ${b}*x)`, x: [-2.5, 2], y: [-6, 6], caption: 'The integrand: the oscillation speeds up as the inside function grows.' }),
        };
      },
    }),
    num({
      id: 'cp-rocket-eq', difficulty: 3, transfer: true,
      gen(r) {
        const ve = r.pick([3200, 3400, 4400]), m0 = 20000, mdot = r.pick([25, 30, 40]), T = r.pick([200, 250, 300]);
        const F = ve * mdot, mf = m0 - mdot * T, dv = ve * Math.log(m0 / mf);
        return {
          prompt: t`An upper stage of starting mass $m_0 = 20\,000$ kg burns $\dot m = ${mdot}$ kg/s of propellant with exhaust speed $v_e = ${ve}$ m/s, giving a constant thrust $F = v_e\dot m = ${thou(F)}$ N. With no gravity or drag, its speed gain over a $${T}$ s burn is $\Delta v = \displaystyle\int_0^{${T}} \frac{F}{m_0 - \dot m t}\,dt$. Evaluate it, in m/s.`,
          answer: dv, units: 'm/s', tol: { rel: 0.003 },
          integrand: `${F}/(${m0} - ${mdot}*x)`, limits: [0, T],
          errors: [{ value: F * T / m0, feedback: 'That treats the mass as constant at m₀. The stage gets lighter, so it accelerates harder: substitute u = m₀ − ṁt.' }, { value: F * T / mf, feedback: 'That uses the final mass throughout. Integrate the changing mass.' }],
          hints: [t`Let $u = m_0 - \dot m t$, so $du = -\dot m\,dt$; the limits become $u = ${thou(m0)}$ and $u = ${thou(mf)}$.`, t`$\Delta v = -\dfrac{F}{\dot m}\displaystyle\int_{${thou(m0)}}^{${thou(mf)}}\frac{du}{u} = v_e\ln\frac{${thou(m0)}}{${thou(mf)}}$.`],
          teach: t`Substituting $u = m_0 - \dot m t$ turns thrust ÷ mass into the rocket equation, $\Delta v = v_e\ln(m_0/m_f)$.`,
          explain: t`$\Delta v = v_e\ln\dfrac{m_0}{m_f} = ${ve}\ln\dfrac{${thou(m0)}}{${thou(mf)}} = ${thou(dv)}$ m/s — Tsiolkovsky’s rocket equation, derived by one substitution.`,
          visual: areaFig({ fn: `${F}/(${m0} - ${mdot}*x)`, x: [-0.03 * T, 1.08 * T], y: [0, 1.15 * F / mf], from: 0, to: T, signed: false, xlabel: 't (s)', ylabel: 'a (m/s²)', domain: [0, T], caption: 'Acceleration F/m rising as propellant burns off; the shaded area is the speed gained. No gravity, no drag.' }),
        };
      },
    }),
    num({
      id: 'cp-esin', difficulty: 2,
      gen(r) {
        const [b, bt, sb, sbt] = r.pick([[PI / 6, t`\pi/6`, 0.5, t`\tfrac12`], [PI / 2, t`\pi/2`, 1, '1'], [PI / 3, t`\pi/3`, Math.sqrt(3) / 2, t`\tfrac{\sqrt3}{2}`]]);
        const I = Math.exp(sb) - 1;
        return {
          prompt: t`Evaluate $\displaystyle\int_0^{${bt}} e^{\sin x}\cos x\,dx$ to 4 significant figures.`,
          answer: I, tol: { rel: 0.0005 },
          integrand: 'e^(sin(x))*cos(x)', limits: [0, b],
          errors: [{ value: Math.exp(b) - 1, feedback: t`The limits must be converted: at $x = ${bt}$, $u = \sin(${bt}) = ${sbt}$.` }],
          hints: [t`$u = \sin x$, $du = \cos x\,dx$.`, t`Limits: $u$ runs from $\sin 0 = 0$ to $\sin(${bt}) = ${sbt}$.`],
          teach: 'Change the limits with the variable, then evaluate in u.',
          explain: t`$\displaystyle\int_0^{${sbt}} e^{u}\,du = e^{${sbt}} - 1 = ${nice(I, 5)}$.`,
          visual: areaFig({ fn: 'e^(sin(x))*cos(x)', x: [-0.1, 2], y: [-0.3, 1.6], from: 0, to: b, caption: t`$y = e^{\sin x}\cos x$ from $0$ to $${bt}$.` }),
        };
      },
    }),
  ],
  sources: [{ label: 'OpenStax Calculus Vol. 1, §5.5 Substitution', url: 'https://openstax.org/books/calculus-volume-1/pages/5-5-substitution' }],
});
