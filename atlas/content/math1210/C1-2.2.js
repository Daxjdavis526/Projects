// Limit laws and algebraic techniques — substitute when you can; when you get
// 0/0, factor, rationalize or combine fractions until you can; squeeze what
// you cannot simplify.
import { lesson, mcq, num } from '../../src/core/content.js';
import { nice, fmt, frac, polyTeX, tex } from '../../src/core/format.js';

const t = String.raw;

const is = (k) => `step(0.5 - abs(k - ${k}))`;
// the three 0/0 examples of the Explore graph, as expressions of x
const ORIG = [`(x^2 - 1)/(x - 1)`, `(sqrt(x + 1) - 1)/x`, `(2/(x + 2) - 1)/x`];
const SIMP = ['x + 1', '1/(sqrt(x + 1) + 1)', '-1/(x + 2)'];
const A = is(0);          // the point approached: 1 for the first example, 0 for the others
const at = (src, s) => src.replace(/x/g, `(${A} + (${s})*d)`);
const mix = (s) => ORIG.map((f, k) => `${is(k)}*${at(f, s)}`).join(' + ');

// a graph of a function with a hole at x = a (the curve is drawn with a small gap)
const holed = (fn, a, x, y, extra = {}) => {
  const g = 0.02 * (x[1] - x[0]);
  return { type: 'graph', params: { x, y, aspect: 'wide', curves: [{ fn, color: 'accent', domain: [x[0], a - g] }, { fn, color: 'accent', domain: [a + g, x[1]] }], ...extra } };
};

export default lesson({
  id: 'math1210.C1-2.2',
  title: 'Limit laws and algebraic techniques',
  minutes: 10, difficulty: 2,
  intro: t`Limits respect arithmetic. If $\lim f = A$ and $\lim g = B$ both exist as $x \to a$, then the limit of a sum is $A + B$, of a product $AB$, of a power $A^n$, and

$$\lim_{x\to a}\frac{f(x)}{g(x)} = \frac{A}{B} \quad\text{provided } B \ne 0.$$

So for polynomials and for rational functions whose denominator is not zero at $a$, you simply **substitute**. When substitution gives $0/0$, the limit is still undecided: simplify first — **factor and cancel**, **rationalize** a root, or **combine fractions** — because a function that agrees with $f$ everywhere except at $a$ has the same limit. What you cannot simplify, you can sometimes **squeeze** between two functions with a common limit.`,
  symbols: [
    { tex: 'f,\\ g', text: 'the two functions being combined' },
    { tex: 'a', text: 'the point $x$ approaches' },
    { tex: 'A,\\ B', text: 'the limits of $f$ and $g$ at $a$ — each must exist for the laws to apply' },
    { tex: 'B \\ne 0', text: 'the quotient law’s condition: if $B = 0$ the law says nothing, and you must work harder' },
  ],
  why: t`These manipulations turn every difference quotient into a derivative, and they are how physicists extract the Newtonian limit from a relativistic formula.`,
  visual: {
    type: 'graph',
    title: 'Three kinds of 0/0, and the simpler function behind each',
    lead: t`Each curve has a hole where substitution gives $0/0$. After simplifying you get a function that is identical except that it is defined at the hole; the last readout is its value there. Shrink $d$: the values on both sides of the hole close in on that number.`,
    tasks: [
      t`Factor: $\frac{x^2 - 1}{x - 1} = x + 1$ for $x \ne 1$, so the limit at $1$ is $2$.`,
      t`Rationalize: $\frac{\sqrt{x+1} - 1}{x} = \frac{1}{\sqrt{x+1} + 1}$ for $x \ne 0$; at $0$ that is $\tfrac12$.`,
      t`Combine fractions: $\frac{1}{x}\left(\frac{2}{x+2} - 1\right) = \frac{-1}{x+2}$, which is $-\tfrac12$ at $0$.`,
    ],
    params: {
      x: [-1.6, 3], y: [-1.6, 3.4], aspect: 'wide',
      choices: [{ key: 'k', label: 'Technique', options: [[0, 'factor'], [1, 'rationalize'], [2, 'combine fractions']], value: 0, explain: 'Which kind of 0/0 to look at.' }],
      sliders: [{ key: 'd', label: t`Distance $d$ from the hole`, min: 0.001, max: 0.9, step: 0.001, value: 0.6, logScale: true, explain: t`How far the two sample points sit from the point being approached.` }],
      curves: [
        ...ORIG.flatMap((f, k) => [{ fn: f, color: 'accent', when: is(k), domain: [k === 1 ? -1 : -1.6, (k === 0 ? 1 : 0) - 0.06] }, { fn: f, color: 'accent', when: is(k), domain: [(k === 0 ? 1 : 0) + 0.06, 3] }]),
      ],
      points: [{ x: `${A} - d`, y: mix('-1'), color: 'violet' }, { x: `${A} + d`, y: mix('1'), color: 'violet' }],
      readouts: [
        { label: t`left value`, expr: mix('-1'), digits: 5 },
        { label: t`right value`, expr: mix('1'), digits: 5 },
        { label: t`simplified function at the hole`, expr: SIMP.map((f, k) => `${is(k)}*${f.replace(/x/g, `(${A})`)}`).join(' + '), digits: 5 },
      ],
    },
    caption: t`The curve is the original function, drawn with a small gap at its hole; at the hole itself it has no value. The simplified functions are $x + 1$, $\frac{1}{\sqrt{x+1}+1}$ and $\frac{-1}{x+2}$.`,
  },
  example: {
    prompt: t`A particle of mass $m$ and momentum $p$ has total energy $E = \sqrt{p^2c^2 + m^2c^4}$, and $E - mc^2$ is its kinetic energy. Find $\displaystyle\lim_{p\to 0}\frac{E - mc^2}{p^2}$.`,
    visual: holed('(sqrt(x^2 + 1) - 1)/x^2', 0, [-3, 3], [0, 0.7], { xlabel: 'p (units of mc)', ylabel: '(E − mc²)/p²' }),
    steps: [
      { label: 'Try substitution', text: t`At $p = 0$: $\frac{\sqrt{m^2c^4} - mc^2}{0} = \frac{0}{0}$. Undecided — the quotient law does not apply because the denominator’s limit is $0$.` },
      { label: 'Rationalize', text: t`Multiply top and bottom by the conjugate $\sqrt{p^2c^2 + m^2c^4} + mc^2$. The top becomes $(p^2c^2 + m^2c^4) - m^2c^4 = p^2c^2$.` },
      { label: 'Cancel', text: t`$\dfrac{p^2c^2}{p^2\left(\sqrt{p^2c^2 + m^2c^4} + mc^2\right)} = \dfrac{c^2}{\sqrt{p^2c^2 + m^2c^4} + mc^2}$ for $p \ne 0$.` },
      { label: 'Substitute', text: t`Now the denominator tends to $2mc^2 \ne 0$, so the quotient law applies: the limit is $\dfrac{c^2}{2mc^2} = \dfrac{1}{2m}$.` },
      { label: 'Meaning', text: t`For small momentum, $E - mc^2 \approx \dfrac{p^2}{2m}$ — Newton’s kinetic energy, recovered as a limit of Einstein’s. The graph (with $m = c = 1$) heads for $\tfrac12$.` },
    ],
    answer: t`$\displaystyle\lim_{p\to0}\frac{E - mc^2}{p^2} = \frac{1}{2m}$, so at low momentum $E \approx mc^2 + \dfrac{p^2}{2m}$.`,
  },
  practice: [
    num({
      id: 'direct', difficulty: 1,
      gen(r) {
        const a = r.int(-3, 4), c = r.int(1, 6), b = r.intExcept(-5, 5, [a]);
        const ans = (a * a + c) / (a - b);
        return {
          prompt: t`Evaluate $\displaystyle\lim_{x\to ${a}}\frac{x^2 + ${c}}{x ${b < 0 ? '+' : '-'} ${Math.abs(b)}}$.`,
          answer: ans, tol: { rel: 0.002, abs: 0.002 },
          hints: [t`The denominator at $x = ${a}$ is $${a - b} \ne 0$, so the quotient law lets you substitute.`],
          teach: 'For a rational function whose denominator is not zero at a, the limit is the value: substitute.',
          explain: t`Substitute: $\dfrac{${a * a} + ${c}}{${a - b}} = ${frac(ans)}$. No $0/0$, so nothing needs simplifying.`,
          visual: holed(`(x^2 + ${c})/(x - (${b}))`, b, [b - 6, b + 6], [-30, 30], { vlines: [{ x: a, label: `x = ${a}`, color: 'gold' }] }),
        };
      },
    }),
    num({
      id: 'factor', difficulty: 2,
      gen(r) {
        const rr = r.int(-4, 5), s = r.intExcept(-5, 5, [rr]);
        const top = polyTeX([rr * s, -(rr + s), 1]);
        return {
          prompt: t`Evaluate $\displaystyle\lim_{x\to ${rr}}\frac{${top}}{x ${rr < 0 ? '+' : '-'} ${Math.abs(rr)}}$.`,
          answer: rr - s, tol: { rel: 1e-6, abs: 1e-6 },
          errors: [{ value: 0, feedback: t`Substitution gives $0/0$, which is undecided, not $0$. Factor the numerator.` }],
          hints: [t`Substituting gives $0/0$, so $x ${rr < 0 ? '+' : '-'} ${Math.abs(rr)}$ must be a factor of the numerator.`, t`$${top} = (x ${rr < 0 ? '+' : '-'} ${Math.abs(rr)})(x ${s < 0 ? '+' : '-'} ${Math.abs(s)})$.`],
          teach: t`If a polynomial vanishes at $x = a$, then $x - a$ is a factor — cancel it, then substitute.`,
          explain: t`For $x \ne ${rr}$ the expression equals $x ${s < 0 ? '+' : '-'} ${Math.abs(s)}$, whose value at $${rr}$ is $${rr - s}$.`,
          visual: holed(`x - (${s})`, rr, [rr - 4, rr + 4], [Math.min(rr - s, 0) - 5, Math.max(rr - s, 0) + 5]),
        };
      },
    }),
    num({
      id: 'rationalize', difficulty: 2,
      gen(r) {
        const k = r.int(2, 6);
        return {
          prompt: t`Evaluate $\displaystyle\lim_{x\to ${k * k}}\frac{\sqrt{x} - ${k}}{x - ${k * k}}$.`,
          answer: 1 / (2 * k), tol: { rel: 0.002 },
          errors: [{ value: 0, feedback: t`$0/0$ is undecided. Multiply by the conjugate $\sqrt{x} + ${k}$.` }, { value: 1 / k, feedback: t`After cancelling, the denominator is $\sqrt{x} + ${k}$, which is $${2 * k}$ at $x = ${k * k}$, not $${k}$.` }],
          hints: [t`Multiply top and bottom by $\sqrt{x} + ${k}$.`, t`The top becomes $x - ${k * k}$, which cancels with the bottom, leaving $\frac{1}{\sqrt{x} + ${k}}$.`],
          teach: 'Multiplying by the conjugate turns a difference of square roots into a difference of squares.',
          explain: t`$\dfrac{\sqrt{x} - ${k}}{x - ${k * k}} = \dfrac{\sqrt{x} - ${k}}{(\sqrt{x} - ${k})(\sqrt{x} + ${k})} = \dfrac{1}{\sqrt{x} + ${k}} \to \dfrac{1}{${2 * k}}$. (Factoring $x - ${k * k}$ as a difference of squares is the same move.)`,
          visual: holed(`(sqrt(x) - ${k})/(x - ${k * k})`, k * k, [0, 2.2 * k * k], [0, 0.9 / k], { xlabel: 'x' }),
        };
      },
    }),
    num({
      id: 'combine', difficulty: 3,
      gen(r) {
        const a = r.pick([2, 3, 4, 5, -2, -3]);
        return {
          prompt: t`Evaluate $\displaystyle\lim_{x\to ${a}}\frac{\frac1x - \frac1{${a}}}{x ${a < 0 ? '+' : '-'} ${Math.abs(a)}}$.`,
          answer: -1 / (a * a), tol: { rel: 0.002 },
          errors: [{ value: 0, feedback: t`$0/0$ is undecided. Combine the two fractions on top first.` }, { value: -1 / a, feedback: t`After combining, the top is $\frac{${a} - x}{${a}x}$ — the denominator is $${a}x$, which becomes $${a * a}$ at the limit.` }],
          hints: [t`Over a common denominator, $\frac1x - \frac1{${a}} = \frac{${a} - x}{${a}x}$.`, t`$${a} - x = -(x ${a < 0 ? '+' : '-'} ${Math.abs(a)})$, so it cancels with the bottom, leaving $-\frac{1}{${a}x}$.`],
          teach: 'Combine compound fractions into one fraction; the troublesome factor then appears and cancels.',
          explain: t`$\dfrac{1}{x - ${a}}\cdot\dfrac{${a} - x}{${a}x} = -\dfrac{1}{${a}x} \to -\dfrac{1}{${a * a}}$. It is the slope of $y = 1/x$ at $x = ${a}$.`,
          visual: holed(`-1/(${a}*x)`, a, a > 0 ? [0.3 * a, 2 * a] : [2 * a, 0.3 * a], [-1.4 / (a * a) - 0.05, 0.1], { xlabel: 'x' }),
        };
      },
    }),
    mcq({
      id: 'squeeze', difficulty: 3,
      prompt: t`Which argument correctly proves $\displaystyle\lim_{x\to 0} x^2\sin(1/x) = 0$?`,
      visual: { type: 'graph', params: { x: [-0.5, 0.5], y: [-0.27, 0.27], aspect: 'wide', curves: [{ fn: 'x^2*sin(1/x)', color: 'accent' }, { fn: 'x^2', color: 'gold', dash: true, width: 1.4 }, { fn: '-x^2', color: 'gold', dash: true, width: 1.4 }] }, caption: t`$y = x^2\sin(1/x)$ trapped between $y = x^2$ and $y = -x^2$ (dashed). Near $0$ the oscillation is faster than the screen can draw.` },
      choices: [
        t`$-x^2 \le x^2\sin(1/x) \le x^2$, and both bounds tend to $0$`,
        t`By the product law, $\lim x^2 \cdot \lim \sin(1/x) = 0 \cdot \lim\sin(1/x) = 0$`,
        t`$-1 \le \sin(1/x) \le 1$, so the limit lies between $-1$ and $1$`,
        t`Substitute: $0^2 \cdot \sin(\infty) = 0$`,
      ],
      answer: 0,
      why: {
        1: t`The product law needs *both* limits to exist, and $\lim_{x\to0}\sin(1/x)$ does not. The answer is right; the argument is not.`,
        2: t`That bounds $\sin(1/x)$, not the whole expression, and “between $-1$ and $1$” does not pin down one number.`,
        3: t`$1/0$ is not $\infty$ and $\sin(\infty)$ means nothing; you cannot substitute $x = 0$ here.`,
      },
      hints: ['Which of the limit laws need every limit involved to exist?', t`Multiply $-1 \le \sin(1/x) \le 1$ by $x^2 \ge 0$.`],
      teach: 'The squeeze theorem: if g ≤ f ≤ h near a and g and h share the limit L there, then f has limit L too.',
      explain: t`Since $x^2 \ge 0$, multiplying $-1 \le \sin(1/x) \le 1$ by it gives $-x^2 \le x^2\sin(1/x) \le x^2$. Both bounds tend to $0$, so the squeeze theorem forces the middle to $0$.`,
    }),
    num({
      id: 'quadquad', difficulty: 2,
      gen(r) {
        const a = r.int(1, 4), s = r.intExcept(-4, 5, [a, -a]);
        const top = polyTeX([a * s, -(a + s), 1]);
        const ans = (a - s) / (2 * a);
        return {
          prompt: t`Evaluate $\displaystyle\lim_{x\to ${a}}\frac{${top}}{x^2 - ${a * a}}$.`,
          answer: ans, tol: { rel: 0.002, abs: 1e-9 },
          errors: [{ value: 0, feedback: t`$0/0$ is undecided: both top and bottom vanish at $x = ${a}$. Factor both.` }, { value: a - s, feedback: t`You cancelled $x - ${a}$ from the top but forgot what is left of the bottom: $x + ${a}$, which is $${2 * a}$ at the limit.` }],
          hints: [t`Factor: the top is $(x - ${a})(x ${s < 0 ? '+' : '-'} ${Math.abs(s)})$ and the bottom is $(x - ${a})(x + ${a})$.`],
          teach: 'Factor top and bottom completely, cancel the common factor, then substitute.',
          explain: t`$\dfrac{(x - ${a})(x ${s < 0 ? '+' : '-'} ${Math.abs(s)})}{(x - ${a})(x + ${a})} = \dfrac{x ${s < 0 ? '+' : '-'} ${Math.abs(s)}}{x + ${a}} \to \dfrac{${a - s}}{${2 * a}} = ${frac(ans)}$.`,
          visual: holed(`(x - (${s}))/(x + ${a})`, a, [Math.max(-a + 0.5, a - 4), a + 4], [ans - 1.5, ans + 1.5]),
        };
      },
    }),
    num({
      id: 'sin-ratio', difficulty: 3,
      gen(r) {
        const a = r.int(2, 7), b = r.intExcept(2, 7, [a]);
        return {
          prompt: t`Using $\displaystyle\lim_{\theta\to 0}\frac{\sin\theta}{\theta} = 1$, evaluate $\displaystyle\lim_{x\to 0}\frac{\sin(${a}x)}{\sin(${b}x)}$.`,
          answer: a / b, tol: { rel: 0.002 },
          errors: [{ value: b / a, feedback: t`Upside down: near $0$, $\sin(${a}x) \approx ${a}x$ and $\sin(${b}x) \approx ${b}x$.` }, { value: 1, feedback: t`You cannot cancel “sin”: $\sin(${a}x)/\sin(${b}x)$ is not $${a}x/${b}x$ in general — only near $0$, and even then the ratio is $${a}/${b}$.` }],
          hints: [t`Write $\dfrac{\sin(${a}x)}{\sin(${b}x)} = \dfrac{\sin(${a}x)}{${a}x}\cdot\dfrac{${b}x}{\sin(${b}x)}\cdot\dfrac{${a}}{${b}}$.`, t`The first two factors each tend to $1$.`],
          teach: t`Near $0$, $\sin(k x) \approx kx$: arrange each sine over its own argument so the known limit applies.`,
          explain: t`The two bracketed ratios tend to $1$ and the product law applies, so the limit is $${a}/${b} = ${frac(a / b)}$.`,
          visual: holed(`sin(${a}*x)/sin(${b}*x)`, 0, [-0.35, 0.35], [-0.5, 2 * Math.max(1, a / b) + 0.5]),
        };
      },
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-cubic', difficulty: 2,
      gen(r) {
        const a = r.pick([1, 2, 3, 4, -2]);
        return {
          prompt: t`Evaluate $\displaystyle\lim_{x\to ${a}}\frac{x^3 ${a ** 3 < 0 ? '+' : '-'} ${Math.abs(a ** 3)}}{x^2 - ${a * a}}$.`,
          answer: 1.5 * a, tol: { rel: 0.002 },
          errors: [{ value: 0, feedback: t`$0/0$ is undecided. Factor $x^3 - a^3 = (x - a)(x^2 + ax + a^2)$.` }],
          hints: [t`$x^3 - a^3 = (x - a)(x^2 + ax + a^2)$ and $x^2 - a^2 = (x - a)(x + a)$, with $a = ${a}$.`],
          teach: 'Factor a difference of cubes and a difference of squares, cancel, substitute.',
          explain: t`$\dfrac{x^2 + ${a}x + ${a * a}}{x + ${a}}$ at $x = ${a}$ is $\dfrac{${3 * a * a}}{${2 * a}} = ${nice(1.5 * a)}$.`,
          visual: holed(`(x^2 + ${a}*x + ${a * a})/(x + ${a})`, a, a > 0 ? [0.2 * a, 2 * a] : [2 * a, 0.2 * a], [Math.min(0, 1.5 * a) - 3, Math.max(0, 1.5 * a) + 3]),
        };
      },
    }),
    num({
      id: 'cp-free-air', difficulty: 3, transfer: true,
      prompt: t`Gravity above a spherical Earth is $g(r) = GM/r^2$. At the surface, $r = R = 6.371\times10^{6}$ m and $g(R) = 9.81\ \text{m/s}^2$. Find the **vertical gravity gradient**

$$\lim_{h\to 0}\frac{g(R + h) - g(R)}{h}.$$

Combine the fractions, simplify, and use $GM = g(R)\,R^2$.`,
      visual: { type: 'graph', params: { x: [0, 1000], y: [7.2, 10.1], aspect: 'wide', xlabel: 'altitude h (km)', ylabel: 'g (m/s²)', curves: [{ fn: '9.81*(6371/(6371 + x))^2', color: 'accent' }], points: [{ x: 0, y: 9.81, color: 'gold', label: 'surface' }, { x: 420, y: 9.81 * (6371 / 6791) ** 2, color: 'gold', label: 'ISS altitude' }] }, caption: t`$g$ falls with altitude as $1/r^2$; at the International Space Station it is still about $8.6\ \text{m/s}^2$. Earth’s rotation and flattening are ignored.` },
      answer: -2 * 9.81 / 6.371e6, units: 's^-2', tol: { rel: 0.01 },
      errors: [{ value: 0, feedback: t`Substitution gives $0/0$, which is not $0$. Combine the fractions first.` }, { value: -9.81 / 6.371e6, feedback: t`Check the expansion: $R^2 - (R+h)^2 = -2Rh - h^2$, so a factor $2$ survives.` }],
      hints: [t`$\dfrac{GM}{(R+h)^2} - \dfrac{GM}{R^2} = GM\,\dfrac{R^2 - (R+h)^2}{R^2(R+h)^2} = GM\,\dfrac{-2Rh - h^2}{R^2(R+h)^2}$.`, t`Divide by $h$ and let $h \to 0$: $GM\cdot\dfrac{-2R}{R^4} = -\dfrac{2GM}{R^3} = -\dfrac{2g(R)}{R}$.`],
      teach: 'A difference quotient of an inverse-square law becomes a clean limit once the fractions are combined.',
      explain: t`$\lim = -\dfrac{2GM}{R^3} = -\dfrac{2g(R)}{R} = -\dfrac{2(9.81)}{6.371\times10^{6}} = -3.08\times10^{-6}\ \text{s}^{-2}$: gravity weakens by about $3.1\ \mu\text{m/s}^2$ per metre of height. Gravimeters measure exactly this “free-air gradient”, and the standard value is $3.086\times10^{-6}\ \text{s}^{-2}$.`,
    }),
    mcq({
      id: 'cp-technique', difficulty: 2,
      prompt: t`Which first step works for $\displaystyle\lim_{x\to 0}\frac{\sqrt{9 + x} - 3}{x}$?`,
      visual: holed('(sqrt(9 + x) - 3)/x', 0, [-8, 12], [0, 0.32]),
      choices: [t`Multiply top and bottom by $\sqrt{9 + x} + 3$`, t`Substitute $x = 0$: the limit is $0$`, t`Cancel the $x$: $\sqrt{9} - 3 = 0$`, t`Use the quotient law: $\lim(\sqrt{9+x} - 3)/\lim x$`],
      answer: 0,
      why: {
        1: t`Substitution gives $0/0$, which is undecided — not $0$.`,
        2: t`$x$ is not a factor of $\sqrt{9 + x} - 3$; “cancelling” it inside the root is not algebra.`,
        3: t`The quotient law needs the denominator’s limit to be nonzero; here it is $0$.`,
      },
      hints: ['There is a difference involving a square root in the numerator.'],
      teach: 'A difference with a square root and a 0/0 form is the signal to multiply by the conjugate.',
      explain: t`The conjugate turns the top into $(9 + x) - 9 = x$, which cancels: $\frac{1}{\sqrt{9+x} + 3} \to \frac16$.`,
    }),
  ],
  sources: [
    { label: 'OpenStax Calculus Vol. 1, §2.3 The limit laws', url: 'https://openstax.org/books/calculus-volume-1/pages/2-3-the-limit-laws' },
  ],
});
