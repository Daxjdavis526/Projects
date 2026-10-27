// Partial fractions with distinct linear factors: split, cover up, integrate to logarithms.
import { lesson, mcq, num, expr } from '../../src/core/content.js';
import { fmt, nice, polyTeX, polyText } from '../../src/core/format.js';
import { fterm } from './_integration.js';

const t = String.raw;
const lin = (r) => (r === 0 ? 'x' : r > 0 ? `x - ${r}` : `x + ${-r}`);          // x − r, as TeX or as text
const lnAbs = (r) => t`\ln\lvert ${lin(r)}\rvert`;

// (px + q)/((x − r)(x − s)) = A/(x − r) + B/(x − s) with integer A, B chosen first
function pfPair(r) {
  const [rr, s] = r.shuffle([-3, -2, -1, 1, 2, 3, 4]).slice(0, 2);
  const A = r.intExcept(-3, 3, [0]), B = r.intExcept(-3, 3, [0]);
  return { r: rr, s, A, B, p: A + B, q: -(A * s + B * rr) };
}

export default lesson({
  id: 'math1220.C2-2.6',
  title: 'Partial fractions: distinct linear factors',
  minutes: 10, difficulty: 2,
  intro: t`A rational function — one polynomial divided by another — integrates by **splitting it into simple fractions**. When the denominator factors into distinct linear factors, each factor gets one constant:

$$\frac{P(x)}{(x - r_1)(x - r_2)} = \frac{A}{x - r_1} + \frac{B}{x - r_2}$$

Each piece integrates to a logarithm, $\int \frac{A}{x - r}\,dx = A\ln\lvert x - r\rvert + C$. The constants come fastest from the **cover-up rule**: to find $A$, cover the factor $(x - r_1)$ and evaluate what is left at $x = r_1$, so $A = \dfrac{P(r_1)}{r_1 - r_2}$. (If the numerator’s degree is not lower than the denominator’s, divide first.) Partial fractions solve the logistic equation and falling with air drag, and later they drive every Laplace transform.`,
  symbols: [
    { tex: 'P(x)', text: 'the numerator: a polynomial of lower degree than the denominator' },
    { tex: t`r_1,\ r_2`, text: 'the distinct roots of the denominator — the vertical asymptotes, where the function blows up' },
    { tex: t`A,\ B`, text: 'constants, one per factor: how strongly the function blows up at each root' },
    { tex: t`\frac{A}{x - r_1}`, text: t`a simple fraction; its integral is $A\ln\lvert x - r_1\rvert$` },
  ],
  why: t`Near $x = r_1$ the term $\frac{A}{x - r_1}$ swamps everything else, which is why covering up its factor and setting $x = r_1$ reads off $A$.`,
  visual: {
    type: 'graph',
    title: 'A rational function is a sum of simple poles',
    lead: t`The blue curve is $f(x) = \dfrac{x + c}{(x - r)(x - s)}$. The dashed curves are its two partial fractions, $A/(x - r)$ (amber) and $B/(x - s)$ (violet); add them and you get blue exactly. Move the roots and the numerator and watch $A$ and $B$.`,
    tasks: [
      'Near x = r the blue curve hugs the amber piece alone — the cover-up rule in a picture.',
      'Far out, f ≈ (A + B)/x; the readout shows A + B = 1, the leading coefficient of the numerator x + c.',
      'Set c = −r (for example r = −2, c = 2): A becomes 0 and the pole at r vanishes — the numerator cancelled it.',
    ],
    params: {
      x: [-5, 5], y: [-6, 6],
      sliders: [
        { key: 'r', label: 'Root $r$', min: -3, max: -0.5, step: 0.1, value: -2, explain: t`The left vertical asymptote, where $(x - r) = 0$.` },
        { key: 's', label: 'Root $s$', min: 0.5, max: 3, step: 0.1, value: 1.5, explain: t`The right vertical asymptote, where $(x - s) = 0$.` },
        { key: 'c', label: 'Numerator $x + c$', min: -4, max: 4, step: 0.1, value: 1, explain: t`Changes $P(x) = x + c$, and with it both constants.` },
      ],
      curves: [
        { fn: '((r + c)/(r - s))/(x - r)', color: 'warn', dash: true, width: 1.8, label: 'A/(x − r)', labelAt: -4.4 },
        { fn: '((s + c)/(s - r))/(x - s)', color: 'violet', dash: true, width: 1.8, label: 'B/(x − s)', labelAt: 4.1 },
        { fn: '(x + c)/((x - r)*(x - s))', color: 'accent', width: 2.6 },
      ],
      vlines: [{ x: 'r', label: 'r' }, { x: 's', label: 's' }],
      readouts: [
        { label: t`$A = \frac{r + c}{r - s}$`, expr: '(r + c)/(r - s)' },
        { label: t`$B = \frac{s + c}{s - r}$`, expr: '(s + c)/(s - r)' },
        { label: t`$A + B$`, expr: '(r + c)/(r - s) + (s + c)/(s - r)' },
      ],
    },
    caption: 'Exact curves. The vertical dashed lines are the asymptotes; the function is undefined there, and the plot breaks the curve at each one.',
  },
  example: {
    prompt: t`Find $\displaystyle\int \frac{x + 7}{x^2 - x - 6}\,dx$.`,
    visual: {
      type: 'graph',
      params: {
        x: [-5, 6], y: [-6, 6], constants: { r: 3, s: -2, c: 7 },
        curves: [
          { fn: '2/(x - 3)', color: 'warn', dash: true, width: 1.8, label: '2/(x − 3)', labelAt: 4.4 },
          { fn: '-1/(x + 2)', color: 'violet', dash: true, width: 1.8, label: '−1/(x + 2)', labelAt: -4.6 },
          { fn: '(x + 7)/((x - 3)*(x + 2))', color: 'accent', width: 2.6 },
        ],
        vlines: [{ x: 3 }, { x: -2 }],
      },
      caption: t`The integrand (blue) is the sum of the two dashed simple fractions found below.`,
    },
    steps: [
      { label: 'Factor', text: t`$x^2 - x - 6 = (x - 3)(x + 2)$: two distinct linear factors. The numerator has lower degree, so no division is needed.` },
      { label: 'Set up', text: t`$$\frac{x + 7}{(x - 3)(x + 2)} = \frac{A}{x - 3} + \frac{B}{x + 2}.$$` },
      { label: 'Cover up', text: t`For $A$, cover $(x - 3)$ and put $x = 3$ into what is left: $A = \dfrac{3 + 7}{3 + 2} = 2$. For $B$, cover $(x + 2)$ and put $x = -2$: $B = \dfrac{-2 + 7}{-2 - 3} = -1$.` },
      { label: 'Integrate', text: t`$$\int\left(\frac{2}{x - 3} - \frac{1}{x + 2}\right)dx = 2\ln\lvert x - 3\rvert - \ln\lvert x + 2\rvert + C.$$` },
      { label: 'Check', text: t`Recombine: $\dfrac{2}{x - 3} - \dfrac{1}{x + 2} = \dfrac{2(x + 2) - (x - 3)}{(x - 3)(x + 2)} = \dfrac{x + 7}{x^2 - x - 6}$. ✓` },
    ],
    answer: t`$\displaystyle\int \frac{x + 7}{x^2 - x - 6}\,dx = 2\ln\lvert x - 3\rvert - \ln\lvert x + 2\rvert + C$`,
  },
  practice: [
    mcq({
      id: 'form', difficulty: 1,
      gen(r) {
        const a = r.int(2, 5), A = a * a, p = r.intExcept(1, 5, []), q = r.intExcept(-5, 5, [0]);
        return {
          prompt: t`Which is the right form for the partial fractions of $\dfrac{${polyTeX([q, p])}}{x^2 - ${A}}$?`,
          choices: [t`$\dfrac{A}{x - ${a}} + \dfrac{B}{x + ${a}}$`, t`$\dfrac{Ax + B}{x^2 - ${A}}$`, t`$\dfrac{A}{x - ${A}} + \dfrac{B}{x + ${A}}$`, t`$\dfrac{A}{x - ${a}} + \dfrac{B}{x + ${a}} + C$`],
          answer: 0,
          why: {
            1: t`That is the fraction you started with. $x^2 - ${A}$ factors into distinct linear factors, so split it.`,
            2: t`$x^2 - ${A} = (x - ${a})(x + ${a})$, not $(x - ${A})(x + ${A})$.`,
            3: 'A polynomial part appears only when the numerator’s degree is at least the denominator’s; here it is lower.',
          },
          hints: [t`Factor the denominator: a difference of squares.`, t`$x^2 - ${A} = (x - ${a})(x + ${a})$ — one constant over each factor.`],
          teach: 'Factor the denominator completely; each distinct linear factor gets its own constant over it.',
          explain: t`$x^2 - ${A} = (x - ${a})(x + ${a})$, two distinct linear factors, so the form is $\dfrac{A}{x - ${a}} + \dfrac{B}{x + ${a}}$.`,
        };
      },
    }),
    num({
      id: 'cover-up', difficulty: 2,
      gen(r) {
        const { r: rr, s, A, B, p, q } = pfPair(r);
        return {
          prompt: t`Write $\displaystyle\frac{${polyTeX([q, p])}}{(${lin(rr)})(${lin(s)})} = \frac{A}{${lin(rr)}} + \frac{B}{${lin(s)}}$. What is $A$?`,
          answer: A, tol: { abs: 1e-9, rel: 1e-6 },
          errors: A === B ? [] : [{ value: B, feedback: 'That is B. For A, cover up the factor under A and set x equal to its root.' }],
          hints: [t`Cover up $(${lin(rr)})$ in the left-hand side and set $x = ${rr}$ in what remains.`, t`$A = \dfrac{${polyTeX([q, p]).replace(/x/g, `(${rr})`)}}{${rr} - (${s})}$.`],
          teach: 'Cover-up rule: delete the factor, then substitute its root into what remains.',
          explain: t`$A = \dfrac{${polyTeX([q, p]).replace(/x/g, `(${rr})`)}}{${rr} - (${s})} = ${A}$.`,
          visual: {
            type: 'graph',
            params: { x: [-5.5, 5.5], y: [-6, 6], curves: [{ fn: `(${p}*x + ${q})/((${lin(rr)})*(${lin(s)}))`, color: 'accent' }], vlines: [{ x: rr, label: `x = ${rr}` }, { x: s, label: `x = ${s}` }] },
            caption: t`The integrand blows up at $x = ${rr}$ and $x = ${s}$. Near $x = ${rr}$ it behaves like $A/(${lin(rr)})$.`,
          },
        };
      },
    }),
    expr({
      id: 'basic', difficulty: 2,
      gen(r) {
        const [a, b] = r.shuffle([-3, -2, -1, 1, 2, 3]).slice(0, 2), d = a - b, hi = Math.max(a, b);
        return {
          prompt: t`Find $\displaystyle\int \frac{dx}{(${lin(a)})(${lin(b)})}$.`,
          answer: `(ln(abs(${lin(a)})) - ln(abs(${lin(b)})))/(${d})`,
          answerTeX: t`${d === 1 ? '' : d === -1 ? '-' : d < 0 ? t`-\frac{1}{${-d}}` : t`\frac{1}{${d}}`}\Big(${lnAbs(a)} - ${lnAbs(b)}\Big)`,
          integrand: `1/((${lin(a)})*(${lin(b)}))`,
          keys: [['|x|', 'abs(']],
          vars: { x: [hi + 0.5, hi + 4] }, mode: 'constant',
          errors: [{ answer: `ln(abs(${lin(a)})) - ln(abs(${lin(b)}))`, feedback: t`Both constants carry a factor $\tfrac{1}{${d}}$: cover-up gives $A = \tfrac{1}{${a} - (${b})}$.` }].filter(() => Math.abs(d) !== 1),
          hints: [t`Cover-up: $A = \dfrac{1}{${a} - (${b})}$ for $\dfrac{A}{${lin(a)}}$ and $B = \dfrac{1}{${b} - (${a})}$ for $\dfrac{B}{${lin(b)}}$.`, t`Each $\dfrac{k}{x - r}$ integrates to $k\ln\lvert x - r\rvert$.`],
          teach: t`$\dfrac{1}{(x - a)(x - b)} = \dfrac{1}{a - b}\left(\dfrac{1}{x - a} - \dfrac{1}{x - b}\right)$.`,
          explain: t`$A = \tfrac{1}{${a} - (${b})} = ${d < 0 ? '-' : ''}\tfrac{1}{${Math.abs(d)}}$ and $B = -A$, so the integral is $${d < 0 ? '-' : ''}\tfrac{1}{${Math.abs(d)}}\big(${lnAbs(a)} - ${lnAbs(b)}\big) + C$.`,
        };
      },
    }),
    expr({
      id: 'with-numerator', difficulty: 2,
      gen(r) {
        const { r: rr, s, A, B, p, q } = pfPair(r);
        const hi = Math.max(rr, s);
        const errors = [{ answer: `${A}*ln(abs(${lin(rr)})) - (${B})*ln(abs(${lin(s)}))`, feedback: t`Check $B$: cover up $(${lin(s)})$ and put $x = ${s}$.` }];
        if (A !== B) errors.push({ answer: `${A}*ln(abs(${lin(s)})) + (${B})*ln(abs(${lin(rr)}))`, feedback: 'Each constant belongs to the factor you covered up to find it — the two are swapped.' });
        return {
          prompt: t`Find $\displaystyle\int \frac{${polyTeX([q, p])}}{(${lin(rr)})(${lin(s)})}\,dx$.`,
          answer: `${A}*ln(abs(${lin(rr)})) + (${B})*ln(abs(${lin(s)}))`,
          answerTeX: t`${fterm(A, lnAbs(rr), true)}${fterm(B, lnAbs(s))}`,
          integrand: `(${p}*x + ${q})/((${lin(rr)})*(${lin(s)}))`,
          keys: [['|x|', 'abs(']],
          vars: { x: [hi + 0.5, hi + 4] }, mode: 'constant', errors,
          hints: [t`Cover-up at $x = ${rr}$ gives the constant over $(${lin(rr)})$; at $x = ${s}$ the constant over $(${lin(s)})$.`, t`$A = ${A}$, $B = ${B}$; integrate each simple fraction to a logarithm.`],
          teach: 'Split with the cover-up rule, then every simple fraction integrates to a logarithm.',
          explain: t`$\dfrac{${polyTeX([q, p])}}{(${lin(rr)})(${lin(s)})} = \dfrac{${A}}{${lin(rr)}} + \dfrac{${B}}{${lin(s)}}$, so the integral is $${fterm(A, lnAbs(rr), true)}${fterm(B, lnAbs(s))} + C$.`,
        };
      },
    }),
    expr({
      id: 'divide-first', difficulty: 3,
      gen(r) {
        const [rr, s] = r.pick([[2, 1], [3, 2], [-1, -2], [-2, -3], [4, 3]]);
        const A = (rr * rr) / (rr - s), B = (s * s) / (s - rr), hi = Math.max(rr, s);
        return {
          prompt: t`Find $\displaystyle\int \frac{x^2}{${polyTeX([rr * s, -(rr + s), 1])}}\,dx$.`,
          answer: `x + ${A}*ln(abs(${lin(rr)})) + (${B})*ln(abs(${lin(s)}))`,
          answerTeX: t`x${fterm(A, lnAbs(rr))}${fterm(B, lnAbs(s))}`,
          integrand: `x^2/((${lin(rr)})*(${lin(s)}))`,
          keys: [['|x|', 'abs(']],
          vars: { x: [hi + 0.5, hi + 4] }, mode: 'constant',
          errors: [{ answer: `${A}*ln(abs(${lin(rr)})) + (${B})*ln(abs(${lin(s)}))`, feedback: t`The degrees are equal, so divide first: $\dfrac{x^2}{x^2 + \cdots} = 1 + \cdots$, and the $1$ integrates to $x$.` }],
          hints: [
            t`The numerator’s degree equals the denominator’s: divide first. $\dfrac{x^2}{(${lin(rr)})(${lin(s)})} = 1 + \dfrac{${polyTeX([-(rr * s), rr + s])}}{(${lin(rr)})(${lin(s)})}$.`,
            t`Cover-up still works on the original fraction for the simple-fraction part: $A = \dfrac{(${rr})^2}{${rr} - (${s})}$ and $B = \dfrac{(${s})^2}{${s} - (${rr})}$.`,
          ],
          teach: 'When the numerator’s degree is not lower than the denominator’s, divide first; the quotient integrates as a polynomial.',
          explain: t`$\dfrac{x^2}{(${lin(rr)})(${lin(s)})} = 1 + \dfrac{${A}}{${lin(rr)}} ${B < 0 ? '-' : '+'} \dfrac{${Math.abs(B)}}{${lin(s)}}$, so the integral is $x${fterm(A, lnAbs(rr))}${fterm(B, lnAbs(s))} + C$.`,
        };
      },
    }),
    num({
      id: 'definite', difficulty: 2,
      gen(r) {
        const k = r.int(1, 2), a = k + r.int(1, 2), b = a + r.int(1, 2);
        const F = (x) => (1 / (2 * k)) * Math.log((x - k) / (x + k));
        const val = F(b) - F(a);
        return {
          prompt: t`Evaluate $\displaystyle\int_{${a}}^{${b}} \frac{dx}{x^2 - ${k * k}}$ to 3 significant figures.`,
          answer: val, tol: { rel: 0.005 },
          integrand: `1/(x^2 - ${k * k})`, limits: [a, b],
          errors: [{ value: 2 * k * val, feedback: t`Keep the factor $\tfrac{1}{${2 * k}}$: cover-up gives $\pm\tfrac{1}{${2 * k}}$ for both constants.` }],
          hints: [t`$\dfrac{1}{x^2 - ${k * k}} = \dfrac{1}{${2 * k}}\left(\dfrac{1}{x - ${k}} - \dfrac{1}{x + ${k}}\right)$.`, t`So an antiderivative is $\tfrac{1}{${2 * k}}\ln\left\lvert\dfrac{x - ${k}}{x + ${k}}\right\rvert$; evaluate it at ${b} and ${a}.`],
          teach: 'Decompose, integrate to logarithms, and combine them before substituting the limits.',
          explain: t`$\tfrac{1}{${2 * k}}\Big[\ln\tfrac{x - ${k}}{x + ${k}}\Big]_{${a}}^{${b}} = \tfrac{1}{${2 * k}}\Big(\ln\tfrac{${b - k}}{${b + k}} - \ln\tfrac{${a - k}}{${a + k}}\Big) = ${fmt(val, 4)}$.`,
          visual: {
            type: 'graph',
            params: { x: [0, b + 1.5], y: [-0.5, 2], curves: [{ fn: `1/(x^2 - ${k * k})`, color: 'accent' }], shade: [{ fn: `1/(x^2 - ${k * k})`, from: a, to: b }], vlines: [{ x: k, label: `x = ${k}` }] },
            caption: t`The shaded area is the integral. The asymptote at $x = ${k}$ lies outside $[${a}, ${b}]$, so the integral is an ordinary one.`,
          },
        };
      },
    }),
    mcq({
      id: 'missing-factor', difficulty: 3, kind: 'error',
      gen(r) {
        const a = r.int(2, 4), A = a * a;
        return {
          prompt: t`A student writes $\displaystyle\frac{1}{x^2 - ${A}} = \frac{1}{x - ${a}} - \frac{1}{x + ${a}}$. What is wrong?`,
          choices: [
            t`The right side equals $\dfrac{${2 * a}}{x^2 - ${A}}$; each constant should be $\pm\tfrac{1}{${2 * a}}$.`,
            'The two signs should both be plus.',
            t`It should be $\dfrac{1}{x - ${A}} - \dfrac{1}{x + ${A}}$.`,
            'Nothing — it is correct.',
          ],
          answer: 0,
          why: {
            1: t`Then the sum is $\dfrac{2x}{x^2 - ${A}}$ — not even the right shape.`,
            2: t`$x^2 - ${A}$ factors as $(x - ${a})(x + ${a})$.`,
            3: t`Recombine the right side: $\dfrac{(x + ${a}) - (x - ${a})}{x^2 - ${A}} = \dfrac{${2 * a}}{x^2 - ${A}}$.`,
          },
          hints: ['Check any decomposition by recombining it over a common denominator.', t`Cover-up for $\dfrac{A}{x - ${a}}$: $A = \dfrac{1}{${a} + ${a}}$.`],
          teach: 'Always recombine a decomposition — a missing constant factor shows up at once.',
          explain: t`$\dfrac{1}{x^2 - ${A}} = \dfrac{1}{${2 * a}}\left(\dfrac{1}{x - ${a}} - \dfrac{1}{x + ${a}}\right)$: cover-up gives $A = \tfrac{1}{${2 * a}}$ and $B = -\tfrac{1}{${2 * a}}$.`,
        };
      },
    }),
  ],
  checkpoint: [
    expr({
      id: 'cp-factor-first', difficulty: 3,
      gen(r) {
        const { r: rr, s, A, B, p, q } = pfPair(r);
        const hi = Math.max(rr, s);
        return {
          prompt: t`Find $\displaystyle\int \frac{${polyTeX([q, p])}}{${polyTeX([rr * s, -(rr + s), 1])}}\,dx$.`,
          answer: `${A}*ln(abs(${lin(rr)})) + (${B})*ln(abs(${lin(s)}))`,
          answerTeX: t`${fterm(A, lnAbs(rr), true)}${fterm(B, lnAbs(s))}`,
          integrand: `(${p}*x + ${q})/(${polyText([rr * s, -(rr + s), 1])})`,
          keys: [['|x|', 'abs(']],
          vars: { x: [hi + 0.5, hi + 4] }, mode: 'constant',
          hints: [t`Factor: $${polyTeX([rr * s, -(rr + s), 1])} = (${lin(rr)})(${lin(s)})$.`, 'Then cover up each factor in turn.'],
          teach: 'Factor the denominator, cover up for the constants, integrate to logarithms.',
          explain: t`$${polyTeX([rr * s, -(rr + s), 1])} = (${lin(rr)})(${lin(s)})$, the constants are $${A}$ and $${B}$, so the integral is $${fterm(A, lnAbs(rr), true)}${fterm(B, lnAbs(s))} + C$.`,
        };
      },
    }),
    num({
      id: 'cp-definite', difficulty: 2,
      gen(r) {
        const a = r.int(1, 3), val = Math.log(((a + 1) * (a + 1)) / (a * (a + 2)));
        return {
          prompt: t`Evaluate $\displaystyle\int_0^1 \frac{dx}{(x + ${a})(x + ${a + 1})}$ to 3 significant figures.`,
          answer: val, tol: { rel: 0.005 },
          integrand: `1/((x + ${a})*(x + ${a + 1}))`, limits: [0, 1],
          hints: [t`$\dfrac{1}{(x + ${a})(x + ${a + 1})} = \dfrac{1}{x + ${a}} - \dfrac{1}{x + ${a + 1}}$.`],
          teach: 'Decompose, integrate to a log of a ratio, then evaluate.',
          explain: t`$\Big[\ln\tfrac{x + ${a}}{x + ${a + 1}}\Big]_0^1 = \ln\tfrac{${a + 1}}{${a + 2}} - \ln\tfrac{${a}}{${a + 1}} = \ln\tfrac{${(a + 1) ** 2}}{${a * (a + 2)}} = ${fmt(val, 3)}$.`,
        };
      },
    }),
    num({
      id: 'cp-skydiver', difficulty: 3, transfer: true,
      gen(r) {
        const vT = r.pick([50, 55, 60]), f = r.pick([0.5, 0.8, 0.9, 0.95]), g = 9.8;
        const tt = (vT / (2 * g)) * Math.log((1 + f) / (1 - f));
        return {
          prompt: t`A skydiver falling from rest with quadratic air drag obeys $\dfrac{dv}{dt} = g\left(1 - \dfrac{v^2}{v_T^2}\right)$, where $v_T = ${vT}$ m/s is the terminal speed and $g = 9.8\ \text{m/s}^2$. The time to reach speed $v$ is $\displaystyle t = \int_0^{v}\frac{dv'}{g\,(1 - v'^2/v_T^2)}$. How long does it take to reach ${Math.round(f * 100)}% of $v_T$?`,
          answer: tt, units: 's', tol: { rel: 0.01 },
          integrand: `1/(${g}*(1 - x^2/${vT * vT}))`, limits: [0, f * vT],
          errors: [{ value: (f * vT) / g, feedback: t`That is the drag-free time $v/g$. Drag makes the approach to $v_T$ slower.` }],
          hints: [
            t`$\dfrac{1}{1 - v^2/v_T^2} = \dfrac{v_T^2}{(v_T - v)(v_T + v)} = \dfrac{v_T}{2}\left(\dfrac{1}{v_T - v} + \dfrac{1}{v_T + v}\right)$.`,
            t`So $t = \dfrac{v_T}{2g}\ln\dfrac{v_T + v}{v_T - v}$.`,
          ],
          teach: 'Separating the drag equation leaves a rational function of v; partial fractions turn it into logarithms.',
          explain: t`$t = \dfrac{v_T}{2g}\ln\dfrac{1 + ${f}}{1 - ${f}} = \dfrac{${vT}}{19.6}\ln ${nice((1 + f) / (1 - f))} = ${fmt(tt, 3)}$ s. Reaching $v_T$ itself would take forever: the logarithm diverges.`,
          visual: {
            type: 'graph',
            params: {
              x: [0, vT * 1.3], y: [0, 1.2], xlabel: 'v (m/s)', ylabel: 'dt/dv (s²/m)',
              curves: [{ fn: `1/(${g}*(1 - x^2/${vT * vT}))`, color: 'accent', domain: [0, vT * 0.995] }],
              shade: [{ fn: `1/(${g}*(1 - x^2/${vT * vT}))`, from: 0, to: f * vT }],
              vlines: [{ x: vT, label: 'terminal speed' }],
            },
            caption: 'The shaded area is the time. The integrand blows up at the terminal speed. Constant air density and drag coefficient — reasonable for the first few hundred metres of a fall.',
          },
        };
      },
    }),
  ],
  sources: [{ label: 'OpenStax Calculus Vol. 2, §3.4', url: 'https://openstax.org/books/calculus-volume-2/pages/3-4-partial-fractions' }],
});
