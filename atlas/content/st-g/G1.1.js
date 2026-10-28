// Statements and quantifiers — the rigorous version of m0's logic module.
// ∀ and ∃, why their order matters, and the mechanical rule for negating a
// string of them (flip every quantifier, negate the inside). Pictures:
// boundedness ∃M ∀x |f| ≤ M with the red witnesses of its negation; sin x
// with no limit at infinity; Euler diagrams for implications; a radial infall
// that ends at r = 0 in finite proper time (geodesic incompleteness, the
// conclusion of the singularity theorems, is the negation of a ∀ statement).
import { lesson, mcq, multi, num, match } from '../../src/core/content.js';
import { nice } from '../../src/core/format.js';

const t = String.raw;
const is = (k) => `step(0.5 - abs(fc - ${k}))`;

// an Euler diagram: the set P inside the set Q (P ⇒ Q), with optional points
function euler({ points = [], caption, qOnly = false }) {
  return {
    type: 'graph',
    params: {
      x: [-3.2, 3.2], y: [-2.3, 2.3], equal: true, aspect: 'wide', axes: false, grid: false, xticks: 0, yticks: 0, xlabel: '', ylabel: '',
      curves: [
        { param: ['2.1*cos(t)', '2*sin(t)'], t: [0, 6.2832], color: 'accent2', width: 2, label: qOnly ? 'Q' : 'Q (conclusion true)', labelAt: 0.9, labelDx: 6, labelDy: -4 },
        { param: ['-0.6 + 1.0*cos(t)', '-0.2 + 0.9*sin(t)'], t: [0, 6.2832], color: 'gold', width: 2, label: qOnly ? 'P' : 'P (hypothesis true)', labelAt: 1.75, labelDx: -40, labelDy: -6 },
      ],
      shade: [],
      points,
    },
    caption,
  };
}

// radial free fall from rest at r = 6M into a Schwarzschild black hole (G = c = 1, M = 1):
// r = 3(1 + cos η), τ = 3√3 (η + sin η) — a cycloid that reaches r = 0 at τ = 3√3 π
const TAU_END = 3 * Math.sqrt(3) * Math.PI;
const infall = (caption) => ({
  type: 'graph',
  params: {
    x: [0, 19], y: [0, 6.8], aspect: 'wide', xlabel: 'proper time τ (units of GM/c³)', ylabel: 'r (units of GM/c²)',
    curves: [{ param: ['3*sqrt(3)*(t + sin(t))', '3*(1 + cos(t))'], t: [0, 'pi'], color: 'accent', width: 2.4, label: 'infalling observer', labelAt: 0.9, labelDx: 8, labelDy: -6 }],
    hlines: [{ y: 2, label: 'horizon r = 2M', color: 'ink3' }],
    points: [{ x: +TAU_END.toFixed(4), y: 0, r: 5, hollow: true, color: 'bad', label: `r = 0 at τ = ${TAU_END.toFixed(1)}`, labelDx: -150, labelDy: -10 }],
  },
  caption,
});

// the first time a growing resonant oscillation a·t·|sin ωt| exceeds M (scan, then bisect)
function firstExceed(a, w, M) {
  const g = (s) => a * s * Math.abs(Math.sin(w * s)) - M;
  const h = 1e-4;
  let s = 0;
  while (g(s + h) <= 0) s += h;
  let lo = s, hi = s + h;
  for (let i = 0; i < 60; i++) { const m = (lo + hi) / 2; if (g(m) > 0) hi = m; else lo = m; }
  return (lo + hi) / 2;
}

export default lesson({
  id: 'st-g.G1.1',
  title: 'Statements and quantifiers',
  minutes: 12, difficulty: 2,
  intro: t`A **statement** is a sentence that is definitely true or definitely false. Mathematics builds its definitions from two quantifiers: $\forall$, “for every”, and $\exists$, “there exists”. Their order matters — “every point has a nearby flat frame” is not “one frame is flat at every point” — and negating a chain of them is mechanical: **flip every quantifier and negate what is inside**.

$$\begin{gathered}\neg\bigl(\forall x\ \exists y:\ P(x, y)\bigr) \\ \iff \exists x\ \forall y:\ \neg P(x, y)\end{gathered}$$

This is the rigorous sequel to [statements, implication and negation](#/lesson/m0.M0-14.1): here the strings of quantifiers get long, as they are in every definition of analysis and relativity.`,
  symbols: [
    { tex: '\\forall x', text: t`“for every $x$” (in a stated set): a claim about all of them, broken by a single counterexample` },
    { tex: '\\exists y', text: t`“there exists a $y$”: a claim proved by exhibiting one, a **witness**` },
    { tex: 'P(x, y)', text: t`a **predicate**: a sentence about $x$ and $y$ that becomes true or false once they are named, such as $y > x$` },
    { tex: '\\neg', text: 'not: the negation, true exactly when the statement it applies to is false' },
    { tex: '\\iff', text: 'if and only if: the two statements are true in exactly the same situations' },
  ],
  why: 'Every definition ahead — limit, continuity, completeness, a bounded operator, a geodesically complete spacetime — is a string of quantifiers, and the singularity theorems of general relativity conclude the negation of one.',
  visual: {
    type: 'graph',
    title: 'A bound and the witnesses against it',
    lead: t`“$f$ is bounded” means $\exists M\ \forall x:\ |f(x)| \le M$. Slide the proposed bound $M$: every red patch marks values of $x$ where $|f(x)| > M$ — witnesses that **this** $M$ fails. The function is bounded when some $M$ leaves no red at all.`,
    tasks: [
      t`For $8x/(1 + x^2)$, raise $M$ until the red vanishes: it happens at $M = 4$, the peak at $x = 1$. One witness $M$ proves the $\exists$.`,
      t`Switch to $x\sin x$: whatever $M$ you pick, red appears further out. That is the negation, $\forall M\ \exists x:\ |f(x)| > M$ — the function is unbounded.`,
      t`Try $1/x$ on $(0, 12]$: the red always sits near $x = 0$. A bounded *window* hides nothing: the domain stops short of $0$, but the values do not stop.`,
    ],
    params: {
      x: [0, 12], y: [-12, 12], aspect: 'wide', xlabel: 'x', ylabel: 'f(x)',
      choices: [{ key: 'fc', label: 'Function', options: [[0, t`$8x/(1 + x^2)$`], [1, t`$x\sin x$`], [2, t`$1/x$ on $(0, 12]$`]], value: 0, explain: 'The function whose boundedness is being tested.' }],
      sliders: [{ key: 'M', label: t`Proposed bound $M$`, min: 0.5, max: 10, step: 0.1, value: 2, explain: t`The candidate for the witness in $\exists M$: the claim is that $|f(x)| \le M$ for every $x$ in the domain.` }],
      shade: [
        { fn: 'max(8x/(1 + x^2), M)', lower: 'M', from: 0.01, to: 12, color: 'bad', alpha: 0.35, when: is(0) },
        { fn: 'max(x*sin(x), M)', lower: 'M', from: 0.01, to: 12, color: 'bad', alpha: 0.35, when: is(1) },
        { fn: '-M', lower: 'min(x*sin(x), -M)', from: 0.01, to: 12, color: 'bad', alpha: 0.35, when: is(1) },
        { fn: 'max(1/x, M)', lower: 'M', from: 0.02, to: 12, color: 'bad', alpha: 0.35, when: is(2) },
      ],
      curves: [
        { fn: '8x/(1 + x^2)', color: 'accent', width: 2.2, when: is(0) },
        { fn: 'x*sin(x)', color: 'accent', width: 2.2, when: is(1) },
        { fn: '1/x', color: 'accent', width: 2.2, domain: [0.02, 12], when: is(2) },
      ],
      hlines: [{ y: 'M', color: 'gold', label: '+M' }, { y: '-M', color: 'gold', label: '−M' }],
    },
    caption: t`Only $0 \le x \le 12$ is drawn; the statements are about the whole domain ($x \ge 0$ for the first two). A picture can suggest a bound but never prove one: $\forall x$ covers points no screen shows.`,
  },
  example: {
    prompt: t`“$f(x)$ has a limit as $x \to \infty$” means $\exists L\ \forall \varepsilon > 0\ \exists R\ \forall x > R:\ |f(x) - L| < \varepsilon$. Write its negation, then prove that $f(x) = \sin x$ has no limit at infinity.`,
    visual: {
      type: 'graph',
      params: {
        x: [0, 14], y: [-1.6, 1.6], aspect: 'wide', xlabel: 'x', ylabel: 'sin x',
        shade: [{ fn: '0.8', lower: '-0.2', from: 0, to: 14, color: 'good', alpha: 0.16 }],
        curves: [{ fn: 'sin(x)', color: 'accent', width: 2.2 }],
        hlines: [{ y: 0.3, color: 'good', label: 'L = 0.3' }],
        vlines: [{ x: 8, color: 'ink3', label: 'R = 8' }],
        points: [{ x: +(3.5 * Math.PI).toFixed(4), y: -1, color: 'bad', r: 5, label: 'witness x = 7π/2', labelDx: -60, labelDy: 18 }],
      },
      caption: t`One round of the negation: a candidate $L = 0.3$ with the band $L \pm \tfrac12$ (green), a cut-off $R = 8$, and a point beyond $R$ where $\sin x$ is outside the band. The proof must win every round, for every $L$ and every $R$.`,
    },
    steps: [
      { label: 'Flip each quantifier', text: t`Walk left to right, turning $\exists$ into $\forall$ and $\forall$ into $\exists$, and negate the final sentence: $\forall L\ \exists \varepsilon > 0\ \forall R\ \exists x > R:\ |f(x) - L| \ge \varepsilon$.` },
      { label: 'Read it as a game', text: t`Whatever limit $L$ is proposed, I name one tolerance $\varepsilon$; then however far out you go ($R$), I find an $x$ beyond it that misses $L$ by at least $\varepsilon$. The $\varepsilon$ may depend on $L$; the $x$ may depend on both $L$ and $R$.` },
      { label: 'Choose epsilon', text: t`Take $\varepsilon = \tfrac12$ for every $L$. The values $1$ and $-1$ are $2$ apart, so $|1 - L| + |{-1} - L| \ge 2$: at least one of them is $\ge 1 > \tfrac12$ away from $L$.` },
      { label: 'Find the witness', text: t`Given $R$, the points $x = \tfrac{\pi}{2} + 2\pi k$ (where $\sin x = 1$) and $x = \tfrac{3\pi}{2} + 2\pi k$ (where $\sin x = -1$) both occur beyond $R$ for large enough $k$. Pick the one whose value is far from $L$. Then $|\sin x - L| \ge 1 \ge \varepsilon$.` },
      { label: 'Conclude', text: t`Every move of the negation can be answered, so the negation is true and $\sin x$ has no limit at infinity. In the picture, $L = 0.3$ and $R = 8$: the witness is $x = 7\pi/2 \approx 11.0$, where $|{-1} - 0.3| = 1.3$.` },
    ],
    answer: t`Negation: $\forall L\ \exists\varepsilon > 0\ \forall R\ \exists x > R:\ |f(x) - L| \ge \varepsilon$. For $\sin x$, $\varepsilon = \tfrac12$ and a peak or trough beyond $R$ win every round — an undamped oscillation never settles.`,
  },
  practice: [
    mcq({
      id: 'order-matters', difficulty: 1,
      prompt: t`Over the real numbers, which statement is **true**?`,
      visual: {
        type: 'graph',
        params: { x: [-1, 7], y: [-1, 7], aspect: 'wide', xlabel: 'x', ylabel: 'y', curves: [{ fn: 'x', color: 'accent', width: 2, label: 'y = x', labelAt: 5.6, labelDx: 8, labelDy: 10 }], hlines: [{ y: 4, color: 'gold', label: 'a fixed y = 4' }], points: [{ x: 5, y: 4, color: 'bad', r: 5, label: 'x = 5 is not below it', labelDx: 8, labelDy: 14 }] },
        caption: t`Any fixed height $y$ is overtaken by the line $y = x$ once $x$ passes it.`,
      },
      choices: [t`$\forall x\ \exists y:\ y > x$`, t`$\exists y\ \forall x:\ y > x$`, t`$\exists x\ \forall y:\ y > x$`, t`$\forall x\ \forall y:\ y > x$`],
      answer: 0,
      why: {
        1: t`That claims one number larger than *every* real, including itself plus one. In $\exists y\ \forall x$ the $y$ is chosen first and cannot react to $x$.`,
        2: t`That claims a smallest real number $x$, below every $y$ — but $y = x - 1$ is a counterexample.`,
        3: t`Take $y = x$: then $y > x$ is false, so “for all pairs” fails.`,
      },
      hints: [t`Read left to right: whoever is quantified first is chosen first, and later choices may depend on it.`, t`In $\forall x\ \exists y$, $y$ may depend on $x$: try $y = x + 1$.`],
      teach: t`$\forall x\ \exists y$ lets $y$ depend on $x$; $\exists y\ \forall x$ demands one $y$ that works for all $x$ at once — a much stronger claim.`,
      explain: t`For each $x$, $y = x + 1$ is a witness, so $\forall x\ \exists y:\ y > x$ holds. Swapping the quantifiers asks for one $y$ beating every $x$, which the picture shows is impossible.`,
    }),
    num({
      id: 'least-bound', difficulty: 2,
      gen(r) {
        const k = r.int(2, 9), s = r.pick([0.5, 1, 2, 3]);
        const ans = k * s / Math.E;
        return {
          prompt: t`A detector pulse has the shape $f(t) = ${k}\,t\,e^{-t/${s}}$ for $t \ge 0$. The statement $\exists M\ \forall t \ge 0:\ f(t) \le M$ is true. What is the **smallest** $M$ that works? Give three significant figures.`,
          visual: { type: 'graph', params: { x: [0, 6 * s], y: [0, ans * 1.35], aspect: 'wide', xlabel: 't', ylabel: 'f(t)', curves: [{ fn: `${k}*x*e^(-x/${s})`, color: 'accent', width: 2.2 }] }, caption: t`The pulse $f(t) = ${k}\,t\,e^{-t/${s}}$: it rises, peaks once and decays to $0$.` },
          answer: ans, tol: { rel: 0.005 },
          errors: [{ value: k * s, feedback: t`That is $f$’s value with the exponential left out. At the peak $t = ${s}$ the factor $e^{-1}$ remains.` }, { value: k / Math.E, feedback: t`The peak is at $t = ${s}$, not $t = 1$: $f(${s}) = ${k}\cdot${s}\cdot e^{-1}$.` }].filter((e) => Math.abs(e.value - ans) > 0.03 * ans),
          hints: [t`The smallest bound is the largest value of $f$: find where $f'(t) = 0$.`, t`$f'(t) = ${k}e^{-t/${s}}(1 - t/${s})$, which vanishes at $t = ${s}$.`],
          teach: t`The least $M$ with $\forall t:\ f(t) \le M$ is the supremum of $f$; here it is attained at the peak.`,
          explain: t`$f$ peaks at $t = ${s}$, so $M = ${k}\cdot ${s}/e = ${nice(ans, 4)}$. Any $M$ at least this is a witness; any smaller $M$ is beaten by $t = ${s}$ — a witness for the negation.`,
        };
      },
    }),
    multi({
      id: 'true-statements', difficulty: 2,
      prompt: t`All variables range over the real numbers. Select **every** true statement.`,
      visual: { type: 'graph', params: { x: [-4, 4], y: [-4, 4], aspect: 'wide', curves: [{ fn: '1/x', color: 'accent', width: 2, label: 'xy = 1', labelAt: 2.6, labelDx: 4, labelDy: -6 }, { fn: '-x', color: 'gold', width: 2, label: 'x + y = 0', labelAt: -3.2, labelDx: 8, labelDy: 4 }] }, caption: t`Two of the relations in the choices, drawn as curves of the pairs $(x, y)$ that satisfy them.` },
      choices: [t`$\forall x\ \exists y:\ x + y = 0$`, t`$\exists y\ \forall x:\ x + y = 0$`, t`$\forall x\ \exists y:\ xy = 1$`, t`$\exists x\ \forall y:\ xy = 0$`, t`$\forall x\ \forall y:\ x^2 + y^2 \ge 2xy$`, t`$\exists x:\ x^2 < 0$`],
      answer: [0, 3, 4],
      why: {
        1: t`One $y$ cannot cancel every $x$: $y = -x$ depends on $x$.`,
        2: t`$x = 0$ is a counterexample: $0\cdot y = 0 \ne 1$ for every $y$. The curve $xy = 1$ never meets the $y$-axis.`,
        5: t`A real square is never negative, so no witness exists.`,
      },
      hints: [t`A $\forall$ statement falls to one counterexample; an $\exists$ statement needs one witness.`, t`Try $x = 0$ in the third and fourth statements; for the fifth, look at $(x - y)^2$.`],
      teach: t`Prove $\exists$ with one witness and refute $\forall$ with one counterexample; the order of mixed quantifiers decides what may depend on what.`,
      explain: t`True: $y = -x$ answers every $x$; $x = 0$ makes $xy = 0$ for every $y$; $x^2 + y^2 - 2xy = (x - y)^2 \ge 0$. False: no single $y$ cancels every $x$; $x = 0$ has no reciprocal; no real square is negative.`,
    }),
    mcq({
      id: 'negate-implication', difficulty: 2,
      prompt: t`Stellar-structure theory claims: **every neutron star heavier than its equation of state’s maximum mass collapses.** Formally $\forall s:\ P(s) \Rightarrow Q(s)$. Which observation would show the claim is **false**?`,
      visual: euler({ caption: t`An implication $P \Rightarrow Q$ for every $s$ says the set where $P$ holds lies inside the set where $Q$ holds.` }),
      choices: ['A neutron star heavier than the maximum mass that does not collapse', 'A neutron star lighter than the maximum mass that does not collapse', 'A neutron star lighter than the maximum mass that collapses', 'Every star heavier than the maximum mass staying stable, without exception'],
      answer: 0,
      why: {
        1: t`That star has $P$ false; an implication says nothing when its hypothesis is false, so it is consistent with the claim.`,
        2: t`Also consistent: $P$ is false, and nothing in “$P \Rightarrow Q$” forbids $Q$ without $P$. That would refute the *converse*.`,
        3: t`That would refute it, but it asks far more than needed. The negation of $\forall$ is $\exists$: one such star suffices.`,
      },
      hints: [t`$\neg(P \Rightarrow Q)$ is $P \wedge \neg Q$: the hypothesis holds and the conclusion fails.`, t`And $\neg\forall$ is $\exists$: you need just one $s$.`],
      teach: t`The negation of $\forall s:\ P(s) \Rightarrow Q(s)$ is $\exists s:\ P(s) \wedge \neg Q(s)$ — one counterexample, inside $P$ and outside $Q$.`,
      explain: t`A single star in $P$ but outside $Q$ — heavier than the maximum and not collapsing — is the counterexample. Stars lighter than the maximum are irrelevant to the claim either way.`,
    }),
    match({
      id: 'negations', difficulty: 3,
      prompt: t`Match each statement with its negation.`,
      left: [t`$\forall x\ \exists y:\ P(x, y)$`, t`$\exists x\ \forall y:\ P(x, y)$`, t`$\forall x:\ \bigl(P(x) \Rightarrow Q(x)\bigr)$`, t`$\exists x:\ \bigl(P(x) \wedge Q(x)\bigr)$`],
      right: ['∃x ∀y: not P(x, y)', '∀x ∃y: not P(x, y)', '∃x: P(x) and not Q(x)', '∀x: not P(x) or not Q(x)', '∀x: not P(x) ⇒ not Q(x)'],
      answer: [0, 1, 2, 3],
      hints: ['Flip every quantifier, left to right, then negate the innermost sentence.', t`$\neg(P \Rightarrow Q)$ is $P \wedge \neg Q$; $\neg(P \wedge Q)$ is $\neg P \vee \neg Q$ (De Morgan).`],
      teach: 'Negation is mechanical: ∀ ↔ ∃ at every position, and the inner sentence negated — implications become “and not”, “and” becomes “or”.',
      explain: t`The leftover option, “$\forall x:\ \neg P(x) \Rightarrow \neg Q(x)$”, is the *inverse* of the implication — equivalent to its converse, not its negation.`,
    }),
    mcq({
      id: 'bounded-error', difficulty: 3, kind: 'error',
      prompt: t`A student wants to say that $f(x) = x\sin x$ is **unbounded**. They negate “$\exists M\ \forall x:\ |f(x)| \le M$” and write “$\exists M\ \forall x:\ |f(x)| > M$”. What is wrong?`,
      visual: { type: 'graph', params: { x: [0, 14], y: [-14, 14], aspect: 'wide', curves: [{ fn: 'x*sin(x)', color: 'accent', width: 2 }], hlines: [{ y: 3, color: 'gold', label: 'M = 3' }, { y: -3, color: 'gold' }] }, caption: t`$x\sin x$ with a trial bound $M = 3$. Near every multiple of $\pi$ the function passes through $0$.` },
      choices: [t`Only the inequality was negated; the quantifiers must flip too: $\forall M\ \exists x:\ |f(x)| > M$`, t`The inequality should be $\ge$, giving $\exists M\ \forall x:\ |f(x)| \ge M$`, t`It should be $\forall M\ \forall x:\ |f(x)| > M$`, t`Nothing: the statement is correct and true for $x\sin x$`],
      answer: 0,
      why: {
        1: t`Changing $>$ to $\ge$ still leaves the quantifiers unflipped, and it is still false: $f(\pi) = 0$.`,
        2: t`Only the $\exists$ was flipped. And it is false: at $x = \pi$, $|f| = 0$.`,
        3: t`It is false: $f(\pi) = 0$ is not above any positive $M$. “Bigger than $M$ everywhere” is far stronger than “unbounded”.`,
      },
      hints: ['Every quantifier changes in a negation — count them in the student’s answer.', t`Check the student’s statement at $x = \pi$.`],
      teach: t`Negating $\exists M\ \forall x$ gives $\forall M\ \exists x$: unbounded means every proposed bound is beaten *somewhere*, not everywhere.`,
      explain: t`Unbounded is $\forall M\ \exists x:\ |f(x)| > M$. For $x\sin x$, given $M$ take $x = \tfrac{\pi}{2} + 2\pi k$ with $k$ large: $|f(x)| = x > M$. The student’s version fails at $x = \pi$.`,
    }),
    num({
      id: 'witness', difficulty: 2,
      gen(r) {
        const M = r.pick([50, 200, 700, 1500, 4000, 9000]);
        const ans = Math.floor(Math.cbrt(M)) + 1;
        return {
          prompt: t`The claim “$\exists M\ \forall x:\ x^3 \le M$” is false, so its negation $\forall M\ \exists x:\ x^3 > M$ is true. The witness may depend on $M$. For $M = ${M}$, what is the **smallest whole number** $x$ that is a witness?`,
          visual: { type: 'graph', params: { x: [0, Math.ceil(Math.cbrt(M)) + 3], y: [0, M * 1.8], aspect: 'wide', xlabel: 'x', ylabel: 'x³', curves: [{ fn: 'x^3', color: 'accent', width: 2.2 }], hlines: [{ y: M, color: 'gold', label: `M = ${M}` }] }, caption: t`The curve $y = x^3$ and the proposed bound. Every witness lies where the curve is above the line.` },
          answer: ans, tol: { rel: 0, abs: 0.4 },
          errors: [{ value: ans - 1, feedback: t`$${ans - 1}^3 = ${(ans - 1) ** 3}$, which is not more than $${M}$.` }],
          hints: [t`You need $x^3 > ${M}$, i.e. $x > \sqrt[3]{${M}}$.`, t`$\sqrt[3]{${M}} \approx ${nice(Math.cbrt(M), 4)}$.`],
          teach: t`A $\forall M\ \exists x$ statement is proved by a recipe that turns any $M$ into a witness — here any whole number above $\sqrt[3]{M}$.`,
          explain: t`$\sqrt[3]{${M}} \approx ${nice(Math.cbrt(M), 4)}$, so $x = ${ans}$ gives $x^3 = ${ans ** 3} > ${M}$, while $${ans - 1}^3 = ${(ans - 1) ** 3}$ does not. The general recipe $x = \lfloor\sqrt[3]{M}\rfloor + 1$ answers every $M$.`,
        };
      },
    }),
  ],
  checkpoint: [
    mcq({
      id: 'cp-geodesic', difficulty: 3, transfer: true,
      prompt: t`A spacetime is **geodesically complete** if every freely falling path (geodesic) can be continued to all values of its proper time. Penrose’s 1965 singularity theorem concludes that a collapsing star’s spacetime is **not** geodesically complete. What exactly does that conclusion assert?`,
      visual: infall(t`Free fall from rest at $r = 6M$ into a Schwarzschild black hole ($G = c = 1$). The infaller reaches $r = 0$ after a finite proper time, $3\sqrt3\,\pi M \approx 16.3M$, and the geodesic cannot be continued.`),
      choices: ['At least one freely falling path ends after a finite proper time', 'Every freely falling path ends after a finite proper time', 'No freely falling path can be continued at all', 'Some freely falling path can be continued forever'],
      answer: 0,
      why: {
        1: t`That negates the inside without flipping the quantifier: $\neg\forall$ is $\exists$, not $\forall\neg$. Distant orbiting observers live forever.`,
        2: t`Far stronger than the negation, and false: a satellite far from the star falls freely for ever.`,
        3: t`That is consistent with completeness, not its negation: completeness itself says *every* path can be continued.`,
      },
      hints: [t`Write completeness as $\forall \gamma:\ \gamma$ continues for all proper time.`, t`Negate it: flip $\forall$ to $\exists$ and negate the inside.`],
      teach: t`“Not complete” is $\neg\forall\gamma$, which is $\exists\gamma$: one geodesic that stops is enough — that is what “singular” means in the theorems.`,
      explain: t`$\neg(\forall\gamma:\ \text{continues}) \iff \exists\gamma:\ \text{ends at finite proper time}$. The theorem proves that such a path exists without saying it is the infall path or that every path ends — which is why it holds without symmetry.`,
    }),
    mcq({
      id: 'cp-frames', difficulty: 3, transfer: true,
      prompt: t`The equivalence principle says that around each event $p$ in spacetime there is a **local inertial frame** — one in which, near $p$, physics looks like special relativity. Which statement is the one general relativity makes, for a curved spacetime?`,
      visual: {
        type: 'graph',
        params: {
          x: [-2.6, 2.6], y: [-1.6, 1.6], equal: true, aspect: 'wide', axes: false, xticks: 0, yticks: 0, xlabel: '', ylabel: '',
          curves: [
            { param: ['cos(t)', 'sin(t)'], t: [0, 6.2832], color: 'accent', width: 2.2 },
            { fn: '(1 - 0.6x)/0.8', color: 'gold', width: 1.6, domain: [0.1, 1.1] },
            { fn: '(1 + 0.8x)/0.6', color: 'gold', width: 1.6, domain: [-1.2, -0.45] },
            { fn: '-1', color: 'gold', width: 1.6, domain: [-0.6, 0.6] },
          ],
          points: [{ x: 0.6, y: 0.8, color: 'gold', r: 4 }, { x: -0.8, y: 0.6, color: 'gold', r: 4 }, { x: 0, y: -1, color: 'gold', r: 4 }],
        },
        caption: t`A teaching picture in one dimension lower: a curved line (circle) has a flat tangent line at each of its points, each fitting well only near its own point. It is an analogy for the logic, not a picture of spacetime.`,
      },
      choices: [t`$\forall p\ \exists$ a frame inertial near $p$`, t`$\exists$ a frame $\forall p$ inertial near $p$`, t`$\forall p\ \forall$ frames, inertial near $p$`, t`$\exists p$ with no frame inertial near $p$`],
      answer: 0,
      why: {
        1: t`One frame inertial everywhere would make spacetime flat — it is exactly what curvature (tidal forces) forbids. Swapping $\forall$ and $\exists$ turned a local statement into a global one.`,
        2: t`A rotating or accelerating frame is not inertial anywhere; the principle promises existence, not that every frame works.`,
        3: t`That is the negation of the principle.`,
      },
      hints: ['Which choice lets the frame depend on the event?', t`In $\forall p\ \exists F$ the frame $F$ may change from event to event.`],
      teach: t`The equivalence principle is a $\forall p\ \exists F$ statement; curvature is the failure of the swapped $\exists F\ \forall p$ statement.`,
      explain: t`At each event a freely falling frame is inertial nearby, but a different event needs a different frame — like the tangent lines of the circle. No single frame works everywhere unless spacetime is flat.`,
    }),
    num({
      id: 'cp-resonance', difficulty: 3, transfer: true,
      gen(r) {
        const a = r.pick([1.5, 2, 2.5, 3]), M = r.pick([8, 10, 12, 15]);
        const ans = firstExceed(a, 2 * Math.PI, M);
        return {
          prompt: t`A test-stand fixture driven exactly at its resonance (1 Hz) vibrates as $x(t) = ${a}\,t\,\sin(2\pi t)$ millimetres, with $t$ in seconds. A designer claims $\forall t \ge 0:\ |x(t)| \le ${M}$ mm. Find the **earliest** witness against the claim: the first time at which $|x(t)| > ${M}$ mm.`,
          visual: { type: 'graph', params: { x: [0, Math.ceil(ans) + 1.5], y: [-(M * 1.6), M * 1.6], aspect: 'wide', xlabel: 't (s)', ylabel: 'x (mm)', curves: [{ fn: `${a}*x*sin(2*pi*x)`, color: 'accent', width: 1.8 }], hlines: [{ y: M, color: 'gold', label: `±${M} mm` }, { y: -M, color: 'gold' }] }, caption: t`The undamped resonant response grows linearly in time. A real fixture has some damping, which caps the growth; the model is the worst case.` },
          answer: ans, units: 's', tol: { rel: 0.004 },
          errors: [{ value: M / a, feedback: t`At $t = ${nice(M / a, 4)}$ s the envelope $${a}t$ reaches $${M}$, but $|\sin 2\pi t|$ is below 1 there. The first crossing comes at the next peak where the curve itself exceeds $${M}$.` }],
          hints: [t`$|x(t)|$ comes close to its envelope $${a}t$ near the peaks of $|\sin 2\pi t|$, at $t = \tfrac14, \tfrac34, \tfrac54, \dots$`, t`Find the first such peak with $${a}t > ${M}$, then solve $${a}\,t\,|\sin 2\pi t| = ${M}$ just before it (numerically).`],
          teach: t`Refuting a $\forall t$ claim needs one witness; the earliest one is the first root of $|x(t)| = M$ after which the curve is above $M$.`,
          explain: t`The envelope passes $${M}$ mm at $t = ${nice(M / a, 4)}$ s; the oscillation itself first crosses $|x| = ${M}$ mm at $t \approx ${nice(ans, 4)}$ s, on the way up to the next peak. Every later peak is a witness too.`,
        };
      },
    }),
  ],
  sources: [
    { label: 'Velleman, How to Prove It, 3rd ed. (Cambridge, 2019), chs. 1–2', url: 'https://www.cambridge.org/9781108439534' },
    { label: 'Hammack, Book of Proof, ch. 2 (free online)', url: 'https://www.people.vcu.edu/~rhammack/BookOfProof/' },
    { label: 'Penrose, Gravitational collapse and space-time singularities, Phys. Rev. Lett. 14, 57 (1965)', url: 'https://doi.org/10.1103/PhysRevLett.14.57' },
  ],
});
