// The Schrödinger equation and Born’s rule (Griffiths & Schroeter §1.1–1.3).
// The wave function as the position-basis components of a ket,
// Ψ(x, t) = ⟨x|Ψ(t)⟩; the equation that evolves it, first order in time and
// linear; Born’s rule for a continuous variable; why Ψ must be complex; and
// interference from the cross term. phys2710.MP7.1 met |ψ|² at an
// introductory level; this lesson checks solutions, the dispersion relation
// and densities that 2710 did not use. Every number is computed here.
import { lesson, mcq, multi, num, expr } from '../../src/core/content.js';
import { fmt, tex } from '../../src/core/format.js';
import { HBAR, ME, MP, QE, HB2M_EVNM2, curvePic, r6 } from './_qm.js';

const t = String.raw;

/** A plane wave’s real and imaginary parts, x in nm. */
const plane = (k, caption, extra = {}) => ({
  type: 'graph',
  params: {
    x: [0, r6(4 * Math.PI / k)], y: [-1.35, 1.35], aspect: 'wide', xlabel: 'x (nm)', ylabel: 'Ψ (arbitrary units)', yticks: 4,
    curves: [{ fn: `cos(${k}*x)`, color: 'accent', width: 2.4, label: 'Re Ψ', labelAt: r6(0.1 / k), labelDy: -12 }, { fn: `sin(${k}*x)`, color: 'warn', width: 2.2, dash: [6, 4], label: 'Im Ψ', labelAt: r6(1.7 / k), labelDy: -10 }, { fn: '1', color: 'good', width: 1.6, label: '|Ψ|', labelAt: r6(2.6 / k), labelDy: -10 }],
    ...extra,
  },
  caption,
});

export default lesson({
  id: 'phys4700.M2.1',
  title: 'The Schrödinger equation and Born’s rule',
  minutes: 14, difficulty: 3,
  intro: t`For a spin, a state had two components. For a particle moving along a line it has one component for **every position** $x$: the amplitude to be found there, $\Psi(x, t) = \langle x|\Psi(t)\rangle$ — the **wave function**. It changes in time by the Schrödinger equation,

$$i\hbar\,\frac{\partial\Psi}{\partial t} = -\frac{\hbar^2}{2m}\,\frac{\partial^2\Psi}{\partial x^2} + V(x)\,\Psi$$

and **Born’s rule** turns it into probabilities, exactly as $|\langle a|\psi\rangle|^2$ did for spin: $|\Psi(x, t)|^2\,dx$ is the probability that a position measurement finds the particle between $x$ and $x + dx$. Two features shape everything that follows. The equation is **first order in time**, so $\Psi$ at one instant fixes it forever after. And it is **linear**, so solutions superpose — and since $|\Psi_1 + \Psi_2|^2 \ne |\Psi_1|^2 + |\Psi_2|^2$, superposed waves interfere. ([The wave function and probability](#/lesson/phys2710.MP7.1) met $|\psi|^2$ first.)`,
  symbols: [
    { tex: '\\Psi(x, t)', text: t`the wave function: a complex number at each $x$ and $t$; in one dimension its units are $\text{m}^{-1/2}$` },
    { tex: 'i', text: t`the imaginary unit, $i^2 = -1$: it makes the solutions oscillate rather than decay` },
    { tex: '\\hbar', text: t`the reduced Planck constant, $${tex(HBAR, 4)}$ J s` },
    { tex: 'm', text: 'the particle’s mass, in kg' },
    { tex: 'V(x)', text: t`the potential energy at position $x$, in J (or eV); it does the job a force does in Newton’s law` },
    { tex: '|\\Psi|^2\\,dx', text: t`the probability of finding the particle in $[x, x + dx]$; $|\Psi|^2$ itself is a density, in $\text{m}^{-1}$` },
  ],
  why: 'This is the equation of motion of non-relativistic quantum mechanics: atoms, molecules, semiconductors and every lesson that follows solve it for some V(x).',
  visual: {
    type: 'mp-schrodinger',
    title: 'Two solutions, added',
    lead: t`An electron in a harmonic well, in an equal mix of its two lowest stationary states. Each alone has an unchanging $|\Psi|^2$; added, their cross term makes $|\Psi|^2$ slosh from side to side. Nothing but the Schrödinger equation drives it.`,
    tasks: [
      'Watch a full period: it is h/(E₁ − E₀) = 2π/ω, 8.3 fs at ħω = 0.5 eV.',
      'Halve ħω: the well widens, the levels close up and the sloshing slows.',
      'Raise the mass: a heavier particle in the same ħω sits in a narrower well.',
    ],
    params: { mode: 'bound', well: 'harmonic', hw: 0.5, n: 0, super: [0, 1], show: 'prob', controls: ['hw', 'mass'] },
  },
  example: {
    prompt: t`Show that $\Psi(x, t) = A\,x\,e^{-\alpha x^2/2}\,e^{-3i\omega t/2}$, with $\alpha = m\omega/\hbar$, solves the Schrödinger equation for the oscillator potential $V = \tfrac12 m\omega^2x^2$. Then say how $|\Psi|^2$ depends on time, and find the probability that the particle is found at $x > 0$.`,
    visual: curvePic({ fn: 'x^2*exp(-x^2)', x: [-3, 3], y: [0, 0.45], xlabel: 'x √α', ylabel: '|Ψ|² (arbitrary units)', shade: [0, 3], caption: t`$|\Psi|^2 \propto x^2e^{-\alpha x^2}$, with the region $x > 0$ shaded. It is the same at every time.` }),
    steps: [
      { label: 'Time side', text: t`$i\hbar\,\partial_t\Psi = i\hbar\left(-\tfrac{3i\omega}{2}\right)\Psi = \tfrac32\hbar\omega\,\Psi$.` },
      { label: 'Two x-derivatives', text: t`With $\psi = x e^{-\alpha x^2/2}$: $\psi' = (1 - \alpha x^2)e^{-\alpha x^2/2}$ and $\psi'' = (\alpha^2x^3 - 3\alpha x)e^{-\alpha x^2/2}$.` },
      { label: 'Space side', text: t`$-\tfrac{\hbar^2}{2m}\psi'' + \tfrac12m\omega^2x^2\psi = \left[-\tfrac{\hbar^2\alpha^2}{2m}x^3 + \tfrac{3\hbar^2\alpha}{2m}x + \tfrac12m\omega^2x^3\right]e^{-\alpha x^2/2}$. Since $\hbar^2\alpha^2/m = m\omega^2$, the $x^3$ terms cancel, leaving $\tfrac32\hbar\omega\,\psi$.` },
      { label: 'Match', text: t`Both sides equal $\tfrac32\hbar\omega\,\Psi$: it is a solution, a stationary state of energy $\tfrac32\hbar\omega$ (the oscillator’s first excited state, coming in M3).` },
      { label: 'Born’s rule', text: t`$|\Psi|^2 = |A|^2x^2e^{-\alpha x^2}\,|e^{-3i\omega t/2}|^2 = |A|^2x^2e^{-\alpha x^2}$: the phase turns, but the density never changes. It is even in $x$, so $P(x > 0) = \tfrac12$.` },
      { label: 'Sense check', text: t`Units: $\hbar\omega$ is an energy and $\alpha$ has units of $\text{m}^{-2}$, so $\alpha x^2$ is a pure number, as an exponent must be.` },
    ],
    answer: t`It solves the equation with $i\hbar\,\partial_t\Psi = \tfrac32\hbar\omega\Psi$; $|\Psi|^2$ is independent of time, and $P(x > 0) = \tfrac12$.`,
  },
  practice: [
    mcq({
      id: 'units-psi', difficulty: 1,
      prompt: t`In one dimension, $\int|\Psi|^2\,dx = 1$. What are the SI units of $\Psi$ itself?`,
      visual: curvePic({ fn: '0.8*exp(-x^2/0.5)', x: [-2, 2], y: [0, 1], caption: t`A probability density: its area, $\int|\Psi|^2dx$, is a pure number, 1.` }),
      choices: [t`$\text{m}^{-1/2}$`, 'none: it is a pure number', t`$\text{m}^{-1}$`, t`$\text{m}^{1/2}$`],
      answer: 0,
      why: {
        1: t`$|\Psi|^2dx$ must be a pure number, and $dx$ carries metres, so $|\Psi|^2$ carries $\text{m}^{-1}$.`,
        2: t`That is the unit of $|\Psi|^2$, the density. $\Psi$ is its square root.`,
        3: 'The power has the right size but the wrong sign: Ψ grows when the region shrinks.',
      },
      hints: [t`$|\Psi|^2\,dx$ is a probability, a pure number.`],
      teach: t`In one dimension $|\Psi|^2$ is a probability per metre, so $\Psi$ has units of $\text{m}^{-1/2}$.`,
      explain: t`$[|\Psi|^2][dx] = 1$ gives $[|\Psi|^2] = \text{m}^{-1}$, so $[\Psi] = \text{m}^{-1/2}$. In three dimensions it would be $\text{m}^{-3/2}$.`,
    }),
    num({
      id: 'dispersion', difficulty: 2,
      gen(r) {
        const k = r.pick([2, 4, 5, 8, 10, 15]);
        const E = HB2M_EVNM2 * k * k;
        return {
          prompt: t`A free electron ($V = 0$) is in the plane wave $\Psi = A\,e^{i(kx - \omega t)}$ with $k = ${k}\ \text{nm}^{-1}$. Substituting into the Schrödinger equation fixes $\omega$. What is $\hbar\omega$, in eV? ($\hbar^2/2m_e = ${fmt(HB2M_EVNM2, 5)}\ \text{eV nm}^2$.)`,
          visual: plane(k, t`$\Psi$ at $t = 0$ for $k = ${k}\ \text{nm}^{-1}$: its real part, imaginary part and constant modulus.`),
          answer: E, units: 'eV', tol: { rel: 0.01 },
          errors: [{ value: 2 * E, feedback: t`Keep the 2 in $2m$: $\hbar\omega = \hbar^2k^2/2m$.` }, { value: Math.sqrt(HB2M_EVNM2) * k, feedback: t`The energy goes as $k^2$, not $k$: $\partial_x^2$ brings down $(ik)^2$.` }],
          hints: [t`$\partial_t$ brings down $-i\omega$ and $\partial_x^2$ brings down $(ik)^2 = -k^2$.`, t`$i\hbar(-i\omega) = -\tfrac{\hbar^2}{2m}(-k^2)$, so $\hbar\omega = \tfrac{\hbar^2k^2}{2m}$.`],
          teach: t`A free plane wave solves the Schrödinger equation only if $\hbar\omega = \hbar^2k^2/2m$: the energy is the kinetic energy of momentum $\hbar k$.`,
          explain: t`$\hbar\omega = \tfrac{\hbar^2k^2}{2m} = ${fmt(HB2M_EVNM2, 4)}\times${k}^2 = ${fmt(E, 3)}$ eV: the kinetic energy $p^2/2m$ with $p = \hbar k$.`,
        };
      },
    }),
    mcq({
      id: 'real-solution', difficulty: 3,
      prompt: t`Which of these solves the free Schrödinger equation ($V = 0$), for $k > 0$?`,
      visual: plane(3, t`Re and Im of $e^{ikx}$ at one instant ($k = 3\ \text{nm}^{-1}$): both are needed to make a modulus that is the same everywhere.`),
      choices: [t`$e^{i(kx - \omega t)}$ with $\omega = \hbar k^2/2m$`, t`$\cos(kx - \omega t)$ with $\omega = \hbar k^2/2m$`, t`$e^{i(kx + \omega t)}$ with $\omega = \hbar k^2/2m$`, t`$e^{i(kx - \omega t)}$ with $\omega = \hbar k/m$`],
      answer: 0,
      why: {
        1: t`$\partial_t\cos$ gives a sine, $\partial_x^2\cos$ a cosine: the two sides cannot match at every $x$ and $t$. With only one time derivative and an $i$, the equation has no real travelling-wave solution.`,
        2: t`Then $i\hbar\,\partial_t$ gives $-\hbar\omega$, a negative energy, while the kinetic side is positive: no match.`,
        3: t`That is $\omega = vk$, the dispersion of a wave on a string or light. Substitution gives $\hbar\omega = \hbar^2k^2/2m$, quadratic in $k$.`,
      },
      hints: ['Substitute each into iħ ∂Ψ/∂t = −(ħ²/2m) ∂²Ψ/∂x² and compare the two sides.', t`Derivatives of $e^{i\theta}$ return $e^{i\theta}$; derivatives of $\cos\theta$ alternate between sine and cosine.`],
      teach: t`The Schrödinger equation has one time derivative and an $i$: its travelling waves are complex, $e^{i(kx - \omega t)}$, with $\omega$ quadratic in $k$.`,
      explain: t`$e^{i(kx - \omega t)}$ gives $\hbar\omega$ on the left and $\hbar^2k^2/2m$ on the right. A real wave fails: a first time derivative turns cosines into sines. That is one reason quantum amplitudes are complex — the spin lesson gave the other.`,
    }),
    num({
      id: 'lorentz-window', difficulty: 2,
      gen(r) {
        const a = r.pick([0.2, 0.5, 1]), m = r.pick([0.5, 1, 2, 3]), b = r6(m * a);
        const ans = (2 / Math.PI) * Math.atan(m);
        return {
          prompt: t`A particle’s probability density is $|\psi(x)|^2 = \dfrac{a/\pi}{x^2 + a^2}$ with $a = ${a}$ nm. What is the probability that a position measurement finds it within $${b}$ nm of the origin?`,
          visual: curvePic({ fn: `${a}/pi/(x^2 + ${r6(a * a)})`, x: [r6(-5 * a), r6(5 * a)], y: [0, r6(1.15 / (Math.PI * a))], shade: [-b, b], caption: t`The density, with the window $|x| < ${b}$ nm shaded. Its tails fall only as $1/x^2$.` }),
          answer: ans, tol: { rel: 0.005, abs: 1e-3 },
          integrand: `${a}/pi/(x^2 + ${r6(a * a)})`, limits: [-b, b], vars: { x: [-1, 1] },
          errors: [{ value: ans / 2, feedback: t`That covers only $0 < x < ${b}$; the window runs from $-${b}$ to $${b}$ nm.` }, { value: 2 * m / Math.PI, feedback: t`Integrate the density rather than multiplying its peak by the width: $\int\frac{dx}{x^2 + a^2} = \frac1a\arctan\frac{x}{a}$.` }].filter((e) => Math.abs(e.value - ans) > 0.01),
          hints: [t`$\displaystyle\int\frac{dx}{x^2 + a^2} = \frac{1}{a}\arctan\frac{x}{a}$.`, t`$P = \frac{2}{\pi}\arctan\frac{${b}}{${a}}$.`],
          teach: t`A probability is the integral of the density over the region: $P(a < x < b) = \int_a^b|\psi|^2dx$.`,
          explain: t`$P = \dfrac{a}{\pi}\cdot\dfrac{2}{a}\arctan\dfrac{${b}}{${a}} = \dfrac{2}{\pi}\arctan ${m} = ${fmt(ans, 3)}$. The long tails hold a lot: even $|x| < 3a$ catches only $${fmt((2 / Math.PI) * Math.atan(3), 3)}$.`,
        };
      },
    }),
    mcq({
      id: 'cross-term', difficulty: 2,
      prompt: t`$\psi_1 = g(x)\,e^{ikx}$ and $\psi_2 = g(x)\,e^{-ikx}$ are two waves with the same envelope $g$, moving in opposite directions. For $\Psi = (\psi_1 + \psi_2)/\sqrt2$, what is $|\Psi|^2$?`,
      visual: curvePic({ fn: '2*exp(-x^2/2)*cos(4*x)^2', x: [-3.2, 3.2], y: [0, 2.2], xlabel: 'x (arbitrary units)', ylabel: '|Ψ|²', curves: [{ fn: 'exp(-x^2/2)', color: 'ink3', width: 2, dash: [6, 4] }], caption: t`Solid: $|\Psi|^2$ for $g = e^{-x^2/4}$ and $k = 4$. Dashed: $\tfrac12(|\psi_1|^2 + |\psi_2|^2)$, what adding probabilities would give.` }),
      choices: [t`$2g^2\cos^2 kx$: fringes, from the cross term`, t`$g^2$: the average of $|\psi_1|^2$ and $|\psi_2|^2$`, t`$0$, since the two waves cancel`, t`$2g^2$: the two densities add`],
      answer: 0,
      why: {
        1: t`That drops the cross term $\operatorname{Re}(\psi_1^*\psi_2)$. Densities add like that only when the two waves do not overlap.`,
        2: t`They cancel only where $\cos kx = 0$; elsewhere they reinforce.`,
        3: t`At the bright fringes $|\Psi|^2$ does reach $2g^2$, but between them it falls to zero.`,
      },
      hints: [t`$|\psi_1 + \psi_2|^2 = |\psi_1|^2 + |\psi_2|^2 + 2\operatorname{Re}(\psi_1^*\psi_2)$.`, t`$e^{ikx} + e^{-ikx} = 2\cos kx$.`],
      teach: 'Born’s rule squares the sum of amplitudes, so overlapping waves interfere; probabilities do not simply add.',
      explain: t`$\Psi = \tfrac{g}{\sqrt2}(e^{ikx} + e^{-ikx}) = \sqrt2\,g\cos kx$, so $|\Psi|^2 = 2g^2\cos^2kx$: fringes $\pi/k$ apart under the envelope, averaging to $g^2$. The same cross term made the spin loop of M1.1 give zero.`,
    }),
    multi({
      id: 'superpose', difficulty: 2,
      prompt: t`$\Psi_1(x, t)$ and $\Psi_2(x, t)$ both solve the Schrödinger equation with the same $V(x)$. Which of these must also solve it? Select all that apply.`,
      choices: [t`$\Psi_1 + \Psi_2$`, t`$3i\,\Psi_1$`, t`$\Psi_1\Psi_2$`, t`$\Psi_1^{*}$`, t`$\Psi_1 - 2\Psi_2$`],
      answer: [0, 1, 4],
      why: {
        2: t`A product brings in cross terms like $2\partial_x\Psi_1\partial_x\Psi_2$; the equation is linear, not multiplicative.`,
        3: t`Conjugating flips the sign of $i$: $\Psi_1^*$ solves the equation with $-i\hbar\,\partial_t$, that is, run backwards in time.`,
      },
      hints: ['The equation is linear: every term has exactly one Ψ in it.', t`Take the complex conjugate of the whole equation and see what happens to $i$.`],
      teach: 'Linearity means any combination c₁Ψ₁ + c₂Ψ₂ of solutions, with complex constants, is a solution: superposition.',
      explain: t`Every term is linear in $\Psi$, so constant multiples and sums of solutions are solutions. A product is not, and $\Psi^*(x, t)$ solves the time-reversed equation; $\Psi^*(x, -t)$ is a solution when $V$ is real.`,
    }),
    expr({
      id: 'constant-v', difficulty: 2,
      prompt: t`In a region of constant potential $V_0$, try $\Psi = A\,e^{i(kx - \omega t)}$. What must $\omega$ be, in terms of $\hbar$, $k$, $m$ and $V_0$?`,
      visual: {
        type: 'graph',
        params: { x: [0, 6], y: [-1.4, 2.6], aspect: 'wide', xlabel: 'x', ylabel: '', yticks: 0, xticks: 0, curves: [{ fn: '2', color: 'violet', width: 2.4, label: 'V = V₀', labelAt: 0.2, labelDy: -10 }, { fn: 'cos(3*x)', color: 'accent', width: 2.2, label: 'Re Ψ', labelAt: 4.4, labelDy: -12 }] },
        caption: 'A flat potential and the real part of a plane wave in it. Schematic.',
      },
      answer: 'hbar*k^2/(2*m) + V_0/hbar', answerTeX: t`\frac{\hbar k^2}{2m} + \frac{V_0}{\hbar}`,
      vars: { hbar: [0.5, 2], k: [0.5, 3], m: [0.5, 3], V_0: [0.2, 3] }, keys: [['ħ', 'hbar']], lhs: '\\omega',
      errors: [{ answer: 'hbar*k^2/(2*m)', feedback: t`The potential term $V_0\Psi$ adds to the right-hand side: it shifts $\hbar\omega$ by $V_0$.` }, { answer: 'hbar*k^2/(2*m) + V_0', feedback: t`Divide the whole energy by $\hbar$: $\omega = E/\hbar$, so the potential contributes $V_0/\hbar$.` }],
      hints: [t`$i\hbar\,\partial_t\Psi = \hbar\omega\Psi$ and $-\tfrac{\hbar^2}{2m}\partial_x^2\Psi = \tfrac{\hbar^2k^2}{2m}\Psi$.`, t`So $\hbar\omega = \tfrac{\hbar^2k^2}{2m} + V_0$.`],
      teach: t`A constant potential adds $V_0$ to $\hbar\omega$: the total energy is kinetic plus potential.`,
      explain: t`$\hbar\omega = \tfrac{\hbar^2k^2}{2m} + V_0$, so $\omega = \tfrac{\hbar k^2}{2m} + \tfrac{V_0}{\hbar}$. A constant $V_0$ only multiplies $\Psi$ by the phase $e^{-iV_0t/\hbar}$, which no probability can see.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-sech', difficulty: 2,
      gen(r) {
        const a = r.pick([0.1, 0.25, 0.5, 2]), m = r.pick([0.5, 1, 1.5, 2]), b = r6(m * a);
        const ans = Math.tanh(m);
        return {
          prompt: t`A particle bound to a thin layer has $|\psi(x)|^2 = \dfrac{1}{2a}\,\operatorname{sech}^2\dfrac{x}{a}$ with $a = ${a}$ nm. What is the probability of finding it with $|x| < ${b}$ nm?`,
          visual: curvePic({ fn: `1/(2*${a})/cosh(x/${a})^2`, x: [r6(-4 * a), r6(4 * a)], y: [0, r6(0.6 / a)], shade: [-b, b], caption: t`The density, with the window shaded.` }),
          answer: ans, tol: { rel: 0.005, abs: 1e-3 },
          integrand: `1/(2*${a})/cosh(x/${a})^2`, limits: [-b, b], vars: { x: [-1, 1] },
          errors: [{ value: ans / 2, feedback: 'The window is symmetric: include −b < x < 0 as well.' }].filter((e) => Math.abs(e.value - ans) > 0.01),
          hints: [t`$\int\operatorname{sech}^2u\,du = \tanh u$.`],
          teach: 'Integrate the density over the window.',
          explain: t`$P = \dfrac{1}{2a}\Big[a\tanh\dfrac{x}{a}\Big]_{-${b}}^{${b}} = \tanh ${m} = ${fmt(ans, 3)}$.`,
        };
      },
    }),
    mcq({
      id: 'cp-first-order', difficulty: 2,
      prompt: t`What must you know at $t = 0$ to predict $\Psi(x, t)$ at every later time, given $V(x)$?`,
      visual: plane(2, t`A wave function at one instant: both its real and imaginary parts, that is, its size and its phase at every $x$.`),
      choices: [t`$\Psi(x, 0)$ alone`, t`$\Psi(x, 0)$ and $\partial\Psi/\partial t$ at $t = 0$, as for a wave on a string`, t`$|\Psi(x, 0)|^2$ alone`, t`$\Psi(x, 0)$ and the particle’s actual position`],
      answer: 0,
      why: {
        1: t`The string’s wave equation is second order in time and needs two starting functions. The Schrödinger equation is first order: it *gives* $\partial_t\Psi$ from $\Psi$.`,
        2: t`The phase matters for the future: $e^{ikx}$ and $e^{-ikx}$ have the same $|\Psi|^2$ but move in opposite directions.`,
        3: 'Quantum mechanics assigns no position beyond what Ψ says; Ψ is the whole state.',
      },
      hints: ['How many time derivatives does the equation contain?'],
      teach: 'The Schrödinger equation is first order in time: the wave function now, phases included, determines it at all later times.',
      explain: t`The equation gives $\partial_t\Psi$ directly from $\Psi$ and $V$, so $\Psi(x, 0)$ — size and phase — determines everything. The evolution is deterministic; only measurement outcomes are random.`,
    }),
    num({
      id: 'cp-solar-wind', difficulty: 3, transfer: true,
      gen(r) {
        const v = r.pick([300, 400, 500, 750]);
        const k = MP * v * 1e3 / HBAR, w = HBAR * k * k / (2 * MP), vp = w / k / 1e3;
        return {
          prompt: t`A solar-wind proton crosses the inner Solar System at ${v} km/s (non-relativistic). Treat it as a plane wave $e^{i(kx - \omega t)}$ with $p = \hbar k = mv$, obeying the free Schrödinger equation. How fast do its wave crests move — the **phase velocity** $\omega/k$ — in km/s?`,
          visual: { type: 'mp-packet', params: { view: 'build', disp: 'free', play: false, controls: false, dispersion: false, t: 2, readout: false }, caption: 'A free packet in dimensionless units: the violet dot rides a crest, the gold one the envelope. Which is faster is the question.' },
          answer: vp, units: 'km/s', tol: { rel: 0.005 },
          errors: [{ value: v, feedback: t`That is the particle’s speed, the group velocity $d\omega/dk$. The crests move at $\omega/k = \hbar k/2m$.` }, { value: 2 * v, feedback: t`Check the dispersion: $\omega = \hbar k^2/2m$, so $\omega/k = \hbar k/2m = v/2$.` }],
          hints: [t`From the Schrödinger equation, $\omega = \hbar k^2/2m$.`, t`$\omega/k = \hbar k/2m = mv/2m$.`],
          teach: t`For a free Schrödinger wave $\omega = \hbar k^2/2m$, so the crests move at $v/2$ while the packet, and the particle, move at $v$.`,
          explain: t`$\omega/k = \hbar k/2m = v/2 = ${fmt(vp, 3)}$ km/s, half the proton’s speed. Its $k = ${tex(k, 3)}\ \text{m}^{-1}$ (wavelength $${tex(2 * Math.PI / k * 1e12, 3)}$ pm) and $\omega = ${tex(w, 3)}$ rad/s. The phase velocity has no direct physical meaning — a constant added to $V$ would change it — but the group velocity $d\omega/dk = v$ is the proton’s.`,
        };
      },
    }),
  ],
  sources: [
    { label: 'Griffiths & Schroeter, Introduction to Quantum Mechanics, 3rd ed., §1.1–1.3', url: 'https://www.cambridge.org/9781316995433' },
    { label: 'CODATA 2022 recommended values (NIST)', url: 'https://physics.nist.gov/cuu/Constants/' },
  ],
});
