// Applications: discrete dynamical systems x_{k+1} = A x_k, decided by the
// dominant eigenvalue; Markov chains and their steady states (Markov's own
// vowels and consonants); and a pointer to normal modes.
import { lesson, mcq, num, code } from '../../src/core/content.js';
import { nice, tex } from '../../src/core/format.js';
import { matTeX, det2, map2d } from './_la.js';
import { withEigen, decTeX, trace } from './_eig.js';

const t = String.raw;

// a two-state chain drawn as a state diagram: a = P(1 → 2), b = P(2 → 1), per step
function chainPic(a, b, { names = ['S₁', 'S₂'], caption } = {}) {
  const lab = (x, y, text, color = 'ink') => ({ x, y, r: 0, label: text, labelAlign: 'center', labelDx: 0, labelDy: 0, color });
  return {
    type: 'graph',
    params: {
      x: [-4.6, 4.6], y: [-2.3, 2.3], aspect: 'wide', equal: true, axes: false, grid: false, xlabel: '', ylabel: '', xticks: 0, yticks: 0,
      curves: [
        { param: ['-2.95 + 0.6*cos(t)', '0.6*sin(t)'], t: [0.6, 5.7], color: 'ink3', width: 1.6 },
        { param: ['2.95 + 0.6*cos(t)', '0.6*sin(t)'], t: [-2.55, 2.55], color: 'ink3', width: 1.6 },
      ],
      arrows: [
        { from: [-1.45, 0.4], to: [1.45, 0.4], color: 'accent', width: 2 },
        { from: [1.45, -0.4], to: [-1.45, -0.4], color: 'warn', width: 2 },
      ],
      points: [
        { x: -2, y: 0, r: 24, color: 'accent' }, { x: 2, y: 0, r: 24, color: 'warn' },
        lab(-2, 0, names[0], 'panel'), lab(2, 0, names[1], 'panel'),
        lab(0, 0.85, `${nice(a)}`, 'accent'), lab(0, -0.85, `${nice(b)}`, 'warn'),
        lab(-3.95, 0, `${nice(1 - a)}`, 'ink2'), lab(3.95, 0, `${nice(1 - b)}`, 'ink2'),
      ],
    },
    caption: caption || 'The chain as a state diagram: each arrow carries the probability of that move in one step; the loops are the chance of staying.',
  };
}

// the Explore: iterates of A = P diag(l1, 0.6) P⁻¹ with v₁ = (2, 1), v₂ = (−1, 1), from x₀ = (p, q)
const c1 = '((p + q)/3)', c2 = '((-p + 2*q)/3)';
const X = (j) => `${c1}*l1^${j}*2 - ${c2}*0.6^${j}`, Y = (j) => `${c1}*l1^${j} + ${c2}*0.6^${j}`;

export default lesson({
  id: 'math2270.LA-9.5',
  title: 'Applications: dynamical systems and Markov chains',
  minutes: 14, difficulty: 3,
  intro: t`Many processes update a state by the same linear rule each step: populations by age class, money between accounts, probabilities between states. Writing the start in the eigenvector basis, $\mathbf x_0 = c_1\mathbf v_1 + c_2\mathbf v_2 + \dots$, every step just multiplies each part by its eigenvalue:
$$\mathbf x_k = A^k\mathbf x_0 = c_1\lambda_1^k\mathbf v_1 + c_2\lambda_2^k\mathbf v_2 + \dots + c_n\lambda_n^k\mathbf v_n$$
So **the eigenvalue of largest size, $\lambda_1$, wins**: after many steps $\mathbf x_k$ points along $\mathbf v_1$ and grows (or shrinks) by $\lambda_1$ per step. A **Markov chain** is the case where $\mathbf x_k$ is a list of probabilities and each column of $A$ — the chances of moving from one state to each of the others — sums to 1. Then $\lambda = 1$ is always an eigenvalue, its eigenvector (scaled to sum to 1) is the **steady state**, and the next-largest $|\lambda|$ sets how fast the chain forgets where it started. The same eigenvectors, for a second-order law $\mathbf x'' = -K\mathbf x$, are the **normal modes** of coupled oscillators — taken up in [DE-4.5](#/lesson/math2280.DE-4.5).`,
  symbols: [
    { tex: t`\mathbf x_k`, text: t`the state after $k$ steps (populations, amounts, or probabilities)` },
    { tex: 'A', text: t`the fixed $n\times n$ matrix of one step: $\mathbf x_{k+1} = A\mathbf x_k$` },
    { tex: t`\lambda_i,\ \mathbf v_i`, text: t`eigenvalues and eigenvectors of $A$, numbered so that $|\lambda_1| \ge |\lambda_2| \ge \dots$` },
    { tex: t`c_i`, text: t`the coordinates of $\mathbf x_0$ in the eigenvector basis: $\mathbf x_0 = \sum c_i\mathbf v_i$ (LA-7.1)` },
    { tex: 'k', text: 'the number of steps taken (years, letters, days…)' },
  ],
  why: 'Google’s PageRank, the long-run makeup of a population, the steady state of a stochastic model in statistical mechanics and the stability of a numerical method all come down to the dominant eigenvalue and its eigenvector.',
  visual: {
    type: 'graph',
    title: 'The dominant eigenvalue takes over',
    lead: t`$A$ stretches the direction $\mathbf v_1 = (2, 1)$ by $\lambda_1$ (choose it below) and $\mathbf v_2 = (-1, 1)$ by $0.6$ each step. Slide $k$ to add the iterates $\mathbf x_1, \mathbf x_2, \dots$ one at a time, and move the start $\mathbf x_0$ with the other sliders.`,
    tasks: [
      'With λ₁ = 1.1, slide k up: whatever the start, the iterates swing round onto the v₁ line and then march out along it.',
      'Start exactly on the v₂ line, (−1, 1): the iterates stay on it and shrink to 0 — c₁ = 0, so the dominant mode is never excited.',
      'Switch λ₁ to 0.9: now both modes decay, and the points still approach the v₁ direction on their way into the origin.',
    ],
    params: {
      x: [-4.4, 4.4], y: [-2.2, 2.2], aspect: 'wide', equal: true, xlabel: '', ylabel: '',
      choices: [{ key: 'l1', label: t`Dominant eigenvalue $\lambda_1$`, options: [[1.1, '1.1 (grows)'], [0.9, '0.9 (decays)']], value: 1.1, explain: t`The stretch factor along $\mathbf v_1$ per step.` }],
      sliders: [
        { key: 'k', label: t`Steps shown, $k$`, min: 0, max: 14, step: 1, value: 3, explain: 'How many iterates to draw.' },
        { key: 'p', label: t`Start: first component of $\mathbf x_0$`, min: -2, max: 2, step: 0.25, value: -1.5, explain: t`Moves the starting point $\mathbf x_0$ left and right.` },
        { key: 'q', label: t`Start: second component of $\mathbf x_0$`, min: -2, max: 2, step: 0.25, value: 1.75, explain: t`Moves $\mathbf x_0$ up and down.` },
      ],
      curves: [
        { param: ['2*t', 't'], t: [-3, 3], color: 'violet', dash: [7, 5], label: 'v₁ line', labelAt: 1.9 },
        { param: ['-t', 't'], t: [-3, 3], color: 'teal', dash: [7, 5], label: 'v₂ line', labelAt: 1.7 },
      ],
      points: [
        { x: 'p', y: 'q', color: 'good', r: 6, label: 'x₀' },
        ...Array.from({ length: 14 }, (_, i) => ({ x: X(i + 1), y: Y(i + 1), color: 'gold', r: 4.5, when: `step(k - ${i + 1})` })),
      ],
      readouts: [
        { label: t`$\mathbf x_k$, first component`, expr: `${c1}*l1^k*2 - ${c2}*0.6^k`, digits: 3 },
        { label: t`second component`, expr: `${c1}*l1^k + ${c2}*0.6^k`, digits: 3 },
      ],
    },
    caption: 'Green: the start x₀; gold: x₁ … xₖ. Dashed: the two eigenvector lines. The matrix is A = P diag(λ₁, 0.6) P⁻¹ with P’s columns v₁ and v₂.',
  },
  example: {
    prompt: t`In 1913 Andrey Markov counted the first 20 000 letters of Pushkin's *Eugene Onegin*: 8 638 vowels and 11 362 consonants. A vowel was followed by a vowel with probability $0.128$; a consonant was followed by a vowel with probability $0.663$. Treat the letters as a two-state chain. What fraction of letters does it predict are vowels in the long run, and how fast does it forget the first letter?`,
    visual: {
      type: 'graph',
      params: {
        x: [-0.5, 8.5], y: [0, 1.05], aspect: 'wide', xlabel: 'letters after a vowel, k', ylabel: 'P(vowel)',
        curves: [{ fn: '0.432 + 0.568*(-0.535)^x', domain: [0, 8], color: 'ink4', dash: [3, 4] }],
        points: Array.from({ length: 9 }, (_, k) => ({ x: k, y: 0.4319 + 0.5681 * (-0.535) ** k, color: 'gold', r: 5 })),
        hlines: [{ y: 0.432, label: 'steady state 0.432', color: 'good' }],
      },
      caption: 'The chance that the k-th letter after a vowel is a vowel, from the chain: it overshoots and undershoots (λ₂ < 0) and settles at the steady state within a few letters. (The dashed curve only joins the points.)',
    },
    steps: [
      { label: 'The matrix', text: t`Order the states (vowel, consonant); column $j$ holds the chances of the next letter given the current one is state $j$: $P = ${decTeX([[0.128, 0.663], [0.872, 0.337]])}$. Each column sums to 1.` },
      { label: 'Steady state', text: t`Solve $P\mathbf q = \mathbf q$, i.e. $(P - I)\mathbf q = \mathbf 0$: the first row gives $-0.872\,q_v + 0.663\,q_c = 0$. With $q_v + q_c = 1$: $q_v = \dfrac{0.663}{0.663 + 0.872} = 0.432$.` },
      { label: 'Compare', text: t`Markov's count: $8\,638/20\,000 = 0.432$. ✓ The chain reproduces the vowel fraction from the pair statistics alone.` },
      { label: 'Forgetting', text: t`The other eigenvalue is $\lambda_2 = \operatorname{tr}P - 1 = 0.128 + 0.337 - 1 = -0.535$. The memory of the starting letter shrinks by $|\lambda_2|$ per letter — to under 5% after five letters — and the minus sign makes it alternate: vowels and consonants tend to take turns.` },
      { label: 'Meaning', text: t`If letters were independent, a vowel would follow a vowel 43% of the time; Markov found 12.8%. That dependence was his point: the law of large numbers still holds for dependent events, which founded the theory of Markov chains.` },
    ],
    answer: t`$\mathbf q = (0.432, 0.568)$: about 43% vowels in the long run; the second eigenvalue $-0.535$ means the chain forgets its start within a few letters.`,
  },
  practice: [
    num({
      id: 'dominant', difficulty: 1,
      gen(r) {
        const lams = r.pick([[3, 1], [2, -1], [4, 2], [3, -2], [2, 1], [5, 1]]);
        const { A } = withEigen(r, lams);
        return {
          prompt: t`$\mathbf x_{k+1} = A\mathbf x_k$ with $A = ${matTeX(A)}$, and $\mathbf x_0$ is a typical starting vector. For large $k$, by what factor does $\mathbf x_k$ grow each step?`,
          answer: lams[0], tol: { rel: 0, abs: 0.01 },
          errors: [{ value: trace(A), feedback: 'That is the trace, the sum of the eigenvalues. Only the largest one matters in the long run.' }, { value: lams[1], feedback: 'That is the smaller eigenvalue; its mode is soon swamped.' }].filter((e) => e.value !== lams[0] && e.value !== -lams[0]),
          hints: [t`Find the eigenvalues: $\lambda^2 - ${trace(A) < 0 ? `(${trace(A)})` : trace(A)}\lambda + ${det2(A) < 0 ? `(${det2(A)})` : det2(A)} = 0$.`, t`In $\mathbf x_k = c_1\lambda_1^k\mathbf v_1 + c_2\lambda_2^k\mathbf v_2$, the term with the larger $|\lambda|$ dominates.`],
          teach: t`In the long run $\mathbf x_k$ grows by the dominant eigenvalue each step and lines up with its eigenvector.`,
          explain: t`The eigenvalues are $${lams[0]}$ and $${lams[1]}$. Since $|${lams[0]}| > |${lams[1]}|$, $\mathbf x_k \approx c_1(${lams[0]})^k\mathbf v_1$: growth by a factor $${lams[0]}$ per step (as long as $c_1 \ne 0$).`,
          visual: map2d(A, { eigen: true, view: 2.6, caption: 'A with its eigenvector lines and eigenvalues: repeated application pulls every vector toward the line with the larger stretch.' }),
        };
      },
    }),
    num({
      id: 'steady2', difficulty: 2,
      gen(r) {
        const a = r.pick([0.1, 0.2, 0.25, 0.3, 0.4]), b = r.pick([0.05, 0.1, 0.15, 0.3, 0.5]), q1 = b / (a + b);
        return {
          prompt: t`A two-state Markov chain moves from state 1 to state 2 with probability $${a}$ per step, and from state 2 to state 1 with probability $${b}$: $P = ${decTeX([[1 - a, b], [a, 1 - b]])}$. In the steady state, what fraction of the time is it in state 1?`,
          answer: q1, tol: { rel: 0.003 },
          errors: [{ value: a / (a + b), feedback: 'Swapped: the chain spends more time in the state that is harder to leave. State 1 is left with probability a, so its share is b/(a + b).' }].filter((e) => Math.abs(e.value - q1) > 0.005),
          hints: [t`Solve $P\mathbf q = \mathbf q$ with $q_1 + q_2 = 1$.`, t`The first row says $(1 - ${a})q_1 + ${b}\,q_2 = q_1$, i.e. $${a}\,q_1 = ${b}\,q_2$: the flow out of state 1 balances the flow in.`],
          teach: 'At the steady state the probability flowing out of each state equals the probability flowing in.',
          explain: t`$${a}\,q_1 = ${b}\,q_2$ and $q_1 + q_2 = 1$ give $q_1 = \dfrac{${b}}{${a} + ${b}} = ${nice(q1)}$. This is the eigenvector of $P$ for $\lambda = 1$, scaled so its entries add to 1.`,
          visual: chainPic(a, b),
        };
      },
    }),
    mcq({
      id: 'why-one', difficulty: 2,
      prompt: t`Why is $\lambda = 1$ an eigenvalue of every Markov matrix $P$ (nonnegative entries, every column summing to 1)?`,
      choices: [
        t`Because $(1, 1, \dots, 1)P = (1, 1, \dots, 1)$: the all-ones row is a left eigenvector with eigenvalue 1, and $P^{\mathsf T}$ has the same eigenvalues as $P$`,
        t`Because every entry of $P$ is at most 1`,
        t`Because $\det P = 1$`,
        t`Because a Markov matrix is always symmetric`,
      ],
      answer: 0,
      why: {
        1: t`Entries at most 1 do not force an eigenvalue of 1: $${decTeX([[0.5, 0], [0, 0.5]])}$ has none.`,
        2: t`The determinant is the product of all the eigenvalues; for Markov's letter chain it is $0.128(0.337) - 0.663(0.872) = -0.535$.`,
        3: 'Most are not: the chance of moving from 1 to 2 rarely equals that from 2 to 1.',
      },
      hints: ['Column sums equal to 1 is a statement about the all-ones vector multiplying P from the left.', t`$\det(P - \lambda I) = \det(P - \lambda I)^{\mathsf T} = \det(P^{\mathsf T} - \lambda I)$.`],
      teach: 'Columns summing to 1 make the all-ones vector an eigenvector of Pᵀ with eigenvalue 1, so 1 is an eigenvalue of P.',
      explain: t`Each column sums to 1, so $\mathbf 1^{\mathsf T}P = \mathbf 1^{\mathsf T}$, i.e. $P^{\mathsf T}\mathbf 1 = \mathbf 1$. A matrix and its transpose have the same characteristic polynomial, so 1 is an eigenvalue of $P$ too. Its eigenvector is the steady state; for a chain where every state can reach every other (with some power of $P$ all positive), it is unique and the other eigenvalues have $|\lambda| < 1$ (the Perron–Frobenius theorem).`,
      visual: chainPic(0.872, 0.663, { names: ['V', 'C'], caption: 'Markov’s chain: V = vowel, C = consonant. The two probabilities leaving each state (including staying) add to 1.' }),
    }),
    num({
      id: 'rate', difficulty: 2,
      gen(r) {
        const a = r.pick([0.1, 0.2, 0.3, 0.6]), b = r.pick([0.1, 0.2, 0.4, 0.5]), l2 = 1 - a - b;
        return {
          prompt: t`For the chain $P = ${decTeX([[1 - a, b], [a, 1 - b]])}$, the distance from the steady state is multiplied by the second eigenvalue $\lambda_2$ every step. Find $\lambda_2$.`,
          answer: l2, tol: { rel: 0.003, abs: 0.002 },
          errors: [{ value: 1 - a * b, feedback: t`Use the trace: $\lambda_1 + \lambda_2 = \operatorname{tr}P$, with $\lambda_1 = 1$.` }].filter((e) => Math.abs(e.value - l2) > 0.005),
          hints: [t`One eigenvalue is 1. The two add up to $\operatorname{tr}P = ${nice(2 - a - b)}$.`],
          teach: 'For a 2-state chain the second eigenvalue is tr P − 1; its size sets how fast the chain forgets its start.',
          explain: t`$\lambda_2 = \operatorname{tr}P - 1 = ${nice(2 - a - b)} - 1 = ${nice(l2)}$. ${l2 < 0 ? 'Negative: the deviation flips sign each step while it shrinks.' : 'Positive: the deviation shrinks steadily.'} After 10 steps it has shrunk by $|\lambda_2|^{10} = ${tex(Math.abs(l2) ** 10)}$.`,
          visual: chainPic(a, b),
        };
      },
    }),
    mcq({
      id: 'modes', difficulty: 2,
      prompt: t`Two equal masses $m$ joined to two walls and to each other by three equal springs $k$ obey $\mathbf x'' = -\tfrac km K\mathbf x$ with $K = ${matTeX([[2, -1], [-1, 2]])}$. $K$ has eigenvector $(1, 1)$ with eigenvalue 1 and $(1, -1)$ with eigenvalue 3. Which motion has the higher frequency?`,
      choices: [
        t`The out-of-phase mode $(1, -1)$, with $\omega = \sqrt{3k/m}$`,
        t`The in-phase mode $(1, 1)$, with $\omega = \sqrt{3k/m}$`,
        'Both have the same frequency, because the masses are equal',
        t`The out-of-phase mode, with $\omega = 3\sqrt{k/m}$`,
      ],
      answer: 0,
      why: {
        1: t`In phase, the middle spring is never stretched: only the wall springs act, so $\omega^2 = k/m$, the eigenvalue 1.`,
        2: 'Equal masses give equal amplitudes in each mode, not equal frequencies: the two modes stretch the middle spring differently.',
        3: t`The eigenvalue is $\omega^2$ (in units of $k/m$), so $\omega = \sqrt{3k/m}$, not $3\sqrt{k/m}$.`,
      },
      hints: [t`Try $\mathbf x = \mathbf v\cos\omega t$: then $\omega^2\mathbf v = \tfrac km K\mathbf v$, so each eigenvalue of $K$ gives $\omega^2$ in units of $k/m$.`],
      teach: 'Normal modes are eigenvectors of the stiffness matrix; each eigenvalue gives the square of a mode’s frequency.',
      explain: t`Out of phase, the middle spring is squeezed and stretched twice as hard, adding stiffness: $\omega^2 = 3k/m$. [DE-4.5](#/lesson/math2280.DE-4.5) develops normal modes fully — beats, the CO₂ molecule, energy sharing.`,
      visual: { type: 'de-modes', params: { system: 'pair', k: 10, kc: 10, controls: [], start: 'one', readout: false, energy: false }, caption: 'Two masses between walls, joined by equal springs. Started with one mass pulled aside, the motion is a mix of the two modes. Displacements exaggerated.' },
    }),
    num({
      id: 'leslie', difficulty: 3,
      gen(r) {
        const f = r.pick([1.5, 2, 3]), s = r.pick([0.3, 0.4, 0.5]), a = r.pick([0.4, 0.5, 0.8]);
        const lam = (a + Math.sqrt(a * a + 4 * f * s)) / 2;
        const J = [10], Ad = [10];
        for (let k = 0; k < 10; k++) { J.push(f * Ad[k]); Ad.push(s * J[k] + a * Ad[k]); }
        return {
          prompt: t`A seabird population is counted each year as juveniles $J$ and adults $A$. Each adult raises $${f}$ juveniles a year, a fraction $${s}$ of juveniles survive to become adults, and a fraction $${a}$ of adults survive: $\begin{bmatrix} J \\ A \end{bmatrix}_{k+1} = ${decTeX([[0, f], [s, a]])}\begin{bmatrix} J \\ A \end{bmatrix}_k$. What is the long-run growth factor per year? Give 3 significant figures.`,
          answer: lam, tol: { rel: 0.003 },
          errors: [{ value: f * s + a, feedback: 'Adding the rates is not an eigenvalue. Solve the characteristic equation λ² − aλ − fs = 0.' }, { value: (a - Math.sqrt(a * a + 4 * f * s)) / 2, feedback: 'That is the negative root. The dominant eigenvalue is the larger one.' }].filter((e) => Math.abs(e.value - lam) > 0.01 * lam),
          hints: [t`$\det\begin{bmatrix} -\lambda & ${f} \\ ${s} & ${a} - \lambda \end{bmatrix} = \lambda^2 - ${a}\lambda - ${nice(f * s)} = 0$.`, t`$\lambda = \tfrac12\big(${a} + \sqrt{${nice(a * a)} + ${nice(4 * f * s)}}\big)$.`],
          teach: 'A population model’s long-run growth rate is the dominant eigenvalue of its matrix.',
          explain: t`$\lambda_1 = \tfrac12\big(${a} + \sqrt{${nice(a * a + 4 * f * s)}}\big) = ${nice(lam, 4)}$: the population ${lam > 1 ? `grows about ${Math.round((lam - 1) * 100)}% a year` : `shrinks about ${Math.round((1 - lam) * 100)}% a year`} once the age structure settles along the eigenvector. Ecologists call such stage-structured matrices Leslie or Lefkovitch matrices; the numbers here are illustrative.`,
          visual: {
            type: 'graph',
            params: {
              x: [-0.5, 10.5], y: [0, Math.max(...J, ...Ad) * 1.1], aspect: 'wide', xlabel: 'year', ylabel: 'count',
              points: [...J.map((v, k) => ({ x: k, y: v, color: 'accent', r: 4 })), ...Ad.map((v, k) => ({ x: k, y: v, color: 'warn', r: 4 }))],
              legend: [{ label: 'juveniles', color: 'accent', point: true }, { label: 'adults', color: 'warn', point: true }], legendAt: 'tl',
            },
            caption: 'Ten years of the model starting from 10 juveniles and 10 adults: after some early wobbles the two counts settle into a fixed ratio.',
          },
        };
      },
    }),
    code({
      id: 'markov-power', difficulty: 3,
      prompt: t`A ground-station link is **up**, **degraded** or **down**; from hour to hour it moves between them with the probabilities in \`P\` (column $j$: from state $j$; illustrative numbers). Write \`power_iteration(P, x0, tol)\` that repeats $\mathbf x \leftarrow P\mathbf x$ until no entry changes by more than \`tol\`, returning the final vector and the number of steps. Then get the same steady state from \`np.linalg.eig\`: \`q_eig\`, the eigenvector for the eigenvalue closest to 1, scaled to sum to 1, and \`lam2\`, the second-largest $|\lambda|$.`,
      starter: t`import numpy as np

P = np.array([[0.90, 0.30, 0.20],
              [0.07, 0.60, 0.30],
              [0.03, 0.10, 0.50]])

def power_iteration(P, x0, tol=1e-10, max_steps=10000):
    x = np.array(x0, dtype=float)
    # repeat x <- P @ x until the largest change is below tol; count the steps
    return x, 0

q, steps = power_iteration(P, [1.0, 0.0, 0.0])
q_eig = None    # from np.linalg.eig: eigenvector for the eigenvalue closest to 1, scaled to sum to 1
lam2 = None     # the second-largest |eigenvalue|
`,
      answer: t`import numpy as np

P = np.array([[0.90, 0.30, 0.20],
              [0.07, 0.60, 0.30],
              [0.03, 0.10, 0.50]])

def power_iteration(P, x0, tol=1e-10, max_steps=10000):
    x = np.array(x0, dtype=float)
    for n in range(1, max_steps + 1):
        x_new = P @ x
        if np.max(np.abs(x_new - x)) < tol:
            return x_new, n
        x = x_new
    return x, max_steps

q, steps = power_iteration(P, [1.0, 0.0, 0.0])
vals, vecs = np.linalg.eig(P)
k = np.argmin(np.abs(vals - 1))
v = np.real(vecs[:, k])
q_eig = v / v.sum()
lam2 = sorted(np.abs(vals))[-2]
print(q, steps)
print(q_eig, lam2)`,
      tests: [
        { name: t`$\mathbf q$ is a steady state: $P\mathbf q = \mathbf q$`, code: 'np.allclose(P @ q, q, atol=1e-8)' },
        { name: 'q is a probability vector (sums to 1)', code: 'abs(q.sum() - 1) < 1e-9 and (q >= 0).all()' },
        { name: 'the link is up about 73.0% of the time', code: 'abs(q[0] - 0.72961) < 1e-4' },
        { name: 'eig gives the same steady state, scaled to sum to 1', code: 'q_eig is not None and np.allclose(q_eig, q, atol=1e-7)' },
        { name: t`the second eigenvalue: $|\lambda_2| \approx 0.630$`, code: 'lam2 is not None and abs(lam2 - 0.63038) < 1e-4' },
        { name: 'the iteration stopped after a sensible number of steps (between 20 and 200)', code: '20 <= steps <= 200' },
      ],
      hints: ['Inside a loop: `x_new = P @ x`; if `np.max(np.abs(x_new - x)) < tol`, return `x_new` and the step count; otherwise `x = x_new`.', '`vals, vecs = np.linalg.eig(P)`; `k = np.argmin(np.abs(vals - 1))`; `v = np.real(vecs[:, k])`; `q_eig = v / v.sum()` (eig returns unit-length vectors, possibly with a minus sign — dividing by the sum fixes both).'],
      teach: 'Power iteration finds the dominant eigenvector by just applying the matrix; its speed is set by |λ₂|.',
      explain: t`Both routes give $\mathbf q \approx (0.730, 0.189, 0.082)$: up 73% of the time. Each step shrinks the error by about $|\lambda_2| \approx 0.63$, so reaching $10^{-10}$ takes roughly $\ln 10^{-10}/\ln 0.63 \approx 50$ steps — the iteration count you see. Power iteration needs only matrix–vector products, which is why it scales to enormous sparse matrices: Google's original PageRank was a power iteration on the web's link matrix.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-steady', difficulty: 2,
      gen(r) {
        const a = r.pick([0.05, 0.1, 0.2, 0.3]), b = r.pick([0.2, 0.4, 0.6, 0.15]), q2 = a / (a + b);
        return {
          prompt: t`For the Markov matrix $P = ${decTeX([[1 - a, b], [a, 1 - b]])}$, what is the steady-state probability of state 2?`,
          answer: q2, tol: { rel: 0.003 },
          hints: [t`Balance the flows: $${a}\,q_1 = ${b}\,q_2$, with $q_1 + q_2 = 1$.`],
          teach: 'The steady state is the eigenvector for λ = 1, scaled to sum to 1.',
          explain: t`$q_2 = \dfrac{${a}}{${a} + ${b}} = ${nice(q2)}$.`,
          visual: chainPic(a, b),
        };
      },
    }),
    num({
      id: 'cp-safe-mode', difficulty: 3, transfer: true,
      gen(r) {
        const a = r.pick([0.01, 0.02, 0.03, 0.05]), b = r.pick([0.2, 0.25, 0.4, 0.5]), pct = (100 * a) / (a + b);
        return {
          prompt: t`A satellite in a constellation is either operating normally or in **safe mode** (a protective state after a fault). Each day a normal satellite drops into safe mode with probability $${a}$, and a satellite in safe mode is recovered by ground controllers with probability $${b}$. (Illustrative rates.) Over a long time, what percentage of satellite-days are spent in safe mode?`,
          answer: pct, tol: { rel: 0.005 },
          errors: [{ value: (100 * b) / (a + b), feedback: 'That is the share of time spent operating normally.' }, { value: 100 * a, feedback: 'That is the daily chance of entering safe mode, not the fraction of time spent there: recovery takes several days on average.' }].filter((e) => Math.abs(e.value - pct) > 0.01 * pct),
          hints: [t`Set up $P = ${decTeX([[1 - a, b], [a, 1 - b]])}$ with states (normal, safe) and find the steady state.`, t`Balance: $${a}\,q_{\text{normal}} = ${b}\,q_{\text{safe}}$.`],
          teach: 'A two-state availability model is a Markov chain whose steady state gives the long-run fraction of time in each state.',
          explain: t`$q_{\text{safe}} = \dfrac{${a}}{${a} + ${b}} = ${nice(pct / 100)}$, i.e. $${nice(pct)}\%$ of the time. The mean stay in safe mode is $1/${b} = ${nice(1 / b)}$ days and the mean time between faults $1/${a} = ${nice(1 / a)}$ days, and the fraction is their ratio to the cycle — the same answer reliability engineers call unavailability.`,
          visual: chainPic(a, b, { names: ['OK', 'SAFE'] }),
        };
      },
    }),
    mcq({
      id: 'cp-long-run', difficulty: 2,
      prompt: t`$\mathbf x_{k+1} = A\mathbf x_k$, where $A$ has eigenvalue $0.9$ with eigenvector $\mathbf v_1$ and $1.1$ with eigenvector $\mathbf v_2$. For a typical start $\mathbf x_0$ (with nonzero components along both), what happens as $k \to \infty$?`,
      choices: [
        t`$\mathbf x_k$ grows without bound and turns toward the direction of $\mathbf v_2$`,
        t`$\mathbf x_k \to \mathbf 0$, because one eigenvalue is less than 1`,
        t`$\mathbf x_k$ turns toward $\mathbf v_1$, because it is listed first`,
        t`$\mathbf x_k$ settles at a fixed nonzero vector`,
      ],
      answer: 0,
      why: {
        1: t`The $0.9^k$ part dies away, but the $1.1^k$ part grows: both are present.`,
        2: 'The order of listing means nothing; size does. |1.1| > |0.9|.',
        3: t`A fixed nonzero limit needs an eigenvalue of exactly 1 (as in a Markov chain).`,
      },
      hints: [t`$\mathbf x_k = c_1(0.9)^k\mathbf v_1 + c_2(1.1)^k\mathbf v_2$.`],
      teach: 'The eigenvalue of largest size controls the long run: growth if it exceeds 1, and alignment with its eigenvector.',
      explain: t`$0.9^k \to 0$ while $1.1^k \to \infty$, so $\mathbf x_k \approx c_2(1.1)^k\mathbf v_2$: unbounded growth along $\mathbf v_2$.`,
      visual: map2d([[1, 0.1], [0.1, 1]], { eigen: true, view: 2.4, caption: 'A matrix of this kind: [[1, 0.1], [0.1, 1]], with eigenvalues 1.1 and 0.9 on its two eigenvector lines.' }),
    }),
  ],
  sources: [
    { label: 'Strang, Introduction to Linear Algebra (6th ed.), §6.2 and §10.3 (Markov matrices)', url: 'https://math.mit.edu/~gs/linearalgebra/ila6/indexila6.html' },
    { label: 'A. A. Markov (1913), An example of statistical investigation of the text Eugene Onegin, English translation in Science in Context 19 (2006) 591–600', url: 'https://doi.org/10.1017/S0269889706001074' },
    { label: 'B. Hayes, First links in the Markov chain, American Scientist 101 (2013) 92–97', url: 'https://www.americanscientist.org/article/first-links-in-the-markov-chain' },
  ],
});
