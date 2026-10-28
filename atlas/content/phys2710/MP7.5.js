// Expectation values — the average of many measurements on identically
// prepared systems, ⟨Q⟩ = ∫ψ* Q̂ ψ dx, with x̂ = x and p̂ = −iħ ∂/∂x; the
// spreads Δx, Δp and the uncertainty product (0.568ħ in a box's ground
// state, exactly ħ/2 for a Gaussian). Superpositions: ⟨E⟩ = Σ|cₙ|²Eₙ, any
// single measurement gives one Eₙ, and ⟨x⟩ sloshes at (E₂ − E₁)/h — the
// ammonia molecule's 23.87 GHz inversion, the first atomic clock. A NumPy
// exercise computes ⟨x⟩, Δx, ⟨p⟩, Δp on a grid. Every number is computed here.
import { lesson, mcq, num, code } from '../../src/core/content.js';
import { fmt, tex } from '../../src/core/format.js';
import { H_EVFS, HC, well, density, samples, seg, label, r6 } from './_schrodinger.js';
import * as S from '../../src/viz/model/mp-schrodinger.js';

const t = String.raw;
const BOX = { x2: 1 / 3 - 1 / (2 * Math.PI * Math.PI) };          // ⟨x²⟩/L² in the box ground state
BOX.dx = Math.sqrt(BOX.x2 - 0.25);                                  // Δx/L = 0.1808
const boxProduct = (n) => Math.sqrt((n * n * Math.PI * Math.PI) / 12 - 0.5);   // Δx Δp / ħ for box state n
const NH3 = { dE: 9.872e-5 };                                       // eV, ammonia's (3,3) inversion splitting
NH3.f = NH3.dE / (H_EVFS * 1e-15) / 1e9;                            // GHz

/** |ψ|² = (4/a³)x²e^{−2x/a} for x > 0 (a in nm), with optional marks. */
const lopsided = (a, marks = [], caption) => density({
  fn: `4*x^2*exp(-2*x/${a})/${r6(a ** 3)}`, x: [0, r6(6 * a)], y: [0, r6(0.7 / a)], xlabel: 'x (nm)',
  curves: marks.map((m) => seg(m.x * a, 0, m.x * a, 0.66 / a, m.color, 1.6, [5, 4])),
  points: marks.map((m, i) => label(m.x * a, 0.66 / a, m.text, m.color, i ? 6 : -6, 0, i ? 'left' : 'right')),
  caption: caption ?? t`The probability density of $\psi(x) = 2a^{-3/2}\,x\,e^{-x/a}$ for $x > 0$ (zero for $x < 0$), with $a = ${a}$ nm. It rises from zero, peaks, and has a long tail to the right.`,
});

/** A standing wave as two travelling waves. */
const twoWays = {
  type: 'graph',
  params: {
    x: [0, 1], y: [-0.7, 1.75], aspect: 'wide', axes: false, grid: false, xlabel: '', ylabel: '',
    curves: [seg(0, -0.2, 0, 1.5, 'ink2', 2.4), seg(1, -0.2, 1, 1.5, 'ink2', 2.4), { fn: 'sin(pi*x)', domain: [0, 1], color: 'violet', width: 2.4 }],
    arrows: [{ from: [0.35, 1.3], to: [0.65, 1.3], color: 'accent', width: 2 }, { from: [0.65, -0.35], to: [0.35, -0.35], color: 'warn', width: 2 }],
    points: [label(0.5, 1.3, 'half the wave moves right: p = +ħk', 'accent', 0, -13, 'center'), label(0.5, -0.35, 'half moves left: p = −ħk', 'warn', 0, 15, 'center'), label(0.5, 0.45, 'ψ = sin kx = (e^(ikx) − e^(−ikx))/2i', 'violet', 0, 0, 'center')],
  },
  caption: 'The ground state of a box is a standing wave: the sum of a wave moving right and an equal one moving left. Schematic.',
};

/** Four shapes of ground state. */
const shapes = {
  type: 'graph',
  params: {
    x: [-3, 3], y: [0, 1.15], aspect: 'wide', axesAt: 'edge', xlabel: 'x', ylabel: '|ψ|² (scaled to the same peak)', yticks: 0,
    curves: [
      { fn: 'exp(-x^2)', color: 'accent', width: 2.4 },
      { fn: 'cos(pi*x/3.4)^2', domain: [-1.7, 1.7], color: 'warn', width: 2 },
      { fn: 'exp(-2*abs(x))', color: 'violet', width: 2 },
      { fn: 'x^2*exp(1 - x^2)', color: 'good', width: 2 },
    ],
    legend: [{ label: 'Gaussian', color: 'accent' }, { label: 'box ground state', color: 'warn' }, { label: 'two-sided exponential', color: 'violet' }, { label: 'oscillator, n = 1', color: 'good' }],
    legendAt: 'tr',
  },
  caption: 'Four probability densities, each scaled to the same height: a Gaussian, the ground state of a box, the bound state of a very narrow well, and the oscillator’s first excited state.',
};

export default lesson({
  id: 'phys2710.MP7.5',
  title: 'Expectation values',
  minutes: 15, difficulty: 3,
  intro: t`A wave function cannot say what one measurement will give — only how the results of many measurements, on identically prepared particles, are spread. Their average is the **expectation value**. Each measurable quantity has an **operator**: position multiplies by $x$, momentum differentiates,

$$\langle x\rangle = \int_{-\infty}^{\infty}\psi^*\,x\,\psi\,dx, \qquad \langle p\rangle = \int_{-\infty}^{\infty}\psi^*\left(-i\hbar\frac{\partial}{\partial x}\right)\psi\,dx$$

The spreads are standard deviations, $\Delta x = \sqrt{\langle x^2\rangle - \langle x\rangle^2}$ and likewise $\Delta p$, and for every state $\Delta x\,\Delta p \ge \hbar/2$. In a stationary state every expectation value is constant. Mix two energies, $\psi = c_1\psi_1 + c_2\psi_2$, and a measurement of energy gives $E_1$ or $E_2$ — with probabilities $|c_1|^2$ and $|c_2|^2$ — while $\langle x\rangle$ swings back and forth at the frequency $(E_2 - E_1)/h$.`,
  symbols: [
    { tex: '\\langle x\\rangle', text: 'the expectation value of position: the average of many position measurements, in m' },
    { tex: '\\langle p\\rangle', text: 'the expectation value of momentum, in kg m/s' },
    { tex: '\\psi^*', text: t`the complex conjugate of $\psi$ (change $i$ to $-i$); $\psi^*\psi = |\psi|^2$` },
    { tex: '-i\\hbar\\,\\partial/\\partial x', text: 'the momentum operator: momentum is set by how fast ψ’s phase turns along x, p = ħk for e^(ikx)' },
    { tex: '\\Delta x,\\ \\Delta p', text: 'the spreads (standard deviations) of position and momentum measurements' },
  ],
  why: 'Expectation values are how quantum mechanics meets the laboratory: every averaged reading — a dipole moment, a mean radius, a clock’s frequency — is one.',
  visual: {
    type: 'mp-schrodinger',
    title: 'A superposition that moves',
    lead: t`An electron in a box in the state $(\psi_1 + \psi_2)/\sqrt2$, half ground state and half first excited state. Its $|\Psi|^2$ sloshes from wall to wall, and the violet line — $\langle x\rangle$ — swings with it, with the period $h/(E_2 - E_1)$ shown below.`,
    tasks: [
      'Watch one full period: ⟨x⟩ swings between 0.32 nm and 0.68 nm, centred on the middle of the box.',
      'Widen the box to 2 nm: the levels drop fourfold and the period grows fourfold.',
      'Raise the mass: the levels close up and the sloshing slows — heavier particles move more sluggishly.',
    ],
    params: { mode: 'bound', well: 'infinite', L: 1, n: 1, super: [1, 2], show: 'prob', controls: ['L', 'mass'] },
  },
  example: {
    prompt: t`An electron is in the ground state of a box of width $L$, $\psi = \sqrt{2/L}\,\sin(\pi x/L)$. Find $\langle x\rangle$, $\Delta x$, $\langle p\rangle$ and $\Delta p$, and check the uncertainty principle.`,
    visual: well({ well: 'infinite', L: 1, n: 1, show: 'prob', panels: ['wave'] }, t`The ground state’s $|\psi|^2$ in a box 1 nm wide: symmetric about the centre.`),
    steps: [
      { label: 'Average position', text: t`$|\psi|^2$ is symmetric about $L/2$, so $\langle x\rangle = \displaystyle\int_0^L x\,\frac2L\sin^2\frac{\pi x}{L}\,dx = \frac L2$.` },
      { label: 'Spread of position', text: t`$\langle x^2\rangle = \displaystyle\int_0^L x^2\,\frac2L\sin^2\frac{\pi x}{L}\,dx = L^2\left(\frac13 - \frac{1}{2\pi^2}\right) = ${fmt(BOX.x2, 4)}\,L^2$ (by parts, twice), so $\Delta x = L\sqrt{${fmt(BOX.x2, 4)} - 0.25} = ${fmt(BOX.dx, 3)}\,L$.` },
      { label: 'Average momentum', text: t`$\langle p\rangle = -i\hbar\displaystyle\int_0^L \psi\,\psi'\,dx = -i\hbar\left[\tfrac12\psi^2\right]_0^L = 0$: the standing wave moves left and right equally.` },
      { label: 'Spread of momentum', text: t`$\langle p^2\rangle = \displaystyle\int_0^L\psi\left(-\hbar^2\frac{d^2\psi}{dx^2}\right)dx = \frac{\pi^2\hbar^2}{L^2}$, since $\psi'' = -(\pi/L)^2\psi$. So $\Delta p = \pi\hbar/L$ — and $\langle p^2\rangle/2m = \pi^2\hbar^2/2mL^2 = E_1$, as it must.` },
      { label: 'The product', text: t`$\Delta x\,\Delta p = ${fmt(BOX.dx, 4)}\,L\times\dfrac{\pi\hbar}{L} = ${fmt(boxProduct(1), 3)}\,\hbar$, above the limit $\hbar/2$. The box’s sharp walls cost a little: only a Gaussian reaches $\hbar/2$ exactly.` },
    ],
    answer: t`$\langle x\rangle = L/2$, $\Delta x = ${fmt(BOX.dx, 3)}\,L$, $\langle p\rangle = 0$, $\Delta p = \pi\hbar/L$; $\Delta x\,\Delta p = ${fmt(boxProduct(1), 3)}\,\hbar \ge \hbar/2$.`,
  },
  practice: [
    mcq({
      id: 'meaning', difficulty: 1,
      prompt: t`For the state pictured, what does $\langle x\rangle$ — marked by the violet line — tell you?`,
      choices: [
        'The average of the results if the position is measured on many particles all prepared in this state',
        'The most likely result of a single position measurement',
        'Where the particle actually is before it is measured',
        'The result every measurement will give, apart from experimental error',
      ],
      answer: 0,
      why: {
        1: 'The most likely result is the peak of |ψ|², marked separately. For a lopsided state the average sits elsewhere.',
        2: 'Quantum mechanics assigns no definite position before measurement; ⟨x⟩ is a statistical average of outcomes.',
        3: 'Individual results scatter across the whole spread Δx — that scatter is real, not experimental error.',
      },
      hints: ['Look where the gold dots (individual results) fall compared with the two lines.'],
      teach: '⟨x⟩ is an ensemble average: the mean of many measurements, not the outcome of any one.',
      explain: t`Each measurement gives one position, scattered according to $|\psi|^2$; ⟨x⟩ is their mean. For this lopsided state the long right-hand tail pulls the average ($1.5a$) beyond the peak ($a$).`,
      visual: (() => {
        const a = 0.5, base = lopsided(a, [{ x: 1, text: 'most probable', color: 'gold' }, { x: 1.5, text: '⟨x⟩', color: 'violet' }], 'The probability density of a lopsided state (a = 0.5 nm), with its peak and its expectation value marked, and the results of 60 position measurements (gold dots). The dots are a random draw from |ψ|².');
        const xs = samples((x) => 4 * x * x * Math.exp(-2 * x / a) / a ** 3, 0, 3, 60, 5);
        base.params.y = [-0.35, r6(0.7 / a + 0.05)];
        base.params.points = [...base.params.points, ...xs.map((x, i) => ({ x: r6(x), y: r6(-0.1 - 0.1 * (i % 2)), r: 2.6, color: 'gold' }))];
        return base;
      })(),
    }),
    num({
      id: 'mean-lopsided', difficulty: 2,
      gen(r) {
        const a = r.pick([0.1, 0.2, 0.5, 2]);
        return {
          prompt: t`A particle’s normalised wave function is $\psi(x) = 2a^{-3/2}\,x\,e^{-x/a}$ for $x > 0$ and zero for $x < 0$, with $a = ${a}$ nm. Find $\langle x\rangle$, in nm. ($\int_0^\infty x^ne^{-bx}dx = n!/b^{n+1}$.)`,
          answer: 1.5 * a, units: 'nm', tol: { rel: 0.005 },
          integrand: `x*4*x^2*exp(-2*x/${a})/${r6(a ** 3)}`, limits: [0, 'inf'], vars: { x: [0, 1] },
          errors: [{ value: a, feedback: t`$x = a$ is the peak of $|\psi|^2$, the most probable position. The average is pulled further out by the tail.` }],
          hints: [t`$\langle x\rangle = \displaystyle\int_0^\infty x\cdot\frac{4}{a^3}x^2e^{-2x/a}\,dx$.`, t`Use $\int_0^\infty x^3e^{-bx}dx = 6/b^4$ with $b = 2/a$.`],
          teach: '⟨x⟩ is the integral of x weighted by |ψ|²; for a lopsided density it differs from the peak.',
          explain: t`$\langle x\rangle = \frac{4}{a^3}\cdot\frac{6}{(2/a)^4} = \frac{3a}{2} = ${fmt(1.5 * a, 3)}$ nm, beyond the peak at $a$. (The same integral, in three dimensions, gives hydrogen’s mean radius $\tfrac32a_0$ in the next module.)`,
          visual: lopsided(a),
        };
      },
    }),
    num({
      id: 'box-dx', difficulty: 2,
      gen(r) {
        const L = r.pick([0.5, 1, 2]), n = r.pick([1, 2]), dx = L * Math.sqrt(1 / 12 - 1 / (2 * n * n * Math.PI * Math.PI));
        return {
          prompt: t`For a particle in state $n = ${n}$ of a box of width $L = ${L}$ nm, $\langle x^2\rangle = L^2\left(\dfrac13 - \dfrac{1}{2n^2\pi^2}\right)$. What is $\Delta x$, in nm?`,
          answer: dx, units: 'nm', tol: { rel: 0.01 },
          errors: [{ value: L / Math.sqrt(12), feedback: t`$L/\sqrt{12}$ is the spread of a uniform distribution — the classical answer. Use the quantum $\langle x^2\rangle$, with its $-1/2n^2\pi^2$.` }, { value: L * Math.sqrt(1 / 3 - 1 / (2 * n * n * Math.PI * Math.PI)), feedback: t`That is $\sqrt{\langle x^2\rangle}$. Subtract $\langle x\rangle^2 = L^2/4$ first.` }],
          hints: [t`$\langle x\rangle = L/2$ by symmetry.`, t`$\Delta x = \sqrt{\langle x^2\rangle - \langle x\rangle^2} = L\sqrt{\tfrac1{12} - \tfrac{1}{2n^2\pi^2}}$.`],
          teach: 'Δx² = ⟨x²⟩ − ⟨x⟩²; for high n it approaches the classical L/√12.',
          explain: t`$\Delta x = ${L}\sqrt{0.08333 - ${fmt(1 / (2 * n * n * Math.PI * Math.PI), 4)}} = ${fmt(dx, 3)}$ nm. As $n$ grows the correction vanishes and $\Delta x \to L/\sqrt{12}$, the spread of a classical particle bouncing evenly between the walls.`,
          visual: well({ well: 'infinite', L, n, show: 'prob', panels: ['wave'], hide: ['axis'] }, t`$|\psi_${n}|^2$ in a box ${L} nm wide.`),
        };
      },
    }),
    num({
      id: 'product', difficulty: 2,
      gen(r) {
        const n = r.pick([1, 2, 3]), P = boxProduct(n);
        return {
          prompt: t`In state $n$ of a box of width $L$, $\Delta x = L\sqrt{\tfrac{1}{12} - \tfrac{1}{2n^2\pi^2}}$ and $\Delta p = n\pi\hbar/L$. What is $\Delta x\,\Delta p$ for $n = ${n}$, in units of $\hbar$?`,
          answer: P, tol: { rel: 0.005 },
          errors: [{ value: 0.5, feedback: t`$\hbar/2$ is the *lowest* the product can ever be, reached only by Gaussians. Compute it for this state.` }],
          hints: [t`The $L$s cancel: $\Delta x\,\Delta p = n\pi\sqrt{\tfrac{1}{12} - \tfrac{1}{2n^2\pi^2}}\;\hbar$.`],
          teach: 'Every state obeys ΔxΔp ≥ ħ/2; excited states sit well above the limit.',
          explain: t`$\Delta x\,\Delta p = \sqrt{\tfrac{n^2\pi^2}{12} - \tfrac12}\,\hbar = ${fmt(P, 3)}\,\hbar$. It grows with $n$: more nodes mean more momentum spread with no less position spread.`,
          visual: well({ well: 'infinite', L: 1, n, show: 'psi', panels: ['wave'], hide: ['axis'] }, t`$\psi_${n}$ in a box.`),
        };
      },
    }),
    mcq({
      id: 'p-zero', difficulty: 2,
      prompt: t`For the ground state of a box, $\langle p\rangle = 0$. What does that mean?`,
      choices: [
        'The particle is as likely to be found moving left as moving right; its momentum is not zero — Δp = πħ/L',
        'The particle is at rest in the middle of the box',
        'Momentum cannot be measured for a bound particle',
        'The walls absorb the particle’s momentum',
      ],
      answer: 0,
      why: {
        1: t`A particle at rest would have $\Delta p = 0$ and infinite $\Delta x$. In the box $\langle p^2\rangle = (\pi\hbar/L)^2 \ne 0$: it is moving, in both directions.`,
        2: 'It can be measured: the results scatter on both sides of zero, positive and negative equally often, with spread Δp = πħ/L.',
        3: 'In a stationary state nothing changes on average; the walls reverse the motion, they do not remove it.',
      },
      hints: [t`Write $\sin kx$ as a sum of $e^{ikx}$ and $e^{-ikx}$. What momentum does each carry?`],
      teach: 'A zero average momentum is equal amounts of opposite momenta — not stillness.',
      explain: t`Inside the box $\sin kx = (e^{ikx} - e^{-ikx})/2i$: equal parts moving right ($+\hbar k$) and left ($-\hbar k$), which average to zero. (The walls cut both waves off, which smears the momenta so much that individual results scatter widely around zero.) The kinetic energy $\langle p^2\rangle/2m = E_1$ is not zero — that is the zero-point energy.`,
      visual: twoWays,
    }),
    num({
      id: 'mean-energy', difficulty: 2,
      gen(r) {
        const p1 = r.pick([0.25, 0.5, 0.75, 0.9]), L = 1, E1 = S.boxEnergy(1, L), E2 = S.boxEnergy(2, L), E = p1 * E1 + (1 - p1) * E2;
        return {
          prompt: t`An electron in a box 1.0 nm wide ($E_1 = ${fmt(E1, 3)}$ eV, $E_2 = ${fmt(E2, 3)}$ eV) is in the state $\psi = \sqrt{${p1}}\,\psi_1 + \sqrt{${fmt(1 - p1, 2)}}\,\psi_2$. What is the expectation value of its energy, in eV?`,
          answer: E, units: 'eV', tol: { rel: 0.005 },
          errors: [
            ...(p1 !== 0.5 ? [{ value: (E1 + E2) / 2, feedback: 'Weight each energy by the probability of measuring it, |cₙ|², not equally.' }] : []),
            { value: Math.sqrt(p1) * E1 + Math.sqrt(1 - p1) * E2, feedback: t`Square the amplitudes: the probabilities are $|c_n|^2 = ${p1}$ and $${fmt(1 - p1, 2)}$, not $c_n$.` },
          ],
          hints: [t`$\langle E\rangle = |c_1|^2E_1 + |c_2|^2E_2$.`],
          teach: '⟨E⟩ = Σ|cₙ|²Eₙ: each energy weighted by the probability of measuring it.',
          explain: t`$\langle E\rangle = ${p1}(${fmt(E1, 3)}) + ${fmt(1 - p1, 2)}(${fmt(E2, 3)}) = ${fmt(E, 3)}$ eV. No single measurement gives this value (see the next question); it is the average over many.`,
          visual: well({ well: 'infinite', L: 1, n: 1, super: [1, 2], panels: ['energy'], hide: ['energy'] }, 'The two levels the state mixes (gold).'),
        };
      },
    }),
    mcq({
      id: 'measure-energy', difficulty: 2,
      prompt: t`An electron in a box is in the state $(\psi_1 + \psi_2)/\sqrt2$. Its energy is measured once. What result can the measurement give?`,
      choices: [
        t`Either $E_1$ or $E_2$, each with probability $\tfrac12$`,
        t`Always $\tfrac12(E_1 + E_2)$`,
        t`Any energy between $E_1$ and $E_2$`,
        t`$E_1 + E_2$`,
      ],
      answer: 0,
      why: {
        1: t`$\tfrac12(E_1 + E_2)$ is the average of many measurements. It is not one of the allowed energies, so no single measurement gives it.`,
        2: 'A measured energy is always one of the levels Eₙ; the in-between values never appear.',
        3: 'The state is a superposition of two possibilities, not a sum of two particles’ energies.',
      },
      hints: [t`Which values can an energy measurement on a particle in a box ever return?`],
      teach: 'A measurement returns one eigenvalue, with probability |cₙ|² — the expectation value is only the average.',
      explain: t`Each measurement gives $E_1$ or $E_2$, half the time each; the average of many is $\tfrac12(E_1 + E_2)$. After the measurement the electron is in the state it was found in — it stops sloshing.`,
      visual: well({ well: 'infinite', L: 1, n: 1, super: [1, 2], show: 'prob', play: false }, 'The two mixed levels (top, gold) and the superposition’s |Ψ|² at one instant (bottom), with ⟨x⟩ marked.'),
    }),
    code({
      id: 'expect', difficulty: 3,
      prompt: t`Finish \`expectations(x, psi)\` so it returns $\langle x\rangle$, $\Delta x$, $\langle p\rangle$ and $\Delta p$ for a normalised (possibly complex) wave function sampled on a grid, in units where $\hbar = 1$. Use \`np.trapezoid\` for the integrals and \`np.gradient(psi, x)\` for $d\psi/dx$. For momentum use $\langle p\rangle = \int\psi^*(-i\hbar\,\psi')\,dx$ and $\langle p^2\rangle = \hbar^2\int|\psi'|^2dx$ (integration by parts, since $\psi \to 0$ at the ends).`,
      starter: t`import numpy as np

hbar = 1.0

def expectations(x, psi):
    # return mean_x, dx, mean_p, dp
    pass

x = np.linspace(0, 1, 4001)                      # a box of width L = 1
psi = np.sqrt(2) * np.sin(np.pi * x)             # its ground state
mx, dx, mp, dp = expectations(x, psi)
print("<x> =", mx, " dx =", dx, " <p> =", mp, " dp =", dp, " dx*dp =", dx * dp)
`,
      answer: t`import numpy as np

hbar = 1.0

def expectations(x, psi):
    rho = np.abs(psi)**2
    mx = np.trapezoid(x * rho, x)
    dx = np.sqrt(np.trapezoid(x**2 * rho, x) - mx**2)
    dpsi = np.gradient(psi, x)
    mp = np.real(np.trapezoid(np.conj(psi) * (-1j * hbar) * dpsi, x))
    dp = np.sqrt(np.trapezoid(hbar**2 * np.abs(dpsi)**2, x) - mp**2)
    return mx, dx, mp, dp

x = np.linspace(0, 1, 4001)
psi = np.sqrt(2) * np.sin(np.pi * x)
mx, dx, mp, dp = expectations(x, psi)
print("<x> =", mx, " dx =", dx, " <p> =", mp, " dp =", dp, " dx*dp =", dx * dp)`,
      tests: [
        { name: t`box ground state: $\langle x\rangle = L/2$ and $\Delta x = ${fmt(BOX.dx, 4)}\,L$`, code: `(lambda r: abs(r[0] - 0.5) < 1e-6 and abs(r[1] - ${BOX.dx}) < 1e-4)(expectations(x, psi))` },
        { name: t`box ground state: $\langle p\rangle = 0$ and $\Delta p = \pi\hbar/L$`, code: '(lambda r: abs(r[2]) < 1e-9 and abs(r[3] - np.pi) < 2e-3)(expectations(x, psi))' },
        { name: t`a Gaussian reaches the limit: $\Delta x\,\Delta p = \hbar/2$`, code: '(lambda g: (lambda r: abs(r[1]*r[3] - 0.5) < 1e-3)(expectations(g[0], g[1])))((lambda X: (X, np.pi**-0.25*np.exp(-X**2/2)))(np.linspace(-10, 10, 4001)))' },
        { name: t`a packet moving with $e^{2ix}$ has $\langle p\rangle = 2\hbar$`, code: '(lambda X: abs(expectations(X, np.pi**-0.25*np.exp(-X**2/2)*np.exp(2j*X))[2] - 2) < 1e-3)(np.linspace(-10, 10, 4001))' },
      ],
      hints: [t`$\langle x\rangle$ = \`np.trapezoid(x * np.abs(psi)**2, x)\`; $\langle x^2\rangle$ the same with \`x**2\`.`, t`\`dpsi = np.gradient(psi, x)\`; $\langle p\rangle$ = \`np.real(np.trapezoid(np.conj(psi) * (-1j*hbar) * dpsi, x))\`; $\langle p^2\rangle$ = \`np.trapezoid(hbar**2 * np.abs(dpsi)**2, x)\`.`],
      teach: 'On a grid, every expectation value is a trapezoid-rule integral of ψ* (operator ψ).',
      explain: t`The box gives $\Delta x\,\Delta p = ${fmt(boxProduct(1), 3)}$, the Gaussian exactly 0.5 — the minimum — and multiplying by $e^{2ix}$ shifts the momentum to $2\hbar$ without changing $|\psi|^2$ or $\Delta p$: momentum lives in the phase.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-spread', difficulty: 3,
      gen(r) {
        const a = r.pick([0.1, 0.2, 0.5]), dx = (Math.sqrt(3) / 2) * a;
        return {
          prompt: t`For $\psi(x) = 2a^{-3/2}\,x\,e^{-x/a}$ ($x > 0$) with $a = ${a}$ nm, $\langle x\rangle = 1.5a$. Find $\Delta x$, in nm. ($\int_0^\infty x^ne^{-bx}dx = n!/b^{n+1}$.)`,
          answer: dx, units: 'nm', tol: { rel: 0.01 },
          errors: [{ value: Math.sqrt(3) * a, feedback: t`That is $\sqrt{\langle x^2\rangle}$. Subtract $\langle x\rangle^2 = 2.25a^2$ before the square root.` }],
          hints: [t`$\langle x^2\rangle = \dfrac{4}{a^3}\displaystyle\int_0^\infty x^4e^{-2x/a}\,dx = \dfrac{4}{a^3}\cdot\dfrac{24}{(2/a)^5}$.`, t`$\langle x^2\rangle = 3a^2$, so $\Delta x = a\sqrt{3 - 2.25}$.`],
          teach: 'Δx needs ⟨x²⟩ as well as ⟨x⟩: Δx² = ⟨x²⟩ − ⟨x⟩².',
          explain: t`$\langle x^2\rangle = 3a^2$, so $\Delta x = a\sqrt{3 - 9/4} = \tfrac{\sqrt3}{2}a = ${fmt(dx, 3)}$ nm.`,
          visual: lopsided(a),
        };
      },
    }),
    mcq({
      id: 'cp-minimum', difficulty: 2,
      prompt: t`Which of these states has the smallest possible uncertainty product, $\Delta x\,\Delta p = \hbar/2$ exactly?`,
      choices: ['The Gaussian: the harmonic oscillator’s ground state', 'The ground state of a box', 'The bound state of a very narrow well, a two-sided exponential', 'The oscillator’s first excited state'],
      answer: 0,
      why: {
        1: t`The box’s sharp walls cost a little: $0.568\hbar$.`,
        2: t`Its sharp cusp at the centre needs extra momentum: $\Delta x\,\Delta p = \hbar/\sqrt2 = 0.707\hbar$.`,
        3: t`Excited states sit above the limit: $\tfrac32\hbar$ for the oscillator’s $n = 1$.`,
      },
      hints: [t`Which of these is the oscillator ground state, whose energy $\tfrac12\hbar\omega$ is the least the uncertainty principle allows?`],
      teach: 'Only Gaussian states reach ΔxΔp = ħ/2; every other shape costs more.',
      explain: t`The Gaussian is the minimum-uncertainty state, $\Delta x\,\Delta p = \hbar/2$. The others: box $0.568\hbar$, exponential $0.707\hbar$, oscillator $n = 1$: $1.5\hbar$.`,
      visual: shapes,
    }),
    num({
      id: 'cp-ammonia', difficulty: 3, transfer: true,
      prompt: t`In an ammonia molecule, NH₃, the nitrogen atom sits on one side or the other of the plane of the three hydrogens: a double well. Tunnelling through the barrier between the sides splits each level into a pair; for the rotational state used in the first clocks the pair is $\Delta E = ${tex(NH3.dE, 4)}$ eV apart. A molecule prepared on one side is the superposition $(\psi_\text{even} + \psi_\text{odd})/\sqrt2$, and its $\langle z\rangle$ swings from side to side at the frequency $f = \Delta E/h$. What is $f$, in GHz?`,
      answer: NH3.f, units: 'GHz', tol: { rel: 0.005 },
      errors: [{ value: NH3.f * 2 * Math.PI, feedback: t`Use $h = 4.136\times10^{-15}$ eV s, not $\hbar$: $f = \Delta E/h$.` }],
      hints: [t`$f = \Delta E/h$ with $h = 4.136\times10^{-15}$ eV s.`, t`$f = ${tex(NH3.dE, 4)}/4.1357\times10^{-15}$ Hz; divide by $10^9$ for GHz.`],
      teach: 'A two-state superposition oscillates at (E₂ − E₁)/h — the frequency an atomic clock counts.',
      explain: t`$f = ${tex(NH3.dE, 4)}/${tex(4.135667696e-15, 5)} = ${fmt(NH3.f, 4)}$ GHz, a microwave frequency. Microwaves at exactly this frequency drive the inversion, and in 1949 the US National Bureau of Standards locked an oscillator to this ammonia line: the first atomic clock. In 1954 Townes used the same transition for the maser, forerunner of the laser.`,
      visual: well({ well: 'double', L: 1.6, w: 0.2, V0: 3, n: 1, super: [1, 2], show: 'prob', play: false, hide: ['energy'] }, 'A double well (top) with its lowest pair of levels (gold) and the superposition of the pair (bottom), localised on one side. A model double well for an electron, not ammonia’s actual potential: the nitrogen’s levels are far more closely spaced.'),
    }),
  ],
  sources: [
    { label: 'OpenStax University Physics Vol. 3, §7.2 (expectation values)', url: 'https://openstax.org/books/university-physics-volume-3/pages/7-2-the-heisenberg-uncertainty-principle' },
    { label: 'Feynman Lectures on Physics Vol. III, ch. 8–9: the ammonia molecule and the maser', url: 'https://www.feynmanlectures.caltech.edu/III_09.html' },
    { label: 'NIST: the first atomic clock (ammonia, 1949)', url: 'https://www.nist.gov/atomic-clocks/how-do-atomic-clocks-work' },
  ],
});
