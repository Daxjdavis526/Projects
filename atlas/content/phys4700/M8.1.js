// Non-degenerate perturbation theory (Griffiths & Schroeter §7.1). Ĥ = Ĥ⁰ + Ĥ′
// with Ĥ⁰ solved: E¹ = ⟨n⁰|Ĥ′|n⁰⟩, ψ¹ = Σ ⟨m⁰|Ĥ′|n⁰⟩/(Eₙ⁰ − E_m⁰) |m⁰⟩,
// E² = Σ |⟨m⁰|Ĥ′|n⁰⟩|²/(Eₙ⁰ − E_m⁰). Explore: an oscillator whose spring
// is stiffened by a fraction ε, exactly √(1 + ε) — the perturbation series is
// the binomial series, which converges only for |ε| < 1. Worked: an electron
// in a 1 nm infinite well with a step over its right half, against the exact
// energy found by shooting (content/phys4700/_pert.js). Code: the same well
// diagonalized in a truncated sine basis against E⁰ + E¹ + E². Transfer: a
// trapped ion in a stray electric field, where second order is exact. Time-
// dependent perturbation theory is left to PHYS 4710.
import { lesson, mcq, num, code } from '../../src/core/content.js';
import { fmt, tex } from '../../src/core/format.js';
import { En, seg, label, r6 } from './_wells.js';
import { H, QE, U } from './_qm.js';
import { exactLevel, pertShifts, element, exactPsiExpr } from './_pert.js';

const t = String.raw;
const E1W = En(1, 1);                       // eV: an electron's ground state in a 1 nm infinite well
const M_CA40 = 39.962590851 * U;            // kg, calcium-40 (AME2020); the ion's missing electron is ignored

/**
 * The unit-width infinite well with steps (in units of a and E₁⁰), and some
 * wave functions: curves [{ fn, color, label, dash }]; pieces [{ from, to, V }]
 * drawn as shaded blocks scaled so a step of size `vmax` is 0.9 tall.
 */
function wellPic({ pieces = [], curves = [], caption, y = [-1.6, 1.9], ylabel = 'ψ (scaled)', vmax = null, vlabel = 'V₀' }) {
  const top = vmax ?? Math.max(...pieces.map((p) => Math.abs(p.V)), 1);
  const shade = pieces.map((p) => ({ fn: `${r6((0.9 * p.V) / top)}`, from: p.from, to: p.to, color: 'teal', alpha: 0.28 }));
  const pts = pieces.map((p) => label((p.from + p.to) / 2, (0.9 * p.V) / top, vlabel, 'teal', 0, -10, 'center'));
  return {
    type: 'graph',
    params: {
      x: [-0.04, 1.04], y, aspect: 'wide', xlabel: 'x / a', ylabel, axesAt: 'edge', xticks: 4, yticks: 0,
      shade,
      curves: [seg(0, y[0], 0, y[1], 'ink2', 4), seg(1, y[0], 1, y[1], 'ink2', 4), seg(0, 0, 1, 0, 'ink4', 1),
        ...curves.map((c) => ({ fn: c.fn, domain: [0, 1], color: c.color || 'accent', width: c.width || 2.2, ...(c.dash ? { dash: c.dash } : {}), ...(c.label ? { label: c.label, labelAt: c.labelAt ?? 0.12, labelDx: 4, labelDy: c.labelDy ?? -12 } : {}) }))],
      points: pts,
    },
    caption,
  };
}
const sinN = (n, scale = 1) => `${r6(scale * Math.SQRT2)}*sin(${n}*pi*x)`;

/** A stiffened oscillator: the old and new parabolas, in units of ħω and the oscillator length. */
const springPic = (eps, caption) => ({
  type: 'graph',
  params: {
    x: [-3, 3], y: [0, 5], aspect: 'wide', xlabel: 'x / ℓ', ylabel: 'energy / ħω', axesAt: 'edge', xticks: 6, yticks: 5,
    curves: [{ fn: '0.5*x^2', color: 'ink3', width: 1.8, dash: [6, 4], label: 'V⁰', labelAt: -2.6, labelDx: -4, labelDy: -10 }, { fn: `0.5*${r6(1 + eps)}*x^2`, color: 'accent', width: 2.4, label: 'V⁰ + H′', labelAt: 2.3, labelDx: 6, labelDy: 0 }],
    hlines: [0.5, 1.5, 2.5, 3.5].map((y) => ({ y, color: 'ink4' })),
  },
  caption,
});

/** Two levels and their exact and perturbative energies against the coupling v (graph). */
const twoLevelPic = (Ea, Eb, vmax, caption) => ({
  type: 'graph',
  params: {
    x: [0, r6(vmax)], y: [r6(Ea - 0.9 * (Eb - Ea)), r6(Eb + 0.9 * (Eb - Ea))], aspect: 'wide', xlabel: 'coupling V (meV)', ylabel: 'energy (meV)', axesAt: 'edge', xticks: 5, yticks: 4,
    curves: [
      { fn: `${r6((Ea + Eb) / 2)} - sqrt(${r6(((Eb - Ea) / 2) ** 2)} + x^2)`, color: 'gold', width: 2.6 },
      { fn: `${r6((Ea + Eb) / 2)} + sqrt(${r6(((Eb - Ea) / 2) ** 2)} + x^2)`, color: 'gold', width: 2.6 },
      { fn: `${r6(Ea)} - x^2/${r6(Eb - Ea)}`, color: 'accent', width: 2, dash: [6, 4] },
      { fn: `${r6(Eb)} + x^2/${r6(Eb - Ea)}`, color: 'accent', width: 2, dash: [6, 4] },
    ],
    legend: [{ label: 'exact', color: 'gold' }, { label: 'second order', color: 'accent', dash: [6, 4] }], legendAt: 'tl',
  },
  caption,
});

// ── the worked example: an electron in a 1 nm well with a 0.2 eV step over its right half
const EX_V = 0.2;                               // eV
const EXu = EX_V / E1W;                         // the step in units of E₁⁰
const EXP = [{ from: 0.5, to: 1, V: EXu }];
const EXs = pertShifts(1, EXP), EXexact = exactLevel(1, EXP);
const EXv2 = element(2, 1, EXP);
const EXpsi = exactPsiExpr(1, EXP);

export default lesson({
  id: 'phys4700.M8.1',
  title: 'Non-degenerate perturbation theory',
  minutes: 18, difficulty: 3,
  intro: t`Almost nothing in quantum mechanics is exactly solvable. But many problems are a solvable one, $\hat H^0$, plus a small extra piece $\hat H'$. **Perturbation theory** expands the answer in powers of $\hat H'$. For a level $n$ that no other state shares, the first two corrections to its energy are

$$\begin{gathered} E_n^1 = \langle\psi_n^0|\hat H'|\psi_n^0\rangle \\ E_n^2 = \sum_{m\ne n}\frac{|\langle\psi_m^0|\hat H'|\psi_n^0\rangle|^2}{E_n^0 - E_m^0} \end{gathered}$$

The first is just the perturbation averaged over the unperturbed state. The second comes from the state reshaping itself: it mixes in a little of every other state $m$, weighted by how strongly $\hat H'$ connects them and how close in energy they are. This is how fine structure, the Zeeman effect, the polarizability of atoms and the Lamb shift are all calculated.`,
  symbols: [
    { tex: '\\hat H^0', text: t`the unperturbed Hamiltonian, whose eigenstates $\psi_n^0$ and energies $E_n^0$ are known exactly` },
    { tex: '\\hat H\'', text: 'the perturbation: the small extra term in the energy' },
    { tex: '\\psi_n^0,\\ E_n^0', text: t`the unperturbed state $n$ and its energy; “non-degenerate” means no other state has energy $E_n^0$` },
    { tex: 'E_n^1', text: t`the first-order energy correction: the expectation value of $\hat H'$ in the unperturbed state` },
    { tex: 'E_n^2', text: t`the second-order correction: a sum over every **other** state $m$` },
    { tex: '\\langle\\psi_m^0|\\hat H\'|\\psi_n^0\\rangle', text: t`the matrix element of $\hat H'$ between states $m$ and $n$ (often written $H'_{mn}$), in energy units` },
  ],
  why: 'Perturbation theory is how almost every real number in atomic, molecular and solid-state physics is computed — and its time-dependent version (PHYS 4710) gives every transition rate.',
  visual: {
    type: 'graph',
    title: 'When the series works, and when it cannot',
    lead: t`An oscillator whose spring is stiffened by a fraction $\varepsilon$: $\hat H' = \varepsilon\cdot\tfrac12m\omega^2x^2$. The exact answer is $E_n = (n + \tfrac12)\hbar\omega\sqrt{1 + \varepsilon}$, the same shape for every level, so the graph plots $E_n/(n + \frac12)\hbar\omega$. Perturbation theory gives its Taylor series in $\varepsilon$, term by term.`,
    tasks: [
      'At ε = 0.2, first order is off by 0.4% and second order by 0.04%: each order buys roughly another factor of ε.',
      'Raise the order N with ε = 0.5: the partial sums home in on the exact curve.',
      'Beyond ε = 1 the partial sums swing wider as N grows: the series diverges, even though the exact answer is perfectly smooth there. Perturbation theory needs the correction to be small compared with the level spacing.',
    ],
    params: {
      x: [-1, 2], y: [0, 2], aspect: 'wide', xlabel: 'ε (fractional stiffening of the spring)', ylabel: 'E / (n + ½)ħω', axesAt: 'edge', xticks: 6, yticks: 4,
      sliders: [
        { key: 'N', label: 'Order $N$', min: 1, max: 10, step: 1, value: 2, explain: t`How many terms of the perturbation series are added: $N = 1$ is first order, $E^0 + E^1$.` },
        { key: 'e', label: t`Perturbation $\varepsilon$`, min: -0.9, max: 1.9, step: 0.05, value: 0.2, explain: 'The fraction by which the spring constant is increased (negative: weakened).' },
      ],
      curves: [
        { fn: 'sqrt(1 + x)', color: 'gold', width: 2.8, domain: [-1, 2], label: 'exact √(1 + ε)', labelAt: 1.45, labelDx: -30, labelDy: -16 },
        { sum: '(-1)^(k+1)*gamma(2k+1)/(4^k*gamma(k+1)^2*(2k-1))*x^k', k: [0, 'N'], color: 'accent', width: 2.2 },
      ],
      vlines: [{ x: 'e', color: 'ink3' }, { x: 1, color: 'bad', label: 'ε = 1' }],
      readouts: [
        { label: 'exact √(1 + ε)', expr: 'sqrt(1 + e)', digits: 5 },
        { label: 'first order 1 + ε/2', expr: '1 + e/2', digits: 5 },
        { label: 'second order 1 + ε/2 − ε²/8', expr: '1 + e/2 - e^2/8', digits: 5 },
      ],
    },
    caption: t`Gold: the exact energy. Blue: the perturbation series through order $N$; red line: its radius of convergence. It is the binomial series of $\sqrt{1 + \varepsilon}$, which converges only for $|\varepsilon| < 1$. Exact for an ideal oscillator; units of $(n + \tfrac12)\hbar\omega$.`,
  },
  example: {
    prompt: t`An electron sits in an infinite square well of width $a = 1.00$ nm, where $E_1^0 = ${fmt(E1W, 4)}$ eV. A gate voltage raises the floor of the right half, $a/2 < x < a$, by $V_0 = ${EX_V}$ eV. Find the ground-state energy to second order, and compare it with the exact answer.`,
    visual: wellPic({ pieces: EXP, vmax: EXu * 1.6, curves: [{ fn: sinN(1, 0.85), color: 'ink3', dash: [6, 4], label: 'ψ₁⁰', labelAt: 0.8, labelDy: -16 }, { fn: `0.85*(${EXpsi.expr})`, color: 'gold', label: 'exact ψ₁', labelAt: 0.2, labelDy: -16 }], y: [-0.3, 1.6], caption: t`The well with its step (teal; height not to scale) and the ground state before (dashed) and after (gold). The exact state leans away from the step: that lean is the mixing of other states that second order counts.` }),
    steps: [
      { label: 'Units', text: t`Measure lengths in $a$ and energies in $E_1^0$, so $E_n^0 = n^2$ and the step is $V_0/E_1^0 = ${fmt(EXu, 4)}$. The states are $\psi_n^0 = \sqrt{2/a}\,\sin(n\pi x/a)$.` },
      { label: 'First order', text: t`$E_1^1 = \langle\psi_1^0|V|\psi_1^0\rangle$ $= V_0\displaystyle\int_{a/2}^{a}|\psi_1^0|^2dx$ $= \tfrac12V_0 = ${fmt(EX_V / 2, 4)}$ eV. $|\psi_1^0|^2$ is symmetric about the middle, so half the probability sits on the step. (Every level gets the same first-order shift.)` },
      { label: 'Matrix elements', text: t`$H'_{m1} = \dfrac{2V_0}{a}\displaystyle\int_{a/2}^{a}\sin\frac{m\pi x}{a}\sin\frac{\pi x}{a}\,dx$. For odd $m \ne 1$ it vanishes; for even $m$ it is not small: $H'_{21} = -\dfrac{4V_0}{3\pi} = ${fmt(EXv2 * E1W, 3)}$ eV — the step breaks the well’s mirror symmetry, so it mixes even states into odd ones.` },
      { label: 'Second order', text: t`$E_1^2 = \sum_m |H'_{m1}|^2/(E_1^0 - E_m^0)$. The $m = 2$ term alone is $(${fmt(EXv2 * E1W, 3)}\ \text{eV})^2/(-3\times${fmt(E1W, 4)}\ \text{eV}) = ${fmt((EXv2 * E1W) ** 2 / (-3 * E1W), 3)}$ eV, almost all of it; the full sum, which converges fast because the denominators grow as $m^2$, is $${fmt(EXs.E2 * E1W, 4)}$ eV. Negative, as second order for a ground state must be.` },
      { label: 'Total', text: t`$E_1 \approx ${fmt(E1W, 4)} + ${fmt(EXs.E1 * E1W, 4)} ${fmt(EXs.E2 * E1W, 3)} = ${fmt((1 + EXs.E1 + EXs.E2) * E1W, 5)}$ eV.` },
      { label: 'Check', text: t`Solving exactly — a sine on each half, matched at $x = a/2$ — gives $${fmt(EXexact * E1W, 5)}$ eV. First order alone was off by $${fmt(((1 + EXs.E1 - EXexact) * E1W) * 1e3, 2)}$ meV; second order leaves $${fmt(Math.abs((1 + EXs.E1 + EXs.E2 - EXexact) * E1W) * 1e3, 2)}$ meV. The step is about half of $E_1^0$ and well below the gap to $E_2^0$, so the series behaves.` },
    ],
    answer: t`$E_1 \approx E_1^0 + \tfrac12V_0 + E_1^2 = ${fmt((1 + EXs.E1 + EXs.E2) * E1W, 5)}$ eV, against $${fmt(EXexact * E1W, 5)}$ eV exactly.`,
  },
  practice: [
    num({
      id: 'quarter-step', difficulty: 2,
      gen(r) {
        const n = r.pick([1, 2, 3, 4]), V = r.pick([20, 40, 50, 80]);    // meV
        const f = 0.25 - Math.sin((n * Math.PI) / 2) / (2 * n * Math.PI), ans = V * f;
        return {
          prompt: t`An infinite well of width $a$ has a small bump: $V = V_0 = ${V}$ meV for $0 < x < a/4$ and zero elsewhere inside. To first order, by how much does the bump raise level $n = ${n}$?`,
          visual: wellPic({ pieces: [{ from: 0, to: 0.25, V: 1 }], vmax: 1.8, y: [-0.15, 2.3], ylabel: '|ψ|² (scaled)', curves: [{ fn: `${r6(0.95)}*2*sin(${n}*pi*x)^2`, color: 'gold', label: `|ψ${'₁₂₃₄'[n - 1]}⁰|²`, labelAt: 0.5 / n + 0.02 }], caption: t`The bump (teal) and the probability density of level ${n}. The first-order shift is $V_0$ times the probability that sits under the bump.` }),
          answer: ans, units: 'meV', tol: { rel: 0.005 },
          errors: [{ value: V / 4, feedback: t`$V_0/4$ assumes the probability is spread evenly. $|\psi_${n}^0|^2$ is not uniform: integrate it over $0 < x < a/4$.` }, { value: V, feedback: t`Only the part of the state under the bump feels it: multiply $V_0$ by the probability of being there.` }].filter((e) => Math.abs(e.value - ans) > 0.01 * ans),
          hints: [t`$E_n^1 = V_0\displaystyle\int_0^{a/4}\frac2a\sin^2\frac{n\pi x}{a}\,dx$.`, t`That integral is $\dfrac14 - \dfrac{\sin(n\pi/2)}{2n\pi}$.`],
          teach: 'A first-order shift is the perturbation averaged over the unperturbed probability density.',
          explain: t`$E_${n}^1 = V_0\Big(\tfrac14 - \tfrac{\sin(${n}\pi/2)}{${2 * n}\pi}\Big) = ${V}\times${fmt(f, 4)} = ${fmt(ans, 4)}$ meV. ${n === 1 ? 'The ground state has little probability near the wall, so it feels the bump least.' : n % 2 === 0 ? 'For even n the quarter-well holds exactly a quarter of the probability.' : 'This level has a peak inside the bump, so it feels more than a quarter.'}`,
        };
      },
    }),
    mcq({
      id: 'sign-e2', difficulty: 2,
      prompt: t`Whatever the perturbation, what is the sign of the **second-order** correction $E^2$ to the energy of a non-degenerate **ground** state?`,
      visual: {
        type: 'graph',
        params: {
          x: [0, 4], y: [0, 4.4], aspect: 'wide', xlabel: '', ylabel: 'energy', axesAt: 'edge', xticks: 0, yticks: 0,
          curves: [seg(0.4, 0.6, 1.6, 0.6, 'gold', 3), seg(0.4, 1.8, 1.6, 1.8, 'accent', 2.4), seg(0.4, 2.7, 1.6, 2.7, 'accent', 2.4), seg(0.4, 3.5, 1.6, 3.5, 'accent', 2.4), seg(0.4, 4.0, 1.6, 4.0, 'accent', 2.4)],
          points: [label(1.7, 0.6, 'ground state n', 'gold', 4, 0), label(1.7, 2.7, 'every other state m: higher', 'accent', 4, 0)],
        },
        caption: 'The unperturbed spectrum: the ground state below all the others. Schematic spacing.',
      },
      choices: ['Negative or zero, always', 'Positive, always', 'The same sign as the first-order correction', 'It depends on the sign of the perturbation'],
      answer: 0,
      why: {
        1: t`Each term is $|H'_{m0}|^2/(E_0^0 - E_m^0)$. The numerator is never negative; for the ground state every denominator is negative.`,
        2: t`$E^1 = H'_{00}$ can have either sign, but $E^2$ involves $|H'_{m0}|^2$, which does not care about the sign of $\hat H'$.`,
        3: t`Flipping $\hat H' \to -\hat H'$ flips $E^1$ but leaves every $|H'_{m0}|^2$, and so $E^2$, unchanged.`,
      },
      hints: [t`Look at the numerator and the denominator of each term in $E_0^2 = \sum_{m\ne0}|H'_{m0}|^2/(E_0^0 - E_m^0)$.`],
      teach: 'Second order pushes interacting levels apart, so it always lowers the ground state.',
      explain: t`Every term is (positive)/(negative): $E_0^2 \le 0$. Levels coupled by $\hat H'$ repel — the lower one is pushed down, the upper one up. This is why an electric field always lowers the ground state of an atom (it becomes polarized), whichever way the field points.`,
    }),
    num({
      id: 'two-level', difficulty: 3,
      gen(r) {
        const Ea = r.pick([10, 20, 30]), gap = r.pick([40, 50, 60, 80]), Eb = Ea + gap, V = r.pick([8, 10, 12, 15]);
        const ans = Ea - (V * V) / gap, exact = (Ea + Eb) / 2 - Math.sqrt((gap / 2) ** 2 + V * V);
        return {
          prompt: t`Two states with $E_a^0 = ${Ea}$ meV and $E_b^0 = ${Eb}$ meV are coupled by a perturbation with $H'_{aa} = H'_{bb} = 0$ and $H'_{ab} = ${V}$ meV. What does second-order perturbation theory give for the lower energy, in meV?`,
          visual: twoLevelPic(Ea, Eb, 2.2 * V, t`The two energies against the coupling $V$: exact (gold, the eigenvalues of the $2\times2$ matrix) and second order (dashed). Your $V$ is less than half the range shown.`),
          answer: ans, units: 'meV', tol: { rel: 0.002, abs: 0.01 },
          errors: [{ value: Ea + (V * V) / gap, feedback: t`The denominator is $E_a^0 - E_b^0 = -${gap}$ meV: the lower level is pushed **down**.` }, { value: Ea - V, feedback: t`That is first order in $V$; first order is $H'_{aa} = 0$ here. Second order is $|H'_{ab}|^2/(E_a^0 - E_b^0)$.` }, { value: exact, feedback: t`That is the exact eigenvalue — correct physics, but the question asks for the second-order estimate, $E_a^0 + |H'_{ab}|^2/(E_a^0 - E_b^0)$.` }].filter((e) => Math.abs(e.value - ans) > 0.006 * Math.abs(ans) + 0.02),
          hints: [t`$E_a \approx E_a^0 + H'_{aa} + \dfrac{|H'_{ab}|^2}{E_a^0 - E_b^0}$.`, t`$\dfrac{${V}^2}{${Ea} - ${Eb}} = -${fmt((V * V) / gap, 4)}$ meV.`],
          teach: 'For two coupled levels, second order gives ±|V|²/ΔE: they repel.',
          explain: t`$E_a \approx ${Ea} - ${V * V}/${gap} = ${fmt(ans, 4)}$ meV. The exact eigenvalue of $\begin{pmatrix}${Ea} & ${V}\\ ${V} & ${Eb}\end{pmatrix}$ is $${fmt(exact, 5)}$ meV: they agree while $V \ll E_b^0 - E_a^0$, differing at order $V^4$.`,
        };
      },
    }),
    num({
      id: 'stiffen', difficulty: 2,
      gen(r) {
        const n = r.pick([0, 1, 2, 3]), hw = r.pick([30, 45, 60]), pct = r.pick([2, 4, 5, 10]);
        const eps = pct / 100, ans = (n + 0.5) * hw * eps / 2;
        return {
          prompt: t`A diatomic molecule’s vibration is an oscillator with $\hbar\omega = ${hw}$ meV. Squeezing it in a crystal stiffens the bond: $\hat H' = \varepsilon\cdot\tfrac12m\omega^2\hat x^2$ with $\varepsilon = ${eps}$. To first order, by how much does level $n = ${n}$ rise? (For the oscillator, $\langle n|\tfrac12m\omega^2\hat x^2|n\rangle = \tfrac12(n + \tfrac12)\hbar\omega$.)`,
          visual: springPic(4 * eps, t`The original potential (dashed) and a stiffened one (blue; the stiffening exaggerated four times), with the unperturbed levels. Units of $\hbar\omega$ and the oscillator length $\ell = \sqrt{\hbar/m\omega}$.`),
          answer: ans, units: 'meV', tol: { rel: 0.005 },
          errors: [{ value: (n + 0.5) * hw * eps, feedback: t`Only the potential energy is perturbed, and it is half the total on average (the virial theorem): $\langle\tfrac12m\omega^2x^2\rangle = \tfrac12(n + \tfrac12)\hbar\omega$.` }, { value: n * hw * eps / 2, feedback: t`Include the zero-point $\tfrac12$: $E_n^0 = (n + \tfrac12)\hbar\omega$.` }].filter((e) => Math.abs(e.value - ans) > 0.01 * ans),
          hints: [t`$E_n^1 = \varepsilon\,\langle n|\tfrac12m\omega^2\hat x^2|n\rangle$.`, t`$= \varepsilon\cdot\tfrac12(n + \tfrac12)\hbar\omega$.`],
          teach: 'First order averages the perturbation: for a stiffened spring, ε times the mean potential energy.',
          explain: t`$E_${n}^1 = ${eps}\times\tfrac12(${n} + \tfrac12)(${hw}\ \text{meV}) = ${fmt(ans, 4)}$ meV. Exactly, $\omega \to \omega\sqrt{1 + \varepsilon}$, which raises the level by $(${n} + \tfrac12)(${hw})(\sqrt{${1 + eps}} - 1) = ${fmt((n + 0.5) * hw * (Math.sqrt(1 + eps) - 1), 4)}$ meV: first order is the first term of that square root’s series.`,
        };
      },
    }),
    code({
      id: 'diag-step', difficulty: 3,
      prompt: t`Check perturbation theory against brute force. In units where the well runs from $0$ to $1$ and $E_n^0 = n^2$, a step $V_0 = 2$ covers $\tfrac12 < x < 1$. On the grid \`x\` provided, the basis functions are $\psi_n = \sqrt2\sin(n\pi x)$. Write:

- \`Hp(N)\`: the $N\times N$ matrix $H'_{mn} = \int_0^1\psi_m V\psi_n\,dx$ for $m, n = 1\dots N$ (use \`np.trapezoid\` over the grid);
- \`exact(N)\`: the eigenvalues, lowest first, of $H^0 + H'$ in that truncated basis, where $H^0 = \mathrm{diag}(1, 4, 9, \dots)$;
- \`pert(n, N)\`: a pair $(E^0 + E^1,\ E^0 + E^1 + E^2)$ for level $n$, with the second-order sum running over the other $N - 1$ basis states.`,
      starter: t`import numpy as np

V0 = 2.0
x = np.linspace(0, 1, 4001)
V = np.where(x > 0.5, V0, 0.0)
V[2000] = V0 / 2          # the step sits exactly on a grid point

def Hp(N):
    pass

def exact(N):
    pass

def pert(n, N):
    pass

print(exact(40)[:3])
print(pert(1, 40))
`,
      answer: t`import numpy as np

V0 = 2.0
x = np.linspace(0, 1, 4001)
V = np.where(x > 0.5, V0, 0.0)
V[2000] = V0 / 2          # the step sits exactly on a grid point

def basis(N):
    n = np.arange(1, N + 1)
    return np.sqrt(2) * np.sin(np.outer(n, np.pi * x))

def Hp(N):
    phi = basis(N)
    return np.trapezoid(phi[:, None, :] * V * phi[None, :, :], x, axis=2)

def exact(N):
    H0 = np.diag(np.arange(1, N + 1) ** 2.0)
    return np.linalg.eigvalsh(H0 + Hp(N))

def pert(n, N):
    H = Hp(N)
    E0 = np.arange(1, N + 1) ** 2.0
    first = E0[n - 1] + H[n - 1, n - 1]
    second = sum(H[m, n - 1] ** 2 / (E0[n - 1] - E0[m]) for m in range(N) if m != n - 1)
    return first, first + second

print(exact(40)[:3])
print(pert(1, 40))
`,
      tests: [
        { name: t`$H'$ is symmetric, with $H'_{11} = V_0/2$`, code: 'np.allclose(Hp(6), Hp(6).T) and abs(Hp(6)[0, 0] - 1.0) < 1e-6' },
        { name: t`$H'_{21}$ matches the integral $-\tfrac{8}{3\pi}$ (for $V_0 = 2$)`, code: `abs(abs(Hp(4)[1, 0]) - 8 / (3 * np.pi)) < 1e-6` },
        { name: `exact(40) gives the true ground state, ${fmt(exactLevel(1, [{ from: 0.5, to: 1, V: 2 }]), 6)}`, code: `abs(exact(40)[0] - ${exactLevel(1, [{ from: 0.5, to: 1, V: 2 }])}) < 2e-4` },
        { name: 'exact(40) gives the first excited state too', code: `abs(exact(40)[1] - ${exactLevel(2, [{ from: 0.5, to: 1, V: 2 }])}) < 2e-4` },
        { name: t`first order is $1 + V_0/2 = 2$; second order adds $${fmt(pertShifts(1, [{ from: 0.5, to: 1, V: 2 }], 40).E2, 4)}$`, code: `abs(pert(1, 40)[0] - 2) < 1e-6 and abs(pert(1, 40)[1] - ${1 + 1 + pertShifts(1, [{ from: 0.5, to: 1, V: 2 }], 40).E2}) < 1e-5` },
        { name: 'second order is closer to the exact answer than first order', code: 'abs(pert(1, 40)[1] - exact(40)[0]) < abs(pert(1, 40)[0] - exact(40)[0])' },
      ],
      hints: [
        'Build all the basis functions at once: an (N, len(x)) array, row n − 1 holding √2 sin(nπx).',
        'H′ₘₙ is the integral of ψₘ V ψₙ: broadcast phi[:, None, :] * V * phi[None, :, :] and integrate over the last axis with np.trapezoid(…, x, axis=2).',
        'For pert, the second-order term is a sum over m ≠ n of H[m, n−1]² / (E0[n−1] − E0[m]), with E0 = (1, 4, 9, …).',
      ],
      teach: 'Diagonalizing in a truncated basis is the exact answer as the basis grows; perturbation theory is its expansion in powers of H′.',
      explain: t`With $V_0 = 2$ (twice $E_1^0$, a big step) the exact ground state is $${fmt(exactLevel(1, [{ from: 0.5, to: 1, V: 2 }]), 5)}$, first order gives $2$ and second order $${fmt(2 + pertShifts(1, [{ from: 0.5, to: 1, V: 2 }]).E2, 5)}$. Try \`V0 = 0.5\`: the errors shrink like $V_0^2$ and $V_0^3$. Matrix diagonalization in a good basis is how most real quantum calculations are done; perturbation theory tells you *why* the numbers come out as they do.`,
    }),
    mcq({
      id: 'when-fails', difficulty: 2,
      prompt: t`An oscillator’s spring constant is **doubled** ($\varepsilon = 1$ in the Explore picture). Why is perturbation theory a poor tool here, though it worked well for $\varepsilon = 0.1$?`,
      visual: { type: 'graph', params: { x: [-1, 2], y: [0, 2], aspect: 'wide', xlabel: 'ε', ylabel: 'E / (n + ½)ħω', axesAt: 'edge', xticks: 6, yticks: 4, curves: [{ fn: 'sqrt(1 + x)', color: 'gold', width: 2.6 }, { fn: '1 + x/2', color: 'accent', width: 2, dash: [6, 4] }, { fn: '1 + x/2 - x^2/8', color: 'violet', width: 2, dash: [3, 3] }], vlines: [{ x: 1, color: 'ink3' }], legend: [{ label: 'exact', color: 'gold' }, { label: 'first order', color: 'accent', dash: [6, 4] }, { label: 'second order', color: 'violet', dash: [3, 3] }], legendAt: 'br' }, caption: 'The exact energy against the first- and second-order estimates; grey line at ε = 1.' },
      choices: [
        t`The perturbation is not small: its matrix elements are comparable to the level spacing $\hbar\omega$, so the series converges slowly or not at all`,
        t`The first-order correction is zero, so higher orders are undefined`,
        t`The levels become degenerate when the spring is doubled`,
        t`Perturbation theory only works when $\hat H'$ is negative`,
      ],
      answer: 0,
      why: {
        1: t`$E^1 = \tfrac12\varepsilon(n + \tfrac12)\hbar\omega$ is not zero here, and higher orders are defined whatever it is.`,
        2: t`Doubling the spring multiplies every level by $\sqrt2$; their spacing changes but no two levels meet.`,
        3: t`The sign does not matter; the size compared with the energy gaps does.`,
      },
      hints: [t`Compare $|H'_{mn}|$ with $|E_n^0 - E_m^0|$ for the states it connects.`],
      teach: 'Perturbation theory needs |H′ₘₙ| ≪ |Eₙ⁰ − Eₘ⁰|: the perturbation must be small next to the gaps it bridges.',
      explain: t`The expansion parameter is $|H'_{mn}|/|E_n^0 - E_m^0|$. At $\varepsilon = 1$ the perturbation is as big as the potential it modifies, and the series for $\sqrt{1 + \varepsilon}$ sits on its radius of convergence. The answer is still exactly $\sqrt2(n + \tfrac12)\hbar\omega$ — but you would get it by re-solving, not by perturbing.`,
    }),
    num({
      id: 'mixing', difficulty: 3,
      gen(r) {
        const V = r.pick([0.1, 0.2, 0.3, 0.5]);       // in units of E₁⁰
        const v21 = element(2, 1, [{ from: 0.5, to: 1, V }]), ans = Math.abs(v21 / (1 - 4));
        return {
          prompt: t`In the worked example’s well, a step of $V_0 = ${V}\,E_1^0$ covers the right half. To first order the ground state becomes $\psi_1 \approx \psi_1^0 + \sum_{m\ne1}c_m\psi_m^0$ with $c_m = H'_{m1}/(E_1^0 - E_m^0)$. Given $H'_{21} = -\dfrac{4V_0}{3\pi}$, what is the size $|c_2|$ of the $\psi_2^0$ admixture?`,
          visual: wellPic({ pieces: [{ from: 0.5, to: 1, V: 1 }], vmax: 2.2, y: [-1.6, 1.9], curves: [{ fn: sinN(1), color: 'gold', label: 'ψ₁⁰', labelAt: 0.1 }, { fn: sinN(2), color: 'violet', dash: [6, 4], label: 'ψ₂⁰', labelAt: 0.32, labelDy: 14 }], caption: t`The step (teal, not to scale), with $\psi_1^0$ and $\psi_2^0$. Adding a little $\psi_2^0$ with the right sign shifts the ground state’s weight to the left, off the step.` }),
          answer: ans, tol: { rel: 0.01 },
          errors: [{ value: Math.abs(v21), feedback: t`Divide by the energy gap $E_1^0 - E_2^0 = -3E_1^0$.` }, { value: Math.abs(v21 / 4), feedback: t`The gap is $E_1^0 - E_2^0 = (1 - 4)E_1^0$, not $4E_1^0$.` }],
          hints: [t`$E_m^0 = m^2E_1^0$, so $E_1^0 - E_2^0 = -3E_1^0$.`, t`$|c_2| = \dfrac{4V_0}{3\pi}\cdot\dfrac{1}{3E_1^0}$ with $V_0 = ${V}\,E_1^0$.`],
          teach: 'A perturbation mixes in other states with amplitude H′ₘₙ/(Eₙ⁰ − Eₘ⁰): strongly coupled, nearby states mix most.',
          explain: t`$|c_2| = \dfrac{4(${V})}{3\pi}\cdot\dfrac13 = ${fmt(ans, 3)}$. A few percent of $\psi_2^0$ is enough to tilt the ground state off the step, and the energy that saves is the second-order correction, $-|H'_{21}|^2/3E_1^0$ from this term.`,
        };
      },
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-ion', difficulty: 3, transfer: true,
      gen(r) {
        const f = r.pick([0.5, 1, 2]), E = r.pick([0.05, 0.1, 0.2, 0.5]);     // MHz, V/m
        const w = 2 * Math.PI * f * 1e6, dE = -((QE * E) ** 2) / (2 * M_CA40 * w * w), ans = (-dE / H) / 1e3;
        const x0 = (QE * E) / (M_CA40 * w * w);
        return {
          prompt: t`A single calcium-40 ion ($m = ${fmt(M_CA40 / U, 8)}$ u, charge $+e$) sits in a trap that holds it like a spring along $x$, with $\omega = 2\pi\times${f}$ MHz. A stray electric field $\mathcal E = ${E}$ V/m along $x$ adds $\hat H' = -e\mathcal E\hat x$. The first-order shift is zero, since $\langle n|\hat x|n\rangle = 0$; second order gives $E^2 = -e^2\mathcal E^2/2m\omega^2$ for every level. How big is that shift as a frequency, $|E^2|/h$, in kHz?`,
          visual: { type: 'graph', params: { x: [-3, 3], y: [-1.5, 4.5], aspect: 'wide', xlabel: 'x (scaled)', ylabel: 'energy (scaled)', axesAt: 'edge', xticks: 0, yticks: 0, curves: [{ fn: '0.5*x^2', color: 'ink3', width: 1.8, dash: [6, 4] }, { fn: '0.5*x^2 - 0.8*x', color: 'accent', width: 2.4 }, { fn: '-0.8*x', color: 'violet', width: 1.4, dash: [3, 3] }], points: [{ x: 0.8, y: -0.32, r: 5, color: 'gold', label: 'new minimum', labelDx: 8, labelDy: 12 }], legend: [{ label: 'trap alone', color: 'ink3', dash: [6, 4] }, { label: 'trap + stray field', color: 'accent' }], legendAt: 'tl' }, caption: 'The trap’s parabola, the linear potential of a stray field (violet), and their sum: the same parabola, moved over and down. Schematic: the real shift is tens to hundreds of nanometres.' },
          answer: ans, units: 'kHz', tol: { rel: 0.01 },
          errors: [{ value: ans * 2 * Math.PI, feedback: t`Divide by $h$, not $\hbar$, to turn an energy into an ordinary frequency.` }, { value: ans * (2 * Math.PI) ** 2, feedback: t`$\omega$ is the angular frequency, $2\pi\times${f}$ MHz.` }],
          hints: [t`$|E^2| = \dfrac{(e\mathcal E)^2}{2m\omega^2}$ in joules, with $m = ${fmt(M_CA40 / U, 8)}\times${tex(U, 6)}$ kg.`, t`Then divide by $h = ${tex(H, 9)}$ J s, and by 1000 for kHz.`],
          teach: 'For a linear push on an oscillator, second-order perturbation theory is exact: the parabola just shifts.',
          explain: t`$$\begin{gathered} |E^2| = \frac{(${tex(QE, 4)}\times${E})^2}{2(${tex(M_CA40, 4)})(${tex(w, 4)})^2} \\ = ${tex(-dE, 3)}\ \text{J}, \end{gathered}$$ or $${fmt(ans, 3)}$ kHz. Completing the square shows it is exact: $\tfrac12m\omega^2x^2 - e\mathcal Ex$ is the same parabola centred at $x_0 = e\mathcal E/m\omega^2 = ${fmt(x0 * 1e9, 3)}$ nm, lowered by $\tfrac12m\omega^2x_0^2$. Every level drops equally, so the trap frequency is untouched — but the ion is pushed off the trap’s centre, where the radio-frequency drive makes it jiggle (“micromotion”), which is why ion-trap clocks null stray fields to well below a volt per metre.`,
        };
      },
    }),
    num({
      id: 'cp-second', difficulty: 2,
      gen(r) {
        const n = r.pick([0, 1, 2]), eps = r.pick([0.1, 0.2, 0.3, -0.2]);
        const ans = (n + 0.5) * (1 + eps / 2 - eps * eps / 8);
        return {
          prompt: t`An oscillator’s spring constant changes by a fraction $\varepsilon = ${eps}$, so $\hat H' = \varepsilon\cdot\tfrac12m\omega^2\hat x^2$. Perturbation theory gives $E_n^1 = \tfrac12\varepsilon(n + \tfrac12)\hbar\omega$ and $E_n^2 = -\tfrac18\varepsilon^2(n + \tfrac12)\hbar\omega$. What is $E_${n}$ to second order, in units of $\hbar\omega$?`,
          visual: springPic(eps, t`The original potential (dashed) and the new one (blue) for $\varepsilon = ${eps}$, with the unperturbed levels at $(n + \tfrac12)\hbar\omega$.`),
          answer: ans, tol: { rel: 0, abs: 2e-4 },
          errors: [{ value: (n + 0.5) * (1 + eps / 2), feedback: 'That stops at first order: add E².' }, { value: (n + 0.5) * Math.sqrt(1 + eps), feedback: 'That is the exact answer, √(1 + ε)(n + ½). The question asks for the series to second order, which differs from it at order ε³.' }].filter((e) => Math.abs(e.value - ans) > 3e-4),
          hints: [t`$E_n \approx (n + \tfrac12)\hbar\omega\big(1 + \tfrac12\varepsilon - \tfrac18\varepsilon^2\big)$.`],
          teach: 'The perturbation series for a stiffened oscillator is the Taylor series of √(1 + ε).',
          explain: t`$(${n} + \tfrac12)(1 ${eps < 0 ? '-' : '+'} ${Math.abs(eps / 2)} - ${fmt((eps * eps) / 8, 4)}) = ${fmt(ans, 5)}\,\hbar\omega$, against the exact $${fmt((n + 0.5) * Math.sqrt(1 + eps), 5)}\,\hbar\omega$.`,
        };
      },
    }),
    mcq({
      id: 'cp-degenerate', difficulty: 3,
      prompt: t`Why can’t the second-order formula $E_n^2 = \sum_{m\ne n}|H'_{mn}|^2/(E_n^0 - E_m^0)$ be used for a level that another state $m$ shares, $E_m^0 = E_n^0$?`,
      visual: { type: 'graph', params: { x: [0, 10], y: [5, 35], aspect: 'wide', xlabel: 'coupling V (meV)', ylabel: 'energy (meV)', axesAt: 'edge', xticks: 5, yticks: 4, curves: [{ fn: '20 + x', color: 'gold', width: 2.6 }, { fn: '20 - x', color: 'gold', width: 2.6 }, { fn: '20 + x^2/0.4', color: 'accent', width: 2, dash: [6, 4] }, { fn: '20 - x^2/0.4', color: 'accent', width: 2, dash: [6, 4] }], legend: [{ label: 'exact', color: 'gold' }, { label: 'second-order formula, nearly degenerate', color: 'accent', dash: [6, 4] }], legendAt: 'tl' }, caption: 'Two levels 0.4 meV apart, coupled by V: the second-order formula (dashed) shoots off as V²/0.4, while the exact energies (gold) split linearly, ±V. At exact degeneracy the formula divides by zero.' },
      choices: [
        t`A term has zero denominator; the fix is to first pick the combinations of the degenerate states that $\hat H'$ does not mix, and those are fixed by diagonalizing $\hat H'$ within the degenerate level`,
        t`It can, since the sum simply skips $m = n$`,
        t`Degenerate levels are never shifted by a perturbation`,
        t`The first-order shift is always zero for degenerate levels, so second order is all that matters`,
      ],
      answer: 0,
      why: {
        1: t`It skips $m = n$, but not the other state $m$ with the same energy — and that term divides by $E_n^0 - E_m^0 = 0$.`,
        2: t`They usually are — often more strongly, at first order: that is the linear Stark effect of hydrogen’s $n = 2$ level, next lesson.`,
        3: t`Within the degenerate level the first-order shifts are the eigenvalues of $\hat H'$ there, usually not zero.`,
      },
      hints: [t`What is the denominator for the other state at the same energy?`, t`Unless $H'_{mn} = 0$ for it, the term blows up. Which basis of the degenerate level makes $H'_{mn} = 0$?`],
      teach: 'Degenerate perturbation theory first diagonalizes H′ within the degenerate level, choosing the “good” states.',
      explain: t`With $E_m^0 = E_n^0$ the term $|H'_{mn}|^2/0$ diverges unless $H'_{mn} = 0$. Inside a degenerate level any combination is an eigenstate of $\hat H^0$, so choose the combinations that diagonalize $\hat H'$ there: then the dangerous matrix elements vanish, and the first-order shifts are the eigenvalues. That is the next lesson, [degenerate perturbation theory](#/lesson/phys4700.M8.2).`,
    }),
  ],
  sources: [
    { label: 'Griffiths & Schroeter, Introduction to Quantum Mechanics, 3rd ed., §7.1', url: 'https://www.cambridge.org/9781316995433' },
    { label: 'Sakurai & Napolitano, Modern Quantum Mechanics, 3rd ed., §5.1', url: 'https://www.cambridge.org/9781108473224' },
    { label: 'AME2020 atomic masses (calcium-40)', url: 'https://www-nds.iaea.org/amdc/' },
  ],
});
