// Logarithms as inverse exponentials — a logarithm answers “which power?”
import { lesson, mcq, num } from '../../src/core/content.js';
import { nice, sig } from '../../src/core/format.js';
import { N, logLadder, thou } from './_m0kit.js';

const t = String.raw;
// a power b^k as TeX: whole numbers for k ≥ 0, a fraction for k < 0
const powTeX = (b, k) => (k >= 0 ? thou(b ** k) : t`\tfrac{1}{${thou(b ** -k)}}`);

export default lesson({
  id: 'm0.M0-6.2',
  title: 'Logarithms as inverse exponentials',
  minutes: 8, difficulty: 2,
  intro: t`A logarithm answers the question “**which power?**” The base-$b$ logarithm of $x$ is the exponent you must put on $b$ to get $x$:

$$y = \log_b x \iff b^{\,y} = x$$

So $\log_2 8 = 3$ because $2^3 = 8$, and $\log_{10} 0.001 = -3$ because $10^{-3} = 0.001$. Since $b^y$ is always positive, $\log_b x$ exists only for $x > 0$; it is negative for $0 < x < 1$, zero at $x = 1$, and its graph is the graph of $b^x$ reflected in $y = x$. A logarithm **counts factors**: $\log_2$ counts doublings, $\log_{10}$ counts powers of ten — orders of magnitude.`,
  symbols: [
    { tex: 'b', text: 'the **base**: a positive number other than $1$ (commonly $10$, $2$ or $e$)' },
    { tex: 'x', text: 'the **argument**: the number whose logarithm you take; it must be positive' },
    { tex: 'y', text: 'the logarithm itself: the exponent, a pure number that may be negative' },
    { tex: '\\iff', text: '“if and only if”: the two statements say the same thing' },
  ],
  why: t`Whenever a quantity is spread over many powers of ten — sound intensities, star brightnesses, pressures from a vacuum chamber to a combustion chamber — its logarithm is the comfortable number to work with. And every time you solve for a time or a distance inside an exponential, you are taking a logarithm.`,
  visual: {
    type: 'graph',
    title: 'Exponential and logarithm as mirror images',
    lead: t`Blue: $y = b^x$. Gold: $y = \log_b x$. The point $P = (c, b^c)$ on the exponential reflects to $Q = (b^c, c)$ on the logarithm. Slide the base $b$ and the exponent $c$.`,
    tasks: [
      t`Set $b = 2$, $c = 3$: $P = (3, 8)$ and $Q = (8, 3)$, so $\log_2 8 = 3$.`,
      t`Make $c$ negative: $b^c$ is a number between $0$ and $1$, and its logarithm is negative. The gold curve never reaches $x = 0$.`,
      t`Every gold curve passes through $(1, 0)$: $\log_b 1 = 0$ for every base, because $b^0 = 1$.`,
    ],
    params: {
      x: [-4, 10], y: [-4, 6], equal: true, aspect: 'wide',
      sliders: [
        { key: 'b', label: t`Base $b$`, min: 1.3, max: 10, step: 0.1, value: 2, explain: t`The base of the exponential and the logarithm.` },
        { key: 'c', label: t`Exponent $c$`, min: -2, max: 3, step: 0.1, value: 3, explain: t`$P$ sits at height $b^c$; its mirror $Q$ says $\log_b(b^c) = c$.` },
      ],
      curves: [
        { fn: 'x', color: 'ink3', dash: true },
        { fn: 'b^x', color: 'accent' },
        { fn: 'ln(x)/ln(b)', color: 'gold', domain: [0.005, 12] },
      ],
      points: [{ x: 'c', y: 'b^c', color: 'accent', r: 5.5, label: 'P', labelDx: -16, labelDy: -10 }, { x: 'b^c', y: 'c', color: 'gold', r: 5.5, label: 'Q', labelDx: 8, labelDy: 14 }, { x: 1, y: 0, color: 'ink2', r: 4 }],
      readouts: [{ label: t`$b^c$`, expr: 'b^c', digits: 4 }, { label: t`$\log_b(b^c)$`, expr: 'c', digits: 3 }],
    },
    caption: t`Equal scales on both axes, so the reflection in the dashed line $y = x$ is exact. $P$ leaves the window for large $b^c$.`,
  },
  example: {
    prompt: t`Evaluate $\log_2 1024$, $\;\log_{10} 0.001$, $\;\log_5 \sqrt5$ and $\;\log_3 \tfrac{1}{81}$.`,
    visual: logLadder({ items: [0.001, 0.01, 0.1, 1, 10, 100, 1000].map((v, i) => ({ v, label: ['0.001', '0.01', '0.1', '1', '10', '100', '1000'][i] })), x: [-3.6, 3.6], xlabel: 'x (placed by log₁₀ x)', caption: t`Numbers placed by their base-ten logarithm: each step right multiplies by $10$, and $0.001$ sits three steps left of $1$.` }),
    steps: [
      { label: 'Count doublings', text: t`$1024 = 2^{10}$ (double $1$ ten times), so $\log_2 1024 = 10$.` },
      { label: 'Count tenths', text: t`$0.001 = 10^{-3}$, so $\log_{10} 0.001 = -3$: a number below $1$ has a negative logarithm.` },
      { label: 'Fractional powers', text: t`$\sqrt5 = 5^{1/2}$, so $\log_5 \sqrt5 = \tfrac12$.` },
      { label: 'Reciprocals', text: t`$\tfrac{1}{81} = 3^{-4}$, so $\log_3 \tfrac{1}{81} = -4$.` },
      { label: 'Check by undoing', text: t`Raise the base to each answer: $2^{10} = 1024$, $10^{-3} = 0.001$, $5^{1/2} = \sqrt 5$, $3^{-4} = \tfrac1{81}$ ✓.` },
    ],
    answer: t`$10$, $\;-3$, $\;\tfrac12$, $\;-4$.`,
  },
  practice: [
    num({
      id: 'eval-log', difficulty: 1,
      gen(r) {
        const b = r.pick([2, 3, 5, 10]), k = r.pick(b === 10 ? [-3, -2, 2, 3, 4, 6] : b === 5 ? [-2, 2, 3, 4] : [-3, -2, 3, 4, 5]);
        const X = b ** k;
        const errors = [{ value: -k, feedback: t`Check the sign: ${k < 0 ? 'a number below $1$ needs a negative power' : 'a number above $1$ needs a positive power'} of $${b}$.` }];
        if (k > 0 && Math.abs(X / b - k) > 1e-9) errors.push({ value: X / b, feedback: t`A logarithm is not a division: it asks which power of $${b}$ gives $${thou(X)}$.` });
        return {
          prompt: t`Evaluate $\log_{${b}} ${powTeX(b, k)}$.`,
          answer: k, tol: { rel: 0, abs: 1e-6 },
          errors,
          hints: [t`Write $${powTeX(b, k)}$ as a power of $${b}$.`],
          teach: t`$\log_b x$ is the exponent that turns $b$ into $x$.`,
          explain: t`$${powTeX(b, k)} = ${b}^{${k}}$, so $\log_{${b}} ${powTeX(b, k)} = ${k}$.`,
          visual: { type: 'graph', params: { x: [-4, 7], y: k > 0 ? [-0.1 * X, 1.3 * X] : [-0.15, 1.5], aspect: 'wide', yticks: 0, curves: [{ fn: `${b}^x`, color: 'accent', label: `y = ${b}ˣ`, labelAt: k > 0 ? Math.log(0.7 * X) / Math.log(b) : 0.3, labelDx: -50, labelDy: -6 }], hlines: [{ y: N(X), color: 'gold' }] }, caption: t`$y = ${b}^x$ and the height $${powTeX(b, k)}$ (gold), vertical scale hidden. The logarithm is where they meet.` },
        };
      },
    }),
    mcq({
      id: 'definition', difficulty: 1,
      prompt: t`What does $\log_b x = y$ mean?`,
      visual: { type: 'graph', params: { x: [-2, 10], y: [-2, 9], equal: true, aspect: 'wide', curves: [{ fn: 'x', color: 'ink3', dash: true }, { fn: '2^x', color: 'accent', label: 'y = 2ˣ', labelAt: 2.6, labelDx: -52, labelDy: 0 }, { fn: 'ln(x)/ln(2)', color: 'gold', domain: [0.01, 10], label: 'y = log₂ x', labelAt: 9, labelDx: -30, labelDy: -14 }], points: [{ x: 3, y: 8, color: 'accent', r: 5, label: '(3, 8)', labelDx: 8, labelDy: 2 }, { x: 8, y: 3, color: 'gold', r: 5, label: '(8, 3)', labelDx: 0, labelDy: 18 }] }, caption: t`One example, base $2$: the point $(3, 8)$ on $2^x$ and its mirror image on $\log_2 x$.` },
      choices: [t`$b^{\,y} = x$`, t`$y^{\,b} = x$`, t`$x^{\,y} = b$`, t`$b^{\,x} = y$`],
      answer: 0,
      why: {
        1: t`That makes $y$ the base. In a logarithm the base stays the base; the log is the *exponent*.`,
        2: t`That makes $x$ the base. Test it: $\log_2 8 = 3$, but $8^3 \ne 2$.`,
        3: t`That is the exponential itself, with input $x$ and output $y$ — the logarithm swaps their roles.`,
      },
      hints: [t`Test with $\log_2 8 = 3$: which statement is true for $b = 2$, $x = 8$, $y = 3$?`],
      teach: t`$\log_b x = y$ and $b^y = x$ are the same fact, read in opposite directions.`,
      explain: t`$\log_b x$ is the power of $b$ that gives $x$: $b^{\,y} = x$. With $b = 2$, $x = 8$: $2^3 = 8$ ✓.`,
    }),
    num({
      id: 'order-of-magnitude', difficulty: 2,
      gen(r) {
        const [m, n, what, unit] = r.pick([[5.972, 24, 'Earth’s mass', 'kg'], [3.828, 26, 'the Sun’s luminosity', 'W'], [2.998, 8, 'the speed of light', 'm/s'], [9.109, -31, 'the electron’s mass', 'kg'], [1.989, 30, 'the Sun’s mass', 'kg'], [1.602, -19, 'the elementary charge', 'C']]);
        const ans = n + Math.log10(m);
        return {
          prompt: t`${what[0].toUpperCase() + what.slice(1)} is $${m} \times 10^{${n}}$ ${unit}. What is $\log_{10}$ of this number (in ${unit})? Give 3 decimal places.`,
          answer: ans, tol: { rel: 0, abs: 0.002 },
          errors: [{ value: n, feedback: t`That is only the power of ten. The mantissa adds $\log_{10} ${m} = ${nice(sig(Math.log10(m), 3))}$.` }, { value: Math.log10(m), feedback: t`That is only the mantissa’s part. Add the exponent $${n}$.` }, { value: n * Math.log10(m), feedback: t`Logs turn products into sums: add $${n}$ and $\log_{10} ${m}$, do not multiply them.` }].filter((e) => Math.abs(e.value - ans) > 0.01),
          hints: [t`$\log_{10}(m \times 10^{n}) = \log_{10} m + n$.`, t`$\log_{10} ${m} = ${nice(sig(Math.log10(m), 3))}$.`],
          teach: t`The base-ten logarithm of a number in scientific notation is its exponent plus the logarithm of its mantissa — a number between $0$ and $1$.`,
          explain: t`$${n} + ${nice(sig(Math.log10(m), 4))} = ${ans.toFixed(3)}$. ${n < 0 ? t`Still negative: the number is far below $1$.` : t`It lies between $${n}$ and $${n + 1}$, as a mantissa between $1$ and $10$ requires.`}`,
          visual: logLadder({ items: [{ v: 10 ** n, label: `10${n < 0 ? '⁻' : ''}${String(Math.abs(n)).replace(/\d/g, (d) => '⁰¹²³⁴⁵⁶⁷⁸⁹'[d])}` }, { v: 10 ** (n + 1), label: 'next power of ten' }, { v: m * 10 ** n, label: what, color: 'violet' }], x: [n - 1.2, n + 2.2], xlabel: `${unit} (placed by log₁₀)`, caption: t`The quantity between its neighbouring powers of ten, on a logarithmic axis.` }),
        };
      },
    }),
    mcq({
      id: 'log-domain', difficulty: 2,
      gen(r) {
        const c = r.intExcept(-4, 4, [0, 1, -1]);
        const arg = `x ${c > 0 ? '-' : '+'} ${Math.abs(c)}`;
        return {
          prompt: t`What is the domain of $f(x) = \log_{10}(${arg})$?`,
          visual: { type: 'graph', params: { x: [-6, 8], y: [-3, 2], aspect: 'wide', curves: [{ fn: 'log10(x)', color: 'accent', domain: [0.001, 8], label: 'y = log₁₀ x', labelAt: 5, labelDx: -20, labelDy: -12 }], vlines: [{ x: 0, color: 'bad', label: 'x = 0' }] }, caption: t`The parent, $y = \log_{10} x$, defined for $x > 0$ only.` },
          choices: [t`$x > ${c}$`, t`$x \ge ${c}$`, t`$x > 0$`, t`$x > ${-c}$`],
          answer: 0,
          why: {
            1: t`At $x = ${c}$ the argument is $0$, and $\log 0$ is not defined: no power of $10$ equals $0$.`,
            2: t`That is the parent’s domain. Here the argument is $${arg}$, which must be positive.`,
            3: t`Wrong direction: $${arg} > 0$ means $x > ${c}$. Shifting the input by $${-c}$ moves the graph ${c > 0 ? 'right' : 'left'}.`,
          },
          hints: [t`The argument of a logarithm must be strictly positive.`, t`Solve $${arg} > 0$.`],
          teach: t`$\log(\ldots)$ needs a strictly positive argument; solve that inequality for the domain.`,
          explain: t`$${arg} > 0 \iff x > ${c}$. The graph is the parent moved ${c > 0 ? 'right' : 'left'} by $${Math.abs(c)}$, with its asymptote at $x = ${c}$.`,
        };
      },
    }),
    num({
      id: 'count-half-lives', difficulty: 2,
      gen(r) {
        const [name, T, word] = r.pick([['tritium', 12.32, 'years'], ['phosphorus-32', 14.27, 'days']]), n = r.int(3, 7);
        const pct = 100 / 2 ** n, ans = n * T;
        return {
          prompt: t`A ${name} source (half-life $${T}$ ${word}) has decayed to $${nice(pct)}\%$ of its original activity. How long has it been?`,
          answer: ans, units: word === 'years' ? 'yr' : 'd', tol: { rel: 0.005 },
          errors: [{ value: n, feedback: t`$${n}$ is the number of half-lives, $\log_2(100/${nice(pct)})$. Multiply by the half-life.` }, { value: T * 100 / pct / 2, feedback: t`Count halvings, not a ratio: $${nice(pct)}\%$ is $1/2^{${n}}$, so $${n}$ half-lives.` }].filter((e) => Math.abs(e.value - ans) > 0.01 * ans),
          hints: [t`Which power of $\tfrac12$ is $${nice(pct / 100)}$?`, t`$\log_2 \dfrac{100}{${nice(pct)}} = \log_2 ${2 ** n}$.`],
          teach: t`The number of half-lives elapsed is $\log_2$ of the factor by which the activity has fallen.`,
          explain: t`$100/${nice(pct)} = ${2 ** n} = 2^{${n}}$: $${n}$ half-lives, or $${n} \times ${T} = ${nice(sig(ans, 4))}$ ${word}.`,
          visual: { type: 'graph', params: { x: [-0.3 * T, 8 * T], y: [-5, 110], aspect: 'wide', xlabel: `t (${word})`, ylabel: 'activity (%)', xticks: 0, curves: [{ fn: `100*2^(-x/${T})`, color: 'accent', domain: [0, 8 * T] }], hlines: [{ y: N(pct), color: 'gold', label: `${nice(pct)}%` }] }, caption: t`Activity against time, time scale hidden; the gold line is the level reached.` },
        };
      },
    }),
    mcq({
      id: 'not-reciprocal', difficulty: 2, kind: 'error',
      prompt: t`“$\log_2 x$ is the inverse of $2^x$, so $\log_2 8 = \dfrac{1}{2^8} = \dfrac{1}{256}$.” What is wrong?`,
      visual: { type: 'graph', params: { x: [-3, 9], y: [-2, 9], aspect: 'wide', curves: [{ fn: '2^x', color: 'accent', label: '2ˣ', labelAt: 2.8, labelDx: -24, labelDy: 0 }, { fn: 'ln(x)/ln(2)', color: 'gold', domain: [0.01, 9], label: 'log₂ x', labelAt: 8.5, labelDx: -20, labelDy: -14 }, { fn: '2^(-x)', color: 'bad', dash: true, label: '1/2ˣ', labelAt: -2.6, labelDx: 8, labelDy: 0 }] }, caption: t`Three different curves: $2^x$, its inverse $\log_2 x$, and its reciprocal $1/2^x$.` },
      choices: [t`An inverse undoes $2^x$: $\log_2 8 = 3$, because $2^3 = 8$`, t`It should be $2^{1/8}$`, t`It should be $8/2 = 4$`, t`Nothing: $\log_2 8 = \tfrac{1}{256}$`],
      answer: 0,
      why: {
        1: t`$2^{1/8} \approx 1.09$ has nothing to do with undoing $2^x$. Ask which power of $2$ gives $8$.`,
        2: t`A logarithm counts factors; it does not divide. $8/2$ would be one halving, not the exponent.`,
        3: t`$1/2^x$ is the *reciprocal* — the dashed curve. The inverse is the gold curve, the mirror image in $y = x$.`,
      },
      hints: [t`The $-1$ in $f^{-1}$ means “undo”, not “one over”.`],
      teach: t`$\log_b$ undoes $b^x$; it is not $1/b^x$.`,
      explain: t`$\log_2 8$ asks: $2$ to what power is $8$? Answer $3$. The reciprocal $1/2^8$ is an unrelated number.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-solve-log', difficulty: 2,
      gen(r) {
        const b = r.pick([2, 3, 4, 5]), k = r.int(3, 5), ans = b ** k;
        const errors = [{ value: b * k, feedback: t`$\log_{${b}} x = ${k}$ means $x = ${b}^{${k}}$, not $${b} \times ${k}$.` }, { value: k ** b, feedback: t`The base is $${b}$: $x = ${b}^{${k}}$, not $${k}^{${b}}$.` }].filter((e) => e.value !== ans);
        return {
          prompt: t`Solve $\log_{${b}} x = ${k}$.`,
          answer: ans, tol: { rel: 0, abs: 1e-6 },
          errors,
          hints: [t`Rewrite in exponential form: $${b}^{${k}} = x$.`],
          teach: t`To undo a logarithm, raise its base to both sides.`,
          explain: t`$x = ${b}^{${k}} = ${ans}$.`,
          visual: { type: 'graph', params: { x: [-0.1 * ans, 1.3 * ans], y: [-1, k + 1.5], aspect: 'wide', xticks: 0, curves: [{ fn: `ln(x)/ln(${b})`, color: 'gold', domain: [0.01, 1.3 * ans] }], hlines: [{ y: k, color: 'accent', label: `y = ${k}` }] }, caption: t`$y = \log_{${b}} x$ and the level $${k}$; horizontal scale hidden.` },
        };
      },
    }),
    num({
      id: 'cp-pressure-decades', difficulty: 2, transfer: true,
      gen(r) {
        const k = r.pick([1, 2, 3, 4]), f = 10 ** k, ans = 16 * k;
        return {
          prompt: t`Up to about $70$ km, Earth’s air pressure falls by roughly a factor of $10$ for every $16$ km of height. A sounding rocket’s payload must reach air $${f === 10 ? '10' : t`10^{${k}}`}$ times thinner than at sea level (pressure $1/${f === 10 ? '10' : t`10^{${k}}`}$ of the sea-level value). Roughly how high is that?`,
          answer: ans, units: 'km', tol: { rel: 0.02 },
          errors: [...(k > 1 ? [{ value: 16 * f / 10, feedback: t`The pressure falls by *factors*: $${k}$ factors of $10$ take $${k} \times 16$ km, not $${f}/10 \times 16$.` }] : []), { value: 16 / k, feedback: t`More thinning needs more height: multiply by the number of factors of ten.` }].filter((e) => Math.abs(e.value - ans) > 0.02 * ans),
          hints: [t`How many factors of $10$ is a reduction by $${f}$? That is $\log_{10} ${f}$.`],
          teach: t`When a quantity changes by a constant factor per distance, $\log$ of the total factor counts the distance steps.`,
          explain: t`$\log_{10} ${f} = ${k}$ factors of ten, so about $${k} \times 16 = ${ans}$ km. (The real atmosphere’s temperature varies with height, so this is a good rule of thumb, not an exact law.)`,
          visual: { type: 'graph', params: { x: [0, 75], y: [0.3, 5.3], ylog: true, aspect: 'wide', xlabel: 'altitude (km)', ylabel: 'pressure (Pa)', xticks: 0, curves: [{ fn: `${N(Math.log10(101325))} - x/16`, color: 'accent', domain: [0, 70] }] }, caption: t`Pressure on a logarithmic axis against altitude: a straight line means a constant factor per kilometre. Idealized; altitude scale hidden.` },
        };
      },
    }),
    mcq({
      id: 'cp-log-small', difficulty: 2,
      gen(r) {
        const m = r.pick([2, 3, 5]), n = r.pick([2, 3]), x = m * 10 ** -n, ans = Math.log10(x);
        return {
          prompt: t`Which is $\log_{10}(${nice(x)})$?`,
          visual: logLadder({ items: [{ v: 10 ** -(n + 1), label: `10⁻${'⁰¹²³⁴⁵⁶⁷⁸⁹'[n + 1]}` }, { v: 10 ** -n, label: `10⁻${'⁰¹²³⁴⁵⁶⁷⁸⁹'[n]}` }, { v: 10 ** -(n - 1), label: n - 1 === 1 ? '10⁻¹' : `10⁻${'⁰¹²³⁴⁵⁶⁷⁸⁹'[n - 1]}` }, { v: x, label: nice(x), color: 'violet' }], x: [-n - 1.5, -n + 1.5], xlabel: 'placed by log₁₀', caption: t`The number among the neighbouring powers of ten.` }),
          choices: [t`$${ans.toFixed(2)}$`, t`$${(-ans).toFixed(2)}$`, t`$${Math.log10(m).toFixed(2)}$`, 'not defined, because the number is small'],
          answer: 0,
          why: {
            1: t`A number between $0$ and $1$ has a *negative* logarithm: it takes a negative power of $10$ to make it.`,
            2: t`That is $\log_{10} ${m}$ alone. The factor $10^{-${n}}$ adds $-${n}$.`,
            3: t`Logarithms are undefined for zero and negative numbers, not for small positive ones: $${nice(x)} = 10^{${ans.toFixed(2)}}$.`,
          },
          hints: [t`$${nice(x)} = ${m} \times 10^{-${n}}$.`],
          teach: t`Numbers between $0$ and $1$ have negative logarithms; only zero and negative numbers have none.`,
          explain: t`$\log_{10} ${m} + (-${n}) = ${Math.log10(m).toFixed(2)} - ${n} = ${ans.toFixed(2)}$.`,
        };
      },
    }),
  ],
  sources: [
    { label: 'OpenStax Precalculus 2e, §4.3 Logarithmic Functions', url: 'https://openstax.org/books/precalculus-2e/pages/4-3-logarithmic-functions' },
    { label: 'NASA Earth Fact Sheet; U.S. Standard Atmosphere 1976 (pressure with height)', url: 'https://nssdc.gsfc.nasa.gov/planetary/factsheet/earthfact.html' },
    { label: 'CODATA 2018 recommended values (electron mass, elementary charge)', url: 'https://physics.nist.gov/cuu/Constants/' },
  ],
});
