// Taylor polynomials and the Lagrange remainder — how wrong can a truncated
// Taylor series be? A guaranteed bound, computed before the approximation.
import { lesson, mcq, num } from '../../src/core/content.js';
import { nice, tex as texNum } from '../../src/core/format.js';
import { fact } from './_powerseries.js';

const t = String.raw;
const DEG = 180 / Math.PI;

// P_n(p) for sin with n = 2N + 1, written out for N = 0…5 so the readouts can
// evaluate it (a readout is a single expression; it cannot loop)
const on = (j) => (j === 0 ? '1' : `min(1, max(0, N - ${j - 1}))`);
const P_SIN = [0, 1, 2, 3, 4, 5].map((j) => `${j % 2 ? '-' : '+'} ${on(j)}*p^${2 * j + 1}/${fact(2 * j + 1)}`).join(' ');

// smallest n with b^(n+1)/(n+1)! < tol
const smallestN = (b, tol, M = 1) => { let n = 0; while (M * b ** (n + 1) / fact(n + 1) >= tol) n++; return n; };

export default lesson({
  id: 'math1220.C2-5.5',
  title: 'Taylor polynomials and the Lagrange remainder',
  minutes: 12, difficulty: 3,
  intro: t`Stop a Taylor series at degree $n$ and you have the **Taylor polynomial** $P_n(x)$. What you threw away is the **remainder** $R_n(x) = f(x) - P_n(x)$. Taylor’s theorem says it looks just like the next term of the series, except that the derivative is taken at some unknown point $c$ between $a$ and $x$: $R_n(x) = \frac{f^{(n+1)}(c)}{(n+1)!}(x-a)^{n+1}$. You never learn $c$, but if $|f^{(n+1)}| \le M$ everywhere between $a$ and $x$, you get a guarantee:

$$|R_n(x)| = |f(x) - P_n(x)| \le \frac{M}{(n+1)!}\,|x - a|^{n+1}$$`,
  symbols: [
    { tex: 'P_n(x)', text: t`the Taylor polynomial of degree $n$: the series up to the $(x-a)^n$ term` },
    { tex: 'R_n(x)', text: t`the **remainder**, or error: $f(x) - P_n(x)$` },
    { tex: 'M', text: t`any number with $|f^{(n+1)}(t)| \le M$ for **every** $t$ between $a$ and $x$ — the worst case, because $c$ is unknown` },
    { tex: '(n+1)!', text: t`the factorial from the next term of the series; it grows so fast that it usually wins` },
    { tex: '|x-a|^{n+1}', text: 'the distance from the centre to the power of the next term: far from the centre the bound grows' },
  ],
  why: t`This turns “approximately” into a guarantee you can compute before you approximate — how many terms a flight computer needs, how big an angle the small-angle formula can take. Letting $n \to \infty$, it also proves that $e^x$, $\sin x$ and $\cos x$ equal their Taylor series everywhere.`,
  visual: {
    type: 'graph',
    title: 'The Lagrange bound is a guaranteed envelope',
    lead: t`Gold: the Taylor polynomial of $\sin x$ about $0$, of degree $n = 2N + 1$. Violet dashed: $P_n(x) \pm \frac{|x|^{n+1}}{(n+1)!}$, the Lagrange bound with $M = 1$ (every derivative of $\sin$ is $\pm\sin$ or $\pm\cos$). The theorem promises the grey $\sin x$ never leaves the violet envelope. The readouts compare the actual error at the probe point $p$ with the bound.`,
    tasks: [
      'Slide p outward: the actual error and the bound both grow, and the bound always stays above.',
      'Raise N: the envelope pinches shut over a wider and wider range — the factorial beats the power.',
      'Set p = 1 and step N from 0 to 5: the bound is cautious — about 3 times the actual error at N = 0, about 13 times at N = 5 — but never below it.',
    ],
    params: {
      x: [-8, 8], y: [-2.5, 2.5],
      sliders: [
        { key: 'N', label: 'Index $N$ (degree $n = 2N+1$)', min: 0, max: 5, step: 1, value: 1, explain: 'Keeps $x - \\frac{x^3}{3!} + \\cdots \\pm \\frac{x^{2N+1}}{(2N+1)!}$.' },
        { key: 'p', label: 'Probe point $p$', min: -6, max: 6, step: 0.1, value: 1.5, explain: 'Where the readouts measure the error.' },
      ],
      curves: [
        { fn: 'sin(x)', color: 'ink3', width: 1.6 },
        { sum: '(-1)^k x^(2k+1)/(2k+1)!', k: [0, 'N'], color: 'gold' },
        { sum: '(-1)^k x^(2k+1)/(2k+1)! + abs(x)^(2N+2)/((2N+2)! (N+1))', k: [0, 'N'], color: 'violet', dash: true, width: 1.6 },
        { sum: '(-1)^k x^(2k+1)/(2k+1)! - abs(x)^(2N+2)/((2N+2)! (N+1))', k: [0, 'N'], color: 'violet', dash: true, width: 1.6 },
      ],
      vlines: [{ x: 'p', label: 'p', color: 'accent2' }],
      points: [{ x: 'p', y: 'sin(p)', color: 'ink2' }, { x: 'p', y: P_SIN, color: 'gold' }],
      readouts: [
        { label: 'degree $n$', expr: '2N + 1', digits: 2 },
        { label: 'actual error $|\\sin p - P_n(p)|$', expr: `abs(sin(p) - (${P_SIN}))`, digits: 3 },
        { label: 'Lagrange bound $\\frac{|p|^{n+1}}{(n+1)!}$', expr: 'abs(p)^(2N+2)/(2N+2)!', digits: 3 },
      ],
    },
    caption: t`Exact computation. The envelope is drawn by adding $\frac{|x|^{n+1}}{(n+1)!}$ to the polynomial. Because $\sin$ has no even powers, $P_{2N+1} = P_{2N+2}$, so a slightly tighter bound, $\frac{|x|^{n+2}}{(n+2)!}$, is also valid; this picture uses the plain one.`,
  },
  example: {
    prompt: t`What degree $n$ does the Lagrange bound need to **guarantee** $|\sin(0.5) - P_n(0.5)| < 10^{-6}$?`,
    steps: [
      { label: 'Bound the derivative', text: t`Every derivative of $\sin x$ is $\pm\sin x$ or $\pm\cos x$, so $|f^{(n+1)}(c)| \le 1$ whatever $c$ is. Take $M = 1$.` },
      { label: 'Write the bound', text: t`With $a = 0$ and $x = 0.5$: $|R_n(0.5)| \le \dfrac{0.5^{\,n+1}}{(n+1)!}$.` },
      { label: 'Try degrees', text: t`$n = 5$: $\frac{0.5^6}{6!} = 2.2\times10^{-5}$. $\;n = 6$: $\frac{0.5^7}{7!} = 1.6\times10^{-6}$. $\;n = 7$: $\frac{0.5^8}{8!} = 9.7\times10^{-8} < 10^{-6}$. ✓` },
      { label: 'Compute', text: t`$P_7(0.5) = 0.5 - \frac{0.5^3}{3!} + \frac{0.5^5}{5!} - \frac{0.5^7}{7!} = 0.479\,425\,533$.` },
      { label: 'Sense check', text: t`The true value is $\sin 0.5 = 0.479\,425\,539$: the actual error, $5.4\times10^{-9}$, is far inside the guarantee of $9.7\times10^{-8}$. The bound is a worst case over every possible $c$, so it is honest but cautious.` },
    ],
    answer: t`Degree $n = 7$ (four nonzero terms) is guaranteed to give $\sin 0.5$ to within $10^{-6}$.`,
  },
  practice: [
    mcq({
      id: 'which-derivative', difficulty: 1,
      prompt: t`To bound the error of the Taylor polynomial $P_n$ with Lagrange’s formula, which quantity must you bound by $M$?`,
      choices: [t`$|f^{(n+1)}(t)|$ for every $t$ between $a$ and $x$`, t`$|f^{(n)}(t)|$ for every $t$ between $a$ and $x$`, t`$|f^{(n+1)}(a)|$, at the centre only`, t`$|f(t)|$ for every $t$ between $a$ and $x$`],
      answer: 0,
      why: {
        1: t`The remainder after degree $n$ looks like the **next** term, so it involves the $(n+1)$th derivative.`,
        2: t`The derivative in the remainder is taken at an unknown $c$, which can be anywhere between $a$ and $x$ — not necessarily at $a$.`,
        3: 'The size of f itself says nothing about how fast its Taylor polynomials converge.',
      },
      hints: [t`$R_n(x) = \frac{f^{(n+1)}(c)}{(n+1)!}(x-a)^{n+1}$ for some $c$ between $a$ and $x$.`],
      teach: t`The remainder after degree $n$ involves $f^{(n+1)}$ at an unknown point, so $M$ must cover the whole interval.`,
      visual: { type: 'graph', params: { x: [-0.5, 2.3], y: [0, 8], curves: [{ fn: 'exp(x)', color: 'ink3', width: 1.8 }, { fn: '1 + x + x^2/2', color: 'gold' }], shade: [{ fn: 'exp(x)', lower: '1 + x + x^2/2', from: 0, to: 2, color: 'violet', alpha: 0.3 }], vlines: [{ x: 2, label: 'x = 2' }], points: [{ x: 0, y: 1, color: 'gold', label: 'a' }] }, caption: t`$e^x$ (grey) and its $P_2$ (gold) about $a = 0$. The violet gap is the remainder; Taylor’s theorem evaluates $f'''$ at some unknown $c$ between $0$ and $x$.` },
      explain: t`Taylor’s theorem gives $R_n(x) = \frac{f^{(n+1)}(c)}{(n+1)!}(x-a)^{n+1}$ for an unknown $c$ between $a$ and $x$. Bounding $|f^{(n+1)}|$ over that whole interval covers every possible $c$.`,
    }),
    num({
      id: 'bound-cos', difficulty: 2,
      gen(r) {
        const n = r.int(2, 4), b = r.pick([0.2, 0.3, 0.5]);
        const B = b ** (n + 1) / fact(n + 1);
        return {
          prompt: t`$\cos(${b})$ is approximated by its degree-${n} Maclaurin polynomial $P_${n}(${b})$. Evaluate the Lagrange bound $\frac{M}{(n+1)!}|x|^{n+1}$ on the error.`,
          answer: B, tol: { rel: 0.01 },
          errors: [{ value: b ** n / fact(n), feedback: t`That uses the $n$th derivative. The remainder after degree $${n}$ involves $f^{(${n + 1})}$, $(${n + 1})!$ and $x^{${n + 1}}$.` }],
          hints: [t`Every derivative of $\cos$ is bounded by $1$, so $M = 1$.`, t`$|R_${n}(${b})| \le \frac{${b}^{${n + 1}}}{(${n + 1})!}$.`],
          teach: t`For $\sin$ and $\cos$, $M = 1$ always, so the bound is just $\frac{|x - a|^{n+1}}{(n+1)!}$.`,
          explain: t`$M = 1$, so $|R_${n}(${b})| \le \frac{${b}^{${n + 1}}}{${fact(n + 1)}} = ${texNum(B, 3)}$.`,
          visual: {
            type: 'graph',
            params: { x: [-2, 2], y: [-0.6, 1.3], curves: [{ fn: 'cos(x)', color: 'ink3' }, { sum: `(-1)^k x^(2k)/(2k)!`, k: [0, Math.floor(n / 2)], color: 'gold' }], vlines: [{ x: b, label: `x = ${b}` }] },
            caption: t`$\cos x$ (grey) and $P_${n}$ (gold). At $x = ${b}$ the gap is far too small to see — which is why you bound it rather than read it off.`,
          },
        };
      },
    }),
    num({
      id: 'bound-e', difficulty: 2,
      gen(r) {
        const n = r.int(4, 7);
        const B = 3 / fact(n + 1);
        return {
          prompt: t`You estimate $e = e^1$ with the degree-${n} Maclaurin polynomial of $e^x$. Using $M = 3$ (because $e^t < 3$ for $0 \le t \le 1$), what is the Lagrange bound on the error?`,
          answer: B, tol: { rel: 0.01 },
          errors: [{ value: 1 / fact(n + 1), feedback: t`$M = 1$ would bound $e^t$ only at $t = 0$. The unknown $c$ can be anywhere in $[0, 1]$, where $e^c$ reaches $e \approx 2.72$.` }, { value: 3 / fact(n), feedback: t`Use $(n+1)! = ${fact(n + 1)}$, not $n!$.` }],
          hints: [t`Every derivative of $e^x$ is $e^x$, which on $[0, 1]$ is at most $e < 3$.`, t`$|R_${n}(1)| \le \frac{3\cdot 1^{${n + 1}}}{(${n + 1})!}$.`],
          teach: 'M must bound the derivative over the whole interval from the centre to x; a safe overestimate such as 3 for e is fine.',
          visual: { type: 'graph', params: { x: [-0.1, 1.1], y: [0, 3.5], curves: [{ fn: 'exp(x)', domain: [0, 1], color: 'accent' }], hlines: [{ y: 3, label: 'M = 3', color: 'warn' }] }, caption: t`$e^t$ on $[0, 1]$, where every derivative of $e^x$ must be bounded: it never reaches the dashed line $M = 3$.` },
          explain: t`$|R_${n}(1)| \le \frac{3}{${n + 1}!} = \frac{3}{${fact(n + 1)}} = ${texNum(B, 3)}$. (The true error is about a third of that.)`,
        };
      },
    }),
    num({
      id: 'smallest-degree', difficulty: 3,
      gen(r) {
        const fnName = r.pick(['sin', 'cos']), b = r.pick([0.1, 0.2, 0.5, 1]), k = r.pick([4, 6, 8]);
        const tol = 10 ** -k, n = smallestN(b, tol);
        const F = fnName === 'sin' ? t`\sin` : t`\cos`;
        return {
          prompt: t`For the Maclaurin polynomials $P_n$ of $${F} x$, the Lagrange bound with $M = 1$ reads $|${F}(${b}) - P_n(${b})| \le \frac{${b}^{\,n+1}}{(n+1)!}$. What is the smallest $n$ for which this bound is below $10^{-${k}}$?`,
          answer: n, tol: { rel: 1e-6, abs: 0.4 },
          errors: [{ value: n + 1, feedback: t`It looks as if you used $\frac{x^n}{n!}$. The remainder after degree $n$ has the next power: $\frac{x^{n+1}}{(n+1)!}$.` }],
          hints: [t`You need $\frac{${b}^{\,n+1}}{(n+1)!} < 10^{-${k}}$.`, t`Tabulate $\frac{${b}^{m}}{m!}$ for $m = 1, 2, 3, \ldots$ until it drops below $10^{-${k}}$; then $n = m - 1$.`],
          teach: t`To choose a degree, find the first $n$ whose bound $\frac{M|x-a|^{n+1}}{(n+1)!}$ drops below the tolerance.`,
          visual: (() => {
            const pts = Array.from({ length: 14 }, (_, i) => ({ x: i + 1, y: Math.log10(b ** (i + 1) / fact(i + 1)), color: 'violet', r: 4 }));
            return { type: 'graph', params: { x: [0, 15], y: [Math.min(-k - 1.5, ...pts.map((q) => q.y)), 0.6], xlabel: 'm = n + 1', ylabel: '', points: pts, hlines: [{ y: -k, label: `10⁻${String(k).replace(/\d/g, (c) => '⁰¹²³⁴⁵⁶⁷⁸⁹'[c])}`, color: 'warn' }] }, caption: t`$\log_{10}$ of the bound $\frac{${b}^m}{m!}$ against $m = n + 1$. Points under the dashed line meet the tolerance.` };
          })(),
          explain: t`$\frac{${b}^{${n}}}{${n}!} = ${texNum(b ** n / fact(n), 2)}$ is not below $10^{-${k}}$, but $\frac{${b}^{${n + 1}}}{${n + 1}!} = ${texNum(b ** (n + 1) / fact(n + 1), 2)}$ is. So $n = ${n}$.`,
        };
      },
    }),
    mcq({
      id: 'why-converges', difficulty: 2,
      prompt: t`Why does the Lagrange bound prove that the Maclaurin series of $\sin x$ converges **to $\sin x$** for every real $x$?`,
      choices: [
        t`For each fixed $x$, the bound $\frac{|x|^{n+1}}{(n+1)!} \to 0$ as $n \to \infty$, so $P_n(x) \to \sin x$`,
        t`Because the series has an infinite radius of convergence`,
        t`Because $\sin x$ is bounded between $-1$ and $1$`,
        t`Because the series alternates, so the alternating series test applies`,
      ],
      answer: 0,
      why: {
        1: t`An infinite radius proves the series converges, not that its sum is $\sin x$. The function $e^{-1/x^2}$ (with value 0 at 0) has every derivative 0 at 0, so its Maclaurin series is $0$ — convergent everywhere, and wrong everywhere except $x = 0$.`,
        2: 'A bounded function can still differ from its Taylor series; what matters is how the remainder behaves.',
        3: t`That would show the series converges to *something*; it does not say the limit is $\sin x$.`,
      },
      hints: ['What has to tend to zero for the polynomials to approach the function?', t`For a fixed $x$, compare $|x|^{n+1}$ with $(n+1)!$ as $n$ grows.`],
      teach: t`A Taylor series equals its function exactly when the remainder $R_n(x) \to 0$; the Lagrange bound is how you show it.`,
      visual: { type: 'graph', params: { x: [-0.5, 20.5], y: [0, 30], xlabel: 'n', ylabel: '', points: Array.from({ length: 21 }, (_, n) => ({ x: n, y: 5 ** (n + 1) / fact(n + 1), color: 'violet', r: 4 })) }, caption: t`The Lagrange bound $\frac{5^{n+1}}{(n+1)!}$ for $\sin 5$, for $n = 0$ to $20$: it grows at first, then the factorial wins and it collapses towards 0.` },
      explain: t`$|\sin x - P_n(x)| \le \frac{|x|^{n+1}}{(n+1)!}$, and for any fixed $x$ the factorial eventually crushes the power, so the error tends to 0. Convergence alone would not be enough.`,
    }),
    num({
      id: 'sqrt-linear-error', difficulty: 3,
      gen(r) {
        const b = r.pick([0.1, 0.2, 0.3]);
        const B = (b * b) / 8;
        return {
          prompt: t`You approximate $\sqrt{1 + ${b}}$ by the tangent line $1 + \frac{${b}}{2}$ (that is $P_1$ of $f(x) = \sqrt{1+x}$ about $0$). Use the Lagrange bound to bound the error.`,
          answer: B, tol: { rel: 0.01 },
          errors: [
            { value: (b * b) / 4, feedback: t`Divide by $2! = 2$: the bound is $\frac{M}{2!}x^2$.` },
            { value: (B * (1 + b) ** -1.5), feedback: t`You took $M$ at $t = ${b}$, where $|f''|$ is smallest. $M$ must be the largest value of $\frac14(1+t)^{-3/2}$ on $[0, ${b}]$, which is at $t = 0$.` },
          ],
          hints: [t`$f''(t) = -\frac14(1+t)^{-3/2}$.`, t`On $[0, ${b}]$, $|f''(t)|$ is largest at $t = 0$: $M = \frac14$.`, t`$|R_1| \le \frac{M}{2!}(${b})^2$.`],
          teach: 'Take M where the derivative is largest on the interval — taking it anywhere else can produce a "bound" that is too small.',
          visual: { type: 'graph', params: { x: [-0.2, 0.6], y: [0.85, 1.35], curves: [{ fn: 'sqrt(1 + x)', color: 'ink3', width: 1.8 }, { fn: '1 + x/2', color: 'gold', dash: true }], vlines: [{ x: b, label: t`x = ${b}` }] }, caption: t`$\sqrt{1+x}$ (grey) and its tangent line $1 + \frac x2$ (gold). The gap at $x = ${b}$ is the error you are bounding.` },
          explain: t`$M = \frac14$, so $|R_1| \le \frac{1/4}{2}(${b})^2 = ${texNum(B, 3)}$. The actual error is $1 + ${b / 2} - \sqrt{${1 + b}} = ${texNum(1 + b / 2 - Math.sqrt(1 + b), 3)}$, just inside the bound. (With $M$ taken at $t = ${b}$ instead, the “bound” would be $${texNum(B * (1 + b) ** -1.5, 3)}$ — smaller than the actual error, so not a bound at all.)`,
        };
      },
    }),
    mcq({
      id: 'wrong-M', difficulty: 3, kind: 'error',
      prompt: t`A student bounds the error of $P_3(x) = 1 + x + \frac{x^2}{2} + \frac{x^3}{6}$ for $e^x$ at $x = 2$:
$$|R_3(2)| \le \frac{M}{4!}\,2^4 \quad\text{with}\quad M = e^0 = 1, \quad\text{so the error is at most } 0.67.$$
But $e^2 - P_3(2) = 7.389 - 6.333 = 1.056$. What went wrong?`,
      choices: [
        t`$M$ must bound $e^c$ for every $c$ in $[0, 2]$, so $M = e^2$ (or a safe overestimate like 9), not $e^0$`,
        t`The bound should use $3!$ and $2^3$, not $4!$ and $2^4$`,
        t`The Lagrange bound fails for $e^x$ because its derivatives are not bounded on the real line`,
        t`Nothing: the bound is only approximate, so it can be beaten`,
      ],
      answer: 0,
      why: {
        1: t`The remainder after degree 3 does use $4!$ and $2^4$ — that part is right.`,
        2: t`The bound only needs $|f^{(4)}|$ bounded **between $a$ and $x$**, here on $[0, 2]$, where $e^c \le e^2$.`,
        3: 'A correctly computed Lagrange bound is a guarantee: the actual error can never exceed it.',
      },
      hints: [t`The unknown $c$ lies somewhere in $[0, 2]$. How large can $e^c$ be there?`, t`$M$ has to be the **largest** value of $|f^{(4)}|$ on the interval.`],
      teach: 'M is a worst case over the whole interval; picking its value at the centre is the classic way to get a "bound" that fails.',
      visual: { type: 'graph', params: { x: [-0.2, 2.3], y: [0, 8.5], curves: [{ fn: 'exp(x)', domain: [0, 2], color: 'accent' }], hlines: [{ y: 1, label: 'M = 1', color: 'bad' }, { y: Math.exp(2), label: 'M = e²', color: 'good' }] }, caption: t`$f^{(4)}(c) = e^c$ for $c$ anywhere in $[0, 2]$: it climbs from 1 to $e^2 \approx 7.39$, far above the student’s $M = 1$.` },
      explain: t`With $M = e^2 \approx 7.39$: $|R_3(2)| \le \frac{7.39\cdot 16}{24} \approx 4.9$, which does cover the actual error $1.056$. The student’s $M = 1$ only bounds $e^c$ at $c = 0$.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-bound-sin', difficulty: 2,
      gen(r) {
        const n = r.pick([3, 5]), b = r.pick([0.4, 0.6, 0.8]);
        const B = b ** (n + 1) / fact(n + 1);
        return {
          prompt: t`Evaluate the Lagrange bound $\frac{M}{(n+1)!}|x|^{n+1}$ (with $M = 1$) on $|\sin(${b}) - P_${n}(${b})|$, where $P_${n}$ is the degree-${n} Maclaurin polynomial of $\sin x$.`,
          answer: B, tol: { rel: 0.01 },
          errors: [{ value: b ** n / fact(n), feedback: t`The remainder after degree $${n}$ uses $(${n + 1})!$ and the power $${n + 1}$.` }],
          hints: [t`$|R_${n}(x)| \le \frac{|x|^{${n + 1}}}{(${n + 1})!}$.`],
          teach: t`For $\sin$, $M = 1$ and the bound is $\frac{|x|^{n+1}}{(n+1)!}$.`,
          visual: { type: 'graph', params: { x: [-Math.PI, Math.PI], y: [-1.5, 1.5], curves: [{ fn: 'sin(x)', color: 'ink3', width: 1.8 }, { sum: '(-1)^k x^(2k+1)/(2k+1)!', k: [0, (n - 1) / 2], color: 'gold' }], vlines: [{ x: b, label: t`x = ${b}` }] }, caption: t`$\sin x$ (grey) and $P_${n}$ (gold) on $[-\pi, \pi]$.` },
          explain: t`$\frac{${b}^{${n + 1}}}{${fact(n + 1)}} = ${texNum(B, 3)}$.`,
        };
      },
    }),
    num({
      id: 'cp-degree-e', difficulty: 3,
      gen(r) {
        const k = r.pick([3, 4, 5]), n = smallestN(1, 10 ** -k, 3);
        return {
          prompt: t`You want $e$ to within $10^{-${k}}$ from the Maclaurin polynomial $P_n(1)$ of $e^x$. Using $M = 3$, what is the smallest degree $n$ the Lagrange bound guarantees will do?`,
          answer: n, tol: { rel: 1e-6, abs: 0.4 },
          errors: [{ value: n + 1, feedback: t`The remainder after degree $n$ is bounded by $\frac{3}{(n+1)!}$, with $(n+1)!$, not $n!$.` }],
          hints: [t`Solve $\frac{3}{(n+1)!} < 10^{-${k}}$, i.e. $(n+1)! > ${3 * 10 ** k}$.`, t`$6! = 720$, $7! = 5040$, $8! = 40\,320$, $9! = 362\,880$.`],
          teach: 'Factorials grow so fast that a few more terms buy each extra digit.',
          visual: { type: 'graph', params: { x: [-0.1, 1.1], y: [0, 3.5], curves: [{ fn: 'exp(x)', domain: [0, 1], color: 'accent' }], hlines: [{ y: 3, label: 'M = 3', color: 'warn' }] }, caption: t`$e^t$ on $[0, 1]$, where every derivative of $e^x$ must be bounded: it never reaches the dashed line $M = 3$.` },
          explain: t`We need $(n+1)! > ${3 * 10 ** k}$. The first factorial past that is $${n + 1}! = ${fact(n + 1).toLocaleString('en-US').replace(/,/g, '\\,')}$, so $n = ${n}$.`,
        };
      },
    }),
    num({
      id: 'cp-attitude', difficulty: 3, transfer: true,
      gen(r) {
        const k = r.pick([5, 6, 7]);
        const th = (24 * 10 ** -k) ** 0.25;
        return {
          prompt: t`A linearised attitude-control model replaces $\cos\theta$ by $1 - \frac{\theta^2}{2}$. Because the $\theta^3$ term of the cosine series is zero, this is also $P_3$, so the error is bounded by the remainder $R_3$: $\;|\cos\theta - (1 - \tfrac{\theta^2}{2})| \le \frac{\theta^4}{4!}$. Up to what angle, **in degrees**, does this guarantee keep the error below $10^{-${k}}$?`,
          answer: th * DEG, units: '°', tol: { rel: 0.005 },
          errors: [{ value: (6 * 10 ** -k) ** (1 / 3) * DEG, feedback: t`That uses $\frac{\theta^3}{3!}$, the remainder after degree 2. It is valid but weaker; the question asks for the $R_3$ bound $\frac{\theta^4}{24}$.` }],
          hints: [t`Solve $\frac{\theta^4}{24} < 10^{-${k}}$ for $\theta$ in radians.`, t`$\theta < \left(24\times10^{-${k}}\right)^{1/4}$ rad; then multiply by $\frac{180}{\pi}$.`],
          teach: 'Turn the bound around: set it equal to the tolerance and solve for the largest allowed distance from the centre.',
          visual: { type: 'graph', params: { x: [0, 0.9], y: [0.6, 1.03], xlabel: 'θ (rad)', ylabel: '', curves: [{ fn: 'cos(x)', color: 'ink3', width: 1.8 }, { fn: '1 - x^2/2', color: 'gold', dash: true }] }, caption: t`$\cos\theta$ (grey) and $1 - \frac{\theta^2}{2}$ (gold): indistinguishable at small angles, separating like $\frac{\theta^4}{24}$.` },
          explain: t`$\theta^4 < 24\times10^{-${k}}$ gives $\theta < ${nice(th, 4)}$ rad $= ${nice(th * DEG, 3)}^\circ$. Within that angle the quadratic model of $\cos\theta$ is good to $10^{-${k}}$.`,
        };
      },
    }),
  ],
  sources: [
    { label: 'OpenStax Calculus Vol. 2, §6.3 Taylor and Maclaurin Series (Taylor’s theorem with remainder)', url: 'https://openstax.org/books/calculus-volume-2/pages/6-3-taylor-and-maclaurin-series' },
  ],
});
