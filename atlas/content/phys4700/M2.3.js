// Momentum and expectation values (Griffiths & Schroeter §1.5). ⟨x⟩ from
// Born’s rule; m d⟨x⟩/dt computed from the Schrödinger equation gives
// ⟨p⟩ = ∫Ψ*(−iħ∂ₓ)Ψ dx, and with it the rule ⟨Q⟩ = ∫Ψ* Q(x, −iħ∂ₓ) Ψ dx.
// Momentum lives in the phase: ψ = φ(x)e^{ik₀x} with real φ has ⟨p⟩ = ħk₀,
// and ⟨p²⟩ = ħ²(k₀² + ∫φ′²). phys2710.MP7.5 did the box ground state and a
// lopsided density; this lesson uses kicked packets, sech states and a
// momentum-space check by FFT. Every number is computed here.
import { lesson, mcq, num, code } from '../../src/core/content.js';
import { fmt, tex } from '../../src/core/format.js';
import { HBAR, C, QE, ME, U, M_RB87, RB_D2, HBARC_EVNM, HB2M_EVNM2, curvePic, r6 } from './_qm.js';

const t = String.raw;
const MEC2_EV = (ME * C * C) / QE;
const M_CS133 = 132.905451961 * U, CS_D2 = 852.34727582e-9;    // AME2020; Steck, "Cesium D Line Data"

/** A kicked Gaussian packet's real part, imaginary part and envelope (x in nm). */
const packet = (k, s, caption, extra = {}) => ({
  type: 'graph',
  params: {
    x: [r6(-3.2 * s), r6(3.2 * s)], y: [-1.15, 1.15], aspect: 'wide', xlabel: 'x (nm)', ylabel: 'ψ (scaled)', yticks: 4,
    curves: [
      { fn: `exp(-x^2/(4*${r6(s * s)}))`, color: 'good', width: 1.6, dash: [5, 4] },
      { fn: `exp(-x^2/(4*${r6(s * s)}))*cos(${k}*x)`, color: 'accent', width: 2.2 },
      { fn: `exp(-x^2/(4*${r6(s * s)}))*sin(${k}*x)`, color: 'warn', width: 2, dash: [6, 4] },
    ],
    legend: [{ label: 'Re ψ', color: 'accent' }, { label: 'Im ψ', color: 'warn', dash: [6, 4] }, { label: '|ψ|', color: 'good', dash: [5, 4] }], legendAt: 'tr',
    ...extra,
  },
  caption,
});

export default lesson({
  id: 'phys4700.M2.3',
  title: 'Momentum and expectation values',
  minutes: 15, difficulty: 3,
  intro: t`Born’s rule gives the average of many position measurements, $\langle x\rangle = \int x\,|\Psi|^2dx$. How fast does that average move? Differentiate, use the Schrödinger equation for $\partial_t\Psi$ and integrate by parts, and the answer is

$$\langle p\rangle = m\,\frac{d\langle x\rangle}{dt} = \int_{-\infty}^{\infty}\Psi^*\left(-i\hbar\,\frac{\partial}{\partial x}\right)\Psi\,dx$$

So momentum is represented by the **operator** $\hat p = -i\hbar\,\partial/\partial x$, and every dynamical quantity follows the same rule, $\langle Q\rangle = \int\Psi^*\,\hat Q\,\Psi\,dx$ with $\hat Q = Q(x, -i\hbar\,\partial_x)$: kinetic energy is $\hat p^2/2m$. **Momentum lives in the phase.** A wave function $\phi(x)e^{ik_0x}$ with real $\phi$ has $\langle p\rangle = \hbar k_0$, however $\phi$ is shaped; a real wave function has $\langle p\rangle = 0$. ([Expectation values](#/lesson/phys2710.MP7.5) met these integrals first.)`,
  symbols: [
    { tex: '\\langle p\\rangle', text: 'the expectation value of momentum: the average of many momentum measurements on identical systems, in kg m/s' },
    { tex: '\\langle x\\rangle', text: t`the average position, $\int x|\Psi|^2dx$, in m` },
    { tex: 'm', text: 'the particle’s mass, in kg' },
    { tex: '-i\\hbar\\,\\partial/\\partial x', text: t`the momentum operator: it differentiates $\Psi$ and multiplies by $-i\hbar$; acting on $e^{ikx}$ it gives $\hbar k$` },
    { tex: '\\Psi^*', text: t`the complex conjugate of $\Psi$, which stands to the left of the operator and is not differentiated` },
  ],
  why: 'This rule — sandwich the operator between Ψ* and Ψ — is how every measurable average in quantum mechanics is computed, from atomic energies to the momentum kicks that make atom interferometers work.',
  visual: {
    type: 'graph',
    title: 'Momentum lives in the phase',
    lead: t`An electron in the packet $\psi = e^{-x^2/4\sigma^2}e^{ik_0x}$. The phase winds $k_0$ radians per nanometre, and that winding, not the shape, sets $\langle p\rangle = \hbar k_0$. The kinetic energy has a second part from the confinement.`,
    tasks: [
      'Set k₀ = 0: ψ is real and ⟨p⟩ = 0, yet ⟨T⟩ is not zero.',
      'Flip k₀ from +4 to −4: |ψ| and Re ψ do not change, only Im ψ does. The direction of motion is in the phase.',
      'Shrink σ: ⟨p⟩ stays put while ⟨T⟩ grows. Squeezing a packet costs kinetic energy.',
    ],
    params: {
      x: [-3, 3], y: [-1.15, 1.15], aspect: 'wide', xlabel: 'x (nm)', ylabel: 'ψ (scaled)', yticks: 4,
      sliders: [
        { key: 'k', label: 'Wavenumber $k_0$', min: -10, max: 10, step: 0.5, value: 4, unit: '\\text{nm}^{-1}', explain: 'How fast the phase winds along x; negative winds the other way.' },
        { key: 's', label: 'Width $\\sigma$', min: 0.15, max: 1.2, step: 0.05, value: 0.6, unit: '\\text{nm}', explain: 'The spread of position: |ψ|² is a Gaussian of standard deviation σ.' },
      ],
      curves: [
        { fn: 'exp(-x^2/(4*s^2))', color: 'good', width: 1.6, dash: [5, 4] },
        { fn: 'exp(-x^2/(4*s^2))*cos(k*x)', color: 'accent', width: 2.2 },
        { fn: 'exp(-x^2/(4*s^2))*sin(k*x)', color: 'warn', width: 2, dash: [6, 4] },
      ],
      legend: [{ label: 'Re ψ', color: 'accent' }, { label: 'Im ψ', color: 'warn', dash: [6, 4] }, { label: '|ψ|', color: 'good', dash: [5, 4] }], legendAt: 'tr',
      readouts: [
        { label: '$\\langle p\\rangle c$ (eV)', expr: `${r6(HBARC_EVNM)}*k`, digits: 4 },
        { label: '$\\langle T\\rangle$ (eV)', expr: `${r6(HB2M_EVNM2)}*(k^2 + 1/(4*s^2))`, digits: 3 },
        { label: 'confinement part (eV)', expr: `${r6(HB2M_EVNM2)}/(4*s^2)`, digits: 3 },
      ],
    },
    caption: t`The shape is not normalized in the picture (its peak is drawn at 1); the readouts use the normalized $\psi$. $\langle T\rangle = \tfrac{\hbar^2}{2m}\big(k_0^2 + \tfrac{1}{4\sigma^2}\big)$ for an electron.`,
  },
  example: {
    prompt: t`A particle has $\psi(x) = \dfrac{1}{\sqrt{2a}}\operatorname{sech}\dfrac{x}{a}\;e^{ik_0x}$. Find $\langle x\rangle$, $\langle p\rangle$ and $\langle p^2\rangle$. Then evaluate $\langle T\rangle$ for an electron with $a = 0.5$ nm and $k_0 = 5\ \text{nm}^{-1}$.`,
    visual: packet(5, 0.5 * 0.9, t`The sech packet for $a = 0.5$ nm and $k_0 = 5\ \text{nm}^{-1}$: real and imaginary parts under the envelope $|\psi|$, scaled to peak at 1.`, { curves: [{ fn: '1/cosh(x/0.5)', color: 'good', width: 1.6, dash: [5, 4] }, { fn: 'cos(5*x)/cosh(x/0.5)', color: 'accent', width: 2.2 }, { fn: 'sin(5*x)/cosh(x/0.5)', color: 'warn', width: 2, dash: [6, 4] }], x: [-1.8, 1.8] }),
    steps: [
      { label: 'Position', text: t`$|\psi|^2 = \tfrac{1}{2a}\operatorname{sech}^2(x/a)$ is even, so $\langle x\rangle = \int x|\psi|^2dx = 0$.` },
      { label: 'Differentiate', text: t`Write $\psi = \phi\,e^{ik_0x}$ with $\phi$ real. Then $\psi' = (\phi' + ik_0\phi)e^{ik_0x}$, and the phases cancel in $\psi^*\psi' = \phi\phi' + ik_0\phi^2$.` },
      { label: 'Momentum', text: t`$\langle p\rangle = -i\hbar\int(\phi\phi' + ik_0\phi^2)\,dx = -i\hbar\Big[\tfrac12\phi^2\Big]_{-\infty}^{\infty} + \hbar k_0\int\phi^2dx = 0 + \hbar k_0$.` },
      { label: 'Momentum squared', text: t`Integrating by parts once, $\langle p^2\rangle = \hbar^2\int|\psi'|^2dx = \hbar^2\int(\phi'^2 + k_0^2\phi^2)\,dx = \hbar^2\left(k_0^2 + \tfrac{1}{3a^2}\right)$, using $\int\phi'^2dx = \tfrac{1}{2a^3}\int\operatorname{sech}^2\tanh^2(x/a)\,dx = \tfrac{1}{3a^2}$.` },
      { label: 'Numbers', text: t`$\langle T\rangle = \tfrac{\langle p^2\rangle}{2m} = \tfrac{\hbar^2}{2m}\left(k_0^2 + \tfrac{1}{3a^2}\right) = ${fmt(HB2M_EVNM2, 4)}\ \text{eV nm}^2\times(25 + ${fmt(1 / 0.75, 4)})\ \text{nm}^{-2} = ${fmt(HB2M_EVNM2 * (25 + 1 / 0.75), 3)}$ eV.` },
      { label: 'Sense check', text: t`$\langle p\rangle$ came out real, as an observable’s average must. The kinetic energy is the motion’s $\hbar^2k_0^2/2m = ${fmt(HB2M_EVNM2 * 25, 3)}$ eV plus a confinement part, $${fmt(HB2M_EVNM2 / 0.75, 3)}$ eV, that no choice of $k_0$ removes.` },
    ],
    answer: t`$\langle x\rangle = 0$, $\langle p\rangle = \hbar k_0$, $\langle p^2\rangle = \hbar^2\big(k_0^2 + \tfrac{1}{3a^2}\big)$; $\langle T\rangle = ${fmt(HB2M_EVNM2 * (25 + 1 / 0.75), 3)}$ eV.`,
  },
  practice: [
    mcq({
      id: 'real-psi', difficulty: 1,
      prompt: t`A normalizable wave function $\psi(x)$ is **real** at every $x$. What is $\langle p\rangle$?`,
      visual: curvePic({ fn: 'exp(-(x - 0.4)^2)*(1 + 0.6*x)', x: [-3, 3.5], y: [-0.4, 1.4], ylabel: 'ψ (real)', fill: false, caption: t`A real, lopsided wave function. Its shape is irrelevant to $\langle p\rangle$.` }),
      choices: ['Zero', 'Positive, since the steeper side is on the left', 'Purely imaginary', 'It depends on how lopsided ψ is'],
      answer: 0,
      why: {
        1: t`The slopes enter as $\int\psi\psi'dx = [\psi^2/2]$, which is zero at $\pm\infty$ whatever the shape.`,
        2: t`$-i\hbar\int\psi\psi'dx$ looks imaginary, but the integral itself is zero; an observable’s average is never imaginary.`,
        3: 'The shape drops out: ψψ′ integrates to its boundary values.',
      },
      hints: [t`$\psi\psi' = \tfrac12\tfrac{d}{dx}(\psi^2)$.`],
      teach: t`A real wave function has $\langle p\rangle = -i\hbar\big[\psi^2/2\big]_{-\infty}^{\infty} = 0$: no net motion.`,
      explain: t`$\langle p\rangle = -i\hbar\int\psi\psi'\,dx = -i\hbar\Big[\tfrac12\psi^2\Big]_{-\infty}^{\infty} = 0$. A real $\psi$ is an equal mix of left- and right-moving waves.`,
    }),
    num({
      id: 'kick-pc', difficulty: 2,
      gen(r) {
        const k = r.pick([2, 3, 5, 8, 12, 20]), s = r.pick([0.4, 0.6, 1]);
        const ans = HBARC_EVNM * k;
        return {
          prompt: t`An electron is prepared in $\psi(x) = (2\pi\sigma^2)^{-1/4}e^{-x^2/4\sigma^2}e^{i${k}x}$, with $x$ in nm and $\sigma = ${s}$ nm. Find $\langle p\rangle c$, in eV. ($\hbar c = ${fmt(HBARC_EVNM, 6)}$ eV nm.)`,
          visual: packet(k, s, t`The packet: its phase winds $${k}$ radians per nanometre under a fixed envelope.`),
          answer: ans, units: 'eV', tol: { rel: 0.005 },
          errors: [{ value: 2 * Math.PI * ans, feedback: t`You used $h$ in place of $\hbar$: $\langle p\rangle = \hbar k_0$, and $k_0 = ${k}\ \text{nm}^{-1}$ is already an angular wavenumber.` }, { value: ans / (2 * Math.PI), feedback: t`$k_0$ is in radians per nm: $\langle p\rangle = \hbar k_0$ with no extra $2\pi$.` }],
          hints: [t`$\langle p\rangle = \hbar k_0$ whatever the (real) envelope.`, t`$\langle p\rangle c = \hbar c\,k_0$.`],
          teach: t`A real envelope times $e^{ik_0x}$ has $\langle p\rangle = \hbar k_0$; the envelope sets only the spread.`,
          explain: t`$\langle p\rangle c = \hbar c\,k_0 = ${fmt(HBARC_EVNM, 5)}\times${k} = ${fmt(ans, 4)}$ eV. The width $\sigma$ does not enter.`,
        };
      },
    }),
    num({
      id: 'two-humps', difficulty: 2,
      gen(r) {
        const [w1, w2] = r.pick([[0.2, 0.8], [0.3, 0.7], [0.6, 0.4], [0.75, 0.25], [0.9, 0.1]]);
        const x1 = r.pick([-3, -2, -1]);
        let x2 = r.pick([2, 3, 4]);
        if (Math.abs(w1 * x1 + w2 * x2) < 0.05) x2 += 1;          // never a zero answer
        const ans = Math.round((w1 * x1 + w2 * x2) * 1e9) / 1e9;
        return {
          prompt: t`A particle’s wave function is $\psi = \sqrt{${w1}}\,\psi_1 + \sqrt{${w2}}\,\psi_2$, where $\psi_1$ and $\psi_2$ are normalized packets centred at $x_1 = ${x1}$ nm and $x_2 = ${x2}$ nm that do not overlap at all. Find $\langle x\rangle$, in nm.`,
          visual: curvePic({ fn: `${w1}*exp(-(x - ${x1})^2/0.18)/sqrt(0.18*pi) + ${w2}*exp(-(x - ${x2})^2/0.18)/sqrt(0.18*pi)`, x: [-5, 6], y: [0, 1.2], caption: t`$|\psi|^2$: two separate humps holding probabilities ${w1} and ${w2}.` }),
          answer: ans, units: 'nm', tol: { rel: 0, abs: 0.01 },
          errors: [
            { value: (x1 + x2) / 2, feedback: 'That is the plain midpoint; weight each centre by its probability.' },
            { value: Math.sqrt(w1) * x1 + Math.sqrt(w2) * x2, feedback: t`Weight with probabilities $|c_i|^2 = ${w1}, ${w2}$, not with the amplitudes.` },
          ].filter((e) => Math.abs(e.value - ans) > 0.05),
          hints: [t`With no overlap, $|\psi|^2 = ${w1}|\psi_1|^2 + ${w2}|\psi_2|^2$ (the cross term is zero everywhere).`, t`So $\langle x\rangle = ${w1}x_1 + ${w2}x_2$.`],
          teach: 'For non-overlapping pieces, ⟨x⟩ is the probability-weighted average of their centres.',
          explain: t`$\langle x\rangle = ${w1}(${x1}) + ${w2}(${x2}) = ${fmt(ans, 3)}$ nm — a place where the particle is essentially never found. An expectation value need not be a likely result.`,
        };
      },
    }),
    num({
      id: 'confine-T', difficulty: 2,
      gen(r) {
        const s = r.pick([0.05, 0.1, 0.2, 0.5]);
        const ans = HB2M_EVNM2 / (4 * s * s);
        return {
          prompt: t`An electron at rest on average sits in $\psi = (2\pi\sigma^2)^{-1/4}e^{-x^2/4\sigma^2}$ with $\sigma = ${s}$ nm. Find $\langle T\rangle = \langle p^2\rangle/2m$, in eV. ($\hbar^2/2m_e = ${fmt(HB2M_EVNM2, 5)}\ \text{eV nm}^2$; $\int\psi'^2dx = 1/4\sigma^2$.)`,
          visual: curvePic({ fn: `exp(-x^2/(2*${r6(s * s)}))/sqrt(2*pi*${r6(s * s)})`, x: [r6(-4 * s), r6(4 * s)], y: [0, r6(1.15 / Math.sqrt(2 * Math.PI * s * s))], caption: t`$|\psi|^2$, a Gaussian of standard deviation $${s}$ nm.` }),
          answer: ans, units: 'eV', tol: { rel: 0.005 },
          errors: [{ value: 4 * ans, feedback: t`$\int\psi'^2dx = \tfrac{1}{4\sigma^2}$: keep the 4.` }, { value: 2 * ans, feedback: t`$\langle T\rangle = \langle p^2\rangle/2m$: the $\tfrac12$ is in $\hbar^2/2m$ already.` }],
          hints: [t`$\langle p^2\rangle = \hbar^2\int|\psi'|^2dx$ (integrate $-\hbar^2\int\psi\psi''dx$ by parts).`, t`$\langle T\rangle = \dfrac{\hbar^2}{2m}\cdot\dfrac{1}{4\sigma^2}$.`],
          teach: t`Even with $\langle p\rangle = 0$, a confined particle has $\langle p^2\rangle > 0$: kinetic energy $\hbar^2/(8m\sigma^2)$ for a Gaussian.`,
          explain: t`$\langle T\rangle = \dfrac{${fmt(HB2M_EVNM2, 4)}}{4\times${s}^2} = ${fmt(ans, 3)}$ eV. Halve the width and it quadruples: confinement energy scales as $1/\sigma^2$.`,
        };
      },
    }),
    mcq({
      id: 'derivative-error', difficulty: 3, kind: 'error',
      prompt: t`A student writes, for any normalizable $\Psi$:

$$\langle p\rangle = \int\Psi^*\left(-i\hbar\frac{\partial}{\partial x}\right)\Psi\,dx = -i\hbar\int\frac{\partial}{\partial x}\big(\Psi^*\Psi\big)\,dx = -i\hbar\Big[|\Psi|^2\Big]_{-\infty}^{\infty} = 0,$$

and concludes that no particle ever has nonzero average momentum. Where is the mistake?`,
      visual: packet(4, 0.6, t`A packet with $k_0 = 4\ \text{nm}^{-1}$: it certainly moves, with $\langle p\rangle = 4\hbar\ \text{nm}^{-1}$.`),
      choices: [
        t`The derivative acts only on $\Psi$, not on $\Psi^*$: $\Psi^*\,\partial_x\Psi \ne \partial_x(\Psi^*\Psi)$`,
        t`The boundary term $[|\Psi|^2]$ is not zero at infinity`,
        t`The operator should be $+i\hbar\,\partial_x$`,
        'Nothing: average momentum really is always zero, and only individual results differ',
      ],
      answer: 0,
      why: {
        1: t`For a normalizable $\Psi$ it is zero; the step before is wrong.`,
        2: t`The sign is fixed so that $e^{ikx}$ has $p = +\hbar k$; flipping it would not rescue the argument.`,
        3: t`A kicked packet $\phi e^{ik_0x}$ has $\langle p\rangle = \hbar k_0 \ne 0$; its $\langle x\rangle$ moves.`,
      },
      hints: [t`Expand $\partial_x(\Psi^*\Psi)$ by the product rule. How many terms are there?`, t`$\partial_x(\Psi^*\Psi) = \Psi^*\partial_x\Psi + \Psi\,\partial_x\Psi^*$; only the first is in $\langle p\rangle$.`],
      teach: t`In $\int\Psi^*\hat p\Psi\,dx$ the operator acts on the $\Psi$ to its right only.`,
      explain: t`$\partial_x(\Psi^*\Psi) = \Psi^*\partial_x\Psi + \Psi\,\partial_x\Psi^*$: the student added a term that is not there. For real $\Psi$ the two terms are equal and the argument works — which is why real wave functions do have $\langle p\rangle = 0$.`,
    }),
    num({
      id: 'ehrenfest', difficulty: 2,
      gen(r) {
        const v = r.pick([0.2, 0.5, 1, 1.5, 3]);               // nm/fs
        const vSI = v * 1e6, ans = MEC2_EV * vSI / C;            // ⟨p⟩c in eV
        return {
          prompt: t`An electron packet’s average position moves steadily: $\langle x\rangle(t) = 2\ \text{nm} + (${v}\ \text{nm/fs})\,t$. What is $\langle p\rangle c$, in eV? ($m_ec^2 = ${fmt(MEC2_EV / 1e3, 6)}$ keV.)`,
          visual: { type: 'graph', params: { x: [0, 10], y: [0, r6(2 + 10 * v + 1)], aspect: 'wide', xlabel: 't (fs)', ylabel: '⟨x⟩ (nm)', curves: [{ fn: `2 + ${v}*x`, color: 'accent', width: 2.4 }] }, caption: t`The packet’s average position against time.` },
          answer: ans, units: 'eV', tol: { rel: 0.005 },
          errors: [{ value: ans * 1e-3, feedback: 'Convert nm/fs to m/s: 1 nm/fs is 10⁶ m/s.' }, { value: ans / 2, feedback: t`$\langle p\rangle = m\,d\langle x\rangle/dt$, with no factor ½.` }],
          hints: [t`$\langle p\rangle = m\,\dfrac{d\langle x\rangle}{dt}$, so $\langle p\rangle c = m c^2\,\dfrac{v}{c}$.`, t`$${v}$ nm/fs $= ${tex(vSI, 3)}$ m/s.`],
          teach: t`The expectation value of momentum is the mass times the velocity of $\langle x\rangle$.`,
          explain: t`$\langle p\rangle c = m_ec^2\,(v/c) = ${fmt(MEC2_EV / 1e3, 6)}\ \text{keV}\times\dfrac{${tex(vSI, 3)}}{${tex(C, 6)}} = ${fmt(ans, 4)}$ eV.`,
        };
      },
    }),
    code({
      id: 'p-two-ways', difficulty: 3,
      prompt: t`Compute $\langle p\rangle$ two ways, with $\hbar = 1$. \`p_operator(x, psi)\`: $\int\psi^*(-i\,\psi')\,dx$ with \`np.gradient\` and \`np.trapezoid\` (take the real part). \`p_fourier(x, psi)\`: transform with \`np.fft.fft\`, build the wavenumbers \`k = 2*np.pi*np.fft.fftfreq(len(x), d=x[1]-x[0])\`, and return $\sum k|\tilde\psi_k|^2 / \sum|\tilde\psi_k|^2$. They should agree.`,
      starter: t`import numpy as np

x = np.linspace(-30, 30, 4096, endpoint=False)

def p_operator(x, psi):
    pass

def p_fourier(x, psi):
    pass

psi = np.exp(-x**2 / 8) * np.exp(2.5j * x)
psi = psi / np.sqrt(np.trapezoid(np.abs(psi)**2, x))
print(p_operator(x, psi), p_fourier(x, psi))
`,
      answer: t`import numpy as np

x = np.linspace(-30, 30, 4096, endpoint=False)

def p_operator(x, psi):
    return np.real(np.trapezoid(np.conj(psi) * (-1j) * np.gradient(psi, x), x))

def p_fourier(x, psi):
    phi = np.fft.fft(psi)
    k = 2 * np.pi * np.fft.fftfreq(len(x), d=x[1] - x[0])
    w = np.abs(phi) ** 2
    return np.sum(k * w) / np.sum(w)

psi = np.exp(-x**2 / 8) * np.exp(2.5j * x)
psi = psi / np.sqrt(np.trapezoid(np.abs(psi)**2, x))
print(p_operator(x, psi), p_fourier(x, psi))`,
      tests: [
        { name: t`a Gaussian kicked by $e^{2.5ix}$: the operator gives 2.5`, code: 'abs(p_operator(x, psi) - 2.5) < 1e-3' },
        { name: 'the Fourier route gives 2.5 too', code: 'abs(p_fourier(x, psi) - 2.5) < 1e-6' },
        { name: 'a real, lopsided ψ has ⟨p⟩ = 0 both ways', code: 'abs(p_operator(x, np.exp(-(x-1)**2/2)*(1+0.3*x)/3)) < 1e-9 and abs(p_fourier(x, np.exp(-(x-1)**2/2)*(1+0.3*x))) < 1e-9' },
        { name: 'a sech packet moving left with k = −1.2 gives −1.2 both ways', code: 'abs(p_fourier(x, np.exp(-1.2j*x)/np.cosh(x)) + 1.2) < 1e-6 and abs(p_operator(x, np.exp(-1.2j*x)/np.cosh(x)/np.sqrt(np.trapezoid(1/np.cosh(x)**2, x))) + 1.2) < 1e-3' },
      ],
      hints: ['`np.gradient(psi, x)` differentiates the array; multiply by `-1j` and by `np.conj(psi)`, integrate with `np.trapezoid`.', t`In Fourier space each component $e^{ikx}$ has momentum $k$ exactly; weight each $k$ by $|\tilde\psi_k|^2$.`],
      teach: 'Momentum can be averaged in position space, with the derivative operator, or in momentum space, where each Fourier component carries a definite ħk.',
      explain: t`Both routes give $\hbar k_0$. The Fourier one is exact for the sampled function; the finite-difference derivative is off by about $10^{-4}$ here. The momentum-space wave function $\tilde\psi(k)$ will have its own lesson in the formalism module.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-total-T', difficulty: 2,
      gen(r) {
        const k = r.pick([3, 5, 8, 10]), s = r.pick([0.1, 0.2, 0.3]);
        const ans = HB2M_EVNM2 * (k * k + 1 / (4 * s * s));
        return {
          prompt: t`Find $\langle T\rangle$, in eV, for an electron in $\psi = (2\pi\sigma^2)^{-1/4}e^{-x^2/4\sigma^2}e^{i${k}x}$ ($x$ in nm, $\sigma = ${s}$ nm). ($\hbar^2/2m_e = ${fmt(HB2M_EVNM2, 5)}\ \text{eV nm}^2$.)`,
          visual: packet(k, s, t`The packet: $k_0 = ${k}\ \text{nm}^{-1}$, $\sigma = ${s}$ nm.`),
          answer: ans, units: 'eV', tol: { rel: 0.005 },
          errors: [
            { value: HB2M_EVNM2 * k * k, feedback: t`That is only the motion part, $\hbar^2k_0^2/2m$. Confinement adds $\hbar^2/(8m\sigma^2)$.` },
            { value: HB2M_EVNM2 / (4 * s * s), feedback: t`That is only the confinement part; the phase winding adds $\hbar^2k_0^2/2m$.` },
          ].filter((e) => Math.abs(e.value - ans) > 0.01 * ans),
          hints: [t`$\langle p^2\rangle = \hbar^2\left(k_0^2 + \tfrac{1}{4\sigma^2}\right)$.`],
          teach: 'Kinetic energy = motion part ħ²k₀²/2m + confinement part ħ²/(8mσ²) for a Gaussian packet.',
          explain: t`$\langle T\rangle = ${fmt(HB2M_EVNM2, 4)}\times\left(${k * k} + \tfrac{1}{4(${s})^2}\right) = ${fmt(ans, 3)}$ eV.`,
        };
      },
    }),
    mcq({
      id: 'cp-why-i', difficulty: 2,
      prompt: t`Why is the momentum operator $-i\hbar\,\partial/\partial x$ rather than simply $\hbar\,\partial/\partial x$?`,
      visual: packet(3, 0.7, t`For $e^{ik_0x}$ times an envelope, $-i\hbar\,\partial_x$ brings down $\hbar k_0$: real, and positive for a wave moving to $+x$.`),
      choices: [
        t`The $-i$ makes the operator Hermitian, so $\langle p\rangle$ is always real, and gives $e^{ikx}$ the momentum $+\hbar k$`,
        t`It makes $\langle p\rangle$ imaginary, as befits a quantity that cannot be measured directly`,
        'It is a convention with no consequences; ħ ∂/∂x would work as well',
        'The i converts the derivative into a velocity',
      ],
      answer: 0,
      why: {
        1: t`Momentum is measured all the time; its average must be real, and $\hbar\,\partial_x$ (anti-Hermitian) would give imaginary averages.`,
        2: t`With $\hbar\,\partial_x$, $\langle p\rangle$ for $e^{ik_0x}\phi$ would be $i\hbar k_0$ — not a measurable number.`,
        3: t`The time derivative, not the $i$, relates momentum to velocity: $\langle p\rangle = m\,d\langle x\rangle/dt$.`,
      },
      hints: [t`Apply both operators to $e^{ik_0x}$ and compare with de Broglie’s $p = \hbar k$.`],
      teach: t`$-i\hbar\,\partial_x$ is Hermitian (the $i$ undoes the minus sign from integrating by parts), so its averages are real, and it returns $\hbar k$ for $e^{ikx}$.`,
      explain: t`$d/dx$ alone is anti-Hermitian (M0.2); one factor of $i$ makes it Hermitian. The sign is fixed by de Broglie: $-i\hbar\,\partial_x e^{ikx} = \hbar k\,e^{ikx}$, positive for a wave moving to $+x$.`,
    }),
    num({
      id: 'cp-recoil', difficulty: 3, transfer: true,
      gen(r) {
        const atom = r.pick([{ name: 'rubidium-87', m: M_RB87, lam: RB_D2, line: '780.24' }, { name: 'caesium-133', m: M_CS133, lam: CS_D2, line: '852.35' }]);
        const n = r.pick([2, 4]);
        const k = (2 * Math.PI) / atom.lam, dv = (n * HBAR * k) / atom.m * 1e3;
        return {
          prompt: t`In an atom-interferometer gravimeter, a laser pulse is a beam splitter: it multiplies part of each ${atom.name} atom’s wave function by $e^{i${n}kx}$, with $k = 2\pi/\lambda$ and $\lambda = ${atom.line}$ nm (${n === 2 ? 'two photons, one absorbed and one emitted the other way' : 'four photon momenta, a second-order transition'}). By how much does that part’s $\langle p\rangle/m$ change, in mm/s? ($m = ${tex(atom.m, 6)}$ kg.) Ground-based instruments like this are sold today; space-borne versions for mapping Earth’s gravity are in development.`,
          visual: {
            type: 'graph',
            params: { x: [-2, 2], y: [-1.2, 1.2], aspect: 'wide', xlabel: 'x (arbitrary units)', ylabel: 'Re ψ', yticks: 0, xticks: 0, curves: [{ fn: 'exp(-x^2)', color: 'good', width: 1.4, dash: [5, 4] }, { fn: 'exp(-x^2)*cos(1.5*x)', color: 'ink3', width: 1.8, dash: [3, 3] }, { fn: 'exp(-x^2)*cos(7.5*x)', color: 'accent', width: 2.2 }], legend: [{ label: 'before the pulse', color: 'ink3', dash: [3, 3] }, { label: 'after: phase winds faster', color: 'accent' }], legendAt: 'tr' },
            caption: 'The kick changes the phase winding, not the envelope. Schematic: real kicks wind millions of times faster than drawn.',
          },
          answer: dv, units: 'mm/s', tol: { rel: 0.005 },
          errors: [{ value: dv / n, feedback: t`That is one photon’s kick. The factor $e^{i${n}kx}$ adds $${n}\hbar k$.` }, { value: dv * 2 * Math.PI, feedback: t`$\hbar k = h/\lambda$: you have an extra $2\pi$.` }],
          hints: [t`Multiplying by $e^{iKx}$ adds $\hbar K$ to $\langle p\rangle$, with $K = ${n}k$.`, t`$\Delta v = ${n}\hbar k/m = ${n}h/(m\lambda)$.`],
          teach: t`Multiplying a wave function by $e^{iKx}$ shifts its average momentum by $\hbar K$ — a photon kick is exactly that.`,
          explain: t`$\Delta v = \dfrac{${n}h}{m\lambda} = ${fmt(dv, 4)}$ mm/s. The two parts of each atom then drift apart at that speed, and gravity’s pull on both paths sets the phase the interferometer reads out.`,
        };
      },
    }),
  ],
  sources: [
    { label: 'Griffiths & Schroeter, Introduction to Quantum Mechanics, 3rd ed., §1.5', url: 'https://www.cambridge.org/9781316995433' },
    { label: 'Steck, “Rubidium 87 D Line Data” and “Cesium D Line Data”', url: 'https://steck.us/alkalidata/' },
    { label: 'CODATA 2022 recommended values (NIST)', url: 'https://physics.nist.gov/cuu/Constants/' },
  ],
});
