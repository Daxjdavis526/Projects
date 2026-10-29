// The precise (ε–δ) definition of a limit — a challenge and a response, read
// as an engineering tolerance: name the output tolerance, and I will name the
// input tolerance that guarantees it.
import { lesson, mcq, num, order } from '../../src/core/content.js';
import { nice, fmt, sig } from '../../src/core/format.js';

const t = String.raw;

const is = (k) => `step(0.5 - abs(fc - ${k}))`;
// the largest |f(x) − 4| on the window (2 − δ, 2 + δ): x² is monotone there; the jump is always 1 away
const WORST = `${is(0)}*((2 + d)^2 - 4) + ${is(1)}*1`;

// a static ε–δ picture: f near a, the band L ± ε and the window a ± δ
function band({ fn, pieces, a, L, eps, delta, x, y, caption, extra = {} }) {
  const curves = pieces || [{ fn, color: 'accent' }];
  return {
    type: 'graph',
    params: {
      x, y, aspect: 'wide',
      shade: [
        { fn: `${L + eps}`, lower: `${L - eps}`, from: x[0], to: x[1], color: 'good', alpha: 0.16 },
        ...(delta ? [{ fn: `${y[1]}`, lower: `${y[0]}`, from: a - delta, to: a + delta, color: 'gold', alpha: 0.13 }] : []),
      ],
      curves,
      points: [{ x: a, y: L, color: 'gold', r: 3 }],
      ...extra,
    },
    caption,
  };
}

export default lesson({
  id: 'math1210.C1-2.6',
  title: 'The precise (ε–δ) definition',
  minutes: 11, difficulty: 3,
  intro: t`“$f(x)$ gets close to $L$ as $x$ gets close to $a$” is made precise as a challenge and a response. **You** name any output tolerance $\varepsilon$; **I** must answer with an input tolerance $\delta$ that guarantees it:

$$\forall\,\varepsilon > 0\ \ \exists\,\delta > 0:\quad 0 < |x - a| < \delta \implies |f(x) - L| < \varepsilon$$

It is exactly an engineering spec. To hold a thruster’s force within $\varepsilon$ newtons of nominal, how tightly must the chamber pressure be regulated? A limit exists when *every* force spec, however tight, can be met by *some* pressure tolerance. The order matters: $\varepsilon$ comes first, and $\delta$ may depend on it.`,
  symbols: [
    { tex: '\\forall\\,\\varepsilon > 0', text: '“for every tolerance $\\varepsilon$” on the output — the challenge, chosen first and as small as you like' },
    { tex: '\\exists\\,\\delta > 0', text: '“there is a tolerance $\\delta$” on the input — the response, allowed to depend on $\\varepsilon$ (and on $a$), never on $x$' },
    { tex: '0 < |x - a| < \\delta', text: '$x$ is within $\\delta$ of $a$ but not equal to it — the value at $a$ never matters' },
    { tex: '|f(x) - L| < \\varepsilon', text: 'the output is within $\\varepsilon$ of the limit $L$' },
    { tex: '\\implies', text: '“guarantees”: every such $x$ must pass, not just some' },
  ],
  why: t`This definition is what makes derivatives, integrals and convergence provable — and it is the template for every tolerance analysis an engineer will ever do.`,
  visual: {
    type: 'graph',
    title: 'The ε–δ game',
    lead: t`The green band is the output tolerance $4 \pm \varepsilon$; the gold strip is the input window $2 \pm \delta$. Inside the window the curve turns green if it stays in the band and red if it escapes. Your job: for each $\varepsilon$, find a $\delta$ that turns it green.`,
    tasks: [
      t`With $f(x) = x^2$ and $\varepsilon = 1$: the largest $\delta$ that works is $\sqrt5 - 2 \approx 0.236$. Any smaller $\delta$ works too.`,
      t`Shrink $\varepsilon$ to $0.2$: now you need $\delta < 0.049$. Every $\varepsilon$ has its $\delta$, so $\lim_{x\to2} x^2 = 4$.`,
      t`Switch to the jump, which claims the limit $4$: for $\varepsilon > 1$ any $\delta$ works, but at $\varepsilon \le 1$ no $\delta$ does — so $4$ is not its limit (and nothing else is).`,
    ],
    params: {
      x: [0.6, 3.4], y: [0.3, 8.2], aspect: 'wide',
      choices: [{ key: 'fc', label: 'Function', options: [[0, t`$x^2$`], [1, 'a jump from 3 to 5']], value: 0, explain: t`The function whose limit at $x = 2$ is claimed to be $4$.` }],
      sliders: [
        { key: 'eps', label: t`Output tolerance $\varepsilon$`, min: 0.05, max: 2, step: 0.01, value: 1, explain: t`How close to $L = 4$ the output must stay — the challenge.` },
        { key: 'd', label: t`Input tolerance $\delta$`, min: 0.005, max: 1, step: 0.005, value: 0.5, explain: t`How close to $a = 2$ the input is kept — your response.` },
      ],
      shade: [
        { fn: '4 + eps', lower: '4 - eps', from: 0.6, to: 3.4, color: 'good', alpha: 0.16 },
        { fn: '8.2', lower: '0.3', from: '2 - d', to: '2 + d', color: 'gold', alpha: 0.13 },
      ],
      curves: [
        { fn: 'x^2', color: 'accent', when: is(0) },
        { fn: 'x^2', color: 'good', width: 4, domain: ['2 - d', '2 + d'], when: `${is(0)}*step(eps - (${WORST}))` },
        { fn: 'x^2', color: 'bad', width: 4, domain: ['2 - d', '2 + d'], when: `${is(0)}*step((${WORST}) - eps)` },
        { fn: '3', color: 'accent', domain: [0.6, 1.99], when: is(1) },
        { fn: '5', color: 'accent', domain: [2.01, 3.4], when: is(1) },
        { fn: '3', color: 'good', width: 4, domain: ['2 - d', 1.99], when: `${is(1)}*step(eps - 1)` },
        { fn: '5', color: 'good', width: 4, domain: [2.01, '2 + d'], when: `${is(1)}*step(eps - 1)` },
        { fn: '3', color: 'bad', width: 4, domain: ['2 - d', 1.99], when: `${is(1)}*step(1 - eps)` },
        { fn: '5', color: 'bad', width: 4, domain: [2.01, '2 + d'], when: `${is(1)}*step(1 - eps)` },
      ],
      points: [{ x: 2, y: 4, color: 'gold', r: 3, label: '(a, L)' }],
      readouts: [{ label: t`largest $|f(x) - 4|$ in the window`, expr: WORST, digits: 3 }],
    },
    caption: t`The window excludes $x = 2$ itself, as the definition does. The largest deviation is computed exactly: $x^2$ is increasing near $2$, so it is $(2 + \delta)^2 - 4$.`,
  },
  example: {
    prompt: t`Prove $\displaystyle\lim_{x\to3} x^2 = 9$: for each $\varepsilon > 0$, find a $\delta$ that works. Then test it with $\varepsilon = 0.7$.`,
    visual: band({ fn: 'x^2', a: 3, L: 9, eps: 0.7, delta: 0.1, x: [2.6, 3.4], y: [7, 11], caption: t`$\varepsilon = 0.7$ (green band) and the $\delta = 0.1$ (gold strip) the recipe gives. The curve stays inside the band across the strip.` }),
    steps: [
      { label: 'Factor the gap', text: t`$|x^2 - 9| = |x - 3|\,|x + 3|$. The first factor is what $\delta$ controls; the second needs a bound.` },
      { label: 'Tame the other factor', text: t`Agree in advance that $\delta \le 1$. Then $2 < x < 4$, so $|x + 3| < 7$.` },
      { label: 'Choose delta', text: t`Now $|x^2 - 9| < 7|x - 3| < 7\delta$. That is at most $\varepsilon$ if $\delta \le \varepsilon/7$. So take $\delta = \min(1, \varepsilon/7)$ — both promises kept.` },
      { label: 'Test it', text: t`$\varepsilon = 0.7$ gives $\delta = 0.1$. The worst point is $x \to 3.1$: $|3.1^2 - 9| = 0.61 < 0.7$. ✓` },
      { label: 'Note', text: t`The recipe is safe, not tight: the largest $\delta$ that works is $\sqrt{9.7} - 3 = 0.114$. A proof only needs *some* $\delta$.` },
    ],
    answer: t`$\delta = \min(1, \varepsilon/7)$ works for every $\varepsilon > 0$, so $\lim_{x\to3} x^2 = 9$.`,
  },
  practice: [
    num({
      id: 'linear-delta', difficulty: 2,
      gen(r) {
        const m = r.pick([2, 3, 4, 5, -3, -4]), b = r.int(-5, 5), a = r.int(1, 4), eps = r.pick([0.1, 0.05, 0.03, 0.2]);
        const L = m * a + b;
        return {
          prompt: t`For $f(x) = ${m}x ${b < 0 ? '-' : '+'} ${Math.abs(b)}$ near $a = ${a}$, with $L = ${L}$, what is the largest $\delta$ that guarantees $|f(x) - ${L}| < ${eps}$ whenever $0 < |x - ${a}| < \delta$?`,
          answer: eps / Math.abs(m), tol: { rel: 0.002 },
          errors: [{ value: eps * Math.abs(m), feedback: t`$|f(x) - L| = ${Math.abs(m)}|x - ${a}|$: the output error is $${Math.abs(m)}$ times the input error, so the input must be held *tighter*, $\varepsilon/${Math.abs(m)}$.` }, { value: eps, feedback: t`That ignores the slope: $|f(x) - L| = ${Math.abs(m)}|x - ${a}|$.` }],
          hints: [t`$|f(x) - ${L}| = |${m}x ${b < 0 ? '-' : '+'} ${Math.abs(b)} - ${L}| = ${Math.abs(m)}\,|x - ${a}|$.`, t`You need $${Math.abs(m)}\,|x - ${a}| < ${eps}$, that is, $|x - ${a}| < ${eps}/${Math.abs(m)}$.`],
          teach: t`For a line of slope $m$, the output error is $|m|$ times the input error, so $\delta = \varepsilon/|m|$.`,
          explain: t`$\delta = ${eps}/${Math.abs(m)} = ${nice(eps / Math.abs(m))}$. A steeper line needs a tighter input tolerance.`,
          visual: band({ fn: `${m}*x + (${b})`, a, L, eps: eps * 5, x: [a - 0.5, a + 0.5], y: [L - Math.abs(m) * 0.6, L + Math.abs(m) * 0.6], caption: t`The line near $x = ${a}$ with a band drawn five times wider than $\pm${eps}$, so it can be seen.` }),
        };
      },
    }),
    {
      type: 'slider', id: 'set-delta', difficulty: 2,
      prompt: t`For $f(x) = x^2$ at $a = 2$, $L = 4$, the challenge is $\varepsilon = 0.5$. Set a $\delta$ that guarantees $|x^2 - 4| < 0.5$ for every $x$ in the window.`,
      visual: {
        type: 'graph',
        params: {
          x: [1.4, 2.6], y: [2.3, 5.9], aspect: 'wide',
          constants: { eps: 0.5 },
          sliders: [{ key: 'd', label: t`Input tolerance $\delta$`, min: 0.01, max: 0.5, step: 0.005, value: 0.3, explain: t`Half the width of the input window around $x = 2$.` }],
          shade: [{ fn: '4.5', lower: '3.5', from: 1.4, to: 2.6, color: 'good', alpha: 0.16 }, { fn: '5.9', lower: '2.3', from: '2 - d', to: '2 + d', color: 'gold', alpha: 0.13 }],
          curves: [{ fn: 'x^2', color: 'accent' }],
          points: [{ x: 2, y: 4, color: 'gold', r: 3 }],
        },
        caption: t`The band $4 \pm 0.5$ (green) and your window $2 \pm \delta$ (gold). The curve must stay inside the band everywhere across the window.`,
      },
      param: 'd', answer: [0.01, 0.12],
      instruction: 'Set δ so the curve stays in the band across the whole window, then check.',
      hints: ['The curve leaves the band first on the right, where it is steeper.', t`Solve $(2 + \delta)^2 = 4.5$: $\delta = \sqrt{4.5} - 2 \approx 0.121$. Anything at or below that works.`],
      teach: 'Any δ up to the largest working one is a valid response; the definition only asks that one exists.',
      explain: t`The window works while $(2 + \delta)^2 < 4.5$, that is, $\delta < \sqrt{4.5} - 2 = 0.121$. On the left the curve has more room: $(2 - \delta)^2 > 3.5$ holds up to $\delta = 0.129$.`,
    },
    mcq({
      id: 'quantifiers', difficulty: 2,
      prompt: t`In the definition $\forall\,\varepsilon > 0\ \exists\,\delta > 0: 0 < |x - a| < \delta \implies |f(x) - L| < \varepsilon$, what may $\delta$ depend on?`,
      visual: band({ fn: 'x^2', a: 2, L: 4, eps: 0.5, delta: 0.1, x: [1.4, 2.6], y: [2.3, 5.9], caption: t`One round of the game: the challenge $\varepsilon = 0.5$ and a response $\delta = 0.1$ that answers it for every $x$ in the strip at once.` }),
      choices: [t`On $\varepsilon$ and $a$ (and the function), but not on $x$`, t`On $x$: each $x$ may get its own $\delta$`, t`On nothing: one $\delta$ must work for every $\varepsilon$`, t`On $L$ only`],
      answer: 0,
      why: { 1: t`$\delta$ is chosen *before* any $x$ is considered, and must then work for every $x$ in the window.`, 2: t`That reads the quantifiers as “$\exists\,\delta\ \forall\,\varepsilon$”. A single $\delta$ cannot meet every $\varepsilon$ unless $f$ is constant near $a$.`, 3: t`$\delta$ usually shrinks with $\varepsilon$ — that is the whole game — so it depends on $\varepsilon$.` },
      hints: ['Read the quantifiers left to right: what has been chosen when δ is chosen?'],
      teach: 'ε is chosen first, then δ (which may use ε and a), then the guarantee must hold for every x in the window.',
      explain: t`The order “for every $\varepsilon$ there exists $\delta$” lets $\delta$ be a function of $\varepsilon$ (and of $a$). It is fixed before $x$ appears, so one $\delta$ must serve every $x$ within it.`,
    }),
    num({
      id: 'quad-exact', difficulty: 3,
      gen(r) {
        const [a, eps] = r.pick([[2, 0.5], [2, 0.3], [3, 0.5], [1, 0.2], [1, 0.1]]);
        const ans = Math.sqrt(a * a + eps) - a;
        return {
          prompt: t`For $f(x) = x^2$ at $a = ${a}$, $L = ${a * a}$, and $\varepsilon = ${eps}$, find the **largest** $\delta$ such that $0 < |x - ${a}| < \delta$ guarantees $|x^2 - ${a * a}| < ${eps}$. Give three significant figures.`,
          answer: ans, tol: { rel: 0.003 },
          errors: [
            { value: eps / (2 * a), feedback: t`That is the straight-line estimate $\varepsilon/f'(a)$. The parabola curves upward, so on the right it escapes slightly sooner: solve $(${a} + \delta)^2 = ${a * a + eps}$ exactly.` },
            { value: a - Math.sqrt(a * a - eps), feedback: t`That is where the curve leaves the band on the *left*. On the right it leaves sooner, and $\delta$ must protect both sides.` },
          ],
          hints: [t`The curve is steeper to the right of $${a}$, so the band is first broken at $x = ${a} + \delta$.`, t`Solve $(${a} + \delta)^2 = ${a * a} + ${eps}$: $\delta = \sqrt{${nice(a * a + eps)}} - ${a}$.`],
          teach: 'The largest δ is set by whichever side of a the curve leaves the band first.',
          explain: t`Right side: $\delta = \sqrt{${nice(a * a + eps)}} - ${a} = ${sig(ans, 3)}$. Left side: $${a} - \sqrt{${nice(a * a - eps)}} = ${sig(a - Math.sqrt(a * a - eps), 3)}$ — more room. The smaller one, $${sig(ans, 3)}$, protects both.`,
          visual: band({ fn: 'x^2', a, L: a * a, eps, x: [a - 0.4, a + 0.4], y: [a * a - 2 * eps - 0.3, a * a + 2 * eps + 0.3], caption: t`$y = x^2$ near $x = ${a}$ with the band $${a * a} \pm ${eps}$.` }),
        };
      },
    }),
    mcq({
      id: 'jump-fails', difficulty: 3,
      prompt: t`$f(x) = 3$ for $x < 2$ and $f(x) = 5$ for $x > 2$. Someone claims $\lim_{x\to 2} f(x) = 4$. Which challenge $\varepsilon$ defeats **every** $\delta$?`,
      visual: { type: 'graph', params: { x: [0.6, 3.4], y: [1.5, 6.5], aspect: 'wide', curves: [{ fn: '3', color: 'accent', domain: [0.6, 1.98] }, { fn: '5', color: 'accent', domain: [2.02, 3.4] }], points: [{ x: 2, y: 4, color: 'gold', r: 3, label: 'claimed L = 4' }] }, caption: 'The jump and the claimed limit.' },
      choices: [t`$\varepsilon = 0.5$`, t`$\varepsilon = 2$`, t`$\varepsilon = 1.5$`, t`None: some $\delta$ always works`],
      answer: 0,
      why: { 1: t`The band $4 \pm 2$ contains both $3$ and $5$, so every $\delta$ answers this challenge.`, 2: t`The band $4 \pm 1.5$ contains both $3$ and $5$, so every $\delta$ works.`, 3: t`Every window around $2$ contains points where $f = 3$ and $f = 5$, both a distance $1$ from $4$; a band narrower than that excludes them.` },
      hints: ['Every window around 2, however small, contains points with f = 3 and points with f = 5.', t`How far are $3$ and $5$ from $4$?`],
      teach: 'To refute a limit, find one ε that no δ can meet.',
      explain: t`Both values are $1$ away from $4$, so any $\varepsilon \le 1$ — such as $0.5$ — defeats every $\delta$. The same argument refutes any other candidate $L$, so the limit does not exist.`,
    }),
    order({
      id: 'proof-order', difficulty: 2,
      prompt: t`Put the steps of an ε–δ proof that $\displaystyle\lim_{x\to2}(3x - 1) = 5$ in order.`,
      visual: band({ fn: '3*x - 1', a: 2, L: 5, eps: 0.6, delta: 0.2, x: [1.5, 2.5], y: [3.3, 6.7], caption: t`For $\varepsilon = 0.6$ the proof’s $\delta = \varepsilon/3 = 0.2$: the line stays in the band across the strip.` }),
      items: [
        t`Let $\varepsilon > 0$ be given.`,
        t`Choose $\delta = \varepsilon/3$.`,
        t`Suppose $0 < |x - 2| < \delta$.`,
        t`Then $|(3x - 1) - 5| = 3|x - 2| < 3\delta = \varepsilon$.`,
        t`So every such $x$ satisfies $|f(x) - 5| < \varepsilon$, and the limit is $5$.`,
      ],
      hints: ['The challenge comes first, then the response, then the check.', 'δ must be chosen before any x is considered.'],
      teach: 'An ε–δ proof always runs: given ε, choose δ, take any x in the window, show the output is within ε.',
      explain: t`The proof mirrors the quantifiers: $\varepsilon$ is given, $\delta$ is chosen (as a function of $\varepsilon$), then an arbitrary $x$ in the window is shown to pass.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-thruster', difficulty: 2, transfer: true,
      gen(r) {
        const k = r.pick([0.42, 0.35, 0.8, 1.2]), p0 = r.pick([6, 8, 10, 12]), eps = r.pick([0.05, 0.02, 0.1]);
        return {
          prompt: t`A cold-gas thruster’s thrust is close to proportional to its chamber pressure: $F = kp$ with $k = ${k}$ N/bar, nominal $p_0 = ${p0}$ bar. The attitude-control spec demands $|F - F_0| < ${eps}$ N. What pressure tolerance $\delta$ (in bar) guarantees it?`,
          answer: eps / k, units: 'bar', tol: { rel: 0.005 },
          errors: [{ value: eps * k, feedback: t`$|F - F_0| = ${k}\,|p - p_0|$, so the pressure must be held within $\varepsilon/k$, not $\varepsilon k$.` }],
          hints: [t`$|F - F_0| = k\,|p - p_0|$. Require that to be less than $${eps}$ N.`],
          teach: 'For a linear response the input tolerance is the output tolerance divided by the sensitivity: δ = ε/k.',
          explain: t`$\delta = \varepsilon/k = ${eps}/${k} = ${fmt(eps / k)}$ bar. The regulator must hold $${p0} \pm ${fmt(eps / k)}$ bar. (Thrust is only nearly linear in pressure; the thrust coefficient drifts slightly with $p$.)`,
          visual: band({ fn: `${k}*x`, a: p0, L: k * p0, eps, x: [p0 - 0.6, p0 + 0.6], y: [k * p0 - 3 * eps, k * p0 + 3 * eps], extra: { xlabel: 'p (bar)', ylabel: 'F (N)' }, caption: t`Thrust against chamber pressure near nominal, with the force spec $F_0 \pm ${eps}$ N.` }),
        };
      },
    }),
    num({
      id: 'cp-sqrt', difficulty: 3,
      gen(r) {
        const s = r.int(2, 5), eps = r.pick([0.1, 0.2]);
        const ans = 2 * s * eps - eps * eps;
        return {
          prompt: t`For $f(x) = \sqrt{x}$ at $a = ${s * s}$, $L = ${s}$, and $\varepsilon = ${eps}$, find the **largest** $\delta$ such that $0 < |x - ${s * s}| < \delta$ guarantees $|\sqrt{x} - ${s}| < ${eps}$.`,
          answer: ans, tol: { rel: 0.002 },
          errors: [{ value: 2 * s * eps + eps * eps, feedback: t`That is where the curve leaves the band on the right. $\sqrt{x}$ is flatter on the right, so the left side is the tighter one.` }, { value: 2 * s * eps, feedback: t`That is the straight-line estimate. Solve $\sqrt{x} = ${s} - ${eps}$ exactly.` }],
          hints: [t`$\sqrt{x}$ bends downward, so it is steeper to the *left* of $${s * s}$: the band breaks first at $\sqrt{x} = ${s} - ${eps}$.`, t`$x = (${s} - ${eps})^2 = ${nice((s - eps) ** 2)}$, so $\delta = ${s * s} - ${nice((s - eps) ** 2)}$.`],
          teach: 'The binding side is where the function is steeper; for √x that is the left.',
          explain: t`Left: $${s * s} - (${s} - ${eps})^2 = ${nice(ans)}$. Right: $(${s} + ${eps})^2 - ${s * s} = ${nice(2 * s * eps + eps * eps)}$. The smaller, $\delta = ${nice(ans)}$, protects both sides.`,
          visual: band({ fn: 'sqrt(x)', a: s * s, L: s, eps, x: [s * s - 3 * s * eps, s * s + 3 * s * eps], y: [s - 2.2 * eps, s + 2.2 * eps], caption: t`$y = \sqrt{x}$ near $x = ${s * s}$ with the band $${s} \pm ${eps}$.` }),
        };
      },
    }),
    mcq({
      id: 'cp-negation', difficulty: 3,
      prompt: t`Which statement says that $\displaystyle\lim_{x\to a} f(x) = L$ is **false**?`,
      visual: { type: 'graph', params: { x: [-1, 1], y: [-1.5, 1.5], aspect: 'wide', curves: [{ fn: 'sin(1/x)', color: 'accent', domain: [-1, 1] }], shade: [{ fn: '0.4', lower: '-0.4', from: -1, to: 1, color: 'good', alpha: 0.16 }] }, caption: t`$\sin(1/x)$ against the band $0 \pm 0.4$: every window around $0$ contains points outside the band.` },
      choices: [
        t`There is an $\varepsilon > 0$ such that for every $\delta > 0$, some $x$ with $0 < |x - a| < \delta$ has $|f(x) - L| \ge \varepsilon$.`,
        t`For every $\varepsilon > 0$ and every $\delta > 0$, every $x$ with $0 < |x - a| < \delta$ has $|f(x) - L| \ge \varepsilon$.`,
        t`There is a $\delta > 0$ such that $|f(x) - L| \ge \varepsilon$ for some $x$.`,
        t`$|f(x) - L| \ge \varepsilon$ for some $x$ near $a$ and some $\varepsilon$.`,
      ],
      answer: 0,
      why: { 1: 'Far too strong: it says no x near a ever gets close to L. A limit can fail while many points come close.', 2: t`One bad window proves nothing: a limit only promises that *some* window works for each $\varepsilon$.`, 3: t`Any non-constant function has some $x$ with $|f(x) - L| \ge$ some $\varepsilon$; that does not refute a limit.` },
      hints: ['Negate each quantifier in turn: “for all” becomes “there exists”, and vice versa.', t`The negation of “$\forall\varepsilon\,\exists\delta\,\forall x$: pass” is “$\exists\varepsilon\,\forall\delta\,\exists x$: fail”.`],
      teach: 'To deny a limit, produce one ε that every δ fails — each window contains a point outside the band.',
      explain: t`Negating $\forall\varepsilon\,\exists\delta\,\forall x\,(\ldots < \varepsilon)$ gives $\exists\varepsilon\,\forall\delta\,\exists x\,(\ldots \ge \varepsilon)$. For $\sin(1/x)$ at $0$ with $L = 0$, $\varepsilon = 0.4$ does it: every window contains points where $\sin(1/x) = 1$.`,
    }),
  ],
  sources: [
    { label: 'OpenStax Calculus Vol. 1, §2.5 The precise definition of a limit', url: 'https://openstax.org/books/calculus-volume-1/pages/2-5-the-precise-definition-of-a-limit' },
  ],
});
