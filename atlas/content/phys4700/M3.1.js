// Separation of variables and stationary states (Griffiths & Schroeter §2.1).
// Derived: Ψ = ψ(x)e^{−iEt/ħ} from the time-dependent equation; the general
// solution Σ cₙψₙe^{−iEₙt/ħ}; P(Eₙ) = |cₙ|² and ⟨H⟩ = Σ|cₙ|²Eₙ; why a single
// stationary state has frozen |Ψ|² and every expectation value constant, while
// a superposition sloshes at (E₂ − E₁)/ħ. phys4700.M2.1 met the sloshing in a
// harmonic well; this lesson separates the variables and counts the phases.
// Infinite-well numbers come from model/mp-schrodinger.js (CODATA 2022).
// The hyperfine frequencies: caesium-133 (exact, SI), rubidium-87 (Steck,
// "Rubidium 87 D Line Data"), hydrogen (Hellwig et al. 1970).
import { lesson, mcq, multi, num, order } from '../../src/core/content.js';
import { fmt, tex } from '../../src/core/format.js';
import { H, QE } from './_qm.js';
import { En, H_EVFS, boxPic, energyBars, boxFn, r6 } from './_wells.js';

const t = String.raw;
const XINT = 16 / (9 * Math.PI ** 2);          // |∫₀¹ x·2 sin(πx) sin(2πx) dx|, so ⟨x⟩ swings by 2c₁c₂·XINT·L

/** |Ψ|² at time phase φ (radians of the relative phase) for c₁ψ₁ + c₂ψ₂ in a box of width L, as a graph expression. */
const mixDensity = (c1, c2, L, phi) => `(${boxFn(1, L, c1)})^2 + (${boxFn(2, L, c2)})^2 + 2*(${boxFn(1, L, c1)})*(${boxFn(2, L, c2)})*${r6(Math.cos(phi))}`;

/** Small complex coefficients for P(Eₙ) problems. */
const COEF = [
  { tex: '2', a2: 4, re: 2 }, { tex: 'i', a2: 1, re: 0 }, { tex: '-i', a2: 1, re: 0 }, { tex: '(1+i)', a2: 2, re: 1 },
  { tex: '3', a2: 9, re: 3 }, { tex: '(1-2i)', a2: 5, re: 1 }, { tex: '2i', a2: 4, re: 0 }, { tex: '-2', a2: 4, re: -2 },
];
const joinTerms = (cs, ns) => cs.map((c, j) => {
  const body = `${c.tex}\\,\\psi_{${ns[j]}}`;
  if (j === 0) return body;
  return c.tex.startsWith('-') ? ` - ${body.slice(1)}` : ` + ${body}`;
}).join('');

export default lesson({
  id: 'phys4700.M3.1',
  title: 'Separation of variables and stationary states',
  minutes: 16, difficulty: 3,
  intro: t`When the potential does not depend on time, try a solution that is a product, $\Psi(x, t) = \psi(x)\,\varphi(t)$. The Schrödinger equation splits into two: $\varphi(t) = e^{-iEt/\hbar}$, and the **time-independent Schrödinger equation** $\hat H\psi = E\psi$ for the shape. Each solution $\psi_n$ is a **stationary state**: its phase turns, but $|\Psi|^2$ and every expectation value stay fixed. Because the equation is linear, every other solution is a sum of them, **each with its own phase**:

$$\Psi(x, t) = \sum_n c_n\,\psi_n(x)\,e^{-iE_nt/\hbar}$$

An energy measurement gives $E_n$ with probability $|c_n|^2$. A mixture of different energies does move: the phases drift apart at $(E_m - E_n)/\hbar$, and $|\Psi|^2$ sloshes.`,
  symbols: [
    { tex: '\\Psi(x, t)', text: t`the full wave function, in $\text{m}^{-1/2}$ in one dimension; $|\Psi|^2$ is the probability density` },
    { tex: '\\psi_n(x)', text: t`the $n$-th solution of $\hat H\psi = E\psi$: a stationary state’s shape, normalized so $\int|\psi_n|^2dx = 1$` },
    { tex: 'E_n', text: t`the energy of that state, in joules or eV: the constant left over when the variables are separated` },
    { tex: 'c_n', text: t`a complex number, fixed in time: the amount of $\psi_n$ in the mixture, with $\sum|c_n|^2 = 1$` },
    { tex: 'e^{-iE_nt/\\hbar}', text: t`the phase factor: a unit arrow in the complex plane turning clockwise at angular frequency $E_n/\hbar$` },
    { tex: '\\hbar', text: t`the reduced Planck constant, $h/2\pi = ${tex(H / (2 * Math.PI), 6)}$ J s` },
  ],
  why: 'Almost every problem in quantum mechanics is solved this way: find the stationary states and their energies once, expand the starting state in them, and attach a phase to each term.',
  visual: {
    type: 'graph',
    title: 'One state turns; two states slosh',
    lead: t`An electron in an infinite well, in the mixture $\sqrt{1 - w}\,\psi_1 + \sqrt{w}\,\psi_2$. Drag the time $s$ (in units of $T_1 = h/E_1$, the ground state’s phase period) and watch the real part (blue), the imaginary part (orange, dashed) and the density $|\Psi|^2$ (gold).`,
    tasks: [
      'With w = 0, drag s: Re Ψ and Im Ψ trade places, but the gold |Ψ|² never moves. That is a stationary state.',
      'Set w = 0.5 and drag s from 0 to 1/3: the density swings from the left half to the right and back, and ⟨x⟩ follows.',
      'Try w = 0.1: the swing is smaller but has the same period, T₁/3 — set by E₂ − E₁ = 3E₁ alone.',
    ],
    params: {
      x: [0, 1], y: [-2.6, 4.2], aspect: 'wide', xlabel: 'x / L', ylabel: 'Ψ and |Ψ|² (in units of L⁻½ and L⁻¹)', axesAt: 'edge', xticks: 5, yticks: 6,
      sliders: [
        { key: 'w', label: 'Weight of $\\psi_2$: $w = |c_2|^2$', min: 0, max: 1, step: 0.05, value: 0, explain: 'The probability that an energy measurement gives E₂ (the rest gives E₁).' },
        { key: 's', label: 'Time $t/T_1$', min: 0, max: 1, step: 0.005, value: 0, explain: 'Time in units of h/E₁, one full turn of the ground state’s phase.' },
      ],
      curves: [
        { fn: '2*((1 - w)*sin(pi*x)^2 + w*sin(2*pi*x)^2 + 2*sqrt(w*(1 - w))*sin(pi*x)*sin(2*pi*x)*cos(6*pi*s))', color: 'gold', width: 2.8 },
        { fn: 'sqrt(2)*(sqrt(1 - w)*sin(pi*x)*cos(2*pi*s) + sqrt(w)*sin(2*pi*x)*cos(8*pi*s))', color: 'accent', width: 2 },
        { fn: '-sqrt(2)*(sqrt(1 - w)*sin(pi*x)*sin(2*pi*s) + sqrt(w)*sin(2*pi*x)*sin(8*pi*s))', color: 'warn', width: 2, dash: [6, 4] },
      ],
      shade: [{ fn: '2*((1 - w)*sin(pi*x)^2 + w*sin(2*pi*x)^2 + 2*sqrt(w*(1 - w))*sin(pi*x)*sin(2*pi*x)*cos(6*pi*s))', from: 0, to: 1, color: 'gold', alpha: 0.15 }],
      vlines: [{ x: `0.5 - ${r6(2 * XINT)}*sqrt(w*(1 - w))*cos(6*pi*s)`, color: 'good', label: '⟨x⟩' }],
      legend: [{ label: '|Ψ|²', color: 'gold' }, { label: 'Re Ψ', color: 'accent' }, { label: 'Im Ψ', color: 'warn', dash: [6, 4] }], legendAt: 'tr',
      readouts: [
        { label: '$\\langle x\\rangle / L$', expr: `0.5 - ${r6(2 * XINT)}*sqrt(w*(1 - w))*cos(6*pi*s)`, digits: 3 },
        { label: '$\\langle H\\rangle / E_1$', expr: '1 + 3*w', digits: 3 },
      ],
    },
    caption: t`Exact: $\psi_n = \sqrt{2/L}\,\sin(n\pi x/L)$, $E_2 = 4E_1$. For an electron in a 1 nm well, $T_1 = ${fmt(H_EVFS / En(1, 1), 3)}$ fs. Re and Im are drawn at the same scale as the density, in units of $L^{-1/2}$ and $L^{-1}$.`,
  },
  example: {
    prompt: t`An electron in an infinite well $L = 1$ nm wide starts in $\Psi(x, 0) = \tfrac15\big(3\psi_1(x) + 4\psi_2(x)\big)$. Separate the variables, write $\Psi(x, t)$, and find the energy probabilities, $\langle H\rangle$, and how $\langle x\rangle$ moves.`,
    visual: boxPic({
      L: 1, y: [0, 3.6], ylabel: '|Ψ|² (nm⁻¹)',
      curves: [{ fn: mixDensity(0.6, 0.8, 1, 0), color: 'gold', label: 't = 0', labelAt: 0.14 }, { fn: mixDensity(0.6, 0.8, 1, Math.PI), color: 'violet', dash: [6, 4], label: 'half a period later', labelAt: 0.6, labelDy: -14 }],
      caption: t`$|\Psi|^2$ at $t = 0$ and half a sloshing period later. Exact for the ideal infinite well.`,
    }),
    steps: [
      { label: 'Separate', text: t`Put $\Psi = \psi(x)\varphi(t)$ into $i\hbar\,\partial_t\Psi = -\tfrac{\hbar^2}{2m}\partial_x^2\Psi + V\Psi$ and divide by $\psi\varphi$: $i\hbar\,\dfrac{\varphi'}{\varphi} = \dfrac{1}{\psi}\Big(-\tfrac{\hbar^2}{2m}\psi'' + V\psi\Big)$. The left side depends only on $t$, the right only on $x$, so both equal one constant, $E$.` },
      { label: 'Solve each half', text: t`$\varphi' = -\tfrac{iE}{\hbar}\varphi$ gives $\varphi = e^{-iEt/\hbar}$. The $x$ half is $\hat H\psi = E\psi$; for this well its solutions are $\psi_n = \sqrt{2/L}\sin(n\pi x/L)$ with $E_n = n^2E_1$, $E_1 = \pi^2\hbar^2/2mL^2 = ${fmt(En(1, 1), 4)}$ eV.` },
      { label: 'Attach the phases', text: t`$\Psi(x, t) = \tfrac35\,\psi_1e^{-iE_1t/\hbar} + \tfrac45\,\psi_2e^{-iE_2t/\hbar}$. Each term keeps its own clock. It matches $\Psi(x, 0)$ at $t = 0$, and the Schrödinger equation is linear, so this is *the* solution.` },
      { label: 'Probabilities', text: t`$P(E_1) = (3/5)^2 = 0.36$ and $P(E_2) = (4/5)^2 = 0.64$, adding to 1. $\langle H\rangle = 0.36\,E_1 + 0.64\times4E_1 = 2.92\,E_1 = ${fmt(2.92 * En(1, 1), 4)}$ eV — an energy no single measurement ever gives.` },
      { label: 'The density moves', text: t`$|\Psi|^2 = \tfrac{9}{25}\psi_1^2 + \tfrac{16}{25}\psi_2^2 + \tfrac{24}{25}\psi_1\psi_2\cos\omega t$, with $\omega = (E_2 - E_1)/\hbar$. Only the cross term moves. Since $\int x\,\psi_1\psi_2\,dx = -\tfrac{16}{9\pi^2}L$, $\langle x\rangle = \tfrac L2 - \tfrac{24}{25}\cdot\tfrac{16}{9\pi^2}L\cos\omega t = 0.5 - ${fmt(0.96 * XINT, 3)}\cos\omega t$ nm.` },
      { label: 'Sense check', text: t`The period is $h/(E_2 - E_1) = ${fmt(H_EVFS, 5)}\ \text{eV fs}/${fmt(3 * En(1, 1), 4)}\ \text{eV} = ${fmt(H_EVFS / (3 * En(1, 1)), 3)}$ fs: femtoseconds, the time scale of electrons in atoms and molecules. The swing, $${fmt(0.96 * XINT, 3)}$ nm, keeps $\langle x\rangle$ inside the well, as it must.` },
    ],
    answer: t`$\Psi = \tfrac35\psi_1e^{-iE_1t/\hbar} + \tfrac45\psi_2e^{-iE_2t/\hbar}$; $P(E_1) = 0.36$, $P(E_2) = 0.64$; $\langle H\rangle = ${fmt(2.92 * En(1, 1), 3)}$ eV; $\langle x\rangle$ swings by $\pm${fmt(0.96 * XINT, 3)}$ nm about the centre with period $${fmt(H_EVFS / (3 * En(1, 1)), 3)}$ fs.`,
  },
  practice: [
    mcq({
      id: 'what-turns', difficulty: 1,
      prompt: t`An electron is in the stationary state $\Psi = \psi_3(x)\,e^{-iE_3t/\hbar}$ of an infinite well. Which of these changes as time passes?`,
      visual: boxPic({
        L: 1, y: [-1.6, 2.2], ylabel: 'Re Ψ and |Ψ|²',
        curves: [
          { fn: boxFn(3, 1), color: 'accent', label: 'Re Ψ, t = 0', labelAt: 0.44, labelDy: 20 },
          { fn: boxFn(3, 1, 0.5), color: 'accent', dash: [6, 4], label: 'a sixth of a turn later', labelAt: 0.36, labelDy: 16 },
          { fn: `(${boxFn(3, 1)})^2`, color: 'gold', width: 2.6, label: '|Ψ|²', labelAt: 0.83, labelDy: -10 },
        ],
        caption: t`The real part at two moments, and the density. The density curve is the same at every moment.`,
      }),
      choices: [t`$\operatorname{Re}\Psi$ at a fixed point`, t`$|\Psi|^2$ at a fixed point`, t`$\langle x\rangle$`, t`The probability that an energy measurement gives $E_3$`],
      answer: 0,
      why: {
        1: t`$|e^{-iE_3t/\hbar}|^2 = 1$, so $|\Psi|^2 = |\psi_3|^2$ for all time.`,
        2: t`$\langle x\rangle = \int x|\Psi|^2dx$, and $|\Psi|^2$ does not change.`,
        3: t`That probability is $|c_3|^2 = 1$, fixed: the $c_n$ never change in a time-independent potential.`,
      },
      hints: [t`What is the modulus of $e^{-iEt/\hbar}$?`, t`The phase factor rotates $\Psi$ in the complex plane; its real part is $\psi_3\cos(E_3t/\hbar)$.`],
      teach: 'A stationary state is not static: its phase turns at E/ħ, but nothing measurable depends on an overall phase.',
      explain: t`$\operatorname{Re}\Psi = \psi_3\cos(E_3t/\hbar)$ oscillates, and so does $\operatorname{Im}\Psi$. But every measurable quantity uses $\Psi^*$ and $\Psi$ together, where the phase cancels: $|\Psi|^2$, $\langle x\rangle$ and $P(E_3) = 1$ are all frozen.`,
    }),
    num({
      id: 'energy-mean', difficulty: 2,
      gen(r) {
        const [a, b] = r.pick([[1, 2], [1, 3], [2, 3], [1, 4], [2, 4]]);
        const [p, q] = r.pick([[3, 4], [4, 3], [1, 2], [2, 1], [1, 3], [3, 1]]);
        const L = r.pick([0.5, 0.8, 1, 1.5, 2]);
        const N2 = p * p + q * q, Ea = En(a, L), Eb = En(b, L);
        const ans = (p * p * Ea + q * q * Eb) / N2;
        return {
          prompt: t`An electron in an infinite well $L = ${L}$ nm wide is in $\Psi(x, 0) = \tfrac{1}{\sqrt{${N2}}}\big(${p === 1 ? '' : p}\,\psi_{${a}} + ${q === 1 ? '' : q}\,\psi_{${b}}\big)$. What is $\langle H\rangle$, in eV? (For this well, $E_n = n^2\pi^2\hbar^2/2mL^2$ and $\hbar^2/2m_e = ${fmt(En(1, 1) / Math.PI ** 2, 5)}$ eV nm².)`,
          visual: energyBars([{ E: Ea, p: p * p / N2, label: `E${'₀₁₂₃₄'[a]}` }, { E: Eb, p: q * q / N2, label: `E${'₀₁₂₃₄'[b]}`, color: 'violet' }], { xmax: Eb * 1.2, caption: 'The two energies a measurement can give, as bars of height |cₙ|². The average sits between them.' }),
          answer: ans, units: 'eV', tol: { rel: 0.005 },
          errors: [
            { value: (Ea + Eb) / 2, feedback: t`Weight each energy by its probability $|c_n|^2$, not equally.` },
            { value: (p * Ea + q * Eb) / (p + q), feedback: t`Weight by the probabilities $|c_n|^2 = ${p * p}/${N2}$ and $${q * q}/${N2}$, not by the amplitudes.` },
          ].filter((e) => Math.abs(e.value - ans) > 0.01 * ans),
          hints: [t`$\langle H\rangle = \sum_n |c_n|^2E_n$.`, t`$E_{${a}} = ${fmt(Ea, 4)}$ eV and $E_{${b}} = ${fmt(Eb, 4)}$ eV; the probabilities are $${p * p}/${N2}$ and $${q * q}/${N2}$.`],
          teach: t`The mean energy weights each allowed $E_n$ by its probability $|c_n|^2$; it is constant in time.`,
          explain: t`$\langle H\rangle = \tfrac{${p * p}}{${N2}}(${fmt(Ea, 4)}) + \tfrac{${q * q}}{${N2}}(${fmt(Eb, 4)}) = ${fmt(ans, 4)}$ eV. Individual measurements give only $${fmt(Ea, 3)}$ eV or $${fmt(Eb, 3)}$ eV.`,
        };
      },
    }),
    num({
      id: 'slosh-period', difficulty: 2,
      gen(r) {
        const [a, b] = r.pick([[1, 2], [1, 3], [2, 3], [2, 4], [3, 4]]);
        const L = r.pick([0.5, 1, 2, 3]);
        const dE = En(b, L) - En(a, L), ans = H_EVFS / dE;
        return {
          prompt: t`An electron in an infinite well $L = ${L}$ nm wide is in $\tfrac{1}{\sqrt2}(\psi_{${a}} + \psi_{${b}})$. With what period does its probability density slosh, in fs? ($E_1 = ${fmt(En(1, L), 4)}$ eV for this well, $E_n = n^2E_1$, and $h = ${fmt(H_EVFS, 6)}$ eV fs.)`,
          visual: { type: 'mp-schrodinger', params: { mode: 'bound', well: 'infinite', L, n: a, super: [a, b], play: false, controls: false, readout: false, panels: ['energy', 'wave'], hide: ['energy'] }, caption: 'The superposition’s levels and density at one moment. The well is ideal; the axes are in nm and eV.' },
          answer: ans, units: 'fs', tol: { rel: 0.005 },
          errors: [
            { value: ans / (2 * Math.PI), feedback: t`That is $\hbar/\Delta E$, one radian of the beat. A full period is $2\pi\hbar/\Delta E = h/\Delta E$.` },
            { value: H_EVFS / En(b, L), feedback: t`That is the period of one phase factor. The density moves only through the *difference* of the two phases: use $E_${b} - E_${a}$.` },
            { value: H_EVFS / (En(a, L) + En(b, L)), feedback: t`Phases subtract in $\Psi^*\Psi$: use $E_${b} - E_${a}$, not the sum.` },
          ].filter((e) => Math.abs(e.value - ans) > 0.01 * ans),
          hints: [t`The cross term in $|\Psi|^2$ goes as $\cos\big((E_${b} - E_${a})t/\hbar\big)$.`, t`Period $= h/(E_${b} - E_${a})$ with $E_${b} - E_${a} = ${b * b - a * a}E_1$.`],
          teach: 'A superposition of two energies beats at their difference: period h/(E₂ − E₁).',
          explain: t`$E_${b} - E_${a} = ${b * b - a * a}\times${fmt(En(1, L), 4)} = ${fmt(dE, 4)}$ eV, so the period is $${fmt(H_EVFS, 5)}/${fmt(dE, 4)} = ${fmt(ans, 3)}$ fs. A wider well has closer levels and sloshes more slowly ($\propto L^2$).`,
        };
      },
    }),
    mcq({
      id: 'common-phase', difficulty: 3, kind: 'error',
      prompt: t`A student writes the time dependence of $\Psi(x, 0) = \tfrac{1}{\sqrt2}(\psi_1 + \psi_2)$ as

$$\Psi(x, t) = \tfrac{1}{\sqrt2}\big(\psi_1 + \psi_2\big)\,e^{-i(E_1 + E_2)t/2\hbar}$$

and concludes that $|\Psi|^2$ never changes. What went wrong?`,
      visual: boxPic({
        L: 1, y: [0, 4], ylabel: '|Ψ|² (nm⁻¹)',
        curves: [{ fn: mixDensity(Math.SQRT1_2, Math.SQRT1_2, 1, 0), color: 'gold', label: 't = 0', labelAt: 0.12 }, { fn: mixDensity(Math.SQRT1_2, Math.SQRT1_2, 1, Math.PI), color: 'violet', dash: [6, 4], label: 'half a period later', labelAt: 0.62 }],
        caption: t`What the true $|\Psi|^2$ of this state does in a 1 nm well: it moves.`,
      }),
      choices: [
        t`$\tfrac{1}{\sqrt2}(\psi_1 + \psi_2)$ is not a solution of $\hat H\psi = E\psi$, so it cannot carry a single phase factor; each term needs its own, $e^{-iE_1t/\hbar}$ and $e^{-iE_2t/\hbar}$`,
        t`The phase should be $e^{+i(E_1 + E_2)t/2\hbar}$`,
        t`The normalization changes with time, so $\tfrac{1}{\sqrt2}$ must be replaced`,
        t`Nothing: the mean energy $(E_1 + E_2)/2$ sets the phase, and $|\Psi|^2$ is indeed constant`,
      ],
      answer: 0,
      why: {
        1: 'The sign convention is not the problem: any single overall phase, of either sign, would still cancel in |Ψ|².',
        2: t`Normalization is preserved by the Schrödinger equation; $\sum|c_n|^2$ stays 1.`,
        3: t`$(E_1 + E_2)/2$ is $\langle H\rangle$, but it is not an eigenvalue: no state with that energy exists, and the density does move.`,
      },
      hints: [t`Is $\tfrac{1}{\sqrt2}(\psi_1 + \psi_2)$ a solution of $\hat H\psi = E\psi$ for any single $E$?`, t`Separation of variables gives $e^{-iEt/\hbar}$ only for an energy eigenstate. Evolve each term separately.`],
      teach: 'Only an energy eigenstate evolves by one overall phase; a superposition carries a different phase on each term, which is why it moves.',
      explain: t`$\hat H(\psi_1 + \psi_2) = E_1\psi_1 + E_2\psi_2$, which is not a multiple of $\psi_1 + \psi_2$. The correct $\Psi = \tfrac{1}{\sqrt2}(\psi_1e^{-iE_1t/\hbar} + \psi_2e^{-iE_2t/\hbar})$ has a cross term $\psi_1\psi_2\cos\big((E_2 - E_1)t/\hbar\big)$ in $|\Psi|^2$. A third of incoming graduate students make this slip in surveys.`,
    }),
    order({
      id: 'separate-steps', difficulty: 2,
      prompt: t`Put the steps of solving $i\hbar\,\partial_t\Psi = \hat H\Psi$ for a given $\Psi(x, 0)$ in order.`,
      items: [
        t`Guess $\Psi = \psi(x)\varphi(t)$ and divide through by $\psi\varphi$.`,
        t`Each side depends on one variable only, so both equal a constant $E$.`,
        t`Solve $\varphi = e^{-iEt/\hbar}$ and $\hat H\psi_n = E_n\psi_n$.`,
        t`Expand the start: $\Psi(x, 0) = \sum c_n\psi_n$.`,
        t`Attach a phase to each term: $\Psi = \sum c_n\psi_ne^{-iE_nt/\hbar}$.`,
      ],
      visual: energyBars([{ E: 1, p: 0.36, label: 'c₁' }, { E: 4, p: 0.64, label: 'c₂', color: 'violet' }, { E: 9, p: 0.02, label: 'c₃', color: 'teal' }], { xmax: 10.5, xlabel: 'energy (units of E₁)', ylabel: '|cₙ|²', caption: 'The end product of the recipe: a spectrum of weights |cₙ|² on the allowed energies, each term turning at its own rate. Illustrative weights.' }),
      hints: ['The separation constant has to exist before either half can be solved.', 'You need the stationary states before you can expand anything in them.'],
      teach: 'Separate, solve the shape equation for its eigenstates, expand the initial state in them, and give each term its own phase.',
      explain: t`Separate → constant $E$ → solve both halves → expand $\Psi(x, 0)$ → attach $e^{-iE_nt/\hbar}$ to each term. The $c_n$ come from the starting state (next lesson: Fourier’s trick), and they never change.`,
    }),
    num({
      id: 'prob-En', difficulty: 2,
      gen(r) {
        const idx = r.shuffle([0, 1, 2, 3, 4, 5, 6, 7]).slice(0, 3);
        const cs = idx.map((i) => COEF[i]);
        const ns = r.pick([[1, 2, 3], [1, 2, 4], [1, 3, 5], [2, 3, 4]]);
        const k = r.int(0, 2);
        const N2 = cs.reduce((s, c) => s + c.a2, 0);
        const ans = cs[k].a2 / N2;
        const amp = Math.sqrt(cs[k].a2) / cs.reduce((s, c) => s + Math.sqrt(c.a2), 0);
        const re2 = cs.reduce((s, c) => s + c.re * c.re, 0);
        return {
          prompt: t`A particle in an infinite well is in $\Psi(x, 0) = A\bigl(${joinTerms(cs, ns)}\bigr)$, where the $\psi_n$ are the normalized stationary states. What is the probability that a measurement of its energy gives $E_{${ns[k]}}$?`,
          visual: boxPic({ L: 1, y: [-1.7, 1.7], ylabel: 'ψₙ (nm⁻½)', curves: ns.map((n, j) => ({ n, color: ['accent', 'violet', 'teal'][j], label: `ψ${'₀₁₂₃₄₅'[n]}`, labelAt: [0.06, 0.3, 0.55][j], labelDy: j === 1 ? 14 : -12 })), caption: 'The three stationary states in the mixture (here in a 1 nm well). They are orthonormal, which is why the probabilities are just the squared coefficients.' }),
          answer: ans, tol: { rel: 0.005, abs: 1e-4 },
          errors: [
            { value: amp, feedback: t`Square the moduli: the probability is $|c_n|^2/\sum|c_j|^2$, not $|c_n|/\sum|c_j|$.` },
            { value: re2 > 0 ? (cs[k].re * cs[k].re) / re2 : NaN, feedback: t`A coefficient like $i$ or $1 - 2i$ has modulus squared $c^*c$: $|i|^2 = 1$, $|1 - 2i|^2 = 5$. Do not drop the imaginary parts.` },
            { value: cs[k].a2, feedback: t`Normalize first: $|A|^2 = 1/\sum|c_j|^2 = 1/${N2}$.` },
          ].filter((e) => Number.isFinite(e.value) && Math.abs(e.value - ans) > 0.02),
          hints: [t`Choose $A$ so that $|A|^2\sum|c_j|^2 = 1$; orthonormality makes the cross terms vanish.`, t`$|A|^2 = 1/${N2}$, and $P(E_{${ns[k]}}) = |A|^2\,|${cs[k].tex.replace(/[()]/g, '')}|^2$.`],
          teach: t`In an orthonormal expansion, $P(E_n) = |c_n|^2$ once the state is normalized; complex coefficients count through $c^*c$.`,
          explain: t`$\sum|c_j|^2 = ${cs.map((c) => c.a2).join(' + ')} = ${N2}$, so $P(E_{${ns[k]}}) = ${cs[k].a2}/${N2} = ${fmt(ans, 4)}$. The phases of the coefficients do not affect energy probabilities — but they do decide where the density sits.`,
        };
      },
    }),
    multi({
      id: 'what-changes', difficulty: 3,
      prompt: t`An electron in an infinite well is in $\Psi = \tfrac{1}{\sqrt2}\big(\psi_1e^{-iE_1t/\hbar} + \psi_2e^{-iE_2t/\hbar}\big)$. Which of these change with time? Select all that do.`,
      visual: { type: 'mp-schrodinger', params: { mode: 'bound', well: 'infinite', L: 1, n: 1, super: [1, 2], play: false, controls: false, readout: false, panels: ['energy', 'wave'], t: 0.6 }, caption: 'The superposition at one moment (1 nm well, ideal walls). In the Explore step you can watch it move.' },
      choices: [t`$\langle x\rangle$`, t`$\langle p\rangle$`, t`$|\Psi|^2$ at $x = L/4$`, t`$\langle H\rangle$`, t`$P(E_2)$`, t`$|\Psi|^2$ at $x = L/2$`],
      answer: [0, 1, 2],
      why: {
        3: t`$\langle H\rangle = \tfrac12(E_1 + E_2)$: the $c_n$ are fixed, so the mean energy is conserved.`,
        4: t`$P(E_2) = |c_2|^2 = \tfrac12$ always: the phase factor has modulus 1.`,
        5: t`$\psi_2(L/2) = \sqrt{2/L}\sin\pi = 0$, so at the centre the cross term vanishes and $|\Psi|^2 = \tfrac12\psi_1(L/2)^2$ for all time — a node of $\psi_2$ is a fixed point of the sloshing.`,
      },
      hints: [t`Only the cross term $\psi_1\psi_2\cos\omega t$ in $|\Psi|^2$ moves. Where does it vanish?`, t`$\langle p\rangle = m\,d\langle x\rangle/dt$ (Ehrenfest).`],
      teach: 'In a superposition, quantities built from the density move through the cross term, while energy probabilities and ⟨H⟩ stay fixed.',
      explain: t`$|\Psi|^2 = \tfrac12\big(\psi_1^2 + \psi_2^2 + 2\psi_1\psi_2\cos\omega t\big)$ moves wherever $\psi_1\psi_2 \neq 0$ — at $L/4$, but not at $L/2$, a node of $\psi_2$. So $\langle x\rangle$ oscillates and $\langle p\rangle = m\,d\langle x\rangle/dt$ with it, while $\langle H\rangle$ and both $P(E_n)$ are constants of the motion.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-x-swing', difficulty: 3,
      gen(r) {
        const [p, q] = r.pick([[3, 4], [4, 3], [1, 1], [1, 2], [2, 1], [5, 12]]);
        const L = r.pick([0.6, 1, 2, 4]);
        const N = Math.hypot(p, q), c1 = p / N, c2 = q / N;
        const ans = 2 * c1 * c2 * XINT * L;
        return {
          prompt: t`An electron in an infinite well $L = ${L}$ nm wide starts in $\tfrac{1}{${Number.isInteger(N) ? N : t`\sqrt{${p * p + q * q}}`}}\big(${p === 1 ? '' : p}\,\psi_1 + ${q === 1 ? '' : q}\,\psi_2\big)$. Its $\langle x\rangle$ oscillates about $L/2$. What is the amplitude of that oscillation, in nm? (Use $\int_0^L x\,\psi_1\psi_2\,dx = -\tfrac{16}{9\pi^2}L$.)`,
          visual: boxPic({ L, y: [0, r6(4 / L)], ylabel: '|Ψ|² (nm⁻¹)', curves: [{ fn: mixDensity(c1, c2, L, 0), color: 'gold' }], shade: [{ fn: mixDensity(c1, c2, L, 0), from: 0, to: r6(L), color: 'gold', alpha: 0.15 }], caption: t`$|\Psi|^2$ at $t = 0$, ideal infinite well.` }),
          answer: ans, units: 'nm', tol: { rel: 0.005 },
          errors: [
            { value: c1 * c2 * XINT * L, feedback: t`The cross term in $|\Psi|^2$ is $2c_1c_2\psi_1\psi_2\cos\omega t$: keep the factor 2.` },
            { value: 2 * (p * q) * XINT * L, feedback: t`Normalize the coefficients first: $c_1 = ${p}/${fmt(N, 4)}$, $c_2 = ${q}/${fmt(N, 4)}$.` },
          ].filter((e) => Math.abs(e.value - ans) > 0.01 * ans),
          hints: [t`$\langle x\rangle = c_1^2\langle x\rangle_1 + c_2^2\langle x\rangle_2 + 2c_1c_2\cos\omega t\int x\psi_1\psi_2\,dx$, and $\langle x\rangle_1 = \langle x\rangle_2 = L/2$.`, t`The amplitude is $2c_1c_2\cdot\tfrac{16}{9\pi^2}L$.`],
          teach: 'Only the cross term moves ⟨x⟩, with amplitude 2c₁c₂ times the overlap integral of x between the two states.',
          explain: t`$2c_1c_2 = ${fmt(2 * c1 * c2, 4)}$ and $\tfrac{16}{9\pi^2}L = ${fmt(XINT * L, 4)}$ nm, so $\langle x\rangle$ swings by $\pm${fmt(ans, 3)}$ nm. Equal weights ($c_1 = c_2$) give the largest swing, $0.180L$.`,
        };
      },
    }),
    mcq({
      id: 'cp-after-measure', difficulty: 2,
      prompt: t`An electron starts in $\tfrac15(3\psi_1 + 4\psi_2)$. Its energy is measured and the result is $E_2$. What happens afterwards?`,
      visual: energyBars([{ E: 1, p: 0.36, label: '0.36' }, { E: 4, p: 0.64, label: '0.64', color: 'violet' }], { xmax: 5, xlabel: 'energy (units of E₁)', caption: 'The probabilities of the two results before the measurement.' }),
      choices: [
        t`The state is now $\psi_2e^{-iE_2t/\hbar}$: $|\Psi|^2$ stops sloshing, and a second energy measurement gives $E_2$ for certain`,
        t`The state is still $\tfrac15(3\psi_1 + 4\psi_2)$; a second measurement again gives $E_1$ with probability 0.36`,
        t`The state is now $\psi_2$, but it decays back into the mixture after a sloshing period`,
        t`The state jumps to the ground state $\psi_1$, the lowest available energy`,
      ],
      answer: 0,
      why: {
        1: 'A measurement with a definite result leaves the system in that result’s eigenstate; repeating it agrees.',
        2: t`$\psi_2$ is a stationary state: in a time-independent potential, with nothing disturbing it, it stays $\psi_2$ forever.`,
        3: t`A measurement that returned $E_2$ leaves $\psi_2$, not $\psi_1$. (Real atoms do decay by emitting light, but that is a coupling to the electromagnetic field, not part of this Hamiltonian.)`,
      },
      hints: ['Which state gives E₂ with certainty?', 'Does a stationary state change into anything else on its own?'],
      teach: 'An energy measurement leaves the state in the eigenstate of its result, which is stationary: the sloshing stops.',
      explain: t`After the result $E_2$ the state is $\psi_2$, evolving only by its phase $e^{-iE_2t/\hbar}$. Its density is frozen and its energy is certain. The cross term that made $\langle x\rangle$ swing is gone because $c_1$ is now 0.`,
    }),
    num({
      id: 'cp-clock', difficulty: 2, transfer: true,
      gen(r) {
        const C = r.pick([
          { name: 'the caesium-133 ground state (the SI second; caesium beam clocks fly on GPS satellites)', f: 9192631770, ft: t`9\,192\,631\,770` },
          { name: 'the rubidium-87 ground state (the workhorse clocks of GPS and Galileo satellites)', f: 6834682610.904, ft: t`6\,834\,682\,610.904` },
          { name: 'atomic hydrogen (the hydrogen masers of Galileo and of deep-space tracking stations)', f: 1420405751.768, ft: t`1\,420\,405\,751.768` },
        ]);
        const ans = (H / QE) * C.f * 1e6;
        return {
          prompt: t`An atomic clock puts atoms into an equal superposition of two hyperfine stationary states of ${C.name} and counts how fast their relative phase turns: once every $1/f$, with $f = ${C.ft}$ Hz. What is the energy difference $E_b - E_a$ between the two states, in μeV?`,
          visual: {
            type: 'graph',
            params: { x: [0, 3], y: [0, 1.15], aspect: 'wide', xlabel: 'time (in units of 1/f)', ylabel: 'interference signal', yticks: 3, xticks: 6, axesAt: 'edge', curves: [{ fn: '0.5*(1 + cos(2*pi*x))', color: 'accent', width: 2.4 }] },
            caption: 'The cross term of a two-state superposition beats at f = ΔE/h; the clock locks a microwave oscillator to it. Schematic: real clocks read the phase with Ramsey’s two-pulse method.',
          },
          answer: ans, units: 'μeV', tol: { rel: 0.005 },
          errors: [{ value: ans / (2 * Math.PI), feedback: t`$f$ is in cycles per second, so $\Delta E = hf$, not $\hbar f$.` }, { value: ans * 2 * Math.PI, feedback: t`$\Delta E = hf$; $\hbar\omega$ would need the angular frequency $\omega = 2\pi f$, not an extra $2\pi$ on $h$.` }],
          hints: [t`The relative phase turns at $(E_b - E_a)/\hbar$ radians per second, so one full cycle per $h/(E_b - E_a)$.`, t`$E_b - E_a = hf$ with $h = ${tex(H / QE, 6)}$ eV s.`],
          teach: 'Only a superposition ticks: its relative phase turns at ΔE/ħ, which is what every atomic clock counts.',
          explain: t`$\Delta E = hf = ${tex(H / QE, 6)} \times ${tex(C.f, 6)} = ${fmt(ans, 4)}\ \mu\text{eV}$. A single stationary state would be a useless clock: its phase is unobservable. The beat of two is not.`,
        };
      },
    }),
  ],
  sources: [
    { label: 'Griffiths & Schroeter, Introduction to Quantum Mechanics, 3rd ed., §2.1–2.2', url: 'https://www.cambridge.org/9781316995433' },
    { label: 'Emigh, Passante & Shaffer, student understanding of time dependence in QM (PERC 2015)', url: 'https://www.per-central.org/items/perc/3727.pdf' },
    { label: 'BIPM, the SI Brochure (9th ed.): the caesium hyperfine frequency defines the second', url: 'https://www.bipm.org/en/publications/si-brochure' },
    { label: 'Steck, “Rubidium 87 D Line Data” (rev. 2.3.3)', url: 'https://steck.us/alkalidata/' },
  ],
});
