// Polynomial division — p = d·q + r, the remainder theorem and the factor theorem.
import { lesson, mcq, num, expr } from '../../src/core/content.js';
import { polyTeX, polyText } from '../../src/core/format.js';
import { lab } from './_m0kit.js';

const t = String.raw;
// polynomials as ascending coefficient arrays [a0, a1, …]
const mul = (p, q) => { const out = Array(p.length + q.length - 1).fill(0); p.forEach((a, i) => q.forEach((b, j) => { out[i + j] += a * b; })); return out; };
const lin = (r) => [-r, 1];   // x − r
const evalP = (p, x) => p.reduceRight((acc, c) => acc * x + c, 0);
// synthetic division of p by (x − a): quotient (ascending) and remainder
function synth(p, a) {
  const d = [...p].reverse(), out = [d[0]];
  for (let i = 1; i < d.length; i++) out.push(d[i] + a * out[i - 1]);
  const r = out.pop();
  return { q: out.reverse(), r };
}
const fx = (r) => (r === 0 ? 'x' : `(x ${r > 0 ? '-' : '+'} ${Math.abs(r)})`);
const P0 = [6, -5, -2, 1];   // x³ − 2x² − 5x + 6 = (x − 1)(x + 2)(x − 3)

export default lesson({
  id: 'm0.M0-5.3',
  title: 'Polynomial division',
  minutes: 9, difficulty: 2,
  intro: t`Dividing one polynomial by another works like long division of numbers: you get a **quotient** and a **remainder** of lower degree than the divisor,

$$p(x) = d(x)\,q(x) + r(x), \qquad \deg r < \deg d$$

For a divisor $x - a$ the remainder is a single number, and setting $x = a$ shows what it is: $p(a) = 0 \cdot q(a) + r$. That is the **remainder theorem**, $r = p(a)$. Its consequence is the **factor theorem**: $x - a$ divides $p$ exactly when $p(a) = 0$. So one known root lets you divide it out and find the rest.`,
  symbols: [
    { tex: 'p(x)', text: 'the polynomial being divided (the dividend)' },
    { tex: 'd(x)', text: 'the divisor — often $x - a$' },
    { tex: 'q(x)', text: 'the quotient: one degree lower than $p$ when $d = x - a$' },
    { tex: 'r(x)', text: 'the remainder, of lower degree than $d$: a constant when $d = x - a$' },
    { tex: '\\deg', text: 'degree: the highest power present' },
  ],
  why: t`Finding all the roots of a cubic or quartic — characteristic equations of oscillators and control loops, energy levels, equilibria — usually means guessing one, dividing it out, and solving the quadratic left over. Division also gives the slant asymptotes of rational functions and is the first step of partial fractions.`,
  visual: {
    type: 'graph',
    title: 'The remainder is the height at x = a',
    lead: t`The blue curve is $p(x) = x^3 - 2x^2 - 5x + 6$. Dividing by $x - a$ gives $p(x) = (x - a)\,q(x) + r$; the dashed gold curve is $(x - a)\,q(x) = p(x) - r$, which always passes through $(a, 0)$. Slide $a$.`,
    tasks: [
      t`The remainder readout always equals the height of the blue curve at $x = a$: that is the remainder theorem.`,
      t`Set $a = 1$, $3$ or $-2$: the remainder is $0$, the two curves coincide, and $x - a$ is a factor.`,
      t`At $a = 2$ the remainder is $-4$: the gold curve is the blue one lifted by $4$.`,
    ],
    params: {
      x: [-3.5, 4.5], y: [-14, 14], aspect: 'wide',
      sliders: [{ key: 'a', label: t`Divisor $x - a$`, min: -3, max: 4, step: 0.5, value: 2, explain: t`The number $a$ in the divisor $x - a$.` }],
      curves: [{ fn: polyText(P0), color: 'accent' }, { fn: `${polyText(P0)} - (a^3 - 2a^2 - 5a + 6)`, color: 'gold', dash: true }],
      points: [{ x: 'a', y: 'a^3 - 2a^2 - 5a + 6', color: 'accent', r: 5.5, label: 'p(a)' }, { x: 'a', y: 0, color: 'gold', r: 5 }],
      vlines: [{ x: 'a', color: 'ink3' }],
      readouts: [{ label: t`$q(x) = x^2 + bx + c$: $b$`, expr: 'a - 2', digits: 3 }, { label: t`$c$`, expr: 'a^2 - 2a - 5', digits: 3 }, { label: t`remainder $r$`, expr: 'a^3 - 2a^2 - 5a + 6', digits: 3 }],
    },
    caption: t`Exact. The quotient’s coefficients come from synthetic division: $b = a - 2$ and $c = a^2 - 2a - 5$.`,
  },
  example: {
    prompt: t`Divide $p(x) = 2x^3 - 3x^2 + 4x - 5$ by $x - 2$.`,
    visual: { type: 'graph', params: { x: [-1.5, 3.5], y: [-14, 24], aspect: 'wide', curves: [{ fn: '2x^3 - 3x^2 + 4x - 5', color: 'accent', label: 'p(x)', labelAt: 2.45, labelDx: -40, labelDy: -6 }, { fn: '2x^3 - 3x^2 + 4x - 12', color: 'gold', dash: true, label: '(x − 2)q(x)', labelAt: 2.75, labelDx: 10, labelDy: 8 }], points: [{ x: 2, y: 7, color: 'accent', r: 5, label: 'p(2) = 7', labelDx: -78, labelDy: -8 }, { x: 2, y: 0, color: 'gold', r: 5 }] }, caption: t`The curve $p$ and $(x - 2)\,q(x) = p(x) - 7$: they differ by the remainder, the height of $p$ at $x = 2$.` },
    steps: [
      { label: 'First term', text: t`$2x^3 \div x = 2x^2$. Subtract $2x^2(x - 2) = 2x^3 - 4x^2$: left with $x^2 + 4x - 5$.` },
      { label: 'Second term', text: t`$x^2 \div x = x$. Subtract $x(x - 2) = x^2 - 2x$: left with $6x - 5$.` },
      { label: 'Third term', text: t`$6x \div x = 6$. Subtract $6(x - 2) = 6x - 12$: left with $7$, of lower degree than $x - 2$. Stop.` },
      { label: 'Synthetic shortcut', text: t`The same numbers, coefficients only: bring down, multiply by $2$, add.
$$\begin{array}{c|cccc} 2 & 2 & -3 & 4 & -5 \\ & & 4 & 2 & 12 \\ \hline & 2 & 1 & 6 & 7 \end{array}$$` },
      { label: 'Check', text: t`Remainder theorem: $p(2) = 16 - 12 + 8 - 5 = 7$ ✓. So $p(x) = (x - 2)(2x^2 + x + 6) + 7$.` },
    ],
    answer: t`$q(x) = 2x^2 + x + 6$, remainder $7$.`,
  },
  practice: [
    num({
      id: 'remainder-thm', difficulty: 1,
      gen(r) {
        const p = [r.intExcept(-6, 6, [0]), r.int(-5, 5), r.int(-4, 4), r.pick([1, 2])], a = r.intExcept(-3, 3, [0]);
        const ans = evalP(p, a), wrong = evalP(p, -a);
        return {
          prompt: t`What is the remainder when $p(x) = ${polyTeX(p)}$ is divided by $${fx(a)}$?`,
          answer: ans, tol: { rel: 0, abs: 1e-6 },
          errors: wrong !== ans ? [{ value: wrong, feedback: t`The divisor $${fx(a)}$ is zero at $x = ${a}$, so evaluate $p(${a})$, not $p(${-a})$.` }] : [],
          hints: [t`Remainder theorem: the remainder on division by $x - a$ is $p(a)$.`, t`Here $a = ${a}$.`],
          teach: t`The remainder on dividing $p(x)$ by $x - a$ is $p(a)$ — no division needed.`,
          explain: t`$p(${a}) = ${ans}$, so $p(x) = ${fx(a)}\,q(x) ${ans < 0 ? '-' : '+'} ${Math.abs(ans)}$ for some quadratic $q$.`,
          visual: { type: 'graph', params: { x: [-4, 4], y: [-30, 30], aspect: 'wide', yticks: 0, curves: [{ fn: polyText(p), color: 'accent' }], vlines: [{ x: a, color: 'gold', label: `x = ${lab(a)}` }] }, caption: t`$y = p(x)$, vertical scale hidden. The remainder is the height where the gold line meets the curve.` },
        };
      },
    }),
    expr({
      id: 'quotient-exact', difficulty: 2,
      gen(r) {
        const a = r.intExcept(-3, 3, [0]), q = [r.intExcept(-5, 5, [0]), r.int(-4, 4), 1], p = mul(lin(a), q), wrong = synth(p, -a).q;
        return {
          prompt: t`$x = ${a}$ is a root of $p(x) = ${polyTeX(p)}$. Divide $p(x)$ by $${fx(a)}$ and give the quotient.`,
          lhs: t`\dfrac{p(x)}{${fx(a)}}`,
          answer: polyText(q), answerTeX: polyTeX(q),
          vars: { x: [-2, 2] }, form: 'expanded',
          errors: [{ answer: polyText(wrong), feedback: t`That is synthetic division with $${-a}$ in the box. For the divisor $${fx(a)}$ use $${a}$, the root.` }],
          hints: [t`Synthetic division with $${a}$: coefficients $${[...p].reverse().join(',\\ ')}$.`, t`Bring down the $1$, multiply by $${a}$, add to the next coefficient, and repeat.`],
          teach: t`Dividing out a known root lowers the degree by one: a cubic leaves a quadratic.`,
          explain: t`Synthetic division gives $${[...q].reverse().join(',\\ ')}$ with remainder $0$: $q(x) = ${polyTeX(q)}$. Check: $${fx(a)}(${polyTeX(q)}) = ${polyTeX(p)}$ ✓.`,
          visual: { type: 'graph', params: { x: [-5, 5], y: [-25, 25], aspect: 'wide', yticks: 0, curves: [{ fn: polyText(p), color: 'accent' }], points: [{ x: a, y: 0, color: 'gold', r: 5.5, label: `root x = ${lab(a)}`, labelDx: 8, labelDy: -12 }] }, caption: t`$y = p(x)$ with the known root marked; vertical scale hidden.` },
        };
      },
    }),
    expr({
      id: 'factor-fully', difficulty: 2,
      gen(r) {
        const roots = r.shuffle([-4, -3, -2, -1, 1, 2, 3, 4]).slice(0, 3), [a, b, c] = roots;
        const p = mul(mul(lin(a), lin(b)), lin(c));
        return {
          prompt: t`Given that $x = ${a}$ is a root, factor $p(x) = ${polyTeX(p)}$ completely.`,
          lhs: 'p(x)',
          answer: `${fx(a)}${fx(b)}${fx(c)}`, answerTeX: `${fx(a)}${fx(b)}${fx(c)}`,
          vars: { x: [-3, 3] }, form: 'factored',
          errors: [{ answer: `${fx(-a)}${fx(-b)}${fx(-c)}`, feedback: t`Each factor vanishes at its root: the root $${a}$ needs the factor $${fx(a)}$.` }],
          hints: [t`Divide by $${fx(a)}$ first (synthetic division with $${a}$).`, t`The quotient is $${polyTeX(mul(lin(b), lin(c)))}$; factor that quadratic.`],
          teach: t`One known root plus division leaves a quadratic, which you can factor or solve.`,
          explain: t`$p(x) = ${fx(a)}\,(${polyTeX(mul(lin(b), lin(c)))}) = ${fx(a)}${fx(b)}${fx(c)}$. The roots are $${a}$, $${b}$ and $${c}$.`,
          visual: { type: 'graph', params: { x: [-5, 5], y: [-40, 40], aspect: 'wide', xticks: 0, yticks: 0, curves: [{ fn: polyText(p), color: 'accent' }], points: [{ x: a, y: 0, color: 'gold', r: 5.5, label: `x = ${lab(a)}`, labelDx: 8, labelDy: -12 }] }, caption: t`$y = p(x)$, scales hidden: the given root is marked, the other two are for you to find.` },
        };
      },
    }),
    mcq({
      id: 'synthetic-sign', difficulty: 2,
      gen(r) {
        const k = r.int(2, 5), p = [r.intExcept(-9, 9, [0, k, -k, 1]), r.int(-6, 6), r.intExcept(-4, 4, [k, -k]), 1];
        const c0 = p[0];
        return {
          prompt: t`You divide $p(x) = ${polyTeX(p)}$ by $x + ${k}$ with synthetic division. Which number goes in the box at the left of the table?`,
          visual: { type: 'graph', params: { x: [-6, 4], y: [-40, 40], aspect: 'wide', yticks: 0, curves: [{ fn: polyText(p), color: 'accent' }], vlines: [{ x: -k, color: 'gold', label: `x + ${k} = 0` }] }, caption: t`$y = p(x)$ and the line where the divisor is zero.` },
          choices: [t`$-${k}$`, t`$${k}$`, t`$1$`, t`$${c0}$`],
          answer: 0,
          why: {
            1: t`Synthetic division by $x - a$ uses $a$. Write $x + ${k} = x - (-${k})$: so $a = -${k}$.`,
            2: t`$1$ is the leading coefficient, which you bring down first — not the number in the box.`,
            3: t`$${c0}$ is the constant term of $p$, the last coefficient in the row.`,
          },
          hints: [t`Synthetic division by $x - a$ puts $a$ in the box. Write $x + ${k}$ in the form $x - a$.`],
          teach: t`Synthetic division by $x - a$ uses the root $a$ of the divisor: for $x + ${k}$ that is $-${k}$.`,
          explain: t`$x + ${k} = 0$ at $x = -${k}$, so $-${k}$ goes in the box — and the remainder you end with is $p(-${k}) = ${evalP(p, -k)}$.`,
        };
      },
    }),
    {
      type: 'slider', id: 'make-factor', difficulty: 2,
      gen(r) {
        const a = r.pick([1, 2, -1, -2]), k = r.intExcept(-7, 1, [-(a * a)]), c = -(a ** 3) - k * a;
        return {
          prompt: t`For which value of $k$ is $${fx(a)}$ a factor of $p(x) = x^3 + kx ${c < 0 ? '-' : '+'} ${Math.abs(c)}$?`,
          visual: { type: 'graph', params: { x: [-4, 4], y: [-20, 20], aspect: 'wide', sliders: [{ key: 'k', label: t`Coefficient $k$`, min: -10, max: 6, step: 0.5, value: 4, explain: t`The coefficient of $x$ in $p(x)$.` }], curves: [{ fn: `x^3 + k*x + (${c})`, color: 'accent' }], points: [{ x: a, y: 0, color: 'gold', r: 6, label: `x = ${lab(a)}`, labelDx: 8, labelDy: -12 }] } },
          param: 'k', answer: [k - 0.01, k + 0.01],
          instruction: `Set k so that the curve passes through the marked point, then check.`,
          hints: [t`Factor theorem: $${fx(a)}$ is a factor exactly when $p(${a}) = 0$.`, t`$p(${a}) = (${a})^3 + (${a})\,k ${c < 0 ? '-' : '+'} ${Math.abs(c)}$. Set it to zero.`],
          teach: t`The factor theorem turns “is $x - a$ a factor?” into “is $p(a) = 0$?”`,
          explain: t`$p(${a}) = ${a ** 3 + c} ${a > 0 ? '+' : '-'} ${Math.abs(a)}k = 0$ gives $k = ${k}$: then the curve passes through $(${a}, 0)$.`,
        };
      },
    },
    expr({
      id: 'divide-remainder', difficulty: 3,
      gen(r) {
        const a = r.intExcept(-3, 3, [0]), b = r.intExcept(-5, 5, [-2 * a]), c = r.intExcept(-6, 6, [0, -a * (b + 2 * a)]);
        const p = [c, b, 2], { q, r: rem } = synth(p, a), wrong = synth(p, -a).q;
        return {
          prompt: t`Write $\dfrac{${polyTeX(p)}}{${fx(a)}}$ as $q(x) + \dfrac{r}{${fx(a)}}$. What is $q(x)$?`,
          lhs: 'q(x)',
          answer: polyText(q), answerTeX: polyTeX(q),
          vars: { x: [-2, 2] }, form: 'expanded',
          errors: [{ answer: polyText(wrong), feedback: t`Use $${a}$, the root of the divisor, in the synthetic division — not $${-a}$.` }, { answer: polyText([b, 2]), feedback: t`The second coefficient is $${b}$ plus $${a}$ times the $2$ brought down.` }].filter((e) => e.answer !== polyText(q)),
          hints: [t`Synthetic division with $${a}$ on $2,\ ${b},\ ${c}$.`, t`Bring down $2$; then $${b} + ${a} \cdot 2 = ${q[0]}$.`],
          teach: t`Dividing a quadratic by $x - a$ leaves a linear quotient and a constant remainder.`,
          explain: t`The table gives $2,\ ${q[0]}$ and remainder $${rem}$: $\dfrac{${polyTeX(p)}}{${fx(a)}} = ${polyTeX(q)} ${rem < 0 ? '-' : '+'} \dfrac{${Math.abs(rem)}}{${fx(a)}}$. The quotient is the slant asymptote of the graph.`,
          visual: { type: 'graph', params: { x: [-8, 8], y: [-25, 25], aspect: 'wide', curves: [{ fn: `(${polyText(p)})/(x - (${a}))`, color: 'accent' }], vlines: [{ x: a, color: 'bad' }] }, caption: t`The graph of the quotient of polynomials, with its vertical asymptote. Far away it hugs a straight line: $q(x)$.` },
        };
      },
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-remainder', difficulty: 2,
      gen(r) {
        const p = [r.int(-6, 6), r.int(-4, 4), r.intExcept(-3, 3, [0]), r.int(-2, 2), 1], a = r.int(1, 3);
        const ans = evalP(p, -a), wrong = evalP(p, a);
        return {
          prompt: t`Find the remainder when $${polyTeX(p)}$ is divided by $x + ${a}$.`,
          answer: ans, tol: { rel: 0, abs: 1e-6 },
          errors: wrong !== ans ? [{ value: wrong, feedback: t`$x + ${a}$ vanishes at $x = -${a}$: evaluate there.` }] : [],
          hints: [t`$x + ${a} = x - (-${a})$.`],
          teach: t`Remainder on division by $x - a$: $p(a)$.`,
          explain: t`$p(-${a}) = ${ans}$.`,
          visual: { type: 'graph', params: { x: [-4, 4], y: [-30, 60], aspect: 'wide', yticks: 0, curves: [{ fn: polyText(p), color: 'accent' }], vlines: [{ x: -a, color: 'gold' }] }, caption: t`The quartic, vertical scale hidden; the gold line is where the divisor vanishes.` },
        };
      },
    }),
    expr({
      id: 'cp-factor-half', difficulty: 3,
      gen(r) {
        const b = r.intExcept(-3, 3, [0]), c = r.intExcept(-4, 4, [0, b]);
        const p = mul(mul([-1, 2], lin(b)), lin(c));
        return {
          prompt: t`Given that $x = ${b}$ is a root, factor $p(x) = ${polyTeX(p)}$ completely.`,
          lhs: 'p(x)',
          answer: `(2x - 1)${fx(b)}${fx(c)}`, answerTeX: t`(2x - 1)${fx(b)}${fx(c)}`,
          vars: { x: [-2, 2] }, form: 'factored',
          errors: [{ answer: `(x - 0.5)${fx(b)}${fx(c)}`, feedback: t`The roots are right, but this expands to leading coefficient $1$, not $2$. Keep the $2$: $(2x - 1)$.` }],
          hints: [t`Divide by $${fx(b)}$: the quotient is a quadratic with leading coefficient $2$.`, t`The quotient is $${polyTeX(mul([-1, 2], lin(c)))}$.`, t`Factor it as $(2x - 1)${fx(c)}$.`],
          teach: t`After dividing out a known root, factor the remaining quadratic — its leading coefficient need not be $1$.`,
          explain: t`$p(x) = ${fx(b)}(${polyTeX(mul([-1, 2], lin(c)))}) = (2x - 1)${fx(b)}${fx(c)}$, with roots $\tfrac12$, $${b}$ and $${c}$.`,
          visual: { type: 'graph', params: { x: [-5, 5], y: [-40, 40], aspect: 'wide', xticks: 0, yticks: 0, curves: [{ fn: polyText(p), color: 'accent' }], points: [{ x: b, y: 0, color: 'gold', r: 5.5, label: `x = ${lab(b)}`, labelDx: 8, labelDy: -12 }] }, caption: t`$y = p(x)$, scales hidden, with the given root marked.` },
        };
      },
    }),
    num({
      id: 'cp-control-roots', difficulty: 3, transfer: true,
      gen(r) {
        const [a, b, c] = r.shuffle([1, 2, 3, 4, 5, 6]).slice(0, 3);
        const P = mul(mul([a, 1], [b, 1]), [c, 1]), slow = -Math.min(b, c), fast = -Math.max(b, c);
        return {
          prompt: t`A spacecraft attitude-control loop has characteristic polynomial $${polyTeX(P, 's')}$; each root $s$ gives a mode $e^{st}$ of the response. One root is $s = -${a}$. Find the other two, and enter the one **closer to zero** — the slowest-decaying mode ($s$ is in $\text{s}^{-1}$).`,
          answer: slow, tol: { rel: 0, abs: 1e-6 },
          errors: [{ value: fast, feedback: t`That is the other root, farther from zero: its mode $e^{${fast}t}$ dies away faster.` }],
          hints: [t`Divide by $s + ${a}$: synthetic division with $-${a}$.`, t`The quotient is $${polyTeX(mul([b, 1], [c, 1]), 's')}$.`, t`Factor it, or use the quadratic formula.`],
          teach: t`Dividing out a known root of a characteristic polynomial leaves a quadratic for the remaining modes.`,
          explain: t`$${polyTeX(P, 's')} = (s + ${a})(${polyTeX(mul([b, 1], [c, 1]), 's')}) = (s + ${a})(s + ${b})(s + ${c})$. The roots $-${b}$ and $-${c}$ are both negative, so every mode decays; $e^{${slow}t}$ is the slowest, and sets how long the attitude takes to settle.`,
          visual: { type: 'graph', params: { x: [-7, 1], y: [-30, 60], aspect: 'wide', xlabel: 's', yticks: 0, curves: [{ fn: polyText(P), color: 'accent' }], points: [{ x: -a, y: 0, color: 'gold', r: 5.5, label: `s = −${a}`, labelDx: 8, labelDy: -12 }] }, caption: t`The characteristic polynomial against $s$, vertical scale hidden; the known root is marked. Real attitude loops are often higher order; this one is a teaching example.` },
        };
      },
    }),
  ],
  sources: [
    { label: 'OpenStax Precalculus 2e, §3.5 Dividing Polynomials', url: 'https://openstax.org/books/precalculus-2e/pages/3-5-dividing-polynomials' },
    { label: 'OpenStax Precalculus 2e, §3.6 Zeros of Polynomial Functions', url: 'https://openstax.org/books/precalculus-2e/pages/3-6-zeros-of-polynomial-functions' },
  ],
});
