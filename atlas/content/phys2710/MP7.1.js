// The wave function and probability — Born's rule: |ψ|² is a probability
// density, so ∫|ψ|²dx over a region is the chance of finding the particle
// there, and the total must be 1 (normalisation). The Schrödinger equation
// evolves ψ; a stationary state ψ(x)e^{−iEt/ħ} has a frozen |ψ|². Worked
// example: normalising x(L − x). Detector counts, a delta-well tail, and
// rubidium atoms in NASA's Cold Atom Lab. Every number is computed here.
import { lesson, mcq, num, code } from '../../src/core/content.js';
import { fmt, tex } from '../../src/core/format.js';
import { HBAR } from './_constants.js';
import { U_KG, erf, samples, well, density, boxProbFn, r6, label } from './_schrodinger.js';
import * as S from '../../src/viz/model/mp-schrodinger.js';

const t = String.raw;
const M_RB87 = 86.909180531 * U_KG;                // kg, rubidium-87 (AME2020)

/** Detector hits along a box: |ψ₂|² with the positions where 120 particles were found. */
const hits = (() => {
  const xs = samples((x) => 2 * Math.sin(2 * Math.PI * x) ** 2, 0, 1, 120, 11);
  return {
    type: 'graph',
    params: {
      x: [-0.05, 1.05], y: [-0.52, 2.3], aspect: 'wide', xlabel: 'x / L', ylabel: '|ψ|² (units of 1/L)', axesAt: 'edge',
      curves: [{ fn: boxProbFn(2), domain: [0, 1], color: 'accent', width: 2.4 }],
      shade: [{ fn: boxProbFn(2), from: 0, to: 1, color: 'accent', alpha: 0.14 }],
      points: xs.map((x, i) => ({ x: r6(x), y: r6(-0.12 - 0.13 * (i % 3)), r: 2.6, color: 'gold' })),
    },
    caption: 'The probability density of one state of a particle in a box (blue), and where 120 identically prepared particles were each found (gold dots, one per particle, staggered in three rows to be seen). Each detection finds the whole particle at one place; the dots crowd where |ψ|² is large. The positions are a random draw from |ψ|².',
  };
})();

/** Re Ψ(x, t) = ψ(x) cos(Et/ħ) of a stationary state at several moments, with |Ψ|² that never moves. */
const standing = {
  type: 'graph',
  params: {
    x: [0, 1], y: [-1.6, 2.2], aspect: 'wide', xlabel: 'x / L', ylabel: '', yticks: 0, axesAt: 'edge',
    curves: [
      ...[1, 0.5, -0.3, -0.85].map((c, i) => ({ fn: `${c}*sqrt(2)*sin(pi*x)`, color: 'violet', width: 1.3, ...(i % 2 ? { dash: [4, 4] } : {}) })),
      { fn: boxProbFn(1), color: 'accent', width: 2.6 },
    ],
    points: [label(0.5, 2, '|Ψ|², the same at every moment', 'accent', 0, -12, 'center'), label(0.5, -1.2, 'Re Ψ at four moments', 'violet', 0, -14, 'center')],
  },
  caption: t`A stationary state: the real part of $\Psi = \psi(x)e^{-iEt/\hbar}$ swings up and down in place (violet, four moments), while its probability density (blue) stays fixed. Scales are arbitrary.`,
};

/** ψ = A sin(πx/L) and |ψ|² = A² sin²(πx/L): the two areas a student might confuse. */
const twoAreas = {
  type: 'graph',
  params: {
    x: [-0.05, 1.05], y: [0, 1.25], aspect: 'wide', xlabel: 'x / L', ylabel: '', yticks: 0, axesAt: 'edge',
    curves: [{ fn: 'sin(pi*x)', domain: [0, 1], color: 'violet', width: 2.2, label: 'ψ / A = sin(πx/L)', labelAt: 0.5, labelDy: -12, labelAlign: 'center' }, { fn: 'sin(pi*x)^2', domain: [0, 1], color: 'accent', width: 2.2, label: '|ψ|²/A² = sin²(πx/L)', labelAt: 0.78, labelDx: 6 }],
    shade: [{ fn: 'sin(pi*x)^2', from: 0, to: 1, color: 'accent', alpha: 0.18 }],
  },
  caption: 'A box state and its square. The area under sin² (shaded) is L/2; the area under sin is 2L/π.',
};

/** Four candidate wave functions on the whole x-axis. */
const candidates = {
  type: 'graph',
  params: {
    x: [-3, 3], y: [-2.2, 3], aspect: 'wide', xlabel: 'x', ylabel: '', axesAt: 'edge',
    curves: [
      { fn: 'exp(-x^2/2)', color: 'accent', width: 2.4 },
      { fn: 'exp(-x)', color: 'warn', width: 2 },
      { fn: 'sin(2x)', color: 'violet', width: 1.8 },
      { fn: '0.3/x', domain: [0.08, 3], color: 'good', width: 1.8 }, { fn: '0.3/x', domain: [-3, -0.08], color: 'good', width: 1.8 },
    ],
    legend: [{ label: 'e^(−x²/2)', color: 'accent' }, { label: 'e^(−x)', color: 'warn' }, { label: 'sin 2x', color: 'violet' }, { label: '1/x', color: 'good' }],
    legendAt: 'tr',
  },
  caption: 'Four functions, each multiplied by a constant to fit on one set of axes. Only the region shown is drawn; all four continue along the whole axis.',
};

/** The Gaussian ground state of an atom in a harmonic trap, with ±d shaded. */
const trap = (b, d) => density({
  fn: `exp(-x^2/${r6(b * b)})/(sqrt(pi)*${r6(b)})`, x: [r6(-3.2 * b), r6(3.2 * b)], y: [0, r6(1.25 / (Math.sqrt(Math.PI) * b))], shade: [-d, d],
  xlabel: 'distance from the trap centre x (μm)', ylabel: '|ψ|² (μm⁻¹)',
  caption: t`The ground state of one rubidium atom in a harmonic trap: $|\psi|^2$ is a Gaussian. Shaded: within ${d} μm of the centre. Interactions between the atoms of a real condensate widen the cloud; this is one atom alone.`,
});

/** |ψ|² = e^{−2|x|/a}/a for the bound state of a very narrow well, with x > b shaded. */
const cusp = (a, b) => density({
  fn: `exp(-2*abs(x)/${a})/${a}`, x: [r6(-4 * a), r6(4 * a)], y: [0, r6(1.18 / a)], shade: b === null ? null : [b, r6(4 * a)],
  caption: t`The probability density of a particle bound to a very narrow, deep well at $x = 0$: it falls off exponentially on both sides.${b === null ? '' : ` Shaded: beyond $x = ${b}$ nm (the tail continues past the edge of the picture).`}`,
});

export default lesson({
  id: 'phys2710.MP7.1',
  title: 'The wave function and probability',
  minutes: 13, difficulty: 2,
  intro: t`A matter wave is described by a **wave function** $\psi(x, t)$: a complex number at every place and time. The wave itself is never observed. What is observed is the particle — whole, at one place — and Max Born’s rule (1926) says how often each place turns up: $|\psi|^2$ is a **probability density**, so

$$P(a \le x \le b) = \int_a^b |\psi(x,t)|^2\,dx, \qquad \int_{-\infty}^{\infty} |\psi(x,t)|^2\,dx = 1$$

The second condition — **normalisation** — says the particle is certainly somewhere. How $\psi$ changes in time is set by the Schrödinger equation, $i\hbar\,\partial\psi/\partial t = -\frac{\hbar^2}{2m}\,\partial^2\psi/\partial x^2 + V(x)\,\psi$. Its **stationary states**, $\psi(x)\,e^{-iEt/\hbar}$, have a definite energy $E$ and a probability density that never changes: they are what the rest of this module finds.

> Matter waves and packets were [Wave packets](#/lesson/phys2710.MP6.2) and [the uncertainty principle](#/lesson/phys2710.MP6.3).`,
  symbols: [
    { tex: '\\psi(x, t)', text: t`the wave function: a complex amplitude at each position $x$ and time $t$; in one dimension its units are $\text{m}^{-1/2}$` },
    { tex: '|\\psi|^2', text: t`$\psi^*\psi$, the probability per unit length of finding the particle near $x$ ($\psi^*$ is the complex conjugate); units $\text{m}^{-1}$` },
    { tex: 'P(a \\le x \\le b)', text: t`the probability (a pure number from 0 to 1) that a position measurement finds the particle between $a$ and $b$` },
    { tex: '\\hbar', text: t`$h/2\pi = 1.055\times10^{-34}$ J s` },
    { tex: 'm', text: 'the particle’s mass, in kg' },
    { tex: 'V(x)', text: 'the particle’s potential energy at position x, in J or eV' },
    { tex: 'E', text: 'the energy of a stationary state, in J or eV' },
  ],
  why: 'Every prediction quantum mechanics makes — where an electron lands, how often a nucleus decays, how much current crosses a transistor — is an integral of |ψ|².',
  visual: {
    type: 'mp-schrodinger',
    title: 'Probability is area under |ψ|²',
    lead: t`A particle in a box 1 nm wide. Top: its energy levels. Bottom: the chosen state’s $\psi$ (violet) and $|\psi|^2$ (blue). The gold window’s area is the probability of finding the particle between $a$ and $b$ — read it below the picture.`,
    tasks: [
      'Stretch the window over the whole box: P = 1.000 for every state. That is normalisation.',
      'Window on the middle third: P is about 0.61 for n = 1, but only about 0.20 for n = 2, whose ψ has a node at the centre.',
      'Raise n to 8: the humps crowd together and the middle third’s share heads for 1/3 — the classical answer for a ball bouncing between the walls.',
    ],
    params: { mode: 'bound', well: 'infinite', L: 1, n: 1, show: 'both', window: [0.333, 0.667], controls: ['n', 'show', 'window'] },
  },
  example: {
    prompt: t`A rough model of a particle trapped between walls at $x = 0$ and $x = L$ is $\psi(x) = A\,x(L - x)$ inside and $\psi = 0$ outside. Find $A$, then the probability of finding the particle in the left quarter, $0 \le x \le L/4$.`,
    visual: {
      type: 'graph',
      params: {
        x: [-0.04, 1.04], y: [0, 2.2], aspect: 'wide', xlabel: 'x / L', ylabel: '|ψ|² (units of 1/L)', axesAt: 'edge',
        curves: [{ fn: '30*x^2*(1-x)^2', domain: [0, 1], color: 'accent', width: 2.4, label: '30x²(1 − x)²', labelAt: 0.62, labelDx: 8, labelDy: -8 }, { fn: boxProbFn(1), domain: [0, 1], color: 'ink3', width: 1.4, dash: [5, 4], label: 'dashed: the exact ground state, 2 sin²πx', labelAt: 0.3, labelDx: -12, labelDy: -10, labelAlign: 'right' }],
        shade: [{ fn: '30*x^2*(1-x)^2', from: 0, to: 0.25, color: 'gold', alpha: 0.5 }],
      },
      caption: 'The model’s |ψ|² (blue) beside the exact ground state of a box (dashed), with the left quarter shaded. Lengths in units of L.',
    },
    steps: [
      { label: 'Why normalise', text: t`$\psi$ as written is only a shape. The rule $\int|\psi|^2dx = 1$ fixes its size, and only then do areas under $|\psi|^2$ mean probabilities.` },
      { label: 'Integrate the square', text: t`$\displaystyle\int_0^L A^2x^2(L-x)^2\,dx = A^2\int_0^L (L^2x^2 - 2Lx^3 + x^4)\,dx = A^2\left(\frac{L^5}{3} - \frac{L^5}{2} + \frac{L^5}{5}\right) = \frac{A^2L^5}{30}$.` },
      { label: 'Solve for the constant', text: t`$A^2L^5/30 = 1$, so $A = \sqrt{30/L^5}$. Units: $\text{m}^{-5/2}$, so that $\psi = Ax(L-x)$ has units $\text{m}^{-1/2}$ and $|\psi|^2$ is per metre.` },
      { label: 'The left quarter', text: t`$P = \dfrac{30}{L^5}\displaystyle\int_0^{L/4}(L^2x^2 - 2Lx^3 + x^4)\,dx = 30\left(\frac{1}{192} - \frac{1}{512} + \frac{1}{5120}\right) = ${fmt(30 * (1 / 192 - 1 / 512 + 1 / 5120), 3)}$.` },
      { label: 'Sense check', text: t`A quarter of the box holds only about a tenth of the probability, because $|\psi|^2$ is small near the wall. The exact ground state, $\sqrt{2/L}\sin(\pi x/L)$, gives $\tfrac14 - \tfrac{1}{2\pi} = ${fmt(0.25 - 1 / (2 * Math.PI), 3)}$ — close: the parabola is a fair imitation of the sine.` },
    ],
    answer: t`$A = \sqrt{30/L^5}$ and $P(0 \le x \le L/4) = ${fmt(30 * (1 / 192 - 1 / 512 + 1 / 5120), 3)}$.`,
  },
  practice: [
    mcq({
      id: 'meaning', difficulty: 1,
      prompt: t`For a particle in one dimension, what does $|\psi(x)|^2\,dx$ tell you?`,
      choices: [
        t`The probability that a position measurement finds the particle between $x$ and $x + dx$`,
        t`The fraction of the particle’s mass and charge that is spread out between $x$ and $x + dx$`,
        t`The particle’s kinetic energy at position $x$`,
        t`The probability that the particle passes through $x$ during each second`,
      ],
      answer: 0,
      why: {
        1: 'An electron is never found in pieces: every detection finds the whole charge at one spot. Only the chance of where is spread out.',
        2: 'ψ says nothing directly about energy at a point; |ψ|² is about where the particle is found.',
        3: 'No path or speed is implied: |ψ|² dx is a probability for one measurement, a pure number, not a rate.',
      },
      hints: ['Look at the dots: each one is a whole particle, found at one place. What does the curve say about them?'],
      teach: 'Born’s rule: |ψ|² is a probability density — the chance per unit length of finding the whole particle there.',
      explain: t`$|\psi(x)|^2$ is a probability per unit length, so multiplying by $dx$ gives the chance of a hit in that small interval. Repeat the experiment many times and the hits pile up in proportion to $|\psi|^2$, as the dots do.`,
      visual: hits,
    }),
    num({
      id: 'normalise-exp', difficulty: 2,
      gen(r) {
        const a = r.pick([0.1, 0.2, 0.5, 2, 4]);
        return {
          prompt: t`A particle bound to a very narrow, deep well has $\psi(x) = A\,e^{-|x|/a}$ with $a = ${a}$ nm, for all $x$ from $-\infty$ to $\infty$. Find the positive normalisation constant $A$, in $\text{nm}^{-1/2}$.`,
          answer: 1 / Math.sqrt(a), tol: { rel: 0.005 },
          errors: [
            { value: Math.sqrt(2 / a), feedback: t`That normalises only half the function. $|\psi|^2$ has a tail on each side: $\int_{-\infty}^{\infty} e^{-2|x|/a}dx = 2\cdot\tfrac a2 = a$.` },
            { value: 1 / (2 * a), feedback: t`You integrated $\psi$, not $|\psi|^2$. Square first: $|\psi|^2 = A^2e^{-2|x|/a}$.` },
          ],
          hints: [t`Require $\int_{-\infty}^{\infty} A^2 e^{-2|x|/a}\,dx = 1$; by symmetry this is $2A^2\int_0^\infty e^{-2x/a}dx$.`, t`$\int_0^\infty e^{-2x/a}dx = a/2$, so the condition is $A^2a = 1$.`],
          teach: 'Normalise by integrating |ψ|² — the square — over everywhere the particle could be.',
          explain: t`$2A^2\cdot\tfrac a2 = A^2a = 1$, so $A = 1/\sqrt a = ${fmt(1 / Math.sqrt(a), 3)}\ \text{nm}^{-1/2}$. A tighter state (smaller $a$) needs a larger $A$: the same total probability squeezed into less room.`,
          visual: cusp(a, null),
        };
      },
    }),
    num({
      id: 'tail', difficulty: 2,
      gen(r) {
        const a = r.pick([0.2, 0.5]), k = r.pick([0.5, 1, 1.5, 2]), b = r6(k * a);
        const P = 0.5 * Math.exp(-2 * k);
        return {
          prompt: t`For the same state, normalised, $\psi(x) = a^{-1/2}e^{-|x|/a}$ with $a = ${a}$ nm: what is the probability that a measurement finds the particle at $x > ${b}$ nm?`,
          answer: P, tol: { rel: 0.01 },
          errors: [
            { value: Math.exp(-2 * k), feedback: t`That counts both tails, $|x| > ${b}$ nm. Only the right-hand side was asked for: half of it.` },
            { value: 0.5 * Math.exp(-k), feedback: t`Square $\psi$ first: $|\psi|^2 = e^{-2|x|/a}/a$, which falls twice as fast as $\psi$.` },
          ],
          hints: [t`$P = \displaystyle\int_{${b}}^{\infty} \frac{1}{a}e^{-2x/a}\,dx$.`, t`The integral is $\tfrac12 e^{-2b/a}$ with $b/a = ${k}$.`],
          teach: 'A probability is the area under |ψ|² — here an exponential tail.',
          explain: t`$P = \tfrac12 e^{-2b/a} = \tfrac12 e^{-${2 * k}} = ${fmt(P, 3)}$. Notice it depends only on $b/a$: the state has one length scale, $a$.`,
          visual: cusp(a, b),
        };
      },
    }),
    mcq({
      id: 'stationary', difficulty: 2,
      prompt: t`A particle is in a stationary state, $\Psi(x, t) = \psi(x)\,e^{-iEt/\hbar}$. How does its probability density $|\Psi(x, t)|^2$ change with time?`,
      choices: [
        t`It does not change: $|e^{-iEt/\hbar}|^2 = 1$, so $|\Psi|^2 = |\psi(x)|^2$ at every moment`,
        t`It oscillates at the frequency $E/h$`,
        t`It decays as $e^{-2Et/\hbar}$, as the particle leaks away`,
        t`It spreads out, like a free wave packet`,
      ],
      answer: 0,
      why: {
        1: t`The real part of $\Psi$ oscillates at $E/h$, but $|\Psi|^2$ multiplies $\Psi$ by its conjugate and the phase cancels.`,
        2: t`$e^{-iEt/\hbar}$ has magnitude 1 for real $E$: it rotates the phase without shrinking anything.`,
        3: 'A packet spreads because it mixes many energies. A stationary state has one energy, and nothing about it changes but a phase.',
      },
      hints: [t`$|\Psi|^2 = \Psi^*\Psi$. What is $\left(e^{-iEt/\hbar}\right)^*e^{-iEt/\hbar}$?`],
      teach: 'A state of definite energy is stationary: its phase turns, but |ψ|² and every measurable average stay fixed.',
      explain: t`$\Psi^*\Psi = \psi^*e^{+iEt/\hbar}\,\psi\,e^{-iEt/\hbar} = |\psi|^2$. That is why the levels of an atom can last: a state of definite energy does nothing observable until something disturbs it. Change in time needs a mixture of energies — the subject of [Expectation values](#/lesson/phys2710.MP7.5).`,
      visual: standing,
    }),
    num({
      id: 'detectors', difficulty: 2,
      gen(r) {
        const n = r.pick([1, 2]), [a, b] = r.pick([[0, 0.1], [0.4, 0.6], [0.2, 0.3], [0.45, 0.55]]), N = 20000;
        const P = S.boxProb(n, a, b, 1), count = N * P;
        return {
          prompt: t`An electron in a box 1.0 nm wide is in the state $\psi(x) = \sqrt{2/L}\,\sin(${n === 1 ? '' : n}\pi x/L)$. The same state is prepared 20 000 times and each time the electron’s position is measured. About how many measurements find it between $x = ${a}$ nm and $x = ${b}$ nm?`,
          answer: count, tol: { rel: 0.02 },
          errors: Math.abs(P - (b - a)) > 0.05 * P ? [{ value: N * (b - a), feedback: t`That assumes the electron is equally likely to be anywhere — the classical answer. Weight each place by $|\psi|^2$.` }] : [],
          hints: [t`Expected count $= N\times P$, with $P = \displaystyle\int_{${a}}^{${b}} \frac2L\sin^2\frac{${n === 1 ? '' : n}\pi x}{L}\,dx$.`, t`$\int \frac2L\sin^2\frac{n\pi x}{L}dx = \frac xL - \frac{1}{2n\pi}\sin\frac{2n\pi x}{L}$.`],
          teach: 'Born’s rule predicts frequencies: N repeated measurements put about N·P in each region.',
          explain: t`$P = ${fmt(P, 3)}$, so about $${fmt(count, 3)}$ of the 20 000 measurements land there (give or take $\sqrt{${Math.round(count)}} \approx ${Math.round(Math.sqrt(count))}$ from run to run).${n === 2 && a === 0.45 ? ' Very few: the state has a node at the centre.' : ''}`,
          visual: well({ well: 'infinite', L: 1, n, show: 'prob', window: [a, b], panels: ['wave'], hide: ['prob'] }, t`The state’s $|\psi|^2$ across the box (walls shaded grey), with the region asked about shaded gold.`),
        };
      },
    }),
    mcq({
      id: 'find-error', difficulty: 3, kind: 'error',
      prompt: t`A student normalises the box state $\psi = A\sin(\pi x/L)$ on $0 \le x \le L$:

$$\int_0^L A\sin\frac{\pi x}{L}\,dx = \frac{2AL}{\pi} = 1 \quad\Rightarrow\quad A = \frac{\pi}{2L}.$$

What is wrong?`,
      choices: [
        t`The condition is on $|\psi|^2$: $\int_0^L A^2\sin^2(\pi x/L)\,dx = A^2L/2 = 1$, so $A = \sqrt{2/L}$`,
        t`The limits must run from $-\infty$ to $\infty$`,
        t`The integral of $\sin(\pi x/L)$ from 0 to $L$ is $L/\pi$, not $2L/\pi$`,
        t`$A$ must be imaginary for the wave function to be complex`,
      ],
      answer: 0,
      why: {
        1: t`$\psi = 0$ outside the box, so integrating from 0 to $L$ already covers everywhere.`,
        2: t`$\int_0^L\sin(\pi x/L)dx = \frac L\pi[-\cos(\pi x/L)]_0^L = 2L/\pi$: that step is right. The mistake is integrating $\psi$ at all.`,
        3: 'Any constant phase is allowed but changes nothing measurable; A can be chosen real and positive.',
      },
      hints: ['What does the normalisation condition say must add up to 1?', t`Probabilities are areas under $|\psi|^2$, so the condition is $\int|\psi|^2dx = 1$. Check its units too: $A$ must come out in $\text{m}^{-1/2}$.`],
      teach: 'Normalisation squares first: ∫|ψ|²dx = 1 — and the units of A (m^(−1/2)) check it.',
      explain: t`With the square, $A^2L/2 = 1$ and $A = \sqrt{2/L}$ — units $\text{m}^{-1/2}$, as a 1D wave function needs. The student’s $\pi/2L$ has units $\text{m}^{-1}$, which is a quick sign that something is off.`,
      visual: twoAreas,
    }),
    code({
      id: 'normalise-code', difficulty: 2,
      prompt: t`Wave functions met in practice are often lists of numbers on a grid. Finish \`normalise(x, psi)\`, which returns $\psi$ divided by $\sqrt{\int|\psi|^2dx}$, and \`probability(x, psi, a, b)\`, which returns $\int_a^b|\psi|^2dx$ for a normalised $\psi$. Integrate with \`np.trapezoid\` (the trapezoid rule).`,
      starter: t`import numpy as np

x = np.linspace(-6, 6, 2001)                  # nm
psi = np.exp(-x**2 / 2) * (1 + 0.5 * x)       # a lopsided, unnormalised wave function

def normalise(x, psi):
    # divide psi by the square root of the integral of |psi|^2
    pass

def probability(x, psi, a, b):
    # the integral of |psi|^2 from a to b
    pass

phi = normalise(x, psi)
print("total probability:", np.trapezoid(np.abs(phi)**2, x))
print("P(x > 0):", probability(x, phi, 0, 6))
`,
      answer: t`import numpy as np

x = np.linspace(-6, 6, 2001)
psi = np.exp(-x**2 / 2) * (1 + 0.5 * x)

def normalise(x, psi):
    return psi / np.sqrt(np.trapezoid(np.abs(psi)**2, x))

def probability(x, psi, a, b):
    inside = (x >= a) & (x <= b)
    return np.trapezoid(np.abs(psi[inside])**2, x[inside])

phi = normalise(x, psi)
print("total probability:", np.trapezoid(np.abs(phi)**2, x))
print("P(x > 0):", probability(x, phi, 0, 6))`,
      tests: [
        { name: t`\`normalise\` makes $\int|\psi|^2dx = 1$`, code: 'abs(np.trapezoid(np.abs(normalise(x, psi))**2, x) - 1) < 1e-9' },
        { name: 'it works for any shape, not just this one', code: 'abs(np.trapezoid(np.abs(normalise(x, 3*np.exp(-x**2)))**2, x) - 1) < 1e-9' },
        { name: t`the lopsided state is found at $x > 0$ with probability 0.751`, code: 'abs(probability(x, normalise(x, psi), 0, 6) - 0.75077) < 1e-3' },
        { name: t`a Gaussian ground state is within $\pm1$ of the centre with probability $\operatorname{erf}(1) = 0.843$`, code: 'abs(probability(x, normalise(x, np.exp(-x**2/2)), -1, 1) - 0.842701) < 2e-3' },
      ],
      hints: [t`\`np.trapezoid(y, x)\` integrates samples \`y\` taken at the points \`x\`. Integrate \`np.abs(psi)**2\`.`, t`For the window, a mask \`inside = (x >= a) & (x <= b)\` picks out the grid points between $a$ and $b$; integrate \`np.abs(psi[inside])**2\` against \`x[inside]\`.`],
      teach: 'On a grid, normalising and finding probabilities are both trapezoid-rule integrals of |ψ|².',
      explain: t`Dividing by $\sqrt{\int|\psi|^2dx}$ scales any shape to total probability 1. The lopsided state leans right: $|\psi|^2 = e^{-x^2}(1 + x + x^2/4)$ is larger for $x > 0$, so 75% of measurements find the particle on that side.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-quarter', difficulty: 2,
      gen(r) {
        const n = r.pick([1, 2, 3]), P = S.boxProb(n, 0, 0.25, 1);
        return {
          prompt: t`A particle in a box from $x = 0$ to $x = L$ has $\psi(x) = \sqrt{2/L}\,\sin(${n === 1 ? '' : n}\pi x/L)$. What is the probability of finding it in the left quarter of the box, $0 \le x \le L/4$?`,
          answer: P, tol: { rel: 0.01 },
          errors: n === 2 ? [] : [{ value: 0.25, feedback: t`A quarter of the length is not a quarter of the probability unless $|\psi|^2$ is spread evenly. Integrate $\frac2L\sin^2\frac{${n}\pi x}{L}$.` }],
          hints: [t`$\displaystyle\int_0^{L/4}\frac2L\sin^2\frac{${n === 1 ? '' : n}\pi x}{L}\,dx = \left[\frac xL - \frac{1}{${2 * n}\pi}\sin\frac{${2 * n}\pi x}{L}\right]_0^{L/4}$.`],
          teach: 'P is the area under |ψ|², which is not spread evenly across a box.',
          explain: t`$P = \tfrac14 - \dfrac{\sin(${n === 1 ? '' : n}\pi/2)}{${2 * n}\pi} = ${fmt(P, 3)}$.${n === 2 ? ' Exactly a quarter: for n = 2 the first quarter holds exactly half of the first hump.' : ''}`,
          visual: well({ well: 'infinite', L: 1, n, show: 'prob', window: [0, 0.25], panels: ['wave'], hide: ['prob'] }, t`The state’s $|\psi|^2$ in a box 1 nm wide (walls shaded grey), with the left quarter shaded gold.`),
        };
      },
    }),
    mcq({
      id: 'cp-valid', difficulty: 2,
      prompt: t`A particle can be anywhere on the $x$-axis, from $-\infty$ to $\infty$. Which of these (times a suitable constant) can be its wave function?`,
      choices: [t`$e^{-x^2/2}$`, t`$e^{-x}$`, t`$\sin 2x$`, t`$1/x$`],
      answer: 0,
      why: {
        1: t`$|\psi|^2 = e^{-2x}$ grows without limit as $x \to -\infty$: no constant can make its area 1.`,
        2: t`$\sin^2 2x$ never dies away, so its area over the whole axis is infinite.`,
        3: t`$1/x^2$ blows up at $x = 0$ so badly that its area there is infinite.`,
      },
      hints: ['The total area under |ψ|² must be finite, so that it can be scaled to 1.', 'Check each one at large |x| and wherever it blows up.'],
      teach: 'A wave function must be square-integrable: |ψ|² must have a finite total area.',
      explain: t`Only $e^{-x^2/2}$ has $\int|\psi|^2dx$ finite ($\sqrt\pi$, so the constant is $\pi^{-1/4}$). It is the ground state of the harmonic oscillator, in [The harmonic oscillator](#/lesson/phys2710.MP7.4).`,
      visual: candidates,
    }),
    num({
      id: 'cp-cold-atoms', difficulty: 3, transfer: true,
      gen(r) {
        const f = r.pick([20, 50, 100]), b = Math.sqrt(HBAR / (M_RB87 * 2 * Math.PI * f)) * 1e6;
        const d = r.pick([0.5, 1.0, 1.5]), P = erf(d / b);
        return {
          prompt: t`NASA’s Cold Atom Lab on the International Space Station chills rubidium-87 atoms to below a millionth of a kelvin and holds them in a magnetic trap. One atom in the ground state of a trap of frequency ${f} Hz has $\psi(x) = (\pi b^2)^{-1/4}e^{-x^2/2b^2}$ along one direction, with $b = \sqrt{\hbar/m\omega} = ${fmt(b, 3)}$ μm. What is the probability that a measurement finds it within ${d} μm of the centre? (You may use $\int_{-d}^{d}\frac{e^{-x^2/b^2}}{\sqrt\pi\,b}dx = \operatorname{erf}(d/b)$.)`,
          answer: P, tol: { rel: 0.01 },
          errors: [
            { value: erf(d / (Math.SQRT2 * b)), feedback: t`$|\psi|^2 \propto e^{-x^2/b^2}$, not $e^{-x^2/2b^2}$: squaring $\psi$ halves the width. The argument of erf is $d/b$.` },
            { value: erf(d / b) / 2, feedback: t`“Within ${d} μm” counts both sides of the centre, $-d$ to $d$.` },
          ],
          hints: [t`$|\psi|^2 = \dfrac{1}{\sqrt\pi\,b}e^{-x^2/b^2}$.`, t`So $P = \operatorname{erf}(d/b) = \operatorname{erf}(${fmt(d / b, 3)})$.`],
          teach: 'For a Gaussian state the probability within ±d of the centre is an error function — of d/b, since squaring ψ narrows it.',
          explain: t`$P = \operatorname{erf}(${d}/${fmt(b, 3)}) = ${fmt(P, 3)}$. In microgravity the trap can be relaxed to frequencies of a few hertz without the atoms falling out, making clouds colder and wider than any on the ground — the point of flying the experiment.`,
          visual: trap(b, d),
        };
      },
    }),
  ],
  sources: [
    { label: 'OpenStax University Physics Vol. 3, §7.2–7.3 (the wave function, the Schrödinger equation)', url: 'https://openstax.org/books/university-physics-volume-3/pages/7-3-the-schrodinger-equation' },
    { label: 'Born (1926), Zur Quantenmechanik der Stoßvorgänge, Z. Phys. 37, 863', url: 'https://doi.org/10.1007/BF01397477' },
    { label: 'Aveline et al. (2020), Observation of Bose–Einstein condensates in an Earth-orbiting research lab, Nature 582, 193', url: 'https://doi.org/10.1038/s41586-020-2346-1' },
  ],
});
