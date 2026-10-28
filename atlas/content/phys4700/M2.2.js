// Normalization and probability current (Griffiths & Schroeter §1.4 and
// Problem 1.14; §2.5 for the step). ∫|Ψ|²dx = 1 is kept by the Schrödinger
// equation because probability flows: ∂ρ/∂t + ∂J/∂x = 0 with
// J = (ħ/m) Im(Ψ* ∂Ψ/∂x). Plane-wave currents, real wave functions with none,
// two counter-propagating waves, and the step, where T = J_t/J_i rather than
// |t|². A NumPy exercise normalizes a grid wave function and computes its
// current. Every number is computed here.
import { lesson, mcq, num, code } from '../../src/core/content.js';
import { fmt, tex } from '../../src/core/format.js';
import { C, ME, QE, HBAR, HB2M_EVNM2, curvePic, seg, label, r6, abs2, cmul, conj } from './_qm.js';

const t = String.raw;

/** Shapes to normalize: TeX of ψ/A, the Atlas expression of ψ/A for x in units of a, its region, and c with A = c a^(-p). */
const SHAPES = {
  tri: { tex: t`A\,(a - |x|)`, where: t`for $|x| < a$ and zero outside`, fn: '(1 - abs(x))', dom: [-1, 1], c: Math.sqrt(3 / 2), p: 1.5, ptex: '3/2', int: t`\int_{-a}^{a}(a - |x|)^2dx = \tfrac{2a^3}{3}` },
  para: { tex: t`A\,(a^2 - x^2)`, where: t`for $|x| < a$ and zero outside`, fn: '(1 - x^2)', dom: [-1, 1], c: Math.sqrt(15 / 16), p: 2.5, ptex: '5/2', int: t`\int_{-a}^{a}(a^2 - x^2)^2dx = \tfrac{16a^5}{15}` },
  lor: { tex: t`\dfrac{A}{x^2 + a^2}`, where: 'for all x', fn: '1/(x^2 + 1)', dom: [-4, 4], c: Math.sqrt(2 / Math.PI), p: -1.5, ptex: '-3/2', int: t`\int_{-\infty}^{\infty}\frac{dx}{(x^2 + a^2)^2} = \frac{\pi}{2a^3}` },
  gauss: { tex: t`A\,e^{-x^2/2a^2}`, where: 'for all x', fn: 'exp(-x^2/2)', dom: [-3.5, 3.5], c: Math.PI ** -0.25, p: 0.5, ptex: '1/2', int: t`\int_{-\infty}^{\infty}e^{-x^2/a^2}dx = a\sqrt\pi` },
  sech: { tex: t`A\,\operatorname{sech}(x/a)`, where: 'for all x', fn: '1/cosh(x)', dom: [-4, 4], c: Math.SQRT1_2, p: 0.5, ptex: '1/2', int: t`\int_{-\infty}^{\infty}\operatorname{sech}^2(x/a)\,dx = 2a` },
  quart: { tex: t`A\,(1 - x^2/a^2)^2`, where: t`for $|x| < a$ and zero outside`, fn: '(1 - x^2)^2', dom: [-1, 1], c: Math.sqrt(315 / 256), p: 0.5, ptex: '1/2', int: t`\int_{-a}^{a}(1 - x^2/a^2)^4dx = \tfrac{256a}{315}` },
};

function normItem(id, keys, difficulty) {
  return num({
    id, difficulty,
    gen(r) {
      const S = SHAPES[r.pick(keys)], a = r.pick([0.5, 2, 4]);
      const ans = S.c * a ** -S.p, unit = S.p > 0 ? t`\text{nm}^{-${S.ptex}}` : t`\text{nm}^{${S.ptex.slice(1)}}`;
      const span = S.dom[1] - S.dom[0], xs = [r6(S.dom[0] * a - 0.15 * span * a), r6(S.dom[1] * a + 0.15 * span * a)];
      return {
        prompt: t`Normalize $\psi(x) = ${S.tex}$, ${S.where}, with $a = ${a}$ nm: find the positive constant $A$, in $${unit}$.`,
        visual: curvePic({ fn: `max(${S.fn.replace(/x/g, `(x/${a})`)}, 0)^2*(step(${S.dom[1] * a} - abs(x)))`, x: xs, y: [0, 1.15], ylabel: '|ψ/A|² (scaled)', caption: t`The shape $|\psi|^2/|A|^2$, scaled to peak at 1. Normalizing picks $A$ so that the area under $|\psi|^2$ is 1.` }),
        answer: ans, tol: { rel: 0.005 },
        errors: [{ value: ans * ans, feedback: t`That is $A^2$; take the square root.` }, { value: 1 / (ans * ans), feedback: t`That is $\int|\psi/A|^2dx$ itself. $A$ is one over its square root.` }].filter((e) => Math.abs(e.value - ans) > 0.01 * ans),
        hints: [t`Set $|A|^2\int|\psi/A|^2\,dx = 1$.`, t`$${S.int}$.`],
        teach: t`To normalize, set $|A|^2$ times the integral of the squared shape equal to 1.`,
        explain: t`$|A|^2\times(${S.int.replace(/^.*= /, '')}) = 1$ with $a = ${a}$ nm gives $A = ${fmt(ans, 4)}\ ${unit}$.`,
      };
    },
  });
}

/** A step from 0 to V₀ at x = 0 for an electron of energy E (eV). */
const stepPic = (E, Vb, caption, extra = {}) => ({ type: 'mp-schrodinger', params: { mode: 'scatter', barrier: 'step', E, Vb, controls: false, readout: false, panels: ['energy', 'wave'], ...extra }, caption });
const kOf = (E) => Math.sqrt(E / HB2M_EVNM2);       // nm⁻¹, an electron of kinetic energy E (eV)

/** Relativistic speed of an electron of kinetic energy K (eV). */
const speed = (K) => { const g = 1 + K / (ME * C * C / QE); return C * Math.sqrt(1 - 1 / (g * g)); };

export default lesson({
  id: 'phys4700.M2.2',
  title: 'Normalization and probability current',
  minutes: 15, difficulty: 3,
  intro: t`Born’s rule needs $\int|\Psi|^2dx = 1$: the particle is somewhere. Normalize $\Psi$ once and the Schrödinger equation keeps it normalized forever. The reason is local. Probability behaves like a conserved fluid: it can only drain out of a region by flowing through its ends, at a rate set by the **probability current** $J$:

$$\frac{\partial|\Psi|^2}{\partial t} + \frac{\partial J}{\partial x} = 0, \qquad J = \frac{\hbar}{m}\,\operatorname{Im}\!\left(\Psi^*\frac{\partial\Psi}{\partial x}\right)$$

A plane wave $Ae^{ikx}$ carries $J = |A|^2\,\hbar k/m$: density times velocity. A real wave function carries none. Currents are what you compare when a particle meets a step or a barrier: the transmission probability is the ratio of transmitted to incident **current**, not of squared amplitudes.`,
  symbols: [
    { tex: '|\\Psi|^2', text: t`the probability density $\rho$, in $\text{m}^{-1}$` },
    { tex: 'J(x, t)', text: t`the probability current: the probability per second flowing past $x$ in the $+x$ direction, in $\text{s}^{-1}$` },
    { tex: '\\operatorname{Im}', text: t`the imaginary part; equivalently $J = \tfrac{\hbar}{2mi}\left(\Psi^*\partial_x\Psi - \Psi\,\partial_x\Psi^*\right)$` },
    { tex: '\\hbar/m', text: t`turns a wavenumber into a speed: $\hbar k/m = p/m = v$` },
    { tex: '\\partial/\\partial t,\\ \\partial/\\partial x', text: 'rates of change in time at fixed position, and along x at fixed time' },
  ],
  why: 'Transmission through barriers, tunnelling currents in electronics and the flux in every scattering experiment are probability currents.',
  visual: {
    type: 'mp-schrodinger',
    title: 'A wave meets a step',
    lead: t`An electron’s plane wave comes in from the left and meets a potential step. On the left, the incident and reflected waves interfere, so $|\psi|^2$ ripples; on the right only the transmitted wave runs, so $|\psi|^2$ is flat. The current is the same on both sides: what comes in is what is reflected plus what gets through.`,
    tasks: [
      'Raise E well above the step: the ripples fade as less is reflected, and T climbs toward 1.',
      'Drop E below the step: the wave leaks a little way in and dies — no current crosses, T = 0.',
      'Switch to a barrier and make it thin: a current now leaks through even below the top.',
    ],
    params: { mode: 'scatter', barrier: 'step', E: 5, Vb: 3, controls: ['barrier', 'E', 'Vb', 'd'], panels: ['energy', 'wave', 'T'] },
  },
  example: {
    prompt: t`An electron of energy $E = 5$ eV meets a step up to $V_0 = 3$ eV at $x = 0$. Find the reflection and transmission probabilities from the currents, and check that they add to 1.`,
    visual: stepPic(5, 3, t`The 5 eV electron at the 3 eV step: interference on the left, a steady transmitted wave on the right.`),
    steps: [
      { label: 'The waves', text: t`Left: $\psi = e^{ik_1x} + r\,e^{-ik_1x}$ with $k_1 = \sqrt{2mE}/\hbar = ${fmt(kOf(5), 4)}\ \text{nm}^{-1}$. Right: $\psi = t\,e^{ik_2x}$ with $k_2 = \sqrt{2m(E - V_0)}/\hbar = ${fmt(kOf(2), 4)}\ \text{nm}^{-1}$.` },
      { label: 'Match at the step', text: t`$\psi$ and $\psi'$ continuous at 0: $1 + r = t$ and $k_1(1 - r) = k_2t$. So $r = \dfrac{k_1 - k_2}{k_1 + k_2} = ${fmt((kOf(5) - kOf(2)) / (kOf(5) + kOf(2)), 4)}$ and $t = \dfrac{2k_1}{k_1 + k_2} = ${fmt(2 * kOf(5) / (kOf(5) + kOf(2)), 4)}$.` },
      { label: 'Currents', text: t`Each plane wave carries $|{\rm amplitude}|^2\,\hbar k/m$: incident $\hbar k_1/m$, reflected $|r|^2\hbar k_1/m$ (to the left), transmitted $|t|^2\hbar k_2/m$.` },
      { label: 'Ratios', text: t`$R = |r|^2 = ${fmt(((kOf(5) - kOf(2)) / (kOf(5) + kOf(2))) ** 2, 4)}$ and $T = \dfrac{k_2}{k_1}|t|^2 = ${fmt(kOf(2) / kOf(5), 4)}\times${fmt((2 * kOf(5) / (kOf(5) + kOf(2))) ** 2, 4)} = ${fmt(4 * kOf(5) * kOf(2) / (kOf(5) + kOf(2)) ** 2, 4)}$.` },
      { label: 'Sense check', text: t`$R + T = 1$: probability is conserved. Note that $|t|^2 = ${fmt((2 * kOf(5) / (kOf(5) + kOf(2))) ** 2, 3)}$ exceeds 1 — it is not a probability. The transmitted wave is denser because it moves slower, and the current, not the density, is what crosses the step.` },
    ],
    answer: t`$R = ${fmt(((kOf(5) - kOf(2)) / (kOf(5) + kOf(2))) ** 2, 3)}$ and $T = ${fmt(4 * kOf(5) * kOf(2) / (kOf(5) + kOf(2)) ** 2, 3)}$: about 5% reflected, though classically the electron would sail over the step.`,
  },
  practice: [
    normItem('normalize', ['tri', 'para', 'lor'], 2),
    num({
      id: 'beam-current', difficulty: 2,
      gen(r) {
        const K = r.pick([10, 50, 100, 500]), lam = r.pick([2, 5, 8]);
        const v = speed(K), ans = lam * 1e3 * v;
        return {
          prompt: t`A beam of ${K} eV electrons is described by a plane wave $\Psi = A\,e^{ikx}$ with $|A|^2 = ${lam}\ \text{mm}^{-1}$ (on average ${lam} electrons per millimetre of beam). What is the probability current $J$ — electrons per second passing a point?`,
          visual: { type: 'graph', params: { x: [0, 10], y: [-1.4, 1.6], aspect: 'wide', xlabel: 'x', ylabel: '', xticks: 0, yticks: 0, curves: [{ fn: 'cos(4*x)', color: 'accent', width: 2.2, label: 'Re Ψ', labelAt: 0.2, labelDy: -12 }, { fn: '1.2', color: 'good', width: 2, label: '|Ψ|² = |A|², the same everywhere', labelAt: 3, labelDy: -10 }], arrows: [{ from: [6.5, -1.15], to: [9.2, -1.15], color: 'gold', width: 2.4, label: 'J = |A|² v', labelDx: -60, labelDy: -12 }] }, caption: 'A plane wave: a uniform density flowing at the particle’s speed. Schematic.' },
          answer: ans, units: 's^-1', tol: { rel: 0.01 },
          errors: [{ value: lam * v, feedback: t`Convert the density to SI: ${lam} per millimetre is $${lam}\times10^{3}$ per metre.` }, { value: ans / 2, feedback: t`$J = |A|^2\hbar k/m = |A|^2 v$, with no factor ½ ($v = p/m$, not the phase velocity).` }],
          hints: [t`$J = |A|^2\,\hbar k/m = |A|^2 v$.`, t`$v = \sqrt{2K/m}$ for a ${K} eV electron (relativity changes it by under 0.1%).`],
          teach: t`A plane wave’s current is its density times the particle’s speed, $J = |A|^2\hbar k/m$.`,
          explain: t`$v = ${tex(v, 4)}$ m/s, so $J = (${lam}\times10^{3}\ \text{m}^{-1})(${tex(v, 3)}\ \text{m/s}) = ${tex(ans, 3)}\ \text{s}^{-1}$ — an electric current of $eJ = ${tex(QE * ans * 1e9, 3)}$ nA.`,
        };
      },
    }),
    mcq({
      id: 'real-no-current', difficulty: 2,
      prompt: t`An electron sits in a stationary state of a well whose wave function, apart from the factor $e^{-iEt/\hbar}$, is real: $\Psi = \psi(x)e^{-iEt/\hbar}$ with $\psi$ real. What is its probability current?`,
      visual: { type: 'mp-schrodinger', params: { mode: 'bound', well: 'finite', L: 1, V0: 5, n: 2, show: 'psi', controls: false, readout: false, panels: ['energy', 'wave'] }, caption: 'A bound state of a finite well: ψ is real at every point.' },
      choices: ['Zero everywhere', t`$\hbar k/m$ times $|\psi|^2$, with $k$ the local wavenumber`, 'Positive inside the well and negative outside', 'It sloshes back and forth at the frequency E/h'],
      answer: 0,
      why: {
        1: t`A real standing wave is an equal mix of waves going both ways; their currents cancel.`,
        2: t`Then $|\Psi|^2$ would change in time somewhere — but in a stationary state it is frozen.`,
        3: t`The phase $e^{-iEt/\hbar}$ multiplies $\Psi$ and $\Psi^*$ oppositely and cancels in $\Psi^*\partial_x\Psi$.`,
      },
      hints: [t`$J = \tfrac{\hbar}{m}\operatorname{Im}(\Psi^*\partial_x\Psi)$. Compute $\Psi^*\partial_x\Psi$ for this $\Psi$.`],
      teach: 'A real wave function (times an overall time-dependent phase) carries no probability current.',
      explain: t`$\Psi^*\partial_x\Psi = \psi\,\psi'$ — the phases cancel — and that is real, so its imaginary part, and $J$, vanish. Consistently, $\partial_t|\Psi|^2 = -\partial_xJ = 0$.`,
    }),
    num({
      id: 'two-waves', difficulty: 3,
      gen(r) {
        const A = r.pick([[2, 0], [1, 1], [0, 2], [3, 0], [2, 1]]), B = r.pick([[1, 0], [0, 1], [1, -1], [1, 1], [0, -2]].filter((b) => Math.abs(abs2(b) - abs2(A)) > 0.5));
        const ans = abs2(A) - abs2(B);
        const zt = (z) => (z[1] === 0 ? `${z[0]}` : z[0] === 0 ? `${z[1] === 1 ? '' : z[1] === -1 ? '-' : z[1]}i` : `(${z[0]} ${z[1] < 0 ? '-' : '+'} ${Math.abs(z[1]) === 1 ? '' : Math.abs(z[1])}i)`);
        const AB = cmul(A, conj(B));
        return {
          prompt: t`Find the probability current of $\Psi = ${zt(A)}\,e^{ikx} + ${zt(B)}\,e^{-ikx}$, in units of $\hbar k/m$.`,
          visual: curvePic({ fn: `${abs2(A) + abs2(B)} + 2*(${r6(AB[0])}*cos(2*x) - ${r6(AB[1])}*sin(2*x))`, x: [0, 9.42], y: [0, r6(1.15 * (Math.sqrt(abs2(A)) + Math.sqrt(abs2(B))) ** 2)], xlabel: 'kx', ylabel: '|Ψ|²', caption: 'The density ripples where the two waves interfere; the current does not depend on the ripples.' }),
          answer: ans, tol: { rel: 0, abs: 0.01 },
          errors: [
            { value: abs2(A) + abs2(B), feedback: 'Currents in opposite directions subtract: the left-moving wave carries −|B|² ħk/m.' },
            { value: (Math.sqrt(abs2(A)) - Math.sqrt(abs2(B))) ** 2, feedback: t`Each wave’s current goes with its own squared amplitude: $|A|^2 - |B|^2$, not $(|A| - |B|)^2$.` },
          ].filter((e) => Math.abs(e.value - ans) > 0.05),
          hints: [t`Compute $\Psi^*\partial_x\Psi$; the cross terms are $e^{\pm 2ikx}$ pieces.`, t`The cross terms in $\operatorname{Im}(\Psi^*\Psi')$ cancel; what remains is $k(|A|^2 - |B|^2)$.`],
          teach: t`For $Ae^{ikx} + Be^{-ikx}$ the current is $(\hbar k/m)(|A|^2 - |B|^2)$: the two waves’ currents subtract and their interference carries none.`,
          explain: t`$J = \tfrac{\hbar k}{m}\big(|A|^2 - |B|^2\big) = \tfrac{\hbar k}{m}(${abs2(A)} - ${abs2(B)}) = ${ans}\,\tfrac{\hbar k}{m}$. The density’s ripples come from the cross term, but the cross term carries no current: $\operatorname{Im}$ of it cancels between the two orders.`,
        };
      },
    }),
    num({
      id: 'step-T', difficulty: 2,
      gen(r) {
        const [E, Vb] = r.pick([[2, 1], [3, 2], [4, 3], [6, 2], [1.5, 1], [9, 5]]);
        const k1 = kOf(E), k2 = kOf(E - Vb), T = 4 * k1 * k2 / (k1 + k2) ** 2, t2 = (2 * k1 / (k1 + k2)) ** 2;
        return {
          prompt: t`An electron of energy $${E}$ eV meets a step up to $${Vb}$ eV. What fraction of the incident current is transmitted?`,
          visual: stepPic(E, Vb, t`The ${E} eV electron at the ${Vb} eV step.`),
          answer: T, tol: { rel: 0.005 },
          errors: [{ value: t2, feedback: t`That is $|t|^2$, the ratio of densities. Multiply by $k_2/k_1$ to compare currents.` }, { value: 1 - T, feedback: 'That is the reflected fraction, R.' }].filter((e) => Math.abs(e.value - T) > 0.01),
          hints: [t`$k \propto \sqrt{\text{kinetic energy}}$: $k_2/k_1 = \sqrt{(E - V_0)/E}$.`, t`$T = \dfrac{4k_1k_2}{(k_1 + k_2)^2}$.`],
          teach: t`At a step, $T = \dfrac{k_2}{k_1}|t|^2 = \dfrac{4k_1k_2}{(k_1 + k_2)^2}$: transmitted over incident current.`,
          explain: t`$k_2/k_1 = \sqrt{${E - Vb}/${E}} = ${fmt(k2 / k1, 4)}$, so $T = \dfrac{4(${fmt(k2 / k1, 4)})}{(1 + ${fmt(k2 / k1, 4)})^2} = ${fmt(T, 3)}$ and $R = ${fmt(1 - T, 3)}$. Only the ratio $E/V_0$ matters, not the mass.`,
        };
      },
    }),
    mcq({
      id: 'region-rate', difficulty: 2,
      prompt: t`From the continuity equation, at what rate does the probability of finding the particle between $x = a$ and $x = b$ change?`,
      visual: { type: 'graph', params: { x: [0, 10], y: [0, 1.25], aspect: 'wide', xlabel: 'x', ylabel: '|Ψ|²', xticks: 0, yticks: 0, axesAt: 'edge', curves: [{ fn: 'exp(-(x - 5)^2/4)', color: 'accent', width: 2.4 }], shade: [{ fn: 'exp(-(x - 5)^2/4)', from: 3, to: 7, color: 'gold', alpha: 0.35 }], vlines: [{ x: 3, label: 'a', color: 'ink3' }, { x: 7, label: 'b', color: 'ink3' }], arrows: [{ from: [1.6, 0.25], to: [2.9, 0.25], color: 'good', width: 2.2, label: 'J(a)', labelDx: -46, labelDy: -12 }, { from: [7.1, 0.25], to: [8.4, 0.25], color: 'bad', width: 2.2, label: 'J(b)', labelDx: -8, labelDy: -12 }] }, caption: 'Probability flows in through x = a and out through x = b. Schematic.' },
      choices: [t`$\dfrac{dP_{ab}}{dt} = J(a) - J(b)$`, t`$\dfrac{dP_{ab}}{dt} = J(b) - J(a)$`, t`$0$, since probability is conserved`, t`$\dfrac{\partial J}{\partial x}$ at the midpoint`],
      answer: 0,
      why: {
        1: t`Integrating $\partial_t\rho = -\partial_xJ$ gives $-[J]_a^b = J(a) - J(b)$: the minus sign makes inflow at $a$ count positive.`,
        2: 'Probability is conserved overall, but it can move from one region to another; only the whole line’s total is fixed.',
        3: 'The integral of ∂J/∂x over the region is the difference of the end values, not a value at one point.',
      },
      hints: [t`Integrate $\partial_t|\Psi|^2 = -\partial_xJ$ from $a$ to $b$.`],
      teach: 'Probability in a region changes only by the current flowing in at one end minus the current flowing out at the other.',
      explain: t`$\dfrac{d}{dt}\int_a^b|\Psi|^2dx = -\int_a^b\partial_xJ\,dx = J(a) - J(b)$. Let $a \to -\infty$ and $b \to \infty$, where a normalizable $\Psi$ and its current vanish, and the total stays 1.`,
    }),
    code({
      id: 'grid-current', difficulty: 3,
      prompt: t`Wave functions computed by machine are arrays. With $\hbar = m = 1$, write \`normalize(x, psi)\`, which returns $\psi/\sqrt{\int|\psi|^2dx}$ (use \`np.trapezoid\`), and \`current(x, psi)\`, which returns $J = \operatorname{Im}(\psi^*\,d\psi/dx)$ at every grid point (use \`np.gradient(psi, x)\` for the derivative).`,
      starter: t`import numpy as np

x = np.linspace(-20, 20, 4001)

def normalize(x, psi):
    pass

def current(x, psi):
    pass

psi = normalize(x, np.exp(-x**2 / 8) * np.exp(1.5j * x))
print(np.trapezoid(current(x, psi), x))
`,
      answer: t`import numpy as np

x = np.linspace(-20, 20, 4001)

def normalize(x, psi):
    return psi / np.sqrt(np.trapezoid(np.abs(psi) ** 2, x))

def current(x, psi):
    return np.imag(np.conj(psi) * np.gradient(psi, x))

psi = normalize(x, np.exp(-x**2 / 8) * np.exp(1.5j * x))
print(np.trapezoid(current(x, psi), x))`,
      tests: [
        { name: 'normalize gives ∫|ψ|² dx = 1', code: 'abs(np.trapezoid(np.abs(normalize(x, np.exp(-x**2 / 3) * (1 + 0.5j)))**2, x) - 1) < 1e-9' },
        { name: 'a real ψ carries no current', code: 'np.max(np.abs(current(x, normalize(x, np.exp(-x**2 / 3))))) < 1e-12' },
        { name: t`$\psi = g(x)e^{ikx}$ has $J = k|\psi|^2$ ($k = 1.5$)`, code: 'np.allclose(current(x, normalize(x, np.exp(-x**2/8)*np.exp(1.5j*x))), 1.5*np.abs(normalize(x, np.exp(-x**2/8)*np.exp(1.5j*x)))**2, atol=2e-5)' },
        { name: 'its total current ∫J dx is k = 1.5', code: 'abs(np.trapezoid(current(x, normalize(x, np.exp(-x**2/8)*np.exp(1.5j*x))), x) - 1.5) < 1e-4' },
      ],
      hints: ['`np.trapezoid(y, x)` integrates samples; `np.abs(psi)**2` is the density.', '`np.imag(np.conj(psi) * np.gradient(psi, x))` is J with ħ = m = 1.'],
      teach: t`On a grid, $J = \operatorname{Im}(\psi^*\psi')$ needs only a numerical derivative; for $g(x)e^{ikx}$ it is $k|\psi|^2$.`,
      explain: t`For $\psi = g\,e^{ikx}$ with real $g$, $\psi^*\psi' = g g' + ik g^2$, so $J = k|\psi|^2$ and its total, $\int J\,dx = k$, is $\langle p\rangle/m$ — the subject of the next lesson. The grid derivative is accurate to about $10^{-5}$ here.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-reflect', difficulty: 2,
      gen(r) {
        const [E, Vb] = r.pick([[2, 1.5], [5, 4], [3, 1], [8, 6], [1.2, 1]]);
        const k1 = kOf(E), k2 = kOf(E - Vb), R = ((k1 - k2) / (k1 + k2)) ** 2;
        return {
          prompt: t`An electron of energy $${E}$ eV meets a step up to $${Vb}$ eV. What is the probability that it is reflected?`,
          visual: stepPic(E, Vb, t`The ${E} eV electron at the ${Vb} eV step.`),
          answer: R, tol: { rel: 0.01, abs: 1e-3 },
          errors: [{ value: 1 - R, feedback: 'That is the transmitted fraction, T.' }, { value: Math.sqrt(R), feedback: t`That is $|r|$; the probability is $|r|^2$.` }].filter((e) => Math.abs(e.value - R) > 0.01),
          hints: [t`$R = \left(\dfrac{k_1 - k_2}{k_1 + k_2}\right)^2$ with $k_2/k_1 = \sqrt{(E - V_0)/E}$.`],
          teach: 'Reflection at a step: R = ((k₁ − k₂)/(k₁ + k₂))², the ratio of reflected to incident current.',
          explain: t`$k_2/k_1 = ${fmt(k2 / k1, 4)}$, so $R = \left(\dfrac{1 - ${fmt(k2 / k1, 4)}}{1 + ${fmt(k2 / k1, 4)}}\right)^2 = ${fmt(R, 3)}$. A classical particle with $E > V_0$ is never reflected.`,
        };
      },
    }),
    normItem('cp-normalize', ['gauss', 'sech', 'quart'], 2),
    num({
      id: 'cp-sem', difficulty: 3, transfer: true,
      gen(r) {
        const K = r.pick([0.5, 1, 2, 5]), I = r.pick([0.1, 1, 10]);
        const v = speed(K * 1e3), J = (I * 1e-9) / QE, lam = J / v, gap = 1e3 / lam;
        return {
          prompt: t`A scanning electron microscope inspecting a turbine blade runs a ${K} keV beam carrying ${I} nA. Treat the beam as a plane wave with probability current $J = I/e$ (electrons per second) and density $|A|^2 = J/v$ (electrons per metre). On average, how far apart along the beam are successive electrons, in mm? (Use the relativistic speed; at these energies it differs from $\sqrt{2K/m}$ by under 1%.)`,
          visual: { type: 'graph', params: { x: [0, 10], y: [-1, 1], aspect: 'wide', axes: false, grid: false, xlabel: '', ylabel: '', curves: [seg(0, 0, 10, 0, 'gold', 6)], points: [label(0.2, 0.55, 'electron gun', 'ink2'), label(9.8, 0.55, 'sample', 'ink2', 0, 0, 'right'), { x: 2.1, y: 0, r: 5, color: 'accent' }, { x: 6.4, y: 0, r: 5, color: 'accent' }, label(4.25, -0.4, 'spacing ?', 'accent', 0, 0, 'center')], arrows: [{ from: [2.3, -0.25], to: [6.2, -0.25], color: 'accent', width: 1.6 }] }, caption: 'The beam as a stream of electrons, schematic and not to scale.' },
          answer: gap, units: 'mm', tol: { rel: 0.01 },
          errors: [{ value: lam / 1e3, feedback: 'That is the density, electrons per millimetre. The spacing is its reciprocal.' }].filter((e) => Math.abs(e.value - gap) > 0.02 * gap),
          hints: [t`$J = I/e = ${tex(J, 3)}\ \text{s}^{-1}$.`, t`The spacing is $1/|A|^2 = v/J$.`],
          teach: 'A beam’s current is density times speed; the mean spacing between particles is speed divided by current.',
          explain: t`$v = ${tex(v, 4)}$ m/s and $J = ${tex(J, 3)}\ \text{s}^{-1}$, so the spacing is $v/J = ${fmt(gap, 3)}$ mm. Electrons in an SEM column are usually far apart: each one’s wave function meets the sample essentially alone.`,
        };
      },
    }),
  ],
  sources: [
    { label: 'Griffiths & Schroeter, Introduction to Quantum Mechanics, 3rd ed., §1.4, Problem 1.14 and §2.5', url: 'https://www.cambridge.org/9781316995433' },
    { label: 'CODATA 2022 recommended values (NIST)', url: 'https://physics.nist.gov/cuu/Constants/' },
  ],
});
