// Summation and geometric series — adding up a sequence: Gauss's pairing, the geometric sum and its limit.
import { lesson, mcq, num, expr } from '../../src/core/content.js';
import { nice, sig, frac } from '../../src/core/format.js';
import { N, bars, areaModel } from './_m0kit.js';

const t = String.raw;
const fr = (x) => (Number.isInteger(x) ? String(x) : frac(x));

/** Gauss's picture: the terms (blue) with the same terms reversed stacked on top (gold); every column reaches a₁ + aₙ. */
function gaussPic(terms, caption) {
  const n = terms.length, top = terms[0] + terms[n - 1], shade = [], curves = [];
  terms.forEach((v, i) => {
    const k = i + 1, w = terms[n - 1 - i];
    shade.push({ fn: N(v), lower: '0', from: N(k - 0.36), to: N(k + 0.36), color: 'accent', alpha: 0.5 });
    shade.push({ fn: N(v + w), lower: N(v), from: N(k - 0.36), to: N(k + 0.36), color: 'gold', alpha: 0.35 });
  });
  curves.push({ fn: N(top), domain: [0.4, n + 0.6], color: 'ink3', width: 1.2, dash: true });
  return {
    type: 'graph',
    params: { x: [0.3, n + 0.7], y: [0, +N(top * 1.15)], aspect: 'wide', xlabel: 'k', ylabel: '', xticks: n, shade, curves, legend: [{ label: 'the terms', color: 'accent' }, { label: 'the same terms reversed', color: 'gold' }], legendAt: 'tr' },
    caption,
  };
}

/** A ball dropped from h whose every bounce reaches f of the last height; the horizontal axis is time (each flight lasts ∝ √height). */
function bouncePic(h, f, caption, n = 6) {
  const w0 = Math.sqrt(h), curves = [{ fn: `${N(h)}*(1 - (x/${N(w0)})^2)`, domain: [0, N(w0)], color: 'accent', width: 2.2 }];
  let x = w0;
  for (let k = 1; k <= n; k++) {
    const H = h * f ** k, w = 2 * Math.sqrt(H), xm = x + w / 2;
    curves.push({ fn: `${N(H)}*(1 - ((x - ${N(xm)})/${N(w / 2)})^2)`, domain: [N(x), N(x + w)], color: 'accent', width: 2.2 });
    x += w;
  }
  return {
    type: 'graph',
    params: { x: [-0.1 * x, +N(x * 1.05)], y: [0, +N(h * 1.18)], aspect: 'wide', xlabel: 'time →', xticks: 0, ylabel: 'height (m)', curves, points: [{ x: 0, y: N(h), color: 'gold', r: 5 }] },
    caption,
  };
}

/** Odd numbers as L-shaped layers: 1 + 3 + … + (2n − 1) fills an n × n square. */
function oddSquares(n, caption) {
  const rects = [];
  for (let k = 1; k <= n; k++) {
    const color = k % 2 ? 'accent' : 'gold';
    rects.push({ x: k - 1, y: 0, w: 1, h: k, color, alpha: 0.4 });
    if (k > 1) rects.push({ x: 0, y: k - 1, w: k - 1, h: 1, color, alpha: 0.4 });
  }
  const sides = Array.from({ length: n }, (_, i) => ({ x: i + 0.5, y: i + 0.5, label: `${2 * i + 1}`, color: 'ink' }));
  return areaModel({ rects, sides, x: [-1, n + 1], y: [-0.4, n + 1], caption });
}

export default lesson({
  id: 'm0.M0-12.2',
  title: 'Summation and geometric series',
  minutes: 11, difficulty: 2,
  intro: t`A **series** is the sum of a sequence’s terms, $S_n = a_1 + a_2 + \cdots + a_n$. For an arithmetic sequence, pair the first term with the last, the second with the second-to-last, and so on: every pair is the same, so $S_n = \tfrac{n}{2}(a_1 + a_n)$. For a geometric sequence with first term $a$ and ratio $r \ne 1$,

$$S_n = a + ar + \cdots + ar^{n-1} = a\,\frac{1 - r^{n}}{1 - r}, \qquad S_\infty = \frac{a}{1 - r}\ \ \text{if } |r| < 1.$$

When $|r| < 1$ the powers $r^n$ shrink to $0$, so the partial sums settle on a finite value even though there are infinitely many terms: **infinitely many steps can add up to a finite distance**. When $|r| \ge 1$ there is no finite sum.`,
  symbols: [
    { tex: 'S_n', text: 'the $n$-th **partial sum**: the first $n$ terms added' },
    { tex: 'a', text: 'the first term of the geometric sequence' },
    { tex: 'r', text: 'the common ratio, each term divided by the one before (a pure number, $r \\ne 1$)' },
    { tex: 'n', text: 'how many terms are added' },
    { tex: 'S_\\infty', text: 'the sum of infinitely many terms: the value the partial sums approach, which exists only when $|r| < 1$' },
  ],
  why: t`Geometric sums count anything that compounds — launches, interest, decaying echoes — and the infinite sum $a/(1 - r)$ is the first convergent series you meet. [Calculus II](#/lesson/math1220.C2-4.3) builds every convergence test on it, and power series are geometric series in disguise.`,
  visual: {
    type: 'calc-series',
    title: 'Partial sums of a geometric series',
    lead: t`Bars are the terms $r^{n-1}$ (first term $a = 1$); dots are the running totals $S_N$. When $|r| < 1$ the dashed line is the sum $1/(1 - r)$ the dots close in on.`,
    tasks: [
      t`At $r = 0.5$ the sum is $2$: each term covers half the remaining gap, so the dots creep up and never overshoot.`,
      t`Try $r = -0.5$: the terms alternate and the sums zig-zag onto $2/3$ from both sides.`,
      t`Push $r$ to $1$ or beyond: the terms no longer shrink, the dots run away, and the dashed line disappears — there is no sum.`,
    ],
    params: {
      view: 'sums', term: 'r^(n - 1)', limit: '1/(1 - r)', limitWhen: '1 - abs(r)',
      N: { min: 1, max: 25, value: 10 },
      sliders: [{ key: 'r', label: t`Common ratio $r$`, min: -0.95, max: 1.1, step: 0.05, value: 0.5, explain: t`Each term is $r$ times the one before.` }],
    },
    caption: t`Only the first $N$ terms can ever be drawn; the sum is the value the dots approach as $N$ grows without bound.`,
  },
  example: {
    prompt: t`A launch company flies $12$ rockets in its first year and plans to fly $30\%$ more each year than the year before. If the plan holds, how many launches does it make in its first $8$ years?`,
    visual: bars({ values: Array.from({ length: 8 }, (_, i) => 12 * 1.3 ** i), labels: Array.from({ length: 8 }, (_, i) => String(Math.round(12 * 1.3 ** i))), xlabel: 'year', ylabel: 'launches', caption: t`Launches per year under the plan (rounded). An imagined company: real launch rates do not grow by a fixed percentage.` }),
    steps: [
      { label: 'Name the series', text: t`Year $k$ has $12 \times 1.3^{k-1}$ launches: geometric, with $a = 12$, $r = 1.3$, and we add $n = 8$ terms.` },
      { label: 'Why the formula holds', text: t`Write $S = a + ar + \cdots + ar^{7}$ and $rS = ar + ar^2 + \cdots + ar^{8}$. Subtract: everything cancels except the ends, $S - rS = a - ar^{8}$, so $S = a\,\dfrac{1 - r^{8}}{1 - r}$.` },
      { label: 'Compute', text: t`$1.3^{8} = ${nice(sig(1.3 ** 8, 5))}$, so $S_8 = 12 \times \dfrac{1 - ${nice(sig(1.3 ** 8, 5))}}{1 - 1.3} = 12 \times \dfrac{${nice(sig(1 - 1.3 ** 8, 5))}}{-0.3} = ${nice(sig(12 * (1.3 ** 8 - 1) / 0.3, 4))}$.` },
      { label: 'Sense check', text: t`About $${Math.round(12 * (1.3 ** 8 - 1) / 0.3)}$ launches. The last year alone has $12 \times 1.3^7 \approx ${Math.round(12 * 1.3 ** 7)}$, about a quarter of the total: under steady growth, the latest years dominate the sum. Simply multiplying $12 \times 8 = 96$ would badly undercount.` },
    ],
    answer: t`$S_8 = 12\,\dfrac{1.3^{8} - 1}{0.3} \approx ${Math.round(12 * (1.3 ** 8 - 1) / 0.3)}$ launches.`,
  },
  practice: [
    num({
      id: 'gauss', difficulty: 1,
      gen(r) {
        const a1 = r.int(1, 6), d = r.int(1, 4), n = r.int(7, 12), an = a1 + (n - 1) * d, ans = (n * (a1 + an)) / 2;
        return {
          prompt: t`Add up $${a1} + ${a1 + d} + ${a1 + 2 * d} + \cdots + ${an}$, the first ${n} terms of an arithmetic sequence.`,
          answer: ans, tol: { rel: 0, abs: 0.01 },
          errors: [{ value: n * (a1 + an), feedback: t`Each pair sums to $${a1 + an}$, but there are only $${n}/2$ pairs: $S = \tfrac{n}{2}(a_1 + a_n)$.` }, { value: ((n - 1) * (a1 + an)) / 2, feedback: t`There are ${n} terms, not ${n - 1}.` }],
          hints: [t`Pair the first and last terms: $${a1} + ${an} = ${a1 + an}$. Every pair sums to the same.`, t`$S_n = \tfrac{n}{2}(a_1 + a_n)$ with $n = ${n}$.`],
          teach: t`An arithmetic series is the number of terms times the average of the first and last.`,
          explain: t`$S_{${n}} = \tfrac{${n}}{2}(${a1} + ${an}) = ${ans}$. In the picture, the terms and their reverse fill a ${n} by $${a1 + an}$ rectangle, which is twice the sum.`,
          visual: gaussPic(Array.from({ length: n }, (_, i) => a1 + i * d), t`Each term (blue) with the same series reversed on top of it (gold): every column has the same height, $a_1 + a_n$.`),
        };
      },
    }),
    num({
      id: 'geo-finite', difficulty: 2,
      gen(r) {
        const [a, q] = r.pick([[3, 2], [5, 2], [2, 3], [4, 3], [1, 4], [7, 2]]), n = r.int(6, 10), last = a * q ** (n - 1), ans = (a * (q ** n - 1)) / (q - 1);
        return {
          prompt: t`Add up $${a} + ${a * q} + ${a * q * q} + \cdots + ${last}$, a geometric series of ${n} terms.`,
          answer: ans, tol: { rel: 0, abs: 0.01 },
          errors: [{ value: (a * (q ** (n + 1) - 1)) / (q - 1), feedback: t`That adds ${n + 1} terms. The series stops at $${last} = ${a}\cdot${q}^{${n - 1}}$, which is the ${n}th term.` }, { value: (a * (q ** (n - 1) - 1)) / (q - 1), feedback: t`That adds only ${n - 1} terms; count from $${a}\cdot ${q}^0$ to $${a}\cdot${q}^{${n - 1}}$.` }, { value: a * q ** n, feedback: t`Use $S_n = a\dfrac{r^n - 1}{r - 1}$, not just a power.` }],
          hints: [t`$a = ${a}$, $r = ${q}$. The last term is $${a}\cdot${q}^{${n - 1}}$, so there are ${n} terms.`, t`$S_n = a\,\dfrac{r^{n} - 1}{r - 1}$.`],
          teach: t`A finite geometric series sums to $a(r^n - 1)/(r - 1)$, where $n$ counts the terms.`,
          explain: t`$S_{${n}} = ${a}\times\dfrac{${q}^{${n}} - 1}{${q} - 1} = ${a}\times\dfrac{${q ** n - 1}}{${q - 1}} = ${ans}$.`,
          visual: bars({ values: Array.from({ length: n }, (_, i) => a * q ** i), xlabel: 'k', caption: t`The ${n} terms. Each bar is $${q}$ times the last, so the final bar alone is a big share of the total.` }),
        };
      },
    }),
    num({
      id: 'geo-infinite', difficulty: 2,
      gen(r) {
        const a = r.pick([6, 8, 9, 10, 12]), q = r.pick([1 / 2, 1 / 3, -1 / 2, 2 / 3, 1 / 4, -1 / 3]), ans = a / (1 - q);
        return {
          prompt: t`Find the sum of the infinite series $${a} ${q > 0 ? '+' : '-'} ${fr(Math.abs(a * q))} ${'+'} ${fr(a * q * q)} ${q > 0 ? '+' : '-'} \cdots$, in which each term is $${fr(q)}$ times the one before.`,
          answer: ans, tol: { rel: 1e-3 },
          errors: [{ value: a / (1 + q), feedback: t`Watch the sign: $S_\infty = a/(1 - r)$ with $r = ${fr(q)}$.` }, { value: (a * q) / (1 - q), feedback: t`That leaves out the first term: $a = ${a}$.` }, { value: a * (1 - q), feedback: t`Divide by $1 - r$; do not multiply.` }].filter((e) => Math.abs(e.value - ans) > 0.01 * Math.abs(ans)),
          hints: [t`$|r| = ${fr(Math.abs(q))} < 1$, so the sum exists: $S_\infty = \dfrac{a}{1 - r}$.`],
          teach: t`An infinite geometric series with $|r| < 1$ sums to $a/(1 - r)$.`,
          explain: t`$S_\infty = \dfrac{${a}}{1 - (${fr(q)})} = \dfrac{${a}}{${fr(1 - q)}} = ${fr(ans)}$.`,
          visual: { type: 'calc-series', params: { view: 'sums', term: `${a}*(${N(q)})^(n - 1)`, N: 5, readout: false }, caption: t`The first five terms (bars) and partial sums (dots). The sum is where the dots are heading.` },
        };
      },
    }),
    mcq({
      id: 'which-converges', difficulty: 2,
      prompt: t`Which of these infinite series has a finite sum?`,
      choices: [t`$5 - \tfrac{5}{2} + \tfrac{5}{4} - \tfrac{5}{8} + \cdots$`, t`$1 + 1.01 + 1.0201 + \cdots$`, t`$2 - 2 + 2 - 2 + \cdots$`, t`$\tfrac{1}{8} + \tfrac14 + \tfrac12 + 1 + \cdots$`],
      answer: 0,
      why: {
        1: t`The terms grow (slowly: $r = 1.01$). Adding infinitely many terms that never shrink gives no finite sum, however small the growth.`,
        2: t`Here $r = -1$. The partial sums jump between $2$ and $0$ for ever and never settle, so there is no sum — and $a/(1 - r) = 1$ is not it.`,
        3: t`The terms start small but double: $r = 2$. Small first terms do not save a series whose terms grow.`,
      },
      hints: [t`Find the ratio $r$ of each. The sum exists only when $|r| < 1$.`],
      teach: t`An infinite geometric series has a sum exactly when $|r| < 1$.`,
      explain: t`The first has $r = -\tfrac12$, so $|r| < 1$ and $S_\infty = \dfrac{5}{1 + \tfrac12} = \dfrac{10}{3}$. The others have $|r| \ge 1$.`,
    }),
    num({
      id: 'bounce', difficulty: 3,
      gen(r) {
        const h = r.pick([1.5, 2.5, 3, 4]), f = r.pick([0.8, 0.75, 0.64, 0.5]), ans = (h * (1 + f)) / (1 - f);
        return {
          prompt: t`A rubber ball dropped from $${h}$ m rebounds every time to $${Math.round(f * 100)}\%$ of the height it fell from. In the model where it bounces for ever, how far does it travel, up and down, in total?`,
          answer: ans, units: 'm', tol: { rel: 0.005 },
          errors: [{ value: h / (1 - f), feedback: t`Each bounce goes up *and* comes back down: after the first drop, every height is travelled twice.` }, { value: (2 * h) / (1 - f), feedback: t`The first drop is travelled once, down only. Only the rebounds count twice.` }],
          hints: [t`Distance $= h + 2(hf + hf^2 + \cdots)$: the first drop once, then every rebound up and down.`, t`$hf + hf^2 + \cdots = \dfrac{hf}{1 - f}$.`],
          teach: t`A bouncing ball’s distance is the first drop plus twice an infinite geometric series of rebound heights.`,
          explain: t`$D = ${h} + 2\times\dfrac{${h}\times${f}}{1 - ${f}} = ${h} + ${nice(sig((2 * h * f) / (1 - f), 4))} = ${nice(sig(ans, 4))}$ m, or $h\dfrac{1 + f}{1 - f}$. A real ball stops after finitely many bounces, but the infinitely many tiny ones add almost nothing.`,
          visual: bouncePic(h, f, t`The ball’s height against time for the first few bounces: each rebound reaches ${Math.round(f * 100)}% of the last height, and each flight is shorter in proportion to the square root of its height.`),
        };
      },
    }),
    num({
      id: 'odd-sum', difficulty: 2,
      gen(r) {
        const n = r.int(12, 40), L = 2 * n - 1, ans = n * n;
        return {
          prompt: t`Add up the odd numbers $1 + 3 + 5 + \cdots + ${L}$.`,
          answer: ans, tol: { rel: 0, abs: 0.01 },
          errors: [{ value: ((L + 1) / 2) * L, feedback: t`There are $(${L} + 1)/2 = ${n}$ terms, and their average is $(1 + ${L})/2 = ${n}$, not $${L}$.` }, { value: L * L, feedback: t`$${L}$ is the last term, not the number of terms. How many odd numbers are there from $1$ to $${L}$?` }, { value: ((L - 1) / 2) ** 2, feedback: t`Count the terms again: from $1$ to $${L}$ in steps of $2$ there are $(${L} - 1)/2 + 1 = ${n}$.` }],
          hints: [t`It is arithmetic with $a_1 = 1$, $d = 2$. How many terms end at $${L}$?`, t`$n$ terms, average $\tfrac12(1 + ${L})$.`],
          teach: t`The first $n$ odd numbers add up to $n^2$: each one is the L-shaped layer that grows an $(n-1)$-square into an $n$-square.`,
          explain: t`There are $${n}$ terms with average $${n}$, so the sum is $${n}^2 = ${ans}$. The picture shows why the answer is always a square.`,
          visual: oddSquares(5, t`$1 + 3 + 5 + 7 + 9$: each odd number is an L-shaped layer of unit squares, and together the first five fill a 5 by 5 square.`),
        };
      },
    }),
    expr({
      id: 'closed-form', difficulty: 3,
      gen(r) {
        const c = r.pick([2, 3, 5]), b = r.pick([2, 3]);
        return {
          prompt: t`Write $\displaystyle\sum_{k=0}^{n-1} ${c}\cdot${b}^{k}$ in closed form, as an expression in $n$.`,
          answer: `${c}(${b}^n - 1)/${b - 1}`,
          answerTeX: b === 2 ? t`${c}\left(2^{n} - 1\right)` : t`\tfrac{${c}}{2}\left(3^{n} - 1\right)`,
          vars: { n: [1, 6] },
          errors: [{ answer: `${c}(${b}^(n+1) - 1)/${b - 1}`, feedback: t`The sum runs from $k = 0$ to $n - 1$: that is $n$ terms, so the power is $${b}^{n}$.` }, { answer: `${c}(1 - ${b}^n)/${b - 1}`, feedback: t`Check the sign at $n = 1$: the sum is just $${c}$, which is positive.` }],
          hints: [t`$a = ${c}$, $r = ${b}$, and $k = 0, 1, \ldots, n - 1$ is $n$ terms.`, t`$S_n = a\,\dfrac{r^n - 1}{r - 1}$.`],
          teach: t`Count the terms of a $\Sigma$ carefully: $k = 0$ to $n - 1$ is $n$ terms.`,
          explain: t`$S_n = ${c}\,\dfrac{${b}^n - 1}{${b} - 1}$${b === 2 ? t` $= ${c}(2^n - 1)$` : ''}. Check at $n = 2$: $${c} + ${c * b} = ${c + c * b}$ and $${c}(${b}^2 - 1)/${b - 1} = ${(c * (b * b - 1)) / (b - 1)}$.`,
          visual: bars({ values: [0, 1, 2, 3, 4].map((k) => c * b ** k), k0: 0, xlabel: 'k', caption: t`The terms $${c}\cdot${b}^k$ for $k = 0$ to $4$, the case $n = 5$.` }),
        };
      },
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-cadence', difficulty: 2, transfer: true,
      gen(r) {
        const L1 = r.pick([8, 10, 15, 20]), g = r.pick([20, 25, 40, 50]), Y = r.int(5, 9), q = 1 + g / 100, ans = (L1 * (q ** Y - 1)) / (q - 1);
        return {
          prompt: t`A satellite operator puts $${L1}$ satellites into orbit in its first year and $${g}\%$ more each year than the year before. How many does it launch in its first ${Y} years? (Do not round the yearly numbers.)`,
          answer: ans, tol: { rel: 0.005 },
          errors: [{ value: L1 * q ** (Y - 1), feedback: t`That is the launches in year ${Y} alone. The question asks for the total over all ${Y} years.` }, { value: L1 * Y, feedback: t`The yearly number grows by $${g}\%$, so the years are not equal: sum the geometric series.` }, { value: (L1 * (q ** (Y + 1) - 1)) / (q - 1), feedback: t`That adds ${Y + 1} years.` }],
          hints: [t`$a = ${L1}$, $r = ${nice(q)}$, $n = ${Y}$.`, t`$S_n = a\,\dfrac{r^n - 1}{r - 1}$.`],
          teach: t`Steady percentage growth makes a geometric series; its sum is $a(r^n - 1)/(r - 1)$.`,
          explain: t`$S_{${Y}} = ${L1}\,\dfrac{${nice(q)}^{${Y}} - 1}{${nice(q - 1)}} = ${nice(sig(ans, 4))}$ — about $${Math.round(ans)}$ satellites.`,
          visual: bars({ values: Array.from({ length: Y }, (_, i) => L1 * q ** i), xlabel: 'year', ylabel: 'satellites', caption: t`Satellites launched each year under steady $${g}\%$ growth. An imagined operator.` }),
        };
      },
    }),
    num({
      id: 'cp-moon-time', difficulty: 4, transfer: true,
      gen(r) {
        const [world, g] = r.pick([['the Moon', 1.62], ['Mars', 3.71]]), h = r.pick([1, 2, 1.5]), f = r.pick([0.64, 0.49, 0.81, 0.36]), s = Math.sqrt(f);
        const t0 = Math.sqrt((2 * h) / g), ans = t0 * (1 + (2 * s) / (1 - s));
        return {
          prompt: t`A test ball is dropped from $${h}$ m onto the surface of ${world} ($g = ${g}\ \text{m/s}^2$, no air). Each bounce reaches $${Math.round(f * 100)}\%$ of the previous height. A fall from height $H$ takes $\sqrt{2H/g}$, and the rise back to $H$ takes as long. In the model where it bounces for ever, how long does it bounce for in total?`,
          answer: ans, units: 's', tol: { rel: 0.01 },
          errors: [
            { value: t0 * (1 + (2 * f) / (1 - f)), feedback: t`The *heights* shrink by $${f}$ each bounce, but times go as $\sqrt{H}$: the flight times shrink by $\sqrt{${f}} = ${nice(s)}$.` },
            { value: t0 / (1 - s), feedback: t`Each bounce is a rise *and* a fall: after the first drop, each bounce takes twice its fall time.` },
            { value: t0, feedback: t`That is only the first drop.` },
          ].filter((e) => Math.abs(e.value - ans) > 0.02 * ans),
          hints: [t`The first fall takes $t_0 = \sqrt{2h/g}$. Bounce $k$ reaches $hf^k$, so its fall takes $t_0\,(\sqrt{f})^{k}$.`, t`Total $= t_0 + 2t_0\left(\sqrt f + (\sqrt f)^2 + \cdots\right)$: a geometric series with ratio $\sqrt{f} = ${nice(s)}$.`, t`$\sqrt f + (\sqrt f)^2 + \cdots = \dfrac{\sqrt f}{1 - \sqrt f}$.`],
          teach: t`When heights shrink by $f$, flight times shrink by $\sqrt f$: find the ratio of the quantity you are adding.`,
          explain: t`$t_0 = \sqrt{2(${h})/${g}} = ${nice(sig(t0, 4))}$ s, and the ratio of flight times is $\sqrt{${f}} = ${nice(s)}$, so $$T = t_0\left(1 + \frac{2(${nice(s)})}{1 - ${nice(s)}}\right) = ${nice(sig(t0, 4))} \times ${nice(sig(1 + (2 * s) / (1 - s), 4))} = ${nice(sig(ans, 3))}\ \text{s}.$$ Infinitely many bounces, finished in a finite time.`,
          visual: bouncePic(h, f, t`Height against time for the first few bounces (to scale in time): the flights shrink by the square root of the height ratio.`),
        };
      },
    }),
    mcq({
      id: 'cp-aerobrake', difficulty: 2,
      gen(r) {
        const D = r.pick([400, 600, 800, 900]), f = r.pick([0.6, 0.75, 0.8, 0.5]), ans = D / (1 - f);
        return {
          prompt: t`A spacecraft aerobrakes: on each pass through the upper atmosphere its apoapsis (highest point) drops. The first pass lowers it by $${D}$ km, and in a simple model each later pass lowers it by $${Math.round(f * 100)}\%$ of the drop before. However many passes it makes, what is the most the apoapsis can drop?`,
          choices: [t`$${nice(ans)}$ km`, t`$${nice(sig(D / (1 + f), 4))}$ km`, t`$${nice(D * (1 + f))}$ km`, 'there is no limit: enough passes lower it as far as you like'],
          answer: 0,
          why: {
            1: t`Watch the sign: the total is $a/(1 - r) = ${D}/(1 - ${f})$, not $a/(1 + r)$.`,
            2: t`That counts only two passes. The drops form an infinite geometric series.`,
            3: t`Infinitely many passes, but the drops shrink geometrically, so their total is finite: $a/(1 - r)$.`,
          },
          hints: [t`The drops are $${D},\ ${D}(${f}),\ ${D}(${f})^2, \ldots$: an infinite geometric series.`],
          teach: t`Infinitely many shrinking steps can add up to a finite total: $a/(1 - r)$ when $|r| < 1$.`,
          explain: t`Total drop $= \dfrac{${D}}{1 - ${f}} = ${nice(ans)}$ km. In real aerobraking each drop depends on the atmosphere’s density at the low point, which flight controllers adjust with small burns; the fixed ratio is a teaching model.`,
          visual: bars({ values: Array.from({ length: 8 }, (_, i) => D * f ** i), xlabel: 'pass', ylabel: 'drop (km)', caption: t`The apoapsis drop on each of the first eight passes in the model.` }),
        };
      },
    }),
  ],
  sources: [
    { label: 'OpenStax Precalculus 2e, §11.4 Series and Their Notations', url: 'https://openstax.org/books/precalculus-2e/pages/11-4-series-and-their-notations' },
  ],
});
