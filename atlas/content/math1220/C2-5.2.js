// The interval of convergence — the ratio test gives the radius; the two
// endpoints have to be tested one at a time, and any pattern is possible.
import { lesson, mcq, num } from '../../src/core/content.js';
import { nice, frac } from '../../src/core/format.js';

const t = String.raw;

const shift = (h) => (h === 0 ? 'x' : h > 0 ? t`x - ${h}` : t`x + ${-h}`);
const pw = (h) => (h === 0 ? 'x^n' : t`(${shift(h)})^n`);

// The endpoint behaviour of six standard families, each with radius b about a.
// conv: [left endpoint converges?, right endpoint converges?]
const KINDS = {
  geom: { n0: 0, tex: (a, b) => t`\frac{${pw(a)}}{${b}^n}`, conv: [false, false],
    left: t`\sum (-1)^n`, leftWhy: 'its terms do not tend to 0 (divergence test)',
    right: t`\sum 1`, rightWhy: 'its terms do not tend to 0 (divergence test)' },
  harm: { n0: 1, tex: (a, b) => t`\frac{${pw(a)}}{n\,${b}^n}`, conv: [true, false],
    left: t`\sum \frac{(-1)^n}{n}`, leftWhy: 'it is the alternating harmonic series, which converges by the alternating series test',
    right: t`\sum \frac1n`, rightWhy: 'it is the harmonic series, which diverges' },
  sqrt: { n0: 1, tex: (a, b) => t`\frac{${pw(a)}}{\sqrt{n}\,${b}^n}`, conv: [true, false],
    left: t`\sum \frac{(-1)^n}{\sqrt n}`, leftWhy: 'its terms decrease to 0, so it converges by the alternating series test',
    right: t`\sum \frac{1}{\sqrt n}`, rightWhy: 'it is a p-series with p = 1/2 ≤ 1, which diverges' },
  p2: { n0: 1, tex: (a, b) => t`\frac{${pw(a)}}{n^2\,${b}^n}`, conv: [true, true],
    left: t`\sum \frac{(-1)^n}{n^2}`, leftWhy: 'it converges absolutely, because the p-series with p = 2 does',
    right: t`\sum \frac{1}{n^2}`, rightWhy: 'it is a p-series with p = 2 > 1, which converges' },
  alt: { n0: 1, tex: (a, b) => t`\frac{(-1)^n\,${pw(a)}}{n\,${b}^n}`, conv: [false, true],
    left: t`\sum \frac{1}{n}`, leftWhy: 'the two signs cancel and leave the harmonic series, which diverges',
    right: t`\sum \frac{(-1)^n}{n}`, rightWhy: 'it is the alternating harmonic series, which converges' },
  ncoef: { n0: 1, tex: (a, b) => t`\frac{n\,${pw(a)}}{${b}^n}`, conv: [false, false],
    left: t`\sum (-1)^n n`, leftWhy: 'its terms grow instead of tending to 0',
    right: t`\sum n`, rightWhy: 'its terms grow instead of tending to 0' },
};

const intervalTeX = (lo, hi, [l, r]) => `${l ? '[' : '('}${lo}, ${hi}${r ? ']' : ')'}`;
const PATTERNS = [[false, false], [true, false], [false, true], [true, true]];

// one generated "find the interval" question
function intervalItem(id, kinds, { showLine = true } = {}) {
  return mcq({
    id, difficulty: 2,
    gen(r) {
      const kind = r.pick(kinds), K = KINDS[kind];
      const a = r.int(-3, 3), b = r.int(2, 5), lo = a - b, hi = a + b;
      const answer = PATTERNS.findIndex((p) => p[0] === K.conv[0] && p[1] === K.conv[1]);
      const choices = PATTERNS.map((p) => t`$${intervalTeX(lo, hi, p)}$`);
      const why = {};
      PATTERNS.forEach((p, k) => {
        if (k === answer) return;
        const notes = [];
        if (p[0] !== K.conv[0]) notes.push(t`at $x = ${lo}$ the series becomes $${K.left}$, and ${K.leftWhy}`);
        if (p[1] !== K.conv[1]) notes.push(t`at $x = ${hi}$ it becomes $${K.right}$, and ${K.rightWhy}`);
        why[k] = `Check the endpoints: ${notes.join('; ')}.`;
      });
      return {
        prompt: t`Find the interval of convergence of $\displaystyle\sum_{n=${K.n0}}^{\infty} ${K.tex(a, b)}$.`,
        choices, answer, why,
        visual: showLine ? numberLine(lo, hi, a) : undefined,
        hints: [t`The ratio test gives $|${shift(a)}| < ${b}$: the open interval $(${lo}, ${hi})$. Now test each endpoint.`, t`Substitute $x = ${hi}$ and $x = ${lo}$ into the series and simplify: the powers of $${b}$ cancel.`],
        teach: 'The ratio test is silent at the endpoints; substitute each one and use a test from the series toolbox.',
        explain: t`Radius $${b}$ about $${a}$. At $x = ${lo}$ the series is $${K.left}$: ${K.leftWhy}. At $x = ${hi}$ it is $${K.right}$: ${K.rightWhy}. So the interval is $${intervalTeX(lo, hi, K.conv)}$.`,
      };
    },
  });
}

const ind = (k) => `1 - min(1, abs(s - ${k}))`;   // 1 when the choice s equals k, else 0

// the number line after the ratio test: the open interval is settled, the endpoints are not
const numberLine = (lo, hi, a) => ({
  type: 'graph',
  params: {
    aspect: 'wide', x: [lo - 1.5, hi + 1.5], y: [-0.6, 0.6], yticks: 1,
    shade: [{ fn: '0.15', lower: '-0.15', from: lo, to: hi, color: 'accent', alpha: 0.35 }],
    points: [{ x: a, y: 0, color: 'ink2', label: 'centre' }, { x: lo, y: 0, color: 'warn', label: '?' }, { x: hi, y: 0, color: 'warn', label: '?' }],
  },
  caption: 'Blue: the open interval where the ratio test guarantees convergence. The two endpoints (amber) are still undecided.',
});

// partial sums of Σ (−1)^n / n — the series at the endpoint x = −1 of Σ x^n/n
const ZIGZAG = [];
for (let N = 1, S = 0; N <= 16; N++) { S += (-1) ** N / N; ZIGZAG.push({ x: N, y: S, color: 'gold' }); }

export default lesson({
  id: 'math1220.C2-5.2',
  title: 'The interval of convergence',
  minutes: 10, difficulty: 2,
  intro: t`The ratio test hands you the radius $R$ of a power series centred at $a$, and with it three regions:

- $|x - a| < R$: the series **converges absolutely**;
- $|x - a| > R$: it **diverges**;
- $|x - a| = R$: the ratio test is silent — **test each endpoint**.

At the two endpoints $x = a - R$ and $x = a + R$ the ratio test's limit is exactly 1, so it says nothing. You substitute each endpoint, get an ordinary series of numbers, and settle it with the tests you already know — the p-series test, the alternating series test, the divergence test. Every combination happens: neither endpoint, either one, or both. The **interval of convergence** is the open interval plus whichever endpoints survive.`,
  symbols: [
    { tex: 'a', text: 'the centre of the series' },
    { tex: 'R', text: 'the radius of convergence, from the ratio test' },
    { tex: 'a \\pm R', text: 'the two **endpoints**, where the ratio test is inconclusive' },
    { tex: t`[a - R,\ a + R)`, text: 'an interval: a square bracket includes its endpoint, a round bracket leaves it out' },
  ],
  why: t`A series is only as useful as the set of $x$ where it converges. Endpoints are where convergence is most delicate — often only conditional — and where some famous sums live, such as $1 - \tfrac12 + \tfrac13 - \cdots = \ln 2$.`,
  visual: {
    type: 'graph',
    title: 'Three series with radius 1 and different endpoints',
    lead: t`All three series below have centre $0$ and radius $1$, so inside $(-1, 1)$ they all converge. Watch the gold partial sums **at the dashed lines** $x = \pm 1$ as you add terms: that is where they differ. Where the limit is known, it is drawn in grey and marked with a dot.`,
    tasks: [
      'Choose Σ xⁿ/n and raise N: at x = −1 the gold curve settles on −ln 2, at x = 1 it keeps creeping upward — the harmonic series.',
      'Choose Σ xⁿ/n²: both ends settle, so the interval is closed, [−1, 1].',
      'Choose Σ xⁿ: at x = −1 the partial sums flip between 0 and 1 for ever, and at x = 1 they grow without bound.',
    ],
    params: {
      x: [-1.6, 1.6], y: [-2, 5],
      choices: [{ key: 's', label: 'Series', options: [[1, 'Σ xⁿ'], [2, 'Σ xⁿ/n'], [3, 'Σ xⁿ/n²']], value: 2, explain: 'Same radius, different endpoint behaviour.' }],
      sliders: [{ key: 'N', label: 'Number of terms $N$', min: 1, max: 60, step: 1, value: 6, explain: 'The partial sum adds the first $N$ terms.' }],
      curves: [
        { fn: '1/(1 - x)', domain: [-1, 0.995], color: 'ink3', width: 1.6, when: ind(1) },
        { sum: 'x^k', k: [0, 'N - 1'], color: 'gold', when: ind(1) },
        { fn: '-ln(1 - x)', domain: [-1, 0.995], color: 'ink3', width: 1.6, when: ind(2) },
        { sum: 'x^k/k', k: [1, 'N'], color: 'gold', when: ind(2) },
        { sum: 'x^k/k^2 * sqrt(1 - x^2)/sqrt(1 - x^2)', k: [1, 400], color: 'ink3', width: 1.6, when: ind(3) },
        { sum: 'x^k/k^2', k: [1, 'N'], color: 'gold', when: ind(3) },
      ],
      vlines: [{ x: -1, label: 'x = −1' }, { x: 1, label: 'x = 1' }],
      points: [
        { x: -1, y: '-ln(2)', color: 'good', label: '−ln 2', when: ind(2) },
        { x: -1, y: '-pi^2/12', color: 'good', label: '−π²/12', when: ind(3) },
        { x: 1, y: 'pi^2/6', color: 'good', label: 'π²/6', when: ind(3) },
      ],
    },
    caption: t`Partial sums are exact. For $\sum x^n/n^2$ the grey curve is the 400-term partial sum, drawn only inside $(-1, 1)$, where it matches the limit to within 0.003. Gold curves leaving the plot are clipped.`,
  },
  example: {
    prompt: t`Find the interval of convergence of $$\sum_{n=1}^{\infty} \frac{(x-2)^n}{n\,3^n}.$$`,
    steps: [
      { label: 'Radius first', text: t`Ratio test: $\left|\dfrac{a_{n+1}}{a_n}\right| = \dfrac{n}{n+1}\cdot\dfrac{|x-2|}{3} \to \dfrac{|x-2|}{3}$. It converges for $|x - 2| < 3$: centre $2$, radius $3$, so certainly on $(-1, 5)$.` },
      { label: 'Right endpoint, x = 5', text: t`Then $(x-2)^n = 3^n$, and the series becomes $\displaystyle\sum_{n=1}^\infty \frac{3^n}{n\,3^n} = \sum_{n=1}^\infty \frac1n$ — the harmonic series, which **diverges**. Leave $5$ out.` },
      { label: 'Left endpoint, x = −1', text: t`Then $(x-2)^n = (-3)^n$, and the series becomes $\displaystyle\sum_{n=1}^\infty \frac{(-1)^n}{n}$. Its terms decrease in size to 0, so it **converges** by the alternating series test. Keep $-1$.` },
      { label: 'Assemble', text: t`The interval of convergence is $[-1, 5)$.` },
      { label: 'Sense check', text: t`At $x = -1$ the convergence is only **conditional**: the absolute values give the harmonic series. That is typical — inside the interval convergence is absolute, and only an endpoint can converge conditionally.` },
    ],
    answer: t`The series converges for $-1 \le x < 5$: interval $[-1, 5)$.`,
  },
  practice: [
    mcq({
      id: 'endpoint-silent', difficulty: 1,
      prompt: t`The ratio test gives radius $R = 4$ for a power series centred at $0$. What does it tell you about the series at $x = 4$?`,
      choices: ['Nothing — the endpoint must be tested separately', 'It converges, because the endpoint belongs to the interval', 'It diverges, because only |x| < R converges', 'It converges absolutely'],
      answer: 0,
      why: {
        1: 'Some series converge at an endpoint and some do not; the ratio test cannot tell which.',
        2: t`$|x| > R$ guarantees divergence; $|x| = R$ guarantees nothing.`,
        3: 'Absolute convergence is guaranteed only strictly inside the radius.',
      },
      hints: [t`What is the ratio-test limit $L = |x|/R$ at $x = 4$?`, t`$L = 1$, and the ratio test is inconclusive when $L = 1$.`],
      teach: 'At an endpoint the ratio-test limit equals 1, which is inconclusive.',
      explain: t`At $x = 4$ the limit is $|x|/R = 1$, the one case the ratio test cannot decide. You must substitute $x = 4$ and test the resulting series directly.`,
    }),
    intervalItem('find-interval', ['geom', 'harm', 'p2', 'alt']),
    mcq({
      id: 'which-test', difficulty: 2,
      prompt: t`The series $\displaystyle\sum_{n=1}^{\infty} \frac{x^n}{n}$ has radius 1. Which test settles its behaviour at the endpoint $x = -1$?`,
      choices: ['The alternating series test', 'The ratio test', 'The divergence (nth-term) test', 'The p-series test with p = 1'],
      answer: 0,
      why: {
        1: t`At an endpoint the ratio-test limit is exactly 1 — inconclusive.`,
        2: t`The terms $(-1)^n/n$ do tend to 0, so the divergence test says nothing.`,
        3: t`That settles $x = +1$, where the series is $\sum 1/n$. At $x = -1$ the signs alternate.`,
      },
      hints: [t`Substitute $x = -1$: what does the series look like?`, t`It becomes $\sum (-1)^n/n$, with alternating signs.`],
      teach: 'Substituting an endpoint often produces an alternating series; the alternating series test handles it.',
      visual: {
        type: 'graph',
        params: { aspect: 'wide', x: [0, 17], y: [-1.1, 0.1], xlabel: 'N', ylabel: 'S', points: ZIGZAG, hlines: [{ y: -Math.LN2, label: '−ln 2', color: 'good' }] },
        caption: t`The partial sums $S_N$ of the series at $x = -1$, for $N = 1$ to $16$.`,
      },
      explain: t`At $x = -1$ the series is $\sum (-1)^n/n$: alternating, with terms $1/n$ decreasing to 0. The alternating series test says it converges, so $x = -1$ is in the interval $[-1, 1)$.`,
    }),
    num({
      id: 'count-integers', difficulty: 3,
      gen(r) {
        const kind = r.pick(['harm', 'alt', 'p2', 'geom']), K = KINDS[kind];
        const a = r.int(-4, 4), b = r.int(2, 4);
        const n = 2 * b - 1 + (K.conv[0] ? 1 : 0) + (K.conv[1] ? 1 : 0);
        const errors = [2 * b - 1, 2 * b, 2 * b + 1].filter((v) => v !== n).map((v) => ({
          value: v,
          feedback: v > n ? 'You counted an endpoint where the series diverges — substitute each endpoint and test it.' : 'You left out an endpoint where the series converges — substitute each endpoint and test it.',
        }));
        return {
          prompt: t`How many **integers** $x$ lie in the interval of convergence of $\displaystyle\sum_{n=${K.n0}}^{\infty} ${K.tex(a, b)}$?`,
          answer: n, tol: { rel: 1e-6, abs: 0.01 },
          errors,
          hints: [t`Find the radius and centre: the open interval is $(${a - b}, ${a + b})$.`, t`Test the endpoints $x = ${a - b}$ and $x = ${a + b}$ separately.`, t`The open interval holds $${2 * b - 1}$ integers; add one for each endpoint where the series converges.`],
          teach: 'Endpoints change the count: include exactly those where the substituted series converges.',
          visual: numberLine(a - b, a + b, a),
          explain: t`The open interval $(${a - b}, ${a + b})$ contains $${2 * b - 1}$ integers. At $x = ${a - b}$ the series is $${K.left}$, which ${K.conv[0] ? 'converges' : 'diverges'}; at $x = ${a + b}$ it is $${K.right}$, which ${K.conv[1] ? 'converges' : 'diverges'}. The interval is $${intervalTeX(a - b, a + b, K.conv)}$, holding $${n}$ integers.`,
        };
      },
    }),
    mcq({
      id: 'forgot-endpoints', difficulty: 3, kind: 'error',
      prompt: t`A student writes: “For $\displaystyle\sum_{n=1}^{\infty} \frac{x^n}{n^2}$ the ratio test gives $|x| < 1$, so the interval of convergence is $(-1, 1)$.” What is wrong?`,
      choices: [
        t`The endpoints were not tested; at $x = \pm1$ the series converges (absolutely, like $\sum 1/n^2$), so the interval is $[-1, 1]$`,
        t`The radius is wrong: the $n^2$ makes it $R = 2$`,
        t`Only $x = 1$ should be added, giving $(-1, 1]$`,
        t`Nothing is wrong: an interval of convergence is always open`,
      ],
      answer: 0,
      why: {
        1: t`Powers of $n$ do not change the radius: the ratio still tends to $|x|$.`,
        2: t`At $x = -1$ the series is $\sum (-1)^n/n^2$, which converges absolutely, so $-1$ belongs too.`,
        3: t`Endpoints are often included — for example $[-1, 5)$ in the worked example.`,
      },
      hints: ['Did the student test x = 1 and x = −1?', t`At $x = \pm 1$, $\left|\frac{x^n}{n^2}\right| = \frac{1}{n^2}$. What does the p-series test say?`],
      teach: 'Every interval of convergence needs both endpoints tested before it is written down.',
      visual: {
        type: 'graph',
        params: { x: [-1.4, 1.4], y: [-1.5, 2.5], curves: [{ sum: 'x^k/k^2', k: [1, 60], color: 'gold' }], vlines: [{ x: -1, label: 'x = −1' }, { x: 1, label: 'x = 1' }] },
        caption: t`The partial sum of $\sum x^n/n^2$ with 60 terms. At $x = \pm 1$ it is already close to its limits, $\pi^2/6$ and $-\pi^2/12$.`,
      },
      explain: t`At $x = 1$ the series is $\sum 1/n^2$ (a convergent p-series) and at $x = -1$ it is $\sum (-1)^n/n^2$, which converges absolutely. The interval is $[-1, 1]$.`,
    }),
    num({
      id: 'scaled-radius', difficulty: 2,
      gen(r) {
        const k = r.int(2, 5), m = r.intExcept(-3, 3, [0]);
        const inner = m > 0 ? t`${k}x - ${m}` : t`${k}x + ${-m}`;
        const xc = m > 0 ? t`x - ${frac(m / k)}` : t`x + ${frac(-m / k)}`;   // x − m/k, reduced
        return {
          prompt: t`Find the radius of convergence of $\displaystyle\sum_{n=1}^{\infty} \frac{(${inner})^n}{n}$. (A fraction such as 1/3 is fine.)`,
          answer: 1 / k, tol: { rel: 0.005 },
          errors: [{ value: 1, feedback: t`The ratio test gives $|${inner}| < 1$, but that is not yet $|x - a| < R$: factor out the $${k}$.` }, { value: k, feedback: t`Dividing $|${inner}| < 1$ by $${k}$ gives $|x - \cdots| < \tfrac{1}{${k}}$, not $${k}$.` }],
          hints: [t`The ratio test gives $|${inner}| < 1$.`, t`Write $${inner} = ${k}\left(${xc}\right)$, then divide by $${k}$.`],
          teach: t`Put the condition in the form $|x - a| < R$ before reading off the radius: $|kx - m| < 1$ means $|x - m/k| < 1/k$.`,
          explain: t`$|${inner}| < 1 \iff \left|${xc}\right| < \tfrac1{${k}}$: centre $${frac(m / k)}$, radius $\tfrac{1}{${k}} \approx ${nice(1 / k)}$.`,
        };
      },
    }),
  ],
  checkpoint: [
    intervalItem('cp-interval', ['harm', 'sqrt', 'p2', 'alt', 'ncoef'], { showLine: false }),
    num({
      id: 'cp-conditional', difficulty: 3,
      gen(r) {
        const kind = r.pick(['harm', 'alt', 'sqrt']), K = KINDS[kind];
        const b = r.int(2, 5), a = r.intExcept(-3, 3, [b, -b]);   // keeps both endpoints away from 0
        const x = K.conv[0] ? a - b : a + b, other = K.conv[0] ? a + b : a - b;
        return {
          prompt: t`The series $\displaystyle\sum_{n=1}^{\infty} ${K.tex(a, b)}$ converges **conditionally** at exactly one value of $x$. Which one?`,
          answer: x, tol: { rel: 1e-6, abs: 0.01 },
          errors: [{ value: other, feedback: t`At $x = ${other}$ the series diverges. Substitute it and look at the terms.` }, { value: a, feedback: 'At the centre the series converges absolutely (every term after the first is 0). Conditional convergence happens only at an endpoint.' }],
          hints: ['Conditional convergence can only happen at an endpoint: inside the radius it is absolute.', t`Test $x = ${a - b}$ and $x = ${a + b}$; one gives an alternating series whose absolute values diverge.`],
          teach: 'Inside the radius convergence is absolute, so conditional convergence lives only at an endpoint.',
          explain: t`The endpoints are $${a - b}$ and $${a + b}$. At $x = ${a - b}$ the series is $${K.left}$ and at $x = ${a + b}$ it is $${K.right}$. It converges only at $x = ${x}$, where the absolute values give a divergent series — so the convergence there is conditional.`,
        };
      },
    }),
    num({
      id: 'cp-madelung', difficulty: 3, transfer: true,
      prompt: t`In a one-dimensional ionic crystal, ions of alternating charge $\pm e$ sit a distance $d$ apart. The electrostatic energy of one ion is $U = -\alpha\,\dfrac{e^2}{4\pi\varepsilon_0 d}$, where the **Madelung constant** is
$$\alpha = 2\left(1 - \tfrac12 + \tfrac13 - \tfrac14 + \cdots\right).$$
The bracket is the series $\sum_{n=1}^{\infty} (-1)^{n+1}\frac{x^n}{n}$ for $\ln(1 + x)$, evaluated at $x = 1$. Is $x = 1$ in its interval of convergence? If so, find $\alpha$ to 3 significant figures.`,
      answer: 2 * Math.LN2, tol: { rel: 0.005 },
      errors: [{ value: Math.LN2, feedback: 'That is the bracket alone; the Madelung constant has a factor of 2 (neighbours on both sides).' }],
      hints: [t`The series for $\ln(1+x)$ has radius 1. At $x = 1$ it is the alternating harmonic series.`, t`The alternating harmonic series converges (alternating series test), and where a power series converges at an endpoint its sum is the function’s value there: $\ln(1 + 1)$.`],
      teach: 'An endpoint where the series converges belongs to the interval, and the series still equals the function there.',
      explain: t`The interval of convergence of the $\ln(1+x)$ series is $(-1, 1]$: $x = 1$ is included, because $1 - \tfrac12 + \tfrac13 - \cdots$ converges by the alternating series test, to $\ln 2$ (Abel’s theorem guarantees the endpoint value). So $\alpha = 2\ln 2 \approx 1.386$.`,
      solution: t`Each ion has neighbours at $\pm d$ (opposite charge), $\pm 2d$ (same charge), $\pm 3d$, … so its energy is $\frac{e^2}{4\pi\varepsilon_0 d}\cdot 2\left(-1 + \tfrac12 - \tfrac13 + \cdots\right) = -\frac{e^2}{4\pi\varepsilon_0 d}\cdot 2\ln 2$. The convergence is only conditional: the order of the terms matters, which is why real three-dimensional Madelung sums need care.`,
    }),
  ],
  sources: [
    { label: 'OpenStax Calculus Vol. 2, §6.1 Power Series and Functions', url: 'https://openstax.org/books/calculus-volume-2/pages/6-1-power-series-and-functions' },
    { label: 'OpenStax Calculus Vol. 2, §5.5 Alternating Series', url: 'https://openstax.org/books/calculus-volume-2/pages/5-5-alternating-series' },
  ],
});
