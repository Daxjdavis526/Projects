// Log rules and solving exponential equations — products become sums, powers become factors.
import { lesson, mcq, num } from '../../src/core/content.js';
import { nice, sig } from '../../src/core/format.js';
import { N, bars, bothSides, thou } from './_m0kit.js';

const t = String.raw;
const sup = (n) => String(n).replace(/-/g, '⁻').replace(/\d/g, (d) => '⁰¹²³⁴⁵⁶⁷⁸⁹'[d]);

export default lesson({
  id: 'm0.M0-6.3',
  title: 'Log rules and solving exponential equations',
  minutes: 10, difficulty: 3,
  intro: t`Because exponents add when powers multiply, logarithms turn **products into sums** and **powers into multiples**:

$$\log(ab) = \log a + \log b, \qquad \log\frac{a}{b} = \log a - \log b, \qquad \log(a^p) = p\log a$$

These hold in any base, for positive $a$ and $b$. There is **no** rule for $\log(a + b)$: it is not $\log a + \log b$. To change base, $\log_b x = \dfrac{\ln x}{\ln b}$. And to solve an equation with the unknown in an exponent: isolate the exponential, take the logarithm of both sides, and the power rule brings the unknown down to ground level.`,
  symbols: [
    { tex: 'a,\\ b', text: 'positive numbers (logarithms of zero or negatives do not exist)' },
    { tex: 'p', text: 'any real exponent, including fractions and negatives' },
    { tex: '\\log', text: 'a logarithm in one fixed base, the same throughout an equation' },
    { tex: '\\ln', text: 'the natural logarithm, base $e \\approx 2.718$ — the one on every calculator, used for changing base' },
  ],
  why: t`Every “how long until…” question about an exponential — a half-life, a capacitor’s discharge, a fleet’s growth, a rocket’s mass ratio — ends with taking a logarithm. The rules are also why slide rules worked and why log–log plots turn power laws into straight lines.`,
  visual: {
    type: 'graph',
    title: 'A slide rule: multiplying by adding lengths',
    lead: t`On this logarithmic axis a number sits at distance $\log_{10}$ of itself from $1$. Lay the arrow of length $\log a$ (blue) and then $\log b$ (gold) end to end: they reach exactly $ab$. The violet dot is $a + b$.`,
    tasks: [
      t`Set $a = 2$, $b = 5$: the arrows end at $10$, because $\log 2 + \log 5 = \log 10 = 1$.`,
      t`The violet dot $a + b$ falls short of the arrows’ end whenever both numbers exceed $2$: $\log(a + b)$ is not $\log a + \log b$.`,
      t`Set $a = b$: the two arrows are equal and reach $a^2$ — the power rule, $\log(a^2) = 2\log a$.`,
    ],
    params: {
      x: [-0.2, 3.25], y: [-1, 1], xlog: true, aspect: 'wide', xlabel: 'number (placed by log₁₀)', ylabel: '', yticks: 0,
      sliders: [
        { key: 'a', label: t`First factor $a$`, min: 1, max: 40, step: 0.5, value: 2, explain: t`Its arrow has length $\log_{10} a$.` },
        { key: 'b', label: t`Second factor $b$`, min: 1, max: 40, step: 0.5, value: 5, explain: t`Its arrow has length $\log_{10} b$, laid on after the first.` },
      ],
      arrows: [
        { from: [0, 0.35], to: ['log10(a)', 0.35], color: 'accent', width: 3, label: 'log a', labelDx: -30, labelDy: -12 },
        { from: ['log10(a)', 0.35], to: ['log10(a) + log10(b)', 0.35], color: 'gold', width: 3, label: 'log b', labelDx: -30, labelDy: -12 },
      ],
      points: [
        { x: 'log10(a*b)', y: 0, color: 'gold', r: 6, label: 'ab', labelAlign: 'center', labelDx: 0, labelDy: 20 },
        { x: 'log10(a + b)', y: 0, color: 'violet', r: 5, label: 'a + b', labelAlign: 'center', labelDx: 0, labelDy: -16 },
      ],
      readouts: [{ label: t`$\log a + \log b$`, expr: 'log10(a) + log10(b)', digits: 4 }, { label: t`$\log(ab)$`, expr: 'log10(a*b)', digits: 4 }, { label: t`$\log(a + b)$`, expr: 'log10(a + b)', digits: 4 }],
    },
    caption: t`Exact. A slide rule is two such scales sliding past each other; engineers multiplied this way until the 1970s.`,
  },
  example: {
    prompt: t`Solve $2^{\,x + 1} = 5 \cdot 3^{\,x}$.`,
    visual: bothSides({ lhs: '2^(x + 1)', rhs: '5*3^x', x: [-4, 1], y: [-0.2, 4], xticks: null, lhsLabel: 'y = 2ˣ⁺¹', rhsLabel: 'y = 5·3ˣ', legendAt: 'tl', caption: t`The two sides meet once, near $x = -2.3$. Logarithms find the exact value.` }),
    steps: [
      { label: 'Take logs', text: t`Apply $\ln$ to both sides: $\ln(2^{x + 1}) = \ln(5 \cdot 3^{x})$.` },
      { label: 'Use the rules', text: t`Power rule on the left, product then power rule on the right: $(x + 1)\ln 2 = \ln 5 + x\ln 3$.` },
      { label: 'Collect x', text: t`$x\ln 2 - x\ln 3 = \ln 5 - \ln 2$, so $x(\ln 2 - \ln 3) = \ln 5 - \ln 2$.` },
      { label: 'Solve', text: t`$x = \dfrac{\ln 5 - \ln 2}{\ln 2 - \ln 3} = \dfrac{\ln(5/2)}{\ln(2/3)} = \dfrac{${nice(sig(Math.log(2.5), 4))}}{${nice(sig(Math.log(2 / 3), 4))}} \approx ${nice(sig(Math.log(2.5) / Math.log(2 / 3), 4))}$.` },
      { label: 'Check', text: t`$2^{${nice(sig(Math.log(2.5) / Math.log(2 / 3) + 1, 3))}} \approx ${nice(sig(2 ** (Math.log(2.5) / Math.log(2 / 3) + 1), 3))}$ and $5 \cdot 3^{${nice(sig(Math.log(2.5) / Math.log(2 / 3), 3))}} \approx ${nice(sig(5 * 3 ** (Math.log(2.5) / Math.log(2 / 3)), 3))}$ ✓. Negative is fine: an exponent can be any real number.` },
    ],
    answer: t`$x = \dfrac{\ln(5/2)}{\ln(2/3)} \approx ${nice(sig(Math.log(2.5) / Math.log(2 / 3), 4))}$`,
  },
  practice: [
    mcq({
      id: 'product-not-sum', difficulty: 1,
      gen(r) {
        const [m, n] = r.pick([[2, 3], [3, 4], [2, 5], [2, 4], [1, 3]]);
        return {
          prompt: t`Which statement is true? (All logs are base $10$.)`,
          visual: { type: 'graph', params: { x: [-0.3, m + n + 0.6], y: [-1, 1], xlog: true, aspect: 'wide', xlabel: 'placed by log₁₀', ylabel: '', yticks: 0,
            points: [{ x: m, y: 0, color: 'accent', r: 5, label: `10${sup(m)}`, labelAlign: 'center', labelDx: 0, labelDy: -16 }, { x: n, y: 0, color: 'accent', r: 5, label: `10${sup(n)}`, labelAlign: 'center', labelDx: 0, labelDy: 20 }, { x: N(Math.log10(10 ** m + 10 ** n)), y: 0, color: 'violet', r: 5, label: 'sum', labelAlign: 'center', labelDx: 0, labelDy: -16 }, { x: m + n, y: 0, color: 'gold', r: 5, label: 'product', labelAlign: 'center', labelDx: 0, labelDy: 20 }] }, caption: t`The two numbers, their sum and their product, placed by their base-ten logarithms.` },
          choices: [t`$\log(10^{${m}} \times 10^{${n}}) = ${m + n}$`, t`$\log(10^{${m}} + 10^{${n}}) = ${m + n}$`, t`$\log(10^{${m}} \times 10^{${n}}) = ${m * n}$`, t`$\log(10^{${m}}) \times \log(10^{${n}}) = ${m + n}$`],
          answer: 0,
          why: {
            1: t`There is no rule for the log of a sum. $10^{${m}} + 10^{${n}} = ${thou(10 ** m + 10 ** n)}$, whose log is about $${nice(sig(Math.log10(10 ** m + 10 ** n), 3))}$.`,
            2: t`The log of a product is the *sum* of the logs: $${m} + ${n}$, not $${m} \times ${n}$.`,
            3: t`$\log(10^{${m}}) \times \log(10^{${n}}) = ${m} \times ${n} = ${m * n}$. Multiplying logs corresponds to nothing simple.`,
          },
          hints: [t`$10^{${m}} \times 10^{${n}} = 10^{${m} + ${n}}$.`],
          teach: t`$\log(ab) = \log a + \log b$ — and there is no matching rule for $\log(a + b)$.`,
          explain: t`$10^{${m}} \times 10^{${n}} = 10^{${m + n}}$, so its log is $${m + n}$. On the log axis, the product sits at the sum of the two positions; the sum of the numbers barely moves past the larger one.`,
        };
      },
    }),
    num({
      id: 'combine-logs', difficulty: 2,
      gen(r) {
        const p = r.int(2, 5), q = r.pick([2, 4, 6]), m = r.pick([2, 3]), ans = m * p + q / 2;
        return {
          prompt: t`Given $\ln a = ${p}$ and $\ln b = ${q}$, find $\ln\!\big(a^{${m}}\sqrt{b}\big)$.`,
          answer: ans, tol: { rel: 0, abs: 1e-6 },
          errors: [{ value: p ** m * Math.sqrt(q), feedback: t`The rules act on the logs: $\ln(a^{${m}}) = ${m}\ln a$, not $(\ln a)^{${m}}$; and $\ln\sqrt b = \tfrac12 \ln b$.` }, { value: m * p + q, feedback: t`$\sqrt b = b^{1/2}$, so it contributes $\tfrac12 \ln b$.` }, { value: m * p * q / 2, feedback: t`A product inside the log becomes a *sum* of logs, not a product.` }].filter((e) => Math.abs(e.value - ans) > 1e-6),
          hints: [t`$\ln(a^{${m}}\sqrt b) = \ln(a^{${m}}) + \ln(b^{1/2})$.`, t`Power rule: $${m}\ln a + \tfrac12\ln b$.`],
          teach: t`Split a product into a sum of logs, then bring each power down as a factor.`,
          explain: t`$${m}\ln a + \tfrac12\ln b = ${m}(${p}) + \tfrac12(${q}) = ${nice(ans)}$.`,
          visual: bars({ values: [p, q, m * p, q / 2], k0: 1, labels: ['ln a', 'ln b', `${m} ln a`, '½ ln b'], xlabel: '', ylabel: 'value', colors: ['accent', 'gold', 'accent', 'gold'], alpha: 0.35, extra: { axesAt: 'edge' }, caption: t`The given logs, and the two pieces the rules turn them into. Their sum is the answer.` }),
        };
      },
    }),
    num({
      id: 'solve-exp', difficulty: 2,
      gen(r) {
        const A = r.pick([2, 3, 5]), k = r.pick([2, 3, 0.5]), m = r.pick([4, 6, 10]), B = A * m, ans = Math.log(m) / k;
        return {
          prompt: t`Solve $${A}e^{${k === 0.5 ? '0.5' : k}t} = ${B}$.`,
          answer: ans, tol: { rel: 0.005 },
          errors: [{ value: m / k, feedback: t`After dividing by $${A}$, $e^{${k}t} = ${m}$ — take $\ln$ of both sides, not just drop the $e$.` }, { value: Math.log(B) / k, feedback: t`Divide by $${A}$ first: the $\ln$ of a product is not taken term by term. $e^{${k}t} = ${m}$.` }, { value: Math.log(m) * k, feedback: t`$${k}t = \ln ${m}$, so divide by $${k}$.` }].filter((e) => Math.abs(e.value - ans) > 0.01 * ans),
          hints: [t`Isolate the exponential: $e^{${k}t} = ${m}$.`, t`Take $\ln$: $${k}t = \ln ${m}$.`],
          teach: t`Isolate the exponential, then take the logarithm of both sides.`,
          explain: t`$e^{${k}t} = ${m} \Rightarrow t = \dfrac{\ln ${m}}{${k}} = ${nice(sig(ans, 4))}$.`,
          visual: bothSides({ lhs: `${A}*e^(${k}x)`, rhs: `${B}`, x: [-0.2, 2.2 * ans], y: [0, 1.6 * B], xlabel: 't', lhsLabel: `y = ${A}·exp(${k}t)`, rhsLabel: `y = ${B}`, legendAt: 'tl', caption: t`The two sides; time scale hidden.` }),
        };
      },
    }),
    num({
      id: 'change-of-base', difficulty: 2,
      gen(r) {
        const Nn = r.pick([1000, 50, 300, 7, 20]), ans = Math.log(Nn) / Math.log(2);
        return {
          prompt: t`Evaluate $\log_2 ${Nn}$ to 3 significant figures.`,
          answer: ans, tol: { rel: 0.005 },
          errors: [{ value: Math.log10(Nn) / 2, feedback: t`Change of base divides by the log *of the base*: $\log_{10} ${Nn} / \log_{10} 2$, not $/2$.` }, { value: Math.log(Nn / 2), feedback: t`$\dfrac{\ln ${Nn}}{\ln 2}$ is not $\ln\dfrac{${Nn}}{2}$: a quotient of logs is not the log of a quotient.` }],
          hints: [t`$\log_2 x = \dfrac{\ln x}{\ln 2}$ (any base works on top and bottom, as long as it is the same).`],
          teach: t`Change of base: $\log_b x = \ln x / \ln b$.`,
          explain: t`$\dfrac{\ln ${Nn}}{\ln 2} = \dfrac{${nice(sig(Math.log(Nn), 4))}}{0.6931} = ${nice(sig(ans, 3))}$. Check: $2^{${nice(sig(ans, 3))}} \approx ${Nn}$ ✓.`,
          visual: { type: 'graph', params: { x: [-1, 12], y: [-0.08 * Nn, 1.35 * Nn], aspect: 'wide', xticks: 0, yticks: 0, curves: [{ fn: '2^x', color: 'accent', label: 'y = 2ˣ', labelAt: Math.log2(Nn) * 0.92, labelDx: -52, labelDy: 0 }], hlines: [{ y: Nn, color: 'gold', label: `y = ${Nn}` }] }, caption: t`$\log_2 ${Nn}$ is the $x$ where $2^x$ reaches $${Nn}$; scales hidden.` },
        };
      },
    }),
    num({
      id: 'two-bases', difficulty: 3,
      gen(r) {
        const [b1, b2] = r.pick([[5, 2], [7, 3], [6, 4], [9, 4]]), c = r.pick([10, 20, 50]);
        const ans = Math.log(c) / Math.log(b1 / b2);
        return {
          prompt: t`Solve $${b1}^{\,x} = ${c} \cdot ${b2}^{\,x}$.`,
          answer: ans, tol: { rel: 0.005 },
          errors: [{ value: Math.log(c) / Math.log(b1 - b2), feedback: t`$\ln ${b1} - \ln ${b2}$ is $\ln\tfrac{${b1}}{${b2}}$, not $\ln(${b1} - ${b2})$: logs turn quotients into differences, never differences into anything.` }, { value: c / (b1 - b2), feedback: t`Take logs: the unknown is in the exponents, so ordinary division cannot reach it.` }],
          hints: [t`Divide both sides by $${b2}^x$: $\left(\tfrac{${b1}}{${b2}}\right)^x = ${c}$.`, t`Take $\ln$: $x\ln\tfrac{${b1}}{${b2}} = \ln ${c}$.`],
          teach: t`Gather the exponentials into one, $(b_1/b_2)^x$, then take a logarithm.`,
          explain: t`$x = \dfrac{\ln ${c}}{\ln ${b1} - \ln ${b2}} = \dfrac{${nice(sig(Math.log(c), 4))}}{${nice(sig(Math.log(b1 / b2), 4))}} = ${nice(sig(ans, 4))}$.`,
          visual: bothSides({ lhs: `${b1}^x`, rhs: `${c}*${b2}^x`, x: [-0.3, ans * 1.5], y: [0, 2.2 * c * b2 ** ans], yticks: 0, lhsLabel: `y = ${b1}ˣ`, rhsLabel: `y = ${c}·${b2}ˣ`, legendAt: 'tl', caption: t`The faster-growing $${b1}^x$ starts lower but overtakes; scales hidden.` }),
        };
      },
    }),
    mcq({
      id: 'quotient-slip', difficulty: 2, kind: 'error',
      prompt: t`A student simplifies $\dfrac{\ln 8}{\ln 2} = \ln\dfrac{8}{2} = \ln 4 \approx 1.39$. What is the correct value, and what went wrong?`,
      visual: bars({ values: [Math.log(2), Math.log(8)], k0: 1, labels: ['ln 2 ≈ 0.693', 'ln 8 ≈ 2.079'], xlabel: '', ylabel: 'value', colors: ['gold', 'accent'], extra: { axesAt: 'edge', hlines: [{ y: N(Math.log(2)), color: 'ink3' }, { y: N(2 * Math.log(2)), color: 'ink3' }] }, caption: t`The two logarithms as bars; the dashed lines mark one and two copies of $\ln 2$.` }),
      choices: [t`$3$: a quotient of logs is $\log_2 8$, not the log of a quotient`, t`$1.39$: the simplification is right`, t`$4$: the logs cancel, leaving $8/2$`, t`$0.69$: it equals $\ln 8 - \ln 2$ divided by $3$`],
      answer: 0,
      why: {
        1: t`$\ln\tfrac82 = \ln 8 - \ln 2$ — a *difference* of logs. The quotient $\ln 8 / \ln 2$ is something else.`,
        2: t`$\ln$ is not a factor that cancels; it is a function of its argument.`,
        3: t`That reverses nothing usefully: $\ln 8 = 3\ln 2$, so the quotient is exactly $3$.`,
      },
      hints: [t`Write $8 = 2^3$ and use the power rule on $\ln 8$.`],
      teach: t`$\dfrac{\ln a}{\ln b} = \log_b a$; only $\ln a - \ln b$ equals $\ln\dfrac ab$.`,
      explain: t`$\ln 8 = \ln 2^3 = 3\ln 2$, so $\dfrac{\ln 8}{\ln 2} = 3 = \log_2 8$. Three copies of the gold bar make the blue one.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-solve', difficulty: 2,
      gen(r) {
        const A = r.pick([2, 4, 5]), b = r.pick([2, 3, 10]), B = r.pick([30, 70, 150, 500]), ans = Math.log(B / A) / Math.log(b);
        return {
          prompt: t`Solve $${A} \cdot ${b}^{\,x} = ${B}$ to 3 significant figures.`,
          answer: ans, tol: { rel: 0.005 },
          errors: [{ value: Math.log(B) / Math.log(A * b), feedback: t`$${A} \cdot ${b}^x$ is not $(${A * b})^x$: divide by $${A}$ before taking logs.` }, { value: B / A / b, feedback: t`The unknown is an exponent: take a logarithm, $x = \log_{${b}}(${B}/${A})$.` }].filter((e) => Math.abs(e.value - ans) > 0.01 * Math.abs(ans)),
          hints: [t`$${b}^x = ${nice(B / A)}$.`, t`$x = \dfrac{\ln ${nice(B / A)}}{\ln ${b}}$.`],
          teach: t`Isolate the power, then $x = \log_b(\text{what it equals})$.`,
          explain: t`$${b}^x = ${nice(B / A)}$, so $x = \dfrac{\ln ${nice(B / A)}}{\ln ${b}} = ${nice(sig(ans, 3))}$.`,
          visual: bothSides({ lhs: `${A}*${b}^x`, rhs: `${B}`, x: [-0.3, 1.8 * ans], y: [0, 1.6 * B], yticks: 0, lhsLabel: `y = ${A}·${b}ˣ`, rhsLabel: `y = ${B}`, legendAt: 'tl', caption: t`The two sides; scales hidden.` }),
        };
      },
    }),
    num({
      id: 'cp-rtg', difficulty: 3, transfer: true,
      gen(r) {
        const f = r.pick([0.8, 0.7, 0.6]), T = 28.8, ans = T * Math.log(1 / f) / Math.log(2);
        return {
          prompt: t`Soviet lighthouse generators ran on the heat of strontium-90 (half-life $28.8$ years), so their power fell as $P = P_0 \cdot 2^{-t/28.8}$. Counting decay only, after how many years is the power down to $${Math.round(f * 100)}\%$ of the original?`,
          answer: ans, units: 'yr', tol: { rel: 0.01 },
          errors: [{ value: 2 * T * (1 - f), feedback: t`That treats the decay as linear. Take logs: $t = 28.8\,\log_2(1/${f})$.` }, { value: T * f, feedback: t`$t/28.8$ is the number of half-lives, $\log_2(1/${f})$ — not $${f}$ itself.` }],
          hints: [t`$2^{-t/28.8} = ${f}$.`, t`Take $\ln$: $-\dfrac{t}{28.8}\ln 2 = \ln ${f}$.`, t`$t = 28.8 \times \dfrac{\ln(1/${f})}{\ln 2}$.`],
          teach: t`Time to fall to a fraction $f$ is $t_{1/2}\log_2(1/f)$ — less than one half-life when $f > \tfrac12$.`,
          explain: t`$t = 28.8 \times \dfrac{\ln(1/${f})}{\ln 2} = 28.8 \times ${nice(sig(Math.log(1 / f) / Math.log(2), 3))} = ${nice(sig(ans, 3))}$ years. Real units also lost output as their thermocouples aged.`,
          visual: { type: 'graph', params: { x: [-2, 60], y: [0, 1.1], aspect: 'wide', xlabel: 't (years)', ylabel: 'P / P₀', xticks: 0, curves: [{ fn: '2^(-x/28.8)', color: 'accent', domain: [0, 60] }], hlines: [{ y: f, color: 'gold', label: `${Math.round(f * 100)}%` }] }, caption: t`Power from radioactive decay alone; time scale hidden.` },
        };
      },
    }),
    mcq({
      id: 'cp-power-rule', difficulty: 2,
      gen(r) {
        const [m, p] = r.pick([[3, 2], [2, 3], [3, 4], [2, 5]]);
        return {
          prompt: t`What is $\log_{10}\!\big((10^{${m}})^{${p}}\big)$?`,
          choices: [t`$${m * p}$`, t`$${m ** p}$`, t`$${m + p}$`, t`$${p ** m}$`],
          answer: 0,
          why: {
            1: t`That is $(\log 10^{${m}})^{${p}} = ${m}^{${p}}$. The power rule brings the exponent down as a *factor*: $${p}\log(10^{${m}})$.`,
            2: t`Raising a power to a power multiplies the exponents: $(10^{${m}})^{${p}} = 10^{${m * p}}$, not $10^{${m + p}}$.`,
            3: t`The exponents are $${m}$ and $${p}$, multiplied: $${m} \times ${p}$, not $${p}^{${m}}$.`,
          },
          hints: [t`$\log(a^p) = p\log a$.`],
          teach: t`$\log(a^p) = p\log a$, not $(\log a)^p$.`,
          explain: t`$\log((10^{${m}})^{${p}}) = ${p}\log(10^{${m}}) = ${p} \times ${m} = ${m * p}$.`,
        };
      },
    }),
  ],
  sources: [
    { label: 'OpenStax Precalculus 2e, §4.5 Logarithmic Properties', url: 'https://openstax.org/books/precalculus-2e/pages/4-5-logarithmic-properties' },
    { label: 'OpenStax Precalculus 2e, §4.6 Exponential and Logarithmic Equations', url: 'https://openstax.org/books/precalculus-2e/pages/4-6-exponential-and-logarithmic-equations' },
    { label: 'NNDC NuDat 3: strontium-90 half-life', url: 'https://www.nndc.bnl.gov/nudat3/' },
  ],
});
