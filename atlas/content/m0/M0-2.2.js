// Rational expressions — cancel factors, never terms; combine over a common denominator.
import { lesson, mcq, num, expr } from '../../src/core/content.js';
import { nice, sig } from '../../src/core/format.js';
import { N, bothSides } from './_m0kit.js';

const t = String.raw;

// one curve per choice value k of the explore graph's 'm' choice
const on = (k) => `step(0.5 - abs(m - ${k}))`;

export default lesson({
  id: 'm0.M0-2.2',
  title: 'Rational expressions',
  minutes: 8, difficulty: 2,
  intro: t`A rational expression is a fraction of polynomials, and it obeys the rules of fractions. The one that matters most: you may cancel a common **factor** of the whole numerator and the whole denominator — never a **term**.

$$\frac{a\,c}{b\,c} = \frac{a}{b} \quad (c \ne 0), \qquad\text{but}\qquad \frac{a + c}{b + c} \ne \frac{a}{b}$$

Sums are combined over a common denominator. Physics produces these constantly: reduced masses, springs in series, the thin-lens equation, every difference quotient.`,
  symbols: [
    { tex: 'a,\\ b', text: 'any expressions; $b$ is the rest of the denominator' },
    { tex: 'c', text: 'a common **factor**: something the whole numerator and the whole denominator are multiplied by' },
    { tex: 'c \\ne 0', text: 'the condition for cancelling: where $c = 0$ the original expression is undefined, and stays so' },
  ],
  why: t`Every derivative from first principles is a rational expression whose bad factor $h$ must be cancelled before $h \to 0$ — and the same algebra combines resistors, springs and lenses.`,
  visual: {
    type: 'graph',
    title: 'Legal and illegal cancellations, as graphs',
    lead: t`Blue is the expression before a simplification, dashed gold is after. A correct simplification gives the same curve — perhaps with a single missing point. Pick a simplification.`,
    tasks: [
      t`Cancel a factor: $\dfrac{x^2 - 4}{x - 2} = x + 2$. The curves coincide everywhere except the hole at $x = 2$.`,
      t`Cancel a term: $\dfrac{x + 6}{x + 3} \to \dfrac{6}{3} = 2$. The curves meet at $x = 0$ only — the “simplification” changed the function.`,
      t`Split a denominator: $\dfrac{1}{x + 1} \to \dfrac1x + 1$. Different everywhere: $\tfrac{1}{a + b} \ne \tfrac1a + \tfrac1b$.`,
    ],
    params: {
      x: [-5, 5], y: [-6, 8],
      choices: [{ key: 'm', label: 'Simplification', options: [[1, 'cancel a factor'], [2, 'cancel a term'], [3, 'split a denominator']], value: 1 }],
      curves: [
        { fn: '(x^2 - 4)/(x - 2)', color: 'accent', width: 4, when: on(1) }, { fn: 'x + 2', color: 'gold', dash: true, when: on(1) },
        { fn: '(x + 6)/(x + 3)', color: 'accent', domain: [-5, -3.04], when: on(2) }, { fn: '(x + 6)/(x + 3)', color: 'accent', domain: [-2.96, 5], when: on(2) }, { fn: '2', color: 'gold', dash: true, when: on(2) },
        { fn: '1/(x + 1)', color: 'accent', domain: [-5, -1.04], when: on(3) }, { fn: '1/(x + 1)', color: 'accent', domain: [-0.96, 5], when: on(3) },
        { fn: '1/x + 1', color: 'gold', dash: true, domain: [-5, -0.08], when: on(3) }, { fn: '1/x + 1', color: 'gold', dash: true, domain: [0.08, 5], when: on(3) },
      ],
      points: [{ x: 2, y: 4, hollow: true, color: 'accent', r: 5, label: 'hole at x = 2', when: on(1) }, { x: 0, y: 2, color: 'good', r: 4, label: 'agree only here', when: on(2) }],
      legend: [{ label: 'before', color: 'accent' }, { label: 'after', color: 'gold', dash: true }], legendAt: 'tl',
    },
    caption: t`Vertical asymptotes are left undrawn: the curves simply break there. The hole is a single missing point, invisible to most plotting software.`,
  },
  example: {
    prompt: t`Two bodies of masses $m_1$ and $m_2$ orbiting each other behave like one body of **reduced mass** $\mu = \left(m_1^{-1} + m_2^{-1}\right)^{-1}$. Simplify $\mu$ to a single fraction.`,
    visual: { type: 'graph', params: { x: [0, 6], y: [0, 4], aspect: 'wide', xlabel: 'm₂ (in units of m₁)', ylabel: 'mass (units of m₁)',
      curves: [{ fn: 'x/(1 + x)', color: 'accent', label: 'μ = m₁m₂/(m₁ + m₂)', labelAt: 4.2, labelDy: 14 }, { fn: '1 + x', color: 'bad', dash: true, domain: [0, 3], label: 'm₁ + m₂ (the slip)', labelAt: 1.4, labelDx: 10 }],
      hlines: [{ y: 1, label: 'm₁', color: 'ink3' }] },
      caption: t`With $m_1 = 1$: the reduced mass is always below both masses and approaches $m_1$ as $m_2$ grows. The dashed line is what the slip $(a^{-1} + b^{-1})^{-1} = a + b$ would give.` },
    steps: [
      { label: 'Rewrite', text: t`$m^{-1} = \dfrac1m$, so $\mu = \dfrac{1}{\dfrac1{m_1} + \dfrac1{m_2}}$.` },
      { label: 'Common denominator', text: t`$\dfrac1{m_1} + \dfrac1{m_2} = \dfrac{m_2}{m_1m_2} + \dfrac{m_1}{m_1m_2} = \dfrac{m_1 + m_2}{m_1 m_2}$.` },
      { label: 'Invert', text: t`One over a fraction flips it: $\mu = \dfrac{m_1 m_2}{m_1 + m_2}$.` },
      { label: 'Sense check', text: t`If $m_2 \gg m_1$ (a satellite and Earth), $\mu \approx \dfrac{m_1 m_2}{m_2} = m_1$: the light body does all the moving. If $m_1 = m_2 = m$, $\mu = m/2$. Units: kg·kg/kg = kg ✓.` },
    ],
    answer: t`$\mu = \dfrac{m_1 m_2}{m_1 + m_2}$ — not $m_1 + m_2$.`,
  },
  practice: [
    mcq({
      id: 'simplify-cancel', difficulty: 2,
      prompt: t`Simplify $\dfrac{x^2 - 9}{x^2 + x - 6}$.`,
      visual: { type: 'graph', params: { x: [-6, 6], y: [-6, 8], aspect: 'wide',
        curves: [{ fn: '(x^2 - 9)/(x^2 + x - 6)', color: 'accent', domain: [-6, 1.94] }, { fn: '(x^2 - 9)/(x^2 + x - 6)', color: 'accent', domain: [2.06, 6] }],
        points: [{ x: -3, y: 1.2, hollow: true, color: 'accent', r: 5 }] },
        caption: t`The expression as given, plotted. The open circle marks a point where it is undefined, though the curve on either side is smooth.` },
      choices: [t`$\dfrac{x - 3}{x - 2}$, for $x \ne -3$ and $x \ne 2$`, t`$\dfrac{-9}{x - 6}$`, t`$\dfrac{3}{2}$`, t`$\dfrac{x - 3}{x - 2}$, equal to the original for every $x \ne 2$`],
      answer: 0,
      why: {
        1: t`That cancels the $x^2$ terms. Only a factor of the *whole* numerator and *whole* denominator can cancel.`,
        2: t`That cancels every $x$ and keeps $-9/-6$: cancelling terms throughout. Try $x = 0$: the original is $-9/-6 = 1.5$, but at $x = 1$ it is $-8/-4 = 2$, not $1.5$.`,
        3: t`Right form, wrong domain: at $x = -3$ the original is $0/0$, undefined, while $\tfrac{x-3}{x-2}$ gives $1.2$. Cancelling $(x + 3)$ does not remove that hole.`,
      },
      hints: [t`Factor both: $x^2 - 9 = (x - 3)(x + 3)$ and $x^2 + x - 6 = (x + 3)(x - 2)$.`, t`Cancel the common factor, and note where it was zero.`],
      teach: t`Factor first, cancel common factors, and carry the excluded values with you.`,
      explain: t`$\dfrac{(x-3)(x+3)}{(x+3)(x-2)} = \dfrac{x-3}{x-2}$ wherever $x + 3 \ne 0$; the original is also undefined at $x = 2$. The graph shows both: a hole at $x = -3$ and an asymptote at $x = 2$.`,
    }),
    expr({
      id: 'single-fraction', difficulty: 2,
      gen(r) {
        const a = r.int(1, 5), b = r.int(1, 5), c = r.int(1, 4);
        return {
          prompt: t`Write $\dfrac{${a}}{x} + \dfrac{${b}}{x + ${c}}$ as a single fraction.`,
          answer: `(${a + b}x + ${a * c})/(x(x + ${c}))`, answerTeX: t`\dfrac{${a + b}x + ${a * c}}{x(x + ${c})}`,
          vars: { x: [0.5, 3] },
          errors: [{ answer: `${a + b}/(2x + ${c})`, feedback: t`Adding tops and adding bottoms is not how fractions add: $\tfrac12 + \tfrac12$ is not $\tfrac24$.` }, { answer: `${a + b}/(x(x + ${c}))`, feedback: t`Each numerator must be multiplied by the factor its denominator was missing: $${a}(x + ${c})$ and $${b}x$.` }],
          hints: [t`The common denominator is $x(x + ${c})$.`, t`$\dfrac{${a}}{x} = \dfrac{${a}(x + ${c})}{x(x + ${c})}$ and $\dfrac{${b}}{x + ${c}} = \dfrac{${b}x}{x(x + ${c})}$.`],
          teach: t`To add fractions, rewrite each over the common denominator, scaling its numerator by the same factor.`,
          explain: t`$\dfrac{${a}(x + ${c}) + ${b}x}{x(x + ${c})} = \dfrac{${a + b}x + ${a * c}}{x(x + ${c})}$.`,
          visual: { type: 'graph', params: { x: [0, 5], y: [0, 6], aspect: 'wide', curves: [{ fn: `${a}/x`, color: 'accent', dash: true, domain: [0.05, 5], label: `${a}/x`, labelAt: 4.2, labelDy: -12 }, { fn: `${b}/(x + ${c})`, color: 'gold', dash: true, domain: [0, 5], label: `${b}/(x + ${c})`, labelAt: 3.2, labelDy: 14 }, { fn: `${a}/x + ${b}/(x + ${c})`, color: 'violet', domain: [0.05, 5], label: 'sum', labelAt: 1.2, labelDx: 8 }] },
            caption: t`The two fractions (dashed) and their sum, for $x > 0$. Your single fraction must trace the violet curve.` },
        };
      },
    }),
    mcq({
      id: 'cancel-terms', difficulty: 2, kind: 'error',
      prompt: t`A student writes $\dfrac{x + 6}{x + 3} = \dfrac{6}{3} = 2$. What is the error?`,
      visual: bothSides({ lhs: '(x + 6)/(x + 3)', rhs: '2', x: [-2.5, 6], y: [-0.5, 4.5], xticks: null, lhsDomain: [-2.6, 6], lhsLabel: 'y = (x + 6)/(x + 3)', rhsLabel: 'y = 2', legendAt: 'tr', caption: t`Both sides of the student’s equation, for $x > -2.5$.` }),
      choices: [t`$x$ is a term, not a factor, of the numerator and denominator, so it cannot be cancelled`, t`None: it holds for every $x \ne -3$`, t`It should be $\tfrac63 + 1 = 3$`, t`It should be $x + 2$`],
      answer: 0,
      why: {
        1: t`Test $x = 3$: $\tfrac{9}{6} = 1.5$, not $2$. The curves meet only at $x = 0$.`,
        2: t`Cancelling the $x$s and then adding 1 for the “cancelled” part is still cancelling a term.`,
        3: t`At $x = 3$, $x + 2 = 5$ while the fraction is $1.5$. No rearrangement of the terms makes $\tfrac{x + 6}{x + 3}$ a polynomial.`,
      },
      hints: [t`Substitute a number, say $x = 3$, into both sides.`, t`Is $x$ multiplied by everything else in the numerator, or added to it?`],
      teach: t`Cancel only factors — things that multiply the whole numerator and the whole denominator.`,
      explain: t`$x + 6$ and $x + 3$ share no factor, so $\tfrac{x + 6}{x + 3}$ does not simplify. (It can be rewritten as $1 + \tfrac{3}{x + 3}$, which shows it approaches 1, not 2, for large $x$.)`,
    }),
    num({
      id: 'thin-lens', difficulty: 2,
      gen(r) {
        const [f, dO] = r.pick([[10, 30], [10, 40], [20, 60], [15, 60], [20, 30], [15, 45], [10, 25]]);
        const di = f * dO / (dO - f);
        return {
          prompt: t`A camera lens of focal length $f = ${f}$ cm images an object $d_o = ${dO}$ cm away. The thin-lens equation is $\dfrac1f = \dfrac1{d_o} + \dfrac1{d_i}$. How far behind the lens is the image, $d_i$?`,
          answer: di, units: 'cm', tol: { rel: 0.005 },
          errors: [{ value: dO - f, feedback: t`The *reciprocals* subtract, not the distances: $\tfrac1{d_i} = \tfrac1f - \tfrac1{d_o}$.` }, { value: f * dO / (dO + f), feedback: t`Sign slip: $\tfrac1{d_i} = \tfrac1f - \tfrac1{d_o}$, a difference, not a sum.` }],
          hints: [t`$\dfrac1{d_i} = \dfrac1{${f}} - \dfrac1{${dO}}$.`, t`Common denominator: $\dfrac{${dO} - ${f}}{${f * dO}}$; then flip.`],
          teach: t`Solving a reciprocal equation: isolate the reciprocal, combine over a common denominator, then invert.`,
          explain: t`$\dfrac1{d_i} = \dfrac{${dO - f}}{${f * dO}}$, so $d_i = \dfrac{${f * dO}}{${dO - f}} = ${nice(sig(di, 4))}$ cm.`,
          visual: { type: 'optics-rays', params: { mode: 'lens', f, dO, hO: 3, unit: 'cm', image: false, controls: false, readout: false, drag: false, hide: ['image', 'di', 'm'] }, caption: t`The object and the lens with its focal points; the rays stop at the lens so the image is left for you to find. Thin-lens (paraxial) approximation.` },
        };
      },
    }),
    expr({
      id: 'reciprocal-dq', difficulty: 3,
      gen(r) {
        const a = r.int(2, 4);
        return {
          prompt: t`Simplify the slope of the secant of $y = 1/x$ between $x = ${a}$ and a nearby $x$: $\;\dfrac{\frac1x - \frac1{${a}}}{x - ${a}}$.`,
          lhs: t`\dfrac{\frac1x - \frac1{${a}}}{x - ${a}}`,
          answer: `-1/(${a}x)`, answerTeX: t`-\dfrac{1}{${a}x}`,
          vars: { x: [a + 0.3, a + 2] },
          errors: [{ answer: `1/(${a}x)`, feedback: t`Watch the sign: $${a} - x = -(x - ${a})$.` }, { answer: `-1/${a * a}`, feedback: t`That is the limit as $x \to ${a}$ (the derivative). For $x \ne ${a}$ the expression still depends on $x$.` }],
          hints: [t`Combine the top: $\dfrac1x - \dfrac1{${a}} = \dfrac{${a} - x}{${a}x}$.`, t`$${a} - x = -(x - ${a})$, and $(x - ${a})$ is now a factor of top and bottom.`],
          teach: t`In a difference quotient, combine into one fraction first; the factor $(x - a)$ then appears and cancels.`,
          explain: t`$\dfrac{(${a} - x)/(${a}x)}{x - ${a}} = \dfrac{-(x - ${a})}{${a}x\,(x - ${a})} = -\dfrac{1}{${a}x}$ for $x \ne ${a}$. As $x \to ${a}$ it tends to $-\tfrac{1}{${a * a}}$, the derivative of $1/x$ there.`,
          visual: { type: 'graph', params: { x: [0, 7], y: [-0.2, 1.4], aspect: 'wide', curves: [{ fn: '1/x', color: 'accent', domain: [0.7, 7] }, { fn: `1/${a} + (1/${a + 1.5} - 1/${a})/1.5*(x - ${a})`, color: 'violet', dash: true, domain: [a - 1.2, a + 2.8] }],
            points: [{ x: a, y: N(1 / a), label: `x = ${a}`, color: 'gold' }, { x: a + 1.5, y: N(1 / (a + 1.5)), label: 'x', color: 'gold' }] },
            caption: t`$y = 1/x$ and one secant (dashed). The expression is the secant’s slope, as a function of the second point.` },
        };
      },
    }),
    mcq({
      id: 'hole', difficulty: 2,
      prompt: t`A plotting program draws $y = \dfrac{x^2 - 1}{x - 1}$ as the straight line below. Is $\dfrac{x^2 - 1}{x - 1}$ the same function as $x + 1$?`,
      visual: { type: 'graph', params: { x: [-3, 3], y: [-2, 4], aspect: 'wide', curves: [{ fn: '(x^2 - 1)/(x - 1)', color: 'accent' }] }, caption: t`A computer plot samples points; it can step straight over a single missing one.` },
      choices: [t`No: they agree except at $x = 1$, where the fraction is undefined`, t`Yes: cancelling gives exactly $x + 1$`, t`No: they agree only for $x > 1$`, t`No: cancelling $(x - 1)$ is not allowed at all`],
      answer: 0,
      why: {
        1: t`Cancelling $(x - 1)$ is valid only where $x - 1 \ne 0$. At $x = 1$ the fraction is $0/0$, while $x + 1 = 2$.`,
        2: t`They agree for $x < 1$ as well: $(x - 1)(x + 1)/(x - 1) = x + 1$ whenever $x \ne 1$.`,
        3: t`Cancelling a common factor is allowed — wherever that factor is not zero.`,
      },
      hints: [t`Factor the numerator.`, t`What happens at $x = 1$ in each expression?`],
      teach: t`Cancelling a factor gives an expression equal to the original wherever the factor is nonzero; where it is zero, the original keeps a hole.`,
      explain: t`$\dfrac{(x - 1)(x + 1)}{x - 1} = x + 1$ for $x \ne 1$. At $x = 1$ the left side is undefined: a hole at $(1, 2)$ that a sampled plot does not show.`,
    }),
  ],
  checkpoint: [
    mcq({
      id: 'cp-reciprocal-sum', difficulty: 2,
      prompt: t`Simplify $\left(x^{-1} + y^{-1}\right)^{-1}$.`,
      visual: { type: 'graph', params: { x: [0, 8], y: [0, 4], aspect: 'wide', xlabel: 'x', ylabel: 'value',
        curves: [{ fn: '1/(1/x + 1/2)', color: 'accent', domain: [0.02, 8], label: 'with y = 2', labelAt: 6.2, labelDy: 14 }], hlines: [{ y: 2, color: 'ink3' }] },
        caption: t`The expression for $y = 2$, as $x$ varies. It never reaches $2$, nor $x$.` },
      choices: [t`$\dfrac{xy}{x + y}$`, t`$x + y$`, t`$\dfrac{x + y}{xy}$`, t`$\dfrac{1}{x + y}$`],
      answer: 0,
      why: {
        1: t`The power $-1$ does not distribute over a sum: $(a + b)^{-1} \ne a^{-1} + b^{-1}$. Check with $x = y = 2$: the expression is $1$, not $4$.`,
        2: t`That is $x^{-1} + y^{-1}$ combined correctly — but the outer $^{-1}$ still has to flip it.`,
        3: t`That would be $(x + y)^{-1}$; the sum inside is of reciprocals, $\tfrac1x + \tfrac1y$.`,
      },
      hints: [t`$x^{-1} + y^{-1} = \tfrac1x + \tfrac1y = \tfrac{x + y}{xy}$.`],
      teach: t`$(a^{-1} + b^{-1})^{-1}$ is the “parallel sum”: combine the reciprocals, then flip.`,
      explain: t`$\tfrac1x + \tfrac1y = \tfrac{x + y}{xy}$, and its reciprocal is $\tfrac{xy}{x + y}$ — smaller than both $x$ and $y$ when both are positive.`,
    }),
    expr({
      id: 'cp-difference', difficulty: 2,
      gen(r) {
        const a = r.int(1, 4);
        return {
          prompt: t`Write $\dfrac{1}{x - ${a}} - \dfrac{1}{x + ${a}}$ as a single fraction.`,
          answer: `${2 * a}/(x^2 - ${a * a})`, answerTeX: t`\dfrac{${2 * a}}{x^2 - ${a * a}}`,
          vars: { x: [a + 0.5, a + 3] },
          errors: [{ answer: '0', feedback: t`The $\tfrac1x$-looking parts do not cancel: the denominators differ. Use the common denominator $(x - ${a})(x + ${a})$.` }, { answer: `${-2 * a}/(x^2 - ${a * a})`, feedback: t`Check the sign of the numerator: $(x + ${a}) - (x - ${a}) = +${2 * a}$.` }],
          hints: [t`Common denominator: $(x - ${a})(x + ${a}) = x^2 - ${a * a}$.`],
          teach: t`Over a common denominator, subtract the rescaled numerators — and bracket the one being subtracted.`,
          explain: t`$\dfrac{(x + ${a}) - (x - ${a})}{(x - ${a})(x + ${a})} = \dfrac{${2 * a}}{x^2 - ${a * a}}$.`,
          visual: bothSides({ lhs: `1/(x - ${a})`, rhs: `1/(x + ${a})`, x: [a, a + 6], y: [0, 1.2], xticks: null, lhsDomain: [a + 0.85, a + 6], lhsLabel: `y = 1/(x − ${a})`, rhsLabel: `y = 1/(x + ${a})`, legendAt: 'tr', caption: t`The two fractions for $x > ${a}$; your answer is the vertical gap between them.` }),
        };
      },
    }),
    num({
      id: 'cp-springs', difficulty: 2, transfer: true,
      gen(r) {
        const [k1, k2] = r.pick([[60, 40], [90, 60], [120, 40], [150, 100], [80, 20], [100, 25]]);
        const k = k1 * k2 / (k1 + k2);
        return {
          prompt: t`A lander’s leg has a crushable honeycomb stage of stiffness $k_1 = ${k1}$ kN/m in series with a spring of $k_2 = ${k2}$ kN/m. Springs in series combine as $\dfrac1k = \dfrac1{k_1} + \dfrac1{k_2}$. Find the leg’s stiffness $k$.`,
          answer: k, units: 'kN/m', tol: { rel: 0.005 },
          errors: [{ value: k1 + k2, feedback: t`Stiffnesses add for springs side by side (in parallel). In series the *reciprocals* add, and the leg is softer than either part.` }, { value: (k1 + k2) / 2, feedback: t`An average is not how springs combine: in series the reciprocals add.` }],
          hints: [t`$k = \dfrac{k_1 k_2}{k_1 + k_2}$.`],
          teach: t`A chain is only as stiff as $\big(k_1^{-1} + k_2^{-1}\big)^{-1}$ — always below its softest link.`,
          explain: t`$k = \dfrac{${k1} \times ${k2}}{${k1} + ${k2}} = ${nice(sig(k, 4))}$ kN/m, below both $${k1}$ and $${k2}$.`,
          visual: { type: 'graph', params: { x: [0, 3 * k2], y: [0, k1 * 1.15], aspect: 'wide', xlabel: 'k₂ (kN/m)', ylabel: 'k (kN/m)', yticks: 0,
            curves: [{ fn: `${k1}x/(${k1} + x)`, color: 'accent' }], hlines: [{ y: k1, label: 'k₁', color: 'ink3' }], vlines: [{ x: k2, label: `k₂ = ${k2}`, color: 'gold' }] },
            caption: t`The combined stiffness as $k_2$ varies with $k_1$ fixed (stiffness scale hidden). Real honeycomb crushes at a roughly constant force rather than acting as a spring; this is a linear model.` },
        };
      },
    }),
  ],
  sources: [
    { label: 'OpenStax Algebra and Trigonometry 2e, §1.6 Rational Expressions', url: 'https://openstax.org/books/algebra-and-trigonometry-2e/pages/1-6-rational-expressions' },
    { label: 'OpenStax University Physics Vol. 3, §2.4 Thin Lenses', url: 'https://openstax.org/books/university-physics-volume-3/pages/2-4-thin-lenses' },
  ],
});
