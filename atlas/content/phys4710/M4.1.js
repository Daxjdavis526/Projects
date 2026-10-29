// The variational theorem (Griffiths & Schroeter §8.1). For any normalized
// ψ, ⟨ψ|Ĥ|ψ⟩ ≥ E_gs: expand ψ in eigenstates, and every |cₙ|² sits on an
// Eₙ ≥ E_gs. One-parameter Gaussian trials, units ħ = m = 1: the oscillator
// (exact, E = ½), the delta well V = −δ(x) (−1/π against −½: the ratio 2/π),
// the linear potential |x| (1.5(2π)^(−1/3) = 0.8129 against the Airy value
// a′₁2^(−1/3) = 0.8086), the quartic x⁴ (0.6814 against 0.667 986), and
// hydrogen with a Gaussian (−8/3π Ry = −11.55 eV). The error in E is second
// order in the error in ψ. Odd trials bound the first excited state of an
// even potential (|x|: 1.8611 against 1.8558). Explore: E(b) for the four 1D
// potentials with the exact ground energy as a floor. Code: the quartic
// oscillator minimized on a grid with SciPy. Transfer: neutrons bouncing on a
// mirror (qBounce): trial z e^(−βz) gives 1.4900 peV against the exact
// a₁(mg²ħ²/2)^(1/3)… = 1.4067 peV (Nesvizhevsky et al. 2002). CODATA 2022.
import { lesson, mcq, num, code } from '../../src/core/content.js';
import { fmt, tex } from '../../src/core/format.js';
import { HBAR, QE, MN, G0, RYD, r6, seg, label } from './_q2.js';

const t = String.raw;
const AI1 = 2.338107410459767, AIP1 = 1.018792971647471;     // first zeros of Ai and Ai′ (magnitudes)
const POT = [
  { key: 1, name: 'harmonic oscillator', V: '½x²', E: 'b/2 + 1/(8*b)', exact: 0.5 },
  { key: 2, name: 'delta well', V: '−δ(x)', E: 'b/2 - sqrt(2*b/pi)', exact: -0.5 },
  { key: 3, name: 'V-shaped well', V: '|x|', E: 'b/2 + 1/sqrt(2*pi*b)', exact: AIP1 * 2 ** (-1 / 3) },
  { key: 4, name: 'quartic well', V: 'x⁴', E: 'b/2 + 3/(16*b^2)', exact: 0.667986259155777 },
];
const inX = (e) => e.replace(/\bb\b/g, 'x');
const on = (k) => `step(0.5 - abs(pot - ${k}))`;
const E0N = Math.cbrt(MN * G0 ** 2 * HBAR ** 2) / QE * 1e12;   // peV: (m g² ħ²)^(1/3)
const BOUNCE_VAR = 1.5 * Math.cbrt(1.5);                        // E_min of β²/2 + 3/(2β) in units of (mg²ħ²)^(1/3)
const BOUNCE_EX = AI1 * 2 ** (-1 / 3);

/** E(b) for one potential with the exact floor; optional point at b. */
const ebPic = (p, caption, { floor = true, y } = {}) => ({
  type: 'graph',
  params: {
    x: [0.05, 3], y: y || [r6(p.exact - 0.4), r6(p.exact + 1.4)], aspect: 'wide', xlabel: 'width parameter b', ylabel: '⟨H⟩ (ħ = m = 1)', xticks: 6, yticks: 4, axesAt: 'edge',
    curves: [{ fn: inX(p.E), color: 'accent', width: 2.4, domain: [0.05, 3] }],
    hlines: floor ? [{ y: r6(p.exact), color: 'gold', label: 'exact ground state' }] : [],
  },
  caption,
});

export default lesson({
  id: 'phys4710.M4.1',
  title: 'The variational theorem',
  minutes: 18, difficulty: 3,
  intro: t`When no parameter is small, perturbation theory has nothing to expand in. The variational principle needs no small parameter at all. Pick **any** normalized trial function $\psi$ — a guess — and compute its average energy. It can never come out below the true ground-state energy:

$$E_{\text{gs}} \le \langle\psi|\hat H|\psi\rangle$$

Proof in one line: expand $\psi = \sum c_n\psi_n$ in eigenstates; then $\langle\hat H\rangle = \sum|c_n|^2E_n \ge E_{\text{gs}}\sum|c_n|^2 = E_{\text{gs}}$. So build a trial function with adjustable parameters, minimize $\langle\hat H\rangle$ over them, and the minimum is the best upper bound that family can give. Equality holds only if the trial family contains the true ground state.`,
  symbols: [
    { tex: 'E_{\\text{gs}}', text: 'the true ground-state energy of the Hamiltonian, usually unknown' },
    { tex: '\\psi', text: 'a trial wave function: any normalizable function obeying the boundary conditions, often with parameters to vary' },
    { tex: '\\hat H', text: 'the full Hamiltonian, interactions included' },
    { tex: '\\langle\\psi|\\hat H|\\psi\\rangle', text: t`the trial energy, $\int\psi^*\hat H\psi\,d\tau$ for normalized $\psi$` },
  ],
  why: 'The variational principle gives the ground states of helium and molecules, underlies Hartree–Fock and density-functional theory in chemistry and materials science, and is how quantum computers estimate molecular energies (the variational quantum eigensolver).',
  visual: {
    type: 'graph',
    title: 'A Gaussian guess in four wells',
    lead: t`The trial function $\psi_b(x) = (2b/\pi)^{1/4}e^{-bx^2}$ (units $\hbar = m = 1$) in four potentials. Blue: its energy $\langle\hat H\rangle$ against the width parameter $b$. Gold: the true ground-state energy. Move $b$ to find the minimum.`,
    tasks: [
      'Oscillator: the minimum, at b = ½, touches the gold line exactly — the true ground state is a Gaussian.',
      'Delta well: the best Gaussian gets −1/π ≈ −0.318 against −0.5. It never dips below; the kink of the true $e^{-|x|}$ cannot be made from a Gaussian.',
      'V-shaped and quartic wells: the minima land within 0.5% and 2% of the truth. However b is chosen, no point of the blue curve goes below gold.',
    ],
    params: {
      x: [0.05, 3], y: [-0.8, 2], aspect: 'wide', xlabel: 'width parameter b', ylabel: '⟨H⟩ (ħ = m = 1)', xticks: 6, yticks: 7, axesAt: 'edge',
      choices: [{ key: 'pot', label: 'Potential', options: POT.map((p) => [p.key, `${p.name}, V = ${p.V}`]), value: 2, explain: 'Which potential the Gaussian is tried in.' }],
      sliders: [{ key: 'b', label: t`Width parameter $b$`, min: 0.05, max: 3, step: 0.01, value: 1, explain: t`Large $b$ is a narrow Gaussian (high kinetic energy); small $b$ is a wide one.` }],
      curves: POT.map((p) => ({ fn: inX(p.E), color: 'accent', width: 2.4, when: on(p.key) })),
      hlines: POT.map((p) => ({ y: r6(p.exact), color: 'gold', when: on(p.key) })),
      points: POT.map((p) => ({ x: 'b', y: p.E, r: 6, color: 'warn', when: on(p.key) })),
      readouts: [
        { label: t`$\langle\hat H\rangle$ at this $b$`, expr: POT.map((p) => `${on(p.key)}*(${p.E})`).join(' + '), digits: 4 },
        { label: 'exact ground state', expr: POT.map((p) => `${on(p.key)}*${r6(p.exact)}`).join(' + '), digits: 4 },
      ],
    },
    caption: 'Exact expectation values of the Gaussian trial; exact ground energies from the oscillator, the delta well, the Airy function (V = |x|) and numerical diagonalization (x⁴).',
  },
  example: {
    prompt: t`Use the Gaussian $\psi = (2b/\pi)^{1/4}e^{-bx^2}$ to bound the ground state of the delta-function well $V(x) = -\alpha\,\delta(x)$, and compare with the exact $E_{\text{gs}} = -m\alpha^2/2\hbar^2$.`,
    visual: { type: 'graph', params: { x: [-3, 3], y: [0, 1.15], aspect: 'wide', xlabel: 'x (units of ħ²/mα)', ylabel: 'ψ (scaled)', xticks: 6, yticks: 0, axesAt: 'edge', curves: [{ fn: 'exp(-abs(x))', color: 'gold', width: 2.6, label: 'exact', labelAt: 1.2, labelDy: -10 }, { fn: `exp(-${r6(2 / Math.PI)}*x^2)`, color: 'accent', width: 2.2, dash: [6, 4], label: 'best Gaussian', labelAt: 0.9, labelDx: 10 }] }, caption: 'The true ground state, with its kink at x = 0, and the best Gaussian (both scaled to 1 at the centre).' },
    steps: [
      { label: 'Kinetic', text: t`$\langle T\rangle = \dfrac{\hbar^2}{2m}\int|\psi'|^2dx = \dfrac{\hbar^2b}{2m}$: narrower Gaussians cost more kinetic energy.` },
      { label: 'Potential', text: t`$\langle V\rangle = -\alpha|\psi(0)|^2 = -\alpha\sqrt{2b/\pi}$: narrower Gaussians sit deeper in the well.` },
      { label: 'Minimize', text: t`$E(b) = \dfrac{\hbar^2b}{2m} - \alpha\sqrt{\dfrac{2b}{\pi}}$; $dE/db = 0$ gives $b = \dfrac{2m^2\alpha^2}{\pi\hbar^4}$ and $E_{\min} = -\dfrac{m\alpha^2}{\pi\hbar^2}$.` },
      { label: 'Compare', text: t`Exact: $-\dfrac{m\alpha^2}{2\hbar^2}$. The bound is $2/\pi = ${fmt(2 / Math.PI, 4)}$ of it — above the truth, as guaranteed, by 36%. A Gaussian is smooth where the true state has a kink.` },
      { label: 'Lesson', text: t`The method always gives an upper bound; how tight depends on the family of trial functions. A better family (say $e^{-b|x|}$) would give the exact answer.` },
    ],
    answer: t`$E_{\min} = -m\alpha^2/\pi\hbar^2$, a fraction $2/\pi$ of the exact $-m\alpha^2/2\hbar^2$: a valid upper bound, 36% too high.`,
  },
  practice: [
    num({
      id: 'linear-well', difficulty: 2,
      prompt: t`For the V-shaped well $V = |x|$ (units $\hbar = m = 1$), the Gaussian trial gives $\langle\hat H\rangle = \dfrac{b}{2} + \dfrac{1}{\sqrt{2\pi b}}$. Minimize over $b$: what is the best upper bound on the ground-state energy?`,
      visual: ebPic(POT[2], 'The trial energy against b for V = |x| (exact floor in gold).', { floor: false }),
      answer: 1.5 * (2 * Math.PI) ** (-1 / 3), tol: { rel: 0.002 },
      errors: [{ value: AIP1 * 2 ** (-1 / 3), feedback: 'That is the exact value (from Airy functions). The Gaussian’s best energy is a little higher.' }],
      hints: [t`$dE/db = \tfrac12 - \tfrac12(2\pi)^{-1/2}b^{-3/2} = 0$.`, t`So $b = (2\pi)^{-1/3}$; substitute back.`],
      teach: 'Minimize ⟨H⟩ over the trial parameter: the minimum is the family’s best upper bound.',
      explain: t`$b = (2\pi)^{-1/3} = ${fmt((2 * Math.PI) ** (-1 / 3), 4)}$ and $E_{\min} = \tfrac32(2\pi)^{-1/3} = ${fmt(1.5 * (2 * Math.PI) ** (-1 / 3), 4)}$, against the exact $${fmt(AIP1 * 2 ** (-1 / 3), 4)}$: only 0.5% high.`,
    }),
    mcq({
      id: 'below-gs', difficulty: 2,
      prompt: t`A student’s variational calculation of a ground state comes out **below** the experimentally measured ground-state energy. Which explanation is possible?`,
      visual: ebPic(POT[0], 'A trial energy curve can touch the true ground-state energy but never cross below it — if the Hamiltonian is right.'),
      choices: [
        t`The Hamiltonian used is not the real system’s, or an integral was done wrong: for the right $\hat H$, $\langle\psi|\hat H|\psi\rangle \ge E_{\text{gs}}$ for every normalized $\psi$`,
        'The trial function happened to be very good',
        'Variational energies can fall below the ground state when the trial has many parameters',
        'Random rounding in the minimization',
      ],
      answer: 0,
      why: {
        1: 'A perfect trial function would give exactly the ground-state energy, never less.',
        2: 'Any number of parameters still gives an upper bound: each choice of parameters is just another normalized ψ.',
        3: 'Rounding is tiny compared with a real violation; check normalization and the Hamiltonian first.',
      },
      hints: [t`Recall the proof: $\langle\hat H\rangle = \sum|c_n|^2E_n$. Which step could fail?`],
      teach: 'For the correct Hamiltonian, a variational energy is always an upper bound; a result below the true energy signals an error or a missing term.',
      explain: t`The theorem has no exceptions for normalized trial functions. Common culprits: an unnormalized $\psi$, a sign slip in the potential, or a model Hamiltonian missing a repulsion (such as dropping the electron–electron term in helium).`,
    }),
    mcq({
      id: 'energy-vs-wf', difficulty: 3,
      prompt: t`A trial function has 1% of its probability in the wrong states: $\psi = \sqrt{0.99}\,\psi_{\text{gs}} + \sqrt{0.01}\,\phi$, with $\phi$ orthogonal to the ground state. Roughly how large an error does this make in the energy?`,
      visual: { type: 'graph', params: { x: [-3, 3], y: [-0.2, 0.9], aspect: 'wide', xlabel: 'x', ylabel: 'ψ', xticks: 6, yticks: 0, axesAt: 'edge', curves: [{ fn: `${r6(Math.PI ** -0.25)}*exp(-x^2/2)`, color: 'gold', width: 2.6 }, { fn: `${r6(Math.sqrt(0.99) * Math.PI ** -0.25)}*exp(-x^2/2) + ${r6(0.1 * Math.PI ** -0.25 / Math.sqrt(2))}*(2*x^2 - 1)*exp(-x^2/2)`, color: 'accent', width: 2.2, dash: [6, 4] }] }, caption: 'An oscillator ground state (gold) and a trial with 1% admixture of the second excited state (dashed): nearly indistinguishable.' },
      choices: [
        t`About 1% of the gap to the admixed state: $\langle\hat H\rangle - E_{\text{gs}} = 0.01(E_\phi - E_{\text{gs}})$ — the energy error is the probability error, i.e. second order in the amplitude error $0.1$`,
        t`About 10% of the gap, since the amplitude error is $\sqrt{0.01} = 0.1$`,
        'None: the energy is exact if the wave function is 99% right',
        t`It depends on the sign of $\phi$`,
      ],
      answer: 0,
      why: {
        1: t`The energy depends on $|c|^2$, not $|c|$: amplitude errors enter squared.`,
        2: t`Only a perfect trial gives the exact energy; the error is small, $0.01(E_\phi - E_{\text{gs}})$, but not zero.`,
        3: t`Cross terms $\langle\psi_{\text{gs}}|\hat H|\phi\rangle$ vanish because $\phi$ is orthogonal to an eigenstate of $\hat H$; only $|c|^2$ enters.`,
      },
      hints: [t`$\langle\hat H\rangle = 0.99E_{\text{gs}} + 0.01\langle\phi|\hat H|\phi\rangle$, because the cross terms vanish.`, t`So $\langle\hat H\rangle - E_{\text{gs}} = 0.01\big(\langle\phi|\hat H|\phi\rangle - E_{\text{gs}}\big)$: which power of the amplitude 0.1 is that?`],
      teach: 'Variational energies are much better than variational wave functions: an error ε in ψ gives an error of order ε² in E.',
      explain: t`$\langle\hat H\rangle - E_{\text{gs}} = 0.01(\langle\phi|\hat H|\phi\rangle - E_{\text{gs}})$. The amplitude error is 0.1 but the energy error is 0.01 of a level spacing. That is the strength of the method — and its trap: a good energy does not certify a good wave function, so other properties (sizes, dipole moments) can be much worse.`,
    }),
    num({
      id: 'odd-trial', difficulty: 3,
      prompt: t`For the even potential $V = |x|$, an **odd** trial function is automatically orthogonal to the (even) ground state, so it bounds the first excited state. With $\psi = x\,e^{-bx^2}$ (normalized), $\langle\hat H\rangle = \dfrac{3b}{2} + \sqrt{\dfrac{2}{\pi b}}$ ($\hbar = m = 1$). Minimize: what is the bound on the first excited energy?`,
      visual: { type: 'graph', params: { x: [0.05, 3], y: [1.5, 4], aspect: 'wide', xlabel: 'width parameter b', ylabel: '⟨H⟩', xticks: 6, yticks: 5, axesAt: 'edge', curves: [{ fn: '1.5*x + sqrt(2/(pi*x))', color: 'accent', width: 2.4, domain: [0.05, 3] }] }, caption: 'The odd trial’s energy against b.' },
      answer: (() => { const b = Math.cbrt((Math.sqrt(2 / Math.PI) / 3) ** 2); return 1.5 * b + Math.sqrt(2 / (Math.PI * b)); })(), tol: { rel: 0.002 },
      errors: [{ value: 1.5 * (2 * Math.PI) ** (-1 / 3), feedback: 'That is the even trial’s bound on the ground state; the odd trial bounds the first excited state.' }],
      hints: [t`$dE/db = \tfrac32 - \tfrac12\sqrt{2/\pi}\,b^{-3/2} = 0$, so $b^{3/2} = \tfrac13\sqrt{2/\pi}$.`, t`$b = ${fmt(Math.cbrt((Math.sqrt(2 / Math.PI) / 3) ** 2), 4)}$; substitute back.`],
      teach: 'A trial function orthogonal to the ground state (for example by symmetry) bounds the first excited state.',
      explain: t`$b = ${fmt(Math.cbrt((Math.sqrt(2 / Math.PI) / 3) ** 2), 4)}$ and $E \le ${fmt((() => { const b = Math.cbrt((Math.sqrt(2 / Math.PI) / 3) ** 2); return 1.5 * b + Math.sqrt(2 / (Math.PI * b)); })(), 4)}$, against the exact $a_1 2^{-1/3} = ${fmt(BOUNCE_EX, 4)}$ (from the first zero of the Airy function): 0.3% high. Without symmetry, keeping a trial orthogonal to an unknown ground state is the hard part.`,
    }),
    code({
      id: 'variational-grid', difficulty: 3,
      prompt: t`Do a variational calculation numerically. For $\hat H = -\tfrac12\,d^2/dx^2 + V(x)$ on a grid, write \`energy(b, V)\` that builds the Gaussian $e^{-bx^2}$ on \`x\`, normalizes it with \`np.trapezoid\`, and returns $\langle\hat H\rangle = \int\big[\tfrac12\psi'^2 + V\psi^2\big]dx$ (use \`np.gradient\` for $\psi'$). Then use \`scipy.optimize.minimize_scalar\` (bounded, $0.05 < b < 5$) to find \`b_best\` and \`E_best\` for the quartic oscillator $V = x^4$.`,
      starter: t`import numpy as np
from scipy.optimize import minimize_scalar

x = np.linspace(-6, 6, 4001)

def quartic(x):
    return x**4

def energy(b, V):
    pass

b_best = None
E_best = None
print(b_best, E_best)
`,
      answer: t`import numpy as np
from scipy.optimize import minimize_scalar

x = np.linspace(-6, 6, 4001)

def quartic(x):
    return x**4

def energy(b, V):
    psi = np.exp(-b * x**2)
    psi = psi / np.sqrt(np.trapezoid(psi**2, x))
    dpsi = np.gradient(psi, x)
    return np.trapezoid(0.5 * dpsi**2 + V(x) * psi**2, x)

res = minimize_scalar(lambda b: energy(b, quartic), bounds=(0.05, 5), method='bounded')
b_best = res.x
E_best = res.fun
print(b_best, E_best)
`,
      tests: [
        { name: t`for the oscillator $V = x^2/2$, $b = \tfrac12$ gives exactly $\tfrac12$`, code: 'abs(energy(0.5, lambda x: 0.5 * x**2) - 0.5) < 1e-5' },
        { name: t`the quartic minimum is at $b = (3/4)^{1/3} \approx 0.9086$`, code: 'abs(b_best - 0.75**(1/3)) < 2e-3' },
        { name: t`the bound is $E \approx 0.6814$`, code: 'abs(E_best - 0.68142) < 2e-4' },
        { name: t`it lies above the exact ground energy $0.667\,986$, as the theorem demands`, code: 'E_best > 0.667986' },
      ],
      hints: [t`Normalize first: divide by $\sqrt{\int\psi^2dx}$. Then $\langle T\rangle = \tfrac12\int\psi'^2dx$ (integrate by parts; $\psi$ vanishes at the ends).`, 'minimize_scalar(f, bounds=(0.05, 5), method="bounded") returns an object with .x and .fun.'],
      teach: 'A variational calculation is a minimization: an energy function of the parameters, handed to an optimizer.',
      explain: t`The minimum $E = ${fmt(0.68142, 5)}$ at $b = ${fmt(0.75 ** (1 / 3), 4)}$ matches the analytic $E(b) = b/2 + 3/16b^2$, and lies 2% above the exact $0.667\,986$. Replace \`quartic\` by any potential — or the Gaussian by any family with several parameters, using \`scipy.optimize.minimize\` — and the same code works.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-qbounce', difficulty: 3, transfer: true,
      prompt: t`Ultracold neutrons bouncing on a mirror in Earth’s gravity have quantized heights (Nesvizhevsky et al. 2002; the qBounce experiments). With $\hat H = \hat p^2/2m + mgz$ above a mirror at $z = 0$, the trial $\psi = z\,e^{-\beta z}$ gives $\langle\hat H\rangle = \tfrac12\beta^2 + \tfrac{3}{2\beta}$ in units where lengths are $(\hbar^2/m^2g)^{1/3}$ and energies $\epsilon = (mg^2\hbar^2)^{1/3} = ${fmt(E0N, 5)}$ peV for a neutron. Minimize over $\beta$ and give the bound on the ground-state energy, in peV ($1$ peV $= 10^{-12}$ eV).`,
      visual: { type: 'graph', params: { x: [0, 6], y: [0, 4], aspect: 'wide', xlabel: 'height z (units of 7.39 μm)', ylabel: 'energy (units of ε)', xticks: 6, yticks: 4, axesAt: 'edge', curves: [{ fn: 'x', color: 'ink3', width: 2, label: 'V = mgz', labelAt: 3.3, labelDy: -10 }, { fn: `${r6(BOUNCE_VAR)} + 0.75*x*exp(-${r6(Math.cbrt(1.5))}*x)*${r6(Math.cbrt(1.5) * Math.E)}`, color: 'accent', width: 2.2, dash: [6, 4] }], vlines: [{ x: 0, color: 'gold', label: 'mirror' }] }, caption: 'The gravitational potential above a mirror, and the trial wave function drawn at the height of its energy (amplitude schematic).' },
      answer: BOUNCE_VAR * E0N, units: 'peV', tol: { rel: 0.003 },
      errors: [{ value: BOUNCE_EX * E0N, feedback: 'That is the exact (Airy-function) energy. The trial’s bound is a little higher.' }, { value: BOUNCE_VAR, feedback: t`That is the bound in units of $\epsilon$; multiply by $${fmt(E0N, 4)}$ peV.` }],
      hints: [t`$d\langle H\rangle/d\beta = \beta - \tfrac{3}{2\beta^2} = 0$ gives $\beta^3 = \tfrac32$.`, t`Then $\langle H\rangle = \tfrac32(3/2)^{2/3}$ in units of $\epsilon$.`],
      teach: 'The variational method bounds any ground state, here neutrons in Earth’s gravity, without solving the Airy equation.',
      explain: t`$\beta = (3/2)^{1/3}$, so $E \le \tfrac32(3/2)^{2/3}\epsilon = ${fmt(BOUNCE_VAR, 4)}\epsilon = ${fmt(BOUNCE_VAR * E0N, 4)}$ peV. The exact value, $a_1 2^{-1/3}\epsilon$ with $a_1 = 2.338$ the first zero of Ai, is $${fmt(BOUNCE_EX * E0N, 4)}$ peV — 6% lower, as it must be. The measured quantum states of falling neutrons agree with it; they test gravity at micrometre scales.`,
    }),
    num({
      id: 'cp-hydrogen-gauss', difficulty: 3,
      prompt: t`Try a Gaussian for hydrogen: $\psi = (2b/\pi)^{3/4}e^{-br^2}$ (atomic units, $\hbar = m_e = e^2/4\pi\epsilon_0 = 1$). Then $\langle T\rangle = \tfrac32b$ and $\langle V\rangle = -2\sqrt{2b/\pi}$ hartree. Minimize and give the bound on the ground-state energy, in eV (1 hartree $= 2\times${fmt(RYD, 9)}$ eV).`,
      visual: { type: 'graph', params: { x: [0, 5], y: [0, 0.7], aspect: 'wide', xlabel: 'r (units of a₀)', ylabel: 'P(r) (per a₀)', xticks: 5, yticks: 3, axesAt: 'edge', curves: [{ fn: '4*x^2*exp(-2*x)', color: 'gold', width: 2.6, label: 'exact 1s', labelAt: 2.4, labelDy: -10 }, { fn: `4*pi*x^2*(${r6(2 * (8 / (9 * Math.PI)) / Math.PI)})^1.5*exp(-${r6(2 * (8 / (9 * Math.PI)))}*x^2)`, color: 'accent', width: 2.2, dash: [6, 4], label: 'best Gaussian', labelAt: 0.7, labelDx: -100, labelDy: -6 }] }, caption: 'Radial probability densities of the exact 1s state and the best Gaussian trial.' },
      answer: (-4 / (3 * Math.PI)) * 2 * RYD, units: 'eV', tol: { rel: 0.005 },
      errors: [{ value: -RYD, feedback: 'That is the exact energy; a Gaussian cannot reach it.' }, { value: (-4 / (3 * Math.PI)) * RYD, feedback: 'The minimum is −4/3π hartree; one hartree is 27.2 eV, twice 13.6 eV.' }],
      hints: [t`$dE/db = \tfrac32 - \sqrt{2/\pi}\,b^{-1/2} = 0$ gives $b = \tfrac{8}{9\pi}$.`, t`Then $E = -\tfrac{4}{3\pi}$ hartree.`],
      teach: 'A trial function of the wrong shape still gives a rigorous upper bound — here 15% above hydrogen’s true energy.',
      explain: t`$b = 8/9\pi$ and $E \le -\tfrac{4}{3\pi}$ hartree $= ${fmt((-4 / (3 * Math.PI)) * 2 * RYD, 4)}$ eV, against $-13.606$ eV. The Gaussian misses the cusp at the nucleus. Yet chemistry codes use Gaussians anyway, in sums of many — products of Gaussians on different atoms are easy to integrate.`,
    }),
    mcq({
      id: 'cp-more-params', difficulty: 2,
      prompt: t`A one-parameter trial family gives $E_1$. You add a second parameter so that the old family is a special case of the new one, and minimize again to get $E_2$. What can you say?`,
      visual: ebPic(POT[1], 'The one-parameter Gaussian curve for the delta well, with the exact floor.'),
      choices: [
        t`$E_{\text{gs}} \le E_2 \le E_1$: minimizing over a larger family can only find a lower (or equal) minimum, and every minimum is still an upper bound`,
        t`$E_2$ may be above $E_1$, because extra parameters add errors`,
        t`$E_2 = E_{\text{gs}}$ exactly with two parameters`,
        t`$E_2 < E_{\text{gs}}$ is possible with enough parameters`,
      ],
      answer: 0,
      why: {
        1: 'The old optimum is still available in the new family, so the new minimum cannot be higher.',
        2: 'Only if the family contains the true ground state. Two parameters usually do not.',
        3: t`Every member of the family is a normalized $\psi$, so every value is $\ge E_{\text{gs}}$.`,
      },
      hints: ['Is the old best trial function still in the new family?'],
      teach: 'Enlarging a trial family can only improve (lower) the variational bound, never break it.',
      explain: t`This is why Hylleraas’s many-parameter helium calculations converge steadily downward onto the exact energy, and why chemists judge methods by how low they go.`,
    }),
  ],
  sources: [
    { label: 'Griffiths & Schroeter, Introduction to Quantum Mechanics, 3rd ed., §8.1', url: 'https://www.cambridge.org/9781316995433' },
    { label: 'V. V. Nesvizhevsky et al., “Quantum states of neutrons in the Earth’s gravitational field”, Nature 415, 297 (2002)', url: 'https://doi.org/10.1038/415297a' },
  ],
});
