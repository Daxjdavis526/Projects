// Arithmetic and geometric sequences — add the same number each step, or multiply by the same number.
import { lesson, mcq, num } from '../../src/core/content.js';
import { nice, sig, frac } from '../../src/core/format.js';
import { N, thou } from './_m0kit.js';
import { seqDots } from './_m0reason.js';

const t = String.raw;
const T_PU = 87.7;   // years, plutonium-238 half-life (NUBASE2020: 87.7 y)
const R_PU = 2 ** (-1 / T_PU);
const ratioTeX = (r) => (Number.isInteger(r) ? String(r) : frac(r));

export default lesson({
  id: 'm0.M0-12.1',
  title: 'Arithmetic and geometric sequences',
  minutes: 9, difficulty: 1,
  intro: t`A **sequence** is a list of numbers in order: $a_1, a_2, a_3, \ldots$ Two kinds turn up everywhere. In an **arithmetic** sequence you **add** the same number $d$ each step; in a **geometric** sequence you **multiply** by the same number $r$:

$$a_n = a_1 + (n-1)\,d \qquad\qquad a_n = a_1\,r^{\,n-1}$$

The $n - 1$ is there because $a_1$ has had no steps applied yet: the $n$-th term is $n - 1$ steps along. Plotted against $n$, an arithmetic sequence sits on a straight line of slope $d$; a geometric one on an exponential curve — it grows if $r > 1$, decays towards $0$ if $0 < r < 1$, and flips sign every step if $r < 0$.`,
  symbols: [
    { tex: 'n', text: 'the index: which term, counting from $1$ (a whole number)' },
    { tex: 'a_n', text: 'the $n$-th term of the sequence' },
    { tex: 'a_1', text: 'the first term' },
    { tex: 'd', text: 'the **common difference**: $a_{n+1} - a_n$, the same for every $n$ (same units as the terms)' },
    { tex: 'r', text: 'the **common ratio**: $a_{n+1}/a_n$, the same for every $n$ (a pure number)' },
  ],
  why: t`Constant change and constant *percentage* change are the two simplest models of anything that happens in steps: a fixed burn every orbit, a fixed fraction lost at every lens surface or every half-life. The geometric sequence is the stepwise cousin of [exponential decay](#/lesson/m0.M0-6.1), and both lead to the [sequences of Calculus II](#/lesson/math1220.C2-4.1).`,
  visual: {
    type: 'graph',
    title: 'Add, or multiply?',
    lead: t`Blue dots add $d$ each step; gold dots multiply by $r$. Both start from the same $a_1$. The dashed curves are the straight line and the exponential the dots sit on.`,
    tasks: [
      t`Set $d = 0$ and $r = 1$: both sequences stand still. Now nudge each: a constant difference makes a line, a constant ratio a curve that keeps steepening.`,
      t`Take $r$ below $1$ (say $0.7$): the gold dots decay towards $0$ but never reach it. Push $r$ negative: they flip sign every step, and no smooth curve passes through them.`,
      t`Set $r = 1.2$ and $d = 1.5$. The arithmetic sequence leads early, but by $n = 10$ the geometric one has caught up — **multiplying always wins eventually** when $r > 1$.`,
    ],
    params: {
      x: [0.3, 10.7], y: [-8, 22], aspect: 'wide', xlabel: 'n', ylabel: 'aₙ', xticks: 10,
      sliders: [
        { key: 'a', label: t`First term $a_1$`, min: 1, max: 4, step: 0.5, value: 2, explain: t`Where both sequences start, at $n = 1$.` },
        { key: 'd', label: t`Common difference $d$`, min: -2, max: 2, step: 0.1, value: 1.5, explain: t`Added at every step of the blue sequence.` },
        { key: 'r', label: t`Common ratio $r$`, min: -1.2, max: 1.4, step: 0.05, value: 1.2, explain: t`Multiplies every step of the gold sequence.` },
      ],
      curves: [
        { fn: 'a + (x - 1)*d', color: 'accent', width: 1.4, dash: true },
        { fn: 'a*r^(x - 1)', color: 'gold', width: 1.4, dash: true, when: 'step(r - 0.01)' },
      ],
      points: [
        ...Array.from({ length: 10 }, (_, i) => ({ x: i + 1, y: `a + ${i}*d`, color: 'accent', r: 5 })),
        ...Array.from({ length: 10 }, (_, i) => ({ x: i + 1, y: `a*r^${i}`, color: 'gold', r: 5 })),
      ],
      legend: [{ label: 'arithmetic: add d', color: 'accent', point: true }, { label: 'geometric: multiply by r', color: 'gold', point: true }], legendAt: 'tl',
      readouts: [{ label: t`$a_{10}$, arithmetic`, expr: 'a + 9*d', digits: 3 }, { label: t`$a_{10}$, geometric`, expr: 'a*r^9', digits: 3 }],
    },
    caption: t`Only whole $n$ mean anything: the dashed curves just show the shape the dots follow. Dots beyond the frame are not drawn.`,
  },
  example: {
    prompt: t`The plutonium-238 in a radioisotope generator (the power source of the Curiosity and Perseverance rovers) gives off $2000$ W of heat at the start of its first year. Plutonium-238 has a half-life of $87.7$ years, so each year’s heat is the same fraction of the year before’s. How much heat does it give off at the start of year $15$, after its $14$-year design life?`,
    visual: seqDots({ values: Array.from({ length: 15 }, (_, i) => 2000 * R_PU ** i), y: [1650, 2040], ylabel: 'heat (W)', xlabel: 'year n', guide: `2000*${N(R_PU)}^(x - 1)`, colors: [...Array(14).fill('accent'), 'gold'], caption: t`The heat at the start of each year. The vertical axis starts at $1650$ W, which makes a gentle decay look steep: the curve is an exponential, nearly straight over this short stretch.` }),
    steps: [
      { label: 'Recognise the kind', text: t`“The same fraction of the year before” means each term is the last **times** a fixed number: a geometric sequence, $a_n = a_1 r^{n-1}$ with $a_1 = 2000$ W.` },
      { label: 'Find the ratio', text: t`After one half-life, $87.7$ yearly steps, the heat has halved: $r^{87.7} = \tfrac12$, so $r = 2^{-1/87.7} = ${nice(sig(R_PU, 5))}$. Each year keeps $${nice(sig(100 * R_PU, 4))}\%$.` },
      { label: 'Count the steps', text: t`The start of year $15$ is $a_{15}$, which is $15 - 1 = 14$ steps after $a_1$: $a_{15} = 2000 \times ${nice(sig(R_PU, 5))}^{14}$.` },
      { label: 'Compute', text: t`$${nice(sig(R_PU, 5))}^{14} = ${nice(sig(R_PU ** 14, 4))}$, so $a_{15} = ${Math.round(2000 * R_PU ** 14)}$ W.` },
      { label: 'Sense check', text: t`Fourteen years is $16\%$ of a half-life, and the heat has dropped by about $10\%$ — less than half, as it must be. The *electrical* output (about $110$ W at the start) falls faster than this, because the thermocouples that turn the heat into electricity age too.` },
    ],
    answer: t`$a_{15} = 2000 \times 2^{-14/87.7} \approx ${Math.round(2000 * R_PU ** 14)}$ W.`,
  },
  practice: [
    mcq({
      id: 'classify', difficulty: 1,
      gen(r) {
        const geo = r.bool(0.5);
        if (geo) {
          const [a1, q] = r.pick([[2, 3], [3, 2], [5, -2], [48, 0.5], [81, 1 / 3]]);
          const v = [0, 1, 2, 3].map((k) => a1 * q ** k);
          return {
            prompt: t`Which describes the sequence $${v.map((x) => ratioTeX(x)).join(',\ ')},\ \ldots$?`,
            choices: [t`geometric, $r = ${ratioTeX(q)}$`, t`arithmetic, $d = ${ratioTeX(v[1] - v[0])}$`, t`geometric, $r = ${ratioTeX(1 / q)}$`, 'neither: no constant difference or ratio'],
            answer: 0,
            why: {
              1: t`The differences are $${ratioTeX(v[1] - v[0])}$, then $${ratioTeX(v[2] - v[1])}$, then $${ratioTeX(v[3] - v[2])}$: not constant, so it is not arithmetic.`,
              2: t`The ratio is *next* ÷ *previous*: $${ratioTeX(v[1])} \div ${ratioTeX(v[0])} = ${ratioTeX(q)}$, not the other way up.`,
              3: t`Divide each term by the one before: you get $${ratioTeX(q)}$ every time. That constant ratio makes it geometric.`,
            },
            hints: [t`Check the differences $a_{n+1} - a_n$ and the ratios $a_{n+1}/a_n$. Which one stays the same?`],
            teach: t`Constant difference: arithmetic. Constant ratio: geometric.`,
            explain: t`Each term is $${ratioTeX(q)}$ times the one before, so the sequence is geometric with $r = ${ratioTeX(q)}$.`,
            visual: seqDots({ values: v, caption: t`The four terms against $n$: they do not lie on a straight line.` }),
          };
        }
        const [a1, d] = r.pick([[3, 4], [20, -5], [7, 7], [-4, 3], [2, 6]]);
        const v = [0, 1, 2, 3].map((k) => a1 + k * d);
        return {
          prompt: t`Which describes the sequence $${v.join(',\ ')},\ \ldots$?`,
          choices: [t`arithmetic, $d = ${d}$`, t`geometric, $r = ${ratioTeX(v[1] / v[0])}$`, t`arithmetic, $d = ${-d}$`, 'neither: no constant difference or ratio'],
          answer: 0,
          why: {
            1: t`$${v[1]} \div ${v[0]} = ${ratioTeX(v[1] / v[0])}$ but $${v[2]} \div ${v[1]} = ${ratioTeX(v[2] / v[1])}$: the ratio changes, so it is not geometric.`,
            2: t`The difference is *next* minus *previous*: $${v[1]} - (${v[0]}) = ${d}$.`,
            3: t`Subtract each term from the next: you get $${d}$ every time. That constant difference makes it arithmetic.`,
          },
          hints: [t`Check the differences $a_{n+1} - a_n$ and the ratios $a_{n+1}/a_n$. Which one stays the same?`],
          teach: t`Constant difference: arithmetic. Constant ratio: geometric.`,
          explain: t`Each term is the one before plus $${d}$: arithmetic with $d = ${d}$. Its dots lie on a straight line of slope $${d}$.`,
          visual: seqDots({ values: v, guide: `${a1} + (x - 1)*${d}`, caption: t`The four terms against $n$, with the straight line through them dashed.` }),
        };
      },
    }),
    num({
      id: 'arith-nth', difficulty: 1,
      gen(r) {
        const a1 = r.int(3, 20), d = r.intExcept(-4, 7, [0, 1]), n = r.int(20, 60), ans = a1 + (n - 1) * d;
        return {
          prompt: t`An arithmetic sequence starts $${a1},\ ${a1 + d},\ ${a1 + 2 * d},\ \ldots$ What is its ${n}th term, $a_{${n}}$?`,
          answer: ans, tol: { rel: 0, abs: 0.01 },
          errors: [{ value: a1 + n * d, feedback: t`That is one step too many. $a_1$ has had no steps added, so $a_{${n}}$ is $${n} - 1 = ${n - 1}$ steps along.` }, { value: n * d, feedback: t`Start from $a_1 = ${a1}$ and add $(n-1)d$.` }].filter((e) => e.value !== ans),
          hints: [t`$d = ${a1 + d} - ${a1} = ${d}$. Use $a_n = a_1 + (n-1)d$.`],
          teach: t`The $n$-th term is $n - 1$ steps after the first: $a_n = a_1 + (n-1)d$.`,
          explain: t`$a_{${n}} = ${a1} + (${n} - 1)(${d}) = ${a1} + ${(n - 1) * d} = ${ans}$.`,
          visual: seqDots({ values: [0, 1, 2, 3, 4, 5].map((k) => a1 + k * d), guide: `${a1} + (x - 1)*${d}`, caption: t`The first six terms on their line of slope $d$; the ${n}th is far off to the right.` }),
        };
      },
    }),
    num({
      id: 'geo-nth', difficulty: 2,
      gen(r) {
        const [a1, q] = r.pick([[3, 2], [5, 2], [2, 3], [4, -2], [1, -3], [6, 2]]), n = r.int(6, 9), ans = a1 * q ** (n - 1);
        return {
          prompt: t`A geometric sequence starts $${a1},\ ${a1 * q},\ ${a1 * q * q},\ \ldots$ What is $a_{${n}}$?`,
          answer: ans, tol: { rel: 0, abs: 0.01 },
          errors: [{ value: a1 * q ** n, feedback: t`One factor of $r$ too many: $a_{${n}} = a_1 r^{${n} - 1}$.` }, { value: (a1 * q) ** (n - 1), feedback: t`Only $r$ is raised to the power: $a_1 r^{n-1}$, not $(a_1 r)^{n-1}$.` }, { value: a1 + (n - 1) * q, feedback: t`That *adds* $r$ each step. A geometric sequence multiplies.` }].filter((e) => Math.abs(e.value - ans) > 0.5),
          hints: [t`$r = ${a1 * q} \div ${a1} = ${q}$. Use $a_n = a_1 r^{n-1}$.`],
          teach: t`The $n$-th term of a geometric sequence has $n - 1$ factors of $r$: $a_n = a_1 r^{n-1}$.`,
          explain: t`$a_{${n}} = ${a1} \times (${q})^{${n - 1}} = ${a1} \times ${q ** (n - 1)} = ${ans}$.${q < 0 ? ' The sign alternates, so check it: an even power of a negative ratio is positive.' : ''}`,
          visual: seqDots({ values: [0, 1, 2, 3].map((k) => a1 * q ** k), caption: t`The first four terms. Each is ${q < 0 ? 'the last times a negative number, so the dots alternate above and below zero' : 'the last times the same factor, so the gaps grow'}.` }),
        };
      },
    }),
    num({
      id: 'arith-two-terms', difficulty: 2,
      gen(r) {
        const d = r.intExcept(-6, 9, [0, 1, -1]), p = r.int(2, 5), q = p + r.int(4, 9), ap = r.int(-10, 30), aq = ap + (q - p) * d;
        return {
          prompt: t`In an arithmetic sequence, $a_{${p}} = ${ap}$ and $a_{${q}} = ${aq}$. Find the common difference $d$.`,
          answer: d, tol: { rel: 0, abs: 0.01 },
          errors: [{ value: (aq - ap) / (q - p + 1), feedback: t`From term ${p} to term ${q} there are $${q} - ${p} = ${q - p}$ steps, not $${q - p + 1}$: count the gaps, not the terms (the fence-post error).` }, { value: (aq - ap) / q, feedback: t`Divide by the number of steps *between* the two terms, $${q} - ${p}$.` }].filter((e) => Math.abs(e.value - d) > 0.02),
          hints: [t`Between $a_{${p}}$ and $a_{${q}}$ the sequence takes $${q} - ${p}$ steps of size $d$.`],
          teach: t`Two terms of an arithmetic sequence fix $d$: the change divided by the number of steps between them.`,
          explain: t`$${q - p}d = ${aq} - (${ap}) = ${aq - ap}$, so $d = ${d}$.`,
          visual: seqDots({ values: [ap, aq], ns: [p, q], colors: ['gold'], caption: t`The two known terms. Between them lie $${q} - ${p}$ equal steps.` }),
        };
      },
    }),
    num({
      id: 'geo-two-terms', difficulty: 2,
      gen(r) {
        const [q, a2] = r.pick([[2, 3], [3, 2], [0.5, 64], [-2, 5], [3, 4], [0.5, 96]]), a5 = a2 * q ** 3;
        return {
          prompt: t`In a geometric sequence, $a_2 = ${a2}$ and $a_5 = ${nice(a5)}$. Find the common ratio $r$.`,
          answer: q, tol: { rel: 0, abs: 0.005 },
          errors: [{ value: a5 / a2 / 3, feedback: t`Three steps of a geometric sequence *multiply* by $r$ three times: $r^3 = a_5/a_2$. Take the cube root, do not divide by $3$.` }, { value: a5 / a2, feedback: t`$a_5/a_2$ is $r^3$, three steps’ worth. Take its cube root.` }].filter((e) => Math.abs(e.value - q) > 0.01),
          hints: [t`$a_5 = a_2 \cdot r^3$.`, t`$r^3 = ${nice(a5)}/${a2} = ${nice(a5 / a2)}$.`],
          teach: t`Between two terms $k$ steps apart, a geometric sequence multiplies by $r^k$.`,
          explain: t`$r^3 = \dfrac{${nice(a5)}}{${a2}} = ${nice(a5 / a2)}$, so $r = \sqrt[3]{${nice(a5 / a2)}} = ${nice(q)}$.`,
          visual: seqDots({ values: [a2, a5], ns: [2, 5], colors: ['gold'], caption: t`The two known terms; three multiplications by $r$ lead from one to the other.` }),
        };
      },
    }),
    num({
      id: 'first-below', difficulty: 3,
      gen(r) {
        const q = r.pick([0.98, 0.97, 0.95, 0.96]), T = r.pick([80, 70, 90]);
        let n = 1; while (100 * q ** (n - 1) >= T) n++;
        const x = Math.log(T / 100) / Math.log(q);
        let arithN = 1; while (100 - (arithN - 1) * (100 - 100 * q) >= T - 1e-9) arithN++;
        return {
          prompt: t`A cubesat’s battery keeps $${nice(q * 100)}\%$ of its capacity after each charge cycle. On cycle $1$ it has $100\%$. On which cycle does its capacity first fall below $${T}\%$?`,
          answer: n, tol: { rel: 0, abs: 0.01 },
          errors: [{ value: n - 1, feedback: t`Cycle $n$ has had $n - 1$ cycles of wear: solve $${nice(q)}^{\,n-1} < ${nice(T / 100)}$ for $n$, not $${nice(q)}^{\,n}$.` }, { value: arithN, feedback: t`That subtracts a fixed $${nice(100 - 100 * q)}\%$ each cycle — an arithmetic model. Losing $${nice(100 - 100 * q)}\%$ *of what is left* is geometric.` }].filter((e) => e.value !== n),
          hints: [t`$a_n = 100\% \times ${nice(q)}^{\,n-1}$. You want the first $n$ with $${nice(q)}^{\,n-1} < ${nice(T / 100)}$.`, t`Take logs: $(n-1)\ln ${nice(q)} < \ln ${nice(T / 100)}$. Dividing by $\ln ${nice(q)}$, which is negative, flips the inequality.`],
          teach: t`To find when a geometric sequence crosses a level, take logs to bring the exponent down.`,
          explain: t`$n - 1 > \dfrac{\ln ${nice(T / 100)}}{\ln ${nice(q)}} = ${nice(sig(x, 4))}$, so the first whole $n - 1$ is $${n - 1}$ and $n = ${n}$. Check: $${nice(q)}^{${n - 2}} = ${nice(sig(q ** (n - 2), 4))}$ is still above, $${nice(q)}^{${n - 1}} = ${nice(sig(q ** (n - 1), 4))}$ below.`,
          visual: seqDots({ values: [0, 1, 2].map((k) => 100 * q ** k), y: [60, 104], ylabel: 'capacity (%)', x: [0.3, 20.5], hline: { y: T, color: 'warn', label: `${T}%` }, caption: t`The first three cycles and the level to cross. The vertical axis starts at $60\%$. Real batteries fade less regularly than this model.` }),
        };
      },
    }),
    mcq({
      id: 'which-geometric', difficulty: 2,
      prompt: t`Which formula defines a geometric sequence?`,
      choices: [t`$a_n = 5 \cdot 3^{n}$`, t`$a_n = 2^{n} + 1$`, t`$a_n = n^{2}$`, t`$a_n = 3n + 5$`],
      answer: 0,
      why: {
        1: t`It looks exponential, but the $+1$ spoils the ratio: $3, 5, 9, 17$ gives $\tfrac53$, then $\tfrac95$. Only a pure $C\,r^n$ is geometric.`,
        2: t`$1, 4, 9, 16$: the ratios ($4$, $2.25$, $1.78$) shrink. The variable is in the base, not the exponent.`,
        3: t`$8, 11, 14$: a constant difference of $3$, so arithmetic, not geometric.`,
      },
      hints: [t`Write out the first three terms of each and divide each by the one before.`],
      teach: t`A sequence is geometric exactly when $a_n = C\,r^n$ for constants $C$ and $r$ — nothing added.`,
      explain: t`$5\cdot3^n$ gives $15, 45, 135, \ldots$: each term is $3$ times the last, so $r = 3$ (and $a_1 = 15$). The others fail the constant-ratio test.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-arith', difficulty: 2,
      gen(r) {
        const a1 = r.int(2, 15), d = r.intExcept(-5, 8, [0, 1]), k = r.int(5, 9), m = r.int(25, 50), ak = a1 + (k - 1) * d, ans = a1 + (m - 1) * d;
        return {
          prompt: t`An arithmetic sequence has $a_1 = ${a1}$ and $a_{${k}} = ${ak}$. What is $a_{${m}}$?`,
          answer: ans, tol: { rel: 0, abs: 0.01 },
          errors: [{ value: a1 + m * d, feedback: t`One step too many: $a_{${m}} = a_1 + (${m} - 1)d$.` }, { value: a1 + (m - 1) * ((ak - a1) / k), feedback: t`From $a_1$ to $a_{${k}}$ is $${k - 1}$ steps, so $d = (${ak} - ${a1})/${k - 1}$.` }].filter((e) => Math.abs(e.value - ans) > 0.02),
          hints: [t`First find $d$ from $a_{${k}} = a_1 + ${k - 1}d$.`, t`Then $a_{${m}} = a_1 + ${m - 1}d$.`],
          teach: t`Two terms fix an arithmetic sequence: find $d$, then step to any term.`,
          explain: t`$d = \dfrac{${ak} - ${a1}}{${k - 1}} = ${d}$, so $a_{${m}} = ${a1} + ${m - 1}(${d}) = ${ans}$.`,
          visual: seqDots({ values: [a1, ak], ns: [1, k], colors: ['gold'], caption: t`The two given terms, $${k - 1}$ steps apart.` }),
        };
      },
    }),
    num({
      id: 'cp-lens', difficulty: 3, transfer: true,
      gen(r) {
        const el = r.pick([4, 5, 6, 7, 8]), s = 2 * el, ans = 0.96 ** s;
        return {
          prompt: t`A star tracker — the camera a spacecraft uses to find its orientation from the stars — focuses light with a lens of ${el} glass elements in air. Every glass surface the light crosses reflects about $4\%$ of what reaches it (uncoated glass at normal incidence) and passes $96\%$. What fraction of the starlight gets through all the surfaces? Ignore absorption.`,
          answer: ans, tol: { rel: 0.005 },
          errors: [
            { value: 0.96 ** el, feedback: t`Each element has *two* surfaces, front and back: the light crosses $${s}$ of them.` },
            { value: 1 - 0.04 * s, feedback: t`Subtracting $4\%$ per surface treats the loss as arithmetic. Each surface takes $4\%$ *of what is left*: multiply by $0.96$ each time.` },
          ],
          hints: [t`After the first surface $0.96$ of the light remains, after the second $0.96^2$: a geometric sequence.`, t`Count the surfaces: each element has a front and a back.`],
          teach: t`A fixed fraction lost at every step makes a geometric sequence: after $k$ steps, $r^k$ remains.`,
          explain: t`$${el}$ elements have $${s}$ surfaces, so $0.96^{${s}} = ${nice(sig(ans, 3))}$: only about $${Math.round(ans * 100)}\%$ of the light arrives. That loss is why camera and telescope lenses carry anti-reflection coatings, which cut the reflection at each surface to well under $1\%$.`,
          visual: seqDots({ values: [1, 0.96, 0.96 ** 2, 0.96 ** 3], n0: 0, y: [0.3, 1.06], xlabel: 'surfaces crossed', ylabel: 'fraction left', guide: '0.96^x', x: [-0.5, s + 0.5], caption: t`The fraction of light left after the first few surfaces, with the curve it follows (dashed). The vertical axis starts at $0.3$.` }),
        };
      },
    }),
    mcq({
      id: 'cp-recursive', difficulty: 2,
      gen(r) {
        const [a1, q] = r.pick([[4, 3], [2, 5], [3, 2], [5, 4], [6, 3]]);
        return {
          prompt: t`A sequence is defined by $a_1 = ${a1}$ and $a_{n+1} = ${q}\,a_n$. Which explicit formula gives the same sequence?`,
          choices: [t`$a_n = ${a1}\cdot ${q}^{\,n-1}$`, t`$a_n = ${a1}\cdot ${q}^{\,n}$`, t`$a_n = ${q}\cdot ${a1}^{\,n-1}$`, t`$a_n = ${a1} + ${q}(n-1)$`],
          answer: 0,
          why: {
            1: t`Test $n = 1$: it gives $${a1 * q}$, not $a_1 = ${a1}$. The exponent must be $0$ at $n = 1$.`,
            2: t`The base and the coefficient are swapped: the repeated factor is $r = ${q}$, and $a_1 = ${a1}$ multiplies it.`,
            3: t`That adds $${q}$ each step. The rule multiplies by $${q}$.`,
          },
          hints: [t`Write out $a_1, a_2, a_3$ from the rule and compare with each formula at $n = 1, 2, 3$.`],
          teach: t`A recursion $a_{n+1} = r\,a_n$ is a geometric sequence, $a_n = a_1 r^{n-1}$.`,
          explain: t`The rule multiplies by $${q}$ each step, starting from $${a1}$: $${a1},\ ${a1 * q},\ ${a1 * q * q}, \ldots = ${a1}\cdot${q}^{\,n-1}$.`,
          visual: seqDots({ values: [0, 1, 2, 3].map((k) => a1 * q ** k), caption: t`The first four terms the rule produces.` }),
        };
      },
    }),
  ],
  sources: [
    { label: 'OpenStax Precalculus 2e, §11.2 Arithmetic Sequences and §11.3 Geometric Sequences', url: 'https://openstax.org/books/precalculus-2e/pages/11-3-geometric-sequences' },
    { label: 'NASA Radioisotope Power Systems program (the MMRTG)', url: 'https://rps.nasa.gov/' },
    { label: 'NUBASE2020 evaluation of nuclear physics properties (Pu-238 half-life)', url: 'https://doi.org/10.1088/1674-1137/abddae' },
  ],
});
