// Substitution: the chain rule run backwards, for indefinite and definite
// integrals (changing the limits).
import { lesson, mcq, num, expr } from '../../src/core/content.js';
import { nice, fmt } from '../../src/core/format.js';

const t = String.raw;

export default lesson({
  id: 'math1220.C2-0.2',
  title: 'Substitution, revisited',
  minutes: 9, difficulty: 2,
  intro: t`Substitution is the **chain rule run backwards**. When an integrand contains an inner function $g(x)$ together with its derivative $g'(x)$ — up to a constant factor — rename the inner function $u = g(x)$, so that $du = g'(x)\,dx$ and the integral becomes a simpler one in $u$:

$$\int_a^b f\big(g(x)\big)\,g'(x)\,dx = \int_{g(a)}^{g(b)} f(u)\,du$$

For a definite integral, **change the limits too**: $x = a$ becomes $u = g(a)$. Physics integrals arrive wrapped like this — $e^{-t/\tau}$ in every decay, $\sin(\omega t + \varphi)$ in every oscillation, $1/\sqrt{1 - v^2/c^2}$ in relativity.`,
  symbols: [
    { tex: 'u = g(x)', text: 'the **inner function** you rename — typically the inside of a power, root, exponential or trig function' },
    { tex: "g'(x)", text: 'its derivative, which must appear in the integrand as a factor (a constant multiple is fine)' },
    { tex: "du = g'(x)\\,dx", text: 'the differential: how a small step $dx$ in $x$ becomes a step $du$ in $u$' },
    { tex: 'f', text: 'the **outer function** — what is left once everything is written in terms of $u$' },
    { tex: 'g(a),\\ g(b)', text: 'the **new limits**: the values of $u$ at the old limits $x = a$ and $x = b$' },
  ],
  why: t`Substitution is the change of variables you will use all through physics — from time to phase angle, from radius to energy — and every later integration technique ends with one.`,
  visual: {
    type: 'graph',
    title: 'Different shapes, the same area',
    lead: t`Blue: the original integrand $2x\cos(x^2)$, shaded over $0 \le x \le b$. Orange: after substituting $u = x^2$, the new integrand $\cos u$, shaded over $0 \le u \le b^2$. The horizontal axis is $x$ for the blue curve and $u$ for the orange one.`,
    tasks: [
      t`Slide $b$: the two regions change shape differently, but their areas are always equal — both are $\sin(b^2)$.`,
      t`At $b = 0.5$ the orange region ends at $u = 0.25$: the substitution squeezes a short $u$-interval under a tall curve.`,
      t`Near $x = 0$ the blue curve is low because the factor $2x$ is small: $du = 2x\,dx$ is what converts one width into the other.`,
    ],
    params: {
      x: [-0.1, 1.7], y: [-0.15, 1.45], xlabel: 'x (blue) · u (orange)',
      sliders: [{ key: 'b', label: 'Upper limit $b$', min: 0.2, max: 1.25, step: 0.01, value: 1.15, explain: t`The blue region runs from $x = 0$ to $x = b$; the orange one from $u = 0$ to $u = b^2$.` }],
      curves: [
        { fn: '2*x*cos(x^2)', color: 'accent', label: '2x cos(x²)', labelAt: 0.92 },
        { fn: 'cos(x)', color: 'warn', label: 'cos u', labelAt: 1.45 },
      ],
      shade: [
        { fn: '2*x*cos(x^2)', from: 0, to: 'b', color: 'accent', alpha: 0.25 },
        { fn: 'cos(x)', from: 0, to: 'b^2', color: 'warn', alpha: 0.22 },
      ],
      vlines: [{ x: 'b', color: 'accent', label: 'x = b' }, { x: 'b^2', color: 'warn', label: 'u = b²' }],
      readouts: [
        { label: t`$u$-interval ends at $b^2$`, expr: 'b^2', digits: 3 },
        { label: t`each area $= \sin(b^2)$`, expr: 'sin(b^2)', digits: 4 },
      ],
    },
    caption: t`The areas come from the exact antiderivative $\sin(b^2)$. Where the regions overlap the colours mix; the outlines show each region.`,
  },
  example: {
    prompt: t`Evaluate $\displaystyle\int_0^2 x\left(x^2 + 1\right)^3 dx$.`,
    visual: {
      type: 'graph',
      params: { aspect: 'wide', x: [-0.1, 2.3], y: [0, 270], curves: [{ fn: 'x*(x^2 + 1)^3', color: 'accent', label: 'y = x(x² + 1)³', labelAt: 0.3 }], shade: [{ fn: 'x*(x^2 + 1)^3', from: 0, to: 2, color: 'accent', alpha: 0.22 }] },
      caption: 'The shaded area is the integral.',
    },
    steps: [
      { label: 'Spot the inner function', text: t`$x^2 + 1$ sits inside a power, and its derivative $2x$ is present up to a factor of 2. Let $u = x^2 + 1$.` },
      { label: 'Find du', text: t`$du = 2x\,dx$, so $x\,dx = \tfrac12\,du$.` },
      { label: 'Change the limits', text: t`$x = 0 \Rightarrow u = 1$ and $x = 2 \Rightarrow u = 5$. Now the old variable can disappear completely.` },
      { label: 'Integrate in u', text: t`$\displaystyle\int_0^2 x\left(x^2+1\right)^3dx = \frac12\int_1^5 u^3\,du = \frac12\left[\frac{u^4}{4}\right]_1^5 = \frac{625 - 1}{8} = 78.$` },
      { label: 'Check', text: t`$F(x) = \tfrac18\left(x^2+1\right)^4$ has $F'(x) = \tfrac18\cdot 4\left(x^2+1\right)^3\cdot 2x = x\left(x^2+1\right)^3$ ✓. The integrand is convex and climbs from $0$ to $250$, so the area must be below the triangle $\tfrac12 \cdot 2 \cdot 250 = 250$; $78$ fits.` },
    ],
    answer: t`$\displaystyle\int_0^2 x\left(x^2 + 1\right)^3 dx = 78$`,
  },
  practice: [
    mcq({
      id: 'choose-u', difficulty: 1,
      prompt: t`Which substitution turns $\displaystyle\int x^2\cos\left(x^3\right)dx$ into a basic integral?`,
      choices: [t`$u = x^3$`, t`$u = x^2$`, t`$u = \cos\left(x^3\right)$`, t`$u = 3x^2$`],
      answer: 0,
      why: {
        1: t`Then $du = 2x\,dx$, which does not match the $x^2\,dx$ in the integrand, and $\cos(x^3)$ is still not a function of $u$.`,
        2: t`Then $du = -3x^2\sin\left(x^3\right)dx$ — but there is no sine in the integrand.`,
        3: t`$3x^2$ is the *derivative* of the inner function, not the inner function itself.`,
      },
      hints: ['Look for a function sitting inside another function.', 'Its derivative should also appear as a factor, up to a constant.'],
      teach: 'Choose u to be the inner function whose derivative also appears as a factor.',
      explain: t`With $u = x^3$, $du = 3x^2\,dx$, so $x^2\,dx = \tfrac13\,du$ and the integral is $\tfrac13\int\cos u\,du = \tfrac13\sin\left(x^3\right) + C$.`,
      visual: { type: 'graph', params: { aspect: 'wide', x: [-0.1, 1.85], y: [-3.6, 3.6], curves: [{ fn: 'x^2*cos(x^3)', color: 'accent', label: 'y = x² cos(x³)', labelAt: 0.35 }] }, caption: t`The integrand. Its oscillations speed up as $x^3$ grows — the inside function sets the pace.` },
    }),
    expr({
      id: 'power-inner', difficulty: 2,
      gen(r) {
        const k = r.int(1, 5), n = r.int(2, 4), m = n + 1;
        return {
          prompt: t`Find $\displaystyle\int x\left(x^2 + ${k}\right)^{${n}}dx$.`,
          answer: `(x^2 + ${k})^${m}/${2 * m}`,
          answerTeX: t`\frac{\left(x^2 + ${k}\right)^{${m}}}{${2 * m}} + C`,
          vars: { x: [-1.5, 1.5] }, mode: 'constant',
          errors: [{ answer: `(x^2 + ${k})^${m}/${m}`, feedback: t`You dropped the $\tfrac12$: $du = 2x\,dx$ means $x\,dx = \tfrac12\,du$.` }],
          hints: [t`Let $u = x^2 + ${k}$, so $du = 2x\,dx$.`, t`Then $x\,dx = \tfrac12\,du$ and the integral is $\tfrac12\int u^{${n}}\,du$.`],
          teach: t`When $du$ is off by a constant factor, divide by that constant — here $x\,dx = \tfrac12\,du$.`,
          explain: t`$\tfrac12\int u^{${n}}\,du = \tfrac12\cdot\dfrac{u^{${m}}}{${m}} = \dfrac{\left(x^2+${k}\right)^{${m}}}{${2 * m}} + C$.`,
          visual: (() => {
            const M = 1.3 * (1.69 + k) ** n;
            return { type: 'graph', params: { aspect: 'wide', x: [-1.45, 1.45], y: [-1.15 * M, 1.15 * M], curves: [{ fn: `x*(x^2 + ${k})^${n}`, color: 'accent', domain: [-1.3, 1.3] }] }, caption: t`The integrand is odd — symmetric through the origin — so its antiderivatives are even functions, as a power of $x^2 + ${k}$ is.` };
          })(),
        };
      },
    }),
    expr({
      id: 'decay-exp', difficulty: 2,
      gen(r) {
        const a = r.int(2, 6);
        return {
          prompt: t`Find $\displaystyle\int e^{-x/${a}}\,dx$. (This is the integral behind every exponential decay with time constant $${a}$.)`,
          answer: `-${a}e^(-x/${a})`,
          answerTeX: t`-${a}\,e^{-x/${a}} + C`,
          vars: { x: [-2, 3] }, mode: 'constant',
          errors: [
            { answer: `-e^(-x/${a})/${a}`, feedback: t`You divided by $${a}$. With $u = -x/${a}$, $du = -\tfrac1{${a}}\,dx$, so $dx = -${a}\,du$: you multiply by $-${a}$.` },
            { answer: `${a}e^(-x/${a})`, feedback: t`Check the sign: differentiating $${a}e^{-x/${a}}$ gives $-e^{-x/${a}}$.` },
          ],
          hints: [t`Let $u = -x/${a}$, so $du = -\tfrac1{${a}}\,dx$.`, t`Then $dx = -${a}\,du$, and $\int e^u\,du = e^u$.`],
          teach: t`For a linear inside, $\int f(kx)\,dx = \tfrac1k F(kx) + C$ — the chain-rule factor goes in the denominator.`,
          explain: t`$\int e^{-x/${a}}\,dx = -${a}\int e^u\,du = -${a}e^{-x/${a}} + C$. Check: $\frac{d}{dx}\left(-${a}e^{-x/${a}}\right) = -${a}\cdot\left(-\tfrac1{${a}}\right)e^{-x/${a}} = e^{-x/${a}}$ ✓`,
          visual: { type: 'graph', params: { aspect: 'wide', x: [-0.5, 4 * a], y: [-0.1, 1.2], curves: [{ fn: `e^(-x/${a})`, color: 'accent', label: `e^(−x/${a})`, labelAt: a }], vlines: [{ x: a, label: `x = ${a}` }] }, caption: t`The integrand falls to $1/e \approx 0.37$ of its starting value at $x = ${a}$, its time constant.` },
        };
      },
    }),
    expr({
      id: 'log-power', difficulty: 2,
      gen(r) {
        const n = r.int(2, 4), m = n + 1;
        return {
          prompt: t`Find $\displaystyle\int \frac{(\ln x)^{${n}}}{x}\,dx$.`,
          answer: `(ln x)^${m}/${m}`,
          answerTeX: t`\frac{(\ln x)^{${m}}}{${m}} + C`,
          vars: { x: [1.2, 5] }, mode: 'constant',
          errors: [
            { answer: `(ln x)^${m}`, feedback: t`Divide by the new power: $\int u^{${n}}\,du = \dfrac{u^{${m}}}{${m}}$.` },
            { answer: `(ln x)^${m}/(${m}x)`, feedback: t`The $\tfrac1x$ was used up as $du = \tfrac{dx}{x}$; it does not stay in the answer.` },
          ],
          hints: [t`Which function has derivative $\tfrac1x$?`, t`Let $u = \ln x$, so $du = \dfrac{dx}{x}$ and the integral is $\int u^{${n}}\,du$.`],
          teach: t`A factor $\tfrac1x$ next to a function of $\ln x$ signals the substitution $u = \ln x$.`,
          explain: t`$\int u^{${n}}\,du = \dfrac{u^{${m}}}{${m}} = \dfrac{(\ln x)^{${m}}}{${m}} + C$.`,
          visual: (() => {
            const M = Math.log(6) ** n / 6;
            return { type: 'graph', params: { aspect: 'wide', x: [0.6, 6.2], y: [-0.08 * M, 1.2 * M], curves: [{ fn: `ln(x)^${n}/x`, color: 'accent', domain: [0.7, 6.2] }], shade: [{ fn: `ln(x)^${n}/x`, from: 1, to: 'e', color: 'accent', alpha: 0.25 }], vlines: [{ x: 'e', label: 'x = e' }] }, caption: t`With $u = \ln x$, the shaded stretch from $x = 1$ to $x = e$ becomes $0 \le u \le 1$; its area is $\int_0^1 u^{${n}}\,du$.` };
          })(),
        };
      },
    }),
    num({
      id: 'definite-limits', difficulty: 2,
      gen(r) {
        const [a, c] = r.pick([[4, 3], [3, 4], [8, 6], [6, 8], [12, 5], [5, 12]]);
        const top = a * a + c * c, val = (top ** 1.5 - c ** 3) / 3;
        return {
          prompt: t`Evaluate $\displaystyle\int_0^{${a}} x\sqrt{x^2 + ${c * c}}\;dx$.`,
          answer: val, tol: { rel: 0.002 },
          errors: [
            { value: a ** 1.5 / 3, feedback: t`It looks like you kept the old limits $0$ and $${a}$ after switching to $u$. In terms of $u = x^2 + ${c * c}$ the limits are $${c * c}$ and $${top}$.` },
            { value: 2 * val, feedback: t`Missing factor $\tfrac12$: $x\,dx = \tfrac12\,du$.` },
          ],
          hints: [t`Let $u = x^2 + ${c * c}$, so $x\,dx = \tfrac12\,du$.`, t`New limits: $x = 0 \Rightarrow u = ${c * c}$; $x = ${a} \Rightarrow u = ${top}$. Then $\tfrac12\int u^{1/2}\,du = \tfrac13 u^{3/2}$.`],
          teach: 'Changing the limits to u-values lets you finish without ever going back to x.',
          explain: t`$\tfrac12\int_{${c * c}}^{${top}} u^{1/2}\,du = \tfrac13\left[u^{3/2}\right]_{${c * c}}^{${top}} = \tfrac13\left(${Math.round(top ** 1.5)} - ${c ** 3}\right) = ${nice(val)}$.`,
          visual: { type: 'graph', params: { aspect: 'wide', x: [-0.3, a * 1.15], y: [0, a * Math.sqrt(top) * 1.15], curves: [{ fn: `x*sqrt(x^2 + ${c * c})`, color: 'accent' }], shade: [{ fn: `x*sqrt(x^2 + ${c * c})`, from: 0, to: a, color: 'accent', alpha: 0.22 }] }, caption: 'The shaded area is the integral.' },
        };
      },
    }),
    mcq({
      id: 'find-error', difficulty: 3, kind: 'error',
      prompt: t`A student writes, with $u = x^2$:

$$\int_0^2 2x\,e^{x^2}dx = \int_0^2 e^u\,du = e^2 - 1.$$

What went wrong?`,
      choices: [
        t`The limits were not changed: in $u$ they run from $0$ to $4$, so the answer is $e^4 - 1$`,
        t`$du$ is $x\,dx$, so the answer is $\tfrac12\left(e^2 - 1\right)$`,
        t`$\int e^u\,du = \dfrac{e^{u+1}}{u+1}$`,
        t`The answer needs a $+\,C$`,
      ],
      answer: 0,
      why: {
        1: t`$u = x^2$ gives $du = 2x\,dx$ exactly, and $2x\,dx$ is right there in the integrand.`,
        2: t`That applies the power rule to an exponential. $e^u$ is its own antiderivative.`,
        3: t`A definite integral is a number; there is no constant to add.`,
      },
      hints: [t`Check every piece: $u$, $du$, the new integrand, and the limits.`, t`The limits $0$ and $2$ were values of $x$. What is $u = x^2$ at $x = 2$?`],
      teach: 'In a definite integral, the limits belong to the variable: change them when you change variables.',
      explain: t`At $x = 2$, $u = 4$. The integral is $\int_0^4 e^u\,du = e^4 - 1 \approx 53.6$.`,
      visual: { type: 'graph', params: { aspect: 'wide', x: [-0.1, 2.2], y: [0, 240], curves: [{ fn: '2*x*e^(x^2)', color: 'accent', domain: [0, 2.12] }], shade: [{ fn: '2*x*e^(x^2)', from: 0, to: 2, color: 'accent', alpha: 0.25 }] }, caption: t`The shaded area is the integral. Near $x = 2$ the curve is over 200 high — is an answer of $e^2 - 1 \approx 6.4$ plausible?` },
    }),
    num({
      id: 'sin-power-cos', difficulty: 2,
      gen(r) {
        const n = r.int(2, 6);
        return {
          prompt: t`Evaluate $\displaystyle\int_0^{\pi/2} \sin^{${n}}x\,\cos x\;dx$. A fraction or a decimal is fine.`,
          answer: 1 / (n + 1), tol: { rel: 0.002 },
          errors: [{ value: (Math.PI / 2) ** (n + 1) / (n + 1), feedback: t`You kept the $x$-limits. With $u = \sin x$, the limits become $\sin 0 = 0$ and $\sin\tfrac{\pi}{2} = 1$.` }],
          hints: [t`Let $u = \sin x$, so $du = \cos x\,dx$.`, t`The limits become $u = 0$ and $u = 1$, giving $\int_0^1 u^{${n}}\,du$.`],
          teach: t`With $u = \sin x$ the limits $0$ and $\tfrac{\pi}{2}$ become $0$ and $1$.`,
          explain: t`$\int_0^1 u^{${n}}\,du = \left[\dfrac{u^{${n + 1}}}{${n + 1}}\right]_0^1 = \dfrac{1}{${n + 1}} \approx ${fmt(1 / (n + 1))}$.`,
          visual: { type: 'graph', params: { aspect: 'wide', x: [-0.1, 1.75], y: [-0.05, 0.75], curves: [{ fn: `sin(x)^${n}*cos(x)`, color: 'accent' }], shade: [{ fn: `sin(x)^${n}*cos(x)`, from: 0, to: 'pi/2', color: 'accent', alpha: 0.25 }] }, caption: 'The shaded area is the integral.' },
        };
      },
    }),
  ],
  checkpoint: [
    expr({
      id: 'cp-log', difficulty: 2,
      gen(r) {
        const k = r.int(1, 6);
        return {
          prompt: t`Find $\displaystyle\int \frac{x^2}{x^3 + ${k}}\,dx$ for $x > 0$.`,
          answer: `ln(x^3 + ${k})/3`,
          answerTeX: t`\tfrac13\ln\left(x^3 + ${k}\right) + C`,
          vars: { x: [0.2, 3] }, mode: 'constant',
          errors: [{ answer: `ln(x^3 + ${k})`, feedback: t`Missing $\tfrac13$: $du = 3x^2\,dx$, so $x^2\,dx = \tfrac13\,du$.` }],
          hints: [t`Let $u = x^3 + ${k}$; then $x^2\,dx = \tfrac13\,du$ and you need $\int \tfrac{du}{u}$.`],
          teach: t`When the numerator is a multiple of the denominator’s derivative, the integral is a logarithm.`,
          explain: t`$\tfrac13\int\dfrac{du}{u} = \tfrac13\ln|u| = \tfrac13\ln\left(x^3 + ${k}\right) + C$ (the argument is positive here).`,
          visual: { type: 'graph', params: { aspect: 'wide', x: [-0.1, 3.2], y: [-0.05, 1.05 * Math.max(...[0.5, 1, 1.5, 2, 2.5, 3].map((x) => (x * x) / (x ** 3 + k)))], curves: [{ fn: `x^2/(x^3 + ${k})`, color: 'accent', domain: [0, 3.2] }] }, caption: 'The integrand is positive for x > 0, so every antiderivative increases there.' },
        };
      },
    }),
    num({
      id: 'cp-impulse', difficulty: 3, transfer: true,
      gen(r) {
        const F0 = r.pick([120, 150, 200, 250]), tau = r.pick([1.5, 2, 2.5]), T = r.pick([2, 3, 4]);
        const J = F0 * tau * (1 - Math.exp(-T / tau));
        return {
          prompt: t`A small solid rocket motor’s thrust tails off after ignition. Model it as $F(t) = ${F0}\,e^{-t/${tau}}$ N, with $t$ in seconds. What total impulse $J = \int_0^{${T}} F(t)\,dt$ does it deliver in the first ${T} s? Give 3 significant figures.`,
          answer: J, units: 'N s', tol: { rel: 0.005 },
          errors: [{ value: F0 * T, feedback: t`That assumes the thrust stayed at ${F0} N for the whole ${T} s. It decays, so integrate it.` }],
          hints: [t`Let $u = -t/${tau}$, so $dt = -${tau}\,du$. An antiderivative of $e^{-t/${tau}}$ is $-${tau}\,e^{-t/${tau}}$.`, t`$J = ${F0}\left[-${tau}\,e^{-t/${tau}}\right]_0^{${T}} = ${F0}\cdot ${tau}\left(1 - e^{-${T}/${tau}}\right)$.`],
          teach: 'Impulse is the time integral of force; an exponential tail-off integrates with a linear substitution.',
          explain: t`$J = ${F0}\cdot${tau}\left(1 - e^{-${T}/${tau}}\right) = ${nice(F0 * tau)}\times${fmt(1 - Math.exp(-T / tau))} \approx ${fmt(J)}$ N·s. As $T \to \infty$ it would approach $${nice(F0 * tau)}$ N·s.`,
          visual: { type: 'graph', params: { aspect: 'wide', x: [0, 6], y: [0, F0 * 1.15], xlabel: 't (s)', ylabel: 'F (N)', curves: [{ fn: `${F0}*e^(-x/${tau})`, color: 'accent' }], shade: [{ fn: `${F0}*e^(-x/${tau})`, from: 0, to: T, color: 'accent', alpha: 0.25 }] }, caption: 'A teaching model of a thrust tail-off; real thrust curves are measured, not exponential. The shaded area is the impulse.' },
        };
      },
    }),
    mcq({
      id: 'cp-why-not', difficulty: 2,
      prompt: t`Why can $\displaystyle\int x\,e^{x^2}dx$ be done by substitution, while $\displaystyle\int e^{x^2}dx$ cannot?`,
      choices: [
        t`With $u = x^2$, $du = 2x\,dx$ needs a factor $x$ in the integrand; $\int e^{x^2}dx$ has none, and in fact it has no elementary antiderivative`,
        t`$e^{x^2}$ grows too fast to be integrated`,
        t`The second one needs $u = e^{x^2}$ instead`,
        t`Substitution only works for definite integrals`,
      ],
      answer: 0,
      why: {
        1: t`Growth rate is irrelevant: $\int x^2 e^{x^3}dx = \tfrac13 e^{x^3} + C$ grows even faster and is easy.`,
        2: t`Then $du = 2x\,e^{x^2}dx$, which again needs a factor of $x$ that is not there.`,
        3: t`Substitution works for indefinite and definite integrals alike.`,
      },
      hints: [t`Write out $du$ for $u = x^2$. Is all of it in the integrand?`, t`Substitution trades $g'(x)\,dx$ for $du$ — the $g'(x)$ has to be present.`],
      teach: t`Substitution needs the inner function’s derivative to be present as a factor; it cannot conjure a missing one.`,
      explain: t`$\int x e^{x^2}dx = \tfrac12 e^{x^2} + C$. But $\int e^{x^2}dx$ cannot be written with elementary functions at all — it is handled with series or numerically (it is related to the error function).`,
      visual: { type: 'graph', params: { aspect: 'wide', x: [-1.6, 1.6], y: [-15, 15], curves: [{ fn: 'x*e^(x^2)', color: 'accent', label: 'x e^(x²)', labelAt: -1.45, labelDy: 14 }, { fn: 'e^(x^2)', color: 'warn', label: 'e^(x²)', labelAt: 0.25 }] }, caption: t`The two integrands. Only one of them carries the extra factor $x$.` },
    }),
  ],
  sources: [{ label: 'OpenStax Calculus Vol. 2, §1.5 Substitution', url: 'https://openstax.org/books/calculus-volume-2/pages/1-5-substitution' }],
});
