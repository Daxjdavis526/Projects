// The binomial theorem — expanding (a + b)ⁿ with Pascal's triangle, and the first-order approximation (1 + x)ⁿ ≈ 1 + nx.
import { lesson, mcq, num, expr } from '../../src/core/content.js';
import { nice, sig, tex, polyTeX } from '../../src/core/format.js';
import { N } from './_m0kit.js';
import { pascal, choose } from './_m0reason.js';

const t = String.raw;
const C = 2.998e8;   // m/s
const MU = 3.986e14; // m³/s², Earth's GM
const V_GPS = Math.sqrt(MU / 2.656e7);   // GPS orbit radius 26 560 km
const LAG = (v) => ((v * v) / (2 * C * C)) * 86400 * 1e6;   // μs per day from 1/γ ≈ 1 − v²/2c²

/** γ(β) = 1/√(1 − β²) against its first-order approximation 1 + β²/2. */
const gammaPic = (caption) => ({
  type: 'graph',
  params: {
    x: [0, 0.9], y: [0.9, 2.5], aspect: 'wide', xlabel: 'v / c', ylabel: 'γ',
    curves: [{ fn: '1/sqrt(1 - x^2)', color: 'accent', label: 'exact γ', labelAt: 0.82, labelDx: -70, labelDy: -6 }, { fn: '1 + x^2/2', color: 'gold', dash: true, label: '1 + v²/2c²', labelAt: 0.86, labelDx: -40, labelDy: 18 }],
  },
  caption,
});

/** (1 + x)ⁿ near x = 0 with its tangent line 1 + nx. */
const tangentPic = (n, w, caption) => ({
  type: 'graph',
  params: {
    x: [-w, w], y: [+N(Math.min((1 - w) ** n, (1 + w) ** n, 1 - Math.abs(n) * w) - 0.02), +N(Math.max((1 - w) ** n, (1 + w) ** n, 1 + Math.abs(n) * w) + 0.02)], aspect: 'wide', xlabel: 'x', ylabel: '',
    curves: [{ fn: `(1 + x)^(${N(n)})`, color: 'accent' }, { fn: `1 + ${N(n)}*x`, color: 'gold', dash: true }],
    legend: [{ label: '(1 + x)ⁿ', color: 'accent' }, { label: '1 + nx', color: 'gold', dash: true }], legendAt: n > 0 ? 'tl' : 'tr',
  },
  caption,
});

export default lesson({
  id: 'm0.M0-12.3',
  title: 'The binomial theorem',
  minutes: 11, difficulty: 2,
  equation: t`(a + b)^n = \sum_{k=0}^{n} \binom{n}{k}\, a^{\,n-k}\, b^{\,k}, \qquad \binom{n}{k} = \frac{n!}{k!\,(n-k)!}`,
  intro: t`Multiply out $(a + b)^n$ and every term is some $a^{n-k}b^k$. Its coefficient $\binom{n}{k}$ counts the ways to pick $b$ from $k$ of the $n$ brackets, and these numbers are the rows of **Pascal’s triangle**, where each entry is the sum of the two above it: row $3$ is $1, 3, 3, 1$, so $(a + b)^3 = a^3 + 3a^2b + 3ab^2 + b^3$.

Put $a = 1$, $b = x$: $(1 + x)^n = 1 + nx + \tfrac{n(n-1)}{2}x^2 + \cdots$. When $x$ is small each term is much smaller than the one before, so **to first order, $(1 + x)^n \approx 1 + nx$** — and that holds for *any* power $n$, fractional or negative ones included. It is the most used approximation in physics.`,
  symbols: [
    { tex: 'n', text: 'the power: a whole number $\\ge 0$ for the exact theorem; any real number in the approximation $(1+x)^n \\approx 1 + nx$' },
    { tex: 'k', text: 'which term: $k$ factors of $b$, counting from $0$ to $n$' },
    { tex: '\\binom{n}{k}', text: '“$n$ choose $k$”, the **binomial coefficient**: entry $k$ of row $n$ of Pascal’s triangle' },
    { tex: 'n!', text: '$n$ factorial, $1 \\times 2 \\times \\cdots \\times n$ (with $0! = 1$)' },
    { tex: 'a,\\ b', text: 'the two terms being added, any numbers or expressions' },
  ],
  why: t`Every “small correction” in physics is a first-order binomial: the low-speed limit of relativity, gravity a little above the ground, a pendulum’s small swing. [Calculus II](#/lesson/math1220.C2-5.6) extends the theorem to the binomial *series* for any power, with an error bound.`,
  visual: {
    type: 'graph',
    title: 'The straight line hiding inside every power',
    lead: t`The blue curve is $(1 + x)^n$; the gold line is $1 + nx$, the first two terms of its expansion; the violet dashes add the $x^2$ term. Near $x = 0$ they all agree.`,
    tasks: [
      t`At $n = 2$, $(1+x)^2 = 1 + 2x + x^2$ exactly: the violet curve sits on the blue one, and the line is the tangent at $x = 0$.`,
      t`Try $n = -0.5$, the power in the relativistic $\gamma$. At $x = 0.1$ the line is off by under $0.5\%$; by $x = 1$ the error has grown many times over.`,
      t`Make $n$ large (say $5$): the line peels away sooner. The approximation needs $nx$ small, not just $x$.`,
    ],
    params: {
      x: [-0.6, 1], y: [0, 4], aspect: 'wide', xlabel: 'x', ylabel: '',
      sliders: [{ key: 'n', label: t`Power $n$`, min: -3, max: 5, step: 0.5, value: 3, explain: t`Any real power: the first two terms $1 + nx$ are the same for all of them.` }],
      curves: [
        { fn: '(1 + x)^n', color: 'accent' },
        { fn: '1 + n*x', color: 'gold', dash: true },
        { fn: '1 + n*x + n*(n - 1)/2*x^2', color: 'violet', dash: true, width: 1.6 },
      ],
      vlines: [{ x: 0.1, color: 'ink4' }],
      legend: [{ label: '(1 + x)ⁿ', color: 'accent' }, { label: '1 + nx', color: 'gold', dash: true }, { label: '… + n(n−1)x²/2', color: 'violet', dash: true }], legendAt: 'tl',
      readouts: [
        { label: t`$(1.1)^n$`, expr: '1.1^n', digits: 5 },
        { label: t`$1 + 0.1n$`, expr: '1 + 0.1*n', digits: 5 },
        { label: t`error of the line at $x = 0.1$`, expr: 'abs(1 + 0.1*n - 1.1^n)/1.1^n*100', unit: '\\%', digits: 2 },
      ],
    },
    caption: t`Exact curves. For a whole $n \ge 0$ the expansion stops after $n + 1$ terms; for any other $n$ it goes on for ever (the binomial series) and is valid for $|x| < 1$.`,
  },
  example: {
    prompt: t`A GPS satellite orbits at $${(V_GPS / 1000).toFixed(2)}$ km/s. Special relativity says its clock runs slow by the factor $1/\gamma = \sqrt{1 - v^2/c^2}$, with $c = 2.998\times10^{8}$ m/s. Use the binomial approximation to find how many microseconds it loses per day from its speed alone.`,
    visual: gammaPic(t`The Lorentz factor $\gamma$ and its first-order approximation. At GPS speed, $v/c \approx 1.3\times10^{-5}$, far off the left edge: there the two agree to about twenty decimal places.`),
    steps: [
      { label: 'Spot the binomial', text: t`$\sqrt{1 - v^2/c^2} = (1 + x)^n$ with $x = -v^2/c^2$ and $n = \tfrac12$. Since $v/c \approx 10^{-5}$, $x \approx 10^{-10}$: tiny.` },
      { label: 'First order', text: t`$(1 + x)^{1/2} \approx 1 + \tfrac12 x = 1 - \dfrac{v^2}{2c^2}$. So the clock loses the fraction $\dfrac{v^2}{2c^2}$ of every second.` },
      { label: 'Compute', text: t`$\dfrac{v^2}{2c^2} = \dfrac{(${N(sig(V_GPS, 4))})^2}{2\,(2.998\times10^{8})^2} = ${tex((V_GPS * V_GPS) / (2 * C * C), 3)}$.` },
      { label: 'Per day', text: t`A day is $86\,400$ s, so the clock loses $${tex((V_GPS * V_GPS) / (2 * C * C), 3)} \times 86\,400 = ${tex(LAG(V_GPS) * 1e-6, 3)}$ s $= ${nice(sig(LAG(V_GPS), 2))}\ \mu\text{s}$ per day.` },
      { label: 'Sense check', text: t`The next term is $-\tfrac18 x^2 \approx 10^{-21}$: negligible. Seven microseconds is $2$ km of ranging error at the speed of light, so GPS must correct for it. (General relativity makes the same clock run *fast* by about $45\ \mu\text{s}$ a day, because it sits higher in Earth’s gravity; the net is about $+38\ \mu\text{s}$.)` },
    ],
    answer: t`It loses $\dfrac{v^2}{2c^2}\times 86\,400\ \text{s} \approx ${nice(sig(LAG(V_GPS), 2))}\ \mu\text{s}$ per day.`,
  },
  practice: [
    num({
      id: 'pascal-entry', difficulty: 1,
      gen(r) {
        const n = r.int(6, 9), k = r.int(2, n - 2), ans = choose(n, k);
        return {
          prompt: t`Pascal’s triangle is drawn down to row $${n - 1}$. What is $\dbinom{${n}}{${k}}$, entry $${k}$ of row $${n}$? (Rows and entries count from $0$.)`,
          answer: ans, tol: { rel: 0, abs: 0.01 },
          errors: [{ value: choose(n - 1, k), feedback: t`That is entry ${k} of row ${n - 1}. Row ${n} is the next one down: add the two entries above.` }, { value: choose(n - 1, k - 1), feedback: t`That is only one of the two entries above. Add its neighbour, $\binom{${n - 1}}{${k}}$.` }].filter((e) => e.value !== ans),
          hints: [t`Each entry is the sum of the two above it: $\dbinom{${n}}{${k}} = \dbinom{${n - 1}}{${k - 1}} + \dbinom{${n - 1}}{${k}}$.`],
          teach: t`Each entry of Pascal’s triangle is the sum of the two entries above it.`,
          explain: t`$\dbinom{${n}}{${k}} = ${choose(n - 1, k - 1)} + ${choose(n - 1, k)} = ${ans}$. Check with factorials: $\dfrac{${n}!}{${k}!\,${n - k}!} = ${ans}$.`,
          visual: pascal({ rows: n, highlight: [[n - 1, k - 1], [n - 1, k]], caption: t`Rows $0$ to $${n - 1}$; the two gold entries sit above the one asked for.` }),
        };
      },
    }),
    num({
      id: 'coef', difficulty: 2,
      gen(r) {
        const [a, b] = r.pick([[2, 1], [1, 2], [3, 1], [1, 3], [2, -1], [1, -2], [2, 3]]), n = r.int(4, 6), k = r.int(1, n - 1);
        const ans = choose(n, k) * a ** (n - k) * b ** k;
        return {
          prompt: t`What is the coefficient of $x^{${k}}$ in the expansion of $(${a} ${b < 0 ? '-' : '+'} ${Math.abs(b) === 1 ? '' : Math.abs(b)}x)^{${n}}$?`,
          answer: ans, tol: { rel: 0, abs: 0.01 },
          errors: [
            { value: choose(n, k), feedback: t`$\binom{${n}}{${k}}$ is only part of it: the term is $\binom{${n}}{${k}}(${a})^{${n - k}}(${b}x)^{${k}}$, so the numbers $${a}$ and $${b}$ get powered too.` },
            { value: choose(n, k) * b ** k, feedback: t`You left out $(${a})^{${n - k}}$: the first term of the bracket is raised to the power $n - k$.` },
            { value: choose(n, k) * a ** k * b ** (n - k), feedback: t`The powers are swapped: $x^{${k}}$ comes with $(${b}x)^{${k}}$ and $(${a})^{${n - k}}$.` },
          ].filter((e) => e.value !== ans),
          hints: [t`The $x^{${k}}$ term is $\dbinom{${n}}{${k}}\,(${a})^{${n - k}}\,(${b}x)^{${k}}$.`, t`$\dbinom{${n}}{${k}} = ${choose(n, k)}$.`],
          teach: t`The general term of $(a + b)^n$ is $\binom{n}{k}a^{n-k}b^k$; every factor in $a$ and $b$ is raised to its power.`,
          explain: t`$\dbinom{${n}}{${k}}(${a})^{${n - k}}(${b})^{${k}} = ${choose(n, k)} \times ${a ** (n - k)} \times ${b ** k < 0 ? `(${b ** k})` : b ** k} = ${ans}$.`,
          visual: pascal({ rows: n + 1, highlight: [[n, k]], caption: t`Pascal’s triangle to row $${n}$: the gold entry is $\binom{${n}}{${k}}$, the coefficient before the numbers in the bracket are powered.` }),
        };
      },
    }),
    expr({
      id: 'expand', difficulty: 2,
      gen(r) {
        const c = r.pick([-3, -2, 2, 3]), n = r.pick([3, 4]);
        const co = Array.from({ length: n + 1 }, (_, j) => choose(n, j) * c ** (n - j));   // coefficient of x^j
        return {
          prompt: t`Expand $(x ${c < 0 ? '-' : '+'} ${Math.abs(c)})^{${n}}$ fully.`,
          answer: co.map((v, j) => `(${v})*x^${j}`).join(' + '),
          answerTeX: polyTeX(co),
          vars: { x: [-2, 2] }, form: 'expanded',
          errors: [{ answer: `x^${n} + (${c ** n})`, feedback: t`$(a + b)^n \ne a^n + b^n$: the middle terms $\binom{n}{k}a^{n-k}b^k$ are missing.` }],
          hints: [t`Row $${n}$ of Pascal’s triangle: $${Array.from({ length: n + 1 }, (_, j) => choose(n, j)).join(',\ ')}$.`, t`The term with $x^{j}$ is $\binom{${n}}{j}\,x^{j}(${c})^{${n} - j}$; mind the sign of the powers of $${c}$.`],
          teach: t`Pascal’s row gives the coefficients; the powers of the constant (with its sign) multiply them.`,
          explain: t`$(x ${c < 0 ? '-' : '+'} ${Math.abs(c)})^{${n}} = ${polyTeX(co)}$.${c < 0 ? ' With a negative constant the signs alternate.' : ''}`,
          visual: pascal({ rows: n + 1, highlight: Array.from({ length: n + 1 }, (_, j) => [n, j]), caption: t`Row $${n}$ (gold) holds the coefficients before the powers of $${c}$ are put in.` }),
        };
      },
    }),
    mcq({
      id: 'cube', difficulty: 1,
      prompt: t`Which is $(a + b)^3$?`,
      choices: [t`$a^3 + 3a^2b + 3ab^2 + b^3$`, t`$a^3 + b^3$`, t`$a^3 + 3ab + b^3$`, t`$a^3 + 2a^2b + 2ab^2 + b^3$`],
      answer: 0,
      why: {
        1: t`Powers do not distribute over a sum (the “freshman’s dream”): try $a = b = 1$, where $(1 + 1)^3 = 8$ but $1 + 1 = 2$.`,
        2: t`Every term of $(a + b)^3$ has total degree $3$: $ab$ has degree $2$. And try $a = b = 1$: $8$, not $5$.`,
        3: t`Those are the wrong coefficients: row $3$ of Pascal’s triangle is $1, 3, 3, 1$. At $a = b = 1$ this gives $6$, not $8$.`,
      },
      hints: [t`Row $3$ of Pascal’s triangle is the sum of neighbours in row $2$: $1, 2, 1$.`],
      teach: t`$(a + b)^n$ has $n + 1$ terms with Pascal’s row as coefficients — never just $a^n + b^n$.`,
      explain: t`Row $3$ is $1, 3, 3, 1$, so $(a + b)^3 = a^3 + 3a^2b + 3ab^2 + b^3$. A quick test, $a = b = 1$, gives $8 = 2^3$.`,
      visual: pascal({ rows: 4, hide: [[3, 1], [3, 2]], caption: t`Pascal’s triangle to row $3$, with its middle entries hidden.` }),
    }),
    num({
      id: 'percent', difficulty: 2,
      gen(r) {
        const c = r.pick([
          { what: t`a spherical propellant tank’s radius`, of: 'its volume', n: 3, law: t`V \propto r^3` },
          { what: t`a solar panel’s width and height (both)`, of: 'its area', n: 2, law: t`A \propto L^2` },
          { what: t`a satellite’s orbit radius`, of: 'its orbital period', n: 1.5, law: t`T \propto r^{3/2}` },
          { what: t`a satellite’s distance from Earth’s centre`, of: 'the gravitational pull on it', n: -2, law: t`F \propto r^{-2}` },
          { what: t`a pendulum’s length`, of: 'its period', n: 0.5, law: t`T \propto L^{1/2}` },
        ]);
        const p = r.pick([0.5, 1, 2, 1.5]), ans = c.n * p, exact = ((1 + p / 100) ** c.n - 1) * 100;
        return {
          prompt: t`If ${c.what} grows by $${p}\%$, by about what percentage does ${c.of} change? ($${c.law}$; give a negative number for a decrease.)`,
          answer: ans, tol: { rel: 0.035 },
          errors: [{ value: p, feedback: t`The change is not passed on one for one: with $${c.law}$, a factor $1 + x$ becomes $(1 + x)^{${N(c.n)}} \approx 1 + ${N(c.n)}x$.` }, { value: p ** c.n, feedback: t`Raise the *factor* $1 + x$ to the power, not the percentage.` }].filter((e, i, all) => Math.abs(e.value - ans) > 0.05 * Math.abs(ans) && all.findIndex((o) => Math.abs(o.value - e.value) < 1e-9) === i),
          hints: [t`The new value is $(1 + ${nice(p / 100)})^{${N(c.n)}}$ times the old one.`, t`$(1 + x)^n \approx 1 + nx$ for small $x$.`],
          teach: t`For a small fractional change $x$, a power law $y \propto q^n$ turns it into about $nx$.`,
          explain: t`$(1 + ${nice(p / 100)})^{${N(c.n)}} \approx 1 + ${N(c.n)}\times${nice(p / 100)} = 1 ${ans < 0 ? '-' : '+'} ${nice(Math.abs(ans) / 100)}$: a change of about $${nice(ans)}\%$. (Exactly: $${nice(sig(exact, 3))}\%$.)`,
          visual: tangentPic(c.n, 0.06, t`$(1 + x)^{${N(c.n)}}$ and its tangent line $1 + ${N(c.n)}x$ for changes $x$ up to $6\%$: at this scale the two nearly coincide.`),
        };
      },
    }),
    num({
      id: 'row-sum', difficulty: 2,
      gen(r) {
        const n = r.int(7, 12), ans = 2 ** n;
        return {
          prompt: t`What is $\dbinom{${n}}{0} + \dbinom{${n}}{1} + \dbinom{${n}}{2} + \cdots + \dbinom{${n}}{${n}}$, the sum of row $${n}$ of Pascal’s triangle?`,
          answer: ans, tol: { rel: 0, abs: 0.01 },
          errors: [{ value: n * n, feedback: t`The rows double: $1, 2, 4, 8, \ldots$ Look at the pattern in the picture.` }, { value: 2 * n, feedback: t`Each row’s sum is *twice* the last, not $2$ more.` }],
          hints: [t`Put $a = b = 1$ in the binomial theorem.`, t`$(1 + 1)^{${n}} = \sum_k \binom{${n}}{k}$.`],
          teach: t`Setting $a = b = 1$ shows each row of Pascal’s triangle sums to $2^n$.`,
          explain: t`$\sum_k \binom{${n}}{k} 1^{${n}-k}1^k = (1 + 1)^{${n}} = 2^{${n}} = ${ans}$. It also counts the subsets of $${n}$ objects: each is in or out.`,
          visual: pascal({ rows: 5, sums: true, caption: t`Rows $0$ to $4$ with their sums: $1, 2, 4, 8, 16$.` }),
        };
      },
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-coef', difficulty: 3,
      gen(r) {
        const b = r.pick([2, 3]), n = r.int(5, 7), k = r.pick([2, 3]), ans = choose(n, k) * (-b) ** k;
        return {
          prompt: t`What is the coefficient of $x^{${k}}$ in $(1 - ${b}x)^{${n}}$?`,
          answer: ans, tol: { rel: 0, abs: 0.01 },
          errors: [{ value: choose(n, k) * b ** k * (k % 2 ? 1 : -1), feedback: t`Check the sign: $(-${b})^{${k}}$ is ${k % 2 ? 'negative' : 'positive'}.` }, { value: choose(n, k) * -b, feedback: t`The constant is raised to the power too: $(-${b}x)^{${k}} = (-${b})^{${k}}x^{${k}}$.` }, { value: choose(n, k), feedback: t`Include $(-${b})^{${k}}$.` }].filter((e) => e.value !== ans),
          hints: [t`The term is $\dbinom{${n}}{${k}}(1)^{${n - k}}(-${b}x)^{${k}}$.`, t`$\dbinom{${n}}{${k}} = ${choose(n, k)}$.`],
          teach: t`Carry the sign inside the power: $(-b)^k$ is negative for odd $k$.`,
          explain: t`$\dbinom{${n}}{${k}}(-${b})^{${k}} = ${choose(n, k)} \times (${(-b) ** k}) = ${ans}$.`,
          visual: pascal({ rows: n + 1, highlight: [[n, k]], caption: t`Pascal’s triangle to row $${n}$, with $\binom{${n}}{${k}}$ in gold.` }),
        };
      },
    }),
    num({
      id: 'cp-clock', difficulty: 3, transfer: true,
      gen(r) {
        const [name, v] = r.pick([['The International Space Station', 7.66], ['A Galileo navigation satellite', 3.67], ['The Hubble Space Telescope', 7.59], ['A GLONASS navigation satellite', 3.95]]);
        const ans = LAG(v * 1000);
        return {
          prompt: t`${name} moves at $${v}$ km/s. Special relativity slows a clock on board by the factor $\sqrt{1 - v^2/c^2}$ ($c = 2.998\times10^{8}$ m/s). Using the first-order binomial approximation, how many microseconds does the clock lose per day from its speed alone?`,
          answer: ans, units: 'us', tol: { rel: 0.01 },
          errors: [{ value: 2 * ans, feedback: t`$(1 - x)^{1/2} \approx 1 - \tfrac12 x$: the power $\tfrac12$ gives a factor $\tfrac12$.` }, { value: (v * 1000 / C) * 86400 * 1e6, feedback: t`The clock loses $v^2/2c^2$ of each second — the speed ratio is *squared*.` }],
          hints: [t`$\sqrt{1 - v^2/c^2} \approx 1 - \dfrac{v^2}{2c^2}$.`, t`Lost per day $= \dfrac{v^2}{2c^2}\times 86\,400$ s, with $v$ in m/s.`],
          teach: t`At everyday and orbital speeds, $\sqrt{1 - v^2/c^2} \approx 1 - v^2/2c^2$.`,
          explain: t`$\dfrac{v^2}{2c^2} = \dfrac{(${v * 1000})^2}{2(2.998\times10^{8})^2} = ${tex((v * v * 1e6) / (2 * C * C), 3)}$; times $86\,400$ s that is $${nice(sig(ans, 3))}\ \mu\text{s}$ per day. (Gravity makes an orbiting clock run fast by a competing amount; this is only the speed effect.)`,
          visual: gammaPic(t`$\gamma$ and its first-order approximation. Orbital speeds are about $v/c \approx 2\times10^{-5}$, at the far left, where the two are indistinguishable.`),
        };
      },
    }),
    mcq({
      id: 'cp-when-good', difficulty: 2,
      prompt: t`For which of these is $1 + nx$ a good estimate of $(1 + x)^n$ (within $1\%$)?`,
      choices: [t`$(1.001)^{50} \approx 1.05$`, t`$(1.5)^{4} \approx 3$`, t`$(1.01)^{300} \approx 4$`, t`$(0.9)^{20} \approx -1$`],
      answer: 0,
      why: {
        1: t`$x = 0.5$ is not small: the true value is $5.06$, so the dropped terms are huge.`,
        2: t`$x$ is small but $nx = 3$ is not: compounding wins, and the true value is about $19.8$.`,
        3: t`$nx = -2$ is far from small; a positive number to a power cannot be negative. The true value is $0.12$.`,
      },
      hints: [t`The dropped terms are about $\tfrac12 n(n-1)x^2 \approx \tfrac12 (nx)^2$. When is that small?`],
      teach: t`$1 + nx$ works when $nx$ is small, not merely when $x$ is.`,
      explain: t`Only the first has $nx = 0.05$ small: $(1.001)^{50} = ${nice(sig(1.001 ** 50, 5))}$, against the estimate $1.05$ — off by $0.1\%$.`,
      visual: tangentPic(4, 0.5, t`$(1 + x)^4$ and its tangent line $1 + 4x$: close near $x = 0$, far apart by $x = 0.5$.`),
    }),
  ],
  sources: [
    { label: 'OpenStax Precalculus 2e, §11.6 Binomial Theorem', url: 'https://openstax.org/books/precalculus-2e/pages/11-6-binomial-theorem' },
    { label: 'N. Ashby, “Relativity in the Global Positioning System”, Living Reviews in Relativity 6, 1 (2003)', url: 'https://doi.org/10.12942/lrr-2003-1' },
  ],
});
